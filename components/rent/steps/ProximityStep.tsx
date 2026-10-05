"use client";
import { StepShell } from "../StepShell";
import { Chip } from "../ui/Chip";
import { PROXIMITY_OPTIONS } from "@/lib/rent/options";
import { NAVY, BORDER, WHITE, BODY_FONT } from "../tokens";
import type { StepProps } from "./types";

export function ProximityStep({ draft, update, onNext, onBack, pct }: StepProps) {
  const selected = draft.proximity_preferences ?? [];
  const showDetail = selected.includes("Work") || selected.includes("School");

  function toggle(v: string) {
    update({ proximity_preferences: selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v] });
  }

  return (
    <StepShell section="Lifestyle" pct={pct} heading="Anything you want to be close to?" onBack={onBack} onContinue={onNext} continueDisabled={selected.length === 0} wide>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {PROXIMITY_OPTIONS.map((opt) => (
          <Chip key={opt} label={opt} selected={selected.includes(opt)} onClick={() => toggle(opt)} />
        ))}
      </div>

      {showDetail && (
        <input
          autoFocus
          placeholder="Enter an intersection, neighbourhood, employer, or school (optional)"
          value={draft.proximity_detail ?? ""}
          onChange={(e) => update({ proximity_detail: e.target.value })}
          style={{
            marginTop: 16,
            width: "100%",
            padding: "14px 16px",
            borderRadius: 10,
            border: `1.5px solid ${BORDER}`,
            backgroundColor: WHITE,
            color: NAVY,
            fontFamily: BODY_FONT,
            fontSize: 15,
          }}
        />
      )}
    </StepShell>
  );
}
