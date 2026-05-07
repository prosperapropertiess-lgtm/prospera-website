import Link from "next/link";
import FadeIn from "@/components/animations/FadeIn";
import FAQAccordion from "@/components/ui/FAQAccordion";
import PricingCards from "@/components/ui/PricingCards";
import BlogNudge from "@/components/ui/BlogNudge";
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
    <div style={{ backgroundColor: "#F7F5F2" }}>
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center" style={{ backgroundColor: "#1F2F3A" }}>
        <FadeIn>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "rgba(250,248,245,0.55)", fontFamily: "var(--font-dm-sans)" }}>
            We only take 3 new properties per month
          </p>
          <h1
            className="text-5xl md:text-6xl font-light mb-5 leading-tight"
            style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
          >
            Stop Losing Money on Your
            <br />Rental Property.
          </h1>
          <p className="text-base max-w-xl mx-auto leading-relaxed" style={{ color: "rgba(250,248,245,0.65)", fontFamily: "var(--font-dm-sans)" }}>
            Every vacant month costs you $2,000+. Every maintenance markup costs you hundreds more.
            Every hour you spend managing is an hour you don&apos;t get back.
            We fix all three — starting at 8%.
          </p>
        </FadeIn>
      </section>

      {/* Value Stack */}
      <section className="py-20 px-6" style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #D8D2C8" }}>
        <div className="max-w-2xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-center mb-4" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>What You&apos;re Actually Getting</p>
            <h2 className="text-3xl font-light text-center mb-10" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              Everything included. Nothing hidden.
            </h2>
            <div className="rounded-xl overflow-hidden border" style={{ borderColor: "#D8D2C8", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              {valueStack.map((row, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-4 gap-4" style={{ borderBottom: i < valueStack.length - 1 ? "1px solid #D8D2C8" : "none", backgroundColor: i % 2 === 0 ? "#FFFFFF" : "#F7F5F2" }}>
                  <div>
                    <p className="text-sm" style={{ color: "#222222", fontFamily: "var(--font-dm-sans)" }}>{row.item}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>{row.note}</p>
                  </div>
                  <p className="text-sm font-semibold whitespace-nowrap" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>{row.value}</p>
                </div>
              ))}
              <div className="flex items-center justify-between px-6 py-5" style={{ backgroundColor: "#F7F5F2", borderTop: "1px solid #D8D2C8" }}>
                <p className="text-sm font-medium" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>With Prospera — all of this goes away</p>
                <p className="text-sm font-semibold" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>Starting at 8%</p>
              </div>
              <div className="flex items-center justify-between px-6 py-5" style={{ backgroundColor: "#1F2F3A" }}>
                <p className="text-sm font-medium" style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>On a $2,000/month rental — that&apos;s $160/month</p>
                <p className="text-xl font-light" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>$160 / month</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Plans */}
      <section className="py-20" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-center mb-3" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>Choose Your Plan</p>
            <h2 className="text-3xl font-light text-center mb-12" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>Simple, transparent pricing.</h2>
          </FadeIn>
          <PricingCards />

          {/* Reassurance bar */}
          <FadeIn delay={0.3}>
            <div className="mx-6 p-5 text-center border rounded-xl" style={{ borderColor: "#D8D2C8", backgroundColor: "#FFFFFF" }}>
              <p className="text-sm" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                All plans include:{" "}
                <strong style={{ color: "#222222" }}>8% maintenance markup</strong> ·{" "}
                <strong style={{ color: "#222222" }}>no setup fee</strong> ·{" "}
                <strong style={{ color: "#222222" }}>no vacancy fee</strong> ·{" "}
                <strong style={{ color: "#222222" }}>free lease renewal</strong>
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 90-Day Guarantee */}
      <section className="py-24 px-6 text-center" style={{ backgroundColor: "#1F2F3A" }}>
        <FadeIn>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "rgba(250,248,245,0.55)", fontFamily: "var(--font-dm-sans)" }}>The 90-Day Happiness Guarantee</p>
          <h2 className="text-4xl md:text-5xl font-light mb-6 leading-tight" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Not happy in 90 days?
            <br />Walk away. No fees. No questions.
          </h2>
          <p className="text-base max-w-lg mx-auto leading-relaxed mb-4" style={{ color: "rgba(250,248,245,0.65)", fontFamily: "var(--font-dm-sans)" }}>
            If we don&apos;t deliver in your first 90 days — you cancel, we part ways, and you owe us nothing. No cancellation fees, no penalty, no awkward conversation.
          </p>
          <p className="text-sm max-w-md mx-auto leading-relaxed mb-10" style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)" }}>
            We offer this because we&apos;re confident we&apos;ll earn your trust long before 90 days is up.
          </p>
          <Link
            href="/contact"
            className="inline-block px-10 py-4 text-sm uppercase tracking-widest rounded-xl hover:opacity-80 transition-opacity"
            style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
          >
            Start Risk-Free
          </Link>
        </FadeIn>
      </section>

      {/* The Math */}
      <section className="py-24 px-6" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>Run the Numbers</p>
            <h2 className="text-4xl font-light mb-4" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              Passive actually costs less.
            </h2>
            <p className="text-base mb-16 leading-relaxed" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
              On a $2,000/month rental, the difference between Managed and Passive is $140/month.
              Free placement saves you $2,000 every vacancy. Do the math — Passive wins after one turnover.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="rounded-xl overflow-hidden border" style={{ borderColor: "#D8D2C8", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div className="grid grid-cols-3">
                <div className="px-6 py-4 text-left" style={{ backgroundColor: "#F7F5F2", borderBottom: "1px solid #D8D2C8" }}>
                  <p className="text-xs uppercase tracking-widest" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>On $2,000/mo rent</p>
                </div>
                <div className="px-6 py-4 text-center" style={{ backgroundColor: "#F7F5F2", borderBottom: "1px solid #D8D2C8", borderLeft: "1px solid #D8D2C8" }}>
                  <p className="text-xs uppercase tracking-widest" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>Managed 8%</p>
                </div>
                <div className="px-6 py-4 text-center" style={{ backgroundColor: "#1F2F3A", borderBottom: "1px solid #D8D2C8" }}>
                  <p className="text-xs uppercase tracking-widest" style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>Passive 15%</p>
                </div>

                {[
                  { label: "Monthly management fee", managed: "$160", passive: "$300" },
                  { label: "Placement fee (per vacancy)", managed: "$2,000", passive: "Free" },
                  { label: "Year 1 total (1 vacancy)", managed: "$3,920", passive: "$3,600" },
                  { label: "You save", managed: "—", passive: "$320 in year 1" },
                ].map((row, i) => (
                  <>
                    <div key={`label-${i}`} className="px-6 py-4 text-left" style={{ backgroundColor: i % 2 === 0 ? "#FFFFFF" : "#F7F5F2", borderTop: "1px solid #D8D2C8" }}>
                      <p className="text-sm" style={{ color: "#222222", fontFamily: "var(--font-dm-sans)" }}>{row.label}</p>
                    </div>
                    <div key={`managed-${i}`} className="px-6 py-4 text-center" style={{ backgroundColor: i % 2 === 0 ? "#FFFFFF" : "#F7F5F2", borderTop: "1px solid #D8D2C8", borderLeft: "1px solid #D8D2C8" }}>
                      <p className="text-sm" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>{row.managed}</p>
                    </div>
                    <div key={`passive-${i}`} className="px-6 py-4 text-center" style={{ backgroundColor: "#1F2F3A", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                      <p className="text-sm font-semibold" style={{ color: row.passive === "Free" || row.label === "You save" ? "#8B2030" : "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>{row.passive}</p>
                    </div>
                  </>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* What it costs to do nothing */}
      <section className="py-24 px-6" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>The Real Cost of Self-Managing</p>
            <h2 className="text-4xl font-light mb-6" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              Every month you wait costs more than you think.
            </h2>
            <p className="text-base mb-14 leading-relaxed" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
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
                <div key={i} className="bg-white border rounded-xl p-6" style={{ borderColor: "#D8D2C8", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>{item.label}</p>
                  <p className="text-4xl font-light mb-3" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>{item.amount}</p>
                  <p className="text-sm leading-relaxed" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>{item.detail}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 px-6" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-center mb-4" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>What Others Charge</p>
            <h2 className="text-4xl font-light text-center mb-4" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              Fees that most landlords don&apos;t know they&apos;re paying.
            </h2>
            <p className="text-sm text-center mb-14" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
              Every one of these is $0 with Prospera.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="overflow-hidden rounded-xl border" style={{ borderColor: "#D8D2C8", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "#1F2F3A" }}>
                    <th className="text-left px-6 py-4 font-medium" style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>Hidden Fee</th>
                    <th className="text-center px-6 py-4 font-semibold" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>Prospera</th>
                    <th className="text-center px-6 py-4 font-medium" style={{ color: "rgba(250,248,245,0.6)", fontFamily: "var(--font-dm-sans)" }}>Typical PM</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row, i) => (
                    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#FFFFFF" : "#F7F5F2", borderTop: "1px solid #D8D2C8" }}>
                      <td className="px-6 py-4" style={{ color: "#222222", fontFamily: "var(--font-dm-sans)" }}>{row.item}</td>
                      <td className="px-6 py-4 text-center font-semibold" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>{row.us}</td>
                      <td className="px-6 py-4 text-center" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>{row.them}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-center mb-4" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>Common Questions</p>
            <h2 className="text-4xl font-light text-center mb-14" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>Pricing FAQ</h2>
          </FadeIn>
          <FAQAccordion items={faqs} />
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center" style={{ backgroundColor: "#1F2F3A" }}>
        <FadeIn>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "rgba(250,248,245,0.55)", fontFamily: "var(--font-dm-sans)" }}>
            Only 3 spots available this month
          </p>
          <h2 className="text-4xl md:text-5xl font-light mb-5" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Ready to stop managing
            <br />and start earning?
          </h2>
          <p className="text-base mb-10 max-w-md mx-auto leading-relaxed" style={{ color: "rgba(250,248,245,0.65)", fontFamily: "var(--font-dm-sans)" }}>
            Free 15-minute call. No pressure. Just an honest conversation about your property and what it could be earning.
          </p>
          <Link
            href="/contact"
            className="inline-block px-10 py-4 text-sm uppercase tracking-widest rounded-xl hover:opacity-80 transition-opacity"
            style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
          >
            Book Your Free Call
          </Link>
        </FadeIn>
      </section>

      {/* Blog nudges */}
      <section className="py-12 px-5 sm:px-8" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-3xl mx-auto space-y-4">
          <BlogNudge
            hook="Is what you're paying actually normal?"
            title="Property Management Fees in Ontario: What's Normal in 2026?"
            excerpt="Before you hire a property manager, understand what you should be paying — and the hidden fees to watch out for."
            slug="property-management-fees-ontario"
            label="Do the math"
          />
          <BlogNudge
            hook="Are you leaving money on the table at tax time?"
            title="Rental Property Tax Deductions for Ontario Landlords"
            excerpt="Most Ontario landlords miss deductions they're legally entitled to. Here's a practical breakdown of what you can write off."
            slug="rental-property-tax-deductions-ontario"
            label="Do the math"
          />
        </div>
      </section>
    </div>
  );
}
