import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rent Collection Services London Ontario | Prospera Properties",
  description: "Reliable rent collection services for London, St. Thomas, and Strathroy landlords. We collect rent, enforce leases, serve N4 notices, and file LTB applications — so you never chase a tenant again.",
};

const features = [
  { title: "Pre-Authorized Debit Setup", desc: "We set up pre-authorized debit for every tenancy from day one. Rent comes in automatically on the 1st — no tenant transfers, no e-transfers to chase." },
  { title: "Late Rent Monitoring", desc: "We flag missed payments the day they're late. You're notified immediately. Nothing sits unreported." },
  { title: "N4 Notices Served Immediately", desc: "If rent isn't received within 7 days, we serve the N4 notice — the mandatory first step before filing with the LTB. No waiting, no second chances." },
  { title: "LTB Application Filing", desc: "If arrears continue after the N4, we file the L1 application with the Landlord and Tenant Board on your behalf. We know the process and the paperwork." },
  { title: "Detailed Owner Statements", desc: "Monthly statements showing all rent received, deductions, and maintenance costs — clear, accurate, delivered on the 5th of each month." },
  { title: "Arrears Recovery Support", desc: "If a tenant owes back rent, we document everything and support your claim through mediation or LTB hearing. Paper trail starts at day one." },
];

const faqs = [
  { q: "What happens if a tenant doesn't pay rent?", a: "We flag the missed payment immediately. If rent isn't received within 7 days, we serve an N4 notice — the mandatory first step under the Residential Tenancies Act. If they don't pay or vacate by the termination date, we file the L1 application with the LTB." },
  { q: "How do you collect rent from tenants?", a: "We set up pre-authorized debit from the start of every tenancy. Rent is pulled automatically on the 1st. We don't rely on tenants to initiate transfers." },
  { q: "Do you handle partial payments?", a: "Yes — we record all partial payments and apply them correctly. A partial payment doesn't restart the N4 clock under the RTA. We handle this correctly so you don't lose your legal standing." },
  { q: "What's included in the monthly owner statement?", a: "Gross rent collected, management fee, any approved maintenance costs, and net amount forwarded to you. Clear line-by-line breakdown, delivered on the 5th of each month." },
  { q: "Can you help recover arrears from a former tenant?", a: "Yes. We can assist with Small Claims Court filings for arrears after a tenancy ends. We maintain the documentation trail you'll need — payment records, notices served, and LTB decisions." },
  { q: "Do you charge extra for serving N4 notices or filing LTB applications?", a: "N4 notices are included in management. LTB application filing is a flat $150 administrative fee — just to cover our time on the paperwork. No markup on filing fees." },
];

export default function RentCollectionPage() {
  return (
    <div style={{ backgroundColor: "#F7F5F2" }} className="min-h-screen">
      {/* Hero */}
      <section className="pt-36 pb-24 px-6" style={{ backgroundColor: "#1F2F3A" }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)" }}>
            Service · London, St. Thomas & Strathroy
          </p>
          <h1 className="text-5xl md:text-6xl font-light mb-6 leading-tight" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Rent Collection Services<br />London Ontario
          </h1>
          <p className="text-lg max-w-2xl leading-relaxed mb-10" style={{ color: "rgba(250,248,245,0.8)", fontFamily: "var(--font-dm-sans)" }}>
            We collect rent, enforce leases, and handle arrears — so you stop chasing tenants and start receiving reliable monthly deposits.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/contact" className="px-8 py-4 text-xs uppercase tracking-widest" style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>
              Get Started →
            </Link>
            <Link href="/pricing" className="px-8 py-4 text-xs uppercase tracking-widest border" style={{ borderColor: "rgba(250,248,245,0.3)", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Problem statement */}
      <section className="py-20 px-6" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-light mb-6" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
            Late Rent Is Expensive. Chasing It Is Worse.
          </h2>
          <p className="text-base leading-relaxed mb-4" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
            In Ontario, collecting late rent isn't just uncomfortable — it requires strict legal compliance. Accepting a partial payment at the wrong time can void your N4 notice. Missing the 7-day window to serve the notice resets the clock. Small procedural errors cost you weeks at the LTB.
          </p>
          <p className="text-base leading-relaxed" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
            We set up automated collection from day one and enforce the RTA timeline exactly — so you never lose your legal standing and you never have an awkward conversation with a tenant about money.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-light mb-12 text-center" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
            How We Handle Rent Collection
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="p-6 bg-white rounded-xl" style={{ border: "1px solid #D8D2C8" }}>
                <h3 className="text-lg font-medium mb-3" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6" style={{ backgroundColor: "#1F2F3A" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "Day 1", label: "PAD setup" },
            { value: "7 days", label: "N4 notice window" },
            { value: "5th", label: "Statement delivered" },
            { value: "$150", label: "LTB filing fee" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-light mb-1" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>{s.value}</p>
              <p className="text-xs uppercase tracking-wider" style={{ color: "rgba(250,248,245,0.75)", fontFamily: "var(--font-dm-sans)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 px-6" style={{ backgroundColor: "#FFFFFF" }}>
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
            Stop Chasing Rent. Start Receiving It.
          </h2>
          <p className="text-base mb-8" style={{ color: "rgba(250,248,245,0.8)", fontFamily: "var(--font-dm-sans)" }}>
            We handle collection, notices, and LTB filings. You get a clean monthly deposit.
          </p>
          <Link href="/contact" className="inline-block px-10 py-4 text-xs uppercase tracking-widest" style={{ backgroundColor: "#FAF8F5", color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>
            Talk to Us →
          </Link>
          <p className="mt-4 text-sm" style={{ color: "rgba(250,248,245,0.6)", fontFamily: "var(--font-dm-sans)" }}>
            Or call (519) 697-1227
          </p>
        </div>
      </section>
    </div>
  );
}
