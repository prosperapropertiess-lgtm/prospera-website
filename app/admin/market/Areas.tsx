"use client";
import { useMemo, useState } from "react";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { C } from "@/components/admin/kit";
import { BEDS_ORDER, bedsLabel, areaLabel, cad, stats, type CohortResult, type Obs, type Filters } from "@/lib/market/core";
import { Panel, Pill, SampleTag, th, tdc, TableWrap, tabular, SERIES, Note, type Ctx } from "./shared";

export default function Areas({ ctx, res }: { ctx: Ctx; res: CohortResult }) {
  const room = ctx.filters.market === "room";
  const used = room ? res.room : res.whole;
  const [picked, setPicked] = useState<(string | null)[]>([]);

  const areas = useMemo(() => {
    const keys = [...new Set(res.matched.map((o) => o.norm.area))];
    return keys.map((a) => {
      const all = res.matched.filter((o) => o.norm.area === a);
      const elig = used.filter((o) => o.norm.area === a);
      const types = new Map<string, number>();
      all.forEach((o) => types.set(o.norm.type, (types.get(o.norm.type) ?? 0) + 1));
      return { area: a, observed: all.length, s: stats(elig.map((o) => o.norm.price!)), mix: [...types].sort((x, y) => y[1] - x[1]) };
    }).sort((x, y) => y.observed - x.observed);
  }, [res.matched, used]);

  const unstated = areas.find((a) => a.area == null);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Panel title="Areas" sub={`Observed ads and ${room ? "room" : "whole-unit"} asking rents by area. Tick up to four areas to compare side by side.`}>
        {unstated && <div style={{ marginBottom: 10 }}><Note>{unstated.observed} of {res.matched.length} ads don&apos;t name an area. They&apos;re counted as &quot;Area not stated&quot;, never guessed.</Note></div>}
        <TableWrap maxHeight={520}>
          <table style={{ width: "100%", borderCollapse: "collapse", ...tabular }}>
            <thead><tr>
              <th style={th}>Compare</th><th style={th}>Area</th><th style={{ ...th, textAlign: "right" }}>Observed ads</th><th style={{ ...th, textAlign: "right" }}>Eligible rents</th>
              <th style={{ ...th, textAlign: "right" }}>Median</th><th style={{ ...th, textAlign: "right" }}>Middle 50%</th><th style={th}>Type mix</th>
            </tr></thead>
            <tbody>
              {areas.map((a) => (
                <tr key={a.area ?? "__none"}>
                  <td style={tdc}><input type="checkbox" aria-label={`Compare ${areaLabel(a.area)}`} checked={picked.includes(a.area)} disabled={!picked.includes(a.area) && picked.length >= 4}
                    onChange={() => setPicked(picked.includes(a.area) ? picked.filter((x) => x !== a.area) : [...picked, a.area])} /></td>
                  <td style={{ ...tdc, fontWeight: 600 }}>
                    <button type="button" onClick={() => ctx.drill({ area: [a.area ?? "__none"] })} style={{ background: "none", border: "none", padding: 0, color: C.navy, fontWeight: 600, cursor: "pointer", font: "inherit", textDecoration: "underline" }}>{areaLabel(a.area)}</button>
                  </td>
                  <td style={{ ...tdc, textAlign: "right" }}>{a.observed}</td>
                  <td style={{ ...tdc, textAlign: "right" }}>{a.s.n}<SampleTag n={a.s.n} /></td>
                  <td style={{ ...tdc, textAlign: "right" }}>{cad(a.s.median)}</td>
                  <td style={{ ...tdc, textAlign: "right" }}>{a.s.n ? `${cad(a.s.p25)}–${cad(a.s.p75)}` : "—"}</td>
                  <td style={{ ...tdc, fontSize: 13, color: C.muted }}>{a.mix.map(([t, n]) => `${t} ${n}`).join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      </Panel>

      {picked.length > 0 && <AreaCompare picked={picked} all={res.matched} used={used} />}

      <TypeBeds rows={used} all={res.matched} drill={ctx.drill} />
      <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 440px), 1fr))" }}>
        <Amenities rows={res.matched} used={used} drill={ctx.drill} />
        <RentVsSize rows={used.filter((o) => o.norm.sqft != null && o.norm.type !== "room")} total={used.length} open={ctx.openListing} />
      </div>
    </div>
  );
}

function AreaCompare({ picked, all, used }: { picked: (string | null)[]; all: Obs[]; used: Obs[] }) {
  return (
    <Panel title="Side by side" sub="Like-for-like: same market (whole units or rooms) and the same filters for every column.">
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))` }}>
        {picked.map((a) => {
          const obs = all.filter((o) => o.norm.area === a);
          const s = stats(used.filter((o) => o.norm.area === a).map((o) => o.norm.price!));
          const missing = (fn: (o: Obs) => unknown) => obs.length ? Math.round((100 * obs.filter((o) => fn(o) == null || fn(o) === "").length) / obs.length) : 0;
          return (
            <div key={a ?? "__none"} style={{ background: C.greyBg, borderRadius: 10, padding: 14, fontSize: 14, ...tabular }}>
              <div style={{ fontWeight: 700, color: C.navy, marginBottom: 6 }}>{areaLabel(a)}</div>
              <div>Observed ads: {obs.length}</div>
              <div>Eligible rents: {s.n}<SampleTag n={s.n} /></div>
              <div>Median: <strong>{cad(s.median)}</strong></div>
              <div>Middle 50%: {s.n ? `${cad(s.p25)}–${cad(s.p75)}` : "—"}</div>
              <div>Range: {s.n ? `${cad(s.min)}–${cad(s.max)}` : "—"}</div>
              <div style={{ marginTop: 6, color: C.muted }}>Bedrooms: {BEDS_ORDER.map((b) => [b, obs.filter((o) => o.norm.beds_cat === b).length] as const).filter(([, n]) => n).map(([b, n]) => `${bedsLabel(b)} ${n}`).join(", ")}</div>
              <div style={{ color: C.muted }}>Not stated: size {missing((o) => o.norm.sqft)}%, laundry {missing((o) => o.norm.laundry)}%, parking {missing((o) => o.norm.parking)}%</div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function TypeBeds({ rows, all, drill }: { rows: Obs[]; all: Obs[]; drill: (p: Partial<Filters>) => void }) {
  const types = [...new Set(all.map((o) => o.norm.type))].sort();
  const beds = BEDS_ORDER.filter((b) => all.some((o) => o.norm.beds_cat === b));
  return (
    <Panel title="Property type × bedrooms" sub="Median asking rent, with observed ads in brackets. Click a cell to see the listings.">
      <TableWrap>
        <table style={{ width: "100%", borderCollapse: "collapse", ...tabular }}>
          <thead><tr><th style={th}>Type</th>{beds.map((b) => <th key={b} style={{ ...th, textAlign: "right" }}>{bedsLabel(b)}</th>)}</tr></thead>
          <tbody>
            {types.map((t) => (
              <tr key={t}>
                <td style={{ ...tdc, fontWeight: 600 }}>{t}</td>
                {beds.map((b) => {
                  const n = all.filter((o) => o.norm.type === t && o.norm.beds_cat === b).length;
                  const s = stats(rows.filter((o) => o.norm.type === t && o.norm.beds_cat === b).map((o) => o.norm.price!));
                  return (
                    <td key={b} style={{ ...tdc, textAlign: "right", padding: 0 }}>
                      {n ? <button type="button" onClick={() => drill({ type: [t], beds: [b] })} style={{ width: "100%", textAlign: "right", padding: "9px 12px", background: "none", border: "none", cursor: "pointer", font: "inherit", color: C.navy }}>
                        {s.n ? cad(s.median) : "—"} <span style={{ color: C.faint, fontSize: 12 }}>({n})</span>
                      </button> : <span style={{ display: "block", padding: "9px 12px", color: C.faint }}>—</span>}
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

function Amenities({ rows, used, drill }: { rows: Obs[]; used: Obs[]; drill: (p: Partial<Filters>) => void }) {
  const [field, setField] = useState<"laundry" | "parking" | "furnished" | "pets" | "util">("laundry");
  const get = (o: Obs): string[] => field === "util" ? (o.norm.utilities.length ? o.norm.utilities : ["unknown"]) : [(o.norm[field] as string | null) ?? "unknown"];
  const values = [...new Set(rows.flatMap(get))].sort((a, b) => (a === "unknown" ? 1 : b === "unknown" ? -1 : a.localeCompare(b)));
  return (
    <Panel title="Amenities and inclusions" sub="As stated in ads. Differences are observed, not a premium you can add to rent: they mix location, size and type."
      right={<div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {(["laundry", "parking", "furnished", "pets", "util"] as const).map((f) => <Pill key={f} active={field === f} onClick={() => setField(f)}>{f === "util" ? "utilities" : f}</Pill>)}
      </div>}>
      <TableWrap>
        <table style={{ width: "100%", borderCollapse: "collapse", ...tabular }}>
          <thead><tr><th style={th}>Value</th><th style={{ ...th, textAlign: "right" }}>Ads</th><th style={{ ...th, textAlign: "right" }}>Share</th><th style={{ ...th, textAlign: "right" }}>Median rent</th></tr></thead>
          <tbody>
            {values.map((v) => {
              const n = rows.filter((o) => get(o).includes(v)).length;
              const s = stats(used.filter((o) => get(o).includes(v)).map((o) => o.norm.price!));
              return (
                <tr key={v}>
                  <td style={tdc}>
                    <button type="button" onClick={() => drill({ [field]: [v] } as Partial<Filters>)} style={{ background: "none", border: "none", padding: 0, color: v === "unknown" ? C.muted : C.navy, cursor: "pointer", font: "inherit", textDecoration: "underline" }}>{v === "unknown" ? "Not stated" : v}</button>
                  </td>
                  <td style={{ ...tdc, textAlign: "right" }}>{n}</td>
                  <td style={{ ...tdc, textAlign: "right" }}>{rows.length ? `${Math.round((100 * n) / rows.length)}%` : "—"}</td>
                  <td style={{ ...tdc, textAlign: "right" }}>{cad(s.median)} <span style={{ color: C.faint, fontSize: 12 }}>n={s.n}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableWrap>
      <p style={{ fontSize: 12, color: C.muted, margin: "8px 0 0" }}>Share is out of all {rows.length} matching ads, including ones that don&apos;t say. &quot;Not stated&quot; never means &quot;no&quot;.</p>
    </Panel>
  );
}

function RentVsSize({ rows, total, open }: { rows: Obs[]; total: number; open: (id: string) => void }) {
  const data = rows.map((o) => ({ x: o.norm.sqft!, y: o.norm.price!, id: o.listing_id, title: o.norm.title, ppsf: o.norm.price! / o.norm.sqft! }));
  const ppsf = stats(data.map((d) => d.ppsf));
  return (
    <Panel title="Asking rent vs stated size" sub={`${rows.length} of ${total} eligible ads state a size. Median rent per sq ft: ${ppsf.n ? `$${ppsf.median!.toFixed(2)}` : "—"} (median of each ad's rent ÷ size). Click a dot to open it.`}>
      {data.length < 3 ? <p style={{ color: C.faint }}>Too few ads state a size.</p> : (
        <div style={{ height: 260 }}>
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 8, right: 8, bottom: 8, left: -10 }}>
              <CartesianGrid stroke={C.border} />
              <XAxis type="number" dataKey="x" name="Size" unit=" sq ft" tick={{ fontSize: 11, fill: C.muted }} />
              <YAxis type="number" dataKey="y" name="Rent" tick={{ fontSize: 11, fill: C.muted }} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} content={({ payload }) => {
                const p = payload?.[0]?.payload as (typeof data)[number] | undefined;
                return p ? <div style={{ background: "#fff", border: `1px solid ${C.border}`, padding: 8, fontSize: 13, borderRadius: 8 }}><strong>{p.title}</strong><br />{cad(p.y)} · {p.x} sq ft · ${p.ppsf.toFixed(2)}/sq ft</div> : null;
              }} />
              <Scatter data={data} fill={SERIES[0]} cursor="pointer" onClick={(d) => open((d as unknown as { payload: { id: string } }).payload?.id ?? (d as unknown as { id: string }).id)} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
    </Panel>
  );
}
