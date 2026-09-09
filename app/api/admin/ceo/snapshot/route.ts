/**
 * PSN-DATA-001 — Business Numbers snapshot
 * GET  /api/admin/ceo/snapshot   — persisted monthly snapshots (fast; for the dashboard)
 * POST /api/admin/ceo/snapshot   — recompute now (the "Refresh" button) + persist
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { computeSnapshot, persistSnapshot, type MonthSnapshot } from "@/lib/ceo-snapshot";

function shape(months: MonthSnapshot[], currentMetrics: Record<string, unknown>, brief: string | null) {
  return {
    months, // ascending
    current: months[months.length - 1] ?? null,
    unit_economics: currentMetrics.unit_economics ?? null,
    alerts: currentMetrics.alerts ?? [],
    owners: currentMetrics.owners ?? [],
    config: currentMetrics.config ?? null,
    finances_configured: currentMetrics.finances_configured ?? false,
    brief,
  };
}

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getSupabaseAdmin();
  const { data: rows } = await db
    .from("ceo_metric_snapshots")
    .select("period, snapshot_date, metrics, brief")
    .order("period", { ascending: true });

  if (rows && rows.length > 0) {
    const months: MonthSnapshot[] = rows.map((r) => {
      const m = r.metrics as Record<string, unknown>;
      return {
        period: r.period,
        actual: m.actual as MonthSnapshot["actual"],
        pnl: m.pnl as MonthSnapshot["pnl"],
        pum: Number(m.pum ?? 0),
        owner_count: Number(m.owner_count ?? 0),
      };
    });
    const last = rows[rows.length - 1];
    return NextResponse.json({
      ...shape(months, last.metrics as Record<string, unknown>, last.brief),
      snapshot_date: last.snapshot_date,
      stale: last.snapshot_date !== new Date().toISOString().slice(0, 10),
    });
  }

  // No snapshot yet — compute live (no brief, don't persist) so the page still renders.
  const result = await computeSnapshot({ withBrief: false });
  return NextResponse.json({
    ...shape(result.months, {
      unit_economics: result.unit_economics,
      alerts: result.alerts,
      owners: result.owners,
      config: result.config,
      finances_configured: result.finances_configured,
    }, null),
    snapshot_date: null,
    stale: true,
  });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await computeSnapshot({ withBrief: true });
  const written = await persistSnapshot(result);

  return NextResponse.json({
    ...shape(result.months, {
      unit_economics: result.unit_economics,
      alerts: result.alerts,
      owners: result.owners,
      config: result.config,
      finances_configured: result.finances_configured,
    }, result.brief),
    snapshot_date: new Date().toISOString().slice(0, 10),
    stale: false,
    months_written: written,
  });
}
