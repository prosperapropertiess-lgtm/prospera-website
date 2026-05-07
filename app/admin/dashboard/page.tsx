"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ZohoStats { totalContacts: number; closedWon: number; inPipeline: number; }
interface MetaStats { connected: boolean; spend: number; impressions: number; reach: number; }
interface OutreachEntry { id: string; contact_name: string; method: string; notes: string | null; created_at: string; }

const METHODS = ["text", "call", "email", "in-person"];

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className="bg-white border rounded-xl p-5" style={{ borderColor: "#D8D2C8" }}>
      <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>{label}</p>
      <p className="text-3xl font-light" style={{ color: accent ? "#6A2E35" : "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>{sub}</p>}
    </div>
  );
}

function Skeleton() {
  return <div className="animate-pulse rounded-xl h-24" style={{ backgroundColor: "#D8D2C8" }} />;
}

export default function DashboardPage() {
  const router = useRouter();
  const [zoho, setZoho] = useState<ZohoStats | null>(null);
  const [meta, setMeta] = useState<MetaStats | null>(null);
  const [outreach, setOutreach] = useState<OutreachEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ contact_name: "", method: "text", notes: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [z, m, o] = await Promise.all([
      fetch("/api/admin/dashboard/zoho").then((r) => r.json()).catch(() => null),
      fetch("/api/admin/dashboard/meta").then((r) => r.json()).catch(() => null),
      fetch("/api/admin/dashboard/outreach").then((r) => r.json()).catch(() => []),
    ]);
    setZoho(z);
    setMeta(m);
    setOutreach(Array.isArray(o) ? o : []);
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

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const outreachThisWeek = outreach.filter((o) => new Date(o.created_at) > weekAgo).length;
  const conversionRate = zoho && zoho.totalContacts > 0
    ? Math.round((zoho.closedWon / zoho.totalContacts) * 100)
    : 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F5F2" }}>
      {/* Top bar */}
      <div className="text-white px-6 py-4 flex items-center justify-between" style={{ backgroundColor: "#1F2F3A" }}>
        <div className="flex items-center gap-4">
          <span className="font-[family-name:var(--font-cormorant)] text-2xl font-light">Prospera</span>
          <Link href="/admin" className="text-xs text-white/50 hover:text-white/80 transition-colors">← Properties</Link>
          <Link href="/" target="_blank" className="text-xs text-white/50 hover:text-white/80 transition-colors">↗ View site</Link>
        </div>
        <button onClick={handleLogout} className="text-xs text-white/60 hover:text-white transition-colors">Sign out</button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-light mb-8" style={{ color: "#1F2F3A" }}>Business Dashboard</h1>

        {/* Pipeline */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>Pipeline — Zoho CRM</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {loading ? (
              <>{[...Array(4)].map((_, i) => <Skeleton key={i} />)}</>
            ) : (
              <>
                <StatCard label="Contacts" value={zoho?.totalContacts ?? 0} sub="People you know" />
                <StatCard label="Clients" value={zoho?.closedWon ?? 0} sub="Closed Won deals" accent />
                <StatCard label="Conversion" value={`${conversionRate}%`} sub="Contacts → clients" />
                <StatCard label="In Pipeline" value={zoho?.inPipeline ?? 0} sub="Active deals" />
              </>
            )}
          </div>
        </div>

        {/* Outreach */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-widest" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>Outreach</p>
            <button
              onClick={() => setModal(true)}
              className="text-xs text-white px-4 py-2 rounded transition-opacity hover:opacity-80"
              style={{ backgroundColor: "#6A2E35" }}
            >
              + Log Outreach
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatCard label="This Week" value={outreachThisWeek} sub="Outreaches logged" />
            <StatCard label="Total" value={outreach.length} sub="All time" />
          </div>
          {outreach.length > 0 && (
            <div className="bg-white border rounded-xl overflow-hidden" style={{ borderColor: "#D8D2C8" }}>
              {outreach.slice(0, 5).map((entry, i) => (
                <div key={entry.id} className={`px-5 py-3 flex items-center justify-between ${i !== 0 ? "border-t" : ""}`} style={{ borderColor: "#D8D2C8" }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#222222" }}>{entry.contact_name}</p>
                    {entry.notes && <p className="text-xs mt-0.5" style={{ color: "#999999" }}>{entry.notes}</p>}
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "#F7F5F2", color: "#666666" }}>{entry.method}</span>
                    <p className="text-xs mt-1" style={{ color: "#999999" }}>{new Date(entry.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {outreach.length === 0 && !loading && (
            <p className="text-sm text-center py-6" style={{ color: "#999999" }}>No outreaches logged yet.</p>
          )}
        </div>

        {/* Meta Ads */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
            Meta Ads — Today
            {meta && !meta.connected && (
              <span className="ml-2 text-amber-500/60 normal-case">· Not connected</span>
            )}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {loading ? (
              <>{[...Array(3)].map((_, i) => <Skeleton key={i} />)}</>
            ) : (
              <>
                <StatCard label="Spend" value={meta?.connected ? `$${meta.spend.toFixed(2)}` : "—"} sub="Today (CAD)" />
                <StatCard label="Impressions" value={meta?.connected ? meta.impressions.toLocaleString() : "—"} sub="Today" />
                <StatCard label="Reach" value={meta?.connected ? meta.reach.toLocaleString() : "—"} sub="Unique people" />
              </>
            )}
          </div>
        </div>

        {/* Weekly Snapshot */}
        <div>
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>Weekly Snapshot</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {loading ? (
              <>{[...Array(3)].map((_, i) => <Skeleton key={i} />)}</>
            ) : (
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border" style={{ borderColor: "#D8D2C8" }}>
            <h2 className="font-[family-name:var(--font-cormorant)] text-xl mb-4" style={{ color: "#1F2F3A" }}>Log Outreach</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest mb-1" style={{ color: "#666666" }}>Name *</label>
                <input
                  type="text"
                  value={form.contact_name}
                  onChange={(e) => setForm((f) => ({ ...f, contact_name: e.target.value }))}
                  placeholder="e.g. John Smith"
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ borderColor: "#D8D2C8", backgroundColor: "#F7F5F2", color: "#222222" }}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest mb-1" style={{ color: "#666666" }}>Method</label>
                <div className="flex gap-2 flex-wrap">
                  {METHODS.map((m) => (
                    <button
                      key={m}
                      onClick={() => setForm((f) => ({ ...f, method: m }))}
                      className="text-xs px-3 py-1.5 rounded border transition-colors"
                      style={{
                        backgroundColor: form.method === m ? "#1F2F3A" : "transparent",
                        color: form.method === m ? "#FAF8F5" : "#666666",
                        borderColor: form.method === m ? "#1F2F3A" : "#D8D2C8",
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest mb-1" style={{ color: "#666666" }}>Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="How did it go?"
                  rows={2}
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none resize-none"
                  style={{ borderColor: "#D8D2C8", backgroundColor: "#F7F5F2", color: "#222222" }}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setModal(false)}
                className="flex-1 border py-2 rounded-lg text-sm transition-colors hover:bg-[#F7F5F2]"
                style={{ borderColor: "#D8D2C8", color: "#666666" }}
              >
                Cancel
              </button>
              <button
                onClick={logOutreach}
                disabled={saving || !form.contact_name.trim()}
                className="flex-1 text-white py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-30"
                style={{ backgroundColor: "#6A2E35" }}
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
