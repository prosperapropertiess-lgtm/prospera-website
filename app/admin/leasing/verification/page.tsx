"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const BG = "#F7F5F2";
const SURFACE = "#FFFFFF";
const BORDER = "#E5E1DC";
const TEXT = "#1F2F3A";
const TEXT_SEC = "#666666";
const TEXT_MUT = "#999999";
const ACCENT = "#8B2030";
const GREEN = "#2D7A4F";
const AMBER = "#B45309";

interface CampaignRef {
  id: string;
  owner_name: string | null;
  owner_email: string | null;
  property: { title: string | null; address: string | null; city: string | null } | null;
}

interface Application {
  id: string;
  stage: string;
  legal_name: string | null;
  email: string | null;
  phone: string | null;
  employment_status: string | null;
  approx_monthly_income: number | null;
  income_ratio: number | null;
  preliminary_submitted_at: string | null;
  documents_requested_at: string | null;
  updated_at: string;
  campaign: CampaignRef | null;
}

const STAGE_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  LINK_SENT:              { label: "Link Sent", bg: "#FEF3C7", text: "#92400E" },
  PRELIMINARY_SUBMITTED:  { label: "Submitted", bg: "#DBEAFE", text: "#1E40AF" },
  UNDER_REVIEW:           { label: "Under Review", bg: "#EDE9FE", text: "#5B21B6" },
  AWAITING_DOCUMENTS:     { label: "Awaiting Documents", bg: "#FEF3C7", text: "#92400E" },
  VERIFIED:               { label: "Verified", bg: "#DBEAFE", text: "#1E40AF" },
  APPROVED:               { label: "Approved", bg: "#D1FAE5", text: "#065F46" },
  DECLINED:               { label: "Declined", bg: "#FEE2E2", text: "#991B1B" },
  WITHDRAWN:              { label: "Withdrawn", bg: "#F3F4F6", text: "#6B7280" },
};

const IN_PROGRESS_STAGES = ["LINK_SENT", "PRELIMINARY_SUBMITTED", "UNDER_REVIEW", "AWAITING_DOCUMENTS", "VERIFIED"];

type Filter = "in_progress" | "approved" | "declined" | "all";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

export default function TenantVerificationPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("in_progress");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/leasing/applications").catch(() => null);
    if (res?.ok) setApps(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const counts = {
    in_progress: apps.filter((a) => IN_PROGRESS_STAGES.includes(a.stage)).length,
    approved: apps.filter((a) => a.stage === "APPROVED").length,
    declined: apps.filter((a) => ["DECLINED", "WITHDRAWN"].includes(a.stage)).length,
  };

  const filtered = apps.filter((a) => {
    if (filter === "in_progress") return IN_PROGRESS_STAGES.includes(a.stage);
    if (filter === "approved") return a.stage === "APPROVED";
    if (filter === "declined") return ["DECLINED", "WITHDRAWN"].includes(a.stage);
    return true;
  });

  const awaitingAction = apps.filter((a) => a.stage === "UNDER_REVIEW" || a.stage === "VERIFIED").length;

  return (
    <div style={{ backgroundColor: BG, minHeight: "100vh", fontFamily: "var(--font-dm-sans, sans-serif)" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px" }}>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Link href="/admin/hub/leasing" style={{ color: TEXT_MUT, fontSize: 13, textDecoration: "none" }}>← Leasing</Link>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: TEXT, margin: "0 0 4px" }}>Tenant Verification</h1>
        <p style={{ fontSize: 14, color: TEXT_SEC, margin: "0 0 24px" }}>Every applicant currently moving through document verification, across all properties.</p>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { key: "in_progress" as Filter, label: "In Progress", value: counts.in_progress, accent: awaitingAction > 0 },
            { key: "approved" as Filter, label: "Approved", value: counts.approved },
            { key: "declined" as Filter, label: "Declined / Withdrawn", value: counts.declined },
          ].map((s) => (
            <button key={s.key} onClick={() => setFilter(s.key)}
              style={{
                textAlign: "left", backgroundColor: SURFACE, cursor: "pointer",
                border: `1.5px solid ${filter === s.key ? ACCENT : BORDER}`, borderRadius: 12, padding: "16px 18px",
              }}>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: TEXT_MUT, margin: 0 }}>{s.label}</p>
              <p style={{ fontSize: 26, fontWeight: 700, color: s.accent ? ACCENT : TEXT, margin: "6px 0 0" }}>{s.value}</p>
            </button>
          ))}
        </div>

        {awaitingAction > 0 && filter !== "all" && (
          <div style={{ backgroundColor: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 10, padding: "10px 16px", marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: "#92400E", margin: 0, fontWeight: 600 }}>
              {awaitingAction} application{awaitingAction !== 1 ? "s" : ""} waiting on you — under review or fully verified and ready for a decision.
            </p>
          </div>
        )}

        {loading ? (
          <p style={{ color: TEXT_MUT, fontSize: 14 }}>Loading…</p>
        ) : filtered.length === 0 ? (
          <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 40, textAlign: "center" }}>
            <p style={{ color: TEXT_MUT, fontSize: 14, margin: 0 }}>Nothing here right now.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((app) => {
              const st = STAGE_LABELS[app.stage] ?? { label: app.stage, bg: BG, text: TEXT_MUT };
              const property = app.campaign?.property;
              const address = property ? `${property.address ?? property.title ?? "—"}${property.city ? `, ${property.city}` : ""}` : "—";
              const needsAction = app.stage === "UNDER_REVIEW" || app.stage === "VERIFIED";
              return (
                <Link key={app.id} href={app.campaign ? `/admin/leasing/${app.campaign.id}?tab=applications` : "#"} style={{ textDecoration: "none" }}>
                  <div style={{
                    backgroundColor: SURFACE, border: `1px solid ${needsAction ? "#FDE68A" : BORDER}`, borderRadius: 12,
                    padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{app.legal_name ?? "Unnamed applicant"}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, borderRadius: 20, padding: "2px 10px", backgroundColor: st.bg, color: st.text }}>{st.label}</span>
                      </div>
                      <p style={{ fontSize: 13, color: TEXT_SEC, margin: 0 }}>{address}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
                      {app.income_ratio && (
                        <div style={{ textAlign: "center" }}>
                          <p style={{ fontSize: 15, fontWeight: 700, margin: 0, color: app.income_ratio >= 3 ? GREEN : app.income_ratio >= 2.5 ? AMBER : ACCENT }}>{app.income_ratio}x</p>
                          <p style={{ fontSize: 10, color: TEXT_MUT, margin: 0 }}>income ratio</p>
                        </div>
                      )}
                      <span style={{ fontSize: 12, color: TEXT_MUT, whiteSpace: "nowrap" }}>Updated {fmtDate(app.updated_at)}</span>
                    </div>
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
