"use client";
import Image from "next/image";

const FONT = "var(--font-dm-sans)";
const BORDER = "#E8E4DF";

export interface ReviewScreenshot {
  src: string | null;
  alt: string;
}

/**
 * Ebin is supplying real Google review screenshots directly (images, not
 * text pulled from code). Renders whatever's provided; any slot with
 * src: null shows a clearly-labeled placeholder frame instead of a broken
 * image, so this ships today and just needs files dropped into /public
 * later — no code changes needed to go from placeholder to real.
 */
export default function ReviewScreenshotGallery({ screenshots }: { screenshots: ReviewScreenshot[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {screenshots.map((s, i) => (
        <div
          key={i}
          style={{
            aspectRatio: "3 / 4", borderRadius: 14, overflow: "hidden",
            border: `1px solid ${BORDER}`, backgroundColor: "#FAFAF8",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {s.src ? (
            <Image src={s.src} alt={s.alt} width={400} height={533} className="w-full h-full object-cover" />
          ) : (
            <div style={{ textAlign: "center", padding: 20 }}>
              <p style={{ fontSize: 28, marginBottom: 8 }}>★★★★★</p>
              <p style={{ fontSize: 12, color: "#aaa", fontFamily: FONT, lineHeight: 1.5 }}>
                Review screenshot<br />goes here
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
