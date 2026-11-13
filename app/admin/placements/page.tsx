"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Page, PageHeader, Table, td, Badge, Button, EmptyState, Loading, ErrorNote, SuccessNote, Card, Field, inputStyle, C, ago } from "@/components/admin/kit";

interface Row { id: string; address: string; city: string | null; status: string; is_demo: boolean; stageLabel: string; owner: string; email: string | null; lastSeen: string | null; welcome: string | null; waitingOnOwner: number; link: string | null; next_action: string | null }
interface Prop { id: string; address: string; city: string; price: number; available_date: string | null }

export default function PlacementsPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [props, setProps] = useState<Prop[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ name: "", email: "", phone: "", property_id: "", address: "", city: "London", asking_rent: "", target_date: "", signed_at: new Date().toISOString().slice(0, 10), send_welcome: true, demo: false });

  async function load() {
    const res = await fetch("/api/admin/placements");
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setError(d.error ?? "Couldn't load."); return; }
    setRows(d.placements); setProps(d.properties);
  }
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, []);

  async function create() {
    setBusy(true); setError(null); setNotice(null);
    const res = await fetch("/api/admin/placements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setError(d.error ?? "Couldn't create it."); return; }
    setNotice(d.welcome === "sent" ? "Dashboard created and the welcome email was sent." : d.welcome?.startsWith?.("failed") ? `Dashboard created, but the welcome email didn't send: ${d.welcome}` : "Dashboard created.");
    setAdding(false);
    await load();
  }

  const set = (k: keyof typeof f, v: string | boolean) => setF((x) => ({ ...x, [k]: v }));

  return (
    <Page>
      <PageHeader title="Client Dashboards" subtitle="One dashboard per tenant placement. Owners see progress, marketing, weekly updates and applications."
        actions={<Button variant="primary" onClick={() => setAdding(!adding)}>{adding ? "Close" : "Add client"}</Button>} />
      {error && <ErrorNote>{error}</ErrorNote>}
      {notice && <div style={{ marginBottom: 16 }}><SuccessNote>{notice}</SuccessNote></div>}

      {adding && (
        <Card style={{ marginBottom: 20 }}>
          <p style={{ margin: "0 0 16px", color: C.muted, fontSize: 14 }}>Records the signed agreement and creates the dashboard. Placements signed through the online onboarding are created automatically.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
            <Field label="Owner name"><input style={inputStyle} value={f.name} onChange={(e) => set("name", e.target.value)} /></Field>
            <Field label="Owner email" hint="An owner with more than one property keeps one link."><input style={inputStyle} type="email" value={f.email} onChange={(e) => set("email", e.target.value)} /></Field>
            <Field label="Owner phone"><input style={inputStyle} value={f.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
            <Field label="Existing listing (optional)" hint="Links photos, rent and showings to it.">
              <select style={inputStyle} value={f.property_id} onChange={(e) => { const p = props.find((x) => x.id === e.target.value); setF((x) => ({ ...x, property_id: e.target.value, address: p?.address ?? x.address, city: p?.city ?? x.city, asking_rent: p ? String(p.price ?? "") : x.asking_rent, target_date: p?.available_date ?? x.target_date })); }}>
                <option value="">Not listed yet</option>{props.map((p) => <option key={p.id} value={p.id}>{p.address}</option>)}
              </select>
            </Field>
            <Field label="Property address"><input style={inputStyle} value={f.address} onChange={(e) => set("address", e.target.value)} /></Field>
            <Field label="City"><input style={inputStyle} value={f.city} onChange={(e) => set("city", e.target.value)} /></Field>
            <Field label="Asking rent"><input style={inputStyle} type="number" value={f.asking_rent} onChange={(e) => set("asking_rent", e.target.value)} /></Field>
            <Field label="Target availability"><input style={inputStyle} type="date" value={f.target_date} onChange={(e) => set("target_date", e.target.value)} /></Field>
            <Field label="Agreement signed on"><input style={inputStyle} type="date" value={f.signed_at} onChange={(e) => set("signed_at", e.target.value)} /></Field>
          </div>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", margin: "16px 0", fontSize: 14 }}>
            <label><input type="checkbox" checked={f.send_welcome} disabled={f.demo} onChange={(e) => set("send_welcome", e.target.checked)} /> Send the welcome email now</label>
            <label><input type="checkbox" checked={f.demo} onChange={(e) => setF((x) => ({ ...x, demo: e.target.checked, send_welcome: false }))} /> Demo (labelled, kept apart from real clients, no emails)</label>
          </div>
          <Button variant="primary" disabled={busy} onClick={create}>{busy ? "Creating…" : "Agreement signed: create dashboard"}</Button>
        </Card>
      )}

      {!rows ? <Loading /> : rows.length === 0 ? <EmptyState title="No client dashboards yet" body="Add a client, or sign a placement agreement through the onboarding." /> : (
        <Table head={["Property", "Owner", "Stage", "Waiting on owner", "Owner last opened", ""]}>
          {rows.map((r) => (
            <tr key={r.id}>
              <td style={td}>
                <Link href={`/admin/placements/${r.id}`} style={{ color: C.navy, fontWeight: 600, textDecoration: "none", textTransform: "capitalize" }}>{r.address}</Link>
                <div style={{ fontSize: 13, color: C.muted }}>{r.next_action ?? ""}</div>
                {r.is_demo && <Badge tone="amber">Demo</Badge>}
              </td>
              <td style={td}>{r.owner}<div style={{ fontSize: 13, color: C.muted }}>{r.email ?? "No email"}{!r.welcome && !r.is_demo ? " · welcome not sent" : ""}</div></td>
              <td style={td}><Badge tone={r.status === "completed" ? "green" : r.status === "paused" ? "amber" : "blue"}>{r.stageLabel}</Badge></td>
              <td style={td}>{r.waitingOnOwner ? <Badge tone="red">{r.waitingOnOwner} application{r.waitingOnOwner > 1 ? "s" : ""}</Badge> : "—"}</td>
              <td style={td}>{r.lastSeen ? ago(r.lastSeen) : "Never"}</td>
              <td style={{ ...td, textAlign: "right" }}><Button size="sm" href={`/admin/placements/${r.id}`}>Manage</Button></td>
            </tr>
          ))}
        </Table>
      )}
    </Page>
  );
}
