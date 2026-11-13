import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { torontoToday } from "@/lib/viewing-requests";
import { serviceAccountEmail } from "@/lib/market/sheets";
import { TARGETS, sheetUrl, syncDayToSheet, type ScoreDay } from "@/lib/scorecard";

export const dynamic = "force-dynamic";

const isDay = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
const count = (v: unknown) => (Number.isInteger(v) && (v as number) >= 0 && (v as number) <= 10_000 ? (v as number) : null);

// GET: the last 90 days (newest first) and today's date in Toronto.
export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await getSupabaseAdmin()
    .from("sales_scorecard").select("day, target, outreaches, followups, sheet_synced_at")
    .order("day", { ascending: false }).limit(90);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ today: torontoToday(), days: data ?? [], sheetUrl: sheetUrl() ?? null, shareWith: serviceAccountEmail() });
}

// POST { day, target, outreaches, followups }: save the day's totals, then copy them to the Sheet.
export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const today = torontoToday();
  const target = count(b.target), outreaches = count(b.outreaches), followups = count(b.followups);
  if (!isDay(b.day) || b.day > today) return NextResponse.json({ error: "Pick today or an earlier day." }, { status: 400 });
  if (!target || !(TARGETS as readonly number[]).includes(target) || outreaches == null || followups == null) {
    return NextResponse.json({ error: "Those numbers don't look right." }, { status: 400 });
  }

  const day: ScoreDay = { day: b.day, target, outreaches, followups };
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("sales_scorecard").upsert({ ...day, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const sheet = await syncDayToSheet(day);
  if (sheet.ok) await sb.from("sales_scorecard").update({ sheet_synced_at: new Date().toISOString() }).eq("day", day.day);
  else console.error("[scorecard] sheet sync failed:", sheet.reason);
  return NextResponse.json({ ok: true, sheet });
}
