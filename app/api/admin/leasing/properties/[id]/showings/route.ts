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

  // Submit post-showing feedback
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
      })
      .eq("id", body.showing_id)
      .select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Update lead stage
    if (body.lead_id) {
      await db.from("leasing_leads").update({ stage: "showing_completed" }).eq("id", body.lead_id);
    }

    // Auto follow-up task if interested
    if (body.interested && body.next_action) {
      await db.from("leasing_tasks").insert({
        leasing_property_id: id,
        lead_id: body.lead_id || null,
        title: body.next_action,
        priority: "high",
        due_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
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
    return NextResponse.json(data);
  }

  // Create new showing
  const { data, error } = await db
    .from("leasing_showings")
    .insert({ leasing_property_id: id, ...body })
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update lead stage
  if (body.lead_id) {
    await db.from("leasing_leads").update({ stage: "showing_scheduled" }).eq("id", body.lead_id);
  }

  return NextResponse.json(data, { status: 201 });
}
