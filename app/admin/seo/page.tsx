"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const BG = "#0B1219";
const NAV = "#070D13";
const SURFACE = "#111C27";
const SURFACE_HI = "#172234";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#EDE9E3";
const TEXT_SEC = "rgba(237,233,227,0.5)";
const TEXT_MUT = "rgba(237,233,227,0.28)";
const ACCENT = "#C4374A";

interface Summary { clicks: number; impressions: number; ctr: number; position: number; prevClicks: number; prevImpressions: number; }
interface PageRow { slug: string; clicks: number; impressions: number; ctr: number; position: number; }
interface QueryRow { query: string; clicks: number; impressions: number; ctr: number; position: number; }

function Skeleton() {
  return <div className="animate-pulse rounded-xl h-24" style={{ backgroundColor: SURFACE }} />;
}

function StatCard({ label, value, sub, accent, delta }: { label: string; value: string; sub?: string; accent?: boolean; delta?: number }) {
  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}>
      <p className="text-xs uppercase tracking-widest mb-1" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>{label}</p>
      <p className="text-3xl font-light" style={{ color: accent ? ACCENT : TEXT, fontFamily: "var(--font-cormorant)" }}>{value}</p>
      {delta !== undefined && delta !== 0 && (
        <p className="text-xs mt-0.5" style={{ color: delta > 0 ? "#4ade80" : "#f87171", fontFamily: "var(--font-dm-sans)" }}>
          {delta > 0 ? "+" : ""}{delta} vs prior period
        </p>
      )}
      {sub && <p className="text-xs mt-1" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>{sub}</p>}
    </div>
  );
}

function ConnectCard() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-xs uppercase tracking-widest mb-4" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>Not connected</p>
      <h2 className="font-[family-name:var(--font-cormorant)] text-4xl font-light mb-4" style={{ color: TEXT }}>Connect Search Console</h2>
      <p className="text-sm mb-8 max-w-sm leading-relaxed" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>
        Connect your Google account to pull live impressions, rankings, and top queries directly from Search Console.
      </p>
      <a
        href="/api/admin/seo/authorize"
        className="px-8 py-3 rounded text-sm font-semibold transition-opacity hover:opacity-80"
        style={{ backgroundColor: ACCENT, color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
      >
        Connect Google Search Console →
      </a>
    </div>
  );
}

function SeoInner() {
  const searchParams = useSearchParams();
  const [connected, setConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [pages, setPages] = useState<PageRow[]>([]);
  const [queries, setQueries] = useState<QueryRow[]>([]);
  const [period, setPeriod] = useState<{ start: string; end: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/seo/status").then(r => r.json()).then(d => {
      const isConnected = d.connected || searchParams.get("connected") === "1";
      setConnected(isConnected);
      if (isConnected) {
        fetch("/api/admin/seo-stats").then(r => r.json()).then(data => {
          if (!data.error) {
            setSummary(data.summary);
            setPages(data.pages ?? []);
            setQueries(data.queries ?? []);
            setPeriod(data.period);
          }
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, [searchParams]);

  if (connected === null) return null;
  if (!connected) return <ConnectCard />;

  const fmt = (n: number) => n.toLocaleString();
  const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`;
  const fmtPos = (n: number) => `#${n.toFixed(1)}`;

  return (
    <div>
      {searchParams.get("connected") === "1" && (
        <div className="mb-6 px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: "#14532d", color: "#4ade80", fontFamily: "var(--font-dm-sans)" }}>
          Connected! Google Search Console is now linked.
        </div>
      )}
      {searchParams.get("error") && (
        <div className="mb-6 px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: "#450a0a", color: "#f87171", fontFamily: "var(--font-dm-sans)" }}>
          Connection failed — try again.
        </div>
      )}

      <p className="text-xs uppercase tracking-widest mb-3" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>
        Last 28 days{period ? ` · ${period.start} → ${period.end}` : ""} · Google Search Console
      </p>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {loading ? [...Array(4)].map((_, i) => <Skeleton key={i} />) : summary ? (
          <>
            <StatCard label="Clicks" value={fmt(summary.clicks)} delta={summary.clicks - summary.prevClicks} />
            <StatCard label="Impressions" value={fmt(summary.impressions)} delta={summary.impressions - summary.prevImpressions} />
            <StatCard label="Avg Position" value={summary.position > 0 ? fmtPos(summary.position) : "—"} accent={summary.position > 0 && summary.position < 20} sub="Lower is better" />
            <StatCard label="CTR" value={fmtPct(summary.ctr)} sub="Click-through rate" />
          </>
        ) : <p className="col-span-4 text-sm text-center py-6" style={{ color: TEXT_MUT }}>No data yet — check back in a few weeks.</p>}
      </div>

      {/* Top pages */}
      <p className="text-xs uppercase tracking-widest mb-3" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>Top pages — last 28 days</p>
      {!loading && pages.length > 0 ? (
        <div className="rounded-xl border overflow-hidden mb-8" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: NAV, borderBottom: `1px solid ${BORDER}` }}>
                {["Page", "Impressions", "Clicks", "Position", "CTR"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-widest font-normal" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pages.map((row, i) => (
                <tr key={row.slug} style={{ borderTop: i > 0 ? `1px solid ${BORDER}` : undefined }}>
                  <td className="px-4 py-3">
                    <a href={`/blog/${row.slug}`} target="_blank" className="hover:underline text-xs" style={{ color: ACCENT, fontFamily: "var(--font-dm-sans)" }}>{row.slug}</a>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: TEXT, fontFamily: "var(--font-dm-sans)" }}>{fmt(row.impressions)}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>{fmt(row.clicks)}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>{fmtPos(row.position)}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>{fmtPct(row.ctr)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !loading ? (
        <div className="rounded-xl border p-8 text-center mb-8" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
          <p className="text-sm" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>Pages are indexed but not yet ranking — check back in 2–4 weeks.</p>
        </div>
      ) : <Skeleton />}

      {/* Top queries */}
      <p className="text-xs uppercase tracking-widest mb-3" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>Top queries</p>
      {!loading && queries.length > 0 ? (
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: NAV, borderBottom: `1px solid ${BORDER}` }}>
                {["Query", "Impressions", "Clicks", "Position", "CTR"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-widest font-normal" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {queries.map((row, i) => (
                <tr key={row.query} style={{ borderTop: i > 0 ? `1px solid ${BORDER}` : undefined }}>
                  <td className="px-4 py-3 text-xs" style={{ color: TEXT, fontFamily: "var(--font-dm-sans)" }}>{row.query}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: TEXT, fontFamily: "var(--font-dm-sans)" }}>{fmt(row.impressions)}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>{fmt(row.clicks)}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>{fmtPos(row.position)}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>{fmtPct(row.ctr)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !loading ? (
        <div className="rounded-xl border p-8 text-center" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
          <p className="text-sm" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>No query data yet.</p>
        </div>
      ) : <Skeleton />}
    </div>
  );
}

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
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-light mb-10" style={{ color: TEXT }}>SEO Performance</h1>
        <Suspense fallback={null}>
          <SeoInner />
        </Suspense>
      </div>
    </div>
  );
}
