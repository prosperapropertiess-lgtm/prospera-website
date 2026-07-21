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
  rate: string;
  badge?: string;
  colour: string;
  accentBg: string;
  description: string;
  includes: string[];
  includesExtra?: string[]; // secondary group (e.g. "Autopilot adds")
  includesExtraLabel?: string;
  bestFor: string;
  fees: {
    management: string;
    placement: string;
    placementWarranty: string;
    onboarding: string;
    maintenanceMarkup: string;
  };
  nonPaymentPolicy?: {
    supportRate: string;
    weStillDo: string[];
    ltbNote: string;
    returnNote: string;
  };
}

// ── Plan Data ──────────────────────────────────────────────────────────────

const PLANS: Plan[] = [
  {
    id: "essentials",
    name: "Minimum Essentials",
    rate: "7%",
    colour: NAVY,
    accentBg: "rgba(31,47,58,0.06)",
    description:
      "You stay involved. We handle the money and the legal paperwork — rent collection, N4s, lease prep — so the pieces that can get you in trouble are never left to chance. Your dedicated property manager is still yours. You just keep your hand on the wheel.",
    includes: [
      "Dedicated named property manager — yours on every plan",
      "Tenant portal + Owner dashboard — access on every plan",
      "Automated rent collection, multiple methods, direct payout to you",
      "Monthly owner statement + year-end tax summary",
      "Last month's deposit (LMR) held and tracked",
      "Standard Ontario lease prepared and executed",
      "Annual rent increase calculated and filed (N1)",
      "Reactive maintenance coordination — vetted trades network",
      "Document vault — all leases, notices, records in one place",
    ],
    bestFor: "The nearby owner who wants compliance handled but stays hands-on.",
    fees: {
      management: "7% of monthly rent collected",
      placement: "100% of first month's rent",
      placementWarranty: "90-day replacement warranty",
      onboarding: "$149.99 (one-time)",
      maintenanceMarkup: "18% coordination fee — still typically below market rate",
    },
  },
  {
    id: "autopilot",
    name: "Autopilot",
    rate: "10%",
    badge: "Best Value",
    colour: BURGUNDY,
    accentBg: "rgba(139,32,48,0.06)",
    description:
      "The 2AM call is not yours. The late-rent conversation isn't yours. We handle lawn, snow, utilities, and maintenance — and we catch the $150 problem before it's a $4,000 one. You own the asset. We run it.",
    includes: [
      "Dedicated named property manager — yours on every plan",
      "Tenant portal + Owner dashboard — access on every plan",
      "Automated rent collection, direct payout, monthly owner statement",
      "Last month's deposit held and tracked",
      "Standard Ontario lease prepared and executed",
      "Annual rent increase calculated and filed (N1)",
      "Reactive maintenance coordination — vetted trades network",
      "Document vault",
    ],
    includesExtraLabel: "Autopilot adds",
    includesExtra: [
      "100% hands-free — tenants call us, never you",
      "Lawn care + snow removal — coordinated end-to-end (vendor cost is yours, never a surprise)",
      "Utility transfers at turnover + free utility transition concierge (you never eat an overlap bill)",
      "Preventive maintenance calendar — furnace, AC, gutters, smoke/CO on schedule",
      "Bi-annual inspections + photo condition reports (every 6 months)",
      "AI-assisted triage → priority contractor dispatch (your jobs jump the queue)",
      "24/7 emergency line — we take the call, not you",
      "Annual video walkthrough sent to your phone",
      "Move-in and move-out condition documentation",
      "Monthly care report — what we checked, caught, and coordinated",
      "Statements by the 10th every month",
      "Tenant relationship management and renewal strategy",
      "Annual rent benchmarking",
    ],
    bestFor: "The landlord who wants complete peace of mind for 3% more than the base plan.",
    fees: {
      management: "10% of monthly rent collected",
      placement: "50% of first month's rent",
      placementWarranty: "6-month replacement warranty",
      onboarding: "$99.99 (one-time)",
      maintenanceMarkup: "10% coordination fee — still typically below market rate",
    },
    nonPaymentPolicy: {
      supportRate: "$99/month",
      weStillDo: [
        "Serve the N4 — the official notice that rent is late",
        "Serve the N8 — notice to terminate at the end of the lease",
        "Prepare the L1 application to file with the LTB",
      ],
      ltbNote: "Once the L1 is ready, the next steps are yours. You can file it yourself or hire a legal representative. We hand you everything you need, organized and ready to go.",
      returnNote: "Once your tenant is paying normally again, your plan goes back to the regular 10% fee.",
    },
  },
  {
    id: "handsfree",
    name: "Hands-Free",
    rate: "15%",
    colour: NAVY,
    accentBg: "rgba(31,47,58,0.06)",
    description:
      "Everything in Autopilot, plus full LTB legal coverage, Rent Shield (we cover up to 60 days if a tenant stops paying), portfolio strategy sessions with a dedicated mortgage agent, and end-to-end eviction support including sheriff coordination. Built for the investor who never wants to think about the building.",
    includes: [
      "Everything in Autopilot",
      "Full LTB legal coverage — N4/N5/N12 prep, filing, and hearing representation",
      "End-to-end eviction management if it comes to that",
      "Rent Shield — if a Prospera-placed tenant stops paying, we cover your rent up to 60 days",
      "Quarterly portfolio strategy sessions with a dedicated mortgage agent",
      "Annual performance review — rent optimization, market analysis, capex planning",
      "Renovation and capital project management overseen end-to-end",
      "Quarterly interior inspections (vs. bi-annual on Autopilot)",
      "1-hour emergency response SLA",
      "Free lease renewals — no charge, ever",
      "Premium marketing: professional video walkthrough to attract quality tenants",
      "Fire-safety and licensing liaison",
      "Insurance claims support",
      "No maintenance markup — vendor costs passed through at exact cost",
      "Onboarding fee: waived",
      "Placement fee: 25% of first month's rent with 12-month replacement warranty",
    ],
    bestFor: "The multi-property investor who wants legal coverage and never thinks about the building.",
    fees: {
      management: "15% of monthly rent collected",
      placement: "25% of first month's rent",
      placementWarranty: "12-month replacement warranty",
      onboarding: "Waived",
      maintenanceMarkup: "No markup — vendor costs at exact cost",
    },
    nonPaymentPolicy: {
      supportRate: "$149/month",
      weStillDo: [
        "Serve all required notices — N4, N8, and any others needed",
        "Prepare and file the L1 application with the LTB",
        "Manage the LTB hearing process start to finish",
        "Coordinate the eviction and work with the sheriff if it comes to that",
        "Pursue arrears recovery through Small Claims Court if you choose — subject to a percentage of arrears successfully collected",
      ],
      ltbNote: "You do not have to show up, make calls, or deal with the process at all. We handle it. If you choose to pursue what you are owed through Small Claims Court, we can coordinate that too — we only take a cut if we actually recover the money.",
      returnNote: "Once your tenant is paying normally again, your plan goes back to the regular 15% fee.",
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
    reason: "Autopilot handles everything that surprises you: the 2AM call, the late rent, the lawn, the snow, the lease renewal you forgot.",
  },
  {
    id: "investor",
    label: "The Investor",
    icon: "📊",
    description: "You own multiple properties. Your time is worth more than any management fee.",
    recommendation: "handsfree" as const,
    reason: "Hands-Free gives you legal coverage, a mortgage agent for portfolio strategy, Rent Shield, and a team that never calls you.",
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
    reason: "Autopilot covers every piece that catches first-timers off guard: maintenance, inspections, LTB filings, and the 2AM call.",
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

      {/* Rate */}
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
        {plan.includesExtraLabel ? "Core features" : "What\u2019s included"}
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: plan.includesExtra ? "0" : "24px" }}>
        {plan.includes.map((item) => (
          <li
            key={item}
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "14px",
              color: SUBTLE,
              padding: "7px 0",
              borderBottom: `1px solid ${BORDER}`,
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              lineHeight: 1.5,
            }}
          >
            <span style={{ color: plan.colour, fontWeight: 700, flexShrink: 0, marginTop: "1px" }}>✓</span>
            {item}
          </li>
        ))}
      </ul>

      {/* Autopilot / extra group */}
      {plan.includesExtra && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              margin: "20px 0 12px",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: BORDER }} />
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "11px",
                color: plan.colour,
                textTransform: "uppercase",
                letterSpacing: "0.10em",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {plan.includesExtraLabel}
            </p>
            <div style={{ flex: 1, height: "1px", background: BORDER }} />
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: "24px" }}>
            {plan.includesExtra.map((item) => (
              <li
                key={item}
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "14px",
                  color: SUBTLE,
                  padding: "7px 0",
                  borderBottom: `1px solid ${BORDER}`,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  lineHeight: 1.5,
                }}
              >
                <span style={{ color: plan.colour, fontWeight: 700, flexShrink: 0, marginTop: "1px" }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Non-payment policy */}
      {plan.nonPaymentPolicy && (
        <div
          style={{
            background: "rgba(31,47,58,0.04)",
            border: "1px solid rgba(31,47,58,0.10)",
            borderLeft: `3px solid ${NAVY}`,
            borderRadius: "12px",
            padding: "20px 20px 18px",
            marginBottom: "20px",
          }}
        >
          <p style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.10em",
            color: MUTED,
            marginBottom: "10px",
          }}>
            What happens if your tenant stops paying rent?
          </p>
          <p style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "14px",
            color: SUBTLE,
            lineHeight: 1.7,
            marginBottom: "12px",
          }}>
            Your plan changes to a support rate of <strong style={{ color: NAVY }}>{plan.nonPaymentPolicy.supportRate} / month</strong> while the issue is being resolved. We do not leave you alone.
          </p>
          <p style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: MUTED,
            marginBottom: "8px",
          }}>
            During this time, we still:
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 14px" }}>
            {plan.nonPaymentPolicy.weStillDo.map((item) => (
              <li key={item} style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "14px",
                color: SUBTLE,
                padding: "5px 0",
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                lineHeight: 1.5,
              }}>
                <span style={{ color: NAVY, fontWeight: 700, flexShrink: 0 }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
          <p style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "13px",
            color: SUBTLE,
            lineHeight: 1.65,
            marginBottom: "10px",
            padding: "12px 14px",
            background: "#FFFFFF",
            borderRadius: "8px",
            border: `1px solid ${BORDER}`,
          }}>
            {plan.nonPaymentPolicy.ltbNote}
          </p>
          <p style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "13px",
            color: MUTED,
            lineHeight: 1.6,
            fontStyle: "italic",
          }}>
            {plan.nonPaymentPolicy.returnNote}
          </p>
        </div>
      )}

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
            { label: "Placement fee", value: plan.fees.placement },
            { label: "Placement warranty", value: plan.fees.placementWarranty },
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
              <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: MUTED, flexShrink: 0 }}>
                {fee.label}
              </span>
              <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: SUBTLE, fontWeight: 600, textAlign: "right" }}>
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

  const recommendation = selected ? PERSONAS.find((p) => p.id === selected) : null;

  const scrollToPlan = (planId: string) => {
    const el = document.getElementById(`plan-${planId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(selected === p.id ? null : p.id)}
            style={{
              background: selected === p.id ? NAVY : WHITE,
              border: `2px solid ${selected === p.id ? NAVY : BORDER}`,
              borderRadius: "14px",
              padding: "16px 12px",
              cursor: "pointer",
              textAlign: "center",
              transition: "all 0.18s",
            }}
          >
            <div style={{ fontSize: "22px", marginBottom: "8px" }}>{p.icon}</div>
            <p style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "12px",
              fontWeight: 700,
              color: selected === p.id ? "#FAF8F5" : NAVY,
              lineHeight: 1.3,
            }}>
              {p.label}
            </p>
          </button>
        ))}
      </div>

      {/* Description of selected persona */}
      {selected && !recommendation && null}
      {recommendation && (
        <div
          style={{
            background: BG,
            border: `1px solid ${BORDER}`,
            borderRadius: "12px",
            padding: "14px 18px",
            marginBottom: "16px",
          }}
        >
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: SUBTLE, lineHeight: 1.5 }}>
            {PERSONAS.find(p => p.id === selected)?.description}
          </p>
        </div>
      )}

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
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, marginBottom: "6px" }}>
              Our recommendation
            </p>
            <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 700, color: NAVY, marginBottom: "6px" }}>
              {PLAN_LABEL[recommendation.recommendation]}
            </p>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: SUBTLE, maxWidth: "480px", lineHeight: 1.6 }}>
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
            }}
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

// ── Comparison Table ──────────────────────────────────────────────────────

const COMPARE_ROWS: Array<{
  feature: string;
  essentials: boolean | string;
  autopilot: boolean | string;
  handsfree: boolean | string;
  isText?: boolean;
}> = [
  { feature: "Onboarding fee", essentials: "$149.99", autopilot: "$99.99", handsfree: "Waived", isText: true },
  { feature: "Management rate", essentials: "7%", autopilot: "10%", handsfree: "15%", isText: true },
  { feature: "Placement fee", essentials: "100% of 1st month", autopilot: "50% of 1st month", handsfree: "25% of 1st month", isText: true },
  { feature: "Placement warranty", essentials: "90 days", autopilot: "6 months", handsfree: "12 months", isText: true },
  { feature: "Maintenance markup", essentials: "18%", autopilot: "10%", handsfree: "None", isText: true },
  { feature: "Dedicated named property manager", essentials: true, autopilot: true, handsfree: true },
  { feature: "Automated rent collection", essentials: true, autopilot: true, handsfree: true },
  { feature: "Monthly owner statements", essentials: true, autopilot: true, handsfree: true },
  { feature: "Year-end tax summary", essentials: true, autopilot: true, handsfree: true },
  { feature: "N4 / LTB form preparation", essentials: true, autopilot: true, handsfree: true },
  { feature: "Standard Ontario lease", essentials: true, autopilot: true, handsfree: true },
  { feature: "Annual rent increase (N1)", essentials: true, autopilot: true, handsfree: true },
  { feature: "Tenant portal + Owner dashboard", essentials: true, autopilot: true, handsfree: true },
  { feature: "Document vault", essentials: true, autopilot: true, handsfree: true },
  { feature: "Lawn care + snow removal coordination", essentials: false, autopilot: true, handsfree: true },
  { feature: "Utility transfer & bill management", essentials: false, autopilot: true, handsfree: true },
  { feature: "Preventive maintenance calendar", essentials: false, autopilot: true, handsfree: true },
  { feature: "Priority contractor dispatch", essentials: false, autopilot: true, handsfree: true },
  { feature: "24/7 emergency line", essentials: false, autopilot: true, handsfree: true },
  { feature: "Bi-annual inspections (every 6 months)", essentials: false, autopilot: true, handsfree: false },
  { feature: "Quarterly inspections (4x per year)", essentials: false, autopilot: false, handsfree: true },
  { feature: "Move-in / move-out documentation", essentials: false, autopilot: true, handsfree: true },
  { feature: "Monthly care report", essentials: false, autopilot: true, handsfree: true },
  { feature: "Real-time owner dashboard", essentials: true, autopilot: true, handsfree: true },
  { feature: "Expense tracking + year-end summary", essentials: false, autopilot: true, handsfree: true },
  { feature: "Lease renewal coordination", essentials: false, autopilot: true, handsfree: true },
  { feature: "Free lease renewals (forever)", essentials: false, autopilot: false, handsfree: true },
  { feature: "Annual rent benchmarking", essentials: false, autopilot: true, handsfree: true },
  { feature: "Full LTB legal coverage (N4/N5/N12)", essentials: false, autopilot: false, handsfree: true },
  { feature: "End-to-end eviction management", essentials: false, autopilot: false, handsfree: true },
  { feature: "Rent Shield — up to 60 days rent covered", essentials: false, autopilot: false, handsfree: true },
  { feature: "Portfolio strategy with mortgage agent", essentials: false, autopilot: false, handsfree: true },
  { feature: "Renovation & capex project management", essentials: false, autopilot: false, handsfree: true },
  { feature: "Premium video marketing", essentials: false, autopilot: false, handsfree: true },
];

export function ComparisonTable() {
  return (
    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      <table
        style={{
          width: "100%",
          minWidth: "600px",
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
                position: "sticky",
                left: 0,
                zIndex: 2,
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
                  fontSize: "13px",
                  color: SUBTLE,
                  borderBottom: `1px solid ${BORDER}`,
                  fontWeight: row.isText ? 600 : 400,
                  position: "sticky",
                  left: 0,
                  background: i % 2 === 0 ? WHITE : BG,
                  zIndex: 1,
                  maxWidth: "160px",
                  minWidth: "120px",
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
                    fontSize: row.isText ? "12px" : "18px",
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
    title: "21-Day Placement Guarantee",
    headline: "Qualified tenant placed within 21 days — or your placement fee is waived entirely.",
    detail:
      "When your property passes our rent-ready checklist and is listed at our recommended market rent, we will source, screen, and place a qualified tenant within 21 days of marketing going live. If we miss that window, you pay $0 for placement. Clock starts the day marketing goes live.",
  },
  {
    number: "№2",
    title: "24-Hour N4 Enforcement Guarantee",
    headline: "Rent unpaid by day 1? N4 served within 24 hours. Or that month's fee is free.",
    detail:
      "On Autopilot and Hands-Free plans, if rent hasn't cleared by the first business day of the month, we serve the official N4 notice within 24 hours — starting the legal clock immediately, every time. Verified payments in processing pause the clock so a paying tenant is never served in error. Miss our window? That month's management fee is credited in full.",
  },
  {
    number: "№3",
    title: "60-Minute Emergency Dispatch Guarantee",
    headline: "Burst pipe at 2AM? Contractor dispatched within 60 minutes. Or that month's fee is free.",
    detail:
      "On Autopilot and Hands-Free plans, we answer, triage, and dispatch a contractor within 60 minutes of your tenant's emergency call — 24 hours a day, 365 days a year. Emergency means active threat to structure or habitability: flooding, no heat in winter, electrical hazard, or lockout with safety risk. If we miss the 60-minute window, that month's management fee is credited in full.",
  },
  {
    number: "№4",
    title: "Replacement Warranty",
    headline: "If our tenant leaves early, we find the next one free.",
    detail:
      "If a Prospera-placed tenant vacates or is evicted within the warranty window, the next placement is completely free. Essentials: 90-day warranty. Autopilot: 6-month warranty. Hands-Free: 12-month warranty. We stand behind every tenant we screen.",
  },
  {
    number: "№5",
    title: "Rent Shield — Hands-Free Only",
    headline: "If a tenant we placed stops paying, we cover your rent — up to 60 days.",
    detail:
      "On Hands-Free, if a Prospera-screened tenant stops paying after the N4 is served, we cover your rent from our own pocket — up to 60 days or $4,000 per tenancy, whichever comes first — while we run the enforcement process. Applies to tenants we sourced and approved. We only guarantee tenants we chose, because we stand behind our screening.",
  },
  {
    number: "🛡",
    title: "Owner's Satisfaction Guarantee",
    headline: "Not satisfied in 90 days? Every single penny of our fees, refunded.",
    detail:
      "Try Prospera for 90 days. If we are not delivering in a way we cannot resolve, we refund every penny of our management fees from that period. No conditions. No negotiation. No fine print. You should trust who you hand your property to — this is how we earn it.",
  },
];

export function GuaranteeAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div>
      {GUARANTEES.map((g, i) => (
        <div key={g.number} style={{ borderBottom: `1px solid ${BORDER}` }}>
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
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, marginBottom: "4px" }}>
                {g.title}
              </p>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "15px", fontWeight: 600, color: NAVY, lineHeight: 1.5 }}>
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
                display: "inline-block",
                transform: open === i ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            >
              ↓
            </span>
          </button>
          {open === i && (
            <div style={{ padding: "0 0 20px 52px" }}>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: SUBTLE, lineHeight: 1.7 }}>
                {g.detail}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
