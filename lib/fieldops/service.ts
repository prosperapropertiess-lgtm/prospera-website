// FieldOps actions: each one changes the appointment record first, then
// notifies only the people affected. Emails never decide state.

import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendApplicationInvite } from "@/lib/application-invite";
import { book, hashToken, loadCtx, loadPropertyRules, loadSettings, candidates, move, signId, LIVE, type Candidate } from "./engine";
import { send, T, SITE, ADMIN_EMAIL, type ApptInfo } from "./messages";
import { fmtDay, fmtTime } from "./time";

const sb = () => getSupabaseAdmin();

export const bookUrl = (tokenId: string) => `${SITE}/book/${signId("book", tokenId)}`;
export const manageUrl = (apptId: string) => `${SITE}/book/manage/${signId("manage", apptId)}`;
export const teamUrl = (apptId: string) => `${SITE}/team/showings/${apptId}`;

async function info(id: string) {
  const { data } = await sb().from("fo_appointments")
    .select("*, properties(address, city, price), agents(id, name, email, phone)").eq("id", id).single();
  if (!data) throw new Error("Appointment not found");
  const p = data.properties as { address: string; city: string; price: number };
  const a: ApptInfo = { id: data.id, address: p.address, city: p.city, starts_at: data.starts_at, ends_at: data.ends_at, tenant_name: data.tenant_name, tenant_phone: data.tenant_phone };
  return { row: data, appt: a, agent: data.agents as { id: string; name: string; email: string; phone: string | null } | null };
}

async function event(appointmentId: string | null, kind: string, actor: string, detail: Record<string, unknown> = {}, agentId: string | null = null) {
  await sb().from("fo_events").insert({ appointment_id: appointmentId, agent_id: agentId, kind, actor, detail });
}

// ── Invites ────────────────────────────────────────────────────────────────

export async function createInvite(viewingRequestId: string, opts: { email?: string | null; sendEmail?: boolean } = {}) {
  const { data: req } = await sb().from("viewing_requests").select("id, full_name, phone, email, property_id, property_snapshot").eq("id", viewingRequestId).maybeSingle();
  if (!req) throw new Error("Viewing request not found");
  if (!req.property_id) throw new Error("This request has no home attached");
  const rules = await loadPropertyRules(req.property_id);
  if (!rules.booking_enabled) throw new Error("Self-booking is off for this home. Turn it on in FieldOps → Homes first.");

  const settings = await loadSettings();
  // Revoke older live links for the same request, so only the newest works.
  await sb().from("fo_booking_tokens").update({ revoked_at: new Date().toISOString() }).eq("viewing_request_id", req.id).is("revoked_at", null);

  const id = crypto.randomUUID();
  const expires = new Date(Date.now() + settings.booking_link_days * 864e5);
  const email = opts.email ?? req.email;
  const { error } = await sb().from("fo_booking_tokens").insert({
    id, token_hash: hashToken(signId("book", id)), viewing_request_id: req.id, property_id: req.property_id,
    tenant_name: req.full_name, tenant_phone: req.phone, tenant_email: email, expires_at: expires.toISOString(),
  });
  if (error) throw new Error(error.message);

  const url = bookUrl(id);
  let delivery: string = "not_sent";
  if (opts.sendEmail !== false && email) {
    const home = req.property_snapshot as { address: string; city: string };
    const m = T.invite({ name: req.full_name, address: home.address, city: home.city, url, expires: fmtDay(expires) });
    delivery = await send({ to: email, ...m, template: "invite", key: `invite:${id}`, tokenId: id });
  }
  await sb().from("viewing_requests").update({ status: "contacted" }).eq("id", req.id).eq("status", "new");
  await event(null, "invited", "admin", { viewing_request_id: req.id, token_id: id, delivery });
  return { url, delivery, expires: expires.toISOString() };
}

/** Admin can also create a link for someone who didn't use the form (e.g. a call or text). */
export async function createDirectInvite(input: { propertyId: string; name: string; phone?: string | null; email?: string | null; sendEmail?: boolean }) {
  const rules = await loadPropertyRules(input.propertyId);
  if (!rules.booking_enabled) throw new Error("Self-booking is off for this home.");
  const settings = await loadSettings();
  const id = crypto.randomUUID();
  const expires = new Date(Date.now() + settings.booking_link_days * 864e5);
  const { data: home } = await sb().from("properties").select("address, city").eq("id", input.propertyId).single();
  const { error } = await sb().from("fo_booking_tokens").insert({
    id, token_hash: hashToken(signId("book", id)), property_id: input.propertyId,
    tenant_name: input.name, tenant_phone: input.phone ?? null, tenant_email: input.email ?? null, expires_at: expires.toISOString(),
  });
  if (error) throw new Error(error.message);
  const url = bookUrl(id);
  let delivery = "not_sent";
  if (input.sendEmail !== false && input.email && home) {
    const m = T.invite({ name: input.name, address: home.address, city: home.city, url, expires: fmtDay(expires) });
    delivery = await send({ to: input.email, ...m, template: "invite", key: `invite:${id}`, tokenId: id });
  }
  return { url, delivery, expires: expires.toISOString() };
}

export async function loadToken(tokenId: string) {
  const { data } = await sb().from("fo_booking_tokens").select("*").eq("id", tokenId).maybeSingle();
  if (!data) return { ok: false as const, error: "This link isn't valid." };
  if (data.revoked_at) return { ok: false as const, error: "This link was replaced by a newer one. Check your email for the latest link." };
  if (new Date(data.expires_at).getTime() < Date.now()) return { ok: false as const, error: "This link has expired. Reply to our email and we'll send a new one." };
  return { ok: true as const, token: data };
}

// ── Booking ────────────────────────────────────────────────────────────────

async function notifyBooked(apptId: string, updated = false) {
  const { appt, row, agent } = await info(apptId);
  const tag = `${apptId}:${row.starts_at}:${row.agent_id}`;
  const t = T.confirmed(appt, manageUrl(apptId), updated);
  await send({ to: row.tenant_email, ...t, template: updated ? "tenant_updated" : "tenant_confirmed", key: `confirm:${tag}`, appointmentId: apptId });
  if (agent) {
    const s = T.assigned(appt, teamUrl(apptId));
    await send({ to: agent.email, ...s, template: "specialist_assigned", key: `assigned:${tag}`, appointmentId: apptId, from: "Prospera FieldOps <hello@prosperaproperties.co>" });
  }
}

export async function bookFromToken(tokenId: string, start: Date) {
  const t = await loadToken(tokenId);
  if (!t.ok) return { ok: false as const, error: t.error };
  const { data: live } = await sb().from("fo_appointments").select("id").eq("booking_token_id", tokenId).in("status", [...LIVE]).maybeSingle();
  if (live) return { ok: false as const, error: "You already have a viewing booked. Use the link in your confirmation email to change it.", existing: live.id };

  const r = await book({
    propertyId: t.token.property_id, start, tokenId, requestId: t.token.viewing_request_id,
    name: t.token.tenant_name, phone: t.token.tenant_phone, email: t.token.tenant_email, createdBy: "tenant",
  });
  if (!r.ok) return { ok: false as const, error: r.error === "no_capacity" ? "Someone just took that time. Please pick another." : "Bookings for this home are paused right now." };

  if (t.token.viewing_request_id) await sb().from("viewing_requests").update({ status: "viewing_booked" }).eq("id", t.token.viewing_request_id);
  await notifyBooked(r.appointmentId);
  return { ok: true as const, appointmentId: r.appointmentId, manage: manageUrl(r.appointmentId) };
}

export async function adminBook(input: { propertyId: string; start: Date; name: string; phone?: string | null; email?: string | null; agentId?: string; notify?: boolean }) {
  const r = await book({ propertyId: input.propertyId, start: input.start, tokenId: null, requestId: null, name: input.name, phone: input.phone ?? null, email: input.email ?? null, createdBy: "admin", agentId: input.agentId });
  if (!r.ok) return { ok: false as const, error: r.error === "no_capacity" ? "No specialist can take that time (busy, travel, or daily limit)." : "Couldn't book that." };
  if (input.notify !== false) await notifyBooked(r.appointmentId);
  return { ok: true as const, appointmentId: r.appointmentId };
}

// ── Changes ────────────────────────────────────────────────────────────────

export async function cancel(apptId: string, actor: string, reason: string, opts: { notifyTenant?: boolean } = {}) {
  const { row, appt, agent } = await info(apptId);
  if (!(LIVE as readonly string[]).includes(row.status)) return { ok: false as const, error: "Already closed." };
  await sb().from("fo_appointments").update({ status: "cancelled", cancel_reason: reason, updated_at: new Date().toISOString() }).eq("id", apptId);
  await event(apptId, "cancelled", actor, { reason }, row.agent_id);

  if (opts.notifyTenant !== false) {
    let rebook: string | null = null;
    if (row.booking_token_id) {
      const tok = await loadToken(row.booking_token_id);
      if (tok.ok) rebook = bookUrl(row.booking_token_id);
    }
    const m = T.cancelled(appt, rebook);
    await send({ to: row.tenant_email, ...m, template: "tenant_cancelled", key: `cancel:${apptId}`, appointmentId: apptId });
  }
  if (agent) {
    const m = T.removed(appt);
    await send({ to: agent.email, ...m, template: "specialist_removed", key: `removed:${apptId}:${row.agent_id}:${row.starts_at}`, appointmentId: apptId });
  }
  if (actor === "tenant") {
    const m = T.admin({ title: `${appt.tenant_name} cancelled`, pill: "CANCELLED", tone: "grey", intro: `Viewing at ${appt.address} on ${fmtDay(appt.starts_at)}, ${fmtTime(appt.starts_at)}.` });
    await send({ to: ADMIN_EMAIL, ...m, template: "admin_cancelled", key: `admin-cancel:${apptId}`, appointmentId: apptId });
  }
  return { ok: true as const };
}

export async function reschedule(apptId: string, start: Date, actor: string) {
  const before = await info(apptId);
  const r = await move(apptId, { start, actor, reason: actor === "tenant" ? "tenant picked a new time" : undefined });
  if (!r.ok) return r;
  if (before.agent && before.agent.id !== r.agentId) {
    const m = T.removed(before.appt);
    await send({ to: before.agent.email, ...m, template: "specialist_removed", key: `removed:${apptId}:${before.agent.id}:${before.row.starts_at}`, appointmentId: apptId });
  }
  await notifyBooked(apptId, true);
  return r;
}

export async function reassign(apptId: string, agentId: string | null, actor: string, opts: { force?: boolean; reason?: string } = {}) {
  const before = await info(apptId);
  const r = await move(apptId, { agentId: agentId ?? undefined, actor, reason: opts.reason, force: opts.force });
  if (!r.ok) return r;
  if (before.agent && before.agent.id !== r.agentId) {
    const m = T.removed(before.appt);
    await send({ to: before.agent.email, ...m, template: "specialist_removed", key: `removed:${apptId}:${before.agent.id}:${before.row.starts_at}`, appointmentId: apptId });
  }
  const { appt, agent, row } = await info(apptId);
  if (agent) {
    const s = T.assigned(appt, teamUrl(apptId));
    await send({ to: agent.email, ...s, template: "specialist_assigned", key: `assigned:${apptId}:${row.starts_at}:${agent.id}`, appointmentId: apptId });
  }
  return r;
}

export async function replacementsFor(apptId: string): Promise<Candidate[]> {
  const { row } = await info(apptId);
  const rules = await loadPropertyRules(row.property_id);
  const ctx = await loadCtx(row.starts_at, row.ends_at);
  return candidates(ctx, row.property_id, new Date(row.starts_at), new Date(row.ends_at), rules.travel_buffer_min, apptId)
    .filter((c) => c.agentId !== row.agent_id);
}

/** A specialist can't make it: hand it to the best free replacement, or flag it for Ebin. */
export async function reportUnavailable(apptId: string, agentId: string, reason: string) {
  const { row, appt, agent } = await info(apptId);
  if (row.agent_id !== agentId) return { ok: false as const, error: "Not your showing." };
  await event(apptId, "unavailable", `specialist:${agentId}`, { reason }, agentId);
  const options = await replacementsFor(apptId);
  if (options.length) {
    const r = await reassign(apptId, options[0].agentId, "system", { reason: `${agent?.name ?? "Specialist"} couldn't make it; ${options[0].reason}` });
    if (r.ok) {
      const m = T.admin({ title: `Reassigned: ${appt.address}`, pill: "REASSIGNED", tone: "grey", intro: `${agent?.name ?? "A specialist"} can't make ${fmtDay(appt.starts_at)}, ${fmtTime(appt.starts_at)} (“${reason}”). It went to ${options[0].name}.` });
      await send({ to: ADMIN_EMAIL, ...m, template: "admin_reassigned", key: `admin-reassign:${apptId}:${row.starts_at}:${options[0].agentId}`, appointmentId: apptId });
      return { ok: true as const, reassigned: true };
    }
  }
  await sb().from("fo_appointments").update({ status: "reassignment_pending", updated_at: new Date().toISOString() }).eq("id", apptId);
  const m = T.admin({ title: `Needs a specialist: ${appt.address}`, pill: "ACTION NEEDED", intro: `${agent?.name ?? "A specialist"} can't make ${fmtDay(appt.starts_at)}, ${fmtTime(appt.starts_at)} (“${reason}”), and nobody else is free. Reassign it or reschedule with ${appt.tenant_name}${appt.tenant_phone ? ` (${appt.tenant_phone})` : ""}.` });
  await send({ to: ADMIN_EMAIL, ...m, template: "admin_unassigned", key: `admin-unassigned:${apptId}:${row.starts_at}`, appointmentId: apptId });
  return { ok: true as const, reassigned: false };
}

// ── Showing checklist and completion ───────────────────────────────────────

export const STEPS = ["reviewed", "arrived", "prepared", "shown", "secured", "followed_up"] as const;
export type Step = (typeof STEPS)[number];

export async function markStep(apptId: string, agentId: string, step: Step) {
  const { row } = await info(apptId);
  if (row.agent_id !== agentId) return { ok: false as const, error: "Not your showing." };
  const { data: cl } = await sb().from("fo_checklists").select("steps").eq("appointment_id", apptId).maybeSingle();
  const steps = { ...((cl?.steps as Record<string, string>) ?? {}), [step]: new Date().toISOString() };
  await sb().from("fo_checklists").upsert({ appointment_id: apptId, steps, updated_at: new Date().toISOString() });
  if (step === "arrived" && row.status === "confirmed") {
    await sb().from("fo_appointments").update({ status: "in_progress", updated_at: new Date().toISOString() }).eq("id", apptId);
  }
  await event(apptId, `step:${step}`, `specialist:${agentId}`, {}, agentId);
  return { ok: true as const, steps };
}

export interface Report {
  outcome: "showed" | "no_show" | "tenant_cancelled_on_site" | "could_not_access";
  interest?: "high" | "medium" | "low" | "none" | null;
  concerns?: string[];
  secured: boolean;
  issue?: string | null;
  notes?: string | null;
  sendApplication?: boolean;
}

export async function complete(apptId: string, agentId: string, rep: Report) {
  const { row, appt } = await info(apptId);
  if (row.agent_id !== agentId) return { ok: false as const, error: "Not your showing." };
  if (!["confirmed", "in_progress"].includes(row.status)) return { ok: false as const, error: "This showing is already closed." };
  if (rep.outcome === "showed" && !rep.secured) return { ok: false as const, error: "Confirm the home is locked up, or report the issue." };

  const now = new Date().toISOString();
  const { data: cl } = await sb().from("fo_checklists").select("steps").eq("appointment_id", apptId).maybeSingle();
  const steps = { ...((cl?.steps as Record<string, string>) ?? {}) };
  if (rep.secured && !steps.secured) steps.secured = now;
  await sb().from("fo_checklists").upsert({
    appointment_id: apptId, steps, outcome: rep.outcome, interest: rep.interest ?? null, concerns: rep.concerns ?? [],
    secured: rep.secured, issue: rep.issue ?? null, notes: rep.notes ?? null, completed_at: now, updated_at: now,
  });

  const status = rep.outcome === "no_show" ? "no_show" : "completed";
  await sb().from("fo_appointments").update({ status, updated_at: now }).eq("id", apptId);
  await event(apptId, "completed", `specialist:${agentId}`, { outcome: rep.outcome, interest: rep.interest }, agentId);

  // Pay: one showing fee per completed household appointment (or per home visit, per settings).
  const settings = await loadSettings();
  const { data: ag } = await sb().from("agents").select("showing_fee").eq("id", agentId).single();
  const fee = Number(ag?.showing_fee ?? settings.showing_fee);
  let payable = rep.outcome === "showed" || rep.outcome === "no_show";
  if (payable && settings.pay_basis === "visit") {
    // Only the first showing in a back-to-back run at the same home is paid.
    const { data: prev } = await sb().from("fo_earnings").select("id, fo_appointments!inner(property_id, starts_at)")
      .eq("agent_id", agentId).eq("kind", "showing").neq("status", "reversed")
      .eq("fo_appointments.property_id", row.property_id)
      .gte("fo_appointments.starts_at", new Date(new Date(row.starts_at).getTime() - 90 * 60_000).toISOString())
      .lt("fo_appointments.starts_at", row.starts_at);
    if (prev?.length) payable = false;
  }
  if (payable) {
    await sb().from("fo_earnings").insert({
      agent_id: agentId, appointment_id: apptId, kind: "showing", amount: fee, status: "pending",
      rate_snapshot: { fee, pay_basis: settings.pay_basis, outcome: rep.outcome },
    });
  }

  // Thank-you + application link, through the existing application invite.
  if (rep.outcome === "showed" && rep.sendApplication !== false && row.tenant_email) {
    const key = `apply:${apptId}`;
    const { data: done } = await sb().from("fo_messages").select("status").eq("idempotency_key", key).maybeSingle();
    if (done?.status !== "sent") {
      try {
        await sendApplicationInvite(row.property_id, row.tenant_name, row.tenant_email);
        await sb().from("fo_messages").upsert({ appointment_id: apptId, recipient: row.tenant_email, template: "application_link", status: "sent", idempotency_key: key }, { onConflict: "idempotency_key" });
        await sb().from("fo_appointments").update({ status: "followed_up", updated_at: new Date().toISOString() }).eq("id", apptId);
        steps.followed_up = new Date().toISOString();
        await sb().from("fo_checklists").update({ steps }).eq("appointment_id", apptId);
      } catch (err) {
        await sb().from("fo_messages").upsert({ appointment_id: apptId, recipient: row.tenant_email, template: "application_link", status: "failed", error: err instanceof Error ? err.message : String(err), idempotency_key: key }, { onConflict: "idempotency_key" });
      }
    }
  }

  if (rep.issue || rep.outcome === "could_not_access" || !rep.secured) {
    const m = T.admin({ title: `Issue at ${appt.address}`, pill: "CHECK THIS", intro: rep.issue || (rep.outcome === "could_not_access" ? "The specialist couldn't get in." : "The specialist couldn't confirm the home is locked up."), rows: [["Showing", `${fmtDay(appt.starts_at)}, ${fmtTime(appt.starts_at)}`]] });
    await send({ to: ADMIN_EMAIL, ...m, template: "admin_issue", key: `admin-issue:${apptId}`, appointmentId: apptId });
  }
  return { ok: true as const, status };
}

/** Admin marks that this tenant signed. Creates a pending bonus only if bonuses are switched on. */
export async function markLeaseSigned(apptId: string, rent: number) {
  const { row } = await info(apptId);
  await sb().from("fo_appointments").update({ lease_signed_at: new Date().toISOString() }).eq("id", apptId);
  await event(apptId, "lease_signed", "admin", { rent });
  const settings = await loadSettings();
  if (!settings.bonus_enabled || !row.agent_id) return { ok: true as const, bonus: null };
  const amount = Math.round(rent * settings.bonus_pct) / 100;
  const { error } = await sb().from("fo_earnings").insert({
    agent_id: row.agent_id, appointment_id: apptId, kind: "lease_bonus", amount, status: "pending",
    rate_snapshot: { monthly_rent: rent, pct: settings.bonus_pct },
    note: "Pending until the lease and first payment are verified.",
  });
  return { ok: true as const, bonus: error ? null : amount };
}
