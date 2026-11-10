"use client";

import { useEffect, useState } from "react";
import { Card, Badge, Button, Grid, EmptyState, Loading, ErrorNote, SuccessNote, C } from "@/components/admin/kit";
import { api, act, cash, Panel, Label, input, mm, Toggle } from "./shared";

interface S {
  id: string; name: string; email: string; phone: string | null; role: string; is_active: boolean; home_area: string | null;
  invited_at: string | null; activated_at: string | null; showing_fee: number | null; max_per_day: number; notes: string | null;
  weeklyHours: number; upcoming: number; completed: number; checklistDone: number; onTimePct: number | null; pending: number; paid: number;
}
interface Range { weekday: number; start_min: number; end_min: number }

const DAYS = [1, 2, 3, 4, 5, 6, 0];
const NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TIMES = Array.from({ length: 33 }, (_, i) => 7 * 60 + i * 30);

export default function Specialists() {
  const [d, setD] = useState<{ specialists: S[]; settings: { showing_fee: number } } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", home_area: "" });
  const [open, setOpen] = useState<S | null>(null);
  const [busy, setBusy] = useState(false);
  const load = () => api<{ specialists: S[]; settings: { showing_fee: number } }>("specialists").then(setD).catch((e) => setError(e.message));
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, []);

  async function invite(again?: S) {
    setBusy(true); setError(null); setNotice(null);
    const body = again ? { action: "invite_specialist", name: again.name, email: again.email, phone: again.phone, home_area: again.home_area } : { action: "invite_specialist", ...form };
    const r = await act(body);
    setBusy(false);
    if (!r.ok) { setError(String(r.data.error)); return; }
    setNotice(r.data.delivery === "sent" ? `Invite emailed to ${body.email}.` : `Couldn't email it. Send them this link: ${r.data.url}`);
    setInviting(false); setForm({ name: "", email: "", phone: "", home_area: "" });
    load();
  }

  if (error && !d) return <ErrorNote>{error}</ErrorNote>;
  if (!d) return <Loading />;
  const team = d.specialists.filter((s) => s.role === "specialist");

  return (
    <div>
      {error && <ErrorNote>{error}</ErrorNote>}
      {notice && <div style={{ marginBottom: 16 }}><SuccessNote>{notice}</SuccessNote></div>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 12, flexWrap: "wrap" }}>
        <div style={{ color: C.muted, fontSize: 15 }}>Specialists add the times they&apos;re free. Showings are assigned to them automatically; they don&apos;t pick or bid.</div>
        <Button variant="primary" onClick={() => setInviting(true)}>Invite a specialist</Button>
      </div>

      {inviting && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            <div><Label>Name</Label><input style={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Email</Label><input style={input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} inputMode="email" /></div>
            <div><Label>Phone</Label><input style={input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} inputMode="tel" /></div>
            <div><Label>Area they cover (rough)</Label><input style={input} value={form.home_area} onChange={(e) => setForm({ ...form, home_area: e.target.value })} placeholder="e.g. North London" /></div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <Button variant="primary" disabled={busy || !form.name || !form.email} onClick={() => invite()}>{busy ? "Sending…" : "Send invite"}</Button>
            <Button variant="ghost" onClick={() => setInviting(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {team.length === 0 ? <EmptyState title="No specialists yet" body="Invite your first one. You can invite yourself too, using a different email from the admin login." /> : (
        <Grid min={300}>
          {team.map((s) => (
            <button key={s.id} onClick={() => setOpen(s)} style={{ all: "unset", cursor: "pointer" }}>
              <Card style={{ height: "100%", opacity: s.is_active ? 1 : 0.55 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>{s.name}</div>
                    <div style={{ fontSize: 13, color: C.muted }}>{s.home_area ?? s.email}</div>
                  </div>
                  {!s.is_active ? <Badge>Paused</Badge> : !s.activated_at ? <Badge tone="amber">Invited</Badge> : s.weeklyHours === 0 ? <Badge tone="red">No times set</Badge> : <Badge tone="green">Active</Badge>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 16 }}>
                  {[["Free / week", `${s.weeklyHours}h`], ["Upcoming", s.upcoming], ["Done (90d)", s.completed], ["On time", s.onTimePct == null ? "—" : `${s.onTimePct}%`], ["To approve", cash(s.pending)], ["Paid", cash(s.paid)]].map(([k, v]) => (
                    <div key={k as string}><div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>{v}</div><div style={{ fontSize: 12, color: C.muted }}>{k}</div></div>
                  ))}
                </div>
              </Card>
            </button>
          ))}
        </Grid>
      )}
      {open && <SpecialistPanel s={open} defaultFee={d.settings.showing_fee} onClose={() => setOpen(null)} onSaved={() => { load(); }} onReinvite={() => invite(open)} />}
    </div>
  );
}

function SpecialistPanel({ s, defaultFee, onClose, onSaved, onReinvite }: { s: S; defaultFee: number; onClose: () => void; onSaved: () => void; onReinvite: () => void }) {
  const [f, setF] = useState({ name: s.name, phone: s.phone ?? "", home_area: s.home_area ?? "", notes: s.notes ?? "", showing_fee: s.showing_fee == null ? "" : String(s.showing_fee), max_per_day: String(s.max_per_day), is_active: s.is_active });
  const [rules, setRules] = useState<Range[] | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [add, setAdd] = useState({ weekday: 1, start: 17 * 60, end: 20 * 60 });
  useEffect(() => { api<{ rules: Range[] }>("availability", `&agent=${s.id}`).then((d) => setRules(d.rules.map(({ weekday, start_min, end_min }) => ({ weekday, start_min, end_min })))); }, [s.id]);

  async function save() {
    const r = await act({ action: "update_specialist", id: s.id, ...f });
    const r2 = rules ? await act({ action: "set_specialist_rules", agent: s.id, rules }) : { ok: true, data: {} };
    setMsg(r.ok && r2.ok ? "Saved." : String(r.data.error ?? r2.data.error ?? "Couldn't save."));
    onSaved();
  }

  return (
    <Panel title={s.name} onClose={onClose}>
      {msg && <div style={{ marginBottom: 12 }}><SuccessNote>{msg}</SuccessNote></div>}
      {!s.activated_at && (
        <Card style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 14, color: C.text }}>Invited {s.invited_at ? new Date(s.invited_at).toLocaleDateString("en-CA") : ""}. They haven&apos;t set a password yet.</div>
          <div style={{ marginTop: 10 }}><Button size="sm" onClick={onReinvite}>Send a new invite</Button></div>
        </Card>
      )}
      <div style={{ display: "grid", gap: 12 }}>
        <Toggle on={f.is_active} onChange={(v) => setF({ ...f, is_active: v })} label={f.is_active ? "Active (can be assigned)" : "Paused (won't get new showings)"} />
        <div><Label>Name</Label><input style={input} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><Label>Phone</Label><input style={input} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
          <div><Label>Area</Label><input style={input} value={f.home_area} onChange={(e) => setF({ ...f, home_area: e.target.value })} /></div>
          <div><Label>Pay per showing</Label><input style={input} value={f.showing_fee} onChange={(e) => setF({ ...f, showing_fee: e.target.value.replace(/[^\d.]/g, "") })} placeholder={`Default ${cash(defaultFee)}`} /></div>
          <div><Label>Most showings a day</Label><input style={input} value={f.max_per_day} onChange={(e) => setF({ ...f, max_per_day: e.target.value.replace(/\D/g, "") })} /></div>
        </div>
        <div><Label>Private notes</Label><textarea style={{ ...input, minHeight: 60 }} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
      </div>

      <div style={{ marginTop: 22, fontWeight: 700, color: C.navy }}>Weekly free times</div>
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>Usually they set these in their app. You can adjust them here. Booked showings are never removed by a change.</div>
      {rules === null ? <Loading /> : (
        <div style={{ display: "grid", gap: 6 }}>
          {DAYS.map((d) => (
            <div key={d} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ width: 40, fontWeight: 600, color: C.navy, fontSize: 14 }}>{NAMES[d]}</span>
              {rules.filter((r) => r.weekday === d).map((r, i) => (
                <span key={i} style={{ background: C.navy, color: "#fff", borderRadius: 999, padding: "3px 4px 3px 10px", fontSize: 13, display: "inline-flex", gap: 6, alignItems: "center" }}>
                  {mm(r.start_min)}–{mm(r.end_min)}
                  <button onClick={() => setRules(rules.filter((x) => x !== r))} aria-label="Remove" style={{ border: 0, background: "rgba(255,255,255,.18)", color: "#fff", borderRadius: 99, width: 20, height: 20, cursor: "pointer" }}>×</button>
                </span>
              ))}
              {!rules.some((r) => r.weekday === d) && <span style={{ fontSize: 13, color: C.faint }}>—</span>}
            </div>
          ))}
          <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
            <select style={{ ...input, width: 90 }} value={add.weekday} onChange={(e) => setAdd({ ...add, weekday: Number(e.target.value) })}>{DAYS.map((d) => <option key={d} value={d}>{NAMES[d]}</option>)}</select>
            <select style={{ ...input, width: 100 }} value={add.start} onChange={(e) => setAdd({ ...add, start: Number(e.target.value) })}>{TIMES.slice(0, -1).map((t) => <option key={t} value={t}>{mm(t)}</option>)}</select>
            <select style={{ ...input, width: 100 }} value={add.end} onChange={(e) => setAdd({ ...add, end: Number(e.target.value) })}>{TIMES.filter((t) => t > add.start).map((t) => <option key={t} value={t}>{mm(t)}</option>)}</select>
            <Button size="sm" onClick={() => add.end > add.start && setRules([...rules, { weekday: add.weekday, start_min: add.start, end_min: add.end }])}>Add</Button>
          </div>
        </div>
      )}
      <div style={{ marginTop: 22 }}><Button variant="primary" onClick={save}>Save</Button></div>
    </Panel>
  );
}
