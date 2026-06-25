"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const BG          = "#F5F4F1";
const CARD        = "#FFFFFF";
const CARD_BORDER = "rgba(15,28,40,0.07)";
const CARD_SHADOW = "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)";
const NAVY        = "#0F1C28";
const MUTED       = "rgba(15,28,40,0.60)";
const SUBTLE      = "rgba(15,28,40,0.42)";
const BURGUNDY    = "#8B2030";
const GREEN       = "#0A7A52";
const GREEN_BG    = "rgba(10,122,82,0.09)";
const AMBER       = "#B45309";
const AMBER_BG    = "rgba(180,83,9,0.09)";
const INPUT_BORDER = "rgba(15,28,40,0.10)";
const INPUT_FOCUS  = "rgba(139,32,48,0.40)";

interface ParsedLease {
  tenants?: Array<{ name: string; email: string; unit: string; phone: string }>;
  [key: string]: unknown;
}

interface Session {
  token: string;
  current_step: number;
  status: string;
  owner_name: string | null;
  owner_email: string | null;
  owner_phone: string | null;
  property_address: string | null;
  property_city: string | null;
  property_type: string | null;
  num_units: number | null;
  approx_monthly_rent: number | null;
  fee_structure: string | null;
  fee_amount: number | null;
  property_notes: string | null;
  notion_owner_id: string | null;
  notion_property_id: string | null;
  lease_parsed_data: ParsedLease | null;
  step2_completed_at: string | null;
  step3_completed_at: string | null;
  step4_completed_at: string | null;
  agreement_signed_at: string | null;
  step6_data: Record<string, unknown> | null;
  step7_data: Record<string, unknown> | null;
  step8_completed_at: string | null;
  step9_data: Record<string, unknown> | null;
  completed_at: string | null;
  owner_access_token: string | null;
  created_at: string;
}

const ADMIN_HEADER = { "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "" };

function fmt(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-CA", { month: "short", day: "numeric" }) +
    " · " +
    d.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" })
  );
}

// ── Shared form primitives ───────────────────────────────────────

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: SUBTLE, marginBottom: 5, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {label}{required && <span style={{ color: BURGUNDY }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ label, name, value, onChange, type = "text", placeholder, required }: {
  label: string; name: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <Field label={label} required={required}>
      <input
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          background: CARD,
          border: `1px solid ${INPUT_BORDER}`,
          borderRadius: 10,
          padding: "10px 14px",
          fontSize: 15,
          color: NAVY,
          outline: "none",
          boxSizing: "border-box",
          fontFamily: "var(--font-poppins), -apple-system, sans-serif",
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => { e.target.style.borderColor = INPUT_FOCUS; }}
        onBlur={(e) => { e.target.style.borderColor = INPUT_BORDER; }}
      />
    </Field>
  );
}

function Select({ label, name, value, onChange, options, required }: {
  label: string; name: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; required?: boolean;
}) {
  return (
    <Field label={label} required={required}>
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          background: CARD,
          border: `1px solid ${INPUT_BORDER}`,
          borderRadius: 10,
          padding: "10px 14px",
          fontSize: 15,
          color: value ? NAVY : MUTED,
          outline: "none",
          cursor: "pointer",
          fontFamily: "var(--font-poppins), -apple-system, sans-serif",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </Field>
  );
}

function Textarea({ label, name, value, onChange, placeholder, rows = 3 }: {
  label: string; name: string; value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number;
}) {
  return (
    <Field label={label}>
      <textarea
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: "100%",
          background: CARD,
          border: `1px solid ${INPUT_BORDER}`,
          borderRadius: 10,
          padding: "10px 14px",
          fontSize: 15,
          color: NAVY,
          outline: "none",
          resize: "vertical",
          boxSizing: "border-box",
          fontFamily: "var(--font-poppins), -apple-system, sans-serif",
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => { e.target.style.borderColor = INPUT_FOCUS; }}
        onBlur={(e) => { e.target.style.borderColor = INPUT_BORDER; }}
      />
    </Field>
  );
}

function PrimaryBtn({ children, disabled, type = "submit", onClick }: {
  children: React.ReactNode; disabled?: boolean; type?: "submit" | "button"; onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        background: BURGUNDY,
        color: "#fff",
        border: "none",
        borderRadius: 10,
        padding: "12px 24px",
        fontSize: 15,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        fontFamily: "var(--font-poppins), -apple-system, sans-serif",
        transition: "opacity 0.15s",
      }}
    >
      {children}
    </button>
  );
}

function ErrorMsg({ msg }: { msg: string }) {
  if (!msg) return null;
  return <p style={{ color: "#B91C1C", fontSize: 13, margin: "0 0 12px", fontWeight: 500 }}>{msg}</p>;
}

// ── Step card ────────────────────────────────────────────────────

function StepCard({
  num, title, status, completedAt, summary, children,
}: {
  num: number; title: string;
  status: "complete" | "active" | "locked" | "owner";
  completedAt?: string | null;
  summary?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "active" && cardRef.current) {
      setTimeout(() => cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    }
  }, [status]);

  const borderColor =
    status === "complete" ? GREEN :
    status === "active" ? NAVY :
    status === "owner" ? AMBER :
    "rgba(15,28,40,0.12)";

  const chipBg =
    status === "complete" ? GREEN_BG :
    status === "active" ? "rgba(15,28,40,0.08)" :
    status === "owner" ? AMBER_BG :
    "rgba(15,28,40,0.04)";

  const chipColor =
    status === "complete" ? GREEN :
    status === "active" ? NAVY :
    status === "owner" ? AMBER :
    SUBTLE;

  return (
    <div
      ref={cardRef}
      style={{
        background: CARD,
        border: `1px solid ${CARD_BORDER}`,
        borderLeft: `3px solid ${borderColor}`,
        boxShadow: CARD_SHADOW,
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ padding: "18px 22px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 30, height: 30, borderRadius: "50%",
          background: chipBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, color: chipColor, flexShrink: 0,
        }}>
          {status === "complete" ? "✓" : status === "locked" ? "🔒" : num}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: status === "locked" ? SUBTLE : NAVY }}>
            Step {num} — {title}
          </p>
          {status === "complete" && completedAt && (
            <p style={{ margin: "2px 0 0", fontSize: 12, color: SUBTLE }}>{fmt(completedAt)}</p>
          )}
        </div>
        {status === "complete" && (
          <span style={{ fontSize: 12, fontWeight: 700, color: GREEN, background: GREEN_BG, padding: "3px 10px", borderRadius: 8 }}>
            Done
          </span>
        )}
        {status === "owner" && (
          <span style={{ fontSize: 12, fontWeight: 700, color: AMBER, background: AMBER_BG, padding: "3px 10px", borderRadius: 8 }}>
            Owner&apos;s turn
          </span>
        )}
        {status === "locked" && (
          <span style={{ fontSize: 12, color: SUBTLE }}>Complete previous steps first</span>
        )}
      </div>

      {/* Summary (done) */}
      {status === "complete" && summary && (
        <div style={{ padding: "0 22px 18px", borderTop: `1px solid ${CARD_BORDER}` }}>
          <div style={{ paddingTop: 14 }}>{summary}</div>
        </div>
      )}

      {/* Active form */}
      {(status === "active" || status === "owner") && children && (
        <div style={{ padding: "0 22px 22px", borderTop: `1px solid ${CARD_BORDER}` }}>
          <div style={{ paddingTop: 18 }}>{children}</div>
        </div>
      )}
    </div>
  );
}

// ── Progress bar ─────────────────────────────────────────────────

function ProgressBar({ current }: { current: number }) {
  const pct = Math.max(0, Math.min(100, ((current - 2) / 8) * 100));
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>Onboarding progress</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: current >= 10 ? GREEN : BURGUNDY }}>{Math.round(pct)}%</span>
      </div>
      <div style={{ height: 6, background: "rgba(15,28,40,0.08)", borderRadius: 4 }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: current >= 10 ? GREEN : BURGUNDY,
          borderRadius: 4,
          transition: "width 0.6s cubic-bezier(0.23,1,0.32,1)",
        }} />
      </div>
    </div>
  );
}

// ── Step 2 form ──────────────────────────────────────────────────

function Step2Form({ token, onComplete }: { token: string; onComplete: () => void }) {
  const [form, setForm] = useState({ owner_name: "", owner_email: "", owner_phone: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.owner_name.trim() || !form.owner_email.trim()) { setError("Name and email are required."); return; }
    setSaving(true); setError("");
    const r = await fetch(`/api/onboard/${token}/step/2`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...ADMIN_HEADER },
      body: JSON.stringify(form),
    });
    const d = await r.json();
    if (!r.ok) { setError(d.error || "Failed"); setSaving(false); return; }
    onComplete();
  }

  return (
    <form onSubmit={submit}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <Input label="Full Name" name="owner_name" value={form.owner_name} onChange={set("owner_name")} placeholder="Randy Lahey" required />
        </div>
        <Input label="Email" name="owner_email" value={form.owner_email} onChange={set("owner_email")} type="email" placeholder="randy@email.com" required />
        <Input label="Phone" name="owner_phone" value={form.owner_phone} onChange={set("owner_phone")} type="tel" placeholder="519-555-0101" />
      </div>
      <ErrorMsg msg={error} />
      <PrimaryBtn disabled={saving}>{saving ? "Saving…" : "Save Owner Info →"}</PrimaryBtn>
    </form>
  );
}

// ── Step 3 form ──────────────────────────────────────────────────

function Step3Form({ token, onComplete, initialAddress, initialType }: {
  token: string; onComplete: () => void;
  initialAddress?: string | null; initialType?: string | null;
}) {
  const [form, setForm] = useState({
    property_address: initialAddress ?? "",
    property_city: "",
    property_type: initialType ?? "",
    num_units: "", approx_monthly_rent: "", fee_structure: "", fee_amount: "", property_notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.property_address.trim()) { setError("Address is required."); return; }
    setSaving(true); setError("");
    const r = await fetch(`/api/onboard/${token}/step/4`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...ADMIN_HEADER },
      body: JSON.stringify({
        ...form,
        num_units: form.num_units ? parseInt(form.num_units) : null,
        approx_monthly_rent: form.approx_monthly_rent ? parseFloat(form.approx_monthly_rent) : null,
        fee_amount: form.fee_amount ? parseFloat(form.fee_amount) : null,
      }),
    });
    const d = await r.json();
    if (!r.ok) { setError(d.error || "Failed"); setSaving(false); return; }
    onComplete();
  }

  return (
    <form onSubmit={submit}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <Input label="Property Address" name="property_address" value={form.property_address} onChange={set("property_address")} placeholder="27 Horton St, London, ON" required />
        </div>
        <Input label="City" name="property_city" value={form.property_city} onChange={set("property_city")} placeholder="London" />
        <Select label="Property Type" name="property_type" value={form.property_type} onChange={set("property_type")}
          options={[
            { value: "", label: "Select type…" },
            { value: "House", label: "House" },
            { value: "Duplex", label: "Duplex" },
            { value: "Triplex", label: "Triplex" },
            { value: "Condo", label: "Condo" },
            { value: "Other", label: "Other" },
          ]}
        />
        <Input label="Number of Units" name="num_units" value={form.num_units} onChange={set("num_units")} type="number" placeholder="2" />
        <Input label="Approx. Monthly Rent ($)" name="approx_monthly_rent" value={form.approx_monthly_rent} onChange={set("approx_monthly_rent")} type="number" placeholder="3100" />
        <Select label="Fee Structure" name="fee_structure" value={form.fee_structure} onChange={set("fee_structure")}
          options={[
            { value: "", label: "Select…" },
            { value: "Percentage", label: "Percentage" },
            { value: "Flat Fee", label: "Flat Fee" },
          ]}
        />
        {form.fee_structure && (
          <Input label="Fee Amount" name="fee_amount" value={form.fee_amount} onChange={set("fee_amount")} type="number" placeholder={form.fee_structure === "Percentage" ? "10" : "300"} />
        )}
        <div style={{ gridColumn: "1 / -1" }}>
          <Textarea label="Property Notes" name="property_notes" value={form.property_notes} onChange={set("property_notes")} placeholder="Anything else worth noting…" rows={2} />
        </div>
      </div>
      <ErrorMsg msg={error} />
      <PrimaryBtn disabled={saving}>{saving ? "Saving + Sending Email…" : "Save Property & Send Email 1 →"}</PrimaryBtn>
    </form>
  );
}

// ── Step 6: Keys & Access ────────────────────────────────────────

function Step6Form({ token, onComplete }: { token: string; onComplete: () => void }) {
  const [form, setForm] = useState({ num_keys: "", repair_limit: "200", front_door_code: "", garage_code: "", alarm_code: "", mailbox_notes: "" });
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/onboard/${token}/step/6`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...ADMIN_HEADER },
      body: JSON.stringify(form),
    });
    onComplete();
  }

  return (
    <form onSubmit={submit}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <Input label="Number of Keys" name="num_keys" value={form.num_keys} onChange={set("num_keys")} type="number" placeholder="2" />
        <Input label="Repair Limit ($)" name="repair_limit" value={form.repair_limit} onChange={set("repair_limit")} type="number" placeholder="200" />
        <Input label="Front Door Code" name="front_door_code" value={form.front_door_code} onChange={set("front_door_code")} placeholder="Optional" />
        <Input label="Garage Code" name="garage_code" value={form.garage_code} onChange={set("garage_code")} placeholder="Optional" />
        <Input label="Alarm Code" name="alarm_code" value={form.alarm_code} onChange={set("alarm_code")} placeholder="Optional" />
        <Input label="Mailbox Notes" name="mailbox_notes" value={form.mailbox_notes} onChange={set("mailbox_notes")} placeholder="Key in lockbox at door" />
      </div>
      <PrimaryBtn disabled={saving}>{saving ? "Saving…" : "Save Keys & Access →"}</PrimaryBtn>
    </form>
  );
}

// ── Step 7: Inspection ───────────────────────────────────────────

function Step7Form({ token, onComplete }: { token: string; onComplete: () => void }) {
  const [form, setForm] = useState({ overall_condition: "", issues: "", notes: "", inspected_at: new Date().toISOString().slice(0, 10) });
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/onboard/${token}/step/7`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...ADMIN_HEADER },
      body: JSON.stringify(form),
    });
    onComplete();
  }

  return (
    <form onSubmit={submit}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <Select label="Overall Condition" name="overall_condition" value={form.overall_condition} onChange={set("overall_condition")}
          options={[
            { value: "", label: "Select…" },
            { value: "Excellent", label: "Excellent" },
            { value: "Good", label: "Good" },
            { value: "Fair", label: "Fair" },
            { value: "Needs Work", label: "Needs Work" },
          ]}
        />
        <Input label="Inspection Date" name="inspected_at" value={form.inspected_at} onChange={set("inspected_at")} type="date" />
        <div style={{ gridColumn: "1 / -1" }}>
          <Textarea label="Issues Found" name="issues" value={form.issues} onChange={set("issues")} placeholder="List any issues, one per line…" rows={3} />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <Textarea label="Notes" name="notes" value={form.notes} onChange={set("notes")} placeholder="Any other observations…" rows={2} />
        </div>
      </div>
      <PrimaryBtn disabled={saving}>{saving ? "Saving…" : "Save Inspection →"}</PrimaryBtn>
    </form>
  );
}

// ── Step 9: Financial Setup ──────────────────────────────────────

function Step9Form({ token, onComplete }: { token: string; onComplete: () => void }) {
  const [form, setForm] = useState({ payment_method: "e-transfer", etransfer_email: "", bank_institution: "", rent_collection_confirmed: false, fee_active: false });
  const [saving, setSaving] = useState(false);
  const setStr = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }));
  const setBool = (k: keyof typeof form) => (v: boolean) => setForm((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/onboard/${token}/step/9`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...ADMIN_HEADER },
      body: JSON.stringify(form),
    });
    onComplete();
  }

  return (
    <form onSubmit={submit}>
      <Select label="Payment Method" name="payment_method" value={form.payment_method} onChange={setStr("payment_method")}
        options={[
          { value: "e-transfer", label: "e-Transfer" },
          { value: "direct deposit", label: "Direct Deposit" },
          { value: "cheque", label: "Cheque" },
        ]}
      />
      {form.payment_method === "e-transfer" && (
        <Input label="e-Transfer Email" name="etransfer_email" value={form.etransfer_email} onChange={setStr("etransfer_email")} type="email" placeholder="owner@email.com" />
      )}
      <Input label="Bank Institution" name="bank_institution" value={form.bank_institution} onChange={setStr("bank_institution")} placeholder="TD, RBC, etc." />
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
        {[
          { key: "rent_collection_confirmed" as const, label: "Rent Tracker confirmed in Notion" },
          { key: "fee_active" as const, label: "Management fee active in system" },
        ].map(({ key, label }) => (
          <label key={key} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form[key] as boolean}
              onChange={(e) => setBool(key)(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: BURGUNDY, cursor: "pointer" }}
            />
            <span style={{ fontSize: 14, color: MUTED, fontWeight: 500 }}>{label}</span>
          </label>
        ))}
      </div>
      <PrimaryBtn disabled={saving}>{saving ? "Saving…" : "Confirm Financial Setup →"}</PrimaryBtn>
    </form>
  );
}

// ── Step 10: Welcome & Handover ──────────────────────────────────

function Step10Form({ token, onComplete }: { token: string; onComplete: () => void }) {
  const [checks, setChecks] = useState({ dashboard_ready: false, welcome_email_ready: false });
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof checks) => (v: boolean) => setChecks((p) => ({ ...p, [k]: v }));
  const allDone = checks.dashboard_ready && checks.welcome_email_ready;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/onboard/${token}/step/10`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...ADMIN_HEADER },
      body: JSON.stringify(checks),
    });
    onComplete();
  }

  return (
    <form onSubmit={submit}>
      <p style={{ fontSize: 14, color: MUTED, margin: "4px 0 16px", lineHeight: 1.6 }}>
        Review everything, then activate the owner&apos;s dashboard and send the welcome email.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        {[
          { key: "dashboard_ready" as const, label: "Notion records reviewed — all data looks correct" },
          { key: "welcome_email_ready" as const, label: "Ready to send welcome email + dashboard link" },
        ].map(({ key, label }) => (
          <label key={key} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={checks[key]}
              onChange={(e) => set(key)(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: BURGUNDY, cursor: "pointer" }}
            />
            <span style={{ fontSize: 14, color: MUTED, fontWeight: 500 }}>{label}</span>
          </label>
        ))}
      </div>
      <button
        type="submit"
        disabled={saving || !allDone}
        style={{
          background: GREEN,
          color: "#fff",
          border: "none",
          borderRadius: 10,
          padding: "12px 24px",
          fontSize: 15,
          fontWeight: 700,
          cursor: (saving || !allDone) ? "not-allowed" : "pointer",
          opacity: (saving || !allDone) ? 0.45 : 1,
          fontFamily: "var(--font-poppins), -apple-system, sans-serif",
          transition: "opacity 0.2s",
        }}
      >
        {saving ? "Activating…" : "Complete Onboarding"}
      </button>
    </form>
  );
}

// ── Main page ────────────────────────────────────────────────────

export default function OnboardChecklist() {
  const params = useParams();
  const token = params.token as string;
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    const r = await fetch(`/api/onboard/${token}/status`, { headers: ADMIN_HEADER });
    if (r.ok) {
      const d = await r.json();
      setSession(d);
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
    pollRef.current = setInterval(() => { load(); }, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [load]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 30, height: 30, border: "3px solid rgba(15,28,40,0.10)", borderTopColor: BURGUNDY, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-poppins), -apple-system, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 12 }}>Session not found</p>
          <Link href="/admin/onboard" style={{ color: BURGUNDY, textDecoration: "none", fontSize: 14 }}>← Back to onboarding list</Link>
        </div>
      </div>
    );
  }

  const step = session.current_step;

  function stepStatus(n: number): "complete" | "active" | "locked" {
    if (step > n) return "complete";
    if (step === n) return "active";
    return "locked";
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: BG,
      fontFamily: "var(--font-poppins), -apple-system, sans-serif",
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.4; }
      `}</style>

      {/* Top bar */}
      <div style={{
        background: CARD,
        borderBottom: `1px solid ${CARD_BORDER}`,
        padding: "16px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 1px 3px rgba(15,28,40,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/admin/onboard" style={{ color: SUBTLE, fontSize: 13, textDecoration: "none", fontWeight: 500 }}>
            ← Onboarding
          </Link>
          <span style={{ color: CARD_BORDER, fontSize: 13 }}>·</span>
          <div>
            <span style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>
              {session.owner_name || "New Owner"}
            </span>
            {session.property_address && (
              <span style={{ fontSize: 13, color: MUTED, marginLeft: 8 }}>
                {session.property_address}
              </span>
            )}
          </div>
        </div>
        {session.status === "complete" && (
          <span style={{ fontSize: 12, fontWeight: 700, color: GREEN, background: GREEN_BG, padding: "4px 12px", borderRadius: 8 }}>
            Complete
          </span>
        )}
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "36px 20px" }}>
        <ProgressBar current={step} />

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Step 2 — auto-completed on creation */}
          <StepCard
            num={2} title="Landlord Added"
            status="complete"
            completedAt={session.step2_completed_at ?? session.created_at}
            summary={
              <div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: NAVY }}>{session.owner_name}</p>
                <p style={{ margin: "3px 0 0", fontSize: 14, color: MUTED }}>
                  {session.owner_email}{session.owner_phone ? ` · ${session.owner_phone}` : ""}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: GREEN, fontWeight: 500 }}>✓ Welcome email sent</p>
              </div>
            }
          />

          {/* Step 3 — owner signs agreement FIRST */}
          <StepCard
            num={3} title="Management Agreement"
            status={step > 3 ? "complete" : step === 3 ? "owner" : "locked"}
            completedAt={session.agreement_signed_at}
            summary={
              session.agreement_signed_at ? (
                <p style={{ margin: 0, fontSize: 14, color: MUTED }}>Signed {fmt(session.agreement_signed_at)}</p>
              ) : undefined
            }
          >
            <div>
              <p style={{ margin: "4px 0 12px", fontSize: 14, color: MUTED, lineHeight: 1.6 }}>
                Waiting for the owner to read and sign the management agreement.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a
                  href={`/onboard/${token}/agreement`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(15,28,40,0.04)", border: `1px solid ${CARD_BORDER}`, borderRadius: 10, padding: "9px 14px", fontSize: 13, color: NAVY, textDecoration: "none", fontWeight: 500 }}
                >
                  Preview →
                </a>
                <a
                  href={`/onboard/${token}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(15,28,40,0.04)", border: `1px solid ${CARD_BORDER}`, borderRadius: 10, padding: "9px 14px", fontSize: 13, color: NAVY, textDecoration: "none", fontWeight: 500 }}
                >
                  Owner portal ↗
                </a>
              </div>
            </div>
          </StepCard>

          {/* Step 4 — Ebin fills property details after agreement is signed */}
          <StepCard
            num={4} title="Property Details"
            status={stepStatus(4)}
            completedAt={session.step3_completed_at}
            summary={
              <div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: NAVY }}>
                  {session.property_address}{session.property_city ? `, ${session.property_city}` : ""}
                </p>
                <p style={{ margin: "3px 0 0", fontSize: 14, color: MUTED }}>
                  {session.property_type || "—"}
                  {session.num_units ? ` · ${session.num_units} unit${session.num_units > 1 ? "s" : ""}` : ""}
                  {session.approx_monthly_rent ? ` · $${Number(session.approx_monthly_rent).toLocaleString()}/mo` : ""}
                </p>
                {session.notion_property_id && (
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: GREEN, fontWeight: 500 }}>✓ Notion property record created · Lease upload email sent</p>
                )}
              </div>
            }
          >
            <Step3Form token={token} onComplete={load} initialAddress={session.property_address} initialType={session.property_type} />
          </StepCard>

          {/* Step 5 — owner uploads lease + details */}
          <StepCard
            num={5} title="Lease Upload & Details Form"
            status={step > 5 ? "complete" : step === 5 ? "owner" : "locked"}
            completedAt={session.step4_completed_at}
            summary={
              <div>
                {session.lease_parsed_data ? (
                  <p style={{ margin: 0, fontSize: 14, color: MUTED }}>
                    {Array.isArray(session.lease_parsed_data.tenants)
                      ? `${session.lease_parsed_data.tenants.length} tenant(s) extracted · `
                      : ""}
                    Lease parsed · Details form submitted
                  </p>
                ) : (
                  <p style={{ margin: 0, fontSize: 14, color: MUTED }}>Owner form + lease parsing complete</p>
                )}
              </div>
            }
          >
            <div>
              {session.lease_parsed_data ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: GREEN_BG, border: `1px solid rgba(10,122,82,0.20)`, borderRadius: 10 }}>
                    <span style={{ fontSize: 14, color: GREEN, fontWeight: 600 }}>✓ Lease uploaded</span>
                    <span style={{ fontSize: 13, color: MUTED }}>
                      {Array.isArray(session.lease_parsed_data.tenants)
                        ? `${session.lease_parsed_data.tenants.length} tenant(s) extracted`
                        : "parsed"}
                    </span>
                  </div>
                  <Link
                    href={`/admin/onboard/${token}/review`}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      background: "rgba(139,32,48,0.07)", border: `1px solid rgba(139,32,48,0.20)`,
                      borderRadius: 10, padding: "10px 16px", fontSize: 14, color: BURGUNDY, textDecoration: "none", fontWeight: 600,
                    }}
                  >
                    Review extracted fields →
                  </Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <p style={{ margin: "0 0 8px", fontSize: 14, color: MUTED, lineHeight: 1.6 }}>
                    Waiting for the owner to upload their lease and fill in the details form.
                  </p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <a
                      href={`/onboard/${token}/lease`}
                      target="_blank" rel="noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(15,28,40,0.04)", border: `1px solid ${CARD_BORDER}`, borderRadius: 10, padding: "9px 14px", fontSize: 13, color: NAVY, textDecoration: "none", fontWeight: 500 }}
                    >
                      Lease Upload ↗
                    </a>
                    <a
                      href={`/onboard/${token}/details`}
                      target="_blank" rel="noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(15,28,40,0.04)", border: `1px solid ${CARD_BORDER}`, borderRadius: 10, padding: "9px 14px", fontSize: 13, color: NAVY, textDecoration: "none", fontWeight: 500 }}
                    >
                      Details Form ↗
                    </a>
                  </div>
                </div>
              )}
            </div>
          </StepCard>

          {/* Step 6 — Ebin */}
          <StepCard
            num={6} title="Keys & Access"
            status={stepStatus(6)}
            completedAt={null}
            summary={<p style={{ margin: 0, fontSize: 14, color: MUTED }}>Access details recorded</p>}
          >
            <Step6Form token={token} onComplete={load} />
          </StepCard>

          {/* Step 7 — Ebin */}
          <StepCard
            num={7} title="Inspection"
            status={stepStatus(7)}
            completedAt={null}
            summary={<p style={{ margin: 0, fontSize: 14, color: MUTED }}>Inspection complete</p>}
          >
            <Step7Form token={token} onComplete={load} />
          </StepCard>

          {/* Step 8 — Auto */}
          <StepCard
            num={8} title="Tenant Notifications"
            status={stepStatus(8)}
            completedAt={session.step8_completed_at}
            summary={
              <div>
                <p style={{ margin: "0 0 2px", fontSize: 14, color: MUTED }}>Intro letters auto-sent after Step 7</p>
                {session.lease_parsed_data?.tenants && Array.isArray(session.lease_parsed_data.tenants) && (
                  <p style={{ margin: 0, fontSize: 12, color: GREEN, fontWeight: 500 }}>
                    ✓ {session.lease_parsed_data.tenants.length} tenant(s) notified
                  </p>
                )}
              </div>
            }
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0" }}>
              <div style={{ width: 18, height: 18, border: "2px solid rgba(15,28,40,0.10)", borderTopColor: BURGUNDY, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <span style={{ fontSize: 14, color: MUTED }}>Auto-firing tenant notifications…</span>
            </div>
          </StepCard>

          {/* Step 9 — Ebin */}
          <StepCard
            num={9} title="Financial Setup"
            status={stepStatus(9)}
            completedAt={null}
            summary={<p style={{ margin: 0, fontSize: 14, color: MUTED }}>Financial setup confirmed</p>}
          >
            <Step9Form token={token} onComplete={load} />
          </StepCard>

          {/* Step 10 — Ebin */}
          <StepCard
            num={10} title="Welcome & Handover"
            status={stepStatus(10)}
            completedAt={session.completed_at}
            summary={
              <div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: GREEN }}>Onboarding complete</p>
                {session.owner_access_token && (
                  <a
                    href={`/owners/${session.owner_access_token}`}
                    target="_blank" rel="noreferrer"
                    style={{ fontSize: 14, color: BURGUNDY, textDecoration: "none", display: "inline-block", marginTop: 6, fontWeight: 600 }}
                  >
                    View owner portal: /owners/{session.owner_access_token} ↗
                  </a>
                )}
              </div>
            }
          >
            <Step10Form token={token} onComplete={load} />
          </StepCard>

        </div>
      </div>
    </div>
  );
}
