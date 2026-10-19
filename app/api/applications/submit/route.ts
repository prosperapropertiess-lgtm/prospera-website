import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { supabaseAdmin } from "@/lib/supabase";
import { applicationReceivedAgentEmail, applicationEbinReviewEmail } from "@/lib/emails";
import { createQuickActionToken } from "@/lib/application-quick-action-token";
import { screenAndSave, VERDICTS } from "@/lib/application-screening";
import { ALL_DOC_TYPES, missingDocs, type IncomeSource } from "@/lib/application-requirements";

// The AI review runs after the response is sent; give it room to read every document.
export const maxDuration = 300;

const INCOME_SOURCES: IncomeSource[] = ["employed", "self_employed", "student", "retired", "other"];
const EMPLOYMENT_TYPES = ["full_time", "part_time", "contract"];
const TIMES_AT_ADDRESS = ["under_1", "1_2", "2_5", "5_plus"];

interface DocEntry {
  doc_type: string;
  storage_path: string;
}

const text = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
const num = (v: unknown) => (v !== "" && v != null && Number.isFinite(Number(v)) ? Number(v) : null);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agent_id, property_id, documents, consent } = body;
    const tenant_name = text(body.tenant_name);
    const tenant_email = text(body.tenant_email)?.toLowerCase() ?? null;
    const tenant_phone = text(body.tenant_phone);
    const income_source = INCOME_SOURCES.includes(body.income_source) ? (body.income_source as IncomeSource) : null;

    if (!agent_id || !property_id) {
      return NextResponse.json({ error: "Invalid application link" }, { status: 400 });
    }
    if (!tenant_name || !tenant_email || !tenant_phone) {
      return NextResponse.json({ error: "Name, email, and phone are required" }, { status: 400 });
    }
    if (!income_source) {
      return NextResponse.json({ error: "Please tell us how you earn your income." }, { status: 400 });
    }
    if (consent !== true) {
      return NextResponse.json({ error: "Please check the box to confirm and give permission." }, { status: 400 });
    }

    const docEntries: DocEntry[] = (Array.isArray(documents) ? documents : []).filter(
      (d: DocEntry) =>
        ALL_DOC_TYPES.includes(d?.doc_type as never) &&
        typeof d?.storage_path === "string" &&
        /^temp\/[\w.-]+$/.test(d.storage_path),
    );
    const missing = missingDocs(income_source, docEntries);
    if (missing) return NextResponse.json({ error: missing }, { status: 400 });

    const { data: agent } = await supabaseAdmin
      .from("agents")
      .select("id, name, email, is_active")
      .eq("id", agent_id)
      .eq("is_active", true)
      .maybeSingle();
    if (!agent) return NextResponse.json({ error: "Invalid application link" }, { status: 400 });

    const { data: property } = await supabaseAdmin
      .from("properties")
      .select("id, address, city, price")
      .eq("id", property_id)
      .eq("is_managed", true)
      .eq("available", true)
      .maybeSingle();
    if (!property) return NextResponse.json({ error: "This property is no longer available" }, { status: 400 });

    const { data: existing } = await supabaseAdmin
      .from("applications")
      .select("id")
      .eq("tenant_email", tenant_email)
      .eq("property_id", property_id)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ error: "You have already applied for this property." }, { status: 409 });
    }

    const coApplicants = (Array.isArray(body.co_applicants) ? body.co_applicants : [])
      .slice(0, 5)
      .map((c: Record<string, unknown>) => ({ name: text(c?.name), email: text(c?.email), phone: text(c?.phone) }))
      .filter((c: { name: string | null }) => c.name);

    const { data: application, error: appErr } = await supabaseAdmin
      .from("applications")
      .insert([{
        agent_id,
        property_id,
        tenant_name,
        tenant_email,
        tenant_phone,
        move_in_date: text(body.move_in_date),
        occupants: num(body.occupants),
        co_applicants: coApplicants,
        pets: body.has_pets === "yes" ? text(body.pets) : null,
        smokes: body.smokes === "yes" ? true : body.smokes === "no" ? false : null,
        vehicles: num(body.vehicles),
        income_source,
        income_notes: text(body.income_notes),
        employer_name: text(body.employer_name),
        employer_position: text(body.employer_position),
        employment_type:
          income_source === "self_employed" ? "self_employed"
          : income_source === "employed" && EMPLOYMENT_TYPES.includes(body.employment_type) ? body.employment_type
          : null,
        employment_start: text(body.employment_start),
        monthly_income: num(body.monthly_income),
        employer_ref_name: text(body.employer_ref_name),
        employer_ref_phone: text(body.employer_ref_phone),
        current_address: text(body.current_address),
        time_at_address: TIMES_AT_ADDRESS.includes(body.time_at_address) ? body.time_at_address : null,
        current_rent: body.rents_now === "yes" ? num(body.current_rent) : null,
        landlord_ref_name: body.rents_now === "yes" ? text(body.landlord_ref_name) : null,
        landlord_ref_phone: body.rents_now === "yes" ? text(body.landlord_ref_phone) : null,
        landlord_ref_email: body.rents_now === "yes" ? text(body.landlord_ref_email) : null,
        reason_for_moving: text(body.reason_for_moving),
        consent_at: new Date().toISOString(),
        monthly_rent: Number(property.price),
        status: "pending",
      }])
      .select("id")
      .single();

    if (appErr || !application) {
      console.error("Application insert error:", appErr);
      return NextResponse.json({ error: "Failed to save application" }, { status: 500 });
    }

    // Move documents from temp/ → applications/{id}/ and record them.
    for (const doc of docEntries) {
      const newPath = doc.storage_path.replace(/^temp\//, `applications/${application.id}/`);
      const { error: moveErr } = await supabaseAdmin.storage.from("applications").move(doc.storage_path, newPath);
      await supabaseAdmin.from("application_documents").insert([{
        application_id: application.id,
        doc_type: doc.doc_type,
        storage_path: moveErr ? doc.storage_path : newPath,
      }]);
    }

    await supabaseAdmin.from("applications").update({ status: "processing" }).eq("id", application.id);

    const resendKey = process.env.RESEND_API_KEY;
    const propertyAddress = `${property.address}, ${property.city}`;

    if (resendKey) {
      const { Resend } = await import("resend");
      new Resend(resendKey).emails.send({
        from: "Prospera Properties <hello@prosperaproperties.co>",
        to: agent.email,
        cc: ["prosperapropertiess@gmail.com"],
        subject: `New application — ${tenant_name} for ${property.address}`,
        html: applicationReceivedAgentEmail({
          agentName: agent.name,
          tenantName: tenant_name,
          tenantEmail: tenant_email,
          tenantPhone: tenant_phone,
          propertyAddress,
          applicationId: application.id,
        }),
      }).catch((err: unknown) => console.error("[submit] Agent email failed:", err));
    }

    // AI review in the background, then always tell Ebin — with the summary if
    // it worked, or a "look at this by hand" note if it didn't.
    waitUntil(
      (async () => {
        const { summary } = await screenAndSave(application.id);
        if (!resendKey) return;

        const { Resend } = await import("resend");
        const subject = summary
          ? `${VERDICTS[summary.verdict]}: ${tenant_name} for ${property.address}`
          : `Needs a manual look: ${tenant_name} for ${property.address}`;
        await new Resend(resendKey).emails.send({
          from: "Prospera Properties <hello@prosperaproperties.co>",
          to: "prosperapropertiess@gmail.com",
          subject,
          html: applicationEbinReviewEmail({
            tenantName: tenant_name,
            propertyAddress,
            agentName: agent.name,
            aiScore: summary?.score ?? null,
            verdict: summary ? VERDICTS[summary.verdict] : undefined,
            headline: summary?.headline,
            questions: summary?.questions_to_ask,
            aiFailed: !summary,
            applicationId: application.id,
            approveUrl: `https://www.prosperaproperties.co/api/admin/applications/${application.id}/quick-action?token=${createQuickActionToken(application.id, "approved")}`,
            rejectUrl: `https://www.prosperaproperties.co/api/admin/applications/${application.id}/quick-action?token=${createQuickActionToken(application.id, "rejected")}`,
          }),
        }).catch((err: unknown) => console.error("[submit] Ebin review email failed:", err));
      })(),
    );

    return NextResponse.json({ success: true, application_id: application.id });
  } catch (err) {
    console.error("submit application error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
