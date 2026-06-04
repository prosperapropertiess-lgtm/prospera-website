import { NextRequest, NextResponse } from "next/server";

// Runs every Monday at 9am Eastern (13:00 UTC)
// Schedule: 0 13 * * 1
// Owner dashboards use unstable_cache with a 6-hour revalidate TTL,
// so they auto-refresh throughout the day. This endpoint is a no-op
// kept for future use (e.g. force-refresh via on-demand revalidation).

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ success: true, message: "Cache auto-refreshes every 6 hours via unstable_cache TTL" });
}
