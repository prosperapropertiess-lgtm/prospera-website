"use client";
import { StepShell } from "../StepShell";
import { SelectableCard } from "../ui/SelectableCard";
import { BATHROOM_OPTIONS } from "@/lib/rent/options";
import type { StepProps } from "./types";

export function BathroomsStep({ draft, update, onNext, onBack, pct }: StepProps) {
  function select(v: string) {
    update({ bathrooms: v });
    setTimeout(onNext, 300);
  }

  return (
    <StepShell section="What You're Looking For" pct={pct} heading="How many bathrooms would you prefer?" onBack={onBack}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 10 }}>
        {BATHROOM_OPTIONS.map((opt) => (
          <SelectableCard key={opt} label={opt} selected={draft.bathrooms === opt} onClick={() => select(opt)} compact />
        ))}
      </div>
    </StepShell>
  );
}
