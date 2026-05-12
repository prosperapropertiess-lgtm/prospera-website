"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Agent {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  total_applications: number;
  approved_applications: number;
}

export default function AdminAgentsPage() {
  const FONT = "var(--font-dm-sans, sans-serif)";

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  function loadAgents() {
    fetch("/api/admin/agents")
      .then((r) => r.json())
      .then((data) => {
        const agents = Array.isArray(data) ? data : [];
        agents.sort((a, b) => b.total_applications - a.total_applications);
        setAgents(agents);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => { loadAgents(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) {
        setFormError(json.error ?? "Failed to create agent");
      } else {
        setFormSuccess(`${json.name} has been added as an agent.`);
        setForm({ name: "", email: "", password: "" });
        loadAgents();
      }
    } catch {
      setFormError("Request failed. Check your connection.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleAgent(agent: Agent) {
    setTogglingId(agent.id);
    try {
      const res = await fetch(`/api/admin/agents/${agent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !agent.is_active }),
      });
      if (res.ok) {
        setAgents((prev) =>
          prev.map((a) => a.id === agent.id ? { ...a, is_active: !a.is_active } : a)
        );
      }
    } catch {
      // silently fail
    } finally {
      setTogglingId(null);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #E2E8F0",
    borderRadius: 8,
    fontSize: 13,
    color: "#1F2F3A",
    fontFamily: FONT,
    boxSizing: "border-box",
    outline: "none",
  };

  return (
    <div style={{ padding: "32px 24px", maxWidth: 900, margin: "0 auto", fontFamily: FONT }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1F2F3A" }}>Agents</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748B" }}>Manage leasing agents</p>
        </div>
        <Link href="/admin" style={{ fontSize: 13, color: "#8B2030", textDecoration: "none" }}>← Back to Admin</Link>
      </div>

      {/* Add Agent Form */}
      <div style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: 12,
        padding: "24px",
        marginBottom: 28,
      }}>
        <h3 style={{ margin: "0 0 18px", fontSize: 14, fontWeight: 700, color: "#1F2F3A" }}>Add New Agent</h3>
        <form onSubmit={handleCreate}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 5, fontWeight: 500 }}>Full Name</label>
              <input
                style={inputStyle}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Jane Smith"
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 5, fontWeight: 500 }}>Email</label>
              <input
                style={inputStyle}
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="jane@example.com"
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 5, fontWeight: 500 }}>Password</label>
              <input
                style={inputStyle}
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Min. 8 characters"
                required
                minLength={8}
              />
            </div>
          </div>

          {formError && (
            <p style={{ margin: "0 0 10px", fontSize: 12, color: "#DC2626" }}>{formError}</p>
          )}
          {formSuccess && (
            <p style={{ margin: "0 0 10px", fontSize: 12, color: "#065F46" }}>{formSuccess}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "10px 22px",
              backgroundColor: submitting ? "#94A3B8" : "#1F2F3A",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: submitting ? "not-allowed" : "pointer",
              fontFamily: FONT,
            }}
          >
            {submitting ? "Creating..." : "Add Agent"}
          </button>
        </form>
      </div>

      {/* Agents Table */}
      {loading ? (
        <p style={{ color: "#94A3B8", fontSize: 14 }}>Loading...</p>
      ) : agents.length === 0 ? (
        <p style={{ color: "#94A3B8", fontSize: 14 }}>No agents yet. Add one above.</p>
      ) : (
        <div style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 12,
          overflow: "hidden",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #E2E8F0", backgroundColor: "#F8FAFC" }}>
                {["Name", "Email", "Applications", "Approved", "Status", "Added", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: "#64748B", fontWeight: 600, fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                  <td style={{ padding: "13px 16px", fontWeight: 600, color: "#1F2F3A" }}>{agent.name}</td>
                  <td style={{ padding: "13px 16px", color: "#475569" }}>{agent.email}</td>
                  <td style={{ padding: "13px 16px", color: "#1F2F3A", fontWeight: 600 }}>{agent.total_applications}</td>
                  <td style={{ padding: "13px 16px", color: agent.approved_applications > 0 ? "#065F46" : "#94A3B8", fontWeight: 600 }}>{agent.approved_applications}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 600,
                      backgroundColor: agent.is_active ? "#D1FAE5" : "#F1F5F9",
                      color: agent.is_active ? "#065F46" : "#64748B",
                    }}>
                      {agent.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px", color: "#94A3B8" }}>
                    {new Date(agent.created_at).toLocaleDateString("en-CA")}
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <button
                      onClick={() => toggleAgent(agent)}
                      disabled={togglingId === agent.id}
                      style={{
                        padding: "5px 12px",
                        backgroundColor: agent.is_active ? "#FEF2F2" : "#F0FDF4",
                        border: agent.is_active ? "1px solid #FECACA" : "1px solid #BBF7D0",
                        color: agent.is_active ? "#991B1B" : "#065F46",
                        borderRadius: 6,
                        fontSize: 12,
                        cursor: togglingId === agent.id ? "not-allowed" : "pointer",
                        fontWeight: 500,
                        fontFamily: FONT,
                      }}
                    >
                      {togglingId === agent.id ? "..." : agent.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
