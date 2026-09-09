/**
 * PSN-DATA-001 — Monthly Actuals builder (single source of truth)
 *
 * Merges three inputs into MonthlyActual[]:
 *   1. Management-fee revenue  — computed from Notion Rent Tracker × per-owner fee
 *   2. Company costs           — Notion "Company Finances" DB (fixed / variable / COGS)
 *   3. Manual overrides & counts — Supabase `ceo_monthly_actuals`
 *
 * IMPORTANT: revenue here is what Prospera earns (the management fee), NOT the
 * rent roll. Expenses here are Prospera's own costs, NOT owner property costs.
 */
import {
  DB,
  fetchAllOwners,
  fetchAllProperties,
  fetchCompanyFinances,
  fetchRentForMonth,
  type Owner,
  type Property,
  type RentEntry,
  type CompanyFinanceRow,
} from "@/lib/notion";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { MonthlyActual } from "@/lib/ceo-engine";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MANAGED_STATUSES = ["occupied", "vacant", "active", "managed"];

/** Rent treated as "collected" for management-fee purposes (no rent → no % fee). */
function rentCollected(r: RentEntry): number {
  if (r.amountPaid != null) return r.amountPaid;
  const s = (r.paymentStatus ?? "").toLowerCase().trim();
  // Rent Tracker statuses: Paid | Unpaid | Partial | Late (+ legacy "On Time")
  return s && s !== "unpaid" ? (r.amountDue ?? 0) : 0;
}

export interface OwnerFeeSummary {
  id: string;
  name: string;
  feeType: "percent" | "flat" | null;
  feeAmount: number | null;
  status: string;
  propertyIds: string[];
  /** true when Status looks like the owner is leaving */
  offboarding: boolean;
}

export interface ActualsResult {
  actuals: MonthlyActual[];            // most-recent month first
  pum: number;
  owner_count: number;
  owners: OwnerFeeSummary[];
  finances_configured: boolean;        // is the Notion Company Finances DB wired up?
}

function isOffboarding(status: string): boolean {
  const s = status.toLowerCase();
  return s.includes("offboard") || s.includes("churn") || s.includes("at risk") || s.includes("leaving") || s.includes("cancel");
}

export async function buildMonthlyActuals(months = 12): Promise<ActualsResult> {
  const db = getSupabaseAdmin();

  // ── 1. Manual rows (Supabase) ────────────────────────────────────────────
  const { data: manualRows } = await db
    .from("ceo_monthly_actuals")
    .select("*")
    .order("period", { ascending: false })
    .limit(months + 2);
  const manualByMonth = new Map<string, Record<string, unknown>>();
  for (const r of manualRows ?? []) {
    manualByMonth.set(String(r.period).slice(0, 7), r);
  }

  // ── 2. Notion current snapshot: owners + properties ──────────────────────
  let owners: Owner[] = [];
  let properties: Property[] = [];
  try {
    [owners, properties] = await Promise.all([fetchAllOwners(), fetchAllProperties()]);
  } catch { /* non-fatal — dashboard still renders manual data */ }

  const managed = properties.filter((p) =>
    MANAGED_STATUSES.includes((p.status ?? "").toLowerCase())
  );
  const managedIds = new Set(managed.map((p) => p.id));
  const pum = managed.length;
  const owner_count = owners.length;

  // ── 3. Periods: current month + previous (months − 1) ────────────────────
  const now = new Date();
  const periods = Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m0 = d.getMonth();
    const mm = String(m0 + 1).padStart(2, "0");
    return { year: y, month0: m0, key: `${y}-${mm}`, iso: `${y}-${mm}-01` };
  });

  // ── 4. Notion: rent per period + company finances for the whole range ────
  const rangeStart = periods[periods.length - 1].iso;
  const last = periods[0];
  const rangeEnd = new Date(last.year, last.month0 + 1, 0).toISOString().slice(0, 10);

  let finance: CompanyFinanceRow[] = [];
  let financesConfigured = false;
  if (DB.companyFinances) {
    try {
      finance = await fetchCompanyFinances(rangeStart, rangeEnd);
      financesConfigured = true;
    } catch {
      // "Prospera — Company Finances" DB not yet shared with the integration
      financesConfigured = false;
    }
  }

  const rentByMonth = new Map<string, RentEntry[]>();
  await Promise.all(
    periods.map(async (p) => {
      try {
        rentByMonth.set(p.key, await fetchRentForMonth(MONTHS[p.month0], p.year));
      } catch {
        rentByMonth.set(p.key, []);
      }
    })
  );

  // ── 5. Assemble MonthlyActual per period ─────────────────────────────────
  const actuals: MonthlyActual[] = periods.map((p) => {
    const manual = manualByMonth.get(p.key) ?? {};
    const mNum = (k: string): number | null => {
      const v = manual[k];
      return v === null || v === undefined || v === "" ? null : Number(v);
    };

    // -- management-fee revenue --
    const rent = rentByMonth.get(p.key) ?? [];
    const collectedByProperty = new Map<string, number>();
    for (const r of rent) {
      collectedByProperty.set(
        r.propertyId,
        (collectedByProperty.get(r.propertyId) ?? 0) + rentCollected(r)
      );
    }
    // Bill each property once even when co-owners (e.g. Randy & Tina) both carry
    // a fee — the first owner processed with a fee "claims" the property.
    let recurring = 0;
    const billedProps = new Set<string>();
    for (const o of owners) {
      if (o.feeAmount == null || o.feeType == null) continue;
      const claim = o.propertyIds.filter((pid) => !billedProps.has(pid));
      if (claim.length === 0) continue;
      claim.forEach((pid) => billedProps.add(pid));
      if (o.feeType === "percent") {
        recurring += claim.reduce((s, pid) => s + (collectedByProperty.get(pid) ?? 0), 0) * o.feeAmount;
      } else if (claim.some((pid) => managedIds.has(pid))) {
        recurring += o.feeAmount; // flat fee while the household has a managed property
      }
    }

    // -- company costs for this month --
    const rows = finance.filter((f) => f.month === p.iso);
    let cogs = 0;
    let opexFixed = 0;
    let opexVariable = 0;
    let otherRevenue = 0;
    let acquisition = 0;
    let payrollFromNotion = 0;
    let cashClosing: number | null = null;
    let headcount: number | null = null;
    const byCat: Record<string, number> = {};

    for (const f of rows) {
      const kind = f.kind.toLowerCase();
      if (kind.startsWith("other rev") || kind.startsWith("revenue")) {
        otherRevenue += f.amount;
        continue;
      }
      if (kind.startsWith("bank") || kind.startsWith("cash")) {
        cashClosing = f.amount;
        continue;
      }
      if (kind.startsWith("head")) {
        headcount = f.amount;
        continue;
      }
      // expense
      byCat[f.category] = (byCat[f.category] ?? 0) + f.amount;
      if (f.isAcquisition) acquisition += f.amount;
      if (/payroll|salary|wage/i.test(f.category)) payrollFromNotion += f.amount;
      if (f.isCogs) cogs += f.amount;
      else if (f.costType.toLowerCase().startsWith("var")) opexVariable += f.amount;
      else opexFixed += f.amount;
    }

    const transactional = mNum("transactional_revenue") ?? otherRevenue;
    const revenueBase = recurring + transactional;
    const override = mNum("revenue_override");
    const revenue = override ?? revenueBase;
    const revenue_source: MonthlyActual["revenue_source"] =
      override != null ? "manual_override" : revenueBase > 0 ? "notion" : "missing";

    const expensesTotal = cogs + opexFixed + opexVariable;
    const payroll = mNum("payroll") ?? payrollFromNotion;
    // operating_expenses = every company cost that is NOT payroll, so that
    // (revenue − payroll − operating_expenses) reconciles to operating profit.
    const operating_expenses = mNum("operating_expenses") ?? Math.max(0, expensesTotal - payroll);

    return {
      period: p.iso,
      revenue,
      recurring_revenue: mNum("recurring_revenue") ?? recurring,
      transactional_revenue: transactional,
      expenses_total: expensesTotal,
      expenses_by_category: byCat,
      cogs,
      opex_fixed: opexFixed,
      opex_variable: opexVariable,
      pum,
      owner_count,
      properties_added: mNum("properties_added") ?? 0,
      properties_lost: mNum("properties_lost") ?? 0,
      owners_added: mNum("owners_added") ?? 0,
      owners_lost: mNum("owners_lost") ?? 0,
      payroll,
      marketing_spend: mNum("marketing_spend") ?? 0,
      acquisition_spend: mNum("acquisition_spend") ?? acquisition,
      operating_expenses,
      cash_opening: mNum("cash_opening"),
      cash_closing: mNum("cash_closing") ?? cashClosing,
      new_leads: mNum("new_leads") ?? 0,
      qualified_leads: mNum("qualified_leads") ?? 0,
      discovery_calls: mNum("discovery_calls") ?? 0,
      proposals_sent: mNum("proposals_sent") ?? 0,
      new_owners: mNum("new_owners") ?? 0,
      employee_count: headcount ?? mNum("employee_count") ?? 0,
      notes: (manual.notes as string | null) ?? null,
      revenue_source,
      expenses_source: rows.length > 0 ? "notion" : "missing",
    };
  });

  return {
    actuals,
    pum,
    owner_count,
    finances_configured: financesConfigured,
    owners: owners.map((o) => ({
      id: o.id,
      name: o.name,
      feeType: o.feeType ?? null,
      feeAmount: o.feeAmount ?? null,
      status: o.status ?? "",
      propertyIds: o.propertyIds,
      offboarding: isOffboarding(o.status ?? ""),
    })),
  };
}
