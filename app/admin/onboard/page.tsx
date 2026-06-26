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
const RED         = "#B91C1C";
const RED_BG      = "rgba(185,28,28,0.08)";
const INPUT_BORDER = "rgba(15,28,40,0.12)";

interface Session {
  id: string;
  token: string;
  current_step: number;
  status: string;
  service_type: string;
  owner_name: string | null;
  owner_email: string | null;
  property_address: string | null;
  created_at: string;
  placement_completed_at: string | null;
  completed_at: string | null;
}

const PROPERTY_TYPES = ["House", "Duplex", "Triplex", "Condo", "Other"];

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
  return                               { border: RED,    badge: RED,    badgeBg: RED_BG,    label: "New"         };
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
  label, value, onChange, type = "text", placeholder, required, as,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean; as?: "select";
}) {
  const inputStyle: React.CSSProperties = {
    width: "100%", background: CARD, border: `1px solid ${INPUT_BORDER}`,
    borderRadius: 10, padding: "10px 14px", fontSize: 15, color: NAVY,
    fontFamily: "var(--font-poppins), -apple-system, sans-serif",
    outline: "none", boxSizing: "border-box", transition: "border-color 0.15s",
  };

  return (
    <div>
      <label style={{
        display: "block", fontSize: 12, fontWeight: 600, color: SUBTLE,
        textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6,
        fontFamily: "var(--font-poppins), -apple-system, sans-serif",
      }}>
        {label}{required && <span style={{ color: BURGUNDY }}> *</span>}
      </label>
      {as === "select" ? (
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={inputStyle}
          onFocus={e => { e.target.style.borderColor = "rgba(139,32,48,0.40)"; }}
          onBlur={e => { e.target.style.borderColor = INPUT_BORDER; }}
        >
          <option value="">Select type…</option>
          {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      ) : (
        <input
          type={type} value={value} placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          style={inputStyle}
          onFocus={e => { e.target.style.borderColor = "rgba(139,32,48,0.40)"; }}
          onBlur={e => { e.target.style.borderColor = INPUT_BORDER; }}
        />
      )}
    </div>
  );
}

export default function OnboardListPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState("");
  const [deleting, setDeleting]     = useState<string | null>(null);

  const [ownerName,        setOwnerName]        = useState("");
  const [ownerEmail,       setOwnerEmail]        = useState("");
  const [ownerPhone,       setOwnerPhone]        = useState("");
  const [propertyAddress,  setPropertyAddress]   = useState("");
  const [propertyType,     setPropertyType]      = useState("");
  const [serviceType,      setServiceType]       = useState<"placement" | "management">("placement");

  useEffect(() => {
    fetch("/api/onboard/list", {
      headers: { "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "" },
    })
      .then(r => r.json())
      .then(d => { setSessions(d.sessions ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function resetForm() {
    setOwnerName(""); setOwnerEmail(""); setOwnerPhone("");
    setPropertyAddress(""); setPropertyType("");
    setServiceType("placement"); setFormError("");
  }

  async function handleDelete(token: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this onboarding session? This cannot be undone.")) return;
    setDeleting(token);
    try {
      await fetch(`/api/onboard/${token}/delete`, {
        method: "DELETE",
        headers: { "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "" },
      });
      setSessions(prev => prev.filter(s => s.token !== token));
    } finally {
      setDeleting(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ownerName.trim() || !ownerEmail.trim() || !propertyAddress.trim()) {
      setFormError("Name, email and property address are required.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const r = await fetch("/api/onboard/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "",
        },
        body: JSON.stringify({
          owner_name: ownerName.trim(),
          owner_email: ownerEmail.trim(),
          owner_phone: ownerPhone.trim() || undefined,
          property_address: propertyAddress.trim(),
          property_type: propertyType || undefined,
          service_type: serviceType,
        }),
      });
      const d = await r.json();
      if (!r.ok) { setFormError(d.error ?? "Something went wrong."); setSubmitting(false); return; }
      router.push(`/admin/onboard/${d.token}`);
    } catch {
      setFormError("Network error. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: BG,
      fontFamily: "var(--font-poppins), -apple-system, sans-serif",
    }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 28px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: NAVY, letterSpacing: "-0.02em" }}>
              Onboarding
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: MUTED }}>
              {sessions.length > 0 ? `${sessions.length} session${sessions.length > 1 ? "s" : ""}` : "No sessions yet"}
            </p>
          </div>
          <button
            onClick={() => { setShowForm(f => !f); resetForm(); }}
            style={{
              background: showForm ? "rgba(15,28,40,0.07)" : BURGUNDY,
              color: showForm ? NAVY : "#fff",
              border: "none", borderRadius: 10, padding: "12px 22px",
              fontSize: 15, fontWeight: 700, cursor: "pointer",
              fontFamily: "var(--font-poppins), -apple-system, sans-serif",
              transition: "all 0.15s",
            }}
          >
            {showForm ? "Cancel" : "+ Add Landlord"}
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
              Add New Landlord
            </h2>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: MUTED }}>
              A welcome email with their onboarding link will be sent immediately.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", marginBottom: 20 }}>
                <InputField label="Owner Name"       value={ownerName}       onChange={setOwnerName}       placeholder="Jane Smith"          required />
                <InputField label="Email"            value={ownerEmail}      onChange={setOwnerEmail}      type="email" placeholder="jane@email.com" required />
                <InputField label="Phone"            value={ownerPhone}      onChange={setOwnerPhone}      placeholder="(519) 555-0100" />
                <InputField label="Property Type"    value={propertyType}    onChange={setPropertyType}    as="select" />
                <div style={{ gridColumn: "1 / -1" }}>
                  <InputField label="Property Address" value={propertyAddress} onChange={setPropertyAddress} placeholder="27 Horton Street, St. Thomas" required />
                </div>
              </div>

              {/* Service type selector */}
              <div style={{ marginBottom: 20 }}>
                <p style={{
                  fontSize: 12, fontWeight: 600, color: SUBTLE, textTransform: "uppercase",
                  letterSpacing: "0.07em", marginBottom: 10,
                  fontFamily: "var(--font-poppins), -apple-system, sans-serif",
                }}>Service</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {(["placement", "management"] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setServiceType(type)}
                      style={{
                        padding: "14px 16px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                        border: `2px solid ${serviceType === type ? BURGUNDY : CARD_BORDER}`,
                        background: serviceType === type ? "rgba(139,32,48,0.04)" : CARD,
                        transition: "all 0.15s", fontFamily: "var(--font-poppins), -apple-system, sans-serif",
                      }}
                    >
                      <p style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700, color: serviceType === type ? BURGUNDY : NAVY }}>
                        {type === "placement" ? "Tenant Placement" : "Placement + Management"}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: MUTED }}>
                        {type === "placement"
                          ? "Find & place a tenant. One-time fee."
                          : "Place a tenant then manage ongoing."}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {formError && (
                <p style={{ margin: "0 0 16px", fontSize: 14, color: RED, fontWeight: 500 }}>{formError}</p>
              )}

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ margin: 0, fontSize: 13, color: SUBTLE }}>
                  ✉️ Welcome email fires on submit
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: BURGUNDY, color: "#fff", border: "none",
                    borderRadius: 10, padding: "12px 28px",
                    fontSize: 15, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer",
                    opacity: submitting ? 0.5 : 1,
                    fontFamily: "var(--font-poppins), -apple-system, sans-serif",
                    transition: "opacity 0.15s",
                  }}
                >
                  {submitting ? "Adding…" : "Add Landlord & Send Welcome Email"}
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
            <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>Click "+ Add Landlord" to get started.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sessions.map(s => {
              const st = statusStyle(s.status);
              const progress = Math.max(0, Math.min(100, ((s.current_step - 2) / 8) * 100));
              return (
                <div
                  key={s.token}
                  onClick={() => router.push(`/admin/onboard/${s.token}`)}
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
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: NAVY }}>
                          {s.owner_name ?? "Unnamed"}
                        </p>
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: st.badge,
                          background: st.badgeBg, padding: "2px 8px", borderRadius: 6,
                        }}>
                          {st.label}
                        </span>
                        <span style={{
                          fontSize: 11, fontWeight: 600, color: SUBTLE,
                          background: "rgba(15,28,40,0.06)", padding: "2px 8px", borderRadius: 6,
                        }}>
                          {s.service_type === "management" ? "Placement + Mgmt" : "Placement only"}
                        </span>
                      </div>
                      {s.owner_email && <p style={{ margin: "0 0 2px", fontSize: 14, color: MUTED }}>{s.owner_email}</p>}
                      {s.property_address && <p style={{ margin: "0 0 10px", fontSize: 14, color: MUTED }}>{s.property_address}</p>}
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 12, color: SUBTLE, flexShrink: 0 }}>Step {s.current_step} of 10</span>
                        <div style={{ flex: 1, height: 4, background: "rgba(15,28,40,0.08)", borderRadius: 3 }}>
                          <div style={{
                            height: "100%", width: `${progress}%`,
                            background: s.status === "complete" ? GREEN : BURGUNDY,
                            borderRadius: 3, transition: "width 0.3s",
                          }} />
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                      <p style={{ margin: 0, fontSize: 12, color: SUBTLE }}>{timeAgo(s.created_at)}</p>
                      <button
                        onClick={e => handleDelete(s.token, e)}
                        disabled={deleting === s.token}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: deleting === s.token ? SUBTLE : RED,
                          fontSize: 13, fontWeight: 600, padding: "2px 6px",
                          borderRadius: 6, opacity: deleting === s.token ? 0.5 : 1,
                          fontFamily: "var(--font-poppins), -apple-system, sans-serif",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = RED_BG; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
                      >
                        {deleting === s.token ? "…" : "Delete"}
                      </button>
                    </div>
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
