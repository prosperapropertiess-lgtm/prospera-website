import Link from "next/link";
import FadeIn from "@/components/animations/FadeIn";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Property Management in St. Thomas, Ontario — Prospera Properties",
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
    <div style={{ backgroundColor: "#FAF8F5" }} className="min-h-screen">
      {/* Hero */}
      <section className="pt-36 pb-24 px-6 text-center" style={{ backgroundColor: "#0D1B2A" }}>
        <FadeIn>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}>
            St. Thomas, Ontario
          </p>
          <h1 className="text-5xl md:text-6xl font-light mb-6 max-w-3xl mx-auto leading-tight" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Property Management in St. Thomas, Ontario
          </h1>
          <p className="text-lg max-w-xl mx-auto mb-10" style={{ color: "#A0A0A0", fontFamily: "var(--font-dm-sans)" }}>
            St. Thomas is one of Ontario's most exciting rental markets right now. We're on the ground helping landlords capitalize on it.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 text-xs uppercase tracking-widest transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#7B1C1C", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
          >
            Get a Free Estimate
          </Link>
        </FadeIn>
      </section>

      {/* Stats */}
      <section className="py-12 px-6" style={{ backgroundColor: "#F5F0EB" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-light mb-1" style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}>
                {s.value}
              </p>
              <p className="text-xs uppercase tracking-widest" style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why St. Thomas */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl font-light text-center mb-4" style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}>
              Why St. Thomas Is Worth Your Attention
            </h2>
            <p className="text-center text-sm mb-12 max-w-xl mx-auto" style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}>
              This isn't just a bedroom community anymore. St. Thomas is developing its own economic identity.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {highlights.map((h, i) => (
              <FadeIn key={h.title} delay={i * 0.08}>
                <div className="bg-white border p-6" style={{ borderColor: "#E8E4DF" }}>
                  <span className="text-2xl mb-3 block">{h.icon}</span>
                  <h3 className="text-lg font-medium mb-2" style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}>
                    {h.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}>
                    {h.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Rent table */}
      <section className="py-20 px-6" style={{ backgroundColor: "#F5F0EB" }}>
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl font-light text-center mb-10" style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}>
              St. Thomas Rental Market — 2026
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ fontFamily: "var(--font-dm-sans)" }}>
                <thead>
                  <tr style={{ backgroundColor: "#0D1B2A", color: "#FAF8F5" }}>
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
                    <tr key={row.type} style={{ backgroundColor: i % 2 === 0 ? "#FAF8F5" : "#F5F0EB" }}>
                      <td className="p-4 font-medium" style={{ color: "#0D1B2A" }}>{row.type}</td>
                      <td className="p-4 text-right font-medium" style={{ color: "#0D1B2A" }}>{row.avg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Services included */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-3xl font-light mb-4" style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}>
              What's Included in Our Management
            </h2>
            <p className="text-sm mb-12 max-w-xl mx-auto" style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}>
              One simple fee covers everything — no hidden charges, no per-repair markups.
            </p>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-left">
            {[
              "Full tenant screening", "Rent collection", "24/7 maintenance line",
              "Lease preparation", "Monthly statements", "Annual inspections",
              "Rent increase notices", "Renewal coordination", "LTB support if needed",
            ].map((item, i) => (
              <FadeIn key={item} delay={i * 0.05}>
                <div className="flex items-center gap-3 bg-white border p-4" style={{ borderColor: "#E8E4DF" }}>
                  <span style={{ color: "#7B1C1C" }}>✓</span>
                  <span className="text-sm" style={{ color: "#0D1B2A", fontFamily: "var(--font-dm-sans)" }}>{item}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center" style={{ backgroundColor: "#0D1B2A" }}>
        <FadeIn>
          <h2 className="text-3xl font-light mb-4" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Own a Rental in St. Thomas?
          </h2>
          <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "#A0A0A0", fontFamily: "var(--font-dm-sans)" }}>
            We're actively growing our St. Thomas portfolio. Get a free rental estimate and management proposal.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 text-xs uppercase tracking-widest transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#7B1C1C", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
          >
            Get a Free Quote
          </Link>
        </FadeIn>
      </section>
    </div>
  );
}
