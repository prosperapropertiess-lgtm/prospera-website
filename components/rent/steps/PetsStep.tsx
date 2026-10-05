"use client";
import { StepShell } from "../StepShell";
import { SelectableCard } from "../ui/SelectableCard";
import { PET_OPTIONS } from "@/lib/rent/options";
import { NAVY, BORDER, WHITE, BODY_FONT } from "../tokens";
import type { StepProps } from "./types";

export function PetsStep({ draft, update, onNext, onBack, pct }: StepProps) {
  const pets = draft.pets ?? [];
  const hasPet = pets.length > 0 && !pets.includes("No pets");

  function select(v: string) {
    update({ pets: [v], pets_note: v === "No pets" ? undefined : draft.pets_note });
    if (v === "No pets") setTimeout(onNext, 300);
  }

  return (
    <StepShell
      section="Preferences"
      pct={pct}
      heading="Any pets coming with you?"
      onBack={onBack}
      onContinue={hasPet ? onNext : undefined}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
        {PET_OPTIONS.map((opt) => (
          <SelectableCard key={opt} label={opt} selected={pets.includes(opt)} onClick={() => select(opt)} compact />
        ))}
      </div>

      {hasPet && (
        <input
          autoFocus
          placeholder="Anything we should know? (optional)"
          value={draft.pets_note ?? ""}
          onChange={(e) => update({ pets_note: e.target.value })}
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
