"use client";

import { useEffect, useState } from "react";
import { Button, ErrorNote, SuccessNote, C } from "@/components/admin/kit";
import SlotPicker from "@/components/fieldops/SlotPicker";
import { api, act, Panel, Label, input } from "./shared";

interface Home { id: string; address: string; rules: { booking_enabled: boolean } }

// Book a viewing yourself (phone call, walk-in), or send someone a private booking link.
export default function BookPanel({ onClose, onBooked }: { onClose: () => void; onBooked: (id: string) => void }) {
  const [homes, setHomes] = useState<Home[]>([]);
  const [home, setHome] = useState("");
  const [mode, setMode] = useState<"book" | "link">("book");
  const [slots, setSlots] = useState<string[] | null>(null);
  const [pick, setPick] = useState<string | null>(null);
  const [who, setWho] = useState({ name: "", phone: "", email: "" });
  const [notify, setNotify] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => { api<{ homes: Home[] }>("homes").then((d) => setHomes(d.homes)).catch((e) => setError(e.message)); }, []);
  useEffect(() => {
    if (!home) return;
    let live = true;
    api<{ slots: string[] }>("slots", `&property=${home}`).then((d) => { if (live) { setSlots(d.slots); setPick(null); } }).catch(() => live && setSlots([]));
    return () => { live = false; };
  }, [home]);

  async function submit() {
    setBusy(true); setError(null); setNotice(null);
    if (mode === "book") {
      const r = await act({ action: "book", property: home, start: pick, name: who.name, phone: who.phone, email: who.email, notify });
      setBusy(false);
      if (!r.ok) { setError(String(r.data.error)); return; }
      onBooked(String(r.data.appointmentId));
    } else {
      const r = await act({ action: "direct_booking_link", property: home, name: who.name, phone: who.phone, email: who.email, sendEmail: !!who.email });
      setBusy(false);
      if (!r.ok) { setError(String(r.data.error)); return; }
      const url = String(r.data.url);
      if (r.data.delivery === "sent") setNotice(`Emailed to ${who.email}.`);
      else { await navigator.clipboard.writeText(url).catch(() => null); setNotice(`Link copied. Text it to ${who.name}: ${url}`); }
    }
  }

  const selected = homes.find((h) => h.id === home);
  return (
    <Panel title="Book a viewing" onClose={onClose} width={560}>
      {error && <ErrorNote>{error}</ErrorNote>}
      {notice && <div style={{ marginBottom: 12 }}><SuccessNote>{notice}</SuccessNote></div>}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["book", "link"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: `1px solid ${mode === m ? C.navy : C.borderStrong}`, background: mode === m ? C.navy : "#fff", color: mode === m ? "#fff" : C.navy, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>
            {m === "book" ? "Pick the time myself" : "Let them pick (send a link)"}
          </button>
        ))}
      </div>

      <Label>Home</Label>
      <select value={home} onChange={(e) => setHome(e.target.value)} style={input}>
        <option value="">Choose a home…</option>
        {homes.map((h) => <option key={h.id} value={h.id}>{h.address}{h.rules.booking_enabled ? "" : " (self-booking off)"}</option>)}
      </select>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
        <div style={{ gridColumn: "1 / -1" }}><Label>Name</Label><input value={who.name} onChange={(e) => setWho({ ...who, name: e.target.value })} style={input} /></div>
        <div><Label>Phone</Label><input value={who.phone} onChange={(e) => setWho({ ...who, phone: e.target.value })} style={input} inputMode="tel" /></div>
        <div><Label>Email</Label><input value={who.email} onChange={(e) => setWho({ ...who, email: e.target.value })} style={input} inputMode="email" /></div>
      </div>

      {mode === "book" && home && (
        <div style={{ marginTop: 16 }}>
          <Label>Time {selected && !selected.rules.booking_enabled ? "(tenants can't book this home themselves, but you can)" : ""}</Label>
          {slots === null ? <div style={{ color: C.muted }}>Loading…</div> : slots.length ? <SlotPicker slots={slots} value={pick} onChange={setPick} compact /> : <div style={{ color: C.muted, fontSize: 14 }}>No specialist is free in this home&apos;s booking hours. Add availability in Specialists.</div>}
          <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12, fontSize: 14, color: C.text }}>
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} /> Email the tenant and specialist
          </label>
        </div>
      )}
      {mode === "link" && home && selected && !selected.rules.booking_enabled && (
        <div style={{ marginTop: 12, fontSize: 14, color: C.red }}>Turn on self-booking for this home first (Homes &amp; booking rules).</div>
      )}

      <div style={{ marginTop: 20 }}>
        <Button variant="primary" disabled={busy || !home || !who.name.trim() || (mode === "book" && !pick)} onClick={submit}>
          {busy ? "Working…" : mode === "book" ? "Book it" : who.email ? "Email the link" : "Copy the link"}
        </Button>
      </div>
    </Panel>
  );
}
