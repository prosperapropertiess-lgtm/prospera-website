"use client";
import { StepShell } from "../StepShell";
import { SelectableCard } from "../ui/SelectableCard";
import { HOUSEHOLD_TYPES } from "@/lib/rent/options";
import { NAVY, BORDER, WHITE, BODY_FONT } from "../tokens";
import type { StepProps } from "./types";

export function HouseholdTypeStep({ draft, update, onNext, onBack, pct }: StepProps) {
  const isOther = draft.household_type === "Other";

  function select(value: string) {
    update({ household_type: value });
    if (value !== "Other") setTimeout(onNext, 300);
  }

  return (
    <StepShell
      section="About You"
      pct={pct}
      heading="Who are we finding a home for?"
      onBack={onBack}
      onContinue={isOther ? onNext : undefined}
      continueDisabled={isOther && !draft.household_type_other?.trim()}
      wide
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
        {HOUSEHOLD_TYPES.map((opt) => (
          <SelectableCard key={opt} label={opt} selected={draft.household_type === opt} onClick={() => select(opt)} compact />
        ))}
      </div>
      {isOther && (
        <input
          autoFocus
          placeholder="Tell us a little about your household"
          value={draft.household_type_other ?? ""}
          onChange={(e) => update({ household_type_other: e.target.value })}
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
