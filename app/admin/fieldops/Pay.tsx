"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, Badge, Button, Grid, Stat, Table, td, EmptyState, Loading, ErrorNote, SuccessNote, C } from "@/components/admin/kit";
import { api, act, cash, fDay, input, Label } from "./shared";

interface Row {
  id: string; agent_id: string; kind: "showing" | "lease_bonus" | "adjustment"; amount: number; status: "pending" | "approved" | "paid" | "reversed";
  note: string | null; created_at: string; approved_at: string | null; paid_at: string | null; rate_snapshot: Record<string, unknown>;
  agents: { name: string } | null; fo_appointments: { starts_at: string; tenant_name: string; properties: { address: string } | null } | null;
}

const KIND = { showing: "Showing", lease_bonus: "Leasing bonus", adjustment: "Adjustment" };
const TONE = { pending: "amber", approved: "blue", paid: "green", reversed: "grey" } as const;
const LABEL = { pending: "To approve", approved: "Approved", paid: "Paid", reversed: "Reversed" };

export default function Pay() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [bonusOn, setBonusOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [filter, setFilter] = useState<"pending" | "approved" | "paid" | "all">("pending");
  const [agent, setAgent] = useState("all");
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [adj, setAdj] = useState({ open: false, agent: "", amount: "", note: "" });

  const load = () => api<{ rows: Row[]; settings: { bonus_enabled: boolean } }>("pay").then((d) => { setRows(d.rows); setBonusOn(d.settings.bonus_enabled); setSel(new Set()); }).catch((e) => setError(e.message));
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, []);

  const agents = useMemo(() => [...new Map((rows ?? []).map((r) => [r.agent_id, r.agents?.name ?? "Unknown"])).entries()], [rows]);
  if (error && !rows) return <ErrorNote>{error}</ErrorNote>;
  if (!rows) return <Loading />;

  const shown = rows.filter((r) => (filter === "all" || r.status === filter) && (agent === "all" || r.agent_id === agent));
  const sum = (s: Row["status"]) => rows.filter((r) => r.status === s).reduce((t, r) => t + Number(r.amount), 0);

  async function move(to: string) {
    let note: string | null = null;
    if (to === "reversed") { note = prompt("Why are you reversing these?"); if (!note) return; }
    const r = await act({ action: "earnings", ids: [...sel], to, note });
    if (!r.ok) { setError(String(r.data.error)); return; }
    setNotice(`${sel.size} ${sel.size === 1 ? "row" : "rows"} marked ${LABEL[to as keyof typeof LABEL].toLowerCase()}.`);
    load();
  }

  function csv() {
    const head = ["Date", "Specialist", "Type", "Home", "Tenant", "Amount", "Status", "Approved", "Paid", "Note"];
    const lines = shown.map((r) => [
      fDay(r.fo_appointments?.starts_at ?? r.created_at), r.agents?.name ?? "", KIND[r.kind], r.fo_appointments?.properties?.address ?? "", r.fo_appointments?.tenant_name ?? "",
      Number(r.amount).toFixed(2), r.status, r.approved_at?.slice(0, 10) ?? "", r.paid_at?.slice(0, 10) ?? "", r.note ?? "",
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv" }));
    a.download = `fieldops-pay-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  return (
    <div>
      {error && <ErrorNote>{error}</ErrorNote>}
      {notice && <div style={{ marginBottom: 16 }}><SuccessNote>{notice}</SuccessNote></div>}
      <Grid min={180}>
        <Stat label="To approve" value={cash(sum("pending"))} />
        <Stat label="Approved, not paid" value={cash(sum("approved"))} />
        <Stat label="Paid" value={cash(sum("paid"))} />
      </Grid>
      <Card style={{ marginTop: 16, background: "#FBFAF8" }}>
        <div style={{ fontSize: 14, color: C.text, lineHeight: 1.6 }}>
          <b>How pay is created:</b> a showing fee is added as &ldquo;to approve&rdquo; when a specialist sends their report (showed it or tenant no-show). Booked showings are not earnings yet.
          {bonusOn ? " Leasing bonuses are created when you mark a showing as leased, and stay pending until you approve them." : " Leasing bonuses are off (Settings)."} Nothing is paid automatically: you approve, pay outside the app, then mark paid.
        </div>
      </Card>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", margin: "20px 0 12px" }}>
        {(["pending", "approved", "paid", "all"] as const).map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "primary" : "secondary"} onClick={() => { setFilter(f); setSel(new Set()); }}>{f === "all" ? "All" : LABEL[f]}</Button>
        ))}
        <select value={agent} onChange={(e) => setAgent(e.target.value)} style={{ ...input, width: 200 }}>
          <option value="all">All specialists</option>
          {agents.map(([id, n]) => <option key={id} value={id}>{n}</option>)}
        </select>
        <span style={{ flex: 1 }} />
        <Button size="sm" onClick={() => setAdj({ ...adj, open: !adj.open })}>Add adjustment</Button>
        <Button size="sm" onClick={csv} disabled={!shown.length}>Download CSV</Button>
      </div>

      {adj.open && (
        <Card style={{ marginBottom: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 2fr auto", gap: 10, alignItems: "end" }}>
            <div><Label>Specialist</Label><select style={input} value={adj.agent} onChange={(e) => setAdj({ ...adj, agent: e.target.value })}><option value="">Choose…</option>{agents.map(([id, n]) => <option key={id} value={id}>{n}</option>)}</select></div>
            <div><Label>Amount (− to deduct)</Label><input style={input} value={adj.amount} onChange={(e) => setAdj({ ...adj, amount: e.target.value.replace(/[^\d.-]/g, "") })} /></div>
            <div><Label>Reason (they&apos;ll see it)</Label><input style={input} value={adj.note} onChange={(e) => setAdj({ ...adj, note: e.target.value })} /></div>
            <Button variant="primary" onClick={async () => {
              const r = await act({ action: "adjustment", agent: adj.agent, amount: Number(adj.amount), note: adj.note });
              if (!r.ok) { setError(String(r.data.error)); return; }
              setAdj({ open: false, agent: "", amount: "", note: "" }); load();
            }}>Add</Button>
          </div>
        </Card>
      )}

      {sel.size > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
          <span style={{ fontSize: 14, color: C.navy, fontWeight: 600 }}>{sel.size} selected · {cash(shown.filter((r) => sel.has(r.id)).reduce((t, r) => t + Number(r.amount), 0))}</span>
          <Button size="sm" variant="primary" onClick={() => move("approved")}>Approve</Button>
          <Button size="sm" onClick={() => move("paid")}>Mark paid</Button>
          <Button size="sm" variant="danger" onClick={() => move("reversed")}>Reverse</Button>
        </div>
      )}

      {shown.length === 0 ? <EmptyState title="Nothing here" body={filter === "pending" ? "New showing fees appear here after specialists send their reports." : undefined} /> : (
        <Table head={[
          <input key="all" type="checkbox" aria-label="Select all" checked={shown.every((r) => sel.has(r.id))} onChange={(e) => setSel(e.target.checked ? new Set(shown.map((r) => r.id)) : new Set())} />,
          "Date", "Specialist", "What", "Amount", "Status",
        ]}>
          {shown.map((r) => (
            <tr key={r.id}>
              <td style={td}><input type="checkbox" aria-label="Select" checked={sel.has(r.id)} onChange={(e) => { const n = new Set(sel); if (e.target.checked) n.add(r.id); else n.delete(r.id); setSel(n); }} /></td>
              <td style={td}>{fDay(r.fo_appointments?.starts_at ?? r.created_at)}</td>
              <td style={td}>{r.agents?.name}</td>
              <td style={td}>
                <div style={{ fontWeight: 600, color: C.navy }}>{KIND[r.kind]}{r.fo_appointments?.properties ? ` · ${r.fo_appointments.properties.address}` : ""}</div>
                <div style={{ fontSize: 13, color: C.muted }}>{r.fo_appointments?.tenant_name ?? ""}{r.note ? ` · ${r.note}` : ""}</div>
              </td>
              <td style={{ ...td, fontWeight: 700, textDecoration: r.status === "reversed" ? "line-through" : undefined }}>{cash(Number(r.amount))}</td>
              <td style={td}><Badge tone={TONE[r.status]}>{LABEL[r.status]}</Badge></td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
