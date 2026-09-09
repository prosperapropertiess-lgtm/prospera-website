/**
 * PSN-DATA-001 — Business Numbers snapshot
 * Computes the full monthly bundle (P&L + unit economics + counts) and persists
 * one row per month to `ceo_metric_snapshots`. Run daily by /api/cron/ceo-snapshot;
 * the dashboard reads the persisted rows for fast loads + real trend history.
 */
import {
  buildPnL,
  calcUnitEconomics,
  generateAlerts,
  type UEConfig,
  type PnL,
  type MonthlyActual,
  type UnitEconomics,
  type ExecutiveAlert,
} from "@/lib/ceo-engine";
import { buildMonthlyActuals, type OwnerFeeSummary } from "@/lib/ceo-actuals";
import { generateBrief } from "@/lib/ceo-brief";
import { getSupabaseAdmin } from "@/lib/supabase";

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

export interface MonthSnapshot {
  period: string;
  actual: MonthlyActual;
  pnl: PnL;
  pum: number;
  owner_count: number;
}

export interface SnapshotResult {
  months: MonthSnapshot[]; // ascending (oldest → current)
  unit_economics: UnitEconomics;
  alerts: ExecutiveAlert[];
  owners: OwnerFeeSummary[];
  finances_configured: boolean;
  brief: string | null;
  config: UEConfig;
}

export async function computeSnapshot(opts: { withBrief?: boolean } = {}): Promise<SnapshotResult> {
  const db = getSupabaseAdmin();

  const { data: configRows } = await db.from("ceo_ue_config").select("key, value");
  const config: UEConfig = { ...DEFAULT_CONFIG };
  for (const r of configRows ?? []) {
    (config as unknown as Record<string, number>)[r.key] = Number(r.value);
  }

  const { actuals, pum, owner_count, owners, finances_configured } = await buildMonthlyActuals(12);
  const ascending = [...actuals].reverse();

  const months: MonthSnapshot[] = ascending.map((a) => ({
    period: a.period,
    actual: a,
    pnl: buildPnL(a),
    pum: a.pum,
    owner_count: a.owner_count,
  }));

  const ue = calcUnitEconomics(ascending, config);
  const alerts = generateAlerts(ue, config);

  let brief: string | null = null;
  if (opts.withBrief && months.length > 0) {
    try {
      const current = months[months.length - 1];
      brief = await generateBrief({
        pnl: current.pnl,
        trend: months.map((m) => ({
          period: m.period,
          revenue: m.pnl.revenue,
          net_profit: m.pnl.net_profit,
          cash: m.pnl.cash_closing,
        })),
        ue,
        pum,
        owner_count,
        offboardingOwners: owners
          .filter((o) => o.offboarding)
          .map((o) => ({ name: o.name, monthlyFee: o.monthlyFee })),
        financesConfigured: finances_configured,
      });
    } catch {
      brief = null;
    }
  }

  return { months, unit_economics: ue, alerts, owners, finances_configured, brief, config };
}

export async function persistSnapshot(result: SnapshotResult): Promise<number> {
  if (result.months.length === 0) return 0;
  const db = getSupabaseAdmin();
  const today = new Date().toISOString().slice(0, 10);
  const lastIdx = result.months.length - 1;

  const rows = result.months.map((m, i) => {
    const isCurrent = i === lastIdx;
    return {
      period: m.period,
      snapshot_date: today,
      metrics: {
        actual: m.actual,
        pnl: m.pnl,
        pum: m.pum,
        owner_count: m.owner_count,
        ...(isCurrent
          ? {
              unit_economics: result.unit_economics,
              alerts: result.alerts,
              owners: result.owners,
              config: result.config,
              finances_configured: result.finances_configured,
            }
          : {}),
      },
      brief: isCurrent ? result.brief : null,
    };
  });

  const { error } = await db.from("ceo_metric_snapshots").upsert(rows, { onConflict: "period" });
  if (error) throw new Error(error.message);
  return rows.length;
}
