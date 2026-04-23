import Link from "next/link";
import FadeIn from "@/components/animations/FadeIn";
import FAQAccordion from "@/components/ui/FAQAccordion";

const plans = [
  {
    name: "Tenant Placement",
    price: "Half Month",
    period: "one-time",
    tagline: "We find and vet your tenant — you take it from there.",
    features: [
      "Professional listing & photography",
      "Marketing on all major platforms",
      "Tenant screening (credit, background, income)",
      "Reference checks",
      "Lease preparation",
      "Move-in coordination & inspection",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Full Management",
    price: "8–10%",
    period: "of monthly rent",
    tagline: "Everything handled. You collect the money, we do the work.",
    features: [
      "Everything in Tenant Placement",
      "Monthly rent collection",
      "24/7 maintenance coordination",
      "Regular property inspections",
      "Monthly owner statements",
      "Lease renewals (no extra fee)",
      "Online owner portal (Buildium)",
      "Tenant communication",
      "Move-out inspection & deposit",
    ],
    cta: "Get a Quote",
    highlight: true,
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
  { q: "What does 8–10% actually come out to?", a: "On a $2,000/month rental, that's $160–$200/month. Most landlords find that more than pays for itself once they factor in their saved time and fewer headaches." },
  { q: "Are there any other fees I should know about?", a: "Occasionally repairs require us to coordinate with contractors — you pay the contractor directly at cost. We never mark up repairs. That's it." },
  { q: "What if I only need help finding a tenant?", a: "That's exactly what the Tenant Placement plan is for. We charge half a month's rent, find you a vetted tenant, and you manage from there." },
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
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 0.1}>
              <div className={`rounded-2xl p-8 h-full flex flex-col border ${plan.highlight ? "bg-[#0A1628] border-[#0A1628] text-white" : "bg-white border-gray-100 shadow-sm text-[#0A1628]"}`}>
                <div className="mb-6">
                  <p className={`text-xs uppercase tracking-widest mb-2 ${plan.highlight ? "text-[#C5A55A]" : "text-[#7B1C1C]"}`}>{plan.name}</p>
                  <div className="flex items-end gap-2 mb-2">
                    <p className={`font-[family-name:var(--font-cormorant)] text-5xl font-light ${plan.highlight ? "text-white" : "text-[#0A1628]"}`}>{plan.price}</p>
                    <p className={`text-sm mb-1.5 ${plan.highlight ? "text-white/60" : "text-gray-400"}`}>{plan.period}</p>
                  </div>
                  <p className={`text-sm leading-relaxed ${plan.highlight ? "text-white/70" : "text-[#2D4A5E]"}`}>{plan.tagline}</p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className={`flex items-start gap-3 text-sm ${plan.highlight ? "text-white/80" : "text-[#2D4A5E]"}`}>
                      <span className={`mt-0.5 flex-shrink-0 ${plan.highlight ? "text-[#C5A55A]" : "text-[#7B1C1C]"}`}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/contact"
                  className={`block text-center py-3.5 rounded text-sm font-medium uppercase tracking-wide transition-colors ${plan.highlight ? "bg-[#7B1C1C] text-white hover:bg-[#9B2E2E]" : "bg-[#0A1628] text-white hover:bg-[#7B1C1C]"}`}
                >
                  {plan.cta}
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>
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
