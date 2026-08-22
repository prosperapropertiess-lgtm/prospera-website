"use client";

import type { PropertyRecord } from "./ListingPage";

interface Props {
  property: PropertyRecord;
}

function deriveCategory(text: string): { label: string; icon: string } {
  const lower = text.toLowerCase();
  if (/bedroom|bathroom|sqft|space|room|floor|level/.test(lower)) return { label: "Lots of Room", icon: "square_foot" };
  if (/walk|minute|close|nearby|steps/.test(lower)) return { label: "Steps Away", icon: "directions_walk" };
  if (/bus|transit|route|commute|car|walk score/.test(lower)) return { label: "Easy Commute", icon: "directions_bus" };
  if (/pet|dog|cat|yard|balcony/.test(lower)) return { label: "Pet Friendly", icon: "pets" };
  if (/managed|prospera|24\/7|maintenance|emergency|portal|review/.test(lower)) return { label: "Pro Managed", icon: "verified" };
  if (/laundry|parking|garage|appliance|furnished|turnkey/.test(lower)) return { label: "Move-In Ready", icon: "key" };
  if (/park|trail|green/.test(lower)) return { label: "Near Green Space", icon: "park" };
  return { label: "Key Feature", icon: "star" };
}

export default function PropertyHighlights({ property }: Props) {
  // Some AI-generated highlight slots can come back blank — never render an empty card
  const highlights = (property.ai_highlights ?? []).filter((h) => h && h.trim().length > 0);
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
          {highlights.slice(0, 5).map((highlight, i) => {
            const { label, icon } = deriveCategory(highlight);
            return (
              <div
                key={i}
                className="bg-white rounded-2xl p-7 h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                style={{
                  border: "1px solid #D8D2C8",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                {/* Icon + Label */}
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "rgba(139,32,48,0.08)" }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#8B2030" }}>
                      {icon}
                    </span>
                  </span>
                  <span
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}
                  >
                    {label}
                  </span>
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}
                >
                  {highlight}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
