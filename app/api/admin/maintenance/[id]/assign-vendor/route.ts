import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { generateVendorToken, logWorkOrderEvent } from "@/lib/maintenance-data";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { vendorId } = body as { vendorId?: string };
  if (!vendorId) return NextResponse.json({ error: "vendorId is required" }, { status: 400 });

  const db = getSupabaseAdmin();

  const { data: vendor, error: vendorErr } = await db.from("vendors").select("id, name").eq("id", vendorId).single();
  if (vendorErr || !vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

  const { data: current, error: loadErr } = await db
    .from("tenant_maintenance_requests")
    .select("id, status, vendor_token")
    .eq("id", id)
    .single();
  if (loadErr || !current) return NextResponse.json({ error: "Request not found" }, { status: 404 });

  const token = current.vendor_token ?? generateVendorToken();

  const { data: updated, error } = await db
    .from("tenant_maintenance_requests")
    .update({
      vendor_id: vendorId,
      vendor_token: token,
      status: "vendor_assigned",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*, vendors(id, name, trade, phone)")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logWorkOrderEvent(id, "VENDOR_ASSIGNED", "Admin", { from: current.status, vendorName: vendor.name });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.prosperaproperties.co";
  return NextResponse.json({ request: updated, vendorPortalUrl: `${baseUrl}/vendor/${token}` });
}
