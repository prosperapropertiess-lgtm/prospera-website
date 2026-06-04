"use client";

import { useParams } from "next/navigation";

const BG     = "#080c14";
const TEXT   = "#EDE9E3";
const TEXT_SEC = "rgba(237,233,227,0.55)";
const TEXT_MUT = "rgba(237,233,227,0.28)";
const ACCENT = "#8B2030";
const GREEN  = "#22c55e";
const FONT   = "var(--font-dm-sans, sans-serif)";

const CHECKLIST = [
  "Your property is registered in our system",
  "Rent collection schedule created",
  "Management agreement on file",
  "Your first monthly report arrives on the 3rd",
  "Ebin will be in touch to book the key handover",
];

export default function OnboardCompletePage() {
  useParams(); // token available if needed

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: BG,
      color: TEXT,
      fontFamily: FONT,
      display: "flex",
      flexDirection: "column",
    }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes checkIn {
          from { opacity: 0; transform: scale(0.6) }
          to   { opacity: 1; transform: scale(1) }
        }
        .check-item {
          animation: fadeUp 0.5s cubic-bezier(0.23,1,0.32,1) both;
        }
        .check-item:nth-child(1) { animation-delay: 0.3s }
        .check-item:nth-child(2) { animation-delay: 0.45s }
        .check-item:nth-child(3) { animation-delay: 0.6s }
        .check-item:nth-child(4) { animation-delay: 0.75s }
        .check-item:nth-child(5) { animation-delay: 0.9s }
      `}</style>

      {/* Progress bar — 100% */}
      <div style={{ height: 3, backgroundColor: "rgba(255,255,255,0.05)" }}>
        <div style={{ height: "100%", width: "100%", backgroundColor: GREEN, transition: "width 0.8s cubic-bezier(0.23,1,0.32,1)" }} />
      </div>

      {/* Logo */}
      <div style={{ padding: "24px 32px" }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: ACCENT }}>
          Prospera Properties
        </p>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}>
        <div style={{ width: "100%", maxWidth: 500 }}>

          {/* Icon */}
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            backgroundColor: `${GREEN}15`,
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 28,
            fontSize: 32,
            animation: "checkIn 0.5s cubic-bezier(0.23,1,0.32,1) 0.1s both",
          }}>
            🎉
          </div>

          {/* Heading */}
          <div style={{ animation: "fadeUp 0.6s cubic-bezier(0.23,1,0.32,1) 0.15s both" }}>
            <h1 style={{ margin: "0 0 14px", fontSize: 34, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, color: TEXT }}>
              You&apos;re with Prospera.
            </h1>
            <p style={{ margin: "0 0 32px", fontSize: 16, color: TEXT_SEC, lineHeight: 1.7 }}>
              Ebin has everything he needs. Here&apos;s what&apos;s been set up on your behalf:
            </p>
          </div>

          {/* Checklist */}
          <div style={{ marginBottom: 36 }}>
            {CHECKLIST.map((item, i) => (
              <div key={i} className="check-item" style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  backgroundColor: `${GREEN}20`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, color: GREEN, fontWeight: 700, flexShrink: 0, marginTop: 1,
                }}>
                  ✓
                </div>
                <span style={{ fontSize: 15, color: TEXT_SEC, lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>

          {/* What happens next */}
          <div style={{
            backgroundColor: "#0f1520",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16,
            padding: "20px 22px",
            marginBottom: 28,
            animation: "fadeUp 0.6s cubic-bezier(0.23,1,0.32,1) 1.1s both",
          }}>
            <p style={{ margin: "0 0 8px", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: TEXT_MUT }}>
              What happens next
            </p>
            <p style={{ margin: 0, fontSize: 14, color: TEXT_SEC, lineHeight: 1.7 }}>
              Ebin will reach out within 24 hours to book the key handover and initial walkthrough at your property. After that, you&apos;re fully live — we take it from here.
            </p>
          </div>

          {/* Contact */}
          <div style={{ animation: "fadeUp 0.6s cubic-bezier(0.23,1,0.32,1) 1.2s both" }}>
            <p style={{ margin: "0 0 6px", fontSize: 13, color: TEXT_MUT }}>Questions? Reach Ebin directly:</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a
                href="mailto:prosperapropertiess@gmail.com"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8, padding: "9px 14px",
                  fontSize: 13, color: TEXT_SEC, textDecoration: "none",
                }}
              >
                ✉ prosperapropertiess@gmail.com
              </a>
              <a
                href="tel:5196971227"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8, padding: "9px 14px",
                  fontSize: 13, color: TEXT_SEC, textDecoration: "none",
                }}
              >
                📞 (519) 697-1227
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
