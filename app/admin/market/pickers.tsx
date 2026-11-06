"use client";
import type { ReactNode } from "react";
import MAP from "@/lib/market/london-districts.json";
import { BEDS_ORDER, bedsLabel, cad, stats } from "@/lib/market/core";
import { NAVY, MUTED, BORDER } from "./ui";

// Card pickers shared by the internal dashboard and the public report.
// Map shapes: City of London Open Data, "Planning Districts".

interface District { name: string; d: string; cx: number; cy: number }
const DISTRICTS = (MAP as { w: number; h: number; districts: District[] }).districts;
const MAP_H = (MAP as { h: number }).h;

/** Informal names used in ads → the planning district(s) they sit in. `approx` marks a best fit. */
const ALIAS: Record<string, { districts: string[]; approx?: boolean }> = {
  Downtown: { districts: ["Central London"] },
  SoHo: { districts: ["Central London"], approx: true },
  Wortley: { districts: ["South London"], approx: true },
  "Old South": { districts: ["South London"], approx: true },
  "Western University": { districts: ["Medway"], approx: true },
  "Kipps Lane": { districts: ["Carling"], approx: true },
  Southdale: { districts: ["Westmount"], approx: true },
  "Pond Mills": { districts: ["Westminster"], approx: true },
  "Talbot Village": { districts: ["Talbot"], approx: true },
  Westwood: { districts: ["Oakridge"], approx: true },
};

const centre = DISTRICTS.find((d) => d.name === "Central London")!;
/** "Northeast London" etc.: every district whose centre lies in that direction from downtown. */
function sector(name: string): string[] | null {
  const m = name.match(/^(North|South)(east|west) London$/i);
  if (!m) return null;
  const north = m[1].toLowerCase() === "north", east = m[2].toLowerCase() === "east";
  return DISTRICTS.filter((d) => d.name !== "Central London" && (north ? d.cy < centre.cy - 4 : d.cy > centre.cy + 4) && (east ? d.cx > centre.cx + 4 : d.cx < centre.cx - 4)).map((d) => d.name);
}

export function districtsFor(area: string | null): { districts: string[]; approx: boolean } {
  if (!area) return { districts: [], approx: false };
  if (ALIAS[area]) return { districts: ALIAS[area].districts, approx: !!ALIAS[area].approx };
  if (DISTRICTS.some((d) => d.name === area)) return { districts: [area], approx: false };
  const s = sector(area);
  return s ? { districts: s, approx: true } : { districts: [], approx: false };
}

export function LondonMap({ highlight, all, className = "" }: { highlight: string[]; all?: boolean; className?: string }) {
  const on = new Set(highlight);
  return (
    <svg viewBox={`-1 -1 102 ${MAP_H + 2}`} className={className} role="img" aria-label={all ? "All of London" : highlight.length ? `Map of London with ${highlight.join(", ")} filled in` : "Map of London"}>
      {DISTRICTS.map((d) => (
        <path key={d.name} d={d.d} fill={all || on.has(d.name) ? NAVY : "#ECE7E0"} stroke="#FFFFFF" strokeWidth={0.6} strokeLinejoin="round"
          style={{ transition: "fill 300ms ease" }} />
      ))}
    </svg>
  );
}

// ── Icons (simple line drawings) ────────────────────────────────────────────

const ICON: Record<string, ReactNode> = {
  all: <><path d="M4 20V10l8-6 8 6v10" /><path d="M9 20v-5h6v5" /></>,
  house: <><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></>,
  apartment: <><rect x="5" y="3" width="14" height="18" rx="1" /><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" /></>,
  townhouse: <><path d="M2 12l5-5 5 5 5-5 5 5" /><path d="M4 11v9h16v-9" /><path d="M12 12v8" /></>,
  basement: <><path d="M3 10l9-6 9 6" /><path d="M5 9v5h14V9" /><path d="M3 14h18" /><rect x="7" y="16" width="10" height="4" rx="0.5" /></>,
  condo: <><rect x="6" y="2" width="12" height="20" rx="1" /><path d="M10 6h4M10 10h4M10 14h4M11 22v-3h2v3" /></>,
  room: <><path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" /><path d="M3 15h18M3 18v2M21 18v2" /><rect x="6" y="7" width="5" height="3" rx="1" /></>,
  other: <><circle cx="12" cy="12" r="8" /><path d="M8 12h.01M12 12h.01M16 12h.01" /></>,
};

function Icon({ name, on }: { name: string; on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke={on ? "#FAF8F5" : NAVY} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICON[name] ?? ICON.other}
    </svg>
  );
}

// ── Card pickers ────────────────────────────────────────────────────────────

export interface PickDot { p: number; b: string; t: string; a: string | null; c: "whole" | "room"; h?: number | null }
export interface PickState { kind: "whole" | "room"; beds: string | null; baths?: string | null; type: string | null; area: string | null }

/** Bathroom groups. Half-baths stay their own group; "0" is treated as not stated. */
export const BATH_GROUPS = ["1", "1.5", "2", "2.5+"] as const;
export function bathGroup(n: number | null | undefined): string | null {
  if (n == null || n <= 0) return null;
  if (n < 1.5) return "1";
  if (n < 2) return "1.5";
  if (n < 2.5) return "2";
  return "2.5+";
}
export const bathLabel = (g: string) => `${g} bath`;
export const bathFits = (pick: PickState, h: number | null | undefined) => !pick.baths || bathGroup(h) === pick.baths;

const TYPE_LABEL: Record<string, string> = { house: "Houses", apartment: "Apartments", townhouse: "Townhouses", basement: "Basements", condo: "Condos", other: "Other" };

function PickCard({ on, onClick, children, className = "" }: { on: boolean; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick}
      className={`text-left rounded-2xl border-2 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${className}`}
      style={{ borderColor: on ? NAVY : BORDER, background: on ? NAVY : "#FFFFFF", color: on ? "#FAF8F5" : NAVY }}>
      {children}
    </button>
  );
}

/** Houses / Apartments / … / Rooms, each with its typical rent. */
export function TypeCards({ dots, pick, set }: { dots: PickDot[]; pick: PickState; set: (p: Partial<PickState>) => void }) {
  const whole = dots.filter((d) => d.c === "whole");
  const types = [...new Set(whole.map((d) => d.t))]
    .map((t) => ({ t, s: stats(whole.filter((d) => d.t === t).map((d) => d.p)) }))
    .filter((x) => x.s.n >= 5).sort((a, b) => b.s.n - a.s.n).slice(0, 4);
  const rooms = stats(dots.filter((d) => d.c === "room").map((d) => d.p));
  const allWhole = stats(whole.map((d) => d.p));
  const cards = [
    { key: "all", label: "All homes", s: allWhole, on: pick.kind === "whole" && !pick.type, go: () => set({ kind: "whole", type: null }) },
    ...types.map((x) => ({ key: x.t, label: TYPE_LABEL[x.t] ?? x.t, s: x.s, on: pick.kind === "whole" && pick.type === x.t, go: () => set({ kind: "whole", type: pick.type === x.t ? null : x.t }) })),
    ...(rooms.n ? [{ key: "room", label: "Rooms", s: rooms, on: pick.kind === "room", go: () => set({ kind: "room", type: null, beds: null, baths: null }) }] : []),
  ];
  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((c) => (
        <PickCard key={c.key} on={c.on} onClick={c.go}>
          <Icon name={c.key} on={c.on} />
          <div className="font-semibold mt-3 text-[15px]">{c.label}</div>
          <div className="text-xl font-bold tabular-nums" style={{ fontFamily: "var(--font-cormorant)" }}>{cad(c.s.median)}</div>
          <div className="text-xs mt-0.5" style={{ opacity: 0.7 }}>{c.s.n} ads{c.key === "room" ? " · per room" : ""}</div>
        </PickCard>
      ))}
    </div>
  );
}

/** One slim row of bedroom choices. */
export function BedsBar({ dots, pick, set }: { dots: PickDot[]; pick: PickState; set: (p: Partial<PickState>) => void }) {
  if (pick.kind === "room") return null;
  const pool = dots.filter((d) => d.c === "whole" && (!pick.type || d.t === pick.type) && bathFits(pick, d.h));
  const beds = BEDS_ORDER.filter((b) => b !== "unknown" && pool.some((d) => d.b === b));
  return (
    <div className="flex gap-1 p-1.5 rounded-2xl overflow-x-auto" style={{ background: "#F7F5F2" }} role="group" aria-label="Bedrooms">
      {[null, ...beds].map((b) => {
        const on = pick.beds === b;
        return (
          <button key={b ?? "any"} type="button" aria-pressed={on} onClick={() => set({ beds: b })}
            className="flex-1 min-w-[72px] px-3 py-2.5 rounded-xl text-[15px] font-semibold whitespace-nowrap transition-colors duration-200"
            style={{ background: on ? NAVY : "transparent", color: on ? "#FAF8F5" : NAVY }}>
            {b ? bedsLabel(b) : "Any size"}
          </button>
        );
      })}
    </div>
  );
}

/** One slim row of bathroom choices, with how many ads each has. */
export function BathsBar({ dots, pick, set }: { dots: PickDot[]; pick: PickState; set: (p: Partial<PickState>) => void }) {
  if (pick.kind === "room") return null;
  const pool = dots.filter((d) => d.c === "whole" && (!pick.type || d.t === pick.type) && (!pick.beds || d.b === pick.beds));
  const groups = BATH_GROUPS.filter((g) => pool.some((d) => bathGroup(d.h) === g));
  return (
    <div className="flex gap-1 p-1.5 rounded-2xl overflow-x-auto" style={{ background: "#F7F5F2" }} role="group" aria-label="Bathrooms">
      {[null, ...groups].map((g) => {
        const on = (pick.baths ?? null) === g;
        const n = g ? pool.filter((d) => bathGroup(d.h) === g).length : pool.length;
        return (
          <button key={g ?? "any"} type="button" aria-pressed={on} onClick={() => set({ baths: g })}
            className="flex-1 min-w-[84px] px-3 py-2 rounded-xl text-[15px] font-semibold whitespace-nowrap transition-colors duration-200"
            style={{ background: on ? NAVY : "transparent", color: on ? "#FAF8F5" : NAVY }}>
            {g ? bathLabel(g) : "Any"}<span className="block text-xs font-normal" style={{ opacity: 0.7 }}>{n} ads</span>
          </button>
        );
      })}
    </div>
  );
}

/** Neighbourhood cards, each with London drawn and that area filled in. */
export function AreaCards({ dots, pick, set, limit = 8 }: { dots: PickDot[]; pick: PickState; set: (p: Partial<PickState>) => void; limit?: number }) {
  const pool = dots.filter((d) => d.c === pick.kind && (!pick.type || d.t === pick.type) && (!pick.beds || d.b === pick.beds) && bathFits(pick, d.h));
  const areas = [...new Set(pool.map((d) => d.a).filter((a): a is string => !!a))]
    .map((a) => ({ a, s: stats(pool.filter((d) => d.a === a).map((d) => d.p)), map: districtsFor(a) }))
    .filter((x) => x.s.n >= 3).sort((x, y) => y.s.n - x.s.n);
  const shown = areas.slice(0, limit);
  if (pick.area && !shown.some((x) => x.a === pick.area)) {
    const extra = areas.find((x) => x.a === pick.area);
    if (extra) shown.push(extra);
  }
  const allS = stats(pool.map((d) => d.p));
  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
      <PickCard on={!pick.area} onClick={() => set({ area: null })}>
        <LondonMap highlight={[]} all className="w-full h-24" />
        <div className="font-semibold mt-3 text-[15px]">All of London</div>
        <div className="text-xl font-bold tabular-nums" style={{ fontFamily: "var(--font-cormorant)" }}>{cad(allS.median)}</div>
        <div className="text-xs mt-0.5" style={{ opacity: 0.7 }}>{allS.n} ads</div>
      </PickCard>
      {shown.map((x) => {
        const on = pick.area === x.a;
        return (
          <PickCard key={x.a} on={on} onClick={() => set({ area: on ? null : x.a })}>
            <div className="rounded-xl p-1" style={{ background: on ? "#FAF8F5" : "transparent" }}>
              <LondonMap highlight={x.map.districts} className="w-full h-24" />
            </div>
            <div className="font-semibold mt-3 text-[15px] truncate">{x.a}</div>
            <div className="text-xl font-bold tabular-nums" style={{ fontFamily: "var(--font-cormorant)" }}>{cad(x.s.median)}</div>
            <div className="text-xs mt-0.5" style={{ opacity: 0.7 }}>{x.s.n} ads{x.map.approx ? " · area approximate" : ""}{!x.map.districts.length ? " · not mapped" : ""}</div>
          </PickCard>
        );
      })}
      {areas.length > shown.length && (
        <label className="rounded-2xl border-2 border-dashed p-4 flex flex-col justify-center gap-2" style={{ borderColor: BORDER, color: MUTED }}>
          <span className="text-sm font-semibold">{areas.length - shown.length} more areas</span>
          <select value="" onChange={(e) => e.target.value && set({ area: e.target.value })} className="border-2 rounded-xl px-2 py-2 text-sm font-semibold bg-white" style={{ borderColor: BORDER, color: NAVY }}>
            <option value="">Pick one…</option>
            {areas.slice(shown.length).map((x) => <option key={x.a} value={x.a}>{x.a} ({x.s.n})</option>)}
          </select>
        </label>
      )}
    </div>
  );
}

export const MAP_CREDIT = "Neighbourhood shapes: City of London Open Data (Planning Districts). Informal names in ads are matched to the nearest district.";
