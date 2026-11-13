"use client";
// The rental application. Four steps, same look as the viewing form.
// With a personal link (from the after-viewing email) it starts from what the
// viewing form already told us and only asks what's still missing.
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DocUploadSlot, { type UploadedFile } from "@/components/apply/DocUploadSlot";
import { NAVY, BORDER, MUTED, BURGUNDY, heading, Shell, HomeCard, Question, Choice, Next, Text, Input, Err } from "@/components/flow/FlowUI";
import { torontoToday } from "@/lib/viewing-requests";
import { INCOME_SOURCES, DOC_OPTIONS, optionSlots, missingOptionDocs, type DocType, type DocOption, type IncomeSource } from "@/lib/application-requirements";

export interface ApplyProperty {
  id: string; address: string; city: string; price: number; bedrooms: number; bathrooms: number;
  utilities_included?: boolean; available_date?: string | null; images?: string[] | null;
}
export interface ViewingPrefill {
  full_name?: string | null; phone?: string | null; email?: string | null;
  move_in_date?: string | null; occupants?: number | null; answers?: Record<string, string>;
}

const STEPS = [
  { key: "you", label: "You & the move" },
  { key: "work", label: "Work & income" },
  { key: "home", label: "Where you live now" },
  { key: "docs", label: "Documents" },
] as const;
type StepKey = (typeof STEPS)[number]["key"];

interface CoApplicant { name: string; email: string; phone: string }
const EMPTY = {
  tenant_name: "", tenant_email: "", tenant_phone: "", tenant_dob: "",
  move_in_date: "", occupants: "", co_applicants: [] as CoApplicant[],
  has_pets: "", pets: "", smokes: "", vehicles: "",
  income_source: "" as IncomeSource | "", employer_name: "", employer_position: "", employment_type: "", employment_start: "",
  monthly_income: "", income_notes: "", employer_ref_name: "", employer_ref_phone: "",
  rents_now: "", current_address: "", time_at_address: "", current_rent: "",
  landlord_ref_name: "", landlord_ref_phone: "", landlord_ref_email: "", reason_for_moving: "",
};
type Form = typeof EMPTY;
type Docs = Partial<Record<DocType, UploadedFile[]>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const fmtDate = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" });
const REASONS: Record<string, string> = { more_space: "Need more space", closer: "Closer to work or school", cost: "Lower rent", landlord: "Landlord is selling or moving in", first_place: "First place of my own" };

/** Turn the viewing form's answers into application fields. Only facts they gave us. */
function fromViewing(v: ViewingPrefill | null, name: string, email: string, phone: string): Partial<Form> {
  const a = v?.answers ?? {};
  const out: Partial<Form> = { tenant_name: name, tenant_email: email, tenant_phone: phone || v?.phone || "" };
  if (v?.move_in_date && v.move_in_date >= torontoToday()) out.move_in_date = v.move_in_date;
  if (v?.occupants) out.occupants = String(v.occupants);
  if (a.pets === "none") out.has_pets = "no";
  if (a.pets === "yes") { out.has_pets = "yes"; out.pets = a.pet_details ?? ""; }
  if (a.smoking === "no") out.smokes = "no";
  if (a.smoking === "yes") out.smokes = "yes";
  if (a.vehicles) out.vehicles = a.vehicles === "3_plus" ? "2" : a.vehicles === "2" ? "2" : a.vehicles;
  if (a.employment === "full_time" || a.employment === "part_time") { out.income_source = "employed"; out.employment_type = a.employment; }
  else if (a.employment === "self_employed" || a.employment === "student" || a.employment === "retired") out.income_source = a.employment;
  else if (a.employment) out.income_source = "other";
  if (a.living) out.rents_now = a.living === "renting" ? "yes" : "no";
  const len: Record<string, string> = { lt_1y: "under_1", "1_2y": "1_2", "2_5y": "2_5", "5y_plus": "5_plus" };
  if (a.rental_length && len[a.rental_length]) out.time_at_address = len[a.rental_length];
  if (a.moving_reason && REASONS[a.moving_reason]) out.reason_for_moving = REASONS[a.moving_reason];
  return out;
}

export default function ApplicationForm({ property, agentId, inviteToken, invite }: {
  property: ApplyProperty;
  agentId: string;
  inviteToken?: string;
  invite?: { name: string; email: string; phone: string | null; viewing: ViewingPrefill | null };
}) {
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const DRAFT = `apply_v4_${inviteToken ?? `${agentId}_${property.id}`}`;
  const prefill = useMemo(() => (invite ? fromViewing(invite.viewing, invite.name, invite.email, invite.phone ?? "") : {}), [invite]);
  // Fields we already know are tucked into a summary instead of asked again.
  const known = useMemo(() => new Set(Object.entries(prefill).filter(([, v]) => v !== "" && v != null).map(([k]) => k)), [prefill]);

  const [form, setForm] = useState<Form>({ ...EMPTY, ...prefill });
  const [step, setStep] = useState<StepKey>("you");
  const [docs, setDocs] = useState<Docs>({});
  const [docOption, setDocOption] = useState<DocOption | "">("");
  const [consent, setConsent] = useState(false);
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState<Record<string, boolean>>({});
  const [started, setStarted] = useState(!!invite ? false : true);

  // Resume a draft on this device.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT);
      if (!raw) return;
      const d = JSON.parse(raw);
      const t = setTimeout(() => {
        if (d.form) setForm((f) => ({ ...f, ...d.form }));
        if (d.docs) setDocs(d.docs);
        if (d.docOption) setDocOption(d.docOption);
        if (d.step) setStep(d.step);
        setStarted(true);
      }, 0);
      return () => clearTimeout(t);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    try { localStorage.setItem(DRAFT, JSON.stringify({ form, docs, docOption, step })); } catch {}
  }, [DRAFT, form, docs, docOption, step]);
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, [step, started]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => (e[k as string] ? { ...e, [k as string]: "" } : e));
  };
  const ask = (k: keyof Form) => !known.has(k) || editing[k];

  const idx = STEPS.findIndex((s) => s.key === step);
  const first = (form.tenant_name || invite?.name || "").trim().split(/\s+/)[0];
  const people = Number(form.occupants) || 0;
  const flatDocs = Object.entries(docs).flatMap(([doc_type, files]) => (files ?? []).map((f) => ({ doc_type, storage_path: f.path })));
  // Progress counts the answers we already have, so a personal link starts partway done.
  const pct = Math.round(((idx + (known.size > 4 ? 0.6 : 0)) / STEPS.length) * 100);

  function missingOn(k: StepKey): Record<string, string> {
    const f = form; const e: Record<string, string> = {};
    if (k === "you") {
      if (!f.tenant_name.trim()) e.tenant_name = "Enter your full legal name.";
      if (!EMAIL.test(f.tenant_email.trim())) e.tenant_email = "Enter a valid email.";
      if (f.tenant_phone.replace(/\D/g, "").length < 10) e.tenant_phone = "Enter a phone number we can reach you at.";
      if (!f.move_in_date) e.move_in_date = "When would you like to move in?";
      if (!(Number(f.occupants) >= 1)) e.occupants = "How many people will live there?";
      if (f.co_applicants.some((c) => !c.name.trim() || !EMAIL.test(c.email.trim()))) e.co_applicants = "Add a name and email for each person, or remove them.";
      if (!f.has_pets) e.has_pets = "Pick an answer.";
      if (f.has_pets === "yes" && !f.pets.trim()) e.pets = "Tell us what pets you have.";
      if (!f.smokes) e.smokes = "Pick an answer.";
    }
    if (k === "work") {
      if (!f.income_source) e.income_source = "Pick an answer.";
      if (f.income_source === "employed" && !f.employer_name.trim()) e.employer_name = "Where do you work?";
      if (f.income_source === "other" && !f.income_notes.trim()) e.income_notes = "Where does your income come from?";
      if (!(Number(f.monthly_income) > 0)) e.monthly_income = "About how much comes in each month, before tax?";
    }
    if (k === "home") {
      if (!f.rents_now) e.rents_now = "Pick an answer.";
      if (!f.current_address.trim()) e.current_address = "Enter your current address.";
      if (!f.time_at_address) e.time_at_address = "Pick an answer.";
      if (f.rents_now === "yes" && !f.landlord_ref_name.trim()) e.landlord_ref = "Add your landlord's name.";
      else if (f.rents_now === "yes" && !f.landlord_ref_phone.trim() && !EMAIL.test(f.landlord_ref_email.trim())) e.landlord_ref = "Add a phone or email for your landlord.";
    }
    if (k === "docs") {
      const m = missingOptionDocs(docOption, flatDocs);
      if (m) e.docs = m;
      if (!consent) e.consent = "Tick the box to send your application.";
    }
    // Something we tucked away is missing after all: open it up.
    const hidden = Object.keys(e).filter((x) => known.has(x) && !editing[x]);
    if (hidden.length) setEditing((ed) => ({ ...ed, ...Object.fromEntries(hidden.map((h) => [h, true])) }));
    return e;
  }

  function goTo(k: StepKey) { setErrors({}); setFormError(""); setStep(k); window.scrollTo({ top: 0 }); }
  function next() {
    const e = missingOn(step); setErrors(e);
    const firstErr = Object.keys(e)[0];
    if (firstErr) { setTimeout(() => document.getElementById(`q-${firstErr}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 50); return; }
    goTo(STEPS[idx + 1].key);
  }

  async function submit() {
    const e = missingOn("docs"); setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitting(true); setFormError("");
    try {
      const res = await fetch("/api/applications/submit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form, occupants: form.occupants || "1", vehicles: form.vehicles || "0", consent, doc_option: docOption,
          agent_id: agentId, property_id: property.id, invite_token: inviteToken ?? null, documents: flatDocs,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setFormError(json.error ?? "We couldn't send your application. Try again."); setSubmitting(false); return; }
      try { localStorage.removeItem(DRAFT); } catch {}
      router.push(`/apply/${agentId}/${property.id}/submitted${json.application_id ? `?id=${json.application_id}` : ""}`);
    } catch {
      setFormError("We couldn't reach our server. Check your connection and press Send again. Your answers are still here.");
      setSubmitting(false);
    }
  }

  const homeCard = (
    <HomeCard image={property.images?.[0]} address={property.address} city={property.city} price={property.price} beds={property.bedrooms}
      utilitiesIncluded={property.utilities_included}
      available={property.available_date && property.available_date > torontoToday() ? `Available ${fmtDate(property.available_date)}` : "Available now"} />
  );

  // ── Welcome: the "before you sit down" checklist from the email, as a commitment step ──
  if (!started) {
    const items = [
      ["landlord", "I've let my current landlord know you may call"],
      ["employer", "I've let my employer know you may call"],
      ["id", "I have my photo ID handy"],
      ["income", "I have 3 months of bank statements, or my pay stubs, credit report and job letter"],
    ];
    const done = items.filter(([k]) => ready[k]).length;
    return (
      <Shell>
        {homeCard}
        <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-bold mb-3 outline-none leading-tight" style={heading}>
          {first ? `Welcome back, ${first}.` : "Welcome."} Let&apos;s get your application in.
        </h1>
        <p className="text-base mb-6" style={{ color: "#333" }}>
          About 10 minutes.{known.size > 4 ? " We kept your answers from the viewing form, so a good part of this is already done." : ""} Your answers save on this device as you go.
        </p>
        <div className="rounded-xl border-2 bg-white p-5 mb-6" style={{ borderColor: BORDER }}>
          <p className="text-lg font-semibold mb-1" style={{ color: NAVY }}>Before you start</p>
          <p className="text-sm mb-4" style={{ color: MUTED }}>Tick what&apos;s done. People who have these ready finish in one go.</p>
          <div className="grid gap-2">
            {items.map(([k, label]) => (
              <Choice key={k} compact selected={!!ready[k]} onClick={() => setReady((r) => ({ ...r, [k]: !r[k] }))}>{label}</Choice>
            ))}
          </div>
        </div>
        <Next onClick={() => { setStarted(true); window.scrollTo({ top: 0 }); }}>{done === items.length ? "I'm ready. Start" : "Start my application"}</Next>
        {done < items.length && <p className="text-sm text-center mt-3" style={{ color: MUTED }}>You can start now and add documents at the end.</p>}
      </Shell>
    );
  }

  const knownCard = (rows: [keyof Form, string, string][]) => {
    const shown = rows.filter(([k, , v]) => known.has(k) && !editing[k] && v);
    if (!shown.length) return null;
    return (
      <div className="rounded-xl border bg-white p-4" style={{ borderColor: BORDER }}>
        <p className="text-sm font-semibold mb-2" style={{ color: NAVY }}>From your viewing form</p>
        {shown.map(([k, label, value]) => (
          <div key={k} className="flex items-center justify-between gap-3 py-1.5 text-[15px]">
            <span style={{ color: MUTED }}>{label}</span>
            <span className="flex items-center gap-3 text-right">
              <b style={{ color: "#222" }}>{value}</b>
              <button type="button" className="text-sm underline" style={{ color: NAVY }} onClick={() => setEditing((e) => ({ ...e, [k]: true }))}>Change</button>
            </span>
          </div>
        ))}
      </div>
    );
  };

  const incomeLabel = INCOME_SOURCES.find((o) => o.value === form.income_source)?.label ?? "";
  const timeLabel: Record<string, string> = { under_1: "Under 1 year", "1_2": "1–2 years", "2_5": "2–5 years", "5_plus": "5+ years" };

  return (
    <Shell>
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2 text-sm" style={{ color: MUTED }}>
          {idx > 0 ? <button type="button" onClick={() => goTo(STEPS[idx - 1].key)} className="font-medium py-2 pr-3" style={{ color: NAVY }}>← Back</button> : <span />}
          <span aria-live="polite">Step {idx + 1} of {STEPS.length} · {STEPS[idx].label}</span>
        </div>
        <div className="h-1.5 rounded-full" style={{ backgroundColor: BORDER }}>
          <div className="h-1.5 rounded-full transition-all duration-300" style={{ width: `${Math.max(pct, 6)}%`, backgroundColor: NAVY }} />
        </div>
      </div>
      {homeCard}

      <div key={step} className="view-step">
        <h1 ref={headingRef} tabIndex={-1} className="text-2xl sm:text-3xl font-bold mb-5 outline-none leading-tight" style={heading}>{STEPS[idx].label}</h1>

        {step === "you" && (
          <div className="grid gap-7">
            {knownCard([
              ["tenant_name", "Name", form.tenant_name], ["tenant_email", "Email", form.tenant_email], ["tenant_phone", "Phone", form.tenant_phone],
              ["move_in_date", "Move-in", form.move_in_date ? fmtDate(form.move_in_date) : ""], ["occupants", "People", form.occupants],
              ["has_pets", "Pets", form.has_pets === "yes" ? form.pets || "Yes" : "None"], ["smokes", "Smoking", form.smokes === "yes" ? "Yes" : "No"],
              ["vehicles", "Vehicles", form.vehicles === "0" ? "None" : form.vehicles === "2" ? "2+" : form.vehicles],
            ])}
            {ask("tenant_name") && <Text id="tenant_name" label="Full legal name" sub="As it appears on your ID." autoComplete="name" value={form.tenant_name} onChange={(v) => set("tenant_name", v)} error={errors.tenant_name} />}
            {ask("tenant_email") && <Text id="tenant_email" label="Email" type="email" autoComplete="email" value={form.tenant_email} onChange={(v) => set("tenant_email", v)} error={errors.tenant_email} />}
            {ask("tenant_phone") && <Text id="tenant_phone" label="Phone" type="tel" autoComplete="tel" value={form.tenant_phone} onChange={(v) => set("tenant_phone", v)} error={errors.tenant_phone} />}
            <Text id="tenant_dob" label="Date of birth (optional)" sub="Used only to confirm your identity on the screening." type="date" value={form.tenant_dob} onChange={(v) => set("tenant_dob", v)} />
            {ask("move_in_date") && <Text id="move_in_date" label="When would you like to move in?" type="date" min={torontoToday()} value={form.move_in_date} onChange={(v) => set("move_in_date", v)} error={errors.move_in_date} />}
            {ask("occupants") && (
              <Question id="occupants" title="How many people will live there?" sub="Everyone, including you and any kids." error={errors.occupants}>
                <div className="grid grid-cols-6 gap-2">
                  {["1", "2", "3", "4", "5", "6"].map((n) => <Choice key={n} compact selected={form.occupants === n} onClick={() => set("occupants", n)}>{n === "6" ? "6+" : n}</Choice>)}
                </div>
              </Question>
            )}
            {people > 1 && (
              <Question id="co_applicants" title="Other adults on the lease" sub="Each adult who'll sign. They don't fill out a separate form." error={errors.co_applicants}>
                <div className="grid gap-3">
                  {form.co_applicants.map((c, i) => (
                    <div key={i} className="rounded-xl border-2 bg-white p-4 grid gap-2" style={{ borderColor: BORDER }}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold" style={{ color: NAVY }}>Person {i + 2}</span>
                        <button type="button" onClick={() => set("co_applicants", form.co_applicants.filter((_, j) => j !== i))} className="text-sm underline" style={{ color: MUTED }}>Remove</button>
                      </div>
                      <Input placeholder="Full name" value={c.name} onChange={(e) => set("co_applicants", form.co_applicants.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                      <div className="grid grid-cols-2 gap-2">
                        <Input type="email" placeholder="Email" value={c.email} onChange={(e) => set("co_applicants", form.co_applicants.map((x, j) => (j === i ? { ...x, email: e.target.value } : x)))} />
                        <Input type="tel" placeholder="Phone" value={c.phone} onChange={(e) => set("co_applicants", form.co_applicants.map((x, j) => (j === i ? { ...x, phone: e.target.value } : x)))} />
                      </div>
                    </div>
                  ))}
                  {form.co_applicants.length < people - 1 && (
                    <button type="button" onClick={() => set("co_applicants", [...form.co_applicants, { name: "", email: "", phone: "" }])}
                      className="w-full min-h-[48px] rounded-xl border-2 border-dashed bg-white text-[15px] font-semibold" style={{ borderColor: BORDER, color: NAVY }}>+ Add an adult</button>
                  )}
                </div>
              </Question>
            )}
            {ask("has_pets") && (
              <Question id="has_pets" title="Any pets?" error={errors.has_pets}>
                <div className="grid grid-cols-2 gap-2">
                  <Choice compact selected={form.has_pets === "no"} onClick={() => set("has_pets", "no")}>No</Choice>
                  <Choice compact selected={form.has_pets === "yes"} onClick={() => set("has_pets", "yes")}>Yes</Choice>
                </div>
              </Question>
            )}
            {form.has_pets === "yes" && ask("pets") && (
              <Question id="pets" title="What kind, and how many?" error={errors.pets} followUp>
                <Input value={form.pets} onChange={(e) => set("pets", e.target.value)} placeholder="e.g. one cat, 4 years old" />
              </Question>
            )}
            {ask("smokes") && (
              <Question id="smokes" title="Does anyone who'll live there smoke or vape?" error={errors.smokes}>
                <div className="grid grid-cols-2 gap-2">
                  <Choice compact selected={form.smokes === "no"} onClick={() => set("smokes", "no")}>No</Choice>
                  <Choice compact selected={form.smokes === "yes"} onClick={() => set("smokes", "yes")}>Yes</Choice>
                </div>
              </Question>
            )}
            {ask("vehicles") && (
              <Question id="vehicles" title="How many vehicles?">
                <div className="grid grid-cols-3 gap-2">
                  {[["0", "None"], ["1", "1"], ["2", "2+"]].map(([v, l]) => <Choice key={v} compact selected={form.vehicles === v} onClick={() => set("vehicles", v)}>{l}</Choice>)}
                </div>
              </Question>
            )}
          </div>
        )}

        {step === "work" && (
          <div className="grid gap-7">
            {knownCard([["income_source", "Income", incomeLabel]])}
            {ask("income_source") && (
              <Question id="income_source" title="Where does your income come from?" error={errors.income_source}>
                <div className="grid gap-2">
                  {INCOME_SOURCES.map((o) => <Choice key={o.value} selected={form.income_source === o.value} hint={o.hint} onClick={() => set("income_source", o.value)}>{o.label}</Choice>)}
                </div>
              </Question>
            )}
            {(form.income_source === "employed" || form.income_source === "self_employed") && (
              <>
                <Text id="employer_name" label={form.income_source === "employed" ? "Employer" : "Business name (optional)"} value={form.employer_name} onChange={(v) => set("employer_name", v)} error={errors.employer_name} />
                <Text id="employer_position" label={form.income_source === "employed" ? "Your job title" : "What you do"} value={form.employer_position} onChange={(v) => set("employer_position", v)} />
                <Text id="employment_start" label={form.income_source === "employed" ? "Start date" : "Doing this since"} type="date" value={form.employment_start} onChange={(v) => set("employment_start", v)} />
              </>
            )}
            {form.income_source === "student" && <Text id="employer_name" label="School and program" placeholder="e.g. Western, Nursing" value={form.employer_name} onChange={(v) => set("employer_name", v)} />}
            {(form.income_source === "other" || form.income_source === "student") && (
              <Text id="income_notes" label={form.income_source === "student" ? "How will rent be paid?" : "Where does it come from?"} placeholder={form.income_source === "student" ? "OSAP, part-time job, family, a co-signer" : "e.g. ODSP, EI, child support"} value={form.income_notes} onChange={(v) => set("income_notes", v)} error={errors.income_notes} />
            )}
            <Question id="monthly_income" title="Monthly income, before tax" sub={`Count every source.${form.co_applicants.length ? " Just yours." : ""} Rent here is $${property.price.toLocaleString()}.`} error={errors.monthly_income}>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base" style={{ color: MUTED }}>$</span>
                <Input type="number" inputMode="numeric" className="pl-8" value={form.monthly_income} onChange={(e) => set("monthly_income", e.target.value)} invalid={!!errors.monthly_income} />
              </div>
            </Question>
            {form.income_source === "employed" && (
              <Question id="employer_ref" title="Someone at work we can call" sub="Your manager or HR. You gave them a heads-up, right? Then they'll pick up.">
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Name" value={form.employer_ref_name} onChange={(e) => set("employer_ref_name", e.target.value)} />
                  <Input type="tel" placeholder="Phone" value={form.employer_ref_phone} onChange={(e) => set("employer_ref_phone", e.target.value)} />
                </div>
              </Question>
            )}
          </div>
        )}

        {step === "home" && (
          <div className="grid gap-7">
            {knownCard([["rents_now", "Renting now", form.rents_now === "yes" ? "Yes" : "No"], ["time_at_address", "Time there", timeLabel[form.time_at_address] ?? ""], ["reason_for_moving", "Why you're moving", form.reason_for_moving]])}
            {ask("rents_now") && (
              <Question id="rents_now" title="Do you rent your current place?" error={errors.rents_now}>
                <div className="grid grid-cols-2 gap-2">
                  <Choice compact selected={form.rents_now === "yes"} onClick={() => set("rents_now", "yes")}>Yes, I rent</Choice>
                  <Choice compact selected={form.rents_now === "no"} onClick={() => set("rents_now", "no")}>No</Choice>
                </div>
              </Question>
            )}
            <Text id="current_address" label="Current address" autoComplete="street-address" value={form.current_address} onChange={(v) => set("current_address", v)} error={errors.current_address} />
            {ask("time_at_address") && (
              <Question id="time_at_address" title="How long have you lived there?" error={errors.time_at_address}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(timeLabel).map(([v, l]) => <Choice key={v} compact selected={form.time_at_address === v} onClick={() => set("time_at_address", v)}>{l}</Choice>)}
                </div>
              </Question>
            )}
            {form.rents_now === "yes" && (
              <>
                <Question id="current_rent" title="What do you pay now each month?">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base" style={{ color: MUTED }}>$</span>
                    <Input type="number" inputMode="numeric" className="pl-8" value={form.current_rent} onChange={(e) => set("current_rent", e.target.value)} />
                  </div>
                </Question>
                <Question id="landlord_ref" title="Your current landlord" sub="Since you texted them, they'll know who's calling. A phone or email is enough." error={errors.landlord_ref}>
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
            {ask("reason_for_moving") && (
              <Question id="reason_for_moving" title="Why are you moving? (optional)">
                <Input value={form.reason_for_moving} onChange={(e) => set("reason_for_moving", e.target.value)} placeholder="e.g. need more space, new job nearby" />
              </Question>
            )}
          </div>
        )}

        {step === "docs" && (
          <div className="grid gap-7">
            <p className="text-base -mt-2" style={{ color: "#333" }}>Last step. PDFs and phone photos both work. Your documents are stored privately and only used for this application.</p>
            <Question id="doc_option" title="How would you like to show your income?" sub="Everyone sends photo ID, plus one of these.">
              <div className="grid gap-2">
                {DOC_OPTIONS.map((o) => (
                  <button key={o.value} type="button" aria-pressed={docOption === o.value} onClick={() => { setDocOption(o.value); setErrors((e) => ({ ...e, docs: "" })); }}
                    className="w-full text-left min-h-[56px] px-5 py-4 border-2 rounded-xl transition-colors"
                    style={{ borderColor: docOption === o.value ? NAVY : BORDER, backgroundColor: docOption === o.value ? NAVY : "#FFFFFF", color: docOption === o.value ? "#FAF8F5" : NAVY }}>
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-base font-semibold">{o.label}</span>
                      {o.value === "bank" && <span className="text-xs font-semibold px-2 py-1 rounded-full shrink-0" style={{ backgroundColor: docOption === o.value ? "rgba(250,248,245,0.15)" : "#F7F5F2", color: docOption === o.value ? "#FAF8F5" : NAVY }}>Quickest</span>}
                    </span>
                    <span className="block text-sm mt-1" style={{ color: docOption === o.value ? "rgba(250,248,245,0.8)" : MUTED }}>{o.hint} {o.time}.</span>
                  </button>
                ))}
              </div>
            </Question>
            <div id="q-docs">
              {optionSlots(docOption).map((slot) => (
                <DocUploadSlot key={slot.type} slot={slot} files={docs[slot.type] ?? []} onChange={(files) => { setDocs((d) => ({ ...d, [slot.type]: files })); setErrors((e) => ({ ...e, docs: "" })); }} />
              ))}
              {errors.docs && <Err>{errors.docs}</Err>}
            </div>
            <div id="q-consent">
              <label className="flex gap-3 items-start cursor-pointer rounded-xl border-2 bg-white p-4" style={{ borderColor: errors.consent ? BURGUNDY : BORDER }}>
                <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setErrors((x) => ({ ...x, consent: "" })); }} className="mt-1 w-5 h-5 shrink-0" style={{ accentColor: NAVY }} />
                <span className="text-sm leading-relaxed" style={{ color: "#333" }}>
                  Everything I&apos;ve shared is true. I give Prospera Properties permission to review my application and documents, share a summary with the owner, and contact my references. Software helps organize my file, and a person makes every decision.
                </span>
              </label>
              {errors.consent && <Err>{errors.consent}</Err>}
            </div>
            {formError && <div role="alert" className="rounded-lg border px-4 py-3 text-sm bg-white" style={{ borderColor: BURGUNDY, color: BURGUNDY }}>{formError}</div>}
          </div>
        )}

        <div className="mt-9">
          {step === "docs"
            ? <Next onClick={submit} disabled={submitting}>{submitting ? "Sending…" : "Send my application"}</Next>
            : <Next onClick={next}>Continue</Next>}
          <p className="text-sm text-center mt-3" style={{ color: MUTED }}>
            {step === "docs" ? "Complete applications are reviewed first." : "Saved on this device. You can close this and come back to the same link."}
          </p>
        </div>
      </div>
    </Shell>
  );
}
