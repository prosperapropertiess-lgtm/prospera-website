"use client";

import { useState } from "react";

type Step = "form" | "done";

const CITIES = ["London", "St. Thomas", "Strathroy", "Not sure yet"];
const BEDROOM_OPTIONS = ["Bachelor / Studio", "1 bedroom", "2 bedrooms", "3+ bedrooms"];
const BUDGET_OPTIONS = [
  "Under $1,200/mo",
  "$1,200 – $1,600/mo",
  "$1,600 – $2,000/mo",
  "$2,000 – $2,500/mo",
  "$2,500+/mo",
];
const MOVE_OPTIONS = [
  "ASAP",
  "Within 30 days",
  "1–2 months",
  "2–3 months",
  "3+ months / just browsing",
];

export default function TenantLeadCTA() {
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [budget, setBudget] = useState("");
  const [moveIn, setMoveIn] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      await fetch("/api/listings/rental-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          name: name.trim() || null,
          phone: phone.trim() || null,
          city: city || null,
          bedrooms: bedrooms || null,
          price_max: parseBudgetMax(budget),
          move_in_timeline: moveIn || null,
          notes: notes.trim() || null,
          source: "blog-renter-cta",
        }),
      });
    } catch {
      // fail silently
    }

    setLoading(false);
    setStep("done");
  }

  return (
    <section className="py-16 px-6" style={{ backgroundColor: "#1F2F3A" }}>
      <div className="max-w-2xl mx-auto">
        {step === "done" ? (
          <div className="text-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: "rgba(250,248,245,0.10)" }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M4 11l5 5 9-9" stroke="#FAF8F5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2
              className="text-3xl font-bold mb-3"
              style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
            >
              You&apos;re on our list.
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "rgba(250,248,245,0.7)", fontFamily: "var(--font-dm-sans)" }}
            >
              We&apos;ll reach out as soon as something that fits comes available. In the meantime,{" "}
              <a
                href="/listings"
                className="underline underline-offset-2 transition-opacity hover:opacity-70"
                style={{ color: "#FAF8F5" }}
              >
                browse current listings
              </a>
              .
            </p>
          </div>
        ) : (
          <>
            <p
              className="text-xs font-semibold uppercase tracking-widest text-center mb-3"
              style={{ color: "rgba(250,248,245,0.45)", fontFamily: "var(--font-dm-sans)" }}
            >
              Find Your Next Place
            </p>
            <h2
              className="text-3xl font-bold text-center mb-2"
              style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
            >
              Tell us what you&apos;re looking for.
            </h2>
            <p
              className="text-sm text-center mb-10"
              style={{ color: "rgba(250,248,245,0.60)", fontFamily: "var(--font-dm-sans)" }}
            >
              We&apos;ll match you with available units, or alert you the moment something opens up.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "rgba(250,248,245,0.50)", fontFamily: "var(--font-dm-sans)" }}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="First name"
                    className="w-full px-4 py-3 text-sm rounded focus:outline-none"
                    style={{
                      backgroundColor: "rgba(250,248,245,0.08)",
                      border: "1px solid rgba(250,248,245,0.15)",
                      color: "#FAF8F5",
                      fontFamily: "var(--font-dm-sans)",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "rgba(250,248,245,0.50)", fontFamily: "var(--font-dm-sans)" }}>
                    Email <span style={{ color: "#8B2030" }}>*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full px-4 py-3 text-sm rounded focus:outline-none"
                    style={{
                      backgroundColor: "rgba(250,248,245,0.08)",
                      border: "1px solid rgba(250,248,245,0.15)",
                      color: "#FAF8F5",
                      fontFamily: "var(--font-dm-sans)",
                    }}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "rgba(250,248,245,0.50)", fontFamily: "var(--font-dm-sans)" }}>
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(519) 000-0000"
                  className="w-full px-4 py-3 text-sm rounded focus:outline-none"
                  style={{
                    backgroundColor: "rgba(250,248,245,0.08)",
                    border: "1px solid rgba(250,248,245,0.15)",
                    color: "#FAF8F5",
                    fontFamily: "var(--font-dm-sans)",
                  }}
                />
              </div>

              {/* Area + Bedrooms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "rgba(250,248,245,0.50)", fontFamily: "var(--font-dm-sans)" }}>
                    Area
                  </label>
                  <select
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded focus:outline-none appearance-none"
                    style={{
                      backgroundColor: "rgba(250,248,245,0.08)",
                      border: "1px solid rgba(250,248,245,0.15)",
                      color: city ? "#FAF8F5" : "rgba(250,248,245,0.40)",
                      fontFamily: "var(--font-dm-sans)",
                    }}
                  >
                    <option value="" disabled>Select area</option>
                    {CITIES.map(c => (
                      <option key={c} value={c} style={{ backgroundColor: "#1F2F3A", color: "#FAF8F5" }}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "rgba(250,248,245,0.50)", fontFamily: "var(--font-dm-sans)" }}>
                    Bedrooms
                  </label>
                  <select
                    value={bedrooms}
                    onChange={e => setBedrooms(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded focus:outline-none appearance-none"
                    style={{
                      backgroundColor: "rgba(250,248,245,0.08)",
                      border: "1px solid rgba(250,248,245,0.15)",
                      color: bedrooms ? "#FAF8F5" : "rgba(250,248,245,0.40)",
                      fontFamily: "var(--font-dm-sans)",
                    }}
                  >
                    <option value="" disabled>Select bedrooms</option>
                    {BEDROOM_OPTIONS.map(b => (
                      <option key={b} value={b} style={{ backgroundColor: "#1F2F3A", color: "#FAF8F5" }}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Budget + Move-in */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "rgba(250,248,245,0.50)", fontFamily: "var(--font-dm-sans)" }}>
                    Budget
                  </label>
                  <select
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded focus:outline-none appearance-none"
                    style={{
                      backgroundColor: "rgba(250,248,245,0.08)",
                      border: "1px solid rgba(250,248,245,0.15)",
                      color: budget ? "#FAF8F5" : "rgba(250,248,245,0.40)",
                      fontFamily: "var(--font-dm-sans)",
                    }}
                  >
                    <option value="" disabled>Select budget</option>
                    {BUDGET_OPTIONS.map(b => (
                      <option key={b} value={b} style={{ backgroundColor: "#1F2F3A", color: "#FAF8F5" }}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "rgba(250,248,245,0.50)", fontFamily: "var(--font-dm-sans)" }}>
                    Move-in Timeline
                  </label>
                  <select
                    value={moveIn}
                    onChange={e => setMoveIn(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded focus:outline-none appearance-none"
                    style={{
                      backgroundColor: "rgba(250,248,245,0.08)",
                      border: "1px solid rgba(250,248,245,0.15)",
                      color: moveIn ? "#FAF8F5" : "rgba(250,248,245,0.40)",
                      fontFamily: "var(--font-dm-sans)",
                    }}
                  >
                    <option value="" disabled>Select timeline</option>
                    {MOVE_OPTIONS.map(m => (
                      <option key={m} value={m} style={{ backgroundColor: "#1F2F3A", color: "#FAF8F5" }}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "rgba(250,248,245,0.50)", fontFamily: "var(--font-dm-sans)" }}>
                  Anything else? (pets, parking, accessibility needs…)
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Optional: any specific requirements"
                  rows={2}
                  className="w-full px-4 py-3 text-sm rounded focus:outline-none resize-none"
                  style={{
                    backgroundColor: "rgba(250,248,245,0.08)",
                    border: "1px solid rgba(250,248,245,0.15)",
                    color: "#FAF8F5",
                    fontFamily: "var(--font-dm-sans)",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-4 text-xs font-semibold uppercase tracking-widest rounded transition-opacity hover:opacity-80 disabled:opacity-40"
                style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
              >
                {loading ? "Sending…" : "Find Me a Place"}
              </button>

              <p className="text-xs text-center" style={{ color: "rgba(250,248,245,0.35)", fontFamily: "var(--font-dm-sans)" }}>
                No spam. We&apos;ll only contact you about properties that match what you&apos;re looking for.
              </p>
            </form>
          </>
        )}
      </div>
    </section>
  );
}

function parseBudgetMax(budget: string): number | null {
  if (!budget) return null;
  const match = budget.match(/\$([0-9,]+)\+?\/mo$/);
  if (match) return parseInt(match[1].replace(",", ""), 10);
  const rangeMatch = budget.match(/\$([0-9,]+)\s*[–-]\s*\$([0-9,]+)/);
  if (rangeMatch) return parseInt(rangeMatch[2].replace(",", ""), 10);
  if (budget.startsWith("Under")) return 1200;
  return null;
}
