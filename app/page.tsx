"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "@/components/animations/FadeIn";
import CounterAnimation from "@/components/animations/CounterAnimation";

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://picsum.photos/seed/prospera-hero/1600/900"
          alt="Beautiful rental property"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, rgba(10,22,40,0.65) 0%, rgba(10,22,40,0.4) 60%, rgba(123,28,28,0.25) 100%)" }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest px-4 py-1.5 border"
            style={{
              borderColor: "rgba(250,248,245,0.4)",
              color: "rgba(250,248,245,0.8)",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            London · St. Thomas · Strathroy
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="text-5xl sm:text-6xl md:text-7xl font-light leading-tight mb-6"
          style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
        >
          Property Management
          <br />
          <em>That Actually Cares.</em>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-base sm:text-lg leading-relaxed mb-10 max-w-2xl mx-auto"
          style={{ color: "rgba(250,248,245,0.80)", fontFamily: "var(--font-dm-sans)" }}
        >
          Serving landlords and tenants across London, St. Thomas, and Strathroy, Ontario —
          with transparency, responsiveness, and genuine care.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/landlords"
            className="px-8 py-4 text-sm font-semibold uppercase tracking-widest bg-[#7B1C1C] text-[#FAF8F5] transition-all duration-200 hover:bg-[#9B2E2E] hover:scale-105"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            I&apos;m a Landlord
          </Link>
          <Link
            href="/tenants"
            className="px-8 py-4 text-sm font-semibold uppercase tracking-widest border border-[rgba(250,248,245,0.6)] text-[#FAF8F5] transition-all duration-200 hover:bg-white/10"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            I&apos;m a Tenant
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(250,248,245,0.6)" strokeWidth="1.5">
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
    { value: 50, suffix: "+", label: "Properties Managed" },
    { value: 3, suffix: "", label: "Cities Served" },
    { value: 5, suffix: "+", label: "Years in Business" },
  ];

  return (
    <section className="py-16 px-5 sm:px-8" style={{ backgroundColor: "#F5F0EB" }}>
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
        {stats.map((stat, i) => (
          <FadeIn key={stat.label} delay={i * 0.1}>
            <div>
              <div
                className="text-5xl sm:text-6xl font-light mb-2"
                style={{ color: "#0A1628", fontFamily: "var(--font-cormorant)" }}
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

// ── Two-Column Split ──────────────────────────────────────────────────────────

function TwoColumnSplit() {
  return (
    <section style={{ backgroundColor: "#FAF8F5" }}>
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Landlords */}
        <div className="relative min-h-[480px] sm:min-h-[560px] flex items-end overflow-hidden group">
          <Image
            src="https://picsum.photos/seed/prospera-landlord/800/600"
            alt="Rental property exterior"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: "cover", objectPosition: "center" }}
            className="transition-transform duration-700 group-hover:scale-105"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(10,22,40,0.75) 0%, rgba(10,22,40,0.1) 60%)" }}
          />
          <FadeIn className="relative z-10 p-8 sm:p-12" direction="up">
            <span
              className="inline-block text-xs font-semibold uppercase tracking-widest mb-4 text-[#7B1C1C]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              For Landlords
            </span>
            <h2
              className="text-3xl sm:text-4xl font-light mb-4 leading-tight text-[#FAF8F5]"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Own rental property?
              <br />
              <em>We handle everything.</em>
            </h2>
            <p
              className="text-sm leading-relaxed mb-6 max-w-sm"
              style={{ color: "rgba(250,248,245,0.75)", fontFamily: "var(--font-dm-sans)" }}
            >
              From tenant screening to rent collection and maintenance — we take the stress out of property ownership.
            </p>
            <Link
              href="/landlords"
              className="inline-block px-6 py-3 text-xs font-semibold uppercase tracking-widest bg-[#7B1C1C] text-[#FAF8F5] transition-all duration-200 hover:bg-[#9B2E2E]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Learn More
            </Link>
          </FadeIn>
        </div>

        {/* Tenants */}
        <div className="relative min-h-[480px] sm:min-h-[560px] flex items-end overflow-hidden group">
          <Image
            src="https://picsum.photos/seed/prospera-tenant/800/600"
            alt="Modern apartment interior"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: "cover", objectPosition: "center" }}
            className="transition-transform duration-700 group-hover:scale-105"
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(45,74,94,0.80) 0%, rgba(45,74,94,0.1) 60%)" }}
          />
          <FadeIn className="relative z-10 p-8 sm:p-12" direction="up" delay={0.1}>
            <span
              className="inline-block text-xs font-semibold uppercase tracking-widest mb-4 text-[#7B1C1C]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              For Tenants
            </span>
            <h2
              className="text-3xl sm:text-4xl font-light mb-4 leading-tight text-[#FAF8F5]"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Looking for a home?
              <br />
              <em>Find your next rental.</em>
            </h2>
            <p
              className="text-sm leading-relaxed mb-6 max-w-sm"
              style={{ color: "rgba(250,248,245,0.75)", fontFamily: "var(--font-dm-sans)" }}
            >
              Browse quality rentals in London, St. Thomas, and Strathroy — professionally managed, well-maintained.
            </p>
            <Link
              href="/tenants"
              className="inline-block px-6 py-3 text-xs font-semibold uppercase tracking-widest bg-[#2D4A5E] text-[#FAF8F5] transition-all duration-200 hover:bg-[#3a5f78]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              View Listings
            </Link>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Tell Us About Your Property",
      description: "Share details about your rental property or tell us what you're looking for. We'll take it from there.",
    },
    {
      number: "02",
      title: "We Find and Screen Tenants",
      description: "Our thorough vetting process means only qualified, reliable tenants move into your property.",
    },
    {
      number: "03",
      title: "You Collect Rent, Stress-Free",
      description: "Sit back while we handle rent collection, maintenance requests, inspections, and everything in between.",
    },
  ];

  return (
    <section className="py-20 sm:py-28 px-5 sm:px-8" style={{ backgroundColor: "#FAF8F5" }}>
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-16">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-4 text-[#7B1C1C]"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            How It Works
          </span>
          <h2
            className="text-4xl sm:text-5xl font-light leading-tight text-[#0A1628]"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Property management
            <br />
            <em>made simple.</em>
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <FadeIn key={step.number} delay={i * 0.15} direction="up">
              <div
                className="p-8 h-full"
                style={{ backgroundColor: "#F5F0EB", border: "1px solid rgba(10,22,40,0.06)" }}
              >
                <div
                  className="text-5xl font-light mb-6"
                  style={{ color: "#7B1C1C", fontFamily: "var(--font-cormorant)", opacity: 0.6 }}
                >
                  {step.number}
                </div>
                <h3
                  className="text-xl font-semibold mb-3 text-[#0A1628]"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "rgba(10,22,40,0.65)", fontFamily: "var(--font-dm-sans)" }}
                >
                  {step.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────

const testimonials = [
  {
    quote: "Prospera took over my London property and I've had zero headaches since. Rent comes in on time, tenants are happy, and I get clear updates every month. Couldn't ask for more.",
    author: "Ebin J.",
    role: "Landlord in London, ON",
  },
  {
    quote: "Finally found a property management company that actually picks up the phone. They handled a plumbing issue the same day — my tenant was thrilled. That's the standard they set every time.",
    author: "Ebin K.",
    role: "Landlord in St. Thomas, ON",
  },
  {
    quote: "As a tenant, I've dealt with unresponsive landlords my whole life. Prospera is different — professional, respectful, and they actually maintain the property. I renewed immediately.",
    author: "Ebin M.",
    role: "Tenant in Strathroy, ON",
  },
];

function Testimonials() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  return (
    <section className="py-20 sm:py-28 px-5 sm:px-8" style={{ backgroundColor: "#F5F0EB" }}>
      <div className="max-w-3xl mx-auto">
        <FadeIn className="text-center mb-16">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-4 text-[#7B1C1C]"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            What People Say
          </span>
          <h2
            className="text-4xl sm:text-5xl font-light text-[#0A1628]"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Trusted by landlords
            <br />
            <em>and tenants alike.</em>
          </h2>
        </FadeIn>

        <div className="relative min-h-[200px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <div
                className="text-7xl font-light mb-4 leading-none text-[#7B1C1C]"
                style={{ fontFamily: "var(--font-cormorant)", opacity: 0.4 }}
              >
                &ldquo;
              </div>
              <p
                className="text-lg sm:text-xl leading-relaxed mb-8 text-[#0A1628]"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                {testimonials[current].quote}
              </p>
              <div
                className="text-sm font-semibold mb-1 text-[#0A1628]"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {testimonials[current].author}
              </div>
              <div
                className="text-xs uppercase tracking-widest text-[#7B1C1C]"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {testimonials[current].role}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mt-10">
          <button
            onClick={prev}
            className="w-10 h-10 flex items-center justify-center border border-[rgba(10,22,40,0.2)] text-[#0A1628] transition-colors hover:bg-[#0A1628] hover:text-[#FAF8F5]"
            aria-label="Previous testimonial"
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
                  backgroundColor: i === current ? "#7B1C1C" : "rgba(10,22,40,0.2)",
                  transform: i === current ? "scale(1.25)" : "scale(1)",
                }}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-10 h-10 flex items-center justify-center border border-[rgba(10,22,40,0.2)] text-[#0A1628] transition-colors hover:bg-[#0A1628] hover:text-[#FAF8F5]"
            aria-label="Next testimonial"
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

// ── CTA Banner ────────────────────────────────────────────────────────────────

function CTABanner() {
  return (
    <section className="py-20 sm:py-28 px-5 sm:px-8" style={{ backgroundColor: "#0A1628" }}>
      <FadeIn className="max-w-3xl mx-auto text-center">
        <span
          className="inline-block text-xs font-semibold uppercase tracking-widest mb-6 text-[#7B1C1C]"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          Get Started
        </span>
        <h2
          className="text-4xl sm:text-5xl font-light mb-6 leading-tight text-[#FAF8F5]"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          Ready to stop managing
          <br />
          <em>your property alone?</em>
        </h2>
        <p
          className="text-base leading-relaxed mb-10 max-w-xl mx-auto"
          style={{ color: "rgba(250,248,245,0.65)", fontFamily: "var(--font-dm-sans)" }}
        >
          Let us handle the hard parts. Get a free, no-obligation consultation and find out how Prospera can work for you.
        </p>
        <Link
          href="/contact"
          className="inline-block px-10 py-4 text-sm font-semibold uppercase tracking-widest bg-[#7B1C1C] text-[#FAF8F5] transition-all duration-200 hover:bg-[#9B2E2E] hover:scale-105"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          Get a Free Quote
        </Link>
      </FadeIn>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <TwoColumnSplit />
      <HowItWorks />
      <Testimonials />
      <CTABanner />
    </>
  );
}
