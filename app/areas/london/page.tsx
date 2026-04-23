import Link from "next/link";
import FadeIn from "@/components/animations/FadeIn";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Property Management in London, Ontario",
  description: "Professional property management in London, ON. Tenant screening, rent collection, maintenance, and more. Serving Old North, Byron, East London, and beyond.",
};

const stats = [
  { value: "1,550", label: "Avg. 1-bed rent" },
  { value: "1,900", label: "Avg. 2-bed rent" },
  { value: "3+", label: "Neighbourhoods served" },
  { value: "2–4 wks", label: "Avg. time to fill vacancy" },
];

const neighbourhoods = [
  { name: "Old North / Wortley Village", desc: "Premium rentals, mature trees, walkable to Richmond Row. Strong demand from professionals and families." },
  { name: "Byron / Lambeth", desc: "Southwest London's family-friendly corridor. Tenants here stay longer — great for stability-focused landlords." },
  { name: "East London", desc: "Affordable entry point with strong tenant demand from Fanshawe College students and young professionals." },
  { name: "Masonville / Medway", desc: "North London's prime area. Close to Western University and University Hospital — almost zero vacancy for well-priced units." },
  { name: "Downtown Core", desc: "Growing condo and apartment stock. Young professionals and remote workers are driving demand here." },
  { name: "White Oaks / South London", desc: "Diverse, affordable, close to transit. Consistent tenant demand year-round." },
];

const services = [
  { icon: "🔍", title: "Tenant Screening", desc: "Credit checks, income verification, criminal background, and landlord references — every time." },
  { icon: "💰", title: "Rent Collection", desc: "Online payments, monthly statements, and immediate follow-up on any late payments." },
  { icon: "🔧", title: "Maintenance Coordination", desc: "24/7 emergency line, trusted local contractors, zero markup on repairs." },
  { icon: "📋", title: "Lease Management", desc: "Ontario-compliant leases, renewals, rent increases served correctly and on time." },
  { icon: "📊", title: "Monthly Reporting", desc: "Clear financial statements every month. Know exactly what you earned and what was spent." },
  { icon: "🏠", title: "Property Inspections", desc: "Move-in, mid-lease, and move-out inspections with photo documentation." },
];

export default function LondonPage() {
  return (
    <div style={{ backgroundColor: "#FAF8F5" }} className="min-h-screen">
      {/* Hero */}
      <section
        className="pt-36 pb-24 px-6 text-center"
        style={{ backgroundColor: "#0D1B2A" }}
      >
        <FadeIn>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}>
            London, Ontario
          </p>
          <h1 className="text-5xl md:text-6xl font-light mb-6 max-w-3xl mx-auto leading-tight" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Property Management in London, Ontario
          </h1>
          <p className="text-lg max-w-xl mx-auto mb-10" style={{ color: "#A0A0A0", fontFamily: "var(--font-dm-sans)" }}>
            Hands-on management for London landlords — from tenant screening to rent collection to 24/7 maintenance. We handle everything so you don't have to.
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

      {/* Stats bar */}
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

      {/* Services */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl font-light text-center mb-4" style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}>
              Full-Service Management for London Landlords
            </h2>
            <p className="text-center text-sm mb-12 max-w-xl mx-auto" style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}>
              One flat rate, everything included. No hidden fees, no maintenance markups, no surprises.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <FadeIn key={s.title} delay={i * 0.08}>
                <div className="bg-white border p-6" style={{ borderColor: "#E8E4DF" }}>
                  <span className="text-2xl mb-3 block">{s.icon}</span>
                  <h3 className="text-lg font-medium mb-2" style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}>
                    {s.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}>
                    {s.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Neighbourhoods */}
      <section className="py-20 px-6" style={{ backgroundColor: "#F5F0EB" }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl font-light text-center mb-4" style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}>
              We Know London's Neighbourhoods
            </h2>
            <p className="text-center text-sm mb-12 max-w-xl mx-auto" style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}>
              Pricing, tenant profiles, and vacancy patterns differ by area. We use that knowledge to keep your unit full.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {neighbourhoods.map((n, i) => (
              <FadeIn key={n.name} delay={i * 0.06}>
                <div className="bg-white border p-5 flex gap-4" style={{ borderColor: "#E8E4DF" }}>
                  <div className="w-1 shrink-0 mt-1" style={{ backgroundColor: "#7B1C1C" }} />
                  <div>
                    <h3 className="font-medium mb-1" style={{ color: "#0D1B2A", fontFamily: "var(--font-dm-sans)" }}>
                      {n.name}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}>
                      {n.desc}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Market snapshot */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl font-light text-center mb-12" style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}>
              London Rental Market — 2026 Snapshot
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ fontFamily: "var(--font-dm-sans)" }}>
                <thead>
                  <tr style={{ backgroundColor: "#0D1B2A", color: "#FAF8F5" }}>
                    <th className="text-left p-4">Unit Type</th>
                    <th className="p-4 text-right">Low</th>
                    <th className="p-4 text-right">Average</th>
                    <th className="p-4 text-right">High</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { type: "Bachelor/Studio", low: "$1,050", avg: "$1,175", high: "$1,350" },
                    { type: "1 Bedroom", low: "$1,350", avg: "$1,525", high: "$1,800" },
                    { type: "2 Bedroom", low: "$1,650", avg: "$1,900", high: "$2,300" },
                    { type: "3 Bedroom", low: "$2,100", avg: "$2,450", high: "$2,950" },
                  ].map((row, i) => (
                    <tr key={row.type} style={{ backgroundColor: i % 2 === 0 ? "#FAF8F5" : "#F5F0EB" }}>
                      <td className="p-4 font-medium" style={{ color: "#0D1B2A" }}>{row.type}</td>
                      <td className="p-4 text-right" style={{ color: "#5A5A5A" }}>{row.low}</td>
                      <td className="p-4 text-right font-medium" style={{ color: "#0D1B2A" }}>{row.avg}</td>
                      <td className="p-4 text-right" style={{ color: "#5A5A5A" }}>{row.high}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center" style={{ backgroundColor: "#0D1B2A" }}>
        <FadeIn>
          <h2 className="text-3xl font-light mb-4" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Own a Rental in London, Ontario?
          </h2>
          <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "#A0A0A0", fontFamily: "var(--font-dm-sans)" }}>
            Let's talk about your property. Free consultation, honest assessment, no pressure.
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
