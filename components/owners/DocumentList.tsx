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

const CATEGORY_STYLES: Record<string, { bg: string; color: string }> = {
  "Lease Agreement": { bg: "rgba(29,78,216,0.08)", color: "#1D4ED8" },
  "Inspection Report": { bg: "rgba(139,32,48,0.08)", color: "#8B2030" },
  "Notice": { bg: "rgba(180,83,9,0.09)", color: "#B45309" },
  "Statement": { bg: "rgba(10,122,82,0.09)", color: "#0A7A52" },
  "Other": { bg: "rgba(15,28,40,0.06)", color: "rgba(15,28,40,0.45)" },
};

function formatSize(bytes: number | null): string {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

function CategoryBadge({ category }: { category: string }) {
  const style = CATEGORY_STYLES[category] ?? CATEGORY_STYLES["Other"];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: "100px",
        fontSize: "14px",
        fontWeight: 600,
        background: style.bg,
        color: style.color,
        letterSpacing: "0.02em",
        flexShrink: 0,
        fontFamily: "var(--font-dm-sans)",
      }}
    >
      {category}
    </span>
  );
}

function DocumentRow({
  doc,
  propertyId,
  token,
}: {
  doc: OwnerDocument;
  propertyId: string;
  token: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/owners/documents?propertyId=${encodeURIComponent(propertyId)}&token=${encodeURIComponent(token)}&action=download&documentId=${encodeURIComponent(doc.id)}`;
      const res = await fetch(url);
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? "Failed to get download link");
      }
      const { signedUrl } = (await res.json()) as { signedUrl: string };
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
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        flexWrap: "wrap",
        borderBottom: "1px solid rgba(15,28,40,0.06)",
      }}
    >
      <CategoryBadge category={doc.category} />

      <div style={{ flex: 1, minWidth: "140px" }}>
        <p
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "17px",
            fontWeight: 600,
            color: "#0F1C28",
            marginBottom: "2px",
          }}
        >
          {doc.label}
        </p>
        <p
          style={{
            fontSize: "15px",
            color: "rgba(15,28,40,0.45)",
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          {doc.file_name}
          {sizeLabel ? ` · ${sizeLabel}` : ""}
        </p>
        {error && (
          <p
            style={{
              fontSize: "15px",
              color: "#B91C1C",
              marginTop: "4px",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {error}
          </p>
        )}
      </div>

      <p
        style={{
          fontSize: "15px",
          color: "rgba(15,28,40,0.45)",
          fontFamily: "var(--font-dm-sans)",
          whiteSpace: "nowrap",
        }}
      >
        {formatDate(doc.uploaded_at)}
      </p>

      <button
        onClick={handleDownload}
        disabled={loading}
        style={{
          padding: "8px 16px",
          borderRadius: "10px",
          border: "1px solid rgba(15,28,40,0.10)",
          background: loading ? "rgba(15,28,40,0.04)" : "#FFFFFF",
          color: loading ? "rgba(15,28,40,0.25)" : "#0F1C28",
          fontSize: "16px",
          fontWeight: 500,
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "var(--font-dm-sans)",
          whiteSpace: "nowrap",
          flexShrink: 0,
          transition: "background 0.15s",
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
          padding: "48px 24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: "rgba(15,28,40,0.45)",
            fontSize: "17px",
            fontFamily: "var(--font-dm-sans)",
            lineHeight: 1.6,
          }}
        >
          No documents yet. Ebin will upload your lease and inspection reports here.
        </p>
      </div>
    );
  }

  return (
    <div>
      {initialDocuments.map((doc, idx) => (
        <div
          key={doc.id}
          style={
            idx === initialDocuments.length - 1
              ? {}
              : {}
          }
        >
          <DocumentRow doc={doc} propertyId={propertyId} token={token} />
        </div>
      ))}
    </div>
  );
}
