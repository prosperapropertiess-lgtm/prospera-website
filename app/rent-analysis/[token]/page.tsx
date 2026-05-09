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

const TOTAL_STEPS = 6;

export default function RentAnalysisForm() {
  const { token } = useParams<{ token: string }>();
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  const [form, setForm] = useState({
    city: "", city_zone: "", address: "",
    property_type: "", bedrooms: "", bathrooms: "", half_bathrooms: "0",
    sqft: "", floor: "", building_era: "", units_in_building: "", separate_entrance: "",
    garage: "none", parking_spots: "0", visitor_parking: "",
    backyard: "", balcony: "", lawn_care: "",
    furnished: "unfurnished", heat_type: "", ac_type: "",
    appliance_fridge: "false", appliance_stove: "false", appliance_dishwasher: "false",
    appliance_washer: "false", appliance_dryer: "false",
    laundry: "", utilities_included: "none", pet_friendly: "",
    amenities: "", condo_fees_included: "",
    newly_renovated: "", upkeep_rating: "", transit_distance_min: "",
    rent_amount: "", is_asking_rent: "true", previous_rent: "",
    is_occupied: "", last_rent_increase: "", neighbouring_rent: "",
    lease_preference: "", available_date: "",
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

  // ── Toggle pill buttons ──────────────────────────────────────────────────
  function Toggle({
    field,
    options,
    cols,
  }: {
    field: string;
    options: { value: string; label: string }[];
    cols?: number;
  }) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: cols ? `repeat(${cols}, 1fr)` : "repeat(auto-fill, minmax(120px, 1fr))",
          gap: 10,
        }}
      >
        {options.map((opt) => {
          const selected = form[field as keyof typeof form] === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => set(field, selected ? "" : opt.value)}
              style={{
                padding: "13px 10px",
                fontSize: 15,
                minHeight: 50,
                fontFamily: "var(--font-dm-sans)",
                border: `2px solid ${selected ? "#8B2030" : "#D8D2C8"}`,
                backgroundColor: selected ? "#8B2030" : "#FFFFFF",
                color: selected ? "#FAF8F5" : "#444444",
                cursor: "pointer",
                borderRadius: 8,
                fontWeight: selected ? 600 : 400,
                touchAction: "manipulation",
                lineHeight: 1.3,
                textAlign: "center",
                transition: "border-color 0.1s",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }

  // ── Appliance card toggles ───────────────────────────────────────────────
  function ApplianceCard({ field, label, emoji }: { field: string; label: string; emoji: string }) {
    const selected = form[field as keyof typeof form] === "true";
    return (
      <button
        type="button"
        onClick={() => set(field, selected ? "false" : "true")}
        style={{
          padding: "18px 8px 14px",
          border: `2px solid ${selected ? "#8B2030" : "#D8D2C8"}`,
          backgroundColor: selected ? "#8B2030" : "#FFFFFF",
          cursor: "pointer",
          borderRadius: 10,
          textAlign: "center",
          fontFamily: "var(--font-dm-sans)",
          fontSize: 14,
          fontWeight: selected ? 600 : 400,
          color: selected ? "#FAF8F5" : "#555555",
          touchAction: "manipulation",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          transition: "border-color 0.1s",
        }}
      >
        <span style={{ fontSize: 26, lineHeight: 1 }}>{emoji}</span>
        <span>{label}</span>
        {selected && (
          <span style={{ fontSize: 11, opacity: 0.85 }}>✓ Included</span>
        )}
      </button>
    );
  }

  // ── Shared input/select styles ───────────────────────────────────────────
  const inp: React.CSSProperties = {
    width: "100%",
    backgroundColor: "#FFFFFF",
    border: "1px solid #D8D2C8",
    color: "#222222",
    padding: "14px 16px",
    fontSize: 15,
    fontFamily: "var(--font-dm-sans)",
    outline: "none",
    borderRadius: 8,
    boxSizing: "border-box",
  };

  const lbl: React.CSSProperties = {
    display: "block",
    fontSize: 14,
    fontWeight: 600,
    color: "#333333",
    marginBottom: 10,
    fontFamily: "var(--font-dm-sans)",
  };

  const hint: React.CSSProperties = {
    fontSize: 13,
    color: "#888888",
    fontFamily: "var(--font-dm-sans)",
    marginTop: 6,
  };

  const fieldGap = 24;

  // ── Step validation ──────────────────────────────────────────────────────
  function validateStep(step: number): string | null {
    if (step === 1 && !form.property_type) return "Please pick a property type.";
    if (step === 6 && (!form.rent_amount || isNaN(Number(form.rent_amount))))
      return "Please enter your current or asking rent.";
    return null;
  }

  function handleNext() {
    setError("");
    const err = validateStep(currentStep);
    if (err) { setError(err); return; }
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleBack() {
    setError("");
    setCurrentStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateStep(currentStep);
    if (err) { setError(err); return; }
    if (!form.rent_amount || !form.city) {
      setError("City and rent amount are required.");
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

  // ── Loading / error / success states ────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F7F5F2" }}>
      <p style={{ color: "#999999", fontFamily: "var(--font-dm-sans)", fontSize: 15 }}>Loading...</p>
    </div>
  );

  if (!tokenInfo?.valid) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ backgroundColor: "#F7F5F2" }}>
      <p style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)", fontSize: 34, fontWeight: 300, marginBottom: 12 }}>This link has expired</p>
      <p style={{ color: "#555555", fontFamily: "var(--font-dm-sans)", fontSize: 16, marginBottom: 32 }}>Analysis links are valid for 7 days. Request a new one below.</p>
      <Link href="/rent-analysis" style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)", fontSize: 15, padding: "14px 32px", textDecoration: "none", borderRadius: 8 }}>
        Get a New Link
      </Link>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ backgroundColor: "#F7F5F2" }}>
      <div style={{ fontSize: 48, marginBottom: 20 }}>📬</div>
      <p style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)", fontSize: 36, fontWeight: 300, marginBottom: 16, maxWidth: 480 }}>Check your inbox in a few minutes</p>
      <p style={{ color: "#444444", fontFamily: "var(--font-dm-sans)", fontSize: 16, marginBottom: 32, maxWidth: 420, lineHeight: 1.7 }}>
        We&apos;re analyzing your property against current market data. Your personalized report will land in your inbox shortly.
      </p>
      <Link href="/" style={{ color: "#888888", fontFamily: "var(--font-dm-sans)", fontSize: 15, textDecoration: "none" }}>
        ← Back to Prospera Properties
      </Link>
    </div>
  );

  // ── Step labels ──────────────────────────────────────────────────────────
  const stepLabels = ["Property", "Location", "Parking", "Inside", "Condition", "Rent"];

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <div style={{ backgroundColor: "#F7F5F2", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ backgroundColor: "#1F2F3A", padding: "20px 24px" }}>
        <p style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)", fontSize: 22, fontWeight: 300, margin: 0 }}>Prospera Properties</p>
        <p style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", margin: "4px 0 0" }}>Free Rent Analysis</p>
      </div>

      {/* Progress bar */}
      <div style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E8E4DF", padding: "16px 24px" }}>
        <div style={{ maxWidth: 580, margin: "0 auto" }}>
          {/* Step dots */}
          <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 10 }}>
            {stepLabels.map((label, i) => {
              const stepNum = i + 1;
              const done = stepNum < currentStep;
              const active = stepNum === currentStep;
              return (
                <div key={label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      backgroundColor: done ? "#8B2030" : active ? "#8B2030" : "#E8E4DF",
                      color: done || active ? "#FAF8F5" : "#AAAAAA",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700, fontFamily: "var(--font-dm-sans)",
                      flexShrink: 0,
                    }}>
                      {done ? "✓" : stepNum}
                    </div>
                    <span style={{
                      fontSize: 10, fontFamily: "var(--font-dm-sans)",
                      color: active ? "#8B2030" : done ? "#555555" : "#BBBBBB",
                      fontWeight: active ? 700 : 400,
                      whiteSpace: "nowrap",
                    }}>{label}</span>
                  </div>
                  {i < stepLabels.length - 1 && (
                    <div style={{ flex: 1, height: 2, backgroundColor: done ? "#8B2030" : "#E8E4DF", margin: "0 4px", marginBottom: 18, transition: "background-color 0.2s" }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form body */}
      <div style={{ maxWidth: 580, margin: "0 auto", padding: "36px 20px 100px" }}>

        <form onSubmit={handleSubmit}>

          {/* ── STEP 1: PROPERTY TYPE ───────────────────────────────────── */}
          {currentStep === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: fieldGap }}>
              <div>
                <h2 style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)", fontSize: 30, fontWeight: 300, margin: "0 0 6px" }}>
                  Tell us about your property
                </h2>
                <p style={{ color: "#777777", fontFamily: "var(--font-dm-sans)", fontSize: 15, margin: 0, lineHeight: 1.6 }}>
                  Start with the basics. You can always skip anything you&apos;re not sure about.
                </p>
              </div>

              <div>
                <label style={lbl}>What type of property is it? *</label>
                <Toggle field="property_type" cols={2} options={[
                  { value: "apartment", label: "Apartment" },
                  { value: "condo", label: "Condo" },
                  { value: "basement", label: "Basement unit" },
                  { value: "townhouse", label: "Townhouse" },
                  { value: "semi_detached", label: "Semi-detached" },
                  { value: "detached", label: "Detached house" },
                  { value: "bungalow", label: "Bungalow" },
                  { value: "multi_family", label: "Multi-family" },
                ]} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={lbl}>Bedrooms</label>
                  <Toggle field="bedrooms" cols={3} options={[
                    { value: "1", label: "1" },
                    { value: "2", label: "2" },
                    { value: "3", label: "3" },
                    { value: "4", label: "4" },
                    { value: "5", label: "5+" },
                  ]} />
                </div>
                <div>
                  <label style={lbl}>Full bathrooms</label>
                  <Toggle field="bathrooms" cols={3} options={[
                    { value: "1", label: "1" },
                    { value: "1.5", label: "1.5" },
                    { value: "2", label: "2" },
                    { value: "2.5", label: "2.5" },
                    { value: "3", label: "3+" },
                  ]} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={lbl}>Square footage <span style={{ fontWeight: 400, color: "#888" }}>(optional)</span></label>
                  <input type="number" value={form.sqft} onChange={(e) => set("sqft", e.target.value)} placeholder="e.g. 950" style={inp} />
                </div>
                <div>
                  <label style={lbl}>Year built</label>
                  <select value={form.building_era} onChange={(e) => set("building_era", e.target.value)} style={inp}>
                    <option value="">Not sure</option>
                    <option value="pre_1980">Before 1980</option>
                    <option value="era_1980_2000">1980–2000</option>
                    <option value="era_2000_2015">2000–2015</option>
                    <option value="era_2015_plus">2015 or newer</option>
                  </select>
                </div>
              </div>

              {form.property_type === "basement" && (
                <div>
                  <label style={lbl}>Does it have its own entrance?</label>
                  <Toggle field="separate_entrance" cols={2} options={[{ value: "true", label: "Yes, separate door" }, { value: "false", label: "No, shared entry" }]} />
                </div>
              )}

              {(form.property_type === "apartment" || form.property_type === "condo") && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={lbl}>Which floor?</label>
                    <input type="number" value={form.floor} onChange={(e) => set("floor", e.target.value)} placeholder="e.g. 3" style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Units in building</label>
                    <input type="number" value={form.units_in_building} onChange={(e) => set("units_in_building", e.target.value)} placeholder="e.g. 12" style={inp} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: LOCATION ────────────────────────────────────────── */}
          {currentStep === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: fieldGap }}>
              <div>
                <h2 style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)", fontSize: 30, fontWeight: 300, margin: "0 0 6px" }}>
                  Where is it located?
                </h2>
                <p style={{ color: "#777777", fontFamily: "var(--font-dm-sans)", fontSize: 15, margin: 0 }}>
                  Location matters a lot for rent. The more specific, the better.
                </p>
              </div>

              <div>
                <label style={lbl}>City *</label>
                <select value={form.city} onChange={(e) => { set("city", e.target.value); set("city_zone", ""); }} style={inp} required>
                  <option value="">Select city</option>
                  <option value="London">London, ON</option>
                  <option value="St. Thomas">St. Thomas, ON</option>
                  <option value="Strathroy">Strathroy, ON</option>
                </select>
              </div>

              {form.city && (
                <div>
                  <label style={lbl}>Which part of {form.city}?</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 10 }}>
                    {(CITY_ZONES[form.city] || []).map((z) => {
                      const selected = form.city_zone === z.value;
                      return (
                        <button
                          key={z.value}
                          type="button"
                          onClick={() => set("city_zone", selected ? "" : z.value)}
                          style={{
                            padding: "13px 8px", fontSize: 14, minHeight: 48,
                            fontFamily: "var(--font-dm-sans)",
                            border: `2px solid ${selected ? "#8B2030" : "#D8D2C8"}`,
                            backgroundColor: selected ? "#8B2030" : "#FFFFFF",
                            color: selected ? "#FAF8F5" : "#444444",
                            cursor: "pointer", borderRadius: 8, fontWeight: selected ? 600 : 400,
                            touchAction: "manipulation",
                          }}
                        >{z.label}</button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label style={lbl}>Street address <span style={{ fontWeight: 400, color: "#888" }}>(optional)</span></label>
                <input type="text" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="e.g. 123 Main St" style={inp} />
                <p style={hint}>Helps us compare against nearby listings. We keep this private.</p>
              </div>
            </div>
          )}

          {/* ── STEP 3: PARKING & OUTDOOR ───────────────────────────────── */}
          {currentStep === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: fieldGap }}>
              <div>
                <h2 style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)", fontSize: 30, fontWeight: 300, margin: "0 0 6px" }}>
                  Parking & outdoor space
                </h2>
                <p style={{ color: "#777777", fontFamily: "var(--font-dm-sans)", fontSize: 15, margin: 0 }}>
                  These add real dollars — parking alone can swing rent by $100+/month.
                </p>
              </div>

              <div>
                <label style={lbl}>Garage</label>
                <Toggle field="garage" cols={2} options={[
                  { value: "none", label: "No garage" },
                  { value: "single", label: "Single garage" },
                  { value: "double", label: "Double garage" },
                  { value: "attached_single", label: "Attached single" },
                  { value: "attached_double", label: "Attached double" },
                  { value: "detached", label: "Detached" },
                ]} />
              </div>

              <div>
                <label style={lbl}>How many parking spots total?</label>
                <Toggle field="parking_spots" cols={5} options={[
                  { value: "0", label: "0" },
                  { value: "1", label: "1" },
                  { value: "2", label: "2" },
                  { value: "3", label: "3" },
                  { value: "4", label: "4+" },
                ]} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={lbl}>Backyard?</label>
                  <Toggle field="backyard" cols={2} options={[{ value: "true", label: "Yes" }, { value: "false", label: "No" }]} />
                </div>
                <div>
                  <label style={lbl}>Balcony or deck?</label>
                  <Toggle field="balcony" cols={2} options={[{ value: "true", label: "Yes" }, { value: "false", label: "No" }]} />
                </div>
              </div>

              <div>
                <label style={lbl}>Visitor parking available?</label>
                <Toggle field="visitor_parking" cols={2} options={[{ value: "true", label: "Yes" }, { value: "false", label: "No" }]} />
              </div>

              <div>
                <label style={lbl}>Who handles the lawn?</label>
                <Toggle field="lawn_care" cols={1} options={[
                  { value: "tenant_self", label: "Tenant does it themselves" },
                  { value: "equipment_provided", label: "Tenant does it — equipment provided" },
                  { value: "included", label: "Included — we handle it" },
                ]} />
              </div>
            </div>
          )}

          {/* ── STEP 4: INSIDE ──────────────────────────────────────────── */}
          {currentStep === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: fieldGap }}>
              <div>
                <h2 style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)", fontSize: 30, fontWeight: 300, margin: "0 0 6px" }}>
                  Inside the unit
                </h2>
                <p style={{ color: "#777777", fontFamily: "var(--font-dm-sans)", fontSize: 15, margin: 0 }}>
                  Appliances and utilities included are some of the biggest rent drivers.
                </p>
              </div>

              <div>
                <label style={lbl}>Is it furnished?</label>
                <Toggle field="furnished" cols={1} options={[
                  { value: "unfurnished", label: "Unfurnished" },
                  { value: "semi_furnished", label: "Semi-furnished (some furniture)" },
                  { value: "fully_furnished", label: "Fully furnished" },
                ]} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={lbl}>How is it heated?</label>
                  <Toggle field="heat_type" cols={1} options={[
                    { value: "gas", label: "Gas" },
                    { value: "electric", label: "Electric" },
                    { value: "heat_pump", label: "Heat pump" },
                    { value: "baseboard", label: "Baseboard" },
                  ]} />
                </div>
                <div>
                  <label style={lbl}>Air conditioning?</label>
                  <Toggle field="ac_type" cols={1} options={[
                    { value: "central", label: "Central AC" },
                    { value: "window_unit", label: "Window unit" },
                    { value: "none", label: "No AC" },
                  ]} />
                </div>
              </div>

              <div>
                <label style={lbl}>Which appliances are included?</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
                  <ApplianceCard field="appliance_fridge" label="Fridge" emoji="🧊" />
                  <ApplianceCard field="appliance_stove" label="Stove" emoji="🍳" />
                  <ApplianceCard field="appliance_dishwasher" label="Dishwasher" emoji="🫧" />
                  <ApplianceCard field="appliance_washer" label="Washer" emoji="🌀" />
                  <ApplianceCard field="appliance_dryer" label="Dryer" emoji="♨️" />
                </div>
              </div>

              <div>
                <label style={lbl}>Laundry situation</label>
                <Toggle field="laundry" cols={1} options={[
                  { value: "in_unit", label: "In-unit washer/dryer" },
                  { value: "shared", label: "Shared laundry in building" },
                  { value: "none", label: "No laundry on site" },
                ]} />
              </div>

              <div>
                <label style={lbl}>What&apos;s included in the rent?</label>
                <Toggle field="utilities_included" cols={2} options={[
                  { value: "none", label: "Nothing — tenant pays all" },
                  { value: "water", label: "Water only" },
                  { value: "hydro", label: "Hydro (electricity)" },
                  { value: "water_hydro", label: "Water + Hydro" },
                  { value: "water_hydro_gas", label: "Water + Hydro + Gas" },
                  { value: "all", label: "Everything included" },
                ]} />
              </div>
            </div>
          )}

          {/* ── STEP 5: CONDITION ───────────────────────────────────────── */}
          {currentStep === 5 && (
            <div style={{ display: "flex", flexDirection: "column", gap: fieldGap }}>
              <div>
                <h2 style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)", fontSize: 30, fontWeight: 300, margin: "0 0 6px" }}>
                  Condition & rules
                </h2>
                <p style={{ color: "#777777", fontFamily: "var(--font-dm-sans)", fontSize: 15, margin: 0 }}>
                  Almost done. These help us fine-tune your number.
                </p>
              </div>

              <div>
                <label style={lbl}>Was it recently renovated?</label>
                <Toggle field="newly_renovated" cols={2} options={[{ value: "true", label: "Yes, within last 3 years" }, { value: "false", label: "No" }]} />
              </div>

              <div>
                <label style={lbl}>
                  How would you rate the condition?
                  {form.upkeep_rating && <span style={{ color: "#8B2030", marginLeft: 10, fontSize: 15 }}>{form.upkeep_rating}/10</span>}
                </label>
                <input
                  type="range" min="1" max="10" step="1"
                  value={form.upkeep_rating || "5"}
                  onChange={(e) => set("upkeep_rating", e.target.value)}
                  style={{ width: "100%", accentColor: "#8B2030", marginTop: 4, height: 6 }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#888888", fontFamily: "var(--font-dm-sans)", marginTop: 6 }}>
                  <span>1 — Needs work</span><span>10 — Move-in ready</span>
                </div>
              </div>

              <div>
                <label style={lbl}>Are pets allowed?</label>
                <Toggle field="pet_friendly" cols={2} options={[{ value: "true", label: "Yes" }, { value: "false", label: "No" }]} />
              </div>

              <div>
                <label style={lbl}>Are condo fees included in the rent?</label>
                <Toggle field="condo_fees_included" cols={3} options={[
                  { value: "true", label: "Yes" },
                  { value: "false", label: "No" },
                  { value: "na", label: "Not a condo" },
                ]} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={lbl}>Walk to bus stop <span style={{ fontWeight: 400, color: "#888" }}>(minutes)</span></label>
                  <input type="number" value={form.transit_distance_min} onChange={(e) => set("transit_distance_min", e.target.value)} placeholder="e.g. 5" style={inp} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <p style={{ ...hint, marginTop: 0 }}>Leave blank if not near a route or not sure.</p>
                </div>
              </div>

              <div>
                <label style={lbl}>Any building amenities? <span style={{ fontWeight: 400, color: "#888" }}>(optional)</span></label>
                <input type="text" value={form.amenities} onChange={(e) => set("amenities", e.target.value)} placeholder="e.g. gym, rooftop, visitor parking" style={inp} />
              </div>
            </div>
          )}

          {/* ── STEP 6: RENT ────────────────────────────────────────────── */}
          {currentStep === 6 && (
            <div style={{ display: "flex", flexDirection: "column", gap: fieldGap }}>
              <div>
                <h2 style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)", fontSize: 30, fontWeight: 300, margin: "0 0 6px" }}>
                  The rent numbers
                </h2>
                <p style={{ color: "#777777", fontFamily: "var(--font-dm-sans)", fontSize: 15, margin: 0 }}>
                  This is the most important part. Just the rent amount is required.
                </p>
              </div>

              <div>
                <label style={lbl}>Current or asking rent ($/month) *</label>
                <input
                  type="number"
                  value={form.rent_amount}
                  onChange={(e) => set("rent_amount", e.target.value)}
                  placeholder="e.g. 1800"
                  required
                  style={{ ...inp, fontSize: 22, fontWeight: 600, color: "#1F2F3A" }}
                />
                <div style={{ marginTop: 12 }}>
                  <Toggle field="is_asking_rent" cols={2} options={[
                    { value: "true", label: "This is what I'm asking" },
                    { value: "false", label: "A tenant is paying this now" },
                  ]} />
                </div>
              </div>

              <div>
                <label style={lbl}>Is the unit occupied right now?</label>
                <Toggle field="is_occupied" cols={2} options={[{ value: "true", label: "Yes, tenant is living there" }, { value: "false", label: "No, it's vacant" }]} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={lbl}>Available from <span style={{ fontWeight: 400, color: "#888" }}>(if vacant)</span></label>
                  <input type="date" value={form.available_date} onChange={(e) => set("available_date", e.target.value)} style={inp} />
                </div>
                <div>
                  <label style={lbl}>Last rent increase</label>
                  <input type="date" value={form.last_rent_increase} onChange={(e) => set("last_rent_increase", e.target.value)} style={inp} />
                </div>
              </div>

              <div>
                <label style={lbl}>Preferred lease length</label>
                <Toggle field="lease_preference" cols={2} options={[
                  { value: "month_to_month", label: "Month-to-month" },
                  { value: "one_year", label: "1 Year" },
                  { value: "two_year", label: "2 Years" },
                  { value: "flexible", label: "Flexible" },
                ]} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={lbl}>Previously rented for <span style={{ fontWeight: 400, color: "#888" }}>(optional)</span></label>
                  <input type="number" value={form.previous_rent} onChange={(e) => set("previous_rent", e.target.value)} placeholder="$/month" style={inp} />
                </div>
                <div>
                  <label style={lbl}>Neighbouring units rent for <span style={{ fontWeight: 400, color: "#888" }}>(optional)</span></label>
                  <input type="number" value={form.neighbouring_rent} onChange={(e) => set("neighbouring_rent", e.target.value)} placeholder="$/month" style={inp} />
                </div>
              </div>

              <div>
                <label style={lbl}>Your approach as a landlord</label>
                <Toggle field="landlord_style" cols={1} options={[
                  { value: "hands_on", label: "Hands-on — I take care of the property myself" },
                  { value: "investment", label: "Investment — I manage costs and keep it running smoothly" },
                ]} />
              </div>

              <div>
                <label style={lbl}>Anything special about this unit? <span style={{ fontWeight: 400, color: "#888" }}>(optional)</span></label>
                <input type="text" value={form.special_features} onChange={(e) => set("special_features", e.target.value)} placeholder="e.g. corner unit, backs onto park, premium double garage" style={inp} />
              </div>

              <div>
                <label style={lbl}>Anything else we should know? <span style={{ fontWeight: 400, color: "#888" }}>(optional)</span></label>
                <textarea value={form.remarks} onChange={(e) => set("remarks", e.target.value)} placeholder="Any context that helps us give you a better analysis..." style={{ ...inp, minHeight: 90, resize: "vertical" }} />
              </div>

              {/* Monthly optin */}
              <div
                style={{ padding: "16px 18px", border: "1px solid #D8D2C8", backgroundColor: "#FFFFFF", borderRadius: 8, cursor: "pointer" }}
                onClick={() => set("monthly_optin", form.monthly_optin === "true" ? "false" : "true")}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 6, flexShrink: 0, marginTop: 1,
                    border: `2px solid ${form.monthly_optin === "true" ? "#8B2030" : "#D8D2C8"}`,
                    backgroundColor: form.monthly_optin === "true" ? "#8B2030" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#FAF8F5", fontSize: 14, fontWeight: 700,
                  }}>
                    {form.monthly_optin === "true" && "✓"}
                  </div>
                  <span style={{ fontSize: 15, color: "#333333", fontFamily: "var(--font-dm-sans)", lineHeight: 1.6 }}>
                    Email me monthly market updates — how rents are moving in my city. Once a month, unsubscribe anytime.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── Error ───────────────────────────────────────────────────── */}
          {error && (
            <div style={{ marginTop: 20, padding: "14px 16px", backgroundColor: "rgba(139,32,48,0.06)", border: "1px solid rgba(139,32,48,0.2)", borderRadius: 8 }}>
              <p style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)", fontSize: 15, margin: 0 }}>{error}</p>
            </div>
          )}

          {/* ── Navigation ──────────────────────────────────────────────── */}
          <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 12 }}>
            {currentStep < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={handleNext}
                style={{
                  width: "100%", padding: "18px", fontSize: 16, fontWeight: 700,
                  fontFamily: "var(--font-dm-sans)", letterSpacing: "0.05em",
                  backgroundColor: "#8B2030", color: "#FAF8F5",
                  border: "none", cursor: "pointer", borderRadius: 10,
                  touchAction: "manipulation",
                }}
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%", padding: "18px", fontSize: 16, fontWeight: 700,
                  fontFamily: "var(--font-dm-sans)", letterSpacing: "0.05em",
                  backgroundColor: "#8B2030", color: "#FAF8F5",
                  border: "none", cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.65 : 1, borderRadius: 10,
                  touchAction: "manipulation",
                }}
              >
                {submitting ? "Sending your analysis..." : "Get My Rent Analysis →"}
              </button>
            )}

            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                style={{
                  width: "100%", padding: "16px", fontSize: 15,
                  fontFamily: "var(--font-dm-sans)",
                  backgroundColor: "transparent", color: "#777777",
                  border: "1px solid #D8D2C8", cursor: "pointer", borderRadius: 10,
                  touchAction: "manipulation",
                }}
              >
                ← Back
              </button>
            )}

            {currentStep < TOTAL_STEPS && (
              <button
                type="button"
                onClick={handleNext}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#AAAAAA", fontFamily: "var(--font-dm-sans)", fontSize: 14,
                  padding: "8px", textAlign: "center", touchAction: "manipulation",
                }}
              >
                Skip this section →
              </button>
            )}
          </div>

          <p style={{ color: "#BBBBBB", fontFamily: "var(--font-dm-sans)", fontSize: 13, textAlign: "center", marginTop: 16 }}>
            Step {currentStep} of {TOTAL_STEPS} · Your answers are saved as you go
          </p>

        </form>
      </div>
    </div>
  );
}
