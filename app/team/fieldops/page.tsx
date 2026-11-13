"use client";

import Link from "next/link";
import { TeamShell, H1, Label, Box, Pill, Note, useTeam, tTime, relDay, NAVY, MUTED } from "../ui";

interface Session { id: string; address: string; unit: string | null; city: string; startsAt: string; count: number; prospects: string[]; state: "upcoming" | "now" | "needs_report" | "done"; unacknowledged: boolean }

const STATE: Record<Session["state"], { label: string; tone: "navy" | "amber" | "red" | "green" }> = {
  now: { label: "Happening now", tone: "amber" },
  upcoming: { label: "Booked", tone: "navy" },
  needs_report: { label: "Finish the report", tone: "red" },
  done: { label: "Done", tone: "green" },
};

function Card({ s }: { s: Session }) {
  return (
    <Link href={`/team/session/${s.id}`} className="block">
      <Box className="p-4 flex items-center gap-4">
        <div className="w-[76px] shrink-0">
          <div className="text-xs font-semibold" style={{ color: MUTED }}>{relDay(s.startsAt)}</div>
          <div className="text-[18px] font-bold" style={{ color: NAVY }}>{tTime(s.startsAt)}</div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold truncate capitalize" style={{ color: NAVY }}>{s.address}{s.unit ? `, ${s.unit}` : ""}</div>
          <div className="text-sm truncate" style={{ color: MUTED }}>{s.count} {s.count === 1 ? "prospect" : "prospects"} · {s.prospects.join(", ")}</div>
        </div>
        <span className="shrink-0">{s.unacknowledged && s.state === "upcoming" ? <Pill tone="red">New</Pill> : <Pill tone={STATE[s.state].tone}>{STATE[s.state].label}</Pill>}</span>
      </Box>
    </Link>
  );
}

// Every viewing: one home, the prospects booked back to back.
export default function FieldOps() {
  const { data, error } = useTeam<{ sessions: Session[] }>("fieldops");
  if (error) return <TeamShell><Note tone="error">{error}</Note></TeamShell>;
  if (!data) return <TeamShell><div className="py-16 text-center" style={{ color: MUTED }}>Loading…</div></TeamShell>;

  const order = { now: 0, needs_report: 1, upcoming: 2, done: 3 };
  const list = [...data.sessions].sort((a, b) => order[a.state] - order[b.state] || (a.state === "done" ? b.startsAt.localeCompare(a.startsAt) : a.startsAt.localeCompare(b.startsAt)));
  const active = list.filter((s) => s.state !== "done");
  const done = list.filter((s) => s.state === "done");

  return (
    <TeamShell>
      <H1>Field Ops</H1>
      <p className="mt-1 text-[15px]" style={{ color: MUTED }}>Open a viewing to prepare, check in each prospect and close it out.</p>
      <div className="mt-6 grid gap-2.5">
        {active.length ? active.map((s) => <Card key={s.id} s={s} />) : <Note>No viewings booked right now.</Note>}
      </div>
      {done.length > 0 && (
        <div className="mt-8">
          <Label>Done this week</Label>
          <div className="mt-3 grid gap-2.5">{done.map((s) => <Card key={s.id} s={s} />)}</div>
        </div>
      )}
    </TeamShell>
  );
}
