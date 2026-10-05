"use client";
import { StepShell } from "../StepShell";
import { Counter } from "../ui/Counter";
import { SelectableCard } from "../ui/SelectableCard";
import type { StepProps } from "./types";

export function HouseholdSizeStep({ draft, update, onNext, onBack, pct }: StepProps) {
  const size = draft.household_size ?? 1;
  const hasChildren = draft.children_present;

  return (
    <StepShell
      section="About You"
      pct={pct}
      heading="How many people would live there?"
      onBack={onBack}
      onContinue={onNext}
      continueDisabled={hasChildren === true && !draft.children_count}
    >
      <Counter value={size} onChange={(v) => update({ household_size: v })} label="people" min={1} max={10} />

      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#1F2F3A", opacity: 0.5, margin: "36px 0 10px" }}>
        Any children?
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <SelectableCard label="No" selected={draft.children_present === false} onClick={() => update({ children_present: false, children_count: undefined })} compact />
        <SelectableCard label="Yes" selected={draft.children_present === true} onClick={() => update({ children_present: true })} compact />
      </div>

      {hasChildren === true && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {["1", "2", "3+"].map((c) => (
            <SelectableCard key={c} label={c} selected={draft.children_count === c} onClick={() => update({ children_count: c })} compact />
          ))}
        </div>
      )}
    </StepShell>
  );
}
