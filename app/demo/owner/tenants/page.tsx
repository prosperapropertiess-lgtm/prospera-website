import Link from "next/link";
import DemoShell from "@/components/demo/DemoShell";
import { DEMO_OWNER, DEMO_TENANT, DEMO_PROPERTY, PAYMENT_HISTORY } from "@/lib/demo-data";

const NAVY = "#1F2F3A";
const BURGUNDY = "#8B2030";
const GREEN = "#0A7A52";
const AMBER = "#B45309";
const WHITE = "#FFFFFF";
const BORDER = "rgba(15,28,40,0.08)";
const MUTED = "rgba(15,28,40,0.45)";
const CARD_SHADOW = "0 1px 3px rgba(15,28,40,0.05), 0 4px 16px rgba(15,28,40,0.06)";

export default function OwnerTenantsPage() {
  const onTime = PAYMENT_HISTORY.filter(p => p.status !== "Late").length;
  const pctOnTime = Math.round((onTime / PAYMENT_HISTORY.length) * 100);

  return (
    <DemoShell mode="owner" name={DEMO_OWNER.name} initials={DEMO_OWNER.initials}>

      <Link href="/demo/owner" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: MUTED, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "20px", fontWeight: 500 }}>
        ← Back
      </Link>

      <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "32px", fontWeight: 700, color: NAVY, marginBottom: "24px", letterSpacing: "-0.01em" }}>Tenants</h1>

      {/* Tenant card */}
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: "20px", padding: "24px", marginBottom: "12px", boxShadow: CARD_SHADOW }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: NAVY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#FAF8F5", fontSize: "16px", fontWeight: 700, fontFamily: "var(--font-dm-sans)" }}>{DEMO_TENANT.initials}</span>
          </div>
          <div>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "17px", fontWeight: 700, color: NAVY }}>{DEMO_TENANT.name}</p>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: MUTED }}>{DEMO_PROPERTY.address} · {DEMO_TENANT.unit}</p>
          </div>
          <span style={{ marginLeft: "auto", fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "10px", background: "rgba(10,122,82,0.10)", color: GREEN, fontFamily: "var(--font-dm-sans)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Active
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {[
            { label: "Lease start", value: "July 1, 2025" },
            { label: "Lease end", value: "June 30, 2027" },
            { label: "Monthly rent", value: "$1,950" },
            { label: "On-time rate", value: `${pctOnTime}%` },
            { label: "Phone", value: DEMO_TENANT.phone },
            { label: "Email", value: DEMO_TENANT.email },
          ].map(d => (
            <div key={d.label}>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "10px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: "3px" }}>{d.label}</p>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: NAVY, fontWeight: 600 }}>{d.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Lease countdown */}
      <div style={{ background: "rgba(10,122,82,0.07)", border: "1px solid rgba(10,122,82,0.15)", borderRadius: "14px", padding: "16px 20px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: GREEN, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, marginBottom: "4px" }}>Lease renewal</p>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: NAVY, fontWeight: 600 }}>Due June 30, 2027</p>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: MUTED, marginTop: "2px" }}>Prospera will reach out in April 2027</p>
        </div>
        <span className="material-symbols-outlined" style={{ fontSize: "28px", color: GREEN }}>event_available</span>
      </div>

      {/* Payment history */}
      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, marginBottom: "10px" }}>Payment history</p>
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: "16px", overflow: "hidden", boxShadow: CARD_SHADOW }}>
        {PAYMENT_HISTORY.map((p, i) => (
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
