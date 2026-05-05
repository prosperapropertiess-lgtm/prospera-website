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
    q: "What's the 90-Day Happiness Guarantee?",
    a: "Simple — if you're not completely happy with how we manage your property in the first 90 days, walk away. No cancellation fees, no questions asked. We're that confident in what we do.",
  },
  {
    q: "What does the 8% maintenance markup mean?",
    a: "We coordinate all repairs and charge a small 8% coordination fee on contractor invoices. That's it — no inflated quotes, no mystery markups. Most property managers charge 10–20%. We keep it honest.",
  },
  {
    q: "Do you charge while the property is vacant?",
    a: "No. We don't get paid when your property isn't earning. Most managers charge 50% of rent just to sit on a vacant unit. We charge nothing — which is exactly why we fill vacancies fast.",
  },
  {
    q: "What's included in tenant placement?",
    a: "Professional photos, listing on all major platforms, full tenant screening (credit check, income verification, reference calls), lease preparation, and move-in coordination. All included in your plan.",
  },
  {
    q: "Why only 3 new properties per month?",
    a: "We cap intake to protect quality. Every landlord gets Ebin's personal attention — not a call centre. When we take on too many at once, service slips. We'd rather grow slower and do it right.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes. You can upgrade or downgrade at your next renewal. Most landlords start on Managed and move to Passive after their first vacancy — once they run the numbers and see Passive actually costs less.",
  },
];

const comparison = [
  { item: "Maintenance markup", us: "8% — transparent", them: "10–20% per job" },
  { item: "Setup fee", us: "None", them: "$200–$500" },
  { item: "Vacancy fee", us: "None", them: "50% of rent" },
  { item: "Lease renewal fee", us: "Free", them: "$150–$300" },
  { item: "Photography & listing", us: "Included", them: "$200–$500" },
  { item: "Early termination fee", us: "None", them: "1–2 months rent" },
  { item: "Inspection reports", us: "Included", them: "$100–$200 each" },
];

const valueStack = [
  { item: "Tenant placement (standalone cost)", value: "1 month's rent", note: "one-time per vacancy" },
  { item: "Professional photography & listing", value: "$200–$500", note: "one-time per vacancy" },
  { item: "Lease preparation & review", value: "$200–$400", note: "one-time per lease" },
  { item: "Move-in / move-out inspection", value: "$100–$200", note: "one-time per tenant" },
  { item: "Maintenance coordination", value: "10–20% markup", note: "what others charge on every repair" },
  { item: "Chasing late rent", value: "Hours of your time", note: "every single month" },
  { item: "2am emergency calls", value: "Your sleep", note: "priceless" },
];

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 bg-[#FAF8F5] text-center">
        <FadeIn>
          <p className="text-xs uppercase tracking-widest text-[#C5A55A] mb-4" style={{ fontFamily: "var(--font-jakarta)" }}>
            We only take 3 new properties per month
          </p>
          <h1
            className="text-5xl md:text-6xl font-light text-[#1A1A1A] mb-5 leading-tight"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Stop Losing Money on Your
            <br />Rental Property.
          </h1>
          <p className="text-base text-[#5A5A5A] max-w-xl mx-auto leading-relaxed" style={{ fontFamily: "var(--font-jakarta)" }}>
            Every vacant month costs you $2,000+. Every maintenance markup costs you hundreds more.
            Every hour you spend managing is an hour you don&apos;t get back.
            We fix all three — starting at 8%.
          </p>
        </FadeIn>
      </section>

      {/* Value Stack */}
      <section className="pb-16 px-6 bg-[#FAF8F5]">
        <div className="max-w-2xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-[#C5A55A] text-center mb-4" style={{ fontFamily: "var(--font-jakarta)" }}>What You&apos;re Actually Getting</p>
            <h2 className="text-3xl font-light text-[#1A1A1A] text-center mb-10" style={{ fontFamily: "var(--font-cormorant)" }}>
              Everything included. Nothing hidden.
            </h2>
            <div className="bg-white border border-[#E8E4DF] rounded-2xl overflow-hidden">
              {valueStack.map((row, i) => (
                <div key={i} className={`flex items-center justify-between px-6 py-4 gap-4 ${i < valueStack.length - 1 ? "border-b border-[#E8E4DF]" : ""}`}>
                  <div>
                    <p className="text-sm text-[#1A1A1A]" style={{ fontFamily: "var(--font-jakarta)" }}>{row.item}</p>
                    <p className="text-xs text-[#9B9B9B] mt-0.5" style={{ fontFamily: "var(--font-jakarta)" }}>{row.note}</p>
                  </div>
                  <p className="text-sm font-semibold text-[#C5A55A] whitespace-nowrap" style={{ fontFamily: "var(--font-jakarta)" }}>{row.value}</p>
                </div>
              ))}
              <div className="flex items-center justify-between px-6 py-5 bg-[#1A1A1A]">
                <p className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-jakarta)" }}>With Prospera — all of this goes away</p>
                <p className="text-sm font-semibold text-[#C5A55A]" style={{ fontFamily: "var(--font-jakarta)" }}>Starting at 8%</p>
              </div>
              <div className="flex items-center justify-between px-6 py-5 bg-[#C5A55A]">
                <p className="text-sm font-semibold text-[#1A1A1A]" style={{ fontFamily: "var(--font-jakarta)" }}>On a $2,000/month rental — that&apos;s $160/month</p>
                <p className="text-xl font-bold text-[#1A1A1A]" style={{ fontFamily: "var(--font-cormorant)" }}>$160 / month</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Plans */}
      <section className="pb-24 px-6 bg-[#FAF8F5]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

            {/* MANAGED */}
            <FadeIn delay={0}>
              <div className="relative bg-white border border-[#E8E4DF] rounded-2xl p-8 flex flex-col h-full">
                <div className="mb-8">
                  <p className="text-xs uppercase tracking-widest text-[#9B9B9B] mb-3" style={{ fontFamily: "var(--font-jakarta)" }}>Managed</p>
                  <div className="flex items-end gap-2 mb-1">
                    <p className="text-6xl font-light text-[#1A1A1A]" style={{ fontFamily: "var(--font-cormorant)" }}>8%</p>
                    <p className="text-sm text-[#9B9B9B] mb-2" style={{ fontFamily: "var(--font-jakarta)" }}>/ month</p>
                  </div>
                  <p className="text-sm text-[#9B9B9B] mb-1" style={{ fontFamily: "var(--font-jakarta)" }}>
                    + 1 month&apos;s rent (placement)
                  </p>
                  <p className="text-base text-[#2C2C2C] mt-4 leading-relaxed" style={{ fontFamily: "var(--font-jakarta)" }}>
                    Everything handled. You collect rent and do nothing else.
                  </p>
                </div>

                <ul className="space-y-3 mb-8 flex-1" style={{ fontFamily: "var(--font-jakarta)" }}>
                  {[
                    "Full tenant screening & placement",
                    "Rent collection & disbursement",
                    "Maintenance coordination",
                    "8% maintenance markup — transparent, no surprises",
                    "Lease management & renewals",
                    "Move-in / move-out inspection",
                    "Monthly financial statements",
                    "No vacancy fee. Ever.",
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-base text-[#2C2C2C]">
                      <span className="text-[#C5A55A] mt-0.5 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/contact"
                  className="block text-center py-4 text-xs font-semibold uppercase tracking-widest border border-[#E8E4DF] text-[#1A1A1A] rounded-xl hover:border-[#1A1A1A] transition-colors"
                  style={{ fontFamily: "var(--font-jakarta)" }}
                >
                  Get Started
                </Link>
              </div>
            </FadeIn>

            {/* OPTIMIZED */}
            <FadeIn delay={0.1}>
              <div className="relative bg-[#1A1A1A] rounded-2xl p-8 flex flex-col h-full">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-[#C5A55A] rounded-full">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#1A1A1A]" style={{ fontFamily: "var(--font-jakarta)" }}>Most Popular</p>
                </div>

                <div className="mb-8">
                  <p className="text-xs uppercase tracking-widest text-[#C5A55A] mb-3" style={{ fontFamily: "var(--font-jakarta)" }}>Optimized</p>
                  <div className="flex items-end gap-2 mb-1">
                    <p className="text-6xl font-light text-[#FAF8F5]" style={{ fontFamily: "var(--font-cormorant)" }}>12%</p>
                    <p className="text-sm text-[#FAF8F5] mb-2" style={{ fontFamily: "var(--font-jakarta)" }}>/ month</p>
                  </div>
                  <p className="text-sm text-[#FAF8F5] mb-1" style={{ fontFamily: "var(--font-jakarta)" }}>
                    + 75% of one month&apos;s rent (placement)
                  </p>
                  <p className="text-base text-[#E8E4DF] mt-4 leading-relaxed" style={{ fontFamily: "var(--font-jakarta)" }}>
                    Your property works harder for you. Proactive rent optimization keeps your income growing.
                  </p>
                </div>

                <ul className="space-y-3 mb-8 flex-1" style={{ fontFamily: "var(--font-jakarta)" }}>
                  {[
                    "Everything in Managed",
                    "25% lower placement fee (save $500 avg)",
                    "Semi-annual property inspections",
                    "Proactive rent increase advisory",
                    "Market rent review every 6 months",
                    "Priority 24-hour response",
                    "Tenant renewal negotiation",
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-base text-[#FAF8F5]">
                      <span className="text-[#C5A55A] mt-0.5 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/contact"
                  className="block text-center py-4 text-xs font-semibold uppercase tracking-widest bg-[#C5A55A] text-[#1A1A1A] rounded-xl hover:opacity-90 transition-opacity"
                  style={{ fontFamily: "var(--font-jakarta)" }}
                >
                  Get Started
                </Link>
              </div>
            </FadeIn>

            {/* PASSIVE */}
            <FadeIn delay={0.2}>
              <div className="relative bg-white border-2 border-[#1A1A1A] rounded-2xl p-8 flex flex-col h-full">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-[#1A1A1A] rounded-full">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#C5A55A]" style={{ fontFamily: "var(--font-jakarta)" }}>Best Value</p>
                </div>

                <div className="mb-8">
                  <p className="text-xs uppercase tracking-widest text-[#9B9B9B] mb-3" style={{ fontFamily: "var(--font-jakarta)" }}>Passive</p>
                  <div className="flex items-end gap-2 mb-1">
                    <p className="text-6xl font-light text-[#1A1A1A]" style={{ fontFamily: "var(--font-cormorant)" }}>15%</p>
                    <p className="text-sm text-[#9B9B9B] mb-2" style={{ fontFamily: "var(--font-jakarta)" }}>/ month</p>
                  </div>
                  <p className="text-sm font-semibold text-[#C5A55A] mb-1" style={{ fontFamily: "var(--font-jakarta)" }}>
                    Placement: FREE every single time ($2,000 value)
                  </p>
                  <p className="text-base text-[#2C2C2C] mt-4 leading-relaxed" style={{ fontFamily: "var(--font-jakarta)" }}>
                    True passive income — backed by our 90-Day Happiness Guarantee. Not happy? Walk away free.
                  </p>
                </div>

                <ul className="space-y-3 mb-8 flex-1" style={{ fontFamily: "var(--font-jakarta)" }}>
                  {[
                    "Everything in Optimized",
                    "FREE placement — saves $2,000 every vacancy",
                    "90-Day Happiness Guarantee — no questions asked",
                    "Pre-vacancy marketing before tenant leaves",
                    "Quarterly property inspections",
                    "Annual landlord strategy call",
                    "Zero risk. Zero vacancy fees. Zero lock-in.",
                  ].map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-base text-[#2C2C2C]">
                      <span className="text-[#C5A55A] mt-0.5 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/contact"
                  className="block text-center py-4 text-xs font-semibold uppercase tracking-widest bg-[#8B1A1A] text-[#FAF8F5] rounded-xl hover:opacity-90 transition-opacity"
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
                <strong className="text-[#1A1A1A]">8% maintenance markup</strong> ·{" "}
                <strong className="text-[#1A1A1A]">no setup fee</strong> ·{" "}
                <strong className="text-[#1A1A1A]">no vacancy fee</strong> ·{" "}
                <strong className="text-[#1A1A1A]">free lease renewal</strong>
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 21-Day Guarantee */}
      <section className="py-24 px-6 bg-[#1A1A1A] text-center">
        <FadeIn>
          <p className="text-xs uppercase tracking-widest text-[#C5A55A] mb-4" style={{ fontFamily: "var(--font-jakarta)" }}>The 90-Day Happiness Guarantee</p>
          <h2 className="text-4xl md:text-5xl font-light text-[#FAF8F5] mb-6 leading-tight" style={{ fontFamily: "var(--font-cormorant)" }}>
            Not happy in 90 days?
            <br />Walk away. No fees. No questions.
          </h2>
          <p className="text-[#E8E4DF] text-base max-w-lg mx-auto leading-relaxed mb-4" style={{ fontFamily: "var(--font-jakarta)" }}>
            If we don&apos;t deliver in your first 90 days — you cancel, we part ways, and you owe us nothing. No cancellation fees, no penalty, no awkward conversation.
          </p>
          <p className="text-[#FAF8F5] text-sm max-w-md mx-auto leading-relaxed mb-10" style={{ fontFamily: "var(--font-jakarta)" }}>
            We offer this because we&apos;re confident we&apos;ll earn your trust long before 90 days is up.
          </p>
          <Link
            href="/contact"
            className="inline-block px-10 py-4 bg-[#C5A55A] text-[#1A1A1A] font-semibold rounded-xl hover:opacity-90 transition-opacity text-sm uppercase tracking-widest"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            Start Risk-Free
          </Link>
        </FadeIn>
      </section>

      {/* The Math */}
      <section className="py-24 px-6 bg-[#FAF8F5]">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-[#C5A55A] mb-4" style={{ fontFamily: "var(--font-jakarta)" }}>Run the Numbers</p>
            <h2 className="text-4xl font-light text-[#1A1A1A] mb-4" style={{ fontFamily: "var(--font-cormorant)" }}>
              Passive actually costs less.
            </h2>
            <p className="text-[#5A5A5A] text-base mb-16 leading-relaxed" style={{ fontFamily: "var(--font-jakarta)" }}>
              On a $2,000/month rental, the difference between Managed and Passive is $140/month.
              Free placement saves you $2,000 every vacancy. Do the math — Passive wins after one turnover.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="grid grid-cols-3 gap-px bg-[#E8E4DF] rounded-2xl overflow-hidden border border-[#E8E4DF]">
              <div className="bg-[#FAF8F5] px-6 py-4 text-left">
                <p className="text-xs uppercase tracking-widest text-[#9B9B9B]" style={{ fontFamily: "var(--font-jakarta)" }}>On $2,000/mo rent</p>
              </div>
              <div className="bg-[#FAF8F5] px-6 py-4 text-center">
                <p className="text-xs uppercase tracking-widest text-[#9B9B9B]" style={{ fontFamily: "var(--font-jakarta)" }}>Managed 8%</p>
              </div>
              <div className="bg-[#1A1A1A] px-6 py-4 text-center">
                <p className="text-xs uppercase tracking-widest text-[#C5A55A]" style={{ fontFamily: "var(--font-jakarta)" }}>Passive 15%</p>
              </div>

              {[
                { label: "Monthly management fee", managed: "$160", passive: "$300" },
                { label: "Placement fee (per vacancy)", managed: "$2,000", passive: "Free" },
                { label: "Year 1 total (1 vacancy)", managed: "$3,920", passive: "$3,600" },
                { label: "You save", managed: "—", passive: "$320 in year 1" },
              ].map((row, i) => (
                <>
                  <div key={`label-${i}`} className="bg-white px-6 py-4 text-left">
                    <p className="text-sm text-[#1A1A1A]" style={{ fontFamily: "var(--font-jakarta)" }}>{row.label}</p>
                  </div>
                  <div key={`managed-${i}`} className="bg-white px-6 py-4 text-center">
                    <p className="text-sm text-[#5A5A5A]" style={{ fontFamily: "var(--font-jakarta)" }}>{row.managed}</p>
                  </div>
                  <div key={`passive-${i}`} className="bg-[#1A1A1A]/5 px-6 py-4 text-center">
                    <p className={`text-sm font-semibold ${row.passive === "Free" || row.label === "You save" ? "text-[#C5A55A]" : "text-[#1A1A1A]"}`} style={{ fontFamily: "var(--font-jakarta)" }}>{row.passive}</p>
                  </div>
                </>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* What it costs to do nothing */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-[#C5A55A] mb-4" style={{ fontFamily: "var(--font-jakarta)" }}>The Real Cost of Self-Managing</p>
            <h2 className="text-4xl font-light text-[#1A1A1A] mb-6" style={{ fontFamily: "var(--font-cormorant)" }}>
              Every month you wait costs more than you think.
            </h2>
            <p className="text-[#5A5A5A] text-base mb-14 leading-relaxed" style={{ fontFamily: "var(--font-jakarta)" }}>
              Most landlords underestimate what self-managing actually costs them.
              It&apos;s not just time — it&apos;s the markups you&apos;re paying, the rent you&apos;re leaving on the table,
              and the vacancy days that quietly bleed your returns.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {[
                {
                  label: "The Vacancy Drain",
                  amount: "$2,000+",
                  detail: "Every month your unit sits empty. Our average vacancy is under 18 days.",
                },
                {
                  label: "The Markup Tax",
                  amount: "$50–200",
                  detail: "Extra per repair when your PM charges 10–20% on every contractor invoice. We charge a flat 8%.",
                },
                {
                  label: "Your Time",
                  amount: "8 hrs/mo",
                  detail: "Average hours a landlord spends managing one property. What's your hour worth?",
                },
              ].map((item, i) => (
                <div key={i} className="bg-[#FAF8F5] border border-[#E8E4DF] rounded-2xl p-6">
                  <p className="text-xs uppercase tracking-widest text-[#9B9B9B] mb-2" style={{ fontFamily: "var(--font-jakarta)" }}>{item.label}</p>
                  <p className="text-4xl font-light text-[#1A1A1A] mb-3" style={{ fontFamily: "var(--font-cormorant)" }}>{item.amount}</p>
                  <p className="text-base text-[#2C2C2C] leading-relaxed" style={{ fontFamily: "var(--font-jakarta)" }}>{item.detail}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 px-6 bg-[#FAF8F5]">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-[#C5A55A] text-center mb-4" style={{ fontFamily: "var(--font-jakarta)" }}>What Others Charge</p>
            <h2 className="text-4xl font-light text-[#1A1A1A] text-center mb-4" style={{ fontFamily: "var(--font-cormorant)" }}>
              Fees that most landlords don&apos;t know they&apos;re paying.
            </h2>
            <p className="text-[#5A5A5A] text-sm text-center mb-14" style={{ fontFamily: "var(--font-jakarta)" }}>
              Every one of these is $0 with Prospera.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="overflow-hidden rounded-2xl border border-[#E8E4DF]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white border-b border-[#E8E4DF]">
                    <th className="text-left px-6 py-4 text-[#1A1A1A] font-medium" style={{ fontFamily: "var(--font-jakarta)" }}>Hidden Fee</th>
                    <th className="text-center px-6 py-4 text-[#C5A55A] font-semibold" style={{ fontFamily: "var(--font-jakarta)" }}>Prospera</th>
                    <th className="text-center px-6 py-4 text-[#9B9B9B] font-medium" style={{ fontFamily: "var(--font-jakarta)" }}>Typical PM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E4DF]">
                  {comparison.map((row, i) => (
                    <tr key={i} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="px-6 py-4 text-[#1A1A1A]" style={{ fontFamily: "var(--font-jakarta)" }}>{row.item}</td>
                      <td className="px-6 py-4 text-center font-semibold text-[#C5A55A]" style={{ fontFamily: "var(--font-jakarta)" }}>{row.us}</td>
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
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-[#C5A55A] text-center mb-4" style={{ fontFamily: "var(--font-jakarta)" }}>Common Questions</p>
            <h2 className="text-4xl font-light text-[#1A1A1A] text-center mb-14" style={{ fontFamily: "var(--font-cormorant)" }}>Pricing FAQ</h2>
          </FadeIn>
          <FAQAccordion items={faqs} />
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[#1A1A1A] text-center">
        <FadeIn>
          <p className="text-xs uppercase tracking-widest text-[#C5A55A] mb-4" style={{ fontFamily: "var(--font-jakarta)" }}>
            Only 3 spots available this month
          </p>
          <h2 className="text-4xl md:text-5xl font-light text-[#FAF8F5] mb-5" style={{ fontFamily: "var(--font-cormorant)" }}>
            Ready to stop managing
            <br />and start earning?
          </h2>
          <p className="text-[#E8E4DF] text-base mb-10 max-w-md mx-auto leading-relaxed" style={{ fontFamily: "var(--font-jakarta)" }}>
            Free 15-minute call. No pressure. Just an honest conversation about your property and what it could be earning.
          </p>
          <Link
            href="/contact"
            className="inline-block px-10 py-4 bg-[#C5A55A] text-[#1A1A1A] font-semibold rounded-xl hover:opacity-90 transition-opacity text-sm uppercase tracking-widest"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            Book Your Free Call
          </Link>
        </FadeIn>
      </section>
    </>
  );
}
