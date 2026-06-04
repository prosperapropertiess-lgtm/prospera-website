import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { buildOwnerDashboard, cacheDashboard } from "@/lib/owners-data";

// Runs every Monday at 9am Eastern (13:00 UTC)
// Schedule: 0 13 * * 1

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabaseAdmin();
  const { data: records } = await sb
    .from("owner_access")
    .select("token, notion_owner_ids, owner_names");

  if (!records?.length) {
    return NextResponse.json({ message: "No owner records found" });
  }

  const results: Array<{ token: string; status: string; error?: string }> = [];

  for (const record of records) {
    try {
      const dashboard = await buildOwnerDashboard(record.notion_owner_ids, record.owner_names);
      await cacheDashboard(record.token, dashboard);
      results.push({ token: record.token, status: "cached" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      results.push({ token: record.token, status: "error", error: message });
    }
  }

  return NextResponse.json({ success: true, results });
}
