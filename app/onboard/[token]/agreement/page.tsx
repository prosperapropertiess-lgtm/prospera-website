"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
const INPUT_BORDER = "rgba(15,28,40,0.10)";
const INPUT_FOCUS  = "rgba(139,32,48,0.40)";
const DIVIDER     = "rgba(15,28,40,0.07)";

const MANAGEMENT_SECTIONS = [
  {
    title: "What this is",
    body: "This is the agreement that lets us legally manage your property on your behalf.",
  },
  {
    title: "What we do for you",
    body: "Once this is signed, we take over the day-to-day management of your property:\n\n• Collect rent each month and transfer the net amount directly to you\n• Handle all tenant communication — repairs, complaints, questions\n• Screen and place new tenants when a vacancy opens (credit check, employment verification, references)\n• Arrange repairs and coordinate with contractors\n• Conduct regular inspections and provide written reports\n• Keep everything compliant with Ontario's Residential Tenancies Act",
  },
  {
    title: "What you pay us",
    body: "Our fee is the rate we discussed when you came on board. It's deducted from rent before we transfer the rest to you — you never write us a cheque. If no rent is collected (vacancy period), no management fee is charged for that month.",
  },
  {
    title: "Repairs and maintenance",
    body: "We can approve routine repairs up to your repair limit (set in your property details) without calling you first — this is what lets us handle emergencies at 2am without waking you up. For anything larger than that limit — a roof repair, a major appliance replacement — we contact you before spending a cent.",
  },
  {
    title: "Your right to leave",
    body: "This agreement is month-to-month. If it's not working for you, give us 30 days written notice and we'll transfer your property file, keys, and all records back to you cleanly. No penalty, no long-term lock-in.",
  },
  {
    title: "What we need from you",
    body: "• Keep standard landlord insurance on the property\n• Tell us about anything we should know — existing issues, tenant disputes, or planned changes\n• If you'd like to visit the property, coordinate with us first — unannounced visits during an active tenancy can create legal complications under the Residential Tenancies Act",
  },
  {
    title: "Ontario law",
    body: "Everything we do is governed by Ontario's Residential Tenancies Act, 2006. We protect both your rights as a landlord and your tenants' rights as residents — because a fair, well-managed tenancy is what protects your investment long-term.",
  },
];

const PLACEMENT_SECTIONS = [
  {
    title: "What this is",
    body: "This agreement appoints Prospera Properties to find and place a qualified tenant for your property. We handle the marketing, screening, and lease coordination — you approve the final tenant and keep full control.",
  },
  {
    title: "What we do for you",
    body: "Once this is signed, we handle the full placement process:\n\n• Create and publish your rental listing across multiple platforms (Kijiji, Facebook Marketplace, our website)\n• Write a professional listing description and position your property competitively\n• Handle all tenant inquiries and communication\n• Pre-qualify prospective tenants before scheduling viewings\n• Conduct viewings and coordinate schedules",
  },
  {
    title: "How we screen tenants",
    body: "Every applicant goes through our full screening process:\n\n• Credit check (with applicant consent)\n• Employment and income verification\n• Previous landlord reference checks\n• Rental history verification\n\nYou see the full file on each qualified applicant. You make the final call — we never approve a tenant without your say.",
  },
  {
    title: "Lease coordination",
    body: "Once you approve a tenant, we handle the paperwork:\n\n• Prepare the Ontario Standard Lease\n• Coordinate signing between you and the tenant\n• Collect first month's rent and last month's rent deposit\n• Hand everything over to you cleanly",
  },
  {
    title: "What you pay us",
    body: "Our placement fee is the rate we discussed. It's payable once a tenant signs the lease and moves in — not before. If we don't place a tenant, you don't pay.",
  },
  {
    title: "Replacement guarantee",
    body: "If the tenant we place breaks the lease within the first 90 days, or is evicted for reasons that our screening should have caught, we'll find a replacement tenant at no additional placement fee.",
  },
  {
    title: "What we need from you",
    body: "• Provide accurate information about the property (we'll walk you through it)\n• Keep the property in showable condition during the placement period\n• Respond to tenant approval requests within a reasonable time\n• Cooperate with showing schedules\n• Ensure the rental unit meets all legal requirements",
  },
  {
    title: "Your right to cancel",
    body: "Either party can cancel this agreement with 7 days written notice. If you cancel after marketing has begun, you may be asked to reimburse incurred advertising costs (if any). No hidden fees, no lock-in.",
  },
  {
    title: "Ontario law",
    body: "This agreement and all placement activities comply with Ontario's Residential Tenancies Act, 2006, the Ontario Human Rights Code, and all applicable fair housing regulations. We screen based on legitimate business factors only — never on protected grounds.",
  },
];

export default function AgreementPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [signedName, setSignedName] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [ip, setIp] = useState("");
  const [serviceType, setServiceType] = useState<"placement" | "management">("placement");

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((r) => r.json())
      .then((d) => setIp(d.ip ?? ""))
      .catch(() => {});
    // Fetch session to get service_type
    fetch(`/api/onboard/${token}/status`)
      .then((r) => r.json())
      .then((d) => { if (d.service_type) setServiceType(d.service_type); })
      .catch(() => {});
  }, [token]);

  const isPlacement = serviceType === "placement";
  const SECTIONS = isPlacement ? PLACEMENT_SECTIONS : MANAGEMENT_SECTIONS;

  async function sign(e: React.FormEvent) {
    e.preventDefault();
    if (!signedName.trim() || signedName.trim().split(/\s+/).filter(Boolean).length < 2) {
      setError("Please type your full name (first and last).");
      return;
    }
    setSaving(true); setError("");
    const r = await fetch(`/api/onboard/${token}/step/5`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signed_name: signedName.trim(), ip }),
    });
    const d = await r.json();
    if (!r.ok) { setError(d.error || "Something went wrong."); setSaving(false); return; }
    setDone(true);
    if (isPlacement) {
      // Placement: go straight to add property
      setTimeout(() => router.push(`/admin/properties/new`), 2500);
    } else {
      // Management: continue to lease upload
      setTimeout(() => router.push(`/onboard/${token}/lease`), 2500);
    }
  }

  const canSign = signedName.trim().split(/\s+/).filter(Boolean).length >= 2;

  return (
    <div style={{
      minHeight: "100vh",
      background: BG,
      fontFamily: "var(--font-poppins), -apple-system, sans-serif",
    }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes checkIn { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      {/* Progress bar */}
      <div style={{ height: 4, background: "rgba(15,28,40,0.08)" }}>
        <div style={{ height: "100%", width: done ? "66%" : "25%", background: BURGUNDY, transition: "width 0.6s ease" }} />
      </div>

      {/* Header */}
      <div style={{ padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          onClick={() => router.push(`/onboard/${token}`)}
          style={{
            background: "none", border: "none", cursor: "pointer", padding: "6px 0",
            fontSize: 14, color: MUTED, fontWeight: 500, display: "flex", alignItems: "center", gap: 6,
            fontFamily: "var(--font-poppins), -apple-system, sans-serif",
          }}
        >
          ← Back
        </button>
        <span style={{ fontSize: 13, color: SUBTLE, fontWeight: 500 }}>Step 1 of 3 · Agreement</span>
      </div>

      <div style={{ maxWidth: 620, margin: "0 auto", padding: "16px 20px 80px", animation: "fadeUp 0.5s ease both" }}>

        {done ? (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: GREEN_BG,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: 30, color: GREEN,
              animation: "checkIn 0.4s ease both",
            }}>
              ✓
            </div>
            <h1 style={{ margin: "0 0 10px", fontSize: 28, fontWeight: 800, color: NAVY, letterSpacing: "-0.02em" }}>
              Signed and saved.
            </h1>
            <p style={{ margin: "0 0 6px", fontSize: 15, color: MUTED, lineHeight: 1.6 }}>
              Your agreement is on file. Ebin has been notified.
            </p>
            <p style={{ margin: 0, fontSize: 13, color: SUBTLE }}>
              {isPlacement ? "Taking you to add your property…" : "Taking you to the next step…"}
            </p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ margin: "0 0 10px", fontSize: 28, fontWeight: 800, color: NAVY, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                {isPlacement ? "Tenant Placement Agreement" : "Management Agreement"}
              </h1>
              <p style={{ margin: 0, fontSize: 15, color: MUTED, lineHeight: 1.7 }}>
                Read through the agreement below, then type your full name to sign. Takes about 2 minutes.
              </p>
            </div>

            {/* Agreement — inline readable sections */}
            <div style={{
              background: CARD,
              border: `1px solid ${CARD_BORDER}`,
              boxShadow: CARD_SHADOW,
              borderRadius: 16,
              overflow: "hidden",
              marginBottom: 20,
            }}>
              {/* Agreement header */}
              <div style={{ padding: "24px 28px 20px", borderBottom: `1px solid ${DIVIDER}` }}>
                <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: SUBTLE, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {isPlacement ? "Tenant Placement Agreement" : "Property Management Agreement"}
                </p>
                <p style={{ margin: 0, fontSize: 15, color: MUTED }}>
                  Between you and Prospera Properties (operated by Ebin Jaison, London, Ontario)
                </p>
              </div>

              {/* Sections */}
              {SECTIONS.map((s, i) => (
                <div
                  key={i}
                  style={{
                    padding: "22px 28px",
                    borderBottom: i < SECTIONS.length - 1 ? `1px solid ${DIVIDER}` : "none",
                  }}
                >
                  <p style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 700, color: NAVY }}>
                    {s.title}
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: 16,
                    color: NAVY,
                    lineHeight: 1.85,
                    whiteSpace: "pre-line",
                    opacity: 0.82,
                  }}>
                    {s.body}
                  </p>
                </div>
              ))}
            </div>

            {/* Signature form */}
            <form onSubmit={sign}>
              <div style={{
                background: CARD,
                border: `1px solid ${canSign ? "rgba(139,32,48,0.25)" : CARD_BORDER}`,
                boxShadow: CARD_SHADOW,
                borderRadius: 16,
                padding: "24px",
                marginBottom: 16,
                transition: "border-color 0.2s",
              }}>
                <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: SUBTLE, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Your Signature
                </p>
                <p style={{ margin: "0 0 16px", fontSize: 13, color: MUTED }}>
                  Type your full legal name exactly as it appears on your ID
                </p>
                <input
                  type="text"
                  value={signedName}
                  onChange={(e) => { setSignedName(e.target.value); setError(""); }}
                  placeholder="First Last"
                  autoComplete="name"
                  style={{
                    width: "100%",
                    background: BG,
                    border: `1px solid ${INPUT_BORDER}`,
                    borderRadius: 10,
                    padding: "14px 16px",
                    fontSize: 18,
                    color: NAVY,
                    outline: "none",
                    fontFamily: "var(--font-poppins), -apple-system, sans-serif",
                    letterSpacing: "0.01em",
                    transition: "border-color 0.15s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = INPUT_FOCUS; }}
                  onBlur={(e) => { e.target.style.borderColor = INPUT_BORDER; }}
                />
                {signedName && (
                  <p style={{ margin: "8px 0 0", fontSize: 12, color: canSign ? GREEN : MUTED, fontWeight: 500 }}>
                    {canSign ? "✓ Full name confirmed" : "Please include both first and last name"}
                  </p>
                )}
              </div>

              {error && (
                <p style={{ margin: "0 0 14px", fontSize: 13, color: "#B91C1C", textAlign: "center", fontWeight: 500 }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={!canSign || saving}
                style={{
                  width: "100%",
                  background: canSign ? BURGUNDY : "rgba(15,28,40,0.06)",
                  color: canSign ? "#fff" : SUBTLE,
                  border: "none",
                  borderRadius: 12,
                  padding: "15px 24px",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: canSign ? "pointer" : "not-allowed",
                  fontFamily: "var(--font-poppins), -apple-system, sans-serif",
                  transition: "all 0.2s",
                  marginBottom: 12,
                }}
              >
                {saving ? "Signing…" : canSign ? `Sign as "${signedName}" →` : "Type your full name above"}
              </button>

              <p style={{ margin: 0, textAlign: "center", fontSize: 12, color: SUBTLE, lineHeight: 1.6 }}>
                By signing, you agree to the terms above. This is a legally binding agreement.
                <br />
                Your signature, timestamp, and IP address are recorded for your records.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
