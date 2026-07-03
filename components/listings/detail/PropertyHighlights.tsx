"use client";

import type { PropertyRecord } from "./ListingPage";

interface Props {
  property: PropertyRecord;
}

const ICONS = ["🏠", "📍", "🚌", "🐾", "✅"];

export default function PropertyHighlights({ property }: Props) {
  const highlights = property.ai_highlights ?? [];
  if (!highlights.length) return null;

  return (
    <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2" }}>
      <div className="max-w-5xl mx-auto">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest text-center mb-4"
            style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
          >
            Why This Home
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold text-center mb-14 leading-tight"
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
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              {/* Number + Icon */}
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: "#F7F5F2" }}
                >
                  {ICONS[i] || "✅"}
                </span>
                <span
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}
                >
                  Highlight {i + 1}
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
