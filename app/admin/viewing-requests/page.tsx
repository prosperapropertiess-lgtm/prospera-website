"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Page, PageHeader, Card, Badge, Button, Tabs, EmptyState, Loading, ErrorNote, SuccessNote, C, money, ago, shortDate, type Tone,
} from "@/components/admin/kit";
import { incomeLabel, creditLabel, VIEW_URL, type PublicHome } from "@/lib/viewing-requests";

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
  property_snapshot: PublicHome;
  status: Status;
  priority: Priority;
  review_reason: string | null;
  created_at: string;
}
interface Home { id: string; address: string; city: string; price: number }

const PRIORITY: Record<Exclude<Priority, null>, { label: string; tone: Tone }> = {
  call_today: { label: "Call today", tone: "green" },
  maybe: { label: "Maybe", tone: "amber" },
  not_now: { label: "Not now", tone: "grey" },
};
const ORDER: Priority[] = ["call_today", "maybe", null, "not_now"];

function replyFor(h: Home) {
  return `Hi! Yes, ${h.address} is available. To book a viewing, pick the home and answer a few quick questions here: ${VIEW_URL}?home=${h.id}\n\nNo documents or payment needed. We'll call you to set up a time.`;
}

export default function ViewingRequestsPage() {
  const [reqs, setReqs] = useState<Req[] | null>(null);
  const [homes, setHomes] = useState<Home[]>([]);
  const [tab, setTab] = useState<"todo" | "contacted" | "booked" | "done">("todo");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/viewing-requests");
    if (!res.ok) { setReqs([]); setError("Couldn't load requests. Refresh to try again."); return; }
    const d = await res.json();
    setReqs(d.requests); setHomes(d.homes);
  }, []);

  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, [load]);

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

  async function copy(text: string, what: string) {
    try { await navigator.clipboard.writeText(text); setNotice(`Copied the ${what}.`); } catch { setError("Couldn't copy. Select the text and copy it by hand."); }
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
    <Page width={960}>
      <PageHeader
        title="Viewing Requests"
        subtitle="People who filled in the viewing form. Claude sorts new ones every morning at 8am and emails you who to call."
        actions={<Button onClick={reviewNow} disabled={busy === "review" || unsorted === 0}>{busy === "review" ? "Sorting…" : `Sort new ones now${unsorted ? ` (${unsorted})` : ""}`}</Button>}
      />
      {error && <ErrorNote>{error}</ErrorNote>}
      {notice && <div style={{ marginBottom: 16 }}><SuccessNote>{notice}</SuccessNote></div>}

      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: C.navy }}>Marketplace auto-reply</div>
        <div style={{ fontSize: 14, color: C.muted, marginTop: 4, marginBottom: 14 }}>
          Paste this into the listing&apos;s automatic reply on Facebook Marketplace. The link opens the form with that home already picked.
        </div>
        {homes.length === 0 && <div style={{ fontSize: 15, color: C.faint }}>No homes are marked available right now.</div>}
        <div style={{ display: "grid", gap: 14 }}>
          {homes.map((h) => (
            <div key={h.id} style={{ background: C.greyBg, borderRadius: 10, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ fontWeight: 600, color: C.navy }}>{h.address} · {money(h.price)}/mo</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button size="sm" onClick={() => copy(replyFor(h), "message")}>Copy message</Button>
                  <Button size="sm" variant="ghost" onClick={() => copy(`${VIEW_URL}?home=${h.id}`, "link")}>Copy link only</Button>
                </div>
              </div>
              <div style={{ fontSize: 14, color: C.text, marginTop: 8, whiteSpace: "pre-wrap" }}>{replyFor(h)}</div>
            </div>
          ))}
        </div>
      </Card>

      <Tabs value={tab} onChange={setTab} options={[
        { value: "todo", label: "To call", count: byTab.todo.length },
        { value: "contacted", label: "Contacted", count: byTab.contacted.length },
        { value: "booked", label: "Viewing booked", count: byTab.booked.length },
        { value: "done", label: "Closed", count: byTab.done.length },
      ]} />

      {!reqs ? <Loading /> : shown.length === 0 ? (
        <EmptyState title={tab === "todo" ? "No one waiting for a call" : "Nothing here yet"} body={tab === "todo" ? "New requests show up here as soon as someone sends the form." : undefined} />
      ) : (
        <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
          {(tab === "todo" ? [...shown].sort((a, b) => ORDER.indexOf(a.priority) - ORDER.indexOf(b.priority)) : shown).map((r) => (
            <RequestCard key={r.id} r={r} busy={busy === r.id} onStatus={(s) => setStatus(r, s)} />
          ))}
        </div>
      )}
    </Page>
  );
}

function RequestCard({ r, busy, onStatus }: { r: Req; busy: boolean; onStatus: (s: Status) => void }) {
  const h = r.property_snapshot;
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 19, fontWeight: 700, color: C.navy }}>{r.full_name}</div>
          <div style={{ fontSize: 15, marginTop: 2 }}>
            <a href={`tel:${r.phone}`} style={{ color: C.navy, fontWeight: 600 }}>{r.phone}</a>
            {r.email && <> · <a href={`mailto:${r.email}`} style={{ color: C.muted }}>{r.email}</a></>}
          </div>
          <div style={{ fontSize: 14, color: C.faint, marginTop: 2 }}>Sent {ago(r.created_at)}</div>
        </div>
        {r.status === "new" && (r.priority ? <Badge tone={PRIORITY[r.priority].tone}>{PRIORITY[r.priority].label}</Badge> : <Badge tone="blue">Not sorted yet</Badge>)}
      </div>

      {r.review_reason && r.status === "new" && (
        <div style={{ marginTop: 12, fontSize: 15, color: C.text, background: C.greyBg, borderRadius: 10, padding: "10px 14px" }}>{r.review_reason}</div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginTop: 14 }}>
        <Fact label="Home" value={`${h.address} · ${money(h.price)}`} />
        <Fact label="Move-in" value={shortDate(r.move_in_date)} />
        <Fact label="People" value={String(r.occupants)} />
        <Fact label="Income / month" value={incomeLabel(r.income_range)} />
        <Fact label="Credit" value={creditLabel(r.credit_range)} />
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
        {r.status === "new" && <Button variant="primary" disabled={busy} onClick={() => onStatus("contacted")}>I contacted them</Button>}
        {(r.status === "new" || r.status === "contacted") && <Button disabled={busy} onClick={() => onStatus("viewing_booked")}>Viewing booked</Button>}
        {r.status !== "not_a_fit" && r.status !== "closed" && <Button variant="ghost" disabled={busy} onClick={() => onStatus(r.status === "viewing_booked" ? "closed" : "not_a_fit")}>{r.status === "viewing_booked" ? "Done" : "Not a fit"}</Button>}
        {(r.status === "not_a_fit" || r.status === "closed") && <Button variant="ghost" disabled={busy} onClick={() => onStatus("new")}>Move back to To call</Button>}
      </div>
    </Card>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: C.greyBg, borderRadius: 10, padding: "10px 12px" }}>
      <div style={{ fontSize: 13, color: C.muted }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: C.navy, marginTop: 2 }}>{value}</div>
    </div>
  );
}
