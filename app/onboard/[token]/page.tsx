"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

// ── Design tokens ────────────────────────────────────────────────
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

// ── Types ────────────────────────────────────────────────────────

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
  approx_monthly_rent: number | null;
  agreement_signed_at: string | null;
  lease_parsed_data: Record<string, unknown> | null;
  step2_completed_at: string | null;
  step3_completed_at: string | null;
  step4_completed_at: string | null;
  step6_data: Record<string, unknown> | null;
  step7_data: Record<string, unknown> | null;
  step9_data: Record<string, unknown> | null;
  completed_at: string | null;
  owner_access_token: string | null;
  created_at: string;
  property_id: string | null;
  comparables: unknown[] | null;
  rent_low: number | null;
  rent_market: number | null;
  rent_premium: number | null;
}

interface LiveStats {
  inquiries: number;
  prequalified: number;
  viewings: number;
  applications: number;
  approved: boolean;
}

type StepStatus = "done" | "active" | "locked" | "ebin";

// ── Helpers ──────────────────────────────────────────────────────

function fmt(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-CA", {
    month: "long", day: "numeric", year: "numeric",
  });
}

function fmtShort(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-CA", {
    month: "short", day: "numeric",
  });
}

function fmtMoney(n: number): string {
  return "$" + n.toLocaleString("en-CA", { maximumFractionDigits: 0 });
}

function firstName(name: string | null): string {
  return name?.split(" ")[0] ?? "there";
}

// ── ProgressBar ──────────────────────────────────────────────────

function ProgressBar({ pct, complete }: { pct: number; complete: boolean }) {
  return (
    <div style={{ height: 6, background: "rgba(15,28,40,0.08)", borderRadius: 4, overflow: "hidden" }}>
      <div style={{
        height: "100%",
        width: `${pct}%`,
        background: complete ? GREEN : BURGUNDY,
        borderRadius: 4,
        transition: "width 0.8s cubic-bezier(0.23,1,0.32,1)",
      }} />
    </div>
  );
}

// ── StepCard ─────────────────────────────────────────────────────

function StepCard({
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
  const borderColor =
    status === "done"   ? GREEN :
    status === "active" ? BURGUNDY :
    status === "ebin"   ? AMBER :
    "rgba(15,28,40,0.10)";

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

  const iconContent = status === "done" ? "✓" : status === "locked" ? "·" : String(num);

  return (
    <div style={{
      background: CARD,
      border: `1px solid ${CARD_BORDER}`,
      borderLeft: `3px solid ${borderColor}`,
      borderRadius: 16,
      boxShadow: status === "active"
        ? "0 2px 8px rgba(139,32,48,0.06), 0 8px 24px rgba(139,32,48,0.08)"
        : CARD_SHADOW,
      padding: "20px 22px",
      opacity: status === "locked" ? 0.52 : 1,
      transition: "opacity 0.2s",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        {/* Step number chip */}
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: iconBg, color: iconColor,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 800, flexShrink: 0, marginTop: 2,
        }}>
          {iconContent}
        </div>

        {/* Body */}
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
                  {status === "done" ? `Completed ${date}` : date}
                </p>
              )}
            </div>

            {/* Status badge */}
            {status === "done" && (
              <span style={{ fontSize: 12, fontWeight: 700, color: GREEN, background: GREEN_BG, padding: "4px 10px", borderRadius: 8, flexShrink: 0 }}>
                Done
              </span>
            )}
            {status === "ebin" && (
              <span style={{ fontSize: 12, fontWeight: 700, color: AMBER, background: AMBER_BG, padding: "4px 10px", borderRadius: 8, flexShrink: 0 }}>
                In progress
              </span>
            )}
            {status === "active" && !cta && (
              <span style={{ fontSize: 12, fontWeight: 700, color: BURGUNDY, background: "rgba(139,32,48,0.08)", padding: "4px 10px", borderRadius: 8, flexShrink: 0 }}>
                Active
              </span>
            )}
          </div>

          {/* CTA button */}
          {status === "active" && cta && ctaHref && (
            <div style={{ marginTop: 14 }}>
              <Link
                href={ctaHref}
                style={{
                  display: "inline-block", background: BURGUNDY, color: "#fff",
                  borderRadius: 10, padding: "10px 22px", fontSize: 14,
                  fontWeight: 700, textDecoration: "none",
                  fontFamily: "var(--font-poppins), -apple-system, sans-serif",
                }}
              >
                {cta} →
              </Link>
            </div>
          )}

          {children && <div style={{ marginTop: 14 }}>{children}</div>}
        </div>
      </div>
    </div>
  );
}

// ── MarketCompCard ───────────────────────────────────────────────

function MarketCompCard({
  token, rentLow, rentMarket, rentPremium, done,
}: {
  token: string;
  rentLow: number | null;
  rentMarket: number | null;
  rentPremium: number | null;
  done: boolean;
}) {
  const hasRange = rentLow != null && rentPremium != null;

  return (
    <div style={{ marginTop: 14 }}>
      {hasRange && (
        <div style={{
          background: "rgba(139,32,48,0.04)", border: "1px solid rgba(139,32,48,0.12)",
          borderRadius: 10, padding: "12px 16px", marginBottom: 12,
        }}>
          <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 600, color: SUBTLE, textTransform: "uppercase", letterSpacing: "0.07em" }}>
            Market rent range
          </p>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: NAVY }}>
            {fmtMoney(rentLow!)} – {fmtMoney(rentPremium!)}<span style={{ fontSize: 14, fontWeight: 500, color: MUTED }}>/mo</span>
          </p>
          {rentMarket != null && (
            <p style={{ margin: "3px 0 0", fontSize: 13, color: MUTED }}>
              Market median: {fmtMoney(rentMarket)}/mo
            </p>
          )}
        </div>
      )}
      {!done && (
        <Link
          href={`/market-comp/${token}`}
          style={{
            display: "inline-block", background: BURGUNDY, color: "#fff",
            borderRadius: 10, padding: "10px 22px", fontSize: 14,
            fontWeight: 700, textDecoration: "none",
            fontFamily: "var(--font-poppins), -apple-system, sans-serif",
          }}
        >
          View Market Report →
        </Link>
      )}
    </div>
  );
}

// ── LiveStatsPanel ───────────────────────────────────────────────

function LiveStatsPanel({ stats }: { stats: LiveStats | null }) {
  if (!stats) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: MUTED, fontSize: 14 }}>
        <div style={{ width: 14, height: 14, border: `2px solid ${CARD_BORDER}`, borderTopColor: BURGUNDY, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        Loading live data...
      </div>
    );
  }

  const statItems = [
    { label: "Inquiries", value: stats.inquiries },
    { label: "Pre-qualified", value: stats.prequalified },
    { label: "Viewings", value: stats.viewings },
    { label: "Applications", value: stats.applications },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 10 }}>
        {statItems.map((s) => (
          <div key={s.label} style={{
            background: "rgba(15,28,40,0.03)", border: `1px solid ${CARD_BORDER}`,
            borderRadius: 10, padding: "12px 10px", textAlign: "center",
          }}>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: NAVY }}>{s.value}</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: MUTED, fontWeight: 500 }}>{s.label}</p>
          </div>
        ))}
      </div>
      {stats.approved && (
        <div style={{ background: GREEN_BG, border: "1px solid rgba(10,122,82,0.15)", borderRadius: 10, padding: "10px 14px" }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: GREEN }}>
            Application approved — tenant placed!
          </p>
        </div>
      )}
      {!stats.approved && (
        <p style={{ margin: 0, fontSize: 12, color: SUBTLE }}>
          Live — updates every 30 seconds
        </p>
      )}
    </div>
  );
}

// ── EmailCard ────────────────────────────────────────────────────

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
          fontSize: 15, flexShrink: 0,
        }}>
          ✉
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
          <span style={{ fontSize: 12, color: SUBTLE, display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
            ▾
          </span>
        </div>
      </button>

      {open && (
        <div style={{ padding: "0 20px 18px", borderTop: `1px solid ${CARD_BORDER}` }}>
          <p style={{ margin: "14px 0 0", fontSize: 14, color: MUTED, lineHeight: 1.7 }}>{preview}</p>
        </div>
      )}
    </div>
  );
}

// ── Placement steps ──────────────────────────────────────────────

function PlacementSteps({ s, token, stats }: { s: Session; token: string; stats: LiveStats | null }) {
  const hasComparables = Array.isArray(s.comparables) && s.comparables.length > 0;
  const agreementDone  = !!s.agreement_signed_at;
  const listed         = !!s.property_id;
  const completed      = !!s.completed_at;
  const tenantApproved = stats?.approved ?? false;

  // Step 2: market comp — "done" once they've signed (they reviewed it), "active" if comparables exist
  const step2Status: StepStatus = agreementDone ? "done" : (hasComparables ? "active" : "locked");
  // Step 3: agreement — "done" if signed, "active" if market comp done or no comps, "locked" if comps exist but not reviewed
  const step3Status: StepStatus = agreementDone ? "done" : (hasComparables ? (step2Status === "active" ? "locked" : "active") : "active");
  // Step 4: listing — "done" if property_id, "active" if agreement signed, locked otherwise
  const step4Status: StepStatus = listed ? "done" : (agreementDone ? "active" : "locked");
  // Step 5: finding tenant — only relevant after listed
  const step5Status: StepStatus = tenantApproved ? "done" : (listed ? "active" : "locked");
  // Step 6: placed
  const step6Status: StepStatus = completed ? "done" : "locked";

  const totalSteps = hasComparables ? 6 : 5;
  const doneCount = [
    true,
    hasComparables ? agreementDone : null,
    agreementDone,
    listed,
    tenantApproved,
    completed,
  ].filter(Boolean).length;
  const pct = Math.round((doneCount / totalSteps) * 100);

  return { steps: (
    <>
      {/* Step 1 */}
      <StepCard
        num={1}
        title="You're in our system"
        subtitle="Ebin added your property to Prospera's system."
        status="done"
        date={fmt(s.created_at)}
      >
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {s.owner_email && <span style={{ fontSize: 13, color: MUTED }}>{s.owner_email}</span>}
          {s.property_type && <span style={{ fontSize: 13, color: MUTED }}>{s.property_type}</span>}
          <span style={{ fontSize: 12, fontWeight: 600, color: BURGUNDY, background: "rgba(139,32,48,0.07)", padding: "2px 8px", borderRadius: 6 }}>
            Tenant Placement
          </span>
        </div>
      </StepCard>

      {/* Step 2: Market comp (only if comparables exist) */}
      {hasComparables && (
        <StepCard
          num={2}
          title="Review your market report"
          subtitle={agreementDone ? "Market report reviewed." : "We've analysed comparable rentals near your property. Review your market report before signing."}
          status={step2Status}
          date={agreementDone ? fmt(s.agreement_signed_at) : null}
        >
          <MarketCompCard
            token={token}
            rentLow={s.rent_low}
            rentMarket={s.rent_market}
            rentPremium={s.rent_premium}
            done={agreementDone}
          />
        </StepCard>
      )}

      {/* Step 3: Agreement */}
      <StepCard
        num={hasComparables ? 3 : 2}
        title="Sign your placement agreement"
        subtitle={agreementDone
          ? "Signed and on file."
          : "Read through and sign your placement agreement. Written in plain English — takes about 2 minutes."}
        status={step3Status}
        date={agreementDone ? fmt(s.agreement_signed_at) : null}
        cta="Sign Agreement"
        ctaHref={`/onboard/${token}/agreement`}
      />

      {/* Step 4: Listing */}
      <StepCard
        num={hasComparables ? 4 : 3}
        title="Your property is being listed"
        subtitle={
          listed
            ? `Listed on ${fmt(s.step3_completed_at)}.`
            : agreementDone
            ? "We're preparing your listing now. It goes live within the hour."
            : "Once your agreement is signed, we'll prepare and publish your listing."
        }
        status={step4Status}
        date={listed ? fmt(s.step3_completed_at) : null}
      >
        {listed && s.property_id && (
          <Link
            href={`/listings/${s.property_id}`}
            style={{
              display: "inline-block", background: GREEN, color: "#fff",
              borderRadius: 10, padding: "10px 22px", fontSize: 14,
              fontWeight: 700, textDecoration: "none",
              fontFamily: "var(--font-poppins), -apple-system, sans-serif",
            }}
          >
            View Your Listing →
          </Link>
        )}
      </StepCard>

      {/* Step 5: Finding tenant (live stats) */}
      {listed && (
        <StepCard
          num={hasComparables ? 5 : 4}
          title="Finding your tenant"
          subtitle={tenantApproved
            ? "A tenant has been approved for your property."
            : "We're actively marketing your property and screening applicants."}
          status={step5Status}
        >
          <LiveStatsPanel stats={stats} />
        </StepCard>
      )}

      {/* Step 6: Placed */}
      <StepCard
        num={hasComparables ? 6 : 5}
        title="Tenant placed"
        subtitle={completed
          ? "Your new tenant is placed. The work is done."
          : "Once a tenant is approved, we'll confirm placement and wrap everything up."}
        status={step6Status}
        date={completed ? fmt(s.completed_at) : null}
      >
        {completed && (
          <div style={{ background: GREEN_BG, border: "1px solid rgba(10,122,82,0.15)", borderRadius: 10, padding: "14px 16px" }}>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: GREEN }}>
              Tenant placed!
            </p>
            <p style={{ margin: "3px 0 0", fontSize: 14, color: MUTED }}>
              Your property is rented. Congratulations.
            </p>
          </div>
        )}
      </StepCard>
    </>
  ), pct, doneCount, totalSteps };
}

// ── Management steps ─────────────────────────────────────────────

function ManagementSteps({ s, token }: { s: Session; token: string }) {
  const agreementDone = !!s.agreement_signed_at;
  const leaseUploaded = !!s.lease_parsed_data;
  const detailsDone   = !!s.step4_completed_at;
  const ebinDone      = !!s.step9_data;
  const live          = !!s.completed_at;

  const agreementStatus: StepStatus = agreementDone ? "done" : "active";
  const leaseStatus: StepStatus     = leaseUploaded ? "done" : (agreementDone ? "active" : "locked");
  const detailsStatus: StepStatus   = detailsDone ? "done" : (leaseUploaded ? "active" : "locked");
  const ebinStatus: StepStatus      = ebinDone ? "done" : (detailsDone ? "ebin" : "locked");
  const liveStatus: StepStatus      = live ? "done" : (ebinDone ? "active" : "locked");

  const doneCount = [true, agreementDone, leaseUploaded, detailsDone, ebinDone, live].filter(Boolean).length;
  const pct = Math.round((doneCount / 6) * 100);

  const tenants = Array.isArray((s.lease_parsed_data as { tenants?: unknown[] } | null)?.tenants)
    ? (s.lease_parsed_data as { tenants: Array<unknown> }).tenants.length
    : null;

  return { steps: (
    <>
      {/* Step 1 */}
      <StepCard
        num={1}
        title="You're in our system"
        subtitle="Ebin added your property to Prospera's system."
        status="done"
        date={fmt(s.created_at)}
      >
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {s.owner_email && <span style={{ fontSize: 13, color: MUTED }}>{s.owner_email}</span>}
          {s.property_type && <span style={{ fontSize: 13, color: MUTED }}>{s.property_type}</span>}
          <span style={{ fontSize: 12, fontWeight: 600, color: GREEN, background: GREEN_BG, padding: "2px 8px", borderRadius: 6 }}>
            Management
          </span>
        </div>
      </StepCard>

      {/* Step 2: Agreement */}
      <StepCard
        num={2}
        title="Sign your management agreement"
        subtitle={agreementDone
          ? "Signed and on file."
          : "Read through and sign your management agreement. Written in plain English — takes about 2 minutes."}
        status={agreementStatus}
        date={agreementDone ? fmt(s.agreement_signed_at) : null}
        cta="Sign Agreement"
        ctaHref={`/onboard/${token}/agreement`}
      />

      {/* Step 3: Lease */}
      <StepCard
        num={3}
        title="Upload your lease"
        subtitle={leaseUploaded
          ? `${tenants != null ? `${tenants} tenant(s) extracted. ` : ""}Details pulled automatically.`
          : "Upload your existing lease — we extract the details in about 30 seconds. Skip if you don't have one yet."}
        status={leaseStatus}
        date={leaseUploaded ? fmt(s.step4_completed_at) : null}
        cta="Upload Lease"
        ctaHref={`/onboard/${token}/lease`}
      />

      {/* Step 4: Details */}
      <StepCard
        num={4}
        title="Fill in your property details"
        subtitle={detailsDone
          ? "Access codes, payment preferences, and all key details saved."
          : "Takes about 5 minutes. Access codes, rent payment preferences, contractors, and anything else we should know."}
        status={detailsStatus}
        date={detailsDone ? fmt(s.step4_completed_at) : null}
        cta="Fill In Details"
        ctaHref={`/onboard/${token}/details`}
      />

      {/* Step 5: Ebin */}
      <StepCard
        num={5}
        title={ebinDone ? "Keys and inspection complete" : "Keys, inspection and setup"}
        subtitle={ebinDone
          ? "Initial inspection done, keys received, financial setup confirmed."
          : detailsDone
          ? "Ebin will reach out to arrange key handover and the initial walkthrough. Nothing needed from you right now."
          : "Once you've filled in your details, Ebin handles the rest of this step."}
        status={ebinStatus}
      />

      {/* Step 6: Live */}
      <StepCard
        num={6}
        title="You're live"
        subtitle={live
          ? "Your property is fully under management. Your owner dashboard is ready."
          : "Once setup is complete, you'll get your owner dashboard link and first monthly report on the 3rd."}
        status={liveStatus}
        date={live ? fmt(s.completed_at) : null}
      >
        {live && s.owner_access_token && (
          <Link
            href={`/owners/${s.owner_access_token}`}
            style={{
              display: "inline-block", background: GREEN, color: "#fff",
              borderRadius: 10, padding: "10px 22px", fontSize: 14,
              fontWeight: 700, textDecoration: "none",
              fontFamily: "var(--font-poppins), -apple-system, sans-serif",
            }}
          >
            Open Owner Dashboard →
          </Link>
        )}
      </StepCard>
    </>
  ), pct, doneCount, totalSteps: 6 };
}

// ── Main page ────────────────────────────────────────────────────

export default function OnboardPortal() {
  const params = useParams();
  const token = params.token as string;

  const [session, setSession]   = useState<Session | null>(null);
  const [loading, setLoading]   = useState(true);
  const [stats, setStats]       = useState<LiveStats | null>(null);

  const loadSession = useCallback(async () => {
    try {
      const r = await fetch(`/api/onboard/${token}/status`);
      if (r.ok) setSession(await r.json());
    } catch { /* swallow */ }
    setLoading(false);
  }, [token]);

  const loadStats = useCallback(async (propertyId: string | null | undefined) => {
    if (!propertyId) return;
    try {
      const r = await fetch(`/api/onboard/${token}/stats`);
      if (r.ok) setStats(await r.json());
    } catch { /* swallow */ }
  }, [token]);

  useEffect(() => {
    loadSession();
    const interval = setInterval(loadSession, 30000);
    return () => clearInterval(interval);
  }, [loadSession]);

  useEffect(() => {
    if (session?.property_id && session.service_type === "placement") {
      loadStats(session.property_id);
      const interval = setInterval(() => loadStats(session.property_id), 30000);
      return () => clearInterval(interval);
    }
  }, [session?.property_id, session?.service_type, loadStats]);

  // ── Loading state ────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width: 28, height: 28, border: "3px solid rgba(15,28,40,0.10)", borderTopColor: BURGUNDY, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
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

  const name = firstName(session.owner_name);
  const isPlacement = session.service_type === "placement";
  const live = !!session.completed_at;

  // Build steps for the correct flow
  const placementResult = isPlacement ? PlacementSteps({ s: session, token, stats }) : null;
  const managementResult = !isPlacement ? ManagementSteps({ s: session, token }) : null;

  const { steps, pct, doneCount, totalSteps } = (placementResult ?? managementResult)!;

  // Build email timeline
  interface EmailEntry { subject: string; date: string; preview: string; tag: string; sent: boolean; }
  const emails: EmailEntry[] = [
    {
      subject: "Welcome to Prospera — let's get started",
      date: fmtShort(session.created_at),
      preview: `Hi ${name}, you're officially in our system. Follow the steps in your portal to get set up.`,
      tag: "Welcome",
      sent: true,
    },
    {
      subject: isPlacement ? "Your market report is ready" : "Next step: upload your lease",
      date: fmtShort(session.step2_completed_at ?? session.created_at),
      preview: isPlacement
        ? "Your market comp report is live. Review the rental range for your property before signing."
        : "Your agreement is signed. Please upload your existing lease so we can pull the details automatically.",
      tag: "Action required",
      sent: isPlacement ? (Array.isArray(session.comparables) && session.comparables.length > 0) : !!session.agreement_signed_at,
    },
    {
      subject: isPlacement ? "Agreement signed — listing in progress" : "Agreement signed — we're setting things up",
      date: fmtShort(session.agreement_signed_at),
      preview: isPlacement
        ? "Your placement agreement is signed. We're preparing your listing now."
        : "Your management agreement is signed. Ebin will be in touch to arrange key handover.",
      tag: "Confirmation",
      sent: !!session.agreement_signed_at,
    },
    {
      subject: isPlacement ? "Your property is live" : "Inspection complete",
      date: fmtShort(session.step3_completed_at ?? session.step7_data ? session.created_at : null),
      preview: isPlacement
        ? "Your listing is published. We're actively marketing and screening applicants."
        : "We've completed the initial inspection. Everything is documented.",
      tag: "Update",
      sent: isPlacement ? !!session.property_id : !!session.step7_data,
    },
    {
      subject: isPlacement ? "Tenant placed" : "You're live — welcome to Prospera",
      date: fmtShort(session.completed_at),
      preview: isPlacement
        ? "A tenant has been approved and placed. The work is done."
        : "Your property is fully set up. Your owner dashboard is ready.",
      tag: isPlacement ? "Placed" : "You're live",
      sent: !!session.completed_at,
    },
  ].filter(e => e.sent);

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "var(--font-poppins), -apple-system, sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{
        background: CARD, borderBottom: `1px solid ${CARD_BORDER}`,
        padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: NAVY, letterSpacing: "-0.01em" }}>
          Prospera Properties
        </p>
        <a href="tel:5196971227" style={{ fontSize: 14, color: MUTED, textDecoration: "none", fontWeight: 500 }}>
          (519) 697-1227
        </a>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "36px 20px 80px" }}>

        {/* Hero */}
        <div style={{ marginBottom: 32 }}>
          {live && (
            <div style={{
              background: GREEN_BG, border: "1px solid rgba(10,122,82,0.15)",
              borderRadius: 16, padding: "20px 24px", marginBottom: 24,
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <span style={{ fontSize: 28 }}>&#127881;</span>
              <div>
                <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: GREEN }}>
                  {isPlacement ? "Tenant placed!" : "You're live!"}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 14, color: MUTED }}>
                  {isPlacement
                    ? "Your tenant is placed and the work is done."
                    : "Your property is fully set up and under management."}
                </p>
              </div>
            </div>
          )}

          <h1 style={{ margin: "0 0 4px", fontSize: "clamp(28px, 5vw, 38px)", fontWeight: 800, color: NAVY, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            Hi {name}.
          </h1>
          <p style={{ margin: "0 0 6px", fontSize: 16, color: MUTED }}>
            {session.property_address ?? "Your property"}
            {session.property_city ? `, ${session.property_city}` : ""}
            {" · "}
            {live
              ? (isPlacement ? "Placement complete" : "Fully onboarded")
              : "Onboarding in progress"}
          </p>

          {/* Progress bar */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>
                {doneCount} of {totalSteps} steps complete
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: live ? GREEN : BURGUNDY }}>
                {pct}%
              </span>
            </div>
            <ProgressBar pct={pct} complete={live} />
          </div>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 40 }}>
          {steps}
        </div>

        {/* Email timeline */}
        {emails.length > 0 && (
          <>
            <div style={{ marginBottom: 14 }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: SUBTLE, textTransform: "uppercase", letterSpacing: "0.09em" }}>
                Communications
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 40 }}>
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
        <div style={{ paddingTop: 24, borderTop: `1px solid ${CARD_BORDER}`, textAlign: "center" }}>
          <p style={{ margin: "0 0 6px", fontSize: 14, color: MUTED }}>Questions? Reach Ebin directly.</p>
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
