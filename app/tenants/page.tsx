import Image from "next/image";
import Link from "next/link";
import FadeIn from "@/components/animations/FadeIn";
import FAQAccordion from "@/components/ui/FAQAccordion";
import BlogNudge from "@/components/ui/BlogNudge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rentals for Tenants",
  description: "Find quality rental homes in London, St. Thomas, and Strathroy, Ontario. Professionally managed by Prospera Properties — well-maintained, responsive, and fair.",
};

const features = [
  { icon: "🏠", title: "Well-Maintained Properties", desc: "Regular inspections and fast repairs. We don't let issues linger — your home stays in top condition." },
  { icon: "📞", title: "Responsive Management", desc: "We pick up the phone. Emergency line available 24/7. You'll never be left waiting for days on a simple request." },
  { icon: "📋", title: "Clear Communication", desc: "No guessing games. Transparent lease terms, clear expectations, and updates when things change." },
  { icon: "⚖️", title: "Fair Treatment", desc: "We respect your home and your rights under Ontario's Residential Tenancies Act — always." },
];

const steps = [
  { n: "01", title: "Browse Listings", desc: "Explore available homes across London, St. Thomas, and Strathroy. Photos, pricing, and details — all online." },
  { n: "02", title: "Apply Online", desc: "Submit your application through our secure tenant portal. We aim to respond within 2 business days." },
  { n: "03", title: "Move In & Enjoy", desc: "Once approved, we handle the lease, walkthrough, and keys. Your move is our priority." },
];

const faqs = [
  { q: "How do I apply for a rental?", a: "Browse our listings page, find a property you love, and click 'Apply Now'. The application is done through our Buildium tenant portal — it takes about 10 minutes." },
  { q: "What does the application process involve?", a: "We ask for ID, proof of income (pay stubs or employment letter), a credit check authorization, and references from previous landlords. All standard stuff — nothing unusual." },
  { q: "How do I submit a maintenance request?", a: "Log into your tenant portal at any time and submit a request with a description and photo. We'll confirm receipt and dispatch within 24 hours for non-emergencies, immediately for emergencies." },
  { q: "What are my rights as a tenant in Ontario?", a: "Ontario's Residential Tenancies Act protects you in areas like rent increases, repairs, evictions, and privacy. We operate fully within these rules — and we're happy to answer any specific questions you have." },
  { q: "Is there a pet policy?", a: "Pet policies vary by property and are noted on each listing. If you have questions about a specific property, contact us directly." },
  { q: "What's the typical lease term?", a: "Most of our rentals start as 12-month fixed-term leases and convert to month-to-month after that. Some short-term arrangements may be available — ask us." },
];

export default function TenantsPage() {
  return (
    <div style={{ backgroundColor: "#F7F5F2" }}>
      {/* Hero */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <Image src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1600&h=900&fit=crop&auto=format&q=80" alt="Find a home" fill className="object-cover" priority />
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(31,47,58,0.65)" }} />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-white">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.3em] mb-5" style={{ color: "rgba(250,248,245,0.6)", fontFamily: "var(--font-dm-sans)" }}>For Tenants</p>
            <h1 className="text-5xl md:text-6xl font-light leading-tight mb-6" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
              Find a Home<br />You&apos;ll Actually Love.
            </h1>
            <p className="text-lg mb-10 max-w-2xl leading-relaxed" style={{ color: "rgba(250,248,245,0.7)", fontFamily: "var(--font-dm-sans)" }}>
              Quality rentals in London, St. Thomas, and Strathroy. Professionally managed, well-maintained, and with a team that actually responds.
            </p>
            <Link href="/listings" className="inline-block px-8 py-4 text-sm uppercase tracking-wide rounded hover:opacity-80 transition-opacity" style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>
              Browse Available Rentals
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-center mb-4" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>What You Get</p>
            <h2 className="text-4xl font-light text-center mb-14" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              Renting with Prospera is different.
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="bg-white rounded-xl p-8 border flex gap-5" style={{ borderColor: "#D8D2C8", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <div className="text-3xl flex-shrink-0">{f.icon}</div>
                  <div>
                    <h3 className="text-xl font-medium mb-2" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>{f.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>{f.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How Renting Works */}
      <section className="py-24 px-6" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-center mb-4" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>The Process</p>
            <h2 className="text-4xl font-light text-center mb-16" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>How Renting Works</h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map((step, i) => (
              <FadeIn key={step.n} delay={i * 0.15}>
                <div className="text-center">
                  <p className="text-6xl font-light mb-4" style={{ color: "rgba(31,47,58,0.15)", fontFamily: "var(--font-cormorant)" }}>{step.n}</p>
                  <h3 className="text-2xl font-medium mb-3" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.3}>
            <div className="text-center mt-14">
              <Link href="/listings" className="inline-block px-10 py-4 text-sm uppercase tracking-wide rounded hover:opacity-80 transition-opacity" style={{ backgroundColor: "#1F2F3A", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>
                See Available Homes
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-center mb-4" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>Common Questions</p>
            <h2 className="text-4xl font-light text-center mb-14" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>FAQ for Tenants</h2>
          </FadeIn>
          <FAQAccordion items={faqs} />
        </div>
      </section>

      {/* Blog nudges */}
      <section className="py-12 px-5 sm:px-8" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-3xl mx-auto space-y-4">
          <BlogNudge
            hook="Who actually pays for utilities in your rental?"
            title="Utilities in Ontario Rentals: Who Pays What?"
            excerpt="Electricity, heat, water — here's how utility responsibilities work in Ontario leases and what the law says about each."
            slug="utilities-ontario-rentals"
            label="Know your rights"
          />
          <BlogNudge
            hook="Can your landlord just walk into your home?"
            title="Landlord Entry Rights in Ontario: When Can You Enter Your Own Rental?"
            excerpt="Ontario landlords have strict rules about entering rental properties — and breaking them can backfire badly."
            slug="landlord-entry-rights-ontario"
            label="Know your rights"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center" style={{ backgroundColor: "#1F2F3A" }}>
        <FadeIn>
          <h2 className="text-4xl md:text-5xl font-light mb-5" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Ready to find your next home?
          </h2>
          <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "rgba(250,248,245,0.65)", fontFamily: "var(--font-dm-sans)" }}>
            Browse our available rentals and apply online. We&apos;ll be in touch within 2 business days.
          </p>
          <Link href="/listings" className="inline-block px-10 py-4 text-sm uppercase tracking-wide rounded hover:opacity-80 transition-opacity" style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>
            Browse Listings
          </Link>
        </FadeIn>
      </section>
    </div>
  );
}
