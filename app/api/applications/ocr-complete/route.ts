import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { supabaseAdmin } from "@/lib/supabase";
import { generateApplicationReport, type OcrData } from "@/lib/application-ai";
import { applicationEbinReviewEmail } from "@/lib/emails";

export async function POST(req: NextRequest) {
  // Validate webhook secret
  const secret = req.headers.get("x-webhook-secret");
  if (!secret || secret !== process.env.OPENCLAW_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { application_id: string; ocr_data: OcrData };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { application_id, ocr_data } = body;

  if (!application_id || !ocr_data) {
    return NextResponse.json({ error: "Missing application_id or ocr_data" }, { status: 400 });
  }

  // Fetch application — must be in "processing" state to proceed
  const { data: application, error: fetchErr } = await supabaseAdmin
    .from("applications")
    .select("id, tenant_name, tenant_email, monthly_rent, monthly_income, employer_name, employer_position, employment_type, employment_start, current_address, status, property_id, agent_id")
    .eq("id", application_id)
    .eq("status", "processing")
    .maybeSingle();

  if (fetchErr || !application) {
    // Either not found or not in processing state — safe no-op
    return NextResponse.json({ ok: false, reason: "Application not found or not in processing state" });
  }

  // Save ocr_data immediately so it's not lost if AI fails
  await supabaseAdmin
    .from("applications")
    .update({ ocr_data })
    .eq("id", application_id);

  // Run Claude report generation in background (doesn't block the 200 response to OpenClaw)
  waitUntil(
    (async () => {
      try {
        const { score, report } = await generateApplicationReport(ocr_data, {
          tenant_name: application.tenant_name,
          tenant_email: application.tenant_email,
          monthly_rent: application.monthly_rent,
          monthly_income: application.monthly_income,
          employer_name: application.employer_name,
          employer_position: application.employer_position,
          employment_type: application.employment_type,
          employment_start: application.employment_start,
          current_address: application.current_address,
        });

        await supabaseAdmin
          .from("applications")
          .update({
            ai_score: score,
            ai_report: report,
            status: "reviewed",
          })
          .eq("id", application_id)
          .eq("status", "processing"); // guard: only update if still processing

        // Fetch property address for email
        const { data: property } = await supabaseAdmin
          .from("properties")
          .select("address, city")
          .eq("id", application.property_id)
          .maybeSingle();

        const propertyAddress = property
          ? `${property.address}, ${property.city}`
          : "Unknown property";

        // Fetch agent name for email
        const { data: agentRow } = await supabaseAdmin
          .from("agents")
          .select("name")
          .eq("id", application.agent_id)
          .maybeSingle();

        // Email Ebin
        const resendKey = process.env.RESEND_API_KEY;
        if (resendKey) {
          const { Resend } = await import("resend");
          const resend = new Resend(resendKey);
          resend.emails.send({
            from: "Prospera Properties <hello@prosperaproperties.co>",
            to: "prosperapropertiess@gmail.com",
            subject: `Application ready for review — ${application.tenant_name} (Score: ${score}/10)`,
            html: applicationEbinReviewEmail({
              tenantName: application.tenant_name,
              propertyAddress,
              agentName: agentRow?.name ?? "Unknown agent",
              aiScore: score,
              applicationId: application_id,
            }),
          }).catch((err: unknown) =>
            console.error("[ocr-complete] Ebin email failed:", err)
          );
        }
      } catch (err) {
        console.error("[ocr-complete] AI report generation failed:", err);
        // Mark as reviewed without score so Ebin still sees it
        await supabaseAdmin
          .from("applications")
          .update({ status: "reviewed" })
          .eq("id", application_id)
          .eq("status", "processing");
      }
    })()
  );

  return NextResponse.json({ ok: true });
}
