"use client";

import { useMemo, useState } from "react";

// Day chips + time grid. Used by the tenant booking page, the change-time
// page and the admin "book a viewing" form. All times shown in Toronto time.

const TZ = "America/Toronto";
const NAVY = "#1F2F3A";
const BORDER = "#D8D2C8";

const dayKey = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ });
const dayName = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ, weekday: "short" });
const dayNum = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ, month: "short", day: "numeric" });
export const timeLabel = (iso: string) => new Date(iso).toLocaleTimeString("en-CA", { timeZone: TZ, hour: "numeric", minute: "2-digit" }).replace(/\./g, "");
export const longDay = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ, weekday: "long", month: "long", day: "numeric" });

function part(iso: string) {
  const h = Number(new Date(iso).toLocaleTimeString("en-CA", { timeZone: TZ, hour: "numeric", hourCycle: "h23" }));
  return h < 12 ? "Morning" : h < 17 ? "Afternoon" : "Evening";
}

export default function SlotPicker({ slots, value, onChange, compact }: { slots: string[]; value: string | null; onChange: (iso: string) => void; compact?: boolean }) {
  const days = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const s of slots) m.set(dayKey(s), [...(m.get(dayKey(s)) ?? []), s]);
    return [...m.entries()];
  }, [slots]);
  const [day, setDay] = useState<string | null>(null);
  const active = day && days.some(([d]) => d === day) ? day : value ? dayKey(value) : days[0]?.[0] ?? null;
  const times = days.find(([d]) => d === active)?.[1] ?? [];
  const groups = ["Morning", "Afternoon", "Evening"].map((g) => [g, times.filter((t) => part(t) === g)] as const).filter(([, t]) => t.length);

  if (!slots.length) return null;
  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1" role="tablist" aria-label="Days">
        {days.map(([d, list]) => {
          const on = d === active;
          return (
            <button key={d} type="button" role="tab" aria-selected={on} onClick={() => setDay(d)}
              className="shrink-0 rounded-xl border-2 px-3 py-2.5 text-center transition-colors"
              style={{ minWidth: compact ? 72 : 82, borderColor: on ? NAVY : BORDER, background: on ? NAVY : "#fff", color: on ? "#FAF8F5" : NAVY }}>
              <div className="text-xs font-semibold uppercase tracking-wide" style={{ opacity: on ? 0.75 : 0.6 }}>{dayName(list[0])}</div>
              <div className="text-[15px] font-bold leading-tight">{dayNum(list[0])}</div>
              <div className="text-[11px] mt-0.5" style={{ opacity: on ? 0.75 : 0.55 }}>{list.length} {list.length === 1 ? "time" : "times"}</div>
            </button>
          );
        })}
      </div>
      <div className="mt-4 space-y-4">
        {groups.map(([g, list]) => (
          <div key={g}>
            <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#666" }}>{g}</div>
            <div className={`grid gap-2 ${compact ? "grid-cols-4" : "grid-cols-3 sm:grid-cols-4"}`}>
              {list.map((t) => {
                const on = t === value;
                return (
                  <button key={t} type="button" aria-pressed={on} onClick={() => onChange(t)}
                    className="rounded-lg border-2 py-3 text-[15px] font-semibold transition-colors"
                    style={{ borderColor: on ? NAVY : BORDER, background: on ? NAVY : "#fff", color: on ? "#FAF8F5" : NAVY }}>
                    {timeLabel(t)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** A tiny .ics file so people can add the viewing to their phone calendar. */
export function icsHref(o: { start: string; end: string; title: string; where: string }) {
  const f = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const body = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Prospera//FieldOps//EN", "BEGIN:VEVENT",
    `UID:${f(o.start)}-${Math.abs([...o.where].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7))}@prosperaproperties.co`,
    `DTSTAMP:${f(new Date().toISOString())}`, `DTSTART:${f(o.start)}`, `DTEND:${f(o.end)}`,
    `SUMMARY:${o.title}`, `LOCATION:${o.where}`, "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(body)}`;
}
