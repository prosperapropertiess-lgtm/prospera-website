"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const BG          = "#F5F4F1";
const CARD        = "#FFFFFF";
const CARD_BORDER = "rgba(15,28,40,0.07)";
const CARD_SHADOW = "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)";
const NAVY        = "#0F1C28";
const MUTED       = "rgba(15,28,40,0.60)";
const SUBTLE      = "rgba(15,28,40,0.42)";
const BURGUNDY    = "#8B2030";
const GREEN       = "#0A7A52";
const GREEN_BG    = "rgba(10,122,82,0.09)";
const AMBER       = "#B45309";
const AMBER_BG    = "rgba(180,83,9,0.09)";

interface ParsedLease {
  tenants?: Array<{ name: string; email: string; unit: string; phone: string }>;
  [key: string]: unknown;
}

interface Session {
  token: string;
  current_step: number;
  status: string;
  service_type: string;
  owner_name: string | null;
  owner_email: string | null;
  owner_phone: string | null;
  property_address: string | null;
  property_city: string | null;
  property_type: string | null;
  num_units: number | null;
  approx_monthly_rent: number | null;
  fee_structure: string | null;
  fee_amount: number | null;
  lease_parsed_data: ParsedLease | null;
  step2_completed_at: string | null;
  step3_completed_at: string | null;
  step4_completed_at: string | null;
  agreement_signed_at: string | null;
  step6_data: Record<string, unknown> | null;
  step7_data: Record<string, unknown> | null;
  step8_completed_at: string | null;
  step9_data: Record<string, unknown> | null;
  completed_at: string | null;
  owner_access_token: string | null;
  created_at: string;
}

function fmt(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" });
}

function fmtShort(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

// ── Step status logic ────────────────────────────────────────────

function getStepStatuses(s: Session) {
  const leaseUploaded  = !!s.lease_parsed_data;
  const detailsDone    = !!s.step4_completed_at;
  const agreementDone  = !!s.agreement_signed_at;
  const ebinSetupDone  = !!s.step9_data;
  const live           = !!s.completed_at;

  return { leaseUploaded, detailsDone, agreementDone, ebinSetupDone, live };
}

// ── Step card ────────────────────────────────────────────────────

type StepStatus = "done" | "active" | "locked" | "ebin";

function StepRow({
  num, title, subtitle, status, date, cta, ctaHref, children,
}: {
  num: number;
  title: string;
  subtitle: string;
  status: StepStatus;
  date?: string | null;
  cta?: string;
  ctaHref?: string;
  children?: React.ReactNode;
}) {
  const iconBg =
    status === "done"   ? GREEN_BG :
    status === "active" ? "rgba(139,32,48,0.08)" :
    status === "ebin"   ? AMBER_BG :
    "rgba(15,28,40,0.05)";

  const iconColor =
    status === "done"   ? GREEN :
    status === "active" ? BURGUNDY :
    status === "ebin"   ? AMBER :
    SUBTLE;

  const iconContent =
    status === "done"   ? "✓" :
    status === "locked" ? "·" :
    String(num);

  return (
    <div style={{
      background: CARD,
      border: `1px solid ${CARD_BORDER}`,
      borderLeft: `3px solid ${
        status === "done"   ? GREEN :
        status === "active" ? BURGUNDY :
        status === "ebin"   ? AMBER :
        "rgba(15,28,40,0.10)"
      }`,
      borderRadius: 16,
      boxShadow: status === "active" ? "0 2px 8px rgba(139,32,48,0.06), 0 8px 24px rgba(139,32,48,0.08)" : CARD_SHADOW,
      padding: "20px 22px",
      opacity: status === "locked" ? 0.55 : 1,
      transition: "opacity 0.2s",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        {/* Number chip */}
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: iconBg, color: iconColor,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 800, flexShrink: 0, marginTop: 2,
        }}>
          {iconContent}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: status === "locked" ? SUBTLE : NAVY }}>
                {title}
              </p>
              <p style={{ margin: "3px 0 0", fontSize: 14, color: MUTED, lineHeight: 1.5 }}>
                {subtitle}
              </p>
              {date && (
                <p style={{ margin: "4px 0 0", fontSize: 12, color: status === "done" ? GREEN : MUTED, fontWeight: 500 }}>
                  {status === "done" ? `✓ Completed ${date}` : date}
                </p>
              )}
            </div>

            {/* CTA button */}
            {status === "active" && cta && ctaHref && (
              <Link
                href={ctaHref}
                style={{
                  display: "inline-block", background: BURGUNDY, color: "#fff",
                  borderRadius: 10, padding: "10px 20px", fontSize: 14,
                  fontWeight: 700, textDecoration: "none", flexShrink: 0,
                  fontFamily: "var(--font-poppins), -apple-system, sans-serif",
                }}
              >
                {cta} →
              </Link>
            )}

            {/* Ebin badge */}
            {status === "ebin" && (
              <span style={{
                fontSize: 12, fontWeight: 700, color: AMBER,
                background: AMBER_BG, padding: "4px 10px", borderRadius: 8,
                flexShrink: 0,
              }}>
                In progress
              </span>
            )}

            {/* Done badge */}
            {status === "done" && (
              <span style={{
                fontSize: 12, fontWeight: 700, color: GREEN,
                background: GREEN_BG, padding: "4px 10px", borderRadius: 8,
                flexShrink: 0,
              }}>
                Done
              </span>
            )}
          </div>

          {children && (
            <div style={{ marginTop: 12 }}>{children}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Email preview card ───────────────────────────────────────────

function EmailCard({ subject, date, preview, tag }: {
  subject: string; date: string; preview: string; tag?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background: CARD, border: `1px solid ${CARD_BORDER}`,
      borderRadius: 14, boxShadow: CARD_SHADOW, overflow: "hidden",
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", background: "none", border: "none", cursor: "pointer",
          padding: "16px 20px", textAlign: "left",
          fontFamily: "var(--font-poppins), -apple-system, sans-serif",
          display: "flex", alignItems: "center", gap: 14,
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "rgba(139,32,48,0.07)", color: BURGUNDY,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, flexShrink: 0,
        }}>
          ✉️
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: NAVY }}>{subject}</p>
            {tag && (
              <span style={{ fontSize: 11, fontWeight: 600, color: SUBTLE, background: "rgba(15,28,40,0.06)", padding: "1px 7px", borderRadius: 5 }}>
                {tag}
              </span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: 13, color: MUTED }}>{preview}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: SUBTLE }}>{date}</span>
          <span style={{ fontSize: 12, color: SUBTLE, transition: "transform 0.2s", display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
        </div>
      </button>

      {open && (
        <div style={{ padding: "0 20px 18px", borderTop: `1px solid ${CARD_BORDER}` }}>
          <p style={{ margin: "14px 0 0", fontSize: 14, color: MUTED, lineHeight: 1.7 }}>
            {preview}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Progress bar ─────────────────────────────────────────────────

function ProgressBar({ pct, complete }: { pct: number; complete: boolean }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ height: 6, background: "rgba(15,28,40,0.08)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: complete ? GREEN : BURGUNDY,
          borderRadius: 4, transition: "width 0.8s cubic-bezier(0.23,1,0.32,1)",
        }} />
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────

export default function OnboardPortal() {
  const params = useParams();
  const token = params.token as string;
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/onboard/${token}/status`);
      if (r.ok) setSession(await r.json());
    } catch {}
    setLoading(false);
  }, [token]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 28, height: 28, border: "3px solid rgba(15,28,40,0.10)", borderTopColor: BURGUNDY, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-poppins), -apple-system, sans-serif" }}>
        <p style={{ color: MUTED, fontSize: 16 }}>Link not found. Please contact Ebin.</p>
      </div>
    );
  }

  const { leaseUploaded, detailsDone, agreementDone, ebinSetupDone, live } = getStepStatuses(session);
  const firstName = session.owner_name?.split(" ")[0] ?? "there";

  // Progress percentage (6 landlord-visible steps)
  const doneCount = [true, leaseUploaded, detailsDone, agreementDone, ebinSetupDone, live].filter(Boolean).length;
  const pct = Math.round((doneCount / 6) * 100);

  // Step statuses — new order: agreement → lease → details → ebin → live
  const agreementStatus: StepStatus = agreementDone ? "done" : "active";
  const leaseStatus: StepStatus  = leaseUploaded ? "done" : (agreementDone ? "active" : "locked");
  const detailsStatus: StepStatus = detailsDone ? "done" : (leaseUploaded ? "active" : "locked");
  const ebinStatus: StepStatus   = ebinSetupDone ? "done" : (detailsDone ? "ebin" : "locked");
  const liveStatus: StepStatus   = live ? "done" : (ebinSetupDone ? "active" : "locked");

  // Emails sent so far
  interface EmailEntry {
    subject: string;
    date: string;
    preview: string;
    tag: string;
    sent: boolean;
  }
  const emails: EmailEntry[] = [
    {
      subject: "Welcome to Prospera — let's get started",
      date: fmtShort(session.created_at),
      preview: `Hi ${firstName}, you're officially in our system. Your first step is to upload your existing lease so we can pull the details automatically. Click the link in this email to get started.`,
      tag: "Welcome",
      sent: true,
    },
    {
      subject: "Next step: review your details & sign your agreement",
      date: fmtShort(session.step4_completed_at),
      preview: `Your property details have been received. One last step before we're set up — please review the details we extracted and sign your management agreement.`,
      tag: "Action required",
      sent: !!session.step4_completed_at,
    },
    {
      subject: "Agreement signed — we're setting things up",
      date: fmtShort(session.agreement_signed_at),
      preview: `Your management agreement is signed and on file. Ebin will be in touch to arrange key handover and the initial inspection. Nothing else needed from you right now.`,
      tag: "Confirmation",
      sent: !!session.agreement_signed_at,
    },
    {
      subject: "Inspection complete",
      date: fmtShort(session.step7_data ? session.created_at : null),
      preview: `We've completed the initial inspection of your property. Everything is documented and we're finalising your financial setup.`,
      tag: "Update",
      sent: !!session.step7_data,
    },
    {
      subject: "You're live — welcome to Prospera",
      date: fmtShort(session.completed_at),
      preview: `Your property is now fully set up and under management. Your owner dashboard is ready — you can log in any time to see rent status, expenses, and upcoming items.`,
      tag: "You're live",
      sent: !!session.completed_at,
    },
  ].filter(e => e.sent);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "var(--font-poppins), -apple-system, sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ background: CARD, borderBottom: `1px solid ${CARD_BORDER}`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: NAVY, letterSpacing: "-0.01em" }}>
            Prospera Properties
          </p>
        </div>
        <a href="tel:5196971227" style={{ fontSize: 14, color: MUTED, textDecoration: "none", fontWeight: 500 }}>
          (519) 697-1227
        </a>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "36px 20px 80px" }}>

        {/* Hero */}
        <div style={{ marginBottom: 32 }}>
          {live ? (
            <div style={{ background: GREEN_BG, border: `1px solid rgba(10,122,82,0.15)`, borderRadius: 16, padding: "20px 24px", marginBottom: 24, display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 28 }}>🎉</span>
              <div>
                <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: GREEN }}>You're live!</p>
                <p style={{ margin: "2px 0 0", fontSize: 14, color: MUTED }}>Your property is fully set up and under management.</p>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 24 }} />
          )}

          <h1 style={{ margin: "0 0 4px", fontSize: "clamp(28px, 5vw, 38px)", fontWeight: 800, color: NAVY, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            Hi {firstName}.
          </h1>
          <p style={{ margin: "0 0 6px", fontSize: 16, color: MUTED }}>
            {session.property_address ?? "Your property"} · {live ? "Fully onboarded" : "Onboarding in progress"}
          </p>

          {/* Progress */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>{doneCount} of 6 steps complete</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: live ? GREEN : BURGUNDY }}>{pct}%</span>
            </div>
            <ProgressBar pct={pct} complete={live} />
          </div>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 40 }}>

          {/* Step 1 — always done */}
          <StepRow
            num={1}
            title="You're in our system"
            subtitle={`Ebin added your property and sent your welcome email.`}
            status="done"
            date={fmt(session.created_at)}
          >
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {session.owner_email && (
                <span style={{ fontSize: 13, color: MUTED }}>📧 {session.owner_email}</span>
              )}
              {session.property_type && (
                <span style={{ fontSize: 13, color: MUTED }}>🏠 {session.property_type}</span>
              )}
              {session.service_type === "management" ? (
                <span style={{ fontSize: 13, color: MUTED }}>📋 Placement + Management</span>
              ) : (
                <span style={{ fontSize: 13, color: MUTED }}>📋 Tenant Placement</span>
              )}
            </div>
          </StepRow>

          {/* Step 2 — Agreement (first owner action) */}
          <StepRow
            num={2}
            title={session.service_type === "placement" ? "Sign your placement agreement" : "Sign your management agreement"}
            subtitle={
              agreementDone
                ? "Signed and on file."
                : session.service_type === "placement"
                ? "Read through and sign your tenant placement agreement. Takes 2 minutes — written in plain English."
                : "Read through and sign your management agreement. Takes 2 minutes — written in plain English."
            }
            status={agreementStatus}
            date={agreementDone ? fmt(session.agreement_signed_at) : null}
            cta="Sign Agreement"
            ctaHref={`/onboard/${token}/agreement`}
          />

          {/* Step 3 — Upload lease */}
          <StepRow
            num={3}
            title="Upload your lease"
            subtitle={
              leaseUploaded
                ? `${Array.isArray(session.lease_parsed_data?.tenants) ? session.lease_parsed_data!.tenants.length + " tenant(s) extracted · " : ""}Details pulled automatically.`
                : "Upload your existing lease — we extract the details automatically in about 30 seconds. Or skip if you don't have one yet."
            }
            status={leaseStatus}
            date={leaseUploaded ? fmt(session.step4_completed_at) : null}
            cta="Upload Lease"
            ctaHref={`/onboard/${token}/lease`}
          />

          {/* Step 4 — Details form */}
          <StepRow
            num={4}
            title="Fill in your property details"
            subtitle={
              detailsDone
                ? "Access codes, payment preferences, contractors, and everything else saved."
                : "Takes about 5 minutes. Access codes, how you'd like to receive rent, garbage schedule, preferred contractors, and anything else we should know."
            }
            status={detailsStatus}
            date={detailsDone ? fmt(session.step4_completed_at) : null}
            cta="Fill In Details"
            ctaHref={`/onboard/${token}/details`}
          />

          {/* Step 5 — Ebin's work */}
          <StepRow
            num={5}
            title={ebinSetupDone ? "Keys & inspection complete" : "Keys, inspection & setup"}
            subtitle={
              ebinSetupDone
                ? "Initial inspection done, keys received, financial setup confirmed."
                : detailsDone
                ? "Ebin will reach out to arrange key handover and the initial walkthrough. Nothing needed from you right now."
                : "Once you've filled in your property details, Ebin will handle the rest of this step."
            }
            status={ebinStatus}
            date={ebinSetupDone ? fmt(session.step9_data ? session.created_at : null) : null}
          />

          {/* Step 6 — Live */}
          <StepRow
            num={6}
            title="You're live!"
            subtitle={
              live
                ? "Your property is fully under management. Your owner dashboard is ready."
                : "Once setup is complete, you'll receive your owner dashboard link and your first monthly report on the 3rd."
            }
            status={liveStatus}
            date={live ? fmt(session.completed_at) : null}
          >
            {live && session.owner_access_token && (
              <Link
                href={`/owners/${session.owner_access_token}`}
                style={{
                  display: "inline-block", background: GREEN, color: "#fff",
                  borderRadius: 10, padding: "10px 20px", fontSize: 14,
                  fontWeight: 700, textDecoration: "none",
                  fontFamily: "var(--font-poppins), -apple-system, sans-serif",
                }}
              >
                Open Owner Dashboard →
              </Link>
            )}
          </StepRow>

        </div>

        {/* Emails section */}
        {emails.length > 0 && (
          <>
            <div style={{ marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: SUBTLE, textTransform: "uppercase", letterSpacing: "0.09em" }}>
                Communications
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {emails.map((e, i) => (
                <EmailCard
                  key={i}
                  subject={e.subject}
                  date={e.date}
                  preview={e.preview}
                  tag={e.tag}
                />
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid ${CARD_BORDER}`, textAlign: "center" }}>
          <p style={{ margin: "0 0 4px", fontSize: 14, color: MUTED }}>Questions? Reach Ebin directly.</p>
          <a href="mailto:prosperapropertiess@gmail.com" style={{ fontSize: 14, color: BURGUNDY, textDecoration: "none", fontWeight: 600 }}>
            prosperapropertiess@gmail.com
          </a>
          <span style={{ color: SUBTLE, margin: "0 8px" }}>·</span>
          <a href="tel:5196971227" style={{ fontSize: 14, color: BURGUNDY, textDecoration: "none", fontWeight: 600 }}>
            (519) 697-1227
          </a>
        </div>

      </div>
    </div>
  );
}
