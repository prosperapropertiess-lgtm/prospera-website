"use client";
// Next steps after the AI report: owner → first month's rent → SingleKey → move-in.
import { useEffect, useState } from "react";
import Link from "next/link";

const NAVY = "#1F2F3A", BURGUNDY = "#8B2030", BORDER = "#E2E8F0", MUTED = "#64748B";

export interface PipelineApp {
  id: string; tenant_name: string; status: string; stage: string; monthly_rent: number; ai_summary: unknown;
  owner_name: string | null; owner_email: string | null; owner_sent_at: string | null; owner_decided_at: string | null; owner_note: string | null;
  rent_amount_due: number | null; rent_reference: string | null; rent_etransfer_to: string | null; rent_requested_at: string | null; rent_received_at: string | null;
  singlekey_done_at: string | null; move_in_started_at: string | null;
}

const ORDER = ["review", "sent_to_owner", "owner_approved", "rent_requested", "rent_received", "screened", "move_in"];
const day = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-CA", { month: "short", day: "numeric" }) : "");

function Step({ n, title, done, current, when, children }: { n: number; title: string; done: boolean; current: boolean; when?: string; children?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 14, padding: "14px 0", borderTop: n > 1 ? `1px solid ${BORDER}` : undefined, opacity: !done && !current ? 0.5 : 1 }}>
      <div style={{ width: 26, height: 26, borderRadius: 13, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, backgroundColor: done ? NAVY : current ? BURGUNDY : "#F1F5F9", color: done || current ? "#FFF" : MUTED }}>{done ? "✓" : n}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <b style={{ fontSize: 15, color: NAVY }}>{title}</b>
          {when && <span style={{ fontSize: 13, color: MUTED }}>{when}</span>}
        </div>
        {current && children && <div style={{ marginTop: 10, display: "grid", gap: 8 }}>{children}</div>}
      </div>
    </div>
  );
}

export default function Pipeline({ app, onChanged }: { app: PipelineApp; onChanged: () => void }) {
  const [info, setInfo] = useState<{ owner: { name: string | null; email: string | null }; ownerReportUrl: string; rentReference: string; etransferTo: string; rent: number; singlekeyUrl: string | null } | null>(null);
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [to, setTo] = useState("");
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/applications/${app.id}/pipeline`).then((r) => r.json()).then((d) => {
      setInfo(d);
      setOwnerName(d.owner?.name ?? ""); setOwnerEmail(d.owner?.email ?? "");
      setAmount(String(app.rent_amount_due ?? d.rent ?? "")); setTo(app.rent_etransfer_to ?? d.etransferTo ?? "");
    }).catch(() => {});
  }, [app.id, app.stage, app.rent_amount_due, app.rent_etransfer_to]);

  async function act(action: string, body: Record<string, unknown> = {}, ok = "Done.") {
    setBusy(action); setMsg(null);
    const res = await fetch(`/api/admin/applications/${app.id}/pipeline`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...body }) });
    const d = await res.json().catch(() => ({}));
    setBusy("");
    if (res.ok) { setMsg({ ok: true, text: d.via === "dashboard" ? "Released to the owner's dashboard. They were emailed to review it there." : ok }); onChanged(); } else setMsg({ ok: false, text: d.error ?? "That didn't work." });
  }
  async function upload(file: File) {
    setBusy("singlekey"); setMsg(null);
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch(`/api/admin/applications/${app.id}/pipeline`, { method: "POST", body: fd });
    const d = await res.json().catch(() => ({}));
    setBusy("");
    if (res.ok) { setMsg({ ok: true, text: "SingleKey report saved." }); onChanged(); } else setMsg({ ok: false, text: d.error ?? "Upload failed." });
  }

  const at = ORDER.indexOf(app.stage);
  const closed = app.stage === "declined" || app.stage === "owner_declined" || app.status === "rejected";
  const reportReady = !!app.ai_summary;
  const input = { width: "100%", padding: "10px 12px", border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 14, boxSizing: "border-box" as const };
  const btn = (primary = true) => ({ padding: "10px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", border: primary ? "none" : `1px solid ${BORDER}`, backgroundColor: primary ? NAVY : "#FFF", color: primary ? "#FFF" : NAVY });

  return (
    <div style={{ backgroundColor: "#FFF", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "18px 20px", marginBottom: 16 }}>
      <h3 style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>Next steps</h3>
      {closed && <p style={{ fontSize: 14, color: BURGUNDY, margin: "8px 0" }}>{app.stage === "owner_declined" ? `The owner declined${app.owner_note ? `: "${app.owner_note}"` : "."}` : "Declined."}</p>}
      {msg && <p style={{ fontSize: 14, margin: "8px 0", color: msg.ok ? "#065F46" : "#991B1B" }}>{msg.text}</p>}

      <Step n={1} title="Tenant report" done={at >= 1} current={at === 0 && !closed} when={reportReady ? "Ready" : "AI is still reading"}>
        <a href={`/admin/applications/${app.id}/pdf`} target="_blank" style={{ ...btn(false), textDecoration: "none", textAlign: "center" }}>Download tenant report (PDF)</a>
        <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>Send it to the owner. If they have a client dashboard it goes there; otherwise they get a private link with a Conditionally approve button.</p>
        <input style={input} placeholder="Owner name" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
        <input style={input} placeholder="Owner email" type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} />
        <button style={btn()} disabled={!!busy || !reportReady} onClick={() => act("send_to_owner", { name: ownerName, email: ownerEmail }, "Report emailed to the owner. You're cc'd.")}>{busy === "send_to_owner" ? "Sending…" : "Send report to owner"}</button>
        <button style={{ ...btn(false), border: "none", textDecoration: "underline" }} onClick={() => act("owner_approved", {}, "Marked as approved by the owner.")}>Owner already approved by phone</button>
      </Step>

      <Step n={2} title="Owner's conditional approval" done={at >= 2} current={at === 1 && !closed} when={app.owner_decided_at ? `Approved ${day(app.owner_decided_at)}` : app.owner_sent_at ? `Sent ${day(app.owner_sent_at)}` : ""}>
        <p style={{ fontSize: 14, margin: 0 }}>Waiting on {app.owner_name || "the owner"}. Their link:</p>
        {info && <button style={btn(false)} onClick={async () => { await navigator.clipboard.writeText(info.ownerReportUrl).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? "Copied" : "Copy owner link"}</button>}
        <div style={{ display: "flex", gap: 8 }}>
          <button style={btn()} disabled={!!busy} onClick={() => act("owner_approved", {}, "Marked as approved.")}>They approved</button>
          <button style={btn(false)} disabled={!!busy} onClick={() => act("owner_declined", {}, "Marked as declined.")}>They declined</button>
        </div>
      </Step>

      <Step n={3} title="Ask for the first month's rent" done={at >= 3} current={at === 2 && !closed} when={app.rent_requested_at ? `Asked ${day(app.rent_requested_at)}` : ""}>
        <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>Emails {app.tenant_name.split(" ")[0]} the good news with e-transfer details and reference {info?.rentReference}.</p>
        <input style={input} type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <input style={input} type="email" placeholder="E-transfer to" value={to} onChange={(e) => setTo(e.target.value)} />
        <button style={btn()} disabled={!!busy} onClick={() => act("request_rent", { amount: Number(amount), to }, "Payment request emailed.")}>{busy === "request_rent" ? "Sending…" : "Send payment request"}</button>
      </Step>

      <Step n={4} title="First month's rent received" done={at >= 4} current={at === 3 && !closed} when={app.rent_received_at ? `${day(app.rent_received_at)} · $${Number(app.rent_amount_due).toLocaleString()}` : app.rent_reference ? `Ref ${app.rent_reference}` : ""}>
        <p style={{ fontSize: 14, margin: 0 }}>Look for ${Number(app.rent_amount_due ?? 0).toLocaleString()} with reference <b>{app.rent_reference}</b>.</p>
        <button style={btn()} disabled={!!busy} onClick={() => act("rent_received", {}, "Marked received. They were emailed.")}>It arrived</button>
      </Step>

      <Step n={5} title="SingleKey screening" done={at >= 5} current={at === 4 && !closed} when={app.singlekey_done_at ? day(app.singlekey_done_at) : ""}>
        <a href="https://www.singlekey.com/en-ca/" target="_blank" rel="noreferrer" style={{ ...btn(false), textDecoration: "none", textAlign: "center" }}>Open SingleKey</a>
        <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>Run the report for {app.tenant_name}, then upload the PDF here.</p>
        <label style={{ ...btn(), textAlign: "center" }}>
          {busy === "singlekey" ? "Uploading…" : "Upload SingleKey report"}
          <input type="file" accept="application/pdf,image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
        </label>
      </Step>
      {info?.singlekeyUrl && <p style={{ fontSize: 13, margin: "0 0 0 40px" }}><a href={info.singlekeyUrl} target="_blank" rel="noreferrer" style={{ color: NAVY }}>View the SingleKey report</a></p>}

      <Step n={6} title="Start move-in" done={at >= 6} current={at === 5 && !closed} when={app.move_in_started_at ? day(app.move_in_started_at) : ""}>
        <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>Approves the application (they get the approval email) and moves the home to Lease pending in the move-in coordinator.</p>
        <button style={btn()} disabled={!!busy} onClick={() => act("start_move_in", {}, "Approved. The home is in the move-in coordinator.")}>{busy === "start_move_in" ? "Starting…" : "Approve and start move-in"}</button>
      </Step>
      {at >= 6 && <Link href="/admin/move-in-coordinator" style={{ display: "inline-block", marginTop: 8, color: NAVY, fontSize: 14 }}>Open the move-in coordinator →</Link>}

      {!closed && at < 6 && (
        <button style={{ marginTop: 12, background: "none", border: "none", color: MUTED, textDecoration: "underline", fontSize: 13, cursor: "pointer" }}
          onClick={() => { if (confirm(`Decline ${app.tenant_name}? They'll get the decline email.`)) act("decline", {}, "Declined. They were emailed."); }}>Decline this applicant</button>
      )}
    </div>
  );
}
