"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AREAS, RENT_RANGES, RENT_BASIS, RENT_FLEXIBILITY, MAINTENANCE_LEVELS, CONDITIONS,
  PROPERTY_TYPES, OCCUPANCY, SERVICES, INVOLVEMENT, TIMELINES, cityFromArea,
} from "@/lib/fit-form";

const BG = "#F7F5F2";
const SURFACE = "#FFFFFF";
const BORDER = "#D8D2C8";
const TEXT = "#222222";
const MUTED = "#666666";
const NAVY = "#1F2F3A";
const ACCENT = "#8B2030";

interface Answers {
  name: string; email: string; phone: string; numProps: string;
  area: string; share: "" | "yes" | "no"; address: string;
  propType: string; beds: number; baths: number; occupancy: string;
  condition: string; maintenance: string; notes: string;
  rentRange: string; rentBasis: string; rentFlex: string;
  service: string; involvement: string; timeline: string;
}

const BLANK: Answers = {
  name: "", email: "", phone: "", numProps: "", area: "", share: "", address: "",
  propType: "", beds: 2, baths: 1, occupancy: "", condition: "", maintenance: "", notes: "",
  rentRange: "", rentBasis: "", rentFlex: "", service: "", involvement: "", timeline: "",
};

const AREA_HINTS: Record<string, string> = {
  "London: North": "Masonville, Medway, Stoneybrook",
  "London: East": "Argyle, Hamilton Rd, Old East",
  "London: South": "Wortley, Southcrest, White Oaks",
  "London: West": "Byron, Oakridge, Westmount",
  "London: Downtown / Old East": "The core, Wortley, SoHo",
};
const CONDITION_HINTS: Record<string, string> = {
  "Excellent": "Could list it tomorrow",
  "Good": "Clean, minor touch-ups at most",
  "Needs some work": "Paint, flooring or small repairs first",
  "Needs major repairs": "Real work before anyone moves in",
};
const MAINT_ICONS = ["auto_awesome", "verified", "handyman", "warning"];
const FLEX_ICONS = ["lock", "tune", "bolt", "forum"];
const CONDITION_ICONS = ["star", "thumb_up", "construction", "build"];

const spring = { type: "spring" as const, stiffness: 380, damping: 30 };

function Icon({ name, size = 22, color }: { name: string; size?: number; color?: string }) {
  return <span className="material-symbols-outlined" style={{ fontSize: size, color }}>{name}</span>;
}

function Question({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <h2 style={{ fontFamily: "var(--font-cormorant)", fontSize: 32, lineHeight: 1.15, fontWeight: 700, color: NAVY, margin: 0 }}>{title}</h2>
      {sub && <p style={{ fontSize: 16, color: MUTED, margin: "8px 0 0", lineHeight: 1.5 }}>{sub}</p>}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 14, fontWeight: 600, color: TEXT, margin: "0 0 10px" }}>{children}</p>;
}

function Choice({
  selected, onClick, title, hint, icon,
}: { selected: boolean; onClick: () => void; title: string; hint?: string; icon?: string }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={spring}
      className="w-full text-left flex items-center gap-4"
      style={{
        padding: "16px 18px", borderRadius: 16, cursor: "pointer",
        backgroundColor: selected ? NAVY : SURFACE,
        border: `1.5px solid ${selected ? NAVY : BORDER}`,
        boxShadow: selected ? "0 8px 22px rgba(31,47,58,0.22)" : "0 1px 3px rgba(0,0,0,0.04)",
        transition: "background-color .2s, border-color .2s, box-shadow .2s",
      }}
    >
      {icon && (
        <span style={{
          width: 42, height: 42, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          backgroundColor: selected ? "rgba(250,248,245,0.12)" : "#F0EDE8",
        }}>
          <Icon name={icon} color={selected ? "#FAF8F5" : NAVY} />
        </span>
      )}
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 16, fontWeight: 600, color: selected ? "#FAF8F5" : TEXT }}>{title}</span>
        {hint && <span style={{ display: "block", fontSize: 13.5, marginTop: 2, color: selected ? "rgba(250,248,245,0.7)" : MUTED }}>{hint}</span>}
      </span>
      <AnimatePresence>
        {selected && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={spring}>
            <Icon name="check_circle" color="#FAF8F5" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function Pill({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      type="button" onClick={onClick} whileTap={{ scale: 0.95 }} transition={spring}
      style={{
        padding: "12px 18px", borderRadius: 999, fontSize: 15, fontWeight: 600, cursor: "pointer",
        backgroundColor: selected ? NAVY : SURFACE, color: selected ? "#FAF8F5" : MUTED,
        border: `1.5px solid ${selected ? NAVY : BORDER}`, transition: "background-color .2s, color .2s, border-color .2s",
      }}
    >{children}</motion.button>
  );
}

function Stepper({ label, value, onChange, min, max, step = 1 }: { label: string; value: number; onChange: (n: number) => void; min: number; max: number; step?: number }) {
  const btn = (disabled: boolean): React.CSSProperties => ({
    width: 44, height: 44, borderRadius: "50%", border: `1.5px solid ${BORDER}`, backgroundColor: SURFACE,
    display: "flex", alignItems: "center", justifyContent: "center", opacity: disabled ? 0.35 : 1, cursor: disabled ? "default" : "pointer",
  });
  return (
    <div style={{ flex: 1, backgroundColor: SURFACE, border: `1.5px solid ${BORDER}`, borderRadius: 16, padding: "14px 16px" }}>
      <p style={{ fontSize: 13, color: MUTED, margin: "0 0 8px", fontWeight: 600 }}>{label}</p>
      <div className="flex items-center justify-between">
        <motion.button type="button" whileTap={{ scale: 0.88 }} style={btn(value <= min)} onClick={() => value > min && onChange(value - step)} aria-label={`Fewer ${label}`}><Icon name="remove" size={20} color={NAVY} /></motion.button>
        <AnimatePresence mode="popLayout">
          <motion.span key={value} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.15 }}
            style={{ fontSize: 28, fontWeight: 700, color: NAVY, minWidth: 40, textAlign: "center" }}>{value}</motion.span>
        </AnimatePresence>
        <motion.button type="button" whileTap={{ scale: 0.88 }} style={btn(value >= max)} onClick={() => value < max && onChange(value + step)} aria-label={`More ${label}`}><Icon name="add" size={20} color={NAVY} /></motion.button>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "16px 18px", borderRadius: 14, fontSize: 17, outline: "none",
  border: `1.5px solid ${BORDER}`, backgroundColor: SURFACE, color: TEXT, transition: "border-color .2s, box-shadow .2s",
};
function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <div style={{ marginBottom: 18 }}>
      <Label>{label}</Label>
      <input {...rest} style={inputStyle}
        onFocus={(e) => { e.target.style.borderColor = NAVY; e.target.style.boxShadow = "0 0 0 4px rgba(31,47,58,0.08)"; }}
        onBlur={(e) => { e.target.style.borderColor = BORDER; e.target.style.boxShadow = "none"; }} />
    </div>
  );
}

function AnimatedCheck() {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" fill="none">
      <motion.circle cx="48" cy="48" r="44" stroke={NAVY} strokeWidth="4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} />
      <motion.path d="M28 49l14 14 27-30" stroke={ACCENT} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, delay: 0.55, ease: "easeOut" }} />
    </svg>
  );
}

const DRAFT_KEY = "prospera_fit_draft_v1";

export default function FitForm({ token }: { token?: string }) {
  const [state, setState] = useState<"loading" | "form" | "done" | "missing">(token ? "loading" : "form");
  const [a, setA] = useState<Answers>(BLANK);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [website, setWebsite] = useState(""); // honeypot
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftKey = `${DRAFT_KEY}:${token ?? "open"}`;

  const set = <K extends keyof Answers>(k: K, v: Answers[K]) => setA((p) => ({ ...p, [k]: v }));

  // Load invite details (personalised link) and any saved draft
  useEffect(() => {
    let draft: Answers | null = null;
    try { const raw = localStorage.getItem(draftKey); if (raw) draft = JSON.parse(raw); } catch {}
    if (draft) setA({ ...BLANK, ...draft });
    if (!token) return;
    fetch(`/api/fit/${token}`)
      .then(async (r) => {
        if (!r.ok) return setState("missing");
        const d = await r.json();
        setA((p) => ({ ...p, name: p.name || d.name || "", phone: p.phone || d.phone || "" }));
        setState(d.submitted ? "done" : "form");
      })
      .catch(() => setState("missing"));
  }, [token, draftKey]);

  useEffect(() => {
    if (state !== "form") return;
    try { localStorage.setItem(draftKey, JSON.stringify(a)); } catch {}
  }, [a, state, draftKey]);

  const steps = useMemo(() => [
    { key: "you", valid: !!a.name.trim() && (!!token || /\S+@\S+\.\S+/.test(a.email)) },
    { key: "area", valid: !!a.area },
    { key: "address", valid: a.share === "no" || (a.share === "yes" && !!a.address.trim()) },
    { key: "property", valid: !!a.propType && !!a.occupancy },
    { key: "condition", valid: !!a.condition },
    { key: "care", valid: !!a.maintenance },
    { key: "rent", valid: !!a.rentRange && !!a.rentBasis },
    { key: "flex", valid: !!a.rentFlex },
    { key: "want", valid: true },
    { key: "review", valid: true },
  ], [a, token]);

  const last = steps.length - 1;
  const pct = Math.round(((step + (step === last ? 1 : 0)) / steps.length) * 100);
  const minsLeft = Math.max(1, Math.ceil(((last - step) * 20) / 60));

  function go(n: number) {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    setDir(n > step ? 1 : -1);
    setStep(Math.max(0, Math.min(last, n)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  // Single-choice screens move on by themselves, after a beat so the selection registers
  function pickAndAdvance<K extends keyof Answers>(k: K, v: Answers[K]) {
    set(k, v);
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => { setDir(1); setStep((s) => Math.min(last, s + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }, 380);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Enter" && !(e.target instanceof HTMLTextAreaElement) && steps[step].valid && step < last) { e.preventDefault(); go(step + 1); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, steps]);

  async function submit() {
    setSaving(true); setError("");
    const range = RENT_RANGES.find((r) => r.label === a.rentRange);
    try {
      const res = await fetch(token ? `/api/fit/${token}` : "/api/fit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landlord_name: a.name, landlord_email: a.email, website, landlord_phone: a.phone,
          num_properties_owned: a.numProps ? Number(a.numProps) : null,
          area: a.area, property_city: cityFromArea(a.area),
          address_disclosed: a.share === "yes", property_address: a.share === "yes" ? a.address : null,
          property_type: a.propType, bedrooms: a.beds, bathrooms: a.baths, occupancy_status: a.occupancy,
          property_condition: a.condition, maintenance_level: a.maintenance, condition_notes: a.notes,
          rent_expectation: a.rentRange, rent_basis: a.rentBasis, rent_flexibility: a.rentFlex,
          approx_monthly_rent: range?.mid ?? null,
          service_type: a.service === "Not sure yet" ? "" : a.service,
          involvement_level: a.involvement, timeline: a.timeline,
        }),
      });
      if (res.ok) { try { localStorage.removeItem(draftKey); } catch {} setState("done"); }
      else setError((await res.json().catch(() => ({}))).error ?? "Something went wrong, please try again.");
    } catch { setError("No connection. Please try again."); }
    setSaving(false);
  }

  if (state === "loading") return <div style={{ minHeight: "100vh", backgroundColor: BG }} />;

  if (state === "missing") {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <p style={{ color: MUTED, fontSize: 16, textAlign: "center" }}>This link isn&apos;t valid. Call Ebin at (519) 697-1227 and we&apos;ll sort it out.</p>
      </div>
    );
  }

  if (state === "done") {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 460, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}><AnimatedCheck /></div>
          <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: 36, fontWeight: 700, color: NAVY, margin: "0 0 12px" }}>Got it, thank you.</h1>
          <p style={{ fontSize: 17, color: MUTED, lineHeight: 1.7, margin: "0 0 28px" }}>
            Ebin will look over your details personally and email you the next steps.
          </p>
          <motion.ol initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.18, delayChildren: 0.9 } } }}
            style={{ listStyle: "none", margin: 0, textAlign: "left", backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 18, padding: "8px 20px" }}>
            {[["Ebin reviews your property", "Usually within one business day"], ["You get an email", "Either way, with clear next steps"], ["We take it from there", "Agreement, listing, tenant search"]].map(([t, s], i) => (
              <motion.li key={t} variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0 } }} className="flex gap-4 items-center" style={{ padding: "14px 0", borderBottom: i < 2 ? `1px solid ${BORDER}` : "none" }}>
                <span style={{ width: 30, height: 30, borderRadius: "50%", backgroundColor: "#F0EDE8", color: NAVY, fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                <span><span style={{ display: "block", fontWeight: 600, color: TEXT, fontSize: 15 }}>{t}</span><span style={{ fontSize: 13.5, color: MUTED }}>{s}</span></span>
              </motion.li>
            ))}
          </motion.ol>
        </motion.div>
      </div>
    );
  }

  const first = a.name.trim().split(" ")[0];
  const summary: [string, string][] = [
    ["Area", a.area], ["Address", a.share === "yes" ? a.address : "Not shared yet"],
    ["Property", `${a.propType}, ${a.beds} bd / ${a.baths} ba, ${a.occupancy.toLowerCase()}`],
    ["Condition", `${a.condition}. ${a.maintenance}`],
    ["Rent", `${a.rentRange} (${a.rentBasis.toLowerCase()}); ${a.rentFlex.toLowerCase()}`],
  ];

  const body: Record<string, React.ReactNode> = {
    you: (<>
      <Question title="Let's start with you" sub="About 3 minutes. No wrong answers, we just want to see if we're the right match." />
      <Input label="Your name" value={a.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" autoFocus />
      {!token && <Input label="Email" type="email" inputMode="email" value={a.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />}
      <Input label="Phone (optional)" inputMode="tel" value={a.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" />
      <Input label="How many rental properties do you own? (optional)" inputMode="numeric" value={a.numProps} onChange={(e) => set("numProps", e.target.value.replace(/\D/g, ""))} />
      <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={(e) => setWebsite(e.target.value)} style={{ position: "absolute", left: "-9999px", width: 0, height: 0, opacity: 0 }} />
    </>),
    area: (<>
      <Question title={first ? `${first}, where is the property?` : "Where is the property?"} sub="Pick the closest area. You don't need the exact address yet." />
      <div className="grid gap-3">{AREAS.map((x) => <Choice key={x} selected={a.area === x} onClick={() => pickAndAdvance("area", x)} title={x.replace("London: ", "")} hint={AREA_HINTS[x] ?? (x.startsWith("London") ? undefined : undefined)} icon={x.startsWith("London") ? "location_on" : "pin_drop"} />)}</div>
    </>),
    address: (<>
      <Question title="Share the exact address?" sub="Totally optional. We can start with the area." />
      <div className="grid gap-3">
        <Choice selected={a.share === "yes"} onClick={() => set("share", "yes")} title="Yes, I'll share it" icon="home_pin" />
        <Choice selected={a.share === "no"} onClick={() => pickAndAdvance("share", "no")} title="Not yet" hint="We'll ask again once we've talked" icon="visibility_off" />
      </div>
      <AnimatePresence>
        {a.share === "yes" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginTop: 18 }}>
            <Input label="Street address" value={a.address} onChange={(e) => set("address", e.target.value)} autoComplete="street-address" autoFocus />
          </motion.div>
        )}
      </AnimatePresence>
    </>),
    property: (<>
      <Question title="Tell us about the place" />
      <Label>Type</Label>
      <div className="flex gap-2 flex-wrap" style={{ marginBottom: 24 }}>{PROPERTY_TYPES.map((x) => <Pill key={x} selected={a.propType === x} onClick={() => set("propType", x)}>{x}</Pill>)}</div>
      <div className="flex gap-3" style={{ marginBottom: 24 }}>
        <Stepper label="Bedrooms" value={a.beds} min={0} max={8} onChange={(n) => set("beds", n)} />
        <Stepper label="Bathrooms" value={a.baths} min={1} max={6} step={0.5} onChange={(n) => set("baths", n)} />
      </div>
      <Label>Is anyone living there now?</Label>
      <div className="flex gap-2 flex-wrap">{OCCUPANCY.map((x) => <Pill key={x} selected={a.occupancy === x} onClick={() => set("occupancy", x)}>{x}</Pill>)}</div>
    </>),
    condition: (<>
      <Question title="What condition is it in?" sub="Be honest. It helps us plan, and nothing here is a deal-breaker on its own." />
      <div className="grid gap-3">{CONDITIONS.map((x, i) => <Choice key={x} selected={a.condition === x} onClick={() => pickAndAdvance("condition", x)} title={x} hint={CONDITION_HINTS[x]} icon={CONDITION_ICONS[i]} />)}</div>
    </>),
    care: (<>
      <Question title="How has it been looked after?" />
      <div className="grid gap-3">{MAINTENANCE_LEVELS.map((x, i) => <Choice key={x} selected={a.maintenance === x} onClick={() => pickAndAdvance("maintenance", x)} title={x} icon={MAINT_ICONS[i]} />)}</div>
    </>),
    rent: (<>
      <Question title="What rent do you have in mind?" sub="A rough range is fine." />
      <div className="grid grid-cols-2 gap-2" style={{ marginBottom: 24 }}>
        {RENT_RANGES.map((r) => {
          const sel = a.rentRange === r.label;
          return (
            <motion.button key={r.label} type="button" onClick={() => set("rentRange", r.label)} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} transition={spring}
              style={{ padding: "16px 10px", borderRadius: 14, fontSize: 16, fontWeight: 700, cursor: "pointer", backgroundColor: sel ? NAVY : SURFACE, color: sel ? "#FAF8F5" : NAVY, border: `1.5px solid ${sel ? NAVY : BORDER}`, boxShadow: sel ? "0 8px 22px rgba(31,47,58,0.22)" : "none" }}>
              {r.label}
            </motion.button>
          );
        })}
      </div>
      <Label>That number is…</Label>
      <div className="flex gap-2 flex-wrap">{RENT_BASIS.map((x) => <Pill key={x} selected={a.rentBasis === x} onClick={() => set("rentBasis", x)}>{x}</Pill>)}</div>
    </>),
    flex: (<>
      <Question title="How flexible are you on rent?" />
      <div className="grid gap-3">{RENT_FLEXIBILITY.map((x, i) => <Choice key={x} selected={a.rentFlex === x} onClick={() => pickAndAdvance("rentFlex", x)} title={x} icon={FLEX_ICONS[i]} />)}</div>
    </>),
    want: (<>
      <Question title="What are you looking for?" sub="Skip anything you're unsure about." />
      <Label>Help you want</Label>
      <div className="flex gap-2 flex-wrap" style={{ marginBottom: 22 }}>{SERVICES.map((x) => <Pill key={x} selected={a.service === x} onClick={() => set("service", x)}>{x}</Pill>)}</div>
      <Label>How involved do you want to be?</Label>
      <div className="flex gap-2 flex-wrap" style={{ marginBottom: 22 }}>{INVOLVEMENT.map((x) => <Pill key={x} selected={a.involvement === x} onClick={() => set("involvement", x)}>{x}</Pill>)}</div>
      <Label>When do you want to start?</Label>
      <div className="flex gap-2 flex-wrap" style={{ marginBottom: 22 }}>{TIMELINES.map((x) => <Pill key={x} selected={a.timeline === x} onClick={() => set("timeline", x)}>{x}</Pill>)}</div>
      <Label>Anything else we should know? (optional)</Label>
      <textarea rows={3} value={a.notes} onChange={(e) => set("notes", e.target.value)} style={{ ...inputStyle, resize: "vertical" }} />
    </>),
    review: (<>
      <Question title="Look good?" sub="Tap Back to change anything. Then send it to Ebin." />
      <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 18, padding: "6px 20px" }}>
        {summary.map(([k, v], i) => (
          <motion.div key={k} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            style={{ padding: "14px 0", borderBottom: i < summary.length - 1 ? `1px solid ${BORDER}` : "none" }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#999999", margin: "0 0 2px" }}>{k}</p>
            <p style={{ fontSize: 16, color: TEXT, margin: 0, fontWeight: 500 }}>{v}</p>
          </motion.div>
        ))}
      </div>
      {error && <p style={{ color: ACCENT, fontSize: 14, marginTop: 14 }}>{error}</p>}
    </>),
  };

  const key = steps[step].key;
  const autoAdvances = ["area", "condition", "care", "flex"].includes(key);
  const showContinue = step < last && !autoAdvances && !(key === "address" && a.share === "no");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, display: "flex", flexDirection: "column" }}>
      {/* Header + progress */}
      <header style={{ position: "sticky", top: 0, zIndex: 20, backgroundColor: "rgba(247,245,242,0.92)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "14px 20px 12px" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
            <motion.button type="button" onClick={() => go(step - 1)} animate={{ opacity: step === 0 ? 0 : 1 }} disabled={step === 0}
              style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14, fontWeight: 600, color: MUTED, cursor: step === 0 ? "default" : "pointer" }} aria-label="Back">
              <Icon name="arrow_back" size={18} /> Back
            </motion.button>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: NAVY }}>Prospera Properties</span>
            <span style={{ fontSize: 13, color: MUTED, minWidth: 56, textAlign: "right" }}>{step === last ? "Last step" : `~${minsLeft} min`}</span>
          </div>
          <div style={{ height: 6, borderRadius: 999, backgroundColor: "#E7E2DA", overflow: "hidden" }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <motion.div initial={false} animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} style={{ height: "100%", borderRadius: 999, backgroundColor: NAVY }} />
          </div>
          <p style={{ fontSize: 12, color: "#999999", margin: "6px 0 0" }}>Step {step + 1} of {steps.length}</p>
        </div>
      </header>

      {/* Step body */}
      <main style={{ flex: 1, maxWidth: 600, width: "100%", margin: "0 auto", padding: "32px 20px 140px", position: "relative", overflowX: "hidden" }}>
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div key={key} custom={dir}
            variants={{ enter: (d: number) => ({ opacity: 0, x: 40 * d }), center: { opacity: 1, x: 0 }, exit: (d: number) => ({ opacity: 0, x: -40 * d }) }}
            initial="enter" animate="center" exit="exit" transition={{ duration: 0.22, ease: "easeOut" }}>
            {body[key]}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Sticky action bar */}
      {(showContinue || step === last) && (
        <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 20, padding: "14px 20px calc(14px + env(safe-area-inset-bottom))", background: "linear-gradient(to top, #F7F5F2 70%, rgba(247,245,242,0))" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <motion.button
              type="button"
              onClick={() => (step === last ? submit() : go(step + 1))}
              disabled={!steps[step].valid || saving}
              whileHover={steps[step].valid ? { scale: 1.01 } : undefined}
              whileTap={steps[step].valid ? { scale: 0.98 } : undefined}
              animate={{ opacity: steps[step].valid && !saving ? 1 : 0.45 }}
              className="w-full uppercase"
              style={{ backgroundColor: ACCENT, color: "#FAF8F5", padding: "18px 24px", borderRadius: 12, fontSize: 13, fontWeight: 700, letterSpacing: 2, cursor: steps[step].valid ? "pointer" : "not-allowed", boxShadow: "0 10px 24px rgba(139,32,48,0.25)" }}
            >
              {step === last ? (saving ? "Sending…" : "Send to Ebin") : "Continue"}
            </motion.button>
            {key === "want" && <p style={{ fontSize: 13, color: "#999999", textAlign: "center", margin: "8px 0 0" }}>Everything on this screen is optional</p>}
          </div>
        </div>
      )}
    </div>
  );
}
