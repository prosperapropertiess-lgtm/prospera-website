"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "@/components/animations/FadeIn";

const NAVY = "#1F2F3A";
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
  const floor = Math.max(Math.round(rentLow * 0.8), 500);
  const ceiling = Math.round(rentPremium * 1.3);
  const [rent, setRent] = useState(rentMarket);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const avgComp = compRents.length > 0
    ? Math.round(compRents.reduce((a, b) => a + b, 0) / compRents.length)
    : rentMarket;

  const metrics = useMemo(() => {
    const range = ceiling - floor;
    const pos = Math.max(0, Math.min(1, (rent - floor) / range));

    const rentability = Math.max(0, Math.min(100, Math.round(100 * Math.pow(1 - pos, 1.5))));

    const baseDays = 7;
    const maxDays = 120;
    const daysToFill = Math.round(baseDays + (maxDays - baseDays) * Math.pow(pos, 1.8));

    const spread = rentPremium - rentLow;
    const distFromMarket = spread > 0 ? Math.abs(rent - rentMarket) / spread : 0;
    const appQuality = distFromMarket < 0.15 ? "Excellent" : distFromMarket < 0.35 ? "Good" : distFromMarket < 0.6 ? "Fair" : "Weak";

    const poolBase = 25;
    const pool = Math.max(1, Math.round(poolBase * Math.pow(1 - pos, 2)));

    const hue = Math.round(120 * (1 - pos));
    const color = `hsl(${hue}, 70%, 42%)`;
    const bgColor = `hsl(${hue}, 50%, 97%)`;
    const barColor = `hsl(${hue}, 65%, 50%)`;

    const zone = pos < 0.3 ? "Sweet Spot" : pos < 0.55 ? "Competitive" : pos < 0.75 ? "Aggressive" : "Risky";
    const zoneEmoji = pos < 0.3 ? "🟢" : pos < 0.55 ? "🟡" : pos < 0.75 ? "🟠" : "🔴";

    // Vacancy cost = full daily rent × days empty
    const dailyRent = rent / 30;
    const vacancyCost = Math.round(dailyRent * daysToFill);
    const grossAnnual = rent * 12;
    const netAnnual = grossAnnual - vacancyCost;

    // Market rate comparison
    const marketPos = Math.max(0, Math.min(1, (rentMarket - floor) / range));
    const marketDaysToFill = Math.round(baseDays + (maxDays - baseDays) * Math.pow(marketPos, 1.3));
    const marketDailyRent = rentMarket / 30;
    const marketVacancyCost = Math.round(marketDailyRent * marketDaysToFill);
    const marketGrossAnnual = rentMarket * 12;
    const marketNetAnnual = marketGrossAnnual - marketVacancyCost;

    const netDiff = netAnnual - marketNetAnnual;

    return { rentability, daysToFill, appQuality, pool, color, bgColor, barColor, zone, zoneEmoji, grossAnnual, vacancyCost, netAnnual, marketDaysToFill, marketVacancyCost, marketGrossAnnual, marketNetAnnual, netDiff, pos };
  }, [rent, floor, ceiling, rentMarket, rentLow, rentPremium]);

  // Drag-based slider for better touch/click support
  const updateFromPosition = useCallback((clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newRent = Math.round((floor + pct * (ceiling - floor)) / 25) * 25;
    setRent(newRent);
  }, [floor, ceiling]);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateFromPosition(e.clientX);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragging.current) updateFromPosition(e.clientX);
  };
  const handlePointerUp = () => { dragging.current = false; };

  return (
    <section className="py-16 sm:py-20 px-5 sm:px-8" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: MUTED }}>
            Interactive Tool
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: NAVY, fontFamily: "var(--font-cormorant)" }}>
            Rent Pricing Simulator
          </h2>
          <p className="text-sm mb-10 max-w-xl" style={{ color: MUTED, lineHeight: 1.7 }}>
            Drag the slider to see how pricing affects your vacancy risk, applicant quality, and annual income.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div
            className="rounded-2xl border p-6 sm:p-8 transition-colors duration-500"
            style={{ borderColor: BORDER, backgroundColor: metrics.bgColor }}
          >

            {/* Big rent number */}
            <div className="text-center mb-2">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={rent}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 10, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <span className="text-5xl sm:text-7xl font-bold" style={{ color: metrics.color, fontFamily: "var(--font-cormorant)", transition: "color 0.3s" }}>
                    ${rent.toLocaleString()}
                  </span>
                </motion.div>
              </AnimatePresence>
              <p className="text-sm mt-1" style={{ color: MUTED }}>/month</p>
            </div>

            {/* Zone badge */}
            <div className="flex justify-center mb-8">
              <motion.div
                key={metrics.zone}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider"
                style={{ backgroundColor: metrics.color, color: "#fff", transition: "background-color 0.3s" }}
              >
                {metrics.zoneEmoji} {metrics.zone}
              </motion.div>
            </div>

            {/* Slider */}
            <div className="mb-3">
              <div
                ref={trackRef}
                className="relative h-8 cursor-pointer select-none touch-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                {/* Track background */}
                <div className="absolute top-3 left-0 right-0 h-3 rounded-full overflow-hidden" style={{ background: "linear-gradient(to right, #22c55e, #84cc16, #eab308, #f97316, #ef4444)" }} />

                {/* Marker lines */}
                {[
                  { val: rentLow, label: "Low", color: "#16a34a" },
                  { val: rentMarket, label: "Market", color: "#1F2F3A" },
                  { val: rentPremium, label: "High", color: "#d97706" },
                  { val: avgComp, label: "Avg Comp", color: "#6366f1" },
                ].map((m) => (
                  <div key={m.label} className="absolute top-1" style={{ left: `${((m.val - floor) / (ceiling - floor)) * 100}%` }}>
                    <div className="w-0.5 h-7 rounded" style={{ backgroundColor: m.color }} />
                  </div>
                ))}

                {/* Draggable thumb */}
                <div
                  className="absolute top-0 -ml-4 w-8 h-8 rounded-full border-4 border-white shadow-lg transition-colors duration-300"
                  style={{
                    left: `${metrics.pos * 100}%`,
                    backgroundColor: metrics.color,
                    boxShadow: `0 0 0 4px ${metrics.color}33, 0 4px 12px rgba(0,0,0,0.2)`,
                  }}
                />
              </div>
            </div>

            {/* Slider labels */}
            <div className="flex justify-between text-xs mb-8 px-1" style={{ color: MUTED }}>
              <span>${floor.toLocaleString()}</span>
              <div className="hidden sm:flex gap-6">
                <span style={{ color: "#16a34a" }}>● Low ${rentLow.toLocaleString()}</span>
                <span style={{ color: NAVY, fontWeight: 600 }}>● Market ${rentMarket.toLocaleString()}</span>
                <span style={{ color: "#d97706" }}>● Premium ${rentPremium.toLocaleString()}</span>
                <span style={{ color: "#6366f1" }}>● Comp Avg ${avgComp.toLocaleString()}</span>
              </div>
              <span>${ceiling.toLocaleString()}</span>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <MetricCard
                label="Rentability"
                value={`${metrics.rentability}%`}
                icon={metrics.rentability > 70 ? "🟢" : metrics.rentability > 40 ? "🟡" : "🔴"}
                color={metrics.color}
              />
              <MetricCard
                label="Days to Fill"
                value={`~${metrics.daysToFill}`}
                icon={metrics.daysToFill < 14 ? "⚡" : metrics.daysToFill < 30 ? "⏱️" : "🐌"}
                color={metrics.color}
              />
              <MetricCard
                label="Applicant Pool"
                value={`~${metrics.pool}`}
                icon={metrics.pool > 15 ? "👥" : metrics.pool > 5 ? "👤" : "😶"}
                color={metrics.color}
              />
              <MetricCard
                label="App Quality"
                value={metrics.appQuality}
                icon={metrics.appQuality === "Excellent" ? "⭐" : metrics.appQuality === "Good" ? "👍" : "⚠️"}
                color={metrics.color}
              />
            </div>

            {/* Rentability bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: TEXT }}>Rentability Score</span>
                <span className="text-sm font-bold" style={{ color: metrics.color }}>{metrics.rentability}%</span>
              </div>
              <div className="h-5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(0,0,0,0.06)" }}>
                <motion.div
                  className="h-full rounded-full relative overflow-hidden"
                  animate={{ width: `${metrics.rentability}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{ backgroundColor: metrics.barColor, transition: "background-color 0.3s" }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0" style={{
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                    animation: "shimmer 2s infinite",
                  }} />
                </motion.div>
              </div>
              <style>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
            </div>

            {/* The simple math that kills the overpricing argument */}
            <div className="rounded-xl mb-6 overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={rent > rentMarket ? "above" : rent < rentMarket ? "below" : "at"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {rent > rentMarket ? (() => {
                    const diff = rent - rentMarket;
                    const annualUpside = diff * 12;
                    const monthsToBreakEven = Math.ceil(rent / diff);

                    return (
                      <div>
                        {/* The upside */}
                        <div className="p-5 text-center" style={{ backgroundColor: "rgba(31,47,58,0.03)" }}>
                          <p className="text-base font-semibold mb-1" style={{ color: NAVY }}>
                            Shooting for ${diff.toLocaleString()}/mo more than market
                          </p>
                          <p className="text-xs" style={{ color: MUTED }}>Here&apos;s the picture.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2">
                          {/* If it works */}
                          <div className="p-5" style={{ backgroundColor: "rgba(22,163,74,0.03)", borderRight: `1px solid ${BORDER}` }}>
                            <p className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: "#16a34a" }}>
                              If it fills at ${rent.toLocaleString()}
                            </p>
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm" style={{ color: MUTED }}>Potential annual upside</p>
                                <p className="text-2xl font-bold" style={{ color: "#16a34a", fontFamily: "var(--font-cormorant)" }}>
                                  +${annualUpside.toLocaleString()}/yr
                                </p>
                              </div>
                              <div className="p-3 rounded-lg" style={{ backgroundColor: "rgba(22,163,74,0.06)" }}>
                                <p className="text-sm" style={{ color: TEXT }}>
                                  That&apos;s an extra <strong>${diff.toLocaleString()}/mo</strong> if the right tenant comes along. Totally possible.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Market rate safety net */}
                          <div className="p-5" style={{ backgroundColor: "rgba(31,47,58,0.02)" }}>
                            <p className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: MUTED }}>
                              Market rate — your safety net
                            </p>
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm" style={{ color: MUTED }}>If you adjust down to market</p>
                                <p className="text-2xl font-bold" style={{ color: NAVY, fontFamily: "var(--font-cormorant)" }}>
                                  ${rentMarket.toLocaleString()}/mo
                                </p>
                              </div>
                              <div className="p-3 rounded-lg" style={{ backgroundColor: "rgba(31,47,58,0.04)" }}>
                                <p className="text-sm" style={{ color: TEXT }}>
                                  Fills in ~{metrics.marketDaysToFill} days, stronger applicant pool, and you&apos;re done.
                                  Sometimes the peace of mind is worth it.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom line — empowering */}
                        <div className="p-5 text-center" style={{ borderTop: `1px solid ${BORDER}`, backgroundColor: "rgba(31,47,58,0.02)" }}>
                          <p className="text-base font-semibold mb-2" style={{ color: NAVY }}>
                            Try it. If it doesn&apos;t move in {monthsToBreakEven} days, drop to market and move on.
                          </p>
                          <p className="text-sm" style={{ color: MUTED }}>
                            Either way, you&apos;re in control. Set your price, pick your tenant, be done with it.
                          </p>
                        </div>
                      </div>
                    );
                  })() : (
                    <div className="p-5">
                      <div className="flex items-start gap-3">
                        <span className="text-lg mt-0.5">✅</span>
                        <p className="text-sm leading-relaxed" style={{ color: TEXT }}>
                          At <strong>${rent.toLocaleString()}/mo</strong>, you fill in ~{metrics.daysToFill} days with {metrics.pool}+ applicants.
                          {rent < rentMarket && ` At this price, expect a fast fill with a strong applicant pool — great if you want a quality tenant in place quickly.`}
                          {rent === rentMarket && " This is the sweet spot — competitive pricing with a solid applicant pool."}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Dynamic insight message */}
            <AnimatePresence mode="wait">
              <motion.div
                key={metrics.zone}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="p-5 rounded-xl text-sm leading-relaxed"
                style={{ backgroundColor: "rgba(255,255,255,0.8)", color: TEXT, border: `1px solid ${BORDER}` }}
              >
                <span className="text-lg mr-2">{metrics.zoneEmoji}</span>
                {metrics.rentability >= 70 && (
                  <><strong>Strong demand zone.</strong> At ${rent.toLocaleString()}/mo, you should see multiple qualified applicants within the first two weeks. This is where rent gets collected on time and tenants stay long-term.</>
                )}
                {metrics.rentability >= 40 && metrics.rentability < 70 && (
                  <><strong>Competitive but workable.</strong> The pool is smaller and it may take 3–4 weeks to fill. If the unit shows well and the listing is strong, this price can work. Each week empty costs you ${Math.round(rent / 4).toLocaleString()}.</>
                )}
                {metrics.rentability >= 15 && metrics.rentability < 40 && (
                  <><strong>Extended vacancy likely.</strong> At ${rent.toLocaleString()}/mo, expect the unit to sit for over a month. That&apos;s ${rent.toLocaleString()}+ in lost rent. The applicant pool gets weaker at this level — fewer options means less leverage on screening.</>
                )}
                {metrics.rentability < 15 && (
                  <><strong>Above what the market supports.</strong> At this level the applicant pool shrinks and vacancy time extends. Market rate gives you a bigger pool to screen from.</>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function MetricCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <motion.div
      className="text-center p-4 rounded-xl"
      style={{ backgroundColor: "rgba(255,255,255,0.6)", border: `1px solid ${BORDER}` }}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.15 }}
    >
      <span className="text-2xl block mb-1">{icon}</span>
      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: MUTED }}>{label}</p>
      <motion.p
        key={value}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        className="text-xl font-bold"
        style={{ color, fontFamily: "var(--font-cormorant)", transition: "color 0.3s" }}
      >
        {value}
      </motion.p>
    </motion.div>
  );
}
