"use client";

import Link from "next/link";
import { TeamShell, H1, Box, Note, useTeam, tTime, relDay, money, NAVY, MUTED, BURGUNDY } from "./ui";

interface Session { id: string; address: string; unit: string | null; city: string; startsAt: string; count: number; prospects: string[]; state: string; unacknowledged: boolean }

// Two ways in: Field Ops for showing homes, Dashboard for times and pay.
export default function TeamHome() {
  const { data, error } = useTeam<{ me: { name: string }; sessions: Session[] }>("fieldops");
  const { data: dash } = useTeam<{ earnings: { pending: number; approved: number }; hasAvailability: boolean }>("home");
  if (error) return <TeamShell><Note tone="error">{error}</Note></TeamShell>;
  if (!data) return <TeamShell><div className="py-16 text-center" style={{ color: MUTED }}>Loading…</div></TeamShell>;

  const next = data.sessions.find((s) => s.state === "now") ?? data.sessions.find((s) => s.state === "upcoming");
  const owed = data.sessions.filter((s) => s.state === "needs_report").length;
  const first = data.me.name.split(/\s+/)[0];

  return (
    <TeamShell>
      <H1>Hi {first}.</H1>
      <p className="mt-1 text-[15px]" style={{ color: MUTED }}>What are you doing today?</p>

      <Link href="/team/fieldops" className="block mt-6">
        <div className="rounded-2xl p-5" style={{ background: NAVY, color: "#FAF8F5" }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ opacity: 0.7 }}>Field Ops</span>
            {owed > 0 && <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: BURGUNDY }}>{owed} report{owed === 1 ? "" : "s"} due</span>}
          </div>
          {next ? (
            <>
              <div className="text-sm mt-3" style={{ opacity: 0.75 }}>Next viewing · {relDay(next.startsAt)}</div>
              <div className="text-[34px] font-bold leading-none mt-1" style={{ fontFamily: "var(--font-cormorant)" }}>{tTime(next.startsAt)}</div>
              <div className="text-[17px] font-semibold mt-2 capitalize">{next.address}{next.unit ? `, ${next.unit}` : ""}</div>
              <div className="text-sm mt-0.5" style={{ opacity: 0.75 }}>{next.count} {next.count === 1 ? "prospect" : "prospects"}: {next.prospects.join(", ")}</div>
            </>
          ) : (
            <div className="text-[17px] font-semibold mt-3">No viewings booked right now.</div>
          )}
          <div className="mt-4 rounded-xl py-3 text-center text-[15px] font-semibold" style={{ background: "#FAF8F5", color: NAVY }}>Open Field Ops</div>
        </div>
      </Link>

      <Link href="/team/dashboard" className="block mt-3">
        <Box className="p-5">
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: MUTED }}>Dashboard</div>
          <div className="text-[17px] font-semibold mt-2" style={{ color: NAVY }}>My times, calendar and earnings</div>
          {dash && (
            <div className="text-sm mt-1" style={{ color: MUTED }}>
              {money(dash.earnings.pending + dash.earnings.approved)} waiting to be paid{!dash.hasAvailability ? " · add your free times" : ""}
            </div>
          )}
        </Box>
      </Link>
    </TeamShell>
  );
}
