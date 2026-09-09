/**
 * PSN-DATA-001 — daily Business Numbers snapshot
 * Recomputes the last 12 months of P&L + unit economics + the "CFO's Take" brief
 * and upserts them into ceo_metric_snapshots.
 * Schedule: 0 5 * * *  (05:00 UTC — just after midnight Eastern)
 */
import { NextRequest, NextResponse } from "next/server";
import { computeSnapshot, persistSnapshot } from "@/lib/ceo-snapshot";

export const maxDuration = 120;

export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await computeSnapshot({ withBrief: true });
    const written = await persistSnapshot(result);
    return NextResponse.json({
      success: true,
      months_written: written,
      brief_generated: Boolean(result.brief),
      finances_configured: result.finances_configured,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
