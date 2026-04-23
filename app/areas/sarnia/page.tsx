import Link from "next/link";
import FadeIn from "@/components/animations/FadeIn";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Property Management in Sarnia, Ontario",
  description: "Professional property management in Sarnia, ON. Serving landlords near St. Clair College, the industrial corridor, and surrounding neighbourhoods.",
};

const stats = [
  { value: "$1,100", label: "Avg. 1-bed rent" },
  { value: "$1,400", label: "Avg. 2-bed rent" },
  { value: "Low", label: "Vacancy rate" },
  { value: "Stable", label: "Market outlook" },
];

const tenantProfiles = [
  { icon: "⚗️", title: "Industrial Workers", desc: "Sarnia's Chemical Valley is one of the largest petrochemical complexes in North America. These tenants are stable, well-paid, and long-term." },
  { icon: "🎓", title: "St. Clair College Students", desc: "Consistent demand near the college campus. Student leases tend to follow the academic year — plan vacancy accordingly." },
  { icon: "🏠", title: "Retirees & Long-Term Renters", desc: "Sarnia has a significant retiree population who prefer to rent quality homes rather than manage a property. Low turnover, reliable income." },
  { icon: "🏥", title: "Healthcare Professionals", desc: "Bluewater Health and surrounding clinics attract nurses, technicians, and administrators who are consistently stable tenants." },
];

export default function SarniaPage() {
  return (
    <div style={{ backgroundColor: "#FAF8F5" }} className="min-h-screen">
      {/* Hero */}
      <section className="pt-36 pb-24 px-6 text-center" style={{ backgroundColor: "#0D1B2A" }}>
        <FadeIn>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}>
            Sarnia, Ontario
          </p>
          <h1 className="text-5xl md:text-6xl font-light mb-6 max-w-3xl mx-auto leading-tight" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Property Management in Sarnia, Ontario
          </h1>
          <p className="text-lg max-w-xl mx-auto mb-10" style={{ color: "#A0A0A0", fontFamily: "var(--font-dm-sans)" }}>
            Sarnia's rental market rewards patient landlords. Strong tenant base, low turnover, and steady demand from the industrial sector.
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

      {/* Tenant profiles */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl font-light text-center mb-4" style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}>
              Who Rents in Sarnia
            </h2>
            <p className="text-center text-sm mb-12 max-w-xl mx-auto" style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}>
              Understanding your tenant base is the key to pricing and marketing your property correctly.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tenantProfiles.map((p, i) => (
              <FadeIn key={p.title} delay={i * 0.08}>
                <div className="bg-white border p-6" style={{ borderColor: "#E8E4DF" }}>
                  <span className="text-2xl mb-3 block">{p.icon}</span>
                  <h3 className="text-lg font-medium mb-2" style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}>
                    {p.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}>
                    {p.desc}
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
              Sarnia Rental Market — 2026
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
                    { type: "1 Bedroom", avg: "$1,100" },
                    { type: "2 Bedroom", avg: "$1,400" },
                    { type: "3 Bedroom", avg: "$1,750" },
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

      {/* Why Prospera in Sarnia */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl font-light text-center mb-6" style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}>
              Why Sarnia Landlords Work With Prospera
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="space-y-4">
              {[
                "We know Sarnia's specific rental market dynamics — not just London's numbers applied here.",
                "We screen for the industrial and healthcare tenant profiles that perform well in this market.",
                "We have trusted local contractors for maintenance — no sending someone from London.",
                "We handle the full LTB process if issues arise — Sarnia has its own tribunal backlog patterns we know well.",
                "All management is personal — you talk to Ebin directly, not a call centre.",
              ].map((point, i) => (
                <div key={i} className="flex gap-4 items-start bg-white border p-4" style={{ borderColor: "#E8E4DF" }}>
                  <span className="text-sm mt-0.5" style={{ color: "#7B1C1C" }}>✓</span>
                  <p className="text-sm leading-relaxed" style={{ color: "#2C2C2C", fontFamily: "var(--font-dm-sans)" }}>{point}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center" style={{ backgroundColor: "#0D1B2A" }}>
        <FadeIn>
          <h2 className="text-3xl font-light mb-4" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Own a Rental in Sarnia?
          </h2>
          <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "#A0A0A0", fontFamily: "var(--font-dm-sans)" }}>
            We're always open to taking on well-maintained Sarnia properties. Let's talk.
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
