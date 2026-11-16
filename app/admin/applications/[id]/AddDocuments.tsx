"use client";
import { useRef, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { DOC_LABELS, type DocType } from "@/lib/application-requirements";
import { prepareFile } from "@/components/apply/DocUploadSlot";

// Add documents the applicant sent later (email, text, in person), then re-run the AI
// so the summary covers them. Nothing is re-run until you tap the button.

const FONT = "var(--font-dm-sans, sans-serif)";
const TYPES: DocType[] = ["paystub", "bank_statement", "employment_letter", "id", "credit_report", "notice_of_assessment", "income_proof", "reference_letter", "singlekey_report", "other"];

export default function AddDocuments({ appId, onAdded, onRerun, rerunning, pending }: {
  appId: string; onAdded: () => Promise<void> | void; onRerun: () => void; rerunning: boolean; pending: number;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [type, setType] = useState<DocType | "">("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function upload(files: File[]) {
    if (!type) { setError("Pick what kind of document it is first."); return; }
    setError("");
    for (const [i, raw] of files.entries()) {
      setBusy(`Uploading ${i + 1} of ${files.length}…`);
      try {
        const file = await prepareFile(raw);
        const post = (body: object) => fetch(`/api/admin/applications/${appId}/documents`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
          .then(async (r) => { const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error ?? "Upload failed"); return j; });
        const { storage_path, token } = await post({ action: "upload_url", doc_type: type, content_type: file.type, size: file.size });
        const { error: upErr } = await getSupabase().storage.from("applications").uploadToSignedUrl(storage_path, token, file, { contentType: file.type });
        if (upErr) throw new Error("Upload failed. Check your connection and try again.");
        await post({ action: "attach", doc_type: type, storage_path, file_name: raw.name });
      } catch (err) {
        setError(`${raw.name}: ${err instanceof Error ? err.message : "Upload failed"}`);
        break;
      }
    }
    setBusy(null);
    await onAdded();
  }

  return (
    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #E2E8F0", fontFamily: FONT }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#1F2F3A", marginBottom: 8 }}>Add a document</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <select value={type} onChange={(e) => setType(e.target.value as DocType)} disabled={!!busy}
          style={{ flex: "1 1 200px", padding: "10px 12px", fontSize: 14, fontFamily: FONT, border: "1px solid #D8D2C8", borderRadius: 8, background: "#F7F5F2", color: "#222222" }}>
          <option value="">What is it?</option>
          {TYPES.map((t) => <option key={t} value={t}>{DOC_LABELS[t]}</option>)}
        </select>
        <button onClick={() => (type ? input.current?.click() : setError("Pick what kind of document it is first."))} disabled={!!busy}
          style={{ padding: "10px 18px", fontSize: 14, fontWeight: 600, fontFamily: FONT, border: "1px solid #1F2F3A", borderRadius: 8, background: "#FFFFFF", color: "#1F2F3A", cursor: busy ? "not-allowed" : "pointer" }}>
          {busy ?? "Choose files"}
        </button>
        <input ref={input} type="file" multiple accept="application/pdf,image/*" hidden
          onChange={(e) => { const f = Array.from(e.target.files ?? []); e.target.value = ""; if (f.length) upload(f); }} />
      </div>
      <p style={{ margin: "8px 0 0", fontSize: 13, color: "#666666" }}>PDF or photo, up to 25MB each. Pick several at once if they&apos;re the same kind.</p>
      {error && <p style={{ margin: "8px 0 0", fontSize: 13, color: "#991B1B" }}>{error}</p>}

      {pending > 0 && (
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "12px 14px", background: "#FEF3C7", borderRadius: 8 }}>
          <span style={{ fontSize: 14, color: "#92400E" }}>
            {pending} {pending === 1 ? "document was" : "documents were"} added since the AI last read this file.
          </span>
          <button onClick={onRerun} disabled={rerunning}
            style={{ padding: "9px 16px", fontSize: 14, fontWeight: 600, fontFamily: FONT, border: 0, borderRadius: 8, background: "#8B2030", color: "#FAF8F5", cursor: rerunning ? "not-allowed" : "pointer" }}>
            {rerunning ? "Reading everything again… (up to a minute)" : "Run AI again with these"}
          </button>
        </div>
      )}
    </div>
  );
}
