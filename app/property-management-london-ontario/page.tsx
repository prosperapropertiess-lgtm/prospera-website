import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Property Management London Ontario | Prospera Properties",
  description:
    "Prospera Properties is a property management company and rental agency in London, Ontario. We handle tenant screening, rent collection, maintenance, and leasing, so you don't have to.",
  openGraph: {
    title: "Property Management London Ontario | Prospera Properties",
    description:
      "London Ontario's trusted property management company. Tenant screening, rent collection, maintenance, and full landlord services.",
    url: "https://www.prosperaproperties.co/property-management-london-ontario",
    siteName: "Prospera Properties",
  },
  alternates: {
    canonical: "https://www.prosperaproperties.co/property-management-london-ontario",
  },
};

const SERVICES = [
  {
    title: "Tenant Screening",
    desc: "Credit checks, income verification, rental history, and reference calls. Every applicant vetted before they step through your door.",
  },
  {
    title: "Rent Collection",
    desc: "Online payments, automated reminders, and consistent enforcement. Late rent gets chased — not ignored.",
  },
  {
    title: "Maintenance Coordination",
    desc: "24-hour acknowledgement on every request. We manage the contractors, track the work, and send you the invoice.",
  },
  {
    title: "Leasing & Vacancy Fill",
    desc: "Professional photos, listings on Kijiji and Facebook, showings scheduled and conducted. We fill vacancies fast.",
  },
  {
    title: "Lease Management",
    desc: "Ontario Standard Lease, renewals, N-forms, and LTB filings handled correctly. No guesswork.",
  },
  {
    title: "Owner Reporting",
    desc: "Monthly statements, maintenance logs, and direct access to Ebin — not a ticket queue.",
  },
];

const FAQS = [
  {
    q: "What areas do you serve around London, Ontario?",
    a: "We manage properties in London, St. Thomas, Strathroy, and surrounding communities within roughly 45 minutes of London.",
  },
  {
    q: "How much does property management cost in London, Ontario?",
    a: "Our fees depend on the property and services required. Contact us for a straight answer — no pressure.",
  },
  {
    q: "Do you manage single-family homes or just apartment buildings?",
    a: "Both. We work with landlords who own one property and those who own several. Single-family homes, duplexes, townhouses, and small multi-unit buildings.",
  },
  {
    q: "How quickly can you fill a vacant unit in London, Ontario?",
    a: "Average vacancy fill is under 30 days when the unit is priced correctly and marketed properly. We'll tell you upfront if we think pricing is off.",
  },
  {
    q: "What happens if a tenant stops paying rent?",
    a: "We serve the appropriate N4 notice, pursue the L1 application at the LTB, and keep you informed throughout. We handle the paperwork — you don't have to learn Ontario eviction law.",
  },
];

export default function PropertyManagementLondonPage() {
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Property Management London Ontario",
        "provider": {
          "@type": ["LocalBusiness", "RealEstateAgent"],
          "name": "Prospera Properties",
          "url": "https://www.prosperaproperties.co",
          "telephone": "+15196971227",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "London",
            "addressRegion": "ON",
            "addressCountry": "CA"
          }
        },
        "areaServed": {
          "@type": "City",
          "name": "London",
          "sameAs": "https://en.wikipedia.org/wiki/London,_Ontario"
        },
        "description": "Property management services in London, Ontario — tenant screening, rent collection, maintenance coordination, leasing, and landlord support.",
        "url": "https://www.prosperaproperties.co/property-management-london-ontario"
      }} />

      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": FAQS.map(({ q, a }) => ({
          "@type": "Question",
          "name": q,
          "acceptedAnswer": { "@type": "Answer", "text": a }
        }))
      }} />

      <div style={{ backgroundColor: "#F7F5F2", minHeight: "100vh" }}>

        {/* Hero */}
        <section style={{ backgroundColor: "#1F2F3A", padding: "80px 24px 60px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(250,248,245,0.5)", marginBottom: 16, fontFamily: "var(--font-dm-sans)" }}>
              London, Ontario
            </p>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 54px)", fontWeight: 700, color: "#FAF8F5", lineHeight: 1.1, marginBottom: 20, fontFamily: "var(--font-dm-sans)" }}>
              Property Management<br />in London, Ontario
            </h1>
            <p style={{ fontSize: 18, color: "rgba(250,248,245,0.75)", lineHeight: 1.7, marginBottom: 32, maxWidth: 580, fontFamily: "var(--font-dm-sans)" }}>
              We manage rental properties in London and the surrounding area so landlords can stop dealing with the day-to-day. Tenant screening, rent collection, maintenance, all of it.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link
                href="/contact"
                style={{ backgroundColor: "#8B2030", color: "#FAF8F5", padding: "14px 28px", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none", display: "inline-block" }}
              >
                Get a Free Consultation
              </Link>
              <Link
                href="/listings"
                style={{ backgroundColor: "transparent", color: "rgba(250,248,245,0.7)", border: "1px solid rgba(250,248,245,0.2)", padding: "14px 28px", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none", display: "inline-block" }}
              >
                View Available Rentals
              </Link>
            </div>
          </div>
        </section>

        {/* Services */}
        <section style={{ padding: "64px 24px", maxWidth: 900, margin: "0 auto" }}>
          <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#999999", marginBottom: 12, fontFamily: "var(--font-dm-sans)" }}>
            What We Handle
          </p>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 700, color: "#1F2F3A", marginBottom: 40, fontFamily: "var(--font-dm-sans)" }}>
            Full-Service Property Management in London, Ontario
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {SERVICES.map((s) => (
              <div key={s.title} style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E1DC", borderRadius: 12, padding: "24px" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1F2F3A", marginBottom: 8, fontFamily: "var(--font-dm-sans)" }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: "#555555", lineHeight: 1.65, margin: 0, fontFamily: "var(--font-dm-sans)" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why Prospera */}
        <section style={{ backgroundColor: "#FFFFFF", padding: "64px 24px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#999999", marginBottom: 12, fontFamily: "var(--font-dm-sans)" }}>
              Why Landlords Choose Us
            </p>
            <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 700, color: "#1F2F3A", marginBottom: 20, fontFamily: "var(--font-dm-sans)" }}>
              A property management company that actually picks up the phone
            </h2>
            <div style={{ fontSize: 15, color: "#444444", lineHeight: 1.8, fontFamily: "var(--font-dm-sans)" }}>
              <p style={{ marginBottom: 16 }}>
                Most property managers in London, Ontario assign you an account number and route everything through a call centre. You find out about problems after they've become expensive ones.
              </p>
              <p style={{ marginBottom: 16 }}>
                Prospera Properties is run by Ebin Jaison — a local landlord who built this company because he couldn't find a property manager he'd trust with his own units. When you call or text, you reach him directly.
              </p>
              <p style={{ marginBottom: 0 }}>
                We currently manage properties in London, St. Thomas, Strathroy, and surrounding communities. If your property is in the area, we can manage it.
              </p>
            </div>
            <div style={{ marginTop: 32 }}>
              <Link
                href="/contact"
                style={{ backgroundColor: "#8B2030", color: "#FAF8F5", padding: "14px 28px", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none", display: "inline-block" }}
              >
                Talk to Ebin Directly →
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: "64px 24px", maxWidth: 760, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 700, color: "#1F2F3A", marginBottom: 32, fontFamily: "var(--font-dm-sans)" }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {FAQS.map(({ q, a }) => (
              <div key={q} style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E1DC", borderRadius: 10, padding: "20px 24px" }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1F2F3A", marginBottom: 8, fontFamily: "var(--font-dm-sans)" }}>{q}</h3>
                <p style={{ fontSize: 14, color: "#555555", lineHeight: 1.65, margin: 0, fontFamily: "var(--font-dm-sans)" }}>{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related links */}
        <section style={{ backgroundColor: "#1F2F3A", padding: "48px 24px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <p style={{ fontSize: 13, color: "rgba(250,248,245,0.5)", marginBottom: 20, fontFamily: "var(--font-dm-sans)" }}>Also serving:</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {[
                { label: "Property Management St. Thomas", href: "/blog/property-management-st-thomas-ontario" },
                { label: "Property Management Strathroy", href: "/blog/property-management-strathroy-ontario" },
                { label: "Property Management Woodstock", href: "/blog/property-management-woodstock-ontario" },
                { label: "Property Management Ingersoll", href: "/blog/property-management-ingersoll-ontario" },
              ].map((l) => (
                <Link key={l.href} href={l.href}
                  style={{ fontSize: 13, color: "rgba(250,248,245,0.65)", textDecoration: "underline", textUnderlineOffset: 3 }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
