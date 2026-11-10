import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { ALL_SHOWINGS, calendarUrl, DEFAULT_RULES, hashToken, loadCtx, loadPropertyRules, loadSettings, signId, slotsFor, agentAvailable, LIVE } from "@/lib/fieldops/engine";
import {
  adminBook, cancel, createDirectInvite, createInvite, markLeaseSigned, reassign, replacementsFor, reschedule, manageUrl, bookUrl,
} from "@/lib/fieldops/service";
import { send, card, SITE } from "@/lib/fieldops/messages";
import { addDays, localParts, todayToronto, zonedToUtc } from "@/lib/fieldops/time";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const sb = () => getSupabaseAdmin();
const err = (error: string, status = 400) => NextResponse.json({ error }, { status });

async function homes() {
  const { data } = await sb().from("properties").select("id, address, city, price, bedrooms, latitude, longitude")
    .eq("is_managed", true).eq("available", true).eq("status", "published").order("address");
  return data ?? [];
}

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated(req))) return err("Unauthorized", 401);
  const q = req.nextUrl.searchParams;
  const view = q.get("view") ?? "overview";

  if (view === "overview") {
    const now = new Date();
    const weekEnd = new Date(now.getTime() + 7 * 864e5).toISOString();
    const monthAgo = new Date(now.getTime() - 30 * 864e5).toISOString();
    const [upcoming, recent, invites, pendingPay, specialists, msgs, reqs] = await Promise.all([
      sb().from("fo_appointments").select("id, starts_at, ends_at, status, tenant_name, acknowledged_at, agent_id, property_id, properties(address), agents(name)")
        .in("status", [...LIVE]).gte("ends_at", new Date(now.getTime() - 6 * 3_600_000).toISOString()).lte("starts_at", weekEnd).order("starts_at"),
      sb().from("fo_appointments").select("id, status, starts_at, ends_at, created_at, viewing_request_id, booking_token_id, lease_signed_at").gte("starts_at", monthAgo).lte("starts_at", now.toISOString()),
      sb().from("fo_booking_tokens").select("id, created_at, expires_at, revoked_at, viewing_request_id").gte("created_at", monthAgo),
      sb().from("fo_earnings").select("amount").eq("status", "pending"),
      sb().from("agents").select("id, name, activated_at, is_active").eq("role", "specialist"),
      sb().from("fo_messages").select("id, template, recipient, error, created_at, appointment_id").eq("status", "failed").gte("created_at", monthAgo).order("created_at", { ascending: false }).limit(20),
      sb().from("viewing_requests").select("id, full_name, priority, status, property_id, property_snapshot, email, created_at").in("status", ["new", "contacted"]).order("created_at", { ascending: false }).limit(50),
    ]);
    const past = recent.data ?? [];
    const overdue = (upcoming.data ?? []).filter((a) => new Date(a.ends_at).getTime() < now.getTime() - 2 * 3_600_000 || (a.status !== "in_progress" && new Date(a.ends_at).getTime() < now.getTime()));
    const unacked = (upcoming.data ?? []).filter((a) => !a.acknowledged_at && a.agent_id && new Date(a.starts_at).getTime() - now.getTime() < 24 * 3_600_000);
    const tokenIds = new Set((invites.data ?? []).map((t) => t.id));
    const bookedFromInvites = new Set(past.concat([]).filter((a) => a.booking_token_id && tokenIds.has(a.booking_token_id)).map((a) => a.booking_token_id));
    const done = past.filter((a) => ["completed", "followed_up"].includes(a.status)).length;
    const noShow = past.filter((a) => a.status === "no_show").length;
    const invitedRequestIds = new Set((invites.data ?? []).map((t) => t.viewing_request_id).filter(Boolean));
    const ruleRows = await sb().from("fo_property_rules").select("property_id, booking_enabled");
    const bookable = new Set((ruleRows.data ?? []).filter((r) => r.booking_enabled).map((r) => r.property_id));
    return NextResponse.json({
      upcoming: upcoming.data ?? [],
      exceptions: {
        overdue, unacked,
        unassigned: (upcoming.data ?? []).filter((a) => a.status === "reassignment_pending" || !a.agent_id),
        failedMessages: msgs.data ?? [],
      },
      awaiting: (reqs.data ?? []).filter((r) => !invitedRequestIds.has(r.id)).map((r) => ({ ...r, bookable: !!r.property_id && bookable.has(r.property_id) })),
      funnel: {
        invited: (invites.data ?? []).length,
        booked: bookedFromInvites.size,
        attended: done,
        noShow,
        leases: past.filter((a) => a.lease_signed_at).length,
      },
      pendingPay: (pendingPay.data ?? []).reduce((s, e) => s + Number(e.amount), 0),
      specialists: { active: (specialists.data ?? []).filter((s) => s.activated_at && s.is_active).length, invited: (specialists.data ?? []).filter((s) => !s.activated_at && s.is_active).length },
    });
  }

  if (view === "calendar") {
    const from = q.get("from") ?? todayToronto();
    const days = Math.min(14, Number(q.get("days") ?? 7));
    const fromUtc = zonedToUtc(from, 0)!;
    const toUtc = zonedToUtc(addDays(from, days), 0)!;
    const ctx = await loadCtx(fromUtc.toISOString(), toUtc.toISOString());
    const { data: appts } = await sb().from("fo_appointments")
      .select("id, property_id, agent_id, starts_at, ends_at, status, tenant_name, acknowledged_at, assignment_reason, created_by, properties(address)")
      .gte("starts_at", fromUtc.toISOString()).lt("starts_at", toUtc.toISOString()).neq("status", "cancelled").order("starts_at");
    // Availability blocks per specialist per day, after time off.
    const blocks: { agent_id: string; day: string; start_min: number; end_min: number }[] = [];
    for (let i = 0; i < days; i++) {
      const day = addDays(from, i);
      for (const a of ctx.agents) {
        for (let m = 0; m < 1440; m += 30) {
          if (agentAvailable(ctx, a.id, day, m, m + 30)) {
            const last = blocks[blocks.length - 1];
            if (last && last.agent_id === a.id && last.day === day && last.end_min === m) last.end_min = m + 30;
            else blocks.push({ agent_id: a.id, day, start_min: m, end_min: m + 30 });
          }
        }
      }
    }
    // Open bookable capacity per home per day (times a tenant could pick right now).
    const hs = await homes();
    const capacity: Record<string, Record<string, number>> = {};
    for (const h of hs) {
      const rules = await loadPropertyRules(h.id);
      if (!rules.booking_enabled) continue;
      capacity[h.id] = {};
      for (const s of slotsFor(ctx, rules)) {
        const d = localParts(new Date(s.start)).day;
        if (d >= from && d < addDays(from, days)) capacity[h.id][d] = (capacity[h.id][d] ?? 0) + 1;
      }
    }
    return NextResponse.json({ appts: appts ?? [], blocks, agents: ctx.agents.map((a) => ({ id: a.id, name: a.name })), homes: hs, capacity });
  }

  if (view === "appointment") {
    const id = q.get("id") ?? "";
    const [{ data: a }, { data: events }, { data: msgs }, { data: cl }, { data: earn }] = await Promise.all([
      sb().from("fo_appointments").select("*, properties(address, city, price), agents(id, name, email, phone)").eq("id", id).maybeSingle(),
      sb().from("fo_events").select("*").eq("appointment_id", id).order("created_at"),
      sb().from("fo_messages").select("*").eq("appointment_id", id).order("created_at"),
      sb().from("fo_checklists").select("*").eq("appointment_id", id).maybeSingle(),
      sb().from("fo_earnings").select("*").eq("appointment_id", id),
    ]);
    if (!a) return err("Not found", 404);
    const live = (LIVE as readonly string[]).includes(a.status);
    return NextResponse.json({
      appt: a, events: events ?? [], messages: msgs ?? [], checklist: cl, earnings: earn ?? [],
      replacements: live ? await replacementsFor(id) : [],
      manage: manageUrl(id),
    });
  }

  if (view === "specialists") {
    const [{ data: agents }, { data: rules }, { data: appts }, { data: earn }, settings] = await Promise.all([
      sb().from("agents").select("id, name, email, phone, role, is_active, home_area, invited_at, activated_at, showing_fee, max_per_day, notes, created_at").order("created_at"),
      sb().from("fo_availability_rules").select("agent_id, weekday, start_min, end_min"),
      sb().from("fo_appointments").select("agent_id, status, starts_at, acknowledged_at").gte("starts_at", new Date(Date.now() - 90 * 864e5).toISOString()),
      sb().from("fo_earnings").select("agent_id, amount, status"),
      loadSettings(),
    ]);
    const { data: checklists } = await sb().from("fo_checklists").select("appointment_id, steps, completed_at, fo_appointments!inner(agent_id, starts_at)");
    return NextResponse.json({
      settings,
      specialists: (agents ?? []).map((a) => {
        const mine = (appts ?? []).filter((x) => x.agent_id === a.id);
        const past = mine.filter((x) => new Date(x.starts_at).getTime() < Date.now());
        const cls = (checklists ?? []).filter((c) => (c.fo_appointments as unknown as { agent_id: string }).agent_id === a.id);
        const onTime = cls.filter((c) => {
          const arrived = (c.steps as Record<string, string>)?.arrived;
          return arrived && new Date(arrived).getTime() <= new Date((c.fo_appointments as unknown as { starts_at: string }).starts_at).getTime();
        }).length;
        const hours = (rules ?? []).filter((r) => r.agent_id === a.id).reduce((s, r) => s + (r.end_min - r.start_min) / 60, 0);
        const e = (earn ?? []).filter((x) => x.agent_id === a.id);
        return {
          ...a,
          weeklyHours: Math.round(hours * 10) / 10,
          upcoming: mine.filter((x) => (LIVE as readonly string[]).includes(x.status) && new Date(x.starts_at).getTime() >= Date.now()).length,
          completed: past.filter((x) => ["completed", "followed_up"].includes(x.status)).length,
          checklistDone: cls.filter((c) => c.completed_at).length,
          onTimePct: cls.length ? Math.round((onTime / cls.length) * 100) : null,
          pending: e.filter((x) => x.status === "pending").reduce((s, x) => s + Number(x.amount), 0),
          paid: e.filter((x) => x.status === "paid").reduce((s, x) => s + Number(x.amount), 0),
        };
      }),
    });
  }

  if (view === "availability") {
    const agentId = q.get("agent") ?? "";
    const [{ data: rules }, { data: exceptions }] = await Promise.all([
      sb().from("fo_availability_rules").select("id, weekday, start_min, end_min").eq("agent_id", agentId).order("weekday").order("start_min"),
      sb().from("fo_availability_exceptions").select("id, day, kind, start_min, end_min, note").eq("agent_id", agentId).gte("day", todayToronto()).order("day"),
    ]);
    return NextResponse.json({ rules: rules ?? [], exceptions: exceptions ?? [] });
  }

  if (view === "homes") {
    const hs = await homes();
    const { data: rules } = await sb().from("fo_property_rules").select("*");
    const { data: blackouts } = await sb().from("fo_blackouts").select("*").gte("ends_at", new Date().toISOString()).order("starts_at");
    const byId = new Map((rules ?? []).map((r) => [r.property_id, r]));
    const from = new Date();
    const ctx = await loadCtx(from.toISOString(), new Date(from.getTime() + 15 * 864e5).toISOString());
    return NextResponse.json({
      homes: hs.map((h) => {
        const r = byId.get(h.id) ?? { property_id: h.id, ...DEFAULT_RULES };
        return { ...h, rules: r, openSlots: r.booking_enabled ? slotsFor(ctx, r).length : 0, hasMap: h.latitude != null && h.longitude != null };
      }),
      blackouts: blackouts ?? [],
    });
  }

  if (view === "pay") {
    const { data } = await sb().from("fo_earnings")
      .select("id, agent_id, kind, amount, status, note, rate_snapshot, created_at, approved_at, paid_at, agents(name), fo_appointments(starts_at, tenant_name, properties(address))")
      .order("created_at", { ascending: false }).limit(500);
    return NextResponse.json({ rows: data ?? [], settings: await loadSettings() });
  }

  if (view === "settings") return NextResponse.json({ settings: await loadSettings(), calendarUrl: calendarUrl(ALL_SHOWINGS) });

  if (view === "slots") {
    const property = q.get("property") ?? "";
    const rules = await loadPropertyRules(property);
    const from = new Date();
    const ctx = await loadCtx(from.toISOString(), new Date(from.getTime() + (rules.horizon_days + 1) * 864e5).toISOString());
    return NextResponse.json({ slots: slotsFor(ctx, { ...rules, booking_enabled: true }).map((s) => s.start), enabled: rules.booking_enabled });
  }
  return err("Unknown view");
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated(req))) return err("Unauthorized", 401);
  const b = await req.json().catch(() => ({}));
  const act = String(b.action ?? "");
  try {
    switch (act) {
      case "invite_specialist": {
        const name = String(b.name ?? "").trim(), email = String(b.email ?? "").trim().toLowerCase();
        if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err("Enter a name and a valid email.");
        const { data: existing } = await sb().from("agents").select("id").eq("email", email).maybeSingle();
        let id = existing?.id as string | undefined;
        if (id) {
          await sb().from("agents").update({ name, phone: b.phone || null, role: "specialist", is_active: true, home_area: b.home_area || null }).eq("id", id);
        } else {
          const { data, error } = await sb().from("agents").insert({ name, email, phone: b.phone || null, role: "specialist", is_active: true, home_area: b.home_area || null }).select("id").single();
          if (error) return err(error.message);
          id = data.id;
        }
        const token = signId("invite", id!) + "." + crypto.randomBytes(6).toString("base64url");
        await sb().from("agents").update({ invite_token_hash: hashToken(token), invited_at: new Date().toISOString() }).eq("id", id!);
        const url = `${SITE}/team/activate/${token}`;
        const delivery = await send({
          to: email, template: "specialist_invite", key: `specialist-invite:${id}:${Date.now()}`,
          subject: "You're invited to Prospera FieldOps",
          html: card({
            label: "FIELDOPS INVITE", pill: { text: "WELCOME" }, title: `Welcome to the team, ${name.split(/\s+/)[0]}.`,
            intro: "Prospera uses FieldOps to schedule property showings. Set your password, then add the times you're free. Showings are assigned to you automatically inside those times.",
            button: { text: "Set up my account →", href: url },
            note: "This link is just for you. It works once.",
          }),
        });
        return NextResponse.json({ ok: true, id, url, delivery });
      }

      case "update_specialist": {
        const patch: Record<string, unknown> = {};
        for (const k of ["name", "phone", "home_area", "notes"]) if (k in b) patch[k] = b[k] || null;
        if ("is_active" in b) patch.is_active = !!b.is_active;
        if ("showing_fee" in b) patch.showing_fee = b.showing_fee === "" || b.showing_fee == null ? null : Number(b.showing_fee);
        if ("max_per_day" in b) patch.max_per_day = Math.max(1, Math.min(20, Number(b.max_per_day) || 8));
        await sb().from("agents").update(patch).eq("id", String(b.id));
        return NextResponse.json({ ok: true });
      }

      case "set_specialist_rules": {
        const agentId = String(b.agent);
        const rules = (Array.isArray(b.rules) ? b.rules : []).filter((r: { weekday: number; start_min: number; end_min: number }) => r.end_min > r.start_min);
        await sb().from("fo_availability_rules").delete().eq("agent_id", agentId);
        if (rules.length) await sb().from("fo_availability_rules").insert(rules.map((r: { weekday: number; start_min: number; end_min: number }) => ({ agent_id: agentId, weekday: r.weekday, start_min: r.start_min, end_min: r.end_min })));
        return NextResponse.json({ ok: true });
      }

      case "save_home_rules": {
        const r = b.rules ?? {};
        const row = {
          property_id: String(b.property),
          booking_enabled: !!r.booking_enabled,
          duration_min: Math.max(10, Math.min(120, Number(r.duration_min) || 20)),
          travel_buffer_min: Math.max(0, Math.min(180, Number(r.travel_buffer_min) || 0)),
          min_notice_hours: Math.max(0, Math.min(168, Number(r.min_notice_hours) || 0)),
          horizon_days: Math.max(1, Math.min(60, Number(r.horizon_days) || 14)),
          max_per_slot: Math.max(1, Math.min(10, Number(r.max_per_slot) || 1)),
          windows: Array.isArray(r.windows) ? r.windows.filter((w: { start_min: number; end_min: number }) => w.end_min > w.start_min) : [],
          occupied: !!r.occupied,
          access_instructions: r.access_instructions ? String(r.access_instructions).slice(0, 2000) : null,
          highlights: r.highlights ? String(r.highlights).slice(0, 2000) : null,
          updated_at: new Date().toISOString(),
        };
        const { error } = await sb().from("fo_property_rules").upsert(row);
        if (error) return err(error.message);
        return NextResponse.json({ ok: true });
      }

      case "add_blackout": {
        const day = String(b.day ?? "");
        const s = /^\d{4}-\d{2}-\d{2}$/.test(day) ? zonedToUtc(day, Number(b.from_min)) : null;
        const e = /^\d{4}-\d{2}-\d{2}$/.test(day) ? zonedToUtc(day, Math.min(1439, Number(b.to_min))) : null;
        if (!s || !e || e <= s) return err("Pick a date, a start and a later end.");
        await sb().from("fo_blackouts").insert({ property_id: String(b.property), starts_at: s.toISOString(), ends_at: e.toISOString(), reason: b.reason || null });
        return NextResponse.json({ ok: true });
      }
      case "delete_blackout":
        await sb().from("fo_blackouts").delete().eq("id", String(b.id));
        return NextResponse.json({ ok: true });

      case "send_booking_link": {
        const r = await createInvite(String(b.request), { email: b.email || null, sendEmail: b.sendEmail !== false });
        return NextResponse.json({ ok: true, ...r });
      }
      case "direct_booking_link": {
        const r = await createDirectInvite({ propertyId: String(b.property), name: String(b.name ?? "").trim(), phone: b.phone || null, email: b.email || null, sendEmail: b.sendEmail !== false });
        return NextResponse.json({ ok: true, ...r });
      }

      case "book": {
        const start = new Date(String(b.start));
        if (isNaN(start.getTime()) || !b.property || !String(b.name ?? "").trim()) return err("Pick a home, a time and a name.");
        const r = await adminBook({ propertyId: String(b.property), start, name: String(b.name).trim(), phone: b.phone || null, email: b.email || null, agentId: b.agent || undefined, notify: b.notify !== false });
        return r.ok ? NextResponse.json(r) : err(r.error, 409);
      }
      case "cancel": {
        const r = await cancel(String(b.id), "admin", String(b.reason || "Cancelled by Prospera"), { notifyTenant: b.notifyTenant !== false });
        return r.ok ? NextResponse.json(r) : err(r.error, 409);
      }
      case "reschedule": {
        const start = new Date(String(b.start));
        if (isNaN(start.getTime())) return err("Pick a time.");
        const r = await reschedule(String(b.id), start, "admin");
        return r.ok ? NextResponse.json(r) : err(r.error, 409);
      }
      case "reassign": {
        const r = await reassign(String(b.id), b.agent ? String(b.agent) : null, "admin", { force: !!b.force, reason: b.reason ? String(b.reason) : undefined });
        return r.ok ? NextResponse.json(r) : err(r.error, 409);
      }
      case "set_status": {
        const allowed = ["completed", "no_show", "failed", "confirmed"];
        if (!allowed.includes(b.status) || !String(b.reason ?? "").trim()) return err("Pick a status and give a reason.");
        await sb().from("fo_appointments").update({ status: b.status, updated_at: new Date().toISOString() }).eq("id", String(b.id));
        await sb().from("fo_events").insert({ appointment_id: String(b.id), kind: "status", actor: "admin", detail: { status: b.status, reason: b.reason } });
        return NextResponse.json({ ok: true });
      }
      case "lease_signed": {
        const rent = Number(b.rent);
        if (!(rent > 0)) return err("Enter the monthly rent on the lease.");
        return NextResponse.json(await markLeaseSigned(String(b.id), rent));
      }
      case "resend": {
        const { data: a } = await sb().from("fo_appointments").select("tenant_email, booking_token_id").eq("id", String(b.id)).single();
        if (!a?.tenant_email) return err("No email for this tenant.");
        // Re-run the confirmation with a fresh key.
        const { data: full } = await sb().from("fo_appointments").select("*, properties(address, city)").eq("id", String(b.id)).single();
        const p = full!.properties as { address: string; city: string };
        const { T } = await import("@/lib/fieldops/messages");
        const m = T.confirmed({ id: full!.id, address: p.address, city: p.city, starts_at: full!.starts_at, ends_at: full!.ends_at, tenant_name: full!.tenant_name }, manageUrl(full!.id));
        const status = await send({ to: a.tenant_email, ...m, template: "tenant_confirmed", key: `resend:${b.id}:${Date.now()}`, appointmentId: String(b.id) });
        return NextResponse.json({ ok: status === "sent", status, rebook: a.booking_token_id ? bookUrl(a.booking_token_id) : null });
      }

      case "earnings": {
        const ids: string[] = Array.isArray(b.ids) ? b.ids.map(String) : [];
        const to = String(b.to);
        if (!ids.length || !["approved", "paid", "reversed", "pending"].includes(to)) return err("Pick rows and a status.");
        if (to === "reversed" && !String(b.note ?? "").trim()) return err("Give a reason for reversing.");
        const patch: Record<string, unknown> = { status: to };
        if (to === "approved") patch.approved_at = new Date().toISOString();
        if (to === "paid") patch.paid_at = new Date().toISOString();
        if (b.note) patch.note = String(b.note).slice(0, 300);
        await sb().from("fo_earnings").update(patch).in("id", ids);
        await sb().from("fo_events").insert({ kind: `earnings:${to}`, actor: "admin", detail: { ids, note: b.note ?? null } });
        return NextResponse.json({ ok: true });
      }
      case "adjustment": {
        const amount = Number(b.amount);
        if (!b.agent || !amount || !String(b.note ?? "").trim()) return err("Pick a specialist, an amount and a reason.");
        await sb().from("fo_earnings").insert({ agent_id: String(b.agent), kind: "adjustment", amount, status: "pending", note: String(b.note).slice(0, 300) });
        return NextResponse.json({ ok: true });
      }

      case "save_settings": {
        const s = b.settings ?? {};
        const patch = {
          pay_basis: s.pay_basis === "visit" ? "visit" : "household",
          showing_fee: Math.max(0, Number(s.showing_fee) || 0),
          bonus_enabled: !!s.bonus_enabled,
          bonus_pct: Math.max(0, Math.min(50, Number(s.bonus_pct) || 0)),
          reminder_hours: (Array.isArray(s.reminder_hours) ? s.reminder_hours : [24, 2]).map(Number).filter((n: number) => n > 0 && n <= 72),
          booking_link_days: Math.max(1, Math.min(30, Number(s.booking_link_days) || 7)),
          weight_batch: Number(s.weight_batch) || 0, weight_fair: Number(s.weight_fair) || 0,
          weight_reliable: Number(s.weight_reliable) || 0, weight_travel: Number(s.weight_travel) || 0,
          updated_at: new Date().toISOString(),
        };
        await sb().from("fo_settings").update(patch).eq("id", 1);
        await sb().from("fo_events").insert({ kind: "settings", actor: "admin", detail: patch });
        return NextResponse.json({ ok: true });
      }
    }
    return err("Unknown action");
  } catch (e) {
    console.error("[admin/fieldops]", act, e);
    return err(e instanceof Error ? e.message : "Something went wrong.", 500);
  }
}
