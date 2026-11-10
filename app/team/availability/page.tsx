"use client";

import { useEffect, useMemo, useState } from "react";
import { TeamShell, H1, Label, Box, Note, Primary, useTeam, teamPost, tDayShort, tTime, NAVY, MUTED, BORDER, BURGUNDY } from "../ui";

interface Range { weekday: number; start_min: number; end_min: number }
interface Exc { id: string; day: string; kind: "off" | "extra"; start_min: number; end_min: number; note: string | null }
interface Data { rules: Range[]; exceptions: Exc[]; upcoming: { id: string; starts_at: string }[] }

const DAYS = [1, 2, 3, 4, 5, 6, 0];
const NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIMES = Array.from({ length: 33 }, (_, i) => 7 * 60 + i * 30); // 7am – 11pm
const mm = (m: number) => {
  const h = Math.floor(m / 60) % 24, n = m % 60, ap = h < 12 ? "am" : "pm", h12 = h % 12 === 0 ? 12 : h % 12;
  return n ? `${h12}:${String(n).padStart(2, "0")}${ap}` : `${h12}${ap}`;
};

const PRESETS: { label: string; ranges: Range[] }[] = [
  { label: "Weekday evenings 5–8pm", ranges: [1, 2, 3, 4, 5].map((d) => ({ weekday: d, start_min: 17 * 60, end_min: 20 * 60 })) },
  { label: "Weekends 10am–4pm", ranges: [6, 0].map((d) => ({ weekday: d, start_min: 10 * 60, end_min: 16 * 60 })) },
];

function merge(list: Range[]): Range[] {
  const out: Range[] = [];
  for (const d of [0, 1, 2, 3, 4, 5, 6]) {
    const rs = list.filter((r) => r.weekday === d).sort((a, b) => a.start_min - b.start_min);
    for (const r of rs) {
      const last = out[out.length - 1];
      if (last && last.weekday === d && r.start_min <= last.end_min) last.end_min = Math.max(last.end_min, r.end_min);
      else out.push({ ...r });
    }
  }
  return out;
}

export default function AvailabilityPage() {
  const { data, error, reload } = useTeam<Data>("availability");
  const [rules, setRules] = useState<Range[] | null>(null);
  const [adding, setAdding] = useState<number | null>(null);
  const [draft, setDraft] = useState({ start: 17 * 60, end: 20 * 60 });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [conflicts, setConflicts] = useState<{ id: string; starts_at: string; address: string }[]>([]);
  const [exc, setExc] = useState({ day: "", kind: "off" as "off" | "extra", allDay: true, start: 9 * 60, end: 17 * 60 });

  useEffect(() => { if (data && rules === null) { const t = setTimeout(() => setRules(data.rules.map(({ weekday, start_min, end_min }) => ({ weekday, start_min, end_min }))), 0); return () => clearTimeout(t); } }, [data, rules]);
  const dirty = useMemo(() => !!data && !!rules && JSON.stringify(merge(rules)) !== JSON.stringify(merge(data.rules.map(({ weekday, start_min, end_min }) => ({ weekday, start_min, end_min })))), [data, rules]);
  const weekly = (rules ?? []).reduce((s, r) => s + (r.end_min - r.start_min) / 60, 0);

  if (error) return <TeamShell><Note tone="error">{error}</Note></TeamShell>;
  if (!data || !rules) return <TeamShell><div className="py-16 text-center" style={{ color: MUTED }}>Loading…</div></TeamShell>;

  async function save() {
    setSaving(true); setMsg(null);
    const r = await teamPost({ action: "set_rules", rules: merge(rules!) });
    setSaving(false);
    if (!r.ok) { setMsg({ tone: "error", text: String(r.data.error ?? "Couldn't save.") }); return; }
    setConflicts((r.data.conflicts as typeof conflicts) ?? []);
    setMsg({ tone: "ok", text: "Saved. New showings will only be booked inside these times." });
    await reload();
    setRules(null);
  }

  async function addException() {
    if (!exc.day) { setMsg({ tone: "error", text: "Pick a date." }); return; }
    const r = await teamPost({ action: "add_exception", day: exc.day, kind: exc.kind, start_min: exc.allDay ? 0 : exc.start, end_min: exc.allDay ? 1440 : exc.end });
    if (!r.ok) { setMsg({ tone: "error", text: String(r.data.error ?? "Couldn't add that.") }); return; }
    setConflicts((r.data.conflicts as typeof conflicts) ?? []);
    setExc({ ...exc, day: "" });
    reload();
  }

  return (
    <TeamShell>
      <H1>When are you free?</H1>
      <p className="mt-1 text-[15px]" style={{ color: MUTED }}>Showings are booked for you only inside these times. More times usually means more showings, but nothing is guaranteed.</p>

      {msg && <div className="mt-5"><Note tone={msg.tone}>{msg.text}</Note></div>}
      {conflicts.length > 0 && (
        <div className="mt-3">
          <Note tone="error">
            {conflicts.length === 1 ? "1 booked showing is" : `${conflicts.length} booked showings are`} now outside your times. {conflicts.length === 1 ? "It stays" : "They stay"} booked with you:
            {conflicts.map((c) => <div key={c.id} className="mt-1 font-semibold">{tDayShort(c.starts_at)}, {tTime(c.starts_at)} · {c.address}</div>)}
            <div className="mt-1 font-normal">If you can&apos;t do {conflicts.length === 1 ? "it" : "one"}, open it and tap &ldquo;I can&apos;t make this showing&rdquo;.</div>
          </Note>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <Label>Every week</Label>
        <span className="text-sm font-semibold" style={{ color: NAVY }}>{Math.round(weekly * 10) / 10} hours a week</span>
      </div>

      {rules.length === 0 && (
        <div className="mt-3 grid gap-2">
          <p className="text-sm" style={{ color: MUTED }}>Start with a common pattern, then adjust:</p>
          {PRESETS.map((p) => (
            <button key={p.label} type="button" onClick={() => setRules(merge([...rules, ...p.ranges]))} className="rounded-xl border-2 bg-white px-4 py-3 text-left text-[15px] font-semibold" style={{ borderColor: BORDER, color: NAVY }}>+ {p.label}</button>
          ))}
        </div>
      )}

      <div className="mt-3 grid gap-2.5">
        {DAYS.map((d) => {
          const mine = rules.filter((r) => r.weekday === d).sort((a, b) => a.start_min - b.start_min);
          return (
            <Box key={d} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-[16px]" style={{ color: mine.length ? NAVY : "#999" }}>{NAMES[d]}</span>
                {adding !== d && <button type="button" onClick={() => { setAdding(d); setDraft({ start: 17 * 60, end: 20 * 60 }); }} className="text-sm font-semibold px-3 py-1.5 rounded-lg" style={{ color: NAVY, background: "#F1EEE9" }}>+ Add time</button>}
              </div>
              {mine.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {mine.map((r) => (
                    <span key={`${r.start_min}`} className="inline-flex items-center gap-2 rounded-full pl-3.5 pr-1.5 py-1.5 text-sm font-semibold" style={{ background: NAVY, color: "#FAF8F5" }}>
                      {mm(r.start_min)} – {mm(r.end_min)}
                      <button type="button" aria-label="Remove" onClick={() => setRules(rules.filter((x) => x !== r))} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>×</button>
                    </span>
                  ))}
                </div>
              )}
              {adding === d && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <select value={draft.start} onChange={(e) => setDraft({ ...draft, start: Number(e.target.value) })} className="rounded-lg border px-3 py-2.5 text-[15px] bg-white" style={{ borderColor: BORDER }}>
                    {TIMES.slice(0, -1).map((t) => <option key={t} value={t}>{mm(t)}</option>)}
                  </select>
                  <span style={{ color: MUTED }}>to</span>
                  <select value={draft.end} onChange={(e) => setDraft({ ...draft, end: Number(e.target.value) })} className="rounded-lg border px-3 py-2.5 text-[15px] bg-white" style={{ borderColor: BORDER }}>
                    {TIMES.filter((t) => t > draft.start).map((t) => <option key={t} value={t}>{mm(t)}</option>)}
                  </select>
                  <button type="button" onClick={() => { if (draft.end > draft.start) setRules(merge([...rules, { weekday: d, start_min: draft.start, end_min: draft.end }])); setAdding(null); }} className="rounded-lg px-4 py-2.5 text-sm font-semibold" style={{ background: NAVY, color: "#FAF8F5" }}>Add</button>
                  <button type="button" onClick={() => setAdding(null)} className="px-2 py-2.5 text-sm" style={{ color: MUTED }}>Cancel</button>
                </div>
              )}
            </Box>
          );
        })}
      </div>

      {dirty && (
        <div className="sticky bottom-20 mt-5 z-10">
          <Primary disabled={saving} onClick={save}>{saving ? "Saving…" : "Save my weekly times"}</Primary>
        </div>
      )}

      <div className="mt-10"><Label>Time off and extra times</Label></div>
      <Box className="p-4 mt-3">
        <div className="grid grid-cols-2 gap-2">
          {(["off", "extra"] as const).map((k) => (
            <button key={k} type="button" onClick={() => setExc({ ...exc, kind: k })} className="rounded-xl border-2 py-2.5 text-sm font-semibold" style={{ borderColor: exc.kind === k ? NAVY : BORDER, background: exc.kind === k ? NAVY : "#fff", color: exc.kind === k ? "#FAF8F5" : NAVY }}>
              {k === "off" ? "I'm not free" : "I'm free extra"}
            </button>
          ))}
        </div>
        <input type="date" value={exc.day} onChange={(e) => setExc({ ...exc, day: e.target.value })} className="mt-3 w-full rounded-lg border px-3 py-2.5 text-[15px] bg-white" style={{ borderColor: BORDER }} />
        {exc.kind === "off" && (
          <label className="mt-3 flex items-center gap-2 text-sm" style={{ color: "#333" }}>
            <input type="checkbox" checked={exc.allDay} onChange={(e) => setExc({ ...exc, allDay: e.target.checked })} style={{ accentColor: NAVY }} /> All day
          </label>
        )}
        {(exc.kind === "extra" || !exc.allDay) && (
          <div className="mt-3 flex items-center gap-2">
            <select value={exc.start} onChange={(e) => setExc({ ...exc, start: Number(e.target.value) })} className="rounded-lg border px-3 py-2.5 text-[15px] bg-white" style={{ borderColor: BORDER }}>
              {TIMES.slice(0, -1).map((t) => <option key={t} value={t}>{mm(t)}</option>)}
            </select>
            <span style={{ color: MUTED }}>to</span>
            <select value={exc.end} onChange={(e) => setExc({ ...exc, end: Number(e.target.value) })} className="rounded-lg border px-3 py-2.5 text-[15px] bg-white" style={{ borderColor: BORDER }}>
              {TIMES.filter((t) => t > exc.start).map((t) => <option key={t} value={t}>{mm(t)}</option>)}
            </select>
          </div>
        )}
        <button type="button" onClick={addException} className="mt-3 w-full rounded-xl py-3 text-[15px] font-semibold" style={{ background: "#F1EEE9", color: NAVY }}>Add</button>
      </Box>

      {data.exceptions.length > 0 && (
        <div className="mt-3 grid gap-2">
          {data.exceptions.map((e) => (
            <Box key={e.id} className="px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-[15px]" style={{ color: e.kind === "off" ? BURGUNDY : "#2F6B3F" }}>{e.kind === "off" ? "Not free" : "Free extra"}</div>
                <div className="text-sm" style={{ color: "#333" }}>{tDayShort(`${e.day}T12:00:00-05:00`)} · {e.start_min === 0 && e.end_min === 1440 ? "all day" : `${mm(e.start_min)} – ${mm(e.end_min)}`}</div>
              </div>
              <button type="button" onClick={async () => { await teamPost({ action: "delete_exception", id: e.id }); reload(); }} className="text-sm px-3 py-2" style={{ color: MUTED }}>Remove</button>
            </Box>
          ))}
        </div>
      )}
    </TeamShell>
  );
}
