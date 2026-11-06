"use client";
import { useMemo, useState } from "react";
import { C, inputStyle } from "@/components/admin/kit";
import { EMPTY_FILTERS, FLAG_TEXT, BEDS_ORDER, bedsLabel, type Filters, type Obs, type Flag } from "@/lib/market/core";
import { Pill, toggle } from "./shared";

type ListKey = "area" | "type" | "beds" | "baths" | "parking" | "laundry" | "furnished" | "pets" | "util" | "queries" | "flags";

const LABELS: Record<ListKey, string> = {
  area: "Area", type: "Property type", beds: "Bedrooms", baths: "Bathrooms", parking: "Parking", laundry: "Laundry",
  furnished: "Furnished", pets: "Pets (as advertised)", util: "Utilities included", queries: "Found by searching for", flags: "Problems in the ad",
};

function valueLabel(key: ListKey, v: string) {
  if (key === "area" && v === "__none") return "Area not stated";
  if (key === "beds") return bedsLabel(v);
  if (key === "flags") return v === "__clean" ? "No issues" : FLAG_TEXT[v as Flag] ?? v;
  if (v === "unknown") return "Not stated";
  return v;
}

function optionsFor(rows: Obs[], key: ListKey): { v: string; n: number }[] {
  const counts = new Map<string, number>();
  const add = (v: string) => counts.set(v, (counts.get(v) ?? 0) + 1);
  for (const o of rows) {
    const n = o.norm;
    if (key === "area") add(n.area ?? "__none");
    else if (key === "type") add(n.type);
    else if (key === "beds") add(n.beds_cat);
    else if (key === "baths") add(n.baths == null ? "unknown" : String(n.baths));
    else if (key === "parking") add(n.parking ?? "unknown");
    else if (key === "laundry") add(n.laundry ?? "unknown");
    else if (key === "furnished") add(n.furnished ?? "unknown");
    else if (key === "pets") add(n.pets ?? "unknown");
    else if (key === "util") (n.utilities.length ? n.utilities : ["unknown"]).forEach(add);
    else if (key === "queries") n.queries.forEach(add);
    else if (key === "flags") (o.flags.length ? o.flags : ["__clean"]).forEach(add);
  }
  const list = [...counts].map(([v, n]) => ({ v, n }));
  if (key === "beds") return list.sort((a, b) => BEDS_ORDER.indexOf(a.v) - BEDS_ORDER.indexOf(b.v));
  if (key === "baths") return list.sort((a, b) => (a.v === "unknown" ? 1 : b.v === "unknown" ? -1 : Number(a.v) - Number(b.v)));
  return list.sort((a, b) => b.n - a.n || a.v.localeCompare(b.v));
}

export default function FilterBar({ all, filters, setFilters, counts }: {
  all: Obs[]; filters: Filters; setFilters: (f: Filters) => void;
  counts: { matched: number; used: number; excluded: number };
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(filters.q);
  const opts = useMemo(() => Object.fromEntries((Object.keys(LABELS) as ListKey[]).map((k) => [k, optionsFor(all, k)])) as Record<ListKey, { v: string; n: number }[]>, [all]);
  const set = (patch: Partial<Filters>) => setFilters({ ...filters, ...patch });

  const chips: { label: string; clear: () => void }[] = [];
  (Object.keys(LABELS) as ListKey[]).forEach((k) => filters[k].forEach((v) => chips.push({ label: `${LABELS[k]}: ${valueLabel(k, v)}`, clear: () => set({ [k]: filters[k].filter((x) => x !== v) } as Partial<Filters>) })));
  if (filters.rentMin != null || filters.rentMax != null) chips.push({ label: `Rent ${filters.rentMin ?? 0}–${filters.rentMax ?? "any"}`, clear: () => set({ rentMin: null, rentMax: null }) });
  if (filters.sqftMin != null || filters.sqftMax != null) chips.push({ label: `Size ${filters.sqftMin ?? 0}–${filters.sqftMax ?? "any"} sq ft${filters.sqftUnknown ? " (+ not stated)" : ""}`, clear: () => set({ sqftMin: null, sqftMax: null }) });
  if (filters.postedFrom || filters.postedTo) chips.push({ label: `Posted ${filters.postedFrom ?? "…"} to ${filters.postedTo ?? "…"}`, clear: () => set({ postedFrom: null, postedTo: null }) });
  if (filters.avail) chips.push({ label: `Availability mentions "${filters.avail}"`, clear: () => set({ avail: "" }) });
  if (filters.q) chips.push({ label: `Search: "${filters.q}"`, clear: () => { setSearch(""); set({ q: "" }); } });
  if (!filters.excluded) chips.push({ label: "Only ads counted in the prices", clear: () => set({ excluded: true }) });
  if (filters.outliers) chips.push({ label: "Odd prices left out", clear: () => set({ outliers: false }) });

  return (
    <div style={{ background: C.surface, border: "1px solid #D8D2C8", borderRadius: 16, padding: 18, marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div role="group" aria-label="Market" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Pill active={filters.market === "whole"} onClick={() => set({ market: "whole" })}>Whole homes</Pill>
          <Pill active={filters.market === "room"} onClick={() => set({ market: "room" })}>Single rooms</Pill>
          <Pill active={filters.market === "all"} onClick={() => set({ market: "all" })}>Everything</Pill>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); set({ q: search }); }} style={{ flex: "1 1 220px", display: "flex", gap: 6 }}>
          <input aria-label="Search listings" placeholder="Search a street, area or word in the ad" value={search} onChange={(e) => setSearch(e.target.value)}
            onBlur={() => search !== filters.q && set({ q: search })} style={{ ...inputStyle, padding: "10px 14px", fontSize: 16, borderRadius: 10, background: "#F7F5F2", borderColor: "#D8D2C8" }} />
        </form>
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}
          style={{ border: "2px solid #D8D2C8", background: open ? C.greyBg : C.surface, borderRadius: 12, padding: "8px 14px", fontWeight: 600, fontSize: 14, color: C.navy, cursor: "pointer", minHeight: 44 }}>
          {open ? "Done" : "More choices"}
        </button>
      </div>

      {chips.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
          {chips.map((c) => (
            <button key={c.label} type="button" onClick={c.clear} aria-label={`Remove ${c.label}`}
              style={{ background: C.greyBg, border: `1px solid ${C.border}`, borderRadius: 999, padding: "4px 10px", fontSize: 13, color: C.navy, cursor: "pointer" }}>
              {c.label} ✕
            </button>
          ))}
          <button type="button" onClick={() => { setSearch(""); setFilters({ ...EMPTY_FILTERS, market: filters.market }); }}
            style={{ background: "none", border: "none", color: C.muted, fontSize: 13, textDecoration: "underline", cursor: "pointer" }}>Clear all</button>
        </div>
      )}

      <div style={{ fontSize: 13, color: C.muted, marginTop: 10 }} aria-live="polite">
        Showing <strong style={{ color: C.navy }}>{counts.matched}</strong> ads · <strong style={{ color: C.navy }}>{counts.used}</strong> counted in the prices{counts.excluded ? <> · <strong style={{ color: C.navy }}>{counts.excluded}</strong> left out because something looks off</> : null}
      </div>

      {open && (
        <div key={[filters.rentMin, filters.rentMax, filters.sqftMin, filters.sqftMax, filters.postedFrom, filters.postedTo, filters.avail].join("|")} style={{ marginTop: 14, borderTop: `1px solid ${C.border}`, paddingTop: 14, display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          {(Object.keys(LABELS) as ListKey[]).map((k) => (
            <fieldset key={k} style={{ border: "none", margin: 0, padding: 0, minWidth: 0 }}>
              <legend style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 6 }}>{LABELS[k]}</legend>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 150, overflowY: "auto" }}>
                {opts[k].map((o) => (
                  <Pill key={o.v} active={filters[k].includes(o.v)} onClick={() => set({ [k]: toggle(filters[k], o.v) } as Partial<Filters>)}>
                    {valueLabel(k, o.v)} <span style={{ opacity: 0.65, fontWeight: 400 }}>{o.n}</span>
                  </Pill>
                ))}
              </div>
            </fieldset>
          ))}
          <fieldset style={{ border: "none", margin: 0, padding: 0 }}>
            <legend style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Asking rent ($/month)</legend>
            <div style={{ display: "flex", gap: 6 }}>
              <input aria-label="Minimum rent" type="number" placeholder="Min" defaultValue={filters.rentMin ?? ""} onBlur={(e) => set({ rentMin: e.target.value ? Number(e.target.value) : null })} style={{ ...inputStyle, padding: "6px 10px" }} />
              <input aria-label="Maximum rent" type="number" placeholder="Max" defaultValue={filters.rentMax ?? ""} onBlur={(e) => set({ rentMax: e.target.value ? Number(e.target.value) : null })} style={{ ...inputStyle, padding: "6px 10px" }} />
            </div>
          </fieldset>
          <fieldset style={{ border: "none", margin: 0, padding: 0 }}>
            <legend style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Size (sq ft, where stated)</legend>
            <div style={{ display: "flex", gap: 6 }}>
              <input aria-label="Minimum square feet" type="number" placeholder="Min" defaultValue={filters.sqftMin ?? ""} onBlur={(e) => set({ sqftMin: e.target.value ? Number(e.target.value) : null })} style={{ ...inputStyle, padding: "6px 10px" }} />
              <input aria-label="Maximum square feet" type="number" placeholder="Max" defaultValue={filters.sqftMax ?? ""} onBlur={(e) => set({ sqftMax: e.target.value ? Number(e.target.value) : null })} style={{ ...inputStyle, padding: "6px 10px" }} />
            </div>
            <label style={{ fontSize: 13, display: "flex", gap: 6, marginTop: 6, color: C.text }}>
              <input type="checkbox" checked={filters.sqftUnknown} onChange={(e) => set({ sqftUnknown: e.target.checked })} /> Include listings with no size stated
            </label>
          </fieldset>
          <fieldset style={{ border: "none", margin: 0, padding: 0 }}>
            <legend style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Posted on Marketplace</legend>
            <div style={{ display: "flex", gap: 6 }}>
              <input aria-label="Posted from" type="date" defaultValue={filters.postedFrom ?? ""} onBlur={(e) => set({ postedFrom: e.target.value || null })} style={{ ...inputStyle, padding: "6px 8px" }} />
              <input aria-label="Posted to" type="date" defaultValue={filters.postedTo ?? ""} onBlur={(e) => set({ postedTo: e.target.value || null })} style={{ ...inputStyle, padding: "6px 8px" }} />
            </div>
          </fieldset>
          <fieldset style={{ border: "none", margin: 0, padding: 0 }}>
            <legend style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Availability text contains</legend>
            <input aria-label="Availability text" placeholder="e.g. dec, immediately" defaultValue={filters.avail} onBlur={(e) => set({ avail: e.target.value.trim() })} style={{ ...inputStyle, padding: "6px 10px" }} />
          </fieldset>
          <fieldset style={{ border: "none", margin: 0, padding: 0 }}>
            <legend style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Counting</legend>
            <label style={{ fontSize: 13, display: "flex", gap: 6, color: C.text, marginBottom: 6 }}>
              <input type="checkbox" checked={filters.excluded} onChange={(e) => set({ excluded: e.target.checked })} /> Also show ads left out of the prices
            </label>
            <label style={{ fontSize: 13, display: "flex", gap: 6, color: C.text }}>
              <input type="checkbox" checked={filters.outliers} onChange={(e) => set({ outliers: e.target.checked })} /> Ignore very cheap or very expensive outliers
            </label>
          </fieldset>
        </div>
      )}
    </div>
  );
}
