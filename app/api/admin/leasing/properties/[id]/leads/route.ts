import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("leasing_leads")
    .select(`*, comms:leasing_lead_comms(*)`)
    .eq("leasing_property_id", id)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const db = getSupabaseAdmin();
  const body = await req.json();

  // Add communication log to existing lead
  if (body._action === "add_comm") {
    const { data, error } = await db
      .from("leasing_lead_comms")
      .insert({ lead_id: body.lead_id, type: body.type, content: body.content, created_by: body.created_by || "Ebin" })
      .select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  }

  // Update lead stage
  if (body._action === "update_stage") {
    const { data, error } = await db
      .from("leasing_leads")
      .update({ stage: body.stage })
      .eq("id", body.lead_id)
      .select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // Create new lead
  const { data, error } = await db
    .from("leasing_leads")
    .insert({ leasing_property_id: id, ...body })
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Auto-create follow-up task
  await db.from("leasing_tasks").insert({
    leasing_property_id: id,
    lead_id: data.id,
    title: `Follow up with ${body.name}`,
    priority: "high",
    due_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
  });

  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: NextRequest, _ctx: Ctx) {
  const db = getSupabaseAdmin();
  const body = await req.json();
  const { id: leadId, ...updates } = body;
  const { data, error } = await db.from("leasing_leads").update(updates).eq("id", leadId).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
