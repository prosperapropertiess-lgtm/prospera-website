"use client";

import type { PropertyRecord } from "./ListingPage";

interface Props {
  property: PropertyRecord;
}

/** Parse markdown-style text: **bold headers**, • bullet points, and paragraphs */
function renderVibeContent(text: string) {
  const lines = text.split("\n").filter((l) => l.trim());
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Bold header: **Title**
    const headerMatch = line.match(/^\*\*(.+?)\*\*$/);
    if (headerMatch) {
      elements.push(
        <h3
          key={i}
          className="text-lg font-bold mt-8 mb-3 first:mt-0"
          style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
        >
          {headerMatch[1]}
        </h3>
      );
      continue;
    }

    // Bullet point: • or -
    if (line.startsWith("•") || line.startsWith("- ")) {
      const bulletText = line.replace(/^[•\-]\s*/, "");
      // Parse inline bold within bullet
      const parts = bulletText.split(/\*\*(.+?)\*\*/g);
      elements.push(
        <div
          key={i}
          className="flex gap-3 py-1.5"
        >
          <span className="shrink-0 mt-0.5" style={{ color: "#8B2030" }}>•</span>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}
          >
            {parts.map((part, j) =>
              j % 2 === 1 ? (
                <strong key={j} style={{ color: "#1F2F3A" }}>{part}</strong>
              ) : (
                <span key={j}>{part}</span>
              )
            )}
          </p>
        </div>
      );
      continue;
    }

    // Regular paragraph — parse inline bold
    const parts = line.split(/\*\*(.+?)\*\*/g);
    elements.push(
      <p
        key={i}
        className="text-sm leading-relaxed mb-3"
        style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}
      >
        {parts.map((part, j) =>
          j % 2 === 1 ? (
            <strong key={j} style={{ color: "#1F2F3A" }}>{part}</strong>
          ) : (
            <span key={j}>{part}</span>
          )
        )}
      </p>
    );
  }

  return elements;
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
            The Area
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold text-center mb-14 leading-tight"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
          >
            Neighbourhood Guide
          </h2>
        </div>

        <div
          className="bg-white rounded-xl p-8 sm:p-10"
          style={{
            border: "1px solid #D8D2C8",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          {renderVibeContent(vibe)}
        </div>
      </div>
    </section>
  );
}
