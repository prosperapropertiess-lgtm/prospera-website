"use client";

import { useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

const BG          = "#F5F4F1";
const CARD        = "#FFFFFF";
const CARD_BORDER = "rgba(15,28,40,0.07)";
const CARD_SHADOW = "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)";
const NAVY        = "#0F1C28";
const MUTED       = "rgba(15,28,40,0.60)";
const SUBTLE      = "rgba(15,28,40,0.42)";
const BURGUNDY    = "#8B2030";
const GREEN       = "#0A7A52";
const GREEN_BG    = "rgba(10,122,82,0.09)";
const RED         = "#B91C1C";
const RED_BG      = "rgba(185,28,28,0.08)";

type Stage = "idle" | "dragging" | "uploading" | "parsing" | "done" | "error";

export default function LeaseUploadPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [stage, setStage] = useState<Stage>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldsExtracted, setFieldsExtracted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(f.type)) {
      setErrorMsg("Please upload a PDF, JPG, or PNG file.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setErrorMsg("File must be under 10MB.");
      return;
    }
    setFile(f);
    setErrorMsg("");
    setStage("idle");
  }, []);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setStage("idle");
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function upload() {
    if (!file) return;
    setStage("uploading");
    setErrorMsg("");
    const fd = new FormData();
    fd.append("file", file);
    try {
      setStage("parsing");
      const r = await fetch(`/api/onboard/${token}/upload-lease`, {
        method: "POST",
        body: fd,
      });
      const d = await r.json();
      if (!r.ok) {
        setErrorMsg(d.error || "Upload failed. Please try again.");
        setStage("error");
        return;
      }
      setFieldsExtracted(d.fields_extracted ?? 0);
      setStage("done");
      setTimeout(() => router.push(`/onboard/${token}/details`), 2000);
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStage("error");
    }
  }

  const isDone = stage === "done";
  const isError = stage === "error";
  const isProcessing = stage === "uploading" || stage === "parsing";
  const canUpload = !!file && stage === "idle";

  return (
    <div style={{
      minHeight: "100vh",
      background: BG,
      fontFamily: "var(--font-poppins), -apple-system, sans-serif",
      display: "flex",
      flexDirection: "column",
    }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Step progress bar */}
      <div style={{ height: 4, background: "rgba(15,28,40,0.08)" }}>
        <div style={{ height: "100%", width: isDone ? "66%" : "33%", background: BURGUNDY, transition: "width 0.6s ease" }} />
      </div>

      {/* Header */}
      <div style={{ padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: NAVY, letterSpacing: "-0.01em" }}>
          Prospera Properties
        </p>
        <span style={{ fontSize: 13, color: SUBTLE, fontWeight: 500 }}>Step 1 of 3 · Upload Lease</span>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 520, animation: "fadeUp 0.5s ease both" }}>

          {isDone ? (
            <div style={{
              background: CARD,
              border: `1px solid rgba(10,122,82,0.20)`,
              boxShadow: CARD_SHADOW,
              borderRadius: 20,
              padding: "48px 32px",
              textAlign: "center",
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: GREEN_BG,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 24px",
                fontSize: 28, color: GREEN,
              }}>
                ✓
              </div>
              <h1 style={{ margin: "0 0 10px", fontSize: 26, fontWeight: 800, color: NAVY, letterSpacing: "-0.02em" }}>
                Lease received.
              </h1>
              <p style={{ margin: "0 0 6px", fontSize: 15, color: MUTED, lineHeight: 1.6 }}>
                We pulled {fieldsExtracted} fields automatically.
              </p>
              <p style={{ margin: 0, fontSize: 13, color: SUBTLE }}>Taking you to the next step…</p>
            </div>
          ) : (
            <>
              {/* Heading */}
              <div style={{ marginBottom: 32 }}>
                <h1 style={{ margin: "0 0 12px", fontSize: 30, fontWeight: 800, color: NAVY, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                  Upload your lease
                </h1>
                <p style={{ margin: 0, fontSize: 15, color: MUTED, lineHeight: 1.7 }}>
                  We&apos;ll extract the details automatically — takes about 30 seconds.
                </p>
              </div>

              {/* Drop zone */}
              <div
                onDragEnter={() => setStage("dragging")}
                onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setStage("idle"); }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                onClick={() => !isProcessing && !file && inputRef.current?.click()}
                style={{
                  background: stage === "dragging"
                    ? "rgba(139,32,48,0.04)"
                    : file ? "rgba(10,122,82,0.04)"
                    : CARD,
                  border: `2px dashed ${
                    stage === "dragging" ? BURGUNDY
                    : file ? "rgba(10,122,82,0.35)"
                    : CARD_BORDER
                  }`,
                  boxShadow: CARD_SHADOW,
                  borderRadius: 16,
                  padding: "44px 32px",
                  textAlign: "center",
                  cursor: isProcessing || file ? "default" : "pointer",
                  transition: "all 0.2s",
                  marginBottom: 16,
                }}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />

                {isProcessing ? (
                  <div>
                    <div style={{
                      width: 32, height: 32,
                      border: "3px solid rgba(15,28,40,0.10)",
                      borderTopColor: BURGUNDY,
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                      margin: "0 auto 16px",
                    }} />
                    <p style={{ margin: 0, fontSize: 15, color: MUTED, fontWeight: 500 }}>
                      {stage === "uploading" ? "Uploading…" : "Reading your lease — about 30 seconds…"}
                    </p>
                  </div>
                ) : file ? (
                  <div>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>📄</div>
                    <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: NAVY }}>{file.name}</p>
                    <p style={{ margin: "0 0 14px", fontSize: 13, color: SUBTLE }}>
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFile(null); setStage("idle"); }}
                      style={{
                        background: "none",
                        border: `1px solid ${CARD_BORDER}`,
                        borderRadius: 8,
                        padding: "5px 14px",
                        fontSize: 13,
                        color: MUTED,
                        cursor: "pointer",
                        fontFamily: "var(--font-poppins), -apple-system, sans-serif",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 36, marginBottom: 14 }}>📄</div>
                    <p style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: NAVY }}>
                      Drop your lease here
                    </p>
                    <p style={{ margin: 0, fontSize: 13, color: MUTED }}>
                      or click to browse · PDF, JPG, PNG · Max 10MB
                    </p>
                  </div>
                )}
              </div>

              {/* Error */}
              {(errorMsg || isError) && (
                <div style={{
                  background: RED_BG,
                  border: `1px solid rgba(185,28,28,0.20)`,
                  borderRadius: 10,
                  padding: "12px 16px",
                  marginBottom: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}>
                  <span style={{ color: RED, fontSize: 13, fontWeight: 600 }}>
                    {errorMsg || "Something went wrong."}
                  </span>
                  {isError && (
                    <button
                      onClick={() => { setStage("idle"); setErrorMsg(""); }}
                      style={{ marginLeft: "auto", background: "none", border: "none", fontSize: 13, color: RED, cursor: "pointer", fontWeight: 700, padding: 0 }}
                    >
                      Retry
                    </button>
                  )}
                </div>
              )}

              {/* Upload button */}
              <button
                onClick={upload}
                disabled={!canUpload}
                style={{
                  width: "100%",
                  background: canUpload ? BURGUNDY : "rgba(15,28,40,0.06)",
                  color: canUpload ? "#fff" : SUBTLE,
                  border: "none",
                  borderRadius: 12,
                  padding: "15px 24px",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: canUpload ? "pointer" : "not-allowed",
                  fontFamily: "var(--font-poppins), -apple-system, sans-serif",
                  transition: "all 0.2s",
                  marginBottom: 12,
                }}
              >
                Upload & Continue →
              </button>

              {/* Skip */}
              <button
                onClick={() => router.push(`/onboard/${token}/details`)}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "10px",
                  fontSize: 13,
                  color: SUBTLE,
                  cursor: "pointer",
                  fontFamily: "var(--font-poppins), -apple-system, sans-serif",
                  textDecoration: "underline",
                  textDecorationColor: "rgba(15,28,40,0.20)",
                }}
              >
                Skip for now →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
