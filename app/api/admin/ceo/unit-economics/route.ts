/**
 * PSN-DATA-001 — Unit Economics Engine
 * GET /api/admin/ceo/unit-economics
 * Computes all unit economics metrics from trailing actuals + config.
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { calcUnitEconomics, generateAlerts, type MonthlyActual, type UEConfig } from "@/lib/ceo-engine";
import { fetchAllOwners, fetchAllProperties } from "@/lib/notion";

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getSupabaseAdmin();

  // Load manual actuals (last 12 months)
  const { data: manualActuals, error } = await db
    .from("ceo_monthly_actuals")
    .select("*")
    .order("period", { ascending: true })
    .limit(12);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Load UE config
  const { data: configRows } = await db
    .from("ceo_ue_config")
    .select("key, value");

  const config: UEConfig = {
    expected_owner_lifetime_months: 36,
    target_ltv_cac_ratio: 3.0,
    target_cac_payback_months: 12,
    target_owner_churn_monthly: 0.02,
    target_contribution_margin_pct: 0.65,
    target_recurring_revenue_pct: 0.80,
    default_properties_per_new_owner: 1.2,
    target_revenue_concentration_top5: 0.40,
  };

  for (const row of (configRows ?? [])) {
    (config as unknown as Record<string, number>)[row.key] = Number(row.value);
  }

  // Get current PUM and owner count from Notion
  let pumCurrent = 0;
  let ownerCountCurrent = 0;
  try {
    const [owners, properties] = await Promise.all([
      fetchAllOwners(),
      fetchAllProperties(),
    ]);
    ownerCountCurrent = owners.length;
    pumCurrent = properties.filter((p) =>
      ["occupied", "vacant", "active", "managed"].includes((p.status ?? "").toLowerCase())
    ).length;
  } catch { /* non-fatal */ }

  // Build MonthlyActual[] from manual records
  const actuals: MonthlyActual[] = (manualActuals ?? []).map((row) => ({
    period: row.period,
    revenue: Number(row.revenue_override ?? 0),
    recurring_revenue: Number(row.recurring_revenue ?? 0),
    transactional_revenue: Number(row.transactional_revenue ?? 0),
    expenses_total: Number(row.operating_expenses ?? 0),
    expenses_by_category: {},
    pum: pumCurrent,
    owner_count: ownerCountCurrent,
    properties_added: Number(row.properties_added ?? 0),
    properties_lost: Number(row.properties_lost ?? 0),
    owners_added: Number(row.owners_added ?? 0),
    owners_lost: Number(row.owners_lost ?? 0),
    payroll: Number(row.payroll ?? 0),
    marketing_spend: Number(row.marketing_spend ?? 0),
    acquisition_spend: Number(row.acquisition_spend ?? 0),
    operating_expenses: Number(row.operating_expenses ?? 0),
    cash_opening: row.cash_opening !== null ? Number(row.cash_opening) : null,
    cash_closing: row.cash_closing !== null ? Number(row.cash_closing) : null,
    new_leads: Number(row.new_leads ?? 0),
    qualified_leads: Number(row.qualified_leads ?? 0),
    discovery_calls: Number(row.discovery_calls ?? 0),
    proposals_sent: Number(row.proposals_sent ?? 0),
    new_owners: Number(row.new_owners ?? 0),
    employee_count: Number(row.employee_count ?? 0),
    notes: row.notes ?? null,
    revenue_source: row.revenue_override !== null ? "manual_override" : "notion",
    expenses_source: "notion",
  }));

  const ue = calcUnitEconomics(actuals, config);
  const alerts = generateAlerts(ue, config);

  return NextResponse.json({
    unit_economics: ue,
    alerts,
    config,
    pum: pumCurrent,
    owner_count: ownerCountCurrent,
    actuals_months: actuals.length,
    data_note: actuals.length < 3
      ? "Fewer than 3 months of actuals — enter monthly data for more accurate calculations"
      : actuals.length < 6
      ? "LTV is estimated (needs 6+ months of churn history for statistical calculation)"
      : null,
  });
}
