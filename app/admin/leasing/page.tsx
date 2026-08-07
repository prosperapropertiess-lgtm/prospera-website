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
interface LeasingProperty {
  id: string;
  status: string;
  vacant_since: string | null;
  asking_rent: number | null;
  target_rent: number | null;
  notes: string | null;
  property: { id: string; address: string; city: string; bedrooms: number; bathrooms: number; price: number; images: string[] | null; slug: string | null };
  checklist: { id: string; completed: boolean }[];
  leads: { id: string; stage: string }[];
  showings: { id: string; status: string }[];
  channels: { id: string; active: boolean }[];
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

// ── Helpers ────────────────────────────────────────────────────────────────
function daysVacant(since: string | null): number {
  if (!since) return 0;
  return Math.floor((Date.now() - new Date(since).getTime()) / 86400000);
}

function readinessScore(lp: LeasingProperty): number {
  let score = 0;
  const total = lp.checklist.length;
  const done = lp.checklist.filter((c) => c.completed).length;
  if (total > 0) score += Math.round((done / total) * 30); // 30pts
  const hasPhotos = lp.property?.images && lp.property.images.length > 0;
  if (hasPhotos) score += 15; // 15pts
  const activeChannels = lp.channels.filter((c) => c.active).length;
  score += Math.min(activeChannels * 5, 25); // 25pts max
  const leadCount = lp.leads.length;
  if (leadCount >= 1) score += 5;
  if (leadCount >= 3) score += 5;
  if (leadCount >= 6) score += 5; // 15pts max
  const completedShowings = lp.showings.filter((s) => s.status === "completed").length;
  if (completedShowings >= 1) score += 8;
  if (completedShowings >= 3) score += 7; // 15pts max
  return Math.min(score, 100);
}

function scoreColor(score: number): string {
  if (score >= 70) return GREEN;
  if (score >= 40) return AMBER;
  return ACCENT;
}

const STATUS_LABELS: Record<string, string> = {
  preparing: "Preparing",
  listed: "Listed",
  receiving_leads: "Receiving Leads",
  showing_scheduled: "Showing Scheduled",
  applications_reviewing: "Reviewing Apps",
  approved: "Approved",
  leased: "Leased",
  problem: "Problem",
};

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

const PRIORITY_COLORS: Record<string, string> = {
  urgent: ACCENT, high: AMBER, medium: "#2563EB", low: TEXT_MUT,
};

function diagnosisInsight(lp: LeasingProperty): string | null {
  const leads = lp.leads.length;
  const showings = lp.showings.filter((s) => s.status === "completed").length;
  const apps = lp.leads.filter((l) => l.stage === "application_received" || l.stage === "approved" || l.stage === "leased").length;
  const activeChannels = lp.channels.filter((c) => c.active).length;
  const days = daysVacant(lp.vacant_since);

  if (activeChannels === 0 && days > 3) return "No marketing channels active. List on Kijiji and Facebook today.";
  if (leads === 0 && days > 7) return "No leads after 7 days. Review photos, description, and pricing.";
  if (leads >= 5 && showings === 0) return "Leads coming in but no showings. Improve response speed.";
  if (showings >= 3 && apps === 0) return "Showings done but no applications. Review pricing and objections.";
  if (apps >= 1 && lp.status === "applications_reviewing") return "Application in review — make a decision.";
  return null;
}

// ── Component ──────────────────────────────────────────────────────────────
export default function LeasingDashboard() {
  const router = useRouter();
  const [lps, setLps] = useState<LeasingProperty[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ property_id: "", vacant_since: new Date().toISOString().split("T")[0], asking_rent: "", target_rent: "" });

  const load = useCallback(async () => {
    setLoading(true);
    const [lpsRes, tasksRes, propsRes] = await Promise.all([
      fetch("/api/admin/leasing/properties").then((r) => r.json()).catch(() => []),
      fetch("/api/admin/leasing/tasks?today=true").then((r) => r.json()).catch(() => []),
      fetch("/api/admin/properties").then((r) => r.json()).catch(() => []),
    ]);
    setLps(Array.isArray(lpsRes) ? lpsRes : []);
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

  const activeVacancies = lps.filter((l) => l.status !== "leased");
  const totalLeads = lps.reduce((s, l) => s + l.leads.length, 0);
  const totalShowings = lps.reduce((s, l) => s + l.showings.filter((sh) => sh.status === "completed").length, 0);

  return (
    <div style={{ backgroundColor: BG, minHeight: "100vh", fontFamily: "var(--font-poppins, sans-serif)" }}>
      {/* Header */}
      <div style={{ backgroundColor: SURFACE, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/admin/dashboard" style={{ color: TEXT_MUT, fontSize: 13, textDecoration: "none" }}>← Admin</Link>
            <span style={{ color: BORDER }}>·</span>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: TEXT, margin: 0 }}>Leasing Command</h1>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            style={{ backgroundColor: ACCENT, color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            + Add Vacant Property
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px" }}>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Vacant Properties", value: activeVacancies.length, sub: "actively tracking" },
            { label: "Total Leads", value: totalLeads, sub: "across all properties" },
            { label: "Showings Done", value: totalShowings, sub: "completed" },
            { label: "Tasks Due Today", value: tasks.length, sub: "open items", accent: tasks.length > 0 },
          ].map((stat) => (
            <div key={stat.label} style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px 20px" }}>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: TEXT_MUT, marginBottom: 6 }}>{stat.label}</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: stat.accent ? ACCENT : TEXT, margin: 0 }}>{stat.value}</p>
              <p style={{ fontSize: 12, color: TEXT_SEC, marginTop: 4 }}>{stat.sub}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>

          {/* Vacancy list */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: 0 }}>Vacant Properties</h2>
              <span style={{ fontSize: 12, color: TEXT_MUT }}>{activeVacancies.length} properties</span>
            </div>

            {loading ? (
              <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 40, textAlign: "center", color: TEXT_MUT }}>Loading…</div>
            ) : activeVacancies.length === 0 ? (
              <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 40, textAlign: "center" }}>
                <p style={{ color: TEXT_MUT, marginBottom: 12 }}>No vacant properties tracked.</p>
                <button onClick={() => setShowAdd(true)} style={{ color: ACCENT, background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>Add first property →</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {activeVacancies.map((lp) => {
                  const score = readinessScore(lp);
                  const days = daysVacant(lp.vacant_since);
                  const st = STATUS_COLORS[lp.status] || STATUS_COLORS.preparing;
                  const insight = diagnosisInsight(lp);
                  const activeLeads = lp.leads.filter((l) => !["rejected", "leased"].includes(l.stage)).length;

                  return (
                    <Link key={lp.id} href={`/admin/leasing/${lp.id}`} style={{ textDecoration: "none" }}>
                      <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "18px 20px", cursor: "pointer", transition: "box-shadow 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)")}
                        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {lp.property?.address}, {lp.property?.city}
                              </span>
                              <span style={{ fontSize: 11, fontWeight: 600, borderRadius: 20, padding: "2px 10px", backgroundColor: st.bg, color: st.text, whiteSpace: "nowrap" }}>
                                {STATUS_LABELS[lp.status]}
                              </span>
                            </div>
                            <p style={{ fontSize: 12, color: TEXT_SEC, margin: 0 }}>
                              {lp.property?.bedrooms}bd · {lp.property?.bathrooms}ba
                              {lp.asking_rent ? ` · $${lp.asking_rent.toLocaleString()}/mo` : ""}
                              {days > 0 ? ` · ${days} day${days !== 1 ? "s" : ""} vacant` : ""}
                            </p>
                          </div>

                          {/* Readiness score */}
                          <div style={{ textAlign: "center", minWidth: 52 }}>
                            <div style={{ width: 52, height: 52, borderRadius: "50%", border: `3px solid ${scoreColor(score)}`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                              <span style={{ fontSize: 15, fontWeight: 800, color: scoreColor(score) }}>{score}</span>
                            </div>
                            <p style={{ fontSize: 10, color: TEXT_MUT, marginTop: 2 }}>score</p>
                          </div>
                        </div>

                        {/* Metrics row */}
                        <div style={{ display: "flex", gap: 16, marginBottom: insight ? 12 : 0 }}>
                          {[
                            { label: "Leads", value: activeLeads },
                            { label: "Showings", value: lp.showings.filter((s) => s.status === "completed").length },
                            { label: "Channels", value: `${lp.channels.filter((c) => c.active).length}/${lp.channels.length}` },
                            { label: "Checklist", value: `${lp.checklist.filter((c) => c.completed).length}/${lp.checklist.length}` },
                          ].map((m) => (
                            <div key={m.label} style={{ textAlign: "center" }}>
                              <p style={{ fontSize: 16, fontWeight: 700, color: TEXT, margin: 0 }}>{m.value}</p>
                              <p style={{ fontSize: 10, color: TEXT_MUT, margin: 0 }}>{m.label}</p>
                            </div>
                          ))}
                        </div>

                        {/* Diagnosis insight */}
                        {insight && (
                          <div style={{ backgroundColor: "#FFF9F0", border: "1px solid #FDE68A", borderRadius: 8, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 14 }}>⚠</span>
                            <p style={{ fontSize: 12, color: "#92400E", margin: 0, fontWeight: 500 }}>{insight}</p>
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
