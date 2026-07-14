import Link from "next/link";
import DemoShell from "@/components/demo/DemoShell";
import {
  DEMO_OWNER, DEMO_PROPERTY, DEMO_TENANT,
  YTD_COLLECTED, YTD_EXPENSES, YTD_NET,
  CURRENT_MONTH, HISTORY, MAINTENANCE, OWNER_MESSAGES,
} from "@/lib/demo-data";

const NAVY = "#1F2F3A";
const BURGUNDY = "#8B2030";
const GREEN = "#0A7A52";
const AMBER = "#B45309";
const BG = "#F5F4F1";
const WHITE = "#FFFFFF";
const BORDER = "rgba(15,28,40,0.08)";
const MUTED = "rgba(15,28,40,0.45)";
const SUBTLE = "rgba(15,28,40,0.65)";
const CARD_SHADOW = "0 1px 3px rgba(15,28,40,0.05), 0 4px 16px rgba(15,28,40,0.06)";

const fmt$ = (n: number) => "$" + n.toLocaleString("en-CA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

// YTD from history (Jan–Jun 2026)
const ytdMonths = HISTORY.filter(h => h.year === 2026);
const activeMonths = ytdMonths.filter(h => h.rentCollected > 0 || h.expenses > 0).length;
const projectedNet = activeMonths >= 2 ? Math.round((YTD_NET / activeMonths) * 12) : null;
const avgMonthlyNet = activeMonths >= 2 ? Math.round(YTD_NET / activeMonths) : null;

const openIssues = MAINTENANCE.filter(m => m.status !== "Done").length;
const unreadMessages = OWNER_MESSAGES.filter(m => !m.read).length;

export default function OwnerHomePage() {
  return (
    <DemoShell mode="owner" name={DEMO_OWNER.name} initials={DEMO_OWNER.initials}>

      {/* Greeting */}
      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: MUTED, marginBottom: "4px" }}>
        Good morning,
      </p>
      <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "28px", fontWeight: 700, color: NAVY, marginBottom: "20px", letterSpacing: "-0.01em" }}>
        {DEMO_OWNER.firstName}.
      </h1>

      {/* Current month hero card */}
      <div
        style={{
          background: WHITE,
          border: `1px solid ${BORDER}`,
          borderTop: `3px solid ${GREEN}`,
          borderRadius: "20px",
          padding: "24px",
          marginBottom: "12px",
          boxShadow: CARD_SHADOW,
        }}
      >
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, marginBottom: "8px" }}>
          {CURRENT_MONTH.month} {CURRENT_MONTH.year}
        </p>
        <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
          <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(36px, 8vw, 52px)", fontWeight: 700, color: NAVY, lineHeight: 1, letterSpacing: "-0.02em" }}>
            {fmt$(CURRENT_MONTH.rentCollected)}
          </p>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "15px", color: MUTED }}>collected</p>
        </div>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: GREEN, fontWeight: 600 }}>
          ✓ Fully collected · {CURRENT_MONTH.paymentDate}
        </p>
      </div>

      {/* YTD stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "12px" }}>
        {[
          { label: "YTD Collected", value: fmt$(YTD_COLLECTED), color: NAVY },
          { label: "YTD Expenses", value: fmt$(YTD_EXPENSES), color: AMBER },
          { label: "YTD Net", value: fmt$(YTD_NET), color: YTD_NET >= 0 ? GREEN : BURGUNDY },
        ].map(c => (
          <div key={c.label} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: "14px", padding: "16px 12px", boxShadow: CARD_SHADOW }}>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "10px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700, marginBottom: "8px" }}>{c.label}</p>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "clamp(16px, 3.5vw, 22px)", fontWeight: 800, color: c.color, letterSpacing: "-0.01em" }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Projection card */}
      {projectedNet !== null && (
        <div
          style={{
            background: WHITE,
            border: `1px solid ${BORDER}`,
            borderLeft: `3px solid ${projectedNet >= 0 ? GREEN : BURGUNDY}`,
            borderRadius: "16px",
            padding: "18px 20px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
            boxShadow: CARD_SHADOW,
          }}
        >
          <div>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, marginBottom: "4px" }}>
              On track for 2026
            </p>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "clamp(22px, 5vw, 30px)", fontWeight: 800, color: projectedNet >= 0 ? GREEN : BURGUNDY, letterSpacing: "-0.02em" }}>
              {projectedNet >= 0 ? "+" : ""}{fmt$(projectedNet)}
            </p>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: MUTED, marginTop: "2px" }}>
              projected net · avg {fmt$(avgMonthlyNet!)} / mo
            </p>
          </div>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: MUTED }}>
            Based on {activeMonths} months
          </p>
        </div>
      )}

      {/* Quick links */}
      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, marginBottom: "10px", marginTop: "24px" }}>
        Quick access
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "24px" }}>
        {[
          { label: "Financials", sub: "12-month view", icon: "trending_up", href: "/demo/owner/financials", badge: null },
          { label: "Repairs", sub: `${openIssues} open issue${openIssues !== 1 ? "s" : ""}`, icon: "build", href: "/demo/owner/repairs", badge: openIssues > 0 ? String(openIssues) : null },
          { label: "Tenants", sub: DEMO_TENANT.name, icon: "group", href: "/demo/owner/tenants", badge: null },
          { label: "Messages", sub: `${unreadMessages} unread`, icon: "chat", href: "/demo/owner/messages", badge: unreadMessages > 0 ? String(unreadMessages) : null },
        ].map(q => (
          <Link
            key={q.href}
            href={q.href}
            style={{
              background: WHITE,
              border: `1px solid ${BORDER}`,
              borderRadius: "16px",
              padding: "16px",
              textDecoration: "none",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              position: "relative",
              boxShadow: CARD_SHADOW,
            }}
          >
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

      {/* Property card */}
      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, marginBottom: "10px" }}>
        Your property
      </p>
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: "16px", padding: "20px", boxShadow: CARD_SHADOW }}>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "16px", fontWeight: 700, color: NAVY, marginBottom: "2px" }}>{DEMO_PROPERTY.address}</p>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: MUTED, marginBottom: "16px" }}>{DEMO_PROPERTY.city}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
          {[
            { label: "Type", value: DEMO_PROPERTY.type },
            { label: "Bedrooms", value: `${DEMO_PROPERTY.bedrooms} bed / ${DEMO_PROPERTY.bathrooms} bath` },
            { label: "Size", value: `${DEMO_PROPERTY.sqft.toLocaleString()} sq ft` },
          ].map(d => (
            <div key={d.label}>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "10px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: "4px" }}>{d.label}</p>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: NAVY, fontWeight: 600 }}>{d.value}</p>
            </div>
          ))}
        </div>
      </div>
    </DemoShell>
  );
}
