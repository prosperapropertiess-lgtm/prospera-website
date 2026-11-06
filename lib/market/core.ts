// Rental market dashboard: normalization, eligibility, filters and metrics.
// Pure functions, shared by the ingest pipeline (server) and the dashboard (browser),
// so every card, chart, table and export uses the same rules.

export const PARSER_VERSION = "market-v1";

export const LISTING_FIELDS = [
  "listing_id", "title", "price", "price_basis", "type", "bedrooms", "bathrooms", "sqft", "parking", "laundry",
  "pets", "furnished", "utilities", "available_date", "street_address", "area", "url", "creation_date",
  "first_seen", "source_queries",
] as const;

export type Cohort = "whole" | "room" | "review" | "none";

export type Flag =
  | "room_whole_conflict"   // type=room but price_basis=whole_unit
  | "price_invalid"         // price missing, zero, or not a number
  | "basis_unknown"         // price_basis isn't whole_unit or per_room
  | "zero_baths"            // bathrooms stated as 0
  | "utilities_parking"     // "parking" listed under utilities
  | "duplicate_conflict"    // same listing_id, different content
  | "ambiguous_date"        // availability month/day with no year
  | "url_invalid"
  | "reviewed";             // a review override was applied

export const FLAG_TEXT: Record<Flag, string> = {
  room_whole_conflict: "Marked as a room but priced as a whole unit",
  price_invalid: "Price missing or not usable",
  basis_unknown: "Price basis not recognised",
  zero_baths: "Bathrooms stated as 0",
  utilities_parking: "\"Parking\" listed as a utility",
  duplicate_conflict: "Same listing ID with different details",
  ambiguous_date: "Availability date has no year",
  url_invalid: "Listing link not usable",
  reviewed: "Corrected in review",
};

/** Flags that keep a row out of rent statistics (the rest are informational). */
export const BLOCKING_FLAGS: Flag[] = ["room_whole_conflict", "price_invalid", "basis_unknown", "duplicate_conflict"];

export interface Availability {
  kind: "immediately" | "month_day" | "date" | "text" | "none";
  month?: number;
  day?: number;
  iso?: string;
}

export interface Norm {
  title: string;
  price: number | null;
  price_basis: string;
  type: string;
  beds: number | null;
  beds_cat: string;          // "0".."4", "5+", "unknown"
  baths: number | null;
  sqft: number | null;
  parking: string | null;
  laundry: string | null;
  pets: string | null;
  furnished: "furnished" | "unfurnished" | null;
  utilities: string[];
  available: Availability;
  address: string | null;
  area: string | null;
  url: string | null;
  created_at: string | null;  // ISO instant
  created_date: string | null; // YYYY-MM-DD in Toronto
  first_seen: string | null;
  queries: string[];
  extra: Record<string, string>;
}

export interface Obs {
  listing_id: string;
  source_row: number | null;
  raw: Record<string, string>;
  norm: Norm;
  cohort: Cohort;
  flags: Flag[];
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const blank = (v: string | undefined) => !v || !v.trim() || v.trim().toLowerCase() === "unstated";

function torontoDate(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-CA", { timeZone: "America/Toronto" });
}

function parseAvailability(v: string): Availability {
  const s = v.trim().toLowerCase();
  if (!s) return { kind: "none" };
  if (/^(immediately|now|asap)$/.test(s)) return { kind: "immediately" };
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return { kind: "date", iso: s };
  const m = s.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/);
  if (m) {
    const day = s.match(/\b(\d{1,2})\b/);
    return { kind: "month_day", month: MONTHS.indexOf(m[1]) + 1, day: day ? Number(day[1]) : undefined };
  }
  return { kind: "text" };
}

function parseNumber(v: string | undefined): number | null {
  if (blank(v)) return null;
  const n = Number(String(v).replace(/[$,\s]/g, "").replace(/sq\.?\s*ft|sqft/i, ""));
  return Number.isFinite(n) ? n : null;
}

/** Normalizes one source row. Original values stay in `raw`; nothing here guesses a missing value. */
export function normalizeRow(raw: Record<string, string>): { norm: Norm; cohort: Cohort; flags: Flag[] } {
  const flags: Flag[] = [];
  const g = (k: string) => (raw[k] ?? "").trim();

  const price = parseNumber(g("price"));
  if (price == null || price <= 0) flags.push("price_invalid");

  const basis = g("price_basis").toLowerCase();
  if (basis !== "whole_unit" && basis !== "per_room") flags.push("basis_unknown");

  const type = g("type").toLowerCase().replace(/s$/, "") || "unknown";
  if (type === "room" && basis === "whole_unit") flags.push("room_whole_conflict");

  const bedsRaw = g("bedrooms").toLowerCase();
  let beds: number | null = null;
  let beds_cat = "unknown";
  if (bedsRaw === "studio" || bedsRaw === "0") { beds = 0; beds_cat = "0"; }
  else if (/^\d+\s*\+$/.test(bedsRaw) || Number(bedsRaw) >= 5) { beds_cat = "5+"; beds = /^\d+$/.test(bedsRaw) ? Number(bedsRaw) : null; }
  else if (/^\d+$/.test(bedsRaw)) { beds = Number(bedsRaw); beds_cat = bedsRaw; }

  const baths = parseNumber(g("bathrooms"));
  if (baths === 0) flags.push("zero_baths");

  const sqftMatch = g("sqft").match(/[\d,]+(\.\d+)?/);
  const sqft = sqftMatch ? Number(sqftMatch[0].replace(/,/g, "")) || null : null;

  const laundryRaw = g("laundry").toLowerCase();
  const laundry = !laundryRaw ? null : laundryRaw.replace(/\s+/g, "-") === "in-building" ? "in-building" : laundryRaw;

  const furnRaw = g("furnished").toLowerCase();
  const furnished = !furnRaw ? null : furnRaw.includes("unfurnished") ? "unfurnished" : furnRaw.includes("furnished") ? "furnished" : null;

  const utilities = g("utilities").toLowerCase().split(";").map((s) => s.trim()).filter(Boolean);
  if (utilities.includes("parking")) flags.push("utilities_parking");

  const available = parseAvailability(g("available_date"));
  if (available.kind === "month_day") flags.push("ambiguous_date");

  const urlRaw = g("url");
  let url: string | null = null;
  try {
    const u = new URL(urlRaw);
    if (u.protocol === "https:" && /(^|\.)facebook\.com$/.test(u.hostname)) url = u.toString();
    else if (urlRaw) flags.push("url_invalid");
  } catch { if (urlRaw) flags.push("url_invalid"); }

  const created = g("creation_date");
  const createdOk = created && !Number.isNaN(new Date(created).getTime());

  const extra: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) if (!(LISTING_FIELDS as readonly string[]).includes(k)) extra[k] = v;

  const norm: Norm = {
    title: g("title"),
    price: price != null && price > 0 ? price : null,
    price_basis: basis || "unknown",
    type,
    beds, beds_cat,
    baths,
    sqft,
    parking: g("parking").toLowerCase() || null,
    laundry,
    pets: g("pets").toLowerCase() || null,
    furnished,
    utilities,
    available,
    address: g("street_address") || null,
    area: blank(g("area")) ? null : g("area"),
    url,
    created_at: createdOk ? new Date(created).toISOString() : null,
    created_date: createdOk ? torontoDate(created) : null,
    first_seen: /^\d{4}-\d{2}-\d{2}/.test(g("first_seen")) ? g("first_seen").slice(0, 10) : null,
    queries: [...new Set(g("source_queries").split(";").map((s) => s.trim()).filter(Boolean))],
    extra,
  };
  return { norm, cohort: cohortFor(norm, flags), flags };
}

export function cohortFor(norm: Norm, flags: Flag[]): Cohort {
  if (norm.price == null || flags.includes("duplicate_conflict")) return "none";
  if (flags.includes("room_whole_conflict") || flags.includes("basis_unknown")) return "review";
  if (norm.price_basis === "per_room") return "room";
  if (norm.price_basis === "whole_unit" && norm.type !== "room") return "whole";
  return "review";
}

// ── Review overrides ────────────────────────────────────────────────────────

export interface Override { listing_id: string; field: string; reviewed_value: string; snapshot_id: string | null; scope: string }

/** Applies reviewed values on top of source values. The raw row is never changed. */
export function applyOverrides(o: Obs, overrides: Override[], snapshotId: string): Obs {
  const mine = overrides.filter((x) => x.listing_id === o.listing_id && (x.scope === "listing" || x.snapshot_id === snapshotId));
  if (!mine.length) return o;
  const raw = { ...o.raw };
  for (const x of mine) if (x.field !== "exclude") raw[x.field] = x.reviewed_value;
  const { norm, flags } = normalizeRow(raw);
  const kept = o.flags.filter((f) => f === "duplicate_conflict");
  const allFlags = [...new Set([...flags, ...kept, "reviewed" as Flag])];
  const excluded = mine.some((x) => x.field === "exclude" && x.reviewed_value === "true");
  return { ...o, norm, flags: allFlags, cohort: excluded ? "none" : cohortFor(norm, allFlags) };
}

// ── Statistics ──────────────────────────────────────────────────────────────

/** Linear interpolation at index (n - 1) × p, the single quantile rule used everywhere. */
export function quantile(sorted: number[], p: number): number | null {
  if (!sorted.length) return null;
  const i = (sorted.length - 1) * p;
  const lo = Math.floor(i), hi = Math.ceil(i);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
}

export interface Stats { n: number; median: number | null; mean: number | null; p25: number | null; p75: number | null; min: number | null; max: number | null }

export function stats(values: number[]): Stats {
  const s = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (!s.length) return { n: 0, median: null, mean: null, p25: null, p75: null, min: null, max: null };
  return {
    n: s.length,
    median: quantile(s, 0.5), p25: quantile(s, 0.25), p75: quantile(s, 0.75),
    mean: s.reduce((a, b) => a + b, 0) / s.length,
    min: s[0], max: s[s.length - 1],
  };
}

/** Empirical midrank percentile of a subject value among comparables. */
export function percentileOf(value: number, values: number[]): number | null {
  if (!values.length) return null;
  const below = values.filter((v) => v < value).length;
  const equal = values.filter((v) => v === value).length;
  return (100 * (below + 0.5 * equal)) / values.length;
}

export function pctChange(current: number | null, previous: number | null): number | null {
  if (current == null || previous == null || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export function sampleLabel(n: number): string | null {
  if (n === 0) return "No eligible data";
  if (n < 5) return "Very small sample";
  if (n < 10) return "Small sample";
  return null;
}

/** IQR outlier fences for one cohort (needs at least 8 values). */
export function outlierFences(values: number[]): { lo: number; hi: number } | null {
  const s = [...values].sort((a, b) => a - b);
  if (s.length < 8) return null;
  const q1 = quantile(s, 0.25)!, q3 = quantile(s, 0.75)!;
  const iqr = q3 - q1;
  return { lo: q1 - 1.5 * iqr, hi: q3 + 1.5 * iqr };
}

// ── Filters ─────────────────────────────────────────────────────────────────

export type Market = "whole" | "room" | "all";

export interface Filters {
  market: Market;
  area: string[];        // "__none" = area not stated
  type: string[];
  beds: string[];        // beds_cat values
  baths: string[];       // "unknown" or numeric string
  rentMin: number | null;
  rentMax: number | null;
  sqftMin: number | null;
  sqftMax: number | null;
  sqftUnknown: boolean;  // include rows without size when a size range is set
  parking: string[];
  laundry: string[];
  furnished: string[];
  pets: string[];
  util: string[];
  queries: string[];
  flags: string[];       // "__clean" = no flags
  postedFrom: string | null;
  postedTo: string | null;
  avail: string;         // text match on raw availability
  q: string;
  excluded: boolean;     // include rows kept out of rent statistics
  outliers: boolean;     // exclude IQR outliers from statistics
}

export const EMPTY_FILTERS: Filters = {
  market: "whole", area: [], type: [], beds: [], baths: [], rentMin: null, rentMax: null, sqftMin: null, sqftMax: null,
  sqftUnknown: true, parking: [], laundry: [], furnished: [], pets: [], util: [], queries: [], flags: [],
  postedFrom: null, postedTo: null, avail: "", q: "", excluded: true, outliers: false,
};

const LIST_KEYS = ["area", "type", "beds", "baths", "parking", "laundry", "furnished", "pets", "util", "queries", "flags"] as const;
const NUM_KEYS = ["rentMin", "rentMax", "sqftMin", "sqftMax"] as const;

export function filtersFromParams(p: URLSearchParams): Filters {
  const f: Filters = { ...EMPTY_FILTERS };
  const m = p.get("market");
  if (m === "whole" || m === "room" || m === "all") f.market = m;
  for (const k of LIST_KEYS) { const v = p.get(k); if (v) f[k] = v.split("|").filter(Boolean); }
  for (const k of NUM_KEYS) { const v = p.get(k); if (v && Number.isFinite(Number(v))) f[k] = Number(v); }
  if (p.get("sqftUnknown") === "0") f.sqftUnknown = false;
  f.postedFrom = p.get("postedFrom"); f.postedTo = p.get("postedTo");
  f.avail = p.get("avail") ?? ""; f.q = p.get("q") ?? "";
  if (p.get("excluded") === "0") f.excluded = false;
  if (p.get("outliers") === "1") f.outliers = true;
  return f;
}

export function filtersToParams(f: Filters, p = new URLSearchParams()): URLSearchParams {
  const set = (k: string, v: string | null) => (v ? p.set(k, v) : p.delete(k));
  set("market", f.market === "whole" ? null : f.market);
  for (const k of LIST_KEYS) set(k, f[k].length ? f[k].join("|") : null);
  for (const k of NUM_KEYS) set(k, f[k] == null ? null : String(f[k]));
  set("sqftUnknown", f.sqftUnknown ? null : "0");
  set("postedFrom", f.postedFrom); set("postedTo", f.postedTo);
  set("avail", f.avail || null); set("q", f.q || null);
  set("excluded", f.excluded ? null : "0");
  set("outliers", f.outliers ? "1" : null);
  return p;
}

const has = (list: string[], v: string | null | undefined, none = "unknown") => !list.length || list.includes(v ?? none);

/** Rows matching the filters. Rows kept out of statistics stay findable unless `excluded` is off. */
export function applyFilters(rows: Obs[], f: Filters): Obs[] {
  const q = f.q.trim().toLowerCase();
  return rows.filter((o) => {
    const n = o.norm;
    if (f.market === "whole" && !(o.cohort === "whole" || (f.excluded && o.norm.price_basis !== "per_room"))) return false;
    if (f.market === "room" && !(o.cohort === "room" || (f.excluded && o.norm.price_basis === "per_room"))) return false;
    if (!f.excluded && o.cohort !== "whole" && o.cohort !== "room") return false;
    if (!has(f.area, n.area, "__none")) return false;
    if (!has(f.type, n.type)) return false;
    if (!has(f.beds, n.beds_cat)) return false;
    if (!has(f.baths, n.baths == null ? null : String(n.baths))) return false;
    if (f.rentMin != null && (n.price == null || n.price < f.rentMin)) return false;
    if (f.rentMax != null && (n.price == null || n.price > f.rentMax)) return false;
    if ((f.sqftMin != null || f.sqftMax != null) && n.sqft == null && !f.sqftUnknown) return false;
    if (f.sqftMin != null && n.sqft != null && n.sqft < f.sqftMin) return false;
    if (f.sqftMax != null && n.sqft != null && n.sqft > f.sqftMax) return false;
    if (!has(f.parking, n.parking)) return false;
    if (!has(f.laundry, n.laundry)) return false;
    if (!has(f.furnished, n.furnished)) return false;
    if (!has(f.pets, n.pets)) return false;
    if (f.util.length && !f.util.some((u) => (u === "unknown" ? !n.utilities.length : n.utilities.includes(u)))) return false;
    if (f.queries.length && !f.queries.some((x) => n.queries.includes(x))) return false;
    if (f.flags.length && !f.flags.some((x) => (x === "__clean" ? !o.flags.length : o.flags.includes(x as Flag)))) return false;
    if (f.postedFrom && (!n.created_date || n.created_date < f.postedFrom)) return false;
    if (f.postedTo && (!n.created_date || n.created_date > f.postedTo)) return false;
    if (f.avail && !(o.raw.available_date ?? "").toLowerCase().includes(f.avail.toLowerCase())) return false;
    if (q) {
      const hay = `${n.title} ${o.listing_id} ${n.address ?? ""} ${n.area ?? ""} ${o.raw.available_date ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export interface CohortResult {
  matched: Obs[];
  whole: Obs[];       // used in whole-unit statistics
  room: Obs[];        // used in per-room statistics
  excluded: Obs[];    // matched but kept out of statistics (review / unusable / outlier)
  wholeStats: Stats;
  roomStats: Stats;
  outlierIds: Set<string>;
}

/** Splits matching rows into whole-unit and per-room statistics. The two are never mixed. */
export function cohortStats(matched: Obs[], f: Pick<Filters, "outliers">): CohortResult {
  let whole = matched.filter((o) => o.cohort === "whole");
  let room = matched.filter((o) => o.cohort === "room");
  const outlierIds = new Set<string>();
  for (const group of [whole, room]) {
    const fences = outlierFences(group.map((o) => o.norm.price!));
    if (fences) for (const o of group) if (o.norm.price! < fences.lo || o.norm.price! > fences.hi) outlierIds.add(o.listing_id);
  }
  if (f.outliers) {
    whole = whole.filter((o) => !outlierIds.has(o.listing_id));
    room = room.filter((o) => !outlierIds.has(o.listing_id));
  }
  const used = new Set([...whole, ...room].map((o) => o.listing_id));
  return {
    matched, whole, room,
    excluded: matched.filter((o) => !used.has(o.listing_id)),
    wholeStats: stats(whole.map((o) => o.norm.price!)),
    roomStats: stats(room.map((o) => o.norm.price!)),
    outlierIds,
  };
}

/** Why a matched row is not in the rent statistics. */
export function exclusionReason(o: Obs, outlierIds: Set<string>, outliersOn: boolean): string | null {
  if (o.cohort === "review") return o.flags.includes("room_whole_conflict") ? FLAG_TEXT.room_whole_conflict : "Needs classification";
  if (o.cohort === "none") return o.flags.includes("duplicate_conflict") ? FLAG_TEXT.duplicate_conflict : o.flags.includes("reviewed") ? "Excluded in review" : FLAG_TEXT.price_invalid;
  if (outliersOn && outlierIds.has(o.listing_id)) return "Unusual price (outside the IQR fences)";
  return null;
}

// ── Display helpers ─────────────────────────────────────────────────────────

export const cad = (n: number | null | undefined, digits = 0) =>
  n == null ? "—" : n.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: digits, minimumFractionDigits: digits });

export const BEDS_ORDER = ["0", "1", "2", "3", "4", "5+", "unknown"];
export const bedsLabel = (c: string) => (c === "0" ? "Studio" : c === "unknown" ? "Not stated" : `${c} bed`);
export const areaLabel = (a: string | null) => a ?? "Area not stated";

export function availabilityLabel(a: Availability, raw: string): string {
  if (a.kind === "none") return "Not stated";
  if (a.kind === "immediately") return "Immediately (as of scan)";
  if (a.kind === "month_day" && a.month) {
    const m = new Date(2000, a.month - 1, 1).toLocaleDateString("en-CA", { month: "long" });
    return `${m}${a.day ? ` ${a.day}` : ""} (year not stated)`;
  }
  if (a.kind === "date" && a.iso) return a.iso;
  return raw;
}

/** CSV cell that can't run as a spreadsheet formula. */
export function csvCell(v: unknown): string {
  if (typeof v === "number") return String(v);
  let s = v == null ? "" : Array.isArray(v) ? v.join("; ") : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
