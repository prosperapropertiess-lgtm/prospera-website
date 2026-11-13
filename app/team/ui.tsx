"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// Shared pieces for the specialist app. Big tap targets, one main action per screen.

export const NAVY = "#1F2F3A";
export const BURGUNDY = "#8B2030";
export const BORDER = "#D8D2C8";
export const MUTED = "#666666";
export const TZ = "America/Toronto";

export const tTime = (iso: string) => new Date(iso).toLocaleTimeString("en-CA", { timeZone: TZ, hour: "numeric", minute: "2-digit" }).replace(/\./g, "");
export const tDay = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ, weekday: "long", month: "long", day: "numeric" });
export const tDayShort = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ, weekday: "short", month: "short", day: "numeric" });
export const money = (n: number) => `$${n.toLocaleString("en-CA", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

export function relDay(iso: string) {
  const k = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: TZ });
  const today = k(new Date()), tomorrow = k(new Date(Date.now() + 864e5));
  const d = k(new Date(iso));
  return d === today ? "Today" : d === tomorrow ? "Tomorrow" : tDayShort(iso);
}

/** Fetch a view from /api/team; sends people to sign-in when their session ran out. */
export function useTeam<T>(view: string, extra = "") {
  const router = useRouter();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    const res = await fetch(`/api/team?view=${view}${extra}`, { cache: "no-store" });
    if (res.status === 401) { router.replace("/team/login"); return; }
    const d = await res.json().catch(() => ({}));
    if (!res.ok) setError(d.error ?? "Couldn't load this."); else setData(d);
  }, [view, extra, router]);
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, [load]);
  return { data, error, reload: load };
}

export async function teamPost(body: object): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  const res = await fetch("/api/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

const NAV = [
  { href: "/team", label: "Home", icon: "M3 11l9-8 9 8M5 10v10h14V10" },
  { href: "/team/fieldops", label: "Field Ops", icon: "M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" },
  { href: "/team/dashboard", label: "Dashboard", icon: "M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z" },
  { href: "/team/availability", label: "My times", icon: "M8 2v4M16 2v4M3 10h18M5 6h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" },
];

export function TeamShell({ children, title, back }: { children: React.ReactNode; title?: string; back?: string }) {
  const path = usePathname();
  const router = useRouter();
  async function logout() {
    await teamPost({ action: "logout" });
    router.replace("/team/login");
  }
  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "#F7F5F2", fontFamily: "var(--font-dm-sans)" }}>
      <header className="sticky top-0 z-10 px-5 py-3.5 border-b bg-white/95 backdrop-blur flex items-center justify-between" style={{ borderColor: BORDER }}>
        {back
          ? <Link href={back} className="text-[15px] font-semibold py-1 pr-3" style={{ color: NAVY }}>← Back</Link>
          : <span className="text-[17px] font-bold" style={{ fontFamily: "var(--font-cormorant)", color: NAVY }}>Prospera <span style={{ color: MUTED, fontWeight: 600 }}>FieldOps</span></span>}
        {title && <span className="text-sm font-semibold" style={{ color: MUTED }}>{title}</span>}
        {!back && <button type="button" onClick={logout} className="text-sm py-1 pl-3" style={{ color: MUTED }}>Sign out</button>}
      </header>
      <main className="max-w-xl mx-auto px-5 py-6 team-in">{children}</main>
      <nav className="fixed bottom-0 inset-x-0 border-t bg-white z-10" style={{ borderColor: BORDER, paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="max-w-xl mx-auto grid grid-cols-4">
          {NAV.map((n) => {
            const on = n.href === "/team" ? path === "/team" : n.href === "/team/fieldops" ? path?.startsWith("/team/fieldops") || path?.startsWith("/team/session") || path?.startsWith("/team/showings") : path?.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} className="flex flex-col items-center gap-1 py-2.5 text-xs font-semibold" style={{ color: on ? NAVY : "#999" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={n.icon} /></svg>
                {n.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <style>{`
        .team-in{animation:teamIn .2s ease-out}
        @keyframes teamIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        @media (prefers-reduced-motion: reduce){.team-in{animation:none}}
      `}</style>
    </div>
  );
}

export function H1({ children }: { children: React.ReactNode }) {
  return <h1 className="text-[28px] font-bold leading-tight" style={{ fontFamily: "var(--font-cormorant)", color: NAVY }}>{children}</h1>;
}
export function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: MUTED }}>{children}</div>;
}
export function Box({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <div className={`rounded-2xl border bg-white ${className}`} style={{ borderColor: BORDER, ...style }}>{children}</div>;
}
export function Primary({ children, onClick, disabled, type = "button" }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; type?: "button" | "submit" }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className="w-full min-h-[54px] px-6 text-[15px] font-semibold rounded-xl transition-opacity hover:opacity-90 disabled:opacity-50"
      style={{ backgroundColor: BURGUNDY, color: "#FAF8F5" }}>{children}</button>
  );
}
export function Secondary({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="w-full min-h-[50px] px-6 text-[15px] font-semibold rounded-xl border-2 disabled:opacity-50"
      style={{ borderColor: NAVY, color: NAVY, background: "#fff" }}>{children}</button>
  );
}
export function Pill({ children, tone = "grey" }: { children: React.ReactNode; tone?: "grey" | "green" | "amber" | "red" | "navy" }) {
  const t = { grey: ["#F1EEE9", "#555"], green: ["#EAF3EC", "#2F6B3F"], amber: ["#FBF1DC", "#8A5A00"], red: ["#F8EAEC", BURGUNDY], navy: [NAVY, "#FAF8F5"] }[tone];
  return <span className="inline-block rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: t[0], color: t[1] }}>{children}</span>;
}
export function Note({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "error" | "ok" }) {
  const t = { info: ["#F1EEE9", "#333"], error: ["#F8EAEC", BURGUNDY], ok: ["#EAF3EC", "#2F6B3F"] }[tone];
  return <div role={tone === "error" ? "alert" : undefined} className="rounded-xl px-4 py-3 text-sm font-medium" style={{ background: t[0], color: t[1] }}>{children}</div>;
}

export const STATUS: Record<string, { label: string; tone: "grey" | "green" | "amber" | "red" | "navy" }> = {
  confirmed: { label: "Booked", tone: "navy" },
  in_progress: { label: "Happening now", tone: "amber" },
  completed: { label: "Done", tone: "green" },
  followed_up: { label: "Done · link sent", tone: "green" },
  no_show: { label: "No-show", tone: "grey" },
  reassignment_pending: { label: "Being reassigned", tone: "red" },
  failed: { label: "Didn't happen", tone: "grey" },
  cancelled: { label: "Cancelled", tone: "grey" },
};
