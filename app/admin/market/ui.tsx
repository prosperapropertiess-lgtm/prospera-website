"use client";
import { useEffect as useEffectM, useMemo as useMemoM, useRef as useRefM, useState as useStateM, type ReactNode } from "react";
import { cad } from "@/lib/market/core";

// Same look as the public viewing form: warm background, white rounded cards,
// navy pills that fill in when picked, burgundy only on the main button.
export const NAVY = "#1F2F3A";
export const BURGUNDY = "#8B2030";
export const BORDER = "#D8D2C8";
export const MUTED = "#666666";
export const SOFT = "#F7F5F2";
export const heading = { fontFamily: "var(--font-cormorant)", color: NAVY } as const;

export function Card({ title, sub, right, children, className = "" }: { title?: ReactNode; sub?: ReactNode; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`bg-white border rounded-2xl p-5 sm:p-7 min-w-0 ${className}`} style={{ borderColor: BORDER, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      {(title || right) && (
        <div className="flex items-start justify-between gap-3 flex-wrap mb-1">
          {title && <h2 className="text-xl sm:text-2xl font-bold leading-tight" style={heading}>{title}</h2>}
          {right}
        </div>
      )}
      {sub && <p className="text-base mb-5" style={{ color: MUTED }}>{sub}</p>}
      {!sub && title && <div className="mb-4" />}
      {children}
    </section>
  );
}

export function Choice({ children, selected, onClick, size = "md", title }: { children: ReactNode; selected?: boolean; onClick: () => void; size?: "sm" | "md"; title?: string }) {
  return (
    <button type="button" aria-pressed={!!selected} onClick={onClick} title={title}
      className={`${size === "sm" ? "px-3 py-2 text-sm min-h-[40px]" : "px-4 py-3 text-[15px] min-h-[48px]"} font-semibold border-2 rounded-xl transition-colors duration-150 inline-flex items-center gap-2 whitespace-nowrap`}
      style={{ borderColor: selected ? NAVY : BORDER, color: selected ? "#FAF8F5" : NAVY, backgroundColor: selected ? NAVY : "#FFFFFF" }}>
      {children}
      {selected && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FAF8F5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>}
    </button>
  );
}

export function PrimaryButton({ children, onClick, disabled, href }: { children: ReactNode; onClick?: () => void; disabled?: boolean; href?: string }) {
  const cls = "inline-block text-center px-6 py-3 text-sm font-semibold uppercase tracking-widest rounded transition-opacity hover:opacity-80 disabled:opacity-50";
  const style = { backgroundColor: BURGUNDY, color: "#FAF8F5" };
  return href ? <a href={href} className={cls} style={style}>{children}</a> : <button type="button" onClick={onClick} disabled={disabled} className={cls} style={style}>{children}</button>;
}

export function QuietButton({ children, onClick, href, target }: { children: ReactNode; onClick?: () => void; href?: string; target?: string }) {
  const cls = "inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-xl border-2 bg-white transition-colors hover:bg-[#F7F5F2]";
  const style = { borderColor: BORDER, color: NAVY };
  return href ? <a href={href} target={target} rel={target ? "noopener noreferrer" : undefined} className={cls} style={style}>{children}</a>
    : <button type="button" onClick={onClick} className={cls} style={style}>{children}</button>;
}

export function TextLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="font-semibold underline underline-offset-2" style={{ color: NAVY }}>{children}</button>;
}

/** A big number with one plain sentence under it. Tappable when it leads somewhere. */
export function BigNumber({ label, value, note, onClick, muted }: { label: string; value: ReactNode; note?: ReactNode; onClick?: () => void; muted?: boolean }) {
  const body = (
    <>
      <div className="text-sm font-semibold" style={{ color: MUTED }}>{label}</div>
      <div className="text-3xl sm:text-4xl font-bold mt-1 tabular-nums" style={{ ...heading, color: muted ? "#9AA3A9" : NAVY }}>{value}</div>
      {note && <div className="text-sm mt-1" style={{ color: MUTED }}>{note}</div>}
      {onClick && <div className="text-sm font-semibold mt-3" style={{ color: NAVY }}>See them →</div>}
    </>
  );
  const cls = "text-left bg-white border-2 rounded-2xl p-5 h-full w-full transition-colors";
  return onClick
    ? <button type="button" onClick={onClick} className={`${cls} hover:border-[#1F2F3A]`} style={{ borderColor: BORDER }}>{body}</button>
    : <div className={cls} style={{ borderColor: BORDER }}>{body}</div>;
}

/**
 * Cheapest → most expensive as one bar. The darker middle is where half the ads sit,
 * the line is the typical (median) rent, and an optional pin marks "yours".
 */
export function RangeBar({ min, p25, median, p75, max, you, compact }: {
  min: number | null; p25: number | null; median: number | null; p75: number | null; max: number | null;
  you?: number[]; compact?: boolean;
}) {
  if (min == null || max == null || median == null) return null;
  const lo = Math.min(min, ...(you ?? [])), hi = Math.max(max, ...(you ?? []));
  const x = (v: number) => (hi === lo ? 50 : ((v - lo) / (hi - lo)) * 100);
  return (
    <div className={compact ? "mt-2" : "mt-4"} role="img" aria-label={`Cheapest ${cad(min)}, typical ${cad(median)}, most expensive ${cad(max)}${you?.length ? `, yours ${you.map((v) => cad(v)).join(" to ")}` : ""}`}>
      <div className="relative" style={{ height: compact ? 16 : 30, marginTop: you?.length ? 22 : 0 }}>
        <div className="absolute inset-x-0 rounded-full" style={{ top: "50%", height: compact ? 8 : 12, transform: "translateY(-50%)", background: "#E9E4DC" }} />
        {p25 != null && p75 != null && (
          <div className="absolute rounded-full" style={{ left: `${x(p25)}%`, width: `${Math.max(1.5, x(p75) - x(p25))}%`, top: "50%", height: compact ? 8 : 12, transform: "translateY(-50%)", background: "#8597A3" }} />
        )}
        <div className="absolute" style={{ left: `${x(median)}%`, top: 0, bottom: 0, width: 3, marginLeft: -1.5, background: NAVY, borderRadius: 2 }} />
        {(you ?? []).map((v) => (
          <div key={v} className="absolute flex flex-col items-center" style={{ left: `${x(v)}%`, top: -24, transform: "translateX(-50%)" }}>
            <span className="text-xs font-bold whitespace-nowrap px-2 py-0.5 rounded-full" style={{ background: BURGUNDY, color: "#FAF8F5" }}>You {cad(v)}</span>
            <span style={{ width: 2, height: compact ? 14 : 22, background: BURGUNDY }} />
          </div>
        ))}
      </div>
      {!compact && (
        <div className="flex justify-between text-sm mt-2 tabular-nums" style={{ color: MUTED }}>
          <span>Cheapest<br /><strong style={{ color: NAVY }}>{cad(min)}</strong></span>
          <span className="text-center">Typical<br /><strong style={{ color: NAVY }}>{cad(median)}</strong></span>
          <span className="text-right">Priciest<br /><strong style={{ color: NAVY }}>{cad(max)}</strong></span>
        </div>
      )}
    </div>
  );
}

export interface BarRow { key: string; label: ReactNode; value: number; display: ReactNode; sub?: ReactNode; light?: boolean; onClick?: () => void }

/** Horizontal bars anyone can read: label on the left, a bar, the number at the end. */
export function BarList({ rows, max }: { rows: BarRow[]; max?: number }) {
  const top = max ?? Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="grid gap-2">
      {rows.map((r) => {
        const inner = (
          <>
            <div className="flex justify-between gap-3 text-[15px] mb-1">
              <span className="font-semibold truncate" style={{ color: NAVY }}>{r.label}</span>
              <span className="font-bold tabular-nums whitespace-nowrap" style={{ color: NAVY }}>{r.display}</span>
            </div>
            <div className="h-3 rounded-full" style={{ background: "#EFEBE5" }}>
              <div className="h-3 rounded-full transition-all duration-300" style={{ width: `${Math.max(2, (r.value / top) * 100)}%`, background: r.light ? "#BCC7CF" : NAVY }} />
            </div>
            {r.sub && <div className="text-sm mt-1" style={{ color: MUTED }}>{r.sub}</div>}
          </>
        );
        return r.onClick
          ? <button key={r.key} type="button" onClick={r.onClick} className="text-left rounded-xl px-3 py-2 -mx-3 transition-colors hover:bg-[#F7F5F2]">{inner}</button>
          : <div key={r.key} className="px-3 py-2 -mx-3">{inner}</div>;
      })}
    </div>
  );
}

export function Hint({ children, tone = "plain" }: { children: ReactNode; tone?: "plain" | "warn" }) {
  return (
    <div className="rounded-xl px-4 py-3 text-[15px] leading-relaxed" style={{ background: tone === "warn" ? "#FBF1DC" : SOFT, color: tone === "warn" ? "#7A5200" : "#333" }}>
      {children}
    </div>
  );
}

/** "Based on 12 ads" with a gentle warning when there are too few to trust. */
export function BasedOn({ n, what = "ads" }: { n: number; what?: string }) {
  if (n === 0) return <span style={{ color: MUTED }}>No ads to go on</span>;
  if (n < 5) return <span style={{ color: "#7A5200" }}>Only {n} {n === 1 ? what.replace(/s$/, "") : what}, so this is a rough guess</span>;
  if (n < 10) return <span style={{ color: MUTED }}>Based on {n} {what} (a small sample)</span>;
  return <span style={{ color: MUTED }}>Based on {n} {what}</span>;
}

// ── Motion and the dot plot ─────────────────────────────────────────────────


/** Rolls smoothly to a new number (instant when the person prefers reduced motion). */
export function AnimatedNumber({ value, format = (v: number) => cad(v) }: { value: number | null; format?: (v: number) => string }) {
  const [shown, setShown] = useStateM(value ?? 0);
  const from = useRefM(value ?? 0);
  useEffectM(() => {
    if (value == null) return;
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const start = from.current, t0 = performance.now(), dur = reduce ? 0 : 450;
    let raf = 0;
    const tick = (t: number) => {
      const k = dur ? Math.min(1, (t - t0) / dur) : 1;
      const eased = 1 - Math.pow(1 - k, 3);
      const v = start + (value - start) * eased;
      setShown(v);
      if (k < 1) raf = requestAnimationFrame(tick); else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  if (value == null) return <>—</>;
  return <span className="tabular-nums">{format(Math.round(shown))}</span>;
}

export interface Dot { id: string; price: number; title: string; detail: string; on: boolean }

const AXIS_MAX = 4000;
const xOf = (p: number) => (Math.min(p, AXIS_MAX) / AXIS_MAX) * 100;

/**
 * Every ad is one dot on a price line, stacked where prices bunch up.
 * Dots that match the current choices are dark; the rest fade back.
 */
export function DotPlot({ dots, median, p25, p75, onOpen, you }: { dots: Dot[]; median: number | null; p25: number | null; p75: number | null; onOpen: (id: string) => void; you?: number[] }) {
  const [hover, setHover] = useStateM<(Dot & { x: number; y: number }) | null>(null);
  const R = 5, STEP = 11, BUCKET = 50;
  const placed = useMemoM(() => {
    const stacks = new Map<number, number>();
    // Matching dots go to the bottom of each stack so they read as one solid shape.
    return [...dots].sort((a, b) => Number(b.on) - Number(a.on) || a.price - b.price).map((d) => {
      const b = Math.round(Math.min(d.price, AXIS_MAX) / BUCKET);
      const i = stacks.get(b) ?? 0;
      stacks.set(b, i + 1);
      return { ...d, x: xOf(b * BUCKET), level: i };
    });
  }, [dots]);
  const height = Math.max(90, (Math.max(0, ...placed.map((d) => d.level)) + 1) * STEP + 16);
  const ticks = [0, 1000, 2000, 3000, 4000];
  return (
    <div className="relative select-none" onMouseLeave={() => setHover(null)}>
      <div className="relative" style={{ height }}>
        {p25 != null && p75 != null && (
          <div className="absolute bottom-0 rounded-t-xl transition-all duration-500" style={{ left: `${xOf(p25)}%`, width: `${xOf(p75) - xOf(p25)}%`, top: 0, background: "rgba(31,47,58,0.06)" }} />
        )}
        {placed.map((d) => (
          <button key={d.id} type="button" tabIndex={-1} aria-label={`${cad(d.price)} ${d.title}`}
            onMouseEnter={() => setHover({ ...d, x: d.x, y: height - 8 - d.level * STEP })} onFocus={() => setHover({ ...d, x: d.x, y: height - 8 - d.level * STEP })}
            onClick={() => onOpen(d.id)}
            className="absolute rounded-full transition-all duration-500 ease-out hover:scale-150"
            style={{
              width: R * 2, height: R * 2, left: `calc(${d.x}% - ${R}px)`, bottom: 8 + d.level * STEP,
              background: d.on ? NAVY : "#DDD6CC", opacity: d.on ? 1 : 0.7, cursor: "pointer", zIndex: d.on ? 2 : 1,
              boxShadow: hover?.id === d.id ? `0 0 0 3px ${BURGUNDY}` : undefined,
            }} />
        ))}
        {median != null && (
          <div className="absolute top-0 bottom-0 transition-all duration-500 pointer-events-none" style={{ left: `${xOf(median)}%`, width: 2, marginLeft: -1, background: BURGUNDY }}>
            <span className="absolute -top-6 -translate-x-1/2 text-xs font-bold whitespace-nowrap px-2 py-0.5 rounded-full" style={{ background: BURGUNDY, color: "#FAF8F5" }}>Typical {cad(median)}</span>
          </div>
        )}
        {(you ?? []).map((v) => (
          <div key={v} className="absolute top-0 bottom-0 pointer-events-none" style={{ left: `${xOf(v)}%`, width: 0, borderLeft: `2px dashed ${NAVY}` }}>
            <span className="absolute -top-6 -translate-x-1/2 text-xs font-bold whitespace-nowrap px-2 py-0.5 rounded-full border-2 bg-white" style={{ borderColor: NAVY, color: NAVY }}>You {cad(v)}</span>
          </div>
        ))}
        {hover && (
          <div className="absolute z-10 pointer-events-none rounded-xl px-3 py-2 text-sm shadow-lg" role="status"
            style={{ left: `clamp(0px, calc(${hover.x}% - 110px), calc(100% - 220px))`, bottom: height - hover.y + 14, width: 220, background: NAVY, color: "#FAF8F5" }}>
            <div className="text-lg font-bold tabular-nums">{cad(hover.price)}</div>
            <div className="truncate">{hover.title}</div>
            <div className="opacity-75 truncate">{hover.detail}</div>
            <div className="opacity-75 text-xs mt-1">Click to open</div>
          </div>
        )}
      </div>
      <div className="relative h-6 border-t" style={{ borderColor: BORDER }}>
        {ticks.map((t) => (
          <span key={t} className="absolute text-xs -translate-x-1/2 mt-1 tabular-nums" style={{ left: `${xOf(t)}%`, color: MUTED }}>{t === AXIS_MAX ? "$4k+" : t === 0 ? "$0" : `$${t / 1000}k`}</span>
        ))}
      </div>
    </div>
  );
}

/** One thin row of dots on the same price line, for comparing groups at a glance. */
export function MiniStrip({ prices, median, active }: { prices: number[]; median: number | null; active?: boolean }) {
  return (
    <div className="relative h-5">
      <div className="absolute inset-x-0 top-1/2 h-px" style={{ background: BORDER }} />
      {prices.map((p, i) => (
        <span key={i} className="absolute top-1/2 rounded-full transition-all duration-500" style={{ left: `calc(${xOf(p)}% - 3px)`, width: 6, height: 6, marginTop: -3, background: active ? NAVY : "#8597A3", opacity: 0.55 }} />
      ))}
      {median != null && <span className="absolute top-0 bottom-0 transition-all duration-500" style={{ left: `${xOf(median)}%`, width: 3, marginLeft: -1.5, borderRadius: 2, background: active ? BURGUNDY : NAVY }} />}
    </div>
  );
}
