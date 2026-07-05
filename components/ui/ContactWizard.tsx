"use client";

import { useState, useEffect, useRef } from "react";
import AddressAutocomplete from "@/components/ui/AddressAutocomplete";
import { Balloons, BalloonsRef } from "@/components/ui/balloons";

// ─── Types ────────────────────────────────────────────────────────────────────

type ServiceType = "tenant-placement" | "property-management" | "both" | null;
type HomeType = "House" | "Condo" | "Townhouse" | "Duplex" | "Basement Unit" | "Other" | null;

interface WizardData {
  service: ServiceType;
  address: string;
  city: string;
  homeType: HomeType;
  beds: string;
  baths: string;
  parking: string;
  rentedBefore: "yes" | "no" | null;
  lastRent: string;
  helpLevel: number;
  name: string;
  phone: string;
  email: string;
}

const INITIAL: WizardData = {
  service: null,
  address: "",
  city: "",
  homeType: null,
  beds: "",
  baths: "",
  parking: "",
  rentedBefore: null,
  lastRent: "",
  helpLevel: 3,
  name: "",
  phone: "",
  email: "",
};

const HELP_LABELS = [
  "Just the basics",
  "Mostly hands-off",
  "Full service",
  "Take it all",
  "Make it disappear",
];

const HOME_TYPES: { value: HomeType; emoji: string; label: string }[] = [
  { value: "House", emoji: "🏡", label: "House" },
  { value: "Condo", emoji: "🏢", label: "Condo" },
  { value: "Townhouse", emoji: "🏘", label: "Townhouse" },
  { value: "Duplex", emoji: "🏠", label: "Duplex" },
  { value: "Basement Unit", emoji: "🔑", label: "Basement" },
  { value: "Other", emoji: "📋", label: "Other" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ServiceCard({
  label, sublabel, emoji, selected, onClick,
}: {
  label: string; sublabel: string; emoji: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-start gap-2 p-5 rounded-xl border text-left transition-all w-full"
      style={{
        backgroundColor: selected ? "#1F2F3A" : "#FFFFFF",
        borderColor: selected ? "#1F2F3A" : "#D8D2C8",
        boxShadow: selected ? "none" : "0 1px 4px rgba(0,0,0,0.04)",
        transform: selected ? "translateY(-1px)" : "none",
      }}
    >
      <span className="text-2xl">{emoji}</span>
      <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-dm-sans)", color: selected ? "#FAF8F5" : "#1F2F3A" }}>
        {label}
      </p>
      <p className="text-xs leading-relaxed" style={{ color: selected ? "rgba(250,248,245,0.65)" : "#666666", fontFamily: "var(--font-dm-sans)" }}>
        {sublabel}
      </p>
    </button>
  );
}

function SelectRow({
  label, emoji, options, value, onSelect,
}: {
  label: string; emoji: string; options: string[]; value: string; onSelect: (v: string) => void;
}) {
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold uppercase tracking-widest mb-2.5 flex items-center gap-1.5" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
        <span>{emoji}</span> {label}
      </p>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(opt)}
            className="px-4 py-2.5 rounded-lg border text-sm font-semibold transition-all"
            style={{
              minWidth: 56,
              backgroundColor: value === opt ? "#1F2F3A" : "#FFFFFF",
              borderColor: value === opt ? "#1F2F3A" : "#D8D2C8",
              color: value === opt ? "#FAF8F5" : "#222222",
              fontFamily: "var(--font-dm-sans)",
              boxShadow: value === opt ? "none" : "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

export default function ContactWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(INITIAL);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [trafficSource, setTrafficSource] = useState<string | null>(null);
  const [animDir, setAnimDir] = useState<"forward" | "back">("forward");
  const [visible, setVisible] = useState(true);
  const balloonsRef = useRef<BalloonsRef>(null);

  useEffect(() => {
    const src = sessionStorage.getItem("pp_traffic_source");
    if (src) setTrafficSource(src);
  }, []);

  useEffect(() => {
    if (status === "success") {
      setTimeout(() => balloonsRef.current?.launch(), 300);
    }
  }, [status]);

  const TOTAL_STEPS = 5;
  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  function goTo(next: number, dir: "forward" | "back" = "forward") {
    setAnimDir(dir);
    setVisible(false);
    setTimeout(() => { setStep(next); setVisible(true); }, 200);
  }
  const next = () => goTo(step + 1, "forward");
  const back = () => goTo(step - 1, "back");

  async function submit() {
    setStatus("loading");

    const helpText =
      data.service === "tenant-placement"
        ? `Previously rented: ${data.rentedBefore === "yes" ? `Yes — last rent was ${data.lastRent || "not specified"}` : "No, first time listing"}.`
        : data.service === "property-management"
        ? `Help level wanted: ${HELP_LABELS[data.helpLevel - 1]} (${data.helpLevel}/5).`
        : `Previously rented: ${data.rentedBefore === "yes" ? `Yes — last rent was ${data.lastRent || "not specified"}` : "No"}. Help level: ${HELP_LABELS[data.helpLevel - 1]} (${data.helpLevel}/5).`;

    const message = [
      `Service needed: ${data.service === "tenant-placement" ? "Tenant Placement" : data.service === "property-management" ? "Property Management" : "Tenant Placement + Property Management"}.`,
      `Property: ${data.address || "Not provided"}.`,
      `Type: ${data.homeType || "Not specified"}, ${data.beds || "?"} bed / ${data.baths || "?"} bath / ${data.parking || "?"} parking.`,
      helpText,
    ].join(" ");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          city: data.city || "Not specified",
          type: "landlord",
          property: data.address,
          message,
          traffic_source: trafficSource,
        }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  // ── Success state ─────────────────────────────────────────────────────────

  if (status === "success") {
    return (
      <>
        <Balloons ref={balloonsRef} />
        <div
          className="rounded-2xl border text-center overflow-hidden"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#D8D2C8", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        >
          {/* top accent */}
          <div className="h-1.5 w-full" style={{ backgroundColor: "#8B2030" }} />

          <div className="p-10 sm:p-12">
            {/* Icon */}
            <div className="text-5xl mb-5">🎉</div>

            <p className="text-4xl font-light mb-2" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              You&apos;re all set!
            </p>
            <p className="text-sm mb-10 leading-relaxed" style={{ color: "#555555", fontFamily: "var(--font-dm-sans)" }}>
              Our team reviews every request personally. Usually within a few hours.
            </p>

            {/* What happens next — card style */}
            <div className="text-left space-y-3 max-w-sm mx-auto mb-8">
              {[
                { emoji: "📬", step: "Within 4 hours", desc: "We review your request personally — no bots." },
                { emoji: "📞", step: "You hear from us directly", desc: "A real call or email, not an automated response." },
                { emoji: "📊", step: "Free rental analysis", desc: "We come prepared with real local market data." },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-xl"
                  style={{ backgroundColor: "#F7F5F2", border: "1px solid #E8E3DC" }}
                >
                  <span className="text-xl flex-shrink-0 mt-0.5">{item.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold mb-0.5" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>{item.step}</p>
                    <p className="text-xs" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
              Can&apos;t wait?{" "}
              <a href="tel:+15196971227" className="hover:opacity-80 font-medium" style={{ color: "#8B2030" }}>
                Call (519) 697-1227
              </a>
            </p>
          </div>
        </div>
      </>
    );
  }

  // ── Shared styles ─────────────────────────────────────────────────────────

  const slideStyle: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateX(0)" : animDir === "forward" ? "translateX(18px)" : "translateX(-18px)",
    transition: "opacity 0.2s ease, transform 0.2s ease",
  };

  const inputStyle: React.CSSProperties = {
    borderColor: "#D8D2C8",
    backgroundColor: "#F7F5F2",
    color: "#222222",
    fontFamily: "var(--font-dm-sans)",
  };
  const inputClass = "w-full px-4 py-3 text-sm border rounded-lg outline-none focus:border-[#1F2F3A] transition-colors";

  const btnBack = "flex-1 py-4 text-xs font-semibold uppercase tracking-widest rounded-lg border transition-colors";
  const btnNext = "flex-[2] py-4 text-xs font-semibold uppercase tracking-widest rounded-lg disabled:opacity-40 transition-opacity";

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ backgroundColor: "#FFFFFF", borderColor: "#D8D2C8", boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}
    >
      {/* Progress */}
      <div style={{ backgroundColor: "#F7F5F2", padding: "16px 28px 0" }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
            Step {step} of {TOTAL_STEPS}
          </p>
          <p className="text-xs" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
            {Math.round(progress)}% done
          </p>
        </div>
        <div className="rounded-full overflow-hidden" style={{ height: 4, backgroundColor: "#E8E3DC" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: "#8B2030" }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-7 sm:p-8" style={slideStyle}>

        {/* ── Step 1: Service type ──────────────────────────── */}
        {step === 1 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
              What You Need
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-1 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
              What can we help you with?
            </h2>
            <p className="text-sm mb-6" style={{ color: "#888888", fontFamily: "var(--font-dm-sans)" }}>
              We&apos;ll prepare the right info before we call — no generic scripts.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              <ServiceCard emoji="🔍" label="Find Me a Tenant" sublabel="Quality placement, lease signed, full process handled." selected={data.service === "tenant-placement"} onClick={() => setData({ ...data, service: "tenant-placement" })} />
              <ServiceCard emoji="🏠" label="Manage My Property" sublabel="Rent, maintenance, communication — fully hands-off." selected={data.service === "property-management"} onClick={() => setData({ ...data, service: "property-management" })} />
              <ServiceCard emoji="⚡" label="Both" sublabel="Place a tenant, then keep managing long-term." selected={data.service === "both"} onClick={() => setData({ ...data, service: "both" })} />
            </div>
            <button type="button" onClick={next} disabled={!data.service} className={`w-full ${btnNext}`} style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>
              Continue →
            </button>
          </div>
        )}

        {/* ── Step 2: Property address ──────────────────────── */}
        {step === 2 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
              📍 Your Property
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-1 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
              Where is the property?
            </h2>
            <p className="text-sm mb-6" style={{ color: "#888888", fontFamily: "var(--font-dm-sans)" }}>
              We&apos;ll pull comparable rents in your exact area so the first call is actually useful.
            </p>
            <AddressAutocomplete
              value={data.address}
              onChange={(v) => setData({ ...data, address: v })}
              onPlaceSelect={(place) => setData({ ...data, address: place.street_address, city: place.city || "" })}
              placeholder="Start typing your property address..."
              className={inputClass}
              style={inputStyle}
            />
            <p className="text-xs mt-2 mb-8" style={{ color: "#BBBBBB", fontFamily: "var(--font-dm-sans)" }}>
              London · St. Thomas · Strathroy — we cover all three.
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={back} className={btnBack} style={{ borderColor: "#D8D2C8", color: "#666666", fontFamily: "var(--font-dm-sans)" }}>← Back</button>
              <button type="button" onClick={next} disabled={!data.address.trim()} className={btnNext} style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>Continue →</button>
            </div>
          </div>
        )}

        {/* ── Step 3: Property details ──────────────────────── */}
        {step === 3 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
              Property Details
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-1 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
              Tell us about the unit.
            </h2>
            <p className="text-sm mb-6" style={{ color: "#888888", fontFamily: "var(--font-dm-sans)" }}>
              Specs affect demand and pricing — this helps us give you real numbers.
            </p>

            {/* Property type */}
            <p className="text-xs font-semibold uppercase tracking-widest mb-2.5 flex items-center gap-1.5" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
              🏗 Property Type
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-5">
              {HOME_TYPES.map(({ value, emoji, label }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setData({ ...data, homeType: value })}
                  className="flex flex-col items-center gap-1.5 py-3 px-1 rounded-lg border text-center transition-all"
                  style={{
                    backgroundColor: data.homeType === value ? "#1F2F3A" : "#FFFFFF",
                    borderColor: data.homeType === value ? "#1F2F3A" : "#D8D2C8",
                    boxShadow: data.homeType === value ? "none" : "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  <span className="text-xl">{emoji}</span>
                  <span className="text-xs font-medium" style={{ color: data.homeType === value ? "#FAF8F5" : "#333333", fontFamily: "var(--font-dm-sans)" }}>{label}</span>
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="my-5" style={{ borderTop: "1px solid #E8E3DC" }} />

            {/* Beds / Baths / Parking as clear rows */}
            <SelectRow label="Bedrooms" emoji="🛏" options={["1", "2", "3", "4", "5+"]} value={data.beds} onSelect={(v) => setData({ ...data, beds: v })} />
            <SelectRow label="Bathrooms" emoji="🚿" options={["1", "1.5", "2", "3+"]} value={data.baths} onSelect={(v) => setData({ ...data, baths: v })} />
            <SelectRow label="Parking Spots" emoji="🚗" options={["None", "1", "2", "2+"]} value={data.parking} onSelect={(v) => setData({ ...data, parking: v })} />

            <div className="flex gap-3 mt-6">
              <button type="button" onClick={back} className={btnBack} style={{ borderColor: "#D8D2C8", color: "#666666", fontFamily: "var(--font-dm-sans)" }}>← Back</button>
              <button type="button" onClick={next} disabled={!data.homeType || !data.beds || !data.baths || !data.parking} className={btnNext} style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>Continue →</button>
            </div>
          </div>
        )}

        {/* ── Step 4: Conditional ───────────────────────────── */}
        {step === 4 && (
          <div>
            {/* Tenant Placement */}
            {data.service === "tenant-placement" && (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>🏘 Rental History</p>
                <h2 className="text-2xl sm:text-3xl font-semibold mb-1 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>Has this unit been rented before?</h2>
                <p className="text-sm mb-7" style={{ color: "#888888", fontFamily: "var(--font-dm-sans)" }}>Rental history is a useful data point. If none, we build from market data and comparable units.</p>
                <div className="flex gap-4 mb-6">
                  {(["yes", "no"] as const).map((v) => (
                    <button key={v} type="button" onClick={() => setData({ ...data, rentedBefore: v })}
                      className="flex-1 py-5 rounded-xl border text-sm font-semibold transition-all"
                      style={{ backgroundColor: data.rentedBefore === v ? "#1F2F3A" : "#FFFFFF", borderColor: data.rentedBefore === v ? "#1F2F3A" : "#D8D2C8", color: data.rentedBefore === v ? "#FAF8F5" : "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
                      {v === "yes" ? "✅ Yes, it has" : "🆕 No, first time"}
                    </button>
                  ))}
                </div>
                {data.rentedBefore === "yes" && (
                  <div className="mb-6">
                    <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>💰 What was the last rent?</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: "#999999" }}>$</span>
                      <input type="text" value={data.lastRent} onChange={(e) => setData({ ...data, lastRent: e.target.value })} className={`${inputClass} pl-8`} style={inputStyle} placeholder="1,800 / month" />
                    </div>
                    <p className="text-xs mt-1.5" style={{ color: "#BBBBBB", fontFamily: "var(--font-dm-sans)" }}>Approximate is fine — we&apos;ll check current market rates.</p>
                  </div>
                )}
              </>
            )}

            {/* Property Management */}
            {data.service === "property-management" && (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>🎚 Your Involvement</p>
                <h2 className="text-2xl sm:text-3xl font-semibold mb-1 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>How hands-off do you want to be?</h2>
                <p className="text-sm mb-8" style={{ color: "#888888", fontFamily: "var(--font-dm-sans)" }}>There&apos;s no wrong answer. Some landlords want to stay in the loop on big decisions. Others want zero involvement.</p>
                <input type="range" min={1} max={5} step={1} value={data.helpLevel} onChange={(e) => setData({ ...data, helpLevel: Number(e.target.value) })} className="w-full accent-[#8B2030]" style={{ cursor: "pointer" }} />
                <div className="flex justify-between mt-1 mb-4">
                  <span className="text-xs" style={{ color: "#BBBBBB", fontFamily: "var(--font-dm-sans)" }}>Just the basics</span>
                  <span className="text-xs" style={{ color: "#BBBBBB", fontFamily: "var(--font-dm-sans)" }}>Make it disappear</span>
                </div>
                <div className="rounded-xl p-4 text-center mb-2" style={{ backgroundColor: "#F7F5F2", border: "1px solid #E8E3DC" }}>
                  <p className="text-2xl font-light" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>{HELP_LABELS[data.helpLevel - 1]}</p>
                </div>
              </>
            )}

            {/* Both */}
            {data.service === "both" && (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>🏘 Rental History</p>
                <h2 className="text-2xl sm:text-3xl font-semibold mb-1 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>Has it been rented before?</h2>
                <p className="text-sm mb-7" style={{ color: "#888888", fontFamily: "var(--font-dm-sans)" }}>Helps anchor the rent analysis on real history.</p>
                <div className="flex gap-4 mb-6">
                  {(["yes", "no"] as const).map((v) => (
                    <button key={v} type="button" onClick={() => setData({ ...data, rentedBefore: v })}
                      className="flex-1 py-5 rounded-xl border text-sm font-semibold transition-all"
                      style={{ backgroundColor: data.rentedBefore === v ? "#1F2F3A" : "#FFFFFF", borderColor: data.rentedBefore === v ? "#1F2F3A" : "#D8D2C8", color: data.rentedBefore === v ? "#FAF8F5" : "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
                      {v === "yes" ? "✅ Yes, it has" : "🆕 No, first time"}
                    </button>
                  ))}
                </div>
                {data.rentedBefore === "yes" && (
                  <div className="mb-6">
                    <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>💰 Last rent amount?</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: "#999999" }}>$</span>
                      <input type="text" value={data.lastRent} onChange={(e) => setData({ ...data, lastRent: e.target.value })} className={`${inputClass} pl-8`} style={inputStyle} placeholder="1,800 / month" />
                    </div>
                  </div>
                )}
                <div className="mb-2 pt-2" style={{ borderTop: "1px solid #E8E3DC" }}>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-3 mt-4" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>🎚 How involved do you want to stay?</p>
                  <input type="range" min={1} max={5} step={1} value={data.helpLevel} onChange={(e) => setData({ ...data, helpLevel: Number(e.target.value) })} className="w-full accent-[#8B2030]" style={{ cursor: "pointer" }} />
                  <div className="flex justify-between mt-1 mb-4">
                    <span className="text-xs" style={{ color: "#BBBBBB", fontFamily: "var(--font-dm-sans)" }}>Some involvement</span>
                    <span className="text-xs" style={{ color: "#BBBBBB", fontFamily: "var(--font-dm-sans)" }}>Fully hands-off</span>
                  </div>
                  <div className="rounded-xl p-4 text-center" style={{ backgroundColor: "#F7F5F2", border: "1px solid #E8E3DC" }}>
                    <p className="text-xl font-light" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>{HELP_LABELS[data.helpLevel - 1]}</p>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3 mt-8">
              <button type="button" onClick={back} className={btnBack} style={{ borderColor: "#D8D2C8", color: "#666666", fontFamily: "var(--font-dm-sans)" }}>← Back</button>
              <button type="button" onClick={next} disabled={data.service !== "property-management" && data.rentedBefore === null} className={btnNext} style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>Continue →</button>
            </div>
          </div>
        )}

        {/* ── Step 5: Contact info ──────────────────────────── */}
        {step === 5 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
              🏁 Last Step
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-1 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
              How do we reach you?
            </h2>
            <p className="text-sm mb-7" style={{ color: "#888888", fontFamily: "var(--font-dm-sans)" }}>
              The owner responds personally — not a call centre or automated reply.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>Full Name <span style={{ color: "#8B2030" }}>*</span></label>
                <input required type="text" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} className={inputClass} style={inputStyle} placeholder="Your full name" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>Phone Number <span style={{ color: "#8B2030" }}>*</span></label>
                <input required type="tel" value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} className={inputClass} style={inputStyle} placeholder="(519) 000-0000" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>Email Address <span style={{ color: "#8B2030" }}>*</span></label>
                <input required type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} className={inputClass} style={inputStyle} placeholder="you@email.com" />
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-xl p-4 mb-5" style={{ backgroundColor: "#F7F5F2", border: "1px solid #E8E3DC" }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>Your request</p>
              <div className="space-y-1">
                <p className="text-sm" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}><span style={{ color: "#999999" }}>Service:</span> {data.service === "tenant-placement" ? "Tenant Placement" : data.service === "property-management" ? "Property Management" : "Both"}</p>
                {data.address && <p className="text-sm" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}><span style={{ color: "#999999" }}>Property:</span> {data.address}</p>}
                {data.homeType && <p className="text-sm" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}><span style={{ color: "#999999" }}>Unit:</span> {data.homeType}, {data.beds} bed / {data.baths} bath</p>}
              </div>
            </div>

            {status === "error" && <p className="text-sm mb-4" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>Something went wrong. Please try again or call (519) 697-1227.</p>}

            <div className="flex gap-3">
              <button type="button" onClick={back} className={btnBack} style={{ borderColor: "#D8D2C8", color: "#666666", fontFamily: "var(--font-dm-sans)" }}>← Back</button>
              <button type="button" onClick={submit} disabled={status === "loading" || !data.name.trim() || !data.phone.trim() || !data.email.trim()} className={btnNext} style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>
                {status === "loading" ? "Sending..." : "Send My Request →"}
              </button>
            </div>
            <p className="text-xs text-center mt-4" style={{ color: "#BBBBBB", fontFamily: "var(--font-dm-sans)" }}>No spam. No automated replies. Real people, real response.</p>
          </div>
        )}

      </div>
    </div>
  );
}
