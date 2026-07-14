import Link from "next/link";
import DemoShell from "@/components/demo/DemoShell";
import {
  DEMO_TENANT, DEMO_PROPERTY, PAYMENT_HISTORY, MAINTENANCE, TENANT_MESSAGES,
} from "@/lib/demo-data";

const NAVY = "#1F2F3A";
const BURGUNDY = "#8B2030";
const GREEN = "#0A7A52";
const WHITE = "#FFFFFF";
const BORDER = "rgba(15,28,40,0.08)";
const MUTED = "rgba(15,28,40,0.45)";
const CARD_SHADOW = "0 1px 3px rgba(15,28,40,0.05), 0 4px 16px rgba(15,28,40,0.06)";

const CURRENT = PAYMENT_HISTORY[PAYMENT_HISTORY.length - 1];
const openTickets = MAINTENANCE.filter(m => m.status !== "Done");
const unread = TENANT_MESSAGES.filter(m => !m.read).length;

export default function TenantHomePage() {
  return (
    <DemoShell mode="tenant" name={DEMO_TENANT.name} initials={DEMO_TENANT.initials}>

      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: MUTED, marginBottom: "4px" }}>Good morning,</p>
      <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "28px", fontWeight: 700, color: NAVY, marginBottom: "20px", letterSpacing: "-0.01em" }}>
        {DEMO_TENANT.firstName}.
      </h1>

      {/* Current rent card */}
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderTop: `3px solid ${GREEN}`, borderRadius: "20px", padding: "24px", marginBottom: "12px", boxShadow: CARD_SHADOW }}>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, marginBottom: "8px" }}>
          {CURRENT.month}
        </p>
        <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "4px" }}>
          <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "52px", fontWeight: 700, color: NAVY, lineHeight: 1, letterSpacing: "-0.02em" }}>
            $1,950
          </p>
        </div>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: GREEN, fontWeight: 600 }}>
          ✓ Paid · {CURRENT.date}
        </p>
      </div>

      {/* Next payment */}
      <div style={{ background: "rgba(10,122,82,0.06)", border: "1px solid rgba(10,122,82,0.12)", borderRadius: "14px", padding: "14px 18px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: GREEN, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "3px" }}>Next rent due</p>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "15px", fontWeight: 700, color: NAVY }}>August 1, 2026</p>
        </div>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "20px", fontWeight: 800, color: NAVY }}>$1,950</p>
      </div>

      {/* Quick links */}
      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, marginBottom: "10px" }}>Quick access</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "24px" }}>
        {[
          { label: "Payments", sub: "All paid on time", icon: "payments", href: "/demo/tenant/payments", badge: null },
          { label: "Repairs", sub: `${openTickets.length} active`, icon: "build", href: "/demo/tenant/repairs", badge: openTickets.length > 0 ? String(openTickets.length) : null },
          { label: "Documents", sub: "Lease & guides", icon: "folder", href: "/demo/tenant/docs", badge: null },
          { label: "Messages", sub: `${unread} unread`, icon: "chat", href: "/demo/tenant/messages", badge: unread > 0 ? String(unread) : null },
        ].map(q => (
          <Link key={q.href} href={q.href} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: "16px", padding: "16px", textDecoration: "none", display: "flex", flexDirection: "column", gap: "8px", position: "relative", boxShadow: CARD_SHADOW }}>
            {q.badge && (
              <span style={{ position: "absolute", top: "12px", right: "12px", background: BURGUNDY, color: "#FAF8F5", fontSize: "10px", fontWeight: 700, borderRadius: "10px", padding: "2px 6px", fontFamily: "var(--font-dm-sans)" }}>
                {q.badge}
              </span>
            )}
            <span className="material-symbols-outlined" style={{ fontSize: "24px", color: NAVY }}>{q.icon}</span>
            <div>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", fontWeight: 700, color: NAVY }}>{q.label}</p>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: MUTED }}>{q.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Your home */}
      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, marginBottom: "10px" }}>Your home</p>
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: "16px", padding: "20px", marginBottom: "16px", boxShadow: CARD_SHADOW }}>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "16px", fontWeight: 700, color: NAVY, marginBottom: "2px" }}>{DEMO_PROPERTY.address} — {DEMO_TENANT.unit}</p>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: MUTED, marginBottom: "16px" }}>{DEMO_PROPERTY.city}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {[
            { label: "Lease start", value: "July 1, 2025" },
            { label: "Lease end", value: "June 30, 2027" },
            { label: "Monthly rent", value: "$1,950" },
            { label: "Property type", value: DEMO_PROPERTY.type },
          ].map(d => (
            <div key={d.label}>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "10px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: "3px" }}>{d.label}</p>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: NAVY, fontWeight: 600 }}>{d.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency contact */}
      <div style={{ background: "rgba(31,47,58,0.04)", border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "16px 18px" }}>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
          Maintenance emergency?
        </p>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: NAVY, fontWeight: 600, marginBottom: "2px" }}>Prospera Properties</p>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: MUTED }}>(519) 697-1227 · Available 24/7</p>
      </div>
    </DemoShell>
  );
}
