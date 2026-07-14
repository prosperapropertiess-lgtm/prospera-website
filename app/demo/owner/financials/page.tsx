"use client";

import Link from "next/link";
import DemoShell from "@/components/demo/DemoShell";
import DemoChart from "@/components/demo/DemoChart";
import {
  DEMO_OWNER, HISTORY, YTD_COLLECTED, YTD_EXPENSES, YTD_NET, CURRENT_MONTH,
} from "@/lib/demo-data";

const NAVY = "#1F2F3A";
const BURGUNDY = "#8B2030";
const GREEN = "#0A7A52";
const AMBER = "#B45309";
const RED = "#B91C1C";
const WHITE = "#FFFFFF";
const BORDER = "rgba(15,28,40,0.08)";
const MUTED = "rgba(15,28,40,0.45)";
const SUBTLE = "rgba(15,28,40,0.65)";
const CARD_SHADOW = "0 1px 3px rgba(15,28,40,0.05), 0 4px 16px rgba(15,28,40,0.06)";

const fmt$ = (n: number) => "$" + n.toLocaleString("en-CA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const ytdMonths = HISTORY.filter(h => h.year === 2026);
const activeMonths = ytdMonths.filter(h => h.rentCollected > 0 || h.expenses > 0).length;
const projectedNet = Math.round((YTD_NET / activeMonths) * 12);
const avgMonthlyNet = Math.round(YTD_NET / activeMonths);

// Expense breakdown YTD
const expBreakdown: Record<string, number> = {};
for (const h of ytdMonths) {
  for (const [cat, amt] of Object.entries(h.expenseBreakdown)) {
    expBreakdown[cat] = (expBreakdown[cat] ?? 0) + amt;
  }
}
const sortedExp = Object.entries(expBreakdown).sort((a, b) => b[1] - a[1]);

export default function OwnerFinancialsPage() {
  return (
    <DemoShell mode="owner" name={DEMO_OWNER.name} initials={DEMO_OWNER.initials}>

      {/* Back */}
      <Link href="/demo/owner" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: MUTED, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "20px", fontWeight: 500 }}>
        ← Back
      </Link>

      <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "32px", fontWeight: 700, color: NAVY, marginBottom: "4px", letterSpacing: "-0.01em" }}>Financials</h1>
      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: MUTED, marginBottom: "24px" }}>
        {CURRENT_MONTH.month} {CURRENT_MONTH.year} · Year-to-date overview
      </p>

      {/* Current month hero */}
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderTop: `3px solid ${GREEN}`, borderRadius: "20px", padding: "24px", marginBottom: "12px", boxShadow: CARD_SHADOW }}>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, marginBottom: "8px" }}>
          {CURRENT_MONTH.month} {CURRENT_MONTH.year}
        </p>
        <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "4px" }}>
          <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "52px", fontWeight: 700, color: NAVY, lineHeight: 1, letterSpacing: "-0.02em" }}>
            {fmt$(CURRENT_MONTH.rentCollected)}
          </p>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "15px", color: MUTED }}>of {fmt$(CURRENT_MONTH.rentDue)} due</p>
        </div>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: GREEN, fontWeight: 600 }}>✓ Fully collected</p>
      </div>

      {/* YTD stat cards */}
      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, marginBottom: "10px", marginTop: "20px" }}>Year to date</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "12px" }}>
        {[
          { label: "Collected", value: fmt$(YTD_COLLECTED), color: NAVY },
          { label: "Expenses", value: fmt$(YTD_EXPENSES), color: AMBER },
          { label: "Net", value: fmt$(YTD_NET), color: YTD_NET >= 0 ? GREEN : RED },
        ].map(c => (
          <div key={c.label} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "16px 12px", boxShadow: CARD_SHADOW }}>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "10px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700, marginBottom: "8px" }}>{c.label}</p>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "clamp(16px, 3.5vw, 22px)", fontWeight: 800, color: c.color, letterSpacing: "-0.01em" }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Projection */}
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${GREEN}`, borderRadius: "16px", padding: "18px 20px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", boxShadow: CARD_SHADOW }}>
        <div>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, marginBottom: "4px" }}>On track for 2026</p>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "28px", fontWeight: 800, color: GREEN, letterSpacing: "-0.02em" }}>+{fmt$(projectedNet)}</p>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: MUTED, marginTop: "2px" }}>projected net · avg {fmt$(avgMonthlyNet)} / mo</p>
        </div>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: MUTED }}>Based on {activeMonths} months</p>
      </div>

      {/* Chart */}
      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, marginBottom: "10px" }}>6-month trend</p>
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: "20px", padding: "20px", marginBottom: "12px", boxShadow: CARD_SHADOW }}>
        <DemoChart history={HISTORY} />
      </div>

      {/* Expense breakdown */}
      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, marginBottom: "10px", marginTop: "20px" }}>Where the money went (YTD)</p>
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: "16px", padding: "20px", marginBottom: "12px", boxShadow: CARD_SHADOW }}>
        {sortedExp.map(([cat, amt]) => (
          <div key={cat} style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: NAVY, fontWeight: 600 }}>{cat}</span>
              <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: NAVY, fontWeight: 700 }}>{fmt$(amt)}</span>
            </div>
            <div style={{ background: "rgba(15,28,40,0.06)", borderRadius: "4px", height: "6px" }}>
              <div style={{ background: NAVY, borderRadius: "4px", height: "6px", width: `${Math.round((amt / YTD_EXPENSES) * 100)}%` }} />
            </div>
          </div>
        ))}
        <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "12px", marginTop: "4px", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: MUTED, fontWeight: 700 }}>Total</span>
          <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: AMBER, fontWeight: 800 }}>{fmt$(YTD_EXPENSES)}</span>
        </div>
      </div>

      {/* Month-by-month table */}
      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, marginBottom: "10px", marginTop: "20px" }}>Month-by-month</p>
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: "16px", overflow: "hidden", boxShadow: CARD_SHADOW }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: "380px", borderCollapse: "collapse", fontFamily: "var(--font-dm-sans)" }}>
            <thead>
              <tr style={{ background: "rgba(15,28,40,0.03)" }}>
                {["Month", "Rent", "Expenses", "Net", "Status"].map(h => (
                  <th key={h} style={{ textAlign: h === "Month" || h === "Status" ? "left" : "right", padding: "12px 14px", fontSize: "10px", color: MUTED, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid ${BORDER}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...HISTORY].reverse().map((h, i) => (
                <tr key={`${h.month}-${h.year}`} style={{ background: i % 2 === 0 ? WHITE : "rgba(15,28,40,0.015)" }}>
                  <td style={{ padding: "11px 14px", fontSize: "13px", color: NAVY, fontWeight: 600, borderBottom: `1px solid ${BORDER}` }}>{h.month.slice(0,3)} {String(h.year).slice(2)}</td>
                  <td style={{ padding: "11px 14px", fontSize: "13px", color: NAVY, fontWeight: 600, textAlign: "right", borderBottom: `1px solid ${BORDER}` }}>{fmt$(h.rentCollected)}</td>
                  <td style={{ padding: "11px 14px", fontSize: "13px", color: h.expenses > 0 ? AMBER : MUTED, textAlign: "right", borderBottom: `1px solid ${BORDER}` }}>{h.expenses > 0 ? fmt$(h.expenses) : "—"}</td>
                  <td style={{ padding: "11px 14px", fontSize: "13px", fontWeight: 700, color: h.net >= 0 ? GREEN : RED, textAlign: "right", borderBottom: `1px solid ${BORDER}` }}>{fmt$(h.net)}</td>
                  <td style={{ padding: "11px 14px", borderBottom: `1px solid ${BORDER}` }}>
                    <span style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: "10px",
                      background: h.paymentStatus === "Late" ? "rgba(180,83,9,0.10)" : "rgba(10,122,82,0.10)",
                      color: h.paymentStatus === "Late" ? AMBER : GREEN,
                    }}>
                      {h.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DemoShell>
  );
}
