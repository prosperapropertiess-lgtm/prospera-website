"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import FadeIn from "@/components/animations/FadeIn";
import WaitlistForm from "@/components/ui/WaitlistForm";
import { ShaderBackground } from "@/components/ui/animated-shader-hero";
import { CyclingTypewriter } from "@/components/ui/typewriter-effect";

// ── Design tokens ─────────────────────────────────────────────────────────────
const PAGE_BG = "#070B11";
const CARD_BG = "rgba(255,255,255,0.03)";
const CARD_BORDER = "rgba(255,255,255,0.07)";
const TEXT_1 = "#FAF8F5";
const TEXT_2 = "rgba(250,248,245,0.6)";
const TEXT_3 = "rgba(250,248,245,0.35)";
const ACCENT = "#8B2030";
const ACCENT_DIM = "rgba(139,32,48,0.18)";
const DIVIDER = "rgba(255,255,255,0.06)";

// ── PhoneFrame ────────────────────────────────────────────────────────────────

function PhoneFrame({ src, alt, tall }: { src: string; alt: string; tall?: boolean }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: 260, height: tall ? 560 : 480 }}>
      <div
        className="absolute inset-0 rounded-[44px] blur-3xl scale-90 pointer-events-none"
        style={{ backgroundColor: "rgba(139,32,48,0.14)" }}
      />
      <div
        className="relative w-full h-full rounded-[44px] p-[3px]"
        style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.09)" }}
      >
        <div
          className="relative w-full h-full rounded-[41px] overflow-hidden"
          style={{
            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.12), 0 32px 64px rgba(0,0,0,0.22)",
            background: "#080C12",
          }}
        >
          <Image src={src} alt={alt} fill className="object-cover object-top" sizes="260px" />
        </div>
      </div>
    </div>
  );
}

// ── Pain data ─────────────────────────────────────────────────────────────────

const painMoments = [
  { num: "01", headline: "It's the 3rd. Rent was due on the 1st.", sub: "You've sent two texts. Nothing back. The mortgage doesn't care.", weight: "high" },
  { num: "02", headline: "Your mortgage renewed.", sub: "$1,800 became $3,200. You're collecting $2,800. You stared at the ceiling.", weight: "high" },
  { num: "03", headline: "A property manager quoted you 12–15%.", sub: "That's $336–$420 a month. On a property that's barely breaking even.", weight: "medium" },
  { num: "04", headline: "Googling 'N4 form Ontario' at 11pm.", sub: "You're not even sure you filled it out right. And even less sure what happens next.", weight: "medium" },
  { num: "05", headline: "Your phone vibrates at 11:42pm.", sub: "Hot water heater. Making a noise. It's your tenant. You're the helpdesk now.", weight: "high" },
  { num: "06", headline: "You tried the big PM software once.", sub: "$200/month. 40 features built for someone with 200 units. You closed the tab.", weight: "medium" },
  { num: "07", headline: "Tax time. Where are the receipts?", sub: "Gmail. Notes. A spreadsheet you stopped updating in February. Good luck.", weight: "medium" },
  { num: "08", headline: "You have 2 properties. Every tool was built for 20.", sub: "There is nothing on the market made for the landlord trying to build quiet wealth.", weight: "high" },
];

// ── PainCard ──────────────────────────────────────────────────────────────────

function PainCard({ moment, index, fullWidth }: { moment: typeof painMoments[0]; index: number; fullWidth?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.05, ease: [0.32, 0.72, 0, 1] }}
    >
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className={`relative h-full rounded-2xl overflow-hidden ${
          fullWidth ? "flex flex-col sm:flex-row items-start gap-8 sm:gap-16 p-8" : "flex flex-col gap-4 p-7"
        }`}
        style={{
          backgroundColor: moment.weight === "high" ? "rgba(139,32,48,0.06)" : CARD_BG,
          border: "1px solid",
          borderColor: moment.weight === "high" ? ACCENT_DIM : CARD_BORDER,
        }}
      >
        <span
          className="absolute top-4 right-5 text-7xl font-bold leading-none select-none pointer-events-none"
          style={{ color: "rgba(250,248,245,0.03)", fontFamily: "var(--font-dm-sans)" }}
        >
          {moment.num}
        </span>
        <div className={fullWidth ? "flex-1 min-w-0" : "flex flex-col gap-4"}>
          <span
            className="text-xs font-semibold uppercase tracking-widest block mb-3"
            style={{
              color: moment.weight === "high" ? ACCENT : "rgba(250,248,245,0.2)",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {moment.num}
          </span>
          <h3
            className={`font-light leading-snug ${fullWidth ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"}`}
            style={{ color: TEXT_1, fontFamily: "var(--font-cormorant)" }}
          >
            {moment.headline}
          </h3>
          {!fullWidth && (
            <p className="text-sm leading-relaxed" style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)" }}>
              {moment.sub}
            </p>
          )}
        </div>
        {fullWidth && (
          <div className="flex-1 min-w-0 flex items-end">
            <p className="text-base leading-relaxed" style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)" }}>
              {moment.sub}
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Comparison data ───────────────────────────────────────────────────────────

const comparisons = [
  { label: "Cost per month", diy: "Your time", bigpm: "$200–$400/mo", prospera: "A fraction of that" },
  { label: "Rent collection", diy: "Manual texting", bigpm: "✓", prospera: "✓ Automated" },
  { label: "N4 / legal notices", diy: "Google it", bigpm: "✓ (with help)", prospera: "✓ Auto-generated" },
  { label: "Maintenance workflow", diy: "Phone calls", bigpm: "✓ (you coordinate)", prospera: "✓ AI-triaged" },
  { label: "Built for 1–5 units", diy: "✓ (barely)", bigpm: "✗ Built for 20+", prospera: "✓ Designed for you" },
  { label: "You stay in control", diy: "✓", bigpm: "✗ You hand it over", prospera: "✓ Always" },
  { label: "Contracts required", diy: "—", bigpm: "✓ Often 1–2 year", prospera: "✗ None. Ever." },
  { label: "Money-back guarantee", diy: "—", bigpm: "✗", prospera: "✓ 90 days" },
];

// ── BentoCard ─────────────────────────────────────────────────────────────────

function BentoCard({
  eyebrow,
  headline,
  body,
  bullets,
  screen,
  alt,
}: {
  eyebrow: string;
  headline: string;
  body?: string;
  bullets?: string[];
  screen: string;
  alt: string;
}) {
  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden h-full"
      style={{
        background: CARD_BG,
        border: `1px solid ${CARD_BORDER}`,
        borderRadius: "1rem",
      }}
    >
      <div className="p-6 flex flex-col gap-3 flex-1">
        <p className="text-xs uppercase tracking-widest" style={{ color: TEXT_3, fontFamily: "var(--font-dm-sans)" }}>
          {eyebrow}
        </p>
        <h3 className="text-xl sm:text-2xl font-light leading-snug" style={{ color: TEXT_1, fontFamily: "var(--font-cormorant)" }}>
          {headline}
        </h3>
        {body && (
          <p className="text-sm leading-relaxed" style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)" }}>
            {body}
          </p>
        )}
        {bullets && (
          <ul className="space-y-1.5 mt-1">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "rgba(250,248,245,0.45)", fontFamily: "var(--font-dm-sans)" }}>
                <span className="flex-shrink-0 font-bold" style={{ color: ACCENT }}>✓</span>
                {b}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="relative h-52 overflow-hidden">
        <div
          className="absolute inset-x-0 top-0 h-12 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(7,11,17,0.8), transparent)" }}
        />
        <Image src={screen} alt={alt} fill className="object-cover object-top" sizes="(max-width: 768px) 100vw, 50vw" />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PlatformPage() {
  return (
    <div style={{ backgroundColor: PAGE_BG }}>

      {/* ── 1. HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden flex flex-col items-center text-center"
        style={{ minHeight: "100svh", backgroundColor: PAGE_BG }}
      >
        {/* Shader bg */}
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.15 }}>
          <ShaderBackground className="w-full h-full object-cover" />
        </div>

        {/* Radial burgundy glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(139,32,48,0.25) 0%, transparent 70%)",
          }}
        />

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
          style={{ background: `linear-gradient(to bottom, transparent, ${PAGE_BG})` }}
        />

        <div className="relative z-10 flex flex-col items-center px-5 sm:px-8 pt-36 pb-20 w-full max-w-5xl mx-auto">
          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
          >
            <motion.span
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: ACCENT }}
            />
            <span
              className="text-xs font-medium tracking-widest uppercase"
              style={{ color: TEXT_3, fontFamily: "var(--font-dm-sans)" }}
            >
              Prospera Platform · Waitlist Open
            </span>
          </motion.div>

          {/* H1 + Typewriter */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="mb-8 max-w-4xl w-full"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            <h1
              className="text-5xl sm:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight"
              style={{ color: TEXT_1 }}
            >
              You Bought{" "}
              <span style={{ color: ACCENT }}>Passive Income.</span>
            </h1>
            <CyclingTypewriter
              className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight mt-4"
              color={TEXT_3}
              phrases={[
                "Not another landlord buried in admin.",
                "Not a 2am call from a burst pipe.",
                "Not another bounced cheque and no recourse.",
                "Not a weekend lost to filing N4s.",
                "Not another tenant \"I'll pay you Friday.\"",
                "Not spreadsheets, sticky notes, and prayer.",
                "Not the stress that made you question this.",
              ]}
            />
          </motion.div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.42 }}
            className="text-base sm:text-lg mb-8 max-w-lg"
            style={{ color: "rgba(250,248,245,0.4)", fontFamily: "var(--font-dm-sans)", lineHeight: 1.6 }}
          >
            Built for Ontario landlords with 1 to 5 properties. All the automation, none of the overhead.
          </motion.p>

          {/* Waitlist form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.52 }}
            className="w-full max-w-md mb-5"
          >
            <WaitlistForm layout="stack" dark source="platform_hero" />
          </motion.div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.72 }}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-16"
          >
            {["✓  90-day money-back", "✓  No contracts", "✓  Personal onboarding"].map((t, i) => (
              <span key={i} className="text-xs" style={{ color: TEXT_3, fontFamily: "var(--font-dm-sans)" }}>
                {t}
              </span>
            ))}
          </motion.div>

          {/* Phone mockup */}
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.32, 0.72, 0, 1] }}
            className="relative inline-flex items-start justify-center"
          >
            {/* Ambient glow */}
            <div
              className="absolute pointer-events-none"
              style={{
                width: 500,
                height: 300,
                bottom: -60,
                left: "50%",
                transform: "translateX(-50%)",
                background: "radial-gradient(ellipse, rgba(139,32,48,0.22) 0%, transparent 70%)",
                filter: "blur(30px)",
              }}
            />

            {/* Floating chip — left */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              className="absolute -left-4 sm:-left-16 top-16 z-20 rounded-2xl px-3.5 py-2.5 flex items-center gap-3 shadow-2xl"
              style={{ backgroundColor: "#FFFFFF", minWidth: 168, border: "1px solid rgba(0,0,0,0.06)" }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
                style={{ backgroundColor: "#DCFCE7" }}
              >
                ✓
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: "#111", fontFamily: "var(--font-dm-sans)" }}>
                  Rent received
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#888", fontFamily: "var(--font-dm-sans)" }}>
                  $2,800 · 550 Second St
                </p>
              </div>
            </motion.div>

            {/* Floating chip — right top */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.6, duration: 0.5 }}
              className="absolute -right-4 sm:-right-16 top-28 z-20 rounded-2xl px-3.5 py-2.5 shadow-2xl"
              style={{
                backgroundColor: "#1A2332",
                minWidth: 172,
                border: "1px solid rgba(250,248,245,0.08)",
              }}
            >
              <p className="text-xs font-semibold" style={{ color: TEXT_1, fontFamily: "var(--font-dm-sans)" }}>
                N4 auto-generated
              </p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(250,248,245,0.4)", fontFamily: "var(--font-dm-sans)" }}>
                Unit 2 · 2 days late
              </p>
            </motion.div>

            {/* Floating chip — bottom right */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.9, duration: 0.5 }}
              className="absolute -right-4 sm:-right-12 bottom-28 z-20 rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-2xl"
              style={{ backgroundColor: "#0D1820", border: `1px solid ${CARD_BORDER}`, minWidth: 172 }}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ACCENT }} />
              <div>
                <p className="text-xs font-semibold" style={{ color: TEXT_1, fontFamily: "var(--font-dm-sans)" }}>
                  Maintenance triaged
                </p>
                <p className="text-xs mt-0.5" style={{ color: TEXT_3, fontFamily: "var(--font-dm-sans)" }}>
                  AI · Low urgency
                </p>
              </div>
            </motion.div>

            {/* Phone shell */}
            <div
              className="relative rounded-[48px] p-[3px]"
              style={{
                width: 280,
                height: 580,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 60px 120px rgba(0,0,0,0.7)",
              }}
            >
              <div
                className="relative w-full h-full rounded-[45px] overflow-hidden"
                style={{
                  boxShadow: "inset 0 1px 1px rgba(255,255,255,0.15)",
                  background: "#050505",
                }}
              >
                <Image
                  src="/app-screens/landlord_dashboard_1.png"
                  alt="Prospera landlord dashboard"
                  fill
                  className="object-cover object-top"
                  sizes="280px"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 2. SCARCITY STRIP ───────────────────────────────────────────────── */}
      <section className="py-3 px-5 sm:px-8" style={{ backgroundColor: ACCENT }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-center">
          <p className="text-sm font-semibold" style={{ color: TEXT_1, fontFamily: "var(--font-dm-sans)" }}>
            We are personally onboarding{" "}
            <span className="line-through opacity-50">5</span>{" "}
            <span className="font-bold">3 more landlords</span> this month.
          </p>
          <span className="hidden sm:block text-xs opacity-40" style={{ color: TEXT_1 }}>·</span>
          <p className="text-xs" style={{ color: "rgba(250,248,245,0.75)", fontFamily: "var(--font-dm-sans)" }}>
            Next cohort is 4–6 weeks away.
          </p>
        </div>
      </section>

      {/* ── 3. FACT STRIP ───────────────────────────────────────────────────── */}
      <section
        className="border-b"
        style={{ backgroundColor: PAGE_BG, borderColor: DIVIDER, paddingTop: "1.75rem", paddingBottom: "1.75rem" }}
      >
        <FadeIn>
          <div className="max-w-5xl mx-auto px-5 sm:px-8 flex flex-wrap gap-x-10 gap-y-3 items-center justify-center">
            {[
              "Saves landlords 8+ hours a month",
              "First property live in under 2 minutes",
              "90-day money-back guarantee",
              "No contracts. Ever.",
            ].map((fact, i) => (
              <p key={i} className="text-sm" style={{ color: "rgba(250,248,245,0.55)", fontFamily: "var(--font-dm-sans)" }}>
                <span className="font-bold mr-2" style={{ color: TEXT_1 }}>·</span>
                {fact}
              </p>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ── 4. PAIN SECTION ─────────────────────────────────────────────────── */}
      <section className="py-32 px-5 sm:px-8" style={{ backgroundColor: PAGE_BG }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <h2
              className="text-4xl sm:text-5xl font-light text-center mb-4 leading-tight"
              style={{ color: TEXT_1, fontFamily: "var(--font-cormorant)" }}
            >
              How many of these hit home?
            </h2>
            <p
              className="text-base text-center mb-14 max-w-xl mx-auto"
              style={{ color: TEXT_2, fontFamily: "var(--font-dm-sans)" }}
            >
              If you manage 1–5 properties in Ontario, at least 5 of these are your Tuesday.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {painMoments.map((m, i) => {
              const pairIndex = Math.floor(i / 2);
              const posInPair = i % 2;
              const isWide = pairIndex % 2 === 0 ? posInPair === 0 : posInPair === 1;
              return (
                <div key={i} className={isWide ? "lg:col-span-2" : "lg:col-span-1"}>
                  <PainCard moment={m} index={i} fullWidth={isWide} />
                </div>
              );
            })}
          </div>

          <FadeIn delay={0.5}>
            <p
              className="text-center mt-12 text-2xl sm:text-3xl font-light italic"
              style={{ color: ACCENT, fontFamily: "var(--font-cormorant)" }}
            >
              That&apos;s exactly why this exists.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── 5. FEATURE BENTO GRID ───────────────────────────────────────────── */}
      <section className="py-32 px-5 sm:px-8" style={{ backgroundColor: PAGE_BG }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p
              className="text-xs uppercase tracking-widest text-center mb-4"
              style={{ color: TEXT_3, fontFamily: "var(--font-dm-sans)" }}
            >
              Inside the app
            </p>
            <h2
              className="text-4xl sm:text-5xl font-bold text-center mb-4 leading-tight"
              style={{ color: TEXT_1, fontFamily: "var(--font-dm-sans)" }}
            >
              See what your life looks like.
            </h2>
            <p
              className="text-base text-center mb-14 max-w-xl mx-auto"
              style={{ color: TEXT_2, fontFamily: "var(--font-dm-sans)" }}
            >
              This isn&apos;t a concept. It exists. These are real screens.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

            {/* Cell 1 — Dashboard (wide) */}
            <FadeIn className="lg:col-span-2 md:col-span-2">
              <BentoCard
                eyebrow="Dashboard"
                headline="Wake up to this every morning."
                body="Every property, every payment, every open issue — one scroll. No calls, no spreadsheets, no surprises."
                bullets={[
                  "Rent collected vs. expected — at a glance",
                  "All open maintenance, ranked by urgency",
                  "Recent activity log so nothing slips through",
                ]}
                screen="/app-screens/landlord_dashboard_1.png"
                alt="Prospera landlord dashboard"
              />
            </FadeIn>

            {/* Cell 2 — Invisible Automations */}
            <FadeIn delay={0.07} className="lg:col-span-1">
              <BentoCard
                eyebrow="Automations"
                headline="This is what happened while you watched Netflix."
                body="Triaged a faucet. Cleared a payment. Auto-filed an N4. You did nothing."
                bullets={[
                  "Maintenance auto-triaged, contractor notified",
                  "N4 generated the moment rent is overdue",
                ]}
                screen="/app-screens/invisible_automations_log_1.png"
                alt="Invisible automations log"
              />
            </FadeIn>

            {/* Cell 3 — Maintenance */}
            <FadeIn delay={0.1} className="lg:col-span-1">
              <BentoCard
                eyebrow="Maintenance"
                headline="Tenant texts at 11pm. You sleep."
                bullets={[
                  "AI identifies issue from tenant photos",
                  "Contractor message drafted and sent in one tap",
                ]}
                screen="/app-screens/maintenance_request_1.png"
                alt="AI maintenance triage"
              />
            </FadeIn>

            {/* Cell 4 — Smart Lease Renewal (wide) */}
            <FadeIn delay={0.13} className="lg:col-span-2 md:col-span-2">
              <BentoCard
                eyebrow="Lease Renewals"
                headline="The market moved. Your rent should too."
                body="Market data attached. N1 auto-generated. Done in 3 minutes."
                bullets={[
                  "Real-time comparable rent analysis by neighbourhood",
                  "N1 notice auto-generated and sent to tenant",
                ]}
                screen="/app-screens/smart_lease_renewal_1.png"
                alt="Smart lease renewal"
              />
            </FadeIn>

            {/* Cell 5 — Financials */}
            <FadeIn delay={0.16} className="lg:col-span-1">
              <BentoCard
                eyebrow="Financials"
                headline="Finally know if you're actually making money."
                bullets={[
                  "Income vs. expense by property and month",
                  "One-click CSV export for your accountant",
                ]}
                screen="/app-screens/financials_dashboard_1.png"
                alt="Financial dashboard"
              />
            </FadeIn>

          </div>
        </div>
      </section>

      {/* ── 6. PERSONALIZED ONBOARDING ──────────────────────────────────────── */}
      <section
        className="py-32 px-5 sm:px-8 border-t"
        style={{ backgroundColor: PAGE_BG, borderColor: DIVIDER }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-20">
            {/* Copy */}
            <div className="flex-1">
              <FadeIn>
                <p
                  className="text-xs uppercase tracking-widest mb-4"
                  style={{ color: TEXT_3, fontFamily: "var(--font-dm-sans)" }}
                >
                  White-glove onboarding
                </p>
                <h2
                  className="text-4xl sm:text-5xl font-bold mb-6 leading-tight"
                  style={{ color: TEXT_1, fontFamily: "var(--font-dm-sans)" }}
                >
                  We don&apos;t just hand you software<br />and wish you luck.
                </h2>
                <p
                  className="text-base leading-relaxed mb-4"
                  style={{ color: TEXT_2, fontFamily: "var(--font-dm-sans)" }}
                >
                  When you join, a Prospera team member personally walks you through setup. We add your properties together. We send your tenants their invites. We make sure your first rent collection runs automatically. Most landlords are fully live in under 30 minutes.
                </p>
                <p
                  className="text-base leading-relaxed mb-8"
                  style={{ color: TEXT_2, fontFamily: "var(--font-dm-sans)" }}
                >
                  This isn&apos;t a chatbot FAQ. It&apos;s a real person — from Prospera — making sure you actually succeed.
                </p>
                <ul className="space-y-3">
                  {[
                    "1-on-1 setup session with a Prospera team member",
                    "We add your first property together, live",
                    "Your tenants are invited and onboarded for you",
                    "First month automated before you hang up",
                    "Ongoing support — text, call, or in-app",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-sm font-medium"
                      style={{ color: TEXT_2, fontFamily: "var(--font-dm-sans)" }}
                    >
                      <span style={{ color: ACCENT }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </FadeIn>
            </div>
            {/* Phone */}
            <FadeIn delay={0.2} className="flex-shrink-0">
              <PhoneFrame src="/app-screens/onboarding_checklist_landlord_gamified.png" alt="Personalized onboarding" tall />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── 7. GUARANTEE ────────────────────────────────────────────────────── */}
      <section className="py-32 px-5 sm:px-8" style={{ backgroundColor: PAGE_BG }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h2
              className="text-4xl sm:text-5xl font-bold text-center mb-5 leading-tight"
              style={{ color: TEXT_1, fontFamily: "var(--font-dm-sans)" }}
            >
              Zero risk. Literally.
            </h2>
            <p
              className="text-base text-center mb-14 max-w-xl mx-auto leading-relaxed"
              style={{ color: TEXT_2, fontFamily: "var(--font-dm-sans)" }}
            >
              We&apos;re so confident this will change how you manage your properties that we back it with a guarantee most software companies would never offer.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                num: "01",
                title: "90-Day Money-Back",
                body: "Try it for 90 days. If it hasn't saved you at least 8 hours a month — we refund everything. No forms. No questions. Done.",
                highlight: true,
              },
              {
                num: "02",
                title: "No Contracts. Ever.",
                body: "Month to month. Always. We don't believe in trapping landlords. If you leave, you leave.",
              },
              {
                num: "03",
                title: "Cancel Anytime",
                body: "One click. No phone calls, no cancellation fees, no 30-day notice periods. Leave whenever you want.",
              },
              {
                num: "04",
                title: "Your Data, Always",
                body: "If we ever shut down, you get 6 months notice and a full export of every record, document, and transaction.",
              },
            ].map((g, i) => (
              <FadeIn key={i} delay={i * 0.07}>
                <div
                  className="rounded-2xl p-7 h-full flex flex-col gap-4"
                  style={{
                    backgroundColor: g.highlight ? "rgba(139,32,48,0.08)" : CARD_BG,
                    border: "1px solid",
                    borderColor: g.highlight ? "rgba(139,32,48,0.2)" : CARD_BORDER,
                  }}
                >
                  <span
                    className="text-xs font-semibold tracking-widest"
                    style={{ color: TEXT_3, fontFamily: "var(--font-dm-sans)" }}
                  >
                    {g.num}
                  </span>
                  <h3
                    className="text-lg font-bold leading-snug"
                    style={{ color: TEXT_1, fontFamily: "var(--font-dm-sans)" }}
                  >
                    {g.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: TEXT_2, fontFamily: "var(--font-dm-sans)" }}
                  >
                    {g.body}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. FOUNDER LETTER ───────────────────────────────────────────────── */}
      <section
        className="py-32 px-5 sm:px-8 border-t"
        style={{ backgroundColor: PAGE_BG, borderColor: DIVIDER }}
      >
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <p
              className="text-xs uppercase tracking-widest mb-12"
              style={{ color: TEXT_3, fontFamily: "var(--font-dm-sans)" }}
            >
              From the founder
            </p>
          </FadeIn>
          <div className="flex flex-col lg:flex-row gap-14 lg:gap-20">
            {/* Photo + identity */}
            <FadeIn delay={0.1} className="flex-shrink-0 flex flex-col items-start gap-5">
              <div
                className="relative w-52 h-64 rounded-2xl overflow-hidden"
                style={{ border: `1px solid ${CARD_BORDER}` }}
              >
                <Image
                  src="/ebin-founder.jpg"
                  alt="Ebin Jaison — Founder, Prospera Properties"
                  fill
                  className="object-cover object-top"
                  sizes="260px"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(7,11,17,0.5) 0%, transparent 60%)" }}
                />
              </div>
              <div>
                <p
                  className="text-lg font-light"
                  style={{ color: TEXT_1, fontFamily: "var(--font-cormorant)" }}
                >
                  Ebin Jaison
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: TEXT_3, fontFamily: "var(--font-dm-sans)" }}
                >
                  Founder, Prospera Properties
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: TEXT_3, fontFamily: "var(--font-dm-sans)" }}
                >
                  London, Ontario · Managing since 2021
                </p>
              </div>
            </FadeIn>

            {/* Letter body */}
            <div className="flex-1 space-y-6">
              {[
                { text: "Let me be straight with you.", large: true },
                {
                  text: "Your mortgage just renewed. What used to be $1,800 is now $3,200. You're collecting $2,800 in rent. You told yourself you'd hire a property manager when the numbers made sense — but now they're quoting you 10–15%, and that's $280–$420 a month you simply don't have. So you're doing it yourself.",
                },
                {
                  text: "You're texting your tenant on the 3rd when rent was due on the 1st. You're Googling \"N4 form Ontario\" at 11pm on a Thursday. You're getting calls at 7am because the dryer is making a noise. You didn't sign up for this. You signed up to build wealth.",
                },
                {
                  text: "I've been managing properties in London, Ontario for 3 years. I've personally tested Buildium, AppFolio, Rentec Direct, Propertyware. Every one of them is built for operators with 50+ units and full-time staff. Nothing — nothing — exists for the person with 1, 2, maybe 3 rental units trying to make the numbers work without it consuming their life.",
                },
                {
                  text: "So I built the app I wish existed three years ago. Not for the big operators. For you.",
                  emphasis: true,
                },
              ].map((block, i) => (
                <FadeIn key={i} delay={i * 0.07}>
                  <p
                    className={
                      block.large
                        ? "text-2xl sm:text-3xl font-light leading-snug italic"
                        : "text-sm sm:text-base leading-relaxed"
                    }
                    style={{
                      color: block.large ? TEXT_1 : TEXT_2,
                      fontFamily: block.large ? "var(--font-cormorant)" : "var(--font-dm-sans)",
                      fontWeight: block.emphasis ? 600 : undefined,
                    }}
                  >
                    {block.text}
                  </p>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. COMPARISON TABLE ─────────────────────────────────────────────── */}
      <section className="py-32 px-5 sm:px-8" style={{ backgroundColor: PAGE_BG }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p
              className="text-xs uppercase tracking-widest text-center mb-4"
              style={{ color: TEXT_3, fontFamily: "var(--font-dm-sans)" }}
            >
              The honest comparison
            </p>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-5 leading-snug"
              style={{ color: TEXT_1, fontFamily: "var(--font-dm-sans)" }}
            >
              Built for landlords who don&apos;t want to hand over 10% to a PM company.
            </h2>
            <p
              className="text-base text-center mb-14 max-w-xl mx-auto"
              style={{ color: TEXT_2, fontFamily: "var(--font-dm-sans)" }}
            >
              Maybe you don&apos;t need full-service management. Maybe you just need the right tools — and to keep what&apos;s yours.
            </p>
          </FadeIn>

          <div className="rounded-2xl overflow-hidden border" style={{ borderColor: DIVIDER }}>
            {/* Header row */}
            <div className="grid grid-cols-4 border-b" style={{ borderColor: DIVIDER }}>
              <div className="px-4 py-4" style={{ backgroundColor: "rgba(255,255,255,0.02)" }} />
              {["Do it yourself", "Big PM Software", "Prospera App"].map((label, i) => (
                <div
                  key={i}
                  className="px-4 py-4 text-center text-xs font-bold uppercase tracking-widest"
                  style={{
                    backgroundColor: i === 2 ? ACCENT : "rgba(255,255,255,0.02)",
                    color: i === 2 ? TEXT_1 : TEXT_3,
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Data rows */}
            {comparisons.map((row, i) => (
              <FadeIn key={i} delay={i * 0.04}>
                <div
                  className="grid grid-cols-4 text-sm border-t"
                  style={{
                    borderColor: DIVIDER,
                    backgroundColor: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
                  }}
                >
                  <div className="px-4 py-4 font-medium" style={{ color: TEXT_1, fontFamily: "var(--font-dm-sans)" }}>
                    {row.label}
                  </div>
                  <div className="px-4 py-4 text-center" style={{ color: TEXT_3, fontFamily: "var(--font-dm-sans)" }}>
                    {row.diy}
                  </div>
                  <div className="px-4 py-4 text-center" style={{ color: TEXT_3, fontFamily: "var(--font-dm-sans)" }}>
                    {row.bigpm}
                  </div>
                  <div
                    className="px-4 py-4 text-center font-semibold"
                    style={{
                      backgroundColor: "rgba(139,32,48,0.06)",
                      color: TEXT_1,
                      fontFamily: "var(--font-dm-sans)",
                    }}
                  >
                    {row.prospera}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. HYBRID SECTION ──────────────────────────────────────────────── */}
      <section className="py-32 px-5 sm:px-8" style={{ backgroundColor: PAGE_BG }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h2
              className="text-4xl sm:text-5xl font-bold text-center mb-4 leading-tight"
              style={{ color: TEXT_1, fontFamily: "var(--font-dm-sans)" }}
            >
              Use the app. Or hand it all to us.
            </h2>
            <p
              className="text-base text-center mb-14 max-w-xl mx-auto"
              style={{ color: TEXT_2, fontFamily: "var(--font-dm-sans)" }}
            >
              We&apos;re the only option in Ontario that gives you both — and lets you switch between them anytime.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 gap-5">
            <FadeIn>
              <div
                className="rounded-2xl p-8 h-full flex flex-col"
                style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
              >
                <p
                  className="text-xs uppercase tracking-widest mb-4"
                  style={{ color: TEXT_3, fontFamily: "var(--font-dm-sans)" }}
                >
                  Option 01
                </p>
                <h3 className="text-2xl font-bold mb-3" style={{ color: TEXT_1, fontFamily: "var(--font-dm-sans)" }}>
                  Self-Managed via App
                </h3>
                <p
                  className="text-sm leading-relaxed mb-6 flex-1"
                  style={{ color: TEXT_2, fontFamily: "var(--font-dm-sans)" }}
                >
                  Run your properties through the Prospera app. Keep 100% of your rent. No management fee. No contracts.
                </p>
                <ul className="space-y-2">
                  {["Full app access", "No management fee", "You stay in control", "Cancel anytime"].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-sm"
                      style={{ color: TEXT_2, fontFamily: "var(--font-dm-sans)" }}
                    >
                      <span style={{ color: TEXT_3 }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div
                className="rounded-2xl p-8 h-full flex flex-col"
                style={{ backgroundColor: ACCENT }}
              >
                <p
                  className="text-xs uppercase tracking-widest mb-4"
                  style={{ color: "rgba(250,248,245,0.55)", fontFamily: "var(--font-dm-sans)" }}
                >
                  Option 02
                </p>
                <h3 className="text-2xl font-bold mb-3" style={{ color: TEXT_1, fontFamily: "var(--font-dm-sans)" }}>
                  Fully Managed by Prospera
                </h3>
                <p
                  className="text-sm leading-relaxed mb-6 flex-1"
                  style={{ color: "rgba(250,248,245,0.85)", fontFamily: "var(--font-dm-sans)" }}
                >
                  Hand it all to us. We manage everything. You own the asset. We run it. Starting at 8% — the lowest in Southwestern Ontario.
                </p>
                <ul className="space-y-2">
                  {["Full-service management", "Starting at 8%", "90-Day Happiness Guarantee", "Walk away anytime, no fees"].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-sm"
                      style={{ color: "rgba(250,248,245,0.9)", fontFamily: "var(--font-dm-sans)" }}
                    >
                      <span style={{ color: TEXT_1 }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── 11. FINAL CTA ───────────────────────────────────────────────────── */}
      <section className="py-32 px-5 sm:px-8" style={{ backgroundColor: PAGE_BG }}>
        <div className="max-w-xl mx-auto text-center">
          <FadeIn>
            {/* Scarcity badge */}
            <div
              className="inline-flex items-center gap-3 mb-8 px-5 py-3 rounded-full"
              style={{ backgroundColor: "rgba(139,32,48,0.08)", border: `1px solid ${ACCENT_DIM}` }}
            >
              <motion.span
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ repeat: Infinity, duration: 1.6 }}
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: ACCENT }}
              />
              <p className="text-sm font-semibold" style={{ color: ACCENT, fontFamily: "var(--font-dm-sans)" }}>
                <span className="line-through opacity-50 mr-1">5</span>3 spots remaining this month
              </p>
            </div>

            <h2
              className="text-4xl sm:text-5xl font-bold mb-5 leading-tight"
              style={{ color: TEXT_1, fontFamily: "var(--font-dm-sans)" }}
            >
              If you&apos;ve read this far,<br />you already know.
            </h2>

            <p
              className="text-base leading-relaxed mb-3"
              style={{ color: TEXT_2, fontFamily: "var(--font-dm-sans)" }}
            >
              Join the waitlist. Get 90 days completely free. We&apos;ll personally onboard you, set up your properties, and make sure your first month runs on autopilot. If you&apos;re not satisfied — full refund. No questions.
            </p>
            <p
              className="text-base font-semibold mb-2"
              style={{ color: TEXT_1, fontFamily: "var(--font-dm-sans)" }}
            >
              Zero contracts. Cancel anytime. We promise we won&apos;t cancel your access.
            </p>
            <p
              className="text-sm mb-10 italic"
              style={{ color: TEXT_3, fontFamily: "var(--font-cormorant)" }}
            >
              What exactly are you waiting for?
            </p>

            <WaitlistForm layout="stack" source="platform_footer" />

            {/* Micro-guarantee row */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-8">
              {["90-day money back", "No contracts", "Cancel anytime", "Personal onboarding"].map((t, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 text-xs"
                  style={{ color: TEXT_3, fontFamily: "var(--font-dm-sans)" }}
                >
                  <span style={{ color: ACCENT }}>✓</span> {t}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  );
}
