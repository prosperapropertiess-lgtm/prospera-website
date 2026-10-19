"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DOC_LABELS } from "@/lib/application-requirements";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:    { bg: "#FEF3C7", text: "#92400E" },
  processing: { bg: "#DBEAFE", text: "#1E40AF" },
  reviewed:   { bg: "#EDE9FE", text: "#5B21B6" },
  approved:   { bg: "#D1FAE5", text: "#065F46" },
  rejected:   { bg: "#FEE2E2", text: "#991B1B" },
};

const VERDICT_STYLE: Record<string, { label: string; bg: string; text: string }> = {
  strong:          { label: "Strong",            bg: "#D1FAE5", text: "#065F46" },
  worth_a_call:    { label: "Worth a call",      bg: "#E0F2FE", text: "#075985" },
  needs_more_info: { label: "Needs more info",   bg: "#FEF3C7", text: "#92400E" },
  not_a_fit:       { label: "Probably not a fit", bg: "#FEE2E2", text: "#991B1B" },
};

const CHECK_ICON: Record<string, { icon: string; color: string }> = {
  verified:     { icon: "✓", color: "#065F46" },
  claimed_only: { icon: "•", color: "#64748B" },
  concern:      { icon: "!", color: "#B45309" },
  missing:      { icon: "○", color: "#991B1B" },
};

const INCOME_SOURCE_LABEL: Record<string, string> = {
  employed: "Has a job", self_employed: "Self-employed", student: "Student", retired: "Retired", other: "Other",
};

const TIME_AT_ADDRESS_LABEL: Record<string, string> = {
  under_1: "Under 1 year", "1_2": "1–2 years", "2_5": "2–5 years", "5_plus": "5+ years",
};

interface Summary {
  verdict: string;
  score: number;
  headline: string;
  checks: { topic: string; status: string; detail: string }[];
  questions_to_ask: string[];
  verified_monthly_income: number | null;
  rent_share_of_income_pct: number | null;
  id_name_matches: boolean | null;
  documents: { type: string; readable: boolean; note: string }[];
}

interface Document {
  id: string;
  doc_type: string;
  storage_path: string;
  signed_url: string | null;
  created_at: string;
}

interface Application {
  id: string;
  tenant_name: string;
  tenant_email: string;
  tenant_phone: string;
  tenant_dob: string | null;
  current_address: string | null;
  employer_name: string | null;
  employer_position: string | null;
  monthly_income: number | null;
  employment_start: string | null;
  employment_type: string | null;
  landlord_ref_name: string | null;
  landlord_ref_phone: string | null;
  landlord_ref_email: string | null;
  employer_ref_name: string | null;
  employer_ref_phone: string | null;
  employer_ref_email: string | null;
  monthly_rent: number;
  status: string;
  ai_score: number | null;
  ai_report: string | null;
  ai_summary: Summary | null;
  ai_error: string | null;
  admin_notes: string | null;
  income_source: string | null;
  income_notes: string | null;
  move_in_date: string | null;
  occupants: number | null;
  co_applicants: { name: string; email: string | null; phone: string | null }[];
  pets: string | null;
  smokes: boolean | null;
  vehicles: number | null;
  time_at_address: string | null;
  current_rent: number | null;
  reason_for_moving: string | null;
  consent_at: string | null;
  other_applicants: { id: string; tenant_name: string; ai_score: number | null; status: string }[];
  created_at: string;
  properties: { address: string; city: string; price: number } | null;
  agents: { name: string; email: string } | null;
  documents: Document[];
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  const FONT = "var(--font-dm-sans, sans-serif)";
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
      <span style={{ fontSize: 12, color: "#94A3B8", fontFamily: FONT, width: 160, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: "#1F2F3A", fontFamily: FONT, fontWeight: 500 }}>{value || "—"}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const FONT = "var(--font-dm-sans, sans-serif)";
  return (
    <div style={{
      backgroundColor: "#FFFFFF",
      border: "1px solid #E2E8F0",
      borderRadius: 10,
      padding: "20px 24px",
      marginBottom: 16,
    }}>
      <h3 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: FONT }}>{title}</h3>
      {children}
    </div>
  );
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const FONT = "var(--font-dm-sans, sans-serif)";

  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [rescreening, setRescreening] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/applications/${id}`)
      .then((r) => r.json())
      .then((data) => { setApp(data); setNotes(data.admin_notes ?? ""); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleAction(action: "approve" | "reject") {
    if (!confirm(`${action === "approve" ? "Approve" : "Reject"} this application? The tenant will be notified by email.`)) return;
    setActionLoading(action);
    setError("");
    try {
      const res = await fetch(`/api/admin/applications/${id}/${action}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Action failed");
      } else {
        setApp((prev) => prev ? { ...prev, status: action === "approve" ? "approved" : "rejected" } : prev);
      }
    } catch {
      setError("Request failed");
    } finally {
      setActionLoading(null);
    }
  }

  async function rescreen() {
    setRescreening(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/applications/${id}/rescreen`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "AI review failed");
      } else {
        const fresh = await fetch(`/api/admin/applications/${id}`).then((r) => r.json());
        setApp(fresh);
      }
    } catch {
      setError("AI review failed");
    } finally {
      setRescreening(false);
    }
  }

  async function saveNotes() {
    setNotesSaving(true);
    setNotesSaved(false);
    try {
      await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_notes: notes }),
      });
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } finally {
      setNotesSaving(false);
    }
  }

  if (loading) return <div style={{ padding: 40, fontFamily: FONT, color: "#94A3B8" }}>Loading...</div>;
  if (!app) return <div style={{ padding: 40, fontFamily: FONT, color: "#991B1B" }}>Application not found.</div>;

  const statusColors = STATUS_COLORS[app.status] ?? { bg: "#F1F5F9", text: "#475569" };
  const scoreColor = app.ai_score == null ? "#94A3B8"
    : app.ai_score >= 7 ? "#065F46"
    : app.ai_score >= 5 ? "#92400E"
    : "#991B1B";
  const canAct = !["approved", "rejected"].includes(app.status);

  return (
    <div style={{ padding: "32px 24px", maxWidth: 860, margin: "0 auto", fontFamily: FONT }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
        <div>
          <Link href="/admin/applications" style={{ fontSize: 12, color: "#8B2030", textDecoration: "none" }}>← Back to Applications</Link>
          <h1 style={{ margin: "8px 0 4px", fontSize: 22, fontWeight: 700, color: "#1F2F3A" }}>{app.tenant_name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              padding: "3px 12px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              backgroundColor: statusColors.bg,
              color: statusColors.text,
              textTransform: "capitalize",
            }}>
              {app.status}
            </span>
            {app.ai_score != null && (
              <span style={{ fontSize: 13, fontWeight: 700, color: scoreColor }}>
                AI Score: {app.ai_score}/10
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        {canAct && (
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => handleAction("reject")}
              disabled={actionLoading !== null}
              style={{
                padding: "10px 20px",
                backgroundColor: actionLoading === "reject" ? "#F1F5F9" : "#FFFFFF",
                border: "1px solid #FECACA",
                color: "#991B1B",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: actionLoading !== null ? "not-allowed" : "pointer",
                fontFamily: FONT,
              }}
            >
              {actionLoading === "reject" ? "Rejecting..." : "Reject"}
            </button>
            <button
              onClick={() => handleAction("approve")}
              disabled={actionLoading !== null}
              style={{
                padding: "10px 20px",
                backgroundColor: actionLoading === "approve" ? "#F0FDF4" : "#065F46",
                border: "none",
                color: actionLoading === "approve" ? "#065F46" : "#FFFFFF",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: actionLoading !== null ? "not-allowed" : "pointer",
                fontFamily: FONT,
              }}
            >
              {actionLoading === "approve" ? "Approving..." : "Approve"}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div style={{ padding: "10px 14px", backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, color: "#991B1B", fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* AI summary */}
      {app.ai_summary ? (() => {
        const s = app.ai_summary;
        const v = VERDICT_STYLE[s.verdict] ?? VERDICT_STYLE.needs_more_info;
        const ranked = [...app.other_applicants.map((o) => o.ai_score), s.score].filter((x): x is number => x != null).sort((a, b) => b - a);
        const rank = ranked.indexOf(s.score) + 1;
        return (
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 14, padding: "24px 26px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
              <span style={{ padding: "5px 14px", borderRadius: 20, fontSize: 15, fontWeight: 700, backgroundColor: v.bg, color: v.text }}>{v.label}</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#1F2F3A" }}>{s.score}/10</span>
              {ranked.length > 1 && (
                <span style={{ fontSize: 14, color: "#64748B" }}>#{rank} of {ranked.length} for this unit</span>
              )}
            </div>
            <p style={{ margin: "0 0 18px", fontSize: 19, fontWeight: 600, color: "#1F2F3A", lineHeight: 1.4 }}>{s.headline}</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
              {s.checks.map((c, i) => {
                const ic = CHECK_ICON[c.status] ?? CHECK_ICON.claimed_only;
                return (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ width: 22, height: 22, borderRadius: 11, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#FFFFFF", backgroundColor: ic.color }}>{ic.icon}</span>
                    <p style={{ margin: 0, fontSize: 15, color: "#1F2F3A", lineHeight: 1.5 }}>
                      <strong>{c.topic}.</strong> {c.detail}
                    </p>
                  </div>
                );
              })}
            </div>

            {s.questions_to_ask.length > 0 && (
              <div style={{ backgroundColor: "#F7F5F2", borderRadius: 10, padding: "14px 18px", marginBottom: 14 }}>
                <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em" }}>Ask them</p>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {s.questions_to_ask.map((q, i) => <li key={i} style={{ fontSize: 15, color: "#1F2F3A", marginBottom: 4, lineHeight: 1.5 }}>{q}</li>)}
                </ul>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <p style={{ margin: 0, fontSize: 13, color: "#64748B" }}>AI summary to help you review. You make the call.</p>
              <button onClick={rescreen} disabled={rescreening} style={{ background: "none", border: "1px solid #E2E8F0", borderRadius: 6, padding: "6px 12px", fontSize: 13, color: "#1F2F3A", cursor: rescreening ? "not-allowed" : "pointer", fontFamily: FONT }}>
                {rescreening ? "Reading again..." : "Run AI again"}
              </button>
            </div>
          </div>
        );
      })() : app.status !== "processing" && (
        <div style={{ padding: "16px 20px", backgroundColor: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 10, fontSize: 14, color: "#92400E", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <span>{app.ai_error ? `The AI couldn't finish this one: ${app.ai_error}` : "No AI summary yet."}</span>
          <button onClick={rescreen} disabled={rescreening} style={{ background: "#FFFFFF", border: "1px solid #FDE68A", borderRadius: 6, padding: "6px 12px", fontSize: 13, color: "#92400E", cursor: rescreening ? "not-allowed" : "pointer", fontFamily: FONT }}>
            {rescreening ? "Reading..." : "Run AI now"}
          </button>
        </div>
      )}

      {/* Property + Agent */}
      <Section title="Application Details">
        <InfoRow label="Property" value={app.properties ? `${app.properties.address}, ${app.properties.city}` : null} />
        <InfoRow label="Monthly Rent" value={`$${app.monthly_rent?.toLocaleString()}/mo`} />
        <InfoRow label="Agent" value={app.agents ? `${app.agents.name} (${app.agents.email})` : null} />
        <InfoRow label="Submitted" value={new Date(app.created_at).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })} />
      </Section>

      {/* Tenant Info */}
      <Section title="Tenant Information">
        <InfoRow label="Full Name" value={app.tenant_name} />
        <InfoRow label="Email" value={app.tenant_email} />
        <InfoRow label="Phone" value={app.tenant_phone} />
        {app.tenant_dob && <InfoRow label="Date of Birth" value={app.tenant_dob} />}
        <InfoRow label="Move-in Date" value={app.move_in_date} />
        <InfoRow label="People Living There" value={app.occupants != null ? String(app.occupants) : null} />
        {app.co_applicants?.map((c, i) => (
          <InfoRow key={i} label={`Also on Lease`} value={[c.name, c.email, c.phone].filter(Boolean).join(" · ")} />
        ))}
        <InfoRow label="Pets" value={app.pets ?? (app.consent_at ? "None" : null)} />
        <InfoRow label="Smokes" value={app.smokes == null ? null : app.smokes ? "Yes" : "No"} />
        <InfoRow label="Vehicles" value={app.vehicles != null ? String(app.vehicles) : null} />
      </Section>

      {/* Where they live now */}
      <Section title="Where They Live Now">
        <InfoRow label="Current Address" value={app.current_address} />
        <InfoRow label="Time There" value={app.time_at_address ? TIME_AT_ADDRESS_LABEL[app.time_at_address] : null} />
        <InfoRow label="Rent Now" value={app.current_rent != null ? `$${Number(app.current_rent).toLocaleString()}/mo` : null} />
        <InfoRow label="Why Moving" value={app.reason_for_moving} />
      </Section>

      {/* Employment */}
      <Section title="Income">
        <InfoRow label="Income Source" value={app.income_source ? INCOME_SOURCE_LABEL[app.income_source] : null} />
        {app.income_notes && <InfoRow label="Notes" value={app.income_notes} />}
        <InfoRow label="Employer / School" value={app.employer_name} />
        <InfoRow label="Position" value={app.employer_position} />
        <InfoRow label="Type" value={app.employment_type?.replace(/_/g, " ")} />
        <InfoRow label="Start Date" value={app.employment_start ?? null} />
        <InfoRow label="Monthly Income" value={app.monthly_income != null ? `$${app.monthly_income.toLocaleString()}` : null} />
        {app.monthly_income != null && app.monthly_income > 0 && (
          <InfoRow
            label="Rent Share of Income"
            value={`${Math.round((app.monthly_rent / app.monthly_income) * 100)}% of what they say they earn`}
          />
        )}
        {app.ai_summary?.verified_monthly_income != null && (
          <InfoRow label="Income the AI Could Confirm" value={`$${app.ai_summary.verified_monthly_income.toLocaleString()}/mo`} />
        )}
      </Section>

      {/* References */}
      <Section title="References">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
          <div>
            <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Previous Landlord</p>
            <InfoRow label="Name" value={app.landlord_ref_name} />
            <InfoRow label="Phone" value={app.landlord_ref_phone} />
            <InfoRow label="Email" value={app.landlord_ref_email} />
          </div>
          <div>
            <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Employer</p>
            <InfoRow label="Name" value={app.employer_ref_name} />
            <InfoRow label="Phone" value={app.employer_ref_phone} />
            <InfoRow label="Email" value={app.employer_ref_email} />
          </div>
        </div>
      </Section>

      {/* Documents */}
      <Section title={`Documents (${app.documents?.length ?? 0})`}>
        {!app.documents?.length ? (
          <p style={{ margin: 0, fontSize: 13, color: "#94A3B8" }}>No documents uploaded.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {app.documents.map((doc) => (
              <div key={doc.id} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                backgroundColor: "#F8FAFC",
                borderRadius: 8,
                border: "1px solid #E2E8F0",
              }}>
                <span style={{ fontSize: 13, color: "#1F2F3A", fontWeight: 500 }}>
                  {DOC_LABELS[doc.doc_type as keyof typeof DOC_LABELS] ?? doc.doc_type}
                </span>
                {doc.signed_url ? (
                  <a
                    href={doc.signed_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "5px 14px",
                      backgroundColor: "#1F2F3A",
                      color: "#FFFFFF",
                      borderRadius: 6,
                      fontSize: 12,
                      textDecoration: "none",
                      fontWeight: 500,
                    }}
                  >
                    View
                  </a>
                ) : (
                  <span style={{ fontSize: 12, color: "#94A3B8" }}>Link expired</span>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* AI Report */}
      {app.ai_report && !app.ai_summary && (
        <Section title={`AI Screening Report${app.ai_score != null ? ` — Score ${app.ai_score}/10` : ""}`}>
          <div style={{
            fontSize: 13,
            color: "#1F2F3A",
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
            fontFamily: "monospace",
            backgroundColor: "#F8FAFC",
            padding: 16,
            borderRadius: 8,
            border: "1px solid #E2E8F0",
            maxHeight: 500,
            overflowY: "auto",
          }}>
            {app.ai_report}
          </div>
        </Section>
      )}

      {!app.ai_report && app.status === "processing" && (
        <div style={{
          padding: "16px 20px",
          backgroundColor: "#EFF6FF",
          border: "1px solid #BFDBFE",
          borderRadius: 10,
          fontSize: 13,
          color: "#1E40AF",
          marginBottom: 16,
        }}>
          Documents are being processed. The AI report will appear here once complete.
        </div>
      )}

      {app.other_applicants.length > 0 && (
        <Section title="Others Who Applied for This Unit">
          {app.other_applicants.map((o) => (
            <Link key={o.id} href={`/admin/applications/${o.id}`} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F1F5F9", textDecoration: "none", fontSize: 14, color: "#1F2F3A" }}>
              <span style={{ fontWeight: 600 }}>{o.tenant_name}</span>
              <span style={{ color: "#64748B" }}>{o.ai_score != null ? `${o.ai_score}/10` : "No score"} · {o.status}</span>
            </Link>
          ))}
        </Section>
      )}

      {/* Admin Notes */}
      <Section title="Your Notes">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add private notes about this application — only visible to you."
          rows={4}
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "1px solid #E2E8F0",
            borderRadius: 8,
            fontSize: 13,
            color: "#1F2F3A",
            fontFamily: FONT,
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <button
          onClick={saveNotes}
          disabled={notesSaving}
          style={{
            marginTop: 10,
            padding: "8px 18px",
            backgroundColor: notesSaved ? "#D1FAE5" : "#1F2F3A",
            color: notesSaved ? "#065F46" : "#FFFFFF",
            border: "none",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            cursor: notesSaving ? "not-allowed" : "pointer",
            fontFamily: FONT,
            transition: "all 0.15s",
          }}
        >
          {notesSaving ? "Saving..." : notesSaved ? "✓ Saved" : "Save Notes"}
        </button>
      </Section>
    </div>
  );
}
