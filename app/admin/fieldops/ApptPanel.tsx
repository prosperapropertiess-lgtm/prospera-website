"use client";

import { useEffect, useState } from "react";
import { Badge, Button, ErrorNote, SuccessNote, Loading, C } from "@/components/admin/kit";
import SlotPicker from "@/components/fieldops/SlotPicker";
import { api, act, fTime, fDayLong, cash, STATUS, Panel, Row, Label, input } from "./shared";

interface Detail {
  appt: {
    id: string; property_id: string; agent_id: string | null; starts_at: string; ends_at: string; status: string; tenant_name: string; tenant_phone: string | null; tenant_email: string | null;
    assignment_reason: string | null; created_by: string; cancel_reason: string | null; lease_signed_at: string | null; acknowledged_at: string | null; viewing_request_id: string | null;
    properties: { address: string; city: string; price: number }; agents: { id: string; name: string; email: string; phone: string | null } | null;
  };
  events: { id: string; kind: string; actor: string; detail: Record<string, unknown>; created_at: string }[];
  messages: { id: string; template: string; recipient: string; status: string; error: string | null; created_at: string }[];
  checklist: { steps: Record<string, string>; outcome: string | null; interest: string | null; concerns: string[]; secured: boolean | null; issue: string | null; notes: string | null; completed_at: string | null } | null;
  earnings: { id: string; kind: string; amount: number; status: string }[];
  replacements: { agentId: string; name: string; score: number; reason: string }[];
  manage: string;
}

const EVENT: Record<string, string> = {
  booked: "Booked", reassigned: "Reassigned", rescheduled: "Moved", cancelled: "Cancelled", acknowledged: "Specialist tapped Got it",
  unavailable: "Specialist can't make it", completed: "Report sent", lease_signed: "Lease signed", status: "Status changed",
  "step:reviewed": "Reviewed instructions", "step:arrived": "Arrived", "step:prepared": "Home ready", "step:shown": "Showed the home", "step:secured": "Locked up",
};

export default function ApptPanel({ id, onClose, onChanged }: { id: string; onClose: () => void; onChanged: () => void }) {
  const [d, setD] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [mode, setMode] = useState<null | "move" | "reassign" | "cancel" | "lease" | "status">(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [pick, setPick] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [status, setStatus] = useState("completed");
  const [busy, setBusy] = useState(false);

  const load = () => api<Detail>("appointment", `&id=${id}`).then(setD).catch((e) => setError(e.message));
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function run(body: Record<string, unknown>, ok: string) {
    setBusy(true); setError(null); setNotice(null);
    const r = await act({ id, ...body });
    setBusy(false);
    if (!r.ok) { setError(String(r.data.error ?? "That didn't work.")); return; }
    setNotice(ok); setMode(null); setPick(null); setText("");
    await load(); onChanged();
  }

  async function openMove() {
    setMode("move");
    const s = await api<{ slots: string[] }>("slots", `&property=${d!.appt.property_id}`).catch(() => ({ slots: [] }));
    setSlots(s.slots);
  }

  if (!d) return <Panel title="Showing" onClose={onClose}>{error ? <ErrorNote>{error}</ErrorNote> : <Loading />}</Panel>;
  const a = d.appt;
  const live = ["confirmed", "in_progress", "reassignment_pending"].includes(a.status);
  const cl = d.checklist;

  return (
    <Panel title={`${fTime(a.starts_at)} · ${a.properties.address}`} onClose={onClose}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <Badge tone={STATUS[a.status]?.tone}>{STATUS[a.status]?.label}</Badge>
        {a.created_by === "admin" && <Badge>Booked by you</Badge>}
        {a.lease_signed_at && <Badge tone="green">Lease signed</Badge>}
        {live && a.agent_id && !a.acknowledged_at && <Badge tone="amber">Not acknowledged</Badge>}
      </div>
      {error && <ErrorNote>{error}</ErrorNote>}
      {notice && <div style={{ marginBottom: 12 }}><SuccessNote>{notice}</SuccessNote></div>}

      <Row k="When" v={`${fDayLong(a.starts_at)}, ${fTime(a.starts_at)} – ${fTime(a.ends_at)}`} />
      <Row k="Home" v={`${a.properties.address}, ${a.properties.city}`} />
      <Row k="Tenant" v={<>{a.tenant_name}{a.tenant_phone && <> · <a href={`tel:${a.tenant_phone}`} style={{ color: C.navy }}>{a.tenant_phone}</a></>}{a.tenant_email && <> · {a.tenant_email}</>}</>} />
      <Row k="Specialist" v={a.agents ? `${a.agents.name}${a.agents.phone ? ` · ${a.agents.phone}` : ""}` : <span style={{ color: C.red }}>None</span>} />
      {a.assignment_reason && <Row k="Why them" v={a.assignment_reason} />}
      {a.cancel_reason && <Row k="Cancel reason" v={a.cancel_reason} />}

      {live && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "18px 0 6px" }}>
          <Button size="sm" variant="primary" onClick={() => run({ action: "send_application", appointment: id }, "Thank-you and application link emailed.")} disabled={busy || !a.tenant_email}>Send application</Button>
          <Button size="sm" onClick={openMove}>Move time</Button>
          <Button size="sm" onClick={() => setMode("reassign")}>Change specialist</Button>
          <Button size="sm" onClick={() => run({ action: "resend" }, "Confirmation re-sent.")} disabled={busy || !a.tenant_email}>Re-send confirmation</Button>
          <Button size="sm" variant="danger" onClick={() => setMode("cancel")}>Cancel</Button>
        </div>
      )}
      {!live && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "18px 0 6px" }}>
          {!a.lease_signed_at && ["completed", "followed_up"].includes(a.status) && <Button size="sm" variant="primary" onClick={() => setMode("lease")}>They signed the lease</Button>}
          <Button size="sm" variant="primary" onClick={() => run({ action: "send_application", appointment: id }, "Thank-you and application link emailed.")} disabled={busy || !a.tenant_email}>Send application</Button>
          <Button size="sm" variant="ghost" onClick={() => setMode("status")}>Fix status</Button>
        </div>
      )}

      {mode === "move" && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginTop: 12 }}>
          <Label>Pick a new time (only times someone can actually take)</Label>
          {slots.length ? <SlotPicker slots={slots} value={pick} onChange={setPick} compact /> : <div style={{ color: C.muted, fontSize: 14 }}>No open times. Add availability or turn on booking for this home.</div>}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <Button variant="primary" size="sm" disabled={!pick || busy} onClick={() => run({ action: "reschedule", start: pick }, "Moved. The tenant and specialist were emailed.")}>Move it</Button>
            <Button size="sm" variant="ghost" onClick={() => setMode(null)}>Never mind</Button>
          </div>
        </div>
      )}

      {mode === "reassign" && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginTop: 12 }}>
          <Label>Who can take it at this time</Label>
          {d.replacements.length === 0 && <div style={{ color: C.muted, fontSize: 14, marginBottom: 8 }}>Nobody else is free then. Move the time instead, or ask someone to add availability.</div>}
          {d.replacements.map((r) => (
            <div key={r.agentId} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontWeight: 600, color: C.navy, minWidth: 120 }}>{r.name}</span>
              <span style={{ fontSize: 13, color: C.muted, flex: 1 }}>{r.reason}</span>
              <Button size="sm" disabled={busy} onClick={() => run({ action: "reassign", agent: r.agentId }, `Given to ${r.name}. Both specialists were emailed.`)}>Give to {r.name.split(" ")[0]}</Button>
            </div>
          ))}
          <div style={{ marginTop: 10 }}><Button size="sm" variant="ghost" onClick={() => setMode(null)}>Never mind</Button></div>
        </div>
      )}

      {mode === "cancel" && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginTop: 12 }}>
          <Label>Reason (the tenant gets a cancellation email with a link to pick a new time)</Label>
          <input value={text} onChange={(e) => setText(e.target.value)} style={input} placeholder="e.g. Home no longer available" />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <Button variant="danger" size="sm" disabled={!text.trim() || busy} onClick={() => run({ action: "cancel", reason: text }, "Cancelled. Tenant and specialist were emailed.")}>Cancel showing</Button>
            <Button size="sm" variant="ghost" onClick={() => setMode(null)}>Keep it</Button>
          </div>
        </div>
      )}

      {mode === "lease" && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginTop: 12 }}>
          <Label>Monthly rent on the signed lease</Label>
          <input value={text} onChange={(e) => setText(e.target.value.replace(/[^\d.]/g, ""))} style={input} placeholder={String(a.properties.price)} inputMode="decimal" />
          <div style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>If leasing bonuses are on in Settings, this creates a pending bonus for {a.agents?.name ?? "the specialist"}. It stays pending until you approve it.</div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <Button variant="primary" size="sm" disabled={busy} onClick={() => run({ action: "lease_signed", rent: Number(text || a.properties.price) }, "Marked as leased.")}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setMode(null)}>Never mind</Button>
          </div>
        </div>
      )}

      {mode === "status" && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginTop: 12 }}>
          <Label>Set status (with a reason, for the record)</Label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={input}>
            <option value="completed">Done</option><option value="no_show">No-show</option><option value="failed">Didn&apos;t happen</option><option value="confirmed">Back to booked</option>
          </select>
          <input value={text} onChange={(e) => setText(e.target.value)} style={{ ...input, marginTop: 8 }} placeholder="Reason" />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <Button variant="primary" size="sm" disabled={!text.trim() || busy} onClick={() => run({ action: "set_status", status, reason: text }, "Status updated.")}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setMode(null)}>Never mind</Button>
          </div>
        </div>
      )}

      {cl && (
        <div style={{ marginTop: 22 }}>
          <div style={{ fontWeight: 700, color: C.navy, marginBottom: 6 }}>Specialist report</div>
          {cl.outcome && <Row k="Outcome" v={{ showed: "Showed it", no_show: "Tenant didn't come", tenant_cancelled_on_site: "Tenant left early", could_not_access: "Couldn't get in" }[cl.outcome]} />}
          {cl.interest && <Row k="Interest" v={{ high: "Very", medium: "Somewhat", low: "A little", none: "Not interested" }[cl.interest]} />}
          {cl.concerns?.length > 0 && <Row k="Concerns" v={cl.concerns.join(", ")} />}
          {cl.secured != null && <Row k="Locked up" v={cl.secured ? "Yes" : <span style={{ color: C.red }}>Not confirmed</span>} />}
          {cl.issue && <Row k="Issue" v={<span style={{ color: C.red }}>{cl.issue}</span>} />}
          {cl.notes && <Row k="Notes" v={cl.notes} />}
          <Row k="Steps" v={Object.entries(cl.steps ?? {}).map(([k, v]) => `${EVENT[`step:${k}`] ?? k} ${fTime(v)}`).join(" · ") || "—"} />
        </div>
      )}

      {d.earnings.length > 0 && (
        <div style={{ marginTop: 22 }}>
          <div style={{ fontWeight: 700, color: C.navy, marginBottom: 6 }}>Pay</div>
          {d.earnings.map((e) => <Row key={e.id} k={e.kind === "lease_bonus" ? "Leasing bonus" : e.kind === "showing" ? "Showing fee" : "Adjustment"} v={`${cash(e.amount)} · ${e.status}`} />)}
        </div>
      )}

      <div style={{ marginTop: 22 }}>
        <div style={{ fontWeight: 700, color: C.navy, marginBottom: 6 }}>History</div>
        {d.events.map((e) => (
          <div key={e.id} style={{ fontSize: 14, padding: "6px 0", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 10 }}>
            <span style={{ color: C.faint, width: 120, flexShrink: 0 }}>{new Date(e.created_at).toLocaleString("en-CA", { timeZone: "America/Toronto", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
            <span style={{ color: C.text }}>{EVENT[e.kind] ?? e.kind}{e.actor !== "system" ? ` · by ${e.actor.startsWith("specialist") ? "specialist" : e.actor}` : " · automatic"}{typeof e.detail?.reason === "string" ? ` · ${e.detail.reason}` : ""}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 22 }}>
        <div style={{ fontWeight: 700, color: C.navy, marginBottom: 6 }}>Emails</div>
        {d.messages.length === 0 && <div style={{ fontSize: 14, color: C.muted }}>None yet.</div>}
        {d.messages.map((m) => (
          <div key={m.id} style={{ fontSize: 14, padding: "6px 0", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 10, alignItems: "center" }}>
            <Badge tone={m.status === "sent" ? "green" : m.status === "failed" ? "red" : "grey"}>{m.status}</Badge>
            <span style={{ color: C.text }}>{m.template.replace(/_/g, " ")} → {m.recipient}</span>
            {m.error && <span style={{ color: C.red, fontSize: 13 }}>{m.error}</span>}
          </div>
        ))}
      </div>
    </Panel>
  );
}
