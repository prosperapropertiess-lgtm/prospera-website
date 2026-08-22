/**
 * PSN-DATA-001 — CEO Monthly Actuals
 * GET  /api/admin/ceo/actuals         — last N months of merged actuals (Notion + manual)
 * POST /api/admin/ceo/actuals         — upsert manual actuals for a month
 */
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  fetchAllOwners,
  fetchAllProperties,
  fetchExpensesForDateRange,
  fetchRentForYear,
} from "@/lib/notion";
import type { MonthlyActual } from "@/lib/ceo-engine";

// Pull revenue and expense actuals from Notion for a given month
async function getNotionActualsForMonth(
  year: number,
  month: number, // 0-indexed
  propertyIds: string[]
): Promise<{ revenue: number; recurring: number; expenses: number; expensesByCategory: Record<string, number> }> {
  try {
    // Revenue: rent entries for this month
    const rentEntries = await fetchRentForYear(year);
    const MONTHS = ["January","February","March","April","May","June",
                    "July","August","September","October","November","December"];
    const monthName = MONTHS[month];

    let revenue = 0;
    let recurring = 0;
    for (const entry of rentEntries) {
      if (entry.month === monthName && entry.year === year) {
        // MRR = rent billed (amountDue), not just what's been marked "Paid" in
        // Notion so far — using amountPaid silently drops unpaid/un-updated
        // units to $0 and makes the figure shrink whenever bookkeeping lags.
        const billed = entry.amountDue ?? entry.amountPaid ?? 0;
        revenue += billed;
        recurring += billed;
      }
    }

    // Expenses from Notion expenses DB for this month
    const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const endDay = new Date(year, month + 1, 0).getDate();
    const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${endDay}`;
    const expenses = await fetchExpensesForDateRange(propertyIds, startDate, endDate);

    let expensesTotal = 0;
    const expensesByCategory: Record<string, number> = {};
    for (const e of expenses) {
      const amt = e.amount ?? 0;
      expensesTotal += amt;
      const cat = e.category || "Uncategorized";
      expensesByCategory[cat] = (expensesByCategory[cat] ?? 0) + amt;
    }

    return { revenue, recurring, expenses: expensesTotal, expensesByCategory };
  } catch {
    return { revenue: 0, recurring: 0, expenses: 0, expensesByCategory: {} };
  }
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getSupabaseAdmin();
  const { searchParams } = new URL(req.url);
  const months = parseInt(searchParams.get("months") ?? "12");

  // Get manual actuals from Supabase
  const { data: manualActuals, error } = await db
    .from("ceo_monthly_actuals")
    .select("*")
    .order("period", { ascending: false })
    .limit(months);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get current owner/property counts from Notion
  let pumCurrent = 0;
  let ownerCountCurrent = 0;
  let allPropertyIds: string[] = [];
  try {
    const [owners, properties] = await Promise.all([
      fetchAllOwners(),
      fetchAllProperties(),
    ]);
    ownerCountCurrent = owners.length;
    const managedProperties = properties.filter((p) =>
      ["occupied", "vacant", "active", "managed"].includes((p.status ?? "").toLowerCase())
    );
    pumCurrent = managedProperties.length;
    allPropertyIds = managedProperties.map((p) => p.id);
  } catch { /* non-fatal */ }

  // Merge manual + Notion data into MonthlyActual[]
  const result: MonthlyActual[] = [];

  for (const row of (manualActuals ?? [])) {
    const d = new Date(row.period);
    const year = d.getFullYear();
    const month = d.getMonth();

    const notionData = await getNotionActualsForMonth(year, month, allPropertyIds);

    // Revenue: use override if set, else Notion
    const revenue = row.revenue_override !== null
      ? Number(row.revenue_override)
      : notionData.revenue;
    const revenue_source: MonthlyActual["revenue_source"] =
      row.revenue_override !== null ? "manual_override"
      : notionData.revenue > 0 ? "notion"
      : "missing";

    const expenses_source: MonthlyActual["expenses_source"] =
      notionData.expenses > 0 ? "notion" : "missing";

    result.push({
      period: row.period,
      revenue,
      recurring_revenue: Number(row.recurring_revenue ?? notionData.recurring),
      transactional_revenue: Number(row.transactional_revenue ?? 0),
      expenses_total: notionData.expenses,
      expenses_by_category: notionData.expensesByCategory,
      pum: pumCurrent,         // TODO: per-period PUM once we have historical snapshots
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
      revenue_source,
      expenses_source,
    });
  }

  // Current snapshot (live from Notion)
  const now = new Date();
  const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const hasCurrentPeriod = result.some((r) => r.period.startsWith(currentPeriod.slice(0, 7)));

  if (!hasCurrentPeriod) {
    const notionNow = await getNotionActualsForMonth(now.getFullYear(), now.getMonth(), allPropertyIds);
    result.unshift({
      period: currentPeriod,
      revenue: notionNow.revenue,
      recurring_revenue: notionNow.recurring,
      transactional_revenue: 0,
      expenses_total: notionNow.expenses,
      expenses_by_category: notionNow.expensesByCategory,
      pum: pumCurrent,
      owner_count: ownerCountCurrent,
      properties_added: 0,
      properties_lost: 0,
      owners_added: 0,
      owners_lost: 0,
      payroll: 0,
      marketing_spend: 0,
      acquisition_spend: 0,
      operating_expenses: 0,
      cash_opening: null,
      cash_closing: null,
      new_leads: 0,
      qualified_leads: 0,
      discovery_calls: 0,
      proposals_sent: 0,
      new_owners: 0,
      employee_count: 0,
      notes: null,
      revenue_source: notionNow.revenue > 0 ? "notion" : "missing",
      expenses_source: notionNow.expenses > 0 ? "notion" : "missing",
    });
  }

  return NextResponse.json({ actuals: result, pum: pumCurrent, owner_count: ownerCountCurrent });
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getSupabaseAdmin();
  const body = await req.json();

  // Validate period
  if (!body.period) return NextResponse.json({ error: "period required (YYYY-MM-01)" }, { status: 400 });

  const { data, error } = await db
    .from("ceo_monthly_actuals")
    .upsert(
      { ...body, updated_at: new Date().toISOString() },
      { onConflict: "period" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Audit log
  await db.from("ceo_audit_log").insert({
    event_type: "actuals_entry",
    entity_type: "ceo_monthly_actuals",
    entity_id: data.id,
    field_name: "period",
    new_value: body.period,
    reason: body.notes ?? "Manual actuals entry",
  });

  return NextResponse.json(data);
}
