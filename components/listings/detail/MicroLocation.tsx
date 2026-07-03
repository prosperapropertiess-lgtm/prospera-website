"use client";

import { useState } from "react";
import { Footprints, Bus, Car } from "lucide-react";

import type { PropertyRecord } from "./ListingPage";

interface Props {
  property: PropertyRecord;
}

type Tab = "walk" | "transit" | "drive";

interface ScoreCircleProps {
  score: number;
  label: string;
  color: string;
}

function ScoreCircle({ score, label, color }: ScoreCircleProps) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#D8D2C8" strokeWidth="6" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        <text
          x="40"
          y="45"
          textAnchor="middle"
          fontSize="16"
          fontWeight="700"
          fill="#1F2F3A"
        >
          {score}
        </text>
      </svg>
      <span
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}
      >
        {label}
      </span>
    </div>
  );
}

interface PlaceCategory {
  name: string;
  places: Array<{ name: string; distance?: string; minutes?: number }>;
}

const CATEGORY_EMOJI: Record<string, string> = {
  "Grocery Stores": "🛒",
  "Pharmacies": "💊",
  "Gyms & Fitness": "🏋️",
  "Transit Stops": "🚌",
  "Schools": "🏫",
  "Hospitals & Clinics": "🏥",
  "Parks": "🌳",
  "Restaurants": "🍽️",
  "Cafés": "☕",
  "Cafes": "☕",
  "Banks": "🏦",
  "Popular Spots": "⭐",
};

function getCategoryEmoji(name: string): string {
  // Exact match first
  if (CATEGORY_EMOJI[name]) return CATEGORY_EMOJI[name];
  // Partial match fallback
  const lower = name.toLowerCase();
  if (lower.includes("grocer")) return "🛒";
  if (lower.includes("pharma")) return "💊";
  if (lower.includes("gym") || lower.includes("fitness")) return "🏋️";
  if (lower.includes("transit") || lower.includes("bus") || lower.includes("stop")) return "🚌";
  if (lower.includes("school")) return "🏫";
  if (lower.includes("hospital") || lower.includes("clinic")) return "🏥";
  if (lower.includes("park")) return "🌳";
  if (lower.includes("restaurant")) return "🍽️";
  if (lower.includes("café") || lower.includes("cafe") || lower.includes("coffee")) return "☕";
  if (lower.includes("bank")) return "🏦";
  if (lower.includes("popular") || lower.includes("spot")) return "⭐";
  return "📍";
}

function WalkTab({ neighbourhoodData }: { neighbourhoodData: Record<string, unknown> }) {
  const categories = neighbourhoodData.categories as PlaceCategory[] | undefined;
  if (!categories?.length) {
    return (
      <p className="text-sm" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
        Neighbourhood walkability data coming soon.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {categories.map((cat) => (
        <div
          key={cat.name}
          className="rounded-xl p-6"
          style={{ backgroundColor: "#F7F5F2", border: "1px solid #D8D2C8" }}
        >
          <h4
            className="text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
          >
            <span className="text-base">{getCategoryEmoji(cat.name)}</span>
            {cat.name}
          </h4>
          <ul className="space-y-2">
            {cat.places.slice(0, 4).map((place, i) => (
              <li key={i} className="flex justify-between items-center">
                <span className="text-sm" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                  {place.name}
                </span>
                {(place.distance || place.minutes) && (
                  <span className="text-xs" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
                    {place.distance ?? `${place.minutes} min`}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

interface BusRoute {
  route?: string;
  name?: string;
  stop?: string;
  stop_name?: string;
  frequency?: string;
  walk_time?: string;
  destination?: string;
}

function TransitTab({ busRoutes }: { busRoutes: BusRoute[] }) {
  if (!busRoutes.length) {
    return (
      <p className="text-sm" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
        Transit data coming soon.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {busRoutes.map((route, i) => (
        <div
          key={i}
          className="flex flex-wrap items-center gap-4 p-5 rounded-xl"
          style={{ backgroundColor: "#F7F5F2", border: "1px solid #D8D2C8" }}
        >
          {(route.route || route.name) && (
            <span
              className="text-xs font-bold px-2 py-1 rounded"
              style={{ backgroundColor: "#1F2F3A", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
            >
              {route.route || route.name}
            </span>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
              {route.stop_name || route.stop || route.name || "Bus Stop"}
            </p>
            {route.destination && (
              <p className="text-xs" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
                → {route.destination}
              </p>
            )}
          </div>
          {route.walk_time && (
            <span className="text-xs" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
              {route.walk_time}
            </span>
          )}
          {route.frequency && (
            <span className="text-xs" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
              Every {route.frequency}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function DriveTab({ neighbourhoodData }: { neighbourhoodData: Record<string, unknown> | null }) {
  const highways = neighbourhoodData?.highways as Array<{ name: string; distance?: string; minutes?: number }> | undefined;
  const driveInfo = neighbourhoodData?.drive_info as string | undefined;

  return (
    <div className="space-y-4">
      {driveInfo && (
        <p className="text-base leading-relaxed" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
          {driveInfo}
        </p>
      )}
      {highways?.length ? (
        <div className="space-y-3">
          {highways.map((hw, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-5 rounded-xl"
              style={{ backgroundColor: "#F7F5F2", border: "1px solid #D8D2C8" }}
            >
              <span className="text-sm font-medium" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
                {hw.name}
              </span>
              <span className="text-xs" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
                {hw.distance ?? (hw.minutes ? `${hw.minutes} min` : "")}
              </span>
            </div>
          ))}
        </div>
      ) : (
        !driveInfo && (
          <p className="text-sm" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
            Highway access details coming soon.
          </p>
        )
      )}
    </div>
  );
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "walk", label: "Walk", icon: <Footprints size={15} /> },
  { id: "transit", label: "Transit", icon: <Bus size={15} /> },
  { id: "drive", label: "Drive", icon: <Car size={15} /> },
];

export default function MicroLocation({ property }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("walk");

  const neighbourhoodData = property.neighbourhood_data as Record<string, unknown> | null;
  const busRoutes = (property.bus_routes ?? []) as BusRoute[];

  const walkScore = property.walk_score ?? null;
  const transitScore = property.transit_score ?? null;
  const bikeScore = property.bike_score ?? null;

  const hasScores = walkScore !== null || transitScore !== null || bikeScore !== null;

  return (
    <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="max-w-5xl mx-auto">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest text-center mb-4"
            style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
          >
            Getting Around
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold text-center mb-14 leading-tight"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
          >
            Location & Access
          </h2>
        </div>

        {/* Score circles */}
        {hasScores && (
          <div>
            <div className="flex flex-wrap justify-center gap-10 mb-14">
              {walkScore !== null && <ScoreCircle score={walkScore} label="Walk Score" color="#2D7A4F" />}
              {transitScore !== null && <ScoreCircle score={transitScore} label="Transit Score" color="#1F5FA6" />}
              {bikeScore !== null && <ScoreCircle score={bikeScore} label="Bike Score" color="#7A5A2D" />}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-colors"
              style={{
                backgroundColor: activeTab === tab.id ? "#1F2F3A" : "transparent",
                color: activeTab === tab.id ? "#FAF8F5" : "#666666",
                border: "1px solid",
                borderColor: activeTab === tab.id ? "#1F2F3A" : "#D8D2C8",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {activeTab === "walk" && (
            <WalkTab neighbourhoodData={neighbourhoodData ?? {}} />
          )}
          {activeTab === "transit" && (
            <TransitTab busRoutes={busRoutes} />
          )}
          {activeTab === "drive" && (
            <DriveTab neighbourhoodData={neighbourhoodData} />
          )}
        </div>
      </div>
    </section>
  );
}
