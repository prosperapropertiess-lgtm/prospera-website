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
  stage: string;
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
  next_action: string | null;
  feedback_notes: string | null;
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

interface LeasingProperty {
  id: string;
  status: string;
  vacant_since: string | null;
  asking_rent: number | null;
  target_rent: number | null;
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

// ── Constants ──────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: "preparing", label: "Preparing" },
  { value: "listed", label: "Listed" },
  { value: "receiving_leads", label: "Receiving Leads" },
  { value: "showing_scheduled", label: "Showing Scheduled" },
  { value: "applications_reviewing", label: "Reviewing Applications" },
  { value: "approved", label: "Approved" },
  { value: "leased", label: "Leased" },
  { value: "problem", label: "Problem" },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  preparing:               { bg: "#FEF3C7", text: "#92400E" },
  listed:                  { bg: "#DBEAFE", text: "#1E40AF" },
  receiving_leads:         { bg: "#D1FAE5", text: "#065F46" },
  showing_scheduled:       { bg: "#EDE9FE", text: "#5B21B6" },
  applications_reviewing:  { bg: "#FEE2E2", text: "#991B1B" },
  approved:                { bg: "#D1FAE5", text: "#065F46" },
  leased:                  { bg: "#F0FDF4", text: "#166534" },
  problem:                 { bg: "#FEE2E2", text: "#991B1B" },
};

const LEAD_STAGES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "showing_scheduled", label: "Showing Scheduled" },
  { value: "showing_completed", label: "Showing Done" },
  { value: "application_received", label: "Application Received" },
  { value: "approved", label: "Approved" },
  { value: "dead", label: "Dead" },
];

const CHECKLIST_CATEGORIES = ["exterior", "interior", "systems", "docs", "marketing", "admin"];

const COMM_TYPES = ["call", "text", "email", "note"];

// ── Helpers ────────────────────────────────────────────────────────────────
function daysVacant(since: string | null): number {
  if (!since) return 0;
  return Math.floor((Date.now() - new Date(since).getTime()) / 86400000);
}

function readinessScore(lp: LeasingProperty): number {
  let score = 0;
  const total = lp.checklist.length;
  const done = lp.checklist.filter((c) => c.completed).length;
  if (total > 0) score += Math.round((done / total) * 30);
  if (lp.property?.images && lp.property.images.length > 0) score += 15;
  const activeChannels = lp.channels.filter((c) => c.active).length;
  score += Math.min(activeChannels * 5, 25);
  const leadCount = lp.leads.length;
  if (leadCount >= 1) score += 5;
  if (leadCount >= 3) score += 5;
  if (leadCount >= 6) score += 5;
  const completedShowings = lp.showings.filter((s) => s.status === "completed").length;
  if (completedShowings >= 1) score += 8;
  if (completedShowings >= 3) score += 7;
  return Math.min(score, 100);
}

function scoreColor(score: number): string {
  if (score >= 70) return GREEN;
  if (score >= 40) return AMBER;
  return ACCENT;
}

function fmt(date: string): string {
  return new Date(date).toLocaleDateString("en-CA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function fmtDate(date: string): string {
  return new Date(date).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

// ── Tab types ──────────────────────────────────────────────────────────────
type Tab = "overview" | "checklist" | "leads" | "showings" | "marketing" | "comps";

// ── Main Component ─────────────────────────────────────────────────────────
export default function LeasingPropertyHub() {
  const { id } = useParams<{ id: string }>();
  const [lp, setLp] = useState<LeasingProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/leasing/properties/${id}`).catch(() => null);
    if (res?.ok) setLp(await res.json());
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function patchStatus(status: string) {
    setSaving("status");
    await fetch(`/api/admin/leasing/properties/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLp((prev) => prev ? { ...prev, status } : prev);
    setSaving(null);
  }

  async function patchRent(asking_rent: number | null, target_rent: number | null) {
    await fetch(`/api/admin/leasing/properties/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ asking_rent, target_rent }),
    });
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

  const score = readinessScore(lp);
  const days = daysVacant(lp.vacant_since);
  const sc = STATUS_COLORS[lp.status] ?? STATUS_COLORS.preparing;

  return (
    <div style={{ backgroundColor: BG, minHeight: "100vh", fontFamily: "var(--font-dm-sans, sans-serif)" }}>

      {/* Header */}
      <div style={{ backgroundColor: SURFACE, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <Link href="/admin/leasing" style={{ color: TEXT_MUT, fontSize: 13, textDecoration: "none" }}>← Leasing</Link>
            <span style={{ color: BORDER }}>·</span>
            <span style={{ fontSize: 13, color: TEXT_MUT }}>{lp.property.city}</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: TEXT, margin: 0 }}>{lp.property.address}</h1>
              <p style={{ fontSize: 13, color: TEXT_MUT, margin: "4px 0 0" }}>
                {lp.property.bedrooms}bd · {lp.property.bathrooms}ba · {lp.property.city}
                {lp.asking_rent ? ` · $${lp.asking_rent.toLocaleString()}/mo` : ""}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              {/* Score pill */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, backgroundColor: BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 12px" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", border: `3px solid ${scoreColor(score)}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: scoreColor(score) }}>{score}</span>
                </div>
                <span style={{ fontSize: 12, color: TEXT_MUT }}>Readiness</span>
              </div>
              {/* Days vacant */}
              <div style={{ fontSize: 13, color: days > 30 ? ACCENT : TEXT_MUT, fontWeight: days > 30 ? 600 : 400 }}>
                {days}d vacant
              </div>
              {/* Status selector */}
              <select
                value={lp.status}
                onChange={(e) => patchStatus(e.target.value)}
                disabled={saving === "status"}
                style={{
                  backgroundColor: sc.bg,
                  color: sc.text,
                  border: "none",
                  borderRadius: 6,
                  padding: "5px 10px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, marginTop: 16, borderBottom: `1px solid ${BORDER}` }}>
            {(["overview", "checklist", "leads", "showings", "marketing", "comps"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: "8px 16px",
                  fontSize: 13,
                  fontWeight: tab === t ? 600 : 400,
                  color: tab === t ? TEXT : TEXT_MUT,
                  background: "none",
                  border: "none",
                  borderBottom: tab === t ? `2px solid ${ACCENT}` : "2px solid transparent",
                  cursor: "pointer",
                  textTransform: "capitalize",
                  marginBottom: -1,
                }}
              >
                {t === "marketing" ? "Marketing" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>
        {tab === "overview" && <OverviewTab lp={lp} onEdit={load} patchRent={patchRent} />}
        {tab === "checklist" && <ChecklistTab lp={lp} onEdit={load} />}
        {tab === "leads" && <LeadsTab lp={lp} onEdit={load} />}
        {tab === "showings" && <ShowingsTab lp={lp} onEdit={load} />}
        {tab === "marketing" && <MarketingTab lp={lp} onEdit={load} />}
        {tab === "comps" && <CompsTab lp={lp} onEdit={load} />}
      </div>
    </div>
  );
}

// ── Overview Tab ───────────────────────────────────────────────────────────
function OverviewTab({
  lp,
  onEdit,
  patchRent,
}: {
  lp: LeasingProperty;
  onEdit: () => void;
  patchRent: (asking: number | null, target: number | null) => void;
}) {
  const [editRent, setEditRent] = useState(false);
  const [asking, setAsking] = useState(String(lp.asking_rent ?? ""));
  const [target, setTarget] = useState(String(lp.target_rent ?? ""));
  const [notes, setNotes] = useState(lp.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);

  const score = readinessScore(lp);
  const days = daysVacant(lp.vacant_since);
  const checkDone = lp.checklist.filter((c) => c.completed).length;
  const activeChannels = lp.channels.filter((c) => c.active).length;
  const completedShowings = lp.showings.filter((s) => s.status === "completed").length;
  const totalLeads = lp.leads.length;
  const lostCost = days * ((lp.asking_rent ?? lp.property.price) / 30);

  async function saveRent() {
    patchRent(Number(asking) || null, Number(target) || null);
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

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>

      {/* Left column */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { label: "Days Vacant", value: String(days), note: days > 30 ? "⚠ High" : undefined, color: days > 30 ? ACCENT : TEXT },
            { label: "Lost Revenue", value: `$${Math.round(lostCost).toLocaleString()}`, note: "estimated", color: days > 30 ? ACCENT : TEXT_MUT },
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

        {/* Readiness breakdown */}
        <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: TEXT, margin: 0 }}>Readiness Score</h3>
            <span style={{ fontSize: 22, fontWeight: 700, color: scoreColor(score) }}>{score}/100</span>
          </div>
          <div style={{ height: 6, backgroundColor: BG, borderRadius: 99, overflow: "hidden", marginBottom: 16 }}>
            <div style={{ height: "100%", width: `${score}%`, backgroundColor: scoreColor(score), borderRadius: 99, transition: "width 0.4s" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { label: "Checklist", detail: `${checkDone}/${lp.checklist.length} items`, max: 30, earned: lp.checklist.length > 0 ? Math.round((checkDone / lp.checklist.length) * 30) : 0 },
              { label: "Photos", detail: `${lp.property.images?.length ?? 0} uploaded`, max: 15, earned: (lp.property.images?.length ?? 0) > 0 ? 15 : 0 },
              { label: "Channels", detail: `${activeChannels} active`, max: 25, earned: Math.min(activeChannels * 5, 25) },
              { label: "Leads", detail: `${totalLeads} total`, max: 15, earned: totalLeads >= 6 ? 15 : totalLeads >= 3 ? 10 : totalLeads >= 1 ? 5 : 0 },
            ].map((r) => (
              <div key={r.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", backgroundColor: BG, borderRadius: 8 }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: TEXT, margin: 0 }}>{r.label}</p>
                  <p style={{ fontSize: 11, color: TEXT_MUT, margin: 0 }}>{r.detail}</p>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: r.earned === r.max ? GREEN : r.earned > 0 ? AMBER : TEXT_MUT }}>
                  {r.earned}/{r.max}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: TEXT, margin: "0 0 12px" }}>Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveNotes}
            rows={5}
            placeholder="Internal notes about this vacancy…"
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
              {lp.property.price && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: TEXT_MUT }}>Listed At</span>
                  <span style={{ fontSize: 13, color: TEXT_MUT }}>${lp.property.price.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lead funnel */}
        <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: TEXT, margin: "0 0 14px" }}>Lead Funnel</h3>
          {LEAD_STAGES.slice(0, 6).map((s) => {
            const count = lp.leads.filter((l) => l.stage === s.value).length;
            return (
              <div key={s.value} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: TEXT_SEC }}>{s.label}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 80, height: 4, backgroundColor: BG, borderRadius: 99, overflow: "hidden" }}>
                    {count > 0 && <div style={{ height: "100%", width: `${Math.min((count / Math.max(lp.leads.length, 1)) * 100, 100)}%`, backgroundColor: ACCENT, borderRadius: 99 }} />}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: count > 0 ? TEXT : TEXT_MUT, minWidth: 16, textAlign: "right" }}>{count}</span>
                </div>
              </div>
            );
          })}
        </div>

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
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{ maxWidth: 700 }}>
      {/* Progress */}
      <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ flex: 1, height: 8, backgroundColor: BG, borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, backgroundColor: pct === 100 ? GREEN : pct > 50 ? AMBER : ACCENT, borderRadius: 99, transition: "width 0.3s" }} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: TEXT, whiteSpace: "nowrap" }}>{done}/{total} complete</span>
      </div>

      {/* Items by category */}
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: TEXT_MUT, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>{cat}</p>
          <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
            {items.map((item, i) => (
              <div
                key={item.id}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                  borderBottom: i < items.length - 1 ? `1px solid ${BORDER}` : "none",
                  opacity: item.completed ? 0.6 : 1,
                }}
              >
                <button
                  onClick={() => toggle(item)}
                  style={{
                    width: 20, height: 20, borderRadius: 5,
                    border: `2px solid ${item.completed ? GREEN : BORDER}`,
                    backgroundColor: item.completed ? GREEN : "transparent",
                    cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {item.completed && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}
                </button>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, color: TEXT, margin: 0, textDecoration: item.completed ? "line-through" : "none" }}>{item.item}</p>
                  {item.completed_at && (
                    <p style={{ fontSize: 11, color: TEXT_MUT, margin: "2px 0 0" }}>Done {fmtDate(item.completed_at)}</p>
                  )}
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
          <select
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            style={{ border: `1px solid ${BORDER}`, borderRadius: 7, padding: "8px 10px", fontSize: 13, backgroundColor: BG, color: TEXT, flexShrink: 0 }}
          >
            {CHECKLIST_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="Item description…"
            style={{ flex: 1, border: `1px solid ${BORDER}`, borderRadius: 7, padding: "8px 12px", fontSize: 13, backgroundColor: BG, color: TEXT }}
          />
          <button
            onClick={addItem}
            disabled={adding || !newItem.trim()}
            style={{ backgroundColor: ACCENT, color: "#fff", border: "none", borderRadius: 7, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: !newItem.trim() ? 0.5 : 1 }}
          >
            Add
          </button>
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
    await fetch(`/api/admin/leasing/properties/${lp.id}/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _action: "update_stage", lead_id: leadId, stage }),
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

  const stageLabelMap = Object.fromEntries(LEAD_STAGES.map((s) => [s.value, s.label]));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: 0 }}>{lp.leads.length} Lead{lp.leads.length !== 1 ? "s" : ""}</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          style={{ backgroundColor: ACCENT, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          + Add Lead
        </button>
      </div>

      {/* Add lead form */}
      {showAdd && (
        <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20, marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: TEXT, margin: "0 0 14px" }}>New Lead</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: TEXT_MUT, display: "block", marginBottom: 4 }}>Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full name" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: TEXT_MUT, display: "block", marginBottom: 4 }}>Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(519) 000-0000" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: TEXT_MUT, display: "block", marginBottom: 4 }}>Email</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: TEXT_MUT, display: "block", marginBottom: 4 }}>Source</label>
              <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} style={inputStyle}>
                {["kijiji", "facebook", "word_of_mouth", "website", "realtor", "walk_in", "other"].map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 12, color: TEXT_MUT, display: "block", marginBottom: 4 }}>Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2} placeholder="Initial notes…" style={{ ...inputStyle, resize: "vertical", width: "100%", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={addLead} disabled={saving || !form.name.trim()}
              style={{ backgroundColor: ACCENT, color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {saving ? "Saving…" : "Add Lead"}
            </button>
            <button onClick={() => setShowAdd(false)}
              style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 7, padding: "9px 16px", fontSize: 13, cursor: "pointer", color: TEXT_MUT }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Lead list */}
      {lp.leads.length === 0 ? (
        <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 40, textAlign: "center" }}>
          <p style={{ fontSize: 14, color: TEXT_MUT, margin: 0 }}>No leads yet. Add the first one above.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {lp.leads.map((lead) => (
            <div key={lead.id} style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
              <div
                style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
              >
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
                    value={lead.stage}
                    onChange={(e) => { e.stopPropagation(); updateStage(lead.id, e.target.value); }}
                    onClick={(e) => e.stopPropagation()}
                    style={{ fontSize: 12, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "4px 8px", backgroundColor: BG, color: TEXT, cursor: "pointer" }}
                  >
                    {LEAD_STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <span style={{ color: TEXT_MUT, fontSize: 14 }}>{expandedLead === lead.id ? "▲" : "▼"}</span>
                </div>
              </div>

              {/* Expanded */}
              {expandedLead === lead.id && (
                <div style={{ borderTop: `1px solid ${BORDER}`, padding: "16px" }}>
                  {lead.notes && (
                    <p style={{ fontSize: 13, color: TEXT_SEC, backgroundColor: BG, borderRadius: 8, padding: "10px 12px", margin: "0 0 14px" }}>{lead.notes}</p>
                  )}
                  {/* Communication log */}
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
                  {/* Add comm */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <select value={commForm.type} onChange={(e) => setCommForm({ ...commForm, type: e.target.value })}
                      style={{ fontSize: 12, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "7px 10px", backgroundColor: BG, color: TEXT }}>
                      {COMM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select value={commForm.direction} onChange={(e) => setCommForm({ ...commForm, direction: e.target.value })}
                      style={{ fontSize: 12, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "7px 10px", backgroundColor: BG, color: TEXT }}>
                      <option value="inbound">Inbound</option>
                      <option value="outbound">Outbound</option>
                    </select>
                    <input value={commForm.body} onChange={(e) => setCommForm({ ...commForm, body: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && addComm(lead.id)}
                      placeholder="Log this interaction…"
                      style={{ flex: 1, minWidth: 200, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "7px 12px", fontSize: 13, backgroundColor: BG, color: TEXT }} />
                    <button onClick={() => addComm(lead.id)} disabled={!commForm.body.trim()}
                      style={{ backgroundColor: ACCENT, color: "#fff", border: "none", borderRadius: 6, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: !commForm.body.trim() ? 0.5 : 1 }}>
                      Log
                    </button>
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
  const [form, setForm] = useState({ lead_id: "", scheduled_at: "", notes: "" });
  const [feedbackForm, setFeedbackForm] = useState({ interested: true, main_objection: "", next_action: "", feedback_notes: "" });
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
    setFeedbackForm({ interested: true, main_objection: "", next_action: "", feedback_notes: "" });
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

  const activeLeads = lp.leads.filter((l) => !["dead", "leased"].includes(l.stage));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: 0 }}>{lp.showings.length} Showing{lp.showings.length !== 1 ? "s" : ""}</h2>
        <button onClick={() => setShowAdd(!showAdd)}
          style={{ backgroundColor: ACCENT, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          + Schedule Showing
        </button>
      </div>

      {/* Add showing */}
      {showAdd && (
        <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20, marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: TEXT, margin: "0 0 14px" }}>Schedule Showing</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: TEXT_MUT, display: "block", marginBottom: 4 }}>Lead (optional)</label>
              <select value={form.lead_id} onChange={(e) => setForm({ ...form, lead_id: e.target.value })} style={inputStyle}>
                <option value="">Walk-in / Unknown</option>
                {activeLeads.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: TEXT_MUT, display: "block", marginBottom: 4 }}>Date & Time *</label>
              <input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} style={inputStyle} />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 12, color: TEXT_MUT, display: "block", marginBottom: 4 }}>Notes</label>
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Pre-showing notes…" style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={addShowing} disabled={saving || !form.scheduled_at}
              style={{ backgroundColor: ACCENT, color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {saving ? "Saving…" : "Schedule"}
            </button>
            <button onClick={() => setShowAdd(false)}
              style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 7, padding: "9px 16px", fontSize: 13, cursor: "pointer", color: TEXT_MUT }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Showings list */}
      {lp.showings.length === 0 ? (
        <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 40, textAlign: "center" }}>
          <p style={{ fontSize: 14, color: TEXT_MUT, margin: 0 }}>No showings scheduled yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {lp.showings.map((s) => (
            <div key={s.id} style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px" }}>
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
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {s.status === "scheduled" && (
                    <>
                      <button onClick={() => setFeedbackId(s.id)}
                        style={{ fontSize: 12, backgroundColor: GREEN, color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontWeight: 600 }}>
                        Add Feedback
                      </button>
                      <button onClick={() => updateStatus(s.id, "no_show")}
                        style={{ fontSize: 12, background: "none", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "6px 12px", cursor: "pointer", color: TEXT_MUT }}>
                        No-show
                      </button>
                      <button onClick={() => updateStatus(s.id, "cancelled")}
                        style={{ fontSize: 12, background: "none", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "6px 12px", cursor: "pointer", color: TEXT_MUT }}>
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Feedback */}
              {s.status === "completed" && (s.interested !== null || s.main_objection || s.feedback_notes) && (
                <div style={{ marginTop: 12, padding: "10px 14px", backgroundColor: BG, borderRadius: 8 }}>
                  {s.interested !== null && (
                    <p style={{ fontSize: 13, margin: "0 0 4px", color: s.interested ? GREEN : ACCENT, fontWeight: 600 }}>
                      {s.interested ? "✓ Interested" : "✕ Not interested"}
                    </p>
                  )}
                  {s.main_objection && <p style={{ fontSize: 13, color: TEXT_SEC, margin: "0 0 4px" }}>Objection: {s.main_objection}</p>}
                  {s.next_action && <p style={{ fontSize: 13, color: TEXT_SEC, margin: "0 0 4px" }}>Next: {s.next_action}</p>}
                  {s.feedback_notes && <p style={{ fontSize: 13, color: TEXT_SEC, margin: 0 }}>{s.feedback_notes}</p>}
                </div>
              )}

              {/* Inline feedback form */}
              {feedbackId === s.id && (
                <div style={{ marginTop: 14, padding: 14, border: `1px solid ${BORDER}`, borderRadius: 8, backgroundColor: BG }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: "0 0 12px" }}>Post-Showing Feedback</p>
                  <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                    <button
                      onClick={() => setFeedbackForm({ ...feedbackForm, interested: true })}
                      style={{ flex: 1, padding: "8px", borderRadius: 7, border: `2px solid ${feedbackForm.interested ? GREEN : BORDER}`, backgroundColor: feedbackForm.interested ? "#D1FAE5" : SURFACE, color: feedbackForm.interested ? GREEN : TEXT_MUT, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                      Interested
                    </button>
                    <button
                      onClick={() => setFeedbackForm({ ...feedbackForm, interested: false })}
                      style={{ flex: 1, padding: "8px", borderRadius: 7, border: `2px solid ${!feedbackForm.interested ? ACCENT : BORDER}`, backgroundColor: !feedbackForm.interested ? "#FEE2E2" : SURFACE, color: !feedbackForm.interested ? ACCENT : TEXT_MUT, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                      Not Interested
                    </button>
                  </div>
                  <input value={feedbackForm.main_objection} onChange={(e) => setFeedbackForm({ ...feedbackForm, main_objection: e.target.value })}
                    placeholder="Main objection (price, layout, location…)"
                    style={{ ...inputStyle, width: "100%", boxSizing: "border-box", marginBottom: 8 }} />
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
                    <button onClick={() => setFeedbackId(null)}
                      style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 7, padding: "9px 14px", fontSize: 13, cursor: "pointer", color: TEXT_MUT }}>
                      Cancel
                    </button>
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

  async function updateViews(channelId: string, views_today: number) {
    await fetch(`/api/admin/leasing/properties/${lp.id}/channels`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: channelId, views_today }),
    });
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
        <button onClick={() => setShowAdd(!showAdd)}
          style={{ fontSize: 12, color: ACCENT, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
          + Add Channel
        </button>
      </div>

      {showAdd && (
        <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16, marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <input value={newChannel.channel_name} onChange={(e) => setNewChannel({ ...newChannel, channel_name: e.target.value })}
              placeholder="Channel name" style={{ ...inputStyle, flex: 1 }} />
            <input value={newChannel.url} onChange={(e) => setNewChannel({ ...newChannel, url: e.target.value })}
              placeholder="URL (optional)" style={{ ...inputStyle, flex: 2 }} />
            <button onClick={addChannel}
              style={{ backgroundColor: ACCENT, color: "#fff", border: "none", borderRadius: 7, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Add
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {lp.channels.map((ch) => (
          <div key={ch.id} style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 16px" }}>
            {editId === ch.id ? (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <input value={editData.url ?? ch.url ?? ""} onChange={(e) => setEditData({ ...editData, url: e.target.value })}
                  placeholder="Listing URL" style={{ ...inputStyle, flex: 2, minWidth: 200 }} />
                <input type="number" value={editData.views_today ?? ch.views_today} onChange={(e) => setEditData({ ...editData, views_today: Number(e.target.value) })}
                  placeholder="Views today" style={{ ...inputStyle, width: 120 }} />
                <input type="number" value={editData.leads_from_channel ?? ch.leads_from_channel} onChange={(e) => setEditData({ ...editData, leads_from_channel: Number(e.target.value) })}
                  placeholder="Leads from here" style={{ ...inputStyle, width: 130 }} />
                <button onClick={() => saveEdit(ch.id)} style={{ backgroundColor: GREEN, color: "#fff", border: "none", borderRadius: 7, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Save</button>
                <button onClick={() => setEditId(null)} style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 7, padding: "8px 12px", fontSize: 13, cursor: "pointer", color: TEXT_MUT }}>Cancel</button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Active toggle */}
                  <button
                    onClick={() => toggleActive(ch)}
                    style={{
                      width: 36, height: 20, borderRadius: 10, border: "none", cursor: "pointer",
                      backgroundColor: ch.active ? GREEN : BORDER,
                      position: "relative", transition: "background-color 0.2s", flexShrink: 0,
                    }}
                  >
                    <span style={{
                      position: "absolute", top: 2, left: ch.active ? 18 : 2,
                      width: 16, height: 16, borderRadius: "50%", backgroundColor: "#fff",
                      transition: "left 0.2s",
                    }} />
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
                  <button onClick={() => { setEditId(ch.id); setEditData({}); }}
                    style={{ fontSize: 12, color: TEXT_MUT, background: "none", border: "none", cursor: "pointer" }}>Edit</button>
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
    onEdit();
  }

  const myRent = lp.asking_rent ?? lp.property.price ?? 0;
  const avgComp = comps.length > 0 ? Math.round(comps.reduce((s, c) => s + c.rent, 0) / comps.length) : null;
  const diff = avgComp ? myRent - avgComp : null;

  return (
    <div>
      {/* Summary */}
      {comps.length > 0 && (
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { label: "Your Asking Rent", value: myRent ? `$${myRent.toLocaleString()}` : "—", color: TEXT },
            { label: "Comp Average", value: avgComp ? `$${avgComp.toLocaleString()}` : "—", color: TEXT },
            {
              label: "vs Market",
              value: diff !== null ? `${diff > 0 ? "+" : ""}$${diff}` : "—",
              color: diff === null ? TEXT : Math.abs(diff) <= 100 ? GREEN : diff > 0 ? ACCENT : GREEN,
            },
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
        <button onClick={() => setShowAdd(!showAdd)}
          style={{ backgroundColor: ACCENT, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          + Add Comp
        </button>
      </div>

      {showAdd && (
        <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20, marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: TEXT, margin: "0 0 14px" }}>Add Comparable</p>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: TEXT_MUT, display: "block", marginBottom: 4 }}>Address</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Example St" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: TEXT_MUT, display: "block", marginBottom: 4 }}>Rent/mo *</label>
              <input type="number" value={form.rent} onChange={(e) => setForm({ ...form, rent: e.target.value })} placeholder="1800" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: TEXT_MUT, display: "block", marginBottom: 4 }}>Beds</label>
              <input type="number" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} placeholder="2" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: TEXT_MUT, display: "block", marginBottom: 4 }}>Baths</label>
              <input type="number" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} placeholder="1" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: TEXT_MUT, display: "block", marginBottom: 4 }}>Source</label>
              <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Kijiji, Zumper…" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: TEXT_MUT, display: "block", marginBottom: 4 }}>Amenities</label>
              <input value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} placeholder="Parking, laundry…" style={inputStyle} />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 12, color: TEXT_MUT, display: "block", marginBottom: 4 }}>Notes</label>
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Additional notes…" style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={addComp} disabled={saving || !form.rent}
              style={{ backgroundColor: ACCENT, color: "#fff", border: "none", borderRadius: 7, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {saving ? "Saving…" : "Add Comp"}
            </button>
            <button onClick={() => setShowAdd(false)}
              style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 7, padding: "9px 16px", fontSize: 13, cursor: "pointer", color: TEXT_MUT }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: TEXT_MUT, fontSize: 14 }}>Loading…</p>
      ) : comps.length === 0 ? (
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
                  {myRent && (
                    <span style={{ fontSize: 11, color: comp.rent > myRent ? GREEN : comp.rent < myRent ? ACCENT : TEXT_MUT }}>
                      {comp.rent > myRent ? `$${comp.rent - myRent} above yours` : comp.rent < myRent ? `$${myRent - comp.rent} below yours` : "Same price"}
                    </span>
                  )}
                </div>
                {comp.address && <p style={{ fontSize: 13, color: TEXT_SEC, margin: "3px 0 0" }}>{comp.address}</p>}
                <p style={{ fontSize: 12, color: TEXT_MUT, margin: "2px 0 0" }}>
                  {comp.bedrooms && `${comp.bedrooms}bd`}{comp.bathrooms && ` · ${comp.bathrooms}ba`}
                  {comp.amenities && ` · ${comp.amenities}`}
                  {comp.source && ` · via ${comp.source}`}
                </p>
                {comp.notes && <p style={{ fontSize: 12, color: TEXT_MUT, margin: "2px 0 0", fontStyle: "italic" }}>{comp.notes}</p>}
              </div>
              <button onClick={() => deleteComp(comp.id)}
                style={{ fontSize: 12, color: TEXT_MUT, background: "none", border: "none", cursor: "pointer", padding: "4px 8px" }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Shared input style ─────────────────────────────────────────────────────
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
