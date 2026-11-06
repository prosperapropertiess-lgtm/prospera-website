"use client";
import { useMemo, useState } from "react";
import { BEDS_ORDER, bedsLabel, areaLabel, cad, stats, FLAG_TEXT, BLOCKING_FLAGS, type CohortResult, type Obs, type Flag } from "@/lib/market/core";
import type { diffScans } from "@/lib/market/compare";
import { fmtDate, type Ctx } from "./shared";
import { Card, Choice, BigNumber, RangeBar, BarList, Hint, BasedOn, TextLink, NAVY, MUTED, heading } from "./ui";

export interface CompareInfo {
  label: string;
  snapDate: string | null;
  reason: string | null;
  warnings: string[];
  diff: ReturnType<typeof diffScans> | null;
}

const TYPE_WORD: Record<string, string> = { apartment: "apartments", house: "houses", townhouse: "townhouses", basement: "basement units", condo: "condos", room: "rooms", other: "other homes" };
export const typeWord = (t: string) => TYPE_WORD[t] ?? `${t}s`;
export const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

export default function Overview({ ctx, res, compare, sourceMedian }: {
  ctx: Ctx; res: CohortResult; compare: CompareInfo; sourceMedian: { n: number | null; median: number | null } | null;
}) {
  const { drill, snapshot } = ctx;
  const s = res.wholeStats;
  const review = res.matched.filter((o) => o.cohort === "review" || o.cohort === "none");
  const comparable = !!compare.diff && !compare.warnings.length;

  return (
    <div className="grid gap-5">
      <Card>
        <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: MUTED }}>The big picture · {fmtDate(snapshot.scan_date)}</p>
        <h2 className="text-2xl sm:text-4xl font-bold leading-tight mt-2" style={heading}>
          A typical whole home in London asks <span className="tabular-nums">{cad(s.median)}</span> a month.
        </h2>
        <p className="text-base sm:text-lg mt-3" style={{ color: "#333" }}>
          Half of the ads ask between <strong className="tabular-nums">{cad(s.p25)}</strong> and <strong className="tabular-nums">{cad(s.p75)}</strong>. <BasedOn n={s.n} what="Facebook ads" />.
        </p>
        <RangeBar min={s.min} p25={s.p25} median={s.median} p75={s.p75} max={s.max} />
        {res.roomStats.n > 0 && (
          <p className="text-base mt-5" style={{ color: "#333" }}>
            A single room asks about <strong className="tabular-nums">{cad(res.roomStats.median)}</strong> a month (<BasedOn n={res.roomStats.n} what="room ads" />). Rooms are counted separately so they don&apos;t drag the home price down.
          </p>
        )}
        <p className="text-sm mt-4" style={{ color: MUTED }}>These are asking prices in ads, not what people actually signed for.</p>
      </Card>

      <RentFinder obs={res.matched} drill={drill} />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <BigNumber label="Ads we saw" value={res.matched.length} note="Homes and rooms in this scan" onClick={() => drill({ market: "all" })} />
        <BigNumber label="New since last time" value={comparable ? compare.diff!.firstSeen.length : "Soon"} muted={!comparable}
          note={comparable ? `Since ${fmtDate(compare.snapDate)}` : "Shows up after the next scan"} onClick={comparable ? () => ctx.setTab("trends") : undefined} />
        <BigNumber label="Price drops" value={comparable ? compare.diff!.reduced.length : "Soon"} muted={!comparable}
          note={comparable ? `Out of ${compare.diff!.pairs.length} ads seen both times` : "Shows up after the next scan"} onClick={comparable ? () => ctx.setTab("trends") : undefined} />
        <BigNumber label="Need a second look" value={review.length} note="Ads with confusing details" onClick={() => drill({ flags: ["room_whole_conflict"], excluded: true, market: "all" })} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <PriceLadder rows={res.whole} drill={drill} />
        <Neighbourhoods rows={res.whole} drill={drill} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="How many bedrooms?" sub="Typical asking rent for whole homes, by number of bedrooms. Tap one to see the ads.">
          <BarList rows={BEDS_ORDER.map((b) => ({ b, st: stats(res.whole.filter((o) => o.norm.beds_cat === b).map((o) => o.norm.price!)) }))
            .filter((x) => x.st.n > 0).map(({ b, st }) => ({
              key: b, label: bedsLabel(b), value: st.median!, display: cad(st.median), light: st.n < 5,
              sub: <BasedOn n={st.n} />, onClick: () => drill({ beds: [b], market: "whole", excluded: false }),
            }))} />
        </Card>
        <Card title="What did we notice?" sub="Plain-language notes about this scan.">
          <div className="grid gap-3">
            {ctx.snapshots.length < 2 && <Hint>This is the first scan, so there&apos;s nothing to compare yet. After next Friday you&apos;ll see what changed.</Hint>}
            {review.length > 0 && (
              <Hint tone="warn">
                {review.length} ads say &quot;room&quot; but are priced like a whole home. We left them out of the prices above so they don&apos;t mislead you. <TextLink onClick={() => drill({ flags: ["room_whole_conflict"], excluded: true, market: "all" })}>Look at them</TextLink>
              </Hint>
            )}
            {sourceMedian?.median != null && (
              <Hint>Your Sheet says {cad(sourceMedian.median)} for a typical home. We say {cad(s.median)} because we left those {review.length} room ads out. <TextLink onClick={() => ctx.setTab("data")}>See why</TextLink></Hint>
            )}
            <Hint>{res.matched.filter((o) => !o.norm.area).length} ads don&apos;t say which neighbourhood they&apos;re in. We never guess.</Hint>
            {compare.diff && (
              <Hint>Since {fmtDate(compare.snapDate)}: {compare.diff.firstSeen.length} new ads, {compare.diff.reduced.length} price drops, {compare.diff.notSeen.length} ads we didn&apos;t see again (that doesn&apos;t mean they rented).</Hint>
            )}
            {[...new Set(res.matched.flatMap((o) => o.flags))].filter((f) => !BLOCKING_FLAGS.includes(f) && f !== "reviewed").map((f) => (
              <Hint key={f}>{res.matched.filter((o) => o.flags.includes(f)).length} ads: {FLAG_TEXT[f as Flag].toLowerCase()}. <TextLink onClick={() => drill({ flags: [f], market: "all" })}>See them</TextLink></Hint>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/** Pick bedrooms, type and area; get one plain answer. */
function RentFinder({ obs, drill }: { obs: Obs[]; drill: Ctx["drill"] }) {
  const whole = useMemo(() => obs.filter((o) => o.cohort === "whole"), [obs]);
  const [beds, setBeds] = useState<string | null>("2");
  const [type, setType] = useState<string | null>(null);
  const [area, setArea] = useState<string | null>(null);

  const types = useMemo(() => {
    const c = new Map<string, number>();
    whole.forEach((o) => c.set(o.norm.type, (c.get(o.norm.type) ?? 0) + 1));
    return [...c].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, [whole]);
  const areas = useMemo(() => {
    const c = new Map<string, number>();
    whole.forEach((o) => { if (o.norm.area) c.set(o.norm.area, (c.get(o.norm.area) ?? 0) + 1); });
    return [...c].filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1]).map(([a]) => a);
  }, [whole]);

  const match = whole.filter((o) => (!beds || o.norm.beds_cat === beds) && (!type || o.norm.type === type) && (!area || o.norm.area === area));
  const s = stats(match.map((o) => o.norm.price!));
  const what = `${beds ? `${bedsLabel(beds)} ` : ""}${type ? typeWord(type) : "homes"}${area ? ` in ${area}` : ""}`;

  return (
    <Card title="What does a home like this cost?" sub="Tap to choose. The answer changes as you go.">
      <div className="grid gap-4">
        <Row label="Bedrooms">
          <Choice selected={!beds} onClick={() => setBeds(null)} size="sm">Any</Choice>
          {BEDS_ORDER.filter((b) => b !== "unknown" && whole.some((o) => o.norm.beds_cat === b)).map((b) => (
            <Choice key={b} selected={beds === b} onClick={() => setBeds(b)} size="sm">{bedsLabel(b)}</Choice>
          ))}
        </Row>
        <Row label="Type">
          <Choice selected={!type} onClick={() => setType(null)} size="sm">Any</Choice>
          {types.map((t) => <Choice key={t} selected={type === t} onClick={() => setType(t)} size="sm">{cap(t)}</Choice>)}
        </Row>
        <Row label="Area">
          <Choice selected={!area} onClick={() => setArea(null)} size="sm">Anywhere</Choice>
          {areas.map((a) => <Choice key={a} selected={area === a} onClick={() => setArea(a)} size="sm">{a}</Choice>)}
        </Row>
      </div>

      <div className="mt-6 rounded-2xl p-5 sm:p-6" style={{ background: "#F7F5F2" }} aria-live="polite">
        {s.n === 0 ? (
          <p className="text-lg" style={{ color: "#333" }}>We didn&apos;t see any {what} in this scan. Try &quot;Any&quot; on one of the choices.</p>
        ) : (
          <>
            <p className="text-xl sm:text-2xl font-bold leading-snug" style={heading}>
              {cap(what)} usually ask about <span className="tabular-nums">{cad(s.median)}</span> a month.
            </p>
            <p className="text-base mt-1"><BasedOn n={s.n} />{s.n >= 2 ? <>. Half ask between <strong className="tabular-nums">{cad(s.p25)}</strong> and <strong className="tabular-nums">{cad(s.p75)}</strong>.</> : "."}</p>
            {s.n >= 2 && <RangeBar min={s.min} p25={s.p25} median={s.median} p75={s.p75} max={s.max} />}
            <div className="mt-4">
              <TextLink onClick={() => drill({ beds: beds ? [beds] : [], type: type ? [type] : [], area: area ? [area] : [], market: "whole", excluded: false })}>See these {s.n} ads →</TextLink>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

function PriceLadder({ rows, drill }: { rows: Obs[]; drill: Ctx["drill"] }) {
  const bands = [
    [0, 1000, "Under $1,000"], [1000, 1500, "$1,000 – $1,499"], [1500, 2000, "$1,500 – $1,999"],
    [2000, 2500, "$2,000 – $2,499"], [2500, 3000, "$2,500 – $2,999"], [3000, Infinity, "$3,000 or more"],
  ] as const;
  const counted = bands.map(([lo, hi, label]) => ({ lo, hi, label, n: rows.filter((o) => o.norm.price! >= lo && o.norm.price! < hi).length }));
  const most = counted.reduce((a, b) => (b.n > a.n ? b : a), counted[0]);
  return (
    <Card title="How much are people asking?" sub={rows.length ? `The biggest group of whole homes asks ${most.label}. Tap a bar to see the ads.` : undefined}>
      <BarList rows={counted.map((b) => ({
        key: b.label, label: b.label, value: b.n, display: `${b.n} ${b.n === 1 ? "ad" : "ads"}`,
        onClick: b.n ? () => drill({ rentMin: b.lo || null, rentMax: Number.isFinite(b.hi) ? b.hi - 1 : null, market: "whole", excluded: false }) : undefined,
      }))} />
    </Card>
  );
}

function Neighbourhoods({ rows, drill }: { rows: Obs[]; drill: Ctx["drill"] }) {
  const [all, setAll] = useState(false);
  const list = useMemo(() => {
    const g = new Map<string, number[]>();
    rows.forEach((o) => { if (o.norm.area) g.set(o.norm.area, [...(g.get(o.norm.area) ?? []), o.norm.price!]); });
    return [...g].map(([a, p]) => ({ a, ...stats(p) })).filter((x) => all || x.n >= 3).sort((x, y) => y.median! - x.median!);
  }, [rows, all]);
  return (
    <Card title="Which areas cost more?" sub="Typical whole-home rent by neighbourhood, most expensive first. Pale bars have fewer than 5 ads, so treat them as rough."
      right={<Choice size="sm" selected={all} onClick={() => setAll(!all)}>{all ? "Showing every area" : "Show every area"}</Choice>}>
      <BarList rows={list.map((x) => ({
        key: x.a, label: x.a, value: x.median!, display: cad(x.median), light: x.n < 5,
        sub: <BasedOn n={x.n} />, onClick: () => drill({ area: [x.a], market: "whole", excluded: false }),
      }))} />
      {!list.length && <p style={{ color: MUTED }}>Not enough ads name a neighbourhood.</p>}
      <p className="text-sm mt-3" style={{ color: MUTED }}>{areaLabel(null)}: {rows.filter((o) => !o.norm.area).length} ads, not shown here.</p>
    </Card>
  );
}

export function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-sm font-semibold mb-2" style={{ color: NAVY }}>{label}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
