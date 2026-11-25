"use client";
import { useState } from "react";
import type { ReportComment } from "@/lib/move-in-report";

const BORDER = "#D8D2C8";
const MUTED = "#666666";
const BURGUNDY = "#8B2030";
const BG = "#F7F5F2";

const inputStyle: React.CSSProperties = { width: "100%", boxSizing: "border-box", fontSize: 16, padding: "12px 14px", borderRadius: 10, border: `1px solid ${BORDER}`, backgroundColor: BG, color: "#222222", fontFamily: "inherit" };

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-CA", { month: "long", day: "numeric" });
}

export default function TenantComments({ token, open, closesAt, targets, existing }: {
  token: string;
  open: boolean;
  closesAt: string | null;
  targets: { id: string; label: string }[];
  existing: ReportComment[];
}) {
  const [comments, setComments] = useState(existing);
  const [itemId, setItemId] = useState("");
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!body.trim()) { setError("Write what you noticed first."); return; }
    setSending(true);
    setError("");
    const fd = new FormData();
    fd.append("body", body.trim());
    fd.append("authorName", name.trim());
    if (itemId) fd.append("itemId", itemId);
    for (const f of files) fd.append("photos", f);
    const res = await fetch(`/api/inspection/${token}/comments`, { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    setSending(false);
    if (!res.ok) { setError(data.error || "Couldn't save your comment. Try again."); return; }
    setComments([...comments, data]);
    setBody("");
    setItemId("");
    setFiles([]);
  }

  return (
    <section style={{ backgroundColor: "#FFFFFF", border: `1px solid ${BORDER}`, borderLeft: `4px solid ${BURGUNDY}`, borderRadius: 14, padding: 22, marginBottom: 18 }}>
      <h2 style={{ fontSize: 19, fontWeight: 700, margin: "0 0 8px", fontFamily: "var(--font-cormorant)" }}>See something we missed?</h2>
      {open ? (
        <p style={{ fontSize: 15, color: MUTED, margin: "0 0 16px" }}>
          Add a note or photo by {closesAt ? fmt(closesAt) : "the deadline"}. It becomes part of this report, so it counts when you move out.
        </p>
      ) : (
        <p style={{ fontSize: 15, color: MUTED, margin: "0 0 8px" }}>The comment window closed{closesAt ? ` on ${fmt(closesAt)}` : ""}. Questions? Call or text (519) 697-1227.</p>
      )}

      {comments.map((c) => (
        <div key={c.id} style={{ borderTop: `1px solid ${BORDER}`, padding: "12px 0" }}>
          <p style={{ fontSize: 13, color: MUTED, margin: "0 0 4px" }}>{[c.room_name, c.item_label].filter(Boolean).join(" — ") || "General"} · {fmt(c.created_at)}</p>
          <p style={{ fontSize: 15, margin: 0, whiteSpace: "pre-wrap" }}>{c.body}</p>
          {c.photos.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              {c.photos.map((p) => (
                // eslint-disable-next-line @next/next/no-img-element
                <a key={p.path} href={p.url} target="_blank" rel="noopener noreferrer"><img src={p.url} alt="" style={{ width: 90, height: 68, objectFit: "cover", borderRadius: 6, border: `1px solid ${BORDER}` }} /></a>
              ))}
            </div>
          )}
        </div>
      ))}

      {open && (
        <div style={{ borderTop: comments.length ? `1px solid ${BORDER}` : "none", paddingTop: comments.length ? 16 : 0, display: "grid", gap: 12 }}>
          <select value={itemId} onChange={(e) => setItemId(e.target.value)} style={inputStyle}>
            <option value="">Which part of the home? (optional)</option>
            {targets.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="e.g. Small chip on the bathroom sink, left side" style={{ ...inputStyle, resize: "vertical" }} />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={inputStyle} />
          <label style={{ fontSize: 14, color: "#1F2F3A", fontWeight: 600, cursor: "pointer" }}>
            + Add photos{files.length ? ` (${files.length} selected)` : ""}
            <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, 5))} />
          </label>
          {error && <p style={{ fontSize: 14, color: BURGUNDY, margin: 0 }}>{error}</p>}
          <button onClick={submit} disabled={sending} style={{ backgroundColor: BURGUNDY, color: "#FAF8F5", border: "none", padding: "14px 20px", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            {sending ? "Saving…" : "Add to Report"}
          </button>
        </div>
      )}
    </section>
  );
}
