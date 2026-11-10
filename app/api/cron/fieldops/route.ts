import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { loadSettings, LIVE } from "@/lib/fieldops/engine";
import { send, T, ADMIN_EMAIL } from "@/lib/fieldops/messages";
import { manageUrl, teamUrl } from "@/lib/fieldops/service";
import { fmtDay, fmtTime } from "@/lib/fieldops/time";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Runs every 15 minutes (Supabase pg_cron → this URL). Sends reminders that
// are due, and flags showings nobody closed out. Safe to run twice: every
// message has an idempotency key.
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const ok = [process.env.FIELDOPS_CRON_SECRET, process.env.CRON_SECRET].filter(Boolean).some((s) => auth === `Bearer ${s}`);
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = getSupabaseAdmin();
  const settings = await loadSettings();
  const now = Date.now();
  const maxH = Math.max(24, ...settings.reminder_hours);
  const { data: appts } = await sb.from("fo_appointments")
    .select("id, starts_at, ends_at, status, tenant_name, tenant_email, reminders_sent, agent_id, properties(address, city), agents(email, name)")
    .in("status", [...LIVE]).gte("starts_at", new Date(now).toISOString()).lte("starts_at", new Date(now + maxH * 3_600_000).toISOString());

  let reminders = 0;
  for (const a of appts ?? []) {
    const p = a.properties as unknown as { address: string; city: string };
    const info = { id: a.id, address: p.address, city: p.city, starts_at: a.starts_at, ends_at: a.ends_at, tenant_name: a.tenant_name };
    const hoursOut = (new Date(a.starts_at).getTime() - now) / 3_600_000;
    const sent = new Set<number>(a.reminders_sent ?? []);
    for (const h of [...settings.reminder_hours].sort((x, y) => y - x)) {
      // Due once we're inside the window, but skip a reminder that is already stale
      // (e.g. a booking made 3 hours out doesn't get the "tomorrow" email).
      if (sent.has(h) || hoursOut > h || hoursOut < h / 2) continue;
      const m = T.reminder(info, manageUrl(a.id), h);
      await send({ to: a.tenant_email, ...m, template: `tenant_reminder_${h}h`, key: `remind:${a.id}:${a.starts_at}:${h}`, appointmentId: a.id });
      if (h >= 12 && a.agents) {
        const s = T.specialistReminder(info, teamUrl(a.id));
        await send({ to: (a.agents as unknown as { email: string }).email, ...s, template: "specialist_reminder", key: `sremind:${a.id}:${a.starts_at}:${a.agent_id}`, appointmentId: a.id });
      }
      sent.add(h);
      reminders++;
    }
    if (sent.size !== (a.reminders_sent ?? []).length) {
      await sb.from("fo_appointments").update({ reminders_sent: [...sent] }).eq("id", a.id);
    }
  }

  // Showings that ended 2+ hours ago and were never closed out.
  const { data: stale } = await sb.from("fo_appointments")
    .select("id, starts_at, tenant_name, properties(address), agents(name)")
    .in("status", ["confirmed", "in_progress"]).lt("ends_at", new Date(now - 2 * 3_600_000).toISOString())
    .gt("ends_at", new Date(now - 3 * 864e5).toISOString());
  for (const a of stale ?? []) {
    const p = a.properties as unknown as { address: string };
    const m = T.admin({
      title: `Not closed out: ${p.address}`, pill: "OVERDUE",
      intro: `The ${fmtTime(a.starts_at)} showing on ${fmtDay(a.starts_at)} with ${a.tenant_name} has no report from ${(a.agents as unknown as { name: string } | null)?.name ?? "the specialist"}.`,
    });
    await send({ to: ADMIN_EMAIL, ...m, template: "admin_overdue", key: `overdue:${a.id}`, appointmentId: a.id });
  }

  return NextResponse.json({ ok: true, checked: appts?.length ?? 0, reminders, overdue: stale?.length ?? 0 });
}
