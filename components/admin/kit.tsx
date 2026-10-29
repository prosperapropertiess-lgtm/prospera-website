"use client";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

// The one place admin pages get their look from. If a page needs a color,
// size or component that isn't here, add it here instead of inlining it.

export const C = {
  bg: "#F7F5F2",
  surface: "#FFFFFF",
  border: "#E4DFD7",
  borderStrong: "#D8D2C8",
  navy: "#1F2F3A",
  text: "#222222",
  muted: "#666666",
  faint: "#999999",
  burgundy: "#8B2030",
  green: "#2F6B3F",
  greenBg: "#EAF3EC",
  amber: "#8A5A00",
  amberBg: "#FBF1DC",
  red: "#A12A2A",
  redBg: "#FBEAEA",
  blue: "#2B5A8A",
  blueBg: "#E8F0F8",
  greyBg: "#F1EEE9",
};

export const font = "var(--font-poppins), -apple-system, sans-serif";

export function Page({ children, width = 1200 }: { children: ReactNode; width?: number }) {
  return <div style={{ maxWidth: width, margin: "0 auto", padding: "40px 32px 80px" }}>{children}</div>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
      <div>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: C.navy, letterSpacing: "-0.02em", margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 15, color: C.muted, margin: "6px 0 0" }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{actions}</div>}
    </div>
  );
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "32px 0 12px" }}>
      <h2 style={{ fontSize: 17, fontWeight: 600, color: C.navy, margin: 0 }}>{children}</h2>
      {right}
    </div>
  );
}

export function Card({ children, padding = 24, style }: { children: ReactNode; padding?: number; style?: CSSProperties }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding, ...style }}>
      {children}
    </div>
  );
}

export function Grid({ children, min = 220, gap = 16 }: { children: ReactNode; min?: number; gap?: number }) {
  return <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`, gap }}>{children}</div>;
}

export function Stat({ label, value, hint, href, tone }: { label: string; value: ReactNode; hint?: ReactNode; href?: string; tone?: "alert" }) {
  const body = (
    <Card style={{ height: "100%", transition: "border-color .15s" }}>
      <div style={{ fontSize: 14, color: C.muted, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 34, fontWeight: 700, color: tone === "alert" ? C.burgundy : C.navy, margin: "6px 0 2px", letterSpacing: "-0.02em" }}>{value}</div>
      {hint && <div style={{ fontSize: 13, color: C.faint }}>{hint}</div>}
    </Card>
  );
  return href ? <Link href={href} style={{ textDecoration: "none", display: "block" }}>{body}</Link> : body;
}

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
const BUTTON: Record<ButtonVariant, CSSProperties> = {
  primary: { background: C.burgundy, color: "#fff", border: `1px solid ${C.burgundy}` },
  secondary: { background: C.surface, color: C.navy, border: `1px solid ${C.borderStrong}` },
  danger: { background: C.surface, color: C.red, border: `1px solid ${C.borderStrong}` },
  ghost: { background: "transparent", color: C.navy, border: "1px solid transparent" },
};

export function buttonStyle(variant: ButtonVariant = "secondary", size: "md" | "sm" = "md"): CSSProperties {
  return {
    ...BUTTON[variant],
    fontFamily: font,
    fontSize: size === "sm" ? 13 : 15,
    fontWeight: 600,
    padding: size === "sm" ? "6px 12px" : "11px 20px",
    borderRadius: 10,
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    whiteSpace: "nowrap",
  };
}

export function Button({
  children, onClick, href, variant = "secondary", size = "md", disabled, type = "button", target,
}: {
  children: ReactNode; onClick?: () => void; href?: string; variant?: ButtonVariant; size?: "md" | "sm";
  disabled?: boolean; type?: "button" | "submit"; target?: string;
}) {
  const style = { ...buttonStyle(variant, size), ...(disabled ? { opacity: 0.5, cursor: "not-allowed" } : {}) };
  if (href) return <Link href={href} target={target} style={style}>{children}</Link>;
  return <button type={type} onClick={onClick} disabled={disabled} style={style}>{children}</button>;
}

export type Tone = "green" | "amber" | "red" | "blue" | "grey";
const TONES: Record<Tone, [string, string]> = {
  green: [C.greenBg, C.green],
  amber: [C.amberBg, C.amber],
  red: [C.redBg, C.red],
  blue: [C.blueBg, C.blue],
  grey: [C.greyBg, C.muted],
};

export function Badge({ children, tone = "grey" }: { children: ReactNode; tone?: Tone }) {
  const [bg, fg] = TONES[tone];
  return (
    <span style={{ background: bg, color: fg, fontSize: 13, fontWeight: 600, padding: "3px 10px", borderRadius: 999, whiteSpace: "nowrap", display: "inline-block" }}>
      {children}
    </span>
  );
}

export function Tabs<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string; count?: number }[] }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            style={{
              fontFamily: font, fontSize: 14, fontWeight: 600, padding: "8px 16px", borderRadius: 999, cursor: "pointer",
              background: on ? C.navy : C.surface, color: on ? "#fff" : C.navy, border: `1px solid ${on ? C.navy : C.borderStrong}`,
            }}
          >
            {o.label}{o.count != null && <span style={{ opacity: 0.6, marginLeft: 6 }}>{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: ReactNode; action?: ReactNode }) {
  return (
    <Card padding={48} style={{ textAlign: "center" }}>
      <div style={{ fontSize: 17, fontWeight: 600, color: C.navy }}>{title}</div>
      {body && <div style={{ fontSize: 15, color: C.muted, marginTop: 6 }}>{body}</div>}
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </Card>
  );
}

export function Loading() {
  return <div style={{ padding: 60, textAlign: "center", color: C.faint, fontSize: 15 }}>Loading…</div>;
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <div style={{ background: C.redBg, color: C.red, border: `1px solid #F0CFCF`, borderRadius: 10, padding: "12px 16px", fontSize: 14, marginBottom: 16 }}>
      {children}
    </div>
  );
}

// Tables: a white card with a header row and evenly padded cells.
export function Table({ head, children }: { head: ReactNode[]; children: ReactNode }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
          <thead>
            <tr style={{ background: "#FBFAF8" }}>
              {head.map((h, i) => (
                <th key={i} style={{ textAlign: "left", padding: "12px 16px", fontSize: 13, fontWeight: 600, color: C.muted, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export const td: CSSProperties = { padding: "14px 16px", borderBottom: `1px solid ${C.border}`, color: C.text, verticalAlign: "middle" };

// Display helpers so raw database values never reach the screen.
export function humanize(v: string | null | undefined): string {
  if (!v) return "—";
  return v.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim().replace(/^\w/, (c) => c.toUpperCase());
}

export function titleCaseAddress(v: string | null | undefined): string {
  if (!v) return "—";
  return v.replace(/\b([a-z])([a-z]*)/g, (_, a: string, b: string) => a.toUpperCase() + b);
}

export function shortDate(v: string | null | undefined): string {
  if (!v) return "—";
  const d = new Date(v.length === 10 ? v + "T12:00:00" : v);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: d.getFullYear() === new Date().getFullYear() ? undefined : "numeric" });
}

export function ago(v: string | null | undefined): string {
  if (!v) return "—";
  const mins = Math.round((Date.now() - new Date(v).getTime()) / 60000);
  if (mins < 60) return `${Math.max(mins, 1)} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return shortDate(v);
}

export function money(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return "—";
  return n.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
}
