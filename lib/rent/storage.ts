import type { RentalProfileDraft } from "./types";

const KEY = "prospera-rent-draft";
const STEP_KEY = "prospera-rent-step";
const SESSION_KEY = "prospera-rent-session";

// One anonymous session id per visitor, generated once and reused for the
// life of their draft — lets the backend upsert the same row as they move
// through the flow instead of creating a new one per step, and ties a
// completed submission back to whatever partial progress preceded it.
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

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
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}
