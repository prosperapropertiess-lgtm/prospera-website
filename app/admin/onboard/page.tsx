"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const BG      = "#080c14";
const SURFACE = "#0f1520";
const SURFACE_HI = "#141d2c";
const BORDER  = "rgba(255,255,255,0.07)";
const TEXT    = "#EDE9E3";
const TEXT_SEC = "rgba(237,233,227,0.5)";
const TEXT_MUT = "rgba(237,233,227,0.25)";
const ACCENT  = "#8B2030";
const GREEN   = "#22c55e";
const AMBER   = "#f59e0b";

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

function stepLabel(step: number) {
  const labels: Record<number, string> = {
    2: "Owner Info",
    3: "Property Details",
    4: "Lease & Details",
    5: "Agreement",
    6: "Keys & Access",
    7: "Inspection",
    8: "Tenants Notified",
    9: "Financial Setup",
    10: "Complete",
  };
  return labels[step] ?? `Step ${step}`;
}

function statusDot(status: string) {
  if (status === "complete") return { color: GREEN, label: "Complete" };
  if (status === "abandoned") return { color: TEXT_MUT, label: "Abandoned" };
  return { color: AMBER, label: "In Progress" };
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function OnboardListPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/onboard/list")
      .then((r) => r.json())
      .then((d) => { setSessions(d.sessions ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function startNew() {
    setCreating(true);
    const r = await fetch("/api/onboard/create", { method: "POST" });
    const d = await r.json();
    if (d.token) {
      router.push(`/admin/onboard/${d.token}`);
    } else {
      setCreating(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, color: TEXT, fontFamily: "var(--font-dm-sans, sans-serif)" }}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${BORDER}`, padding: "24px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <Link href="/admin" style={{ color: TEXT_MUT, fontSize: 13, textDecoration: "none", letterSpacing: "0.05em" }}>
            ← Admin
          </Link>
          <h1 style={{ margin: "8px 0 0", fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>
            Landlord Onboarding
          </h1>
        </div>
        <button
          onClick={startNew}
          disabled={creating}
          style={{
            backgroundColor: ACCENT,
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "12px 24px",
            fontSize: 14,
            fontWeight: 600,
            cursor: creating ? "not-allowed" : "pointer",
            opacity: creating ? 0.7 : 1,
            letterSpacing: "-0.01em",
          }}
        >
          {creating ? "Creating…" : "+ Onboard New Landlord"}
        </button>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: 80, borderRadius: 12, backgroundColor: SURFACE, animation: "pulse 2s infinite" }} />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>🏠</p>
            <p style={{ color: TEXT_SEC, fontSize: 15 }}>No onboardings yet.</p>
            <p style={{ color: TEXT_MUT, fontSize: 13, marginTop: 4 }}>Click the button above to start one.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sessions.map((s) => {
              const dot = statusDot(s.status);
              const progress = Math.round(((s.current_step - 2) / 9) * 100);
              return (
                <Link
                  key={s.token}
                  href={`/admin/onboard/${s.token}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      backgroundColor: SURFACE,
                      border: `1px solid ${BORDER}`,
                      borderRadius: 12,
                      padding: "18px 22px",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      cursor: "pointer",
                      transition: "background-color 0.15s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = SURFACE_HI; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = SURFACE; }}
                  >
                    {/* Status dot */}
                    <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: dot.color, flexShrink: 0 }} />

                    {/* Name + address */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: TEXT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {s.owner_name || "Unnamed"}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: 13, color: TEXT_SEC, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {s.property_address || "No address yet"}{s.owner_email ? ` · ${s.owner_email}` : ""}
                      </p>
                    </div>

                    {/* Progress bar */}
                    {s.status !== "complete" && (
                      <div style={{ width: 120, flexShrink: 0 }}>
                        <div style={{ height: 4, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
                          <div style={{ height: "100%", width: `${progress}%`, backgroundColor: ACCENT, borderRadius: 2, transition: "width 0.3s" }} />
                        </div>
                        <p style={{ margin: "4px 0 0", fontSize: 12, color: TEXT_MUT, textAlign: "right" }}>
                          {stepLabel(s.current_step)}
                        </p>
                      </div>
                    )}

                    {/* Status badge */}
                    <div style={{
                      padding: "4px 10px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      color: dot.color,
                      backgroundColor: `${dot.color}18`,
                      flexShrink: 0,
                    }}>
                      {dot.label}
                    </div>

                    {/* Time */}
                    <p style={{ margin: 0, fontSize: 12, color: TEXT_MUT, flexShrink: 0 }}>
                      {timeAgo(s.created_at)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
