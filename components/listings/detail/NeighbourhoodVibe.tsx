"use client";


import type { PropertyRecord } from "./ListingPage";

interface Props {
  property: PropertyRecord;
}

export default function NeighbourhoodVibe({ property }: Props) {
  const vibe = property.neighbourhood_vibe;
  if (!vibe) return null;

  return (
    <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2" }}>
      <div className="max-w-4xl mx-auto">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest text-center mb-4"
            style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
          >
            The Feel of This Area
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold text-center mb-14 leading-tight"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
          >
            Neighbourhood Vibe
          </h2>
        </div>

        <div>
          <div
            className="bg-white rounded-xl p-8 sm:p-10"
            style={{
              border: "1px solid #D8D2C8",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            <div
              className="w-8 h-1 mb-6 rounded-full"
              style={{ backgroundColor: "#8B2030" }}
            />
            <p
              className="text-base sm:text-lg leading-relaxed"
              style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}
            >
              {vibe}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
