"use client";
import { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, LabelList } from "recharts";
import { Card, BarList, NAVY, MUTED, heading } from "./ui";
import { C, Loading } from "@/components/admin/kit";
import { cad, stats, quantile, bedsLabel, areaLabel, type Obs } from "@/lib/market/core";
import { COMPARE_LABEL, type CompareMode } from "@/lib/market/compare";
import { Panel, Note, Pill, th, tdc, TableWrap, tabular, fmtDate, fmtDateTime, pct, SampleTag, type Ctx, type Snapshot } from "./shared";
import type { CompareInfo } from "./Overview";

type Row = [string, number | null, string, string | null, string, string, string];

export default function Trends({ ctx, compare, cmpMode, setCmpMode, cmpCustom, setCmpCustom, prevObs }: {
  ctx: Ctx; compare: CompareInfo; cmpMode: CompareMode; setCmpMode: (m: CompareMode) => void;
  cmpCustom: string | null; setCmpCustom: (id: string | null) => void; prevObs: Obs[] | null;
}) {
  const [series, setSeries] = useState<{ snapshots: Snapshot[]; series: Record<string, Row[]> } | null>(null);
  const [interval, setInterval] = useState<"scan" | "week" | "month">("scan");
  const { filters, snapshots, snapshot } = ctx;

  useEffect(() => {
    let live = true;
    fetch("/api/admin/market/series").then((r) => r.json()).then((d) => live && setSeries(d)).catch(() => live && setSeries({ snapshots: [], series: {} }));
    return () => { live = false; };
  }, [snapshots.length]);

  // Trend lines respect market, area, type and bedroom filters.
  const points = useMemo(() => {
    if (!series) return [];
    const keep = (r: Row) =>
      (filters.market === "room" ? r[2] === "room" : r[2] === "whole") &&
      (!filters.area.length || filters.area.includes(r[3] ?? "__none")) &&
      (!filters.type.length || filters.type.includes(r[4])) &&
      (!filters.beds.length || filters.beds.includes(r[5]));
    const scans = [...series.snapshots].filter((s) => s.scan_date).sort((a, b) => (a.scan_date! < b.scan_date! ? -1 : 1));
    // Week/month: the last scan in each period represents it. Never summed or averaged.
    const periodKey = (d: string) => interval === "month" ? d.slice(0, 7) : interval === "week" ? weekStart(d) : d;
    const reps = new Map<string, Snapshot>();
    for (const s of scans) reps.set(periodKey(s.scan_date!), s);
    const currentMonth = new Date().toISOString().slice(0, 7);
    return [...reps].map(([k, s]) => {
      const prices = (series.series[s.id] ?? []).filter(keep).map((r) => Number(r[1])).sort((a, b) => a - b);
      return {
        key: k, label: interval === "month" ? `${k}${k === currentMonth ? " (to date)" : ""}` : fmtDate(s.scan_date),
        date: s.scan_date, n: prices.length, observed: (series.series[s.id] ?? []).length,
        median: quantile(prices, 0.5), p25: quantile(prices, 0.25), p75: quantile(prices, 0.75),
        mean: prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : null,
      };
    });
  }, [series, filters, interval]);

  const ids = useMemo(() => {
    if (!series) return null;
    const sorted = [...series.snapshots].filter((s) => s.scan_date).sort((a, b) => (a.scan_date! < b.scan_date! ? -1 : 1));
    return sorted.map((s) => ({ s, ids: new Set((series.series[s.id] ?? []).map((r) => r[0])) }));
  }, [series]);
  // Back after a gap: first seen vs the comparison scan, but present in some scan before it.
  const reappeared = useMemo(() => {
    if (!ids || !compare.diff || !compare.snapDate) return [];
    const earlier = ids.filter((x) => x.s.scan_date! < compare.snapDate!);
    return compare.diff.firstSeen.filter((o) => earlier.some((e) => e.ids.has(o.listing_id)));
  }, [ids, compare]);
  const trulyNew = compare.diff ? compare.diff.firstSeen.filter((o) => !reappeared.includes(o)) : [];

  if (!series) return <Loading />;

  const curStats = stats((filters.market === "room" ? ctx.obs.filter((o) => o.cohort === "room") : ctx.obs.filter((o) => o.cohort === "whole")).map((o) => o.norm.price!));
  const prevStats = prevObs ? stats((filters.market === "room" ? prevObs.filter((o) => o.cohort === "room") : prevObs.filter((o) => o.cohort === "whole")).map((o) => o.norm.price!)) : null;
  const pairsMedianPct = compare.diff ? quantile(compare.diff.pairs.map((p) => p.pct ?? 0).sort((a, b) => a - b), 0.5) : null;

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Panel title="Every scan we have" sub="Dates are when the ads were collected.">
        <TableWrap>
          <table style={{ width: "100%", borderCollapse: "collapse", ...tabular }}>
            <thead><tr>
              <th style={th}>Scan date</th><th style={th}>Scan</th><th style={{ ...th, textAlign: "right" }}>Ads</th><th style={{ ...th, textAlign: "right" }}>Usable whole-unit rents</th>
              <th style={{ ...th, textAlign: "right" }}>Per-room rents</th><th style={th}>Search scope</th><th style={th}>Imported</th><th style={th}></th>
            </tr></thead>
            <tbody>
              {snapshots.map((s) => {
                const rep = s.reported ?? {};
                const elig = (s.schema_report as { eligible?: Record<string, number> }).eligible ?? {};
                return (
                  <tr key={s.id} style={{ background: s.id === snapshot.id ? C.greyBg : undefined }}>
                    <td style={tdc}>{fmtDate(s.scan_date)}{!s.scan_identity_verified && <div style={{ fontSize: 12, color: C.amber }}>Scan date not confirmed</div>}</td>
                    <td style={tdc}>{s.scan_label ?? "—"}{s.revision > 1 ? ` · corrected (v${s.revision})` : ""}</td>
                    <td style={{ ...tdc, textAlign: "right" }}>{s.listing_count}</td>
                    <td style={{ ...tdc, textAlign: "right" }}>{elig.whole ?? "—"}</td>
                    <td style={{ ...tdc, textAlign: "right" }}>{elig.room ?? "—"}</td>
                    <td style={{ ...tdc, fontSize: 13, color: C.muted }}>{rep.radiusKm != null ? `${rep.radiusKm} km · ` : ""}{rep.segments != null ? `${rep.segments} segments · ` : ""}{rep.pages != null ? `${rep.pages} pages` : "Not reported"}</td>
                    <td style={{ ...tdc, fontSize: 13 }}>{fmtDateTime(s.ingested_at)}</td>
                    <td style={tdc}>{s.id === snapshot.id ? <strong>Viewing</strong> : <Pill onClick={() => { setCmpMode("custom"); setCmpCustom(s.id); }} active={cmpMode === "custom" && cmpCustom === s.id}>Compare</Pill>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableWrap>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: C.muted, marginRight: 4 }}>Compare with:</span>
          {(Object.keys(COMPARE_LABEL) as CompareMode[]).filter((m) => m !== "custom").map((m) => <Pill key={m} active={cmpMode === m} onClick={() => setCmpMode(m)}>{COMPARE_LABEL[m]}</Pill>)}
        </div>
      </Panel>

      {snapshots.length < 2 ? (
        <Card>
          <div className="text-5xl" aria-hidden>📅</div>
          <h2 className="text-2xl sm:text-3xl font-bold mt-3" style={heading}>Nothing to compare yet</h2>
          <p className="text-lg mt-2" style={{ color: "#333" }}>
            We have one scan so far ({fmtDate(snapshot.scan_date)}). After the next one on Friday, this page will tell you:
          </p>
          <ul className="text-lg mt-3 grid gap-2" style={{ color: NAVY }}>
            <li>• Did typical rents go up or down?</li>
            <li>• Which ads dropped their price?</li>
            <li>• Which ads are new?</li>
            <li>• Which ads we didn&apos;t see again?</li>
          </ul>
          <p className="text-base mt-4" style={{ color: MUTED }}>
            Right now a typical {filters.market === "room" ? "room" : "whole home"} asks {cad(curStats.median)} a month.
          </p>
        </Card>
      ) : (
        <>
          <Panel title="Is rent going up or down?" sub={`Typical ${filters.market === "room" ? "room" : "whole-home"} asking rent at each scan, using your area, type and bedroom choices.`}
            right={<div style={{ display: "flex", gap: 6 }}>{(["scan", "week", "month"] as const).map((i) => <Pill key={i} active={interval === i} onClick={() => setInterval(i)}>{i === "scan" ? "Every scan" : i === "week" ? "Weekly" : "Monthly"}</Pill>)}</div>}>
            <div style={{ height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={points} margin={{ top: 28, right: 24, bottom: 0, left: -6 }}>
                  <CartesianGrid stroke="#EFEBE5" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 13, fill: MUTED }} />
                  <YAxis tick={{ fontSize: 12, fill: MUTED }} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} domain={["auto", "auto"]} />
                  <Tooltip formatter={(v) => [cad(Number(v)), "Typical rent"]} labelFormatter={(l, p) => `${l}${p?.[0] ? ` · ${p[0].payload.n} ads` : ""}`} />
                  <Line dataKey="median" name="Typical rent" stroke={NAVY} strokeWidth={3} dot={{ r: 6, fill: NAVY }} activeDot={{ r: 8 }} connectNulls={false}>
                    <LabelList dataKey="median" position="top" formatter={(v: unknown) => cad(Number(v))} style={{ fontSize: 13, fontWeight: 700, fill: NAVY }} />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ marginTop: 18 }}>
              <div className="font-semibold mb-2" style={{ color: NAVY }}>How many ads each scan found</div>
              <BarList rows={points.map((p) => ({ key: p.key, label: p.label, value: p.observed, display: `${p.observed} ads` }))} />
            </div>
            <p style={{ fontSize: 12, color: C.muted, margin: "6px 0 0" }}>Observed ads depend on how deep each scan searched. A lower count is not proof the market shrank.</p>
          </Panel>

          {!compare.diff ? <Note tone="amber">{compare.reason}</Note> : (
            <>
              {compare.warnings.length > 0 && <Note tone="amber">The two scans were collected differently: {compare.warnings.join(" ")} Change figures below are shown side by side, not as like-for-like changes.</Note>}
              <Panel title={`This scan (${fmtDate(snapshot.scan_date)}) vs ${fmtDate(compare.snapDate)}`} sub="Snapshot comparison: the sample mix can change between scans, so a different median doesn't mean rents moved.">
                <TableWrap>
                  <table style={{ width: "100%", borderCollapse: "collapse", ...tabular }}>
                    <thead><tr><th style={th}>Measure</th><th style={{ ...th, textAlign: "right" }}>{fmtDate(compare.snapDate)}</th><th style={{ ...th, textAlign: "right" }}>{fmtDate(snapshot.scan_date)}</th><th style={{ ...th, textAlign: "right" }}>Change</th><th style={{ ...th, textAlign: "right" }}>%</th></tr></thead>
                    <tbody>
                      {prevStats && ([
                        ["Eligible rents (n)", prevStats.n, curStats.n, false],
                        ["Median asking rent", prevStats.median, curStats.median, true],
                        ["P25", prevStats.p25, curStats.p25, true],
                        ["P75", prevStats.p75, curStats.p75, true],
                        ["Mean", prevStats.mean, curStats.mean, true],
                      ] as [string, number | null, number | null, boolean][]).map(([label, a, b, money]) => (
                        <tr key={label}>
                          <td style={tdc}>{label}</td>
                          <td style={{ ...tdc, textAlign: "right" }}>{money ? cad(a) : a ?? "—"}</td>
                          <td style={{ ...tdc, textAlign: "right" }}>{money ? cad(b) : b ?? "—"}</td>
                          <td style={{ ...tdc, textAlign: "right" }}>{a != null && b != null && !compare.warnings.length ? (money ? cad(b - a) : b - a) : "—"}</td>
                          <td style={{ ...tdc, textAlign: "right" }}>{a && b != null && !compare.warnings.length ? pct(((b - a) / a) * 100) : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableWrap>
              </Panel>

              <Panel title="Did anyone change their price?" sub={`${compare.diff.pairs.length} ads were in both scans. Here's who moved their price. The typical change was ${pairsMedianPct == null ? "—" : pct(pairsMedianPct)}.`}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 10, fontSize: 14 }}>
                  <span>Reduced: <strong>{compare.diff.reduced.length}</strong></span>
                  <span>Increased: <strong>{compare.diff.increased.length}</strong></span>
                  <span>Unchanged: <strong>{compare.diff.unchanged.length}</strong></span>
                  <SampleTag n={compare.diff.pairs.length} />
                </div>
                <ObsList rows={[...compare.diff.reduced, ...compare.diff.increased].sort((a, b) => a.change - b.change).map((p) => ({
                  o: p.cur, extra: `${cad(p.prev.norm.price)} → ${cad(p.cur.norm.price)} (${p.change > 0 ? "+" : ""}${cad(p.change)}, ${pct(p.pct)})`,
                }))} open={ctx.openListing} empty="No price changes among matched ads." />
              </Panel>

              <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))" }}>
                <Panel title={`New ads (${trulyNew.length})`} sub="We hadn't seen these before.">
                  <ObsList rows={trulyNew.map((o) => ({ o }))} open={ctx.openListing} empty="None." />
                </Panel>
                <Panel title={`Didn't see again (${compare.diff.notSeen.length})`} sub="These were there last time but not this time. That doesn't always mean they rented.">
                  <ObsList rows={compare.diff.notSeen.map((o) => ({ o }))} open={ctx.openListing} empty="None." />
                </Panel>
                <Panel title={`Came back (${reappeared.length})`} sub="Gone for a while, now listed again.">
                  <ObsList rows={reappeared.map((o) => ({ o }))} open={ctx.openListing} empty="None." />
                </Panel>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function weekStart(d: string) {
  const t = new Date(`${d}T12:00:00Z`);
  t.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 6) % 7));
  return t.toISOString().slice(0, 10);
}

function ObsList({ rows, open, empty }: { rows: { o: Obs; extra?: string }[]; open: (id: string) => void; empty: string }) {
  const [all, setAll] = useState(false);
  if (!rows.length) return <p style={{ margin: 0, color: C.faint, fontSize: 14 }}>{empty}</p>;
  const shown = all ? rows : rows.slice(0, 12);
  return (
    <div style={{ display: "grid", gap: 4 }}>
      {shown.map(({ o, extra }) => (
        <button key={o.listing_id} type="button" onClick={() => open(o.listing_id)}
          style={{ textAlign: "left", background: C.greyBg, border: "none", borderRadius: 8, padding: "8px 10px", cursor: "pointer", fontSize: 14, color: C.text, ...tabular }}>
          <strong style={{ color: C.navy }}>{o.norm.title || o.listing_id}</strong>
          <div style={{ color: C.muted, fontSize: 13 }}>{extra ?? cad(o.norm.price)} · {o.norm.type}, {bedsLabel(o.norm.beds_cat)} · {areaLabel(o.norm.area)}</div>
        </button>
      ))}
      {rows.length > 12 && <button type="button" onClick={() => setAll(!all)} style={{ background: "none", border: "none", color: C.navy, textDecoration: "underline", cursor: "pointer", justifySelf: "start" }}>{all ? "Show fewer" : `Show all ${rows.length}`}</button>}
    </div>
  );
}
