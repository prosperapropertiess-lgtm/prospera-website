"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const CITY_ZONES: Record<string, { value: string; label: string }[]> = {
  London: [
    { value: "north", label: "North" },
    { value: "north_east", label: "North East" },
    { value: "north_west", label: "North West" },
    { value: "south", label: "South" },
    { value: "south_east", label: "South East" },
    { value: "south_west", label: "South West" },
    { value: "east", label: "East" },
    { value: "west", label: "West" },
    { value: "downtown", label: "Downtown" },
  ],
  "St. Thomas": [
    { value: "north", label: "North" },
    { value: "south", label: "South" },
    { value: "east", label: "East" },
    { value: "west", label: "West" },
    { value: "central", label: "Central" },
  ],
  Strathroy: [
    { value: "north", label: "North" },
    { value: "south", label: "South" },
    { value: "east", label: "East" },
    { value: "west", label: "West" },
    { value: "central", label: "Central" },
  ],
};

interface TokenInfo {
  valid: boolean;
  email?: string;
  name?: string | null;
  city?: string | null;
  bedrooms?: number | null;
}

const iStyle: React.CSSProperties = {
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

const lStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  color: "#444444",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  marginBottom: 6,
  fontFamily: "var(--font-dm-sans)",
};

const sectionHead: React.CSSProperties = {
  fontSize: 11,
  color: "#999999",
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  fontFamily: "var(--font-dm-sans)",
  borderBottom: "1px solid #D8D2C8",
  paddingBottom: 8,
  marginBottom: 20,
  marginTop: 8,
};

export default function RentAnalysisPage() {
  const { token } = useParams<{ token: string }>();
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    // Location
    city: "", city_zone: "", address: "",
    // Property
    property_type: "", bedrooms: "", bathrooms: "", half_bathrooms: "0",
    sqft: "", floor: "", building_era: "", units_in_building: "", separate_entrance: "",
    // Parking & exterior
    garage: "none", parking_spots: "0", visitor_parking: "",
    backyard: "", balcony: "", lawn_care: "",
    // Interior
    furnished: "unfurnished", heat_type: "", ac_type: "",
    // Appliances
    appliance_fridge: "false", appliance_stove: "false", appliance_dishwasher: "false",
    appliance_washer: "false", appliance_dryer: "false",
    // Utilities & rules
    laundry: "", utilities_included: "none", pet_friendly: "",
    amenities: "", condo_fees_included: "",
    // Condition
    newly_renovated: "", upkeep_rating: "", transit_distance_min: "",
    // Rent
    rent_amount: "", is_asking_rent: "true", previous_rent: "",
    is_occupied: "", last_rent_increase: "", neighbouring_rent: "",
    // Lease
    lease_preference: "", available_date: "",
    // Context
    landlord_style: "", special_features: "", remarks: "",
    monthly_optin: "true",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

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

  const toggle = (field: string, options: { value: string; label: string }[]) => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => set(field, form[field as keyof typeof form] === opt.value ? "" : opt.value)}
          style={{
            padding: "8px 14px", fontSize: 13,
            fontFamily: "var(--font-dm-sans)",
            border: `1px solid ${form[field as keyof typeof form] === opt.value ? "#8B2030" : "#D8D2C8"}`,
            backgroundColor: form[field as keyof typeof form] === opt.value ? "rgba(139,32,48,0.07)" : "transparent",
            color: form[field as keyof typeof form] === opt.value ? "#8B2030" : "#444444",
            cursor: "pointer", borderRadius: 4, transition: "all 0.15s",
          }}
        >{opt.label}</button>
      ))}
    </div>
  );

  const checkbox = (field: string, label: string) => (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "var(--font-dm-sans)", fontSize: 13, color: "#333333" }}>
      <input
        type="checkbox"
        checked={form[field as keyof typeof form] === "true"}
        onChange={(e) => set(field, e.target.checked ? "true" : "false")}
        style={{ accentColor: "#8B2030", width: 16, height: 16 }}
      />
      {label}
    </label>
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.rent_amount || !form.city) {
      setError("City and current rent are required.");
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
        city_zone: form.city_zone || null,
        address: form.address || null,
        property_type: form.property_type || null,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
        half_bathrooms: form.half_bathrooms ? Number(form.half_bathrooms) : 0,
        sqft: form.sqft ? Number(form.sqft) : null,
        floor: form.floor ? Number(form.floor) : null,
        building_era: form.building_era || null,
        units_in_building: form.units_in_building ? Number(form.units_in_building) : null,
        separate_entrance: form.separate_entrance === "true" ? true : form.separate_entrance === "false" ? false : null,
        garage: form.garage || "none",
        parking_spots: form.parking_spots ? Number(form.parking_spots) : 0,
        visitor_parking: form.visitor_parking === "true" ? true : form.visitor_parking === "false" ? false : null,
        backyard: form.backyard === "true" ? true : form.backyard === "false" ? false : null,
        balcony: form.balcony === "true" ? true : form.balcony === "false" ? false : null,
        lawn_care: form.lawn_care || null,
        furnished: form.furnished || "unfurnished",
        heat_type: form.heat_type || null,
        ac_type: form.ac_type || null,
        appliance_fridge: form.appliance_fridge === "true",
        appliance_stove: form.appliance_stove === "true",
        appliance_dishwasher: form.appliance_dishwasher === "true",
        appliance_washer: form.appliance_washer === "true",
        appliance_dryer: form.appliance_dryer === "true",
        laundry: form.laundry || null,
        utilities_included: form.utilities_included || "none",
        pet_friendly: form.pet_friendly === "true" ? true : form.pet_friendly === "false" ? false : null,
        amenities: form.amenities || null,
        condo_fees_included: form.condo_fees_included === "true" ? true : form.condo_fees_included === "false" ? false : null,
        newly_renovated: form.newly_renovated === "true" ? true : form.newly_renovated === "false" ? false : null,
        upkeep_rating: form.upkeep_rating ? Number(form.upkeep_rating) : null,
        transit_distance_min: form.transit_distance_min ? Number(form.transit_distance_min) : null,
        rent_amount: Number(form.rent_amount),
        is_asking_rent: form.is_asking_rent === "true",
        previous_rent: form.previous_rent ? Number(form.previous_rent) : null,
        is_occupied: form.is_occupied === "true" ? true : form.is_occupied === "false" ? false : null,
        last_rent_increase: form.last_rent_increase || null,
        neighbouring_rent: form.neighbouring_rent ? Number(form.neighbouring_rent) : null,
        lease_preference: form.lease_preference || null,
        available_date: form.available_date || null,
        landlord_style: form.landlord_style || null,
        special_features: form.special_features || null,
        remarks: form.remarks || null,
        monthlyOptin: form.monthly_optin === "true",
      }),
    });

    if (res.ok) {
      setSubmitted(true);
    } else {
      const data = await res.json();
      if (res.status === 410) setTokenInfo({ valid: false });
      else setError(data.error || "Something went wrong. Please try again.");
    }
    setSubmitting(false);
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F7F5F2" }}>
      <p style={{ color: "#999999", fontFamily: "var(--font-dm-sans)", fontSize: 14 }}>Loading...</p>
    </div>
  );

  if (!tokenInfo?.valid) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ backgroundColor: "#F7F5F2" }}>
      <p style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)", fontSize: 32, fontWeight: 300, marginBottom: 12 }}>This link has expired</p>
      <p style={{ color: "#444444", fontFamily: "var(--font-dm-sans)", fontSize: 14, marginBottom: 32 }}>Analysis links are valid for 7 days. Request a new one below.</p>
      <Link href="/#rent-estimator" style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", padding: "12px 28px", textDecoration: "none", borderRadius: 4 }}>
        Get a New Link
      </Link>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ backgroundColor: "#F7F5F2" }}>
      <p style={{ color: "#999999", fontFamily: "var(--font-dm-sans)", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>Analysis Submitted</p>
      <p style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)", fontSize: 36, fontWeight: 300, marginBottom: 16, maxWidth: 480 }}>Check your inbox in a few minutes</p>
      <p style={{ color: "#333333", fontFamily: "var(--font-dm-sans)", fontSize: 14, marginBottom: 32, maxWidth: 400, lineHeight: 1.7 }}>
        We&apos;re analyzing your property and market data. Your personalized report will land in your inbox shortly.
      </p>
      <Link href="/" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none" }}>
        Back to Prospera Properties →
      </Link>
    </div>
  );

  return (
    <div style={{ backgroundColor: "#F7F5F2", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#1F2F3A", padding: "24px 32px" }}>
        <p style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)", fontSize: 22, fontWeight: 300, margin: 0 }}>Prospera Properties</p>
        <p style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", margin: "4px 0 0" }}>London · St. Thomas · Strathroy</p>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px 100px" }}>
        <p style={{ color: "#999999", fontFamily: "var(--font-dm-sans)", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>Free Rent Analysis</p>
        <p style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)", fontSize: 34, fontWeight: 300, marginBottom: 8, lineHeight: 1.2 }}>Tell us about your property</p>
        <p style={{ color: "#444444", fontFamily: "var(--font-dm-sans)", fontSize: 14, marginBottom: 40, lineHeight: 1.7 }}>
          The more detail you provide, the more accurate your analysis. Only city and rent are required.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 28 }}>

          {/* ── LOCATION ── */}
          <div>
            <p style={sectionHead}>Location</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={lStyle}>City *</label>
                  <select value={form.city} onChange={(e) => { set("city", e.target.value); set("city_zone", ""); }} style={iStyle} required>
                    <option value="">Select city</option>
                    <option value="London">London, ON</option>
                    <option value="St. Thomas">St. Thomas, ON</option>
                    <option value="Strathroy">Strathroy, ON</option>
                  </select>
                </div>
                <div>
                  <label style={lStyle}>Area / Zone</label>
                  <select value={form.city_zone} onChange={(e) => set("city_zone", e.target.value)} style={iStyle} disabled={!form.city}>
                    <option value="">Select zone</option>
                    {(CITY_ZONES[form.city] || []).map((z) => <option key={z.value} value={z.value}>{z.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={lStyle}>Address <span style={{ color: "#AAAAAA", textTransform: "none", letterSpacing: 0 }}>(optional — helps us be more specific)</span></label>
                <input type="text" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="e.g. 123 Main St" style={iStyle} />
              </div>
            </div>
          </div>

          {/* ── PROPERTY ── */}
          <div>
            <p style={sectionHead}>Property</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={lStyle}>Property type</label>
                {toggle("property_type", [
                  { value: "apartment", label: "Apartment" },
                  { value: "bungalow", label: "Bungalow" },
                  { value: "townhouse", label: "Townhouse" },
                  { value: "detached", label: "Detached" },
                  { value: "semi_detached", label: "Semi-detached" },
                  { value: "multi_family", label: "Multi-family" },
                  { value: "condo", label: "Condo" },
                  { value: "basement", label: "Basement" },
                ])}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={lStyle}>Bedrooms</label>
                  <select value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} style={iStyle}>
                    <option value="">Select</option>
                    {["1","2","3","4","5"].map((n) => <option key={n} value={n}>{n}{n==="5"?"+":""}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lStyle}>Full baths</label>
                  <select value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} style={iStyle}>
                    <option value="">Select</option>
                    {["1","1.5","2","2.5","3","3.5","4"].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lStyle}>Half baths</label>
                  <select value={form.half_bathrooms} onChange={(e) => set("half_bathrooms", e.target.value)} style={iStyle}>
                    {["0","1","2"].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={lStyle}>Sqft (living space)</label>
                  <input type="number" value={form.sqft} onChange={(e) => set("sqft", e.target.value)} placeholder="e.g. 950" style={iStyle} />
                </div>
                <div>
                  <label style={lStyle}>Floor</label>
                  <input type="number" value={form.floor} onChange={(e) => set("floor", e.target.value)} placeholder="e.g. 2" style={iStyle} />
                </div>
                <div>
                  <label style={lStyle}>Units in building</label>
                  <input type="number" value={form.units_in_building} onChange={(e) => set("units_in_building", e.target.value)} placeholder="e.g. 4" style={iStyle} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={lStyle}>Year built (era)</label>
                  <select value={form.building_era} onChange={(e) => set("building_era", e.target.value)} style={iStyle}>
                    <option value="">Select</option>
                    <option value="pre_1980">Before 1980</option>
                    <option value="era_1980_2000">1980–2000</option>
                    <option value="era_2000_2015">2000–2015</option>
                    <option value="era_2015_plus">2015+</option>
                  </select>
                </div>
                <div>
                  <label style={lStyle}>Separate entrance?</label>
                  {toggle("separate_entrance", [{ value: "true", label: "Yes" }, { value: "false", label: "No" }])}
                </div>
              </div>
            </div>
          </div>

          {/* ── PARKING & EXTERIOR ── */}
          <div>
            <p style={sectionHead}>Parking & Exterior</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={lStyle}>Garage</label>
                {toggle("garage", [
                  { value: "none", label: "None" },
                  { value: "single", label: "Single" },
                  { value: "double", label: "Double" },
                  { value: "attached_single", label: "Attached Single" },
                  { value: "attached_double", label: "Attached Double" },
                  { value: "detached", label: "Detached" },
                ])}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={lStyle}>Parking spots</label>
                  <select value={form.parking_spots} onChange={(e) => set("parking_spots", e.target.value)} style={iStyle}>
                    {["0","1","2","3","4+"].map((n) => <option key={n} value={n === "4+" ? "4" : n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lStyle}>Visitor parking?</label>
                  {toggle("visitor_parking", [{ value: "true", label: "Yes" }, { value: "false", label: "No" }])}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={lStyle}>Backyard?</label>
                  {toggle("backyard", [{ value: "true", label: "Yes" }, { value: "false", label: "No" }])}
                </div>
                <div>
                  <label style={lStyle}>Balcony / deck?</label>
                  {toggle("balcony", [{ value: "true", label: "Yes" }, { value: "false", label: "No" }])}
                </div>
              </div>
              <div>
                <label style={lStyle}>Lawn care</label>
                {toggle("lawn_care", [
                  { value: "tenant_self", label: "Tenant (self)" },
                  { value: "equipment_provided", label: "Equipment provided" },
                  { value: "included", label: "Included in rent" },
                ])}
              </div>
            </div>
          </div>

          {/* ── INTERIOR & APPLIANCES ── */}
          <div>
            <p style={sectionHead}>Interior & Appliances</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={lStyle}>Furnished?</label>
                {toggle("furnished", [
                  { value: "unfurnished", label: "Unfurnished" },
                  { value: "semi_furnished", label: "Semi-furnished" },
                  { value: "fully_furnished", label: "Fully furnished" },
                ])}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={lStyle}>Heat</label>
                  {toggle("heat_type", [
                    { value: "gas", label: "Gas" },
                    { value: "electric", label: "Electric" },
                    { value: "heat_pump", label: "Heat pump" },
                    { value: "baseboard", label: "Baseboard" },
                  ])}
                </div>
                <div>
                  <label style={lStyle}>AC</label>
                  {toggle("ac_type", [
                    { value: "central", label: "Central" },
                    { value: "window_unit", label: "Window unit" },
                    { value: "none", label: "None" },
                  ])}
                </div>
              </div>
              <div>
                <label style={lStyle}>Appliances included</label>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 4 }}>
                  {checkbox("appliance_fridge", "Fridge")}
                  {checkbox("appliance_stove", "Stove")}
                  {checkbox("appliance_dishwasher", "Dishwasher")}
                  {checkbox("appliance_washer", "Washer")}
                  {checkbox("appliance_dryer", "Dryer")}
                </div>
              </div>
              <div>
                <label style={lStyle}>Laundry</label>
                {toggle("laundry", [
                  { value: "in_unit", label: "In-unit" },
                  { value: "shared", label: "Shared" },
                  { value: "none", label: "None" },
                ])}
              </div>
            </div>
          </div>

          {/* ── UTILITIES & RULES ── */}
          <div>
            <p style={sectionHead}>Utilities & Rules</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={lStyle}>Utilities included in rent</label>
                {toggle("utilities_included", [
                  { value: "none", label: "None" },
                  { value: "water", label: "Water" },
                  { value: "hydro", label: "Hydro" },
                  { value: "water_hydro", label: "Water + Hydro" },
                  { value: "water_hydro_gas", label: "Water + Hydro + Gas" },
                  { value: "all", label: "All included" },
                ])}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={lStyle}>Pets allowed?</label>
                  {toggle("pet_friendly", [{ value: "true", label: "Yes" }, { value: "false", label: "No" }])}
                </div>
                <div>
                  <label style={lStyle}>Condo fees included in rent?</label>
                  {toggle("condo_fees_included", [{ value: "true", label: "Yes" }, { value: "false", label: "No" }, { value: "na", label: "N/A" }])}
                </div>
              </div>
              <div>
                <label style={lStyle}>Building amenities <span style={{ color: "#AAAAAA", textTransform: "none", letterSpacing: 0 }}>(gym, pool, rooftop, etc.)</span></label>
                <input type="text" value={form.amenities} onChange={(e) => set("amenities", e.target.value)} placeholder="e.g. gym, visitor parking, rooftop terrace" style={iStyle} />
              </div>
            </div>
          </div>

          {/* ── CONDITION ── */}
          <div>
            <p style={sectionHead}>Condition & Access</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={lStyle}>Newly renovated?</label>
                {toggle("newly_renovated", [{ value: "true", label: "Yes" }, { value: "false", label: "No" }])}
              </div>
              <div>
                <label style={lStyle}>
                  Upkeep rating — {form.upkeep_rating ? `${form.upkeep_rating}/10` : "drag to rate"}
                  <span style={{ color: "#AAAAAA", textTransform: "none", letterSpacing: 0 }}> (1 = needs work, 10 = show-ready)</span>
                </label>
                <input
                  type="range" min="1" max="10" step="1"
                  value={form.upkeep_rating || "5"}
                  onChange={(e) => set("upkeep_rating", e.target.value)}
                  style={{ width: "100%", accentColor: "#8B2030", marginTop: 4 }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#999999", fontFamily: "var(--font-dm-sans)", marginTop: 2 }}>
                  <span>1 — Needs work</span><span>10 — Show-ready</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={lStyle}>Walk to nearest bus stop (min)</label>
                  <input type="number" value={form.transit_distance_min} onChange={(e) => set("transit_distance_min", e.target.value)} placeholder="e.g. 5" style={iStyle} />
                </div>
              </div>
            </div>
          </div>

          {/* ── RENT ── */}
          <div>
            <p style={sectionHead}>Rent</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={lStyle}>Current / asking rent ($/month) *</label>
                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <input type="number" value={form.rent_amount} onChange={(e) => set("rent_amount", e.target.value)} placeholder="e.g. 1800" style={{ ...iStyle, maxWidth: 180 }} required />
                  {toggle("is_asking_rent", [{ value: "true", label: "Asking rent" }, { value: "false", label: "Current tenant" }])}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={lStyle}>Previously rented for</label>
                  <input type="number" value={form.previous_rent} onChange={(e) => set("previous_rent", e.target.value)} placeholder="$/month" style={iStyle} />
                </div>
                <div>
                  <label style={lStyle}>Neighbouring unit rent</label>
                  <input type="number" value={form.neighbouring_rent} onChange={(e) => set("neighbouring_rent", e.target.value)} placeholder="$/month (if known)" style={iStyle} />
                </div>
              </div>
              <div>
                <label style={lStyle}>Currently occupied?</label>
                {toggle("is_occupied", [{ value: "true", label: "Yes" }, { value: "false", label: "No" }])}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={lStyle}>Last rent increase</label>
                  <input type="date" value={form.last_rent_increase} onChange={(e) => set("last_rent_increase", e.target.value)} style={iStyle} />
                </div>
                <div>
                  <label style={lStyle}>Available date</label>
                  <input type="date" value={form.available_date} onChange={(e) => set("available_date", e.target.value)} style={iStyle} />
                </div>
              </div>
              <div>
                <label style={lStyle}>Preferred lease length</label>
                {toggle("lease_preference", [
                  { value: "month_to_month", label: "Month-to-month" },
                  { value: "one_year", label: "1 Year" },
                  { value: "two_year", label: "2 Year" },
                  { value: "flexible", label: "Flexible" },
                ])}
              </div>
            </div>
          </div>

          {/* ── CONTEXT ── */}
          <div>
            <p style={sectionHead}>Your Approach</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={lStyle}>Landlord style</label>
                {toggle("landlord_style", [
                  { value: "hands_on", label: "Hands-on — I fix things, it's my property" },
                  { value: "investment", label: "Investment — we manage costs, adjust as needed" },
                ])}
              </div>
              <div>
                <label style={lStyle}>Special features worth noting <span style={{ color: "#AAAAAA", textTransform: "none", letterSpacing: 0 }}>(corner unit, premium for double garage, etc.)</span></label>
                <input type="text" value={form.special_features} onChange={(e) => set("special_features", e.target.value)} placeholder="e.g. Corner unit, backs onto park, double car garage commands $50+ premium" style={iStyle} />
              </div>
              <div>
                <label style={lStyle}>Anything else we should know</label>
                <textarea value={form.remarks} onChange={(e) => set("remarks", e.target.value)} placeholder="Any context that helps us give you a better analysis..." style={{ ...iStyle, minHeight: 80, resize: "vertical" }} />
              </div>
            </div>
          </div>

          {/* ── OPT-IN ── */}
          <div style={{ padding: 16, border: "1px solid #D8D2C8", backgroundColor: "#FFFFFF", borderRadius: 4 }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
              <input type="checkbox" id="monthly_optin" checked={form.monthly_optin === "true"} onChange={(e) => set("monthly_optin", e.target.checked ? "true" : "false")} style={{ marginTop: 3, accentColor: "#8B2030" }} />
              <span style={{ fontSize: 13, color: "#333333", fontFamily: "var(--font-dm-sans)", lineHeight: 1.6 }}>
                Email me monthly market updates — how rents are moving in my city. Once a month, unsubscribe anytime.
              </span>
            </label>
          </div>

          {error && <p style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)", fontSize: 13 }}>{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)", fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", padding: "16px 32px", border: "none", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.6 : 1, borderRadius: 4 }}
          >
            {submitting ? "Analyzing..." : "Get My Rent Analysis →"}
          </button>
          <p style={{ color: "#999999", fontFamily: "var(--font-dm-sans)", fontSize: 12 }}>
            Your report will be emailed within minutes.
          </p>
        </form>
      </div>
    </div>
  );
}
