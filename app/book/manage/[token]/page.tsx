"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SlotPicker, { icsHref, longDay, timeLabel } from "@/components/fieldops/SlotPicker";
import { BookShell, Burgundy, Err, Done } from "../../ui";

interface Data { name: string; address: string; city: string; starts_at: string; ends_at: string; status: string; changeable: boolean; slots: string[] }

export default function ManagePage() {
  const { token } = useParams() as { token: string };
  const [data, setData] = useState<Data | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "change" | "cancel">("view");
  const [pick, setPick] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<"moved" | "cancelled" | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/book/manage/${token}`, { cache: "no-store" });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setFatal(d.error ?? "This link isn't working."); return; }
    setData(d);
  }, [token]);
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, [load]);

  async function act(body: object, then: "moved" | "cancelled") {
    setBusy(true); setError(null);
    const res = await fetch(`/api/book/manage/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setError(d.error ?? "That didn't work. Try again."); setPick(null); load(); return; }
    setResult(then);
    load();
  }

  if (fatal) return <BookShell><Err title="This link isn't working" body={fatal} /></BookShell>;
  if (!data) return <BookShell><div className="py-20 text-center" style={{ color: "#666" }}>Loading…</div></BookShell>;
  const where = `${data.address}, ${data.city}`;

  if (result === "cancelled" || data.status === "cancelled") {
    return <BookShell><Err title="Your viewing is cancelled." body="Thanks for letting us know. If you'd like a new time, use the link in our email." /></BookShell>;
  }
  if (result === "moved") {
    return (
      <BookShell>
        <Done title="Your new time is set." when={`${longDay(data.starts_at)} at ${timeLabel(data.starts_at)}`} where={where}
          ics={icsHref({ start: data.starts_at, end: data.ends_at, title: `Viewing: ${data.address}`, where })} note="We emailed you the updated details." />
      </BookShell>
    );
  }
  if (!data.changeable) {
    return <BookShell><Err title="This viewing can't be changed now." body="It has already started or finished. Reply to our email if you need help." /></BookShell>;
  }

  return (
    <BookShell>
      <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#666" }}>Your viewing</div>
      <h1 className="text-[28px] font-bold leading-tight mt-1" style={{ fontFamily: "var(--font-cormorant)", color: "#1F2F3A" }}>
        {longDay(data.starts_at)}, {timeLabel(data.starts_at)}
      </h1>
      <p className="mt-1 text-[15px]" style={{ color: "#555" }}>{where}</p>
      {error && <div className="mt-5 rounded-lg px-4 py-3 text-sm font-medium" role="alert" style={{ background: "#F8EAEC", color: "#8B2030" }}>{error}</div>}

      {mode === "view" && (
        <div className="mt-8 grid gap-3">
          <button type="button" onClick={() => setMode("change")} className="w-full rounded border-2 py-4 text-sm font-semibold" style={{ borderColor: "#1F2F3A", color: "#1F2F3A" }}>Pick a different time</button>
          <button type="button" onClick={() => setMode("cancel")} className="text-sm font-medium underline underline-offset-4 py-2" style={{ color: "#555" }}>Cancel my viewing</button>
        </div>
      )}

      {mode === "change" && (
        <div className="mt-7">
          {data.slots.length ? <SlotPicker slots={data.slots} value={pick} onChange={setPick} /> : <p style={{ color: "#555" }}>No other open times right now. Your current time is still booked.</p>}
          <div className="mt-6 grid gap-3">
            {pick && <Burgundy disabled={busy} onClick={() => act({ action: "reschedule", start: pick }, "moved")}>{busy ? "Saving…" : `Move to ${timeLabel(pick)}, ${longDay(pick).split(",")[0]}`}</Burgundy>}
            <button type="button" onClick={() => { setMode("view"); setPick(null); }} className="text-sm font-medium py-2" style={{ color: "#555" }}>Keep my current time</button>
          </div>
        </div>
      )}

      {mode === "cancel" && (
        <div className="mt-8 rounded-2xl border bg-white p-5" style={{ borderColor: "#D8D2C8" }}>
          <div className="font-semibold" style={{ color: "#1F2F3A" }}>Cancel this viewing?</div>
          <p className="text-sm mt-1" style={{ color: "#555" }}>Your time will open up for someone else.</p>
          <div className="mt-4 grid gap-3">
            <Burgundy disabled={busy} onClick={() => act({ action: "cancel" }, "cancelled")}>{busy ? "Cancelling…" : "Yes, cancel it"}</Burgundy>
            <button type="button" onClick={() => setMode("view")} className="text-sm font-medium py-2" style={{ color: "#555" }}>No, keep it</button>
          </div>
        </div>
      )}
    </BookShell>
  );
}
