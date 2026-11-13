import { placementForProperty, syncApplication } from "@/lib/placements/sync";
import { releaseApplication } from "@/lib/placements/actions";
// What happens after an application is in and the AI report is ready:
// owner conditional approval → first month's rent by e-transfer → SingleKey → move-in.
// Every step is a button for Ebin; the owner can also decide from their report link.
import { getSupabaseAdmin } from "@/lib/supabase";
import { signId, verifyId } from "@/lib/fieldops/engine";
import { decideApplication } from "@/lib/application-decision";
import { ownerReportEmail, rentRequestEmail, rentReceivedEmail } from "@/lib/application-emails";

const SITE = "https://www.prosperaproperties.co";
const EBIN = "prosperapropertiess@gmail.com";
export const DEFAULT_ETRANSFER_TO = EBIN;

export type Stage = "review" | "sent_to_owner" | "owner_approved" | "owner_declined" | "rent_requested" | "rent_received" | "screened" | "move_in" | "declined";

export const ownerReportUrl = (applicationId: string) => `${SITE}/owner-report/${signId("owner_report", applicationId)}`;
export const applicationIdFromOwnerToken = (token: string) => verifyId("owner_report", token);
export const rentReference = (applicationId: string) => `PP-${applicationId.replace(/-/g, "").slice(0, 6).toUpperCase()}`;

const db = () => getSupabaseAdmin();

async function sendEmail(to: string, subject: string, html: string, cc?: string[]) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not configured");
  const { Resend } = await import("resend");
  const { error } = await new Resend(key).emails.send({ from: "Prospera Properties <hello@prosperaproperties.co>", replyTo: EBIN, to, cc, subject, html });
  if (error) throw new Error(`Email failed: ${error.message}`);
}

async function load(id: string) {
  const { data } = await db().from("applications").select("*, properties(id, address, city, price)").eq("id", id).maybeSingle();
  if (!data) throw new Error("Application not found");
  return data;
}

const firstName = (n: string) => n.trim().split(/\s+/)[0] || "there";

/** Who owns the home, from the leasing campaign or onboarding, if we know. */
export async function knownOwner(propertyId: string): Promise<{ name: string | null; email: string | null }> {
  const { data: lp } = await db().from("leasing_properties").select("owner_name, owner_email").eq("property_id", propertyId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (lp?.owner_email) return { name: lp.owner_name, email: lp.owner_email };
  const { data: ob } = await db().from("onboarding_sessions").select("owner_name, owner_email").eq("property_id", propertyId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  return { name: ob?.owner_name ?? null, email: ob?.owner_email ?? null };
}

export async function sendToOwner(id: string, owner: { name: string; email: string }) {
  const a = await load(id);
  // Owner has a placement dashboard: put it there (with an email pointing to it) instead of a separate link.
  const pl = await placementForProperty(a.property_id);
  if (pl) {
    await releaseApplication(pl.id, id);
    return "dashboard" as const;
  }
  const summary = (a.ai_summary as { owner_summary?: string; headline?: string } | null);
  const { subject, html } = ownerReportEmail({
    ownerName: owner.name, applicant: a.tenant_name, address: a.properties?.address ?? "your property",
    reportUrl: ownerReportUrl(id), summary: summary?.owner_summary || summary?.headline || "The details are in the report.",
  });
  await sendEmail(owner.email, subject, html, [EBIN]);
  await db().from("applications").update({
    owner_name: owner.name || null, owner_email: owner.email, owner_sent_at: new Date().toISOString(), stage: "sent_to_owner", updated_at: new Date().toISOString(),
  }).eq("id", id);
}

export async function ownerDecision(id: string, decision: "approved" | "declined", note: string | null, by: "owner" | "admin") {
  const a = await load(id);
  await db().from("applications").update({
    stage: decision === "approved" ? "owner_approved" : "owner_declined",
    owner_decided_at: new Date().toISOString(), owner_note: note, updated_at: new Date().toISOString(),
  }).eq("id", id);
  await syncApplication(id, decision === "approved" ? "owner_approved" : "owner_declined");
  if (by === "owner") {
    await sendEmail(EBIN, `Owner ${decision === "approved" ? "conditionally approved" : "declined"} ${a.tenant_name} for ${a.properties?.address}`,
      `<p style="font-family:Arial;font-size:15px">${a.owner_name || "The owner"} ${decision === "approved" ? "<b>conditionally approved</b>" : "<b>declined</b>"} ${a.tenant_name} for ${a.properties?.address}.</p>${note ? `<p style="font-family:Arial;font-size:15px">Note: ${note.replace(/</g, "&lt;")}</p>` : ""}<p style="font-family:Arial;font-size:15px"><a href="${SITE}/admin/applications/${id}">Open the application</a></p>`,
    ).catch(() => {});
  }
}

export async function requestRent(id: string, o: { amount: number; to: string }) {
  const a = await load(id);
  const reference = rentReference(id);
  const { subject, html } = rentRequestEmail({ first: firstName(a.tenant_name), address: a.properties?.address ?? "the home", amount: o.amount, to: o.to, reference });
  await sendEmail(a.tenant_email, subject, html, [EBIN]);
  await db().from("applications").update({
    stage: "rent_requested", rent_amount_due: o.amount, rent_etransfer_to: o.to, rent_reference: reference,
    rent_requested_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }).eq("id", id);
  await syncApplication(id, "rent_requested");
}

export async function rentReceived(id: string) {
  const a = await load(id);
  const amount = Number(a.rent_amount_due ?? a.monthly_rent);
  const { subject, html } = rentReceivedEmail({ first: firstName(a.tenant_name), address: a.properties?.address ?? "the home", amount });
  await sendEmail(a.tenant_email, subject, html, [EBIN]);
  await db().from("applications").update({ stage: "rent_received", rent_received_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", id);
  await syncApplication(id, "rent_received");
}

export async function saveSingleKey(id: string, file: File) {
  const ext = (file.name.split(".").pop() || "pdf").toLowerCase().replace(/[^a-z]/g, "") || "pdf";
  const path = `applications/${id}/singlekey-${Date.now()}.${ext}`;
  const { error } = await db().storage.from("applications").upload(path, file, { contentType: file.type || "application/pdf" });
  if (error) throw new Error(error.message);
  await db().from("application_documents").insert({ application_id: id, doc_type: "singlekey_report", storage_path: path });
  await db().from("applications").update({ stage: "screened", singlekey_path: path, singlekey_done_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", id);
  await syncApplication(id, "screened");
}

/** Final approval + hands the home to the move-in coordinator (lease, keys, inspection). */
export async function startMoveIn(id: string) {
  const a = await load(id);
  const now = new Date().toISOString();
  const { data: lp } = await db().from("leasing_properties").select("id").eq("property_id", a.property_id).not("stage", "eq", "CLOSED").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (lp) {
    await db().from("leasing_properties").update({ stage: "LEASE_PENDING", status: "approved", stage_lease_pending_at: now, final_rent: a.monthly_rent, updated_at: now }).eq("id", lp.id);
  } else {
    await db().from("leasing_properties").insert({
      property_id: a.property_id, status: "approved", stage: "LEASE_PENDING", stage_lease_pending_at: now,
      asking_rent: Math.round(Number(a.monthly_rent)), final_rent: a.monthly_rent, owner_name: a.owner_name, owner_email: a.owner_email,
      notes: `Started from application: ${a.tenant_name} (${SITE}/admin/applications/${id})`,
    });
  }
  const r = await decideApplication(id, "approved");
  if (!r.ok) throw new Error(r.error);
  await db().from("applications").update({ stage: "move_in", move_in_started_at: now, updated_at: now }).eq("id", id);
  await syncApplication(id, "move_in");
}

export async function decline(id: string) {
  const r = await decideApplication(id, "rejected");
  if (!r.ok) throw new Error(r.error);
  await db().from("applications").update({ stage: "declined", updated_at: new Date().toISOString() }).eq("id", id);
  await syncApplication(id, "declined");
}
