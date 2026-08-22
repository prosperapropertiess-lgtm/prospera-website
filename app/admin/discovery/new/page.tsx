"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import AddressAutocomplete from "@/components/ui/AddressAutocomplete";

const BG = "#F7F5F2";
const SURFACE = "#FFFFFF";
const BORDER = "#D8D2C8";
const TEXT = "#222222";
const TEXT_SEC = "#666666";
const TEXT_MUT = "#999999";
const ACCENT = "#8B2030";
const NAVY = "#1F2F3A";

const inputCls = "w-full px-4 py-3.5 rounded-xl text-base outline-none transition-colors focus:border-[#1F2F3A]";
const inputStyle = { border: `1.5px solid ${BORDER}`, backgroundColor: BG, color: TEXT };

interface FormState {
  landlord_name: string;
  landlord_phone: string;
  landlord_email: string;
  num_properties_owned: string;
  property_address: string;
  property_city: string;
  property_type: string;
  bedrooms: string;
  bathrooms: string;
  occupancy_status: string;
  approx_monthly_rent: string;
  property_condition: string;
  condition_notes: string;
  reason_for_call: string;
  service_type: string;
  involvement_level: string;
  timeline: string;
}

const BLANK: FormState = {
  landlord_name: "", landlord_phone: "", landlord_email: "", num_properties_owned: "",
  property_address: "", property_city: "London", property_type: "", bedrooms: "", bathrooms: "",
  occupancy_status: "", approx_monthly_rent: "", property_condition: "", condition_notes: "",
  reason_for_call: "", service_type: "", involvement_level: "", timeline: "",
};

interface Verdict {
  ai_verdict: "good_fit" | "not_a_fit" | "borderline";
  ai_reasoning: string;
  ai_concerns: string[];
}

function Script({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 15, color: TEXT_SEC, fontStyle: "italic", margin: "0 0 14px", lineHeight: 1.5 }}>
      &ldquo;{children}&rdquo;
    </p>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest mb-2 font-semibold" style={{ color: TEXT_MUT }}>{label}</label>
      {children}
    </div>
  );
}

function Chips({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className="px-4 py-3 rounded-xl text-sm font-medium transition-all"
            style={{
              backgroundColor: active ? NAVY : SURFACE,
              color: active ? "#FAF8F5" : TEXT_SEC,
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
    <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 18, padding: 26, marginBottom: 20 }}>
      <div className="flex items-center gap-3 mb-5">
        <span style={{
          width: 30, height: 30, borderRadius: "50%", backgroundColor: "rgba(139,32,48,0.08)",
          color: ACCENT, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>{num}</span>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: 0 }}>{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default function NewDiscoveryCallPage() {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(BLANK);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [gettingVerdict, setGettingVerdict] = useState(false);
  const [acting, setActing] = useState<"reject" | "convert" | null>(null);
  const [error, setError] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Start the draft record once on mount
  useEffect(() => {
    fetch("/api/admin/discovery", { method: "POST" })
      .then((r) => r.json())
      .then((d) => setId(d.id))
      .catch(() => setError("Couldn't start a new call — try reloading."));
  }, []);

  const save = useCallback((next: FormState, callId: string) => {
    setSaveState("saving");
    fetch(`/api/admin/discovery/${callId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...next,
        num_properties_owned: next.num_properties_owned ? Number(next.num_properties_owned) : null,
        bedrooms: next.bedrooms ? Number(next.bedrooms) : null,
        bathrooms: next.bathrooms ? Number(next.bathrooms) : null,
        approx_monthly_rent: next.approx_monthly_rent ? Number(next.approx_monthly_rent) : null,
      }),
    })
      .then(() => setSaveState("saved"))
      .catch(() => setSaveState("idle"));
  }, []);

  function set(field: keyof FormState, value: string) {
    const next = { ...form, [field]: value };
    setForm(next);
    setVerdict(null); // answers changed — old verdict no longer applies
    if (!id) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(next, id), 700);
  }

  async function getVerdict() {
    if (!id) return;
    setGettingVerdict(true);
    setError("");
    const res = await fetch(`/api/admin/discovery/${id}/verdict`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setVerdict({ ai_verdict: data.call.ai_verdict, ai_reasoning: data.call.ai_reasoning, ai_concerns: data.call.ai_concerns ?? [] });
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Couldn't get an assessment.");
    }
    setGettingVerdict(false);
  }

  async function sendRejection() {
    if (!id) return;
    setActing("reject");
    setError("");
    const res = await fetch(`/api/admin/discovery/${id}/reject`, { method: "POST" });
    if (res.ok) {
      router.push("/admin/discovery");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Couldn't send the email.");
    }
    setActing(null);
  }

  async function convertToOnboarding() {
    if (!id) return;
    setActing("convert");
    setError("");
    const res = await fetch(`/api/admin/discovery/${id}/convert`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      router.push(`/admin/onboard/${data.onboarding_token}`);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Couldn't start onboarding.");
    }
    setActing(null);
  }

  const canGetVerdict = form.landlord_name.trim() && form.property_address.trim();
  const canDecide = verdict !== null;

  const verdictColors: Record<string, { bg: string; fg: string; label: string }> = {
    good_fit: { bg: "#DCFCE7", fg: "#166534", label: "Good Fit" },
    not_a_fit: { bg: "#FEE2E2", fg: "#991B1B", label: "Not a Fit" },
    borderline: { bg: "#FEF3C7", fg: "#92400E", label: "Borderline" },
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, fontFamily: "var(--font-poppins, sans-serif)" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 24px 140px" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 style={{ fontSize: 24, fontWeight: 700, color: NAVY, margin: 0 }}>Discovery Call</h1>
          <span style={{ fontSize: 12, color: TEXT_MUT }}>
            {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : ""}
          </span>
        </div>
        <p style={{ fontSize: 14, color: TEXT_SEC, margin: "0 0 28px" }}>
          Answer as you go — this saves itself as you talk.
        </p>

        <Section num="1" title="Say this first">
          <Script>Thanks for calling Prospera Properties! Before we go further, let me ask a few quick questions so I can see if we&apos;re a good fit for what you need.</Script>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Their name"><input className={inputCls} style={inputStyle} value={form.landlord_name} onChange={(e) => set("landlord_name", e.target.value)} placeholder="Full name" /></Field>
            <Field label="Phone"><input className={inputCls} style={inputStyle} value={form.landlord_phone} onChange={(e) => set("landlord_phone", e.target.value)} placeholder="(519) 000-0000" /></Field>
          </div>
          <Field label="Email"><input className={inputCls} style={inputStyle} value={form.landlord_email} onChange={(e) => set("landlord_email", e.target.value)} placeholder="you@email.com" /></Field>
          <Field label="How many properties do you own in total?">
            <input className={inputCls} style={inputStyle} type="number" value={form.num_properties_owned} onChange={(e) => set("num_properties_owned", e.target.value)} placeholder="e.g. 2" />
          </Field>
        </Section>

        <Section num="2" title="About the property">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Address">
              <AddressAutocomplete
                value={form.property_address}
                onChange={(v) => set("property_address", v)}
                onPlaceSelect={(place) => {
                  const next = { ...form, property_address: place.street_address, property_city: place.city || form.property_city };
                  setForm(next);
                  if (id) {
                    if (saveTimer.current) clearTimeout(saveTimer.current);
                    saveTimer.current = setTimeout(() => save(next, id), 300);
                  }
                }}
                placeholder="Start typing an address..."
                className={inputCls}
                style={inputStyle}
              />
            </Field>
            <Field label="City"><input className={inputCls} style={inputStyle} value={form.property_city} onChange={(e) => set("property_city", e.target.value)} placeholder="London" /></Field>
          </div>
          <Field label="Property type">
            <Chips options={["House", "Townhouse", "Apartment", "Duplex", "Basement Unit", "Other"]} value={form.property_type} onChange={(v) => set("property_type", v)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Bedrooms"><input className={inputCls} style={inputStyle} type="number" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} /></Field>
            <Field label="Bathrooms"><input className={inputCls} style={inputStyle} type="number" step="0.5" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} /></Field>
          </div>
          <Field label="Currently occupied or vacant?">
            <Chips options={["Occupied", "Vacant"]} value={form.occupancy_status} onChange={(v) => set("occupancy_status", v)} />
          </Field>
          <Field label="What rent are you hoping to get / currently getting?">
            <input className={inputCls} style={inputStyle} type="number" value={form.approx_monthly_rent} onChange={(e) => set("approx_monthly_rent", e.target.value)} placeholder="$/month" />
          </Field>
          <Field label="Condition — ask: can you tell me about the condition, any recent renovations or known issues?">
            <Chips options={["Excellent", "Good", "Needs some work", "Needs major repairs"]} value={form.property_condition} onChange={(v) => set("property_condition", v)} />
          </Field>
          <Field label="Notes on condition">
            <textarea className={inputCls} style={inputStyle} rows={2} value={form.condition_notes} onChange={(e) => set("condition_notes", e.target.value)} placeholder="Anything specific they mentioned..." />
          </Field>
        </Section>

        <Section num="3" title="Their situation">
          <Field label="Ask: what's making you look for a property manager right now?">
            <textarea className={inputCls} style={inputStyle} rows={2} value={form.reason_for_call} onChange={(e) => set("reason_for_call", e.target.value)} placeholder="What they said..." />
          </Field>
          <Field label="Are they looking for full management or just tenant placement?">
            <Chips
              options={["Full Management", "Placement Only"]}
              value={form.service_type === "management" ? "Full Management" : form.service_type === "placement" ? "Placement Only" : ""}
              onChange={(v) => set("service_type", v === "Full Management" ? "management" : "placement")}
            />
          </Field>
          <Field label="Ask: how involved do you want to stay in day-to-day decisions?">
            <Chips options={["Fully hands-off", "Some involvement", "Wants to approve everything"]} value={form.involvement_level} onChange={(v) => set("involvement_level", v)} />
          </Field>
          <Field label="How soon do they want this managed / rented?">
            <Chips options={["ASAP", "Within a month", "Just exploring"]} value={form.timeline} onChange={(v) => set("timeline", v)} />
          </Field>
        </Section>

        {/* Verdict */}
        <Section num="4" title="Fit assessment">
          {!verdict ? (
            <button
              onClick={getVerdict}
              disabled={!canGetVerdict || gettingVerdict}
              className="w-full py-4 rounded-xl text-sm font-semibold uppercase tracking-widest transition-opacity disabled:opacity-40"
              style={{ backgroundColor: NAVY, color: "#FAF8F5" }}
            >
              {gettingVerdict ? "Thinking…" : "Get Fit Assessment"}
            </button>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="px-4 py-2 rounded-full text-sm font-bold"
                  style={{ backgroundColor: verdictColors[verdict.ai_verdict].bg, color: verdictColors[verdict.ai_verdict].fg }}
                >
                  {verdictColors[verdict.ai_verdict].label}
                </span>
              </div>
              <p style={{ fontSize: 15, color: TEXT, lineHeight: 1.6, marginBottom: verdict.ai_concerns.length ? 14 : 0 }}>{verdict.ai_reasoning}</p>
              {verdict.ai_concerns.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {verdict.ai_concerns.map((c, i) => (
                    <li key={i} style={{ fontSize: 14, color: TEXT_SEC, marginBottom: 4 }}>{c}</li>
                  ))}
                </ul>
              )}
              <p style={{ fontSize: 12, color: TEXT_MUT, marginTop: 14 }}>This is a recommendation — you make the call.</p>
            </div>
          )}
        </Section>

        {error && (
          <div style={{ padding: "12px 16px", borderRadius: 10, backgroundColor: "rgba(139,32,48,0.08)", color: ACCENT, fontSize: 14, marginBottom: 16 }}>
            {error}
          </div>
        )}
      </div>

      {/* Sticky decision bar */}
      {canDecide && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          backgroundColor: NAVY, padding: "16px 24px", boxShadow: "0 -4px 20px rgba(0,0,0,0.15)",
        }}>
          <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", gap: 12 }}>
            <button
              onClick={sendRejection}
              disabled={acting !== null || !form.landlord_email}
              className="flex-1 py-4 rounded-xl text-sm font-semibold uppercase tracking-widest transition-opacity disabled:opacity-40"
              style={{ border: "1.5px solid rgba(250,248,245,0.3)", color: "#FAF8F5", backgroundColor: "transparent" }}
            >
              {acting === "reject" ? "Sending…" : "Send Rejection Email"}
            </button>
            <button
              onClick={convertToOnboarding}
              disabled={acting !== null}
              className="flex-1 py-4 rounded-xl text-sm font-semibold uppercase tracking-widest transition-opacity disabled:opacity-40"
              style={{ backgroundColor: ACCENT, color: "#FAF8F5" }}
            >
              {acting === "convert" ? "Starting…" : "Continue to Onboarding →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
