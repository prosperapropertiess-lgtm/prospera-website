"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import FadeIn from "@/components/animations/FadeIn";

const NAVY = "#1F2F3A";
const BURGUNDY = "#8B2030";
const TEXT = "#222222";
const MUTED = "#666666";
const BORDER = "#D8D2C8";

interface Props {
  rentLow: number;
  rentMarket: number;
  rentPremium: number;
  compRents: number[];
}

export default function RentSimulator({ rentLow, rentMarket, rentPremium, compRents }: Props) {
  const floor = Math.max(Math.round(rentLow * 0.85), 500);
  const ceiling = Math.round(rentPremium * 1.25);
  const [rent, setRent] = useState(rentMarket);

  const avgComp = compRents.length > 0
    ? Math.round(compRents.reduce((a, b) => a + b, 0) / compRents.length)
    : rentMarket;

  const metrics = useMemo(() => {
    const range = ceiling - floor;
    const pos = (rent - floor) / range; // 0 = cheapest, 1 = most expensive

    // Rentability: 100% at floor, 0% at ceiling — exponential decay
    const rentability = Math.max(0, Math.min(100, Math.round(100 * Math.pow(1 - pos, 1.5))));

    // Days to fill: faster at lower rents
    const baseDays = 7;
    const maxDays = 60;
    const daysToFill = Math.round(baseDays + (maxDays - baseDays) * Math.pow(pos, 1.3));

    // Application quality: sweet spot around market rate
    const spread = rentPremium - rentLow;
    const distFromMarket = spread > 0 ? Math.abs(rent - rentMarket) / spread : 0;
    const appQuality = distFromMarket < 0.15 ? "High" : distFromMarket < 0.35 ? "Good" : distFromMarket < 0.6 ? "Fair" : "Low";

    // Applicant pool estimate
    const poolBase = 25;
    const pool = Math.max(1, Math.round(poolBase * Math.pow(1 - pos, 2)));

    // Color: green → yellow → red
    const hue = Math.round(120 * (1 - pos)); // 120 = green, 0 = red
    const color = `hsl(${hue}, 70%, 42%)`;
    const bgColor = `hsl(${hue}, 60%, 96%)`;
    const barColor = `hsl(${hue}, 65%, 50%)`;

    // Zone label
    const zone = pos < 0.3 ? "Sweet Spot" : pos < 0.55 ? "Competitive" : pos < 0.75 ? "Aggressive" : "Risky";

    // Monthly income vs vacancy cost
    const vacancyCostPerMonth = rent; // each empty month costs the full rent
    const expectedVacancy = daysToFill / 30;
    const annualIncome = rent * (12 - expectedVacancy);
    const marketAnnual = rentMarket * (12 - (baseDays + (maxDays - baseDays) * Math.pow((rentMarket - floor) / range, 1.3)) / 30);

    return { rentability, daysToFill, appQuality, pool, color, bgColor, barColor, zone, annualIncome, marketAnnual, pos };
  }, [rent, floor, ceiling, rentMarket, rentLow, rentPremium]);

  return (
    <section className="px-5 sm:px-8 py-16 sm:py-20" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: MUTED }}>
            Interactive
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: NAVY, fontFamily: "var(--font-cormorant)" }}>
            Rent Pricing Simulator
          </h2>
          <p className="text-sm mb-10 max-w-xl" style={{ color: MUTED, lineHeight: 1.7 }}>
            Drag the slider to see how rent affects your listing. Higher rent means fewer applicants and longer vacancy. Find the price that maximizes your annual income.
          </p>
        </FadeIn>

        {/* Slider */}
        <FadeIn delay={0.1}>
          <div className="rounded-2xl border p-8" style={{ borderColor: BORDER, backgroundColor: metrics.bgColor, transition: "background-color 0.3s" }}>

            {/* Rent display */}
            <div className="text-center mb-6">
              <motion.p
                key={rent}
                initial={{ scale: 1.1, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-5xl sm:text-6xl font-bold"
                style={{ color: metrics.color, fontFamily: "var(--font-cormorant)", transition: "color 0.3s" }}
              >
                ${rent.toLocaleString()}
              </motion.p>
              <p className="text-sm mt-1" style={{ color: MUTED }}>/month</p>
            </div>

            {/* Zone badge */}
            <div className="flex justify-center mb-6">
              <motion.span
                key={metrics.zone}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{ backgroundColor: metrics.color, color: "#fff", transition: "background-color 0.3s" }}
              >
                {metrics.zone}
              </motion.span>
            </div>

            {/* Slider track */}
            <div className="relative mb-4">
              {/* Gradient background */}
              <div className="h-3 rounded-full overflow-hidden" style={{ background: "linear-gradient(to right, #22c55e, #eab308, #ef4444)" }}>
                {/* Filled portion */}
                <div className="h-full rounded-full" style={{ width: `${metrics.pos * 100}%`, background: "rgba(255,255,255,0.3)" }} />
              </div>

              {/* Markers */}
              <div className="absolute top-0 h-3 flex items-center" style={{ left: `${((rentLow - floor) / (ceiling - floor)) * 100}%` }}>
                <div className="w-0.5 h-5 bg-green-600 rounded" title="Conservative" />
              </div>
              <div className="absolute top-0 h-3 flex items-center" style={{ left: `${((rentMarket - floor) / (ceiling - floor)) * 100}%` }}>
                <div className="w-0.5 h-5 bg-blue-600 rounded" title="Market Rate" />
              </div>
              <div className="absolute top-0 h-3 flex items-center" style={{ left: `${((rentPremium - floor) / (ceiling - floor)) * 100}%` }}>
                <div className="w-0.5 h-5 bg-amber-600 rounded" title="Premium" />
              </div>
              <div className="absolute top-0 h-3 flex items-center" style={{ left: `${((avgComp - floor) / (ceiling - floor)) * 100}%` }}>
                <div className="w-0.5 h-5 rounded" style={{ backgroundColor: NAVY }} title="Comp Average" />
              </div>

              {/* Range input */}
              <input
                type="range"
                min={floor}
                max={ceiling}
                step={25}
                value={rent}
                onChange={(e) => setRent(Number(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer h-8 -top-2.5"
                style={{ margin: 0 }}
              />

              {/* Thumb indicator */}
              <motion.div
                className="absolute -top-1.5 w-6 h-6 rounded-full border-2 border-white shadow-lg"
                style={{
                  left: `calc(${metrics.pos * 100}% - 12px)`,
                  backgroundColor: metrics.color,
                  transition: "left 0.05s, background-color 0.3s",
                }}
              />
            </div>

            {/* Labels under slider */}
            <div className="flex justify-between text-xs mb-8" style={{ color: MUTED }}>
              <span>${floor.toLocaleString()}</span>
              <div className="flex gap-4">
                <span style={{ color: "#16a34a" }}>Conservative ${rentLow.toLocaleString()}</span>
                <span style={{ color: NAVY, fontWeight: 600 }}>Market ${rentMarket.toLocaleString()}</span>
                <span style={{ color: "#d97706" }}>Premium ${rentPremium.toLocaleString()}</span>
              </div>
              <span>${ceiling.toLocaleString()}</span>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <MetricCard
                label="Rentability"
                value={`${metrics.rentability}%`}
                detail={metrics.rentability > 70 ? "Strong demand" : metrics.rentability > 40 ? "Moderate" : "Low demand"}
                color={metrics.color}
              />
              <MetricCard
                label="Est. Days to Fill"
                value={`${metrics.daysToFill}`}
                detail={metrics.daysToFill < 14 ? "Fast fill" : metrics.daysToFill < 30 ? "Average" : "Slow — vacancy risk"}
                color={metrics.color}
              />
              <MetricCard
                label="Applicant Pool"
                value={`~${metrics.pool}`}
                detail={metrics.pool > 15 ? "Competitive field" : metrics.pool > 5 ? "Enough options" : "Very limited"}
                color={metrics.color}
              />
              <MetricCard
                label="App Quality"
                value={metrics.appQuality}
                detail={metrics.appQuality === "High" ? "Best tenants" : metrics.appQuality === "Good" ? "Solid applicants" : "Weaker applicants"}
                color={metrics.color}
              />
            </div>

            {/* Rentability bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: TEXT }}>Rentability Score</span>
                <span className="text-xs font-bold" style={{ color: metrics.color }}>{metrics.rentability}%</span>
              </div>
              <div className="h-4 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(0,0,0,0.06)" }}>
                <motion.div
                  className="h-full rounded-full"
                  initial={false}
                  animate={{ width: `${metrics.rentability}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{ backgroundColor: metrics.barColor, transition: "background-color 0.3s" }}
                />
              </div>
            </div>

            {/* Annual income comparison */}
            <div className="mt-6 pt-6 grid grid-cols-2 gap-4" style={{ borderTop: `1px solid ${BORDER}` }}>
              <div className="text-center">
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: MUTED }}>Your Est. Annual Income</p>
                <p className="text-2xl font-bold" style={{ color: metrics.color, fontFamily: "var(--font-cormorant)" }}>
                  ${Math.round(metrics.annualIncome).toLocaleString()}
                </p>
                <p className="text-xs mt-1" style={{ color: MUTED }}>
                  After ~{Math.round(metrics.pos * 40 + 7)} days vacancy
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: MUTED }}>At Market Rate</p>
                <p className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "var(--font-cormorant)" }}>
                  ${Math.round(metrics.marketAnnual).toLocaleString()}
                </p>
                <p className="text-xs mt-1" style={{ color: MUTED }}>
                  {rent > rentMarket
                    ? `$${Math.round(metrics.marketAnnual - metrics.annualIncome).toLocaleString()} more annually`
                    : rent < rentMarket
                    ? `$${Math.round(metrics.annualIncome - metrics.marketAnnual).toLocaleString()} more annually`
                    : "Same as your selection"
                  }
                </p>
              </div>
            </div>

            {/* Insight message */}
            <motion.div
              key={metrics.zone}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-xl text-sm leading-relaxed"
              style={{ backgroundColor: "rgba(255,255,255,0.7)", color: TEXT, border: `1px solid ${BORDER}` }}
            >
              {metrics.rentability >= 70 && (
                <>This price point sits in a strong demand zone. You should see multiple qualified applicants within the first two weeks. Fast fill, good tenants, reliable income.</>
              )}
              {metrics.rentability >= 40 && metrics.rentability < 70 && (
                <>Competitive but not aggressive. You'll attract applicants, though the pool is smaller and it may take 3-4 weeks. If the unit shows well and the listing is strong, this can work.</>
              )}
              {metrics.rentability >= 15 && metrics.rentability < 40 && (
                <>At this price, the unit will likely sit for over a month. Each empty month costs you ${rent.toLocaleString()} in lost rent. Consider whether the higher monthly number offsets the vacancy risk.</>
              )}
              {metrics.rentability < 15 && (
                <>This is above what the current market supports. Extended vacancy is likely, and when it does fill, the applicant pool tends to be weaker — tenants with fewer options. The math usually works against you here.</>
              )}
            </motion.div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function MetricCard({ label, value, detail, color }: { label: string; value: string; detail: string; color: string }) {
  return (
    <div className="text-center p-3 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.6)" }}>
      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: MUTED }}>{label}</p>
      <motion.p
        key={value}
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        className="text-xl font-bold mb-0.5"
        style={{ color, fontFamily: "var(--font-cormorant)", transition: "color 0.3s" }}
      >
        {value}
      </motion.p>
      <p className="text-xs" style={{ color: MUTED }}>{detail}</p>
    </div>
  );
}
