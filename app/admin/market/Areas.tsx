"use client";
import { useMemo, useState } from "react";
import { BEDS_ORDER, bedsLabel, areaLabel, cad, stats, type CohortResult, type Obs, type Filters } from "@/lib/market/core";
import type { Ctx } from "./shared";
import { Card, Choice, RangeBar, BarList, BasedOn, Hint, TextLink, NAVY, MUTED, BORDER, heading } from "./ui";
import { cap, typeWord } from "./Overview";

export default function Areas({ ctx, res }: { ctx: Ctx; res: CohortResult }) {
  const room = ctx.filters.market === "room";
  const used = room ? res.room : res.whole;
  const [picked, setPicked] = useState<(string | null)[]>([]);
  const [sort, setSort] = useState<"price" | "ads" | "name">("price");

  const areas = useMemo(() => {
    const keys = [...new Set(res.matched.map((o) => o.norm.area))];
    const list = keys.map((a) => ({
      area: a,
      observed: res.matched.filter((o) => o.norm.area === a).length,
      rows: used.filter((o) => o.norm.area === a),
    })).map((x) => ({ ...x, s: stats(x.rows.map((o) => o.norm.price!)) }));
    return list.sort((x, y) =>
      x.area == null ? 1 : y.area == null ? -1 :
      sort === "price" ? (y.s.median ?? -1) - (x.s.median ?? -1) : sort === "ads" ? y.observed - x.observed : x.area.localeCompare(y.area));
  }, [res.matched, used, sort]);

  const toggle = (a: string | null) => setPicked(picked.includes(a) ? picked.filter((x) => x !== a) : picked.length < 4 ? [...picked, a] : picked);

  return (
    <div className="grid gap-5">
      <Card title="Neighbourhoods" sub={`What ${room ? "a single room" : "a whole home"} usually asks in each part of London. Tap "Compare" on up to four to put them side by side.`}
        right={<div className="flex gap-2 flex-wrap">
          <Choice size="sm" selected={sort === "price"} onClick={() => setSort("price")}>Priciest first</Choice>
          <Choice size="sm" selected={sort === "ads"} onClick={() => setSort("ads")}>Most ads first</Choice>
          <Choice size="sm" selected={sort === "name"} onClick={() => setSort("name")}>A to Z</Choice>
        </div>}>
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {areas.map((a) => (
            <div key={a.area ?? "__none"} className="border-2 rounded-2xl p-4 bg-white" style={{ borderColor: picked.includes(a.area) ? NAVY : BORDER }}>
              <div className="flex justify-between items-start gap-2">
                <div className="text-lg font-bold" style={heading}>{areaLabel(a.area)}</div>
                <Choice size="sm" selected={picked.includes(a.area)} onClick={() => toggle(a.area)}>Compare</Choice>
              </div>
              {a.s.n ? (
                <>
                  <div className="text-3xl font-bold tabular-nums mt-1" style={heading}>{cad(a.s.median)}<span className="text-sm font-normal" style={{ color: MUTED }}> typical</span></div>
                  <div className="text-sm"><BasedOn n={a.s.n} /></div>
                  {a.s.n >= 3 && <RangeBar compact min={a.s.min} p25={a.s.p25} median={a.s.median} p75={a.s.p75} max={a.s.max} />}
                </>
              ) : <div className="text-sm mt-2" style={{ color: MUTED }}>{a.observed} ads, none with a price we can count.</div>}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {BEDS_ORDER.map((b) => [b, a.rows.filter((o) => o.norm.beds_cat === b)] as const).filter(([, r]) => r.length).map(([b, r]) => (
                  <span key={b} className="text-sm rounded-lg px-2 py-1 tabular-nums" style={{ background: "#F7F5F2", color: NAVY }}>{bedsLabel(b)}: {cad(stats(r.map((o) => o.norm.price!)).median)} ({r.length})</span>
                ))}
              </div>
              <div className="mt-3 text-sm"><TextLink onClick={() => ctx.drill({ area: [a.area ?? "__none"] })}>See {a.observed} ads →</TextLink></div>
            </div>
          ))}
        </div>
        <div className="mt-4"><Hint>&quot;Area not stated&quot; is every ad that doesn&apos;t name a neighbourhood. We never guess where they are.</Hint></div>
      </Card>

      {picked.length > 0 && <SideBySide picked={picked} all={res.matched} used={used} clear={() => setPicked([])} />}

      <div className="grid gap-5 lg:grid-cols-2">
        <ByType rows={used} drill={ctx.drill} />
        <Extras rows={res.matched} used={used} drill={ctx.drill} />
      </div>
    </div>
  );
}

function SideBySide({ picked, all, used, clear }: { picked: (string | null)[]; all: Obs[]; used: Obs[]; clear: () => void }) {
  const cards = picked.map((a) => ({ a, s: stats(used.filter((o) => o.norm.area === a).map((o) => o.norm.price!)), n: all.filter((o) => o.norm.area === a).length }));
  const cheapest = cards.filter((c) => c.s.n >= 3).sort((x, y) => x.s.median! - y.s.median!)[0];
  const priciest = cards.filter((c) => c.s.n >= 3).sort((x, y) => y.s.median! - x.s.median!)[0];
  return (
    <Card title="Side by side" right={<TextLink onClick={clear}>Clear</TextLink>}
      sub={cheapest && priciest && cheapest !== priciest ? `${areaLabel(priciest.a)} asks about ${cad(priciest.s.median! - cheapest.s.median!)} more a month than ${areaLabel(cheapest.a)}.` : "Same filters for every area."}>
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))` }}>
        {cards.map(({ a, s, n }) => (
          <div key={a ?? "__none"} className="rounded-2xl p-4" style={{ background: "#F7F5F2" }}>
            <div className="font-bold" style={heading}>{areaLabel(a)}</div>
            <div className="text-3xl font-bold tabular-nums mt-1" style={heading}>{cad(s.median)}</div>
            <div className="text-sm"><BasedOn n={s.n} /> · {n} ads seen</div>
            {s.n >= 2 && <div className="text-sm mt-2 tabular-nums" style={{ color: "#333" }}>Half ask {cad(s.p25)}–{cad(s.p75)}</div>}
          </div>
        ))}
      </div>
    </Card>
  );
}

function ByType({ rows, drill }: { rows: Obs[]; drill: (p: Partial<Filters>) => void }) {
  const types = [...new Set(rows.map((o) => o.norm.type))];
  const list = types.map((t) => ({ t, s: stats(rows.filter((o) => o.norm.type === t).map((o) => o.norm.price!)) })).sort((a, b) => b.s.median! - a.s.median!);
  return (
    <Card title="Houses, apartments and more" sub="Typical asking rent for each kind of home. Tap one to see the ads.">
      <BarList rows={list.map(({ t, s }) => ({
        key: t, label: cap(typeWord(t)), value: s.median!, display: cad(s.median), light: s.n < 5, sub: <BasedOn n={s.n} />,
        onClick: () => drill({ type: [t], excluded: false }),
      }))} />
    </Card>
  );
}

function Extras({ rows, used, drill }: { rows: Obs[]; used: Obs[]; drill: (p: Partial<Filters>) => void }) {
  const [field, setField] = useState<"laundry" | "parking" | "furnished" | "pets" | "util">("laundry");
  const label = { laundry: "Laundry", parking: "Parking", furnished: "Furnished", pets: "Pets", util: "Utilities" }[field];
  const get = (o: Obs): string[] => field === "util" ? (o.norm.utilities.length ? o.norm.utilities : ["unknown"]) : [(o.norm[field] as string | null) ?? "unknown"];
  const values = [...new Set(rows.flatMap(get))];
  const list = values.map((v) => ({ v, n: rows.filter((o) => get(o).includes(v)).length, s: stats(used.filter((o) => get(o).includes(v)).map((o) => o.norm.price!)) }))
    .sort((a, b) => (a.v === "unknown" ? 1 : b.v === "unknown" ? -1 : b.n - a.n));
  return (
    <Card title="What do the ads include?" sub="How many ads mention each thing, and what those ads usually ask. Many ads don't say, and that's shown separately.">
      <div className="flex gap-2 flex-wrap mb-4">
        {(["laundry", "parking", "furnished", "pets", "util"] as const).map((f) => (
          <Choice key={f} size="sm" selected={field === f} onClick={() => setField(f)}>{{ laundry: "Laundry", parking: "Parking", furnished: "Furnished", pets: "Pets", util: "Utilities" }[f]}</Choice>
        ))}
      </div>
      <BarList max={rows.length} rows={list.map(({ v, n, s }) => ({
        key: v, label: v === "unknown" ? `${label}: doesn't say` : cap(v), value: n, light: v === "unknown",
        display: `${n} ads`, sub: s.n ? <>Usually {cad(s.median)} · <BasedOn n={s.n} /></> : undefined,
        onClick: () => drill({ [field]: [v] } as Partial<Filters>),
      }))} />
      <p className="text-sm mt-3" style={{ color: MUTED }}>A price difference here isn&apos;t the value of the feature itself. Location and size matter too.</p>
    </Card>
  );
}
