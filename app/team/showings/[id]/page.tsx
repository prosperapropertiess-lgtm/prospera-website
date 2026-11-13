"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { TeamShell, H1, Label, Box, Pill, Note, Primary, Secondary, STATUS, useTeam, teamPost, tTime, tDay, NAVY, MUTED, BORDER, BURGUNDY } from "../../ui";

interface Showing {
  id: string; starts_at: string; ends_at: string; status: string; acknowledged: boolean;
  home: { address: string; city: string; bedrooms: number | null; bathrooms: number | null; price: number; latitude: number | null; longitude: number | null };
  tenant: { first: string; phone: string | null };
  highlights: string | null; brief?: string; occupied: boolean; access: string | null; accessOpensAt: string | null;
  checklist: { steps: Record<string, string>; outcome: string | null; completed_at: string | null } | null;
}

const STEPS = [
  { id: "reviewed", title: "Before you leave", body: "Read the access instructions and the talking points below." },
  { id: "arrived", title: "I'm here", body: "Arrive 10 to 15 minutes early. Tap when you're at the home." },
  { id: "prepared", title: "Home is ready", body: "Lights on, doors unlocked inside, blinds open, everything tidy." },
  { id: "shown", title: "Showed the home", body: "Welcome them, walk through, answer what you can. Never promise approval or change the price or terms." },
] as const;

const CONCERNS = ["Price", "Size", "Condition", "Location", "Parking", "Laundry", "Layout", "Utilities"];

export default function ShowingPage() {
  const { id } = useParams() as { id: string };
  const { data, error, reload } = useTeam<Showing>("showing", `&id=${id}`);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ tone: "error" | "ok"; text: string } | null>(null);
  const [cant, setCant] = useState(false);
  const [reason, setReason] = useState("");
  const [rep, setRep] = useState({ outcome: "showed", interest: "", concerns: [] as string[], secured: false, issue: "", notes: "", sendApplication: true });

  if (error) return <TeamShell back="/team"><Note tone="error">{error}</Note></TeamShell>;
  if (!data) return <TeamShell back="/team"><div className="py-16 text-center" style={{ color: MUTED }}>Loading…</div></TeamShell>;

  const steps = data.checklist?.steps ?? {};
  const live = ["confirmed", "in_progress"].includes(data.status);
  const closed = !live && data.status !== "reassignment_pending";
  const map = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${data.home.address}, ${data.home.city}, ON`)}`;
  const nextStep = STEPS.find((s) => !steps[s.id]);

  async function post(body: object, label: string, ok?: string) {
    setBusy(label); setMsg(null);
    const r = await teamPost({ id, ...body });
    setBusy(null);
    if (!r.ok) { setMsg({ tone: "error", text: String(r.data.error ?? "That didn't save. Try again.") }); return false; }
    if (ok) setMsg({ tone: "ok", text: ok });
    await reload();
    return true;
  }

  return (
    <TeamShell back="/team">
      <div className="flex items-center gap-2">
        <Pill tone={STATUS[data.status]?.tone}>{STATUS[data.status]?.label ?? data.status}</Pill>
        {data.occupied && <Pill tone="amber">Someone lives here</Pill>}
      </div>
      <H1>{tTime(data.starts_at)} · {data.home.address}</H1>
      <p className="mt-1 text-[15px]" style={{ color: MUTED }}>{tDay(data.starts_at)} · until {tTime(data.ends_at)}</p>

      <div className="grid grid-cols-2 gap-2.5 mt-5">
        <a href={map} target="_blank" rel="noopener noreferrer" className="rounded-xl border-2 py-3 text-center text-[15px] font-semibold bg-white" style={{ borderColor: BORDER, color: NAVY }}>Directions</a>
        {data.tenant.phone
          ? <a href={`tel:${data.tenant.phone.replace(/[^\d+]/g, "")}`} className="rounded-xl border-2 py-3 text-center text-[15px] font-semibold bg-white" style={{ borderColor: BORDER, color: NAVY }}>Call {data.tenant.first}</a>
          : <div className="rounded-xl border-2 py-3 text-center text-sm bg-white" style={{ borderColor: BORDER, color: "#999" }}>Phone shows the day before</div>}
      </div>

      {msg && <div className="mt-5"><Note tone={msg.tone}>{msg.text}</Note></div>}

      {live && !data.acknowledged && (
        <Box className="p-5 mt-6" style={{ borderColor: NAVY, borderWidth: 2 }}>
          <div className="font-semibold text-[17px]" style={{ color: NAVY }}>New showing for you</div>
          <p className="text-sm mt-1 mb-4" style={{ color: MUTED }}>Tap so we know you&apos;ve seen it.</p>
          <Primary disabled={busy === "ack"} onClick={() => post({ action: "ack" }, "ack", "Thanks. It's on your list.")}>{busy === "ack" ? "Saving…" : "Got it"}</Primary>
        </Box>
      )}

      <div className="grid gap-3 mt-6">
        <Box className="p-5">
          <Label>Getting in</Label>
          {data.access
            ? <p className="mt-2 text-[15px] whitespace-pre-wrap" style={{ color: "#222" }}>{data.access}</p>
            : <p className="mt-2 text-sm" style={{ color: MUTED }}>{data.accessOpensAt ? `Shows here from ${tDay(data.accessOpensAt)}, ${tTime(data.accessOpensAt)}.` : "No instructions added. Ask Ebin before you go."}</p>}
        </Box>
        {data.brief && (
          <a href={data.brief} target="_blank" rel="noreferrer" className="block">
            <Box className="p-5 flex items-center justify-between">
              <div>
                <Label>Property brief</Label>
                <p className="mt-1 text-[15px]" style={{ color: "#222" }}>Rent, utilities, parking, appliances. The same page the renter gets.</p>
              </div>
              <span className="text-lg" style={{ color: MUTED }}>→</span>
            </Box>
          </a>
        )}
        {data.highlights && (
          <Box className="p-5">
            <Label>Talking points</Label>
            <p className="mt-2 text-[15px] whitespace-pre-wrap" style={{ color: "#222" }}>{data.highlights}</p>
          </Box>
        )}
        <Box className="p-5">
          <Label>The home</Label>
          <p className="mt-2 text-[15px]" style={{ color: "#222" }}>
            ${data.home.price.toLocaleString("en-CA")}/month{data.home.bedrooms != null ? ` · ${data.home.bedrooms} bed` : ""}{data.home.bathrooms != null ? ` · ${data.home.bathrooms} bath` : ""}
          </p>
        </Box>
      </div>

      {live && (
        <div className="mt-8">
          <Label>Checklist</Label>
          <div className="mt-3 grid gap-2.5">
            {STEPS.map((s, i) => {
              const done = !!steps[s.id];
              const isNext = nextStep?.id === s.id;
              return (
                <button key={s.id} type="button" disabled={done || !!busy}
                  onClick={() => post({ action: "step", step: s.id }, s.id)}
                  className="w-full text-left rounded-2xl border-2 p-4 flex gap-4 items-start transition-colors"
                  style={{ borderColor: done ? "#CFE3D3" : isNext ? NAVY : BORDER, background: done ? "#F3F8F4" : "#fff" }}>
                  <span className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm font-bold" style={{ background: done ? "#2F6B3F" : isNext ? NAVY : "#F1EEE9", color: done || isNext ? "#fff" : MUTED }}>
                    {done ? "✓" : i + 1}
                  </span>
                  <span>
                    <span className="block font-semibold text-[16px]" style={{ color: NAVY }}>{s.title}</span>
                    <span className="block text-sm mt-0.5" style={{ color: MUTED }}>{done ? `Done at ${tTime(steps[s.id])}` : s.body}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <Box className="p-5 mt-6">
            <div className="font-semibold text-[17px]" style={{ color: NAVY }}>Finish and report</div>
            <div className="mt-4">
              <div className="text-sm font-semibold mb-2" style={{ color: NAVY }}>What happened?</div>
              <div className="grid grid-cols-2 gap-2">
                {[["showed", "Showed it"], ["no_show", "They didn't come"], ["tenant_cancelled_on_site", "They left early"], ["could_not_access", "Couldn't get in"]].map(([v, l]) => (
                  <Chip key={v} on={rep.outcome === v} onClick={() => setRep({ ...rep, outcome: v })}>{l}</Chip>
                ))}
              </div>
            </div>
            {rep.outcome === "showed" && (
              <>
                <div className="mt-5">
                  <div className="text-sm font-semibold mb-2" style={{ color: NAVY }}>How interested were they?</div>
                  <div className="grid grid-cols-4 gap-2">
                    {[["high", "Very"], ["medium", "Somewhat"], ["low", "A little"], ["none", "Not"]].map(([v, l]) => (
                      <Chip key={v} on={rep.interest === v} onClick={() => setRep({ ...rep, interest: v })}>{l}</Chip>
                    ))}
                  </div>
                </div>
                <div className="mt-5">
                  <div className="text-sm font-semibold mb-2" style={{ color: NAVY }}>Any concerns they mentioned?</div>
                  <div className="flex flex-wrap gap-2">
                    {CONCERNS.map((c) => {
                      const on = rep.concerns.includes(c);
                      return <Chip key={c} on={on} small onClick={() => setRep({ ...rep, concerns: on ? rep.concerns.filter((x) => x !== c) : [...rep.concerns, c] })}>{c}</Chip>;
                    })}
                  </div>
                </div>
              </>
            )}
            <label className="mt-5 flex items-center gap-3 rounded-xl border-2 p-4 cursor-pointer" style={{ borderColor: rep.secured ? "#2F6B3F" : BORDER, background: rep.secured ? "#F3F8F4" : "#fff" }}>
              <input type="checkbox" checked={rep.secured} onChange={(e) => setRep({ ...rep, secured: e.target.checked })} className="w-5 h-5" style={{ accentColor: "#2F6B3F" }} />
              <span className="font-semibold text-[15px]" style={{ color: NAVY }}>Home is locked and keys are back</span>
            </label>
            <textarea value={rep.issue} onChange={(e) => setRep({ ...rep, issue: e.target.value })} placeholder="Anything wrong at the home? (leak, damage, lockbox problem)" rows={2}
              className="mt-3 w-full rounded-xl border p-3 text-[15px]" style={{ borderColor: BORDER }} />
            <textarea value={rep.notes} onChange={(e) => setRep({ ...rep, notes: e.target.value })} placeholder="Notes for Ebin (optional)" rows={2}
              className="mt-2 w-full rounded-xl border p-3 text-[15px]" style={{ borderColor: BORDER }} />
            {rep.outcome === "showed" && (
              <label className="mt-3 flex items-center gap-3 text-sm" style={{ color: "#333" }}>
                <input type="checkbox" checked={rep.sendApplication} onChange={(e) => setRep({ ...rep, sendApplication: e.target.checked })} className="w-4 h-4" style={{ accentColor: NAVY }} />
                Email them the thank-you and application link
              </label>
            )}
            <div className="mt-5">
              <Primary disabled={busy === "complete" || (rep.outcome === "showed" && !rep.interest)} onClick={async () => {
                const ok = await post({ action: "complete", report: { ...rep, interest: rep.interest || null, issue: rep.issue || null, notes: rep.notes || null } }, "complete");
                if (ok) setMsg({ tone: "ok", text: "Report sent. Thank you!" });
              }}>{busy === "complete" ? "Sending…" : "Send report"}</Primary>
              {rep.outcome === "showed" && !rep.interest && <p className="text-xs mt-2 text-center" style={{ color: MUTED }}>Pick how interested they were.</p>}
            </div>
          </Box>

          <div className="mt-6 text-center">
            {!cant
              ? <button type="button" onClick={() => setCant(true)} className="text-sm font-medium underline underline-offset-4 py-2" style={{ color: BURGUNDY }}>I can&apos;t make this showing</button>
              : (
                <Box className="p-5 text-left">
                  <div className="font-semibold" style={{ color: NAVY }}>Can&apos;t make it?</div>
                  <p className="text-sm mt-1" style={{ color: MUTED }}>We&apos;ll try to hand it to someone else right away and let Ebin know.</p>
                  <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="What happened? (a few words)" className="mt-3 w-full rounded-xl border p-3 text-[15px]" style={{ borderColor: BORDER }} />
                  <div className="mt-3 grid gap-2">
                    <Primary disabled={!reason.trim() || busy === "cant"} onClick={async () => {
                      const r = await teamPost({ id, action: "unavailable", reason });
                      if (r.ok) window.location.href = "/team"; else setMsg({ tone: "error", text: String(r.data.error ?? "Couldn't send that.") });
                    }}>Tell Ebin</Primary>
                    <Secondary onClick={() => setCant(false)}>Never mind</Secondary>
                  </div>
                </Box>
              )}
          </div>
        </div>
      )}

      {closed && data.checklist?.completed_at && (
        <div className="mt-6"><Note tone="ok">Report sent {tDay(data.checklist.completed_at)} at {tTime(data.checklist.completed_at)}.</Note></div>
      )}
    </TeamShell>
  );
}

function Chip({ children, on, onClick, small }: { children: React.ReactNode; on: boolean; onClick: () => void; small?: boolean }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick}
      className={`rounded-xl border-2 ${small ? "px-3.5 py-2 text-sm" : "py-3 text-[14px]"} font-semibold transition-colors`}
      style={{ borderColor: on ? NAVY : BORDER, background: on ? NAVY : "#fff", color: on ? "#FAF8F5" : NAVY }}>{children}</button>
  );
}
