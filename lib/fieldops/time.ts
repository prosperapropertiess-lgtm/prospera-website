// Toronto wall-clock <-> UTC, safe across daylight-saving changes.
// Everything is stored in UTC; everything people see is Toronto time.

export const TZ = "America/Toronto";

const partsFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23", weekday: "short",
});
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface LocalParts { day: string; min: number; weekday: number }

/** Toronto calendar day, minute of day and weekday (0 = Sunday) for an instant. */
export function localParts(d: Date | number): LocalParts {
  const p = Object.fromEntries(partsFmt.formatToParts(new Date(d)).map((x) => [x.type, x.value]));
  return { day: `${p.year}-${p.month}-${p.day}`, min: Number(p.hour) * 60 + Number(p.minute), weekday: WEEKDAYS.indexOf(p.weekday) };
}

function offsetMs(utcMs: number) {
  const l = localParts(utcMs);
  const [y, m, d] = l.day.split("-").map(Number);
  return Date.UTC(y, m - 1, d, 0, l.min) - Math.floor(utcMs / 60_000) * 60_000;
}

/**
 * The UTC instant for a Toronto wall-clock time. Returns null for times that
 * don't exist (the skipped hour in spring). For the repeated hour in autumn
 * it returns the first one, so no slot is ever listed twice.
 */
export function zonedToUtc(day: string, min: number): Date | null {
  const [y, m, d] = day.split("-").map(Number);
  const wall = Date.UTC(y, m - 1, d, 0, min);
  const first = wall - offsetMs(wall);
  const second = wall - offsetMs(first);
  for (const t of [Math.min(first, second), Math.max(first, second)]) {
    const l = localParts(t);
    if (l.day === day && l.min === min) return new Date(t);
  }
  return null;
}

export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
}

export function weekdayOf(day: string): number {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export const todayToronto = () => localParts(Date.now()).day;

export function fmtTime(d: Date | string) {
  return new Date(d).toLocaleTimeString("en-CA", { timeZone: TZ, hour: "numeric", minute: "2-digit" }).replace(/\./g, "").replace(" ", " ");
}
export function fmtDay(d: Date | string) {
  return new Date(d).toLocaleDateString("en-CA", { timeZone: TZ, weekday: "long", month: "long", day: "numeric" });
}
export function fmtDayShort(d: Date | string) {
  return new Date(d).toLocaleDateString("en-CA", { timeZone: TZ, weekday: "short", month: "short", day: "numeric" });
}
export function minLabel(min: number) {
  const h = Math.floor(min / 60) % 24, m = min % 60;
  const ap = h < 12 ? "am" : "pm";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${h12}:${String(m).padStart(2, "0")}${ap}` : `${h12}${ap}`;
}
export const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
