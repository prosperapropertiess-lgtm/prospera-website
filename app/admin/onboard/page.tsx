"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const BG          = "#F5F4F1";
const CARD        = "#FFFFFF";
const CARD_BORDER = "rgba(15,28,40,0.07)";
const CARD_SHADOW = "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)";
const NAVY        = "#0F1C28";
const MUTED       = "rgba(15,28,40,0.60)";
const SUBTLE      = "rgba(15,28,40,0.42)";
const BURGUNDY    = "#8B2030";
const GREEN       = "#0A7A52";
const GREEN_BG    = "rgba(10,122,82,0.09)";
const AMBER       = "#B45309";
const AMBER_BG    = "rgba(180,83,9,0.09)";
const RED         = "#B91C1C";
const RED_BG      = "rgba(185,28,28,0.08)";

interface Session {
  id: string;
  token: string;
  current_step: number;
  status: string;
  owner_name: string | null;
  owner_email: string | null;
  property_address: string | null;
  created_at: string;
  step2_completed_at: string | null;
  step3_completed_at: string | null;
  completed_at: string | null;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function statusStyle(status: string) {
  if (status === "complete") return { border: GREEN, badge: GREEN, badgeBg: GREEN_BG, label: "Complete" };
  if (status === "in_progress") return { border: AMBER, badge: AMBER, badgeBg: AMBER_BG, label: "In Progress" };
  return { border: RED, badge: RED, badgeBg: RED_BG, label: "New" };
}

function SkeletonCard() {
  return (
    <div style={{
      background: CARD,
      border: `1px solid ${CARD_BORDER}`,
      boxShadow: CARD_SHADOW,
      borderRadius: 16,
      padding: "22px 24px",
      borderLeft: `3px solid ${CARD_BORDER}`,
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ height: 16, width: "40%", borderRadius: 8, background: "rgba(15,28,40,0.07)", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ height: 13, width: "60%", borderRadius: 8, background: "rgba(15,28,40,0.05)", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ height: 6, borderRadius: 4, background: "rgba(15,28,40,0.05)", marginTop: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
      </div>
    </div>
  );
}

export default function OnboardListPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/onboard/list", {
      headers: { "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "" },
    })
      .then((r) => r.json())
      .then((d) => { setSessions(d.sessions ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function startNew() {
    setCreating(true);
    try {
      const r = await fetch("/api/onboard/create", {
        method: "POST",
        headers: { "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "" },
      });
      const d = await r.json();
      if (d.token) {
        router.push(`/admin/onboard/${d.token}`);
      } else {
        setCreating(false);
      }
    } catch {
      setCreating(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: BG,
      fontFamily: "var(--font-poppins), -apple-system, sans-serif",
    }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: NAVY, letterSpacing: "-0.02em" }}>
            Onboarding
          </h1>
          <button
            onClick={startNew}
            disabled={creating}
            style={{
              background: BURGUNDY,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "12px 24px",
              fontSize: 15,
              fontWeight: 700,
              cursor: creating ? "not-allowed" : "pointer",
              opacity: creating ? 0.45 : 1,
              fontFamily: "var(--font-poppins), -apple-system, sans-serif",
              transition: "opacity 0.15s",
            }}
          >
            {creating ? "Creating…" : "Start New Onboarding"}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : sessions.length === 0 ? (
          <div style={{
            background: CARD,
            border: `1px solid ${CARD_BORDER}`,
            boxShadow: CARD_SHADOW,
            borderRadius: 20,
            padding: "60px 32px",
            textAlign: "center",
          }}>
            <p style={{ fontSize: 40, margin: "0 0 12px" }}>🏠</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: "0 0 6px" }}>No onboardings yet</p>
            <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>Click "Start New Onboarding" to begin.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sessions.map((s) => {
              const st = statusStyle(s.status);
              const progress = Math.max(0, Math.min(100, ((s.current_step - 2) / 8) * 100));
              return (
                <div
                  key={s.token}
                  onClick={() => router.push(`/admin/onboard/${s.token}`)}
                  style={{
                    background: CARD,
                    border: `1px solid ${CARD_BORDER}`,
                    borderLeft: `3px solid ${st.border}`,
                    boxShadow: CARD_SHADOW,
                    borderRadius: 16,
                    padding: "20px 24px",
                    cursor: "pointer",
                    transition: "box-shadow 0.15s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(15,28,40,0.08), 0 12px 32px rgba(15,28,40,0.12)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = CARD_SHADOW; }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: NAVY }}>
                          {s.owner_name || "Unnamed"}
                        </p>
                        <span style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: st.badge,
                          background: st.badgeBg,
                          padding: "2px 8px",
                          borderRadius: 6,
                        }}>
                          {st.label}
                        </span>
                      </div>
                      {s.owner_email && (
                        <p style={{ margin: "0 0 2px", fontSize: 14, color: MUTED }}>{s.owner_email}</p>
                      )}
                      {s.property_address && (
                        <p style={{ margin: "0 0 12px", fontSize: 14, color: MUTED }}>{s.property_address}</p>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 13, color: SUBTLE, flexShrink: 0 }}>
                          Step {s.current_step} of 10
                        </span>
                        <div style={{ flex: 1, height: 5, background: "rgba(15,28,40,0.08)", borderRadius: 3 }}>
                          <div style={{
                            height: "100%",
                            width: `${progress}%`,
                            background: BURGUNDY,
                            borderRadius: 3,
                            transition: "width 0.3s",
                          }} />
                        </div>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: SUBTLE, flexShrink: 0, paddingTop: 2 }}>
                      {timeAgo(s.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
