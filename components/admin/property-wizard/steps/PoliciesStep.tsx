import type { WizardData } from "../PropertyWizard";

const SURFACE = "#FFFFFF";
const BORDER = "#D8D2C8";
const TEXT = "#222222";
const TEXT_SEC = "#333333";
const TEXT_MUT = "#666666";
const INPUT_BG = "#F7F5F2";

const inputCls = "w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors focus:ring-1 focus:ring-[#8B2030]/40";

interface Props {
  data: WizardData;
  onChange: (partial: Partial<WizardData>) => void;
}

export default function PoliciesStep({ data, onChange }: Props) {
  function updatePetPolicy(partial: Partial<WizardData["pet_policy"]>) {
    const updated = { ...data.pet_policy, ...partial };
    const hasPets = updated.cats || updated.dogs || updated.other;
    onChange({ pet_policy: updated, pet_friendly: hasPets });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-light" style={{ color: TEXT }}>
          Policies
        </h2>
        <p className="text-sm mt-1" style={{ color: TEXT_SEC }}>
          Be upfront about rules. Transparency builds trust and saves everyone time.
        </p>
      </div>

      {/* Pets */}
      <div className="rounded-xl border p-6 space-y-5" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
        <h3 className="text-sm font-medium uppercase tracking-widest" style={{ color: TEXT_MUT }}>Pet Policy</h3>

        <div className="space-y-3">
          <Toggle label="Cats Allowed" checked={data.pet_policy.cats} onChange={(v) => updatePetPolicy({ cats: v })} />
          <Toggle label="Dogs Allowed" checked={data.pet_policy.dogs} onChange={(v) => updatePetPolicy({ dogs: v })} />
          <Toggle label="Other Pets (birds, fish, etc.)" checked={data.pet_policy.other} onChange={(v) => updatePetPolicy({ other: v })} />
        </div>

        {(data.pet_policy.cats || data.pet_policy.dogs || data.pet_policy.other) && (
          <div className="space-y-4 pt-2">
            <Field label="Pet Deposit ($)">
              <input
                type="number"
                value={data.pet_policy.deposit}
                onChange={(e) => updatePetPolicy({ deposit: e.target.value === "" ? "" : Number(e.target.value) })}
                placeholder="0"
                min={0}
                className={inputCls}
                style={{ backgroundColor: INPUT_BG, color: TEXT, borderColor: BORDER, border: `1px solid ${BORDER}` }}
              />
            </Field>

            <Field label="Pet Restrictions">
              <textarea
                value={data.pet_policy.restrictions}
                onChange={(e) => updatePetPolicy({ restrictions: e.target.value })}
                placeholder="e.g. Max 2 pets, no aggressive breeds, must be neutered/spayed"
                rows={2}
                className={inputCls + " resize-none"}
                style={{ backgroundColor: INPUT_BG, color: TEXT, borderColor: BORDER, border: `1px solid ${BORDER}` }}
              />
            </Field>
          </div>
        )}
      </div>

      {/* Smoking & Guests */}
      <div className="rounded-xl border p-6 space-y-5" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
        <h3 className="text-sm font-medium uppercase tracking-widest" style={{ color: TEXT_MUT }}>House Rules</h3>

        <Toggle label="Smoking Allowed" checked={data.smoking_allowed} onChange={(v) => onChange({ smoking_allowed: v })} />

        <Field label="Quiet Hours">
          <input
            type="text"
            value={data.quiet_hours}
            onChange={(e) => onChange({ quiet_hours: e.target.value })}
            placeholder="e.g. 10:00 PM – 8:00 AM"
            className={inputCls}
            style={{ backgroundColor: INPUT_BG, color: TEXT, borderColor: BORDER, border: `1px solid ${BORDER}` }}
          />
        </Field>

        <Field label="Max Occupants">
          <input
            type="number"
            value={data.max_occupants}
            onChange={(e) => onChange({ max_occupants: e.target.value === "" ? "" : Number(e.target.value) })}
            placeholder="e.g. 4"
            min={1}
            className={inputCls}
            style={{ backgroundColor: INPUT_BG, color: TEXT, borderColor: BORDER, border: `1px solid ${BORDER}` }}
          />
          <p className="text-xs mt-1.5" style={{ color: TEXT_MUT }}>Maximum number of people living in the unit.</p>
        </Field>

        <Field label="Guest Policy">
          <textarea
            value={data.guest_policy}
            onChange={(e) => onChange({ guest_policy: e.target.value })}
            placeholder="e.g. Overnight guests welcome, no more than 7 consecutive nights"
            rows={2}
            className={inputCls + " resize-none"}
            style={{ backgroundColor: INPUT_BG, color: TEXT, borderColor: BORDER, border: `1px solid ${BORDER}` }}
          />
        </Field>
      </div>

    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest mb-2 font-medium" style={{ color: "#666666" }}>{label}</label>
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
