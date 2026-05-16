"use client";
import Link from "next/link";

const BG = "#0B1219";
const NAV = "#070D13";
const SURFACE = "#111C27";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#EDE9E3";
const TEXT_SEC = "rgba(237,233,227,0.5)";
const TEXT_MUT = "rgba(237,233,227,0.28)";
const ACCENT = "#C4374A";

const stats = [
  { label: "Posts Published", value: "46", sub: "Across all categories" },
  { label: "Posting Frequency", value: "3×/week", sub: "Mon · Wed · Fri at 8am" },
  { label: "Google Indexed", value: "Pinged", sub: "Indexing API active" },
  { label: "Data Available", value: "~3 months", sub: "GSC needs time to populate" },
];

export default function SeoPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>
      <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: NAV, borderBottom: `1px solid ${BORDER}` }}>
        <div className="flex items-center gap-5">
          <span className="font-[family-name:var(--font-cormorant)] text-2xl font-light" style={{ color: TEXT }}>Prospera</span>
          <Link href="/admin" className="text-xs" style={{ color: TEXT_SEC }}>← Home</Link>
          <Link href="/" target="_blank" className="text-xs" style={{ color: TEXT_SEC }}>↗ View site</Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-14">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>SEO</p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-5xl font-light mb-3" style={{ color: TEXT }}>SEO Performance</h1>
          <p className="text-sm" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>
            The blog is running. Rankings take 3–6 months to appear in Google Search Console.
          </p>
        </div>

        {/* Status cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl p-5" style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>{s.label}</p>
              <p className="text-2xl font-light mb-1" style={{ color: TEXT, fontFamily: "var(--font-cormorant)" }}>{s.value}</p>
              <p className="text-xs" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* What's running */}
        <div className="rounded-xl p-7 mb-6" style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}>
          <p className="text-xs uppercase tracking-widest mb-5" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>What's running</p>
          <div className="space-y-4">
            {[
              { title: "SEO Writer", detail: "Picks highest-priority keyword → writes 1,500–2,000 word post → pushes to GitHub → triggers Vercel rebuild" },
              { title: "Google Indexing API", detail: "Pings Google on every publish so new posts get crawled within hours, not weeks" },
              { title: "seo-brain.md", detail: "Tracks every keyword written. 46 done across MONEY, PAIN, and LONG-TAIL categories. 7 targets remaining." },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: ACCENT }} />
                <div>
                  <p className="text-sm font-medium mb-0.5" style={{ color: TEXT, fontFamily: "var(--font-dm-sans)" }}>{item.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GSC link */}
        <a
          href="https://search.google.com/search-console"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-xl p-6 transition-opacity hover:opacity-80"
          style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}
        >
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: TEXT, fontFamily: "var(--font-dm-sans)" }}>Google Search Console</p>
            <p className="text-xs" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>View impressions, clicks, and rankings directly in GSC</p>
          </div>
          <span className="text-xs" style={{ color: TEXT_MUT }}>↗</span>
        </a>
      </div>
    </div>
  );
}
