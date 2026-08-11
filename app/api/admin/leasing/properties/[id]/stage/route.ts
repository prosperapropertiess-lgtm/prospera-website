/**
 * POST /api/admin/leasing/properties/[id]/stage
 * Advance campaign stage. Validates transition, sets timestamp, emits event.
 */
import { NextRequest, NextResponse } from "next/server";
import { isLeasingOrAdminAuthenticated, getLeasingEmployee } from "@/lib/leasing-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const STAGE_ORDER = [
  "PREPARATION",
  "MARKET_READY",
  "ACTIVE_MARKETING",
  "LEADS_ACTIVE",
  "SHOWINGS_ACTIVE",
  "APPLICATIONS_ACTIVE",
  "VERIFICATION",
  "APPROVAL",
  "LEASE_PENDING",
  "LEASE_SIGNED",
  "MOVE_IN",
  "CLOSED",
] as const;

type Stage = typeof STAGE_ORDER[number];

const STAGE_TS_COLUMN: Record<Stage, string> = {
  PREPARATION:        "stage_preparation_at",
  MARKET_READY:       "stage_market_ready_at",
  ACTIVE_MARKETING:   "stage_active_marketing_at",
  LEADS_ACTIVE:       "stage_leads_active_at",
  SHOWINGS_ACTIVE:    "stage_showings_active_at",
  APPLICATIONS_ACTIVE:"stage_applications_at",
  VERIFICATION:       "stage_verification_at",
  APPROVAL:           "stage_approval_at",
  LEASE_PENDING:      "stage_lease_pending_at",
  LEASE_SIGNED:       "stage_lease_signed_at",
  MOVE_IN:            "stage_move_in_at",
  CLOSED:             "stage_closed_at",
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const targetStage = body.stage as Stage;

  if (!STAGE_ORDER.includes(targetStage)) {
    return NextResponse.json({ error: `Invalid stage: ${targetStage}` }, { status: 400 });
  }

  const db = getSupabaseAdmin();

  // Load current campaign
  const { data: campaign, error: loadErr } = await db
    .from("leasing_properties")
    .select("id, stage, status")
    .eq("id", id)
    .single();

  if (loadErr || !campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  const currentIdx = STAGE_ORDER.indexOf(campaign.stage as Stage);
  const targetIdx = STAGE_ORDER.indexOf(targetStage);

  // Only allow forward by exactly one step (or accept jumping auto-steps)
  if (targetIdx <= currentIdx) {
    return NextResponse.json(
      { error: `Cannot move from ${campaign.stage} to ${targetStage} — only forward transitions allowed` },
      { status: 400 }
    );
  }

  // If advancing to MARKET_READY, check required checklist items
  if (targetStage === "MARKET_READY") {
    const { data: blockers } = await db
      .from("leasing_checklist")
      .select("item")
      .eq("leasing_property_id", id)
      .eq("required", true)
      .eq("completed", false);

    if (blockers && blockers.length > 0) {
      return NextResponse.json(
        {
          error: "Required checklist items incomplete",
          blockers: blockers.map((b) => b.item),
        },
        { status: 422 }
      );
    }
  }

  const now = new Date().toISOString();
  const tsColumn = STAGE_TS_COLUMN[targetStage];

  // Map stage back to legacy status for compat
  const statusMap: Partial<Record<Stage, string>> = {
    PREPARATION:        "preparing",
    MARKET_READY:       "preparing",
    ACTIVE_MARKETING:   "listed",
    LEADS_ACTIVE:       "receiving_leads",
    SHOWINGS_ACTIVE:    "showing_scheduled",
    APPLICATIONS_ACTIVE:"applications_reviewing",
    VERIFICATION:       "applications_reviewing",
    APPROVAL:           "approved",
    LEASE_PENDING:      "approved",
    LEASE_SIGNED:       "leased",
    MOVE_IN:            "leased",
    CLOSED:             "leased",
  };

  const { data: updated, error: updateErr } = await db
    .from("leasing_properties")
    .update({
      stage: targetStage,
      status: statusMap[targetStage] ?? campaign.status,
      [tsColumn]: now,
    })
    .eq("id", id)
    .select()
    .single();

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  // Get actor identity
  const isAdmin = await isAdminAuthenticated(req);
  const employeeId = await getLeasingEmployee(req);

  // Emit STAGE_CHANGED event
  await db.from("leasing_events").insert({
    campaign_id: id,
    event_type: "STAGE_CHANGED",
    actor: isAdmin ? "Admin" : "Coordinator",
    actor_id: employeeId,
    metadata: { from: campaign.stage, to: targetStage },
  });

  return NextResponse.json(updated);
}
