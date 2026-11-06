"use client";
import { useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid, Cell, Legend } from "recharts";
import { C } from "@/components/admin/kit";
import {
  BEDS_ORDER, bedsLabel, areaLabel, cad, stats, FLAG_TEXT, BLOCKING_FLAGS, type CohortResult, type Obs, type Flag,
} from "@/lib/market/core";
import type { diffScans } from "@/lib/market/compare";
import { Panel, Note, Kpi, StatsLine, SampleTag, SERIES, tabular, fmtDate, Pill, th, tdc, TableWrap, type Ctx } from "./shared";

export interface CompareInfo {
  label: string;
  snapDate: string | null;
  reason: string | null;           // why no comparison is available
  warnings: string[];               // coverage differences
  diff: ReturnType<typeof diffScans> | null;
}

export default function Overview({ ctx, res, compare, sourceMedian }: {
  ctx: Ctx; res: CohortResult; compare: CompareInfo;
  sourceMedian: { n: number | null; median: number | null } | null;
}) {
  const { filters, drill, snapshot } = ctx;
  const room = filters.market === "room";
  const used = room ? res.room : res.whole;
  const s = room ? res.roomStats : res.wholeStats;
  const review = res.matched.filter((o) => o.cohort === "review" || o.cohort === "none" || o.flags.some((f) => BLOCKING_FLAGS.includes(f)));
  const comparable = compare.diff && !compare.warnings.length;
  const reviewFlags = [...new Set(review.flatMap((o) => o.flags))];

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "grid", gap: 8 }}>
        {ctx.snapshots.length < 2 && <Note>History starts {fmtDate(snapshot.scan_date)}. Changes and trends appear after the next scan is imported.</Note>}
        {res.excluded.some((o) => o.flags.includes("room_whole_conflict")) && filters.market !== "room" && (
          <Note tone="amber">
            {res.matched.filter((o) => o.flags.includes("room_whole_conflict")).length} ads are marked as rooms but priced as whole units. They&apos;re kept out of whole-unit rents until reviewed.{" "}
            <button type="button" onClick={() => drill({ flags: ["room_whole_conflict"], excluded: true })} style={linkBtn}>Review them</button>
          </Note>
        )}
        {filters.market === "all" && <Note>Rent charts below use whole units. Room rents are summarised separately and never mixed into the same median.</Note>}
      </div>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
        <Kpi label="Observed listings" value={res.matched.length} sub="Ads seen in this scan matching your filters" onClick={() => drill({})} />
        <Kpi label={room ? "Median room rent" : "Median asking rent"} value={cad(s.median)}
          sub={<>n={s.n}<SampleTag n={s.n} />{filters.market === "all" && res.roomStats.n ? ` · rooms ${cad(res.roomStats.median)} (n=${res.roomStats.n})` : ""}</>}
          onClick={() => drill({ excluded: false })} />
        <Kpi label="Middle 50% asking range" value={s.n ? `${cad(s.p25)}–${cad(s.p75)}` : "—"} sub={s.n ? `Range ${cad(s.min)}–${cad(s.max)}` : "No eligible prices"} onClick={() => drill({ excluded: false })} />
        <Kpi label="First seen since last scan" unavailable={!comparable}
          value={comparable ? compare.diff!.firstSeen.length : "Not yet"}
          sub={comparable ? `vs ${fmtDate(compare.snapDate)}` : compare.diff ? "The scans were collected differently" : "Needs a second scan to compare with"} onClick={comparable ? () => ctx.setTab("trends") : undefined} />
        <Kpi label="Price reductions" unavailable={!comparable}
          value={comparable ? `${compare.diff!.reduced.length} of ${compare.diff!.pairs.length}` : "Not yet"}
          sub={comparable ? "Same ads in both scans" : compare.diff ? "The scans were collected differently" : "Needs a second scan to compare with"} onClick={comparable ? () => ctx.setTab("trends") : undefined} />
        <Kpi label="Listings needing review" value={review.length}
          sub={reviewFlags.length ? reviewFlags.slice(0, 2).map((f) => FLAG_TEXT[f as Flag]).join("; ") : "Nothing blocking"}
          onClick={() => drill({ flags: reviewFlags.filter((f) => BLOCKING_FLAGS.includes(f as Flag)), excluded: true })} />
      </div>

      {sourceMedian?.median != null && !room && (
        <Note>
          Your Sheet&apos;s Summary reports a whole-unit median of {cad(sourceMedian.median)} across {sourceMedian.n} ads. This dashboard calculates {cad(res.wholeStats.median)} across {res.wholeStats.n} with current filters, because ads marked as rooms are kept out.{" "}
          <button type="button" onClick={() => ctx.setTab("data")} style={linkBtn}>See the reconciliation</button>
        </Note>
      )}

      <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 440px), 1fr))" }}>
        <RentHistogram rows={used} room={room} onBin={(lo, hi) => drill({ rentMin: lo, rentMax: hi - 1, excluded: false })} />
        <BedsByType rows={res.matched} onPick={(beds, type) => drill({ beds: [beds], type: type ? [type] : [] })} />
      </div>

      <MedianByArea rows={used} room={room} onPick={(area) => drill({ area: [area ?? "__none"] })} />
      <AreaBedsMatrix rows={used} all={res.matched} onPick={(area, beds) => drill({ area: [area ?? "__none"], beds: [beds] })} />

      <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 440px), 1fr))" }}>
        <Panel title="What changed" sub={compare.diff ? `This scan vs ${fmtDate(compare.snapDate)}` : undefined}>
          {!compare.diff ? (
            <p style={{ margin: 0, color: C.muted, fontSize: 14 }}>{compare.reason ?? "No comparison available."} Once two scans exist, this lists new ads, ads not seen again and price changes.</p>
          ) : (
            <div style={{ display: "grid", gap: 8, fontSize: 14 }}>
              {compare.warnings.map((w) => <Note key={w} tone="amber">{w} Change counts are not directly comparable.</Note>)}
              <div>{compare.diff.firstSeen.length} ads first seen in this scan.</div>
              <div>{compare.diff.notSeen.length} ads from the earlier scan were not seen in this one (not proof they were rented).</div>
              <div>{compare.diff.reduced.length} reduced their asking rent, {compare.diff.increased.length} increased, {compare.diff.unchanged.length} unchanged.</div>
              <button type="button" onClick={() => ctx.setTab("trends")} style={{ ...linkBtn, justifySelf: "start" }}>Open Trends &amp; Changes</button>
            </div>
          )}
        </Panel>
        <Panel title="Data quality" sub="Issues found in the source data for the current filters">
          {reviewFlags.length === 0 && res.matched.every((o) => !o.flags.length) ? (
            <p style={{ margin: 0, color: C.muted, fontSize: 14 }}>No issues in these listings.</p>
          ) : (
            <div style={{ display: "grid", gap: 6 }}>
              {[...new Set(res.matched.flatMap((o) => o.flags))].map((f) => {
                const n = res.matched.filter((o) => o.flags.includes(f)).length;
                return (
                  <button key={f} type="button" onClick={() => drill({ flags: [f], excluded: true })}
                    style={{ display: "flex", justifyContent: "space-between", gap: 10, background: BLOCKING_FLAGS.includes(f) ? C.amberBg : C.greyBg, border: "none", borderRadius: 8, padding: "8px 12px", cursor: "pointer", textAlign: "left", fontSize: 14, color: C.text }}>
                    <span>{FLAG_TEXT[f]}{BLOCKING_FLAGS.includes(f) ? " (kept out of rents)" : ""}</span>
                    <strong style={tabular}>{n}</strong>
                  </button>
                );
              })}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

export const linkBtn: React.CSSProperties = { background: "none", border: "none", padding: 0, color: C.navy, fontWeight: 600, textDecoration: "underline", cursor: "pointer", font: "inherit" };

function RentHistogram({ rows, room, onBin }: { rows: Obs[]; room: boolean; onBin: (lo: number, hi: number) => void }) {
  const step = room ? 100 : 250;
  const s = stats(rows.map((o) => o.norm.price!));
  const bins = useMemo(() => {
    if (!rows.length) return [];
    const lo = Math.floor(s.min! / step) * step, hi = Math.floor(s.max! / step) * step;
    const out: { lo: number; hi: number; label: string; n: number }[] = [];
    for (let b = lo; b <= hi; b += step) out.push({ lo: b, hi: b + step, label: `$${(b / 1000).toFixed(b % 1000 ? 2 : 0)}k`.replace(".00k", "k"), n: 0 });
    for (const o of rows) out[Math.floor((o.norm.price! - lo) / step)].n++;
    return out;
  }, [rows, s.min, s.max, step]);
  const idx = (v: number | null) => (v == null || !bins.length ? undefined : bins[Math.min(bins.length - 1, Math.floor((v - bins[0].lo) / step))]?.label);
  return (
    <Panel title={room ? "Room rent distribution" : "Asking-rent distribution"} sub={<StatsLine s={s} />}>
      {!rows.length ? <p style={{ color: C.faint }}>No eligible prices.</p> : (
        <>
          <div style={{ height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={bins} margin={{ top: 22, right: 8, bottom: 0, left: -18 }}>
                <CartesianGrid stroke={C.border} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.muted }} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: C.muted }} />
                <Tooltip cursor={{ fill: C.greyBg }} formatter={(v) => [`${v} listings`, "Count"]}
                  labelFormatter={(_, p) => (p?.[0] ? `${cad(p[0].payload.lo)}–${cad(p[0].payload.hi - 1)}` : "")} />
                <ReferenceLine x={idx(s.p25)} stroke={SERIES[2]} strokeDasharray="4 3" label={{ value: "P25", fontSize: 11, fill: C.muted, position: "top" }} />
                <ReferenceLine x={idx(s.median)} stroke={C.navy} strokeWidth={2} label={{ value: "Median", fontSize: 11, fill: C.navy, position: "top" }} />
                <ReferenceLine x={idx(s.p75)} stroke={SERIES[2]} strokeDasharray="4 3" label={{ value: "P75", fontSize: 11, fill: C.muted, position: "top" }} />
                <Bar dataKey="n" fill={SERIES[1]} cursor="pointer" onClick={(_, i) => onBin(bins[i].lo, bins[i].hi)} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: C.muted }}>{cad(step)} bins. Click a bar to see those listings.</p>
        </>
      )}
    </Panel>
  );
}

function BedsByType({ rows, onPick }: { rows: Obs[]; onPick: (beds: string, type?: string) => void }) {
  const types = useMemo(() => {
    const c = new Map<string, number>();
    rows.forEach((o) => c.set(o.norm.type, (c.get(o.norm.type) ?? 0) + 1));
    return [...c].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, [rows]);
  const data = BEDS_ORDER.map((b) => {
    const row: Record<string, string | number> = { beds: bedsLabel(b), key: b };
    for (const t of types) row[t] = rows.filter((o) => o.norm.beds_cat === b && o.norm.type === t).length;
    return row;
  }).filter((r) => types.some((t) => (r[t] as number) > 0));
  return (
    <Panel title="Listings by bedrooms and type" sub="Observed ads, not total market inventory. Click a bar segment to see them.">
      <div style={{ height: 240 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
            <CartesianGrid stroke={C.border} vertical={false} />
            <XAxis dataKey="beds" tick={{ fontSize: 11, fill: C.muted }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: C.muted }} />
            <Tooltip cursor={{ fill: C.greyBg }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {types.map((t, i) => (
              <Bar key={t} dataKey={t} stackId="a" fill={SERIES[i % SERIES.length]} cursor="pointer" onClick={(_, idx) => onPick(String(data[idx].key), t)} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

function MedianByArea({ rows, room, onPick }: { rows: Obs[]; room: boolean; onPick: (area: string | null) => void }) {
  const [showAll, setShowAll] = useState(false);
  const data = useMemo(() => {
    const groups = new Map<string | null, number[]>();
    rows.forEach((o) => groups.set(o.norm.area, [...(groups.get(o.norm.area) ?? []), o.norm.price!]));
    return [...groups].map(([area, prices]) => ({ area, label: areaLabel(area), ...stats(prices) }))
      .sort((a, b) => (b.n >= 3 ? 1 : 0) - (a.n >= 3 ? 1 : 0) || (b.median ?? 0) - (a.median ?? 0));
  }, [rows]);
  const shown = showAll ? data : data.filter((d) => d.n >= 3);
  return (
    <Panel title={`Median ${room ? "room" : "asking"} rent by area`} sub="Sorted by median. Areas with fewer than 3 eligible ads are hidden by default."
      right={<Pill active={showAll} onClick={() => setShowAll(!showAll)}>{showAll ? "Hide small areas" : `Show all ${data.length} areas`}</Pill>}>
      {!shown.length ? <p style={{ color: C.faint }}>No areas with enough data.</p> : (
        <div style={{ height: Math.max(160, shown.length * 30 + 30) }}>
          <ResponsiveContainer>
            <BarChart data={shown} layout="vertical" margin={{ top: 0, right: 70, bottom: 0, left: 10 }}>
              <CartesianGrid stroke={C.border} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: C.muted }} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
              <YAxis type="category" dataKey="label" width={150} tick={{ fontSize: 12, fill: C.text }} />
              <Tooltip cursor={{ fill: C.greyBg }} formatter={(v, _n, p) => [`${cad(Number(v))} (n=${p.payload.n}, middle 50% ${cad(p.payload.p25)}–${cad(p.payload.p75)})`, "Median"]} />
              <Bar dataKey="median" cursor="pointer" onClick={(_, i) => onPick(shown[i].area)}
                label={{ position: "right", fontSize: 11, fill: C.muted, formatter: (v: unknown) => cad(Number(v)) }}>
                {shown.map((d) => <Cell key={d.label} fill={d.area == null ? SERIES[3] : d.n < 5 ? SERIES[2] : SERIES[0]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <p style={{ margin: "6px 0 0", fontSize: 12, color: C.muted }}>Lighter bars: fewer than 5 ads, or area not stated. Medians from fewer than 5 ads are shaky.</p>
    </Panel>
  );
}

function AreaBedsMatrix({ rows, all, onPick }: { rows: Obs[]; all: Obs[]; onPick: (area: string | null, beds: string) => void }) {
  const [metric, setMetric] = useState<"count" | "median">("median");
  const src = metric === "count" ? all : rows;
  const areas = [...new Set(src.map((o) => o.norm.area))].sort((a, b) => (a == null ? 1 : b == null ? -1 : a.localeCompare(b)));
  const beds = BEDS_ORDER.filter((b) => src.some((o) => o.norm.beds_cat === b));
  const cell = (area: string | null, b: string) => src.filter((o) => o.norm.area === area && o.norm.beds_cat === b);
  return (
    <Panel title="Area × bedrooms" sub={metric === "count" ? "Observed ads in each cell" : "Median asking rent (n) in each cell, eligible prices only"}
      right={<div style={{ display: "flex", gap: 6 }}><Pill active={metric === "median"} onClick={() => setMetric("median")}>Median</Pill><Pill active={metric === "count"} onClick={() => setMetric("count")}>Count</Pill></div>}>
      <TableWrap maxHeight={420}>
        <table style={{ borderCollapse: "collapse", width: "100%", ...tabular }}>
          <thead><tr><th style={th}>Area</th>{beds.map((b) => <th key={b} style={{ ...th, textAlign: "right" }}>{bedsLabel(b)}</th>)}</tr></thead>
          <tbody>
            {areas.map((a) => (
              <tr key={a ?? "__none"}>
                <td style={{ ...tdc, fontWeight: 600, whiteSpace: "nowrap" }}>{areaLabel(a)}</td>
                {beds.map((b) => {
                  const c = cell(a, b);
                  const s = stats(c.map((o) => o.norm.price!));
                  return (
                    <td key={b} style={{ ...tdc, textAlign: "right", padding: 0 }}>
                      {c.length ? (
                        <button type="button" onClick={() => onPick(a, b)} style={{ width: "100%", textAlign: "right", padding: "9px 12px", background: "none", border: "none", cursor: "pointer", color: s.n && s.n < 5 && metric === "median" ? C.muted : C.navy, font: "inherit" }}>
                          {metric === "count" ? c.length : <>{cad(s.median)} <span style={{ color: C.faint, fontSize: 12 }}>({s.n})</span></>}
                        </button>
                      ) : <span style={{ display: "block", padding: "9px 12px", color: C.faint }}>—</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>
    </Panel>
  );
}
