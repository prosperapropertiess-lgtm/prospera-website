"use client";

import { useState } from "react";
import Link from "next/link";

// ── Constants ──────────────────────────────────────────────────────────────

const NAVY = "#1F2F3A";
const BURGUNDY = "#8B2030";
const BG = "#F7F5F2";
const WHITE = "#FFFFFF";
const BORDER = "#D8D2C8";
const MUTED = "#666666";
const SUBTLE = "#333333";

// ── Types ──────────────────────────────────────────────────────────────────

interface Plan {
  id: "essentials" | "autopilot" | "handsfree";
  name: string;
  tagline: string;
  rate: string;
  badge?: string;
  colour: string;
  accentBg: string;
  description: string;
  includes: string[];
  bestFor: string;
  fees: {
    management: string;
    placement: string;
    onboarding: string;
    maintenanceMarkup: string;
  };
}

// ── Plan Data ──────────────────────────────────────────────────────────────

const PLANS: Plan[] = [
  {
    id: "essentials",
    name: "Minimum Essentials",
    tagline: "The landlord who wants control but not chaos.",
    rate: "7%",
    colour: NAVY,
    accentBg: "rgba(31,47,58,0.06)",
    description:
      "You stay involved. We handle the legal and compliance side — lease prep, rent collection, N4s — so the pieces that can get you in trouble are never left to chance. A dedicated property manager is still yours. You just keep your hand on the wheel.",
    includes: [
      "Dedicated named property manager — yours across every plan",
      "Qualified, screened tenant placed — or no placement fee charged",
      "Standard Ontario lease prepared and executed",
      "Rent collected and deposited to your account",
      "N4 issued when required — correctly, on time",
      "Annual rent increase calculated and delivered",
      "Online tenant portal so maintenance requests don't come to your phone",
    ],
    bestFor: "The nearby landlord who wants legal compliance handled but likes staying involved.",
    fees: {
      management: "7% of monthly rent collected",
      placement: "10% of first month's rent (one-time per tenancy)",
      onboarding: "$149.99 (one-time)",
      maintenanceMarkup: "18% coordination fee on vendor invoices",
    },
  },
  {
    id: "autopilot",
    name: "Autopilot",
    tagline: "The landlord who just wants to sleep through the night.",
    rate: "10%",
    badge: "Best Value",
    colour: BURGUNDY,
    accentBg: "rgba(139,32,48,0.06)",
    description:
      "The 2AM call is not yours anymore. The late-rent conversation isn't yours. The vendor coordination, the inspection, the renewal — none of it is yours. You own the asset. We run it completely. For 3% more than the base plan, the entire job is off your plate.",
    includes: [
      "Everything in Minimum Essentials",
      "Full maintenance coordination — vendor booked, supervised, invoiced",
      "24/7 emergency maintenance response (we take the call, not you)",
      "Move-in and move-out inspections documented with photos",
      "Bi-annual property inspections — proactive, not reactive",
      "Lease renewal negotiated and executed before it lapses",
      "Monthly owner statements delivered by the 10th, every month",
      "Expense tracking and year-end summary — ready for your accountant",
      "Maintenance markup: 10% (vs. 18% on Essentials)",
      "Onboarding fee: $99.99 (vs. $149.99 on Essentials)",
    ],
    bestFor: "The landlord who wants complete peace of mind for a 3% premium over the base plan.",
    fees: {
      management: "10% of monthly rent collected",
      placement: "10% of first month's rent (one-time per tenancy)",
      onboarding: "$99.99 (one-time)",
      maintenanceMarkup: "10% coordination fee on vendor invoices",
    },
  },
  {
    id: "handsfree",
    name: "Hands-Free",
    tagline: "Strategic oversight for the multi-property investor.",
    rate: "15%",
    colour: NAVY,
    accentBg: "rgba(31,47,58,0.06)",
    description:
      "Everything in Autopilot, plus quarterly portfolio strategy, capital project oversight, and proactive market rent analysis. Built for investors who want a strategic partner, not just a manager. No maintenance markup. No onboarding fee.",
    includes: [
      "Everything in Autopilot",
      "No maintenance markup — vendor costs passed through at cost",
      "Onboarding fee waived",
      "Quarterly portfolio strategy sessions",
      "Renovation and capital project management overseen end-to-end",
      "Proactive market rent analysis — never underpriced",
      "Tax-ready expense reports with receipts attached",
      "Priority response across all communications",
    ],
    bestFor: "The multi-property investor who wants strategic advisory on top of full management.",
    fees: {
      management: "15% of monthly rent collected",
      placement: "10% of first month's rent (one-time per tenancy)",
      onboarding: "Waived",
      maintenanceMarkup: "No markup — vendor costs passed through at cost",
    },
  },
];

// ── Persona Data ──────────────────────────────────────────────────────────

const PERSONAS = [
  {
    id: "reluctant",
    label: "The Reluctant Landlord",
    icon: "🏠",
    description: "You inherited a property, moved away, or got stuck with a second unit. You didn't sign up to be a landlord.",
    recommendation: "autopilot" as const,
    reason: "Autopilot handles everything that surprises you: the 2AM call, the late rent, the lease renewal you forgot.",
  },
  {
    id: "investor",
    label: "The Investor",
    icon: "📊",
    description: "You own multiple properties. Your time is worth more than any management fee.",
    recommendation: "handsfree" as const,
    reason: "Hands-Free gives you one point of contact, quarterly strategy, and portfolio visibility — across every property.",
  },
  {
    id: "nearbyowner",
    label: "The Nearby Owner",
    icon: "🔑",
    description: "You live close. You want to stay involved and handle some things yourself.",
    recommendation: "essentials" as const,
    reason: "Minimum Essentials handles the legal and compliance pieces you shouldn't be doing yourself, without removing your control.",
  },
  {
    id: "firsttime",
    label: "The First-Timer",
    icon: "📋",
    description: "This is your first rental. You don't know what you don't know.",
    recommendation: "autopilot" as const,
    reason: "Autopilot covers the pieces that catch first-timers off guard: maintenance, inspections, and LTB filings.",
  },
];

const PLAN_LABEL: Record<string, string> = {
  essentials: "Minimum Essentials",
  autopilot: "Autopilot",
  handsfree: "Hands-Free",
};

// ── Plan Card ─────────────────────────────────────────────────────────────

function PlanCard({ plan, highlighted }: { plan: Plan; highlighted?: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      id={`plan-${plan.id}`}
      style={{
        background: WHITE,
        border: `1px solid ${highlighted ? plan.colour : BORDER}`,
        borderTop: `4px solid ${plan.colour}`,
        borderRadius: "20px",
        padding: "40px 32px 32px",
        position: "relative",
        boxShadow: highlighted
          ? "0 12px 40px rgba(0,0,0,0.12)"
          : "0 1px 4px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {plan.badge && (
        <div
          style={{
            position: "absolute",
            top: "-14px",
            left: "50%",
            transform: "translateX(-50%)",
            background: BURGUNDY,
            color: "#FAF8F5",
            fontSize: "11px",
            fontFamily: "var(--font-dm-sans)",
            fontWeight: 700,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            padding: "4px 18px",
            borderRadius: "20px",
            whiteSpace: "nowrap",
          }}
        >
          {plan.badge}
        </div>
      )}

      {/* Rate — large and dominant */}
      <div style={{ marginBottom: "8px" }}>
        <span
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(64px, 8vw, 80px)",
            fontWeight: 700,
            color: plan.colour,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            display: "block",
          }}
        >
          {plan.rate}
        </span>
        <span
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "13px",
            color: MUTED,
            marginTop: "4px",
            display: "block",
          }}
        >
          of monthly rent collected
        </span>
      </div>

      {/* Name */}
      <h3
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "clamp(24px, 3vw, 30px)",
          fontWeight: 700,
          color: NAVY,
          marginBottom: "6px",
          marginTop: "16px",
          letterSpacing: "-0.01em",
        }}
      >
        {plan.name}
      </h3>

      {/* Description */}
      <p
        style={{
          fontFamily: "var(--font-dm-sans)",
          fontSize: "15px",
          color: SUBTLE,
          lineHeight: 1.7,
          marginBottom: "28px",
        }}
      >
        {plan.description}
      </p>

      {/* Best For */}
      <div
        style={{
          background: plan.accentBg,
          borderLeft: `3px solid ${plan.colour}`,
          borderRadius: "8px",
          padding: "12px 16px",
          marginBottom: "28px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "13px",
            color: SUBTLE,
            fontStyle: "italic",
          }}
        >
          {plan.bestFor}
        </p>
      </div>

      {/* What's included */}
      <p
        style={{
          fontFamily: "var(--font-dm-sans)",
          fontSize: "11px",
          color: MUTED,
          textTransform: "uppercase",
          letterSpacing: "0.10em",
          fontWeight: 700,
          marginBottom: "12px",
        }}
      >
        What's included
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: "24px" }}>
        {plan.includes.map((item) => (
          <li
            key={item}
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "14px",
              color: SUBTLE,
              padding: "8px 0",
              borderBottom: `1px solid ${BORDER}`,
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              lineHeight: 1.5,
            }}
          >
            <span
              style={{ color: plan.colour, fontWeight: 700, flexShrink: 0, marginTop: "1px" }}
            >
              ✓
            </span>
            {item}
          </li>
        ))}
      </ul>

      {/* Fee disclosure toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: "var(--font-dm-sans)",
          fontSize: "13px",
          color: plan.colour,
          fontWeight: 600,
          padding: "0",
          marginBottom: "0",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          textAlign: "left",
        }}
      >
        {expanded ? "Hide fee breakdown ↑" : "See all fees ↓"}
      </button>

      {expanded && (
        <div
          style={{
            marginTop: "16px",
            background: BG,
            border: `1px solid ${BORDER}`,
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "11px",
              color: MUTED,
              textTransform: "uppercase",
              letterSpacing: "0.10em",
              fontWeight: 700,
              marginBottom: "12px",
            }}
          >
            Full fee breakdown
          </p>
          {[
            { label: "Management", value: plan.fees.management },
            { label: "Placement", value: plan.fees.placement },
            { label: "Onboarding", value: plan.fees.onboarding },
            { label: "Maintenance coordination", value: plan.fees.maintenanceMarkup },
          ].map((fee) => (
            <div
              key={fee.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                padding: "8px 0",
                borderBottom: `1px solid ${BORDER}`,
                gap: "12px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "13px",
                  color: MUTED,
                  flexShrink: 0,
                }}
              >
                {fee.label}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "13px",
                  color: SUBTLE,
                  fontWeight: 600,
                  textAlign: "right",
                }}
              >
                {fee.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <div style={{ marginTop: "28px" }}>
        <Link
          href="/contact"
          style={{
            display: "block",
            textAlign: "center",
            background: plan.colour,
            color: "#FAF8F5",
            fontFamily: "var(--font-dm-sans)",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            textDecoration: "none",
            padding: "18px 24px",
            borderRadius: "10px",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Get started with {plan.name}
        </Link>
      </div>
    </div>
  );
}

// ── Persona Selector ──────────────────────────────────────────────────────

export function PersonaSelector() {
  const [selected, setSelected] = useState<string | null>(null);

  const recommendation = selected
    ? PERSONAS.find((p) => p.id === selected)
    : null;

  const scrollToPlan = (planId: string) => {
    const el = document.getElementById(`plan-${planId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(selected === p.id ? null : p.id)}
            style={{
              background: selected === p.id ? NAVY : WHITE,
              border: `1px solid ${selected === p.id ? NAVY : BORDER}`,
              borderRadius: "14px",
              padding: "20px 18px",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.18s",
            }}
          >
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>{p.icon}</div>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "14px",
                fontWeight: 700,
                color: selected === p.id ? "#FAF8F5" : NAVY,
                marginBottom: "6px",
              }}
            >
              {p.label}
            </p>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "13px",
                color: selected === p.id ? "rgba(250,248,245,0.75)" : MUTED,
                lineHeight: 1.5,
              }}
            >
              {p.description}
            </p>
          </button>
        ))}
      </div>

      {recommendation && (
        <div
          style={{
            background: WHITE,
            border: `1px solid ${BORDER}`,
            borderLeft: `4px solid ${BURGUNDY}`,
            borderRadius: "14px",
            padding: "24px 28px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "11px",
                color: MUTED,
                textTransform: "uppercase",
                letterSpacing: "0.10em",
                fontWeight: 700,
                marginBottom: "6px",
              }}
            >
              Our recommendation
            </p>
            <p
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(22px, 3vw, 28px)",
                fontWeight: 700,
                color: NAVY,
                marginBottom: "6px",
              }}
            >
              {PLAN_LABEL[recommendation.recommendation]}
            </p>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "14px",
                color: SUBTLE,
                maxWidth: "480px",
                lineHeight: 1.6,
              }}
            >
              {recommendation.reason}
            </p>
          </div>
          <button
            onClick={() => scrollToPlan(recommendation.recommendation)}
            style={{
              background: BURGUNDY,
              color: "#FAF8F5",
              border: "none",
              borderRadius: "10px",
              padding: "14px 24px",
              fontFamily: "var(--font-dm-sans)",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            See this plan →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Plans Grid ────────────────────────────────────────────────────────────

export function PlansGrid() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "28px",
        alignItems: "stretch",
      }}
    >
      {PLANS.map((plan) => (
        <PlanCard key={plan.id} plan={plan} highlighted={plan.id === "autopilot"} />
      ))}
    </div>
  );
}

// ── Comparison Table (mobile-scrollable) ──────────────────────────────────

const COMPARE_ROWS: Array<{
  feature: string;
  essentials: boolean | string;
  autopilot: boolean | string;
  handsfree: boolean | string;
  isText?: boolean;
}> = [
  { feature: "Onboarding fee", essentials: "$149.99", autopilot: "$99.99", handsfree: "Waived", isText: true },
  { feature: "Management rate", essentials: "7%", autopilot: "10%", handsfree: "15%", isText: true },
  { feature: "Placement fee", essentials: "10%", autopilot: "10%", handsfree: "10%", isText: true },
  { feature: "Maintenance markup", essentials: "18%", autopilot: "10%", handsfree: "None", isText: true },
  { feature: "Dedicated named property manager", essentials: true, autopilot: true, handsfree: true },
  { feature: "Tenant screening & placement", essentials: true, autopilot: true, handsfree: true },
  { feature: "Standard Ontario lease preparation", essentials: true, autopilot: true, handsfree: true },
  { feature: "Rent collection & owner disbursement", essentials: true, autopilot: true, handsfree: true },
  { feature: "Online tenant portal", essentials: true, autopilot: true, handsfree: true },
  { feature: "N4 / LTB form preparation", essentials: true, autopilot: true, handsfree: true },
  { feature: "Annual rent increase calculation", essentials: true, autopilot: true, handsfree: true },
  { feature: "Owner dashboard & monthly statements", essentials: false, autopilot: true, handsfree: true },
  { feature: "Maintenance coordination", essentials: false, autopilot: true, handsfree: true },
  { feature: "24/7 emergency maintenance response", essentials: false, autopilot: true, handsfree: true },
  { feature: "Move-in & move-out inspections", essentials: false, autopilot: true, handsfree: true },
  { feature: "Bi-annual property inspections", essentials: false, autopilot: true, handsfree: true },
  { feature: "Lease renewal coordination", essentials: false, autopilot: true, handsfree: true },
  { feature: "Vendor management", essentials: false, autopilot: true, handsfree: true },
  { feature: "Expense tracking & year-end summary", essentials: false, autopilot: true, handsfree: true },
  { feature: "Renovation & capital project management", essentials: false, autopilot: false, handsfree: true },
  { feature: "Portfolio strategy sessions (quarterly)", essentials: false, autopilot: false, handsfree: true },
  { feature: "Market rent analysis & optimization", essentials: false, autopilot: false, handsfree: true },
  { feature: "Tax-ready reports with receipts", essentials: false, autopilot: false, handsfree: true },
  { feature: "Priority response on all communications", essentials: false, autopilot: false, handsfree: true },
];

export function ComparisonTable() {
  return (
    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      <table
        style={{
          width: "100%",
          minWidth: "560px",
          borderCollapse: "collapse",
          fontFamily: "var(--font-dm-sans)",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                textAlign: "left",
                padding: "14px 16px",
                fontSize: "12px",
                color: MUTED,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                borderBottom: `2px solid ${BORDER}`,
                background: BG,
              }}
            >
              Feature
            </th>
            {[
              { key: "essentials", label: "Essentials", rate: "7%" },
              { key: "autopilot", label: "Autopilot", rate: "10%", highlight: true },
              { key: "handsfree", label: "Hands-Free", rate: "15%" },
            ].map((col) => (
              <th
                key={col.key}
                style={{
                  textAlign: "center",
                  padding: "14px 12px",
                  fontSize: "13px",
                  color: col.highlight ? BURGUNDY : NAVY,
                  fontWeight: 700,
                  borderBottom: `2px solid ${col.highlight ? BURGUNDY : BORDER}`,
                  background: col.highlight ? "rgba(139,32,48,0.04)" : BG,
                  whiteSpace: "nowrap",
                }}
              >
                {col.label}
                <br />
                <span style={{ fontSize: "11px", color: MUTED, fontWeight: 400 }}>{col.rate}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPARE_ROWS.map((row, i) => (
            <tr key={row.feature} style={{ background: i % 2 === 0 ? WHITE : BG }}>
              <td
                style={{
                  padding: "12px 16px",
                  fontSize: "14px",
                  color: SUBTLE,
                  borderBottom: `1px solid ${BORDER}`,
                  fontWeight: row.isText ? 600 : 400,
                }}
              >
                {row.feature}
              </td>
              {(["essentials", "autopilot", "handsfree"] as const).map((col) => (
                <td
                  key={col}
                  style={{
                    textAlign: "center",
                    padding: "12px 12px",
                    borderBottom: `1px solid ${BORDER}`,
                    background: col === "autopilot" ? "rgba(139,32,48,0.04)" : undefined,
                    fontSize: row.isText ? "13px" : "18px",
                    fontWeight: row.isText ? 600 : 400,
                    color: row.isText ? SUBTLE : undefined,
                  }}
                >
                  {row.isText ? (
                    <span>{row[col] as string}</span>
                  ) : row[col] ? (
                    <span style={{ color: col === "autopilot" ? BURGUNDY : "#2E7D32" }}>✓</span>
                  ) : (
                    <span style={{ color: BORDER }}>–</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Guarantee Accordion ───────────────────────────────────────────────────

const GUARANTEES = [
  {
    number: "№1",
    title: "Placement Guarantee",
    headline: "Qualified tenant placed within 21 days — or no placement fee.",
    detail:
      "If we don't place a qualified, screened tenant within 21 days of your unit being market-ready, our placement fee is waived entirely. We define market-ready as vacant, clean, and priced within 5% of our recommended market rate.",
  },
  {
    number: "№2",
    title: "Transparency Guarantee",
    headline: "Every fee disclosed upfront. No surprises on your statement.",
    detail:
      "Our fee structure is printed on every plan: management rate, placement fee (10% of first month's rent), onboarding fee (by plan), and maintenance coordination markup (18% on Essentials, 10% on Autopilot, none on Hands-Free). These numbers don't change. You'll see every transaction itemized before it posts.",
  },
  {
    number: "№3",
    title: "Response Guarantee",
    headline: "Tenant repair requests acknowledged within 4 business hours.",
    detail:
      "On Autopilot and Hands-Free plans, every maintenance request gets a written acknowledgement within 4 business hours, and a resolution path communicated within 24 hours. If we miss that window, we credit $50 to your next statement.",
  },
  {
    number: "№4",
    title: "Statement Guarantee",
    headline: "Statements delivered by the 10th of every month.",
    detail:
      "Your monthly statement — including rent disbursement, expense breakdown, and maintenance summary — hits your inbox by the 10th of every month. If it's late, we credit $25 to your account.",
  },
  {
    number: "№5",
    title: "Exit Guarantee",
    headline: "No lock-in. Leave with 30 days written notice.",
    detail:
      "We don't believe in holding clients captive. If you're not satisfied, provide 30 days written notice and we'll execute a clean transition: all files, keys, and deposit information transferred to you or your new manager.",
  },
  {
    number: "№6",
    title: "Owner's Satisfaction Guarantee",
    headline: "Not satisfied in 90 days? Every single penny of our fees, refunded.",
    detail:
      "This is the overarching guarantee. Try Prospera for 90 days. If we are not delivering in a way we cannot resolve, we will refund every penny of our management fees from your first 90 days — no conditions, no negotiation, no fine print. You should trust who you hand your property to. This is how we earn that trust.",
  },
];

export function GuaranteeAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div>
      {GUARANTEES.map((g, i) => (
        <div
          key={g.number}
          style={{
            borderBottom: `1px solid ${BORDER}`,
          }}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: "100%",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "20px 0",
              display: "flex",
              alignItems: "flex-start",
              gap: "16px",
              textAlign: "left",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "18px",
                fontWeight: 700,
                color: BURGUNDY,
                flexShrink: 0,
                minWidth: "36px",
              }}
            >
              {g.number}
            </span>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "11px",
                  color: MUTED,
                  textTransform: "uppercase",
                  letterSpacing: "0.10em",
                  fontWeight: 700,
                  marginBottom: "4px",
                }}
              >
                {g.title}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "15px",
                  fontWeight: 600,
                  color: NAVY,
                  lineHeight: 1.5,
                }}
              >
                {g.headline}
              </p>
            </div>
            <span
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "18px",
                color: MUTED,
                flexShrink: 0,
                marginTop: "2px",
                transition: "transform 0.2s",
                display: "inline-block",
                transform: open === i ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              ↓
            </span>
          </button>

          {open === i && (
            <div
              style={{
                padding: "0 0 20px 52px",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "14px",
                  color: SUBTLE,
                  lineHeight: 1.7,
                }}
              >
                {g.detail}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
