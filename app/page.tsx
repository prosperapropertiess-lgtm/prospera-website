"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "@/components/animations/FadeIn";
import CounterAnimation from "@/components/animations/CounterAnimation";
import ParticleCanvas from "@/components/animations/ParticleCanvas";
import GoogleReviews from "@/components/ui/GoogleReviews";
import BlogNudge from "@/components/ui/BlogNudge";

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center px-5 sm:px-8 text-center overflow-hidden"
      style={{ backgroundColor: "#1F2F3A" }}
    >
      <ParticleCanvas />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 75% 15%, rgba(139,32,48,0.2) 0%, transparent 55%)",
          zIndex: 2,
        }}
      />

      <div className="relative max-w-5xl mx-auto" style={{ zIndex: 3 }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest px-5 py-2"
            style={{
              color: "rgba(250,248,245,0.7)",
              fontFamily: "var(--font-dm-sans)",
              border: "1px solid rgba(250,248,245,0.2)",
            }}
          >
            London · St. Thomas · Strathroy
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="text-6xl sm:text-7xl md:text-8xl font-light leading-[1.05] mb-7"
          style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
        >
          Your rental is supposed to pay you.
          <br />
          <em style={{ color: "rgba(250,248,245,0.65)" }}>Not consume you.</em>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.38, ease: [0.23, 1, 0.32, 1] }}
          className="text-base sm:text-lg leading-relaxed mb-10 max-w-xl mx-auto"
          style={{ color: "rgba(250,248,245,0.65)", fontFamily: "var(--font-dm-sans)" }}
        >
          Tenants, rent, maintenance — handled. You find out when something's
          done, not when it starts. No call centers. No ticket queues. Just
          someone who picks up the phone and actually knows your property.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.52, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col items-center justify-center gap-3"
        >
          <Link
            href="/rent-analysis"
            className="btn-primary px-10 py-4 text-xs font-semibold uppercase tracking-widest rounded"
            style={{
              backgroundColor: "#8B2030",
              color: "#FAF8F5",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            Get a Free Rental Analysis
          </Link>
          <span
            className="text-xs"
            style={{ color: "rgba(250,248,245,0.4)", fontFamily: "var(--font-dm-sans)" }}
          >
            Find out what your property should be earning
          </span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(250,248,245,0.3)" strokeWidth="1.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ── Stats Bar ─────────────────────────────────────────────────────────────────

function StatsBar() {
  const stats = [
    { value: 25, suffix: "+", label: "Tenant Placements" },
    { value: 20, suffix: "+", label: "Five-Star Reviews" },
    { value: 0, suffix: "", label: "LTB Cases. Ever." },
    { value: 21, suffix: " days", label: "Avg. to Fill a Unit" },
  ];

  return (
    <section className="py-14 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2", borderBottom: "1px solid #D8D2C8" }}>
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10 text-center">
        {stats.map((stat, i) => (
          <FadeIn key={stat.label} delay={i * 0.08}>
            <div>
              <div
                className="text-4xl sm:text-5xl md:text-6xl font-light mb-1"
                style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
              >
                <CounterAnimation target={stat.value} suffix={stat.suffix} />
              </div>
              <div
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
              >
                {stat.label}
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

// ── Pain Points ───────────────────────────────────────────────────────────────

function PainPoints() {
  const pains = [
    {
      label: "Chasing rent at the end of every month",
      sub: "One late payment and your whole budget is off.",
    },
    {
      label: "Midnight maintenance calls you didn't sign up for",
      sub: "You own a rental. You didn't buy a second job.",
    },
    {
      label: "One bad tenant who drains a whole year",
      sub: "The wrong placement costs you more than any management fee.",
    },
    {
      label: "No idea if your rent is priced right",
      sub: "Leave money on the table, or sit vacant. Neither is good.",
    },
  ];

  return (
    <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <p
            className="text-xs font-semibold uppercase tracking-widest text-center mb-4"
            style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
          >
            Sound Familiar?
          </p>
          <h2
            className="text-4xl sm:text-5xl font-light text-center mb-14 leading-tight"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
          >
            If you own a rental,<br />you&apos;ve felt at least one of these.
          </h2>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pains.map((pain, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div
                className="pain-card p-7 border rounded-xl"
                style={{ borderColor: "#D8D2C8", backgroundColor: "#F7F5F2", borderLeft: "4px solid #8B2030", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <p className="font-semibold text-base leading-snug mb-2" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
                  {pain.label}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
                  {pain.sub}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Feature Cards ─────────────────────────────────────────────────────────────

function FeatureCards() {
  const features = [
    {
      num: "01",
      title: "You never lose a year to the wrong tenant",
      desc: "Every placement goes through credit, income verification, criminal background, and a direct call to their previous landlord. 25+ placements. All paying rent. Zero LTB cases.",
    },
    {
      num: "02",
      title: "Repairs cost what repairs cost — nothing more",
      desc: "You pay the contractor's invoice. A flat 8% coordination fee covers our time. No inflated quotes, no mystery markups, no percentage skimmed off every job.",
    },
    {
      num: "03",
      title: "You get someone who actually knows your property",
      desc: "The portfolio stays small on purpose. When something happens at your unit, there's no ticket system — there's a person who's been inside it and knows the history.",
    },
    {
      num: "04",
      title: "You text. You get an answer.",
      desc: "You get Ebin's direct number. When something comes up — maintenance, tenant issue, anything — you reach the person running it. Not a coordinator routing your call to someone else.",
    },
  ];

  return (
    <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2" }}>
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <p
            className="text-xs font-semibold uppercase tracking-widest text-center mb-4"
            style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
          >
            Why Prospera
          </p>
          <h2
            className="text-4xl sm:text-5xl font-light text-center mb-14 leading-tight"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
          >
            What changes when you stop managing it yourself.
          </h2>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.08}>
              <div
                className="feature-card bg-white p-8 border h-full cursor-default rounded-xl"
                style={{ borderColor: "#D8D2C8", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
              >
                <span className="block text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "#D8D2C8", fontFamily: "var(--font-dm-sans)" }}>
                  {f.num}
                </span>
                <h3
                  className="text-lg font-light mb-3"
                  style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
                >
                  {f.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}
                >
                  {f.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────

function HowItWorks() {
  const phases = [
    {
      num: "01",
      phase: "You stop guessing",
      timeline: "Days 1–3",
      steps: [
        "We walk the property and document condition",
        "Research what's actually renting nearby right now",
        "You know the price and strategy before anything launches",
      ],
    },
    {
      num: "02",
      phase: "You stop taking calls",
      timeline: "Weeks 1–4",
      steps: [
        "Professional photos, listing live on all platforms",
        "Every inquiry answered, every showing run — not by you",
        "You hear from us when someone worth approving comes through",
      ],
    },
    {
      num: "03",
      phase: "You stop thinking about it",
      timeline: "Every month",
      steps: [
        "Rent lands in your account with a clear breakdown",
        "Maintenance resolved start to finish — you're told when it's done",
        "Monthly statement on the 5th, zero surprises",
      ],
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <p
            className="text-xs font-semibold uppercase tracking-widest text-center mb-4"
            style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
          >
            The Process
          </p>
          <h2
            className="text-4xl sm:text-5xl font-light text-center mb-16 leading-tight"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
          >
            What the first 30 days<br />looks like for you.
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {phases.map((phase, i) => (
            <FadeIn key={phase.num} delay={i * 0.12}>
              <div
                className="border p-8 rounded-xl"
                style={{ borderColor: "#D8D2C8", backgroundColor: "#F7F5F2", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                <div className="flex items-start gap-4 mb-5">
                  <span
                    className="text-4xl font-light leading-none"
                    style={{ color: "#D8D2C8", fontFamily: "var(--font-cormorant)" }}
                  >
                    {phase.num}
                  </span>
                  <div>
                    <p className="font-semibold text-base" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
                      {phase.phase}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
                      {phase.timeline}
                    </p>
                  </div>
                </div>
                <ul className="space-y-2.5">
                  {phase.steps.map((step, j) => (
                    <li key={j} className="flex items-start gap-2.5">
                      <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#D8D2C8" }} />
                      <span className="text-sm leading-relaxed" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                        {step}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Founder Snippet ───────────────────────────────────────────────────────────

function FounderSnippet() {
  return (
    <section className="py-20 px-5 sm:px-8" style={{ backgroundColor: "#1F2F3A" }}>
      <div className="max-w-3xl mx-auto text-center">
        <FadeIn>
          <div className="w-10 h-px mx-auto mb-8" style={{ backgroundColor: "rgba(250,248,245,0.3)" }} />
          <blockquote
            className="text-3xl sm:text-4xl font-light leading-tight mb-6"
            style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
          >
            &ldquo;I&apos;ve been the tenant. The house coordinator. The operations
            manager. I built this with all three lenses — and I choose to stay
            small on purpose.&rdquo;
          </blockquote>
          <p className="text-sm mb-6" style={{ color: "rgba(250,248,245,0.6)", fontFamily: "var(--font-dm-sans)" }}>
            — Ebin Jaison, Owner
          </p>
          <Link
            href="/about"
            className="inline-block text-xs font-semibold uppercase tracking-widest border-b pb-0.5 transition-opacity hover:opacity-70"
            style={{ color: "rgba(250,248,245,0.7)", borderColor: "rgba(250,248,245,0.3)", fontFamily: "var(--font-dm-sans)" }}
          >
            Read the full story →
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}

// ── Case Study ────────────────────────────────────────────────────────────────

function CaseStudy() {
  return (
    <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <p
            className="text-xs font-semibold uppercase tracking-widest text-center mb-4"
            style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
          >
            Real Result
          </p>
          <h2
            className="text-4xl sm:text-5xl font-light text-center mb-4 leading-tight"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
          >
            From drowning in utility bills<br />to covering the mortgage.
          </h2>
          <p
            className="text-sm text-center max-w-xl mx-auto mb-14 leading-relaxed"
            style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}
          >
            An owner was renting rooms individually with all utilities included.
            Tenants had zero reason to conserve. Bills were skyrocketing. He
            couldn&apos;t raise rent — the market wouldn&apos;t support it. He was losing
            money every month on a property he owned.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FadeIn delay={0.1}>
            <div className="p-8 border rounded-xl" style={{ backgroundColor: "#FDF9F9", borderColor: "#E8CECE", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
                Before Prospera
              </p>
              <ul className="space-y-4">
                {[
                  "All utilities included — tenants ran everything at full tilt",
                  "Skyrocketing hydro, water, and gas bills each month",
                  "Rooms rented piecemeal, no structure, high churn",
                  "Mortgage barely getting covered",
                  "Owner doing all lawn and snow himself",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="shrink-0 text-xs mt-1" style={{ color: "#C09090" }}>✕</span>
                    <span className="text-sm" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="p-8 border rounded-xl" style={{ backgroundColor: "#F7F5F2", borderColor: "#D8D2C8", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
                After Prospera
              </p>
              <ul className="space-y-4">
                {[
                  "Legally separated upstairs and basement into two distinct units",
                  "Utilities transferred to tenants' names — their bill, their problem",
                  "Sourced used lawn and snow equipment, passed responsibility to tenants",
                  "Owner now covers mortgage, bills, AND the management fee",
                  "Structure in place — the problem can't come back",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="shrink-0 text-xs mt-1" style={{ color: "#8B2030" }}>✓</span>
                    <span className="text-sm" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────

function Testimonials() {
  return (
    <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2" }}>
      <div className="max-w-3xl mx-auto">
        <FadeIn className="text-center mb-14">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
          >
            What Landlords Say
          </p>
          <h2
            className="text-4xl sm:text-5xl font-light leading-tight"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
          >
            Real reviews. Real landlords.
          </h2>
        </FadeIn>
        <GoogleReviews />
      </div>
    </section>
  );
}

// ── Platform Teaser ───────────────────────────────────────────────────────────

function PlatformTeaser() {
  const items = [
    "Rent collected automatically — no texts, no chasing",
    "N4 forms generated the moment rent is missed",
    "AI-triaged maintenance without the 11pm calls",
    "Every dollar tracked. Tax time handled.",
    "Tenant portal so they stop texting your personal number",
  ];

  return (
    <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#0D1820" }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-14 lg:gap-20 items-start">
          {/* Left */}
          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest mb-5" style={{ color: "rgba(250,248,245,0.35)", fontFamily: "var(--font-dm-sans)" }}>
              Introducing · Prospera Platform
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold leading-tight mb-6" style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>
              You bought passive income.<br />
              <span style={{ color: "rgba(250,248,245,0.3)" }}>Not a second job.</span>
            </h2>
            <p className="text-base leading-relaxed mb-8" style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)" }}>
              We&apos;re building the app that Ontario landlords with 2–5 properties have
              been waiting for. Rent, maintenance, legal notices, finances — automated.
              Built by Ebin, who&apos;s been managing properties in London, Ontario since 2021.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <span
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold"
                style={{ backgroundColor: "rgba(139,32,48,0.2)", border: "1px solid rgba(139,32,48,0.35)", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
              >
                90 days free for early members
              </span>
              <span
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold"
                style={{ backgroundColor: "rgba(250,248,245,0.06)", border: "1px solid rgba(250,248,245,0.12)", color: "rgba(250,248,245,0.65)", fontFamily: "var(--font-dm-sans)" }}
              >
                Then a fraction of a PM fee
              </span>
            </div>

            <Link
              href="/platform"
              className="inline-block px-8 py-4 text-xs font-semibold uppercase tracking-widest rounded transition-opacity hover:opacity-80"
              style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
            >
              Join the Waitlist — 90 Days Free →
            </Link>
          </div>

          {/* Right — feature list */}
          <div className="flex-shrink-0 w-full lg:w-80">
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(250,248,245,0.08)" }}>
              <div className="px-6 py-4 border-b" style={{ backgroundColor: "rgba(139,32,48,0.15)", borderColor: "rgba(250,248,245,0.08)" }}>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)" }}>
                  What it does
                </p>
              </div>
              {items.map((item, i) => (
                <div
                  key={i}
                  className="px-6 py-4 flex items-start gap-3 border-b last:border-b-0"
                  style={{ backgroundColor: "rgba(250,248,245,0.03)", borderColor: "rgba(250,248,245,0.06)" }}
                >
                  <span className="text-xs mt-0.5 flex-shrink-0" style={{ color: "#8B2030" }}>✓</span>
                  <p className="text-sm leading-snug" style={{ color: "rgba(250,248,245,0.65)", fontFamily: "var(--font-dm-sans)" }}>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Tenants Bar ───────────────────────────────────────────────────────────────

function TenantBar() {
  return (
    <section className="py-14 px-5 sm:px-8" style={{ backgroundColor: "#1F2F3A" }}>
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)" }}>
            Looking for a Rental?
          </p>
          <p className="text-xl font-semibold" style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>
            Browse professionally managed rentals in Southwestern Ontario.
          </p>
        </div>
        <Link
          href="/listings"
          className="shrink-0 px-8 py-3 text-xs font-semibold uppercase tracking-widest border transition-all duration-200 rounded"
          style={{
            borderColor: "rgba(250,248,245,0.25)",
            color: "rgba(250,248,245,0.85)",
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          View Listings
        </Link>
      </div>
    </section>
  );
}

// ── CTA Banner ────────────────────────────────────────────────────────────────

function CTABanner() {
  return (
    <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#FFFFFF" }}>
      <FadeIn className="max-w-2xl mx-auto text-center">
        <h2
          className="text-5xl sm:text-6xl font-light mb-4 leading-tight"
          style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
        >
          Own a rental.<br />Not a second job.
        </h2>
        <p
          className="text-sm leading-relaxed mb-10 max-w-sm mx-auto"
          style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}
        >
          Free consultation. Honest assessment. No pressure. Just a
          straightforward conversation about what your property could look like
          with the right management.
        </p>
        <motion.div
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(139,32,48,0)",
              "0 0 0 10px rgba(139,32,48,0.12)",
              "0 0 0 0 rgba(139,32,48,0)",
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
          className="inline-block rounded"
        >
          <Link
            href="/rent-analysis"
            className="inline-block px-10 py-4 text-xs font-semibold uppercase tracking-widest btn-primary rounded"
            style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
          >
            Get a Free Rental Analysis
          </Link>
        </motion.div>
      </FadeIn>
    </section>
  );
}

// ── Sticky CTA ────────────────────────────────────────────────────────────────

function StickyCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > window.innerHeight * 0.85);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-40 px-5 sm:px-8 py-3 flex items-center justify-between gap-4 pr-20 sm:pr-8"
          style={{
            backgroundColor: "#1F2F3A",
            borderTop: "1px solid rgba(250,248,245,0.08)",
          }}
        >
          <p className="text-xs sm:text-sm" style={{ color: "rgba(250,248,245,0.8)", fontFamily: "var(--font-dm-sans)" }}>
            <span className="sm:hidden">Free landlord quote</span>
            <span className="hidden sm:inline">Own a rental in Southwestern Ontario?</span>
          </p>
          <Link
            href="/rent-analysis"
            className="ml-auto px-6 py-2.5 text-xs font-semibold uppercase tracking-widest shrink-0 rounded"
            style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
          >
            Get a Free Rental Analysis →
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <PainPoints />
      <FeatureCards />
      <HowItWorks />
      <FounderSnippet />
      <CaseStudy />
      <Testimonials />
      <PlatformTeaser />
      <TenantBar />
      <section className="py-12 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-3xl mx-auto space-y-4">
          <BlogNudge
            hook="One bad tenant can cost you an entire year's profit."
            title="5 Red Flags When Screening Tenants"
            excerpt="Finding great tenants starts with knowing what to watch for. Here are five warning signs experienced landlords never ignore."
            slug="tenant-screening-red-flags"
            label="Protect your investment"
          />
          <BlogNudge
            hook="Do you know what you can legally charge in London right now?"
            title="How Much Can You Charge for Rent in London, Ontario?"
            excerpt="Current market rents by unit type across London, St. Thomas, and Strathroy — and how to price your property for fast, quality tenants."
            slug="how-much-charge-rent-london-ontario"
            label="Protect your investment"
          />
        </div>
      </section>
    </>
  );
}
