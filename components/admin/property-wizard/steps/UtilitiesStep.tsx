import type { WizardData } from "../PropertyWizard";

const SURFACE = "#FFFFFF";
const BORDER = "#D8D2C8";
const TEXT = "#222222";
const TEXT_SEC = "#333333";
const TEXT_MUT = "#666666";
const INPUT_BG = "#F7F5F2";

const inputCls = "w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors focus:ring-1 focus:ring-[#8B2030]/40";

// Middlesex County, Ontario baseline rates (2024-2025 averages)
// Sources: London Hydro, Enbridge, London water/sewer rates, major ISPs
// We show 65% of these to tenants as a conservative "won't be a lot" estimate
const UTILITIES = [
  { key: "heat", label: "Heat (Gas Furnace)", icon: "🔥", baseline: 110, unit: "Enbridge avg", note: "Based on Enbridge residential rates, Middlesex County" },
  { key: "water", label: "Water & Sewer", icon: "💧", baseline: 75, unit: "City of London avg", note: "Based on City of London water/sewer rates" },
  { key: "hydro", label: "Hydro (Electricity)", icon: "⚡", baseline: 95, unit: "London Hydro avg", note: "Based on London Hydro TOU rates, avg usage" },
  { key: "internet", label: "Internet", icon: "📶", baseline: 75, unit: "Bell/Rogers/Start avg", note: "Based on Bell, Rogers, Start.ca plans in London" },
  { key: "gas", label: "Gas (Cooking/Hot Water)", icon: "🔵", baseline: 55, unit: "Enbridge avg", note: "Based on Enbridge, non-heating gas usage" },
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

    const includedList = Object.entries(newDetail)
      .filter(([, v]) => v.included)
      .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1));

    onChange({
      utilities_detail: newDetail,
      utilities_list: includedList,
      utilities_included: includedList.length > 0,
    });
  }

  // Auto-fill with 65% of baseline when "Tenant Pays" is selected and no cost set
  function setTenantPays(key: string) {
    const current = data.utilities_detail[key] || { included: false, avg_cost: "" };
    const util = UTILITIES.find((u) => u.key === key);
    const estimate = util ? Math.round(util.baseline * 0.65) : 0;
    updateUtility(key, {
      included: false,
      avg_cost: current.avg_cost || estimate,
    });
  }

  // Calculate total estimated tenant cost (at 65% baseline)
  const tenantPaidUtils = UTILITIES.filter((u) => !data.utilities_detail[u.key]?.included);
  const totalTenantCost = tenantPaidUtils.reduce((sum, u) => {
    const cost = Number(data.utilities_detail[u.key]?.avg_cost || 0);
    return sum + cost;
  }, 0);

  // Full baseline total for comparison
  const fullBaselineTotal = tenantPaidUtils.reduce((sum, u) => sum + u.baseline, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-light" style={{ color: TEXT }}>
          Utilities
        </h2>
        <p className="text-sm mt-1" style={{ color: TEXT_SEC }}>
          Which utilities are included in rent? For tenant-paid ones, we auto-estimate based on current Middlesex County rates.
        </p>
      </div>

      <div className="space-y-3">
        {UTILITIES.map((util) => {
          const detail = data.utilities_detail[util.key] || { included: false, avg_cost: "" };
          const estimate65 = Math.round(util.baseline * 0.65);

          return (
            <div key={util.key} className="rounded-xl border p-5" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{util.icon}</span>
                  <div>
                    <span className="text-sm font-medium" style={{ color: TEXT }}>{util.label}</span>
                    <p className="text-xs" style={{ color: TEXT_MUT }}>{util.note}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateUtility(util.key, { included: true })}
                    className="px-4 py-2 rounded-lg text-xs transition-all"
                    style={{
                      backgroundColor: detail.included ? "rgba(34,197,94,0.08)" : INPUT_BG,
                      border: `1px solid ${detail.included ? "#22c55e" : BORDER}`,
                      color: detail.included ? "#15803d" : TEXT_MUT,
                    }}
                  >
                    Included
                  </button>
                  <button
                    type="button"
                    onClick={() => setTenantPays(util.key)}
                    className="px-4 py-2 rounded-lg text-xs transition-all"
                    style={{
                      backgroundColor: !detail.included ? "rgba(251,191,36,0.08)" : INPUT_BG,
                      border: `1px solid ${!detail.included ? "#d97706" : BORDER}`,
                      color: !detail.included ? "#92400e" : TEXT_MUT,
                    }}
                  >
                    Tenant Pays
                  </button>
                </div>
              </div>

              {!detail.included && (
                <div className="mt-4 rounded-lg p-3" style={{ backgroundColor: INPUT_BG }}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <label className="text-xs font-medium" style={{ color: TEXT_SEC }}>Estimated monthly cost</label>
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(34,197,94,0.08)", color: "#15803d" }}>
                          ~${estimate65}/mo typical
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: TEXT_MUT }}>
                        Conservative estimate at 65% of {util.unit} rate (${util.baseline}/mo full rate). Actual cost depends on usage.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs" style={{ color: TEXT_MUT }}>$</span>
                      <input
                        type="number"
                        value={detail.avg_cost}
                        onChange={(e) => updateUtility(util.key, { avg_cost: e.target.value === "" ? "" : Number(e.target.value) })}
                        placeholder={String(estimate65)}
                        min={0}
                        className="w-20 px-3 py-2 rounded-lg text-sm text-center outline-none focus:ring-1 focus:ring-[#8B2030]/40"
                        style={{ backgroundColor: "#FFFFFF", color: TEXT, border: `1px solid ${BORDER}` }}
                      />
                      <span className="text-xs" style={{ color: TEXT_MUT }}>/mo</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cost Summary */}
      <div className="rounded-xl border p-6" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
        <h3 className="text-sm font-medium uppercase tracking-widest mb-4" style={{ color: TEXT_MUT }}>
          What tenants will see
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span style={{ color: TEXT_SEC }}>Monthly Rent</span>
            <span className="font-medium" style={{ color: TEXT }}>{data.price ? `$${Number(data.price).toLocaleString()}` : "—"}</span>
          </div>

          {UTILITIES.filter((u) => data.utilities_detail[u.key]?.included).length > 0 && (
            <div className="flex justify-between text-sm">
              <span style={{ color: TEXT_SEC }}>Included in rent</span>
              <span style={{ color: "#15803d" }}>
                {UTILITIES.filter((u) => data.utilities_detail[u.key]?.included).map((u) => u.label.split(" (")[0]).join(", ")}
              </span>
            </div>
          )}

          {tenantPaidUtils.filter((u) => data.utilities_detail[u.key]?.avg_cost).map((u) => (
            <div key={u.key} className="flex justify-between text-sm">
              <span style={{ color: TEXT_SEC }}>{u.label.split(" (")[0]} (est.)</span>
              <span style={{ color: "#92400e" }}>~${Number(data.utilities_detail[u.key]?.avg_cost || 0)}/mo</span>
            </div>
          ))}

          <div className="pt-3 mt-3 flex justify-between text-sm font-medium" style={{ borderTop: `1px solid ${BORDER}` }}>
            <span style={{ color: TEXT }}>Est. Total Monthly</span>
            <span style={{ color: TEXT }}>
              {data.price ? `~$${(Number(data.price) + totalTenantCost).toLocaleString()}/mo` : "—"}
            </span>
          </div>

          {fullBaselineTotal > 0 && totalTenantCost > 0 && (
            <p className="text-xs pt-1" style={{ color: TEXT_MUT }}>
              Showing conservative estimates. Full baseline rates would be ~${(Number(data.price || 0) + fullBaselineTotal).toLocaleString()}/mo.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
