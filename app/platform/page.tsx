import type { Metadata } from "next";
import FadeIn from "@/components/animations/FadeIn";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import WaitlistForm from "@/components/ui/WaitlistForm";
import CounterAnimation from "@/components/animations/CounterAnimation";
import { ShaderBackground } from "@/components/ui/animated-shader-hero";

export const metadata: Metadata = {
  title: "Prospera Platform — Landlording Made Easy",
  description:
    "The app Ontario landlords with 1–5 properties have been waiting for. Rent collection, AI maintenance, auto N4s, tenant portal. Built by a landlord who's been there. Join the waitlist.",
};

const painMoments = [
  "It's the 3rd. Rent was due on the 1st. You've already texted once.",
  "Your mortgage renewed. The payment jumped $800/month. You didn't sleep that night.",
  "A property manager quoted you 12%. On a $2,800 rental that's $336/month. You said no.",
  "You have 2 properties. Every tool you've tried was built for someone with 20.",
  "You spent 90 minutes filling out an N4 form online. You're still not sure it's right.",
  "Your tenant texted at 11:42pm. The hot water heater is making a sound.",
  "Tax time. Your records are split across Gmail, Notes, and a spreadsheet from 2022.",
  "You tried Buildium. $200/month, 40 features you'll never use, built for property managers with staff.",
];

const features = [
  {
    num: "01",
    title: "Rent Collected. Without the Texts.",
    body: "Auto-pay runs on schedule. Reminders go out 5 days before due. Late fees apply automatically on day 2. You get a push notification when money lands — and nothing when it doesn't need you.",
    tag: "No more chasing",
  },
  {
    num: "02",
    title: "Maintenance Without the 11pm Calls.",
    body: "Tenant submits a request with photos through their portal. AI triages it instantly — identifies the problem, estimates cost, categorizes urgency. You approve. Contractor gets a prefilled message. Done.",
    tag: "AI-powered",
  },
  {
    num: "03",
    title: "N4 Ready Before You Even Ask.",
    body: "Rent 2 days late? The N4 generates itself, pre-filled with your tenant's data, your unit details, the exact overdue amount. N1 rent increases. N2 notices. Every Ontario form — automated.",
    tag: "Ontario-compliant",
  },
  {
    num: "04",
    title: "Your Tenants Have Their Own Portal.",
    body: "They pay rent, submit maintenance, message you, and view their lease — all from their phone. You stop being the hotline. They stop texting your personal number at midnight.",
    tag: "Tenant self-serve",
  },
  {
    num: "05",
    title: "Finally Know If You're Actually Making Money.",
    body: "Every dollar in and out — by property, by month, by category. Income vs. expenses, real-time. Export to CSV for your accountant. Know exactly where you stand before tax season blindsides you.",
    tag: "Tax-ready",
  },
  {
    num: "06",
    title: "Lives on Your Phone. No App Store Needed.",
    body: "Install it once like an app. Works offline. Sends push notifications. Opens instantly. Built as a PWA — no updates to approve, no version to download, no monthly software subscription to justify.",
    tag: "Always on you",
  },
];

const steps = [
  {
    num: "1",
    title: "Add your property. Invite your tenant.",
    body: "2 minutes. Enter the address, units, rent amount, and due date. Send your tenant an invite link. They set up their account. You're both live.",
  },
  {
    num: "2",
    title: "Your tenant self-serves. The app automates the rest.",
    body: "They pay rent through the portal. They submit maintenance with photos. They message you. Every action triggers the right notification, the right record, the right automation.",
  },
  {
    num: "3",
    title: "You check in once a week. That's it.",
    body: "Open the dashboard. See what's paid, what's pending, what needs a decision. The app handles everything else. You get your evenings back.",
  },
];

export default function PlatformPage() {
  return (
    <div style={{ backgroundColor: "#F7F5F2" }}>

      {/* ── Hero — Shader Background ────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        {/* Animated WebGL background */}
        <ShaderBackground className="absolute inset-0 w-full h-full object-cover" />

        {/* Dark overlay so text is legible */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(31,47,58,0.82) 0%, rgba(31,47,58,0.65) 60%, rgba(31,47,58,0.92) 100%)" }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 pt-32 pb-24">
          {/* Eyebrow */}
          <FadeIn>
            <div className="flex items-center gap-3 mb-8">
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: "#8B2030" }} />
              <p className="text-xs uppercase tracking-widest" style={{ color: "rgba(250,248,245,0.6)", fontFamily: "var(--font-dm-sans)" }}>
                By Prospera Properties · Ontario · Early access
              </p>
            </div>
          </FadeIn>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-light leading-tight mb-8"
            style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
          >
            <VerticalCutReveal
              splitBy="words"
              staggerDuration={0.09}
              staggerFrom="first"
              reverse={true}
              containerClassName="flex-wrap"
              transition={{ type: "spring", stiffness: 210, damping: 36, delay: 0.1 }}
            >
              You Bought a Rental.
            </VerticalCutReveal>
            <br />
            <VerticalCutReveal
              splitBy="words"
              staggerDuration={0.09}
              staggerFrom="first"
              reverse={true}
              containerClassName="flex-wrap"
              transition={{ type: "spring", stiffness: 210, damping: 36, delay: 0.38 }}
            >
              Not a Second
            </VerticalCutReveal>
            {" "}
            <span style={{ color: "#8B2030" }}>
              <VerticalCutReveal
                splitBy="words"
                staggerDuration={0.09}
                staggerFrom="first"
                reverse={true}
                containerClassName="inline-flex"
                transition={{ type: "spring", stiffness: 210, damping: 36, delay: 0.62 }}
              >
                Job.
              </VerticalCutReveal>
            </span>
          </h1>

          <FadeIn delay={0.75}>
            <p
              className="text-base sm:text-lg leading-relaxed mb-10 max-w-2xl"
              style={{ color: "rgba(250,248,245,0.7)", fontFamily: "var(--font-dm-sans)" }}
            >
              Rent collection, maintenance, N4s, tenant communication, financials —
              all automated. All on your phone. Built by an Ontario landlord who spent
              3 years trying everything else and building this when nothing worked.
            </p>

            <div className="max-w-lg">
              <WaitlistForm layout="stack" dark source="platform_hero" />
            </div>
          </FadeIn>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
          <div className="w-px h-10" style={{ background: "linear-gradient(to bottom, rgba(250,248,245,0.4), transparent)" }} />
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────────── */}
      <section className="py-12 px-5 sm:px-8 border-b" style={{ backgroundColor: "#FFFFFF", borderColor: "#D8D2C8" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { value: 8, suffix: "+ hrs", label: "Saved per property, per month" },
            { value: 2, suffix: " min", label: "To set up your first property" },
            { value: 0, prefix: "$", label: "To get started — free early access" },
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-4xl sm:text-5xl font-light mb-1" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
                <CounterAnimation target={stat.value} prefix={stat.prefix ?? ""} suffix={stat.suffix} duration={1.8} />
              </p>
              <p className="text-xs leading-snug" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Sound Familiar? ───────────────────────────────────────────────────── */}
      <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-center mb-4" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
              Be honest
            </p>
            <h2 className="text-4xl sm:text-5xl font-light text-center mb-4 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              Sound familiar?
            </h2>
            <p className="text-base text-center mb-14 leading-relaxed" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
              If you&apos;re managing 1–5 properties in Ontario, at least 5 of these hit home.
            </p>
          </FadeIn>

          <div className="space-y-3">
            {painMoments.map((moment, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div
                  className="flex items-start gap-4 px-6 py-4 rounded-xl"
                  style={{
                    backgroundColor: "#F7F5F2",
                    border: "1px solid #D8D2C8",
                  }}
                >
                  <span
                    className="flex-shrink-0 text-sm font-semibold mt-0.5 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgba(139,32,48,0.08)", color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}
                  >
                    ✓
                  </span>
                  <p className="text-sm leading-relaxed" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                    {moment}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.5}>
            <p
              className="text-center mt-10 text-base font-light italic"
              style={{ color: "#8B2030", fontFamily: "var(--font-cormorant)" }}
            >
              That&apos;s why this exists.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── From Ebin — Personal Letter ──────────────────────────────────────── */}
      <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#1F2F3A" }}>
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest mb-10" style={{ color: "rgba(250,248,245,0.4)", fontFamily: "var(--font-dm-sans)" }}>
              From the founder
            </p>
          </FadeIn>

          <div className="space-y-7">
            {[
              {
                text: "Let me be straight with you.",
                large: true,
              },
              {
                text: "Your mortgage just renewed. What used to be $1,800/month is now $3,200. You're collecting $2,800 in rent. You told yourself you'd hire a property manager when the numbers made sense — but now they're quoting you 10–15% of rent, and that's another $280–$420 a month you simply don't have. So you're doing it yourself.",
              },
              {
                text: "You're texting your tenant on the 3rd when rent was due on the 1st. You're Googling \"how to fill out an N4 form\" at 11pm on a Thursday. You're getting called at 7am because the dryer is making a noise. You didn't sign up for this. You signed up to build wealth.",
              },
              {
                text: "I've been managing properties in London, Ontario for 3 years. I run Prospera Properties. I've personally tried every tool out there — Buildium, AppFolio, Rentec Direct, Propertyware. Every single one of them is built for operators running 50+ units with a full-time staff and a property manager who does this for a living. There is nothing — nothing — built for the person with 1, 2, maybe 3 rental units, trying to make the numbers work without it taking over their life.",
              },
              {
                text: "I know what it feels like to stare at a bank statement after a mortgage renewal and wonder if you made a mistake. I know what it feels like to text a tenant four times about rent and still not have it on the 8th. I know what it feels like to have no idea whether you actually made any money last year, because your records are a disaster.",
              },
              {
                text: "So I built the app I wish existed three years ago. Not for the big operators. For you.",
                emphasis: true,
              },
            ].map((block, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <p
                  className={block.large ? "text-2xl sm:text-3xl font-light leading-snug" : "text-sm sm:text-base leading-relaxed"}
                  style={{
                    color: block.emphasis
                      ? "#FAF8F5"
                      : block.large
                        ? "#FAF8F5"
                        : "rgba(250,248,245,0.7)",
                    fontFamily: block.large ? "var(--font-cormorant)" : "var(--font-dm-sans)",
                    fontStyle: block.large ? "italic" : "normal",
                  }}
                >
                  {block.text}
                </p>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.6}>
            <div className="mt-12 pt-8 border-t flex items-center gap-5" style={{ borderColor: "rgba(250,248,245,0.1)" }}>
              {/* Initials avatar */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#8B2030" }}
              >
                <span className="text-xl font-light" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>EJ</span>
              </div>
              <div>
                <p className="text-base font-light" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
                  Ebin Jaison
                </p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(250,248,245,0.45)", fontFamily: "var(--font-dm-sans)" }}>
                  Founder, Prospera Properties · London, Ontario · Managing properties since 2021
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Pain vs Solution ─────────────────────────────────────────────────── */}
      <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-center mb-4" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
              Before vs. After
            </p>
            <h2 className="text-4xl sm:text-5xl font-light text-center mb-14 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              This is what changes.
            </h2>
          </FadeIn>

          <div className="overflow-hidden rounded-2xl border" style={{ borderColor: "#D8D2C8", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div className="grid grid-cols-2">
              <div className="px-6 py-4 border-r" style={{ backgroundColor: "#F7F5F2", borderColor: "#D8D2C8" }}>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>Right now</p>
              </div>
              <div className="px-6 py-4" style={{ backgroundColor: "#1F2F3A" }}>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>With Prospera</p>
              </div>
            </div>
            {[
              { before: "Texting tenants when rent is late", after: "Automated reminders + auto late fees" },
              { before: "Calling contractors, waiting for callbacks", after: "One tap. AI-drafted message sent for you." },
              { before: "N4 forms you Google at midnight", after: "Auto-generated 2 days after rent is missed" },
              { before: "Receipts in three apps and a spreadsheet", after: "Every dollar logged, filtered, exportable" },
              { before: "No idea if your property makes money", after: "Real-time income vs. expense dashboard" },
              { before: "Tenants texting your personal number", after: "They use their portal. You get a notification." },
            ].map((row, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="grid grid-cols-2" style={{ borderTop: "1px solid #D8D2C8" }}>
                  <div
                    className="px-6 py-4 flex items-center gap-3 border-r"
                    style={{ backgroundColor: i % 2 === 0 ? "#FFFFFF" : "#F7F5F2", borderColor: "#D8D2C8" }}
                  >
                    <span className="flex-shrink-0 text-xs" style={{ color: "#D8D2C8" }}>✕</span>
                    <p className="text-sm" style={{ color: "#555555", fontFamily: "var(--font-dm-sans)" }}>{row.before}</p>
                  </div>
                  <div className="px-6 py-4 flex items-center gap-3" style={{ backgroundColor: "#1F2F3A" }}>
                    <span className="flex-shrink-0 text-xs" style={{ color: "#8B2030" }}>✓</span>
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
            <p className="text-xs uppercase tracking-widest text-center mb-4" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
              What it does
            </p>
            <h2 className="text-4xl sm:text-5xl font-light text-center mb-3 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              Everything a property manager does.
            </h2>
            <p className="text-base text-center mb-16 max-w-lg mx-auto leading-relaxed" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
              Without the 10–15% fee. Without handing over control. Without ever having to answer to someone else about your own investment.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 gap-5">
            {features.map((f, i) => (
              <FadeIn key={i} delay={i * 0.07}>
                <div
                  className="rounded-2xl p-7 flex flex-col h-full"
                  style={{ backgroundColor: "#F7F5F2", border: "1px solid #D8D2C8", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                >
                  <div className="flex items-start justify-between mb-5">
                    <span className="text-5xl font-light leading-none" style={{ color: "#D8D2C8", fontFamily: "var(--font-cormorant)" }}>
                      {f.num}
                    </span>
                    <span
                      className="text-xs px-3 py-1 rounded-full border font-medium uppercase tracking-widest"
                      style={{ color: "#8B2030", borderColor: "rgba(139,32,48,0.2)", backgroundColor: "rgba(139,32,48,0.05)", fontFamily: "var(--font-dm-sans)" }}
                    >
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-light mb-3 leading-snug" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed flex-1" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
                    {f.body}
                  </p>
                </div>
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
              How it works
            </p>
            <h2 className="text-4xl sm:text-5xl font-light text-center mb-16 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              Set up once. Run forever.
            </h2>
          </FadeIn>

          <div className="relative">
            <div className="hidden sm:block absolute left-8 top-10 bottom-10 w-px" style={{ backgroundColor: "#D8D2C8" }} />
            <div className="flex flex-col gap-8">
              {steps.map((step, i) => (
                <FadeIn key={i} delay={i * 0.12}>
                  <div className="flex gap-6 sm:gap-8 items-start">
                    <div
                      className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center relative z-10"
                      style={{ backgroundColor: i === 1 ? "#1F2F3A" : "#FFFFFF", border: "1px solid #D8D2C8" }}
                    >
                      <span className="text-2xl font-light" style={{ color: i === 1 ? "#FAF8F5" : "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
                        {step.num}
                      </span>
                    </div>
                    <div className="flex-1 pt-3">
                      <h3 className="text-xl font-light mb-2 leading-snug" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
                        {step.title}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
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
            <p className="text-xs uppercase tracking-widest text-center mb-4" style={{ color: "rgba(250,248,245,0.4)", fontFamily: "var(--font-dm-sans)" }}>
              The Prospera Difference
            </p>
            <h2 className="text-4xl sm:text-5xl font-light text-center mb-4 leading-tight" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
              Use the app. Or hand it all to us.<br className="hidden sm:block" /> You decide.
            </h2>
            <p className="text-base text-center mb-14 max-w-xl mx-auto leading-relaxed" style={{ color: "rgba(250,248,245,0.55)", fontFamily: "var(--font-dm-sans)" }}>
              Most landlords either pay a property manager 10–15% or do it all themselves with no support.
              We&apos;re the only option in Ontario that gives you both — and lets you switch between them.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 gap-5">
            <FadeIn>
              <div className="rounded-2xl p-8 h-full flex flex-col" style={{ backgroundColor: "rgba(250,248,245,0.05)", border: "1px solid rgba(250,248,245,0.1)" }}>
                <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "rgba(250,248,245,0.35)", fontFamily: "var(--font-dm-sans)" }}>Option 01</p>
                <h3 className="text-3xl font-light mb-3" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>Self-Managed</h3>
                <p className="text-sm leading-relaxed mb-6 flex-1" style={{ color: "rgba(250,248,245,0.6)", fontFamily: "var(--font-dm-sans)" }}>
                  Run your properties through the Prospera app. Keep 100% of your rent. The app does everything short of physically showing up — and if you ever need someone to show up, we&apos;ll refer you someone we trust.
                </p>
                <ul className="space-y-2">
                  {["Full app access", "No management fee", "You stay in control", "Prospera support available when you need it"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm" style={{ color: "rgba(250,248,245,0.65)", fontFamily: "var(--font-dm-sans)" }}>
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
                <h3 className="text-3xl font-light mb-3" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>Fully Managed</h3>
                <p className="text-sm leading-relaxed mb-6 flex-1" style={{ color: "rgba(250,248,245,0.85)", fontFamily: "var(--font-dm-sans)" }}>
                  Hand it all to Prospera. We manage everything — tenant relations, maintenance, rent collection, legal notices, monthly reporting. You own the asset. We run it. Starting at 8%.
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

      {/* ── Final CTA ────────────────────────────────────────────────────────── */}
      <section className="py-28 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-xl mx-auto text-center">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
              Early access · Free for founding members
            </p>
            <h2 className="text-4xl sm:text-5xl font-light mb-5 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              The landlords who join now<br />will pay nothing.
            </h2>
            <p className="text-base leading-relaxed mb-4" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
              We&apos;re opening the prototype to a small group of Ontario landlords first.
              You get early access, you help shape what gets built next, and you lock in
              free access before we charge for it publicly.
            </p>
            <p className="text-sm leading-relaxed mb-10 italic" style={{ color: "#999999", fontFamily: "var(--font-cormorant)" }}>
              If you&apos;ve read this far and you&apos;re still not on the list — what are you waiting for?
            </p>
            <WaitlistForm layout="stack" source="platform_footer" />
          </FadeIn>
        </div>
      </section>

    </div>
  );
}
