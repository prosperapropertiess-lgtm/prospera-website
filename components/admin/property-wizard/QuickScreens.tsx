"use client";
// The six quick screens of the property wizard. Tap answers wherever possible;
// type only what can't be tapped. Same look as the public /view and /apply forms.
import { useState } from "react";
import AddressAutocomplete from "@/components/ui/AddressAutocomplete";
import { NAVY, BORDER, MUTED, Question, Choice, Input, Err } from "@/components/flow/FlowUI";
import { torontoToday } from "@/lib/viewing-requests";
import { looksLikeCompleteAddress, type WizardData } from "./PropertyWizard";

export type ScreenProps = { data: WizardData; onChange: (p: Partial<WizardData>) => void; errors: Record<string, string> };

const CITIES = ["London", "St. Thomas", "Strathroy"];
const TYPES = [["house", "House"], ["apartment", "Apartment"], ["condo", "Condo"], ["townhouse", "Townhouse"], ["duplex", "Duplex unit"], ["basement", "Basement unit"]];
const APPLIANCES = ["Fridge", "Stove", "Dishwasher", "Microwave", "Washer", "Dryer"];
const UTILITIES = [["heat", "Heat"], ["hydro", "Hydro"], ["water", "Water"], ["gas", "Gas"], ["internet", "Internet"]] as const;
// Middlesex averages, 65% shown as "about" — same estimates the old Utilities step used.
const UTIL_ESTIMATE: Record<string, number> = { heat: 72, water: 49, hydro: 62, internet: 49, gas: 36 };

function Row({ children, cols = 2 }: { children: React.ReactNode; cols?: 2 | 3 | 4 | 6 }) {
  const c = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-2 sm:grid-cols-4", 6: "grid-cols-3 sm:grid-cols-6" }[cols];
  return <div className={`grid ${c} gap-2`}>{children}</div>;
}

function Area({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-4 py-3.5 border rounded-lg text-base bg-white min-h-[88px]" style={{ borderColor: BORDER, color: "#222" }} />
  );
}

const num = (v: string): number | "" => (v === "" ? "" : Number(v));

// ── 1. The home ──────────────────────────────────────────────
export function HomeScreen({ data, onChange, errors }: ScreenProps) {
  const [googleDown, setGoogleDown] = useState(false);
  const [typedError, setTypedError] = useState("");
  return (
    <div className="grid gap-8">
      <Question id="address" title="Street address" sub="Pick it from the list so the full address is saved." error={errors.address}>
        <AddressAutocomplete
          value={data.address}
          onChange={(val) => { setTypedError(""); onChange({ address: val, address_confirmed: false }); }}
          onUnavailable={() => setGoogleDown(true)}
          onPlaceSelect={(place) => {
            const p: Partial<WizardData> = { address: place.street_address, address_confirmed: true, latitude: place.lat, longitude: place.lng };
            const city = { London: "London", "St. Thomas": "St. Thomas", Strathroy: "Strathroy", "Strathroy-Caradoc": "Strathroy" }[place.city ?? ""];
            if (city) p.city = city;
            onChange(p);
          }}
          placeholder="Start typing the address…"
          className="w-full px-4 py-3.5 border rounded-lg text-base bg-white outline-none"
          style={{ borderColor: !data.address_confirmed && data.address ? "#8B2030" : BORDER, color: "#222" }}
        />
        {data.address_confirmed && data.address && <p className="text-sm mt-2" style={{ color: NAVY }}>✓ Address confirmed</p>}
        {!data.address_confirmed && data.address && (
          <button type="button" className="text-sm underline mt-2" style={{ color: NAVY }}
            onClick={() => looksLikeCompleteAddress(data.address)
              ? onChange({ address: data.address.trim(), address_confirmed: true })
              : setTypedError("Type the full street address, ending with the street type, like \"12 Oak Cres\".")}>
            {googleDown ? "Lookup is down. Use the address as typed" : "Not in the list? Use it as typed"}
          </button>
        )}
        {typedError && <Err>{typedError}</Err>}
      </Question>

      <Question id="unit_number" title="Unit number (optional)" sub="Basement, upper, unit 3. Leave blank for a whole house.">
        <Input value={data.unit_number} onChange={(e) => onChange({ unit_number: e.target.value })} placeholder="e.g. Unit 3, Lower" />
      </Question>

      <Question id="city" title="City">
        <Row cols={3}>{CITIES.map((c) => <Choice key={c} compact selected={data.city === c} onClick={() => onChange({ city: c })}>{c}</Choice>)}</Row>
      </Question>

      <Question id="property_type" title="Type of home">
        <Row cols={3}>{TYPES.map(([v, l]) => <Choice key={v} compact selected={data.property_type === v} onClick={() => onChange({ property_type: v })}>{l}</Choice>)}</Row>
      </Question>

      <Question id="bedrooms" title="Bedrooms" error={errors.bedrooms}>
        <Row cols={6}>{[0, 1, 2, 3, 4, 5].map((n) => <Choice key={n} compact selected={data.bedrooms === n} onClick={() => onChange({ bedrooms: n })}>{n === 0 ? "Studio" : n === 5 ? "5+" : n}</Choice>)}</Row>
      </Question>

      <Question id="bathrooms" title="Bathrooms" error={errors.bathrooms}>
        <Row cols={6}>{[1, 1.5, 2, 2.5, 3, 3.5].map((n) => <Choice key={n} compact selected={data.bathrooms === n} onClick={() => onChange({ bathrooms: n })}>{n}</Choice>)}</Row>
      </Question>

      <Question id="sqft" title="Size in square feet (optional)">
        <Input type="number" inputMode="numeric" value={data.sqft} onChange={(e) => onChange({ sqft: num(e.target.value) })} placeholder="e.g. 850" />
      </Question>
    </div>
  );
}

// ── 2. Rent & move-in ────────────────────────────────────────
export function RentScreen({ data, onChange, errors }: ScreenProps) {
  const today = torontoToday();
  const now = !!data.available_date && data.available_date <= today;
  const [pickDate, setPickDate] = useState(!!data.available_date && data.available_date > today);
  const keyDeposit = data.move_in_costs["Key Deposit"] ?? "";
  return (
    <div className="grid gap-8">
      <Question id="price" title="Monthly rent" error={errors.price}>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base" style={{ color: MUTED }}>$</span>
          <Input type="number" inputMode="numeric" className="pl-8" value={data.price} invalid={!!errors.price}
            onChange={(e) => onChange({ price: num(e.target.value), deposit: num(e.target.value) })} placeholder="1800" />
        </div>
      </Question>

      <Question id="available_date" title="When is it available?" error={errors.available_date}>
        <div className="grid gap-2">
          <Row>
            <Choice compact selected={now && !pickDate} onClick={() => { setPickDate(false); onChange({ available_date: today }); }}>Now</Choice>
            <Choice compact selected={pickDate} onClick={() => setPickDate(true)}>Pick a date</Choice>
          </Row>
          {pickDate && <Input type="date" min={today} value={data.available_date} onChange={(e) => onChange({ available_date: e.target.value })} />}
        </div>
      </Question>

      <Question id="lease_term" title="Lease length">
        <Row cols={3}>
          {[["12 months", "1 year"], ["month-to-month", "Month to month"], ["flexible", "Flexible"]].map(([v, l]) => (
            <Choice key={v} compact selected={data.lease_term === v} onClick={() => onChange({ lease_term: v })}>{l}</Choice>
          ))}
        </Row>
      </Question>

      <Question id="deposits" title="Deposits" sub="Ontario allows a last month's rent deposit and a refundable key deposit. No damage deposits.">
        <div className="grid gap-2">
          <Choice compact selected={data.last_month_required} onClick={() => onChange({ last_month_required: !data.last_month_required })}>
            Last month&apos;s rent deposit{data.price ? ` ($${Number(data.price).toLocaleString()})` : ""}
          </Choice>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base" style={{ color: MUTED }}>Key deposit $</span>
            <Input type="number" inputMode="numeric" className="pl-[118px]" value={keyDeposit}
              onChange={(e) => {
                const costs = { ...data.move_in_costs };
                if (e.target.value === "") delete costs["Key Deposit"]; else costs["Key Deposit"] = Number(e.target.value);
                onChange({ move_in_costs: costs });
              }} />
          </div>
        </div>
      </Question>

      <Question id="other_costs" title="Any other monthly costs? (optional)" sub="Renters see this. e.g. Parking $50/mo, water heater rental $30/mo.">
        <Input value={data.other_costs} onChange={(e) => onChange({ other_costs: e.target.value })} placeholder="Leave blank if none" />
      </Question>
    </div>
  );
}

// ── 3. Inside ────────────────────────────────────────────────
export function InsideScreen({ data, onChange }: ScreenProps) {
  const toggle = (a: string) => onChange({ appliances: data.appliances.includes(a) ? data.appliances.filter((x) => x !== a) : [...data.appliances, a] });
  return (
    <div className="grid gap-8">
      <Question id="appliances" title="Appliances included" sub="Tap all that come with the home.">
        <Row cols={3}>{APPLIANCES.map((a) => <Choice key={a} compact selected={data.appliances.includes(a)} onClick={() => toggle(a)}>{a}</Choice>)}</Row>
      </Question>
      <Question id="laundry_type" title="Laundry">
        <Row cols={2}>
          {[["in-unit", "In the unit"], ["shared", "Shared, no cost"], ["coin-op", "Shared, coin or card"], ["none", "None"]].map(([v, l]) => (
            <Choice key={v} compact selected={data.laundry_type === v} onClick={() => onChange({ laundry_type: v })}>{l}</Choice>
          ))}
        </Row>
      </Question>
      <Question id="heating_type" title="Heating">
        <Row cols={2}>
          {[["gas", "Gas furnace"], ["electric", "Electric"], ["baseboard", "Baseboard"], ["heat-pump", "Heat pump"]].map(([v, l]) => (
            <Choice key={v} compact selected={data.heating_type === v} onClick={() => onChange({ heating_type: v })}>{l}</Choice>
          ))}
        </Row>
      </Question>
      <Question id="ac" title="Air conditioning?">
        <Row><Choice compact selected={data.ac} onClick={() => onChange({ ac: true })}>Yes</Choice><Choice compact selected={!data.ac} onClick={() => onChange({ ac: false })}>No</Choice></Row>
      </Question>
      <Question id="furnished" title="Furnished?">
        <Row><Choice compact selected={!data.furnished} onClick={() => onChange({ furnished: false })}>No</Choice><Choice compact selected={data.furnished} onClick={() => onChange({ furnished: true })}>Yes</Choice></Row>
      </Question>
    </div>
  );
}

// ── 4. Parking & outside ─────────────────────────────────────
export function OutsideScreen({ data, onChange }: ScreenProps) {
  return (
    <div className="grid gap-8">
      <Question id="parking_type" title="Parking">
        <Row cols={3}>
          {[["none", "None"], ["driveway", "Driveway"], ["garage", "Garage"], ["street", "Street"], ["lot", "Lot"], ["underground", "Underground"]].map(([v, l]) => (
            <Choice key={v} compact selected={data.parking_type === v} onClick={() => onChange({ parking_type: v, parking: v !== "none" && v !== "street", parking_spaces: v === "none" ? "" : data.parking_spaces })}>{l}</Choice>
          ))}
        </Row>
      </Question>
      {data.parking_type && data.parking_type !== "none" && data.parking_type !== "street" && (
        <Question id="parking_spaces" title="How many spots?" followUp>
          <Row cols={3}>{[1, 2, 3].map((n) => <Choice key={n} compact selected={data.parking_spaces === n} onClick={() => onChange({ parking_spaces: n })}>{n === 3 ? "3+" : n}</Choice>)}</Row>
        </Question>
      )}
      <Question id="outdoor_space" title="Outdoor space">
        <Row cols={3}>
          {[["none", "None"], ["balcony", "Balcony"], ["patio", "Patio"], ["deck", "Deck"], ["yard", "Private yard"], ["shared_yard", "Shared yard"]].map(([v, l]) => (
            <Choice key={v} compact selected={data.outdoor_space === v} onClick={() => onChange({ outdoor_space: v })}>{l}</Choice>
          ))}
        </Row>
      </Question>
      <Question id="storage" title="Storage?">
        <Row><Choice compact selected={!data.storage} onClick={() => onChange({ storage: false, storage_details: "" })}>No</Choice><Choice compact selected={data.storage} onClick={() => onChange({ storage: true })}>Yes</Choice></Row>
      </Question>
      {data.storage && (
        <Question id="storage_details" title="What kind?" followUp>
          <Input value={data.storage_details} onChange={(e) => onChange({ storage_details: e.target.value })} placeholder="e.g. Locker in the basement, shed" />
        </Question>
      )}
      <Question id="entrance" title="Entrance" sub="Renters see this. Where do they go in?">
        <Input value={data.entrance} onChange={(e) => onChange({ entrance: e.target.value })} placeholder="e.g. Private side door on the left" />
      </Question>
    </div>
  );
}

// ── 5. Utilities & rules ─────────────────────────────────────
export function UtilitiesScreen({ data, onChange }: ScreenProps) {
  function setIncluded(key: string, included: boolean) {
    const cur = data.utilities_detail[key] ?? { included: false, avg_cost: "" };
    const detail = { ...data.utilities_detail, [key]: { included, avg_cost: included ? ("" as const) : cur.avg_cost || UTIL_ESTIMATE[key] } };
    const list = Object.entries(detail).filter(([, v]) => v.included).map(([k]) => k.charAt(0).toUpperCase() + k.slice(1));
    onChange({ utilities_detail: detail, utilities_list: list, utilities_included: list.length > 0 });
  }
  const pets = data.pet_policy;
  const petAnswer = pets.cats && pets.dogs ? "both" : pets.cats ? "cats" : pets.dogs ? "dogs" : data.pet_friendly ? "both" : "none";
  return (
    <div className="grid gap-8">
      <Question id="utilities" title="Which utilities are included in rent?" sub="Tap the ones the owner pays. The rest are on the renter.">
        <Row cols={3}>{UTILITIES.map(([k, l]) => <Choice key={k} compact selected={!!data.utilities_detail[k]?.included} onClick={() => setIncluded(k, !data.utilities_detail[k]?.included)}>{l}</Choice>)}</Row>
      </Question>
      <Question id="pets" title="Pets">
        <Row cols={2}>
          {[["none", "Ask first"], ["cats", "Cats OK"], ["dogs", "Dogs OK"], ["both", "Cats & dogs OK"]].map(([v, l]) => (
            <Choice key={v} compact selected={petAnswer === v} onClick={() => onChange({
              pet_friendly: v !== "none",
              pet_policy: { ...pets, cats: v === "cats" || v === "both", dogs: v === "dogs" || v === "both" },
            })}>{l}</Choice>
          ))}
        </Row>
      </Question>
      <Question id="smoking_allowed" title="Smoking inside?">
        <Row><Choice compact selected={!data.smoking_allowed} onClick={() => onChange({ smoking_allowed: false })}>No smoking</Choice><Choice compact selected={data.smoking_allowed} onClick={() => onChange({ smoking_allowed: true })}>Allowed</Choice></Row>
      </Question>
      <Question id="renter_notes" title="Anything else a renter should know? (optional)" sub="Shown on the brief. Only owner-approved facts, e.g. snow removal, shared spaces, who lives upstairs.">
        <Area value={data.renter_notes} onChange={(v) => onChange({ renter_notes: v })} placeholder="e.g. Tenant handles lawn and snow. Upper unit is occupied by a quiet couple." />
      </Question>
    </div>
  );
}

// ── 6. Showing & access (staff only) ─────────────────────────
export function AccessScreen({ data, onChange }: ScreenProps) {
  return (
    <div className="grid gap-8">
      <div className="rounded-xl border bg-white px-4 py-3 text-sm" style={{ borderColor: BORDER, color: "#333" }}>
        <p className="font-semibold" style={{ color: NAVY }}>Only you and your showing agents see this screen.</p>
        <p>It goes on the agent brief, never the renter brief or the listing.</p>
      </div>
      <Question id="occupancy" title="Is someone living there now?">
        <Row>
          <Choice compact selected={data.occupancy === "vacant"} onClick={() => onChange({ occupancy: "vacant" })}>Vacant</Choice>
          <Choice compact selected={data.occupancy === "occupied"} onClick={() => onChange({ occupancy: "occupied" })}>Occupied</Choice>
        </Row>
      </Question>
      <Question id="access_instructions" title="How do agents get in?" sub="Lockbox location and code, keys, alarm, which door.">
        <Area value={data.access_instructions} onChange={(v) => onChange({ access_instructions: v })} placeholder="e.g. Lockbox on the side gate, code 2580. Lights by the back door." />
      </Question>
      <Question id="showing_notes" title="Showing notes (optional)" sub={data.occupancy === "occupied" ? "Notice the tenant needs, times to avoid, pets in the home." : "Anything agents should point out or avoid."}>
        <Area value={data.showing_notes} onChange={(v) => onChange({ showing_notes: v })} placeholder="e.g. Give the tenant 24 hours notice. Point out the new furnace." />
      </Question>
    </div>
  );
}
