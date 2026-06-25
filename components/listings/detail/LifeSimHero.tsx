"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { PropertyRecord } from "./ListingPage";

interface Props {
  property: PropertyRecord;
}

function StaggeredIntro({ text }: { text: string }) {
  const lines = text.split("\n").filter(Boolean);
  return (
    <div className="space-y-4">
      {lines.map((line, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.3 + i * 0.18, ease: [0.23, 1, 0.32, 1] }}
          className="text-2xl sm:text-3xl md:text-4xl font-light leading-snug max-w-3xl"
          style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
        >
          {line}
        </motion.p>
      ))}
    </div>
  );
}

function FallbackHero({ property }: { property: PropertyRecord }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
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
    </motion.div>
  );
}

export default function LifeSimHero({ property }: Props) {
  return (
    <section
      className="relative min-h-[60vh] flex flex-col px-5 sm:px-8 pt-28 pb-20"
      style={{ backgroundColor: "#1F2F3A" }}
    >
      {/* Back link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-14"
      >
        <Link
          href="/listings"
          className="text-xs uppercase tracking-widest transition-opacity hover:opacity-60"
          style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)" }}
        >
          ← All Listings
        </Link>
      </motion.div>

      {/* Content */}
      <div className="flex-1 flex items-end max-w-5xl mx-auto w-full">
        {property.ai_life_intro ? (
          <StaggeredIntro text={property.ai_life_intro} />
        ) : (
          <FallbackHero property={property} />
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
