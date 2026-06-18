"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

const BG          = "#F5F4F1";
const CARD        = "#FFFFFF";
const CARD_BORDER = "rgba(15,28,40,0.07)";
const CARD_SHADOW = "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)";
const NAVY        = "#0F1C28";
const MUTED       = "rgba(15,28,40,0.60)";
const SUBTLE      = "rgba(15,28,40,0.42)";
const BURGUNDY    = "#8B2030";
const INPUT_BORDER = "rgba(15,28,40,0.10)";
const INPUT_FOCUS  = "rgba(139,32,48,0.40)";

type FormState = {
  payment_method: string;
  etransfer_email: string;
  bank_institution: string;
  bank_transit: string;
  bank_account: string;
  front_door_code: string;
  garage_code: string;
  alarm_code: string;
  repair_limit: string;
  mailbox_notes: string;
  washer_dryer_location: string;
  washer_dryer_instructions: string;
  appliance_notes: string;
  garbage_pickup_day: string;
  garbage_bin_location: string;
  recycling_notes: string;
  insurance_provider: string;
  insurance_policy: string;
  insurance_contact: string;
  insurance_phone: string;
  monthly_mortgage: string;
  annual_property_tax: string;
  hydro_included: boolean;
  gas_included: boolean;
  water_included: boolean;
  internet_included: boolean;
  hydro_account: string;
  gas_account: string;
  preferred_plumber: string;
  preferred_electrician: string;
  preferred_handyman: string;
  preferred_contractors_other: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  preferred_contact_method: string;
  best_time_to_reach: string;
  other_contacts: string;
  maintenance_issues: string;
  tenant_disputes: string;
  planned_renovations: string;
  other_notes: string;
};

const defaultForm: FormState = {
  payment_method: "e-transfer",
  etransfer_email: "", bank_institution: "", bank_transit: "", bank_account: "",
  front_door_code: "", garage_code: "", alarm_code: "", repair_limit: "200", mailbox_notes: "",
  washer_dryer_location: "in-unit", washer_dryer_instructions: "", appliance_notes: "",
  garbage_pickup_day: "", garbage_bin_location: "", recycling_notes: "",
  insurance_provider: "", insurance_policy: "", insurance_contact: "", insurance_phone: "",
  monthly_mortgage: "", annual_property_tax: "",
  hydro_included: false, gas_included: false, water_included: false, internet_included: false,
  hydro_account: "", gas_account: "",
  preferred_plumber: "", preferred_electrician: "", preferred_handyman: "", preferred_contractors_other: "",
  emergency_contact_name: "", emergency_contact_phone: "",
  preferred_contact_method: "text", best_time_to_reach: "", other_contacts: "",
  maintenance_issues: "", tenant_disputes: "", planned_renovations: "", other_notes: "",
};

// ── Primitives ───────────────────────────────────────────────────

function InputField({ label, name, value, onChange, type = "text", placeholder, required }: {
  label: string; name: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: SUBTLE, marginBottom: 5, letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {label}{required && <span style={{ color: BURGUNDY }}> *</span>}
      </label>
      <input
        name={name} type={type} value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", background: CARD,
          border: `1px solid ${INPUT_BORDER}`, borderRadius: 10,
          padding: "10px 14px", fontSize: 15, color: NAVY, outline: "none",
          boxSizing: "border-box",
          fontFamily: "var(--font-poppins), -apple-system, sans-serif",
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => { e.target.style.borderColor = INPUT_FOCUS; }}
        onBlur={(e) => { e.target.style.borderColor = INPUT_BORDER; }}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: SUBTLE, marginBottom: 5, letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {label}
      </label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", background: CARD,
          border: `1px solid ${INPUT_BORDER}`, borderRadius: 10,
          padding: "10px 14px", fontSize: 15, color: value ? NAVY : MUTED,
          outline: "none", cursor: "pointer",
          fontFamily: "var(--font-poppins), -apple-system, sans-serif",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function TextareaField({ label, name, value, onChange, placeholder, rows = 2 }: {
  label: string; name: string; value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: SUBTLE, marginBottom: 5, letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {label}
      </label>
      <textarea
        name={name} value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: "100%", background: CARD,
          border: `1px solid ${INPUT_BORDER}`, borderRadius: 10,
          padding: "10px 14px", fontSize: 15, color: NAVY,
          outline: "none", resize: "vertical", boxSizing: "border-box",
          fontFamily: "var(--font-poppins), -apple-system, sans-serif",
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => { e.target.style.borderColor = INPUT_FOCUS; }}
        onBlur={(e) => { e.target.style.borderColor = INPUT_BORDER; }}
      />
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", marginBottom: 14 }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 42, height: 24, borderRadius: 12,
          background: checked ? BURGUNDY : "rgba(15,28,40,0.12)",
          position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0,
        }}
      >
        <div style={{
          position: "absolute", top: 4, left: checked ? 22 : 4,
          width: 16, height: 16, borderRadius: "50%", background: "#fff",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        }} />
      </div>
      <span style={{ fontSize: 14, color: MUTED, fontWeight: 500 }}>{label}</span>
    </label>
  );
}

function SectionCard({ num, title, sub, optional, children }: {
  num: string; title: string; sub?: string; optional?: boolean; children: React.ReactNode;
}) {
  return (
    <div style={{ background: CARD, border: `1px solid ${CARD_BORDER}`, boxShadow: CARD_SHADOW, borderRadius: 20, padding: "28px" }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: BURGUNDY, letterSpacing: "0.06em" }}>{num}</span>
          {optional && (
            <span style={{ fontSize: 11, fontWeight: 600, color: MUTED, background: "rgba(15,28,40,0.06)", padding: "1px 8px", borderRadius: 6 }}>
              Optional
            </span>
          )}
        </div>
        <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em" }}>
          {title}
        </h2>
        {sub && <p style={{ margin: 0, fontSize: 13, color: MUTED }}>{sub}</p>}
      </div>
      {children}
    </div>
  );
}

export default function OwnerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [form, setForm] = useState<FormState>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const setStr = (k: keyof FormState) => (v: string) => setForm((p) => ({ ...p, [k]: v }));
  const setBool = (k: keyof FormState) => (v: boolean) => setForm((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const r = await fetch(`/api/onboard/${token}/step/4`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error || "Something went wrong."); setSaving(false); return; }
      router.push(`/onboard/${token}/complete`);
    } catch {
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "var(--font-poppins), -apple-system, sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Progress bar */}
      <div style={{ height: 4, background: "rgba(15,28,40,0.08)" }}>
        <div style={{ height: "100%", width: "66%", background: BURGUNDY, transition: "width 0.6s ease" }} />
      </div>

      {/* Header */}
      <div style={{ padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          onClick={() => router.push(`/onboard/${token}/lease`)}
          style={{
            background: "none", border: "none", cursor: "pointer", padding: "6px 0",
            fontSize: 14, color: MUTED, fontWeight: 500, display: "flex", alignItems: "center", gap: 6,
            fontFamily: "var(--font-poppins), -apple-system, sans-serif",
          }}
        >
          ← Back
        </button>
        <span style={{ fontSize: 13, color: SUBTLE, fontWeight: 500 }}>Step 3 of 3 · Property Details</span>
      </div>

      {/* Main */}
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "16px 20px 80px", animation: "fadeUp 0.5s ease both" }}>

        <div style={{ marginBottom: 36 }}>
          <h1 style={{ margin: "0 0 10px", fontSize: 28, fontWeight: 800, color: NAVY, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            Almost done — a few more details
          </h1>
          <p style={{ margin: 0, fontSize: 15, color: MUTED, lineHeight: 1.7 }}>
            This is the last form you&apos;ll ever fill out for us. Everything here stays private and secure.
          </p>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* 1 — Rent Remittance */}
          <SectionCard num="01" title="Rent Remittance" sub="How you'd like to receive your rental income">
            <SelectField label="Payment Method" value={form.payment_method} onChange={setStr("payment_method")}
              options={[
                { value: "e-transfer", label: "e-Transfer" },
                { value: "direct deposit", label: "Direct Deposit" },
                { value: "cheque", label: "Cheque" },
              ]}
            />
            {form.payment_method === "e-transfer" && (
              <InputField label="e-Transfer Email" name="etransfer_email" value={form.etransfer_email} onChange={setStr("etransfer_email")} type="email" placeholder="your@email.com" />
            )}
            {form.payment_method === "direct deposit" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
                <InputField label="Bank Institution" name="bank_institution" value={form.bank_institution} onChange={setStr("bank_institution")} placeholder="TD, RBC…" />
                <InputField label="Transit Number" name="bank_transit" value={form.bank_transit} onChange={setStr("bank_transit")} placeholder="12345" />
                <div style={{ gridColumn: "1 / -1" }}>
                  <InputField label="Account Number" name="bank_account" value={form.bank_account} onChange={setStr("bank_account")} placeholder="1234567" />
                </div>
              </div>
            )}
          </SectionCard>

          {/* 2 — Property Access */}
          <SectionCard num="02" title="Property Access" sub="Codes and access details — stored encrypted">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
              <InputField label="Front Door Code" name="front_door_code" value={form.front_door_code} onChange={setStr("front_door_code")} placeholder="Optional" />
              <InputField label="Garage Code" name="garage_code" value={form.garage_code} onChange={setStr("garage_code")} placeholder="Optional" />
              <InputField label="Alarm Code" name="alarm_code" value={form.alarm_code} onChange={setStr("alarm_code")} placeholder="Optional" />
              <InputField label="Repair Limit ($)" name="repair_limit" value={form.repair_limit} onChange={setStr("repair_limit")} type="number" placeholder="200" />
              <div style={{ gridColumn: "1 / -1" }}>
                <InputField label="Mailbox Notes" name="mailbox_notes" value={form.mailbox_notes} onChange={setStr("mailbox_notes")} placeholder="Key in lockbox, slot 3, etc." />
              </div>
            </div>
          </SectionCard>

          {/* 3 — Appliances & Laundry */}
          <SectionCard num="03" title="Appliances & Laundry" sub="Helps us handle tenant questions and maintenance correctly">
            <SelectField label="Washer / Dryer" value={form.washer_dryer_location} onChange={setStr("washer_dryer_location")}
              options={[
                { value: "in-unit", label: "In-unit (washer & dryer in the unit)" },
                { value: "shared", label: "Shared laundry in building" },
                { value: "coin-op", label: "Coin-op laundry nearby" },
                { value: "none", label: "No laundry available" },
              ]}
            />
            {(form.washer_dryer_location === "in-unit" || form.washer_dryer_location === "shared") && (
              <TextareaField
                label="Lint trap location & cleaning instructions"
                name="washer_dryer_instructions"
                value={form.washer_dryer_instructions}
                onChange={setStr("washer_dryer_instructions")}
                placeholder="e.g. Lint trap is inside the dryer door. Clean after every use. Filter in laundry room sink."
                rows={2}
              />
            )}
            <TextareaField
              label="Other appliance notes"
              name="appliance_notes"
              value={form.appliance_notes}
              onChange={setStr("appliance_notes")}
              placeholder="e.g. HVAC filter replaced every 3 months, dishwasher needs salt top-up, stove left element runs hot…"
              rows={2}
            />
          </SectionCard>

          {/* 4 — Garbage & Recycling */}
          <SectionCard num="04" title="Garbage & Recycling" sub="So we can brief new tenants and handle complaints correctly">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
              <InputField label="Garbage Pickup Day(s)" name="garbage_pickup_day" value={form.garbage_pickup_day} onChange={setStr("garbage_pickup_day")} placeholder="e.g. Monday, or Mon & Thu" />
              <InputField label="Bin Location" name="garbage_bin_location" value={form.garbage_bin_location} onChange={setStr("garbage_bin_location")} placeholder="e.g. Side of house, back alley" />
            </div>
            <TextareaField
              label="Recycling & special instructions"
              name="recycling_notes"
              value={form.recycling_notes}
              onChange={setStr("recycling_notes")}
              placeholder="e.g. Blue box on Fridays, green bin weekly, bulky items first Monday of month, no styrofoam in recycling…"
              rows={2}
            />
          </SectionCard>

          {/* 5 — Insurance & Financials */}
          <SectionCard num="05" title="Insurance & Financials" sub="Helps us prepare accurate monthly reports" optional>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
              <InputField label="Insurance Provider" name="insurance_provider" value={form.insurance_provider} onChange={setStr("insurance_provider")} placeholder="Intact, Aviva…" />
              <InputField label="Policy Number" name="insurance_policy" value={form.insurance_policy} onChange={setStr("insurance_policy")} placeholder="Optional" />
              <InputField label="Broker Name" name="insurance_contact" value={form.insurance_contact} onChange={setStr("insurance_contact")} placeholder="Optional" />
              <InputField label="Broker Phone" name="insurance_phone" value={form.insurance_phone} onChange={setStr("insurance_phone")} type="tel" placeholder="Optional" />
              <InputField label="Monthly Mortgage ($)" name="monthly_mortgage" value={form.monthly_mortgage} onChange={setStr("monthly_mortgage")} type="number" placeholder="Optional" />
              <InputField label="Annual Property Tax ($)" name="annual_property_tax" value={form.annual_property_tax} onChange={setStr("annual_property_tax")} type="number" placeholder="Optional" />
            </div>
          </SectionCard>

          {/* 6 — Utilities */}
          <SectionCard num="06" title="Utilities" sub="Which utilities are included in the rent?">
            <Toggle label="Hydro / Electricity included in rent" checked={form.hydro_included} onChange={setBool("hydro_included")} />
            <Toggle label="Gas included in rent" checked={form.gas_included} onChange={setBool("gas_included")} />
            <Toggle label="Water included in rent" checked={form.water_included} onChange={setBool("water_included")} />
            <Toggle label="Internet included in rent" checked={form.internet_included} onChange={setBool("internet_included")} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px", marginTop: 8 }}>
              <InputField label="Hydro Account # (if owner pays)" name="hydro_account" value={form.hydro_account} onChange={setStr("hydro_account")} placeholder="Optional" />
              <InputField label="Gas Account # (if owner pays)" name="gas_account" value={form.gas_account} onChange={setStr("gas_account")} placeholder="Optional" />
            </div>
          </SectionCard>

          {/* 7 — Preferred Contractors */}
          <SectionCard num="07" title="Preferred Contractors" sub="Anyone you already trust — we'll call them first" optional>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
              If you have contractors you&apos;ve worked with and trust, list them here. Name and phone is enough.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
              <InputField label="Preferred Plumber" name="preferred_plumber" value={form.preferred_plumber} onChange={setStr("preferred_plumber")} placeholder="Name + phone" />
              <InputField label="Preferred Electrician" name="preferred_electrician" value={form.preferred_electrician} onChange={setStr("preferred_electrician")} placeholder="Name + phone" />
              <InputField label="Preferred Handyman / General" name="preferred_handyman" value={form.preferred_handyman} onChange={setStr("preferred_handyman")} placeholder="Name + phone" />
              <InputField label="Other (HVAC, landscaping, etc.)" name="preferred_contractors_other" value={form.preferred_contractors_other} onChange={setStr("preferred_contractors_other")} placeholder="Name, trade + phone" />
            </div>
          </SectionCard>

          {/* 8 — Contact Preferences */}
          <SectionCard num="08" title="Contact Preferences" sub="How you'd like us to reach you">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
              <InputField label="Emergency Contact Name" name="emergency_contact_name" value={form.emergency_contact_name} onChange={setStr("emergency_contact_name")} placeholder="Name + relationship" />
              <InputField label="Emergency Contact Phone" name="emergency_contact_phone" value={form.emergency_contact_phone} onChange={setStr("emergency_contact_phone")} type="tel" placeholder="Phone number" />
            </div>
            <SelectField label="Preferred Contact Method" value={form.preferred_contact_method} onChange={setStr("preferred_contact_method")}
              options={[
                { value: "text", label: "Text" },
                { value: "email", label: "Email" },
                { value: "call", label: "Phone Call" },
              ]}
            />
            <InputField label="Best Time to Reach You" name="best_time_to_reach" value={form.best_time_to_reach} onChange={setStr("best_time_to_reach")} placeholder="e.g. Weekdays after 5pm" />
            <TextareaField label="Other Contacts (accountant, spouse, family)" name="other_contacts" value={form.other_contacts} onChange={setStr("other_contacts")} placeholder="Optional — anyone else we should know about" rows={2} />
          </SectionCard>

          {/* 9 — Anything We Should Know? */}
          <SectionCard num="09" title="Anything We Should Know?" sub="Issues, disputes, or upcoming plans at the property">
            {([
              { key: "maintenance_issues", label: "Known Maintenance Issues", placeholder: "Leaky faucet in unit 2, needs HVAC service…" },
              { key: "tenant_disputes", label: "Ongoing Tenant Disputes", placeholder: "Any late payment history, noise complaints, etc." },
              { key: "planned_renovations", label: "Planned Renovations", placeholder: "Kitchen update planned for fall, etc." },
              { key: "other_notes", label: "Anything Else", placeholder: "Anything else Ebin should know before taking over" },
            ] as const).map(({ key, label, placeholder }) => (
              <TextareaField key={key} label={label} name={key} value={form[key]} onChange={setStr(key)} placeholder={placeholder} rows={2} />
            ))}
          </SectionCard>

          {error && (
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#B91C1C", textAlign: "center", fontWeight: 500 }}>{error}</p>
          )}

          {/* Submit */}
          <div style={{ paddingBottom: 8 }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                width: "100%",
                background: BURGUNDY,
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "16px 24px",
                fontSize: 16,
                fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.45 : 1,
                fontFamily: "var(--font-poppins), -apple-system, sans-serif",
                transition: "opacity 0.15s",
              }}
            >
              {saving ? "Saving…" : "Save & Continue to Agreement →"}
            </button>
            <p style={{ margin: "10px 0 0", textAlign: "center", fontSize: 12, color: SUBTLE }}>
              Encrypted and stored securely. Only Ebin can access this.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}
