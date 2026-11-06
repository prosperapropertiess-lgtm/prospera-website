import { NextRequest, NextResponse } from "next/server";
import { runSheetSync } from "@/lib/market/run-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// vercel.json schedules this at 14:00 and 15:00 UTC on Fridays. Only the run that
// lands on 10 a.m. Toronto time does anything, so daylight saving never runs it twice.
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const hour = new Date().toLocaleTimeString("en-CA", { timeZone: "America/Toronto", hour: "2-digit", hour12: false });
  if (!hour.startsWith("10") && req.nextUrl.searchParams.get("force") !== "1") {
    return NextResponse.json({ ok: true, skipped: `It's ${hour}:00 in Toronto, not 10:00.` });
  }
  return runSheetSync("scheduled");
}
