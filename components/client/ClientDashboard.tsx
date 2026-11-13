"use client";
// The owner's placement dashboard. Most important first: where things stand,
// anything waiting on them, live numbers. Then tabs for the detail.
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import InstallGuide from "./InstallGuide";

const NAVY = "#1F2F3A", BURGUNDY = "#8B2030", BORDER = "#E6E1D9", MUTED = "#6B6B6B", GREEN = "#2F6B3F", BG = "#F7F5F2";
const STAGES = ["Onboarding", "Preparation", "Marketing", "Showings", "Applications", "Verification", "Lease & move-in", "Placed"];
const STATUS_LINE = [
  "We're setting up your placement.",
  "We're getting your home ready to list.",
  "Your home is live and we're finding renters.",
  "We're showing your home to renters.",
  "Applications are coming in.",
  "We're verifying the applicant you approved.",
  "Lease and move-in are underway.",
  "Your home is rented. Placement complete.",
];
const DECLINE_REASONS = ["Income doesn't cover the rent comfortably", "Rental history or references", "Move-in date doesn't work", "Number of people for the size of the home", "Lease terms requested don't work", "I'd like to see other applicants first", "Other"];
const METRICS: { key: string; label: string; what: string }[] = [
  { key: "listing_views", label: "Listing views", what: "Times your listing was opened on the sites we post to." },
  { key: "listing_clicks", label: "Listing clicks", what: "Clicks from the listing to contact us or request a viewing." },
  { key: "messages", label: "Messages", what: "Messages and calls about your home, on every channel." },
  { key: "unique_inquiries", label: "Unique inquiries", what: "Different people who asked. Someone who asked twice counts once." },
];
type Tab = "overview" | "activity" | "market" | "updates" | "applications" | "files";
const TABS: Tab[] = ["overview", "activity", "market", "updates", "applications", "files"];

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any;

const fDate = (d?: string | null) => (d ? new Date(d.length === 10 ? `${d}T12:00:00Z` : d).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric", timeZone: d.length === 10 ? "UTC" : "America/Toronto" }) : "");
const fShort = (d?: string | null) => (d ? new Date(`${d.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-CA", { month: "short", day: "numeric", timeZone: "UTC" }) : "");
const fWhen = (iso: string) => new Date(iso).toLocaleString("en-CA", { timeZone: "America/Toronto", weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).replace(/\./g, "");
const money = (n?: number | null) => (n == null ? "—" : `$${Math.round(Number(n)).toLocaleString("en-CA")}`);
const ago = (iso?: string | null) => {
  if (!iso) return "";
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 0) return "Upcoming";
  if (m < 60) return m <= 1 ? "just now" : `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return d < 14 ? `${d} days ago` : fDate(iso);
};
const daysSince = (iso?: string | null) => (iso ? Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 864e5)) : null);

// ── Icons (simple strokes, no emoji) ──────────────────────────────────
const ICONS: Record<string, string> = {
  people: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  key: "M21 2l-2 2m-7.6 7.6a5.5 5.5 0 11-7.78 7.78 5.5 5.5 0 017.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4",
  doc: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  calendar: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  check: "M20 6L9 17l-5-5",
  bell: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  chart: "M3 3v18h18M7 14l4-4 4 4 5-6",
  home: "M3 11l9-8 9 8M5 10v10h14V10",
  spark: "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83",
  help: "M12 22a10 10 0 100-20 10 10 0 000 20zM9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01",
  image: "M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zM8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM21 15l-5-5L5 21",
};
function Icon({ name, size = 18, color = "currentColor" }: { name: string; size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONS[name]} /></svg>;
}

export default function ClientDashboard({ token, placementId }: { token: string; placementId?: string }) {
  const router = useRouter();
  const [data, setData] = useState<Any>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [intro, setIntro] = useState(false);
  const [help, setHelp] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [preview, setPreview] = useState<boolean | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setPreview(new URLSearchParams(window.location.search).get("preview") === "1");
      const h = window.location.hash.replace("#", "") as Tab;
      if (TABS.includes(h)) setTab(h);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const load = useCallback(async () => {
    if (preview === null) return;
    const qs = new URLSearchParams();
    if (placementId) qs.set("placement", placementId);
    if (preview) qs.set("preview", "1");
    const res = await fetch(`/api/client/${token}?${qs}`, { cache: "no-store" });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setError(d.error ?? "Couldn't load your dashboard."); return; }
    setData(d);
    let seen = d.account.introSeen;
    try { seen = seen || localStorage.getItem("pp_intro_seen") === "1"; } catch {}
    if (!seen && !d.preview) setIntro(true);
  }, [token, placementId, preview]);
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, [load]);
  // Live: refresh every minute while the page is open, and whenever they come back to it.
  useEffect(() => {
    const iv = setInterval(() => { if (document.visibilityState === "visible") load(); }, 60_000);
    const onVis = () => { if (document.visibilityState === "visible") load(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { clearInterval(iv); document.removeEventListener("visibilitychange", onVis); };
  }, [load]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 5000); return () => clearTimeout(t); }, [toast]);

  async function act(body: Record<string, unknown>, ok?: string) {
    const res = await fetch(`/api/client/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, preview: data?.preview }) });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setToast(d.error ?? "That didn't go through. Try again."); return false; }
    if (ok) setToast(ok);
    await load();
    return true;
  }
  const closeIntro = useCallback(() => {
    setIntro(false);
    try { localStorage.setItem("pp_intro_seen", "1"); } catch {}
    if (!data?.preview) fetch(`/api/client/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "intro_seen" }) }).catch(() => {});
  }, [data?.preview, token]);
  const closeHelp = useCallback(() => setHelp(false), []);
  function go(t: Tab) {
    setTab(t);
    history.replaceState(null, "", `#${t}`);
    const el = document.getElementById("tabs");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 60, behavior: "smooth" });
  }

  if (error) return <Shell><Card><p className="font-semibold" style={{ color: NAVY }}>{error}</p><p className="text-sm mt-2" style={{ color: MUTED }}>Call or text Ebin at (519) 697-1227.</p></Card></Shell>;
  if (!data) return <Shell><div className="grid gap-4">{[220, 120, 110, 300].map((h) => <div key={h} className="rounded-3xl bg-white animate-pulse" style={{ height: h }} />)}</div></Shell>;
  if (!data.view) return <Shell><Card><p style={{ color: NAVY }}>Your property will appear here as soon as it&apos;s set up.</p></Card></Shell>;

  const v = data.view, p = v.placement, live = v.live;
  const pending = v.reviews.filter((r: Any) => ["released", "clarification"].includes(r.status));
  const approved = v.reviews.filter((r: Any) => r.status === "approved" || r.status === "completed");
  const listedDays = daysSince(live?.firstListed);

  return (
    <Shell
      top={
        <div className="flex items-center gap-2">
          {data.placements.length > 1 && (
            <select aria-label="Choose a property" value={p.id} onChange={(e) => router.push(`/client/${token}/${e.target.value}${data.preview ? "?preview=1" : ""}`)}
              className="rounded-full border px-3 py-1.5 text-sm max-w-[160px] bg-white" style={{ borderColor: BORDER, color: NAVY }}>
              {data.placements.map((x: Any) => <option key={x.id} value={x.id}>{x.address}</option>)}
            </select>
          )}
          <button type="button" onClick={() => setHelp(true)} aria-label="Help" className="w-9 h-9 rounded-full border flex items-center justify-center bg-white" style={{ borderColor: BORDER, color: NAVY }}><Icon name="help" /></button>
        </div>
      }>
      {data.preview && <Banner tone="navy">Admin preview. Exactly what {data.account.name} sees. Buttons are off.</Banner>}
      {p.is_demo && <Banner tone="amber">Demo dashboard. Sample client, not real data.</Banner>}

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative rounded-3xl overflow-hidden shadow-sm" style={{ background: NAVY }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {p.cover_url && <img src={p.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(15,22,30,0.1) 0%, rgba(15,22,30,0.5) 50%, rgba(15,22,30,0.92) 100%)" }} />
        <div className="relative px-5 pt-28 pb-5 sm:px-7 sm:pt-36" style={{ color: "#FAF8F5" }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "rgba(250,248,245,0.18)", backdropFilter: "blur(6px)" }}>{STAGES[v.stageIndex]}</span>
            {v.latestUpdate && <span className="text-xs" style={{ opacity: 0.8 }}>Updated {ago(v.latestUpdate)}</span>}
          </div>
          <h1 className="text-[28px] sm:text-[34px] font-bold leading-tight capitalize" style={{ fontFamily: "var(--font-cormorant)" }}>{p.address}</h1>
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-[15px]" style={{ opacity: 0.92 }}>
            <span><b>{p.asking_rent ? `${money(p.asking_rent)}/mo` : "Rent not set"}</b> asking</span>
            <span>Available <b>{p.target_date ? fShort(p.target_date) : "TBD"}</b></span>
          </div>
        </div>
      </section>

      {/* ── Where things stand ───────────────────────────── */}
      <Card>
        <p className="text-[19px] font-semibold leading-snug" style={{ color: NAVY }}>{STATUS_LINE[v.stageIndex]}</p>
        <Stepper index={v.stageIndex} />
        {p.next_action && (
          <div className="mt-4 flex gap-3 items-start rounded-2xl p-4" style={{ background: BG }}>
            <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: p.next_action_owner === "Owner" ? BURGUNDY : NAVY, color: "#fff" }}><Icon name={p.next_action_owner === "Owner" ? "bell" : "spark"} size={16} /></span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>Next step · {p.next_action_owner === "Owner" ? "you" : p.next_action_owner || "Prospera"}</div>
              <div className="text-[15px] font-semibold mt-0.5" style={{ color: NAVY }}>{p.next_action}</div>
              {p.next_action_due && <div className="text-sm" style={{ color: MUTED }}>by {fDate(p.next_action_due)}</div>}
            </div>
          </div>
        )}
      </Card>

      {/* ── Needs your decision ──────────────────────────── */}
      {pending.length > 0 && (
        <button type="button" onClick={() => go("applications")} className="w-full text-left rounded-3xl p-5 flex items-center gap-4 shadow-sm" style={{ background: BURGUNDY, color: "#FAF8F5" }}>
          <span className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}><Icon name="doc" size={20} /></span>
          <span className="flex-1">
            <span className="block text-[17px] font-semibold">{pending.length === 1 ? "An application needs your decision" : `${pending.length} applications need your decision`}</span>
            <span className="block text-sm" style={{ opacity: 0.85 }}>Review the summary and choose Approve to Proceed or Decline.</span>
          </span>
          <span className="text-xl" aria-hidden="true">→</span>
        </button>
      )}

      {/* ── Live numbers ─────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-[15px] font-semibold" style={{ color: NAVY }}>Interest in your home</h2>
          <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: GREEN }}><span className="w-2 h-2 rounded-full pp-live" style={{ background: GREEN }} />Live</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat icon="people" label="Prequalified inquiries" value={live?.counts ? live.counts.inquiries : null} sub={live?.counts ? `${live.counts.inquiriesWeek} this week` : "Starts when your listing is live"} />
          <Stat icon="key" label="Showings done" value={live?.counts ? live.counts.showingsDone : null} sub={live?.counts ? `${live.counts.showingsBooked} booked ahead` : "Showings appear here"} />
          <Stat icon="doc" label="Applications" value={live?.counts ? live.counts.applications : null} sub={pending.length ? `${pending.length} for your review` : "Screened before you see them"} />
          <Stat icon="calendar" label="Days listed" value={listedDays} sub={live?.firstListed ? `Since ${fShort(live.firstListed)}` : "Not listed yet"} />
        </div>
      </section>

      {/* ── Tabs ──────────────────────────────────────────── */}
      <nav id="tabs" className="sticky top-[57px] z-20 -mx-4 px-4 py-2" style={{ background: BG }}>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {([
            ["overview", "Overview"], ["activity", "Activity"], ["market", "Market"], ["updates", "Weekly updates"], ["applications", `Applications${pending.length ? ` (${pending.length})` : ""}`], ["files", "Photos & files"],
          ] as [Tab, string][]).map(([k, l]) => (
            <button key={k} type="button" onClick={() => go(k)} className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
              style={{ background: tab === k ? NAVY : "#fff", color: tab === k ? "#FAF8F5" : NAVY, border: `1px solid ${tab === k ? NAVY : BORDER}` }}>{l}</button>
          ))}
        </div>
      </nav>

      <div key={tab} className="grid gap-4 pp-in">
        {tab === "overview" && <Overview v={v} go={go} />}
        {tab === "activity" && <Activity items={live?.activity ?? []} />}
        {tab === "market" && <Market m={v.market} rent={p.asking_rent} metrics={v.metrics} />}
        {tab === "updates" && <Updates updates={v.updates} />}
        {tab === "applications" && (
          <>
            {v.reviews.length === 0
              ? <Empty icon="doc" title="Applications show up here for your approval" body="We screen every applicant first: income, documents and references. When one is ready, you'll get an email and see a short summary here with Approve to Proceed or Decline." />
              : v.reviews.map((r: Any) => <ReviewCard key={r.id} r={r} disabled={!!data.preview} act={act} />)}
            {approved.map((r: Any) => <NextSteps key={r.id} r={r} />)}
          </>
        )}
        {tab === "files" && <Files files={v.files} />}
      </div>

      <p className="text-center text-sm py-6" style={{ color: MUTED }}>Questions? Call or text Ebin at <a href="tel:5196971227" className="underline">(519) 697-1227</a></p>

      {toast && <div role="status" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-2xl px-5 py-3 text-sm font-semibold shadow-xl max-w-[90vw]" style={{ background: NAVY, color: "#FAF8F5" }}>{toast}</div>}
      {intro && <Tour onClose={closeIntro} />}
      {help && (
        <Dialog title="Help" onClose={closeHelp} footer={<button type="button" onClick={closeHelp} className="w-full rounded-2xl py-3.5 font-semibold" style={{ background: NAVY, color: "#FAF8F5" }}>Done</button>}>
          <button type="button" onClick={() => { setHelp(false); setIntro(true); }} className="w-full rounded-2xl border py-3 font-semibold mb-5" style={{ borderColor: BORDER, color: NAVY }}>Take the quick tour again</button>
          <h3 className="font-semibold text-[16px] mb-3" style={{ color: NAVY }}>Add it to your home screen</h3>
          <InstallGuide />
          <p className="text-sm mt-6 mb-2" style={{ color: MUTED }}>This link is private to you. If you lose it, ask Ebin for a new one.</p>
        </Dialog>
      )}
      <style>{`
        .pp-in{animation:ppIn .3s ease-out both}
        @keyframes ppIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        .pp-live{animation:ppLive 2s ease-in-out infinite}
        @keyframes ppLive{0%,100%{opacity:1}50%{opacity:.35}}
        .no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{scrollbar-width:none}
        @media (prefers-reduced-motion: reduce){.pp-in,.pp-live{animation:none}}
      `}</style>
    </Shell>
  );
}

// ── Layout pieces ──────────────────────────────────────────────────────

function Shell({ children, top }: { children: React.ReactNode; top?: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: BG, fontFamily: "var(--font-dm-sans)" }}>
      <header className="sticky top-0 z-30 border-b px-4 py-2.5 flex items-center justify-between gap-3" style={{ borderColor: BORDER, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(10px)" }}>
        <span className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/client-icon-192.png" alt="" className="w-8 h-8 rounded-lg" />
          <span className="leading-tight"><span className="block text-[15px] font-bold" style={{ color: NAVY }}>My Property</span><span className="block text-[11px]" style={{ color: MUTED }}>by Prospera Properties</span></span>
        </span>
        {top}
      </header>
      <main className="max-w-3xl mx-auto px-4 py-4 grid gap-4">{children}</main>
    </div>
  );
}
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-3xl bg-white p-5 shadow-sm ${className}`} style={{ border: `1px solid ${BORDER}` }}>{children}</section>;
}
function Title({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return <div className="mb-4"><h2 className="text-[18px] font-bold" style={{ color: NAVY }}>{children}</h2>{sub && <p className="text-sm mt-0.5" style={{ color: MUTED }}>{sub}</p>}</div>;
}
function Banner({ children, tone }: { children: React.ReactNode; tone: "navy" | "amber" }) {
  return <div className="rounded-2xl px-4 py-2.5 text-sm font-semibold" style={tone === "navy" ? { background: NAVY, color: "#FAF8F5" } : { background: "#FBF1DC", color: "#7A5200" }}>{children}</div>;
}
function Empty({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <Card className="text-center py-10">
      <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-3" style={{ background: BG, color: NAVY }}><Icon name={icon} size={24} /></div>
      <p className="text-[16px] font-semibold" style={{ color: NAVY }}>{title}</p>
      <p className="text-sm mt-1.5 max-w-sm mx-auto leading-relaxed" style={{ color: MUTED }}>{body}</p>
    </Card>
  );
}
function Stat({ icon, label, value, sub }: { icon: string; label: string; value: number | null; sub: string }) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm" style={{ border: `1px solid ${BORDER}` }}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ background: BG, color: NAVY }}><Icon name={icon} size={16} /></div>
      <div className="text-[28px] font-bold leading-none" style={{ color: value == null ? "#B5B0A8" : NAVY }}>{value ?? "—"}</div>
      <div className="text-[13px] font-semibold mt-1.5" style={{ color: NAVY }}>{label}</div>
      <div className="text-xs mt-0.5" style={{ color: MUTED }}>{sub}</div>
    </div>
  );
}
function Stepper({ index }: { index: number }) {
  return (
    <div className="mt-4">
      <div className="flex gap-1" aria-hidden="true">
        {STAGES.map((s, i) => <span key={s} className="h-2 flex-1 rounded-full" style={{ background: i < index ? GREEN : i === index ? BURGUNDY : "#ECE8E1" }} />)}
      </div>
      <div className="flex justify-between mt-2 text-xs gap-2" style={{ color: MUTED }}>
        <span>Stage {index + 1} of {STAGES.length}: <b style={{ color: NAVY }}>{STAGES[index]}</b></span>
        {index < STAGES.length - 1 && <span>Then: {STAGES[index + 1]}</span>}
      </div>
      <ol className="sr-only">{STAGES.map((s, i) => <li key={s}>{s}: {i < index ? "completed" : i === index ? "current" : "upcoming"}</li>)}</ol>
    </div>
  );
}
function Pill({ s }: { s: string }) {
  const m: Record<string, [string, string, string]> = {
    completed: ["Done", "#EAF3EC", GREEN], done: ["Done", "#EAF3EC", GREEN], in_progress: ["In progress", "#FBF1DC", "#7A5200"],
    not_started: ["Not started", "#F1EEE9", "#666"], pending: ["Not started", "#F1EEE9", "#666"], not_applicable: ["Not needed", "#F1EEE9", "#777"], blocked: ["On hold", "#F8EAEC", BURGUNDY],
  };
  const [label, bg, fg] = m[s] ?? [s, "#F1EEE9", "#555"];
  return <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shrink-0" style={{ background: bg, color: fg }}>{(s === "completed" || s === "done") && <Icon name="check" size={12} />}{label}</span>;
}

// ── Overview ───────────────────────────────────────────────────────────

function Overview({ v, go }: { v: Any; go: (t: Tab) => void }) {
  const live = v.live;
  const recentShowings = (live?.activity ?? []).filter((a: Any) => a.kind === "showing_done").slice(0, 3);
  const latest = v.updates[0];
  const done = v.prep.filter((x: Any) => x.status === "completed" || x.status === "not_applicable").length;
  return (
    <>
      <Card>
        <Title sub="Booked by our showing team. Toronto time.">Upcoming showings</Title>
        {live?.upcoming?.length ? (
          <div className="grid gap-2">
            {live.upcoming.map((u: Any) => (
              <div key={u.at} className="flex items-center gap-3 rounded-2xl p-3" style={{ background: BG }}>
                <span className="w-11 h-11 rounded-xl flex flex-col items-center justify-center bg-white shrink-0" style={{ color: NAVY, border: `1px solid ${BORDER}` }}>
                  <span className="text-[10px] font-semibold uppercase">{new Date(u.at).toLocaleDateString("en-CA", { month: "short", timeZone: "America/Toronto" }).replace(".", "")}</span>
                  <span className="text-[16px] font-bold leading-none">{new Date(u.at).toLocaleDateString("en-CA", { day: "numeric", timeZone: "America/Toronto" })}</span>
                </span>
                <span className="text-[15px]" style={{ color: NAVY }}><b>{fWhen(u.at)}</b><span className="block text-sm" style={{ color: MUTED }}>{u.count} {u.count === 1 ? "prospect" : "prospects"}</span></span>
              </div>
            ))}
          </div>
        ) : <p className="text-[15px]" style={{ color: MUTED }}>Showings appear here as soon as they&apos;re booked.</p>}
      </Card>

      <Card>
        <Title sub="From our showing specialist after each visit.">What renters are saying</Title>
        {recentShowings.length ? (
          <div className="grid gap-3.5">
            {recentShowings.map((a: Any, i: number) => <FeedItem key={i} a={a} />)}
            <button type="button" onClick={() => go("activity")} className="text-sm font-semibold underline text-left" style={{ color: NAVY }}>See all activity</button>
          </div>
        ) : <p className="text-[15px]" style={{ color: MUTED }}>After each showing, our specialist records how interested the prospect was, what they liked and any concerns. It shows up here right away.</p>}
      </Card>

      <Card>
        <Title sub={`${done} of ${v.prep.length} done`}>Getting your home ready</Title>
        <div className="grid gap-2">{v.prep.map((x: Any) => <PrepRow key={x.key} x={x} />)}</div>
      </Card>

      <Card>
        <Title>Latest weekly update</Title>
        {latest ? (
          <>
            <p className="text-sm mb-2" style={{ color: MUTED }}>Week of {fShort(latest.week_start)}–{fShort(latest.week_end)}</p>
            <p className="text-[15px] leading-relaxed line-clamp-4" style={{ color: "#222" }}>{latest.summary}</p>
            <button type="button" onClick={() => go("updates")} className="text-sm font-semibold underline mt-3" style={{ color: NAVY }}>Read the full update</button>
          </>
        ) : <p className="text-[15px]" style={{ color: MUTED }}>Every week we post what happened: showings, what prospects said, the market and what we recommend. The first one comes after your home&apos;s first full week on the market.</p>}
      </Card>
    </>
  );
}

function PrepRow({ x }: { x: Any }) {
  const [open, setOpen] = useState(false);
  const has = x.files.length || x.links.length || x.notes;
  return (
    <div className="rounded-2xl p-3.5" style={{ background: BG }}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[15px] font-semibold" style={{ color: NAVY }}>{x.label}</div>
          <div className="text-xs" style={{ color: MUTED }}>
            {x.key === "lawn_sign" ? `Installed: ${x.status === "completed" ? "Yes" : x.status === "not_applicable" ? "Not applicable" : "No"}` : x.completed_on ? `${x.key === "listing" ? "Published" : "Done"} ${fDate(x.completed_on)}` : ""}
            {has ? <>{(x.key === "lawn_sign" || x.completed_on) ? " · " : ""}<button type="button" onClick={() => setOpen(!open)} className="underline font-semibold" style={{ color: NAVY }}>{open ? "Hide" : x.key === "photos" ? "View photos" : x.key === "listing" ? "Open links" : "View"}</button></> : null}
          </div>
        </div>
        <Pill s={x.status} />
      </div>
      {open && (
        <div className="mt-3 grid gap-2">
          {x.notes && <p className="text-sm" style={{ color: "#333" }}>{x.notes}</p>}
          {x.links.map((l: Any) => <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="text-sm font-semibold underline break-all" style={{ color: NAVY }}>{l.label || l.url}</a>)}
          {x.key === "photos" ? <Gallery files={x.files} /> : x.files.map((f: Any) => <FileRow key={f.id} f={f} />)}
        </div>
      )}
    </div>
  );
}

// ── Activity ───────────────────────────────────────────────────────────

const KIND_ICON: Record<string, string> = { inquiry: "people", showing_booked: "calendar", showing_done: "key", application: "doc", listing: "home", prep: "check", update: "chart", decision: "check" };
function FeedItem({ a }: { a: Any }) {
  const tone = a.tone === "good" ? GREEN : a.tone === "warn" ? BURGUNDY : NAVY;
  return (
    <div className="flex gap-3">
      <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: BG, color: tone }}><Icon name={KIND_ICON[a.kind] ?? "spark"} size={16} /></span>
      <div className="min-w-0 pt-0.5">
        <div className="text-[15px] font-semibold" style={{ color: NAVY }}>{a.title}</div>
        {a.detail && <div className="text-sm leading-snug" style={{ color: "#444" }}>{a.detail}</div>}
        <div className="text-xs mt-0.5" style={{ color: MUTED }}>{ago(a.at)}</div>
      </div>
    </div>
  );
}
function Activity({ items }: { items: Any[] }) {
  if (!items.length) return <Empty icon="spark" title="Activity shows up here" body="New prequalified viewing requests, booked showings, our showing specialist's feedback and applications, as they happen. No waiting for the weekly update." />;
  const groups = new Map<string, Any[]>();
  for (const a of items) {
    const k = new Date(a.at).toLocaleDateString("en-CA", { timeZone: "America/Toronto", weekday: "long", month: "long", day: "numeric" });
    groups.set(k, [...(groups.get(k) ?? []), a]);
  }
  return (
    <Card>
      <Title sub="Live from our team and your listing.">Activity</Title>
      <div className="grid gap-5">
        {[...groups.entries()].map(([day, list]) => (
          <div key={day}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: MUTED }}>{day}</div>
            <div className="grid gap-3.5">{list.map((a, i) => <FeedItem key={i} a={a} />)}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── Market ─────────────────────────────────────────────────────────────

function Market({ m, rent, metrics }: { m: Any; rent: number | null; metrics: Any[] }) {
  const cur = metrics[0], prev = metrics[1];
  return (
    <>
      {!m ? (
        <Empty icon="chart" title="How your home compares shows up here" body="Once your home is linked to its listing, we compare the asking rent with similar homes for rent in London from our weekly market scan." />
      ) : !m.enough ? (
        <Card><Title>How your home compares</Title><p className="text-[15px]" style={{ color: MUTED }}>Our latest scan ({fDate(m.scanDate)}) found only {m.n} similar {m.beds === "0" ? "studios" : `${m.beds}-bedroom homes`}, too few for a fair comparison. It shows here once there are more.</p></Card>
      ) : <Compare m={m} rent={rent} />}

      <Card>
        <Title sub={cur ? `Week of ${fShort(cur.week_start)}–${fShort(cur.week_end)} · updated ${fDate(cur.updated_at)}` : "Added by our team every week"}>Listing performance</Title>
        {!cur ? <p className="text-[15px]" style={{ color: MUTED }}>Listing views, clicks and messages from the sites we post to are added here weekly. Anything a site doesn&apos;t report shows as “Not available”, never as zero.</p> : (
          <div className="grid grid-cols-2 gap-3">
            {METRICS.map((x) => {
              const val = cur[x.key], before = prev?.[x.key];
              const diff = val != null && before != null ? val - before : null;
              return (
                <div key={x.key} className="rounded-2xl p-3.5" style={{ background: BG }}>
                  <div className="text-xs font-semibold" style={{ color: MUTED }}>{x.label}</div>
                  <div className="font-bold mt-1" style={{ color: val == null ? MUTED : NAVY, fontSize: val == null ? 14 : 24 }}>{val ?? "Not available"}</div>
                  {diff != null && <div className="text-xs font-semibold" style={{ color: diff > 0 ? GREEN : diff < 0 ? BURGUNDY : MUTED }}>{diff > 0 ? `▲ ${diff}` : diff < 0 ? `▼ ${-diff}` : "Same"} vs last week</div>}
                  <div className="text-[11px] mt-1 leading-snug" style={{ color: MUTED }}>{x.what}</div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
}

function Compare({ m, rent }: { m: Any; rent: number | null }) {
  const lo = m.min, hi = m.max, span = Math.max(1, hi - lo);
  const pos = (x: number) => `${Math.min(100, Math.max(0, ((x - lo) / span) * 100))}%`;
  const bins = useMemo(() => {
    const n = 18, out = Array(n).fill(0);
    for (const x of m.prices as number[]) out[Math.min(n - 1, Math.floor(((x - lo) / span) * n))]++;
    return out as number[];
  }, [m.prices, lo, span]);
  const maxBin = Math.max(...bins, 1);
  const pct = m.percentile != null ? Math.round(m.percentile) : null;
  const vsMedian = rent && m.median ? Math.round(rent - m.median) : null;
  const label = m.beds === "0" ? "studios" : `${m.beds}-bedroom homes`;
  return (
    <Card>
      <Title sub={`${m.n} ${label} for rent across London in our scan of ${fDate(m.scanDate)}`}>How your home compares</Title>
      {rent && pct != null && vsMedian != null && (
        <p className="text-[17px] leading-snug mb-5" style={{ color: NAVY }}>
          Your asking rent of <b>{money(rent)}</b> is {vsMedian === 0 ? "right at" : <><b>{money(Math.abs(vsMedian))} {vsMedian > 0 ? "above" : "below"}</b></>} the typical {label.replace(" homes", " home")} ({money(m.median)}). It&apos;s higher than about <b>{pct}%</b> of them.
        </p>
      )}
      <div className="relative h-32 mt-6" aria-hidden="true">
        <div className="absolute inset-x-0 bottom-6 top-6 flex items-end gap-[3px]">
          {bins.map((b, i) => <div key={i} className="flex-1 rounded-t" style={{ height: `${(b / maxBin) * 100}%`, background: "#DCD6CC", minHeight: b ? 3 : 0 }} />)}
        </div>
        {m.median != null && <Marker left={pos(m.median)} color={NAVY} label={`Typical ${money(m.median)}`} />}
        {rent && <Marker left={pos(rent)} color={BURGUNDY} label={`You ${money(rent)}`} high />}
        <div className="absolute bottom-0 inset-x-0 flex justify-between text-[11px]" style={{ color: MUTED }}><span>{money(lo)}</span><span>{money(hi)}</span></div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
        <MiniStat k="Lower quarter" v={money(m.p25)} />
        <MiniStat k="Typical (median)" v={money(m.median)} strong />
        <MiniStat k="Upper quarter" v={money(m.p75)} />
      </div>
      {m.neighbours?.some((n: Any) => n.median) && (
        <p className="mt-4 text-sm" style={{ color: "#444" }}>
          For context: {m.neighbours.filter((n: Any) => n.median).map((n: Any) => `${n.beds === 0 ? "studios" : `${n.beds}-bed`} ${money(n.median)}`).join(" · ")}
        </p>
      )}
      <p className="text-xs mt-4 leading-relaxed" style={{ color: MUTED }}>
        Asking rents on public listings, not signed leases. They don&apos;t adjust for size, condition, exact location or which utilities are included{m.utilitiesIncluded ? " (your rent includes utilities, which many listings don't)" : ""}. We use this together with what renters tell us at showings.
      </p>
    </Card>
  );
}
function Marker({ left, color, label, high }: { left: string; color: string; label: string; high?: boolean }) {
  return (
    <div className="absolute bottom-6 flex flex-col items-center" style={{ left, top: high ? 0 : 22, transform: "translateX(-50%)" }}>
      <span className="text-[11px] font-bold whitespace-nowrap rounded-full px-2 py-0.5" style={{ background: color, color: "#fff" }}>{label}</span>
      <span className="flex-1 w-0.5" style={{ background: color }} />
    </div>
  );
}
function MiniStat({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return <div className="rounded-2xl p-3" style={{ background: strong ? NAVY : BG, color: strong ? "#FAF8F5" : NAVY }}><div className="text-[17px] font-bold">{v}</div><div className="text-[11px]" style={{ opacity: 0.75 }}>{k}</div></div>;
}

// ── Updates ────────────────────────────────────────────────────────────

function Updates({ updates }: { updates: Any[] }) {
  if (!updates.length) return <Empty icon="chart" title="Weekly updates show up here" body="Every week: showings booked and completed, what prospects said, what the market is doing and what we recommend next. You'll get an email each time." />;
  return <>{updates.map((u: Any, i: number) => <UpdateCard key={u.id} u={u} open={i === 0} />)}</>;
}
function UpdateCard({ u, open: startOpen }: { u: Any; open: boolean }) {
  const [open, setOpen] = useState(startOpen);
  const rows: [string, string | null][] = [["From our showing specialist", u.specialist_feedback], ["What prospects are saying", u.prospect_feedback], ["The market", u.market_feedback], ["What we recommend", u.recommendations]];
  return (
    <Card>
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex justify-between items-center text-left" aria-expanded={open}>
        <span><span className="block text-[17px] font-bold" style={{ color: NAVY }}>Week of {fShort(u.week_start)}–{fShort(u.week_end)}</span><span className="block text-xs" style={{ color: MUTED }}>Posted {fDate(u.published_at)}</span></span>
        <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: BG, color: NAVY }}>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="grid gap-4 mt-4">
          {u.summary && <p className="text-[15px] leading-relaxed whitespace-pre-line" style={{ color: "#222" }}>{u.summary}</p>}
          <div className="grid grid-cols-4 gap-2 text-center">
            {[["Booked", u.showings_scheduled], ["Done", u.showings_completed], ["Cancelled", u.cancellations], ["No-shows", u.no_shows]].map(([k, val]) => (
              <div key={k as string} className="rounded-2xl py-2.5" style={{ background: BG }}><div className="text-[20px] font-bold" style={{ color: NAVY }}>{val ?? "—"}</div><div className="text-[11px]" style={{ color: MUTED }}>{k}</div></div>
            ))}
          </div>
          {rows.filter(([, val]) => val).map(([k, val]) => (
            <div key={k}><div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: MUTED }}>{k}</div><p className="text-[15px] leading-relaxed whitespace-pre-line" style={{ color: "#222" }}>{val}</p></div>
          ))}
          {u.action_items?.length > 0 && (
            <div className="rounded-2xl p-4" style={{ background: BG }}>
              <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: MUTED }}>Next</div>
              <ul className="grid gap-1.5">{u.action_items.map((a: Any, i: number) => <li key={i} className="text-[15px]" style={{ color: "#222" }}>• {a.item} <span style={{ color: MUTED }}>({a.owner === "Owner" ? "you" : a.owner}{a.due ? `, ${a.due}` : ""})</span></li>)}</ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// ── Applications ───────────────────────────────────────────────────────

function List({ title, items, tone }: { title: string; items: Any[]; tone: string }) {
  if (!items?.length) return null;
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: tone }}>{title}</div>
      <ul className="grid gap-1.5">{items.map((it: Any, i: number) => <li key={i} className="text-[15px]" style={{ color: "#222" }}>{typeof it === "string" ? `• ${it}` : <><b>{it.item}:</b> {it.detail}</>}</li>)}</ul>
    </div>
  );
}

function ReviewCard({ r, disabled, act }: { r: Any; disabled: boolean; act: (b: Record<string, unknown>, ok?: string) => Promise<boolean> }) {
  const [mode, setMode] = useState<null | "approve" | "decline" | "ask">(null);
  const [reason, setReason] = useState("");
  const [comments, setComments] = useState("");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const open = ["released", "clarification"].includes(r.status);
  const label: Record<string, [string, string]> = {
    released: ["Your decision needed", BURGUNDY], clarification: ["Question sent to Ebin", "#7A5200"], approved: ["Approved to proceed", GREEN], completed: ["Placed", GREEN],
    declined: ["Declined", MUTED], paused: ["On hold", "#7A5200"], withdrawn: ["Withdrawn", MUTED],
  };
  const [lbl, col] = label[r.status] ?? [r.status, MUTED];
  return (
    <Card>
      <div className="flex justify-between gap-3 items-start">
        <div className="text-[17px] font-bold leading-snug" style={{ color: NAVY }}>{r.applicant_summary}</div>
        <span className="text-xs font-semibold shrink-0 rounded-full px-2.5 py-1" style={{ color: col, background: BG }}>{lbl}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <MiniStat k="Proposed move-in" v={r.move_in ? fShort(r.move_in) : "—"} />
        <MiniStat k="Proposed rent" v={r.proposed_rent ? `${money(r.proposed_rent)}/mo` : "—"} />
      </div>
      {r.terms && <p className="text-sm mt-3" style={{ color: "#444" }}><b>Terms:</b> {r.terms}</p>}
      {r.admin_summary && <div className="rounded-2xl p-4 mt-4" style={{ background: BG }}><div className="text-xs font-semibold mb-1" style={{ color: MUTED }}>Prospera&apos;s summary</div><p className="text-[15px]" style={{ color: "#222" }}>{r.admin_summary}</p>{r.recommendation && <p className="text-[15px] mt-2" style={{ color: NAVY }}><b>Our recommendation:</b> {r.recommendation}</p>}</div>}
      <div className="grid gap-4 mt-4">
        <List title="Verified by documents" items={r.verified} tone={GREEN} />
        <List title="Preliminary (stated, not yet verified)" items={r.preliminary} tone="#7A5200" />
        <List title="Still to check" items={r.outstanding_checks} tone={MUTED} />
      </div>
      {r.messages?.length > 0 && (
        <div className="grid gap-2 mt-4">
          {r.messages.map((m: Any) => (
            <div key={m.id} className="rounded-2xl p-3 text-[15px]" style={{ background: m.sender === "owner" ? BG : "#EEF2F5", marginLeft: m.sender === "owner" ? 24 : 0, marginRight: m.sender === "owner" ? 0 : 24 }}>
              <div className="text-xs font-semibold mb-0.5" style={{ color: MUTED }}>{m.sender === "owner" ? "You" : "Ebin"} · {fDate(m.created_at)}</div>{m.body}
            </div>
          ))}
        </div>
      )}
      {r.status === "declined" && <p className="text-sm mt-4" style={{ color: MUTED }}>You declined on {fDate(r.decided_at)}. Reason: {r.decision_reason}. We haven&apos;t passed your comments to the applicant.</p>}
      {r.status === "approved" && <p className="text-sm mt-4 font-semibold" style={{ color: GREEN }}>You approved this applicant to proceed on {fDate(r.decided_at)}. Follow the steps below.</p>}

      {open && !mode && (
        <div className="grid gap-2 mt-5">
          <button type="button" disabled={disabled} onClick={() => setMode("approve")} className="w-full rounded-2xl py-4 font-semibold text-[16px] disabled:opacity-50" style={{ background: BURGUNDY, color: "#FAF8F5" }}>Approve to Proceed</button>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" disabled={disabled} onClick={() => setMode("ask")} className="rounded-2xl border py-3 font-semibold text-sm disabled:opacity-50" style={{ borderColor: BORDER, color: NAVY }}>Ask a question</button>
            <button type="button" disabled={disabled} onClick={() => setMode("decline")} className="rounded-2xl border py-3 font-semibold text-sm disabled:opacity-50" style={{ borderColor: BORDER, color: NAVY }}>Decline</button>
          </div>
          <p className="text-xs leading-relaxed mt-1" style={{ color: MUTED }}><b>Approve to Proceed</b> lets us run full verification and take the next steps. It is not final tenant approval or a signed tenancy.</p>
        </div>
      )}
      {mode === "approve" && (
        <div className="rounded-2xl p-4 grid gap-3 mt-5" style={{ background: BG }}>
          <p className="text-[15px]" style={{ color: "#222" }}>Approve this applicant to proceed? We&apos;ll run full verification: a SingleKey credit and background check, and reference calls. This is <b>not</b> final approval or a signed lease.</p>
          <button type="button" disabled={busy} onClick={async () => { setBusy(true); await act({ action: "approve", reviewId: r.id }, "Approved to proceed. We've started verification."); setBusy(false); setMode(null); }} className="rounded-2xl py-3.5 font-semibold" style={{ background: BURGUNDY, color: "#FAF8F5" }}>{busy ? "Saving…" : "Yes, approve to proceed"}</button>
          <button type="button" onClick={() => setMode(null)} className="text-sm underline" style={{ color: MUTED }}>Cancel</button>
        </div>
      )}
      {mode === "decline" && (
        <div className="rounded-2xl p-4 grid gap-3 mt-5" style={{ background: BG }}>
          <label className="grid gap-1.5"><span className="text-[15px] font-semibold" style={{ color: NAVY }}>Reason (required)</span>
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="rounded-xl border p-3 bg-white text-[15px]" style={{ borderColor: BORDER }}>
              <option value="">Choose a reason…</option>{DECLINE_REASONS.map((x) => <option key={x}>{x}</option>)}
            </select>
          </label>
          <label className="grid gap-1.5"><span className="text-[15px] font-semibold" style={{ color: NAVY }}>Comments for Ebin</span>
            <textarea value={comments} onChange={(e) => setComments(e.target.value)} rows={3} className="rounded-xl border p-3 bg-white text-[15px]" style={{ borderColor: BORDER }} />
          </label>
          <p className="text-xs" style={{ color: MUTED }}>Only Ebin sees this; we don&apos;t pass it to the applicant. Under Ontario&apos;s Human Rights Code, decisions can&apos;t be based on things like family status, age, origin, religion, disability or receiving public assistance.</p>
          <button type="button" disabled={busy || !reason || (reason === "Other" && !comments.trim())} onClick={async () => { setBusy(true); await act({ action: "decline", reviewId: r.id, reason, comments }, "Recorded. Ebin will take it from here."); setBusy(false); setMode(null); }} className="rounded-2xl py-3.5 font-semibold disabled:opacity-50" style={{ background: NAVY, color: "#FAF8F5" }}>{busy ? "Saving…" : "Decline application"}</button>
          <button type="button" onClick={() => setMode(null)} className="text-sm underline" style={{ color: MUTED }}>Cancel</button>
        </div>
      )}
      {mode === "ask" && (
        <div className="rounded-2xl p-4 grid gap-3 mt-5" style={{ background: BG }}>
          <textarea value={q} onChange={(e) => setQ(e.target.value)} rows={3} placeholder="What would you like to know before deciding?" className="rounded-xl border p-3 bg-white text-[15px]" style={{ borderColor: BORDER }} />
          <button type="button" disabled={busy || !q.trim()} onClick={async () => { setBusy(true); if (await act({ action: "ask", reviewId: r.id, body: q }, "Sent to Ebin. You'll get an email when he replies.")) setQ(""); setBusy(false); setMode(null); }} className="rounded-2xl py-3.5 font-semibold disabled:opacity-50" style={{ background: NAVY, color: "#FAF8F5" }}>{busy ? "Sending…" : "Send question"}</button>
          <button type="button" onClick={() => setMode(null)} className="text-sm underline" style={{ color: MUTED }}>Cancel</button>
        </div>
      )}
    </Card>
  );
}

function NextSteps({ r }: { r: Any }) {
  const steps: Any[] = r.steps ?? [];
  const [open, setOpen] = useState<number | null>(steps.find((s) => s.status !== "done")?.step_no ?? null);
  if (!steps.length) return null;
  const done = steps.filter((s) => s.status === "done").length;
  return (
    <Card>
      <Title sub={`${r.applicant_summary.split(",")[0]} · ${done} of ${steps.length} done`}>What happens next</Title>
      <div className="h-2 rounded-full mb-5 overflow-hidden" style={{ background: "#ECE8E1" }}>
        <div className="h-2 rounded-full transition-all duration-700 motion-reduce:transition-none" style={{ width: `${(done / steps.length) * 100}%`, background: GREEN }} />
      </div>
      <ol className="grid gap-2">
        {steps.map((s, i) => (
          <li key={s.id} className="pp-in rounded-2xl" style={{ background: s.status === "in_progress" ? "#fff" : BG, border: `1px solid ${s.status === "in_progress" ? NAVY : "transparent"}`, animationDelay: `${i * 50}ms` }}>
            <button type="button" onClick={() => setOpen(open === s.step_no ? null : s.step_no)} className="w-full p-3.5 flex items-center gap-3 text-left" aria-expanded={open === s.step_no}>
              <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: s.status === "done" ? GREEN : s.status === "in_progress" ? NAVY : "#fff", color: s.status === "done" || s.status === "in_progress" ? "#fff" : MUTED }}>{s.status === "done" ? <Icon name="check" size={14} /> : s.step_no}</span>
              <span className="flex-1 text-[15px] font-semibold" style={{ color: NAVY }}>{s.title}</span>
              <Pill s={s.status} />
            </button>
            {open === s.step_no && (
              <div className="px-4 pb-4 grid gap-1.5 text-sm" style={{ color: "#333" }}>
                <div><span style={{ color: MUTED }}>Who:</span> {s.responsible || "Prospera"}</div>
                {s.target_date && <div><span style={{ color: MUTED }}>{s.status === "done" ? "Was scheduled for" : "Target date"}:</span> {fDate(s.target_date)}</div>}
                {s.completed_at && <div><span style={{ color: MUTED }}>Completed:</span> {fDate(s.completed_at)}</div>}
                {s.owner_action && <div className="rounded-xl p-3 font-semibold mt-1" style={{ background: "#F8EAEC", color: BURGUNDY }}>Needed from you: {s.owner_action}</div>}
                {s.files?.map((f: Any) => <FileRow key={f.id} f={f} />)}
              </div>
            )}
          </li>
        ))}
      </ol>
    </Card>
  );
}

// ── Files ──────────────────────────────────────────────────────────────

function Files({ files }: { files: Any[] }) {
  if (!files.length) return <Empty icon="image" title="Photos and documents show up here" body="Listing photos, the floor plan, the walkthrough report and later the lease and move-in inspection, as soon as they're ready." />;
  const photos = files.filter((f) => f.kind === "photo"), docs = files.filter((f) => f.kind !== "photo");
  return (
    <>
      {photos.length > 0 && <Card><Title sub={`${photos.length} photos`}>Photos</Title><Gallery files={photos} /></Card>}
      {docs.length > 0 && <Card><Title>Documents</Title><div className="grid gap-2">{docs.map((f) => <FileRow key={f.id} f={f} />)}</div></Card>}
    </>
  );
}
function FileRow({ f }: { f: Any }) {
  const label: Record<string, string> = { floor_plan: "Floor plan", walkthrough: "Walkthrough report", report: "Report", lease: "Lease", inspection: "Inspection", document: "Document" };
  return (
    <a href={f.url ?? "#"} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl p-3" style={{ background: BG }}>
      <span className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0" style={{ color: NAVY }}><Icon name="doc" size={16} /></span>
      <span className="min-w-0 flex-1"><span className="block text-[15px] font-semibold truncate" style={{ color: NAVY }}>{f.title}</span><span className="block text-xs" style={{ color: MUTED }}>{label[f.kind] ?? f.kind} · {fDate(f.created_at)}</span></span>
      <span className="text-sm font-semibold shrink-0" style={{ color: NAVY }}>Open</span>
    </a>
  );
}
function Gallery({ files }: { files: Any[] }) {
  const [big, setBig] = useState<string | null>(null);
  if (!files.length) return null;
  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {files.map((f) => (
          <button key={f.id} type="button" onClick={() => setBig(f.url)} className="aspect-square rounded-xl overflow-hidden" style={{ background: BG }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.url} alt={f.title} className="w-full h-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>
      {big && (
        <button type="button" onClick={() => setBig(null)} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.92)" }} aria-label="Close photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={big} alt="" className="max-w-full max-h-full object-contain rounded-lg" />
        </button>
      )}
    </>
  );
}

// ── Dialogs ────────────────────────────────────────────────────────────

/** Centered dialog: title and buttons always on screen, only the middle scrolls. */
function Dialog({ title, children, onClose, footer }: { title: string; children: React.ReactNode; onClose: () => void; footer: React.ReactNode }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", esc);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", esc); };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,22,30,0.55)" }} role="dialog" aria-modal="true" aria-label={title}>
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl flex flex-col pp-in" style={{ maxHeight: "min(640px, 86vh)" }}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <h2 className="text-[18px] font-bold" style={{ color: NAVY }}>{title}</h2>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded-full text-lg" style={{ background: BG, color: NAVY }} aria-label="Close">×</button>
        </div>
        <div className="px-5 overflow-y-auto flex-1 min-h-0">{children}</div>
        <div className="px-5 pt-3 pb-5 shrink-0 border-t" style={{ borderColor: "#F0ECE5" }}>{footer}</div>
      </div>
    </div>
  );
}

const TOUR = [
  { icon: "spark", title: "Where things stand", body: "The top of your dashboard shows the stage we're at, what happens next and who's doing it. Anything that needs you shows up in red." },
  { icon: "people", title: "Live interest", body: "Inquiries, showings and applications update as they happen. Open Activity to see each viewing request and what renters said at showings." },
  { icon: "chart", title: "Market and weekly updates", body: "See how your rent compares with similar London homes. Every week we post a short update with what we recommend." },
  { icon: "doc", title: "Your decisions", body: "When an applicant is screened and ready, you'll get an email. Review the summary under Applications and choose Approve to Proceed or Decline." },
];

function Tour({ onClose }: { onClose: () => void }) {
  const [i, setI] = useState(0);
  const last = i === TOUR.length;
  return (
    <Dialog title={last ? "Keep it on your phone" : "Welcome to your dashboard"} onClose={onClose}
      footer={
        <div className="grid gap-2">
          <div className="flex gap-1.5 justify-center mb-1" aria-hidden="true">{[...TOUR, null].map((_, k) => <span key={k} className="h-1.5 rounded-full transition-all" style={{ width: k === i ? 22 : 8, background: k <= i ? NAVY : "#DCD6CC" }} />)}</div>
          <button type="button" onClick={() => (last ? onClose() : setI(i + 1))} className="w-full rounded-2xl py-3.5 font-semibold" style={{ background: BURGUNDY, color: "#FAF8F5" }}>{last ? "Go to my dashboard" : "Next"}</button>
          {!last && <button type="button" onClick={onClose} className="text-sm py-1" style={{ color: MUTED }}>Skip</button>}
        </div>
      }>
      {!last ? (
        <div className="text-center py-3">
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4" style={{ background: BG, color: NAVY }}><Icon name={TOUR[i].icon} size={28} /></div>
          <h3 className="text-[20px] font-bold mb-2" style={{ color: NAVY }}>{TOUR[i].title}</h3>
          <p className="text-[15px] leading-relaxed" style={{ color: "#333" }}>{TOUR[i].body}</p>
        </div>
      ) : (
        <div className="pb-3">
          <p className="text-[15px] mb-4" style={{ color: "#333" }}>Add the dashboard to your home screen so it opens like an app. This guide is always under Help.</p>
          <InstallGuide />
        </div>
      )}
    </Dialog>
  );
}
