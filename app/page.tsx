"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "@/components/animations/FadeIn";
import CounterAnimation from "@/components/animations/CounterAnimation";
import ParticleCanvas from "@/components/animations/ParticleCanvas";

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center px-5 sm:px-8 text-center overflow-hidden"
      style={{ backgroundColor: "#0D1B2A" }}
    >
      {/* Particle animation */}
      <ParticleCanvas />

      {/* Subtle burgundy glow top-right */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 75% 15%, rgba(123,28,28,0.15) 0%, transparent 55%)",
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
              color: "#7B1C1C",
              fontFamily: "var(--font-dm-sans)",
              border: "1px solid rgba(123,28,28,0.35)",
            }}
          >
            London · St. Thomas · Strathroy
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="text-6xl sm:text-7xl md:text-8xl font-light leading-[1.05] mb-7"
          style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
        >
          Built for landlords
          <br />
          <em style={{ color: "#C4B08A" }}>with 1 to 5 doors.</em>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-base sm:text-lg leading-relaxed mb-10 max-w-xl mx-auto"
          style={{ color: "rgba(250,248,245,0.60)", fontFamily: "var(--font-dm-sans)" }}
        >
          You bought the rental. We take it from there — tenants, rent,
          maintenance, all of it. No call centers. No ticket numbers. Just
          someone who actually picks up the phone.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#how-it-works"
            className="px-8 py-4 text-xs font-semibold uppercase tracking-widest transition-all duration-200 hover:opacity-80 rounded-lg"
            style={{
              backgroundColor: "#7B1C1C",
              color: "#FAF8F5",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            See How It Works
          </a>
          <Link
            href="/contact"
            className="px-8 py-4 text-xs font-semibold uppercase tracking-widest border transition-all duration-200 hover:bg-white/5 rounded-lg"
            style={{
              borderColor: "rgba(250,248,245,0.25)",
              color: "#FAF8F5",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            Get a Free Quote
          </Link>
        </motion.div>
      </div>

      {/* Scroll chevron */}
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
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(250,248,245,0.35)"
            strokeWidth="1.5"
          >
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
    { value: 2, suffix: "+ yrs", label: "Managing Rentals" },
  ];

  return (
    <section className="py-14 px-5 sm:px-8" style={{ backgroundColor: "#F5F0EB" }}>
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
        {stats.map((stat, i) => (
          <FadeIn key={stat.label} delay={i * 0.08}>
            <div>
              <div
                className="text-5xl sm:text-6xl font-light mb-1"
                style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}
              >
                <CounterAnimation target={stat.value} suffix={stat.suffix} />
              </div>
              <div
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
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
    <section className="py-20 px-5 sm:px-8" style={{ backgroundColor: "#FAF8F5" }}>
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <p
            className="text-xs font-semibold uppercase tracking-widest text-center mb-4"
            style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
          >
            Sound Familiar?
          </p>
          <h2
            className="text-4xl sm:text-5xl font-light text-center mb-14 leading-tight"
            style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}
          >
            If you recognize any of these,
            <br />
            <em>you&apos;re in the right place.</em>
          </h2>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pains.map((pain, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div
                className="p-6 border flex gap-4 rounded-xl"
                style={{ borderColor: "#E8E4DF", backgroundColor: "#FFFDFB" }}
              >
                <div
                  className="w-1 shrink-0 rounded-full mt-1"
                  style={{ backgroundColor: "#7B1C1C" }}
                />
                <div>
                  <p
                    className="font-medium mb-1 text-sm"
                    style={{ color: "#0D1B2A", fontFamily: "var(--font-dm-sans)" }}
                  >
                    {pain.label}
                  </p>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "#7A7A7A", fontFamily: "var(--font-dm-sans)" }}
                  >
                    {pain.sub}
                  </p>
                </div>
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
      icon: "◎",
      title: "Obsessive Tenant Screening",
      desc: "Credit check. Income verification. Criminal background. Landlord references. Every single time. 25+ placements — all paying rent.",
    },
    {
      icon: "⊟",
      title: "Zero Maintenance Markup",
      desc: "Two years building a bench of trusted contractors — deep cleans to full reno coordination. You pay what they charge. Not a cent more.",
    },
    {
      icon: "◈",
      title: "Boutique by Design",
      desc: "We could manage 100 properties. We don't. We take on what we can manage exceptionally well. Your property gets real attention.",
    },
    {
      icon: "◷",
      title: "Direct Access, Not a Call Center",
      desc: "You get Ebin's number. When something happens, you're not filing a ticket or waiting on hold. You get a real response.",
    },
  ];

  return (
    <section className="py-20 px-5 sm:px-8" style={{ backgroundColor: "#F5F0EB" }}>
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <p
            className="text-xs font-semibold uppercase tracking-widest text-center mb-4"
            style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
          >
            Why Prospera
          </p>
          <h2
            className="text-4xl sm:text-5xl font-light text-center mb-14 leading-tight"
            style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}
          >
            What we actually do differently.
          </h2>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.08}>
              <motion.div
                className="bg-white p-8 border h-full cursor-default rounded-xl"
                style={{ borderColor: "#E8E4DF" }}
                whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.07)" }}
                transition={{ duration: 0.2 }}
              >
                <span className="block text-2xl mb-5" style={{ color: "#7B1C1C" }}>
                  {f.icon}
                </span>
                <h3
                  className="text-xl font-medium mb-3"
                  style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}
                >
                  {f.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}
                >
                  {f.desc}
                </p>
              </motion.div>
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
      phase: "Onboarding",
      timeline: "Days 1–3",
      steps: [
        "Property walkthrough & condition report",
        "Market rent analysis",
        "Strategy & pricing agreed",
      ],
    },
    {
      num: "02",
      phase: "Tenant Placement",
      timeline: "Weeks 1–4",
      steps: [
        "Photos + listing written and launched",
        "Applications reviewed, screened thoroughly",
        "Lease signed, move-in inspected",
      ],
    },
    {
      num: "03",
      phase: "Ongoing Management",
      timeline: "Every month",
      steps: [
        "Rent collected, deposited to you",
        "Maintenance handled start to finish",
        "Monthly statement, zero surprises",
      ],
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#FAF8F5" }}>
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <p
            className="text-xs font-semibold uppercase tracking-widest text-center mb-4"
            style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
          >
            The Process
          </p>
          <h2
            className="text-4xl sm:text-5xl font-light text-center mb-16 leading-tight"
            style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}
          >
            From handshake to hands-off
            <br />
            <em>in three phases.</em>
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {phases.map((phase, i) => (
            <FadeIn key={phase.num} delay={i * 0.12}>
              <div className="relative" style={{ height: "100%" }}>
                {/* Connector line (desktop only) */}
                {i < phases.length - 1 && (
                  <div
                    className="hidden md:block absolute top-8 left-full w-full h-px -translate-y-1/2 z-0"
                    style={{ backgroundColor: "#E8E4DF", width: "calc(100% - 2rem)" }}
                  />
                )}
                <div
                  className="bg-white border p-7 h-full relative z-10 rounded-xl"
                  style={{ borderColor: "#E8E4DF" }}
                >
                  <div className="flex items-start gap-4 mb-5">
                    <span
                      className="text-4xl font-light leading-none"
                      style={{ color: "#7B1C1C", fontFamily: "var(--font-cormorant)", opacity: 0.5 }}
                    >
                      {phase.num}
                    </span>
                    <div>
                      <p
                        className="font-semibold text-base"
                        style={{ color: "#0D1B2A", fontFamily: "var(--font-dm-sans)" }}
                      >
                        {phase.phase}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
                      >
                        {phase.timeline}
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-2.5">
                    {phase.steps.map((step, j) => (
                      <li key={j} className="flex items-start gap-2.5">
                        <span className="mt-1.5 shrink-0 w-1 h-1 rounded-full" style={{ backgroundColor: "#7B1C1C" }} />
                        <span
                          className="text-sm leading-relaxed"
                          style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}
                        >
                          {step}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
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
    <section className="py-20 px-5 sm:px-8" style={{ backgroundColor: "#0D1B2A" }}>
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-48 h-48 shrink-0 relative overflow-hidden rounded-full">
              <Image
                src="/ebin-candid.jpg"
                alt="Ebin Jaison — Owner, Prospera Properties"
                fill
                sizes="192px"
                style={{ objectFit: "cover", objectPosition: "center top" }}
              />
            </div>

            <div className="text-center md:text-left">
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-5"
                style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
              >
                The Owner
              </p>
              <blockquote
                className="text-3xl sm:text-4xl font-light leading-tight mb-6"
                style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
              >
                &ldquo;I&apos;ve been the tenant. The house coordinator. The
                operations manager. I built this with all three lenses — and I
                choose to stay small on purpose.&rdquo;
              </blockquote>
              <div className="flex items-center gap-4 justify-center md:justify-start mb-6">
                <div className="w-10 h-px" style={{ backgroundColor: "#7B1C1C" }} />
                <p
                  className="text-sm"
                  style={{ color: "rgba(250,248,245,0.6)", fontFamily: "var(--font-dm-sans)" }}
                >
                  Ebin Jaison, Owner
                </p>
              </div>
              <Link
                href="/about"
                className="inline-block text-xs font-semibold uppercase tracking-widest border-b pb-0.5 transition-opacity hover:opacity-70"
                style={{ color: "#C4B08A", borderColor: "rgba(196,176,138,0.4)", fontFamily: "var(--font-dm-sans)" }}
              >
                Read the full story →
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ── Case Study ────────────────────────────────────────────────────────────────

function CaseStudy() {
  return (
    <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#FAF8F5" }}>
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <p
            className="text-xs font-semibold uppercase tracking-widest text-center mb-4"
            style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
          >
            Real Result
          </p>
          <h2
            className="text-4xl sm:text-5xl font-light text-center mb-4 leading-tight"
            style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}
          >
            From drowning in utility bills
            <br />
            <em>to covering the mortgage.</em>
          </h2>
          <p
            className="text-sm text-center max-w-xl mx-auto mb-14 leading-relaxed"
            style={{ color: "#7A7A7A", fontFamily: "var(--font-dm-sans)" }}
          >
            An owner was renting rooms individually with all utilities included.
            Tenants had zero reason to conserve. Bills were skyrocketing. He
            couldn&apos;t raise rent — the market wouldn&apos;t support it. He was losing
            money every month on a property he owned.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FadeIn delay={0.1}>
            <div
              className="p-8 border rounded-xl"
              style={{ backgroundColor: "#FFF8F8", borderColor: "rgba(123,28,28,0.15)" }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-6"
                style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
              >
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
                    <span className="shrink-0 text-xs mt-1" style={{ color: "#7B1C1C" }}>✕</span>
                    <span className="text-sm" style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div
              className="p-8 border rounded-xl"
              style={{ backgroundColor: "#F5FBF5", borderColor: "rgba(40,100,60,0.15)" }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-6"
                style={{ color: "#2D6A4F", fontFamily: "var(--font-dm-sans)" }}
              >
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
                    <span className="shrink-0 text-xs mt-1" style={{ color: "#2D6A4F" }}>✓</span>
                    <span className="text-sm" style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}>{item}</span>
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

// TODO: Replace placeholder quotes with real testimonials from Ebin
const testimonials = [
  {
    quote:
      "Prospera took over my London duplex and I've had zero headaches since. Rent hits my account on time, tenants are happy, and Ebin actually answers when I call. Couldn't ask for more.",
    author: "Landlord — London, ON",
    stars: 5,
  },
  {
    quote:
      "I was self-managing my triplex while working full time and it was killing me. Handed it over to Prospera and within a month I forgot I even owned a rental. That's the point.",
    author: "Landlord — St. Thomas, ON",
    stars: 5,
  },
  {
    quote:
      "They found a tenant for my unit in under two weeks, fully screened. No drama, no delays. The whole process was smoother than anything I'd experienced managing it myself.",
    author: "Landlord — Strathroy, ON",
    stars: 5,
  },
];

function Testimonials() {
  const [current, setCurrent] = useState(0);

  const prev = () =>
    setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  return (
    <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#F5F0EB" }}>
      <div className="max-w-3xl mx-auto">
        <FadeIn className="text-center mb-14">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
          >
            What Landlords Say
          </p>
          <h2
            className="text-4xl sm:text-5xl font-light text-[#0D1B2A] leading-tight"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            20+ five-star reviews
            <br />
            <em>and counting.</em>
          </h2>
        </FadeIn>

        <div className="relative min-h-[220px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="text-center"
            >
              {/* Stars */}
              <div className="flex justify-center gap-1 mb-6">
                {Array.from({ length: testimonials[current].stars }).map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#7B1C1C">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              <p
                className="text-xl sm:text-2xl font-light leading-relaxed mb-8"
                style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}
              >
                &ldquo;{testimonials[current].quote}&rdquo;
              </p>
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
              >
                {testimonials[current].author}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mt-10">
          <button
            onClick={prev}
            className="w-10 h-10 flex items-center justify-center border border-[rgba(13,27,42,0.2)] text-[#0D1B2A] transition-colors hover:bg-[#0D1B2A] hover:text-[#FAF8F5] rounded-lg"
            aria-label="Previous"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="w-2 h-2 rounded-full transition-all duration-200"
                style={{
                  backgroundColor: i === current ? "#7B1C1C" : "rgba(13,27,42,0.2)",
                  transform: i === current ? "scale(1.3)" : "scale(1)",
                }}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-10 h-10 flex items-center justify-center border border-[rgba(13,27,42,0.2)] text-[#0D1B2A] transition-colors hover:bg-[#0D1B2A] hover:text-[#FAF8F5] rounded-lg"
            aria-label="Next"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

// ── Tenants Bar ───────────────────────────────────────────────────────────────

function TenantBar() {
  return (
    <section className="py-14 px-5 sm:px-8" style={{ backgroundColor: "#0D1B2A" }}>
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
          >
            Looking for a Rental?
          </p>
          <p
            className="text-2xl font-light"
            style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
          >
            Browse professionally managed rentals in Southwestern Ontario.
          </p>
        </div>
        <Link
          href="/listings"
          className="shrink-0 px-8 py-3 text-xs font-semibold uppercase tracking-widest border transition-all duration-200 hover:bg-white/5 rounded-lg"
          style={{
            borderColor: "rgba(250,248,245,0.25)",
            color: "#FAF8F5",
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
    <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#FAF8F5" }}>
      <FadeIn className="max-w-2xl mx-auto text-center">
        <h2
          className="text-5xl sm:text-6xl font-light mb-4 leading-tight"
          style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}
        >
          Own a rental.
          <br />
          <em style={{ color: "#7B1C1C" }}>Not a second job.</em>
        </h2>
        <p
          className="text-sm leading-relaxed mb-10 max-w-sm mx-auto"
          style={{ color: "#7A7A7A", fontFamily: "var(--font-dm-sans)" }}
        >
          Free consultation. Honest assessment. No pressure. Just a
          straightforward conversation about what your property could look like
          with the right management.
        </p>
        <motion.div
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(123,28,28,0)",
              "0 0 0 10px rgba(123,28,28,0.15)",
              "0 0 0 0 rgba(123,28,28,0)",
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
          className="inline-block"
        >
          <Link
            href="/contact"
            className="inline-block px-10 py-4 text-xs font-semibold uppercase tracking-widest transition-opacity hover:opacity-80 rounded-lg"
            style={{ backgroundColor: "#7B1C1C", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
          >
            Get a Free Quote
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
          className="fixed bottom-0 left-0 right-0 z-40 px-5 sm:px-8 py-3 flex items-center justify-between gap-4"
          style={{
            backgroundColor: "#0D1B2A",
            borderTop: "1px solid rgba(250,248,245,0.08)",
          }}
        >
          <p
            className="text-sm hidden sm:block"
            style={{ color: "rgba(250,248,245,0.6)", fontFamily: "var(--font-dm-sans)" }}
          >
            Own a rental in Southwestern Ontario?
          </p>
          <Link
            href="/contact"
            className="ml-auto px-6 py-2.5 text-xs font-semibold uppercase tracking-widest transition-opacity hover:opacity-80 shrink-0 rounded-lg"
            style={{
              backgroundColor: "#7B1C1C",
              color: "#FAF8F5",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            Get a Free Quote →
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
      <TenantBar />
      <CTABanner />
      <StickyCTA />
    </>
  );
}
