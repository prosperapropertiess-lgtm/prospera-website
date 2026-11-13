"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Badge, Button, C, money, type Tone } from "@/components/admin/kit";
import { incomeLabel, creditLabel, describeAnswers, targetMoveIn, type Answers, type PublicHome } from "@/lib/viewing-requests";

// Swipe through viewing requests one card at a time.
// Left = not a fit (nobody is contacted, and you can undo).
// Right = pick a time and a specialist; the tenant and specialist are emailed.

export interface DeckReq {
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
  completion_seconds: number | null;
  status: string;
  priority: "call_today" | "maybe" | "not_now" | null;
  review_reason: string | null;
  created_at: string;
}

interface Slot {
  start: string;
  end: string;
  agents: { id: string; name: string; reason: string; group: boolean }[];
  booked: { agentId: string | null; agentName: string | null; count: number }[];
}

const TZ = "America/Toronto";
const PRI: Record<string, { label: string; tone: Tone }> = { call_today: { label: "Strong", tone: "green" }, maybe: { label: "Maybe", tone: "amber" }, not_now: { label: "Not now", tone: "grey" } };
// Not sorted yet goes first: those are the newest requests and nobody has seen them.
const ORDER = [null, "call_today", "maybe", "not_now"];
const fDate = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-CA", { weekday: "short", month: "long", day: "numeric", timeZone: "UTC" });
const fTime = (iso: string) => new Date(iso).toLocaleTimeString("en-CA", { timeZone: TZ, hour: "numeric", minute: "2-digit" }).replace(/\./g, "");
const fDay = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ, weekday: "short", month: "short", day: "numeric" });
const dayKey = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ });
const GROUPS: [string, string[]][] = [
  ["Work", ["employment", "job_length", "job_type", "business_length", "tax_docs", "student_rent", "direct_pay", "benefit_docs", "work_other"]],
  ["Money", ["other_income", "other_income_docs", "cosigner", "first_last"]],
  ["Now", ["living", "notice", "rental_length", "landlord_reference", "moving_reason"]],
  ["Household", ["pets", "pet_details", "smoking", "vehicles"]],
];
const SHORT: Record<string, string> = {
  employment: "Work", job_length: "At job", job_type: "Job", business_length: "Self-employed", tax_docs: "Tax papers", student_rent: "Rent from",
  direct_pay: "Direct pay", benefit_docs: "Benefits stmt", work_other: "Situation", other_income: "Income from", other_income_docs: "Paperwork",
  cosigner: "Co-signer", first_last: "First + last", living: "Living", notice: "Notice", rental_length: "Renting", landlord_reference: "Reference",
  moving_reason: "Why moving", pets: "Pets", pet_details: "Pet", smoking: "Smoking", vehicles: "Vehicles",
};

export default function SwipeDeck({ requests, focusId, onChanged }: { requests: DeckReq[]; focusId?: string | null; onChanged: () => void }) {
  const queue = useMemo(() => requests
    .filter((r) => r.status === "new" || r.status === "contacted")
    .sort((a, b) => Number(b.id === focusId) - Number(a.id === focusId)
      || ORDER.indexOf(a.priority) - ORDER.indexOf(b.priority) || a.created_at.localeCompare(b.created_at)), [requests, focusId]);
  const [skipped, setSkipped] = useState<string[]>([]);
  const [gone, setGone] = useState<string[]>([]);
  const deck = useMemo(() => {
    const live = queue.filter((r) => !gone.includes(r.id));
    return [...live.filter((r) => !skipped.includes(r.id)), ...live.filter((r) => skipped.includes(r.id))];
  }, [queue, gone, skipped]);
  const card = deck[0] ?? null;

  const [dx, setDx] = useState(0);
  const [fly, setFly] = useState<"left" | "right" | null>(null);
  const [booking, setBooking] = useState<DeckReq | null>(null);
  const [undo, setUndo] = useState<DeckReq | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const start = useRef<number | null>(null);
  const [dragging, setDragging] = useState(false);

  const setStatus = useCallback(async (id: string, status: string) => {
    const res = await fetch(`/api/admin/viewing-requests/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    return res.ok;
  }, []);

  const left = useCallback(async () => {
    if (!card || fly) return;
    setFly("left");
    const r = card;
    setTimeout(() => { setGone((g) => [...g, r.id]); setFly(null); setDx(0); }, 220);
    const ok = await setStatus(r.id, "not_a_fit");
    if (ok) { setUndo(r); setToast({ ok: true, text: `${r.full_name}: marked not a fit. Nobody was contacted.` }); }
    else { setGone((g) => g.filter((x) => x !== r.id)); setToast({ ok: false, text: "That didn't save. Try again." }); }
  }, [card, fly, setStatus]);

  const right = useCallback(() => {
    if (!card || fly) return;
    setFly("right");
    const r = card;
    setTimeout(() => { setFly(null); setDx(0); setBooking(r); }, 200);
  }, [card, fly]);

  const skip = useCallback(() => { if (card) setSkipped((s) => [...s.filter((x) => x !== card.id), card.id]); }, [card]);

  async function doUndo() {
    if (!undo) return;
    if (await setStatus(undo.id, "new")) { setGone((g) => g.filter((x) => x !== undo.id)); setToast({ ok: true, text: `${undo.full_name} is back in the pile.` }); setUndo(null); onChanged(); }
  }

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (booking || (e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "ArrowLeft") left();
      if (e.key === "ArrowRight") right();
      if (e.key === "ArrowDown") skip();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [left, right, skip, booking]);

  const tilt = fly === "left" ? -700 : fly === "right" ? 700 : dx;

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      {toast && (
        <div role="status" style={{ marginBottom: 12, padding: "10px 14px", borderRadius: 10, fontSize: 14, display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", background: toast.ok ? C.greenBg : C.redBg, color: toast.ok ? C.green : C.red }}>
          <span>{toast.text}</span>
          {undo && toast.text.includes("not a fit") && <button onClick={doUndo} style={{ border: 0, background: "transparent", color: C.navy, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Undo</button>}
        </div>
      )}

      {!card ? (
        <div style={{ textAlign: "center", padding: "70px 20px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20 }}>
          <div style={{ fontSize: 40 }} aria-hidden="true">✓</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.navy, marginTop: 8 }}>All caught up</div>
          <div style={{ fontSize: 15, color: C.muted, marginTop: 4 }}>New viewing requests show up here as soon as someone sends the form.</div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 13, color: C.muted, textAlign: "center", marginBottom: 10 }}>{deck.length} to go · ← not a fit · → book · ↓ later</div>
          <div style={{ position: "relative", height: 640 }}>
            {deck[1] && <div aria-hidden="true" style={{ position: "absolute", inset: "14px 14px 0", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, transform: "scale(.97)", opacity: 0.7 }} />}
            <div
              onPointerDown={(e) => { if ((e.target as HTMLElement).closest("a,button")) return; start.current = e.clientX; setDragging(true); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }}
              onPointerMove={(e) => { if (start.current != null) setDx(e.clientX - start.current); }}
              onPointerUp={() => { if (start.current == null) return; start.current = null; setDragging(false); if (dx > 120) right(); else if (dx < -120) left(); else setDx(0); }}
              onPointerCancel={() => { start.current = null; setDragging(false); setDx(0); }}
              style={{
                position: "absolute", inset: 0, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, overflow: "hidden",
                boxShadow: "0 12px 40px rgba(31,47,58,.12)", touchAction: "pan-y", cursor: "grab", userSelect: "none",
                transform: `translateX(${tilt}px) rotate(${tilt / 25}deg)`, transition: dragging ? "none" : "transform .22s ease-out",
              }}>
              <Stamp show={dx > 40} text="BOOK" color={C.green} side="left" />
              <Stamp show={dx < -40} text="NOT A FIT" color={C.red} side="right" />
              <Card r={card} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 18, alignItems: "center" }}>
            <Round label="Not a fit" onClick={left} color={C.red} size={64}>✕</Round>
            <Round label="Later" onClick={skip} color={C.muted} size={46}>↓</Round>
            <Round label="Book a viewing" onClick={right} color={C.green} size={64}>✓</Round>
          </div>
        </>
      )}

      {booking && (
        <BookSheet r={booking}
          onClose={() => setBooking(null)}
          onBooked={(text) => { setGone((g) => [...g, booking.id]); setBooking(null); setToast({ ok: true, text }); setUndo(null); onChanged(); }} />
      )}
    </div>
  );
}

function Stamp({ show, text, color, side }: { show: boolean; text: string; color: string; side: "left" | "right" }) {
  return (
    <div aria-hidden="true" style={{
      position: "absolute", top: 26, [side]: 22, zIndex: 2, opacity: show ? 1 : 0, transition: "opacity .1s",
      border: `3px solid ${color}`, color, borderRadius: 10, padding: "4px 12px", fontWeight: 800, fontSize: 22, letterSpacing: 1,
      transform: `rotate(${side === "left" ? -12 : 12}deg)`, background: "rgba(255,255,255,.9)",
    }}>{text}</div>
  );
}

function Round({ children, onClick, color, size, label }: { children: React.ReactNode; onClick: () => void; color: string; size: number; label: string }) {
  return (
    <button onClick={onClick} aria-label={label} title={label}
      style={{ width: size, height: size, borderRadius: 999, border: `2px solid ${color}`, background: "#fff", color, fontSize: size / 2.6, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(31,47,58,.1)" }}>
      {children}
    </button>
  );
}

function Card({ r }: { r: DeckReq }) {
  const home = r.property_snapshot;
  const late = r.move_in_date > targetMoveIn(home?.available_date);
  const rows = describeAnswers(r.answers ?? {});
  const get = (id: string) => rows.find((x) => x.id === id)?.answer;
  const p = r.priority ? PRI[r.priority] : null;
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ background: C.navy, color: "#fff", padding: "22px 24px 18px" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
          {p ? <Badge tone={p.tone}>{p.label}</Badge> : <Badge>Not sorted yet</Badge>}
          <span style={{ fontSize: 12, opacity: 0.6 }}>{new Date(r.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}</span>
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.1 }}>{r.full_name}</div>
        <div style={{ fontSize: 14, opacity: 0.75, marginTop: 6 }}>{home?.address} · {money(home?.price ?? 0)}/mo</div>
      </div>
      <div style={{ padding: "16px 22px", overflowY: "auto", flex: 1 }}>
        {r.review_reason && <div style={{ fontSize: 14, color: C.text, background: C.greyBg, borderRadius: 10, padding: "10px 12px", marginBottom: 14, lineHeight: 1.5 }}>{r.review_reason}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
          <Tile k="Move in" v={r.move_in_date <= new Date().toLocaleDateString("en-CA", { timeZone: TZ }) ? "As soon as possible" : fDate(r.move_in_date)} warn={late ? "later than hoped" : undefined} />
          <Tile k="People" v={String(r.occupants)} />
          <Tile k="Income / month" v={incomeLabel(r.income_range)} />
          <Tile k="Credit" v={creditLabel(r.credit_range)} />
        </div>
        {GROUPS.map(([title, ids]) => {
          const items = ids.map((id) => [id, get(id)] as const).filter(([, v]) => v);
          if (!items.length) return null;
          return (
            <div key={title} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 4 }}>{title}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {items.map(([id, v]) => <span key={id} style={{ fontSize: 13, background: "#F7F5F2", border: `1px solid ${C.border}`, borderRadius: 999, padding: "4px 10px", color: C.text }}><span style={{ color: C.muted }}>{SHORT[id]}:</span> {v}</span>)}
              </div>
            </div>
          );
        })}
        {get("viewing_times") && <div style={{ fontSize: 14, color: C.text, marginTop: 6 }}><b>Free to view:</b> {get("viewing_times")}</div>}
      </div>
      <div style={{ borderTop: `1px solid ${C.border}`, padding: "12px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14 }}>
        <a href={`tel:${r.phone}`} style={{ color: C.navy, fontWeight: 700 }}>{r.phone}</a>
        <span style={{ color: r.email ? C.muted : C.red }}>{r.email ?? "no email: call or text them"}</span>
      </div>
    </div>
  );
}

function Tile({ k, v, warn }: { k: string; v: string; warn?: string }) {
  return (
    <div style={{ background: "#F7F5F2", borderRadius: 10, padding: "9px 12px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".04em" }}>{k}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginTop: 2 }}>{v}</div>
      {warn && <div style={{ fontSize: 12, color: C.amber, fontWeight: 600 }}>{warn}</div>}
    </div>
  );
}

export function BookSheet({ r, onClose, onBooked }: { r: DeckReq; onClose: () => void; onBooked: (text: string) => void }) {
  const [data, setData] = useState<{ slots: Slot[]; duration: number; specialists: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [pick, setPick] = useState<{ slot: Slot; agentId: string; name: string; group: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!r.property_id) return;
    fetch(`/api/admin/fieldops?view=agent_slots&property=${r.property_id}`, { cache: "no-store" })
      .then((x) => x.json()).then((d) => { if (d.error) setError(d.error); else setData(d); }).catch(() => setError("Couldn't load times."));
  }, [r.property_id]);

  const days = useMemo(() => {
    const m = new Map<string, Slot[]>();
    for (const s of data?.slots ?? []) m.set(dayKey(s.start), [...(m.get(dayKey(s.start)) ?? []), s]);
    return [...m.entries()];
  }, [data]);
  const active = day ?? (days.find(([, ss]) => ss.some((s) => s.booked.length))?.[0] ?? days[0]?.[0]);
  const slots = days.find(([d]) => d === active)?.[1] ?? [];

  async function book() {
    if (!pick) return;
    setBusy(true); setError(null);
    const res = await fetch("/api/admin/fieldops", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "book_request", request: r.id, start: pick.slot.start, agent: pick.agentId, group: pick.group }) });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setError(d.error ?? "Couldn't book that."); return; }
    onBooked(`Booked ${r.full_name} · ${fDay(pick.slot.start)} ${fTime(pick.slot.start)} with ${pick.name}. ${r.email ? "Tenant emailed with a calendar invite" : `No email for the tenant, so call or text ${r.phone}`}; ${pick.name} emailed with their details.`);
  }

  return (
    <div role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(31,47,58,.35)" }} />
      <div style={{ position: "relative", width: "min(560px, 100vw)", height: "100%", background: C.bg, overflowY: "auto", boxShadow: "-12px 0 40px rgba(31,47,58,.18)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "18px 22px", borderBottom: `1px solid ${C.border}`, background: C.bg, position: "sticky", top: 0, zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, color: C.muted }}>Book a viewing for</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.navy }}>{r.full_name}</div>
              <div style={{ fontSize: 14, color: C.muted }}>{r.property_snapshot?.address}{r.answers?.viewing_times ? ` · free: ${describeAnswers(r.answers).find((x) => x.id === "viewing_times")?.answer}` : ""}</div>
            </div>
            <button onClick={onClose} aria-label="Close" style={{ border: 0, background: C.surface, width: 34, height: 34, borderRadius: 999, cursor: "pointer", fontSize: 18, color: C.navy }}>×</button>
          </div>
        </div>
        <div style={{ padding: 22, flex: 1 }}>
          {!r.property_id && <div style={{ background: C.redBg, color: C.red, borderRadius: 10, padding: "10px 14px", fontSize: 14, marginBottom: 12 }}>This request has no home attached.</div>}
          {error && <div style={{ background: C.redBg, color: C.red, borderRadius: 10, padding: "10px 14px", fontSize: 14, marginBottom: 12 }}>{error}</div>}
          {!data && !error && r.property_id && <div style={{ color: C.muted }}>Loading times…</div>}
          {data && data.specialists === 0 && (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 18 }}>
              <div style={{ fontWeight: 700, color: C.navy }}>No one can do showings yet</div>
              <div style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>Invite yourself or a helper, and add the hours they&apos;re free. Then their times show up here.</div>
              <div style={{ marginTop: 12 }}><Link href="/admin/fieldops?tab=team" style={{ color: C.burgundy, fontWeight: 700 }}>Go to Specialists →</Link></div>
            </div>
          )}
          {data && data.specialists > 0 && !data.slots.length && <div style={{ color: C.muted }}>Nobody is free at this home in the next 10 days. Add more hours in Showings → Specialists.</div>}

          {days.length > 0 && (
            <>
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6 }}>
                {days.map(([d, ss]) => {
                  const on = d === active, booked = ss.reduce((n, s) => n + s.booked.reduce((m, b) => m + b.count, 0), 0);
                  return (
                    <button key={d} onClick={() => { setDay(d); setPick(null); }} style={{ flexShrink: 0, minWidth: 84, padding: "8px 10px", borderRadius: 12, cursor: "pointer", fontFamily: "inherit", textAlign: "center", border: `2px solid ${on ? C.navy : C.borderStrong}`, background: on ? C.navy : "#fff", color: on ? "#fff" : C.navy }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{fDay(ss[0].start)}</div>
                      <div style={{ fontSize: 11, opacity: 0.7 }}>{booked ? `${booked} booked here` : `${ss.length} times`}</div>
                    </button>
                  );
                })}
              </div>
              <div style={{ fontSize: 13, color: C.muted, margin: "12px 0 8px" }}>Pick a specialist next to a time. <b style={{ color: C.navy }}>Group</b> adds them to a showing already booked then; times right after a booking keep the specialist at the home.</div>
              <div style={{ display: "grid", gap: 8 }}>
                {slots.map((s) => {
                  const here = s.booked.reduce((n, b) => n + b.count, 0);
                  return (
                    <div key={s.start} style={{ background: C.surface, border: `1px solid ${here ? C.navy : C.border}`, borderRadius: 12, padding: "10px 12px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ width: 86, whiteSpace: "nowrap" }}>
                        <div style={{ fontWeight: 700, color: C.navy }}>{fTime(s.start)}</div>
                        {here > 0 && <div style={{ fontSize: 11, color: C.navy, fontWeight: 600, whiteSpace: "normal" }}>{here} booked{s.booked[0]?.agentName ? ` · ${s.booked[0].agentName}` : ""}</div>}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
                        {s.agents.map((a) => {
                          const on = pick?.slot.start === s.start && pick.agentId === a.id;
                          return (
                            <button key={a.id} title={a.reason} onClick={() => setPick({ slot: s, agentId: a.id, name: a.name, group: a.group })}
                              style={{ padding: "6px 12px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, border: `1px solid ${on ? C.navy : a.group || a.reason.includes("already at this home") ? C.green : C.borderStrong}`, background: on ? C.navy : a.group ? C.greenBg : "#fff", color: on ? "#fff" : C.navy }}>
                              {a.name}{a.group ? " · group" : a.reason.includes("already at this home") ? " · back-to-back" : ""}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
        {pick && (
          <div style={{ position: "sticky", bottom: 0, background: "#fff", borderTop: `1px solid ${C.border}`, padding: "14px 22px" }}>
            <div style={{ fontSize: 14, color: C.text, marginBottom: 8 }}><b>{fDay(pick.slot.start)} {fTime(pick.slot.start)}</b> with <b>{pick.name}</b>{pick.group ? " (joins the group showing)" : ""}</div>
            <Button variant="primary" disabled={busy} onClick={book}>{busy ? "Booking…" : `Book and email ${r.email ? "both" : pick.name}`}</Button>
          </div>
        )}
      </div>
    </div>
  );
}
