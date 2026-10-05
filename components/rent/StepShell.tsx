"use client";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import { NAVY, BURGUNDY, BG, WHITE, BORDER, HEADING_FONT, BODY_FONT } from "./tokens";

interface Props {
  section: string;
  pct: number;
  heading: string;
  subheading?: string;
  children: ReactNode;
  onBack: () => void;
  onContinue?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  wide?: boolean;
}

// Shared per-step layout: sticky progress bar at top, question + answer UI
// in a centered scroll area, sticky back/continue footer. Continue only
// renders when a step passes onContinue (multi-select steps) — single-
// select steps auto-advance on tap and never show it, per spec.
export function StepShell({
  section,
  pct,
  heading,
  subheading,
  children,
  onBack,
  onContinue,
  continueLabel = "Continue",
  continueDisabled,
  wide,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", backgroundColor: BG }}
    >
      <div style={{ position: "sticky", top: 0, zIndex: 10, backgroundColor: BG, padding: "20px 20px 0" }}>
        <div style={{ maxWidth: wide ? 700 : 560, margin: "0 auto" }}>
          <ProgressBar pct={pct} label={section} />
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "32px 20px 120px" }}>
        <div style={{ width: "100%", maxWidth: wide ? 700 : 560 }}>
          <h1
            style={{
              fontFamily: HEADING_FONT,
              fontWeight: 700,
              fontSize: "clamp(26px, 4vw, 34px)",
              color: NAVY,
              lineHeight: 1.2,
              margin: "0 0 10px",
              letterSpacing: "-0.01em",
            }}
          >
            {heading}
          </h1>
          {subheading && (
            <p style={{ fontFamily: BODY_FONT, fontSize: 15, color: NAVY, opacity: 0.65, lineHeight: 1.6, margin: "0 0 28px" }}>
              {subheading}
            </p>
          )}
          <div style={{ marginTop: subheading ? 0 : 28 }}>{children}</div>
        </div>
      </div>

      <div
        style={{
          position: "sticky",
          bottom: 0,
          backgroundColor: "rgba(247,245,242,0.92)",
          backdropFilter: "blur(8px)",
          borderTop: `1px solid ${BORDER}`,
          padding: "16px 20px",
        }}
      >
        <div
          style={{
            maxWidth: wide ? 700 : 560,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <button
            type="button"
            onClick={onBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: BODY_FONT,
              fontSize: 14,
              fontWeight: 600,
              color: NAVY,
              opacity: 0.6,
              padding: "10px 4px",
              minHeight: 44,
            }}
          >
            <ChevronLeft size={18} /> Back
          </button>

          {onContinue && (
            <button
              type="button"
              onClick={onContinue}
              disabled={continueDisabled}
              style={{
                backgroundColor: BURGUNDY,
                color: WHITE,
                border: "none",
                borderRadius: 999,
                padding: "14px 32px",
                fontFamily: BODY_FONT,
                fontSize: 15,
                fontWeight: 700,
                cursor: continueDisabled ? "not-allowed" : "pointer",
                opacity: continueDisabled ? 0.4 : 1,
                minHeight: 48,
                minWidth: 140,
              }}
            >
              {continueLabel}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
