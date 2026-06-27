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
    const maxDays = 60;
    const daysToFill = Math.round(baseDays + (maxDays - baseDays) * Math.pow(pos, 1.3));

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

    const expectedVacancy = daysToFill / 30;
    const annualIncome = rent * (12 - expectedVacancy);
    const marketVacancy = (baseDays + (maxDays - baseDays) * Math.pow((rentMarket - floor) / range, 1.3)) / 30;
    const marketAnnual = rentMarket * (12 - marketVacancy);
    const incomeDiff = annualIncome - marketAnnual;

    return { rentability, daysToFill, appQuality, pool, color, bgColor, barColor, zone, zoneEmoji, annualIncome, marketAnnual, incomeDiff, pos };
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
              <AnimatePresence mode="wait">
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

            {/* Annual income comparison */}
            <div className="grid grid-cols-2 gap-4 p-5 rounded-xl mb-6" style={{ backgroundColor: "rgba(255,255,255,0.7)", border: `1px solid ${BORDER}` }}>
              <div className="text-center">
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: MUTED }}>Your Annual Income</p>
                <motion.p
                  key={Math.round(metrics.annualIncome)}
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  className="text-2xl sm:text-3xl font-bold"
                  style={{ color: metrics.color, fontFamily: "var(--font-cormorant)" }}
                >
                  ${Math.round(metrics.annualIncome).toLocaleString()}
                </motion.p>
                <p className="text-xs mt-1" style={{ color: MUTED }}>
                  after ~{metrics.daysToFill} day vacancy
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: MUTED }}>At Market Rate</p>
                <p className="text-2xl sm:text-3xl font-bold" style={{ color: NAVY, fontFamily: "var(--font-cormorant)" }}>
                  ${Math.round(metrics.marketAnnual).toLocaleString()}
                </p>
                <p className="text-xs mt-1 font-medium" style={{ color: metrics.incomeDiff >= 0 ? "#16a34a" : "#dc2626" }}>
                  {metrics.incomeDiff >= 0 ? "+" : ""}${Math.round(metrics.incomeDiff).toLocaleString()}/yr vs market
                </p>
              </div>
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
                  <><strong>Above what the market supports.</strong> This pricing will likely result in 6+ weeks of vacancy with a weak applicant pool. The math works against you here — at market rate (${rentMarket.toLocaleString()}) you&apos;d actually earn <strong>${Math.round(metrics.marketAnnual - metrics.annualIncome).toLocaleString()} more per year</strong>.</>
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
