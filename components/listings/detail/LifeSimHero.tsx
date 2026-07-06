"use client";

import Link from "next/link";
import type { PropertyRecord } from "./ListingPage";

interface Props {
  property: PropertyRecord;
}

export default function LifeSimHero({ property }: Props) {
  const coverImage = property.images?.[0] ?? null;
  const aiLines = property.ai_life_intro
    ? property.ai_life_intro.split("\n").filter(Boolean)
    : [];

  return (
    <>
      {/* ── Cover image hero ─────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col"
        style={{ minHeight: "70vh", backgroundColor: "#1F2F3A" }}
      >
        {/* Cover photo */}
        {coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImage}
            alt={property.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Gradient overlay — darker at top (nav) and bottom (text readability) */}
        <div
          className="absolute inset-0"
          style={{
            background: coverImage
              ? "linear-gradient(to bottom, rgba(15,22,30,0.55) 0%, rgba(15,22,30,0.15) 35%, rgba(15,22,30,0.6) 70%, rgba(15,22,30,0.9) 100%)"
              : "none",
          }}
        />

        {/* Content */}
        <div className="relative flex flex-col flex-1 px-5 sm:px-8 pt-28 pb-12 max-w-5xl mx-auto w-full">
          {/* Back link */}
          <div className="mb-auto">
            <Link
              href="/listings"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest transition-opacity hover:opacity-60"
              style={{ color: "rgba(250,248,245,0.7)", fontFamily: "var(--font-dm-sans)" }}
            >
              ← All Listings
            </Link>
          </div>

          {/* Title block — anchored to bottom */}
          <div className="mt-auto">
            {/* Property type + city pill */}
            <p
              className="text-xs uppercase tracking-widest mb-4"
              style={{ color: "rgba(250,248,245,0.55)", fontFamily: "var(--font-dm-sans)" }}
            >
              {[property.property_type, property.city, "Ontario"].filter(Boolean).join(" · ")}
            </p>

            {/* Title — always rendered for SEO */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-light leading-tight mb-3 max-w-3xl"
              style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
            >
              {property.title}
            </h1>

            {/* Address */}
            <p
              className="text-sm"
              style={{ color: "rgba(250,248,245,0.6)", fontFamily: "var(--font-dm-sans)" }}
            >
              {property.address}, {property.city}, ON
            </p>
          </div>
        </div>
      </section>

      {/* ── AI life intro — narrative block below the hero ────────────────────── */}
      {aiLines.length > 0 && (
        <section
          className="px-5 sm:px-8 py-10"
          style={{ backgroundColor: "#1F2F3A" }}
        >
          <div className="max-w-3xl mx-auto space-y-3">
            {aiLines.map((line, i) => (
              <p
                key={i}
                className="text-xl sm:text-2xl font-light leading-relaxed"
                style={{ color: "rgba(250,248,245,0.82)", fontFamily: "var(--font-cormorant)" }}
              >
                {line}
              </p>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
