"use client";
import type { CSSProperties, ReactNode } from "react";
import { C } from "@/components/admin/kit";
import type { Filters, Obs, Stats } from "@/lib/market/core";
import { cad, sampleLabel } from "@/lib/market/core";

export type Tab = "overview" | "listings" | "areas" | "trends" | "mine" | "data";

export interface Snapshot {
  id: string;
  scan_key: string;
  scan_label: string | null;
  scan_date: string | null;
  scan_identity_verified: boolean;
  revision: number;
  listing_count: number;
  ingested_at: string;
  published_at: string | null;
  source_url: string | null;
  parser_version: string;
  schema_report: { header?: string[]; newColumns?: string[]; rowCount?: number; issues?: { flag: string; count: number }[] };
  reported?: Record<string, number | null> | null;
}

export interface Ctx {
  obs: Obs[];
  snapshot: Snapshot;
  snapshots: Snapshot[];
  filters: Filters;
  setFilters: (f: Filters) => void;
  /** Open the Listings tab with these filter changes applied. */
  drill: (patch: Partial<Filters>) => void;
  openListing: (id: string) => void;
  setTab: (t: Tab) => void;
}

// Navy shades only: the palette has no other accent colours.
export const SERIES = ["#1F2F3A", "#4F6575", "#8597A3", "#BCC7CF", "#2E4453", "#6B7F8C"];

export const fmtDate = (d: string | null | undefined, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }) =>
  !d ? "—" : new Date(d.length === 10 ? `${d}T12:00:00` : d).toLocaleDateString("en-CA", { timeZone: "America/Toronto", ...opts });
export const fmtDateTime = (d: string | null | undefined) =>
  !d ? "—" : new Date(d).toLocaleString("en-CA", { timeZone: "America/Toronto", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
export const pct = (n: number | null, digits = 1) => (n == null ? "—" : `${n > 0 ? "+" : ""}${n.toFixed(digits)}%`);
export const tabular: CSSProperties = { fontVariantNumeric: "tabular-nums" };

export function Panel({ title, sub, right, children, style }: { title?: ReactNode; sub?: ReactNode; right?: ReactNode; children: ReactNode; style?: CSSProperties }) {
  return (
    <section style={{ background: C.surface, border: "1px solid #D8D2C8", borderRadius: 16, padding: 24, minWidth: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", ...style }}>
      {(title || right) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: sub ? 4 : 14, flexWrap: "wrap" }}>
          {title && <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.navy, fontFamily: "var(--font-cormorant)", lineHeight: 1.2 }}>{title}</h3>}
          {right}
        </div>
      )}
      {sub && <p style={{ margin: "0 0 16px", fontSize: 15, color: C.muted, lineHeight: 1.5 }}>{sub}</p>}
      {children}
    </section>
  );
}

export function Note({ tone = "grey", children }: { tone?: "grey" | "amber" | "red"; children: ReactNode }) {
  const map = { grey: [C.greyBg, C.text], amber: [C.amberBg, C.amber], red: [C.redBg, C.red] } as const;
  const [bg, fg] = map[tone];
  return (
    <div role={tone === "red" ? "alert" : undefined} style={{ background: bg, color: fg, borderRadius: 12, padding: "12px 16px", fontSize: 15, lineHeight: 1.55 }}>
      {tone === "red" && <strong style={{ marginRight: 6 }}>Problem:</strong>}
      {children}
    </div>
  );
}

export function SampleTag({ n }: { n: number }) {
  const s = sampleLabel(n);
  if (!s) return null;
  return <span style={{ fontSize: 12, fontWeight: 600, color: C.amber, background: C.amberBg, borderRadius: 999, padding: "2px 8px", marginLeft: 6, whiteSpace: "nowrap" }}>{s}</span>;
}

export function Kpi({ label, value, sub, onClick, unavailable }: { label: string; value: ReactNode; sub?: ReactNode; onClick?: () => void; unavailable?: boolean }) {
  const inner = (
    <>
      <div style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: unavailable ? 16 : 26, fontWeight: 700, color: unavailable ? C.faint : C.navy, margin: "6px 0 4px", ...tabular }}>{value}</div>
      {sub && <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.4 }}>{sub}</div>}
    </>
  );
  const style: CSSProperties = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, textAlign: "left", height: "100%", width: "100%", font: "inherit" };
  return onClick ? <button type="button" onClick={onClick} style={{ ...style, cursor: "pointer" }}>{inner}</button> : <div style={style}>{inner}</div>;
}

export function StatsLine({ s, label = "asking rent" }: { s: Stats; label?: string }) {
  if (!s.n) return <span style={{ color: C.faint }}>No eligible {label} data</span>;
  return (
    <span style={tabular}>
      Median {cad(s.median)} · middle 50% {cad(s.p25)}–{cad(s.p75)} · n={s.n}<SampleTag n={s.n} />
    </span>
  );
}

export function Pill({ active, children, onClick, title }: { active?: boolean; children: ReactNode; onClick: () => void; title?: string }) {
  return (
    <button type="button" onClick={onClick} title={title} aria-pressed={active}
      style={{
        border: `2px solid ${active ? C.navy : "#D8D2C8"}`, background: active ? C.navy : C.surface, color: active ? "#FAF8F5" : C.navy,
        borderRadius: 12, padding: "7px 12px", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", minHeight: 40,
      }}>
      {children}
    </button>
  );
}

export const th: CSSProperties = { textAlign: "left", padding: "10px 12px", fontSize: 12, fontWeight: 700, color: C.muted, borderBottom: `1px solid ${C.border}`, background: C.greyBg, whiteSpace: "nowrap", position: "sticky", top: 0 };
export const tdc: CSSProperties = { padding: "9px 12px", fontSize: 14, borderBottom: `1px solid ${C.border}`, color: C.text, verticalAlign: "top" };

/** Wide tables scroll inside their own box instead of squeezing on small screens. */
export function TableWrap({ children, maxHeight }: { children: ReactNode; maxHeight?: number }) {
  return <div style={{ overflow: "auto", maxHeight, border: `1px solid ${C.border}`, borderRadius: 10 }}>{children}</div>;
}

export function download(name: string, text: string, type = "text/csv") {
  const blob = new Blob([text], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
