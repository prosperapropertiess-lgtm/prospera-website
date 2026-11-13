"use client";

// One viewing, start to finish: 1 Prepare → 2 Prospects (one checklist each) → 3 Close.
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TeamShell, H1, Label, Box, Pill, Note, Primary, Secondary, useTeam, teamPost, tTime, tDay, NAVY, MUTED, BORDER, BURGUNDY } from "../../ui";

type Attendance = "attended" | "no_show" | "cancelled" | "access_issue";
interface Feedback {
  attendance?: Attendance; name_confirmed?: boolean; move_in?: string; tour?: "self" | "guided";
  seen_count?: string; compare?: string; liked?: string; blocker?: string;
  interest?: "interested" | "unsure" | "not_interested"; main_concern?: string; questions?: string; comments?: string;
}
interface Prospect {
  id: string; name: string; phone: string | null; hasEmail: boolean; startsAt: string; status: string; done: boolean;
  moveIn: string | null; feedback: Feedback; application?: { sent_at: string | null; received: boolean };
}
interface Closing {
  likely_id?: string; likely_why?: string; repeated_concerns?: string; improve?: string; other?: string; condition?: string;
  secure?: Record<string, string>; secured?: boolean;
}
interface Session {
  id: string; key: string; startsAt: string; endsAt: string; completedAt: string | null;
  home: { address: string; unit: string | null; city: string; price: number; bedrooms: number | null; bathrooms: number | null; brief: string; occupied: boolean; access: string | null; accessOpensAt: string | null; notes: string | null };
  prep: Record<string, string>; closing: Closing; prospects: Prospect[];
}

const PREP = [
  ["arrived_early", "Arrive 15 minutes before the first prospect"],
  ["reviewed_list", "Review who's coming and their names"],
  ["blinds", "Open curtains and blinds for natural light"],
  ["windows", "Open windows if the weather allows"],
  ["freshener", "Light air freshener, only if needed"],
  ["lights", "Lights on, home ready to show"],
] as const;
const SECURE = [
  ["visitors_left", "All visitors have left"],
  ["windows_locked", "Windows closed and locked"],
  ["settings_restored", "Curtains, blinds and lights back to how they were"],
  ["doors_locked", "Doors locked"],
  ["keys_returned", "Keys returned, lockbox secured"],
] as const;
const ATTENDANCE: [Attendance, string][] = [["attended", "Attended"], ["no_show", "No-show"], ["cancelled", "Cancelled"], ["access_issue", "Access issue"]];
const QUESTIONS: [keyof Feedback, string][] = [
  ["seen_count", "How many properties have you seen so far?"],
  ["compare", "How does this property compare with the others you've seen?"],
  ["liked", "What do you like about this property?"],
  ["blocker", "Is there anything stopping you from submitting an application?"],
];

const prospectComplete = (p: Prospect) => p.done || (!!p.feedback.attendance && (p.feedback.attendance !== "attended" || (!!p.feedback.interest && !!p.feedback.seen_count && !!p.feedback.liked && !!p.feedback.blocker)));

export default function SessionPage() {
  const { id } = useParams() as { id: string };
  const { data, error, reload } = useTeam<Session>("session", `&id=${id}`);
  const [tab, setTab] = useState<"prep" | "prospects" | "close">("prep");
  const [open, setOpen] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ tone: "error" | "ok"; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [closing, setClosing] = useState<Closing>({});
  const [loadedClosing, setLoadedClosing] = useState(false);
  const [cant, setCant] = useState(false);
  const [reason, setReason] = useState("");

  // Start on the step that needs doing; keep a closing draft on this phone.
  useEffect(() => {
    if (!data || loadedClosing) return;
    const t = setTimeout(() => {
      setLoadedClosing(true);
      let draft: Closing = data.closing ?? {};
      try { const raw = localStorage.getItem(`close_${data.key}`); if (raw && !data.completedAt) draft = { ...draft, ...JSON.parse(raw) }; } catch {}
      setClosing(draft);
      const prepDone = PREP.every(([k]) => data.prep[k]);
      if (data.completedAt) setTab("close");
      else if (prepDone || Date.now() > new Date(data.startsAt).getTime()) setTab(data.prospects.every(prospectComplete) ? "close" : "prospects");
    }, 0);
    return () => clearTimeout(t);
  }, [data, loadedClosing]);
  useEffect(() => {
    if (!data || data.completedAt || !loadedClosing) return;
    try { localStorage.setItem(`close_${data.key}`, JSON.stringify(closing)); } catch {}
  }, [closing, data, loadedClosing]);

  if (error) return <TeamShell back="/team/fieldops"><Note tone="error">{error}</Note></TeamShell>;
  if (!data) return <TeamShell back="/team/fieldops"><div className="py-16 text-center" style={{ color: MUTED }}>Loading…</div></TeamShell>;

  const closed = !!data.completedAt;
  const prepDone = PREP.filter(([k]) => data.prep[k]).length;
  const doneCount = data.prospects.filter(prospectComplete).length;
  const map = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${data.home.address}, ${data.home.city}, ON`)}`;

  async function post(body: object, label: string, ok?: string) {
    setBusy(label); setMsg(null);
    const r = await teamPost({ id, ...body });
    setBusy(null);
    if (!r.ok) { setMsg({ tone: "error", text: String(r.data.error ?? "That didn't save. Try again.") }); return false; }
    if (ok) setMsg({ tone: "ok", text: ok });
    await reload();
    return true;
  }

  const steps: { key: typeof tab; label: string; status: string }[] = [
    { key: "prep", label: "Prepare", status: `${prepDone}/${PREP.length}` },
    { key: "prospects", label: "Prospects", status: `${doneCount}/${data.prospects.length}` },
    { key: "close", label: "Close", status: closed ? "Done" : "" },
  ];

  return (
    <TeamShell back="/team/fieldops" title={tDay(data.startsAt).split(",")[0]}>
      <H1>{data.home.address}{data.home.unit ? `, ${data.home.unit}` : ""}</H1>
      <p className="mt-1 text-[15px]" style={{ color: MUTED }}>
        {tDay(data.startsAt)} · {tTime(data.startsAt)}–{tTime(data.endsAt)} · {data.prospects.length} {data.prospects.length === 1 ? "prospect" : "prospects"}
      </p>
      {closed && <div className="mt-4"><Note tone="ok">Viewing complete. Report sent {tDay(data.completedAt!)} at {tTime(data.completedAt!)}.</Note></div>}

      {/* Steps */}
      <div className="grid grid-cols-3 gap-2 mt-5 sticky top-[57px] z-[5] py-2" style={{ background: "#F7F5F2" }}>
        {steps.map((s, i) => (
          <button key={s.key} type="button" onClick={() => setTab(s.key)} className="rounded-xl border-2 py-2.5 text-center"
            style={{ borderColor: tab === s.key ? NAVY : BORDER, background: tab === s.key ? NAVY : "#fff", color: tab === s.key ? "#FAF8F5" : NAVY }}>
            <div className="text-[13px] font-bold">{i + 1}. {s.label}</div>
            {s.status && <div className="text-xs" style={{ opacity: 0.75 }}>{s.status}</div>}
          </button>
        ))}
      </div>
      {msg && <div className="mt-3"><Note tone={msg.tone}>{msg.text}</Note></div>}

      {/* 1. Prepare */}
      {tab === "prep" && (
        <div className="grid gap-3 mt-4">
          {data.prospects.some((p) => p.status === "confirmed") && !closed && (
            <Box className="p-4 flex items-center justify-between gap-3">
              <span className="text-[15px]" style={{ color: NAVY }}>Confirm you&apos;ve got this viewing.</span>
              <button type="button" className="rounded-xl px-4 py-2.5 font-semibold text-sm" style={{ background: BURGUNDY, color: "#FAF8F5" }}
                onClick={() => post({ action: "ack_session" }, "ack", "Thanks. It's on your list.")}>Got it</button>
            </Box>
          )}

          <a href={data.home.brief} target="_blank" rel="noreferrer" className="block">
            <Box className="p-5 flex items-center justify-between gap-3">
              <div>
                <Label>Property brief</Label>
                <p className="mt-1 text-[15px]" style={{ color: "#222" }}>Rent, utilities, parking, appliances, what&apos;s nearby. The same page renters get.</p>
              </div>
              <span className="text-lg" style={{ color: MUTED }}>→</span>
            </Box>
          </a>

          <Box className="p-5">
            <div className="flex items-center justify-between gap-3">
              <Label>Getting in</Label>
              {data.home.occupied && <Pill tone="amber">Someone lives here</Pill>}
            </div>
            {data.home.access
              ? <p className="mt-2 text-[15px] whitespace-pre-wrap" style={{ color: "#222" }}>{data.home.access}</p>
              : <p className="mt-2 text-sm" style={{ color: MUTED }}>{data.home.accessOpensAt ? `Shows here from ${tDay(data.home.accessOpensAt)}, ${tTime(data.home.accessOpensAt)}.` : "No instructions added. Ask Ebin before you go."}</p>}
            <a href={map} target="_blank" rel="noreferrer" className="inline-block mt-3 text-sm font-semibold underline" style={{ color: NAVY }}>Directions</a>
          </Box>

          {data.home.notes && (
            <Box className="p-5">
              <Label>Talking points</Label>
              <p className="mt-2 text-[15px] whitespace-pre-wrap" style={{ color: "#222" }}>{data.home.notes}</p>
            </Box>
          )}

          <Box className="p-5">
            <Label>Who&apos;s coming ({data.prospects.length})</Label>
            <div className="mt-2 grid gap-1.5">
              {data.prospects.map((p) => (
                <div key={p.id} className="flex justify-between text-[15px]">
                  <span style={{ color: "#222" }}>{p.name}</span>
                  <span style={{ color: MUTED }}>{tTime(p.startsAt)}</span>
                </div>
              ))}
            </div>
          </Box>

          <div className="mt-2">
            <Label>Before the first prospect</Label>
            <div className="mt-3 grid gap-2">
              {PREP.map(([k, title]) => (
                <Tick key={k} on={!!data.prep[k]} disabled={closed || busy === k} onClick={() => post({ action: "prep", item: k }, k)} sub={data.prep[k] ? `Done at ${tTime(data.prep[k])}` : undefined}>{title}</Tick>
              ))}
              <p className="text-sm mt-1" style={{ color: MUTED }}>Note anything wrong with the home in the closing checklist.</p>
            </div>
          </div>
          {!closed && <div className="mt-3"><Primary onClick={() => setTab("prospects")}>Prospects are here →</Primary></div>}

          {!closed && (
            <div className="mt-4 text-center">
              {!cant
                ? <button type="button" onClick={() => setCant(true)} className="text-sm font-medium underline underline-offset-4 py-2" style={{ color: BURGUNDY }}>I can&apos;t make this viewing</button>
                : (
                  <Box className="p-5 text-left">
                    <div className="font-semibold" style={{ color: NAVY }}>Can&apos;t make it?</div>
                    <p className="text-sm mt-1" style={{ color: MUTED }}>We&apos;ll try to hand it to someone else right away and let Ebin know.</p>
                    <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="What happened? (a few words)" className="mt-3 w-full rounded-xl border p-3 text-[15px]" style={{ borderColor: BORDER }} />
                    <div className="mt-3 grid gap-2">
                      <Primary disabled={!reason.trim() || busy === "cant"} onClick={async () => {
                        setBusy("cant");
                        for (const p of data.prospects.filter((x) => ["confirmed", "in_progress"].includes(x.status))) await teamPost({ id: p.id, action: "unavailable", reason });
                        window.location.href = "/team/fieldops";
                      }}>Tell Ebin</Primary>
                      <Secondary onClick={() => setCant(false)}>Never mind</Secondary>
                    </div>
                  </Box>
                )}
            </div>
          )}
        </div>
      )}

      {/* 2. Prospects */}
      {tab === "prospects" && (
        <div className="grid gap-3 mt-4">
          <p className="text-[15px]" style={{ color: MUTED }}>One checklist per prospect. Open each one as they arrive.</p>
          {data.prospects.map((p) => (
            <ProspectCard key={p.id} p={p} open={open === p.id} onToggle={() => setOpen(open === p.id ? null : p.id)} locked={closed || p.done}
              onSaved={async (fb, label, ok) => post({ action: "prospect_save", id: p.id, feedback: fb }, label, ok)}
              onSend={async () => post({ action: "prospect_send_app", id: p.id }, `send-${p.id}`, `Thank-you and application link emailed to ${p.name.split(" ")[0]}.`)}
              busy={busy} />
          ))}
          {!closed && <div className="mt-2"><Primary onClick={() => setTab("close")} disabled={doneCount < data.prospects.length}>{doneCount < data.prospects.length ? `${data.prospects.length - doneCount} checklist${data.prospects.length - doneCount === 1 ? "" : "s"} left` : "Everyone's logged. Close the viewing →"}</Primary></div>}
        </div>
      )}

      {/* 3. Close */}
      {tab === "close" && (
        <CloseSection data={data} closing={closing} setClosing={setClosing} closed={closed} busy={busy === "close"}
          onSubmit={async () => {
            const ok = await post({ action: "session_close", closing }, "close", "Viewing complete. Your report went to Ebin. Thank you!");
            if (ok) { try { localStorage.removeItem(`close_${data.key}`); } catch {} window.scrollTo({ top: 0 }); }
          }} />
      )}
    </TeamShell>
  );
}

function Tick({ on, onClick, disabled, children, sub }: { on: boolean; onClick: () => void; disabled?: boolean; children: React.ReactNode; sub?: string }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className="w-full text-left rounded-2xl border-2 p-4 flex gap-3 items-center"
      style={{ borderColor: on ? "#CFE3D3" : BORDER, background: on ? "#F3F8F4" : "#fff" }}>
      <span className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-sm font-bold" style={{ background: on ? "#2F6B3F" : "#F1EEE9", color: on ? "#fff" : MUTED }}>{on ? "✓" : ""}</span>
      <span>
        <span className="block font-semibold text-[15px]" style={{ color: NAVY }}>{children}</span>
        {sub && <span className="block text-xs mt-0.5" style={{ color: MUTED }}>{sub}</span>}
      </span>
    </button>
  );
}

function Chip({ children, on, onClick, disabled }: { children: React.ReactNode; on: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} disabled={disabled}
      className="rounded-xl border-2 py-3 px-2 text-[14px] font-semibold transition-colors"
      style={{ borderColor: on ? NAVY : BORDER, background: on ? NAVY : "#fff", color: on ? "#FAF8F5" : NAVY }}>{children}</button>
  );
}

function Field({ label, value, onChange, disabled, rows = 2, placeholder }: { label: string; value?: string; onChange: (v: string) => void; disabled?: boolean; rows?: number; placeholder?: string }) {
  return (
    <label className="block">
      <span className="block text-[15px] font-semibold mb-1.5" style={{ color: NAVY }}>{label}</span>
      <textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} disabled={disabled} rows={rows} placeholder={placeholder}
        className="w-full rounded-xl border p-3 text-[15px] bg-white" style={{ borderColor: BORDER }} />
    </label>
  );
}

function ProspectCard({ p, open, onToggle, locked, onSaved, onSend, busy }: {
  p: Prospect; open: boolean; onToggle: () => void; locked: boolean; busy: string | null;
  onSaved: (fb: Feedback, label: string, ok?: string) => Promise<boolean>; onSend: () => Promise<boolean>;
}) {
  const [fb, setFb] = useState<Feedback>({ ...p.feedback, move_in: p.feedback.move_in ?? p.moveIn ?? "" });
  const [dirty, setDirty] = useState(false);
  const set = (patch: Partial<Feedback>) => { setFb((f) => ({ ...f, ...patch })); setDirty(true); };
  const attended = fb.attendance === "attended";
  const complete = prospectComplete({ ...p, feedback: fb });
  const state = p.done ? ["Submitted", "green"] : complete ? ["Logged", "green"] : fb.attendance ? ["In progress", "amber"] : ["Not started", "grey"];

  return (
    <Box className="overflow-hidden">
      <button type="button" onClick={onToggle} className="w-full p-4 flex items-center justify-between gap-3 text-left">
        <div className="min-w-0">
          <div className="font-semibold text-[16px] truncate" style={{ color: NAVY }}>{p.name}</div>
          <div className="text-sm" style={{ color: MUTED }}>{tTime(p.startsAt)}{p.phone ? <> · <a href={`tel:${p.phone}`} onClick={(e) => e.stopPropagation()} className="underline">{p.phone}</a></> : null}</div>
        </div>
        <Pill tone={state[1] as "green" | "amber" | "grey"}>{state[0]}</Pill>
      </button>
      {open && (
        <div className="px-4 pb-5 grid gap-5 border-t pt-4" style={{ borderColor: BORDER }}>
          <div>
            <div className="text-[15px] font-semibold mb-2" style={{ color: NAVY }}>Did they come?</div>
            <div className="grid grid-cols-2 gap-2">
              {ATTENDANCE.map(([v, l]) => <Chip key={v} on={fb.attendance === v} disabled={locked} onClick={() => set({ attendance: v })}>{l}</Chip>)}
            </div>
          </div>

          {attended && (
            <>
              <div className="rounded-xl p-4" style={{ background: "#F7F5F2" }}>
                <div className="text-sm font-semibold mb-2" style={{ color: NAVY }}>Welcome them</div>
                <p className="text-sm mb-3" style={{ color: "#333" }}>Open the door, welcome them and introduce yourself.</p>
                <Tick on={!!fb.name_confirmed} disabled={locked} onClick={() => set({ name_confirmed: !fb.name_confirmed })}>Name confirmed: {p.name}</Tick>
                <label className="block mt-3">
                  <span className="block text-sm font-semibold mb-1" style={{ color: NAVY }}>Their intended move-in date</span>
                  <input type="date" value={fb.move_in ?? ""} disabled={locked} onChange={(e) => set({ move_in: e.target.value })} className="w-full rounded-xl border p-3 text-[15px] bg-white" style={{ borderColor: BORDER }} />
                </label>
                <div className="text-sm font-semibold mt-4 mb-1" style={{ color: NAVY }}>Ask: &ldquo;Would you prefer to look around yourself, or would you like me to give you a tour?&rdquo;</div>
                <p className="text-xs mb-2" style={{ color: MUTED }}>Respect their choice. If they look on their own, stay nearby.</p>
                <div className="grid grid-cols-2 gap-2">
                  <Chip on={fb.tour === "self"} disabled={locked} onClick={() => set({ tour: "self" })}>On their own</Chip>
                  <Chip on={fb.tour === "guided"} disabled={locked} onClick={() => set({ tour: "guided" })}>Tour</Chip>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="text-sm font-semibold" style={{ color: NAVY }}>After they&apos;ve seen it, ask in this order. Write what they actually said.</div>
                {QUESTIONS.map(([k, q], i) => <Field key={k} label={`${i + 1}. “${q}”`} value={fb[k] as string} disabled={locked} onChange={(v) => set({ [k]: v })} rows={k === "seen_count" ? 1 : 2} />)}
              </div>

              <div>
                <div className="text-[15px] font-semibold mb-2" style={{ color: NAVY }}>Their interest</div>
                <div className="grid grid-cols-3 gap-2">
                  {([["interested", "Interested"], ["unsure", "Unsure"], ["not_interested", "Not interested"]] as const).map(([v, l]) => <Chip key={v} on={fb.interest === v} disabled={locked} onClick={() => set({ interest: v })}>{l}</Chip>)}
                </div>
              </div>
              <Field label="Main concern or reason for declining" value={fb.main_concern} disabled={locked} onChange={(v) => set({ main_concern: v })} rows={1} />
            </>
          )}

          {fb.attendance && !attended && <Note>Viewing questions don&apos;t apply. Add a note below if something happened.</Note>}

          {fb.attendance && (
            <>
              <Field label="Questions needing an answer from Ebin" value={fb.questions} disabled={locked} onChange={(v) => set({ questions: v })} placeholder="e.g. Can they bring a second cat? Is parking assigned?" />
              {attended && (
                <Box className="p-4">
                  <div className="text-[15px] font-semibold" style={{ color: NAVY }}>Application and thank-you</div>
                  <p className="text-sm mt-1" style={{ color: MUTED }}>One tap sends a thank-you from you, the property brief, and their personal application link.</p>
                  <div className="mt-3 grid gap-1 text-sm" style={{ color: "#333" }}>
                    <div>Application link sent: <b>{p.application?.sent_at ? `Yes, ${tTime(p.application.sent_at)}` : "No"}</b></div>
                    <div>Thank-you email sent: <b>{p.application?.sent_at ? "Yes" : "No"}</b></div>
                    <div>Completed application: <b>{p.application?.received ? "Yes" : "Not yet"}</b></div>
                  </div>
                  {!p.application?.sent_at && (
                    <div className="mt-3">
                      <Secondary disabled={!p.hasEmail || busy === `send-${p.id}`} onClick={async () => { if (dirty) await onSaved(fb, `save-${p.id}`); setDirty(false); await onSend(); }}>
                        {busy === `send-${p.id}` ? "Sending…" : p.hasEmail ? "Send application & thank-you" : "No email on file. Ask for one."}
                      </Secondary>
                    </div>
                  )}
                </Box>
              )}
              <Field label="Your comments" value={fb.comments} disabled={locked} onChange={(v) => set({ comments: v })} />
            </>
          )}

          {!locked && (
            <Primary disabled={busy === `save-${p.id}`} onClick={async () => { if (await onSaved(fb, `save-${p.id}`, `Saved ${p.name.split(" ")[0]}'s checklist.`)) { setDirty(false); onToggle(); } }}>
              {busy === `save-${p.id}` ? "Saving…" : complete ? "Save checklist" : "Save for now"}
            </Primary>
          )}
        </div>
      )}
    </Box>
  );
}

function CloseSection({ data, closing, setClosing, closed, busy, onSubmit }: {
  data: Session; closing: Closing; setClosing: (c: Closing) => void; closed: boolean; busy: boolean; onSubmit: () => void;
}) {
  const set = (patch: Partial<Closing>) => setClosing({ ...closing, ...patch });
  const att = (a: Attendance) => data.prospects.filter((p) => p.feedback.attendance === a).length;
  const allLogged = data.prospects.every(prospectComplete);
  const attended = data.prospects.filter((p) => p.feedback.attendance === "attended");
  const secure = closing.secure ?? {};
  const allSecure = SECURE.every(([k]) => secure[k]);

  return (
    <div className="grid gap-4 mt-4">
      <Box className="p-5">
        <Label>Attendance</Label>
        <div className="grid grid-cols-4 gap-2 mt-3 text-center">
          {[["Scheduled", data.prospects.length], ["Came", att("attended")], ["No-shows", att("no_show")], ["Cancelled", att("cancelled")]].map(([k, v]) => (
            <div key={k as string}><div className="text-[22px] font-bold" style={{ color: NAVY }}>{v}</div><div className="text-xs" style={{ color: MUTED }}>{k}</div></div>
          ))}
        </div>
        <div className="mt-3 text-sm" style={{ color: allLogged ? "#2F6B3F" : BURGUNDY }}>Checklist done for every prospect: <b>{allLogged ? "Yes" : "No"}</b></div>
      </Box>

      <div className="grid gap-4">
        <Label>Your feedback</Label>
        <div>
          <div className="text-[15px] font-semibold mb-2" style={{ color: NAVY }}>Who seems most likely to apply and move forward?</div>
          <div className="grid grid-cols-2 gap-2">
            {attended.map((p) => <Chip key={p.id} on={closing.likely_id === p.id} disabled={closed} onClick={() => set({ likely_id: p.id })}>{p.name}</Chip>)}
            <Chip on={closing.likely_id === "none"} disabled={closed} onClick={() => set({ likely_id: "none" })}>Nobody stood out</Chip>
          </div>
        </div>
        <Field label="What did they say or do that makes you think so?" value={closing.likely_why} disabled={closed} onChange={(v) => set({ likely_why: v })} />
        <Field label="Concerns or objections that came up more than once" value={closing.repeated_concerns} disabled={closed} onChange={(v) => set({ repeated_concerns: v })} />
        <Field label="What could make future viewings better?" value={closing.improve} disabled={closed} onChange={(v) => set({ improve: v })} />
        <Field label="Anything else?" value={closing.other} disabled={closed} onChange={(v) => set({ other: v })} />
        <Field label="Property condition or maintenance concerns" value={closing.condition} disabled={closed} onChange={(v) => set({ condition: v })} placeholder="e.g. Dripping tap in the bathroom, smoke alarm chirping" />
        <p className="text-xs" style={{ color: MUTED }}>Go by what they said: interest, plans to apply, and concerns left open. Ebin handles screening and approval.</p>
      </div>

      <div className="grid gap-2">
        <Label>Secure the property</Label>
        {SECURE.map(([k, title]) => (
          <Tick key={k} on={!!secure[k]} disabled={closed} onClick={() => { const s = { ...secure }; if (s[k]) delete s[k]; else s[k] = new Date().toISOString(); set({ secure: s }); }}>{title}</Tick>
        ))}
        <div className="text-[15px] font-semibold mt-3 mb-1" style={{ color: NAVY }}>Property secured and keys returned?</div>
        <div className="grid grid-cols-2 gap-2">
          <Chip on={closing.secured === true} disabled={closed || !allSecure} onClick={() => set({ secured: true })}>Yes</Chip>
          <Chip on={closing.secured === false} disabled={closed} onClick={() => set({ secured: false })}>No</Chip>
        </div>
        {!allSecure && closing.secured !== false && <p className="text-xs" style={{ color: MUTED }}>Tick every item above to answer Yes.</p>}
        {closing.secured === false && <Note tone="error">Call Ebin now at <a href="tel:5196971227" className="underline">(519) 697-1227</a>. Then submit so he has the report.</Note>}
      </div>

      {!closed && (
        <div className="mt-2">
          <Primary disabled={busy || !allLogged || closing.secured === undefined} onClick={onSubmit}>{busy ? "Sending…" : "Complete the viewing"}</Primary>
          <p className="text-xs text-center mt-2" style={{ color: MUTED }}>
            {!allLogged ? "Finish every prospect's checklist first." : closing.secured === undefined ? "Answer whether the property is secured." : "Sends your full report to Ebin."}
          </p>
        </div>
      )}
    </div>
  );
}
