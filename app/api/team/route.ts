import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAgentFromRequest } from "@/lib/agent-auth";
import { hashToken, verifyId, loadSettings, calendarUrl, LIVE } from "@/lib/fieldops/engine";
import { complete, markStep, reportUnavailable, sendApplicationFor, STEPS, type Report, type Step } from "@/lib/fieldops/service";
import { todayToronto, localParts } from "@/lib/fieldops/time";
import { loadSessionView, togglePrep, saveProspect, sendProspectApplication, closeSession, groupIntoSessions, type ProspectFeedback, type Closing } from "@/lib/fieldops/sessions";

export const dynamic = "force-dynamic";

// The specialist app. Every query is scoped to the signed-in specialist.

const sb = () => getSupabaseAdmin();
const err = (error: string, status = 400) => NextResponse.json({ error }, { status });

// Access instructions open the day before and close two hours after.
const instructionsOpen = (startsAt: string, endsAt: string) =>
  Date.now() >= new Date(startsAt).getTime() - 24 * 3_600_000 && Date.now() <= new Date(endsAt).getTime() + 2 * 3_600_000;

export async function GET(req: NextRequest) {
  const me = await getAgentFromRequest(req);
  if (!me) return err("Sign in again.", 401);
  const view = req.nextUrl.searchParams.get("view") ?? "home";

  if (view === "home" || view === "showings") {
    const since = new Date(Date.now() - (view === "home" ? 0.5 : 30) * 864e5).toISOString();
    const { data } = await sb().from("fo_appointments")
      .select("id, starts_at, ends_at, status, acknowledged_at, tenant_name, properties(address, city)")
      .eq("agent_id", me.id).gte("ends_at", since).neq("status", "cancelled").order("starts_at");
    const showings = (data ?? []).map((a) => ({
      id: a.id, starts_at: a.starts_at, ends_at: a.ends_at, status: a.status, acknowledged: !!a.acknowledged_at,
      tenant_first: a.tenant_name.split(/\s+/)[0], ...(a.properties as unknown as { address: string; city: string }),
    }));
    const { data: earn } = await sb().from("fo_earnings").select("amount, status, kind").eq("agent_id", me.id);
    const sum = (f: (e: { status: string; kind: string }) => boolean) => (earn ?? []).filter(f).reduce((s, e) => s + Number(e.amount), 0);
    const { count: hasAvailability } = await sb().from("fo_availability_rules").select("id", { count: "exact", head: true }).eq("agent_id", me.id);
    return NextResponse.json({
      me: { id: me.id, name: me.name, email: me.email },
      showings,
      hasAvailability: (hasAvailability ?? 0) > 0,
      calendarUrl: calendarUrl(me.id),
      earnings: { pending: sum((e) => e.status === "pending" && e.kind !== "lease_bonus"), approved: sum((e) => e.status === "approved"), paid: sum((e) => e.status === "paid"), bonusPending: sum((e) => e.status === "pending" && e.kind === "lease_bonus") },
    });
  }

  if (view === "fieldops") {
    // Sessions: back-to-back prospects at one home on one visit.
    const since = new Date(Date.now() - 7 * 864e5).toISOString();
    const { data } = await sb().from("fo_appointments")
      .select("id, property_id, starts_at, ends_at, status, acknowledged_at, tenant_name, properties(address, city, unit_number)")
      .eq("agent_id", me.id).gte("ends_at", since).not("status", "in", "(cancelled,reassignment_pending)").order("starts_at");
    const { data: closed } = await sb().from("fo_sessions").select("session_key, completed_at").eq("agent_id", me.id).not("completed_at", "is", null).gte("starts_at", since);
    const done = new Set((closed ?? []).map((c) => c.session_key));
    const sessions = groupIntoSessions(data ?? []).map((g) => {
      const p = g[0].properties as unknown as { address: string; city: string; unit_number: string | null };
      const key = `${me.id}:${g[0].property_id}:${g[0].starts_at}`;
      const live = g.some((a) => ["confirmed", "in_progress"].includes(a.status));
      return {
        id: g[0].id, address: p.address, unit: p.unit_number, city: p.city, startsAt: g[0].starts_at, endsAt: g[g.length - 1].ends_at,
        prospects: g.map((a) => a.tenant_name.split(/\s+/)[0]), count: g.length,
        unacknowledged: g.some((a) => !a.acknowledged_at && a.status === "confirmed"),
        state: done.has(key) || !live ? "done" : new Date(g[g.length - 1].ends_at).getTime() < Date.now() ? "needs_report" : g.some((a) => a.status === "in_progress") ? "now" : "upcoming",
      };
    });
    return NextResponse.json({ me: { name: me.name }, sessions });
  }

  if (view === "session") {
    const v = await loadSessionView(me.id, req.nextUrl.searchParams.get("id") ?? "");
    return v ? NextResponse.json(v) : err("Not found.", 404);
  }

  if (view === "showing") {
    const id = req.nextUrl.searchParams.get("id") ?? "";
    const { data: a } = await sb().from("fo_appointments")
      .select("id, property_id, starts_at, ends_at, status, acknowledged_at, tenant_name, tenant_phone, properties(address, city, bedrooms, bathrooms, price, latitude, longitude, slug, access_instructions, occupancy, showing_notes)")
      .eq("id", id).eq("agent_id", me.id).maybeSingle();
    if (!a) return err("Not found.", 404);
    const [{ data: rules }, { data: cl }] = await Promise.all([
      sb().from("fo_property_rules").select("access_instructions, highlights, occupied").eq("property_id", a.property_id).maybeSingle(),
      sb().from("fo_checklists").select("*").eq("appointment_id", id).maybeSingle(),
    ]);
    const open = instructionsOpen(a.starts_at, a.ends_at);
    const { access_instructions: _a, occupancy: _o, showing_notes: _n, ...home } = (a.properties ?? {}) as unknown as Record<string, unknown>;
    const prop = { access_instructions: _a, occupancy: _o, showing_notes: _n, slug: home.slug } as Record<string, unknown>;
    const live = (LIVE as readonly string[]).includes(a.status);
    return NextResponse.json({
      id: a.id, starts_at: a.starts_at, ends_at: a.ends_at, status: a.status, acknowledged: !!a.acknowledged_at,
      home,
      tenant: { first: a.tenant_name.split(/\s+/)[0], phone: live && open ? a.tenant_phone : null },
      // FieldOps per-home rules win; the property's own fields (from the property wizard) fill the gaps.
      highlights: rules?.highlights ?? (prop?.showing_notes as string | null) ?? null,
      occupied: rules?.occupied ?? prop?.occupancy === "occupied",
      access: open ? rules?.access_instructions ?? (prop?.access_instructions as string | null) ?? null : null,
      // Renter brief: what the visitor will want to know. No access details on it.
      brief: `/brief/${prop?.slug ?? a.property_id}`,
      accessOpensAt: open ? null : new Date(new Date(a.starts_at).getTime() - 24 * 3_600_000).toISOString(),
      checklist: cl ?? null,
    });
  }

  if (view === "availability") {
    const [{ data: rules }, { data: exceptions }, { data: upcoming }] = await Promise.all([
      sb().from("fo_availability_rules").select("id, weekday, start_min, end_min").eq("agent_id", me.id).order("weekday").order("start_min"),
      sb().from("fo_availability_exceptions").select("id, day, kind, start_min, end_min, note").eq("agent_id", me.id).gte("day", todayToronto()).order("day"),
      sb().from("fo_appointments").select("id, starts_at, ends_at").eq("agent_id", me.id).in("status", [...LIVE]).gte("starts_at", new Date().toISOString()),
    ]);
    return NextResponse.json({ rules: rules ?? [], exceptions: exceptions ?? [], upcoming: upcoming ?? [] });
  }

  if (view === "earnings") {
    const settings = await loadSettings();
    const { data } = await sb().from("fo_earnings")
      .select("id, kind, amount, status, note, created_at, approved_at, paid_at, rate_snapshot, fo_appointments(starts_at, properties(address))")
      .eq("agent_id", me.id).order("created_at", { ascending: false }).limit(200);
    const { data: ag } = await sb().from("agents").select("showing_fee").eq("id", me.id).single();
    const { count: upcoming } = await sb().from("fo_appointments").select("id", { count: "exact", head: true })
      .eq("agent_id", me.id).in("status", [...LIVE]).gte("starts_at", new Date().toISOString());
    return NextResponse.json({
      rows: data ?? [],
      fee: Number(ag?.showing_fee ?? settings.showing_fee),
      payBasis: settings.pay_basis,
      bonus: settings.bonus_enabled ? settings.bonus_pct : null,
      upcoming: upcoming ?? 0,
    });
  }
  return err("Unknown view");
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  // Account activation from the invite link (not signed in yet).
  if (body.action === "activate") {
    const agentId = verifyId("invite", String(body.token ?? ""));
    const password = String(body.password ?? "");
    if (!agentId) return err("This invite link isn't valid.", 404);
    if (password.length < 8) return err("Use at least 8 characters.");
    const { data: ag } = await sb().from("agents").select("id, invite_token_hash, is_active").eq("id", agentId).maybeSingle();
    if (!ag || !ag.is_active || ag.invite_token_hash !== hashToken(String(body.token))) return err("This invite was already used or replaced. Ask Ebin for a new one.", 410);
    await sb().from("agents").update({ password_hash: await bcrypt.hash(password, 10), activated_at: new Date().toISOString(), invite_token_hash: null }).eq("id", agentId);
    const token = crypto.randomBytes(32).toString("hex");
    await sb().from("agent_sessions").insert({ agent_id: agentId, token, expires_at: new Date(Date.now() + 30 * 864e5).toISOString() });
    const res = NextResponse.json({ ok: true });
    res.cookies.set("agent_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 30 * 86400 });
    return res;
  }

  const me = await getAgentFromRequest(req);
  if (!me) return err("Sign in again.", 401);

  if (body.action === "logout") {
    const res = NextResponse.json({ ok: true });
    const t = req.cookies.get("agent_session")?.value;
    if (t) await sb().from("agent_sessions").delete().eq("token", t);
    res.cookies.set("agent_session", "", { path: "/", maxAge: 0 });
    return res;
  }

  if (body.action === "set_rules") {
    const rules = Array.isArray(body.rules) ? body.rules : [];
    const clean = rules
      .map((r: Record<string, unknown>) => ({ weekday: Number(r.weekday), start_min: Number(r.start_min), end_min: Number(r.end_min) }))
      .filter((r: { weekday: number; start_min: number; end_min: number }) => r.weekday >= 0 && r.weekday <= 6 && r.start_min >= 0 && r.end_min <= 1440 && r.end_min > r.start_min);
    await sb().from("fo_availability_rules").delete().eq("agent_id", me.id);
    if (clean.length) await sb().from("fo_availability_rules").insert(clean.map((r: object) => ({ ...r, agent_id: me.id })));
    return NextResponse.json({ ok: true, conflicts: await conflictsFor(me.id) });
  }

  if (body.action === "add_exception") {
    const day = String(body.day ?? "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || day < todayToronto()) return err("Pick a date from today on.");
    const kind = body.kind === "extra" ? "extra" : "off";
    const start_min = Number(body.start_min ?? 0), end_min = Number(body.end_min ?? 1440);
    if (!(end_min > start_min)) return err("End time must be after start time.");
    await sb().from("fo_availability_exceptions").insert({ agent_id: me.id, day, kind, start_min, end_min, note: body.note ? String(body.note).slice(0, 200) : null });
    return NextResponse.json({ ok: true, conflicts: await conflictsFor(me.id) });
  }

  if (body.action === "delete_exception") {
    await sb().from("fo_availability_exceptions").delete().eq("id", String(body.id)).eq("agent_id", me.id);
    return NextResponse.json({ ok: true });
  }

  const id = String(body.id ?? "");
  if (body.action === "ack") {
    await sb().from("fo_appointments").update({ acknowledged_at: new Date().toISOString() }).eq("id", id).eq("agent_id", me.id).is("acknowledged_at", null);
    await sb().from("fo_events").insert({ appointment_id: id, agent_id: me.id, kind: "acknowledged", actor: `specialist:${me.id}` });
    return NextResponse.json({ ok: true });
  }
  if (body.action === "step") {
    if (!STEPS.includes(body.step)) return err("Unknown step");
    const r = await markStep(id, me.id, body.step as Step);
    return r.ok ? NextResponse.json(r) : err(r.error, 403);
  }
  if (body.action === "unavailable") {
    const reason = String(body.reason ?? "").trim().slice(0, 300);
    if (!reason) return err("Tell us briefly why.");
    const r = await reportUnavailable(id, me.id, reason);
    return r.ok ? NextResponse.json(r) : err(r.error, 403);
  }
  if (body.action === "complete") {
    const r = await complete(id, me.id, body.report as Report);
    return r.ok ? NextResponse.json(r) : err(r.error, 400);
  }
  if (body.action === "ack_session") {
    const v = await loadSessionView(me.id, id);
    if (!v) return err("Not found.", 404);
    const ids = v.prospects.map((p) => p.id);
    await sb().from("fo_appointments").update({ acknowledged_at: new Date().toISOString() }).in("id", ids).eq("agent_id", me.id).is("acknowledged_at", null);
    return NextResponse.json({ ok: true });
  }
  if (body.action === "prep") {
    const r = await togglePrep(me.id, id, String(body.item ?? ""));
    return r.ok ? NextResponse.json(r) : err(r.error, 404);
  }
  if (body.action === "prospect_save") {
    const r = await saveProspect(me.id, id, (body.feedback ?? {}) as ProspectFeedback);
    return r.ok ? NextResponse.json(r) : err(r.error, 400);
  }
  if (body.action === "prospect_send_app") {
    const r = await sendProspectApplication(me.id, me.name ?? "Prospera Properties", id);
    return r.ok ? NextResponse.json(r) : err(r.error, 400);
  }
  if (body.action === "session_close") {
    const r = await closeSession(me.id, me.name ?? "Specialist", id, (body.closing ?? {}) as Closing);
    return r.ok ? NextResponse.json(r) : err(r.error, 400);
  }
  if (body.action === "send_application") {
    const r = await sendApplicationFor({ appointmentId: id, onlyAgentId: me.id, sentBy: me.id, senderName: me.name ?? "Prospera Properties" });
    return r.ok ? NextResponse.json(r) : err(r.error, 400);
  }
  return err("Unknown action");
}

/** Confirmed showings that now fall outside the specialist's availability. They stay booked; we flag them. */
async function conflictsFor(agentId: string) {
  const [{ data: appts }, { data: rules }, { data: exc }] = await Promise.all([
    sb().from("fo_appointments").select("id, starts_at, ends_at, properties(address)").eq("agent_id", agentId).in("status", [...LIVE]).gte("starts_at", new Date().toISOString()),
    sb().from("fo_availability_rules").select("weekday, start_min, end_min").eq("agent_id", agentId),
    sb().from("fo_availability_exceptions").select("day, kind, start_min, end_min").eq("agent_id", agentId).gte("day", todayToronto()),
  ]);
  return (appts ?? []).filter((a) => {
    const s = localParts(new Date(a.starts_at)), e = localParts(new Date(new Date(a.ends_at).getTime() - 1));
    const off = (exc ?? []).some((x) => x.day === s.day && x.kind === "off" && x.start_min < e.min + 1 && s.min < x.end_min);
    const inWindow = [...(rules ?? []).filter((r) => r.weekday === s.weekday), ...(exc ?? []).filter((x) => x.day === s.day && x.kind === "extra")]
      .some((w) => w.start_min <= s.min && w.end_min >= e.min + 1);
    return off || !inWindow;
  }).map((a) => ({ id: a.id, starts_at: a.starts_at, address: (a.properties as unknown as { address: string }).address }));
}
