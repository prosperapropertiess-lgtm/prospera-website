"use client";

import { useState, useEffect, useRef } from "react";
import AddressAutocomplete from "@/components/ui/AddressAutocomplete";

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
  helpLevel: number; // 1–5
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-5 py-2.5 rounded-full text-sm border transition-all"
      style={{
        backgroundColor: selected ? "#1F2F3A" : "transparent",
        borderColor: selected ? "#1F2F3A" : "#D8D2C8",
        color: selected ? "#FAF8F5" : "#333333",
        fontFamily: "var(--font-dm-sans)",
        fontWeight: selected ? 600 : 400,
      }}
    >
      {label}
    </button>
  );
}

function ServiceCard({
  label,
  sublabel,
  emoji,
  selected,
  onClick,
}: {
  label: string;
  sublabel: string;
  emoji: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-start gap-2 p-6 rounded-xl border text-left transition-all w-full"
      style={{
        backgroundColor: selected ? "#1F2F3A" : "#FFFFFF",
        borderColor: selected ? "#1F2F3A" : "#D8D2C8",
        color: selected ? "#FAF8F5" : "#1F2F3A",
        boxShadow: selected ? "none" : "0 1px 4px rgba(0,0,0,0.04)",
        transform: selected ? "translateY(-1px)" : "none",
      }}
    >
      <span className="text-2xl">{emoji}</span>
      <p
        className="text-base font-semibold"
        style={{ fontFamily: "var(--font-dm-sans)", color: selected ? "#FAF8F5" : "#1F2F3A" }}
      >
        {label}
      </p>
      <p
        className="text-xs leading-relaxed"
        style={{ color: selected ? "rgba(250,248,245,0.7)" : "#666666", fontFamily: "var(--font-dm-sans)" }}
      >
        {sublabel}
      </p>
    </button>
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

  useEffect(() => {
    const src = sessionStorage.getItem("pp_traffic_source");
    if (src) setTrafficSource(src);
  }, []);

  // total steps: 5 (service → address → details → conditional → contact)
  const TOTAL_STEPS = 5;
  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  function goTo(next: number, dir: "forward" | "back" = "forward") {
    setAnimDir(dir);
    setVisible(false);
    setTimeout(() => {
      setStep(next);
      setVisible(true);
    }, 200);
  }

  function next() {
    goTo(step + 1, "forward");
  }
  function back() {
    goTo(step - 1, "back");
  }

  async function submit() {
    setStatus("loading");

    const helpText =
      data.service === "tenant-placement"
        ? `Previously rented: ${data.rentedBefore === "yes" ? `Yes — last rent was ${data.lastRent || "not specified"}` : "No, first time listing"}.`
        : data.service === "property-management"
        ? `Help level wanted: ${HELP_LABELS[data.helpLevel - 1]} (${data.helpLevel}/5).`
        : `Previously rented: ${data.rentedBefore === "yes" ? `Yes — last rent was ${data.lastRent || "not specified"}` : "No"}. Help level wanted: ${HELP_LABELS[data.helpLevel - 1]} (${data.helpLevel}/5).`;

    const message = [
      `Service needed: ${
        data.service === "tenant-placement"
          ? "Tenant Placement"
          : data.service === "property-management"
          ? "Property Management"
          : "Tenant Placement + Property Management"
      }.`,
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

      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        className="rounded-2xl p-12 text-center border"
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: "#D8D2C8",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: "rgba(139,32,48,0.08)" }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#8B2030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-4xl font-light mb-3" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
          You&apos;re all set.
        </p>
        <p className="text-sm mb-2" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
          Ebin will reach out personally within 1 business day. Usually faster.
        </p>
        <p className="text-xs mt-6" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
          Need to talk now?{" "}
          <a href="tel:+15196971227" className="hover:opacity-80" style={{ color: "#8B2030" }}>
            (519) 697-1227
          </a>
        </p>
      </div>
    );
  }

  // ── Animation wrapper style
  const slideStyle: React.CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible
      ? "translateX(0)"
      : animDir === "forward"
      ? "translateX(18px)"
      : "translateX(-18px)",
    transition: "opacity 0.2s ease, transform 0.2s ease",
  };

  // ── Input shared styles
  const inputStyle: React.CSSProperties = {
    borderColor: "#D8D2C8",
    backgroundColor: "#F7F5F2",
    color: "#222222",
    fontFamily: "var(--font-dm-sans)",
  };
  const inputClass =
    "w-full px-4 py-3 text-sm border rounded-lg outline-none focus:border-[#1F2F3A] transition-colors";

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: "#D8D2C8",
        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
      }}
    >
      {/* Progress bar */}
      <div style={{ backgroundColor: "#F7F5F2", padding: "16px 28px 0" }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
            Step {step} of {TOTAL_STEPS}
          </p>
          <p className="text-xs" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
            {Math.round(progress)}% complete
          </p>
        </div>
        <div className="rounded-full overflow-hidden" style={{ height: 4, backgroundColor: "#E8E3DC" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: "#8B2030" }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="p-7 sm:p-8" style={slideStyle}>

        {/* ── Step 1: Service type ───────────────────────────────────── */}
        {step === 1 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
              What You Need
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-1 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
              What can we help you with?
            </h2>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: "#888888", fontFamily: "var(--font-dm-sans)" }}>
              This helps us prepare the right info before we call — no generic scripts.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <ServiceCard
                emoji="🔍"
                label="Find Me a Tenant"
                sublabel="You need quality tenants placed and a lease signed. We handle the full process."
                selected={data.service === "tenant-placement"}
                onClick={() => setData({ ...data, service: "tenant-placement" })}
              />
              <ServiceCard
                emoji="🏠"
                label="Manage My Property"
                sublabel="Rent collection, maintenance, tenant communication — fully hands-off for you."
                selected={data.service === "property-management"}
                onClick={() => setData({ ...data, service: "property-management" })}
              />
              <ServiceCard
                emoji="⚡"
                label="Both"
                sublabel="Place a tenant and then keep managing the property ongoing. The full package."
                selected={data.service === "both"}
                onClick={() => setData({ ...data, service: "both" })}
              />
            </div>
            <button
              type="button"
              onClick={next}
              disabled={!data.service}
              className="w-full py-4 text-xs font-semibold uppercase tracking-widest rounded-lg disabled:opacity-40 transition-opacity"
              style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
            >
              Continue →
            </button>
          </div>
        )}

        {/* ── Step 2: Property address ───────────────────────────────── */}
        {step === 2 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
              Your Property
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-1 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
              Where is the property?
            </h2>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: "#888888", fontFamily: "var(--font-dm-sans)" }}>
              We&apos;ll pull comparable rents and recent activity in your exact area — so the first call is actually useful.
            </p>
            <AddressAutocomplete
              value={data.address}
              onChange={(v) => setData({ ...data, address: v })}
              onPlaceSelect={(place) =>
                setData({ ...data, address: place.street_address, city: place.city || "" })
              }
              placeholder="Start typing your property address..."
              className={inputClass}
              style={inputStyle}
            />
            <p className="text-xs mt-2 mb-8" style={{ color: "#BBBBBB", fontFamily: "var(--font-dm-sans)" }}>
              London, St. Thomas, and Strathroy — we cover all three.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={back}
                className="flex-1 py-4 text-xs font-semibold uppercase tracking-widest rounded-lg border transition-colors"
                style={{ borderColor: "#D8D2C8", color: "#666666", fontFamily: "var(--font-dm-sans)" }}
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={next}
                disabled={!data.address.trim()}
                className="flex-[2] py-4 text-xs font-semibold uppercase tracking-widest rounded-lg disabled:opacity-40 transition-opacity"
                style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Property details ───────────────────────────────── */}
        {step === 3 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
              Property Details
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-1 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
              Tell us about the unit.
            </h2>
            <p className="text-sm mb-6 leading-relaxed" style={{ color: "#888888", fontFamily: "var(--font-dm-sans)" }}>
              Property type and specs directly affect rental demand and pricing — this lets us give you real numbers, not guesses.
            </p>

            {/* Home type */}
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
              Property Type
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {(["House", "Condo", "Townhouse", "Duplex", "Basement Unit", "Other"] as HomeType[]).map((t) => (
                <Chip
                  key={t as string}
                  label={t as string}
                  selected={data.homeType === t}
                  onClick={() => setData({ ...data, homeType: t })}
                />
              ))}
            </div>

            {/* Beds / Baths / Parking */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
                  Bedrooms
                </p>
                <div className="flex flex-col gap-2">
                  {["1", "2", "3", "4", "5+"].map((n) => (
                    <Chip
                      key={n}
                      label={n}
                      selected={data.beds === n}
                      onClick={() => setData({ ...data, beds: n })}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
                  Bathrooms
                </p>
                <div className="flex flex-col gap-2">
                  {["1", "1.5", "2", "3+"].map((n) => (
                    <Chip
                      key={n}
                      label={n}
                      selected={data.baths === n}
                      onClick={() => setData({ ...data, baths: n })}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
                  Parking
                </p>
                <div className="flex flex-col gap-2">
                  {["None", "1", "2", "2+"].map((n) => (
                    <Chip
                      key={n}
                      label={n}
                      selected={data.parking === n}
                      onClick={() => setData({ ...data, parking: n })}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={back}
                className="flex-1 py-4 text-xs font-semibold uppercase tracking-widest rounded-lg border transition-colors"
                style={{ borderColor: "#D8D2C8", color: "#666666", fontFamily: "var(--font-dm-sans)" }}
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={next}
                disabled={!data.homeType || !data.beds || !data.baths || !data.parking}
                className="flex-[2] py-4 text-xs font-semibold uppercase tracking-widest rounded-lg disabled:opacity-40 transition-opacity"
                style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Conditional ────────────────────────────────────── */}
        {step === 4 && (
          <div>
            {/* Tenant Placement branch */}
            {data.service === "tenant-placement" && (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
                  Rental History
                </p>
                <h2 className="text-2xl sm:text-3xl font-semibold mb-1 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
                  Has this unit been rented before?
                </h2>
                <p className="text-sm mb-7 leading-relaxed" style={{ color: "#888888", fontFamily: "var(--font-dm-sans)" }}>
                  If there&apos;s a rental history, we can use it as a data point. If not, we build the picture from scratch — market data, comparable units, and your property&apos;s specific features.
                </p>
                <div className="flex gap-4 mb-6">
                  {(["yes", "no"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setData({ ...data, rentedBefore: v })}
                      className="flex-1 py-5 rounded-xl border text-sm font-semibold transition-all"
                      style={{
                        backgroundColor: data.rentedBefore === v ? "#1F2F3A" : "#FFFFFF",
                        borderColor: data.rentedBefore === v ? "#1F2F3A" : "#D8D2C8",
                        color: data.rentedBefore === v ? "#FAF8F5" : "#1F2F3A",
                        fontFamily: "var(--font-dm-sans)",
                      }}
                    >
                      {v === "yes" ? "Yes, it has" : "No, first time"}
                    </button>
                  ))}
                </div>
                {data.rentedBefore === "yes" && (
                  <div className="mb-6">
                    <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
                      What was the last rent?
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>$</span>
                      <input
                        type="text"
                        value={data.lastRent}
                        onChange={(e) => setData({ ...data, lastRent: e.target.value })}
                        className={`${inputClass} pl-8`}
                        style={inputStyle}
                        placeholder="1,800 / month"
                      />
                    </div>
                    <p className="text-xs mt-1.5" style={{ color: "#BBBBBB", fontFamily: "var(--font-dm-sans)" }}>
                      Approximate is fine — we&apos;ll verify against current market rates.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Property Management branch */}
            {data.service === "property-management" && (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
                  Your Involvement
                </p>
                <h2 className="text-2xl sm:text-3xl font-semibold mb-1 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
                  How hands-off do you want to be?
                </h2>
                <p className="text-sm mb-8 leading-relaxed" style={{ color: "#888888", fontFamily: "var(--font-dm-sans)" }}>
                  There&apos;s no wrong answer. Some landlords still want to approve big decisions. Others want zero contact with the property. Tell us where you land.
                </p>
                <div className="mb-4">
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={data.helpLevel}
                    onChange={(e) => setData({ ...data, helpLevel: Number(e.target.value) })}
                    className="w-full accent-[#8B2030]"
                    style={{ cursor: "pointer" }}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs" style={{ color: "#BBBBBB", fontFamily: "var(--font-dm-sans)" }}>Just the basics</span>
                    <span className="text-xs" style={{ color: "#BBBBBB", fontFamily: "var(--font-dm-sans)" }}>Make it disappear</span>
                  </div>
                </div>
                <div
                  className="rounded-xl p-5 text-center mb-6"
                  style={{ backgroundColor: "#F7F5F2", border: "1px solid #E8E3DC" }}
                >
                  <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
                    You selected
                  </p>
                  <p className="text-2xl font-light" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
                    {HELP_LABELS[data.helpLevel - 1]}
                  </p>
                </div>
              </>
            )}

            {/* Both branch */}
            {data.service === "both" && (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
                  Rental History
                </p>
                <h2 className="text-2xl sm:text-3xl font-semibold mb-1 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
                  Has it been rented before?
                </h2>
                <p className="text-sm mb-7 leading-relaxed" style={{ color: "#888888", fontFamily: "var(--font-dm-sans)" }}>
                  Helps us anchor the rent analysis on real history — not just guesswork.
                </p>
                <div className="flex gap-4 mb-6">
                  {(["yes", "no"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setData({ ...data, rentedBefore: v })}
                      className="flex-1 py-5 rounded-xl border text-sm font-semibold transition-all"
                      style={{
                        backgroundColor: data.rentedBefore === v ? "#1F2F3A" : "#FFFFFF",
                        borderColor: data.rentedBefore === v ? "#1F2F3A" : "#D8D2C8",
                        color: data.rentedBefore === v ? "#FAF8F5" : "#1F2F3A",
                        fontFamily: "var(--font-dm-sans)",
                      }}
                    >
                      {v === "yes" ? "Yes, it has" : "No, first time"}
                    </button>
                  ))}
                </div>
                {data.rentedBefore === "yes" && (
                  <div className="mb-6">
                    <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
                      What was the last rent?
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: "#999999" }}>$</span>
                      <input
                        type="text"
                        value={data.lastRent}
                        onChange={(e) => setData({ ...data, lastRent: e.target.value })}
                        className={`${inputClass} pl-8`}
                        style={inputStyle}
                        placeholder="1,800 / month"
                      />
                    </div>
                  </div>
                )}
                <div className="mb-2">
                  <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
                    And how involved do you want to stay?
                  </p>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={data.helpLevel}
                    onChange={(e) => setData({ ...data, helpLevel: Number(e.target.value) })}
                    className="w-full accent-[#8B2030]"
                    style={{ cursor: "pointer" }}
                  />
                  <div className="flex justify-between mt-1 mb-4">
                    <span className="text-xs" style={{ color: "#BBBBBB", fontFamily: "var(--font-dm-sans)" }}>Some involvement</span>
                    <span className="text-xs" style={{ color: "#BBBBBB", fontFamily: "var(--font-dm-sans)" }}>Fully hands-off</span>
                  </div>
                  <div
                    className="rounded-xl p-4 text-center"
                    style={{ backgroundColor: "#F7F5F2", border: "1px solid #E8E3DC" }}
                  >
                    <p className="text-lg font-light" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
                      {HELP_LABELS[data.helpLevel - 1]}
                    </p>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3 mt-8">
              <button
                type="button"
                onClick={back}
                className="flex-1 py-4 text-xs font-semibold uppercase tracking-widest rounded-lg border transition-colors"
                style={{ borderColor: "#D8D2C8", color: "#666666", fontFamily: "var(--font-dm-sans)" }}
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={next}
                disabled={
                  data.service !== "property-management" && data.rentedBefore === null
                }
                className="flex-[2] py-4 text-xs font-semibold uppercase tracking-widest rounded-lg disabled:opacity-40 transition-opacity"
                style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 5: Contact info ────────────────────────────────────── */}
        {step === 5 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
              Last Step
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-1 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
              How do we reach you?
            </h2>
            <p className="text-sm mb-7 leading-relaxed" style={{ color: "#888888", fontFamily: "var(--font-dm-sans)" }}>
              Ebin reaches out personally — not a call centre, not an auto-response. We&apos;ll call or email based on your preference.
            </p>

            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
                  Full Name <span style={{ color: "#8B2030" }}>*</span>
                </label>
                <input
                  required
                  type="text"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  className={inputClass}
                  style={inputStyle}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
                  Phone Number <span style={{ color: "#8B2030" }}>*</span>
                </label>
                <input
                  required
                  type="tel"
                  value={data.phone}
                  onChange={(e) => setData({ ...data, phone: e.target.value })}
                  className={inputClass}
                  style={inputStyle}
                  placeholder="(519) 000-0000"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
                  Email Address <span style={{ color: "#8B2030" }}>*</span>
                </label>
                <input
                  required
                  type="email"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  className={inputClass}
                  style={inputStyle}
                  placeholder="you@email.com"
                />
              </div>
            </div>

            {/* Summary */}
            <div
              className="rounded-xl p-5 mb-6"
              style={{ backgroundColor: "#F7F5F2", border: "1px solid #E8E3DC" }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
                Your request summary
              </p>
              <div className="space-y-1">
                <p className="text-sm" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                  <span style={{ color: "#999999" }}>Service:</span>{" "}
                  {data.service === "tenant-placement"
                    ? "Tenant Placement"
                    : data.service === "property-management"
                    ? "Property Management"
                    : "Both"}
                </p>
                {data.address && (
                  <p className="text-sm" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                    <span style={{ color: "#999999" }}>Property:</span> {data.address}
                  </p>
                )}
                {data.homeType && (
                  <p className="text-sm" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                    <span style={{ color: "#999999" }}>Type:</span> {data.homeType}, {data.beds} bed / {data.baths} bath
                  </p>
                )}
              </div>
            </div>

            {status === "error" && (
              <p className="text-sm mb-4" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>
                Something went wrong. Please try again or call us at (519) 697-1227.
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={back}
                className="flex-1 py-4 text-xs font-semibold uppercase tracking-widest rounded-lg border transition-colors"
                style={{ borderColor: "#D8D2C8", color: "#666666", fontFamily: "var(--font-dm-sans)" }}
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={status === "loading" || !data.name.trim() || !data.phone.trim() || !data.email.trim()}
                className="flex-[2] py-4 text-xs font-semibold uppercase tracking-widest rounded-lg disabled:opacity-40 transition-opacity"
                style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
              >
                {status === "loading" ? "Sending..." : "Send My Request →"}
              </button>
            </div>

            <p className="text-xs text-center mt-4" style={{ color: "#BBBBBB", fontFamily: "var(--font-dm-sans)" }}>
              No spam. No automated responses. Ebin responds personally.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
