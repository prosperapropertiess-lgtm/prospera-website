"use client";
import { useEffect, useState, useCallback } from "react";

const BG      = "#F7F5F2";
const NAV     = "#F7F5F2";
const SURFACE = "#FFFFFF";
const CARD    = "#FFFFFF";
const BORDER  = "#D8D2C8";
const TEXT    = "#222222";
const MUTED   = "#666666";
const HINT    = "#999999";
const ACCENT  = "#8B2030";
const GREEN   = "#059669";
const AMBER   = "#B45309";
const FONT    = "var(--font-dm-sans, sans-serif)";

const CATEGORY_COLORS: Record<string, string> = {
  content:     "#6366F1",
  social:      "#EC4899",
  email:       "#3B82F6",
  data:        "#10B981",
  crm:         "#F59E0B",
  intelligence:"#8B5CF6",
};

interface LastRun {
  status: string;
  ran_at: string;
  duration_ms: number | null;
  summary: Record<string, unknown> | null;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  schedule: string;
  category: string;
  lastRun: LastRun | null;
}

interface Stats {
  totalAgents: number;
  runsThisWeek: number;
  successRate: number | null;
  blogPosts: number;
  activeSubscribers: number;
  pendingSocialDrafts: number;
  lastMarketUpdate: string | null;
  lastNewsletterSlug: string | null;
}

interface RecentRun {
  agent: string;
  status: string;
  ran_at: string;
  duration_ms: number | null;
  summary: Record<string, unknown> | null;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function dur(ms: number | null): string {
  if (!ms) return "";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function StatusDot({ status }: { status: string | null }) {
  const color = status === "success" ? GREEN : status === "error" ? ACCENT : HINT;
  return (
    <span style={{
      display: "inline-block", width: 7, height: 7,
      borderRadius: "50%", backgroundColor: color,
      flexShrink: 0, marginTop: 1,
    }} />
  );
}

function AgentCard({ agent, onTrigger }: { agent: Agent; onTrigger: (id: string) => void }) {
  const catColor = CATEGORY_COLORS[agent.category] ?? HINT;
  const lastRun = agent.lastRun;
  const statusColor = lastRun?.status === "success" ? GREEN : lastRun?.status === "error" ? ACCENT : HINT;

  // Build a short metric line from summary
  function metricLine(): string | null {
    if (!lastRun?.summary) return null;
    const s = lastRun.summary;
    if (s.written) return `Wrote: ${s.writtenTitle ?? s.written}`;
    if (s.sent !== undefined) return `Sent to ${s.sent} subscribers`;
    if (s.postsGenerated) return `${s.postsGenerated} posts published`;
    return null;
  }
  const metric = metricLine();

  return (
    <div style={{
      background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14,
      padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{
              fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
              textTransform: "uppercase", color: catColor, fontFamily: FONT,
              background: `${catColor}18`, padding: "2px 7px", borderRadius: 4,
            }}>{agent.category}</span>
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: TEXT, fontFamily: FONT, margin: 0 }}>{agent.name}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
          <StatusDot status={lastRun?.status ?? null} />
          <span style={{ fontSize: 11, color: lastRun ? statusColor : HINT, fontFamily: FONT }}>
            {lastRun ? lastRun.status : "no data yet"}
          </span>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: 12, color: MUTED, fontFamily: FONT, margin: 0, lineHeight: 1.6 }}>
        {agent.description}
      </p>

      {/* Last run details */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: HINT, fontFamily: FONT }}>Last run</span>
          <span style={{ fontSize: 11, color: MUTED, fontFamily: FONT }}>
            {lastRun ? timeAgo(lastRun.ran_at) : "—"}
            {lastRun?.duration_ms ? <span style={{ color: HINT }}> · {dur(lastRun.duration_ms)}</span> : null}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: HINT, fontFamily: FONT }}>Schedule</span>
          <span style={{ fontSize: 11, color: MUTED, fontFamily: FONT }}>{agent.schedule}</span>
        </div>
        {metric && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: HINT, fontFamily: FONT }}>Last output</span>
            <span style={{ fontSize: 11, color: GREEN, fontFamily: FONT, maxWidth: 200, textAlign: "right", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{metric}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 12, display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => onTrigger(agent.id)}
          style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
            color: TEXT, background: "#F7F5F2", border: `1px solid ${BORDER}`,
            borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontFamily: FONT,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#EFEBE4")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#F7F5F2")}
        >
          Run now ›
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{
      background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12,
      padding: "18px 20px",
    }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: HINT, fontFamily: FONT, margin: "0 0 6px" }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 300, color: TEXT, fontFamily: "var(--font-cormorant, serif)", margin: 0, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: MUTED, fontFamily: FONT, margin: "4px 0 0" }}>{sub}</p>}
    </div>
  );
}

export default function OpsPage() {
  const [data, setData] = useState<{ agents: Agent[]; stats: Stats; recentRuns: RecentRun[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState<string | null>(null);
  const [triggerMsg, setTriggerMsg] = useState<{ id: string; msg: string } | null>(null);

  const load = useCallback(() => {
    fetch("/api/admin/ops")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [load]);

  async function trigger(agentId: string) {
    if (triggering) return;
    setTriggering(agentId);
    setTriggerMsg(null);
    try {
      const res = await fetch(`/api/cron/${agentId}`, {
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET ?? ""}` },
      });
      const text = await res.text();
      setTriggerMsg({ id: agentId, msg: res.ok ? "Triggered ✓" : `Error: ${text.slice(0, 80)}` });
      setTimeout(() => { setTriggerMsg(null); load(); }, 4000);
    } catch (e) {
      setTriggerMsg({ id: agentId, msg: "Failed to reach agent" });
      setTimeout(() => setTriggerMsg(null), 3000);
    } finally {
      setTriggering(null);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: FONT }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 32, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, margin: "0 0 6px" }}>Prospera</p>
            <h1 style={{ fontSize: 36, fontWeight: 300, color: TEXT, margin: 0, fontFamily: "var(--font-cormorant, serif)" }}>Automations</h1>
            <p style={{ fontSize: 13, color: MUTED, margin: "6px 0 0" }}>All active agents, cron jobs, and their live status</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
            <span style={{
              width: 7, height: 7, borderRadius: "50%", background: GREEN,
              display: "inline-block", boxShadow: `0 0 6px ${GREEN}`,
            }} />
            <span style={{ fontSize: 11, color: MUTED }}>Live · refreshes every 30s</span>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ background: SURFACE, borderRadius: 12, height: 88, border: `1px solid ${BORDER}`, opacity: 0.5 }} />
            ))}
          </div>
        ) : data ? (
          <>
            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 36 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, gridColumn: "1 / -1" }}>
                <StatCard label="Agents running" value={data.stats.totalAgents} sub="across all categories" />
                <StatCard label="Runs this week" value={data.stats.runsThisWeek} sub={data.stats.successRate !== null ? `${data.stats.successRate}% success rate` : "no data yet"} />
                <StatCard label="Blog posts" value={data.stats.blogPosts} sub="published on site" />
                <StatCard label="Subscribers" value={data.stats.activeSubscribers} sub={data.stats.lastNewsletterSlug ? `Last: ${data.stats.lastNewsletterSlug}` : "newsletter list"} />
              </div>
            </div>

            {/* Trigger toast */}
            {triggerMsg && (
              <div style={{
                position: "fixed", bottom: 24, right: 24, background: SURFACE,
                border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 20px",
                fontSize: 13, color: TEXT, fontFamily: FONT, zIndex: 999,
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              }}>
                {triggerMsg.msg}
              </div>
            )}

            {/* Agent grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14, marginBottom: 40 }}>
              {data.agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onTrigger={trigger}
                />
              ))}
            </div>

            {/* Recent runs log */}
            {data.recentRuns.length > 0 && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: MUTED, margin: "0 0 14px" }}>Recent runs</p>
                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                        {["Agent", "Status", "When", "Duration", "Output"].map((h) => (
                          <th key={h} style={{
                            padding: "10px 16px", textAlign: "left",
                            fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
                            textTransform: "uppercase", color: HINT, fontFamily: FONT,
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentRuns.map((run, i) => {
                        const summary = run.summary;
                        let outputLine = "";
                        if (summary?.written) outputLine = `${summary.writtenTitle ?? summary.written}`;
                        else if (summary?.sent !== undefined) outputLine = `Sent to ${summary.sent}`;
                        else if (summary?.postsGenerated) outputLine = `${summary.postsGenerated} posts`;
                        return (
                          <tr key={i} style={{ borderBottom: i < data.recentRuns.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                            <td style={{ padding: "10px 16px", fontSize: 12, color: TEXT, fontFamily: FONT }}>{run.agent}</td>
                            <td style={{ padding: "10px 16px" }}>
                              <span style={{
                                fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em",
                                color: run.status === "success" ? GREEN : ACCENT,
                                background: run.status === "success" ? `${GREEN}18` : `${ACCENT}18`,
                                padding: "2px 7px", borderRadius: 4, fontFamily: FONT,
                              }}>{run.status}</span>
                            </td>
                            <td style={{ padding: "10px 16px", fontSize: 12, color: MUTED, fontFamily: FONT }}>{timeAgo(run.ran_at)}</td>
                            <td style={{ padding: "10px 16px", fontSize: 12, color: MUTED, fontFamily: FONT }}>{dur(run.duration_ms)}</td>
                            <td style={{ padding: "10px 16px", fontSize: 12, color: MUTED, fontFamily: FONT, maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{outputLine || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <p style={{ color: MUTED, fontSize: 13 }}>Failed to load data.</p>
        )}
      </div>
    </div>
  );
}
