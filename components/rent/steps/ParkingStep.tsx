"use client";
import { StepShell } from "../StepShell";
import { Chip } from "../ui/Chip";
import { PARKING_OPTIONS } from "@/lib/rent/options";
import type { StepProps } from "./types";

export function ParkingStep({ draft, update, onNext, onBack, pct }: StepProps) {
  const selected = draft.parking ?? [];

  function toggle(v: string) {
    update({ parking: selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v] });
  }

  return (
    <StepShell section="Preferences" pct={pct} heading="How much parking do you need?" onBack={onBack} onContinue={onNext} continueDisabled={selected.length === 0} wide>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {PARKING_OPTIONS.map((opt) => (
          <Chip key={opt} label={opt} selected={selected.includes(opt)} onClick={() => toggle(opt)} />
        ))}
      </div>
    </StepShell>
  );
}
