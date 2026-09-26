"use client";
import { useState } from "react";

const CALENDLY = "https://calendly.com/prosperapropertiess";
const FONT = "var(--font-dm-sans)";
const SERIF = "var(--font-cormorant)";
const NAVY = "#1F2F3A";
const CRIMSON = "#8B2030";
const BORDER = "#D8D2C8";

const UNIT_OPTIONS = ["1", "2–4", "5–9", "10–15", "16+"];
const RENT_OPTIONS = ["Under $1,500", "$1,500–$2,499", "$2,500–$3,000", "$3,000+"];
// The one hard, objective disqualifier: rent has to clear roughly $2,500 to be a
// good fit. Everything else ("do they want to let go of control") stays as page
// copy, not a form question — there's no sane way to ask that directly.
const POOR_FIT_RENTS = new Set(["Under $1,500", "$1,500–$2,499"]);

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: "14px 16px", borderRadius: 10,
  border: `1px solid ${BORDER}`, backgroundColor: "#F7F5F2", color: "#1a1a1a",
  fontFamily: FONT, fontSize: 15,
};
const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: "#666", textTransform: "uppercase",
  letterSpacing: "0.06em", marginBottom: 8, display: "block", fontFamily: FONT,
};

function ChipRow({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          style={{
            padding: "10px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer",
            fontFamily: FONT, minHeight: 44,
            border: `2px solid ${value === opt ? NAVY : BORDER}`,
            backgroundColor: value === opt ? NAVY : "#FFFFFF",
            color: value === opt ? "#FFFFFF" : "#444",
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function OwnerCallForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [units, setUnits] = useState("");
  const [rent, setRent] = useState("");
  const [city, setCity] = useState("");
  const [selfManaged, setSelfManaged] = useState("");
  const [problem, setProblem] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  if (!open) return null;

  const poorFit = POOR_FIT_RENTS.has(rent);
  const canSubmit = units && rent && name.trim() && email.includes("@");

  async function submit() {
    setStatus("loading");
    const message = [
      `Units: ${units}`,
      `Approx. rent per unit: ${rent}`,
      city ? `City: ${city}` : null,
      selfManaged ? `Currently self-managed: ${selfManaged}` : null,
      problem ? `Biggest problem: ${problem}` : null,
      poorFit ? "(Flagged: below the ~$2,500 rent floor — likely not a fit, routed to free resources instead of a call.)" : null,
    ].filter(Boolean).join("\n");

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, city, type: "landlord", message, traffic_source: "owner_strategy_call_lp" }),
    });
    setStatus(res.ok ? "done" : "error");
  }

  function reset() {
    setUnits(""); setRent(""); setCity(""); setSelfManaged(""); setProblem("");
    setName(""); setPhone(""); setEmail(""); setStatus("idle");
    onClose();
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,20,25,0.55)", zIndex: 100, display: "flex", alignItems: "flex-end" }}
      onClick={reset}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#FFFFFF", width: "100%", maxWidth: 520, margin: "0 auto",
          borderRadius: "20px 20px 0 0", maxHeight: "92vh", overflowY: "auto",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.2)",
        }}
        className="sm:rounded-2xl sm:my-10"
      >
        <div style={{ padding: "28px 24px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
            <h2 style={{ fontSize: 24, fontWeight: 400, color: NAVY, fontFamily: SERIF, margin: 0 }}>
              {status === "done" ? (poorFit ? "Here's what we'd point you to" : "You're almost booked") : "Tell us about your rentals"}
            </h2>
            <button onClick={reset} style={{ background: "none", border: "none", fontSize: 22, color: "#999", cursor: "pointer", lineHeight: 1 }} aria-label="Close">×</button>
          </div>

          {status === "done" ? (
            poorFit ? (
              <div style={{ marginTop: 20 }}>
                <p style={{ fontSize: 15, color: "#444", fontFamily: FONT, lineHeight: 1.7, marginBottom: 20 }}>
                  Prospera works best on properties renting for about $2,500 a month or more —
                  the margin below that doesn&apos;t support the level of service we run. That
                  doesn&apos;t mean you&apos;re stuck. Our free landlord tools and guides can still
                  help you run things yourself.
                </p>
                <a
                  href="/resources"
                  style={{ display: "block", textAlign: "center", backgroundColor: NAVY, color: "#FAF8F5", fontFamily: FONT, fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "16px", borderRadius: 10, textDecoration: "none" }}
                >
                  See Free Landlord Tools →
                </a>
              </div>
            ) : (
              <div style={{ marginTop: 20 }}>
                <p style={{ fontSize: 15, color: "#444", fontFamily: FONT, lineHeight: 1.7, marginBottom: 20 }}>
                  Got it — pick a time that works and we&apos;ll take it from here.
                </p>
                <a
                  href={CALENDLY}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "block", textAlign: "center", backgroundColor: CRIMSON, color: "#FAF8F5", fontFamily: FONT, fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "16px", borderRadius: 10, textDecoration: "none" }}
                >
                  Pick a Time →
                </a>
              </div>
            )
          ) : (
            <>
              <p style={{ fontSize: 13, color: "#888", fontFamily: FONT, marginBottom: 24 }}>Takes about a minute.</p>

              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>How many rental units do you own?</label>
                <ChipRow options={UNIT_OPTIONS} value={units} onChange={setUnits} />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Roughly what does each unit rent for?</label>
                <ChipRow options={RENT_OPTIONS} value={rent} onChange={setRent} />
              </div>

              {rent && !poorFit && (
                <>
                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>City</label>
                    <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="London, St. Thomas, Strathroy…" style={inputStyle} />
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>Currently self-managed?</label>
                    <ChipRow options={["Yes", "No — using a manager now"]} value={selfManaged} onChange={setSelfManaged} />
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>What&apos;s the biggest headache right now? (optional)</label>
                    <input value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="e.g. tenant communication, repairs, rent collection…" style={inputStyle} />
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>Phone</label>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" style={inputStyle} />
                  </div>
                  <div style={{ marginBottom: 22 }}>
                    <label style={labelStyle}>Email</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" style={inputStyle} />
                  </div>
                </>
              )}

              {rent && poorFit && (
                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} style={{ ...inputStyle, marginBottom: 14 }} />
                  <label style={labelStyle}>Email</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" style={inputStyle} />
                </div>
              )}

              {rent && (
                <button
                  onClick={submit}
                  disabled={!canSubmit || status === "loading"}
                  style={{
                    display: "block", width: "100%", textAlign: "center",
                    backgroundColor: poorFit ? NAVY : CRIMSON, color: "#FAF8F5", fontFamily: FONT,
                    fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                    padding: "16px", borderRadius: 10, border: "none", cursor: "pointer",
                    opacity: !canSubmit ? 0.5 : 1, minHeight: 52,
                  }}
                >
                  {status === "loading" ? "One sec…" : poorFit ? "See Free Landlord Tools →" : "Continue to Book My Call →"}
                </button>
              )}
              {status === "error" && (
                <p style={{ color: CRIMSON, fontSize: 13, marginTop: 10, fontFamily: FONT }}>Something went wrong — try again, or call (519) 697-1227.</p>
              )}
              <p style={{ fontSize: 12, color: "#999", textAlign: "center", marginTop: 14, fontFamily: FONT }}>15 minutes · Free · No pressure</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
