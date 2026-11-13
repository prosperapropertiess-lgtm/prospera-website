// Viewing sessions: one specialist, one home, the prospects booked back to back.
// The specialist works a session top to bottom: prepare the home, one viewing
// checklist per prospect, then a closing checklist that completes the cycle.

import { getSupabaseAdmin } from "@/lib/supabase";
import { complete, sendApplicationFor, type Report } from "./service";
import { send, SITE, ADMIN_EMAIL } from "./messages";
import { fmtDay, fmtTime, localParts } from "./time";

const sb = () => getSupabaseAdmin();
const GAP_MIN = 60; // a prospect starting within an hour of the last one is the same visit

export const PREP_ITEMS = [
  { id: "arrived_early", title: "Arrive 15 minutes before the first prospect" },
  { id: "reviewed_list", title: "Review who's coming and their names" },
  { id: "blinds", title: "Open curtains and blinds for natural light" },
  { id: "windows", title: "Open windows if the weather allows" },
  { id: "freshener", title: "Light air freshener, only if needed" },
  { id: "lights", title: "Lights on, home ready to show" },
] as const;

export const SECURE_ITEMS = [
  { id: "visitors_left", title: "All visitors have left" },
  { id: "windows_locked", title: "Windows closed and locked" },
  { id: "settings_restored", title: "Curtains, blinds and lights back to how they were" },
  { id: "doors_locked", title: "Doors locked" },
  { id: "keys_returned", title: "Keys returned, lockbox secured" },
] as const;

export type Attendance = "attended" | "no_show" | "cancelled" | "access_issue";
export interface ProspectFeedback {
  attendance?: Attendance;
  name_confirmed?: boolean;
  move_in?: string;
  tour?: "self" | "guided";
  seen_count?: string;          // 1. How many properties have you seen so far?
  compare?: string;             // 2. How does this compare with the others?
  liked?: string;               // 3. What do you like about this property?
  blocker?: string;             // 4. Is anything stopping you from applying?
  interest?: "interested" | "unsure" | "not_interested";
  main_concern?: string;
  questions?: string;           // questions requiring an answer / admin follow-up
  comments?: string;
}

export interface Closing {
  likely_id?: string;           // appointment id of the most likely applicant
  likely_why?: string;
  repeated_concerns?: string;
  improve?: string;
  other?: string;
  condition?: string;
  secure?: Record<string, string>;
  secured?: boolean;            // Property secured and keys returned
}

type ApptRow = {
  id: string; agent_id: string; property_id: string; starts_at: string; ends_at: string; status: string;
  tenant_name: string; tenant_phone: string | null; tenant_email: string | null; viewing_request_id: string | null;
};

const LIVE_OR_DONE = ["confirmed", "in_progress", "completed", "followed_up", "no_show", "cancelled", "failed"];

/** The session that includes this appointment: same specialist, same home, starts within an hour of each other. */
export async function sessionFor(agentId: string, apptId: string) {
  const { data: a } = await sb().from("fo_appointments").select("id, agent_id, property_id, starts_at").eq("id", apptId).eq("agent_id", agentId).maybeSingle();
  if (!a) return null;
  const day = localParts(new Date(a.starts_at)).day;
  const from = new Date(new Date(a.starts_at).getTime() - 12 * 3_600_000).toISOString();
  const to = new Date(new Date(a.starts_at).getTime() + 12 * 3_600_000).toISOString();
  const { data: rows } = await sb().from("fo_appointments")
    .select("id, agent_id, property_id, starts_at, ends_at, status, tenant_name, tenant_phone, tenant_email, viewing_request_id")
    .eq("agent_id", agentId).eq("property_id", a.property_id).gte("starts_at", from).lte("starts_at", to)
    .in("status", LIVE_OR_DONE).order("starts_at");
  const sameDay = ((rows ?? []) as ApptRow[]).filter((r) => localParts(new Date(r.starts_at)).day === day);
  // Split the day into visits wherever there's a gap of more than an hour.
  const groups: ApptRow[][] = [];
  for (const r of sameDay) {
    const last = groups[groups.length - 1];
    const lastEnd = last ? Math.max(...last.map((x) => new Date(x.ends_at).getTime())) : 0;
    if (last && new Date(r.starts_at).getTime() - lastEnd <= GAP_MIN * 60_000) last.push(r); else groups.push([r]);
  }
  const members = groups.find((g) => g.some((r) => r.id === apptId)) ?? [];
  if (!members.length) return null;
  const key = `${agentId}:${a.property_id}:${members[0].starts_at}`;
  return { key, members, propertyId: a.property_id as string };
}

/** Group a specialist's appointments into sessions for the Field Ops list. */
export function groupIntoSessions<T extends { id: string; property_id: string; starts_at: string; ends_at: string }>(rows: T[]): T[][] {
  const sorted = [...rows].sort((x, y) => x.starts_at.localeCompare(y.starts_at));
  const out: T[][] = [];
  for (const r of sorted) {
    const g = out.find((s) => s[0].property_id === r.property_id
      && localParts(new Date(s[0].starts_at)).day === localParts(new Date(r.starts_at)).day
      && new Date(r.starts_at).getTime() - Math.max(...s.map((x) => new Date(x.ends_at).getTime())) <= GAP_MIN * 60_000);
    if (g) g.push(r); else out.push([r]);
  }
  return out;
}

async function sessionRow(key: string) {
  const { data } = await sb().from("fo_sessions").select("*").eq("session_key", key).maybeSingle();
  return data as null | { id: string; prep: Record<string, string>; closing: Closing; secured: boolean | null; completed_at: string | null };
}

async function ensureSession(agentId: string, s: NonNullable<Awaited<ReturnType<typeof sessionFor>>>) {
  const existing = await sessionRow(s.key);
  if (existing) return existing;
  await sb().from("fo_sessions").upsert({ session_key: s.key, agent_id: agentId, property_id: s.propertyId, starts_at: s.members[0].starts_at, appointment_ids: s.members.map((m) => m.id) }, { onConflict: "session_key" });
  return (await sessionRow(s.key))!;
}

/** Was the application link sent, and did a completed application come back? */
async function applicationStatus(members: ApptRow[], propertyId: string) {
  const ids = members.map((m) => m.id);
  const emails = members.map((m) => m.tenant_email?.toLowerCase()).filter(Boolean) as string[];
  const [{ data: invites }, { data: apps }] = await Promise.all([
    sb().from("application_invites").select("appointment_id, email, sent_at, application_id").or(`appointment_id.in.(${ids.join(",")}),and(property_id.eq.${propertyId},email.in.(${emails.map((e) => `"${e}"`).join(",") || '""'}))`),
    emails.length ? sb().from("applications").select("id, tenant_email, created_at").eq("property_id", propertyId).in("tenant_email", emails) : Promise.resolve({ data: [] as { id: string; tenant_email: string; created_at: string }[] }),
  ]);
  const out: Record<string, { sent_at: string | null; received: boolean }> = {};
  for (const m of members) {
    const e = m.tenant_email?.toLowerCase();
    const inv = (invites ?? []).find((i) => i.appointment_id === m.id) ?? (invites ?? []).find((i) => e && i.email === e);
    const app = (apps ?? []).find((x) => x.tenant_email === e);
    out[m.id] = { sent_at: inv?.sent_at ?? null, received: !!(inv?.application_id || app) };
  }
  return out;
}

export async function loadSessionView(agentId: string, apptId: string) {
  const s = await sessionFor(agentId, apptId);
  if (!s) return null;
  const row = await ensureSession(agentId, s);
  const ids = s.members.map((m) => m.id);
  const vrIds = s.members.map((m) => m.viewing_request_id).filter(Boolean) as string[];
  const [{ data: prop }, { data: rules }, { data: cls }, { data: vrs }, apps] = await Promise.all([
    sb().from("properties").select("id, slug, address, unit_number, city, price, bedrooms, bathrooms, access_instructions, occupancy, showing_notes").eq("id", s.propertyId).single(),
    sb().from("fo_property_rules").select("access_instructions, highlights, occupied").eq("property_id", s.propertyId).maybeSingle(),
    sb().from("fo_checklists").select("appointment_id, feedback, outcome, completed_at").in("appointment_id", ids),
    vrIds.length ? sb().from("viewing_requests").select("id, move_in_date").in("id", vrIds) : Promise.resolve({ data: [] as { id: string; move_in_date: string | null }[] }),
    applicationStatus(s.members, s.propertyId),
  ]);
  const first = s.members[0];
  const last = s.members[s.members.length - 1];
  // Access details and phone numbers open the day before and close two hours after.
  const open = Date.now() >= new Date(first.starts_at).getTime() - 24 * 3_600_000 && Date.now() <= new Date(last.ends_at).getTime() + 2 * 3_600_000;
  const closed = !!row.completed_at;
  return {
    id: apptId,
    key: s.key,
    startsAt: first.starts_at,
    endsAt: last.ends_at,
    completedAt: row.completed_at,
    home: {
      address: prop!.address, unit: prop!.unit_number, city: prop!.city, price: Number(prop!.price), bedrooms: prop!.bedrooms, bathrooms: prop!.bathrooms,
      brief: `/brief/${prop!.slug ?? prop!.id}`,
      occupied: rules?.occupied ?? prop!.occupancy === "occupied",
      access: open ? rules?.access_instructions ?? prop!.access_instructions ?? null : null,
      accessOpensAt: open ? null : new Date(new Date(first.starts_at).getTime() - 24 * 3_600_000).toISOString(),
      notes: rules?.highlights ?? prop!.showing_notes ?? null,
    },
    prep: row.prep ?? {},
    closing: row.closing ?? {},
    prospects: s.members.map((m) => {
      const cl = (cls ?? []).find((c) => c.appointment_id === m.id);
      const fb = (cl?.feedback ?? {}) as ProspectFeedback;
      const vr = (vrs ?? []).find((v) => v.id === m.viewing_request_id);
      return {
        id: m.id, name: m.tenant_name, phone: open && !closed ? m.tenant_phone : null, hasEmail: !!m.tenant_email,
        startsAt: m.starts_at, status: m.status, done: !!cl?.completed_at,
        moveIn: fb.move_in ?? vr?.move_in_date ?? null,
        feedback: fb,
        application: apps[m.id],
      };
    }),
  };
}

export async function togglePrep(agentId: string, apptId: string, item: string) {
  const s = await sessionFor(agentId, apptId);
  if (!s || !PREP_ITEMS.some((p) => p.id === item)) return { ok: false as const, error: "Not found." };
  const row = await ensureSession(agentId, s);
  const prep = { ...(row.prep ?? {}) };
  if (prep[item]) delete prep[item]; else prep[item] = new Date().toISOString();
  await sb().from("fo_sessions").update({ prep, updated_at: new Date().toISOString() }).eq("session_key", s.key);
  // The first tick means they're on site: mark the showings as happening now.
  if (Object.keys(prep).length === 1) {
    await sb().from("fo_appointments").update({ status: "in_progress", updated_at: new Date().toISOString() }).in("id", s.members.filter((m) => m.status === "confirmed").map((m) => m.id));
  }
  return { ok: true as const };
}

export async function saveProspect(agentId: string, apptId: string, fb: ProspectFeedback) {
  const { data: a } = await sb().from("fo_appointments").select("id").eq("id", apptId).eq("agent_id", agentId).maybeSingle();
  if (!a) return { ok: false as const, error: "Not your showing." };
  const { data: cl } = await sb().from("fo_checklists").select("feedback, completed_at").eq("appointment_id", apptId).maybeSingle();
  if (cl?.completed_at) return { ok: false as const, error: "This prospect's checklist is already submitted." };
  const clean = Object.fromEntries(Object.entries(fb).map(([k, v]) => [k, typeof v === "string" ? v.slice(0, 1500) : v]));
  await sb().from("fo_checklists").upsert({ appointment_id: apptId, feedback: { ...((cl?.feedback as object) ?? {}), ...clean }, updated_at: new Date().toISOString() });
  return { ok: true as const };
}

export async function sendProspectApplication(agentId: string, agentName: string, apptId: string) {
  return sendApplicationFor({ appointmentId: apptId, onlyAgentId: agentId, sentBy: agentId, senderName: agentName });
}

/** What still blocks closing the session, in plain words. */
export function closeProblems(view: NonNullable<Awaited<ReturnType<typeof loadSessionView>>>, closing: Closing): string[] {
  const out: string[] = [];
  for (const p of view.prospects) {
    if (p.done) continue;
    const f = p.feedback;
    if (!f.attendance) out.push(`Mark whether ${p.name} came.`);
    else if (f.attendance === "attended" && (!f.interest || !f.seen_count || !f.liked || !f.blocker)) out.push(`Finish the four questions and interest for ${p.name}.`);
  }
  if (closing.secured === undefined) out.push("Answer: property secured and keys returned?");
  if (closing.secured && SECURE_ITEMS.some((i) => !closing.secure?.[i.id])) out.push("Tick every item in Secure the property.");
  return out;
}

const INTEREST_MAP: Record<string, Report["interest"]> = { interested: "high", unsure: "medium", not_interested: "none" };
const OUTCOME_MAP: Record<Attendance, Report["outcome"]> = { attended: "showed", no_show: "no_show", cancelled: "cancelled", access_issue: "could_not_access" };

export async function closeSession(agentId: string, agentName: string, apptId: string, closing: Closing) {
  const view = await loadSessionView(agentId, apptId);
  if (!view) return { ok: false as const, error: "Not found." };
  if (view.completedAt) return { ok: false as const, error: "This viewing is already closed." };
  const problems = closeProblems(view, closing);
  if (problems.length) return { ok: false as const, error: problems[0] };

  for (const p of view.prospects) {
    if (p.done || !["confirmed", "in_progress"].includes(p.status)) continue;
    const f = p.feedback;
    const notes = [f.questions && `Questions: ${f.questions}`, f.comments && `Comments: ${f.comments}`].filter(Boolean).join("\n") || null;
    const r = await complete(p.id, agentId, {
      outcome: OUTCOME_MAP[f.attendance!], interest: f.attendance === "attended" ? INTEREST_MAP[f.interest ?? ""] ?? null : null,
      concerns: f.main_concern ? [f.main_concern] : [], secured: !!closing.secured, issue: f.attendance === "access_issue" ? "Couldn't get in for this prospect." : null,
      notes, sendApplication: false, // sent from the prospect's checklist, never automatically here
    });
    if (!r.ok) return { ok: false as const, error: `${p.name}: ${r.error}` };
  }

  const now = new Date().toISOString();
  await sb().from("fo_sessions").update({ closing, secured: !!closing.secured, completed_at: now, updated_at: now }).eq("session_key", view.key);
  await emailReport(agentName, await loadSessionView(agentId, apptId), closing);
  return { ok: true as const };
}

const esc = (s: string | null | undefined) => (s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
const ATT: Record<string, string> = { attended: "Attended", no_show: "No-show", cancelled: "Cancelled", access_issue: "Access issue" };
const INT: Record<string, string> = { interested: "Interested", unsure: "Unsure", not_interested: "Not interested" };

async function emailReport(agentName: string, v: Awaited<ReturnType<typeof loadSessionView>>, c: Closing) {
  if (!v) return;
  const counts = { scheduled: v.prospects.length, attended: 0, no_show: 0, cancelled: 0, access_issue: 0 } as Record<string, number>;
  for (const p of v.prospects) if (p.feedback.attendance) counts[p.feedback.attendance]++;
  const likely = v.prospects.find((p) => p.id === c.likely_id);
  const row = (k: string, val: string | null | undefined) => (val ? `<tr><td style="padding:6px 10px;color:#666;font-size:13px;vertical-align:top;width:42%">${k}</td><td style="padding:6px 10px;font-size:14px;color:#222">${esc(val)}</td></tr>` : "");
  const when = `${fmtDay(v.startsAt)}, ${fmtTime(v.startsAt)}`;
  const prospects = v.prospects.map((p) => {
    const f = p.feedback;
    const att = f.attendance === "attended";
    return `<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E8E8E8;border-radius:10px;margin:0 0 14px;background:#FAFAFA">
      <tr><td colspan="2" style="padding:10px;font-weight:700;font-size:15px;color:#222">${esc(p.name)} · ${fmtTime(p.startsAt)}</td></tr>
      ${row("Outcome", ATT[f.attendance ?? ""] ?? "Not recorded")}
      ${att ? row("Interest", INT[f.interest ?? ""]) : ""}
      ${row("Intended move-in", f.move_in ?? p.moveIn ?? "")}
      ${att ? row("Properties seen so far", f.seen_count) + row("Compared with others", f.compare) + row("What they liked", f.liked) + row("Stopping them from applying", f.blocker) + row("Main concern", f.main_concern) : ""}
      ${row("Questions needing an answer", f.questions)}
      ${row("Application link sent", p.application?.sent_at ? `Yes, ${fmtTime(p.application.sent_at)}` : "No")}
      ${row("Completed application", p.application?.received ? "Yes" : "Not yet")}
      ${row("Specialist comments", f.comments)}
    </table>`;
  }).join("");
  const html = `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:620px;margin:0 auto;padding:24px;color:#222">
    <div style="font-size:11px;font-weight:700;letter-spacing:0.6px;color:#777">VIEWING REPORT</div>
    <h1 style="font-size:24px;margin:6px 0 4px">${esc(v.home.address)}${v.home.unit ? `, ${esc(v.home.unit)}` : ""}</h1>
    <p style="margin:0 0 16px;color:#555;font-size:14px">${when} · ${esc(agentName)}</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E8E8E8;border-radius:10px;margin:0 0 18px">
      ${row("Scheduled", String(counts.scheduled))}${row("Attended", String(counts.attended))}${row("No-shows", String(counts.no_show))}${row("Cancelled", String(counts.cancelled))}${counts.access_issue ? row("Access issues", String(counts.access_issue)) : ""}
      ${row("Property secured and keys returned", c.secured ? "Yes" : "NO. Follow up now")}
    </table>
    <h2 style="font-size:16px;margin:0 0 8px">Specialist's feedback</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E8E8E8;border-radius:10px;margin:0 0 18px">
      ${row("Most likely to apply", likely?.name ?? "None stood out")}${row("Why", c.likely_why)}${row("Concerns that came up repeatedly", c.repeated_concerns)}
      ${row("What could improve viewings", c.improve)}${row("Other comments", c.other)}${row("Property condition or maintenance", c.condition)}
    </table>
    <h2 style="font-size:16px;margin:0 0 8px">Each prospect</h2>
    ${prospects}
    <p style="font-size:13px"><a href="${SITE}/admin/fieldops" style="color:#1F2F3A">Open FieldOps</a></p>
  </div>`;
  await send({
    to: ADMIN_EMAIL, subject: `${c.secured ? "" : "NOT SECURED · "}Viewing report: ${v.home.address}, ${when} (${counts.attended}/${counts.scheduled} came)`,
    html, template: "admin_session_report", key: `session-report:${v.key}`, appointmentId: v.prospects[0]?.id ?? null,
  });
}
