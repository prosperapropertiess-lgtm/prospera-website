import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Airbnb Management London Ontario | Prospera Properties",
  description: "Full-service Airbnb and short-term rental management in London, Ontario. We handle listings, guest communication, cleaning coordination, and compliance with London's short-term rental bylaws.",
};

const services = [
  { title: "Listing Optimization", desc: "Professional photography, SEO-optimized titles, and dynamic pricing to maximize your occupancy rate and nightly rate." },
  { title: "Guest Communication", desc: "24/7 guest messaging — check-in instructions, local recommendations, issue resolution. We handle every guest interaction." },
  { title: "Cleaning Coordination", desc: "Vetted local cleaners dispatched after every checkout. Linen service, restocking supplies, and quality checks built in." },
  { title: "Dynamic Pricing", desc: "We adjust nightly rates based on local events, seasonality, and demand signals — so you're never leaving revenue on the table." },
  { title: "London Bylaw Compliance", desc: "London has specific short-term rental registration requirements. We ensure your property is registered correctly and stays compliant." },
  { title: "Maintenance & Repairs", desc: "Fast response to guest-reported issues. Local contractors on call. Your property stays in top condition between stays." },
];

const faqs = [
  { q: "Is Airbnb management legal in London, Ontario?", a: "Yes, with proper registration. London requires short-term rental operators to register with the city. We handle the registration process and ensure ongoing bylaw compliance for every property we manage." },
  { q: "What percentage do you charge for Airbnb management?", a: "Our short-term rental management fee is 20% of gross revenue. This covers listing management, guest communication, cleaning coordination, and compliance monitoring. No hidden fees." },
  { q: "Can I switch between short-term and long-term rental?", a: "Yes. We can help you evaluate whether Airbnb or long-term tenancy makes more sense for your property and location, and manage either approach or a seasonal hybrid." },
  { q: "Do you manage properties on platforms other than Airbnb?", a: "Yes — we list on Airbnb, VRBO, and Booking.com simultaneously to maximize exposure and occupancy. All bookings are managed through one system." },
  { q: "How do you handle damage from guests?", a: "We document every check-in and check-out with photos. For damage exceeding the cleaning deposit, we file claims through the platform's host guarantee programs and work with your insurance provider." },
  { q: "What neighbourhoods in London work best for short-term rentals?", a: "Downtown London, Old North, Wortley Village, and areas near Western University perform consistently well. We'll give you an honest occupancy and revenue estimate before you commit." },
];

export default function AirbnbManagementPage() {
  return (
    <div style={{ backgroundColor: "#F7F5F2" }} className="min-h-screen">
      {/* Hero */}
      <section className="pt-36 pb-24 px-6" style={{ backgroundColor: "#1F2F3A" }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)" }}>
            Service · London, Ontario
          </p>
          <h1 className="text-5xl md:text-6xl font-light mb-6 leading-tight" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Airbnb Management<br />London Ontario
          </h1>
          <p className="text-lg max-w-2xl leading-relaxed mb-10" style={{ color: "rgba(250,248,245,0.8)", fontFamily: "var(--font-dm-sans)" }}>
            Full-service short-term rental management in London, Ontario. We handle everything from listing to guest checkout — bylaw compliant, hands-off for you.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/contact" className="px-8 py-4 text-xs uppercase tracking-widest" style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>
              Get a Revenue Estimate →
            </Link>
            <Link href="/pricing" className="px-8 py-4 text-xs uppercase tracking-widest border" style={{ borderColor: "rgba(250,248,245,0.3)", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 px-6" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-light mb-4" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
            Everything Handled, Nothing Left to You
          </h2>
          <p className="text-base mb-12 max-w-2xl" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
            Short-term rental management requires more active work than long-term rentals. We handle the full operation so your Airbnb runs like a business without taking your time.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((s) => (
              <div key={s.title} className="p-6 rounded-xl" style={{ border: "1px solid #D8D2C8", backgroundColor: "#F7F5F2" }}>
                <h3 className="text-lg font-medium mb-2" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6" style={{ backgroundColor: "#1F2F3A" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "20%", label: "Management fee" },
            { value: "3", label: "Platforms listed" },
            { value: "24/7", label: "Guest support" },
            { value: "Bylaw", label: "Compliant" },
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
            Find Out What Your Property Could Earn
          </h2>
          <p className="text-base mb-8" style={{ color: "rgba(250,248,245,0.8)", fontFamily: "var(--font-dm-sans)" }}>
            Free revenue estimate. No obligation. We'll tell you honestly whether Airbnb makes sense for your property.
          </p>
          <Link href="/contact" className="inline-block px-10 py-4 text-xs uppercase tracking-widest" style={{ backgroundColor: "#FAF8F5", color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>
            Get a Free Revenue Estimate →
          </Link>
          <p className="mt-4 text-sm" style={{ color: "rgba(250,248,245,0.6)", fontFamily: "var(--font-dm-sans)" }}>
            Or call (519) 697-1227
          </p>
        </div>
      </section>
    </div>
  );
}
