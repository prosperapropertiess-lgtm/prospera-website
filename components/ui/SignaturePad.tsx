"use client";
import { useRef, useState, useCallback } from "react";

/**
 * Finger/stylus signature capture on a plain <canvas>. touchAction: "none"
 * plus preventDefault on pointer events stops the page from scrolling
 * while someone's mid-signature — the one thing the spec explicitly calls
 * out ("Signature input that does not accidentally scroll the page").
 */
export default function SignaturePad({ onChange }: { onChange: (dataUrl: string | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const [hasStroke, setHasStroke] = useState(false);

  const getCtx = () => canvasRef.current?.getContext("2d") ?? null;

  const pointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    drawing.current = true;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }, []);

  const pointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1F2F3A";
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    if (!hasStroke) setHasStroke(true);
  }, [hasStroke]);

  const pointerUp = useCallback(() => {
    drawing.current = false;
    const canvas = canvasRef.current;
    if (canvas && hasStroke) onChange(canvas.toDataURL("image/png"));
  }, [hasStroke, onChange]);

  function clear() {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasStroke(false);
    onChange(null);
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={600}
        height={200}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerLeave={pointerUp}
        style={{ width: "100%", height: 160, touchAction: "none", backgroundColor: "#FFFFFF", border: "2px solid #D8D2C8", borderRadius: 10, cursor: "crosshair" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
        <span style={{ fontSize: 12, color: "#999999" }}>Sign above with a finger or stylus</span>
        <button type="button" onClick={clear} style={{ fontSize: 12, color: "#8B2030", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
          Clear & Retry
        </button>
      </div>
    </div>
  );
}
