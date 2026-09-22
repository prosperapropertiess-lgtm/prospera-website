"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

const BG = "#F7F5F2";
const SURFACE = "#FFFFFF";
const BORDER = "#D8D2C8";
const TEXT = "#222222";
const TEXT_SEC = "#666666";
const TEXT_MUT = "#999999";
const ACCENT = "#8B2030";
const NAVY = "#1F2F3A";
const GREEN = "#2D7A4F";
const AMBER = "#B45309";

interface SessionRow {
  id: string; campaign_id: string; status: "draft" | "awaiting_signatures" | "completed";
  report_version: number; move_in_date: string | null; inspector_name: string | null; updated_at: string;
  campaign: { id: string; owner_name: string | null; property: { address: string | null; title: string | null; name: string | null } | null } | null;
  application: { legal_name: string | null; email: string | null } | null;
}
interface CampaignRow {
  id: string; owner_name: string | null; stage: string;
  property: { address: string | null; title: string | null; name: string | null } | null;
}

const STATUS_META: Record<SessionRow["status"], { label: string; bg: string; text: string }> = {
  draft: { label: "Draft", bg: "#FEF3C7", text: "#92400E" },
  awaiting_signatures: { label: "Awaiting Signatures", bg: "#DBEAFE", text: "#1E40AF" },
  completed: { label: "Completed", bg: "#D1FAE5", text: "#065F46" },
};

function addressOf(p: { address: string | null; title: string | null; name: string | null } | null | undefined) {
  return p?.address || p?.title || p?.name || "Unknown property";
}

export default function MoveInCoordinatorDashboard() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [notStarted, setNotStarted] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | SessionRow["status"]>("all");

  useEffect(() => {
    fetch("/api/admin/move-in-coordinator")
      .then((r) => r.json())
      .then((d) => { setSessions(d.sessions ?? []); setNotStarted(d.notStarted ?? []); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sessions.filter((s) => {
      if (filter !== "all" && s.status !== filter) return false;
      if (!q) return true;
      const haystack = `${addressOf(s.campaign?.property)} ${s.application?.legal_name ?? ""} ${s.campaign?.owner_name ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [sessions, query, filter]);

  const notStartedFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notStarted;
    return notStarted.filter((c) => addressOf(c.property).toLowerCase().includes(q));
  }, [notStarted, query]);

  const counts = {
    draft: sessions.filter((s) => s.status === "draft").length,
    awaiting_signatures: sessions.filter((s) => s.status === "awaiting_signatures").length,
    completed: sessions.filter((s) => s.status === "completed").length,
  };

  return (
    <div style={{ backgroundColor: BG, minHeight: "100vh", fontFamily: "var(--font-poppins, sans-serif)" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px 60px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: NAVY, margin: "0 0 6px" }}>Move-In Coordinator</h1>
            <p style={{ fontSize: 14, color: TEXT_SEC, margin: "0 0 28px" }}>Room-by-room inspections, signatures, and handover documents — search, resume, or start a new one.</p>
          </div>
          <Link href="/admin/move-in-coordinator/settings" style={{ fontSize: 13, color: TEXT_SEC, textDecoration: "none", whiteSpace: "nowrap" }}>⚙ Review Settings</Link>
        </div>

        <input
          value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by property or tenant name…"
          style={{ width: "100%", boxSizing: "border-box", fontSize: 15, padding: "14px 16px", borderRadius: 12, border: `1px solid ${BORDER}`, backgroundColor: SURFACE, marginBottom: 18 }}
        />

        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {([
            ["all", `All (${sessions.length})`],
            ["draft", `Draft (${counts.draft})`],
            ["awaiting_signatures", `Awaiting Signatures (${counts.awaiting_signatures})`],
            ["completed", `Completed (${counts.completed})`],
          ] as [typeof filter, string][]).map(([value, label]) => (
            <button key={value} onClick={() => setFilter(value)} style={{
              padding: "9px 16px", borderRadius: 20, border: `1.5px solid ${filter === value ? NAVY : BORDER}`,
              backgroundColor: filter === value ? NAVY : SURFACE, color: filter === value ? "#FFFFFF" : TEXT_SEC,
              fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: TEXT_MUT }}>Loading…</p>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 36 }}>
              {filtered.length === 0 && <EmptyNote text={query || filter !== "all" ? "No move-ins match." : "No move-ins started yet — pick a campaign below to begin."} />}
              {filtered.map((s) => {
                const meta = STATUS_META[s.status];
                return (
                  <Link key={s.id} href={`/admin/leasing/${s.campaign_id}/move-in-coordinator`} style={{ textDecoration: "none" }}>
                    <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: "0 0 3px" }}>{addressOf(s.campaign?.property)}</p>
                        <p style={{ fontSize: 12, color: TEXT_MUT, margin: 0 }}>
                          {s.application?.legal_name || "No tenant on file"} · Owner: {s.campaign?.owner_name || "—"}
                          {s.move_in_date ? ` · Move-in ${s.move_in_date}` : ""}
                        </p>
                      </div>
                      <span style={{ backgroundColor: meta.bg, color: meta.text, fontSize: 11, fontWeight: 700, padding: "6px 12px", borderRadius: 20, whiteSpace: "nowrap" }}>{meta.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {filter === "all" && !query && (
              <>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: "0 0 12px" }}>Start a New Move-In</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {notStartedFiltered.length === 0 && <EmptyNote text="No campaigns at lease-pending/signed/move-in stage without a move-in started." />}
                  {notStartedFiltered.map((c) => (
                    <Link key={c.id} href={`/admin/leasing/${c.id}/move-in-coordinator`} style={{ textDecoration: "none" }}>
                      <div style={{ backgroundColor: SURFACE, border: `1px dashed ${BORDER}`, borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: "0 0 3px" }}>{addressOf(c.property)}</p>
                          <p style={{ fontSize: 12, color: TEXT_MUT, margin: 0 }}>Owner: {c.owner_name || "—"} · Stage: {c.stage.replace(/_/g, " ").toLowerCase()}</p>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: ACCENT }}>Start →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyNote({ text }: { text: string }) {
  return (
    <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 24, textAlign: "center" }}>
      <p style={{ color: TEXT_MUT, fontSize: 13, margin: 0 }}>{text}</p>
    </div>
  );
}
