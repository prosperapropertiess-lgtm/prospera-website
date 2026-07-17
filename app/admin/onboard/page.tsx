"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AddressAutocomplete from "@/components/ui/AddressAutocomplete";

const BG          = "#F5F4F1";
const CARD        = "#FFFFFF";
const CARD_BORDER = "rgba(15,28,40,0.07)";
const CARD_SHADOW = "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)";
const NAVY        = "#0F1C28";
const MUTED       = "rgba(15,28,40,0.60)";
const SUBTLE      = "rgba(15,28,40,0.42)";
const BURGUNDY    = "#8B2030";
const GREEN       = "#0A7A52";
const GREEN_BG    = "rgba(10,122,82,0.09)";
const AMBER       = "#B45309";
const AMBER_BG    = "rgba(180,83,9,0.09)";
const RED         = "#B91C1C";
const RED_BG      = "rgba(185,28,28,0.08)";
const INPUT_BORDER = "rgba(15,28,40,0.12)";

interface Session {
  id: string;
  token: string;
  current_step: number;
  status: string;
  service_type: string;
  owner_name: string | null;
  owner_email: string | null;
  property_address: string | null;
  created_at: string;
  placement_completed_at: string | null;
  completed_at: string | null;
}

const PROPERTY_TYPES = ["House", "Townhouse", "Apartment", "Duplex", "Triplex", "Condo", "Other"];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function statusStyle(status: string) {
  if (status === "complete")    return { border: GREEN,  badge: GREEN,  badgeBg: GREEN_BG,  label: "Complete"    };
  if (status === "in_progress") return { border: AMBER,  badge: AMBER,  badgeBg: AMBER_BG,  label: "In Progress" };
  return                               { border: RED,    badge: RED,    badgeBg: RED_BG,    label: "New"         };
}

function SkeletonCard() {
  return (
    <div style={{
      background: CARD, border: `1px solid ${CARD_BORDER}`, boxShadow: CARD_SHADOW,
      borderRadius: 16, padding: "22px 24px", borderLeft: `3px solid ${CARD_BORDER}`,
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ height: 16, width: "40%", borderRadius: 8, background: "rgba(15,28,40,0.07)", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ height: 13, width: "60%", borderRadius: 8, background: "rgba(15,28,40,0.05)", animation: "pulse 1.5s ease-in-out infinite" }} />
        <div style={{ height: 6, borderRadius: 4, background: "rgba(15,28,40,0.05)", marginTop: 4, animation: "pulse 1.5s ease-in-out infinite" }} />
      </div>
    </div>
  );
}

function InputField({
  label, value, onChange, type = "text", placeholder, required, as,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean; as?: "select";
}) {
  const inputStyle: React.CSSProperties = {
    width: "100%", background: CARD, border: `1px solid ${INPUT_BORDER}`,
    borderRadius: 10, padding: "10px 14px", fontSize: 15, color: NAVY,
    fontFamily: "var(--font-poppins), -apple-system, sans-serif",
    outline: "none", boxSizing: "border-box", transition: "border-color 0.15s",
  };

  return (
    <div>
      <label style={{
        display: "block", fontSize: 12, fontWeight: 600, color: SUBTLE,
        textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6,
        fontFamily: "var(--font-poppins), -apple-system, sans-serif",
      }}>
        {label}{required && <span style={{ color: BURGUNDY }}> *</span>}
      </label>
      {as === "select" ? (
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={inputStyle}
          onFocus={e => { e.target.style.borderColor = "rgba(139,32,48,0.40)"; }}
          onBlur={e => { e.target.style.borderColor = INPUT_BORDER; }}
        >
          <option value="">Select type…</option>
          {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      ) : (
        <input
          type={type} value={value} placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          style={inputStyle}
          onFocus={e => { e.target.style.borderColor = "rgba(139,32,48,0.40)"; }}
          onBlur={e => { e.target.style.borderColor = INPUT_BORDER; }}
        />
      )}
    </div>
  );
}

export default function OnboardListPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState("");
  const [deleting, setDeleting]     = useState<string | null>(null);

  const [ownerName,        setOwnerName]        = useState("");
  const [ownerEmail,       setOwnerEmail]        = useState("");
  const [ownerPhone,       setOwnerPhone]        = useState("");
  const [propertyAddress,  setPropertyAddress]   = useState("");
  const [propertyLat,      setPropertyLat]       = useState<number | null>(null);
  const [propertyLng,      setPropertyLng]       = useState<number | null>(null);
  const [propertyType,     setPropertyType]      = useState("");
  const [serviceType,      setServiceType]       = useState<"placement" | "management">("placement");
  const [propertyCity,     setPropertyCity]       = useState("London");
  const [bedrooms,         setBedrooms]           = useState("2");
  const [bathrooms,        setBathrooms]          = useState("1");
  const [parkingSpots,     setParkingSpots]       = useState("0");
  const [parkingType,      setParkingType]        = useState("none");
  const [propertyCondition, setPropertyCondition] = useState("");
  const [ownerChecks, setOwnerChecks] = useState<string[]>([]);
  const [agentNotes,  setAgentNotes]  = useState("");
  const [ownerActionItems,  setOwnerActionItems]   = useState("");
  const [rentLow,          setRentLow]            = useState("");
  const [rentMarket,       setRentMarket]         = useState("");
  const [rentPremium,      setRentPremium]        = useState("");
  const [comps, setComps] = useState<Array<{ address: string; rent: string; days_on_market: string; ad_description: string; notes: string }>>([]);
  const [autoFilling, setAutoFilling] = useState(false);
  const [parsing, setParsing]         = useState(false);
  const [parseInsights, setParseInsights] = useState("");
  const [marketResearch, setMarketResearch] = useState("");

  useEffect(() => {
    fetch("/api/onboard/list", {
      headers: { "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "" },
    })
      .then(r => r.json())
      .then(d => { setSessions(d.sessions ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function resetForm() {
    setOwnerName(""); setOwnerEmail(""); setOwnerPhone("");
    setPropertyAddress(""); setPropertyLat(null); setPropertyLng(null); setPropertyType(""); setPropertyCity("London");
    setBedrooms("2"); setBathrooms("1"); setParkingSpots("0"); setParkingType("none"); setPropertyCondition(""); setOwnerChecks([]); setAgentNotes(""); setOwnerActionItems("");
    setRentLow(""); setRentMarket(""); setRentPremium("");
    setComps([]); setMarketResearch(""); setServiceType("placement"); setFormError(""); setParseInsights("");
  }

  async function handleDelete(token: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this onboarding session? This cannot be undone.")) return;
    setDeleting(token);
    try {
      await fetch(`/api/onboard/${token}/delete`, {
        method: "DELETE",
        headers: { "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "" },
      });
      setSessions(prev => prev.filter(s => s.token !== token));
    } finally {
      setDeleting(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ownerName.trim() || !ownerEmail.trim() || !propertyAddress.trim()) {
      setFormError("Name, email and property address are required.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const r = await fetch("/api/onboard/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "",
        },
        body: JSON.stringify({
          owner_name: ownerName.trim(),
          owner_email: ownerEmail.trim(),
          owner_phone: ownerPhone.trim() || undefined,
          property_address: propertyAddress.trim(),
          property_lat: propertyLat ?? undefined,
          property_lng: propertyLng ?? undefined,
          property_type: propertyType || undefined,
          service_type: serviceType,
          ...(serviceType === "placement" ? {
            property_city: propertyCity,
            bedrooms: Number(bedrooms) || 2,
            bathrooms: bathrooms ? Number(bathrooms) : null,
            parking_spots: parkingSpots ? Number(parkingSpots) : null,
            parking_type: parkingType || null,
            property_condition: propertyCondition || null,
            owner_action_items: (() => {
              const parts: string[] = [];
              if (ownerChecks.length) parts.push(ownerChecks.map(c => `- ${c}`).join("\n"));
              if (agentNotes.trim()) parts.push(`Agent notes: ${agentNotes.trim()}`);
              return parts.length ? parts.join("\n\n") : null;
            })(),
            rent_low: Number(rentLow) || undefined,
            rent_market: Number(rentMarket) || undefined,
            rent_premium: Number(rentPremium) || undefined,
            comparables: comps.filter(c => c.address.trim()).map(c => ({
              address: c.address.trim(),
              rent: Number(c.rent) || 0,
              days_on_market: c.days_on_market ? Number(c.days_on_market) : null,
              ad_description: c.ad_description || "",
              notes: c.notes || "",
            })),
            market_research: marketResearch || undefined,
          } : {}),
        }),
      });
      const d = await r.json();
      if (!r.ok) { setFormError(d.error ?? "Something went wrong."); setSubmitting(false); return; }
      router.push(`/admin/onboard/${d.token}`);
    } catch {
      setFormError("Network error. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: BG,
      fontFamily: "var(--font-poppins), -apple-system, sans-serif",
    }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 28px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: NAVY, letterSpacing: "-0.02em" }}>
              Onboarding
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: MUTED }}>
              {sessions.length > 0 ? `${sessions.length} session${sessions.length > 1 ? "s" : ""}` : "No sessions yet"}
            </p>
          </div>
          <button
            onClick={() => { setShowForm(f => !f); resetForm(); }}
            style={{
              background: showForm ? "rgba(15,28,40,0.07)" : BURGUNDY,
              color: showForm ? NAVY : "#fff",
              border: "none", borderRadius: 10, padding: "12px 22px",
              fontSize: 15, fontWeight: 700, cursor: "pointer",
              fontFamily: "var(--font-poppins), -apple-system, sans-serif",
              transition: "all 0.15s",
            }}
          >
            {showForm ? "Cancel" : "+ Add Landlord"}
          </button>
        </div>

        {/* Inline form */}
        {showForm && (
          <div style={{
            background: CARD, border: `1px solid ${CARD_BORDER}`, borderTop: `3px solid ${BURGUNDY}`,
            borderRadius: 20, boxShadow: CARD_SHADOW, padding: "28px 28px 24px",
            marginBottom: 24, animation: "slideDown 0.2s ease",
          }}>
            <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700, color: NAVY }}>
              Add New Landlord
            </h2>
            <p style={{ margin: "0 0 16px", fontSize: 14, color: MUTED }}>
              A welcome email with their onboarding link will be sent immediately.
            </p>

            {/* Discovery Call Script */}
            <details style={{ marginBottom: 20, background: "#f6f4f1", border: `1px solid ${CARD_BORDER}`, borderRadius: 12, overflow: "hidden" }}>
              <summary style={{ padding: "14px 18px", cursor: "pointer", fontSize: 13, fontWeight: 700, color: NAVY, fontFamily: "var(--font-poppins), -apple-system, sans-serif", listStyle: "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>📞 Discovery Call Script</span>
                <span style={{ fontSize: 11, color: MUTED, fontWeight: 500 }}>Click to expand</span>
              </summary>
              <div style={{ padding: "0 18px 18px", fontSize: 14, color: NAVY, lineHeight: 1.8, fontFamily: "var(--font-poppins), -apple-system, sans-serif" }}>
                <div style={{ marginBottom: 16 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: BURGUNDY, textTransform: "uppercase", letterSpacing: "0.08em" }}>1. Anchor the deal</p>
                  <p style={{ margin: 0, color: MUTED }}>&quot;Can I grab the property address first?&quot;</p>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: BURGUNDY, textTransform: "uppercase", letterSpacing: "0.08em" }}>2. Property snapshot</p>
                  <p style={{ margin: 0, color: MUTED }}>What type of property? How many beds and baths? Vacant or occupied?</p>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: BURGUNDY, textTransform: "uppercase", letterSpacing: "0.08em" }}>3. Rental expectations</p>
                  <p style={{ margin: 0, color: MUTED }}>What rent are you hoping to achieve? Based on past rent or market guess?</p>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: BURGUNDY, textTransform: "uppercase", letterSpacing: "0.08em" }}>4. Ownership history</p>
                  <p style={{ margin: 0, color: MUTED }}>Rented before? Self-managed or through a PM? What happened?</p>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: BURGUNDY, textTransform: "uppercase", letterSpacing: "0.08em" }}>5. Situation check (find the pain)</p>
                  <p style={{ margin: 0, color: MUTED }}>What&apos;s happening right now that made you reach out? Any vacancy or timing pressure?</p>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: BURGUNDY, textTransform: "uppercase", letterSpacing: "0.08em" }}>6. Service branch</p>
                  <p style={{ margin: 0, color: MUTED }}>Looking for tenant placement or full property management?</p>
                </div>
                <div>
                  <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: BURGUNDY, textTransform: "uppercase", letterSpacing: "0.08em" }}>7. Soft close</p>
                  <p style={{ margin: 0, color: MUTED }}>&quot;If everything lines up, are you looking to move forward quickly or still comparing options?&quot;</p>
                </div>
                <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(139,32,48,0.06)", borderRadius: 8, fontSize: 12, color: MUTED }}>
                  <strong style={{ color: NAVY }}>Close:</strong> &quot;I&apos;ll send you our analysis with a detailed market report and our services breakdown. You can review it at your own pace and sign the agreement when you&apos;re ready.&quot;
                </div>
              </div>
            </details>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px", marginBottom: 20 }}>
                <InputField label="Owner Name"       value={ownerName}       onChange={setOwnerName}       placeholder="Jane Smith"          required />
                <InputField label="Email"            value={ownerEmail}      onChange={setOwnerEmail}      type="email" placeholder="jane@email.com" required />
                <InputField label="Phone"            value={ownerPhone}      onChange={setOwnerPhone}      placeholder="(519) 555-0100" />
                <InputField label="Property Type"    value={propertyType}    onChange={setPropertyType}    as="select" />
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{
                    display: "block", fontSize: 12, fontWeight: 600, color: SUBTLE,
                    textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6,
                    fontFamily: "var(--font-poppins), -apple-system, sans-serif",
                  }}>
                    Property Address <span style={{ color: BURGUNDY }}>*</span>
                  </label>
                  <AddressAutocomplete
                    value={propertyAddress}
                    onChange={setPropertyAddress}
                    onPlaceSelect={(place) => {
                      setPropertyAddress(place.street_address);
                      setPropertyLat(place.lat);
                      setPropertyLng(place.lng);
                      if (place.city) {
                        const cityMap: Record<string, string> = {
                          "London": "London",
                          "St. Thomas": "St. Thomas",
                          "Saint Thomas": "St. Thomas",
                          "Strathroy": "Strathroy",
                        };
                        const mapped = cityMap[place.city];
                        if (mapped) setPropertyCity(mapped);
                      }
                    }}
                    placeholder="27 Horton Street, St. Thomas"
                    country="ca"
                    className=""
                    style={{
                      width: "100%", background: CARD, border: `1px solid ${INPUT_BORDER}`,
                      borderRadius: 10, padding: "10px 14px", fontSize: 15, color: NAVY,
                      fontFamily: "var(--font-poppins), -apple-system, sans-serif",
                      outline: "none", boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Service type selector */}
              <div style={{ marginBottom: 20 }}>
                <p style={{
                  fontSize: 12, fontWeight: 600, color: SUBTLE, textTransform: "uppercase",
                  letterSpacing: "0.07em", marginBottom: 10,
                  fontFamily: "var(--font-poppins), -apple-system, sans-serif",
                }}>Service</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {(["placement", "management"] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setServiceType(type)}
                      style={{
                        padding: "14px 16px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                        border: `2px solid ${serviceType === type ? BURGUNDY : CARD_BORDER}`,
                        background: serviceType === type ? "rgba(139,32,48,0.04)" : CARD,
                        transition: "all 0.15s", fontFamily: "var(--font-poppins), -apple-system, sans-serif",
                      }}
                    >
                      <p style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700, color: serviceType === type ? BURGUNDY : NAVY }}>
                        {type === "placement" ? "Tenant Placement" : "Placement + Management"}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: MUTED }}>
                        {type === "placement"
                          ? "Find & place a tenant. One-time fee."
                          : "Place a tenant then manage ongoing."}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Placement-specific: market comp fields */}
              {serviceType === "placement" && (
                <div style={{ marginBottom: 20, animation: "slideDown 0.2s ease" }}>
                  <p style={{
                    fontSize: 12, fontWeight: 600, color: SUBTLE, textTransform: "uppercase",
                    letterSpacing: "0.07em", marginBottom: 10,
                    fontFamily: "var(--font-poppins), -apple-system, sans-serif",
                  }}>Market Comps (included in welcome email)</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: SUBTLE, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6, fontFamily: "var(--font-poppins), -apple-system, sans-serif" }}>City</label>
                      <select value={propertyCity} onChange={e => setPropertyCity(e.target.value)} style={{ width: "100%", background: CARD, border: `1px solid ${INPUT_BORDER}`, borderRadius: 10, padding: "10px 14px", fontSize: 15, color: NAVY, fontFamily: "var(--font-poppins), -apple-system, sans-serif", outline: "none" }}>
                        <option value="London">London</option>
                        <option value="St. Thomas">St. Thomas</option>
                        <option value="Strathroy">Strathroy</option>
                      </select>
                    </div>
                    <InputField label="Bedrooms" value={bedrooms} onChange={setBedrooms} type="number" placeholder="2" />
                    <InputField label="Bathrooms" value={bathrooms} onChange={setBathrooms} type="number" placeholder="1" />
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: SUBTLE, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6, fontFamily: "var(--font-poppins), -apple-system, sans-serif" }}>Parking Type</label>
                      <select value={parkingType} onChange={e => setParkingType(e.target.value)} style={{ width: "100%", background: CARD, border: `1px solid ${INPUT_BORDER}`, borderRadius: 10, padding: "10px 14px", fontSize: 15, color: NAVY, fontFamily: "var(--font-poppins), -apple-system, sans-serif", outline: "none" }} onFocus={e => { e.target.style.borderColor = "rgba(139,32,48,0.40)"; }} onBlur={e => { e.target.style.borderColor = INPUT_BORDER; }}>
                        <option value="none">No parking</option>
                        <option value="driveway">Driveway</option>
                        <option value="garage">Garage</option>
                        <option value="street">Street parking</option>
                      </select>
                    </div>
                    <InputField label="Parking Spots" value={parkingSpots} onChange={setParkingSpots} type="number" placeholder="0" />
                    <div>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: SUBTLE, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6, fontFamily: "var(--font-poppins), -apple-system, sans-serif" }}>Property Condition</label>
                      <select value={propertyCondition} onChange={e => setPropertyCondition(e.target.value)} style={{ width: "100%", background: CARD, border: `1px solid ${INPUT_BORDER}`, borderRadius: 10, padding: "10px 14px", fontSize: 15, color: NAVY, fontFamily: "var(--font-poppins), -apple-system, sans-serif", outline: "none" }} onFocus={e => { e.target.style.borderColor = "rgba(139,32,48,0.40)"; }} onBlur={e => { e.target.style.borderColor = INPUT_BORDER; }}>
                        <option value="">Select condition…</option>
                        <option value="needs_work">Needs Work</option>
                        <option value="fair">Fair</option>
                        <option value="good">Good</option>
                        <option value="great">Great</option>
                        <option value="move_in_ready">Move-In Ready</option>
                      </select>
                    </div>
                    {/* Owner action items */}
                    <div style={{ gridColumn: "1 / -1", background: "#f6f4f1", borderRadius: 12, padding: "16px 18px" }}>
                      <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, color: SUBTLE, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "var(--font-poppins), -apple-system, sans-serif" }}>
                        What can the owner do?
                      </p>

                      {/* Owner levers — checkboxes */}
                      <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--font-poppins), sans-serif" }}>Owner&apos;s levers</p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", marginBottom: 14 }}>
                        {[
                          "Fresh coat of paint (neutral tone)",
                          "Deep clean / professional clean",
                          "Include utilities (water, hydro, heat)",
                          "Fix visible issues (taps, handles, bulbs)",
                          "Add in-suite laundry",
                          "Landscaping / curb appeal",
                          "Update flooring",
                          "Replace appliances",
                        ].map(opt => (
                          <label key={opt} style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer", fontFamily: "var(--font-poppins), sans-serif" }}>
                            <input
                              type="checkbox"
                              checked={ownerChecks.includes(opt)}
                              onChange={e => setOwnerChecks(e.target.checked ? [...ownerChecks, opt] : ownerChecks.filter(c => c !== opt))}
                              style={{ marginTop: 2, accentColor: BURGUNDY, flexShrink: 0 }}
                            />
                            <span style={{ fontSize: 13, color: NAVY, lineHeight: 1.4 }}>{opt}</span>
                          </label>
                        ))}
                      </div>

                      {/* Prospera defaults — always on */}
                      <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--font-poppins), sans-serif" }}>We do by default</p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px", marginBottom: 14 }}>
                        {[
                          "Same-day response to every inquiry",
                          "In-person showings (we run them)",
                          "Professional listing copy",
                          "Full background + credit checks",
                          "Weekly updates to owner",
                        ].map(item => (
                          <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontFamily: "var(--font-poppins), sans-serif" }}>
                            <span style={{ fontSize: 12, color: GREEN, marginTop: 2, flexShrink: 0 }}>✓</span>
                            <span style={{ fontSize: 13, color: MUTED, lineHeight: 1.4 }}>{item}</span>
                          </div>
                        ))}
                      </div>

                      {/* Agent notes */}
                      <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--font-poppins), sans-serif" }}>Your notes</p>
                      <textarea
                        value={agentNotes}
                        onChange={e => setAgentNotes(e.target.value)}
                        placeholder={"e.g. No laundry in unit — if there was in-suite laundry this would command $150+ more. Property smells fresh, no issues found."}
                        rows={2}
                        style={{ width: "100%", background: CARD, border: `1px solid ${INPUT_BORDER}`, borderRadius: 8, padding: "10px 12px", fontSize: 13, color: NAVY, fontFamily: "var(--font-poppins), sans-serif", outline: "none", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" }}
                        onFocus={e => { e.target.style.borderColor = "rgba(139,32,48,0.40)"; }}
                        onBlur={e => { e.target.style.borderColor = INPUT_BORDER; }}
                      />
                      <p style={{ margin: "4px 0 0", fontSize: 11, color: MUTED, fontFamily: "var(--font-poppins), sans-serif" }}>
                        Checked items + your notes show up in the landlord&apos;s report.
                      </p>
                    </div>
                    <InputField label="Conservative Rent ($)" value={rentLow} onChange={setRentLow} type="number" placeholder="1600" />
                    <InputField label="Market Rate Rent ($)" value={rentMarket} onChange={setRentMarket} type="number" placeholder="1800" />
                    <InputField label="Premium Rent ($)" value={rentPremium} onChange={setRentPremium} type="number" placeholder="2000" />
                  </div>

                  {/* Comparables Entry */}
                  <div style={{ marginTop: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: SUBTLE, textTransform: "uppercase", letterSpacing: "0.07em", margin: 0, fontFamily: "var(--font-poppins), -apple-system, sans-serif" }}>
                        Comparable Properties ({comps.length}/5)
                      </p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          disabled={autoFilling}
                          onClick={async () => {
                            setAutoFilling(true);
                            try {
                              const res = await fetch("/api/admin/auto-comps", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                credentials: "include",
                                body: JSON.stringify({ address: propertyAddress, city: propertyCity, bedrooms: Number(bedrooms), lat: propertyLat, lng: propertyLng }),
                              });
                              if (res.ok) {
                                const data = await res.json();
                                if (data.comps?.length) {
                                  setComps(data.comps.map((c: { address: string; rent: number; days_on_market: string; ad_description: string; source?: string }) => ({
                                    address: c.address,
                                    rent: String(c.rent),
                                    days_on_market: c.days_on_market || "",
                                    ad_description: c.ad_description || "",
                                    notes: c.source ? `Source: ${c.source}` : "",
                                  })));
                                }
                                if (data.rentLow) setRentLow(String(data.rentLow));
                                if (data.rentMarket) setRentMarket(String(data.rentMarket));
                                if (data.rentPremium) setRentPremium(String(data.rentPremium));
                              }
                            } catch { /* ignore */ }
                            setAutoFilling(false);
                          }}
                          style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: BURGUNDY, border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontFamily: "var(--font-poppins), -apple-system, sans-serif", opacity: autoFilling ? 0.5 : 1 }}
                        >
                          {autoFilling ? "Searching..." : "⚡ Auto-Fill from Web"}
                        </button>
                        {comps.length < 5 && (
                          <button
                            type="button"
                            onClick={() => setComps([...comps, { address: "", rent: "", days_on_market: "", ad_description: "", notes: "" }])}
                            style={{ fontSize: 13, fontWeight: 600, color: BURGUNDY, background: "none", border: `1px solid ${CARD_BORDER}`, borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontFamily: "var(--font-poppins), -apple-system, sans-serif" }}
                          >
                            + Add Manually
                          </button>
                        )}
                      </div>
                    </div>

                    {comps.length === 0 && (
                      <p style={{ fontSize: 13, color: MUTED, margin: "0 0 8px" }}>
                        Click &quot;Auto-Fill from Web&quot; to pull comparable listings from Kijiji, Rentals.ca, and other sources. Or add them manually.
                      </p>
                    )}

                    {comps.map((comp, i) => (
                      <div key={i} style={{ background: "#f6f4f1", borderRadius: 12, padding: "16px 18px", marginBottom: 10, position: "relative" }}>
                        <button
                          type="button"
                          onClick={() => setComps(comps.filter((_, j) => j !== i))}
                          style={{ position: "absolute", top: 10, right: 14, background: "none", border: "none", cursor: "pointer", fontSize: 16, color: MUTED, fontFamily: "var(--font-poppins)" }}
                        >×</button>
                        <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: SUBTLE }}>COMP {i + 1}</p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px", gap: 10, marginBottom: 10 }}>
                          <input
                            type="text"
                            value={comp.address}
                            onChange={e => { const u = [...comps]; u[i] = { ...u[i], address: e.target.value }; setComps(u); }}
                            placeholder="Property address"
                            style={{ width: "100%", background: CARD, border: `1px solid ${INPUT_BORDER}`, borderRadius: 8, padding: "8px 12px", fontSize: 14, color: NAVY, fontFamily: "var(--font-poppins), sans-serif", outline: "none" }}
                          />
                          <input
                            type="number"
                            value={comp.rent}
                            onChange={e => { const u = [...comps]; u[i] = { ...u[i], rent: e.target.value }; setComps(u); }}
                            placeholder="Rent $"
                            style={{ width: "100%", background: CARD, border: `1px solid ${INPUT_BORDER}`, borderRadius: 8, padding: "8px 12px", fontSize: 14, color: NAVY, fontFamily: "var(--font-poppins), sans-serif", outline: "none" }}
                          />
                          <input
                            type="number"
                            value={comp.days_on_market}
                            onChange={e => { const u = [...comps]; u[i] = { ...u[i], days_on_market: e.target.value }; setComps(u); }}
                            placeholder="Days"
                            style={{ width: "100%", background: CARD, border: `1px solid ${INPUT_BORDER}`, borderRadius: 8, padding: "8px 12px", fontSize: 14, color: NAVY, fontFamily: "var(--font-poppins), sans-serif", outline: "none" }}
                          />
                        </div>
                        <textarea
                          value={comp.ad_description}
                          onChange={e => { const u = [...comps]; u[i] = { ...u[i], ad_description: e.target.value }; setComps(u); }}
                          placeholder="Paste the listing ad description here..."
                          rows={2}
                          style={{ width: "100%", background: CARD, border: `1px solid ${INPUT_BORDER}`, borderRadius: 8, padding: "8px 12px", fontSize: 13, color: NAVY, fontFamily: "var(--font-poppins), sans-serif", outline: "none", resize: "none", marginBottom: 8 }}
                        />
                        <input
                          type="text"
                          value={comp.notes}
                          onChange={e => { const u = [...comps]; u[i] = { ...u[i], notes: e.target.value }; setComps(u); }}
                          placeholder="Your notes (e.g. 'nicer finishes than ours', 'no parking', 'been sitting')"
                          style={{ width: "100%", background: "#fff", border: `1px solid ${INPUT_BORDER}`, borderRadius: 8, padding: "8px 12px", fontSize: 13, color: NAVY, fontFamily: "var(--font-poppins), sans-serif", outline: "none", fontStyle: "italic" }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Paste & Parse Research */}
                  <div style={{ marginTop: 20, background: "#fff", border: `1px solid ${INPUT_BORDER}`, borderRadius: 12, padding: "18px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8, gap: 12 }}>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: SUBTLE, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 4px", fontFamily: "var(--font-poppins), -apple-system, sans-serif" }}>
                          Paste Your Research
                        </p>
                        <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>
                          Dump everything — Kijiji links, listing descriptions, prices, your notes. Claude will parse it into structured comps and rent ranges.
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={parsing || !marketResearch.trim()}
                        onClick={async () => {
                          setParsing(true);
                          setParseInsights("");
                          try {
                            const res = await fetch("/api/admin/parse-comps", {
                              method: "POST",
                              headers: { "Content-Type": "application/json", "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET ?? "" },
                              body: JSON.stringify({ rawText: marketResearch, bedrooms: Number(bedrooms), city: propertyCity }),
                            });
                            if (res.ok) {
                              const data = await res.json();
                              if (data.comps?.length) setComps(data.comps.map((c: { address: string; rent: number; days_on_market: string; ad_description: string; notes: string }) => ({ ...c, rent: String(c.rent) })));
                              if (data.rentLow)    setRentLow(String(data.rentLow));
                              if (data.rentMarket) setRentMarket(String(data.rentMarket));
                              if (data.rentPremium) setRentPremium(String(data.rentPremium));
                              if (data.insights) setParseInsights(data.insights);
                            }
                          } catch { /* ignore */ }
                          setParsing(false);
                        }}
                        style={{
                          flexShrink: 0, fontSize: 13, fontWeight: 600,
                          color: "#fff", background: parsing ? "rgba(15,28,40,0.25)" : NAVY,
                          border: "none", borderRadius: 8, padding: "8px 16px",
                          cursor: parsing || !marketResearch.trim() ? "not-allowed" : "pointer",
                          fontFamily: "var(--font-poppins), -apple-system, sans-serif",
                          opacity: !marketResearch.trim() ? 0.4 : 1,
                          transition: "all 0.15s", whiteSpace: "nowrap",
                        }}
                      >
                        {parsing ? "Parsing…" : "✦ Parse with Claude"}
                      </button>
                    </div>
                    <textarea
                      value={marketResearch}
                      onChange={e => setMarketResearch(e.target.value)}
                      placeholder={"Paste everything here — raw and unformatted is fine:\n\nhttps://www.kijiji.ca/v-apartments-condos/london/...\n2 bed 1 bath, $1,750/mo — 45 Oxford St, London\nBeen up for 3 weeks. Nice unit but no parking.\n\nhttps://rentals.ca/london/...\n2 bedroom, $1,900 includes water — Wortley Village area\n5 days on market, showing this weekend\n\nMy take: market is $1,750–$1,850 for standard. Anything with parking pushes $1,900+."}
                      rows={8}
                      style={{ width: "100%", background: "#f6f4f1", border: `1px solid ${INPUT_BORDER}`, borderRadius: 8, padding: "12px", fontSize: 13, color: NAVY, fontFamily: "var(--font-poppins), sans-serif", outline: "none", resize: "vertical", lineHeight: 1.7 }}
                    />
                    {parseInsights && (
                      <div style={{ marginTop: 10, background: "rgba(10,122,82,0.07)", border: "1px solid rgba(10,122,82,0.18)", borderRadius: 8, padding: "10px 14px" }}>
                        <p style={{ margin: 0, fontSize: 13, color: "#0A7A52", lineHeight: 1.6, fontFamily: "var(--font-poppins), sans-serif" }}>
                          <strong>Claude&apos;s read:</strong> {parseInsights}
                        </p>
                      </div>
                    )}
                  </div>

                  <p style={{ margin: "12px 0 0", fontSize: 12, color: MUTED, lineHeight: 1.5 }}>
                    The landlord sees a full market report with your research, rent ranges, comparable breakdowns, and neighbourhood data.
                  </p>
                </div>
              )}

              {formError && (
                <p style={{ margin: "0 0 16px", fontSize: 14, color: RED, fontWeight: 500 }}>{formError}</p>
              )}

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ margin: 0, fontSize: 13, color: SUBTLE }}>
                  ✉️ Welcome email fires on submit
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: BURGUNDY, color: "#fff", border: "none",
                    borderRadius: 10, padding: "12px 28px",
                    fontSize: 15, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer",
                    opacity: submitting ? 0.5 : 1,
                    fontFamily: "var(--font-poppins), -apple-system, sans-serif",
                    transition: "opacity 0.15s",
                  }}
                >
                  {submitting ? "Adding…" : "Add Landlord & Send Welcome Email"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Session list */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : sessions.length === 0 && !showForm ? (
          <div style={{
            background: CARD, border: `1px solid ${CARD_BORDER}`, boxShadow: CARD_SHADOW,
            borderRadius: 20, padding: "60px 32px", textAlign: "center",
          }}>
            <p style={{ fontSize: 40, margin: "0 0 12px" }}>🏠</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: "0 0 6px" }}>No onboardings yet</p>
            <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>Click "+ Add Landlord" to get started.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sessions.map(s => {
              const st = statusStyle(s.status);
              const isPlacementOnly = s.service_type === "placement";
              const totalSteps = isPlacementOnly ? 4 : 10;
              const progress = Math.max(0, Math.min(100, ((s.current_step - 2) / (totalSteps - 2)) * 100));
              return (
                <div
                  key={s.token}
                  onClick={() => router.push(`/admin/onboard/${s.token}`)}
                  style={{
                    background: CARD, border: `1px solid ${CARD_BORDER}`,
                    borderLeft: `3px solid ${st.border}`, boxShadow: CARD_SHADOW,
                    borderRadius: 16, padding: "20px 24px", cursor: "pointer",
                    transition: "box-shadow 0.15s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(15,28,40,0.08), 0 12px 32px rgba(15,28,40,0.12)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = CARD_SHADOW; }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: NAVY }}>
                          {s.owner_name ?? "Unnamed"}
                        </p>
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: st.badge,
                          background: st.badgeBg, padding: "2px 8px", borderRadius: 6,
                        }}>
                          {st.label}
                        </span>
                        <span style={{
                          fontSize: 11, fontWeight: 600, color: SUBTLE,
                          background: "rgba(15,28,40,0.06)", padding: "2px 8px", borderRadius: 6,
                        }}>
                          {s.service_type === "management" ? "Placement + Mgmt" : "Placement only"}
                        </span>
                      </div>
                      {s.owner_email && <p style={{ margin: "0 0 2px", fontSize: 14, color: MUTED }}>{s.owner_email}</p>}
                      {s.property_address && <p style={{ margin: "0 0 10px", fontSize: 14, color: MUTED }}>{s.property_address}</p>}
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 12, color: SUBTLE, flexShrink: 0 }}>Step {Math.min(s.current_step, totalSteps)} of {totalSteps}</span>
                        <div style={{ flex: 1, height: 4, background: "rgba(15,28,40,0.08)", borderRadius: 3 }}>
                          <div style={{
                            height: "100%", width: `${progress}%`,
                            background: s.status === "complete" ? GREEN : BURGUNDY,
                            borderRadius: 3, transition: "width 0.3s",
                          }} />
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                      <p style={{ margin: 0, fontSize: 12, color: SUBTLE }}>{timeAgo(s.created_at)}</p>
                      <button
                        onClick={e => handleDelete(s.token, e)}
                        disabled={deleting === s.token}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: deleting === s.token ? SUBTLE : RED,
                          fontSize: 13, fontWeight: 600, padding: "2px 6px",
                          borderRadius: 6, opacity: deleting === s.token ? 0.5 : 1,
                          fontFamily: "var(--font-poppins), -apple-system, sans-serif",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = RED_BG; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
                      >
                        {deleting === s.token ? "…" : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
