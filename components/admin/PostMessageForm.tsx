"use client";

import { useState } from "react";

export interface PropertyOption {
  token: string;
  ownerName: string;
  propertyId: string;
  address: string;
}

interface Props {
  properties: PropertyOption[];
  adminSecret: string;
}

const MESSAGE_TYPES = [
  { value: "update", label: "Update" },
  { value: "maintenance", label: "Maintenance Note" },
  { value: "tenant_note", label: "Tenant Note" },
  { value: "general", label: "General" },
];

export function PostMessageForm({ properties, adminSecret }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [content, setContent] = useState("");
  const [messageType, setMessageType] = useState("update");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const selected = properties[selectedIndex];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !content.trim() || status === "sending") return;

    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminSecret}`,
        },
        body: JSON.stringify({
          propertyId: selected.propertyId,
          token: selected.token,
          content: content.trim(),
          messageType,
          ownerName: selected.ownerName,
          propertyAddress: selected.address,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "Request failed");
      }

      setStatus("success");
      setContent("");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  }

  if (properties.length === 0) {
    return (
      <p style={{ color: "#9AA5B1", fontSize: "14px", padding: "24px" }}>
        No properties found. Make sure owner_access records exist in Supabase.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Property selector */}
      <div>
        <label style={labelStyle}>Property</label>
        <select
          value={selectedIndex}
          onChange={e => setSelectedIndex(Number(e.target.value))}
          style={inputStyle}
        >
          {properties.map((p, i) => (
            <option key={`${p.token}-${p.propertyId}`} value={i}>
              {p.address} — {p.ownerName}
            </option>
          ))}
        </select>
      </div>

      {/* Message type */}
      <div>
        <label style={labelStyle}>Message Type</label>
        <select
          value={messageType}
          onChange={e => setMessageType(e.target.value)}
          style={inputStyle}
        >
          {MESSAGE_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div>
        <label style={labelStyle}>Message</label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={5}
          required
          placeholder="Write your update here…"
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      {status === "error" && (
        <p style={{ color: "#dc2626", fontSize: "13px" }}>{errorMsg}</p>
      )}
      {status === "success" && (
        <p style={{ color: "#16a34a", fontSize: "13px" }}>Message posted successfully.</p>
      )}

      <button
        type="submit"
        disabled={status === "sending" || !content.trim()}
        style={{
          padding: "12px 24px",
          background: status === "sending" ? "#C8BFB5" : "#8B2030",
          color: "#FFFFFF",
          border: "none",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: 600,
          cursor: status === "sending" ? "not-allowed" : "pointer",
          alignSelf: "flex-start",
        }}
      >
        {status === "sending" ? "Posting…" : "Post Message"}
      </button>

      {selected && (
        <p style={{ fontSize: "12px", color: "#9AA5B1" }}>
          Owner portal:{" "}
          <a
            href={`/owners/${selected.token}/${selected.propertyId}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: "#8B2030" }}
          >
            /owners/{selected.token}/{selected.propertyId}
          </a>
        </p>
      )}
    </form>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "#5A6A7A",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  fontSize: "14px",
  color: "#1F2F3A",
  background: "#FFFFFF",
  border: "1px solid #E8E4DF",
  borderRadius: "8px",
  outline: "none",
  boxSizing: "border-box",
};
