"use client";

import { useState } from "react";
import Link from "next/link";

const plans = [
  {
    key: "managed",
    label: "Managed",
    badge: null,
    price: "8%",
    priceSub: "/ month",
    placementNote: "+ 1 month's rent (placement)",
    placementHighlight: false,
    description: "Everything handled. You collect rent and do nothing else.",
    features: [
      "Full tenant screening & placement",
      "Rent collection & disbursement",
      "Maintenance coordination",
      "8% maintenance markup — transparent, no surprises",
      "Lease management & renewals",
      "Move-in / move-out inspection",
      "Monthly financial statements",
      "No vacancy fee. Ever.",
    ],
    bg: "#112035",
    border: "1px solid #1E3050",
    textColor: "#C0CAD4",
    priceColor: "#FAF8F5",
    ctaBg: "transparent",
    ctaBorder: "1px solid #1E3050",
    ctaText: "#FAF8F5",
    ctaHover: "hover:border-[#FAF8F5]",
  },
  {
    key: "optimized",
    label: "Optimized",
    badge: "Most Popular",
    badgeBg: "#C5A55A",
    price: "12%",
    priceSub: "/ month",
    placementNote: "+ 75% of one month's rent (placement)",
    placementHighlight: false,
    description: "Your property works harder for you. Proactive rent optimization keeps your income growing.",
    features: [
      "Everything in Managed",
      "25% lower placement fee (save $500 avg)",
      "Semi-annual property inspections",
      "Proactive rent increase advisory",
      "Market rent review every 6 months",
      "Priority 24-hour response",
      "Tenant renewal negotiation",
    ],
    bg: "#060E1C",
    border: "none",
    textColor: "#FAF8F5",
    priceColor: "#FAF8F5",
    ctaBg: "#C5A55A",
    ctaBorder: "none",
    ctaText: "#FAF8F5",
    ctaHover: "hover:opacity-90",
  },
  {
    key: "passive",
    label: "Passive",
    badge: "Best Value",
    badgeBg: "#060E1C",
    badgeText: "#C5A55A",
    price: "15%",
    priceSub: "/ month",
    placementNote: "Placement: FREE every single time ($2,000 value)",
    placementHighlight: true,
    description: "True passive income — backed by our 90-Day Happiness Guarantee. Not happy? Walk away free.",
    features: [
      "Everything in Optimized",
      "FREE placement — saves $2,000 every vacancy",
      "90-Day Happiness Guarantee — no questions asked",
      "Pre-vacancy marketing before tenant leaves",
      "Quarterly property inspections",
      "Annual landlord strategy call",
      "Zero risk. Zero vacancy fees. Zero lock-in.",
    ],
    bg: "#112035",
    border: "2px solid #C5A55A",
    textColor: "#C0CAD4",
    priceColor: "#FAF8F5",
    ctaBg: "#8B1A1A",
    ctaBorder: "none",
    ctaText: "#FAF8F5",
    ctaHover: "hover:opacity-90",
  },
];

function PlanCard({ plan, full = false }: { plan: typeof plans[0]; full?: boolean }) {
  return (
    <div
      className={`relative rounded-2xl p-8 flex flex-col ${full ? "h-full" : ""}`}
      style={{ backgroundColor: plan.bg, border: plan.border }}
    >
      {plan.badge && (
        <div
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full"
          style={{ backgroundColor: plan.badgeBg }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: plan.badgeText ?? "#FAF8F5", fontFamily: "var(--font-jakarta)" }}
          >
            {plan.badge}
          </p>
        </div>
      )}

      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: plan.key === "optimized" ? "#C5A55A" : "#9BAEC2", fontFamily: "var(--font-jakarta)" }}>
          {plan.label}
        </p>
        <div className="flex items-end gap-2 mb-1">
          <p className="text-6xl font-light" style={{ color: plan.priceColor, fontFamily: "var(--font-cormorant)" }}>
            {plan.price}
          </p>
          <p className="text-sm mb-2" style={{ color: plan.textColor, fontFamily: "var(--font-jakarta)" }}>
            {plan.priceSub}
          </p>
        </div>
        <p
          className="text-sm mb-1"
          style={{
            color: plan.placementHighlight ? "#C5A55A" : plan.textColor,
            fontWeight: plan.placementHighlight ? 600 : 400,
            fontFamily: "var(--font-jakarta)",
          }}
        >
          {plan.placementNote}
        </p>
        <p className="text-base mt-4 leading-relaxed" style={{ color: plan.textColor, fontFamily: "var(--font-jakarta)" }}>
          {plan.description}
        </p>
      </div>

      <ul className="space-y-3 mb-8 flex-1" style={{ fontFamily: "var(--font-jakarta)" }}>
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-3 text-base" style={{ color: plan.textColor }}>
            <span className="text-[#C5A55A] mt-0.5 flex-shrink-0">✓</span>
            {f}
          </li>
        ))}
      </ul>

      <Link
        href="/contact"
        className={`block text-center py-4 text-xs font-semibold uppercase tracking-widest rounded-xl transition-all ${plan.ctaHover}`}
        style={{
          backgroundColor: plan.ctaBg,
          border: plan.ctaBorder,
          color: plan.ctaText,
          fontFamily: "var(--font-jakarta)",
        }}
      >
        Get Started
      </Link>
    </div>
  );
}

export default function PricingCards() {
  const [active, setActive] = useState(1); // default to Optimized

  return (
    <>
      {/* Mobile: tab switcher */}
      <div className="md:hidden px-6 mb-6">
        <div className="flex rounded-xl overflow-hidden border border-[#1E3050]">
          {plans.map((plan, i) => (
            <button
              key={plan.key}
              onClick={() => setActive(i)}
              className="flex-1 py-3 text-xs uppercase tracking-widest transition-colors font-semibold"
              style={{
                backgroundColor: active === i ? "#C5A55A" : "#112035",
                color: active === i ? "#FAF8F5" : "#9BAEC2",
                fontFamily: "var(--font-jakarta)",
              }}
            >
              {plan.label}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <PlanCard plan={plans[active]} />
        </div>
      </div>

      {/* Desktop: 3-col grid */}
      <div className="hidden md:grid md:grid-cols-3 gap-6 mb-8 px-6">
        {plans.map((plan) => (
          <PlanCard key={plan.key} plan={plan} full />
        ))}
      </div>
    </>
  );
}
