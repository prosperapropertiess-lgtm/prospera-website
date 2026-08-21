import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { fetchAllProperties, fetchAllTenants } from "@/lib/notion";

export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getSupabaseAdmin();
  const status = req.nextUrl.searchParams.get("status");

  let query = db
    .from("tenant_maintenance_requests")
    .select("*, vendors(id, name, trade, phone)")
    .order("created_at", { ascending: false });
  if (status && status !== "all") query = query.eq("status", status);

  const [{ data: requests, error }, properties, tenants] = await Promise.all([
    query,
    fetchAllProperties().catch(() => []),
    fetchAllTenants().catch(() => []),
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const propertyMap = new Map(properties.map((p) => [p.id, p]));
  const tenantMap = new Map(tenants.map((t) => [t.id, t]));

  const enriched = (requests ?? []).map((r) => {
    const property = propertyMap.get(r.property_id);
    const tenant = tenantMap.get(r.tenant_id);
    return {
      ...r,
      property_address: property?.address ?? "Unknown property",
      tenant_name: tenant?.name ?? "Unknown tenant",
      tenant_phone: tenant?.phone ?? null,
    };
  });

  return NextResponse.json({ requests: enriched });
}
