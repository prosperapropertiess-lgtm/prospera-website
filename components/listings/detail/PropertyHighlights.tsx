"use client";

import type { PropertyRecord } from "./ListingPage";

interface Props {
  property: PropertyRecord;
}


// Accent colors for top borders — one per card slot
const BORDER_COLORS = [
  "#8B2030",
  "#1F5FA6",
  "#2D7A4F",
  "#7A5A2D",
  "#1F2F3A",
];

function deriveLabel(text: string): string {
  const lower = text.toLowerCase();
  if (/bedroom|bathroom|sqft|space|room/.test(lower)) return "Lots of Room";
  if (/walk|minute|close|nearby|steps/.test(lower)) return "Steps Away";
  if (/bus|transit|route|commute|car/.test(lower)) return "Easy Commute";
  if (/pet|dog|cat|yard|balcony/.test(lower)) return "Pet Friendly";
  if (/managed|prospera|24\/7|maintenance|emergency/.test(lower)) return "Pro Managed";
  if (/laundry|parking|garage|appliance/.test(lower)) return "Move-In Ready";
  if (/park|trail|green/.test(lower)) return "Near Green Space";
  return "Key Feature";
}

export default function PropertyHighlights({ property }: Props) {
  const highlights = property.ai_highlights ?? [];
  if (!highlights.length) return null;

  return (
    <section className="py-12 md:py-16 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2" }}>
      <div className="max-w-5xl mx-auto">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest text-center mb-4"
            style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
          >
            Why This Home
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold text-center mb-8 md:mb-14 leading-tight"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
          >
            What Makes It Stand Out
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {highlights.slice(0, 5).map((highlight, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-7 h-full"
              style={{
                border: "1px solid #D8D2C8",
                borderTop: `3px solid ${BORDER_COLORS[i % BORDER_COLORS.length]}`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              {/* Number + Label */}
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ backgroundColor: "#F7F5F2", color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}
                >
                  {deriveLabel(highlight)}
                </span>
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}
              >
                {highlight}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
