import crypto from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { LISTING_FIELDS, PARSER_VERSION, normalizeRow, type Cohort, type Flag } from "@/lib/market/core";
import { MARKET_SHEET_URL, type SheetTab } from "@/lib/market/sheets";

// One ingestion pipeline for both the scheduled Sheet read and an agent-supplied payload.

export interface SummarySection {
  heading: string;
  row: number;               // 1-based source row of the heading
  header: string[];
  rows: { row: number; cells: string[] }[];
}

export interface ParsedSummary {
  title: string | null;
  scanDate: string | null;   // YYYY-MM-DD
  scanLabel: string | null;  // e.g. "Scan #2, the deep sweep"
  notes: { row: number; text: string }[];  // single-cell lines outside sections
  sections: SummarySection[];
  reported: {
    uniqueListings: number | null; wholeUnit: number | null; perRoom: number | null;
    newVsBaseline: number | null; baseline: number | null; notRefound: number | null;
    segments: number | null; pages: number | null; rawHits: number | null; radiusKm: number | null;
  };
}

export interface IngestResult {
  status: "unchanged" | "published" | "revision" | "dry_run";
  snapshotId: string | null;
  scanKey: string;
  scanDate: string | null;
  scanVerified: boolean;
  rows: number;
  observations: number;
  eligible: { whole: number; room: number; review: number; none: number };
  issues: { flag: Flag | "missing_id"; count: number }[];
  newColumns: string[];
  message: string;
}

const sha = (v: unknown) => crypto.createHash("sha256").update(JSON.stringify(v)).digest("hex");
const num = (s: string | undefined) => {
  const m = s?.match(/-?[\d,]+(\.\d+)?/);
  return m ? Number(m[0].replace(/,/g, "")) : null;
};

export function parseSummary(grid: string[][]): ParsedSummary {
  const out: ParsedSummary = {
    title: null, scanDate: null, scanLabel: null, notes: [], sections: [],
    reported: { uniqueListings: null, wholeUnit: null, perRoom: null, newVsBaseline: null, baseline: null, notRefound: null, segments: null, pages: null, rawHits: null, radiusKm: null },
  };
  const filled = (r: string[] | undefined) => (r ?? []).filter((c) => c && c.trim()).length;
  let current: SummarySection | null = null;

  for (let i = 0; i < grid.length; i++) {
    const r = grid[i] ?? [];
    const a = (r[0] ?? "").trim();
    const n = filled(r);
    if (!n) { current = null; continue; }

    // A heading: one cell that starts with capitals, e.g. "HEADLINE MEDIANS (whole-unit unless noted)".
    if (n === 1 && /^[A-Z][A-Z0-9 &/-]{4,}(\s*\(.*\))?$/.test(a)) {
      current = { heading: a, row: i + 1, header: [], rows: [] };
      out.sections.push(current);
      const next = grid[i + 1];
      if (filled(next) > 1) { current.header = next!.map((c) => c.trim()); i++; }
      continue;
    }
    if (current && n > 0 && (n > 1 || current.header.length)) { current.rows.push({ row: i + 1, cells: r.map((c) => c ?? "") }); continue; }
    if (current && n === 1) { current.rows.push({ row: i + 1, cells: r.map((c) => c ?? "") }); continue; }

    out.notes.push({ row: i + 1, text: r.filter(Boolean).join(" | ") });
    if (i === 0) out.title = a;
    const scan = a.match(/scan date:\s*(.+?)(?:\s*\((.+)\))?\s*$/i);
    if (scan) {
      const d = new Date(`${scan[1].replace(/^[A-Za-z]+,\s*/, "")} 12:00`);
      if (!Number.isNaN(d.getTime())) out.scanDate = d.toISOString().slice(0, 10);
      out.scanLabel = scan[2] ?? null;
    }
    const radius = a.match(/(\d+)\s*km radius/i); if (radius) out.reported.radiusKm = Number(radius[1]);
    const sweep = a.match(/(\d+)\s*segments.*?=\s*(\d+)\s*pages,\s*([\d,]+)\s*raw/i);
    if (sweep) { out.reported.segments = Number(sweep[1]); out.reported.pages = Number(sweep[2]); out.reported.rawHits = num(sweep[3]); }
    const uniq = a.match(/usable monthly rent:\s*([\d,]+)\s*\(([\d,]+)\s*whole-unit\s*\+\s*([\d,]+)\s*per-room\)/i);
    if (uniq) { out.reported.uniqueListings = num(uniq[1]); out.reported.wholeUnit = num(uniq[2]); out.reported.perRoom = num(uniq[3]); }
    const base = a.match(/([\d,]+)\s*new vs the\s*([\d,]+)-listing baseline/i);
    if (base) { out.reported.newVsBaseline = num(base[1]); out.reported.baseline = num(base[2]); }
    const nf = a.match(/([\d,]+)\s*baseline listings not re-found/i); if (nf) out.reported.notRefound = num(nf[1]);
  }
  return out;
}

/** Builds observations from the Listings grid, reading columns by header name. */
export function parseListings(grid: string[][]) {
  const header = (grid[0] ?? []).map((h) => h.trim());
  const missing = ["listing_id", "price", "price_basis"].filter((h) => !header.includes(h));
  if (missing.length) throw new Error(`Listings tab is missing required columns: ${missing.join(", ")}`);
  const newColumns = header.filter((h) => h && !(LISTING_FIELDS as readonly string[]).includes(h));

  const rows: { source_row: number; raw: Record<string, string> }[] = [];
  for (let i = 1; i < grid.length; i++) {
    const r = grid[i] ?? [];
    if (!r.some((c) => c && c.trim())) continue;  // skip blank rows without stopping
    const raw: Record<string, string> = {};
    header.forEach((h, j) => { if (h) raw[h] = r[j] ?? ""; else if (r[j]) raw[`column_${j + 1}`] = r[j]; });
    for (let j = header.length; j < r.length; j++) if (r[j]) raw[`column_${j + 1}`] = r[j];
    rows.push({ source_row: i + 1, raw });
  }

  // One observation per listing ID. Identical repeats merge their search queries; conflicts are flagged.
  const byId = new Map<string, { source_row: number; raw: Record<string, string>; conflict: boolean }>();
  const out: { listing_id: string; source_row: number; raw: Record<string, string>; conflict: boolean }[] = [];
  let missingIds = 0;
  for (const row of rows) {
    const id = (row.raw.listing_id ?? "").trim();
    if (!id) { missingIds++; out.push({ listing_id: `row-${row.source_row}`, ...row, conflict: false }); continue; }
    const prior = byId.get(id);
    if (!prior) { const entry = { ...row, conflict: false }; byId.set(id, entry); out.push({ listing_id: id, ...entry }); continue; }
    const strip = (x: Record<string, string>) => { const { source_queries: _q, ...rest } = x; void _q; return rest; };
    if (sha(strip(prior.raw)) === sha(strip(row.raw))) {
      const qs = new Set([...(prior.raw.source_queries ?? "").split(";"), ...(row.raw.source_queries ?? "").split(";")].map((s) => s.trim()).filter(Boolean));
      prior.raw.source_queries = [...qs].join("; ");
    } else {
      prior.conflict = true;
      out.push({ listing_id: id, ...row, conflict: true });
    }
  }
  for (const o of out) if (byId.get(o.listing_id)?.conflict) o.conflict = true;
  return { header, newColumns, rows: out, rowCount: rows.length, missingIds };
}

export async function ingest(input: { tabs: SheetTab[]; trigger: string; dryRun?: boolean; sourceUrl?: string }): Promise<IngestResult> {
  const sb = getSupabaseAdmin();

  // Source-level lock: one run at a time.
  const { data: running } = await sb.from("market_ingestions").select("id").eq("status", "running")
    .gte("started_at", new Date(Date.now() - 10 * 60_000).toISOString()).limit(1);
  if (running?.length) throw new Error("Another refresh is already running. Try again in a minute.");

  const { data: attempt } = await sb.from("market_ingestions").insert({ trigger: input.trigger }).select("id").single();
  const finish = (patch: Record<string, unknown>) =>
    sb.from("market_ingestions").update({ ...patch, finished_at: new Date().toISOString() }).eq("id", attempt!.id);

  try {
    const find = (name: string) => input.tabs.find((t) => t.name.trim().toLowerCase() === name);
    const listingsTab = find("listings");
    if (!listingsTab) throw new Error("The Sheet has no Listings tab.");
    const summaryTab = find("summary");

    const parsed = parseListings(listingsTab.grid);
    const summary = parseSummary(summaryTab?.grid ?? []);
    const hash = sha({ listings: listingsTab.grid, summary: summaryTab?.grid ?? [] });

    const obs = parsed.rows.map((r) => {
      const { norm, cohort, flags } = normalizeRow(r.raw);
      const allFlags: Flag[] = r.conflict ? [...flags, "duplicate_conflict"] : flags;
      return {
        listing_id: r.listing_id, source_row: r.source_row, raw: r.raw, norm,
        cohort: (r.conflict ? "none" : cohort) as Cohort, flags: allFlags, content_hash: sha(r.raw),
      };
    });

    const eligible = { whole: 0, room: 0, review: 0, none: 0 };
    for (const o of obs) eligible[o.cohort]++;
    const issueCounts = new Map<string, number>();
    for (const o of obs) for (const f of o.flags) issueCounts.set(f, (issueCounts.get(f) ?? 0) + 1);
    if (parsed.missingIds) issueCounts.set("missing_id", parsed.missingIds);
    const issues = [...issueCounts].map(([flag, count]) => ({ flag: flag as Flag, count }));

    const scanVerified = !!summary.scanDate;
    const scanKey = scanVerified ? `${summary.scanDate}|${summary.scanLabel ?? ""}` : `unverified|${hash.slice(0, 16)}`;

    const base = {
      scanKey, scanDate: summary.scanDate, scanVerified, rows: parsed.rowCount, observations: obs.length,
      eligible, issues, newColumns: parsed.newColumns,
    };

    // Same scan identity: unchanged read, or a corrected revision of that scan.
    const { data: prior } = await sb.from("market_snapshots").select("id, revision, content_hash")
      .eq("scan_key", scanKey).order("revision", { ascending: false }).limit(1).maybeSingle();

    if (prior && prior.content_hash === hash) {
      const result: IngestResult = { ...base, status: "unchanged", snapshotId: prior.id, message: "The Sheet hasn't changed since the last read. No new market data." };
      await finish({ status: "unchanged", content_hash: hash, row_count: obs.length, eligible_count: eligible.whole + eligible.room, snapshot_id: prior.id, result });
      return result;
    }
    if (!prior && !scanVerified) {
      // No scan date in the Summary: only store it if it differs from the latest content.
      const { data: latest } = await sb.from("market_snapshots").select("id, content_hash").not("published_at", "is", null)
        .order("ingested_at", { ascending: false }).limit(1).maybeSingle();
      if (latest?.content_hash === hash) {
        const result: IngestResult = { ...base, status: "unchanged", snapshotId: latest.id, message: "The Sheet hasn't changed since the last read." };
        await finish({ status: "unchanged", content_hash: hash, snapshot_id: latest.id, result });
        return result;
      }
    }

    const revision = prior ? prior.revision + 1 : 1;
    if (input.dryRun) {
      const result: IngestResult = { ...base, status: "dry_run", snapshotId: null, message: prior ? `Would save revision ${revision} of this scan.` : "Would save a new scan." };
      await finish({ status: "dry_run", content_hash: hash, row_count: obs.length, result });
      return result;
    }

    // Stage: snapshot is invisible (published_at null) until every observation is written.
    const { data: snap, error: snapErr } = await sb.from("market_snapshots").insert({
      scan_key: scanKey, scan_label: summary.scanLabel, scan_date: summary.scanDate, scan_identity_verified: scanVerified,
      revision, status: "unknown", content_hash: hash, parser_version: PARSER_VERSION,
      source_url: input.sourceUrl ?? MARKET_SHEET_URL, listing_count: obs.length,
      raw: { tabs: input.tabs }, summary,
      schema_report: { header: parsed.header, newColumns: parsed.newColumns, rowCount: parsed.rowCount, missingIds: parsed.missingIds, eligible, issues },
    }).select("id").single();
    if (snapErr || !snap) throw new Error(`Couldn't save the snapshot: ${snapErr?.message}`);

    for (let i = 0; i < obs.length; i += 500) {
      const { error } = await sb.from("market_observations").insert(obs.slice(i, i + 500).map((o) => ({ ...o, snapshot_id: snap.id })));
      if (error) {
        await sb.from("market_snapshots").delete().eq("id", snap.id);
        throw new Error(`Couldn't save listings: ${error.message}`);
      }
    }

    // Publish: flip the pointer, then retire the earlier revision of the same scan.
    await sb.from("market_snapshots").update({ published_at: new Date().toISOString() }).eq("id", snap.id);
    if (prior) await sb.from("market_snapshots").update({ superseded: true }).eq("scan_key", scanKey).neq("id", snap.id);

    await seedWatchlist(summary);

    const status = prior ? "revision" : "published";
    const result: IngestResult = {
      ...base, status, snapshotId: snap.id,
      message: prior ? `Saved a corrected version (revision ${revision}) of the ${summary.scanDate ?? "unknown-date"} scan.`
        : scanVerified ? `Saved the ${summary.scanDate} scan.` : "Saved new Sheet content. The Summary has no scan date, so freshness is unverified.",
    };
    await finish({ status, content_hash: hash, row_count: obs.length, eligible_count: eligible.whole + eligible.room, snapshot_id: snap.id, result });
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await finish({ status: "failed", error: message });
    throw err;
  }
}

/** Imports the "Prospera rents vs market" rows as watched properties. Manual edits to config/notes are kept. */
async function seedWatchlist(summary: ParsedSummary) {
  const section = summary.sections.find((s) => /PROSPERA/i.test(s.heading));
  if (!section) return;
  const sb = getSupabaseAdmin();
  for (const r of section.rows) {
    const [label, rent, segment] = r.cells.map((c) => (c ?? "").trim());
    if (!label) continue;
    const nums = (rent.match(/[\d,]+(\.\d+)?/g) ?? []).map((x) => Number(x.replace(/,/g, "")));
    const row = {
      label, source: "summary", segment: segment || null,
      rent_low: nums[0] ?? null, rent_high: nums[1] ?? nums[0] ?? null,
      source_ref: { row: r.row, cells: r.cells, heading: section.heading, header: section.header },
      updated_at: new Date().toISOString(),
    };
    const { data: existing } = await sb.from("market_watchlist").select("id").eq("source", "summary").eq("label", label).maybeSingle();
    if (existing) await sb.from("market_watchlist").update(row).eq("id", existing.id);
    else await sb.from("market_watchlist").insert({ ...row, config: configFromLabel(label, segment) });
  }
}

/** Starting comparison settings from the source label/segment. Conflicts are flagged, not resolved. */
function configFromLabel(label: string, segment: string): Record<string, unknown> {
  const [segType, segBeds] = (segment ?? "").split("/").map((s) => s.trim().toLowerCase());
  const labelBeds = label.match(/(\d+)-bed/i)?.[1] ?? null;
  const segBedsN = segBeds?.match(/(\d+)/)?.[1] ?? null;
  const labelType = label.match(/\b(apt|apartment|house|townhouse|condo|rooming house)\b/i)?.[1]?.toLowerCase() ?? null;
  const warnings: string[] = [];
  if (labelBeds && segBedsN && labelBeds !== segBedsN) warnings.push(`The label says ${labelBeds} bedrooms but the source compared it to ${segBedsN}-bedroom listings.`);
  if (labelType === "condo") warnings.push("Compared with apartments as a proxy; condo listings are rare on Marketplace.");
  if (labelType === "rooming house") warnings.push("A whole rooming-house rent can't be compared with individual room rents.");
  const type = segType && segType !== "all houses" ? segType : segType === "all houses" ? "house" : null;
  return {
    type: type ? [type] : [],
    beds: segBedsN ? [Number(segBedsN) >= 5 ? "5+" : segBedsN] : [],
    area: [],
    basis: "whole",
    warnings,
    excluded: [],
  };
}
