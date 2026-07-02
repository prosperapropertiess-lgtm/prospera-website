"use client";

import Link from "next/link";
import type { PropertyRecord } from "./ListingPage";

interface Props {
  property: PropertyRecord;
}

/**
 * SEO-safe listing hero:
 * - Property title, address, and intro text always visible in HTML
 * - No opacity-0 animations — content must be indexable by Google
 */
export default function LifeSimHero({ property }: Props) {
  const lines = property.ai_life_intro
    ? property.ai_life_intro.split("\n").filter(Boolean)
    : null;

  return (
    <section
      className="relative min-h-[60vh] flex flex-col px-5 sm:px-8 pt-28 pb-20"
      style={{ backgroundColor: "#1F2F3A" }}
    >
      {/* Back link */}
      <div className="mb-14">
        <Link
          href="/listings"
          className="text-xs uppercase tracking-widest transition-opacity hover:opacity-60"
          style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)" }}
        >
          ← All Listings
        </Link>
      </div>

      {/* Content — always visible (no animation hiding) */}
      <div className="flex-1 flex items-end max-w-5xl mx-auto w-full">
        {lines ? (
          <div className="space-y-4">
            {lines.map((line, i) => (
              <p
                key={i}
                className="text-2xl sm:text-3xl md:text-4xl font-light leading-snug max-w-3xl"
                style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
              >
                {line}
              </p>
            ))}
          </div>
        ) : (
          <div>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-light leading-tight mb-4 max-w-3xl"
              style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
            >
              {property.title}
            </h1>
            <p
              className="text-base"
              style={{ color: "rgba(250,248,245,0.6)", fontFamily: "var(--font-dm-sans)" }}
            >
              {property.address}, {property.city}, ON
            </p>
          </div>
        )}
      </div>

      {/* Bottom fade overlay */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, #F7F5F2)" }}
      />
    </section>
  );
}
