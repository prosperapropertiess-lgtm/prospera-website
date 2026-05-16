"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const BG = "#0B1219";
const NAV = "#070D13";
const SURFACE = "#111C27";
const SURFACE_HI = "#172234";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#EDE9E3";
const TEXT_SEC = "rgba(237,233,227,0.5)";
const TEXT_MUT = "rgba(237,233,227,0.28)";
const ACCENT = "#C4374A";

interface Summary {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  prevClicks: number;
  prevImpressions: number;
}

interface PageRow {
  page: string;
  slug: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface QueryRow {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface SEOData {
  period: { start: string; end: string };
  summary: Summary;
  pages: PageRow[];
  queries: QueryRow[];
  error?: string;
}

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: React.ReactNode; accent?: boolean }) {
  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}>
      <p className="text-xs uppercase tracking-widest mb-1" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>{label}</p>
      <p className="text-3xl font-light" style={{ color: accent ? ACCENT : TEXT, fontFamily: "var(--font-cormorant)" }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>{sub}</p>}
    </div>
  );
}

function Delta({ current, prev }: { current: number; prev: number }) {
  const diff = current - prev;
  if (prev === 0 && diff === 0) return <span style={{ color: TEXT_MUT }}>no prior data</span>;
  const sign = diff >= 0 ? "+" : "";
  const color = diff >= 0 ? "#4ade80" : "#f87171";
  return <span style={{ color }}>{sign}{diff} vs prior period</span>;
}

function Skeleton() {
  return <div className="animate-pulse rounded-xl h-24" style={{ backgroundColor: SURFACE }} />;
}

function TableSkeleton() {
  return (
    <div className="animate-pulse rounded-xl" style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-10 m-4 rounded" style={{ backgroundColor: SURFACE_HI }} />
      ))}
    </div>
  );
}

function fmt(n: number, decimals = 1) {
  return n.toFixed(decimals);
}

export default function SEOPage() {
  const router = useRouter();
  const [data, setData] = useState<SEOData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/seo-stats")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setData({ error: "fetch failed" } as SEOData); setLoading(false); });
  }, []);

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  const s = data?.summary;

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>
      {/* Nav */}
      <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: NAV, borderBottom: `1px solid ${BORDER}` }}>
        <div className="flex items-center gap-5">
          <span className="font-[family-name:var(--font-cormorant)] text-2xl font-light" style={{ color: TEXT }}>Prospera</span>
          <Link href="/admin" className="text-xs transition-colors" style={{ color: TEXT_SEC }}>← Home</Link>
          <Link href="/" target="_blank" className="text-xs transition-colors" style={{ color: TEXT_SEC }}>↗ View site</Link>
        </div>
        <button onClick={handleLogout} className="text-xs transition-colors" style={{ color: TEXT_SEC }}>Sign out</button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-14">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-[family-name:var(--font-cormorant)] text-5xl font-light mb-2" style={{ color: TEXT }}>
            SEO Performance
          </h1>
          <p className="text-sm" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>
            Last 28 days · Google Search Console
          </p>
        </div>

        {/* Error state */}
        {!loading && data?.error && (
          <div className="rounded-xl p-6 mb-8" style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}>
            <p className="text-sm" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>
              Could not load GSC data. Make sure the service account is added as an owner in Google Search Console.
            </p>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {loading ? (
            [...Array(4)].map((_, i) => <Skeleton key={i} />)
          ) : !data?.error && s ? (
            <>
              <StatCard
                label="Total Clicks"
                value={s.clicks.toLocaleString()}
                sub={<Delta current={s.clicks} prev={s.prevClicks} />}
              />
              <StatCard
                label="Total Impressions"
                value={s.impressions.toLocaleString()}
                sub={<Delta current={s.impressions} prev={s.prevImpressions} />}
              />
              <StatCard
                label="Avg Position"
                value={`#${fmt(s.position)}`}
                accent={s.position > 0 && s.position < 20}
                sub="lower is better"
              />
              <StatCard
                label="Avg CTR"
                value={`${fmt(s.ctr * 100)}%`}
              />
            </>
          ) : null}
        </div>

        {/* Top Pages table */}
        {!data?.error && (
          <div className="mb-10">
            <p className="text-xs uppercase tracking-widest mb-4" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>
              TOP PAGES — LAST 28 DAYS
            </p>
            {loading ? <TableSkeleton /> : (
              <div className="rounded-xl overflow-hidden" style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}>
                {data?.pages && data.pages.length > 0 ? (
                  <table className="w-full text-sm" style={{ fontFamily: "var(--font-dm-sans)" }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                        {["Page", "Impressions", "Clicks", "Position", "CTR"].map((h) => (
                          <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-widest font-normal" style={{ color: TEXT_MUT }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.pages.map((row, i) => (
                        <tr
                          key={row.page}
                          style={{ borderBottom: i < data.pages.length - 1 ? `1px solid ${BORDER}` : undefined }}
                        >
                          <td className="px-5 py-3">
                            <Link
                              href={`/blog/${row.slug}`}
                              target="_blank"
                              className="underline underline-offset-2 transition-colors"
                              style={{ color: TEXT }}
                            >
                              {row.slug || row.page}
                            </Link>
                          </td>
                          <td className="px-5 py-3" style={{ color: TEXT_SEC }}>{row.impressions.toLocaleString()}</td>
                          <td className="px-5 py-3" style={{ color: TEXT_SEC }}>{row.clicks.toLocaleString()}</td>
                          <td className="px-5 py-3" style={{ color: TEXT_SEC }}>#{fmt(row.position)}</td>
                          <td className="px-5 py-3" style={{ color: TEXT_SEC }}>{fmt(row.ctr * 100)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="px-5 py-6 text-sm" style={{ color: TEXT_SEC }}>
                    Pages indexed but not yet ranking — check back in 2–4 weeks.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Top Queries table */}
        {!data?.error && (
          <div>
            <p className="text-xs uppercase tracking-widest mb-4" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>
              TOP QUERIES
            </p>
            {loading ? <TableSkeleton /> : (
              <div className="rounded-xl overflow-hidden" style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}>
                {data?.queries && data.queries.length > 0 ? (
                  <table className="w-full text-sm" style={{ fontFamily: "var(--font-dm-sans)" }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                        {["Query", "Impressions", "Clicks", "Position", "CTR"].map((h) => (
                          <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-widest font-normal" style={{ color: TEXT_MUT }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.queries.map((row, i) => (
                        <tr
                          key={row.query}
                          style={{ borderBottom: i < data.queries.length - 1 ? `1px solid ${BORDER}` : undefined }}
                        >
                          <td className="px-5 py-3" style={{ color: TEXT }}>{row.query}</td>
                          <td className="px-5 py-3" style={{ color: TEXT_SEC }}>{row.impressions.toLocaleString()}</td>
                          <td className="px-5 py-3" style={{ color: TEXT_SEC }}>{row.clicks.toLocaleString()}</td>
                          <td className="px-5 py-3" style={{ color: TEXT_SEC }}>#{fmt(row.position)}</td>
                          <td className="px-5 py-3" style={{ color: TEXT_SEC }}>{fmt(row.ctr * 100)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="px-5 py-6 text-sm" style={{ color: TEXT_SEC }}>
                    No query data yet — check back once the site has search impressions.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
