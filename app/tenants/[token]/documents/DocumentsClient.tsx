"use client";

import { useState } from "react";
import type { TenantDocument } from "@/lib/tenant-data";
import type { NotionFile } from "@/lib/notion";

// Design tokens
const NAVY = "#0F1C28";
const MUTED = "rgba(15,28,40,0.45)";
const SUBTLE = "rgba(15,28,40,0.22)";
const BURGUNDY = "#8B2030";
const BURG_BG = "rgba(139,32,48,0.08)";
const GREEN = "#0A7A52";
const GREEN_BG = "rgba(10,122,82,0.09)";
const AMBER = "#B45309";
const AMBER_BG = "rgba(180,83,9,0.09)";
const BLUE = "#1D4ED8";
const BLUE_BG = "rgba(29,78,216,0.08)";
const PURPLE = "#7C3AED";
const PURPLE_BG = "rgba(124,58,237,0.08)";
const CARD_BORDER = "rgba(15,28,40,0.07)";

const CATEGORIES = ["All", "Lease Agreement", "Inspection Report", "Notice", "Receipt", "Other"] as const;
type Category = typeof CATEGORIES[number];

function categoryColor(cat: string): { color: string; bg: string } {
  if (cat === "Lease Agreement") return { color: BLUE, bg: BLUE_BG };
  if (cat === "Inspection Report") return { color: PURPLE, bg: PURPLE_BG };
  if (cat === "Notice") return { color: AMBER, bg: AMBER_BG };
  if (cat === "Receipt") return { color: GREEN, bg: GREEN_BG };
  return { color: MUTED, bg: "rgba(15,28,40,0.05)" };
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

function guessCategory(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("lease") || n.includes("tenancy") || n.includes("rental agreement")) return "Lease Agreement";
  if (n.includes("inspection")) return "Inspection Report";
  if (n.includes("notice") || n.includes("n4") || n.includes("n1") || n.includes("n2")) return "Notice";
  if (n.includes("receipt") || n.includes("payment")) return "Receipt";
  return "Other";
}

interface Props {
  documents: TenantDocument[];
  notionFiles: NotionFile[];
  token: string;
}

export default function DocumentsClient({ documents, notionFiles, token }: Props) {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [downloading, setDownloading] = useState<string | null>(null);

  const filteredSupabase = activeCategory === "All"
    ? documents
    : documents.filter(d => d.category === activeCategory);

  const filteredNotion = activeCategory === "All"
    ? notionFiles
    : notionFiles.filter(f => guessCategory(f.name) === activeCategory);

  const totalCount = filteredSupabase.length + filteredNotion.length;

  async function handleDownload(doc: TenantDocument) {
    setDownloading(doc.id);
    try {
      window.open(`/api/tenants/documents?action=download&documentId=${doc.id}&token=${token}`, "_blank");
    } finally {
      setDownloading(null);
    }
  }

  function DocRow({
    id,
    label,
    category,
    mimeType,
    date,
    fileSize,
    onDownload,
    isLast,
  }: {
    id: string;
    label: string;
    category: string;
    mimeType: string | null;
    date: string;
    fileSize?: number | null;
    onDownload: () => void;
    isLast: boolean;
  }) {
    const { color, bg } = categoryColor(category);

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          padding: "16px 0",
          borderBottom: isLast ? "none" : `1px solid ${CARD_BORDER}`,
          transition: "opacity 0.15s",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "23px", color: color }}
          >
            {fileIcon(mimeType)}
          </span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "18px", fontWeight: 600, color: NAVY, marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {label}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span
              style={{
                display: "inline-block",
                padding: "2px 8px",
                borderRadius: "100px",
                fontSize: "14px",
                fontWeight: 600,
                fontFamily: "var(--font-dm-sans)",
                background: bg,
                color: color,
              }}
            >
              {category}
            </span>
            <span style={{ color: SUBTLE, fontSize: "15px", fontFamily: "var(--font-dm-sans)" }}>
              {date}
            </span>
            {fileSize != null && (
              <span style={{ color: SUBTLE, fontSize: "15px", fontFamily: "var(--font-dm-sans)" }}>
                {formatBytes(fileSize)}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onDownload}
          disabled={downloading === id}
          style={{
            padding: "7px 16px",
            borderRadius: "100px",
            background: downloading === id ? "rgba(15,28,40,0.04)" : BURG_BG,
            border: "none",
            color: downloading === id ? MUTED : BURGUNDY,
            fontSize: "15px",
            fontWeight: 600,
            fontFamily: "var(--font-dm-sans)",
            cursor: downloading === id ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
            transition: "all 0.15s",
          }}
        >
          {downloading === id ? "Opening…" : "Download"}
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Category filter tabs */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
        {CATEGORIES.map((cat) => {
          const active = cat === activeCategory;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "6px 16px",
                borderRadius: "100px",
                border: active ? `1px solid rgba(139,32,48,0.25)` : `1px solid ${CARD_BORDER}`,
                background: active ? BURG_BG : "transparent",
                color: active ? BURGUNDY : MUTED,
                fontSize: "16px",
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
      {totalCount === 0 ? (
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "40px", color: SUBTLE, display: "block", marginBottom: "16px" }}
          >
            folder_open
          </span>
          <p style={{ color: MUTED, fontSize: "17px", fontFamily: "var(--font-dm-sans)", lineHeight: "1.6", maxWidth: "300px", margin: "0 auto" }}>
            No documents yet. Ebin will add your lease and documents here.
          </p>
        </div>
      ) : (
        <div>
          {/* Notion-sourced files (lease etc.) */}
          {filteredNotion.map((f, idx) => {
            const cat = guessCategory(f.name);
            const isLast = idx === filteredNotion.length - 1 && filteredSupabase.length === 0;
            return (
              <DocRow
                key={`notion-${idx}`}
                id={`notion-${idx}`}
                label={f.name.replace(/\.[^.]+$/, "")}
                category={cat}
                mimeType={f.name.endsWith(".pdf") ? "application/pdf" : null}
                date="From Notion"
                onDownload={() => { setDownloading(`notion-${idx}`); window.open(f.url, "_blank"); setDownloading(null); }}
                isLast={isLast}
              />
            );
          })}

          {/* Supabase-uploaded files */}
          {filteredSupabase.map((doc, idx) => (
            <DocRow
              key={doc.id}
              id={doc.id}
              label={doc.label}
              category={doc.category}
              mimeType={doc.mime_type}
              date={new Date(doc.uploaded_at).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
              fileSize={doc.file_size}
              onDownload={() => handleDownload(doc)}
              isLast={idx === filteredSupabase.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
