"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Badge, Button, Grid, Stat, SectionTitle, EmptyState, Loading, ErrorNote, SuccessNote, C } from "@/components/admin/kit";
import { api, act, fTime, fDay, cash, STATUS, dayOf } from "./shared";

interface A { id: string; starts_at: string; ends_at: string; status: string; tenant_name: string; acknowledged_at: string | null; agent_id: string | null; properties: { address: string }; agents: { name: string } | null }
interface Req { id: string; full_name: string; priority: string | null; status: string; property_id: string | null; property_snapshot: { address: string }; email: string | null; bookable: boolean; created_at: string }
interface Data {
  upcoming: A[];
  exceptions: { overdue: A[]; unacked: A[]; unassigned: A[]; failedMessages: { id: string; template: string; recipient: string; error: string | null; created_at: string; appointment_id: string | null }[] };
  awaiting: Req[];
  funnel: { invited: number; booked: number; attended: number; noShow: number; leases: number };
  pendingPay: number;
  specialists: { active: number; invited: number };
}

const PRIORITY: Record<string, { label: string; tone: "green" | "amber" | "grey" }> = {
  call_today: { label: "Strong", tone: "green" }, maybe: { label: "Maybe", tone: "amber" }, not_now: { label: "Not now", tone: "grey" },
};

export default function Overview({ onOpen, onTab }: { onOpen: (id: string) => void; onTab: (t: string) => void }) {
  const [d, setD] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const load = () => api<Data>("overview").then(setD).catch((e) => setError(e.message));
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, []);

  async function invite(r: Req) {
    setBusy(r.id); setError(null); setNotice(null);
    const res = await act({ action: "send_booking_link", request: r.id });
    setBusy(null);
    if (!res.ok) { setError(String(res.data.error)); return; }
    const url = String(res.data.url);
    if (res.data.delivery === "sent") setNotice(`Booking link emailed to ${r.full_name}.`);
    else { await navigator.clipboard.writeText(url).catch(() => null); setNotice(`${r.full_name} has no email, so the link was copied. Text it to them: ${url}`); }
    load();
  }

  if (error && !d) return <ErrorNote>{error}</ErrorNote>;
  if (!d) return <Loading />;

  const ex = d.exceptions;
  const exCount = ex.overdue.length + ex.unacked.length + ex.unassigned.length + ex.failedMessages.length;
  const today = dayOf(new Date().toISOString());
  const todays = d.upcoming.filter((a) => dayOf(a.starts_at) === today);
  const later = d.upcoming.filter((a) => dayOf(a.starts_at) !== today);

  return (
    <div>
      {error && <ErrorNote>{error}</ErrorNote>}
      {notice && <div style={{ marginBottom: 16 }}><SuccessNote>{notice}</SuccessNote></div>}

      {d.specialists.active === 0 && (
        <Card style={{ marginBottom: 20, borderColor: C.burgundy }}>
          <div style={{ fontWeight: 700, color: C.navy, fontSize: 17 }}>Set up in 3 steps</div>
          <ol style={{ margin: "10px 0 0", paddingLeft: 20, color: C.text, fontSize: 15, lineHeight: 1.9 }}>
            <li><button onClick={() => onTab("team")} style={{ border: 0, background: "none", padding: 0, color: C.burgundy, fontWeight: 600, cursor: "pointer", fontSize: 15 }}>Invite a specialist</button> (you can invite yourself). They set a password and add their free times.</li>
            <li><button onClick={() => onTab("homes")} style={{ border: 0, background: "none", padding: 0, color: C.burgundy, fontWeight: 600, cursor: "pointer", fontSize: 15 }}>Turn on self-booking</button> for a home and add lockbox instructions.</li>
            <li>Send a booking link to a strong viewing request below.</li>
          </ol>
          {d.specialists.invited > 0 && <div style={{ marginTop: 8, fontSize: 14, color: C.muted }}>{d.specialists.invited} invited, waiting for them to set up.</div>}
        </Card>
      )}

      <Grid min={180}>
        <Stat label="Today" value={todays.length} hint={todays.length === 1 ? "showing" : "showings"} />
        <Stat label="Next 7 days" value={d.upcoming.length} hint="booked" />
        <Stat label="Needs you" value={exCount} hint={exCount ? "see below" : "all clear"} tone={exCount ? "alert" : undefined} />
        <Stat label="Pay to approve" value={cash(d.pendingPay)} hint="pending" />
      </Grid>

      {exCount > 0 && (
        <>
          <SectionTitle>Needs you</SectionTitle>
          <Card padding={0}>
            {[
              ...ex.unassigned.map((a) => ({ a, tone: "red" as const, what: "No specialist. Reassign or reschedule." })),
              ...ex.overdue.map((a) => ({ a, tone: "red" as const, what: "Finished but no report yet." })),
              ...ex.unacked.map((a) => ({ a, tone: "amber" as const, what: `${a.agents?.name ?? "Specialist"} hasn't tapped Got it.` })),
            ].map(({ a, tone, what }, i) => (
              <button key={`${a.id}-${i}`} onClick={() => onOpen(a.id)} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: `1px solid ${C.border}`, width: "calc(100% - 40px)" }}>
                <Badge tone={tone}>{tone === "red" ? "Act now" : "Check"}</Badge>
                <span style={{ fontWeight: 600, color: C.navy }}>{fDay(a.starts_at)} {fTime(a.starts_at)} · {a.properties.address}</span>
                <span style={{ color: C.muted, fontSize: 14 }}>{what}</span>
              </button>
            ))}
            {ex.failedMessages.map((m) => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
                <Badge tone="red">Email failed</Badge>
                <span style={{ fontWeight: 600, color: C.navy }}>{m.template.replace(/_/g, " ")} to {m.recipient}</span>
                <span style={{ color: C.muted, fontSize: 14 }}>{m.error}</span>
                {m.appointment_id && <Button size="sm" onClick={() => onOpen(m.appointment_id!)}>Open</Button>}
              </div>
            ))}
          </Card>
        </>
      )}

      <SectionTitle right={<Button size="sm" variant="ghost" onClick={() => onTab("calendar")}>Open calendar →</Button>}>Coming up</SectionTitle>
      {d.upcoming.length === 0 ? <EmptyState title="Nothing booked in the next 7 days" body="Send booking links to strong viewing requests below." /> : (
        <Card padding={0}>
          {[...todays, ...later].map((a) => (
            <button key={a.id} onClick={() => onOpen(a.id)} style={{ all: "unset", cursor: "pointer", display: "grid", gridTemplateColumns: "120px 1fr auto", alignItems: "center", gap: 16, padding: "14px 20px", borderBottom: `1px solid ${C.border}`, width: "calc(100% - 40px)" }}>
              <span>
                <span style={{ display: "block", fontSize: 13, color: C.muted }}>{dayOf(a.starts_at) === today ? "Today" : fDay(a.starts_at)}</span>
                <span style={{ display: "block", fontSize: 17, fontWeight: 700, color: C.navy }}>{fTime(a.starts_at)}</span>
              </span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontWeight: 600, color: C.navy }}>{a.properties.address}</span>
                <span style={{ display: "block", fontSize: 14, color: C.muted }}>{a.tenant_name} · {a.agents?.name ?? "no specialist"}</span>
              </span>
              <Badge tone={STATUS[a.status]?.tone}>{STATUS[a.status]?.label}</Badge>
            </button>
          ))}
        </Card>
      )}

      <SectionTitle right={<Link href="/admin/viewing-requests" style={{ fontSize: 14, color: C.navy, fontWeight: 600 }}>All viewing requests →</Link>}>Waiting for a booking link</SectionTitle>
      {d.awaiting.length === 0 ? <EmptyState title="No one waiting" body="New prequalified requests from /view show up here." /> : (
        <Card padding={0}>
          {d.awaiting.map((r) => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: `1px solid ${C.border}`, flexWrap: "wrap" }}>
              {r.priority ? <Badge tone={PRIORITY[r.priority]?.tone}>{PRIORITY[r.priority]?.label}</Badge> : <Badge>Not sorted yet</Badge>}
              <span style={{ fontWeight: 600, color: C.navy }}>{r.full_name}</span>
              <span style={{ color: C.muted, fontSize: 14, flex: 1 }}>{r.property_snapshot?.address}{r.email ? "" : " · no email"}</span>
              {r.bookable
                ? <Button size="sm" variant="primary" disabled={busy === r.id} onClick={() => invite(r)}>{busy === r.id ? "Sending…" : r.email ? "Send booking link" : "Copy booking link"}</Button>
                : <span style={{ fontSize: 13, color: C.faint }}>Self-booking is off for this home</span>}
            </div>
          ))}
        </Card>
      )}

      <SectionTitle>Last 30 days</SectionTitle>
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
          {[["Links sent", d.funnel.invited], ["Booked", d.funnel.booked], ["Showed up", d.funnel.attended], ["No-shows", d.funnel.noShow], ["Leases signed", d.funnel.leases]].map(([k, v], i) => (
            <div key={k as string} style={{ textAlign: "center", padding: "6px 0", borderLeft: i ? `1px solid ${C.border}` : 0 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: C.navy }}>{v}</div>
              <div style={{ fontSize: 13, color: C.muted }}>{k}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 13, color: C.faint, marginTop: 12 }}>
          Booked = links that became a booking. Showed up = showings marked done. Leases signed = showings you marked as leased.
        </div>
      </Card>
    </div>
  );
}
