"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RentPeriod {
  from: string;
  to: string;
  charged: string;
  paid: string;
}

const emptyPeriod = (): RentPeriod => ({ from: "", to: "", charged: "", paid: "" });

const inputClass =
  "w-full px-4 py-3 text-sm border border-[#E8E4DF] rounded-lg bg-white text-[#0D1B2A] focus:outline-none focus:border-[#7B1C1C] transition-colors placeholder:text-[#BBBBBB]";

const labelClass = "block text-xs font-semibold uppercase tracking-wider mb-1.5 text-[#5A5A5A]";

// Auto-calculate termination date (14 days from notice date, month/year tenants)
function calcTerminationDate(noticeDate: string): string {
  if (!noticeDate) return "";
  const d = new Date(noticeDate);
  d.setDate(d.getDate() + 14);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatDate(isoDate: string): string {
  if (!isoDate) return "";
  const [yyyy, mm, dd] = isoDate.split("-");
  return `${dd}/${mm}/${yyyy}`;
}

export default function N4FormBuilder() {
  const [step, setStep] = useState<"form" | "email" | "done">("form");

  // Form fields
  const [tenantNames, setTenantNames] = useState("");
  const [landlordName, setLandlordName] = useState("");
  const [rentalAddress, setRentalAddress] = useState("");
  const [noticeDate, setNoticeDate] = useState("");
  const [terminationDate, setTerminationDate] = useState("");
  const [rentPeriods, setRentPeriods] = useState<RentPeriod[]>([emptyPeriod()]);
  const [landlordFirstName, setLandlordFirstName] = useState("");
  const [landlordLastName, setLandlordLastName] = useState("");
  const [landlordPhone, setLandlordPhone] = useState("");
  const [signatureDate, setSignatureDate] = useState("");

  // Email capture
  const [email, setEmail] = useState("");
  const [wantsHelp, setWantsHelp] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  // Derived
  const totalOwing = rentPeriods.reduce((sum, p) => {
    const c = parseFloat(p.charged || "0");
    const pd = parseFloat(p.paid || "0");
    return sum + Math.max(0, c - pd);
  }, 0);

  function updatePeriod(i: number, field: keyof RentPeriod, val: string) {
    setRentPeriods((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: val } : p)));
  }

  function addPeriod() {
    if (rentPeriods.length < 3) setRentPeriods((p) => [...p, emptyPeriod()]);
  }

  function removePeriod(i: number) {
    setRentPeriods((p) => p.filter((_, idx) => idx !== i));
  }

  function handleNoticeDateChange(val: string) {
    setNoticeDate(val);
    setTerminationDate(calcTerminationDate(val));
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep("email");
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/forms/n4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantNames,
          landlordName,
          rentalAddress,
          amountOwing: totalOwing.toFixed(2),
          terminationDate: terminationDate || formatDate(noticeDate),
          rentPeriods: rentPeriods.map((p) => ({
            ...p,
            from: formatDate(p.from),
            to: formatDate(p.to),
          })),
          landlordFirstName,
          landlordLastName,
          landlordPhone,
          signatureDate: formatDate(signatureDate || noticeDate),
          email,
          wantsHelp,
        }),
      });

      if (!res.ok) throw new Error("Generation failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "N4-Notice.pdf";
      a.click();
      URL.revokeObjectURL(url);
      setStep("done");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: "#E8E4DF", backgroundColor: "#FFFDFB" }}
    >
      {/* Header */}
      <div className="px-8 py-6 border-b" style={{ borderColor: "#E8E4DF", backgroundColor: "#F5F0EB" }}>
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 flex items-center justify-center rounded-xl text-lg font-bold shrink-0"
            style={{ backgroundColor: "#7B1C1C", color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
          >
            N4
          </div>
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-0.5"
              style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
            >
              Free LTB Form Generator
            </p>
            <h2
              className="text-2xl font-light leading-tight"
              style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}
            >
              Notice of Non-Payment of Rent
            </h2>
          </div>
        </div>
        <p
          className="mt-3 text-sm leading-relaxed"
          style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}
        >
          Fill in the details below. We&apos;ll generate a completed, ready-to-serve N4 form you can download instantly — no PDF editor needed.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* ── Step 1: Form ── */}
        {step === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <form onSubmit={handleFormSubmit} className="p-8 space-y-8">
              {/* Parties */}
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-5 pb-2 border-b"
                  style={{ color: "#7B1C1C", borderColor: "#E8E4DF", fontFamily: "var(--font-dm-sans)" }}
                >
                  Parties & Property
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Tenant Name(s) *</label>
                    <input
                      required
                      value={tenantNames}
                      onChange={(e) => setTenantNames(e.target.value)}
                      className={inputClass}
                      placeholder="e.g. John Smith, Jane Smith"
                    />
                    <p className="mt-1 text-xs" style={{ color: "#9B9B9B", fontFamily: "var(--font-dm-sans)" }}>
                      List all tenants in possession of the unit
                    </p>
                  </div>
                  <div>
                    <label className={labelClass}>Landlord Name *</label>
                    <input
                      required
                      value={landlordName}
                      onChange={(e) => setLandlordName(e.target.value)}
                      className={inputClass}
                      placeholder="Your full name or company name"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Rental Unit Address *</label>
                    <input
                      required
                      value={rentalAddress}
                      onChange={(e) => setRentalAddress(e.target.value)}
                      className={inputClass}
                      placeholder="e.g. Unit 2, 123 Main Street, London, ON N6A 1A1"
                    />
                    <p className="mt-1 text-xs" style={{ color: "#9B9B9B", fontFamily: "var(--font-dm-sans)" }}>
                      Include unit number and postal code
                    </p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-5 pb-2 border-b"
                  style={{ color: "#7B1C1C", borderColor: "#E8E4DF", fontFamily: "var(--font-dm-sans)" }}
                >
                  Dates
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Date You Are Giving This Notice *</label>
                    <input
                      required
                      type="date"
                      value={noticeDate}
                      onChange={(e) => handleNoticeDateChange(e.target.value)}
                      className={inputClass}
                    />
                    <p className="mt-1 text-xs" style={{ color: "#9B9B9B", fontFamily: "var(--font-dm-sans)" }}>
                      Must be the day after rent was due
                    </p>
                  </div>
                  <div>
                    <label className={labelClass}>Termination Date</label>
                    <input
                      type="text"
                      value={terminationDate}
                      onChange={(e) => setTerminationDate(e.target.value)}
                      className={inputClass}
                      placeholder="DD/MM/YYYY — auto-filled (14 days)"
                    />
                    <p className="mt-1 text-xs" style={{ color: "#9B9B9B", fontFamily: "var(--font-dm-sans)" }}>
                      Auto-set to 14 days. Adjust if adding mail delivery days.
                    </p>
                  </div>
                </div>
              </div>

              {/* Rent periods table */}
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-5 pb-2 border-b"
                  style={{ color: "#7B1C1C", borderColor: "#E8E4DF", fontFamily: "var(--font-dm-sans)" }}
                >
                  Rent Periods (what is owed)
                </p>

                <div className="space-y-4">
                  {rentPeriods.map((period, i) => (
                    <div key={i} className="p-5 border rounded-xl" style={{ borderColor: "#E8E4DF", backgroundColor: "#FAF8F5" }}>
                      <div className="flex items-center justify-between mb-4">
                        <p
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{ color: "#0D1B2A", fontFamily: "var(--font-dm-sans)" }}
                        >
                          Period {i + 1}
                        </p>
                        {rentPeriods.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePeriod(i)}
                            className="text-xs"
                            style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className={labelClass}>From *</label>
                          <input
                            required
                            type="date"
                            value={period.from}
                            onChange={(e) => updatePeriod(i, "from", e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>To *</label>
                          <input
                            required
                            type="date"
                            value={period.to}
                            onChange={(e) => updatePeriod(i, "to", e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Rent Charged ($) *</label>
                          <input
                            required
                            type="number"
                            min="0"
                            step="0.01"
                            value={period.charged}
                            onChange={(e) => updatePeriod(i, "charged", e.target.value)}
                            className={inputClass}
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Rent Paid ($)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={period.paid}
                            onChange={(e) => updatePeriod(i, "paid", e.target.value)}
                            className={inputClass}
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {rentPeriods.length < 3 && (
                  <button
                    type="button"
                    onClick={addPeriod}
                    className="mt-3 text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-70"
                    style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
                  >
                    + Add Another Period
                  </button>
                )}

                {/* Total preview */}
                {totalOwing > 0 && (
                  <div
                    className="mt-5 p-4 rounded-xl flex items-center justify-between"
                    style={{ backgroundColor: "#0D1B2A" }}
                  >
                    <p
                      className="text-sm font-medium"
                      style={{ color: "rgba(250,248,245,0.7)", fontFamily: "var(--font-dm-sans)" }}
                    >
                      Total Rent Owing
                    </p>
                    <p
                      className="text-2xl font-light"
                      style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
                    >
                      ${totalOwing.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Landlord signature info */}
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-5 pb-2 border-b"
                  style={{ color: "#7B1C1C", borderColor: "#E8E4DF", fontFamily: "var(--font-dm-sans)" }}
                >
                  Landlord Signature Information
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className={labelClass}>First Name *</label>
                    <input
                      required
                      value={landlordFirstName}
                      onChange={(e) => setLandlordFirstName(e.target.value)}
                      className={inputClass}
                      placeholder="First"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Last Name *</label>
                    <input
                      required
                      value={landlordLastName}
                      onChange={(e) => setLandlordLastName(e.target.value)}
                      className={inputClass}
                      placeholder="Last"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number *</label>
                    <input
                      required
                      type="tel"
                      value={landlordPhone}
                      onChange={(e) => setLandlordPhone(e.target.value)}
                      className={inputClass}
                      placeholder="(519) 000-0000"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Date Signed</label>
                    <input
                      type="date"
                      value={signatureDate}
                      onChange={(e) => setSignatureDate(e.target.value)}
                      className={inputClass}
                    />
                    <p className="mt-1 text-xs" style={{ color: "#9B9B9B", fontFamily: "var(--font-dm-sans)" }}>
                      Defaults to notice date if left blank
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 text-sm font-semibold uppercase tracking-widest rounded-lg transition-opacity hover:opacity-80"
                style={{ backgroundColor: "#7B1C1C", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
              >
                Generate My N4 →
              </button>
            </form>
          </motion.div>
        )}

        {/* ── Step 2: Email capture ── */}
        {step === "email" && (
          <motion.div
            key="email"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-8"
          >
            <div className="max-w-md mx-auto text-center">
              <div
                className="w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-6 text-2xl"
                style={{ backgroundColor: "#F5F0EB" }}
              >
                📄
              </div>
              <h3
                className="text-3xl font-light mb-3"
                style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}
              >
                Your N4 is ready.
              </h3>
              <p
                className="text-sm mb-6 leading-relaxed"
                style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}
              >
                Enter your email to download. We&apos;ll occasionally send you useful landlord tips — no spam, unsubscribe anytime.
              </p>

              {/* Hot lead checkbox */}
              <label
                className="flex items-start gap-3 p-4 rounded-xl border cursor-pointer mb-6 transition-colors"
                style={{
                  borderColor: wantsHelp ? "#7B1C1C" : "#E8E4DF",
                  backgroundColor: wantsHelp ? "rgba(123,28,28,0.04)" : "#FAF8F5",
                }}
              >
                <input
                  type="checkbox"
                  checked={wantsHelp}
                  onChange={(e) => setWantsHelp(e.target.checked)}
                  className="mt-0.5 shrink-0 accent-[#7B1C1C]"
                />
                <div>
                  <p className="text-sm font-medium" style={{ color: "#0D1B2A", fontFamily: "var(--font-dm-sans)" }}>
                    I&apos;d like Prospera to handle this for me
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#9B9B9B", fontFamily: "var(--font-dm-sans)" }}>
                    Ebin will reach out within 24 hours — free consultation, no pressure.
                  </p>
                </div>
              </label>

              <form onSubmit={handleGenerate} className="space-y-3">
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className={inputClass + " text-center"}
                />
                {error && (
                  <p className="text-xs" style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}>
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={generating}
                  className="w-full py-4 text-sm font-semibold uppercase tracking-widest rounded-lg transition-opacity hover:opacity-80 disabled:opacity-50"
                  style={{ backgroundColor: "#7B1C1C", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
                >
                  {generating ? "Generating..." : "Download My N4"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="text-xs transition-opacity hover:opacity-70"
                  style={{ color: "#9B9B9B", fontFamily: "var(--font-dm-sans)" }}
                >
                  ← Go back and edit
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* ── Step 3: Done ── */}
        {step === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8"
          >
            <div className="max-w-md mx-auto text-center">
              <div
                className="w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-6 text-2xl"
                style={{ backgroundColor: "#F5F0EB" }}
              >
                ✓
              </div>
              <h3
                className="text-3xl font-light mb-3"
                style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}
              >
                Downloaded.
              </h3>
              <p
                className="text-sm mb-8 leading-relaxed"
                style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}
              >
                Sign it, then serve it to your tenant in person or by mail. Remember to remove the checklist page before serving.
              </p>
              <div
                className="p-5 rounded-xl text-left mb-6 space-y-2"
                style={{ backgroundColor: "#F5F0EB" }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}>
                  Before you serve it
                </p>
                {[
                  "Sign and date the notice",
                  "Remove the checklist (page 1)",
                  "Give a copy to every tenant named",
                  "Keep a copy for your records",
                ].map((tip) => (
                  <p key={tip} className="text-sm flex gap-2" style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}>
                    <span style={{ color: "#7B1C1C" }}>✓</span> {tip}
                  </p>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => { setStep("form"); }}
                  className="flex-1 py-3 text-xs font-semibold uppercase tracking-widest border rounded-lg transition-colors hover:bg-gray-50"
                  style={{ borderColor: "#E8E4DF", color: "#0D1B2A", fontFamily: "var(--font-dm-sans)" }}
                >
                  Fill Another N4
                </button>
                <a
                  href="/contact"
                  className="flex-1 py-3 text-xs font-semibold uppercase tracking-widest rounded-lg text-center transition-opacity hover:opacity-80"
                  style={{ backgroundColor: "#7B1C1C", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
                >
                  Need Help Serving It?
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disclaimer */}
      <div className="px-8 py-4 border-t" style={{ borderColor: "#E8E4DF" }}>
        <p className="text-xs" style={{ color: "#BBBBBB", fontFamily: "var(--font-dm-sans)" }}>
          This tool generates the official Ontario LTB N4 form. Always verify dates and amounts before serving. Prospera Properties is not a law firm. For complex situations, consult a paralegal or lawyer.
        </p>
      </div>
    </div>
  );
}
