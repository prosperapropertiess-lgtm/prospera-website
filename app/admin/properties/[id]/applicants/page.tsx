"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:    { bg: "#FEF3C7", text: "#92400E" },
  processing: { bg: "#DBEAFE", text: "#1E40AF" },
  reviewed:   { bg: "#EDE9FE", text: "#5B21B6" },
  approved:   { bg: "#D1FAE5", text: "#065F46" },
  rejected:   { bg: "#FEE2E2", text: "#991B1B" },
};

interface Applicant {
  id: string;
  tenant_name: string;
  tenant_email: string;
  tenant_phone: string;
  monthly_income: number | null;
  monthly_rent: number;
  employment_type: string | null;
  employer_name: string | null;
  employer_position: string | null;
  status: string;
  ai_score: number | null;
  ai_report: string | null;
  admin_notes: string | null;
  created_at: string;
  agents: { name: string } | null;
}

interface Property {
  address: string;
  city: string;
  price: number;
}

export default function PropertyApplicantsPage() {
  const params = useParams();
  const id = params.id as string;
  const FONT = "var(--font-dm-sans, sans-serif)";

  const [property, setProperty] = useState<Property | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/properties/${id}/applicants`)
      .then((r) => r.json())
      .then((data) => {
        setProperty(data.property);
        setApplicants(data.applications ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const scoreColor = (score: number | null) =>
    score == null ? "#94A3B8" : score >= 7 ? "#065F46" : score >= 5 ? "#92400E" : "#991B1B";

  const ratio = (income: number | null, rent: number) =>
    income ? (income / rent).toFixed(2) + "x" : "—";

  if (loading) return <div style={{ padding: 40, fontFamily: FONT, color: "#94A3B8" }}>Loading...</div>;

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1200, margin: "0 auto", fontFamily: FONT }}>
      <div style={{ marginBottom: 28 }}>
        <Link href={`/admin/properties`} style={{ fontSize: 12, color: "#8B2030", textDecoration: "none" }}>← Properties</Link>
        <h1 style={{ margin: "8px 0 4px", fontSize: 22, fontWeight: 700, color: "#1F2F3A" }}>
          {property ? `${property.address}, ${property.city}` : "Applicants"}
        </h1>
        <p style={{ margin: 0, fontSize: 13, color: "#64748B" }}>
          {applicants.length} applicant{applicants.length !== 1 ? "s" : ""} — ranked by AI score
        </p>
      </div>

      {applicants.length === 0 ? (
        <p style={{ color: "#94A3B8", fontSize: 14 }}>No applications for this property yet.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {applicants.map((app, rank) => {
            const colors = STATUS_COLORS[app.status] ?? { bg: "#F1F5F9", text: "#475569" };
            const incomeRatio = app.monthly_income ? app.monthly_income / app.monthly_rent : null;
            const ratioOk = incomeRatio == null ? null : incomeRatio >= 2.5;

            return (
              <div key={app.id} style={{
                backgroundColor: "#FFFFFF",
                border: rank === 0 && app.ai_score != null ? "2px solid #BBF7D0" : "1px solid #E2E8F0",
                borderRadius: 12,
                padding: "20px",
                position: "relative",
              }}>
                {rank === 0 && app.ai_score != null && (
                  <div style={{
                    position: "absolute", top: -1, left: 16,
                    backgroundColor: "#065F46", color: "#FFFFFF",
                    fontSize: 10, fontWeight: 700, padding: "2px 8px",
                    borderRadius: "0 0 6px 6px", letterSpacing: "0.08em",
                  }}>
                    TOP APPLICANT
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, marginTop: rank === 0 && app.ai_score != null ? 8 : 0 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1F2F3A" }}>{app.tenant_name}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94A3B8" }}>{app.tenant_email}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {app.ai_score != null && (
                      <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: scoreColor(app.ai_score) }}>{app.ai_score}/10</p>
                    )}
                    <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600, backgroundColor: colors.bg, color: colors.text, textTransform: "capitalize" }}>
                      {app.status}
                    </span>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: "#94A3B8" }}>Monthly income</span>
                    <span style={{ color: "#1F2F3A", fontWeight: 500 }}>{app.monthly_income ? `$${app.monthly_income.toLocaleString()}` : "—"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: "#94A3B8" }}>Income ratio</span>
                    <span style={{ color: ratioOk === null ? "#94A3B8" : ratioOk ? "#065F46" : "#991B1B", fontWeight: 600 }}>
                      {ratio(app.monthly_income, app.monthly_rent)}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: "#94A3B8" }}>Employment</span>
                    <span style={{ color: "#475569" }}>{app.employer_position ?? app.employment_type ?? "—"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: "#94A3B8" }}>Agent</span>
                    <span style={{ color: "#475569" }}>{app.agents?.name ?? "—"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: "#94A3B8" }}>Applied</span>
                    <span style={{ color: "#94A3B8" }}>{new Date(app.created_at).toLocaleDateString("en-CA")}</span>
                  </div>
                </div>

                <Link
                  href={`/admin/applications/${app.id}`}
                  style={{
                    display: "block",
                    marginTop: 14,
                    padding: "8px",
                    textAlign: "center",
                    backgroundColor: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "#475569",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  Full Review →
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
