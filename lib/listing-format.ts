// "Available" labels for listings. Dates are stored as YYYY-MM-DD; read them as
// calendar days (not midnight UTC, which shows the day before in Ontario), and
// never show a date that has already passed.

const todayToronto = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Toronto" });

export function availabilityLabel(date: string | null | undefined, opts: { year?: boolean } = {}): string {
  const day = date?.slice(0, 10);
  if (!day || day <= todayToronto()) return "Available now";
  const d = new Date(`${day}T12:00:00Z`);
  return `Available ${d.toLocaleDateString("en-CA", { month: "short", day: "numeric", ...(opts.year ? { year: "numeric" } : {}), timeZone: "UTC" })}`;
}

/** Home type for display ("Apartment", "Semi detached"). Hides placeholder types like "other". */
export function typeLabel(t: string | null | undefined): string | null {
  const v = (t ?? "").trim().replace(/_/g, " ");
  if (!v || /^(other|unknown|n\/?a|none)$/i.test(v)) return null;
  return v.charAt(0).toUpperCase() + v.slice(1);
}
