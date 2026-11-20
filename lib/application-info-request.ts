// Asking an applicant for more: Ebin picks the documents and questions he needs,
// the applicant gets a private link to send them, then the AI reads everything again.
import { after } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { signId, verifyId } from "@/lib/fieldops/engine";
import { shell, p, h1, button, esc } from "@/lib/application-emails";
import { DOC_LABELS, type DocType } from "@/lib/application-requirements";
import { screenAndSave } from "@/lib/application-screening";

const SITE = "https://www.prosperaproperties.co";
const EBIN = "prosperapropertiess@gmail.com";
const db = () => getSupabaseAdmin();

export const infoRequestLink = (id: string) => `${SITE}/apply/more/${signId("more_info", id)}`;
export const infoRequestIdFromToken = (token: string) => verifyId("more_info", token);

/** Documents an applicant can be asked for (SingleKey is ours to run). */
export const REQUESTABLE: DocType[] = ["id", "paystub", "employment_letter", "bank_statement", "credit_report", "notice_of_assessment", "income_proof"];

async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not configured");
  const { Resend } = await import("resend");
  const { error } = await new Resend(key).emails.send({ from: "Prospera Properties <hello@prosperaproperties.co>", replyTo: EBIN, to, subject, html });
  if (error) throw new Error(`Email failed: ${error.message}`);
}

function requestEmail(o: { first: string; address: string; docs: string[]; questions: string[]; note: string | null; url: string }) {
  const list = (items: string[]) => items.map((x) => `• ${esc(x)}`).join("<br>");
  const html = shell("A FEW MORE DETAILS", `
${h1(`Hi ${esc(o.first)}, we need a little more.`)}
${p(`Thanks for applying for <b>${esc(o.address)}</b>. To finish reviewing your application, please send us the following.`)}
${o.note ? p(esc(o.note).replace(/\n/g, "<br>")) : ""}
${o.docs.length ? p(`<b style="color:#222">Documents</b><br>${list(o.docs)}`) : ""}
${o.questions.length ? p(`<b style="color:#222">Questions</b><br>${list(o.questions)}`) : ""}
${button("Send the details", o.url)}
${p(`It takes a few minutes. Photos from your phone are fine.`)}
${p(`Thanks,<br><b style="color:#222">Ebin</b><br>Prospera Properties`, "0 36px 26px")}
`);
  return { subject: `A few more details for your application: ${o.address}`, html };
}

export async function sendInfoRequest(applicationId: string, o: { docTypes: string[]; questions: string[]; note?: string | null }) {
  const docTypes = o.docTypes.filter((t) => REQUESTABLE.includes(t as DocType));
  const questions = o.questions.map((q) => q.trim()).filter(Boolean).slice(0, 8);
  if (!docTypes.length && !questions.length) throw new Error("Pick at least one document or write a question.");
  const { data: app } = await db().from("applications").select("id, tenant_name, tenant_email, status, properties(address)").eq("id", applicationId).maybeSingle();
  if (!app) throw new Error("Application not found");
  if (!app.tenant_email) throw new Error("This applicant has no email address.");
  // One open request at a time: a new one replaces the last.
  await db().from("application_info_requests").update({ cancelled_at: new Date().toISOString() }).eq("application_id", applicationId).is("completed_at", null).is("cancelled_at", null);
  const { data: req, error } = await db().from("application_info_requests").insert({ application_id: applicationId, doc_types: docTypes, questions, note: o.note?.trim() || null }).select("id").single();
  if (error || !req) throw new Error("Couldn't save the request.");
  const address = (app.properties as unknown as { address: string } | null)?.address ?? "the home";
  const url = infoRequestLink(req.id);
  const { subject, html } = requestEmail({ first: app.tenant_name.trim().split(/\s+/)[0] || "there", address, docs: docTypes.map((t) => DOC_LABELS[t as DocType]), questions, note: o.note?.trim() || null, url });
  try {
    await sendEmail(app.tenant_email, subject, html);
  } catch (e) {
    await db().from("application_info_requests").delete().eq("id", req.id);
    throw e;
  }
  return { id: req.id, url };
}

export async function loadInfoRequest(token: string) {
  const id = infoRequestIdFromToken(token);
  if (!id) return null;
  const { data: req } = await db().from("application_info_requests").select("*, applications(id, tenant_name, status, properties(address, city))").eq("id", id).maybeSingle();
  if (!req) return null;
  if (!req.opened_at) await db().from("application_info_requests").update({ opened_at: new Date().toISOString() }).eq("id", id);
  const app = req.applications as unknown as { id: string; tenant_name: string; status: string; properties: { address: string; city: string } | null };
  return { req, app };
}

/** The applicant sent it in: save files and answers, re-run the AI in the background, tell Ebin. */
export async function completeInfoRequest(id: string, o: { files: { doc_type: string; path: string }[]; answers: Record<string, string>; comment?: string }) {
  const { data: req } = await db().from("application_info_requests").select("*, applications(id, tenant_name, properties(address))").eq("id", id).maybeSingle();
  if (!req || req.cancelled_at) throw new Error("This request is no longer open.");
  if (req.completed_at) throw new Error("You've already sent these. Thank you.");
  const appId = req.application_id as string;
  const files = o.files.filter((f) => (req.doc_types as string[]).includes(f.doc_type) && f.path.startsWith(`applications/${appId}/more-${id}-`));
  for (const t of req.doc_types as string[]) if (!files.some((f) => f.doc_type === t)) throw new Error(`Please add your ${DOC_LABELS[t as DocType].toLowerCase()}.`);
  const answers: Record<string, string> = {};
  for (const q of req.questions as string[]) {
    const a = (o.answers[q] ?? "").trim();
    if (!a) throw new Error("Please answer every question.");
    answers[q] = a.slice(0, 2000);
  }
  if (o.comment?.trim()) answers["Anything else"] = o.comment.trim().slice(0, 2000);
  if (files.length) {
    const { error } = await db().from("application_documents").insert(files.map((f) => ({ application_id: appId, doc_type: f.doc_type, storage_path: f.path })));
    if (error) throw new Error("Couldn't save your documents. Try again.");
  }
  await db().from("application_info_requests").update({ answers, completed_at: new Date().toISOString() }).eq("id", id);

  const app = req.applications as unknown as { tenant_name: string; properties: { address: string } | null };
  after(async () => {
    const { summary } = await screenAndSave(appId);
    await sendEmail(EBIN, `${app.tenant_name} sent the extra details${summary ? ". AI report updated" : ""}`,
      `<p style="font-family:Arial;font-size:15px">${esc(app.tenant_name)} sent what you asked for on ${esc(app.properties?.address ?? "their application")}: ${files.length} document${files.length === 1 ? "" : "s"}${Object.keys(answers).length ? " and their answers" : ""}.</p>
<p style="font-family:Arial;font-size:15px">${summary ? "The AI read everything again and the report is updated." : "The AI couldn't re-run. Open the application and tap Run AI again."}</p>
<p style="font-family:Arial;font-size:15px"><a href="${SITE}/admin/applications/${appId}">Open the application</a></p>`).catch((e) => console.error("[info-request] Ebin email failed:", e));
  });
}

