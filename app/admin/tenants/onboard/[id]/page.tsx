"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

// ── Design tokens ────────────────────────────────────────────────────────────
const BG           = "#F5F4F1";
const CARD         = "#FFFFFF";
const CARD_BORDER  = "rgba(15,28,40,0.07)";
const CARD_SHADOW  = "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)";
const NAVY         = "#0F1C28";
const MUTED        = "rgba(15,28,40,0.60)";
const SUBTLE       = "rgba(15,28,40,0.42)";
const BURGUNDY     = "#8B2030";
const GREEN        = "#0A7A52";
const GREEN_BG     = "rgba(10,122,82,0.09)";
const AMBER        = "#B45309";
const AMBER_BG     = "rgba(180,83,9,0.09)";
const INPUT_BORDER = "rgba(15,28,40,0.10)";
const FONT         = "var(--font-dm-sans), -apple-system, sans-serif";
const GOLD         = "rgba(184,146,42,0.90)";

const ADMIN_HEADER = { "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "" };

// ── Types ────────────────────────────────────────────────────────────────────
interface TenantSession {
  id: string;
  tenant_name: string;
  tenant_email: string | null;
  tenant_phone: string | null;
  property_address: string;
  property_id: string | null;
  unit: string | null;
  move_in_date: string | null;
  lease_start: string;
  lease_end: string | null;
  monthly_rent: number | null;
  // Phase 1
  application_approved: boolean;
  credit_check_done: boolean;
  references_checked: boolean;
  lease_prepared: boolean;
  tenant_signed_at: string | null;
  owner_signed_at: string | null;
  lease_storage_path: string | null;
  first_month_collected: boolean;
  first_month_amount: number | null;
  last_month_collected: boolean;
  last_month_amount: number | null;
  security_deposit_collected: boolean;
  security_deposit_amount: number | null;
  post_dated_cheques: boolean;
  // Phase 2
  inspection_done: boolean;
  inspection_photos: string[];
  inspection_signed_at: string | null;
  keys_handed: boolean;
  keys_count: number | null;
  access_codes: string | null;
  parking_spot: string | null;
  mailbox_key: boolean;
  welcome_package: boolean;
  // Phase 3
  notion_tenant_id: string | null;
  rent_tracker_created: boolean;
  portal_token: string | null;
  // Phase 4
  welcome_email_sent_at: string | null;
  checkin_scheduled: boolean;
  // Meta
  notes: string | null;
  status: string;
  created_at: string;
  completed_at: string | null;
}

// All boolean/completion fields counted for progress
const PROGRESS_FIELDS: (keyof TenantSession)[] = [
  "application_approved","credit_check_done","references_checked","lease_prepared",
  "tenant_signed_at","owner_signed_at","first_month_collected","last_month_collected",
  "security_deposit_collected","post_dated_cheques",
  "inspection_done","inspection_signed_at","keys_handed","mailbox_key","welcome_package",
  "notion_tenant_id","rent_tracker_created","portal_token",
  "welcome_email_sent_at","checkin_scheduled",
];

function calcProgress(s: TenantSession): number {
  const done = PROGRESS_FIELDS.filter(f => !!s[f]).length;
  return Math.round((done / PROGRESS_FIELDS.length) * 100);
}

function fmtDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

function fmtDateTime(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("en-CA", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

// ── CheckItem component ──────────────────────────────────────────────────────
interface CheckItemProps {
  label: string;
  done: boolean;
  doneAt?: string | null;
  onToggle: () => void;
  children?: React.ReactNode;
  dark?: boolean;
}

function CheckItem({ label, done, doneAt, onToggle, children, dark }: CheckItemProps) {
  const textColor = dark ? "rgba(237,232,225,0.85)" : NAVY;
  const subtleColor = dark ? "rgba(237,232,225,0.40)" : SUBTLE;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "11px 0", borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(15,28,40,0.05)"}`,
        gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
          <button
            onClick={onToggle}
            style={{
              width: 22, height: 22, borderRadius: "50%", flexShrink: 0, cursor: "pointer",
              border: `2px solid ${done ? GREEN : (dark ? "rgba(255,255,255,0.25)" : INPUT_BORDER)}`,
              background: done ? GREEN : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s", padding: 0,
            }}
          >
            {done && (
              <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          <span style={{ fontSize: 14, color: textColor, fontWeight: done ? 500 : 400, fontFamily: FONT }}>
            {label}
          </span>
        </div>
        <div style={{ flexShrink: 0 }}>
          {done && doneAt ? (
            <span style={{ fontSize: 12, color: subtleColor }}>{fmtDateTime(doneAt)}</span>
          ) : done ? (
            <span style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>Done</span>
          ) : (
            <button
              onClick={onToggle}
              style={{
                fontSize: 12, color: dark ? GOLD : BURGUNDY, background: "none", border: "none",
                cursor: "pointer", fontWeight: 600, fontFamily: FONT, padding: "2px 4px",
              }}
            >
              Mark done
            </button>
          )}
        </div>
      </div>
      {children && (
        <div style={{ paddingLeft: 34, paddingTop: 8, paddingBottom: 4 }}>{children}</div>
      )}
    </div>
  );
}

// ── Inline text/number input ─────────────────────────────────────────────────
function InlineInput({
  label, value, onChange, onSave, type = "text", placeholder, dark,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onSave: (v: string) => void;
  type?: string;
  placeholder?: string;
  dark?: boolean;
}) {
  const textColor   = dark ? "rgba(237,232,225,0.85)" : NAVY;
  const borderColor = dark ? "rgba(255,255,255,0.15)" : INPUT_BORDER;
  const bg          = dark ? "rgba(255,255,255,0.05)" : CARD;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <span style={{ fontSize: 12, color: dark ? "rgba(237,232,225,0.45)" : SUBTLE, minWidth: 90, fontFamily: FONT }}>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onBlur={e => onSave(e.target.value)}
        style={{
          flex: 1, background: bg, border: `1px solid ${borderColor}`,
          borderRadius: 8, padding: "7px 11px", fontSize: 14, color: textColor,
          fontFamily: FONT, outline: "none", maxWidth: 220,
        }}
      />
    </div>
  );
}

// ── Phase card wrapper ───────────────────────────────────────────────────────
function PhaseCard({
  title, subtitle, children, dark, complete,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  dark?: boolean;
  complete?: boolean;
}) {
  const bg          = dark ? NAVY : CARD;
  const titleColor  = dark ? "rgba(237,232,225,0.45)" : SUBTLE;
  const borderLeft  = complete ? `3px solid ${GREEN}` : `3px solid transparent`;

  return (
    <div style={{
      background: bg, border: dark ? "1px solid rgba(255,255,255,0.07)" : `1px solid ${CARD_BORDER}`,
      borderLeft, borderRadius: 20, boxShadow: CARD_SHADOW, padding: "24px 28px", marginBottom: 16,
    }}>
      <div style={{ marginBottom: 16 }}>
        <p style={{
          margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: titleColor,
          textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: FONT,
        }}>
          {title}
        </p>
        {subtitle && (
          <p style={{ margin: 0, fontSize: 13, color: dark ? "rgba(237,232,225,0.35)" : SUBTLE, fontFamily: FONT }}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

// ── AutomateButton ───────────────────────────────────────────────────────────
function AutomateButton({
  label, loading, disabled, onClick, hint,
}: {
  label: string;
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
  hint?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <button
        onClick={onClick}
        disabled={disabled || loading}
        title={hint}
        style={{
          border: `1px solid ${disabled ? "rgba(255,255,255,0.12)" : GOLD}`,
          background: "transparent",
          color: disabled ? "rgba(255,255,255,0.25)" : GOLD,
          borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600,
          cursor: disabled || loading ? "not-allowed" : "pointer",
          fontFamily: FONT, transition: "all 0.15s", opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Running…" : `▶ ${label}`}
      </button>
      {hint && disabled && (
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: FONT }}>{hint}</span>
      )}
    </div>
  );
}

// ── Save feedback flash ──────────────────────────────────────────────────────
function useSaveFeedback() {
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function flash() {
    setSaved(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSaved(false), 1800);
  }

  return { saved, flash };
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function TenantOnboardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<TenantSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const { saved, flash }      = useSaveFeedback();

  // Automation loading states
  const [notionLoading,      setNotionLoading]      = useState(false);
  const [rentTrackerLoading, setRentTrackerLoading] = useState(false);
  const [portalLoading,      setPortalLoading]      = useState(false);
  const [checkinLoading,     setCheckinLoading]     = useState(false);
  const [automateError,      setAutomateError]      = useState("");

  // Inline text state for fields that have sub-inputs
  const [firstMonthAmt,   setFirstMonthAmt]   = useState("");
  const [lastMonthAmt,    setLastMonthAmt]     = useState("");
  const [secDepAmt,       setSecDepAmt]        = useState("");
  const [keysCountVal,    setKeysCountVal]     = useState("");
  const [accessCodesVal,  setAccessCodesVal]   = useState("");
  const [parkingSpotVal,  setParkingSpotVal]   = useState("");
  const [notesVal,        setNotesVal]         = useState("");

  // Photo upload
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const loadSession = useCallback(async () => {
    try {
      const r = await fetch(`/api/admin/tenant-onboard/${id}`, { headers: ADMIN_HEADER });
      if (!r.ok) { setError("Session not found."); setLoading(false); return; }
      const data: TenantSession = await r.json();
      setSession(data);
      setFirstMonthAmt(data.first_month_amount?.toString() ?? "");
      setLastMonthAmt(data.last_month_amount?.toString()   ?? "");
      setSecDepAmt(data.security_deposit_amount?.toString() ?? "");
      setKeysCountVal(data.keys_count?.toString()          ?? "");
      setAccessCodesVal(data.access_codes                  ?? "");
      setParkingSpotVal(data.parking_spot                  ?? "");
      setNotesVal(data.notes                               ?? "");
      setLoading(false);
    } catch {
      setError("Failed to load session.");
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadSession(); }, [loadSession]);

  async function patch(updates: Partial<TenantSession>) {
    const r = await fetch(`/api/admin/tenant-onboard/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...ADMIN_HEADER },
      body: JSON.stringify(updates),
    });
    if (r.ok) {
      const data: TenantSession = await r.json();
      setSession(data);
      flash();
    }
  }

  function toggleBool(field: keyof TenantSession) {
    if (!session) return;
    patch({ [field]: !session[field] } as Partial<TenantSession>);
  }

  function setTimestamp(field: keyof TenantSession) {
    if (!session) return;
    const current = session[field];
    patch({ [field]: current ? null : new Date().toISOString() } as Partial<TenantSession>);
  }

  async function runAutomate(action: "notion" | "rent-tracker" | "portal" | "checkin") {
    setAutomateError("");
    const setters: Record<string, (v: boolean) => void> = {
      "notion":       setNotionLoading,
      "rent-tracker": setRentTrackerLoading,
      "portal":       setPortalLoading,
      "checkin":      setCheckinLoading,
    };
    setters[action](true);
    try {
      const r = await fetch(`/api/admin/tenant-onboard/${id}/automate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...ADMIN_HEADER },
        body: JSON.stringify({ action }),
      });
      const data = await r.json();
      if (!r.ok) { setAutomateError(data.error ?? "Automation failed"); return; }
      await loadSession();
    } catch {
      setAutomateError("Network error during automation.");
    } finally {
      setters[action](false);
    }
  }

  async function handlePhotoUpload(files: FileList) {
    if (!files.length) return;
    setPhotoUploading(true);
    const fd = new FormData();
    Array.from(files).slice(0, 10).forEach(f => fd.append("photo", f));
    try {
      const r = await fetch(`/api/admin/tenant-onboard/${id}/photos`, {
        method: "POST",
        headers: ADMIN_HEADER,
        body: fd,
      });
      if (r.ok) { await loadSession(); flash(); }
    } finally {
      setPhotoUploading(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  }

  async function markComplete() {
    await patch({ status: "complete", completed_at: new Date().toISOString() });
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: MUTED, fontFamily: FONT }}>Loading…</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#B91C1C", fontFamily: FONT }}>{error || "Not found"}</p>
      </div>
    );
  }

  const pct     = calcProgress(session);
  const address = session.unit
    ? `${session.property_address} — Unit ${session.unit}`
    : session.property_address;
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.prosperaproperties.co";
  const portalUrl = session.portal_token ? `${siteUrl}/tenants/${session.portal_token}` : null;

  const phase1Done = !!(
    session.application_approved && session.credit_check_done && session.references_checked &&
    session.lease_prepared && session.tenant_signed_at && session.owner_signed_at &&
    session.first_month_collected && session.last_month_collected && session.security_deposit_collected
  );
  const phase2Done = !!(
    session.inspection_done && session.inspection_signed_at && session.keys_handed &&
    session.mailbox_key && session.welcome_package
  );
  const phase3Done = !!(session.notion_tenant_id && session.rent_tracker_created && session.portal_token);
  const phase4Done = !!(session.welcome_email_sent_at && session.checkin_scheduled);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT }}>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        .copy-btn:hover { opacity: 0.75 !important; }
      `}</style>

      {/* Progress bar — top of page */}
      <div style={{ height: 3, background: "rgba(15,28,40,0.08)" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: session.status === "complete" ? GREEN : BURGUNDY,
          transition: "width 0.4s ease",
        }} />
      </div>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "32px 20px 60px" }}>

        {/* Back link */}
        <Link
          href="/admin/tenants/onboard"
          style={{ fontSize: 13, color: SUBTLE, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 24, fontFamily: FONT }}
        >
          ← Tenant Onboarding
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ margin: "0 0 6px", fontSize: 30, fontWeight: 800, color: NAVY, letterSpacing: "-0.02em" }}>
                {session.tenant_name}
              </h1>
              <p style={{ margin: "0 0 4px", fontSize: 14, color: MUTED }}>{address}</p>
              {session.move_in_date && (
                <p style={{ margin: 0, fontSize: 13, color: SUBTLE }}>Move-in: {fmtDate(session.move_in_date)}</p>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              {/* Save flash */}
              {saved && (
                <span style={{ fontSize: 12, color: GREEN, fontWeight: 600, fontFamily: FONT, animation: "fadeIn 0.2s ease" }}>
                  Saved
                </span>
              )}
              {/* Status badge */}
              <span style={{
                fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 8,
                background: session.status === "complete" ? GREEN_BG : AMBER_BG,
                color: session.status === "complete" ? GREEN : AMBER,
              }}>
                {session.status === "complete" ? "Complete" : "In Progress"}
              </span>
              {/* Mark complete — show when all phases done */}
              {(phase1Done && phase2Done && phase3Done && phase4Done && session.status !== "complete") && (
                <button
                  onClick={markComplete}
                  style={{
                    background: GREEN, color: "#fff", border: "none",
                    borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 700,
                    cursor: "pointer", fontFamily: FONT,
                  }}
                >
                  Mark Complete
                </button>
              )}
            </div>
          </div>

          {/* Progress bar inline */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
            <div style={{ flex: 1, height: 5, background: "rgba(15,28,40,0.08)", borderRadius: 4 }}>
              <div style={{
                height: "100%", width: `${pct}%`,
                background: session.status === "complete" ? GREEN : BURGUNDY,
                borderRadius: 4, transition: "width 0.4s",
              }} />
            </div>
            <span style={{ fontSize: 12, color: SUBTLE, flexShrink: 0 }}>{pct}% complete</span>
          </div>
        </div>

        {/* ── PHASE 1 — Before Move-In ── */}
        <PhaseCard title="Phase 1 — Before Move-In" complete={phase1Done}>
          <CheckItem label="Application reviewed & approved" done={session.application_approved} onToggle={() => toggleBool("application_approved")} />
          <CheckItem label="Credit / background check completed" done={session.credit_check_done} onToggle={() => toggleBool("credit_check_done")} />
          <CheckItem label="References checked" done={session.references_checked} onToggle={() => toggleBool("references_checked")} />
          <CheckItem label="Lease agreement prepared" done={session.lease_prepared} onToggle={() => toggleBool("lease_prepared")} />
          <CheckItem
            label="Lease signed by tenant"
            done={!!session.tenant_signed_at}
            doneAt={session.tenant_signed_at}
            onToggle={() => setTimestamp("tenant_signed_at")}
          />
          <CheckItem
            label="Lease signed by owner"
            done={!!session.owner_signed_at}
            doneAt={session.owner_signed_at}
            onToggle={() => setTimestamp("owner_signed_at")}
          />

          {/* Lease upload */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid rgba(15,28,40,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                border: `2px solid ${session.lease_storage_path ? GREEN : INPUT_BORDER}`,
                background: session.lease_storage_path ? GREEN : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {session.lease_storage_path && (
                  <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                    <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span style={{ fontSize: 14, color: NAVY, fontFamily: FONT }}>
                {session.lease_storage_path
                  ? `Lease uploaded: ${session.lease_storage_path.split("/").pop()}`
                  : "Upload signed lease"}
              </span>
            </div>
            <label style={{
              fontSize: 12, color: BURGUNDY, fontWeight: 600, cursor: "pointer", fontFamily: FONT,
            }}>
              {session.lease_storage_path ? "Replace" : "Upload"}
              <input type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }}
                onChange={async e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const fd = new FormData();
                  fd.append("photo", file);
                  const r = await fetch(`/api/admin/tenant-onboard/${id}/photos`, {
                    method: "POST",
                    headers: ADMIN_HEADER,
                    body: fd,
                  });
                  if (r.ok) {
                    const { paths } = await r.json();
                    await patch({ lease_storage_path: paths[0] ?? null });
                  }
                }}
              />
            </label>
          </div>

          <CheckItem
            label="First month's rent collected"
            done={session.first_month_collected}
            onToggle={() => toggleBool("first_month_collected")}
          >
            <InlineInput
              label="Amount"
              value={firstMonthAmt}
              onChange={setFirstMonthAmt}
              onSave={v => patch({ first_month_amount: v ? parseFloat(v) : null })}
              type="number"
              placeholder="1800"
            />
          </CheckItem>

          <CheckItem
            label="Last month's rent collected"
            done={session.last_month_collected}
            onToggle={() => toggleBool("last_month_collected")}
          >
            <InlineInput
              label="Amount"
              value={lastMonthAmt}
              onChange={setLastMonthAmt}
              onSave={v => patch({ last_month_amount: v ? parseFloat(v) : null })}
              type="number"
              placeholder="1800"
            />
          </CheckItem>

          <CheckItem
            label="Security deposit collected"
            done={session.security_deposit_collected}
            onToggle={() => toggleBool("security_deposit_collected")}
          >
            <InlineInput
              label="Amount"
              value={secDepAmt}
              onChange={setSecDepAmt}
              onSave={v => patch({ security_deposit_amount: v ? parseFloat(v) : null })}
              type="number"
              placeholder="1800"
            />
          </CheckItem>

          <div style={{ borderBottom: "none" }}>
            <CheckItem label="Post-dated cheques collected" done={session.post_dated_cheques} onToggle={() => toggleBool("post_dated_cheques")} />
          </div>
        </PhaseCard>

        {/* ── PHASE 2 — Move-In Day ── */}
        <PhaseCard title="Phase 2 — Move-In Day" complete={phase2Done}>
          <CheckItem label="Move-in inspection completed" done={session.inspection_done} onToggle={() => toggleBool("inspection_done")} />

          {/* Photo upload area */}
          <div style={{ padding: "12px 0", borderBottom: "1px solid rgba(15,28,40,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 14, color: NAVY, fontFamily: FONT }}>
                Inspection photos ({session.inspection_photos?.length ?? 0})
              </span>
              <label style={{ fontSize: 12, color: BURGUNDY, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>
                {photoUploading ? "Uploading…" : "+ Add photos"}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: "none" }}
                  onChange={e => e.target.files && handlePhotoUpload(e.target.files)}
                />
              </label>
            </div>
            {session.inspection_photos?.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {session.inspection_photos.map((path, i) => (
                  <div
                    key={i}
                    style={{
                      width: 64, height: 64, borderRadius: 8, background: "rgba(15,28,40,0.06)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, color: SUBTLE, textAlign: "center", padding: 4,
                      border: `1px solid ${CARD_BORDER}`, overflow: "hidden",
                      wordBreak: "break-all",
                    }}
                  >
                    {path.split("/").pop()?.slice(0, 12)}…
                  </div>
                ))}
              </div>
            )}
          </div>

          <CheckItem
            label="Inspection report signed by tenant"
            done={!!session.inspection_signed_at}
            doneAt={session.inspection_signed_at}
            onToggle={() => setTimestamp("inspection_signed_at")}
          />

          <CheckItem
            label="Keys handed over"
            done={session.keys_handed}
            onToggle={() => toggleBool("keys_handed")}
          >
            <InlineInput
              label="Key count"
              value={keysCountVal}
              onChange={setKeysCountVal}
              onSave={v => patch({ keys_count: v ? parseInt(v) : null })}
              type="number"
              placeholder="2"
            />
          </CheckItem>

          <CheckItem
            label="Access codes given"
            done={!!session.access_codes}
            onToggle={() => {
              if (session.access_codes) {
                patch({ access_codes: null });
                setAccessCodesVal("");
              }
            }}
          >
            <InlineInput
              label="Code(s)"
              value={accessCodesVal}
              onChange={setAccessCodesVal}
              onSave={v => patch({ access_codes: v || null })}
              placeholder="Front: 1234, Garage: 5678"
            />
          </CheckItem>

          <CheckItem
            label="Parking spot assigned"
            done={!!session.parking_spot}
            onToggle={() => {
              if (session.parking_spot) {
                patch({ parking_spot: null });
                setParkingSpotVal("");
              }
            }}
          >
            <InlineInput
              label="Spot"
              value={parkingSpotVal}
              onChange={setParkingSpotVal}
              onSave={v => patch({ parking_spot: v || null })}
              placeholder="Spot #3"
            />
          </CheckItem>

          <CheckItem label="Mailbox key given" done={session.mailbox_key} onToggle={() => toggleBool("mailbox_key")} />
          <div style={{ borderBottom: "none" }}>
            <CheckItem label="Welcome package given" done={session.welcome_package} onToggle={() => toggleBool("welcome_package")} />
          </div>
        </PhaseCard>

        {/* ── PHASE 3 — System Setup (dark) ── */}
        <PhaseCard title="Phase 3 — System Setup" subtitle="One-click automations" dark complete={phase3Done}>
          {automateError && (
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "#F87171", fontFamily: FONT }}>{automateError}</p>
          )}

          {/* Notion */}
          <div style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, color: "rgba(237,232,225,0.85)", fontFamily: FONT }}>Add to Notion</span>
              {session.notion_tenant_id ? (
                <span style={{ fontSize: 12, color: GREEN, fontWeight: 600, fontFamily: FONT }}>
                  Created — {session.notion_tenant_id.slice(0, 8)}…
                </span>
              ) : (
                <AutomateButton
                  label="Create in Notion"
                  loading={notionLoading}
                  onClick={() => runAutomate("notion")}
                />
              )}
            </div>
          </div>

          {/* Rent tracker */}
          <div style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, color: "rgba(237,232,225,0.85)", fontFamily: FONT }}>Create Rent Tracker</span>
              {session.rent_tracker_created ? (
                <span style={{ fontSize: 12, color: GREEN, fontWeight: 600, fontFamily: FONT }}>Created</span>
              ) : (
                <AutomateButton
                  label="Create Rent Tracker"
                  loading={rentTrackerLoading}
                  disabled={!session.notion_tenant_id}
                  hint={!session.notion_tenant_id ? "Run Notion step first" : undefined}
                  onClick={() => runAutomate("rent-tracker")}
                />
              )}
            </div>
          </div>

          {/* Portal */}
          <div style={{ padding: "10px 0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontSize: 14, color: "rgba(237,232,225,0.85)", fontFamily: FONT }}>Generate Tenant Portal</span>
              {session.portal_token ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: GREEN, fontWeight: 600, fontFamily: FONT }}>Portal live</span>
                  {portalUrl && (
                    <button
                      className="copy-btn"
                      onClick={() => navigator.clipboard.writeText(portalUrl)}
                      style={{
                        fontSize: 11, color: GOLD, background: "rgba(184,146,42,0.12)",
                        border: `1px solid rgba(184,146,42,0.25)`, borderRadius: 6,
                        padding: "3px 10px", cursor: "pointer", fontFamily: FONT, fontWeight: 600,
                        opacity: 1, transition: "opacity 0.15s",
                      }}
                    >
                      Copy link
                    </button>
                  )}
                </div>
              ) : (
                <AutomateButton
                  label="Generate Portal + Send Email"
                  loading={portalLoading}
                  disabled={!session.notion_tenant_id}
                  hint={!session.notion_tenant_id ? "Run Notion step first" : undefined}
                  onClick={() => runAutomate("portal")}
                />
              )}
            </div>
            {session.portal_token && portalUrl && (
              <p style={{ margin: "4px 0 0", fontSize: 11, color: "rgba(237,232,225,0.30)", wordBreak: "break-all", fontFamily: FONT }}>
                {portalUrl}
              </p>
            )}
          </div>
        </PhaseCard>

        {/* ── PHASE 4 — Welcome Communication ── */}
        <PhaseCard title="Phase 4 — Welcome Communication" complete={phase4Done}>
          {/* Welcome email */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid rgba(15,28,40,0.05)" }}>
            <span style={{ fontSize: 14, color: NAVY, fontFamily: FONT }}>Welcome email</span>
            {session.welcome_email_sent_at ? (
              <span style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>
                Sent {fmtDate(session.welcome_email_sent_at)}
              </span>
            ) : (
              <span style={{ fontSize: 12, color: SUBTLE, fontFamily: FONT }}>
                Auto-sent when portal is generated
              </span>
            )}
          </div>

          {/* Check-in */}
          <div style={{ padding: "11px 0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, color: NAVY, fontFamily: FONT }}>Schedule 2-week check-in</span>
              {session.checkin_scheduled ? (
                <span style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>Scheduled</span>
              ) : (
                <button
                  onClick={() => runAutomate("checkin")}
                  disabled={checkinLoading}
                  style={{
                    fontSize: 12, color: BURGUNDY, background: "none", border: "none",
                    cursor: checkinLoading ? "not-allowed" : "pointer", fontWeight: 600,
                    fontFamily: FONT, padding: 0,
                  }}
                >
                  {checkinLoading ? "Scheduling…" : "▶ Schedule Check-In"}
                </button>
              )}
            </div>
          </div>
        </PhaseCard>

        {/* ── Notes ── */}
        <div style={{
          background: CARD, border: `1px solid ${CARD_BORDER}`, borderRadius: 20,
          boxShadow: CARD_SHADOW, padding: "24px 28px",
        }}>
          <p style={{
            margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: SUBTLE,
            textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: FONT,
          }}>Notes</p>
          <textarea
            value={notesVal}
            onChange={e => setNotesVal(e.target.value)}
            onBlur={e => patch({ notes: e.target.value || null })}
            placeholder="Any notes about this tenant or move-in…"
            rows={4}
            style={{
              width: "100%", background: "rgba(15,28,40,0.02)", border: `1px solid ${INPUT_BORDER}`,
              borderRadius: 10, padding: "12px 14px", fontSize: 14, color: NAVY,
              fontFamily: FONT, resize: "vertical", outline: "none",
              boxSizing: "border-box", lineHeight: 1.6,
            }}
          />
        </div>

      </div>
    </div>
  );
}
