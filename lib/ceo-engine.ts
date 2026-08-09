/**
 * PSN-DATA-001 — CEO Forecasting & Scenario Planning
 * Calculation Engine
 *
 * ALL financial formulas live here. Never in UI components.
 * Hierarchy: Operational Records → Actual Facts → Calculated Metrics
 *            → Forecast Assumptions → Forecast Outputs → CEO Decisions
 */

// ── Types ──────────────────────────────────────────────────────────────────

export interface MonthlyActual {
  period: string;                    // "2026-08-01"
  // From Notion (auto)
  revenue: number;
  recurring_revenue: number;
  transactional_revenue: number;
  expenses_total: number;
  expenses_by_category: Record<string, number>;
  pum: number;                       // properties under management (end of period)
  owner_count: number;
  // From ceo_monthly_actuals (manual)
  properties_added: number;
  properties_lost: number;
  owners_added: number;
  owners_lost: number;
  payroll: number;
  marketing_spend: number;
  acquisition_spend: number;         // CAC-attributable subset of marketing
  operating_expenses: number;
  cash_opening: number | null;
  cash_closing: number | null;
  new_leads: number;
  qualified_leads: number;
  discovery_calls: number;
  proposals_sent: number;
  new_owners: number;
  employee_count: number;
  notes: string | null;
  // Data freshness
  revenue_source: "notion" | "manual_override" | "missing";
  expenses_source: "notion" | "missing";
}

export interface UnitEconomics {
  // Acquisition
  owner_cac: number | null;          // MET-UNIT-001
  property_cac: number | null;       // MET-UNIT-002
  effective_property_cac: number | null;
  // Value
  owner_ltv: number | null;          // MET-UNIT-003
  property_ltv: number | null;       // MET-UNIT-004
  ltv_cac_ratio: number | null;      // MET-UNIT-005
  // Payback
  cac_payback_months: number | null; // MET-UNIT-006
  // Margin
  gross_margin_pct: number | null;   // MET-UNIT-007
  contribution_margin: number | null;
  contribution_margin_pct: number | null; // MET-UNIT-008
  contribution_per_property: number | null; // MET-UNIT-009
  contribution_per_owner: number | null;    // MET-UNIT-010
  revenue_per_property: number | null;      // MET-UNIT-011
  revenue_per_owner: number | null;         // MET-UNIT-012
  // Retention
  owner_churn_rate: number | null;   // MET-UNIT-013
  property_churn_rate: number | null;// MET-UNIT-014
  owner_retention: number | null;
  property_retention: number | null;
  // Recurring
  recurring_revenue_pct: number | null; // MET-UNIT-017
  // Scale
  properties_per_owner: number | null;  // MET-UNIT-018
  revenue_per_employee: number | null;  // MET-UNIT-019
  pum_per_employee: number | null;      // MET-UNIT-021
  // Headcount
  mrr: number | null;
  arr: number | null;
  // Data quality flags
  ltv_source: "calculated" | "estimated";
  cac_source: "calculated" | "estimated";
  ltv_confidence: "low" | "medium" | "high";
}

export interface ForecastAssumptions {
  scenario_id: string;
  new_properties_per_month: number;
  property_churn_rate: number;       // monthly %
  new_owners_per_month: number;
  owner_churn_rate: number;          // monthly %
  avg_revenue_per_property: number;
  leasing_fee_per_placement: number;
  placements_per_month: number;
  payroll_growth_rate: number;
  marketing_spend_monthly: number;
  acquisition_spend_monthly: number;
  opex_growth_rate: number;
  avg_properties_per_new_owner: number;
  expected_owner_lifetime_months: number;
  contribution_margin_pct: number;
  starting_cash: number;
}

export interface ForecastMonth {
  period: string;                    // "2026-09-01"
  // Growth
  pum_start: number;
  properties_added: number;
  properties_lost: number;
  pum_end: number;
  owner_count: number;
  // Revenue
  mrr: number;
  arr: number;
  recurring_rev: number;
  transactional_rev: number;
  total_revenue: number;
  // Costs
  payroll: number;
  marketing: number;
  cogs: number;
  opex: number;
  total_expenses: number;
  // Profitability
  gross_profit: number;
  gross_margin_pct: number;
  contribution_margin: number;
  contribution_margin_pct: number;
  operating_profit: number;
  operating_margin_pct: number;
  // Cash
  cash_opening: number;
  cash_closing: number;
  net_burn: number;
  // Unit economics (forecast)
  cac: number;
  ltv: number;
  ltv_cac_ratio: number;
  cac_payback_months: number;
  revenue_per_property: number;
  contribution_per_property: number;
}

export interface UEConfig {
  expected_owner_lifetime_months: number;
  target_ltv_cac_ratio: number;
  target_cac_payback_months: number;
  target_owner_churn_monthly: number;
  target_contribution_margin_pct: number;
  target_recurring_revenue_pct: number;
  default_properties_per_new_owner: number;
  target_revenue_concentration_top5: number;
}

// ── MRR / ARR ──────────────────────────────────────────────────────────────

/**
 * MRR = PUM × average recurring revenue per property
 * Preferred: sum of active recurring contract revenue (if available)
 */
export function calcMRR(pum: number, avg_revenue_per_property: number): number {
  return pum * avg_revenue_per_property;
}

export function calcARR(mrr: number): number {
  return mrr * 12;
}

// ── CONTRIBUTION MARGIN ────────────────────────────────────────────────────

/**
 * Contribution Margin = Revenue - Variable Service Delivery Costs
 * (payroll + direct operating costs, NOT corporate overhead unless configured)
 */
export function calcContributionMargin(
  revenue: number,
  payroll: number,
  direct_opex: number
): number {
  return revenue - payroll - direct_opex;
}

export function calcContributionMarginPct(contribution_margin: number, revenue: number): number | null {
  if (revenue === 0) return null;
  return contribution_margin / revenue;
}

export function calcContributionPerProperty(contribution_margin: number, pum: number): number | null {
  if (pum === 0) return null;
  return contribution_margin / pum;
}

export function calcContributionPerOwner(contribution_margin: number, owner_count: number): number | null {
  if (owner_count === 0) return null;
  return contribution_margin / owner_count;
}

// ── GROSS MARGIN ───────────────────────────────────────────────────────────

export function calcGrossProfit(revenue: number, cogs: number): number {
  return revenue - cogs;
}

export function calcGrossMarginPct(gross_profit: number, revenue: number): number | null {
  if (revenue === 0) return null;
  return gross_profit / revenue;
}

// ── REVENUE PER UNIT ───────────────────────────────────────────────────────

export function calcRevenuePerProperty(revenue: number, pum: number): number | null {
  if (pum === 0) return null;
  return revenue / pum;
}

export function calcRevenuePerOwner(revenue: number, owner_count: number): number | null {
  if (owner_count === 0) return null;
  return revenue / owner_count;
}

// ── CAC ────────────────────────────────────────────────────────────────────

/**
 * MET-UNIT-001: Owner CAC = Acquisition Spend / New Owners
 */
export function calcOwnerCAC(acquisition_spend: number, new_owners: number): number | null {
  if (new_owners === 0) return null;
  return acquisition_spend / new_owners;
}

/**
 * MET-UNIT-002: Property CAC = Acquisition Spend / Properties Acquired
 */
export function calcPropertyCAC(acquisition_spend: number, properties_added: number): number | null {
  if (properties_added === 0) return null;
  return acquisition_spend / properties_added;
}

/**
 * Effective Property CAC = Owner CAC / Avg Properties Per New Owner
 */
export function calcEffectivePropertyCAC(
  owner_cac: number | null,
  avg_properties_per_new_owner: number
): number | null {
  if (owner_cac === null || avg_properties_per_new_owner === 0) return null;
  return owner_cac / avg_properties_per_new_owner;
}

// ── CHURN ──────────────────────────────────────────────────────────────────

/**
 * MET-UNIT-013: Monthly Owner Churn = Owners Lost / Owners at Start
 */
export function calcOwnerChurnRate(owners_lost: number, owners_start: number): number | null {
  if (owners_start === 0) return null;
  return owners_lost / owners_start;
}

/**
 * MET-UNIT-014: Monthly Property Churn = Properties Lost / PUM at Start
 */
export function calcPropertyChurnRate(properties_lost: number, pum_start: number): number | null {
  if (pum_start === 0) return null;
  return properties_lost / pum_start;
}

// ── LTV ────────────────────────────────────────────────────────────────────

/**
 * MET-UNIT-003: Owner LTV = Monthly Contribution Margin Per Owner × Expected Lifetime Months
 *
 * WARNING: Do NOT use revenue-based LTV as economic LTV.
 * When churn history is insufficient, uses assumed lifetime from ceo_ue_config.
 * Must be labelled as estimated with confidence level.
 */
export function calcOwnerLTV(
  contribution_per_owner: number | null,
  monthly_churn_rate: number | null,
  assumed_lifetime_months: number,
  has_sufficient_churn_history: boolean
): { ltv: number | null; source: "calculated" | "estimated"; confidence: "low" | "medium" | "high" } {
  if (contribution_per_owner === null) {
    return { ltv: null, source: "estimated", confidence: "low" };
  }

  if (has_sufficient_churn_history && monthly_churn_rate !== null && monthly_churn_rate > 0) {
    // Preferred: 1/churn (valid when sufficient history and non-zero churn)
    const lifetime = 1 / monthly_churn_rate;
    return {
      ltv: contribution_per_owner * lifetime,
      source: "calculated",
      confidence: "medium",
    };
  }

  // Fallback: manual assumption (must be clearly labelled)
  return {
    ltv: contribution_per_owner * assumed_lifetime_months,
    source: "estimated",
    confidence: "low",
  };
}

/**
 * MET-UNIT-004: Property LTV = Contribution Margin Per Property × Expected Property Lifetime
 */
export function calcPropertyLTV(
  contribution_per_property: number | null,
  expected_lifetime_months: number
): number | null {
  if (contribution_per_property === null) return null;
  return contribution_per_property * expected_lifetime_months;
}

// ── LTV:CAC ────────────────────────────────────────────────────────────────

/**
 * MET-UNIT-005: LTV:CAC Ratio
 */
export function calcLTVCACRatio(ltv: number | null, cac: number | null): number | null {
  if (ltv === null || cac === null || cac === 0) return null;
  return ltv / cac;
}

// ── CAC PAYBACK ────────────────────────────────────────────────────────────

/**
 * MET-UNIT-006: CAC Payback = Owner CAC / Monthly Contribution Margin Per Owner
 */
export function calcCACPayback(
  cac: number | null,
  monthly_contribution_per_owner: number | null
): number | null {
  if (cac === null || monthly_contribution_per_owner === null || monthly_contribution_per_owner === 0) {
    return null;
  }
  return cac / monthly_contribution_per_owner;
}

// ── RECURRING REVENUE % ────────────────────────────────────────────────────

/**
 * MET-UNIT-017: Recurring Revenue % = Recurring Revenue / Total Revenue
 */
export function calcRecurringRevenuePct(recurring: number, total: number): number | null {
  if (total === 0) return null;
  return recurring / total;
}

// ── EMPLOYEE PRODUCTIVITY ──────────────────────────────────────────────────

export function calcRevenuePerEmployee(revenue: number, employees: number): number | null {
  if (employees === 0) return null;
  return revenue / employees;
}

export function calcPUMPerEmployee(pum: number, employees: number): number | null {
  if (employees === 0) return null;
  return pum / employees;
}

// ── NET PROPERTY GROWTH ────────────────────────────────────────────────────

export function calcNetPropertyGrowth(added: number, lost: number): number {
  return added - lost;
}

export function calcEndingPUM(starting: number, added: number, lost: number): number {
  return starting + added - lost;
}

// ── CASH / RUNWAY ──────────────────────────────────────────────────────────

export function calcRunway(cash: number, monthly_burn: number): number | null {
  if (monthly_burn >= 0) return null; // cash flow positive — no finite runway
  return cash / Math.abs(monthly_burn);
}

// ── FULL UNIT ECONOMICS from actuals ──────────────────────────────────────

export function calcUnitEconomics(
  actuals: MonthlyActual[],
  config: UEConfig
): UnitEconomics {
  if (actuals.length === 0) {
    return emptyUnitEconomics();
  }

  // Use trailing 3-month average for stability
  const recent = actuals.slice(-3);
  const latest = actuals[actuals.length - 1];

  const avg = <T extends number | null>(vals: T[]): T => {
    const nums = vals.filter((v): v is NonNullable<T> & number => v !== null) as number[];
    if (nums.length === 0) return null as T;
    return (nums.reduce((s, v) => s + v, 0) / nums.length) as T;
  };

  const avgRevenue = avg(recent.map((a) => a.revenue));
  const avgPUM = avg(recent.map((a) => a.pum));
  const avgOwners = avg(recent.map((a) => a.owner_count));
  const avgPayroll = avg(recent.map((a) => a.payroll));
  const avgOpex = avg(recent.map((a) => a.operating_expenses));
  const avgAcquisitionSpend = avg(recent.map((a) => a.acquisition_spend));
  const avgNewOwners = avg(recent.map((a) => a.new_owners));
  const avgPropertiesAdded = avg(recent.map((a) => a.properties_added));
  const avgPropertiesLost = avg(recent.map((a) => a.properties_lost));
  const avgOwnersLost = avg(recent.map((a) => a.owners_lost));
  const avgRecurring = avg(recent.map((a) => a.recurring_revenue));
  const avgEmployees = avg(recent.map((a) => a.employee_count));

  // Contribution margin
  const cm = avgRevenue !== null && avgPayroll !== null && avgOpex !== null
    ? calcContributionMargin(avgRevenue, avgPayroll, avgOpex)
    : null;
  const cm_pct = cm !== null && avgRevenue !== null ? calcContributionMarginPct(cm, avgRevenue) : null;
  const cm_per_property = cm !== null && avgPUM !== null ? calcContributionPerProperty(cm, avgPUM) : null;
  const cm_per_owner = cm !== null && avgOwners !== null ? calcContributionPerOwner(cm, avgOwners) : null;

  // Gross margin (approximate: cogs = payroll + opex for service business)
  const gross_profit = avgRevenue !== null && avgPayroll !== null && avgOpex !== null
    ? calcGrossProfit(avgRevenue, avgPayroll + avgOpex)
    : null;
  const gross_margin_pct = gross_profit !== null && avgRevenue !== null
    ? calcGrossMarginPct(gross_profit, avgRevenue)
    : null;

  // CAC
  const owner_cac = avgAcquisitionSpend !== null && avgNewOwners !== null
    ? calcOwnerCAC(avgAcquisitionSpend, avgNewOwners)
    : null;
  const property_cac = avgAcquisitionSpend !== null && avgPropertiesAdded !== null
    ? calcPropertyCAC(avgAcquisitionSpend, avgPropertiesAdded)
    : null;
  const effective_property_cac = calcEffectivePropertyCAC(owner_cac, config.default_properties_per_new_owner);

  // Churn
  const owner_churn = avgOwnersLost !== null && avgOwners !== null
    ? calcOwnerChurnRate(avgOwnersLost, avgOwners)
    : null;
  const property_churn = avgPropertiesLost !== null && avgPUM !== null
    ? calcPropertyChurnRate(avgPropertiesLost, avgPUM)
    : null;

  // LTV — requires at least 6 months of data for statistical churn
  const has_sufficient_history = actuals.length >= 6;
  const ltvResult = calcOwnerLTV(
    cm_per_owner,
    owner_churn,
    config.expected_owner_lifetime_months,
    has_sufficient_history
  );

  const property_ltv = calcPropertyLTV(cm_per_property, config.expected_owner_lifetime_months);

  // LTV:CAC
  const ltv_cac = calcLTVCACRatio(ltvResult.ltv, owner_cac);

  // Payback
  const payback = calcCACPayback(owner_cac, cm_per_owner);

  // MRR
  const mrr = avgPUM !== null && avgRevenue !== null && avgPUM > 0
    ? avgRevenue  // actual monthly recurring revenue
    : null;
  const arr = mrr !== null ? calcARR(mrr) : null;

  // Revenue per unit
  const rev_per_property = avgRevenue !== null && avgPUM !== null
    ? calcRevenuePerProperty(avgRevenue, avgPUM)
    : null;
  const rev_per_owner = avgRevenue !== null && avgOwners !== null
    ? calcRevenuePerOwner(avgRevenue, avgOwners)
    : null;

  // Recurring %
  const recurring_pct = avgRecurring !== null && avgRevenue !== null
    ? calcRecurringRevenuePct(avgRecurring, avgRevenue)
    : null;

  // Properties per owner
  const props_per_owner = avgPUM !== null && avgOwners !== null && avgOwners > 0
    ? avgPUM / avgOwners
    : null;

  // Employee productivity
  const rev_per_emp = avgRevenue !== null && avgEmployees !== null
    ? calcRevenuePerEmployee(avgRevenue, avgEmployees)
    : null;
  const pum_per_emp = avgPUM !== null && avgEmployees !== null
    ? calcPUMPerEmployee(avgPUM, avgEmployees)
    : null;

  return {
    owner_cac,
    property_cac,
    effective_property_cac,
    owner_ltv: ltvResult.ltv,
    property_ltv,
    ltv_cac_ratio: ltv_cac,
    cac_payback_months: payback,
    gross_margin_pct,
    contribution_margin: cm,
    contribution_margin_pct: cm_pct,
    contribution_per_property: cm_per_property,
    contribution_per_owner: cm_per_owner,
    revenue_per_property: rev_per_property,
    revenue_per_owner: rev_per_owner,
    owner_churn_rate: owner_churn,
    property_churn_rate: property_churn,
    owner_retention: owner_churn !== null ? 1 - owner_churn : null,
    property_retention: property_churn !== null ? 1 - property_churn : null,
    recurring_revenue_pct: recurring_pct,
    properties_per_owner: props_per_owner,
    revenue_per_employee: rev_per_emp,
    pum_per_employee: pum_per_emp,
    mrr,
    arr,
    ltv_source: ltvResult.source,
    cac_source: owner_cac !== null ? "calculated" : "estimated",
    ltv_confidence: ltvResult.confidence,
  };
}

// ── 12-MONTH FORECAST ─────────────────────────────────────────────────────

/**
 * Generates monthly forecast for N months starting from a given date.
 * Uses assumptions from a scenario; actuals seed the starting state.
 */
export function runForecast(
  assumptions: ForecastAssumptions,
  starting_pum: number,
  starting_owners: number,
  starting_payroll: number,
  months: number = 12
): ForecastMonth[] {
  const results: ForecastMonth[] = [];

  let pum = starting_pum;
  let owner_count = starting_owners;
  let payroll = starting_payroll;
  let opex = assumptions.marketing_spend_monthly + (assumptions.marketing_spend_monthly * 0.3); // rough initial opex
  let cash = assumptions.starting_cash;

  const startDate = new Date();
  startDate.setDate(1);
  startDate.setMonth(startDate.getMonth() + 1); // start next month

  for (let i = 0; i < months; i++) {
    const period = new Date(startDate);
    period.setMonth(startDate.getMonth() + i);
    const periodStr = period.toISOString().split("T")[0];

    // Growth
    const pum_start = pum;
    const props_lost = Math.round(pum * assumptions.property_churn_rate);
    const props_added = assumptions.new_properties_per_month +
      (assumptions.new_owners_per_month * assumptions.avg_properties_per_new_owner);
    const pum_end = Math.max(0, pum_start + props_added - props_lost);

    const owners_lost = Math.round(owner_count * assumptions.owner_churn_rate);
    const owners_end = Math.max(0, owner_count + assumptions.new_owners_per_month - owners_lost);

    // Revenue
    const avg_pum = (pum_start + pum_end) / 2;
    const recurring_rev = avg_pum * assumptions.avg_revenue_per_property;
    const transactional_rev = assumptions.placements_per_month * assumptions.leasing_fee_per_placement;
    const total_revenue = recurring_rev + transactional_rev;
    const mrr = recurring_rev;
    const arr = calcARR(mrr);

    // Costs
    payroll = payroll * (1 + assumptions.payroll_growth_rate);
    opex = opex * (1 + assumptions.opex_growth_rate);
    const marketing = assumptions.marketing_spend_monthly;
    const cogs = payroll * 0.6; // direct labour allocation
    const total_expenses = payroll + marketing + opex;

    // Profitability
    const gross_profit = total_revenue - cogs;
    const gross_margin_pct = total_revenue > 0 ? gross_profit / total_revenue : 0;
    const contribution_margin = total_revenue * assumptions.contribution_margin_pct;
    const cm_pct = assumptions.contribution_margin_pct;
    const operating_profit = total_revenue - total_expenses;
    const op_margin = total_revenue > 0 ? operating_profit / total_revenue : 0;

    // Cash
    const cash_opening = cash;
    const cash_closing = cash + operating_profit;
    const net_burn = operating_profit;
    cash = cash_closing;

    // Unit economics (forecast)
    const cac = assumptions.acquisition_spend_monthly > 0 && assumptions.new_owners_per_month > 0
      ? assumptions.acquisition_spend_monthly / assumptions.new_owners_per_month
      : 0;
    const cm_per_owner = owners_end > 0 ? contribution_margin / owners_end : 0;
    const ltv = cm_per_owner * assumptions.expected_owner_lifetime_months;
    const ltv_cac = cac > 0 ? ltv / cac : 0;
    const payback = cm_per_owner > 0 ? cac / cm_per_owner : 0;
    const rev_per_prop = avg_pum > 0 ? total_revenue / avg_pum : 0;
    const cm_per_prop = avg_pum > 0 ? contribution_margin / avg_pum : 0;

    results.push({
      period: periodStr,
      pum_start,
      properties_added: props_added,
      properties_lost: props_lost,
      pum_end,
      owner_count: owners_end,
      mrr,
      arr,
      recurring_rev,
      transactional_rev,
      total_revenue,
      payroll,
      marketing,
      cogs,
      opex,
      total_expenses,
      gross_profit,
      gross_margin_pct,
      contribution_margin,
      contribution_margin_pct: cm_pct,
      operating_profit,
      operating_margin_pct: op_margin,
      cash_opening,
      cash_closing,
      net_burn,
      cac,
      ltv,
      ltv_cac_ratio: ltv_cac,
      cac_payback_months: payback,
      revenue_per_property: rev_per_prop,
      contribution_per_property: cm_per_prop,
    });

    pum = pum_end;
    owner_count = owners_end;
  }

  return results;
}

// ── EXECUTIVE ALERTS ───────────────────────────────────────────────────────

export interface ExecutiveAlert {
  metric: string;
  actual: number | null;
  target: number | null;
  difference: number | null;
  severity: "warning" | "critical" | "info";
  message: string;
  driver: string;
}

export function generateAlerts(ue: UnitEconomics, config: UEConfig): ExecutiveAlert[] {
  const alerts: ExecutiveAlert[] = [];

  const check = (
    metric: string,
    actual: number | null,
    target: number | null,
    condition: boolean,
    severity: "warning" | "critical",
    message: string,
    driver: string
  ) => {
    if (actual !== null && condition) {
      alerts.push({
        metric, actual, target,
        difference: target !== null ? actual - target : null,
        severity, message, driver,
      });
    }
  };

  check(
    "LTV:CAC",
    ue.ltv_cac_ratio,
    config.target_ltv_cac_ratio,
    ue.ltv_cac_ratio !== null && ue.ltv_cac_ratio < config.target_ltv_cac_ratio,
    ue.ltv_cac_ratio !== null && ue.ltv_cac_ratio < 1 ? "critical" : "warning",
    `LTV:CAC is ${ue.ltv_cac_ratio?.toFixed(1)}x — below ${config.target_ltv_cac_ratio}x target`,
    "Review CAC spend or improve owner retention to lift LTV"
  );

  check(
    "CAC Payback",
    ue.cac_payback_months,
    config.target_cac_payback_months,
    ue.cac_payback_months !== null && ue.cac_payback_months > config.target_cac_payback_months,
    "warning",
    `CAC payback is ${ue.cac_payback_months?.toFixed(0)} months — exceeds ${config.target_cac_payback_months}-month target`,
    "CAC is too high or contribution margin per owner is too low"
  );

  check(
    "Owner Churn",
    ue.owner_churn_rate !== null ? ue.owner_churn_rate * 100 : null,
    config.target_owner_churn_monthly * 100,
    ue.owner_churn_rate !== null && ue.owner_churn_rate > config.target_owner_churn_monthly,
    "warning",
    `Monthly owner churn is ${((ue.owner_churn_rate ?? 0) * 100).toFixed(1)}% — above ${(config.target_owner_churn_monthly * 100).toFixed(1)}% target`,
    "Investigate recently lost owners — service issue or pricing?"
  );

  check(
    "Contribution Margin",
    ue.contribution_margin_pct !== null ? ue.contribution_margin_pct * 100 : null,
    config.target_contribution_margin_pct * 100,
    ue.contribution_margin_pct !== null && ue.contribution_margin_pct < config.target_contribution_margin_pct,
    "warning",
    `Contribution margin is ${((ue.contribution_margin_pct ?? 0) * 100).toFixed(1)}% — below ${(config.target_contribution_margin_pct * 100).toFixed(0)}% target`,
    "Payroll or direct costs growing faster than revenue"
  );

  check(
    "Recurring Revenue %",
    ue.recurring_revenue_pct !== null ? ue.recurring_revenue_pct * 100 : null,
    config.target_recurring_revenue_pct * 100,
    ue.recurring_revenue_pct !== null && ue.recurring_revenue_pct < config.target_recurring_revenue_pct,
    "warning",
    `Recurring revenue is ${((ue.recurring_revenue_pct ?? 0) * 100).toFixed(0)}% of total — below ${(config.target_recurring_revenue_pct * 100).toFixed(0)}% target`,
    "Revenue quality declining — more reliance on one-time leasing fees"
  );

  return alerts;
}

// ── FORECAST ACCURACY ─────────────────────────────────────────────────────

export function calcForecastAccuracy(forecast: number, actual: number): number | null {
  if (actual === 0) return null;
  return Math.abs(actual - forecast) / Math.abs(actual);
}

// ── HELPERS ───────────────────────────────────────────────────────────────

export function fmtPct(val: number | null, decimals = 1): string {
  if (val === null) return "—";
  return `${(val * 100).toFixed(decimals)}%`;
}

export function fmtCurrency(val: number | null): string {
  if (val === null) return "—";
  return `$${Math.round(val).toLocaleString("en-CA")}`;
}

export function fmtRatio(val: number | null): string {
  if (val === null) return "—";
  return `${val.toFixed(1)}x`;
}

export function fmtMonths(val: number | null): string {
  if (val === null) return "—";
  return `${val.toFixed(1)} mo`;
}

function emptyUnitEconomics(): UnitEconomics {
  return {
    owner_cac: null, property_cac: null, effective_property_cac: null,
    owner_ltv: null, property_ltv: null, ltv_cac_ratio: null,
    cac_payback_months: null, gross_margin_pct: null, contribution_margin: null,
    contribution_margin_pct: null, contribution_per_property: null, contribution_per_owner: null,
    revenue_per_property: null, revenue_per_owner: null, owner_churn_rate: null,
    property_churn_rate: null, owner_retention: null, property_retention: null,
    recurring_revenue_pct: null, properties_per_owner: null, revenue_per_employee: null,
    pum_per_employee: null, mrr: null, arr: null,
    ltv_source: "estimated", cac_source: "estimated", ltv_confidence: "low",
  };
}
