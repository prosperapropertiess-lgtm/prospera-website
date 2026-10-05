"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType } from "react";
import { AnimatePresence } from "framer-motion";
import { Landing } from "@/components/rent/Landing";
import { CompletionScreen } from "@/components/rent/CompletionScreen";
import { MoveTimingStep } from "@/components/rent/steps/MoveTimingStep";
import { HouseholdTypeStep } from "@/components/rent/steps/HouseholdTypeStep";
import { HouseholdSizeStep } from "@/components/rent/steps/HouseholdSizeStep";
import { LocationStep } from "@/components/rent/steps/LocationStep";
import { PropertyTypeStep } from "@/components/rent/steps/PropertyTypeStep";
import { BedroomsStep } from "@/components/rent/steps/BedroomsStep";
import { BathroomsStep } from "@/components/rent/steps/BathroomsStep";
import { BudgetStep } from "@/components/rent/steps/BudgetStep";
import { ParkingStep } from "@/components/rent/steps/ParkingStep";
import { PetsStep } from "@/components/rent/steps/PetsStep";
import { MustHavesStep } from "@/components/rent/steps/MustHavesStep";
import { DealBreakersStep } from "@/components/rent/steps/DealBreakersStep";
import { ProximityStep } from "@/components/rent/steps/ProximityStep";
import { CurrentSituationStep } from "@/components/rent/steps/CurrentSituationStep";
import { SearchIntensityStep } from "@/components/rent/steps/SearchIntensityStep";
import { ContactStep } from "@/components/rent/steps/ContactStep";
import { NotesStep } from "@/components/rent/steps/NotesStep";
import type { StepProps } from "@/components/rent/steps/types";
import type { RentalProfileDraft } from "@/lib/rent/types";
import { loadDraft, saveDraft, loadStepIndex, saveStepIndex, clearDraft, getSessionId } from "@/lib/rent/storage";
import { trackRentEvent } from "@/lib/rent/analytics";

const STEPS: ComponentType<StepProps>[] = [
  MoveTimingStep,
  HouseholdTypeStep,
  HouseholdSizeStep,
  LocationStep,
  PropertyTypeStep,
  BedroomsStep,
  BathroomsStep,
  BudgetStep,
  ParkingStep,
  PetsStep,
  MustHavesStep,
  DealBreakersStep,
  ProximityStep,
  CurrentSituationStep,
  SearchIntensityStep,
  ContactStep,
];
const STEP_NAMES = [
  "move_timing", "household_type", "household_size", "location", "property_type",
  "bedrooms", "bathrooms", "budget", "parking", "pets", "must_haves",
  "deal_breakers", "proximity", "current_situation", "search_intensity", "contact",
];
// NotesStep renders separately below — it needs submitting/submitError,
// which the shared StepProps contract above doesn't carry.
const TOTAL_UNITS = STEPS.length + 1; // +1 for the notes/submit step

type Phase = "landing" | "step" | "completion";

export function RentFlow() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<RentalProfileDraft>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [sessionId, setSessionId] = useState("");

  // Resume a saved-in-progress profile after mount (localStorage isn't
  // available during SSR, so the very first render always matches the
  // server's — landing screen — to avoid a hydration mismatch).
  useEffect(() => {
    const savedDraft = loadDraft();
    const savedStep = loadStepIndex();
    setSessionId(getSessionId());
    if (Object.keys(savedDraft).length > 0) {
      setDraft(savedDraft);
      setStepIndex(Math.min(savedStep, STEPS.length));
      setPhase("step");
    }

    const params = new URLSearchParams(window.location.search);
    const utm: Partial<RentalProfileDraft> & Record<string, string> = {};
    if (params.get("utm_source")) utm.utm_source = params.get("utm_source")!;
    if (params.get("utm_medium")) utm.utm_medium = params.get("utm_medium")!;
    if (params.get("utm_campaign")) utm.utm_campaign = params.get("utm_campaign")!;
    if (Object.keys(utm).length > 0) setDraft((d) => ({ ...d, ...utm }));

    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (patch: Partial<RentalProfileDraft>) => {
    setDraft((d) => {
      const next = { ...d, ...patch };
      saveDraft(next);
      return next;
    });
  };

  const pct = useMemo(() => Math.min(100, ((stepIndex + 1) / TOTAL_UNITS) * 100), [stepIndex]);

  // Kept in sync so the pagehide listener below (added once, on mount)
  // always sees the latest answers rather than a stale mount-time closure.
  const draftRef = useRef(draft);
  const sessionIdRef = useRef(sessionId);
  useEffect(() => { draftRef.current = draft; }, [draft]);
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

  // The real point of this table (per Ebin): every enquiry gets kept, not
  // just the one that converts. This fires on every step advance (so
  // progress is captured incrementally, not just at the very end) — silent,
  // fire-and-forget, never blocks the UI waiting on a response.
  function saveProgress(stepName: string) {
    if (!sessionId) return;
    fetch("/api/rent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...draft, sessionId, lastStep: stepName, completed: false }),
      keepalive: true,
    }).catch(() => {
      // Best-effort — losing one progress ping isn't worth surfacing to
      // the visitor, the next step advance will try again.
    });
  }

  // Safety net for someone who answers a question but closes the tab
  // before ever tapping to the next step — sendBeacon survives page
  // teardown in a way a normal fetch() doesn't.
  useEffect(() => {
    function onHide() {
      const d = draftRef.current;
      const sid = sessionIdRef.current;
      if (!sid || Object.keys(d).length === 0) return;
      try {
        const blob = new Blob([JSON.stringify({ ...d, sessionId: sid, completed: false })], { type: "application/json" });
        navigator.sendBeacon("/api/rent", blob);
      } catch {
        // ignore
      }
    }
    document.addEventListener("pagehide", onHide);
    return () => document.removeEventListener("pagehide", onHide);
  }, []);

  function begin() {
    setPhase("step");
    setStepIndex(0);
    saveStepIndex(0);
    trackRentEvent("rent_flow_started");
  }

  function goNext() {
    trackRentEvent("rent_step_completed", { step: stepIndex });
    saveProgress(STEP_NAMES[stepIndex] ?? String(stepIndex));
    const next = stepIndex + 1;
    setStepIndex(next);
    saveStepIndex(next);
  }

  function goBack() {
    if (stepIndex === 0) {
      setPhase("landing");
      return;
    }
    const prev = stepIndex - 1;
    setStepIndex(prev);
    saveStepIndex(prev);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/rent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, sessionId, lastStep: "notes", completed: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data?.error || "Something went wrong submitting your profile.");
        setSubmitting(false);
        return;
      }
      trackRentEvent("rent_profile_completed");
      clearDraft();
      setPhase("completion");
    } catch {
      setSubmitError("Something went wrong submitting your profile.");
    } finally {
      setSubmitting(false);
    }
  }

  function updatePreferences() {
    setPhase("step");
    setStepIndex(0);
    saveStepIndex(0);
  }

  if (!hydrated) return null;

  if (phase === "landing") {
    return <Landing onBegin={begin} />;
  }

  if (phase === "completion") {
    return <CompletionScreen onUpdatePreferences={updatePreferences} />;
  }

  return (
    <AnimatePresence mode="wait">
      {stepIndex < STEPS.length ? (
        (() => {
          const Step = STEPS[stepIndex];
          return <Step key={stepIndex} draft={draft} update={update} onNext={goNext} onBack={goBack} pct={pct} />;
        })()
      ) : (
        <NotesStep
          key="notes"
          draft={draft}
          update={update}
          onNext={handleSubmit}
          onBack={goBack}
          pct={pct}
          submitting={submitting}
          submitError={submitError}
        />
      )}
    </AnimatePresence>
  );
}
