"use client";

import { useState } from "react";
import { TeamShell, H1, Label, Box, Note, Pill, useTeam, tDayShort, money, NAVY, MUTED } from "../ui";

interface Row {
  id: string; kind: "showing" | "lease_bonus" | "adjustment"; amount: number; status: "pending" | "approved" | "paid" | "reversed";
  note: string | null; created_at: string; paid_at: string | null;
  fo_appointments: { starts_at: string; properties: { address: string } | null } | null;
}
interface Data { rows: Row[]; fee: number; payBasis: "household" | "visit"; bonus: number | null; upcoming: number }

const KIND = { showing: "Showing", lease_bonus: "Leasing bonus", adjustment: "Adjustment" };
const ST = {
  pending: { label: "Waiting for approval", tone: "amber" as const },
  approved: { label: "Approved", tone: "navy" as const },
  paid: { label: "Paid", tone: "green" as const },
  reversed: { label: "Reversed", tone: "grey" as const },
};

export default function EarningsPage() {
  const { data, error } = useTeam<Data>("earnings");
  const [filter, setFilter] = useState<"all" | Row["status"]>("all");
  if (error) return <TeamShell><Note tone="error">{error}</Note></TeamShell>;
  if (!data) return <TeamShell><div className="py-16 text-center" style={{ color: MUTED }}>Loading…</div></TeamShell>;

  const sum = (f: (r: Row) => boolean) => data.rows.filter(f).reduce((s, r) => s + Number(r.amount), 0);
  const pendingShow = sum((r) => r.status === "pending" && r.kind !== "lease_bonus");
  const pendingBonus = sum((r) => r.status === "pending" && r.kind === "lease_bonus");
  const approved = sum((r) => r.status === "approved");
  const paid = sum((r) => r.status === "paid");
  const rows = data.rows.filter((r) => filter === "all" || r.status === filter);

  return (
    <TeamShell>
      <H1>Your earnings</H1>
      <p className="mt-1 text-[15px]" style={{ color: MUTED }}>
        {money(data.fee)} per completed showing{data.payBasis === "visit" ? " visit (back-to-back showings at the same home count once)" : ""}. Ebin approves pay before it&apos;s paid.
      </p>

      <div className="grid grid-cols-2 gap-2.5 mt-6">
        <Box className="p-4"><div className="text-[26px] font-bold" style={{ color: NAVY }}>{money(paid)}</div><div className="text-sm" style={{ color: MUTED }}>Paid</div></Box>
        <Box className="p-4"><div className="text-[26px] font-bold" style={{ color: NAVY }}>{money(approved)}</div><div className="text-sm" style={{ color: MUTED }}>Approved, not paid yet</div></Box>
        <Box className="p-4"><div className="text-[26px] font-bold" style={{ color: NAVY }}>{money(pendingShow)}</div><div className="text-sm" style={{ color: MUTED }}>Waiting for approval</div></Box>
        <Box className="p-4">
          <div className="text-[26px] font-bold" style={{ color: MUTED }}>{data.upcoming}</div>
          <div className="text-sm" style={{ color: MUTED }}>Booked showings ahead (not earned yet)</div>
        </Box>
      </div>

      {data.bonus != null && (
        <Box className="p-4 mt-2.5">
          <div className="flex items-center justify-between"><Label>Leasing bonuses</Label><span className="font-bold" style={{ color: MUTED }}>{money(pendingBonus)} pending</span></div>
          <p className="text-sm mt-2" style={{ color: MUTED }}>{data.bonus}% of one month&apos;s rent when a tenant you showed signs the lease. It stays pending until the lease and first payment are confirmed, so it isn&apos;t earned yet.</p>
        </Box>
      )}

      <div className="mt-8 flex gap-2 overflow-x-auto pb-1">
        {(["all", "pending", "approved", "paid", "reversed"] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className="shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold" style={{ background: filter === f ? NAVY : "#fff", color: filter === f ? "#FAF8F5" : NAVY, border: `1px solid ${filter === f ? NAVY : "#D8D2C8"}` }}>
            {f === "all" ? "All" : ST[f].label}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-2">
        {rows.length === 0 && <p className="text-sm py-6 text-center" style={{ color: MUTED }}>Nothing here yet. Completed showings show up here.</p>}
        {rows.map((r) => (
          <Box key={r.id} className="px-4 py-3.5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold text-[15px] truncate" style={{ color: NAVY }}>{KIND[r.kind]}{r.fo_appointments?.properties ? ` · ${r.fo_appointments.properties.address}` : ""}</div>
              <div className="text-sm" style={{ color: MUTED }}>{tDayShort(r.fo_appointments?.starts_at ?? r.created_at)}{r.note ? ` · ${r.note}` : ""}</div>
              <div className="mt-1.5"><Pill tone={ST[r.status].tone}>{ST[r.status].label}</Pill></div>
            </div>
            <div className="text-[18px] font-bold shrink-0" style={{ color: r.status === "reversed" ? "#999" : NAVY, textDecoration: r.status === "reversed" ? "line-through" : undefined }}>{money(Number(r.amount))}</div>
          </Box>
        ))}
      </div>
    </TeamShell>
  );
}
