// Tenant placement client dashboard: shared server logic.
// Every read and write goes through the service-role client after checking the
// owner's private link (or the admin session), so owners only ever see their
// own placements and only files marked for client access.

import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";

export const SITE = "https://www.prosperaproperties.co";
export const ADMIN_EMAIL = "prosperapropertiess@gmail.com";
export const db = () => getSupabaseAdmin();

export const STAGES = [
  { key: "onboarding", label: "Onboarding" },
  { key: "preparation", label: "Property Preparation" },
  { key: "marketing", label: "Marketing" },
  { key: "showings", label: "Showings" },
  { key: "application_review", label: "Application Review" },
  { key: "verification", label: "Verification" },
  { key: "lease_move_in", label: "Lease & Move-In" },
  { key: "completed", label: "Completed" },
] as const;
export type StageKey = (typeof STAGES)[number]["key"];

export const PREP_ITEMS = [
  { key: "walkthrough", label: "Property walkthrough", fileKind: "walkthrough" },
  { key: "photos", label: "Property photos", fileKind: "photo" },
  { key: "lawn_sign", label: "Lawn sign", fileKind: null },
  { key: "floor_plan", label: "Floor plan", fileKind: "floor_plan" },
  { key: "listing", label: "Listing published", fileKind: null },
] as const;
export type PrepKey = (typeof PREP_ITEMS)[number]["key"];

export const NEXT_STEPS = [
  { no: 1, title: "Full verification", responsible: "Prospera" },
  { no: 2, title: "Final approval to prepare the lease", responsible: "Prospera" },
  { no: 3, title: "Lease agreement preparation and signing", responsible: "Prospera, owner and tenant" },
  { no: 4, title: "Collection and confirmation of required payments", responsible: "Prospera" },
  { no: 5, title: "Move-in day scheduling", responsible: "Prospera" },
  { no: 6, title: "Move-in inspection", responsible: "Prospera" },
  { no: 7, title: "Keys handover", responsible: "Prospera" },
  { no: 8, title: "Placement completed", responsible: "Prospera" },
] as const;

export const DECLINE_REASONS = [
  "Income doesn't cover the rent comfortably",
  "Rental history or references",
  "Move-in date doesn't work",
  "Number of people for the size of the home",
  "Lease terms requested don't work",
  "I'd like to see other applicants first",
  "Other",
];

// Words that can point to a reason the Ontario Human Rights Code doesn't allow.
// A match only flags the decision for Admin review; it never blocks the owner.
const PROTECTED_HINTS = [
  "child", "kid", "baby", "pregnan", "family", "single mom", "single mother", "single dad", "married", "divorc", "wife", "husband",
  "religio", "church", "mosque", "temple", "muslim", "christian", "jewish", "hindu", "sikh", "race", "black", "white", "asian", "indian",
  "arab", "accent", "immigra", "newcomer", "citizen", "refugee", "foreign", "country", "origin", "ethnic", "colour", "color", "gay",
  "lesbian", "trans", "gender", "sexual", "age", "old", "young", "senior", "disab", "wheelchair", "mental", "odsp",
  "ontario works", "welfare", "social assistance", "assistance", "benefits",
];
export function protectedFlag(text: string): string | null {
  const t = ` ${text.toLowerCase()} `;
  const hit = PROTECTED_HINTS.find((w) => (w.length <= 4 ? new RegExp(`\\b${w}\\b`).test(t) : t.includes(w)));
  return hit ? `Mentions "${hit}". Check this isn't a reason the Human Rights Code protects.` : null;
}

export const newToken = () => crypto.randomBytes(24).toString("base64url");
export const dashboardUrl = (token: string, placementId?: string) => `${SITE}/client/${token}${placementId ? `/${placementId}` : ""}`;

export async function accountByToken(token: string) {
  if (!token || token.length < 20) return null;
  const { data } = await db().from("client_accounts").select("*").eq("token", token).is("revoked_at", null).maybeSingle();
  return data as null | { id: string; token: string; name: string; email: string | null; phone: string | null; is_demo: boolean; intro_seen_at: string | null };
}

export async function event(placementId: string, kind: string, actor: string, detail: Record<string, unknown> = {}) {
  await db().from("placement_events").insert({ placement_id: placementId, kind, actor, detail });
}

/** Sends once per idempotency key, logs every attempt, and can be retried from Admin. */
export async function sendLogged(o: { placementId: string | null; kind: string; to: string; subject: string; html: string; key: string; cc?: string[] }) {
  const { data: prior } = await db().from("placement_emails").select("id, status, attempts").eq("idempotency_key", o.key).maybeSingle();
  if (prior?.status === "sent") return "duplicate" as const;
  let id = prior?.id as string | undefined;
  if (!id) {
    const { data } = await db().from("placement_emails").insert({ placement_id: o.placementId, kind: o.kind, recipient: o.to, subject: o.subject, html: o.html, idempotency_key: o.key }).select("id").single();
    id = data!.id;
  }
  return deliver(id!, o.cc);
}

export async function deliver(emailId: string, cc?: string[]) {
  const { data: e } = await db().from("placement_emails").select("*").eq("id", emailId).single();
  if (!e) return "failed" as const;
  try {
    const { Resend } = await import("resend");
    const { data, error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: "Prospera Properties <hello@prosperaproperties.co>", replyTo: ADMIN_EMAIL, to: [e.recipient], cc, subject: e.subject, html: e.html,
    });
    if (error || !data?.id) throw new Error(error?.message ?? "No id returned");
    await db().from("placement_emails").update({ status: "sent", provider_id: data.id, error: null, attempts: e.attempts + 1, sent_at: new Date().toISOString() }).eq("id", emailId);
    return "sent" as const;
  } catch (err) {
    await db().from("placement_emails").update({ status: "failed", error: err instanceof Error ? err.message : String(err), attempts: e.attempts + 1 }).eq("id", emailId);
    return "failed" as const;
  }
}

/**
 * Where a placement is, worked out from what's actually recorded:
 * prep items, the listing, showings, released applications and the next-steps timeline.
 */
export async function computeStage(p: { id: string; property_id: string | null; agreement_signed_at: string | null; completed_at: string | null; stage_override: string | null }) {
  if (p.completed_at) return "completed" as StageKey;
  if (p.stage_override && STAGES.some((s) => s.key === p.stage_override)) return p.stage_override as StageKey;
  const [{ data: prep }, { data: reviews }, showings] = await Promise.all([
    db().from("placement_prep").select("item, status").eq("placement_id", p.id),
    db().from("placement_reviews").select("id, status").eq("placement_id", p.id),
    p.property_id
      ? db().from("fo_appointments").select("id", { count: "exact", head: true }).eq("property_id", p.property_id).gte("created_at", p.agreement_signed_at ?? "2000-01-01")
      : Promise.resolve({ count: 0 }),
  ]);
  const approved = (reviews ?? []).filter((r) => r.status === "approved" || r.status === "completed");
  if (approved.length) {
    const { data: steps } = await db().from("placement_steps").select("step_no, status").in("review_id", approved.map((r) => r.id));
    const done = (n: number) => (steps ?? []).some((s) => s.step_no === n && s.status === "done");
    if (done(8)) return "completed";
    if (done(2)) return "lease_move_in";
    return "verification";
  }
  if ((reviews ?? []).some((r) => r.status === "released" || r.status === "clarification" || r.status === "declined")) return "application_review";
  if ((showings.count ?? 0) > 0) return "showings";
  if ((prep ?? []).some((r) => r.item === "listing" && r.status === "completed")) return "marketing";
  if (p.agreement_signed_at) return "preparation";
  return "onboarding";
}

/** Monday of the week containing `d` (Toronto calendar date). */
export function weekOf(d = new Date()) {
  const day = new Date(d.toLocaleDateString("en-CA", { timeZone: "America/Toronto" }) + "T12:00:00Z");
  const dow = (day.getUTCDay() + 6) % 7;
  const start = new Date(day.getTime() - dow * 864e5);
  const end = new Date(start.getTime() + 6 * 864e5);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}
