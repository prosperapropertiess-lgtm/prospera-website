/**
 * Move-In Coordinator — bootstrap + full state for one leasing campaign.
 * GET auto-creates a draft move_in_sessions row the first time it's
 * requested (so "select or create a property" collapses into just
 * opening the tab — the property/owner/tenant already exist as a
 * leasing_properties campaign + its approved leasing_applications row).
 */
import { NextRequest, NextResponse } from "next/server";
import { isLeasingOrAdminAuthenticated } from "@/lib/leasing-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const DEFAULT_ROOMS = ["Entrance", "Living Room", "Kitchen", "Bedroom 1", "Bathroom 1", "Laundry", "Basement", "Exterior"];

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: campaignId } = await params;
  const db = getSupabaseAdmin();

  const { data: campaign, error: campaignErr } = await db
    .from("leasing_properties")
    .select("id, property_id, owner_name, owner_email, property:properties(id, title, address, city, name)")
    .eq("id", campaignId)
    .single();
  if (campaignErr || !campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

  let { data: session } = await db
    .from("move_in_sessions")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!session) {
    const { data: approved } = await db
      .from("leasing_applications")
      .select("id, legal_name, email, co_tenants")
      .eq("campaign_id", campaignId)
      .eq("stage", "APPROVED")
      .order("decision_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: created, error: createErr } = await db
      .from("move_in_sessions")
      .insert({ campaign_id: campaignId, property_id: campaign.property_id, application_id: approved?.id ?? null })
      .select("*")
      .single();
    if (createErr) return NextResponse.json({ error: createErr.message }, { status: 500 });
    session = created;

    // Seed the standard room checklist — editable afterward (add/rename/remove).
    await db.from("move_in_rooms").insert(
      DEFAULT_ROOMS.map((name, i) => ({ session_id: session!.id, name, sort_order: i }))
    );
  }

  const [{ data: application }, { data: rooms }, { data: appliances }, { data: keys }, { data: guide }, { data: signatures }, { data: documents }, { data: emailLog }] = await Promise.all([
    session.application_id
      ? db.from("leasing_applications").select("id, legal_name, email, phone, co_tenants").eq("id", session.application_id).maybeSingle()
      : Promise.resolve({ data: null }),
    db.from("move_in_rooms").select("*, items:move_in_items(*)").eq("session_id", session.id).order("sort_order"),
    db.from("move_in_appliances").select("*").eq("session_id", session.id).order("sort_order"),
    db.from("move_in_keys").select("*").eq("session_id", session.id).order("created_at"),
    campaign.property_id
      ? db.from("property_welcome_guides").select("*").eq("property_id", campaign.property_id).maybeSingle()
      : Promise.resolve({ data: null }),
    db.from("move_in_signatures").select("*").eq("session_id", session.id).order("signed_at"),
    db.from("move_in_documents").select("*").eq("session_id", session.id).order("created_at", { ascending: false }),
    db.from("move_in_email_log").select("*").eq("session_id", session.id),
  ]);

  // Sort each room's items by sort_order client-side (nested select above
  // doesn't support ordering the joined array).
  const sortedRooms = (rooms ?? []).map((r) => ({
    ...r,
    items: (r.items ?? []).sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order),
  }));

  return NextResponse.json({
    campaign,
    session,
    application,
    rooms: sortedRooms,
    appliances: appliances ?? [],
    keys: keys ?? [],
    welcomeGuide: guide ?? null,
    signatures: signatures ?? [],
    documents: documents ?? [],
    emailLog: emailLog ?? [],
  });
}
