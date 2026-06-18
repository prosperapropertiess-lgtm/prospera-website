"use client";

import { useState } from "react";

export interface OwnerDocument {
  id: string;
  label: string;
  category: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_at: string;
}

interface Props {
  propertyId: string;
  token: string;
  initialDocuments: OwnerDocument[];
}

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  "Lease Agreement": { bg: "#E8EDF2", color: "#1F2F3A" },
  "Inspection Report": { bg: "#EBF3FC", color: "#1D4ED8" },
  "Notice": { bg: "#FEF9C3", color: "#92400E" },
  "Statement": { bg: "#DCFCE7", color: "#166534" },
  "Other": { bg: "#F3F4F6", color: "#6B7280" },
};

function formatSize(bytes: number | null): string {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

function CategoryBadge({ category }: { category: string }) {
  const style = CATEGORY_COLORS[category] ?? CATEGORY_COLORS["Other"];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: 600,
        background: style.bg,
        color: style.color,
        letterSpacing: "0.02em",
        flexShrink: 0,
      }}
    >
      {category}
    </span>
  );
}

function DocumentRow({ doc, propertyId, token }: { doc: OwnerDocument; propertyId: string; token: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/owners/documents?propertyId=${encodeURIComponent(propertyId)}&token=${encodeURIComponent(token)}&action=download&documentId=${encodeURIComponent(doc.id)}`;
      const res = await fetch(url);
      if (!res.ok) {
        const json = await res.json() as { error?: string };
        throw new Error(json.error ?? "Failed to get download link");
      }
      const { signedUrl } = await res.json() as { signedUrl: string };
      window.open(signedUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setLoading(false);
    }
  }

  const sizeLabel = formatSize(doc.file_size);

  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: "16px",
        padding: "16px 20px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        flexWrap: "wrap",
      }}
    >
      <CategoryBadge category={doc.category} />

      <div style={{ flex: 1, minWidth: "140px" }}>
        <p style={{ fontFamily: "var(--font-outfit)", fontSize: "14px", fontWeight: 600, color: "#1F2F3A", marginBottom: "2px" }}>
          {doc.label}
        </p>
        <p style={{ fontSize: "12px", color: "#9AA5B1", fontFamily: "var(--font-dm-sans)" }}>
          {doc.file_name}{sizeLabel ? ` · ${sizeLabel}` : ""}
        </p>
        {error && (
          <p style={{ fontSize: "12px", color: "#dc2626", marginTop: "4px" }}>{error}</p>
        )}
      </div>

      <p style={{ fontSize: "12px", color: "#9AA5B1", fontFamily: "var(--font-dm-sans)", whiteSpace: "nowrap" }}>
        {formatDate(doc.uploaded_at)}
      </p>

      <button
        onClick={handleDownload}
        disabled={loading}
        style={{
          padding: "8px 16px",
          borderRadius: "8px",
          border: "1px solid #E8E4DF",
          background: loading ? "#F7F5F2" : "#FFFFFF",
          color: loading ? "#9AA5B1" : "#1F2F3A",
          fontSize: "13px",
          fontWeight: 500,
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "var(--font-dm-sans)",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {loading ? "Loading…" : "Download"}
      </button>
    </div>
  );
}

export function DocumentList({ propertyId, token, initialDocuments }: Props) {
  if (initialDocuments.length === 0) {
    return (
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: "16px",
          padding: "32px 24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          textAlign: "center",
        }}
      >
        <p style={{ color: "#9AA5B1", fontSize: "14px", fontFamily: "var(--font-dm-sans)", lineHeight: 1.6 }}>
          No documents yet. Ebin will upload your lease and inspection reports here.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {initialDocuments.map((doc) => (
        <DocumentRow key={doc.id} doc={doc} propertyId={propertyId} token={token} />
      ))}
    </div>
  );
}
