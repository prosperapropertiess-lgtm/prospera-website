"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import DocUploadSlot, { type UploadedFile } from "@/components/apply/DocUploadSlot";
import {
  INCOME_SOURCES,
  docSlotsFor,
  missingDocs,
  type DocType,
  type IncomeSource,
} from "@/lib/application-requirements";

const STEPS = ["You & the move", "Income", "Where you live now", "Documents"];
const TOTAL = STEPS.length;
const FONT = "var(--font-dm-sans)";
const HEADING = "var(--font-cormorant)";

interface Property {
  address: string; city: string; price: number; bedrooms: number; bathrooms: number;
  utilities_included?: boolean; available_date?: string | null;
}

interface CoApplicant { name: string; email: string; phone: string }

const EMPTY_FORM = {
  tenant_name: "", tenant_email: "", tenant_phone: "",
  move_in_date: "", occupants: "1", co_applicants: [] as CoApplicant[],
  has_pets: "", pets: "", smokes: "", vehicles: "0",
  income_source: "" as IncomeSource | "",
  employer_name: "", employer_position: "", employment_type: "", employment_start: "",
  monthly_income: "", income_notes: "", employer_ref_name: "", employer_ref_phone: "",
  rents_now: "", current_address: "", time_at_address: "", current_rent: "",
  landlord_ref_name: "", landlord_ref_phone: "", landlord_ref_email: "",
  reason_for_moving: "",
};

type Form = typeof EMPTY_FORM;
type Docs = Partial<Record<DocType, UploadedFile[]>>;

function formatMoveIn(dateStr?: string | null): string {
  if (!dateStr) return "Flexible";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "13px 14px", border: "1px solid #D8D2C8", borderRadius: 8,
  fontSize: 16, color: "#222222", fontFamily: FONT, outline: "none",
  backgroundColor: "#FFFFFF", boxSizing: "border-box",
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 15, fontWeight: 600, color: "#222222", fontFamily: FONT, marginBottom: hint ? 2 : 6 }}>
        {label}
      </label>
      {hint && <p style={{ margin: "0 0 6px", fontSize: 14, color: "#666666", fontFamily: FONT }}>{hint}</p>}
      {children}
    </div>
  );
}

function Choice({ options, value, onChange }: {
  options: { value: string; label: string; hint?: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const stacked = options.some((o) => o.hint);
  return (
    <div style={{ display: stacked ? "grid" : "flex", gap: 8, flexWrap: "wrap" }}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            style={{
              flex: stacked ? undefined : 1, minWidth: stacked ? undefined : 90, textAlign: stacked ? "left" : "center",
              padding: stacked ? "14px 16px" : "12px 14px", borderRadius: 8, cursor: "pointer", fontFamily: FONT,
              border: `1px solid ${active ? "#1F2F3A" : "#D8D2C8"}`,
              backgroundColor: active ? "#1F2F3A" : "#FFFFFF",
              color: active ? "#FAF8F5" : "#222222",
            }}
          >
            <span style={{ display: "block", fontSize: 15, fontWeight: 600 }}>{o.label}</span>
            {o.hint && (
              <span style={{ display: "block", fontSize: 13, marginTop: 2, color: active ? "rgba(250,248,245,0.75)" : "#666666" }}>{o.hint}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

const YES_NO = [{ value: "no", label: "No" }, { value: "yes", label: "Yes" }];

export default function ApplyPage({ params }: { params: Promise<{ agentId: string; propertyId: string }> }) {
  const { agentId, propertyId } = use(params);
  const router = useRouter();

  const [property, setProperty] = useState<Property | null>(null);
  const [loadError, setLoadError] = useState("");
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [stepError, setStepError] = useState("");
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [docs, setDocs] = useState<Docs>({});
  const [consent, setConsent] = useState(false);
  const [resumed, setResumed] = useState(false);

  const DRAFT_KEY = `apply_draft_v2_${agentId}_${propertyId}`;

  function set<K extends keyof Form>(field: K, value: Form[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setStepError("");
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
      if (draft.form) setForm({ ...EMPTY_FORM, ...draft.form });
      if (draft.docs) setDocs(draft.docs);
      if (draft.step) setStep(draft.step);
      setResumed(true);
    } catch {
      // Private browsing or corrupted draft — start fresh.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, docs, step }));
    } catch {
      // Storage full or unavailable — not worth interrupting the applicant over.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, docs, step]);

  // Keep one co-applicant row per extra adult the applicant says will be on the lease.
  function setCoApplicant(i: number, field: keyof CoApplicant, value: string) {
    const next = [...form.co_applicants];
    next[i] = { ...next[i], [field]: value };
    set("co_applicants", next);
  }

  const flatDocs = Object.entries(docs).flatMap(([doc_type, files]) =>
    (files ?? []).map((f) => ({ doc_type, storage_path: f.path })),
  );

  function stepProblem(): string | null {
    const f = form;
    if (step === 1) {
      if (!f.tenant_name.trim()) return "Please enter your full name.";
      if (!f.tenant_email.includes("@")) return "Please enter a valid email.";
      if (f.tenant_phone.replace(/\D/g, "").length < 10) return "Please enter a phone number we can reach you at.";
      if (!f.move_in_date) return "When would you like to move in?";
      if (!(Number(f.occupants) >= 1)) return "How many people will live there?";
      if (f.co_applicants.some((c) => !c.name.trim() || !c.email.includes("@"))) return "Please add a name and email for each other adult on the lease, or remove them.";
      if (!f.has_pets) return "Do you have any pets?";
      if (f.has_pets === "yes" && !f.pets.trim()) return "Tell us what pets you have.";
      if (!f.smokes) return "Does anyone who'll live there smoke?";
    }
    if (step === 2) {
      if (!f.income_source) return "How do you earn your income?";
      if (f.income_source === "employed" && !f.employer_name.trim()) return "Where do you work?";
      if (f.income_source === "other" && !f.income_notes.trim()) return "Where does your income come from?";
      if (!(Number(f.monthly_income) > 0)) return "About how much do you bring in each month, before tax?";
    }
    if (step === 3) {
      if (!f.rents_now) return "Do you rent your current place?";
      if (!f.current_address.trim()) return "What's your current address?";
      if (!f.time_at_address) return "How long have you lived there?";
      if (f.rents_now === "yes" && !f.landlord_ref_name.trim()) return "What's your current landlord's name?";
      if (f.rents_now === "yes" && !f.landlord_ref_phone.trim() && !f.landlord_ref_email.includes("@")) return "Add a phone or email for your landlord.";
    }
    if (step === 4) {
      const missing = missingDocs(f.income_source, flatDocs);
      if (missing) return missing;
      if (!consent) return "Please check the box to confirm and give permission.";
    }
    return null;
  }

  function go(delta: 1 | -1) {
    if (delta === 1) {
      const problem = stepProblem();
      if (problem) { setStepError(problem); return; }
    }
    setStepError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep((s) => s + delta);
  }

  async function submit() {
    const problem = stepProblem();
    if (problem) { setStepError(problem); return; }
    setSubmitting(true);
    setStepError("");

    try {
      const res = await fetch("/api/applications/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, consent, agent_id: agentId, property_id: propertyId, documents: flatDocs }),
      });
      const json = await res.json();
      if (!res.ok) { setStepError(json.error ?? "Submission failed."); setSubmitting(false); return; }
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* not critical */ }
      router.push(`/apply/${agentId}/${propertyId}/submitted${json.application_id ? `?id=${json.application_id}` : ""}`);
    } catch {
      setStepError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F7F5F2", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <p style={{ fontSize: 30, fontWeight: 700, color: "#1F2F3A", fontFamily: HEADING, marginBottom: 12 }}>Link unavailable</p>
          <p style={{ fontSize: 16, color: "#666666", fontFamily: FONT }}>{loadError}</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F7F5F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#666666", fontFamily: FONT, fontSize: 15 }}>Loading...</p>
      </div>
    );
  }

  const income = form.income_source;
  const extraAdults = Math.max(0, Number(form.occupants) - 1);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F7F5F2" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#1F2F3A", padding: "24px 20px 20px", textAlign: "center" }}>
        <p style={{ margin: "0 0 4px", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(250,248,245,0.55)", fontFamily: FONT }}>
          Rental application
        </p>
        <h1 style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 700, color: "#FAF8F5", fontFamily: HEADING }}>{property.address}</h1>
        <p style={{ margin: 0, fontSize: 14, color: "rgba(250,248,245,0.75)", fontFamily: FONT }}>
          {property.city} · ${property.price.toLocaleString()}/mo{property.utilities_included ? " · utilities included" : " + utilities"} · Available {formatMoveIn(property.available_date)}
        </p>

        <div style={{ maxWidth: 560, margin: "20px auto 0", display: "flex", gap: 6 }}>
          {STEPS.map((label, i) => (
            <div key={label} style={{ flex: 1 }}>
              <div style={{ height: 3, borderRadius: 2, backgroundColor: i < step ? "#FAF8F5" : "rgba(250,248,245,0.18)" }} />
            </div>
          ))}
        </div>
        <p style={{ margin: "10px 0 0", fontSize: 13, color: "rgba(250,248,245,0.7)", fontFamily: FONT }}>
          Step {step} of {TOTAL} · About 5 minutes total
        </p>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "28px 20px 60px" }}>
        {resumed && (
          <div style={{
            backgroundColor: "rgba(45,122,79,0.06)", border: "1px solid rgba(45,122,79,0.18)", borderRadius: 8,
            padding: "10px 16px", marginBottom: 20, fontSize: 14, color: "#2D7A4F", fontFamily: FONT,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span>Picked up right where you left off.</span>
            <button onClick={() => setResumed(false)} aria-label="Dismiss" style={{ background: "none", border: "none", color: "#2D7A4F", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0 }}>×</button>
          </div>
        )}

        <h2 style={{ margin: "0 0 22px", fontSize: 26, fontWeight: 700, color: "#1F2F3A", fontFamily: HEADING }}>{STEPS[step - 1]}</h2>

        {/* Step 1 — You & the move */}
        {step === 1 && (
          <div>
            <Field label="Full name">
              <input style={inputStyle} value={form.tenant_name} onChange={(e) => set("tenant_name", e.target.value)} autoComplete="name" />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0 12px" }}>
              <Field label="Email">
                <input style={inputStyle} type="email" value={form.tenant_email} onChange={(e) => set("tenant_email", e.target.value)} autoComplete="email" />
              </Field>
              <Field label="Phone">
                <input style={inputStyle} type="tel" value={form.tenant_phone} onChange={(e) => set("tenant_phone", e.target.value)} autoComplete="tel" />
              </Field>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0 12px" }}>
              <Field label="When do you want to move in?">
                <input style={inputStyle} type="date" value={form.move_in_date} onChange={(e) => set("move_in_date", e.target.value)} />
              </Field>
              <Field label="People living there, including you">
                <select style={{ ...inputStyle, cursor: "pointer" }} value={form.occupants} onChange={(e) => {
                  const n = Number(e.target.value);
                  set("occupants", e.target.value);
                  // Drop co-applicant rows that no longer fit the new head count.
                  if (form.co_applicants.length > n - 1) set("co_applicants", form.co_applicants.slice(0, Math.max(0, n - 1)));
                }}>
                  {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}{n === 6 ? "+" : ""}</option>)}
                </select>
              </Field>
            </div>

            {extraAdults > 0 && (
              <Field label="Anyone else signing the lease?" hint="Add any other adults who'll be on the lease. They don't need to fill out their own form.">
                {form.co_applicants.map((c, i) => (
                  <div key={i} style={{ border: "1px solid #D8D2C8", borderRadius: 8, padding: 12, marginBottom: 10, backgroundColor: "#FFFFFF" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#222222", fontFamily: FONT }}>Person {i + 2}</span>
                      <button type="button" onClick={() => set("co_applicants", form.co_applicants.filter((_, j) => j !== i))}
                        style={{ background: "none", border: "none", color: "#666666", fontSize: 14, cursor: "pointer", fontFamily: FONT }}>Remove</button>
                    </div>
                    <input style={{ ...inputStyle, marginBottom: 8 }} placeholder="Full name" value={c.name} onChange={(e) => setCoApplicant(i, "name", e.target.value)} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <input style={inputStyle} type="email" placeholder="Email" value={c.email} onChange={(e) => setCoApplicant(i, "email", e.target.value)} />
                      <input style={inputStyle} type="tel" placeholder="Phone" value={c.phone} onChange={(e) => setCoApplicant(i, "phone", e.target.value)} />
                    </div>
                  </div>
                ))}
                {form.co_applicants.length < extraAdults && (
                  <button type="button" onClick={() => set("co_applicants", [...form.co_applicants, { name: "", email: "", phone: "" }])}
                    style={{ width: "100%", padding: 12, border: "1px dashed #D8D2C8", borderRadius: 8, backgroundColor: "#FFFFFF", fontSize: 15, color: "#1F2F3A", cursor: "pointer", fontFamily: FONT }}>
                    + Add a person to the lease
                  </button>
                )}
              </Field>
            )}

            <Field label="Any pets?">
              <Choice options={YES_NO} value={form.has_pets} onChange={(v) => set("has_pets", v)} />
            </Field>
            {form.has_pets === "yes" && (
              <Field label="What kind, and how many?">
                <input style={inputStyle} value={form.pets} onChange={(e) => set("pets", e.target.value)} placeholder="e.g. one cat" />
              </Field>
            )}
            <Field label="Does anyone who'll live there smoke?">
              <Choice options={YES_NO} value={form.smokes} onChange={(v) => set("smokes", v)} />
            </Field>
            <Field label="How many vehicles?">
              <Choice options={[{ value: "0", label: "None" }, { value: "1", label: "1" }, { value: "2", label: "2+" }]} value={form.vehicles} onChange={(v) => set("vehicles", v)} />
            </Field>
          </div>
        )}

        {/* Step 2 — Income */}
        {step === 2 && (
          <div>
            <Field label="How do you earn your income?">
              <Choice options={INCOME_SOURCES} value={income} onChange={(v) => set("income_source", v as IncomeSource)} />
            </Field>

            {income === "employed" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0 12px" }}>
                  <Field label="Where do you work?">
                    <input style={inputStyle} value={form.employer_name} onChange={(e) => set("employer_name", e.target.value)} />
                  </Field>
                  <Field label="Your job title">
                    <input style={inputStyle} value={form.employer_position} onChange={(e) => set("employer_position", e.target.value)} />
                  </Field>
                </div>
                <Field label="Type of job">
                  <Choice
                    options={[{ value: "full_time", label: "Full-time" }, { value: "part_time", label: "Part-time" }, { value: "contract", label: "Contract" }]}
                    value={form.employment_type}
                    onChange={(v) => set("employment_type", v)}
                  />
                </Field>
                <Field label="When did you start?">
                  <input style={inputStyle} type="date" value={form.employment_start} onChange={(e) => set("employment_start", e.target.value)} />
                </Field>
              </>
            )}

            {income === "self_employed" && (
              <>
                <Field label="What do you do?" hint="e.g. electrician, Uber driver, run a cleaning business">
                  <input style={inputStyle} value={form.employer_position} onChange={(e) => set("employer_position", e.target.value)} />
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0 12px" }}>
                  <Field label="Business name (if any)">
                    <input style={inputStyle} value={form.employer_name} onChange={(e) => set("employer_name", e.target.value)} />
                  </Field>
                  <Field label="Doing this since">
                    <input style={inputStyle} type="date" value={form.employment_start} onChange={(e) => set("employment_start", e.target.value)} />
                  </Field>
                </div>
              </>
            )}

            {income === "student" && (
              <>
                <Field label="School and program">
                  <input style={inputStyle} value={form.employer_name} onChange={(e) => set("employer_name", e.target.value)} placeholder="e.g. Western, Nursing" />
                </Field>
                <Field label="How will rent be paid?" hint="OSAP, a part-time job, family, a co-signer — anything that applies.">
                  <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form.income_notes} onChange={(e) => set("income_notes", e.target.value)} />
                </Field>
              </>
            )}

            {income === "other" && (
              <Field label="Where does your income come from?">
                <input style={inputStyle} value={form.income_notes} onChange={(e) => set("income_notes", e.target.value)} placeholder="e.g. ODSP, EI, child support" />
              </Field>
            )}

            {income && (
              <Field label="About how much do you bring in each month?" hint={`Before tax. Count every source.${form.co_applicants.length ? " Just yours, not the other people on the lease." : ""}`}>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#666666", fontFamily: FONT, fontSize: 16 }}>$</span>
                  <input style={{ ...inputStyle, paddingLeft: 28 }} type="number" inputMode="numeric" value={form.monthly_income} onChange={(e) => set("monthly_income", e.target.value)} />
                </div>
              </Field>
            )}

            {income === "employed" && (
              <Field label="Someone at work we can call (optional)" hint="A manager or HR. Only if you're comfortable with it.">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <input style={inputStyle} placeholder="Name" value={form.employer_ref_name} onChange={(e) => set("employer_ref_name", e.target.value)} />
                  <input style={inputStyle} type="tel" placeholder="Phone" value={form.employer_ref_phone} onChange={(e) => set("employer_ref_phone", e.target.value)} />
                </div>
              </Field>
            )}
          </div>
        )}

        {/* Step 3 — Where you live now */}
        {step === 3 && (
          <div>
            <Field label="Do you rent your current place?">
              <Choice
                options={[{ value: "yes", label: "Yes, I rent" }, { value: "no", label: "No" }]}
                value={form.rents_now}
                onChange={(v) => set("rents_now", v)}
              />
            </Field>
            <Field label="Current address">
              <input style={inputStyle} value={form.current_address} onChange={(e) => set("current_address", e.target.value)} autoComplete="street-address" />
            </Field>
            <Field label="How long have you lived there?">
              <Choice
                options={[{ value: "under_1", label: "Under 1 yr" }, { value: "1_2", label: "1–2 yrs" }, { value: "2_5", label: "2–5 yrs" }, { value: "5_plus", label: "5+ yrs" }]}
                value={form.time_at_address}
                onChange={(v) => set("time_at_address", v)}
              />
            </Field>

            {form.rents_now === "yes" && (
              <>
                <Field label="What do you pay now each month?">
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#666666", fontFamily: FONT, fontSize: 16 }}>$</span>
                    <input style={{ ...inputStyle, paddingLeft: 28 }} type="number" inputMode="numeric" value={form.current_rent} onChange={(e) => set("current_rent", e.target.value)} />
                  </div>
                </Field>
                <Field label="Your current landlord" hint="We may reach out to them. A phone or email is enough.">
                  <input style={{ ...inputStyle, marginBottom: 8 }} placeholder="Name" value={form.landlord_ref_name} onChange={(e) => set("landlord_ref_name", e.target.value)} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <input style={inputStyle} type="tel" placeholder="Phone" value={form.landlord_ref_phone} onChange={(e) => set("landlord_ref_phone", e.target.value)} />
                    <input style={inputStyle} type="email" placeholder="Email" value={form.landlord_ref_email} onChange={(e) => set("landlord_ref_email", e.target.value)} />
                  </div>
                </Field>
              </>
            )}

            <Field label="Why are you moving? (optional)">
              <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form.reason_for_moving} onChange={(e) => set("reason_for_moving", e.target.value)} placeholder="e.g. need more space, new job closer to here" />
            </Field>
          </div>
        )}

        {/* Step 4 — Documents */}
        {step === 4 && (
          <div>
            <p style={{ margin: "0 0 22px", fontSize: 15, color: "#666666", fontFamily: FONT, lineHeight: 1.6 }}>
              PDFs and phone photos both work. Your documents are stored privately and only used to review this application.
            </p>
            {docSlotsFor(income).map((slot) => (
              <DocUploadSlot
                key={slot.type}
                slot={slot}
                files={docs[slot.type] ?? []}
                onChange={(files) => { setDocs((d) => ({ ...d, [slot.type]: files })); setStepError(""); }}
              />
            ))}

            <label style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: 16, border: "1px solid #D8D2C8", borderRadius: 8, backgroundColor: "#FFFFFF", cursor: "pointer" }}>
              <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setStepError(""); }} style={{ width: 20, height: 20, marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: "#222222", fontFamily: FONT, lineHeight: 1.55 }}>
                Everything I&apos;ve shared is true. I give Prospera Properties permission to review my application and documents, and to contact the references I listed. Software helps organize my file, and a person makes every decision.
              </span>
            </label>
          </div>
        )}

        {stepError && (
          <div style={{
            backgroundColor: "rgba(139,32,48,0.06)", border: "1px solid rgba(139,32,48,0.2)", borderRadius: 8,
            padding: "12px 16px", marginTop: 16, fontSize: 15, color: "#8B2030", fontFamily: FONT,
          }}>
            {stepError}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          {step > 1 && (
            <button onClick={() => go(-1)} style={{
              flex: 1, padding: 15, backgroundColor: "transparent", border: "1px solid #D8D2C8", borderRadius: 8,
              fontSize: 16, color: "#1F2F3A", fontFamily: FONT, cursor: "pointer",
            }}>
              Back
            </button>
          )}
          {step < TOTAL ? (
            <button onClick={() => go(1)} style={{
              flex: 2, padding: 15, backgroundColor: "#1F2F3A", border: "none", borderRadius: 8,
              fontSize: 16, color: "#FAF8F5", fontFamily: FONT, fontWeight: 600, cursor: "pointer",
            }}>
              Continue
            </button>
          ) : (
            <button onClick={submit} disabled={submitting} style={{
              flex: 2, padding: 15, backgroundColor: "#8B2030", border: "none", borderRadius: 8,
              fontSize: 16, color: "#FAF8F5", fontFamily: FONT, fontWeight: 600,
              cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1,
            }}>
              {submitting ? "Submitting..." : "Submit application"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
