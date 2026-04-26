import Link from "next/link";
import FadeIn from "@/components/animations/FadeIn";
import ResourcesGrid from "@/components/ui/ResourcesGrid";
import N4FormBuilder from "@/components/ui/N4FormBuilder";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Landlord Resources",
  description: "Free Ontario landlord forms, templates, and guides — lease agreements, eviction notices, tenant screening checklists, and more. No government website digging required.",
};

export default function ResourcesPage() {
  return (
    <div style={{ backgroundColor: "#FAF8F5" }} className="min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center" style={{ backgroundColor: "#F5F0EB" }}>
        <FadeIn>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}>
            Free for Ontario Landlords
          </p>
          <h1 className="text-5xl md:text-6xl font-light mb-6" style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}>
            Free Landlord Resources
          </h1>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "#2D4A5E", fontFamily: "var(--font-dm-sans)" }}>
            Every form, template, and guide you need — no government website digging required. Download anything free.
          </p>
        </FadeIn>
      </section>

      {/* N4 Form Builder — featured tool */}
      <section className="py-16 px-6" style={{ backgroundColor: "#FAF8F5" }}>
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <div className="flex items-center gap-3 mb-6">
              <span
                className="text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full"
                style={{ backgroundColor: "#7B1C1C", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
              >
                New Tool
              </span>
              <p className="text-sm" style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}>
                Most landlords need this first
              </p>
            </div>
            <N4FormBuilder />
          </FadeIn>
        </div>
      </section>

      {/* Category legend */}
      <section className="px-6 py-6 border-b" style={{ borderColor: "#E8E4DF" }}>
        <div className="max-w-6xl mx-auto flex flex-wrap gap-3">
          {["Forms", "Templates", "Guides", "Checklists"].map((label) => (
            <span key={label} className="text-xs uppercase tracking-wider px-3 py-1.5 border" style={{ borderColor: "#0D1B2A", color: "#0D1B2A", fontFamily: "var(--font-dm-sans)" }}>
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* Resource grid — client component */}
      <ResourcesGrid />

      {/* Bottom CTA */}
      <section className="py-20 px-6 text-center" style={{ backgroundColor: "#0D1B2A" }}>
        <FadeIn>
          <h2 className="text-3xl font-light mb-4" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Need Help With Your Rental Property?
          </h2>
          <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "#A0A0A0", fontFamily: "var(--font-dm-sans)" }}>
            We handle everything — tenant screening, rent collection, maintenance. Free quote, no pressure.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 text-xs uppercase tracking-widest transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#7B1C1C", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
          >
            Get a Free Quote
          </Link>
        </FadeIn>
      </section>
    </div>
  );
}
