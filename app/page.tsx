"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "@/components/animations/FadeIn";
import CounterAnimation from "@/components/animations/CounterAnimation";
import ParticleCanvas from "@/components/animations/ParticleCanvas";
import FloatingCharacters from "@/components/animations/FloatingCharacters";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import type { Testimonial } from "@/components/ui/testimonials-columns-1";
import BlogNudge from "@/components/ui/BlogNudge";

// ── Animated Heading (character-by-character) ────────────────────────────────

function AnimatedHeading({ text, className, style }: { text: string; className?: string; style?: React.CSSProperties }) {
  const [triggered, setTriggered] = useState(false);
  const lines = text.split("\n");
  const charDelay = 30;
  const initialDelay = 200;

  useEffect(() => {
    const t = setTimeout(() => setTriggered(true), initialDelay);
    return () => clearTimeout(t);
  }, []);

  let globalIndex = 0;

  return (
    <h1 className={className} style={style}>
      {lines.map((line, lineIdx) => {
        // Split into words, animate per-character but wrap per-word
        const words = line.split(" ");
        return (
          <span key={lineIdx} className="block">
            {words.map((word, wordIdx) => (
              <span key={wordIdx} className="inline-block whitespace-nowrap">
                {word.split("").map((char) => {
                  const delay = globalIndex * charDelay;
                  globalIndex++;
                  return (
                    <span
                      key={`${lineIdx}-${globalIndex}`}
                      className="inline-block transition-all"
                      style={{
                        opacity: triggered ? 1 : 0,
                        transform: triggered ? "translateX(0)" : "translateX(-18px)",
                        transitionDuration: "500ms",
                        transitionDelay: `${delay}ms`,
                      }}
                    >
                      {char}
                    </span>
                  );
                })}
                {wordIdx < words.length - 1 && (() => {
                  globalIndex++;
                  return <span className="inline-block" style={{ width: "0.3em" }} />;
                })()}
              </span>
            ))}
          </span>
        );
      })}
    </h1>
  );
}

// ── Fade In (delay-based) ────────────────────────────────────────────────────

function HeroFadeIn({ delay, duration = 1000, children }: { delay: number; duration?: number; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className="transition-opacity"
      style={{ opacity: visible ? 1 : 0, transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

const VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4";

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden" style={{ backgroundColor: "#000", fontSize: "16px" }}>
      {/* Video Background — raw HTML to bypass React autoplay issues */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0 }}
        dangerouslySetInnerHTML={{
          __html: `<video autoplay loop muted playsinline preload="auto" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;" src="${VIDEO_URL}"></video>`,
        }}
      />

        {/* Floating characters */}
        <FloatingCharacters />

        {/* Content layer */}
        <div className="relative flex-1 flex flex-col" style={{ zIndex: 2 }}>

          {/* Hero content — pushed to bottom */}
          <div className="flex-1 flex flex-col justify-end px-6 md:px-12 lg:px-16 pb-12 lg:pb-16">
            <div className="lg:grid lg:grid-cols-2 lg:items-end">

              {/* Left Column — Main content */}
              <div>
                {/* Location tag */}
                <HeroFadeIn delay={100} duration={600}>
                  <div className="mb-6">
                    <span
                      className="liquid-glass inline-block text-xs font-semibold uppercase tracking-widest px-5 py-2 rounded-lg border border-white/20"
                      style={{ color: "rgba(250,248,245,0.7)", fontFamily: "var(--font-dm-sans)" }}
                    >
                      London · St. Thomas · Strathroy
                    </span>
                  </div>
                </HeroFadeIn>

                {/* Animated heading */}
                <AnimatedHeading
                  text={"What if your investment\nwas ACTUALLY passive?"}
                  className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-normal mb-4"
                  style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)", letterSpacing: "-0.04em", lineHeight: 1.05 }}
                />

                {/* Subheading */}
                <HeroFadeIn delay={800} duration={1000}>
                  <p
                    className="text-base md:text-lg mb-5 max-w-xl"
                    style={{ color: "rgba(250,248,245,0.75)", fontFamily: "var(--font-dm-sans)", lineHeight: 1.7 }}
                  >
                    Own a rental property without losing your sanity. Built for landlords with 2–5 properties who want their time back.
                  </p>
                </HeroFadeIn>

                {/* Buttons */}
                <HeroFadeIn delay={1200} duration={1000}>
                  <div className="flex flex-wrap gap-4 mb-8 lg:mb-0">
                    <Link
                      href="/rent-analysis"
                      className="bg-white text-black px-8 py-3 rounded-lg font-medium text-sm transition-colors hover:bg-gray-100"
                      style={{ fontFamily: "var(--font-dm-sans)" }}
                    >
                      Get a Free Rental Analysis
                    </Link>
                    <Link
                      href="/listings"
                      className="liquid-glass border border-white/20 text-white px-8 py-3 rounded-lg font-medium text-sm transition-all hover:bg-white hover:text-black"
                      style={{ fontFamily: "var(--font-dm-sans)" }}
                    >
                      Browse Listings
                    </Link>
                  </div>
                </HeroFadeIn>
              </div>

              {/* Right Column — Tag */}
              <div className="flex items-end justify-start lg:justify-end">
                <HeroFadeIn delay={1400} duration={1000}>
                  <div className="liquid-glass border border-white/20 px-6 py-3 rounded-xl">
                    <span
                      className="text-lg md:text-xl lg:text-2xl font-light"
                      style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
                    >
                      Management. Placement. Peace of mind.
                    </span>
                  </div>
                </HeroFadeIn>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2"
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
        </div>
      </section>
  );
}

// ── Stats Bar ─────────────────────────────────────────────────────────────────

function StatsBar() {
  const stats = [
    { value: 25, suffix: "+", label: "Tenants Placed Without a Single Eviction" },
    { value: 20, suffix: "+", label: "Landlords Who Sleep Better" },
    { value: 0, suffix: "", label: "LTB Hearings. Zero." },
    { value: 21, suffix: " days", label: "Average Vacancy — Then It's Filled" },
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
                style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}
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
      label: "You're texting tenants about rent again",
      sub: "Every month it's the same stress. You shouldn't have to chase money you're already owed.",
    },
    {
      label: "A pipe bursts at 11pm. It's your problem.",
      sub: "You wanted passive income. Instead you got a second job you can't clock out of.",
    },
    {
      label: "One bad tenant just cost you $8,000",
      sub: "Missed rent, property damage, legal fees. A single bad placement wipes out a year of profit.",
    },
    {
      label: "You're guessing what to charge for rent",
      sub: "Too high and you sit vacant. Too low and you leave thousands on the table every year.",
    },
  ];

  return (
    <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <p
            className="text-xs font-semibold uppercase tracking-widest text-center mb-4"
            style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}
          >
            This Is Costing You
          </p>
          <h2
            className="text-4xl sm:text-5xl font-light text-center mb-14 leading-tight"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
          >
            Every month you manage it yourself,<br />you&apos;re losing money or time. Usually both.
          </h2>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pains.map((pain, i) => (
            <FadeIn key={i} delay={i * 0.08} className="h-full">
              <div
                className="pain-card p-7 border rounded-xl overflow-hidden relative h-full"
                style={{ borderColor: "#D8D2C8", backgroundColor: "#F7F5F2", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ backgroundColor: "#8B2030" }} />
                <p className="font-semibold text-base leading-snug mb-2" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
                  {pain.label}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
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
      title: "Stop worrying about who's living in your property",
      desc: "Bad tenants cost thousands. Every applicant goes through credit, income, criminal, and landlord reference checks. 25+ placements so far — zero evictions, zero LTB cases.",
    },
    {
      num: "02",
      title: "Stop overpaying for repairs you can't verify",
      desc: "You see the contractor's actual invoice. A flat 8% coordination fee covers the rest. No inflated quotes, no hidden markups, no percentage skimmed off every job.",
    },
    {
      num: "03",
      title: "Stop explaining your property to a new person every time",
      desc: "Your property isn't one of 200 in a portfolio. When something happens, the person who picks up has been inside your unit and knows its history.",
    },
    {
      num: "04",
      title: "Stop waiting 3 days for a callback",
      desc: "You text. You get an answer. Not a receptionist, not a ticket — the person who actually manages your property. That's how it should work.",
    },
  ];

  return (
    <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2" }}>
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <p
            className="text-xs font-semibold uppercase tracking-widest text-center mb-4"
            style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}
          >
            The Difference
          </p>
          <h2
            className="text-4xl sm:text-5xl font-light text-center mb-14 leading-tight"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
          >
            What your life looks like when<br />someone competent handles it.
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
                  style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}
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
      phase: "You get clarity",
      timeline: "Days 1–3",
      steps: [
        "Know exactly what your property should earn — no guessing",
        "Get a pricing strategy based on real local rental data",
        "Understand the plan before a single dollar is spent",
      ],
    },
    {
      num: "02",
      phase: "You get your time back",
      timeline: "Weeks 1–4",
      steps: [
        "Your phone stops ringing with tenant inquiries",
        "Showings, screening, and lease signing — all handled",
        "You only hear from us when there's a qualified tenant ready",
      ],
    },
    {
      num: "03",
      phase: "You get passive income. Actually passive.",
      timeline: "Every month",
      steps: [
        "Rent deposited to your account — no chasing, no reminders",
        "Maintenance resolved before you even knew it was an issue",
        "One clear statement on the 5th. That's your only touchpoint.",
      ],
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <p
            className="text-xs font-semibold uppercase tracking-widest text-center mb-4"
            style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}
          >
            First 30 Days
          </p>
          <h2
            className="text-4xl sm:text-5xl font-light text-center mb-16 leading-tight"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
          >
            How fast your life changes<br />once you stop doing this yourself.
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
                    <p className="text-xs mt-0.5" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
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
      <div className="max-w-5xl mx-auto text-center">
        <FadeIn>
          <div className="w-10 h-px mx-auto mb-8" style={{ backgroundColor: "rgba(250,248,245,0.3)" }} />
          <blockquote
            className="text-3xl sm:text-4xl font-light leading-tight mb-6"
            style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
          >
            &ldquo;I&apos;ve sat in the parking lot after a move-out staring at $4,000
            in damage. I&apos;ve had the tenant who was perfect on paper and a nightmare
            in person. Every system we use exists because I learned the hard way first.&rdquo;
          </blockquote>
          <p className="text-sm mb-6" style={{ color: "rgba(250,248,245,0.6)", fontFamily: "var(--font-dm-sans)" }}>
            — Ebin Jaison, Founder
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
            style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}
          >
            Real Landlord, Real Numbers
          </p>
          <h2
            className="text-4xl sm:text-5xl font-light text-center mb-4 leading-tight"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
          >
            He was losing money every month<br />on a property he owned.
          </h2>
          <p
            className="text-sm text-center max-w-xl mx-auto mb-14 leading-relaxed"
            style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}
          >
            Utilities included. Tenants running everything full blast.
            Bills climbing every month with no way to raise rent.
            He was paying to be a landlord. Here&apos;s what changed.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FadeIn delay={0.1}>
            <div className="p-8 border rounded-xl" style={{ backgroundColor: "#FDF9F9", borderColor: "#E8CECE", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
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
              <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
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

const ALL_TESTIMONIALS: Testimonial[] = [
  {
    name: "Gilsy Sebastian",
    role: "Google Review",
    text: "Very efficient, professional and promising agent. Highly recommended if anyone looking for property management or rent services.",
  },
  {
    name: "Manjit Singh",
    role: "Google Review",
    text: "Thank you for the seamless work. Your staging advice and regular updates made all the difference. I'll be sure to recommend you.",
  },
  {
    name: "Ryan",
    role: "Google Review",
    text: "Really smooth renting experience. The team was helpful and responsive — highly recommend!",
  },
  {
    name: "Nahala Naushad",
    role: "Google Review",
    text: "I found my new home near my workplace with the help of Prospera Properties, and it was a great experience. Ebin was very friendly, responsive, and always available to answer my questions. Highly recommend.",
  },
  {
    name: "Anna Shaji",
    role: "Google Review",
    text: "It was confusing to find a bachelor's as a new Western student. Prospera helped narrow things down and made the process easier. Communication was clear and everything went smoothly.",
  },
  {
    name: "Bibin Sebastian",
    role: "Google Review",
    text: "Ebin's communication was consistently prompt, clear, and proactive, keeping us informed at every stage. We particularly valued his honest advice and genuine commitment to finding the perfect place.",
  },
  {
    name: "Aarsha Jerome",
    role: "Google Review",
    text: "Prospera Properties did a great job helping me find a private room. The process was smooth, professional, and stress-free. I would definitely recommend Prospera Properties to anyone looking for a rental.",
  },
  {
    name: "Aadhil T Mujeeb",
    role: "Google Review",
    text: "Overall a great experience. Super easy to deal with and quick to respond whenever I needed something.",
  },
  {
    name: "Clibert Devassy",
    role: "Google Review",
    text: "Delivers exceptional service — punctual, reliable, and always accessible. His professionalism and dedication give us complete peace of mind. Highly recommended.",
  },
];

const col1 = ALL_TESTIMONIALS.slice(0, 3);
const col2 = ALL_TESTIMONIALS.slice(3, 6);
const col3 = ALL_TESTIMONIALS.slice(6, 9);

function Testimonials() {
  return (
    <section className="py-24 px-5 sm:px-8 overflow-hidden" style={{ backgroundColor: "#F7F5F2" }}>
      <div className="max-w-4xl mx-auto">
        <FadeIn className="text-center mb-14">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}
          >
            Don&apos;t Take Our Word For It
          </p>
          <h2
            className="text-4xl sm:text-5xl font-light leading-tight"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
          >
            Here&apos;s what they said after switching.
          </h2>
          <p className="mt-4 text-sm" style={{ color: "rgba(15,28,40,0.50)", fontFamily: "var(--font-dm-sans)" }}>
            5.0 ★ on Google · 20+ reviews
          </p>
        </FadeIn>

        <div
          className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]"
          style={{ maxHeight: 680, overflow: "hidden" }}
        >
          <TestimonialsColumn testimonials={col1} duration={18} />
          <TestimonialsColumn testimonials={col2} duration={22} className="hidden md:block" />
          <TestimonialsColumn testimonials={col3} duration={20} className="hidden lg:block" />
        </div>

        <div className="text-center mt-10">
          <a
            href="https://share.google/Zicj8qNuNcLhLhqvf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs hover:opacity-70 transition-opacity"
            style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)", fontWeight: 600 }}
          >
            See all reviews on Google →
          </a>
        </div>
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
              Tired of spreadsheets<br />
              <span style={{ color: "rgba(250,248,245,0.3)" }}>and scattered texts?</span>
            </h2>
            <p className="text-base leading-relaxed mb-8" style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)" }}>
              Rent collection, maintenance requests, legal notices, financial tracking —
              one place instead of twelve. Built for Ontario landlords with 2–5 properties
              who want their rental income without the operational chaos.
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
                style={{ backgroundColor: "rgba(250,248,245,0.06)", border: "1px solid rgba(250,248,245,0.12)", color: "rgba(250,248,245,0.8)", fontFamily: "var(--font-dm-sans)" }}
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
                  <p className="text-sm leading-snug" style={{ color: "rgba(250,248,245,0.8)", fontFamily: "var(--font-dm-sans)" }}>
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
            Quality rentals that are actually maintained. See what&apos;s available.
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
          What would you do with<br />10 extra hours a month?
        </h2>
        <p
          className="text-sm leading-relaxed mb-10 max-w-sm mx-auto"
          style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}
        >
          Find out what your property should be earning and what
          it&apos;s costing you to manage it yourself. Free analysis.
          No pressure. No sales pitch.
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
            <span className="sm:hidden">Stop managing it yourself</span>
            <span className="hidden sm:inline">Find out what your property should be earning</span>
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
        <div className="max-w-5xl mx-auto space-y-4">
          <BlogNudge
            hook="One bad tenant just wiped out your entire year's profit."
            title="5 Red Flags When Screening Tenants"
            excerpt="Finding great tenants starts with knowing what to watch for. Here are five warning signs experienced landlords never ignore."
            slug="tenant-screening-red-flags"
            label="Protect your investment"
          />
          <BlogNudge
            hook="You might be charging $200/month less than you should be."
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
