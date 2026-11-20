// Everything that needs Ebin right now, across every home, in one list.
// Each item says what to do and links straight to the place to do it.
import { getSupabaseAdmin } from "@/lib/supabase";
import { weekOf } from "@/lib/placements/core";

export interface TodayItem {
  id: string;
  kind: "viewing" | "application" | "owner" | "payment" | "update" | "showing" | "repair" | "next_action";
  title: string;
  detail: string | null;
  home: string | null;
  href: string;
  at: string;          // when it started waiting
  urgent: boolean;     // waiting too long, or someone else is blocked
}

const DAY = 864e5;
const hoursSince = (iso: string) => (Date.now() - new Date(iso).getTime()) / 36e5;
const money = (n: number) => `$${Number(n).toLocaleString("en-CA")}`;
const firstName = (n: string | null) => (n ?? "").trim().split(/\s+/)[0] || "Applicant";
const OPEN_REPAIRS = ["submitted", "acknowledged", "triage"];

export async function todayList(): Promise<{ items: TodayItem[]; showingsToday: { at: string; home: string | null; name: string | null }[] }> {
  const db = getSupabaseAdmin();
  const now = new Date();
  const dayStart = new Date(now.toLocaleDateString("en-CA", { timeZone: "America/Toronto" }) + "T00:00:00-05:00");
  const week = weekOf();

  const [vr, apps, reviews, msgs, placements, updates, showings, repairs, infoDone] = await Promise.all([
    db.from("viewing_requests").select("id, full_name, created_at, properties(address)").eq("status", "new").order("created_at"),
    db.from("applications").select("id, tenant_name, status, stage, ai_summary, created_at, updated_at, owner_sent_at, rent_requested_at, rent_reference, rent_amount_due, rent_received_at, singlekey_done_at, properties(address)")
      .not("status", "in", "(rejected)").not("stage", "in", "(declined,owner_declined,move_in)"),
    db.from("placement_reviews").select("id, placement_id, application_id, applicant_summary, status, released_at, updated_at, placements(address, is_demo)").in("status", ["released", "clarification"]),
    db.from("placement_messages").select("placement_id, review_id, sender, created_at").order("created_at", { ascending: false }).limit(200),
    db.from("placements").select("id, address, is_demo, status, completed_at, next_action, next_action_owner, next_action_due, agreement_signed_at").is("completed_at", null),
    db.from("placement_updates").select("placement_id, status, week_start").eq("week_start", week.start),
    db.from("fo_appointments").select("starts_at, status, tenant_name, properties(address)").gte("starts_at", dayStart.toISOString()).lt("starts_at", new Date(dayStart.getTime() + DAY).toISOString()).in("status", ["confirmed", "in_progress", "reassignment_pending"]).order("starts_at"),
    db.from("tenant_maintenance_requests").select("id, created_at, status", { count: "exact" }).in("status", OPEN_REPAIRS),
    db.from("application_info_requests").select("application_id, completed_at").gte("completed_at", new Date(Date.now() - 3 * DAY).toISOString()),
  ]);

  const items: TodayItem[] = [];
  const addr = (x: unknown) => (x as { address?: string } | null)?.address ?? null;

  for (const r of vr.data ?? []) {
    items.push({ id: `vr-${r.id}`, kind: "viewing", title: `Call ${r.full_name || "a new renter"} about a viewing`, detail: "Prequalified viewing request", home: addr(r.properties), href: "/admin/viewing-requests", at: r.created_at, urgent: hoursSince(r.created_at) > 24 });
  }

  const extra = new Set((infoDone.data ?? []).map((r) => r.application_id));
  for (const a of apps.data ?? []) {
    const who = a.tenant_name, home = addr(a.properties), href = `/admin/applications/${a.id}`;
    if (a.stage === "review" || !a.stage) {
      if (a.status === "approved") continue;
      if (!a.ai_summary) continue; // the AI is still reading it
      items.push({ id: `app-${a.id}`, kind: "application", title: extra.has(a.id) ? `${firstName(who)} sent the extra details. Review again` : `Review ${who}'s application`, detail: "AI report ready. Send to the owner, ask for more, or decline.", home, href, at: a.updated_at ?? a.created_at, urgent: hoursSince(a.created_at) > 48 });
    } else if (a.stage === "sent_to_owner" && a.owner_sent_at && hoursSince(a.owner_sent_at) > 48) {
      items.push({ id: `own-${a.id}`, kind: "owner", title: `Nudge the owner about ${firstName(who)}`, detail: "They haven't decided in 2 days", home, href, at: a.owner_sent_at, urgent: true });
    } else if (a.stage === "owner_approved") {
      items.push({ id: `rent-${a.id}`, kind: "payment", title: `Ask ${firstName(who)} for the first month's rent`, detail: "Owner approved to proceed", home, href, at: a.updated_at, urgent: hoursSince(a.updated_at) > 24 });
    } else if (a.stage === "rent_requested") {
      items.push({ id: `paid-${a.id}`, kind: "payment", title: `Check for ${firstName(who)}'s e-transfer`, detail: `${a.rent_amount_due ? money(a.rent_amount_due) : "First month's rent"} · reference ${a.rent_reference}`, home, href, at: a.rent_requested_at ?? a.updated_at, urgent: hoursSince(a.rent_requested_at ?? a.updated_at) > 72 });
    } else if (a.stage === "rent_received") {
      items.push({ id: `sk-${a.id}`, kind: "application", title: `Run SingleKey for ${firstName(who)}`, detail: "Rent is in. Upload the report when it's back.", home, href, at: a.rent_received_at ?? a.updated_at, urgent: false });
    } else if (a.stage === "screened") {
      items.push({ id: `mi-${a.id}`, kind: "application", title: `Approve ${firstName(who)} and start move-in`, detail: "SingleKey is back", home, href, at: a.singlekey_done_at ?? a.updated_at, urgent: false });
    }
  }

  // Owner asked a question on their dashboard and we haven't answered yet.
  const lastMsg = new Map<string, { sender: string; created_at: string }>();
  for (const m of msgs.data ?? []) if (m.review_id && !lastMsg.has(m.review_id)) lastMsg.set(m.review_id, m);
  for (const r of reviews.data ?? []) {
    const pl = r.placements as unknown as { address: string; is_demo: boolean } | null;
    if (pl?.is_demo) continue;
    const last = lastMsg.get(r.id);
    if (r.status === "clarification" && last?.sender === "owner") {
      items.push({ id: `q-${r.id}`, kind: "owner", title: "Answer the owner's question", detail: r.applicant_summary, home: pl?.address ?? null, href: `/admin/placements/${r.placement_id}`, at: last.created_at, urgent: hoursSince(last.created_at) > 12 });
    }
  }

  const published = new Set((updates.data ?? []).filter((u) => u.status === "published").map((u) => u.placement_id));
  const drafted = new Set((updates.data ?? []).filter((u) => u.status === "draft").map((u) => u.placement_id));
  const dow = (new Date(now.toLocaleDateString("en-CA", { timeZone: "America/Toronto" }) + "T12:00:00Z").getUTCDay() + 6) % 7; // Mon=0
  for (const p of placements.data ?? []) {
    if (p.is_demo) continue;
    if (dow >= 3 && !published.has(p.id)) {
      items.push({ id: `wk-${p.id}`, kind: "update", title: drafted.has(p.id) ? "Read and publish this week's owner update" : "Send this week's owner update", detail: [drafted.has(p.id) ? "AI draft ready" : null, dow >= 4 ? "Due today" : "Due Friday"].filter(Boolean).join(" · "), home: p.address, href: `/admin/placements/${p.id}?tab=updates`, at: `${week.start}T12:00:00Z`, urgent: dow >= 4 });
    }
    if (p.next_action && p.next_action_owner !== "Owner" && p.next_action_due && p.next_action_due <= now.toISOString().slice(0, 10)) {
      items.push({ id: `na-${p.id}`, kind: "next_action", title: p.next_action, detail: `Due ${p.next_action_due}`, home: p.address, href: `/admin/placements/${p.id}`, at: `${p.next_action_due}T12:00:00Z`, urgent: true });
    }
  }

  if ((repairs.count ?? 0) > 0) {
    const oldest = (repairs.data ?? []).map((r) => r.created_at).sort()[0];
    items.push({ id: "repairs", kind: "repair", title: `${repairs.count} new repair request${repairs.count === 1 ? "" : "s"} to triage`, detail: null, home: null, href: "/admin/maintenance", at: oldest ?? now.toISOString(), urgent: oldest ? hoursSince(oldest) > 24 : false });
  }

  items.sort((a, b) => Number(b.urgent) - Number(a.urgent) || a.at.localeCompare(b.at));
  return {
    items,
    showingsToday: (showings.data ?? []).map((s) => ({ at: s.starts_at, home: addr(s.properties), name: s.tenant_name })),
  };
}
