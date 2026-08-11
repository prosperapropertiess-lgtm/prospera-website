"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ── Theme ──────────────────────────────────────────────────────────────────
const BG = "#F7F5F2";
const SURFACE = "#FFFFFF";
const BORDER = "#E5E1DC";
const TEXT = "#1F2F3A";
const TEXT_SEC = "#666666";
const TEXT_MUT = "#999999";
const ACCENT = "#8B2030";
const GREEN = "#2D7A4F";
const AMBER = "#B45309";

// ── Types ──────────────────────────────────────────────────────────────────
interface CampaignMetrics {
  days_vacant: number;
  vacancy_loss: number;
  leads_count: number;
  showings_count: number;
  applications_count: number;
  uncontacted_leads: number;
  tasks_due_today: number;
}

interface Campaign {
  id: string;
  stage: string;
  status: string;
  vacant_since: string | null;
  asking_rent: number | null;
  campaign_name: string | null;
  property: { id: string; address: string; city: string; bedrooms: number; bathrooms: number; images: string[] | null };
  metrics: CampaignMetrics;
  diagnostics: string[];
  risk: "high" | "medium" | "low";
}

interface Task {
  id: string;
  title: string;
  priority: string;
  due_date: string | null;
  property: { id: string; property: { address: string; city: string } } | null;
}

interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
}

// ── Stage display ──────────────────────────────────────────────────────────
const STAGE_LABELS: Record<string, string> = {
  PREPARATION: "Preparing",
  MARKET_READY: "Market Ready",
  ACTIVE_MARKETING: "Marketing",
  LEADS_ACTIVE: "Leads Coming In",
  SHOWINGS_ACTIVE: "Showings",
  APPLICATIONS_REVIEW: "Reviewing Apps",
  APPROVED: "Approved",
  LEASE_SIGNING: "Lease Signing",
  MOVE_IN: "Move-In",
  CLOSED: "Leased",
  // Legacy
  preparing: "Preparing",
  listed: "Listed",
  receiving_leads: "Receiving Leads",
  showing_scheduled: "Showing Scheduled",
  applications_reviewing: "Reviewing Apps",
  approved: "Approved",
  leased: "Leased",
  problem: "Problem",
};

const STAGE_COLORS: Record<string, { bg: string; text: string }> = {
  PREPARATION:           { bg: "#FEF3C7", text: "#92400E" },
  MARKET_READY:          { bg: "#DBEAFE", text: "#1E40AF" },
  ACTIVE_MARKETING:      { bg: "#DBEAFE", text: "#1E40AF" },
  LEADS_ACTIVE:          { bg: "#D1FAE5", text: "#065F46" },
  SHOWINGS_ACTIVE:       { bg: "#EDE9FE", text: "#5B21B6" },
  APPLICATIONS_REVIEW:   { bg: "#FEE2E2", text: "#991B1B" },
  APPROVED:              { bg: "#D1FAE5", text: "#065F46" },
  LEASE_SIGNING:         { bg: "#D1FAE5", text: "#065F46" },
  MOVE_IN:               { bg: "#F0FDF4", text: "#166534" },
  CLOSED:                { bg: "#F0FDF4", text: "#166534" },
  // Legacy
  preparing:             { bg: "#FEF3C7", text: "#92400E" },
  listed:                { bg: "#DBEAFE", text: "#1E40AF" },
  receiving_leads:       { bg: "#D1FAE5", text: "#065F46" },
  showing_scheduled:     { bg: "#EDE9FE", text: "#5B21B6" },
  applications_reviewing:{ bg: "#FEE2E2", text: "#991B1B" },
  approved:              { bg: "#D1FAE5", text: "#065F46" },
  leased:                { bg: "#F0FDF4", text: "#166534" },
  problem:               { bg: "#FEE2E2", text: "#991B1B" },
};

const RISK_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  high:   { bg: "#FEF2F2", text: "#991B1B", dot: "#EF4444" },
  medium: { bg: "#FFFBEB", text: "#92400E", dot: "#F59E0B" },
  low:    { bg: "#F0FDF4", text: "#166534", dot: "#22C55E" },
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: ACCENT, high: AMBER, medium: "#2563EB", low: TEXT_MUT,
};

// ── Component ──────────────────────────────────────────────────────────────
export default function LeasingCommandCenter() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [totals, setTotals] = useState({ active_campaigns: 0, total_vacancy_loss: 0, total_uncontacted: 0, total_tasks_today: 0 });
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ property_id: "", vacant_since: new Date().toISOString().split("T")[0], asking_rent: "", target_rent: "" });

  const load = useCallback(async () => {
    setLoading(true);
    const [cmdRes, tasksRes, propsRes] = await Promise.all([
      fetch("/api/admin/leasing/command").then((r) => r.json()).catch(() => ({ campaigns: [], totals: {} })),
      fetch("/api/admin/leasing/tasks?today=true").then((r) => r.json()).catch(() => []),
      fetch("/api/admin/properties").then((r) => r.json()).catch(() => []),
    ]);
    setCampaigns(Array.isArray(cmdRes.campaigns) ? cmdRes.campaigns : []);
    setTotals(cmdRes.totals ?? {});
    setTasks(Array.isArray(tasksRes) ? tasksRes : []);
    setAllProperties(Array.isArray(propsRes) ? propsRes : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAddProperty() {
    if (!form.property_id) return;
    setSaving(true);
    const res = await fetch("/api/admin/leasing/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, asking_rent: Number(form.asking_rent) || null, target_rent: Number(form.target_rent) || null }),
    });
    if (res.ok) {
      const lp = await res.json();
      setShowAdd(false);
      setForm({ property_id: "", vacant_since: new Date().toISOString().split("T")[0], asking_rent: "", target_rent: "" });
      router.push(`/admin/leasing/${lp.id}`);
    }
    setSaving(false);
  }

  async function completeTask(taskId: string) {
    await fetch("/api/admin/leasing/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _action: "complete", task_id: taskId }),
    });
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }

  return (
    <div style={{ backgroundColor: BG, minHeight: "100vh", fontFamily: "var(--font-dm-sans, sans-serif)" }}>
      {/* Header */}
      <div style={{ backgroundColor: SURFACE, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/admin" style={{ color: TEXT_MUT, fontSize: 13, textDecoration: "none" }}>← Admin</Link>
            <span style={{ color: BORDER }}>·</span>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: TEXT, margin: 0 }}>Leasing Command</h1>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/admin/leasing/employees"
              style={{ fontSize: 13, color: TEXT_MUT, textDecoration: "none", border: `1px solid ${BORDER}`, borderRadius: 7, padding: "8px 14px", backgroundColor: SURFACE }}>
              Team
            </Link>
            <button
              onClick={() => setShowAdd(true)}
              style={{ backgroundColor: ACCENT, color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              + Add Vacancy
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Active Campaigns", value: totals.active_campaigns ?? campaigns.length, sub: "properties leasing now" },
            {
              label: "Vacancy Loss",
              value: `$${((totals.total_vacancy_loss ?? 0) / 1000).toFixed(1)}k`,
              sub: "estimated total cost",
              accent: (totals.total_vacancy_loss ?? 0) > 5000,
            },
            {
              label: "Uncontacted Leads",
              value: totals.total_uncontacted ?? 0,
              sub: "waiting 30+ min",
              accent: (totals.total_uncontacted ?? 0) > 0,
            },
            {
              label: "Tasks Due Today",
              value: totals.total_tasks_today ?? tasks.length,
              sub: "open items",
              accent: (totals.total_tasks_today ?? tasks.length) > 0,
            },
          ].map((stat) => (
            <div key={stat.label} style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px 20px" }}>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: TEXT_MUT, marginBottom: 6 }}>{stat.label}</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: stat.accent ? ACCENT : TEXT, margin: 0 }}>{stat.value}</p>
              <p style={{ fontSize: 12, color: TEXT_SEC, marginTop: 4 }}>{stat.sub}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>

          {/* Campaign list */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: 0 }}>Active Campaigns</h2>
              <span style={{ fontSize: 12, color: TEXT_MUT }}>{campaigns.length} properties</span>
            </div>

            {loading ? (
              <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 40, textAlign: "center", color: TEXT_MUT }}>
                Loading campaigns…
              </div>
            ) : campaigns.length === 0 ? (
              <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 40, textAlign: "center" }}>
                <p style={{ color: TEXT_MUT, marginBottom: 12 }}>No active campaigns.</p>
                <button onClick={() => setShowAdd(true)} style={{ color: ACCENT, background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
                  Add first vacancy →
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {campaigns.map((c) => {
                  const stage = c.stage ?? c.status;
                  const sc = STAGE_COLORS[stage] ?? STAGE_COLORS.preparing;
                  const rc = RISK_COLORS[c.risk] ?? RISK_COLORS.low;
                  const m = c.metrics;

                  return (
                    <Link key={c.id} href={`/admin/leasing/${c.id}`} style={{ textDecoration: "none" }}>
                      <div
                        style={{ backgroundColor: SURFACE, border: `1px solid ${c.risk === "high" ? "#FECACA" : BORDER}`, borderRadius: 12, padding: "18px 20px", cursor: "pointer", transition: "box-shadow 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)")}
                        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                      >
                        {/* Top row */}
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>
                                {c.property?.address}, {c.property?.city}
                              </span>
                              <span style={{ fontSize: 11, fontWeight: 600, borderRadius: 20, padding: "2px 10px", backgroundColor: sc.bg, color: sc.text, whiteSpace: "nowrap" }}>
                                {STAGE_LABELS[stage] ?? stage}
                              </span>
                              {m.uncontacted_leads > 0 && (
                                <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: "#FEF2F2", color: "#991B1B", borderRadius: 20, padding: "2px 8px" }}>
                                  {m.uncontacted_leads} uncontacted
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: 12, color: TEXT_SEC, margin: 0 }}>
                              {c.property?.bedrooms}bd · {c.property?.bathrooms}ba
                              {c.asking_rent ? ` · $${Number(c.asking_rent).toLocaleString()}/mo` : ""}
                              {m.days_vacant > 0 ? ` · ${m.days_vacant}d vacant` : ""}
                            </p>
                          </div>

                          {/* Risk + vacancy loss */}
                          <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4, justifyContent: "flex-end" }}>
                              <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: rc.dot, display: "inline-block" }} />
                              <span style={{ fontSize: 11, fontWeight: 600, color: rc.text, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                {c.risk} risk
                              </span>
                            </div>
                            {m.vacancy_loss > 0 && (
                              <p style={{ fontSize: 12, color: ACCENT, fontWeight: 600, margin: 0 }}>
                                −${m.vacancy_loss.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Metrics row */}
                        <div style={{ display: "flex", gap: 20, marginBottom: c.diagnostics.length > 0 ? 12 : 0 }}>
                          {[
                            { label: "Leads", value: m.leads_count },
                            { label: "Showings", value: m.showings_count },
                            { label: "Applications", value: m.applications_count },
                            { label: "Tasks Today", value: m.tasks_due_today, accent: m.tasks_due_today > 0 },
                          ].map((metric) => (
                            <div key={metric.label} style={{ textAlign: "center" }}>
                              <p style={{ fontSize: 16, fontWeight: 700, color: metric.accent ? AMBER : TEXT, margin: 0 }}>{metric.value}</p>
                              <p style={{ fontSize: 10, color: TEXT_MUT, margin: 0 }}>{metric.label}</p>
                            </div>
                          ))}
                        </div>

                        {/* Diagnostics */}
                        {c.diagnostics.length > 0 && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {c.diagnostics.map((d, i) => (
                              <div key={i} style={{ backgroundColor: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 7, padding: "6px 12px", display: "flex", alignItems: "center", gap: 7 }}>
                                <span style={{ fontSize: 12 }}>⚠</span>
                                <p style={{ fontSize: 12, color: "#92400E", margin: 0, fontWeight: 500 }}>{d}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Daily tasks sidebar */}
          <div>
            <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${BORDER}`, backgroundColor: "#FAFAF9" }}>
                <h2 style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: 0 }}>Today&apos;s Actions</h2>
                <p style={{ fontSize: 11, color: TEXT_MUT, margin: "2px 0 0" }}>{tasks.length} open task{tasks.length !== 1 ? "s" : ""}</p>
              </div>
              <div style={{ maxHeight: 520, overflowY: "auto" }}>
                {tasks.length === 0 ? (
                  <div style={{ padding: "32px 18px", textAlign: "center", color: TEXT_MUT, fontSize: 13 }}>
                    All clear — no tasks due today.
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} style={{ padding: "12px 18px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <button
                        onClick={() => completeTask(task.id)}
                        style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${BORDER}`, backgroundColor: "transparent", cursor: "pointer", flexShrink: 0, marginTop: 2 }}
                        title="Mark complete"
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: TEXT, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</p>
                        {task.property && (
                          <p style={{ fontSize: 11, color: TEXT_MUT, margin: "2px 0 0" }}>
                            {task.property.property?.address}
                          </p>
                        )}
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, color: PRIORITY_COLORS[task.priority] || TEXT_MUT, textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0 }}>
                        {task.priority}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Property Modal */}
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ backgroundColor: SURFACE, borderRadius: 16, padding: 28, width: "100%", maxWidth: 480 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: TEXT, marginBottom: 20 }}>Add Vacant Property</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: TEXT_SEC, display: "block", marginBottom: 5 }}>Property</label>
                <select
                  value={form.property_id}
                  onChange={(e) => setForm((f) => ({ ...f, property_id: e.target.value }))}
                  style={{ width: "100%", padding: "10px 12px", border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 14, color: TEXT, backgroundColor: BG }}
                >
                  <option value="">Select a property…</option>
                  {allProperties.map((p) => (
                    <option key={p.id} value={p.id}>{p.address}, {p.city} ({p.bedrooms}bd)</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: TEXT_SEC, display: "block", marginBottom: 5 }}>Vacant Since</label>
                <input type="date" value={form.vacant_since} onChange={(e) => setForm((f) => ({ ...f, vacant_since: e.target.value }))}
                  style={{ width: "100%", padding: "10px 12px", border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 14, color: TEXT, backgroundColor: BG, boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: TEXT_SEC, display: "block", marginBottom: 5 }}>Asking Rent ($)</label>
                  <input type="number" placeholder="1800" value={form.asking_rent} onChange={(e) => setForm((f) => ({ ...f, asking_rent: e.target.value }))}
                    style={{ width: "100%", padding: "10px 12px", border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 14, color: TEXT, backgroundColor: BG, boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: TEXT_SEC, display: "block", marginBottom: 5 }}>Target Rent ($)</label>
                  <input type="number" placeholder="1750" value={form.target_rent} onChange={(e) => setForm((f) => ({ ...f, target_rent: e.target.value }))}
                    style={{ width: "100%", padding: "10px 12px", border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 14, color: TEXT, backgroundColor: BG, boxSizing: "border-box" }} />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
              <button onClick={() => setShowAdd(false)} style={{ padding: "10px 18px", border: `1px solid ${BORDER}`, borderRadius: 8, backgroundColor: "transparent", color: TEXT_SEC, cursor: "pointer", fontSize: 13 }}>Cancel</button>
              <button onClick={handleAddProperty} disabled={saving || !form.property_id}
                style={{ padding: "10px 20px", backgroundColor: ACCENT, color: "#fff", border: "none", borderRadius: 8, cursor: saving ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
                {saving ? "Creating…" : "Create & Open →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
