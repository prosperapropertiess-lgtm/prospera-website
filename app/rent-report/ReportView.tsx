"use client";
import { useState } from "react";
import Link from "next/link";
import { BEDS_ORDER, bedsLabel, cad, stats, percentileOf } from "@/lib/market/core";
import type { ReportData, PublicDot } from "@/lib/market/report";
import { Card, Choice, AnimatedNumber, DotPlot, BarList, BasedOn, TextLink, NAVY, MUTED, BORDER, BURGUNDY, heading } from "@/app/admin/market/ui";
import { Glance, cap, typeWord } from "@/app/admin/market/Overview";

interface Pick { kind: "whole" | "room"; beds: string | null; type: string | null; area: string | null }

const signed = (n: number) => `${n > 0 ? "up" : "down"} ${cad(Math.abs(n))}`;
const fmtDay = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" });

export default function ReportView({ data }: { data: ReportData }) {
  const [pick, setPick] = useState<Pick>({ kind: "whole", beds: null, type: null, area: null });
  const set = (p: Partial<Pick>) => setPick((c) => ({ ...c, ...p }));
  const pool = data.dots.filter((d) => d.c === pick.kind);
  const fits = (d: PublicDot, skip?: keyof Pick) =>
    (skip === "beds" || !pick.beds || d.b === pick.beds) && (skip === "type" || !pick.type || d.t === pick.type) && (skip === "area" || !pick.area || d.a === pick.area);
  const match = pool.filter((d) => fits(d));
  const s = stats(match.map((d) => d.p));
  const what = pick.kind === "room"
    ? `A room${pick.area ? ` in ${pick.area}` : ""}`
    : `${pick.beds ? `${bedsLabel(pick.beds).replace(" bed", "-bed")} ` : ""}${pick.type ? typeWord(pick.type) : "homes"}${pick.area ? ` in ${pick.area}` : ""}`;
  const plural = pick.kind === "whole";

  const types = tally(pool.map((d) => d.t));
  const areas = tally(pool.map((d) => d.a).filter((a): a is string => !!a));
  const weekly = data.edition.kind === "weekly";
  const delta = data.prev?.comparable && data.prev.whole.median != null && data.whole.median != null ? data.whole.median - data.prev.whole.median : null;

  return (
    <div className="min-h-screen" style={{ background: "#F7F5F2", fontFamily: "var(--font-dm-sans)" }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-14 grid gap-6">

        {/* Masthead */}
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#666" }}>Prospera Properties · {weekly ? "Weekly" : "Monthly"} edition</p>
            <h1 className="text-4xl sm:text-6xl font-bold leading-none mt-2" style={heading}>London Rent Report</h1>
            <p className="text-lg mt-2" style={{ color: MUTED }}>{data.edition.label}</p>
          </div>
          <EditionPicker data={data} />
        </header>

        {/* Centrepiece */}
        <Card>
          <h2 className="text-3xl sm:text-5xl font-bold leading-tight" style={heading} aria-live="polite">
            {cap(what)} {plural ? "are" : "is"} asking{" "}
            <span>{s.n ? <AnimatedNumber value={s.median} /> : "—"}</span>
            {pick.kind === "room" ? " a month." : " a month."}
          </h2>
          <p className="text-base sm:text-lg mt-3" style={{ color: "#333" }}>
            {s.n >= 2 && <>Half of these ads ask between <strong className="tabular-nums">{cad(s.p25)}</strong> and <strong className="tabular-nums">{cad(s.p75)}</strong>. </>}
            <BasedOn n={s.n} what="ads" /> on Facebook Marketplace{weekly ? " this week" : " this month"}.
            {!pick.beds && !pick.type && !pick.area && pick.kind === "whole" && delta != null && delta !== 0 && <> That&apos;s {signed(delta)} from the {data.prev!.label}.</>}
          </p>

          <div className="grid gap-3 mt-6">
            <Line label="Show me">
              <Choice size="sm" selected={pick.kind === "whole"} onClick={() => set({ kind: "whole" })}>Whole homes</Choice>
              <Choice size="sm" selected={pick.kind === "room"} onClick={() => set({ kind: "room", beds: null, type: null })}>Single rooms</Choice>
            </Line>
            {pick.kind === "whole" && (
              <>
                <Line label="Bedrooms">
                  <Choice size="sm" selected={!pick.beds} onClick={() => set({ beds: null })}>Any</Choice>
                  {BEDS_ORDER.filter((b) => b !== "unknown" && pool.some((d) => d.b === b)).map((b) => (
                    <Choice key={b} size="sm" selected={pick.beds === b} onClick={() => set({ beds: pick.beds === b ? null : b })}>{bedsLabel(b)}</Choice>
                  ))}
                </Line>
                <Line label="Type">
                  <Choice size="sm" selected={!pick.type} onClick={() => set({ type: null })}>Any</Choice>
                  {types.filter(([, n]) => n >= 3).map(([t]) => <Choice key={t} size="sm" selected={pick.type === t} onClick={() => set({ type: pick.type === t ? null : t })}>{cap(t)}</Choice>)}
                </Line>
              </>
            )}
            <Line label="Area">
              <Choice size="sm" selected={!pick.area} onClick={() => set({ area: null })}>All of London</Choice>
              {areas.filter(([, n]) => n >= 5).slice(0, 7).map(([a]) => <Choice key={a} size="sm" selected={pick.area === a} onClick={() => set({ area: pick.area === a ? null : a })}>{a}</Choice>)}
            </Line>
          </div>

          <div className="mt-12">
            <DotPlot median={s.median} p25={s.n >= 2 ? s.p25 : null} p75={s.n >= 2 ? s.p75 : null}
              dots={pool.map((d, i) => ({ id: String(i), price: d.p, title: "", detail: `${pick.kind === "room" ? "Room" : `${bedsLabel(d.b)} ${d.t}`}${d.a ? ` · ${d.a}` : ""}`, on: fits(d) }))} />
            <p className="text-sm mt-2" style={{ color: MUTED }}>Every dot is one real ad. Dark dots match what you picked. Hover over one to see it.</p>
          </div>
        </Card>

        {/* Headline numbers */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Tile label="Rentals advertised" value={<AnimatedNumber value={data.observed} format={(v) => String(v)} />} note={`Ads our scan found${weekly ? " this week" : ""}`} />
          <Tile label="Typical whole home" value={<AnimatedNumber value={data.whole.median} />} note={delta != null && delta !== 0 ? `${cap(signed(delta))} from last ${weekly ? "week" : "month"}` : data.isFirst ? "First edition" : "No change"} />
          <Tile label="Typical room" value={<AnimatedNumber value={data.room.median} />} note={`${data.room.n} room ads`} />
          {data.changes && data.prev?.comparable
            ? <Tile label="Price cuts" value={data.changes.reduced} note={`Of ${data.changes.pairs} ads seen both ${weekly ? "weeks" : "months"}`} />
            : <Tile label="Price cuts" value="Next week" muted note="Needs two scans to compare" />}
        </div>

        <CheckYourRent dots={data.dots} />

        <div className="grid gap-5 lg:grid-cols-2">
          <Glance limit={8} title="Neighbourhoods" sub={`${cap(what.replace(/ in .*$/, "").replace(/^A room$/, "Rooms"))} by area, priciest first. Tap one to explore it above.`}
            rows={areas.map(([a]) => ({ key: a, label: a, prices: pool.filter((d) => d.a === a && fits(d, "area")).map((d) => d.p) })).filter((r) => r.prices.length >= 3)}
            active={pick.area} onPick={(k) => { set({ area: pick.area === k ? null : k }); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            foot={`${pool.filter((d) => !d.a).length} ads don't name a neighbourhood, so they only count toward the London-wide numbers.`} />
          <Glance keepOrder title="Bedrooms" sub="How asking rent climbs with each bedroom, for whole homes."
            rows={BEDS_ORDER.filter((b) => b !== "unknown").map((b) => ({ key: b, label: bedsLabel(b), prices: data.dots.filter((d) => d.c === "whole" && d.b === b).map((d) => d.p) })).filter((r) => r.prices.length)}
            active={pick.beds} onPick={(k) => { set({ kind: "whole", beds: pick.beds === k ? null : k }); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
        </div>

        <Card title="What tenants are being offered" sub="Among whole-home ads that mention each thing. Many ads don't say, so each line shows how many did.">
          <BarList max={100} rows={data.amenities.filter((a) => a.stated >= 5).map((a) => {
            const pct = Math.round((100 * a.yes) / a.stated);
            return { key: a.label, label: a.label, value: pct, display: `${pct}%`, sub: `${a.yes} of ${a.stated} ads that mention it` };
          })} />
        </Card>

        {data.changes && (
          <Card title={`Since the ${data.prev!.label}`} sub={data.prev!.comparable ? undefined : "The two scans searched differently, so these counts aren't a like-for-like comparison."}>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              <Tile label="New ads" value={data.changes.firstSeen} note="Not in the previous scan" />
              <Tile label="Price cuts" value={data.changes.reduced} note={data.changes.medianCutPct != null ? `Typical cut ${Math.abs(data.changes.medianCutPct).toFixed(1)}%` : "Among ads seen both times"} />
              <Tile label="Gone from the scan" value={data.changes.notSeen} note="Not seen again. That doesn't always mean rented." />
            </div>
          </Card>
        )}

        <Method data={data} />

        {/* The one action */}
        <section className="rounded-2xl p-7 sm:p-10 text-center" style={{ background: NAVY }}>
          <h2 className="text-2xl sm:text-4xl font-bold" style={{ fontFamily: "var(--font-cormorant)", color: "#FAF8F5" }}>What should your home rent for?</h2>
          <p className="text-base sm:text-lg mt-3 max-w-2xl mx-auto" style={{ color: "rgba(250,248,245,0.8)" }}>
            The market is one input. Your home&apos;s size, condition and street are the rest. Tell us about it and we&apos;ll send you a rent estimate, free.
          </p>
          <Link href="/rent-analysis" className="inline-block mt-6 px-8 py-4 text-sm font-semibold uppercase tracking-widest rounded transition-opacity hover:opacity-90" style={{ backgroundColor: BURGUNDY, color: "#FAF8F5" }}>
            Get my free rent analysis
          </Link>
        </section>

        <Archive data={data} />
      </div>
    </div>
  );
}

function tally(values: string[]): [string, number][] {
  const c = new Map<string, number>();
  values.forEach((v) => c.set(v, (c.get(v) ?? 0) + 1));
  return [...c].sort((a, b) => b[1] - a[1]);
}

function Line({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <span className="text-sm font-semibold w-24 shrink-0" style={{ color: MUTED }}>{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Tile({ label, value, note, muted }: { label: string; value: React.ReactNode; note?: string; muted?: boolean }) {
  return (
    <div className="bg-white border-2 rounded-2xl p-5 h-full" style={{ borderColor: BORDER }}>
      <div className="text-sm font-semibold" style={{ color: MUTED }}>{label}</div>
      <div className="text-3xl sm:text-4xl font-bold mt-1 tabular-nums" style={{ ...heading, color: muted ? "#9AA3A9" : NAVY }}>{value}</div>
      {note && <div className="text-sm mt-1" style={{ color: MUTED }}>{note}</div>}
    </div>
  );
}

/** An owner types their rent and bedrooms and sees where it lands. Nothing is sent anywhere. */
function CheckYourRent({ dots }: { dots: PublicDot[] }) {
  const [beds, setBeds] = useState("2");
  const [rent, setRent] = useState("");
  const prices = dots.filter((d) => d.c === "whole" && d.b === beds).map((d) => d.p);
  const s = stats(prices);
  const v = Number(rent.replace(/[^0-9]/g, ""));
  const pct = v > 0 && prices.length >= 5 ? percentileOf(v, prices)! : null;
  return (
    <Card title="Where does your rent land?" sub="Pick your bedrooms and type your rent. This stays on your screen; nothing is sent.">
      <div className="flex flex-wrap gap-2 items-center">
        {BEDS_ORDER.filter((b) => b !== "unknown" && dots.some((d) => d.c === "whole" && d.b === b)).map((b) => (
          <Choice key={b} size="sm" selected={beds === b} onClick={() => setBeds(b)}>{bedsLabel(b)}</Choice>
        ))}
        <label className="flex items-center gap-2 ml-0 sm:ml-2">
          <span className="sr-only">Your monthly rent</span>
          <span className="text-lg font-bold" style={{ color: NAVY }}>$</span>
          <input inputMode="numeric" placeholder="1,800" value={rent} onChange={(e) => setRent(e.target.value)}
            className="w-32 px-3 py-2 border-2 rounded-xl text-lg font-semibold tabular-nums" style={{ borderColor: BORDER, background: "#F7F5F2", color: NAVY }} />
          <span className="text-sm" style={{ color: MUTED }}>a month</span>
        </label>
      </div>
      <div className="mt-8">
        <DotPlot median={s.median} p25={s.n >= 2 ? s.p25 : null} p75={s.n >= 2 ? s.p75 : null} you={v > 0 ? [v] : undefined}
          dots={prices.map((p, i) => ({ id: String(i), price: p, title: "", detail: `${bedsLabel(beds)} home`, on: true }))} />
      </div>
      <p className="text-lg mt-4 font-semibold" style={{ color: NAVY }} aria-live="polite">
        {pct == null
          ? v > 0 ? `Only ${prices.length} ${bedsLabel(beds)} ads this time, too few to place your rent.` : `Type your rent to see where it sits among ${prices.length} ${bedsLabel(beds)} ads.`
          : `${cad(v)} is higher than about ${Math.round(pct)}% of ${bedsLabel(beds)} ads this week, ${v > s.median! ? `${cad(v - s.median!)} above` : v < s.median! ? `${cad(s.median! - v)} below` : "right at"} the typical ${cad(s.median)}.`}
      </p>
    </Card>
  );
}

function Method({ data }: { data: ReportData }) {
  const m = data.method;
  return (
    <Card title="Where these numbers come from" sub="We'd rather you trust a smaller, honest number than a big, vague one.">
      <ul className="grid gap-3 text-[15px] leading-relaxed" style={{ color: "#333" }}>
        <li><strong style={{ color: NAVY }}>Source.</strong> Public rental ads on Facebook Marketplace within {m.radiusKm ?? 25} km of London, Ontario, collected on {fmtDay(data.scanDate)}.</li>
        <li><strong style={{ color: NAVY }}>How deep.</strong> {m.segments ? `${m.segments} separate searches` : "A set of searches"} (by home type and bedrooms){m.pagesPerSearch ? `, reading up to ${m.pagesPerSearch} pages of results each, newest first` : ""}. {m.rawHits ? `That turned up ${m.rawHits.toLocaleString()} search results, which came down to ` : "That came down to "}{data.observed} different ads once repeats were removed.</li>
        <li><strong style={{ color: NAVY }}>What we count.</strong> {data.whole.n} whole-home ads and {data.room.n} single-room ads have a usable monthly price. Homes and rooms are never mixed in one number. Ads that are unclear (for example, a &quot;room&quot; priced like a whole home) are left out.</li>
        <li><strong style={{ color: NAVY }}>What it isn&apos;t.</strong> These are asking rents, not signed leases. It&apos;s the ads our scan reached, not every rental in the city; newer ads are easier to reach than older ones. {data.areasNamed} of the counted ads name a neighbourhood; we never guess the rest.</li>
        <li><strong style={{ color: NAVY }}>Typical.</strong> &quot;Typical&quot; is the median: half the ads ask more, half ask less.</li>
      </ul>
    </Card>
  );
}

function EditionPicker({ data }: { data: ReportData }) {
  const weekly = data.editions.filter((e) => e.kind === "weekly");
  const monthly = data.editions.filter((e) => e.kind === "monthly");
  return (
    <nav aria-label="Editions" className="flex gap-1 p-1.5 rounded-2xl bg-white" style={{ border: `1px solid ${BORDER}` }}>
      {[{ k: "weekly", label: "Weekly", href: weekly[0] ? `/rent-report/${weekly[0].key}` : null }, { k: "monthly", label: "Monthly", href: monthly[0] ? `/rent-report/${monthly[0].key}` : null }].map((t) => t.href && (
        <Link key={t.k} href={t.href} className="px-4 py-2 rounded-xl text-[15px] font-semibold" aria-current={data.edition.kind === t.k ? "page" : undefined}
          style={{ background: data.edition.kind === t.k ? NAVY : "transparent", color: data.edition.kind === t.k ? "#FAF8F5" : NAVY }}>{t.label}</Link>
      ))}
    </nav>
  );
}

function Archive({ data }: { data: ReportData }) {
  return (
    <div className="text-center text-sm" style={{ color: MUTED }}>
      <p className="mb-2">Past editions</p>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {data.editions.map((e) => (
          <Link key={`${e.kind}-${e.key}`} href={`/rent-report/${e.key}`} className="underline underline-offset-2" style={{ color: e.key === data.edition.key ? NAVY : MUTED, fontWeight: e.key === data.edition.key ? 700 : 400 }}>
            {e.kind === "weekly" ? e.label : `${e.label} (monthly)`}
          </Link>
        ))}
      </div>
      <p className="mt-6">© Prospera Properties · London, Ontario · <TextLink onClick={() => window.print()}>Print</TextLink></p>
    </div>
  );
}
