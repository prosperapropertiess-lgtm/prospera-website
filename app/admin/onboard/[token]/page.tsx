"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const BG         = "#080c14";
const SURFACE    = "#0f1520";
const SURFACE_HI = "#141d2c";
const BORDER     = "rgba(255,255,255,0.07)";
const BORDER_ACT = "rgba(139,32,48,0.35)";
const TEXT       = "#EDE9E3";
const TEXT_SEC   = "rgba(237,233,227,0.5)";
const TEXT_MUT   = "rgba(237,233,227,0.25)";
const ACCENT     = "#8B2030";
const GREEN      = "#22c55e";
const AMBER      = "#f59e0b";

interface ParsedLease {
  tenants?: Array<{ name?: string; email?: string; unit?: string }>;
  monthlyRent?: number | null;
  leaseStart?: string | null;
  leaseEnd?: string | null;
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

function fmt(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric" }) +
    " · " + d.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" });
}

function Input({ label, name, value, onChange, type = "text", placeholder, required }: {
  label: string; name: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, color: TEXT_MUT, marginBottom: 5, letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {label}{required && <span style={{ color: ACCENT }}> *</span>}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          backgroundColor: "rgba(255,255,255,0.04)",
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          padding: "10px 14px",
          fontSize: 14,
          color: TEXT,
          outline: "none",
          boxSizing: "border-box",
          fontFamily: "var(--font-dm-sans, sans-serif)",
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => { e.target.style.borderColor = "rgba(139,32,48,0.5)"; }}
        onBlur={(e) => { e.target.style.borderColor = BORDER; }}
      />
    </div>
  );
}

function Select({ label, name, value, onChange, options, required }: {
  label: string; name: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; required?: boolean;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, color: TEXT_MUT, marginBottom: 5, letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {label}{required && <span style={{ color: ACCENT }}> *</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          backgroundColor: "rgba(255,255,255,0.04)",
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          padding: "10px 14px",
          fontSize: 14,
          color: value ? TEXT : TEXT_MUT,
          outline: "none",
          cursor: "pointer",
          fontFamily: "var(--font-dm-sans, sans-serif)",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ backgroundColor: SURFACE }}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Step card wrapper ────────────────────────────────────────────
function StepCard({
  num, title, status, completedAt, summary, children, isActive,
}: {
  num: number; title: string;
  status: "complete" | "active" | "locked";
  completedAt?: string | null;
  summary?: React.ReactNode;
  children?: React.ReactNode;
  isActive?: boolean;
}) {
  const icon = status === "complete" ? "✓" : status === "active" ? `${num}` : "🔒";
  const iconColor = status === "complete" ? GREEN : status === "active" ? ACCENT : TEXT_MUT;
  const iconBg = status === "complete" ? `${GREEN}20` : status === "active" ? `${ACCENT}20` : "rgba(255,255,255,0.04)";

  return (
    <div
      style={{
        backgroundColor: SURFACE,
        border: `1px solid ${isActive ? BORDER_ACT : BORDER}`,
        borderRadius: 14,
        overflow: "hidden",
        transition: "border-color 0.2s",
      }}
    >
      {/* Header row */}
      <div style={{ padding: "18px 22px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          backgroundColor: iconBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: status === "complete" ? 14 : 13,
          fontWeight: 700, color: iconColor, flexShrink: 0,
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: status === "locked" ? TEXT_MUT : TEXT }}>
            Step {num} — {title}
          </p>
          {status === "complete" && completedAt && (
            <p style={{ margin: "2px 0 0", fontSize: 12, color: TEXT_MUT }}>{fmt(completedAt)}</p>
          )}
        </div>
        {status === "complete" && (
          <div style={{ padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, color: GREEN, backgroundColor: `${GREEN}18` }}>
            Done
          </div>
        )}
      </div>

      {/* Summary line (completed steps) */}
      {status === "complete" && summary && (
        <div style={{ padding: "0 22px 16px", borderTop: `1px solid ${BORDER}` }}>
          <div style={{ paddingTop: 14 }}>{summary}</div>
        </div>
      )}

      {/* Active step form */}
      {status === "active" && children && (
        <div style={{ padding: "0 22px 22px", borderTop: `1px solid ${BORDER}` }}>
          <div style={{ paddingTop: 18 }}>{children}</div>
        </div>
      )}
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
    if (!form.owner_name.trim() || !form.owner_email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setSaving(true); setError("");
    const r = await fetch(`/api/onboard/${token}/step/2`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      {error && <p style={{ color: "#f87171", fontSize: 13, margin: "0 0 12px" }}>{error}</p>}
      <button
        type="submit"
        disabled={saving}
        style={{
          backgroundColor: ACCENT, color: "#fff", border: "none", borderRadius: 8,
          padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer",
          opacity: saving ? 0.7 : 1, letterSpacing: "-0.01em",
        }}
      >
        {saving ? "Saving…" : "Save Owner Info →"}
      </button>
    </form>
  );
}

// ── Step 3 form ──────────────────────────────────────────────────
function Step3Form({ token, onComplete }: { token: string; onComplete: () => void }) {
  const [form, setForm] = useState({
    property_address: "", property_city: "", property_type: "",
    num_units: "", approx_monthly_rent: "", fee_structure: "", fee_amount: "", property_notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.property_address.trim()) { setError("Address is required."); return; }
    setSaving(true); setError("");
    const r = await fetch(`/api/onboard/${token}/step/3`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
        <Select
          label="Property Type" name="property_type" value={form.property_type} onChange={set("property_type")}
          options={[
            { value: "", label: "Select type…" },
            { value: "Single Family", label: "Single Family" },
            { value: "Duplex", label: "Duplex" },
            { value: "Triplex", label: "Triplex" },
            { value: "Fourplex", label: "Fourplex" },
            { value: "Multi-Unit (5+)", label: "Multi-Unit (5+)" },
            { value: "Condo", label: "Condo" },
            { value: "Townhouse", label: "Townhouse" },
          ]}
        />
        <Input label="Number of Units" name="num_units" value={form.num_units} onChange={set("num_units")} type="number" placeholder="2" />
        <Input label="Approx. Monthly Rent ($)" name="approx_monthly_rent" value={form.approx_monthly_rent} onChange={set("approx_monthly_rent")} type="number" placeholder="3100" />
        <Select
          label="Fee Structure" name="fee_structure" value={form.fee_structure} onChange={set("fee_structure")}
          options={[
            { value: "", label: "Select…" },
            { value: "10% of gross", label: "10% of gross rent" },
            { value: "flat", label: "Flat monthly amount" },
            { value: "custom", label: "Custom" },
          ]}
        />
        {(form.fee_structure === "flat" || form.fee_structure === "custom") && (
          <Input label="Fee Amount ($)" name="fee_amount" value={form.fee_amount} onChange={set("fee_amount")} type="number" placeholder="300" />
        )}
        <div style={{ gridColumn: "1 / -1" }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, color: TEXT_MUT, marginBottom: 5, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Notes
            </label>
            <textarea
              value={form.property_notes}
              onChange={(e) => set("property_notes")(e.target.value)}
              placeholder="Anything else worth noting…"
              rows={2}
              style={{
                width: "100%", backgroundColor: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`,
                borderRadius: 8, padding: "10px 14px", fontSize: 14, color: TEXT,
                outline: "none", resize: "vertical", boxSizing: "border-box",
                fontFamily: "var(--font-dm-sans, sans-serif)",
              }}
              onFocus={(e) => { e.target.style.borderColor = "rgba(139,32,48,0.5)"; }}
              onBlur={(e) => { e.target.style.borderColor = BORDER; }}
            />
          </div>
        </div>
      </div>
      {error && <p style={{ color: "#f87171", fontSize: 13, margin: "0 0 12px" }}>{error}</p>}
      <button
        type="submit"
        disabled={saving}
        style={{
          backgroundColor: ACCENT, color: "#fff", border: "none", borderRadius: 8,
          padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer",
          opacity: saving ? 0.7 : 1, letterSpacing: "-0.01em",
        }}
      >
        {saving ? "Saving + Sending Email…" : "Save Property & Send Email 1 →"}
      </button>
    </form>
  );
}

// ── Progress bar ────────────────────────────────────────────────
function ProgressBar({ current }: { current: number }) {
  const total = 9; // steps 2–10
  const done = Math.max(0, current - 2);
  const pct = Math.round((done / total) * 100);
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: TEXT_MUT }}>Onboarding progress</span>
        <span style={{ fontSize: 12, color: current >= 10 ? GREEN : ACCENT, fontWeight: 600 }}>{pct}%</span>
      </div>
      <div style={{ height: 5, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          backgroundColor: current >= 10 ? GREEN : ACCENT,
          borderRadius: 3,
          transition: "width 0.6s cubic-bezier(0.23,1,0.32,1)",
        }} />
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────
export default function OnboardChecklist() {
  const params = useParams();
  const token = params.token as string;
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    const r = await fetch(`/api/onboard/${token}/status`);
    if (r.ok) {
      const d = await r.json();
      setSession(d);
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
    // Poll while in progress
    pollRef.current = setInterval(() => {
      if (session?.status === "complete") {
        if (pollRef.current) clearInterval(pollRef.current);
        return;
      }
      load();
    }, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 24, height: 24, border: `2px solid ${BORDER}`, borderTopColor: ACCENT, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: BG, color: TEXT, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 18, fontWeight: 600 }}>Session not found</p>
          <Link href="/admin/onboard" style={{ color: ACCENT, textDecoration: "none", fontSize: 14 }}>← Back to onboarding list</Link>
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
    <div style={{ minHeight: "100vh", backgroundColor: BG, color: TEXT, fontFamily: "var(--font-dm-sans, sans-serif)" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        * { box-sizing: border-box; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.4; }
        select option { background: #0f1520; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${BORDER}`, padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/admin/onboard" style={{ color: TEXT_MUT, fontSize: 13, textDecoration: "none" }}>← Onboarding</Link>
          <span style={{ color: BORDER, fontSize: 13 }}>·</span>
          <div>
            <span style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>
              {session.owner_name || "New Owner"}
            </span>
            {session.property_address && (
              <span style={{ fontSize: 13, color: TEXT_SEC, marginLeft: 8 }}>
                {session.property_address}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {session.status === "complete" && (
            <span style={{ padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, color: GREEN, backgroundColor: `${GREEN}18` }}>
              Complete
            </span>
          )}
          <span style={{ fontSize: 12, color: TEXT_MUT }}>
            {new Date(session.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "36px 24px" }}>
        <ProgressBar current={step} />

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Step 2 */}
          <StepCard
            num={2} title="Owner Basic Info"
            status={stepStatus(2)}
            completedAt={session.step2_completed_at}
            isActive={step === 2}
            summary={
              <div>
                <p style={{ margin: 0, fontSize: 14, color: TEXT }}>{session.owner_name}</p>
                <p style={{ margin: "3px 0 0", fontSize: 13, color: TEXT_SEC }}>
                  {session.owner_email}
                  {session.owner_phone ? ` · ${session.owner_phone}` : ""}
                </p>
                {session.notion_owner_id && (
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: TEXT_MUT }}>
                    ✓ Notion owner record created
                  </p>
                )}
              </div>
            }
          >
            <Step2Form token={token} onComplete={load} />
          </StepCard>

          {/* Step 3 */}
          <StepCard
            num={3} title="Property Details"
            status={stepStatus(3)}
            completedAt={session.step3_completed_at}
            isActive={step === 3}
            summary={
              <div>
                <p style={{ margin: 0, fontSize: 14, color: TEXT }}>
                  {session.property_address}{session.property_city ? `, ${session.property_city}` : ""}
                </p>
                <p style={{ margin: "3px 0 0", fontSize: 13, color: TEXT_SEC }}>
                  {session.property_type || "—"}
                  {session.num_units ? ` · ${session.num_units} unit${session.num_units > 1 ? "s" : ""}` : ""}
                  {session.approx_monthly_rent ? ` · $${Number(session.approx_monthly_rent).toLocaleString()}/mo` : ""}
                </p>
                {session.notion_property_id && (
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: TEXT_MUT }}>
                    ✓ Notion property record created · 📧 Email 1 sent to owner
                  </p>
                )}
              </div>
            }
          >
            <Step3Form token={token} onComplete={load} />
          </StepCard>

          {/* Step 4 — owner action */}
          <StepCard
            num={4} title="Lease Upload & Details Form"
            status={stepStatus(4)}
            completedAt={session.step4_completed_at}
            isActive={step === 4}
            summary={
              <div>
                {session.lease_parsed_data ? (
                  <>
                    <p style={{ margin: "0 0 4px", fontSize: 13, color: TEXT_SEC }}>
                      {Array.isArray(session.lease_parsed_data.tenants)
                        ? `${session.lease_parsed_data.tenants.length} tenant${session.lease_parsed_data.tenants.length !== 1 ? "s" : ""} · `
                        : ""}
                      {session.lease_parsed_data.monthlyRent
                        ? `$${Number(session.lease_parsed_data.monthlyRent).toLocaleString()}/mo · `
                        : ""}
                      lease parsed
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: TEXT_MUT }}>
                      ✓ Details form submitted · Notion tenants + rent tracker created
                    </p>
                  </>
                ) : (
                  <p style={{ margin: 0, fontSize: 13, color: TEXT_SEC }}>
                    Owner form + lease parsing complete
                  </p>
                )}
              </div>
            }
          >
            <div style={{ padding: "4px 0 8px" }}>
              {session.lease_parsed_data ? (
                <>
                  {/* Lease uploaded, awaiting details form */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10, marginBottom: 14,
                    padding: "10px 14px", backgroundColor: "rgba(34,197,94,0.06)",
                    border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8,
                  }}>
                    <span style={{ fontSize: 13, color: GREEN }}>✓ Lease uploaded</span>
                    <span style={{ fontSize: 12, color: TEXT_MUT }}>
                      {Array.isArray(session.lease_parsed_data.tenants)
                        ? `${session.lease_parsed_data.tenants.length} tenant${session.lease_parsed_data.tenants.length !== 1 ? "s" : ""} extracted`
                        : "parsed"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <Link
                      href={`/admin/onboard/${token}/review`}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        backgroundColor: `${ACCENT}18`, border: `1px solid ${ACCENT}40`,
                        borderRadius: 8, padding: "8px 14px", fontSize: 13, color: ACCENT, textDecoration: "none",
                        fontWeight: 600,
                      }}
                    >
                      Review extracted fields →
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p style={{ margin: "0 0 10px", fontSize: 14, color: TEXT_SEC, lineHeight: 1.6 }}>
                    Waiting for the owner to upload their lease and fill in the details form.
                  </p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <a
                      href={`/onboard/${token}/lease`}
                      target="_blank" rel="noreferrer"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        backgroundColor: "rgba(255,255,255,0.06)", border: `1px solid ${BORDER}`,
                        borderRadius: 8, padding: "8px 14px", fontSize: 13, color: TEXT, textDecoration: "none",
                      }}
                    >
                      Preview lease upload page ↗
                    </a>
                    <a
                      href={`/onboard/${token}/details`}
                      target="_blank" rel="noreferrer"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        backgroundColor: "rgba(255,255,255,0.06)", border: `1px solid ${BORDER}`,
                        borderRadius: 8, padding: "8px 14px", fontSize: 13, color: TEXT, textDecoration: "none",
                      }}
                    >
                      Preview details form ↗
                    </a>
                  </div>
                </>
              )}
            </div>
          </StepCard>

          {/* Step 5 — owner action */}
          <StepCard
            num={5} title="Management Agreement"
            status={stepStatus(5)}
            completedAt={session.agreement_signed_at}
            isActive={step === 5}
            summary={
              session.agreement_signed_at ? (
                <p style={{ margin: 0, fontSize: 13, color: TEXT_SEC }}>
                  Signed at {fmt(session.agreement_signed_at)}
                </p>
              ) : undefined
            }
          >
            <p style={{ margin: "4px 0 10px", fontSize: 14, color: TEXT_SEC }}>
              Waiting for owner to read and sign the management agreement.
            </p>
            <a
              href={`/onboard/${token}/agreement`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                backgroundColor: "rgba(255,255,255,0.06)", border: `1px solid ${BORDER}`,
                borderRadius: 8, padding: "8px 14px", fontSize: 13, color: TEXT, textDecoration: "none",
              }}
            >
              Preview agreement page ↗
            </a>
          </StepCard>

          {/* Step 6 — Ebin */}
          <StepCard
            num={6} title="Keys & Access"
            status={stepStatus(6)}
            completedAt={session.step6_data?._completed_at as string ?? null}
            isActive={step === 6}
            summary={
              <p style={{ margin: 0, fontSize: 13, color: TEXT_SEC }}>
                Access details recorded
              </p>
            }
          >
            <Step6Form token={token} onComplete={load} />
          </StepCard>

          {/* Step 7 — Ebin */}
          <StepCard
            num={7} title="Photos & Inspection"
            status={stepStatus(7)}
            completedAt={session.step8_completed_at}
            isActive={step === 7}
            summary={
              <p style={{ margin: 0, fontSize: 13, color: TEXT_SEC }}>
                Inspection complete
              </p>
            }
          >
            <Step7Form token={token} onComplete={load} />
          </StepCard>

          {/* Step 8 — Auto */}
          <StepCard
            num={8} title="Tenant Notifications"
            status={stepStatus(8)}
            completedAt={session.step8_completed_at}
            isActive={step === 8}
            summary={
              <div>
                <p style={{ margin: "0 0 2px", fontSize: 13, color: TEXT_SEC }}>
                  Intro letters sent automatically — auto-fired after Step 7
                </p>
                {session.lease_parsed_data?.tenants && (
                  <p style={{ margin: 0, fontSize: 12, color: TEXT_MUT }}>
                    {Array.isArray(session.lease_parsed_data.tenants)
                      ? `${session.lease_parsed_data.tenants.length} tenant${session.lease_parsed_data.tenants.length !== 1 ? "s" : ""} notified`
                      : "Tenants notified"}
                  </p>
                )}
              </div>
            }
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0" }}>
              <div style={{ width: 18, height: 18, border: `2px solid ${BORDER}`, borderTopColor: ACCENT, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <span style={{ fontSize: 14, color: TEXT_SEC }}>Auto-firing tenant notifications…</span>
            </div>
          </StepCard>

          {/* Step 9 — Ebin */}
          <StepCard
            num={9} title="Financial Setup"
            status={stepStatus(9)}
            completedAt={session.step9_data ? new Date().toISOString() : null}
            isActive={step === 9}
            summary={
              <p style={{ margin: 0, fontSize: 13, color: TEXT_SEC }}>
                Financial setup confirmed
              </p>
            }
          >
            <Step9Form token={token} onComplete={load} />
          </StepCard>

          {/* Step 10 — Ebin */}
          <StepCard
            num={10} title="Welcome & Handover"
            status={stepStatus(10)}
            completedAt={session.completed_at}
            isActive={step === 10}
            summary={
              <div>
                <p style={{ margin: 0, fontSize: 14, color: GREEN, fontWeight: 600 }}>
                  🎉 Onboarding complete
                </p>
                {session.owner_access_token && (
                  <a
                    href={`/owners/${session.owner_access_token}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 13, color: ACCENT, textDecoration: "none", display: "inline-block", marginTop: 4 }}
                  >
                    View owner dashboard ↗
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

// ── Step 6: Keys & Access ────────────────────────────────────────
function Step6Form({ token, onComplete }: { token: string; onComplete: () => void }) {
  const [form, setForm] = useState({ num_keys: "", front_door_code: "", garage_code: "", mailbox_notes: "", alarm_code: "", repair_limit: "200" });
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/onboard/${token}/step/6`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    onComplete();
  }

  return (
    <form onSubmit={submit}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <Input label="Number of Keys" name="num_keys" value={form.num_keys} onChange={set("num_keys")} type="number" placeholder="2" />
        <Input label="Repair Limit (no approval, $)" name="repair_limit" value={form.repair_limit} onChange={set("repair_limit")} type="number" placeholder="200" />
        <Input label="Front Door Code" name="front_door_code" value={form.front_door_code} onChange={set("front_door_code")} placeholder="Optional" />
        <Input label="Garage Code" name="garage_code" value={form.garage_code} onChange={set("garage_code")} placeholder="Optional" />
        <Input label="Alarm Code" name="alarm_code" value={form.alarm_code} onChange={set("alarm_code")} placeholder="Optional" />
        <Input label="Mailbox Notes" name="mailbox_notes" value={form.mailbox_notes} onChange={set("mailbox_notes")} placeholder="Key in lockbox at door" />
      </div>
      <button type="submit" disabled={saving} style={{ backgroundColor: ACCENT, color: "#fff", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
        {saving ? "Saving…" : "Save Keys & Access →"}
      </button>
    </form>
  );
}

// ── Step 7: Inspection ───────────────────────────────────────────
function Step7Form({ token, onComplete }: { token: string; onComplete: () => void }) {
  const [form, setForm] = useState({ overall_condition: "", issues: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/onboard/${token}/step/7`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, inspected_at: new Date().toISOString() }),
    });
    onComplete();
  }

  return (
    <form onSubmit={submit}>
      <Select label="Overall Condition" name="overall_condition" value={form.overall_condition} onChange={set("overall_condition")}
        options={[
          { value: "", label: "Select…" },
          { value: "Excellent", label: "Excellent" },
          { value: "Good", label: "Good" },
          { value: "Fair", label: "Fair" },
          { value: "Needs Work", label: "Needs Work" },
        ]}
      />
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: "block", fontSize: 12, color: TEXT_MUT, marginBottom: 5, letterSpacing: "0.05em", textTransform: "uppercase" }}>Issues Found</label>
        <textarea value={form.issues} onChange={(e) => set("issues")(e.target.value)} placeholder="List any issues, one per line…" rows={3}
          style={{ width: "100%", backgroundColor: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px", fontSize: 14, color: TEXT, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "var(--font-dm-sans, sans-serif)" }}
          onFocus={(e) => { e.target.style.borderColor = "rgba(139,32,48,0.5)"; }}
          onBlur={(e) => { e.target.style.borderColor = BORDER; }}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, color: TEXT_MUT, marginBottom: 5, letterSpacing: "0.05em", textTransform: "uppercase" }}>Notes</label>
        <textarea value={form.notes} onChange={(e) => set("notes")(e.target.value)} placeholder="Any other observations…" rows={2}
          style={{ width: "100%", backgroundColor: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px", fontSize: 14, color: TEXT, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "var(--font-dm-sans, sans-serif)" }}
          onFocus={(e) => { e.target.style.borderColor = "rgba(139,32,48,0.5)"; }}
          onBlur={(e) => { e.target.style.borderColor = BORDER; }}
        />
      </div>
      <button type="submit" disabled={saving} style={{ backgroundColor: ACCENT, color: "#fff", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
        {saving ? "Saving…" : "Save Inspection →"}
      </button>
    </form>
  );
}

// ── Step 9: Financial Setup ──────────────────────────────────────
function Step9Form({ token, onComplete }: { token: string; onComplete: () => void }) {
  const [form, setForm] = useState({ bank_institution: "", etransfer_email: "", payment_method: "e-transfer", rent_collection_confirmed: false, fee_active: false });
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form) => (v: string | boolean) => setForm((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/onboard/${token}/step/9`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    onComplete();
  }

  return (
    <form onSubmit={submit}>
      <Select label="Payment Method" name="payment_method" value={form.payment_method} onChange={set("payment_method")}
        options={[
          { value: "e-transfer", label: "e-Transfer" },
          { value: "direct deposit", label: "Direct Deposit" },
          { value: "cheque", label: "Cheque" },
        ]}
      />
      {form.payment_method === "e-transfer" && (
        <Input label="e-Transfer Email" name="etransfer_email" value={form.etransfer_email} onChange={set("etransfer_email") as (v: string) => void} type="email" placeholder="owner@email.com" />
      )}
      <Input label="Bank Institution" name="bank_institution" value={form.bank_institution} onChange={set("bank_institution") as (v: string) => void} placeholder="TD, RBC, etc." />
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {[
          { key: "rent_collection_confirmed", label: "Rent Tracker confirmed in Notion" },
          { key: "fee_active", label: "Management fee active in system" },
        ].map(({ key, label }) => (
          <label key={key} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form[key as keyof typeof form] as boolean}
              onChange={(e) => set(key as keyof typeof form)(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: ACCENT, cursor: "pointer" }}
            />
            <span style={{ fontSize: 14, color: TEXT_SEC }}>{label}</span>
          </label>
        ))}
      </div>
      <button type="submit" disabled={saving} style={{ backgroundColor: ACCENT, color: "#fff", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
        {saving ? "Saving…" : "Confirm Financial Setup →"}
      </button>
    </form>
  );
}

// ── Step 10: Welcome & Handover ──────────────────────────────────
function Step10Form({ token, onComplete }: { token: string; onComplete: () => void }) {
  const [saving, setSaving] = useState(false);
  const [checks, setChecks] = useState({ dashboard_ready: false, welcome_email_ready: false });
  const set = (k: keyof typeof checks) => (v: boolean) => setChecks((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/onboard/${token}/step/10`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(checks),
    });
    onComplete();
  }

  return (
    <form onSubmit={submit}>
      <p style={{ fontSize: 14, color: TEXT_SEC, margin: "4px 0 14px", lineHeight: 1.6 }}>
        Review everything, then activate the owner&apos;s dashboard and send the welcome email.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {[
          { key: "dashboard_ready", label: "Notion records reviewed — all data looks correct" },
          { key: "welcome_email_ready", label: "Ready to send welcome email + dashboard link" },
        ].map(({ key, label }) => (
          <label key={key} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={checks[key as keyof typeof checks]}
              onChange={(e) => set(key as keyof typeof checks)(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: ACCENT, cursor: "pointer" }}
            />
            <span style={{ fontSize: 14, color: TEXT_SEC }}>{label}</span>
          </label>
        ))}
      </div>
      <button
        type="submit"
        disabled={saving || !checks.dashboard_ready || !checks.welcome_email_ready}
        style={{
          backgroundColor: GREEN, color: "#fff", border: "none", borderRadius: 8,
          padding: "11px 24px", fontSize: 14, fontWeight: 600,
          cursor: (saving || !checks.dashboard_ready || !checks.welcome_email_ready) ? "not-allowed" : "pointer",
          opacity: (saving || !checks.dashboard_ready || !checks.welcome_email_ready) ? 0.5 : 1,
          transition: "opacity 0.2s",
        }}
      >
        {saving ? "Activating…" : "🎉 Complete Onboarding"}
      </button>
    </form>
  );
}
