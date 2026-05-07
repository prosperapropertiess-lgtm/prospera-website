import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { computeMarketEstimates } from "@/lib/rent-intelligence";

export async function POST() {
  const cookieStore = await cookies();
  if (!cookieStore.get("admin_session")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await computeMarketEstimates();
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("Manual refresh error:", err);
    return NextResponse.json({ error: "Refresh failed" }, { status: 500 });
  }
}
