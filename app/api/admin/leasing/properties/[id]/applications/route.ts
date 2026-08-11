/**
 * GET   /api/admin/leasing/properties/[id]/applications — list applications
 * POST  /api/admin/leasing/properties/[id]/applications — send Quick Apply link
 * PATCH /api/admin/leasing/properties/[id]/applications — update application
 */
import { NextRequest, NextResponse } from "next/server";
import { isLeasingOrAdminAuthenticated } from "@/lib/leasing-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
  if (!body.application_id) return NextResponse.json({ error: "application_id required" }, { status: 400 });

  const db = getSupabaseAdmin();
  const { application_id, ...updates } = body;
  const { data, error } = await db
    .from("leasing_applications")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", application_id)
    .eq("campaign_id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
