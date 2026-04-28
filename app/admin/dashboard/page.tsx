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
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-3xl font-light ${accent ? "text-[#7B1C1C]" : "text-black"}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function Skeleton() {
  return <div className="bg-gray-100 animate-pulse rounded-xl h-24" />;
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
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Top bar */}
      <div className="bg-[#0A1628] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-[family-name:var(--font-cormorant)] text-2xl font-light">Prospera</span>
          <Link href="/admin" className="text-xs text-white/50 hover:text-white/80 transition-colors">← Properties</Link>
          <Link href="/" target="_blank" className="text-xs text-white/50 hover:text-white/80 transition-colors">↗ View site</Link>
        </div>
        <button onClick={handleLogout} className="text-xs text-white/60 hover:text-white transition-colors">Sign out</button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-light text-black mb-8">Business Dashboard</h1>

        {/* Pipeline */}
        <div className="mb-8">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Pipeline — Zoho CRM</p>
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
            <p className="text-xs text-gray-400 uppercase tracking-widest">Outreach</p>
            <button
              onClick={() => setModal(true)}
              className="text-xs bg-[#0A1628] text-white px-4 py-2 rounded hover:bg-[#7B1C1C] transition-colors"
            >
              + Log Outreach
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <StatCard label="This Week" value={outreachThisWeek} sub="Outreaches logged" />
            <StatCard label="Total" value={outreach.length} sub="All time" />
          </div>
          {outreach.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              {outreach.slice(0, 5).map((entry, i) => (
                <div key={entry.id} className={`px-5 py-3 flex items-center justify-between ${i !== 0 ? "border-t border-gray-50" : ""}`}>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{entry.contact_name}</p>
                    {entry.notes && <p className="text-xs text-gray-400 mt-0.5">{entry.notes}</p>}
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{entry.method}</span>
                    <p className="text-xs text-gray-300 mt-1">{new Date(entry.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {outreach.length === 0 && !loading && (
            <p className="text-sm text-gray-400 text-center py-6">No outreaches logged yet.</p>
          )}
        </div>

        {/* Meta Ads */}
        <div className="mb-8">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">
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
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Weekly Snapshot</p>
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="font-[family-name:var(--font-cormorant)] text-xl text-white mb-4">Log Outreach</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Name *</label>
                <input
                  type="text"
                  value={form.contact_name}
                  onChange={(e) => setForm((f) => ({ ...f, contact_name: e.target.value }))}
                  placeholder="e.g. John Smith"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:border-[#0A1628]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Method</label>
                <div className="flex gap-2 flex-wrap">
                  {METHODS.map((m) => (
                    <button
                      key={m}
                      onClick={() => setForm((f) => ({ ...f, method: m }))}
                      className={`text-xs px-3 py-1.5 rounded border transition-colors ${form.method === m ? "bg-white text-[#0D1117] border-white" : "border-gray-200 text-gray-500 hover:border-gray-400"}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="How did it go?"
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:border-[#0A1628] resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setModal(false)}
                className="flex-1 border border-gray-200 text-gray-500 py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={logOutreach}
                disabled={saving || !form.contact_name.trim()}
                className="flex-1 bg-[#0A1628] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#7B1C1C] transition-colors disabled:opacity-30"
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
