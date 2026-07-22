import { useState } from "react";
import type { WizardData } from "../PropertyWizard";

const SURFACE = "#FFFFFF";
const BORDER = "#D8D2C8";
const TEXT = "#222222";
const TEXT_SEC = "#333333";
const TEXT_MUT = "#666666";
const INPUT_BG = "#F7F5F2";
const ACCENT = "#8B2030";

const TRANSPARENCY_FIELDS = [
  {
    key: "heating_reliability",
    label: "Heating / Cooling",
    placeholder: "Describe heating and cooling setup…",
    options: [
      "Gas furnace — serviced annually",
      "Forced air — gas heat",
      "Electric baseboard heat",
      "Heat pump (heating + cooling)",
      "Radiant in-floor heat",
      "Boiler system",
    ],
  },
  {
    key: "internet_providers",
    label: "Internet Providers Available",
    placeholder: "List available ISPs…",
    options: [
      "Bell Fibe available",
      "Rogers available",
      "Bell + Rogers available",
      "Start.ca available",
      "Cogeco available",
      "Bell + Rogers + Start.ca",
    ],
  },
  {
    key: "pest_control",
    label: "Pest Control",
    placeholder: "Describe pest control arrangement…",
    options: [
      "Quarterly treatment included",
      "Annual inspection included",
      "Orkin — quarterly service",
      "Tenant responsibility",
      "No history of issues",
    ],
  },
  {
    key: "maintenance_response",
    label: "Maintenance Response Time",
    placeholder: "Describe response time policy…",
    options: [
      "Emergency: same day. Non-emergency: 48 hrs",
      "Emergency: 2 hrs. Non-emergency: 5 days",
      "24/7 emergency line — no waiting",
      "Emergency: 4 hrs. Regular: 72 hrs",
    ],
  },
  {
    key: "snow_removal",
    label: "Snow Removal / Garbage",
    placeholder: "Describe snow and garbage arrangements…",
    options: [
      "Snow removal included",
      "Snow removal by tenant",
      "Garbage — city pickup Tuesdays",
      "Snow removal + garbage collection included",
      "Snow removal included. Recycling biweekly",
    ],
  },
  {
    key: "parking_enforcement",
    label: "Parking Notes",
    placeholder: "Describe parking situation…",
    options: [
      "1 assigned spot included",
      "2 spots included",
      "Street parking only",
      "Visitor parking available",
      "Assigned + visitor parking",
      "Garage included",
    ],
  },
  {
    key: "noise_notes",
    label: "Noise / Quirks",
    placeholder: "Anything worth mentioning about noise or quirks…",
    options: [
      "Quiet residential street",
      "Near transit — some traffic noise",
      "Near train tracks — occasional horn",
      "Busy intersection — double-pane windows",
      "No notable noise issues",
    ],
  },
];

const inputCls = "w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors focus:ring-1 focus:ring-[#8B2030]/40";

interface Props {
  data: WizardData;
  onChange: (partial: Partial<WizardData>) => void;
  propertyId: string | null;
}

export default function PreviewStep({ data, onChange, propertyId }: Props) {
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");

  async function handleGenerate() {
    setGenerating(true);
    setGenError("");

    try {
      const res = await fetch("/api/admin/generate-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: data.address,
          city: data.city,
          property_type: data.property_type,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          sqft: data.sqft,
          price: data.price,
          pet_friendly: data.pet_friendly,
          pet_policy: data.pet_policy,
          parking: data.parking,
          parking_type: data.parking_type,
          laundry_type: data.laundry_type,
          ac: data.ac,
          heating_type: data.heating_type,
          appliances: data.appliances,
          outdoor_space: data.outdoor_space,
          furnished: data.furnished,
          utilities_included: data.utilities_included,
          utilities_detail: data.utilities_detail,
          neighbourhood_data: data.neighbourhood_data,
          bus_routes: data.bus_routes,
          walk_score: data.walk_score,
          transit_score: data.transit_score,
          neighbourhood_vibe: data.neighbourhood_vibe,
          lease_term: data.lease_term,
          available_date: data.available_date,
          transparency: data.transparency,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate");
      }

      const result = await res.json();
      onChange({
        title: result.title || data.title,
        description: result.description || data.description,
        ai_highlights: result.highlights || data.ai_highlights,
        life_simulation: result.life_simulation || data.life_simulation,
        ai_life_intro: result.life_intro || data.ai_life_intro,
      });
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-light" style={{ color: TEXT }}>
          Preview & Publish
        </h2>
        <p className="text-sm mt-1" style={{ color: TEXT_SEC }}>
          Generate AI content, review everything, and publish when ready.
        </p>
      </div>

      {/* AI Generation */}
      <div className="rounded-xl border p-6 space-y-5" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium" style={{ color: TEXT }}>AI Content Generator</h3>
            <p className="text-xs mt-1" style={{ color: TEXT_MUT }}>
              Generates title, description, highlights, and life simulation using all your property data.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-5 py-2.5 text-xs text-white rounded-lg transition-opacity hover:opacity-80 disabled:opacity-40 flex items-center gap-2"
            style={{ backgroundColor: ACCENT }}
          >
            {generating && <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {generating ? "Generating..." : data.ai_highlights.length > 0 ? "Regenerate" : "Generate AI Content"}
          </button>
        </div>

        {genError && (
          <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: "rgba(139,32,48,0.08)", color: "#8B2030" }}>{genError}</p>
        )}
      </div>

      {/* Title */}
      <div className="rounded-xl border p-6 space-y-4" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
        <h3 className="text-sm font-medium uppercase tracking-widest" style={{ color: TEXT_MUT }}>Listing Title</h3>
        <input
          type="text"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Property title..."
          className={inputCls}
          style={{ backgroundColor: INPUT_BG, color: TEXT, border: `1px solid ${BORDER}` }}
        />
      </div>

      {/* Description */}
      <div className="rounded-xl border p-6 space-y-4" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
        <h3 className="text-sm font-medium uppercase tracking-widest" style={{ color: TEXT_MUT }}>Description</h3>
        <textarea
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Property description..."
          rows={6}
          className={inputCls + " resize-none"}
          style={{ backgroundColor: INPUT_BG, color: TEXT, border: `1px solid ${BORDER}` }}
        />
      </div>

      {/* Life Simulation Intro */}
      <div className="rounded-xl border p-6 space-y-4" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
        <h3 className="text-sm font-medium uppercase tracking-widest" style={{ color: TEXT_MUT }}>Life Simulation Hero</h3>
        <p className="text-xs" style={{ color: TEXT_MUT }}>
          The emotional hook at the top of the listing. e.g. &quot;Wake up 2 min from Richmond Row. Grab coffee at Fire Roasted. Be downtown in 12 min.&quot;
        </p>
        <textarea
          value={data.ai_life_intro}
          onChange={(e) => onChange({ ai_life_intro: e.target.value })}
          placeholder="AI will generate this..."
          rows={3}
          className={inputCls + " resize-none"}
          style={{ backgroundColor: INPUT_BG, color: TEXT, border: `1px solid ${BORDER}` }}
        />
      </div>

      {/* Highlights */}
      <div className="rounded-xl border p-6 space-y-4" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
        <h3 className="text-sm font-medium uppercase tracking-widest" style={{ color: TEXT_MUT }}>Top 5 Highlights</h3>
        {data.ai_highlights.length > 0 ? (
          <div className="space-y-2">
            {data.ai_highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs font-medium w-5 text-center" style={{ color: ACCENT }}>{i + 1}</span>
                <input
                  type="text"
                  value={h}
                  onChange={(e) => {
                    const updated = [...data.ai_highlights];
                    updated[i] = e.target.value;
                    onChange({ ai_highlights: updated });
                  }}
                  className={inputCls + " flex-1"}
                  style={{ backgroundColor: INPUT_BG, color: TEXT, border: `1px solid ${BORDER}` }}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs" style={{ color: TEXT_MUT }}>Click &quot;Generate AI Content&quot; above to create highlights.</p>
        )}
      </div>

      {/* Daily Routine */}
      <div className="rounded-xl border p-6 space-y-4" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
        <h3 className="text-sm font-medium uppercase tracking-widest" style={{ color: TEXT_MUT }}>Daily Routine (Life Simulation)</h3>
        {(["morning", "afternoon", "evening", "night"] as const).map((period) => (
          <div key={period}>
            <label className="block text-xs uppercase tracking-widest mb-1.5 font-medium capitalize" style={{ color: TEXT_MUT }}>
              {period === "morning" ? "🌅 Morning" : period === "afternoon" ? "☀️ Afternoon" : period === "evening" ? "🌆 Evening" : "🌙 Night"}
            </label>
            <textarea
              value={data.life_simulation[period]}
              onChange={(e) => onChange({ life_simulation: { ...data.life_simulation, [period]: e.target.value } })}
              placeholder={`What does ${period} look like living here?`}
              rows={2}
              className={inputCls + " resize-none"}
              style={{ backgroundColor: INPUT_BG, color: TEXT, border: `1px solid ${BORDER}` }}
            />
          </div>
        ))}
      </div>

      {/* Transparency */}
      <div className="rounded-xl border p-6 space-y-5" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
        <h3 className="text-sm font-medium uppercase tracking-widest" style={{ color: TEXT_MUT }}>Transparency & Risk Removal</h3>
        <p className="text-xs" style={{ color: TEXT_MUT }}>
          Be honest about the property. This builds trust and reduces post-viewing objections.
        </p>

        {TRANSPARENCY_FIELDS.map((field) => (
          <div key={field.key}>
            <label className="block text-xs uppercase tracking-widest mb-2 font-medium" style={{ color: TEXT_MUT }}>{field.label}</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {field.options.map((opt) => {
                const current = (data.transparency[field.key] as string) || "";
                const selected = current === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => onChange({ transparency: { ...data.transparency, [field.key]: selected ? "" : opt } })}
                    className="px-3 py-1.5 rounded-lg text-xs transition-all"
                    style={{
                      backgroundColor: selected ? "rgba(139,32,48,0.08)" : INPUT_BG,
                      border: `1px solid ${selected ? ACCENT : BORDER}`,
                      color: selected ? ACCENT : TEXT_SEC,
                    }}
                  >
                    {selected && <span className="mr-1">✓</span>}
                    {opt}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={(data.transparency[field.key] as string) || ""}
              onChange={(e) => onChange({ transparency: { ...data.transparency, [field.key]: e.target.value } })}
              placeholder={field.placeholder}
              className={inputCls}
              style={{ backgroundColor: INPUT_BG, color: TEXT, border: `1px solid ${BORDER}` }}
            />
          </div>
        ))}
      </div>

      {/* Marketplace Description (Kijiji / Facebook) */}
      {data.marketplace_description && (
        <div className="rounded-xl border p-6 space-y-4" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium uppercase tracking-widest" style={{ color: TEXT_MUT }}>Kijiji / Facebook Listing</h3>
              <p className="text-xs mt-1" style={{ color: TEXT_MUT }}>Auto-generated on publish. Copy and paste to Kijiji or Facebook Marketplace.</p>
            </div>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(data.marketplace_description);
                } catch {
                  const ta = document.createElement("textarea");
                  ta.value = data.marketplace_description;
                  document.body.appendChild(ta);
                  ta.select();
                  document.execCommand("copy");
                  document.body.removeChild(ta);
                }
              }}
              className="px-4 py-2 text-xs rounded-lg transition-opacity hover:opacity-80"
              style={{ backgroundColor: ACCENT, color: "#fff" }}
            >
              Copy to Clipboard
            </button>
          </div>
          <pre
            className="text-xs leading-relaxed whitespace-pre-wrap p-4 rounded-lg overflow-auto max-h-64"
            style={{ backgroundColor: INPUT_BG, color: TEXT_SEC, border: `1px solid ${BORDER}` }}
          >
            {data.marketplace_description}
          </pre>
        </div>
      )}

      {/* Preview Link */}
      {propertyId && (
        <div className="rounded-xl border p-6 text-center" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
          <a
            href={`/listings/${propertyId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 text-sm rounded-lg transition-opacity hover:opacity-80"
            style={{ border: `1px solid #D8D2C8`, color: TEXT_SEC }}
          >
            Preview Listing Page ↗
          </a>
          <p className="text-xs mt-2" style={{ color: TEXT_MUT }}>
            {data.status === "draft" ? "Draft — only visible to you." : "Published — visible to everyone."}
          </p>
        </div>
      )}
    </div>
  );
}
