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

export default function MicroLocation({ property }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
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

  // Load Google Maps
  useEffect(() => {
    if (!lat || !lng || !mapRef.current) return;
    if (mapInstanceRef.current) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    // Check if already loaded
    if (window.google?.maps) {
      initMap();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = initMap;
    document.head.appendChild(script);

    function initMap() {
      if (!mapRef.current || !lat || !lng) return;
      const map = new google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: 15,
        disableDefaultUI: true,
        zoomControl: true,
        mapId: "prospera-listing-map",
        styles: [
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
          { featureType: "water", stylers: [{ color: "#c9e4f5" }] },
          { featureType: "landscape", stylers: [{ color: "#f0ece6" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
          { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#666666" }] },
        ],
      });
      mapInstanceRef.current = map;

      // Property marker
      const propertyEl = document.createElement("div");
      propertyEl.innerHTML = `<div style="background:#8B2030;color:white;padding:6px 12px;border-radius:20px;font-weight:700;font-size:13px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-family:system-ui">📍 ${property.address}</div>`;
      new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat, lng },
        content: propertyEl,
        zIndex: 1000,
      });
    }
  }, [lat, lng, property.address]);

  // Update markers when category changes
  const updateMarkers = useCallback((catName: string | null) => {
    // Clear existing markers
    markersRef.current.forEach((m) => (m.map = null));
    markersRef.current = [];

    if (!mapInstanceRef.current || !catName) return;

    const cat = categories.find((c) => c.name === catName);
    if (!cat) return;

    const config = getConfig(catName);
    const bounds = new google.maps.LatLngBounds();
    if (lat && lng) bounds.extend({ lat, lng });

    // We don't have lat/lng for each place, so use Places API to geocode
    // For now, just show the list — the map centers on the property
    // and users can see the area
    cat.places.slice(0, 6).forEach((place, i) => {
      if (!mapInstanceRef.current || !lat || !lng) return;
      // Approximate positions in a circle around the property based on distance
      const dist = parseInt(place.distance || "500") / 1000; // km
      const angle = (i / Math.min(cat.places.length, 6)) * 2 * Math.PI;
      const placeLat = lat + (dist / 111) * Math.cos(angle);
      const placeLng = lng + (dist / (111 * Math.cos(lat * Math.PI / 180))) * Math.sin(angle);

      const el = document.createElement("div");
      el.innerHTML = `<div style="background:white;border:2px solid ${config.color};padding:4px 8px;border-radius:12px;font-size:11px;font-weight:600;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.15);cursor:pointer;font-family:system-ui">${config.emoji} ${place.name.length > 22 ? place.name.slice(0, 20) + "…" : place.name}</div>`;

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: mapInstanceRef.current!,
        position: { lat: placeLat, lng: placeLng },
        content: el,
      });

      el.addEventListener("click", () => setSelectedPlace(place));
      markersRef.current.push(marker);
      bounds.extend({ lat: placeLat, lng: placeLng });
    });

    if (markersRef.current.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, 60);
    }
  }, [categories, lat, lng]);

  useEffect(() => {
    updateMarkers(activeCategory);
  }, [activeCategory, updateMarkers]);

  const hasScores = walkScore !== null || transitScore !== null || bikeScore !== null;

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
            {lat && lng ? (
              <div ref={mapRef} className="w-full h-[300px] md:h-[450px]" />
            ) : (
              <div className="w-full h-[300px] md:h-[450px] flex items-center justify-center" style={{ backgroundColor: "#F7F5F2" }}>
                <p className="text-sm" style={{ color: "#666666" }}>Map loading...</p>
              </div>
            )}

            {/* Category filter chips */}
            <div className="p-3 flex flex-wrap gap-2" style={{ backgroundColor: "#FAFAF8", borderTop: "1px solid #D8D2C8" }}>
              {categories.map((cat) => {
                const config = getConfig(cat.name);
                const isActive = activeCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(isActive ? null : cat.name)}
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
          </div>

          {/* Sidebar — selected category list or bus routes */}
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
                    <div key={i} className="flex justify-between items-center px-4 py-3 bg-white">
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

            {/* Bus routes compact */}
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

            {/* No category selected prompt */}
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
