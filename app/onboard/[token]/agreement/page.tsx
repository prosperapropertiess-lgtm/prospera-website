"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Balloons, BalloonsRef } from "@/components/ui/balloons";

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
    title: "First — this is just for both of us",
    body: "This agreement makes sure we both know what to expect. Nothing in here is meant to trap you or confuse you.\n\nIf anything feels unclear, just ask. We'd rather explain it twice than have you sign something you're unsure about.",
  },
  {
    title: "What we do, from day one to move-in",
    body: "The moment this is signed, we get to work:\n\n• We run a rental market analysis so your property is priced right from the start\n• We write your listing and post it everywhere — Kijiji, Facebook, our website, and more\n• We place a lawn sign at the property to attract local interest\n• We handle every inquiry, answer every question, and pre-screen callers before booking a showing\n• We coordinate all showings and collect full applications\n• We run a full background check on every applicant — employment, income, credit, ID, and previous landlord references\n• We present you with a clear summary of every qualified applicant\n• Once you pick your tenant, we prepare the lease, coordinate signing, and collect the deposits\n\nYou focus on your life. We handle the leasing.",
  },
  {
    title: "You choose the tenant — always",
    body: "We do the work and give you our honest recommendation. But the final decision is always yours.\n\nWe will never sign a lease without your go-ahead. If you're not comfortable with an applicant, you can say no — no explanation needed.",
  },
  {
    title: "How the money works",
    body: "Our placement fee is 75% of the first month's rent. Here's exactly how it flows:\n\n• We collect the first month's rent and last month's rent deposit from the tenant before move-in\n• We keep 75% of the first month's rent as our fee\n• We send you the remaining 25% of first month's rent\n• We send you the full last month's rent deposit — every dollar — before keys are handed over\n• You hold the last month's deposit for the tenancy, as required by Ontario law\n\nYou don't write us a cheque. If we don't place a tenant, you don't pay us anything.",
  },
  {
    title: "We keep you informed the whole way",
    body: "You'll never be left wondering what's happening.\n\nWe update you at least once a week — showing activity, applicant interest, market feedback. If something important comes up, we reach out right away.\n\nOur job isn't just to find a tenant. It's to make sure you feel good the whole way through.",
  },
  {
    title: "What we need from you",
    body: "We only ask for a few things:\n\n• Keep the property in showable condition — clean and accessible\n• Tell us anything we should know about the unit (past issues, quirks, restrictions)\n• When we bring you an applicant, try to respond within 48 hours — delays can cost you the tenant\n• Make sure the unit meets Ontario's minimum standards for rental housing",
  },
  {
    title: "What happens if something goes wrong after move-in",
    body: "We work hard to find the right tenant. But no screening process can see the future.\n\nIf a tenant we placed leaves voluntarily or is lawfully evicted within the first 90 days — for something our screening should have caught — we'll do one replacement search at no additional fee.\n\nIf you ever have a question after move-in, reach out. We'll point you in the right direction.",
  },
  {
    title: "A few honest limits",
    body: "We want to be straight with you:\n\n• We can't guarantee a specific rent amount, number of applicants, or how fast the unit leases — that depends on the market and the property\n• We screen carefully, but we can't predict what happens in a tenant's life after they move in\n• Our screening is thorough and consistent — but it's a process, not a guarantee\n• Prospera Properties is not a law firm and does not give legal, tax, or financial advice\n\nWhat we can promise: we'll work hard, keep you informed, and be honest with you every step of the way.",
  },
  {
    title: "Your right to cancel",
    body: "Either party can cancel with 7 days written notice. If we've already started marketing and incurred direct advertising costs, we may ask you to cover those — but we'll always tell you before it happens.\n\nNo penalty. No lock-in. No hard feelings.",
  },
  {
    title: "Ontario law",
    body: "Everything we do follows Ontario's Residential Tenancies Act, 2006, the Ontario Human Rights Code, and all applicable fair housing laws. We screen on legitimate rental criteria only — income, credit, references, and rental history. Never on race, gender, religion, family status, disability, or any other protected ground.",
  },
];

function renderBody(body: string) {
  const blocks = body.split("\n\n");
  const elements: React.ReactNode[] = [];

  const pStyle: React.CSSProperties = {
    fontSize: 15,
    color: "rgba(15,28,40,0.75)",
    lineHeight: 2.0,
    margin: "0 0 16px 0",
  };
  const ulStyle: React.CSSProperties = {
    margin: "12px 0 16px 0",
    paddingLeft: 0,
    listStyle: "none",
  };
  const liStyle: React.CSSProperties = {
    fontSize: 15,
    color: "rgba(15,28,40,0.75)",
    lineHeight: 1.9,
    paddingLeft: 20,
    position: "relative",
    marginBottom: 10,
  };

  blocks.forEach((block, bi) => {
    const lines = block.split("\n");
    const bulletLines = lines.filter((l) => l.startsWith("•"));
    const nonBulletLines = lines.filter((l) => !l.startsWith("•"));

    if (bulletLines.length > 0) {
      // Render any intro text (non-bullet lines before bullets)
      const introText = nonBulletLines.join(" ").trim();
      if (introText) {
        elements.push(
          <p key={`p-${bi}`} style={pStyle}>{introText}</p>
        );
      }
      elements.push(
        <ul key={`ul-${bi}`} style={ulStyle}>
          {bulletLines.map((line, li) => (
            <li key={li} style={liStyle}>
              <span style={{ position: "absolute", left: 0, color: "#8B2030" }}>–</span>
              {line.replace(/^•\s*/, "")}
            </li>
          ))}
        </ul>
      );
    } else {
      const text = block.trim();
      if (text) {
        elements.push(
          <p key={`p-${bi}`} style={pStyle}>{text}</p>
        );
      }
    }
  });

  return <div style={{ margin: 0 }}>{elements}</div>;
}

export default function AgreementPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const balloonsRef = useRef<BalloonsRef>(null);

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
    const r = await fetch(`/api/onboard/${token}/step/3`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signed_name: signedName.trim(), ip }),
    });
    const d = await r.json();
    if (!r.ok) { setError(d.error || "Something went wrong."); setSaving(false); return; }
    setDone(true);
    balloonsRef.current?.launch();
    if (isPlacement) {
      // Placement: go straight to add property
      setTimeout(() => router.push(`/onboard/${token}`), 2500);
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

      <Balloons ref={balloonsRef} />

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
              Sit back and relax. Everything else will be handled.
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
                    padding: "28px 32px",
                    borderBottom: i < SECTIONS.length - 1 ? `1px solid ${DIVIDER}` : "none",
                  }}
                >
                  <p style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: NAVY }}>
                    {s.title}
                  </p>
                  {renderBody(s.body)}
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
