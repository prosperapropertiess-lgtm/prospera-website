"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  AREAS, RENT_RANGES, RENT_BASIS, RENT_FLEXIBILITY, MAINTENANCE_LEVELS, CONDITIONS,
  PROPERTY_TYPES, OCCUPANCY, SERVICES, INVOLVEMENT, TIMELINES, cityFromArea,
} from "@/lib/fit-form";

const BG = "#F7F5F2";
const SURFACE = "#FFFFFF";
const BORDER = "#D8D2C8";
const TEXT = "#222222";
const MUTED = "#666666";
const NAVY = "#1F2F3A";
const ACCENT = "#8B2030";

const inputStyle = { border: `1.5px solid ${BORDER}`, backgroundColor: BG, color: TEXT };
const inputCls = "w-full px-4 py-3.5 rounded-xl text-base outline-none focus:border-[#1F2F3A]";

function Chips({ options, value, onChange }: { options: readonly string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className="px-4 py-3 rounded-xl text-sm font-medium"
            style={{
              backgroundColor: active ? NAVY : SURFACE,
              color: active ? "#FAF8F5" : MUTED,
              border: `1.5px solid ${active ? NAVY : BORDER}`,
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 18, padding: 24, marginBottom: 18 }}>
      <div className="flex items-center gap-3 mb-5">
        <span style={{ width: 30, height: 30, borderRadius: "50%", backgroundColor: "#F0EDE8", color: NAVY, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{num}</span>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: 0 }}>{title}</h2>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-semibold mb-2" style={{ color: TEXT }}>{children}</p>;
}

export default function FitPage() {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<"loading" | "form" | "done" | "missing">("loading");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [numProps, setNumProps] = useState("");
  const [area, setArea] = useState("");
  const [shareAddress, setShareAddress] = useState<"yes" | "no" | "">("");
  const [address, setAddress] = useState("");
  const [propType, setPropType] = useState("");
  const [beds, setBeds] = useState("");
  const [baths, setBaths] = useState("");
  const [occupancy, setOccupancy] = useState("");
  const [condition, setCondition] = useState("");
  const [maintenance, setMaintenance] = useState("");
  const [notes, setNotes] = useState("");
  const [rentRange, setRentRange] = useState("");
  const [rentBasis, setRentBasis] = useState("");
  const [rentFlex, setRentFlex] = useState("");
  const [service, setService] = useState("");
  const [involvement, setInvolvement] = useState("");
  const [timeline, setTimeline] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/fit/${token}`)
      .then(async (r) => {
        if (!r.ok) return setState("missing");
        const d = await r.json();
        setName(d.name ?? "");
        setPhone(d.phone ?? "");
        setState(d.submitted ? "done" : "form");
      })
      .catch(() => setState("missing"));
  }, [token]);

  const ready = name.trim() && area && shareAddress && (shareAddress === "no" || address.trim()) && rentRange && rentBasis && rentFlex && condition && maintenance;

  async function submit() {
    setSaving(true);
    setError("");
    const range = RENT_RANGES.find((r) => r.label === rentRange);
    const res = await fetch(`/api/fit/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        landlord_name: name,
        landlord_phone: phone,
        num_properties_owned: numProps ? Number(numProps) : null,
        area,
        property_city: cityFromArea(area),
        address_disclosed: shareAddress === "yes",
        property_address: shareAddress === "yes" ? address : null,
        property_type: propType,
        bedrooms: beds ? Number(beds) : null,
        bathrooms: baths ? Number(baths) : null,
        occupancy_status: occupancy,
        property_condition: condition,
        maintenance_level: maintenance,
        condition_notes: notes,
        rent_expectation: rentRange,
        rent_basis: rentBasis,
        rent_flexibility: rentFlex,
        approx_monthly_rent: range?.mid ?? null,
        service_type: service === "Not sure yet" ? "" : service,
        involvement_level: involvement,
        timeline,
      }),
    });
    setSaving(false);
    if (res.ok) setState("done");
    else setError((await res.json().catch(() => ({}))).error ?? "Something went wrong, please try again.");
  }

  if (state === "loading") return <div style={{ minHeight: "100vh", backgroundColor: BG }} />;

  if (state === "missing") {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <p style={{ color: MUTED, fontSize: 16, textAlign: "center" }}>This link isn&apos;t valid. Call Ebin at (519) 697-1227 and we&apos;ll sort it out.</p>
      </div>
    );
  }

  if (state === "done") {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: NAVY, marginBottom: 12 }}>Got it, thank you.</h1>
          <p style={{ fontSize: 16, color: MUTED, lineHeight: 1.7 }}>
            Ebin will look over your details and email you the next steps shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, padding: "40px 16px 100px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#999999" }}>Prospera Properties</p>
        <h1 style={{ fontSize: 30, fontWeight: 700, color: NAVY, margin: "0 0 8px" }}>Tell us about your property</h1>
        <p style={{ fontSize: 16, color: MUTED, margin: "0 0 28px", lineHeight: 1.6 }}>
          About 3 minutes. There are no wrong answers, we just want to see if we&apos;re the right match.
        </p>

        <Section num="1" title="About you">
          <div><Label>Your name</Label><input className={inputCls} style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>Phone (optional)</Label><input className={inputCls} style={inputStyle} inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <div><Label>How many rental properties do you own?</Label><input className={inputCls} style={inputStyle} inputMode="numeric" value={numProps} onChange={(e) => setNumProps(e.target.value.replace(/\D/g, ""))} /></div>
        </Section>

        <Section num="2" title="Where is the property?">
          <div><Label>Pick the area</Label><Chips options={AREAS} value={area} onChange={setArea} /></div>
          <div>
            <Label>Are you comfortable sharing the exact address now?</Label>
            <Chips options={["Yes", "Not yet"]} value={shareAddress === "yes" ? "Yes" : shareAddress === "no" ? "Not yet" : ""} onChange={(v) => setShareAddress(v === "Yes" ? "yes" : "no")} />
          </div>
          {shareAddress === "yes" && (
            <div><Label>Street address</Label><input className={inputCls} style={inputStyle} value={address} onChange={(e) => setAddress(e.target.value)} /></div>
          )}
          <div><Label>Property type</Label><Chips options={PROPERTY_TYPES} value={propType} onChange={setPropType} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Bedrooms</Label><input className={inputCls} style={inputStyle} inputMode="numeric" value={beds} onChange={(e) => setBeds(e.target.value.replace(/\D/g, ""))} /></div>
            <div><Label>Bathrooms</Label><input className={inputCls} style={inputStyle} inputMode="decimal" value={baths} onChange={(e) => setBaths(e.target.value.replace(/[^\d.]/g, ""))} /></div>
          </div>
          <div><Label>Is anyone living there now?</Label><Chips options={OCCUPANCY} value={occupancy} onChange={setOccupancy} /></div>
        </Section>

        <Section num="3" title="Condition">
          <div><Label>Overall condition</Label><Chips options={CONDITIONS} value={condition} onChange={setCondition} /></div>
          <div><Label>How has it been looked after?</Label><Chips options={MAINTENANCE_LEVELS} value={maintenance} onChange={setMaintenance} /></div>
          <div>
            <Label>Anything we should know? (optional)</Label>
            <textarea className={inputCls} style={inputStyle} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </Section>

        <Section num="4" title="Rent">
          <div><Label>What monthly rent do you have in mind?</Label><Chips options={RENT_RANGES.map((r) => r.label)} value={rentRange} onChange={setRentRange} /></div>
          <div><Label>That number is…</Label><Chips options={RENT_BASIS} value={rentBasis} onChange={setRentBasis} /></div>
          <div><Label>How flexible are you on it?</Label><Chips options={RENT_FLEXIBILITY} value={rentFlex} onChange={setRentFlex} /></div>
        </Section>

        <Section num="5" title="What you're looking for">
          <div><Label>Help you want</Label><Chips options={SERVICES} value={service} onChange={setService} /></div>
          <div><Label>How involved do you want to be?</Label><Chips options={INVOLVEMENT} value={involvement} onChange={setInvolvement} /></div>
          <div><Label>When do you want to start?</Label><Chips options={TIMELINES} value={timeline} onChange={setTimeline} /></div>
        </Section>

        {error && <p style={{ color: ACCENT, fontSize: 14, marginBottom: 12 }}>{error}</p>}
        <button
          onClick={submit}
          disabled={!ready || saving}
          className="w-full px-8 py-4 text-xs font-semibold uppercase tracking-widest rounded"
          style={{ backgroundColor: ACCENT, color: "#FAF8F5", opacity: !ready || saving ? 0.5 : 1 }}
        >
          {saving ? "Sending…" : "Send to Ebin"}
        </button>
        {!ready && <p style={{ fontSize: 13, color: "#999999", textAlign: "center", marginTop: 10 }}>Fill in your name, area, condition and rent sections to send.</p>}
      </div>
    </div>
  );
}
