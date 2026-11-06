import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET ?snapshot=<id>[&download=1]: the original Sheet grids and parsed Summary for a snapshot.
export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("snapshot");
  if (!id) return NextResponse.json({ error: "Pick a snapshot." }, { status: 400 });
  const sb = getSupabaseAdmin();
  const { data: snap } = await sb.from("market_snapshots").select("id, scan_key, scan_date, scan_label, revision, source_url, parser_version, ingested_at, raw, summary, schema_report").eq("id", id).single();
  if (!snap) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (req.nextUrl.searchParams.get("download") === "1") {
    const { data: obs } = await sb.from("market_observations").select("listing_id, source_row, raw, norm, cohort, flags").eq("snapshot_id", id).order("listing_id");
    return new NextResponse(JSON.stringify({ exported_at: new Date().toISOString(), snapshot: snap, observations: obs ?? [] }, null, 1), {
      headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="rental-market-${snap.scan_date ?? "snapshot"}-r${snap.revision}.json"` },
    });
  }
  return NextResponse.json(snap);
}
