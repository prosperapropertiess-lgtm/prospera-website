"use client";
// The applicant's documents, plus a place for Ebin to add ones that came in
// later (by email or text) and have the AI read everything again.
import { useRef, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { DOC_LABELS, ALL_DOC_TYPES } from "@/lib/application-requirements";
import { prepareFile } from "@/components/apply/DocUploadSlot";

const NAVY = "#1F2F3A", BORDER = "#E2E8F0", MUTED = "#64748B";

export interface AppDocument { id: string; doc_type: string; storage_path: string; signed_url: string | null; created_at: string }
interface Queued { name: string; doc_type: string; path: string }

const TYPES = ALL_DOC_TYPES.filter((t) => t !== "singlekey_report");
const label = (t: string) => DOC_LABELS[t as keyof typeof DOC_LABELS] ?? t;
const byAdmin = (d: AppDocument) => d.storage_path.includes("/admin-");

export default function Documents({ appId, docs, onChanged, onRescreened }: { appId: string; docs: AppDocument[]; onChanged: () => void; onRescreened: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [type, setType] = useState("");
  const [queue, setQueue] = useState<Queued[]>([]);
  const [busy, setBusy] = useState<"" | "upload" | "save" | "ai">("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const api = (body: Record<string, unknown>) => fetch(`/api/admin/applications/${appId}/documents`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => ({ ok: r.ok, ...(await r.json().catch(() => ({}))) }));

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (input.current) input.current.value = "";
    if (!files.length || !type) return;
    setBusy("upload"); setMsg(null);
    for (const f of files) {
      try {
        const file = await prepareFile(f);
        const s = await api({ action: "sign", doc_type: type, content_type: file.type, size: file.size });
        if (!s.ok) throw new Error(s.error ?? "Upload failed");
        const { error } = await getSupabase().storage.from("applications").uploadToSignedUrl(s.storage_path, s.token, file, { contentType: file.type });
        if (error) throw new Error("Upload failed. Check your connection.");
        setQueue((q) => [...q, { name: f.name, doc_type: type, path: s.storage_path }]);
      } catch (err) {
        setMsg({ ok: false, text: `${f.name}: ${err instanceof Error ? err.message : "Upload failed"}` });
        break;
      }
    }
    setBusy("");
  }

  async function save(rescreen: boolean) {
    setBusy(rescreen ? "ai" : "save"); setMsg(null);
    const r = await api({ action: "attach", files: queue.map(({ doc_type, path }) => ({ doc_type, path })), rescreen });
    setBusy("");
    if (!r.ok) { setMsg({ ok: false, text: r.error ?? "Couldn't save." }); return; }
    setQueue([]);
    setMsg(rescreen
      ? r.rescreened ? { ok: true, text: "Added. The AI read everything again and the report is updated." } : { ok: false, text: `Added, but the AI couldn't finish: ${r.error}. Try Run AI again.` }
      : { ok: true, text: "Added. Run the AI again when you're ready." });
    if (rescreen) onRescreened(); else onChanged();
  }

  async function relabel(d: AppDocument, doc_type: string) { await api({ action: "relabel", doc_id: d.id, doc_type }); onChanged(); }
  async function remove(d: AppDocument) {
    if (!confirm(`Remove this ${label(d.doc_type).toLowerCase()}? The file is deleted.`)) return;
    await api({ action: "remove", doc_id: d.id }); onChanged();
  }

  const btn = (primary: boolean) => ({ padding: "9px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: busy ? "not-allowed" : "pointer", border: primary ? "none" : `1px solid ${BORDER}`, backgroundColor: primary ? NAVY : "#FFF", color: primary ? "#FFF" : NAVY, opacity: busy ? 0.6 : 1 });
  const select = { padding: "8px 10px", border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 14, backgroundColor: "#FFF", color: NAVY };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {!docs.length && <p style={{ margin: 0, fontSize: 13, color: "#94A3B8" }}>No documents uploaded.</p>}
      {docs.map((d) => (
        <div key={d.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 12px", backgroundColor: "#F8FAFC", borderRadius: 8, border: `1px solid ${BORDER}`, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <select aria-label="Document type" value={d.doc_type} onChange={(e) => relabel(d, e.target.value)} style={{ ...select, padding: "5px 8px", fontSize: 13, fontWeight: 600 }}>
              {[...new Set([d.doc_type, ...TYPES])].map((t) => <option key={t} value={t}>{label(t)}</option>)}
            </select>
            {byAdmin(d) && <span style={{ fontSize: 11, fontWeight: 700, color: "#5B21B6", backgroundColor: "#EDE9FE", borderRadius: 99, padding: "2px 8px" }}>Added by you</span>}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {d.signed_url ? <a href={d.signed_url} target="_blank" rel="noopener noreferrer" style={{ padding: "5px 14px", backgroundColor: NAVY, color: "#FFF", borderRadius: 6, fontSize: 12, textDecoration: "none", fontWeight: 500 }}>View</a>
              : <span style={{ fontSize: 12, color: "#94A3B8" }}>Link expired</span>}
            <button onClick={() => remove(d)} style={{ padding: "5px 10px", background: "none", border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 12, color: MUTED, cursor: "pointer" }}>Remove</button>
          </div>
        </div>
      ))}

      <div style={{ marginTop: 8, padding: 16, border: `1px dashed #CBD5E1`, borderRadius: 10, backgroundColor: "#FCFCFD", display: "grid", gap: 10 }}>
        <div>
          <b style={{ fontSize: 15, color: NAVY }}>Add documents</b>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: MUTED }}>Got something by email or text? Add it here, then have the AI read everything again.</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select aria-label="What is it?" value={type} onChange={(e) => setType(e.target.value)} style={select}>
            <option value="">What is it?</option>
            {TYPES.map((t) => <option key={t} value={t}>{label(t)}</option>)}
          </select>
          <button type="button" disabled={!type || !!busy} onClick={() => input.current?.click()} style={{ ...btn(false), opacity: !type || busy ? 0.5 : 1 }}>{busy === "upload" ? "Uploading…" : "Choose files"}</button>
          <input ref={input} type="file" accept="application/pdf,image/*" multiple onChange={pick} style={{ display: "none" }} />
        </div>
        {queue.length > 0 && (
          <>
            <div style={{ display: "grid", gap: 4 }}>
              {queue.map((q) => (
                <div key={q.path} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 13, color: NAVY }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>✓ {label(q.doc_type)}: {q.name}</span>
                  <button onClick={() => setQueue((x) => x.filter((y) => y.path !== q.path))} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: 12, textDecoration: "underline" }}>Undo</button>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button disabled={!!busy} onClick={() => save(true)} style={btn(true)}>{busy === "ai" ? "AI is reading… (about a minute)" : `Add ${queue.length} and run AI again`}</button>
              <button disabled={!!busy} onClick={() => save(false)} style={btn(false)}>{busy === "save" ? "Adding…" : "Just add"}</button>
            </div>
          </>
        )}
        {msg && <p style={{ margin: 0, fontSize: 13, color: msg.ok ? "#065F46" : "#991B1B" }}>{msg.text}</p>}
      </div>
    </div>
  );
}
