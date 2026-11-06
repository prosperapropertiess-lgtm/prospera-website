import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { ingest } from "@/lib/market/ingest";
import { readMarketSheet, SheetError } from "@/lib/market/sheets";

/** Reads the Sheet and runs the ingest pipeline. Shared by Refresh now and the weekly job. */
export async function runSheetSync(trigger: string, dryRun = false) {
  try {
    const { tabs } = await readMarketSheet();
    return NextResponse.json({ ok: true, result: await ingest({ tabs, trigger, dryRun }) });
  } catch (err) {
    if (err instanceof SheetError) {
      await getSupabaseAdmin().from("market_ingestions").insert({ trigger, status: "failed", finished_at: new Date().toISOString(), error: err.message });
      return NextResponse.json({ error: err.message, code: err.code }, { status: 502 });
    }
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
