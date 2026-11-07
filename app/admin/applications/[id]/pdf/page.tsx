"use client";

// Printable, branded copy of one rental application. "Save as PDF" uses the
// browser's print dialog, so what you see on screen is exactly the PDF.

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Outfit, Inter } from "next/font/google";
import { DOC_LABELS } from "@/lib/application-requirements";
import { VERDICT_STYLE, INCOME_SOURCE_LABEL, TIME_AT_ADDRESS_LABEL } from "../labels";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "600", "700"], variable: "--ap-head" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--ap-body" });

const NAVY = "#1F2F3A";
const BURGUNDY = "#8B2030";
const WARM = "#F7F5F2";
const BORDER = "#D8D2C8";
const TEXT = "#222222";
const MUTED = "#666666";
const LIGHT = "#FAF8F5";

interface Summary {
  verdict: string;
  headline: string;
  checks: { topic: string; status: string; detail: string }[];
  questions_to_ask: string[];
  verified_monthly_income: number | null;
}

interface Application {
  id: string;
  tenant_name: string;
  tenant_email: string;
  tenant_phone: string;
  tenant_dob: string | null;
  current_address: string | null;
  employer_name: string | null;
  employer_position: string | null;
  monthly_income: number | null;
  employment_start: string | null;
  employment_type: string | null;
  landlord_ref_name: string | null;
  landlord_ref_phone: string | null;
  landlord_ref_email: string | null;
  employer_ref_name: string | null;
  employer_ref_phone: string | null;
  employer_ref_email: string | null;
  monthly_rent: number;
  ai_summary: Summary | null;
  income_source: string | null;
  income_notes: string | null;
  move_in_date: string | null;
  occupants: number | null;
  co_applicants: { name: string; email: string | null; phone: string | null }[] | null;
  pets: string | null;
  smokes: boolean | null;
  vehicles: number | null;
  time_at_address: string | null;
  current_rent: number | null;
  reason_for_moving: string | null;
  consent_at: string | null;
  created_at: string;
  properties: { address: string; city: string } | null;
  documents: { id: string; doc_type: string }[];
}

const CHECK_MARK: Record<string, { icon: string; bg: string; fg: string; word: string }> = {
  verified:     { icon: "✓", bg: NAVY, fg: LIGHT, word: "Confirmed" },
  claimed_only: { icon: "•", bg: WARM, fg: MUTED, word: "Stated" },
  concern:      { icon: "!", bg: BURGUNDY, fg: LIGHT, word: "Look closer" },
  missing:      { icon: "○", bg: "#FFFFFF", fg: BURGUNDY, word: "Missing" },
};

function shortDate(v: string | null | undefined) {
  if (!v) return null;
  const d = /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(`${v}T12:00:00`) : new Date(v);
  if (isNaN(d.getTime())) return v;
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
}

const phone = (v: string | null | undefined) => {
  const d = (v ?? "").replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : v ?? null;
};

function longDate(v: string | null | undefined) {
  if (!v) return null;
  const d = /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(`${v}T12:00:00`) : new Date(v);
  if (isNaN(d.getTime())) return v;
  return d.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
}

const money = (n: number | null | undefined) => (n == null ? null : `$${Number(n).toLocaleString("en-CA")}`);

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="ap-field">
      <div className="ap-label">{label}</div>
      <div className="ap-value">{value || "—"}</div>
    </div>
  );
}

function Card({ n, title, children, wide }: { n: string; title: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <section className={`ap-card${wide ? " ap-wide" : ""}`}>
      <div className="ap-card-head">
        <span className="ap-num">{n}</span>
        <h3>{title}</h3>
      </div>
      {children}
    </section>
  );
}

export default function ApplicationPdfPage() {
  const { id } = useParams() as { id: string };
  const [app, setApp] = useState<Application | null>(null);
  const [failed, setFailed] = useState(false);
  const [showSummary, setShowSummary] = useState(true);
  const [showContact, setShowContact] = useState(true);
  const [showDob, setShowDob] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/applications/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Application) => {
        setApp(data);
        // The PDF's file name comes from the page title.
        document.title = `Rental application – ${data.tenant_name}${data.properties ? ` – ${data.properties.address}` : ""}`;
      })
      .catch(() => setFailed(true));
  }, [id]);

  if (failed) return <div style={{ padding: 40, color: BURGUNDY }}>Application not found.</div>;
  if (!app) return <div style={{ padding: 40, color: MUTED }}>Loading…</div>;

  const s = app.ai_summary;
  const verdict = s ? VERDICT_STYLE[s.verdict] : null;
  const rentShare = app.monthly_income && app.monthly_income > 0 ? Math.round((app.monthly_rent / app.monthly_income) * 100) : null;
  const household = [app.tenant_name, ...(app.co_applicants ?? []).map((c) => c.name)].filter(Boolean);
  const prepared = longDate(new Date().toISOString());

  return (
    <div className={`${outfit.variable} ${inter.variable} ap-root`}>
      <style>{CSS}</style>

      {/* Toolbar: screen only */}
      <div className="ap-toolbar">
        <Link href={`/admin/applications/${id}`} className="ap-back">← Back to application</Link>
        <div className="ap-toggles">
          <label><input type="checkbox" checked={showSummary} onChange={(e) => setShowSummary(e.target.checked)} /> Screening summary</label>
          <label><input type="checkbox" checked={showContact} onChange={(e) => setShowContact(e.target.checked)} /> Phone and email</label>
          <label><input type="checkbox" checked={showDob} onChange={(e) => setShowDob(e.target.checked)} /> Date of birth</label>
        </div>
        <button onClick={() => window.print()} className="ap-print">Save as PDF</button>
      </div>
      <p className="ap-tip">In the print window, choose <b>Save as PDF</b> and turn on <b>Background graphics</b>.</p>

      <article className="ap-doc">
        {/* Masthead */}
        <header className="ap-mast">
          <div className="ap-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" width={44} height={42} />
            <div>
              <div className="ap-brand-name">PROSPERA</div>
              <div className="ap-brand-sub">PROPERTIES CO.</div>
            </div>
          </div>
          <div className="ap-mast-right">
            <div className="ap-eyebrow">Rental application</div>
            <div className="ap-mast-date">Prepared {prepared}</div>
          </div>
        </header>

        {/* Hero */}
        <div className="ap-hero">
          <div className="ap-eyebrow" style={{ color: "rgba(250,248,245,0.6)" }}>Applicant</div>
          <h1>{app.tenant_name}</h1>
          <p>
            Applying for <b>{app.properties ? `${app.properties.address}, ${app.properties.city}` : "—"}</b>
            <span className="ap-dot">·</span>
            {money(app.monthly_rent)}/month
            <span className="ap-dot">·</span>
            Submitted {longDate(app.created_at)}
          </p>
        </div>

        {/* Key facts */}
        <div className="ap-facts">
          <div><div className="ap-label">Wants to move in</div><div className="ap-big">{shortDate(app.move_in_date) ?? "—"}</div></div>
          <div><div className="ap-label">People living there</div><div className="ap-big">{app.occupants ?? "—"}</div></div>
          <div><div className="ap-label">Monthly income stated</div><div className="ap-big">{money(app.monthly_income) ?? "—"}</div></div>
          <div><div className="ap-label">Rent share of income</div><div className="ap-big">{rentShare != null ? `${rentShare}%` : "—"}</div></div>
        </div>

        {/* Screening summary */}
        {showSummary && s && (
          <section className="ap-summary">
            <div className="ap-summary-top">
              <div className="ap-eyebrow">Screening summary</div>
              {verdict && <span className="ap-verdict">{verdict.label}</span>}
            </div>
            <p className="ap-headline">{s.headline}</p>
            <div className="ap-checks">
              {s.checks.map((c, i) => {
                const m = CHECK_MARK[c.status] ?? CHECK_MARK.claimed_only;
                return (
                  <div key={i} className="ap-check">
                    <span className="ap-mark" style={{ background: m.bg, color: m.fg, borderColor: m.bg === "#FFFFFF" || m.bg === WARM ? BORDER : m.bg }}>{m.icon}</span>
                    <div>
                      <div className="ap-check-topic">{c.topic} <span>{m.word}</span></div>
                      <div className="ap-check-detail">{c.detail}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            {s.questions_to_ask.length > 0 && (
              <div className="ap-ask">
                <div className="ap-label" style={{ marginBottom: 6 }}>Worth asking</div>
                <ol>{s.questions_to_ask.map((q, i) => <li key={i}>{q}</li>)}</ol>
              </div>
            )}
            <p className="ap-fine">Prepared by Prospera from the application and documents provided, to support review. The decision is the landlord&apos;s.</p>
          </section>
        )}

        {/* Details */}
        <div className="ap-grid">
          <Card n="01" title="Applicant">
            <Field label="Full name" value={app.tenant_name} />
            {showContact && <Field label="Phone" value={phone(app.tenant_phone)} />}
            {showContact && <Field label="Email" value={app.tenant_email} />}
            {showDob && <Field label="Date of birth" value={longDate(app.tenant_dob)} />}
          </Card>

          <Card n="02" title="Household">
            <Field label="Names on the lease" value={household.join(", ")} />
            <Field label="People living there" value={app.occupants != null ? String(app.occupants) : null} />
            <Field label="Pets" value={app.pets ?? (app.consent_at ? "None" : null)} />
            <Field label="Smokes" value={app.smokes == null ? null : app.smokes ? "Yes" : "No"} />
            <Field label="Vehicles" value={app.vehicles != null ? String(app.vehicles) : null} />
          </Card>

          <Card n="03" title="Where they live now">
            <Field label="Current address" value={app.current_address} />
            <Field label="Time there" value={app.time_at_address ? TIME_AT_ADDRESS_LABEL[app.time_at_address] : null} />
            <Field label="Rent now" value={app.current_rent != null ? `${money(app.current_rent)}/month` : null} />
            <Field label="Why moving" value={app.reason_for_moving} />
          </Card>

          <Card n="04" title="Income">
            <Field label="Income source" value={app.income_source ? INCOME_SOURCE_LABEL[app.income_source] : null} />
            <Field label="Employer or school" value={[app.employer_name, app.employer_position].filter(Boolean).join(" · ") || null} />
            <Field label="Type" value={app.employment_type?.replace(/_/g, " ") ?? null} />
            <Field label="Since" value={longDate(app.employment_start)} />
            <Field label="Monthly income stated" value={money(app.monthly_income)} />
            {showSummary && s?.verified_monthly_income != null && (
              <Field label="Income confirmed by documents" value={`${money(s.verified_monthly_income)}/month`} />
            )}
            {app.income_notes && <Field label="Notes" value={app.income_notes} />}
          </Card>

          <Card n="05" title="References" wide>
            <div className="ap-two">
              <div>
                <div className="ap-sub">Previous landlord</div>
                <Field label="Name" value={app.landlord_ref_name} />
                <Field label="Phone" value={phone(app.landlord_ref_phone)} />
                <Field label="Email" value={app.landlord_ref_email} />
              </div>
              <div>
                <div className="ap-sub">Employer</div>
                <Field label="Name" value={app.employer_ref_name} />
                <Field label="Phone" value={phone(app.employer_ref_phone)} />
                <Field label="Email" value={app.employer_ref_email} />
              </div>
            </div>
          </Card>

          <Card n="06" title="Documents provided" wide>
            {app.documents?.length ? (
              <div className="ap-docs">
                {Object.entries(
                  app.documents.reduce<Record<string, number>>((acc, d) => ({ ...acc, [d.doc_type]: (acc[d.doc_type] ?? 0) + 1 }), {}),
                ).map(([type, count]) => (
                  <span key={type} className="ap-doc-chip">
                    <b>✓</b> {DOC_LABELS[type as keyof typeof DOC_LABELS] ?? type}{count > 1 ? ` (${count})` : ""}
                  </span>
                ))}
              </div>
            ) : (
              <p className="ap-value" style={{ color: MUTED }}>No documents uploaded.</p>
            )}
            {app.consent_at && <p className="ap-consent">Applicant consented to screening on {longDate(app.consent_at)}.</p>}
          </Card>
        </div>

        <footer className="ap-foot">
          <span>Confidential. Contains personal information. Use only to assess this application.</span>
          <span>Prospera Properties Co. · London, Ontario · prosperaproperties.co</span>
        </footer>
      </article>
    </div>
  );
}

const CSS = `
.ap-root { background: ${WARM}; min-height: 100vh; padding: 24px 16px 60px; font-family: var(--ap-body), sans-serif; color: ${TEXT}; }
.ap-root h1, .ap-root h3, .ap-big, .ap-brand-name, .ap-num, .ap-headline { font-family: var(--ap-head), sans-serif; }

.ap-toolbar { max-width: 8.5in; margin: 0 auto 8px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.ap-back { color: ${NAVY}; font-size: 14px; text-decoration: none; font-weight: 500; }
.ap-toggles { display: flex; gap: 14px; flex-wrap: wrap; margin-left: auto; font-size: 13px; color: ${MUTED}; }
.ap-toggles label { display: flex; gap: 6px; align-items: center; cursor: pointer; }
.ap-toggles input { accent-color: ${NAVY}; }
.ap-print { background: ${BURGUNDY}; color: ${LIGHT}; border: 0; border-radius: 6px; padding: 11px 22px; font-size: 13px; font-weight: 600; letter-spacing: 0.04em; cursor: pointer; }
.ap-print:hover { opacity: 0.85; }
.ap-tip { max-width: 8.5in; margin: 0 auto 16px; font-size: 12px; color: ${MUTED}; text-align: right; }

.ap-doc { max-width: 8.5in; margin: 0 auto; background: #fff; border-radius: 6px; box-shadow: 0 6px 30px rgba(31,47,58,0.10); padding: 0.55in 0.6in 0.45in; }

.ap-mast { display: flex; justify-content: space-between; align-items: center; padding-bottom: 18px; border-bottom: 1px solid ${BORDER}; }
.ap-brand { display: flex; gap: 12px; align-items: center; }
.ap-brand img { object-fit: contain; }
.ap-brand-name { font-size: 20px; font-weight: 700; letter-spacing: 0.12em; color: ${NAVY}; line-height: 1; }
.ap-brand-sub { font-size: 9px; font-weight: 600; letter-spacing: 0.28em; color: ${MUTED}; margin-top: 4px; }
.ap-mast-right { text-align: right; }
.ap-mast-date { font-size: 12px; color: ${MUTED}; margin-top: 4px; }
.ap-eyebrow { font-size: 10px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: ${MUTED}; }

.ap-hero { margin-top: 22px; background: ${NAVY}; color: ${LIGHT}; border-radius: 10px; padding: 26px 28px; position: relative; overflow: hidden; }
.ap-hero::after { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 5px; background: ${BURGUNDY}; }
.ap-hero h1 { margin: 6px 0 8px; font-size: 34px; font-weight: 700; line-height: 1.1; letter-spacing: -0.01em; }
.ap-hero p { margin: 0; font-size: 14px; color: rgba(250,248,245,0.82); line-height: 1.6; }
.ap-hero b { color: ${LIGHT}; font-weight: 600; }
.ap-dot { margin: 0 8px; opacity: 0.5; }

.ap-facts { display: grid; grid-template-columns: repeat(4, 1fr); border: 1px solid ${BORDER}; border-radius: 10px; margin-top: 14px; overflow: hidden; }
.ap-facts > div { padding: 14px 16px; border-right: 1px solid ${BORDER}; background: ${WARM}; }
.ap-facts > div:last-child { border-right: 0; }
.ap-big { font-size: 19px; font-weight: 600; color: ${NAVY}; margin-top: 4px; line-height: 1.2; }

.ap-label { font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: ${MUTED}; }
.ap-value { font-size: 13.5px; color: ${TEXT}; margin-top: 2px; line-height: 1.45; }
.ap-field { padding: 7px 0; border-bottom: 1px solid #EFEBE4; }
.ap-field:last-child { border-bottom: 0; }

.ap-summary { margin-top: 18px; border: 1px solid ${BORDER}; border-radius: 10px; padding: 20px 22px; }
.ap-summary-top { display: flex; justify-content: space-between; align-items: center; }
.ap-verdict { background: ${NAVY}; color: ${LIGHT}; border-radius: 999px; padding: 5px 13px; font-size: 12px; font-weight: 600; }
.ap-headline { font-size: 17px; font-weight: 600; color: ${NAVY}; line-height: 1.4; margin: 10px 0 14px; }
.ap-checks { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 22px; }
.ap-check { display: flex; gap: 10px; align-items: flex-start; break-inside: avoid; }
.ap-mark { flex-shrink: 0; width: 20px; height: 20px; border-radius: 999px; border: 1px solid; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; margin-top: 1px; }
.ap-check-topic { font-size: 13px; font-weight: 600; color: ${TEXT}; }
.ap-check-topic span { font-weight: 500; font-size: 11px; color: ${MUTED}; margin-left: 4px; }
.ap-check-detail { font-size: 12.5px; color: #333; line-height: 1.5; margin-top: 1px; }
.ap-ask { background: ${WARM}; border-radius: 8px; padding: 12px 16px; margin-top: 16px; }
.ap-ask { break-inside: avoid; }
.ap-ask ol { list-style: decimal; margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.6; color: ${TEXT}; }
.ap-fine { font-size: 11px; color: ${MUTED}; margin: 12px 0 0; }

.ap-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 18px; }
.ap-summary-top, .ap-headline { break-after: avoid; }
.ap-card { border: 1px solid ${BORDER}; border-radius: 10px; padding: 16px 18px 10px; break-inside: avoid; }
.ap-wide { grid-column: 1 / -1; }
.ap-card-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 4px; }
.ap-card-head h3 { margin: 0; font-size: 16px; font-weight: 700; color: ${NAVY}; }
.ap-num { font-size: 14px; font-weight: 300; color: ${MUTED}; }
.ap-two { display: grid; grid-template-columns: 1fr 1fr; gap: 0 28px; }
.ap-sub { font-size: 12px; font-weight: 600; color: ${NAVY}; margin: 6px 0 2px; }
.ap-docs { display: flex; flex-wrap: wrap; gap: 8px; padding: 8px 0 6px; }
.ap-doc-chip { background: ${WARM}; border: 1px solid ${BORDER}; border-radius: 999px; padding: 6px 12px; font-size: 12.5px; color: ${TEXT}; }
.ap-doc-chip b { color: ${NAVY}; margin-right: 3px; }
.ap-consent { font-size: 12px; color: ${MUTED}; margin: 6px 0 4px; }

.ap-foot { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-top: 22px; padding-top: 12px; border-top: 1px solid ${BORDER}; font-size: 10.5px; color: ${MUTED}; }

@media (max-width: 700px) {
  .ap-doc { padding: 24px 18px; }
  .ap-facts, .ap-grid, .ap-checks, .ap-two { grid-template-columns: 1fr 1fr; }
  .ap-grid, .ap-checks, .ap-two { grid-template-columns: 1fr; }
  .ap-mast { flex-direction: column; align-items: flex-start; gap: 12px; }
  .ap-mast-right { text-align: left; }
}

@page { size: Letter; margin: 0.4in 0; }
@media print {
  html, body { background: #fff !important; }
  body * { visibility: hidden; }
  .ap-doc, .ap-doc * { visibility: visible; }
  .ap-root { padding: 0; background: #fff; }
  .ap-doc { position: absolute; left: 0; top: 0; width: 100%; max-width: none; box-shadow: none; border-radius: 0; padding: 0 0.55in; }
  .ap-toolbar, .ap-tip { display: none; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
`;
