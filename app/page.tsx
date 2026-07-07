"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "@/components/animations/FadeIn";
import CounterAnimation from "@/components/animations/CounterAnimation";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import type { Testimonial } from "@/components/ui/testimonials-columns-1";
import BlogNudge from "@/components/ui/BlogNudge";

// ── Heading ───────────────────────────────────────────────────────────────────
// SEO-safe: renders as plain, fully-visible h1 text.
// The previous character-by-character animation started each char at opacity:0,
// which made the hero heading invisible to search engines. Replaced with
// static rendering — content is always visible.

function AnimatedHeading({ text, className, style }: { text: string; className?: string; style?: React.CSSProperties }) {
  const lines = text.split("\n");
  return (
    <h1 className={className} style={style}>
      {lines.map((line, lineIdx) => (
        <span key={lineIdx} className="block">{line}</span>
      ))}
    </h1>
  );
}

// ── Hero Fade In ─────────────────────────────────────────────────────────────
// SEO-safe: content is visible immediately (opacity: 1 in SSR HTML).
// After hydration, a subtle fade-in animates in for visual polish — but content
// is never hidden. Above-fold content must always be immediately visible.

function HeroFadeIn({ delay, duration = 600, children }: { delay: number; duration?: number; children: React.ReactNode }) {
  // No opacity hiding — hero content must be instantly visible to crawlers
  // and users. The animation is cosmetic only and does not hide content.
  return (
    <div>{children}</div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Ensure video plays on mount (autoplay can be finicky)
    const v = videoRef.current;
    if (v) {
      v.play().catch(() => {});
    }
  }, []);

  return (
    <section className="relative overflow-hidden" style={{ fontSize: "16px" }}>
      {/* Video background — fills entire hero */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        poster="/hero-poster.jpg"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay for text contrast */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, rgba(15,23,30,0.82) 0%, rgba(15,23,30,0.72) 50%, rgba(15,23,30,0.9) 100%)", zIndex: 1 }}
      />

      {/* Content — centered over video */}
      <div className="relative flex items-center justify-center min-h-screen px-5 sm:px-8" style={{ zIndex: 2 }}>
        <div className="max-w-3xl text-center py-32">

          {/* Eyebrow */}
          <HeroFadeIn delay={0} duration={500}>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-6"
              style={{ color: "rgba(250,248,245,0.7)", fontFamily: "var(--font-dm-sans)" }}
            >
              Property Management · London, Ontario
            </p>
          </HeroFadeIn>

          {/* Heading */}
          <AnimatedHeading
            text={"What if your investment\nwas ACTUALLY passive?"}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6"
            style={{ color: "#FFFFFF", fontFamily: "var(--font-cormorant)", letterSpacing: "-0.03em", lineHeight: 1.1, textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}
          />

          {/* Subheading */}
          <HeroFadeIn delay={800} duration={1000}>
            <p
              className="text-base md:text-lg mb-10 max-w-xl mx-auto"
              style={{ color: "rgba(250,248,245,0.9)", fontFamily: "var(--font-dm-sans)", lineHeight: 1.8 }}
            >
              You bought the property for freedom. Instead you got midnight calls, chasing rent, and tenants who treat your investment like it&apos;s disposable. We fix that.
            </p>
          </HeroFadeIn>

          {/* CTA */}
          <HeroFadeIn delay={1100} duration={1000}>
            <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
              <Link
                href="/freedom-score"
                className="px-8 py-4 text-xs font-semibold uppercase tracking-widest rounded transition-opacity hover:opacity-80"
                style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
              >
                Landlord Freedom Test
              </Link>
              <a
                href="tel:5196971227"
                className="text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: "rgba(250,248,245,0.85)", fontFamily: "var(--font-dm-sans)" }}
              >
                or call (519) 697-1227
              </a>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
              >
                <span className="text-sm font-semibold" style={{ color: "#FFFFFF", fontFamily: "var(--font-dm-sans)" }}>
                  90-Day Satisfaction Guarantee
                </span>
              </div>
              <p className="text-xs text-center" style={{ color: "rgba(250,248,245,0.55)", fontFamily: "var(--font-dm-sans)" }}>
                Built for landlords self-managing 2–5 units in London & surrounding areas within 45 min
              </p>
            </div>
          </HeroFadeIn>

        </div>
      </div>
    </section>
  );
}

// ── Stats Bar ─────────────────────────────────────────────────────────────────

function StatsBar() {
  const stats = [
    { value: 25, suffix: "+", label: "Tenants Placed — Zero Evictions" },
    { value: 20, suffix: "+", label: "Landlords Who Trust Us" },
    { value: 0, suffix: "", label: "LTB Hearings. Zero. Ever." },
    { value: 21, suffix: " days", label: "Average Time to Fill a Vacancy" },
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {phases.map((phase, i) => (
            <FadeIn key={phase.num} delay={i * 0.12} className="flex">
              <div
                className="border p-8 rounded-xl flex flex-col w-full"
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
            Real Landlord, Real Results
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold text-center mb-4 leading-tight"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
          >
            He was paying to be a landlord.
          </h2>
          <p
            className="text-base text-center max-w-xl mx-auto mb-14 leading-relaxed"
            style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}
          >
            Utilities included in the lease. Tenants running heat, AC, and hot water at full blast 24/7. Bills climbing every month with no legal way to raise rent. He was losing money on a property he owned outright.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FadeIn delay={0.1} className="flex">
            <div className="p-8 border rounded-xl flex flex-col w-full" style={{ backgroundColor: "#FDF9F9", borderColor: "#E8CECE", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: "#999", fontFamily: "var(--font-dm-sans)" }}>
                What he was dealing with
              </p>
              <ul className="space-y-4">
                {[
                  { bold: "Watching money disappear every month.", detail: "Hydro, gas, and water bills climbing — and he was the one paying all of it." },
                  { bold: "No idea what his property was actually earning.", detail: "Rooms rented to whoever showed up. No screening. No structure. Tenants coming and going." },
                  { bold: "Doing the yard work himself.", detail: "Mowing, shovelling, hauling salt — on top of his full-time job. Every weekend." },
                  { bold: "Dreading every phone call.", detail: "Broken this, leaking that, a tenant who won't pay. No system, no backup, no break." },
                  { bold: "Mortgage barely covered.", detail: "After expenses, he was making nothing. Some months he was in the red." },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="shrink-0 text-sm mt-0.5" style={{ color: "#C09090" }}>✕</span>
                    <div>
                      <span className="text-sm font-semibold block" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>{item.bold}</span>
                      <span className="text-sm" style={{ color: "#666", fontFamily: "var(--font-dm-sans)" }}>{item.detail}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>

          <FadeIn delay={0.2} className="flex">
            <div className="p-8 border rounded-xl flex flex-col w-full" style={{ backgroundColor: "#F7F5F2", borderColor: "#D8D2C8", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: "#999", fontFamily: "var(--font-dm-sans)" }}>
                What changed
              </p>
              <ul className="space-y-4">
                {[
                  { bold: "Rent deposited on the 1st. Statement on the 5th.", detail: "No more chasing tenants. No more guessing what he earned. One clear report every month." },
                  { bold: "Utilities off his books entirely.", detail: "We transferred everything to the tenants' names. Their usage, their bill." },
                  { bold: "He gets a text every time something is fixed.", detail: "Maintenance handled, photo attached, cost listed. He knows what happened without lifting a finger." },
                  { bold: "One dashboard for everything.", detail: "Rent status, maintenance history, lease dates, documents — all in one place. No spreadsheets, no guessing." },
                  { bold: "He covers mortgage, bills, management fee — and still profits.", detail: "Restructured the property into two legal units. Income up. Expenses down. The math finally works." },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="shrink-0 text-sm mt-0.5" style={{ color: "#8B2030" }}>✓</span>
                    <div>
                      <span className="text-sm font-semibold block" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>{item.bold}</span>
                      <span className="text-sm" style={{ color: "#666", fontFamily: "var(--font-dm-sans)" }}>{item.detail}</span>
                    </div>
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
        <style>{`
          @keyframes cta-pulse {
            0%   { box-shadow: 0 0 0 0 rgba(139,32,48,0); }
            50%  { box-shadow: 0 0 0 10px rgba(139,32,48,0.12); }
            100% { box-shadow: 0 0 0 0 rgba(139,32,48,0); }
          }
          .cta-pulse { animation: cta-pulse 2.5s ease-out infinite; }
        `}</style>
        <div className="cta-pulse inline-block rounded">
          <Link
            href="/rent-analysis"
            className="inline-block px-10 py-4 text-xs font-semibold uppercase tracking-widest btn-primary rounded"
            style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
          >
            Get a Free Rental Analysis
          </Link>
        </div>
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

// ── Services ──────────────────────────────────────────────────────────────────

function Services() {
  return (
    <section className="py-20 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2" }}>
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <p className="text-xs font-semibold uppercase tracking-widest text-center mb-3" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
            For Self-Managing Landlords
          </p>
          <h2 className="text-4xl sm:text-5xl font-light text-center mb-12 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
            Still doing it yourself with 2–5 units?
          </h2>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FadeIn delay={0.06}>
            <Link
              href="/services/tenant-placement"
              className="group block rounded-2xl border overflow-hidden transition-shadow hover:shadow-lg"
              style={{ backgroundColor: "#FFFFFF", borderColor: "#D8D2C8" }}
            >
              <div className="px-8 pt-8 pb-3">
                <div className="text-3xl mb-5">🔍</div>
                <h3 className="text-2xl font-semibold mb-3" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
                  Tenant Placement
                </h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                  We list, screen, and place a quality tenant — credit check, income verification, reference calls, Ontario-compliant lease, and 102-point move-in inspection. You don&apos;t lift a finger.
                </p>
              </div>
              <div className="px-8 py-4 flex items-center justify-between" style={{ backgroundColor: "#F7F5F2", borderTop: "1px solid #E8E3DC" }}>
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>
                  How it works →
                </span>
                <span className="text-xs" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>Typically 2–4 weeks</span>
              </div>
            </Link>
          </FadeIn>

          <FadeIn delay={0.12}>
            <Link
              href="/landlords"
              className="group block rounded-2xl border overflow-hidden transition-shadow hover:shadow-lg"
              style={{ backgroundColor: "#FFFFFF", borderColor: "#D8D2C8" }}
            >
              <div className="px-8 pt-8 pb-3">
                <div className="text-3xl mb-5">🏠</div>
                <h3 className="text-2xl font-semibold mb-3" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
                  Property Management
                </h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                  Rent collection, maintenance coordination, tenant communication, monthly statements, lease renewals — all of it. One flat fee, no markups, no midnight calls to you.
                </p>
              </div>
              <div className="px-8 py-4 flex items-center justify-between" style={{ backgroundColor: "#F7F5F2", borderTop: "1px solid #E8E3DC" }}>
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>
                  Full details →
                </span>
                <span className="text-xs" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>90-day guarantee</span>
              </div>
            </Link>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <StatsBar />
      <PainPoints />
      <FeatureCards />
      <HowItWorks />
      <FounderSnippet />
      <CaseStudy />
      <Testimonials />
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
