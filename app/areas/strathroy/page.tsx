import Link from "next/link";
import FadeIn from "@/components/animations/FadeIn";
import BlogNudge from "@/components/ui/BlogNudge";
import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Property Management in Strathroy, Ontario",
  description: "Professional property management in Strathroy, ON. Affordable rentals, stable tenant demand, and strong cash flow for landlords. Serving Downtown, West Strathroy, and surrounding areas.",
};

const stats = [
  { value: "$1,150", label: "Avg. 1-bed rent" },
  { value: "$1,400", label: "Avg. 2-bed rent" },
  { value: "Low", label: "Vacancy rate" },
  { value: "30 min", label: "Drive to London" },
];

const neighbourhoods = [
  { name: "Downtown Strathroy", desc: "The walkable core — affordable rents, shops, and hospital. Strong demand from families and trades workers year-round." },
  { name: "West Strathroy", desc: "Newer subdivisions, great schools, and family tenants who stay for years. Ideal for landlords who want low turnover." },
  { name: "Caradoc / Rural", desc: "Larger properties and acreages with growing appeal from remote workers and retirees seeking space at an affordable price." },
];

const services = [
  { icon: "🔍", title: "Tenant Screening", desc: "Credit checks, income verification, criminal background, and landlord references — every time." },
  { icon: "💰", title: "Rent Collection", desc: "Online payments, monthly statements, and immediate follow-up on any late payments." },
  { icon: "🔧", title: "Maintenance Coordination", desc: "Trusted local contractors, 24/7 emergency line, and zero markup on repairs." },
  { icon: "📋", title: "Lease Management", desc: "Ontario-compliant leases, renewals, and rent increases handled correctly and on time." },
  { icon: "📊", title: "Monthly Reporting", desc: "Clear financial statements every month. Know exactly what you earned and what was spent." },
  { icon: "🏠", title: "Property Inspections", desc: "Move-in, mid-lease, and move-out inspections with photo documentation." },
];

const schema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Prospera Properties",
  description: "Property management in Strathroy, Ontario",
  url: "https://www.prosperaproperties.co/areas/strathroy",
  telephone: "+15196971227",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Strathroy",
    addressRegion: "Ontario",
    addressCountry: "CA",
  },
  areaServed: { "@type": "Place", name: "Strathroy, Ontario" },
};

export default function StroathroyPage() {
  return (
    <div style={{ backgroundColor: "#F7F5F2" }}>
      <JsonLd data={schema} />

      {/* Hero */}
      <section className="pt-36 pb-24 px-6 text-center" style={{ backgroundColor: "#1F2F3A" }}>
        <FadeIn>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "rgba(250,248,245,0.55)", fontFamily: "var(--font-dm-sans)" }}>
            Strathroy, Ontario
          </p>
          <h1 className="text-5xl md:text-6xl font-light mb-6 max-w-3xl mx-auto leading-tight" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Property Management in Strathroy, Ontario
          </h1>
          <p className="text-lg max-w-xl mx-auto mb-10" style={{ color: "rgba(250,248,245,0.65)", fontFamily: "var(--font-dm-sans)" }}>
            Strathroy offers what London can&apos;t — affordability, stability, and strong cash flow. We handle the day-to-day so you don&apos;t have to.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 text-xs uppercase tracking-widest transition-opacity hover:opacity-80 rounded"
            style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
          >
            Get a Free Estimate
          </Link>
        </FadeIn>
      </section>

      {/* Stats bar */}
      <section className="py-12 px-6" style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #D8D2C8" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-light mb-1" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>{s.value}</p>
              <p className="text-xs uppercase tracking-widest" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="py-20 px-6" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl font-light text-center mb-4" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              Full-Service Management for Strathroy Landlords
            </h2>
            <p className="text-center text-sm mb-12 max-w-xl mx-auto" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
              One flat rate. Everything included. No hidden fees, no maintenance markups.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {services.map((s, i) => (
              <FadeIn key={s.title} delay={i * 0.08}>
                <div className="bg-white border p-6 rounded-xl" style={{ borderColor: "#D8D2C8", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <span className="text-2xl mb-3 block">{s.icon}</span>
                  <h3 className="text-lg font-medium mb-2" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Neighbourhoods */}
      <section className="py-20 px-6" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl font-light text-center mb-4" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              We Know Strathroy&apos;s Neighbourhoods
            </h2>
            <p className="text-center text-sm mb-12 max-w-xl mx-auto" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
              Pricing and tenant profiles differ by area. We use that knowledge to keep your unit full.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {neighbourhoods.map((n, i) => (
              <FadeIn key={n.name} delay={i * 0.06}>
                <div className="bg-[#F7F5F2] border p-5 flex gap-4 rounded-xl" style={{ borderColor: "#D8D2C8" }}>
                  <div className="w-1 shrink-0 mt-1 rounded-full" style={{ backgroundColor: "#8B2030" }} />
                  <div>
                    <h3 className="font-medium mb-1" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>{n.name}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>{n.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Market snapshot */}
      <section className="py-20 px-6" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl font-light text-center mb-12" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              Strathroy Rental Market — 2026 Snapshot
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "#D8D2C8", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <table className="w-full text-sm" style={{ fontFamily: "var(--font-dm-sans)" }}>
                <thead>
                  <tr style={{ backgroundColor: "#1F2F3A", color: "#FAF8F5" }}>
                    <th className="text-left p-4">Unit Type</th>
                    <th className="p-4 text-right">Low</th>
                    <th className="p-4 text-right">Average</th>
                    <th className="p-4 text-right">High</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { type: "Bachelor/Studio", low: "$875", avg: "$975", high: "$1,100" },
                    { type: "1 Bedroom", low: "$1,050", avg: "$1,175", high: "$1,350" },
                    { type: "2 Bedroom", low: "$1,250", avg: "$1,425", high: "$1,650" },
                    { type: "3 Bedroom", low: "$1,550", avg: "$1,750", high: "$2,050" },
                  ].map((row, i) => (
                    <tr key={row.type} style={{ backgroundColor: i % 2 === 0 ? "#FFFFFF" : "#F7F5F2" }}>
                      <td className="p-4 font-medium" style={{ color: "#222222" }}>{row.type}</td>
                      <td className="p-4 text-right" style={{ color: "#999999" }}>{row.low}</td>
                      <td className="p-4 text-right font-semibold" style={{ color: "#8B2030" }}>{row.avg}</td>
                      <td className="p-4 text-right" style={{ color: "#999999" }}>{row.high}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Blog nudge */}
      <section className="py-10 px-6" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-4">
          <BlogNudge
            hook="Small town, big landlord mistakes. Here's how to avoid them."
            title="First-Time Landlord Tips in London, Ontario"
            excerpt="The same principles apply in Strathroy — but with a tighter tenant pool, getting screening right is even more important."
            slug="first-time-landlord-tips-london-ontario"
            label="Landlord Guide"
          />
          <BlogNudge
            hook="Know your legal obligations before your tenant does."
            title="Landlord Maintenance Responsibilities in Ontario"
            excerpt="What you're legally required to fix, how fast, and what happens if you don't. Applies to every rental in Ontario."
            slug="landlord-maintenance-responsibilities-ontario"
            label="Ontario Law"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center" style={{ backgroundColor: "#1F2F3A" }}>
        <FadeIn>
          <h2 className="text-3xl font-light mb-4" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Own a Rental in Strathroy?
          </h2>
          <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "rgba(250,248,245,0.6)", fontFamily: "var(--font-dm-sans)" }}>
            Let&apos;s talk about your property. Free consultation, honest assessment, no pressure.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 text-xs uppercase tracking-widest transition-opacity hover:opacity-80 rounded"
            style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
          >
            Get a Free Quote
          </Link>
        </FadeIn>
      </section>
    </div>
  );
}
