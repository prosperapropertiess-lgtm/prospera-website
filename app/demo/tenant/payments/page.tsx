import Link from "next/link";
import DemoShell from "@/components/demo/DemoShell";
import { DEMO_TENANT, PAYMENT_HISTORY } from "@/lib/demo-data";

const NAVY = "#1F2F3A";
const GREEN = "#0A7A52";
const AMBER = "#B45309";
const WHITE = "#FFFFFF";
const BORDER = "rgba(15,28,40,0.08)";
const MUTED = "rgba(15,28,40,0.45)";
const CARD_SHADOW = "0 1px 3px rgba(15,28,40,0.05), 0 4px 16px rgba(15,28,40,0.06)";

export default function TenantPaymentsPage() {
  const total = PAYMENT_HISTORY.reduce((s, p) => s + p.amount, 0);
  const onTime = PAYMENT_HISTORY.filter(p => p.status !== "Late").length;
  const pct = Math.round((onTime / PAYMENT_HISTORY.length) * 100);

  return (
    <DemoShell mode="tenant" name={DEMO_TENANT.name} initials={DEMO_TENANT.initials}>

      <Link href="/demo/tenant" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: MUTED, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "20px", fontWeight: 500 }}>
        ← Back
      </Link>

      <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "32px", fontWeight: 700, color: NAVY, marginBottom: "24px", letterSpacing: "-0.01em" }}>Payments</h1>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "24px" }}>
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "16px", boxShadow: CARD_SHADOW }}>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "10px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700, marginBottom: "8px" }}>Total paid (12 mo)</p>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "22px", fontWeight: 800, color: NAVY }}>${total.toLocaleString()}</p>
        </div>
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "16px", boxShadow: CARD_SHADOW }}>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "10px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700, marginBottom: "8px" }}>On-time rate</p>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "22px", fontWeight: 800, color: pct >= 90 ? GREEN : AMBER }}>{pct}%</p>
        </div>
      </div>

      {/* Next due */}
      <div style={{ background: "rgba(10,122,82,0.06)", border: "1px solid rgba(10,122,82,0.12)", borderRadius: "14px", padding: "16px 18px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: GREEN, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "3px" }}>Next due</p>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "15px", fontWeight: 700, color: NAVY }}>August 1, 2026</p>
        </div>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "20px", fontWeight: 800, color: NAVY }}>$1,950</p>
      </div>

      {/* History */}
      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, marginBottom: "10px" }}>History</p>
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: "16px", overflow: "hidden", boxShadow: CARD_SHADOW }}>
        {[...PAYMENT_HISTORY].reverse().map((p, i) => (
          <div key={p.month} style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: i < PAYMENT_HISTORY.length - 1 ? `1px solid ${BORDER}` : "none", background: i % 2 === 0 ? WHITE : "rgba(15,28,40,0.015)" }}>
            <div>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: NAVY, fontWeight: 600 }}>{p.month}</p>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED }}>{p.date}</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", fontWeight: 700, color: NAVY }}>${p.amount.toLocaleString()}</span>
              <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "10px", background: p.status === "Late" ? "rgba(180,83,9,0.10)" : "rgba(10,122,82,0.10)", color: p.status === "Late" ? AMBER : GREEN, fontFamily: "var(--font-dm-sans)" }}>
                {p.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </DemoShell>
  );
}
