/**
 * Start a move-in with no pre-existing leasing campaign — for placement-
 * only jobs where nothing's been through the marketing/showing/application
 * pipeline yet. Creates a minimal properties + leasing_properties +
 * leasing_applications row behind the scenes so every downstream route
 * (finish/send, the dashboard, the campaign page itself) keeps working
 * unchanged — this isn't a second data model, just a shortcut into the
 * same one.
 */
import { NextRequest, NextResponse } from "next/server";
import { isLeasingOrAdminAuthenticated } from "@/lib/leasing-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

interface TenantInput { name: string; email: string }

export async function POST(req: NextRequest) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { propertyAddress, unitNumber, city, ownerName, ownerEmail, tenants, moveInDate, inspectorName } = body as {
    propertyAddress: string; unitNumber?: string; city?: string; ownerName?: string; ownerEmail?: string;
    tenants: TenantInput[]; moveInDate?: string; inspectorName?: string;
  };
  if (!propertyAddress?.trim()) return NextResponse.json({ error: "Property address is required" }, { status: 400 });
  const validTenants = (tenants ?? []).filter((t) => t.name?.trim());
  if (validTenants.length === 0) return NextResponse.json({ error: "At least one tenant name is required" }, { status: 400 });

  const db = getSupabaseAdmin();

  const { data: property, error: propErr } = await db
    .from("properties")
    .insert({
      address: propertyAddress.trim(),
      title: unitNumber?.trim() ? `${propertyAddress.trim()} — ${unitNumber.trim()}` : propertyAddress.trim(),
      city: city?.trim() || null,
      status: "archived", // not a public listing — properties.status is draft/published/archived
      available: false,
    })
    .select("id")
    .single();
  if (propErr) return NextResponse.json({ error: `Property creation failed: ${propErr.message}` }, { status: 500 });

  const { data: campaign, error: campaignErr } = await db
    .from("leasing_properties")
    .insert({
      property_id: property.id,
      status: "leased", // leasing_properties.status is a fixed enum — 'leased' is the closest fit for a tenant already placed
      stage: "MOVE_IN",
      owner_name: ownerName?.trim() || null,
      owner_email: ownerEmail?.trim() || null,
      campaign_name: `${propertyAddress.trim()}${unitNumber?.trim() ? ` (${unitNumber.trim()})` : ""}`,
      stage_move_in_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (campaignErr) return NextResponse.json({ error: `Campaign creation failed: ${campaignErr.message}` }, { status: 500 });

  const [primary, ...co] = validTenants;
  const { data: application, error: appErr } = await db
    .from("leasing_applications")
    .insert({
      campaign_id: campaign.id,
      token: crypto.randomUUID(),
      stage: "APPROVED",
      decision: "APPROVED",
      decision_at: new Date().toISOString(),
      legal_name: primary.name.trim(),
      email: primary.email?.trim() || null,
      co_tenants: co.map((t) => ({ name: t.name.trim(), email: t.email?.trim() || null })),
    })
    .select("id")
    .single();
  if (appErr) return NextResponse.json({ error: `Tenant record failed: ${appErr.message}` }, { status: 500 });

  const { data: session, error: sessionErr } = await db
    .from("move_in_sessions")
    .insert({
      campaign_id: campaign.id,
      property_id: property.id,
      application_id: application.id,
      inspector_name: inspectorName?.trim() || null,
      move_in_date: moveInDate || null,
    })
    .select("id")
    .single();
  if (sessionErr) return NextResponse.json({ error: `Move-in session failed: ${sessionErr.message}` }, { status: 500 });

  const DEFAULT_ROOMS = ["Entrance", "Living Room", "Kitchen", "Bedroom", "Bathroom", "Laundry", "Basement", "Exterior"];
  await db.from("move_in_rooms").insert(DEFAULT_ROOMS.map((name, i) => ({ session_id: session.id, name, sort_order: i })));

  return NextResponse.json({ campaignId: campaign.id }, { status: 201 });
}
