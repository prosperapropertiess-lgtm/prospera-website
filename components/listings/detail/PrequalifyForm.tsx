"use client";
import { useState } from "react";
import type { PropertyRecord } from "./ListingPage";

const inputCls = "w-full px-4 py-3 border border-[#D8D2C8] rounded-lg text-sm text-[#222222] bg-[#F7F5F2] outline-none focus:border-[#1F2F3A] transition-colors";

type Step = "contact" | "timing" | "fit" | "docs" | "result";
type Outcome = "qualified" | "waitlist" | "disqualified";

interface Props {
  property: PropertyRecord;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PrequalifyForm({ property, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>("contact");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    move_in_date: "",
    rent_ok: null as boolean | null,
    num_occupants: "1",
    ok_bank_statements: null as boolean | null,
    ok_credit_check: null as boolean | null,
    ok_landlord_reference: null as boolean | null,
    ok_employment_verification: null as boolean | null,
  });

  function set(key: string, value: string | boolean | null) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Determine if move-in date is late (property available before their date)
  function isLateMovein(): boolean {
    if (!form.move_in_date || !property.available_date) return false;
    return new Date(form.move_in_date) > new Date(property.available_date as string);
  }

  // Check if all doc requirements are met
  function allDocsOk(): boolean {
    return form.ok_bank_statements === true &&
      form.ok_credit_check === true &&
      form.ok_landlord_reference === true &&
      form.ok_employment_verification === true;
  }

  function determineOutcome(): Outcome {
    // If rent isn't ok for them, disqualify
    if (form.rent_ok === false) return "disqualified";
    // If they won't provide docs, disqualify
    if (!allDocsOk()) return "disqualified";
    // If move-in is later than available date, waitlist
    if (isLateMovein()) return "waitlist";
    // Otherwise qualified
    return "qualified";
  }

  async function handleSubmit(finalOutcome: Outcome) {
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/listings/prequalify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        property_id: property.id,
        full_name: `${form.first_name} ${form.last_name}`.trim(),
        email: form.email,
        phone: form.phone,
        move_in_date: form.move_in_date || null,
        num_occupants: Number(form.num_occupants) || 1,
        rent_ok: form.rent_ok,
        docs_agreed: allDocsOk(),
        outcome: finalOutcome,
        late_movein: isLateMovein(),
      }),
    });

    if (res.ok) {
      setOutcome(finalOutcome);
      setStep("result");
      if (finalOutcome === "qualified") {
        onSuccess();
      }
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong. Please try again.");
    }
    setSubmitting(false);
  }

  function goToDocs() {
    if (!form.first_name || !form.last_name || !form.email || !form.phone) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setStep("timing");
  }

  function goToFit() {
    setError("");
    setStep("fit");
  }

  function goToDocsStep() {
    if (form.rent_ok === null) {
      setError("Please answer the rent question.");
      return;
    }
    // If rent isn't ok, skip to submit — still collect their info
    if (form.rent_ok === false) {
      handleSubmit("disqualified");
      return;
    }
    setError("");
    setStep("docs");
  }

  function handleDocsSubmit() {
    const result = determineOutcome();
    handleSubmit(result);
  }

  const availableDateStr = property.available_date
    ? new Date(property.available_date as string).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" })
    : null;

  const stepNum = step === "contact" ? 1 : step === "timing" ? 2 : step === "fit" ? 3 : step === "docs" ? 4 : 0;
  const totalSteps = 4;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        {step !== "result" && (
          <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid #D8D2C8" }}>
            <div>
              <h2 className="text-xl font-bold" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
                Pre-Qualify for a Viewing
              </h2>
              <p className="text-xs mt-1" style={{ color: "#666666" }}>
                Step {stepNum} of {totalSteps}. Takes under 2 minutes
              </p>
            </div>
            <button onClick={onClose} className="text-xl leading-none" style={{ color: "#666666" }}>×</button>
          </div>
        )}

        {/* Progress bar */}
        {step !== "result" && (
          <div className="px-6 pt-4">
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div key={i} className="h-1 flex-1 rounded-full transition-all" style={{ backgroundColor: i < stepNum ? "#8B2030" : "#D8D2C8" }} />
              ))}
            </div>
          </div>
        )}

        <div className="px-6 py-6 space-y-5">

          {/* ─── STEP 1: Contact Info ─── */}
          {step === "contact" && (
            <>
              <p className="text-sm leading-relaxed" style={{ color: "#333333" }}>
                Let&apos;s start with your contact details. This helps us reach out whether you qualify now or later.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <Field label="First Name" required>
                  <input type="text" value={form.first_name} onChange={(e) => set("first_name", e.target.value)} placeholder="First name" className={inputCls} />
                </Field>
                <Field label="Last Name" required>
                  <input type="text" value={form.last_name} onChange={(e) => set("last_name", e.target.value)} placeholder="Last name" className={inputCls} />
                </Field>
              </div>
              <Field label="Email" required>
                <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" className={inputCls} />
              </Field>
              <Field label="Phone" required>
                <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(519) 000-0000" className={inputCls} />
              </Field>
            </>
          )}

          {/* ─── STEP 2: Move-in Timing ─── */}
          {step === "timing" && (
            <>
              {availableDateStr && (
                <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: "#F7F5F2", border: "1px solid #D8D2C8", color: "#1F2F3A" }}>
                  This property is available <strong>{availableDateStr}</strong>.
                </div>
              )}

              <Field label="When would you like to move in?">
                <input type="date" value={form.move_in_date} onChange={(e) => set("move_in_date", e.target.value)} className={inputCls} />
              </Field>

              {isLateMovein() && (
                <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.3)", color: "#92400e" }}>
                  We&apos;re looking to fill this property for {availableDateStr}. There&apos;s strong interest right now, but if we don&apos;t find someone for that date, you&apos;ll be first on our list. Let&apos;s keep going.
                </div>
              )}

              <Field label="How many people would be moving in?">
                <input type="number" value={form.num_occupants} onChange={(e) => set("num_occupants", e.target.value)} min={1} className={inputCls} />
              </Field>
            </>
          )}

          {/* ─── STEP 3: Rent Fit ─── */}
          {step === "fit" && (
            <>
              <div className="text-center py-4">
                <p className="text-3xl font-bold" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
                  ${property.price?.toLocaleString()}<span className="text-base font-normal" style={{ color: "#666666" }}>/mo</span>
                </p>
                <p className="text-sm mt-2" style={{ color: "#333333" }}>
                  {property.bedrooms} bed · {property.bathrooms} bath · {property.address}, {property.city}
                </p>
              </div>

              <p className="text-sm text-center" style={{ color: "#333333" }}>
                Is this rent within your budget?
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => set("rent_ok", true)}
                  className="flex-1 py-4 rounded-xl text-sm font-medium transition-all"
                  style={{
                    backgroundColor: form.rent_ok === true ? "rgba(34,197,94,0.1)" : "#F7F5F2",
                    border: `2px solid ${form.rent_ok === true ? "#22c55e" : "#D8D2C8"}`,
                    color: form.rent_ok === true ? "#15803d" : "#333333",
                  }}
                >
                  Yes, this works
                </button>
                <button
                  type="button"
                  onClick={() => set("rent_ok", false)}
                  className="flex-1 py-4 rounded-xl text-sm font-medium transition-all"
                  style={{
                    backgroundColor: form.rent_ok === false ? "rgba(239,68,68,0.08)" : "#F7F5F2",
                    border: `2px solid ${form.rent_ok === false ? "#ef4444" : "#D8D2C8"}`,
                    color: form.rent_ok === false ? "#dc2626" : "#333333",
                  }}
                >
                  Not quite
                </button>
              </div>
            </>
          )}

          {/* ─── STEP 4: Document Requirements ─── */}
          {step === "docs" && (
            <>
              <p className="text-sm leading-relaxed" style={{ color: "#333333" }}>
                To move forward with a viewing, we ask all prospective tenants to be ready to provide:
              </p>

              <div className="space-y-3">
                <DocCheck
                  label="6 months of bank statements"
                  checked={form.ok_bank_statements}
                  onChange={(v) => set("ok_bank_statements", v)}
                />
                <DocCheck
                  label="Soft credit check (we'll send you a link)"
                  checked={form.ok_credit_check}
                  onChange={(v) => set("ok_credit_check", v)}
                />
                <DocCheck
                  label="Previous landlord reference"
                  checked={form.ok_landlord_reference}
                  onChange={(v) => set("ok_landlord_reference", v)}
                />
                <DocCheck
                  label="Employment verification (letter or pay stubs)"
                  checked={form.ok_employment_verification}
                  onChange={(v) => set("ok_employment_verification", v)}
                />
              </div>

              {!allDocsOk() && form.ok_bank_statements !== null && (
                <p className="text-xs leading-relaxed" style={{ color: "#666666" }}>
                  These documents help us ensure a smooth move-in for everyone. If you can&apos;t provide all of them right now, we&apos;ll still keep you in our system for future opportunities.
                </p>
              )}
            </>
          )}

          {/* ─── RESULT ─── */}
          {step === "result" && outcome === "qualified" && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl" style={{ backgroundColor: "rgba(34,197,94,0.1)" }}>
                ✓
              </div>
              <h2 className="text-2xl font-bold" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
                You&apos;re pre-qualified!
              </h2>
              <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: "#333333" }}>
                We&apos;ll be in touch within 24 hours to schedule your viewing. Check your email at <strong>{form.email}</strong>.
              </p>
              <a
                href={`/contact?property=${encodeURIComponent(property.title)}&prequalified=true&name=${encodeURIComponent(form.first_name)}`}
                className="inline-block px-8 py-3 text-xs font-semibold uppercase tracking-widest rounded-lg transition-opacity hover:opacity-80"
                style={{ backgroundColor: "#8B2030", color: "#FAF8F5" }}
              >
                Book a Viewing Now
              </a>
            </div>
          )}

          {step === "result" && outcome === "waitlist" && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl" style={{ backgroundColor: "rgba(251,191,36,0.1)" }}>
                ⏳
              </div>
              <h2 className="text-2xl font-bold" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
                You&apos;re on our list
              </h2>
              <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: "#333333" }}>
                There&apos;s strong interest for the {availableDateStr} move-in date. If it doesn&apos;t fill, we&apos;ll reach out to you first. We also have new listings coming regularly, we&apos;ll keep you posted.
              </p>
              <p className="text-xs" style={{ color: "#666666" }}>We&apos;ll email you at <strong>{form.email}</strong></p>
            </div>
          )}

          {step === "result" && outcome === "disqualified" && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl" style={{ backgroundColor: "rgba(239,68,68,0.06)" }}>
                📋
              </div>
              <h2 className="text-2xl font-bold" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
                Thanks for your interest
              </h2>
              <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: "#333333" }}>
                This particular property may not be the right fit right now, but we add new listings regularly. We&apos;ve saved your info and will reach out when something matches.
              </p>
              <p className="text-xs" style={{ color: "#666666" }}>We&apos;ll email you at <strong>{form.email}</strong></p>
            </div>
          )}

          {error && (
            <p className="text-sm px-4 py-3 rounded-lg" style={{ backgroundColor: "rgba(139,32,48,0.08)", color: "#8B2030" }}>{error}</p>
          )}
        </div>

        {/* Footer / Navigation */}
        {step !== "result" && (
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: "1px solid #D8D2C8" }}>
            {step === "contact" ? (
              <>
                <button onClick={onClose} className="text-sm" style={{ color: "#666666" }}>Cancel</button>
                <button onClick={goToDocs} className="px-6 py-3 text-xs font-semibold uppercase tracking-widest rounded-lg transition-opacity hover:opacity-80" style={{ backgroundColor: "#8B2030", color: "#FAF8F5" }}>
                  Next
                </button>
              </>
            ) : step === "timing" ? (
              <>
                <button onClick={() => setStep("contact")} className="text-sm" style={{ color: "#666666" }}>← Back</button>
                <button onClick={goToFit} className="px-6 py-3 text-xs font-semibold uppercase tracking-widest rounded-lg transition-opacity hover:opacity-80" style={{ backgroundColor: "#8B2030", color: "#FAF8F5" }}>
                  Next
                </button>
              </>
            ) : step === "fit" ? (
              <>
                <button onClick={() => setStep("timing")} className="text-sm" style={{ color: "#666666" }}>← Back</button>
                <button onClick={goToDocsStep} disabled={form.rent_ok === null} className="px-6 py-3 text-xs font-semibold uppercase tracking-widest rounded-lg transition-opacity hover:opacity-80 disabled:opacity-40" style={{ backgroundColor: "#8B2030", color: "#FAF8F5" }}>
                  {form.rent_ok === false ? "Submit" : "Next"}
                </button>
              </>
            ) : step === "docs" ? (
              <>
                <button onClick={() => setStep("fit")} className="text-sm" style={{ color: "#666666" }}>← Back</button>
                <button onClick={handleDocsSubmit} disabled={submitting} className="px-6 py-3 text-xs font-semibold uppercase tracking-widest rounded-lg transition-opacity hover:opacity-80 disabled:opacity-50" style={{ backgroundColor: "#8B2030", color: "#FAF8F5" }}>
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </>
            ) : null}
          </div>
        )}

        {/* Close button on result */}
        {step === "result" && (
          <div className="px-6 py-4 text-center" style={{ borderTop: "1px solid #D8D2C8" }}>
            <button onClick={onClose} className="text-sm" style={{ color: "#666666" }}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest mb-2 font-medium" style={{ color: "#333333" }}>
        {label}{required && <span className="ml-0.5" style={{ color: "#8B2030" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function DocCheck({ label, checked, onChange }: { label: string; checked: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3.5 rounded-xl cursor-pointer transition-all"
      style={{
        backgroundColor: checked === true ? "rgba(34,197,94,0.06)" : checked === false ? "rgba(239,68,68,0.04)" : "#F7F5F2",
        border: `1px solid ${checked === true ? "rgba(34,197,94,0.3)" : checked === false ? "rgba(239,68,68,0.2)" : "#D8D2C8"}`,
      }}
    >
      <span className="text-sm pr-4" style={{ color: "#222222" }}>{label}</span>
      <div className="flex gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={() => onChange(true)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{
            backgroundColor: checked === true ? "#22c55e" : "transparent",
            color: checked === true ? "#fff" : "#666666",
            border: `1px solid ${checked === true ? "#22c55e" : "#D8D2C8"}`,
          }}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{
            backgroundColor: checked === false ? "#ef4444" : "transparent",
            color: checked === false ? "#fff" : "#666666",
            border: `1px solid ${checked === false ? "#ef4444" : "#D8D2C8"}`,
          }}
        >
          No
        </button>
      </div>
    </div>
  );
}
