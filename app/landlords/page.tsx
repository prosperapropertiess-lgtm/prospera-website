import Link from "next/link";
import FadeIn from "@/components/animations/FadeIn";
import FAQAccordion from "@/components/ui/FAQAccordion";
import RentEstimator from "@/components/ui/RentEstimator";
import BlogNudge from "@/components/ui/BlogNudge";
import PricingCards from "@/components/ui/PricingCards";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Property Management for Landlords with 1–5 Doors",
  description:
    "Prospera Properties manages your London, St. Thomas, or Strathroy rental — tenant screening, rent collection, maintenance, zero markups. Built for small landlords.",
};

const painPoints = [
  {
    icon: "⌚",
    label: "Self-managing while working full time",
    desc: "The rental is supposed to be passive income. Instead it's your second job — evenings, weekends, and the occasional 11pm call.",
  },
  {
    icon: "⚠",
    label: "One bad tenant ruins the whole year",
    desc: "When you only have 1–3 units, a single bad placement doesn't just cost money. It costs sleep, time, and sometimes the mortgage.",
  },
  {
    icon: "?",
    label: "Is your rent even priced right?",
    desc: "Price too high, it sits vacant. Too low, you leave hundreds on the table every month. Getting it right takes market knowledge you don't have time to build.",
  },
  {
    icon: "⚖",
    label: "The LTB process feels like a trap",
    desc: "Ontario landlord-tenant law is complex. One missed step on an N4, and suddenly you're three months in with no rent and no recourse.",
  },
];

const steps = [
  {
    n: "01",
    title: "Property Walkthrough & Strategy",
    desc: "We inspect the unit, assess the market, and agree on a rent price and positioning strategy. No guesswork.",
  },
  {
    n: "02",
    title: "Photography + Listing Launch",
    desc: "Professional photos, a listing that actually sells the unit — live on all major platforms within days.",
  },
  {
    n: "03",
    title: "Thorough Tenant Screening",
    desc: "Credit check. Income verification (2.5–3× rent). Criminal background. Direct landlord reference calls. Every single application.",
  },
  {
    n: "04",
    title: "Lease Signed, Keys Handed",
    desc: "Ontario-compliant lease, move-in inspection report with photos, key handover — all handled.",
  },
  {
    n: "05",
    title: "Rent Collected Every Month",
    desc: "Online payments, immediate follow-up on any late payment, deposited to you with a clear statement.",
  },
  {
    n: "06",
    title: "Maintenance Start to Finish",
    desc: "Trusted contractors, 24/7 emergency line, zero markup. You hear about it when it's done.",
  },
];

const faqs = [
  {
    q: "What's actually included in the management fee?",
    a: "Everything — tenant communication, rent collection, maintenance coordination, monthly statements, lease renewals, and move-in/move-out inspections. No add-ons, no hidden fees.",
  },
  {
    q: "How do you screen tenants?",
    a: "Full credit check, criminal background check, income verification (we look for 2.5–3× rent), and direct calls to previous landlords. We've done 25+ placements. All paying rent. We don't skip steps.",
  },
  {
    q: "What if a tenant stops paying?",
    a: "We follow up on day 1. We handle the N4 process and guide you through every step if escalation is needed. In two years and 25+ placements, we haven't had to go there yet — but we know the process cold if we do.",
  },
  {
    q: "Can I still be involved in major decisions?",
    a: "Always. We handle the day-to-day so you don't have to think about it. But for larger maintenance, rent increases, or lease changes — you're always consulted.",
  },
  {
    q: "What areas do you cover?",
    a: "London, St. Thomas, and Strathroy, Ontario. Reach out if your property is nearby — we may be able to help.",
  },
  {
    q: "How long does it take to find a tenant?",
    a: "Typically 2–4 weeks for a well-priced property. We'll give you an honest timeline and a clear market analysis before we start.",
  },
];

export default function LandlordsPage() {
  return (
    <div style={{ backgroundColor: "#F7F5F2" }}>
      {/* Hero */}
      <section className="pt-36 pb-24 px-5 sm:px-8 text-center" style={{ backgroundColor: "#1F2F3A" }}>
        <FadeIn>
          <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "rgba(250,248,245,0.55)", fontFamily: "var(--font-dm-sans)" }}>
            For Landlords
          </p>
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-light leading-tight mb-6"
            style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
          >
            Property management built for
            <br />
            <em style={{ color: "rgba(250,248,245,0.6)" }}>landlords with 1 to 5 doors.</em>
          </h1>
          <p className="text-base max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: "rgba(250,248,245,0.65)", fontFamily: "var(--font-dm-sans)" }}>
            You don&apos;t need a corporate property management company built for
            500-unit portfolios. You need someone who actually picks up the phone,
            knows the tenant personally, and treats your one property like it
            matters — because it does.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#pricing"
              className="btn-primary px-8 py-4 text-xs font-semibold uppercase tracking-widest rounded"
              style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
            >
              See Pricing
            </a>
            <a
              href="#rent-estimator"
              className="btn-ghost px-8 py-4 text-xs font-semibold uppercase tracking-widest border rounded"
              style={{ borderColor: "rgba(250,248,245,0.25)", color: "rgba(250,248,245,0.85)", fontFamily: "var(--font-dm-sans)" }}
            >
              Get a Free Rent Estimate
            </a>
          </div>
        </FadeIn>
      </section>

      {/* Pain Points */}
      <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-widest text-center mb-4" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
              The Real Problems
            </p>
            <h2 className="text-4xl sm:text-5xl font-light text-center mb-14 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              Small landlords face problems
              <br />
              <em>big companies don&apos;t care about.</em>
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {painPoints.map((p, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="bg-[#F7F5F2] border p-7 rounded-xl" style={{ borderColor: "#D8D2C8", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <span className="block text-2xl mb-4" style={{ color: "#8B2030" }}>{p.icon}</span>
                  <h3 className="font-semibold text-base mb-2" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>{p.label}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>{p.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-widest text-center mb-4" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
              The Process
            </p>
            <h2 className="text-4xl sm:text-5xl font-light text-center mb-16 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              From first call to
              <br />
              <em>completely hands-off.</em>
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
            {steps.map((step, i) => (
              <FadeIn key={step.n} delay={i * 0.08}>
                <div className="flex gap-6">
                  <p className="text-5xl font-light leading-none flex-shrink-0" style={{ color: "#D8D2C8", fontFamily: "var(--font-cormorant)" }}>
                    {step.n}
                  </p>
                  <div>
                    <h3 className="text-xl font-medium mb-2" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Rent Estimator */}
      <section id="rent-estimator" className="py-0">
        <RentEstimator />
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-widest text-center mb-4 px-5 sm:px-8" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
              Transparent Pricing
            </p>
            <h2 className="text-4xl sm:text-5xl font-light text-center mb-4 leading-tight px-5 sm:px-8" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              Simple plans.
              <br />
              <em>No hidden fees. Ever.</em>
            </h2>
            <p className="text-sm text-center max-w-lg mx-auto mb-14 leading-relaxed px-5 sm:px-8" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
              Zero setup fee. Lease renewal always free. The only number you pay is the one listed below.
            </p>
          </FadeIn>

          <PricingCards />

          <FadeIn delay={0.2}>
            <div className="mx-5 sm:mx-8 mt-4 p-6 text-center border rounded-xl" style={{ borderColor: "#D8D2C8", backgroundColor: "#F7F5F2" }}>
              <p className="text-sm leading-relaxed" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                All plans include: <strong style={{ color: "#222222" }}>no maintenance markup</strong> · <strong style={{ color: "#222222" }}>no setup fee</strong> · <strong style={{ color: "#222222" }}>no vacancy fee</strong> · <strong style={{ color: "#222222" }}>free lease renewal</strong>
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-widest text-center mb-4" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
              Common Questions
            </p>
            <h2 className="text-4xl font-light text-center mb-14 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              Straight answers.
            </h2>
          </FadeIn>
          <FAQAccordion items={faqs} />
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-5 sm:px-8 text-center" style={{ backgroundColor: "#1F2F3A" }}>
        <FadeIn>
          <h2 className="text-4xl sm:text-5xl font-light mb-5 leading-tight" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Don&apos;t let one bad tenant
            <br />
            <em style={{ color: "rgba(250,248,245,0.6)" }}>cost you the whole year.</em>
          </h2>
          <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "rgba(250,248,245,0.6)", fontFamily: "var(--font-dm-sans)" }}>
            Free consultation. Honest assessment. No pressure.
          </p>
          <Link
            href="/contact"
            className="inline-block px-10 py-4 text-xs font-semibold uppercase tracking-widest btn-primary rounded"
            style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
          >
            Get a Free Quote
          </Link>
        </FadeIn>
      </section>

      {/* Blog nudges */}
      <section className="py-12 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-3xl mx-auto space-y-4">
          <BlogNudge
            hook="What happens if your tenant just stops paying rent?"
            title="How to Evict a Tenant in Ontario: The Full Process"
            excerpt="Ontario's eviction process is slow and procedurally strict. One wrong move can set you back months."
            slug="evicting-tenant-ontario"
          />
          <BlogNudge
            hook="Could you spot a bad tenant before they move in?"
            title="5 Red Flags When Screening Tenants"
            excerpt="Finding great tenants starts with knowing what to watch for. Here are five warning signs experienced landlords never ignore."
            slug="tenant-screening-red-flags"
          />
        </div>
      </section>
    </div>
  );
}
