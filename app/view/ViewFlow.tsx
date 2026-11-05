"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CONSENT_TEXT, QUESTIONS, visibleQuestions, torontoToday, type Answers, type PublicHome, type Question,
} from "@/lib/viewing-requests";

const NAVY = "#1F2F3A";
const BURGUNDY = "#8B2030";
const BORDER = "#D8D2C8";
const MUTED = "#666666";
const heading = { fontFamily: "var(--font-cormorant)", color: NAVY };
const DRAFT_KEY = "prospera-view-draft-v2";

// Sections shown in the progress bar, so people can always see what's left.
const SECTIONS = [
  { key: "home", label: "Home" },
  { key: "move", label: "Your move" },
  { key: "work", label: "Work" },
  { key: "money", label: "Money" },
  { key: "you", label: "About you" },
  { key: "contact", label: "Contact" },
] as const;
type SectionKey = (typeof SECTIONS)[number]["key"];

interface Draft {
  screen: string;
  home: string;
  moveIn: string;
  occupants: number | null;
  manyPeople: string;
  answers: Answers;
  name: string;
  phone: string;
  email: string;
  consent: boolean;
  key: string;
  savedAt: number;
}

const blank = (): Draft => ({
  screen: "home", home: "", moveIn: "", occupants: null, manyPeople: "", answers: {},
  name: "", phone: "", email: "", consent: false, key: crypto.randomUUID(), savedAt: Date.now(),
});

/** The screens this person will see, in order. Changes as their answers reveal or hide questions. */
function pathFor(answers: Answers): string[] {
  return ["home", "move_in", "occupants", ...visibleQuestions(answers).map((q) => q.id), "contact"];
}
function sectionOf(screen: string): SectionKey {
  if (screen === "home" || screen === "contact") return screen;
  if (screen === "move_in" || screen === "occupants") return "move";
  return QUESTIONS.find((q) => q.id === screen)?.section ?? "move";
}

function fmtDate(d: string | null) {
  if (!d) return null;
  return new Date(`${d}T12:00:00`).toLocaleDateString("en-CA", { month: "long", day: "numeric" });
}
function defaultMoveIn(h: PublicHome | undefined) {
  const today = torontoToday();
  return h?.available_date && h.available_date > today ? h.available_date : today;
}

export default function ViewFlow({ homes, preselect }: { homes: PublicHome[]; preselect: string | null }) {
  const [d, setD] = useState<Draft | null>(null);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [done, setDone] = useState<{ ref: string; first: string; address: string } | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Restore a same-tab draft (under 24h old), else start fresh. A ?home= link starts on the move-in date.
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
      draft = { ...draft, home: preselect, moveIn: "", screen: "move_in" };
    }
    if (draft.home && !draft.moveIn) draft.moveIn = defaultMoveIn(homes.find((h) => h.id === draft!.home));
    const t = setTimeout(() => setD(draft), 0);
    return () => clearTimeout(t);
  }, [homes, preselect]);

  useEffect(() => {
    if (!d) return;
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...d, savedAt: Date.now() })); } catch {}
  }, [d]);

  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, [d?.screen, done]);

  if (!d) return <Shell><div className="h-64" /></Shell>;

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

  const home = homes.find((h) => h.id === d.home) ?? null;
  const path = pathFor(d.answers);
  const screen = path.includes(d.screen) ? d.screen : path[0];
  const idx = path.indexOf(screen);
  const question = QUESTIONS.find((q) => q.id === screen) ?? null;

  const update = (patch: Partial<Draft>) => setD((prev) => (prev ? { ...prev, ...patch } : prev));
  const goTo = (s: string) => { setErrors({}); setFormError(""); update({ screen: s }); window.scrollTo({ top: 0 }); };
  // Move forward along the path as it will be after this answer.
  const next = (answers: Answers = d.answers) => {
    const p = pathFor(answers);
    goTo(p[p.indexOf(screen) + 1] ?? "contact");
  };
  const answer = (id: string, value: string, advance = true) => {
    const answers = { ...d.answers, [id]: value };
    update({ answers });
    if (advance) next(answers);
  };

  async function send() {
    if (!d) return;
    const errs: Record<string, string> = {};
    if (!d.name.trim()) errs.name = "Enter your name.";
    if (d.phone.replace(/\D/g, "").length < 10) errs.phone = "Enter a phone number we can call.";
    if (d.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) errs.email = "Check your email address.";
    if (!d.consent) errs.consent = "Tick the box to send your request.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    // Only send answers to questions that were actually shown.
    const shown = new Set(visibleQuestions(d.answers).map((q) => q.id));
    const answers = Object.fromEntries(Object.entries(d.answers).filter(([k]) => shown.has(k)));

    setSending(true); setFormError("");
    const payload = { key: d.key, home: d.home, moveIn: d.moveIn, occupants: d.occupants, answers, name: d.name, phone: d.phone, email: d.email, consent: d.consent };
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch("/api/view", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const out = await res.json().catch(() => ({}));
        if (res.ok) {
          try { sessionStorage.removeItem(DRAFT_KEY); } catch {}
          setDone({ ref: out.ref, first: d.name.trim().split(/\s+/)[0], address: home?.address ?? "the home" });
          setSending(false);
          return;
        }
        if (res.status === 422) {
          const first = Object.keys(out.errors ?? {}).find((k) => path.includes(k));
          if (first && first !== "contact") { goTo(first); setErrors(out.errors); }
          else { setErrors(out.errors ?? {}); setFormError("Check the answers marked below."); }
        } else setFormError(out.error ?? "We couldn't send your request. Try again.");
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
      <Progress current={sectionOf(screen)} fraction={idx / path.length} onBack={idx > 0 ? () => goTo(path[idx - 1]) : undefined} />

      {home && screen !== "home" && (
        <div className="flex items-center gap-3 rounded-xl border p-3 mb-7 bg-white" style={{ borderColor: BORDER }}>
          {home.image && <Image src={home.image} alt="" width={56} height={56} className="w-14 h-14 rounded-lg object-cover shrink-0" />}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold truncate" style={{ color: NAVY }}>{home.address}</div>
            <div className="text-sm" style={{ color: MUTED }}>${home.price.toLocaleString()}/mo{home.utilities_included ? " · utilities included" : ""}</div>
          </div>
          {homes.length > 1 && <button type="button" onClick={() => goTo("home")} className="text-sm font-medium underline shrink-0" style={{ color: NAVY }}>Change</button>}
        </div>
      )}

      <div key={screen} className="view-step">
        {screen === "home" && (
          <>
            <Q headingRef={headingRef} title="Which home would you like to see?" />
            <div className="rounded-xl border bg-white px-4 py-3 mb-6 text-sm" style={{ borderColor: BORDER, color: "#333" }}>
              <p className="font-semibold mb-1" style={{ color: NAVY }}>What we&apos;ll ask</p>
              <p>Your move, your work, your income and credit range, and a few household basics. Most answers are one tap. No documents, no payment, and no credit check today.</p>
            </div>
            <div className="grid gap-4">
              {homes.map((h) => {
                const selected = d.home === h.id;
                return (
                  <button key={h.id} type="button" aria-pressed={selected}
                    onClick={() => { update({ home: h.id, moveIn: d.home === h.id && d.moveIn ? d.moveIn : defaultMoveIn(h) }); goTo("move_in"); }}
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
                        {h.available_date && h.available_date > torontoToday() ? ` · available ${fmtDate(h.available_date)}` : " · available now"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {screen === "move_in" && home && (
          <>
            <Q headingRef={headingRef} title="When would you like to move in?" sub={home.available_date && home.available_date > torontoToday() ? `This home is available from ${fmtDate(home.available_date)}.` : "This home is available now."} />
            <label className="block text-sm font-semibold mb-2" style={{ color: NAVY }} htmlFor="movein">Move-in date</label>
            <input id="movein" type="date" min={torontoToday()} value={d.moveIn} onChange={(e) => update({ moveIn: e.target.value })}
              className="w-full px-4 py-4 border rounded-lg text-base" style={{ backgroundColor: "#F7F5F2", borderColor: BORDER, color: "#222" }} />
            {errors.moveIn && <Err>{errors.moveIn}</Err>}
            <Next onClick={() => (d.moveIn && d.moveIn >= torontoToday() ? next() : setErrors({ moveIn: "Pick a date from today on." }))} />
          </>
        )}

        {screen === "occupants" && (
          <>
            <Q headingRef={headingRef} title="How many people will live there?" sub="Everyone, including you." />
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <Choice key={n} selected={d.occupants === n && !d.manyPeople} onClick={() => { update({ occupants: n, manyPeople: "" }); next(); }}>{n}</Choice>
              ))}
              <Choice selected={!!d.manyPeople} onClick={() => update({ manyPeople: d.manyPeople || "6", occupants: Number(d.manyPeople || 6) })}>6+</Choice>
            </div>
            {!!d.manyPeople && (
              <>
                <label className="block text-sm font-semibold mt-5 mb-2" style={{ color: NAVY }} htmlFor="many">Total people</label>
                <input id="many" type="number" inputMode="numeric" min={6} max={99} value={d.manyPeople}
                  onChange={(e) => update({ manyPeople: e.target.value, occupants: Number(e.target.value) || null })}
                  className="w-full px-4 py-4 border rounded-lg text-base" style={{ backgroundColor: "#F7F5F2", borderColor: BORDER }} />
                {errors.occupants && <Err>{errors.occupants}</Err>}
                <Next onClick={() => (d.occupants && d.occupants >= 1 && d.occupants <= 99 ? next() : setErrors({ occupants: "Enter a number." }))} />
              </>
            )}
          </>
        )}

        {question && <QuestionScreen q={question} value={d.answers[question.id] ?? ""} error={errors[question.id]} headingRef={headingRef}
          onChoice={(v) => answer(question.id, v)}
          onText={(v) => answer(question.id, v, false)}
          onContinue={() => {
            const v = (d.answers[question.id] ?? "").trim();
            if (!v && !question.optional) { setErrors({ [question.id]: "Answer this to continue." }); return; }
            next();
          }} />}

        {screen === "contact" && (
          <>
            <Q headingRef={headingRef} title="Last step. How do we reach you?" sub="We'll call or text to set up a viewing time." />
            {formError && <div role="alert" className="rounded-lg border px-4 py-3 mb-5 text-sm bg-white" style={{ borderColor: BURGUNDY, color: BURGUNDY }}>{formError}</div>}
            <div className="grid gap-5">
              <Text id="name" label="Your name" autoComplete="name" value={d.name} onChange={(v) => update({ name: v })} error={errors.name} />
              <Text id="phone" label="Phone number" type="tel" inputMode="tel" autoComplete="tel" value={d.phone} onChange={(v) => update({ phone: v })} error={errors.phone} />
              <Text id="email" label="Email (optional)" type="email" inputMode="email" autoComplete="email" value={d.email} onChange={(v) => update({ email: v })} error={errors.email} />
            </div>

            <label className="flex gap-3 items-start mt-7 cursor-pointer">
              <input type="checkbox" checked={d.consent} onChange={(e) => update({ consent: e.target.checked })} className="mt-1 w-5 h-5 shrink-0" style={{ accentColor: NAVY }} />
              <span className="text-sm" style={{ color: "#333" }}>
                {CONSENT_TEXT} <Link href="/privacy" target="_blank" className="underline" style={{ color: NAVY }}>Privacy policy</Link>
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

      <p className="text-sm mt-10" style={{ color: MUTED }}>Your answers stay in this browser tab until you send them. Need help? Call or text (519) 697-1227.</p>
    </Shell>
  );
}

function QuestionScreen({ q, value, error, headingRef, onChoice, onText, onContinue }: {
  q: Question; value: string; error?: string; headingRef: React.RefObject<HTMLHeadingElement | null>;
  onChoice: (v: string) => void; onText: (v: string) => void; onContinue: () => void;
}) {
  return (
    <>
      <Q headingRef={headingRef} title={q.title} sub={q.sub} />
      {q.type === "choice" ? (
        <div className="grid gap-3">
          {q.options!.map((o) => <Choice key={o.value} selected={value === o.value} onClick={() => onChoice(o.value)}>{o.label}</Choice>)}
        </div>
      ) : (
        <>
          <input id={q.id} aria-label={q.title} value={value} maxLength={300} placeholder={q.placeholder} onChange={(e) => onText(e.target.value)}
            className="w-full px-4 py-4 border rounded-lg text-base" style={{ backgroundColor: "#F7F5F2", borderColor: error ? BURGUNDY : BORDER, color: "#222" }} />
          <Next onClick={onContinue} label={q.optional && !value.trim() ? "Skip" : "Continue"} />
        </>
      )}
      {error && <Err>{error}</Err>}
    </>
  );
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

function Progress({ current, fraction, onBack }: { current: SectionKey; fraction: number; onBack?: () => void }) {
  const at = SECTIONS.findIndex((s) => s.key === current);
  return (
    <div className="mb-7">
      <div className="flex items-center justify-between mb-2 text-sm" style={{ color: MUTED }}>
        {onBack ? <button type="button" onClick={onBack} className="font-medium py-2 pr-3" style={{ color: NAVY }}>← Back</button> : <span />}
        <span aria-live="polite">{SECTIONS[at].label} · part {at + 1} of {SECTIONS.length}</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ backgroundColor: BORDER }}>
        <div className="h-1.5 rounded-full transition-all duration-200" style={{ width: `${Math.round(fraction * 100)}%`, backgroundColor: NAVY }} />
      </div>
      <div className="flex justify-between mt-2 text-xs" style={{ color: MUTED }} aria-hidden="true">
        {SECTIONS.map((s, i) => (
          <span key={s.key} style={{ color: i === at ? NAVY : i < at ? "#333" : "#999999", fontWeight: i === at ? 600 : 400 }}>{s.label}</span>
        ))}
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

function Next({ onClick, label = "Continue" }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick}
      className="w-full mt-6 px-8 py-4 text-sm font-semibold uppercase tracking-widest rounded transition-opacity hover:opacity-80"
      style={{ backgroundColor: BURGUNDY, color: "#FAF8F5" }}>
      {label}
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
