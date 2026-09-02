"use client";

import { useRef, useState } from "react";

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
    const selected = Array.from(e.target.files ?? []);
    if (selected.length === 0) return;

    setError("");
    setUploading(true);

    const newFiles: { name: string; size: string; path: string }[] = [];

    for (const file of selected) {
      if (file.size > MAX_SIZE) {
        setError(`${file.name} exceeds the 5MB limit. Please compress or use a smaller file.`);
        setUploading(false);
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

  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{
        margin: "0 0 8px",
        fontSize: 13,
        fontWeight: 500,
        color: "#1F2F3A",
        fontFamily: "var(--font-dm-sans)",
      }}>
        {label}
        <span style={{ color: "#8B2030", marginLeft: 4 }}>*</span>
        {count > 1 && (
          <span style={{ color: "#64748B", fontWeight: 400, marginLeft: 6 }}>
            ({files.length}/{count} uploaded)
          </span>
        )}
      </p>

      {/* Uploaded files */}
      {files.map((f, i) => (
        <div key={i} style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#F0FDF4",
          border: "1px solid #BBF7D0",
          borderRadius: 6,
          padding: "8px 12px",
          marginBottom: 6,
          fontSize: 13,
          fontFamily: "var(--font-dm-sans)",
        }}>
          <span style={{ color: "#166534" }}>✓ {f.name} <span style={{ color: "#4ADE80", fontSize: 11 }}>({f.size})</span></span>
          <button
            onClick={() => removeFile(i)}
            style={{ background: "none", border: "none", color: "#DC2626", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 0 }}
          >×</button>
        </div>
      ))}

      {/* Upload button */}
      {needed > 0 && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
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
              padding: "12px",
              backgroundColor: uploading ? "#F1F5F9" : "#FFFFFF",
              border: "2px dashed #CBD5E1",
              borderRadius: 8,
              fontSize: 13,
              color: uploading ? "#94A3B8" : "#475569",
              fontFamily: "var(--font-dm-sans)",
              cursor: uploading ? "not-allowed" : "pointer",
              textAlign: "center",
            }}
          >
            {uploading ? "Uploading..." : `+ Upload${count > 1 ? ` (${needed} more needed)` : ""}, PDF or image, max 5MB`}
          </button>
        </>
      )}

      {error && (
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "#DC2626", fontFamily: "var(--font-dm-sans)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
