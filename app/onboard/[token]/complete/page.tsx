"use client";

import { useEffect, useRef } from "react";
import { Balloons, type BalloonsRef } from "@/components/ui/balloons";

const BG          = "#F5F4F1";
const CARD        = "#FFFFFF";
const CARD_BORDER = "rgba(15,28,40,0.07)";
const CARD_SHADOW = "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)";
const NAVY        = "#0F1C28";
const MUTED       = "rgba(15,28,40,0.60)";
const SUBTLE      = "rgba(15,28,40,0.42)";
const GREEN       = "#0A7A52";
const GREEN_BG    = "rgba(10,122,82,0.09)";

const CHECKLIST = [
  "Property registered in system",
  "Rent collection schedule created",
  "Management agreement on file",
  "First monthly report arrives on the 3rd",
  "Ebin will book the key handover",
];

const NEXT_STEPS = [
  { step: "1", title: "Key handover", body: "Ebin will reach out within 24 hours to book a time at your property." },
  { step: "2", title: "First walkthrough", body: "A quick inspection and photos before the first rent collection." },
  { step: "3", title: "You're live", body: "Sit back — we handle everything from here and send you a report every month." },
];

export default function OnboardCompletePage() {
  const balloonsRef = useRef<BalloonsRef>(null);

  useEffect(() => {
    // Fire balloons after the page animations settle
    const t = setTimeout(() => {
      balloonsRef.current?.launch();
    }, 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: BG,
      fontFamily: "var(--font-poppins), -apple-system, sans-serif",
      display: "flex",
      flexDirection: "column",
    }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes checkIn { from { opacity: 0; transform: scale(0.7); }       to { opacity: 1; transform: scale(1); } }
        .check-item { animation: fadeUp 0.5s ease both; }
        .check-item:nth-child(1) { animation-delay: 0.3s; }
        .check-item:nth-child(2) { animation-delay: 0.45s; }
        .check-item:nth-child(3) { animation-delay: 0.6s; }
        .check-item:nth-child(4) { animation-delay: 0.75s; }
        .check-item:nth-child(5) { animation-delay: 0.9s; }
      `}</style>

      {/* Balloons canvas — renders over the page via balloons-js portaling */}
      <Balloons ref={balloonsRef} />

      {/* 100% green progress bar */}
      <div style={{ height: 4, background: "rgba(15,28,40,0.08)" }}>
        <div style={{ height: "100%", width: "100%", background: GREEN }} />
      </div>

      {/* Header */}
      <div style={{ padding: "20px 32px" }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: NAVY }}>Prospera Properties</p>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: 520 }}>

          {/* Icon */}
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: GREEN_BG,
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 28, fontSize: 32, color: GREEN,
            animation: "checkIn 0.5s ease 0.1s both",
          }}>
            ✓
          </div>

          {/* Heading */}
          <div style={{ animation: "fadeUp 0.5s ease 0.15s both" }}>
            <h1 style={{ margin: "0 0 12px", fontSize: 34, fontWeight: 800, color: NAVY, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              You&apos;re all set.
            </h1>
            <p style={{ margin: "0 0 32px", fontSize: 15, color: MUTED, lineHeight: 1.7 }}>
              Ebin will be in touch shortly to book your key handover and first walkthrough.
            </p>
          </div>

          {/* Checklist */}
          <div style={{ marginBottom: 28 }}>
            {CHECKLIST.map((item, i) => (
              <div key={i} className="check-item" style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: GREEN_BG,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, color: GREEN, fontWeight: 700, flexShrink: 0, marginTop: 1,
                }}>
                  ✓
                </div>
                <span style={{ fontSize: 15, color: MUTED, lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>

          {/* What happens next */}
          <div style={{
            background: CARD, border: `1px solid ${CARD_BORDER}`,
            boxShadow: CARD_SHADOW, borderRadius: 20, padding: "24px",
            marginBottom: 24, animation: "fadeUp 0.5s ease 1.1s both",
          }}>
            <p style={{ margin: "0 0 18px", fontSize: 11, fontWeight: 700, color: SUBTLE, letterSpacing: "0.07em", textTransform: "uppercase" }}>
              What happens next
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {NEXT_STEPS.map(({ step, title, body }) => (
                <div key={step} style={{ display: "flex", gap: 14 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: "rgba(15,28,40,0.06)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: NAVY, flexShrink: 0,
                  }}>
                    {step}
                  </div>
                  <div>
                    <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: NAVY }}>{title}</p>
                    <p style={{ margin: 0, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div style={{ animation: "fadeUp 0.5s ease 1.2s both" }}>
            <p style={{ margin: "0 0 10px", fontSize: 13, color: SUBTLE }}>Questions? Reach Ebin directly:</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a href="mailto:prosperapropertiess@gmail.com" style={{
                display: "inline-flex", alignItems: "center",
                background: CARD, border: `1px solid ${CARD_BORDER}`,
                boxShadow: "0 1px 3px rgba(15,28,40,0.05)",
                borderRadius: 10, padding: "9px 14px",
                fontSize: 13, color: NAVY, textDecoration: "none", fontWeight: 500,
              }}>
                prosperapropertiess@gmail.com
              </a>
              <a href="tel:5196971227" style={{
                display: "inline-flex", alignItems: "center",
                background: CARD, border: `1px solid ${CARD_BORDER}`,
                boxShadow: "0 1px 3px rgba(15,28,40,0.05)",
                borderRadius: 10, padding: "9px 14px",
                fontSize: 13, color: NAVY, textDecoration: "none", fontWeight: 500,
              }}>
                (519) 697-1227
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
