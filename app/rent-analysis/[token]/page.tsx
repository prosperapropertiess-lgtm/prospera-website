"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const CITIES = ["London", "St. Thomas", "Strathroy"];
const UNIT_TYPES = ["apartment", "house", "condo", "basement"];
const LAUNDRY_OPTIONS = [
  { value: "in_unit", label: "In-unit" },
  { value: "shared", label: "Shared" },
  { value: "none", label: "None" },
];

interface TokenInfo {
  valid: boolean;
  email?: string;
  name?: string | null;
  city?: string | null;
  bedrooms?: number | null;
}

export default function RentAnalysisPage() {
  const { token } = useParams<{ token: string }>();
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    city: "",
    address: "",
    unit_type: "",
    bedrooms: "",
    bathrooms: "",
    sqft: "",
    floor: "",
    parking: "",
    laundry: "",
    utilities_included: "",
    pet_friendly: "",
    rent_amount: "",
    is_asking_rent: "true",
    is_occupied: "",
    last_rent_increase: "",
    monthly_optin: "true",
  });

  useEffect(() => {
    fetch(`/api/rent/validate-token?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        setTokenInfo(data);
        if (data.valid) {
          setForm((f) => ({
            ...f,
            city: data.city || "",
            bedrooms: data.bedrooms ? String(data.bedrooms) : "",
          }));
        }
      })
      .catch(() => setTokenInfo({ valid: false }))
      .finally(() => setLoading(false));
  }, [token]);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.rent_amount || !form.city) {
      setError("Please fill in city and current rent.");
      return;
    }
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/rent/submit-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        city: form.city,
        address: form.address || null,
        unit_type: form.unit_type || null,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
        sqft: form.sqft ? Number(form.sqft) : null,
        floor: form.floor ? Number(form.floor) : null,
        parking: form.parking === "true" ? true : form.parking === "false" ? false : null,
        laundry: form.laundry || null,
        utilities_included: form.utilities_included === "true" ? true : form.utilities_included === "false" ? false : null,
        pet_friendly: form.pet_friendly === "true" ? true : form.pet_friendly === "false" ? false : null,
        rent_amount: Number(form.rent_amount),
        is_asking_rent: form.is_asking_rent === "true",
        is_occupied: form.is_occupied === "true" ? true : form.is_occupied === "false" ? false : null,
        last_rent_increase: form.last_rent_increase || null,
        monthlyOptin: form.monthly_optin === "true",
      }),
    });

    if (res.ok) {
      setSubmitted(true);
    } else {
      const data = await res.json();
      if (res.status === 410) {
        setTokenInfo({ valid: false });
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    }
    setSubmitting(false);
  }

  // ── Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F7F5F2" }}>
        <p style={{ color: "#999999", fontFamily: "var(--font-dm-sans)", fontSize: 14 }}>Loading...</p>
      </div>
    );
  }

  // ── Invalid / expired token
  if (!tokenInfo?.valid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ backgroundColor: "#F7F5F2" }}>
        <p style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)", fontSize: 32, fontWeight: 300, marginBottom: 12 }}>
          This link has expired
        </p>
        <p style={{ color: "#444444", fontFamily: "var(--font-dm-sans)", fontSize: 14, marginBottom: 32 }}>
          Analysis links are valid for 7 days. Request a new one from the estimator.
        </p>
        <Link
          href="/#rent-estimator"
          style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", padding: "12px 28px", textDecoration: "none", borderRadius: 4 }}
        >
          Get a New Link
        </Link>
      </div>
    );
  }

  // ── Submitted confirmation
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ backgroundColor: "#F7F5F2" }}>
        <p style={{ color: "#999999", fontFamily: "var(--font-dm-sans)", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>
          Analysis Submitted
        </p>
        <p style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)", fontSize: 36, fontWeight: 300, marginBottom: 16, maxWidth: 480 }}>
          Check your inbox in a few minutes
        </p>
        <p style={{ color: "#333333", fontFamily: "var(--font-dm-sans)", fontSize: 14, marginBottom: 32, maxWidth: 400, lineHeight: 1.7 }}>
          We&apos;re analyzing your property details and market data. Your personalized report will land in your inbox shortly.
        </p>
        <Link
          href="/"
          style={{ color: "#999999", fontFamily: "var(--font-dm-sans)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none" }}
        >
          Back to Prospera Properties →
        </Link>
      </div>
    );
  }

  // ── Form
  const inputStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: "#F7F5F2",
    border: "1px solid #D8D2C8",
    color: "#222222",
    padding: "10px 14px",
    fontSize: 14,
    fontFamily: "var(--font-dm-sans)",
    outline: "none",
    borderRadius: 4,
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 11,
    color: "#444444",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: 6,
    fontFamily: "var(--font-dm-sans)",
  };

  const toggleGroup = (field: string, options: { value: string; label: string }[]) => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => set(field, form[field as keyof typeof form] === opt.value ? "" : opt.value)}
          style={{
            padding: "8px 16px",
            fontSize: 13,
            fontFamily: "var(--font-dm-sans)",
            border: `1px solid ${form[field as keyof typeof form] === opt.value ? "#8B2030" : "#D8D2C8"}`,
            backgroundColor: form[field as keyof typeof form] === opt.value ? "rgba(139,32,48,0.08)" : "transparent",
            color: form[field as keyof typeof form] === opt.value ? "#8B2030" : "#444444",
            cursor: "pointer",
            borderRadius: 4,
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ backgroundColor: "#F7F5F2", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#1F2F3A", padding: "24px 32px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <p style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)", fontSize: 22, fontWeight: 300, margin: 0 }}>
          Prospera Properties
        </p>
        <p style={{ color: "#999999", fontFamily: "var(--font-dm-sans)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", margin: "4px 0 0" }}>
          London · St. Thomas · Strathroy
        </p>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "48px 24px 80px" }}>
        <p style={{ color: "#999999", fontFamily: "var(--font-dm-sans)", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>
          Free Rent Analysis
        </p>
        <p style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)", fontSize: 36, fontWeight: 300, marginBottom: 8, lineHeight: 1.2 }}>
          Tell us about your property
        </p>
        <p style={{ color: "#333333", fontFamily: "var(--font-dm-sans)", fontSize: 14, marginBottom: 40, lineHeight: 1.7 }}>
          The more detail you give us, the more accurate your analysis will be. All fields except rent are optional.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {/* City */}
          <div>
            <label style={labelStyle}>City *</label>
            <select value={form.city} onChange={(e) => set("city", e.target.value)} style={inputStyle} required>
              <option value="">Select city</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}, ON</option>)}
            </select>
          </div>

          {/* Address */}
          <div>
            <label style={labelStyle}>Address <span style={{ color: "#AAAAAA" }}>(optional — helps us be more specific)</span></label>
            <input type="text" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="e.g. 123 Main St" style={inputStyle} />
          </div>

          {/* Unit type + Bedrooms */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Unit type</label>
              <select value={form.unit_type} onChange={(e) => set("unit_type", e.target.value)} style={inputStyle}>
                <option value="">Select type</option>
                {UNIT_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Bedrooms</label>
              <select value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} style={inputStyle}>
                <option value="">Select</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
            </div>
          </div>

          {/* Bathrooms + Sqft */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Bathrooms</label>
              <select value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} style={inputStyle}>
                <option value="">Select</option>
                <option value="1">1</option>
                <option value="1.5">1.5</option>
                <option value="2">2</option>
                <option value="2.5">2.5</option>
                <option value="3">3+</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Square footage</label>
              <input type="number" value={form.sqft} onChange={(e) => set("sqft", e.target.value)} placeholder="e.g. 850" style={inputStyle} />
            </div>
          </div>

          {/* Floor */}
          <div>
            <label style={labelStyle}>Floor <span style={{ color: "#AAAAAA" }}>(if applicable)</span></label>
            <input type="number" value={form.floor} onChange={(e) => set("floor", e.target.value)} placeholder="e.g. 2" style={{ ...inputStyle, maxWidth: 160 }} />
          </div>

          {/* Parking */}
          <div>
            <label style={labelStyle}>Parking included?</label>
            {toggleGroup("parking", [{ value: "true", label: "Yes" }, { value: "false", label: "No" }])}
          </div>

          {/* Laundry */}
          <div>
            <label style={labelStyle}>Laundry</label>
            {toggleGroup("laundry", LAUNDRY_OPTIONS)}
          </div>

          {/* Utilities */}
          <div>
            <label style={labelStyle}>Utilities included in rent?</label>
            {toggleGroup("utilities_included", [{ value: "true", label: "Yes" }, { value: "false", label: "No" }])}
          </div>

          {/* Pet friendly */}
          <div>
            <label style={labelStyle}>Pet friendly?</label>
            {toggleGroup("pet_friendly", [{ value: "true", label: "Yes" }, { value: "false", label: "No" }])}
          </div>

          {/* Rent */}
          <div>
            <label style={labelStyle}>
              Current / asking rent ($/month) *
            </label>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <input
                type="number"
                value={form.rent_amount}
                onChange={(e) => set("rent_amount", e.target.value)}
                placeholder="e.g. 1500"
                style={{ ...inputStyle, maxWidth: 200 }}
                required
              />
              {toggleGroup("is_asking_rent", [{ value: "true", label: "Asking rent" }, { value: "false", label: "Current tenant rent" }])}
            </div>
          </div>

          {/* Occupied */}
          <div>
            <label style={labelStyle}>Currently occupied?</label>
            {toggleGroup("is_occupied", [{ value: "true", label: "Yes" }, { value: "false", label: "No" }])}
          </div>

          {/* Last rent increase */}
          <div>
            <label style={labelStyle}>Last rent increase <span style={{ color: "#AAAAAA" }}>(optional)</span></label>
            <input type="date" value={form.last_rent_increase} onChange={(e) => set("last_rent_increase", e.target.value)} style={{ ...inputStyle, maxWidth: 200 }} />
          </div>

          {/* Monthly optin */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "16px", border: "1px solid #D8D2C8", backgroundColor: "#FFFFFF", borderRadius: 4 }}>
            <input
              type="checkbox"
              id="monthly_optin"
              checked={form.monthly_optin === "true"}
              onChange={(e) => set("monthly_optin", e.target.checked ? "true" : "false")}
              style={{ marginTop: 3, accentColor: "#8B2030" }}
            />
            <label htmlFor="monthly_optin" style={{ ...labelStyle, marginBottom: 0, textTransform: "none", letterSpacing: 0, fontSize: 13, color: "#333333", cursor: "pointer" }}>
              Send me monthly market updates — how rents are moving in my city, once a month. Unsubscribe anytime.
            </label>
          </div>

          {error && (
            <p style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)", fontSize: 13 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              backgroundColor: "#8B2030",
              color: "#FAF8F5",
              fontFamily: "var(--font-dm-sans)",
              fontSize: 12,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              padding: "16px 32px",
              border: "none",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.6 : 1,
              borderRadius: 4,
              alignSelf: "flex-start",
            }}
          >
            {submitting ? "Analyzing..." : "Get My Rent Analysis →"}
          </button>

          <p style={{ color: "#999999", fontFamily: "var(--font-dm-sans)", fontSize: 12 }}>
            Your report will be emailed to you within minutes of submitting.
          </p>
        </form>
      </div>
    </div>
  );
}
