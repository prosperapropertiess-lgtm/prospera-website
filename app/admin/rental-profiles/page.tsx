"use client";

import { useEffect, useState, useCallback } from "react";

const BG      = "#F7F5F2";
const SURFACE = "#FFFFFF";
const BORDER  = "#D8D2C8";
const NAVY    = "#1F2F3A";
const TEXT     = "#222222";
const TEXT_SEC = "#666666";
const TEXT_MUT = "#999999";
const ACCENT   = "#8B2030";
const FONT     = "var(--font-dm-sans, sans-serif)";

interface RentalProfile {
  id: string;
  created_at: string;
  updated_at: string;
  completed: boolean;
  completed_at: string | null;
  last_step: string | null;
  lead_score: string | null;

  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;

  move_timing: string | null;
  household_type: string | null;
  household_size: number | null;
  preferred_areas: string[] | null;
  other_location: string | null;
  property_types: string[] | null;
  bedrooms: string | null;
  bathrooms: string | null;
  budget_range: string | null;
  max_budget: number | null;
  parking: string[] | null;
  pets: string[] | null;
  pets_note: string | null;
  must_haves: string[] | null;
  top_priorities: string[] | null;
  deal_breakers: string[] | null;
  proximity_preferences: string[] | null;
  current_situation: string | null;
  search_intensity: string | null;
  notes: string | null;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (d > 30) return `${Math.floor(d / 30)}mo ago`;
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  return `${m}m ago`;
}

function StatusBadge({ completed }: { completed: boolean }) {
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 600,
        padding: "4px 12px",
        borderRadius: 20,
        backgroundColor: completed ? "#D1FAE5" : "#FEF3C7",
        color: completed ? "#065F46" : "#92400E",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      {completed ? "Completed" : "In Progress"}
    </span>
  );
}

const SCORE_COLORS: Record<string, { bg: string; text: string }> = {
  hot: { bg: "#FEE2E2", text: "#991B1B" },
  warm: { bg: "#FEF3C7", text: "#92400E" },
  future: { bg: "#E2E8F0", text: "#64748B" },
};

function ScoreBadge({ score }: { score: string | null }) {
  if (!score) return null;
  const c = SCORE_COLORS[score] ?? SCORE_COLORS.future;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, backgroundColor: c.bg, color: c.text, textTransform: "uppercase", letterSpacing: "0.06em" }}>
      {score}
    </span>
  );
}

function fullName(p: RentalProfile) {
  const n = `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim();
  return n || null;
}

export default function RentalProfilesPage() {
  const [profiles, setProfiles] = useState<RentalProfile[]>([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, partial: 0, hot: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "completed" | "partial">("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const load = useCallback(async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/rental-profiles?status=${status}&limit=300`);
      const data = await res.json();
      setProfiles(data.profiles ?? []);
      setStats({ total: data.total ?? 0, completed: data.completed ?? 0, partial: data.partial ?? 0, hot: data.hot ?? 0 });
    } catch {
      setProfiles([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load(filter);
  }, [filter, load]);

  const removeProfile = useCallback(async (id: string) => {
    setRemoving(id);
    try {
      await fetch("/api/admin/rental-profiles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setProfiles((prev) => prev.filter((p) => p.id !== id));
      setExpanded(null);
      setConfirmId(null);
    } finally {
      setRemoving(null);
    }
  }, []);

  const displayed = profiles.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (p.email ?? "").toLowerCase().includes(q) ||
      (fullName(p) ?? "").toLowerCase().includes(q) ||
      (p.preferred_areas ?? []).join(" ").toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ minHeight: "calc(100vh - 60px)", backgroundColor: BG, fontFamily: FONT }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 100px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: NAVY, margin: 0, letterSpacing: "-0.02em" }}>Renter Profiles</h1>
          <p style={{ fontSize: 14, color: TEXT_SEC, margin: "4px 0 0" }}>
            Everyone who's started a rental match at /rent — not just the ones who finish.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Total profiles", value: stats.total },
            { label: "Completed", value: stats.completed },
            { label: "In progress", value: stats.partial },
            { label: "Hot leads", value: stats.hot },
          ].map(({ label, value }) => (
            <div key={label} style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "18px 20px" }}>
              <p style={{ margin: "0 0 4px", fontSize: 11, color: TEXT_MUT, textTransform: "uppercase", letterSpacing: "1.5px" }}>{label}</p>
              <p style={{ margin: 0, fontSize: 30, fontWeight: 300, color: TEXT, fontFamily: "var(--font-cormorant)" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filters + Search */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
          {([
            ["all", "All"],
            ["completed", "Completed"],
            ["partial", "In Progress"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: "12px 20px",
                borderRadius: 20,
                fontSize: 14,
                fontWeight: 600,
                minHeight: 44,
                border: filter === key ? "none" : `1px solid ${BORDER}`,
                backgroundColor: filter === key ? NAVY : "transparent",
                color: filter === key ? "#FAF8F5" : TEXT_SEC,
                cursor: "pointer",
                fontFamily: FONT,
              }}
            >
              {label}
            </button>
          ))}
          <input
            placeholder="Search name, email, or area…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              marginLeft: "auto",
              padding: "12px 16px",
              borderRadius: 10,
              border: `1px solid ${BORDER}`,
              backgroundColor: SURFACE,
              color: TEXT,
              fontSize: 14,
              fontFamily: FONT,
              outline: "none",
              minWidth: 220,
              minHeight: 44,
            }}
          />
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: TEXT_MUT, fontSize: 14 }}>Loading…</div>
        ) : displayed.length === 0 ? (
          <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 60, textAlign: "center", color: TEXT_MUT, fontSize: 14 }}>
            No renter profiles yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {displayed.map((p) => {
              const isOpen = expanded === p.id;
              const name = fullName(p) || "Anonymous visitor";
              const areas = p.preferred_areas ?? [];
              return (
                <div key={p.id} style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden" }}>
                  <div
                    onClick={() => setExpanded(isOpen ? null : p.id)}
                    style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, cursor: "pointer", flexWrap: "wrap", minHeight: 48 }}
                  >
                    <div style={{ flex: 1, minWidth: 240 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 16, fontWeight: 600, color: NAVY }}>{name}</span>
                        <StatusBadge completed={p.completed} />
                        <ScoreBadge score={p.lead_score} />
                      </div>
                      <p style={{ fontSize: 14, color: TEXT_SEC, margin: 0 }}>
                        {[p.move_timing, p.bedrooms && `${p.bedrooms} bed`, p.budget_range, areas.length > 0 ? areas.slice(0, 2).join(", ") : null]
                          .filter(Boolean)
                          .join(" · ") || "No preferences recorded yet"}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 13, color: TEXT_MUT, whiteSpace: "nowrap" }}>{timeAgo(p.updated_at)}</span>
                    </div>
                  </div>

                  {isOpen && (
                    <div style={{ padding: "0 24px 24px", borderTop: `1px solid ${BORDER}` }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
                        {p.email && (
                          <div>
                            <p style={{ margin: "0 0 4px", fontSize: 11, color: TEXT_MUT, textTransform: "uppercase", letterSpacing: "1px" }}>Email</p>
                            <a href={`mailto:${p.email}?subject=Following up — Prospera Properties`} style={{ fontSize: 14, color: ACCENT, textDecoration: "none", fontWeight: 600 }}>
                              {p.email}
                            </a>
                          </div>
                        )}
                        {p.phone && (
                          <div>
                            <p style={{ margin: "0 0 4px", fontSize: 11, color: TEXT_MUT, textTransform: "uppercase", letterSpacing: "1px" }}>Phone</p>
                            <a href={`tel:${p.phone}`} style={{ fontSize: 14, color: TEXT, textDecoration: "none" }}>{p.phone}</a>
                          </div>
                        )}
                        {p.household_type && (
                          <div>
                            <p style={{ margin: "0 0 4px", fontSize: 11, color: TEXT_MUT, textTransform: "uppercase", letterSpacing: "1px" }}>Household</p>
                            <p style={{ margin: 0, fontSize: 14, color: TEXT }}>{p.household_type}{p.household_size ? ` · ${p.household_size} people` : ""}</p>
                          </div>
                        )}
                        {(areas.length > 0 || p.other_location) && (
                          <div>
                            <p style={{ margin: "0 0 4px", fontSize: 11, color: TEXT_MUT, textTransform: "uppercase", letterSpacing: "1px" }}>Areas</p>
                            <p style={{ margin: 0, fontSize: 14, color: TEXT }}>{[...areas, p.other_location].filter(Boolean).join(", ")}</p>
                          </div>
                        )}
                        {p.property_types && p.property_types.length > 0 && (
                          <div>
                            <p style={{ margin: "0 0 4px", fontSize: 11, color: TEXT_MUT, textTransform: "uppercase", letterSpacing: "1px" }}>Property type</p>
                            <p style={{ margin: 0, fontSize: 14, color: TEXT }}>{p.property_types.join(", ")}</p>
                          </div>
                        )}
                        {p.bathrooms && (
                          <div>
                            <p style={{ margin: "0 0 4px", fontSize: 11, color: TEXT_MUT, textTransform: "uppercase", letterSpacing: "1px" }}>Bathrooms</p>
                            <p style={{ margin: 0, fontSize: 14, color: TEXT }}>{p.bathrooms}</p>
                          </div>
                        )}
                        {p.max_budget && (
                          <div>
                            <p style={{ margin: "0 0 4px", fontSize: 11, color: TEXT_MUT, textTransform: "uppercase", letterSpacing: "1px" }}>Max budget</p>
                            <p style={{ margin: 0, fontSize: 14, color: TEXT }}>${Number(p.max_budget).toLocaleString()}/mo</p>
                          </div>
                        )}
                        {p.parking && p.parking.length > 0 && (
                          <div>
                            <p style={{ margin: "0 0 4px", fontSize: 11, color: TEXT_MUT, textTransform: "uppercase", letterSpacing: "1px" }}>Parking</p>
                            <p style={{ margin: 0, fontSize: 14, color: TEXT }}>{p.parking.join(", ")}</p>
                          </div>
                        )}
                        {p.pets && p.pets.length > 0 && (
                          <div>
                            <p style={{ margin: "0 0 4px", fontSize: 11, color: TEXT_MUT, textTransform: "uppercase", letterSpacing: "1px" }}>Pets</p>
                            <p style={{ margin: 0, fontSize: 14, color: TEXT }}>{p.pets.join(", ")}{p.pets_note ? ` — ${p.pets_note}` : ""}</p>
                          </div>
                        )}
                        {p.top_priorities && p.top_priorities.length > 0 && (
                          <div style={{ gridColumn: "1 / -1" }}>
                            <p style={{ margin: "0 0 4px", fontSize: 11, color: TEXT_MUT, textTransform: "uppercase", letterSpacing: "1px" }}>Top priorities</p>
                            <p style={{ margin: 0, fontSize: 14, color: TEXT }}>{p.top_priorities.join(" → ")}</p>
                          </div>
                        )}
                        {p.must_haves && p.must_haves.length > 0 && (
                          <div style={{ gridColumn: "1 / -1" }}>
                            <p style={{ margin: "0 0 4px", fontSize: 11, color: TEXT_MUT, textTransform: "uppercase", letterSpacing: "1px" }}>Must-haves</p>
                            <p style={{ margin: 0, fontSize: 14, color: TEXT_SEC, lineHeight: 1.6 }}>{p.must_haves.join(", ")}</p>
                          </div>
                        )}
                        {p.deal_breakers && p.deal_breakers.length > 0 && (
                          <div style={{ gridColumn: "1 / -1" }}>
                            <p style={{ margin: "0 0 4px", fontSize: 11, color: TEXT_MUT, textTransform: "uppercase", letterSpacing: "1px" }}>Deal-breakers</p>
                            <p style={{ margin: 0, fontSize: 14, color: ACCENT }}>{p.deal_breakers.join(", ")}</p>
                          </div>
                        )}
                        {p.proximity_preferences && p.proximity_preferences.length > 0 && (
                          <div style={{ gridColumn: "1 / -1" }}>
                            <p style={{ margin: "0 0 4px", fontSize: 11, color: TEXT_MUT, textTransform: "uppercase", letterSpacing: "1px" }}>Wants to be near</p>
                            <p style={{ margin: 0, fontSize: 14, color: TEXT }}>{p.proximity_preferences.join(", ")}</p>
                          </div>
                        )}
                        {p.current_situation && (
                          <div>
                            <p style={{ margin: "0 0 4px", fontSize: 11, color: TEXT_MUT, textTransform: "uppercase", letterSpacing: "1px" }}>Current situation</p>
                            <p style={{ margin: 0, fontSize: 14, color: TEXT }}>{p.current_situation}</p>
                          </div>
                        )}
                        {p.search_intensity && (
                          <div>
                            <p style={{ margin: "0 0 4px", fontSize: 11, color: TEXT_MUT, textTransform: "uppercase", letterSpacing: "1px" }}>Search intensity</p>
                            <p style={{ margin: 0, fontSize: 14, color: TEXT, textTransform: "capitalize" }}>{p.search_intensity.replace(/_/g, " ")}</p>
                          </div>
                        )}
                        {!p.completed && p.last_step && (
                          <div>
                            <p style={{ margin: "0 0 4px", fontSize: 11, color: TEXT_MUT, textTransform: "uppercase", letterSpacing: "1px" }}>Stopped at</p>
                            <p style={{ margin: 0, fontSize: 14, color: TEXT, textTransform: "capitalize" }}>{p.last_step.replace(/_/g, " ")}</p>
                          </div>
                        )}
                        {p.notes && (
                          <div style={{ gridColumn: "1 / -1" }}>
                            <p style={{ margin: "0 0 4px", fontSize: 11, color: TEXT_MUT, textTransform: "uppercase", letterSpacing: "1px" }}>Notes</p>
                            <p style={{ margin: 0, fontSize: 14, color: TEXT_SEC, lineHeight: 1.6, background: BG, padding: "12px 16px", borderRadius: 8 }}>{p.notes}</p>
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                        {confirmId === p.id ? (
                          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <button
                              onClick={() => removeProfile(p.id)}
                              disabled={removing === p.id}
                              style={{ fontSize: 13, padding: "10px 18px", minHeight: 44, backgroundColor: "rgba(139,32,48,0.1)", color: ACCENT, border: "1px solid rgba(139,32,48,0.3)", borderRadius: 8, cursor: "pointer", fontFamily: FONT }}
                            >
                              {removing === p.id ? "Removing…" : "Confirm remove"}
                            </button>
                            <button
                              onClick={() => setConfirmId(null)}
                              style={{ fontSize: 13, padding: "10px 14px", minHeight: 44, background: "none", color: TEXT_MUT, border: "none", cursor: "pointer", fontFamily: FONT }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmId(p.id)}
                            style={{ fontSize: 13, padding: "10px 16px", minHeight: 44, background: "none", color: TEXT_MUT, border: `1px solid ${BORDER}`, borderRadius: 8, cursor: "pointer", fontFamily: FONT }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
