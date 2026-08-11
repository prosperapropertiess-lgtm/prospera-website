import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("leasing_showings")
    .select(`*, lead:leasing_leads(name, phone, email)`)
    .eq("leasing_property_id", id)
    .order("scheduled_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const db = getSupabaseAdmin();
  const body = await req.json();

  // Submit post-showing feedback (structured)
  if (body._action === "feedback") {
    const { data, error } = await db
      .from("leasing_showings")
      .update({
        status: "completed",
        interested: body.interested,
        main_objection: body.main_objection,
        competing_properties: body.competing_properties,
        next_action: body.next_action,
        feedback_notes: body.feedback_notes,
        // Structured feedback fields
        feedback_price: body.feedback_price ?? null,
        feedback_size: body.feedback_size ?? null,
        feedback_condition: body.feedback_condition ?? null,
        feedback_laundry: body.feedback_laundry ?? false,
        feedback_parking: body.feedback_parking ?? false,
        feedback_location: body.feedback_location ?? false,
        feedback_layout: body.feedback_layout ?? false,
        feedback_utilities: body.feedback_utilities ?? false,
      })
      .eq("id", body.showing_id)
      .select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Update lead pipeline stage
    if (body.lead_id) {
      await db.from("leasing_leads")
        .update({ pipeline_stage: "SHOWING_COMPLETED" })
        .eq("id", body.lead_id);
    }

    // Emit event
    await db.from("leasing_events").insert({
      campaign_id: id,
      event_type: "SHOWING_COMPLETED",
      actor: "Admin",
      related_entity_type: "showing",
      related_entity_id: body.showing_id,
      metadata: { interested: body.interested, main_objection: body.main_objection },
    });

    // Auto-task based on outcome
    if (body.interested === true) {
      // Send Quick Apply task
      await db.from("leasing_tasks").insert({
        leasing_property_id: id,
        lead_id: body.lead_id ?? null,
        title: "Send Quick Apply link",
        description: "Prospect is interested. Send Quick Apply — takes 2 minutes, no documents needed.\n\nDone when: Quick Apply link sent and marked in system.",
        priority: "high",
        due_date: new Date(Date.now() + 60 * 60 * 1000).toISOString().split("T")[0],
      });
    } else if (body.interested === null || body.interested === undefined) {
      // Maybe — follow up
      await db.from("leasing_tasks").insert({
        leasing_property_id: id,
        lead_id: body.lead_id ?? null,
        title: `Follow up after showing`,
        description: "Prospect was undecided. Follow up while the showing is still fresh.\n\nDone when: outcome updated (interested or not).",
        priority: "medium",
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      });
    }

    return NextResponse.json(data);
  }

  // Update status (cancel / no-show)
  if (body._action === "update_status") {
    const { data, error } = await db
      .from("leasing_showings")
      .update({ status: body.status })
      .eq("id", body.showing_id)
      .select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await db.from("leasing_events").insert({
      campaign_id: id,
      event_type: body.status === "no_show" ? "SHOWING_NO_SHOW" : "SHOWING_CANCELLED",
      actor: "Admin",
      related_entity_type: "showing",
      related_entity_id: body.showing_id,
      metadata: { status: body.status },
    });

    return NextResponse.json(data);
  }

  // Create new showing
  const { data, error } = await db
    .from("leasing_showings")
    .insert({ leasing_property_id: id, status: "scheduled", ...body })
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update lead pipeline stage
  if (body.lead_id) {
    await db.from("leasing_leads")
      .update({ pipeline_stage: "SHOWING_BOOKED" })
      .eq("id", body.lead_id);
  }

  // Emit event
  await db.from("leasing_events").insert({
    campaign_id: id,
    event_type: "SHOWING_BOOKED",
    actor: "Admin",
    related_entity_type: "showing",
    related_entity_id: data.id,
    metadata: { scheduled_at: body.scheduled_at, lead_id: body.lead_id ?? null },
  });

  // Auto-advance campaign to SHOWINGS_ACTIVE if first showing
  const { data: campaign } = await db
    .from("leasing_properties")
    .select("stage")
    .eq("id", id)
    .single();

  if (campaign && ["ACTIVE_MARKETING", "LEADS_ACTIVE"].includes(campaign.stage)) {
    await db.from("leasing_properties").update({
      stage: "SHOWINGS_ACTIVE",
      stage_showings_active_at: new Date().toISOString(),
      status: "showing_scheduled",
    }).eq("id", id);
  }

  return NextResponse.json(data, { status: 201 });
}
