import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { buildOwnerDashboard, cacheDashboard } from "@/lib/owners-data";

// POST /api/owners/refresh
// Body: { token: string }
// Rebuilds the dashboard from Notion and writes it to Supabase cache.
export async function POST(req: NextRequest) {
  let body: { token?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { token } = body;
  if (!token) return NextResponse.json({ error: "token required" }, { status: 400 });

  const sb = getSupabaseAdmin();
  const { data: record } = await sb
    .from("owner_access")
    .select("notion_owner_ids, owner_names")
    .eq("token", token)
    .single();

  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const dashboard = await buildOwnerDashboard(record.notion_owner_ids, record.owner_names);
    await cacheDashboard(token, dashboard);
    return NextResponse.json({ ok: true, cachedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[owners/refresh]", err);
    return NextResponse.json({ error: "Refresh failed" }, { status: 500 });
  }
}
