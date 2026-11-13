"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Page, PageHeader, Card, Badge, Button, Tabs, EmptyState, Loading, ErrorNote, SuccessNote, C, money, ago, shortDate, type Tone,
} from "@/components/admin/kit";
import { incomeLabel, creditLabel, describeAnswers, type Answers, type PublicHome } from "@/lib/viewing-requests";
import SwipeDeck, { BookSheet } from "./SwipeDeck";

type Status = "new" | "contacted" | "viewing_booked" | "not_a_fit" | "closed";
type Priority = "call_today" | "maybe" | "not_now" | null;

interface Req {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  move_in_date: string;
  occupants: number;
  income_range: string;
  credit_range: string;
  property_id: string | null;
  property_snapshot: PublicHome;
  answers: Answers | null;
  rentmatch_opt_in: boolean;
  completion_seconds: number | null;
  status: Status;
  priority: Priority;
  review_reason: string | null;
  created_at: string;
  showing: { starts_at: string; status: string; specialist: string | null } | null;
}

const PRIORITY: Record<Exclude<Priority, null>, { label: string; tone: Tone }> = {
  call_today: { label: "Call today", tone: "green" },
  maybe: { label: "Maybe", tone: "amber" },
  not_now: { label: "Not now", tone: "grey" },
};
// Not sorted yet goes first: those are the newest requests and nobody has seen them.
const ORDER: Priority[] = [null, "call_today", "maybe", "not_now"];

export default function ViewingRequestsPage() {
  const [reqs, setReqs] = useState<Req[] | null>(null);
  const [tab, setTab] = useState<"todo" | "contacted" | "booked" | "done">("todo");
  const [mode, setMode] = useState<"swipe" | "list">("swipe");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  // ?id=… from the email: show that request first.
  const [focusId, setFocusId] = useState<string | null>(null);
  const [booking, setBooking] = useState<Req | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/viewing-requests");
    if (!res.ok) { setReqs([]); setError("Couldn't load requests. Refresh to try again."); return; }
    const d = await res.json();
    setReqs(d.requests);
  }, []);

  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, [load]);

  useEffect(() => {
    const t = setTimeout(() => setFocusId(new URLSearchParams(window.location.search).get("id")), 0);
    return () => clearTimeout(t);
  }, []);

  // A linked request that's already handled isn't in the deck: open its tab in the list instead.
  useEffect(() => {
    const r = focusId && reqs?.find((x) => x.id === focusId);
    if (!r || r.status === "new" || r.status === "contacted") return;
    const t = setTimeout(() => { setMode("list"); setTab(r.status === "viewing_booked" ? "booked" : "done"); }, 0);
    return () => clearTimeout(t);
  }, [focusId, reqs]);

  async function setStatus(r: Req, status: Status) {
    setBusy(r.id);
    const res = await fetch(`/api/admin/viewing-requests/${r.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (!res.ok) setError("That didn't save. Try again.");
    await load();
    setBusy(null);
  }

  async function reviewNow() {
    setBusy("review"); setError(null); setNotice(null);
    const res = await fetch("/api/admin/viewing-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "review" }) });
    const d = await res.json().catch(() => ({}));
    if (res.ok) { setNotice(d.reviewed ? `Sorted ${d.reviewed} new ${d.reviewed === 1 ? "request" : "requests"}.` : "Nothing new to sort."); await load(); }
    else setError(d.error ?? "Couldn't sort them. Try again.");
    setBusy(null);
  }

  async function sendApplication(r: Req) {
    setBusy(r.id); setError(null); setNotice(null);
    const res = await fetch("/api/admin/fieldops", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "send_application", request: r.id }) });
    const d = await res.json().catch(() => ({}));
    if (res.ok) setNotice(`Thank-you and personal application link emailed to ${r.full_name}.`);
    else setError(d.error ?? "Couldn't send it. Try again.");
    setBusy(null);
  }

  const list = reqs ?? [];
  const byTab = {
    todo: list.filter((r) => r.status === "new"),
    contacted: list.filter((r) => r.status === "contacted"),
    booked: list.filter((r) => r.status === "viewing_booked"),
    done: list.filter((r) => r.status === "not_a_fit" || r.status === "closed"),
  };
  const shown = byTab[tab];
  const unsorted = byTab.todo.filter((r) => !r.priority).length;

  return (
    <Page width={1240}>
      <PageHeader
        title="Viewing Requests"
        subtitle="People who filled in the viewing form. Claude sorts new ones every morning at 8am and emails you who to call."
        actions={<Button onClick={reviewNow} disabled={busy === "review" || unsorted === 0}>{busy === "review" ? "Sorting…" : `Sort new ones now${unsorted ? ` (${unsorted})` : ""}`}</Button>}
      />
      {error && <ErrorNote>{error}</ErrorNote>}
      {notice && <div style={{ marginBottom: 16 }}><SuccessNote>{notice}</SuccessNote></div>}

      <div style={{ display: "inline-flex", background: C.surface, border: `1px solid ${C.borderStrong}`, borderRadius: 999, padding: 3, marginBottom: 20 }}>
        {(["swipe", "list"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} style={{ border: 0, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, padding: "7px 18px", borderRadius: 999, background: mode === m ? C.navy : "transparent", color: mode === m ? "#fff" : C.navy }}>
            {m === "swipe" ? "Swipe" : "List"}
          </button>
        ))}
      </div>

      {mode === "swipe" ? (reqs ? <SwipeDeck requests={reqs} focusId={focusId} onChanged={load} /> : <Loading />) : (<>
      <Tabs value={tab} onChange={setTab} options={[
        { value: "todo", label: "To call", count: byTab.todo.length },
        { value: "contacted", label: "Contacted", count: byTab.contacted.length },
        { value: "booked", label: "Viewing booked", count: byTab.booked.length },
        { value: "done", label: "Closed", count: byTab.done.length },
      ]} />

      {!reqs ? <Loading /> : shown.length === 0 ? (
        <EmptyState title={tab === "todo" ? "No one waiting for a call" : "Nothing here yet"} body={tab === "todo" ? "New requests show up here as soon as someone sends the form." : undefined} />
      ) : (
        <div style={{ display: "grid", gap: 12, marginTop: 12, gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", alignItems: "start" }}>
          {(tab === "todo" ? [...shown].sort((a, b) => ORDER.indexOf(a.priority) - ORDER.indexOf(b.priority)) : shown)
            .sort((a, b) => Number(b.id === focusId) - Number(a.id === focusId)).map((r) => (
            <RequestCard key={r.id} r={r} busy={busy === r.id} onStatus={(s) => setStatus(r, s)} onBook={() => setBooking(r)} onApply={() => sendApplication(r)} />
          ))}
        </div>
      )}
      </>)}
      {booking && (
        <BookSheet r={booking} onClose={() => setBooking(null)}
          onBooked={async (text) => { setBooking(null); setNotice(`${text} Reminders go out 24 hours and 2 hours before.`); setTab("booked"); await load(); }} />
      )}
    </Page>
  );
}

const isFuture = (iso: string) => new Date(iso).getTime() > Date.now();
const fWhen = (iso: string) => new Date(iso).toLocaleString("en-CA", { timeZone: "America/Toronto", weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).replace(/\./g, "");

// Compact card: the essentials up top, the full answers one tap away.
function RequestCard({ r, busy, onStatus, onBook, onApply }: { r: Req; busy: boolean; onStatus: (s: Status) => void; onBook: () => void; onApply: () => void }) {
  const [open, setOpen] = useState(false);
  const h = r.property_snapshot;
  const details = describeAnswers(r.answers ?? {}).filter((x) => x.id !== "income" && x.id !== "credit");
  const upcoming = r.showing && isFuture(r.showing.starts_at);
  return (
    <Card padding={16}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.navy }}>{r.full_name}</div>
          <div style={{ fontSize: 14, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            <a href={`tel:${r.phone}`} style={{ color: C.navy, fontWeight: 600 }}>{r.phone}</a>
            {r.email && <> · <a href={`mailto:${r.email}`} style={{ color: C.muted }}>{r.email}</a></>}
          </div>
          <div style={{ fontSize: 13, color: C.faint }}>Sent {ago(r.created_at)}{r.rentmatch_opt_in ? " · RentMatch" : ""}</div>
        </div>
        {r.status === "new" && (r.priority ? <Badge tone={PRIORITY[r.priority].tone}>{PRIORITY[r.priority].label}</Badge> : <Badge tone="blue">Not sorted</Badge>)}
      </div>

      {r.showing && (
        <div style={{ marginTop: 10, borderRadius: 10, padding: "8px 12px", background: upcoming ? C.navy : C.greyBg, color: upcoming ? "#fff" : C.navy, fontSize: 14 }}>
          <b>{fWhen(r.showing.starts_at)}</b> · {r.showing.specialist ? `with ${r.showing.specialist}` : "no specialist yet"}
          {!upcoming && <span style={{ color: C.muted }}> · {r.showing.status.replace(/_/g, " ")}</span>}
        </div>
      )}
      {!r.showing && r.status === "viewing_booked" && <div style={{ marginTop: 10, fontSize: 13, color: C.amber }}>Marked booked, but not on the showing calendar. Use Book viewing to add it.</div>}

      {r.review_reason && r.status === "new" && (
        <div style={{ marginTop: 10, fontSize: 14, color: C.text, background: C.greyBg, borderRadius: 10, padding: "8px 12px", display: "-webkit-box", WebkitLineClamp: open ? undefined : 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{r.review_reason}</div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10, fontSize: 13 }}>
        <Chip>{h.address} · {money(h.price)}</Chip>
        <Chip>Move-in {shortDate(r.move_in_date)}</Chip>
        <Chip>{r.occupants} {r.occupants === 1 ? "person" : "people"}</Chip>
        <Chip>{incomeLabel(r.income_range)}/mo</Chip>
        <Chip>Credit {creditLabel(r.credit_range)}</Chip>
      </div>

      {details.length > 0 && (
        <button type="button" onClick={() => setOpen(!open)} style={{ marginTop: 8, background: "none", border: 0, padding: 0, color: C.navy, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}>
          {open ? "Hide answers" : `Answers (${details.length})`}
        </button>
      )}
      {open && (
        <div style={{ marginTop: 6, borderTop: `1px solid ${C.border}` }}>
          {details.map((x) => (
            <div key={x.id} style={{ display: "flex", gap: 10, justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
              <span style={{ color: C.muted }}>{x.question}</span>
              <span style={{ color: C.navy, fontWeight: 600, textAlign: "right" }}>{x.answer}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        {r.status !== "not_a_fit" && r.status !== "closed" && <Button size="sm" variant={r.status === "viewing_booked" && r.showing ? undefined : "primary"} disabled={busy || !r.property_id} onClick={onBook}>{r.showing ? "Book another time" : "Book viewing"}</Button>}
        {r.status !== "not_a_fit" && r.email && <Button size="sm" variant={r.status === "viewing_booked" ? "primary" : undefined} disabled={busy} onClick={onApply}>Send application</Button>}
        {r.status === "new" && <Button size="sm" disabled={busy} onClick={() => onStatus("contacted")}>Contacted</Button>}
        {r.status !== "not_a_fit" && r.status !== "closed" && <Button size="sm" variant="ghost" disabled={busy} onClick={() => onStatus(r.status === "viewing_booked" ? "closed" : "not_a_fit")}>{r.status === "viewing_booked" ? "Done" : "Not a fit"}</Button>}
        {(r.status === "not_a_fit" || r.status === "closed") && <Button size="sm" variant="ghost" disabled={busy} onClick={() => onStatus("new")}>Move back to To call</Button>}
      </div>
    </Card>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span style={{ background: C.greyBg, borderRadius: 999, padding: "4px 10px", color: C.navy, fontWeight: 600 }}>{children}</span>;
}
