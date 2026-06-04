"use client";

import { useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

const BG      = "#080c14";
const SURFACE = "#0f1520";
const BORDER  = "rgba(255,255,255,0.08)";
const BORDER_DRAG = "rgba(139,32,48,0.6)";
const TEXT    = "#EDE9E3";
const TEXT_SEC = "rgba(237,233,227,0.55)";
const TEXT_MUT = "rgba(237,233,227,0.28)";
const ACCENT  = "#8B2030";
const GREEN   = "#22c55e";

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
      // Redirect to details form after short delay
      setTimeout(() => router.push(`/onboard/${token}/details`), 2000);
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStage("error");
    }
  }

  async function skip() {
    router.push(`/onboard/${token}/details`);
  }

  const isDone = stage === "done";
  const isProcessing = stage === "uploading" || stage === "parsing";
  const canUpload = !!file && stage === "idle";

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: BG,
      color: TEXT,
      fontFamily: "var(--font-dm-sans, sans-serif)",
      display: "flex",
      flexDirection: "column",
    }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px) }
          to   { opacity: 1; transform: translateY(0) }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1 }
          50% { opacity: 0.5 }
        }
      `}</style>

      {/* Progress bar */}
      <div style={{ height: 3, backgroundColor: "rgba(255,255,255,0.05)" }}>
        <div style={{ height: "100%", width: "20%", backgroundColor: ACCENT, transition: "width 0.6s ease" }} />
      </div>

      {/* Logo */}
      <div style={{ padding: "24px 32px" }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT }}>
          Prospera Properties
        </p>
      </div>

      {/* Main */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 24px",
      }}>
        <div style={{ width: "100%", maxWidth: 520, animation: "fadeUp 0.6s cubic-bezier(0.23,1,0.32,1) both" }}>

          {isDone ? (
            // Done state
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                backgroundColor: `${GREEN}20`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 24px",
                fontSize: 28,
              }}>
                ✓
              </div>
              <h1 style={{ margin: "0 0 12px", fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", color: TEXT }}>
                Lease received.
              </h1>
              <p style={{ margin: "0 0 8px", fontSize: 16, color: TEXT_SEC, lineHeight: 1.6 }}>
                We pulled {fieldsExtracted} fields automatically.
              </p>
              <p style={{ margin: 0, fontSize: 14, color: TEXT_MUT }}>
                Taking you to the next step…
              </p>
            </div>
          ) : (
            <>
              {/* Heading */}
              <div style={{ marginBottom: 40 }}>
                <p style={{ margin: "0 0 6px", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: TEXT_MUT }}>
                  Step 1 of 3
                </p>
                <h1 style={{ margin: "0 0 14px", fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, color: TEXT }}>
                  Upload your lease agreement
                </h1>
                <p style={{ margin: 0, fontSize: 16, color: TEXT_SEC, lineHeight: 1.7 }}>
                  We&apos;ll pull all the details automatically — tenant names, rent, dates — so you don&apos;t have to re-enter anything.
                </p>
              </div>

              {/* Drop zone */}
              <div
                onDragEnter={() => setStage("dragging")}
                onDragLeave={() => setStage("idle")}
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                onClick={() => !file && inputRef.current?.click()}
                style={{
                  border: `2px dashed ${stage === "dragging" ? BORDER_DRAG : file ? "rgba(34,197,94,0.4)" : BORDER}`,
                  borderRadius: 16,
                  backgroundColor: stage === "dragging"
                    ? "rgba(139,32,48,0.06)"
                    : file
                    ? "rgba(34,197,94,0.04)"
                    : "rgba(255,255,255,0.02)",
                  padding: "40px 24px",
                  textAlign: "center",
                  cursor: file ? "default" : "pointer",
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
                      border: `2px solid rgba(255,255,255,0.1)`,
                      borderTopColor: ACCENT,
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                      margin: "0 auto 16px",
                    }} />
                    <p style={{ margin: 0, fontSize: 15, color: TEXT_SEC }}>
                      {stage === "uploading" ? "Uploading…" : "Reading your lease — this takes about 15 seconds…"}
                    </p>
                  </div>
                ) : file ? (
                  <div>
                    <p style={{ margin: "0 0 8px", fontSize: 24 }}>📄</p>
                    <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600, color: TEXT }}>{file.name}</p>
                    <p style={{ margin: "0 0 14px", fontSize: 13, color: TEXT_MUT }}>
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      style={{
                        background: "none", border: `1px solid ${BORDER}`,
                        borderRadius: 6, padding: "5px 12px",
                        fontSize: 12, color: TEXT_MUT, cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <p style={{ margin: "0 0 12px", fontSize: 28 }}>📎</p>
                    <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600, color: TEXT }}>
                      Drop your lease here
                    </p>
                    <p style={{ margin: 0, fontSize: 13, color: TEXT_MUT }}>
                      or click to browse — PDF, JPG, PNG · Max 10MB
                    </p>
                  </div>
                )}
              </div>

              {errorMsg && (
                <p style={{ margin: "0 0 14px", fontSize: 13, color: "#f87171", textAlign: "center" }}>
                  {errorMsg}
                </p>
              )}

              {/* Upload button */}
              <button
                onClick={upload}
                disabled={!canUpload}
                style={{
                  width: "100%",
                  backgroundColor: canUpload ? ACCENT : "rgba(255,255,255,0.06)",
                  color: canUpload ? "#fff" : TEXT_MUT,
                  border: "none",
                  borderRadius: 12,
                  padding: "15px 24px",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: canUpload ? "pointer" : "not-allowed",
                  letterSpacing: "-0.01em",
                  transition: "all 0.2s",
                  marginBottom: 14,
                }}
              >
                Upload & Continue →
              </button>

              {/* Skip */}
              <button
                onClick={skip}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "10px",
                  fontSize: 13,
                  color: TEXT_MUT,
                  cursor: "pointer",
                  textDecoration: "underline",
                  textDecorationColor: "rgba(237,233,227,0.15)",
                }}
              >
                I don&apos;t have a lease yet — skip this step
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
