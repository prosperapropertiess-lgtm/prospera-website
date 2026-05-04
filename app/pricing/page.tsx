import Link from "next/link";
import FadeIn from "@/components/animations/FadeIn";
import FAQAccordion from "@/components/ui/FAQAccordion";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Transparent property management pricing with no hidden fees. See how Prospera Properties compares to typical Ontario property managers.",
};

const faqs = [
  {
    q: "Is there a long-term contract?",
    a: "We ask for a 3-month initial agreement to get everything set up properly. After that it's month-to-month. We earn your business by doing a great job — not by locking you in.",
  },
  {
    q: "What does 8–15% actually cost per month?",
    a: "On a $2,000/month rental: Managed (8%) is $160/month. Passive (15%) is $300/month. The difference is $140/month — but free placement alone saves you $2,000+ every vacancy. One tenant turnover and Passive pays for itself for over a year.",
  },
  {
    q: "What's the 21-Day Guarantee?",
    a: "On our Passive plan, if we don't place a qualified, screened tenant within 21 days of your unit being available — we manage your property free until we do. No asterisks, no excuses.",
  },
  {
    q: "What does 'zero maintenance markup' mean?",
    a: "When repairs are needed, you pay the contractor directly at their actual rate. We never add a percentage on top. Most property managers charge 10–20% on every repair. We charge zero.",
  },
  {
    q: "Do you charge while the property is vacant?",
    a: "No. We don't get paid when your property isn't earning. That keeps us motivated to fill vacancies fast.",
  },
  {
    q: "What's included in tenant placement?",
    a: "Professional photos, listing on all major platforms, tenant screening (credit check, income verification, reference calls), lease preparation, and move-in coordination. Everything.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes. You can upgrade or downgrade at your next renewal period. Most landlords start on Managed and move to Passive after their first vacancy — once they see the math.",
  },
];

const comparison = [
  { item: "Maintenance markup", us: "0% — always", them: "10–20%" },
  { item: "Setup fee", us: "None", them: "$200–$500" },
  { item: "Vacancy fee", us: "None", them: "50% of rent" },
  { item: "Lease renewal fee", us: "Free", them: "$150–$300" },
  { item: "Photography & listing", us: "Included", them: "$200–$500" },
  { item: "Early termination fee", us: "None", them: "1–2 months rent" },
  { item: "Inspection reports", us: "Included", them: "$100–$200 each" },
];

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 bg-[#FAF8F5] text-center">
        <FadeIn>
          <p className="text-xs uppercase tracking-widest text-[#C5A55A] mb-4" style={{ fontFamily: "var(--font-jakarta)" }}>
            Simple, Transparent Pricing
          </p>
          <h1
            className="text-5xl md:text-6xl font-light text-[#0A1628] mb-5 leading-tight"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Your Property. Fully Managed.
            <br />No Surprises. Ever.
          </h1>
          <p className="text-base text-[#5A5A5A] max-w-xl mx-auto leading-relaxed" style={{ fontFamily: "var(--font-jakarta)" }}>
            No hidden fees. No maintenance markups. No contracts that trap you.
            Just results — or we work for free until we deliver them.
          </p>
        </FadeIn>
      </section>

      {/* Plans */}
      <section className="pb-24 px-6 bg-[#FAF8F5]">
        <div className="max-w-5xl mx-auto">

          {/* Tier grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

            {/* MANAGED */}
            <FadeIn delay={0}>
              <div className="relative bg-white border border-[#E8E4DF] rounded-2xl p-8 flex flex-col h-full">
                <div className="mb-8">
                  <p className="text-xs uppercase tracking-widest text-[#9B9B9B] mb-3" style={{ fontFamily: "var(--font-jakarta)" }}>Managed</p>
                  <div className="flex items-end gap-2 mb-1">
                    <p className="text-6xl font-light text-[#0A1628]" style={{ fontFamily: "var(--font-cormorant)" }}>8%</p>
                    <p className="text-sm text-[#9B9B9B] mb-2" style={{ fontFamily: "var(--font-jakarta)" }}>/ month</p>
                  </div>
                  <p className="text-sm text-[#9B9B9B] mb-1" style={{ fontFamily: "var(--font-jakarta)" }}>
                    Placement fee: 1 month&apos;s rent
                  </p>
                  <p className="text-sm text-[#5A5A5A] mt-4 leading-relaxed" style={{ fontFamily: "var(--font-jakarta)" }}>
                    Your property is handled. Every call, every repair, every tenant interaction — taken care of.
                  </p>
                </div>

                <ul className="space-y-3 mb-8 flex-1" style={{ fontFamily: "var(--font-jakarta)" }}>
                  {[
                    "Full tenant screening & placement",
                    "Rent collection & disbursement",
                    "Maintenance coordination",
                    "0% markup on all repairs",
                    "Lease management & renewals",
                    "Move-in / move-out inspection",
                    "Monthly financial statements",
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#5A5A5A]">
                      <span className="text-[#C5A55A] mt-0.5 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/contact"
                  className="block text-center py-4 text-xs font-semibold uppercase tracking-widest border border-[#E8E4DF] text-[#0A1628] rounded-xl hover:border-[#0A1628] transition-colors"
                  style={{ fontFamily: "var(--font-jakarta)" }}
                >
                  Get Started
                </Link>
              </div>
            </FadeIn>

            {/* OPTIMIZED */}
            <FadeIn delay={0.1}>
              <div className="relative bg-[#0A1628] rounded-2xl p-8 flex flex-col h-full">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-[#C5A55A] rounded-full">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#0A1628]" style={{ fontFamily: "var(--font-jakarta)" }}>Most Popular</p>
                </div>

                <div className="mb-8">
                  <p className="text-xs uppercase tracking-widest text-[#C5A55A] mb-3" style={{ fontFamily: "var(--font-jakarta)" }}>Optimized</p>
                  <div className="flex items-end gap-2 mb-1">
                    <p className="text-6xl font-light text-[#FAF8F5]" style={{ fontFamily: "var(--font-cormorant)" }}>12%</p>
                    <p className="text-sm text-white/40 mb-2" style={{ fontFamily: "var(--font-jakarta)" }}>/ month</p>
                  </div>
                  <p className="text-sm text-white/40 mb-1" style={{ fontFamily: "var(--font-jakarta)" }}>
                    Placement fee: 75% of one month&apos;s rent
                  </p>
                  <p className="text-sm text-white/60 mt-4 leading-relaxed" style={{ fontFamily: "var(--font-jakarta)" }}>
                    Your property is working for you. Proactive management that keeps your investment performing.
                  </p>
                </div>

                <ul className="space-y-3 mb-8 flex-1" style={{ fontFamily: "var(--font-jakarta)" }}>
                  {[
                    "Everything in Managed",
                    "Reduced placement fee (save 25%)",
                    "Semi-annual property inspections",
                    "Proactive rent increase advisory",
                    "Market rent review every 6 months",
                    "Priority 24-hour response",
                    "Tenant renewal negotiation",
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                      <span className="text-[#C5A55A] mt-0.5 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/contact"
                  className="block text-center py-4 text-xs font-semibold uppercase tracking-widest bg-[#C5A55A] text-[#0A1628] rounded-xl hover:opacity-90 transition-opacity"
                  style={{ fontFamily: "var(--font-jakarta)" }}
                >
                  Get Started
                </Link>
              </div>
            </FadeIn>

            {/* PASSIVE */}
            <FadeIn delay={0.2}>
              <div className="relative bg-white border-2 border-[#0A1628] rounded-2xl p-8 flex flex-col h-full">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-[#0A1628] rounded-full">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#C5A55A]" style={{ fontFamily: "var(--font-jakarta)" }}>Best Value</p>
                </div>

                <div className="mb-8">
                  <p className="text-xs uppercase tracking-widest text-[#9B9B9B] mb-3" style={{ fontFamily: "var(--font-jakarta)" }}>Passive</p>
                  <div className="flex items-end gap-2 mb-1">
                    <p className="text-6xl font-light text-[#0A1628]" style={{ fontFamily: "var(--font-cormorant)" }}>15%</p>
                    <p className="text-sm text-[#9B9B9B] mb-2" style={{ fontFamily: "var(--font-jakarta)" }}>/ month</p>
                  </div>
                  <p className="text-sm font-semibold text-green-700 mb-1" style={{ fontFamily: "var(--font-jakarta)" }}>
                    Placement fee: FREE — every single time
                  </p>
                  <p className="text-sm text-[#5A5A5A] mt-4 leading-relaxed" style={{ fontFamily: "var(--font-jakarta)" }}>
                    Your property runs itself. True passive income — backed by our 21-Day Guarantee.
                  </p>
                </div>

                <ul className="space-y-3 mb-8 flex-1" style={{ fontFamily: "var(--font-jakarta)" }}>
                  {[
                    "Everything in Optimized",
                    "FREE tenant placement — always",
                    "21-Day Guarantee (or we manage free)",
                    "Pre-vacancy marketing — we start before tenant leaves",
                    "Quarterly property inspections",
                    "Direct line to Ebin",
                    "Annual landlord strategy call",
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#5A5A5A]">
                      <span className="text-[#C5A55A] mt-0.5 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/contact"
                  className="block text-center py-4 text-xs font-semibold uppercase tracking-widest bg-[#0A1628] text-[#FAF8F5] rounded-xl hover:opacity-90 transition-opacity"
                  style={{ fontFamily: "var(--font-jakarta)" }}
                >
                  Get Started
                </Link>
              </div>
            </FadeIn>
          </div>

          {/* Reassurance bar */}
          <FadeIn delay={0.3}>
            <div className="p-5 text-center border border-[#E8E4DF] bg-white rounded-2xl">
              <p className="text-sm text-[#7A7A7A]" style={{ fontFamily: "var(--font-jakarta)" }}>
                All plans include:{" "}
                <strong className="text-[#0A1628]">zero maintenance markup</strong> ·{" "}
                <strong className="text-[#0A1628]">no setup fee</strong> ·{" "}
                <strong className="text-[#0A1628]">no vacancy fee</strong> ·{" "}
                <strong className="text-[#0A1628]">free lease renewal</strong>
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 21-Day Guarantee */}
      <section className="py-24 px-6 bg-[#0A1628] text-center">
        <FadeIn>
          <p className="text-xs uppercase tracking-widest text-[#C5A55A] mb-4" style={{ fontFamily: "var(--font-jakarta)" }}>The Passive Guarantee</p>
          <h2 className="text-4xl md:text-5xl font-light text-[#FAF8F5] mb-6 leading-tight" style={{ fontFamily: "var(--font-cormorant)" }}>
            Qualified tenant in 21 days.
            <br />Or we manage free until we deliver.
          </h2>
          <p className="text-white/60 text-base max-w-lg mx-auto leading-relaxed mb-10" style={{ fontFamily: "var(--font-jakarta)" }}>
            On our Passive plan, if we don&apos;t place a fully screened, qualified tenant within 21 days of your unit being available — we manage your property at no charge until we do. No asterisks. No excuses.
          </p>
          <Link
            href="/contact"
            className="inline-block px-10 py-4 bg-[#C5A55A] text-[#0A1628] font-semibold rounded-xl hover:opacity-90 transition-opacity text-sm uppercase tracking-widest"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            Claim the Guarantee
          </Link>
        </FadeIn>
      </section>

      {/* The Math */}
      <section className="py-24 px-6 bg-[#FAF8F5]">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-[#C5A55A] mb-4" style={{ fontFamily: "var(--font-jakarta)" }}>Run the Numbers</p>
            <h2 className="text-4xl font-light text-[#0A1628] mb-6" style={{ fontFamily: "var(--font-cormorant)" }}>
              Why Passive pays for itself.
            </h2>
            <p className="text-[#5A5A5A] text-base mb-16 leading-relaxed" style={{ fontFamily: "var(--font-jakarta)" }}>
              On a $2,000/month rental, the difference between Managed and Passive is $140/month. Free placement alone saves you $2,000+ every vacancy. One tenant turnover and the upgrade has already paid for itself — for over a year.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="grid grid-cols-3 gap-px bg-[#E8E4DF] rounded-2xl overflow-hidden border border-[#E8E4DF]">
              {/* Header */}
              <div className="bg-[#FAF8F5] px-6 py-4 text-left">
                <p className="text-xs uppercase tracking-widest text-[#9B9B9B]" style={{ fontFamily: "var(--font-jakarta)" }}>On $2,000/mo rent</p>
              </div>
              <div className="bg-[#FAF8F5] px-6 py-4 text-center">
                <p className="text-xs uppercase tracking-widest text-[#9B9B9B]" style={{ fontFamily: "var(--font-jakarta)" }}>Managed 8%</p>
              </div>
              <div className="bg-[#0A1628] px-6 py-4 text-center">
                <p className="text-xs uppercase tracking-widest text-[#C5A55A]" style={{ fontFamily: "var(--font-jakarta)" }}>Passive 15%</p>
              </div>

              {[
                { label: "Monthly fee", managed: "$160", passive: "$300" },
                { label: "Placement fee", managed: "$2,000", passive: "Free" },
                { label: "Break-even point", managed: "—", passive: "14 months" },
                { label: "Year 1 (1 vacancy)", managed: "$3,920", passive: "$3,600" },
              ].map((row, i) => (
                <>
                  <div key={`label-${i}`} className="bg-white px-6 py-4 text-left">
                    <p className="text-sm text-[#0A1628]" style={{ fontFamily: "var(--font-jakarta)" }}>{row.label}</p>
                  </div>
                  <div key={`managed-${i}`} className="bg-white px-6 py-4 text-center">
                    <p className="text-sm text-[#5A5A5A]" style={{ fontFamily: "var(--font-jakarta)" }}>{row.managed}</p>
                  </div>
                  <div key={`passive-${i}`} className="bg-[#0A1628]/5 px-6 py-4 text-center">
                    <p className={`text-sm font-semibold ${row.passive === "Free" || row.label === "Year 1 (1 vacancy)" ? "text-green-700" : "text-[#0A1628]"}`} style={{ fontFamily: "var(--font-jakarta)" }}>{row.passive}</p>
                  </div>
                </>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-[#C5A55A] text-center mb-4" style={{ fontFamily: "var(--font-jakarta)" }}>What Sets Us Apart</p>
            <h2 className="text-4xl font-light text-[#0A1628] text-center mb-14" style={{ fontFamily: "var(--font-cormorant)" }}>
              What&apos;s always included — at no extra charge.
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="overflow-hidden rounded-2xl border border-[#E8E4DF]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#E8E4DF]">
                    <th className="text-left px-6 py-4 text-[#0A1628] font-medium" style={{ fontFamily: "var(--font-jakarta)" }}>Fee</th>
                    <th className="text-center px-6 py-4 text-[#C5A55A] font-semibold" style={{ fontFamily: "var(--font-jakarta)" }}>Prospera</th>
                    <th className="text-center px-6 py-4 text-[#9B9B9B] font-medium" style={{ fontFamily: "var(--font-jakarta)" }}>Typical PM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E4DF]">
                  {comparison.map((row, i) => (
                    <tr key={i} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="px-6 py-4 text-[#0A1628]" style={{ fontFamily: "var(--font-jakarta)" }}>{row.item}</td>
                      <td className="px-6 py-4 text-center font-semibold text-green-700" style={{ fontFamily: "var(--font-jakarta)" }}>{row.us}</td>
                      <td className="px-6 py-4 text-center text-[#9B9B9B]" style={{ fontFamily: "var(--font-jakarta)" }}>{row.them}</td>
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
            <p className="text-xs uppercase tracking-widest text-[#C5A55A] text-center mb-4" style={{ fontFamily: "var(--font-jakarta)" }}>Common Questions</p>
            <h2 className="text-4xl font-light text-[#0A1628] text-center mb-14" style={{ fontFamily: "var(--font-cormorant)" }}>Pricing FAQ</h2>
          </FadeIn>
          <FAQAccordion items={faqs} />
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[#0A1628] text-center">
        <FadeIn>
          <p className="text-xs uppercase tracking-widest text-[#C5A55A] mb-4" style={{ fontFamily: "var(--font-jakarta)" }}>Ready to hand it over?</p>
          <h2 className="text-4xl md:text-5xl font-light text-[#FAF8F5] mb-5" style={{ fontFamily: "var(--font-cormorant)" }}>
            Let&apos;s talk about your property.
          </h2>
          <p className="text-white/60 text-base mb-10 max-w-md mx-auto leading-relaxed" style={{ fontFamily: "var(--font-jakarta)" }}>
            Free consultation. No pressure. Just an honest conversation about what your property needs and what it could earn.
          </p>
          <Link
            href="/contact"
            className="inline-block px-10 py-4 bg-[#C5A55A] text-[#0A1628] font-semibold rounded-xl hover:opacity-90 transition-opacity text-sm uppercase tracking-widest"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            Get a Free Quote
          </Link>
        </FadeIn>
      </section>
    </>
  );
}
