"use client";
import { StepShell } from "../StepShell";
import { SelectableCard } from "../ui/SelectableCard";
import { getMoveTimingOptions } from "@/lib/rent/options";
import type { StepProps } from "./types";

export function MoveTimingStep({ draft, update, onNext, onBack, pct }: StepProps) {
  const options = getMoveTimingOptions();

  function select(value: string) {
    update({ move_timing: value });
    setTimeout(onNext, 300);
  }

  return (
    <StepShell section="About You" pct={pct} heading="When are you hoping to move?" onBack={onBack} wide>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
        {options.map((opt) => (
          <SelectableCard key={opt.value} label={opt.label} selected={draft.move_timing === opt.value} onClick={() => select(opt.value)} compact />
        ))}
      </div>
    </StepShell>
  );
}
