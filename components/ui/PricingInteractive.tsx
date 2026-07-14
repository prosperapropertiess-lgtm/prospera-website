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
  bestFor: string;
  fees: {
    management: string;
    placement: string;
    placementWarranty: string;
    onboarding: string;
    maintenanceMarkup: string;
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
      "Automated rent collection, multiple methods, direct payout to you",
      "Monthly owner statement + year-end tax summary",
      "Late-rent follow-up and N4 notice preparation",
      "Last month's deposit (LMR) held and tracked",
      "Standard Ontario lease prepared and executed",
      "Annual rent increase calculated and filed (N1)",
      "Reactive maintenance coordination — vetted trades network",
      "Document vault — all leases, notices, records in one place",
      "Tenant portal — maintenance requests stay off your phone",
    ],
    bestFor: "The nearby owner who wants compliance covered but likes staying involved.",
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
      "The 2AM call is not yours anymore. The late-rent conversation isn't yours. Lawn, snow, utilities, maintenance, inspections, renewals — none of it is yours. You own the asset. We run it, completely. For 3% more than the base plan, the entire job is off your plate.",
    includes: [
      "Everything in Minimum Essentials",
      "100% hands-free management — tenants call us, never you",
      "Lawn care + snow removal — arranged and managed end-to-end",
      "Utility transfers handled at turnover; ongoing bill management",
      "Preventive maintenance calendar — furnace before winter, AC before summer, gutters + roof before fall, smoke/CO compliance",
      "Quarterly interior inspections + photo condition reports",
      "Periodic exterior property checks between visits",
      "Priority contractor dispatch — your jobs jump the queue",
      "24/7 emergency line — we take the call, not you",
      "Move-in and move-out condition documentation",
      "Proactive issue-catching — we flag wear before it becomes a repair",
      "Monthly care report — what we checked, caught, and coordinated",
      "Real-time owner dashboard + monthly statements by the 10th",
      "Expense tracking and year-end summary for your accountant",
      "Tenant relationship management → lower turnover → fewer placement fees",
      "Renewal strategy + annual rent benchmarking",
      "Placement fee: 50% of first month's rent (vs. 100% on Essentials)",
      "Onboarding fee: $99.99 (vs. $149.99 on Essentials)",
    ],
    bestFor: "The landlord who wants complete peace of mind for 3% more than the base plan.",
    fees: {
      management: "10% of monthly rent collected",
      placement: "50% of first month's rent",
      placementWarranty: "6-month replacement warranty",
      onboarding: "$99.99 (one-time)",
      maintenanceMarkup: "10% coordination fee — still typically below market rate",
    },
  },
  {
    id: "handsfree",
    name: "Hands-Free",
    rate: "15%",
    colour: NAVY,
    accentBg: "rgba(31,47,58,0.06)",
    description:
      "Everything in Autopilot, plus full LTB legal coverage, Rent Shield (we cover up to 60 days if a tenant stops paying), portfolio strategy sessions with a dedicated mortgage agent, and end-to-end eviction support. Built for the investor who never wants to think about the building.",
    includes: [
      "Everything in Autopilot",
      "Full LTB legal coverage — N4/N5/N12 prep, filing, and hearing representation",
      "End-to-end eviction management if it comes to that",
      "LTB filing fees + licensed paralegal costs covered (up to $2,500 per tenancy)",
      "Rent Shield — if a Prospera-placed tenant stops paying, we cover your rent up to 60 days",
      "Quarterly portfolio strategy sessions with a dedicated mortgage agent",
      "Annual performance review — rent optimization, market analysis, capex planning",
      "Renovation and capital project management overseen end-to-end",
      "Monthly interior inspections (vs. quarterly on Autopilot)",
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
        What&apos;s included
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
            <span style={{ color: plan.colour, fontWeight: 700, flexShrink: 0, marginTop: "1px" }}>✓</span>
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
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", fontWeight: 700, color: selected === p.id ? "#FAF8F5" : NAVY, marginBottom: "6px" }}>
              {p.label}
            </p>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: selected === p.id ? "rgba(250,248,245,0.75)" : MUTED, lineHeight: 1.5 }}>
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
  { feature: "Tenant portal", essentials: true, autopilot: true, handsfree: true },
  { feature: "Document vault", essentials: true, autopilot: true, handsfree: true },
  { feature: "Lawn care + snow removal", essentials: false, autopilot: true, handsfree: true },
  { feature: "Utility transfer & bill management", essentials: false, autopilot: true, handsfree: true },
  { feature: "Preventive maintenance calendar", essentials: false, autopilot: true, handsfree: true },
  { feature: "Priority contractor dispatch", essentials: false, autopilot: true, handsfree: true },
  { feature: "24/7 emergency line", essentials: false, autopilot: true, handsfree: true },
  { feature: "Quarterly interior inspections", essentials: false, autopilot: true, handsfree: false },
  { feature: "Monthly interior inspections", essentials: false, autopilot: false, handsfree: true },
  { feature: "Move-in / move-out documentation", essentials: false, autopilot: true, handsfree: true },
  { feature: "Monthly care report", essentials: false, autopilot: true, handsfree: true },
  { feature: "Real-time owner dashboard", essentials: false, autopilot: true, handsfree: true },
  { feature: "Expense tracking + year-end summary", essentials: false, autopilot: true, handsfree: true },
  { feature: "Lease renewal coordination", essentials: false, autopilot: true, handsfree: true },
  { feature: "Free lease renewals (forever)", essentials: false, autopilot: false, handsfree: true },
  { feature: "Annual rent benchmarking", essentials: false, autopilot: true, handsfree: true },
  { feature: "Full LTB legal coverage (N4/N5/N12)", essentials: false, autopilot: false, handsfree: true },
  { feature: "End-to-end eviction management", essentials: false, autopilot: false, handsfree: true },
  { feature: "LTB + paralegal costs covered (to $2,500)", essentials: false, autopilot: false, handsfree: true },
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
    number: "№6",
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
