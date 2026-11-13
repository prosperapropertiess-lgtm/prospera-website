"use client";

import { useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import DocUploadSlot, { type UploadedFile } from "@/components/apply/DocUploadSlot";
import { NAVY, BORDER, MUTED, heading, Shell, Progress, HomeCard, Question, Choice, Next, Text, Input, Err } from "@/components/flow/FlowUI";
import { torontoToday, targetMoveIn, earliestMoveIn, moveInOptions } from "@/lib/viewing-requests";
import {
  INCOME_SOURCES,
  docSlotsFor,
  missingDocs,
  type DocType,
  type IncomeSource,
} from "@/lib/application-requirements";

// Same one-section-per-screen flow as the viewing request form (/view).
const SCREENS = [
  { key: "you", label: "About you", title: "Let's start with you" },
  { key: "move", label: "Your move", title: "Your move" },
  { key: "basics", label: "A few basics", title: "A few basics" },
  { key: "income", label: "Income", title: "Your income" },
  { key: "current", label: "Where you live now", title: "Where you live now" },
  { key: "docs", label: "Documents", title: "Last step. Your documents" },
] as const;
type ScreenKey = (typeof SCREENS)[number]["key"];

interface Property {
  address: string; city: string; price: number; bedrooms: number; bathrooms: number;
  utilities_included?: boolean; available_date?: string | null; images?: string[] | null;
}

interface CoApplicant { name: string; email: string; phone: string }

const EMPTY_FORM = {
  tenant_name: "", tenant_email: "", tenant_phone: "",
  move_in_date: "", occupants: "", co_applicants: [] as CoApplicant[],
  has_pets: "", pets: "", smokes: "", vehicles: "",
  income_source: "" as IncomeSource | "",
  employer_name: "", employer_position: "", employment_type: "", employment_start: "",
  monthly_income: "", income_notes: "", employer_ref_name: "", employer_ref_phone: "",
  rents_now: "", current_address: "", time_at_address: "", current_rent: "",
  landlord_ref_name: "", landlord_ref_phone: "", landlord_ref_email: "",
  reason_for_moving: "",
};

type Form = typeof EMPTY_FORM;
type Docs = Partial<Record<DocType, UploadedFile[]>>;
type Errors = Record<string, string>;

const fmtDate = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("en-CA", { month: "long", day: "numeric" });
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ApplyPage({ params }: { params: Promise<{ agentId: string; propertyId: string }> }) {
  const { agentId, propertyId } = use(params);
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);

  const [property, setProperty] = useState<Property | null>(null);
  const [loadError, setLoadError] = useState("");
  const [screen, setScreen] = useState<ScreenKey>("you");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [docs, setDocs] = useState<Docs>({});
  const [consent, setConsent] = useState(false);
  const [resumed, setResumed] = useState(false);
  const [otherDate, setOtherDate] = useState(false);
  const [manyPeople, setManyPeople] = useState(false);

  const DRAFT_KEY = `apply_draft_v3_${agentId}_${propertyId}`;

  function set<K extends keyof Form>(field: K, value: Form[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((e) => (e[field as string] ? { ...e, [field as string]: "" } : e));
  }

  useEffect(() => {
    async function validate() {
      const res = await fetch(`/api/applications/validate-apply-link?agent_id=${agentId}&property_id=${propertyId}`);
      const json = await res.json();
      if (!res.ok || !json.property) {
        setLoadError(json.error ?? "This link is no longer valid.");
        return;
      }
      setProperty(json.property);
    }
    validate();
  }, [agentId, propertyId]);

  // Resume a saved draft if this link was started before and the tab got closed.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (!saved) return;
      const draft = JSON.parse(saved);
      const t = setTimeout(() => {
        if (draft.form) setForm({ ...EMPTY_FORM, ...draft.form });
        if (draft.docs) setDocs(draft.docs);
        if (draft.screen && SCREENS.some((s) => s.key === draft.screen)) setScreen(draft.screen);
        setResumed(true);
      }, 0);
      return () => clearTimeout(t);
    } catch {
      // Private browsing or corrupted draft — start fresh.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, docs, screen }));
    } catch {
      // Storage full or unavailable — not worth interrupting the applicant over.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, docs, screen]);

  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, [screen]);

  function setCoApplicant(i: number, field: keyof CoApplicant, value: string) {
    const next = [...form.co_applicants];
    next[i] = { ...next[i], [field]: value };
    set("co_applicants", next);
  }

  const flatDocs = Object.entries(docs).flatMap(([doc_type, files]) =>
    (files ?? []).map((f) => ({ doc_type, storage_path: f.path })),
  );

  /** What's missing on a screen, keyed by question id. */
  function missingOn(key: ScreenKey): Errors {
    const f = form;
    const e: Errors = {};
    if (key === "you") {
      if (!f.tenant_name.trim()) e.tenant_name = "Enter your full name.";
      if (!EMAIL.test(f.tenant_email.trim())) e.tenant_email = "Enter a valid email.";
      if (f.tenant_phone.replace(/\D/g, "").length < 10) e.tenant_phone = "Enter a phone number we can reach you at.";
    }
    if (key === "move") {
      if (!f.move_in_date || f.move_in_date < torontoToday()) e.move_in_date = "Pick when you'd like to move in.";
      if (!(Number(f.occupants) >= 1)) e.occupants = "How many people will live there?";
      if (f.co_applicants.some((c) => !c.name.trim() || !EMAIL.test(c.email.trim()))) e.co_applicants = "Add a name and email for each person, or remove them.";
    }
    if (key === "basics") {
      if (!f.has_pets) e.has_pets = "Pick an answer.";
      if (f.has_pets === "yes" && !f.pets.trim()) e.pets = "Tell us what pets you have.";
      if (!f.smokes) e.smokes = "Pick an answer.";
      if (!f.vehicles) e.vehicles = "Pick an answer.";
    }
    if (key === "income") {
      if (!f.income_source) e.income_source = "Pick an answer.";
      if (f.income_source === "employed" && !f.employer_name.trim()) e.employer_name = "Where do you work?";
      if (f.income_source === "other" && !f.income_notes.trim()) e.income_notes = "Where does your income come from?";
      if (f.income_source && !(Number(f.monthly_income) > 0)) e.monthly_income = "About how much comes in each month, before tax?";
    }
    if (key === "current") {
      if (!f.rents_now) e.rents_now = "Pick an answer.";
      if (!f.current_address.trim()) e.current_address = "Enter your current address.";
      if (!f.time_at_address) e.time_at_address = "Pick an answer.";
      if (f.rents_now === "yes" && !f.landlord_ref_name.trim()) e.landlord_ref = "Add your landlord's name.";
      else if (f.rents_now === "yes" && !f.landlord_ref_phone.trim() && !EMAIL.test(f.landlord_ref_email.trim())) e.landlord_ref = "Add a phone or email for your landlord.";
    }
    if (key === "docs") {
      const missing = missingDocs(f.income_source, flatDocs);
      if (missing) e.docs = missing;
      if (!consent) e.consent = "Tick the box to send your application.";
    }
    return e;
  }

  const idx = SCREENS.findIndex((s) => s.key === screen);
  const current = SCREENS[idx];

  function goTo(key: ScreenKey) {
    setErrors({}); setFormError(""); setScreen(key); window.scrollTo({ top: 0 });
  }

  function continueFrom(key: ScreenKey) {
    const e = missingOn(key);
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) {
      document.getElementById(`q-${first}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    goTo(SCREENS[SCREENS.findIndex((s) => s.key === key) + 1].key);
  }

  async function submit() {
    const e = missingOn("docs");
    setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitting(true);
    setFormError("");

    try {
      const res = await fetch("/api/applications/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, occupants: form.occupants || "1", vehicles: form.vehicles || "0", consent, agent_id: agentId, property_id: propertyId, documents: flatDocs }),
      });
      const json = await res.json();
      if (!res.ok) { setFormError(json.error ?? "We couldn't send your application. Try again."); setSubmitting(false); return; }
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* not critical */ }
      router.push(`/apply/${agentId}/${propertyId}/submitted${json.application_id ? `?id=${json.application_id}` : ""}`);
    } catch {
      setFormError("We couldn't reach our server. Check your connection and press Send again. Your answers are still here.");
      setSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <Shell>
        <h1 className="text-3xl font-bold mb-3" style={heading}>This link isn&apos;t working</h1>
        <p className="text-base mb-2" style={{ color: "#333" }}>{loadError}</p>
        <p className="text-sm" style={{ color: MUTED }}>Call or text us at (519) 697-1227 and we&apos;ll send you a new one.</p>
      </Shell>
    );
  }

  if (!property) return <Shell><div className="h-64" /></Shell>;

  const income = form.income_source;
  const people = Number(form.occupants) || 0;
  const asap = earliestMoveIn(property.available_date);
  const choices = moveInOptions(property.available_date);
  const customDate = otherDate || (!!form.move_in_date && form.move_in_date !== asap && !choices.includes(form.move_in_date));
  const target = targetMoveIn(property.available_date);

  return (
    <Shell>
      <Progress index={idx} total={SCREENS.length} label={current.label} onBack={idx > 0 ? () => goTo(SCREENS[idx - 1].key) : undefined} />

      <HomeCard
        image={property.images?.[0]}
        address={property.address}
        price={property.price}
        utilitiesIncluded={property.utilities_included}
        extra={`${property.bedrooms} bed`}
      />

      {resumed && idx > 0 && (
        <div className="flex items-center justify-between rounded-xl border bg-white px-4 py-3 mb-6 text-sm" style={{ borderColor: BORDER, color: "#333" }}>
          <span>We saved your answers. You&apos;re right where you left off.</span>
          <button type="button" onClick={() => setResumed(false)} aria-label="Dismiss" className="text-lg leading-none px-1" style={{ color: MUTED }}>×</button>
        </div>
      )}

      <div key={screen} className="view-step">
        <h1 ref={headingRef} tabIndex={-1} className="text-2xl sm:text-3xl font-bold mb-5 outline-none leading-tight" style={heading}>{current.title}</h1>

        {screen === "you" && (
          <div className="grid gap-6">
            {idx === 0 && (
              <div className="rounded-xl border bg-white px-4 py-3 text-sm" style={{ borderColor: BORDER, color: "#333" }}>
                <p className="font-semibold mb-1" style={{ color: NAVY }}>About 5 minutes. Your answers save as you go.</p>
                <p>6 short screens. Have a photo ID and proof of income ready for the last one. Phone photos are fine.</p>
              </div>
            )}
            <Text id="tenant_name" label="Full name" autoComplete="name" value={form.tenant_name} onChange={(v) => set("tenant_name", v)} error={errors.tenant_name} />
            <Text id="tenant_email" label="Email" type="email" inputMode="email" autoComplete="email" value={form.tenant_email} onChange={(v) => set("tenant_email", v)} error={errors.tenant_email} />
            <Text id="tenant_phone" label="Phone number" type="tel" inputMode="tel" autoComplete="tel" value={form.tenant_phone} onChange={(v) => set("tenant_phone", v)} error={errors.tenant_phone} />
            <Next onClick={() => continueFrom("you")} />
          </div>
        )}

        {screen === "move" && (
          <div className="grid gap-8">
            <Question id="move_in_date" title="When would you like to move in?"
              sub={property.available_date && property.available_date > torontoToday() ? `This home is available from ${fmtDate(property.available_date)}.` : "This home is available now."}
              error={errors.move_in_date}>
              <div className="grid gap-2">
                <Choice compact selected={!customDate && form.move_in_date === asap} onClick={() => { setOtherDate(false); set("move_in_date", asap); }}>
                  As soon as possible{asap > torontoToday() ? ` (${fmtDate(asap)})` : ""}
                </Choice>
                <div className="grid grid-cols-2 gap-2">
                  {choices.map((c) => (
                    <Choice key={c} compact selected={!customDate && form.move_in_date === c} onClick={() => { setOtherDate(false); set("move_in_date", c); }}>{fmtDate(c)}</Choice>
                  ))}
                </div>
                <Choice compact selected={customDate} onClick={() => { setOtherDate(true); set("move_in_date", ""); }}>Another date</Choice>
                {customDate && (
                  <Input type="date" aria-label="Move-in date" min={asap} value={form.move_in_date} onChange={(e) => set("move_in_date", e.target.value)} invalid={!!errors.move_in_date} />
                )}
                {form.move_in_date && form.move_in_date > target && (
                  <div role="status" className="view-step rounded-xl px-4 py-3.5 text-[15px] leading-relaxed" style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderLeft: `4px solid ${NAVY}`, color: "#333" }}>
                    <b style={{ color: NAVY }}>Just so you know:</b> this home is ready {asap > torontoToday() ? `on ${fmtDate(asap)}` : "now"}, so we&apos;re giving priority to people who can move in by <b style={{ color: NAVY }}>{fmtDate(target)}</b>. You can still apply.
                  </div>
                )}
              </div>
            </Question>

            <Question id="occupants" title="How many people will live there?" sub="Everyone, including you and any kids." error={errors.occupants}>
              <div className="grid grid-cols-6 gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Choice key={n} compact selected={people === n && !manyPeople} onClick={() => {
                    setManyPeople(false);
                    set("occupants", String(n));
                    if (form.co_applicants.length > n - 1) set("co_applicants", form.co_applicants.slice(0, Math.max(0, n - 1)));
                  }}>{n}</Choice>
                ))}
                <Choice compact selected={manyPeople} onClick={() => { setManyPeople(true); set("occupants", form.occupants && people >= 6 ? form.occupants : "6"); }}>6+</Choice>
              </div>
              {manyPeople && (
                <Input aria-label="Total people" type="number" inputMode="numeric" min={6} max={20} className="mt-3" value={form.occupants} onChange={(e) => set("occupants", e.target.value)} />
              )}
            </Question>

            {people > 1 && (
              <Question id="co_applicants" title="Anyone else signing the lease?" sub="Add other adults who'll be on the lease. They don't need to fill out their own form." error={errors.co_applicants} followUp>
                <div className="grid gap-3">
                  {form.co_applicants.map((c, i) => (
                    <div key={i} className="rounded-xl border-2 bg-white p-4 grid gap-2" style={{ borderColor: BORDER }}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold" style={{ color: NAVY }}>Person {i + 2}</span>
                        <button type="button" onClick={() => set("co_applicants", form.co_applicants.filter((_, j) => j !== i))} className="text-sm underline" style={{ color: MUTED }}>Remove</button>
                      </div>
                      <Input placeholder="Full name" value={c.name} onChange={(e) => setCoApplicant(i, "name", e.target.value)} />
                      <div className="grid grid-cols-2 gap-2">
                        <Input type="email" placeholder="Email" value={c.email} onChange={(e) => setCoApplicant(i, "email", e.target.value)} />
                        <Input type="tel" placeholder="Phone" value={c.phone} onChange={(e) => setCoApplicant(i, "phone", e.target.value)} />
                      </div>
                    </div>
                  ))}
                  {form.co_applicants.length < people - 1 && (
                    <button type="button" onClick={() => set("co_applicants", [...form.co_applicants, { name: "", email: "", phone: "" }])}
                      className="w-full min-h-[48px] rounded-xl border-2 border-dashed bg-white text-[15px] font-semibold" style={{ borderColor: BORDER, color: NAVY }}>
                      + Add a person to the lease
                    </button>
                  )}
                </div>
              </Question>
            )}
            <Next onClick={() => continueFrom("move")} />
          </div>
        )}

        {screen === "basics" && (
          <div className="grid gap-8">
            <Question id="has_pets" title="Any pets?" error={errors.has_pets}>
              <div className="grid grid-cols-2 gap-2">
                <Choice compact selected={form.has_pets === "no"} onClick={() => set("has_pets", "no")}>No</Choice>
                <Choice compact selected={form.has_pets === "yes"} onClick={() => set("has_pets", "yes")}>Yes</Choice>
              </div>
            </Question>
            {form.has_pets === "yes" && (
              <Question id="pets" title="What kind, and how many?" error={errors.pets} followUp>
                <Input value={form.pets} onChange={(e) => set("pets", e.target.value)} placeholder="e.g. one cat" invalid={!!errors.pets} />
              </Question>
            )}
            <Question id="smokes" title="Does anyone who'll live there smoke or vape?" error={errors.smokes}>
              <div className="grid grid-cols-2 gap-2">
                <Choice compact selected={form.smokes === "no"} onClick={() => set("smokes", "no")}>No</Choice>
                <Choice compact selected={form.smokes === "yes"} onClick={() => set("smokes", "yes")}>Yes</Choice>
              </div>
            </Question>
            <Question id="vehicles" title="How many vehicles?" error={errors.vehicles}>
              <div className="grid grid-cols-3 gap-2">
                {[["0", "None"], ["1", "1"], ["2", "2+"]].map(([v, l]) => (
                  <Choice key={v} compact selected={form.vehicles === v} onClick={() => set("vehicles", v)}>{l}</Choice>
                ))}
              </div>
            </Question>
            <Next onClick={() => continueFrom("basics")} />
          </div>
        )}

        {screen === "income" && (
          <div className="grid gap-8">
            <Question id="income_source" title="Where does your income come from?" error={errors.income_source}>
              <div className="grid gap-2">
                {INCOME_SOURCES.map((o) => (
                  <Choice key={o.value} selected={income === o.value} hint={o.hint} onClick={() => set("income_source", o.value)}>{o.label}</Choice>
                ))}
              </div>
            </Question>

            {income === "employed" && (
              <div className="grid gap-6 pl-4 border-l-2 view-step" style={{ borderColor: BORDER }}>
                <Text id="employer_name" label="Where do you work?" value={form.employer_name} onChange={(v) => set("employer_name", v)} error={errors.employer_name} />
                <Text id="employer_position" label="Your job title" value={form.employer_position} onChange={(v) => set("employer_position", v)} />
                <Question id="employment_type" title="Type of job">
                  <div className="grid grid-cols-3 gap-2">
                    {[["full_time", "Full-time"], ["part_time", "Part-time"], ["contract", "Contract"]].map(([v, l]) => (
                      <Choice key={v} compact selected={form.employment_type === v} onClick={() => set("employment_type", v)}>{l}</Choice>
                    ))}
                  </div>
                </Question>
                <Text id="employment_start" label="When did you start?" type="date" value={form.employment_start} onChange={(v) => set("employment_start", v)} />
              </div>
            )}

            {income === "self_employed" && (
              <div className="grid gap-6 pl-4 border-l-2 view-step" style={{ borderColor: BORDER }}>
                <Text id="employer_position" label="What do you do?" sub="e.g. electrician, Uber driver, run a cleaning business" value={form.employer_position} onChange={(v) => set("employer_position", v)} />
                <Text id="employer_name" label="Business name (optional)" value={form.employer_name} onChange={(v) => set("employer_name", v)} />
                <Text id="employment_start" label="Doing this since" type="date" value={form.employment_start} onChange={(v) => set("employment_start", v)} />
              </div>
            )}

            {income === "student" && (
              <div className="grid gap-6 pl-4 border-l-2 view-step" style={{ borderColor: BORDER }}>
                <Text id="employer_name" label="School and program" placeholder="e.g. Western, Nursing" value={form.employer_name} onChange={(v) => set("employer_name", v)} />
                <Question id="income_notes" title="How will rent be paid?" sub="OSAP, a part-time job, family, a co-signer. Anything that applies.">
                  <textarea value={form.income_notes} onChange={(e) => set("income_notes", e.target.value)}
                    className="w-full px-4 py-3.5 border rounded-lg text-base bg-white min-h-[96px]" style={{ borderColor: BORDER, color: "#222" }} />
                </Question>
              </div>
            )}

            {income === "other" && (
              <div className="pl-4 border-l-2 view-step" style={{ borderColor: BORDER }}>
                <Text id="income_notes" label="Where does it come from?" placeholder="e.g. ODSP, EI, child support" value={form.income_notes} onChange={(v) => set("income_notes", v)} error={errors.income_notes} />
              </div>
            )}

            {income && (
              <Question id="monthly_income" title="About how much comes in each month?"
                sub={`Before tax. Count every source.${form.co_applicants.length ? " Just yours, not the other people on the lease." : ""}`}
                error={errors.monthly_income}>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base" style={{ color: MUTED }}>$</span>
                  <Input type="number" inputMode="numeric" className="pl-8" value={form.monthly_income} onChange={(e) => set("monthly_income", e.target.value)} invalid={!!errors.monthly_income} />
                </div>
              </Question>
            )}

            {income === "employed" && (
              <Question id="employer_ref" title="Someone at work we can call (optional)" sub="A manager or HR. Only if you're comfortable with it.">
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Name" value={form.employer_ref_name} onChange={(e) => set("employer_ref_name", e.target.value)} />
                  <Input type="tel" placeholder="Phone" value={form.employer_ref_phone} onChange={(e) => set("employer_ref_phone", e.target.value)} />
                </div>
              </Question>
            )}
            <Next onClick={() => continueFrom("income")} />
          </div>
        )}

        {screen === "current" && (
          <div className="grid gap-8">
            <Question id="rents_now" title="Do you rent your current place?" error={errors.rents_now}>
              <div className="grid grid-cols-2 gap-2">
                <Choice compact selected={form.rents_now === "yes"} onClick={() => set("rents_now", "yes")}>Yes, I rent</Choice>
                <Choice compact selected={form.rents_now === "no"} onClick={() => set("rents_now", "no")}>No</Choice>
              </div>
            </Question>
            <Text id="current_address" label="Current address" autoComplete="street-address" value={form.current_address} onChange={(v) => set("current_address", v)} error={errors.current_address} />
            <Question id="time_at_address" title="How long have you lived there?" error={errors.time_at_address}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[["under_1", "Under 1 yr"], ["1_2", "1–2 yrs"], ["2_5", "2–5 yrs"], ["5_plus", "5+ yrs"]].map(([v, l]) => (
                  <Choice key={v} compact selected={form.time_at_address === v} onClick={() => set("time_at_address", v)}>{l}</Choice>
                ))}
              </div>
            </Question>

            {form.rents_now === "yes" && (
              <>
                <Question id="current_rent" title="What do you pay now each month?" followUp>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base" style={{ color: MUTED }}>$</span>
                    <Input type="number" inputMode="numeric" className="pl-8" value={form.current_rent} onChange={(e) => set("current_rent", e.target.value)} />
                  </div>
                </Question>
                <Question id="landlord_ref" title="Your current landlord" sub="We may reach out to them. A phone or email is enough." error={errors.landlord_ref} followUp>
                  <div className="grid gap-2">
                    <Input placeholder="Name" value={form.landlord_ref_name} onChange={(e) => set("landlord_ref_name", e.target.value)} />
                    <div className="grid grid-cols-2 gap-2">
                      <Input type="tel" placeholder="Phone" value={form.landlord_ref_phone} onChange={(e) => set("landlord_ref_phone", e.target.value)} />
                      <Input type="email" placeholder="Email" value={form.landlord_ref_email} onChange={(e) => set("landlord_ref_email", e.target.value)} />
                    </div>
                  </div>
                </Question>
              </>
            )}

            <Question id="reason_for_moving" title="Why are you moving? (optional)">
              <textarea value={form.reason_for_moving} onChange={(e) => set("reason_for_moving", e.target.value)} placeholder="e.g. need more space, new job closer to here"
                className="w-full px-4 py-3.5 border rounded-lg text-base bg-white min-h-[96px]" style={{ borderColor: BORDER, color: "#222" }} />
            </Question>
            <Next onClick={() => continueFrom("current")} />
          </div>
        )}

        {screen === "docs" && (
          <div className="grid gap-6">
            <p className="text-base -mt-2" style={{ color: "#333" }}>
              PDFs and phone photos both work. Your documents are stored privately and only used to review this application.
            </p>
            {formError && <div role="alert" className="rounded-lg border px-4 py-3 text-sm bg-white" style={{ borderColor: "#8B2030", color: "#8B2030" }}>{formError}</div>}
            <div id="q-docs">
              {docSlotsFor(income).map((slot) => (
                <DocUploadSlot
                  key={slot.type}
                  slot={slot}
                  files={docs[slot.type] ?? []}
                  onChange={(files) => { setDocs((d) => ({ ...d, [slot.type]: files })); setErrors((e) => ({ ...e, docs: "" })); }}
                />
              ))}
              {errors.docs && <Err>{errors.docs}</Err>}
            </div>

            <div id="q-consent">
              <label className="flex gap-3 items-start cursor-pointer rounded-xl border-2 bg-white p-4" style={{ borderColor: errors.consent ? "#8B2030" : BORDER }}>
                <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setErrors((x) => ({ ...x, consent: "" })); }} className="mt-1 w-5 h-5 shrink-0" style={{ accentColor: NAVY }} />
                <span className="text-sm leading-relaxed" style={{ color: "#333" }}>
                  Everything I&apos;ve shared is true. I give Prospera Properties permission to review my application and documents, and to contact the references I listed. Software helps organize my file, and a person makes every decision.
                </span>
              </label>
              {errors.consent && <Err>{errors.consent}</Err>}
            </div>

            <div>
              <Next onClick={submit} disabled={submitting}>{submitting ? "Sending…" : "Send my application"}</Next>
              <p className="text-sm text-center mt-3" style={{ color: MUTED }}>We&apos;ll be in touch once we&apos;ve looked it over.</p>
            </div>
          </div>
        )}
      </div>

      <p className="text-sm mt-10" style={{ color: MUTED }}>Your answers save on this device until you send them. Need help? Call or text (519) 697-1227.</p>
    </Shell>
  );
}
