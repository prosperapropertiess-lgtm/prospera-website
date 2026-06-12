"use client";
import { useState, useEffect, useCallback } from "react";
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

interface ZohoStats { totalContacts: number; closedWon: number; inPipeline: number; }
interface MetaStats { connected: boolean; spend: number; impressions: number; reach: number; }
interface OutreachEntry { id: string; contact_name: string; method: string; notes: string | null; created_at: string; }
interface MarketRow { city: string; bedrooms: number; median_rent: number | null; p25_rent: number | null; p75_rent: number | null; submission_count: number; computed_at: string; trend_direction: string | null; }
interface CityStats { total: number; week: number; manual: number; landlord: number; }
interface IntelStats { cities: Record<string, CityStats>; market_data: MarketRow[]; last_refresh: string | null; }

const METHODS = ["text", "call", "email", "in-person"];

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}>
      <p className="text-xs uppercase tracking-widest mb-1" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>{label}</p>
      <p className="text-3xl font-light" style={{ color: accent ? ACCENT : TEXT, fontFamily: "var(--font-cormorant)" }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>{sub}</p>}
    </div>
  );
}

function Skeleton() {
  return <div className="animate-pulse rounded-xl h-24" style={{ backgroundColor: SURFACE }} />;
}

export default function DashboardPage() {
  const router = useRouter();
  const [zoho, setZoho] = useState<ZohoStats | null>(null);
  const [meta, setMeta] = useState<MetaStats | null>(null);
  const [outreach, setOutreach] = useState<OutreachEntry[]>([]);
  const [intel, setIntel] = useState<IntelStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ contact_name: "", method: "text", notes: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [z, m, o, i] = await Promise.all([
      fetch("/api/admin/dashboard/zoho").then((r) => r.json()).catch(() => null),
      fetch("/api/admin/dashboard/meta").then((r) => r.json()).catch(() => null),
      fetch("/api/admin/dashboard/outreach").then((r) => r.json()).catch(() => []),
      fetch("/api/admin/rent-intelligence/stats").then((r) => r.json()).catch(() => null),
    ]);
    setZoho(z); setMeta(m); setOutreach(Array.isArray(o) ? o : []); setIntel(i);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  async function logOutreach() {
    if (!form.contact_name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/admin/dashboard/outreach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const entry = await res.json();
      setOutreach((prev) => [entry, ...prev]);
      setForm({ contact_name: "", method: "text", notes: "" });
      setModal(false);
    }
    setSaving(false);
  }

  async function handleRefreshIntel() {
    setRefreshing(true);
    const res = await fetch("/api/admin/rent-intelligence/refresh", { method: "POST" });
    if (res.ok) {
      const updated = await fetch("/api/admin/rent-intelligence/stats").then((r) => r.json()).catch(() => null);
      setIntel(updated);
    }
    setRefreshing(false);
  }

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const outreachThisWeek = outreach.filter((o) => new Date(o.created_at) > weekAgo).length;
  const conversionRate = zoho && zoho.totalContacts > 0 ? Math.round((zoho.closedWon / zoho.totalContacts) * 100) : 0;

  const sectionLabel = (text: string) => (
    <p className="text-xs uppercase tracking-widest mb-3" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>{text}</p>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>
      <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: NAV, borderBottom: `1px solid ${BORDER}` }}>
        <div className="flex items-center gap-5">
          <span className="font-[family-name:var(--font-cormorant)] text-2xl font-light" style={{ color: TEXT }}>Prospera</span>
          <Link href="/admin" className="text-xs" style={{ color: TEXT_SEC }}>← Home</Link>
          <Link href="/admin/intelligence" className="text-xs" style={{ color: TEXT_SEC }}>Intelligence</Link>
          <Link href="/" target="_blank" className="text-xs" style={{ color: TEXT_SEC }}>↗ View site</Link>
        </div>
        <button onClick={handleLogout} className="text-xs" style={{ color: TEXT_SEC }}>Sign out</button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-light mb-10" style={{ color: TEXT }}>Outreach & CRM</h1>

        {/* Pipeline */}
        <div className="mb-10">
          {sectionLabel("Pipeline — Zoho CRM")}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {loading ? [...Array(4)].map((_, i) => <Skeleton key={i} />) : (
              <>
                <StatCard label="Contacts" value={zoho?.totalContacts ?? 0} sub="People you know" />
                <StatCard label="Clients" value={zoho?.closedWon ?? 0} sub="Closed Won" accent />
                <StatCard label="Conversion" value={`${conversionRate}%`} sub="Contacts → clients" />
                <StatCard label="In Pipeline" value={zoho?.inPipeline ?? 0} sub="Active deals" />
              </>
            )}
          </div>
        </div>

        {/* Outreach */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            {sectionLabel("Outreach")}
            <button
              onClick={() => setModal(true)}
              className="text-xs text-white px-4 py-2 rounded transition-opacity hover:opacity-80 -mt-3"
              style={{ backgroundColor: ACCENT }}
            >
              + Log Outreach
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <StatCard label="This Week" value={outreachThisWeek} sub="Outreaches logged" />
            <StatCard label="Total" value={outreach.length} sub="All time" />
          </div>
          {outreach.length > 0 && (
            <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
              {outreach.slice(0, 5).map((entry, i) => (
                <div key={entry.id} className="px-5 py-3 flex items-center justify-between" style={{ borderTop: i > 0 ? `1px solid ${BORDER}` : undefined }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: TEXT }}>{entry.contact_name}</p>
                    {entry.notes && <p className="text-xs mt-0.5" style={{ color: TEXT_SEC }}>{entry.notes}</p>}
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: SURFACE_HI, color: TEXT_SEC }}>{entry.method}</span>
                    <p className="text-xs mt-1" style={{ color: TEXT_MUT }}>{new Date(entry.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {outreach.length === 0 && !loading && (
            <p className="text-sm text-center py-6" style={{ color: TEXT_MUT }}>No outreaches logged yet.</p>
          )}
        </div>

        {/* Meta Ads */}
        <div className="mb-10">
          {sectionLabel(`Meta Ads — Today${meta && !meta.connected ? " · Not connected" : ""}`)}
          <div className="grid grid-cols-3 gap-3">
            {loading ? [...Array(3)].map((_, i) => <Skeleton key={i} />) : (
              <>
                <StatCard label="Spend" value={meta?.connected ? `$${meta.spend.toFixed(2)}` : "—"} sub="Today (CAD)" />
                <StatCard label="Impressions" value={meta?.connected ? meta.impressions.toLocaleString() : "—"} sub="Today" />
                <StatCard label="Reach" value={meta?.connected ? meta.reach.toLocaleString() : "—"} sub="Unique people" />
              </>
            )}
          </div>
        </div>

        {/* Rent Intelligence */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <div>
              {sectionLabel("Rent Intelligence")}
              {intel?.last_refresh && (
                <p className="text-xs -mt-2 mb-3" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>
                  Last computed: {new Date(intel.last_refresh).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              )}
            </div>
            <button
              onClick={handleRefreshIntel}
              disabled={refreshing}
              className="text-xs px-4 py-2 rounded border transition-colors disabled:opacity-40 -mt-3"
              style={{ borderColor: BORDER, color: TEXT_SEC, backgroundColor: SURFACE_HI, fontFamily: "var(--font-dm-sans)" }}
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-3 gap-3 mb-3">{[...Array(3)].map((_, i) => <Skeleton key={i} />)}</div>
          ) : intel?.cities ? (
            <div className="grid grid-cols-3 gap-3 mb-3">
              {Object.entries(intel.cities).map(([city, stats]) => (
                <div key={city} className="rounded-xl border p-5" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>{city}</p>
                  <p className="text-3xl font-light mb-1" style={{ color: TEXT, fontFamily: "var(--font-cormorant)" }}>{stats.total}</p>
                  <p className="text-xs" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>
                    +{stats.week} this week · {stats.landlord} from landlords
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {intel?.market_data && intel.market_data.length > 0 ? (
            <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: NAV, borderBottom: `1px solid ${BORDER}` }}>
                    {["City", "Beds", "P25", "Median", "P75", "Count", "Trend"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-widest font-normal" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {intel.market_data.map((row, i) => (
                    <tr key={`${row.city}-${row.bedrooms}`} style={{ borderTop: i > 0 ? `1px solid ${BORDER}` : undefined }}>
                      <td className="px-4 py-3" style={{ color: TEXT, fontFamily: "var(--font-dm-sans)" }}>{row.city}</td>
                      <td className="px-4 py-3" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>{row.bedrooms}bd</td>
                      <td className="px-4 py-3" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>{row.p25_rent ? `$${row.p25_rent.toLocaleString()}` : "—"}</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: TEXT, fontFamily: "var(--font-dm-sans)" }}>{row.median_rent ? `$${row.median_rent.toLocaleString()}` : "—"}</td>
                      <td className="px-4 py-3" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>{row.p75_rent ? `$${row.p75_rent.toLocaleString()}` : "—"}</td>
                      <td className="px-4 py-3" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>{row.submission_count}</td>
                      <td className="px-4 py-3 font-medium" style={{ color: row.trend_direction === "up" ? "#4ade80" : row.trend_direction === "down" ? "#f87171" : TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>
                        {row.trend_direction === "up" ? "↑ Rising" : row.trend_direction === "down" ? "↓ Falling" : row.trend_direction === "flat" ? "→ Flat" : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : !loading ? (
            <p className="text-sm text-center py-6" style={{ color: TEXT_MUT }}>No market data yet — run a scrape to populate.</p>
          ) : null}
        </div>

        {/* Leasing */}
        <div className="mb-10">
          {sectionLabel("Leasing")}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/applications" style={{ textDecoration: "none" }}>
              <div className="rounded-xl border p-5 hover:opacity-80 transition-opacity cursor-pointer" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>Applications</p>
                <p className="text-3xl font-light mb-1" style={{ color: TEXT, fontFamily: "var(--font-cormorant)" }}>Review</p>
                <p className="text-xs" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>View, approve, or reject tenant applications</p>
              </div>
            </Link>
            <Link href="/admin/agents" style={{ textDecoration: "none" }}>
              <div className="rounded-xl border p-5 hover:opacity-80 transition-opacity cursor-pointer" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>Agents</p>
                <p className="text-3xl font-light mb-1" style={{ color: TEXT, fontFamily: "var(--font-cormorant)" }}>Manage</p>
                <p className="text-xs" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>Add agents, activate or deactivate access</p>
              </div>
            </Link>
            <Link href="/admin/ops" style={{ textDecoration: "none" }}>
              <div className="rounded-xl border p-5 hover:opacity-80 transition-opacity cursor-pointer" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>Automations</p>
                <p className="text-3xl font-light mb-1" style={{ color: TEXT, fontFamily: "var(--font-cormorant)" }}>All Agents</p>
                <p className="text-xs" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>Live status, last runs, and manual triggers</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Weekly Snapshot */}
        <div>
          {sectionLabel("Weekly Snapshot")}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {loading ? [...Array(3)].map((_, i) => <Skeleton key={i} />) : (
              <>
                <StatCard label="Outreaches" value={outreachThisWeek} sub="Last 7 days" />
                <StatCard label="Ad Spend" value={meta?.connected ? `$${meta.spend.toFixed(2)}` : "—"} sub="This week" />
                <StatCard label="Pipeline" value={zoho?.inPipeline ?? 0} sub="Active deals" />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Log Outreach Modal */}
      {modal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
          <div className="rounded-xl p-6 w-full max-w-md shadow-2xl border" style={{ backgroundColor: SURFACE_HI, borderColor: BORDER }}>
            <h2 className="font-[family-name:var(--font-cormorant)] text-2xl mb-5" style={{ color: TEXT }}>Log Outreach</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: TEXT_MUT }}>Name *</label>
                <input
                  type="text"
                  value={form.contact_name}
                  onChange={(e) => setForm((f) => ({ ...f, contact_name: e.target.value }))}
                  placeholder="e.g. John Smith"
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                  style={{ border: `1px solid ${BORDER}`, backgroundColor: BG, color: TEXT }}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: TEXT_MUT }}>Method</label>
                <div className="flex gap-2 flex-wrap">
                  {METHODS.map((m) => (
                    <button
                      key={m}
                      onClick={() => setForm((f) => ({ ...f, method: m }))}
                      className="text-xs px-3 py-1.5 rounded border transition-all"
                      style={{
                        backgroundColor: form.method === m ? ACCENT : "transparent",
                        color: form.method === m ? "#fff" : TEXT_SEC,
                        borderColor: form.method === m ? ACCENT : BORDER,
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest mb-1.5" style={{ color: TEXT_MUT }}>Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="How did it go?"
                  rows={2}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none resize-none"
                  style={{ border: `1px solid ${BORDER}`, backgroundColor: BG, color: TEXT }}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModal(false)}
                className="flex-1 py-2.5 rounded-lg text-sm transition-colors"
                style={{ border: `1px solid ${BORDER}`, color: TEXT_SEC, backgroundColor: "transparent" }}
              >
                Cancel
              </button>
              <button
                onClick={logOutreach}
                disabled={saving || !form.contact_name.trim()}
                className="flex-1 text-white py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-30"
                style={{ backgroundColor: ACCENT }}
              >
                {saving ? "Saving..." : "Log it"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
