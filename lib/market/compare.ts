import { pctChange, type Obs } from "@/lib/market/core";

export type CompareMode = "previous" | "week" | "month" | "quarter" | "year" | "custom";

export const COMPARE_LABEL: Record<CompareMode, string> = {
  previous: "Previous scan", week: "Week ago", month: "Month ago", quarter: "Quarter ago", year: "Year ago", custom: "Pick a scan",
};

export interface SnapLike { id: string; scan_date: string | null; scan_label: string | null; reported?: Record<string, number | null> | null }

function shift(date: string, mode: CompareMode): string {
  const [y, m, d] = date.split("-").map(Number);
  if (mode === "week") return new Date(Date.UTC(y, m - 1, d - 7)).toISOString().slice(0, 10);
  const back = mode === "month" ? 1 : mode === "quarter" ? 3 : 12;
  const target = new Date(Date.UTC(y, m - 1 - back, 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d, last));  // clamp to the last day of a shorter month
  return target.toISOString().slice(0, 10);
}

const TOLERANCE: Record<CompareMode, number> = { previous: 0, custom: 0, week: 3, month: 7, quarter: 14, year: 21 };

/** Finds the scan to compare against. Never silently substitutes an arbitrary older scan. */
export function pickComparison(snaps: SnapLike[], selectedId: string, mode: CompareMode, customId?: string | null): { snap: SnapLike | null; reason: string | null } {
  const sorted = [...snaps].filter((s) => s.scan_date).sort((a, b) => (a.scan_date! < b.scan_date! ? 1 : -1));
  const cur = sorted.find((s) => s.id === selectedId);
  if (!cur) return { snap: null, reason: "The selected scan has no date." };
  const older = sorted.filter((s) => s.scan_date! < cur.scan_date!);
  if (mode === "custom") {
    const s = snaps.find((x) => x.id === customId && x.id !== selectedId);
    return s ? { snap: s, reason: null } : { snap: null, reason: "Pick a scan to compare with." };
  }
  if (mode === "previous") return older[0] ? { snap: older[0], reason: null } : { snap: null, reason: "No earlier scan yet. History starts with the first scan." };
  const target = shift(cur.scan_date!, mode);
  const floor = new Date(`${target}T00:00:00Z`); floor.setUTCDate(floor.getUTCDate() - TOLERANCE[mode]);
  const pick = older.find((s) => s.scan_date! <= target && s.scan_date! >= floor.toISOString().slice(0, 10));
  return pick ? { snap: pick, reason: null } : { snap: null, reason: `No comparable scan near ${target}.` };
}

/** Differences in how two scans were collected. Any warning blocks automatic change badges. */
export function coverageWarnings(a: SnapLike, b: SnapLike): string[] {
  const w: string[] = [];
  const ra = a.reported ?? {}, rb = b.reported ?? {};
  for (const [k, label] of [["radiusKm", "search radius"], ["segments", "number of search segments"], ["pages", "pages read"]] as const) {
    if (ra[k] != null && rb[k] != null && ra[k] !== rb[k]) w.push(`Different ${label}: ${rb[k]} vs ${ra[k]}.`);
    if ((ra[k] == null) !== (rb[k] == null)) w.push(`The ${label} is only known for one of the scans.`);
  }
  return w;
}

export interface MatchedPair { id: string; cur: Obs; prev: Obs; change: number; pct: number | null }

/** Same advertisement in both scans, same price basis, valid prices. */
export function diffScans(cur: Obs[], prev: Obs[]) {
  const prevById = new Map(prev.map((o) => [o.listing_id, o]));
  const curIds = new Set(cur.map((o) => o.listing_id));
  const firstSeen = cur.filter((o) => !prevById.has(o.listing_id));
  const notSeen = prev.filter((o) => !curIds.has(o.listing_id));
  const pairs: MatchedPair[] = [];
  for (const o of cur) {
    const p = prevById.get(o.listing_id);
    if (!p || o.norm.price == null || p.norm.price == null || o.norm.price_basis !== p.norm.price_basis) continue;
    pairs.push({ id: o.listing_id, cur: o, prev: p, change: o.norm.price - p.norm.price, pct: pctChange(o.norm.price, p.norm.price) });
  }
  return {
    firstSeen, notSeen, pairs,
    reduced: pairs.filter((x) => x.change < 0),
    increased: pairs.filter((x) => x.change > 0),
    unchanged: pairs.filter((x) => x.change === 0),
  };
}
