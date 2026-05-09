"use client";

import { useState } from "react";
import Link from "next/link";

const CITIES = ["London", "St. Thomas", "Strathroy"];

export default function RentAnalysisPage() {
  const [form, setForm] = useState({ name: "", email: "", city: "", bedrooms: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

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
        <p style={{ color: "#999999", fontFamily: "var(--font-dm-sans)", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>
          Check your inbox
        </p>
        <p style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)", fontSize: 36, fontWeight: 300, marginBottom: 16, maxWidth: 480, lineHeight: 1.2 }}>
          Your analysis link is on its way.
        </p>
        <p style={{ color: "#444444", fontFamily: "var(--font-dm-sans)", fontSize: 14, maxWidth: 400, lineHeight: 1.7, marginBottom: 32 }}>
          We sent a personalized link to {form.email}. Click it and tell us about your property — we'll do the rest.
        </p>
        <Link
          href="/"
          style={{ color: "#999999", fontFamily: "var(--font-dm-sans)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none" }}
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
          <p style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20 }}>
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
            className="text-base leading-relaxed mb-10 max-w-lg mx-auto"
            style={{ color: "rgba(250,248,245,0.65)", fontFamily: "var(--font-dm-sans)" }}
          >
            We pull active listings, recent rentals, and local market data to tell you exactly
            what your property should be earning — and where you stand right now.
          </p>
          <a
            href="#get-analysis"
            className="inline-block px-10 py-4 text-xs font-semibold uppercase tracking-widest rounded transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
          >
            Get My Free Analysis
          </a>
        </div>
      </section>

      {/* ── What you get ── */}
      <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-5xl mx-auto">
          <p style={{ color: "#999999", fontFamily: "var(--font-dm-sans)", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", textAlign: "center", marginBottom: 12 }}>
            What&apos;s Included
          </p>
          <h2
            className="text-4xl sm:text-5xl font-light text-center mb-16 leading-tight"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
          >
            Not a guess. An actual analysis.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                num: "01",
                title: "Your market rent range",
                desc: "We show you the low, mid, and high for comparable units in your area — so you know exactly where to price.",
              },
              {
                num: "02",
                title: "What&apos;s renting nearby",
                desc: "Active listings and recent rentals in your city zone. Real competition, real prices — not averages pulled from a spreadsheet.",
              },
              {
                num: "03",
                title: "A pricing recommendation",
                desc: "Based on your property's features, condition, and the current market, we tell you what to list at to attract quality tenants fast.",
              },
            ].map((item) => (
              <div
                key={item.num}
                className="bg-white p-8 border rounded-xl"
                style={{ borderColor: "#D8D2C8", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
              >
                <span style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#D8D2C8", fontFamily: "var(--font-dm-sans)", marginBottom: 20 }}>
                  {item.num}
                </span>
                <h3
                  className="text-xl font-light mb-3"
                  style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
                  dangerouslySetInnerHTML={{ __html: item.title }}
                />
                <p className="text-sm leading-relaxed" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}
                  dangerouslySetInnerHTML={{ __html: item.desc }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Where the data comes from ── */}
      <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-4xl mx-auto">
          <p style={{ color: "#999999", fontFamily: "var(--font-dm-sans)", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", textAlign: "center", marginBottom: 12 }}>
            The Data Behind It
          </p>
          <h2
            className="text-4xl sm:text-5xl font-light text-center mb-6 leading-tight"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
          >
            We don&apos;t make numbers up.
          </h2>
          <p className="text-sm leading-relaxed text-center max-w-xl mx-auto mb-14" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
            Our analysis is built on real rental data pulled from active listings across London, St. Thomas, and Strathroy — updated regularly so you&apos;re never working from last year&apos;s market.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Active rental listings", sub: "We monitor what's currently listed in your city and zone — the real competition your unit is up against." },
              { label: "Comparable unit data", sub: "Bedrooms, bathrooms, parking, laundry, utilities — we match to units with the same features, not just the same city." },
              { label: "Local market knowledge", sub: "Two years managing rentals in Southwestern Ontario means we know which zones command a premium and why." },
              { label: "Your specific property", sub: "The form you fill in tells us about your unit's condition, features, and situation — so the analysis is yours, not generic." },
            ].map((item, i) => (
              <div
                key={i}
                className="p-7 border rounded-xl flex items-start gap-4"
                style={{ borderColor: "#D8D2C8", backgroundColor: "#F7F5F2" }}
              >
                <span style={{ color: "#8B2030", fontSize: 13, marginTop: 2, flexShrink: 0 }}>✓</span>
                <div>
                  <p className="font-semibold text-sm mb-1" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>{item.label}</p>
                  <p className="text-sm leading-relaxed" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>{item.sub}</p>
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
              <p style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)", fontSize: 42, fontWeight: 300, lineHeight: 1, marginBottom: 4 }}>{stat.value}</p>
              <p style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Form ── */}
      <section id="get-analysis" className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-lg mx-auto">
          <p style={{ color: "#999999", fontFamily: "var(--font-dm-sans)", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", textAlign: "center", marginBottom: 12 }}>
            Free · Takes 2 Minutes
          </p>
          <h2
            className="text-4xl sm:text-5xl font-light text-center mb-4 leading-tight"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
          >
            Get your analysis.
          </h2>
          <p className="text-sm text-center mb-10" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
            We&apos;ll email you a personalized link. Fill in your property details and we&apos;ll send the analysis straight to your inbox.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, color: "#444444", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, fontFamily: "var(--font-dm-sans)" }}>
                Your name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Sarah"
                required
                style={{ width: "100%", backgroundColor: "#FFFFFF", border: "1px solid #D8D2C8", color: "#222222", padding: "12px 14px", fontSize: 14, fontFamily: "var(--font-dm-sans)", outline: "none", borderRadius: 4, boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, color: "#444444", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, fontFamily: "var(--font-dm-sans)" }}>
                Email address *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="you@email.com"
                required
                style={{ width: "100%", backgroundColor: "#FFFFFF", border: "1px solid #D8D2C8", color: "#222222", padding: "12px 14px", fontSize: 14, fontFamily: "var(--font-dm-sans)", outline: "none", borderRadius: 4, boxSizing: "border-box" }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "#444444", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, fontFamily: "var(--font-dm-sans)" }}>
                  City *
                </label>
                <select
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  required
                  style={{ width: "100%", backgroundColor: "#FFFFFF", border: "1px solid #D8D2C8", color: form.city ? "#222222" : "#999999", padding: "12px 14px", fontSize: 14, fontFamily: "var(--font-dm-sans)", outline: "none", borderRadius: 4, boxSizing: "border-box" }}
                >
                  <option value="">Select city</option>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "#444444", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, fontFamily: "var(--font-dm-sans)" }}>
                  Bedrooms
                </label>
                <select
                  value={form.bedrooms}
                  onChange={(e) => set("bedrooms", e.target.value)}
                  style={{ width: "100%", backgroundColor: "#FFFFFF", border: "1px solid #D8D2C8", color: form.bedrooms ? "#222222" : "#999999", padding: "12px 14px", fontSize: 14, fontFamily: "var(--font-dm-sans)", outline: "none", borderRadius: 4, boxSizing: "border-box" }}
                >
                  <option value="">Select</option>
                  {["1","2","3","4","5+"].map((n) => <option key={n} value={n === "5+" ? "5" : n}>{n}</option>)}
                </select>
              </div>
            </div>

            {error && (
              <p style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)", fontSize: 13 }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)", fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", padding: "16px 32px", border: "none", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.6 : 1, borderRadius: 4, marginTop: 4 }}
            >
              {submitting ? "Sending..." : "Send My Analysis Link →"}
            </button>
            <p style={{ color: "#999999", fontFamily: "var(--font-dm-sans)", fontSize: 12, textAlign: "center" }}>
              Free. No sales call. No obligation. Just your number.
            </p>
          </form>
        </div>
      </section>

    </div>
  );
}
