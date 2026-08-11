/**
 * Public Quick Apply endpoint — no auth required, guarded by unguessable token.
 * GET  /api/apply/[token] — get application + campaign info for applicant
 * POST /api/apply/[token] — submit preliminary application
 */
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const db = getSupabaseAdmin();

  const { data: application, error } = await db
    .from("leasing_applications")
    .select(`
      id, token, stage, legal_name, email, phone,
      campaign:leasing_properties(
        id, asking_rent, incentive_description, available_date,
        property:properties(title, address, city, bedrooms, bathrooms, images)
      )
    `)
    .eq("token", token)
    .single();

  if (error || !application) {
    return NextResponse.json({ error: "Application not found or link expired" }, { status: 404 });
  }

  if (application.stage === "WITHDRAWN") {
    return NextResponse.json({ error: "This application link is no longer active" }, { status: 410 });
  }

  // Don't expose internal fields to applicant
  return NextResponse.json({
    token: application.token,
    stage: application.stage,
    already_submitted: application.stage !== "LINK_SENT",
    prefill: {
      legal_name: application.legal_name,
      email: application.email,
      phone: application.phone,
    },
    campaign: application.campaign,
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const db = getSupabaseAdmin();

  // Load application
  const { data: application, error: loadErr } = await db
    .from("leasing_applications")
    .select("id, stage, campaign_id, lead_id")
    .eq("token", token)
    .single();

  if (loadErr || !application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  if (application.stage !== "LINK_SENT") {
    return NextResponse.json({ error: "Application already submitted" }, { status: 409 });
  }

  const body = await req.json();

  // Basic validation
  const required = ["legal_name", "phone", "email", "num_occupants", "employment_status"];
  for (const field of required) {
    if (!body[field] && body[field] !== 0) {
      return NextResponse.json({ error: `${field} is required` }, { status: 400 });
    }
  }

  const now = new Date().toISOString();

  // Calculate income ratio
  const { data: campaign } = await db
    .from("leasing_properties")
    .select("asking_rent")
    .eq("id", application.campaign_id)
    .single();

  const income = Number(body.approx_monthly_income ?? 0);
  const rent = Number(campaign?.asking_rent ?? 0);
  const income_ratio = rent > 0 && income > 0 ? Math.round((income / rent) * 100) / 100 : null;

  // Update application
  const { data: updated, error: updateErr } = await db
    .from("leasing_applications")
    .update({
      stage: "PRELIMINARY_SUBMITTED",
      preliminary_submitted_at: now,
      legal_name: body.legal_name,
      phone: body.phone,
      email: body.email,
      desired_move_date: body.desired_move_date ?? null,
      num_occupants: Number(body.num_occupants),
      employment_status: body.employment_status,
      employer_name: body.employer_name ?? null,
      approx_monthly_income: income > 0 ? income : null,
      has_pets: body.has_pets ?? false,
      pet_details: body.pet_details ?? null,
      num_vehicles: Number(body.num_vehicles ?? 0),
      reason_for_moving: body.reason_for_moving ?? null,
      additional_notes: body.additional_notes ?? null,
      income_ratio,
      updated_at: now,
    })
    .eq("id", application.id)
    .select()
    .single();

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  // Emit event
  await db.from("leasing_events").insert({
    campaign_id: application.campaign_id,
    event_type: "APPLICATION_SUBMITTED",
    actor: "Applicant",
    related_entity_type: "application",
    related_entity_id: application.id,
    metadata: { legal_name: body.legal_name, income_ratio },
  });

  // Create review task
  await db.from("leasing_tasks").insert({
    leasing_property_id: application.campaign_id,
    lead_id: application.lead_id,
    title: `Review application — ${body.legal_name}`,
    description: `${body.legal_name} submitted a preliminary application. Income ratio: ${income_ratio !== null ? `${income_ratio}x` : "not provided"}. Review and decide next steps.`,
    priority: "high",
    due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });

  return NextResponse.json({ success: true, stage: "PRELIMINARY_SUBMITTED" });
}
