"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:    { bg: "#FEF3C7", text: "#92400E" },
  processing: { bg: "#DBEAFE", text: "#1E40AF" },
  reviewed:   { bg: "#EDE9FE", text: "#5B21B6" },
  approved:   { bg: "#D1FAE5", text: "#065F46" },
  rejected:   { bg: "#FEE2E2", text: "#991B1B" },
};

interface Application {
  id: string;
  tenant_name: string;
  tenant_email: string;
  monthly_rent: number;
  ai_score: number | null;
  status: string;
  created_at: string;
  properties: { address: string; city: string } | null;
  agents: { name: string } | null;
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const url = filter === "all"
      ? "/api/admin/applications"
      : `/api/admin/applications?status=${filter}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setApplications(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter]);

  const FONT = "var(--font-dm-sans, sans-serif)";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F7F5F2", fontFamily: FONT }}>
      <div style={{ padding: "32px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1F2F3A" }}>Applications</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666666" }}>All tenant rental applications</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {["all", "pending", "processing", "reviewed", "approved", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => { setFilter(s); setLoading(true); }}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 500,
                border: filter === s ? "none" : "1px solid #D8D2C8",
                backgroundColor: filter === s ? "#1F2F3A" : "#FFFFFF",
                color: filter === s ? "#FAF8F5" : "#333333",
                cursor: "pointer",
                fontFamily: FONT,
                textTransform: "capitalize",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: "#999999", fontSize: 14 }}>Loading...</p>
        ) : applications.length === 0 ? (
          <p style={{ color: "#999999", fontSize: 14 }}>No applications found.</p>
        ) : (
          <div style={{ overflowX: "auto", backgroundColor: "#FFFFFF", border: "1px solid #D8D2C8", borderRadius: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #D8D2C8" }}>
                  {["Tenant", "Property", "Agent", "Rent", "AI Score", "Status", "Date", ""].map((h) => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "#666666", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => {
                  const colors = STATUS_COLORS[app.status] ?? { bg: "#F7F5F2", text: "#333333" };
                  const scoreColor = app.ai_score == null ? "#999999"
                    : app.ai_score >= 7 ? "#065F46"
                    : app.ai_score >= 5 ? "#92400E"
                    : "#991B1B";
                  return (
                    <tr key={app.id} style={{ borderBottom: "1px solid #F7F5F2" }}>
                      <td style={{ padding: "12px" }}>
                        <div style={{ fontWeight: 600, color: "#1F2F3A" }}>{app.tenant_name}</div>
                        <div style={{ color: "#999999", fontSize: 11 }}>{app.tenant_email}</div>
                      </td>
                      <td style={{ padding: "12px", color: "#333333" }}>
                        {app.properties ? `${app.properties.address}, ${app.properties.city}` : "—"}
                      </td>
                      <td style={{ padding: "12px", color: "#333333" }}>{app.agents?.name ?? "—"}</td>
                      <td style={{ padding: "12px", color: "#333333" }}>${app.monthly_rent?.toLocaleString()}/mo</td>
                      <td style={{ padding: "12px", fontWeight: 700, color: scoreColor }}>
                        {app.ai_score != null ? `${app.ai_score}/10` : "—"}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span style={{
                          padding: "3px 10px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 600,
                          backgroundColor: colors.bg,
                          color: colors.text,
                          textTransform: "capitalize",
                        }}>
                          {app.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px", color: "#999999", whiteSpace: "nowrap" }}>
                        {new Date(app.created_at).toLocaleDateString("en-CA")}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <Link
                          href={`/admin/applications/${app.id}`}
                          style={{
                            padding: "5px 12px",
                            backgroundColor: "#1F2F3A",
                            color: "#FAF8F5",
                            borderRadius: 6,
                            fontSize: 12,
                            textDecoration: "none",
                            fontWeight: 500,
                          }}
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
