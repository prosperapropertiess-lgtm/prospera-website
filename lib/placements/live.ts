// Live numbers and activity for an owner's dashboard, straight from our own records:
// viewing requests (prequalifications), FieldOps showings and specialist reports,
// applications, plus where the home sits in the latest rental market scan.
// Owners never see prospects' names or contact details here.
import { db } from "./core";
import { listSnapshots } from "@/lib/market/server";
import { stats, percentileOf, type Norm } from "@/lib/market/core";

export interface ActivityItem { at: string; kind: "inquiry" | "showing_booked" | "showing_done" | "application" | "listing" | "prep" | "update" | "decision"; title: string; detail?: string | null; tone?: "good" | "neutral" | "warn" }

const INTEREST: Record<string, string> = { interested: "Interested", unsure: "Unsure", not_interested: "Not interested", high: "Interested", medium: "Unsure", low: "Unsure", none: "Not interested" };
const fTime = (iso: string) => new Date(iso).toLocaleString("en-CA", { timeZone: "America/Toronto", weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).replace(/\./g, "");

export async function liveData(p: { id: string; property_id: string | null; agreement_signed_at: string | null; asking_rent: number | null }) {
  const since = p.agreement_signed_at ?? new Date(Date.now() - 90 * 864e5).toISOString();
  const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
  const empty = { counts: null as null | Record<string, number>, upcoming: [] as { at: string; count: number }[], activity: [] as ActivityItem[], firstListed: null as string | null };
  const [{ data: events }] = await Promise.all([
    db().from("placement_events").select("kind, detail, created_at").eq("placement_id", p.id).in("kind", ["listing_published", "prep", "update_published", "owner_approved", "owner_declined", "application_released"]).order("created_at", { ascending: false }).limit(40),
  ]);
  const activity: ActivityItem[] = [];
  for (const e of events ?? []) {
    const d = (e.detail ?? {}) as Record<string, unknown>;
    if (e.kind === "listing_published") activity.push({ at: e.created_at, kind: "listing", title: "Your listing went live", tone: "good" });
    if (e.kind === "prep" && d.status === "completed") activity.push({ at: e.created_at, kind: "prep", title: `${String(d.item ?? "").replace("_", " ").replace(/^./, (c) => c.toUpperCase())} done`, tone: "good" });
    if (e.kind === "update_published") activity.push({ at: e.created_at, kind: "update", title: "New weekly update posted" });
    if (e.kind === "application_released") activity.push({ at: e.created_at, kind: "application", title: "An application is ready for your review", tone: "warn" });
    if (e.kind === "owner_approved") activity.push({ at: e.created_at, kind: "decision", title: "You approved an applicant to proceed", tone: "good" });
    if (e.kind === "owner_declined") activity.push({ at: e.created_at, kind: "decision", title: "You declined an applicant" });
  }
  if (!p.property_id) return { ...empty, activity };

  const [{ data: reqs }, { data: appts }, { data: apps }, { data: prop }] = await Promise.all([
    db().from("viewing_requests").select("created_at, move_in_date, occupants, email, phone").eq("property_id", p.property_id).gte("created_at", since).order("created_at", { ascending: false }).limit(200),
    db().from("fo_appointments").select("id, starts_at, status, fo_checklists(interest, feedback, completed_at)").eq("property_id", p.property_id).gte("created_at", since).order("starts_at", { ascending: false }).limit(200),
    db().from("applications").select("created_at").eq("property_id", p.property_id).gte("created_at", since),
    db().from("properties").select("published_at").eq("id", p.property_id).maybeSingle(),
  ]);

  // One person who asked more than once counts once.
  const people = new Map<string, string>();
  for (const r of reqs ?? []) {
    const key = r.email?.toLowerCase() || (r.phone ?? "").replace(/\D/g, "") || r.created_at;
    if (!people.has(key)) people.set(key, r.created_at);
    activity.push({ at: r.created_at, kind: "inquiry", title: "New prequalified viewing request", detail: [r.occupants ? `${r.occupants} ${r.occupants === 1 ? "person" : "people"}` : null, r.move_in_date ? `wants to move in ${new Date(`${r.move_in_date}T12:00:00Z`).toLocaleDateString("en-CA", { month: "short", day: "numeric", timeZone: "UTC" })}` : null].filter(Boolean).join(" · ") });
  }
  const now = Date.now();
  const live = (appts ?? []).filter((a) => !["cancelled"].includes(a.status));
  for (const a of live) {
    const cl = (Array.isArray(a.fo_checklists) ? a.fo_checklists[0] : a.fo_checklists) as { interest?: string; feedback?: Record<string, string>; completed_at?: string } | null;
    const fb = cl?.feedback ?? {};
    if (cl?.completed_at && a.status !== "no_show") {
      const interest = INTEREST[fb.interest ?? cl.interest ?? ""] ?? null;
      activity.push({ at: cl.completed_at, kind: "showing_done", title: `Showing completed${interest ? ` · ${interest}` : ""}`, tone: interest === "Interested" ? "good" : "neutral",
        detail: [fb.liked && `Liked: ${fb.liked}`, (fb.main_concern || fb.blocker) && `Concern: ${fb.main_concern || fb.blocker}`].filter(Boolean).join(" · ") || null });
    } else if (a.status === "no_show") {
      activity.push({ at: a.starts_at, kind: "showing_done", title: "A prospect didn't show up", tone: "neutral" });
    } else if (new Date(a.starts_at).getTime() > now) {
      activity.push({ at: a.starts_at, kind: "showing_booked", title: `Showing booked for ${fTime(a.starts_at)}` });
    }
  }
  for (const a of apps ?? []) activity.push({ at: a.created_at, kind: "application", title: "Application received. We're screening it.", tone: "good" });

  const upcomingMap = new Map<string, number>();
  for (const a of live) if (new Date(a.starts_at).getTime() > now && ["confirmed", "in_progress"].includes(a.status)) upcomingMap.set(a.starts_at, (upcomingMap.get(a.starts_at) ?? 0) + 1);

  const counts = {
    inquiries: people.size,
    inquiriesWeek: [...people.values()].filter((t) => t >= weekAgo).length,
    showingsDone: live.filter((a) => ["completed", "followed_up"].includes(a.status)).length,
    showingsBooked: live.filter((a) => new Date(a.starts_at).getTime() > now && ["confirmed", "in_progress"].includes(a.status)).length,
    applications: (apps ?? []).length,
  };
  return {
    counts,
    upcoming: [...upcomingMap.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(0, 5).map(([at, count]) => ({ at, count })),
    activity: activity.filter((x) => x.at <= new Date(now + 30 * 864e5).toISOString()).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 40),
    firstListed: prop?.published_at ?? null,
  };
}

/** Where the asking rent sits among similar whole-home listings in our latest London scan. Anonymous: prices only. */
export async function marketCompare(propertyId: string | null, askingRent: number | null) {
  if (!propertyId) return null;
  const { data: prop } = await db().from("properties").select("bedrooms, property_type, utilities_included, city").eq("id", propertyId).maybeSingle();
  if (!prop || prop.bedrooms == null) return null;
  const snap = (await listSnapshots())[0];
  if (!snap) return null;
  const { data: obs } = await db().from("market_observations").select("norm, cohort").eq("snapshot_id", snap.id).eq("cohort", "whole").limit(2000);
  const beds = prop.bedrooms >= 5 ? "5+" : String(prop.bedrooms);
  const rows = (obs ?? []).map((o) => o.norm as Norm).filter((n) => n.price && n.price > 300 && n.price < 10000);
  const same = rows.filter((n) => n.beds_cat === beds).map((n) => n.price!) as number[];
  if (same.length < 5) return { scanDate: snap.scan_date, beds, n: same.length, enough: false as const };
  const s = stats(same);
  const neighbours = [prop.bedrooms - 1, prop.bedrooms + 1].filter((b) => b >= 0).map((b) => {
    const vals = rows.filter((n) => n.beds_cat === (b >= 5 ? "5+" : String(b))).map((n) => n.price!) as number[];
    return { beds: b, n: vals.length, median: vals.length >= 5 ? stats(vals).median : null };
  });
  return {
    scanDate: snap.scan_date, beds, n: s.n, enough: true as const,
    median: s.median, p25: s.p25, p75: s.p75, min: s.min, max: s.max,
    percentile: askingRent ? percentileOf(askingRent, same) : null,
    prices: same.sort((a, b) => a - b),
    utilitiesIncluded: !!prop.utilities_included,
    neighbours,
  };
}
