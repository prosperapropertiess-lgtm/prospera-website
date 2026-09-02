"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CITIES = ["London", "St. Thomas", "Strathroy"];

interface MarketEstimate {
  source: "computed" | "static";
  p25?: number;
  median?: number;
  p75?: number;
  submission_count?: number;
}

export default function RentAnalysisPage() {
  const [form, setForm] = useState({ name: "", email: "", city: "", bedrooms: "", role: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [estimate, setEstimate] = useState<MarketEstimate | null>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);

  useEffect(() => {
    if (!form.city || !form.bedrooms) { setEstimate(null); return; }
    setEstimateLoading(true);
    fetch(`/api/rent/market-estimate?city=${encodeURIComponent(form.city)}&bedrooms=${form.bedrooms}`)
      .then((r) => r.json())
      .then((data) => setEstimate(data))
      .catch(() => setEstimate(null))
      .finally(() => setEstimateLoading(false));
  }, [form.city, form.bedrooms]);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.city) {
      setError("Name, email, and city are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/rent/request-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        city: form.city,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
        submitter_role: form.role || null,
      }),
    });
    if (res.ok) {
      setSubmitted(true);
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong. Please try again.");
    }
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ backgroundColor: "#F7F5F2" }}>
        <p style={{ color: "#666666", fontFamily: "var(--font-dm-sans)", fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
          Check your inbox
        </p>
        <p style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)", fontSize: 38, fontWeight: 300, marginBottom: 16, maxWidth: 480, lineHeight: 1.2 }}>
          Your analysis link is on its way.
        </p>
        <p style={{ color: "#333333", fontFamily: "var(--font-dm-sans)", fontSize: 16, maxWidth: 400, lineHeight: 1.7, marginBottom: 32 }}>
          We sent a personalized link to {form.email}. Click it and tell us about your property, and we&apos;ll do the rest.
        </p>
        <Link
          href="/"
          style={{ color: "#666666", fontFamily: "var(--font-dm-sans)", fontSize: 14, letterSpacing: "0.1em", textDecoration: "none" }}
        >
          ← Back to Prospera Properties
        </Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#FFFFFF" }}>

      {/* ── Hero ── */}
      <section className="px-5 sm:px-8 py-24 text-center" style={{ backgroundColor: "#1F2F3A" }}>
        <div className="max-w-3xl mx-auto">
          <p style={{ color: "rgba(250,248,245,0.75)", fontFamily: "var(--font-dm-sans)", fontSize: 13, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 20 }}>
            Free · No Obligation · London · St. Thomas · Strathroy
          </p>
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-light leading-tight mb-6"
            style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
          >
            Most landlords are leaving<br />
            <em style={{ color: "rgba(250,248,245,0.6)" }}>money on the table.</em>
          </h1>
          <p
            className="leading-relaxed mb-8 max-w-lg mx-auto"
            style={{ color: "rgba(250,248,245,0.7)", fontFamily: "var(--font-dm-sans)", fontSize: 17 }}
          >
            We track hundreds of active rentals across Southwest Ontario every week, and use that data to tell you exactly what your property should be earning right now.
          </p>

          {/* Live data badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-10" style={{ backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#4ade80", display: "inline-block", flexShrink: 0 }} />
            <span style={{ color: "rgba(250,248,245,0.75)", fontFamily: "var(--font-dm-sans)", fontSize: 14 }}>
              Updated weekly · 300+ listings tracked · 47 landlords used this tool
            </span>
          </div>

          <div>
            <a
              href="#get-analysis"
              className="inline-block px-10 py-4 font-semibold uppercase tracking-widest rounded btn-primary"
              style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)", fontSize: 14 }}
            >
              Get My Free Analysis
            </a>
          </div>
        </div>
      </section>

      {/* ── Social proof strip ── */}
      <section className="py-10 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2", borderBottom: "1px solid #E8E4DF" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: "300+", label: "Listings tracked weekly" },
            { value: "3 cities", label: "London · St. Thomas · Strathroy" },
            { value: "47", label: "Landlords used this tool" },
            { value: "Free", label: "No catch. No sales call." },
          ].map((stat) => (
            <div key={stat.label}>
              <p style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)", fontSize: 34, fontWeight: 300, lineHeight: 1, marginBottom: 8 }}>{stat.value}</p>
              <p style={{ color: "#777777", fontFamily: "var(--font-dm-sans)", fontSize: 13, letterSpacing: "0.05em" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── What you get ── */}
      <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-5xl mx-auto">
          <p style={{ color: "#666666", fontFamily: "var(--font-dm-sans)", fontSize: 13, letterSpacing: "0.15em", textTransform: "uppercase", textAlign: "center", marginBottom: 12 }}>
            What&apos;s Included
          </p>
          <h2
            className="text-4xl sm:text-5xl font-light text-center mb-16 leading-tight"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
          >
            Not a guess. Real numbers.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                num: "01",
                title: "What other units are renting for",
                desc: "You'll see the lowest, most common, and highest rents for similar units in your city right now — pulled from active listings this week, not last year.",
              },
              {
                num: "02",
                title: "What makes your unit worth more (or less)",
                desc: "Garage, laundry, utilities, location, condition: we look at the things that actually change what tenants will pay. Your unit is scored on its own, not lumped into a city average.",
              },
              {
                num: "03",
                title: "One clear number to list at",
                desc: "Not a range. A specific number. What to charge, why, and what to do if you're currently undercharging or scaring tenants away with a price that's too high.",
              },
            ].map((item) => (
              <div
                key={item.num}
                className="bg-white p-8 border rounded-xl"
                style={{ borderColor: "#D8D2C8", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
              >
                <span style={{ display: "block", fontSize: 13, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#D8D2C8", fontFamily: "var(--font-dm-sans)", marginBottom: 20 }}>
                  {item.num}
                </span>
                <h3 className="text-xl font-light mb-3" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)", fontSize: 24 }}>
                  {item.title}
                </h3>
                <p className="leading-relaxed" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)", fontSize: 15 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Where the data comes from ── */}
      <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-4xl mx-auto">
          <p style={{ color: "#666666", fontFamily: "var(--font-dm-sans)", fontSize: 13, letterSpacing: "0.15em", textTransform: "uppercase", textAlign: "center", marginBottom: 12 }}>
            The Data Behind It
          </p>
          <h2
            className="text-4xl sm:text-5xl font-light text-center mb-6 leading-tight"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
          >
            Built on actual current listings.
          </h2>
          <p className="leading-relaxed text-center max-w-xl mx-auto mb-14" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)", fontSize: 16 }}>
            We pull from Kijiji, Realtor.ca, Rentals.ca, and Zumper every week. Every number you see is based on what&apos;s actually listed right now in your city — not a national average, not data from 8 months ago.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Scraped weekly from 4 sources", sub: "Kijiji, Realtor.ca, Rentals.ca, and Zumper: every active listing in London, St. Thomas, and Strathroy, pulled fresh every Sunday." },
              { label: "300+ data points and growing", sub: "Every analysis a landlord submits adds to the pool. The more landlords use it, the more accurate the numbers get." },
              { label: "Matched to your unit specifically", sub: "Bedrooms, bathrooms, parking, laundry, utilities, neighbourhood: we compare your place to listings that actually look like yours, not just the same city." },
              { label: "Written by AI, grounded in real data", sub: "The analysis is written by AI trained on Southwest Ontario rental patterns, and checked against real current listings before it hits your inbox." },
            ].map((item, i) => (
              <div
                key={i}
                className="p-7 border rounded-xl flex items-start gap-4"
                style={{ borderColor: "#D8D2C8", backgroundColor: "#F7F5F2" }}
              >
                <span style={{ color: "#8B2030", fontSize: 16, marginTop: 1, flexShrink: 0 }}>✓</span>
                <div>
                  <p className="font-semibold mb-2" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)", fontSize: 15 }}>{item.label}</p>
                  <p className="leading-relaxed" style={{ color: "#555555", fontFamily: "var(--font-dm-sans)", fontSize: 14 }}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social proof strip ── */}
      <section className="py-14 px-5 sm:px-8" style={{ backgroundColor: "#1F2F3A" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { value: "25+", label: "Tenant Placements" },
            { value: "20+", label: "Five-Star Reviews" },
            { value: "0", label: "LTB Cases. Ever." },
          ].map((stat) => (
            <div key={stat.label}>
              <p style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)", fontSize: 44, fontWeight: 300, lineHeight: 1, marginBottom: 6 }}>{stat.value}</p>
              <p style={{ color: "rgba(250,248,245,0.6)", fontFamily: "var(--font-dm-sans)", fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Form ── */}
      <section id="get-analysis" className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-lg mx-auto">
          <p style={{ color: "#666666", fontFamily: "var(--font-dm-sans)", fontSize: 13, letterSpacing: "0.15em", textTransform: "uppercase", textAlign: "center", marginBottom: 12 }}>
            Free · Takes 2 Minutes
          </p>
          <h2
            className="text-4xl sm:text-5xl font-light text-center mb-4 leading-tight"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
          >
            Get your analysis.
          </h2>
          <p className="text-center mb-10" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)", fontSize: 16 }}>
            We&apos;ll email you a personalized link. Fill in your property details and we&apos;ll send the analysis straight to your inbox.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Step 1 — City + Bedrooms */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#555555", fontWeight: 600, marginBottom: 8, fontFamily: "var(--font-dm-sans)" }}>
                  City *
                </label>
                <select
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  required
                  style={{ width: "100%", backgroundColor: "#FFFFFF", border: "1px solid #D8D2C8", color: form.city ? "#222222" : "#666666", padding: "14px 14px", fontSize: 15, fontFamily: "var(--font-dm-sans)", outline: "none", borderRadius: 6, boxSizing: "border-box" }}
                >
                  <option value="">Select city</option>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#555555", fontWeight: 600, marginBottom: 8, fontFamily: "var(--font-dm-sans)" }}>
                  Bedrooms
                </label>
                <select
                  value={form.bedrooms}
                  onChange={(e) => set("bedrooms", e.target.value)}
                  style={{ width: "100%", backgroundColor: "#FFFFFF", border: "1px solid #D8D2C8", color: form.bedrooms ? "#222222" : "#666666", padding: "14px 14px", fontSize: 15, fontFamily: "var(--font-dm-sans)", outline: "none", borderRadius: 6, boxSizing: "border-box" }}
                >
                  <option value="">Select</option>
                  {["1","2","3","4","5+"].map((n) => <option key={n} value={n === "5+" ? "5" : n}>{n}</option>)}
                </select>
              </div>
            </div>

            {/* Market range teaser */}
            {estimateLoading && (
              <div style={{ backgroundColor: "#1F2F3A", borderRadius: 8, padding: "22px 24px", textAlign: "center" }}>
                <p style={{ color: "rgba(250,248,245,0.4)", fontFamily: "var(--font-dm-sans)", fontSize: 15, margin: 0 }}>Pulling market data...</p>
              </div>
            )}

            {!estimateLoading && estimate?.source === "computed" && estimate.median && (
              <div style={{ backgroundColor: "#1F2F3A", borderRadius: 8, padding: "24px" }}>
                <p style={{ margin: "0 0 18px", fontSize: 13, color: "rgba(250,248,245,0.75)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-dm-sans)", fontWeight: 600 }}>
                  {form.city} · {form.bedrooms}-bedroom · what rentals are going for
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 18 }}>
                  {[
                    { label: "Cheapest units", value: estimate.p25 ? `$${Math.round(estimate.p25).toLocaleString()}` : "—" },
                    { label: "Most rentals", value: `$${Math.round(estimate.median).toLocaleString()}`, highlight: true },
                    { label: "Premium units", value: estimate.p75 ? `$${Math.round(estimate.p75).toLocaleString()}` : "—" },
                  ].map((col) => (
                    <div key={col.label} style={{ textAlign: "center" }}>
                      <p style={{ margin: "0 0 8px", fontSize: 12, color: "rgba(250,248,245,0.45)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-dm-sans)", lineHeight: 1.3 }}>{col.label}</p>
                      <p style={{ margin: 0, fontSize: col.highlight ? 30 : 24, fontWeight: col.highlight ? 600 : 300, color: "#FAF8F5", fontFamily: "var(--font-cormorant)", lineHeight: 1 }}>{col.value}</p>
                    </div>
                  ))}
                </div>
                <p style={{ margin: 0, fontSize: 14, color: "rgba(250,248,245,0.6)", fontFamily: "var(--font-dm-sans)", lineHeight: 1.7 }}>
                  Based on {estimate.submission_count} real rentals in {form.city}. <strong style={{ color: "#FAF8F5" }}>Where does your unit land?</strong> Fill in your details below and we&apos;ll tell you exactly.
                </p>
              </div>
            )}

            {!estimateLoading && form.city && form.bedrooms && estimate?.source === "static" && (
              <div style={{ backgroundColor: "#F5F0EB", borderLeft: "3px solid #8B2030", borderRadius: 6, padding: "16px 20px" }}>
                <p style={{ margin: 0, fontSize: 15, color: "#333333", fontFamily: "var(--font-dm-sans)", lineHeight: 1.6 }}>
                  We don&apos;t have enough data for that segment yet — your analysis will draw on our local market knowledge directly.
                </p>
              </div>
            )}

            {/* Role */}
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#555555", fontWeight: 600, marginBottom: 10, fontFamily: "var(--font-dm-sans)" }}>
                What best describes you?
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { value: "landlord", label: "Landlord" },
                  { value: "property_manager", label: "Property Manager" },
                  { value: "realtor", label: "Realtor" },
                  { value: "other", label: "Other" },
                ].map((opt) => {
                  const selected = form.role === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set("role", selected ? "" : opt.value)}
                      style={{
                        padding: "13px 10px", fontSize: 15, minHeight: 50,
                        fontFamily: "var(--font-dm-sans)",
                        border: `2px solid ${selected ? "#8B2030" : "#D8D2C8"}`,
                        backgroundColor: selected ? "#8B2030" : "#FFFFFF",
                        color: selected ? "#FAF8F5" : "#333333",
                        cursor: "pointer", borderRadius: 8,
                        fontWeight: selected ? 600 : 400,
                        touchAction: "manipulation",
                      }}
                    >{opt.label}</button>
                  );
                })}
              </div>
            </div>

            {/* Name + Email */}
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#555555", fontWeight: 600, marginBottom: 8, fontFamily: "var(--font-dm-sans)" }}>
                Your name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Sarah"
                required
                style={{ width: "100%", backgroundColor: "#FFFFFF", border: "1px solid #D8D2C8", color: "#222222", padding: "14px 14px", fontSize: 15, fontFamily: "var(--font-dm-sans)", outline: "none", borderRadius: 6, boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#555555", fontWeight: 600, marginBottom: 8, fontFamily: "var(--font-dm-sans)" }}>
                Email address *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="you@email.com"
                required
                style={{ width: "100%", backgroundColor: "#FFFFFF", border: "1px solid #D8D2C8", color: "#222222", padding: "14px 14px", fontSize: 15, fontFamily: "var(--font-dm-sans)", outline: "none", borderRadius: 6, boxSizing: "border-box" }}
              />
            </div>

            {error && (
              <p style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)", fontSize: 15 }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)", fontSize: 15, letterSpacing: "0.1em", textTransform: "uppercase", padding: "18px 32px", border: "none", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.6 : 1, borderRadius: 6, marginTop: 4, fontWeight: 600 }}
            >
              {submitting ? "Sending..." : "Get My Personalized Analysis →"}
            </button>
            <p style={{ color: "#666666", fontFamily: "var(--font-dm-sans)", fontSize: 14, textAlign: "center" }}>
              Free. No sales call. No obligation. Just your number.
            </p>
          </form>
        </div>
      </section>

    </div>
  );
}
