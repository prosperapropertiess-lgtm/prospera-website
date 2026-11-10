// The scheduling engine. Turns specialist availability + home booking rules
// into bookable times, picks the best specialist for a time, and books it
// atomically through the fo_try_book database function.

import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { addDays, localParts, todayToronto, weekdayOf, zonedToUtc } from "./time";

export const LIVE = ["confirmed", "in_progress", "reassignment_pending"] as const;

export interface Settings {
  pay_basis: "household" | "visit";
  showing_fee: number;
  bonus_enabled: boolean;
  bonus_pct: number;
  reminder_hours: number[];
  booking_link_days: number;
  weight_batch: number;
  weight_fair: number;
  weight_reliable: number;
  weight_travel: number;
}

export interface Window { weekday: number; start_min: number; end_min: number }

export interface PropertyRules {
  property_id: string;
  booking_enabled: boolean;
  duration_min: number;
  travel_buffer_min: number;
  min_notice_hours: number;
  horizon_days: number;
  max_per_slot: number;
  windows: Window[];
  occupied: boolean;
  access_instructions: string | null;
  highlights: string | null;
}

export const DEFAULT_RULES: Omit<PropertyRules, "property_id"> = {
  booking_enabled: false, duration_min: 20, travel_buffer_min: 20, min_notice_hours: 12, horizon_days: 14,
  max_per_slot: 1, windows: [], occupied: false, access_instructions: null, highlights: null,
};

// No windows set = every day, 9am to 8pm.
export const DEFAULT_WINDOWS: Window[] = [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({ weekday, start_min: 9 * 60, end_min: 20 * 60 }));

interface AgentRow { id: string; name: string; max_per_day: number }
interface Rule { agent_id: string; weekday: number; start_min: number; end_min: number }
interface Exception { agent_id: string; day: string; kind: "off" | "extra"; start_min: number; end_min: number }
interface Appt { id: string; agent_id: string | null; property_id: string; starts_at: string; ends_at: string; status: string }
interface Prop { id: string; latitude: number | null; longitude: number | null }

export interface Ctx {
  settings: Settings;
  agents: AgentRow[];
  rules: Rule[];
  exceptions: Exception[];
  appts: Appt[];
  props: Map<string, Prop>;
  reliability: Map<string, number>;
  blackouts: { property_id: string; starts_at: string; ends_at: string }[];
}

export async function loadSettings(): Promise<Settings> {
  const { data } = await getSupabaseAdmin().from("fo_settings").select("*").eq("id", 1).single();
  return { ...(data as Settings), showing_fee: Number(data?.showing_fee ?? 25), bonus_pct: Number(data?.bonus_pct ?? 10) };
}

export async function loadPropertyRules(propertyId: string): Promise<PropertyRules> {
  const { data } = await getSupabaseAdmin().from("fo_property_rules").select("*").eq("property_id", propertyId).maybeSingle();
  return data ? (data as PropertyRules) : { property_id: propertyId, ...DEFAULT_RULES };
}

/** Everything the engine needs for a time range, in a handful of queries. */
export async function loadCtx(fromIso: string, toIso: string): Promise<Ctx> {
  const sb = getSupabaseAdmin();
  const [settings, agents, rules, exceptions, appts, props, checklists, blackouts] = await Promise.all([
    loadSettings(),
    sb.from("agents").select("id, name, max_per_day").eq("is_active", true).not("activated_at", "is", null),
    sb.from("fo_availability_rules").select("agent_id, weekday, start_min, end_min"),
    sb.from("fo_availability_exceptions").select("agent_id, day, kind, start_min, end_min")
      .gte("day", addDays(localParts(new Date(fromIso)).day, -1)).lte("day", addDays(localParts(new Date(toIso)).day, 1)),
    sb.from("fo_appointments").select("id, agent_id, property_id, starts_at, ends_at, status")
      .in("status", [...LIVE]).gte("ends_at", new Date(new Date(fromIso).getTime() - 864e5).toISOString()).lte("starts_at", new Date(new Date(toIso).getTime() + 864e5).toISOString()),
    sb.from("properties").select("id, latitude, longitude"),
    sb.from("fo_appointments").select("agent_id, status").in("status", ["completed", "followed_up", "no_show"]).not("agent_id", "is", null)
      .gte("starts_at", new Date(Date.now() - 90 * 864e5).toISOString()),
    sb.from("fo_blackouts").select("property_id, starts_at, ends_at").gte("ends_at", fromIso).lte("starts_at", toIso),
  ]);

  // Reliability: share of past showings that happened (no-show by tenant doesn't count against them;
  // missed steps are tracked on the checklist). Starts at 1 for new specialists.
  const reliability = new Map<string, number>();
  const tally = new Map<string, { done: number; all: number }>();
  for (const a of (checklists.data ?? []) as { agent_id: string; status: string }[]) {
    const t = tally.get(a.agent_id) ?? { done: 0, all: 0 };
    t.all += 1; if (a.status !== "no_show") t.done += 1;
    tally.set(a.agent_id, t);
  }
  for (const [id, t] of tally) reliability.set(id, t.all ? t.done / t.all : 1);

  return {
    settings,
    agents: (agents.data ?? []) as AgentRow[],
    rules: (rules.data ?? []) as Rule[],
    exceptions: (exceptions.data ?? []) as Exception[],
    appts: (appts.data ?? []) as Appt[],
    props: new Map(((props.data ?? []) as Prop[]).map((p) => [p.id, p])),
    reliability,
    blackouts: (blackouts.data ?? []) as Ctx["blackouts"],
  };
}

const overlaps = (a0: number, a1: number, b0: number, b1: number) => a0 < b1 && b0 < a1;

/** Is the specialist available for the whole of [startMin, endMin) on this Toronto day? */
export function agentAvailable(ctx: Ctx, agentId: string, day: string, startMin: number, endMin: number): boolean {
  const wd = weekdayOf(day);
  const exc = ctx.exceptions.filter((e) => e.agent_id === agentId && e.day === day);
  if (exc.some((e) => e.kind === "off" && overlaps(e.start_min, e.end_min, startMin, endMin))) return false;
  const windows = [
    ...ctx.rules.filter((r) => r.agent_id === agentId && r.weekday === wd),
    ...exc.filter((e) => e.kind === "extra"),
  ];
  return windows.some((w) => w.start_min <= startMin && w.end_min >= endMin);
}

function km(a: Prop | undefined, b: Prop | undefined): number | null {
  if (!a?.latitude || !a.longitude || !b?.latitude || !b.longitude) return null;
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * rad, dLng = (b.longitude - a.longitude) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Minutes needed to get between two homes. Same home = 0. With map points we
 * estimate ~2 min/km of straight-line distance plus 10 min to park and lock up,
 * never less than the home's buffer. Without map points, the buffer. It's an
 * estimate, not a route.
 */
export function travelMin(ctx: Ctx, fromProperty: string, toProperty: string, buffer: number): number {
  if (fromProperty === toProperty) return 0;
  const d = km(ctx.props.get(fromProperty), ctx.props.get(toProperty));
  if (d == null) return buffer;
  return Math.min(120, Math.max(buffer, Math.ceil(d * 2 + 10)));
}

/** Why a specialist can't take [start, end) at a home, or null if they can. */
export function blocker(ctx: Ctx, agentId: string, propertyId: string, start: Date, end: Date, buffer: number, ignoreAppt?: string): string | null {
  const s = localParts(start), e = localParts(new Date(end.getTime() - 1));
  if (s.day !== e.day) return "crosses midnight";
  if (!agentAvailable(ctx, agentId, s.day, s.min, e.min + 1)) return "not available then";
  const agent = ctx.agents.find((a) => a.id === agentId);
  const mine = ctx.appts.filter((a) => a.agent_id === agentId && a.id !== ignoreAppt && (LIVE as readonly string[]).includes(a.status));
  for (const a of mine) {
    const gap = travelMin(ctx, a.property_id, propertyId, buffer) * 60_000;
    if (overlaps(new Date(a.starts_at).getTime() - gap, new Date(a.ends_at).getTime() + gap, start.getTime(), end.getTime())) {
      return a.property_id === propertyId ? "already showing then" : "not enough travel time";
    }
  }
  const sameDay = mine.filter((a) => localParts(new Date(a.starts_at)).day === s.day).length;
  if (agent && sameDay >= agent.max_per_day) return "daily limit reached";
  return null;
}

export interface Candidate { agentId: string; name: string; score: number; reason: string }

/** Rank everyone who can take this time. Highest score first, with a plain reason. */
export function candidates(ctx: Ctx, propertyId: string, start: Date, end: Date, buffer: number, ignoreAppt?: string): Candidate[] {
  const { weight_batch, weight_fair, weight_reliable, weight_travel } = ctx.settings;
  const weekAhead = start.getTime() + 7 * 864e5;
  const loads = new Map(ctx.agents.map((a) => [a.id, ctx.appts.filter((x) => x.agent_id === a.id && x.id !== ignoreAppt
    && new Date(x.starts_at).getTime() >= Date.now() && new Date(x.starts_at).getTime() < weekAhead).length]));
  const maxLoad = Math.max(1, ...loads.values());

  return ctx.agents
    .filter((a) => !blocker(ctx, a.id, propertyId, start, end, buffer, ignoreAppt))
    .map((a) => {
      const reasons = ["available"];
      let score = 0;
      const mine = ctx.appts.filter((x) => x.agent_id === a.id && x.id !== ignoreAppt);
      const adjacentHere = mine.some((x) => x.property_id === propertyId
        && (Math.abs(new Date(x.ends_at).getTime() - start.getTime()) <= 15 * 60_000 || Math.abs(new Date(x.starts_at).getTime() - end.getTime()) <= 15 * 60_000));
      if (adjacentHere) { score += weight_batch; reasons.push("already at this home then"); }

      const sameDay = mine.filter((x) => x.property_id !== propertyId && localParts(new Date(x.starts_at)).day === localParts(start).day);
      if (sameDay.length) {
        const nearest = Math.min(...sameDay.map((x) => travelMin(ctx, x.property_id, propertyId, buffer)));
        score += weight_travel * Math.max(0, 1 - nearest / 60);
        if (nearest <= 20) reasons.push("nearby showing that day");
      } else if (!adjacentHere) {
        score += weight_travel * 0.5;
      }

      const load = loads.get(a.id) ?? 0;
      score += weight_fair * (1 - load / maxLoad);
      if (load === 0) reasons.push("no showings yet this week");

      const rel = ctx.reliability.get(a.id) ?? 1;
      score += weight_reliable * rel;

      return { agentId: a.id, name: a.name, score: Math.round(score * 10) / 10, reason: reasons.join(", ") };
    })
    .sort((x, y) => y.score - x.score || x.name.localeCompare(y.name));
}

export interface Slot { start: string; end: string; capacity: number }

/** Every bookable time for a home, backed by at least one specialist who can actually take it. */
export function slotsFor(ctx: Ctx, rules: PropertyRules, now = new Date(), onlyDay?: string): Slot[] {
  const windows = rules.windows.length ? rules.windows : DEFAULT_WINDOWS;
  const earliest = now.getTime() + rules.min_notice_hours * 3_600_000;
  const out: Slot[] = [];
  const today = todayToronto();
  const lastDay = addDays(today, rules.horizon_days);
  for (let i = 0; i <= rules.horizon_days; i++) {
    const day = addDays(today, i);
    if (onlyDay && day !== onlyDay) continue;
    if (day > lastDay) break;
    const wd = weekdayOf(day);
    const seen = new Set<number>();
    for (const w of windows.filter((x) => x.weekday === wd)) {
      for (let m = w.start_min; m + rules.duration_min <= w.end_min; m += rules.duration_min) {
        if (seen.has(m)) continue;
        seen.add(m);
        const start = zonedToUtc(day, m);
        if (!start || start.getTime() < earliest) continue;
        const end = new Date(start.getTime() + rules.duration_min * 60_000);
        if (ctx.blackouts.some((b) => b.property_id === rules.property_id && overlaps(new Date(b.starts_at).getTime(), new Date(b.ends_at).getTime(), start.getTime(), end.getTime()))) continue;
        const atHome = ctx.appts.filter((a) => a.property_id === rules.property_id && (LIVE as readonly string[]).includes(a.status)
          && overlaps(new Date(a.starts_at).getTime(), new Date(a.ends_at).getTime(), start.getTime(), end.getTime())).length;
        if (atHome >= rules.max_per_slot) continue;
        const n = candidates(ctx, rules.property_id, start, end, rules.travel_buffer_min).length;
        if (n > 0) out.push({ start: start.toISOString(), end: end.toISOString(), capacity: Math.min(n, rules.max_per_slot - atHome) });
      }
    }
  }
  return out.sort((a, b) => a.start.localeCompare(b.start));
}

export async function availableSlots(propertyId: string): Promise<{ rules: PropertyRules; slots: Slot[] }> {
  const rules = await loadPropertyRules(propertyId);
  if (!rules.booking_enabled) return { rules, slots: [] };
  const from = new Date();
  const ctx = await loadCtx(from.toISOString(), new Date(from.getTime() + (rules.horizon_days + 1) * 864e5).toISOString());
  return { rules, slots: slotsFor(ctx, rules) };
}

export const hashToken = (t: string) => crypto.createHash("sha256").update(t).digest("hex");

// Links are "<id>.<signature>": nothing to store, can be re-sent any time,
// and can't be guessed or edited without the server secret.
function secret() {
  const s = process.env.FIELDOPS_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error("FIELDOPS_SECRET is not set");
  return s;
}
export function signId(kind: "book" | "manage" | "invite" | "ics", id: string) {
  const sig = crypto.createHmac("sha256", secret()).update(`${kind}:${id}`).digest("base64url").slice(0, 32);
  return `${id}.${sig}`;
}
/** Calendar feed id that means "every showing" (Ebin's feed). */
export const ALL_SHOWINGS = "00000000-0000-4000-8000-000000000000";
export const calendarUrl = (id: string) => `https://www.prosperaproperties.co/api/calendar/${signId("ics", id)}.ics`;

export function verifyId(kind: "book" | "manage" | "invite" | "ics", token: string): string | null {
  const [id, sig] = token.split(".");
  if (!id || !sig || !/^[0-9a-f-]{36}$/.test(id)) return null;
  const want = signId(kind, id).split(".")[1];
  const a = Buffer.from(sig), b = Buffer.from(want);
  return a.length === b.length && crypto.timingSafeEqual(a, b) ? id : null;
}

export interface BookInput {
  propertyId: string;
  start: Date;
  tokenId: string | null;
  requestId: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  createdBy: "tenant" | "admin";
  agentId?: string;          // admin override
}

export type BookResult =
  | { ok: true; appointmentId: string; agentId: string; reason: string }
  | { ok: false; error: "no_capacity" | "rules" | "not_bookable" };

/** Recheck everything and book the best specialist who can still take the time. */
export async function book(input: BookInput): Promise<BookResult> {
  const rules = await loadPropertyRules(input.propertyId);
  if (input.createdBy === "tenant" && !rules.booking_enabled) return { ok: false, error: "not_bookable" };
  const end = new Date(input.start.getTime() + rules.duration_min * 60_000);
  const ctx = await loadCtx(input.start.toISOString(), end.toISOString());

  if (input.createdBy === "tenant") {
    // The time must still be one we would offer.
    const offered = slotsFor(ctx, rules, new Date(), localParts(input.start).day).some((s) => s.start === input.start.toISOString());
    if (!offered) return { ok: false, error: "no_capacity" };
  }

  let ranked = candidates(ctx, input.propertyId, input.start, end, rules.travel_buffer_min);
  if (input.agentId) {
    const pick = ctx.agents.find((a) => a.id === input.agentId);
    if (!pick) return { ok: false, error: "rules" };
    const why = blocker(ctx, pick.id, input.propertyId, input.start, end, rules.travel_buffer_min);
    if (why && why !== "not available then") return { ok: false, error: "no_capacity" };
    ranked = [{ agentId: pick.id, name: pick.name, score: 0, reason: why ? "picked by admin outside their availability" : "picked by admin" }];
  }
  if (!ranked.length) return { ok: false, error: "no_capacity" };

  const sb = getSupabaseAdmin();
  for (const c of ranked) {
    const agent = ctx.agents.find((a) => a.id === c.agentId)!;
    const travel = Math.max(rules.travel_buffer_min, ...ctx.appts
      .filter((a) => a.agent_id === c.agentId && localParts(new Date(a.starts_at)).day === localParts(input.start).day)
      .map((a) => travelMin(ctx, a.property_id, input.propertyId, rules.travel_buffer_min)));
    const { data, error } = await sb.rpc("fo_try_book", {
      p_agent: c.agentId, p_property: input.propertyId, p_start: input.start.toISOString(), p_end: end.toISOString(),
      p_travel_min: travel, p_max_per_slot: rules.max_per_slot, p_token: input.tokenId, p_request: input.requestId,
      p_name: input.name, p_phone: input.phone, p_email: input.email, p_manage_hash: null,
      p_reason: c.reason, p_created_by: input.createdBy, p_max_per_day: agent.max_per_day,
    });
    if (error) throw new Error(`Booking failed: ${error.message}`);
    if (data) return { ok: true, appointmentId: data as string, agentId: c.agentId, reason: c.reason };
  }
  return { ok: false, error: "no_capacity" };
}

/** Move a live appointment to a new time and/or specialist with the same checks. */
export async function move(appointmentId: string, opts: { start?: Date; agentId?: string; actor: string; reason?: string; force?: boolean }): Promise<{ ok: true; agentId: string } | { ok: false; error: string }> {
  const sb = getSupabaseAdmin();
  const { data: appt } = await sb.from("fo_appointments").select("*").eq("id", appointmentId).maybeSingle();
  if (!appt) return { ok: false, error: "Appointment not found." };
  if (!(LIVE as readonly string[]).includes(appt.status)) return { ok: false, error: "That appointment is no longer active." };
  const rules = await loadPropertyRules(appt.property_id);
  const start = opts.start ?? new Date(appt.starts_at);
  const end = new Date(start.getTime() + (new Date(appt.ends_at).getTime() - new Date(appt.starts_at).getTime()));
  const ctx = await loadCtx(start.toISOString(), end.toISOString());

  let ranked: Candidate[];
  if (opts.agentId) {
    const why = blocker(ctx, opts.agentId, appt.property_id, start, end, rules.travel_buffer_min, appointmentId);
    if (why && !(opts.force && why === "not available then")) return { ok: false, error: `That specialist can't: ${why}.` };
    ranked = [{ agentId: opts.agentId, name: "", score: 0, reason: opts.reason ?? "picked by admin" }];
  } else {
    ranked = candidates(ctx, appt.property_id, start, end, rules.travel_buffer_min, appointmentId)
      .filter((c) => c.agentId !== appt.agent_id || opts.start);
    // Keep the same specialist on a reschedule when they can still do it.
    const same = ranked.find((c) => c.agentId === appt.agent_id);
    if (same) ranked = [same, ...ranked.filter((c) => c !== same)];
  }
  if (!ranked.length) return { ok: false, error: "No specialist is free for that time." };

  for (const c of ranked) {
    const agent = ctx.agents.find((a) => a.id === c.agentId);
    const travel = Math.max(rules.travel_buffer_min, ...ctx.appts
      .filter((a) => a.agent_id === c.agentId && a.id !== appointmentId && localParts(new Date(a.starts_at)).day === localParts(start).day)
      .map((a) => travelMin(ctx, a.property_id, appt.property_id, rules.travel_buffer_min)));
    const { data, error } = await sb.rpc("fo_try_move", {
      p_id: appointmentId, p_agent: c.agentId, p_start: start.toISOString(), p_end: end.toISOString(),
      p_travel_min: travel, p_max_per_slot: rules.max_per_slot, p_max_per_day: agent?.max_per_day ?? 8,
      p_actor: opts.actor, p_reason: opts.reason ?? c.reason,
    });
    if (error) return { ok: false, error: error.message };
    if (data) return { ok: true, agentId: c.agentId };
  }
  return { ok: false, error: "That time was just taken. Pick another." };
}
