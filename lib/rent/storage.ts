import type { RentalProfileDraft } from "./types";

const KEY = "prospera-rent-draft";
const STEP_KEY = "prospera-rent-step";

export function loadDraft(): RentalProfileDraft {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RentalProfileDraft) : {};
  } catch {
    return {};
  }
}

export function saveDraft(draft: RentalProfileDraft): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    // localStorage unavailable (private mode, quota) — autosave is a nice-
    // to-have, not a hard requirement, so fail silently.
  }
}

export function loadStepIndex(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(STEP_KEY);
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
}

export function saveStepIndex(index: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STEP_KEY, String(index));
  } catch {
    // ignore
  }
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(STEP_KEY);
  } catch {
    // ignore
  }
}
