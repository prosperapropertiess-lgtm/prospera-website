"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { INCOME_RANGES, CREDIT_RANGES, CONSENT_TEXT, torontoToday, type PublicHome } from "@/lib/viewing-requests";

const NAVY = "#1F2F3A";
const BURGUNDY = "#8B2030";
const BORDER = "#D8D2C8";
const MUTED = "#666666";
const heading = { fontFamily: "var(--font-cormorant)", color: NAVY };
const DRAFT_KEY = "prospera-view-draft";
const STEPS = 6;

interface Draft {
  step: number;
  home: string;
  moveIn: string;
  occupants: number | null;
  manyPeople: string;
  income: string;
  credit: string;
  name: string;
  phone: string;
  email: string;
  consent: boolean;
  key: string;
  savedAt: number;
}

const blank = (): Draft => ({
  step: 0, home: "", moveIn: "", occupants: null, manyPeople: "", income: "", credit: "",
  name: "", phone: "", email: "", consent: false, key: crypto.randomUUID(), savedAt: Date.now(),
});

function fmtDate(d: string | null) {
  if (!d) return null;
  return new Date(`${d}T12:00:00`).toLocaleDateString("en-CA", { month: "long", day: "numeric" });
}
function homeLabel(h: PublicHome) {
  return h.address;
}

export default function ViewFlow({ homes, preselect }: { homes: PublicHome[]; preselect: string | null }) {
  const [d, setD] = useState<Draft | null>(null);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [done, setDone] = useState<{ ref: string; first: string; address: string } | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Restore a same-tab draft (under 24h old), else start fresh. A ?home= link jumps past step 1.
  useEffect(() => {
    let draft: Draft | null = null;
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Draft;
        if (Date.now() - parsed.savedAt < 86_400_000 && homes.some((h) => h.id === parsed.home)) draft = parsed;
      }
    } catch {}
    if (!draft) draft = blank();
    if (preselect && homes.some((h) => h.id === preselect) && draft.home !== preselect) {
      draft = { ...draft, home: preselect, moveIn: "", step: 1 };
    }
    if (draft.home && !draft.moveIn) draft.moveIn = defaultMoveIn(homes.find((h) => h.id === draft!.home));
    const t = setTimeout(() => setD(draft), 0);
    return () => clearTimeout(t);
  }, [homes, preselect]);

  useEffect(() => {
    if (!d) return;
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...d, savedAt: Date.now() })); } catch {}
  }, [d]);

  useEffect(() => { headingRef.current?.focus(); }, [d?.step, done]);

  if (!d) return <Shell><div className="h-64" /></Shell>;

  const home = homes.find((h) => h.id === d.home) ?? null;
  const update = (patch: Partial<Draft>) => setD((prev) => (prev ? { ...prev, ...patch } : prev));
  const go = (step: number) => { setErrors({}); setFormError(""); update({ step }); window.scrollTo({ top: 0 }); };

  if (homes.length === 0) {
    return (
      <Shell>
        <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-bold mb-3 outline-none" style={heading}>No homes are open for viewings right now</h1>
        <p className="text-base mb-6" style={{ color: "#333" }}>Call or text us at (519) 697-1227 and we&apos;ll tell you what&apos;s coming up.</p>
      </Shell>
    );
  }

  if (done) {
    return (
      <Shell>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6 view-pop" style={{ backgroundColor: NAVY }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FAF8F5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
        </div>
        <h1 ref={headingRef} tabIndex={-1} className="text-3xl sm:text-4xl font-bold mb-3 outline-none" style={heading}>You&apos;re in.</h1>
        <p className="text-base mb-2" style={{ color: "#333" }}>
          Thanks{done.first ? `, ${done.first}` : ""}. We&apos;ll contact you about a viewing time for {done.address}.
        </p>
        <p className="text-sm mb-8" style={{ color: MUTED }}>Your reference: {done.ref}</p>
        <p className="text-sm" style={{ color: MUTED }}>Questions? Call or text (519) 697-1227.</p>
      </Shell>
    );
  }

  async function send() {
    if (!d) return;
    const errs: Record<string, string> = {};
    if (!d.name.trim()) errs.name = "Enter your name.";
    if (d.phone.replace(/\D/g, "").length < 10) errs.phone = "Enter a phone number we can call.";
    if (d.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) errs.email = "Check your email address.";
    if (!d.consent) errs.consent = "Tick the box to send your request.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSending(true); setFormError("");
    const payload = {
      key: d.key, home: d.home, moveIn: d.moveIn, occupants: d.occupants, income: d.income, credit: d.credit,
      name: d.name, phone: d.phone, email: d.email, consent: d.consent,
    };
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch("/api/view", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const out = await res.json().catch(() => ({}));
        if (res.ok) {
          try { sessionStorage.removeItem(DRAFT_KEY); } catch {}
          setDone({ ref: out.ref, first: d.name.trim().split(/\s+/)[0], address: home ? homeLabel(home) : "the home" });
          setSending(false);
          return;
        }
        if (res.status === 422) { setErrors(out.errors ?? {}); setFormError("Check the answers marked below."); }
        else setFormError(out.error ?? "We couldn't send your request. Try again.");
        setSending(false);
        return;
      } catch {
        // network blip: retry once with the same key, so a duplicate can't be created
      }
    }
    setFormError("We couldn't reach our server. Check your connection and press Send again. Your answers are still here.");
    setSending(false);
  }

  return (
    <Shell>
      <Progress step={d.step} onBack={d.step > 0 ? () => go(d.step - 1) : undefined} />

      {home && d.step > 0 && (
        <div className="flex items-center gap-3 rounded-xl border p-3 mb-7 bg-white" style={{ borderColor: BORDER }}>
          {home.image && <Image src={home.image} alt="" width={56} height={56} className="w-14 h-14 rounded-lg object-cover shrink-0" />}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold truncate" style={{ color: NAVY }}>{homeLabel(home)}</div>
            <div className="text-sm" style={{ color: MUTED }}>${home.price.toLocaleString()}/mo{home.utilities_included ? " · utilities included" : ""}</div>
          </div>
          {homes.length > 1 && <button type="button" onClick={() => go(0)} className="text-sm font-medium underline shrink-0" style={{ color: NAVY }}>Change</button>}
        </div>
      )}

      <div key={d.step} className="view-step">
        {d.step === 0 && (
          <>
            <Q headingRef={headingRef} title="Which home would you like to see?" sub="A few quick taps. No documents or payment." />
            <div className="grid gap-4">
              {homes.map((h) => {
                const selected = d.home === h.id;
                return (
                  <button key={h.id} type="button" aria-pressed={selected}
                    onClick={() => { update({ home: h.id, moveIn: d.home === h.id && d.moveIn ? d.moveIn : defaultMoveIn(h) }); go(1); }}
                    className="text-left bg-white border-2 rounded-xl overflow-hidden transition-colors duration-150 focus-visible:outline focus-visible:outline-2"
                    style={{ borderColor: selected ? NAVY : BORDER }}>
                    {h.image && <Image src={h.image} alt="" width={640} height={300} className="w-full h-40 object-cover" />}
                    <div className="p-4">
                      <div className="text-lg font-bold" style={{ color: NAVY }}>{h.address}</div>
                      <div className="text-sm" style={{ color: MUTED }}>{h.city}</div>
                      <div className="text-base mt-2" style={{ color: "#222" }}>
                        <strong>${h.price.toLocaleString()}/mo</strong>
                        {h.bedrooms != null && ` · ${h.bedrooms} bed`}
                        {h.bathrooms != null && ` · ${h.bathrooms} bath`}
                      </div>
                      <div className="text-sm mt-1" style={{ color: MUTED }}>
                        {h.utilities_included ? `Includes ${(h.utilities_list ?? []).join(", ").toLowerCase() || "utilities"}` : "Utilities extra"}
                        {h.parking ? " · parking" : ""}
                        {h.available_date ? ` · available ${fmtDate(h.available_date)}` : ""}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {d.step === 1 && home && (
          <>
            <Q headingRef={headingRef} title="When would you like to move in?" sub={home.available_date && home.available_date > torontoToday() ? `This home is available from ${fmtDate(home.available_date)}.` : "This home is available now."} />
            <label className="block text-sm font-semibold mb-2" style={{ color: NAVY }} htmlFor="movein">Move-in date</label>
            <input id="movein" type="date" min={torontoToday()} value={d.moveIn} onChange={(e) => update({ moveIn: e.target.value })}
              className="w-full px-4 py-4 border rounded-lg text-base" style={{ backgroundColor: "#F7F5F2", borderColor: BORDER, color: "#222" }} />
            {errors.moveIn && <Err>{errors.moveIn}</Err>}
            <Next onClick={() => (d.moveIn && d.moveIn >= torontoToday() ? go(2) : setErrors({ moveIn: "Pick a date from today on." }))} />
          </>
        )}

        {d.step === 2 && (
          <>
            <Q headingRef={headingRef} title="How many people will live there?" sub="Everyone, including you." />
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <Choice key={n} selected={d.occupants === n && !d.manyPeople} onClick={() => { update({ occupants: n, manyPeople: "" }); go(3); }}>{n}</Choice>
              ))}
              <Choice selected={!!d.manyPeople} onClick={() => update({ manyPeople: d.manyPeople || "6", occupants: Number(d.manyPeople || 6) })}>6+</Choice>
            </div>
            {!!d.manyPeople && (
              <>
                <label className="block text-sm font-semibold mt-5 mb-2" style={{ color: NAVY }} htmlFor="many">Total people</label>
                <input id="many" type="number" inputMode="numeric" min={6} max={99} value={d.manyPeople}
                  onChange={(e) => update({ manyPeople: e.target.value, occupants: Number(e.target.value) || null })}
                  className="w-full px-4 py-4 border rounded-lg text-base" style={{ backgroundColor: "#F7F5F2", borderColor: BORDER }} />
                <Next onClick={() => (d.occupants && d.occupants >= 1 && d.occupants <= 99 ? go(3) : setErrors({ occupants: "Enter a number." }))} />
                {errors.occupants && <Err>{errors.occupants}</Err>}
              </>
            )}
          </>
        )}

        {d.step === 3 && (
          <>
            <Q headingRef={headingRef} title="What's your household income per month?" sub="Before tax, everyone moving in combined. A range is fine." />
            <div className="grid gap-3">
              {INCOME_RANGES.map((r) => (
                <Choice key={r.value} selected={d.income === r.value} onClick={() => { update({ income: r.value }); go(4); }}>{r.label}</Choice>
              ))}
            </div>
          </>
        )}

        {d.step === 4 && (
          <>
            <Q headingRef={headingRef} title="Roughly what's your credit score?" sub="Your best guess is fine. Nothing is checked today." />
            <div className="grid gap-3">
              {CREDIT_RANGES.map((r) => (
                <Choice key={r.value} selected={d.credit === r.value} onClick={() => { update({ credit: r.value }); go(5); }}>{r.label}</Choice>
              ))}
            </div>
          </>
        )}

        {d.step === 5 && (
          <>
            <Q headingRef={headingRef} title="Last step. How do we reach you?" sub="We'll call or text to set up a viewing time." />
            {formError && <div role="alert" className="rounded-lg border px-4 py-3 mb-5 text-sm" style={{ borderColor: BURGUNDY, color: BURGUNDY, backgroundColor: "#FFFFFF" }}>{formError}</div>}
            <div className="grid gap-5">
              <Text id="name" label="Your name" autoComplete="name" value={d.name} onChange={(v) => update({ name: v })} error={errors.name} />
              <Text id="phone" label="Phone number" type="tel" inputMode="tel" autoComplete="tel" value={d.phone} onChange={(v) => update({ phone: v })} error={errors.phone} />
              <Text id="email" label="Email (optional)" type="email" inputMode="email" autoComplete="email" value={d.email} onChange={(v) => update({ email: v })} error={errors.email} />
            </div>

            <label className="flex gap-3 items-start mt-7 cursor-pointer">
              <input type="checkbox" checked={d.consent} onChange={(e) => update({ consent: e.target.checked })} className="mt-1 w-5 h-5 shrink-0" style={{ accentColor: NAVY }} />
              <span className="text-sm" style={{ color: "#333" }}>
                {CONSENT_TEXT} <a href="/privacy" target="_blank" className="underline" style={{ color: NAVY }}>Privacy policy</a>
              </span>
            </label>
            {errors.consent && <Err>{errors.consent}</Err>}

            <button type="button" onClick={send} disabled={sending}
              className="w-full mt-7 px-8 py-4 text-sm font-semibold uppercase tracking-widest rounded transition-opacity hover:opacity-80 disabled:opacity-60"
              style={{ backgroundColor: BURGUNDY, color: "#FAF8F5" }}>
              {sending ? "Sending…" : "Send viewing request"}
            </button>
            <p className="text-sm text-center mt-3" style={{ color: MUTED }}>This is a request. We&apos;ll confirm a viewing time with you.</p>
          </>
        )}
      </div>

      <p className="text-sm mt-10" style={{ color: MUTED }}>Need help? Call or text (519) 697-1227.</p>
    </Shell>
  );
}

function defaultMoveIn(h: PublicHome | undefined) {
  const today = torontoToday();
  return h?.available_date && h.available_date > today ? h.available_date : today;
}

function Shell({ children }: { children: React.ReactNode }) {
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

function Progress({ step, onBack }: { step: number; onBack?: () => void }) {
  return (
    <div className="mb-7">
      <div className="flex items-center justify-between mb-2 text-sm" style={{ color: MUTED }}>
        {onBack ? <button type="button" onClick={onBack} className="font-medium py-2 pr-3" style={{ color: NAVY }}>← Back</button> : <span />}
        <span aria-live="polite">Step {step + 1} of {STEPS}</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ backgroundColor: BORDER }}>
        <div className="h-1.5 rounded-full transition-all duration-200" style={{ width: `${(step / STEPS) * 100}%`, backgroundColor: NAVY }} />
      </div>
    </div>
  );
}

function Q({ title, sub, headingRef }: { title: string; sub?: string; headingRef: React.RefObject<HTMLHeadingElement | null> }) {
  return (
    <div className="mb-6">
      <h1 ref={headingRef} tabIndex={-1} className="text-2xl sm:text-3xl font-bold mb-2 outline-none leading-tight" style={heading}>{title}</h1>
      {sub && <p className="text-base" style={{ color: "#333" }}>{sub}</p>}
    </div>
  );
}

function Choice({ children, selected, onClick }: { children: React.ReactNode; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={selected} onClick={onClick}
      className="w-full min-h-[56px] px-5 py-4 text-left text-base font-semibold bg-white border-2 rounded-xl transition-colors duration-150 flex items-center justify-between"
      style={{ borderColor: selected ? NAVY : BORDER, color: NAVY }}>
      <span>{children}</span>
      {selected && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>}
    </button>
  );
}

function Next({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="w-full mt-6 px-8 py-4 text-sm font-semibold uppercase tracking-widest rounded transition-opacity hover:opacity-80"
      style={{ backgroundColor: BURGUNDY, color: "#FAF8F5" }}>
      Continue
    </button>
  );
}

function Text({ id, label, value, onChange, error, ...rest }: {
  id: string; label: string; value: string; onChange: (v: string) => void; error?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "id">) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold mb-2" style={{ color: NAVY }}>{label}</label>
      <input id={id} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined}
        className="w-full px-4 py-4 border rounded-lg text-base" style={{ backgroundColor: "#F7F5F2", borderColor: error ? BURGUNDY : BORDER, color: "#222" }} {...rest} />
      {error && <Err id={`${id}-err`}>{error}</Err>}
    </div>
  );
}

function Err({ children, id }: { children: React.ReactNode; id?: string }) {
  return <p id={id} role="alert" className="text-sm mt-2" style={{ color: BURGUNDY }}>{children}</p>;
}
