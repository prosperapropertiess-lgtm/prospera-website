import { NextRequest, NextResponse } from "next/server";
import { previousPeriod } from "@/lib/owner-statement";
import { saveDrafts, notifyEbin } from "@/lib/owner-statement-store";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Runs on the 3rd of every month (vercel.json: 0 13 3 * *).
// Builds last month's owner statements from the General Ledger as drafts and
// emails Ebin to check them. It never emails an owner; that only happens when
// Ebin presses Send on /admin/statements.
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const period = previousPeriod();
  const [y, m] = period.split("-").map(Number);
  const monthLabel = new Date(y, m - 1, 1).toLocaleDateString("en-CA", { month: "long", year: "numeric" });

  try {
    const result = await saveDrafts(period);
    await notifyEbin(period, monthLabel);
    return NextResponse.json({ ok: true, period, ...result });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
