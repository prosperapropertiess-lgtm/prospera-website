"use client";
// The owner's placement dashboard. Answers, in order: what's been done, what
// interest we're getting, what prospects say, whether a decision is needed, what's next.
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InstallGuide from "./InstallGuide";

const NAVY = "#1F2F3A", BURGUNDY = "#8B2030", BORDER = "#D8D2C8", MUTED = "#666666", GREEN = "#2F6B3F", BG = "#F7F5F2";
const STAGES = ["Onboarding", "Property Preparation", "Marketing", "Showings", "Application Review", "Verification", "Lease & Move-In", "Completed"];
const DECLINE_REASONS = ["Income doesn't cover the rent comfortably", "Rental history or references", "Move-in date doesn't work", "Number of people for the size of the home", "Lease terms requested don't work", "I'd like to see other applicants first", "Other"];

const METRICS: { key: string; label: string; what: string }[] = [
  { key: "listing_views", label: "Listing views", what: "How many times your listing was opened on the sites we post to." },
  { key: "listing_clicks", label: "Listing clicks", what: "Clicks from the listing to contact us or request a viewing." },
  { key: "messages", label: "Messages received", what: "Messages and calls about your home, across every channel." },
  { key: "unique_inquiries", label: "Unique inquiries", what: "Different people who asked. Someone who reached out twice counts once." },
  { key: "showings_scheduled", label: "Showings scheduled", what: "Viewings booked for the week." },
  { key: "showings_completed", label: "Showings completed", what: "Viewings that actually happened." },
  { key: "applications", label: "Applications received", what: "Completed applications submitted for your home." },
];

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any;

const fDate = (d?: string | null) => (d ? new Date(d.length === 10 ? `${d}T12:00:00Z` : d).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric", ...(d.length === 10 ? { timeZone: "UTC" } : { timeZone: "America/Toronto" }) }) : "");
const fShort = (d?: string | null) => (d ? new Date(`${d.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-CA", { month: "short", day: "numeric", timeZone: "UTC" }) : "");
const money = (n?: number | null) => (n == null ? "Not set" : `$${Number(n).toLocaleString("en-CA")}`);

function Card({ children, id, className = "" }: { children: React.ReactNode; id?: string; className?: string }) {
  return <section id={id} className={`rounded-2xl border bg-white p-5 scroll-mt-20 ${className}`} style={{ borderColor: BORDER }}>{children}</section>;
}
function H2({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-[20px] font-bold" style={{ color: NAVY, fontFamily: "var(--font-cormorant)" }}>{children}</h2>
      {sub && <p className="text-sm mt-0.5" style={{ color: MUTED }}>{sub}</p>}
    </div>
  );
}
function Status({ s }: { s: string }) {
  const m: Record<string, [string, string, string]> = {
    completed: ["Completed", "#EAF3EC", GREEN], done: ["Done", "#EAF3EC", GREEN], in_progress: ["In progress", "#FBF1DC", "#8A5A00"],
    not_started: ["Not started", "#F1EEE9", "#555"], pending: ["Not started", "#F1EEE9", "#555"], not_applicable: ["Not applicable", "#F1EEE9", "#777"], blocked: ["On hold", "#F8EAEC", BURGUNDY],
  };
  const [label, bg, fg] = m[s] ?? [s, "#F1EEE9", "#555"];
  return <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold shrink-0" style={{ background: bg, color: fg }}>
    <span aria-hidden="true">{s === "completed" || s === "done" ? "✓" : s === "in_progress" ? "◐" : s === "blocked" ? "!" : "○"}</span>{label}
  </span>;
}

export default function ClientDashboard({ token, placementId }: { token: string; placementId?: string }) {
  const router = useRouter();
  const [data, setData] = useState<Any>(null);
  const [error, setError] = useState<string | null>(null);
  const [intro, setIntro] = useState(false);
  const [help, setHelp] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [preview, setPreview] = useState<boolean | null>(null);
  useEffect(() => { const t = setTimeout(() => setPreview(new URLSearchParams(window.location.search).get("preview") === "1"), 0); return () => clearTimeout(t); }, []);

  const load = useCallback(async () => {
    if (preview === null) return;
    const qs = new URLSearchParams();
    if (placementId) qs.set("placement", placementId);
    if (preview) qs.set("preview", "1");
    const res = await fetch(`/api/client/${token}?${qs}`, { cache: "no-store" });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setError(d.error ?? "Couldn't load your dashboard."); return; }
    setData(d);
    let seen = d.account.introSeen;
    try { seen = seen || localStorage.getItem("pp_intro_seen") === "1"; } catch {}
    if (!seen && !d.preview) setIntro(true);
  }, [token, placementId, preview]);
  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, [load]);

  async function act(body: Record<string, unknown>, ok?: string) {
    const res = await fetch(`/api/client/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, preview: data?.preview }) });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setToast(d.error ?? "That didn't go through. Try again."); return false; }
    if (ok) setToast(ok);
    await load();
    return true;
  }
  function closeIntro() {
    setIntro(false);
    try { localStorage.setItem("pp_intro_seen", "1"); } catch {}
    if (!data?.preview) act({ action: "intro_seen" });
  }
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 5000); return () => clearTimeout(t); }, [toast]);

  if (error) return <Shell><div className="rounded-2xl border bg-white p-6" style={{ borderColor: BORDER }}><p className="font-semibold" style={{ color: NAVY }}>{error}</p><p className="text-sm mt-2" style={{ color: MUTED }}>Call or text Ebin at (519) 697-1227.</p></div></Shell>;
  if (!data) return <Shell><div className="grid gap-3">{[180, 120, 220].map((h) => <div key={h} className="rounded-2xl bg-white animate-pulse" style={{ height: h }} />)}</div></Shell>;
  if (!data.view) return <Shell><Card><p style={{ color: NAVY }}>No properties on your dashboard yet. We&apos;ll add yours as soon as it&apos;s set up.</p></Card></Shell>;

  const v = data.view, p = v.placement;
  const pending = v.reviews.filter((r: Any) => ["released", "clarification"].includes(r.status));
  const approved = v.reviews.filter((r: Any) => r.status === "approved" || r.status === "completed");
  const latestUpdate = v.updates[0];
  const doneCount = v.prep.filter((x: Any) => x.status === "completed" || x.status === "not_applicable").length;
  const m0 = v.metrics[0];

  return (
    <Shell
      top={
        <div className="flex items-center gap-2">
          {data.placements.length > 1 && (
            <select aria-label="Choose a property" value={p.id} onChange={(e) => router.push(`/client/${token}/${e.target.value}${data.preview ? "?preview=1" : ""}`)}
              className="rounded-lg border px-2 py-1.5 text-sm max-w-[170px]" style={{ borderColor: BORDER, color: NAVY }}>
              {data.placements.map((x: Any) => <option key={x.id} value={x.id}>{x.address}</option>)}
            </select>
          )}
          <button type="button" onClick={() => setHelp(true)} className="rounded-lg border px-3 py-1.5 text-sm font-semibold" style={{ borderColor: BORDER, color: NAVY }}>Help</button>
        </div>
      }>
      {data.preview && <Banner tone="navy">Admin preview. This is exactly what {data.account.name} sees. Buttons are turned off.</Banner>}
      {p.is_demo && <Banner tone="amber">Demo dashboard. Not a real client.</Banner>}

      {/* Overview */}
      <div className="rounded-2xl overflow-hidden border bg-white" style={{ borderColor: BORDER }}>
        {p.cover_url
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={p.cover_url} alt="" className="w-full h-44 object-cover" />
          : <div className="h-20" style={{ background: NAVY }} />}
        <div className="p-5">
          <p className="text-sm" style={{ color: MUTED }}>Hi {data.account.name.split(" ")[0]}. Your property</p>
          <h1 className="text-[26px] font-bold leading-tight capitalize" style={{ color: NAVY, fontFamily: "var(--font-cormorant)" }}>{p.address}</h1>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Fact k="Asking rent" v={p.asking_rent ? `${money(p.asking_rent)}/mo` : "Not set yet"} />
            <Fact k="Target availability" v={p.target_date ? fDate(p.target_date) : "Not set yet"} />
            <Fact k="Stage" v={STAGES[v.stageIndex] ?? "—"} />
            <Fact k="Last update" v={v.latestUpdate ? fDate(v.latestUpdate) : "—"} />
          </div>
          {p.next_action && (
            <div className="mt-4 rounded-xl p-4" style={{ background: BG, borderLeft: `4px solid ${NAVY}` }}>
              <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: MUTED }}>Next</div>
              <div className="text-[16px] font-semibold mt-1" style={{ color: NAVY }}>{p.next_action}</div>
              <div className="text-sm mt-0.5" style={{ color: MUTED }}>{p.next_action_owner ? `${p.next_action_owner === "Owner" ? "You" : p.next_action_owner}` : ""}{p.next_action_due ? ` · by ${fDate(p.next_action_due)}` : ""}</div>
            </div>
          )}
        </div>
      </div>

      {/* At a glance */}
      <div className="grid grid-cols-2 gap-2.5">
        <Glance href="#prep" k="What's been done" v={`${doneCount} of ${v.prep.length} prep items`} />
        <Glance href="#marketing" k="Interest" v={m0 && m0.unique_inquiries != null ? `${m0.unique_inquiries} inquiries this week` : "Awaiting update"} />
        <Glance href="#updates" k="What prospects say" v={latestUpdate ? `Update ${fShort(latestUpdate.week_end)}` : "No updates yet"} />
        <Glance href="#applications" k="Decision needed" v={pending.length ? `${pending.length} application${pending.length > 1 ? "s" : ""} to review` : "Nothing right now"} hot={pending.length > 0} />
      </div>

      {/* Progress */}
      <Card id="progress">
        <H2 sub="Based on what's actually been recorded.">Progress</H2>
        <ol className="grid gap-0">
          {STAGES.map((s, i) => {
            const state = i < v.stageIndex ? "done" : i === v.stageIndex ? "now" : "next";
            return (
              <li key={s} className="flex gap-3 items-stretch">
                <div className="flex flex-col items-center">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" aria-label={state === "done" ? "Completed" : state === "now" ? "Current stage" : "Upcoming"}
                    style={{ background: state === "done" ? GREEN : state === "now" ? BURGUNDY : "#fff", color: state === "next" ? MUTED : "#fff", border: state === "next" ? `2px solid ${BORDER}` : "none" }}>
                    {state === "done" ? "✓" : i + 1}
                  </span>
                  {i < STAGES.length - 1 && <span className="w-0.5 flex-1 min-h-[14px]" style={{ background: i < v.stageIndex ? GREEN : BORDER }} />}
                </div>
                <div className="pb-3 pt-0.5">
                  <div className="text-[15px] font-semibold" style={{ color: state === "next" ? MUTED : NAVY }}>{s}</div>
                  {state === "now" && <div className="text-xs font-semibold" style={{ color: BURGUNDY }}>We&apos;re here</div>}
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      {/* Preparation */}
      <Card id="prep">
        <H2 sub="Getting your home ready to market.">Property preparation</H2>
        <div className="grid gap-3">
          {v.prep.map((x: Any) => <PrepRow key={x.key} x={x} />)}
        </div>
      </Card>

      {/* Marketing */}
      <Marketing metrics={v.metrics} />

      {/* Weekly updates */}
      <Card id="updates">
        <H2 sub="Showings, what prospects said and what we recommend.">Weekly updates</H2>
        {v.updates.length === 0 ? <p className="text-[15px]" style={{ color: MUTED }}>Your first weekly update arrives after the listing&apos;s first full week.</p> : (
          <div className="grid gap-3">{v.updates.map((u: Any, i: number) => <UpdateCard key={u.id} u={u} open={i === 0} />)}</div>
        )}
      </Card>

      {/* Applications */}
      <Card id="applications">
        <H2 sub="Applicants we've screened and shared with you.">Applications</H2>
        {v.reviews.length === 0 ? <p className="text-[15px]" style={{ color: MUTED }}>No applications to review yet. We&apos;ll email you when one is ready.</p> : (
          <div className="grid gap-4">
            {v.reviews.map((r: Any) => <ReviewCard key={r.id} r={r} disabled={!!data.preview} act={act} />)}
          </div>
        )}
      </Card>

      {approved.map((r: Any) => <NextSteps key={r.id} r={r} />)}

      {/* Files */}
      <Card id="files">
        <H2 sub="Photos, floor plan and reports we've shared with you.">Files</H2>
        {v.files.length === 0 ? <p className="text-[15px]" style={{ color: MUTED }}>Files show up here as we finish them.</p> : (
          <div className="grid gap-2">
            {v.files.filter((f: Any) => f.kind !== "photo").map((f: Any) => <FileRow key={f.id} f={f} />)}
            <Gallery files={v.files.filter((f: Any) => f.kind === "photo")} />
          </div>
        )}
      </Card>

      <p className="text-center text-sm py-4" style={{ color: MUTED }}>Questions? Call or text Ebin at <a href="tel:5196971227" className="underline">(519) 697-1227</a>.</p>

      {toast && <div role="status" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg max-w-[90vw]" style={{ background: NAVY, color: "#FAF8F5" }}>{toast}</div>}
      {intro && <Intro onClose={closeIntro} />}
      {help && (
        <Sheet title="Help" onClose={() => setHelp(false)}>
          <button type="button" onClick={() => { setHelp(false); setIntro(true); }} className="w-full rounded-xl border-2 py-3 font-semibold mb-5" style={{ borderColor: NAVY, color: NAVY }}>Show the dashboard tour again</button>
          <h3 className="font-bold text-[17px] mb-3" style={{ color: NAVY }}>Add it to your home screen</h3>
          <InstallGuide />
          <p className="text-sm mt-6" style={{ color: MUTED }}>This link is private to you. Don&apos;t forward the email it came in. If you lose it, ask Ebin for a new one.</p>
        </Sheet>
      )}
      <style>{`
        .pp-in{animation:ppIn .35s ease-out both}
        @keyframes ppIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @media (prefers-reduced-motion: reduce){.pp-in{animation:none}}
      `}</style>
    </Shell>
  );
}

function Shell({ children, top }: { children: React.ReactNode; top?: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: BG, fontFamily: "var(--font-dm-sans)" }}>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b px-4 py-3 flex items-center justify-between gap-3" style={{ borderColor: BORDER }}>
        <span className="text-[17px] font-bold" style={{ color: NAVY, fontFamily: "var(--font-cormorant)" }}>Prospera <span style={{ color: MUTED, fontWeight: 600 }}>My Property</span></span>
        {top}
      </header>
      <main className="max-w-2xl mx-auto px-4 py-5 grid gap-4 pp-in">{children}</main>
    </div>
  );
}

function Banner({ children, tone }: { children: React.ReactNode; tone: "navy" | "amber" }) {
  return <div className="rounded-xl px-4 py-3 text-sm font-semibold" style={tone === "navy" ? { background: NAVY, color: "#FAF8F5" } : { background: "#FBF1DC", color: "#8A5A00" }}>{children}</div>;
}
function Fact({ k, v }: { k: string; v: string }) {
  return <div><div className="text-xs" style={{ color: MUTED }}>{k}</div><div className="text-[15px] font-semibold" style={{ color: NAVY }}>{v}</div></div>;
}
function Glance({ href, k, v, hot }: { href: string; k: string; v: string; hot?: boolean }) {
  return (
    <a href={href} className="rounded-2xl border bg-white p-4 block" style={{ borderColor: hot ? BURGUNDY : BORDER, borderWidth: hot ? 2 : 1 }}>
      <div className="text-xs font-semibold" style={{ color: hot ? BURGUNDY : MUTED }}>{k}</div>
      <div className="text-[15px] font-semibold mt-1 leading-snug" style={{ color: NAVY }}>{v}</div>
    </a>
  );
}

function PrepRow({ x }: { x: Any }) {
  const [open, setOpen] = useState(false);
  const has = x.files.length || x.links.length || x.notes;
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: BORDER }}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[15px] font-semibold" style={{ color: NAVY }}>{x.label}</div>
          {x.key === "lawn_sign"
            ? <div className="text-sm" style={{ color: MUTED }}>Installed: {x.status === "completed" ? "Yes" : x.status === "not_applicable" ? "Not applicable" : "No"}</div>
            : x.completed_on && <div className="text-sm" style={{ color: MUTED }}>{x.key === "listing" ? "Published" : "Done"} {fDate(x.completed_on)}</div>}
        </div>
        <Status s={x.status} />
      </div>
      {has ? <button type="button" onClick={() => setOpen(!open)} className="text-sm font-semibold underline mt-2" style={{ color: NAVY }}>{open ? "Hide" : x.key === "photos" ? "View photos" : x.key === "listing" ? "View listing links" : "Open"}</button> : null}
      {open && (
        <div className="mt-3 grid gap-2">
          {x.notes && <p className="text-sm" style={{ color: "#333" }}>{x.notes}</p>}
          {x.links.map((l: Any) => <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="text-sm underline break-all" style={{ color: NAVY }}>{l.label || l.url}</a>)}
          {x.key === "photos" ? <Gallery files={x.files} /> : x.files.map((f: Any) => <FileRow key={f.id} f={f} />)}
        </div>
      )}
    </div>
  );
}

function FileRow({ f }: { f: Any }) {
  const label: Record<string, string> = { floor_plan: "Floor plan", walkthrough: "Walkthrough report", report: "Report", lease: "Lease", inspection: "Inspection", document: "Document" };
  return (
    <a href={f.url ?? "#"} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3" style={{ borderColor: BORDER }}>
      <span className="min-w-0"><span className="block text-[15px] font-semibold truncate" style={{ color: NAVY }}>{f.title}</span><span className="block text-xs" style={{ color: MUTED }}>{label[f.kind] ?? f.kind} · {fDate(f.created_at)}</span></span>
      <span className="text-sm font-semibold shrink-0" style={{ color: NAVY }}>Open</span>
    </a>
  );
}

function Gallery({ files }: { files: Any[] }) {
  const [big, setBig] = useState<string | null>(null);
  if (!files.length) return null;
  return (
    <>
      <div className="grid grid-cols-3 gap-1.5">
        {files.map((f) => (
          <button key={f.id} type="button" onClick={() => setBig(f.url)} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.url} alt={f.title} className="w-full h-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>
      {big && (
        <button type="button" onClick={() => setBig(null)} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.9)" }} aria-label="Close photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={big} alt="" className="max-w-full max-h-full object-contain" />
        </button>
      )}
    </>
  );
}

function Marketing({ metrics }: { metrics: Any[] }) {
  const [explain, setExplain] = useState<string | null>(null);
  const cur = metrics[0], prev = metrics[1];
  const total = (k: string) => {
    const vals = metrics.map((m) => m[k]).filter((x) => x != null);
    return vals.length ? vals.reduce((s: number, x: number) => s + x, 0) : null;
  };
  return (
    <Card id="marketing">
      <H2 sub="Reported weekly. Numbers we can't measure are marked “Not available”.">Marketing activity</H2>
      {!cur ? <p className="text-[15px]" style={{ color: MUTED }}>Awaiting the first weekly report.</p> : (
        <>
          <div className="text-sm mb-3" style={{ color: MUTED }}>
            Week of {fShort(cur.week_start)}–{fShort(cur.week_end)} · Last updated {fDate(cur.updated_at)}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {METRICS.map((m) => {
              const val = cur[m.key], before = prev?.[m.key];
              const diff = val != null && before != null ? val - before : null;
              return (
                <button key={m.key} type="button" onClick={() => setExplain(explain === m.key ? null : m.key)} className="rounded-xl border p-3 text-left" style={{ borderColor: BORDER }}>
                  <div className="text-xs" style={{ color: MUTED }}>{m.label} <span aria-hidden="true">ⓘ</span></div>
                  <div className="text-[22px] font-bold" style={{ color: val == null ? MUTED : NAVY, fontSize: val == null ? 14 : undefined, paddingTop: val == null ? 6 : 0 }}>{val == null ? "Not available" : val}</div>
                  {diff != null && <div className="text-xs font-semibold" style={{ color: diff > 0 ? GREEN : diff < 0 ? BURGUNDY : MUTED }}>{diff > 0 ? `▲ ${diff}` : diff < 0 ? `▼ ${-diff}` : "Same"} vs last week</div>}
                  {total(m.key) != null && metrics.length > 1 && <div className="text-xs" style={{ color: MUTED }}>{total(m.key)} so far</div>}
                  {explain === m.key && <div className="text-xs mt-2 leading-snug" style={{ color: "#333" }}>{m.what}</div>}
                </button>
              );
            })}
          </div>
          {cur.notes && <p className="text-sm mt-3" style={{ color: "#333" }}>{cur.notes}</p>}
        </>
      )}
    </Card>
  );
}

function UpdateCard({ u, open: startOpen }: { u: Any; open: boolean }) {
  const [open, setOpen] = useState(startOpen);
  const rows: [string, string | null][] = [
    ["What our showing specialist saw", u.specialist_feedback], ["What prospects are saying", u.prospect_feedback], ["The market", u.market_feedback], ["What we recommend", u.recommendations],
  ];
  return (
    <div className="rounded-xl border" style={{ borderColor: BORDER }}>
      <button type="button" onClick={() => setOpen(!open)} className="w-full p-4 flex justify-between items-center text-left">
        <span><span className="block text-[15px] font-semibold" style={{ color: NAVY }}>Week of {fShort(u.week_start)}–{fShort(u.week_end)}</span><span className="block text-xs" style={{ color: MUTED }}>Published {fDate(u.published_at)}</span></span>
        <span style={{ color: MUTED }}>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 grid gap-4">
          {u.summary && <p className="text-[15px] leading-relaxed whitespace-pre-line" style={{ color: "#222" }}>{u.summary}</p>}
          <div className="grid grid-cols-4 gap-2 text-center">
            {[["Scheduled", u.showings_scheduled], ["Completed", u.showings_completed], ["Cancelled", u.cancellations], ["No-shows", u.no_shows]].map(([k, val]) => (
              <div key={k as string} className="rounded-lg p-2" style={{ background: BG }}><div className="text-[18px] font-bold" style={{ color: NAVY }}>{val ?? "—"}</div><div className="text-[11px]" style={{ color: MUTED }}>{k}</div></div>
            ))}
          </div>
          {rows.filter(([, val]) => val).map(([k, val]) => (
            <div key={k}><div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: MUTED }}>{k}</div><p className="text-[15px] leading-relaxed whitespace-pre-line" style={{ color: "#222" }}>{val}</p></div>
          ))}
          {u.action_items?.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: MUTED }}>Next</div>
              <ul className="grid gap-1.5">{u.action_items.map((a: Any, i: number) => <li key={i} className="text-[15px]" style={{ color: "#222" }}>• {a.item} <span style={{ color: MUTED }}>({a.owner === "Owner" ? "You" : a.owner}{a.due ? `, ${a.due}` : ""})</span></li>)}</ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function List({ title, items, tone }: { title: string; items: Any[]; tone: string }) {
  return items?.length ? (
    <div>
      <div className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: tone }}>{title}</div>
      <ul className="grid gap-1.5">{items.map((it: Any, i: number) => <li key={i} className="text-[15px]" style={{ color: "#222" }}>{typeof it === "string" ? `• ${it}` : <><b>{it.item}:</b> {it.detail}</>}</li>)}</ul>
    </div>
  ) : null;
}

function ReviewCard({ r, disabled, act }: { r: Any; disabled: boolean; act: (b: Record<string, unknown>, ok?: string) => Promise<boolean> }) {
  const [mode, setMode] = useState<null | "approve" | "decline" | "ask">(null);
  const [reason, setReason] = useState("");
  const [comments, setComments] = useState("");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const open = ["released", "clarification"].includes(r.status);
  const label: Record<string, [string, string]> = {
    released: ["Your decision needed", BURGUNDY], clarification: ["Question sent to Ebin", "#8A5A00"], approved: ["Approved to proceed", GREEN], completed: ["Placed", GREEN],
    declined: ["Declined", MUTED], paused: ["On hold", "#8A5A00"], withdrawn: ["Withdrawn", MUTED],
  };
  const [lbl, col] = label[r.status] ?? [r.status, MUTED];
  return (
    <div className="rounded-xl border-2 p-4 grid gap-4" style={{ borderColor: open ? BURGUNDY : BORDER }}>
      <div className="flex justify-between gap-3 items-start">
        <div className="text-[16px] font-semibold" style={{ color: NAVY }}>{r.applicant_summary}</div>
        <span className="text-xs font-semibold shrink-0" style={{ color: col }}>{lbl}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Fact k="Proposed move-in" v={r.move_in ? fDate(r.move_in) : "Not given"} />
        <Fact k="Proposed rent" v={r.proposed_rent ? `${money(r.proposed_rent)}/mo` : "—"} />
      </div>
      {r.terms && <Fact k="Terms" v={r.terms} />}
      {r.admin_summary && <div className="rounded-xl p-3" style={{ background: BG }}><div className="text-xs font-semibold mb-1" style={{ color: MUTED }}>Prospera&apos;s summary</div><p className="text-[15px]" style={{ color: "#222" }}>{r.admin_summary}</p>{r.recommendation && <p className="text-[15px] mt-2" style={{ color: NAVY }}><b>Our recommendation:</b> {r.recommendation}</p>}</div>}
      <List title="Verified by documents" items={r.verified} tone={GREEN} />
      <List title="Preliminary (stated, not yet verified)" items={r.preliminary} tone="#8A5A00" />
      <List title="Still to check" items={r.outstanding_checks} tone={MUTED} />

      {r.messages?.length > 0 && (
        <div className="grid gap-2">
          {r.messages.map((m: Any) => (
            <div key={m.id} className="rounded-xl p-3 text-[15px]" style={{ background: m.sender === "owner" ? BG : "#EEF2F5", marginLeft: m.sender === "owner" ? 24 : 0, marginRight: m.sender === "owner" ? 0 : 24 }}>
              <div className="text-xs font-semibold mb-0.5" style={{ color: MUTED }}>{m.sender === "owner" ? "You" : "Ebin"} · {fDate(m.created_at)}</div>{m.body}
            </div>
          ))}
        </div>
      )}

      {r.status === "declined" && <p className="text-sm" style={{ color: MUTED }}>You declined on {fDate(r.decided_at)}. Reason: {r.decision_reason}. We haven&apos;t passed your comments to the applicant.</p>}
      {r.status === "approved" && <p className="text-sm" style={{ color: GREEN }}>You approved this applicant to proceed on {fDate(r.decided_at)}. See the next steps below.</p>}

      {open && !mode && (
        <div className="grid gap-2">
          <button type="button" disabled={disabled} onClick={() => setMode("approve")} className="w-full rounded-xl py-4 font-semibold text-[15px] disabled:opacity-50" style={{ background: BURGUNDY, color: "#FAF8F5" }}>Approve to Proceed</button>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" disabled={disabled} onClick={() => setMode("ask")} className="rounded-xl border-2 py-3 font-semibold text-sm disabled:opacity-50" style={{ borderColor: NAVY, color: NAVY }}>Ask Ebin a question</button>
            <button type="button" disabled={disabled} onClick={() => setMode("decline")} className="rounded-xl border-2 py-3 font-semibold text-sm disabled:opacity-50" style={{ borderColor: BORDER, color: NAVY }}>Decline Application</button>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: MUTED }}><b>Approve to Proceed</b> lets us run full verification and take the next steps. It is not final tenant approval or a signed tenancy.</p>
        </div>
      )}

      {mode === "approve" && (
        <div className="rounded-xl p-4 grid gap-3" style={{ background: BG }}>
          <p className="text-[15px]" style={{ color: "#222" }}>Approve this applicant to proceed? We&apos;ll start full verification: SingleKey credit and background screening, and reference calls. You&apos;ll see every step below. This is <b>not</b> final approval or a signed lease.</p>
          <button type="button" disabled={busy} onClick={async () => { setBusy(true); await act({ action: "approve", reviewId: r.id }, "Approved to proceed. We've started verification."); setBusy(false); setMode(null); }} className="rounded-xl py-3.5 font-semibold" style={{ background: BURGUNDY, color: "#FAF8F5" }}>{busy ? "Saving…" : "Yes, approve to proceed"}</button>
          <button type="button" onClick={() => setMode(null)} className="text-sm underline" style={{ color: MUTED }}>Cancel</button>
        </div>
      )}

      {mode === "decline" && (
        <div className="rounded-xl p-4 grid gap-3" style={{ background: BG }}>
          <label className="grid gap-1.5"><span className="text-[15px] font-semibold" style={{ color: NAVY }}>Reason (required)</span>
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="rounded-xl border p-3 bg-white text-[15px]" style={{ borderColor: BORDER }}>
              <option value="">Choose a reason…</option>{DECLINE_REASONS.map((x) => <option key={x}>{x}</option>)}
            </select>
          </label>
          <label className="grid gap-1.5"><span className="text-[15px] font-semibold" style={{ color: NAVY }}>Comments for Ebin</span>
            <textarea value={comments} onChange={(e) => setComments(e.target.value)} rows={3} className="rounded-xl border p-3 bg-white text-[15px]" style={{ borderColor: BORDER }} />
          </label>
          <p className="text-xs" style={{ color: MUTED }}>Only Ebin sees this. We don&apos;t send your comments to the applicant. Under Ontario&apos;s Human Rights Code, decisions can&apos;t be based on things like family status, age, origin, religion, disability or receiving public assistance.</p>
          <button type="button" disabled={busy || !reason || (reason === "Other" && !comments.trim())} onClick={async () => { setBusy(true); await act({ action: "decline", reviewId: r.id, reason, comments }, "Recorded. Ebin will take it from here."); setBusy(false); setMode(null); }} className="rounded-xl py-3.5 font-semibold disabled:opacity-50" style={{ background: NAVY, color: "#FAF8F5" }}>{busy ? "Saving…" : "Decline application"}</button>
          <button type="button" onClick={() => setMode(null)} className="text-sm underline" style={{ color: MUTED }}>Cancel</button>
        </div>
      )}

      {mode === "ask" && (
        <div className="rounded-xl p-4 grid gap-3" style={{ background: BG }}>
          <textarea value={q} onChange={(e) => setQ(e.target.value)} rows={3} placeholder="What would you like to know before deciding?" className="rounded-xl border p-3 bg-white text-[15px]" style={{ borderColor: BORDER }} />
          <button type="button" disabled={busy || !q.trim()} onClick={async () => { setBusy(true); if (await act({ action: "ask", reviewId: r.id, body: q }, "Sent to Ebin. You'll get an email when he replies.")) setQ(""); setBusy(false); setMode(null); }} className="rounded-xl py-3.5 font-semibold disabled:opacity-50" style={{ background: NAVY, color: "#FAF8F5" }}>{busy ? "Sending…" : "Send question"}</button>
          <button type="button" onClick={() => setMode(null)} className="text-sm underline" style={{ color: MUTED }}>Cancel</button>
        </div>
      )}
    </div>
  );
}

function NextSteps({ r }: { r: Any }) {
  const steps: Any[] = r.steps ?? [];
  const [open, setOpen] = useState<number | null>(steps.find((s) => s.status !== "done")?.step_no ?? null);
  if (!steps.length) return null;
  const done = steps.filter((s) => s.status === "done").length;
  return (
    <Card id="next-steps" className="pp-in">
      <H2 sub={`${r.applicant_summary.split(",")[0]} · ${done} of ${steps.length} done`}>What happens next</H2>
      <div className="h-2 rounded-full mb-5 overflow-hidden" style={{ background: "#EEE" }}>
        <div className="h-2 rounded-full transition-all duration-700 motion-reduce:transition-none" style={{ width: `${(done / steps.length) * 100}%`, background: GREEN }} />
      </div>
      <ol className="grid gap-2">
        {steps.map((s, i) => (
          <li key={s.id} className="pp-in rounded-xl border" style={{ borderColor: s.status === "in_progress" ? NAVY : BORDER, animationDelay: `${i * 60}ms` }}>
            <button type="button" onClick={() => setOpen(open === s.step_no ? null : s.step_no)} className="w-full p-3.5 flex items-center gap-3 text-left" aria-expanded={open === s.step_no}>
              <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: s.status === "done" ? GREEN : s.status === "in_progress" ? NAVY : "#F1EEE9", color: s.status === "done" || s.status === "in_progress" ? "#fff" : MUTED }}>{s.status === "done" ? "✓" : s.step_no}</span>
              <span className="flex-1 text-[15px] font-semibold" style={{ color: NAVY }}>{s.title}</span>
              <Status s={s.status} />
            </button>
            {open === s.step_no && (
              <div className="px-4 pb-4 grid gap-2 text-sm" style={{ color: "#333" }}>
                <div><span style={{ color: MUTED }}>Who:</span> {s.responsible || "Prospera"}</div>
                {s.target_date && <div><span style={{ color: MUTED }}>{s.status === "done" ? "Was scheduled for" : "Target date"}:</span> {fDate(s.target_date)}</div>}
                {s.completed_at && <div><span style={{ color: MUTED }}>Completed:</span> {fDate(s.completed_at)}</div>}
                {s.owner_action && <div className="rounded-lg p-3 font-semibold" style={{ background: "#F8EAEC", color: BURGUNDY }}>Needed from you: {s.owner_action}</div>}
                {s.files?.map((f: Any) => <FileRow key={f.id} f={f} />)}
              </div>
            )}
          </li>
        ))}
      </ol>
    </Card>
  );
}

function Sheet({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(15,22,30,0.5)" }} role="dialog" aria-modal="true" aria-label={title}>
      <div className="bg-white w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5 pp-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[20px] font-bold" style={{ color: NAVY, fontFamily: "var(--font-cormorant)" }}>{title}</h2>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded-full text-lg" style={{ background: BG, color: NAVY }} aria-label="Close">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const TOUR = [
  { title: "Check progress", body: "The tracker near the top shows which stage we're at, from preparation to keys. “Next” tells you what's happening and who's doing it.", href: "#progress" },
  { title: "Photos and documents", body: "Property preparation shows the walkthrough, photos, lawn sign, floor plan and listing. Open photos and files right from there, or from Files at the bottom.", href: "#prep" },
  { title: "Weekly updates", body: "Every week we post showings, what prospects said, market feedback and what we recommend. Older updates stay in the history.", href: "#updates" },
  { title: "Review applications", body: "When an applicant is ready, you'll see a summary under Applications with Approve to Proceed, Decline, or Ask Ebin a question.", href: "#applications" },
  { title: "What happens next", body: "After you approve, a step-by-step timeline shows verification, the lease, payments, move-in and keys, with dates as we set them.", href: "#next-steps" },
];

function Intro({ onClose }: { onClose: () => void }) {
  const [i, setI] = useState(0);
  const last = i === TOUR.length;
  return (
    <Sheet title={last ? "Keep it on your phone" : `Quick tour · ${i + 1} of ${TOUR.length}`} onClose={onClose}>
      {!last ? (
        <div className="grid gap-4">
          <h3 className="text-[22px] font-bold" style={{ color: NAVY, fontFamily: "var(--font-cormorant)" }}>{TOUR[i].title}</h3>
          <p className="text-[16px] leading-relaxed" style={{ color: "#222" }}>{TOUR[i].body}</p>
          <div className="flex gap-1.5" aria-hidden="true">{TOUR.map((_, k) => <span key={k} className="h-1.5 flex-1 rounded-full" style={{ background: k <= i ? NAVY : BORDER }} />)}</div>
          <button type="button" onClick={() => setI(i + 1)} className="w-full rounded-xl py-4 font-semibold" style={{ background: BURGUNDY, color: "#FAF8F5" }}>Next</button>
          <button type="button" onClick={onClose} className="text-sm underline" style={{ color: MUTED }}>Skip the tour</button>
        </div>
      ) : (
        <div className="grid gap-4">
          <p className="text-[15px]" style={{ color: "#222" }}>Add the dashboard to your home screen so it opens like an app. You can find this again under <b>Help</b>.</p>
          <InstallGuide />
          <button type="button" onClick={onClose} className="w-full rounded-xl py-4 font-semibold" style={{ background: BURGUNDY, color: "#FAF8F5" }}>Go to my dashboard</button>
        </div>
      )}
    </Sheet>
  );
}
