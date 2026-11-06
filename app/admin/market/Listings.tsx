"use client";
import { useEffect, useMemo, useState } from "react";
import { C, Button, inputStyle, buttonStyle } from "@/components/admin/kit";
import {
  cad, bedsLabel, areaLabel, exclusionReason, FLAG_TEXT, LISTING_FIELDS, csvCell, availabilityLabel, filtersToParams, type CohortResult, type Obs,
} from "@/lib/market/core";
import { Pill, th, tdc, TableWrap, download, fmtDate, tabular, type Ctx } from "./shared";
import { Card, Choice, NAVY, MUTED, BORDER, heading } from "./ui";
import { cap } from "./Overview";

interface Col { key: string; label: string; get: (o: Obs) => string | number | null; num?: boolean }

const COLS: Col[] = [
  { key: "title", label: "Title", get: (o) => o.norm.title },
  { key: "price", label: "Asking rent", get: (o) => o.norm.price, num: true },
  { key: "basis", label: "Price basis", get: (o) => (o.norm.price_basis === "per_room" ? "Per room" : o.norm.price_basis === "whole_unit" ? "Whole unit" : o.norm.price_basis) },
  { key: "type", label: "Type", get: (o) => o.norm.type },
  { key: "beds", label: "Beds", get: (o) => bedsLabel(o.norm.beds_cat) },
  { key: "baths", label: "Baths", get: (o) => o.norm.baths, num: true },
  { key: "area", label: "Area", get: (o) => areaLabel(o.norm.area) },
  { key: "incl", label: "Inclusions", get: (o) => [o.norm.utilities.join(", "), o.norm.parking ? `parking: ${o.norm.parking}` : "", o.norm.laundry ? `laundry: ${o.norm.laundry}` : ""].filter(Boolean).join(" · ") },
  { key: "first", label: "First seen (source)", get: (o) => o.norm.first_seen },
  { key: "quality", label: "Statistics", get: () => "" },
  { key: "sqft", label: "Sq ft", get: (o) => o.norm.sqft, num: true },
  { key: "ppsf", label: "Rent / sq ft", get: (o) => (o.norm.price && o.norm.sqft ? +(o.norm.price / o.norm.sqft).toFixed(2) : null), num: true },
  { key: "parking", label: "Parking", get: (o) => o.norm.parking },
  { key: "laundry", label: "Laundry", get: (o) => o.norm.laundry },
  { key: "pets", label: "Pets", get: (o) => o.norm.pets },
  { key: "furnished", label: "Furnished", get: (o) => o.raw.furnished || null },
  { key: "available", label: "Available", get: (o) => availabilityLabel(o.norm.available, o.raw.available_date ?? "") },
  { key: "address", label: "Street", get: (o) => o.norm.address },
  { key: "posted", label: "Posted", get: (o) => o.norm.created_date },
  { key: "id", label: "Listing ID", get: (o) => o.listing_id },
  { key: "queries", label: "Found by", get: (o) => o.norm.queries.join(", ") },
];
const DEFAULT_COLS = ["title", "price", "basis", "type", "beds", "baths", "area", "incl", "first", "quality"];
const COLS_KEY = "market-listing-cols";

interface SavedView { id: string; name: string; query: string; workspace: string }

export default function Listings({ ctx, res }: { ctx: Ctx; res: CohortResult }) {
  const [cols, setCols] = useState<string[]>(DEFAULT_COLS);
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 }[]>([{ key: "posted", dir: -1 }]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(24);
  const [dense, setDense] = useState(false);
  const [view, setView] = useState<"cards" | "table">("cards");
  const [chooser, setChooser] = useState(false);
  const [views, setViews] = useState<SavedView[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    try { const saved = localStorage.getItem(COLS_KEY); if (saved) { const v = JSON.parse(saved); const t = setTimeout(() => setCols(v), 0); return () => clearTimeout(t); } } catch {}
  }, []);
  useEffect(() => { try { localStorage.setItem(COLS_KEY, JSON.stringify(cols)); } catch {} }, [cols]);
  const loadViews = () => fetch("/api/admin/market/views").then((r) => r.json()).then((d) => setViews(d.views ?? [])).catch(() => {});
  useEffect(() => { const t = setTimeout(loadViews, 0); return () => clearTimeout(t); }, []);

  const rows = useMemo(() => {
    const all = [...res.matched];
    const colFor = (k: string) => COLS.find((c) => c.key === k)!;
    all.sort((a, b) => {
      for (const s of sort) {
        const av = colFor(s.key).get(a), bv = colFor(s.key).get(b);
        if (av == null && bv == null) continue;
        if (av == null) return 1;
        if (bv == null) return -1;
        const c = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
        if (c) return c * s.dir;
      }
      return a.listing_id.localeCompare(b.listing_id);   // stable tie-break
    });
    return all;
  }, [res.matched, sort]);
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const shownPage = Math.min(page, pages - 1);
  const shown = rows.slice(shownPage * size, shownPage * size + size);
  const visible = COLS.filter((c) => cols.includes(c.key));

  function sortBy(key: string, add: boolean) {
    setSort((prev) => {
      const cur = prev.find((s) => s.key === key);
      const next = cur ? { key, dir: (cur.dir * -1) as 1 | -1 } : { key, dir: (COLS.find((c) => c.key === key)?.num ? -1 : 1) as 1 | -1 };
      return add ? [...prev.filter((s) => s.key !== key), next] : [next];
    });
  }

  function exportCsv() {
    const header = ["listing_id", ...LISTING_FIELDS.filter((f) => f !== "listing_id"), "extra_fields", "dashboard_cohort", "dashboard_flags", "excluded_reason", "snapshot_id", "scan_date", "filters"];
    const filters = filtersToParams(ctx.filters).toString();
    const lines = [header.join(",")];
    for (const o of rows) {
      lines.push([
        o.listing_id, ...LISTING_FIELDS.filter((f) => f !== "listing_id").map((f) => o.raw[f] ?? ""), JSON.stringify(o.norm.extra),
        o.cohort, o.flags.join("; "), exclusionReason(o, res.outlierIds, ctx.filters.outliers) ?? "", ctx.snapshot.id, ctx.snapshot.scan_date ?? "", filters,
      ].map(csvCell).join(","));
    }
    download(`rental-market-${ctx.snapshot.scan_date ?? "scan"}-${rows.length}-listings.csv`, lines.join("\n"));
  }

  async function saveView() {
    const name = prompt("Name this view (for example \"2-bed apartments in Fanshawe\")");
    if (!name) return;
    await fetch("/api/admin/market/views", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, workspace: "listings", query: filtersToParams(ctx.filters).toString() }) });
    loadViews();
  }

  const pad = dense ? "6px 10px" : "10px 12px";

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Card title={`${rows.length} ${rows.length === 1 ? "ad" : "ads"}`} sub="Tap an ad to see everything about it. Greyed ads aren't counted in the prices because something about them is confusing."
        right={
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Choice size="sm" selected={view === "cards"} onClick={() => setView("cards")}>Cards</Choice>
            <Choice size="sm" selected={view === "table"} onClick={() => setView("table")}>Table</Choice>
            <select aria-label="Saved views" value="" onChange={(e) => { const v = views.find((x) => x.id === e.target.value); if (v) window.location.search = `?tab=listings&${v.query}`; }}
              style={{ ...inputStyle, width: "auto", padding: "6px 10px", fontSize: 14 }}>
              <option value="">Saved views…</option>
              {views.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
            <Button size="sm" onClick={saveView}>Save this view</Button>
            <Button size="sm" onClick={() => setChooser(!chooser)}>Columns</Button>
            <Button size="sm" onClick={exportCsv}>Export CSV</Button>
            <a href={`/api/admin/market/source?snapshot=${ctx.snapshot.id}&download=1`} style={buttonStyle("secondary", "sm")}>Full data (JSON)</a>
          </div>
        }>
        {chooser && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {COLS.map((c) => <Pill key={c.key} active={cols.includes(c.key)} onClick={() => setCols(cols.includes(c.key) ? cols.filter((x) => x !== c.key) : [...cols, c.key])}>{c.label}</Pill>)}
            <Pill onClick={() => setCols(DEFAULT_COLS)}>Reset</Pill>
            {views.length > 0 && (
              <div style={{ width: "100%", fontSize: 13, color: C.muted, marginTop: 6 }}>
                Remove a saved view: {views.map((v) => (
                  <button key={v.id} type="button" onClick={async () => { await fetch(`/api/admin/market/views?id=${v.id}`, { method: "DELETE" }); loadViews(); }}
                    style={{ marginRight: 8, background: "none", border: "none", color: C.navy, textDecoration: "underline", cursor: "pointer" }}>{v.name} ✕</button>
                ))}
              </div>
            )}
          </div>
        )}
        {view === "cards" && (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((o) => {
              const reason = exclusionReason(o, res.outlierIds, ctx.filters.outliers);
              return (
                <button key={`${o.listing_id}-${o.source_row}`} type="button" onClick={() => ctx.openListing(o.listing_id)}
                  className="text-left bg-white border-2 rounded-2xl p-4 transition-colors hover:border-[#1F2F3A]" style={{ borderColor: BORDER, opacity: reason ? 0.6 : 1 }}>
                  <div className="text-2xl font-bold tabular-nums" style={heading}>{cad(o.norm.price)}<span className="text-sm font-normal" style={{ color: MUTED }}>{o.norm.price_basis === "per_room" ? " a room" : " a month"}</span></div>
                  <div className="font-semibold mt-1 line-clamp-2" style={{ color: NAVY }}>{o.norm.title || "Untitled ad"}</div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {[cap(o.norm.type), bedsLabel(o.norm.beds_cat), o.norm.baths != null ? `${o.norm.baths} bath` : null, areaLabel(o.norm.area)].filter(Boolean).map((t) => (
                      <span key={t} className="text-sm rounded-lg px-2 py-1" style={{ background: "#F7F5F2", color: NAVY }}>{t}</span>
                    ))}
                  </div>
                  {reason && <div className="text-sm mt-2" style={{ color: "#7A5200" }}>Not counted: {reason.toLowerCase()}</div>}
                </button>
              );
            })}
            {!shown.length && <p style={{ color: MUTED }}>No ads match. Try removing a filter.</p>}
          </div>
        )}
        {view === "table" && <>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap", fontSize: 13, color: C.muted }}>
          <span>Click a column to sort; shift-click to add a second sort.</span>
          <span style={{ display: "flex", gap: 6 }}>
            <Pill active={!dense} onClick={() => setDense(false)}>Comfortable</Pill>
            <Pill active={dense} onClick={() => setDense(true)}>Compact</Pill>
          </span>
        </div>
        {selected.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10, alignItems: "center", fontSize: 14 }}>
            <span>{selected.length} selected:</span>
            <Button size="sm" onClick={() => navigator.clipboard.writeText(res.matched.filter((o) => selected.includes(o.listing_id)).map((o) => o.norm.url ?? o.listing_id).join("\n"))}>Copy links</Button>
            <Button size="sm" onClick={() => { const set = new Set(selected); download(`selected-listings.csv`, ["listing_id,title,price,price_basis,type,bedrooms,area,url", ...res.matched.filter((o) => set.has(o.listing_id)).map((o) => [o.listing_id, o.norm.title, o.norm.price, o.norm.price_basis, o.norm.type, o.norm.beds_cat, o.norm.area ?? "", o.norm.url ?? ""].map(csvCell).join(","))].join("\n")); }}>Export selected</Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected([])}>Clear selection</Button>
          </div>
        )}
        <TableWrap maxHeight={680}>
          <table style={{ borderCollapse: "collapse", width: "100%", ...tabular }}>
            <thead>
              <tr>
                <th style={{ ...th, width: 34 }}><input type="checkbox" aria-label="Select page" checked={shown.length > 0 && shown.every((o) => selected.includes(o.listing_id))} onChange={(e) => setSelected(e.target.checked ? [...new Set([...selected, ...shown.map((o) => o.listing_id)])] : selected.filter((x) => !shown.some((o) => o.listing_id === x)))} /></th>
                {visible.map((c) => {
                  const s = sort.findIndex((x) => x.key === c.key);
                  return (
                    <th key={c.key} style={{ ...th, padding: pad, textAlign: c.num ? "right" : "left" }} aria-sort={s === 0 ? (sort[0].dir === 1 ? "ascending" : "descending") : undefined}>
                      {c.key === "quality" ? c.label : (
                        <button type="button" onClick={(e) => sortBy(c.key, e.shiftKey)} style={{ background: "none", border: "none", padding: 0, font: "inherit", color: "inherit", cursor: "pointer", fontWeight: 700 }}>
                          {c.label}{s >= 0 ? ` ${sort[s].dir === 1 ? "↑" : "↓"}${sort.length > 1 ? s + 1 : ""}` : ""}
                        </button>
                      )}
                    </th>
                  );
                })}
                <th style={{ ...th, padding: pad }}>Link</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((o) => {
                const reason = exclusionReason(o, res.outlierIds, ctx.filters.outliers);
                return (
                  <tr key={`${o.listing_id}-${o.source_row}`} onClick={() => ctx.openListing(o.listing_id)} style={{ cursor: "pointer", background: reason ? "#FCFBF8" : undefined }}>
                    <td style={{ ...tdc, padding: pad }} onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" aria-label={`Select ${o.norm.title}`} checked={selected.includes(o.listing_id)} onChange={() => setSelected(selected.includes(o.listing_id) ? selected.filter((x) => x !== o.listing_id) : [...selected, o.listing_id])} />
                    </td>
                    {visible.map((c) => {
                      if (c.key === "quality") return (
                        <td key={c.key} style={{ ...tdc, padding: pad, fontSize: 13 }}>
                          {reason ? <span style={{ color: C.amber }}>Kept out: {reason}</span> : <span style={{ color: C.green }}>Used</span>}
                          {!reason && res.outlierIds.has(o.listing_id) && <span style={{ color: C.muted }}> · unusual price</span>}
                          {o.flags.filter((f) => f !== "room_whole_conflict").length > 0 && <div style={{ color: C.muted }}>{o.flags.filter((f) => f !== "room_whole_conflict").map((f) => FLAG_TEXT[f]).join("; ")}</div>}
                        </td>
                      );
                      const v = c.get(o);
                      return (
                        <td key={c.key} style={{ ...tdc, padding: pad, textAlign: c.num ? "right" : "left", maxWidth: c.key === "title" ? 320 : undefined, fontWeight: c.key === "title" ? 600 : undefined, color: c.key === "title" ? C.navy : undefined }}>
                          {v == null || v === "" ? <span style={{ color: C.faint }}>Not stated</span> : c.key === "price" ? cad(Number(v)) : c.key === "first" || c.key === "posted" ? fmtDate(String(v)) : String(v)}
                        </td>
                      );
                    })}
                    <td style={{ ...tdc, padding: pad }} onClick={(e) => e.stopPropagation()}>
                      {o.norm.url ? <a href={o.norm.url} target="_blank" rel="noopener noreferrer" style={{ color: C.navy }}>Open ↗</a> : <span style={{ color: C.faint }}>—</span>}
                    </td>
                  </tr>
                );
              })}
              {!shown.length && <tr><td colSpan={visible.length + 2} style={{ ...tdc, color: C.faint, textAlign: "center", padding: 30 }}>No listings match these filters.</td></tr>}
            </tbody>
          </table>
        </TableWrap>
        </>}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, gap: 10, flexWrap: "wrap", fontSize: 14 }}>
          <span style={{ color: C.muted }}>Showing {rows.length ? shownPage * size + 1 : 0}–{Math.min(rows.length, shownPage * size + size)} of {rows.length} (all {rows.length} loaded)</span>
          <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select aria-label="Rows per page" value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }} style={{ ...inputStyle, width: "auto", padding: "4px 8px" }}>
              {[24, 48, 96, 500].map((n) => <option key={n} value={n}>{n} per page</option>)}
            </select>
            <Button size="sm" disabled={shownPage === 0} onClick={() => setPage(shownPage - 1)}>Previous</Button>
            <span style={tabular}>{shownPage + 1} / {pages}</span>
            <Button size="sm" disabled={shownPage >= pages - 1} onClick={() => setPage(shownPage + 1)}>Next</Button>
          </span>
        </div>
      </Card>
    </div>
  );
}
