"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import FadeIn from "@/components/animations/FadeIn";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import WaitlistForm from "@/components/ui/WaitlistForm";
import { ShaderBackground } from "@/components/ui/animated-shader-hero";

// ── Data ─────────────────────────────────────────────────────────────────────

const painMoments = [
  {
    num: "01",
    headline: "It's the 3rd. Rent was due on the 1st.",
    sub: "You've sent two texts. Nothing back. You're trying not to seem aggressive. But the mortgage doesn't care.",
    weight: "high",
  },
  {
    num: "02",
    headline: "Your mortgage renewed.",
    sub: "$1,800 became $3,200. You're collecting $2,800. You did the math at 2am and didn't sleep.",
    weight: "high",
  },
  {
    num: "03",
    headline: "A property manager quoted you 12–15%.",
    sub: "On a $2,800 rental that's $336–$420 a month. That's more than you're making. You said no.",
    weight: "medium",
  },
  {
    num: "04",
    headline: "Googling 'N4 form Ontario' at 11pm on a Thursday.",
    sub: "You're not even sure you filled it out right. You have no idea what happens next if they ignore it.",
    weight: "medium",
  },
  {
    num: "05",
    headline: "Your phone vibrates at 11:42pm.",
    sub: "Hot water heater. Making a noise. It's your tenant. They meant well. You didn't sign up for this call.",
    weight: "high",
  },
  {
    num: "06",
    headline: "You opened Buildium once.",
    sub: "$200/month. Forty features for a company with 200 units and three employees. You closed the tab.",
    weight: "medium",
  },
  {
    num: "07",
    headline: "Tax time. Where are the receipts?",
    sub: "Gmail. A note in your phone. A spreadsheet you stopped updating in February. A stack on your desk.",
    weight: "medium",
  },
  {
    num: "08",
    headline: "You have 2 properties. Every tool was built for 20.",
    sub: "There is nothing on the market made for the person trying to build wealth quietly, without it becoming a career.",
    weight: "high",
  },
];

const features = [
  {
    num: "01",
    title: "Rent Collected. Without the Texts.",
    body: "Auto-pay runs on schedule. Reminders go out 5 days early. Late fees apply automatically on day 2. You get a notification when money lands — and silence when it doesn't need you.",
    tag: "No more chasing",
  },
  {
    num: "02",
    title: "Maintenance Without the 11pm Calls.",
    body: "Tenant submits a request with photos through their portal. AI triages instantly — identifies the issue, estimates cost, categorizes urgency. You approve. Contractor gets a prefilled message.",
    tag: "AI-powered",
  },
  {
    num: "03",
    title: "N4 Ready Before You Even Ask.",
    body: "Rent 2 days late? The N4 generates itself, pre-filled with your tenant's data, your unit details, the exact amount. N1 rent increases. N2 notices. Every Ontario form — automated.",
    tag: "Ontario-compliant",
  },
  {
    num: "04",
    title: "Your Tenants Have Their Own Portal.",
    body: "They pay rent, submit maintenance, message you, view their lease — all from their phone. You stop being the hotline. They stop texting your personal number at midnight.",
    tag: "Tenant self-serve",
  },
  {
    num: "05",
    title: "Know Exactly If You're Making Money.",
    body: "Every dollar in and out — by property, by month, by category. Income vs. expenses, real-time. Export to CSV. Know exactly where you stand before tax season blindsides you.",
    tag: "Tax-ready",
  },
  {
    num: "06",
    title: "Lives on Your Phone. No App Store Needed.",
    body: "Install it once like a native app. Works offline. Push notifications. Opens instantly. Built as a PWA — no updates to approve, no version to download, no friction between you and your properties.",
    tag: "Always on you",
  },
];

const steps = [
  {
    num: "1",
    title: "Add your property. Invite your tenant.",
    body: "2 minutes. Enter address, units, rent amount, due date. Send your tenant an invite link. They're live. You're set up.",
  },
  {
    num: "2",
    title: "Your tenant self-serves. The app automates the rest.",
    body: "They pay rent, submit maintenance, message you — all through their portal. Every action triggers the right notification, record, and automation on your end.",
  },
  {
    num: "3",
    title: "Check in once a week. That's it.",
    body: "Open the dashboard. See what's paid, what's pending, what needs a call. The app handles everything else. Your evenings are yours again.",
  },
];

const comparisons = [
  { label: "Cost per month", diy: "Your time", bigpm: "$200–$400/mo", prospera: "A fraction of that" },
  { label: "Rent collection", diy: "Manual texting", bigpm: "✓", prospera: "✓ Automated" },
  { label: "N4 / legal notices", diy: "Google it", bigpm: "✓ (with help)", prospera: "✓ Auto-generated" },
  { label: "Maintenance workflow", diy: "Phone calls", bigpm: "✓ (you still coordinate)", prospera: "✓ AI-triaged" },
  { label: "Tenant portal", diy: "Your personal number", bigpm: "✓", prospera: "✓" },
  { label: "Built for 1–5 units", diy: "✓ (barely)", bigpm: "✗ Built for 20+", prospera: "✓ Designed for you" },
  { label: "You stay in control", diy: "✓", bigpm: "✗ You hand it over", prospera: "✓ Always" },
  { label: "Financial reporting", diy: "Spreadsheet", bigpm: "✓", prospera: "✓ Real-time" },
];

// ── Pain Card ────────────────────────────────────────────────────────────────

function PainCard({ moment, index }: { moment: typeof painMoments[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.23, 1, 0.32, 1] }}
    >
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="relative h-full rounded-2xl p-7 flex flex-col gap-4 overflow-hidden"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E8E2DA",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          borderLeft: moment.weight === "high" ? "3px solid #8B2030" : "1px solid #E8E2DA",
        }}
      >
        {/* Large background number */}
        <span
          className="absolute top-4 right-5 text-7xl font-bold leading-none select-none pointer-events-none"
          style={{ color: "rgba(31,47,58,0.04)", fontFamily: "var(--font-dm-sans)" }}
        >
          {moment.num}
        </span>

        {/* Small number label */}
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: moment.weight === "high" ? "#8B2030" : "#C5BEB4", fontFamily: "var(--font-dm-sans)" }}
        >
          {moment.num}
        </span>

        <h3
          className="text-2xl sm:text-3xl font-light leading-snug"
          style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
        >
          {moment.headline}
        </h3>

        <p
          className="text-sm leading-relaxed"
          style={{ color: "#777777", fontFamily: "var(--font-dm-sans)", fontWeight: 400 }}
        >
          {moment.sub}
        </p>
      </motion.div>
    </motion.div>
  );
}

// ── Comparison Row ────────────────────────────────────────────────────────────

function CompRow({ row, i }: { row: typeof comparisons[0]; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: i * 0.05 }}
      className="grid grid-cols-4 text-sm border-t"
      style={{ borderColor: "#D8D2C8" }}
    >
      <div className="px-4 py-4 font-medium" style={{ color: "#222222", fontFamily: "var(--font-dm-sans)" }}>
        {row.label}
      </div>
      <div className="px-4 py-4 text-center" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
        {row.diy}
      </div>
      <div className="px-4 py-4 text-center" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
        {row.bigpm}
      </div>
      <div
        className="px-4 py-4 text-center font-semibold"
        style={{ backgroundColor: "rgba(31,47,58,0.04)", color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
      >
        {row.prospera}
      </div>
    </motion.div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PlatformPage() {
  return (
    <div style={{ backgroundColor: "#F7F5F2" }}>

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden" style={{ backgroundColor: "#0A1018" }}>
        <ShaderBackground className="absolute inset-0 w-full h-full object-cover opacity-40" />

        {/* Overlays */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(8,13,20,0.97) 0%, rgba(8,13,20,0.75) 55%, rgba(8,13,20,0.2) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 20% 50%, rgba(139,32,48,0.12) 0%, transparent 60%)" }} />
        {/* Bottom fade into stats section */}
        <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: "linear-gradient(to bottom, transparent, #0A1018)" }} />

        {/* ── Main grid ── */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 pt-28 pb-20">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-10">

            {/* Left — copy + form */}
            <div className="flex-1 min-w-0">
              {/* Badge */}
              <FadeIn>
                <div className="inline-flex items-center gap-2.5 mb-8 px-3.5 py-1.5 rounded-full" style={{ backgroundColor: "rgba(250,248,245,0.06)", border: "1px solid rgba(250,248,245,0.1)" }}>
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1.8 }}
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: "#8B2030" }}
                  />
                  <span className="text-xs tracking-widest" style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)" }}>
                    Prospera Platform · Waitlist open
                  </span>
                </div>
              </FadeIn>

              {/* Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6" style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>
                <VerticalCutReveal
                  splitBy="words"
                  staggerDuration={0.07}
                  staggerFrom="first"
                  reverse={true}
                  containerClassName="flex-wrap"
                  transition={{ type: "spring", stiffness: 240, damping: 34, delay: 0.15 }}
                >
                  You Bought
                </VerticalCutReveal>{" "}
                <VerticalCutReveal
                  splitBy="words"
                  staggerDuration={0.07}
                  staggerFrom="first"
                  reverse={true}
                  containerClassName="inline-flex flex-wrap"
                  transition={{ type: "spring", stiffness: 240, damping: 34, delay: 0.28 }}
                >
                  <span style={{ color: "#8B2030" }}>Passive Income.</span>
                </VerticalCutReveal>
                <br />
                <span style={{ color: "rgba(250,248,245,0.3)" }}>
                  <VerticalCutReveal
                    splitBy="words"
                    staggerDuration={0.07}
                    staggerFrom="first"
                    reverse={true}
                    containerClassName="flex-wrap"
                    transition={{ type: "spring", stiffness: 240, damping: 34, delay: 0.52 }}
                  >
                    Not a Second Job.
                  </VerticalCutReveal>
                </span>
              </h1>

              <FadeIn delay={0.85}>
                <p className="text-base sm:text-lg leading-relaxed mb-8 max-w-lg" style={{ color: "rgba(250,248,245,0.55)", fontFamily: "var(--font-dm-sans)" }}>
                  Rent, maintenance, N4s, tenant portal, and financials — all automated.
                  Built by an Ontario landlord for landlords with 1 to 5 properties.
                </p>

                {/* Trust pills */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {[
                    { text: "90 days free", accent: true },
                    { text: "No credit card" },
                    { text: "We won't cancel your access" },
                  ].map((pill, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: pill.accent ? "rgba(139,32,48,0.2)" : "rgba(250,248,245,0.06)",
                        border: pill.accent ? "1px solid rgba(139,32,48,0.4)" : "1px solid rgba(250,248,245,0.1)",
                        color: pill.accent ? "#FAF8F5" : "rgba(250,248,245,0.55)",
                        fontFamily: "var(--font-dm-sans)",
                      }}
                    >
                      {pill.accent && <span style={{ color: "#8B2030" }}>✓</span>}
                      {pill.text}
                    </span>
                  ))}
                </div>

                <div className="max-w-md">
                  <WaitlistForm layout="stack" dark source="platform_hero" />
                </div>
              </FadeIn>
            </div>

            {/* Right — Phone mockup */}
            <FadeIn delay={0.4} className="flex-shrink-0 relative hidden lg:flex items-center justify-center">
              {/* Glow behind phone */}
              <div
                className="absolute rounded-full blur-3xl"
                style={{ width: 320, height: 320, backgroundColor: "rgba(139,32,48,0.12)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
              />

              {/* Floating card — top left */}
              <motion.div
                initial={{ opacity: 0, x: -20, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="absolute -left-14 top-16 z-20 rounded-2xl px-4 py-3 flex items-center gap-3"
                style={{ backgroundColor: "#FFFFFF", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", minWidth: 180 }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(34,197,94,0.12)" }}>
                  <span className="text-sm">✓</span>
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: "#111", fontFamily: "var(--font-dm-sans)" }}>Rent received</p>
                  <p className="text-xs" style={{ color: "#999", fontFamily: "var(--font-dm-sans)" }}>$2,800 · Unit 1</p>
                </div>
              </motion.div>

              {/* Floating card — bottom right */}
              <motion.div
                initial={{ opacity: 0, x: 20, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                className="absolute -right-14 bottom-20 z-20 rounded-2xl px-4 py-3"
                style={{ backgroundColor: "#1F2F3A", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", minWidth: 190 }}
              >
                <p className="text-xs font-semibold mb-0.5" style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>N4 auto-generated</p>
                <p className="text-xs" style={{ color: "rgba(250,248,245,0.45)", fontFamily: "var(--font-dm-sans)" }}>Unit 2 · 2 days overdue</p>
              </motion.div>

              {/* Floating card — right middle */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.8, duration: 0.5 }}
                className="absolute -right-10 top-32 z-20 rounded-2xl px-4 py-3 flex items-center gap-2.5"
                style={{ backgroundColor: "#0D1820", border: "1px solid rgba(250,248,245,0.08)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", minWidth: 170 }}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "#8B2030" }} />
                <div>
                  <p className="text-xs font-semibold" style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>Maintenance triaged</p>
                  <p className="text-xs" style={{ color: "rgba(250,248,245,0.4)", fontFamily: "var(--font-dm-sans)" }}>AI · Low urgency</p>
                </div>
              </motion.div>

              {/* Phone shell */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                className="relative z-10"
                style={{ width: 260 }}
              >
                {/* Phone frame */}
                <div
                  className="relative rounded-[40px] overflow-hidden"
                  style={{
                    background: "#0D1820",
                    border: "1.5px solid rgba(250,248,245,0.12)",
                    boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
                    height: 540,
                  }}
                >
                  {/* Dynamic island */}
                  <div className="flex justify-center pt-4 pb-2">
                    <div className="w-24 h-7 rounded-full" style={{ backgroundColor: "#000" }} />
                  </div>

                  {/* App UI */}
                  <div className="px-5 pt-2 pb-6 flex flex-col gap-4 h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs" style={{ color: "rgba(250,248,245,0.4)", fontFamily: "var(--font-dm-sans)" }}>Good morning</p>
                        <p className="text-sm font-semibold" style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>Ebin ✦</p>
                      </div>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#8B2030" }}>
                        <span className="text-xs font-bold" style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>EJ</span>
                      </div>
                    </div>

                    {/* Status card */}
                    <div className="rounded-2xl p-4" style={{ background: "linear-gradient(135deg, #8B2030 0%, #6a1824 100%)" }}>
                      <p className="text-xs mb-1" style={{ color: "rgba(250,248,245,0.7)", fontFamily: "var(--font-dm-sans)" }}>This month</p>
                      <p className="text-2xl font-bold mb-1" style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>$8,400</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs" style={{ color: "rgba(250,248,245,0.6)", fontFamily: "var(--font-dm-sans)" }}>3 properties · All collected</span>
                        <span className="text-xs" style={{ color: "rgba(250,248,245,0.5)" }}>✓</span>
                      </div>
                    </div>

                    {/* Property rows */}
                    {[
                      { addr: "236 Highbury Ave", status: "Paid", amount: "$2,400", ok: true },
                      { addr: "550 Second St", status: "Paid", amount: "$2,800", ok: true },
                      { addr: "31 Jena Cres", status: "Paid", amount: "$1,399", ok: true },
                    ].map((p, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b" style={{ borderColor: "rgba(250,248,245,0.06)" }}>
                        <div>
                          <p className="text-xs font-medium" style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>{p.addr}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.ok ? "#22c55e" : "#8B2030" }} />
                            <p className="text-xs" style={{ color: "rgba(250,248,245,0.4)", fontFamily: "var(--font-dm-sans)" }}>{p.status}</p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold" style={{ color: p.ok ? "#FAF8F5" : "#8B2030", fontFamily: "var(--font-dm-sans)" }}>{p.amount}</p>
                      </div>
                    ))}

                    {/* Bottom nav bar */}
                    <div className="mt-auto flex items-center justify-around pt-3 border-t" style={{ borderColor: "rgba(250,248,245,0.06)" }}>
                      {[
                        { icon: "⌂", label: "Home", active: true },
                        { icon: "◫", label: "Properties" },
                        { icon: "◎", label: "Finances" },
                        { icon: "⚙", label: "Settings" },
                      ].map((tab, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                          <span className="text-sm" style={{ color: tab.active ? "#8B2030" : "rgba(250,248,245,0.25)" }}>{tab.icon}</span>
                          <span className="text-xs" style={{ color: tab.active ? "#8B2030" : "rgba(250,248,245,0.25)", fontFamily: "var(--font-dm-sans)", fontSize: "9px" }}>{tab.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Phone reflection */}
                <div
                  className="absolute -bottom-6 left-4 right-4 h-6 rounded-full blur-xl"
                  style={{ backgroundColor: "rgba(139,32,48,0.25)" }}
                />
              </motion.div>
            </FadeIn>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <motion.div animate={{ y: [0, 7, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(250,248,245,0.2)" strokeWidth="1.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </motion.div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────────────────────── */}
      <section className="py-14 px-5 sm:px-8 border-b" style={{ backgroundColor: "#FFFFFF", borderColor: "#D8D2C8" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { big: "8+", unit: "hrs", label: "Saved per property, per month" },
            { big: "2", unit: "min", label: "To set up your first property" },
            { big: "90", unit: " days", label: "Free for early waitlist members" },
            { big: "0", unit: " LTB cases", label: "For Prospera-managed properties" },
          ].map((s, i) => (
            <FadeIn key={i} delay={i * 0.07}>
              <div>
                <p className="text-4xl sm:text-5xl font-bold mb-1 leading-none" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
                  {s.big}<span className="text-2xl sm:text-3xl font-normal" style={{ color: "#8B2030" }}>{s.unit}</span>
                </p>
                <p className="text-xs leading-snug mt-2" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
                  {s.label}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Pain — "Count how many of these you've lived." ────────────────────── */}
      <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-center mb-4" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
              Be honest
            </p>
            <h2 className="text-4xl sm:text-5xl font-light text-center mb-4 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              How many of these hit home?
            </h2>
            <p className="text-base text-center mb-14 leading-relaxed max-w-xl mx-auto" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
              If you manage 1–5 properties in Ontario, at least 5 of these are your Tuesday.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 gap-4">
            {painMoments.map((moment, i) => (
              <PainCard key={i} moment={moment} index={i} />
            ))}
          </div>

          <FadeIn delay={0.5}>
            <p className="text-center mt-12 text-2xl sm:text-3xl font-light italic" style={{ color: "#8B2030", fontFamily: "var(--font-cormorant)" }}>
              That&apos;s exactly why this exists.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── From Ebin — Personal Letter ──────────────────────────────────────── */}
      <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#1F2F3A" }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest mb-12" style={{ color: "rgba(250,248,245,0.35)", fontFamily: "var(--font-dm-sans)" }}>
              From the founder
            </p>
          </FadeIn>

          <div className="flex flex-col lg:flex-row gap-14 lg:gap-20">
            {/* Photo column */}
            <FadeIn delay={0.1}>
              <div className="flex-shrink-0 flex flex-col items-start gap-5">
                <div className="relative w-52 h-64 lg:w-60 lg:h-72 rounded-2xl overflow-hidden" style={{ border: "2px solid rgba(250,248,245,0.1)" }}>
                  <Image
                    src="/ebin-founder.jpg"
                    alt="Ebin Jaison — Founder, Prospera Properties"
                    fill
                    className="object-cover object-top"
                    sizes="260px"
                  />
                  {/* Subtle overlay */}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(31,47,58,0.5) 0%, transparent 60%)" }} />
                </div>
                <div>
                  <p className="text-lg font-light" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
                    Ebin Jaison
                  </p>
                  <p className="text-xs mt-1" style={{ color: "rgba(250,248,245,0.4)", fontFamily: "var(--font-dm-sans)" }}>
                    Founder, Prospera Properties
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(250,248,245,0.3)", fontFamily: "var(--font-dm-sans)" }}>
                    London, Ontario · Managing since 2021
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* Letter column */}
            <div className="flex-1 space-y-6">
              {[
                {
                  text: "Let me be straight with you.",
                  large: true,
                },
                {
                  text: "Your mortgage just renewed. What used to be $1,800 is now $3,200. You're collecting $2,800 in rent. You told yourself you'd hire a property manager when the numbers made sense — but now they're quoting you 10–15%, and that's $280–$420 a month you simply don't have. So you're doing it yourself.",
                },
                {
                  text: "You're texting your tenant on the 3rd when rent was due on the 1st. You're Googling \"N4 form Ontario\" at 11pm on a Thursday. You're getting calls at 7am because the dryer is making a noise. You didn't sign up for this. You signed up to build wealth.",
                },
                {
                  text: "I've been managing properties in London, Ontario for 3 years. I run Prospera Properties. I've personally tested every tool — Buildium, AppFolio, Rentec Direct, Propertyware. Every single one is built for operators running 50+ units with full-time staff. There is nothing — nothing — built for the person with 1, 2, maybe 3 rental units trying to make the numbers work without it consuming their life.",
                },
                {
                  text: "I know what it feels like to stare at a bank statement after a mortgage renewal and wonder if you made a mistake. I know what it feels like to text a tenant four times about rent and still not have it on the 8th. I know what it feels like to have no idea whether you made any money last year, because your records are a disaster.",
                },
                {
                  text: "So I built the app I wish existed three years ago. Not for the big operators. For you.",
                  emphasis: true,
                },
              ].map((block, i) => (
                <FadeIn key={i} delay={i * 0.07}>
                  <p
                    className={block.large ? "text-2xl sm:text-3xl font-light leading-snug" : "text-sm sm:text-base leading-relaxed"}
                    style={{
                      color: block.emphasis
                        ? "#FAF8F5"
                        : block.large
                          ? "#FAF8F5"
                          : "rgba(250,248,245,0.65)",
                      fontFamily: block.large ? "var(--font-cormorant)" : "var(--font-dm-sans)",
                      fontStyle: block.large ? "italic" : "normal",
                      fontWeight: block.emphasis ? 500 : undefined,
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

      {/* ── Before vs After ───────────────────────────────────────────────────── */}
      <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-center mb-4" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
              Before vs. After
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-center mb-14 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
              This is what changes.
            </h2>
          </FadeIn>

          <div className="overflow-hidden rounded-2xl border" style={{ borderColor: "#D8D2C8", boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
            <div className="grid grid-cols-2">
              <div className="px-6 py-5 border-r" style={{ backgroundColor: "#FFFFFF", borderColor: "#D8D2C8" }}>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>Right now</p>
              </div>
              <div className="px-6 py-5" style={{ backgroundColor: "#1F2F3A" }}>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>With Prospera</p>
              </div>
            </div>
            {[
              { before: "Texting tenants when rent is 2 days late", after: "Auto reminders + auto late fees. Done." },
              { before: "Calling contractors, waiting on callbacks", after: "One tap. AI-drafted job message sent." },
              { before: "Googling N4 at midnight", after: "Auto-generated the moment rent is missed." },
              { before: "Receipts spread across Gmail, Notes, and a desk", after: "Every dollar logged, filtered, exportable." },
              { before: "No idea if your property is profitable", after: "Real-time income vs. expense dashboard." },
              { before: "Tenants texting your personal number", after: "They use their portal. You get a ping." },
            ].map((row, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="grid grid-cols-2" style={{ borderTop: "1px solid #D8D2C8" }}>
                  <div
                    className="px-6 py-5 flex items-center gap-3 border-r"
                    style={{ backgroundColor: i % 2 === 0 ? "#FFFFFF" : "#F7F5F2", borderColor: "#D8D2C8" }}
                  >
                    <span className="flex-shrink-0 text-xs font-bold" style={{ color: "#D8D2C8" }}>✕</span>
                    <p className="text-sm" style={{ color: "#555555", fontFamily: "var(--font-dm-sans)" }}>{row.before}</p>
                  </div>
                  <div className="px-6 py-5 flex items-center gap-3" style={{ backgroundColor: "#1F2F3A" }}>
                    <span className="flex-shrink-0 text-xs font-bold" style={{ color: "#8B2030" }}>✓</span>
                    <p className="text-sm font-medium" style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>{row.after}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-center mb-4" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
              What it does
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-center mb-3 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
              Everything a property manager does.
            </h2>
            <p className="text-base text-center mb-16 max-w-xl mx-auto leading-relaxed" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
              Without the 10–15% fee. Without handing over control. Without answering to someone else about your own investment.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.22 }}
                  className="rounded-2xl p-7 flex flex-col h-full cursor-default"
                  style={{ backgroundColor: "#F7F5F2", border: "1px solid #D8D2C8", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                >
                  <div className="flex items-start justify-between mb-6">
                    <span className="text-4xl font-light leading-none" style={{ color: "#D8D2C8", fontFamily: "var(--font-cormorant)" }}>
                      {f.num}
                    </span>
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-medium uppercase tracking-wider"
                      style={{ color: "#8B2030", border: "1px solid rgba(139,32,48,0.2)", backgroundColor: "rgba(139,32,48,0.05)", fontFamily: "var(--font-dm-sans)" }}
                    >
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 leading-snug" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed flex-1" style={{ color: "#555555", fontFamily: "var(--font-dm-sans)" }}>
                    {f.body}
                  </p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-center mb-4" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
              Getting started
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-center mb-16 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
              Set up in 2 minutes.<br className="hidden sm:block" /> Run forever.
            </h2>
          </FadeIn>

          <div className="relative">
            <div className="hidden sm:block absolute left-8 top-10 bottom-10 w-px" style={{ backgroundColor: "#D8D2C8" }} />
            <div className="flex flex-col gap-10">
              {steps.map((step, i) => (
                <FadeIn key={i} delay={i * 0.12}>
                  <div className="flex gap-6 sm:gap-8 items-start">
                    <div
                      className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center relative z-10"
                      style={{ backgroundColor: i === 1 ? "#1F2F3A" : "#FFFFFF", border: "1px solid #D8D2C8" }}
                    >
                      <span className="text-2xl font-bold" style={{ color: i === 1 ? "#FAF8F5" : "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
                        {step.num}
                      </span>
                    </div>
                    <div className="flex-1 pt-3">
                      <h3 className="text-xl font-bold mb-2 leading-snug" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
                        {step.title}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: "#555555", fontFamily: "var(--font-dm-sans)" }}>
                        {step.body}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Prospera vs Everyone Else ─────────────────────────────────────────── */}
      <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-center mb-4" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
              The honest comparison
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-center mb-5 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
              We&apos;re not a property manager.<br className="hidden sm:block" /> We&apos;re redefining what one looks like.
            </h2>
            <p className="text-base text-center mb-14 max-w-xl mx-auto leading-relaxed" style={{ color: "#555555", fontFamily: "var(--font-dm-sans)" }}>
              Traditional PM companies charge 10–15% and take over. Buildium charges $200/month and was built for their team, not you. Prospera gives you both — a powerful app and the option to hand it off — without giving up control.
            </p>
          </FadeIn>

          <div className="overflow-hidden rounded-2xl border" style={{ borderColor: "#D8D2C8", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
            {/* Header row */}
            <div className="grid grid-cols-4 border-b" style={{ borderColor: "#D8D2C8" }}>
              <div className="px-4 py-4" style={{ backgroundColor: "#F7F5F2" }} />
              {["Do it yourself", "Big PM Software", "Prospera App"].map((label, i) => (
                <div
                  key={i}
                  className="px-4 py-4 text-center text-xs font-bold uppercase tracking-widest"
                  style={{
                    backgroundColor: i === 2 ? "#1F2F3A" : "#F7F5F2",
                    color: i === 2 ? "#FAF8F5" : "#999999",
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
            {comparisons.map((row, i) => (
              <CompRow key={i} row={row} i={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Promise ───────────────────────────────────────────────────── */}
      <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#0D1820" }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-center mb-4" style={{ color: "rgba(250,248,245,0.3)", fontFamily: "var(--font-dm-sans)" }}>
              Pricing
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-center mb-5 leading-tight" style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>
              Not free. But close.
            </h2>
            <p className="text-base text-center mb-14 max-w-xl mx-auto leading-relaxed" style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)" }}>
              A traditional property manager charges $280–$420/month on a $2,800 rental.<br />
              We charge a small monthly subscription — a fraction of that — and you stay in control.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-3 gap-4">
            {/* Early Access */}
            <FadeIn delay={0.0}>
              <div className="rounded-2xl p-8 h-full flex flex-col" style={{ backgroundColor: "rgba(250,248,245,0.05)", border: "1px solid rgba(250,248,245,0.1)" }}>
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "rgba(250,248,245,0.35)", fontFamily: "var(--font-dm-sans)" }}>Early Access</p>
                  <p className="text-5xl font-bold leading-none mb-1" style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>Free</p>
                  <p className="text-sm" style={{ color: "rgba(250,248,245,0.4)", fontFamily: "var(--font-dm-sans)" }}>for 90 days</p>
                </div>
                <ul className="space-y-3 flex-1">
                  {["Full access to every feature", "Unlimited properties", "Priority support", "Help shape the product"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm" style={{ color: "rgba(250,248,245,0.65)", fontFamily: "var(--font-dm-sans)" }}>
                      <span style={{ color: "rgba(250,248,245,0.25)" }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>

            {/* After trial */}
            <FadeIn delay={0.08}>
              <div className="rounded-2xl p-8 h-full flex flex-col relative overflow-hidden" style={{ backgroundColor: "#8B2030" }}>
                <div
                  className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: "rgba(250,248,245,0.15)", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
                >
                  After trial
                </div>
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "rgba(250,248,245,0.6)", fontFamily: "var(--font-dm-sans)" }}>Monthly</p>
                  <p className="text-2xl font-bold leading-none mb-1" style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>A fraction</p>
                  <p className="text-sm" style={{ color: "rgba(250,248,245,0.65)", fontFamily: "var(--font-dm-sans)" }}>of a PM fee. We&apos;re not revealing exact pricing yet — but it&apos;ll make you laugh when you compare it to the alternative.</p>
                </div>
                <ul className="space-y-3 flex-1">
                  {["Everything in early access", "Lock in founding member rate", "Cancel anytime — but you won't", "Price never increases for you"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm" style={{ color: "rgba(250,248,245,0.9)", fontFamily: "var(--font-dm-sans)" }}>
                      <span style={{ color: "#FAF8F5" }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>

            {/* Promise */}
            <FadeIn delay={0.16}>
              <div className="rounded-2xl p-8 h-full flex flex-col" style={{ backgroundColor: "rgba(250,248,245,0.05)", border: "1px solid rgba(250,248,245,0.1)" }}>
                <div className="mb-6">
                  <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "rgba(250,248,245,0.35)", fontFamily: "var(--font-dm-sans)" }}>Our promise</p>
                  <p className="text-2xl font-bold leading-snug" style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>We won&apos;t cancel your access.</p>
                </div>
                <p className="text-sm leading-relaxed flex-1" style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)" }}>
                  We&apos;ve seen too many landlords get burned by software that disappears or doubles its price. Early members lock in their rate for life. If we ever shut down, we give you 6 months notice and a full data export. That&apos;s the deal.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── The Hybrid ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#1F2F3A" }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-center mb-4" style={{ color: "rgba(250,248,245,0.4)", fontFamily: "var(--font-dm-sans)" }}>
              The Prospera Difference
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-center mb-4 leading-tight" style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>
              Use the app. Or hand it all to us.
            </h2>
            <p className="text-base text-center mb-14 max-w-xl mx-auto leading-relaxed" style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)" }}>
              We&apos;re the only option in Ontario that gives you a powerful self-management app AND full-service management — and lets you switch between them anytime.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 gap-5">
            <FadeIn>
              <div className="rounded-2xl p-8 h-full flex flex-col" style={{ backgroundColor: "rgba(250,248,245,0.05)", border: "1px solid rgba(250,248,245,0.1)" }}>
                <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "rgba(250,248,245,0.35)", fontFamily: "var(--font-dm-sans)" }}>Option 01</p>
                <h3 className="text-2xl font-bold mb-3" style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>Self-Managed via App</h3>
                <p className="text-sm leading-relaxed mb-6 flex-1" style={{ color: "rgba(250,248,245,0.55)", fontFamily: "var(--font-dm-sans)" }}>
                  Run your properties through the Prospera app. Keep 100% of your rent. The app does everything short of physically showing up.
                </p>
                <ul className="space-y-2">
                  {["Full app access", "No management fee", "You stay in control", "Prospera support available"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm" style={{ color: "rgba(250,248,245,0.6)", fontFamily: "var(--font-dm-sans)" }}>
                      <span style={{ color: "rgba(250,248,245,0.25)" }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="rounded-2xl p-8 h-full flex flex-col" style={{ backgroundColor: "#8B2030" }}>
                <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "rgba(250,248,245,0.55)", fontFamily: "var(--font-dm-sans)" }}>Option 02</p>
                <h3 className="text-2xl font-bold mb-3" style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>Fully Managed by Prospera</h3>
                <p className="text-sm leading-relaxed mb-6 flex-1" style={{ color: "rgba(250,248,245,0.85)", fontFamily: "var(--font-dm-sans)" }}>
                  Hand it all to us. Tenant relations, maintenance, rent collection, legal notices, monthly reporting. You own the asset. We run it. Starting at 8%.
                </p>
                <ul className="space-y-2">
                  {["Full-service management", "Starting at 8%", "90-Day Happiness Guarantee", "Walk away anytime, no fees"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm" style={{ color: "rgba(250,248,245,0.9)", fontFamily: "var(--font-dm-sans)" }}>
                      <span style={{ color: "#FAF8F5" }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-32 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-xl mx-auto text-center">
          <FadeIn>
            <div
              className="inline-block mb-6 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest"
              style={{ backgroundColor: "rgba(139,32,48,0.08)", border: "1px solid rgba(139,32,48,0.2)", color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}
            >
              Waitlist open · 90 days free
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-5 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
              The landlords who<br />join now pay nothing.
            </h2>
            <p className="text-base leading-relaxed mb-3" style={{ color: "#555555", fontFamily: "var(--font-dm-sans)" }}>
              We&apos;re opening the prototype to a small group of Ontario landlords first.
              Full access. You help shape what gets built. You lock in your rate before
              we charge publicly.
            </p>
            <p className="text-base font-semibold mb-10" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
              We promise we won&apos;t cancel your access.
            </p>
            <WaitlistForm layout="stack" source="platform_footer" />
            <p
              className="text-sm mt-8 italic"
              style={{ color: "#999999", fontFamily: "var(--font-cormorant)" }}
            >
              If you&apos;ve read this far and you&apos;re still not on the list —<br />what exactly are you waiting for?
            </p>
          </FadeIn>
        </div>
      </section>

    </div>
  );
}
