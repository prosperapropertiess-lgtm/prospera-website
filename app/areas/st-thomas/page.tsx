import Link from "next/link";
import FadeIn from "@/components/animations/FadeIn";
import BlogNudge from "@/components/ui/BlogNudge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Property Management in St. Thomas, Ontario",
  description: "Professional property management in St. Thomas, ON. Serving landlords across St. Thomas with tenant screening, rent collection, and full maintenance coordination.",
};

const stats = [
  { value: "$1,250", label: "Avg. 1-bed rent" },
  { value: "$1,550", label: "Avg. 2-bed rent" },
  { value: "↑ Rising", label: "Market trend" },
  { value: "2–3 wks", label: "Avg. time to fill" },
];

const highlights = [
  { icon: "🏭", title: "Growing Employment Base", desc: "Amazon's fulfillment centre and the Volkswagen EV battery plant have created thousands of jobs and a new wave of renters needing quality housing." },
  { icon: "🏘️", title: "Undervalued Investment Market", desc: "Property prices in St. Thomas are significantly lower than London, offering better cap rates for savvy investors. Demand is outpacing new supply." },
  { icon: "🚗", title: "London Commuter Hub", desc: "30 minutes from London, St. Thomas attracts renters priced out of the bigger city. Quality professional tenants who want more space for less money." },
  { icon: "📈", title: "Rising Rents", desc: "Rents have grown steadily over the past two years. Units priced correctly are renting fast — often with multiple applicants." },
];

export default function StThomasPage() {
  return (
    <div style={{ backgroundColor: "#F7F5F2" }}>
      {/* Hero */}
      <section className="pt-36 pb-24 px-6 text-center" style={{ backgroundColor: "#1F2F3A" }}>
        <FadeIn>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "rgba(250,248,245,0.55)", fontFamily: "var(--font-dm-sans)" }}>
            St. Thomas, Ontario
          </p>
          <h1 className="text-5xl md:text-6xl font-light mb-6 max-w-3xl mx-auto leading-tight" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Property Management in St. Thomas, Ontario
          </h1>
          <p className="text-lg max-w-xl mx-auto mb-10" style={{ color: "rgba(250,248,245,0.65)", fontFamily: "var(--font-dm-sans)" }}>
            St. Thomas is one of Ontario&apos;s most exciting rental markets right now. We&apos;re on the ground helping landlords capitalize on it.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 text-xs uppercase tracking-widest transition-opacity hover:opacity-80 rounded"
            style={{ backgroundColor: "#6A2E35", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
          >
            Get a Free Estimate
          </Link>
        </FadeIn>
      </section>

      {/* Stats */}
      <section className="py-12 px-6" style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #D8D2C8" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-light mb-1" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>{s.value}</p>
              <p className="text-xs uppercase tracking-widest" style={{ color: "#6A2E35", fontFamily: "var(--font-dm-sans)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why St. Thomas */}
      <section className="py-20 px-6" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl font-light text-center mb-4" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              Why St. Thomas Is Worth Your Attention
            </h2>
            <p className="text-center text-sm mb-12 max-w-xl mx-auto" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
              This isn&apos;t just a bedroom community anymore. St. Thomas is developing its own economic identity.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {highlights.map((h, i) => (
              <FadeIn key={h.title} delay={i * 0.08}>
                <div className="bg-white border p-6 rounded-xl" style={{ borderColor: "#D8D2C8", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <span className="text-2xl mb-3 block">{h.icon}</span>
                  <h3 className="text-lg font-medium mb-2" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>{h.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>{h.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Rent table */}
      <section className="py-20 px-6" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl font-light text-center mb-10" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              St. Thomas Rental Market — 2026
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "#D8D2C8", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <table className="w-full text-sm" style={{ fontFamily: "var(--font-dm-sans)" }}>
                <thead>
                  <tr style={{ backgroundColor: "#1F2F3A", color: "#FAF8F5" }}>
                    <th className="text-left p-4">Unit Type</th>
                    <th className="p-4 text-right">Average Monthly Rent</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { type: "1 Bedroom", avg: "$1,250" },
                    { type: "2 Bedroom", avg: "$1,550" },
                    { type: "3 Bedroom", avg: "$1,950" },
                  ].map((row, i) => (
                    <tr key={row.type} style={{ backgroundColor: i % 2 === 0 ? "#FFFFFF" : "#F7F5F2" }}>
                      <td className="p-4 font-medium" style={{ color: "#222222" }}>{row.type}</td>
                      <td className="p-4 text-right font-semibold" style={{ color: "#6A2E35" }}>{row.avg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Services included */}
      <section className="py-20 px-6" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-3xl font-light mb-4" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              What&apos;s Included in Our Management
            </h2>
            <p className="text-sm mb-12 max-w-xl mx-auto" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
              One simple fee covers everything — no hidden charges, no per-repair markups.
            </p>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-left">
            {[
              "Full tenant screening", "Rent collection", "24/7 maintenance line",
              "Lease preparation", "Monthly statements", "Annual inspections",
              "Rent increase notices", "Renewal coordination", "LTB support if needed",
            ].map((item, i) => (
              <FadeIn key={item} delay={i * 0.05}>
                <div className="flex items-center gap-3 bg-white border p-4 rounded-xl" style={{ borderColor: "#D8D2C8" }}>
                  <span style={{ color: "#6A2E35" }}>✓</span>
                  <span className="text-sm" style={{ color: "#222222", fontFamily: "var(--font-dm-sans)" }}>{item}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Blog nudge */}
      <section className="py-10 px-6" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-4">
          <BlogNudge
            hook="St. Thomas rents are rising fast. Are you keeping up?"
            title="How Much to Charge for Rent in London, Ontario"
            excerpt="Market data across Southwest Ontario — see how St. Thomas stacks up and where your rent should be in 2026."
            slug="how-much-charge-rent-london-ontario"
            label="Market Data"
          />
          <BlogNudge
            hook="First rental property? Here's what most landlords wish they knew."
            title="First-Time Landlord Tips in London, Ontario"
            excerpt="The 10 things experienced landlords do differently — from screening tenants to setting rent to handling maintenance calls."
            slug="first-time-landlord-tips-london-ontario"
            label="For New Landlords"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center" style={{ backgroundColor: "#1F2F3A" }}>
        <FadeIn>
          <h2 className="text-3xl font-light mb-4" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Own a Rental in St. Thomas?
          </h2>
          <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "rgba(250,248,245,0.6)", fontFamily: "var(--font-dm-sans)" }}>
            We&apos;re actively growing our St. Thomas portfolio. Get a free rental estimate and management proposal.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 text-xs uppercase tracking-widest transition-opacity hover:opacity-80 rounded"
            style={{ backgroundColor: "#6A2E35", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
          >
            Get a Free Quote
          </Link>
        </FadeIn>
      </section>
    </div>
  );
}
