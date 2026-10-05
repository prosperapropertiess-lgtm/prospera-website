"use client";
import Link from "next/link";
import { StepShell } from "../StepShell";
import { NAVY, BORDER, WHITE, BURGUNDY, BODY_FONT } from "../tokens";
import type { StepProps } from "./types";

const fieldStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 10,
  border: `1.5px solid ${BORDER}`,
  backgroundColor: WHITE,
  color: NAVY,
  fontFamily: BODY_FONT,
  fontSize: 15,
};

const labelStyle = { fontFamily: BODY_FONT, fontSize: 12, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: NAVY, opacity: 0.55, marginBottom: 6, display: "block" };

export function ContactStep({ draft, update, onNext, onBack, pct }: StepProps) {
  const emailValid = !!draft.email && /\S+@\S+\.\S+/.test(draft.email);
  const canContinue = !!draft.first_name?.trim() && emailValid && draft.marketing_consent === true;

  return (
    <StepShell
      section="Almost Done"
      pct={pct}
      heading="We've got your rental profile."
      subheading="Where should we send matching rentals?"
      onBack={onBack}
      onContinue={onNext}
      continueDisabled={!canContinue}
      continueLabel="Start Matching Me →"
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div>
          <label style={labelStyle}>First name</label>
          <input autoFocus value={draft.first_name ?? ""} onChange={(e) => update({ first_name: e.target.value })} style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Last name</label>
          <input value={draft.last_name ?? ""} onChange={(e) => update({ last_name: e.target.value })} style={fieldStyle} />
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Email</label>
        <input type="email" value={draft.email ?? ""} onChange={(e) => update({ email: e.target.value })} style={fieldStyle} placeholder="you@example.com" />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Mobile number</label>
        <input type="tel" value={draft.phone ?? ""} onChange={(e) => update({ phone: e.target.value })} style={fieldStyle} placeholder="So we can text you matches" />
      </div>

      <button
        type="button"
        onClick={() => update({ marketing_consent: !draft.marketing_consent })}
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          textAlign: "left",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <span
          style={{
            flexShrink: 0,
            marginTop: 2,
            width: 20,
            height: 20,
            borderRadius: 6,
            border: `1.5px solid ${draft.marketing_consent ? BURGUNDY : BORDER}`,
            backgroundColor: draft.marketing_consent ? BURGUNDY : WHITE,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: WHITE,
            fontSize: 12,
          }}
        >
          {draft.marketing_consent ? "✓" : ""}
        </span>
        <span style={{ fontFamily: BODY_FONT, fontSize: 13, color: NAVY, opacity: 0.75, lineHeight: 1.6 }}>
          I agree to receive rental matches and updates from Prospera Properties. I can unsubscribe anytime. See our{" "}
          <Link href="/privacy" style={{ color: BURGUNDY, textDecoration: "underline" }} onClick={(e) => e.stopPropagation()}>
            Privacy Policy
          </Link>
          .
        </span>
      </button>
    </StepShell>
  );
}
