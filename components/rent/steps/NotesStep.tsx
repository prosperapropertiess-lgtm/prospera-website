"use client";
import { StepShell } from "../StepShell";
import { NAVY, BORDER, WHITE, BURGUNDY, BODY_FONT } from "../tokens";
import type { RentalProfileDraft } from "@/lib/rent/types";

interface Props {
  draft: RentalProfileDraft;
  update: (patch: Partial<RentalProfileDraft>) => void;
  onNext: () => void;
  onBack: () => void;
  pct: number;
  submitting: boolean;
  submitError: string | null;
}

// Last step — onNext here is RentFlow's actual submit trigger (POST to
// /api/rent), not another step transition.
export function NotesStep({ draft, update, onNext, onBack, pct, submitting, submitError }: Props) {
  return (
    <StepShell
      section="Almost Done"
      pct={pct}
      heading="Want to tell us anything else?"
      onBack={onBack}
      onContinue={onNext}
      continueDisabled={submitting}
      continueLabel={submitting ? "Submitting…" : "Get Matched →"}
      wide
    >
      <textarea
        value={draft.notes ?? ""}
        onChange={(e) => update({ notes: e.target.value })}
        placeholder="Example: We need a fenced yard for our dog, we'd love to stay near Masonville, and we're flexible on move-in date."
        rows={5}
        style={{
          width: "100%",
          padding: "14px 16px",
          borderRadius: 10,
          border: `1.5px solid ${BORDER}`,
          backgroundColor: WHITE,
          color: NAVY,
          fontFamily: BODY_FONT,
          fontSize: 15,
          resize: "vertical",
          lineHeight: 1.6,
        }}
      />
      {submitError && (
        <p style={{ fontFamily: BODY_FONT, fontSize: 13, color: BURGUNDY, marginTop: 12 }}>
          {submitError} Your answers are saved — just try again.
        </p>
      )}
    </StepShell>
  );
}
