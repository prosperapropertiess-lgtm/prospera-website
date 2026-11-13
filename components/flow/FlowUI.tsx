"use client";
// Shared look for the step-by-step public forms (viewing request at /view, rental application at /apply).
import Link from "next/link";
import Image from "next/image";

export const NAVY = "#1F2F3A";
export const BURGUNDY = "#8B2030";
export const BORDER = "#D8D2C8";
export const MUTED = "#666666";
export const heading = { fontFamily: "var(--font-cormorant)", color: NAVY };

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F5F2", fontFamily: "var(--font-dm-sans)" }}>
      <header className="px-5 py-4 border-b bg-white" style={{ borderColor: BORDER }}>
        <Link href="/" className="text-lg font-bold" style={heading}>Prospera Properties</Link>
      </header>
      <div className="max-w-xl mx-auto px-5 py-8">{children}</div>
      <style>{`
        .view-step{animation:viewIn .18s ease-out}
        @keyframes viewIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        .view-pop{animation:viewPop .35s ease-out}
        @keyframes viewPop{from{transform:scale(.6);opacity:0}to{transform:none;opacity:1}}
        @media (prefers-reduced-motion: reduce){.view-step,.view-pop{animation:none}}
      `}</style>
    </div>
  );
}

export function Progress({ index, total, label, onBack }: { index: number; total: number; label: string; onBack?: () => void }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2 text-sm" style={{ color: MUTED }}>
        {onBack ? <button type="button" onClick={onBack} className="font-medium py-2 pr-3" style={{ color: NAVY }}>← Back</button> : <span />}
        <span aria-live="polite">Step {index + 1} of {total} · {label}</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ backgroundColor: BORDER }}>
        <div className="h-1.5 rounded-full transition-all duration-200" style={{ width: `${Math.round((index / total) * 100)}%`, backgroundColor: NAVY }} />
      </div>
    </div>
  );
}

/** The home being asked about, shown above each step. */
export function HomeCard({ image, address, price, utilitiesIncluded, extra, onChange }: {
  image?: string | null; address: string; price: number; utilitiesIncluded?: boolean; extra?: string; onChange?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border p-3 mb-6 bg-white" style={{ borderColor: BORDER }}>
      {image && <Image src={image} alt="" width={56} height={56} className="w-14 h-14 rounded-lg object-cover shrink-0" />}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold truncate" style={{ color: NAVY }}>{address}</div>
        <div className="text-sm" style={{ color: MUTED }}>${price.toLocaleString()}/mo{utilitiesIncluded ? " · utilities included" : ""}{extra ? ` · ${extra}` : ""}</div>
      </div>
      {onChange && <button type="button" onClick={onChange} className="text-sm font-medium underline shrink-0" style={{ color: NAVY }}>Change</button>}
    </div>
  );
}

/** A question title with its helper line and an anchor for scrolling to errors. */
export function Question({ id, title, sub, error, children, followUp }: {
  id: string; title: string; sub?: string; error?: string; children: React.ReactNode; followUp?: boolean;
}) {
  return (
    <div id={`q-${id}`} className={followUp ? "pl-4 border-l-2 view-step" : ""} style={followUp ? { borderColor: BORDER } : undefined}>
      <p className="text-lg font-semibold mb-1 leading-snug" style={{ color: NAVY }}>{title}</p>
      {sub ? <p className="text-sm mb-3" style={{ color: MUTED }}>{sub}</p> : <div className="mb-3" />}
      {children}
      {error && <Err>{error}</Err>}
    </div>
  );
}

export function Choice({ children, selected, onClick, compact, hint }: { children: React.ReactNode; selected: boolean; onClick: () => void; compact?: boolean; hint?: string }) {
  return (
    <button type="button" aria-pressed={selected} onClick={onClick}
      className={`w-full ${compact ? "min-h-[48px] px-3 py-3 text-[15px]" : "min-h-[56px] px-5 py-4 text-base"} text-left font-semibold border-2 rounded-xl transition-colors duration-150 flex items-center justify-between gap-2`}
      style={{ borderColor: selected ? NAVY : BORDER, color: selected ? "#FAF8F5" : NAVY, backgroundColor: selected ? NAVY : "#FFFFFF" }}>
      <span>
        {children}
        {hint && <span className="block text-sm font-normal mt-0.5" style={{ color: selected ? "rgba(250,248,245,0.75)" : MUTED }}>{hint}</span>}
      </span>
      {selected && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FAF8F5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0"><path d="M5 12l5 5L20 7" /></svg>}
    </button>
  );
}

export function Next({ onClick, children = "Continue", disabled }: { onClick: () => void; children?: React.ReactNode; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="w-full px-8 py-4 text-sm font-semibold uppercase tracking-widest rounded transition-opacity hover:opacity-80 disabled:opacity-60"
      style={{ backgroundColor: BURGUNDY, color: "#FAF8F5" }}>
      {children}
    </button>
  );
}

export function Text({ id, label, value, onChange, error, sub, ...rest }: {
  id: string; label: string; value: string; onChange: (v: string) => void; error?: string; sub?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "id">) {
  return (
    <div id={`q-${id}`}>
      <label htmlFor={id} className="block text-sm font-semibold mb-2" style={{ color: NAVY }}>{label}</label>
      {sub && <p className="text-sm -mt-1 mb-2" style={{ color: MUTED }}>{sub}</p>}
      <input id={id} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined}
        className="w-full px-4 py-4 border rounded-lg text-base bg-white" style={{ borderColor: error ? BURGUNDY : BORDER, color: "#222" }} {...rest} />
      {error && <Err id={`${id}-err`}>{error}</Err>}
    </div>
  );
}

/** A plain input styled like the rest, for use inside a Question. */
export function Input({ invalid, className = "", ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input {...rest} className={`w-full px-4 py-3.5 border rounded-lg text-base bg-white ${className}`} style={{ borderColor: invalid ? BURGUNDY : BORDER, color: "#222", ...rest.style }} />;
}

export function Err({ children, id }: { children: React.ReactNode; id?: string }) {
  return <p id={id} role="alert" className="text-sm mt-2" style={{ color: BURGUNDY }}>{children}</p>;
}
