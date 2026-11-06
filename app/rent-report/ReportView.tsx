"use client";
import { useState } from "react";
import Link from "next/link";
import { BEDS_ORDER, bedsLabel, cad, stats, percentileOf } from "@/lib/market/core";
import type { ReportData, PublicDot } from "@/lib/market/report";
import { Card, Choice, AnimatedNumber, DotPlot, BarList, BasedOn, TextLink, NAVY, MUTED, BORDER, BURGUNDY, heading } from "@/app/admin/market/ui";
import { Glance, cap, typeWord } from "@/app/admin/market/Overview";
import { TypeCards, BedsBar, BathsBar, AreaCards, MAP_CREDIT, bathFits, bathGroup, BATH_GROUPS } from "@/app/admin/market/pickers";
import Moving from "./Moving";

interface Pick { kind: "whole" | "room"; beds: string | null; baths: string | null; type: string | null; area: string | null }

const signed = (n: number) => `${n > 0 ? "up" : "down"} ${cad(Math.abs(n))}`;
const fmtDay = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" });

export default function ReportView({ data }: { data: ReportData }) {
  const [pick, setPick] = useState<Pick>({ kind: "whole", beds: null, baths: null, type: null, area: null });
  const set = (p: Partial<Pick>) => setPick((c) => ({ ...c, ...p }));
  const pool = data.dots.filter((d) => d.c === pick.kind);
  const fits = (d: PublicDot, skip?: keyof Pick) =>
    (skip === "beds" || !pick.beds || d.b === pick.beds) && (skip === "baths" || bathFits(pick, d.h)) && (skip === "type" || !pick.type || d.t === pick.type) && (skip === "area" || !pick.area || d.a === pick.area);
  const match = pool.filter((d) => fits(d));
  const s = stats(match.map((d) => d.p));
  const what = pick.kind === "room"
    ? `A room${pick.area ? ` in ${pick.area}` : ""}`
    : `${pick.beds ? `${bedsLabel(pick.beds).replace(" bed", "-bed")} ` : ""}${pick.type ? typeWord(pick.type) : "homes"}${pick.baths ? ` with ${pick.baths} bath${pick.baths === "1" ? "" : "s"}` : ""}${pick.area ? ` in ${pick.area}` : ""}`;
  const plural = pick.kind === "whole";

  const areas = tally(pool.map((d) => d.a).filter((a): a is string => !!a));
  const weekly = data.edition.kind === "weekly";
  const delta = data.prev?.comparable && data.prev.whole.median != null && data.whole.median != null ? data.whole.median - data.prev.whole.median : null;

  return (
    <div className="min-h-screen" style={{ background: "#F7F5F2", fontFamily: "var(--font-dm-sans)" }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-28 sm:pt-32 pb-14 grid gap-6">

        {/* Masthead */}
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#666" }}>Prospera Properties · {weekly ? "Weekly" : "Monthly"} edition</p>
            <h1 className="text-4xl sm:text-6xl font-bold leading-none mt-2" style={heading}>London Rent Report</h1>
            <p className="text-lg mt-2" style={{ color: MUTED }}>{data.edition.label}</p>
          </div>
          <EditionPicker data={data} />
        </header>

        <TrustStrip data={data} />

        {/* Centrepiece */}
        <Card>
          <h2 className="text-3xl sm:text-5xl font-bold leading-tight" style={heading} aria-live="polite">
            {cap(what)} {plural ? "are" : "is"} asking{" "}
            <span>{s.n ? <AnimatedNumber value={s.median} /> : "—"}</span>
            {pick.kind === "room" ? " a month." : " a month."}
          </h2>
          <p className="text-base sm:text-lg mt-3" style={{ color: "#333" }}>
            {s.n >= 2 && <>Half of these ads ask between <strong className="tabular-nums">{cad(s.p25)}</strong> and <strong className="tabular-nums">{cad(s.p75)}</strong>. </>}
            <BasedOn n={s.n} what="ads" /> from {data.sources.map((x) => x.name).join(" and ")}{weekly ? " this week" : " this month"}.
            {!pick.beds && !pick.type && !pick.area && pick.kind === "whole" && delta != null && delta !== 0 && <> That&apos;s {signed(delta)} from the {data.prev!.label}.</>}
          </p>

          <div className="grid gap-6 mt-8 min-w-0">
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: MUTED }}>What kind of place?</div>
              <TypeCards dots={data.dots} pick={pick} set={set} />
            </div>
            {pick.kind === "whole" && (
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: MUTED }}>How many bedrooms?</div>
                <BedsBar dots={data.dots} pick={pick} set={set} />
              </div>
            )}
            {pick.kind === "whole" && (
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: MUTED }}>How many bathrooms?</div>
                <BathsBar dots={data.dots} pick={pick} set={set} />
              </div>
            )}
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: MUTED }}>Where in London?</div>
              <AreaCards dots={data.dots} pick={pick} set={set} />
            </div>
          </div>

          <div className="mt-12">
            <DotPlot median={s.median} p25={s.n >= 2 ? s.p25 : null} p75={s.n >= 2 ? s.p75 : null}
              dots={pool.map((d, i) => ({ id: String(i), price: d.p, title: "", detail: `${pick.kind === "room" ? "Room" : `${bedsLabel(d.b)} ${d.t}`}${d.a ? ` · ${d.a}` : ""}`, on: fits(d) }))} />
            <p className="text-sm mt-2" style={{ color: MUTED }}>Every dot is one real ad. Dark dots match what you picked. Hover over one to see it.</p>
            <p className="text-xs mt-1" style={{ color: MUTED }}>{MAP_CREDIT}</p>
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

        <Moving history={data.history} sitting={data.sitting} period={weekly ? "week" : "month"} />

        <Method data={data} />

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

        <Card title="What tenants are being offered" sub="Among whole-home ads that say either way. We only show a detail when most ads mention it, because ads tend to mention extras only when they have them.">
          <BarList max={100} rows={data.amenities.filter((a) => a.stated >= Math.max(20, data.whole.n * 0.4)).map((a) => {
            const pct = Math.round((100 * a.yes) / a.stated);
            return { key: a.label, label: a.label, value: pct, display: `${pct}%`, sub: `${a.yes} of ${a.stated} ads that mention it` };
          })} />
        </Card>


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

/** Small, always-visible proof: how many ads, how recent, from where. */
function TrustStrip({ data }: { data: ReportData }) {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Toronto" });
  const days = Math.max(0, Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${data.scanDate}T00:00:00Z`)) / 86_400_000));
  const ago = days === 0 ? "today" : days === 1 ? "yesterday" : `${days} days ago`;
  const items = [
    { big: data.observed.toLocaleString(), small: "rental listings analysed" },
    { big: ago.charAt(0).toUpperCase() + ago.slice(1), small: `last updated, ${fmtDay(data.scanDate)}` },
    { big: data.method.rawHits ? data.method.rawHits.toLocaleString() : `${data.counted}`, small: data.method.rawHits ? "search results checked" : "ads counted in prices" },
    {
      big: data.sources.length === 1 ? data.sources[0].name : `${data.sources.length} rental sites`,
      small: (() => {
        const coming = PLANNED_SOURCES.filter((p) => !data.sources.some((x) => x.name === p));
        const now = data.sources.length > 1 ? data.sources.map((x) => x.name).join(", ") : "this week's source";
        return coming.length ? `${now} · ${coming.join(" and ")} being added` : now;
      })(),
    },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 rounded-2xl overflow-hidden border" style={{ borderColor: BORDER, background: BORDER, gap: 1 }}>
      {items.map((x) => (
        <div key={x.small} className="bg-white px-5 py-4">
          <div className="text-xl sm:text-2xl font-bold tabular-nums leading-tight" style={heading}>{x.big}</div>
          <div className="text-sm mt-0.5" style={{ color: MUTED }}>{x.small}</div>
        </div>
      ))}
    </div>
  );
}

function tally(values: string[]): [string, number][] {
  const c = new Map<string, number>();
  values.forEach((v) => c.set(v, (c.get(v) ?? 0) + 1));
  return [...c].sort((a, b) => b[1] - a[1]);
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
  const [baths, setBaths] = useState<string | null>(null);
  const [rent, setRent] = useState("");
  const prices = dots.filter((d) => d.c === "whole" && d.b === beds && (!baths || bathGroup(d.h) === baths)).map((d) => d.p);
  const kind = `${bedsLabel(beds).replace(" bed", "-bed")}${baths ? `, ${baths}-bath` : ""}`;
  const s = stats(prices);
  const v = Number(rent.replace(/[^0-9]/g, ""));
  const pct = v > 0 && prices.length >= 5 ? percentileOf(v, prices)! : null;
  return (
    <Card title="Where does your rent land?" sub="Pick your bedrooms and bathrooms, then type your rent. This stays on your screen; nothing is sent.">
      <div className="flex flex-wrap gap-2 items-center">
        {BEDS_ORDER.filter((b) => b !== "unknown" && dots.some((d) => d.c === "whole" && d.b === b)).map((b) => (
          <Choice key={b} size="sm" selected={beds === b} onClick={() => setBeds(b)}>{bedsLabel(b)}</Choice>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 items-center mt-3">
        <Choice size="sm" selected={!baths} onClick={() => setBaths(null)}>Any baths</Choice>
        {BATH_GROUPS.filter((g) => dots.some((d) => d.c === "whole" && d.b === beds && bathGroup(d.h) === g)).map((g) => (
          <Choice key={g} size="sm" selected={baths === g} onClick={() => setBaths(g)}>{g} bath</Choice>
        ))}
        <label className="flex items-center gap-2 ml-0 sm:ml-2">
          <span className="sr-only">Your monthly rent</span>
          <span className="text-lg font-bold" style={{ color: NAVY }}>$</span>
          <input inputMode="numeric" placeholder="1,800" value={rent} onChange={(e) => setRent(e.target.value)}
            className="w-32 px-3 py-2 border-2 rounded-xl text-lg font-semibold tabular-nums" style={{ borderColor: BORDER, background: "#F7F5F2", color: NAVY }} />
          <span className="text-sm" style={{ color: MUTED }}>a month</span>
        </label>
      </div>
      <div className="mt-16">
        <DotPlot median={s.median} p25={s.n >= 2 ? s.p25 : null} p75={s.n >= 2 ? s.p75 : null} you={v > 0 ? [v] : undefined}
          dots={prices.map((p, i) => ({ id: String(i), price: p, title: "", detail: `${kind} home`, on: true }))} />
      </div>
      <p className="text-lg mt-4 font-semibold" style={{ color: NAVY }} aria-live="polite">
        {pct == null
          ? v > 0 ? `Only ${prices.length} ${kind} ads this time, too few to place your rent. Try "Any baths".` : `Type your rent to see where it sits among ${prices.length} ${kind} ads.`
          : `${cad(v)} is higher than about ${Math.round(pct)}% of ${kind} ads this week, ${v > s.median! ? `${cad(v - s.median!)} above` : v < s.median! ? `${cad(s.median! - v)} below` : "right at"} the typical ${cad(s.median)}.`}
      </p>
    </Card>
  );
}

const PLANNED_SOURCES = ["Kijiji", "Rentals.ca"];

/** The trust section: limits first, then exactly where the ads came from and how fresh they are. */
function Method({ data }: { data: ReportData }) {
  const m = data.method;
  const coming = PLANNED_SOURCES.filter((p) => !data.sources.some((s) => s.name === p));
  const funnel = [
    ...(m.rawHits ? [{ label: "Search results read", n: m.rawHits }] : []),
    { label: "Different ads, repeats removed", n: data.observed },
    { label: "Counted in these prices", n: data.counted },
  ];
  const limits = [
    { t: "Asking rents, not signed leases", d: "These are the prices landlords put in public ads. What a tenant finally signs for can be different." },
    { t: "The ads we reached, not every rental", d: `Each search reads the newest ads first and stops after ${m.pagesPerSearch ?? "a set number of"} pages, so older ads are under-counted.` },
    { t: "Neighbourhoods only when the ad says so", d: `${data.areasNamed} of ${data.counted} counted ads name a neighbourhood. We never guess the rest; they count toward the London-wide numbers only.` },
    { t: "Unclear ads are left out", d: `${data.observed - data.counted} ads were left out of the prices, for example a "room" priced like a whole home. Homes and rooms are never mixed.` },
  ];
  return (
    <section className="bg-white border rounded-2xl p-5 sm:p-8" style={{ borderColor: BORDER, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold" style={heading}>How we get these numbers</h2>
          <p className="text-base mt-1" style={{ color: MUTED }}>Read this before you use them. We&apos;d rather you trust a smaller, honest number than a big, vague one.</p>
        </div>
        <span className="inline-flex items-center gap-2 text-sm font-semibold rounded-full px-3 py-1.5" style={{ background: "#EAF3EC", color: "#2F6B3F" }}>
          <span className="w-2 h-2 rounded-full" style={{ background: "#2F6B3F" }} aria-hidden /> Collected {fmtDay(data.scanDate)}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 mt-6">
        {limits.map((l, i) => (
          <div key={l.t} className="rounded-2xl p-4 flex gap-3" style={{ background: "#F7F5F2" }}>
            <span className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: NAVY, color: "#FAF8F5" }}>{i + 1}</span>
            <div>
              <div className="font-semibold" style={{ color: NAVY }}>{l.t}</div>
              <div className="text-[15px] mt-0.5 leading-relaxed" style={{ color: "#333" }}>{l.d}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mt-6">
        <div className="rounded-2xl border-2 p-5" style={{ borderColor: BORDER }}>
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: MUTED }}>Where the ads come from</div>
          <ul className="mt-3 grid gap-2">
            {data.sources.map((src) => (
              <li key={src.name} className="flex justify-between gap-3 text-[15px]">
                <span className="font-semibold" style={{ color: NAVY }}>{src.name}</span>
                <span className="tabular-nums" style={{ color: MUTED }}>{src.ads} ads</span>
              </li>
            ))}
          </ul>
          <p className="text-sm mt-3" style={{ color: MUTED }}>Public ads only, within {m.radiusKm ?? 25} km of London, Ontario.</p>
          {coming.length > 0 && (
            <p className="text-sm mt-3 rounded-xl px-3 py-2" style={{ background: "#F7F5F2", color: "#333" }}>
              Being added: {coming.join(", ")} and other public rental sites. Their ads count from the first edition that includes them, and this list will show it.
            </p>
          )}
        </div>

        <div className="rounded-2xl border-2 p-5" style={{ borderColor: BORDER }}>
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: MUTED }}>How deep we look</div>
          <div className="grid gap-3 mt-3">
            {funnel.map((f) => (
              <div key={f.label}>
                <div className="flex justify-between text-sm"><span style={{ color: "#333" }}>{f.label}</span><strong className="tabular-nums" style={{ color: NAVY }}>{f.n.toLocaleString()}</strong></div>
                <div className="h-2.5 rounded-full mt-1" style={{ background: "#EFEBE5" }}>
                  <div className="h-2.5 rounded-full" style={{ width: `${Math.max(3, (f.n / funnel[0].n) * 100)}%`, background: NAVY }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm mt-3" style={{ color: MUTED }}>
            {m.segments ? `${m.segments} searches by home type and size` : "Searches by home type and size"}{m.pagesPerSearch ? `, up to ${m.pagesPerSearch} pages each` : ""}. The same ad shows up in many searches, so we count each one once.
          </p>
        </div>

        <div className="rounded-2xl border-2 p-5" style={{ borderColor: BORDER }}>
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: MUTED }}>How fresh it is</div>
          <ul className="mt-3 grid gap-2 text-[15px]" style={{ color: "#333" }}>
            <li><strong style={{ color: NAVY }}>This edition:</strong> ads collected {fmtDay(data.scanDate)}.</li>
            <li><strong style={{ color: NAVY }}>Every week:</strong> a fresh scan at 8 a.m.</li>
            <li><strong style={{ color: NAVY }}>Every month:</strong> a deeper sweep.</li>
            <li>Each edition keeps its own link, so the numbers you read today won&apos;t change later.</li>
          </ul>
          <p className="text-sm mt-3" style={{ color: MUTED }}>&quot;Typical&quot; means the median: half the ads ask more, half ask less.</p>
        </div>
      </div>
    </section>
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
