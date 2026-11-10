"use client";

import Link from "next/link";
import { TeamShell, H1, Label, Box, Pill, Note, STATUS, useTeam, tTime, relDay, money, NAVY, MUTED } from "./ui";

interface Showing { id: string; starts_at: string; ends_at: string; status: string; acknowledged: boolean; tenant_first: string; address: string; city: string }
const nowMs = () => Date.now();

interface Home {
  me: { name: string };
  showings: Showing[];
  hasAvailability: boolean;
  earnings: { pending: number; approved: number; paid: number; bonusPending: number };
}

export default function TeamHome() {
  const { data, error } = useTeam<Home>("home");
  if (error) return <TeamShell><Note tone="error">{error}</Note></TeamShell>;
  if (!data) return <TeamShell><div className="py-16 text-center" style={{ color: MUTED }}>Loading…</div></TeamShell>;

  const live = data.showings.filter((s) => ["confirmed", "in_progress", "reassignment_pending"].includes(s.status));
  const now = nowMs();
  const next = live.find((s) => new Date(s.ends_at).getTime() > now - 2 * 3_600_000);
  const rest = live.filter((s) => s !== next);
  const toClose = data.showings.filter((s) => ["confirmed", "in_progress"].includes(s.status) && new Date(s.ends_at).getTime() < now && s !== next);
  const first = data.me.name.split(/\s+/)[0];

  return (
    <TeamShell>
      <H1>Hi {first}.</H1>
      <p className="mt-1 text-[15px]" style={{ color: MUTED }}>
        {live.length ? `You have ${live.length} ${live.length === 1 ? "showing" : "showings"} coming up.` : "No showings booked right now."}
      </p>

      {!data.hasAvailability && (
        <Link href="/team/availability" className="block mt-5">
          <Note>Add the times you&apos;re free so showings can be booked with you. <b>Set my times →</b></Note>
        </Link>
      )}

      {next && (
        <Link href={`/team/showings/${next.id}`} className="block mt-6">
          <div className="rounded-2xl p-5" style={{ background: NAVY, color: "#FAF8F5" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ opacity: 0.7 }}>Next showing · {relDay(next.starts_at)}</span>
              {!next.acknowledged && next.status === "confirmed" && <Pill tone="red">New</Pill>}
              {next.status === "in_progress" && <Pill tone="amber">Happening now</Pill>}
            </div>
            <div className="text-[34px] font-bold mt-2 leading-none" style={{ fontFamily: "var(--font-cormorant)" }}>{tTime(next.starts_at)}</div>
            <div className="text-[17px] font-semibold mt-2">{next.address}</div>
            <div className="text-sm mt-0.5" style={{ opacity: 0.75 }}>{next.city} · with {next.tenant_first}</div>
            <div className="mt-4 rounded-xl py-3 text-center text-[15px] font-semibold" style={{ background: "#FAF8F5", color: NAVY }}>
              {!next.acknowledged && next.status === "confirmed" ? "Open and tap Got it" : next.status === "in_progress" ? "Continue the checklist" : "Open the showing"}
            </div>
          </div>
        </Link>
      )}

      {toClose.length > 0 && (
        <div className="mt-6">
          <Note tone="error">{toClose.length} past {toClose.length === 1 ? "showing needs" : "showings need"} a report. Open {toClose.length === 1 ? "it" : "them"} to finish.</Note>
        </div>
      )}

      {rest.length > 0 && (
        <div className="mt-8">
          <Label>Coming up</Label>
          <div className="mt-3 grid gap-2.5">
            {rest.map((s) => (
              <Link key={s.id} href={`/team/showings/${s.id}`} className="block min-w-0">
                <Box className="px-4 py-3.5 flex items-center gap-4">
                  <div className="w-[76px] shrink-0 whitespace-nowrap">
                    <div className="text-xs font-semibold" style={{ color: MUTED }}>{relDay(s.starts_at)}</div>
                    <div className="text-[17px] font-bold" style={{ color: NAVY }}>{tTime(s.starts_at)}</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate" style={{ color: NAVY }}>{s.address}</div>
                    <div className="text-sm" style={{ color: MUTED }}>with {s.tenant_first}</div>
                  </div>
                  <span className="shrink-0">{!s.acknowledged && s.status === "confirmed" ? <Pill tone="red">New</Pill> : <Pill tone={STATUS[s.status]?.tone}>{STATUS[s.status]?.label}</Pill>}</span>
                </Box>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Link href="/team/earnings" className="block mt-8">
        <Box className="p-5">
          <Label>Earnings</Label>
          <div className="grid grid-cols-3 gap-3 mt-3">
            {[["Waiting for approval", data.earnings.pending], ["Approved", data.earnings.approved], ["Paid", data.earnings.paid]].map(([k, v]) => (
              <div key={k as string}>
                <div className="text-[22px] font-bold" style={{ color: NAVY }}>{money(v as number)}</div>
                <div className="text-xs leading-snug" style={{ color: MUTED }}>{k}</div>
              </div>
            ))}
          </div>
        </Box>
      </Link>
    </TeamShell>
  );
}
