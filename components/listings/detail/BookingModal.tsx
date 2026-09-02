"use client";
import { useState, useEffect, useMemo } from "react";
import type { PropertyRecord } from "./ListingPage";

const inputCls = "w-full px-4 py-3.5 border border-[#D8D2C8] rounded-lg text-base text-[#222222] bg-[#F7F5F2] outline-none focus:border-[#1F2F3A] transition-colors";

const TIME_SLOTS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

type Step = "pick" | "prequalify" | "not-a-fit" | "contact" | "confirmed";

interface Props {
  property: PropertyRecord;
  onClose: () => void;
  onSuccess: () => void;
}

interface DealbreakerQ {
  key: string;
  question: string;
}

function nextDays(count: number): Date[] {
  const out: Date[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    out.push(d);
  }
  return out;
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function timeLabel(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

// Don't offer a slot less than 2 hours from now
function isPast(date: Date, time: string): boolean {
  const [h, m] = time.split(":").map(Number);
  const slot = new Date(date);
  slot.setHours(h, m, 0, 0);
  return slot.getTime() < Date.now() + 2 * 60 * 60 * 1000;
}

// Pulls 1-3 dealbreaker questions from what's actually true about this property,
// the same fields that drive the "What's Included" section on the listing page.
function getDealbreakerQuestions(property: PropertyRecord): DealbreakerQ[] {
  const raw = property as Record<string, unknown>;
  const laundryType = raw.laundry_type as string | null;
  const qs: DealbreakerQ[] = [];

  if (laundryType && laundryType !== "in_unit") {
    qs.push({ key: "laundry", question: laundryType === "shared" ? "This home has shared laundry, not in-unit. Is that OK?" : "This home doesn't have laundry on site. Is that OK?" });
  }
  if (property.parking === false) {
    qs.push({ key: "parking", question: "There's no dedicated parking here. Is that OK?" });
  }
  if (raw.pet_friendly === false) {
    qs.push({ key: "pets", question: "This home isn't pet-friendly. Any pets in your household?" });
  }
  if (raw.utilities_included === false && qs.length < 3) {
    qs.push({ key: "utilities", question: "Heat, hydro, and water are tenant-paid here. Does that work for you?" });
  }

  return qs.slice(0, 3);
}

function YesNo({ label, value, onChange }: { label: string; value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: "#F7F5F2", border: "1px solid #D8D2C8" }}>
      <p className="text-sm mb-3" style={{ color: "#222222", lineHeight: 1.5 }}>{label}</p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onChange(true)}
          className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={{
            backgroundColor: value === true ? "rgba(34,197,94,0.1)" : "#FFFFFF",
            border: `1.5px solid ${value === true ? "#22c55e" : "#D8D2C8"}`,
            color: value === true ? "#15803d" : "#333333",
          }}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={{
            backgroundColor: value === false ? "rgba(239,68,68,0.08)" : "#FFFFFF",
            border: `1.5px solid ${value === false ? "#ef4444" : "#D8D2C8"}`,
            color: value === false ? "#dc2626" : "#333333",
          }}
        >
          No
        </button>
      </div>
    </div>
  );
}

export default function BookingModal({ property, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>("pick");
  const days = useMemo(() => nextDays(14), []);
  const [selectedDate, setSelectedDate] = useState<Date>(days[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);

  const dealbreakers = useMemo(() => getDealbreakerQuestions(property), [property]);
  const [budgetOk, setBudgetOk] = useState<boolean | null>(null);
  const [dealbreakerAnswers, setDealbreakerAnswers] = useState<Record<string, boolean | null>>({});
  const [verificationOk, setVerificationOk] = useState<boolean | null>(null);
  const [feeAcknowledged, setFeeAcknowledged] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoadingSlots(true);
    setSelectedTime(null);
    fetch(`/api/listings/viewing?property_id=${property.id}&date=${toDateKey(selectedDate)}`)
      .then((r) => r.json())
      .then((d) => {
        const times = (d.booked ?? []).map((iso: string) => {
          const dt = new Date(iso);
          return `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
        });
        setBookedTimes(times);
      })
      .catch(() => setBookedTimes([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, property.id]);

  function pickTime(t: string) {
    setSelectedTime(t);
    setStep("prequalify");
  }

  const prequalifyComplete =
    budgetOk !== null &&
    verificationOk !== null &&
    feeAcknowledged &&
    dealbreakers.every((q) => dealbreakerAnswers[q.key] !== undefined && dealbreakerAnswers[q.key] !== null);

  function continueFromPrequalify() {
    if (budgetOk === false) {
      setStep("not-a-fit");
      return;
    }
    setStep("contact");
  }

  function buildPrequalifySummary(): string {
    const lines = [
      `Budget OK: ${budgetOk ? "Yes" : "No"}`,
      ...dealbreakers.map((q) => `${q.question} → ${dealbreakerAnswers[q.key] ? "Yes" : "No"}`),
      `OK with verification process: ${verificationOk ? "Yes" : "No"}`,
      `$99 application fee acknowledged: ${feeAcknowledged ? "Yes" : "No"}`,
    ];
    return lines.join(" | ");
  }

  async function submit() {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !selectedTime) {
      setError("Please fill in all fields.");
      return;
    }
    setSubmitting(true);
    setError("");

    const [h, m] = selectedTime.split(":").map(Number);
    const viewingDate = new Date(selectedDate);
    viewingDate.setHours(h, m, 0, 0);

    const res = await fetch("/api/listings/viewing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        property_id: property.id,
        tenant_name: form.name.trim(),
        tenant_email: form.email.trim(),
        tenant_phone: form.phone.trim(),
        viewing_date: viewingDate.toISOString(),
        viewing_notes: buildPrequalifySummary(),
      }),
    });

    if (res.ok) {
      setStep("confirmed");
      onSuccess();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "That didn't go through, please try again.");
      if (res.status === 409) setStep("pick");
    }
    setSubmitting(false);
  }

  const dateLabel = selectedDate.toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" });
  const timeLabelStr = selectedTime ? timeLabel(selectedTime) : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>

        {/* ─── STEP: Pick date + time ─── */}
        {step === "pick" && (
          <>
            <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid #D8D2C8" }}>
              <div>
                <h2 className="text-xl font-bold" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
                  Book a Viewing
                </h2>
                <p className="text-xs mt-1" style={{ color: "#666666" }}>{property.address}, {property.city}</p>
              </div>
              <button onClick={onClose} className="text-2xl leading-none" style={{ color: "#666666" }}>×</button>
            </div>

            <div className="px-6 py-6">
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#999999" }}>Pick a day</p>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
                {days.map((d) => {
                  const active = toDateKey(d) === toDateKey(selectedDate);
                  return (
                    <button
                      key={toDateKey(d)}
                      onClick={() => setSelectedDate(d)}
                      className="flex-shrink-0 flex flex-col items-center justify-center rounded-xl transition-all"
                      style={{
                        width: 58,
                        height: 66,
                        backgroundColor: active ? "#1F2F3A" : "#F7F5F2",
                        border: `1.5px solid ${active ? "#1F2F3A" : "#D8D2C8"}`,
                      }}
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: active ? "rgba(250,248,245,0.6)" : "#999999" }}>
                        {d.toLocaleDateString("en-CA", { weekday: "short" })}
                      </span>
                      <span className="text-lg font-bold" style={{ color: active ? "#FAF8F5" : "#1F2F3A" }}>
                        {d.getDate()}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="text-xs font-semibold uppercase tracking-widest mb-3 mt-6" style={{ color: "#999999" }}>
                Available times, {dateLabel}
              </p>
              {loadingSlots ? (
                <div className="grid grid-cols-3 gap-2.5">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="rounded-xl animate-pulse" style={{ height: 52, backgroundColor: "#F0EDE8" }} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2.5">
                  {TIME_SLOTS.map((t) => {
                    const taken = bookedTimes.includes(t);
                    const past = isPast(selectedDate, t);
                    const disabled = taken || past;
                    return (
                      <button
                        key={t}
                        disabled={disabled}
                        onClick={() => pickTime(t)}
                        className="py-3.5 rounded-xl text-sm font-semibold transition-all"
                        style={{
                          backgroundColor: disabled ? "#F0EDE8" : "#F7F5F2",
                          border: `1.5px solid ${disabled ? "#E5E1DC" : "#D8D2C8"}`,
                          color: disabled ? "#B8B2A8" : "#1F2F3A",
                          cursor: disabled ? "not-allowed" : "pointer",
                          textDecoration: taken ? "line-through" : "none",
                        }}
                      >
                        {timeLabel(t)}
                      </button>
                    );
                  })}
                </div>
              )}
              <p className="text-xs mt-4 text-center" style={{ color: "#999999" }}>Each viewing is about 30 minutes</p>
            </div>
          </>
        )}

        {/* ─── STEP: Quick prequalify ─── */}
        {step === "prequalify" && (
          <>
            <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid #D8D2C8" }}>
              <div>
                <h2 className="text-xl font-bold" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
                  A few quick questions
                </h2>
                <p className="text-xs mt-1" style={{ color: "#666666" }}>{property.address}, {property.city} · {dateLabel} at {timeLabelStr}</p>
              </div>
              <button onClick={onClose} className="text-2xl leading-none" style={{ color: "#666666" }}>×</button>
            </div>

            <div className="px-6 py-6 space-y-3">
              <YesNo
                label={`Is $${property.price?.toLocaleString()}/mo within your budget?`}
                value={budgetOk}
                onChange={setBudgetOk}
              />
              {dealbreakers.map((q) => (
                <YesNo
                  key={q.key}
                  label={q.question}
                  value={dealbreakerAnswers[q.key] ?? null}
                  onChange={(v) => setDealbreakerAnswers((prev) => ({ ...prev, [q.key]: v }))}
                />
              ))}
              <YesNo
                label="Every applicant goes through a soft credit check, income verification, and a landlord reference. OK with that?"
                value={verificationOk}
                onChange={setVerificationOk}
              />

              <div
                className="rounded-xl p-4 flex items-start gap-3 cursor-pointer"
                style={{ backgroundColor: feeAcknowledged ? "rgba(31,47,58,0.04)" : "#F7F5F2", border: `1px solid ${feeAcknowledged ? "#1F2F3A" : "#D8D2C8"}` }}
                onClick={() => setFeeAcknowledged((v) => !v)}
              >
                <div
                  className="rounded-md flex items-center justify-center shrink-0"
                  style={{ width: 20, height: 20, marginTop: 1, backgroundColor: feeAcknowledged ? "#1F2F3A" : "#FFFFFF", border: `1.5px solid ${feeAcknowledged ? "#1F2F3A" : "#D8D2C8"}` }}
                >
                  {feeAcknowledged && <span style={{ color: "#FAF8F5", fontSize: 12, lineHeight: 1 }}>✓</span>}
                </div>
                <p className="text-sm" style={{ color: "#333333", lineHeight: 1.5 }}>
                  If you decide to apply, there&apos;s a <strong>$99 application fee</strong>. It goes toward your first month&apos;s rent if you&apos;re approved, and isn&apos;t refundable if you&apos;re not. Nothing is charged just for booking a viewing.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: "1px solid #D8D2C8" }}>
              <button onClick={() => setStep("pick")} className="text-sm" style={{ color: "#666666" }}>← Back</button>
              <button
                onClick={continueFromPrequalify}
                disabled={!prequalifyComplete}
                className="px-8 py-3.5 text-xs font-semibold uppercase tracking-widest rounded-lg transition-opacity hover:opacity-80 disabled:opacity-40"
                style={{ backgroundColor: "#8B2030", color: "#FAF8F5" }}
              >
                Continue
              </button>
            </div>
          </>
        )}

        {/* ─── STEP: Not a fit (budget) ─── */}
        {step === "not-a-fit" && (
          <div className="text-center py-12 px-6 space-y-4">
            <h2 className="text-2xl font-bold" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              No worries
            </h2>
            <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: "#333333" }}>
              Sounds like this one might not be the right budget fit. Take a look at our other available homes, there may be a better match.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setStep("prequalify")} className="px-6 py-3 text-xs font-semibold uppercase tracking-widest rounded-lg" style={{ border: "1px solid #D8D2C8", color: "#666666" }}>
                ← Back
              </button>
              <a href="/listings" className="px-6 py-3 text-xs font-semibold uppercase tracking-widest rounded-lg" style={{ backgroundColor: "#8B2030", color: "#FAF8F5", textDecoration: "none" }}>
                See other homes
              </a>
            </div>
          </div>
        )}

        {/* ─── STEP: Contact info ─── */}
        {step === "contact" && (
          <>
            <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid #D8D2C8" }}>
              <div>
                <h2 className="text-xl font-bold" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
                  Almost there
                </h2>
                <p className="text-xs mt-1" style={{ color: "#666666" }}>{dateLabel} at {timeLabelStr}</p>
              </div>
              <button onClick={onClose} className="text-2xl leading-none" style={{ color: "#666666" }}>×</button>
            </div>

            <div className="px-6 py-6 space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest mb-2 font-medium" style={{ color: "#333333" }}>Full name</label>
                <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Your name" className={inputCls} autoFocus />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest mb-2 font-medium" style={{ color: "#333333" }}>Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="(519) 000-0000" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest mb-2 font-medium" style={{ color: "#333333" }}>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="you@email.com" className={inputCls} />
              </div>
              {error && (
                <p className="text-sm px-4 py-3 rounded-lg" style={{ backgroundColor: "rgba(139,32,48,0.08)", color: "#8B2030" }}>{error}</p>
              )}
            </div>

            <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: "1px solid #D8D2C8" }}>
              <button onClick={() => setStep("prequalify")} className="text-sm" style={{ color: "#666666" }}>← Back</button>
              <button
                onClick={submit}
                disabled={submitting}
                className="px-8 py-3.5 text-xs font-semibold uppercase tracking-widest rounded-lg transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ backgroundColor: "#8B2030", color: "#FAF8F5" }}
              >
                {submitting ? "Booking…" : "Confirm Viewing"}
              </button>
            </div>
          </>
        )}

        {/* ─── STEP: Confirmed ─── */}
        {step === "confirmed" && (
          <div className="text-center py-12 px-6 space-y-4">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl" style={{ backgroundColor: "rgba(34,197,94,0.1)" }}>
              ✓
            </div>
            <h2 className="text-2xl font-bold" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              You&apos;re booked!
            </h2>
            <div className="inline-block px-6 py-4 rounded-xl text-left" style={{ backgroundColor: "#F7F5F2", border: "1px solid #D8D2C8" }}>
              <p className="text-sm font-semibold" style={{ color: "#1F2F3A" }}>{dateLabel} at {timeLabelStr}</p>
              <p className="text-sm mt-1" style={{ color: "#333333" }}>{property.address}, {property.city}</p>
            </div>
            <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: "#333333" }}>
              A calendar invite is on its way to <strong>{form.email}</strong>. See you there!
            </p>
            <button
              onClick={onClose}
              className="px-8 py-3 text-xs font-semibold uppercase tracking-widest rounded-lg transition-opacity hover:opacity-80"
              style={{ backgroundColor: "#8B2030", color: "#FAF8F5" }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
