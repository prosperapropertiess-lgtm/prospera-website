import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { listSnapshots } from "@/lib/market/server";

export const dynamic = "force-dynamic";

// GET: one listing's observations across every published scan, oldest first.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const snapshots = await listSnapshots();
  const ids = snapshots.map((s) => s.id);
  const { data } = await getSupabaseAdmin().from("market_observations").select("snapshot_id, norm, cohort, flags")
    .eq("listing_id", id).in("snapshot_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
  const seen = new Map((data ?? []).map((o) => [o.snapshot_id, o]));
  const timeline = [...snapshots].reverse().map((s) => {
    const o = seen.get(s.id);
    return { snapshot_id: s.id, scan_date: s.scan_date, scan_label: s.scan_label, seen: !!o, price: o?.norm?.price ?? null, price_basis: o?.norm?.price_basis ?? null, cohort: o?.cohort ?? null };
  });
  return NextResponse.json({ listing_id: id, timeline });
}
