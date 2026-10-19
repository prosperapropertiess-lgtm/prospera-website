"use client";

import { useRef, useState } from "react";
import { Upload, FileCheck2, X } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import type { DocSlot } from "@/lib/application-requirements";

export interface UploadedFile {
  name: string;
  path: string;
}

interface Props {
  slot: DocSlot;
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
}

const FONT = "var(--font-dm-sans)";
const MAX_EDGE = 2000; // px — plenty for reading a document, keeps photos small

// Phone photos are often 3–8MB. Shrink them to a readable JPEG before upload so
// uploads are fast on mobile data and the AI can read them.
async function prepareFile(file: File): Promise<File> {
  if (file.type === "application/pdf") return file;
  if (!file.type.startsWith("image/")) throw new Error("Please upload a PDF or a photo.");

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(`We couldn't open ${file.name}. Try taking a screenshot of it, or save it as a PDF.`);
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const needsWork = scale < 1 || file.size > 1.5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type);
  if (!needsWork) return file;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
}

async function uploadOne(file: File, docType: string): Promise<UploadedFile> {
  const prepared = await prepareFile(file);

  const res = await fetch("/api/applications/upload-doc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ doc_type: docType, content_type: prepared.type, size: prepared.size }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Upload failed");

  const { error } = await getSupabase().storage
    .from("applications")
    .uploadToSignedUrl(json.storage_path, json.token, prepared, { contentType: prepared.type });
  if (error) throw new Error("Upload failed. Check your connection and try again.");

  return { name: file.name, path: json.storage_path };
}

export default function DocUploadSlot({ slot, files, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []).slice(0, slot.max - files.length);
    if (inputRef.current) inputRef.current.value = "";
    if (selected.length === 0) return;

    setError("");
    setUploading(true);
    let current = files;
    for (const file of selected) {
      try {
        const uploaded = await uploadOne(file, slot.type);
        current = [...current, uploaded];
        onChange(current);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        break;
      }
    }
    setUploading(false);
  }

  const done = files.length >= Math.max(slot.min, 1);
  const canAddMore = files.length < slot.max;

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#1F2F3A", fontFamily: FONT }}>{slot.label}</p>
        {slot.max > 1 && (
          <span style={{ fontSize: 13, fontWeight: 600, color: done ? "#2D7A4F" : "#666666", fontFamily: FONT, flexShrink: 0 }}>
            {files.length}{slot.min > 1 ? ` of ${slot.min}` : ""}
          </span>
        )}
      </div>
      <p style={{ margin: "0 0 10px", fontSize: 14, color: "#666666", fontFamily: FONT, lineHeight: 1.5 }}>{slot.hint}</p>

      {files.map((f, i) => (
        <div
          key={f.path}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            backgroundColor: "rgba(45,122,79,0.06)", border: "1px solid rgba(45,122,79,0.18)",
            borderRadius: 10, padding: "10px 14px", marginBottom: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <FileCheck2 size={16} color="#2D7A4F" strokeWidth={2} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 14, color: "#1F2F3A", fontFamily: FONT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {f.name}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onChange(files.filter((_, j) => j !== i))}
            aria-label={`Remove ${f.name}`}
            style={{ background: "none", border: "none", color: "#666666", cursor: "pointer", padding: 4, display: "flex", flexShrink: 0, marginLeft: 8 }}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>
      ))}

      {canAddMore && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,image/*"
            multiple={slot.max > 1}
            onChange={handleChange}
            style={{ display: "none" }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "14px", backgroundColor: uploading ? "#F7F5F2" : "#FFFFFF",
              border: "1px dashed #D8D2C8", borderRadius: 10, fontSize: 14, fontWeight: 500,
              color: uploading ? "#666666" : "#1F2F3A", fontFamily: FONT,
              cursor: uploading ? "not-allowed" : "pointer",
            }}
          >
            <Upload size={16} strokeWidth={2} color="#1F2F3A" />
            {uploading ? "Uploading..." : files.length ? "Add another" : "Upload or take a photo"}
          </button>
        </>
      )}

      {error && (
        <p style={{ margin: "8px 0 0", fontSize: 14, color: "#8B2030", fontFamily: FONT }}>{error}</p>
      )}
    </div>
  );
}
