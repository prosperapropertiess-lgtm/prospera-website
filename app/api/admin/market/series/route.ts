import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { listSnapshots } from "@/lib/market/server";

export const dynamic = "force-dynamic";

// GET: a compact row per listing per scan, for trend lines across every published scan.
// Columns: [listing_id, price, cohort, area, type, beds_cat, price_basis]
export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const snapshots = await listSnapshots();
  const sb = getSupabaseAdmin();
  const series: Record<string, (string | number | null)[][]> = {};
  for (const s of snapshots) {
    const rows: (string | number | null)[][] = [];
    for (let from = 0; ; from += 1000) {
      const { data } = await sb.from("market_observations")
        .select("listing_id, cohort, price:norm->price, area:norm->>area, type:norm->>type, beds:norm->>beds_cat, basis:norm->>price_basis")
        .eq("snapshot_id", s.id).range(from, from + 999);
      for (const d of data ?? []) rows.push([d.listing_id, d.price as number | null, d.cohort, d.area, d.type, d.beds, d.basis]);
      if (!data || data.length < 1000) break;
    }
    series[s.id] = rows;
  }
  return NextResponse.json({ snapshots, series });
}
