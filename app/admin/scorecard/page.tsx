"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, Tabs, Loading, ErrorNote, C, font } from "@/components/admin/kit";
import { haptic } from "@/lib/haptics";

// Daily sales scorecard. Each Toronto day is its own row, so there's nothing to reset:
// a new day starts at zero on its own. Taps save after a short pause and are copied to the Sheet.

const TARGETS = [10, 20, 50];

interface Day { day: string; target: number; outreaches: number; followups: number }
type SheetStatus = { ok: true; url: string } | { ok: false; reason: string; url?: string; shareWith?: string | null };

const shiftDay = (d: string, n: number) => {
  const t = new Date(`${d}T12:00:00Z`);
  t.setUTCDate(t.getUTCDate() + n);
  return t.toISOString().slice(0, 10);
};
const dayLabel = (d: string, today: string) =>
  d === today ? "Today" : d === shiftDay(today, -1) ? "Yesterday"
    : new Date(`${d}T12:00:00Z`).toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
const shortDay = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-CA", { month: "short", day: "numeric", timeZone: "UTC" });

export default function ScorecardPage() {
  const [screen, setScreen] = useState<"today" | "progress">("today");
  const [today, setToday] = useState<string | null>(null);
  const [days, setDays] = useState<Day[]>([]);
  const [day, setDay] = useState<string | null>(null);
  const [shareWith, setShareWith] = useState<string | null>(null);
  const [sheet, setSheet] = useState<SheetStatus | null>(null);
  const [saving, setSaving] = useState<"idle" | "waiting" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/scorecard");
    if (!res.ok) { setError("Couldn't load the scorecard. Refresh to try again."); return; }
    const d = await res.json();
    setToday(d.today);
    setDays(d.days);
    setShareWith(d.shareWith);
    setDay((cur) => cur ?? d.today);
    if (d.sheetUrl) setSheet((s) => s ?? { ok: true, url: d.sheetUrl });
  }, []);

  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, [load]);

  // Coming back to the app the next morning should land on the new day.
  useEffect(() => {
    const onShow = () => { if (document.visibilityState === "visible") { setDay(null); load(); } };
    document.addEventListener("visibilitychange", onShow);
    return () => document.removeEventListener("visibilitychange", onShow);
  }, [load]);

  // A day with no row yet starts at zero with the most recent target.
  const current: Day | null = useMemo(() => {
    if (!day) return null;
    const found = days.find((d) => d.day === day);
    if (found) return found;
    const prev = days.find((d) => d.day < day);
    return { day, target: prev?.target ?? 10, outreaches: 0, followups: 0 };
  }, [day, days]);

  const save = useCallback((next: Day) => {
    setDays((list) => [next, ...list.filter((d) => d.day !== next.day)].sort((a, b) => b.day.localeCompare(a.day)));
    setSaving("waiting");
    setError(null);
    if (timer.current) clearTimeout(timer.current);
    // Wait for a pause in tapping, then send the totals (not each tap), so nothing double-counts.
    timer.current = setTimeout(async () => {
      setSaving("saving");
      const res = await fetch("/api/admin/scorecard", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) }).catch(() => null);
      const d = await res?.json().catch(() => null);
      if (!res?.ok) { setSaving("idle"); setError(d?.error ?? "That didn't save. Check your connection and tap again."); return; }
      setSheet(d.sheet);
      setSaving("saved");
    }, 700);
  }, []);

  // Don't lose the last taps if the app is closed during the pause.
  useEffect(() => {
    const flush = () => {
      if (saving !== "waiting" || !current) return;
      navigator.sendBeacon?.("/api/admin/scorecard", new Blob([JSON.stringify(current)], { type: "application/json" }));
    };
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, [saving, current]);

  const set = (patch: Partial<Day>) => {
    if (!current) return;
    const next = { ...current, ...patch };
    // A stronger buzz the moment the target is reached; a light tick for everything else.
    haptic(current.outreaches < current.target && next.outreaches >= next.target ? "success" : "tap");
    save(next);
  };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px 80px", fontFamily: font }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: C.navy, margin: "0 0 16px" }}>Sales Scorecard</h1>
      <Tabs value={screen} onChange={setScreen} options={[{ value: "today", label: "Log" }, { value: "progress", label: "Progress" }]} />
      {error && <ErrorNote>{error}</ErrorNote>}
      {!today || !current ? <Loading /> : screen === "today" ? (
        <TodayScreen d={current} today={today} onDay={setDay} onChange={set} saving={saving} sheet={sheet} shareWith={shareWith} />
      ) : (
        <ProgressScreen days={days} today={today} />
      )}
    </div>
  );
}

function TodayScreen({ d, today, onDay, onChange, saving, sheet, shareWith }: {
  d: Day; today: string; onDay: (d: string) => void; onChange: (p: Partial<Day>) => void;
  saving: string; sheet: SheetStatus | null; shareWith: string | null;
}) {
  const pct = Math.min(100, Math.round((d.outreaches / d.target) * 100));
  const hit = d.outreaches >= d.target;
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <NavButton label="Previous day" icon="chevron_left" onClick={() => { haptic(); onDay(shiftDay(d.day, -1)); }} />
        <div style={{ fontSize: 16, fontWeight: 600, color: C.navy }}>{dayLabel(d.day, today)}</div>
        <NavButton label="Next day" icon="chevron_right" disabled={d.day >= today} onClick={() => { haptic(); onDay(shiftDay(d.day, 1)); }} />
      </div>

      <Card padding={22}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.muted }}>New outreaches vs. target</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 4 }}>
          <span style={{ fontSize: 44, fontWeight: 700, color: C.navy, lineHeight: 1.1 }}>{d.outreaches} / {d.target}</span>
          {hit && <span style={{ fontSize: 14, fontWeight: 600, color: C.green }}>✓ Target hit</span>}
        </div>
        <div role="progressbar" aria-valuemin={0} aria-valuemax={d.target} aria-valuenow={d.outreaches}
          style={{ height: 10, borderRadius: 999, background: C.greyBg, marginTop: 14, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: hit ? C.green : C.navy, transition: "width 0.2s" }} />
        </div>

        <div style={{ fontSize: 14, fontWeight: 600, color: C.muted, margin: "22px 0 8px" }}>Daily new outreach target</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, background: C.greyBg, borderRadius: 999, padding: 4 }}>
          {TARGETS.map((t) => (
            <button key={t} onClick={() => { if (d.target !== t) onChange({ target: t }); }} aria-pressed={d.target === t}
              style={{ border: 0, borderRadius: 999, padding: "10px 0", fontFamily: font, fontSize: 16, fontWeight: 600, cursor: "pointer",
                background: d.target === t ? C.navy : "transparent", color: d.target === t ? "#fff" : C.navy }}>
              {t}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18 }}>
          <Counter label="New outreaches" value={d.outreaches} onChange={(v) => onChange({ outreaches: v })} />
          <Counter label="Follow-ups" value={d.followups} onChange={(v) => onChange({ followups: v })} />
        </div>
      </Card>

      <div style={{ fontSize: 14, color: C.muted, marginTop: 12, minHeight: 20 }}>
        {saving === "waiting" || saving === "saving" ? "Saving…" : saving === "saved" ? "Saved" : "A new day starts at zero on its own."}
        {sheet?.ok && <> · <a href={sheet.url} target="_blank" rel="noreferrer" style={{ color: C.navy, fontWeight: 600 }}>Open Google Sheet</a></>}
      </div>
      {sheet && !sheet.ok && (
        <div style={{ fontSize: 14, color: C.amber, background: C.amberBg, borderRadius: 10, padding: "10px 14px", marginTop: 8 }}>
          Saved here, but not copied to the Google Sheet: {sheet.reason}
          {shareWith && <> Share the Sheet as an Editor with <strong style={{ wordBreak: "break-all" }}>{shareWith}</strong>.</>}
        </div>
      )}
    </>
  );
}

function Counter({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: C.muted }}>{label}</div>
      <div style={{ fontSize: 34, fontWeight: 700, color: C.navy, margin: "4px 0 10px" }}>{value}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 8 }}>
        <button aria-label={`Remove one ${label.toLowerCase()}`} disabled={value === 0} onClick={() => onChange(value - 1)}
          style={{ border: `1px solid ${C.borderStrong}`, background: C.surface, color: C.navy, borderRadius: 999, padding: "12px 0", fontSize: 20, fontFamily: font, cursor: "pointer", opacity: value === 0 ? 0.4 : 1 }}>
          −
        </button>
        <button aria-label={`Add one ${label.toLowerCase()}`} onClick={() => onChange(value + 1)}
          style={{ border: 0, background: C.navy, color: "#fff", borderRadius: 999, padding: "12px 0", fontSize: 18, fontWeight: 600, fontFamily: font, cursor: "pointer", touchAction: "manipulation" }}>
          + 1
        </button>
      </div>
    </div>
  );
}

function NavButton({ label, icon, onClick, disabled }: { label: string; icon: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button aria-label={label} onClick={onClick} disabled={disabled}
      style={{ border: `1px solid ${C.borderStrong}`, background: C.surface, color: C.navy, borderRadius: 999, width: 44, height: 44, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.35 : 1, display: "grid", placeItems: "center" }}>
      <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{icon}</span>
    </button>
  );
}

function ProgressScreen({ days, today }: { days: Day[]; today: string }) {
  const [range, setRange] = useState<"14" | "30" | "90">("30");
  const n = Number(range);

  // Every day in the range, oldest first. A day with nothing logged counts as zero.
  const series = useMemo(() => {
    const byDay = new Map(days.map((d) => [d.day, d]));
    return Array.from({ length: n }, (_, i) => {
      const key = shiftDay(today, i - n + 1);
      const d = byDay.get(key);
      return { day: key, label: shortDay(key), outreaches: d?.outreaches ?? 0, followups: d?.followups ?? 0, target: d?.target ?? null, logged: !!d };
    });
  }, [days, today, n]);

  const logged = series.filter((s) => s.logged);
  const hitDays = logged.filter((s) => s.target != null && s.outreaches >= s.target).length;
  let streak = 0;
  // Today still counts as in progress, so the streak runs from yesterday back unless today is already hit.
  for (let i = series.length - 1; i >= 0; i--) {
    const s = series[i];
    const hit = s.target != null && s.outreaches >= s.target;
    if (hit) streak++;
    else if (s.day === today) continue;
    else break;
  }
  const total = (k: "outreaches" | "followups") => series.reduce((a, s) => a + s[k], 0);

  return (
    <>
      <Tabs value={range} onChange={setRange} options={[{ value: "14", label: "14 days" }, { value: "30", label: "30 days" }, { value: "90", label: "90 days" }]} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Tile label="Days target hit" value={`${hitDays} of ${logged.length}`} hint={`${n - logged.length} days not logged`} />
        <Tile label="Current streak" value={`${streak} ${streak === 1 ? "day" : "days"}`} />
        <Tile label="New outreaches" value={String(total("outreaches"))} hint={`${(total("outreaches") / n).toFixed(1)} a day`} />
        <Tile label="Follow-ups" value={String(total("followups"))} hint={`${(total("followups") / n).toFixed(1)} a day`} />
      </div>

      <ChartCard title="New outreaches per day" note="The dashed line is that day's target.">
        <ComposedChart data={series} margin={{ top: 8, right: 4, bottom: 0, left: -24 }} barCategoryGap={2}>
          <CartesianGrid vertical={false} stroke={C.border} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: C.muted }} tickLine={false} axisLine={{ stroke: C.borderStrong }} interval="preserveStartEnd" minTickGap={24} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: C.muted }} tickLine={false} axisLine={false} />
          <Tooltip content={<Tip />} cursor={{ fill: C.greyBg }} />
          <Bar dataKey="outreaches" name="New outreaches" fill={C.navy} radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Line dataKey="target" name="Target" type="stepAfter" stroke={C.muted} strokeWidth={2} strokeDasharray="5 4" dot={false} connectNulls={false} isAnimationActive={false} />
        </ComposedChart>
      </ChartCard>

      <ChartCard title="Follow-ups per day">
        <BarChart data={series} margin={{ top: 8, right: 4, bottom: 0, left: -24 }} barCategoryGap={2}>
          <CartesianGrid vertical={false} stroke={C.border} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: C.muted }} tickLine={false} axisLine={{ stroke: C.borderStrong }} interval="preserveStartEnd" minTickGap={24} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: C.muted }} tickLine={false} axisLine={false} />
          <Tooltip content={<Tip />} cursor={{ fill: C.greyBg }} />
          <Bar dataKey="followups" name="Follow-ups" fill={C.navy} radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ChartCard>

      <Card padding={0} style={{ marginTop: 16, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ color: C.muted, textAlign: "left" }}>
              {["Day", "Outreaches", "Follow-ups", ""].map((h, i) => <th key={i} style={{ padding: "10px 14px", fontWeight: 600, borderBottom: `1px solid ${C.border}` }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {[...logged].reverse().slice(0, 14).map((s) => (
              <tr key={s.day}>
                <td style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, color: C.navy, fontWeight: 600 }}>{dayLabel(s.day, today)}</td>
                <td style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>{s.outreaches} / {s.target}</td>
                <td style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}` }}>{s.followups}</td>
                <td style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, color: C.green, fontWeight: 600 }}>{s.target != null && s.outreaches >= s.target ? "✓ Hit" : ""}</td>
              </tr>
            ))}
            {!logged.length && <tr><td colSpan={4} style={{ padding: 16, color: C.muted }}>Nothing logged in this range yet.</td></tr>}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function Tile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card padding={16}>
      <div style={{ fontSize: 14, color: C.muted, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: C.navy, marginTop: 2 }}>{value}</div>
      {hint && <div style={{ fontSize: 13, color: C.faint, marginTop: 2 }}>{hint}</div>}
    </Card>
  );
}

function ChartCard({ title, note, children }: { title: string; note?: string; children: React.ReactElement }) {
  return (
    <Card padding={16} style={{ marginTop: 16 }}>
      <div style={{ fontSize: 16, fontWeight: 600, color: C.navy }}>{title}</div>
      {note && <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{note}</div>}
      <div style={{ height: 220, marginTop: 10 }}>
        <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
      </div>
    </Card>
  );
}

function Tip({ active, payload }: { active?: boolean; payload?: { name: string; value: number | null; payload: { day: string; logged: boolean } }[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.borderStrong}`, borderRadius: 10, padding: "8px 12px", fontSize: 13, fontFamily: font, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <div style={{ fontWeight: 600, color: C.navy, marginBottom: 2 }}>{shortDay(p.day)}</div>
      {!p.logged ? <div style={{ color: C.muted }}>Nothing logged</div> : payload.filter((x) => x.value != null).map((x) => (
        <div key={x.name} style={{ color: C.text }}>{x.name}: <strong>{x.value}</strong></div>
      ))}
    </div>
  );
}
