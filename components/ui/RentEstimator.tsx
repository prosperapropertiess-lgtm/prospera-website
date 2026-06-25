"use client";

import { useState } from "react";
import AddressAutocomplete from "@/components/ui/AddressAutocomplete";

// Fallback static estimates if live data isn't available yet
const FALLBACK: Record<string, Record<number, { low: number; high: number }>> = {
  London: {
    1: { low: 1350, high: 1800 },
    2: { low: 1650, high: 2300 },
    3: { low: 2100, high: 2950 },
    4: { low: 2600, high: 3600 },
  },
  "St. Thomas": {
    1: { low: 1150, high: 1400 },
    2: { low: 1400, high: 1700 },
    3: { low: 1800, high: 2100 },
    4: { low: 2200, high: 2700 },
  },
  Strathroy: {
    1: { low: 950, high: 1250 },
    2: { low: 1250, high: 1600 },
    3: { low: 1600, high: 1950 },
    4: { low: 2000, high: 2400 },
  },
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  borderColor: "#D8D2C8",
  backgroundColor: "#FFFFFF",
  color: "#222222",
  fontFamily: "var(--font-dm-sans)",
  padding: "11px 14px",
  fontSize: 14,
  border: "1px solid #D8D2C8",
  borderRadius: 4,
  outline: "none",
  boxSizing: "border-box",
};

export default function RentEstimator() {
  const [city, setCity] = useState("");
  const [beds, setBeds] = useState<number | "">("");
  const [result, setResult] = useState<{ low: number; high: number; live: boolean; count?: number } | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "done">("idle");

  const [lead, setLead] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    owner_role: "",
    properties_owned: "",
    management_status: "",
    best_time_to_call: "",
  });

  function setLeadField(field: string, value: string) {
    setLead((l) => ({ ...l, [field]: value }));
  }

  async function estimate() {
    if (!city || !beds) return;
    setEstimating(true);

    // Set static fallback immediately so something always shows
    const fallback = FALLBACK[city]?.[beds as number] ?? FALLBACK[city]?.[4];
    if (fallback) setResult({ ...fallback, live: false });

    // Try to upgrade to live data
    try {
      const res = await fetch(`/api/rent/market-estimate?city=${encodeURIComponent(city)}&bedrooms=${beds}`);
      if (res.ok) {
        const data = await res.json();
        if (data.source === "computed" && data.p25 && data.p75) {
          setResult({ low: Math.round(data.p25), high: Math.round(data.p75), live: true, count: data.submission_count });
        }
      }
    } catch {
      // Already showing fallback — nothing more to do
    }

    setEstimating(false);
  }

  async function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lead.email || !lead.name) return;
    setSubmitStatus("loading");

    await fetch("/api/rent/request-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...lead,
        properties_owned: lead.properties_owned ? Number(lead.properties_owned) : null,
        city,
        bedrooms: beds || null,
        estimated_rent_low: result?.low ?? null,
        estimated_rent_high: result?.high ?? null,
      }),
    });

    setSubmitStatus("done");
  }

  const spread = result ? result.high - result.low : 0;

  const toggleBtn = (field: string, value: string, label: string) => (
    <button
      key={value}
      type="button"
      onClick={() => setLeadField(field, lead[field as keyof typeof lead] === value ? "" : value)}
      style={{
        padding: "8px 14px",
        fontSize: 13,
        fontFamily: "var(--font-dm-sans)",
        border: `1px solid ${lead[field as keyof typeof lead] === value ? "#8B2030" : "#D8D2C8"}`,
        backgroundColor: lead[field as keyof typeof lead] === value ? "rgba(139,32,48,0.07)" : "transparent",
        color: lead[field as keyof typeof lead] === value ? "#8B2030" : "#333333",
        cursor: "pointer",
        borderRadius: 4,
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );

  return (
    <div id="rent-estimator" className="px-5 sm:px-8 py-16" style={{ backgroundColor: "#F7F5F2", borderTop: "1px solid #D8D2C8", borderBottom: "1px solid #D8D2C8" }}>
      <div className="max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
          Free Tool
        </p>
        <h2 className="text-3xl md:text-4xl font-light mb-3" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
          What could your property rent for?
        </h2>
        <p className="text-sm mb-8" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
          Get an instant estimate based on current market rents in your city.
        </p>

        {/* Step 1 — Quick estimate */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <select
            value={city}
            onChange={(e) => { setCity(e.target.value); setResult(null); setShowLeadForm(false); }}
            className="flex-1 px-4 py-3 text-sm outline-none border rounded"
            style={{ borderColor: "#D8D2C8", backgroundColor: "#FFFFFF", color: "#222222", fontFamily: "var(--font-dm-sans)" }}
          >
            <option value="">Select city</option>
            <option value="London">London, ON</option>
            <option value="St. Thomas">St. Thomas, ON</option>
            <option value="Strathroy">Strathroy, ON</option>
          </select>

          <select
            value={beds}
            onChange={(e) => { setBeds(e.target.value ? Number(e.target.value) : ""); setResult(null); setShowLeadForm(false); }}
            className="flex-1 px-4 py-3 text-sm outline-none border rounded"
            style={{ borderColor: "#D8D2C8", backgroundColor: "#FFFFFF", color: "#222222", fontFamily: "var(--font-dm-sans)" }}
          >
            <option value="">Bedrooms</option>
            <option value="1">1 Bedroom</option>
            <option value="2">2 Bedrooms</option>
            <option value="3">3 Bedrooms</option>
            <option value="4">4+ Bedrooms</option>
          </select>

          <button
            onClick={estimate}
            disabled={!city || beds === "" || estimating}
            className="px-8 py-3 text-xs uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-40 rounded"
            style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
          >
            {estimating ? "..." : "Estimate"}
          </button>
        </div>

        {/* Step 2 — Result + hook */}
        {result && !showLeadForm && submitStatus !== "done" && (
          <div className="border bg-white p-7 rounded-xl" style={{ borderColor: "#D8D2C8", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="flex items-baseline gap-3 mb-2">
              <p className="text-5xl font-light" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
                ${result.low.toLocaleString()} – ${result.high.toLocaleString()}
              </p>
              <span className="text-sm" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>/month</span>
            </div>
            <p className="text-xs mb-5" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
              {result?.live
                ? `Based on ${result.count} active listings · ${beds}-bed units in ${city}`
                : `City-wide estimate for ${beds}-bed units in ${city}`}
            </p>

            <div className="border-t pt-5" style={{ borderColor: "#F0EDE8" }}>
              <p className="text-base mb-2 font-light leading-snug" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)", fontSize: 22 }}>
                That ${spread.toLocaleString()}/month spread is ${(spread * 12).toLocaleString()}/year.
              </p>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                This range doesn&apos;t account for your city zone, garage, finishes, inclusions, transit access, or 15 other factors that actually move rent. Your unit could sit at either end — or outside it entirely. A precise number takes 3 minutes.
              </p>
              <button
                onClick={() => setShowLeadForm(true)}
                className="w-full py-4 text-xs uppercase tracking-widest rounded transition-opacity hover:opacity-80"
                style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
              >
                Get My Precise Estimate — Free →
              </button>
              <p className="text-xs text-center mt-3" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
                Personalized analysis emailed within the hour. No obligation.
              </p>
            </div>
          </div>
        )}

        {/* Step 3 — Lead capture form */}
        {showLeadForm && submitStatus !== "done" && (
          <div className="border bg-white p-7 rounded-xl" style={{ borderColor: "#D8D2C8", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
              Step 2 of 2
            </p>
            <p className="text-xl font-light mb-1" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              Tell us where to send your analysis
            </p>
            <p className="text-sm mb-6" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
              We&apos;ll email you a secure link to fill out the full property details. Takes 3 minutes.
            </p>

            <form onSubmit={handleLeadSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "#666666", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5, fontFamily: "var(--font-dm-sans)" }}>Name *</label>
                  <input type="text" required value={lead.name} onChange={(e) => setLeadField("name", e.target.value)} placeholder="First name" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "#666666", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5, fontFamily: "var(--font-dm-sans)" }}>Email *</label>
                  <input type="email" required value={lead.email} onChange={(e) => setLeadField("email", e.target.value)} placeholder="your@email.com" style={inputStyle} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "#666666", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5, fontFamily: "var(--font-dm-sans)" }}>Phone</label>
                  <input type="tel" value={lead.phone} onChange={(e) => setLeadField("phone", e.target.value)} placeholder="(519) 000-0000" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "#666666", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5, fontFamily: "var(--font-dm-sans)" }}>Best time to call</label>
                  <select value={lead.best_time_to_call} onChange={(e) => setLeadField("best_time_to_call", e.target.value)} style={inputStyle}>
                    <option value="">Select</option>
                    <option value="morning">Morning (8–12)</option>
                    <option value="afternoon">Afternoon (12–5)</option>
                    <option value="evening">Evening (5–8)</option>
                    <option value="anytime">Anytime</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, color: "#666666", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5, fontFamily: "var(--font-dm-sans)" }}>Property address</label>
                <AddressAutocomplete value={lead.address} onChange={(val) => setLeadField("address", val)} placeholder="123 Main St (optional)" style={inputStyle} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, color: "#666666", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontFamily: "var(--font-dm-sans)" }}>I am a</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {toggleBtn("owner_role", "landlord", "Landlord")}
                  {toggleBtn("owner_role", "realtor", "Realtor")}
                  {toggleBtn("owner_role", "property_manager", "Property Manager")}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "#666666", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5, fontFamily: "var(--font-dm-sans)" }}>Properties owned / managed</label>
                  <select value={lead.properties_owned} onChange={(e) => setLeadField("properties_owned", e.target.value)} style={inputStyle}>
                    <option value="">Select</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3–5</option>
                    <option value="6">6–10</option>
                    <option value="11">11+</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, color: "#666666", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontFamily: "var(--font-dm-sans)" }}>Currently</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {toggleBtn("management_status", "self_managing", "Self-managing")}
                    {toggleBtn("management_status", "using_pm", "Using a PM")}
                    {toggleBtn("management_status", "first_time", "First rental")}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitStatus === "loading"}
                className="w-full py-4 text-xs uppercase tracking-widest rounded transition-opacity hover:opacity-80 disabled:opacity-50 mt-1"
                style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
              >
                {submitStatus === "loading" ? "Sending..." : "Send Me the Analysis Link →"}
              </button>

              <button
                type="button"
                onClick={() => setShowLeadForm(false)}
                className="text-xs text-center transition-opacity hover:opacity-60"
                style={{ color: "#666666", fontFamily: "var(--font-dm-sans)", background: "none", border: "none", cursor: "pointer" }}
              >
                ← Back to estimate
              </button>
            </form>
          </div>
        )}

        {/* Done state */}
        {submitStatus === "done" && (
          <div className="border bg-white p-7 rounded-xl text-center" style={{ borderColor: "#D8D2C8", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <p className="text-3xl font-light mb-3" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              Check your inbox.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
              We sent you a secure link to complete your property details. The full analysis will be emailed back within the hour.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
