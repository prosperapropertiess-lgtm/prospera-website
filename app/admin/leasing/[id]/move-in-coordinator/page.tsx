"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import SignaturePad from "@/components/ui/SignaturePad";

const BG = "#F7F5F2";
const SURFACE = "#FFFFFF";
const BORDER = "#D8D2C8";
const TEXT = "#222222";
const TEXT_SEC = "#666666";
const TEXT_MUT = "#999999";
const ACCENT = "#8B2030";
const NAVY = "#1F2F3A";
const GREEN = "#2D7A4F";
const AMBER = "#B45309";

type Condition = "good" | "existing_damage" | "needs_attention" | "not_inspected" | "not_applicable";
const CONDITIONS: { value: Condition; label: string; color: string }[] = [
  { value: "good", label: "Good", color: GREEN },
  { value: "existing_damage", label: "Existing Damage", color: ACCENT },
  { value: "needs_attention", label: "Needs Attention", color: AMBER },
  { value: "not_applicable", label: "N/A", color: TEXT_MUT },
];

interface Photo { url: string; path: string }
interface Item { id: string; room_id: string; label: string; condition: Condition; notes: string | null; repair_needed: boolean; photos: Photo[] }
interface Room { id: string; session_id: string; name: string; sort_order: number; items: Item[] }
interface Appliance { id: string; session_id: string; name: string; location: string | null; cosmetic_condition: Condition; test_status: "working" | "issue" | "not_tested"; brand: string | null; model: string | null; serial_number: string | null; photos: Photo[] }
interface KeyRow { id: string; session_id: string; item_name: string; quantity: number }
interface WelcomeGuide {
  property_id: string; garbage_instructions: string | null; parking_details: string | null; mailbox_details: string | null;
  utility_info: string | null; appliance_instructions: string | null; maintenance_contact: string | null;
  emergency_contact: string | null; other_notes: string | null; internal_notes: string | null;
}
interface Signature { id: string; report_version: number; signer_name: string; signer_role: "tenant" | "inspector"; signed_at: string }
interface Doc { id: string; doc_type: string; report_version: number; file_url: string }
interface Session {
  id: string; campaign_id: string; property_id: string | null; application_id: string | null;
  inspector_name: string | null; move_in_date: string | null; status: "draft" | "awaiting_signatures" | "completed";
  report_version: number; meter_readings: { utility: string; reading: string }[];
}
interface State {
  campaign: { id: string; owner_name: string | null; owner_email: string | null; property: { id: string; title: string | null; address: string | null; city: string | null; name: string | null } };
  session: Session;
  application: { id: string; legal_name: string | null; email: string | null; phone: string | null } | null;
  rooms: Room[];
  appliances: Appliance[];
  keys: KeyRow[];
  welcomeGuide: WelcomeGuide | null;
  signatures: Signature[];
  documents: Doc[];
}

type Step = "start" | "rooms" | "appliances" | "guide" | "review" | "done";
const STEPS: { id: Step; label: string }[] = [
  { id: "start", label: "Start" },
  { id: "rooms", label: "Rooms" },
  { id: "appliances", label: "Appliances & Keys" },
  { id: "guide", label: "Welcome Guide" },
  { id: "review", label: "Review & Sign" },
];

const inputStyle: React.CSSProperties = { fontSize: 15, padding: "12px 14px", borderRadius: 10, border: `1px solid ${BORDER}`, backgroundColor: BG, color: TEXT, fontFamily: "inherit" };
const bigButton = (bg: string, color = "#FFFFFF"): React.CSSProperties => ({ backgroundColor: bg, color, fontSize: 15, fontWeight: 700, padding: "16px 24px", borderRadius: 12, border: "none", cursor: "pointer" });

export default function MoveInCoordinatorPage() {
  const { id: campaignId } = useParams<{ id: string }>();
  const [state, setState] = useState<State | null>(null);
  const [step, setStep] = useState<Step>("start");
  const [saveTag, setSaveTag] = useState<"idle" | "saving" | "saved">("idle");

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/leasing/properties/${campaignId}/move-in`);
    if (res.ok) setState(await res.json());
  }, [campaignId]);

  useEffect(() => { load(); }, [load]);

  const flash = () => {
    setSaveTag("saving");
    setTimeout(() => setSaveTag("saved"), 350);
    setTimeout(() => setSaveTag("idle"), 1800);
  };

  if (!state) {
    return <div style={{ minHeight: "100vh", backgroundColor: BG, display: "flex", alignItems: "center", justifyContent: "center", color: TEXT_MUT }}>Loading…</div>;
  }

  const { campaign, session } = state;
  const address = campaign.property?.address || campaign.property?.title || campaign.property?.name || "Property";
  const stepIdx = STEPS.findIndex((s) => s.id === step);

  return (
    <div style={{ backgroundColor: BG, minHeight: "100vh", fontFamily: "var(--font-dm-sans, sans-serif)" }}>
      {/* Header — sticky, always-reachable progress + save state */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, backgroundColor: SURFACE, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "14px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <Link href={`/admin/leasing/${campaignId}`} style={{ color: TEXT_MUT, fontSize: 13, textDecoration: "none" }}>← Back to Campaign</Link>
            <span style={{ fontSize: 12, color: saveTag === "idle" ? "transparent" : GREEN, fontWeight: 600 }}>
              {saveTag === "saving" ? "Saving…" : saveTag === "saved" ? "✓ Saved" : ""}
            </span>
          </div>
          <h1 style={{ fontSize: 19, fontWeight: 700, color: TEXT, margin: "0 0 12px" }}>{address}</h1>
          {step !== "done" && (
            <div style={{ display: "flex", gap: 6 }}>
              {STEPS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setStep(s.id)}
                  style={{
                    flex: 1, padding: "10px 4px", borderRadius: 8, border: "none", cursor: "pointer",
                    backgroundColor: i === stepIdx ? NAVY : i < stepIdx ? "#E5EDE8" : "#F0EEEB",
                    color: i === stepIdx ? "#FFFFFF" : i < stepIdx ? GREEN : TEXT_MUT,
                    fontSize: 12, fontWeight: 700, textAlign: "center",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px" }}>
        {step === "start" && <StartStep state={state} onSaved={(s) => { setState({ ...state, session: s }); flash(); }} onNext={() => setStep("rooms")} />}
        {step === "rooms" && <RoomsStep campaignId={campaignId} state={state} setState={setState} onSaved={flash} onNext={() => setStep("appliances")} />}
        {step === "appliances" && <AppliancesStep campaignId={campaignId} state={state} setState={setState} onSaved={flash} onNext={() => setStep("guide")} />}
        {step === "guide" && <GuideStep campaignId={campaignId} state={state} setState={setState} onSaved={flash} onNext={() => setStep("review")} />}
        {step === "review" && <ReviewStep campaignId={campaignId} state={state} setState={setState} onFinished={() => setStep("done")} />}
        {step === "done" && <DoneStep state={state} campaignId={campaignId} />}
      </div>
    </div>
  );
}

// ── Step 1: Start ────────────────────────────────────────────────────────
function StartStep({ state, onSaved, onNext }: { state: State; onSaved: (s: Session) => void; onNext: () => void }) {
  const [inspector, setInspector] = useState(state.session.inspector_name ?? "");
  const [moveInDate, setMoveInDate] = useState(state.session.move_in_date ?? new Date().toISOString().split("T")[0]);
  const [meters, setMeters] = useState<{ utility: string; reading: string }[]>(state.session.meter_readings ?? []);
  const [saving, setSaving] = useState(false);

  async function save(andNext: boolean) {
    setSaving(true);
    const res = await fetch(`/api/admin/leasing/properties/${state.campaign.id}/move-in/session`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: state.session.id, inspector_name: inspector, move_in_date: moveInDate, meter_readings: meters }),
    });
    setSaving(false);
    if (res.ok) { onSaved(await res.json()); if (andNext) onNext(); }
  }

  return (
    <Card>
      <SectionTitle>Start This Move-In</SectionTitle>
      <p style={{ fontSize: 13, color: TEXT_SEC, margin: "0 0 20px" }}>
        {state.application?.legal_name || "Tenant"} · Owner: {state.campaign.owner_name || "—"}
      </p>
      <Field label="Inspector Name">
        <input value={inspector} onChange={(e) => setInspector(e.target.value)} style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} placeholder="Your name" />
      </Field>
      <Field label="Move-In Date">
        <input type="date" value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)} style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
      </Field>
      <Field label="Meter Readings (optional)">
        {meters.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input value={m.utility} onChange={(e) => setMeters(meters.map((x, j) => j === i ? { ...x, utility: e.target.value } : x))} placeholder="Hydro / Gas / Water" style={{ ...inputStyle, flex: 1 }} />
            <input value={m.reading} onChange={(e) => setMeters(meters.map((x, j) => j === i ? { ...x, reading: e.target.value } : x))} placeholder="Reading" style={{ ...inputStyle, width: 120 }} />
            <button onClick={() => setMeters(meters.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: ACCENT, cursor: "pointer" }}>✕</button>
          </div>
        ))}
        <button onClick={() => setMeters([...meters, { utility: "", reading: "" }])} style={{ ...smallGhostButton }}>+ Add Meter Reading</button>
      </Field>
      <button onClick={() => save(true)} disabled={saving} style={{ ...bigButton(ACCENT), width: "100%", marginTop: 12 }}>
        {saving ? "Saving…" : "Continue to Rooms →"}
      </button>
    </Card>
  );
}

// ── Step 2: Rooms ────────────────────────────────────────────────────────
function RoomsStep({ campaignId, state, setState, onSaved, onNext }: { campaignId: string; state: State; setState: (s: State) => void; onSaved: () => void; onNext: () => void }) {
  const [activeRoom, setActiveRoom] = useState(state.rooms[0]?.id ?? null);
  const [newRoomName, setNewRoomName] = useState("");
  const [newItemLabel, setNewItemLabel] = useState("");
  const room = state.rooms.find((r) => r.id === activeRoom) ?? null;

  async function addRoom() {
    if (!newRoomName.trim()) return;
    const res = await fetch(`/api/admin/leasing/properties/${campaignId}/move-in/rooms`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: state.session.id, name: newRoomName }),
    });
    if (res.ok) {
      const created = await res.json();
      setState({ ...state, rooms: [...state.rooms, created] });
      setActiveRoom(created.id);
      setNewRoomName("");
    }
  }

  async function removeRoom(roomId: string) {
    if (!confirm("Remove this room and all its items?")) return;
    await fetch(`/api/admin/leasing/properties/${campaignId}/move-in/rooms/${roomId}`, { method: "DELETE" });
    const rooms = state.rooms.filter((r) => r.id !== roomId);
    setState({ ...state, rooms });
    if (activeRoom === roomId) setActiveRoom(rooms[0]?.id ?? null);
  }

  async function addItem() {
    if (!room || !newItemLabel.trim()) return;
    const res = await fetch(`/api/admin/leasing/properties/${campaignId}/move-in/items`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId: room.id, label: newItemLabel }),
    });
    if (res.ok) {
      const item = await res.json();
      setState({ ...state, rooms: state.rooms.map((r) => r.id === room.id ? { ...r, items: [...r.items, item] } : r) });
      setNewItemLabel("");
    }
  }

  function updateItemLocal(itemId: string, patch: Partial<Item>) {
    setState({
      ...state,
      rooms: state.rooms.map((r) => ({ ...r, items: r.items.map((it) => it.id === itemId ? { ...it, ...patch } : it) })),
    });
  }

  async function saveItem(itemId: string, patch: Partial<Item>) {
    updateItemLocal(itemId, patch);
    await fetch(`/api/admin/leasing/properties/${campaignId}/move-in/items/${itemId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch),
    });
    onSaved();
  }

  async function removeItem(itemId: string) {
    await fetch(`/api/admin/leasing/properties/${campaignId}/move-in/items/${itemId}`, { method: "DELETE" });
    setState({ ...state, rooms: state.rooms.map((r) => ({ ...r, items: r.items.filter((it) => it.id !== itemId) })) });
  }

  async function uploadPhoto(itemId: string, file: File) {
    const fd = new FormData();
    fd.append("photo", file);
    fd.append("targetType", "item");
    fd.append("targetId", itemId);
    const res = await fetch(`/api/admin/leasing/properties/${campaignId}/move-in/photos`, { method: "POST", body: fd });
    if (res.ok) {
      const { photos } = await res.json();
      updateItemLocal(itemId, { photos });
      onSaved();
    }
  }

  return (
    <div>
      {/* Room tabs — current room always obvious */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 10, marginBottom: 16 }}>
        {state.rooms.map((r) => {
          const done = r.items.length > 0 && r.items.every((it) => it.condition !== "not_inspected");
          return (
            <button key={r.id} onClick={() => setActiveRoom(r.id)} style={{
              flexShrink: 0, padding: "12px 18px", borderRadius: 10, border: `2px solid ${activeRoom === r.id ? NAVY : BORDER}`,
              backgroundColor: activeRoom === r.id ? NAVY : SURFACE, color: activeRoom === r.id ? "#FFFFFF" : TEXT,
              fontWeight: 700, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap",
            }}>
              {done ? "✓ " : ""}{r.name}
            </button>
          );
        })}
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
          <input value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} placeholder="New room…" style={{ ...inputStyle, width: 130, padding: "10px 12px" }} />
          <button onClick={addRoom} style={{ ...smallGhostButton }}>+ Add</button>
        </div>
      </div>

      {room ? (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <SectionTitle>{room.name}</SectionTitle>
            <button onClick={() => removeRoom(room.id)} style={{ fontSize: 12, color: ACCENT, background: "none", border: "none", cursor: "pointer" }}>Remove Room</button>
          </div>

          {room.items.map((item) => (
            <div key={item.id} style={{ borderTop: `1px solid ${BORDER}`, padding: "16px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{item.label}</span>
                <button onClick={() => removeItem(item.id)} style={{ background: "none", border: "none", color: TEXT_MUT, cursor: "pointer", fontSize: 13 }}>✕</button>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                {CONDITIONS.map((c) => (
                  <button key={c.value} onClick={() => saveItem(item.id, { condition: c.value })} style={{
                    padding: "8px 14px", borderRadius: 20, border: `2px solid ${item.condition === c.value ? c.color : BORDER}`,
                    backgroundColor: item.condition === c.value ? c.color : SURFACE, color: item.condition === c.value ? "#FFFFFF" : TEXT_SEC,
                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                  }}>
                    {c.label}
                  </button>
                ))}
              </div>
              <textarea
                value={item.notes ?? ""} onChange={(e) => updateItemLocal(item.id, { notes: e.target.value })}
                onBlur={(e) => saveItem(item.id, { notes: e.target.value })}
                placeholder="Notes / required repairs…" rows={2}
                style={{ ...inputStyle, width: "100%", boxSizing: "border-box", marginBottom: 8, resize: "vertical" }}
              />
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, cursor: "pointer" }}>
                <input type="checkbox" checked={item.repair_needed} onChange={(e) => saveItem(item.id, { repair_needed: e.target.checked })} style={{ width: 16, height: 16, accentColor: ACCENT }} />
                <span style={{ fontSize: 13, color: TEXT }}>Repair needed</span>
              </label>
              <PhotoStrip photos={item.photos} onAdd={(file) => uploadPhoto(item.id, file)} />
            </div>
          ))}

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <input value={newItemLabel} onChange={(e) => setNewItemLabel(e.target.value)} placeholder="e.g. Walls, Flooring, Windows…" style={{ ...inputStyle, flex: 1 }} onKeyDown={(e) => e.key === "Enter" && addItem()} />
            <button onClick={addItem} style={{ ...bigButton(NAVY), padding: "12px 20px" }}>+ Add Item</button>
          </div>
        </Card>
      ) : (
        <Card><p style={{ color: TEXT_MUT }}>Add a room to get started.</p></Card>
      )}

      <button onClick={onNext} style={{ ...bigButton(ACCENT), width: "100%", marginTop: 20 }}>Continue to Appliances & Keys →</button>
    </div>
  );
}

function PhotoStrip({ photos, onAdd }: { photos: Photo[]; onAdd: (file: File) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
      {photos.map((p, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src={p.url} alt="" style={{ width: 72, height: 72, borderRadius: 8, objectFit: "cover", flexShrink: 0, border: `1px solid ${BORDER}` }} />
      ))}
      <button onClick={() => fileRef.current?.click()} style={{ width: 72, height: 72, borderRadius: 8, border: `2px dashed ${BORDER}`, backgroundColor: BG, color: TEXT_MUT, fontSize: 24, cursor: "pointer", flexShrink: 0 }}>
        +
      </button>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onAdd(f); e.target.value = ""; }} />
    </div>
  );
}

// ── Step 3: Appliances & Keys ────────────────────────────────────────────
function AppliancesStep({ campaignId, state, setState, onSaved, onNext }: { campaignId: string; state: State; setState: (s: State) => void; onSaved: () => void; onNext: () => void }) {
  const [newAppliance, setNewAppliance] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newKeyQty, setNewKeyQty] = useState("1");

  async function addAppliance() {
    if (!newAppliance.trim()) return;
    const res = await fetch(`/api/admin/leasing/properties/${campaignId}/move-in/appliances`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: state.session.id, name: newAppliance }),
    });
    if (res.ok) { setState({ ...state, appliances: [...state.appliances, await res.json()] }); setNewAppliance(""); }
  }

  function updateApplianceLocal(id: string, patch: Partial<Appliance>) {
    setState({ ...state, appliances: state.appliances.map((a) => a.id === id ? { ...a, ...patch } : a) });
  }
  async function saveAppliance(id: string, patch: Partial<Appliance>) {
    updateApplianceLocal(id, patch);
    await fetch(`/api/admin/leasing/properties/${campaignId}/move-in/appliances/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    onSaved();
  }
  async function removeAppliance(id: string) {
    await fetch(`/api/admin/leasing/properties/${campaignId}/move-in/appliances/${id}`, { method: "DELETE" });
    setState({ ...state, appliances: state.appliances.filter((a) => a.id !== id) });
  }
  async function uploadAppliancePhoto(id: string, file: File) {
    const fd = new FormData();
    fd.append("photo", file); fd.append("targetType", "appliance"); fd.append("targetId", id);
    const res = await fetch(`/api/admin/leasing/properties/${campaignId}/move-in/photos`, { method: "POST", body: fd });
    if (res.ok) { const { photos } = await res.json(); updateApplianceLocal(id, { photos }); onSaved(); }
  }

  async function addKey() {
    if (!newKey.trim()) return;
    const res = await fetch(`/api/admin/leasing/properties/${campaignId}/move-in/keys`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: state.session.id, item_name: newKey, quantity: Number(newKeyQty) || 1 }),
    });
    if (res.ok) { setState({ ...state, keys: [...state.keys, await res.json()] }); setNewKey(""); setNewKeyQty("1"); }
  }
  async function removeKey(id: string) {
    await fetch(`/api/admin/leasing/properties/${campaignId}/move-in/keys/${id}`, { method: "DELETE" });
    setState({ ...state, keys: state.keys.filter((k) => k.id !== id) });
  }

  return (
    <div>
      <Card>
        <SectionTitle>Appliances</SectionTitle>
        {state.appliances.map((a) => (
          <div key={a.id} style={{ borderTop: `1px solid ${BORDER}`, padding: "16px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{a.name}</span>
              <button onClick={() => removeAppliance(a.id)} style={{ background: "none", border: "none", color: TEXT_MUT, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUT, alignSelf: "center", marginRight: 4 }}>CONDITION</span>
              {CONDITIONS.map((c) => (
                <button key={c.value} onClick={() => saveAppliance(a.id, { cosmetic_condition: c.value })} style={{
                  padding: "6px 12px", borderRadius: 16, border: `2px solid ${a.cosmetic_condition === c.value ? c.color : BORDER}`,
                  backgroundColor: a.cosmetic_condition === c.value ? c.color : SURFACE, color: a.cosmetic_condition === c.value ? "#FFF" : TEXT_SEC, fontSize: 11, fontWeight: 700, cursor: "pointer",
                }}>{c.label}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUT, alignSelf: "center", marginRight: 4 }}>TESTED</span>
              {(["working", "issue", "not_tested"] as const).map((t) => (
                <button key={t} onClick={() => saveAppliance(a.id, { test_status: t })} style={{
                  padding: "6px 12px", borderRadius: 16, border: `2px solid ${a.test_status === t ? NAVY : BORDER}`,
                  backgroundColor: a.test_status === t ? NAVY : SURFACE, color: a.test_status === t ? "#FFF" : TEXT_SEC, fontSize: 11, fontWeight: 700, cursor: "pointer",
                }}>{t === "not_tested" ? "Not Tested" : t === "working" ? "Working" : "Issue Observed"}</button>
              ))}
            </div>
            <PhotoStrip photos={a.photos} onAdd={(f) => uploadAppliancePhoto(a.id, f)} />
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <input value={newAppliance} onChange={(e) => setNewAppliance(e.target.value)} placeholder="e.g. Fridge, Stove, Dishwasher…" style={{ ...inputStyle, flex: 1 }} onKeyDown={(e) => e.key === "Enter" && addAppliance()} />
          <button onClick={addAppliance} style={{ ...bigButton(NAVY), padding: "12px 20px" }}>+ Add</button>
        </div>
      </Card>

      <Card>
        <SectionTitle>Keys, Fobs & Remotes</SectionTitle>
        {state.keys.map((k) => (
          <div key={k.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: `1px solid ${BORDER}` }}>
            <span style={{ fontSize: 14 }}>{k.item_name} — Qty {k.quantity}</span>
            <button onClick={() => removeKey(k.id)} style={{ background: "none", border: "none", color: TEXT_MUT, cursor: "pointer" }}>✕</button>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="e.g. Front door key" style={{ ...inputStyle, flex: 1 }} />
          <input value={newKeyQty} onChange={(e) => setNewKeyQty(e.target.value)} type="number" min={1} style={{ ...inputStyle, width: 70 }} />
          <button onClick={addKey} style={{ ...bigButton(NAVY), padding: "12px 20px" }}>+ Add</button>
        </div>
      </Card>

      <button onClick={onNext} style={{ ...bigButton(ACCENT), width: "100%", marginTop: 4 }}>Continue to Welcome Guide →</button>
    </div>
  );
}

// ── Step 4: Welcome Guide ────────────────────────────────────────────────
const GUIDE_FIELDS: { key: keyof WelcomeGuide; label: string; placeholder: string }[] = [
  { key: "garbage_instructions", label: "Garbage & Recycling", placeholder: "Collection day, bin locations…" },
  { key: "parking_details", label: "Parking", placeholder: "Spot number, visitor parking rules…" },
  { key: "mailbox_details", label: "Mailbox", placeholder: "Location, key info…" },
  { key: "utility_info", label: "Utilities", placeholder: "What's included, how to set up accounts…" },
  { key: "appliance_instructions", label: "Appliance Instructions", placeholder: "Anything unusual about how appliances work…" },
  { key: "maintenance_contact", label: "Maintenance & Emergency Contact", placeholder: "Who to call, and when…" },
  { key: "other_notes", label: "Other Notes (shared with tenant)", placeholder: "" },
];

function GuideStep({ campaignId, state, setState, onSaved, onNext }: { campaignId: string; state: State; setState: (s: State) => void; onSaved: () => void; onNext: () => void }) {
  const [guide, setGuide] = useState<Partial<WelcomeGuide>>(state.welcomeGuide ?? {});
  const [saving, setSaving] = useState(false);
  const propertyId = state.session.property_id;

  async function save(andNext: boolean) {
    if (!propertyId) { if (andNext) onNext(); return; }
    setSaving(true);
    const res = await fetch(`/api/admin/leasing/properties/${campaignId}/move-in/welcome-guide`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ propertyId, ...guide }),
    });
    setSaving(false);
    if (res.ok) { const saved = await res.json(); setState({ ...state, welcomeGuide: saved }); onSaved(); if (andNext) onNext(); }
  }

  return (
    <Card>
      <SectionTitle>Welcome Guide</SectionTitle>
      <p style={{ fontSize: 13, color: TEXT_SEC, margin: "0 0 20px" }}>Saved once per property — reused automatically for every future tenancy here.</p>
      {GUIDE_FIELDS.map((f) => (
        <Field key={f.key} label={f.label}>
          <textarea value={(guide[f.key] as string) ?? ""} onChange={(e) => setGuide({ ...guide, [f.key]: e.target.value })} placeholder={f.placeholder} rows={2} style={{ ...inputStyle, width: "100%", boxSizing: "border-box", resize: "vertical" }} />
        </Field>
      ))}
      <Field label="Internal Notes — staff only, never shared with tenants or owners">
        <textarea value={guide.internal_notes ?? ""} onChange={(e) => setGuide({ ...guide, internal_notes: e.target.value })} rows={2}
          style={{ ...inputStyle, width: "100%", boxSizing: "border-box", resize: "vertical", backgroundColor: "#FFF7ED", borderColor: "#FBBF24" }} />
      </Field>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => save(false)} disabled={saving} style={{ ...bigButton(SURFACE, NAVY), border: `2px solid ${BORDER}`, flex: 1 }}>{saving ? "Saving…" : "Save"}</button>
        <button onClick={() => save(true)} disabled={saving} style={{ ...bigButton(ACCENT), flex: 2 }}>Continue to Review & Sign →</button>
      </div>
    </Card>
  );
}

// ── Step 5: Review & Sign ────────────────────────────────────────────────
function ReviewStep({ campaignId, state, setState, onFinished }: { campaignId: string; state: State; setState: (s: State) => void; onFinished: () => void }) {
  const [inspectorSig, setInspectorSig] = useState<string | null>(null);
  const [inspectorName, setInspectorName] = useState(state.session.inspector_name ?? "");
  const [tenantSig, setTenantSig] = useState<string | null>(null);
  const [tenantName, setTenantName] = useState(state.application?.legal_name ?? "");
  const [signing, setSigning] = useState<"inspector" | "tenant" | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState("");

  const version = state.session.report_version;
  const inspectorSigned = state.signatures.some((s) => s.signer_role === "inspector" && s.report_version === version);
  const tenantSigned = state.signatures.filter((s) => s.signer_role === "tenant" && s.report_version === version);

  async function submitSignature(role: "inspector" | "tenant", name: string, data: string) {
    setSigning(role);
    const res = await fetch(`/api/admin/leasing/properties/${campaignId}/move-in/signatures`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: state.session.id, reportVersion: version, signerName: name, signerRole: role, signatureData: data }),
    });
    setSigning(null);
    if (res.ok) {
      const sig = await res.json();
      setState({ ...state, signatures: [...state.signatures, sig] });
      if (role === "inspector") setInspectorSig(null); else setTenantSig(null);
    } else {
      const err = await res.json().catch(() => ({}));
      setError(err.error || "Failed to save signature.");
    }
  }

  async function finish() {
    setFinishing(true);
    setError("");
    const res = await fetch(`/api/admin/leasing/properties/${campaignId}/move-in/finish`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: state.session.id }),
    });
    const body = await res.json().catch(() => ({}));
    setFinishing(false);
    if (!res.ok) { setError(body.error || "Something went wrong."); return; }
    setState({ ...state, session: { ...state.session, status: "completed" }, documents: [body.reportDoc, body.guideDoc].filter(Boolean) });
    onFinished();
  }

  const totalItems = state.rooms.reduce((n, r) => n + r.items.length, 0);
  const inspectedItems = state.rooms.reduce((n, r) => n + r.items.filter((i) => i.condition !== "not_inspected").length, 0);
  const flagged = state.rooms.flatMap((r) => r.items.filter((i) => i.repair_needed || i.condition === "existing_damage" || i.condition === "needs_attention"));

  return (
    <div>
      <Card>
        <SectionTitle>Summary</SectionTitle>
        <SummaryRow label="Rooms inspected" value={`${state.rooms.filter((r) => r.items.length > 0).length}/${state.rooms.length}`} />
        <SummaryRow label="Items reviewed" value={`${inspectedItems}/${totalItems}`} />
        <SummaryRow label="Flagged (damage / needs attention / repair)" value={String(flagged.length)} warn={flagged.length > 0} />
        <SummaryRow label="Appliances logged" value={String(state.appliances.length)} />
        <SummaryRow label="Keys/fobs recorded" value={String(state.keys.length)} />
        {flagged.length > 0 && (
          <div style={{ marginTop: 12 }}>
            {flagged.map((it) => (
              <p key={it.id} style={{ fontSize: 12, color: AMBER, margin: "0 0 4px" }}>• {it.label}{it.notes ? ` — ${it.notes}` : ""}</p>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle>Signatures</SectionTitle>
        <p style={{ fontSize: 12, color: TEXT_MUT, marginTop: -10, marginBottom: 16 }}>Report version {version}. Signing again after further edits requires starting a new version.</p>

        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Inspector</p>
          {inspectorSigned ? (
            <p style={{ fontSize: 13, color: GREEN }}>✓ Signed</p>
          ) : (
            <>
              <input value={inspectorName} onChange={(e) => setInspectorName(e.target.value)} placeholder="Inspector's full name" style={{ ...inputStyle, width: "100%", boxSizing: "border-box", marginBottom: 10 }} />
              <SignaturePad onChange={setInspectorSig} />
              <button
                onClick={() => inspectorSig && inspectorName.trim() && submitSignature("inspector", inspectorName, inspectorSig)}
                disabled={!inspectorSig || !inspectorName.trim() || signing === "inspector"}
                style={{ ...bigButton(NAVY), width: "100%", marginTop: 10, opacity: !inspectorSig || !inspectorName.trim() ? 0.5 : 1 }}
              >
                {signing === "inspector" ? "Saving…" : "Submit Inspector Signature"}
              </button>
            </>
          )}
        </div>

        <div>
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Tenant{tenantSigned.length > 0 ? ` (${tenantSigned.length} signed)` : ""}</p>
          {tenantSigned.map((s) => <p key={s.id} style={{ fontSize: 13, color: GREEN, margin: "0 0 4px" }}>✓ {s.signer_name}</p>)}
          <input value={tenantName} onChange={(e) => setTenantName(e.target.value)} placeholder="Tenant's full name" style={{ ...inputStyle, width: "100%", boxSizing: "border-box", marginBottom: 10, marginTop: 10 }} />
          <SignaturePad onChange={setTenantSig} />
          <button
            onClick={() => tenantSig && tenantName.trim() && submitSignature("tenant", tenantName, tenantSig)}
            disabled={!tenantSig || !tenantName.trim() || signing === "tenant"}
            style={{ ...bigButton(NAVY), width: "100%", marginTop: 10, opacity: !tenantSig || !tenantName.trim() ? 0.5 : 1 }}
          >
            {signing === "tenant" ? "Saving…" : "Submit Tenant Signature"}
          </button>
          <p style={{ fontSize: 11, color: TEXT_MUT, marginTop: 8 }}>Each co-tenant signs the same way, one at a time, on this same screen.</p>
        </div>
      </Card>

      {error && <p style={{ color: ACCENT, fontSize: 13, marginBottom: 12 }}>{error}</p>}

      <button
        onClick={finish}
        disabled={finishing || !inspectorSigned || tenantSigned.length === 0}
        style={{ ...bigButton(ACCENT), width: "100%", opacity: !inspectorSigned || tenantSigned.length === 0 ? 0.5 : 1 }}
      >
        {finishing ? "Generating & Sending…" : "Finish Move-In & Send"}
      </button>
    </div>
  );
}

function SummaryRow({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: `1px solid ${BORDER}` }}>
      <span style={{ fontSize: 13, color: TEXT_SEC }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: warn ? AMBER : TEXT }}>{value}</span>
    </div>
  );
}

// ── Step 6: Done ─────────────────────────────────────────────────────────
function DoneStep({ state, campaignId }: { state: State; campaignId: string }) {
  return (
    <Card>
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <p style={{ fontSize: 40, margin: "0 0 12px" }}>✅</p>
        <SectionTitle>Move-In Complete</SectionTitle>
        <p style={{ fontSize: 13, color: TEXT_SEC, marginBottom: 20 }}>The signed report and welcome guide have been emailed.</p>
        {state.documents.map((d) => d && (
          <a key={d.id} href={d.file_url} target="_blank" rel="noopener noreferrer" style={{ display: "block", marginBottom: 10, color: ACCENT, fontWeight: 700, textDecoration: "none" }}>
            {d.doc_type === "inspection_report" ? "View Inspection Report" : "View Welcome Guide"} →
          </a>
        ))}
        <Link href={`/admin/leasing/${campaignId}`} style={{ display: "inline-block", marginTop: 16, ...bigButton(NAVY), textDecoration: "none" }}>
          Back to Campaign
        </Link>
      </div>
    </Card>
  );
}

// ── Shared ────────────────────────────────────────────────────────────────
function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 22, marginBottom: 20 }}>{children}</div>;
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 17, fontWeight: 700, color: TEXT, margin: "0 0 6px" }}>{children}</p>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUT, textTransform: "uppercase", letterSpacing: 0.4, margin: "0 0 8px" }}>{label}</p>
      {children}
    </div>
  );
}
const smallGhostButton: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: NAVY, background: "none", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px", cursor: "pointer", whiteSpace: "nowrap" };
