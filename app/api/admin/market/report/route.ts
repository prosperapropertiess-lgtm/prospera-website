import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { loadReport } from "@/lib/market/report";

export const dynamic = "force-dynamic";

// GET ?edition=weekly|monthly|<date>: the same report data the public page uses (for the internal "What changed" tab).
export async function GET(req: NextRequest) {
  if (!await isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await loadReport(req.nextUrl.searchParams.get("edition") ?? "weekly");
  return NextResponse.json(data ? { history: data.history, sitting: data.sitting } : { history: [], sitting: null });
}
