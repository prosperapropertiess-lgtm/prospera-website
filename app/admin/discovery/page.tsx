"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { DiscoveryCall } from "@/lib/discovery-data";
import { OUTCOME_LABELS } from "@/lib/discovery-data";

const BG = "#F7F5F2";
const SURFACE = "#FFFFFF";
const BORDER = "#D8D2C8";
const TEXT = "#222222";
const TEXT_SEC = "#666666";
const TEXT_MUT = "#999999";
const ACCENT = "#8B2030";
const NAVY = "#1F2F3A";

const OUTCOME_COLORS: Record<DiscoveryCall["outcome"], { bg: string; fg: string }> = {
  in_progress: { bg: "#F0EDE8", fg: "#666666" },
  pending_decision: { bg: "#FEF3C7", fg: "#92400E" },
  rejected: { bg: "#FEE2E2", fg: "#991B1B" },
  converted: { bg: "#DCFCE7", fg: "#166534" },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  return `${m}m ago`;
}

export default function DiscoveryPage() {
  const [calls, setCalls] = useState<DiscoveryCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCriteria, setShowCriteria] = useState(false);
  const [criteria, setCriteria] = useState("");
  const [criteriaLoaded, setCriteriaLoaded] = useState(false);
  const [savingCriteria, setSavingCriteria] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/discovery").then((r) => r.json()).catch(() => ({ calls: [] }));
    setCalls(res.calls ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function openCriteria() {
    setShowCriteria(true);
    if (!criteriaLoaded) {
      const res = await fetch("/api/admin/discovery/criteria").then((r) => r.json()).catch(() => ({ criteria: "" }));
      setCriteria(res.criteria ?? "");
      setCriteriaLoaded(true);
    }
  }

  async function saveCriteria() {
    setSavingCriteria(true);
    await fetch("/api/admin/discovery/criteria", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ criteria }),
    });
    setSavingCriteria(false);
    setShowCriteria(false);
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, fontFamily: "var(--font-poppins, sans-serif)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 100px" }}>

        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: NAVY, margin: 0 }}>Discovery Calls</h1>
            <p style={{ fontSize: 14, color: TEXT_SEC, margin: "4px 0 0" }}>The first step — before a landlord ever hits the onboarding wizard</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={openCriteria}
              className="px-5 py-3 rounded-xl text-sm font-medium"
              style={{ border: `1px solid ${BORDER}`, color: TEXT_SEC, backgroundColor: SURFACE }}
            >
              Edit Fit Criteria
            </button>
            <Link
              href="/admin/discovery/new"
              className="px-5 py-3 rounded-xl text-sm font-semibold uppercase tracking-widest"
              style={{ backgroundColor: ACCENT, color: "#FAF8F5" }}
            >
              + New Discovery Call
            </Link>
          </div>
        </div>

        {loading ? (
          <p style={{ color: TEXT_MUT }}>Loading…</p>
        ) : calls.length === 0 ? (
          <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 48, textAlign: "center" }}>
            <p style={{ color: TEXT_MUT, fontSize: 15 }}>No discovery calls yet. Start one the next time your phone rings.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {calls.map((c) => {
              const colors = OUTCOME_COLORS[c.outcome];
              return (
                <div key={c.id} style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "18px 22px" }}>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>{c.landlord_name || "Unnamed call"}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20, backgroundColor: colors.bg, color: colors.fg }}>
                          {OUTCOME_LABELS[c.outcome]}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: TEXT_SEC, margin: 0 }}>
                        {c.property_address || "No address yet"}{c.property_city ? `, ${c.property_city}` : ""}
                      </p>
                    </div>
                    <span style={{ fontSize: 12, color: TEXT_MUT }}>{timeAgo(c.created_at)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Criteria editor modal */}
      {showCriteria && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setShowCriteria(false)}>
          <div className="rounded-2xl w-full max-w-2xl" style={{ backgroundColor: SURFACE, maxHeight: "85vh", display: "flex", flexDirection: "column" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${BORDER}` }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: 0 }}>Fit Criteria</h2>
              <p style={{ fontSize: 13, color: TEXT_MUT, margin: "4px 0 0" }}>
                This is what the AI checks every discovery call against. Edit it any time — everyone using this tool gets the same, current rules.
              </p>
            </div>
            <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
              <textarea
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
                rows={16}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ border: `1px solid ${BORDER}`, backgroundColor: BG, color: TEXT, fontFamily: "monospace", lineHeight: 1.6 }}
              />
            </div>
            <div style={{ padding: "16px 24px", borderTop: `1px solid ${BORDER}`, display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button onClick={() => setShowCriteria(false)} className="px-5 py-2.5 text-sm" style={{ color: TEXT_SEC }}>Cancel</button>
              <button
                onClick={saveCriteria}
                disabled={savingCriteria}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: ACCENT, color: "#FAF8F5" }}
              >
                {savingCriteria ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
