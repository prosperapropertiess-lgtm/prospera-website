import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { weekOf } from "@/lib/placements/core";
import { draftUpdate, saveUpdate } from "@/lib/placements/actions";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Thursdays at 4pm Toronto (vercel.json: 0 21 * * 4). Drafts this week's update for every
// active owner dashboard, so Ebin only reads, edits and publishes on Friday. Nothing is sent.
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getSupabaseAdmin();
  const week = weekOf();
  const { data: pls } = await db.from("placements").select("id").is("completed_at", null).eq("is_demo", false).not("property_id", "is", null);
  const { data: have } = await db.from("placement_updates").select("placement_id").eq("week_start", week.start);
  const skip = new Set((have ?? []).map((u) => u.placement_id));
  const out: { id: string; ok: boolean; error?: string }[] = [];
  for (const p of pls ?? []) {
    if (skip.has(p.id)) continue;
    try {
      const { draft, counts } = await draftUpdate(p.id, week);
      await saveUpdate(p.id, { ...draft, ...(counts ?? {}), week_start: week.start, week_end: week.end, ai_drafted: true });
      out.push({ id: p.id, ok: true });
    } catch (e) {
      out.push({ id: p.id, ok: false, error: e instanceof Error ? e.message : String(e) });
    }
  }
  return NextResponse.json({ ok: true, week: week.start, drafted: out });
}
