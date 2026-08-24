/**
 * GET   /api/admin/leasing/properties/[id]/applications — list applications
 * POST  /api/admin/leasing/properties/[id]/applications — send Quick Apply link
 * PATCH /api/admin/leasing/properties/[id]/applications — update application / run an _action
 */
import { NextRequest, NextResponse } from "next/server";
import { isLeasingOrAdminAuthenticated } from "@/lib/leasing-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";
import { tenantDocumentRequestEmail, ownerStrongApplicantEmail } from "@/lib/emails";

const resend = new Resend(process.env.RESEND_API_KEY);
const DEFAULT_APPLICATION_LINK = "https://form.jotform.com/262055545302046";
const VERIFICATION_LINK_KEY = "leasing_verification_application_link";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("leasing_applications")
    .select("*, lead:leasing_leads(name, phone, email)")
    .eq("campaign_id", id)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();

  if (!body.email || !body.lead_id) {
    return NextResponse.json({ error: "email and lead_id required" }, { status: 400 });
  }

  const db = getSupabaseAdmin();

  // Get campaign info for the email
  const { data: campaign } = await db
    .from("leasing_properties")
    .select("campaign_name, asking_rent, property:properties(title, address)")
    .eq("id", id)
    .single();

  // Create application record
  const { data: application, error } = await db
    .from("leasing_applications")
    .insert({ campaign_id: id, lead_id: body.lead_id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Build apply URL
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.prosperaproperties.co";
  const applyUrl = `${baseUrl}/apply/${application.token}`;

  // Send email
  try {
    await resend.emails.send({
      from: "Prospera Properties <no-reply@prosperaproperties.co>",
      to: body.email,
      subject: "Your application link — takes about 2 minutes",
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #222;">
          <h2 style="color: #1F2F3A;">You're one step away</h2>
          <p>Thanks for your interest in <strong>${(campaign?.property as { title?: string; address?: string } | null)?.title ?? campaign?.campaign_name ?? "the property"}</strong>.</p>
          <p>We'd like to move forward with your application. It takes about <strong>2 minutes</strong> and no documents are required at this stage.</p>
          <div style="margin: 28px 0;">
            <a href="${applyUrl}" style="background: #8B2030; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              Start My Application
            </a>
          </div>
          <p style="font-size: 13px; color: #666;">Or copy this link: ${applyUrl}</p>
          <p style="font-size: 13px; color: #666;">This link expires in 30 days. If you have questions, reply to this email.</p>
          <hr style="border: none; border-top: 1px solid #E5E1DC; margin: 24px 0;" />
          <p style="font-size: 12px; color: #999;">Prospera Properties · London, Ontario</p>
        </div>
      `,
    });
  } catch (emailErr) {
    console.error("Quick Apply email failed:", emailErr);
    // Don't fail the request — return the link so coordinator can share manually
  }

  // Mark showing as quick_apply_sent if showing_id provided
  if (body.showing_id) {
    await db.from("leasing_showings").update({
      quick_apply_sent: true,
      quick_apply_sent_at: new Date().toISOString(),
    }).eq("id", body.showing_id);
  }

  // Emit event
  await db.from("leasing_events").insert({
    campaign_id: id,
    event_type: "QUICK_APPLY_SENT",
    actor: "Admin",
    related_entity_type: "lead",
    related_entity_id: body.lead_id,
    metadata: { email: body.email, apply_url: applyUrl, application_id: application.id },
  });

  return NextResponse.json({ application, apply_url: applyUrl }, { status: 201 });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const db = getSupabaseAdmin();

  // ── Request Documents — sends the real document-prep email to the applicant ──
  if (body._action === "request_documents") {
    const { application_id } = body;
    if (!application_id) return NextResponse.json({ error: "application_id required" }, { status: 400 });

    const { data: app } = await db.from("leasing_applications").select("*").eq("id", application_id).single();
    if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });
    if (!app.email) return NextResponse.json({ error: "Application has no email on file" }, { status: 400 });

    const { data: setting } = await db.from("settings").select("value").eq("key", VERIFICATION_LINK_KEY).single();
    const applicationLink = setting?.value || DEFAULT_APPLICATION_LINK;

    const { data: campaign } = await db
      .from("leasing_properties")
      .select("property:properties(title, address)")
      .eq("id", id)
      .single();
    const propertyAddress = (campaign?.property as { title?: string; address?: string } | null)?.address
      ?? (campaign?.property as { title?: string; address?: string } | null)?.title
      ?? "the property";

    try {
      await resend.emails.send({
        from: "Ebin | Prospera Properties <hello@prosperaproperties.co>",
        to: app.email,
        cc: ["prosperapropertiess@gmail.com"],
        subject: "Next step — please prepare your documents",
        html: tenantDocumentRequestEmail({ tenantName: app.legal_name || "there", propertyAddress, applicationLink }),
      });
    } catch (emailErr) {
      console.error("Document request email failed:", emailErr);
    }

    const { data, error } = await db
      .from("leasing_applications")
      .update({ stage: "AWAITING_DOCUMENTS", documents_requested_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", application_id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await db.from("leasing_events").insert({
      campaign_id: id,
      event_type: "DOCUMENTS_REQUESTED",
      actor: "Admin",
      related_entity_type: "application",
      related_entity_id: application_id,
    });

    return NextResponse.json(data);
  }

  // ── Toggle one verification checklist item ──
  if (body._action === "toggle_checklist") {
    const { application_id, key, checked } = body;
    if (!application_id || !key) return NextResponse.json({ error: "application_id and key required" }, { status: 400 });

    const { data: app } = await db.from("leasing_applications").select("verification_checklist").eq("id", application_id).single();
    const checklist = { ...(app?.verification_checklist ?? {}), [key]: !!checked };

    const { data, error } = await db
      .from("leasing_applications")
      .update({ verification_checklist: checklist, updated_at: new Date().toISOString() })
      .eq("id", application_id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // ── Mark documents complete — moves into final verification review ──
  if (body._action === "documents_complete") {
    const { application_id } = body;
    if (!application_id) return NextResponse.json({ error: "application_id required" }, { status: 400 });

    const { data, error } = await db
      .from("leasing_applications")
      .update({ stage: "VERIFIED", documents_complete_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", application_id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // ── Plain field update (co_tenants, documents_url, decision notes, or a stage change) ──
  if (!body.application_id) return NextResponse.json({ error: "application_id required" }, { status: 400 });
  const { application_id, ...updates } = body;

  const { data, error } = await db
    .from("leasing_applications")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", application_id)
    .eq("campaign_id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Approving fires the owner update and nudges the campaign stage forward —
  // informational, not a gate: the owner still has final say per the
  // placement agreement, this just keeps them in the loop.
  if (updates.stage === "APPROVED") {
    const { data: campaign } = await db
      .from("leasing_properties")
      .select("stage, owner_name, owner_email, property:properties(title, address)")
      .eq("id", id)
      .single();

    if (campaign?.owner_email) {
      try {
        await resend.emails.send({
          from: "Ebin | Prospera Properties <hello@prosperaproperties.co>",
          to: campaign.owner_email,
          cc: ["prosperapropertiess@gmail.com"],
          subject: `Strong applicant found — ${(campaign.property as { title?: string; address?: string } | null)?.address ?? "your property"}`,
          html: ownerStrongApplicantEmail({
            ownerName: campaign.owner_name || "there",
            propertyAddress: (campaign.property as { title?: string; address?: string } | null)?.address
              ?? (campaign.property as { title?: string; address?: string } | null)?.title
              ?? "your property",
            applicantName: data.legal_name || "Applicant",
            employmentStatus: data.employment_status,
            monthlyIncome: data.approx_monthly_income,
            incomeRatio: data.income_ratio,
            occupants: data.num_occupants,
            hasPets: !!data.has_pets,
          }),
        });
      } catch (emailErr) {
        console.error("Strong applicant owner email failed:", emailErr);
      }
    }

    const currentIdx = ["PREPARATION", "MARKET_READY", "ACTIVE_MARKETING", "LEADS_ACTIVE", "SHOWINGS_ACTIVE", "APPLICATIONS_REVIEW", "APPROVED"].indexOf(campaign?.stage ?? "");
    if (currentIdx >= 0 && currentIdx < 6) {
      await db.from("leasing_properties").update({ stage: "APPROVED", stage_approval_at: new Date().toISOString() }).eq("id", id);
    }
  }

  return NextResponse.json(data);
}
