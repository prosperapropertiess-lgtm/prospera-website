import Image from "next/image";
import Link from "next/link";
import FadeIn from "@/components/animations/FadeIn";
import FAQAccordion from "@/components/ui/FAQAccordion";
import RentEstimator from "@/components/ui/RentEstimator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Property Management for Landlords",
  description: "Prospera Properties manages your London, St. Thomas, or Sarnia rental — tenant screening, rent collection, maintenance, and more. Transparent fees, no markups.",
};

const painPoints = [
  { problem: "Tired of chasing rent?", solution: "Guaranteed on-time collection", icon: "💰" },
  { problem: "Maintenance calls at 2 AM?", solution: "24/7 emergency coordination", icon: "🔧" },
  { problem: "Can't find good tenants?", solution: "Thorough screening & vetting", icon: "✅" },
];

const steps = [
  { n: "01", title: "Introduce Your Property", desc: "We inspect, assess the market, and set a strategy to maximize your rental income from day one." },
  { n: "02", title: "We Prepare Everything", desc: "Professional photos, minor touch-ups, and marketing copy that actually attracts quality tenants." },
  { n: "03", title: "Strategic Marketing", desc: "Your listing goes live on all major platforms — MLS, Kijiji, Facebook Marketplace, and more." },
  { n: "04", title: "Thorough Tenant Screening", desc: "Background checks, credit reports, income verification, and reference calls — we don't skip steps." },
  { n: "05", title: "Move-In Coordination", desc: "Lease signing, key handover, move-in inspection — all handled with zero stress on your end." },
  { n: "06", title: "Ongoing Management", desc: "Monthly rent collection, maintenance tracking, regular inspections, and transparent monthly statements." },
];

const pricing = [
  { feature: "Monthly Management Fee", prospera: "8–10%", typical: "10–15%" },
  { feature: "Tenant Placement Fee", prospera: "Half month's rent", typical: "Full month's rent" },
  { feature: "Lease Renewal Fee", prospera: "Free", typical: "$150–$300" },
  { feature: "Vacancy Fee", prospera: "None", typical: "50% of month" },
  { feature: "Maintenance Markup", prospera: "0%", typical: "10–20%" },
  { feature: "Photo & Listing", prospera: "Included", typical: "$200–$500" },
  { feature: "Setup Fee", prospera: "None", typical: "$200–$500" },
  { feature: "24/7 Emergency Support", prospera: "✓", typical: "Sometimes" },
  { feature: "Monthly Statements", prospera: "✓", typical: "✓" },
  { feature: "Online Owner Portal", prospera: "✓", typical: "Varies" },
];

const faqs = [
  { q: "What's included in your management fee?", a: "Everything — tenant communication, rent collection, maintenance coordination, monthly statements, lease renewals, and annual inspections. No hidden fees." },
  { q: "How do you screen tenants?", a: "We run full credit checks, criminal background checks, income verification (looking for 2.5–3x rent), and contact previous landlords directly. We take this seriously." },
  { q: "What happens if a tenant doesn't pay?", a: "We follow up immediately — day 1 of late payment. We handle the full N4 notice process and guide you through next steps if needed. We're in your corner." },
  { q: "Can I still be involved in major decisions?", a: "Absolutely. We handle the day-to-day so you don't have to, but you're always consulted on larger maintenance items, rent increases, and lease changes." },
  { q: "What areas do you cover?", a: "We currently manage properties in London, St. Thomas, and Sarnia, Ontario. Reach out if your property is nearby — we may be able to help." },
  { q: "How quickly can you find a tenant?", a: "Typically 2–4 weeks for a well-priced property. We'll give you an honest timeline and a clear market analysis before we start." },
];

export default function LandlordsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <Image src="https://picsum.photos/seed/landlord-hero/1600/900" alt="Property management" fill className="object-cover" priority unoptimized />
        <div className="absolute inset-0 bg-[#0A1628]/60" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-white">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.3em] text-[#C5A55A] mb-5">For Landlords</p>
            <h1 className="font-[family-name:var(--font-cormorant)] text-5xl md:text-6xl font-light leading-tight mb-6">
              Property Management With<br />Guaranteed Peace of Mind.
            </h1>
            <p className="text-lg text-white/80 mb-10 max-w-2xl leading-relaxed">
              We handle your tenants, maintenance, and rent collection — so you can enjoy the income without the headaches.
            </p>
            <a href="#rent-estimator" className="inline-block px-8 py-4 bg-[#7B1C1C] text-white font-medium rounded hover:bg-[#9B2E2E] transition-colors text-sm uppercase tracking-wide">
              Get a Free Rental Estimate
            </a>
          </FadeIn>
        </div>
      </section>

      {/* Pain Points */}
      <section className="py-20 px-6 bg-[#FAF8F5]">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <h2 className="font-[family-name:var(--font-cormorant)] text-4xl font-light text-[#0A1628] text-center mb-14">
              We solve the problems landlords hate most.
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {painPoints.map((p, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                  <div className="text-4xl mb-4">{p.icon}</div>
                  <p className="text-sm text-[#7B1C1C] font-medium mb-2">{p.problem}</p>
                  <div className="w-8 h-px bg-[#C5A55A] mx-auto my-3" />
                  <p className="font-[family-name:var(--font-cormorant)] text-xl text-[#0A1628]">{p.solution}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-[#7B1C1C] text-center mb-4">The Process</p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light text-[#0A1628] text-center mb-16">How It Works</h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
            {steps.map((step, i) => (
              <FadeIn key={step.n} delay={i * 0.08}>
                <div className="flex gap-6">
                  <p className="font-[family-name:var(--font-cormorant)] text-5xl font-light text-[#7B1C1C]/20 leading-none flex-shrink-0">{step.n}</p>
                  <div>
                    <h3 className="font-[family-name:var(--font-cormorant)] text-xl font-medium text-[#0A1628] mb-2">{step.title}</h3>
                    <p className="text-sm text-[#2D4A5E] leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Rent Estimator */}
      <section className="py-0">
        <RentEstimator />
      </section>

      {/* Pricing Comparison */}
      <section className="py-24 px-6 bg-[#FAF8F5]">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-[#7B1C1C] text-center mb-4">Transparent Pricing</p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-4xl font-light text-[#0A1628] text-center mb-14">
              Us vs. the Competition
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0A1628] text-white">
                    <th className="text-left px-6 py-4 font-medium">Feature</th>
                    <th className="text-center px-6 py-4 font-medium text-[#C5A55A]">Prospera Properties</th>
                    <th className="text-center px-6 py-4 font-medium text-gray-400">Typical PM</th>
                  </tr>
                </thead>
                <tbody>
                  {pricing.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-6 py-4 text-[#0A1628]">{row.feature}</td>
                      <td className="px-6 py-4 text-center font-medium text-[#7B1C1C]">{row.prospera}</td>
                      <td className="px-6 py-4 text-center text-gray-500">{row.typical}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-[#7B1C1C] text-center mb-4">Common Questions</p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-4xl font-light text-[#0A1628] text-center mb-14">FAQ</h2>
          </FadeIn>
          <FAQAccordion items={faqs} />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0A1628] py-20 px-6 text-center text-white">
        <FadeIn>
          <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light mb-5">
            Let&apos;s talk about your property.
          </h2>
          <p className="text-white/70 text-sm mb-8 max-w-md mx-auto">
            No pressure. Just an honest conversation about what your property could earn and what we can do for you.
          </p>
          <Link href="/contact" className="inline-block px-10 py-4 bg-[#7B1C1C] text-white font-medium rounded hover:bg-[#9B2E2E] transition-colors text-sm uppercase tracking-wide">
            Get a Free Quote
          </Link>
        </FadeIn>
      </section>
    </>
  );
}
