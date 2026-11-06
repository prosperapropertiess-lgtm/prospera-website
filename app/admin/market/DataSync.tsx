"use client";
import { useEffect, useMemo, useState } from "react";
import { C, Button, Badge, Loading, buttonStyle } from "@/components/admin/kit";
import { cad, stats, FLAG_TEXT, BLOCKING_FLAGS, LISTING_FIELDS, type Obs, type Flag } from "@/lib/market/core";
import type { ParsedSummary } from "@/lib/market/ingest";
import { Panel, Note, Pill, th, tdc, TableWrap, tabular, fmtDate, fmtDateTime, type Ctx } from "./shared";

export interface Status {
  latest: { id: string; scan_date: string | null; ingested_at: string; published_at: string | null } | null;
  attempts: { id: string; trigger: string; status: string; started_at: string; finished_at: string | null; row_count: number | null; eligible_count: number | null; result: { message?: string } | null; error: string | null }[];
  lastGood: { started_at: string } | null;
  lastFailed: { started_at: string; error: string | null } | null;
  sourceAgeDays: number | null;
  stale: boolean;
  staleDays: number;
  schedule: string;
  nextRun: string;
  sheetUrl: string;
  serviceAccount: string | null;
}

const STATUS_TEXT: Record<string, string> = {
  published: "New scan saved", revision: "Corrected scan saved", unchanged: "No change", failed: "Failed", running: "Running", dry_run: "Check only",
};

export default function DataSync({ ctx, status, summary, onSynced }: { ctx: Ctx; status: Status | null; summary: ParsedSummary | null; onSynced: () => void }) {
  const [busy, setBusy] = useState<"sync" | "dry" | null>(null);
  const [result, setResult] = useState<{ ok: boolean; text: string; code?: string } | null>(null);
  const [source, setSource] = useState<{ raw: { tabs: { name: string; grid: string[][] }[] } } | null>(null);
  const [tab, setTab] = useState<string>("Summary");
  const [page, setPage] = useState(0);

  const snapId = ctx.snapshot?.id;
  useEffect(() => { const t = setTimeout(() => setSource(null), 0); return () => clearTimeout(t); }, [snapId]);

  async function sync(dryRun: boolean) {
    setBusy(dryRun ? "dry" : "sync"); setResult(null);
    const res = await fetch("/api/admin/market/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dryRun }) }).catch(() => null);
    const d = await res?.json().catch(() => ({}));
    if (res?.ok) { setResult({ ok: true, text: d.result.message + ` (${d.result.observations} listings read, ${d.result.eligible.whole} whole-unit and ${d.result.eligible.room} per-room rents usable)` }); if (!dryRun) onSynced(); }
    else setResult({ ok: false, text: d?.error ?? "The refresh didn't finish. The last good data is still shown.", code: d?.code });
    setBusy(null);
  }

  async function loadSource() {
    const d = await fetch(`/api/admin/market/source?snapshot=${ctx.snapshot.id}`).then((r) => r.json());
    setSource(d);
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <Panel title="Sync status" right={
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button variant="primary" disabled={!!busy} onClick={() => sync(false)}>{busy === "sync" ? "Reading the Sheet…" : "Refresh now"}</Button>
          <Button disabled={!!busy} onClick={() => sync(true)}>{busy === "dry" ? "Checking…" : "Check without saving"}</Button>
          <Button href={status?.sheetUrl ?? "#"} target="_blank">Open the Sheet ↗</Button>
        </div>}>
        {!status ? <Loading /> : (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", fontSize: 14, ...tabular }}>
              <Fact label="Source scanned" value={fmtDate(status.latest?.scan_date)} sub={status.sourceAgeDays != null ? `${status.sourceAgeDays} day${status.sourceAgeDays === 1 ? "" : "s"} old` : undefined} />
              <Fact label="Last successful read" value={fmtDateTime(status.lastGood?.started_at)} sub="Reading doesn't make the data newer" />
              <Fact label="Next scheduled read" value={fmtDateTime(status.nextRun)} sub={status.schedule} />
              <Fact label="State" value={<Badge tone={status.lastFailed ? "red" : status.stale ? "amber" : "green"}>{status.lastFailed ? "Last read failed" : status.stale ? "Source not updated" : "Current"}</Badge>} sub={status.stale ? `No new scan in over ${status.staleDays} days` : undefined} />
            </div>
            {status.lastFailed && <Note tone="red">{fmtDateTime(status.lastFailed.started_at)}: {status.lastFailed.error?.replace(/\.$/, "")}. The dashboard keeps showing the last good scan.</Note>}
            {result && <Note tone={result.ok ? "grey" : "red"}>{result.text}</Note>}
            {(result?.code === "no_access" || result?.code === "auth_failed" || status.lastFailed?.error?.includes("Share it")) && status.serviceAccount && (
              <Note tone="amber">
                To let the dashboard read the Sheet by itself: open the Sheet, press <strong>Share</strong>, add <code style={{ userSelect: "all" }}>{status.serviceAccount}</code> as a <strong>Viewer</strong>, and untick &quot;Notify people&quot;. Then press Refresh now.
              </Note>
            )}
            {!status.serviceAccount && <Note tone="amber">No Google service account is configured on the server, so the weekly read can&apos;t run. Imports through the agent endpoint still work.</Note>}
            <details style={{ fontSize: 14 }}>
              <summary style={{ cursor: "pointer", color: C.navy, fontWeight: 600 }}>How updates work</summary>
              <div style={{ color: C.text, lineHeight: 1.6, marginTop: 8 }}>
                <p style={{ margin: "0 0 8px" }}>{status.schedule}, the server reads the Sheet with read-only access. Refresh now runs the same read. Neither starts a new Facebook scan; they read whatever the scanner last wrote.</p>
                <p style={{ margin: "0 0 8px" }}>A read of unchanged data is logged but doesn&apos;t add a market data point. Changed data with the same scan date is saved as a corrected version of that scan. Earlier scans are kept even if the Sheet is cleared.</p>
                <p style={{ margin: 0 }}>An agent with Sheet access can also send the data to <code>POST /api/admin/market/import</code> with <code>{"{ tabs: [{ name, grid }], dryRun? }"}</code> and the header <code>Authorization: Bearer $MARKET_IMPORT_SECRET</code>. It goes through the same checks.</p>
              </div>
            </details>
          </div>
        )}
      </Panel>

      {snapId && <Quality ctx={ctx} />}
      {snapId && summary && <Reconcile obs={ctx.obs} summary={summary} />}
      {snapId && <Coverage obs={ctx.obs} summary={summary} />}

      {snapId && <Panel title="Original data" sub="Exactly what was read from the Sheet for this scan, cell by cell." right={
        <div style={{ display: "flex", gap: 8 }}>
          <a href={`/api/admin/market/source?snapshot=${ctx.snapshot.id}&download=1`} style={buttonStyle("secondary", "sm")}>Download JSON</a>
        </div>}>
        {!source ? <Button onClick={loadSource}>Show the original tabs</Button> : (
          <>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {source.raw.tabs.map((t) => <Pill key={t.name} active={tab === t.name} onClick={() => { setTab(t.name); setPage(0); }}>{t.name} ({t.grid.length} rows)</Pill>)}
            </div>
            <SourceGrid grid={source.raw.tabs.find((t) => t.name === tab)?.grid ?? []} page={page} setPage={setPage} />
          </>
        )}
        {ctx.snapshot.schema_report.newColumns?.length ? <div style={{ marginTop: 10 }}><Note tone="amber">New columns in the Sheet, kept and shown in each listing&apos;s details: {ctx.snapshot.schema_report.newColumns.join(", ")}</Note></div> : null}
      </Panel>}

      <Panel title="Sync history" sub="Every read attempt, newest first.">
        {!status ? <Loading /> : (
          <TableWrap maxHeight={360}>
            <table style={{ width: "100%", borderCollapse: "collapse", ...tabular }}>
              <thead><tr><th style={th}>Started</th><th style={th}>How</th><th style={th}>Result</th><th style={{ ...th, textAlign: "right" }}>Listings</th><th style={th}>Details</th></tr></thead>
              <tbody>
                {status.attempts.map((a) => (
                  <tr key={a.id}>
                    <td style={tdc}>{fmtDateTime(a.started_at)}</td>
                    <td style={tdc}>{a.trigger}</td>
                    <td style={tdc}><Badge tone={a.status === "failed" ? "red" : a.status === "published" || a.status === "revision" ? "green" : "grey"}>{STATUS_TEXT[a.status] ?? a.status}</Badge></td>
                    <td style={{ ...tdc, textAlign: "right" }}>{a.row_count ?? "—"}</td>
                    <td style={{ ...tdc, fontSize: 13, color: C.muted }}>{a.error ?? a.result?.message ?? ""}</td>
                  </tr>
                ))}
                {!status.attempts.length && <tr><td colSpan={5} style={{ ...tdc, color: C.faint }}>No reads yet.</td></tr>}
              </tbody>
            </table>
          </TableWrap>
        )}
      </Panel>
    </div>
  );
}

function Fact({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div style={{ background: C.greyBg, borderRadius: 10, padding: "10px 12px" }}>
      <div style={{ fontSize: 13, color: C.muted }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginTop: 2 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Quality({ ctx }: { ctx: Ctx }) {
  const flags = [...new Set(ctx.obs.flatMap((o) => o.flags))] as Flag[];
  const ACTION: Partial<Record<Flag, string>> = {
    room_whole_conflict: "Open each one and correct the type or price basis, or leave them out.",
    zero_baths: "Check the ad and correct the bathroom count if it's wrong.",
    utilities_parking: "Parking was listed as a utility. It isn't counted as heat, hydro or water.",
    ambiguous_date: "The ad gives a month but no year. Shown as text; never assigned a year.",
    duplicate_conflict: "The same ad ID appears with different details. Left out of rents until resolved.",
    price_invalid: "No usable monthly price. Still searchable, left out of rents.",
  };
  return (
    <Panel title="Data quality" sub="Issues found in this scan. Each opens the listings involved.">
      {!flags.length ? <p style={{ margin: 0, color: C.muted }}>No issues found.</p> : (
        <div style={{ display: "grid", gap: 8 }}>
          {flags.sort((a, b) => Number(BLOCKING_FLAGS.includes(b)) - Number(BLOCKING_FLAGS.includes(a))).map((f) => {
            const n = ctx.obs.filter((o) => o.flags.includes(f)).length;
            return (
              <div key={f} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap", background: BLOCKING_FLAGS.includes(f) ? C.amberBg : C.greyBg, borderRadius: 10, padding: "10px 14px" }}>
                <div style={{ fontSize: 14 }}>
                  <strong>{n} listing{n === 1 ? "" : "s"}: {FLAG_TEXT[f]}</strong>{BLOCKING_FLAGS.includes(f) ? " (kept out of rents)" : ""}
                  {ACTION[f] && <div style={{ color: C.muted, fontSize: 13 }}>{ACTION[f]}</div>}
                </div>
                <Button size="sm" onClick={() => ctx.drill({ flags: [f], excluded: true, market: "all" })}>Review listings</Button>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}

function Reconcile({ obs, summary }: { obs: Obs[]; summary: ParsedSummary }) {
  const whole = obs.filter((o) => o.cohort === "whole");
  const room = obs.filter((o) => o.cohort === "room");
  const sourceWhole = obs.filter((o) => o.norm.price_basis === "whole_unit" && o.norm.price != null);
  const medians = summary.sections.find((s) => /HEADLINE MEDIANS/i.test(s.heading));
  const seg = (label: string): Obs[] => {
    const l = label.toLowerCase();
    if (l.startsWith("rooms")) return room;
    if (l.startsWith("all whole")) return whole;
    if (l.startsWith("all houses")) return whole.filter((o) => o.norm.type === "house");
    const m = l.match(/(\d)-bed (apartment|house|townhouse|basement|condo)/);
    return m ? whole.filter((o) => o.norm.type === m[2] && o.norm.beds_cat === m[1]) : [];
  };
  const r = summary.reported;
  const rows: { label: string; source: string; ours: string; why: string }[] = [
    { label: "Unique listings", source: String(r.uniqueListings ?? "—"), ours: String(obs.length), why: obs.length === r.uniqueListings ? "Match" : "Different row count read from the Listings tab" },
    { label: "Whole-unit listings", source: String(r.wholeUnit ?? "—"), ours: `${whole.length} used (${sourceWhole.length} labelled whole_unit)`, why: `${sourceWhole.length - whole.length} labelled whole_unit but typed as rooms are kept out until reviewed` },
    { label: "Per-room listings", source: String(r.perRoom ?? "—"), ours: String(room.length), why: room.length === r.perRoom ? "Match" : "Different classification" },
    ...(medians?.rows ?? []).map((row) => {
      const [label, n, med] = row.cells;
      const ours = stats(seg(label).map((o) => o.norm.price!));
      const same = Number(n) === ours.n && Number(med) === ours.median;
      return {
        label: `Median: ${label}`, source: `${cad(Number(med))} (n=${Number(n)})`, ours: `${cad(ours.median)} (n=${ours.n})`,
        why: same ? "Match" : label.toLowerCase().startsWith("rooms")
          ? "The Sheet counts every ad typed as a room; the dashboard uses only the ones priced per room" : label.toLowerCase().startsWith("all") || label.toLowerCase().startsWith("2-bed") || label.toLowerCase().startsWith("1-bed")
          ? "The source includes ads typed as rooms but labelled whole-unit; the dashboard leaves them out" : "Reason unknown",
      };
    }),
    { label: "New vs earlier baseline", source: r.newVsBaseline != null ? `${r.newVsBaseline} new vs ${r.baseline}-listing baseline, ${r.notRefound} not re-found` : "—", ours: "Not checked", why: "The baseline's rows aren't in the Sheet, so this is shown as reported" },
    { label: "Search coverage", source: r.segments != null ? `${r.segments} segments, ${r.pages} pages, ${r.rawHits?.toLocaleString()} raw hits` : "—", ours: `${obs.length} distinct ads`, why: "Raw hits count the same ad once per search, so they aren't listing counts" },
  ];
  return (
    <Panel title="Sheet Summary vs dashboard" sub="Numbers the Sheet reports, beside what the dashboard calculates from the listing rows. The Sheet is never edited to match.">
      <TableWrap>
        <table style={{ width: "100%", borderCollapse: "collapse", ...tabular }}>
          <thead><tr><th style={th}>Figure</th><th style={th}>Sheet says</th><th style={th}>Dashboard</th><th style={th}>Why they differ</th></tr></thead>
          <tbody>
            {rows.map((x) => (
              <tr key={x.label}>
                <td style={{ ...tdc, fontWeight: 600 }}>{x.label}</td><td style={tdc}>{x.source}</td><td style={tdc}>{x.ours}</td>
                <td style={{ ...tdc, fontSize: 13, color: x.why === "Match" ? C.green : C.muted }}>{x.why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>
      <details style={{ marginTop: 12, fontSize: 14 }}>
        <summary style={{ cursor: "pointer", color: C.navy, fontWeight: 600 }}>Every Summary section as written</summary>
        {summary.notes.map((n) => <p key={n.row} style={{ margin: "6px 0", color: C.text }}><span style={{ color: C.faint, fontSize: 12 }}>Row {n.row}</span> {n.text}</p>)}
        {summary.sections.map((s) => (
          <div key={s.row} style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 700, color: C.navy, fontSize: 13 }}>{s.heading} <span style={{ color: C.faint, fontWeight: 400 }}>(row {s.row})</span></div>
            {!s.rows.length ? <div style={{ color: C.amber, fontSize: 13 }}>This section is empty in the Sheet.</div> : (
              <table style={{ borderCollapse: "collapse", fontSize: 13, marginTop: 4 }}>
                {s.header.length > 0 && <thead><tr>{s.header.map((h, i) => <th key={i} style={{ ...th, position: "static", padding: "4px 8px" }}>{h}</th>)}</tr></thead>}
                <tbody>{s.rows.map((r) => <tr key={r.row}>{r.cells.map((c, i) => <td key={i} style={{ ...tdc, padding: "4px 8px", fontSize: 13 }}>{c}</td>)}</tr>)}</tbody>
              </table>
            )}
          </div>
        ))}
      </details>
    </Panel>
  );
}

function Coverage({ obs, summary }: { obs: Obs[]; summary: ParsedSummary | null }) {
  const reported = useMemo(() => {
    const s = summary?.sections.find((x) => /COVERAGE/i.test(x.heading));
    return new Map((s?.rows ?? []).map((r) => [r.cells[0], r.cells[1]]));
  }, [summary]);
  const usable: Record<string, (o: Obs) => boolean> = {
    price: (o) => o.norm.price != null, bedrooms: (o) => o.norm.beds_cat !== "unknown", bathrooms: (o) => o.norm.baths != null, sqft: (o) => o.norm.sqft != null,
    available_date: (o) => o.norm.available.kind !== "none" && o.norm.available.kind !== "text", url: (o) => o.norm.url != null,
    creation_date: (o) => o.norm.created_at != null, area: (o) => o.norm.area != null,
  };
  return (
    <Panel title="Field coverage" sub="How many listings state each field, and how many values the dashboard could use. Stated isn't the same as accurate.">
      <TableWrap maxHeight={420}>
        <table style={{ width: "100%", borderCollapse: "collapse", ...tabular }}>
          <thead><tr><th style={th}>Field</th><th style={{ ...th, textAlign: "right" }}>Stated</th><th style={{ ...th, textAlign: "right" }}>Usable</th><th style={{ ...th, textAlign: "right" }}>Sheet reports</th></tr></thead>
          <tbody>
            {LISTING_FIELDS.map((f) => {
              const present = obs.filter((o) => (o.raw[f] ?? "").trim() && (o.raw[f] ?? "").trim().toLowerCase() !== "unstated").length;
              const use = usable[f] ? obs.filter(usable[f]).length : present;
              return (
                <tr key={f}>
                  <td style={{ ...tdc, fontFamily: "monospace", fontSize: 13 }}>{f}</td>
                  <td style={{ ...tdc, textAlign: "right" }}>{present} ({Math.round((100 * present) / Math.max(1, obs.length))}%)</td>
                  <td style={{ ...tdc, textAlign: "right" }}>{use}</td>
                  <td style={{ ...tdc, textAlign: "right", color: C.muted }}>{reported.get(f) ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableWrap>
    </Panel>
  );
}

function SourceGrid({ grid, page, setPage }: { grid: string[][]; page: number; setPage: (n: number) => void }) {
  const size = 100;
  const width = Math.max(0, ...grid.map((r) => r.length));
  const rows = grid.slice(page * size, page * size + size);
  const col = (i: number) => { let s = ""; i++; while (i) { s = String.fromCharCode(65 + ((i - 1) % 26)) + s; i = Math.floor((i - 1) / 26); } return s; };
  return (
    <>
      <TableWrap maxHeight={480}>
        <table style={{ borderCollapse: "collapse", fontSize: 12 }}>
          <thead><tr><th style={{ ...th, fontSize: 11 }}>#</th>{Array.from({ length: width }, (_, i) => <th key={i} style={{ ...th, fontSize: 11 }}>{col(i)}</th>)}</tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td style={{ ...tdc, fontSize: 11, color: C.faint, padding: "4px 8px" }}>{page * size + i + 1}</td>
                {Array.from({ length: width }, (_, j) => <td key={j} style={{ ...tdc, fontSize: 12, padding: "4px 8px", maxWidth: 260, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={r[j] ?? ""}>{r[j] ?? ""}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>
      {grid.length > size && (
        <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center", fontSize: 13 }}>
          <Button size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
          <span>Rows {page * size + 1}–{Math.min(grid.length, page * size + size)} of {grid.length}</span>
          <Button size="sm" disabled={(page + 1) * size >= grid.length} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </>
  );
}
