import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { runSheetSync } from "@/lib/market/run-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// POST { dryRun? }: read the Sheet now and run the same pipeline as the weekly job.
export async function POST(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { dryRun } = await req.json().catch(() => ({}));
  const { data: recent } = await getSupabaseAdmin().from("market_ingestions").select("id")
    .gte("started_at", new Date(Date.now() - 30_000).toISOString()).limit(1);
  if (recent?.length) return NextResponse.json({ error: "A refresh just ran. Wait 30 seconds and try again." }, { status: 429 });
  return runSheetSync(dryRun ? "manual-dry-run" : "manual", !!dryRun);
}
