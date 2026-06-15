"use client";

import Link from "next/link";
import GoogleReviews from "@/components/ui/GoogleReviews";
import type { Metadata } from "next";

// ── Fill these before going live ────────────────────────────────────────────
const CALENDLY_URL = "https://calendly.com/YOUR_LINK_HERE"; // ← replace
const FREE_TRIAL_TERMS =
  "Management fee waived for the first 60 days. Placement fee applies if a new tenant is placed during the trial period. No lock-in contract — cancel anytime."; // ← confirm wording
// ────────────────────────────────────────────────────────────────────────────

const FONT_SANS = "var(--font-dm-sans)";
const FONT_SERIF = "var(--font-cormorant)";
const NAVY = "#1F2F3A";
const CRIMSON = "#8B2030";
const CREAM = "#F7F5F2";

function CalendlyButton({
  label = "Book a Call & Claim 60 Days Free",
  size = "default",
}: {
  label?: string;
  size?: "default" | "large";
}) {
  const padding = size === "large" ? "20px 40px" : "16px 32px";
  const fontSize = size === "large" ? "13px" : "12px";
  return (
    <a
      href={CALENDLY_URL}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-block",
        backgroundColor: CRIMSON,
        color: "#FAF8F5",
        fontFamily: FONT_SANS,
        fontSize,
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        padding,
        borderRadius: "6px",
        textDecoration: "none",
      }}
    >
      {label}
    </a>
  );
}

const PAIN_LINES = [
  "The rental was supposed to be income. Lately it feels like a second job.",
  "The phone rings at the worst times — a leak, a lockout, a complaint.",
  "Rent is late again, and you're the one stuck chasing it.",
  "You're not sure your lease or last dispute followed Ontario's rules.",
  "Every vacancy quietly eats the returns you bought this property for.",
  "Your evenings disappear into someone else's problems.",
];

const PILLARS = [
  {
    label: "Rent Collected For You",
    why: "Pre-authorized rent from day one. Immediate follow-up on anything late.",
    outcome: "Predictable income deposited on the 5th — no chasing, no awkward calls.",
  },
  {
    label: "Maintenance & 24/7 Emergencies",
    why: "Trusted contractors, emergency line, flat 8% coordination fee with zero markup.",
    outcome: "You find out when it's handled. The 2am call goes to us.",
  },
  {
    label: "Tenants Screened & Managed",
    why: "Credit, criminal, income verification (2.5–3× rent), and a direct call to their last landlord.",
    outcome: "Fewer problems, less turnover. 25+ placements and still zero LTB filings.",
  },
  {
    label: "Inspections & Ontario Compliance",
    why: "102-point move-in inspection, Ontario-compliant lease, N4 process handled correctly.",
    outcome: "A paper trail that protects you if you ever need it.",
  },
  {
    label: "One Clear Report Every Month",
    why: "Line-by-line income and expense breakdown delivered on the 5th of every month.",
    outcome: "Total visibility. You always know exactly how your investment is performing.",
  },
  {
    label: "Vacancies Filled Fast",
    why: "Professional photos, cross-platform listing, serious tenant selection — 21-day average fill time.",
    outcome: "Less empty time. Income sooner.",
  },
];

const OBJECTIONS = [
  {
    q: "I only deal with my property a few times a year.",
    a: "The value is avoiding the expensive moments when they hit — a bad tenant, an untracked repair, an LTB mistake. Those aren't frequent. They're just costly when they happen.",
  },
  {
    q: "I can manage it myself.",
    a: "You probably can. The question is whether managing your own rental is the best use of your evenings.",
  },
  {
    q: "Property management costs money.",
    a: "So does a vacancy. So does an overpaid contractor. So does an LTB hearing you weren't ready for. The fee pays for itself in the things it prevents.",
  },
  {
    q: "Switching sounds like a hassle.",
    a: "That's exactly why we start free. Feel what hands-off ownership actually looks like before committing to anything.",
  },
];

export default function PropertyManagementLP() {
  return (
    <div style={{ backgroundColor: CREAM, fontFamily: FONT_SANS }} className="min-h-screen">

      {/* ── 1. Header ─────────────────────────────────────────────────────── */}
      <header style={{ backgroundColor: NAVY, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-light text-2xl" style={{ color: "#FAF8F5", fontFamily: FONT_SERIF }}>
            Prospera
          </span>
          <a
            href="tel:+15196971227"
            className="text-sm"
            style={{ color: "rgba(250,248,245,0.7)", fontFamily: FONT_SANS }}
          >
            (519) 697-1227
          </a>
        </div>
      </header>

      {/* ── 2. Hero ───────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: NAVY }} className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <span
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
            style={{
              backgroundColor: "rgba(250,248,245,0.10)",
              color: "#FAF8F5",
              border: "1px solid rgba(250,248,245,0.2)",
              fontFamily: FONT_SANS,
            }}
          >
            Now offering 60 days of free property management for new owners.
          </span>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-light leading-tight mb-6"
            style={{ color: "#FAF8F5", fontFamily: FONT_SERIF }}
          >
            Own the Rental.{" "}
            <em style={{ color: "rgba(250,248,245,0.55)" }}>We'll Handle Everything Else.</em>
          </h1>

          <p
            className="text-base leading-relaxed mb-4 max-w-2xl mx-auto"
            style={{ color: "rgba(250,248,245,0.65)", fontFamily: FONT_SANS }}
          >
            Hand off the tenants, the repairs, the rent, and the paperwork — and finally get the passive income you bought the property for. Serving London, St. Thomas, Strathroy &amp; Sarnia.
          </p>

          <p
            className="text-sm font-medium mb-10"
            style={{ color: "rgba(250,248,245,0.45)", fontFamily: FONT_SANS }}
          >
            Start with 60 days free. No long-term lock-in.
          </p>

          <CalendlyButton size="large" />

          {/* Trust strip */}
          <div className="mt-10 flex flex-wrap justify-center gap-6 md:gap-12">
            {[
              "25+ placements",
              "0 LTB filings",
              "21-day avg fill",
              "5★ Google",
            ].map((item) => (
              <p
                key={item}
                className="text-xs font-medium uppercase tracking-widest"
                style={{ color: "rgba(250,248,245,0.35)", fontFamily: FONT_SANS }}
              >
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. The Problem ────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: CREAM }} className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: CRIMSON, fontFamily: FONT_SANS }}>
            Does This Sound Familiar
          </p>
          <h2
            className="text-4xl font-light mb-10 leading-tight"
            style={{ color: NAVY, fontFamily: FONT_SERIF }}
          >
            The rental was supposed to free up your time.
            <br />
            <em style={{ color: "#666" }}>Somehow it took more of it.</em>
          </h2>
          <div className="space-y-4">
            {PAIN_LINES.map((line, i) => (
              <div key={i} className="flex items-start gap-4">
                <span
                  className="shrink-0 mt-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: "rgba(139,32,48,0.08)", color: CRIMSON }}
                >
                  ×
                </span>
                <p className="text-base leading-relaxed" style={{ color: "#444", fontFamily: FONT_SANS }}>
                  {line}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Cost of Doing It Alone ─────────────────────────────────────── */}
      <section style={{ backgroundColor: NAVY }} className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: CRIMSON, fontFamily: FONT_SANS }}>
            The Real Cost
          </p>
          <h2
            className="text-4xl font-light mb-6 leading-tight"
            style={{ color: "#FAF8F5", fontFamily: FONT_SERIF }}
          >
            Self-managing isn&apos;t free.
            <br />
            <em style={{ color: "rgba(250,248,245,0.5)" }}>It&apos;s billed in stress and lost returns.</em>
          </h2>
          <p
            className="text-base mb-10 leading-relaxed"
            style={{ color: "rgba(250,248,245,0.6)", fontFamily: FONT_SANS }}
          >
            A London 2-bedroom runs $1,800–$2,400/month. One month vacant costs you more than a full year of management fees. One LTB hearing — even one you win — can cost $3,000–$5,000 in lost rent and legal costs before it&apos;s over.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Vacancy", cost: "1 month = $1,800–$2,400 gone" },
              { label: "Overpaid repair", cost: "No vendor relationships = 2× market rate" },
              { label: "Bad tenant", cost: "Months of non-payment before LTB hearing" },
              { label: "LTB mistake", cost: "One wrong N4 = reset the clock 2–3 months" },
            ].map(({ label, cost }) => (
              <div
                key={label}
                className="p-5 rounded-xl border"
                style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.04)" }}
              >
                <p className="text-sm font-semibold mb-1" style={{ color: "rgba(250,248,245,0.55)", fontFamily: FONT_SANS, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {label}
                </p>
                <p className="text-base" style={{ color: "#FAF8F5", fontFamily: FONT_SANS }}>
                  {cost}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. The Outcome ────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: "#FFFFFF" }} className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: CRIMSON, fontFamily: FONT_SANS }}>
            What Hands-Off Feels Like
          </p>
          <h2
            className="text-4xl font-light mb-8 leading-tight"
            style={{ color: NAVY, fontFamily: FONT_SERIF }}
          >
            Rent lands in your account on time.
          </h2>
          <div className="space-y-5 text-base leading-relaxed" style={{ color: "#444", fontFamily: FONT_SANS }}>
            <p>
              A leak gets handled before it reaches you. Your tenants are managed by someone else. You open one report a month and see exactly how your investment is doing.
            </p>
            <p>
              You stop thinking about the rental. It stops thinking about you.
            </p>
            <p style={{ color: NAVY, fontWeight: 500 }}>
              That&apos;s what you bought this for. That&apos;s what we deliver.
            </p>
          </div>
        </div>
      </section>

      {/* ── 6. How Prospera Manages It All ───────────────────────────────── */}
      <section style={{ backgroundColor: CREAM, borderTop: "1px solid #E8E4DF" }} className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-4 text-center" style={{ color: CRIMSON, fontFamily: FONT_SANS }}>
            What We Handle
          </p>
          <h2
            className="text-4xl font-light mb-12 leading-tight text-center"
            style={{ color: NAVY, fontFamily: FONT_SERIF }}
          >
            Everything you&apos;re currently doing yourself.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PILLARS.map(({ label, why, outcome }) => (
              <div
                key={label}
                className="p-6 rounded-xl border"
                style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E4DF", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
              >
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: CRIMSON, fontFamily: FONT_SANS }}>
                  {label}
                </p>
                <p className="text-sm leading-relaxed mb-3" style={{ color: "#555", fontFamily: FONT_SANS }}>
                  {why}
                </p>
                <p className="text-sm font-medium" style={{ color: NAVY, fontFamily: FONT_SANS }}>
                  {outcome}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. The 60-Day Free Offer ──────────────────────────────────────── */}
      <section style={{ backgroundColor: "#FFFFFF", borderTop: "1px solid #E8E4DF" }} className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div
            className="rounded-2xl p-10 text-center"
            style={{
              border: "2px solid #C8A96E",
              backgroundColor: "#FDFAF5",
              boxShadow: "0 8px 40px rgba(200,169,110,0.12)",
            }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#C8A96E", fontFamily: FONT_SANS }}>
              Limited Offer — New Owners Only
            </p>
            <h2
              className="text-3xl sm:text-4xl font-light mb-6 leading-tight"
              style={{ color: NAVY, fontFamily: FONT_SERIF }}
            >
              Try full property management free for 60 days.
            </h2>
            <p
              className="text-base leading-relaxed mb-4"
              style={{ color: "#444", fontFamily: FONT_SANS }}
            >
              Feel what hands-off ownership is actually like. If we&apos;re not making your life easier, walk away.
            </p>
            <p
              className="text-sm mb-8 px-4 py-3 rounded-lg"
              style={{ color: "#666", fontFamily: FONT_SANS, backgroundColor: "rgba(200,169,110,0.08)", border: "1px solid rgba(200,169,110,0.2)" }}
            >
              {FREE_TRIAL_TERMS}
            </p>
            <CalendlyButton size="large" />
          </div>
        </div>
      </section>

      {/* ── 8. What You See Every Month ───────────────────────────────────── */}
      <section style={{ backgroundColor: CREAM, borderTop: "1px solid #E8E4DF" }} className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-4 text-center" style={{ color: CRIMSON, fontFamily: FONT_SANS }}>
            Your Monthly View
          </p>
          <h2
            className="text-4xl font-light mb-4 leading-tight text-center"
            style={{ color: NAVY, fontFamily: FONT_SERIF }}
          >
            You stay in control.
            <br />
            <em style={{ color: "#888" }}>We handle the rest.</em>
          </h2>
          <p
            className="text-sm text-center mb-12 max-w-xl mx-auto"
            style={{ color: "#666", fontFamily: FONT_SANS }}
          >
            Every month you get a clear picture of your property — without having to ask for it.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                title: "Owner Dashboard",
                desc: "Log in anytime. See your property&apos;s status, payments, and open maintenance requests.",
                // Replace with real screenshot before launch
                placeholder: "📊",
              },
              {
                title: "Monthly Statement",
                desc: "Clear income and expense breakdown every month — delivered to your inbox on the 5th.",
                placeholder: "📋",
              },
              {
                title: "Market Insights",
                desc: "Know what rents are doing in your market so you&apos;re never underpriced or overpriced.",
                placeholder: "📈",
              },
            ].map(({ title, desc, placeholder }) => (
              <div
                key={title}
                className="rounded-xl border overflow-hidden"
                style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E4DF" }}
              >
                {/* Screenshot placeholder — swap with <Image> before launch */}
                <div
                  className="w-full flex items-center justify-center"
                  style={{ height: 180, backgroundColor: "#F0EDE8", fontSize: 40 }}
                  aria-hidden
                >
                  {placeholder}
                </div>
                <div className="p-5">
                  <p className="text-sm font-semibold mb-2" style={{ color: NAVY, fontFamily: FONT_SANS }}>
                    {title}
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "#555", fontFamily: FONT_SANS }}
                    dangerouslySetInnerHTML={{ __html: desc }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. Social Proof ───────────────────────────────────────────────── */}
      <section style={{ backgroundColor: "#FFFFFF", borderTop: "1px solid #E8E4DF" }} className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-4 text-center" style={{ color: CRIMSON, fontFamily: FONT_SANS }}>
            What Owners &amp; Tenants Say
          </p>

          <GoogleReviews />

          {/* Stat row */}
          <div className="mt-14 flex flex-wrap justify-center gap-8 md:gap-16">
            {[
              { v: "25+", l: "Properties placed" },
              { v: "Zero", l: "LTB filings" },
              { v: "21 days", l: "Average days to fill" },
            ].map(({ v, l }) => (
              <div key={l} className="text-center">
                <p className="text-3xl font-light mb-1" style={{ color: NAVY, fontFamily: FONT_SERIF }}>
                  {v}
                </p>
                <p className="text-xs uppercase tracking-widest" style={{ color: "#999", fontFamily: FONT_SANS }}>
                  {l}
                </p>
              </div>
            ))}
          </div>

          <p
            className="text-sm text-center mt-8 max-w-md mx-auto"
            style={{ color: "#888", fontFamily: FONT_SANS, fontStyle: "italic" }}
          >
            We manage our own properties the same way we manage yours. It&apos;s not a pitch — it&apos;s how we know what works.
          </p>
        </div>
      </section>

      {/* ── 10. Objection Handler ─────────────────────────────────────────── */}
      <section style={{ backgroundColor: CREAM, borderTop: "1px solid #E8E4DF" }} className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: CRIMSON, fontFamily: FONT_SANS }}>
            Common Questions
          </p>
          <h2
            className="text-4xl font-light mb-10 leading-tight"
            style={{ color: NAVY, fontFamily: FONT_SERIF }}
          >
            Straight answers.
          </h2>
          <div className="space-y-6">
            {OBJECTIONS.map(({ q, a }) => (
              <div
                key={q}
                className="p-6 rounded-xl border"
                style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E4DF" }}
              >
                <p className="text-base font-semibold mb-2" style={{ color: NAVY, fontFamily: FONT_SANS }}>
                  &ldquo;{q}&rdquo;
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "#555", fontFamily: FONT_SANS }}>
                  {a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 11. Final CTA ─────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: NAVY }} className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2
            className="text-4xl sm:text-5xl font-light mb-5 leading-tight"
            style={{ color: "#FAF8F5", fontFamily: FONT_SERIF }}
          >
            You bought a rental for the income and the freedom.
            <br />
            <em style={{ color: "rgba(250,248,245,0.5)" }}>Let&apos;s get you back to the freedom part.</em>
          </h2>
          <p
            className="text-sm mb-10 max-w-md mx-auto"
            style={{ color: "rgba(250,248,245,0.5)", fontFamily: FONT_SANS }}
          >
            Free consultation. No pressure. Start free for 60 days and see what you&apos;ve been missing.
          </p>
          <CalendlyButton size="large" />
          <p
            className="mt-6 text-xs"
            style={{ color: "rgba(250,248,245,0.3)", fontFamily: FONT_SANS }}
          >
            (519) 697-1227 &nbsp;·&nbsp; prosperapropertiess@gmail.com
          </p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer style={{ backgroundColor: "#141F29", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-lg font-light mb-1" style={{ color: "#FAF8F5", fontFamily: FONT_SERIF }}>
                Prospera Properties
              </p>
              <p className="text-xs" style={{ color: "rgba(250,248,245,0.4)", fontFamily: FONT_SANS }}>
                London · Strathroy · St. Thomas · Sarnia, Ontario
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-1">
              <a
                href="tel:+15196971227"
                className="text-sm"
                style={{ color: "rgba(250,248,245,0.6)", fontFamily: FONT_SANS }}
              >
                (519) 697-1227
              </a>
              <a
                href="mailto:prosperapropertiess@gmail.com"
                className="text-sm"
                style={{ color: "rgba(250,248,245,0.6)", fontFamily: FONT_SANS }}
              >
                prosperapropertiess@gmail.com
              </a>
              <Link href="/privacy" className="text-xs" style={{ color: "rgba(250,248,245,0.3)", fontFamily: FONT_SANS }}>
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
