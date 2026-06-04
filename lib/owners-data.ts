/**
 * Data aggregation layer for the owner dashboard.
 * Extends the monthly report data with 12-month history.
 */

import { unstable_cache } from "next/cache";
import {
  fetchAllOwners,
  fetchAllProperties,
  fetchAllTenants,
  fetchRentForYear,
  fetchMaintenanceForProperties,
  fetchExpensesForDateRange,
  type Owner,
  type Property,
  type Tenant,
  type RentEntry,
  type MaintenanceItem,
  type Expense,
} from "@/lib/notion";
import { getSupabaseAdmin } from "@/lib/supabase";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ── Types ──────────────────────────────────────────────────────────────────

export interface MonthlySnapshot {
  month: string;      // "January"
  year: number;       // 2025
  rentDue: number;
  rentCollected: number;
  expenses: number;
  net: number;
  expensesByCategory: Record<string, number>; // e.g. { "Utilities": 112, "Management Fee": 248 }
}

export interface PropertyDashboard {
  property: Property;
  tenants: Tenant[];
  rentCurrentMonth: RentEntry[];
  maintenanceOpen: MaintenanceItem[];
  maintenanceCompletedRecent: MaintenanceItem[];
  expensesCurrentMonth: Expense[];
  // 12-month history for the chart and table
  history: MonthlySnapshot[];
  // Computed totals
  ytdRentCollected: number;
  ytdExpenses: number;
  ytdNet: number;
  openIssuesCount: number;
  nextLeaseExpiry: string | null; // ISO date string of the soonest expiring lease
}

export interface OwnerDashboard {
  owners: Owner[];
  ownerNames: string;
  properties: PropertyDashboard[];
  currentMonth: string;
  currentYear: number;
  // Portfolio totals
  totalRentCollected: number;
  totalExpenses: number;
  totalNet: number;
  totalOpenIssues: number;
  cachedAt?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function effectivePaid(r: RentEntry): number {
  const s = (r.paymentStatus ?? "").toLowerCase().trim();
  return r.amountPaid ?? (
    (s === "paid" || s === "on time" || s === "partial") ? (r.amountDue ?? 0) : 0
  );
}

function buildHistory(
  propertyId: string,
  rentByYear: Map<number, RentEntry[]>,
  expensesByYearMonth: Map<string, Expense[]>,
  currentMonth: string,
  currentYear: number
): MonthlySnapshot[] {
  const snapshots: MonthlySnapshot[] = [];

  // Go back 11 months + current = 12 months total
  for (let i = 11; i >= 0; i--) {
    const d = new Date(currentYear, MONTHS.indexOf(currentMonth) - i, 1);
    const m = MONTHS[d.getMonth()];
    const y = d.getFullYear();

    const rentRows = (rentByYear.get(y) ?? []).filter(
      r => r.propertyId === propertyId && r.month === m
    );
    const expenseRows = expensesByYearMonth.get(`${y}-${m}`) ?? [];
    const propExpenses = expenseRows.filter(e => e.propertyId === propertyId);

    const rentDue = rentRows.reduce((s, r) => s + (r.amountDue ?? 0), 0);
    const rentCollected = rentRows.reduce((s, r) => s + effectivePaid(r), 0);
    const expenses = propExpenses.reduce((s, e) => s + (e.amount ?? 0), 0);

    const expensesByCategory: Record<string, number> = {};
    for (const e of propExpenses) {
      const cat = e.category || "Other";
      expensesByCategory[cat] = (expensesByCategory[cat] ?? 0) + (e.amount ?? 0);
    }

    snapshots.push({ month: m, year: y, rentDue, rentCollected, expenses, net: rentCollected - expenses, expensesByCategory });
  }

  return snapshots;
}

// ── Main fetcher ───────────────────────────────────────────────────────────

export async function buildOwnerDashboard(
  notionOwnerIds: string[],
  ownerNames: string
): Promise<OwnerDashboard> {
  const now = new Date();
  const currentMonth = MONTHS[now.getMonth()];
  const currentYear = now.getFullYear();
  const prevYear = currentYear - 1;

  // Date ranges
  const monthIndex = now.getMonth();
  const currentStart = `${currentYear}-${String(monthIndex + 1).padStart(2, "0")}-01`;
  const currentEnd = new Date(currentYear, monthIndex + 1, 0).toISOString().split("T")[0];
  const ytdStart = `${currentYear}-01-01`;
  // For 12-month history we need up to 11 months back
  const historyStart = new Date(currentYear, monthIndex - 11, 1);
  const historyStartStr = historyStart.toISOString().split("T")[0];

  // Fetch in parallel
  const [allOwners, allProperties, allTenants, rentCurrentYear, rentPrevYear] = await Promise.all([
    fetchAllOwners(),
    fetchAllProperties(),
    fetchAllTenants(),
    fetchRentForYear(currentYear),
    historyStart.getFullYear() < currentYear ? fetchRentForYear(prevYear) : Promise.resolve([] as RentEntry[]),
  ]);

  // Filter to just this owner's properties
  const owners = allOwners.filter(o => notionOwnerIds.includes(o.id));
  const ownerPropertyIds = [...new Set(owners.flatMap(o => o.propertyIds))];
  const properties = allProperties.filter(p => ownerPropertyIds.includes(p.id));

  const [maintenance, expensesCurrent, expensesHistory] = await Promise.all([
    fetchMaintenanceForProperties(ownerPropertyIds),
    fetchExpensesForDateRange(ownerPropertyIds, currentStart, currentEnd),
    fetchExpensesForDateRange(ownerPropertyIds, historyStartStr, currentEnd),
  ]);

  // Build lookup maps for history
  const rentByYear = new Map<number, RentEntry[]>([
    [currentYear, rentCurrentYear],
    [prevYear, rentPrevYear],
  ]);

  // Group expenses by year-month for fast lookup
  const expensesByYearMonth = new Map<string, Expense[]>();
  for (const e of expensesHistory) {
    if (!e.date) continue;
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${MONTHS[d.getMonth()]}`;
    if (!expensesByYearMonth.has(key)) expensesByYearMonth.set(key, []);
    expensesByYearMonth.get(key)!.push(e);
  }

  // Recent cutoff for completed maintenance (60 days)
  const recentCutoff = new Date();
  recentCutoff.setDate(recentCutoff.getDate() - 60);

  const propertyDashboards: PropertyDashboard[] = properties.map(property => {
    const pid = property.id;
    const tenants = allTenants.filter(t => t.propertyId === pid && t.status === "Active");
    const rentCurrentMonth = rentCurrentYear.filter(r => r.propertyId === pid && r.month === currentMonth);
    const maintenanceForProp = maintenance.filter(m => m.propertyId === pid);
    const maintenanceOpen = maintenanceForProp.filter(m => m.status !== "Done");
    const maintenanceCompletedRecent = maintenanceForProp.filter(m =>
      m.status === "Done" && m.dateCompleted && new Date(m.dateCompleted) >= recentCutoff
    );
    const expensesCurrentMonth = expensesCurrent.filter(e => e.propertyId === pid);

    const history = buildHistory(pid, rentByYear, expensesByYearMonth, currentMonth, currentYear);

    const ytdRent = rentCurrentYear.filter(r => r.propertyId === pid);
    const ytdExp = expensesHistory.filter(e => e.propertyId === pid && e.date && e.date >= ytdStart);
    const ytdRentCollected = ytdRent.reduce((s, r) => s + effectivePaid(r), 0);
    const ytdExpenses = ytdExp.reduce((s, e) => s + (e.amount ?? 0), 0);

    // Soonest expiring lease
    const leaseEnds = tenants
      .map(t => t.leaseEnd)
      .filter(Boolean) as string[];
    const nextLeaseExpiry = leaseEnds.sort()[0] ?? null;

    return {
      property,
      tenants,
      rentCurrentMonth,
      maintenanceOpen,
      maintenanceCompletedRecent,
      expensesCurrentMonth,
      history,
      ytdRentCollected,
      ytdExpenses,
      ytdNet: ytdRentCollected - ytdExpenses,
      openIssuesCount: maintenanceOpen.length,
      nextLeaseExpiry,
    };
  });

  const totalRentCollected = propertyDashboards.reduce((s, p) => s + p.ytdRentCollected, 0);
  const totalExpenses = propertyDashboards.reduce((s, p) => s + p.ytdExpenses, 0);
  const totalOpenIssues = propertyDashboards.reduce((s, p) => s + p.openIssuesCount, 0);

  return {
    owners,
    ownerNames,
    properties: propertyDashboards,
    currentMonth,
    currentYear,
    totalRentCollected,
    totalExpenses,
    totalNet: totalRentCollected - totalExpenses,
    totalOpenIssues,
  };
}

// ── Cache helpers ──────────────────────────────────────────────────────────

export async function getCachedDashboard(token: string): Promise<OwnerDashboard | null> {
  try {
    const sb = getSupabaseAdmin();
    const { data } = await sb
      .from("owner_data_cache")
      .select("bundle_json, cached_at")
      .eq("token", token)
      .single();
    if (!data) return null;
    const dashboard = data.bundle_json as OwnerDashboard;
    dashboard.cachedAt = data.cached_at;
    return dashboard;
  } catch {
    return null;
  }
}

export async function cacheDashboard(token: string, dashboard: OwnerDashboard): Promise<void> {
  try {
    const sb = getSupabaseAdmin();
    await sb.from("owner_data_cache").upsert({
      token,
      bundle_json: dashboard,
      cached_at: new Date().toISOString(),
    });
  } catch {
    // Cache failures are non-fatal
  }
}

/**
 * Cached loader using Next.js unstable_cache (Vercel Data Cache).
 * - First load: fetches from Notion, result cached for 24 hours
 * - Subsequent loads: instant, served from Vercel's edge cache
 * - Weekly cron calls revalidateTag("owner-dashboard") to bust the cache
 */
export function getDashboard(
  token: string,
  notionOwnerIds: string[],
  ownerNames: string
): Promise<{ dashboard: OwnerDashboard; isStale: boolean }> {
  const cached = unstable_cache(
    async () => {
      const dashboard = await buildOwnerDashboard(notionOwnerIds, ownerNames);
      return { dashboard, isStale: false };
    },
    [`owner-dashboard-${token}`],
    {
      revalidate: 60 * 60 * 6, // 6 hours — auto-refreshes 4x/day
    }
  );
  return cached();
}
