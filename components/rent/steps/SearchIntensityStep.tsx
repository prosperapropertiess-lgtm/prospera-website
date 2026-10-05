"use client";
import { motion } from "framer-motion";
import { StepShell } from "../StepShell";
import { SEARCH_INTENSITY_OPTIONS } from "@/lib/rent/options";
import { NAVY, BURGUNDY, BORDER, WHITE, HEADING_FONT, BODY_FONT } from "../tokens";
import type { StepProps } from "./types";

export function SearchIntensityStep({ draft, update, onNext, onBack, pct }: StepProps) {
  function select(v: string) {
    update({ search_intensity: v });
    setTimeout(onNext, 300);
  }

  return (
    <StepShell section="Almost Done" pct={pct} heading="How actively are you looking?" onBack={onBack} wide>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {SEARCH_INTENSITY_OPTIONS.map((opt) => {
          const selected = draft.search_intensity === opt.value;
          return (
            <motion.button
              key={opt.value}
              type="button"
              onClick={() => select(opt.value)}
              whileTap={{ scale: 0.98 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                textAlign: "left",
                borderRadius: 16,
                border: `1.5px solid ${selected ? BURGUNDY : BORDER}`,
                backgroundColor: selected ? "rgba(139,32,48,0.06)" : WHITE,
                padding: "20px 22px",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 30 }}>{opt.emoji}</span>
              <span>
                <span style={{ display: "block", fontFamily: HEADING_FONT, fontWeight: 700, fontSize: 19, color: NAVY }}>{opt.label}</span>
                <span style={{ display: "block", fontFamily: BODY_FONT, fontSize: 14, color: NAVY, opacity: 0.65, marginTop: 2 }}>{opt.helper}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </StepShell>
  );
}
