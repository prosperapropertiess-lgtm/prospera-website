"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Page, PageHeader, Tabs, Card, Field, inputStyle, Button, Badge, Loading, ErrorNote, SuccessNote, SectionTitle, C, ago, shortDate } from "@/components/admin/kit";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any;
type Tab = "overview" | "prep" | "marketing" | "updates" | "applications" | "steps" | "emails";

const STAGES = ["Onboarding", "Property Preparation", "Marketing", "Showings", "Application Review", "Verification", "Lease & Move-In", "Completed"];
const STAGE_KEYS = ["onboarding", "preparation", "marketing", "showings", "application_review", "verification", "lease_move_in", "completed"];
const PREP_STATUS = [["not_started", "Not started"], ["in_progress", "In progress"], ["completed", "Completed"], ["not_applicable", "Not applicable"]];
const FILE_KINDS = [["photo", "Photos"], ["floor_plan", "Floor plan"], ["walkthrough", "Walkthrough report"], ["report", "Report"], ["lease", "Lease"], ["inspection", "Inspection"], ["document", "Other document"]];
const METRICS = [["listing_views", "Listing views"], ["listing_clicks", "Listing clicks"], ["messages", "Messages received"], ["unique_inquiries", "Unique inquiries"], ["showings_scheduled", "Showings scheduled"], ["showings_completed", "Showings completed"], ["applications", "Applications received"]];
const STEP_STATUS = [["pending", "Not started"], ["in_progress", "In progress"], ["done", "Done"], ["blocked", "On hold"]];

export default function PlacementAdmin() {
  const { id } = useParams() as { id: string };
  const [d, setD] = useState<Any>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [week, setWeek] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/placements/${id}${week ? `?week=${week}` : ""}`);
    const j = await res.json().catch(() => ({}));
    if (!res.ok) setError(j.error ?? "Couldn't load."); else setD(j);
  }, [id, week]);
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, [load]);

  async function act(body: Record<string, unknown>, ok = "Saved."): Promise<Any> {
    setBusy(true); setError(null); setNotice(null);
    const res = await fetch(`/api/admin/placements/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setError(j.error ?? "That didn't work."); return null; }
    setNotice(ok); await load(); return j;
  }
  async function upload(form: FormData, ok = "Uploaded.") {
    setBusy(true); setError(null);
    const res = await fetch(`/api/admin/placements/${id}`, { method: "POST", body: form });
    const j = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setError(j.error ?? "Upload failed."); return null; }
    setNotice(ok); await load(); return j;
  }

  if (!d) return <Page>{error ? <ErrorNote>{error}</ErrorNote> : <Loading />}</Page>;
  const p = d.placement, acct = d.account;
  const pendingReviews = d.reviews.filter((r: Any) => ["released", "clarification"].includes(r.status)).length;
  const failed = d.emails.filter((e: Any) => e.status === "failed").length;

  return (
    <Page width={1000}>
      <PageHeader title={p.address} subtitle={<>{acct?.name} · Stage: <b>{STAGES[d.stageIndex]}</b>{p.is_demo ? " · DEMO" : ""}</>}
        actions={<>
          <Button href={`${d.link}?preview=1`} target="_blank">Preview as owner</Button>
          <Button href="/admin/placements">All clients</Button>
        </>} />
      {error && <ErrorNote>{error}</ErrorNote>}
      {notice && <div style={{ marginBottom: 14 }}><SuccessNote>{notice}</SuccessNote></div>}
      <Tabs value={tab} onChange={setTab} options={[
        { value: "overview", label: "Overview & access" }, { value: "prep", label: "Preparation & files" }, { value: "marketing", label: "Marketing" },
        { value: "updates", label: "Weekly updates" }, { value: "applications", label: "Applications", count: pendingReviews }, { value: "steps", label: "Next steps" },
        { value: "emails", label: "Emails & history", count: failed },
      ]} />

      {tab === "overview" && <Overview d={d} act={act} busy={busy} />}
      {tab === "prep" && <Prep d={d} act={act} upload={upload} busy={busy} />}
      {tab === "marketing" && <MarketingAdmin key={d.week.start} d={d} act={act} busy={busy} setWeek={setWeek} />}
      {tab === "updates" && <Updates key={d.week.start} d={d} act={act} busy={busy} setWeek={setWeek} />}
      {tab === "applications" && <Applications d={d} act={act} busy={busy} />}
      {tab === "steps" && <Steps d={d} act={act} busy={busy} />}
      {tab === "emails" && <Emails d={d} act={act} busy={busy} />}
    </Page>
  );
}

type Props = { d: Any; act: (b: Record<string, unknown>, ok?: string) => Promise<Any>; busy: boolean };

function Overview({ d, act, busy }: Props) {
  const p = d.placement, acct = d.account;
  const [f, setF] = useState({ address: p.address, city: p.city ?? "", cover_url: p.cover_url ?? "", asking_rent: p.asking_rent ?? "", target_date: p.target_date ?? "", next_action: p.next_action ?? "", next_action_owner: p.next_action_owner ?? "Prospera", next_action_due: p.next_action_due ?? "", stage_override: p.stage_override ?? "", status: p.status });
  const [copied, setCopied] = useState(false);
  const set = (k: string, v: string) => setF((x) => ({ ...x, [k]: v }));
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <SectionTitle>Owner access</SectionTitle>
        <p style={{ fontSize: 14, color: C.muted, margin: "0 0 12px" }}>{acct.name} · {acct.email ?? "no email"}{acct.phone ? ` · ${acct.phone}` : ""} · last opened {acct.last_seen_at ? ago(acct.last_seen_at) : "never"}{acct.intro_seen_at ? " · finished the tour" : ""}</p>
        {acct.revoked_at && <p style={{ color: C.red, fontSize: 14 }}>Access is turned off.</p>}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button size="sm" onClick={async () => { await navigator.clipboard.writeText(d.link).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? "Copied" : "Copy private link"}</Button>
          <Button size="sm" disabled={busy || !acct.email || p.is_demo} onClick={() => act({ action: "send_welcome" }, "Welcome email handled. Check Emails & history.")}>{p.welcome_sent_at ? "Welcome sent. Send again" : "Send welcome email"}</Button>
          <Button size="sm" disabled={busy} onClick={() => confirm("Make a new link? The old one stops working.") && act({ action: "regenerate_link", accountId: acct.id }, "New link made. Send it to the owner.")}>New link</Button>
          <Button size="sm" variant="danger" disabled={busy} onClick={() => act({ action: "access", accountId: acct.id, on: !!acct.revoked_at }, acct.revoked_at ? "Access turned on." : "Access turned off.")}>{acct.revoked_at ? "Turn access on" : "Turn access off"}</Button>
        </div>
        {p.welcome_sent_at && <p style={{ fontSize: 13, color: C.muted, marginTop: 10 }}>Welcome sent {shortDate(p.welcome_sent_at)}. Re-sending uses the same email once; failed sends can be retried under Emails.</p>}
      </Card>
      <Card>
        <SectionTitle>Property overview</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
          <Field label="Address"><input style={inputStyle} value={f.address} onChange={(e) => set("address", e.target.value)} /></Field>
          <Field label="City"><input style={inputStyle} value={f.city} onChange={(e) => set("city", e.target.value)} /></Field>
          <Field label="Asking rent"><input style={inputStyle} type="number" value={f.asking_rent} onChange={(e) => set("asking_rent", e.target.value)} /></Field>
          <Field label="Target availability"><input style={inputStyle} type="date" value={f.target_date} onChange={(e) => set("target_date", e.target.value)} /></Field>
          <Field label="Cover photo URL" hint="Or upload photos under Preparation and pick one."><input style={inputStyle} value={f.cover_url} onChange={(e) => set("cover_url", e.target.value)} /></Field>
          <Field label="Next action (owner sees this)"><input style={inputStyle} value={f.next_action} onChange={(e) => set("next_action", e.target.value)} /></Field>
          <Field label="Who's responsible">
            <select style={inputStyle} value={f.next_action_owner} onChange={(e) => set("next_action_owner", e.target.value)}><option>Prospera</option><option>Owner</option><option>Showing specialist</option></select>
          </Field>
          <Field label="By"><input style={inputStyle} type="date" value={f.next_action_due} onChange={(e) => set("next_action_due", e.target.value)} /></Field>
          <Field label="Stage" hint="Worked out from the records. Only override when they can't show it.">
            <select style={inputStyle} value={f.stage_override} onChange={(e) => set("stage_override", e.target.value)}>
              <option value="">Automatic ({STAGES[d.stageIndex]})</option>{STAGE_KEYS.map((k, i) => <option key={k} value={k}>{STAGES[i]}</option>)}
            </select>
          </Field>
          <Field label="Placement status">
            <select style={inputStyle} value={f.status} onChange={(e) => set("status", e.target.value)}><option value="active">Active</option><option value="paused">Paused</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select>
          </Field>
        </div>
        <div style={{ marginTop: 16 }}><Button variant="primary" disabled={busy} onClick={() => act({ action: "update", patch: f })}>Save</Button></div>
      </Card>
    </div>
  );
}

function Prep({ d, act, upload, busy }: Props & { upload: (f: FormData, ok?: string) => Promise<Any> }) {
  const [kind, setKind] = useState("photo");
  const [title, setTitle] = useState("");
  const [visible, setVisible] = useState(true);
  return (
    <div style={{ display: "grid", gap: 16 }}>
      {d.prep.map((x: Any) => <PrepItem key={x.key} x={x} act={act} busy={busy} />)}
      <Card>
        <SectionTitle>Upload files</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, alignItems: "end" }}>
          <Field label="Type"><select style={inputStyle} value={kind} onChange={(e) => setKind(e.target.value)}>{FILE_KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
          <Field label="Title (optional)"><input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
          <label style={{ fontSize: 14 }}><input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} /> Owner can see it</label>
          <label style={{ ...inputStyle, cursor: "pointer", textAlign: "center", fontWeight: 600 }}>
            {busy ? "Uploading…" : "Choose files"}
            <input type="file" multiple style={{ display: "none" }} accept="image/*,application/pdf" onChange={(e) => {
              const fd = new FormData(); fd.set("kind", kind); fd.set("title", title); fd.set("visible", String(visible));
              Array.from(e.target.files ?? []).forEach((f) => fd.append("file", f));
              upload(fd); e.target.value = "";
            }} />
          </label>
        </div>
        <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
          {d.files.map((f: Any) => (
            <div key={f.id} style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
              <span style={{ fontSize: 14 }}><a href={f.url} target="_blank" rel="noreferrer" style={{ color: C.navy, fontWeight: 600 }}>{f.title}</a> <span style={{ color: C.muted }}>· {f.kind}</span></span>
              <span style={{ display: "flex", gap: 6 }}>
                {f.kind === "photo" && <Button size="sm" onClick={() => act({ action: "update", patch: { cover_url: `file:${f.id}` } }, "Cover photo set.")}>Use as cover</Button>}
                <Button size="sm" onClick={() => act({ action: "file_visible", fileId: f.id, visible: !f.client_visible }, f.client_visible ? "Hidden from owner." : "Owner can see it.")}>{f.client_visible ? "Visible to owner" : "Hidden"}</Button>
                <Button size="sm" variant="danger" onClick={() => confirm("Delete this file?") && act({ action: "file_delete", fileId: f.id }, "Deleted.")}>Delete</Button>
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function PrepItem({ x, act, busy }: { x: Any; act: Props["act"]; busy: boolean }) {
  const [status, setStatus] = useState(x.status);
  const [date, setDate] = useState(x.completed_on ?? "");
  const [notes, setNotes] = useState(x.notes ?? "");
  const [links, setLinks] = useState((x.links ?? []).map((l: Any) => `${l.label}|${l.url}`).join("\n"));
  return (
    <Card padding={18}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <b style={{ color: C.navy }}>{x.label}</b>
        <span style={{ fontSize: 13, color: C.muted }}>{x.files.length ? `${x.files.length} file${x.files.length > 1 ? "s" : ""}` : ""}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginTop: 12 }}>
        <Field label={x.key === "lawn_sign" ? "Installed?" : "Status"}>
          <select style={inputStyle} value={status} onChange={(e) => setStatus(e.target.value)}>
            {(x.key === "lawn_sign" ? [["not_started", "No"], ["completed", "Yes"], ["not_applicable", "Not applicable"]] : PREP_STATUS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </Field>
        <Field label={x.key === "listing" ? "Published on" : "Completed on"}><input style={inputStyle} type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <Field label="Notes (owner sees these)"><input style={inputStyle} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
      </div>
      {x.key === "listing" && (
        <Field label="Listing links (one per line: Label|https://…)"><textarea style={{ ...inputStyle, minHeight: 70 }} value={links} onChange={(e) => setLinks(e.target.value)} placeholder={"Our website|https://www.prosperaproperties.co/listings/...\nKijiji|https://..."} /></Field>
      )}
      <div style={{ marginTop: 12 }}>
        <Button size="sm" variant="primary" disabled={busy} onClick={() => act({ action: "prep", item: x.key, patch: {
          status, completed_on: date || null, notes: notes || null,
          ...(x.key === "listing" ? { links: links.split("\n").map((l: string) => l.trim()).filter(Boolean).map((l: string) => { const [a, b] = l.includes("|") ? l.split("|") : ["", l]; return { label: a.trim(), url: b.trim() }; }) } : {}),
        } }, `${x.label} saved.`)}>Save</Button>
      </div>
    </Card>
  );
}

function weekOptions() {
  const out: { start: string; label: string }[] = [];
  const now = new Date();
  const monday = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7)));
  for (let i = 0; i < 10; i++) {
    const s = new Date(monday.getTime() - i * 7 * 864e5);
    out.push({ start: s.toISOString().slice(0, 10), label: `${s.toLocaleDateString("en-CA", { month: "short", day: "numeric", timeZone: "UTC" })} week${i === 0 ? " (this week)" : ""}` });
  }
  return out;
}

function MarketingAdmin({ d, act, busy, setWeek }: Props & { setWeek: (w: string) => void }) {
  const row = d.metrics.find((m: Any) => m.week_start === d.week.start);
  const [vals, setVals] = useState<Record<string, string>>(() => Object.fromEntries(METRICS.map(([k]) => [k, row?.[k] != null ? String(row[k]) : ""])));
  const [notes, setNotes] = useState(row?.notes ?? "");
  const rec = d.recorded;
  return (
    <Card>
      <SectionTitle right={<select style={{ ...inputStyle, width: "auto" }} value={d.week.start} onChange={(e) => setWeek(e.target.value)}>{weekOptions().map((w) => <option key={w.start} value={w.start}>{w.label}</option>)}</select>}>
        Weekly marketing numbers
      </SectionTitle>
      <p style={{ fontSize: 14, color: C.muted, margin: "0 0 14px" }}>Week {d.week.start} to {d.week.end}. Leave a box blank if we can&apos;t measure it. The owner sees “Not available”, never a zero. {row ? `Last saved ${ago(row.updated_at)}.` : "Not saved yet."}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
        {METRICS.map(([k, l]) => (
          <Field key={k} label={l} hint={rec && rec[k] != null ? <>From our records: <b>{rec[k]}</b> <button type="button" style={{ background: "none", border: 0, color: C.navy, textDecoration: "underline", cursor: "pointer", fontSize: 13 }} onClick={() => setVals((v) => ({ ...v, [k]: String(rec[k]) }))}>use</button></> : undefined}>
            <input style={inputStyle} type="number" min={0} value={vals[k]} onChange={(e) => setVals((v) => ({ ...v, [k]: e.target.value }))} />
          </Field>
        ))}
      </div>
      <Field label="Note for the owner (optional)"><input style={inputStyle} value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
      <div style={{ marginTop: 14 }}>
        <Button variant="primary" disabled={busy} onClick={() => act({ action: "metrics", week: d.week, values: Object.fromEntries(Object.entries(vals).map(([k, v]) => [k, v === "" ? null : Number(v)])), notes: notes || null }, "Marketing numbers saved. The owner sees them now.")}>Save week</Button>
      </div>
    </Card>
  );
}

function Updates({ d, act, busy, setWeek }: Props & { setWeek: (w: string) => void }) {
  const draft = d.updates.find((u: Any) => u.status === "draft" && u.week_start === d.week.start);
  const blank = { id: undefined, week_start: d.week.start, week_end: d.week.end, summary: "", showings_scheduled: d.recorded?.showings_scheduled ?? "", showings_completed: d.recorded?.showings_completed ?? "", cancellations: d.recorded?.cancellations ?? "", no_shows: d.recorded?.no_shows ?? "", specialist_feedback: "", prospect_feedback: "", market_feedback: "", recommendations: "", action_items: [] as Any[], ai_drafted: false };
  const [u, setU] = useState<Any>(draft ?? blank);
  const [drafting, setDrafting] = useState(false);
  const set = (k: string, v: unknown) => setU((x: Any) => ({ ...x, [k]: v }));
  const published = d.updates.filter((x: Any) => x.status === "published");
  const nums = (o: Any) => ({ ...o, ...Object.fromEntries(["showings_scheduled", "showings_completed", "cancellations", "no_shows"].map((k) => [k, o[k] === "" || o[k] == null ? null : Number(o[k])])) });
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <SectionTitle right={<select style={{ ...inputStyle, width: "auto" }} value={d.week.start} onChange={(e) => setWeek(e.target.value)}>{weekOptions().map((w) => <option key={w.start} value={w.start}>{w.label}</option>)}</select>}>
          {u.id ? "Draft update" : "New weekly update"}
        </SectionTitle>
        <p style={{ fontSize: 14, color: C.muted, margin: "0 0 12px" }}>Draft with AI from this week&apos;s viewing reports, then edit. Nothing reaches the owner until you publish. Keep internal notes out.</p>
        <Button disabled={busy || drafting} onClick={async () => {
          setDrafting(true);
          const r = await act({ action: "draft_update", week: d.week }, "Draft ready. Read it before publishing.");
          setDrafting(false);
          if (r?.draft) setU((x: Any) => ({ ...x, ...r.draft, ...(r.counts ? { showings_scheduled: r.counts.showings_scheduled, showings_completed: r.counts.showings_completed, cancellations: r.counts.cancellations, no_shows: r.counts.no_shows } : {}), ai_drafted: true }));
        }}>{drafting ? "Drafting…" : "Draft with AI"}</Button>
        <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
          <Field label="Summary (goes in the email too)"><textarea style={{ ...inputStyle, minHeight: 90 }} value={u.summary ?? ""} onChange={(e) => set("summary", e.target.value)} /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
            {[["showings_scheduled", "Scheduled"], ["showings_completed", "Completed"], ["cancellations", "Cancellations"], ["no_shows", "No-shows"]].map(([k, l]) => <Field key={k} label={l}><input style={inputStyle} type="number" value={u[k] ?? ""} onChange={(e) => set(k, e.target.value)} /></Field>)}
          </div>
          {[["specialist_feedback", "Showing specialist feedback"], ["prospect_feedback", "Common prospect feedback and objections"], ["market_feedback", "Market feedback"], ["recommendations", "Prospera's recommendations"]].map(([k, l]) => (
            <Field key={k} label={l}><textarea style={{ ...inputStyle, minHeight: 70 }} value={u[k] ?? ""} onChange={(e) => set(k, e.target.value)} /></Field>
          ))}
          <Field label="Next action items (one per line: item | Prospera or Owner | due)">
            <textarea style={{ ...inputStyle, minHeight: 70 }} value={(u.action_items ?? []).map((a: Any) => `${a.item} | ${a.owner ?? ""} | ${a.due ?? ""}`).join("\n")}
              onChange={(e) => set("action_items", e.target.value.split("\n").filter((l) => l.trim()).map((l) => { const [item, owner, due] = l.split("|").map((x) => x?.trim() ?? ""); return { item, owner, due }; }))} />
          </Field>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <Button disabled={busy} onClick={async () => { const r = await act({ action: "save_update", update: nums(u) }, "Draft saved."); if (r?.id) set("id", r.id); }}>Save draft</Button>
          <Button variant="primary" disabled={busy || !u.summary?.trim()} onClick={async () => {
            const r = await act({ action: "save_update", update: nums(u) });
            if (r?.id && confirm("Publish this update to the owner's dashboard and email them?")) {
              const p = await act({ action: "publish_update", updateId: r.id }, "Published and emailed.");
              if (p) setU(blank);
            }
          }}>Publish and email owner</Button>
        </div>
      </Card>
      <Card>
        <SectionTitle>Published ({published.length})</SectionTitle>
        {published.length === 0 ? <p style={{ color: C.muted, fontSize: 14 }}>None yet.</p> : published.map((x: Any) => (
          <div key={x.id} style={{ borderTop: `1px solid ${C.border}`, padding: "10px 0", fontSize: 14 }}>
            <b>Week of {x.week_start}</b> · published {shortDate(x.published_at)}{x.ai_drafted ? " · AI-drafted, edited by you" : ""}
            <div style={{ color: C.muted, marginTop: 4 }}>{x.summary}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function Applications({ d, act, busy }: Props) {
  const released = new Set(d.reviews.map((r: Any) => r.application_id));
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <SectionTitle>Applications for this home</SectionTitle>
        {!d.placement.property_id ? <p style={{ fontSize: 14, color: C.muted }}>Link this placement to a listing (Overview) to see its applications.</p> : d.applications.length === 0 ? <p style={{ fontSize: 14, color: C.muted }}>No applications yet.</p> : d.applications.map((a: Any) => (
          <div key={a.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", borderTop: `1px solid ${C.border}`, padding: "10px 0" }}>
            <span style={{ fontSize: 14 }}><Link href={`/admin/applications/${a.id}`} style={{ color: C.navy, fontWeight: 600 }}>{a.tenant_name}</Link> · {shortDate(a.created_at)}{a.ai_score ? ` · AI ${a.ai_score}/10` : ""}</span>
            {released.has(a.id) ? <Badge tone="blue">Released</Badge> : <Button size="sm" disabled={busy || !a.ai_summary} onClick={() => confirm(`Release ${a.tenant_name} for the owner's review? Check the summary after.`) && act({ action: "release", applicationId: a.id }, "Released. Edit the owner summary below.")}>{a.ai_summary ? "Release to owner" : "Waiting for AI review"}</Button>}
          </div>
        ))}
      </Card>
      {d.reviews.map((r: Any) => <ReviewAdmin key={r.id} r={r} act={act} busy={busy} />)}
    </div>
  );
}

function ReviewAdmin({ r, act, busy }: { r: Any; act: Props["act"]; busy: boolean }) {
  const [f, setF] = useState({ applicant_summary: r.applicant_summary, move_in: r.move_in ?? "", proposed_rent: r.proposed_rent ?? "", terms: r.terms ?? "", admin_summary: r.admin_summary ?? "", recommendation: r.recommendation ?? "",
    verified: (r.verified ?? []).map((x: Any) => `${x.item}: ${x.detail}`).join("\n"), preliminary: (r.preliminary ?? []).map((x: Any) => `${x.item}: ${x.detail}`).join("\n"), outstanding: (r.outstanding_checks ?? []).join("\n") });
  const [reply, setReply] = useState("");
  const [note, setNote] = useState("");
  const toItems = (s: string) => s.split("\n").filter((l) => l.trim()).map((l) => { const i = l.indexOf(":"); return i > 0 ? { item: l.slice(0, i).trim(), detail: l.slice(i + 1).trim() } : { item: l.trim(), detail: "" }; });
  const tone = { released: "red", clarification: "amber", approved: "green", completed: "green", declined: "grey", paused: "amber", withdrawn: "grey" }[r.status as string] as Any;
  return (
    <Card>
      <SectionTitle right={<Badge tone={tone}>{r.status}</Badge>}>{r.applicant_summary}</SectionTitle>
      {r.flagged && <ErrorNote>Flagged: {r.flag_reason} Owner&apos;s reason: “{r.decision_reason}{r.decision_comments ? `: ${r.decision_comments}` : ""}”. Review before acting. Their comments aren&apos;t sent to the applicant.</ErrorNote>}
      {r.status === "declined" && !r.flagged && <p style={{ fontSize: 14 }}>Declined by {r.decided_by} on {shortDate(r.decided_at)}: {r.decision_reason}{r.decision_comments ? `. “${r.decision_comments}”` : ""}</p>}
      {(r.status === "approved" || r.status === "completed") && <p style={{ fontSize: 14 }}>Approved to proceed by {r.decided_by} on {shortDate(r.decided_at)}. Manage the timeline under Next steps.</p>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
        <Field label="Applicant summary (no contact details)"><input style={inputStyle} value={f.applicant_summary} onChange={(e) => setF({ ...f, applicant_summary: e.target.value })} /></Field>
        <Field label="Proposed move-in"><input style={inputStyle} type="date" value={f.move_in} onChange={(e) => setF({ ...f, move_in: e.target.value })} /></Field>
        <Field label="Proposed rent"><input style={inputStyle} type="number" value={f.proposed_rent} onChange={(e) => setF({ ...f, proposed_rent: e.target.value })} /></Field>
        <Field label="Relevant terms"><input style={inputStyle} value={f.terms} onChange={(e) => setF({ ...f, terms: e.target.value })} placeholder="e.g. 12-month lease, one cat" /></Field>
      </div>
      <Field label="Your summary"><textarea style={{ ...inputStyle, minHeight: 70 }} value={f.admin_summary} onChange={(e) => setF({ ...f, admin_summary: e.target.value })} /></Field>
      <Field label="Your recommendation"><input style={inputStyle} value={f.recommendation} onChange={(e) => setF({ ...f, recommendation: e.target.value })} /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12 }}>
        <Field label="Verified (Item: detail, one per line)"><textarea style={{ ...inputStyle, minHeight: 90 }} value={f.verified} onChange={(e) => setF({ ...f, verified: e.target.value })} /></Field>
        <Field label="Preliminary, not yet verified"><textarea style={{ ...inputStyle, minHeight: 90 }} value={f.preliminary} onChange={(e) => setF({ ...f, preliminary: e.target.value })} /></Field>
        <Field label="Outstanding checks (one per line)"><textarea style={{ ...inputStyle, minHeight: 90 }} value={f.outstanding} onChange={(e) => setF({ ...f, outstanding: e.target.value })} /></Field>
      </div>
      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button variant="primary" disabled={busy} onClick={() => act({ action: "review", reviewId: r.id, patch: { applicant_summary: f.applicant_summary, move_in: f.move_in || null, proposed_rent: f.proposed_rent || null, terms: f.terms || null, admin_summary: f.admin_summary || null, recommendation: f.recommendation || null, verified: toItems(f.verified), preliminary: toItems(f.preliminary), outstanding_checks: f.outstanding.split("\n").map((x: string) => x.trim()).filter(Boolean) } }, "Saved. The owner sees it now.")}>Save</Button>
      </div>
      {r.messages.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <b style={{ fontSize: 14 }}>Questions</b>
          {r.messages.map((m: Any) => <p key={m.id} style={{ fontSize: 14, margin: "6px 0" }}><b>{m.sender === "owner" ? "Owner" : "You"}:</b> {m.body} <span style={{ color: C.muted }}>· {ago(m.created_at)}</span></p>)}
        </div>
      )}
      {["released", "clarification"].includes(r.status) && (
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <input style={inputStyle} placeholder="Reply to the owner (emailed to them)" value={reply} onChange={(e) => setReply(e.target.value)} />
          <Button disabled={busy || !reply.trim()} onClick={async () => { if (await act({ action: "reply", reviewId: r.id, body: reply }, "Reply sent.")) setReply(""); }}>Send</Button>
        </div>
      )}
      {(r.status === "approved" || r.status === "released" || r.status === "clarification") && (
        <div style={{ display: "flex", gap: 8, marginTop: 16, alignItems: "center", flexWrap: "wrap" }}>
          <input style={{ ...inputStyle, maxWidth: 360 }} placeholder="What happened? (kept in history)" value={note} onChange={(e) => setNote(e.target.value)} />
          <Button size="sm" disabled={busy || !note.trim()} onClick={() => act({ action: "review", reviewId: r.id, patch: { status: "paused", outcome_note: note } }, "Paused. History is kept.")}>Pause (verification failed)</Button>
          <Button size="sm" disabled={busy || !note.trim()} onClick={() => act({ action: "review", reviewId: r.id, patch: { status: "withdrawn", outcome_note: note } }, "Marked withdrawn. History is kept.")}>Applicant withdrew</Button>
        </div>
      )}
      {r.outcome_note && <p style={{ fontSize: 13, color: C.muted, marginTop: 8 }}>Outcome: {r.outcome_note}</p>}
    </Card>
  );
}

function Steps({ d, act, busy }: Props) {
  const approved = d.reviews.filter((r: Any) => r.steps.length);
  if (!approved.length) return <Card><p style={{ fontSize: 14, color: C.muted, margin: 0 }}>The next-steps timeline appears once the owner approves an applicant to proceed. Approval marks nothing as done; you confirm each step here.</p></Card>;
  return (
    <div style={{ display: "grid", gap: 16 }}>
      {approved.map((r: Any) => (
        <Card key={r.id}>
          <SectionTitle>{r.applicant_summary}</SectionTitle>
          {r.steps.map((s: Any) => <StepRow key={s.id} s={s} files={d.files} act={act} busy={busy} />)}
        </Card>
      ))}
    </div>
  );
}

function StepRow({ s, files, act, busy }: { s: Any; files: Any[]; act: Props["act"]; busy: boolean }) {
  const [f, setF] = useState({ status: s.status, target_date: s.target_date ?? "", responsible: s.responsible ?? "", owner_action: s.owner_action ?? "", file_ids: (s.file_ids ?? []) as string[] });
  const visible = files.filter((x: Any) => x.client_visible);
  return (
    <div style={{ borderTop: `1px solid ${C.border}`, padding: "12px 0", display: "grid", gap: 8 }}>
      <b style={{ color: C.navy, fontSize: 14 }}>{s.step_no}. {s.title}{s.completed_at ? <span style={{ color: C.muted, fontWeight: 400 }}> · done {shortDate(s.completed_at)}</span> : null}</b>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 8 }}>
        <select style={inputStyle} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>{STEP_STATUS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        <input style={inputStyle} type="date" value={f.target_date} onChange={(e) => setF({ ...f, target_date: e.target.value })} title="Target or scheduled date" />
        <input style={inputStyle} value={f.responsible} onChange={(e) => setF({ ...f, responsible: e.target.value })} placeholder="Responsible" />
        <input style={inputStyle} value={f.owner_action} onChange={(e) => setF({ ...f, owner_action: e.target.value })} placeholder="Needed from owner (optional)" />
      </div>
      {visible.length > 0 && (
        <select multiple style={{ ...inputStyle, height: 70 }} value={f.file_ids} onChange={(e) => setF({ ...f, file_ids: Array.from(e.target.selectedOptions).map((o) => o.value) })} title="Documents for this step">
          {visible.map((x: Any) => <option key={x.id} value={x.id}>{x.title}</option>)}
        </select>
      )}
      <div><Button size="sm" variant="primary" disabled={busy} onClick={() => act({ action: "step", stepId: s.id, patch: { ...f, target_date: f.target_date || null, owner_action: f.owner_action || null } }, `Step ${s.step_no} saved.`)}>Save step</Button></div>
    </div>
  );
}

function Emails({ d, act, busy }: Props) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <SectionTitle>Emails</SectionTitle>
        {d.emails.length === 0 ? <p style={{ fontSize: 14, color: C.muted }}>None yet.</p> : d.emails.map((e: Any) => (
          <div key={e.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, borderTop: `1px solid ${C.border}`, padding: "10px 0", alignItems: "center" }}>
            <span style={{ fontSize: 14 }}><b>{e.subject}</b><br /><span style={{ color: C.muted }}>{e.recipient} · {e.kind} · {ago(e.sent_at ?? e.created_at)}{e.error ? ` · ${e.error}` : ""}</span></span>
            <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Badge tone={e.status === "sent" ? "green" : e.status === "failed" ? "red" : "grey"}>{e.status}</Badge>
              {e.status === "failed" && <Button size="sm" disabled={busy} onClick={() => act({ action: "retry_email", emailId: e.id }, "Retried. Check the status.")}>Retry</Button>}
            </span>
          </div>
        ))}
      </Card>
      <Card>
        <SectionTitle>History</SectionTitle>
        {d.events.map((e: Any, i: number) => (
          <div key={i} style={{ fontSize: 14, borderTop: `1px solid ${C.border}`, padding: "8px 0" }}>
            <b>{e.kind.replace(/_/g, " ")}</b> <span style={{ color: C.muted }}>· {e.actor} · {new Date(e.created_at).toLocaleString("en-CA", { timeZone: "America/Toronto" })}</span>
            {Object.keys(e.detail ?? {}).length > 0 && <div style={{ color: C.muted, fontSize: 13 }}>{Object.entries(e.detail).map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`).join(" · ")}</div>}
          </div>
        ))}
      </Card>
    </div>
  );
}
