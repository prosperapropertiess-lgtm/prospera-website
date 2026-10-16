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
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showLink, setShowLink] = useState(false);
  const [linkForm, setLinkForm] = useState({ name: "", email: "", phone: "" });
  const [linkBusy, setLinkBusy] = useState(false);
  const [linkResult, setLinkResult] = useState<{ url: string; emailed: boolean } | null>(null);
  const [linkError, setLinkError] = useState("");

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

  async function createLink(sendEmail: boolean) {
    setLinkBusy(true);
    setLinkError("");
    const res = await fetch("/api/admin/discovery/send-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...linkForm, sendEmail }),
    });
    const d = await res.json().catch(() => ({}));
    setLinkBusy(false);
    if (d.url) {
      setLinkResult({ url: d.url, emailed: !!d.emailed });
      if (d.error) setLinkError(d.error);
      load();
    } else setLinkError(d.error ?? "Something went wrong");
  }

  function closeLink() {
    setShowLink(false);
    setLinkResult(null);
    setLinkError("");
    setLinkForm({ name: "", email: "", phone: "" });
  }

  async function deleteCall(id: string) {
    setDeleting(id);
    const res = await fetch(`/api/admin/discovery/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCalls((prev) => prev.filter((c) => c.id !== id));
    }
    setConfirmDeleteId(null);
    setDeleting(null);
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
            <button
              onClick={() => setShowLink(true)}
              className="px-5 py-3 rounded-xl text-sm font-medium"
              style={{ border: `1px solid ${BORDER}`, color: NAVY, backgroundColor: SURFACE }}
            >
              Send Fit Link
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
                          {c.source === "link" && !c.fit_submitted_at ? "Waiting on landlord" : OUTCOME_LABELS[c.outcome]}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: TEXT_SEC, margin: 0 }}>
                        {c.property_address ? `${c.property_address}${c.property_city ? `, ${c.property_city}` : ""}` : c.area || "No address yet"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span style={{ fontSize: 12, color: TEXT_MUT }}>{timeAgo(c.created_at)}</span>
                      {c.source === "link" && (
                        <Link href={`/admin/discovery/review/${c.id}`} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ border: `1px solid ${BORDER}`, color: NAVY }}>
                          {c.fit_submitted_at && c.outcome === "pending_decision" ? "Review" : "Open"}
                        </Link>
                      )}
                      {confirmDeleteId === c.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => deleteCall(c.id)}
                            disabled={deleting === c.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                            style={{ backgroundColor: "rgba(139,32,48,0.1)", color: ACCENT, border: "1px solid rgba(139,32,48,0.3)" }}
                          >
                            {deleting === c.id ? "Deleting…" : "Confirm delete"}
                          </button>
                          <button onClick={() => setConfirmDeleteId(null)} className="text-xs" style={{ color: TEXT_MUT }}>Cancel</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(c.id)}
                          className="flex items-center justify-center"
                          style={{ width: 30, height: 30, borderRadius: "50%", border: `1px solid ${BORDER}`, background: "none", cursor: "pointer" }}
                          aria-label="Delete call"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 16, color: TEXT_MUT }}>delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>


      {showLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={closeLink}>
          <div className="rounded-2xl w-full max-w-md" style={{ backgroundColor: SURFACE, padding: 26 }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: "0 0 4px" }}>Send a fit link</h2>
            <p style={{ fontSize: 13, color: TEXT_MUT, margin: "0 0 18px" }}>They fill in the property details. You decide what happens next.</p>
            {linkResult ? (
              <div>
                <p style={{ fontSize: 14, color: TEXT, margin: "0 0 10px" }}>{linkResult.emailed ? "Emailed. Here is the link too:" : "Link ready:"}</p>
                <input readOnly value={linkResult.url} onFocus={(e) => e.target.select()} className="w-full px-4 py-3 rounded-xl text-sm" style={{ border: `1.5px solid ${BORDER}`, backgroundColor: BG, color: TEXT }} />
                {linkError && <p style={{ color: ACCENT, fontSize: 13, marginTop: 10 }}>{linkError}</p>}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 18 }}>
                  <button onClick={() => navigator.clipboard?.writeText(linkResult.url)} className="px-4 py-2.5 text-sm" style={{ color: TEXT_SEC }}>Copy</button>
                  <button onClick={closeLink} className="px-6 py-2.5 rounded-lg text-sm font-semibold" style={{ backgroundColor: ACCENT, color: "#FAF8F5" }}>Done</button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {(["name", "email", "phone"] as const).map((f) => (
                  <input
                    key={f}
                    value={linkForm[f]}
                    onChange={(e) => setLinkForm({ ...linkForm, [f]: e.target.value })}
                    placeholder={f === "name" ? "Landlord name" : f === "email" ? "Email" : "Phone (optional)"}
                    className="w-full px-4 py-3 rounded-xl text-base outline-none"
                    style={{ border: `1.5px solid ${BORDER}`, backgroundColor: BG, color: TEXT }}
                  />
                ))}
                {linkError && <p style={{ color: ACCENT, fontSize: 13 }}>{linkError}</p>}
                <button onClick={() => createLink(true)} disabled={linkBusy || !linkForm.name.trim() || !linkForm.email.trim()} className="w-full px-6 py-3 rounded-lg text-sm font-semibold" style={{ backgroundColor: ACCENT, color: "#FAF8F5", opacity: linkBusy || !linkForm.name.trim() || !linkForm.email.trim() ? 0.5 : 1 }}>
                  {linkBusy ? "Sending…" : "Email the link"}
                </button>
                <div style={{ textAlign: "center" }}>
                  <button onClick={() => createLink(false)} disabled={linkBusy || !linkForm.name.trim()} className="text-xs font-medium uppercase tracking-widest" style={{ color: TEXT_SEC, borderBottom: `1px solid ${BORDER}` }}>
                    Just give me the link →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
