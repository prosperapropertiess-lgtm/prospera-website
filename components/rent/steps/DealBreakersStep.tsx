"use client";
import { StepShell } from "../StepShell";
import { Chip } from "../ui/Chip";
import { DEAL_BREAKERS } from "@/lib/rent/options";
import type { StepProps } from "./types";

const NOTHING = "Nothing major";

export function DealBreakersStep({ draft, update, onNext, onBack, pct }: StepProps) {
  const selected = draft.deal_breakers ?? [];

  function toggle(v: string) {
    if (v === NOTHING) {
      update({ deal_breakers: selected.includes(NOTHING) ? [] : [NOTHING] });
      return;
    }
    const withoutNothing = selected.filter((s) => s !== NOTHING);
    update({ deal_breakers: withoutNothing.includes(v) ? withoutNothing.filter((s) => s !== v) : [...withoutNothing, v] });
  }

  return (
    <StepShell section="Preferences" pct={pct} heading="Anything that's an instant no?" onBack={onBack} onContinue={onNext} continueDisabled={selected.length === 0} wide>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {DEAL_BREAKERS.filter((opt) => opt !== NOTHING).map((opt) => (
          <Chip key={opt} label={opt} selected={selected.includes(opt)} onClick={() => toggle(opt)} />
        ))}
        <Chip label={NOTHING} selected={selected.includes(NOTHING)} onClick={() => toggle(NOTHING)} />
      </div>
    </StepShell>
  );
}
