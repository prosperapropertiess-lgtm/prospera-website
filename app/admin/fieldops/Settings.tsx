"use client";

import { useEffect, useState } from "react";
import { Card, Button, Loading, ErrorNote, SuccessNote, C } from "@/components/admin/kit";
import { api, act, cash, input, Label, Toggle } from "./shared";

interface S {
  pay_basis: "household" | "visit"; showing_fee: number; bonus_enabled: boolean; bonus_pct: number; reminder_hours: number[]; booking_link_days: number;
  weight_batch: number; weight_fair: number; weight_reliable: number; weight_travel: number;
}

export default function Settings() {
  const [s, setS] = useState<S | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  useEffect(() => { api<{ settings: S }>("settings").then((d) => setS(d.settings)).catch((e) => setMsg({ ok: false, text: e.message })); }, []);
  if (!s) return msg ? <ErrorNote>{msg.text}</ErrorNote> : <Loading />;

  async function save() {
    const r = await act({ action: "save_settings", settings: s });
    setMsg(r.ok ? { ok: true, text: "Saved." } : { ok: false, text: String(r.data.error) });
  }
  const n = (k: keyof S, v: string) => setS({ ...s!, [k]: Number(v.replace(/[^\d.]/g, "")) || 0 });
  const rent = 2500, example = Math.round(rent * s.bonus_pct) / 100;

  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 760 }}>
      {msg && (msg.ok ? <SuccessNote>{msg.text}</SuccessNote> : <ErrorNote>{msg.text}</ErrorNote>)}

      <Card>
        <div style={{ fontSize: 17, fontWeight: 700, color: C.navy }}>Showing pay</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
          <div><Label>Default pay per showing</Label><input style={input} value={String(s.showing_fee)} onChange={(e) => n("showing_fee", e.target.value)} /></div>
          <div>
            <Label>What counts as one paid showing</Label>
            <select style={input} value={s.pay_basis} onChange={(e) => setS({ ...s, pay_basis: e.target.value as S["pay_basis"] })}>
              <option value="household">Each household shown</option>
              <option value="visit">Each trip to a home (back-to-back showings count once)</option>
            </select>
          </div>
        </div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 8 }}>Paid when the specialist reports the tenant came or didn&apos;t show. Not paid for cancellations made in advance. You can set a different rate per specialist.</div>
      </Card>

      <Card>
        <div style={{ fontSize: 17, fontWeight: 700, color: C.navy }}>Leasing bonus</div>
        <div style={{ marginTop: 12, background: C.amberBg, color: C.amber, borderRadius: 10, padding: "12px 14px", fontSize: 14, lineHeight: 1.55 }}>
          <b>Get legal advice before you turn this on.</b> In Ontario, paying people who aren&apos;t registered real estate salespeople a commission tied to a lease being signed may not be allowed, and it can affect whether they&apos;re employees or contractors. This stays off until you decide.
        </div>
        <div style={{ marginTop: 14 }}><Toggle on={s.bonus_enabled} onChange={(v) => setS({ ...s, bonus_enabled: v })} label={s.bonus_enabled ? "On" : "Off"} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 12, marginTop: 12, alignItems: "end" }}>
          <div><Label>% of one month&apos;s rent</Label><input style={input} value={String(s.bonus_pct)} onChange={(e) => n("bonus_pct", e.target.value)} /></div>
          <div style={{ fontSize: 14, color: C.muted }}>Example: {cash(rent)} monthly rent × {s.bonus_pct}% = <b>{cash(example)}</b>, plus 4 showings × {cash(s.showing_fee)} = <b>{cash(example + 4 * s.showing_fee)}</b>. That total only happens if every condition is met. It&apos;s never shown as guaranteed.</div>
        </div>
      </Card>

      <Card>
        <div style={{ fontSize: 17, fontWeight: 700, color: C.navy }}>Booking links and reminders</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
          <div><Label>Booking links last (days)</Label><input style={input} value={String(s.booking_link_days)} onChange={(e) => n("booking_link_days", e.target.value)} /></div>
          <div><Label>Remind tenants (hours before, comma separated)</Label><input style={input} value={s.reminder_hours.join(", ")} onChange={(e) => setS({ ...s, reminder_hours: e.target.value.split(",").map((x) => Number(x.trim())).filter((x) => x > 0) })} /></div>
        </div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 8 }}>Specialists also get a reminder the day before, when their access instructions unlock.</div>
      </Card>

      <Card>
        <div style={{ fontSize: 17, fontWeight: 700, color: C.navy }}>Who gets assigned</div>
        <div style={{ fontSize: 14, color: C.muted, marginTop: 6 }}>Tenants always see every time someone can take. These only decide <i>which</i> free specialist gets it. Higher number = matters more.</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 14 }}>
          <div><Label>Already at that home</Label><input style={input} value={String(s.weight_batch)} onChange={(e) => n("weight_batch", e.target.value)} /></div>
          <div><Label>Share work fairly</Label><input style={input} value={String(s.weight_fair)} onChange={(e) => n("weight_fair", e.target.value)} /></div>
          <div><Label>Reliable record</Label><input style={input} value={String(s.weight_reliable)} onChange={(e) => n("weight_reliable", e.target.value)} /></div>
          <div><Label>Less driving</Label><input style={input} value={String(s.weight_travel)} onChange={(e) => n("weight_travel", e.target.value)} /></div>
        </div>
      </Card>

      <div><Button variant="primary" onClick={save}>Save settings</Button></div>
    </div>
  );
}
