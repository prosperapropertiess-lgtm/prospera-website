"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

const BG      = "#080c14";
const SURFACE = "#0f1520";
const BORDER  = "rgba(255,255,255,0.08)";
const TEXT    = "#EDE9E3";
const TEXT_SEC = "rgba(237,233,227,0.55)";
const TEXT_MUT = "rgba(237,233,227,0.28)";
const ACCENT  = "#8B2030";
const FONT    = "var(--font-dm-sans, sans-serif)";

function Field({ label, name, value, onChange, type = "text", placeholder, required, half }: {
  label: string; name: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean; half?: boolean;
}) {
  return (
    <div style={{ marginBottom: 14, gridColumn: half ? undefined : "1 / -1" }}>
      <label style={{ display: "block", fontSize: 11, color: TEXT_MUT, marginBottom: 5, letterSpacing: "0.07em", textTransform: "uppercase" }}>
        {label}{required && <span style={{ color: ACCENT }}> *</span>}
      </label>
      <input
        name={name} type={type} value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", backgroundColor: "rgba(255,255,255,0.04)",
          border: `1px solid ${BORDER}`, borderRadius: 8,
          padding: "10px 14px", fontSize: 14, color: TEXT, outline: "none",
          boxSizing: "border-box", fontFamily: FONT, transition: "border-color 0.15s",
        }}
        onFocus={(e) => { e.target.style.borderColor = "rgba(139,32,48,0.5)"; }}
        onBlur={(e) => { e.target.style.borderColor = BORDER; }}
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
      <label style={{ display: "block", fontSize: 11, color: TEXT_MUT, marginBottom: 5, letterSpacing: "0.07em", textTransform: "uppercase" }}>
        {label}
      </label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", backgroundColor: "rgba(255,255,255,0.04)",
          border: `1px solid ${BORDER}`, borderRadius: 8,
          padding: "10px 14px", fontSize: 14, color: value ? TEXT : TEXT_MUT,
          outline: "none", cursor: "pointer", fontFamily: FONT,
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ backgroundColor: "#0f1520" }}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function SectionHeader({ num, title, sub }: { num: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 22, paddingTop: 8 }}>
      <p style={{ margin: "0 0 4px", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: ACCENT, fontWeight: 700 }}>
        {num}
      </p>
      <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", color: TEXT }}>
        {title}
      </h2>
      {sub && <p style={{ margin: 0, fontSize: 13, color: TEXT_MUT }}>{sub}</p>}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, backgroundColor: BORDER, margin: "28px 0" }} />;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 12 }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 40, height: 22, borderRadius: 11,
          backgroundColor: checked ? ACCENT : "rgba(255,255,255,0.1)",
          position: "relative", cursor: "pointer", transition: "background-color 0.2s", flexShrink: 0,
        }}
      >
        <div style={{
          position: "absolute", top: 3, left: checked ? 21 : 3,
          width: 16, height: 16, borderRadius: "50%", backgroundColor: "#fff",
          transition: "left 0.2s",
        }} />
      </div>
      <span style={{ fontSize: 14, color: TEXT_SEC }}>{label}</span>
    </label>
  );
}

type FormState = {
  // Financial
  payment_method: string;
  etransfer_email: string;
  bank_institution: string;
  bank_account: string;
  bank_transit: string;
  // Access
  repair_limit: string;
  front_door_code: string;
  garage_code: string;
  alarm_code: string;
  mailbox_notes: string;
  // Insurance
  insurance_provider: string;
  insurance_policy: string;
  insurance_contact: string;
  insurance_phone: string;
  monthly_mortgage: string;
  annual_property_tax: string;
  // Utilities
  hydro_included: boolean;
  gas_included: boolean;
  water_included: boolean;
  internet_included: boolean;
  hydro_account: string;
  gas_account: string;
  // Emergency
  emergency_contact_name: string;
  emergency_contact_phone: string;
  preferred_contact_method: string;
  best_time_to_reach: string;
  other_contacts: string;
  // Outstanding
  maintenance_issues: string;
  tenant_disputes: string;
  planned_renovations: string;
  other_notes: string;
};

const defaultForm: FormState = {
  payment_method: "e-transfer",
  etransfer_email: "", bank_institution: "", bank_account: "", bank_transit: "",
  repair_limit: "200",
  front_door_code: "", garage_code: "", alarm_code: "", mailbox_notes: "",
  insurance_provider: "", insurance_policy: "", insurance_contact: "", insurance_phone: "",
  monthly_mortgage: "", annual_property_tax: "",
  hydro_included: false, gas_included: false, water_included: false, internet_included: false,
  hydro_account: "", gas_account: "",
  emergency_contact_name: "", emergency_contact_phone: "",
  preferred_contact_method: "text", best_time_to_reach: "", other_contacts: "",
  maintenance_issues: "", tenant_disputes: "", planned_renovations: "", other_notes: "",
};

export default function OwnerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [form, setForm] = useState<FormState>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof FormState) => (v: string | boolean) =>
    setForm((p) => ({ ...p, [k]: v }));

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
      router.push(`/onboard/${token}/agreement`);
    } catch {
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, color: TEXT, fontFamily: FONT }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
        select option { background: #0f1520; }
        textarea { font-family: ${FONT}; }
      `}</style>

      {/* Progress bar */}
      <div style={{ height: 3, backgroundColor: "rgba(255,255,255,0.05)" }}>
        <div style={{ height: "100%", width: "50%", backgroundColor: ACCENT, transition: "width 0.6s ease" }} />
      </div>

      {/* Logo */}
      <div style={{ padding: "24px 32px" }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT }}>
          Prospera Properties
        </p>
      </div>

      {/* Main */}
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "16px 24px 80px", animation: "fadeUp 0.6s cubic-bezier(0.23,1,0.32,1) both" }}>

        <div style={{ marginBottom: 36 }}>
          <p style={{ margin: "0 0 6px", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: TEXT_MUT }}>
            Step 2 of 3
          </p>
          <h1 style={{ margin: "0 0 12px", fontSize: 30, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, color: TEXT }}>
            Almost done — a few more details
          </h1>
          <p style={{ margin: 0, fontSize: 15, color: TEXT_SEC, lineHeight: 1.7 }}>
            This is the last form you&apos;ll ever fill out for us. Everything here stays private and secure.
          </p>
        </div>

        <form onSubmit={submit}>

          {/* ── Financial ─────────────────────────────── */}
          <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "24px" }}>
            <SectionHeader num="01" title="Rent Remittance" sub="How you'd like to receive your rental income" />
            <SelectField
              label="Payment Method"
              value={form.payment_method}
              onChange={set("payment_method") as (v: string) => void}
              options={[
                { value: "e-transfer", label: "e-Transfer" },
                { value: "direct deposit", label: "Direct Deposit" },
                { value: "cheque", label: "Cheque" },
              ]}
            />
            {form.payment_method === "e-transfer" && (
              <Field label="e-Transfer Email" name="etransfer_email" value={form.etransfer_email} onChange={set("etransfer_email") as (v: string) => void} type="email" placeholder="your@email.com" />
            )}
            {form.payment_method === "direct deposit" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
                <Field label="Bank Institution" name="bank_institution" value={form.bank_institution} onChange={set("bank_institution") as (v: string) => void} placeholder="TD, RBC…" half />
                <Field label="Transit Number" name="bank_transit" value={form.bank_transit} onChange={set("bank_transit") as (v: string) => void} placeholder="12345" half />
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field label="Account Number" name="bank_account" value={form.bank_account} onChange={set("bank_account") as (v: string) => void} placeholder="1234567" />
                </div>
              </div>
            )}
          </div>

          <Divider />

          {/* ── Property Access ───────────────────────── */}
          <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "24px" }}>
            <SectionHeader num="02" title="Property Access" sub="Codes and access details — stored encrypted" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
              <Field label="Front Door Code" name="front_door_code" value={form.front_door_code} onChange={set("front_door_code") as (v: string) => void} placeholder="Optional" half />
              <Field label="Garage Code" name="garage_code" value={form.garage_code} onChange={set("garage_code") as (v: string) => void} placeholder="Optional" half />
              <Field label="Alarm Code" name="alarm_code" value={form.alarm_code} onChange={set("alarm_code") as (v: string) => void} placeholder="Optional" half />
              <Field label="Repair Limit (no approval, $)" name="repair_limit" value={form.repair_limit} onChange={set("repair_limit") as (v: string) => void} type="number" placeholder="200" half />
              <div style={{ gridColumn: "1 / -1" }}>
                <Field label="Mailbox Notes" name="mailbox_notes" value={form.mailbox_notes} onChange={set("mailbox_notes") as (v: string) => void} placeholder="Key in lockbox, slot 3, etc." />
              </div>
            </div>
          </div>

          <Divider />

          {/* ── Insurance ─────────────────────────────── */}
          <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "24px" }}>
            <SectionHeader num="03" title="Insurance & Financials" sub="Optional — helps us prepare accurate monthly reports" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
              <Field label="Insurance Provider" name="insurance_provider" value={form.insurance_provider} onChange={set("insurance_provider") as (v: string) => void} placeholder="Intact, Aviva…" half />
              <Field label="Policy Number" name="insurance_policy" value={form.insurance_policy} onChange={set("insurance_policy") as (v: string) => void} placeholder="Optional" half />
              <Field label="Broker Name" name="insurance_contact" value={form.insurance_contact} onChange={set("insurance_contact") as (v: string) => void} placeholder="Optional" half />
              <Field label="Broker Phone" name="insurance_phone" value={form.insurance_phone} onChange={set("insurance_phone") as (v: string) => void} type="tel" placeholder="Optional" half />
              <Field label="Monthly Mortgage ($)" name="monthly_mortgage" value={form.monthly_mortgage} onChange={set("monthly_mortgage") as (v: string) => void} type="number" placeholder="Optional" half />
              <Field label="Annual Property Tax ($)" name="annual_property_tax" value={form.annual_property_tax} onChange={set("annual_property_tax") as (v: string) => void} type="number" placeholder="Optional" half />
            </div>
          </div>

          <Divider />

          {/* ── Utilities ─────────────────────────────── */}
          <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "24px" }}>
            <SectionHeader num="04" title="Utilities" sub="Which utilities are included in the rent?" />
            <Toggle label="Hydro / Electricity included in rent" checked={form.hydro_included} onChange={set("hydro_included") as (v: boolean) => void} />
            <Toggle label="Gas included in rent" checked={form.gas_included} onChange={set("gas_included") as (v: boolean) => void} />
            <Toggle label="Water included in rent" checked={form.water_included} onChange={set("water_included") as (v: boolean) => void} />
            <Toggle label="Internet included in rent" checked={form.internet_included} onChange={set("internet_included") as (v: boolean) => void} />
            <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
              <Field label="Hydro Account # (if owner pays)" name="hydro_account" value={form.hydro_account} onChange={set("hydro_account") as (v: string) => void} placeholder="Optional" half />
              <Field label="Gas Account # (if owner pays)" name="gas_account" value={form.gas_account} onChange={set("gas_account") as (v: string) => void} placeholder="Optional" half />
            </div>
          </div>

          <Divider />

          {/* ── Emergency ─────────────────────────────── */}
          <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "24px" }}>
            <SectionHeader num="05" title="Contact Preferences" sub="How you'd like us to reach you" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
              <Field label="Emergency Contact Name" name="emergency_contact_name" value={form.emergency_contact_name} onChange={set("emergency_contact_name") as (v: string) => void} placeholder="Name + relationship" half />
              <Field label="Emergency Contact Phone" name="emergency_contact_phone" value={form.emergency_contact_phone} onChange={set("emergency_contact_phone") as (v: string) => void} type="tel" placeholder="Phone number" half />
            </div>
            <SelectField
              label="Preferred Contact Method"
              value={form.preferred_contact_method}
              onChange={set("preferred_contact_method") as (v: string) => void}
              options={[
                { value: "text", label: "Text" },
                { value: "email", label: "Email" },
                { value: "call", label: "Phone Call" },
              ]}
            />
            <Field label="Best Time to Reach You" name="best_time_to_reach" value={form.best_time_to_reach} onChange={set("best_time_to_reach") as (v: string) => void} placeholder="e.g. Weekdays after 5pm" />
            <div style={{ marginBottom: 0 }}>
              <label style={{ display: "block", fontSize: 11, color: TEXT_MUT, marginBottom: 5, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                Other Contacts (accountant, spouse, family)
              </label>
              <textarea
                value={form.other_contacts}
                onChange={(e) => set("other_contacts")(e.target.value)}
                placeholder="Optional — anyone else we should know about"
                rows={2}
                style={{
                  width: "100%", backgroundColor: "rgba(255,255,255,0.04)",
                  border: `1px solid ${BORDER}`, borderRadius: 8,
                  padding: "10px 14px", fontSize: 14, color: TEXT,
                  outline: "none", resize: "vertical",
                  fontFamily: FONT,
                }}
                onFocus={(e) => { e.target.style.borderColor = "rgba(139,32,48,0.5)"; }}
                onBlur={(e) => { e.target.style.borderColor = BORDER; }}
              />
            </div>
          </div>

          <Divider />

          {/* ── Outstanding ───────────────────────────── */}
          <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "24px" }}>
            <SectionHeader num="06" title="Anything We Should Know?" sub="Issues, disputes, or upcoming plans at the property" />

            {[
              { key: "maintenance_issues", label: "Known Maintenance Issues", placeholder: "Leaky faucet in unit 2, needs HVAC service…" },
              { key: "tenant_disputes", label: "Ongoing Tenant Disputes", placeholder: "Any late payment history, noise complaints, etc." },
              { key: "planned_renovations", label: "Planned Renovations", placeholder: "Kitchen update planned for fall, etc." },
              { key: "other_notes", label: "Anything Else", placeholder: "Anything else Ebin should know before taking over" },
            ].map(({ key, label, placeholder }) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, color: TEXT_MUT, marginBottom: 5, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                  {label}
                </label>
                <textarea
                  value={form[key as keyof FormState] as string}
                  onChange={(e) => set(key as keyof FormState)(e.target.value)}
                  placeholder={placeholder}
                  rows={2}
                  style={{
                    width: "100%", backgroundColor: "rgba(255,255,255,0.04)",
                    border: `1px solid ${BORDER}`, borderRadius: 8,
                    padding: "10px 14px", fontSize: 14, color: TEXT,
                    outline: "none", resize: "vertical",
                    fontFamily: FONT,
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(139,32,48,0.5)"; }}
                  onBlur={(e) => { e.target.style.borderColor = BORDER; }}
                />
              </div>
            ))}
          </div>

          {error && (
            <p style={{ margin: "16px 0 0", fontSize: 13, color: "#f87171", textAlign: "center" }}>{error}</p>
          )}

          {/* Submit */}
          <div style={{ position: "sticky", bottom: 0, padding: "16px 0 8px", backgroundColor: BG, marginTop: 28 }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                width: "100%",
                backgroundColor: saving ? "rgba(139,32,48,0.6)" : ACCENT,
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "15px 24px",
                fontSize: 15,
                fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
                letterSpacing: "-0.01em",
                transition: "all 0.2s",
              }}
            >
              {saving ? "Saving…" : "Save & Continue to Agreement →"}
            </button>
            <p style={{ margin: "10px 0 0", textAlign: "center", fontSize: 12, color: TEXT_MUT }}>
              Encrypted and stored securely. Only Ebin can access this.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}
