"use client";

import Link from "next/link";

// Shared pieces for the tenant booking pages, styled like the /view form.

const NAVY = "#1F2F3A";
const BURGUNDY = "#8B2030";
const BORDER = "#D8D2C8";

export function BookShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F5F2", fontFamily: "var(--font-dm-sans)" }}>
      <header className="px-5 py-4 border-b bg-white" style={{ borderColor: BORDER }}>
        <Link href="/" className="text-lg font-bold" style={{ fontFamily: "var(--font-cormorant)", color: NAVY }}>Prospera Properties</Link>
      </header>
      <div className="max-w-xl mx-auto px-5 py-7 book-in">{children}</div>
      <style>{`
        .book-in{animation:bookIn .2s ease-out}
        @keyframes bookIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        .book-pop{animation:bookPop .35s ease-out}
        @keyframes bookPop{from{transform:scale(.6);opacity:0}to{transform:none;opacity:1}}
        @media (prefers-reduced-motion: reduce){.book-in,.book-pop{animation:none}}
      `}</style>
    </div>
  );
}

export function Burgundy({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="w-full px-8 py-4 text-sm font-semibold uppercase tracking-widest rounded transition-opacity hover:opacity-85 disabled:opacity-60"
      style={{ backgroundColor: BURGUNDY, color: "#FAF8F5" }}>
      {children}
    </button>
  );
}

export function HomeCard({ home }: { home: { address: string; city: string; price: number; bedrooms: number | null; bathrooms: number | null; image: string | null; utilities_included?: boolean | null } }) {
  const facts = [
    home.bedrooms != null ? `${home.bedrooms} bed` : null,
    home.bathrooms != null ? `${home.bathrooms} bath` : null,
    home.utilities_included ? "utilities included" : null,
  ].filter(Boolean).join(" · ");
  return (
    <div className="flex gap-4 items-center rounded-2xl border bg-white p-3" style={{ borderColor: BORDER }}>
      {home.image
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={home.image} alt="" className="w-24 h-20 rounded-xl object-cover shrink-0" />
        : <div className="w-24 h-20 rounded-xl shrink-0" style={{ background: "#EFEBE4" }} />}
      <div className="min-w-0">
        <div className="font-bold text-[17px] leading-snug truncate" style={{ color: NAVY }}>{home.address}</div>
        <div className="text-sm" style={{ color: "#666" }}>{home.city}</div>
        <div className="text-sm mt-1" style={{ color: "#333" }}><b>${home.price.toLocaleString("en-CA")}</b>/month{facts ? ` · ${facts}` : ""}</div>
      </div>
    </div>
  );
}

export function Err({ title, body }: { title: string; body: string }) {
  return (
    <div className="py-16 text-center">
      <div className="text-2xl font-bold" style={{ fontFamily: "var(--font-cormorant)", color: NAVY }}>{title}</div>
      <p className="mt-2 text-[15px]" style={{ color: "#555" }}>{body}</p>
    </div>
  );
}

export function Done({ title, when, where, ics, manage, note }: { title: string; when: string; where: string; ics: string; manage?: string; note: string }) {
  return (
    <div className="pt-6 text-center">
      <div className="book-pop mx-auto w-16 h-16 rounded-full flex items-center justify-center" style={{ background: NAVY }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FAF8F5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
      </div>
      <h1 className="text-[30px] font-bold mt-5" style={{ fontFamily: "var(--font-cormorant)", color: NAVY }}>{title}</h1>
      <div className="mt-5 rounded-2xl border bg-white text-left overflow-hidden" style={{ borderColor: BORDER }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "#EFEBE4" }}>
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#666" }}>When</div>
          <div className="font-bold text-[17px] mt-1" style={{ color: NAVY }}>{when}</div>
        </div>
        <div className="px-5 py-4">
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#666" }}>Where</div>
          <div className="font-bold text-[17px] mt-1" style={{ color: NAVY }}>{where}</div>
        </div>
      </div>
      <p className="mt-4 text-[15px]" style={{ color: "#555" }}>{note}</p>
      <div className="mt-6 grid gap-3">
        <a href={ics} download="viewing.ics" className="block w-full rounded border-2 py-3.5 text-sm font-semibold" style={{ borderColor: NAVY, color: NAVY }}>Add to my calendar</a>
        {manage && <a href={manage} className="text-sm font-medium underline underline-offset-4" style={{ color: "#555" }}>Change or cancel</a>}
      </div>
    </div>
  );
}
