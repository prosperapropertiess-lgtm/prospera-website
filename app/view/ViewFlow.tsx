"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CONSENT_TEXT, visibleQuestions, torontoToday, type Answers, type PublicHome, type Question } from "@/lib/viewing-requests";

const NAVY = "#1F2F3A";
const BURGUNDY = "#8B2030";
const BORDER = "#D8D2C8";
const MUTED = "#666666";
const heading = { fontFamily: "var(--font-cormorant)", color: NAVY };
const DRAFT_KEY = "prospera-view-draft-v3";

// One screen per section. Follow-up questions appear on the same screen, under the answer that triggers them.
const SCREENS = [
  { key: "home", label: "The home", title: "Which home would you like to see?" },
  { key: "move", label: "Your move", title: "Your move" },
  { key: "current", label: "Where you live now", title: "Where you live now" },
  { key: "work", label: "Work", title: "Your work" },
  { key: "money", label: "Money", title: "Money" },
  { key: "you", label: "A few basics", title: "A few basics" },
  { key: "contact", label: "How to reach you", title: "Last step. How do we reach you?" },
] as const;
type ScreenKey = (typeof SCREENS)[number]["key"];

interface Draft {
  screen: ScreenKey;
  home: string;
  moveIn: string;
  occupants: number | null;
  manyPeople: string;
  answers: Answers;
  name: string;
  phone: string;
  email: string;
  consent: boolean;
  rentMatch: boolean;
  key: string;
  startedAt: number;
  savedAt: number;
}

const blank = (): Draft => ({
  screen: "home", home: "", moveIn: "", occupants: null, manyPeople: "", answers: {},
  name: "", phone: "", email: "", consent: false, rentMatch: false, key: crypto.randomUUID(), startedAt: Date.now(), savedAt: Date.now(),
});

const questionsOn = (screen: ScreenKey, a: Answers) => visibleQuestions(a).filter((q) => q.section === screen);

const secondsSince = (start: number) => Math.round((Date.now() - start) / 1000);

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

  // Restore a same-tab draft (under 24h old), else start fresh. A link with a home starts on "Your move".
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
      draft = { ...draft, home: preselect, moveIn: "", screen: "move" };
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
  const idx = SCREENS.findIndex((s) => s.key === d.screen);
  const screen = SCREENS[idx];

  const update = (patch: Partial<Draft>) => setD((prev) => (prev ? { ...prev, ...patch } : prev));
  const goTo = (s: ScreenKey) => { setErrors({}); setFormError(""); update({ screen: s }); window.scrollTo({ top: 0 }); };
  const setAnswer = (id: string, value: string) => setD((prev) => (prev ? { ...prev, answers: { ...prev.answers, [id]: value } } : prev));

  /** Errors for unanswered required questions on a screen. */
  function missingOn(key: ScreenKey): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!d) return errs;
    if (key === "move") {
      if (!d.moveIn || d.moveIn < torontoToday()) errs.moveIn = "Pick a date from today on.";
      if (!d.occupants || d.occupants < 1 || d.occupants > 99) errs.occupants = "How many people will live there?";
    }
    for (const q of questionsOn(key, d.answers)) {
      if (!q.optional && !(d.answers[q.id] ?? "").trim()) errs[q.id] = q.type === "text" ? "Fill this in to continue." : "Pick an answer.";
    }
    return errs;
  }

  function continueFrom(key: ScreenKey) {
    const errs = missingOn(key);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(`q-${Object.keys(errs)[0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    goTo(SCREENS[SCREENS.findIndex((s) => s.key === key) + 1].key);
  }

  async function send() {
    if (!d) return;
    const errs = missingOn("contact");
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
    const payload = {
      key: d.key, home: d.home, moveIn: d.moveIn, occupants: d.occupants, answers, name: d.name, phone: d.phone, email: d.email,
      consent: d.consent, rentMatch: d.rentMatch, seconds: secondsSince(d.startedAt),
    };
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
          setErrors(out.errors ?? {});
          setFormError("Some answers need another look. Use Back to check them.");
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

  const questionBlocks = (key: ScreenKey) =>
    questionsOn(key, d.answers).map((q) => (
      <QuestionBlock key={q.id} q={q} value={d.answers[q.id] ?? ""} error={errors[q.id]} onChange={(v) => setAnswer(q.id, v)} />
    ));

  return (
    <Shell>
      <Progress index={idx} onBack={idx > 0 ? () => goTo(SCREENS[idx - 1].key) : undefined} />

      {home && screen.key !== "home" && (
        <div className="flex items-center gap-3 rounded-xl border p-3 mb-6 bg-white" style={{ borderColor: BORDER }}>
          {home.image && <Image src={home.image} alt="" width={56} height={56} className="w-14 h-14 rounded-lg object-cover shrink-0" />}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold truncate" style={{ color: NAVY }}>{home.address}</div>
            <div className="text-sm" style={{ color: MUTED }}>${home.price.toLocaleString()}/mo{home.utilities_included ? " · utilities included" : ""}</div>
          </div>
          {homes.length > 1 && <button type="button" onClick={() => goTo("home")} className="text-sm font-medium underline shrink-0" style={{ color: NAVY }}>Change</button>}
        </div>
      )}

      <div key={screen.key} className="view-step">
        <h1 ref={headingRef} tabIndex={-1} className="text-2xl sm:text-3xl font-bold mb-5 outline-none leading-tight" style={heading}>{screen.title}</h1>

        {screen.key === "home" && (
          <>
            <div className="rounded-xl border bg-white px-4 py-3 mb-6 text-sm" style={{ borderColor: BORDER, color: "#333" }}>
              <p className="font-semibold mb-1" style={{ color: NAVY }}>Takes about a minute. Saves you a lot of back-and-forth messages.</p>
              <p>7 short screens: the home, your move, where you live now, work, money, a few basics, and how to reach you. No documents, no payment, and no credit check today.</p>
            </div>
            <div className="grid gap-4">
              {homes.map((h) => {
                const selected = d.home === h.id;
                return (
                  <button key={h.id} type="button" aria-pressed={selected}
                    onClick={() => { update({ home: h.id, moveIn: d.home === h.id && d.moveIn ? d.moveIn : defaultMoveIn(h) }); goTo("move"); }}
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

        {screen.key === "move" && home && (
          <div className="grid gap-8">
            <div id="q-moveIn">
              <label className="block text-lg font-semibold mb-1" style={{ color: NAVY }} htmlFor="movein">When would you like to move in?</label>
              <p className="text-sm mb-3" style={{ color: MUTED }}>
                {home.available_date && home.available_date > torontoToday() ? `This home is available from ${fmtDate(home.available_date)}.` : "This home is available now."}
              </p>
              <input id="movein" type="date" min={torontoToday()} value={d.moveIn} onChange={(e) => update({ moveIn: e.target.value })}
                className="w-full px-4 py-4 border rounded-lg text-base bg-white" style={{ borderColor: errors.moveIn ? BURGUNDY : BORDER, color: "#222" }} />
              {errors.moveIn && <Err>{errors.moveIn}</Err>}
            </div>
            <div id="q-occupants">
              <p className="text-lg font-semibold mb-1" style={{ color: NAVY }}>How many people will live there?</p>
              <p className="text-sm mb-3" style={{ color: MUTED }}>Everyone, including you.</p>
              <div className="grid grid-cols-6 gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Choice key={n} compact selected={d.occupants === n && !d.manyPeople} onClick={() => update({ occupants: n, manyPeople: "" })}>{n}</Choice>
                ))}
                <Choice compact selected={!!d.manyPeople} onClick={() => update({ manyPeople: d.manyPeople || "6", occupants: Number(d.manyPeople || 6) })}>6+</Choice>
              </div>
              {!!d.manyPeople && (
                <input aria-label="Total people" type="number" inputMode="numeric" min={6} max={99} value={d.manyPeople}
                  onChange={(e) => update({ manyPeople: e.target.value, occupants: Number(e.target.value) || null })}
                  className="w-full mt-3 px-4 py-3 border rounded-lg text-base bg-white" style={{ borderColor: BORDER }} />
              )}
              {errors.occupants && <Err>{errors.occupants}</Err>}
            </div>
            <Next onClick={() => continueFrom("move")} />
          </div>
        )}

        {(screen.key === "current" || screen.key === "work" || screen.key === "money" || screen.key === "you") && (
          <div className="grid gap-8">
            {questionBlocks(screen.key)}
            <Next onClick={() => continueFrom(screen.key)} />
          </div>
        )}

        {screen.key === "contact" && (
          <div className="grid gap-6">
            {formError && <div role="alert" className="rounded-lg border px-4 py-3 text-sm bg-white" style={{ borderColor: BURGUNDY, color: BURGUNDY }}>{formError}</div>}
            {questionBlocks("contact")}
            <Text id="name" label="Your name" autoComplete="name" value={d.name} onChange={(v) => update({ name: v })} error={errors.name} />
            <Text id="phone" label="Phone number" type="tel" inputMode="tel" autoComplete="tel" value={d.phone} onChange={(v) => update({ phone: v })} error={errors.phone} />
            <Text id="email" label="Email (optional)" type="email" inputMode="email" autoComplete="email" value={d.email} onChange={(v) => update({ email: v })} error={errors.email} />

            <div>
              <label className="flex gap-3 items-start cursor-pointer">
                <input type="checkbox" checked={d.consent} onChange={(e) => update({ consent: e.target.checked })} className="mt-1 w-5 h-5 shrink-0" style={{ accentColor: NAVY }} />
                <span className="text-sm" style={{ color: "#333" }}>
                  {CONSENT_TEXT} <Link href="/privacy" target="_blank" className="underline" style={{ color: NAVY }}>Privacy policy</Link>
                </span>
              </label>
              {errors.consent && <Err>{errors.consent}</Err>}
            </div>

            <label className="flex gap-3 items-start cursor-pointer rounded-xl border bg-white p-4" style={{ borderColor: BORDER }}>
              <input type="checkbox" checked={d.rentMatch} onChange={(e) => update({ rentMatch: e.target.checked })} className="mt-1 w-5 h-5 shrink-0" style={{ accentColor: NAVY }} />
              <span className="text-sm" style={{ color: "#333" }}>
                <span className="font-semibold block mb-1" style={{ color: NAVY }}>Optional: add me to RentMatch</span>
                If this home doesn&apos;t work out, we&apos;ll use your answers to send you other rentals that might fit. You can ask us to remove you any time.
              </span>
            </label>

            <div>
              <button type="button" onClick={send} disabled={sending}
                className="w-full px-8 py-4 text-sm font-semibold uppercase tracking-widest rounded transition-opacity hover:opacity-80 disabled:opacity-60"
                style={{ backgroundColor: BURGUNDY, color: "#FAF8F5" }}>
                {sending ? "Sending…" : "Send viewing request"}
              </button>
              <p className="text-sm text-center mt-3" style={{ color: MUTED }}>This is a request. We&apos;ll confirm a viewing time with you.</p>
            </div>
          </div>
        )}
      </div>

      <p className="text-sm mt-10" style={{ color: MUTED }}>Your answers stay in this browser tab until you send them. Need help? Call or text (519) 697-1227.</p>
    </Shell>
  );
}

/** One question on a screen. Follow-ups (questions with a showIf) are indented under their trigger. */
function QuestionBlock({ q, value, error, onChange }: { q: Question; value: string; error?: string; onChange: (v: string) => void }) {
  const followUp = !!q.showIf;
  const short = q.options?.every((o) => o.label.length <= 12) ?? false;
  const picked = q.type === "multi" ? value.split(",").filter(Boolean) : [];
  return (
    <div id={`q-${q.id}`} className={followUp ? "pl-4 border-l-2 view-step" : ""} style={followUp ? { borderColor: BORDER } : undefined}>
      <p className="text-lg font-semibold mb-1 leading-snug" style={{ color: NAVY }}>{q.title}</p>
      {q.sub && <p className="text-sm mb-3" style={{ color: MUTED }}>{q.sub}</p>}
      {!q.sub && <div className="mb-3" />}
      {q.type === "text" ? (
        <input aria-label={q.title} value={value} maxLength={300} placeholder={q.placeholder} onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg text-base bg-white" style={{ borderColor: error ? BURGUNDY : BORDER, color: "#222" }} />
      ) : (
        <div className={short ? "grid grid-cols-2 sm:grid-cols-4 gap-2" : "grid gap-2"}>
          {q.options!.map((o) => {
            const selected = q.type === "multi" ? picked.includes(o.value) : value === o.value;
            return (
              <Choice key={o.value} compact selected={selected} onClick={() => {
                if (q.type === "multi") onChange((selected ? picked.filter((x) => x !== o.value) : [...picked, o.value]).join(","));
                else onChange(o.value);
              }}>{o.label}</Choice>
            );
          })}
        </div>
      )}
      {error && <Err>{error}</Err>}
    </div>
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

function Progress({ index, onBack }: { index: number; onBack?: () => void }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2 text-sm" style={{ color: MUTED }}>
        {onBack ? <button type="button" onClick={onBack} className="font-medium py-2 pr-3" style={{ color: NAVY }}>← Back</button> : <span />}
        <span aria-live="polite">Step {index + 1} of {SCREENS.length} · {SCREENS[index].label}</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ backgroundColor: BORDER }}>
        <div className="h-1.5 rounded-full transition-all duration-200" style={{ width: `${Math.round((index / SCREENS.length) * 100)}%`, backgroundColor: NAVY }} />
      </div>
    </div>
  );
}

function Choice({ children, selected, onClick, compact }: { children: React.ReactNode; selected: boolean; onClick: () => void; compact?: boolean }) {
  return (
    <button type="button" aria-pressed={selected} onClick={onClick}
      className={`w-full ${compact ? "min-h-[48px] px-3 py-3 text-[15px]" : "min-h-[56px] px-5 py-4 text-base"} text-left font-semibold border-2 rounded-xl transition-colors duration-150 flex items-center justify-between gap-2`}
      style={{ borderColor: selected ? NAVY : BORDER, color: selected ? "#FAF8F5" : NAVY, backgroundColor: selected ? NAVY : "#FFFFFF" }}>
      <span>{children}</span>
      {selected && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FAF8F5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0"><path d="M5 12l5 5L20 7" /></svg>}
    </button>
  );
}

function Next({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="w-full px-8 py-4 text-sm font-semibold uppercase tracking-widest rounded transition-opacity hover:opacity-80"
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
        className="w-full px-4 py-4 border rounded-lg text-base bg-white" style={{ borderColor: error ? BURGUNDY : BORDER, color: "#222" }} {...rest} />
      {error && <Err id={`${id}-err`}>{error}</Err>}
    </div>
  );
}

function Err({ children, id }: { children: React.ReactNode; id?: string }) {
  return <p id={id} role="alert" className="text-sm mt-2" style={{ color: BURGUNDY }}>{children}</p>;
}
