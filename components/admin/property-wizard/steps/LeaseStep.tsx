import { useState } from "react";
import type { WizardData } from "../PropertyWizard";

const SURFACE = "#FFFFFF";
const BORDER = "#D8D2C8";
const TEXT = "#222222";
const TEXT_SEC = "#333333";
const TEXT_MUT = "#666666";
const INPUT_BG = "#F7F5F2";
const ACCENT = "#8B2030";

const inputCls = "w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors focus:ring-1 focus:ring-[#8B2030]/40";

const LEASE_TERMS = [
  { value: "", label: "Select term..." },
  { value: "month-to-month", label: "Month-to-Month" },
  { value: "6 months", label: "6 Months" },
  { value: "12 months", label: "12 Months (Standard)" },
  { value: "2 years", label: "2 Years" },
  { value: "flexible", label: "Flexible / Negotiable" },
];

interface Props {
  data: WizardData;
  onChange: (partial: Partial<WizardData>) => void;
}

export default function LeaseStep({ data, onChange }: Props) {
  const [costLabel, setCostLabel] = useState("");
  const [costAmount, setCostAmount] = useState("");

  function addCost() {
    if (!costLabel || !costAmount) return;
    onChange({ move_in_costs: { ...data.move_in_costs, [costLabel]: Number(costAmount) } });
    setCostLabel("");
    setCostAmount("");
  }

  function removeCost(key: string) {
    const updated = { ...data.move_in_costs };
    delete updated[key];
    onChange({ move_in_costs: updated });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-light" style={{ color: TEXT }}>
          Lease & Move-In
        </h2>
        <p className="text-sm mt-1" style={{ color: TEXT_SEC }}>
          What does a new tenant need to know before signing?
        </p>
      </div>

      <div className="rounded-xl border p-6 space-y-5" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
        <h3 className="text-sm font-medium uppercase tracking-widest" style={{ color: TEXT_MUT }}>Lease Terms</h3>

        <Field label="Lease Term">
          <select
            value={data.lease_term}
            onChange={(e) => onChange({ lease_term: e.target.value })}
            className={inputCls}
            style={{ backgroundColor: INPUT_BG, color: TEXT, borderColor: BORDER, border: `1px solid ${BORDER}` }}
          >
            {LEASE_TERMS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>

        <Field label="Security Deposit ($)">
          <input
            type="number"
            value={data.deposit === "" ? (data.price || "") : data.deposit}
            onChange={(e) => onChange({ deposit: e.target.value === "" ? "" : Number(e.target.value) })}
            placeholder={data.price ? String(data.price) : "0"}
            min={0}
            className={inputCls}
            style={{ backgroundColor: INPUT_BG, color: TEXT, borderColor: BORDER, border: `1px solid ${BORDER}` }}
          />
          <p className="text-xs mt-1.5" style={{ color: TEXT_MUT }}>
            Defaults to one month&apos;s rent. In Ontario, landlords can only collect last month&apos;s rent deposit, not a damage deposit.
          </p>
        </Field>
      </div>

      <div className="rounded-xl border p-6 space-y-5" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
        <h3 className="text-sm font-medium uppercase tracking-widest" style={{ color: TEXT_MUT }}>Move-In Requirements</h3>

        <div className="space-y-3">
          <Toggle
            label="First month's rent required upfront"
            checked={data.first_month_required}
            onChange={(v) => onChange({ first_month_required: v })}
          />
          <Toggle
            label="Last month's rent deposit required"
            checked={data.last_month_required}
            onChange={(v) => onChange({ last_month_required: v })}
          />
        </div>
      </div>

      <div className="rounded-xl border p-6 space-y-5" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
        <h3 className="text-sm font-medium uppercase tracking-widest" style={{ color: TEXT_MUT }}>Additional Move-In Costs</h3>
        <p className="text-xs" style={{ color: TEXT_MUT }}>Key deposits, admin fees, parking fees, etc.</p>

        {Object.entries(data.move_in_costs).length > 0 && (
          <div className="space-y-2">
            {Object.entries(data.move_in_costs).map(([key, amount]) => (
              <div key={key} className="flex items-center justify-between px-4 py-2.5 rounded-lg" style={{ backgroundColor: INPUT_BG, border: `1px solid ${BORDER}` }}>
                <span className="text-sm" style={{ color: TEXT }}>{key}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium" style={{ color: TEXT }}>${amount}</span>
                  <button onClick={() => removeCost(key)} className="text-xs" style={{ color: "#f87171" }}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-[1fr_120px_auto] gap-3">
          <div>
            <label className="block text-xs mb-1.5" style={{ color: TEXT_MUT }}>Cost name</label>
            <input
              type="text"
              value={costLabel}
              onChange={(e) => setCostLabel(e.target.value)}
              placeholder="e.g. Key Deposit"
              className={inputCls}
              style={{ backgroundColor: "#FFFFFF", color: TEXT, border: `1px solid ${BORDER}` }}
            />
          </div>
          <div>
            <label className="block text-xs mb-1.5" style={{ color: TEXT_MUT }}>Amount ($)</label>
            <input
              type="number"
              value={costAmount}
              onChange={(e) => setCostAmount(e.target.value)}
              placeholder="100"
              min={0}
              className={inputCls}
              style={{ backgroundColor: "#FFFFFF", color: TEXT, border: `1px solid ${BORDER}` }}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={addCost}
              disabled={!costLabel || !costAmount}
              className="px-5 py-3 text-xs font-medium rounded-lg transition-opacity hover:opacity-80 disabled:opacity-30"
              style={{ backgroundColor: ACCENT, color: "#fff" }}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest mb-2 font-medium" style={{ color: "#666666" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer select-none py-2">
      <span className="text-sm" style={{ color: TEXT_SEC }}>{label}</span>
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${checked ? "bg-[#8B2030]" : "bg-[#D8D2C8]"}`}
      >
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-6" : "translate-x-0"}`} />
      </div>
    </label>
  );
}
