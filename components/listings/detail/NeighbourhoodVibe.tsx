"use client";

import type { PropertyRecord } from "./ListingPage";

interface Props {
  property: PropertyRecord;
}

interface ParsedSection {
  title: string;
  bullets: string[];
  prose: string[];
}

// ── Parse markdown structure into sections ─────────────────────────────────────

function parseSections(text: string): ParsedSection[] {
  const lines = text.split("\n");
  const sections: ParsedSection[] = [];
  let current: ParsedSection | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const headerMatch = line.match(/^\*\*(.+?)\*\*\s*$/);
    if (headerMatch) {
      if (current) sections.push(current);
      current = { title: headerMatch[1], bullets: [], prose: [] };
      continue;
    }

    if (!current) {
      current = { title: "", bullets: [], prose: [] };
    }

    if (line.startsWith("•") || line.startsWith("- ")) {
      current.bullets.push(line.replace(/^[•\-]\s*/, "").trim());
    } else {
      current.prose.push(line);
    }
  }
  if (current && (current.bullets.length || current.prose.length)) sections.push(current);
  return sections;
}

// Strip inline bold markers from display text
function stripBold(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "$1");
}

// Parse inline bold for rendering
function renderInline(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} style={{ color: "#1F2F3A" }}>{part}</strong> : <span key={i}>{part}</span>
  );
}

// ── Section renderers ──────────────────────────────────────────────────────────

function ProseBlock({ prose, bullets }: { prose: string[]; bullets: string[] }) {
  return (
    <div className="space-y-3">
      {prose.map((line, i) => (
        <p key={i} className="text-base leading-relaxed" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
          {renderInline(line)}
        </p>
      ))}
      {bullets.map((b, i) => (
        <div key={i} className="flex gap-3">
          <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#D8D2C8", marginTop: "8px" }} />
          <p className="text-sm leading-relaxed" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
            {renderInline(b)}
          </p>
        </div>
      ))}
    </div>
  );
}

function ChipsSection({ bullets, prose }: { bullets: string[]; prose: string[] }) {
  return (
    <div>
      {prose.map((line, i) => (
        <p key={i} className="text-sm leading-relaxed mb-4" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
          {renderInline(line)}
        </p>
      ))}
      <div className="flex flex-wrap gap-2">
        {bullets.map((b, i) => {
          const clean = stripBold(b);
          // Split "Place — 5 min" into name and time
          const parts = clean.split(/\s*[—–-]\s*/);
          const placeName = parts[0].trim();
          const timeTag = parts[1]?.trim();
          return (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
              style={{ backgroundColor: "#F7F5F2", border: "1px solid #D8D2C8" }}
            >
              <span style={{ color: "#222222", fontFamily: "var(--font-dm-sans)", fontWeight: 500 }}>
                {placeName}
              </span>
              {timeTag && (
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "rgba(139,32,48,0.08)", color: "#8B2030" }}
                >
                  {timeTag}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BenefitsSection({ bullets }: { bullets: string[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {bullets.map((b, i) => {
        const clean = stripBold(b);
        const dashIdx = clean.indexOf("—");
        const label = dashIdx > -1 ? clean.slice(0, dashIdx).trim() : clean;
        const detail = dashIdx > -1 ? clean.slice(dashIdx + 1).trim() : "";
        return (
          <div
            key={i}
            className="flex gap-3 px-4 py-4 rounded-xl"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #D8D2C8" }}
          >
            <div
              className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5"
              style={{ backgroundColor: "rgba(139,32,48,0.08)" }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="#8B2030" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
                {label}
              </p>
              {detail && (
                <p className="text-xs mt-1 leading-snug" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
                  {detail}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CTABlock({ prose }: { prose: string[] }) {
  return (
    <div
      className="rounded-2xl px-7 py-8 text-center"
      style={{ backgroundColor: "#1F2F3A" }}
    >
      {prose.map((line, i) => (
        <p key={i} className="text-sm leading-relaxed mb-3 last:mb-0"
          style={{ color: "rgba(250,248,245,0.80)", fontFamily: "var(--font-dm-sans)" }}>
          {renderInline(line)}
        </p>
      ))}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
        <a
          href="https://prosperaproperties.co/listings"
          className="px-7 py-3.5 rounded-lg text-xs font-semibold uppercase tracking-widest transition-opacity hover:opacity-80"
          style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
        >
          Book a Viewing
        </a>
        <a
          href="tel:5196971227"
          className="px-7 py-3.5 rounded-lg text-xs font-semibold uppercase tracking-widest transition-opacity hover:opacity-70"
          style={{ border: "1px solid rgba(250,248,245,0.20)", color: "rgba(250,248,245,0.65)", fontFamily: "var(--font-dm-sans)" }}
        >
          (519) 697-1227
        </a>
      </div>
    </div>
  );
}

// ── Section title → visual label ───────────────────────────────────────────────

function SectionLabel({ title }: { title: string }) {
  if (!title) return null;
  return (
    <h3
      className="text-xs font-semibold uppercase tracking-widest mb-5"
      style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
    >
      {title}
    </h3>
  );
}

// ── Classify sections ──────────────────────────────────────────────────────────

function classifySection(title: string): "nearby" | "getting_around" | "neighbourhood" | "parks" | "benefits" | "cta" | "generic" {
  const t = title.toLowerCase();
  if (t.includes("what's nearby") || t.includes("whats nearby")) return "nearby";
  if (t.includes("getting around") || t.includes("transit") || t.includes("commut")) return "getting_around";
  if (t.includes("the neighbourhood") || t.includes("neighborhood")) return "neighbourhood";
  if (t.includes("park") || t.includes("school") || t.includes("hospital")) return "parks";
  if (t.includes("why rent") || t.includes("prospera")) return "benefits";
  if (t.includes("schedule") || t.includes("viewing") || t.includes("book")) return "cta";
  return "generic";
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function NeighbourhoodVibe({ property }: Props) {
  const vibe = property.neighbourhood_vibe;
  if (!vibe) return null;

  const sections = parseSections(vibe);
  if (!sections.length) return null;

  // Skip "Getting Around" — MicroLocation already covers it
  const visibleSections = sections.filter((s) => classifySection(s.title) !== "getting_around");

  return (
    <section
      className="py-12 md:py-24 px-5 sm:px-8"
      style={{ backgroundColor: "#FFFFFF" }}
      aria-label="Neighbourhood description"
    >
      <div className="max-w-4xl mx-auto">

        <p
          className="text-xs font-semibold uppercase tracking-widest text-center mb-3"
          style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
        >
          The Area
        </p>
        <h2
          className="text-4xl sm:text-5xl font-bold text-center mb-12 leading-tight"
          style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
        >
          Neighbourhood Guide
        </h2>

        <div className="space-y-10">
          {visibleSections.map((section, i) => {
            const kind = classifySection(section.title);

            if (kind === "cta") {
              return (
                <div key={i}>
                  <CTABlock prose={[...section.prose, ...section.bullets]} />
                </div>
              );
            }

            if (kind === "benefits") {
              return (
                <div key={i}>
                  <SectionLabel title={section.title} />
                  <BenefitsSection bullets={section.bullets} />
                  {section.prose.map((line, j) => (
                    <p key={j} className="text-sm leading-relaxed mt-3" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
                      {renderInline(line)}
                    </p>
                  ))}
                </div>
              );
            }

            if (kind === "nearby" || kind === "parks") {
              return (
                <div key={i}>
                  <SectionLabel title={section.title} />
                  <ChipsSection bullets={section.bullets} prose={section.prose} />
                </div>
              );
            }

            if (kind === "neighbourhood") {
              return (
                <div key={i}>
                  <SectionLabel title={section.title} />
                  <div
                    className="rounded-2xl px-7 py-8"
                    style={{ backgroundColor: "#F7F5F2", border: "1px solid #D8D2C8" }}
                  >
                    <ProseBlock prose={section.prose} bullets={section.bullets} />
                  </div>
                </div>
              );
            }

            // generic fallback
            return (
              <div key={i}>
                {section.title && <SectionLabel title={section.title} />}
                <ProseBlock prose={section.prose} bullets={section.bullets} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
