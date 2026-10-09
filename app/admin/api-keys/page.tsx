"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ApiKeyRow {
  id: string;
  label: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

interface ActivityRow {
  id: string;
  action: string;
  summary: string;
  created_at: string;
  api_keys: { label: string } | null;
}

const ACTION_LABELS: Record<string, string> = {
  create_listing: "Created listing",
  update_listing: "Updated listing",
  delete_listing: "Deleted listing",
  send_invite: "Sent invite",
};

export default function ApiKeysPage() {
  const FONT = "var(--font-dm-sans, sans-serif)";

  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  function loadKeys() {
    fetch("/api/admin/api-keys")
      .then((r) => r.json())
      .then((data) => {
        setKeys(data.keys ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  function loadActivity() {
    fetch("/api/admin/api-key-activity")
      .then((r) => r.json())
      .then((data) => {
        setActivity(data.activity ?? []);
        setActivityLoading(false);
      })
      .catch(() => setActivityLoading(false));
  }

  useEffect(() => { loadKeys(); loadActivity(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      const res = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to create key");
      } else {
        setNewKey(json.key);
        setLabel("");
        loadKeys();
      }
    } catch {
      setError("Request failed. Check your connection.");
    } finally {
      setCreating(false);
    }
  }

  async function revokeKey(id: string) {
    if (!confirm("Revoke this key? Anything using it will stop working immediately — this can't be undone.")) return;
    setRevokingId(id);
    try {
      await fetch(`/api/admin/api-keys/${id}`, { method: "DELETE" });
      loadKeys();
    } finally {
      setRevokingId(null);
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
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1F2F3A" }}>AI Agent Access</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748B" }}>
            Keys that let an outside AI tool (ChatGPT, etc.) create and edit listings on your behalf
          </p>
        </div>
        <Link href="/admin" style={{ fontSize: 13, color: "#8B2030", textDecoration: "none" }}>← Back to Admin</Link>
      </div>

      {/* Newly created key — shown exactly once */}
      {newKey && (
        <div style={{
          backgroundColor: "#F0FDF4",
          border: "1px solid #BBF7D0",
          borderRadius: 12,
          padding: "20px 24px",
          marginBottom: 24,
        }}>
          <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "#065F46" }}>
            Key created — copy it now, you won&apos;t be able to see it again.
          </p>
          <code style={{
            display: "block",
            backgroundColor: "#FFFFFF",
            border: "1px solid #BBF7D0",
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 13,
            color: "#1F2F3A",
            wordBreak: "break-all",
            marginBottom: 12,
          }}>
            {newKey}
          </code>
          <button
            onClick={() => { navigator.clipboard.writeText(newKey); }}
            style={{
              padding: "8px 16px",
              backgroundColor: "#1F2F3A",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: FONT,
              marginRight: 10,
            }}
          >
            Copy
          </button>
          <button
            onClick={() => setNewKey(null)}
            style={{
              padding: "8px 16px",
              backgroundColor: "transparent",
              color: "#64748B",
              border: "1px solid #E2E8F0",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: FONT,
            }}
          >
            Done
          </button>
        </div>
      )}

      {/* Create form */}
      <div style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: 12,
        padding: "24px",
        marginBottom: 28,
      }}>
        <h3 style={{ margin: "0 0 18px", fontSize: 14, fontWeight: 700, color: "#1F2F3A" }}>Generate New Key</h3>
        <form onSubmit={handleCreate} style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 12, color: "#64748B", marginBottom: 5, fontWeight: 500 }}>Label</label>
            <input
              style={inputStyle}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. ChatGPT listings agent"
              required
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            style={{
              padding: "10px 22px",
              backgroundColor: creating ? "#94A3B8" : "#1F2F3A",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: creating ? "not-allowed" : "pointer",
              fontFamily: FONT,
              whiteSpace: "nowrap",
            }}
          >
            {creating ? "Generating..." : "Generate Key"}
          </button>
        </form>
        {error && <p style={{ margin: "10px 0 0", fontSize: 12, color: "#DC2626" }}>{error}</p>}
      </div>

      {/* Existing keys */}
      <div style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: 12,
        overflow: "hidden",
      }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #F1F5F9" }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1F2F3A" }}>Existing Keys</h3>
        </div>
        {loading ? (
          <p style={{ padding: 24, fontSize: 13, color: "#64748B" }}>Loading...</p>
        ) : keys.length === 0 ? (
          <p style={{ padding: 24, fontSize: 13, color: "#64748B" }}>No keys yet.</p>
        ) : (
          keys.map((k) => (
            <div
              key={k.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 24px",
                borderBottom: "1px solid #F1F5F9",
                opacity: k.revoked_at ? 0.5 : 1,
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1F2F3A" }}>
                  {k.label} {k.revoked_at && <span style={{ color: "#DC2626", fontWeight: 500 }}>(revoked)</span>}
                </p>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94A3B8", fontFamily: "monospace" }}>
                  {k.key_prefix}••••••••
                </p>
                <p style={{ margin: "3px 0 0", fontSize: 11, color: "#94A3B8" }}>
                  Created {new Date(k.created_at).toLocaleDateString()}
                  {k.last_used_at ? ` · Last used ${new Date(k.last_used_at).toLocaleDateString()}` : " · Never used"}
                </p>
              </div>
              {!k.revoked_at && (
                <button
                  onClick={() => revokeKey(k.id)}
                  disabled={revokingId === k.id}
                  style={{
                    padding: "7px 14px",
                    backgroundColor: "transparent",
                    color: "#DC2626",
                    border: "1px solid #FECACA",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: revokingId === k.id ? "not-allowed" : "pointer",
                    fontFamily: FONT,
                  }}
                >
                  {revokingId === k.id ? "Revoking..." : "Revoke"}
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Recent Activity */}
      <div style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #D8D2C8",
        borderRadius: 12,
        overflow: "hidden",
        marginTop: 28,
      }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #F1F5F9" }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1F2F3A" }}>Recent Agent Activity</h3>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#666666" }}>Exactly what's been created, changed, or sent through these keys — last 50 actions.</p>
        </div>
        {activityLoading ? (
          <p style={{ padding: 24, fontSize: 13, color: "#64748B" }}>Loading...</p>
        ) : activity.length === 0 ? (
          <p style={{ padding: 24, fontSize: 13, color: "#64748B" }}>No agent activity yet.</p>
        ) : (
          activity.map((a) => (
            <div key={a.id} style={{ padding: "14px 24px", borderBottom: "1px solid #F1F5F9" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <span style={{
                  padding: "2px 8px",
                  borderRadius: 20,
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  backgroundColor: a.action === "delete_listing" ? "#FEE2E2" : "#F0FDF4",
                  color: a.action === "delete_listing" ? "#991B1B" : "#065F46",
                }}>
                  {ACTION_LABELS[a.action] ?? a.action}
                </span>
                <span style={{ fontSize: 11, color: "#94A3B8" }}>{a.api_keys?.label ?? "Unknown key"}</span>
                <span style={{ fontSize: 11, color: "#CBD5E1" }}>·</span>
                <span style={{ fontSize: 11, color: "#94A3B8" }}>{new Date(a.created_at).toLocaleString()}</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "#333333" }}>{a.summary}</p>
            </div>
          ))
        )}
      </div>

      <p style={{ marginTop: 20, fontSize: 12, color: "#94A3B8" }}>
        Full API reference: <code>docs/AGENT_LISTINGS_API.md</code> in the website repo.
      </p>
    </div>
  );
}
