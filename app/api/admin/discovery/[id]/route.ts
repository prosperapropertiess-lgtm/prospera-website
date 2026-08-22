import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const ALLOWED_FIELDS = [
  "landlord_name", "landlord_email", "landlord_phone", "num_properties_owned",
  "property_address", "property_city", "property_type", "bedrooms", "bathrooms",
  "occupancy_status", "approx_monthly_rent", "property_condition", "condition_notes",
  "reason_for_call", "service_type", "involvement_level", "timeline",
];

// PATCH /api/admin/discovery/[id] — autosave call answers as the call happens
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const field of ALLOWED_FIELDS) {
    if (field in body) patch[field] = body[field];
  }

  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("discovery_calls")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ call: data });
}

// GET /api/admin/discovery/[id] — load a call
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("discovery_calls").select("*").eq("id", id).single();
  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ call: data });
}

// DELETE /api/admin/discovery/[id] — remove a call record
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const db = getSupabaseAdmin();
  const { error } = await db.from("discovery_calls").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
