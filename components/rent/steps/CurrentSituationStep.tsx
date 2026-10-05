"use client";
import { StepShell } from "../StepShell";
import { SelectableCard } from "../ui/SelectableCard";
import { CURRENT_SITUATION_OPTIONS } from "@/lib/rent/options";
import type { StepProps } from "./types";

export function CurrentSituationStep({ draft, update, onNext, onBack, pct }: StepProps) {
  function select(v: string) {
    update({ current_situation: v });
    setTimeout(onNext, 300);
  }

  return (
    <StepShell section="Almost Done" pct={pct} heading="What's your current situation?" onBack={onBack} wide>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
        {CURRENT_SITUATION_OPTIONS.map((opt) => (
          <SelectableCard key={opt} label={opt} selected={draft.current_situation === opt} onClick={() => select(opt)} compact />
        ))}
      </div>
    </StepShell>
  );
}
