"use client";
import { StepShell } from "../StepShell";
import { Chip } from "../ui/Chip";
import { PROPERTY_TYPES } from "@/lib/rent/options";
import type { StepProps } from "./types";

export function PropertyTypeStep({ draft, update, onNext, onBack, pct }: StepProps) {
  const selected = draft.property_types ?? [];

  function toggle(v: string) {
    update({ property_types: selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v] });
  }

  return (
    <StepShell section="What You're Looking For" pct={pct} heading="What kind of place feels right?" onBack={onBack} onContinue={onNext} continueDisabled={selected.length === 0} wide>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {PROPERTY_TYPES.map((opt) => (
          <Chip key={opt} label={opt} selected={selected.includes(opt)} onClick={() => toggle(opt)} />
        ))}
      </div>
    </StepShell>
  );
}
