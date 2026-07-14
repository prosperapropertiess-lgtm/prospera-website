"use client";

import { useState, useRef } from "react";
import Link from "next/link";

// ── Constants ──────────────────────────────────────────────────────────────

const NAVY = "#1F2F3A";
const BURGUNDY = "#8B2030";
const BG = "#F7F5F2";
const WHITE = "#FFFFFF";
const BORDER = "#D8D2C8";
const TEXT = "#222222";
const MUTED = "#666666";
const SUBTLE = "#333333";

// ── Types ──────────────────────────────────────────────────────────────────

interface Plan {
  id: "essentials" | "autopilot" | "handsfree";
  name: string;
  tagline: string;
  rate: string;
  rateNum: number;
  badge?: string;
  colour: string;
  accentBg: string;
  description: string;
  includes: string[];
  addOns: string[];
  notIncluded: string[];
  bestFor: string;
}

// ── Plan Data ──────────────────────────────────────────────────────────────

const PLANS: Plan[] = [
  {
    id: "essentials",
    name: "Minimum Essentials",
    tagline: "The tools. None of the hand-holding.",
    rate: "7%",
    rateNum: 0.07,
    colour: NAVY,
    accentBg: "rgba(31,47,58,0.06)",
    description:
      "You stay in control. We handle the compliance-heavy pieces: tenant placement, rent collection, and legal paperwork. Everything else is yours.",
    includes: [
      "Tenant placement & screening",
      "Lease preparation (standard Ontario lease)",
      "Rent collection & deposit to your account",
      "N4 preparation when required",
      "Online tenant portal access",
      "Annual rent increase calculation",
    ],
    addOns: [
      "Maintenance coordination (+1%)",
      "Inspection reports (+$150/ea)",
      "Lease renewal coordination (+$200/ea)",
    ],
    notIncluded: [
      "Maintenance coordination",
      "Property inspections",
      "24/7 emergency response",
      "Vendor management",
    ],
    bestFor: "Landlords who want to stay involved but need the compliance handled.",
  },
  {
    id: "autopilot",
    name: "Autopilot",
    tagline: "Full management. One number.",
    rate: "10%",
    rateNum: 0.10,
    badge: "Most Popular",
    colour: BURGUNDY,
    accentBg: "rgba(139,32,48,0.06)",
    description:
      "Everything in Minimum Essentials, plus maintenance coordination, property inspections, and 24/7 emergency response. One flat rate. No billing surprises.",
    includes: [
      "Everything in Minimum Essentials",
      "Maintenance coordination & vendor management",
      "Move-in & move-out inspections",
      "24/7 emergency maintenance response",
      "Lease renewal coordination",
      "Bi-annual property inspections",
      "Owner dashboard with monthly statements",
      "Expense tracking & year-end summary",
    ],
    addOns: [
      "Renovation project management (quoted separately)",
      "Additional mid-term inspections (+$150/ea)",
    ],
    notIncluded: ["Renovation project management"],
    bestFor: "Landlords who want genuine hands-off operation without paying premium pricing.",
  },
  {
    id: "handsfree",
    name: "Hands-Free",
    tagline: "We act as your property. You own it.",
    rate: "15%",
    rateNum: 0.15,
    colour: NAVY,
    accentBg: "rgba(31,47,58,0.06)",
    description:
      "Everything in Autopilot, plus renovation oversight, portfolio strategy, and direct owner advisory. For landlords who want to forget the property exists.",
    includes: [
      "Everything in Autopilot",
      "Renovation & capital project management",
      "Portfolio strategy sessions (quarterly)",
      "Market rent analysis & optimization",
      "Priority response on all communications",
      "Dedicated property manager (named contact)",
      "Tax-ready expense reports with receipts",
      "Proactive lease renewal strategy",
    ],
    addOns: ["Nothing. This is the complete offering."],
    notIncluded: [],
    bestFor: "Out-of-province owners, multi-property investors, and anyone who values time above all else.",
  },
];

// ── Persona Data ──────────────────────────────────────────────────────────

const PERSONAS = [
  {
    id: "reluctant",
    label: "The Reluctant Landlord",
    icon: "🏠",
    description: "You inherited a property, moved away, or got stuck with a second unit. You didn't sign up to be a landlord.",
    recommendation: "autopilot",
    reason: "Autopilot handles everything that surprises you: the 2AM call, the late rent, the lease renewal you forgot.",
  },
  {
    id: "investor",
    label: "The Investor",
    icon: "📊",
    description: "You own multiple properties. Your time is worth more than any management fee.",
    recommendation: "handsfree",
    reason: "Hands-Free gives you one point of contact, quarterly strategy, and portfolio visibility — across every property.",
  },
  {
    id: "nearbyowner",
    label: "The Nearby Owner",
    icon: "🔑",
    description: "You live close. You want to stay involved and handle some things yourself.",
    recommendation: "essentials",
    reason: "Minimum Essentials handles the legal and compliance pieces you shouldn't be doing yourself, without removing your control.",
  },
  {
    id: "firsttime",
    label: "The First-Timer",
    icon: "📋",
    description: "This is your first rental. You don't know what you don't know.",
    recommendation: "autopilot",
    reason: "Autopilot covers the pieces that catch first-timers off guard: maintenance, inspections, and LTB filings.",
  },
];

const PLAN_LABEL: Record<string, string> = {
  essentials: "Minimum Essentials",
  autopilot: "Autopilot",
  handsfree: "Hands-Free",
};

// ── Rent Calculator ───────────────────────────────────────────────────────

function RentCalculator({ plan }: { plan: Plan }) {
  const [rent, setRent] = useState(2000);

  const fee = Math.round(rent * plan.rateNum);
  const net = rent - fee;

  return (
    <div
      style={{
        background: plan.accentBg,
        border: `1px solid ${BORDER}`,
        borderRadius: "16px",
        padding: "24px",
        marginTop: "24px",
      }}
    >
      <p
        style={{
          fontSize: "11px",
          fontFamily: "var(--font-dm-sans)",
          color: MUTED,
          textTransform: "uppercase",
          letterSpacing: "0.10em",
          fontWeight: 600,
          marginBottom: "16px",
        }}
      >
        Rent Calculator
      </p>

      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: SUBTLE }}>Monthly rent</span>
          <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "18px", fontWeight: 700, color: NAVY }}>
            ${rent.toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min={800}
          max={5000}
          step={50}
          value={rent}
          onChange={(e) => setRent(Number(e.target.value))}
          style={{ width: "100%", accentColor: plan.colour, cursor: "pointer" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
          <span style={{ fontSize: "11px", color: MUTED, fontFamily: "var(--font-dm-sans)" }}>$800</span>
          <span style={{ fontSize: "11px", color: MUTED, fontFamily: "var(--font-dm-sans)" }}>$5,000</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div
          style={{
            background: WHITE,
            borderRadius: "12px",
            padding: "16px",
            border: `1px solid ${BORDER}`,
            textAlign: "center",
          }}
        >
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
            Management fee
          </p>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "22px", fontWeight: 800, color: plan.colour }}>
            ${fee}
          </p>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED, marginTop: "2px" }}>/ month</p>
        </div>
        <div
          style={{
            background: WHITE,
            borderRadius: "12px",
            padding: "16px",
            border: `1px solid ${BORDER}`,
            textAlign: "center",
          }}
        >
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
            You receive
          </p>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "22px", fontWeight: 800, color: NAVY }}>
            ${net.toLocaleString()}
          </p>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED, marginTop: "2px" }}>/ month</p>
        </div>
      </div>
    </div>
  );
}

// ── Plan Card ─────────────────────────────────────────────────────────────

function PlanCard({ plan, highlighted }: { plan: Plan; highlighted?: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      id={`plan-${plan.id}`}
      style={{
        background: WHITE,
        border: `1px solid ${highlighted ? plan.colour : BORDER}`,
        borderTop: `3px solid ${plan.colour}`,
        borderRadius: "20px",
        padding: "32px",
        position: "relative",
        boxShadow: highlighted
          ? "0 8px 32px rgba(0,0,0,0.10)"
          : "0 1px 4px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.2s",
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
            padding: "4px 16px",
            borderRadius: "20px",
            whiteSpace: "nowrap",
          }}
        >
          {plan.badge}
        </div>
      )}

      {/* Rate */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "4px" }}>
        <span
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(48px, 7vw, 64px)",
            fontWeight: 700,
            color: plan.colour,
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {plan.rate}
        </span>
        <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: MUTED }}>
          of monthly rent
        </span>
      </div>

      {/* Name */}
      <h3
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "clamp(22px, 3vw, 28px)",
          fontWeight: 700,
          color: NAVY,
          marginBottom: "4px",
          letterSpacing: "-0.01em",
        }}
      >
        {plan.name}
      </h3>
      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: MUTED, fontStyle: "italic", marginBottom: "16px" }}>
        {plan.tagline}
      </p>

      {/* Description */}
      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "15px", color: SUBTLE, lineHeight: 1.65, marginBottom: "24px" }}>
        {plan.description}
      </p>

      {/* Best For */}
      <div
        style={{
          background: plan.accentBg,
          borderLeft: `3px solid ${plan.colour}`,
          borderRadius: "8px",
          padding: "12px 16px",
          marginBottom: "24px",
        }}
      >
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: SUBTLE }}>
          <span style={{ fontWeight: 700 }}>Best for: </span>{plan.bestFor}
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
      <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: "20px" }}>
        {plan.includes.map((item) => (
          <li
            key={item}
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "14px",
              color: TEXT,
              padding: "6px 0",
              borderBottom: `1px solid ${BORDER}`,
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
            }}
          >
            <span style={{ color: plan.colour, fontWeight: 700, flexShrink: 0, marginTop: "1px" }}>✓</span>
            {item}
          </li>
        ))}
      </ul>

      {/* Expandable: Add-ons & not included */}
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
        }}
      >
        {expanded ? "Show less ↑" : "See add-ons & exclusions ↓"}
      </button>

      {expanded && (
        <div style={{ marginTop: "20px" }}>
          {plan.addOns.length > 0 && (
            <>
              <p
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "11px",
                  color: MUTED,
                  textTransform: "uppercase",
                  letterSpacing: "0.10em",
                  fontWeight: 700,
                  marginBottom: "10px",
                }}
              >
                Available add-ons
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: "20px" }}>
                {plan.addOns.map((item) => (
                  <li
                    key={item}
                    style={{
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "14px",
                      color: SUBTLE,
                      padding: "6px 0",
                      borderBottom: `1px solid ${BORDER}`,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                    }}
                  >
                    <span style={{ color: MUTED, flexShrink: 0, marginTop: "1px" }}>+</span>
                    {item}
                  </li>
                ))}
              </ul>
            </>
          )}

          {plan.notIncluded.length > 0 && (
            <>
              <p
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "11px",
                  color: MUTED,
                  textTransform: "uppercase",
                  letterSpacing: "0.10em",
                  fontWeight: 700,
                  marginBottom: "10px",
                }}
              >
                Not included
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {plan.notIncluded.map((item) => (
                  <li
                    key={item}
                    style={{
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "14px",
                      color: MUTED,
                      padding: "6px 0",
                      borderBottom: `1px solid ${BORDER}`,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                    }}
                  >
                    <span style={{ color: MUTED, flexShrink: 0 }}>–</span>
                    {item}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {/* Calculator */}
      <RentCalculator plan={plan} />

      {/* CTA */}
      <div style={{ marginTop: "24px" }}>
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
            padding: "16px 24px",
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
  const plansRef = useRef<HTMLDivElement>(null);

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
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "24px",
      }}
    >
      {PLANS.map((plan) => (
        <PlanCard key={plan.id} plan={plan} highlighted={plan.id === "autopilot"} />
      ))}
    </div>
  );
}

// ── Comparison Table (mobile-scrollable) ──────────────────────────────────

const COMPARE_ROWS = [
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
  { feature: "Dedicated named property manager", essentials: false, autopilot: false, handsfree: true },
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
            <tr
              key={row.feature}
              style={{ background: i % 2 === 0 ? WHITE : BG }}
            >
              <td
                style={{
                  padding: "12px 16px",
                  fontSize: "14px",
                  color: TEXT,
                  borderBottom: `1px solid ${BORDER}`,
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
                    fontSize: "18px",
                  }}
                >
                  {row[col] ? (
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
    headline: "No hidden fees. Ever.",
    detail:
      "Our fee schedule is printed above and doesn't change. No markup on maintenance invoices. No admin fees for statements. No surprise charges at year-end. You'll see every transaction before it posts.",
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
    title: "90-Day Guarantee",
    headline: "If it's not working after 90 days, we refund your first month's management fee.",
    detail:
      "This is the overarching guarantee. Try us for 90 days. If you're dissatisfied with the service in a way we can't resolve, we'll refund your first month's management fee — no conditions, no negotiation.",
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
