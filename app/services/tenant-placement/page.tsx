import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tenant Placement Services London Ontario | Prospera Properties",
  description: "Professional tenant placement in London, St. Thomas, and Strathroy, Ontario. We find, screen, and place quality tenants — credit checks, income verification, references, and Ontario-compliant lease signing.",
};

const steps = [
  { n: "01", title: "Market Pricing", desc: "We analyze comparable active listings and recent placements to set a rent that fills fast without leaving money on the table." },
  { n: "02", title: "Professional Listing", desc: "Photos, compelling description, and syndication to all major platforms — Kijiji, Rentals.ca, Facebook Marketplace, and more." },
  { n: "03", title: "Applicant Screening", desc: "Full credit check, income verification (2.5–3× rent minimum), criminal background check, and direct calls to previous landlords." },
  { n: "04", title: "OHRC-Compliant Selection", desc: "We select tenants using documented, defensible criteria that comply with the Ontario Human Rights Code — protecting you from HRTO complaints." },
  { n: "05", title: "Lease Signing", desc: "Ontario Standard Lease, all required schedules, and any custom clauses — signed digitally or in person." },
  { n: "06", title: "Move-In Inspection", desc: "Full property inspection with timestamped photos before the tenant takes possession. Your protection if damage claims arise later." },
];

const faqs = [
  { q: "What does tenant placement cost?", a: "Contact us for a quote. Our fee covers everything from listing to lease signing and move-in inspection — no hidden fees." },
  { q: "How long does it take to find a tenant?", a: "Most properties are tenanted within 2–4 weeks. Pricing and property condition are the two biggest factors. We'll give you an honest assessment upfront." },
  { q: "Do you do a full credit and background check on every applicant?", a: "Yes, every time — no exceptions. We use a third-party screening service for credit checks and income verification, and we call previous landlords directly." },
  { q: "What if the tenant doesn't work out?", a: "If we place a tenant who leaves within 90 days without cause, we'll re-place at no additional leasing fee. We stand behind our placements." },
  { q: "Can I use tenant placement only, without full management?", a: "Yes. Tenant placement is available as a standalone service. We place the tenant, hand over the file, and you take it from there." },
  { q: "Are you OHRC-compliant in how you screen?", a: "Yes. We use documented, objective screening criteria — income, credit, references — and never reject applicants based on protected grounds like source of income (ODSP/OW), race, or family status." },
];

export default function TenantPlacementPage() {
  return (
    <div style={{ backgroundColor: "#F7F5F2" }} className="min-h-screen">
      {/* Hero */}
      <section className="pt-36 pb-24 px-6" style={{ backgroundColor: "#1F2F3A" }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)" }}>
            Service · London, St. Thomas & Strathroy
          </p>
          <h1 className="text-5xl md:text-6xl font-light mb-6 leading-tight" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Tenant Placement Services<br />London Ontario
          </h1>
          <p className="text-lg max-w-2xl leading-relaxed mb-10" style={{ color: "rgba(250,248,245,0.8)", fontFamily: "var(--font-dm-sans)" }}>
            We find, screen, and place quality tenants for your London, St. Thomas, or Strathroy rental — handling everything from listing to move-in inspection.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/contact" className="px-8 py-4 text-xs uppercase tracking-widest" style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>
              Get Started →
            </Link>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 px-6" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-light mb-12" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
            Our Placement Process
          </h2>
          <div className="space-y-8">
            {steps.map((s) => (
              <div key={s.n} className="flex gap-6">
                <span className="text-3xl font-light flex-shrink-0 w-12" style={{ color: "#8B2030", fontFamily: "var(--font-cormorant)" }}>{s.n}</span>
                <div>
                  <h3 className="text-lg font-medium mb-1" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6" style={{ backgroundColor: "#1F2F3A" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "2–4 wks", label: "Avg. time to fill" },
            { value: "100%", label: "Credit checked" },
            { value: "3×", label: "Income threshold" },
            { value: "90-day", label: "Re-placement guarantee" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-light mb-1" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>{s.value}</p>
              <p className="text-xs uppercase tracking-wider" style={{ color: "rgba(250,248,245,0.75)", fontFamily: "var(--font-dm-sans)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 px-6" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-light mb-12" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((f) => (
              <div key={f.q} className="pb-6 border-b" style={{ borderColor: "#D8D2C8" }}>
                <h3 className="text-base font-medium mb-2" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>{f.q}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6" style={{ backgroundColor: "#8B2030" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-light mb-4" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Ready to Fill Your Vacancy?
          </h2>
          <p className="text-base mb-8" style={{ color: "rgba(250,248,245,0.8)", fontFamily: "var(--font-dm-sans)" }}>
            One flat fee. Quality tenant. Move-in inspection included.
          </p>
          <Link href="/contact" className="inline-block px-10 py-4 text-xs uppercase tracking-widest" style={{ backgroundColor: "#FAF8F5", color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>
            Get a Free Rental Assessment →
          </Link>
          <p className="mt-4 text-sm" style={{ color: "rgba(250,248,245,0.6)", fontFamily: "var(--font-dm-sans)" }}>
            Or call (519) 697-1227
          </p>
        </div>
      </section>
    </div>
  );
}
