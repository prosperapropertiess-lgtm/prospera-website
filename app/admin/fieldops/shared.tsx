"use client";

import type { CSSProperties, ReactNode } from "react";
import { C } from "@/components/admin/kit";

export const TZ = "America/Toronto";
export const fTime = (iso: string) => new Date(iso).toLocaleTimeString("en-CA", { timeZone: TZ, hour: "numeric", minute: "2-digit" }).replace(/\./g, "");
export const fDay = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ, weekday: "short", month: "short", day: "numeric" });
export const fDayLong = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ, weekday: "long", month: "long", day: "numeric" });
export const dayOf = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ });
export const cash = (n: number) => `$${Number(n).toLocaleString("en-CA", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
export const mm = (m: number) => {
  const h = Math.floor(m / 60) % 24, n = m % 60, ap = h < 12 ? "am" : "pm", h12 = h % 12 === 0 ? 12 : h % 12;
  return n ? `${h12}:${String(n).padStart(2, "0")}${ap}` : `${h12}${ap}`;
};

export async function api<T = Record<string, unknown>>(view: string, extra = ""): Promise<T> {
  const res = await fetch(`/api/admin/fieldops?view=${view}${extra}`, { cache: "no-store" });
  const d = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(d.error ?? "Couldn't load.");
  return d as T;
}

export async function act(body: Record<string, unknown>): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  const res = await fetch("/api/admin/fieldops", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { ok: res.ok, data: await res.json().catch(() => ({})) };
}

export const STATUS: Record<string, { label: string; tone: "green" | "amber" | "red" | "blue" | "grey" }> = {
  confirmed: { label: "Booked", tone: "blue" },
  in_progress: { label: "Happening now", tone: "amber" },
  completed: { label: "Done", tone: "green" },
  followed_up: { label: "Done · link sent", tone: "green" },
  no_show: { label: "No-show", tone: "grey" },
  reassignment_pending: { label: "Needs a specialist", tone: "red" },
  failed: { label: "Didn't happen", tone: "grey" },
  cancelled: { label: "Cancelled", tone: "grey" },
};

// Each specialist gets a steady colour on the calendar (navy family, no new brand colours).
const SHADES = ["#1F2F3A", "#4A6272", "#6E8796", "#2E4756", "#8AA0AD", "#3B5566"];
export const shade = (i: number) => SHADES[i % SHADES.length];

export const input: CSSProperties = {
  fontFamily: "inherit", fontSize: 15, padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.borderStrong}`, background: "#fff", color: C.text, width: "100%", boxSizing: "border-box",
};

export function Label({ children }: { children: ReactNode }) {
  return <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 6 }}>{children}</div>;
}

export function Panel({ title, onClose, children, width = 520 }: { title: ReactNode; onClose: () => void; children: ReactNode; width?: number }) {
  return (
    <div role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(31,47,58,0.35)" }} />
      <div style={{ position: "relative", width: `min(${width}px, 100vw)`, height: "100%", background: C.bg, overflowY: "auto", boxShadow: "-12px 0 40px rgba(31,47,58,0.18)", animation: "foIn .18s ease-out" }}>
        <div style={{ position: "sticky", top: 0, zIndex: 1, background: C.bg, padding: "18px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>{title}</div>
          <button onClick={onClose} aria-label="Close" style={{ border: 0, background: C.surface, width: 34, height: 34, borderRadius: 999, cursor: "pointer", fontSize: 18, color: C.navy }}>×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
      <style>{`@keyframes foIn{from{transform:translateX(30px);opacity:.4}to{transform:none;opacity:1}}`}</style>
    </div>
  );
}

export function Row({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 12, padding: "9px 0", borderBottom: `1px solid ${C.border}`, fontSize: 15 }}>
      <span style={{ width: 130, flexShrink: 0, color: C.muted }}>{k}</span>
      <span style={{ color: C.text, fontWeight: 500, minWidth: 0 }}>{v}</span>
    </div>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)}
      style={{ display: "inline-flex", alignItems: "center", gap: 10, border: 0, background: "transparent", cursor: "pointer", padding: 0, fontFamily: "inherit", fontSize: 15, color: C.navy, fontWeight: 600 }}>
      <span style={{ width: 42, height: 24, borderRadius: 999, background: on ? C.green : C.borderStrong, position: "relative", transition: "background .15s" }}>
        <span style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 18, height: 18, borderRadius: 999, background: "#fff", transition: "left .15s" }} />
      </span>
      {label}
    </button>
  );
}
