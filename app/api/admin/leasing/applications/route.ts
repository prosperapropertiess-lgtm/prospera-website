/**
 * GET /api/admin/leasing/applications — every tenant-verification application
 * across all leasing campaigns, for the top-level Tenant Verification view.
 * (Per-campaign detail still lives at /api/admin/leasing/properties/[id]/applications.)
 */
import { NextRequest, NextResponse } from "next/server";
import { isLeasingOrAdminAuthenticated } from "@/lib/leasing-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("leasing_applications")
    .select(`
      *,
      campaign:leasing_properties(id, owner_name, owner_email, property:properties(title, address, city))
    `)
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
