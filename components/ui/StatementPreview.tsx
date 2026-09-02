"use client";

import { useState } from "react";
import {
  HISTORY,
  YTD_COLLECTED,
  YTD_EXPENSES,
  YTD_NET,
  CURRENT_MONTH,
  DEMO_PROPERTY,
} from "@/lib/demo-data";

const NAVY    = "#1F2F3A";
const GREEN   = "#0A7A52";
const AMBER   = "#B45309";
const RED     = "#B91C1C";
const WHITE   = "#FFFFFF";
const BORDER  = "rgba(15,28,40,0.08)";
const MUTED   = "rgba(15,28,40,0.45)";
const SUBTLE  = "rgba(15,28,40,0.65)";
const CARD_SH = "0 1px 3px rgba(15,28,40,0.05), 0 4px 16px rgba(15,28,40,0.06)";

const fmt$ = (n: number) =>
  "$" + n.toLocaleString("en-CA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const ytdMonths    = HISTORY.filter((h) => h.year === 2026);
const activeMonths = ytdMonths.filter((h) => h.rentCollected > 0 || h.expenses > 0).length;
const projectedNet = Math.round((YTD_NET / activeMonths) * 12);
const avgMonthlyNet = Math.round(YTD_NET / activeMonths);

const expBreakdown: Record<string, number> = {};
for (const h of ytdMonths) {
  for (const [cat, amt] of Object.entries(h.expenseBreakdown)) {
    expBreakdown[cat] = (expBreakdown[cat] ?? 0) + amt;
  }
}
const sortedExp = Object.entries(expBreakdown).sort((a, b) => b[1] - a[1]);

export default function StatementPreview() {
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [error, setError]       = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) { setError("Enter a valid email address."); return; }
    setError("");
    setLoading(true);
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "landlord", source: "pricing-statement" }),
      });
    } catch {
      // don't block reveal on network error
    }
    setLoading(false);
    setRevealed(true);
  }

  return (
    <section
      style={{
        background: WHITE,
        padding: "clamp(64px, 8vw, 120px) clamp(20px, 4vw, 60px)",
      }}
    >
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>

        {/* Header */}
        <p
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "#999999",
            marginBottom: "16px",
          }}
        >
          Sample statement
        </p>
        <h2
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(30px, 4vw, 48px)",
            fontWeight: 700,
            color: NAVY,
            letterSpacing: "-0.02em",
            marginBottom: "14px",
            lineHeight: 1.15,
          }}
        >
          See exactly what lands in your inbox every month.
        </h2>
        <p
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "clamp(15px, 1.8vw, 17px)",
            color: SUBTLE,
            lineHeight: 1.7,
            marginBottom: "36px",
            maxWidth: "560px",
          }}
        >
          By the 10th of every month, owners receive a statement like this one: rent collected,
          expenses itemized, net income, and a 6-month trend. Enter your email and we&apos;ll show you
          a real example with dummy data.
        </p>

        {/* Email capture */}
        {!revealed && (
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                alignItems: "flex-start",
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  flex: "1 1 220px",
                  padding: "14px 18px",
                  fontSize: "14px",
                  fontFamily: "var(--font-dm-sans)",
                  border: `1.5px solid #D8D2C8`,
                  borderRadius: "8px",
                  background: "#F7F5F2",
                  color: "#222222",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: "#8B2030",
                  color: "#FAF8F5",
                  padding: "14px 28px",
                  fontSize: "11px",
                  fontFamily: "var(--font-dm-sans)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  border: "none",
                  borderRadius: "8px",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  whiteSpace: "nowrap",
                  transition: "opacity 0.2s",
                }}
              >
                {loading ? "Loading…" : "Show me the statement →"}
              </button>
            </div>
            {error && (
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: RED, marginTop: "8px" }}>
                {error}
              </p>
            )}
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: MUTED, marginTop: "10px" }}>
              No spam. Unsubscribe anytime. This is dummy data, not a real property.
            </p>
          </form>
        )}

        {/* Statement reveal */}
        {revealed && (
          <div
            style={{
              marginTop: "8px",
              border: `1.5px solid #D8D2C8`,
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            {/* Sample banner */}
            <div
              style={{
                background: AMBER,
                padding: "10px 20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: WHITE }}>
                ⚠ Sample statement · Dummy data only, not a real property or owner
              </span>
            </div>

            {/* Statement body */}
            <div style={{ padding: "28px 24px", background: "#F7F5F2" }}>

              {/* Property header */}
              <div style={{ marginBottom: "24px" }}>
                <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: MUTED, fontWeight: 600, marginBottom: "2px" }}>
                  {DEMO_PROPERTY.address} · {DEMO_PROPERTY.city}
                </p>
                <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: MUTED }}>
                  Prepared by Prospera Properties · Statement for {CURRENT_MONTH.month} {CURRENT_MONTH.year}
                </p>
              </div>

              {/* Current month hero */}
              <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderTop: `3px solid ${GREEN}`, borderRadius: "16px", padding: "20px", marginBottom: "10px", boxShadow: CARD_SH }}>
                <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "10px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, marginBottom: "6px" }}>
                  {CURRENT_MONTH.month} {CURRENT_MONTH.year}
                </p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "4px" }}>
                  <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "44px", fontWeight: 700, color: NAVY, lineHeight: 1, letterSpacing: "-0.02em", margin: 0 }}>
                    {fmt$(CURRENT_MONTH.rentCollected)}
                  </p>
                  <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: MUTED, margin: 0 }}>of {fmt$(CURRENT_MONTH.rentDue)} due</p>
                </div>
                <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: GREEN, fontWeight: 600, margin: 0 }}>✓ Fully collected</p>
              </div>

              {/* YTD stats */}
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "10px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, marginBottom: "8px", marginTop: "18px" }}>
                Year to date
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "10px" }}>
                {[
                  { label: "Collected", value: fmt$(YTD_COLLECTED), color: NAVY },
                  { label: "Expenses",  value: fmt$(YTD_EXPENSES),  color: AMBER },
                  { label: "Net",       value: fmt$(YTD_NET),       color: YTD_NET >= 0 ? GREEN : RED },
                ].map((c) => (
                  <div key={c.label} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "14px 10px", boxShadow: CARD_SH }}>
                    <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "9px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700, marginBottom: "6px" }}>{c.label}</p>
                    <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "clamp(16px, 3.5vw, 20px)", fontWeight: 800, color: c.color, letterSpacing: "-0.01em", margin: 0 }}>{c.value}</p>
                  </div>
                ))}
              </div>

              {/* Projection */}
              <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${GREEN}`, borderRadius: "12px", padding: "16px 18px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", boxShadow: CARD_SH }}>
                <div>
                  <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "10px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, marginBottom: "2px" }}>On track for 2026</p>
                  <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "24px", fontWeight: 800, color: GREEN, letterSpacing: "-0.02em", margin: 0 }}>+{fmt$(projectedNet)}</p>
                  <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: MUTED, marginTop: "2px" }}>projected net · avg {fmt$(avgMonthlyNet)} / mo</p>
                </div>
                <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED }}>Based on {activeMonths} months</p>
              </div>

              {/* Expense breakdown */}
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "10px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, marginBottom: "8px" }}>
                Where the money went (YTD)
              </p>
              <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "18px", marginBottom: "20px", boxShadow: CARD_SH }}>
                {sortedExp.map(([cat, amt]) => (
                  <div key={cat} style={{ marginBottom: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: NAVY, fontWeight: 600 }}>{cat}</span>
                      <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: NAVY, fontWeight: 700 }}>{fmt$(amt)}</span>
                    </div>
                    <div style={{ background: "rgba(15,28,40,0.06)", borderRadius: "4px", height: "5px" }}>
                      <div style={{ background: NAVY, borderRadius: "4px", height: "5px", width: `${Math.round((amt / YTD_EXPENSES) * 100)}%` }} />
                    </div>
                  </div>
                ))}
                <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "10px", marginTop: "4px", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: MUTED, fontWeight: 700 }}>Total</span>
                  <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: AMBER, fontWeight: 800 }}>{fmt$(YTD_EXPENSES)}</span>
                </div>
              </div>

              {/* Month-by-month table */}
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "10px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, marginBottom: "8px" }}>
                Month-by-month
              </p>
              <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: "12px", overflow: "hidden", boxShadow: CARD_SH }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", minWidth: "360px", borderCollapse: "collapse", fontFamily: "var(--font-dm-sans)" }}>
                    <thead>
                      <tr style={{ background: "rgba(15,28,40,0.03)" }}>
                        {["Month", "Rent", "Expenses", "Net", "Status"].map((h) => (
                          <th key={h} style={{ textAlign: h === "Month" || h === "Status" ? "left" : "right", padding: "10px 14px", fontSize: "9px", color: MUTED, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid ${BORDER}` }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...HISTORY].reverse().map((h, i) => (
                        <tr key={`${h.month}-${h.year}`} style={{ background: i % 2 === 0 ? WHITE : "rgba(15,28,40,0.015)" }}>
                          <td style={{ padding: "10px 14px", fontSize: "13px", color: NAVY, fontWeight: 600, borderBottom: `1px solid ${BORDER}` }}>{h.month.slice(0, 3)} {String(h.year).slice(2)}</td>
                          <td style={{ padding: "10px 14px", fontSize: "13px", color: NAVY, fontWeight: 600, textAlign: "right", borderBottom: `1px solid ${BORDER}` }}>{fmt$(h.rentCollected)}</td>
                          <td style={{ padding: "10px 14px", fontSize: "13px", color: h.expenses > 0 ? AMBER : MUTED, textAlign: "right", borderBottom: `1px solid ${BORDER}` }}>{h.expenses > 0 ? fmt$(h.expenses) : "—"}</td>
                          <td style={{ padding: "10px 14px", fontSize: "13px", fontWeight: 700, color: h.net >= 0 ? GREEN : RED, textAlign: "right", borderBottom: `1px solid ${BORDER}` }}>{fmt$(h.net)}</td>
                          <td style={{ padding: "10px 14px", borderBottom: `1px solid ${BORDER}` }}>
                            <span style={{
                              fontSize: "9px",
                              fontWeight: 700,
                              padding: "3px 7px",
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

              {/* Bottom note */}
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: MUTED, textAlign: "center", marginTop: "20px", lineHeight: 1.6 }}>
                This is a sample statement using fictional data. Every real owner statement includes the same format:
                rent collected, expenses itemized with receipts, and net transferred to your account.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
