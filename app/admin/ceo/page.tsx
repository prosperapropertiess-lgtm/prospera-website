"use client";
import { useState, useEffect, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar, ComposedChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { UnitEconomics, ForecastMonth, ExecutiveAlert, PnL, MonthlyActual } from "@/lib/ceo-engine";
import { fmtCurrency, fmtPct, fmtRatio, fmtMonths } from "@/lib/ceo-engine";

// ── Snapshot payload (from /api/admin/ceo/snapshot) ────────────────────────
interface MonthSnap {
  period: string;
  actual: MonthlyActual;
  pnl: PnL;
  pum: number;
  owner_count: number;
}
interface OwnerFee {
  id: string; name: string; feeType: "percent" | "flat" | null;
  feeAmount: number | null; status: string; offboarding: boolean; propertyIds: string[];
}
interface SnapshotData {
  months: MonthSnap[];
  current: MonthSnap | null;
  unit_economics: UnitEconomics | null;
  alerts: ExecutiveAlert[];
  owners: OwnerFee[];
  config: Record<string, number> | null;
  finances_configured: boolean;
  brief: string | null;
  snapshot_date: string | null;
  stale: boolean;
}

// ── Theme (light admin) ────────────────────────────────────────────────────
const BG = "#F7F5F2";
const SURFACE = "#FFFFFF";
const BORDER = "#E5E1DC";
const TEXT = "#1F2F3A";
const TEXT_SEC = "#555555";
const TEXT_MUT = "#999999";
const ACCENT = "#8B2030";
const GREEN = "#2D7A4F";
const AMBER = "#B45309";
const BLUE = "#1D4ED8";

// ── Types ──────────────────────────────────────────────────────────────────
interface ActualsData {
  actuals: import("@/lib/ceo-engine").MonthlyActual[];
  pum: number;
  owner_count: number;
}

interface ForecastData {
  scenarios: { id: string; name: string; type: string }[];
  forecasts: Record<string, ForecastMonth[]>;
  pum: number;
  owner_count: number;
}

interface UEData {
  unit_economics: UnitEconomics;
  alerts: ExecutiveAlert[];
  config: Record<string, number>;
  pum: number;
  owner_count: number;
  actuals_months: number;
  data_note: string | null;
}

type Tab = "overview" | "expenses" | "unit-economics" | "financials" | "forecast" | "scenarios" | "assumptions" | "data-entry";

// ── Helpers ────────────────────────────────────────────────────────────────
function fmtMonth(period: string): string {
  const d = new Date(period + "T12:00:00");
  return d.toLocaleDateString("en-CA", { month: "short", year: "2-digit" });
}

function Pill({ val, good, label }: { val: string; good: boolean | null; label?: string }) {
  const color = good === null ? TEXT_MUT : good ? GREEN : ACCENT;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color, backgroundColor: good === null ? "#F0EDE8" : good ? "#D1FAE5" : "#FEE2E2", padding: "2px 8px", borderRadius: 99 }}>
      {label ?? val}
    </span>
  );
}

function StatCard({
  label, value, sub, color, pill, badge,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  pill?: { val: string; good: boolean | null };
  badge?: string;
}) {
  return (
    <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "22px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: TEXT_MUT, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>{label}</p>
        {badge && <span style={{ fontSize: 10, backgroundColor: "#FEF3C7", color: "#92400E", padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>{badge}</span>}
      </div>
      <p style={{ fontSize: 32, fontWeight: 700, color: color ?? TEXT, margin: "0 0 6px", fontVariantNumeric: "tabular-nums" }}>{value}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {sub && <p style={{ fontSize: 13, color: TEXT_MUT, margin: 0 }}>{sub}</p>}
        {pill && <Pill val={pill.val} good={pill.good} />}
      </div>
    </div>
  );
}

function SectionLabel({ text }: { text: string }) {
  return <p style={{ fontSize: 11, fontWeight: 600, color: TEXT_MUT, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>{text}</p>;
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function CEODashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [snapshot, setSnapshot] = useState<SnapshotData | null>(null);
  const [actuals, setActuals] = useState<ActualsData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [ue, setUE] = useState<UEData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [s, a, f, u] = await Promise.all([
      fetch("/api/admin/ceo/snapshot").then((r) => r.json()).catch(() => null),
      fetch("/api/admin/ceo/actuals?months=12").then((r) => r.json()).catch(() => null),
      fetch("/api/admin/ceo/forecast").then((r) => r.json()).catch(() => null),
      fetch("/api/admin/ceo/unit-economics").then((r) => r.json()).catch(() => null),
    ]);
    setSnapshot(s);
    setActuals(a);
    setForecast(f);
    setUE(u);
    setLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    const s = await fetch("/api/admin/ceo/snapshot", { method: "POST" }).then((r) => r.json()).catch(() => null);
    if (s) setSnapshot(s);
    // pull the other tabs' data back in sync too
    const [a, u] = await Promise.all([
      fetch("/api/admin/ceo/actuals?months=12").then((r) => r.json()).catch(() => null),
      fetch("/api/admin/ceo/unit-economics").then((r) => r.json()).catch(() => null),
    ]);
    if (a) setActuals(a);
    if (u) setUE(u);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "expenses", label: "Expenses" },
    { id: "unit-economics", label: "Unit Economics" },
    { id: "financials", label: "Financials" },
    { id: "forecast", label: "Forecast" },
    { id: "scenarios", label: "Scenarios" },
    { id: "assumptions", label: "Assumptions" },
    { id: "data-entry", label: "Data Entry" },
  ];

  return (
    <div style={{ backgroundColor: BG, minHeight: "100vh", fontFamily: "var(--font-dm-sans, sans-serif)" }}>

      {/* Header */}
      <div style={{ backgroundColor: SURFACE, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 32px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: TEXT, margin: 0 }}>Business Numbers</h1>
            {ue?.data_note && (
              <span style={{ fontSize: 12, backgroundColor: "#FEF3C7", color: "#92400E", padding: "3px 12px", borderRadius: 20, fontWeight: 600 }}>
                {ue.data_note}
              </span>
            )}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
              {snapshot?.snapshot_date && (
                <span style={{ fontSize: 12, color: snapshot.stale ? AMBER : TEXT_MUT }}>
                  {snapshot.stale ? "Last updated " : "Updated "}
                  {new Date(snapshot.snapshot_date + "T12:00:00").toLocaleDateString("en-CA", { month: "short", day: "numeric" })}
                </span>
              )}
              <button onClick={refresh} disabled={refreshing} style={{
                fontSize: 13, fontWeight: 600, padding: "8px 16px", borderRadius: 20,
                border: `1px solid ${BORDER}`, backgroundColor: SURFACE, color: TEXT_SEC,
                cursor: refreshing ? "default" : "pointer", opacity: refreshing ? 0.6 : 1,
              }}>{refreshing ? "Refreshing…" : "Refresh numbers"}</button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingBottom: 16 }}>
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: "10px 18px", fontSize: 14, borderRadius: 20,
                fontWeight: tab === t.id ? 600 : 500,
                color: tab === t.id ? "#FAF8F5" : TEXT_SEC,
                backgroundColor: tab === t.id ? TEXT : "transparent",
                border: tab === t.id ? "none" : `1px solid ${BORDER}`,
                cursor: "pointer",
              }}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 32px 60px" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, height: 110, opacity: 0.5 }} />
            ))}
          </div>
        ) : (
          <>
            {tab === "overview" && <OverviewTab snapshot={snapshot} />}
            {tab === "expenses" && <ExpensesTab snapshot={snapshot} />}
            {tab === "unit-economics" && <UnitEconomicsTab ue={ue} />}
            {tab === "financials" && <FinancialsTab actuals={actuals} />}
            {tab === "forecast" && <ForecastTab forecast={forecast} />}
            {tab === "scenarios" && <ScenariosTab forecast={forecast} />}
            {tab === "assumptions" && <AssumptionsTab onSaved={load} />}
            {tab === "data-entry" && <DataEntryTab onSaved={load} />}
          </>
        )}
      </div>
    </div>
  );
}

// ── Overview Tab ───────────────────────────────────────────────────────────
function deltaPill(
  cur: number,
  prev: number | undefined | null,
  opts: { moreIsGood?: boolean; money?: boolean } = {}
): { val: string; good: boolean | null } | undefined {
  if (prev === undefined || prev === null || !isFinite(prev)) return undefined;
  const diff = cur - prev;
  if (Math.abs(diff) < 1) return undefined;
  const moreIsGood = opts.moreIsGood ?? true;
  const good = moreIsGood ? diff > 0 : diff < 0;
  const mag = opts.money ? fmtCurrency(Math.abs(diff)) : Math.abs(diff).toFixed(1);
  return { val: `${diff > 0 ? "+" : "−"}${mag} vs last mo`, good };
}

function OverviewTab({ snapshot }: { snapshot: SnapshotData | null }) {
  if (!snapshot || !snapshot.current) {
    return <p style={{ color: TEXT_MUT, fontSize: 14 }}>No numbers yet — hit &ldquo;Refresh numbers&rdquo; above.</p>;
  }
  const { months, current, unit_economics: u, alerts, owners, finances_configured, brief } = snapshot;
  const pnl = current.pnl;
  const prev = months.length >= 2 ? months[months.length - 2].pnl : undefined;
  const offboarding = owners.filter((o) => o.offboarding);

  const trend = months.map((m) => ({
    period: m.period,
    revenue: m.pnl.revenue,
    net_profit: m.pnl.net_profit,
    cash: m.pnl.cash_closing ?? 0,
  }));

  const waterfall = [
    { label: "Revenue (management fees)", val: pnl.revenue, kind: "in" as const },
    { label: "− Cost of delivering the service", val: -pnl.cogs, kind: "out" as const },
    { label: "= Gross profit", val: pnl.gross_profit, kind: "sub" as const },
    { label: "− Fixed costs", val: -pnl.opex_fixed, kind: "out" as const },
    { label: "− Variable costs", val: -pnl.opex_variable, kind: "out" as const },
    { label: "= Net profit", val: pnl.net_profit, kind: "total" as const },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

      {/* CFO's Take */}
      <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "20px 22px" }}>
        <SectionLabel text="CFO's Take" />
        {brief ? (
          <div style={{ fontSize: 14, lineHeight: 1.65, color: TEXT }}>
            {brief.split("\n").filter(Boolean).map((line, i) =>
              line.startsWith("- ")
                ? <p key={i} style={{ margin: "2px 0 2px 4px", color: TEXT_SEC }}>•&nbsp;{line.slice(2)}</p>
                : line.endsWith(":") && line.length < 16
                ? <p key={i} style={{ margin: "10px 0 2px", fontWeight: 700 }}>{line}</p>
                : <p key={i} style={{ margin: "0 0 8px" }}>{line}</p>
            )}
          </div>
        ) : (
          <p style={{ fontSize: 14, color: TEXT_MUT, margin: 0 }}>
            Not written yet. Hit &ldquo;Refresh numbers&rdquo; — it&rsquo;s most useful once the expense sheet is filled in.
          </p>
        )}
      </div>

      {(() => {
        const noCosts = pnl.cogs + pnl.opex_fixed + pnl.opex_variable === 0 && pnl.cash_closing === null;
        if (finances_configured && !noCosts) return null;
        return (
          <div style={{ backgroundColor: "#FEF3C7", border: `1px solid ${AMBER}`, borderRadius: 10, padding: "12px 16px" }}>
            <p style={{ fontSize: 13, color: "#92400E", margin: 0, fontWeight: 600 }}>
              {finances_configured ? "No costs entered yet." : "Company expense sheet not connected."}
            </p>
            <p style={{ fontSize: 12, color: "#92400E", margin: "3px 0 0", lineHeight: 1.55 }}>
              Revenue is live from Notion. Costs, cash and net profit stay at zero until you add rows to the
              &ldquo;Prospera — Company Finances&rdquo; database in Notion. See the Expenses tab for how.
            </p>
          </div>
        );
      })()}

      {/* This month */}
      <div>
        <SectionLabel text={`This Month — ${fmtMonth(pnl.period)}`} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          <StatCard label="Revenue" value={fmtCurrency(pnl.revenue)}
            sub={`${fmtCurrency(pnl.recurring_revenue)} fees${pnl.transactional_revenue ? ` + ${fmtCurrency(pnl.transactional_revenue)} one-off` : ""}`}
            pill={deltaPill(pnl.revenue, prev?.revenue, { money: true })} />
          <StatCard label="Gross Profit" value={fmtCurrency(pnl.gross_profit)}
            sub={`${fmtPct(pnl.gross_margin_pct)} margin`}
            color={pnl.gross_profit >= 0 ? TEXT : ACCENT} />
          <StatCard label="Net Profit" value={fmtCurrency(pnl.net_profit)}
            sub={`${fmtPct(pnl.operating_margin_pct)} margin`}
            color={pnl.net_profit >= 0 ? GREEN : ACCENT}
            pill={deltaPill(pnl.net_profit, prev?.net_profit, { money: true })} />
          <StatCard label="Cash in Bank" value={fmtCurrency(pnl.cash_closing)}
            sub={pnl.runway_months === null
              ? (pnl.net_profit >= 0 ? "Profitable — no burn" : "Enter bank balance in Notion")
              : `${pnl.runway_months.toFixed(1)} mo runway at this burn`}
            color={pnl.runway_months !== null && pnl.runway_months < 6 ? ACCENT : TEXT} />
        </div>
      </div>

      {/* Waterfall */}
      <div>
        <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
          {waterfall.map((r, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", padding: "12px 18px",
              borderBottom: i < waterfall.length - 1 ? `1px solid ${BORDER}` : "none",
              backgroundColor: r.kind === "total" ? BG : SURFACE,
            }}>
              <span style={{ fontSize: 14, fontWeight: r.kind === "sub" || r.kind === "total" ? 700 : 400,
                color: r.kind === "sub" || r.kind === "total" ? TEXT : TEXT_SEC }}>{r.label}</span>
              <span style={{ fontSize: 14, fontWeight: r.kind === "sub" || r.kind === "total" ? 700 : 500, fontVariantNumeric: "tabular-nums",
                color: r.kind === "total" ? (r.val >= 0 ? GREEN : ACCENT) : r.kind === "out" ? TEXT_MUT : TEXT }}>
                {r.val < 0 ? `(${fmtCurrency(Math.abs(r.val))})` : fmtCurrency(r.val)}
              </span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: TEXT_MUT, margin: "8px 0 0" }}>{pnl.net_profit_note}</p>
      </div>

      {/* Trend */}
      {trend.length > 1 && (
        <div>
          <SectionLabel text="Last 12 Months" />
          <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
                <XAxis dataKey="period" tickFormatter={fmtMonth} style={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} style={{ fontSize: 11 }} />
                <Tooltip formatter={((v: number) => `$${Math.round(v).toLocaleString()}`) as any} labelFormatter={fmtMonth as any} />
                <Legend />
                <Bar dataKey="cash" fill={BLUE} name="Cash" opacity={0.18} />
                <Area type="monotone" dataKey="revenue" fill="#F0EDE8" stroke={TEXT} name="Revenue" strokeWidth={2} />
                <Line type="monotone" dataKey="net_profit" stroke={GREEN} name="Net Profit" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Growth & unit economics */}
      <div>
        <SectionLabel text="Growth & Unit Economics" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <StatCard label="Doors Managed" value={String(current.pum)} sub="Occupied + vacant" />
          <StatCard label="Clients" value={String(current.owner_count)}
            sub={offboarding.length ? `${offboarding.length} flagged leaving` : "Active owners"}
            color={offboarding.length ? AMBER : TEXT} />
          <StatCard label="Revenue / Door" value={fmtCurrency(u?.revenue_per_property ?? null)} sub="Monthly" />
          <StatCard label="Revenue / Client" value={fmtCurrency(u?.revenue_per_owner ?? null)} sub="Monthly" />
          <StatCard label="LTV : CAC" value={fmtRatio(u?.ltv_cac_ratio ?? null)} badge="Estimated" sub="Needs 6+ mo history" />
        </div>
      </div>

      {/* Watch list */}
      {alerts.length > 0 && (
        <div>
          <SectionLabel text="Watch List" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {alerts.map((a) => (
              <div key={a.metric} style={{
                backgroundColor: SURFACE, border: `1px solid ${a.severity === "critical" ? ACCENT : AMBER}`,
                borderLeft: `4px solid ${a.severity === "critical" ? ACCENT : AMBER}`,
                borderRadius: 8, padding: "12px 16px",
              }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: TEXT, margin: 0 }}>{a.message}</p>
                <p style={{ fontSize: 12, color: TEXT_MUT, margin: "4px 0 0" }}>{a.driver}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Expenses Tab ───────────────────────────────────────────────────────────
function ExpensesTab({ snapshot }: { snapshot: SnapshotData | null }) {
  if (!snapshot?.current) return <p style={{ color: TEXT_MUT, fontSize: 14 }}>No numbers yet — hit &ldquo;Refresh numbers&rdquo;.</p>;
  const { current, finances_configured, months } = snapshot;
  const a = current.actual;
  const byCat = Object.entries(a.expenses_by_category ?? {}).sort((x, y) => y[1] - x[1]);
  const total = a.cogs + a.opex_fixed + a.opex_variable;
  const trailing = months.slice(-3);
  const avgTotal = trailing.length
    ? trailing.reduce((s, m) => s + m.actual.cogs + m.actual.opex_fixed + m.actual.opex_variable, 0) / trailing.length
    : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {!finances_configured && (
        <div style={{ backgroundColor: "#FEF3C7", border: `1px solid ${AMBER}`, borderRadius: 10, padding: "14px 16px" }}>
          <p style={{ fontSize: 13, color: "#92400E", margin: 0, fontWeight: 600 }}>Connect the Notion expense sheet</p>
          <p style={{ fontSize: 12.5, color: "#92400E", margin: "5px 0 0", lineHeight: 1.6 }}>
            Add rows to the <strong>Prospera — Company Finances</strong> database in Notion — one per cost, each tagged
            <strong> Fixed</strong> or <strong>Variable</strong>, and <strong>COGS</strong> if it&rsquo;s a direct cost of
            managing properties. Put the month&rsquo;s bank balance in as a <strong>Bank Balance</strong> row. Then hit
            &ldquo;Refresh numbers&rdquo;.
          </p>
        </div>
      )}

      <div>
        <SectionLabel text={`This Month — ${fmtMonth(current.period)}`} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <StatCard label="Total Costs" value={fmtCurrency(total)} sub={`3-mo avg ${fmtCurrency(avgTotal)}`} />
          <StatCard label="Fixed" value={fmtCurrency(a.opex_fixed)} sub="Doesn't scale with doors" />
          <StatCard label="Variable" value={fmtCurrency(a.opex_variable)} sub="Scales with activity" />
          <StatCard label="Cost of Delivery" value={fmtCurrency(a.cogs)} sub="Direct service cost (COGS)" />
        </div>
      </div>

      <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ backgroundColor: BG }}>
              <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: TEXT_MUT, textTransform: "uppercase" }}>Category</th>
              <th style={{ padding: "10px 16px", textAlign: "right", fontSize: 11, fontWeight: 600, color: TEXT_MUT, textTransform: "uppercase" }}>This Month</th>
            </tr>
          </thead>
          <tbody>
            {byCat.length === 0 ? (
              <tr><td colSpan={2} style={{ padding: "20px 16px", textAlign: "center", color: TEXT_MUT }}>No expense rows for this month.</td></tr>
            ) : byCat.map(([cat, amt], i) => (
              <tr key={cat} style={{ borderTop: `1px solid ${BORDER}`, backgroundColor: i % 2 ? BG : SURFACE }}>
                <td style={{ padding: "10px 16px", color: TEXT }}>{cat}</td>
                <td style={{ padding: "10px 16px", textAlign: "right", color: TEXT_SEC, fontVariantNumeric: "tabular-nums" }}>{fmtCurrency(amt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Unit Economics Tab ─────────────────────────────────────────────────────
function UnitEconomicsTab({ ue }: { ue: UEData | null }) {
  const u = ue?.unit_economics;
  const cfg = ue?.config ?? {};

  if (!u) return <p style={{ color: TEXT_MUT, fontSize: 14 }}>No data. Enter monthly actuals in the Data Entry tab first.</p>;

  const rows: { label: string; id: string; value: string; target?: string; good?: boolean | null; badge?: string; formula: string }[] = [
    // Acquisition
    { label: "Owner CAC", id: "MET-UNIT-001", value: fmtCurrency(u.owner_cac), formula: "Acquisition Spend / New Owners", badge: u.cac_source === "estimated" ? "Estimated" : undefined, good: null },
    { label: "Property CAC", id: "MET-UNIT-002", value: fmtCurrency(u.property_cac), formula: "Acquisition Spend / Properties Acquired", good: null },
    // Value
    { label: "Owner LTV", id: "MET-UNIT-003", value: fmtCurrency(u.owner_ltv), formula: "Monthly Contribution Margin Per Owner × Expected Lifetime", badge: u.ltv_source === "estimated" ? `Estimated (${u.ltv_confidence} confidence)` : undefined, good: null },
    { label: "Property LTV", id: "MET-UNIT-004", value: fmtCurrency(u.property_ltv), formula: "Monthly CM Per Property × Expected Property Lifetime", good: null },
    { label: "LTV:CAC Ratio", id: "MET-UNIT-005", value: fmtRatio(u.ltv_cac_ratio), target: `Target ${cfg.target_ltv_cac_ratio ?? 3}x`, formula: "Owner LTV / Owner CAC", good: u.ltv_cac_ratio !== null ? u.ltv_cac_ratio >= (cfg.target_ltv_cac_ratio ?? 3) : null },
    { label: "CAC Payback", id: "MET-UNIT-006", value: fmtMonths(u.cac_payback_months), target: `Target ≤${cfg.target_cac_payback_months ?? 12}mo`, formula: "Owner CAC / Monthly CM Per Owner", good: u.cac_payback_months !== null ? u.cac_payback_months <= (cfg.target_cac_payback_months ?? 12) : null },
    // Margin
    { label: "Gross Margin", id: "MET-UNIT-007", value: fmtPct(u.gross_margin_pct), formula: "Gross Profit / Revenue", good: null },
    { label: "Contribution Margin", id: "MET-UNIT-008", value: fmtPct(u.contribution_margin_pct), target: `Target ${((cfg.target_contribution_margin_pct ?? 0.65) * 100).toFixed(0)}%`, formula: "(Revenue - Payroll - Direct OpEx) / Revenue", good: u.contribution_margin_pct !== null ? u.contribution_margin_pct >= (cfg.target_contribution_margin_pct ?? 0.65) : null },
    { label: "CM Per Property", id: "MET-UNIT-009", value: fmtCurrency(u.contribution_per_property), formula: "Contribution Margin / PUM", good: null },
    { label: "CM Per Owner", id: "MET-UNIT-010", value: fmtCurrency(u.contribution_per_owner), formula: "Contribution Margin / Active Owners", good: null },
    { label: "Revenue Per Property", id: "MET-UNIT-011", value: fmtCurrency(u.revenue_per_property), formula: "Revenue / PUM", good: null },
    { label: "Revenue Per Owner", id: "MET-UNIT-012", value: fmtCurrency(u.revenue_per_owner), formula: "Revenue / Active Owners", good: null },
    // Retention
    { label: "Owner Churn (Monthly)", id: "MET-UNIT-013", value: fmtPct(u.owner_churn_rate), target: `Target ≤${((cfg.target_owner_churn_monthly ?? 0.02) * 100).toFixed(0)}%/mo`, formula: "Owners Lost / Owners at Start of Period", good: u.owner_churn_rate !== null ? u.owner_churn_rate <= (cfg.target_owner_churn_monthly ?? 0.02) : null },
    { label: "Property Churn (Monthly)", id: "MET-UNIT-014", value: fmtPct(u.property_churn_rate), formula: "Properties Lost / PUM at Start", good: null },
    { label: "Owner Retention", value: fmtPct(u.owner_retention), id: "derived", formula: "1 - Owner Churn Rate", good: null },
    { label: "Recurring Revenue %", id: "MET-UNIT-017", value: fmtPct(u.recurring_revenue_pct), target: `Target ≥${((cfg.target_recurring_revenue_pct ?? 0.8) * 100).toFixed(0)}%`, formula: "Recurring Revenue / Total Revenue", good: u.recurring_revenue_pct !== null ? u.recurring_revenue_pct >= (cfg.target_recurring_revenue_pct ?? 0.8) : null },
    // Scale
    { label: "Properties Per Owner", id: "MET-UNIT-018", value: u.properties_per_owner !== null ? u.properties_per_owner.toFixed(1) : "—", formula: "PUM / Active Owners", good: null },
    { label: "Revenue Per Employee", id: "MET-UNIT-019", value: fmtCurrency(u.revenue_per_employee), formula: "Revenue / Headcount", good: null },
    { label: "PUM Per Employee", id: "MET-UNIT-021", value: u.pum_per_employee !== null ? u.pum_per_employee.toFixed(1) : "—", formula: "PUM / Headcount", good: null },
  ];

  const SECTIONS = [
    { title: "Acquisition", ids: ["MET-UNIT-001", "MET-UNIT-002"] },
    { title: "Value", ids: ["MET-UNIT-003", "MET-UNIT-004", "MET-UNIT-005", "MET-UNIT-006"] },
    { title: "Margin", ids: ["MET-UNIT-007", "MET-UNIT-008", "MET-UNIT-009", "MET-UNIT-010", "MET-UNIT-011", "MET-UNIT-012"] },
    { title: "Retention", ids: ["MET-UNIT-013", "MET-UNIT-014", "derived", "MET-UNIT-017"] },
    { title: "Scale", ids: ["MET-UNIT-018", "MET-UNIT-019", "MET-UNIT-021"] },
  ];

  return (
    <div>
      {ue?.data_note && (
        <div style={{ backgroundColor: "#FEF3C7", border: `1px solid ${AMBER}`, borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: "#92400E", margin: 0 }}>⚠ {ue.data_note}</p>
        </div>
      )}
      {SECTIONS.map((section) => {
        const sectionRows = rows.filter((r) => section.ids.includes(r.id));
        return (
          <div key={section.title} style={{ marginBottom: 24 }}>
            <SectionLabel text={section.title} />
            <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
              {sectionRows.map((row, i) => (
                <div key={row.id + row.label} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 16px",
                  borderBottom: i < sectionRows.length - 1 ? `1px solid ${BORDER}` : "none",
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{row.label}</span>
                      {row.id !== "derived" && <span style={{ fontSize: 10, color: TEXT_MUT }}>{row.id}</span>}
                      {row.badge && <span style={{ fontSize: 10, backgroundColor: "#FEF3C7", color: "#92400E", padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>{row.badge}</span>}
                    </div>
                    <p style={{ fontSize: 11, color: TEXT_MUT, margin: "2px 0 0" }}>{row.formula}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 18, fontWeight: 700, color: TEXT, margin: 0, fontVariantNumeric: "tabular-nums" }}>{row.value}</p>
                    {row.target && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", marginTop: 2 }}>
                        <span style={{ fontSize: 11, color: TEXT_MUT }}>{row.target}</span>
                        {row.good != null && (
                          <Pill val={row.good ? "On track" : "Below target"} good={row.good ?? null} />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Financials Tab ─────────────────────────────────────────────────────────
function FinancialsTab({ actuals }: { actuals: ActualsData | null }) {
  const data = [...(actuals?.actuals ?? [])].reverse();

  if (data.length === 0) {
    return (
      <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 40, textAlign: "center" }}>
        <p style={{ color: TEXT_MUT, fontSize: 14 }}>No financial actuals yet. Go to Data Entry to log monthly numbers.</p>
      </div>
    );
  }

  const chartData = data.map((a) => {
    const opex = a.opex_fixed + a.opex_variable;
    return {
      period: a.period,
      revenue: a.revenue,
      cogs: a.cogs,
      fixed: a.opex_fixed,
      variable: a.opex_variable,
      net: a.revenue - a.cogs - opex,
      cash: a.cash_closing,
    };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Revenue & expenses chart */}
      <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
        <SectionLabel text="Revenue vs Costs" />
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
            <XAxis dataKey="period" tickFormatter={fmtMonth} style={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} style={{ fontSize: 11 }} />
            <Tooltip formatter={((v: number) => [`$${Math.round(v).toLocaleString()}`, ""]) as any} labelFormatter={fmtMonth as any} />
            <Legend />
            <Bar dataKey="revenue" fill={GREEN} name="Revenue" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cogs" fill={ACCENT} name="Delivery cost" radius={[4, 4, 0, 0]} />
            <Bar dataKey="fixed" fill={AMBER} name="Fixed" radius={[4, 4, 0, 0]} />
            <Bar dataKey="variable" fill={TEXT_MUT} name="Variable" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ backgroundColor: BG }}>
              {["Month", "Revenue", "Delivery", "Fixed", "Variable", "Net Profit", "Cash"].map((h) => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "right", fontSize: 11, fontWeight: 600, color: TEXT_MUT, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {h === "Month" ? <span style={{ textAlign: "left", display: "block" }}>{h}</span> : h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...chartData].reverse().map((row, i) => {
              const isPositive = row.net >= 0;
              return (
                <tr key={row.period} style={{ borderTop: `1px solid ${BORDER}`, backgroundColor: i % 2 === 0 ? SURFACE : BG }}>
                  <td style={{ padding: "10px 14px", fontWeight: 600, color: TEXT }}>{fmtMonth(row.period)}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", color: GREEN, fontWeight: 600 }}>{fmtCurrency(row.revenue)}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", color: TEXT_SEC }}>{fmtCurrency(row.cogs)}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", color: TEXT_SEC }}>{fmtCurrency(row.fixed)}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", color: TEXT_SEC }}>{fmtCurrency(row.variable)}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", color: isPositive ? GREEN : ACCENT, fontWeight: 600 }}>{fmtCurrency(row.net)}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", color: TEXT_SEC }}>{fmtCurrency(row.cash)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Forecast Tab ───────────────────────────────────────────────────────────
function ForecastTab({ forecast }: { forecast: ForecastData | null }) {
  const [metric, setMetric] = useState<"total_revenue" | "pum_end" | "operating_profit" | "contribution_margin">("total_revenue");

  if (!forecast || Object.keys(forecast.forecasts).length === 0) {
    return (
      <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 40, textAlign: "center" }}>
        <p style={{ color: TEXT_MUT, fontSize: 14 }}>No forecast available. Set up assumptions in the Assumptions tab first.</p>
      </div>
    );
  }

  const baseline = forecast.forecasts.baseline ?? [];
  const upside = forecast.forecasts.upside ?? [];
  const downside = forecast.forecasts.downside ?? [];

  // Merge into single chart dataset
  const periods = baseline.map((m) => m.period);
  const chartData = periods.map((period, i) => ({
    period,
    baseline: (baseline[i] as unknown as Record<string, number>)?.[metric] ?? 0,
    upside: (upside[i] as unknown as Record<string, number>)?.[metric] ?? 0,
    downside: (downside[i] as unknown as Record<string, number>)?.[metric] ?? 0,
  }));

  const METRICS = [
    { key: "total_revenue", label: "Revenue" },
    { key: "pum_end", label: "PUM" },
    { key: "operating_profit", label: "Operating Profit" },
    { key: "contribution_margin", label: "Contribution Margin" },
  ];

  const baselineEnd = baseline[baseline.length - 1];

  return (
    <div>
      {/* Metric selector */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {METRICS.map((m) => (
          <button key={m.key} onClick={() => setMetric(m.key as typeof metric)} style={{
            padding: "10px 18px", fontSize: 14, fontWeight: metric === m.key ? 600 : 400,
            backgroundColor: metric === m.key ? ACCENT : SURFACE,
            color: metric === m.key ? "#fff" : TEXT_MUT,
            border: `1px solid ${metric === m.key ? ACCENT : BORDER}`,
            borderRadius: 20, cursor: "pointer",
          }}>{m.label}</button>
        ))}
      </div>

      {/* Chart */}
      <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20, marginBottom: 20 }}>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
            <XAxis dataKey="period" tickFormatter={fmtMonth} style={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v) => metric === "pum_end" ? String(Math.round(v)) : `$${(v / 1000).toFixed(0)}k`} style={{ fontSize: 11 }} />
            <Tooltip formatter={((v: number) => [metric === "pum_end" ? Math.round(v) : `$${Math.round(v).toLocaleString()}`, ""]) as any} labelFormatter={fmtMonth as any} />
            <Legend />
            <Line type="monotone" dataKey="upside" stroke={GREEN} strokeWidth={2} dot={false} name="Upside" strokeDasharray="6 3" />
            <Line type="monotone" dataKey="baseline" stroke={ACCENT} strokeWidth={2.5} dot={false} name="Baseline" />
            <Line type="monotone" dataKey="downside" stroke={TEXT_MUT} strokeWidth={2} dot={false} name="Downside" strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 12-month end summary */}
      {baselineEnd && (
        <div style={{ marginBottom: 20 }}>
          <SectionLabel text="12-Month Baseline End State" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            <StatCard label="PUM" value={String(Math.round(baselineEnd.pum_end))} sub="End of period" />
            <StatCard label="MRR" value={fmtCurrency(baselineEnd.mrr)} sub="Monthly run rate" />
            <StatCard label="ARR" value={fmtCurrency(baselineEnd.arr)} sub="Annualized" />
            <StatCard label="Op. Profit" value={fmtCurrency(baselineEnd.operating_profit)} sub="Monthly"
              color={baselineEnd.operating_profit >= 0 ? GREEN : ACCENT} />
          </div>
        </div>
      )}

      {/* Forecast table */}
      <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ backgroundColor: BG }}>
              {["Month", "PUM", "Revenue", "Payroll", "Op. Profit", "Cash", "LTV:CAC"].map((h) => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "right", fontSize: 11, fontWeight: 600, color: TEXT_MUT, textTransform: "uppercase" }}>
                  {h === "Month" ? <span style={{ textAlign: "left", display: "block" }}>{h}</span> : h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {baseline.map((m, i) => (
              <tr key={m.period} style={{ borderTop: `1px solid ${BORDER}`, backgroundColor: i % 2 === 0 ? SURFACE : BG }}>
                <td style={{ padding: "10px 14px", fontWeight: 600, color: TEXT }}>{fmtMonth(m.period)}</td>
                <td style={{ padding: "10px 14px", textAlign: "right", color: TEXT_SEC }}>{Math.round(m.pum_end)}</td>
                <td style={{ padding: "10px 14px", textAlign: "right", color: GREEN, fontWeight: 600 }}>{fmtCurrency(m.total_revenue)}</td>
                <td style={{ padding: "10px 14px", textAlign: "right", color: TEXT_SEC }}>{fmtCurrency(m.payroll)}</td>
                <td style={{ padding: "10px 14px", textAlign: "right", color: m.operating_profit >= 0 ? GREEN : ACCENT, fontWeight: 600 }}>{fmtCurrency(m.operating_profit)}</td>
                <td style={{ padding: "10px 14px", textAlign: "right", color: (m.cash_closing ?? 0) >= 0 ? TEXT_SEC : ACCENT }}>{fmtCurrency(m.cash_closing)}</td>
                <td style={{ padding: "10px 14px", textAlign: "right", color: m.ltv_cac_ratio >= 3 ? GREEN : AMBER }}>{fmtRatio(m.ltv_cac_ratio)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Scenarios Tab ──────────────────────────────────────────────────────────
function ScenariosTab({ forecast }: { forecast: ForecastData | null }) {
  const scenarios = forecast?.scenarios ?? [];
  const forecasts = forecast?.forecasts ?? {};

  if (scenarios.length === 0) return <p style={{ color: TEXT_MUT, fontSize: 14 }}>No scenarios. Set assumptions to generate forecasts.</p>;

  const colors: Record<string, string> = { baseline: ACCENT, upside: GREEN, downside: TEXT_MUT };

  // Compare end state across scenarios
  const comparison = scenarios.map((s) => {
    const f = forecasts[s.type] ?? [];
    const end = f[f.length - 1];
    return { ...s, end };
  }).filter((s) => s.end);

  return (
    <div>
      <SectionLabel text="Scenario Comparison — 12-Month End State" />
      <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden", marginBottom: 24 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ backgroundColor: BG }}>
              {["Scenario", "PUM", "MRR", "ARR", "Op. Profit", "Cash", "LTV:CAC", "CM %"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "right", fontSize: 11, fontWeight: 600, color: TEXT_MUT, textTransform: "uppercase" }}>
                  {h === "Scenario" ? <span style={{ textAlign: "left", display: "block" }}>{h}</span> : h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparison.map((s) => {
              const e = s.end;
              const color = colors[s.type] ?? TEXT;
              return (
                <tr key={s.id} style={{ borderTop: `1px solid ${BORDER}` }}>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color }}>{s.name}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right", color: TEXT_SEC }}>{Math.round(e.pum_end)}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right", color: TEXT_SEC }}>{fmtCurrency(e.mrr)}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right", color: TEXT_SEC }}>{fmtCurrency(e.arr)}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right", color: e.operating_profit >= 0 ? GREEN : ACCENT, fontWeight: 600 }}>{fmtCurrency(e.operating_profit)}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right", color: e.cash_closing >= 0 ? TEXT_SEC : ACCENT }}>{fmtCurrency(e.cash_closing)}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right", color: e.ltv_cac_ratio >= 3 ? GREEN : AMBER }}>{fmtRatio(e.ltv_cac_ratio)}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right", color: e.contribution_margin_pct >= 0.65 ? GREEN : AMBER }}>{fmtPct(e.contribution_margin_pct)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Revenue comparison chart */}
      <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
        <SectionLabel text="Revenue Trajectory — All Scenarios" />
        <ResponsiveContainer width="100%" height={240}>
          <LineChart>
            <CartesianGrid strokeDasharray="3 3" stroke={BORDER} />
            <XAxis dataKey="period" tickFormatter={fmtMonth} style={{ fontSize: 11 }} allowDuplicatedCategory={false} />
            <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} style={{ fontSize: 11 }} />
            <Tooltip formatter={((v: number) => [`$${Math.round(v).toLocaleString()}`, ""]) as any} labelFormatter={fmtMonth as any} />
            <Legend />
            {comparison.map((s) => (
              <Line key={s.id} data={forecasts[s.type] ?? []} type="monotone" dataKey="total_revenue"
                stroke={colors[s.type] ?? TEXT} strokeWidth={2} dot={false} name={s.name}
                strokeDasharray={s.type === "upside" ? "6 3" : s.type === "downside" ? "4 4" : undefined} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Assumptions Tab ────────────────────────────────────────────────────────
function AssumptionsTab({ onSaved }: { onSaved: () => void }) {
  const [scenarios, setScenarios] = useState<{ id: string; name: string; type: string; assumptions: Record<string, number | null> | null }[]>([]);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/ceo/scenarios").then((r) => r.json()).catch(() => []);
    setScenarios(Array.isArray(res) ? res : []);
    if (Array.isArray(res) && res.length > 0 && !activeScenario) {
      const baseline = res.find((s: { type: string }) => s.type === "baseline");
      setActiveScenario(baseline?.id ?? res[0].id);
    }
  }, [activeScenario]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!activeScenario) return;
    const s = scenarios.find((s) => s.id === activeScenario);
    if (s?.assumptions) {
      const f: Record<string, string> = {};
      for (const [k, v] of Object.entries(s.assumptions)) {
        if (v !== null) f[k] = String(v);
      }
      setForm(f);
    } else {
      setForm({});
    }
  }, [activeScenario, scenarios]);

  async function save() {
    if (!activeScenario) return;
    setSaving(true);
    await fetch("/api/admin/ceo/scenarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        _action: "upsert_assumptions",
        scenario_id: activeScenario,
        ...Object.fromEntries(Object.entries(form).map(([k, v]) => [k, Number(v)])),
      }),
    });
    setSaving(false);
    load();
    onSaved();
  }

  const FIELDS: { key: string; label: string; unit: string; hint: string }[] = [
    { key: "new_properties_per_month", label: "New Properties / Month", unit: "properties", hint: "Expected properties added each month" },
    { key: "property_churn_rate", label: "Property Churn Rate", unit: "% monthly", hint: "e.g. 0.02 = 2% of PUM lost per month" },
    { key: "new_owners_per_month", label: "New Owners / Month", unit: "owners", hint: "Expected new landlord clients" },
    { key: "owner_churn_rate", label: "Owner Churn Rate", unit: "% monthly", hint: "e.g. 0.02 = 2% of owners lost per month" },
    { key: "avg_revenue_per_property", label: "Avg Revenue / Property", unit: "$/mo", hint: "Monthly management fee per managed property" },
    { key: "leasing_fee_per_placement", label: "Leasing Fee / Placement", unit: "$", hint: "One-time leasing fee per tenant placed" },
    { key: "placements_per_month", label: "Placements / Month", unit: "placements", hint: "Expected tenant placements per month" },
    { key: "payroll_growth_rate", label: "Payroll Growth Rate", unit: "% monthly", hint: "e.g. 0.01 = 1% payroll growth per month" },
    { key: "marketing_spend_monthly", label: "Marketing Spend / Month", unit: "$/mo", hint: "Total monthly marketing budget" },
    { key: "acquisition_spend_monthly", label: "Acquisition Spend / Month", unit: "$/mo", hint: "CAC-attributable spend (subset of marketing)" },
    { key: "opex_growth_rate", label: "OpEx Growth Rate", unit: "% monthly", hint: "e.g. 0.005 = 0.5% opex growth per month" },
    { key: "avg_properties_per_new_owner", label: "Properties / New Owner", unit: "properties", hint: "Average portfolio size of newly acquired owners" },
    { key: "expected_owner_lifetime_months", label: "Expected Owner Lifetime", unit: "months", hint: "Used for LTV when churn history is insufficient" },
    { key: "contribution_margin_pct", label: "Contribution Margin %", unit: "decimal", hint: "e.g. 0.65 = 65% direct margin" },
    { key: "starting_cash", label: "Starting Cash", unit: "$", hint: "Cash on hand at start of forecast period" },
  ];

  const activeScenarioData = scenarios.find((s) => s.id === activeScenario);

  return (
    <div>
      {/* Scenario tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {scenarios.map((s) => (
          <button key={s.id} onClick={() => setActiveScenario(s.id)} style={{
            padding: "10px 20px", fontSize: 14, fontWeight: activeScenario === s.id ? 600 : 400,
            backgroundColor: activeScenario === s.id ? TEXT : SURFACE,
            color: activeScenario === s.id ? "#fff" : TEXT_MUT,
            border: `1px solid ${BORDER}`, borderRadius: 20, cursor: "pointer",
          }}>{s.name}</button>
        ))}
      </div>

      {activeScenarioData && (
        <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: TEXT, margin: 0 }}>{activeScenarioData.name} Assumptions</h3>
            <button onClick={save} disabled={saving} style={{
              backgroundColor: ACCENT, color: "#fff", border: "none", borderRadius: 10,
              padding: "12px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>{saving ? "Saving…" : "Save & Reforecast"}</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
            {FIELDS.map((f) => (
              <div key={f.key}>
                <label style={{ fontSize: 13, fontWeight: 600, color: TEXT_MUT, display: "block", marginBottom: 6 }}>{f.label}</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="number"
                    value={form[f.key] ?? ""}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder="Not set"
                    step="any"
                    style={{ flex: 1, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 14px", fontSize: 15, backgroundColor: BG, color: TEXT }}
                  />
                  <span style={{ fontSize: 12, color: TEXT_MUT, whiteSpace: "nowrap" }}>{f.unit}</span>
                </div>
                <p style={{ fontSize: 12, color: TEXT_MUT, margin: "4px 0 0" }}>{f.hint}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Data Entry Tab ─────────────────────────────────────────────────────────
function DataEntryTab({ onSaved }: { onSaved: () => void }) {
  const now = new Date();
  const defaultPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const [form, setForm] = useState({
    period: defaultPeriod,
    revenue_override: "", recurring_revenue: "", transactional_revenue: "",
    payroll: "", marketing_spend: "", acquisition_spend: "", operating_expenses: "",
    cash_opening: "", cash_closing: "",
    new_leads: "", qualified_leads: "", discovery_calls: "", proposals_sent: "", new_owners: "",
    properties_added: "", properties_lost: "", owners_added: "", owners_lost: "",
    employee_count: "", notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    const body: Record<string, unknown> = { period: form.period };
    for (const [k, v] of Object.entries(form)) {
      if (k === "period" || k === "notes") continue;
      if (v !== "") body[k] = Number(v);
    }
    if (form.notes) body.notes = form.notes;

    await fetch("/api/admin/ceo/actuals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    onSaved();
  }

  const SECTIONS = [
    {
      title: "Revenue",
      note: "Leave blank to use Notion rent tracker data automatically",
      fields: [
        { key: "revenue_override", label: "Total Revenue Override", hint: "Override Notion auto-pull — leave blank to use Notion" },
        { key: "recurring_revenue", label: "Recurring Revenue (mgmt fees)", hint: "Management fee portion of revenue" },
        { key: "transactional_revenue", label: "Transactional Revenue (leasing)", hint: "One-time leasing/placement fees" },
      ],
    },
    {
      title: "Expenses",
      note: "Notion expenses DB pulls automatically — enter payroll and marketing here",
      fields: [
        { key: "payroll", label: "Payroll", hint: "Total payroll including employer burden" },
        { key: "marketing_spend", label: "Marketing Spend", hint: "Total marketing budget this month" },
        { key: "acquisition_spend", label: "Acquisition Spend", hint: "CAC-attributable subset (paid ads, outreach)" },
        { key: "operating_expenses", label: "Operating Expenses", hint: "Other monthly opex not captured above" },
      ],
    },
    {
      title: "Cash",
      note: "Revenue ≠ Cash. Enter actual bank balance.",
      fields: [
        { key: "cash_opening", label: "Opening Cash Balance", hint: "Cash at start of month" },
        { key: "cash_closing", label: "Closing Cash Balance", hint: "Cash at end of month" },
      ],
    },
    {
      title: "Growth",
      note: "Track portfolio changes this month",
      fields: [
        { key: "properties_added", label: "Properties Added", hint: "New properties onboarded" },
        { key: "properties_lost", label: "Properties Lost", hint: "Properties off-boarded or churned" },
        { key: "owners_added", label: "Owners Added", hint: "New landlord clients signed" },
        { key: "owners_lost", label: "Owners Lost", hint: "Landlord clients who left" },
      ],
    },
    {
      title: "Lead Funnel",
      note: "From Zoho CRM or manual count",
      fields: [
        { key: "new_leads", label: "New Leads", hint: "Total new landlord leads this month" },
        { key: "qualified_leads", label: "Qualified Leads", hint: "Leads that met basic criteria" },
        { key: "discovery_calls", label: "Discovery Calls", hint: "Calls completed" },
        { key: "proposals_sent", label: "Proposals Sent", hint: "Proposals or quotes sent" },
        { key: "new_owners", label: "New Owners Acquired", hint: "Proposals that converted to signed clients" },
      ],
    },
    {
      title: "Headcount",
      note: "Include all paid employees and contractors",
      fields: [
        { key: "employee_count", label: "Employee Count", hint: "Total headcount at end of month" },
      ],
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: TEXT, margin: 0 }}>Monthly Actuals Entry</h2>
          <p style={{ fontSize: 14, color: TEXT_MUT, margin: "6px 0 0" }}>
            Revenue and expenses pull automatically from Notion. Enter everything else here.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: TEXT_MUT, display: "block", marginBottom: 5 }}>Period</label>
            <input type="month" value={form.period.slice(0, 7)}
              onChange={(e) => setForm({ ...form, period: e.target.value + "-01" })}
              style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "11px 14px", fontSize: 15, backgroundColor: BG }} />
          </div>
          <button onClick={save} disabled={saving} style={{
            backgroundColor: ACCENT, color: "#fff", border: "none", borderRadius: 10,
            padding: "13px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save Actuals"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {SECTIONS.map((section) => (
          <div key={section.title} style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24 }}>
            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: "0 0 3px" }}>{section.title}</p>
              <p style={{ fontSize: 13, color: TEXT_MUT, margin: 0 }}>{section.note}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
              {section.fields.map((f) => (
                <div key={f.key}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: TEXT_MUT, display: "block", marginBottom: 6 }}>{f.label}</label>
                  <input
                    type="number"
                    value={(form as Record<string, string>)[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder="0"
                    step="any"
                    style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 14px", fontSize: 15, backgroundColor: BG, color: TEXT, boxSizing: "border-box" }}
                  />
                  <p style={{ fontSize: 12, color: TEXT_MUT, margin: "5px 0 0" }}>{f.hint}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Notes */}
        <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: TEXT_MUT, display: "block", marginBottom: 6 }}>Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            placeholder="Context, anomalies, or reasons for manual overrides…"
            style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 14px", fontSize: 15, backgroundColor: BG, color: TEXT, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
          />
        </div>

        {/* Sticky save bar so a long scroll never strands the button */}
        <div style={{
          position: "sticky", bottom: 20, alignSelf: "flex-end",
          backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14,
          padding: "12px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          {saved && <span style={{ fontSize: 13, color: GREEN, fontWeight: 600 }}>Saved ✓</span>}
          <button onClick={save} disabled={saving} style={{
            backgroundColor: ACCENT, color: "#fff", border: "none", borderRadius: 10,
            padding: "13px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>
            {saving ? "Saving…" : "Save Actuals"}
          </button>
        </div>
      </div>
    </div>
  );
}
