"use client";
import { useState } from "react";

// Zips every photo in the browser (the signed URLs allow cross-origin
// fetches), so a 300-photo house never has to go through a server function.
export default function DownloadAllPhotos({ photos, fileName }: { photos: { url: string; name: string }[]; fileName: string }) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");

  if (!photos.length) return null;

  async function download() {
    setError("");
    setProgress(0);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const used = new Map<string, number>();
      let done = 0;
      let failed = 0;
      // A few at a time — fast without hammering a phone's connection.
      const queue = [...photos];
      async function worker() {
        while (queue.length) {
          const p = queue.shift()!;
          try {
            const res = await fetch(p.url);
            if (!res.ok) throw new Error(String(res.status));
            const base = p.name.replace(/[\\/:*?"<>|]/g, "-");
            const n = (used.get(base) ?? 0) + 1;
            used.set(base, n);
            zip.file(`${n > 1 ? `${base} (${n})` : base}.jpg`, await res.blob());
          } catch {
            failed++;
          }
          done++;
          setProgress(Math.round((done / photos.length) * 100));
        }
      }
      await Promise.all(Array.from({ length: 4 }, worker));
      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${fileName.replace(/[\\/:*?"<>|]/g, "-")}.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 10000);
      if (failed) setError(`${failed} photo${failed === 1 ? "" : "s"} couldn't be downloaded. Refresh the page and try again.`);
    } catch {
      setError("Download failed. Refresh the page and try again.");
    }
    setProgress(null);
  }

  return (
    <div>
      <button
        onClick={download}
        disabled={progress !== null}
        style={{ backgroundColor: "#FFFFFF", color: "#1F2F3A", border: "1px solid #D8D2C8", padding: "12px 18px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: progress === null ? "pointer" : "default" }}
      >
        {progress === null ? `Download All ${photos.length} Photos` : `Preparing… ${progress}%`}
      </button>
      {error && <p style={{ fontSize: 13, color: "#8B2030", margin: "6px 0 0" }}>{error}</p>}
    </div>
  );
}
