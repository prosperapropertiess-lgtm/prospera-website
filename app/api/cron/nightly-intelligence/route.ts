import { NextRequest, NextResponse } from "next/server";
import { computeMarketEstimates } from "@/lib/rent-intelligence";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await computeMarketEstimates();
    console.log("Nightly intelligence complete:", result);
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("Nightly intelligence error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
