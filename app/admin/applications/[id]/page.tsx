"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:    { bg: "#FEF3C7", text: "#92400E" },
  processing: { bg: "#DBEAFE", text: "#1E40AF" },
  reviewed:   { bg: "#EDE9FE", text: "#5B21B6" },
  approved:   { bg: "#D1FAE5", text: "#065F46" },
  rejected:   { bg: "#FEE2E2", text: "#991B1B" },
};

const DOC_LABELS: Record<string, string> = {
  paystub: "Pay Stub",
  bank_statement: "Bank Statement",
  employment_letter: "Employment Letter",
  id: "Government ID",
};

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

  useEffect(() => {
    fetch(`/api/admin/applications/${id}`)
      .then((r) => r.json())
      .then((data) => { setApp(data); setLoading(false); })
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
        <InfoRow label="Date of Birth" value={app.tenant_dob ?? null} />
        <InfoRow label="Current Address" value={app.current_address} />
      </Section>

      {/* Employment */}
      <Section title="Employment">
        <InfoRow label="Employer" value={app.employer_name} />
        <InfoRow label="Position" value={app.employer_position} />
        <InfoRow label="Type" value={app.employment_type?.replace(/_/g, " ")} />
        <InfoRow label="Start Date" value={app.employment_start ?? null} />
        <InfoRow label="Monthly Income" value={app.monthly_income != null ? `$${app.monthly_income.toLocaleString()}` : null} />
        {app.monthly_income != null && (
          <InfoRow
            label="Income-to-Rent Ratio"
            value={`${(app.monthly_income / app.monthly_rent).toFixed(2)}x (min 2.5x)`}
          />
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
                  {DOC_LABELS[doc.doc_type] ?? doc.doc_type}
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
      {app.ai_report && (
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
        }}>
          Documents are being processed. The AI report will appear here once complete.
        </div>
      )}
    </div>
  );
}
