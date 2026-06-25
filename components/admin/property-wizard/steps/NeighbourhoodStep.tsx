import { useState } from "react";
import type { WizardData } from "../PropertyWizard";

const SURFACE = "#111C27";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#EDE9E3";
const TEXT_SEC = "rgba(237,233,227,0.5)";
const TEXT_MUT = "rgba(237,233,227,0.28)";
const INPUT_BG = "#0B1219";
const ACCENT = "#C4374A";

const inputCls = "w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors focus:ring-1 focus:ring-[#C4374A]/40";

interface Props {
  data: WizardData;
  onChange: (partial: Partial<WizardData>) => void;
  propertyId: string | null;
}

export default function NeighbourhoodStep({ data, onChange, propertyId }: Props) {
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");

  async function fetchNeighbourhoodData() {
    if (!data.address || !data.city) return;
    setFetching(true);
    setFetchError("");

    try {
      const res = await fetch("/api/admin/neighbourhood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: data.address, city: data.city }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to fetch neighbourhood data");
      }

      const result = await res.json();
      onChange({
        latitude: result.latitude ?? data.latitude,
        longitude: result.longitude ?? data.longitude,
        neighbourhood_data: result.places ?? data.neighbourhood_data,
        walk_score: result.walk_score ?? data.walk_score,
        transit_score: result.transit_score ?? data.transit_score,
        bike_score: result.bike_score ?? data.bike_score,
        bus_routes: result.bus_routes ?? data.bus_routes,
      });
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setFetching(false);
    }
  }

  const hasNeighbourhoodData = Object.keys(data.neighbourhood_data).length > 0;

  const CATEGORIES: { key: string; label: string; icon: string }[] = [
    { key: "grocery_or_supermarket", label: "Grocery Stores", icon: "🛒" },
    { key: "pharmacy", label: "Pharmacies", icon: "💊" },
    { key: "gym", label: "Gyms & Fitness", icon: "🏋️" },
    { key: "transit_station", label: "Transit Stops", icon: "🚌" },
    { key: "school", label: "Schools", icon: "🏫" },
    { key: "hospital", label: "Hospitals & Clinics", icon: "🏥" },
    { key: "park", label: "Parks", icon: "🌳" },
    { key: "restaurant", label: "Restaurants", icon: "🍽️" },
    { key: "cafe", label: "Cafés", icon: "☕" },
    { key: "bank", label: "Banks", icon: "🏦" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-light" style={{ color: TEXT }}>
          Neighbourhood
        </h2>
        <p className="text-sm mt-1" style={{ color: TEXT_SEC }}>
          Auto-fetch nearby amenities, transit, and scores. You can edit everything after.
        </p>
      </div>

      {/* Fetch Button */}
      <div className="rounded-xl border p-6" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium" style={{ color: TEXT }}>
              {data.address ? `${data.address}, ${data.city}` : "Enter an address in Step 1 first"}
            </p>
            {data.latitude && data.longitude && (
              <p className="text-xs mt-1" style={{ color: TEXT_MUT }}>
                Coordinates: {data.latitude.toFixed(4)}, {data.longitude.toFixed(4)}
              </p>
            )}
          </div>
          <button
            onClick={fetchNeighbourhoodData}
            disabled={fetching || !data.address}
            className="px-5 py-2.5 text-xs text-white rounded-lg transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ backgroundColor: ACCENT }}
          >
            {fetching ? "Fetching..." : hasNeighbourhoodData ? "Refresh Data" : "Fetch Neighbourhood Data"}
          </button>
        </div>
        {fetchError && (
          <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: "rgba(196,55,74,0.15)", color: "#f87171" }}>
            {fetchError}
          </p>
        )}
        {!data.address && (
          <p className="text-xs" style={{ color: TEXT_MUT }}>
            Go back to Step 1 and enter the property address to auto-fetch neighbourhood data.
          </p>
        )}
      </div>

      {/* Scores */}
      <div className="rounded-xl border p-6 space-y-5" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
        <h3 className="text-sm font-medium uppercase tracking-widest" style={{ color: TEXT_MUT }}>Walk & Transit Scores</h3>
        <div className="grid grid-cols-3 gap-4">
          <ScoreInput label="Walk Score" value={data.walk_score} onChange={(v) => onChange({ walk_score: v })} />
          <ScoreInput label="Transit Score" value={data.transit_score} onChange={(v) => onChange({ transit_score: v })} />
          <ScoreInput label="Bike Score" value={data.bike_score} onChange={(v) => onChange({ bike_score: v })} />
        </div>
      </div>

      {/* Nearby Places */}
      {hasNeighbourhoodData && (
        <div className="space-y-4">
          {CATEGORIES.map((cat) => {
            const places = (data.neighbourhood_data[cat.key] as { name: string; vicinity?: string; distance?: string }[]) || [];
            if (places.length === 0) return null;
            return (
              <div key={cat.key} className="rounded-xl border p-5" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
                <h4 className="text-sm font-medium flex items-center gap-2 mb-3" style={{ color: TEXT }}>
                  <span>{cat.icon}</span> {cat.label}
                  <span className="text-xs ml-auto" style={{ color: TEXT_MUT }}>{places.length} found</span>
                </h4>
                <div className="space-y-2">
                  {places.slice(0, 5).map((place, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: INPUT_BG }}>
                      <span className="text-sm" style={{ color: TEXT_SEC }}>{place.name}</span>
                      {place.distance && <span className="text-xs" style={{ color: TEXT_MUT }}>{place.distance}</span>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bus Routes */}
      <div className="rounded-xl border p-6 space-y-5" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium uppercase tracking-widest" style={{ color: TEXT_MUT }}>Bus Routes</h3>
          <button
            type="button"
            onClick={() => onChange({ bus_routes: [...data.bus_routes, { route: "", stop_name: "", frequency: "", walk_time: "" }] })}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ border: `1px solid ${BORDER}`, color: TEXT_SEC }}
          >
            + Add Route
          </button>
        </div>

        {data.bus_routes.length === 0 && (
          <p className="text-xs" style={{ color: TEXT_MUT }}>No bus routes added yet. Click &quot;Add Route&quot; or fetch data to auto-populate.</p>
        )}

        {data.bus_routes.map((route, i) => (
          <div key={i} className="grid grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs mb-1" style={{ color: TEXT_MUT }}>Route #</label>
              <input
                type="text"
                value={route.route}
                onChange={(e) => {
                  const updated = [...data.bus_routes];
                  updated[i] = { ...updated[i], route: e.target.value };
                  onChange({ bus_routes: updated });
                }}
                placeholder="e.g. 10"
                className={inputCls}
                style={{ backgroundColor: INPUT_BG, color: TEXT, border: `1px solid ${BORDER}` }}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: TEXT_MUT }}>Stop Name</label>
              <input
                type="text"
                value={route.stop_name}
                onChange={(e) => {
                  const updated = [...data.bus_routes];
                  updated[i] = { ...updated[i], stop_name: e.target.value };
                  onChange({ bus_routes: updated });
                }}
                placeholder="Main & King"
                className={inputCls}
                style={{ backgroundColor: INPUT_BG, color: TEXT, border: `1px solid ${BORDER}` }}
              />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: TEXT_MUT }}>Frequency</label>
              <input
                type="text"
                value={route.frequency}
                onChange={(e) => {
                  const updated = [...data.bus_routes];
                  updated[i] = { ...updated[i], frequency: e.target.value };
                  onChange({ bus_routes: updated });
                }}
                placeholder="Every 15 min"
                className={inputCls}
                style={{ backgroundColor: INPUT_BG, color: TEXT, border: `1px solid ${BORDER}` }}
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs mb-1" style={{ color: TEXT_MUT }}>Walk Time</label>
                <input
                  type="text"
                  value={route.walk_time}
                  onChange={(e) => {
                    const updated = [...data.bus_routes];
                    updated[i] = { ...updated[i], walk_time: e.target.value };
                    onChange({ bus_routes: updated });
                  }}
                  placeholder="2 min"
                  className={inputCls}
                  style={{ backgroundColor: INPUT_BG, color: TEXT, border: `1px solid ${BORDER}` }}
                />
              </div>
              <button
                type="button"
                onClick={() => onChange({ bus_routes: data.bus_routes.filter((_, j) => j !== i) })}
                className="self-end px-3 py-3 text-xs rounded-lg"
                style={{ color: "#f87171" }}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Neighbourhood Vibe */}
      <div className="rounded-xl border p-6 space-y-4" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
        <h3 className="text-sm font-medium uppercase tracking-widest" style={{ color: TEXT_MUT }}>Neighbourhood Vibe</h3>
        <textarea
          value={data.neighbourhood_vibe}
          onChange={(e) => onChange({ neighbourhood_vibe: e.target.value })}
          placeholder="Describe the neighbourhood personality — is it student-heavy, family-oriented, quiet professional? What's the noise level? Street activity? Seasonal feel?"
          rows={4}
          className={inputCls + " resize-none"}
          style={{ backgroundColor: INPUT_BG, color: TEXT, border: `1px solid ${BORDER}` }}
        />
      </div>
    </div>
  );
}

function ScoreInput({ label, value, onChange }: { label: string; value: number | ""; onChange: (v: number | "") => void }) {
  const numVal = typeof value === "number" ? value : 0;
  const color = numVal >= 70 ? "#4ade80" : numVal >= 50 ? "#fbbf24" : numVal > 0 ? "#f87171" : "rgba(237,233,227,0.28)";

  return (
    <div className="text-center">
      <div className="relative w-20 h-20 mx-auto mb-2">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${numVal}, 100`}
            style={{ transition: "stroke-dasharray 0.5s" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-medium" style={{ color }}>
          {value || "—"}
        </span>
      </div>
      <label className="block text-xs" style={{ color: "rgba(237,233,227,0.5)" }}>{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value === "" ? "" : Math.min(100, Math.max(0, Number(e.target.value))))}
        placeholder="0-100"
        min={0}
        max={100}
        className="mt-1 w-full px-2 py-1.5 rounded text-xs text-center outline-none"
        style={{ backgroundColor: "#0B1219", color: "#EDE9E3", border: "1px solid rgba(255,255,255,0.08)" }}
      />
    </div>
  );
}
