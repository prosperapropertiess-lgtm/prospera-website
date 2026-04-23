"use client";

import { useState } from "react";
import FadeIn from "@/components/animations/FadeIn";
import FAQAccordion from "@/components/ui/FAQAccordion";
import Link from "next/link";

const TABS = ["For Landlords", "For Tenants", "General"] as const;
type Tab = typeof TABS[number];

const landlordFaqs = [
  { q: "What's included in your monthly management fee?", a: "Everything — tenant communication, rent collection, maintenance coordination, monthly financial statements, lease renewals, rent increase notices, and annual inspections. No hidden fees. One flat percentage, all in." },
  { q: "How do you screen tenants?", a: "We run full credit checks, criminal background checks, employment verification, income verification (2.5–3x monthly rent minimum), and we call previous landlords directly. We document everything and keep records for your protection." },
  { q: "What happens if a tenant doesn't pay rent?", a: "We follow up on day 1. If the issue isn't resolved quickly, we serve the proper N4 notice, file with the Landlord and Tenant Board, and guide you through the process. We stay with you from first missed payment to resolution." },
  { q: "Can I still be involved in decisions about my property?", a: "Yes. We handle the daily management so you don't have to — but you're always consulted on larger maintenance decisions, rent increases, tenant applications, and lease changes. It's still your property." },
  { q: "What areas do you serve?", a: "We currently manage properties in London, St. Thomas, and Sarnia, Ontario. If your property is in a nearby area, reach out and we can discuss." },
  { q: "How quickly can you find a tenant?", a: "Typically 2–4 weeks for a well-priced property. We'll give you an honest rental estimate and timeline before we start. We don't rush placements — quality over speed." },
  { q: "What does the tenant placement process involve?", a: "We photograph the unit professionally, write compelling listing copy, post on all major platforms (Kijiji, Facebook Marketplace, Realtor.ca, and more), collect and screen applications, conduct viewings, check references, and prepare the lease." },
  { q: "Do you mark up maintenance costs?", a: "No. We coordinate with our trusted contractor network and you pay the contractor's invoice directly — no management markup. We earn only our management fee." },
  { q: "How do I see what's happening with my property?", a: "We send monthly financial statements detailing all rent received, any maintenance costs, and your net income. You can also reach us directly any time — you're talking to the owner of Prospera, not a call centre." },
  { q: "What if I want to sell or move back into the property?", a: "We make the transition easy. We'll help you time the notice correctly under Ontario law (N12 or N13 as applicable) and ensure everything is handled legally and without damaging your relationship with the tenant." },
];

const tenantFaqs = [
  { q: "How do I apply for a rental?", a: "Browse our available listings at /listings. Each property has an 'Apply Now' button that takes you to a secure online application through our tenant portal. Applications are reviewed within 1–2 business days." },
  { q: "What does the application process involve?", a: "We'll ask for proof of income (pay stubs or employment letter), references from previous landlords, consent to a credit check, and photo ID. The process is straightforward and we communicate throughout." },
  { q: "How do I submit a maintenance request?", a: "Tenants can submit maintenance requests through the tenant portal at any time. For emergencies (no heat, flooding, security issues), we have a 24/7 emergency line — you'll receive it in your welcome package." },
  { q: "What are my rights as a tenant in Ontario?", a: "Ontario's Residential Tenancies Act gives tenants strong protections — including the right to a unit that meets health and safety standards, proper notice before any rent increase, and protection from illegal entry. We respect and follow all of these." },
  { q: "Can I have pets?", a: "Pet policies vary by property — check the individual listing. Even where pets aren't listed as welcome, you're welcome to ask. We work with our landlords on a case-by-case basis." },
  { q: "What notice do I need to give before moving out?", a: "Under Ontario law, the standard notice period is 60 days, ending on the last day of a rental period. If you're on a fixed-term lease, check your end date — special rules apply." },
  { q: "What happens with my last month's rent deposit?", a: "The last month's rent deposit you paid when signing is applied to your final month. We cannot keep it as a damage deposit — that's not legal under Ontario law." },
  { q: "Can my rent be increased?", a: "For units built before November 15, 2018, rent increases are limited to the Ontario guideline (2.5% in 2026). We always provide proper N1 notice at least 90 days in advance. We never increase rent without proper notice." },
];

const generalFaqs = [
  { q: "Who is Prospera Properties?", a: "Prospera Properties is a property management company founded by Ebin Jaison, serving landlords and tenants in London, St. Thomas, and Sarnia, Ontario. We're a small, hands-on operation — not a large franchise. You always deal directly with Ebin." },
  { q: "What makes you different from other property managers?", a: "Most property management companies are large operations where you're just a file number. At Prospera, Ebin manages relationships personally. We're transparent about fees, we don't markup maintenance, and we treat tenants with respect — which results in better long-term tenants for landlords." },
  { q: "What tools do you use to manage properties?", a: "We use Buildium for tenant and owner portals, rent collection, and maintenance tracking. It gives both landlords and tenants a professional, reliable experience while keeping our costs (and yours) low." },
  { q: "How do I contact you?", a: "You can reach us at (519) 697-1227, submit a form on our contact page, or email us directly. We respond to all inquiries within one business day, usually faster." },
  { q: "Do you work with single-unit landlords or only larger portfolios?", a: "Both. We work with landlords who own a single basement apartment and with those who own multiple properties. Our pricing and approach are the same — straightforward and personal." },
];

const faqMap: Record<Tab, { q: string; a: string }[]> = {
  "For Landlords": landlordFaqs,
  "For Tenants": tenantFaqs,
  "General": generalFaqs,
};

export default function FAQPage() {
  const [activeTab, setActiveTab] = useState<Tab>("For Landlords");

  return (
    <div style={{ backgroundColor: "#FAF8F5" }} className="min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center" style={{ backgroundColor: "#F5F0EB" }}>
        <FadeIn>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}>
            Questions & Answers
          </p>
          <h1 className="text-5xl md:text-6xl font-light mb-6" style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}>
            Frequently Asked Questions
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "#2D4A5E", fontFamily: "var(--font-dm-sans)" }}>
            Answers to the most common questions from landlords and tenants across London, St. Thomas, and Sarnia.
          </p>
        </FadeIn>
      </section>

      {/* Tabs */}
      <section className="border-b sticky top-[64px] z-10 px-6" style={{ backgroundColor: "#FAF8F5", borderColor: "#E8E4DF" }}>
        <div className="max-w-3xl mx-auto flex">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-6 py-4 text-xs uppercase tracking-widest border-b-2 transition-colors"
              style={{
                fontFamily: "var(--font-dm-sans)",
                borderColor: activeTab === tab ? "#7B1C1C" : "transparent",
                color: activeTab === tab ? "#7B1C1C" : "#5A5A5A",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {/* FAQ content */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <FAQAccordion items={faqMap[activeTab]} />
        </div>
      </section>

      {/* Still have questions CTA */}
      <section className="py-16 px-6" style={{ backgroundColor: "#F5F0EB" }}>
        <div className="max-w-2xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-3xl font-light mb-4" style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}>
              Still Have Questions?
            </h2>
            <p className="text-sm mb-8" style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}>
              Reach out directly — we answer every inquiry personally, usually within a few hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-block px-8 py-3 text-xs uppercase tracking-widest transition-opacity hover:opacity-80"
                style={{ backgroundColor: "#0D1B2A", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
              >
                Contact Us
              </Link>
              <a
                href="tel:+15196971227"
                className="inline-block px-8 py-3 text-xs uppercase tracking-widest border transition-colors hover:bg-[#0D1B2A] hover:text-[#FAF8F5]"
                style={{ borderColor: "#0D1B2A", color: "#0D1B2A", fontFamily: "var(--font-dm-sans)" }}
              >
                (519) 697-1227
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
