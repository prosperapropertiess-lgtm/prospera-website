"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Listing {
  id: string;
  address: string;
  city: string;
  status: string;
  is_managed: boolean;
  available: boolean;
  published_at: string | null;
}

interface PendingApp {
  id: string;
  tenant_name: string;
  status: string;
  created_at: string;
  property_label: string;
}

interface HealthData {
  checked_at: string;
  issues: string[];
  agent: { id: string; name: string; is_active: boolean } | null;
  listings: Listing[];
  pending_applications: PendingApp[];
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  published: { bg: "#D1FAE5", text: "#065F46" },
  draft: { bg: "#FEF3C7", text: "#92400E" },
  rented: { bg: "#E0E7FF", text: "#3730A3" },
  archived: { bg: "#F1F5F9", text: "#64748B" },
};

export default function HealthPage() {
  const FONT = "var(--font-dm-sans, sans-serif)";
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetch("/api/admin/health")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  if (loading || !data) {
    return <div style={{ padding: 40, fontFamily: FONT, color: "#64748B" }}>Loading...</div>;
  }

  const ok = data.issues.length === 0;

  return (
    <div style={{ padding: "32px 24px", maxWidth: 1000, margin: "0 auto", fontFamily: FONT }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1F2F3A" }}>System Health</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666666" }}>Everything in one place — no more guessing whether a link actually works.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={load}
            style={{ padding: "8px 16px", backgroundColor: "#FFFFFF", border: "1px solid #D8D2C8", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#1F2F3A", cursor: "pointer", fontFamily: FONT }}
          >
            Refresh
          </button>
          <Link href="/admin" style={{ fontSize: 13, color: "#8B2030", textDecoration: "none", alignSelf: "center" }}>← Back to Admin</Link>
        </div>
      </div>

      {/* Status banner */}
      <div style={{
        backgroundColor: ok ? "#F0FDF4" : "#FEF2F2",
        border: `1px solid ${ok ? "#BBF7D0" : "#FECACA"}`,
        borderRadius: 12,
        padding: "18px 24px",
        marginBottom: 24,
      }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: ok ? "#065F46" : "#991B1B" }}>
          {ok ? "✓ Everything looks healthy" : `⚠ ${data.issues.length} issue${data.issues.length > 1 ? "s" : ""} found`}
        </p>
        {!ok && (
          <ul style={{ margin: "10px 0 0", paddingLeft: 20 }}>
            {data.issues.map((issue, i) => (
              <li key={i} style={{ fontSize: 13, color: "#991B1B", marginBottom: 4 }}>{issue}</li>
            ))}
          </ul>
        )}
        <p style={{ margin: "10px 0 0", fontSize: 11, color: "#94A3B8" }}>Checked {new Date(data.checked_at).toLocaleString()}</p>
      </div>

      {/* Agent status */}
      <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #D8D2C8", borderRadius: 12, padding: "18px 24px", marginBottom: 24 }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: "#1F2F3A" }}>Active Agent</h3>
        {data.agent ? (
          <p style={{ margin: 0, fontSize: 13, color: "#333333" }}>
            <span style={{ color: "#2D7A4F", fontWeight: 600 }}>●</span> {data.agent.name} — apply links are working
          </p>
        ) : (
          <p style={{ margin: 0, fontSize: 13, color: "#991B1B" }}>
            <span style={{ fontWeight: 600 }}>●</span> No active agent — every apply link is broken right now
          </p>
        )}
      </div>

      {/* Listings */}
      <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #D8D2C8", borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #F1F5F9" }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1F2F3A" }}>Listings ({data.listings.length})</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #F1F5F9" }}>
                {["Address", "Status", "Managed", "Available", "Published"].map((h) => (
                  <th key={h} style={{ padding: "8px 24px", textAlign: "left", color: "#666666", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.listings.map((l) => {
                const colors = STATUS_COLORS[l.status] ?? { bg: "#F7F5F2", text: "#333333" };
                return (
                  <tr key={l.id} style={{ borderBottom: "1px solid #F7F5F2" }}>
                    <td style={{ padding: "10px 24px", color: "#1F2F3A", fontWeight: 500 }}>{l.address}, {l.city}</td>
                    <td style={{ padding: "10px 24px" }}>
                      <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, backgroundColor: colors.bg, color: colors.text, textTransform: "capitalize" }}>{l.status}</span>
                    </td>
                    <td style={{ padding: "10px 24px", color: l.is_managed ? "#2D7A4F" : "#991B1B" }}>{l.is_managed ? "Yes" : "No"}</td>
                    <td style={{ padding: "10px 24px", color: l.available ? "#2D7A4F" : "#991B1B" }}>{l.available ? "Yes" : "No"}</td>
                    <td style={{ padding: "10px 24px", color: "#94A3B8" }}>{l.published_at ? new Date(l.published_at).toLocaleDateString() : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending applications */}
      <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #D8D2C8", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #F1F5F9" }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1F2F3A" }}>Applications Needing a Decision ({data.pending_applications.length})</h3>
        </div>
        {data.pending_applications.length === 0 ? (
          <p style={{ padding: 24, fontSize: 13, color: "#64748B" }}>Nothing pending.</p>
        ) : (
          data.pending_applications.map((a) => (
            <Link
              key={a.id}
              href={`/admin/applications/${a.id}`}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", borderBottom: "1px solid #F1F5F9", textDecoration: "none" }}
            >
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1F2F3A" }}>{a.tenant_name}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94A3B8" }}>{a.property_label} · {new Date(a.created_at).toLocaleDateString()}</p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#8B2030", textTransform: "capitalize" }}>{a.status} →</span>
            </Link>
          ))
        )}
      </div>

      <p style={{ marginTop: 20, fontSize: 12, color: "#94A3B8" }}>
        Agent activity log: <Link href="/admin/api-keys" style={{ color: "#8B2030" }}>/admin/api-keys</Link>
      </p>
    </div>
  );
}
