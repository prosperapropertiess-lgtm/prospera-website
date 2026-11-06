"use client";
import { useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, LabelList } from "recharts";
import { cad } from "@/lib/market/core";
import type { ReportData } from "@/lib/market/report";
import { Choice, NAVY, MUTED, BORDER, heading } from "@/app/admin/market/ui";

const BEDS = ["1", "2", "3", "4"] as const;
const SHADE: Record<string, string> = { "1": "#BCC7CF", "2": "#8597A3", "3": "#4F6575", "4": "#2E4453" };
const short = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
const money = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${cad(Math.abs(n))}`;

/** Rent direction, supply, price cuts and "priced high sits". Switches on as scans accumulate. */
export default function Moving({ history, sitting, period }: { history: ReportData["history"]; sitting: ReportData["sitting"]; period: "week" | "month" }) {
  const [beds, setBeds] = useState<string | null>(null);

  if (history.length < 2) {
    const soon = [
      { t: "Is rent going up or down?", d: `One line per bedroom size, a point every ${period}, with the change in dollars.`, when: `Starts with the next ${period}'s scan` },
      { t: "Are there more rentals or fewer?", d: "How many ads we found, split into new ads and ones still up.", when: `Starts with the next ${period}'s scan` },
      { t: "Are landlords cutting prices?", d: "The share of ads that dropped their price, and by how much.", when: `Starts with the next ${period}'s scan` },
      { t: "Does pricing high make a home sit?", d: "Of homes priced above typical, how many are still advertised two weeks later, compared with homes priced at or below typical.", when: "Needs scans two weeks apart" },
    ];
    return (
      <Shell sub={`This is the first scan, so there's nothing to compare yet. These four charts fill in by themselves as new scans arrive. We won't draw a trend we don't have.`}>
        <div className="grid gap-3 sm:grid-cols-2">
          {soon.map((x) => (
            <div key={x.t} className="rounded-2xl border-2 border-dashed p-5" style={{ borderColor: BORDER }}>
              <Ghost />
              <div className="font-semibold mt-3" style={{ color: NAVY }}>{x.t}</div>
              <div className="text-[15px] mt-1" style={{ color: "#333" }}>{x.d}</div>
              <div className="text-sm font-semibold mt-3" style={{ color: MUTED }}>{x.when}</div>
            </div>
          ))}
        </div>
      </Shell>
    );
  }

  const last = history[history.length - 1], prev = history[history.length - 2];
  const series = beds ? (h: ReportData["history"][number]) => h.byBeds[beds]?.median ?? null : (h: ReportData["history"][number]) => h.wholeMedian;
  const delta = series(last) != null && series(prev) != null ? series(last)! - series(prev)! : null;
  const first = history.find((h) => series(h) != null);
  const sinceStart = first && first !== last && series(last) != null ? series(last)! - series(first)! : null;
  const chart = history.map((h) => ({ d: short(h.date), all: h.wholeMedian, ...Object.fromEntries(BEDS.map((b) => [b, h.byBeds[b]?.median ?? null])) }));
  const supply = history.map((h) => ({ d: short(h.date), returning: h.returning ?? h.ads, fresh: h.newAds ?? 0, total: h.ads }));
  const cutRows = history.filter((h) => h.cuts && h.cuts.pairs > 0).map((h) => ({ d: short(h.date), pct: Math.round((100 * h.cuts!.reduced) / h.cuts!.pairs) }));
  const what = beds ? `${beds}-bed homes` : "a typical home";

  return (
    <Shell sub={`Compared with the previous ${period}, and since ${short(history[0].date)}.`}>
      <div className="grid gap-5">
        {/* 1. Direction */}
        <Panel>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: MUTED }}>Is rent going up or down?</div>
              <p className="text-2xl sm:text-3xl font-bold mt-2 leading-snug" style={heading}>
                {delta == null ? "Not enough ads to tell this time." : delta === 0 ? `Asking rent for ${what} held steady at ${cad(series(last))}.` : `Asking rent for ${what} is ${delta > 0 ? "up" : "down"} ${cad(Math.abs(delta))} since last ${period}.`}
              </p>
              {sinceStart != null && history.length > 2 && <p className="text-base mt-1" style={{ color: MUTED }}>{money(sinceStart)} since {short(first!.date)}.</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <Choice size="sm" selected={!beds} onClick={() => setBeds(null)}>All homes</Choice>
              {BEDS.map((b) => <Choice key={b} size="sm" selected={beds === b} onClick={() => setBeds(b)}>{b} bed</Choice>)}
            </div>
          </div>
          <div style={{ height: 280 }} className="mt-5">
            <ResponsiveContainer>
              <LineChart data={chart} margin={{ top: 24, right: 24, bottom: 0, left: -4 }}>
                <CartesianGrid stroke="#EFEBE5" vertical={false} />
                <XAxis dataKey="d" tick={{ fontSize: 13, fill: MUTED }} />
                <YAxis tick={{ fontSize: 12, fill: MUTED }} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} domain={["auto", "auto"]} width={52} />
                <Tooltip formatter={(v, name) => [cad(Number(v)), name === "all" ? "All homes" : `${name} bed`]} />
                {BEDS.map((b) => (
                  <Line key={b} dataKey={b} stroke={SHADE[b]} strokeWidth={beds === b ? 4 : 2} strokeOpacity={beds && beds !== b ? 0.25 : 1} dot={{ r: beds === b ? 6 : 3, fill: SHADE[b] }} connectNulls={false} isAnimationActive>
                    {beds === b && <LabelList dataKey={b} position="top" formatter={(v: unknown) => cad(Number(v))} style={{ fontSize: 13, fontWeight: 700, fill: NAVY }} />}
                  </Line>
                ))}
                <Line dataKey="all" stroke={NAVY} strokeWidth={beds ? 2 : 4} strokeOpacity={beds ? 0.3 : 1} strokeDasharray={beds ? "5 4" : undefined} dot={{ r: beds ? 2 : 6, fill: NAVY }} connectNulls={false}>
                  {!beds && <LabelList dataKey="all" position="top" formatter={(v: unknown) => cad(Number(v))} style={{ fontSize: 13, fontWeight: 700, fill: NAVY }} />}
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm mt-2" style={{ color: MUTED }}>Typical (median) asking rent each {period}. A change can come from which homes happened to be listed, not only from landlords changing prices.</p>
        </Panel>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* 2. Supply */}
          <Panel>
            <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: MUTED }}>Are there more rentals or fewer?</div>
            <p className="text-2xl font-bold mt-2 leading-snug" style={heading}>
              {last.ads} ads this {period}, {last.ads === prev.ads ? "the same as" : `${Math.abs(last.ads - prev.ads)} ${last.ads > prev.ads ? "more than" : "fewer than"}`} last {period}.
            </p>
            {last.newAds != null && <p className="text-base mt-1" style={{ color: MUTED }}>{last.newAds} of them are new.</p>}
            <div style={{ height: 200 }} className="mt-4">
              <ResponsiveContainer>
                <BarChart data={supply} margin={{ top: 22, right: 8, bottom: 0, left: -16 }}>
                  <CartesianGrid stroke="#EFEBE5" vertical={false} />
                  <XAxis dataKey="d" tick={{ fontSize: 12, fill: MUTED }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: MUTED }} />
                  <Tooltip formatter={(v, n) => [v, n === "fresh" ? "New ads" : "Still up from before"]} />
                  <Bar dataKey="returning" stackId="a" fill="#BCC7CF" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="fresh" stackId="a" fill={NAVY} radius={[6, 6, 0, 0]}>
                    <LabelList dataKey="total" position="top" style={{ fontSize: 12, fontWeight: 700, fill: NAVY }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <Legend items={[[NAVY, "New ads"], ["#BCC7CF", "Still up from before"]]} />
          </Panel>

          {/* 3. Price cuts */}
          <Panel>
            <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: MUTED }}>Are landlords cutting prices?</div>
            {last.cuts && last.cuts.pairs > 0 ? (
              <>
                <p className="text-2xl font-bold mt-2 leading-snug" style={heading}>
                  {Math.round((100 * last.cuts.reduced) / last.cuts.pairs)}% of ads still up from last {period} lowered their price.
                </p>
                <p className="text-base mt-1" style={{ color: MUTED }}>
                  {last.cuts.reduced} of {last.cuts.pairs}{last.cuts.medianCutPct != null ? `, typically by ${Math.abs(last.cuts.medianCutPct).toFixed(1)}%` : ""}.
                </p>
                <div style={{ height: 170 }} className="mt-4">
                  <ResponsiveContainer>
                    <BarChart data={cutRows} margin={{ top: 22, right: 8, bottom: 0, left: -16 }}>
                      <XAxis dataKey="d" tick={{ fontSize: 12, fill: MUTED }} />
                      <YAxis hide domain={[0, 100]} />
                      <Bar dataKey="pct" fill={NAVY} radius={[6, 6, 0, 0]}>
                        <LabelList dataKey="pct" position="top" formatter={(v: unknown) => `${v}%`} style={{ fontSize: 12, fontWeight: 700, fill: NAVY }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : <p className="text-lg mt-2" style={{ color: "#333" }}>No ads appeared in both scans with a price, so we can&apos;t tell yet.</p>}
          </Panel>
        </div>

        {/* 4. Priced high sits */}
        <Panel>
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: MUTED }}>Does pricing high make a home sit?</div>
          {sitting && sitting.above.n >= 5 && sitting.below.n >= 5 ? (() => {
            const a = Math.round((100 * sitting.above.still) / sitting.above.n), b = Math.round((100 * sitting.below.still) / sitting.below.n);
            return (
              <>
                <p className="text-2xl sm:text-3xl font-bold mt-2 leading-snug" style={heading}>
                  {a > b ? `Homes priced above typical were more likely to still be advertised two weeks later: ${a}% vs ${b}%.` : a < b ? `This time, homes priced above typical were less likely to still be advertised: ${a}% vs ${b}%.` : `Both groups were equally likely to still be advertised: ${a}%.`}
                </p>
                <div className="grid gap-4 mt-6">
                  {[["Priced above typical for their size", a, sitting.above], ["Priced at or below typical", b, sitting.below]].map(([label, pct, g]) => (
                    <div key={label as string}>
                      <div className="flex justify-between text-[15px]"><span className="font-semibold" style={{ color: NAVY }}>{label as string}</span><strong className="tabular-nums" style={{ color: NAVY }}>{pct as number}% still advertised</strong></div>
                      <div className="h-4 rounded-full mt-1.5" style={{ background: "#EFEBE5" }}>
                        <div className="h-4 rounded-full transition-all duration-700" style={{ width: `${Math.max(2, pct as number)}%`, background: NAVY }} />
                      </div>
                      <div className="text-sm mt-1" style={{ color: MUTED }}>{(g as { still: number; n: number }).still} of {(g as { still: number; n: number }).n} ads from {short(sitting.from)}</div>
                    </div>
                  ))}
                </div>
                <p className="text-sm mt-4" style={{ color: MUTED }}>Ads seen on {short(sitting.from)} and found again on {short(sitting.to)}. Not being found again usually means the ad came down, but it doesn&apos;t prove the home rented.</p>
              </>
            );
          })() : <p className="text-lg mt-2" style={{ color: "#333" }}>This needs scans two weeks apart. It switches on by itself once we have them.</p>}
        </Panel>
      </div>
    </Shell>
  );
}

function Shell({ sub, children }: { sub: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border rounded-2xl p-5 sm:p-8" style={{ borderColor: BORDER, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <h2 className="text-2xl sm:text-3xl font-bold" style={heading}>How the market is moving</h2>
      <p className="text-base mt-1 mb-6" style={{ color: MUTED }}>{sub}</p>
      {children}
    </section>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl p-5 sm:p-6 min-w-0" style={{ background: "#F7F5F2" }}>{children}</div>;
}

function Legend({ items }: { items: [string, string][] }) {
  return (
    <div className="flex gap-4 mt-2 text-sm" style={{ color: MUTED }}>
      {items.map(([c, l]) => <span key={l} className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded" style={{ background: c }} />{l}</span>)}
    </div>
  );
}

function Ghost() {
  return (
    <svg viewBox="0 0 120 36" width="120" height="36" aria-hidden="true">
      <polyline points="4,28 28,22 52,25 76,14 100,17 116,8" fill="none" stroke="#D8D2C8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 5" />
      {[[4, 28], [28, 22], [52, 25], [76, 14], [100, 17], [116, 8]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="3" fill="#D8D2C8" />)}
    </svg>
  );
}
