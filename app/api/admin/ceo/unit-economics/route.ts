/**
 * PSN-DATA-001 — Unit Economics Engine
 * GET /api/admin/ceo/unit-economics
 * Computes all unit economics metrics from trailing actuals + config.
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { calcUnitEconomics, generateAlerts, type UEConfig } from "@/lib/ceo-engine";
import { buildMonthlyActuals } from "@/lib/ceo-actuals";

const DEFAULT_CONFIG: UEConfig = {
  expected_owner_lifetime_months: 36,
  target_ltv_cac_ratio: 3.0,
  target_cac_payback_months: 12,
  target_owner_churn_monthly: 0.02,
  target_contribution_margin_pct: 0.65,
  target_recurring_revenue_pct: 0.8,
  default_properties_per_new_owner: 1.2,
  target_revenue_concentration_top5: 0.4,
};

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getSupabaseAdmin();

  const { data: configRows } = await db.from("ceo_ue_config").select("key, value");
  const config: UEConfig = { ...DEFAULT_CONFIG };
  for (const row of configRows ?? []) {
    (config as unknown as Record<string, number>)[row.key] = Number(row.value);
  }

  // Shared builder — same corrected revenue/expense logic as the Financials tab.
  const { actuals, pum, owner_count } = await buildMonthlyActuals(12);
  const ascending = [...actuals].reverse(); // calcUnitEconomics wants oldest → newest

  const ue = calcUnitEconomics(ascending, config);
  const alerts = generateAlerts(ue, config);

  return NextResponse.json({
    unit_economics: ue,
    alerts,
    config,
    pum,
    owner_count,
    actuals_months: ascending.length,
    data_note:
      ascending.length < 3
        ? "Fewer than 3 months of actuals — enter monthly data for more accurate calculations"
        : ascending.length < 6
        ? "LTV is estimated (needs 6+ months of churn history for statistical calculation)"
        : null,
  });
}
