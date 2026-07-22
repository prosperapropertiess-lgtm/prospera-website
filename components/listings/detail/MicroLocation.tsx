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

// ── Category config ────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { emoji: string; color: string }> = {
  "Grocery Stores":        { emoji: "🛒", color: "#2D7A4F" },
  "Popular Spots":         { emoji: "⭐", color: "#8B2030" },
  "Pharmacies":            { emoji: "💊", color: "#1F5FA6" },
  "Gyms & Fitness":        { emoji: "🏋️", color: "#7A5A2D" },
  "Transit Stops":         { emoji: "🚌", color: "#1F2F3A" },
  "Schools":               { emoji: "🏫", color: "#5A2D7A" },
  "Hospitals & Clinics":   { emoji: "🏥", color: "#C44040" },
  "Parks":                 { emoji: "🌳", color: "#2D7A4F" },
  "Restaurants":           { emoji: "🍽️", color: "#B45309" },
  "Cafés":                 { emoji: "☕", color: "#7A5A2D" },
  "Cafes":                 { emoji: "☕", color: "#7A5A2D" },
  "Banks":                 { emoji: "🏦", color: "#1F5FA6" },
  "Shopping Malls":        { emoji: "🛍️", color: "#8B2030" },
  "Shopping Mall":         { emoji: "🛍️", color: "#8B2030" },
  "Universities & Colleges": { emoji: "🎓", color: "#1F5FA6" },
};

// Priority order for default tab selection
const TAB_PRIORITY = [
  "Grocery Stores", "Popular Spots", "Cafés", "Cafes", "Restaurants",
  "Universities & Colleges", "Hospitals & Clinics", "Pharmacies",
  "Transit Stops", "Parks", "Gyms & Fitness", "Schools", "Banks",
  "Shopping Malls", "Shopping Mall",
];

function getConfig(name: string) {
  if (CATEGORY_CONFIG[name]) return CATEGORY_CONFIG[name];
  const lower = name.toLowerCase();
  if (lower.includes("grocer"))  return { emoji: "🛒", color: "#2D7A4F" };
  if (lower.includes("popular")) return { emoji: "⭐", color: "#8B2030" };
  if (lower.includes("pharma"))  return { emoji: "💊", color: "#1F5FA6" };
  if (lower.includes("gym"))     return { emoji: "🏋️", color: "#7A5A2D" };
  if (lower.includes("transit") || lower.includes("bus")) return { emoji: "🚌", color: "#1F2F3A" };
  if (lower.includes("universit") || lower.includes("college")) return { emoji: "🎓", color: "#1F5FA6" };
  if (lower.includes("school"))  return { emoji: "🏫", color: "#5A2D7A" };
  if (lower.includes("hospital") || lower.includes("clinic")) return { emoji: "🏥", color: "#C44040" };
  if (lower.includes("park"))    return { emoji: "🌳", color: "#2D7A4F" };
  if (lower.includes("restaurant")) return { emoji: "🍽️", color: "#B45309" };
  if (lower.includes("café") || lower.includes("cafe") || lower.includes("coffee")) return { emoji: "☕", color: "#7A5A2D" };
  if (lower.includes("bank"))    return { emoji: "🏦", color: "#1F5FA6" };
  if (lower.includes("mall") || lower.includes("shopping")) return { emoji: "🛍️", color: "#8B2030" };
  return { emoji: "📍", color: "#666666" };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseMinutes(place: PlaceItem): number | null {
  const timeStr = (place.walk_time || place.distance || "").toLowerCase();

  // Already "X min"
  const minMatch = timeStr.match(/(\d+)\s*min/);
  if (minMatch) return parseInt(minMatch[1]);

  // Distance string → estimate
  let distMetres: number | null = null;
  if (/[\d.]+\s*km/i.test(timeStr)) {
    distMetres = parseFloat(timeStr) * 1000;
  } else if (/^\d+$/.test(timeStr.trim())) {
    distMetres = parseInt(timeStr);
  }
  if (distMetres === null) return null;
  if (distMetres < 1500) return Math.max(1, Math.round(distMetres / 80));
  return Math.max(2, Math.round(distMetres / 500));
}

function getMode(place: PlaceItem): "walk" | "drive" {
  const timeStr = (place.walk_time || place.distance || "").toLowerCase();
  // Explicit keyword wins — "14 min drive" → drive, "21 mins walk" → walk
  if (timeStr.includes("drive")) return "drive";
  if (timeStr.includes("walk")) return "walk";
  // No keyword — fall back to heuristics
  const minMatch = timeStr.match(/(\d+)\s*min/);
  if (minMatch && parseInt(minMatch[1]) > 20) return "drive";
  if (/[\d.]+\s*km/i.test(timeStr)) {
    const km = parseFloat(timeStr);
    return km >= 1.5 ? "drive" : "walk";
  }
  return "walk";
}

function formatDisplayTime(place: PlaceItem): string {
  const mins = parseMinutes(place);
  if (mins === null) return place.walk_time || place.distance || "—";
  return `${mins}`;
}

function scoreDescription(score: number, type: "walk" | "transit" | "bike"): string {
  if (type === "walk") {
    if (score >= 90) return "Walker's Paradise";
    if (score >= 70) return "Very Walkable";
    if (score >= 50) return "Somewhat Walkable";
    if (score >= 25) return "Car-Dependent";
    return "Car Required";
  }
  if (type === "transit") {
    if (score >= 90) return "Rider's Paradise";
    if (score >= 70) return "Excellent Transit";
    if (score >= 50) return "Good Transit";
    if (score >= 25) return "Some Transit";
    return "Minimal Transit";
  }
  if (score >= 90) return "Biker's Paradise";
  if (score >= 70) return "Very Bikeable";
  if (score >= 50) return "Bikeable";
  if (score >= 25) return "Bikeable with Care";
  return "Minimal Bike Infra";
}

function scoreColor(score: number): string {
  if (score >= 80) return "#2D7A4F";
  if (score >= 60) return "#7A5A2D";
  if (score >= 40) return "#B45309";
  return "#888888";
}

// ── Build categories from raw Google-type keys ────────────────────────────────

const RAW_TYPE_LABELS: Record<string, string> = {
  grocery_or_supermarket: "Grocery Stores",
  pharmacy: "Pharmacies",
  gym: "Gyms & Fitness",
  transit_station: "Transit Stops",
  school: "Schools",
  hospital: "Hospitals & Clinics",
  park: "Parks",
  restaurant: "Restaurants",
  cafe: "Cafés",
  bank: "Banks",
  popular_spots: "Popular Spots",
  shopping_mall: "Shopping Malls",
  university: "Universities & Colleges",
};

function buildCategoriesFromRaw(data: Record<string, unknown>): PlaceCategory[] {
  return Object.entries(data)
    .filter(([key, val]) => key in RAW_TYPE_LABELS && Array.isArray(val) && (val as unknown[]).length > 0)
    .map(([key, val]) => ({
      name: RAW_TYPE_LABELS[key],
      places: (val as { name: string; distance?: string; walk_time?: string; vicinity?: string; place_id?: string }[])
        .slice(0, 8)
        .map((p) => ({ name: p.name, distance: p.distance, walk_time: p.walk_time, vicinity: p.vicinity, place_id: p.place_id })),
    }));
}

// ── Score card ─────────────────────────────────────────────────────────────────

function ScoreCard({ score, label, type }: { score: number; label: string; type: "walk" | "transit" | "bike" }) {
  const color = scoreColor(score);
  const desc = scoreDescription(score, type);
  const radius = 36;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;
  const modeIcon = type === "walk" ? "🚶" : type === "transit" ? "🚌" : "🚴";
  const size = 88;
  const center = size / 2;

  return (
    <div
      className="flex flex-col items-center gap-3 flex-1 py-7 px-4 rounded-2xl"
      style={{ backgroundColor: "#F7F5F2", border: "1px solid #D8D2C8" }}
    >
      {/* Ring with number overlaid in HTML */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", top: 0, left: 0 }}>
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#E8E4DE" strokeWidth={strokeWidth} />
          <circle cx={center} cy={center} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circumference} strokeDashoffset={dashOffset}
            strokeLinecap="round" transform={`rotate(-90 ${center} ${center})`}
            style={{ transition: "stroke-dashoffset 0.8s ease" }} />
        </svg>
        <p
          className="font-bold leading-none z-10"
          style={{ fontSize: "2rem", color: "#1F2F3A", fontFamily: "var(--font-dm-sans)", position: "relative" }}
        >
          {score}
        </p>
      </div>
      <div className="text-center">
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: "#999" }}>
          {modeIcon} {label}
        </p>
        <p className="text-sm font-bold" style={{ color }}>
          {desc}
        </p>
      </div>
    </div>
  );
}

// ── Place card ─────────────────────────────────────────────────────────────────

function PlaceCard({ place, categoryName }: { place: PlaceItem; categoryName: string }) {
  const mode = getMode(place);
  const mins = formatDisplayTime(place);
  const config = getConfig(categoryName);

  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-3 transition-shadow hover:shadow-md"
      style={{ backgroundColor: "#FFFFFF", border: "1px solid #D8D2C8", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
    >
      {/* Time hero */}
      <div className="flex items-end gap-1">
        <span
          className="font-bold leading-none"
          style={{ fontSize: "2.5rem", color: "#1F2F3A", fontFamily: "var(--font-dm-sans)", lineHeight: 1 }}
        >
          {mins}
        </span>
        <span className="text-sm font-medium pb-1" style={{ color: "#666666" }}>min</span>
      </div>

      {/* Mode pill */}
      <div
        className="self-start px-2.5 py-1 rounded-full text-xs font-semibold"
        style={{
          backgroundColor: mode === "walk" ? "rgba(45,122,79,0.10)" : "rgba(31,47,58,0.08)",
          color: mode === "walk" ? "#2D7A4F" : "#1F2F3A",
        }}
      >
        {mode === "walk" ? "🚶 Walk" : "🚗 Drive"}
      </div>

      {/* Place name */}
      <div>
        <p className="text-xs mb-0.5" style={{ color: config.color, fontSize: "18px" }}>{config.emoji}</p>
        <p className="text-sm font-semibold leading-snug" style={{ color: "#222222", fontFamily: "var(--font-dm-sans)" }}>
          {place.name}
        </p>
        {place.vicinity && (
          <p className="text-xs mt-0.5 truncate" style={{ color: "#999999" }}>{place.vicinity}</p>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function MicroLocation({ property }: Props) {
  const neighbourhoodData = property.neighbourhood_data as Record<string, unknown> | null;
  const busRoutes  = (property.bus_routes ?? []) as BusRoute[];
  const walkScore    = property.walk_score    ?? null;
  const transitScore = property.transit_score ?? null;
  const bikeScore    = property.bike_score    ?? null;

  const storedCategories = (neighbourhoodData?.categories as PlaceCategory[] | undefined) ?? [];
  const categories: PlaceCategory[] = storedCategories.length > 0
    ? storedCategories
    : (neighbourhoodData ? buildCategoriesFromRaw(neighbourhoodData) : []);

  // Sort categories by priority
  const sortedCategories = [...categories].sort((a, b) => {
    const ai = TAB_PRIORITY.indexOf(a.name);
    const bi = TAB_PRIORITY.indexOf(b.name);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const [activeTab, setActiveTab] = useState<string>(sortedCategories[0]?.name ?? "");

  const hasScores = walkScore !== null || transitScore !== null || bikeScore !== null;
  const activePlaces = sortedCategories.find((c) => c.name === activeTab)?.places ?? [];

  if (!hasScores && !categories.length && !busRoutes.length) return null;

  return (
    <section className="py-12 md:py-24 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2" }}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <p className="text-xs font-semibold uppercase tracking-widest text-center mb-3"
          style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
          Getting Around
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-3 leading-tight"
          style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
          Location & Nearby
        </h2>
        <p className="text-center text-sm mb-10 md:mb-14 max-w-md mx-auto"
          style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
          See how far the things that matter are from your front door.
        </p>

        {/* Score cards */}
        {hasScores && (
          <div className="flex gap-3 md:gap-5 mb-10 md:mb-14">
            {walkScore    !== null && <ScoreCard score={walkScore}    label="Walk"    type="walk"    />}
            {transitScore !== null && <ScoreCard score={transitScore} label="Transit" type="transit" />}
            {bikeScore    !== null && <ScoreCard score={bikeScore}    label="Bike"    type="bike"    />}
          </div>
        )}

        {/* Category tab explorer */}
        {sortedCategories.length > 0 && (
          <div>
            {/* Tab strip */}
            <div
              className="flex gap-2 mb-6 overflow-x-auto pb-1"
              style={{ scrollbarWidth: "none" }}
            >
              {sortedCategories.map((cat) => {
                const config = getConfig(cat.name);
                const isActive = activeTab === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setActiveTab(cat.name)}
                    className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: isActive ? "#1F2F3A" : "#FFFFFF",
                      color: isActive ? "#FAF8F5" : "#333333",
                      border: `1px solid ${isActive ? "#1F2F3A" : "#D8D2C8"}`,
                      fontFamily: "var(--font-dm-sans)",
                      letterSpacing: "0.03em",
                    }}
                  >
                    {config.emoji} {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Place cards */}
            {activePlaces.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                {activePlaces.slice(0, 9).map((place, i) => (
                  <PlaceCard key={i} place={place} categoryName={activeTab} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 rounded-2xl" style={{ border: "1px dashed #D8D2C8", backgroundColor: "#FFFFFF" }}>
                <p className="text-sm" style={{ color: "#999999" }}>No places listed for this category yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Bus routes */}
        {busRoutes.length > 0 && (
          <div className="mt-8 md:mt-10">
            <p className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
              🚌 Bus Routes
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {busRoutes.slice(0, 6).map((route, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-5 py-4 rounded-xl"
                  style={{ backgroundColor: "#FFFFFF", border: "1px solid #D8D2C8" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold"
                    style={{ backgroundColor: "#1F2F3A", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
                  >
                    {route.route || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-tight truncate"
                      style={{ color: "#222222", fontFamily: "var(--font-dm-sans)" }}>
                      {route.stop_name || route.stop || route.name || "Bus Stop"}
                    </p>
                    {route.walk_time && (
                      <p className="text-xs mt-0.5" style={{ color: "#666666" }}>
                        🚶 {route.walk_time} from door
                      </p>
                    )}
                    {route.frequency && (
                      <p className="text-xs mt-0.5" style={{ color: "#999999" }}>
                        Every {route.frequency}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No data at all */}
        {!hasScores && !categories.length && !busRoutes.length && (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: "#999999" }}>Neighbourhood data coming soon.</p>
          </div>
        )}

      </div>
    </section>
  );
}
