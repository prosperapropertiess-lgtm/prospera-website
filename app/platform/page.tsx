import type { Metadata } from "next";
import FadeIn from "@/components/animations/FadeIn";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import WaitlistForm from "@/components/ui/WaitlistForm";
import CounterAnimation from "@/components/animations/CounterAnimation";

export const metadata: Metadata = {
  title: "Prospera Platform — Landlording From Your Phone",
  description:
    "The property management app built for Ontario landlords. Rent collection, AI maintenance triage, legal forms, tenant portal — all in your pocket. Join the waitlist.",
};

const features = [
  {
    num: "01",
    title: "Rent Collected. Automatically.",
    body: "Tenants pay through the app. Auto-pay runs on schedule. Reminders go out 5 days early. Late fees apply themselves. You get a notification when money lands.",
    tag: "No more chasing",
  },
  {
    num: "02",
    title: "Maintenance Without the Phone Calls.",
    body: "Tenant submits a request with photos. AI triages it instantly — identifies the problem, estimates cost, suggests solutions. You assign a contractor with one tap. They get a prefilled message.",
    tag: "AI-powered",
  },
  {
    num: "03",
    title: "N4 in 2 Seconds.",
    body: "Rent 2 days late? The N4 generates itself. N1 rent increase notices. N2 vacancy notices. Every Ontario legal form auto-filled with your tenant's data — ready to serve.",
    tag: "Ontario-compliant",
  },
  {
    num: "04",
    title: "Your Tenants Have a Portal Too.",
    body: "They pay rent, message you, submit maintenance requests, and view their lease — all from their phone. You stop being their IT support. They stop texting you directly.",
    tag: "Tenant self-serve",
  },
  {
    num: "05",
    title: "Your Finances. In One Dashboard.",
    body: "Every dollar in and out — by property, by month. Income vs expenses. Export to CSV for tax time. No more spreadsheets. No more receipts in your Notes app.",
    tag: "Tax-ready",
  },
  {
    num: "06",
    title: "Lives on Your Phone. No App Store.",
    body: "Install it like an app — it works offline, sends push notifications, and opens instantly. Built as a PWA so there's nothing to download and nothing to update.",
    tag: "Works anywhere",
  },
];

const steps = [
  {
    num: "1",
    title: "Add your property. Invite your tenant.",
    body: "Set up your first property in under 2 minutes. Enter the unit, rent amount, due date. Send your tenant an invite link. They create their account. You're live.",
  },
  {
    num: "2",
    title: "Your tenant runs on autopilot.",
    body: "They pay rent through the app. They submit maintenance requests. They message you. Every action triggers the right notification, the right automation, the right record.",
  },
  {
    num: "3",
    title: "You check in. The app handles the rest.",
    body: "Open the dashboard once a week. See what's paid, what's pending, what needs your attention. The heavy lifting is already done.",
  },
];

const painPoints = [
  {
    before: "Texting tenants about rent",
    after: "Auto-pay + automated reminders",
  },
  {
    before: "2am maintenance calls",
    after: "Tenant submits. AI triages. You approve.",
  },
  {
    before: "Digging through emails for receipts",
    after: "Every transaction logged, filterable, exportable",
  },
  {
    before: "Writing N4 notices manually",
    after: "Auto-generated. Pre-filled. Ready to serve.",
  },
  {
    before: "Guessing your net income per property",
    after: "Real-time dashboard. Income vs. expenses.",
  },
];

export default function PlatformPage() {
  return (
    <div style={{ backgroundColor: "#F7F5F2" }}>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section
        className="pt-28 pb-24 px-5 sm:px-8"
        style={{ backgroundColor: "#1F2F3A" }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Eyebrow */}
          <FadeIn>
            <div className="flex items-center gap-3 mb-8">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: "#8B2030" }}
              />
              <p
                className="text-xs uppercase tracking-widest"
                style={{ color: "rgba(250,248,245,0.55)", fontFamily: "var(--font-dm-sans)" }}
              >
                By Prospera Properties · Early access
              </p>
            </div>
          </FadeIn>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-light leading-tight mb-6"
            style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
          >
            <VerticalCutReveal
              splitBy="words"
              staggerDuration={0.08}
              staggerFrom="first"
              reverse={true}
              containerClassName="flex-wrap"
              transition={{ type: "spring", stiffness: 200, damping: 36, delay: 0.1 }}
            >
              Your Properties.
            </VerticalCutReveal>
            <br />
            <VerticalCutReveal
              splitBy="words"
              staggerDuration={0.08}
              staggerFrom="first"
              reverse={true}
              containerClassName="flex-wrap"
              transition={{ type: "spring", stiffness: 200, damping: 36, delay: 0.35 }}
            >
              Your Phone.
            </VerticalCutReveal>
            <br />
            <span style={{ color: "#8B2030" }}>
              <VerticalCutReveal
                splitBy="words"
                staggerDuration={0.08}
                staggerFrom="first"
                reverse={true}
                containerClassName="flex-wrap"
                transition={{ type: "spring", stiffness: 200, damping: 36, delay: 0.6 }}
              >
                Zero Hassle.
              </VerticalCutReveal>
            </span>
          </h1>

          <FadeIn delay={0.7}>
            <p
              className="text-base sm:text-lg leading-relaxed mb-10 max-w-2xl"
              style={{ color: "rgba(250,248,245,0.65)", fontFamily: "var(--font-dm-sans)" }}
            >
              Everything a property management company does — rent collection, maintenance,
              legal forms, tenant communication, financials — automated and in your pocket.
              Built for Ontario landlords who want their time back.
            </p>

            <div className="max-w-xl">
              <WaitlistForm layout="stack" dark source="platform_hero" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────────── */}
      <section
        className="py-12 px-5 sm:px-8 border-b"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#D8D2C8" }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { value: 8, suffix: "+ hrs", label: "Saved per month, per property" },
            { value: 2,  suffix: " min", label: "To set up your first property" },
            { value: 0,  prefix: "$", label: "To get started — free early access" },
          ].map((stat, i) => (
            <div key={i}>
              <p
                className="text-4xl sm:text-5xl font-light mb-1"
                style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
              >
                <CounterAnimation
                  target={stat.value}
                  prefix={stat.prefix ?? ""}
                  suffix={stat.suffix}
                  duration={1.8}
                />
              </p>
              <p
                className="text-xs leading-snug"
                style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pain vs. Solution ────────────────────────────────────────────────── */}
      <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <p
              className="text-xs uppercase tracking-widest text-center mb-4"
              style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
            >
              The Problem
            </p>
            <h2
              className="text-4xl sm:text-5xl font-light text-center mb-3 leading-tight"
              style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
            >
              Self-managing a rental is a part-time job.
            </h2>
            <p
              className="text-base text-center mb-14 max-w-xl mx-auto leading-relaxed"
              style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}
            >
              Nobody signed up to be an on-call property manager. But without the right tools, that&apos;s exactly what happens.
            </p>
          </FadeIn>

          <div className="overflow-hidden rounded-2xl border" style={{ borderColor: "#D8D2C8", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            {/* Table header */}
            <div className="grid grid-cols-2">
              <div className="px-6 py-4 border-r" style={{ backgroundColor: "#F7F5F2", borderColor: "#D8D2C8" }}>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>Today</p>
              </div>
              <div className="px-6 py-4" style={{ backgroundColor: "#1F2F3A" }}>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>With Prospera</p>
              </div>
            </div>
            {painPoints.map((row, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <div className="grid grid-cols-2" style={{ borderTop: "1px solid #D8D2C8" }}>
                  <div
                    className="px-6 py-4 flex items-center gap-3 border-r"
                    style={{ backgroundColor: i % 2 === 0 ? "#FFFFFF" : "#F7F5F2", borderColor: "#D8D2C8" }}
                  >
                    <span style={{ color: "#D8D2C8", fontSize: "1rem" }}>✕</span>
                    <p className="text-sm" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>{row.before}</p>
                  </div>
                  <div
                    className="px-6 py-4 flex items-center gap-3"
                    style={{ backgroundColor: "#1F2F3A" }}
                  >
                    <span style={{ color: "#8B2030", fontSize: "1rem" }}>✓</span>
                    <p className="text-sm" style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>{row.after}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <p
              className="text-xs uppercase tracking-widest text-center mb-4"
              style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
            >
              What it does
            </p>
            <h2
              className="text-4xl sm:text-5xl font-light text-center mb-3 leading-tight"
              style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
            >
              One app. Every job a property<br className="hidden sm:block" /> manager does.
            </h2>
            <p
              className="text-base text-center mb-16 max-w-lg mx-auto leading-relaxed"
              style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}
            >
              Without the 10% fee. Without the phone tag. Without handing over control of your investment.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 gap-5">
            {features.map((f, i) => (
              <FadeIn key={i} delay={i * 0.07}>
                <div
                  className="rounded-2xl p-7 flex flex-col h-full"
                  style={{
                    backgroundColor: "#F7F5F2",
                    border: "1px solid #D8D2C8",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  <div className="flex items-start justify-between mb-5">
                    <span
                      className="text-5xl font-light leading-none"
                      style={{ color: "#D8D2C8", fontFamily: "var(--font-cormorant)" }}
                    >
                      {f.num}
                    </span>
                    <span
                      className="text-xs px-3 py-1 rounded-full border font-medium uppercase tracking-widest"
                      style={{
                        color: "#8B2030",
                        borderColor: "rgba(139,32,48,0.2)",
                        backgroundColor: "rgba(139,32,48,0.05)",
                        fontFamily: "var(--font-dm-sans)",
                      }}
                    >
                      {f.tag}
                    </span>
                  </div>
                  <h3
                    className="text-xl font-light mb-3 leading-snug"
                    style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
                  >
                    {f.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed flex-1"
                    style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}
                  >
                    {f.body}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <p
              className="text-xs uppercase tracking-widest text-center mb-4"
              style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
            >
              How it works
            </p>
            <h2
              className="text-4xl sm:text-5xl font-light text-center mb-16 leading-tight"
              style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
            >
              Set up once. Run forever.
            </h2>
          </FadeIn>

          <div className="relative">
            {/* Connecting line — desktop */}
            <div
              className="hidden sm:block absolute left-8 top-10 bottom-10 w-px"
              style={{ backgroundColor: "#D8D2C8" }}
            />

            <div className="flex flex-col gap-8">
              {steps.map((step, i) => (
                <FadeIn key={i} delay={i * 0.12}>
                  <div className="flex gap-6 sm:gap-8 items-start">
                    <div
                      className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center relative z-10"
                      style={{ backgroundColor: i === 1 ? "#1F2F3A" : "#FFFFFF", border: "1px solid #D8D2C8" }}
                    >
                      <span
                        className="text-2xl font-light"
                        style={{
                          color: i === 1 ? "#FAF8F5" : "#1F2F3A",
                          fontFamily: "var(--font-cormorant)",
                        }}
                      >
                        {step.num}
                      </span>
                    </div>
                    <div className="flex-1 pt-3">
                      <h3
                        className="text-xl font-light mb-2 leading-snug"
                        style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
                      >
                        {step.title}
                      </h3>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}
                      >
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

      {/* ── The Hybrid ───────────────────────────────────────────────────────── */}
      <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#1F2F3A" }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <p
              className="text-xs uppercase tracking-widest text-center mb-4"
              style={{ color: "rgba(250,248,245,0.4)", fontFamily: "var(--font-dm-sans)" }}
            >
              The Prospera Approach
            </p>
            <h2
              className="text-4xl sm:text-5xl font-light text-center mb-4 leading-tight"
              style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
            >
              Two ways to work with us.<br className="hidden sm:block" /> You pick how hands-on you want to be.
            </h2>
            <p
              className="text-base text-center mb-14 max-w-xl mx-auto leading-relaxed"
              style={{ color: "rgba(250,248,245,0.55)", fontFamily: "var(--font-dm-sans)" }}
            >
              We&apos;re the only property management company in Ontario that gives you a choice.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 gap-5">
            {/* DIY */}
            <FadeIn delay={0}>
              <div
                className="rounded-2xl p-8 h-full flex flex-col"
                style={{ backgroundColor: "rgba(250,248,245,0.05)", border: "1px solid rgba(250,248,245,0.1)" }}
              >
                <p
                  className="text-xs uppercase tracking-widest mb-4"
                  style={{ color: "rgba(250,248,245,0.4)", fontFamily: "var(--font-dm-sans)" }}
                >
                  Option 01
                </p>
                <h3
                  className="text-3xl font-light mb-3"
                  style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
                >
                  Self-Managed
                </h3>
                <p
                  className="text-sm leading-relaxed mb-6 flex-1"
                  style={{ color: "rgba(250,248,245,0.6)", fontFamily: "var(--font-dm-sans)" }}
                >
                  Use the Prospera app to manage your properties yourself. Keep the 10%. Stay in control. The app handles everything except physically showing up — and we can refer you someone for that too.
                </p>
                <ul className="space-y-2">
                  {["Full app access", "No management fee", "You make every decision", "Prospera support when you need it"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm" style={{ color: "rgba(250,248,245,0.7)", fontFamily: "var(--font-dm-sans)" }}>
                      <span style={{ color: "rgba(250,248,245,0.3)" }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>

            {/* Full service */}
            <FadeIn delay={0.1}>
              <div
                className="rounded-2xl p-8 h-full flex flex-col"
                style={{ backgroundColor: "#8B2030", border: "1px solid rgba(139,32,48,0.4)" }}
              >
                <p
                  className="text-xs uppercase tracking-widest mb-4"
                  style={{ color: "rgba(250,248,245,0.6)", fontFamily: "var(--font-dm-sans)" }}
                >
                  Option 02
                </p>
                <h3
                  className="text-3xl font-light mb-3"
                  style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
                >
                  Fully Managed
                </h3>
                <p
                  className="text-sm leading-relaxed mb-6 flex-1"
                  style={{ color: "rgba(250,248,245,0.8)", fontFamily: "var(--font-dm-sans)" }}
                >
                  Hand it all to Prospera. We manage the tenants, handle maintenance, collect rent, and report back to you monthly. You own the asset. We do the work. Starting at 8%.
                </p>
                <ul className="space-y-2">
                  {["Full-service management", "Starting at 8%", "90-Day Happiness Guarantee", "We handle everything"].map((item, i) => (
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

      {/* ── Final CTA ────────────────────────────────────────────────────────── */}
      <section className="py-28 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-xl mx-auto text-center">
          <FadeIn>
            <p
              className="text-xs uppercase tracking-widest mb-4"
              style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
            >
              Early access · Limited spots
            </p>
            <h2
              className="text-4xl sm:text-5xl font-light mb-4 leading-tight"
              style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
            >
              Stop managing.<br />Start owning.
            </h2>
            <p
              className="text-base leading-relaxed mb-10"
              style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}
            >
              We&apos;re opening the prototype to a small group of Ontario landlords first.
              Get in early, shape the product, and lock in free access before we launch publicly.
            </p>
            <WaitlistForm layout="stack" source="platform_footer" />
          </FadeIn>
        </div>
      </section>

    </div>
  );
}
