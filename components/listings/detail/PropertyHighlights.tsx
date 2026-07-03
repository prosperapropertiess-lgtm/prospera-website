"use client";


import type { PropertyRecord } from "./ListingPage";

interface Props {
  property: PropertyRecord;
}

export default function PropertyHighlights({ property }: Props) {
  const highlights = property.ai_highlights ?? [];
  if (!highlights.length) return null;

  return (
    <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2" }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
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

        {/* Highlights grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {highlights.slice(0, 5).map((highlight, i) => (
            <div>
              <div
                className="bg-white rounded-xl p-7 h-full border-l-4"
                style={{
                  borderColor: "#8B2030",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  border: "1px solid #D8D2C8",
                  borderLeftColor: "#8B2030",
                  borderLeftWidth: "4px",
                }}
              >
                <p
                  className="text-sm font-semibold leading-snug"
                  style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
                >
                  {highlight}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
