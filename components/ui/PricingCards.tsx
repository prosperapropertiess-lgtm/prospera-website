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
    dark: false,
    featured: false,
    accentBorder: false,
  },
  {
    key: "optimized",
    label: "Optimized",
    badge: "Most Popular",
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
    dark: true,
    featured: true,
    accentBorder: false,
  },
  {
    key: "passive",
    label: "Passive",
    badge: "Best Value",
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
    dark: false,
    featured: false,
    accentBorder: true,
  },
];

function PlanCard({ plan, full = false }: { plan: typeof plans[0]; full?: boolean }) {
  const bg = plan.dark ? "#1F2F3A" : "#FFFFFF";
  const border = plan.accentBorder ? "2px solid #8B2030" : plan.dark ? "none" : "1px solid #D8D2C8";
  const headingColor = plan.dark ? "#FAF8F5" : "#1F2F3A";
  const bodyColor = plan.dark ? "rgba(250,248,245,0.65)" : "#333333";
  const labelColor = plan.dark ? "rgba(250,248,245,0.55)" : "#8B2030";
  const checkColor = plan.dark ? "#FAF8F5" : "#8B2030";
  const priceColor = plan.dark ? "#FAF8F5" : "#1F2F3A";
  const placementColor = plan.placementHighlight ? "#8B2030" : bodyColor;
  const ctaBg = plan.dark ? "#8B2030" : plan.accentBorder ? "#8B2030" : "transparent";
  const ctaBorder = plan.dark ? "none" : plan.accentBorder ? "none" : "1px solid #D8D2C8";
  const ctaText = plan.dark || plan.accentBorder ? "#FAF8F5" : "#222222";

  return (
    <div
      className={`relative rounded-2xl p-8 flex flex-col ${full ? "h-full" : ""}`}
      style={{ backgroundColor: bg, border, boxShadow: plan.featured ? "0 8px 32px rgba(0,0,0,0.18)" : "0 2px 8px rgba(0,0,0,0.05)" }}
    >
      {plan.badge && (
        <div
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full"
          style={{ backgroundColor: plan.dark ? "#8B2030" : "#1F2F3A" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
          >
            {plan.badge}
          </p>
        </div>
      )}

      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: labelColor, fontFamily: "var(--font-dm-sans)" }}>
          {plan.label}
        </p>
        <div className="flex items-end gap-2 mb-1">
          <p className="text-6xl font-light" style={{ color: priceColor, fontFamily: "var(--font-cormorant)" }}>
            {plan.price}
          </p>
          <p className="text-sm mb-2" style={{ color: bodyColor, fontFamily: "var(--font-dm-sans)" }}>
            {plan.priceSub}
          </p>
        </div>
        <p
          className="text-sm mb-1"
          style={{
            color: placementColor,
            fontWeight: plan.placementHighlight ? 600 : 400,
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          {plan.placementNote}
        </p>
        <p className="text-base mt-4 leading-relaxed" style={{ color: bodyColor, fontFamily: "var(--font-dm-sans)" }}>
          {plan.description}
        </p>
      </div>

      <ul className="space-y-3 mb-8 flex-1" style={{ fontFamily: "var(--font-dm-sans)" }}>
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-3 text-sm" style={{ color: bodyColor }}>
            <span className="mt-0.5 flex-shrink-0" style={{ color: checkColor }}>✓</span>
            {f}
          </li>
        ))}
      </ul>

      <Link
        href="/contact"
        className="block text-center py-4 text-xs font-semibold uppercase tracking-widest rounded-xl transition-opacity hover:opacity-80"
        style={{
          backgroundColor: ctaBg,
          border: ctaBorder,
          color: ctaText,
          fontFamily: "var(--font-dm-sans)",
        }}
      >
        Get Started
      </Link>
    </div>
  );
}

export default function PricingCards() {
  const [active, setActive] = useState(1);

  return (
    <>
      {/* Mobile: tab switcher */}
      <div className="md:hidden px-6 mb-6">
        <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: "#D8D2C8" }}>
          {plans.map((plan, i) => (
            <button
              key={plan.key}
              onClick={() => setActive(i)}
              className="flex-1 py-3 text-xs uppercase tracking-widest transition-colors font-semibold"
              style={{
                backgroundColor: active === i ? "#1F2F3A" : "#FFFFFF",
                color: active === i ? "#FAF8F5" : "#444444",
                fontFamily: "var(--font-dm-sans)",
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
