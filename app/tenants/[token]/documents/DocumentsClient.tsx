"use client";

import { useState } from "react";
import type { TenantDocument } from "@/lib/tenant-data";
import type { NotionFile } from "@/lib/notion";

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

/** Guess a category label from the Notion file name */
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
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "18px 20px",
          borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.05)",
          transition: "background 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = CARD_HOVER)}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: `${categoryColor(category)}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "20px", color: categoryColor(category) }}
          >
            {fileIcon(mimeType)}
          </span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "var(--font-outfit)", fontSize: "15px", fontWeight: 600, color: TEXT, marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {label}
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
                background: `${categoryColor(category)}18`,
                color: categoryColor(category),
              }}
            >
              {category}
            </span>
            <span style={{ color: TEXT_DIM, fontSize: "12px", fontFamily: "var(--font-dm-sans)" }}>
              {date}
            </span>
            {fileSize != null && (
              <span style={{ color: TEXT_DIM, fontSize: "12px", fontFamily: "var(--font-dm-sans)" }}>
                {formatBytes(fileSize)}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={onDownload}
          disabled={downloading === id}
          style={{
            padding: "8px 16px",
            borderRadius: "10px",
            background: downloading === id ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.09)",
            color: downloading === id ? TEXT_DIM : TEXT_SEC,
            fontSize: "12px",
            fontWeight: 600,
            fontFamily: "var(--font-dm-sans)",
            cursor: downloading === id ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
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
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
        {CATEGORIES.map((cat) => {
          const active = cat === activeCategory;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "7px 16px",
                borderRadius: "100px",
                border: active ? `1px solid ${GOLD}60` : "1px solid rgba(255,255,255,0.08)",
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
      {totalCount === 0 ? (
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
            No documents yet. Ebin will add your lease and documents here.
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
