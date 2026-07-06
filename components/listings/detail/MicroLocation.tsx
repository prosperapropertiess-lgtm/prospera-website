"use client";

import { useState } from "react";
import type { PropertyRecord } from "./ListingPage";

interface Props {
  property: PropertyRecord;
}

interface PlaceItem {
  name: string;
  distance?: string;
  walk_time?: string;
  vicinity?: string;
  place_id?: string;
}

interface PlaceCategory {
  name: string;
  places: PlaceItem[];
}

interface BusRoute {
  route?: string;
  name?: string;
  stop_name?: string;
  stop?: string;
  walk_time?: string;
  frequency?: string;
}

const CATEGORY_CONFIG: Record<string, { emoji: string; color: string }> = {
  "Grocery Stores":       { emoji: "🛒", color: "#2D7A4F" },
  "Popular Spots":        { emoji: "⭐", color: "#8B2030" },
  "Pharmacies":           { emoji: "💊", color: "#1F5FA6" },
  "Gyms & Fitness":       { emoji: "🏋️", color: "#7A5A2D" },
  "Transit Stops":        { emoji: "🚌", color: "#1F2F3A" },
  "Schools":              { emoji: "🏫", color: "#5A2D7A" },
  "Hospitals & Clinics":  { emoji: "🏥", color: "#C44040" },
  "Parks":                { emoji: "🌳", color: "#2D7A4F" },
  "Restaurants":          { emoji: "🍽️", color: "#B45309" },
  "Cafés":                { emoji: "☕", color: "#7A5A2D" },
  "Cafes":                { emoji: "☕", color: "#7A5A2D" },
  "Banks":                { emoji: "🏦", color: "#1F5FA6" },
};

function getConfig(name: string) {
  if (CATEGORY_CONFIG[name]) return CATEGORY_CONFIG[name];
  const lower = name.toLowerCase();
  if (lower.includes("grocer"))  return { emoji: "🛒", color: "#2D7A4F" };
  if (lower.includes("popular")) return { emoji: "⭐", color: "#8B2030" };
  if (lower.includes("pharma"))  return { emoji: "💊", color: "#1F5FA6" };
  if (lower.includes("gym"))     return { emoji: "🏋️", color: "#7A5A2D" };
  if (lower.includes("transit") || lower.includes("bus")) return { emoji: "🚌", color: "#1F2F3A" };
  if (lower.includes("school"))  return { emoji: "🏫", color: "#5A2D7A" };
  if (lower.includes("hospital") || lower.includes("clinic")) return { emoji: "🏥", color: "#C44040" };
  if (lower.includes("park"))    return { emoji: "🌳", color: "#2D7A4F" };
  if (lower.includes("restaurant")) return { emoji: "🍽️", color: "#B45309" };
  if (lower.includes("café") || lower.includes("cafe") || lower.includes("coffee")) return { emoji: "☕", color: "#7A5A2D" };
  if (lower.includes("bank"))    return { emoji: "🏦", color: "#1F5FA6" };
  return { emoji: "📍", color: "#666666" };
}

function getTransport(place: PlaceItem): { icon: string } {
  const dist = parseInt(place.distance || "1200");
  const wt = place.walk_time || "";
  const mins = parseInt(wt);
  const isWalk = dist < 1200 || (mins > 0 && mins <= 20 && wt.toLowerCase().includes("walk"));
  return { icon: isWalk ? "🚶" : "🚗" };
}

function formatTime(place: PlaceItem): string {
  if (place.walk_time) return place.walk_time.replace(/\s*walk\s*/i, "").trim();
  const dist = parseInt(place.distance || "1000");
  return dist < 1200
    ? `${Math.round(dist / 80)} min walk`
    : `${Math.round(dist / 500)} min drive`;
}

// ── Score circle (unchanged) ──────────────────────────────────────────────────

function ScoreCircle({ score, label, color }: { score: number; label: string; color: string }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="#D8D2C8" strokeWidth="5" />
        <circle cx="32" cy="32" r={radius} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circumference} strokeDashoffset={dashOffset}
          strokeLinecap="round" transform="rotate(-90 32 32)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }} />
        <text x="32" y="37" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1F2F3A">{score}</text>
      </svg>
      <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
        {label}
      </span>
    </div>
  );
}

// ── Proximity diagram (SVG hub-and-spoke) ─────────────────────────────────────

interface SpotData {
  name: string;
  emoji: string;
  color: string;
  distance?: string;
  walk_time?: string;
}

function ProximityDiagram({ spots }: { spots: SpotData[] }) {

  const SIZE   = 500;
  const CX     = SIZE / 2;
  const CY     = SIZE / 2;
  const RADIUS = 148;

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="w-full"
      style={{ maxWidth: 500, margin: "0 auto", display: "block" }}
      aria-hidden="true"
    >
      {/* ── Spokes ── */}
      {spots.map((spot, i) => {
        const angle = (i / spots.length) * 2 * Math.PI - Math.PI / 2;
        const nx = CX + RADIUS * Math.cos(angle);
        const ny = CY + RADIUS * Math.sin(angle);
        const mx = CX + RADIUS * 0.50 * Math.cos(angle);
        const my = CY + RADIUS * 0.50 * Math.sin(angle);
        const { icon: transportIcon } = getTransport(spot as PlaceItem);
        const timeLabel = formatTime(spot as PlaceItem);
        const shortName = spot.name.length > 17 ? spot.name.slice(0, 15) + "…" : spot.name;

        return (
          <g key={i}>
            {/* Dotted line */}
            <line
              x1={CX} y1={CY} x2={nx} y2={ny}
              stroke="#D8D2C8" strokeWidth="1.5" strokeDasharray="5 5"
            />

            {/* Transport icon midpoint */}
            <text x={mx} y={my} textAnchor="middle" dominantBaseline="middle" fontSize="13">
              {transportIcon}
            </text>

            {/* Outer glow ring */}
            <circle cx={nx} cy={ny} r="28" fill={spot.color} opacity="0.08" />
            {/* Node circle */}
            <circle cx={nx} cy={ny} r="23" fill="#FFFFFF" stroke={spot.color} strokeWidth="2.5" />
            {/* Category emoji */}
            <text x={nx} y={ny} textAnchor="middle" dominantBaseline="middle" fontSize="17">
              {spot.emoji}
            </text>

            {/* Place name */}
            <text x={nx} y={ny + 34} textAnchor="middle" fontSize="10" fontWeight="600"
              fill="#222222" fontFamily="system-ui, sans-serif">
              {shortName}
            </text>
            {/* Time label */}
            <text x={nx} y={ny + 46} textAnchor="middle" fontSize="9"
              fill="#888888" fontFamily="system-ui, sans-serif">
              {timeLabel}
            </text>
          </g>
        );
      })}

      {/* ── Centre node ── */}
      <circle cx={CX} cy={CY} r="38" fill="#1F2F3A" />
      <circle cx={CX} cy={CY} r="38" fill="none" stroke="rgba(250,248,245,0.12)" strokeWidth="2" />
      <text x={CX} y={CY - 5} textAnchor="middle" dominantBaseline="middle" fontSize="22">🏠</text>
      <text x={CX} y={CY + 14} textAnchor="middle" fontSize="8.5" fontWeight="700"
        fill="rgba(250,248,245,0.65)" fontFamily="system-ui, sans-serif" letterSpacing="1">
        YOUR HOME
      </text>
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MicroLocation({ property }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const neighbourhoodData = property.neighbourhood_data as Record<string, unknown> | null;
  const busRoutes  = (property.bus_routes ?? []) as BusRoute[];
  const walkScore  = property.walk_score   ?? null;
  const transitScore = property.transit_score ?? null;
  const bikeScore  = property.bike_score   ?? null;
  const categories = (neighbourhoodData?.categories as PlaceCategory[] | undefined) ?? [];

  const hasScores = walkScore !== null || transitScore !== null || bikeScore !== null;

  // Best one place per category, max 8 spots on the diagram
  const diagramSpots: SpotData[] = categories
    .flatMap((cat) => {
      const config = getConfig(cat.name);
      return cat.places.slice(0, 1).map((p) => ({
        name: p.name,
        emoji: config.emoji,
        color: config.color,
        distance: p.distance,
        walk_time: p.walk_time,
      }));
    })
    .slice(0, 8);

  // Only skip if there is truly nothing to show at all
  if (!neighbourhoodData && !busRoutes.length && !hasScores) return null;

  return (
    <section className="py-12 md:py-24 px-5 sm:px-8" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="max-w-5xl mx-auto">

        <p className="text-xs font-semibold uppercase tracking-widest text-center mb-4"
          style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
          Getting Around
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 md:mb-12 leading-tight"
          style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
          Location & Nearby
        </h2>

        {/* Walk / transit / bike scores */}
        {hasScores && (
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-10">
            {walkScore   !== null && <ScoreCircle score={walkScore}   label="Walk"    color="#2D7A4F" />}
            {transitScore !== null && <ScoreCircle score={transitScore} label="Transit" color="#1F5FA6" />}
            {bikeScore   !== null && <ScoreCircle score={bikeScore}   label="Bike"    color="#7A5A2D" />}
          </div>
        )}

        {/* Proximity diagram — always show when section renders */}
        <div className="mb-10 px-2 sm:px-8">
          <ProximityDiagram spots={diagramSpots} />
        </div>

        {/* Category filter chips */}
        {categories.length > 0 && (
          <div>
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {categories.map((cat) => {
                const config = getConfig(cat.name);
                const isActive = activeCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(isActive ? null : cat.name)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                    style={{
                      backgroundColor: isActive ? config.color : "#F7F5F2",
                      color: isActive ? "white" : "#333333",
                      border: `1px solid ${isActive ? config.color : "#D8D2C8"}`,
                      fontFamily: "var(--font-dm-sans)",
                    }}
                  >
                    {config.emoji} {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Place list */}
            {activeCategory && (
              <div className="rounded-xl overflow-hidden max-w-xl mx-auto"
                style={{ border: "1px solid #D8D2C8" }}>
                <div className="px-4 py-3" style={{ backgroundColor: "#1F2F3A" }}>
                  <p className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>
                    {getConfig(activeCategory).emoji} {activeCategory}
                  </p>
                </div>
                <div className="divide-y bg-white" style={{ borderColor: "#E8E4DE" }}>
                  {categories.find((c) => c.name === activeCategory)?.places.slice(0, 6).map((place, i) => (
                    <div key={i} className="flex justify-between items-center px-4 py-3">
                      <span className="text-sm" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                        {place.name}
                      </span>
                      <span className="text-xs shrink-0 ml-3" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
                        {place.walk_time || place.distance || ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bus routes */}
        {busRoutes.length > 0 && (
          <div className="mt-6 max-w-xl mx-auto">
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #D8D2C8" }}>
              <div className="px-4 py-3" style={{ backgroundColor: "#1F2F3A" }}>
                <p className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>
                  🚌 Bus Routes
                </p>
              </div>
              <div className="divide-y bg-white" style={{ borderColor: "#E8E4DE" }}>
                {busRoutes.slice(0, 5).map((route, i) => (
                  <div key={i} className="flex justify-between items-center px-4 py-3">
                    <span className="text-sm" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                      {route.stop_name || route.stop || route.name || "Bus Stop"}
                    </span>
                    <span className="text-xs shrink-0 ml-3" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
                      {route.walk_time || ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
