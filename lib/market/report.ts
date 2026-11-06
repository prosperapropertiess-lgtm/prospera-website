import { getSupabaseAdmin } from "@/lib/supabase";
import { applyOverrides, stats, type Obs, type Override, type Stats } from "@/lib/market/core";
import { coverageWarnings, diffScans } from "@/lib/market/compare";
import { listSnapshots, type SnapshotMeta } from "@/lib/market/server";

// Public "London Rent Report": aggregates and anonymous dots only.
// No titles, streets, links or IDs ever leave the server.

export type EditionKind = "weekly" | "monthly";

export interface Edition { key: string; kind: EditionKind; label: string; date: string }

/** A public dot: price and a few broad facts, nothing that identifies an ad. */
export interface PublicDot { p: number; b: string; t: string; a: string | null; c: "whole" | "room" }

export interface ReportData {
  edition: Edition;
  scanDate: string;
  scanLabel: string | null;
  isFirst: boolean;
  dots: PublicDot[];
  observed: number;
  whole: Stats;
  room: Stats;
  prev: { label: string; date: string; whole: Stats; room: Stats; comparable: boolean; warnings: string[] } | null;
  changes: { firstSeen: number; notSeen: number; pairs: number; reduced: number; increased: number; medianCutPct: number | null } | null;
  amenities: { label: string; yes: number; stated: number }[];
  method: { radiusKm: number | null; segments: number | null; pages: number | null; rawHits: number | null; pagesPerSearch: number | null };
  areasNamed: number;
  /** Where this edition's ads came from, worked out from each ad's link. */
  sources: { name: string; ads: number }[];
  counted: number;
  /** One point per scan up to this edition. Empty until there are at least two scans. */
  history: HistoryPoint[];
  /** "Still advertised two weeks later", split by price. Null until scans span two weeks. */
  sitting: { from: string; to: string; above: { n: number; still: number }; below: { n: number; still: number } } | null;
  editions: Edition[];
}

export interface HistoryPoint {
  date: string;
  ads: number;
  newAds: number | null;
  returning: number | null;
  wholeMedian: number | null;
  roomMedian: number | null;
  byBeds: Record<string, { median: number | null; n: number }>;
  cuts: { pairs: number; reduced: number; medianCutPct: number | null } | null;
}

type Lite = { id: string; p: number | null; c: string; b: string };

async function lite(snapshotId: string): Promise<Lite[]> {
  const out: Lite[] = [];
  for (let from = 0; ; from += 1000) {
    const { data } = await getSupabaseAdmin().from("market_observations")
      .select("listing_id, cohort, price:norm->price, beds:norm->>beds_cat").eq("snapshot_id", snapshotId).range(from, from + 999);
    for (const d of data ?? []) out.push({ id: d.listing_id, p: d.price as number | null, c: d.cohort, b: d.beds as string });
    if (!data || data.length < 1000) break;
  }
  return out;
}

const med = (xs: number[]) => stats(xs).median;

async function buildHistory(snaps: SnapshotMeta[], upTo: string): Promise<{ history: HistoryPoint[]; sitting: ReportData["sitting"] }> {
  const ordered = snaps.filter((s) => s.scan_date! <= upTo).sort((a, b) => (a.scan_date! < b.scan_date! ? -1 : 1));
  if (ordered.length < 2) return { history: [], sitting: null };
  const rows = await Promise.all(ordered.map((s) => lite(s.id)));
  const seenBefore = new Set<string>();
  const history: HistoryPoint[] = ordered.map((s, i) => {
    const cur = rows[i];
    const counted = cur.filter((o) => (o.c === "whole" || o.c === "room") && o.p != null);
    const whole = counted.filter((o) => o.c === "whole");
    const byBeds: HistoryPoint["byBeds"] = {};
    for (const b of ["1", "2", "3", "4", "5+"]) {
      const ps = whole.filter((o) => o.b === b).map((o) => o.p!);
      byBeds[b] = { median: med(ps), n: ps.length };
    }
    const fresh = i === 0 ? null : cur.filter((o) => !seenBefore.has(o.id)).length;
    let cuts: HistoryPoint["cuts"] = null;
    if (i > 0) {
      const prev = new Map(rows[i - 1].filter((o) => o.p != null).map((o) => [o.id, o.p!]));
      const pairs = counted.filter((o) => prev.has(o.id));
      const drops = pairs.filter((o) => o.p! < prev.get(o.id)!).map((o) => ((o.p! - prev.get(o.id)!) / prev.get(o.id)!) * 100);
      cuts = { pairs: pairs.length, reduced: drops.length, medianCutPct: drops.length ? med(drops) : null };
    }
    cur.forEach((o) => seenBefore.add(o.id));
    return {
      date: s.scan_date!, ads: cur.length, newAds: fresh, returning: fresh == null ? null : cur.length - fresh,
      wholeMedian: med(whole.map((o) => o.p!)), roomMedian: med(counted.filter((o) => o.c === "room").map((o) => o.p!)), byBeds, cuts,
    };
  });

  // Of the whole-home ads seen about two weeks before this edition, how many are still advertised now?
  let sitting: ReportData["sitting"] = null;
  const last = ordered[ordered.length - 1];
  const cutoff = new Date(`${last.scan_date}T12:00:00Z`); cutoff.setUTCDate(cutoff.getUTCDate() - 13);
  const fromIdx = ordered.map((s) => s.scan_date! <= cutoff.toISOString().slice(0, 10)).lastIndexOf(true);
  if (fromIdx >= 0) {
    const then = rows[fromIdx].filter((o) => o.c === "whole" && o.p != null);
    const now = new Set(rows[rows.length - 1].map((o) => o.id));
    const typicalByBeds = new Map(["1", "2", "3", "4", "5+"].map((b) => [b, med(then.filter((o) => o.b === b).map((o) => o.p!))]));
    const above = then.filter((o) => typicalByBeds.get(o.b) != null && o.p! > typicalByBeds.get(o.b)!);
    const below = then.filter((o) => typicalByBeds.get(o.b) != null && o.p! <= typicalByBeds.get(o.b)!);
    sitting = {
      from: ordered[fromIdx].scan_date!, to: last.scan_date!,
      above: { n: above.length, still: above.filter((o) => now.has(o.id)).length },
      below: { n: below.length, still: below.filter((o) => now.has(o.id)).length },
    };
  }
  return { history, sitting };
}

const SOURCE_NAMES: [RegExp, string][] = [
  [/facebook\.com/, "Facebook Marketplace"], [/kijiji\.ca/, "Kijiji"], [/rentals\.ca/, "Rentals.ca"],
  [/padmapper\.com/, "PadMapper"], [/zumper\.com/, "Zumper"], [/realtor\.ca/, "Realtor.ca"], [/craigslist/, "Craigslist"],
];
function sourceOf(o: Obs): string {
  const url = o.norm.url ?? o.raw.url ?? "";
  for (const [re, name] of SOURCE_NAMES) if (re.test(url)) return name;
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return "Other public sites"; }
}

const monthLabel = (ym: string) => new Date(`${ym}-15T12:00:00`).toLocaleDateString("en-CA", { month: "long", year: "numeric" });
const dayLabel = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" });

export async function listEditions(): Promise<{ editions: Edition[]; snaps: SnapshotMeta[] }> {
  const snaps = (await listSnapshots()).filter((s) => s.scan_date);
  const weekly: Edition[] = snaps.map((s) => ({ key: s.scan_date!, kind: "weekly", label: `Week of ${dayLabel(s.scan_date!)}`, date: s.scan_date! }));
  const months = [...new Set(snaps.map((s) => s.scan_date!.slice(0, 7)))];
  const thisMonth = new Date().toLocaleDateString("en-CA", { timeZone: "America/Toronto" }).slice(0, 7);
  const monthly: Edition[] = months.map((m) => ({ key: m, kind: "monthly", label: `${monthLabel(m)}${m === thisMonth ? " (so far)" : ""}`, date: snaps.find((s) => s.scan_date!.startsWith(m))!.scan_date! }));
  return { editions: [...weekly, ...monthly], snaps };
}

async function observations(snapshotId: string, overrides: Override[]): Promise<Obs[]> {
  const out: Obs[] = [];
  for (let from = 0; ; from += 1000) {
    const { data } = await getSupabaseAdmin().from("market_observations").select("listing_id, source_row, raw, norm, cohort, flags")
      .eq("snapshot_id", snapshotId).range(from, from + 999);
    out.push(...((data ?? []) as Obs[]).map((o) => applyOverrides(o, overrides, snapshotId)));
    if (!data || data.length < 1000) break;
  }
  return out;
}

export async function loadReport(key?: string | null): Promise<ReportData | null> {
  const { editions, snaps } = await listEditions();
  if (!snaps.length) return null;
  // "weekly" / "monthly" are evergreen: always the newest edition of that kind.
  const latestOf = (kind: EditionKind) => editions.filter((e) => e.kind === kind).sort((a, b) => (a.key < b.key ? 1 : -1))[0];
  const edition = !key || key === "weekly" ? latestOf("weekly") : key === "monthly" ? latestOf("monthly") : editions.find((e) => e.key === key);
  if (!edition) return null;

  // Weekly: that scan. Monthly: the last scan in the month, compared with the last scan of an earlier month.
  const byDateDesc = [...snaps].sort((a, b) => (a.scan_date! < b.scan_date! ? 1 : -1));
  const snap = edition.kind === "weekly"
    ? byDateDesc.find((s) => s.scan_date === edition.key)!
    : byDateDesc.find((s) => s.scan_date!.startsWith(edition.key))!;
  const prevSnap = edition.kind === "weekly"
    ? byDateDesc.find((s) => s.scan_date! < snap.scan_date!)
    : byDateDesc.find((s) => s.scan_date!.slice(0, 7) < edition.key);

  const { data: ov } = await getSupabaseAdmin().from("market_overrides").select("listing_id, field, reviewed_value, snapshot_id, scope");
  const overrides = (ov ?? []) as Override[];
  const cur = await observations(snap.id, overrides);
  const prevObs = prevSnap ? await observations(prevSnap.id, overrides) : null;

  const counted = cur.filter((o) => o.cohort === "whole" || o.cohort === "room");
  const dots: PublicDot[] = counted.map((o) => ({ p: o.norm.price!, b: o.norm.beds_cat, t: o.norm.type, a: o.norm.area, c: o.cohort as "whole" | "room" }));
  const whole = stats(cur.filter((o) => o.cohort === "whole").map((o) => o.norm.price!));
  const room = stats(cur.filter((o) => o.cohort === "room").map((o) => o.norm.price!));

  let prev: ReportData["prev"] = null;
  let changes: ReportData["changes"] = null;
  if (prevSnap && prevObs) {
    const warnings = coverageWarnings(snap, prevSnap);
    prev = {
      label: edition.kind === "weekly" ? `week of ${dayLabel(prevSnap.scan_date!)}` : monthLabel(prevSnap.scan_date!.slice(0, 7)),
      date: prevSnap.scan_date!, warnings, comparable: !warnings.length,
      whole: stats(prevObs.filter((o) => o.cohort === "whole").map((o) => o.norm.price!)),
      room: stats(prevObs.filter((o) => o.cohort === "room").map((o) => o.norm.price!)),
    };
    const d = diffScans(counted, prevObs.filter((o) => o.cohort === "whole" || o.cohort === "room"));
    const cuts = d.reduced.map((x) => x.pct ?? 0).sort((a, b) => a - b);
    changes = {
      firstSeen: d.firstSeen.length, notSeen: d.notSeen.length, pairs: d.pairs.length, reduced: d.reduced.length, increased: d.increased.length,
      medianCutPct: cuts.length ? cuts[Math.floor((cuts.length - 1) / 2)] : null,
    };
  }

  // Amenities among whole homes, out of the ads that say anything about it.
  const wholeObs = cur.filter((o) => o.cohort === "whole");
  const share = (label: string, stated: (o: Obs) => boolean, yes: (o: Obs) => boolean) => {
    const s = wholeObs.filter(stated);
    return { label, stated: s.length, yes: s.filter(yes).length };
  };
  const amenities = [
    share("In-suite laundry", (o) => !!o.norm.laundry, (o) => o.norm.laundry === "in-unit"),
    share("Pets allowed", (o) => !!o.norm.pets, (o) => o.norm.pets !== "no pets"),
    share("All utilities included", (o) => o.norm.utilities.length > 0, (o) => o.norm.utilities.includes("all inclusive")),
    share("Parking included", (o) => !!o.norm.parking, (o) => !!o.norm.parking && o.norm.parking !== "none" && o.norm.parking !== "street"),
    share("Furnished", (o) => !!o.norm.furnished, (o) => o.norm.furnished === "furnished"),
  ];

  const { history, sitting } = await buildHistory(snaps, snap.scan_date!);
  const { data: full } = await getSupabaseAdmin().from("market_snapshots").select("summary").eq("id", snap.id).single();
  const r = (full?.summary?.reported ?? {}) as Record<string, number | null>;

  return {
    edition, scanDate: snap.scan_date!, scanLabel: snap.scan_label, isFirst: !prevSnap,
    dots, observed: cur.length, whole, room, prev, changes, amenities,
    method: { radiusKm: r.radiusKm ?? null, segments: r.segments ?? null, pages: r.pages ?? null, rawHits: r.rawHits ?? null, pagesPerSearch: r.segments && r.pages ? Math.round(r.pages / r.segments) : null },
    areasNamed: counted.filter((o) => o.norm.area).length,
    sources: [...cur.reduce((m, o) => m.set(sourceOf(o), (m.get(sourceOf(o)) ?? 0) + 1), new Map<string, number>())].map(([name, ads]) => ({ name, ads })).sort((a, b) => b.ads - a.ads),
    counted: counted.length,
    history, sitting,
    editions,
  };
}
