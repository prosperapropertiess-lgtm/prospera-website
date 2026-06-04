"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

const BG      = "#080c14";
const SURFACE = "#0f1520";
const BORDER  = "rgba(255,255,255,0.08)";
const TEXT    = "#EDE9E3";
const TEXT_SEC = "rgba(237,233,227,0.55)";
const TEXT_MUT = "rgba(237,233,227,0.28)";
const ACCENT  = "#8B2030";
const FONT    = "var(--font-dm-sans, sans-serif)";

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
• Cooperate with Manager in carrying out the terms of this Agreement
• Fund repairs exceeding the approved repair limit promptly upon notification

6. TRUST ACCOUNT
All funds collected on Owner's behalf will be held in a designated trust account and disbursed in accordance with applicable regulations.

7. LIABILITY
Manager shall not be liable for any act or omission of any tenant, or for any loss or damage to the property unless caused by Manager's negligence or willful misconduct.

8. GOVERNING LAW
This Agreement is governed by the laws of Ontario, Canada.

9. ENTIRE AGREEMENT
This document constitutes the entire agreement between the parties and supersedes all prior discussions and understandings.

By typing your full name below, you agree to the terms of this Property Management Agreement and confirm you are authorized to enter into this agreement on behalf of the property owner.`;

export default function AgreementPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [signedName, setSignedName] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function sign(e: React.FormEvent) {
    e.preventDefault();
    if (!signedName.trim() || signedName.trim().split(" ").length < 2) {
      setError("Please type your full name (first and last).");
      return;
    }
    setSaving(true); setError("");

    // Get IP (best effort)
    let ip = "";
    try {
      const r = await fetch("https://api.ipify.org?format=json");
      const d = await r.json();
      ip = d.ip ?? "";
    } catch { /* ignore */ }

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

  const canSign = signedName.trim().split(" ").filter(Boolean).length >= 2;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, color: TEXT, fontFamily: FONT }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes checkIn { from { opacity: 0; transform: scale(0.7) } to { opacity: 1; transform: scale(1) } }
      `}</style>

      {/* Progress bar */}
      <div style={{ height: 3, backgroundColor: "rgba(255,255,255,0.05)" }}>
        <div style={{ height: "100%", width: "75%", backgroundColor: ACCENT, transition: "width 0.6s ease" }} />
      </div>

      {/* Logo */}
      <div style={{ padding: "24px 32px" }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT }}>
          Prospera Properties
        </p>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "16px 24px 80px", animation: "fadeUp 0.6s cubic-bezier(0.23,1,0.32,1) both" }}>

        {done ? (
          <div style={{ textAlign: "center", paddingTop: 60 }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              backgroundColor: "rgba(139,32,48,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: 32,
              animation: "checkIn 0.4s cubic-bezier(0.23,1,0.32,1) both",
            }}>
              ✓
            </div>
            <h1 style={{ margin: "0 0 12px", fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", color: TEXT }}>
              Agreement signed.
            </h1>
            <p style={{ margin: "0 0 8px", fontSize: 16, color: TEXT_SEC, lineHeight: 1.6 }}>
              Saved to your file. Ebin has been notified.
            </p>
            <p style={{ margin: 0, fontSize: 14, color: TEXT_MUT }}>
              Taking you to the final step…
            </p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 32 }}>
              <p style={{ margin: "0 0 6px", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: TEXT_MUT }}>
                Step 3 of 3
              </p>
              <h1 style={{ margin: "0 0 12px", fontSize: 30, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, color: TEXT }}>
                Management Agreement
              </h1>
              <p style={{ margin: 0, fontSize: 15, color: TEXT_SEC, lineHeight: 1.7 }}>
                Read through the agreement below, then type your full name to sign. Takes about 2 minutes.
              </p>
            </div>

            {/* Agreement text */}
            <div style={{
              backgroundColor: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: 16,
              padding: "24px",
              maxHeight: 400,
              overflowY: "scroll",
              marginBottom: 28,
            }}>
              <pre style={{
                margin: 0, whiteSpace: "pre-wrap", fontSize: 13,
                lineHeight: 1.8, color: TEXT_SEC, fontFamily: FONT,
              }}>
                {AGREEMENT_TEXT}
              </pre>
            </div>

            {/* Signature */}
            <form onSubmit={sign}>
              <div style={{
                backgroundColor: SURFACE,
                border: `1px solid ${canSign ? "rgba(139,32,48,0.4)" : BORDER}`,
                borderRadius: 16,
                padding: "24px",
                marginBottom: 16,
                transition: "border-color 0.2s",
              }}>
                <p style={{ margin: "0 0 6px", fontSize: 11, letterSpacing: "0.07em", textTransform: "uppercase", color: TEXT_MUT }}>
                  Your Signature
                </p>
                <p style={{ margin: "0 0 16px", fontSize: 13, color: TEXT_MUT }}>
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
                    backgroundColor: "rgba(255,255,255,0.04)",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 8,
                    padding: "14px 16px",
                    fontSize: 18,
                    color: TEXT,
                    outline: "none",
                    fontFamily: FONT,
                    letterSpacing: "0.01em",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(139,32,48,0.6)"; }}
                  onBlur={(e) => { e.target.style.borderColor = BORDER; }}
                />
                {signedName && (
                  <p style={{ margin: "8px 0 0", fontSize: 12, color: canSign ? "rgba(34,197,94,0.8)" : TEXT_MUT }}>
                    {canSign ? "✓ Full name confirmed" : "Please include both first and last name"}
                  </p>
                )}
              </div>

              {error && (
                <p style={{ margin: "0 0 14px", fontSize: 13, color: "#f87171", textAlign: "center" }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={!canSign || saving}
                style={{
                  width: "100%",
                  backgroundColor: canSign ? ACCENT : "rgba(255,255,255,0.06)",
                  color: canSign ? "#fff" : TEXT_MUT,
                  border: "none",
                  borderRadius: 12,
                  padding: "15px 24px",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: canSign ? "pointer" : "not-allowed",
                  letterSpacing: "-0.01em",
                  transition: "all 0.2s",
                  marginBottom: 12,
                }}
              >
                {saving ? "Signing…" : canSign ? `Sign as "${signedName}" →` : "Type your full name above"}
              </button>

              <p style={{ margin: 0, textAlign: "center", fontSize: 12, color: TEXT_MUT, lineHeight: 1.6 }}>
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
