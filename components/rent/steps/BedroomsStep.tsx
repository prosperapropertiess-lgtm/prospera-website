"use client";
import { StepShell } from "../StepShell";
import { SelectableCard } from "../ui/SelectableCard";
import { BEDROOM_OPTIONS } from "@/lib/rent/options";
import type { StepProps } from "./types";

export function BedroomsStep({ draft, update, onNext, onBack, pct }: StepProps) {
  function select(v: string) {
    update({ bedrooms: v });
    setTimeout(onNext, 300);
  }

  return (
    <StepShell section="What You're Looking For" pct={pct} heading="How many bedrooms do you need?" onBack={onBack}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 10 }}>
        {BEDROOM_OPTIONS.map((opt) => (
          <SelectableCard key={opt} label={opt} selected={draft.bedrooms === opt} onClick={() => select(opt)} compact />
        ))}
      </div>
    </StepShell>
  );
}
