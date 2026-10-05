"use client";
import { StepShell } from "../StepShell";
import { SelectableCard } from "../ui/SelectableCard";
import { BUDGET_RANGES } from "@/lib/rent/options";
import { NAVY, BORDER, WHITE, BODY_FONT } from "../tokens";
import type { StepProps } from "./types";

export function BudgetStep({ draft, update, onNext, onBack, pct }: StepProps) {
  return (
    <StepShell
      section="Budget"
      pct={pct}
      heading="What's your comfortable monthly rent range?"
      onBack={onBack}
      onContinue={onNext}
      continueDisabled={!draft.budget_range}
      wide
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
        {BUDGET_RANGES.map((opt) => (
          <SelectableCard key={opt} label={opt} selected={draft.budget_range === opt} onClick={() => update({ budget_range: opt })} compact />
        ))}
      </div>

      {draft.budget_range && (
        <div style={{ marginTop: 24 }}>
          <p style={{ fontFamily: BODY_FONT, fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 8 }}>
            Want to enter a specific maximum? <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span>
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, maxWidth: 220 }}>
            <span style={{ fontFamily: BODY_FONT, fontSize: 16, color: NAVY }}>$</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="2500"
              value={draft.max_budget ?? ""}
              onChange={(e) => update({ max_budget: e.target.value ? Number(e.target.value) : undefined })}
              style={{
                flex: 1,
                padding: "12px 14px",
                borderRadius: 10,
                border: `1.5px solid ${BORDER}`,
                backgroundColor: WHITE,
                color: NAVY,
                fontFamily: BODY_FONT,
                fontSize: 15,
              }}
            />
            <span style={{ fontFamily: BODY_FONT, fontSize: 14, color: NAVY, opacity: 0.6 }}>/month</span>
          </div>
          <p style={{ fontFamily: BODY_FONT, fontSize: 12, color: NAVY, opacity: 0.5, marginTop: 6 }}>You can change this later.</p>
        </div>
      )}
    </StepShell>
  );
}
