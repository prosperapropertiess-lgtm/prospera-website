"use client";
import { StepShell } from "../StepShell";
import { Chip } from "../ui/Chip";
import { MUST_HAVES } from "@/lib/rent/options";
import { NAVY, BODY_FONT } from "../tokens";
import type { StepProps } from "./types";

// Spec's two-phase ask ("select many" then "which 3 matter most") lives on
// one screen: selected items get a numbered top-3 order on tap, so ranking
// happens inline without a second full step.
export function MustHavesStep({ draft, update, onNext, onBack, pct }: StepProps) {
  const selected = draft.must_haves ?? [];
  const top3 = draft.top_priorities ?? [];

  function toggleSelect(v: string) {
    if (selected.includes(v)) {
      update({ must_haves: selected.filter((s) => s !== v), top_priorities: top3.filter((t) => t !== v) });
    } else {
      update({ must_haves: [...selected, v] });
    }
  }

  function toggleRank(v: string) {
    if (top3.includes(v)) {
      update({ top_priorities: top3.filter((t) => t !== v) });
    } else if (top3.length < 3) {
      update({ top_priorities: [...top3, v] });
    }
  }

  return (
    <StepShell
      section="Preferences"
      pct={pct}
      heading='What would make you say "yes" to a place?'
      onBack={onBack}
      onContinue={onNext}
      continueDisabled={selected.length === 0}
      wide
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {MUST_HAVES.map((opt) => (
          <Chip key={opt} label={opt} selected={selected.includes(opt)} onClick={() => toggleSelect(opt)} />
        ))}
      </div>

      {selected.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <p style={{ fontFamily: "var(--font-cormorant)", fontWeight: 700, fontSize: 20, color: NAVY, margin: "0 0 4px" }}>Which 3 matter most?</p>
          <p style={{ fontFamily: BODY_FONT, fontSize: 13, color: NAVY, opacity: 0.6, margin: "0 0 14px" }}>Tap up to 3, in the order they matter.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {selected.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => toggleRank(opt)}
                disabled={!top3.includes(opt) && top3.length >= 3}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  borderRadius: 999,
                  border: `1.5px solid ${top3.includes(opt) ? "#8B2030" : "#D8D2C8"}`,
                  backgroundColor: top3.includes(opt) ? "rgba(139,32,48,0.08)" : "#FFFFFF",
                  color: NAVY,
                  padding: "9px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: BODY_FONT,
                  cursor: "pointer",
                  opacity: !top3.includes(opt) && top3.length >= 3 ? 0.4 : 1,
                }}
              >
                {top3.includes(opt) && (
                  <span style={{ width: 18, height: 18, borderRadius: "50%", backgroundColor: "#8B2030", color: "#FFFFFF", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {top3.indexOf(opt) + 1}
                  </span>
                )}
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </StepShell>
  );
}
