"use client";
import { useEffect, useMemo, useState } from "react";
import { C, Button, inputStyle, Loading } from "@/components/admin/kit";
import { BEDS_ORDER, bedsLabel, areaLabel, cad, stats, percentileOf, csvCell, type Obs } from "@/lib/market/core";
import { Panel, Note, Pill, SampleTag, tabular, download, toggle, fmtDate, SERIES, type Ctx } from "./shared";

interface Config {
  type: string[]; beds: string[]; area: string[]; basis: "whole" | "room";
  laundry?: string[]; furnished?: string[]; sqftMin?: number | null; sqftMax?: number | null;
  warnings?: string[]; excluded?: { id: string; reason: string }[];
}
interface Prop { id: string; label: string; rent_low: number | null; rent_high: number | null; segment: string | null; source: "summary" | "manual"; source_ref: { row?: number; cells?: string[] } | null; config: Config; notes: string | null }

const COMPATIBLE: Record<string, string[]> = { apartment: ["apartment", "condo"], condo: ["condo", "apartment"], house: ["house", "townhouse"], townhouse: ["townhouse", "house"], basement: ["basement", "apartment"] };

export default function MyProperties({ ctx }: { ctx: Ctx }) {
  const [props, setProps] = useState<Prop[] | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const load = () => fetch("/api/admin/market/watchlist").then((r) => r.json()).then((d) => {
    setProps(d.properties ?? []);
    setSel((s) => s ?? d.properties?.[0]?.id ?? null);
  });
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, []);

  async function save(p: Prop, patch: Partial<Prop>) {
    setProps((list) => list?.map((x) => (x.id === p.id ? { ...x, ...patch } : x)) ?? null);
    await fetch("/api/admin/market/watchlist", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: p.id, ...patch }) });
  }

  if (!props) return <Loading />;
  const p = props.find((x) => x.id === sel) ?? null;

  return (
    <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", alignItems: "start" }}>
      <Panel title="Your properties" sub="Imported from the Sheet's Prospera rows, plus any you add." style={{ gridColumn: "span 1" }}>
        <div style={{ display: "grid", gap: 6 }}>
          {props.map((x) => (
            <button key={x.id} type="button" onClick={() => setSel(x.id)} aria-pressed={x.id === sel}
              style={{ textAlign: "left", border: `1px solid ${x.id === sel ? C.navy : C.border}`, background: x.id === sel ? C.greyBg : C.surface, borderRadius: 10, padding: "10px 12px", cursor: "pointer", font: "inherit" }}>
              <div style={{ fontWeight: 600, color: C.navy, fontSize: 14 }}>{x.label}</div>
              <div style={{ fontSize: 13, color: C.muted, ...tabular }}>{rentText(x)}{x.config.warnings?.length ? " · needs a check" : ""}</div>
            </button>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          {adding ? <AddForm onDone={(id) => { setAdding(false); if (id) { setSel(id); load(); } }} /> : <Button size="sm" onClick={() => setAdding(true)}>Add a property</Button>}
        </div>
      </Panel>
      <div style={{ gridColumn: "span 2", minWidth: 0 }}>
        {p ? <Comparison key={p.id} p={p} ctx={ctx} onSave={(patch) => save(p, patch)} /> : <Panel><p>Pick a property.</p></Panel>}
      </div>
    </div>
  );
}

const rentText = (x: Prop) => (x.rent_low == null ? "No rent" : x.rent_high != null && x.rent_high !== x.rent_low ? `${cad(x.rent_low)}–${cad(x.rent_high)}` : cad(x.rent_low));

function AddForm({ onDone }: { onDone: (id: string | null) => void }) {
  const [label, setLabel] = useState("");
  const [rent, setRent] = useState("");
  const [err, setErr] = useState("");
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <input aria-label="Property name" placeholder="e.g. 12 Oak St, 2-bed apartment" value={label} onChange={(e) => setLabel(e.target.value)} style={inputStyle} />
      <input aria-label="Asking rent" type="number" placeholder="Asking rent" value={rent} onChange={(e) => setRent(e.target.value)} style={inputStyle} />
      {err && <div style={{ color: C.red, fontSize: 13 }}>{err}</div>}
      <div style={{ display: "flex", gap: 8 }}>
        <Button size="sm" variant="primary" onClick={async () => {
          const res = await fetch("/api/admin/market/watchlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ label, rent_low: rent }) });
          const d = await res.json();
          if (!res.ok) setErr(d.error ?? "Couldn't add it."); else onDone(d.property.id);
        }}>Add</Button>
        <Button size="sm" variant="ghost" onClick={() => onDone(null)}>Cancel</Button>
      </div>
    </div>
  );
}

function Comparison({ p, ctx, onSave }: { p: Prop; ctx: Ctx; onSave: (patch: Partial<Prop>) => void }) {
  const cfg: Config = { laundry: [], furnished: [], sqftMin: null, sqftMax: null, warnings: [], excluded: [], ...p.config };
  const [notes, setNotes] = useState(p.notes ?? "");
  const setCfg = (patch: Partial<Config>) => onSave({ config: { ...cfg, ...patch } });
  const excludedIds = new Set((cfg.excluded ?? []).map((x) => x.id));

  const pool = ctx.obs.filter((o) => o.cohort === cfg.basis);
  const options = (get: (o: Obs) => string) => [...new Set(pool.map(get))].sort();
  const matches = (o: Obs) =>
    (!cfg.type.length || cfg.type.includes(o.norm.type)) &&
    (!cfg.beds.length || cfg.beds.includes(o.norm.beds_cat)) &&
    (!cfg.area.length || cfg.area.includes(o.norm.area ?? "__none")) &&
    (!cfg.laundry?.length || cfg.laundry.includes(o.norm.laundry ?? "unknown")) &&
    (!cfg.furnished?.length || cfg.furnished.includes(o.norm.furnished ?? "unknown")) &&
    (cfg.sqftMin == null || (o.norm.sqft != null && o.norm.sqft >= cfg.sqftMin)) &&
    (cfg.sqftMax == null || (o.norm.sqft != null && o.norm.sqft <= cfg.sqftMax));
  const comps = useMemo(() => pool.filter(matches).sort((a, b) => a.norm.price! - b.norm.price!), [pool, cfg]); // eslint-disable-line react-hooks/exhaustive-deps
  const used = comps.filter((o) => !excludedIds.has(o.listing_id));
  const s = stats(used.map((o) => o.norm.price!));
  const prices = used.map((o) => o.norm.price!);
  const subjects = [p.rent_low, p.rent_high !== p.rent_low ? p.rent_high : null].filter((v): v is number => v != null);
  const small = s.n < 5;
  const rooming = /rooming/i.test(p.label);

  function exportCsv() {
    const head = ["subject", "subject_rent", "listing_id", "title", "price", "price_basis", "type", "bedrooms", "bathrooms", "area", "sqft", "url", "scan_date", "excluded", "exclusion_reason"];
    const lines = [head.join(",")];
    for (const o of comps) {
      const ex = cfg.excluded?.find((x) => x.id === o.listing_id);
      lines.push([p.label, rentText(p), o.listing_id, o.norm.title, o.norm.price, o.norm.price_basis, o.norm.type, o.norm.beds_cat, o.norm.baths, o.norm.area ?? "", o.norm.sqft, o.norm.url ?? "", ctx.snapshot.scan_date ?? "", ex ? "yes" : "no", ex?.reason ?? ""].map(csvCell).join(","));
    }
    download(`comparables-${p.label.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.csv`, lines.join("\n"));
  }

  return (
    <div style={{ display: "grid", gap: 16 }} className="market-print">
      <Panel title={p.label} sub={<>Your asking rent: <strong style={tabular}>{rentText(p)}</strong>{p.source === "summary" && p.segment ? ` · Sheet compared it to: ${p.segment}` : ""} · Scan {fmtDate(ctx.snapshot.scan_date)}</>}
        right={<div style={{ display: "flex", gap: 8 }}><Button size="sm" onClick={exportCsv}>Export</Button><Button size="sm" onClick={() => window.print()}>Print</Button></div>}>
        <div style={{ display: "grid", gap: 8 }}>
          {(cfg.warnings ?? []).map((w) => <Note key={w} tone="amber">{w}</Note>)}
          {rooming && <Note tone="amber">A whole-house rent divided by the number of rooms isn&apos;t comparable to individually advertised room rents. Compare the whole-house rent with houses, or set up rooms separately.</Note>}
        </div>

        <h4 style={{ margin: "14px 0 8px", fontSize: 14, color: C.navy }}>Compare against</h4>
        <div style={{ display: "grid", gap: 10 }}>
          <Row label="Market">
            <Pill active={cfg.basis === "whole"} onClick={() => setCfg({ basis: "whole" })}>Whole units</Pill>
            <Pill active={cfg.basis === "room"} onClick={() => setCfg({ basis: "room" })}>Per room</Pill>
          </Row>
          <Row label="Type">{options((o) => o.norm.type).map((t) => <Pill key={t} active={cfg.type.includes(t)} onClick={() => setCfg({ type: toggle(cfg.type, t) })}>{t}</Pill>)}</Row>
          <Row label="Bedrooms">{BEDS_ORDER.filter((b) => pool.some((o) => o.norm.beds_cat === b)).map((b) => <Pill key={b} active={cfg.beds.includes(b)} onClick={() => setCfg({ beds: toggle(cfg.beds, b) })}>{bedsLabel(b)}</Pill>)}</Row>
          <Row label="Area">{options((o) => o.norm.area ?? "__none").map((a) => <Pill key={a} active={cfg.area.includes(a)} onClick={() => setCfg({ area: toggle(cfg.area, a) })}>{a === "__none" ? "Not stated" : a}</Pill>)}</Row>
          <Row label="Laundry">{options((o) => o.norm.laundry ?? "unknown").map((v) => <Pill key={v} active={!!cfg.laundry?.includes(v)} onClick={() => setCfg({ laundry: toggle(cfg.laundry ?? [], v) })}>{v === "unknown" ? "Not stated" : v}</Pill>)}</Row>
          <Row label="Furnished">{options((o) => o.norm.furnished ?? "unknown").map((v) => <Pill key={v} active={!!cfg.furnished?.includes(v)} onClick={() => setCfg({ furnished: toggle(cfg.furnished ?? [], v) })}>{v === "unknown" ? "Not stated" : v}</Pill>)}</Row>
          <Row label="Size (sq ft)">
            <input aria-label="Minimum size" type="number" placeholder="Min" defaultValue={cfg.sqftMin ?? ""} onBlur={(e) => setCfg({ sqftMin: e.target.value ? Number(e.target.value) : null })} style={{ ...inputStyle, width: 100, padding: "4px 8px" }} />
            <input aria-label="Maximum size" type="number" placeholder="Max" defaultValue={cfg.sqftMax ?? ""} onBlur={(e) => setCfg({ sqftMax: e.target.value ? Number(e.target.value) : null })} style={{ ...inputStyle, width: 100, padding: "4px 8px" }} />
            <span style={{ fontSize: 12, color: C.muted }}>Setting a size drops ads that don&apos;t state one.</span>
          </Row>
        </div>
        <p style={{ fontSize: 13, color: C.muted, margin: "10px 0 0" }}>
          Rules: same price basis; {cfg.type.length ? `type ${cfg.type.join(" or ")}` : "any type"}; {cfg.beds.length ? cfg.beds.map(bedsLabel).join(" or ") : "any bedrooms"}; {cfg.area.length ? cfg.area.map((a) => (a === "__none" ? "area not stated" : a)).join(" or ") : "any area (no distance matching: locations aren't mapped)"}. Unknown values only match when you select &quot;Not stated&quot;.
        </p>

        {small && (
          <div style={{ marginTop: 12 }}>
            <Note tone="amber">
              Only {s.n} comparable{s.n === 1 ? "" : "s"}. Widen on purpose:{" "}
              {cfg.area.length > 0 && <Pill onClick={() => setCfg({ area: [] })}>Any area</Pill>}{" "}
              {cfg.type.length > 0 && COMPATIBLE[cfg.type[0]] && <Pill onClick={() => setCfg({ type: [...new Set([...cfg.type, ...COMPATIBLE[cfg.type[0]]])] })}>Add compatible types</Pill>}{" "}
              {(cfg.laundry?.length || cfg.furnished?.length || cfg.sqftMin != null || cfg.sqftMax != null) ? <Pill onClick={() => setCfg({ laundry: [], furnished: [], sqftMin: null, sqftMax: null })}>Drop amenity and size rules</Pill> : null}
            </Note>
          </div>
        )}
      </Panel>

      <Panel title="Where your rent sits" sub={`Asking rents of ${s.n} comparable ads in this scan${(cfg.excluded?.length ?? 0) ? `, after ${cfg.excluded!.length} you excluded` : ""}.`}>
        {!s.n ? <p style={{ color: C.faint }}>No comparables with these rules.</p> : (
          <>
            <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", ...tabular }}>
              <Fig label="Comparables" value={<>{s.n}<SampleTag n={s.n} /></>} />
              <Fig label="Median" value={cad(s.median)} />
              <Fig label="Middle 50%" value={`${cad(s.p25)}–${cad(s.p75)}`} />
              <Fig label="Lowest – highest" value={`${cad(s.min)}–${cad(s.max)}`} />
            </div>
            <Strip prices={prices} subjects={subjects} />
            <div style={{ display: "grid", gap: 4, marginTop: 10, fontSize: 14, ...tabular }}>
              {subjects.map((v) => {
                const diff = s.median != null ? v - s.median : null;
                const pctl = percentileOf(v, prices);
                return (
                  <div key={v}>
                    <strong>{cad(v)}</strong>: {diff == null ? "—" : diff === 0 ? "at the median" : `${cad(Math.abs(diff))} (${Math.abs((diff / s.median!) * 100).toFixed(1)}%) ${diff > 0 ? "above" : "below"} the median asking rent`} in this sample
                    {s.n >= 5 ? <>, around the {Math.round(pctl!)}th percentile.</> : ". Too few comparables for a percentile."}
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: 12, color: C.muted, margin: "8px 0 0" }}>These are other ads&apos; asking rents, not signed leases or an appraisal. No adjustment is made for utilities, furnishing or condition.</p>
          </>
        )}
      </Panel>

      <Panel title={`Comparable ads (${comps.length})`} sub="Sorted by asking rent. Exclude any that aren't really comparable (for example your own ad); the reason is saved.">
        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
          {comps.map((o) => {
            const ex = cfg.excluded?.find((x) => x.id === o.listing_id);
            const missing = [o.norm.area ? null : "area", o.norm.sqft ? null : "size", o.norm.laundry ? null : "laundry", o.norm.utilities.length ? null : "utilities"].filter(Boolean);
            return (
              <div key={o.listing_id} style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: 12, opacity: ex ? 0.55 : 1, fontSize: 14, background: C.surface }}>
                <button type="button" onClick={() => ctx.openListing(o.listing_id)} style={{ background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer", font: "inherit", color: C.navy, fontWeight: 600 }}>{o.norm.title || o.listing_id}</button>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, ...tabular }}>{cad(o.norm.price)}</div>
                <div style={{ color: C.muted, fontSize: 13 }}>{o.norm.type} · {bedsLabel(o.norm.beds_cat)}{o.norm.baths != null ? ` · ${o.norm.baths} bath` : ""} · {areaLabel(o.norm.area)}</div>
                {missing.length > 0 && <div style={{ color: C.faint, fontSize: 12 }}>Doesn&apos;t say: {missing.join(", ")}</div>}
                {ex && <div style={{ color: C.amber, fontSize: 12 }}>Excluded: {ex.reason}</div>}
                <div style={{ display: "flex", gap: 10, marginTop: 6, fontSize: 13 }}>
                  {o.norm.url && <a href={o.norm.url} target="_blank" rel="noopener noreferrer" style={{ color: C.navy }}>Open ↗</a>}
                  <button type="button" onClick={() => {
                    if (ex) setCfg({ excluded: cfg.excluded!.filter((x) => x.id !== o.listing_id) });
                    else { const reason = prompt("Why isn't this comparable?"); if (reason) setCfg({ excluded: [...(cfg.excluded ?? []), { id: o.listing_id, reason }] }); }
                  }} style={{ background: "none", border: "none", padding: 0, color: C.navy, textDecoration: "underline", cursor: "pointer", font: "inherit" }}>{ex ? "Include again" : "Exclude"}</button>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title="Notes">
        <textarea aria-label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => notes !== (p.notes ?? "") && onSave({ notes })} rows={4} style={{ ...inputStyle, width: "100%", resize: "vertical" }} placeholder="Anything to remember about pricing this one" />
        {p.source === "summary" && p.source_ref?.cells && <p style={{ fontSize: 12, color: C.muted, margin: "8px 0 0" }}>From Summary row {p.source_ref.row}: {p.source_ref.cells.filter(Boolean).join(" | ")}</p>}
      </Panel>
      <style>{`@media print { body * { visibility: hidden; } .market-print, .market-print * { visibility: visible; } .market-print { position: absolute; left: 0; top: 0; width: 100%; } button { display: none !important; } }`}</style>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <span style={{ fontSize: 13, color: C.muted, width: 90, flexShrink: 0 }}>{label}</span>
      {children}
    </div>
  );
}

function Fig({ label, value }: { label: string; value: React.ReactNode }) {
  return <div style={{ background: C.greyBg, borderRadius: 10, padding: "10px 12px" }}><div style={{ fontSize: 13, color: C.muted }}>{label}</div><div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>{value}</div></div>;
}

/** Every comparable as a dot on a line, with your rent marked. */
function Strip({ prices, subjects }: { prices: number[]; subjects: number[] }) {
  const all = [...prices, ...subjects];
  const lo = Math.min(...all), hi = Math.max(...all);
  const x = (v: number) => (hi === lo ? 50 : 4 + ((v - lo) / (hi - lo)) * 92);
  const s = stats(prices);
  return (
    <svg viewBox="0 0 100 26" style={{ width: "100%", height: 80, marginTop: 14 }} role="img" aria-label="Comparable rents with your rent marked">
      {s.p25 != null && <rect x={x(s.p25)} y={8} width={Math.max(0.5, x(s.p75!) - x(s.p25))} height={8} fill={C.greyBg} />}
      <line x1={4} x2={96} y1={12} y2={12} stroke={C.borderStrong} strokeWidth={0.3} />
      {prices.map((v, i) => <circle key={i} cx={x(v)} cy={12} r={0.9} fill={SERIES[1]} opacity={0.75} />)}
      {s.median != null && <line x1={x(s.median)} x2={x(s.median)} y1={6} y2={18} stroke={C.navy} strokeWidth={0.4} />}
      {subjects.map((v) => (
        <g key={v}>
          <polygon points={`${x(v) - 1.4},3 ${x(v) + 1.4},3 ${x(v)},6.5`} fill={C.burgundy} />
          <text x={x(v)} y={24} fontSize={2.6} textAnchor="middle" fill={C.navy}>Yours {cad(v)}</text>
        </g>
      ))}
      <text x={4} y={24} fontSize={2.4} fill={C.muted}>{cad(lo)}</text>
      <text x={96} y={24} fontSize={2.4} textAnchor="end" fill={C.muted}>{cad(hi)}</text>
    </svg>
  );
}
