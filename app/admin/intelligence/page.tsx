"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CityStats {
  total: number;
  week: number;
  scraped: number;
  landlord: number;
  manual: number;
}

interface MarketRow {
  city: string;
  bedrooms: number;
  median_rent: number | null;
  p25_rent: number | null;
  p75_rent: number | null;
  submission_count: number;
  computed_at: string;
  trend_direction: string | null;
}

interface AnalysisRequest {
  city: string;
  bedrooms: number;
  created_at: string;
  used: boolean;
}

interface TrendPoint {
  label: string;
  count: number;
}

interface IntelData {
  totalSubmissions: number;
  scrapedTotal: number;
  landlordTotal: number;
  scrapedThisWeek: number;
  landlordThisWeek: number;
  analysisTotal: number;
  analysisThisWeek: number;
  analysisUsed: number;
  recentAnalysisRequests: AnalysisRequest[];
  cities: Record<string, CityStats>;
  market_data: MarketRow[];
  last_refresh: string | null;
  scrapeTrend: TrendPoint[];
}

function StatCard({
  label,
  value,
  sub,
  accent,
  change,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
  change?: string;
}) {
  return (
    <div className="bg-white border rounded-xl p-5" style={{ borderColor: "#D8D2C8" }}>
      <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
        {label}
      </p>
      <p className="text-3xl font-light" style={{ color: accent ? "#8B2030" : "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
        {value}
      </p>
      {sub && (
        <p className="text-xs mt-1" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
          {sub}
        </p>
      )}
      {change && (
        <p className="text-xs mt-1 font-medium" style={{ color: "#16a34a", fontFamily: "var(--font-dm-sans)" }}>
          {change}
        </p>
      )}
    </div>
  );
}

function Skeleton({ height = "h-24" }: { height?: string }) {
  return <div className={`animate-pulse rounded-xl ${height}`} style={{ backgroundColor: "#D8D2C8" }} />;
}

function SparkBar({ data, max }: { data: TrendPoint[]; max: number }) {
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((pt, i) => {
        const pct = max > 0 ? (pt.count / max) * 100 : 0;
        const isLast = i === data.length - 1;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${pt.label}: ${pt.count}`}>
            <div
              className="w-full rounded-sm transition-all"
              style={{
                height: `${Math.max(pct, 4)}%`,
                backgroundColor: isLast ? "#8B2030" : "#D8D2C8",
                minHeight: "2px",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

export default function IntelligencePage() {
  const router = useRouter();
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

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  async function handleRecompute() {
    setRefreshing(true);
    const res = await fetch("/api/admin/rent-intelligence/refresh", { method: "POST" });
    if (res.ok) {
      await load();
    }
    setRefreshing(false);
  }

  const trendMax = data?.scrapeTrend ? Math.max(...data.scrapeTrend.map((t) => t.count), 1) : 1;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F5F2" }}>
      {/* Top bar */}
      <div className="text-white px-6 py-4 flex items-center justify-between" style={{ backgroundColor: "#1F2F3A" }}>
        <div className="flex items-center gap-4">
          <span className="font-[family-name:var(--font-cormorant)] text-2xl font-light">Prospera</span>
          <Link href="/admin/dashboard" className="text-xs text-white/50 hover:text-white/80 transition-colors">
            ← Dashboard
          </Link>
          <Link href="/admin" className="text-xs text-white/50 hover:text-white/80 transition-colors">
            Properties
          </Link>
          <Link href="/" target="_blank" className="text-xs text-white/50 hover:text-white/80 transition-colors">
            ↗ View site
          </Link>
        </div>
        <button onClick={handleLogout} className="text-xs text-white/60 hover:text-white transition-colors">
          Sign out
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1
              className="font-[family-name:var(--font-cormorant)] text-4xl font-light"
              style={{ color: "#1F2F3A" }}
            >
              Prospera Intelligence
            </h1>
            <p className="text-sm mt-1" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
              Weekly market data, scraping results, and landlord activity
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={load}
              disabled={loading}
              className="text-xs px-4 py-2 rounded border transition-colors disabled:opacity-40"
              style={{ borderColor: "#D8D2C8", color: "#444444", backgroundColor: "white", fontFamily: "var(--font-dm-sans)" }}
            >
              ↺ Reload
            </button>
            <button
              onClick={handleRecompute}
              disabled={refreshing}
              className="text-xs px-4 py-2 rounded text-white transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ backgroundColor: "#8B2030", fontFamily: "var(--font-dm-sans)" }}
            >
              {refreshing ? "Computing..." : "Recompute market data"}
            </button>
          </div>
        </div>

        {/* This Week */}
        <section className="mb-8">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
            This Week
          </p>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                label="Landlord enquiries"
                value={data?.analysisThisWeek ?? 0}
                sub="Analysis requests this week"
                accent
              />
              <StatCard
                label="Scrape ingest"
                value={data?.scrapedThisWeek ?? 0}
                sub="New scraped listings"
              />
              <StatCard
                label="Landlord submissions"
                value={data?.landlordThisWeek ?? 0}
                sub="From landlords directly"
              />
              <StatCard
                label="Last computed"
                value={
                  data?.last_refresh
                    ? new Date(data.last_refresh).toLocaleDateString("en-CA", { month: "short", day: "numeric" })
                    : "Never"
                }
                sub={
                  data?.last_refresh
                    ? new Date(data.last_refresh).toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" })
                    : "Run recompute"
                }
              />
            </div>
          )}
        </section>

        {/* Scrape trend */}
        <section className="mb-8">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
            Scrape Volume — Past 8 Weeks
          </p>
          <div className="bg-white border rounded-xl p-5" style={{ borderColor: "#D8D2C8" }}>
            {loading ? (
              <Skeleton height="h-16" />
            ) : data?.scrapeTrend && data.scrapeTrend.length > 0 ? (
              <>
                <SparkBar data={data.scrapeTrend} max={trendMax} />
                <div className="flex justify-between mt-2">
                  {data.scrapeTrend.map((pt, i) => (
                    <span key={i} className="text-xs" style={{ color: "#BBBBBB", fontFamily: "var(--font-dm-sans)" }}>
                      {i === 0 || i === data.scrapeTrend.length - 1 ? pt.label : ""}
                    </span>
                  ))}
                </div>
                <p className="text-xs mt-3" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
                  {data.scrapeTrend[data.scrapeTrend.length - 1]?.count ?? 0} listings added this week ·{" "}
                  {data.scrapedTotal.toLocaleString()} total scraped all-time
                </p>
              </>
            ) : (
              <p className="text-sm text-center py-4" style={{ color: "#999999" }}>No scrape data yet.</p>
            )}
          </div>
        </section>

        {/* Data totals */}
        <section className="mb-8">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
            All-Time Data
          </p>
          {loading ? (
            <div className="grid grid-cols-3 gap-3">{[...Array(3)].map((_, i) => <Skeleton key={i} />)}</div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Total rent data points" value={(data?.totalSubmissions ?? 0).toLocaleString()} sub="Across all sources" />
              <StatCard label="Scraped" value={(data?.scrapedTotal ?? 0).toLocaleString()} sub="From web scraping" />
              <StatCard label="Landlord submitted" value={(data?.landlordTotal ?? 0).toLocaleString()} sub="Direct submissions" />
            </div>
          )}
        </section>

        {/* Per-city breakdown */}
        <section className="mb-8">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
            Data by City
          </p>
          {loading ? (
            <div className="grid grid-cols-3 gap-3">{[...Array(3)].map((_, i) => <Skeleton key={i} />)}</div>
          ) : data?.cities && Object.keys(data.cities).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(data.cities).map(([city, stats]) => (
                <div key={city} className="bg-white border rounded-xl p-5" style={{ borderColor: "#D8D2C8" }}>
                  <p
                    className="text-xs uppercase tracking-widest mb-2"
                    style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
                  >
                    {city}
                  </p>
                  <p className="text-3xl font-light mb-2" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
                    {stats.total.toLocaleString()}
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs" style={{ fontFamily: "var(--font-dm-sans)" }}>
                      <span style={{ color: "#999999" }}>This week</span>
                      <span style={{ color: "#444444" }}>+{stats.week}</span>
                    </div>
                    <div className="flex justify-between text-xs" style={{ fontFamily: "var(--font-dm-sans)" }}>
                      <span style={{ color: "#999999" }}>Scraped</span>
                      <span style={{ color: "#444444" }}>{stats.scraped.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs" style={{ fontFamily: "var(--font-dm-sans)" }}>
                      <span style={{ color: "#999999" }}>Landlord submitted</span>
                      <span style={{ color: "#8B2030", fontWeight: 500 }}>{stats.landlord}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-center py-6" style={{ color: "#999999" }}>No submissions yet.</p>
          )}
        </section>

        {/* Market data table */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-widest" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
              Market Benchmarks
            </p>
            {data?.last_refresh && (
              <p className="text-xs" style={{ color: "#BBBBBB", fontFamily: "var(--font-dm-sans)" }}>
                Computed {new Date(data.last_refresh).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            )}
          </div>
          {loading ? (
            <Skeleton height="h-48" />
          ) : data?.market_data && data.market_data.length > 0 ? (
            <div className="bg-white border rounded-xl overflow-hidden" style={{ borderColor: "#D8D2C8" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "#1F2F3A" }}>
                    {["City", "Beds", "P25", "Median", "P75", "Samples", "Trend"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs uppercase tracking-widest font-semibold"
                        style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.market_data.map((row, i) => (
                    <tr
                      key={`${row.city}-${row.bedrooms}`}
                      style={{ borderTop: i > 0 ? "1px solid #E8E4DF" : undefined }}
                    >
                      <td className="px-4 py-3" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
                        {row.city}
                      </td>
                      <td className="px-4 py-3" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
                        {row.bedrooms}bd
                      </td>
                      <td className="px-4 py-3" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
                        {row.p25_rent ? `$${row.p25_rent.toLocaleString()}` : "—"}
                      </td>
                      <td className="px-4 py-3 font-semibold" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
                        {row.median_rent ? `$${row.median_rent.toLocaleString()}` : "—"}
                      </td>
                      <td className="px-4 py-3" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
                        {row.p75_rent ? `$${row.p75_rent.toLocaleString()}` : "—"}
                      </td>
                      <td className="px-4 py-3" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
                        {row.submission_count}
                      </td>
                      <td
                        className="px-4 py-3 font-medium"
                        style={{
                          color:
                            row.trend_direction === "up"
                              ? "#16a34a"
                              : row.trend_direction === "down"
                              ? "#dc2626"
                              : "#999999",
                          fontFamily: "var(--font-dm-sans)",
                        }}
                      >
                        {row.trend_direction === "up"
                          ? "↑ Rising"
                          : row.trend_direction === "down"
                          ? "↓ Falling"
                          : row.trend_direction === "flat"
                          ? "→ Flat"
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white border rounded-xl p-8 text-center" style={{ borderColor: "#D8D2C8" }}>
              <p className="text-sm mb-3" style={{ color: "#999999" }}>
                No market benchmarks computed yet.
              </p>
              <button
                onClick={handleRecompute}
                disabled={refreshing}
                className="text-xs px-4 py-2 rounded text-white transition-opacity hover:opacity-80 disabled:opacity-40"
                style={{ backgroundColor: "#8B2030", fontFamily: "var(--font-dm-sans)" }}
              >
                {refreshing ? "Computing..." : "Compute now"}
              </button>
            </div>
          )}
        </section>

        {/* Recent analysis requests */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-widest" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
              Recent Landlord Enquiries
            </p>
            <div className="flex gap-4 text-xs" style={{ color: "#BBBBBB", fontFamily: "var(--font-dm-sans)" }}>
              <span>{data?.analysisThisWeek ?? 0} this week</span>
              <span>{data?.analysisTotal ?? 0} total</span>
              <span>{data?.analysisUsed ?? 0} opened</span>
            </div>
          </div>
          {loading ? (
            <Skeleton height="h-40" />
          ) : data?.recentAnalysisRequests && data.recentAnalysisRequests.length > 0 ? (
            <div className="bg-white border rounded-xl overflow-hidden" style={{ borderColor: "#D8D2C8" }}>
              {data.recentAnalysisRequests.map((req, i) => (
                <div
                  key={i}
                  className="px-5 py-3 flex items-center justify-between"
                  style={{ borderTop: i > 0 ? "1px solid #E8E4DF" : undefined }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: req.used ? "#16a34a" : "#D8D2C8" }}
                    />
                    <div>
                      <p className="text-sm" style={{ color: "#222222", fontFamily: "var(--font-dm-sans)" }}>
                        {req.city} · {req.bedrooms}bd
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
                    <span
                      className="px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: req.used ? "#f0fdf4" : "#F7F5F2",
                        color: req.used ? "#16a34a" : "#999999",
                      }}
                    >
                      {req.used ? "Opened" : "Sent"}
                    </span>
                    <span>{new Date(req.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border rounded-xl p-6 text-center" style={{ borderColor: "#D8D2C8" }}>
              <p className="text-sm" style={{ color: "#999999" }}>
                No analysis requests yet. Share the{" "}
                <Link href="/rent-analysis" target="_blank" className="underline" style={{ color: "#8B2030" }}>
                  rent analysis page
                </Link>{" "}
                with landlords.
              </p>
            </div>
          )}
        </section>

        {/* Data health */}
        <section>
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
            Data Health
          </p>
          {loading ? (
            <div className="grid grid-cols-2 gap-3">{[...Array(2)].map((_, i) => <Skeleton key={i} />)}</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                label="Scraped coverage"
                value={
                  data?.totalSubmissions
                    ? `${Math.round(((data.scrapedTotal ?? 0) / data.totalSubmissions) * 100)}%`
                    : "—"
                }
                sub="Of all data points"
              />
              <StatCard
                label="Landlord share"
                value={
                  data?.totalSubmissions
                    ? `${Math.round(((data.landlordTotal ?? 0) / data.totalSubmissions) * 100)}%`
                    : "—"
                }
                sub="First-party data"
                accent={
                  data?.totalSubmissions
                    ? (data.landlordTotal ?? 0) / data.totalSubmissions > 0.1
                    : false
                }
              />
              <StatCard
                label="Market segments"
                value={data?.market_data?.length ?? 0}
                sub="City × bedroom combos"
              />
              <StatCard
                label="Enquiry conversion"
                value={
                  data?.analysisTotal
                    ? `${Math.round(((data.analysisUsed ?? 0) / data.analysisTotal) * 100)}%`
                    : "—"
                }
                sub="Opened their report"
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
