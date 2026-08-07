import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const DEFAULT_CHECKLIST = [
  // Exterior
  { category: "exterior", item: "Lawn mowed and edged", sort_order: 1 },
  { category: "exterior", item: "Entrance cleaned and swept", sort_order: 2 },
  { category: "exterior", item: "Exterior photos taken", sort_order: 3 },
  { category: "exterior", item: "Garbage / debris removed", sort_order: 4 },
  // Interior
  { category: "interior", item: "Deep clean completed", sort_order: 5 },
  { category: "interior", item: "All repairs completed", sort_order: 6 },
  { category: "interior", item: "Appliances checked and working", sort_order: 7 },
  { category: "interior", item: "All lighting working", sort_order: 8 },
  { category: "interior", item: "Staging / touch-ups done", sort_order: 9 },
  { category: "interior", item: "Interior photos taken", sort_order: 10 },
  // Marketing
  { category: "marketing", item: "Professional photos uploaded", sort_order: 11 },
  { category: "marketing", item: "Listing description written", sort_order: 12 },
  { category: "marketing", item: "Pricing reviewed vs. market", sort_order: 13 },
  { category: "marketing", item: "Posted on Kijiji", sort_order: 14 },
  { category: "marketing", item: "Posted on Facebook Marketplace", sort_order: 15 },
  { category: "marketing", item: "Posted on Rentals.ca", sort_order: 16 },
  { category: "marketing", item: "Website listing live", sort_order: 17 },
];

const DEFAULT_CHANNELS = [
  { channel: "facebook", active: false, views: 0, leads_generated: 0 },
  { channel: "kijiji", active: false, views: 0, leads_generated: 0 },
  { channel: "rentals_ca", active: false, views: 0, leads_generated: 0 },
  { channel: "website", active: false, views: 0, leads_generated: 0 },
  { channel: "instagram", active: false, views: 0, leads_generated: 0 },
  { channel: "student_groups", active: false, views: 0, leads_generated: 0 },
  { channel: "referral", active: false, views: 0, leads_generated: 0 },
];

export async function GET() {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("leasing_properties")
    .select(`
      *,
      property:properties(id, title, address, city, bedrooms, bathrooms, price, images, slug, available),
      checklist:leasing_checklist(id, completed),
      leads:leasing_leads(id, stage),
      showings:leasing_showings(id, status),
      channels:leasing_channels(id, active)
    `)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const db = getSupabaseAdmin();
  const body = await req.json();

  const { data: lp, error } = await db
    .from("leasing_properties")
    .insert({
      property_id: body.property_id,
      status: "preparing",
      vacant_since: body.vacant_since || new Date().toISOString().split("T")[0],
      asking_rent: body.asking_rent,
      target_rent: body.target_rent,
      notes: body.notes || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Auto-generate default checklist
  await db.from("leasing_checklist").insert(
    DEFAULT_CHECKLIST.map((item) => ({ ...item, leasing_property_id: lp.id }))
  );

  // Auto-generate default channels
  await db.from("leasing_channels").insert(
    DEFAULT_CHANNELS.map((ch) => ({ ...ch, leasing_property_id: lp.id }))
  );

  // Auto-create first task
  await db.from("leasing_tasks").insert({
    leasing_property_id: lp.id,
    title: "Complete preparation checklist",
    description: "Walk through the property and tick off all exterior, interior, and marketing items.",
    priority: "high",
    due_date: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
  });

  return NextResponse.json(lp, { status: 201 });
}
