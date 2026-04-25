import Link from "next/link";
import FadeIn from "@/components/animations/FadeIn";
import FAQAccordion from "@/components/ui/FAQAccordion";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Transparent property management pricing with no hidden fees. See how Prospera Properties compares to typical Ontario property managers.",
};

const plans = [
  {
    name: "Basic",
    price: "10%",
    period: "of monthly rent",
    placement: "+ 1 full month's rent (placement)",
    tagline: "Full management, straightforward pricing.",
    features: [
      "Tenant screening & placement",
      "Rent collection",
      "Maintenance coordination (0% markup)",
      "Monthly statements",
      "Lease management & renewals",
      "Move-in / move-out inspection",
    ],
    cta: "Get Started",
    highlight: false,
    badge: "",
  },
  {
    name: "Standard",
    price: "12%",
    period: "of monthly rent",
    placement: "+ 50% of one month's rent (placement)",
    tagline: "The most popular choice for active landlords.",
    features: [
      "Everything in Basic",
      "Priority response time",
      "Semi-annual property inspection",
      "Rent increase advisory",
      "Market rent review included",
    ],
    cta: "Get Started",
    highlight: true,
    badge: "Most Popular",
  },
  {
    name: "Gold",
    price: "15%",
    period: "of monthly rent",
    placement: "Tenant placement FREE (every time)",
    tagline: "Maximum coverage. Free placement every turn.",
    features: [
      "Everything in Standard",
      "Free tenant placement always",
      "Quarterly property inspection",
      "Annual investment review",
      "Direct line to Ebin",
    ],
    cta: "Get Started",
    highlight: false,
    badge: "Best Value",
  },
];

const included = [
  { item: "Lease renewal fee", us: "Free", them: "$150–$300" },
  { item: "Vacancy fee", us: "None", them: "50% of rent" },
  { item: "Maintenance markup", us: "0%", them: "10–20%" },
  { item: "Photography & listing", us: "Included", them: "$200–$500" },
  { item: "Setup fee", us: "None", them: "$200–$500" },
  { item: "Early termination fee", us: "None", them: "1–2 months" },
];

const faqs = [
  { q: "Is there a long-term contract?", a: "We ask for a 3-month initial agreement to get things set up properly. After that it's month-to-month. We earn your business by doing a great job, not by locking you in." },
  { q: "What does 10–15% actually come out to?", a: "On a $1,500/month rental, Basic (10%) is $150/month. Gold (15%) is $225/month — and includes free tenant placement every time, which alone is worth $1,500+. Most landlords on Gold recoup the difference in the first vacancy." },
  { q: "Are there any other fees I should know about?", a: "Occasionally repairs require us to coordinate with contractors — you pay the contractor directly at cost. We never mark up repairs. That's it." },
  { q: "What if I only need help finding a tenant?", a: "Reach out and we can talk about a standalone placement — it's not a formal plan but we're happy to discuss. Most landlords end up finding full management makes more sense once we walk through it." },
  { q: "Do you charge if the property is vacant?", a: "No. We don't get paid when your property isn't earning. That keeps us motivated to fill vacancies fast." },
];

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 px-6 bg-[#FAF8F5] text-center">
        <FadeIn>
          <p className="text-xs uppercase tracking-widest text-[#7B1C1C] mb-4">Simple Pricing</p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-5xl md:text-6xl font-light text-[#0A1628] mb-5">
            No Surprises. Ever.
          </h1>
          <p className="text-sm text-[#2D4A5E] max-w-md mx-auto leading-relaxed">
            Transparent pricing with no hidden fees, no markups, and no contracts that trap you. We earn your business by delivering results.
          </p>
        </FadeIn>
      </section>

      {/* Plans */}
      <section className="pb-24 px-6 bg-[#FAF8F5]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 0.1}>
              <div className={`relative p-8 h-full flex flex-col border ${plan.highlight ? "bg-[#0D1B2A] border-[#0D1B2A] text-white" : "bg-white border-[#E8E4DF] text-[#0D1B2A]"}`}>
                {plan.badge && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-semibold uppercase tracking-widest"
                    style={{
                      backgroundColor: plan.highlight ? "#7B1C1C" : "#C4B08A",
                      color: plan.highlight ? "#FAF8F5" : "#0D1B2A",
                      fontFamily: "var(--font-dm-sans)",
                    }}
                  >
                    {plan.badge}
                  </div>
                )}
                <div className="mb-6">
                  <p
                    className="text-xs uppercase tracking-widest mb-3"
                    style={{
                      color: plan.highlight ? "#7B1C1C" : "#7A7A7A",
                      fontFamily: "var(--font-dm-sans)",
                    }}
                  >
                    {plan.name}
                  </p>
                  <div className="flex items-end gap-2 mb-1">
                    <p
                      className="text-5xl font-light"
                      style={{ color: plan.highlight ? "#FAF8F5" : "#0D1B2A", fontFamily: "var(--font-cormorant)" }}
                    >
                      {plan.price}
                    </p>
                    <p
                      className="text-sm mb-1.5"
                      style={{ color: plan.highlight ? "rgba(250,248,245,0.5)" : "#7A7A7A", fontFamily: "var(--font-dm-sans)" }}
                    >
                      {plan.period}
                    </p>
                  </div>
                  <p
                    className="text-xs mb-4"
                    style={{
                      color: plan.name === "Gold"
                        ? "#2D6A4F"
                        : plan.highlight
                        ? "rgba(250,248,245,0.5)"
                        : "#7A7A7A",
                      fontFamily: "var(--font-dm-sans)",
                      fontWeight: plan.name === "Gold" ? 600 : 400,
                    }}
                  >
                    {plan.placement}
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: plan.highlight ? "rgba(250,248,245,0.6)" : "#7A7A7A", fontFamily: "var(--font-dm-sans)" }}
                  >
                    {plan.tagline}
                  </p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-3 text-sm"
                      style={{ color: plan.highlight ? "rgba(250,248,245,0.75)" : "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}
                    >
                      <span
                        className="mt-0.5 flex-shrink-0 text-xs"
                        style={{ color: plan.highlight ? "#7B1C1C" : plan.name === "Gold" ? "#C4B08A" : "#7B1C1C" }}
                      >
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/contact"
                  className="block text-center py-3.5 text-xs font-semibold uppercase tracking-widest transition-all hover:opacity-80"
                  style={{
                    backgroundColor: plan.highlight ? "#7B1C1C" : "transparent",
                    color: plan.highlight ? "#FAF8F5" : "#0D1B2A",
                    border: plan.highlight ? "none" : "1px solid #E8E4DF",
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  {plan.cta}
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Reassurance bar */}
        <FadeIn delay={0.3}>
          <div className="max-w-5xl mx-auto mt-6 p-5 text-center border border-[#E8E4DF] bg-white">
            <p className="text-xs text-[#7A7A7A]" style={{ fontFamily: "var(--font-dm-sans)" }}>
              All plans include:{" "}
              <strong className="text-[#0D1B2A]">zero maintenance markup</strong> ·{" "}
              <strong className="text-[#0D1B2A]">no setup fee</strong> ·{" "}
              <strong className="text-[#0D1B2A]">no vacancy fee</strong> ·{" "}
              <strong className="text-[#0D1B2A]">free lease renewal</strong>
            </p>
          </div>
        </FadeIn>
      </section>

      {/* What's Included / Comparison */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-[#7B1C1C] text-center mb-4">What Sets Us Apart</p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-4xl font-light text-[#0A1628] text-center mb-14">
              What&apos;s always included — at no extra charge.
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-gray-100">
                    <th className="text-left px-6 py-4 text-[#0A1628] font-medium">Fee</th>
                    <th className="text-center px-6 py-4 text-[#7B1C1C] font-medium">Prospera</th>
                    <th className="text-center px-6 py-4 text-gray-400 font-medium">Typical PM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {included.map((row, i) => (
                    <tr key={i} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="px-6 py-4 text-[#0A1628]">{row.item}</td>
                      <td className="px-6 py-4 text-center font-medium text-[#7B1C1C]">{row.us}</td>
                      <td className="px-6 py-4 text-center text-gray-400">{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-[#FAF8F5]">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-[#7B1C1C] text-center mb-4">Common Questions</p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-4xl font-light text-[#0A1628] text-center mb-14">Pricing FAQ</h2>
          </FadeIn>
          <FAQAccordion items={faqs} />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#7B1C1C] py-20 px-6 text-center text-white">
        <FadeIn>
          <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light mb-5">
            Ready to get started?
          </h2>
          <p className="text-white/80 text-sm mb-8 max-w-md mx-auto">
            Let&apos;s talk about your property and find the right plan for your situation.
          </p>
          <Link href="/contact" className="inline-block px-10 py-4 bg-white text-[#7B1C1C] font-medium rounded hover:bg-[#FAF8F5] transition-colors text-sm uppercase tracking-wide">
            Get a Free Quote
          </Link>
        </FadeIn>
      </section>
    </>
  );
}
