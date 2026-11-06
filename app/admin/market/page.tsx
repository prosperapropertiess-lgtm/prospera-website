"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Page, Loading, ErrorNote, C, inputStyle } from "@/components/admin/kit";
import { QuietButton, heading } from "./ui";
import {
  applyFilters, applyOverrides, cohortStats, filtersFromParams, filtersToParams, EMPTY_FILTERS, type Filters, type Obs, type Override,
} from "@/lib/market/core";
import { pickComparison, coverageWarnings, diffScans, COMPARE_LABEL, type CompareMode } from "@/lib/market/compare";
import type { ParsedSummary } from "@/lib/market/ingest";
import FilterBar from "./FilterBar";
import Overview, { type CompareInfo } from "./Overview";
import Listings from "./Listings";
import Drawer from "./Drawer";
import Areas from "./Areas";
import Trends from "./Trends";
import MyProperties from "./MyProperties";
import DataSync, { type Status } from "./DataSync";
import { Note, fmtDate, fmtDateTime, type Ctx, type Snapshot, type Tab } from "./shared";

interface Data {
  snapshot: Snapshot | null;
  snapshots: Snapshot[];
  observations: Obs[];
  overrides: (Override & { id: string; reason: string | null; created_at: string; original_value: string | null })[];
  summary: ParsedSummary | null;
}

const TABS: { value: Tab; label: string }[] = [
  { value: "overview", label: "Big picture" },
  { value: "listings", label: "Browse ads" },
  { value: "areas", label: "Neighbourhoods" },
  { value: "trends", label: "What changed" },
  { value: "mine", label: "My homes" },
  { value: "data", label: "Where the data comes from" },
];

interface UrlState { tab: Tab; snap: string | null; cmp: CompareMode; cmpId: string | null; open: string | null; filters: Filters }

function readUrl(): UrlState {
  const p = new URLSearchParams(window.location.search);
  const tab = (TABS.some((t) => t.value === p.get("tab")) ? p.get("tab") : "overview") as Tab;
  const cmp = (Object.keys(COMPARE_LABEL).includes(p.get("cmp") ?? "") ? p.get("cmp") : "previous") as CompareMode;
  return { tab, snap: p.get("snap"), cmp, cmpId: p.get("cmpId"), open: p.get("open"), filters: filtersFromParams(p) };
}

function writeUrl(s: UrlState, replace = false) {
  const p = filtersToParams(s.filters);
  if (s.tab !== "overview") p.set("tab", s.tab);
  if (s.snap) p.set("snap", s.snap);
  if (s.cmp !== "previous") p.set("cmp", s.cmp);
  if (s.cmp === "custom" && s.cmpId) p.set("cmpId", s.cmpId);
  if (s.open) p.set("open", s.open);
  const url = `${window.location.pathname}${p.toString() ? `?${p}` : ""}`;
  if (url === `${window.location.pathname}${window.location.search}`) return;
  if (replace) window.history.replaceState(null, "", url); else window.history.pushState(null, "", url);
}

export default function MarketPage() {
  const [ui, setUi] = useState<UrlState | null>(null);
  const [data, setData] = useState<Data | null>(null);
  const [prev, setPrev] = useState<{ id: string; obs: Obs[] } | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const loadSeq = useRef(0);

  // URL is the source of truth for view state, so links and back/forward work.
  useEffect(() => {
    const t = setTimeout(() => setUi(readUrl()), 0);
    const onPop = () => setUi(readUrl());
    window.addEventListener("popstate", onPop);
    return () => { clearTimeout(t); window.removeEventListener("popstate", onPop); };
  }, []);
  const update = useCallback((patch: Partial<UrlState>, replace = false) => {
    setUi((cur) => {
      if (!cur) return cur;
      const next = { ...cur, ...patch };
      writeUrl(next, replace);
      return next;
    });
  }, []);

  const loadStatus = useCallback(() => fetch("/api/admin/market/status").then((r) => r.json()).then(setStatus).catch(() => {}), []);
  const load = useCallback(async (snap: string | null) => {
    const seq = ++loadSeq.current;
    const res = await fetch(`/api/admin/market/data${snap ? `?snapshot=${snap}` : ""}`).catch(() => null);
    if (seq !== loadSeq.current) return;   // a newer request superseded this one
    if (!res?.ok) { setError("Couldn't load market data. Refresh the page to try again."); setData({ snapshot: null, snapshots: [], observations: [], overrides: [], summary: null }); return; }
    setData(await res.json());
  }, []);

  useEffect(() => { if (ui) { const t = setTimeout(() => load(ui.snap), 0); return () => clearTimeout(t); } }, [ui?.snap, load]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const t = setTimeout(loadStatus, 0); return () => clearTimeout(t); }, [loadStatus]);

  const obs = useMemo(() => (data?.snapshot ? data.observations.map((o) => applyOverrides(o, data.overrides, data.snapshot!.id)) : []), [data]);

  const cmpPick = useMemo(() => (data?.snapshot && ui ? pickComparison(data.snapshots, data.snapshot.id, ui.cmp, ui.cmpId) : { snap: null, reason: null }), [data, ui]);
  useEffect(() => {
    const id = cmpPick.snap?.id;
    if (!id || prev?.id === id) return;
    let live = true;
    fetch(`/api/admin/market/data?snapshot=${id}`).then((r) => r.json()).then((d: Data) => {
      if (live) setPrev({ id, obs: d.observations.map((o) => applyOverrides(o, d.overrides, id)) });
    }).catch(() => {});
    return () => { live = false; };
  }, [cmpPick.snap?.id, prev?.id]);

  const res = useMemo(() => (ui ? cohortStats(applyFilters(obs, ui.filters), ui.filters) : null), [obs, ui]);
  // Big picture always starts from every ad; its own cards do the narrowing.
  const resAll = useMemo(() => cohortStats(applyFilters(obs, { ...EMPTY_FILTERS, market: "all" }), { outliers: false }), [obs]);

  const compare: CompareInfo = useMemo(() => {
    if (!data?.snapshot || !ui) return { label: "", snapDate: null, reason: null, warnings: [], diff: null };
    if (!cmpPick.snap) return { label: COMPARE_LABEL[ui.cmp], snapDate: null, reason: cmpPick.reason, warnings: [], diff: null };
    if (!prev || prev.id !== cmpPick.snap.id) return { label: COMPARE_LABEL[ui.cmp], snapDate: cmpPick.snap.scan_date, reason: "Loading the earlier scan…", warnings: [], diff: null };
    const cur = applyFilters(obs, { ...ui.filters, excluded: true });
    const old = applyFilters(prev.obs, { ...ui.filters, excluded: true });
    return {
      label: COMPARE_LABEL[ui.cmp], snapDate: cmpPick.snap.scan_date, reason: null,
      warnings: coverageWarnings(data.snapshot, cmpPick.snap), diff: diffScans(cur, old),
    };
  }, [data, ui, cmpPick, prev, obs]);

  async function refresh() {
    setSyncing(true); setSyncMsg(null);
    const r = await fetch("/api/admin/market/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }).catch(() => null);
    const d = await r?.json().catch(() => ({}));
    setSyncMsg(r?.ok ? d.result.message : d?.error ?? "The refresh didn't finish. Showing the last good data.");
    setSyncing(false);
    loadStatus();
    if (r?.ok && d.result.status !== "unchanged") load(null);
  }

  if (!ui || !data) return <Page><Loading /></Page>;

  const latest = data.snapshots[0];

  if (!data.snapshot) {
    return (
      <Page width={1100}>
        <Header />
        {error && <ErrorNote>{error}</ErrorNote>}
        <Note>No data yet. Go to &quot;Where the data comes from&quot; and press Refresh now.</Note>
        <div style={{ marginTop: 16 }}>
          <DataSync ctx={{} as Ctx} status={status} summary={null} onSynced={() => { load(null); loadStatus(); }} />
        </div>
      </Page>
    );
  }

  const ctx: Ctx = {
    obs, snapshot: data.snapshot, snapshots: data.snapshots, filters: ui.filters,
    setFilters: (f) => update({ filters: f }),
    drill: (patch) => update({ filters: { ...ui.filters, ...patch }, tab: "listings" }),
    openListing: (id) => update({ open: id }),
    setTab: (t) => update({ tab: t }),
  };
  const openObs = ui.open ? obs.find((o) => o.listing_id === ui.open) ?? prev?.obs.find((o) => o.listing_id === ui.open) ?? null : null;
  const viewingOld = latest && data.snapshot.id !== latest.id;

  return (
    <Page width={1280}>
      <Header />
      <div className="flex flex-wrap items-center gap-3 bg-white rounded-2xl px-4 py-3 mb-4" style={{ border: "1px solid #D8D2C8" }}>
        <label className="flex items-center gap-2 text-sm" style={{ color: C.muted }}>
          Scan from
          <select value={data.snapshot.id} onChange={(e) => { setPrev(null); update({ snap: e.target.value === latest?.id ? null : e.target.value }); }}
            style={{ ...inputStyle, width: "auto", maxWidth: "min(300px, 60vw)", padding: "6px 10px", fontSize: 15, borderRadius: 10 }}>
            {data.snapshots.map((s) => <option key={s.id} value={s.id}>{fmtDate(s.scan_date)}{s.revision > 1 ? ` (v${s.revision})` : ""}</option>)}
          </select>
        </label>
        {data.snapshots.length > 1 && (
          <label className="flex items-center gap-2 text-sm" style={{ color: C.muted }}>
            compared with
            <select value={ui.cmp === "custom" ? `custom:${ui.cmpId ?? ""}` : ui.cmp} onChange={(e) => {
              const v = e.target.value;
              if (v.startsWith("custom:")) update({ cmp: "custom", cmpId: v.slice(7) }); else update({ cmp: v as CompareMode, cmpId: null });
            }} style={{ ...inputStyle, width: "auto", padding: "6px 10px", fontSize: 15, borderRadius: 10 }}>
              {(["previous", "week", "month", "quarter", "year"] as CompareMode[]).map((m) => <option key={m} value={m}>{COMPARE_LABEL[m]}</option>)}
              {data.snapshots.filter((s) => s.id !== data.snapshot!.id).map((s) => <option key={s.id} value={`custom:${s.id}`}>Scan {fmtDate(s.scan_date)}</option>)}
            </select>
          </label>
        )}
        <span className="text-sm flex-1 min-w-[200px]" style={{ color: C.muted }} title="When the ads were collected, and when this page last read the Sheet.">
          <span aria-hidden style={{ display: "inline-block", width: 9, height: 9, borderRadius: 999, marginRight: 6, background: status?.lastFailed ? C.red : status?.stale ? C.amber : C.green }} />
          {status?.lastFailed ? "Last update failed. " : status?.stale ? "No new scan in over a week. " : "Up to date. "}
          Ads collected {fmtDate(latest?.scan_date)}. Next update {status ? fmtDateTime(status.nextRun) : "Friday 10am"}
        </span>
        <QuietButton onClick={refresh}>{syncing ? "Checking…" : "Check for new data"}</QuietButton>
      </div>
      {syncMsg && <div style={{ marginBottom: 12 }}><Note>{syncMsg}</Note></div>}
      {viewingOld && <div style={{ marginBottom: 12 }}><Note tone="amber">You&apos;re looking at an older scan from {fmtDate(data.snapshot.scan_date)}, not the newest one.</Note></div>}
      {error && <ErrorNote>{error}</ErrorNote>}

      <nav aria-label="Sections" className="flex gap-1 mb-6 p-1.5 rounded-2xl bg-white overflow-x-auto" style={{ border: "1px solid #D8D2C8" }}>
        {TABS.map((t) => (
          <button key={t.value} type="button" onClick={() => update({ tab: t.value })} aria-current={ui.tab === t.value ? "page" : undefined}
            className="px-4 py-2.5 rounded-xl text-[15px] font-semibold whitespace-nowrap transition-colors duration-200"
            style={{ background: ui.tab === t.value ? "#1F2F3A" : "transparent", color: ui.tab === t.value ? "#FAF8F5" : "#1F2F3A" }}>
            {t.label}
          </button>
        ))}
      </nav>

      {ui.tab !== "overview" && ui.tab !== "mine" && ui.tab !== "data" && res && (
        <FilterBar all={obs} filters={ui.filters} setFilters={ctx.setFilters}
          counts={{ matched: res.matched.length, used: res.whole.length + res.room.length, excluded: res.excluded.length }} />
      )}

      {res && ui.tab === "overview" && (
        <Overview ctx={ctx} res={resAll} compare={compare}
          sourceMedian={(() => {
            const row = data.summary?.sections.find((s) => /HEADLINE MEDIANS/i.test(s.heading))?.rows.find((r) => /all whole-unit/i.test(r.cells[0] ?? ""));
            return row ? { n: Number(row.cells[1]), median: Number(row.cells[2]) } : null;
          })()} />
      )}
      {res && ui.tab === "listings" && <Listings ctx={ctx} res={res} />}
      {res && ui.tab === "areas" && <Areas ctx={ctx} res={res} />}
      {ui.tab === "trends" && (
        <Trends ctx={ctx} compare={compare} cmpMode={ui.cmp} setCmpMode={(m) => update({ cmp: m, cmpId: null })}
          cmpCustom={ui.cmpId} setCmpCustom={(id) => update({ cmp: "custom", cmpId: id })}
          prevObs={prev && cmpPick.snap && prev.id === cmpPick.snap.id ? applyFilters(prev.obs, { ...ui.filters, excluded: false }) : null} />
      )}
      {ui.tab === "mine" && <MyProperties ctx={ctx} />}
      {ui.tab === "data" && <DataSync ctx={ctx} status={status} summary={data.summary} onSynced={() => { load(ui.snap); loadStatus(); }} />}

      {openObs && res && (
        <Drawer o={openObs} ctx={ctx} overrides={data.overrides} outlierIds={res.outlierIds} sheetUrl={status?.sheetUrl ?? null}
          onClose={() => update({ open: null })} onChanged={() => load(ui.snap)} />
      )}
    </Page>
  );
}

function Header() {
  return (
    <div style={{ marginBottom: 14 }}>
      <h1 className="text-3xl sm:text-4xl font-bold" style={heading}>London Rental Market</h1>
      <p className="text-base sm:text-lg mt-1" style={{ color: C.muted }}>What landlords are asking for rentals on Facebook Marketplace, within 25 km of London.</p>
    </div>
  );
}
