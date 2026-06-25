import type { WizardData } from "../PropertyWizard";

const SURFACE = "#111C27";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#EDE9E3";
const TEXT_SEC = "rgba(237,233,227,0.5)";
const TEXT_MUT = "rgba(237,233,227,0.28)";
const INPUT_BG = "#0B1219";
const ACCENT = "#C4374A";

const inputCls = "w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors focus:ring-1 focus:ring-[#C4374A]/40";

const PARKING_TYPES = [
  { value: "none", label: "No Parking" },
  { value: "street", label: "Street Parking" },
  { value: "driveway", label: "Driveway" },
  { value: "garage", label: "Garage" },
  { value: "underground", label: "Underground" },
  { value: "lot", label: "Parking Lot" },
];

const LAUNDRY_TYPES = [
  { value: "none", label: "No Laundry" },
  { value: "in-unit", label: "In-Unit" },
  { value: "shared", label: "Shared (Building)" },
  { value: "coin-op", label: "Coin-Op (Building)" },
];

const HEATING_TYPES = [
  { value: "", label: "Select..." },
  { value: "gas", label: "Gas Furnace" },
  { value: "electric", label: "Electric" },
  { value: "baseboard", label: "Baseboard Heaters" },
  { value: "radiator", label: "Radiator" },
  { value: "forced-air", label: "Forced Air" },
  { value: "heat-pump", label: "Heat Pump" },
];

const OUTDOOR_TYPES = [
  { value: "none", label: "None" },
  { value: "balcony", label: "Balcony" },
  { value: "patio", label: "Patio" },
  { value: "yard", label: "Yard" },
  { value: "rooftop", label: "Rooftop Access" },
  { value: "deck", label: "Deck" },
];

const APPLIANCE_OPTIONS = [
  "Stove/Oven", "Refrigerator", "Dishwasher", "Microwave",
  "Washer", "Dryer", "Garbage Disposal",
];

interface Props {
  data: WizardData;
  onChange: (partial: Partial<WizardData>) => void;
}

export default function FeaturesStep({ data, onChange }: Props) {
  function toggleAppliance(app: string) {
    const current = data.appliances;
    onChange({
      appliances: current.includes(app)
        ? current.filter((a) => a !== app)
        : [...current, app],
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-light" style={{ color: TEXT }}>
          Features & Amenities
        </h2>
        <p className="text-sm mt-1" style={{ color: TEXT_SEC }}>
          What makes this property comfortable to live in?
        </p>
      </div>

      {/* Parking & Laundry */}
      <div className="rounded-xl border p-6 space-y-5" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
        <h3 className="text-sm font-medium uppercase tracking-widest" style={{ color: TEXT_MUT }}>Parking & Laundry</h3>

        <Field label="Parking">
          <div className="grid grid-cols-3 gap-2">
            {PARKING_TYPES.map((t) => (
              <OptionButton
                key={t.value}
                label={t.label}
                selected={data.parking_type === t.value}
                onClick={() => onChange({ parking_type: t.value, parking: t.value !== "none" })}
              />
            ))}
          </div>
        </Field>

        <Field label="Laundry">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {LAUNDRY_TYPES.map((t) => (
              <OptionButton
                key={t.value}
                label={t.label}
                selected={data.laundry_type === t.value}
                onClick={() => onChange({ laundry_type: t.value })}
              />
            ))}
          </div>
        </Field>
      </div>

      {/* Climate */}
      <div className="rounded-xl border p-6 space-y-5" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
        <h3 className="text-sm font-medium uppercase tracking-widest" style={{ color: TEXT_MUT }}>Climate Control</h3>

        <Field label="Heating Type">
          <select
            value={data.heating_type}
            onChange={(e) => onChange({ heating_type: e.target.value })}
            className={inputCls}
            style={{ backgroundColor: INPUT_BG, color: TEXT, borderColor: BORDER, border: `1px solid ${BORDER}` }}
          >
            {HEATING_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>

        <Toggle label="Air Conditioning" checked={data.ac} onChange={(v) => onChange({ ac: v })} />
      </div>

      {/* Appliances */}
      <div className="rounded-xl border p-6 space-y-5" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
        <h3 className="text-sm font-medium uppercase tracking-widest" style={{ color: TEXT_MUT }}>Appliances Included</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {APPLIANCE_OPTIONS.map((app) => (
            <OptionButton
              key={app}
              label={app}
              selected={data.appliances.includes(app)}
              onClick={() => toggleAppliance(app)}
              checkable
            />
          ))}
        </div>
      </div>

      {/* Outdoor & Building */}
      <div className="rounded-xl border p-6 space-y-5" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
        <h3 className="text-sm font-medium uppercase tracking-widest" style={{ color: TEXT_MUT }}>Outdoor Space & Building</h3>

        <Field label="Outdoor Space">
          <div className="grid grid-cols-3 gap-2">
            {OUTDOOR_TYPES.map((t) => (
              <OptionButton
                key={t.value}
                label={t.label}
                selected={data.outdoor_space === t.value}
                onClick={() => onChange({ outdoor_space: t.value })}
              />
            ))}
          </div>
        </Field>

        <div className="space-y-3 pt-2">
          <Toggle label="Furnished" checked={data.furnished} onChange={(v) => onChange({ furnished: v })} />
          <Toggle label="Storage Available" checked={data.storage} onChange={(v) => onChange({ storage: v })} />
          <Toggle label="Elevator" checked={data.elevator} onChange={(v) => onChange({ elevator: v })} />
          <Toggle label="Wheelchair Accessible" checked={data.wheelchair_accessible} onChange={(v) => onChange({ wheelchair_accessible: v })} />
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest mb-2 font-medium" style={{ color: "rgba(237,233,227,0.28)" }}>{label}</label>
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
        className={`relative w-12 h-6 rounded-full transition-colors ${checked ? "bg-[#C4374A]" : "bg-[rgba(255,255,255,0.1)]"}`}
      >
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-6" : "translate-x-0"}`} />
      </div>
    </label>
  );
}

function OptionButton({ label, selected, onClick, checkable }: { label: string; selected: boolean; onClick: () => void; checkable?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-2.5 rounded-lg text-xs text-center transition-all"
      style={{
        backgroundColor: selected ? "rgba(196,55,74,0.15)" : INPUT_BG,
        border: `1px solid ${selected ? ACCENT : BORDER}`,
        color: selected ? TEXT : TEXT_SEC,
      }}
    >
      {checkable && selected && <span className="mr-1">✓</span>}
      {label}
    </button>
  );
}
