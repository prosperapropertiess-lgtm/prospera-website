"use client";
// Ask the applicant for more: pick documents, write questions, and they get a private link to send them.
// When they do, the AI reads everything again and Ebin gets an email.
import { useCallback, useEffect, useState } from "react";
import { DOC_LABELS, type DocType } from "@/lib/application-requirements";

const NAVY = "#1F2F3A", BORDER = "#E2E8F0", MUTED = "#64748B";
const REQUESTABLE: DocType[] = ["id", "paystub", "employment_letter", "bank_statement", "credit_report", "notice_of_assessment", "income_proof"];

interface Req { id: string; doc_types: string[]; questions: string[]; note: string | null; answers: Record<string, string> | null; sent_at: string; opened_at: string | null; completed_at: string | null; cancelled_at: string | null; url: string }
const day = (d: string) => new Date(d).toLocaleDateString("en-CA", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export default function RequestInfo({ appId, firstName, suggestions, closed, onCompleted }: { appId: string; firstName: string; suggestions: string[]; closed: boolean; onCompleted: () => void }) {
  const [reqs, setReqs] = useState<Req[] | null>(null);
  const [open, setOpen] = useState(false);
  const [docs, setDocs] = useState<string[]>([]);
  const [questions, setQuestions] = useState<string[]>([""]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [copied, setCopied] = useState("");

  const load = useCallback(() => fetch(`/api/admin/applications/${appId}/request-info`).then((r) => r.json()).then((d) => setReqs(Array.isArray(d) ? d : [])).catch(() => setReqs([])), [appId]);
  useEffect(() => { load(); }, [load]);
  // While a request is out, check back so the answers show up without a refresh.
  const waiting = reqs?.some((r) => !r.completed_at && !r.cancelled_at);
  useEffect(() => {
    if (!waiting) return;
    const t = setInterval(() => { load(); }, 60000);
    return () => clearInterval(t);
  }, [waiting, load]);
  const prevDone = reqs?.filter((r) => r.completed_at).length;
  useEffect(() => { if (prevDone) onCompleted(); }, [prevDone]); // eslint-disable-line react-hooks/exhaustive-deps

  async function send() {
    setBusy(true); setMsg(null);
    const res = await fetch(`/api/admin/applications/${appId}/request-info`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ doc_types: docs, questions, note }) });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setMsg({ ok: false, text: d.error ?? "Couldn't send." }); return; }
    setMsg({ ok: true, text: `Sent. ${firstName} got an email with a private link. You'll get an email when they send it in.` });
    setOpen(false); setDocs([]); setQuestions([""]); setNote(""); load();
  }
  async function cancel(r: Req) {
    if (!confirm("Cancel this request? Their link will stop working.")) return;
    await fetch(`/api/admin/applications/${appId}/request-info`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "cancel", request_id: r.id }) });
    load();
  }

  const btn = (primary: boolean) => ({ padding: "9px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", border: primary ? "none" : `1px solid ${BORDER}`, backgroundColor: primary ? NAVY : "#FFF", color: primary ? "#FFF" : NAVY });
  const input = { width: "100%", padding: "9px 12px", border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 14, boxSizing: "border-box" as const, fontFamily: "inherit" };
  const unused = suggestions.filter((s) => !questions.includes(s));

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {reqs?.map((r) => {
        const state = r.cancelled_at ? ["Cancelled", MUTED] : r.completed_at ? ["Sent in", "#065F46"] : r.opened_at ? ["Opened, not sent yet", "#92400E"] : ["Waiting", "#92400E"];
        return (
          <div key={r.id} style={{ padding: "12px 14px", border: `1px solid ${BORDER}`, borderRadius: 10, backgroundColor: "#F8FAFC", opacity: r.cancelled_at ? 0.6 : 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: MUTED }}>Asked {day(r.sent_at)}{r.completed_at ? ` · sent in ${day(r.completed_at)}` : ""}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: state[1] }}>{state[0]}</span>
            </div>
            {r.doc_types.length > 0 && <div style={{ fontSize: 14, color: NAVY, marginTop: 6 }}><b>Documents:</b> {r.doc_types.map((t) => DOC_LABELS[t as DocType] ?? t).join(", ")}{r.completed_at ? " (in the Documents list below)" : ""}</div>}
            {r.questions.map((q) => (
              <div key={q} style={{ fontSize: 14, marginTop: 6 }}>
                <div style={{ color: MUTED }}>{q}</div>
                {r.answers?.[q] && <div style={{ color: NAVY, fontWeight: 500, whiteSpace: "pre-line" }}>{r.answers[q]}</div>}
              </div>
            ))}
            {r.answers?.["Anything else"] && <div style={{ fontSize: 14, marginTop: 6 }}><div style={{ color: MUTED }}>Anything else</div><div style={{ color: NAVY, whiteSpace: "pre-line" }}>{r.answers["Anything else"]}</div></div>}
            {!r.completed_at && !r.cancelled_at && (
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button style={{ ...btn(false), padding: "6px 12px", fontSize: 13 }} onClick={async () => { await navigator.clipboard.writeText(r.url).catch(() => {}); setCopied(r.id); setTimeout(() => setCopied(""), 2000); }}>{copied === r.id ? "Copied" : "Copy their link"}</button>
                <button style={{ background: "none", border: "none", color: MUTED, fontSize: 13, textDecoration: "underline", cursor: "pointer" }} onClick={() => cancel(r)}>Cancel request</button>
              </div>
            )}
          </div>
        );
      })}

      {msg && <p style={{ margin: 0, fontSize: 13, color: msg.ok ? "#065F46" : "#991B1B" }}>{msg.text}</p>}

      {closed ? (
        <p style={{ margin: 0, fontSize: 13, color: MUTED }}>This application is closed.</p>
      ) : !open ? (
        <div><button style={btn(true)} onClick={() => { setOpen(true); setMsg(null); }}>Ask {firstName} for more</button></div>
      ) : (
        <div style={{ padding: 16, border: `1px dashed #CBD5E1`, borderRadius: 10, display: "grid", gap: 14 }}>
          <div>
            <b style={{ fontSize: 14, color: NAVY }}>Documents to send</b>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              {REQUESTABLE.map((t) => {
                const on = docs.includes(t);
                return <button key={t} type="button" onClick={() => setDocs((d) => on ? d.filter((x) => x !== t) : [...d, t])} style={{ padding: "7px 12px", borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: "pointer", border: `1px solid ${on ? NAVY : BORDER}`, backgroundColor: on ? NAVY : "#FFF", color: on ? "#FFF" : NAVY }}>{on ? "✓ " : ""}{DOC_LABELS[t]}</button>;
              })}
            </div>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            <b style={{ fontSize: 14, color: NAVY }}>Questions</b>
            {questions.map((q, i) => (
              <div key={i} style={{ display: "flex", gap: 6 }}>
                <input style={input} value={q} placeholder="e.g. Who else will be living there?" onChange={(e) => setQuestions((x) => x.map((y, j) => j === i ? e.target.value : y))} />
                {questions.length > 1 && <button type="button" aria-label="Remove question" onClick={() => setQuestions((x) => x.filter((_, j) => j !== i))} style={{ ...btn(false), padding: "6px 10px" }}>×</button>}
              </div>
            ))}
            <div><button type="button" onClick={() => setQuestions((x) => [...x, ""])} style={{ background: "none", border: "none", color: NAVY, fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0 }}>+ Add a question</button></div>
            {unused.length > 0 && (
              <div style={{ fontSize: 13, color: MUTED }}>
                From the AI report:
                <div style={{ display: "grid", gap: 4, marginTop: 4 }}>
                  {unused.map((s) => <button key={s} type="button" onClick={() => setQuestions((x) => [...x.filter((y) => y.trim()), s])} style={{ textAlign: "left", background: "#F8FAFC", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 10px", fontSize: 13, color: NAVY, cursor: "pointer" }}>+ {s}</button>)}
                </div>
              </div>
            )}
          </div>
          <div>
            <b style={{ fontSize: 14, color: NAVY }}>Note (optional)</b>
            <textarea style={{ ...input, marginTop: 6 }} rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Shows at the top of their email and page." />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ ...btn(true), opacity: busy ? 0.6 : 1 }} disabled={busy || (!docs.length && !questions.some((q) => q.trim()))} onClick={send}>{busy ? "Sending…" : "Email the request"}</button>
            <button style={btn(false)} onClick={() => setOpen(false)}>Cancel</button>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: MUTED }}>Sending a new request replaces any open one. When they send it in, the AI reads everything again.</p>
        </div>
      )}
    </div>
  );
}
