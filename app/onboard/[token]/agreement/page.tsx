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

const AGREEMENT_TEXT = `PROPERTY MANAGEMENT AGREEMENT

This Property Management Agreement ("Agreement") is entered into between the property owner ("Owner") and Prospera Properties ("Manager"), operated by Ebin Jaison, London, Ontario.

1. APPOINTMENT
Owner hereby appoints Manager as the exclusive property manager for the property described in the onboarding records, and Manager accepts such appointment.

2. TERM
This Agreement commences on the date of signing and continues on a month-to-month basis. Either party may terminate with 30 days written notice.

3. MANAGER'S DUTIES
Manager shall:
• Collect rent and account for all monies received
• Arrange for ordinary and emergency repairs up to the approved repair limit
• Screen and place tenants in accordance with applicable law
• Conduct periodic property inspections
• Provide monthly financial reports to Owner
• Comply with all applicable Ontario landlord-tenant laws and regulations

4. COMPENSATION
Owner agrees to pay Manager the management fee as specified during onboarding. The fee is deducted from rent collected before remittance to Owner.

5. OWNER'S RESPONSIBILITIES
Owner shall:
• Maintain adequate property insurance at all times
• Provide accurate information about the property
• Notify Manager promptly of any issues or changes
• Obtain Manager's approval before entering the property

6. REPAIR AUTHORIZATION
Manager is authorized to approve repairs up to the repair limit specified during onboarding without prior Owner approval. Larger repairs will be discussed before proceeding.

7. GOVERNING LAW
This Agreement is governed by the laws of Ontario and the Residential Tenancies Act, 2006.`;

export default function AgreementPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [signedName, setSignedName] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [ip, setIp] = useState("");

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((r) => r.json())
      .then((d) => setIp(d.ip ?? ""))
      .catch(() => {});
  }, []);

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
    setTimeout(() => router.push(`/onboard/${token}/complete`), 2500);
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
        <div style={{ height: "100%", width: done ? "100%" : "66%", background: BURGUNDY, transition: "width 0.6s ease" }} />
      </div>

      {/* Header */}
      <div style={{ padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: NAVY }}>Prospera Properties</p>
        <span style={{ fontSize: 13, color: SUBTLE, fontWeight: 500 }}>Step 3 of 3 · Agreement</span>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "16px 20px 80px", animation: "fadeUp 0.5s ease both" }}>

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
              Signed ✓
            </h1>
            <p style={{ margin: "0 0 6px", fontSize: 15, color: MUTED, lineHeight: 1.6 }}>
              Agreement saved to your file. Ebin has been notified.
            </p>
            <p style={{ margin: 0, fontSize: 13, color: SUBTLE }}>Taking you to the final step…</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ margin: "0 0 10px", fontSize: 28, fontWeight: 800, color: NAVY, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                Management Agreement
              </h1>
              <p style={{ margin: 0, fontSize: 15, color: MUTED, lineHeight: 1.7 }}>
                Read through the agreement below, then type your full name to sign. Takes about 2 minutes.
              </p>
            </div>

            {/* Agreement text */}
            <div style={{
              background: CARD,
              border: `1px solid ${CARD_BORDER}`,
              boxShadow: CARD_SHADOW,
              borderRadius: 16,
              padding: "24px",
              maxHeight: 400,
              overflowY: "scroll",
              marginBottom: 20,
            }}>
              <pre style={{
                margin: 0,
                whiteSpace: "pre-wrap",
                fontSize: 13,
                lineHeight: 1.8,
                color: MUTED,
                fontFamily: "var(--font-poppins), -apple-system, sans-serif",
              }}>
                {AGREEMENT_TEXT}
              </pre>
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
