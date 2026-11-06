"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Page, Tabs, Loading, ErrorNote, Button, C, inputStyle } from "@/components/admin/kit";
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
  { value: "overview", label: "Overview" },
  { value: "listings", label: "Listings" },
  { value: "areas", label: "Areas & Configurations" },
  { value: "trends", label: "Trends & Changes" },
  { value: "mine", label: "My Properties" },
  { value: "data", label: "Data & Sync" },
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
        <Note>No scan has been imported yet. Press Refresh now to read the Sheet.</Note>
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
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 14px", marginBottom: 14, position: "sticky", top: 0, zIndex: 20 }}>
        <label style={{ fontSize: 13, color: C.muted, display: "flex", gap: 6, alignItems: "center" }}>
          Scan
          <select value={data.snapshot.id} onChange={(e) => { setPrev(null); update({ snap: e.target.value === latest?.id ? null : e.target.value }); }} style={{ ...inputStyle, width: "auto", padding: "6px 10px", fontSize: 14 }}>
            {data.snapshots.map((s) => <option key={s.id} value={s.id}>{fmtDate(s.scan_date)}{s.scan_label ? ` · ${s.scan_label}` : ""}{s.revision > 1 ? ` (v${s.revision})` : ""}</option>)}
          </select>
        </label>
        <label style={{ fontSize: 13, color: C.muted, display: "flex", gap: 6, alignItems: "center" }}>
          Compare with
          <select value={ui.cmp === "custom" ? `custom:${ui.cmpId ?? ""}` : ui.cmp} onChange={(e) => {
            const v = e.target.value;
            if (v.startsWith("custom:")) update({ cmp: "custom", cmpId: v.slice(7) }); else update({ cmp: v as CompareMode, cmpId: null });
          }} style={{ ...inputStyle, width: "auto", padding: "6px 10px", fontSize: 14 }}>
            {(["previous", "week", "month", "quarter", "year"] as CompareMode[]).map((m) => <option key={m} value={m}>{COMPARE_LABEL[m]}</option>)}
            {data.snapshots.filter((s) => s.id !== data.snapshot!.id).map((s) => <option key={s.id} value={`custom:${s.id}`}>Scan {fmtDate(s.scan_date)}</option>)}
          </select>
        </label>
        <span style={{ fontSize: 13, color: C.muted, flex: "1 1 240px" }}>
          {compare.diff ? `vs ${fmtDate(compare.snapDate)}` : compare.reason ?? ""}
        </span>
        <span style={{ fontSize: 13, color: C.muted }} title="Source scanned is when the data was collected. Dashboard read is when this site last read the Sheet.">
          <span aria-hidden style={{ display: "inline-block", width: 8, height: 8, borderRadius: 999, marginRight: 6, background: status?.lastFailed ? C.red : status?.stale ? C.amber : C.green }} />
          Source scanned {fmtDate(latest?.scan_date)} · Dashboard read {fmtDateTime(status?.lastGood?.started_at ?? latest?.ingested_at)}
          {status?.stale ? " · source not updated" : ""}{status?.lastFailed ? " · last read failed" : ""}
        </span>
        <Button size="sm" onClick={refresh} disabled={syncing}>{syncing ? "Reading…" : "Refresh now"}</Button>
        <Button size="sm" href={status?.sheetUrl ?? data.snapshot.source_url ?? "#"} target="_blank">Sheet ↗</Button>
      </div>
      {syncMsg && <div style={{ marginBottom: 12 }}><Note>{syncMsg}</Note></div>}
      {viewingOld && <div style={{ marginBottom: 12 }}><Note tone="amber">Historical view: you&apos;re looking at the {fmtDate(data.snapshot.scan_date)} scan, not the latest.</Note></div>}
      {error && <ErrorNote>{error}</ErrorNote>}

      <Tabs value={ui.tab} onChange={(t) => update({ tab: t })} options={TABS} />

      {ui.tab !== "mine" && ui.tab !== "data" && res && (
        <FilterBar all={obs} filters={ui.filters} setFilters={ctx.setFilters}
          counts={{ matched: res.matched.length, used: res.whole.length + res.room.length, excluded: res.excluded.length }} />
      )}

      {res && ui.tab === "overview" && (
        <Overview ctx={ctx} res={res} compare={compare}
          sourceMedian={(() => {
            const row = data.summary?.sections.find((s) => /HEADLINE MEDIANS/i.test(s.heading))?.rows.find((r) => /all whole-unit/i.test(r.cells[0] ?? ""));
            return row && JSON.stringify(ui.filters) === JSON.stringify({ ...EMPTY_FILTERS, market: ui.filters.market }) ? { n: Number(row.cells[1]), median: Number(row.cells[2]) } : null;
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
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: C.navy }}>London Rental Market</h1>
      <p style={{ margin: "4px 0 0", fontSize: 15, color: C.muted }}>Facebook Marketplace asking rents in London, Ontario (25 km). Asking rents, not signed leases; observed ads, not the whole market.</p>
    </div>
  );
}
