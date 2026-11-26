"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Page, PageHeader, Card, Badge, Button, Tabs, EmptyState, Loading, ErrorNote, SuccessNote, Field, inputStyle, C, money, ago, shortDate,
} from "@/components/admin/kit";

interface Renter {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string;
  joined: string;
  moveDate: string | null;
  moveTiming: string | null;
  people: number | null;
  income: string | null;
  credit: string | null;
  pets: string | null;
  bedrooms: string | null;
  maxBudget: number | null;
  askedAbout: { address: string; price: number; bedrooms: number | null } | null;
  notes: string | null;
}

type Filter = "all" | "soon" | "email";

const DAY = 86400000;

function daysUntil(d: string | null) {
  if (!d) return null;
  return Math.round((new Date(`${d}T12:00:00`).getTime() - Date.now()) / DAY);
}

function moveLabel(r: Renter) {
  if (r.moveDate) {
    const n = daysUntil(r.moveDate)!;
    return `Moving ${shortDate(r.moveDate)}${n < 0 ? " (date passed)" : n <= 30 ? ` · ${n} days` : ""}`;
  }
  return r.moveTiming || "Move date not given";
}

export default function RentersPage() {
  const [renters, setRenters] = useState<Renter[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/renters");
    if (!res.ok) { setRenters([]); setError("Couldn't load the list. Refresh to try again."); return; }
    setRenters((await res.json()).renters);
  }, []);
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, [load]);

  const soon = (r: Renter) => { const n = daysUntil(r.moveDate); return n !== null && n >= 0 && n <= 60; };

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (renters ?? [])
      .filter((r) => filter === "all" || (filter === "soon" ? soon(r) : !!r.email))
      .filter((r) => !q || [r.name, r.email, r.phone, r.askedAbout?.address].some((v) => v?.toLowerCase().includes(q)))
      // Soonest move first; people with no date go last.
      .sort((a, b) => (a.moveDate ?? "9999").localeCompare(b.moveDate ?? "9999"));
  }, [renters, filter, search]);

  async function remove(r: Renter) {
    if (!confirm(`Take ${r.name} off the renter list? Do this when they ask to stop hearing from us.`)) return;
    setBusy(r.id);
    const res = await fetch(`/api/admin/renters?id=${r.id}`, { method: "DELETE" });
    setBusy(null);
    if (!res.ok) { setError("That didn't save. Try again."); return; }
    setNotice(`${r.name} is off the list.`);
    load();
  }

  async function copyEmails() {
    const emails = shown.map((r) => r.email).filter(Boolean).join(", ");
    try {
      await navigator.clipboard.writeText(emails);
      setNotice(`Copied ${shown.filter((r) => r.email).length} emails.`);
    } catch {
      setError("Couldn't copy. Your browser blocked it.");
    }
  }

  if (!renters) return <Page><Loading /></Page>;

  const withEmail = renters.filter((r) => r.email).length;

  return (
    <Page width={1000}>
      <PageHeader
        title="Renter List"
        subtitle={`${renters.length} ${renters.length === 1 ? "person wants" : "people want"} us to send them homes. ${withEmail} have an email.`}
        actions={<Button variant="primary" onClick={() => setAdding(true)}>+ Add a Renter</Button>}
      />

      {error && <ErrorNote>{error}</ErrorNote>}
      {notice && <SuccessNote>{notice}</SuccessNote>}

      {adding && <AddRenter onClose={() => setAdding(false)} onAdded={(name) => { setAdding(false); setNotice(`${name} is on the list.`); load(); }} />}

      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginTop: 8 }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <Tabs value={filter} onChange={setFilter} options={[
            { value: "all", label: "Everyone", count: renters.length },
            { value: "soon", label: "Moving in 60 days", count: renters.filter(soon).length },
            { value: "email", label: "Has email", count: withEmail },
          ]} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, phone, email or home" style={{ ...inputStyle, flex: 1, minWidth: 220 }} />
        {shown.some((r) => r.email) && <Button onClick={copyEmails}>Copy {shown.filter((r) => r.email).length} Emails</Button>}
      </div>

      {shown.length === 0 ? (
        <EmptyState
          title={renters.length ? "Nobody matches that." : "No one on the list yet."}
          body={renters.length ? "Try another search or tab." : "People join when they tick “send me other homes” on a viewing request, or you can add them by hand."}
        />
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {shown.map((r) => (
            <Card key={r.id} padding={20}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>{r.name}</div>
                  <div style={{ fontSize: 15, color: C.text, marginTop: 4 }}>
                    {moveLabel(r)}{r.people ? ` · ${r.people} ${r.people === 1 ? "person" : "people"}` : ""}
                  </div>
                </div>
                {soon(r) && <Badge tone="green">Moving soon</Badge>}
              </div>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                {r.income && <Badge>Income: {r.income}</Badge>}
                {r.credit && <Badge>Credit: {r.credit}</Badge>}
                {r.pets && <Badge tone={r.pets === "No pets" ? "grey" : "amber"}>{r.pets === "No pets" ? "No pets" : `Pets: ${r.pets}`}</Badge>}
                {r.bedrooms && <Badge>{r.bedrooms} bed</Badge>}
                {r.maxBudget && <Badge>Up to {money(r.maxBudget)}</Badge>}
              </div>

              {r.askedAbout && (
                <div style={{ fontSize: 14, color: C.muted, marginTop: 10 }}>
                  Asked about {r.askedAbout.address} · {money(r.askedAbout.price)}/mo{r.askedAbout.bedrooms != null ? ` · ${r.askedAbout.bedrooms} bed` : ""}
                </div>
              )}
              {r.notes && <div style={{ fontSize: 14, color: C.muted, marginTop: 8, whiteSpace: "pre-wrap" }}>{r.notes}</div>}

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14, alignItems: "center" }}>
                {r.phone && <Button size="sm" href={`tel:${r.phone}`}>Call {r.phone}</Button>}
                {r.phone && <Button size="sm" href={`sms:${r.phone}`}>Text</Button>}
                {r.email && <Button size="sm" href={`mailto:${r.email}`}>Email</Button>}
                <span style={{ flex: 1 }} />
                <span style={{ fontSize: 13, color: C.faint }}>Joined {ago(r.joined)} · {r.source === "manual" ? "added by hand" : r.source === "/view" ? "viewing request" : r.source}</span>
                <button onClick={() => remove(r)} disabled={busy === r.id} style={{ background: "none", border: "none", color: C.red, fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "6px 4px" }}>
                  Remove
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Page>
  );
}

function AddRenter({ onClose, onAdded }: { onClose: () => void; onAdded: (name: string) => void }) {
  const [f, setF] = useState({ name: "", phone: "", email: "", moveTiming: "", bedrooms: "", maxBudget: "", people: "", notes: "" });
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function save() {
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/renters", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, consent }) });
    const d = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) { setError(d.error || "That didn't save. Try again."); return; }
    onAdded(f.name.trim());
  }

  return (
    <Card style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 14 }}>Add a Renter</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <Field label="Name"><input value={f.name} onChange={set("name")} style={inputStyle} /></Field>
        <Field label="Phone"><input value={f.phone} onChange={set("phone")} type="tel" style={inputStyle} /></Field>
        <Field label="Email"><input value={f.email} onChange={set("email")} type="email" style={inputStyle} /></Field>
        <Field label="When are they moving?"><input value={f.moveTiming} onChange={set("moveTiming")} placeholder="e.g. Feb 1, or in 2–3 months" style={inputStyle} /></Field>
        <Field label="Bedrooms"><input value={f.bedrooms} onChange={set("bedrooms")} placeholder="e.g. 2" style={inputStyle} /></Field>
        <Field label="Max rent"><input value={f.maxBudget} onChange={set("maxBudget")} inputMode="numeric" placeholder="e.g. 2200" style={inputStyle} /></Field>
        <Field label="How many people?"><input value={f.people} onChange={set("people")} inputMode="numeric" style={inputStyle} /></Field>
      </div>
      <div style={{ marginTop: 14 }}>
        <Field label="Notes"><textarea value={f.notes} onChange={set("notes")} rows={2} placeholder="Where they found us, area they want, pets…" style={{ ...inputStyle, resize: "vertical" }} /></Field>
      </div>
      <label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 14, fontSize: 15, color: C.text, cursor: "pointer" }}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ width: 20, height: 20, marginTop: 1, accentColor: C.navy }} />
        <span>They said yes to getting homes from us. <span style={{ color: C.muted }}>Required by Canada&apos;s anti-spam law.</span></span>
      </label>
      {error && <div style={{ color: C.red, fontSize: 14, marginTop: 10 }}>{error}</div>}
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <Button variant="primary" onClick={save} disabled={saving || !consent}>{saving ? "Saving…" : "Add to List"}</Button>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
    </Card>
  );
}
