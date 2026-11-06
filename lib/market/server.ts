import { getSupabaseAdmin } from "@/lib/supabase";
import { serviceAccountEmail, MARKET_SHEET_URL } from "@/lib/market/sheets";

export const STALE_DAYS = 8;
export const SCHEDULE_LABEL = "Fridays at 10:00 a.m. Toronto time";

export interface SnapshotMeta {
  id: string;
  scan_key: string;
  scan_label: string | null;
  scan_date: string | null;
  scan_identity_verified: boolean;
  revision: number;
  superseded: boolean;
  status: string;
  listing_count: number;
  ingested_at: string;
  published_at: string | null;
  source_url: string | null;
  parser_version: string;
  schema_report: Record<string, unknown>;
}

const META = "id, scan_key, scan_label, scan_date, scan_identity_verified, revision, superseded, status, listing_count, ingested_at, published_at, source_url, parser_version, schema_report, reported:summary->reported";

/** Published, current-revision snapshots, newest scan first. */
export async function listSnapshots(): Promise<SnapshotMeta[]> {
  const { data } = await getSupabaseAdmin().from("market_snapshots").select(META)
    .not("published_at", "is", null).eq("superseded", false)
    .order("scan_date", { ascending: false, nullsFirst: false }).order("ingested_at", { ascending: false });
  return (data ?? []) as SnapshotMeta[];
}

/** Next Friday 10:00 in Toronto, as an ISO instant. */
export function nextScheduledRun(now = new Date()): string {
  for (let d = 0; d < 8; d++) {
    const day = new Date(now.getTime() + d * 86_400_000);
    const ymd = day.toLocaleDateString("en-CA", { timeZone: "America/Toronto" });
    const weekday = day.toLocaleDateString("en-US", { timeZone: "America/Toronto", weekday: "short" });
    if (weekday !== "Fri") continue;
    // Find the UTC instant that is 10:00 in Toronto on that date (offset is -4 or -5).
    for (const off of [4, 5]) {
      const t = new Date(`${ymd}T${String(10 + off).padStart(2, "0")}:00:00Z`);
      if (t.toLocaleTimeString("en-CA", { timeZone: "America/Toronto", hour: "2-digit", hour12: false }).startsWith("10") && t > now) return t.toISOString();
    }
  }
  return new Date(now.getTime() + 7 * 86_400_000).toISOString();
}

export async function syncStatus() {
  const sb = getSupabaseAdmin();
  const [snapshots, { data: attempts }] = await Promise.all([
    listSnapshots(),
    sb.from("market_ingestions").select("id, trigger, status, started_at, finished_at, row_count, eligible_count, snapshot_id, result, error")
      .order("started_at", { ascending: false }).limit(25),
  ]);
  const latest = snapshots[0] ?? null;
  const lastGood = (attempts ?? []).find((a) => a.status !== "failed" && a.status !== "running" && a.status !== "dry_run") ?? null;
  const lastFailed = (attempts ?? []).find((a) => a.status === "failed") ?? null;
  const ageDays = latest?.scan_date ? Math.floor((Date.now() - new Date(`${latest.scan_date}T12:00:00-05:00`).getTime()) / 86_400_000) : null;
  return {
    latest,
    snapshots,
    attempts: attempts ?? [],
    lastGood,
    lastFailed: lastFailed && (!lastGood || lastFailed.started_at > lastGood.started_at) ? lastFailed : null,
    sourceAgeDays: ageDays,
    stale: ageDays != null && ageDays > STALE_DAYS,
    staleDays: STALE_DAYS,
    schedule: SCHEDULE_LABEL,
    nextRun: nextScheduledRun(),
    sheetUrl: MARKET_SHEET_URL,
    serviceAccount: serviceAccountEmail(),
  };
}
