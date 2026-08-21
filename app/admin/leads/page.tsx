"use client";

import { useEffect, useState, useCallback } from "react";

const BG      = "#F7F5F2";
const SURFACE = "#FFFFFF";
const BORDER  = "#D8D2C8";
const TEXT     = "#222222";
const TEXT_SEC = "#666666";
const TEXT_MUT = "#999999";
const ACCENT   = "#8B2030";
const FONT     = "var(--font-dm-sans, sans-serif)";

interface Lead {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  city: string | null;
  message: string | null;
  type: string | null;
  source: string | null;
  property: string | null;
  created_at: string;
  _table: "contact" | "subscriber";
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (d > 30) return `${Math.floor(d / 30)}mo ago`;
  if (d > 0)  return `${d}d ago`;
  if (h > 0)  return `${h}h ago`;
  return `${m}m ago`;
}

function SourceBadge({ source, table }: { source: string | null; table: string }) {
  const raw = source ?? (table === "contact" ? "direct" : "popup");
  const isOrganic = raw.startsWith("blog:") || raw.startsWith("service:") || raw === "organic";
  const label = raw.startsWith("blog:") ? `blog ${raw.replace("blog:/blog/", "")}` : raw.replace(/_/g, " ");
  const color = isOrganic ? "#C47F17" : table === "contact" ? "#5A8A6A" : "#1565C0";
  const bg    = isOrganic ? "rgba(196,127,23,0.15)" : table === "contact" ? "rgba(90,138,106,0.15)" : "rgba(21,101,192,0.15)";
  return (
    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, backgroundColor: bg, color, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", fontFamily: FONT, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "inline-block" }}>
      {label}
    </span>
  );
}

function TypeBadge({ type }: { type: string | null }) {
  if (!type) return null;
  const colors: Record<string, [string, string]> = {
    landlord:   ["rgba(139,32,48,0.15)", "#8B2030"],
    tenant:     ["#1F2F3A",              "#FAF8F5"],
    newsletter: ["rgba(100,74,12,0.2)",  "#8A6212"],
  };
  const [bg, color] = colors[type] ?? ["#F7F5F2", "#999999"];
  return (
    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, backgroundColor: bg, color, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", fontFamily: FONT }}>
      {type}
    </span>
  );
}

export default function LeadsPage() {
  const [leads, setLeads]         = useState<Lead[]>([]);
  const [stats, setStats]         = useState({ total: 0, contacts: 0, subscribers: 0, organic: 0, oldest: null as string | null });
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("all");
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [search, setSearch]       = useState("");
  const [removing, setRemoving]   = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = useCallback(async (src: string) => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/admin/leads?source=${src}&limit=200`);
      const data = await res.json();
      setLeads(data.leads ?? []);
      setStats({ total: data.total, contacts: data.contacts, subscribers: data.subscribers, organic: data.organic ?? 0, oldest: data.oldest });
    } catch {
      setLeads([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(filter); }, [filter, load]);

  const removeLead = useCallback(async (lead: Lead) => {
    setRemoving(lead.id);
    try {
      await fetch("/api/admin/leads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lead.id, table: lead._table }),
      });
      setLeads((prev) => prev.filter((l) => l.id !== lead.id));
      setStats((prev) => ({
        ...prev,
        total: prev.total - 1,
        contacts: lead._table === "contact" ? prev.contacts - 1 : prev.contacts,
        subscribers: lead._table === "subscriber" ? prev.subscribers - 1 : prev.subscribers,
      }));
      setExpanded(null);
      setConfirmId(null);
    } finally {
      setRemoving(null);
    }
  }, []);

  const displayed = leads.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.email.toLowerCase().includes(q) ||
      (l.name ?? "").toLowerCase().includes(q) ||
      (l.city ?? "").toLowerCase().includes(q)
    );
  });

  const oldestStr = stats.oldest
    ? new Date(stats.oldest).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" })
    : null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, fontFamily: FONT }}>
      {/* Header */}
      <div style={{ padding: "20px 28px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: TEXT }}>Leads</h1>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 12, color: TEXT_MUT }}>
          {oldestStr && <span>First lead: {oldestStr}</span>}
          <button
            onClick={() => load(filter)}
            style={{ background: "none", border: `1px solid ${BORDER}`, color: TEXT_SEC, padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontFamily: FONT }}
          >
            Refresh
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Total leads", value: stats.total, sub: null },
            { label: "Contact forms", value: stats.contacts, sub: null },
            { label: "Subscribers", value: stats.subscribers, sub: null },
            {
              label: "From organic / blog",
              value: stats.organic,
              sub: stats.contacts > 0 ? `${Math.round((stats.organic / stats.contacts) * 100)}% of contact forms` : null,
            },
          ].map(({ label, value, sub }) => (
            <div key={label} style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "18px 20px" }}>
              <p style={{ margin: "0 0 4px", fontSize: 11, color: TEXT_MUT, textTransform: "uppercase", letterSpacing: "1.5px" }}>{label}</p>
              <p style={{ margin: 0, fontSize: 30, fontWeight: 300, color: TEXT, fontFamily: "var(--font-cormorant)" }}>{value}</p>
              {sub && <p style={{ margin: "4px 0 0", fontSize: 11, color: TEXT_MUT }}>{sub}</p>}
            </div>
          ))}
        </div>

        {/* Filters + Search */}
        <div style={{ display: "flex", gap: 10, marginBottom: 18, alignItems: "center", flexWrap: "wrap" }}>
          {[
            { key: "all", label: "All" },
            { key: "contacts", label: "Contact forms" },
            { key: "subscribers", label: "Subscribers" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setFilter(key); setLoading(true); }}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                fontSize: 12,
                border: filter === key ? "none" : `1px solid ${BORDER}`,
                backgroundColor: filter === key ? "#1F2F3A" : "transparent",
                color: filter === key ? "#FAF8F5" : TEXT_SEC,
                cursor: "pointer",
                fontFamily: FONT,
              }}
            >
              {label}
            </button>
          ))}
          <input
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              marginLeft: "auto",
              padding: "6px 14px",
              borderRadius: 8,
              border: `1px solid ${BORDER}`,
              backgroundColor: SURFACE,
              color: TEXT,
              fontSize: 12,
              fontFamily: FONT,
              outline: "none",
              width: 220,
            }}
          />
        </div>

        {/* Table */}
        <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: TEXT_MUT, fontSize: 13 }}>Loading...</div>
          ) : displayed.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: TEXT_MUT, fontSize: 13 }}>No leads found.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {["Name", "Email", "Type", "Source", "City", "When", "", ""].map((h, i) => (
                    <th key={i} style={{ padding: "12px 16px", textAlign: "left", fontSize: 10, color: TEXT_MUT, textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map((lead) => (
                  <>
                    <tr
                      key={lead.id}
                      onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}
                      style={{ borderBottom: `1px solid ${BORDER}`, cursor: "pointer", transition: "background 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F7F5F2")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "14px 16px", fontSize: 13, color: TEXT, fontWeight: 500 }}>
                        {lead.name || <span style={{ color: TEXT_MUT }}>—</span>}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: TEXT_SEC }}>{lead.email}</td>
                      <td style={{ padding: "14px 16px" }}><TypeBadge type={lead.type} /></td>
                      <td style={{ padding: "14px 16px" }}><SourceBadge source={lead.source} table={lead._table} /></td>
                      <td style={{ padding: "14px 16px", fontSize: 12, color: TEXT_MUT }}>{lead.city || "—"}</td>
                      <td style={{ padding: "14px 16px", fontSize: 12, color: TEXT_MUT, whiteSpace: "nowrap" }}>{timeAgo(lead.created_at)}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <a
                          href={`mailto:${lead.email}?subject=Following up — Prospera Properties`}
                          onClick={(e) => e.stopPropagation()}
                          style={{ fontSize: 11, padding: "5px 12px", backgroundColor: ACCENT, color: "#fff", borderRadius: 5, textDecoration: "none", fontWeight: 600, letterSpacing: "0.5px", whiteSpace: "nowrap" }}
                        >
                          Email →
                        </a>
                      </td>
                      <td style={{ padding: "14px 16px" }} onClick={(e) => e.stopPropagation()}>
                        {confirmId === lead.id ? (
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <button
                              onClick={() => removeLead(lead)}
                              disabled={removing === lead.id}
                              style={{ fontSize: 11, padding: "4px 10px", backgroundColor: "rgba(139,32,48,0.1)", color: "#8B2030", border: "1px solid rgba(139,32,48,0.3)", borderRadius: 5, cursor: "pointer", fontFamily: FONT, whiteSpace: "nowrap" }}
                            >
                              {removing === lead.id ? "Removing…" : "Confirm"}
                            </button>
                            <button
                              onClick={() => setConfirmId(null)}
                              style={{ fontSize: 11, padding: "4px 8px", background: "none", color: TEXT_MUT, border: "none", cursor: "pointer", fontFamily: FONT }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmId(lead.id)}
                            style={{ fontSize: 11, padding: "4px 10px", background: "none", color: TEXT_MUT, border: `1px solid ${BORDER}`, borderRadius: 5, cursor: "pointer", fontFamily: FONT, whiteSpace: "nowrap" }}
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                    {expanded === lead.id && (
                      <tr key={`${lead.id}-detail`} style={{ backgroundColor: "#FAF9F7", borderBottom: `1px solid ${BORDER}` }}>
                        <td colSpan={8} style={{ padding: "16px 20px" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            {lead.phone && (
                              <div>
                                <p style={{ margin: "0 0 4px", fontSize: 10, color: TEXT_MUT, textTransform: "uppercase", letterSpacing: "1px" }}>Phone</p>
                                <a href={`tel:${lead.phone}`} style={{ fontSize: 13, color: TEXT, textDecoration: "none" }}>{lead.phone}</a>
                              </div>
                            )}
                            {lead.property && (
                              <div>
                                <p style={{ margin: "0 0 4px", fontSize: 10, color: TEXT_MUT, textTransform: "uppercase", letterSpacing: "1px" }}>Property interest</p>
                                <p style={{ margin: 0, fontSize: 13, color: TEXT }}>{lead.property}</p>
                              </div>
                            )}
                            {lead.message && (
                              <div style={{ gridColumn: "1 / -1" }}>
                                <p style={{ margin: "0 0 4px", fontSize: 10, color: TEXT_MUT, textTransform: "uppercase", letterSpacing: "1px" }}>Message</p>
                                <p style={{ margin: 0, fontSize: 13, color: TEXT_SEC, lineHeight: 1.6, background: "#F7F5F2", padding: "10px 14px", borderRadius: 6 }}>{lead.message}</p>
                              </div>
                            )}
                            <div>
                              <p style={{ margin: "0 0 4px", fontSize: 10, color: TEXT_MUT, textTransform: "uppercase", letterSpacing: "1px" }}>Submitted</p>
                              <p style={{ margin: 0, fontSize: 13, color: TEXT_SEC }}>{new Date(lead.created_at).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" })}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
