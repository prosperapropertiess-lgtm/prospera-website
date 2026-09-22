/**
 * Cross-campaign dashboard for the Move-In Coordinator — search/resume any
 * move-in, and see which campaigns don't have one started yet.
 */
import { NextRequest, NextResponse } from "next/server";
import { isLeasingOrAdminAuthenticated } from "@/lib/leasing-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getSupabaseAdmin();

  const { data: sessions, error } = await db
    .from("move_in_sessions")
    .select(`
      id, campaign_id, status, report_version, move_in_date, inspector_name, updated_at, finished_at,
      campaign:leasing_properties(id, owner_name, property:properties(address, title, name)),
      application:leasing_applications(legal_name, email)
    `)
    .order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const startedCampaignIds = new Set((sessions ?? []).map((s) => s.campaign_id));

  const { data: campaigns } = await db
    .from("leasing_properties")
    .select("id, owner_name, stage, property:properties(address, title, name)")
    .in("stage", ["LEASE_PENDING", "LEASE_SIGNED", "MOVE_IN"])
    .order("created_at", { ascending: false });

  const notStarted = (campaigns ?? []).filter((c) => !startedCampaignIds.has(c.id));

  return NextResponse.json({ sessions: sessions ?? [], notStarted });
}
