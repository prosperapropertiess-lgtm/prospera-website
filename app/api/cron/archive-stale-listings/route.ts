/**
 * Auto-archive stale listings
 * Any published listing that has been active for more than 60 days
 * is marked as rented (available=false, status='rented').
 * This runs daily at 6 AM.
 *
 * Schedule: "0 6 * * *"
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const CRON_SECRET = process.env.CRON_SECRET;
const STALE_DAYS = 60;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - STALE_DAYS);
  const cutoffISO = cutoff.toISOString();

  // Find all published+available properties older than 60 days
  const { data: stale, error: fetchErr } = await supabase
    .from("properties")
    .select("id, title, address, created_at")
    .eq("status", "published")
    .eq("available", true)
    .lt("created_at", cutoffISO);

  if (fetchErr) {
    console.error("[archive-stale-listings] fetch error:", fetchErr.message);
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }

  if (!stale || stale.length === 0) {
    return NextResponse.json({ archived: 0, message: "No stale listings found." });
  }

  const ids = stale.map((p) => p.id);

  const { error: updateErr } = await supabase
    .from("properties")
    .update({
      available: false,
      status: "rented",
      rented_at: new Date().toISOString(),
    })
    .in("id", ids);

  if (updateErr) {
    console.error("[archive-stale-listings] update error:", updateErr.message);
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  console.log(`[archive-stale-listings] Archived ${stale.length} stale listings:`, ids);

  return NextResponse.json({
    archived: stale.length,
    properties: stale.map((p) => ({ id: p.id, address: p.address, listed_since: p.created_at })),
  });
}
