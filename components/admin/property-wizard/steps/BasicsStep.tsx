import type { WizardData } from "../PropertyWizard";
import AddressAutocomplete from "@/components/ui/AddressAutocomplete";

const SURFACE = "#FFFFFF";
const BORDER = "#D8D2C8";
const TEXT = "#222222";
const TEXT_SEC = "#333333";
const TEXT_MUT = "#666666";
const INPUT_BG = "#F7F5F2";

const inputCls = "w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors focus:ring-1 focus:ring-[#8B2030]/40";

const CITIES = ["London", "St. Thomas", "Strathroy"];
const PROPERTY_TYPES = [
  { value: "", label: "Select type..." },
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "duplex", label: "Duplex" },
  { value: "triplex", label: "Triplex" },
  { value: "other", label: "Other" },
];

interface Props {
  data: WizardData;
  onChange: (partial: Partial<WizardData>) => void;
}

export default function BasicsStep({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-cormorant)] text-3xl font-light" style={{ color: TEXT }}>
          Property Basics
        </h2>
        <p className="text-sm mt-1" style={{ color: TEXT_SEC }}>
          Start with the essential details. You can always come back and edit.
        </p>
      </div>

      <div className="rounded-xl border p-6 space-y-5" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
        <Field label="Street Address" required>
          <AddressAutocomplete
            value={data.address}
            onChange={(val) => onChange({ address: val })}
            onPlaceSelect={(place) => {
              const updates: Partial<WizardData> = {
                address: place.street_address,
                latitude: place.lat,
                longitude: place.lng,
              };
              if (place.city) {
                const cityMap: Record<string, string> = { "London": "London", "St. Thomas": "St. Thomas", "Strathroy": "Strathroy", "Strathroy-Caradoc": "Strathroy" };
                if (cityMap[place.city]) updates.city = cityMap[place.city];
              }
              onChange(updates);
            }}
            placeholder="Start typing an address..."
            className={inputCls}
            style={{ backgroundColor: INPUT_BG, color: TEXT, borderColor: BORDER, border: `1px solid ${BORDER}` }}
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="City" required>
            <select
              value={data.city}
              onChange={(e) => onChange({ city: e.target.value })}
              className={inputCls}
              style={{ backgroundColor: INPUT_BG, color: TEXT, borderColor: BORDER, border: `1px solid ${BORDER}` }}
            >
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Property Type">
            <select
              value={data.property_type}
              onChange={(e) => onChange({ property_type: e.target.value })}
              className={inputCls}
              style={{ backgroundColor: INPUT_BG, color: TEXT, borderColor: BORDER, border: `1px solid ${BORDER}` }}
            >
              {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>
        </div>

      </div>

      <div className="rounded-xl border p-6 space-y-5" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
        <h3 className="text-sm font-medium uppercase tracking-widest" style={{ color: TEXT_MUT }}>Size & Pricing</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label="Monthly Rent ($)" required>
            <input
              type="number"
              value={data.price}
              onChange={(e) => onChange({ price: e.target.value === "" ? "" : Number(e.target.value) })}
              placeholder="1800"
              min={1}
              required
              className={inputCls}
              style={{ backgroundColor: INPUT_BG, color: TEXT, borderColor: BORDER, border: `1px solid ${BORDER}` }}
            />
          </Field>

          <Field label="Bedrooms" required>
            <input
              type="number"
              value={data.bedrooms}
              onChange={(e) => onChange({ bedrooms: e.target.value === "" ? "" : Number(e.target.value) })}
              placeholder="2"
              min={1}
              required
              className={inputCls}
              style={{ backgroundColor: INPUT_BG, color: TEXT, borderColor: BORDER, border: `1px solid ${BORDER}` }}
            />
          </Field>

          <Field label="Bathrooms" required>
            <input
              type="number"
              value={data.bathrooms}
              onChange={(e) => onChange({ bathrooms: e.target.value === "" ? "" : Number(e.target.value) })}
              placeholder="1"
              min={1}
              step={0.5}
              required
              className={inputCls}
              style={{ backgroundColor: INPUT_BG, color: TEXT, borderColor: BORDER, border: `1px solid ${BORDER}` }}
            />
          </Field>

          <Field label="Sq Ft">
            <input
              type="number"
              value={data.sqft}
              onChange={(e) => onChange({ sqft: e.target.value === "" ? "" : Number(e.target.value) })}
              placeholder="900"
              min={0}
              className={inputCls}
              style={{ backgroundColor: INPUT_BG, color: TEXT, borderColor: BORDER, border: `1px solid ${BORDER}` }}
            />
          </Field>
        </div>

        <Field label="Available Date">
          <input
            type="date"
            value={data.available_date}
            onChange={(e) => onChange({ available_date: e.target.value })}
            className={inputCls}
            style={{ backgroundColor: INPUT_BG, color: TEXT, borderColor: BORDER, border: `1px solid ${BORDER}` }}
          />
          <p className="text-xs mt-1.5" style={{ color: TEXT_MUT }}>When can a tenant move in?</p>
        </Field>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest mb-2 font-medium" style={{ color: TEXT_MUT }}>
        {label}{required && <span className="ml-0.5" style={{ color: "#8B2030" }}>*</span>}
      </label>
      {children}
    </div>
  );
}
