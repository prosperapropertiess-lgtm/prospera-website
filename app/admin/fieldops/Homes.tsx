"use client";

import { useEffect, useState } from "react";
import { Card, Badge, Button, EmptyState, Loading, ErrorNote, SuccessNote, C, money } from "@/components/admin/kit";
import { api, act, Panel, Label, input, mm, Toggle, fDay, fTime } from "./shared";

interface Rules {
  booking_enabled: boolean; duration_min: number; travel_buffer_min: number; min_notice_hours: number; horizon_days: number; max_per_slot: number;
  windows: { weekday: number; start_min: number; end_min: number }[]; occupied: boolean; access_instructions: string | null; highlights: string | null;
}
interface Home { id: string; address: string; city: string; price: number; bedrooms: number | null; rules: Rules; openSlots: number; hasMap: boolean }
interface Blackout { id: string; property_id: string; starts_at: string; ends_at: string; reason: string | null }

const DAYS = [1, 2, 3, 4, 5, 6, 0];
const NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TIMES = Array.from({ length: 35 }, (_, i) => 7 * 60 + i * 30);

export default function Homes() {
  const [d, setD] = useState<{ homes: Home[]; blackouts: Blackout[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<Home | null>(null);
  const load = () => api<{ homes: Home[]; blackouts: Blackout[] }>("homes").then((x) => { setD(x); setOpen((o) => o && (x.homes.find((h) => h.id === o.id) ?? null)); }).catch((e) => setError(e.message));
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, []);
  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (!d) return <Loading />;

  return (
    <div>
      <div style={{ color: C.muted, fontSize: 15, marginBottom: 14 }}>Homes that are listed and available. Turn on self-booking, set when showings can happen, and add how to get in.</div>
      {d.homes.length === 0 ? <EmptyState title="No available homes" body="Homes marked available in Properties show up here." /> : (
        <Card padding={0}>
          {d.homes.map((h) => (
            <button key={h.id} onClick={() => setOpen(h)} style={{ all: "unset", cursor: "pointer", display: "grid", gridTemplateColumns: "1fr auto auto", gap: 16, alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${C.border}`, width: "calc(100% - 40px)" }}>
              <span>
                <span style={{ display: "block", fontWeight: 700, color: C.navy, fontSize: 16 }}>{h.address}</span>
                <span style={{ display: "block", fontSize: 14, color: C.muted }}>
                  {money(h.price)}/mo · {h.rules.duration_min}-min showings · {h.rules.windows.length ? `${h.rules.windows.length} time windows` : "9am–8pm daily"}
                  {!h.rules.access_instructions && h.rules.booking_enabled ? " · no access instructions" : ""}
                </span>
              </span>
              <span style={{ fontSize: 14, color: h.openSlots ? C.green : C.faint, fontWeight: 600 }}>{h.rules.booking_enabled ? `${h.openSlots} open times` : ""}</span>
              {h.rules.booking_enabled ? <Badge tone="green">Self-booking on</Badge> : <Badge>Off</Badge>}
            </button>
          ))}
        </Card>
      )}
      {open && <HomePanel home={open} blackouts={d.blackouts.filter((b) => b.property_id === open.id)} onClose={() => setOpen(null)} onSaved={load} />}
    </div>
  );
}

function HomePanel({ home, blackouts, onClose, onSaved }: { home: Home; blackouts: Blackout[]; onClose: () => void; onSaved: () => void }) {
  const [r, setR] = useState<Rules>({ ...home.rules, windows: [...home.rules.windows] });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [add, setAdd] = useState({ weekday: 1, start: 17 * 60, end: 20 * 60 });
  const [bo, setBo] = useState({ day: "", from: "09:00", to: "21:00", reason: "" });
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const res = await act({ action: "save_home_rules", property: home.id, rules: r });
    setBusy(false);
    setMsg(res.ok ? { ok: true, text: r.booking_enabled ? "Saved. Tenants with a booking link can now pick times." : "Saved." } : { ok: false, text: String(res.data.error) });
    onSaved();
  }
  async function addBlackout() {
    if (!bo.day) return;
    const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
    const res = await act({ action: "add_blackout", property: home.id, day: bo.day, from_min: toMin(bo.from), to_min: toMin(bo.to), reason: bo.reason });
    setMsg(res.ok ? { ok: true, text: "Blocked." } : { ok: false, text: String(res.data.error) });
    setBo({ ...bo, day: "", reason: "" });
    onSaved();
  }

  const num = (k: keyof Rules, label: string, hint: string) => (
    <div><Label>{label}</Label><input style={input} value={String(r[k] ?? "")} inputMode="numeric" onChange={(e) => setR({ ...r, [k]: Number(e.target.value.replace(/\D/g, "")) })} /><div style={{ fontSize: 12, color: C.faint, marginTop: 4 }}>{hint}</div></div>
  );

  return (
    <Panel title={home.address} onClose={onClose} width={580}>
      {msg && (msg.ok ? <div style={{ marginBottom: 12 }}><SuccessNote>{msg.text}</SuccessNote></div> : <ErrorNote>{msg.text}</ErrorNote>)}
      <Card>
        <Toggle on={r.booking_enabled} onChange={(v) => setR({ ...r, booking_enabled: v })} label="Tenants can book this home themselves" />
        <div style={{ fontSize: 13, color: C.muted, marginTop: 8 }}>Only people you send a private booking link to can book. Turning this off pauses all links for this home; booked showings stay.</div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
        {num("duration_min", "Showing length (min)", "Also the gap between start times.")}
        {num("max_per_slot", "Households at once", "1 = private showings.")}
        {num("min_notice_hours", "Book at least (hours ahead)", "e.g. 12 = no same-morning surprises.")}
        {num("horizon_days", "Book up to (days ahead)", "How far out tenants can pick.")}
        {num("travel_buffer_min", "Travel buffer (min)", home.hasMap ? "Minimum gap to another home. Distance is also estimated from the map." : "Gap needed to get to/from another home.")}
      </div>

      <div style={{ marginTop: 18 }}>
        <Toggle on={r.occupied} onChange={(v) => setR({ ...r, occupied: v })} label="Someone lives here now (tell the specialist)" />
      </div>

      <div style={{ marginTop: 20, fontWeight: 700, color: C.navy }}>When showings can happen</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>{r.windows.length ? "Only inside these windows, and only when a specialist is free." : "No windows set, so any time from 9am to 8pm when a specialist is free."}</div>
      <div style={{ display: "grid", gap: 6 }}>
        {DAYS.map((d) => r.windows.some((w) => w.weekday === d) && (
          <div key={d} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ width: 40, fontWeight: 600, color: C.navy, fontSize: 14 }}>{NAMES[d]}</span>
            {r.windows.filter((w) => w.weekday === d).map((w, i) => (
              <span key={i} style={{ background: C.navy, color: "#fff", borderRadius: 999, padding: "3px 4px 3px 10px", fontSize: 13, display: "inline-flex", gap: 6, alignItems: "center" }}>
                {mm(w.start_min)}–{mm(w.end_min)}
                <button onClick={() => setR({ ...r, windows: r.windows.filter((x) => x !== w) })} aria-label="Remove" style={{ border: 0, background: "rgba(255,255,255,.18)", color: "#fff", borderRadius: 99, width: 20, height: 20, cursor: "pointer" }}>×</button>
              </span>
            ))}
          </div>
        ))}
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <select style={{ ...input, width: 90 }} value={add.weekday} onChange={(e) => setAdd({ ...add, weekday: Number(e.target.value) })}>{DAYS.map((d) => <option key={d} value={d}>{NAMES[d]}</option>)}</select>
          <select style={{ ...input, width: 100 }} value={add.start} onChange={(e) => setAdd({ ...add, start: Number(e.target.value) })}>{TIMES.slice(0, -1).map((t) => <option key={t} value={t}>{mm(t)}</option>)}</select>
          <select style={{ ...input, width: 100 }} value={add.end} onChange={(e) => setAdd({ ...add, end: Number(e.target.value) })}>{TIMES.filter((t) => t > add.start).map((t) => <option key={t} value={t}>{mm(t)}</option>)}</select>
          <Button size="sm" onClick={() => setR({ ...r, windows: [...r.windows, { weekday: add.weekday, start_min: add.start, end_min: add.end }] })}>Add window</Button>
          <Button size="sm" variant="ghost" onClick={() => setR({ ...r, windows: [1, 2, 3, 4, 5].map((d) => ({ weekday: d, start_min: 17 * 60, end_min: 20 * 60 })).concat([6, 0].map((d) => ({ weekday: d, start_min: 10 * 60, end_min: 16 * 60 }))) })}>Evenings + weekends</Button>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <Label>How to get in (only the assigned specialist sees this, from the day before)</Label>
        <textarea style={{ ...input, minHeight: 80 }} value={r.access_instructions ?? ""} onChange={(e) => setR({ ...r, access_instructions: e.target.value })} placeholder="Lockbox on the side door, code 1234. Alarm panel left of the door: 5678. Return keys to the box." />
      </div>
      <div style={{ marginTop: 12 }}>
        <Label>Talking points</Label>
        <textarea style={{ ...input, minHeight: 70 }} value={r.highlights ?? ""} onChange={(e) => setR({ ...r, highlights: e.target.value })} placeholder="New flooring 2025. Utilities included. Laundry in basement, shared. Parking for 1." />
      </div>
      <div style={{ marginTop: 16 }}><Button variant="primary" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save"}</Button></div>

      <div style={{ marginTop: 28, fontWeight: 700, color: C.navy }}>Block a time</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>No showings will be offered then (e.g. contractor visit, tenant asked for quiet). Existing bookings are not moved.</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        <input type="date" style={{ ...input, width: 160 }} value={bo.day} onChange={(e) => setBo({ ...bo, day: e.target.value })} />
        <input type="time" style={{ ...input, width: 120 }} value={bo.from} onChange={(e) => setBo({ ...bo, from: e.target.value })} />
        <input type="time" style={{ ...input, width: 120 }} value={bo.to} onChange={(e) => setBo({ ...bo, to: e.target.value })} />
        <input style={{ ...input, width: 180 }} value={bo.reason} onChange={(e) => setBo({ ...bo, reason: e.target.value })} placeholder="Reason" />
        <Button size="sm" onClick={addBlackout} disabled={!bo.day}>Block</Button>
      </div>
      {blackouts.map((b) => (
        <div key={b.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 14 }}>
          <span style={{ color: C.navy, fontWeight: 600 }}>{fDay(b.starts_at)} {fTime(b.starts_at)}–{fTime(b.ends_at)}</span>
          <span style={{ color: C.muted, flex: 1 }}>{b.reason}</span>
          <Button size="sm" variant="ghost" onClick={async () => { await act({ action: "delete_blackout", id: b.id }); onSaved(); }}>Remove</Button>
        </div>
      ))}
    </Panel>
  );
}
