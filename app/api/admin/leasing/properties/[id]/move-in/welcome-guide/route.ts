/**
 * The welcome guide is keyed by property_id, not by move-in session — it's
 * meant to be filled in once and reused across every future tenancy at
 * that address, per the spec ("Save property information for future
 * inspections... reusing the property's room layout and house
 * instructions"). internal_notes is a separate field so it can never
 * accidentally end up in a tenant-facing PDF/email.
 */
import { NextRequest, NextResponse } from "next/server";
import { isLeasingOrAdminAuthenticated } from "@/lib/leasing-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const ALLOWED = [
  "garbage_instructions", "parking_details", "mailbox_details", "utility_info",
  "appliance_instructions", "maintenance_contact", "emergency_contact",
  "other_notes", "internal_notes", "attachments",
];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await params;
  const body = await req.json();
  const { propertyId, ...fields } = body;
  if (!propertyId) return NextResponse.json({ error: "propertyId required" }, { status: 400 });

  const patch: Record<string, unknown> = { property_id: propertyId, updated_at: new Date().toISOString() };
  for (const k of ALLOWED) if (k in fields) patch[k] = fields[k];

  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("property_welcome_guides")
    .upsert(patch, { onConflict: "property_id" })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
