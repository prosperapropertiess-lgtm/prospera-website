"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const BG = "#F7F5F2";
const NAV = "#F7F5F2";
const SURFACE = "#FFFFFF";
const SURFACE_HI = "#F7F5F2";
const BORDER = "#D8D2C8";
const TEXT = "#222222";
const TEXT_SEC = "#666666";
const TEXT_MUT = "#999999";
const ACCENT = "#8B2030";

interface CityStats { total: number; week: number; scraped: number; landlord: number; manual: number; }
interface MarketRow { city: string; bedrooms: number; median_rent: number | null; p25_rent: number | null; p75_rent: number | null; submission_count: number; computed_at: string; trend_direction: string | null; }
interface AnalysisRequest { city: string; bedrooms: number; created_at: string; used: boolean; }
interface TrendPoint { label: string; count: number; }
interface IntelData {
  totalSubmissions: number; scrapedTotal: number; landlordTotal: number;
  scrapedThisWeek: number; landlordThisWeek: number;
  analysisTotal: number; analysisThisWeek: number; analysisUsed: number;
  recentAnalysisRequests: AnalysisRequest[];
  cities: Record<string, CityStats>;
  market_data: MarketRow[];
  last_refresh: string | null;
  scrapeTrend: TrendPoint[];
}

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}>
      <p className="text-xs uppercase tracking-widest mb-1" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>{label}</p>
      <p className="text-3xl font-light" style={{ color: accent ? ACCENT : TEXT, fontFamily: "var(--font-cormorant)" }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>{sub}</p>}
    </div>
  );
}

function Skeleton({ height = "h-24" }: { height?: string }) {
  return <div className={`animate-pulse rounded-xl ${height}`} style={{ backgroundColor: SURFACE }} />;
}

function SparkBar({ data, max }: { data: TrendPoint[]; max: number }) {
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((pt, i) => {
        const pct = max > 0 ? (pt.count / max) * 100 : 0;
        const isLast = i === data.length - 1;
        return (
          <div key={i} className="flex-1 flex flex-col items-center" title={`${pt.label}: ${pt.count}`}>
            <div className="w-full rounded-sm transition-all" style={{ height: `${Math.max(pct, 4)}%`, backgroundColor: isLast ? ACCENT : "rgba(31,47,58,0.12)", minHeight: "2px" }} />
          </div>
        );
      })}
    </div>
  );
}

const sectionLabel = (text: string) => (
  <p className="text-xs uppercase tracking-widest mb-3" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>{text}</p>
);

export default function IntelligencePage() {
  const [data, setData] = useState<IntelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await fetch("/api/admin/intelligence").then((r) => r.json()).catch(() => null);
    setData(result);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleRecompute() {
    setRefreshing(true);
    const res = await fetch("/api/admin/rent-intelligence/refresh", { method: "POST" });
    if (res.ok) await load();
    setRefreshing(false);
  }

  const trendMax = data?.scrapeTrend ? Math.max(...data.scrapeTrend.map((t) => t.count), 1) : 1;

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-light" style={{ color: TEXT }}>Prospera Intelligence</h1>
            <p className="text-sm mt-1" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>Weekly market data, scraping results, and landlord activity</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={load} disabled={loading} className="text-xs px-4 py-2 rounded border transition-colors disabled:opacity-40" style={{ borderColor: BORDER, color: TEXT_SEC, backgroundColor: SURFACE_HI }}>
              ↺ Reload
            </button>
            <button onClick={handleRecompute} disabled={refreshing} className="text-xs px-4 py-2 rounded text-white transition-opacity hover:opacity-80 disabled:opacity-40" style={{ backgroundColor: ACCENT }}>
              {refreshing ? "Computing..." : "Recompute market data"}
            </button>
          </div>
        </div>

        {/* This Week */}
        <section className="mb-10">
          {sectionLabel("This Week")}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} />)}</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Landlord enquiries" value={data?.analysisThisWeek ?? 0} sub="Analysis requests" accent />
              <StatCard label="Scrape ingest" value={data?.scrapedThisWeek ?? 0} sub="New scraped listings" />
              <StatCard label="Landlord submissions" value={data?.landlordThisWeek ?? 0} sub="Direct" />
              <StatCard
                label="Last computed"
                value={data?.last_refresh ? new Date(data.last_refresh).toLocaleDateString("en-CA", { month: "short", day: "numeric" }) : "Never"}
                sub={data?.last_refresh ? new Date(data.last_refresh).toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" }) : "Run recompute"}
              />
            </div>
          )}
        </section>

        {/* Scrape trend */}
        <section className="mb-10">
          {sectionLabel("Scrape Volume — Past 8 Weeks")}
          <div className="rounded-xl border p-5" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
            {loading ? <Skeleton height="h-16" /> : data?.scrapeTrend && data.scrapeTrend.length > 0 ? (
              <>
                <SparkBar data={data.scrapeTrend} max={trendMax} />
                <div className="flex justify-between mt-2">
                  {data.scrapeTrend.map((pt, i) => (
                    <span key={i} className="text-xs" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>
                      {i === 0 || i === data.scrapeTrend.length - 1 ? pt.label : ""}
                    </span>
                  ))}
                </div>
                <p className="text-xs mt-3" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>
                  {data.scrapeTrend[data.scrapeTrend.length - 1]?.count ?? 0} this week · {data.scrapedTotal.toLocaleString()} all-time
                </p>
              </>
            ) : (
              <p className="text-sm text-center py-4" style={{ color: TEXT_MUT }}>No scrape data yet.</p>
            )}
          </div>
        </section>

        {/* All-time + city breakdown */}
        <section className="mb-10">
          {sectionLabel("All-Time Data")}
          {loading ? (
            <div className="grid grid-cols-3 gap-3">{[...Array(3)].map((_, i) => <Skeleton key={i} />)}</div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Total data points" value={(data?.totalSubmissions ?? 0).toLocaleString()} sub="Across all sources" />
              <StatCard label="Scraped" value={(data?.scrapedTotal ?? 0).toLocaleString()} sub="From web scraping" />
              <StatCard label="Landlord submitted" value={(data?.landlordTotal ?? 0).toLocaleString()} sub="Direct submissions" />
            </div>
          )}
        </section>

        {/* Per-city */}
        <section className="mb-10">
          {sectionLabel("Data by City")}
          {loading ? (
            <div className="grid grid-cols-3 gap-3">{[...Array(3)].map((_, i) => <Skeleton key={i} />)}</div>
          ) : data?.cities && Object.keys(data.cities).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(data.cities).map(([city, stats]) => (
                <div key={city} className="rounded-xl border p-5" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>{city}</p>
                  <p className="text-3xl font-light mb-3" style={{ color: TEXT, fontFamily: "var(--font-cormorant)" }}>{stats.total.toLocaleString()}</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs" style={{ fontFamily: "var(--font-dm-sans)" }}>
                      <span style={{ color: TEXT_MUT }}>This week</span>
                      <span style={{ color: TEXT_SEC }}>+{stats.week}</span>
                    </div>
                    <div className="flex justify-between text-xs" style={{ fontFamily: "var(--font-dm-sans)" }}>
                      <span style={{ color: TEXT_MUT }}>Scraped</span>
                      <span style={{ color: TEXT_SEC }}>{stats.scraped.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs" style={{ fontFamily: "var(--font-dm-sans)" }}>
                      <span style={{ color: TEXT_MUT }}>Landlord submitted</span>
                      <span style={{ color: ACCENT, fontWeight: 500 }}>{stats.landlord}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-center py-6" style={{ color: TEXT_MUT }}>No submissions yet.</p>
          )}
        </section>

        {/* Market benchmarks */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            {sectionLabel("Market Benchmarks")}
            {data?.last_refresh && (
              <p className="text-xs -mt-3" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>
                Computed {new Date(data.last_refresh).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            )}
          </div>
          {loading ? <Skeleton height="h-64" /> : data?.market_data && data.market_data.length > 0 ? (
            <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: NAV, borderBottom: `1px solid ${BORDER}` }}>
                    {["City", "Beds", "P25", "Median", "P75", "Samples", "Trend"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-widest font-normal" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.market_data.map((row, i) => (
                    <tr key={`${row.city}-${row.bedrooms}`} style={{ borderTop: i > 0 ? `1px solid ${BORDER}` : undefined }}>
                      <td className="px-4 py-3" style={{ color: TEXT, fontFamily: "var(--font-dm-sans)" }}>{row.city}</td>
                      <td className="px-4 py-3" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>{row.bedrooms}bd</td>
                      <td className="px-4 py-3" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>{row.p25_rent ? `$${Math.round(row.p25_rent).toLocaleString()}` : "—"}</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: TEXT, fontFamily: "var(--font-dm-sans)" }}>{row.median_rent ? `$${Math.round(row.median_rent).toLocaleString()}` : "—"}</td>
                      <td className="px-4 py-3" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>{row.p75_rent ? `$${Math.round(row.p75_rent).toLocaleString()}` : "—"}</td>
                      <td className="px-4 py-3" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>{row.submission_count}</td>
                      <td className="px-4 py-3 font-medium" style={{ color: row.trend_direction === "up" ? "#4ade80" : row.trend_direction === "down" ? "#f87171" : TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>
                        {row.trend_direction === "up" ? "↑ Rising" : row.trend_direction === "down" ? "↓ Falling" : row.trend_direction === "flat" ? "→ Flat" : "Baseline"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border p-10 text-center" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
              <p className="text-sm mb-4" style={{ color: TEXT_SEC }}>No market benchmarks computed yet.</p>
              <button onClick={handleRecompute} disabled={refreshing} className="text-xs px-4 py-2 rounded text-white transition-opacity hover:opacity-80 disabled:opacity-40" style={{ backgroundColor: ACCENT }}>
                {refreshing ? "Computing..." : "Compute now"}
              </button>
            </div>
          )}
        </section>

        {/* Recent landlord enquiries */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-3">
            {sectionLabel("Recent Landlord Enquiries")}
            <div className="flex gap-4 text-xs -mt-3" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>
              <span>{data?.analysisThisWeek ?? 0} this week</span>
              <span>{data?.analysisTotal ?? 0} total</span>
              <span>{data?.analysisUsed ?? 0} opened</span>
            </div>
          </div>
          {loading ? <Skeleton height="h-40" /> : data?.recentAnalysisRequests && data.recentAnalysisRequests.length > 0 ? (
            <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
              {data.recentAnalysisRequests.map((req, i) => (
                <div key={i} className="px-5 py-3 flex items-center justify-between" style={{ borderTop: i > 0 ? `1px solid ${BORDER}` : undefined }}>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: req.used ? "#4ade80" : "rgba(31,47,58,0.15)" }} />
                    <p className="text-sm" style={{ color: TEXT, fontFamily: "var(--font-dm-sans)" }}>{req.city} · {req.bedrooms}bd</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs" style={{ fontFamily: "var(--font-dm-sans)" }}>
                    <span className="px-2 py-0.5 rounded" style={{ backgroundColor: req.used ? "rgba(74,222,128,0.12)" : SURFACE_HI, color: req.used ? "#4ade80" : TEXT_MUT }}>
                      {req.used ? "Opened" : "Sent"}
                    </span>
                    <span style={{ color: TEXT_MUT }}>{new Date(req.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border p-6 text-center" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
              <p className="text-sm" style={{ color: TEXT_MUT }}>
                No analysis requests yet. Share the{" "}
                <Link href="/rent-analysis" target="_blank" className="underline" style={{ color: ACCENT }}>rent analysis page</Link>{" "}
                with landlords.
              </p>
            </div>
          )}
        </section>

        {/* Data health */}
        <section>
          {sectionLabel("Data Health")}
          {loading ? (
            <div className="grid grid-cols-2 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} />)}</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Scraped coverage" value={data?.totalSubmissions ? `${Math.round(((data.scrapedTotal ?? 0) / data.totalSubmissions) * 100)}%` : "—"} sub="Of all data points" />
              <StatCard label="Landlord share" value={data?.totalSubmissions ? `${Math.round(((data.landlordTotal ?? 0) / data.totalSubmissions) * 100)}%` : "—"} sub="First-party data" accent={data?.totalSubmissions ? (data.landlordTotal ?? 0) / data.totalSubmissions > 0.1 : false} />
              <StatCard label="Market segments" value={data?.market_data?.length ?? 0} sub="City × bedroom combos" />
              <StatCard label="Enquiry conversion" value={data?.analysisTotal ? `${Math.round(((data.analysisUsed ?? 0) / data.analysisTotal) * 100)}%` : "—"} sub="Opened their report" />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
