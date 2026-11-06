"use client";
import { useMemo, useState } from "react";
import { BEDS_ORDER, bedsLabel, areaLabel, cad, stats, FLAG_TEXT, BLOCKING_FLAGS, type CohortResult, type Obs, type Flag } from "@/lib/market/core";
import type { diffScans } from "@/lib/market/compare";
import { fmtDate, type Ctx } from "./shared";
import { Card, Choice, BigNumber, BasedOn, TextLink, AnimatedNumber, DotPlot, MiniStrip, NAVY, MUTED, BORDER, heading } from "./ui";

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

interface Pick { kind: "whole" | "room"; beds: string | null; type: string | null; area: string | null }

export default function Overview({ ctx, res, compare, sourceMedian }: {
  ctx: Ctx; res: CohortResult; compare: CompareInfo; sourceMedian: { n: number | null; median: number | null } | null;
}) {
  const { drill, snapshot } = ctx;
  const [pick, setPick] = useState<Pick>({ kind: "whole", beds: null, type: null, area: null });
  const set = (p: Partial<Pick>) => setPick((cur) => ({ ...cur, ...p }));

  const pool = pick.kind === "whole" ? res.whole : res.room;
  const fits = (o: Obs, skip?: keyof Pick) =>
    (skip === "beds" || !pick.beds || o.norm.beds_cat === pick.beds) &&
    (skip === "type" || !pick.type || o.norm.type === pick.type) &&
    (skip === "area" || !pick.area || o.norm.area === pick.area);
  const match = pool.filter((o) => fits(o));
  const s = stats(match.map((o) => o.norm.price!));
  const anyPick = !!(pick.beds || pick.type || pick.area);

  const what = pick.kind === "room"
    ? `Rooms${pick.area ? ` in ${pick.area}` : ""}`
    : `${pick.beds ? `${bedsLabel(pick.beds).replace(" bed", "-bed")} ` : ""}${pick.type ? typeWord(pick.type) : "homes"}${pick.area ? ` in ${pick.area}` : ""}`;

  const types = useMemo(() => counts(pool, (o) => o.norm.type), [pool]);
  const areas = useMemo(() => counts(pool, (o) => o.norm.area).filter(([a]) => a), [pool]);
  const review = res.matched.filter((o) => o.cohort === "review" || o.cohort === "none");
  const comparable = !!compare.diff && !compare.warnings.length;

  return (
    <div className="grid gap-5">
      {/* ── The centrepiece: one sentence, every ad as a dot, tap to narrow ── */}
      <Card>
        <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: MUTED }}>Facebook rental ads · collected {fmtDate(snapshot.scan_date)}</p>
        <h2 className="text-3xl sm:text-5xl font-bold leading-tight mt-3" style={heading} aria-live="polite">
          {cap(what.charAt(0).toLowerCase() + what.slice(1))} usually ask{" "}
          <span style={{ color: s.n ? NAVY : MUTED }}>{s.n ? <AnimatedNumber value={s.median} /> : "—"}</span>
          {pick.kind === "room" ? " a room." : " a month."}
        </h2>
        <p className="text-base sm:text-lg mt-3" style={{ color: "#333" }}>
          {s.n >= 2 ? <>Half of them ask between <strong className="tabular-nums">{cad(s.p25)}</strong> and <strong className="tabular-nums">{cad(s.p75)}</strong>. </> : null}
          <BasedOn n={s.n} />.
        </p>

        <div className="grid gap-3 mt-6">
          <Line label="Looking at">
            <Choice size="sm" selected={pick.kind === "whole"} onClick={() => set({ kind: "whole", type: null })}>Whole homes</Choice>
            <Choice size="sm" selected={pick.kind === "room"} onClick={() => set({ kind: "room", type: null, beds: null })}>Single rooms</Choice>
          </Line>
          {pick.kind === "whole" && (
            <>
              <Line label="Bedrooms">
                <Choice size="sm" selected={!pick.beds} onClick={() => set({ beds: null })}>Any</Choice>
                {BEDS_ORDER.filter((b) => b !== "unknown" && pool.some((o) => o.norm.beds_cat === b)).map((b) => (
                  <Choice key={b} size="sm" selected={pick.beds === b} onClick={() => set({ beds: pick.beds === b ? null : b })}>{bedsLabel(b)}</Choice>
                ))}
              </Line>
              <Line label="Type">
                <Choice size="sm" selected={!pick.type} onClick={() => set({ type: null })}>Any</Choice>
                {types.map(([t]) => <Choice key={t} size="sm" selected={pick.type === t} onClick={() => set({ type: pick.type === t ? null : t })}>{cap(t!)}</Choice>)}
              </Line>
            </>
          )}
          <Line label="Area">
            <Choice size="sm" selected={!pick.area} onClick={() => set({ area: null })}>Anywhere</Choice>
            {areas.slice(0, 8).map(([a]) => <Choice key={a} size="sm" selected={pick.area === a} onClick={() => set({ area: pick.area === a ? null : a })}>{a}</Choice>)}
            {areas.length > 8 && (
              <select aria-label="More areas" value={areas.slice(8).some(([a]) => a === pick.area) ? pick.area! : ""} onChange={(e) => set({ area: e.target.value || null })}
                className="border-2 rounded-xl px-3 text-sm font-semibold bg-white min-h-[40px]" style={{ borderColor: areas.slice(8).some(([a]) => a === pick.area) ? NAVY : BORDER, color: NAVY }}>
                <option value="">More areas…</option>
                {areas.slice(8).map(([a, n]) => <option key={a} value={a!}>{a} ({n})</option>)}
              </select>
            )}
          </Line>
        </div>

        <div className="mt-10">
          <DotPlot
            dots={pool.map((o) => ({ id: o.listing_id, price: o.norm.price!, title: o.norm.title || "Untitled ad", detail: `${cap(o.norm.type)} · ${bedsLabel(o.norm.beds_cat)} · ${areaLabel(o.norm.area)}`, on: fits(o) }))}
            median={s.median} p25={s.n >= 2 ? s.p25 : null} p75={s.n >= 2 ? s.p75 : null} onOpen={ctx.openListing} />
          <p className="text-sm mt-2" style={{ color: MUTED }}>
            Each dot is one ad. Dark dots match your choices; the shaded band is where the middle half sits. Hover a dot to peek, click to open it.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-5">
          <button type="button" onClick={() => drill({ market: pick.kind, beds: pick.beds ? [pick.beds] : [], type: pick.type ? [pick.type] : [], area: pick.area ? [pick.area] : [], excluded: false })}
            className="px-6 py-3 text-sm font-semibold uppercase tracking-widest rounded transition-opacity hover:opacity-80" style={{ backgroundColor: "#8B2030", color: "#FAF8F5" }}>
            See these {s.n} ads
          </button>
          {anyPick && <TextLink onClick={() => set({ beds: null, type: null, area: null })}>Start over</TextLink>}
        </div>
      </Card>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <BigNumber label="Ads we saw" value={<AnimatedNumber value={res.matched.length} format={(v) => String(v)} />} note="Homes and rooms" onClick={() => drill({ market: "all" })} />
        <BigNumber label="New since last time" value={comparable ? compare.diff!.firstSeen.length : "Soon"} muted={!comparable}
          note={comparable ? `Since ${fmtDate(compare.snapDate)}` : "After next Friday's scan"} onClick={comparable ? () => ctx.setTab("trends") : undefined} />
        <BigNumber label="Price drops" value={comparable ? compare.diff!.reduced.length : "Soon"} muted={!comparable}
          note={comparable ? `Of ${compare.diff!.pairs.length} ads seen twice` : "After next Friday's scan"} onClick={comparable ? () => ctx.setTab("trends") : undefined} />
        <BigNumber label="Need a second look" value={review.length} note="Confusing ads, left out of prices" onClick={() => drill({ flags: ["room_whole_conflict"], excluded: true, market: "all" })} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Glance title="Neighbourhoods at a glance" sub={`${what.replace(/ in .*$/, "")} in each area. Tap one to focus on it above.`}
          rows={areas.map(([a]) => ({ key: a!, label: a!, prices: pool.filter((o) => o.norm.area === a && fits(o, "area")).map((o) => o.norm.price!) }))
            .filter((r) => r.prices.length >= 3)}
          active={pick.area} onPick={(k) => { set({ area: pick.area === k ? null : k }); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          foot={`${pool.filter((o) => !o.norm.area && fits(o, "area")).length} matching ads don't say where they are, and areas with fewer than 3 ads are hidden.`} />
        {pick.kind === "whole" ? (
          <Glance title="Bedrooms at a glance" sub={`More bedrooms, higher rent. Tap one to focus on it above.`}
            rows={BEDS_ORDER.filter((b) => b !== "unknown").map((b) => ({ key: b, label: bedsLabel(b), prices: pool.filter((o) => o.norm.beds_cat === b && fits(o, "beds")).map((o) => o.norm.price!) })).filter((r) => r.prices.length)}
            active={pick.beds} onPick={(k) => { set({ beds: pick.beds === k ? null : k }); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
        ) : (
          <Glance title="Homes vs rooms" sub="A room in a shared home vs renting the whole place."
            rows={[{ key: "whole", label: "Whole homes", prices: res.whole.map((o) => o.norm.price!) }, { key: "room", label: "Single rooms", prices: res.room.map((o) => o.norm.price!) }]}
            active={pick.kind} onPick={(k) => set({ kind: k as Pick["kind"], beds: null, type: null })} />
        )}
      </div>

      <Card title="Good to know">
        <div className="flex flex-wrap gap-2">
          {ctx.snapshots.length < 2 && <Chip>First scan: changes show up after next Friday</Chip>}
          {review.length > 0 && <Chip onClick={() => drill({ flags: ["room_whole_conflict"], excluded: true, market: "all" })} warn>{review.length} ads say &quot;room&quot; but are priced like a home, left out</Chip>}
          {sourceMedian?.median != null && <Chip onClick={() => ctx.setTab("data")}>Your Sheet says {cad(sourceMedian.median)}, we say {cad(res.wholeStats.median)}. Why?</Chip>}
          <Chip>{res.matched.filter((o) => !o.norm.area).length} ads don&apos;t name a neighbourhood</Chip>
          {[...new Set(res.matched.flatMap((o) => o.flags))].filter((f) => !BLOCKING_FLAGS.includes(f) && f !== "reviewed").map((f) => (
            <Chip key={f} onClick={() => drill({ flags: [f], market: "all" })}>{res.matched.filter((o) => o.flags.includes(f)).length} ads: {FLAG_TEXT[f as Flag].toLowerCase()}</Chip>
          ))}
          <Chip>Asking prices in ads, not signed leases</Chip>
        </div>
      </Card>
    </div>
  );
}

function counts(rows: Obs[], key: (o: Obs) => string | null): [string | null, number][] {
  const c = new Map<string | null, number>();
  rows.forEach((o) => c.set(key(o), (c.get(key(o)) ?? 0) + 1));
  return [...c].sort((a, b) => b[1] - a[1]);
}

function Glance({ title, sub, rows, active, onPick, foot }: {
  title: string; sub: string; rows: { key: string; label: string; prices: number[] }[];
  active: string | null; onPick: (k: string) => void; foot?: string;
}) {
  const withStats = rows.map((r) => ({ ...r, s: stats(r.prices) })).sort((a, b) => (b.s.median ?? 0) - (a.s.median ?? 0));
  return (
    <Card title={title} sub={sub}>
      <div className="grid gap-1">
        {withStats.map((r) => (
          <button key={r.key} type="button" onClick={() => onPick(r.key)} aria-pressed={active === r.key}
            className="grid items-center gap-3 rounded-xl px-3 py-2 -mx-3 text-left transition-colors hover:bg-[#F7F5F2]"
            style={{ gridTemplateColumns: "minmax(90px, 140px) 1fr 76px", background: active === r.key ? "#F1EEE9" : undefined }}>
            <span className="text-[15px] font-semibold truncate" style={{ color: NAVY }}>{r.label}</span>
            <MiniStrip prices={r.prices} median={r.s.median} active={active === r.key} />
            <span className="text-right tabular-nums">
              <span className="font-bold" style={{ color: NAVY }}>{cad(r.s.median)}</span>
              <span className="block text-xs" style={{ color: r.s.n < 5 ? "#7A5200" : MUTED }}>{r.s.n} ads</span>
            </span>
          </button>
        ))}
      </div>
      {foot && <p className="text-sm mt-3" style={{ color: MUTED }}>{foot}</p>}
    </Card>
  );
}

function Chip({ children, onClick, warn }: { children: React.ReactNode; onClick?: () => void; warn?: boolean }) {
  const cls = "text-sm rounded-full px-3 py-2 border transition-colors";
  const style = { background: warn ? "#FBF1DC" : "#F7F5F2", color: warn ? "#7A5200" : "#333", borderColor: warn ? "#F0DDB0" : BORDER };
  return onClick
    ? <button type="button" onClick={onClick} className={`${cls} hover:border-[#1F2F3A]`} style={style}>{children} →</button>
    : <span className={cls} style={style}>{children}</span>;
}

function Line({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <span className="text-sm font-semibold w-24 shrink-0" style={{ color: MUTED }}>{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
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
