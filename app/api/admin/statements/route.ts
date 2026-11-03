import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { previousPeriod } from "@/lib/owner-statement";
import { saveDrafts } from "@/lib/owner-statement-store";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// GET ?period=YYYY-MM: that month's statements, plus every month that has any.
export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const period = req.nextUrl.searchParams.get("period") || previousPeriod();
  const sb = getSupabaseAdmin();
  const [{ data: rows }, { data: all }] = await Promise.all([
    sb.from("owner_statements").select("id, period, owner_names, owner_emails, data, warnings, status, sent_at, updated_at")
      .eq("period", period).order("owner_names"),
    sb.from("owner_statements").select("period"),
  ]);
  const periods = [...new Set([previousPeriod(), ...(all ?? []).map((r) => r.period)])].sort().reverse();
  return NextResponse.json({ period, periods, statements: rows ?? [] });
}

// POST { period }: rebuild that month's drafts from the General Ledger.
export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { period } = await req.json().catch(() => ({}));
  if (!/^\d{4}-\d{2}$/.test(period ?? "")) return NextResponse.json({ error: "Pick a month." }, { status: 400 });
  try {
    return NextResponse.json({ ok: true, ...(await saveDrafts(period)) });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
