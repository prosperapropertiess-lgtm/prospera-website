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
    const now = new Date().toISOString();

    // Log the comm
    const { data, error } = await db
      .from("leasing_lead_comms")
      .insert({
        lead_id: body.lead_id,
        type: body.type,
        direction: body.direction ?? "outbound",
        body: body.content,
        created_by: body.created_by ?? "Admin",
      })
      .select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Set first_response_at if this is first outbound comm
    if ((body.direction ?? "outbound") === "outbound") {
      const { data: lead } = await db
        .from("leasing_leads")
        .select("first_response_at, pipeline_stage")
        .eq("id", body.lead_id)
        .single();

      const updates: Record<string, string> = { last_contacted_at: now };
      if (!lead?.first_response_at) updates.first_response_at = now;
      if (lead?.pipeline_stage === "NEW") updates.pipeline_stage = "CONTACTED";

      await db.from("leasing_leads").update(updates).eq("id", body.lead_id);
    }

    // Emit event
    await db.from("leasing_events").insert({
      campaign_id: id,
      event_type: "COMM_LOGGED",
      actor: body.created_by ?? "Admin",
      related_entity_type: "lead",
      related_entity_id: body.lead_id,
      metadata: { type: body.type, direction: body.direction ?? "outbound" },
    });

    return NextResponse.json(data, { status: 201 });
  }

  // Update lead stage
  if (body._action === "update_stage") {
    const updates: Record<string, unknown> = { pipeline_stage: body.stage };
    if (body.stage === "LOST") {
      updates.lost_reason = body.lost_reason ?? null;
      updates.lost_reason_notes = body.lost_reason_notes ?? null;
    }
    const { data, error } = await db
      .from("leasing_leads")
      .update(updates)
      .eq("id", body.lead_id)
      .select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Emit event
    await db.from("leasing_events").insert({
      campaign_id: id,
      event_type: body.stage === "LOST" ? "LEAD_LOST" : "LEAD_STAGE_CHANGED",
      actor: "Admin",
      related_entity_type: "lead",
      related_entity_id: body.lead_id,
      metadata: { to: body.stage, lost_reason: body.lost_reason ?? null },
    });

    return NextResponse.json(data);
  }

  // Create new lead
  const { data, error } = await db
    .from("leasing_leads")
    .insert({
      leasing_property_id: id,
      pipeline_stage: "NEW",
      ...body,
    })
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Auto-create urgent respond task
  await db.from("leasing_tasks").insert({
    leasing_property_id: id,
    lead_id: data.id,
    title: `Respond to ${body.name}`,
    description: "New lead received. Contact within 15 minutes for best conversion. Qualify move-in date, occupants, and showing interest.\n\nDone when: first outbound comm logged.",
    priority: "urgent",
    due_date: new Date(Date.now() + 30 * 60 * 1000).toISOString().split("T")[0],
  });

  // Emit event
  await db.from("leasing_events").insert({
    campaign_id: id,
    event_type: "LEAD_CREATED",
    actor: "Admin",
    related_entity_type: "lead",
    related_entity_id: data.id,
    metadata: { name: body.name, source: body.source },
  });

  // Auto-advance campaign to LEADS_ACTIVE if still in ACTIVE_MARKETING
  const { data: campaign } = await db
    .from("leasing_properties")
    .select("stage")
    .eq("id", id)
    .single();

  if (campaign?.stage === "ACTIVE_MARKETING") {
    await db.from("leasing_properties").update({
      stage: "LEADS_ACTIVE",
      stage_leads_active_at: new Date().toISOString(),
      status: "receiving_leads",
    }).eq("id", id);
  }

  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: NextRequest, _ctx: Ctx) {
  const db = getSupabaseAdmin();
  const body = await req.json();
  const { id: leadId, ...updates } = body;
  const { data, error } = await db
    .from("leasing_leads")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", leadId)
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
