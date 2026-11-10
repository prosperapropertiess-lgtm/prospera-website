"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import SlotPicker, { icsHref, longDay, timeLabel } from "@/components/fieldops/SlotPicker";
import { BookShell, Burgundy, HomeCard, Err, Done } from "../ui";

interface Data {
  name: string;
  home: { address: string; city: string; price: number; bedrooms: number | null; bathrooms: number | null; image: string | null; utilities_included: boolean | null };
  duration: number;
  paused: boolean;
  slots: string[];
  booked: { starts_at: string; ends_at: string; manage: string } | null;
  expires_at: string;
}

export default function BookPage() {
  const { token } = useParams() as { token: string };
  const [data, setData] = useState<Data | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);
  const [pick, setPick] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ start: string; manage: string } | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/book/${token}`, { cache: "no-store" });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setFatal(d.error ?? "This link isn't working."); return; }
    setData(d);
  }, [token]);
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, [load]);

  async function confirm() {
    if (!pick) return;
    setBusy(true); setError(null);
    const res = await fetch(`/api/book/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ start: pick }) });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) { setDone({ start: pick, manage: d.manage }); return; }
    setError(d.error ?? "That didn't work. Try again.");
    setPick(null);
    load();
  }

  if (fatal) return <BookShell><Err title="This link isn't working" body={fatal} /></BookShell>;
  if (!data) return <BookShell><div className="py-20 text-center" style={{ color: "#666" }}>Loading times…</div></BookShell>;

  const where = `${data.home.address}, ${data.home.city}`;
  if (done || data.booked) {
    const start = done?.start ?? data.booked!.starts_at;
    const end = data.booked?.ends_at ?? new Date(new Date(start).getTime() + data.duration * 60_000).toISOString();
    return (
      <BookShell>
        <Done title="You're booked." when={`${longDay(start)} at ${timeLabel(start)}`} where={where}
          ics={icsHref({ start, end, title: `Viewing: ${data.home.address}`, where })}
          manage={done?.manage ?? data.booked!.manage}
          note={done ? "We emailed you a confirmation. A Prospera showing specialist will meet you at the home." : "You already have this viewing booked."} />
      </BookShell>
    );
  }

  return (
    <BookShell>
      <HomeCard home={data.home} />
      <h1 className="text-[28px] font-bold leading-tight mt-7" style={{ fontFamily: "var(--font-cormorant)", color: "#1F2F3A" }}>
        Hi {data.name}, pick a time to see it.
      </h1>
      <p className="mt-2 text-[15px]" style={{ color: "#555" }}>Viewings take about {data.duration} minutes. Times are Toronto time.</p>

      {error && <div className="mt-5 rounded-lg px-4 py-3 text-sm font-medium" role="alert" style={{ background: "#F8EAEC", color: "#8B2030" }}>{error}</div>}

      <div className="mt-6">
        {data.paused || !data.slots.length ? (
          <div className="rounded-xl border bg-white px-5 py-6 text-center" style={{ borderColor: "#D8D2C8" }}>
            <div className="font-semibold" style={{ color: "#1F2F3A" }}>{data.paused ? "Viewings for this home are paused right now." : "No open times right now."}</div>
            <p className="mt-1 text-sm" style={{ color: "#666" }}>New times open up as our team adds availability. Check back later, or reply to our email and we&apos;ll help.</p>
          </div>
        ) : (
          <SlotPicker slots={data.slots} value={pick} onChange={setPick} />
        )}
      </div>

      <div className="h-28" />
      {pick && (
        <div className="fixed inset-x-0 bottom-0 border-t bg-white/95 backdrop-blur px-5 py-4" style={{ borderColor: "#D8D2C8" }}>
          <div className="max-w-xl mx-auto">
            <div className="text-sm mb-2" style={{ color: "#555" }}><b style={{ color: "#1F2F3A" }}>{longDay(pick)}</b> at <b style={{ color: "#1F2F3A" }}>{timeLabel(pick)}</b></div>
            <Burgundy onClick={confirm} disabled={busy}>{busy ? "Booking…" : "Book this time"}</Burgundy>
          </div>
        </div>
      )}
    </BookShell>
  );
}
