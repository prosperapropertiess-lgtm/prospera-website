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
  "Lease Agreement": { bg: "rgba(96,165,250,0.15)", color: "#60a5fa" },
  "Inspection Report": { bg: "rgba(167,139,250,0.15)", color: "#a78bfa" },
  "Notice": { bg: "rgba(251,191,36,0.15)", color: "#fbbf24" },
  "Statement": { bg: "rgba(52,211,153,0.15)", color: "#34d399" },
  "Other": { bg: "rgba(255,255,255,0.07)", color: "rgba(237,232,225,0.42)" },
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
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "16px",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        flexWrap: "wrap",
      }}
    >
      <CategoryBadge category={doc.category} />

      <div style={{ flex: 1, minWidth: "140px" }}>
        <p style={{ fontFamily: "var(--font-outfit)", fontSize: "14px", fontWeight: 600, color: "#EDE8E1", marginBottom: "2px" }}>
          {doc.label}
        </p>
        <p style={{ fontSize: "12px", color: "rgba(237,232,225,0.42)", fontFamily: "var(--font-dm-sans)" }}>
          {doc.file_name}{sizeLabel ? ` · ${sizeLabel}` : ""}
        </p>
        {error && (
          <p style={{ fontSize: "12px", color: "#f87171", marginTop: "4px" }}>{error}</p>
        )}
      </div>

      <p style={{ fontSize: "12px", color: "rgba(237,232,225,0.42)", fontFamily: "var(--font-dm-sans)", whiteSpace: "nowrap" }}>
        {formatDate(doc.uploaded_at)}
      </p>

      <button
        onClick={handleDownload}
        disabled={loading}
        style={{
          padding: "8px 16px",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.07)",
          background: loading ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)",
          color: loading ? "rgba(237,232,225,0.20)" : "#EDE8E1",
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
          background: "#0D1825",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "16px",
          padding: "32px 24px",
          textAlign: "center",
        }}
      >
        <p style={{ color: "rgba(237,232,225,0.42)", fontSize: "14px", fontFamily: "var(--font-dm-sans)", lineHeight: 1.6 }}>
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
