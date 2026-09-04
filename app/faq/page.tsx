import Link from "next/link";
import FadeIn from "@/components/animations/FadeIn";
import FAQTabs from "@/components/ui/FAQTabs";
import JsonLd from "@/components/seo/JsonLd";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers to the most common questions from landlords and tenants in London, St. Thomas, and Strathroy, Ontario.",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "What's included in your monthly management fee?", "acceptedAnswer": { "@type": "Answer", "text": "Everything: tenant communication, rent collection, maintenance coordination, monthly financial statements, lease renewals, rent increase notices, and annual inspections. No hidden fees. One flat percentage, all in." } },
    { "@type": "Question", "name": "How do you screen tenants?", "acceptedAnswer": { "@type": "Answer", "text": "We run full credit checks, criminal background checks, employment verification, income verification (2.5–3x monthly rent minimum), and we call previous landlords directly. We document everything and keep records for your protection." } },
    { "@type": "Question", "name": "What happens if a tenant doesn't pay rent?", "acceptedAnswer": { "@type": "Answer", "text": "We follow up on day 1. If the issue isn't resolved quickly, we serve the proper N4 notice, file with the Landlord and Tenant Board, and guide you through the process. We stay with you from first missed payment to resolution." } },
    { "@type": "Question", "name": "Can I still be involved in decisions about my property?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. We handle the daily management so you don't have to, but you're always consulted on larger maintenance decisions, rent increases, tenant applications, and lease changes. It's still your property." } },
    { "@type": "Question", "name": "What areas does Prospera Properties serve?", "acceptedAnswer": { "@type": "Answer", "text": "We currently manage properties in London, St. Thomas, and Strathroy, Ontario. If your property is in a nearby area, reach out and we can discuss." } },
    { "@type": "Question", "name": "How quickly can you find a tenant?", "acceptedAnswer": { "@type": "Answer", "text": "Typically 2–4 weeks for a well-priced property. We'll give you an honest rental estimate and timeline before we start. We don't rush placements. Quality over speed." } },
    { "@type": "Question", "name": "What does the tenant placement process involve?", "acceptedAnswer": { "@type": "Answer", "text": "We photograph the unit professionally, write compelling listing copy, post on all major platforms, collect and screen applications, conduct viewings, check references, and prepare the lease." } },
    { "@type": "Question", "name": "Do you mark up maintenance costs?", "acceptedAnswer": { "@type": "Answer", "text": "No. We coordinate with our trusted contractor network and you pay the contractor's invoice directly, no management markup. We earn only our management fee." } },
    { "@type": "Question", "name": "How do I see what's happening with my property?", "acceptedAnswer": { "@type": "Answer", "text": "We send monthly financial statements detailing all rent received, any maintenance costs, and your net income. You can also reach us directly any time." } },
    { "@type": "Question", "name": "What if I want to sell or move back into the property?", "acceptedAnswer": { "@type": "Answer", "text": "We make the transition easy. We'll help you time the notice correctly under Ontario law (N12 or N13 as applicable) and ensure everything is handled legally." } },
    { "@type": "Question", "name": "How do I apply for a rental with Prospera Properties?", "acceptedAnswer": { "@type": "Answer", "text": "Browse our available listings at prosperaproperties.co/listings. Each property has an Apply Now option that takes you to a secure online application. Applications are reviewed within 1–2 business days." } },
    { "@type": "Question", "name": "What does the tenant application process involve?", "acceptedAnswer": { "@type": "Answer", "text": "We'll ask for proof of income (pay stubs or employment letter), references from previous landlords, consent to a credit check, and photo ID. The process is straightforward and we communicate throughout." } },
    { "@type": "Question", "name": "How do I submit a maintenance request as a tenant?", "acceptedAnswer": { "@type": "Answer", "text": "Tenants can submit maintenance requests through the tenant portal at any time. For emergencies (no heat, flooding, security issues), we have a 24/7 emergency line. You'll receive it in your welcome package." } },
    { "@type": "Question", "name": "What are my rights as a tenant in Ontario?", "acceptedAnswer": { "@type": "Answer", "text": "Ontario's Residential Tenancies Act gives tenants strong protections, including the right to a unit that meets health and safety standards, proper notice before any rent increase, and protection from illegal entry." } },
    { "@type": "Question", "name": "What notice do I need to give before moving out of an Ontario rental?", "acceptedAnswer": { "@type": "Answer", "text": "Under Ontario law, the standard notice period is 60 days, ending on the last day of a rental period. If you're on a fixed-term lease, check your end date — special rules apply." } },
    { "@type": "Question", "name": "What happens with my last month's rent deposit?", "acceptedAnswer": { "@type": "Answer", "text": "The last month's rent deposit you paid when signing is applied to your final month. Landlords cannot keep it as a damage deposit — that's not legal under Ontario law." } },
    { "@type": "Question", "name": "Can my rent be increased in Ontario?", "acceptedAnswer": { "@type": "Answer", "text": "For units built before November 15, 2018, rent increases are limited to the Ontario guideline (2.5% in 2026). Proper N1 notice must be given at least 90 days in advance." } },
    { "@type": "Question", "name": "Who is Prospera Properties?", "acceptedAnswer": { "@type": "Answer", "text": "Prospera Properties is a property management company founded by Ebin Jaison, serving landlords and tenants in London, St. Thomas, and Strathroy, Ontario. You always deal directly with Ebin." } },
    { "@type": "Question", "name": "What makes Prospera Properties different from other property managers?", "acceptedAnswer": { "@type": "Answer", "text": "At Prospera, Ebin manages relationships personally. We're transparent about fees, we don't markup maintenance, and we treat tenants with respect. That results in better long-term tenants for landlords." } },
    { "@type": "Question", "name": "Do you work with single-unit landlords or only larger portfolios?", "acceptedAnswer": { "@type": "Answer", "text": "Both. We work with landlords who own a single basement apartment and with those who own multiple properties. Our approach is straightforward and personal either way." } },
  ]
};

export default function FAQPage() {
  return (
    <div style={{ backgroundColor: "#F7F5F2" }}>
      <JsonLd data={faqSchema} />
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center" style={{ backgroundColor: "#1F2F3A" }}>
        <FadeIn>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "rgba(250,248,245,0.75)", fontFamily: "var(--font-dm-sans)" }}>
            Questions & Answers
          </p>
          <h1 className="text-5xl md:text-6xl font-light mb-6" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Frequently Asked Questions
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "rgba(250,248,245,0.8)", fontFamily: "var(--font-dm-sans)" }}>
            Answers to the most common questions from landlords and tenants across London, St. Thomas, and Strathroy.
          </p>
        </FadeIn>
      </section>

      {/* Tabbed FAQ */}
      <FAQTabs />

      {/* Still have questions CTA */}
      <section className="py-16 px-6" style={{ backgroundColor: "#FFFFFF", borderTop: "1px solid #D8D2C8" }}>
        <div className="max-w-2xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-3xl font-light mb-4" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              Still Have Questions?
            </h2>
            <p className="text-sm mb-8" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
              Reach out directly — we answer every inquiry personally, usually within a few hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-block px-8 py-3 text-xs uppercase tracking-widest btn-primary rounded"
                style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
              >
                Contact Us
              </Link>
              <a
                href="tel:+15196971227"
                className="inline-block px-8 py-3 text-xs uppercase tracking-widest border transition-colors hover:bg-[#F7F5F2] rounded"
                style={{ borderColor: "#D8D2C8", color: "#222222", fontFamily: "var(--font-dm-sans)" }}
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
