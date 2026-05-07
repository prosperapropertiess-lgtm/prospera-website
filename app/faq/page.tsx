import Link from "next/link";
import FadeIn from "@/components/animations/FadeIn";
import FAQTabs from "@/components/ui/FAQTabs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers to the most common questions from landlords and tenants in London, St. Thomas, and Strathroy, Ontario.",
};

export default function FAQPage() {
  return (
    <div style={{ backgroundColor: "#F7F5F2" }}>
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center" style={{ backgroundColor: "#1F2F3A" }}>
        <FadeIn>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "rgba(250,248,245,0.55)", fontFamily: "var(--font-dm-sans)" }}>
            Questions & Answers
          </p>
          <h1 className="text-5xl md:text-6xl font-light mb-6" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Frequently Asked Questions
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "rgba(250,248,245,0.65)", fontFamily: "var(--font-dm-sans)" }}>
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
            <p className="text-sm mb-8" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
              Reach out directly — we answer every inquiry personally, usually within a few hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-block px-8 py-3 text-xs uppercase tracking-widest transition-opacity hover:opacity-80 rounded"
                style={{ backgroundColor: "#6A2E35", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
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
