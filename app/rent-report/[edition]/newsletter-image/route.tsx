import { ImageResponse } from "next/og";
import { loadReport } from "@/lib/market/report";
import { cad } from "@/lib/market/core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const W = 1200, H = 800;
const NAVY = "#1F2F3A", BG = "#F7F5F2", BURG = "#8B2030", MUTED = "#666666", PALE = "#C9D1D7";

async function outfit(weight: number): Promise<ArrayBuffer | null> {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Outfit:wght@${weight}`, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1)" } })).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch { return null; }
}

/**
 * The newsletter hook image. Evergreen: it asks where the reader's rent lands until there's
 * a real week-over-week change to lead with, then it leads with that.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ edition: string }> }) {
  const { edition } = await params;
  const data = await loadReport(edition);
  const [bold, regular] = await Promise.all([outfit(700), outfit(400)]);
  const fonts = [bold && { name: "Outfit", data: bold, weight: 700 as const }, regular && { name: "Outfit", data: regular, weight: 400 as const }]
    .filter(Boolean) as { name: string; data: ArrayBuffer; weight: 400 | 700 }[];
  if (!data) return new ImageResponse(<div style={{ display: "flex", width: "100%", height: "100%", background: BG }} />, { width: W, height: H });

  // Headline: real news when there is some, the question otherwise.
  const h = data.history, last = h[h.length - 1], prev = h[h.length - 2];
  const delta = last && prev && last.wholeMedian != null && prev.wholeMedian != null ? Math.round(last.wholeMedian - prev.wholeMedian) : null;
  const period = data.edition.kind === "weekly" ? "this week" : "this month";
  const headline = delta && Math.abs(delta) >= 10 ? `London rent went ${delta > 0 ? "up" : "down"} ${cad(Math.abs(delta))} ${period}.` : "Where does your rent land?";
  const sub = delta && Math.abs(delta) >= 10 ? "See which homes moved, and where yours sits." : `${data.whole.n} London homes for rent, ${period}. One of them could be yours.`;

  // Dot plot of every whole-home ad, $100 columns.
  const prices = data.dots.filter((d) => d.c === "whole").map((d) => d.p);
  const BUCKET = 100, MAX = 4000, COLS = MAX / BUCKET + 1;
  const cols = Array.from({ length: COLS }, () => 0);
  for (const p of prices) cols[Math.min(COLS - 1, Math.round(Math.min(p, MAX) / BUCKET))]++;
  const tallest = Math.max(1, ...cols);
  const dot = Math.max(6, Math.min(14, Math.floor(300 / tallest) - 3));
  const colW = (W - 120 - (COLS - 1) * 4) / COLS;
  const xOf = (p: number) => 60 + (Math.min(p, MAX) / MAX) * (W - 120);
  const median = data.whole.median ?? 0;
  const pinX = xOf((data.whole.p75 ?? median) + 150);   // the "Your home?" pin floats just above typical, inviting the question

  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: BG, fontFamily: fonts.length ? "Outfit" : "sans-serif", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "44px 60px 0", fontSize: 22, color: MUTED, letterSpacing: 3, fontWeight: 700 }}>
          <span>LONDON RENT REPORT</span><span>{data.edition.label.toUpperCase()}</span>
        </div>
        <div style={{ display: "flex", padding: "18px 60px 0", fontSize: 76, fontWeight: 700, color: NAVY, lineHeight: 1.02 }}>{headline}</div>
        <div style={{ display: "flex", padding: "14px 60px 0", fontSize: 30, color: "#333" }}>{sub}</div>

        {/* dots */}
        <div style={{ display: "flex", position: "absolute", left: 60, right: 60, bottom: 150, height: 330, alignItems: "flex-end", gap: 4 }}>
          {cols.map((n, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column-reverse", gap: 3, width: colW, alignItems: "center" }}>
              {Array.from({ length: n }, (_, j) => <div key={j} style={{ width: dot, height: dot, borderRadius: dot, background: PALE }} />)}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", position: "absolute", left: 60, right: 60, bottom: 146, height: 3, background: "#D8D2C8" }} />

        {/* typical line */}
        <div style={{ display: "flex", position: "absolute", left: xOf(median) - 1, bottom: 146, width: 3, height: 340, background: NAVY }} />
        <div style={{ display: "flex", position: "absolute", left: xOf(median) - 90, bottom: 490, width: 180, justifyContent: "center" }}>
          <span style={{ display: "flex", background: NAVY, color: "#FAF8F5", fontSize: 22, fontWeight: 700, padding: "6px 14px", borderRadius: 999 }}>Typical {cad(median)}</span>
        </div>

        {/* the hook: a question-mark pin */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "absolute", left: pinX - 80, bottom: 146, width: 160 }}>
          <span style={{ display: "flex", background: BURG, color: "#FAF8F5", fontSize: 26, fontWeight: 700, padding: "8px 18px", borderRadius: 999 }}>Your home?</span>
          <div style={{ display: "flex", width: 4, height: 150, background: BURG }} />
          <div style={{ display: "flex", width: 22, height: 22, borderRadius: 22, background: BURG, marginTop: -11 }} />
        </div>

        <div style={{ display: "flex", position: "absolute", left: 60, right: 60, bottom: 112, justifyContent: "space-between", fontSize: 20, color: MUTED }}>
          <span>$0</span><span>$1k</span><span>$2k</span><span>$3k</span><span>$4k+</span>
        </div>

        <div style={{ display: "flex", position: "absolute", left: 60, right: 60, bottom: 34, justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ display: "flex", fontSize: 22, color: MUTED }}>Every dot is a real ad · Prospera Properties</span>
          <span style={{ display: "flex", background: BURG, color: "#FAF8F5", fontSize: 24, fontWeight: 700, padding: "16px 28px", borderRadius: 10, letterSpacing: 1 }}>SEE WHERE YOURS LANDS →</span>
        </div>
      </div>
    ),
    { width: W, height: H, fonts, headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
