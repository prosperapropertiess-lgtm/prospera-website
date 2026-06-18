"use client";

import { useState, useRef } from "react";

export interface PropertyOption {
  token: string;
  ownerName: string;
  propertyId: string;
  address: string;
}

interface UploadedDoc {
  id: string;
  label: string;
  file_name: string;
}

interface Props {
  properties: PropertyOption[];
  adminSecret: string;
}

const CATEGORIES = [
  "Lease Agreement",
  "Inspection Report",
  "Notice",
  "Statement",
  "Other",
] as const;

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

export function DocumentUploadForm({ properties, adminSecret }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [docLabel, setDocLabel] = useState("");
  const [category, setCategory] = useState<string>("Lease Agreement");
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [recentUploads, setRecentUploads] = useState<UploadedDoc[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const selected = properties[selectedIndex];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!selected || !docLabel.trim() || !file || status === "uploading") return;

    setStatus("uploading");
    setErrorMsg("");

    try {
      const fd = new FormData();
      fd.append("propertyId", selected.propertyId);
      fd.append("token", selected.token);
      fd.append("label", docLabel.trim());
      fd.append("category", category);
      fd.append("file", file);

      const res = await fetch("/api/admin/documents", {
        method: "POST",
        headers: { Authorization: `Bearer ${adminSecret}` },
        body: fd,
      });

      if (!res.ok) {
        const json = await res.json() as { error?: string };
        throw new Error(json.error ?? "Upload failed");
      }

      const { document } = await res.json() as { document: UploadedDoc };
      setRecentUploads((prev) => [document, ...prev]);
      setStatus("success");
      setDocLabel("");
      if (fileRef.current) fileRef.current.value = "";
      setTimeout(() => setStatus("idle"), 4000);
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
    <div>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Property selector */}
        <div>
          <label style={labelStyle}>Property</label>
          <select
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(Number(e.target.value))}
            style={inputStyle}
          >
            {properties.map((p, i) => (
              <option key={`${p.token}-${p.propertyId}`} value={i}>
                {p.ownerName} — {p.address}
              </option>
            ))}
          </select>
        </div>

        {/* Document label */}
        <div>
          <label style={labelStyle}>Document Label</label>
          <input
            type="text"
            value={docLabel}
            onChange={(e) => setDocLabel(e.target.value)}
            placeholder="e.g. 2024 Lease Agreement"
            required
            style={inputStyle}
          />
        </div>

        {/* Category */}
        <div>
          <label style={labelStyle}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={inputStyle}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* File input */}
        <div>
          <label style={labelStyle}>File</label>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
            required
            style={{ ...inputStyle, padding: "8px 14px" }}
          />
        </div>

        {status === "error" && (
          <p style={{ color: "#dc2626", fontSize: "13px" }}>{errorMsg}</p>
        )}
        {status === "success" && (
          <p style={{ color: "#16a34a", fontSize: "13px" }}>Document uploaded successfully.</p>
        )}

        <button
          type="submit"
          disabled={status === "uploading" || !docLabel.trim()}
          style={{
            padding: "12px 24px",
            background: status === "uploading" ? "#C8BFB5" : "#8B2030",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: status === "uploading" ? "not-allowed" : "pointer",
            alignSelf: "flex-start",
          }}
        >
          {status === "uploading" ? "Uploading…" : "Upload Document"}
        </button>
      </form>

      {recentUploads.length > 0 && (
        <div style={{ marginTop: "32px" }}>
          <p style={{ ...labelStyle, marginBottom: "12px" }}>Recently Uploaded</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {recentUploads.map((doc) => (
              <div
                key={doc.id}
                style={{
                  padding: "12px 16px",
                  background: "#F7F5F2",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#1F2F3A" }}>{doc.label}</p>
                  <p style={{ fontSize: "12px", color: "#9AA5B1", marginTop: "2px" }}>{doc.file_name}</p>
                </div>
                <span style={{ color: "#16a34a", fontSize: "12px", fontWeight: 500 }}>Uploaded</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
