/**
 * GET /api/admin/leasing/properties/[id]/metrics
 * Computed campaign metrics: economics, speed-to-lead, funnel, diagnostics.
 */
import { NextRequest, NextResponse } from "next/server";
import { isLeasingOrAdminAuthenticated } from "@/lib/leasing-auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isLeasingOrAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = getSupabaseAdmin();

  const [
    { data: campaign },
    { data: leads },
    { data: showings },
    { data: applications },
    { data: checklist },
  ] = await Promise.all([
    db.from("leasing_properties").select("*").eq("id", id).single(),
    db.from("leasing_leads").select("*").eq("leasing_property_id", id),
    db.from("leasing_showings").select("*").eq("leasing_property_id", id),
    db.from("leasing_applications").select("*").eq("campaign_id", id),
    db.from("leasing_checklist").select("id, required, completed").eq("leasing_property_id", id),
  ]);

  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // ── Vacancy Economics ──────────────────────────────────────────────────────
  const vacantSince = campaign.vacant_since ? new Date(campaign.vacant_since) : new Date();
  const daysVacant = Math.floor((Date.now() - vacantSince.getTime()) / (1000 * 60 * 60 * 24));
  const monthlyRent = Number(campaign.asking_rent ?? 0);
  const dailyCost = monthlyRent * 12 / 365;
  const vacancyLoss = dailyCost * daysVacant;
  const incentiveCost = Number(campaign.incentive_value ?? 0);
  const effectiveFirstYearRent = monthlyRent * 12 - incentiveCost;

  // ── Checklist ──────────────────────────────────────────────────────────────
  const requiredItems = (checklist ?? []).filter((c) => c.required);
  const requiredComplete = requiredItems.filter((c) => c.completed).length;
  const requiredTotal = requiredItems.length;
  const blockedByChecklist = requiredComplete < requiredTotal;

  // ── Speed-to-Lead ──────────────────────────────────────────────────────────
  const leadsArr = leads ?? [];
  const responseTimes = leadsArr
    .filter((l) => l.first_response_at && l.created_at)
    .map((l) => {
      const received = new Date(l.created_at).getTime();
      const responded = new Date(l.first_response_at).getTime();
      return Math.max(0, (responded - received) / 60000); // minutes
    });

  const uncontactedLeads = leadsArr.filter((l) => {
    if (l.first_response_at) return false;
    const ageMin = (Date.now() - new Date(l.created_at).getTime()) / 60000;
    return ageMin > 30; // older than 30 minutes with no response
  });

  const medianResponseMin = responseTimes.length > 0
    ? responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length / 2)]
    : null;
  const avgResponseMin = responseTimes.length > 0
    ? responseTimes.reduce((s, v) => s + v, 0) / responseTimes.length
    : null;
  const pctUnder5 = responseTimes.length > 0
    ? responseTimes.filter((t) => t <= 5).length / responseTimes.length
    : null;
  const pctUnder15 = responseTimes.length > 0
    ? responseTimes.filter((t) => t <= 15).length / responseTimes.length
    : null;
  const pctUnder60 = responseTimes.length > 0
    ? responseTimes.filter((t) => t <= 60).length / responseTimes.length
    : null;

  // ── Funnel ─────────────────────────────────────────────────────────────────
  const showingsArr = showings ?? [];
  const appsArr = applications ?? [];

  const funnel = {
    leads_total: leadsArr.length,
    leads_contacted: leadsArr.filter((l) => l.first_response_at || l.pipeline_stage !== "NEW").length,
    leads_qualified: leadsArr.filter((l) => ["QUALIFIED","SHOWING_BOOKED","SHOWING_COMPLETED","APPLIED","VERIFYING","APPROVED","LEASED"].includes(l.pipeline_stage)).length,
    showings_booked: showingsArr.length,
    showings_completed: showingsArr.filter((s) => s.status === "completed").length,
    showings_no_show: showingsArr.filter((s) => s.status === "no_show").length,
    applications_started: appsArr.length,
    applications_submitted: appsArr.filter((a) => a.stage !== "LINK_SENT").length,
    leads_lost: leadsArr.filter((l) => l.pipeline_stage === "LOST").length,
  };

  // ── Lost Reason Tally ──────────────────────────────────────────────────────
  const lostReasonTally: Record<string, number> = {};
  leadsArr.filter((l) => l.pipeline_stage === "LOST" && l.lost_reason).forEach((l) => {
    lostReasonTally[l.lost_reason] = (lostReasonTally[l.lost_reason] ?? 0) + 1;
  });

  // ── Showing Objection Tally ────────────────────────────────────────────────
  const objectionFields = ["feedback_laundry","feedback_parking","feedback_location","feedback_layout","feedback_utilities"];
  const objectionTally: Record<string, number> = {};
  showingsArr.filter((s) => s.status === "completed").forEach((s) => {
    if (s.feedback_price === "too_high") objectionTally["price"] = (objectionTally["price"] ?? 0) + 1;
    if (s.feedback_size === "too_small") objectionTally["size"] = (objectionTally["size"] ?? 0) + 1;
    if (s.feedback_condition === "poor") objectionTally["condition"] = (objectionTally["condition"] ?? 0) + 1;
    objectionFields.forEach((f) => {
      if ((s as Record<string, unknown>)[f]) {
        const label = f.replace("feedback_", "");
        objectionTally[label] = (objectionTally[label] ?? 0) + 1;
      }
    });
  });

  // ── Diagnostics (rule-based) ───────────────────────────────────────────────
  const daysActive = campaign.campaign_start_date
    ? Math.floor((Date.now() - new Date(campaign.campaign_start_date).getTime()) / 86400000)
    : daysVacant;

  const diagnostics: { severity: "high" | "medium"; message: string; action: string }[] = [];

  if (daysActive >= 7 && funnel.leads_total === 0) {
    diagnostics.push({ severity: "high", message: "No leads after 7+ days on market", action: "Review pricing, photos, and active marketing channels." });
  }
  if (funnel.leads_total >= 5 && funnel.showings_booked === 0) {
    diagnostics.push({ severity: "high", message: "Leads not converting to showings", action: "Check response speed and showing availability." });
  }
  if (funnel.showings_completed >= 3 && funnel.applications_submitted === 0) {
    diagnostics.push({ severity: "high", message: "Showings not generating applications", action: "Review showing feedback — objection patterns may indicate a price or property issue." });
  }
  if (uncontactedLeads.length > 0) {
    diagnostics.push({ severity: "high", message: `${uncontactedLeads.length} lead${uncontactedLeads.length > 1 ? "s" : ""} waiting for first contact`, action: "Respond now — speed to lead is critical." });
  }
  if (blockedByChecklist && campaign.stage === "PREPARATION") {
    diagnostics.push({ severity: "medium", message: `${requiredTotal - requiredComplete} required checklist item${requiredTotal - requiredComplete > 1 ? "s" : ""} still incomplete`, action: "Complete required items to advance to Market Ready." });
  }

  return NextResponse.json({
    economics: { days_vacant: daysVacant, daily_cost: Math.round(dailyCost * 100) / 100, vacancy_loss: Math.round(vacancyLoss), monthly_rent: monthlyRent, incentive_cost: incentiveCost, effective_first_year_rent: Math.round(effectiveFirstYearRent) },
    checklist: { required_total: requiredTotal, required_complete: requiredComplete, blocked: blockedByChecklist },
    speed_to_lead: { median_response_min: medianResponseMin !== null ? Math.round(medianResponseMin) : null, avg_response_min: avgResponseMin !== null ? Math.round(avgResponseMin) : null, pct_under_5_min: pctUnder5, pct_under_15_min: pctUnder15, pct_under_60_min: pctUnder60, uncontacted_count: uncontactedLeads.length },
    funnel,
    lost_reason_tally: lostReasonTally,
    objection_tally: objectionTally,
    diagnostics,
  });
}
