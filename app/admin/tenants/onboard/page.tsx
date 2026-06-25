"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
const INPUT_BORDER = "rgba(15,28,40,0.12)";
const FONT        = "var(--font-dm-sans), -apple-system, sans-serif";

const ADMIN_HEADER = { "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "" };

// Boolean fields used for progress calculation
const BOOL_FIELDS = [
  "application_approved","credit_check_done","references_checked","lease_prepared",
  "tenant_signed_at","owner_signed_at","first_month_collected","last_month_collected",
  "security_deposit_collected","post_dated_cheques",
  "inspection_done","inspection_signed_at","keys_handed","mailbox_key","welcome_package",
  "notion_tenant_id","rent_tracker_created","portal_token",
  "welcome_email_sent_at","checkin_scheduled",
] as const;

interface TenantSession {
  id: string;
  tenant_name: string;
  tenant_email: string | null;
  property_address: string;
  unit: string | null;
  move_in_date: string | null;
  lease_start: string;
  lease_end: string | null;
  monthly_rent: number | null;
  status: string;
  created_at: string;
  [key: string]: unknown;
}

function calcProgress(s: TenantSession): number {
  const done = BOOL_FIELDS.filter(f => !!s[f]).length;
  return Math.round((done / BOOL_FIELDS.length) * 100);
}

function fmtDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function statusStyle(status: string) {
  if (status === "complete")    return { border: GREEN,  badge: GREEN,  badgeBg: GREEN_BG,  label: "Complete"    };
  if (status === "in_progress") return { border: AMBER,  badge: AMBER,  badgeBg: AMBER_BG,  label: "In Progress" };
  return                               { border: AMBER,  badge: AMBER,  badgeBg: AMBER_BG,  label: "In Progress" };
}

function SkeletonCard() {
  return (
    <div style={{
      background: CARD, border: `1px solid ${CARD_BORDER}`, boxShadow: CARD_SHADOW,
      borderRadius: 16, padding: "22px 24px", borderLeft: `3px solid ${CARD_BORDER}`,
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ height: 16, width: "40%", borderRadius: 8, background: "rgba(15,28,40,0.07)", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ height: 13, width: "60%", borderRadius: 8, background: "rgba(15,28,40,0.05)", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ height: 6, borderRadius: 4, background: "rgba(15,28,40,0.05)", marginTop: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
      </div>
    </div>
  );
}

function InputField({
  label, value, onChange, type = "text", placeholder, required,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label style={{
        display: "block", fontSize: 12, fontWeight: 600, color: SUBTLE,
        textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6, fontFamily: FONT,
      }}>
        {label}{required && <span style={{ color: BURGUNDY }}> *</span>}
      </label>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{
          width: "100%", background: CARD, border: `1px solid ${INPUT_BORDER}`,
          borderRadius: 10, padding: "10px 14px", fontSize: 15, color: NAVY,
          fontFamily: FONT, outline: "none", boxSizing: "border-box", transition: "border-color 0.15s",
        }}
        onFocus={e => { e.target.style.borderColor = "rgba(139,32,48,0.40)"; }}
        onBlur={e => { e.target.style.borderColor = INPUT_BORDER; }}
      />
    </div>
  );
}

export default function TenantOnboardListPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<TenantSession[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState("");

  const [tenantName,       setTenantName]       = useState("");
  const [tenantEmail,      setTenantEmail]       = useState("");
  const [tenantPhone,      setTenantPhone]       = useState("");
  const [propertyAddress,  setPropertyAddress]   = useState("");
  const [unit,             setUnit]              = useState("");
  const [moveInDate,       setMoveInDate]        = useState("");
  const [leaseStart,       setLeaseStart]        = useState("");
  const [leaseEnd,         setLeaseEnd]          = useState("");
  const [monthlyRent,      setMonthlyRent]       = useState("");

  useEffect(() => {
    fetch("/api/admin/tenant-onboard", { headers: ADMIN_HEADER })
      .then(r => r.json())
      .then(d => { setSessions(d.sessions ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function resetForm() {
    setTenantName(""); setTenantEmail(""); setTenantPhone("");
    setPropertyAddress(""); setUnit(""); setMoveInDate("");
    setLeaseStart(""); setLeaseEnd(""); setMonthlyRent("");
    setFormError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantName.trim() || !propertyAddress.trim() || !leaseStart) {
      setFormError("Tenant name, property address, and lease start are required.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const r = await fetch("/api/admin/tenant-onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...ADMIN_HEADER },
        body: JSON.stringify({
          tenant_name:     tenantName.trim(),
          tenant_email:    tenantEmail.trim() || undefined,
          tenant_phone:    tenantPhone.trim() || undefined,
          property_address: propertyAddress.trim(),
          unit:            unit.trim() || undefined,
          move_in_date:    moveInDate || undefined,
          lease_start:     leaseStart,
          lease_end:       leaseEnd || undefined,
          monthly_rent:    monthlyRent ? parseFloat(monthlyRent) : undefined,
        }),
      });
      const d = await r.json();
      if (!r.ok) { setFormError(d.error ?? "Something went wrong."); setSubmitting(false); return; }
      router.push(`/admin/tenants/onboard/${d.id}`);
    } catch {
      setFormError("Network error. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 20px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: NAVY, letterSpacing: "-0.02em" }}>
              Tenant Onboarding
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: MUTED }}>
              Track each tenant&apos;s move-in checklist
            </p>
          </div>
          <button
            onClick={() => { setShowForm(f => !f); resetForm(); }}
            style={{
              background: showForm ? "rgba(15,28,40,0.07)" : BURGUNDY,
              color: showForm ? NAVY : "#fff",
              border: "none", borderRadius: 10, padding: "12px 22px",
              fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT,
              transition: "all 0.15s",
            }}
          >
            {showForm ? "Cancel" : "+ New Tenant"}
          </button>
        </div>

        {/* Inline form */}
        {showForm && (
          <div style={{
            background: CARD, border: `1px solid ${CARD_BORDER}`, borderTop: `3px solid ${BURGUNDY}`,
            borderRadius: 20, boxShadow: CARD_SHADOW, padding: "28px 28px 24px",
            marginBottom: 24, animation: "slideDown 0.2s ease",
          }}>
            <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700, color: NAVY }}>
              New Tenant Onboarding
            </h2>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: MUTED }}>
              Fill in the basics to start the checklist.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", marginBottom: 20 }}>
                <InputField label="Tenant Name"      value={tenantName}      onChange={setTenantName}      placeholder="Jane Smith"           required />
                <InputField label="Email"            value={tenantEmail}     onChange={setTenantEmail}     type="email" placeholder="jane@email.com" />
                <InputField label="Phone"            value={tenantPhone}     onChange={setTenantPhone}     placeholder="(519) 555-0100" />
                <InputField label="Monthly Rent"     value={monthlyRent}     onChange={setMonthlyRent}     type="number" placeholder="1800" />
                <div style={{ gridColumn: "1 / -1" }}>
                  <InputField label="Property Address" value={propertyAddress} onChange={setPropertyAddress} placeholder="27 Horton Street, St. Thomas" required />
                </div>
                <InputField label="Unit"             value={unit}            onChange={setUnit}            placeholder="Apt 2" />
                <InputField label="Move-In Date"     value={moveInDate}      onChange={setMoveInDate}      type="date" />
                <InputField label="Lease Start"      value={leaseStart}      onChange={setLeaseStart}      type="date" required />
                <InputField label="Lease End"        value={leaseEnd}        onChange={setLeaseEnd}        type="date" />
              </div>

              {formError && (
                <p style={{ margin: "0 0 16px", fontSize: 14, color: "#B91C1C", fontWeight: 500 }}>{formError}</p>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: BURGUNDY, color: "#fff", border: "none",
                    borderRadius: 10, padding: "12px 28px",
                    fontSize: 15, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer",
                    opacity: submitting ? 0.5 : 1, fontFamily: FONT, transition: "opacity 0.15s",
                  }}
                >
                  {submitting ? "Creating…" : "Start Onboarding"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Session list */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : sessions.length === 0 && !showForm ? (
          <div style={{
            background: CARD, border: `1px solid ${CARD_BORDER}`, boxShadow: CARD_SHADOW,
            borderRadius: 20, padding: "60px 32px", textAlign: "center",
          }}>
            <p style={{ fontSize: 40, margin: "0 0 12px" }}>🏠</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: "0 0 6px" }}>No onboardings yet</p>
            <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>Click &quot;+ New Tenant&quot; to get started.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sessions.map(s => {
              const st      = statusStyle(s.status);
              const pct     = calcProgress(s);
              const moveIn  = fmtDate(s.move_in_date);
              const address = s.unit ? `${s.property_address} — Unit ${s.unit}` : s.property_address;
              return (
                <div
                  key={s.id}
                  onClick={() => router.push(`/admin/tenants/onboard/${s.id}`)}
                  style={{
                    background: CARD, border: `1px solid ${CARD_BORDER}`,
                    borderLeft: `3px solid ${st.border}`, boxShadow: CARD_SHADOW,
                    borderRadius: 16, padding: "20px 24px", cursor: "pointer",
                    transition: "box-shadow 0.15s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(15,28,40,0.08), 0 12px 32px rgba(15,28,40,0.12)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = CARD_SHADOW; }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: NAVY }}>{s.tenant_name}</p>
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: st.badge,
                          background: st.badgeBg, padding: "2px 8px", borderRadius: 6,
                        }}>
                          {st.label}
                        </span>
                      </div>
                      <p style={{ margin: "0 0 2px", fontSize: 14, color: MUTED }}>{address}</p>
                      {moveIn && (
                        <p style={{ margin: "0 0 10px", fontSize: 13, color: SUBTLE }}>Move-in: {moveIn}</p>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: moveIn ? 0 : 10 }}>
                        <span style={{ fontSize: 12, color: SUBTLE, flexShrink: 0 }}>{pct}%</span>
                        <div style={{ flex: 1, height: 4, background: "rgba(15,28,40,0.08)", borderRadius: 3 }}>
                          <div style={{
                            height: "100%", width: `${pct}%`,
                            background: s.status === "complete" ? GREEN : BURGUNDY,
                            borderRadius: 3, transition: "width 0.3s",
                          }} />
                        </div>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: SUBTLE, flexShrink: 0 }}>{timeAgo(s.created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
