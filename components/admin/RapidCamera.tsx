"use client";
/**
 * Full-screen camera for the move-in walkthrough. The camera stays open:
 * tap the shutter as many times as you like, each shot is filed under the
 * chip that's selected (the whole room, or one item), and uploads happen in
 * the background queue. No file picker, no "use photo?" confirm per shot.
 *
 * Falls back to the phone's own camera (multi-select file input) when the
 * browser won't give us a live camera (permission denied, old iOS, etc.).
 */
import { useEffect, useRef, useState } from "react";

export interface CameraTarget { type: "room" | "item" | "appliance"; id: string; label: string }

export default function RapidCamera({ title, targets, initialTargetId, onCapture, onClose, queueStatus }: {
  title: string;
  targets: CameraTarget[];
  initialTargetId?: string;
  onCapture: (target: CameraTarget, source: HTMLVideoElement | Blob) => void;
  onClose: () => void;
  queueStatus: { pending: number; failed: number };
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [targetId, setTargetId] = useState(initialTargetId ?? targets[0]?.id);
  const [cameraError, setCameraError] = useState(false);
  const [taken, setTaken] = useState(0);
  const [flash, setFlash] = useState(false);
  const target = targets.find((t) => t.id === targetId) ?? targets[0];

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1440 } },
          audio: false,
        });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } catch {
        setCameraError(true);
      }
    })();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function shoot() {
    const v = videoRef.current;
    if (!v || !target || v.readyState < 2) return;
    onCapture(target, v);
    setTaken((n) => n + 1);
    setFlash(true);
    setTimeout(() => setFlash(false), 120);
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, backgroundColor: "#000", display: "flex", flexDirection: "column", color: "#FFF" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 16, fontWeight: 700, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</p>
          <p style={{ fontSize: 13, opacity: 0.75, margin: 0 }}>
            {taken} taken
            {queueStatus.pending > 0 ? ` · ${queueStatus.pending} uploading` : " · all saved"}
            {queueStatus.failed > 0 ? ` · ${queueStatus.failed} failed` : ""}
          </p>
        </div>
        <button onClick={onClose} style={{ backgroundColor: "#FFF", color: "#1F2F3A", border: "none", borderRadius: 10, padding: "12px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Done</button>
      </div>

      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {!cameraError ? (
          <video ref={videoRef} playsInline muted style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        ) : (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center", gap: 16 }}>
            <p style={{ fontSize: 15, opacity: 0.85, margin: 0 }}>The live camera isn&apos;t available here. Use the phone camera instead. You can pick several photos at once.</p>
            <button onClick={() => fileRef.current?.click()} style={{ backgroundColor: "#FFF", color: "#1F2F3A", border: "none", borderRadius: 12, padding: "16px 24px", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
              Open Camera
            </button>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" multiple style={{ display: "none" }}
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                if (target) for (const f of files) onCapture(target, f);
                setTaken((n) => n + files.length);
                e.target.value = "";
              }} />
          </div>
        )}
        {flash && <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,255,255,0.35)", pointerEvents: "none" }} />}
      </div>

      {/* What the next shot is of */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "12px 16px 4px" }}>
        {targets.map((t) => (
          <button key={t.id} onClick={() => setTargetId(t.id)} style={{
            flexShrink: 0, padding: "10px 14px", borderRadius: 20, fontSize: 14, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
            border: "2px solid #FFF", backgroundColor: t.id === target?.id ? "#FFF" : "transparent", color: t.id === target?.id ? "#1F2F3A" : "#FFF",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {!cameraError && (
        <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 calc(20px + env(safe-area-inset-bottom))" }}>
          <button onClick={shoot} aria-label="Take photo" style={{ width: 78, height: 78, borderRadius: "50%", border: "5px solid #FFF", backgroundColor: "rgba(255,255,255,0.25)", cursor: "pointer" }} />
        </div>
      )}
    </div>
  );
}
