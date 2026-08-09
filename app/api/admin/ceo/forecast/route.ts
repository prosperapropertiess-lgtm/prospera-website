/**
 * PSN-DATA-001 — Forecast Engine
 * GET /api/admin/ceo/forecast?scenario_id=&months=12
 * Computes 12-month forecast from scenario assumptions + current actuals state.
 * Results are stored in forecast_results for Actual vs Forecast comparison.
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { runForecast, type ForecastAssumptions } from "@/lib/ceo-engine";
import { fetchAllOwners, fetchAllProperties } from "@/lib/notion";

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getSupabaseAdmin();
  const { searchParams } = new URL(req.url);
  const scenario_id = searchParams.get("scenario_id");
  const months = parseInt(searchParams.get("months") ?? "12");
  const save = searchParams.get("save") === "true";

  // Get all scenarios if no specific one requested
  if (!scenario_id) {
    const { data: scenarios } = await db
      .from("forecast_scenarios")
      .select("*")
      .eq("is_active", true)
      .order("created_at");

    const { data: allAssumptions } = await db
      .from("forecast_assumptions")
      .select("*")
      .is("period", null);

    // Get current state from Notion
    let pum = 0;
    let ownerCount = 0;
    try {
      const [owners, properties] = await Promise.all([
        fetchAllOwners(),
        fetchAllProperties(),
      ]);
      ownerCount = owners.length;
      pum = properties.filter((p) =>
        ["occupied", "vacant", "active", "managed"].includes((p.status ?? "").toLowerCase())
      ).length;
    } catch { /* non-fatal */ }

    // Get latest payroll from actuals
    const { data: latestActuals } = await db
      .from("ceo_monthly_actuals")
      .select("payroll")
      .order("period", { ascending: false })
      .limit(1)
      .single();

    const startingPayroll = Number(latestActuals?.payroll ?? 0);

    const results: Record<string, ReturnType<typeof runForecast>> = {};

    for (const scenario of (scenarios ?? [])) {
      const assumptions = (allAssumptions ?? []).find((a) => a.scenario_id === scenario.id);
      if (!assumptions) continue;

      const fa: ForecastAssumptions = {
        scenario_id: scenario.id,
        new_properties_per_month: Number(assumptions.new_properties_per_month ?? 1),
        property_churn_rate: Number(assumptions.property_churn_rate ?? 0.02),
        new_owners_per_month: Number(assumptions.new_owners_per_month ?? 0.5),
        owner_churn_rate: Number(assumptions.owner_churn_rate ?? 0.02),
        avg_revenue_per_property: Number(assumptions.avg_revenue_per_property ?? 150),
        leasing_fee_per_placement: Number(assumptions.leasing_fee_per_placement ?? 800),
        placements_per_month: Number(assumptions.placements_per_month ?? 1),
        payroll_growth_rate: Number(assumptions.payroll_growth_rate ?? 0.01),
        marketing_spend_monthly: Number(assumptions.marketing_spend_monthly ?? 500),
        acquisition_spend_monthly: Number(assumptions.acquisition_spend_monthly ?? 300),
        opex_growth_rate: Number(assumptions.opex_growth_rate ?? 0.005),
        avg_properties_per_new_owner: Number(assumptions.avg_properties_per_new_owner ?? 1.2),
        expected_owner_lifetime_months: Number(assumptions.expected_owner_lifetime_months ?? 36),
        contribution_margin_pct: Number(assumptions.contribution_margin_pct ?? 0.65),
        starting_cash: Number(assumptions.starting_cash ?? 0),
      };

      results[scenario.type] = runForecast(fa, pum, ownerCount, startingPayroll, months);
    }

    return NextResponse.json({ scenarios: scenarios ?? [], forecasts: results, pum, owner_count: ownerCount });
  }

  // Single scenario
  const { data: assumptions } = await db
    .from("forecast_assumptions")
    .select("*")
    .eq("scenario_id", scenario_id)
    .is("period", null)
    .single();

  if (!assumptions) {
    return NextResponse.json({ error: "No assumptions found for this scenario" }, { status: 404 });
  }

  let pum = 0;
  let ownerCount = 0;
  try {
    const [owners, properties] = await Promise.all([fetchAllOwners(), fetchAllProperties()]);
    ownerCount = owners.length;
    pum = properties.filter((p) =>
      ["occupied", "vacant", "active", "managed"].includes((p.status ?? "").toLowerCase())
    ).length;
  } catch { /* non-fatal */ }

  const { data: latestActuals } = await db
    .from("ceo_monthly_actuals")
    .select("payroll")
    .order("period", { ascending: false })
    .limit(1)
    .single();

  const fa: ForecastAssumptions = {
    scenario_id,
    new_properties_per_month: Number(assumptions.new_properties_per_month ?? 1),
    property_churn_rate: Number(assumptions.property_churn_rate ?? 0.02),
    new_owners_per_month: Number(assumptions.new_owners_per_month ?? 0.5),
    owner_churn_rate: Number(assumptions.owner_churn_rate ?? 0.02),
    avg_revenue_per_property: Number(assumptions.avg_revenue_per_property ?? 150),
    leasing_fee_per_placement: Number(assumptions.leasing_fee_per_placement ?? 800),
    placements_per_month: Number(assumptions.placements_per_month ?? 1),
    payroll_growth_rate: Number(assumptions.payroll_growth_rate ?? 0.01),
    marketing_spend_monthly: Number(assumptions.marketing_spend_monthly ?? 500),
    acquisition_spend_monthly: Number(assumptions.acquisition_spend_monthly ?? 300),
    opex_growth_rate: Number(assumptions.opex_growth_rate ?? 0.005),
    avg_properties_per_new_owner: Number(assumptions.avg_properties_per_new_owner ?? 1.2),
    expected_owner_lifetime_months: Number(assumptions.expected_owner_lifetime_months ?? 36),
    contribution_margin_pct: Number(assumptions.contribution_margin_pct ?? 0.65),
    starting_cash: Number(assumptions.starting_cash ?? 0),
  };

  const forecast = runForecast(fa, pum, ownerCount, Number(latestActuals?.payroll ?? 0), months);

  // Optionally persist forecast results
  if (save && forecast.length > 0) {
    const runAt = new Date().toISOString();
    const rows = forecast.map((f) => ({
      scenario_id,
      period: f.period,
      forecast_run_at: runAt,
      assumption_version: assumptions.version ?? 1,
      pum_start: Math.round(f.pum_start),
      properties_added: Math.round(f.properties_added),
      properties_lost: Math.round(f.properties_lost),
      pum_end: Math.round(f.pum_end),
      owner_count: Math.round(f.owner_count),
      mrr: f.mrr,
      arr: f.arr,
      recurring_rev: f.recurring_rev,
      transactional_rev: f.transactional_rev,
      total_revenue: f.total_revenue,
      payroll: f.payroll,
      marketing: f.marketing,
      cogs: f.cogs,
      opex: f.opex,
      total_expenses: f.total_expenses,
      gross_profit: f.gross_profit,
      gross_margin_pct: f.gross_margin_pct,
      contribution_margin: f.contribution_margin,
      contribution_margin_pct: f.contribution_margin_pct,
      operating_profit: f.operating_profit,
      operating_margin_pct: f.operating_margin_pct,
      cash_opening: f.cash_opening,
      cash_closing: f.cash_closing,
      net_burn: f.net_burn,
      cac: f.cac,
      ltv: f.ltv,
      ltv_cac_ratio: f.ltv_cac_ratio,
      cac_payback_months: f.cac_payback_months,
      revenue_per_property: f.revenue_per_property,
      contribution_per_property: f.contribution_per_property,
    }));

    await db.from("forecast_results").upsert(rows, {
      onConflict: "scenario_id,period,forecast_run_at",
      ignoreDuplicates: true,
    });
  }

  return NextResponse.json({ forecast, pum, owner_count: ownerCount });
}
