import type { WizardData } from "../PropertyWizard";

const SURFACE = "#FFFFFF";
const BORDER = "#D8D2C8";
const TEXT = "#222222";
const TEXT_SEC = "#333333";
const TEXT_MUT = "#666666";
const INPUT_BG = "#F7F5F2";

const inputCls = "w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors focus:ring-1 focus:ring-[#8B2030]/40";

const UTILITIES = [
  { key: "heat", label: "Heat", icon: "🔥", avgRange: "$80–$150/mo" },
  { key: "water", label: "Water", icon: "💧", avgRange: "$30–$60/mo" },
  { key: "hydro", label: "Hydro (Electricity)", icon: "⚡", avgRange: "$60–$120/mo" },
  { key: "internet", label: "Internet", icon: "📶", avgRange: "$50–$90/mo" },
  { key: "gas", label: "Gas", icon: "🔵", avgRange: "$40–$80/mo" },
];

interface Props {
  data: WizardData;
  onChange: (partial: Partial<WizardData>) => void;
}

export default function UtilitiesStep({ data, onChange }: Props) {
  function updateUtility(key: string, partial: { included?: boolean; avg_cost?: number | "" }) {
    const current = data.utilities_detail[key] || { included: false, avg_cost: "" };
    const updated = { ...current, ...partial };
    const newDetail = { ...data.utilities_detail, [key]: updated };

    // Sync utilities_list and utilities_included
    const includedList = Object.entries(newDetail)
      .filter(([, v]) => v.included)
      .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1));

    onChange({
      utilities_detail: newDetail,
      utilities_list: includedList,
      utilities_included: includedList.length > 0,
    });
  }

  // Calculate total estimated tenant cost
  const tenantCosts = UTILITIES
    .filter((u) => !data.utilities_detail[u.key]?.included && data.utilities_detail[u.key]?.avg_cost)
    .map((u) => Number(data.utilities_detail[u.key]?.avg_cost || 0));
  const totalTenantCost = tenantCosts.reduce((sum, c) => sum + c, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-light" style={{ color: TEXT }}>
          Utilities
        </h2>
        <p className="text-sm mt-1" style={{ color: TEXT_SEC }}>
          Which utilities are included in rent? For tenant-paid ones, add the average monthly cost so tenants know what to expect.
        </p>
      </div>

      <div className="space-y-3">
        {UTILITIES.map((util) => {
          const detail = data.utilities_detail[util.key] || { included: false, avg_cost: "" };

          return (
            <div key={util.key} className="rounded-xl border p-5" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{util.icon}</span>
                  <div>
                    <span className="text-sm font-medium" style={{ color: TEXT }}>{util.label}</span>
                    <p className="text-xs" style={{ color: TEXT_MUT }}>Average: {util.avgRange}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => updateUtility(util.key, { included: true })}
                    className="px-4 py-2 rounded-lg text-xs transition-all"
                    style={{
                      backgroundColor: detail.included ? "rgba(34,197,94,0.15)" : INPUT_BG,
                      border: `1px solid ${detail.included ? "#4ade80" : BORDER}`,
                      color: detail.included ? "#4ade80" : TEXT_MUT,
                    }}
                  >
                    Included
                  </button>
                  <button
                    type="button"
                    onClick={() => updateUtility(util.key, { included: false })}
                    className="px-4 py-2 rounded-lg text-xs transition-all"
                    style={{
                      backgroundColor: !detail.included ? "rgba(251,191,36,0.15)" : INPUT_BG,
                      border: `1px solid ${!detail.included ? "#fbbf24" : BORDER}`,
                      color: !detail.included ? "#fbbf24" : TEXT_MUT,
                    }}
                  >
                    Tenant Pays
                  </button>
                </div>
              </div>

              {!detail.included && (
                <div className="mt-4 flex items-center gap-3">
                  <label className="text-xs flex-shrink-0" style={{ color: TEXT_MUT }}>Avg Monthly Cost ($)</label>
                  <input
                    type="number"
                    value={detail.avg_cost}
                    onChange={(e) => updateUtility(util.key, { avg_cost: e.target.value === "" ? "" : Number(e.target.value) })}
                    placeholder="0"
                    min={0}
                    className={inputCls + " max-w-[140px]"}
                    style={{ backgroundColor: INPUT_BG, color: TEXT, borderColor: BORDER, border: `1px solid ${BORDER}` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cost Summary */}
      <div className="rounded-xl border p-6" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
        <h3 className="text-sm font-medium uppercase tracking-widest mb-4" style={{ color: TEXT_MUT }}>
          Monthly Cost Summary
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span style={{ color: TEXT_SEC }}>Rent</span>
            <span style={{ color: TEXT }}>{data.price ? `$${Number(data.price).toLocaleString()}` : "—"}</span>
          </div>
          {UTILITIES.filter((u) => !data.utilities_detail[u.key]?.included && data.utilities_detail[u.key]?.avg_cost).map((u) => (
            <div key={u.key} className="flex justify-between text-sm">
              <span style={{ color: TEXT_SEC }}>{u.label} (est.)</span>
              <span style={{ color: "#fbbf24" }}>~${Number(data.utilities_detail[u.key]?.avg_cost || 0)}</span>
            </div>
          ))}
          {UTILITIES.filter((u) => data.utilities_detail[u.key]?.included).length > 0 && (
            <div className="flex justify-between text-sm">
              <span style={{ color: TEXT_SEC }}>Included in rent</span>
              <span style={{ color: "#4ade80" }}>
                {UTILITIES.filter((u) => data.utilities_detail[u.key]?.included).map((u) => u.label).join(", ")}
              </span>
            </div>
          )}
          <div className="pt-3 mt-3 flex justify-between text-sm font-medium" style={{ borderTop: `1px solid ${BORDER}` }}>
            <span style={{ color: TEXT }}>Est. Total Monthly</span>
            <span style={{ color: TEXT }}>
              {data.price ? `~$${(Number(data.price) + totalTenantCost).toLocaleString()}` : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
