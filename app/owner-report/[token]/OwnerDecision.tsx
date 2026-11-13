"use client";
import { useState } from "react";
import { NAVY, BORDER, MUTED, Next, Err } from "@/components/flow/FlowUI";

export default function OwnerDecision({ token, stage }: { token: string; stage: string }) {
  const [done, setDone] = useState<"approved" | "declined" | null>(stage === "owner_approved" || ["rent_requested", "rent_received", "screened", "move_in"].includes(stage) ? "approved" : stage === "owner_declined" ? "declined" : null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmDecline, setConfirmDecline] = useState(false);

  async function decide(decision: "approved" | "declined") {
    setBusy(true); setError("");
    const res = await fetch(`/api/owner-report/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision, note }) });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) setDone(decision); else setError(d.error ?? "That didn't save. Try again.");
  }

  if (done) {
    return (
      <div className="rounded-xl border-2 bg-white p-5" style={{ borderColor: NAVY }}>
        <p className="text-lg font-semibold" style={{ color: NAVY }}>{done === "approved" ? "Conditionally approved. Thank you." : "Declined. Thank you."}</p>
        <p className="text-sm mt-1" style={{ color: "#333" }}>{done === "approved" ? "We'll collect the first month's rent, run the SingleKey screening and send you the results before the lease." : "We'll let the applicant know and keep showing the home."}</p>
      </div>
    );
  }
  if (stage !== "sent_to_owner") return null;

  return (
    <div className="grid gap-3">
      <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything to add? (optional)"
        className="w-full px-4 py-3.5 border rounded-lg text-base bg-white min-h-[80px]" style={{ borderColor: BORDER, color: "#222" }} />
      <Next onClick={() => decide("approved")} disabled={busy}>{busy ? "Saving…" : "Conditionally approve"}</Next>
      {!confirmDecline
        ? <button type="button" onClick={() => setConfirmDecline(true)} className="text-sm underline py-2" style={{ color: MUTED }}>Decline this applicant</button>
        : <button type="button" disabled={busy} onClick={() => decide("declined")} className="w-full px-8 py-4 text-sm font-semibold rounded border" style={{ borderColor: BORDER, color: NAVY }}>Yes, decline</button>}
      {error && <Err>{error}</Err>}
    </div>
  );
}
