import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Rental Management London Ontario | Prospera Properties",
  description: "Professional student rental management in London, Ontario. We handle Western University and Fanshawe College properties — tenant placement, rent collection, maintenance, and LTB compliance.",
};

const benefits = [
  { title: "Guaranteed Rent Collection", desc: "We collect from multiple guarantors when needed. Student rentals don't have to mean chasing parents for rent." },
  { title: "Annual Tenant Turnover Handled", desc: "Most student leases flip every May. We handle re-listing, screening, and lease signing before the last tenant is even out." },
  { title: "Joint Lease Structuring", desc: "Multiple students, one lease — structured correctly to protect you legally and make rent collection clean." },
  { title: "Damage Protection Protocol", desc: "Move-in/move-out inspections with full photo documentation. We fight for your deposit deductions when needed." },
  { title: "Western & Fanshawe Market Knowledge", desc: "We know which months to list, what rents to charge near each campus, and what student tenants actually look for." },
  { title: "LTB Compliant at Every Step", desc: "N-forms served correctly, Ontario Standard Lease used every time. No shortcuts that expose you to risk." },
];

const faqs = [
  { q: "Is student rental management different from regular property management?", a: "Yes. Student rentals involve higher turnover (usually every 12 months), joint tenancies with multiple leaseholders, and a specific leasing season (January–March for September move-ins). We manage the full cycle." },
  { q: "Do you require guarantors for student tenants?", a: "Yes. We require a co-signer or guarantor for student tenants who don't meet income thresholds. This protects you if rent stops coming in." },
  { q: "What areas near Western University and Fanshawe do you cover?", a: "We manage student rentals in Masonville, Medway, Old North, Broughdale, and East London near Fanshawe. If your property is within 3km of either campus, we can manage it." },
  { q: "What do you charge for student rental management?", a: "Our management fee is 10% of monthly rent, plus a one-month leasing fee when we place tenants. No markup on maintenance. See our pricing page for full details." },
  { q: "What if a student stops paying rent?", a: "We serve the N4 notice immediately — within 7 days of a missed payment. We don't wait. If arrears continue, we file the L1 application with the LTB." },
];

export default function StudentRentalManagementPage() {
  return (
    <div style={{ backgroundColor: "#F7F5F2" }} className="min-h-screen">
      {/* Hero */}
      <section className="pt-36 pb-24 px-6" style={{ backgroundColor: "#1F2F3A" }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)" }}>
            Service · London, Ontario
          </p>
          <h1 className="text-5xl md:text-6xl font-light mb-6 leading-tight" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Student Rental Management<br />London Ontario
          </h1>
          <p className="text-lg max-w-2xl leading-relaxed mb-10" style={{ color: "rgba(250,248,245,0.8)", fontFamily: "var(--font-dm-sans)" }}>
            We manage student rentals near Western University and Fanshawe College — handling the full annual cycle so you never have to think about turnover season.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/contact" className="px-8 py-4 text-xs uppercase tracking-widest" style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>
              Get a Free Consultation →
            </Link>
            <Link href="/pricing" className="px-8 py-4 text-xs uppercase tracking-widest border" style={{ borderColor: "rgba(250,248,245,0.3)", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Why student rentals are different */}
      <section className="py-20 px-6" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-light mb-6" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
            Student Rentals Require a Different Approach
          </h2>
          <p className="text-base leading-relaxed mb-4" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
            London has two major post-secondary institutions — Western University and Fanshawe College — driving consistent demand for rental housing. But student rentals come with challenges that regular residential properties don't: annual turnover, joint tenancies, guarantor requirements, and a concentrated leasing season that runs January through March.
          </p>
          <p className="text-base leading-relaxed" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
            Most landlords self-managing student properties spend weeks every winter scrambling to re-list and re-screen. Prospera handles the entire cycle — from listing in January to keys-in-hand in September — so you don't have to be involved at all.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-light mb-12 text-center" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
            What We Handle
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((b) => (
              <div key={b.title} className="p-6 bg-white rounded-xl" style={{ border: "1px solid #D8D2C8" }}>
                <h3 className="text-lg font-medium mb-3" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>{b.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Local stats */}
      <section className="py-16 px-6" style={{ backgroundColor: "#1F2F3A" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "40,000+", label: "Western students" },
            { value: "6,000+", label: "Fanshawe students" },
            { value: "Sept 1", label: "Peak move-in date" },
            { value: "Jan–Mar", label: "Leasing season" },
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
            Stop Managing Turnover Season Yourself
          </h2>
          <p className="text-base mb-8" style={{ color: "rgba(250,248,245,0.8)", fontFamily: "var(--font-dm-sans)" }}>
            Let Prospera handle the full student rental cycle. Free consultation, no obligation.
          </p>
          <Link href="/contact" className="inline-block px-10 py-4 text-xs uppercase tracking-widest" style={{ backgroundColor: "#FAF8F5", color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>
            Book a Free Consultation →
          </Link>
          <p className="mt-4 text-sm" style={{ color: "rgba(250,248,245,0.6)", fontFamily: "var(--font-dm-sans)" }}>
            Or call (519) 697-1227
          </p>
        </div>
      </section>
    </div>
  );
}
