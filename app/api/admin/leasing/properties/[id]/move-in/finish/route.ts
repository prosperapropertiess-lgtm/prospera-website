/**
 * "Finish Move-In & Send" — generates both PDFs (if not already generated
 * for the current report_version), uploads them, and emails the tenant(s)
 * + owner. Idempotent on every axis the spec calls out:
 *  - Re-generating PDFs is skipped if documents already exist for this
 *    exact report_version (a repeat tap never produces duplicate files).
 *  - Sending is per-recipient via move_in_email_log's unique constraint
 *    (session_id, recipient_email, email_type) — already-'sent' rows are
 *    never re-sent; only 'pending'/'failed' rows get (re)attempted, so a
 *    partial failure can be retried without duplicating the successful half.
 *  - A failed email never touches the completed inspection/session state.
 */
import { NextRequest, NextResponse } from "next/server";
import { isLeasingOrAdminAuthenticated } from "@/lib/leasing-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { generateInspectionReportPdf, generateWelcomeGuidePdf } from "@/lib/move-in-pdf";
import { moveInTenantEmail, moveInOwnerEmail } from "@/lib/emails";
import { Resend } from "resend";

const BUCKET = "tenant-inspection";
const SIGNED_URL_TTL = 60 * 60 * 24 * 365;

interface CoTenant { name?: string; first_name?: string; last_name?: string; email?: string }

function tenantNamesFrom(application: { legal_name: string | null; co_tenants: unknown } | null): string[] {
  if (!application) return [];
  const names = [application.legal_name].filter(Boolean) as string[];
  const co = Array.isArray(application.co_tenants) ? (application.co_tenants as CoTenant[]) : [];
  for (const c of co) {
    const n = c.name || [c.first_name, c.last_name].filter(Boolean).join(" ");
    if (n) names.push(n);
  }
  return names;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: campaignId } = await params;
  const { sessionId } = await req.json();
  if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

  const db = getSupabaseAdmin();

  const [{ data: session }, { data: campaign }] = await Promise.all([
    db.from("move_in_sessions").select("*").eq("id", sessionId).single(),
    db.from("leasing_properties").select("owner_name, owner_email, property:properties(id, title, address)").eq("id", campaignId).single(),
  ]);
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

  const property = Array.isArray(campaign.property) ? campaign.property[0] : campaign.property;
  const propertyAddress = property?.address || property?.title || "the property";

  const { data: application } = session.application_id
    ? await db.from("leasing_applications").select("legal_name, email, co_tenants").eq("id", session.application_id).single()
    : { data: null };
  const tenantNames = tenantNamesFrom(application);
  const tenantEmails = [application?.email].filter(Boolean) as string[];

  const [{ data: rooms }, { data: appliances }, { data: keys }, { data: guide }, { data: signatures }] = await Promise.all([
    db.from("move_in_rooms").select("name, items:move_in_items(*)").eq("session_id", sessionId).order("sort_order"),
    db.from("move_in_appliances").select("*").eq("session_id", sessionId).order("sort_order"),
    db.from("move_in_keys").select("*").eq("session_id", sessionId),
    session.property_id ? db.from("property_welcome_guides").select("*").eq("property_id", session.property_id).maybeSingle() : Promise.resolve({ data: null }),
    db.from("move_in_signatures").select("*").eq("session_id", sessionId).eq("report_version", session.report_version),
  ]);

  const inspectorSig = (signatures ?? []).find((s) => s.signer_role === "inspector");
  const tenantSigs = (signatures ?? []).filter((s) => s.signer_role === "tenant");
  const missing: string[] = [];
  if (!session.inspector_name) missing.push("Inspector name");
  if (!session.move_in_date) missing.push("Move-in date");
  if (!inspectorSig) missing.push("Inspector signature");
  if (tenantSigs.length === 0) missing.push("At least one tenant signature");
  if (missing.length > 0) {
    return NextResponse.json({ error: `Can't finish yet — missing: ${missing.join(", ")}` }, { status: 400 });
  }

  // ── 1. Documents (skip regeneration if this exact version is already done) ──
  const { data: existingDocs } = await db
    .from("move_in_documents")
    .select("*")
    .eq("session_id", sessionId)
    .eq("report_version", session.report_version);

  let reportDoc = existingDocs?.find((d) => d.doc_type === "inspection_report") ?? null;
  let guideDoc = existingDocs?.find((d) => d.doc_type === "welcome_guide") ?? null;

  if (!reportDoc) {
    const pdfBytes = await generateInspectionReportPdf({
      propertyAddress,
      ownerName: campaign.owner_name,
      tenantNames,
      inspectorName: session.inspector_name,
      moveInDate: session.move_in_date,
      reportVersion: session.report_version,
      rooms: (rooms ?? []).map((r) => ({ name: r.name, items: (r.items ?? []).sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order) })),
      appliances: appliances ?? [],
      keys: keys ?? [],
      meterReadings: session.meter_readings ?? [],
      signatures: signatures ?? [],
    });
    const path = `${campaignId}/reports/inspection-v${session.report_version}-${Date.now()}.pdf`;
    const { error: upErr } = await db.storage.from(BUCKET).upload(path, pdfBytes, { contentType: "application/pdf", upsert: false });
    if (upErr) return NextResponse.json({ error: `PDF upload failed: ${upErr.message}` }, { status: 500 });
    const { data: signed } = await db.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL);
    const { data: inserted, error: docErr } = await db
      .from("move_in_documents")
      .insert({ session_id: sessionId, doc_type: "inspection_report", report_version: session.report_version, file_url: signed?.signedUrl ?? "", file_path: path })
      .select()
      .single();
    if (docErr) return NextResponse.json({ error: docErr.message }, { status: 500 });
    reportDoc = inserted;
  }

  if (!guideDoc && guide) {
    const pdfBytes = await generateWelcomeGuidePdf({
      propertyAddress,
      companyName: "Prospera Properties",
      fields: {
        garbage_instructions: guide.garbage_instructions,
        parking_details: guide.parking_details,
        mailbox_details: guide.mailbox_details,
        utility_info: guide.utility_info,
        appliance_instructions: guide.appliance_instructions,
        maintenance_contact: guide.maintenance_contact,
        emergency_contact: guide.emergency_contact,
        other_notes: guide.other_notes,
        // internal_notes intentionally excluded
      },
    });
    const path = `${campaignId}/reports/welcome-guide-v${session.report_version}-${Date.now()}.pdf`;
    const { error: upErr } = await db.storage.from(BUCKET).upload(path, pdfBytes, { contentType: "application/pdf", upsert: false });
    if (upErr) return NextResponse.json({ error: `PDF upload failed: ${upErr.message}` }, { status: 500 });
    const { data: signed } = await db.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL);
    const { data: inserted, error: docErr } = await db
      .from("move_in_documents")
      .insert({ session_id: sessionId, doc_type: "welcome_guide", report_version: session.report_version, file_url: signed?.signedUrl ?? "", file_path: path })
      .select()
      .single();
    if (docErr) return NextResponse.json({ error: docErr.message }, { status: 500 });
    guideDoc = inserted;
  }

  // ── 2. Emails (per-recipient idempotent send/retry) ──
  const resend = new Resend(process.env.RESEND_API_KEY);
  const results: { recipient: string; type: string; status: string; error?: string }[] = [];

  async function sendOnce(email: string, role: "tenant" | "owner", type: "inspection_report" | "welcome_guide", subject: string, html: string) {
    const { data: existing } = await db.from("move_in_email_log").select("*").eq("session_id", sessionId).eq("recipient_email", email).eq("email_type", type).maybeSingle();
    if (existing?.status === "sent") {
      results.push({ recipient: email, type, status: "already_sent" });
      return;
    }
    if (!existing) {
      await db.from("move_in_email_log").insert({ session_id: sessionId, recipient_email: email, recipient_role: role, email_type: type, status: "pending" });
    }
    try {
      const { error } = await resend.emails.send({ from: "Prospera Properties <hello@prosperaproperties.co>", to: email, subject, html });
      if (error) throw new Error(JSON.stringify(error));
      await db.from("move_in_email_log").update({ status: "sent", sent_at: new Date().toISOString(), error_message: null }).eq("session_id", sessionId).eq("recipient_email", email).eq("email_type", type);
      results.push({ recipient: email, type, status: "sent" });
    } catch (err) {
      await db.from("move_in_email_log").update({ status: "failed", error_message: String(err) }).eq("session_id", sessionId).eq("recipient_email", email).eq("email_type", type);
      results.push({ recipient: email, type, status: "failed", error: String(err) });
    }
  }

  for (const email of tenantEmails) {
    const first = tenantNames[0] || "there";
    const { subject, html } = moveInTenantEmail(first, propertyAddress, reportDoc!.file_url, guideDoc?.file_url ?? null);
    await sendOnce(email, "tenant", "inspection_report", subject, html);
  }
  if (campaign.owner_email) {
    const { subject, html } = moveInOwnerEmail(campaign.owner_name || "", propertyAddress, tenantNames, reportDoc!.file_url);
    await sendOnce(campaign.owner_email, "owner", "inspection_report", subject, html);
  }

  // ── 3. Mark complete + schedule review request (only once) ──
  await db.from("move_in_sessions").update({ status: "completed", finished_at: new Date().toISOString() }).eq("id", sessionId);

  const { data: existingReview } = await db.from("move_in_review_requests").select("id").eq("session_id", sessionId).maybeSingle();
  if (!existingReview) {
    const { data: settings } = await db.from("move_in_review_settings").select("*").eq("id", 1).single();
    if (settings?.google_review_link) {
      const delayDays = settings.follow_up_delay_days ?? 3;
      const sendAt = new Date(Date.now() + delayDays * 86400000).toISOString();
      await db.from("move_in_review_requests").insert({ session_id: sessionId, send_at: sendAt });
    }
  }

  return NextResponse.json({ ok: true, reportDoc, guideDoc, emailResults: results });
}
