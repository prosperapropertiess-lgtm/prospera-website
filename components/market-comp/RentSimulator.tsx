"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "@/components/animations/FadeIn";

const NAVY = "#1F2F3A";
const BURGUNDY = "#8B2030";
const TEXT = "#222222";
const MUTED = "#666666";
const BORDER = "#D8D2C8";
const GREEN = "#0A7A52";
const WARM_BG = "#F7F5F2";

interface Props {
  rentLow: number;
  rentMarket: number;
  rentPremium: number;
  compRents: number[];
}

export default function RentSimulator({ rentLow, rentMarket, rentPremium, compRents }: Props) {
  const floor = Math.max(Math.round(rentLow * 0.9 / 25) * 25, 500);
  const ceiling = Math.round((rentPremium + 500) / 25) * 25;
  const [rent, setRent] = useState(rentMarket);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const avgComp = compRents.length > 0
    ? Math.round(compRents.reduce((a, b) => a + b, 0) / compRents.length)
    : rentMarket;

  const metrics = useMemo(() => {
    // ── Rentability anchored to your thresholds, not slider position ──────────
    // Below low → 95%, at market → 72%, at premium → 48%, above premium → drops fast
    let rentability: number;
    if (rent <= rentLow) {
      rentability = 95;
    } else if (rent <= rentMarket) {
      const t = (rent - rentLow) / Math.max(1, rentMarket - rentLow);
      rentability = Math.round(95 - t * 23); // 95 → 72
    } else if (rent <= rentPremium) {
      const t = (rent - rentMarket) / Math.max(1, rentPremium - rentMarket);
      rentability = Math.round(72 - t * 24); // 72 → 48
    } else {
      const t = Math.min(1, (rent - rentPremium) / Math.max(1, 500));
      rentability = Math.round(48 - t * 38); // 48 → 10
    }
    rentability = Math.max(10, Math.min(100, rentability));

    // ── Days to fill: market rate = 4–5 weeks, as-expected ───────────────────
    let daysToFill: number;
    if (rent <= rentLow) {
      daysToFill = 14; // 2 weeks
    } else if (rent <= rentMarket) {
      const t = (rent - rentLow) / Math.max(1, rentMarket - rentLow);
      daysToFill = Math.round(14 + t * 16); // 14 → 30 days
    } else if (rent <= rentPremium) {
      const t = (rent - rentMarket) / Math.max(1, rentPremium - rentMarket);
      daysToFill = Math.round(30 + t * 18); // 30 → 48 days
    } else {
      const t = Math.min(1, (rent - rentPremium) / Math.max(1, 500));
      daysToFill = Math.round(48 + t * 42); // 48 → 90 days
    }

    // ── Applicant pool ────────────────────────────────────────────────────────
    let pool: number;
    if (rent <= rentLow) pool = 25;
    else if (rent <= rentMarket) {
      const t = (rent - rentLow) / Math.max(1, rentMarket - rentLow);
      pool = Math.round(25 - t * 12); // 25 → 13
    } else if (rent <= rentPremium) {
      const t = (rent - rentMarket) / Math.max(1, rentPremium - rentMarket);
      pool = Math.round(13 - t * 8); // 13 → 5
    } else {
      pool = Math.max(1, Math.round(5 - Math.floor((rent - rentPremium) / 100)));
    }

    // ── App quality tied to market distance ───────────────────────────────────
    const aboveMarket = rent - rentMarket;
    const appQuality = aboveMarket <= 0 ? "Excellent" : aboveMarket < 200 ? "Good" : aboveMarket < 400 ? "Fair" : "Weak";

    // ── Colour: green at/below market, amber at premium, red above ────────────
    const pos = Math.max(0, Math.min(1, (rent - floor) / Math.max(1, ceiling - floor)));
    const hue = Math.round(120 * Math.max(0, 1 - pos * 1.4));
    const color = `hsl(${hue}, 70%, 38%)`;
    const bgColor = `hsl(${hue}, 40%, 97%)`;
    const barColor = `hsl(${hue}, 65%, 48%)`;

    // ── Zone ──────────────────────────────────────────────────────────────────
    const zone = rent <= rentMarket ? "At Market" : rent <= rentPremium ? "Above Market" : "Above Premium";

    // ── Vacancy cost math ─────────────────────────────────────────────────────
    const vacancyCostPerWeek = Math.round(rent / 4.33);
    const totalVacancyCost = Math.round((rent / 30) * daysToFill);
    const weeksToFill = Math.round(daysToFill / 7);

    return {
      rentability, daysToFill, weeksToFill, pool, appQuality,
      color, bgColor, barColor, zone, pos,
      vacancyCostPerWeek, totalVacancyCost,
    };
  }, [rent, floor, ceiling, rentMarket, rentLow, rentPremium]);

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

  const isAtMarket = rent <= rentMarket;
  const isAboveMarket = rent > rentMarket && rent <= rentPremium;
  const isAbovePremium = rent > rentPremium;

  return (
    <section className="py-16 sm:py-20 px-5 sm:px-8" style={{ backgroundColor: WARM_BG }}>
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-center" style={{ color: MUTED }}>
            Rent Simulator
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center" style={{ color: NAVY, fontFamily: "var(--font-dm-sans)" }}>
            What happens at each price point
          </h2>
          <p className="text-sm mb-10 text-center max-w-xl mx-auto" style={{ color: MUTED, lineHeight: 1.7 }}>
            Move the slider to see how your asking rent affects fill time, applicant volume, and income.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div
            className="rounded-2xl border p-6 sm:p-8"
            style={{ borderColor: BORDER, backgroundColor: "#FFFFFF" }}
          >
            {/* Big rent number */}
            <div className="text-center mb-6">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={rent}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 8, opacity: 0 }}
                  transition={{ duration: 0.13 }}
                  className="text-5xl sm:text-6xl font-bold block"
                  style={{ color: metrics.color, fontFamily: "var(--font-cormorant)", transition: "color 0.3s" }}
                >
                  ${rent.toLocaleString()}
                </motion.span>
              </AnimatePresence>
              <p className="text-sm mt-1" style={{ color: MUTED }}>/month</p>

              <div className="flex justify-center mt-3">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={metrics.zone}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.15 }}
                    className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
                    style={{ backgroundColor: metrics.color, color: "#fff" }}
                  >
                    {metrics.zone}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            {/* Slider */}
            <div className="mb-2">
              <div
                ref={trackRef}
                className="relative h-10 cursor-pointer select-none touch-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                {/* Track */}
                <div
                  className="absolute top-4 left-0 right-0 h-2.5 rounded-full"
                  style={{ background: "linear-gradient(to right, #22c55e, #84cc16, #eab308, #f97316, #ef4444)" }}
                />

                {/* Threshold markers */}
                {[
                  { val: rentLow, label: "Low", color: "#16a34a" },
                  { val: rentMarket, label: "Market", color: NAVY },
                  { val: rentPremium, label: "Premium", color: "#d97706" },
                ].map((m) => {
                  const pct = ((m.val - floor) / (ceiling - floor)) * 100;
                  if (pct < 0 || pct > 100) return null;
                  return (
                    <div key={m.label} className="absolute" style={{ left: `${pct}%`, top: "0px" }}>
                      <div className="w-0.5 h-4" style={{ backgroundColor: m.color, marginLeft: "-1px" }} />
                      <div className="absolute -translate-x-1/2 mt-6 text-xs font-semibold whitespace-nowrap" style={{ color: m.color, top: 0 }}>
                        {m.label}
                      </div>
                    </div>
                  );
                })}

                {/* Thumb */}
                <div
                  className="absolute top-1 -ml-4 w-8 h-8 rounded-full border-[3px] border-white shadow-md"
                  style={{
                    left: `${metrics.pos * 100}%`,
                    backgroundColor: metrics.color,
                    transition: "background-color 0.3s",
                    boxShadow: `0 0 0 3px ${metrics.color}30, 0 3px 10px rgba(0,0,0,0.18)`,
                  }}
                />
              </div>
            </div>

            {/* Range labels */}
            <div className="flex justify-between text-xs mb-10 mt-6" style={{ color: MUTED }}>
              <span>${floor.toLocaleString()}</span>
              <span>${ceiling.toLocaleString()}</span>
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                {
                  label: "Rentability",
                  value: `${metrics.rentability}%`,
                  sub: metrics.rentability >= 70 ? "High demand" : metrics.rentability >= 50 ? "Moderate" : "Low demand",
                },
                {
                  label: "Days to Fill",
                  value: `${metrics.daysToFill}d`,
                  sub: `≈ ${metrics.weeksToFill} week${metrics.weeksToFill !== 1 ? "s" : ""}`,
                },
                {
                  label: "Applicant Pool",
                  value: `${metrics.pool}+`,
                  sub: metrics.pool >= 15 ? "Strong" : metrics.pool >= 7 ? "Moderate" : "Thin",
                },
                {
                  label: "App Quality",
                  value: metrics.appQuality,
                  sub: rent <= rentMarket ? "At market" : rent <= rentPremium ? "Above market" : "Above premium",
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-xl p-4 text-center"
                  style={{ backgroundColor: WARM_BG, border: `1px solid ${BORDER}` }}
                >
                  <p className="text-xs uppercase tracking-wider mb-2" style={{ color: MUTED }}>{m.label}</p>
                  <AnimatePresence mode="popLayout">
                    <motion.p
                      key={m.value}
                      initial={{ y: -5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 5, opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className="text-xl font-bold mb-0.5"
                      style={{ color: metrics.color, fontFamily: "var(--font-cormorant)", transition: "color 0.3s" }}
                    >
                      {m.value}
                    </motion.p>
                  </AnimatePresence>
                  <p className="text-xs" style={{ color: MUTED }}>{m.sub}</p>
                </div>
              ))}
            </div>

            {/* Rentability bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium" style={{ color: MUTED }}>Rentability</span>
                <span className="text-xs font-bold" style={{ color: metrics.color }}>{metrics.rentability}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(0,0,0,0.06)" }}>
                <motion.div
                  className="h-full rounded-full"
                  animate={{ width: `${metrics.rentability}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{ backgroundColor: metrics.barColor, transition: "background-color 0.3s" }}
                />
              </div>
            </div>

            {/* Single honest analysis block — one message, no contradictions */}
            <AnimatePresence mode="wait">
              <motion.div
                key={isAtMarket ? "at" : isAboveMarket ? "above" : "premium"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="rounded-xl p-5"
                style={{
                  border: `1px solid ${isAtMarket ? "rgba(10,122,82,0.2)" : isAboveMarket ? "rgba(180,83,9,0.2)" : "rgba(185,28,28,0.2)"}`,
                  backgroundColor: isAtMarket ? "rgba(10,122,82,0.04)" : isAboveMarket ? "rgba(180,83,9,0.04)" : "rgba(185,28,28,0.04)",
                }}
              >
                {isAtMarket && (
                  <>
                    <p className="text-sm font-semibold mb-1" style={{ color: GREEN }}>
                      Solid position. Expect to fill in {metrics.weeksToFill}–{metrics.weeksToFill + 1} weeks.
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: TEXT }}>
                      At <strong>${rent.toLocaleString()}/mo</strong> you&apos;re priced at or below market.{" "}
                      {rent < rentMarket
                        ? `You'll attract a strong pool of ${metrics.pool}+ applicants and fill quickly. Great if you want a reliable tenant in place with no drama.`
                        : `This is the market sweet spot — ${metrics.pool}+ applicants, strong quality, and you get to be selective. Most units at market rate fill within 4–5 weeks.`}
                    </p>
                  </>
                )}

                {isAboveMarket && (() => {
                  const diff = rent - rentMarket;
                  const isLow = metrics.rentability >= 60;
                  return (
                    <>
                      <p className="text-sm font-semibold mb-1" style={{ color: "#d97706" }}>
                        ${diff.toLocaleString()}/mo above market — {isLow ? "possible if the unit shows well" : "expect a longer wait"}.
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: TEXT }}>
                        At <strong>${rent.toLocaleString()}/mo</strong>, you&apos;re asking above what comparable units are getting.
                        Expect around <strong>{metrics.weeksToFill} weeks</strong> to fill, with a smaller applicant pool ({metrics.pool}+ people).
                        {isLow
                          ? " If the unit is in great condition and your listing stands out, this is achievable — but give it 2–3 weeks before reassessing."
                          : " Every week empty costs you $" + metrics.vacancyCostPerWeek.toLocaleString() + ". Dropping to market rate closes that gap quickly."}
                      </p>
                    </>
                  );
                })()}

                {isAbovePremium && (() => {
                  const abovePremium = rent - rentPremium;
                  return (
                    <>
                      <p className="text-sm font-semibold mb-1" style={{ color: "#B91C1C" }}>
                        ${abovePremium.toLocaleString()}/mo above the market ceiling. The math doesn&apos;t work here.
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: TEXT }}>
                        At <strong>${rent.toLocaleString()}/mo</strong>, you&apos;re above what this market supports.
                        Expect the unit to sit for <strong>{metrics.weeksToFill}+ weeks</strong> — that&apos;s{" "}
                        <strong>${metrics.totalVacancyCost.toLocaleString()}</strong> in lost rent while you wait.
                        The applicant pool at this price is too thin to be selective.
                        Pricing at premium (${rentPremium.toLocaleString()}) fills faster and nets you more in year one.
                      </p>
                    </>
                  );
                })()}
              </motion.div>
            </AnimatePresence>

          </div>
        </FadeIn>

        {/* Comp average note */}
        {compRents.length > 0 && (
          <FadeIn delay={0.15}>
            <p className="text-xs text-center mt-4" style={{ color: MUTED }}>
              Comparable avg: <strong style={{ color: TEXT }}>${avgComp.toLocaleString()}/mo</strong> across {compRents.length} units in this market.
            </p>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
