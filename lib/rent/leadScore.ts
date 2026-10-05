import type { RentalProfileDraft } from "./types";

// Internal only — never shown to the renter. Matches the spec's three
// tiers: hot (move within ~45 days + actively looking), warm (2-4 months
// out, looking around), future (everything else).
export function scoreRentalProfile(draft: RentalProfileDraft): "hot" | "warm" | "future" {
  const movingSoon = isMovingWithinDays(draft.move_timing, 45);
  const movingMedium = isMovingWithinDays(draft.move_timing, 120);

  if (movingSoon && draft.search_intensity === "ready_now") return "hot";
  if (movingSoon || (movingMedium && draft.search_intensity === "ready_now")) return "warm";
  if (movingMedium && draft.search_intensity === "looking_around") return "warm";
  return "future";
}

function isMovingWithinDays(moveTiming: string | undefined, days: number): boolean {
  if (!moveTiming) return false;
  if (moveTiming === "asap") return true;
  if (moveTiming === "flexible") return false;

  const match = /^(\d{4})-(\d{2})$/.exec(moveTiming);
  if (!match) return false;
  const target = new Date(Number(match[1]), Number(match[2]) - 1, 1);
  const diffDays = (target.getTime() - Date.now()) / 86400000;
  return diffDays <= days;
}
