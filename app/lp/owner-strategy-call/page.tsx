"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import OwnerCallForm from "@/components/lp/OwnerCallForm";
import StickyMobileCTA from "@/components/lp/StickyMobileCTA";
import ReviewScreenshotGallery from "@/components/lp/ReviewScreenshotGallery";
import CaseStudyCard, { type CaseStudy } from "@/components/lp/CaseStudyCard";

const FONT = "var(--font-dm-sans)";
const SERIF = "var(--font-cormorant)";
const NAVY = "#1F2F3A";
const CRIMSON = "#8B2030";
const CREAM = "#F7F5F2";
const BORDER = "#E8E4DF";

// Real, already-vetted numbers used consistently across the main site — not
// new stats invented for this page.
const STATS = [
  { v: "25+", l: "Tenant Placements" },
  { v: "20+", l: "Five-Star Reviews" },
  { v: "0", l: "LTB Cases" },
  { v: "21 Days", l: "Avg. Vacancy Fill" },
];

const PLACEHOLDER_CASE_STUDIES: CaseStudy[] = [
  {
    propertyType: "Case Study",
    headline: "Your case study headline goes here.",
    problem: "A one-line summary of the situation before Prospera.",
    whatWeDid: "What Prospera actually did to fix it.",
    result: "The specific, verifiable outcome.",
    placeholder: true,
  },
  {
    propertyType: "Case Study",
    headline: "Your case study headline goes here.",
    problem: "A one-line summary of the situation before Prospera.",
    whatWeDid: "What Prospera actually did to fix it.",
    result: "The specific, verifiable outcome.",
    placeholder: true,
  },
];

function CTAButton({ label = "Book My Owner Strategy Call", onClick, full = false, large = false, variant = "primary" }: {
  label?: string; onClick: () => void; full?: boolean; large?: boolean; variant?: "primary" | "light";
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: full ? "block" : "inline-block",
        width: full ? "100%" : undefined,
        textAlign: "center",
        backgroundColor: variant === "primary" ? CRIMSON : "#FFFFFF",
        color: variant === "primary" ? "#FAF8F5" : NAVY,
        fontFamily: FONT,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        padding: large ? "20px 44px" : "16px 32px",
        borderRadius: 8,
        border: "none",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

export default function OwnerStrategyCallLP() {
  const [showForm, setShowForm] = useState(false);
  const open = () => setShowForm(true);

  return (
    <div style={{ backgroundColor: CREAM, fontFamily: FONT }} className="min-h-screen">

      {/* ── Header ───────────────────────────────────────────────── */}
      <header style={{ backgroundColor: NAVY, borderBottom: "1px solid rgba(255,255,255,0.07)", position: "sticky", top: 0, zIndex: 50 }}>
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <span className="font-light text-2xl" style={{ color: "#FAF8F5", fontFamily: SERIF }}>Prospera</span>
          <button
            onClick={open}
            className="hidden sm:inline-block text-xs font-semibold uppercase tracking-widest px-5 py-2 rounded"
            style={{ backgroundColor: CRIMSON, color: "#FAF8F5", fontFamily: FONT, border: "none", cursor: "pointer" }}
          >
            Book Free Call
          </button>
          <a href="tel:+15196971227" className="sm:hidden text-sm" style={{ color: "rgba(250,248,245,0.7)", fontFamily: FONT }}>
            (519) 697-1227
          </a>
        </div>
      </header>

      {/* ── 1. Hero ──────────────────────────────────────────────── */}
      <section style={{ backgroundColor: NAVY }} className="pt-14 pb-16 px-5">
        <div className="max-w-3xl mx-auto text-center">
          <p
            className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-6"
            style={{ backgroundColor: "rgba(250,248,245,0.09)", color: "rgba(250,248,245,0.6)", border: "1px solid rgba(250,248,245,0.15)" }}
          >
            For owners of 2–15 rental properties
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light leading-tight mb-6" style={{ color: "#FAF8F5", fontFamily: SERIF }}>
            Your Rentals Should Make You Money.
            <br />
            <em style={{ color: "rgba(250,248,245,0.5)" }}>Not Give You Another Job.</em>
          </h1>
          <p className="text-base leading-relaxed mb-8 max-w-xl mx-auto" style={{ color: "rgba(250,248,245,0.65)" }}>
            Prospera handles the tenants, the rent, the repairs, and the paperwork that
            come with owning rentals. You keep control of the property. We take the
            daily work off your plate.
          </p>
          <CTAButton onClick={open} large />
          <p className="mt-4 text-xs font-medium" style={{ color: "rgba(250,248,245,0.4)" }}>15 minutes · Free · No pressure</p>

          <div className="mt-10 flex flex-wrap justify-center gap-6 md:gap-10">
            {STATS.map((s) => (
              <div key={s.l} className="text-center">
                <p className="text-2xl font-light" style={{ color: "#FAF8F5", fontFamily: SERIF }}>{s.v}</p>
                <p className="text-[11px] font-medium uppercase tracking-widest" style={{ color: "rgba(250,248,245,0.4)" }}>{s.l}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-xs" style={{ color: "rgba(250,248,245,0.3)" }}>London, St. Thomas, and Strathroy, Ontario</p>
        </div>
      </section>

      {/* ── 2. Does this sound like you? ─────────────────────────── */}
      <section style={{ backgroundColor: "#FFFFFF" }} className="py-16 px-5">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-4 text-center" style={{ color: CRIMSON }}>Does This Sound Like You?</p>
          <h2 className="text-3xl sm:text-4xl font-light mb-12 leading-tight text-center" style={{ color: NAVY, fontFamily: SERIF }}>
            Owning a rental isn&apos;t supposed to feel like this.
          </h2>
          <div className="space-y-8">
            {[
              { icon: "📱", title: "Tenant messages follow you everywhere.", body: "At work. At dinner. On vacation. Something breaks, and you're still the one they call." },
              { icon: "🔧", title: "You're also the maintenance department.", body: "The tenant texts you. You find someone to fix it. You arrange access. You follow up on the bill. One small repair just ate your afternoon." },
              { icon: "💼", title: "You bought an investment. You got a second job.", body: "Rent. Repairs. Showings. Applications. Renewals. Paperwork. None of that is why you bought the property." },
            ].map((p) => (
              <div key={p.title} className="flex items-start gap-5">
                <span className="text-3xl shrink-0" aria-hidden>{p.icon}</span>
                <div>
                  <p className="text-lg font-semibold mb-1" style={{ color: NAVY }}>{p.title}</p>
                  <p className="text-base leading-relaxed" style={{ color: "#555" }}>{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Identity cards ─────────────────────────────────────── */}
      <section style={{ backgroundColor: CREAM, borderTop: `1px solid ${BORDER}` }} className="py-16 px-5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-light mb-12 leading-tight text-center" style={{ color: NAVY, fontFamily: SERIF }}>
            We built Prospera for owners like you.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { title: "The Growing Investor", body: "Your portfolio grew. Your systems didn't. Two rentals became four. Four became seven. You're still answering every text yourself. We take the daily work off your plate." },
              { title: "The Absentee Owner", body: "You don't live near the rental. You shouldn't have to drive across town — or across the province — every time something happens. We become your local point person." },
              { title: "The Accidental Landlord", body: "You own a rental you never planned to manage. Maybe you inherited it. Maybe you moved and kept the old house. Keep the property. Lose the extra job." },
            ].map((c) => (
              <div key={c.title} className="p-7 rounded-xl" style={{ backgroundColor: "#FFFFFF", border: `1px solid ${BORDER}` }}>
                <p className="text-lg font-semibold mb-3" style={{ color: NAVY, fontFamily: SERIF }}>{c.title}</p>
                <p className="text-sm leading-relaxed" style={{ color: "#555" }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. The transformation ────────────────────────────────── */}
      <section style={{ backgroundColor: "#FFFFFF", borderTop: `1px solid ${BORDER}` }} className="py-16 px-5">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-light mb-10 leading-tight text-center" style={{ color: NAVY, fontFamily: SERIF }}>
            Imagine owning your rentals without dealing with this.
          </h2>
          <div className="space-y-3 mb-10">
            {[
              ["Tenant has a question?", "Prospera handles it."],
              ["Something breaks?", "Prospera coordinates it."],
              ["Rent needs collecting?", "Prospera handles it."],
              ["A contractor needs access?", "Prospera coordinates it."],
              ["Lease is coming up?", "Prospera tracks it."],
              ["Tenant moves out?", "Prospera manages the process."],
              ["Want to know what's happening?", "Check your owner dashboard."],
            ].map(([q, a]) => (
              <div key={q} className="flex items-center justify-between gap-4 px-5 py-4 rounded-lg" style={{ backgroundColor: CREAM }}>
                <p className="text-sm" style={{ color: "#666" }}>{q}</p>
                <p className="text-sm font-semibold text-right" style={{ color: NAVY }}>{a}</p>
              </div>
            ))}
          </div>
          <p className="text-xl sm:text-2xl font-light text-center leading-snug" style={{ color: NAVY, fontFamily: SERIF }}>
            You stop being the property manager.
            <br />You go back to being the owner.
          </p>
        </div>
      </section>

      {/* ── 5. What Prospera takes off your plate ────────────────── */}
      <section style={{ backgroundColor: CREAM, borderTop: `1px solid ${BORDER}` }} className="py-16 px-5">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-4 text-center" style={{ color: CRIMSON }}>What Comes Off Your Plate</p>
          <h2 className="text-3xl sm:text-4xl font-light mb-12 leading-tight text-center" style={{ color: NAVY, fontFamily: SERIF }}>
            Five things you stop doing yourself.
          </h2>
          <div className="space-y-4">
            {[
              { title: "We handle your tenants.", body: "Day-to-day questions, maintenance requests, rent reminders, move-in and move-out, renewals — all of it.", close: "Your tenants know who to call. That person doesn't have to be you." },
              { title: "We handle maintenance.", body: "Intake, finding the right contractor, scheduling, access, and following up until it's actually done.", close: "You choose your repair approval limit. We handle the headache. You keep control of the money." },
              { title: "We handle the money.", body: "Rent collection, arrears follow-up, expense tracking, and a clear statement every month." },
              { title: "We keep you in the loop.", body: "Rent status, expenses, open repairs, lease dates — all in your owner dashboard.", close: "Open your phone. Know what's happening. Get back to your life." },
              { title: "We remember the boring stuff.", body: "Lease renewals, inspections, documents — the things that are easy to forget until they cost you.", close: "Your rental shouldn't depend on you remembering everything." },
            ].map((g) => (
              <div key={g.title} className="p-6 rounded-xl" style={{ backgroundColor: "#FFFFFF", border: `1px solid ${BORDER}` }}>
                <p className="text-lg font-semibold mb-2" style={{ color: NAVY, fontFamily: SERIF }}>{g.title}</p>
                <p className="text-sm leading-relaxed mb-2" style={{ color: "#555" }}>{g.body}</p>
                {g.close && <p className="text-sm font-medium" style={{ color: CRIMSON }}>{g.close}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Communication / visibility ────────────────────────── */}
      <section style={{ backgroundColor: "#FFFFFF", borderTop: `1px solid ${BORDER}` }} className="py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-4 text-center" style={{ color: CRIMSON }}>Stop Chasing Updates</p>
          <h2 className="text-3xl sm:text-4xl font-light mb-4 leading-tight text-center" style={{ color: NAVY, fontFamily: SERIF }}>
            Know what&apos;s happening without asking.
          </h2>
          <p className="text-sm text-center max-w-lg mx-auto mb-12" style={{ color: "#666" }}>
            Every month, a clear picture of your property lands in your inbox — you never have to chase it.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 items-start mb-14">
            {[
              { src: "/lp-pm-dashboard.png", w: 440, h: 780, title: "Owner Dashboard", desc: "Rent status, occupancy, and open repairs — always up to date." },
              { src: "/lp-pm-monthly-statement.png", w: 440, h: 900, title: "Monthly Snapshot", desc: "Money in, money out, and what's still open — every month." },
              { src: "/lp-pm-portfolio-report.png", w: 440, h: 780, title: "Portfolio Report", desc: "Net income and anything that needs your decision." },
            ].map((s) => (
              <div key={s.title} className="flex flex-col items-center gap-4">
                <div style={{ width: "100%", maxWidth: 200, margin: "0 auto", border: "6px solid #1a1a1a", borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.14)" }}>
                  <Image src={s.src} alt={s.title} width={s.w} height={s.h} className="w-full h-auto block" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold mb-1" style={{ color: NAVY }}>{s.title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: "#666" }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/demo/owner" className="text-sm underline" style={{ color: NAVY }}>See the full owner dashboard demo →</Link>
          </div>
        </div>
      </section>

      {/* ── 7. Switching to Prospera ──────────────────────────────── */}
      <section style={{ backgroundColor: CREAM, borderTop: `1px solid ${BORDER}` }} className="py-16 px-5">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-4 text-center" style={{ color: CRIMSON }}>Switching Property Managers</p>
          <h2 className="text-3xl sm:text-4xl font-light mb-2 leading-tight text-center" style={{ color: NAVY, fontFamily: SERIF }}>
            Sounds painful.
          </h2>
          <p className="text-lg text-center mb-12" style={{ color: "#666" }}>So we handle the switch.</p>
          <div className="space-y-4 mb-10">
            {[
              ["1", "You tell us about the property."],
              ["2", "We organize the takeover — leases, tenant info, keys, records, maintenance history."],
              ["3", "We introduce Prospera to your tenants."],
              ["4", "We set up the property in our system."],
              ["5", "You stop managing it."],
            ].map(([n, t]) => (
              <div key={n} className="flex items-start gap-4">
                <span className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: "rgba(139,32,48,0.1)", color: CRIMSON }}>{n}</span>
                <p className="text-base leading-relaxed pt-1" style={{ color: "#333" }}>{t}</p>
              </div>
            ))}
          </div>
          <p className="text-lg font-light text-center mb-8" style={{ color: NAVY, fontFamily: SERIF }}>
            You shouldn&apos;t spend your weekend switching property managers.
          </p>
          <div className="text-center">
            <CTAButton label="Show Me How Prospera Would Take Over My Rentals" onClick={open} />
          </div>
        </div>
      </section>

      {/* ── 8. Risk reversal ──────────────────────────────────────── */}
      <section style={{ backgroundColor: "#FFFFFF", borderTop: `1px solid ${BORDER}` }} className="py-16 px-5">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-4 text-center" style={{ color: CRIMSON }}>Try Prospera Without Feeling Trapped</p>
          <h2 className="text-3xl sm:text-4xl font-light mb-12 leading-tight text-center" style={{ color: NAVY, fontFamily: SERIF }}>
            Here&apos;s exactly what we promise.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { title: "90-Day Easy Exit", body: "If we're not delivering in 90 days, we refund every single penny of our management fees. No conditions. No fine print." },
              { title: "You Control Major Spending", body: "You tell us your repair approval limit. Under that, we just handle it. Over that, we call you first." },
              { title: "No Mystery Fees", body: "You see the complete fee structure before you sign anything." },
              { title: "We Actually Respond", body: "You're not left wondering if your message got read. We get back to you." },
            ].map((g) => (
              <div key={g.title} className="p-6 rounded-xl" style={{ backgroundColor: CREAM, border: `1px solid ${BORDER}` }}>
                <p className="text-base font-semibold mb-2" style={{ color: NAVY }}>{g.title}</p>
                <p className="text-sm leading-relaxed" style={{ color: "#555" }}>{g.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. Social proof ───────────────────────────────────────── */}
      <section style={{ backgroundColor: CREAM, borderTop: `1px solid ${BORDER}` }} className="py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-4 text-center" style={{ color: CRIMSON }}>Real Properties. Real Owners. Real Results.</p>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span style={{ color: CRIMSON, fontSize: 16, letterSpacing: 3 }}>★★★★★</span>
            <span className="text-2xl font-light" style={{ color: NAVY, fontFamily: SERIF }}>5.0</span>
            <a href="https://share.google/Zicj8qNuNcLhLhqvf" target="_blank" rel="noopener noreferrer" className="text-xs underline" style={{ color: "#999" }}>
              20+ Google reviews
            </a>
          </div>
          <div className="mb-14">
            <ReviewScreenshotGallery screenshots={[{ src: null, alt: "Google review" }, { src: null, alt: "Google review" }, { src: null, alt: "Google review" }, { src: null, alt: "Google review" }]} />
          </div>

          <h3 className="text-2xl sm:text-3xl font-light mb-8 leading-tight text-center" style={{ color: NAVY, fontFamily: SERIF }}>
            Case studies
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {PLACEHOLDER_CASE_STUDIES.map((s, i) => <CaseStudyCard key={i} study={s} />)}
          </div>
        </div>
      </section>

      {/* ── 10. Self-management cost ──────────────────────────────── */}
      <section style={{ backgroundColor: NAVY }} className="py-16 px-5">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: CRIMSON }}>What Is Self-Managing Really Costing You?</p>
          <h2 className="text-3xl sm:text-4xl font-light mb-8 leading-tight" style={{ color: "#FAF8F5", fontFamily: SERIF }}>
            It&apos;s not just money.
          </h2>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {["Tenant calls", "Contractor calls", "Driving to the property", "Showings", "Applications", "Renewals", "Inspections", "Interrupted evenings", "Lost weekends"].map((t) => (
              <span key={t} className="text-xs font-medium px-3 py-2 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(250,248,245,0.6)" }}>{t}</span>
            ))}
          </div>
          <p className="text-lg leading-relaxed mb-3" style={{ color: "#FAF8F5" }}>
            Saving a management fee isn&apos;t free if you&apos;re paying for it with your time.
          </p>
          <p className="text-base leading-relaxed mb-10" style={{ color: "rgba(250,248,245,0.6)" }}>
            Prospera takes the daily work off your plate for a small share of the rent your
            properties already produce. We&apos;ll show you the exact numbers on your
            Owner Strategy Call.
          </p>
          <CTAButton onClick={open} />
        </div>
      </section>

      {/* ── 11. Qualification ─────────────────────────────────────── */}
      <section style={{ backgroundColor: "#FFFFFF", borderTop: `1px solid ${BORDER}` }} className="py-16 px-5">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-4 text-center" style={{ color: CRIMSON }}>Is This You?</p>
          <h2 className="text-3xl sm:text-4xl font-light mb-12 leading-tight text-center" style={{ color: NAVY, fontFamily: SERIF }}>
            Prospera isn&apos;t for every landlord.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl" style={{ backgroundColor: "#F5FAF8", border: "1px solid #C8DDD5" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#2A6049" }}>Good Fit</p>
              {[
                "Own roughly 2–15 rental units",
                "Properties that rent for about $2,500/month or more",
                "Want less day-to-day involvement",
                "Value clear communication and real systems",
                "Want your rental to act like an investment, not a second job",
              ].map((t) => (
                <div key={t} className="flex items-start gap-2.5 mb-2.5">
                  <span className="shrink-0 text-xs mt-1" style={{ color: "#2A6049" }}>✓</span>
                  <p className="text-sm" style={{ color: "#333" }}>{t}</p>
                </div>
              ))}
            </div>
            <div className="p-6 rounded-xl" style={{ backgroundColor: "#FDF9F9", border: "1px solid #F0C4C4" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#8B2030" }}>Not a Good Fit</p>
              {[
                "Looking for the cheapest possible service",
                "Want to personally handle every routine tenant interaction",
                "Expect a manager to remove every risk of owning real estate",
                "Not willing to keep the rental safe and legal",
                "Properties renting below roughly $2,500/month",
              ].map((t) => (
                <div key={t} className="flex items-start gap-2.5 mb-2.5">
                  <span className="shrink-0 text-xs mt-1" style={{ color: "#8B2030" }}>✕</span>
                  <p className="text-sm" style={{ color: "#333" }}>{t}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-center mt-8" style={{ color: "#888" }}>
            If that&apos;s you, no hard feelings — our{" "}
            <Link href="/resources" className="underline" style={{ color: NAVY }}>free landlord tools</Link>{" "}
            can still help.
          </p>
        </div>
      </section>

      {/* ── 12. Final close ───────────────────────────────────────── */}
      <section style={{ backgroundColor: NAVY }} className="py-24 px-5 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-light mb-4 leading-tight" style={{ color: "#FAF8F5", fontFamily: SERIF }}>
            You worked to buy the properties.
          </h2>
          <p className="text-xl sm:text-2xl font-light mb-8" style={{ color: "rgba(250,248,245,0.5)", fontFamily: SERIF }}>
            You don&apos;t have to spend the next 20 years managing them.
          </p>
          <p className="text-sm leading-relaxed mb-10 max-w-md mx-auto" style={{ color: "rgba(250,248,245,0.6)" }}>
            We&apos;ll look at your portfolio. We&apos;ll show you what Prospera could take
            off your plate. We&apos;ll explain how the switch works. We&apos;ll show you
            the exact cost. Then you decide.
          </p>
          <CTAButton large onClick={open} />
          <p className="mt-4 text-xs" style={{ color: "rgba(250,248,245,0.4)" }}>15 minutes · Free · No pressure</p>
          <p className="mt-6 text-xs" style={{ color: "rgba(250,248,245,0.2)" }}>
            (519) 697-1227 &nbsp;·&nbsp; prosperapropertiess@gmail.com
          </p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer style={{ backgroundColor: "#141F29", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto px-5 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-lg font-light" style={{ color: "#FAF8F5", fontFamily: SERIF }}>Prospera Properties</p>
          <p className="text-xs text-center" style={{ color: "rgba(250,248,245,0.3)" }}>
            London, St. Thomas, and Strathroy, Ontario &nbsp;·&nbsp;{" "}
            <Link href="/privacy" style={{ color: "rgba(250,248,245,0.3)" }}>Privacy</Link>
          </p>
        </div>
      </footer>

      <StickyMobileCTA onOpen={open} />
      <OwnerCallForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  );
}
