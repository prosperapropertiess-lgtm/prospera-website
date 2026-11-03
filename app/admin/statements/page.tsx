"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Page, PageHeader, Card, Badge, Button, EmptyState, Loading, ErrorNote, SuccessNote, C, money, shortDate, inputStyle,
} from "@/components/admin/kit";
import type { OwnerStatement, Warning } from "@/lib/owner-statement";

interface Row {
  id: string;
  period: string;
  owner_names: string;
  owner_emails: string[];
  data: OwnerStatement;
  warnings: Warning[];
  status: "draft" | "sent" | "skipped";
  sent_at: string | null;
  updated_at: string;
}

function monthName(period: string) {
  const [y, m] = period.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-CA", { month: "long", year: "numeric" });
}

export default function StatementsPage() {
  const [period, setPeriod] = useState<string | null>(null);
  const [periods, setPeriods] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async (p: string | null) => {
    const res = await fetch(`/api/admin/statements${p ? `?period=${p}` : ""}`);
    if (!res.ok) { setRows([]); setError("Couldn't load statements. Refresh to try again."); return; }
    const d = await res.json();
    setPeriod(d.period); setPeriods(d.periods); setRows(d.statements);
  }, []);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("period");
    const t = setTimeout(() => load(p), 0);
    return () => clearTimeout(t);
  }, [load]);

  async function rebuild() {
    if (!period) return;
    setBusy("rebuild"); setError(null); setNotice(null);
    const res = await fetch("/api/admin/statements", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ period }),
    });
    const d = await res.json().catch(() => ({}));
    if (res.ok) { setNotice(`Rebuilt from the General Ledger.${d.skippedSent ? ` ${d.skippedSent} already sent, left as they are.` : ""}`); await load(period); }
    else setError(d.error ?? "Couldn't rebuild. Try again.");
    setBusy(null);
  }

  async function act(row: Row, action: "send" | "skip" | "unskip", correction = false) {
    if (action === "send" && !confirm(`Send this to ${row.owner_emails.join(", ")}?`)) return;
    setBusy(row.id); setError(null); setNotice(null);
    const res = await fetch(`/api/admin/statements/${row.id}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, correction }),
    });
    const d = await res.json().catch(() => ({}));
    if (res.ok) { if (action === "send") setNotice(`Sent to ${row.owner_names}.`); await load(period); }
    else setError(d.error ?? "That didn't work. Try again.");
    setBusy(null);
  }

  return (
    <Page width={960}>
      <PageHeader
        title="Owner Statements"
        subtitle="Built from the General Ledger on the 3rd of each month. Nothing goes to an owner until you press Send."
        actions={
          <>
            {periods.length > 0 && (
              <select style={{ ...inputStyle, width: "auto" }} value={period ?? ""} onChange={(e) => { setRows(null); load(e.target.value); }}>
                {periods.map((p) => <option key={p} value={p}>{monthName(p)}</option>)}
              </select>
            )}
            <Button onClick={rebuild} disabled={busy === "rebuild" || !period}>{busy === "rebuild" ? "Rebuilding…" : "Rebuild from ledger"}</Button>
          </>
        }
      />
      {error && <ErrorNote>{error}</ErrorNote>}
      {notice && <div style={{ marginBottom: 16 }}><SuccessNote>{notice}</SuccessNote></div>}

      {!rows ? <Loading /> : rows.length === 0 ? (
        <EmptyState
          title={`No statements for ${period ? monthName(period) : "this month"} yet`}
          body="Build them now from the General Ledger. You'll see each one before it goes anywhere."
          action={<Button variant="primary" onClick={rebuild} disabled={busy === "rebuild"}>{busy === "rebuild" ? "Building…" : "Build statements"}</Button>}
        />
      ) : (
        <div style={{ display: "grid", gap: 20 }}>
          {rows.map((r) => <StatementCard key={r.id} row={r} busy={busy === r.id} onAct={(a, c) => act(r, a, c)} />)}
        </div>
      )}
    </Page>
  );
}

function StatementCard({ row, busy, onAct }: { row: Row; busy: boolean; onAct: (a: "send" | "skip" | "unskip", correction?: boolean) => void }) {
  const s = row.data;
  const [preview, setPreview] = useState<string | null>(null);
  const [correction, setCorrection] = useState(false);
  const red = row.warnings.filter((w) => w.level === "red");
  const amber = row.warnings.filter((w) => w.level === "amber");

  async function togglePreview(next = correction) {
    const res = await fetch(`/api/admin/statements/${row.id}?correction=${next ? 1 : 0}`);
    if (res.ok) setPreview((await res.json()).html);
  }

  const owes = s.closingBalance < -0.005;

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 19, fontWeight: 700, color: C.navy }}>{row.owner_names}</div>
          <div style={{ fontSize: 14, color: C.muted, marginTop: 2 }}>{s.properties.join(" · ")}</div>
          <div style={{ fontSize: 14, color: C.faint, marginTop: 2 }}>{row.owner_emails.join(", ") || "No email"}</div>
        </div>
        {row.status === "sent" ? <Badge tone="green">Sent {shortDate(row.sent_at)}</Badge>
          : row.status === "skipped" ? <Badge tone="grey">Not sending</Badge>
          : red.length ? <Badge tone="red">Fix before sending</Badge>
          : <Badge tone="blue">Ready to check</Badge>}
      </div>

      {row.warnings.length > 0 && (
        <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
          {[...red, ...amber].map((w, i) => (
            <div key={i} style={{ background: w.level === "red" ? C.redBg : C.amberBg, color: w.level === "red" ? C.red : C.amber, borderRadius: 10, padding: "10px 14px", fontSize: 14 }}>
              {w.text}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginTop: 18 }}>
        <Figure label="Rent collected" value={money(s.rent)} />
        <Figure label="Fee + expenses" value={money(s.fees + s.expenses)} />
        <Figure label="Net for the month" value={money(s.net)} />
        <Figure label="Paid to owner" value={money(s.payouts)} />
        <Figure label={owes ? "Owner owes us" : "Held for owner"} value={money(Math.abs(s.closingBalance))} alert={owes} />
      </div>

      <div style={{ marginTop: 18, borderTop: `1px solid ${C.border}` }}>
        {s.lines.map((l, i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.border}`, fontSize: 15 }}>
            <div style={{ width: 70, color: C.muted, flexShrink: 0 }}>{shortDate(l.date)}</div>
            <div style={{ flex: 1 }}>{l.description}</div>
            <div style={{ fontWeight: 600, color: C.navy, whiteSpace: "nowrap" }}>{l.moneyIn ? `+${money(l.moneyIn)}` : `−${money(l.moneyOut)}`}</div>
          </div>
        ))}
        {s.lines.length === 0 && <div style={{ padding: "14px 0", color: C.faint, fontSize: 15 }}>No ledger lines this month.</div>}
      </div>

      {row.status !== "sent" && (
        <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 16, fontSize: 14, color: C.text, cursor: "pointer" }}>
          <input type="checkbox" checked={correction} onChange={(e) => { setCorrection(e.target.checked); if (preview) togglePreview(e.target.checked); }} />
          This replaces a wrong statement they already got
        </label>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
        <Button onClick={() => (preview ? setPreview(null) : togglePreview())}>{preview ? "Hide email" : "See the email"}</Button>
        {row.status === "draft" && <Button variant="primary" disabled={busy || red.length > 0} onClick={() => onAct("send", correction)}>{busy ? "Sending…" : "Send to owner"}</Button>}
        {row.status === "draft" && <Button variant="ghost" disabled={busy} onClick={() => onAct("skip")}>Don&apos;t send this month</Button>}
        {row.status === "skipped" && <Button disabled={busy} onClick={() => onAct("unskip")}>Bring it back</Button>}
      </div>

      {row.status === "draft" && red.length > 0 && (
        <div style={{ fontSize: 14, color: C.muted, marginTop: 10 }}>Fix the red items in Notion, then press Rebuild from ledger. Send unlocks once they&apos;re gone.</div>
      )}

      {preview && (
        <iframe title="Statement email" srcDoc={preview} style={{ width: "100%", height: 720, border: `1px solid ${C.border}`, borderRadius: 10, marginTop: 16, background: C.bg }} />
      )}
    </Card>
  );
}

function Figure({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div style={{ background: C.greyBg, borderRadius: 10, padding: "12px 14px" }}>
      <div style={{ fontSize: 13, color: C.muted }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: alert ? C.burgundy : C.navy, marginTop: 2 }}>{value}</div>
    </div>
  );
}
