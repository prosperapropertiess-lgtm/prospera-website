"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

const ADMIN_HEADER = { "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "" };

interface ReviewedData {
  tenants: Array<{ name: string; email: string; unit: string; phone: string }>;
  monthlyRent: string;
  securityDeposit: string;
  leaseStart: string;
  leaseEnd: string;
  rentDueDay: string;
  lateFeeStructure: string;
  petPolicy: string;
  parkingDetails: string;
  landlordName: string;
}

interface ParsedLease {
  tenants?: Array<{ name?: string; email?: string; phone?: string; unit?: string }>;
  monthlyRent?: number | null;
  leaseStart?: string | null;
  leaseEnd?: string | null;
  securityDeposit?: number | null;
  rentDueDay?: number | null;
  lateFeeStructure?: string | null;
  petPolicy?: string | null;
  parkingDetails?: string | null;
  landlordName?: string | null;
  [key: string]: unknown;
}

interface Session {
  token: string;
  owner_name: string | null;
  property_address: string | null;
  lease_parsed_data: ParsedLease | null;
  step4_completed_at: string | null;
}

function ReviewField({
  label, value, onChange, type = "text", fromParsed,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; fromParsed?: boolean;
}) {
  const isEmpty = !value;
  const borderColor = isEmpty ? "rgba(180,83,9,0.30)" : fromParsed ? "rgba(10,122,82,0.25)" : INPUT_BORDER;
  const bgColor = isEmpty ? AMBER_BG : fromParsed ? GREEN_BG : CARD;

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: "flex", alignItems: "center", gap: 6,
        fontSize: 11, fontWeight: 700, color: SUBTLE, marginBottom: 5,
        letterSpacing: "0.05em", textTransform: "uppercase",
      }}>
        {label}
        {isEmpty ? (
          <span style={{ padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: AMBER_BG, color: AMBER }}>
            missing
          </span>
        ) : (
          <span style={{ padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: GREEN_BG, color: GREEN }}>
            extracted
          </span>
        )}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          background: bgColor,
          border: `1px solid ${borderColor}`,
          borderRadius: 10,
          padding: "10px 14px",
          fontSize: 15,
          color: NAVY,
          outline: "none",
          fontFamily: "var(--font-poppins), -apple-system, sans-serif",
          boxSizing: "border-box",
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => { e.target.style.borderColor = INPUT_FOCUS; }}
        onBlur={(e) => { e.target.style.borderColor = borderColor; }}
      />
    </div>
  );
}

export default function LeaseReviewPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const [reviewed, setReviewed] = useState<ReviewedData>({
    tenants: [],
    monthlyRent: "", securityDeposit: "",
    leaseStart: "", leaseEnd: "",
    rentDueDay: "", lateFeeStructure: "",
    petPolicy: "", parkingDetails: "", landlordName: "",
  });

  useEffect(() => {
    fetch(`/api/onboard/${token}/status`, { headers: ADMIN_HEADER })
      .then((r) => r.json())
      .then((s: Session) => {
        setSession(s);
        const p = s.lease_parsed_data ?? {};
        const rawTenants = Array.isArray(p.tenants) ? p.tenants : [];
        setReviewed({
          tenants: rawTenants.map((t) => ({
            name: String(t.name ?? ""),
            email: String(t.email ?? ""),
            unit: String(t.unit ?? ""),
            phone: String(t.phone ?? ""),
          })),
          monthlyRent: p.monthlyRent != null ? String(p.monthlyRent) : "",
          securityDeposit: p.securityDeposit != null ? String(p.securityDeposit) : "",
          leaseStart: String(p.leaseStart ?? ""),
          leaseEnd: String(p.leaseEnd ?? ""),
          rentDueDay: p.rentDueDay != null ? String(p.rentDueDay) : "",
          lateFeeStructure: String(p.lateFeeStructure ?? ""),
          petPolicy: String(p.petPolicy ?? ""),
          parkingDetails: String(p.parkingDetails ?? ""),
          landlordName: String(p.landlordName ?? ""),
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  function setField<K extends keyof ReviewedData>(k: K) {
    return (v: ReviewedData[K]) => setReviewed((p) => ({ ...p, [k]: v }));
  }

  function setTenant(i: number, k: keyof ReviewedData["tenants"][0]) {
    return (v: string) => setReviewed((prev) => ({
      ...prev,
      tenants: prev.tenants.map((t, idx) => idx === i ? { ...t, [k]: v } : t),
    }));
  }

  function addTenant() {
    setReviewed((p) => ({ ...p, tenants: [...p.tenants, { name: "", email: "", unit: "", phone: "" }] }));
  }

  function removeTenant(i: number) {
    setReviewed((p) => ({ ...p, tenants: p.tenants.filter((_, idx) => idx !== i) }));
  }

  async function confirm() {
    setSaving(true);
    await fetch(`/api/onboard/${token}/confirm-review`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...ADMIN_HEADER },
      body: JSON.stringify({ reviewed_data: reviewed }),
    });
    setDone(true);
    setTimeout(() => router.push(`/admin/onboard/${token}`), 1800);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 30, height: 30, border: "3px solid rgba(15,28,40,0.10)", borderTopColor: BURGUNDY, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!session?.lease_parsed_data) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-poppins), -apple-system, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: "0 0 8px" }}>No lease data yet</p>
          <p style={{ fontSize: 14, color: MUTED, margin: "0 0 16px" }}>The owner hasn&apos;t uploaded a lease or parsing hasn&apos;t completed.</p>
          <Link href={`/admin/onboard/${token}`} style={{ color: BURGUNDY, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>← Back to checklist</Link>
        </div>
      </div>
    );
  }

  const parsedData = session.lease_parsed_data;
  const fieldCount = Object.entries(reviewed).filter(([k, v]) => k !== "tenants" && v !== "").length + reviewed.tenants.length;

  return (
    <div style={{
      minHeight: "100vh",
      background: BG,
      fontFamily: "var(--font-poppins), -apple-system, sans-serif",
    }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
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
          <Link href={`/admin/onboard/${token}`} style={{ color: SUBTLE, fontSize: 13, textDecoration: "none", fontWeight: 500 }}>
            ← Checklist
          </Link>
          <span style={{ color: CARD_BORDER }}>·</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>Lease Review</span>
          {session.owner_name && (
            <span style={{ fontSize: 13, color: MUTED }}>{session.owner_name}</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: GREEN, background: GREEN_BG, padding: "3px 10px", borderRadius: 8 }}>
            {fieldCount} fields extracted
          </span>
        </div>
      </div>

      {done ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: GREEN_BG, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 22, color: GREEN }}>✓</div>
            <p style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: "0 0 6px" }}>Confirmed & sent to owner</p>
            <p style={{ fontSize: 13, color: MUTED }}>Redirecting to checklist…</p>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px", animation: "fadeUp 0.4s ease both" }}>

          <p style={{ margin: "0 0 28px", fontSize: 14, color: MUTED, lineHeight: 1.7 }}>
            Review what was extracted from the lease. Green fields were pulled automatically; amber fields are missing and should be filled in manually.
          </p>

          {/* Tenants */}
          <div style={{ background: CARD, border: `1px solid ${CARD_BORDER}`, boxShadow: CARD_SHADOW, borderRadius: 20, padding: "24px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: NAVY }}>
                Tenants ({reviewed.tenants.length})
              </h3>
              <button
                onClick={addTenant}
                style={{
                  background: "none",
                  border: `1px solid ${CARD_BORDER}`,
                  borderRadius: 8,
                  padding: "6px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: NAVY,
                  cursor: "pointer",
                  fontFamily: "var(--font-poppins), -apple-system, sans-serif",
                }}
              >
                + Add Tenant
              </button>
            </div>
            {reviewed.tenants.length === 0 ? (
              <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>No tenants extracted. Click "+ Add Tenant" to add manually.</p>
            ) : (
              reviewed.tenants.map((t, i) => (
                <div key={i} style={{ padding: "16px 0", borderTop: i > 0 ? `1px solid ${CARD_BORDER}` : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: SUBTLE, letterSpacing: "0.05em", textTransform: "uppercase" }}>Tenant {i + 1}</span>
                    <button
                      onClick={() => removeTenant(i)}
                      style={{ background: "none", border: "none", fontSize: 13, color: MUTED, cursor: "pointer", padding: 0, fontFamily: "var(--font-poppins), -apple-system, sans-serif" }}
                    >
                      Remove
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
                    <ReviewField
                      label="Full Name" value={t.name} onChange={setTenant(i, "name")}
                      fromParsed={!!(parsedData?.tenants?.[i]?.name)}
                    />
                    <ReviewField
                      label="Unit / Description" value={t.unit} onChange={setTenant(i, "unit")}
                      fromParsed={!!(parsedData?.tenants?.[i]?.unit)}
                    />
                    <ReviewField
                      label="Email" value={t.email} onChange={setTenant(i, "email")} type="email"
                      fromParsed={!!(parsedData?.tenants?.[i]?.email)}
                    />
                    <ReviewField
                      label="Phone" value={t.phone} onChange={setTenant(i, "phone")} type="tel"
                      fromParsed={!!(parsedData?.tenants?.[i]?.phone)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Lease Terms */}
          <div style={{ background: CARD, border: `1px solid ${CARD_BORDER}`, boxShadow: CARD_SHADOW, borderRadius: 20, padding: "24px", marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: NAVY }}>Lease Terms</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
              <ReviewField label="Monthly Rent ($)" value={reviewed.monthlyRent} onChange={setField("monthlyRent")} type="number" fromParsed={parsedData?.monthlyRent != null} />
              <ReviewField label="Security Deposit ($)" value={reviewed.securityDeposit} onChange={setField("securityDeposit")} type="number" fromParsed={parsedData?.securityDeposit != null} />
              <ReviewField label="Lease Start" value={reviewed.leaseStart} onChange={setField("leaseStart")} type="date" fromParsed={!!parsedData?.leaseStart} />
              <ReviewField label="Lease End" value={reviewed.leaseEnd} onChange={setField("leaseEnd")} type="date" fromParsed={!!parsedData?.leaseEnd} />
              <ReviewField label="Rent Due Day (1–31)" value={reviewed.rentDueDay} onChange={setField("rentDueDay")} type="number" fromParsed={parsedData?.rentDueDay != null} />
              <ReviewField label="Late Fee Structure" value={reviewed.lateFeeStructure} onChange={setField("lateFeeStructure")} fromParsed={!!parsedData?.lateFeeStructure} />
            </div>
          </div>

          {/* Additional */}
          <div style={{ background: CARD, border: `1px solid ${CARD_BORDER}`, boxShadow: CARD_SHADOW, borderRadius: 20, padding: "24px", marginBottom: 28 }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: NAVY }}>Additional Details</h3>
            <ReviewField label="Pet Policy" value={reviewed.petPolicy} onChange={setField("petPolicy")} fromParsed={!!parsedData?.petPolicy} />
            <ReviewField label="Parking Details" value={reviewed.parkingDetails} onChange={setField("parkingDetails")} fromParsed={!!parsedData?.parkingDetails} />
            <ReviewField label="Landlord Name (from lease)" value={reviewed.landlordName} onChange={setField("landlordName")} fromParsed={!!parsedData?.landlordName} />
          </div>

          {/* Confirm button */}
          <button
            onClick={confirm}
            disabled={saving}
            style={{
              width: "100%",
              background: BURGUNDY,
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "14px 24px",
              fontSize: 16,
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.45 : 1,
              fontFamily: "var(--font-poppins), -apple-system, sans-serif",
              transition: "opacity 0.15s",
            }}
          >
            {saving ? "Confirming…" : "Confirm & Send to Owner →"}
          </button>
          <p style={{ margin: "10px 0 0", textAlign: "center", fontSize: 12, color: SUBTLE }}>
            This sends the owner the agreement signing link.
          </p>
        </div>
      )}
    </div>
  );
}
