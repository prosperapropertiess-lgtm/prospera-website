"use client";

import { useState } from "react";
import type { TenantDocument } from "@/lib/tenant-data";

const CARD = "#0D1825";
const CARD_HOVER = "#111F2E";
const CARD_BORDER = "rgba(255,255,255,0.07)";
const TEXT = "#EDE8E1";
const TEXT_SEC = "rgba(237,232,225,0.42)";
const TEXT_DIM = "rgba(237,232,225,0.20)";
const GREEN = "#34d399";
const AMBER = "#fbbf24";
const BLUE = "#60a5fa";
const PURPLE = "#a78bfa";
const GOLD = "#C9A84C";

const CATEGORIES = ["All", "Lease Agreement", "Inspection Report", "Notice", "Receipt", "Other"] as const;
type Category = typeof CATEGORIES[number];

function categoryColor(cat: string): string {
  if (cat === "Lease Agreement") return BLUE;
  if (cat === "Inspection Report") return PURPLE;
  if (cat === "Notice") return AMBER;
  if (cat === "Receipt") return GREEN;
  return TEXT_SEC;
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(mimeType: string | null): string {
  if (!mimeType) return "description";
  if (mimeType.includes("pdf")) return "picture_as_pdf";
  if (mimeType.includes("image")) return "image";
  return "description";
}

interface Props {
  documents: TenantDocument[];
  token: string;
}

export default function DocumentsClient({ documents, token }: Props) {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [downloading, setDownloading] = useState<string | null>(null);

  const filtered = activeCategory === "All"
    ? documents
    : documents.filter(d => d.category === activeCategory);

  async function handleDownload(doc: TenantDocument) {
    setDownloading(doc.id);
    try {
      const url = `/api/tenants/documents?action=download&documentId=${doc.id}&token=${token}`;
      window.open(url, "_blank");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div>
      {/* Category filter tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        {CATEGORIES.map((cat) => {
          const active = cat === activeCategory;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "7px 16px",
                borderRadius: "100px",
                border: active ? `1px solid ${GOLD}60` : `1px solid rgba(255,255,255,0.08)`,
                background: active ? `${GOLD}15` : "transparent",
                color: active ? GOLD : TEXT_SEC,
                fontSize: "13px",
                fontFamily: "var(--font-dm-sans)",
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Document list */}
      {filtered.length === 0 ? (
        <div
          style={{
            background: CARD,
            border: `1px solid ${CARD_BORDER}`,
            borderRadius: "22px",
            padding: "60px 24px",
            textAlign: "center",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "40px", color: TEXT_DIM, display: "block", marginBottom: "16px" }}
          >
            folder_open
          </span>
          <p style={{ color: TEXT_SEC, fontSize: "14px", fontFamily: "var(--font-dm-sans)", lineHeight: "1.6", maxWidth: "300px", margin: "0 auto" }}>
            No documents uploaded yet. Ebin will add your lease and documents here.
          </p>
        </div>
      ) : (
        <div
          style={{
            background: CARD,
            border: `1px solid ${CARD_BORDER}`,
            borderRadius: "22px",
            overflow: "hidden",
          }}
        >
          {filtered.map((doc, idx) => (
            <div
              key={doc.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "18px 20px",
                borderBottom: idx < filtered.length - 1 ? `1px solid rgba(255,255,255,0.05)` : "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = CARD_HOVER)}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              {/* File icon */}
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: `${categoryColor(doc.category)}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "20px", color: categoryColor(doc.category) }}
                >
                  {fileIcon(doc.mime_type)}
                </span>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "var(--font-outfit)", fontSize: "15px", fontWeight: 600, color: TEXT, marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {doc.label}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: "100px",
                      fontSize: "11px",
                      fontWeight: 600,
                      fontFamily: "var(--font-dm-sans)",
                      background: `${categoryColor(doc.category)}18`,
                      color: categoryColor(doc.category),
                    }}
                  >
                    {doc.category}
                  </span>
                  <span style={{ color: TEXT_DIM, fontSize: "12px", fontFamily: "var(--font-dm-sans)" }}>
                    {new Date(doc.uploaded_at).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  {doc.file_size && (
                    <span style={{ color: TEXT_DIM, fontSize: "12px", fontFamily: "var(--font-dm-sans)" }}>
                      {formatBytes(doc.file_size)}
                    </span>
                  )}
                </div>
              </div>

              {/* Download button */}
              <button
                onClick={() => handleDownload(doc)}
                disabled={downloading === doc.id}
                style={{
                  padding: "8px 16px",
                  borderRadius: "10px",
                  background: downloading === doc.id ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  color: downloading === doc.id ? TEXT_DIM : TEXT_SEC,
                  fontSize: "12px",
                  fontWeight: 600,
                  fontFamily: "var(--font-dm-sans)",
                  cursor: downloading === doc.id ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {downloading === doc.id ? "Opening…" : "Download"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
