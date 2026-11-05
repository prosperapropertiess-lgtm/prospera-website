import { NextRequest, NextResponse } from "next/server";
import { reviewViewingRequests } from "@/lib/viewing-review";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Runs every morning (vercel.json: 0 13 * * *, 8am Toronto). Sorts new viewing
// requests into a call list and emails Ebin. Nobody is contacted or turned away.
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json({ ok: true, ...(await reviewViewingRequests()) });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
