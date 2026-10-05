import type { RentalProfileDraft } from "@/lib/rent/types";

export interface StepProps {
  draft: RentalProfileDraft;
  update: (patch: Partial<RentalProfileDraft>) => void;
  onNext: () => void;
  onBack: () => void;
  pct: number;
}
