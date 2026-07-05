"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  "Grocery Stores": { emoji: "🛒", color: "#2D7A4F" },
  "Popular Spots": { emoji: "⭐", color: "#8B2030" },
  "Pharmacies": { emoji: "💊", color: "#1F5FA6" },
  "Gyms & Fitness": { emoji: "🏋️", color: "#7A5A2D" },
  "Transit Stops": { emoji: "🚌", color: "#1F2F3A" },
  "Schools": { emoji: "🏫", color: "#5A2D7A" },
  "Hospitals & Clinics": { emoji: "🏥", color: "#C44040" },
  "Parks": { emoji: "🌳", color: "#2D7A4F" },
  "Restaurants": { emoji: "🍽️", color: "#B45309" },
  "Cafés": { emoji: "☕", color: "#7A5A2D" },
  "Cafes": { emoji: "☕", color: "#7A5A2D" },
  "Banks": { emoji: "🏦", color: "#1F5FA6" },
};

function getConfig(name: string) {
  if (CATEGORY_CONFIG[name]) return CATEGORY_CONFIG[name];
  const lower = name.toLowerCase();
  if (lower.includes("grocer")) return { emoji: "🛒", color: "#2D7A4F" };
  if (lower.includes("popular")) return { emoji: "⭐", color: "#8B2030" };
  if (lower.includes("pharma")) return { emoji: "💊", color: "#1F5FA6" };
  if (lower.includes("gym")) return { emoji: "🏋️", color: "#7A5A2D" };
  if (lower.includes("transit") || lower.includes("bus")) return { emoji: "🚌", color: "#1F2F3A" };
  if (lower.includes("school")) return { emoji: "🏫", color: "#5A2D7A" };
  if (lower.includes("hospital") || lower.includes("clinic")) return { emoji: "🏥", color: "#C44040" };
  if (lower.includes("park")) return { emoji: "🌳", color: "#2D7A4F" };
  if (lower.includes("restaurant")) return { emoji: "🍽️", color: "#B45309" };
  if (lower.includes("café") || lower.includes("cafe") || lower.includes("coffee")) return { emoji: "☕", color: "#7A5A2D" };
  if (lower.includes("bank")) return { emoji: "🏦", color: "#1F5FA6" };
  return { emoji: "📍", color: "#666666" };
}

function ScoreCircle({ score, label, color }: { score: number; label: string; color: string }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="#D8D2C8" strokeWidth="5" />
        <circle
          cx="32" cy="32" r={radius} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circumference} strokeDashoffset={dashOffset}
          strokeLinecap="round" transform="rotate(-90 32 32)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        <text x="32" y="37" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1F2F3A">{score}</text>
      </svg>
      <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
        {label}
      </span>
    </div>
  );
}

// ─── Leaflet map (OpenStreetMap, no API key) ────────────────────────────────

interface MapMarker {
  lat: number;
  lng: number;
  label: string;
  color: string;
  isProperty?: boolean;
}

function LeafletMap({ center, markers }: { center: [number, number]; markers: MapMarker[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markerLayerRef = useRef<unknown>(null);
  const [ready, setReady] = useState(false);

  // Initialise map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;

      // Fix default icon paths (webpack/next strips them)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center,
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      markerLayerRef.current = L.layerGroup().addTo(map);
      setReady(true);
    });

    return () => {
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstanceRef.current as any).remove();
        mapInstanceRef.current = null;
        markerLayerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-draw markers whenever they change
  useEffect(() => {
    if (!ready || !mapInstanceRef.current || !markerLayerRef.current) return;

    import("leaflet").then((L) => {
      if (!markerLayerRef.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (markerLayerRef.current as any).clearLayers();

      const bounds: [number, number][] = [];

      markers.forEach((m) => {
        const icon = L.divIcon({
          className: "",
          html: m.isProperty
            ? `<div style="background:${m.color};color:white;padding:5px 10px;border-radius:16px;font-weight:700;font-size:12px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.25);font-family:system-ui">📍 ${m.label}</div>`
            : `<div style="background:white;border:2px solid ${m.color};padding:3px 8px;border-radius:10px;font-size:11px;font-weight:600;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.15);font-family:system-ui">${m.label}</div>`,
          iconAnchor: [0, 0],
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        L.marker([m.lat, m.lng], { icon }).addTo(markerLayerRef.current as any);
        bounds.push([m.lat, m.lng]);
      });

      if (bounds.length > 1) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstanceRef.current as any).fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
      } else if (bounds.length === 1) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstanceRef.current as any).setView(bounds[0], 15);
      }
    });
  }, [ready, markers]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div ref={mapRef} className="w-full h-[300px] md:h-[450px]" />
    </>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function MicroLocation({ property }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceItem | null>(null);

  const neighbourhoodData = property.neighbourhood_data as Record<string, unknown> | null;
  const busRoutes = (property.bus_routes ?? []) as BusRoute[];
  const lat = (property as Record<string, unknown>).latitude as number | null;
  const lng = (property as Record<string, unknown>).longitude as number | null;

  const walkScore = property.walk_score ?? null;
  const transitScore = property.transit_score ?? null;
  const bikeScore = property.bike_score ?? null;

  const categories = (neighbourhoodData?.categories as PlaceCategory[] | undefined) ?? [];

  // Build markers for the current active category
  const markers = useCallback((): MapMarker[] => {
    const result: MapMarker[] = [];

    if (lat && lng) {
      result.push({ lat, lng, label: property.address, color: "#8B2030", isProperty: true });
    }

    if (!activeCategory || !lat || !lng) return result;

    const cat = categories.find((c) => c.name === activeCategory);
    if (!cat) return result;

    const config = getConfig(activeCategory);
    cat.places.slice(0, 6).forEach((place, i) => {
      const dist = parseInt(place.distance || "500") / 1000;
      const angle = (i / Math.min(cat.places.length, 6)) * 2 * Math.PI;
      const placeLat = lat + (dist / 111) * Math.cos(angle);
      const placeLng = lng + (dist / (111 * Math.cos((lat * Math.PI) / 180))) * Math.sin(angle);
      result.push({
        lat: placeLat,
        lng: placeLng,
        label: `${config.emoji} ${place.name.length > 22 ? place.name.slice(0, 20) + "…" : place.name}`,
        color: config.color,
      });
    });

    return result;
  }, [lat, lng, property.address, activeCategory, categories]);

  const hasScores = walkScore !== null || transitScore !== null || bikeScore !== null;
  const hasMap = lat !== null && lng !== null;

  return (
    <section className="py-12 md:py-24 px-5 sm:px-8" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="max-w-5xl mx-auto">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-center mb-4"
            style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
            Getting Around
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 md:mb-14 leading-tight"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
            Location & Nearby
          </h2>
        </div>

        {/* Scores row */}
        {hasScores && (
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-8 md:mb-12">
            {walkScore !== null && <ScoreCircle score={walkScore} label="Walk" color="#2D7A4F" />}
            {transitScore !== null && <ScoreCircle score={transitScore} label="Transit" color="#1F5FA6" />}
            {bikeScore !== null && <ScoreCircle score={bikeScore} label="Bike" color="#7A5A2D" />}
          </div>
        )}

        {/* Map + sidebar layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Map */}
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #D8D2C8" }}>
            {hasMap ? (
              <LeafletMap
                center={[lat!, lng!]}
                markers={markers()}
              />
            ) : (
              <div className="w-full h-[300px] md:h-[450px] flex items-center justify-center" style={{ backgroundColor: "#F7F5F2" }}>
                <p className="text-sm" style={{ color: "#666666" }}>Map not available for this property.</p>
              </div>
            )}

            {/* Category filter chips */}
            {categories.length > 0 && (
              <div className="p-3 flex flex-wrap gap-2" style={{ backgroundColor: "#FAFAF8", borderTop: "1px solid #D8D2C8" }}>
                {categories.map((cat) => {
                  const config = getConfig(cat.name);
                  const isActive = activeCategory === cat.name;
                  return (
                    <button
                      key={cat.name}
                      onClick={() => { setActiveCategory(isActive ? null : cat.name); setSelectedPlace(null); }}
                      className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                      style={{
                        backgroundColor: isActive ? config.color : "white",
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
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Selected place detail */}
            {selectedPlace && (
              <div className="rounded-xl p-4" style={{ backgroundColor: "#F7F5F2", border: "1px solid #D8D2C8" }}>
                <p className="text-sm font-semibold mb-1" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
                  {selectedPlace.name}
                </p>
                {selectedPlace.distance && (
                  <p className="text-xs" style={{ color: "#666666" }}>{selectedPlace.walk_time || selectedPlace.distance}</p>
                )}
                <button onClick={() => setSelectedPlace(null)} className="text-xs mt-2 underline" style={{ color: "#8B2030" }}>Close</button>
              </div>
            )}

            {/* Active category places */}
            {activeCategory && (
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #D8D2C8" }}>
                <div className="px-4 py-3" style={{ backgroundColor: "#1F2F3A" }}>
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>
                    {getConfig(activeCategory).emoji} {activeCategory}
                  </p>
                </div>
                <div className="divide-y" style={{ borderColor: "#E8E4DE" }}>
                  {categories.find((c) => c.name === activeCategory)?.places.slice(0, 6).map((place, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedPlace(place)}
                      className="flex justify-between items-center px-4 py-3 bg-white w-full text-left hover:bg-[#F7F5F2] transition-colors"
                    >
                      <span className="text-sm" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                        {place.name}
                      </span>
                      <span className="text-xs shrink-0 ml-3" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
                        {place.walk_time || place.distance || ""}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bus routes */}
            {busRoutes.length > 0 && (
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #D8D2C8" }}>
                <div className="px-4 py-3" style={{ backgroundColor: "#1F2F3A" }}>
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>
                    🚌 Bus Routes
                  </p>
                </div>
                <div className="divide-y" style={{ borderColor: "#E8E4DE" }}>
                  {busRoutes.slice(0, 5).map((route, i) => (
                    <div key={i} className="flex justify-between items-center px-4 py-3 bg-white">
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
            )}

            {/* No category prompt */}
            {!activeCategory && !busRoutes.length && (
              <div className="rounded-xl p-6 text-center" style={{ backgroundColor: "#F7F5F2", border: "1px solid #D8D2C8" }}>
                <p className="text-sm" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
                  Tap a category to see nearby places on the map
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
