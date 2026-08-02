import Image from "next/image";
import Link from "next/link";
import TenantLeadCTA from "@/components/blog/TenantLeadCTA";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Renting in London, Ontario — Tenant Resources | Prospera Properties",
  description: "Find rentals in London, St. Thomas, and Strathroy, Ontario. Understand your rights, navigate applications, and get matched with the right home — all in one place.",
  alternates: { canonical: "https://www.prosperaproperties.co/tenants" },
};

const rights = [
  {
    title: "Rent increase limits",
    body: "Your landlord can only raise your rent once per year and must give 90 days written notice. The 2026 provincial guideline is 2.5%. Units first occupied after November 15, 2018 are exempt from the guideline.",
  },
  {
    title: "Landlord entry rules",
    body: "Except in emergencies, your landlord must give 24 hours written notice before entering — and only between 8 a.m. and 8 p.m. Unauthorized entry is a violation of the RTA.",
  },
  {
    title: "Maintenance is your landlord's job",
    body: "Your unit must be kept in a good state of repair and comply with health and safety standards. If something breaks, submit a written maintenance request and keep a copy.",
  },
  {
    title: "Eviction requires a legal process",
    body: "Your landlord cannot change locks, remove your belongings, or cut utilities to force you out. The only legal path is through the Landlord and Tenant Board, and most notices have a 14-day+ response window.",
  },
  {
    title: "You can have pets",
    body: "A no-pets clause in a lease is generally unenforceable under the RTA. Your landlord can only refuse to renew on pet grounds in very limited circumstances.",
  },
  {
    title: "First + last only",
    body: "A landlord can only legally collect first and last month's rent upfront. A 'damage deposit' or 'key deposit' beyond this is not permitted under Ontario law.",
  },
];

const steps = [
  {
    n: "01",
    title: "Browse and book a viewing",
    body: "Find a listing you like and book a viewing directly through the property page. Most viewings happen within 48 hours of request.",
  },
  {
    n: "02",
    title: "Submit your application",
    body: "After viewing, we send you a digital application. Takes about 10 minutes. No fee to apply.",
  },
  {
    n: "03",
    title: "Verification",
    body: "We verify: photo ID, proof of income or enrollment, 6 months of bank statements, a soft credit check (no impact to your score), and a previous landlord reference.",
  },
  {
    n: "04",
    title: "Decision within 24–48 hours",
    body: "We review applications in the order received and contact you with a decision. If approved, we move to lease signing.",
  },
  {
    n: "05",
    title: "Sign and move in",
    body: "Sign your Ontario Standard Lease digitally. Pay first and last month's rent on signing. Keys on move-in day.",
  },
];

const faqs = [
  {
    q: "What do I need to apply?",
    a: "Government-issued photo ID, 3 most recent pay stubs or a letter of employment, 6 months of bank statements, a soft credit check (link sent via email), a previous landlord reference, and first and last month's rent on approval.",
  },
  {
    q: "I'm an international student with no Canadian credit history. Can I still apply?",
    a: "Yes. We work with international students and newcomers regularly. Be upfront about your situation, provide your enrollment letter and financial documentation, and offer a co-signer if possible. A larger deposit may also help.",
  },
  {
    q: "Can I apply if I've never rented before?",
    a: "Yes. For first-time renters, we may ask for a personal reference (professor, employer, or family friend), proof of income or a co-signer, and additional financial documentation. Just be upfront about your situation.",
  },
  {
    q: "Are pets allowed?",
    a: "Pet policies vary by property and are listed on each unit's page. Under Ontario's RTA, a no-pets clause is generally unenforceable — but we do ask that you disclose your pet during your application.",
  },
  {
    q: "What is the lease term?",
    a: "Most units are offered on a standard 12-month lease that converts to month-to-month after the initial term. If you need a different arrangement, ask us — we can discuss options.",
  },
  {
    q: "How do maintenance requests work?",
    a: "Submit through your tenant portal anytime. We confirm receipt and dispatch within 24 hours for non-emergencies. Emergencies (no heat, flooding, no hot water) are handled immediately.",
  },
  {
    q: "Can my landlord raise my rent mid-lease?",
    a: "No. Rent can only increase once per year and only after the initial lease term, with 90 days written notice. The 2026 guideline is 2.5%. Units first occupied after November 15, 2018 are not subject to the guideline.",
  },
  {
    q: "What utilities are typically included?",
    a: "It varies by unit — each listing clearly states what's included. Common setups: some include heat and water, others are utilities-excluded. Always confirm before signing.",
  },
];

const resources = [
  {
    label: "Ontario Tenant Rights",
    items: [
      { title: "Ontario Landlord Tenant Act 2026: Rights, Rules & What Changed", slug: "ontario-landlord-tenant-act-2026" },
      { title: "Maintenance Responsibilities: What Your Landlord Must Fix", slug: "landlord-maintenance-responsibilities-ontario" },
      { title: "Landlord Insurance vs Tenant Insurance: What Each Policy Covers", slug: "landlord-insurance-vs-tenant-insurance-ontario" },
      { title: "Pet Policies in Ontario Rentals: What the Law Actually Says", slug: "pet-policies-ontario-rentals" },
      { title: "Noise Complaints in Ontario Rentals", slug: "noise-complaints-ontario-rental" },
    ],
  },
  {
    label: "Renting in London, ON",
    items: [
      { title: "Fanshawe College Off-Campus Housing Guide 2026", slug: "fanshawe-college-off-campus-housing-guide" },
      { title: "How Much Does Rent Cost in London, Ontario?", slug: "how-much-charge-rent-london-ontario" },
      { title: "Legal Basement Apartment Requirements in Ontario", slug: "legal-basement-apartment-requirements-ontario" },
      { title: "City of London Rental Licence: What Tenants Need to Know", slug: "city-of-london-rental-unit-licence" },
    ],
  },
  {
    label: "Leases & Move-In",
    items: [
      { title: "Move-In / Move-Out Inspection: Your Rights as a Tenant", slug: "move-in-move-out-inspection-ontario" },
      { title: "N11 Agreement to End Tenancy: When and How to Use It", slug: "n11-agreement-to-end-tenancy-ontario" },
      { title: "Pest Control in Ontario Rentals: Who Is Responsible?", slug: "pest-control-ontario-rentals" },
      { title: "Navigating the Landlord and Tenant Board in Ontario", slug: "landlord-tenant-board-ontario-guide" },
    ],
  },
];

export default function TenantsPage() {
  return (
    <div style={{ backgroundColor: "#F7F5F2" }}>
      {/* Hero */}
      <section className="relative flex items-end overflow-hidden" style={{ minHeight: "72vh", paddingTop: "80px" }}>
        <Image
          src="https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=1600&h=900&fit=crop&auto=format&q=80"
          alt="Rental home in London Ontario"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(31,47,58,0.92) 30%, rgba(31,47,58,0.40) 100%)" }} />
        <div className="relative z-10 w-full max-w-5xl mx-auto px-5 sm:px-8 pb-16">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "rgba(250,248,245,0.55)", fontFamily: "var(--font-dm-sans)" }}
          >
            For Tenants in London, Ontario
          </p>
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-5"
            style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
          >
            Find a place you&apos;ll<br />actually want to live in.
          </h1>
          <p
            className="text-base sm:text-lg mb-10 max-w-2xl leading-relaxed"
            style={{ color: "rgba(250,248,245,0.75)", fontFamily: "var(--font-dm-sans)" }}
          >
            Professionally managed rentals in London, St. Thomas, and Strathroy. Fast responses, clear terms, and a landlord who picks up the phone.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/listings"
              className="inline-block px-8 py-4 text-xs font-semibold uppercase tracking-widest rounded transition-opacity hover:opacity-80"
              style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
            >
              Browse Available Rentals
            </Link>
            <a
              href="#find-your-place"
              className="inline-block px-8 py-4 text-xs font-semibold uppercase tracking-widest rounded transition-opacity hover:opacity-70"
              style={{ border: "1px solid rgba(250,248,245,0.3)", color: "rgba(250,248,245,0.80)", fontFamily: "var(--font-dm-sans)" }}
            >
              Tell Us What You Need
            </a>
          </div>
        </div>
      </section>

      {/* In-page section nav */}
      <nav className="sticky top-0 z-40 border-b overflow-x-auto" style={{ backgroundColor: "#FFFFFF", borderColor: "#D8D2C8" }}>
        <div className="max-w-5xl mx-auto px-5 sm:px-8 flex items-center gap-0 min-w-max">
          {[
            { label: "Find a Place", href: "#find-your-place" },
            { label: "How to Apply", href: "#how-to-apply" },
            { label: "Your Rights", href: "#your-rights" },
            { label: "FAQ", href: "#faq" },
            { label: "Resources", href: "#resources" },
          ].map(item => (
            <a
              key={item.href}
              href={item.href}
              className="px-5 py-4 text-xs font-semibold uppercase tracking-widest whitespace-nowrap transition-colors hover:opacity-60"
              style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      {/* Why Prospera */}
      <section className="py-20 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-center mb-3" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
            What Renting With Us Looks Like
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
            We treat your rental like a home, not a transaction.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { n: "24h", label: "Response to maintenance requests" },
              { n: "48h", label: "Application decisions" },
              { n: "100%", label: "Ontario Standard Lease — always" },
              { n: "0", label: "Surprise fees or illegal deposits" },
            ].map(stat => (
              <div
                key={stat.n}
                className="rounded-xl p-7 text-center"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #D8D2C8" }}
              >
                <p
                  className="text-4xl font-bold mb-2"
                  style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
                >
                  {stat.n}
                </p>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Apply */}
      <section id="how-to-apply" className="py-20 px-5 sm:px-8 scroll-mt-12" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-center mb-3" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
            Step by Step
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
            How the application process works
          </h2>

          <div className="space-y-5">
            {steps.map((step) => (
              <div
                key={step.n}
                className="flex gap-6 rounded-xl p-7"
                style={{ backgroundColor: "#F7F5F2", border: "1px solid #E8E4DE" }}
              >
                <p
                  className="text-4xl font-bold leading-none shrink-0 mt-0.5"
                  style={{ color: "rgba(31,47,58,0.12)", fontFamily: "var(--font-dm-sans)" }}
                >
                  {step.n}
                </p>
                <div>
                  <h3
                    className="text-base font-semibold mb-1.5"
                    style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "#555555", fontFamily: "var(--font-dm-sans)" }}
                  >
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-xl p-7" style={{ backgroundColor: "#1F2F3A" }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(250,248,245,0.45)", fontFamily: "var(--font-dm-sans)" }}>
              What We Require
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
              {[
                "Government-issued photo ID",
                "3 most recent pay stubs or employment letter",
                "6 months of bank statements",
                "Soft credit check (link sent via email — no impact to score)",
                "Previous landlord reference (name + phone)",
                "First and last month's rent on approval",
              ].map(req => (
                <li key={req} className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "rgba(250,248,245,0.12)" }}>
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1 4l2 2 4-4" stroke="#FAF8F5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-sm leading-relaxed" style={{ color: "rgba(250,248,245,0.75)", fontFamily: "var(--font-dm-sans)" }}>
                    {req}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Your Rights */}
      <section id="your-rights" className="py-20 px-5 sm:px-8 scroll-mt-12" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-center mb-3" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
            Ontario Residential Tenancies Act
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
            Your rights as a tenant in Ontario
          </h2>
          <p className="text-sm text-center mb-12 max-w-2xl mx-auto" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
            Ontario has some of the strongest tenant protections in Canada. These are not suggestions — they are the law, and we follow them.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {rights.map((r) => (
              <div
                key={r.title}
                className="rounded-xl p-7"
                style={{ backgroundColor: "#FFFFFF", border: "1px solid #D8D2C8" }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-1 self-stretch rounded-full shrink-0"
                    style={{ backgroundColor: "#8B2030", minHeight: "20px" }}
                  />
                  <h3
                    className="text-sm font-semibold"
                    style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
                  >
                    {r.title}
                  </h3>
                </div>
                <p
                  className="text-sm leading-relaxed pl-4"
                  style={{ color: "#555555", fontFamily: "var(--font-dm-sans)" }}
                >
                  {r.body}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-sm text-center" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
            Questions about your specific situation?{" "}
            <a
              href="https://tribunalsontario.ca/ltb/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline underline-offset-2 transition-opacity hover:opacity-70"
              style={{ color: "#1F2F3A" }}
            >
              Landlord and Tenant Board (LTB)
            </a>
            {" "}or{" "}
            <a
              href="https://cleoconnect.ca"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline underline-offset-2 transition-opacity hover:opacity-70"
              style={{ color: "#1F2F3A" }}
            >
              CLEO (free legal info)
            </a>
            {" "}are free resources.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-5 sm:px-8 scroll-mt-12" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-center mb-3" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
            Common Questions
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
            FAQ for Renters
          </h2>

          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <TenantFaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>

          <p className="mt-10 text-sm text-center" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
            Still have questions?{" "}
            <a
              href="tel:5196971227"
              className="font-semibold underline underline-offset-2 transition-opacity hover:opacity-70"
              style={{ color: "#1F2F3A" }}
            >
              Call (519) 697-1227
            </a>{" "}
            or{" "}
            <Link
              href="/contact"
              className="font-semibold underline underline-offset-2 transition-opacity hover:opacity-70"
              style={{ color: "#1F2F3A" }}
            >
              send us a message
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Renter Resource Library */}
      <section id="resources" className="py-20 px-5 sm:px-8 scroll-mt-12" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-center mb-3" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
            Free Renter Guides
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
            Everything you need to rent in Ontario
          </h2>
          <p className="text-sm text-center mb-12" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
            Plain-language guides on your rights, your lease, and how to navigate renting in London.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {resources.map((group) => (
              <div key={group.label}>
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-4 pb-3 border-b"
                  style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)", borderColor: "#D8D2C8" }}
                >
                  {group.label}
                </p>
                <ul className="space-y-3">
                  {group.items.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/blog/${item.slug}`}
                        className="text-sm leading-snug transition-opacity hover:opacity-60 block"
                        style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
                      >
                        {item.title} →
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/blog"
              className="inline-block text-xs font-semibold uppercase tracking-widest transition-opacity hover:opacity-60"
              style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)", borderBottom: "1px solid #D8D2C8", paddingBottom: "2px" }}
            >
              Browse all guides →
            </Link>
          </div>
        </div>
      </section>

      {/* Lead capture */}
      <div id="find-your-place" className="scroll-mt-0">
        <TenantLeadCTA />
      </div>
    </div>
  );
}

// Inline accordion — no dependency on FAQAccordion (which may be landlord-styled)
function TenantFaqItem({ q, a }: { q: string; a: string }) {
  // Server component can't use useState, so this is a simple details/summary
  return (
    <details
      className="rounded-xl overflow-hidden group"
      style={{ border: "1px solid #E8E4DE" }}
    >
      <summary
        className="flex items-center justify-between px-6 py-4 cursor-pointer list-none"
        style={{ backgroundColor: "#F7F5F2", fontFamily: "var(--font-dm-sans)" }}
      >
        <span className="text-sm font-semibold pr-4" style={{ color: "#1F2F3A" }}>
          {q}
        </span>
        <span
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ backgroundColor: "#F0EDE8", color: "#666666" }}
        >
          +
        </span>
      </summary>
      <div className="px-6 pb-5 pt-1" style={{ backgroundColor: "#F7F5F2" }}>
        <p className="text-sm leading-relaxed" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
          {a}
        </p>
      </div>
    </details>
  );
}
