"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

// ── Theme ──────────────────────────────────────────────────────────────────
const BG = "#F7F5F2";
const SURFACE = "#FFFFFF";
const BORDER = "#E5E1DC";
const TEXT = "#1F2F3A";
const TEXT_SEC = "#555555";
const TEXT_MUT = "#999999";
const ACCENT = "#8B2030";
const GREEN = "#2D7A4F";
const AMBER = "#B45309";

// ── Types ──────────────────────────────────────────────────────────────────
interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
  is_default: boolean;
  required: boolean;
  sort_order: number;
}

interface LeadComm {
  id: string;
  type: string;
  direction: string;
  body: string;
  created_at: string;
}

interface Lead {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  source: string | null;
  pipeline_stage: string;
  interest_level: string | null;
  notes: string | null;
  created_at: string;
  comms?: LeadComm[];
}

interface Showing {
  id: string;
  lead_id: string | null;
  scheduled_at: string;
  status: string;
  interested: boolean | null;
  main_objection: string | null;
  competing_properties: string | null;
  next_action: string | null;
  feedback_notes: string | null;
  feedback_price: string | null;
  feedback_size: string | null;
  feedback_condition: string | null;
  feedback_laundry: boolean;
  feedback_parking: boolean;
  feedback_location: boolean;
  feedback_layout: boolean;
  feedback_utilities: boolean;
  quick_apply_sent: boolean;
  quick_apply_sent_at: string | null;
  lead?: { name: string; phone: string | null; email: string | null } | null;
}

interface Channel {
  id: string;
  channel_name: string;
  url: string | null;
  active: boolean;
  views_today: number;
  views_total: number;
  leads_from_channel: number;
}

interface Comp {
  id: string;
  address: string | null;
  rent: number;
  bedrooms: number | null;
  bathrooms: number | null;
  amenities: string | null;
  source: string | null;
  notes: string | null;
}

interface LeasingEvent {
  id: string;
  event_type: string;
  actor: string;
  created_at: string;
  metadata: Record<string, unknown> | null;
}

interface Application {
  id: string;
  token: string;
  stage: string;
  legal_name: string | null;
  email: string | null;
  phone: string | null;
  employment_status: string | null;
  approx_monthly_income: number | null;
  income_ratio: number | null;
  has_pets: boolean;
  num_occupants: number | null;
  preliminary_submitted_at: string | null;
  recommendation: string | null;
  decision_notes: string | null;
  lead?: { name: string; email: string | null } | null;
}

interface LeasingProperty {
  id: string;
  stage: string;
  status: string;
  vacant_since: string | null;
  asking_rent: number | null;
  target_rent: number | null;
  min_authorized_rent: number | null;
  incentive_description: string | null;
  incentive_value: number | null;
  campaign_name: string | null;
  positioning_statement: string | null;
  notes: string | null;
  property: {
    id: string;
    address: string;
    city: string;
    bedrooms: number;
    bathrooms: number;
    price: number;
    images: string[] | null;
    slug: string | null;
  };
  checklist: ChecklistItem[];
  leads: Lead[];
  showings: Showing[];
  channels: Channel[];
}

// ── Stage machine ──────────────────────────────────────────────────────────
const STAGES = [
  "PREPARATION",
  "MARKET_READY",
  "ACTIVE_MARKETING",
  "LEADS_ACTIVE",
  "SHOWINGS_ACTIVE",
  "APPLICATIONS_REVIEW",
  "APPROVED",
  "LEASE_SIGNING",
  "MOVE_IN",
  "CLOSED",
] as const;

type Stage = typeof STAGES[number];

const STAGE_LABELS: Record<string, string> = {
  PREPARATION: "Preparing",
  MARKET_READY: "Market Ready",
  ACTIVE_MARKETING: "Marketing",
  LEADS_ACTIVE: "Leads In",
  SHOWINGS_ACTIVE: "Showings",
  APPLICATIONS_REVIEW: "Review",
  APPROVED: "Approved",
  LEASE_SIGNING: "Signing",
  MOVE_IN: "Move-In",
  CLOSED: "Closed",
};

const STAGE_NEXT_LABELS: Record<string, string> = {
  PREPARATION: "Mark Market Ready",
  MARKET_READY: "Start Marketing",
  ACTIVE_MARKETING: "Leads Active",
  LEADS_ACTIVE: "Showings Active",
  SHOWINGS_ACTIVE: "Review Applications",
  APPLICATIONS_REVIEW: "Approve Applicant",
  APPROVED: "Lease Signing",
  LEASE_SIGNING: "Move-In",
  MOVE_IN: "Close Campaign",
};

// ── Legacy status → stage mapping ──────────────────────────────────────────
function normalizeStage(lp: LeasingProperty): Stage {
  if (STAGES.includes(lp.stage as Stage)) return lp.stage as Stage;
  const legacyMap: Record<string, Stage> = {
    preparing: "PREPARATION",
    listed: "ACTIVE_MARKETING",
    receiving_leads: "LEADS_ACTIVE",
    showing_scheduled: "SHOWINGS_ACTIVE",
    applications_reviewing: "APPLICATIONS_REVIEW",
    approved: "APPROVED",
    leased: "CLOSED",
    problem: "PREPARATION",
  };
  return legacyMap[lp.status] ?? "PREPARATION";
}

const LEAD_PIPELINE_STAGES = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "SHOWING_BOOKED", label: "Showing Booked" },
  { value: "SHOWING_COMPLETED", label: "Showing Done" },
  { value: "APPLICATION_SENT", label: "Apply Link Sent" },
  { value: "APPLICATION_SUBMITTED", label: "Applied" },
  { value: "APPROVED", label: "Approved" },
  { value: "LOST", label: "Lost" },
];

const CHECKLIST_CATEGORIES = ["exterior", "interior", "systems", "docs", "marketing", "admin"];
const COMM_TYPES = ["call", "text", "email", "note"];

// ── Helpers ────────────────────────────────────────────────────────────────
function daysVacant(since: string | null): number {
  if (!since) return 0;
  return Math.floor((Date.now() - new Date(since).getTime()) / 86400000);
}

function fmt(date: string): string {
  return new Date(date).toLocaleDateString("en-CA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function fmtDate(date: string): string {
  return new Date(date).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

function fmtRelative(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return fmtDate(date);
}

const EVENT_ICONS: Record<string, string> = {
  STAGE_CHANGED: "→",
  LEAD_CREATED: "👤",
  LEAD_STAGE_CHANGED: "↑",
  LEAD_LOST: "✕",
  COMM_LOGGED: "💬",
  SHOWING_BOOKED: "📅",
  SHOWING_COMPLETED: "✓",
  SHOWING_NO_SHOW: "✗",
  SHOWING_CANCELLED: "⊘",
  APPLICATION_SUBMITTED: "📋",
  QUICK_APPLY_SENT: "🔗",
  NOTE: "📝",
};

// ── Tab type ───────────────────────────────────────────────────────────────
type Tab = "overview" | "checklist" | "leads" | "showings" | "applications" | "marketing" | "comps" | "activity";

// ── Main Component ─────────────────────────────────────────────────────────
export default function LeasingPropertyHub() {
  const { id } = useParams<{ id: string }>();
  const [lp, setLp] = useState<LeasingProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");
  const [advancingStage, setAdvancingStage] = useState(false);
  const [stageBlockers, setStageBlockers] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/leasing/properties/${id}`).catch(() => null);
    if (res?.ok) setLp(await res.json());
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function advanceStage() {
    if (!lp) return;
    const currentStage = normalizeStage(lp);
    const currentIdx = STAGES.indexOf(currentStage);
    if (currentIdx < 0 || currentIdx >= STAGES.length - 1) return;
    const nextStage = STAGES[currentIdx + 1];

    setAdvancingStage(true);
    setStageBlockers([]);
    const res = await fetch(`/api/admin/leasing/properties/${id}/stage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: nextStage }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.blockers) setStageBlockers(data.blockers);
    } else {
      await load();
    }
    setAdvancingStage(false);
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: TEXT_MUT, fontSize: 14 }}>Loading…</p>
      </div>
    );
  }

  if (!lp) {
    return (
      <div style={{ backgroundColor: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: TEXT_MUT, fontSize: 14 }}>Property not found. <Link href="/admin/leasing" style={{ color: ACCENT }}>Back to Leasing</Link></p>
      </div>
    );
  }

  const currentStage = normalizeStage(lp);
  const currentIdx = STAGES.indexOf(currentStage);
  const days = daysVacant(lp.vacant_since);
  const nextStageLabel = STAGE_NEXT_LABELS[currentStage];

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "checklist", label: "Checklist" },
    { id: "leads", label: `Leads (${lp.leads.length})` },
    { id: "showings", label: `Showings (${lp.showings.length})` },
    { id: "applications", label: "Applications" },
    { id: "marketing", label: "Marketing" },
    { id: "comps", label: "Comps" },
    { id: "activity", label: "Activity" },
  ];

  return (
    <div style={{ backgroundColor: BG, minHeight: "100vh", fontFamily: "var(--font-dm-sans, sans-serif)" }}>

      {/* Header */}
      <div style={{ backgroundColor: SURFACE, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Link href="/admin/leasing" style={{ color: TEXT_MUT, fontSize: 13, textDecoration: "none" }}>← Leasing</Link>
            <span style={{ color: BORDER }}>·</span>
            <span style={{ fontSize: 13, color: TEXT_MUT }}>{lp.property.city}</span>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: TEXT, margin: 0 }}>
                {lp.campaign_name || lp.property.address}
              </h1>
              <p style={{ fontSize: 13, color: TEXT_MUT, margin: "4px 0 0" }}>
                {lp.property.bedrooms}bd · {lp.property.bathrooms}ba · {lp.property.city}
                {lp.asking_rent ? ` · $${lp.asking_rent.toLocaleString()}/mo` : ""}
                {days > 0 ? ` · ${days} days vacant` : ""}
              </p>
            </div>

            {/* Advance stage button */}
            {nextStageLabel && currentIdx < STAGES.length - 1 && (
              <button
                onClick={advanceStage}
                disabled={advancingStage}
                style={{
                  backgroundColor: ACCENT,
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "9px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: advancingStage ? "not-allowed" : "pointer",
                  opacity: advancingStage ? 0.7 : 1,
                  whiteSpace: "nowrap",
                }}
              >
                {advancingStage ? "Moving…" : `→ ${nextStageLabel}`}
              </button>
            )}
          </div>

          {/* Stage machine strip */}
          <div style={{ overflowX: "auto", paddingBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 0, minWidth: "max-content" }}>
              {STAGES.map((stage, i) => {
                const isDone = i < currentIdx;
                const isCurrent = i === currentIdx;
                return (
                  <div key={stage} style={{ display: "flex", alignItems: "center" }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "4px 10px",
                      borderRadius: 20,
                      backgroundColor: isCurrent ? ACCENT : isDone ? "#D1FAE5" : "transparent",
                      transition: "all 0.2s",
                    }}>
                      {isDone && <span style={{ fontSize: 10, color: GREEN }}>✓</span>}
                      <span style={{
                        fontSize: 11,
                        fontWeight: isCurrent ? 700 : 500,
                        color: isCurrent ? "#fff" : isDone ? GREEN : TEXT_MUT,
                        whiteSpace: "nowrap",
                      }}>
                        {STAGE_LABELS[stage]}
                      </span>
                    </div>
                    {i < STAGES.length - 1 && (
                      <span style={{ fontSize: 11, color: isDone ? GREEN : BORDER, margin: "0 2px" }}>→</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stage blocker messages */}
          {stageBlockers.length > 0 && (
            <div style={{ marginTop: 10, backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px" }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#991B1B", margin: "0 0 4px" }}>Complete these before advancing:</p>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {stageBlockers.map((b, i) => (
                  <li key={i} style={{ fontSize: 12, color: "#991B1B", marginBottom: 2 }}>{b}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, marginTop: 14, borderBottom: `1px solid ${BORDER}`, overflowX: "auto" }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: "8px 14px",
                  fontSize: 13,
                  fontWeight: tab === t.id ? 600 : 400,
                  color: tab === t.id ? TEXT : TEXT_MUT,
                  background: "none",
                  border: "none",
                  borderBottom: tab === t.id ? `2px solid ${ACCENT}` : "2px solid transparent",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  marginBottom: -1,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>
        {tab === "overview" && <OverviewTab lp={lp} onEdit={load} />}
        {tab === "checklist" && <ChecklistTab lp={lp} onEdit={load} />}
        {tab === "leads" && <LeadsTab lp={lp} onEdit={load} />}
        {tab === "showings" && <ShowingsTab lp={lp} onEdit={load} />}
        {tab === "applications" && <ApplicationsTab lp={lp} onEdit={load} />}
        {tab === "marketing" && <MarketingTab lp={lp} onEdit={load} />}
        {tab === "comps" && <CompsTab lp={lp} onEdit={load} />}
        {tab === "activity" && <ActivityTab lpId={lp.id} />}
      </div>
    </div>
  );
}

// ── Overview Tab ───────────────────────────────────────────────────────────
function OverviewTab({ lp, onEdit }: { lp: LeasingProperty; onEdit: () => void }) {
  const [editRent, setEditRent] = useState(false);
  const [asking, setAsking] = useState(String(lp.asking_rent ?? ""));
  const [target, setTarget] = useState(String(lp.target_rent ?? ""));
  const [notes, setNotes] = useState(lp.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [metrics, setMetrics] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch(`/api/admin/leasing/properties/${lp.id}/metrics`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setMetrics(d); })
      .catch(() => {});
  }, [lp.id]);

  const days = daysVacant(lp.vacant_since);
  const completedShowings = lp.showings.filter((s) => s.status === "completed").length;
  const totalLeads = lp.leads.length;
  const dailyCost = Number(lp.asking_rent ?? 0) * 12 / 365;
  const vacancyLoss = Math.round(dailyCost * days);

  async function saveRent() {
    await fetch(`/api/admin/leasing/properties/${lp.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ asking_rent: Number(asking) || null, target_rent: Number(target) || null }),
    });
    setEditRent(false);
    onEdit();
  }

  async function saveNotes() {
    setSavingNotes(true);
    await fetch(`/api/admin/leasing/properties/${lp.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    setSavingNotes(false);
  }

  const diagnostics = (metrics?.diagnostics as { severity: string; message: string; action: string }[] | undefined) ?? [];
  const funnel = metrics?.funnel as Record<string, number> | undefined;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>

      {/* Left column */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Diagnostics */}
        {diagnostics.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {diagnostics.map((d, i) => (
              <div key={i} style={{
                backgroundColor: d.severity === "error" ? "#FEF2F2" : "#FFFBEB",
                border: `1px solid ${d.severity === "error" ? "#FECACA" : "#FDE68A"}`,
                borderRadius: 8,
                padding: "10px 14px",
                display: "flex",
                gap: 10,
              }}>
                <span>{d.severity === "error" ? "🔴" : "⚠"}</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: d.severity === "error" ? "#991B1B" : "#92400E", margin: "0 0 2px" }}>{d.message}</p>
                  <p style={{ fontSize: 12, color: TEXT_SEC, margin: 0 }}>{d.action}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Economics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { label: "Days Vacant", value: String(days), color: days > 30 ? ACCENT : TEXT },
            { label: "Vacancy Loss", value: `$${vacancyLoss.toLocaleString()}`, color: days > 14 ? ACCENT : TEXT_MUT, note: "est." },
            { label: "Leads", value: String(totalLeads), color: TEXT },
            { label: "Showings Done", value: String(completedShowings), color: TEXT },
          ].map((s) => (
            <div key={s.label} style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px" }}>
              <p style={{ fontSize: 11, color: TEXT_MUT, margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: s.color, margin: "6px 0 0" }}>{s.value}</p>
              {s.note && <p style={{ fontSize: 11, color: TEXT_MUT, margin: "2px 0 0" }}>{s.note}</p>}
            </div>
          ))}
        </div>

        {/* Lead funnel (from metrics or fallback) */}
        {funnel && (
          <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: TEXT, margin: "0 0 14px" }}>Funnel</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Leads Total", key: "leads_total" },
                { label: "Contacted", key: "leads_contacted" },
                { label: "Showings Booked", key: "showings_booked" },
                { label: "Showings Completed", key: "showings_completed" },
                { label: "Applications Started", key: "applications_started" },
                { label: "Applications Submitted", key: "applications_submitted" },
              ].map(({ label, key }) => {
                const val = (funnel[key] as number) ?? 0;
                const total = (funnel.leads_total as number) || 1;
                return (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, color: TEXT_SEC, width: 160, flexShrink: 0 }}>{label}</span>
                    <div style={{ flex: 1, height: 5, backgroundColor: BG, borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.min((val / total) * 100, 100)}%`, backgroundColor: ACCENT, borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: TEXT, minWidth: 20, textAlign: "right" }}>{val}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Notes */}
        <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: TEXT, margin: "0 0 12px" }}>Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveNotes}
            rows={5}
            placeholder="Internal notes about this campaign…"
            style={{ width: "100%", resize: "vertical", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 12, fontSize: 13, color: TEXT, backgroundColor: BG, fontFamily: "inherit", boxSizing: "border-box" }}
          />
          {savingNotes && <p style={{ fontSize: 11, color: TEXT_MUT, margin: "4px 0 0" }}>Saving…</p>}
        </div>
      </div>

      {/* Right column */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Rent */}
        <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: TEXT, margin: 0 }}>Rent</h3>
            <button onClick={() => setEditRent(!editRent)} style={{ fontSize: 12, color: ACCENT, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
              {editRent ? "Cancel" : "Edit"}
            </button>
          </div>
          {editRent ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, color: TEXT_MUT, display: "block", marginBottom: 4 }}>Asking Rent / mo</label>
                <input type="number" value={asking} onChange={(e) => setAsking(e.target.value)}
                  style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 7, padding: "8px 10px", fontSize: 14, backgroundColor: BG, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: TEXT_MUT, display: "block", marginBottom: 4 }}>Target / Bottom Line</label>
                <input type="number" value={target} onChange={(e) => setTarget(e.target.value)}
                  style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 7, padding: "8px 10px", fontSize: 14, backgroundColor: BG, boxSizing: "border-box" }} />
              </div>
              <button onClick={saveRent} style={{ backgroundColor: ACCENT, color: "#fff", border: "none", borderRadius: 7, padding: "9px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Save
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: TEXT_MUT }}>Asking</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>{lp.asking_rent ? `$${lp.asking_rent.toLocaleString()}` : "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: TEXT_MUT }}>Target / Min</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: TEXT_SEC }}>{lp.target_rent ? `$${lp.target_rent.toLocaleString()}` : "—"}</span>
              </div>
              {lp.min_authorized_rent && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: TEXT_MUT }}>Min Authorized</span>
                  <span style={{ fontSize: 13, color: TEXT_MUT }}>${lp.min_authorized_rent.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Speed to lead */}
        {!!metrics?.speed_to_lead && (
          <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: TEXT, margin: "0 0 12px" }}>Speed to Lead</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Avg response", value: `${(metrics.speed_to_lead as Record<string, number>).avg_response_min ?? "—"} min` },
                { label: "Under 15 min", value: `${(metrics.speed_to_lead as Record<string, number>).pct_under_15_min ?? 0}%` },
                { label: "Uncontacted", value: String((metrics.speed_to_lead as Record<string, number>).uncontacted_count ?? 0) },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: TEXT_MUT }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent showings */}
        <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: TEXT, margin: "0 0 12px" }}>Recent Showings</h3>
          {lp.showings.length === 0 ? (
            <p style={{ fontSize: 13, color: TEXT_MUT, margin: 0 }}>No showings yet.</p>
          ) : (
            lp.showings.slice(0, 4).map((s) => (
              <div key={s.id} style={{ borderBottom: `1px solid ${BORDER}`, paddingBottom: 10, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{s.lead?.name ?? "Walk-in"}</span>
                  <span style={{ fontSize: 11, color: TEXT_MUT }}>{fmtDate(s.scheduled_at)}</span>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <span style={{
                    fontSize: 11, padding: "2px 7px", borderRadius: 99,
                    backgroundColor: s.status === "completed" ? "#D1FAE5" : s.status === "cancelled" ? "#FEE2E2" : "#FEF3C7",
                    color: s.status === "completed" ? "#065F46" : s.status === "cancelled" ? "#991B1B" : "#92400E",
                  }}>{s.status}</span>
                  {s.interested !== null && (
                    <span style={{ fontSize: 11, color: s.interested ? GREEN : TEXT_MUT }}>{s.interested ? "Interested" : "Not interested"}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Checklist Tab ──────────────────────────────────────────────────────────
function ChecklistTab({ lp, onEdit }: { lp: LeasingProperty; onEdit: () => void }) {
  const [newItem, setNewItem] = useState("");
  const [newCat, setNewCat] = useState("interior");
  const [adding, setAdding] = useState(false);

  async function toggle(item: ChecklistItem) {
    await fetch(`/api/admin/leasing/properties/${lp.id}/checklist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _action: "toggle", item_id: item.id, completed: !item.completed }),
    });
    onEdit();
  }

  async function addItem() {
    if (!newItem.trim()) return;
    setAdding(true);
    await fetch(`/api/admin/leasing/properties/${lp.id}/checklist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _action: "add", category: newCat, item: newItem.trim() }),
    });
    setNewItem("");
    setAdding(false);
    onEdit();
  }

  async function deleteItem(itemId: string) {
    await fetch(`/api/admin/leasing/properties/${lp.id}/checklist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _action: "delete", item_id: itemId }),
    });
    onEdit();
  }

  const grouped = CHECKLIST_CATEGORIES.reduce<Record<string, ChecklistItem[]>>((acc, cat) => {
    const items = lp.checklist.filter((c) => c.category === cat).sort((a, b) => a.sort_order - b.sort_order);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});
  const other = lp.checklist.filter((c) => !CHECKLIST_CATEGORIES.includes(c.category));
  if (other.length > 0) grouped["other"] = other;

  const done = lp.checklist.filter((c) => c.completed).length;
  const total = lp.checklist.length;
  const requiredDone = lp.checklist.filter((c) => c.required && c.completed).length;
  const requiredTotal = lp.checklist.filter((c) => c.required).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{ maxWidth: 700 }}>
      {/* Progress */}
      <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px 20px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
          <div style={{ flex: 1, height: 8, backgroundColor: BG, borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, backgroundColor: pct === 100 ? GREEN : pct > 50 ? AMBER : ACCENT, borderRadius: 99, transition: "width 0.3s" }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: TEXT, whiteSpace: "nowrap" }}>{done}/{total}</span>
        </div>
        {requiredTotal > 0 && (
          <p style={{ fontSize: 12, color: requiredDone < requiredTotal ? ACCENT : GREEN, margin: 0, fontWeight: 600 }}>
            {requiredDone}/{requiredTotal} required items complete
            {requiredDone < requiredTotal ? " — must complete before advancing to Market Ready" : " ✓"}
          </p>
        )}
      </div>

      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: TEXT_MUT, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>{cat}</p>
          <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
            {items.map((item, i) => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: i < items.length - 1 ? `1px solid ${BORDER}` : "none", opacity: item.completed ? 0.6 : 1 }}>
                <button
                  onClick={() => toggle(item)}
                  style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${item.completed ? GREEN : item.required ? ACCENT : BORDER}`, backgroundColor: item.completed ? GREEN : "transparent", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {item.completed && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}
                </button>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, color: TEXT, margin: 0, textDecoration: item.completed ? "line-through" : "none" }}>
                    {item.item}
                    {item.required && !item.completed && <span style={{ fontSize: 10, color: ACCENT, fontWeight: 700, marginLeft: 6 }}>REQUIRED</span>}
                  </p>
                  {item.completed_at && <p style={{ fontSize: 11, color: TEXT_MUT, margin: "2px 0 0" }}>Done {fmtDate(item.completed_at)}</p>}
                </div>
                {!item.is_default && (
                  <button onClick={() => deleteItem(item.id)} style={{ fontSize: 12, color: TEXT_MUT, background: "none", border: "none", cursor: "pointer" }}>✕</button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Add custom item */}
      <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: TEXT, margin: "0 0 12px" }}>Add Custom Item</p>
        <div style={{ display: "flex", gap: 10 }}>
          <select value={newCat} onChange={(e) => setNewCat(e.target.value)} style={inputStyle}>
            {CHECKLIST_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addItem()} placeholder="Item description…" style={{ ...inputStyle, flex: 1 }} />
          <button onClick={addItem} disabled={adding || !newItem.trim()} style={{ backgroundColor: ACCENT, color: "#fff", border: "none", borderRadius: 7, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: !newItem.trim() ? 0.5 : 1 }}>Add</button>
        </div>
      </div>
    </div>
  );
}

// ── Leads Tab ──────────────────────────────────────────────────────────────
function LeadsTab({ lp, onEdit }: { lp: LeasingProperty; onEdit: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", source: "kijiji", notes: "" });
  const [commForm, setCommForm] = useState({ type: "call", direction: "inbound", body: "" });
  const [saving, setSaving] = useState(false);
  const [lostForm, setLostForm] = useState<{ [leadId: string]: { reason: string; notes: string } }>({});

  async function addLead() {
    if (!form.name.trim()) return;
    setSaving(true);
    await fetch(`/api/admin/leasing/properties/${lp.id}/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", phone: "", email: "", source: "kijiji", notes: "" });
    setShowAdd(false);
    setSaving(false);
    onEdit();
  }

  async function updateStage(leadId: string, stage: string) {
    const body: Record<string, unknown> = { _action: "update_stage", lead_id: leadId, stage };
    if (stage === "LOST" && lostForm[leadId]) {
      body.lost_reason = lostForm[leadId].reason;
      body.lost_reason_notes = lostForm[leadId].notes;
    }
    await fetch(`/api/admin/leasing/properties/${lp.id}/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    onEdit();
  }

  async function addComm(leadId: string) {
    if (!commForm.body.trim()) return;
    await fetch(`/api/admin/leasing/properties/${lp.id}/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _action: "add_comm", lead_id: leadId, ...commForm }),
    });
    setCommForm({ type: "call", direction: "inbound", body: "" });
    onEdit();
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: 0 }}>{lp.leads.length} Lead{lp.leads.length !== 1 ? "s" : ""}</h2>
        <button onClick={() => setShowAdd(!showAdd)} style={{ backgroundColor: ACCENT, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          + Add Lead
        </button>
      </div>

      {showAdd && (
        <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20, marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: TEXT, margin: "0 0 14px" }}>New Lead</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(519) 000-0000" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Source</label>
              <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} style={inputStyle}>
                {["kijiji", "facebook", "word_of_mouth", "website", "realtor", "walk_in", "other"].map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={labelStyle}>Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Initial notes…" style={{ ...inputStyle, resize: "vertical", width: "100%", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={addLead} disabled={saving || !form.name.trim()} style={{ backgroundColor: ACCENT, color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {saving ? "Saving…" : "Add Lead"}
            </button>
            <button onClick={() => setShowAdd(false)} style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 7, padding: "9px 16px", fontSize: 13, cursor: "pointer", color: TEXT_MUT }}>Cancel</button>
          </div>
        </div>
      )}

      {lp.leads.length === 0 ? (
        <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 40, textAlign: "center" }}>
          <p style={{ fontSize: 14, color: TEXT_MUT, margin: 0 }}>No leads yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {lp.leads.map((lead) => (
            <div key={lead.id} style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: BG, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: TEXT, fontSize: 14 }}>
                    {lead.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: TEXT, margin: 0 }}>{lead.name}</p>
                    <p style={{ fontSize: 12, color: TEXT_MUT, margin: "2px 0 0" }}>
                      {lead.phone && <span>{lead.phone} · </span>}
                      {lead.source && <span>{lead.source.replace("_", " ")} · </span>}
                      <span>{fmtDate(lead.created_at)}</span>
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <select
                    value={lead.pipeline_stage ?? "NEW"}
                    onChange={(e) => { e.stopPropagation(); updateStage(lead.id, e.target.value); }}
                    onClick={(e) => e.stopPropagation()}
                    style={{ fontSize: 12, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "4px 8px", backgroundColor: BG, color: TEXT, cursor: "pointer" }}
                  >
                    {LEAD_PIPELINE_STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <span style={{ color: TEXT_MUT, fontSize: 14 }}>{expandedLead === lead.id ? "▲" : "▼"}</span>
                </div>
              </div>

              {expandedLead === lead.id && (
                <div style={{ borderTop: `1px solid ${BORDER}`, padding: 16 }}>
                  {lead.notes && (
                    <p style={{ fontSize: 13, color: TEXT_SEC, backgroundColor: BG, borderRadius: 8, padding: "10px 12px", margin: "0 0 14px" }}>{lead.notes}</p>
                  )}
                  <p style={{ fontSize: 12, fontWeight: 600, color: TEXT_MUT, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>Communication Log</p>
                  {lead.comms && lead.comms.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                      {lead.comms.map((c) => (
                        <div key={c.id} style={{ display: "flex", gap: 10, padding: "8px 12px", backgroundColor: BG, borderRadius: 8 }}>
                          <span style={{ fontSize: 11, color: TEXT_MUT, whiteSpace: "nowrap", marginTop: 1 }}>{fmtDate(c.created_at)}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: TEXT_MUT, backgroundColor: BORDER, borderRadius: 4, padding: "1px 6px", height: "fit-content" }}>{c.type}</span>
                          <p style={{ fontSize: 13, color: TEXT, margin: 0, flex: 1 }}>{c.body}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: 13, color: TEXT_MUT, margin: "0 0 14px" }}>No communications logged yet.</p>
                  )}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <select value={commForm.type} onChange={(e) => setCommForm({ ...commForm, type: e.target.value })} style={{ ...inputStyle, width: "auto" }}>
                      {COMM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select value={commForm.direction} onChange={(e) => setCommForm({ ...commForm, direction: e.target.value })} style={{ ...inputStyle, width: "auto" }}>
                      <option value="inbound">Inbound</option>
                      <option value="outbound">Outbound</option>
                    </select>
                    <input value={commForm.body} onChange={(e) => setCommForm({ ...commForm, body: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && addComm(lead.id)}
                      placeholder="Log this interaction…"
                      style={{ ...inputStyle, flex: 1, minWidth: 200 }} />
                    <button onClick={() => addComm(lead.id)} disabled={!commForm.body.trim()} style={{ backgroundColor: ACCENT, color: "#fff", border: "none", borderRadius: 6, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: !commForm.body.trim() ? 0.5 : 1 }}>Log</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Showings Tab ───────────────────────────────────────────────────────────
function ShowingsTab({ lp, onEdit }: { lp: LeasingProperty; onEdit: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [sendingApply, setSendingApply] = useState<string | null>(null);
  const [form, setForm] = useState({ lead_id: "", scheduled_at: "", notes: "" });
  const [feedbackForm, setFeedbackForm] = useState({
    interested: true as boolean | null,
    main_objection: "",
    competing_properties: "",
    next_action: "",
    feedback_notes: "",
    feedback_price: "" as string,
    feedback_size: "" as string,
    feedback_condition: "" as string,
    feedback_laundry: false,
    feedback_parking: false,
    feedback_location: false,
    feedback_layout: false,
    feedback_utilities: false,
  });
  const [saving, setSaving] = useState(false);

  async function addShowing() {
    if (!form.scheduled_at) return;
    setSaving(true);
    await fetch(`/api/admin/leasing/properties/${lp.id}/showings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, lead_id: form.lead_id || null }),
    });
    setForm({ lead_id: "", scheduled_at: "", notes: "" });
    setShowAdd(false);
    setSaving(false);
    onEdit();
  }

  async function submitFeedback(showingId: string, leadId: string | null) {
    setSaving(true);
    await fetch(`/api/admin/leasing/properties/${lp.id}/showings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _action: "feedback", showing_id: showingId, lead_id: leadId, ...feedbackForm }),
    });
    setFeedbackId(null);
    setFeedbackForm({ interested: true, main_objection: "", competing_properties: "", next_action: "", feedback_notes: "", feedback_price: "", feedback_size: "", feedback_condition: "", feedback_laundry: false, feedback_parking: false, feedback_location: false, feedback_layout: false, feedback_utilities: false });
    setSaving(false);
    onEdit();
  }

  async function updateStatus(showingId: string, status: string) {
    await fetch(`/api/admin/leasing/properties/${lp.id}/showings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _action: "update_status", showing_id: showingId, status }),
    });
    onEdit();
  }

  async function sendQuickApply(showing: Showing) {
    if (!showing.lead_id) return;
    setSendingApply(showing.id);
    const lead = lp.leads.find((l) => l.id === showing.lead_id);
    await fetch(`/api/admin/leasing/properties/${lp.id}/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lead_id: showing.lead_id,
        showing_id: showing.id,
        legal_name: lead?.name ?? null,
        email: lead?.email ?? null,
        phone: lead?.phone ?? null,
      }),
    });
    setSendingApply(null);
    onEdit();
  }

  const activeLeads = lp.leads.filter((l) => !["LOST"].includes(l.pipeline_stage ?? ""));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: 0 }}>{lp.showings.length} Showing{lp.showings.length !== 1 ? "s" : ""}</h2>
        <button onClick={() => setShowAdd(!showAdd)} style={{ backgroundColor: ACCENT, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          + Schedule Showing
        </button>
      </div>

      {showAdd && (
        <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20, marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: TEXT, margin: "0 0 14px" }}>Schedule Showing</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Lead (optional)</label>
              <select value={form.lead_id} onChange={(e) => setForm({ ...form, lead_id: e.target.value })} style={inputStyle}>
                <option value="">Walk-in / Unknown</option>
                {activeLeads.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Date & Time *</label>
              <input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} style={inputStyle} />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={labelStyle}>Notes</label>
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Pre-showing notes…" style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={addShowing} disabled={saving || !form.scheduled_at} style={{ backgroundColor: ACCENT, color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {saving ? "Saving…" : "Schedule"}
            </button>
            <button onClick={() => setShowAdd(false)} style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 7, padding: "9px 16px", fontSize: 13, cursor: "pointer", color: TEXT_MUT }}>Cancel</button>
          </div>
        </div>
      )}

      {lp.showings.length === 0 ? (
        <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 40, textAlign: "center" }}>
          <p style={{ fontSize: 14, color: TEXT_MUT, margin: 0 }}>No showings scheduled yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {lp.showings.map((s) => (
            <div key={s.id} style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{s.lead?.name ?? "Walk-in"}</span>
                    <span style={{
                      fontSize: 11, padding: "2px 8px", borderRadius: 99,
                      backgroundColor: s.status === "completed" ? "#D1FAE5" : s.status === "cancelled" ? "#FEE2E2" : s.status === "no_show" ? "#FEE2E2" : "#FEF3C7",
                      color: s.status === "completed" ? "#065F46" : s.status === "cancelled" ? "#991B1B" : s.status === "no_show" ? "#991B1B" : "#92400E",
                    }}>{s.status.replace("_", " ")}</span>
                  </div>
                  <p style={{ fontSize: 13, color: TEXT_MUT, margin: "4px 0 0" }}>{fmt(s.scheduled_at)}</p>
                  {s.lead?.phone && <p style={{ fontSize: 12, color: TEXT_MUT, margin: "2px 0 0" }}>{s.lead.phone}</p>}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {s.status === "scheduled" && (
                    <>
                      <button onClick={() => setFeedbackId(s.id)} style={{ fontSize: 12, backgroundColor: GREEN, color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontWeight: 600 }}>Add Feedback</button>
                      <button onClick={() => updateStatus(s.id, "no_show")} style={{ fontSize: 12, background: "none", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "6px 12px", cursor: "pointer", color: TEXT_MUT }}>No-show</button>
                      <button onClick={() => updateStatus(s.id, "cancelled")} style={{ fontSize: 12, background: "none", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "6px 12px", cursor: "pointer", color: TEXT_MUT }}>Cancel</button>
                    </>
                  )}
                  {s.status === "completed" && s.interested === true && s.lead_id && (
                    s.quick_apply_sent ? (
                      <span style={{ fontSize: 12, color: GREEN, fontWeight: 600, padding: "6px 0" }}>✓ Apply link sent {s.quick_apply_sent_at ? fmtDate(s.quick_apply_sent_at) : ""}</span>
                    ) : (
                      <button
                        onClick={() => sendQuickApply(s)}
                        disabled={sendingApply === s.id}
                        style={{ fontSize: 12, backgroundColor: "#1F2F3A", color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontWeight: 600, opacity: sendingApply === s.id ? 0.6 : 1 }}
                      >
                        {sendingApply === s.id ? "Sending…" : "Send Quick Apply →"}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Completed feedback summary */}
              {s.status === "completed" && (s.interested !== null || s.main_objection || s.feedback_notes) && (
                <div style={{ marginTop: 12, padding: "10px 14px", backgroundColor: BG, borderRadius: 8 }}>
                  {s.interested !== null && (
                    <p style={{ fontSize: 13, margin: "0 0 4px", color: s.interested ? GREEN : ACCENT, fontWeight: 600 }}>
                      {s.interested ? "✓ Interested" : "✕ Not interested"}
                    </p>
                  )}
                  {s.main_objection && <p style={{ fontSize: 13, color: TEXT_SEC, margin: "0 0 4px" }}>Objection: {s.main_objection}</p>}
                  {s.competing_properties && <p style={{ fontSize: 13, color: TEXT_SEC, margin: "0 0 4px" }}>Competing: {s.competing_properties}</p>}
                  {s.next_action && <p style={{ fontSize: 13, color: TEXT_SEC, margin: "0 0 4px" }}>Next: {s.next_action}</p>}
                  {/* Concern tags */}
                  {[
                    s.feedback_price && `Price: ${s.feedback_price}`,
                    s.feedback_size && `Size: ${s.feedback_size}`,
                    s.feedback_condition && `Condition: ${s.feedback_condition}`,
                    s.feedback_laundry && "Laundry",
                    s.feedback_parking && "Parking",
                    s.feedback_location && "Location",
                    s.feedback_layout && "Layout",
                    s.feedback_utilities && "Utilities",
                  ].filter(Boolean).length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                      {[s.feedback_price && `Price: ${s.feedback_price}`, s.feedback_size && `Size: ${s.feedback_size}`, s.feedback_condition && `Condition: ${s.feedback_condition}`, s.feedback_laundry && "Laundry", s.feedback_parking && "Parking", s.feedback_location && "Location", s.feedback_layout && "Layout", s.feedback_utilities && "Utilities"].filter(Boolean).map((tag, i) => (
                        <span key={i} style={{ fontSize: 11, backgroundColor: "#FEE2E2", color: "#991B1B", borderRadius: 4, padding: "2px 7px" }}>{tag}</span>
                      ))}
                    </div>
                  )}
                  {s.feedback_notes && <p style={{ fontSize: 13, color: TEXT_SEC, margin: "6px 0 0" }}>{s.feedback_notes}</p>}
                </div>
              )}

              {/* Inline feedback form */}
              {feedbackId === s.id && (
                <div style={{ marginTop: 14, padding: 14, border: `1px solid ${BORDER}`, borderRadius: 8, backgroundColor: BG }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: "0 0 12px" }}>Post-Showing Feedback</p>

                  {/* Interested / not / maybe */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    {[
                      { label: "Interested", val: true, c: GREEN, bg: "#D1FAE5" },
                      { label: "Maybe", val: null, c: AMBER, bg: "#FEF3C7" },
                      { label: "Not Interested", val: false, c: ACCENT, bg: "#FEE2E2" },
                    ].map(({ label, val, c, bg }) => (
                      <button key={label}
                        onClick={() => setFeedbackForm({ ...feedbackForm, interested: val })}
                        style={{ flex: 1, padding: "8px", borderRadius: 7, border: `2px solid ${feedbackForm.interested === val ? c : BORDER}`, backgroundColor: feedbackForm.interested === val ? bg : SURFACE, color: feedbackForm.interested === val ? c : TEXT_MUT, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                        {label}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                    <input value={feedbackForm.main_objection} onChange={(e) => setFeedbackForm({ ...feedbackForm, main_objection: e.target.value })}
                      placeholder="Main objection (price, layout…)" style={inputStyle} />
                    <input value={feedbackForm.competing_properties} onChange={(e) => setFeedbackForm({ ...feedbackForm, competing_properties: e.target.value })}
                      placeholder="Competing properties?" style={inputStyle} />
                    <select value={feedbackForm.feedback_price} onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback_price: e.target.value })} style={inputStyle}>
                      <option value="">Price feedback…</option>
                      <option value="too_high">Too high</option>
                      <option value="fair">Fair</option>
                      <option value="good_value">Good value</option>
                    </select>
                    <select value={feedbackForm.feedback_size} onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback_size: e.target.value })} style={inputStyle}>
                      <option value="">Size feedback…</option>
                      <option value="too_small">Too small</option>
                      <option value="perfect">Perfect</option>
                      <option value="spacious">Spacious</option>
                    </select>
                  </div>

                  {/* Concern checkboxes */}
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
                    {[
                      { key: "feedback_laundry", label: "Laundry" },
                      { key: "feedback_parking", label: "Parking" },
                      { key: "feedback_location", label: "Location" },
                      { key: "feedback_layout", label: "Layout" },
                      { key: "feedback_utilities", label: "Utilities" },
                    ].map(({ key, label }) => (
                      <label key={key} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, cursor: "pointer" }}>
                        <input type="checkbox" checked={(feedbackForm as Record<string, unknown>)[key] as boolean}
                          onChange={(e) => setFeedbackForm({ ...feedbackForm, [key]: e.target.checked })} />
                        {label}
                      </label>
                    ))}
                  </div>

                  <input value={feedbackForm.next_action} onChange={(e) => setFeedbackForm({ ...feedbackForm, next_action: e.target.value })}
                    placeholder="Next action (e.g. Follow up in 2 days)"
                    style={{ ...inputStyle, width: "100%", boxSizing: "border-box", marginBottom: 8 }} />
                  <textarea value={feedbackForm.feedback_notes} onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback_notes: e.target.value })}
                    rows={2} placeholder="Additional notes…"
                    style={{ ...inputStyle, width: "100%", boxSizing: "border-box", resize: "vertical", marginBottom: 12 }} />
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => submitFeedback(s.id, s.lead_id)} disabled={saving}
                      style={{ backgroundColor: GREEN, color: "#fff", border: "none", borderRadius: 7, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      {saving ? "Saving…" : "Save Feedback"}
                    </button>
                    <button onClick={() => setFeedbackId(null)} style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 7, padding: "9px 14px", fontSize: 13, cursor: "pointer", color: TEXT_MUT }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Applications Tab ───────────────────────────────────────────────────────
function ApplicationsTab({ lp, onEdit }: { lp: LeasingProperty; onEdit: () => void }) {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/leasing/properties/${lp.id}/applications`).catch(() => null);
    if (res?.ok) setApps(await res.json());
    setLoading(false);
  }, [lp.id]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  const STAGE_LABELS_APP: Record<string, { label: string; bg: string; text: string }> = {
    LINK_SENT:              { label: "Link Sent", bg: "#FEF3C7", text: "#92400E" },
    PRELIMINARY_SUBMITTED:  { label: "Submitted", bg: "#DBEAFE", text: "#1E40AF" },
    UNDER_REVIEW:           { label: "Under Review", bg: "#EDE9FE", text: "#5B21B6" },
    APPROVED:               { label: "Approved", bg: "#D1FAE5", text: "#065F46" },
    DECLINED:               { label: "Declined", bg: "#FEE2E2", text: "#991B1B" },
    WITHDRAWN:              { label: "Withdrawn", bg: "#F3F4F6", text: "#6B7280" },
  };

  async function updateApp(appId: string, updates: Record<string, unknown>) {
    await fetch(`/api/admin/leasing/properties/${lp.id}/applications`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: appId, ...updates }),
    });
    fetchApps();
    onEdit();
  }

  if (loading) return <p style={{ color: TEXT_MUT, fontSize: 14 }}>Loading…</p>;

  if (apps.length === 0) {
    return (
      <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 40, textAlign: "center" }}>
        <p style={{ fontSize: 14, color: TEXT_MUT, margin: "0 0 8px" }}>No applications yet.</p>
        <p style={{ fontSize: 13, color: TEXT_MUT, margin: 0 }}>Send Quick Apply links from the Showings tab after interested prospects complete their tour.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {apps.map((app) => {
        const st = STAGE_LABELS_APP[app.stage] ?? { label: app.stage, bg: BG, text: TEXT_MUT };
        return (
          <div key={app.id} style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{app.legal_name ?? app.lead?.name ?? "—"}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, borderRadius: 20, padding: "2px 10px", backgroundColor: st.bg, color: st.text }}>{st.label}</span>
                </div>
                <p style={{ fontSize: 12, color: TEXT_MUT, margin: 0 }}>
                  {app.email}
                  {app.phone && ` · ${app.phone}`}
                  {app.preliminary_submitted_at && ` · Submitted ${fmtDate(app.preliminary_submitted_at)}`}
                </p>
              </div>

              {app.stage === "PRELIMINARY_SUBMITTED" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => updateApp(app.id, { stage: "UNDER_REVIEW" })}
                    style={{ fontSize: 12, backgroundColor: "#1F2F3A", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontWeight: 600 }}>
                    Start Review
                  </button>
                </div>
              )}
              {app.stage === "UNDER_REVIEW" && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => updateApp(app.id, { stage: "APPROVED", recommendation: "approve" })}
                    style={{ fontSize: 12, backgroundColor: GREEN, color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontWeight: 600 }}>
                    Approve
                  </button>
                  <button onClick={() => updateApp(app.id, { stage: "DECLINED", recommendation: "decline" })}
                    style={{ fontSize: 12, background: "none", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "6px 12px", cursor: "pointer", color: ACCENT }}>
                    Decline
                  </button>
                </div>
              )}
            </div>

            {/* Key metrics from application */}
            {app.stage !== "LINK_SENT" && (
              <div style={{ display: "flex", gap: 16, padding: "10px 14px", backgroundColor: BG, borderRadius: 8 }}>
                {[
                  { label: "Employment", value: app.employment_status?.replace("_", " ") ?? "—" },
                  { label: "Monthly Income", value: app.approx_monthly_income ? `$${Number(app.approx_monthly_income).toLocaleString()}` : "—" },
                  { label: "Income Ratio", value: app.income_ratio ? `${app.income_ratio}x` : "—" },
                  { label: "Occupants", value: String(app.num_occupants ?? "—") },
                  { label: "Pets", value: app.has_pets ? "Yes" : "No" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 11, color: TEXT_MUT, margin: 0 }}>{label}</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: app.income_ratio && label === "Income Ratio" ? (app.income_ratio >= 3 ? GREEN : app.income_ratio >= 2.5 ? AMBER : ACCENT) : TEXT, margin: "2px 0 0" }}>{value}</p>
                  </div>
                ))}
              </div>
            )}

            {app.stage === "LINK_SENT" && (
              <p style={{ fontSize: 13, color: TEXT_MUT, margin: 0, fontStyle: "italic" }}>
                Apply link sent — waiting for applicant to fill out the form.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Marketing Tab ──────────────────────────────────────────────────────────
function MarketingTab({ lp, onEdit }: { lp: LeasingProperty; onEdit: () => void }) {
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Channel>>({});
  const [newChannel, setNewChannel] = useState({ channel_name: "", url: "" });
  const [showAdd, setShowAdd] = useState(false);

  async function toggleActive(channel: Channel) {
    await fetch(`/api/admin/leasing/properties/${lp.id}/channels`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: channel.id, active: !channel.active }),
    });
    onEdit();
  }

  async function saveEdit(channelId: string) {
    await fetch(`/api/admin/leasing/properties/${lp.id}/channels`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: channelId, ...editData }),
    });
    setEditId(null);
    onEdit();
  }

  async function addChannel() {
    if (!newChannel.channel_name.trim()) return;
    await fetch(`/api/admin/leasing/properties/${lp.id}/channels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newChannel),
    });
    setNewChannel({ channel_name: "", url: "" });
    setShowAdd(false);
    onEdit();
  }

  const totalViews = lp.channels.reduce((s, c) => s + c.views_total, 0);
  const totalLeadsFromChannels = lp.channels.reduce((s, c) => s + c.leads_from_channel, 0);
  const activeCount = lp.channels.filter((c) => c.active).length;

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Active Channels", value: String(activeCount) },
          { label: "Total Views", value: String(totalViews) },
          { label: "Leads from Channels", value: String(totalLeadsFromChannels) },
        ].map((s) => (
          <div key={s.label} style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 18px", minWidth: 140 }}>
            <p style={{ fontSize: 11, color: TEXT_MUT, margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: TEXT, margin: "6px 0 0" }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: TEXT, margin: 0 }}>Channels</h3>
        <button onClick={() => setShowAdd(!showAdd)} style={{ fontSize: 12, color: ACCENT, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>+ Add Channel</button>
      </div>

      {showAdd && (
        <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16, marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <input value={newChannel.channel_name} onChange={(e) => setNewChannel({ ...newChannel, channel_name: e.target.value })} placeholder="Channel name" style={{ ...inputStyle, flex: 1 }} />
            <input value={newChannel.url} onChange={(e) => setNewChannel({ ...newChannel, url: e.target.value })} placeholder="URL (optional)" style={{ ...inputStyle, flex: 2 }} />
            <button onClick={addChannel} style={{ backgroundColor: ACCENT, color: "#fff", border: "none", borderRadius: 7, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Add</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {lp.channels.map((ch) => (
          <div key={ch.id} style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 16px" }}>
            {editId === ch.id ? (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <input value={editData.url ?? ch.url ?? ""} onChange={(e) => setEditData({ ...editData, url: e.target.value })} placeholder="Listing URL" style={{ ...inputStyle, flex: 2, minWidth: 200 }} />
                <input type="number" value={editData.views_today ?? ch.views_today} onChange={(e) => setEditData({ ...editData, views_today: Number(e.target.value) })} placeholder="Views today" style={{ ...inputStyle, width: 120 }} />
                <input type="number" value={editData.leads_from_channel ?? ch.leads_from_channel} onChange={(e) => setEditData({ ...editData, leads_from_channel: Number(e.target.value) })} placeholder="Leads" style={{ ...inputStyle, width: 100 }} />
                <button onClick={() => saveEdit(ch.id)} style={{ backgroundColor: GREEN, color: "#fff", border: "none", borderRadius: 7, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Save</button>
                <button onClick={() => setEditId(null)} style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 7, padding: "8px 12px", fontSize: 13, cursor: "pointer", color: TEXT_MUT }}>Cancel</button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button onClick={() => toggleActive(ch)} style={{ width: 36, height: 20, borderRadius: 10, border: "none", cursor: "pointer", backgroundColor: ch.active ? GREEN : BORDER, position: "relative", transition: "background-color 0.2s", flexShrink: 0 }}>
                    <span style={{ position: "absolute", top: 2, left: ch.active ? 18 : 2, width: 16, height: 16, borderRadius: "50%", backgroundColor: "#fff", transition: "left 0.2s" }} />
                  </button>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: ch.active ? TEXT : TEXT_MUT, margin: 0 }}>{ch.channel_name}</p>
                    {ch.url && <a href={ch.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: ACCENT, textDecoration: "none" }}>View listing →</a>}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: 0 }}>{ch.views_total}</p>
                    <p style={{ fontSize: 11, color: TEXT_MUT, margin: 0 }}>total views</p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: 0 }}>{ch.leads_from_channel}</p>
                    <p style={{ fontSize: 11, color: TEXT_MUT, margin: 0 }}>leads</p>
                  </div>
                  <button onClick={() => { setEditId(ch.id); setEditData({}); }} style={{ fontSize: 12, color: TEXT_MUT, background: "none", border: "none", cursor: "pointer" }}>Edit</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Comps Tab ──────────────────────────────────────────────────────────────
function CompsTab({ lp, onEdit }: { lp: LeasingProperty; onEdit: () => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ address: "", rent: "", bedrooms: "", bathrooms: "", amenities: "", source: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [comps, setComps] = useState<Comp[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComps = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/leasing/properties/${lp.id}/comps`).catch(() => null);
    if (res?.ok) setComps(await res.json());
    setLoading(false);
  }, [lp.id]);

  useEffect(() => { fetchComps(); }, [fetchComps]);

  async function addComp() {
    if (!form.rent) return;
    setSaving(true);
    await fetch(`/api/admin/leasing/properties/${lp.id}/comps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, rent: Number(form.rent), bedrooms: Number(form.bedrooms) || null, bathrooms: Number(form.bathrooms) || null }),
    });
    setForm({ address: "", rent: "", bedrooms: "", bathrooms: "", amenities: "", source: "", notes: "" });
    setShowAdd(false);
    setSaving(false);
    fetchComps();
    onEdit();
  }

  async function deleteComp(compId: string) {
    await fetch(`/api/admin/leasing/properties/${lp.id}/comps?comp_id=${compId}`, { method: "DELETE" });
    fetchComps();
  }

  const myRent = lp.asking_rent ?? lp.property.price ?? 0;
  const avgComp = comps.length > 0 ? Math.round(comps.reduce((s, c) => s + c.rent, 0) / comps.length) : null;
  const diff = avgComp ? myRent - avgComp : null;

  return (
    <div>
      {comps.length > 0 && (
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { label: "Your Asking Rent", value: myRent ? `$${myRent.toLocaleString()}` : "—", color: TEXT },
            { label: "Comp Average", value: avgComp ? `$${avgComp.toLocaleString()}` : "—", color: TEXT },
            { label: "vs Market", value: diff !== null ? `${diff > 0 ? "+" : ""}$${diff}` : "—", color: diff === null ? TEXT : Math.abs(diff) <= 100 ? GREEN : diff > 0 ? ACCENT : GREEN },
          ].map((s) => (
            <div key={s.label} style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 18px", minWidth: 140 }}>
              <p style={{ fontSize: 11, color: TEXT_MUT, margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: s.color, margin: "6px 0 0" }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: 0 }}>Market Comps</h2>
        <button onClick={() => setShowAdd(!showAdd)} style={{ backgroundColor: ACCENT, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Add Comp</button>
      </div>

      {showAdd && (
        <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20, marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: TEXT, margin: "0 0 14px" }}>Add Comparable</p>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 12 }}>
            <div><label style={labelStyle}>Address</label><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Example St" style={inputStyle} /></div>
            <div><label style={labelStyle}>Rent/mo *</label><input type="number" value={form.rent} onChange={(e) => setForm({ ...form, rent: e.target.value })} placeholder="1800" style={inputStyle} /></div>
            <div><label style={labelStyle}>Beds</label><input type="number" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} placeholder="2" style={inputStyle} /></div>
            <div><label style={labelStyle}>Baths</label><input type="number" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} placeholder="1" style={inputStyle} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
            <div><label style={labelStyle}>Source</label><input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Kijiji, Zumper…" style={inputStyle} /></div>
            <div><label style={labelStyle}>Amenities</label><input value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} placeholder="Parking, laundry…" style={inputStyle} /></div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={labelStyle}>Notes</label>
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes…" style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={addComp} disabled={saving || !form.rent} style={{ backgroundColor: ACCENT, color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {saving ? "Saving…" : "Add Comp"}
            </button>
            <button onClick={() => setShowAdd(false)} style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 7, padding: "9px 16px", fontSize: 13, cursor: "pointer", color: TEXT_MUT }}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? <p style={{ color: TEXT_MUT, fontSize: 14 }}>Loading…</p>
        : comps.length === 0 ? (
          <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 40, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: TEXT_MUT, margin: 0 }}>No comps added. Track competing listings to validate your pricing.</p>
          </div>
        ) : (
          <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
            {comps.sort((a, b) => a.rent - b.rent).map((comp, i) => (
              <div key={comp.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: i < comps.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>${comp.rent.toLocaleString()}</span>
                    {myRent && <span style={{ fontSize: 11, color: comp.rent > myRent ? GREEN : comp.rent < myRent ? ACCENT : TEXT_MUT }}>{comp.rent > myRent ? `$${comp.rent - myRent} above` : comp.rent < myRent ? `$${myRent - comp.rent} below` : "Same"}</span>}
                  </div>
                  {comp.address && <p style={{ fontSize: 13, color: TEXT_SEC, margin: "3px 0 0" }}>{comp.address}</p>}
                  <p style={{ fontSize: 12, color: TEXT_MUT, margin: "2px 0 0" }}>
                    {comp.bedrooms && `${comp.bedrooms}bd`}{comp.bathrooms && ` · ${comp.bathrooms}ba`}
                    {comp.amenities && ` · ${comp.amenities}`}
                    {comp.source && ` · via ${comp.source}`}
                  </p>
                </div>
                <button onClick={() => deleteComp(comp.id)} style={{ fontSize: 12, color: TEXT_MUT, background: "none", border: "none", cursor: "pointer", padding: "4px 8px" }}>✕</button>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}

// ── Activity Tab ───────────────────────────────────────────────────────────
function ActivityTab({ lpId }: { lpId: string }) {
  const [events, setEvents] = useState<LeasingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const PAGE_SIZE = 30;

  const fetchEvents = useCallback(async (offset = 0) => {
    setLoading(true);
    const res = await fetch(`/api/admin/leasing/properties/${lpId}/events?limit=${PAGE_SIZE + 1}&offset=${offset}`).catch(() => null);
    if (res?.ok) {
      const data: LeasingEvent[] = await res.json();
      setHasMore(data.length > PAGE_SIZE);
      setEvents(offset === 0 ? data.slice(0, PAGE_SIZE) : (prev) => [...prev, ...data.slice(0, PAGE_SIZE)]);
    }
    setLoading(false);
  }, [lpId]);

  useEffect(() => { fetchEvents(0); setPage(0); }, [fetchEvents]);

  async function addNote() {
    if (!note.trim()) return;
    setSaving(true);
    await fetch(`/api/admin/leasing/properties/${lpId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_type: "NOTE", actor: "Admin", note: note.trim() }),
    });
    setNote("");
    setSaving(false);
    fetchEvents(0);
  }

  function formatEventType(type: string): string {
    return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return (
    <div style={{ maxWidth: 700 }}>
      {/* Add note */}
      <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addNote()}
            placeholder="Log a note or observation…"
            style={{ ...inputStyle, flex: 1 }}
          />
          <button onClick={addNote} disabled={saving || !note.trim()} style={{ backgroundColor: ACCENT, color: "#fff", border: "none", borderRadius: 7, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: !note.trim() ? 0.5 : 1 }}>
            {saving ? "Saving…" : "Add Note"}
          </button>
        </div>
      </div>

      {/* Events list */}
      {loading && events.length === 0 ? (
        <p style={{ color: TEXT_MUT, fontSize: 14 }}>Loading activity…</p>
      ) : events.length === 0 ? (
        <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 40, textAlign: "center" }}>
          <p style={{ fontSize: 14, color: TEXT_MUT, margin: 0 }}>No activity recorded yet.</p>
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          {/* Timeline line */}
          <div style={{ position: "absolute", left: 19, top: 0, bottom: 0, width: 2, backgroundColor: BORDER }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {events.map((event) => (
              <div key={event.id} style={{ display: "flex", gap: 14, paddingBottom: 16, position: "relative" }}>
                {/* Icon bubble */}
                <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: SURFACE, border: `2px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14, zIndex: 1 }}>
                  {EVENT_ICONS[event.event_type] ?? "•"}
                </div>
                <div style={{ flex: 1, paddingTop: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{formatEventType(event.event_type)}</span>
                    <span style={{ fontSize: 11, color: TEXT_MUT }}>{event.actor}</span>
                    <span style={{ fontSize: 11, color: TEXT_MUT, marginLeft: "auto" }}>{fmtRelative(event.created_at)}</span>
                  </div>
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <p style={{ fontSize: 12, color: TEXT_SEC, margin: 0 }}>
                      {event.event_type === "NOTE" && typeof event.metadata.note === "string"
                        ? event.metadata.note
                        : Object.entries(event.metadata)
                            .filter(([, v]) => v !== null && v !== undefined && v !== "")
                            .slice(0, 3)
                            .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`)
                            .join(" · ")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <button
              onClick={() => { const next = page + 1; setPage(next); fetchEvents(next * PAGE_SIZE); }}
              style={{ width: "100%", padding: "10px", marginTop: 8, backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13, color: TEXT_MUT, cursor: "pointer" }}
            >
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Shared styles ──────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  border: `1px solid #E5E1DC`,
  borderRadius: 7,
  padding: "8px 12px",
  fontSize: 13,
  backgroundColor: "#F7F5F2",
  color: "#1F2F3A",
  fontFamily: "inherit",
  width: "100%",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#999999",
  display: "block",
  marginBottom: 4,
};
