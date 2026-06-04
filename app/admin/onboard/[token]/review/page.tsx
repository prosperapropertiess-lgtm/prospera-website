"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const BG      = "#080c14";
const SURFACE = "#0f1520";
const BORDER  = "rgba(255,255,255,0.07)";
const TEXT    = "#EDE9E3";
const TEXT_SEC = "rgba(237,233,227,0.5)";
const TEXT_MUT = "rgba(237,233,227,0.25)";
const ACCENT  = "#8B2030";
const GREEN   = "#22c55e";
const AMBER   = "#f59e0b";

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
  specialClauses?: string[] | null;
  noticesServed?: string[] | null;
  [key: string]: unknown;
}

interface Session {
  token: string;
  owner_name: string | null;
  property_address: string | null;
  lease_storage_path: string | null;
  lease_parsed_data: ParsedLease | null;
  step4_completed_at: string | null;
}

function ReviewField({
  label, value, onChange, type = "text", dim,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; dim?: boolean;
}) {
  const isEmpty = !value;
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: "flex", alignItems: "center", gap: 6,
        fontSize: 11, color: TEXT_MUT, marginBottom: 5,
        letterSpacing: "0.06em", textTransform: "uppercase",
      }}>
        {label}
        {isEmpty && (
          <span style={{ padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700, backgroundColor: `${AMBER}20`, color: AMBER }}>
            Missing
          </span>
        )}
        {!isEmpty && (
          <span style={{ padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700, backgroundColor: `${GREEN}18`, color: GREEN }}>
            Extracted
          </span>
        )}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          backgroundColor: isEmpty ? "rgba(245,158,11,0.05)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${isEmpty ? "rgba(245,158,11,0.3)" : dim ? BORDER : "rgba(34,197,94,0.2)"}`,
          borderRadius: 8,
          padding: "10px 14px",
          fontSize: 14,
          color: TEXT,
          outline: "none",
          fontFamily: "var(--font-dm-sans, sans-serif)",
          boxSizing: "border-box",
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => { e.target.style.borderColor = "rgba(139,32,48,0.5)"; }}
        onBlur={(e) => { e.target.style.borderColor = isEmpty ? "rgba(245,158,11,0.3)" : dim ? BORDER : "rgba(34,197,94,0.2)"; }}
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

  // Editable extracted data
  const [data, setData] = useState<ParsedLease>({});
  const [tenants, setTenants] = useState<Array<{ name: string; email: string; unit: string; phone: string }>>([]);

  useEffect(() => {
    fetch(`/api/onboard/${token}/status`)
      .then((r) => r.json())
      .then((s: Session) => {
        setSession(s);
        const parsed = s.lease_parsed_data ?? {};
        setData(parsed);
        const t = Array.isArray(parsed.tenants) ? parsed.tenants : [];
        setTenants(t.map((ten) => ({
          name: String(ten.name ?? ""),
          email: String(ten.email ?? ""),
          unit: String(ten.unit ?? ""),
          phone: String(ten.phone ?? ""),
        })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  function setField(k: keyof ParsedLease) {
    return (v: string) => setData((p) => ({ ...p, [k]: v || null }));
  }

  function setTenant(i: number, k: keyof typeof tenants[0]) {
    return (v: string) => setTenants((prev) => prev.map((t, idx) => idx === i ? { ...t, [k]: v } : t));
  }

  function addTenant() {
    setTenants((p) => [...p, { name: "", email: "", unit: "", phone: "" }]);
  }

  function removeTenant(i: number) {
    setTenants((p) => p.filter((_, idx) => idx !== i));
  }

  async function confirm() {
    setSaving(true);
    const reviewed = { ...data, tenants };
    await fetch(`/api/onboard/${token}/confirm-review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewed_data: reviewed }),
    });
    setDone(true);
    setTimeout(() => router.push(`/admin/onboard/${token}`), 1800);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 24, height: 24, border: `2px solid ${BORDER}`, borderTopColor: ACCENT, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!session?.lease_parsed_data && !loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: BG, color: TEXT, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-dm-sans, sans-serif)" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No lease data yet</p>
          <p style={{ color: TEXT_SEC, fontSize: 14, marginBottom: 16 }}>The owner hasn&apos;t uploaded a lease or parsing hasn&apos;t completed.</p>
          <Link href={`/admin/onboard/${token}`} style={{ color: ACCENT, textDecoration: "none", fontSize: 14 }}>← Back to checklist</Link>
        </div>
      </div>
    );
  }

  const extractedCount = Object.entries(data).filter(([k, v]) => k !== "tenants" && v !== null && v !== undefined && v !== "").length + tenants.length;
  const missingCount = ["monthlyRent", "leaseStart", "leaseEnd", "securityDeposit", "rentDueDay"].filter((k) => !data[k]).length;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, color: TEXT, fontFamily: "var(--font-dm-sans, sans-serif)" }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${BORDER}`, padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href={`/admin/onboard/${token}`} style={{ color: TEXT_MUT, fontSize: 13, textDecoration: "none" }}>← Checklist</Link>
          <span style={{ color: BORDER }}>·</span>
          <div>
            <span style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>Lease Review</span>
            {session?.owner_name && (
              <span style={{ fontSize: 13, color: TEXT_SEC, marginLeft: 8 }}>{session.owner_name}</span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: GREEN }}>{extractedCount} fields extracted</span>
          {missingCount > 0 && (
            <span style={{ fontSize: 12, color: AMBER }}>{missingCount} missing</span>
          )}
        </div>
      </div>

      {done ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", backgroundColor: `${GREEN}20`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 22 }}>✓</div>
            <p style={{ fontSize: 18, fontWeight: 600, margin: "0 0 6px" }}>Confirmed — Email 2 sent to owner</p>
            <p style={{ fontSize: 13, color: TEXT_MUT }}>Redirecting to checklist…</p>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px", animation: "fadeUp 0.5s cubic-bezier(0.23,1,0.32,1) both" }}>

          <p style={{ margin: "0 0 28px", fontSize: 14, color: TEXT_SEC, lineHeight: 1.7 }}>
            Review what Claude extracted from the lease. Green = extracted, amber = missing (fill in manually). When confirmed, Email 2 goes to the owner with the agreement link.
          </p>

          {/* Tenants */}
          <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "22px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
                Tenants ({tenants.length})
              </h3>
              <button
                onClick={addTenant}
                style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "5px 12px", fontSize: 12, color: TEXT_SEC, cursor: "pointer" }}
              >
                + Add Tenant
              </button>
            </div>
            {tenants.length === 0 ? (
              <p style={{ fontSize: 13, color: TEXT_MUT, margin: 0 }}>No tenants extracted. Click "+ Add Tenant" to add manually.</p>
            ) : tenants.map((t, i) => (
              <div key={i} style={{ padding: "14px 0", borderTop: i > 0 ? `1px solid ${BORDER}` : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: TEXT_MUT, letterSpacing: "0.06em", textTransform: "uppercase" }}>Tenant {i + 1}</span>
                  <button onClick={() => removeTenant(i)} style={{ background: "none", border: "none", fontSize: 12, color: TEXT_MUT, cursor: "pointer", padding: 0 }}>Remove</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
                  <ReviewField label="Full Name" value={t.name} onChange={setTenant(i, "name")} />
                  <ReviewField label="Unit / Description" value={t.unit} onChange={setTenant(i, "unit")} dim />
                  <ReviewField label="Email" value={t.email} onChange={setTenant(i, "email")} type="email" dim />
                  <ReviewField label="Phone" value={t.phone} onChange={setTenant(i, "phone")} type="tel" dim />
                </div>
              </div>
            ))}
          </div>

          {/* Lease Terms */}
          <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "22px", marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 18px", fontSize: 15, fontWeight: 700 }}>Lease Terms</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
              <ReviewField label="Monthly Rent ($)" value={String(data.monthlyRent ?? "")} onChange={setField("monthlyRent")} type="number" />
              <ReviewField label="Security Deposit ($)" value={String(data.securityDeposit ?? "")} onChange={setField("securityDeposit")} type="number" />
              <ReviewField label="Lease Start" value={String(data.leaseStart ?? "")} onChange={setField("leaseStart")} type="date" />
              <ReviewField label="Lease End" value={String(data.leaseEnd ?? "")} onChange={setField("leaseEnd")} type="date" />
              <ReviewField label="Rent Due Day (1–31)" value={String(data.rentDueDay ?? "")} onChange={setField("rentDueDay")} type="number" />
              <ReviewField label="Late Fee Structure" value={String(data.lateFeeStructure ?? "")} onChange={setField("lateFeeStructure")} dim />
            </div>
          </div>

          {/* Additional */}
          <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "22px", marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 18px", fontSize: 15, fontWeight: 700 }}>Additional Details</h3>
            <ReviewField label="Pet Policy" value={String(data.petPolicy ?? "")} onChange={setField("petPolicy")} dim />
            <ReviewField label="Parking Details" value={String(data.parkingDetails ?? "")} onChange={setField("parkingDetails")} dim />
            <ReviewField label="Landlord Name (from lease)" value={String(data.landlordName ?? "")} onChange={setField("landlordName")} dim />
          </div>

          {/* Confirm button */}
          <button
            onClick={confirm}
            disabled={saving}
            style={{
              width: "100%",
              backgroundColor: ACCENT,
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "14px 24px",
              fontSize: 15,
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1,
              letterSpacing: "-0.01em",
            }}
          >
            {saving ? "Confirming…" : "Confirm & Send Email 2 to Owner →"}
          </button>
          <p style={{ margin: "10px 0 0", textAlign: "center", fontSize: 12, color: TEXT_MUT }}>
            This sends the owner the agreement signing link.
          </p>
        </div>
      )}
    </div>
  );
}
