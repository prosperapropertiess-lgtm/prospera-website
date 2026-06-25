import { useCallback, useRef, useEffect } from "react";

export function useWizardAutoSave(
  propertyId: string | null,
  getPayload: () => Record<string, unknown>,
  onSaved?: (data: Record<string, unknown>) => void
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef(false);

  const save = useCallback(async () => {
    if (!propertyId || savingRef.current) return;
    savingRef.current = true;
    try {
      const payload = getPayload();
      const res = await fetch(`/api/admin/properties/${propertyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        onSaved?.(data);
      }
    } catch (err) {
      console.error("[auto-save] failed:", err);
    } finally {
      savingRef.current = false;
    }
  }, [propertyId, getPayload, onSaved]);

  const scheduleSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(save, 1500);
  }, [save]);

  // Save immediately (for step transitions, publish, etc.)
  const saveNow = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    await save();
  }, [save]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { scheduleSave, saveNow, isSaving: savingRef };
}
