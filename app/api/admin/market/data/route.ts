import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { listSnapshots } from "@/lib/market/server";

export const dynamic = "force-dynamic";

// GET ?snapshot=<id>: every observation in one published snapshot (latest by default),
// plus review overrides and the parsed Summary. One snapshot per response.
export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = getSupabaseAdmin();
  const snapshots = await listSnapshots();
  const wanted = req.nextUrl.searchParams.get("snapshot");
  const snap = wanted ? snapshots.find((s) => s.id === wanted) : snapshots[0];
  if (!snap) return NextResponse.json({ snapshot: null, snapshots, observations: [], overrides: [], summary: null });

  const rows: unknown[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb.from("market_observations").select("listing_id, source_row, raw, norm, cohort, flags")
      .eq("snapshot_id", snap.id).order("listing_id").range(from, from + 999);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    rows.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  const [{ data: overrides }, { data: full }] = await Promise.all([
    sb.from("market_overrides").select("*").order("created_at"),
    sb.from("market_snapshots").select("summary").eq("id", snap.id).single(),
  ]);
  return NextResponse.json({ snapshot: snap, snapshots, observations: rows, overrides: overrides ?? [], summary: full?.summary ?? null });
}
