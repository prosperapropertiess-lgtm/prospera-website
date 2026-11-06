import { ImageResponse } from "next/og";
import { loadReport } from "@/lib/market/report";
import { cad } from "@/lib/market/core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "London Rent Report";

// The newsletter / social image: one headline number and every ad as a dot.
export default async function Image({ params }: { params: Promise<{ edition: string }> }) {
  const { edition } = await params;
  const data = await loadReport(edition);
  const NAVY = "#1F2F3A", BG = "#F7F5F2", BURG = "#8B2030", MUTED = "#666666";
  if (!data) return new ImageResponse(<div style={{ display: "flex", width: "100%", height: "100%", background: BG }} />, size);

  const whole = data.dots.filter((d) => d.c === "whole");
  const BUCKET = 100, MAX = 4000, COLS = MAX / BUCKET + 1;
  const cols = Array.from({ length: COLS }, () => 0);
  for (const d of whole) cols[Math.min(COLS - 1, Math.round(Math.min(d.p, MAX) / BUCKET))]++;
  const tallest = Math.max(1, ...cols);
  const dot = Math.min(12, Math.floor(230 / tallest) - 2);
  const medianCol = data.whole.median != null ? Math.round(Math.min(data.whole.median, MAX) / BUCKET) : -1;
  const byBeds = ["1", "2", "3", "4"].map((b) => {
    const p = whole.filter((d) => d.b === b).map((d) => d.p).sort((x, y) => x - y);
    return { b, m: p.length ? p[Math.floor((p.length - 1) / 2)] + (p.length % 2 ? 0 : (p[p.length / 2] - p[(p.length - 1) / 2 | 0]) / 2) : null };
  });

  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: BG, padding: "48px 60px", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 22, letterSpacing: 3, color: MUTED, textTransform: "uppercase", fontWeight: 700 }}>London Rent Report · {data.edition.label}</div>
          <div style={{ display: "flex", fontSize: 22, color: NAVY, fontWeight: 700 }}>Prospera Properties</div>
        </div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 800, color: NAVY, marginTop: 18, lineHeight: 1.05 }}>
          A typical London home is asking {cad(data.whole.median)} a month.
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 250, marginTop: 26, position: "relative" }}>
          {cols.map((n, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column-reverse", gap: 2, width: (1080 - COLS * 4) / COLS, alignItems: "center" }}>
              {Array.from({ length: n }, (_, j) => (
                <div key={j} style={{ width: dot, height: dot, borderRadius: dot, background: i === medianCol ? BURG : NAVY }} />
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", height: 2, background: "#D8D2C8", marginTop: 6 }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, color: MUTED, marginTop: 6 }}>
          <span>$0</span><span>$1k</span><span>$2k</span><span>$3k</span><span>$4k+</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
          <div style={{ display: "flex", gap: 28, fontSize: 24, color: NAVY }}>
            {byBeds.filter((x) => x.m).map((x) => <span key={x.b} style={{ display: "flex" }}><b>{x.b}-bed</b>&nbsp;{cad(x.m)}</span>)}
            <span style={{ display: "flex", color: MUTED }}>{data.observed} ads</span>
          </div>
          <div style={{ display: "flex", background: BURG, color: "#FAF8F5", fontSize: 22, fontWeight: 700, padding: "14px 24px", borderRadius: 8, letterSpacing: 1 }}>EXPLORE THE REPORT →</div>
        </div>
      </div>
    ),
    size,
  );
}
