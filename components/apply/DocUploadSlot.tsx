"use client";

import { useRef, useState } from "react";
import { Upload, FileCheck2, X } from "lucide-react";

const MAX_SIZE = 5 * 1024 * 1024;

interface Props {
  label: string;
  docType: string;
  count?: number; // how many files to collect (e.g. 4 for paystubs)
  onUploaded: (paths: string[]) => void;
}

export default function DocUploadSlot({ label, docType, count = 1, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<{ name: string; size: string; path: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []).slice(0, count - files.length);
    if (selected.length === 0) return;

    setError("");
    setUploading(true);

    const newFiles: { name: string; size: string; path: string }[] = [];

    for (const file of selected) {
      if (file.size > MAX_SIZE) {
        setError(`${file.name} exceeds the 5MB limit. Please compress or use a smaller file.`);
        setUploading(false);
        if (newFiles.length) {
          const combined = [...files, ...newFiles];
          setFiles(combined);
          onUploaded(combined.map((f) => f.path));
        }
        return;
      }

      const fd = new FormData();
      fd.append("file", file);
      fd.append("doc_type", docType);

      try {
        const res = await fetch("/api/applications/upload-doc", { method: "POST", body: fd });
        const json = await res.json();

        if (!res.ok) {
          setError(json.error ?? "Upload failed");
          setUploading(false);
          if (newFiles.length) {
            const combined = [...files, ...newFiles];
            setFiles(combined);
            onUploaded(combined.map((f) => f.path));
          }
          return;
        }

        newFiles.push({
          name: file.name,
          size: `${(file.size / 1024).toFixed(0)} KB`,
          path: json.storage_path,
        });
      } catch {
        setError("Upload failed. Check your connection and try again.");
        setUploading(false);
        if (newFiles.length) {
          const combined = [...files, ...newFiles];
          setFiles(combined);
          onUploaded(combined.map((f) => f.path));
        }
        return;
      }
    }

    const combined = [...files, ...newFiles];
    setFiles(combined);
    onUploaded(combined.map((f) => f.path));
    setUploading(false);

    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeFile(index: number) {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onUploaded(updated.map((f) => f.path));
  }

  const needed = count - files.length;
  const complete = needed <= 0;

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
          {label}
          <span style={{ color: "#8B2030", marginLeft: 4 }}>*</span>
        </p>
        {count > 1 && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: complete ? "#2D7A4F" : "#8B8378",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {files.length}/{count}
          </span>
        )}
      </div>

      {/* Uploaded files */}
      {files.map((f, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "rgba(45,122,79,0.06)",
            border: "1px solid rgba(45,122,79,0.18)",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <FileCheck2 size={16} color="#2D7A4F" strokeWidth={2} style={{ flexShrink: 0 }} />
            <span
              style={{
                fontSize: 13,
                color: "#1F2F3A",
                fontFamily: "var(--font-dm-sans)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {f.name}
            </span>
            <span style={{ fontSize: 11, color: "#8B8378", fontFamily: "var(--font-dm-sans)", flexShrink: 0 }}>({f.size})</span>
          </div>
          <button
            onClick={() => removeFile(i)}
            aria-label={`Remove ${f.name}`}
            style={{
              background: "none",
              border: "none",
              color: "#8B2030",
              cursor: "pointer",
              padding: 4,
              display: "flex",
              flexShrink: 0,
              marginLeft: 8,
            }}
          >
            <X size={15} strokeWidth={2} />
          </button>
        </div>
      ))}

      {/* Upload button */}
      {needed > 0 && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            multiple={count > 1}
            onChange={handleChange}
            style={{ display: "none" }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "14px",
              backgroundColor: uploading ? "#F7F5F2" : "#FFFFFF",
              border: `1px solid ${uploading ? "#D8D2C8" : "#D8D2C8"}`,
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 500,
              color: uploading ? "#8B8378" : "#1F2F3A",
              fontFamily: "var(--font-dm-sans)",
              cursor: uploading ? "not-allowed" : "pointer",
              transition: "border-color 0.15s, background-color 0.15s",
            }}
            onMouseEnter={(e) => { if (!uploading) e.currentTarget.style.borderColor = "#8B2030"; }}
            onMouseLeave={(e) => { if (!uploading) e.currentTarget.style.borderColor = "#D8D2C8"; }}
          >
            <Upload size={15} strokeWidth={2} color={uploading ? "#8B8378" : "#8B2030"} />
            {uploading ? "Uploading..." : count > 1 ? `Upload ${needed} more` : "Upload file"}
          </button>
          <p style={{ margin: "6px 0 0", fontSize: 11, color: "#8B8378", fontFamily: "var(--font-dm-sans)" }}>
            PDF, JPG, or PNG — max 5MB each
          </p>
        </>
      )}

      {error && (
        <p style={{ margin: "8px 0 0", fontSize: 12, color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
