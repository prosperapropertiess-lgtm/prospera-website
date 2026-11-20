"use client";
import { useState } from "react";
import { Shell, heading, NAVY, MUTED, BORDER, Next, Err } from "@/components/flow/FlowUI";
import DocUploadSlot, { type UploadedFile } from "@/components/apply/DocUploadSlot";
import { DOC_LABELS, type DocType } from "@/lib/application-requirements";

const HINTS: Partial<Record<DocType, string>> = {
  id: "Driver's licence, passport, or Ontario photo card. A clear phone photo is fine.",
  paystub: "From your payroll app or employer portal. One combined PDF is fine.",
  employment_letter: "A letter or email from your employer with your role, start date and pay.",
  bank_statement: "In most bank apps: Accounts, then Statements or Documents. One PDF per month is fine.",
  credit_report: "Free in about 5 minutes from Borrowell or Credit Karma. Download the full report as a PDF.",
  notice_of_assessment: "Your most recent one from the CRA (in My Account).",
  income_proof: "Any letter or statement that shows the amount you get each month.",
};

export default function MoreInfoForm({ token, first, address, docTypes, questions, note }: {
  token: string; first: string; address: string; docTypes: string[]; questions: string[]; note: string | null;
}) {
  const [files, setFiles] = useState<Record<string, UploadedFile[]>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    const missingDoc = docTypes.find((t) => !files[t]?.length);
    if (missingDoc) return setError(`Please add your ${DOC_LABELS[missingDoc as DocType].toLowerCase()}.`);
    if (questions.some((q) => !answers[q]?.trim())) return setError("Please answer every question.");
    setError(""); setBusy(true);
    const res = await fetch(`/api/apply/more/${token}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "submit", files: Object.entries(files).flatMap(([doc_type, fs]) => fs.map((f) => ({ doc_type, path: f.path }))), answers, comment }),
    });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) { setDone(true); window.scrollTo({ top: 0 }); } else setError(d.error ?? "Couldn't send. Try again.");
  }

  if (done) {
    return (
      <Shell>
        <div className="view-step">
          <h1 className="text-3xl font-bold mb-3" style={heading}>Got it. Thank you, {first}.</h1>
          <p className="text-base mb-2" style={{ color: "#333" }}>We have everything you sent for {address}. We&apos;ll review it and be in touch soon.</p>
          <p className="text-sm" style={{ color: MUTED }}>Questions? Call or text (519) 697-1227.</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="view-step">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: MUTED }}>Your application · {address}</p>
        <h1 className="text-3xl font-bold mb-3" style={heading}>Hi {first}, we need a little more</h1>
        <p className="text-base mb-6" style={{ color: "#333" }}>Send these and we can finish reviewing your application.</p>
        {note && <div className="rounded-xl border p-4 mb-8 text-base whitespace-pre-line bg-white" style={{ borderColor: BORDER, color: "#222" }}>{note}</div>}

        {docTypes.map((t) => (
          <DocUploadSlot key={t} signUrl={`/api/apply/more/${token}`}
            slot={{ type: t as DocType, label: DOC_LABELS[t as DocType], hint: HINTS[t as DocType] ?? "A PDF or a clear phone photo.", min: 1, max: 6 }}
            files={files[t] ?? []} onChange={(fs) => setFiles((x) => ({ ...x, [t]: fs }))} />
        ))}

        {questions.map((q, i) => (
          <div key={q} className="mb-6">
            <label htmlFor={`q${i}`} className="block text-lg font-semibold mb-2" style={{ color: NAVY }}>{q}</label>
            <textarea id={`q${i}`} rows={3} value={answers[q] ?? ""} onChange={(e) => setAnswers((x) => ({ ...x, [q]: e.target.value }))}
              className="w-full px-4 py-3.5 border rounded-lg text-base bg-white" style={{ borderColor: BORDER, color: "#222" }} />
          </div>
        ))}

        <div className="mb-8">
          <label htmlFor="comment" className="block text-sm font-semibold mb-2" style={{ color: NAVY }}>Anything else we should know? (optional)</label>
          <textarea id="comment" rows={2} value={comment} onChange={(e) => setComment(e.target.value)}
            className="w-full px-4 py-3.5 border rounded-lg text-base bg-white" style={{ borderColor: BORDER, color: "#222" }} />
        </div>

        <Next onClick={submit} disabled={busy}>{busy ? "Sending…" : "Send"}</Next>
        {error && <Err>{error}</Err>}
      </div>
    </Shell>
  );
}
