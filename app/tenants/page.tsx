import Image from "next/image";
import Link from "next/link";
import FadeIn from "@/components/animations/FadeIn";
import FAQAccordion from "@/components/ui/FAQAccordion";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rentals for Tenants",
  description: "Find quality rental homes in London, St. Thomas, and Sarnia, Ontario. Professionally managed by Prospera Properties — well-maintained, responsive, and fair.",
};

const features = [
  { icon: "🏠", title: "Well-Maintained Properties", desc: "Regular inspections and fast repairs. We don't let issues linger — your home stays in top condition." },
  { icon: "📞", title: "Responsive Management", desc: "We pick up the phone. Emergency line available 24/7. You'll never be left waiting for days on a simple request." },
  { icon: "📋", title: "Clear Communication", desc: "No guessing games. Transparent lease terms, clear expectations, and updates when things change." },
  { icon: "⚖️", title: "Fair Treatment", desc: "We respect your home and your rights under Ontario's Residential Tenancies Act — always." },
];

const steps = [
  { n: "01", title: "Browse Listings", desc: "Explore available homes across London, St. Thomas, and Sarnia. Photos, pricing, and details — all online." },
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
    <>
      {/* Hero */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <Image src="https://picsum.photos/seed/tenant-hero/1600/900" alt="Find a home" fill className="object-cover" priority unoptimized />
        <div className="absolute inset-0 bg-[#2D4A5E]/65" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-white">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.3em] text-[#7B1C1C] mb-5">For Tenants</p>
            <h1 className="font-[family-name:var(--font-cormorant)] text-5xl md:text-6xl font-light leading-tight mb-6">
              Find a Home<br />You&apos;ll Actually Love.
            </h1>
            <p className="text-lg text-white/80 mb-10 max-w-2xl leading-relaxed">
              Quality rentals in London, St. Thomas, and Sarnia. Professionally managed, well-maintained, and with a team that actually responds.
            </p>
            <Link href="/listings" className="inline-block px-8 py-4 bg-[#7B1C1C] text-white font-medium rounded hover:bg-[#9B2E2E] transition-colors text-sm uppercase tracking-wide">
              Browse Available Rentals
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-[#FAF8F5]">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-[#7B1C1C] text-center mb-4">What You Get</p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-4xl font-light text-[#0A1628] text-center mb-14">
              Renting with Prospera is different.
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((f, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 flex gap-5">
                  <div className="text-3xl flex-shrink-0">{f.icon}</div>
                  <div>
                    <h3 className="font-[family-name:var(--font-cormorant)] text-xl font-medium text-[#0A1628] mb-2">{f.title}</h3>
                    <p className="text-sm text-[#2D4A5E] leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How Renting Works */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-[#7B1C1C] text-center mb-4">The Process</p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-4xl font-light text-[#0A1628] text-center mb-16">How Renting Works</h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map((step, i) => (
              <FadeIn key={step.n} delay={i * 0.15}>
                <div className="text-center">
                  <p className="font-[family-name:var(--font-cormorant)] text-6xl font-light text-[#7B1C1C]/20 mb-4">{step.n}</p>
                  <h3 className="font-[family-name:var(--font-cormorant)] text-2xl font-medium text-[#0A1628] mb-3">{step.title}</h3>
                  <p className="text-sm text-[#2D4A5E] leading-relaxed">{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.3}>
            <div className="text-center mt-14">
              <Link href="/listings" className="inline-block px-10 py-4 bg-[#7B1C1C] text-white font-medium rounded hover:bg-[#9B2E2E] transition-colors text-sm uppercase tracking-wide">
                See Available Homes
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-[#FAF8F5]">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-[#7B1C1C] text-center mb-4">Common Questions</p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-4xl font-light text-[#0A1628] text-center mb-14">FAQ for Tenants</h2>
          </FadeIn>
          <FAQAccordion items={faqs} />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#2D4A5E] py-20 px-6 text-center text-white">
        <FadeIn>
          <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light mb-5">
            Ready to find your next home?
          </h2>
          <p className="text-white/70 text-sm mb-8 max-w-md mx-auto">
            Browse our available rentals and apply online. We&apos;ll be in touch within 2 business days.
          </p>
          <Link href="/listings" className="inline-block px-10 py-4 bg-white text-[#2D4A5E] font-medium rounded hover:bg-[#FAF8F5] transition-colors text-sm uppercase tracking-wide">
            Browse Listings
          </Link>
        </FadeIn>
      </section>
    </>
  );
}
