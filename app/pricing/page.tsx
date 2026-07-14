import type { Metadata } from "next";
import Link from "next/link";
import FadeIn from "@/components/animations/FadeIn";
import {
  PersonaSelector,
  PlansGrid,
  ComparisonTable,
  GuaranteeAccordion,
} from "@/components/ui/PricingInteractive";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent property management pricing for London, St. Thomas, and Strathroy landlords. Three plans — 7%, 10%, or 15% — with no hidden fees and six written guarantees.",
};

// ── Design tokens ──────────────────────────────────────────────────────────

const NAVY = "#1F2F3A";
const BURGUNDY = "#8B2030";
const BG = "#F7F5F2";
const WHITE = "#FFFFFF";
const BORDER = "#D8D2C8";
const TEXT = "#222222";
const MUTED = "#666666";
const SUBTLE = "#333333";

// ── Small reusable components ──────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: "var(--font-dm-sans)",
        fontSize: "11px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        color: MUTED,
        marginBottom: "16px",
      }}
    >
      {children}
    </p>
  );
}

function Divider() {
  return (
    <div
      style={{
        height: "1px",
        background: BORDER,
        margin: "0",
      }}
    />
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function PricingPage() {
  return (
    <div style={{ background: BG, color: TEXT }}>

      {/* ── HERO ── */}
      <section
        style={{
          background: NAVY,
          padding: "120px 20px 80px",
        }}
      >
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <FadeIn>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "rgba(250,248,245,0.55)",
                marginBottom: "20px",
              }}
            >
              Property Management · London, St. Thomas & Strathroy
            </p>

            <h1
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(40px, 7vw, 72px)",
                fontWeight: 700,
                color: "#FAF8F5",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                marginBottom: "24px",
              }}
            >
              Straightforward pricing.{"\n"}
              <span style={{ color: "rgba(250,248,245,0.55)" }}>Nothing buried.</span>
            </h1>

            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "clamp(16px, 2.5vw, 20px)",
                color: "rgba(250,248,245,0.80)",
                lineHeight: 1.65,
                maxWidth: "560px",
                marginBottom: "36px",
              }}
            >
              Three plans. One flat percentage. No placement markups, no maintenance markups,
              no invoice inflation. What we charge is what you see — backed by six written guarantees.
            </p>

            {/* 90-day guarantee badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
                background: "rgba(250,248,245,0.08)",
                border: "1px solid rgba(250,248,245,0.15)",
                borderRadius: "12px",
                padding: "14px 20px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontSize: "28px",
                  fontWeight: 700,
                  color: BURGUNDY,
                }}
              >
                №6
              </span>
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#FAF8F5",
                    marginBottom: "2px",
                  }}
                >
                  90-Day Guarantee
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "12px",
                    color: "rgba(250,248,245,0.60)",
                  }}
                >
                  Unsatisfied in 90 days? First month's fee refunded.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── MATH LEDGER ── */}
      <section
        style={{
          background: WHITE,
          padding: "72px 20px",
        }}
      >
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel>The math</SectionLabel>
            <h2
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 700,
                color: NAVY,
                letterSpacing: "-0.02em",
                marginBottom: "16px",
                lineHeight: 1.2,
              }}
            >
              You built the asset.
            </h2>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "16px",
                color: SUBTLE,
                lineHeight: 1.7,
                maxWidth: "560px",
                marginBottom: "36px",
              }}
            >
              You saved. You took the risk. You bought the property. Now it's 2AM on a Tuesday
              and a pipe has burst. The tenant has been late three months in a row. You're
              googling the Landlord and Tenant Board while trying to remember if you sent the
              right form. That's not ownership — that's a second job you didn't apply for.
            </p>

            {/* Ledger card */}
            <div
              style={{
                background: BG,
                border: `1px solid ${BORDER}`,
                borderRadius: "16px",
                padding: "28px",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              <p
                style={{
                  fontSize: "12px",
                  color: MUTED,
                  textTransform: "uppercase",
                  letterSpacing: "0.10em",
                  fontWeight: 700,
                  marginBottom: "16px",
                }}
              >
                The 2AM math — $2,000 / month property
              </p>

              {[
                { label: "Monthly rent", value: "$2,000", note: "" },
                { label: "Autopilot management fee (10%)", value: "−$200", note: "", negative: true },
                { label: "You receive", value: "$1,800", note: "monthly, on time", bold: true },
                null,
                { label: "Your time spent managing (old way)", value: "~8 hrs/mo", note: "calls, forms, chasing, stress" },
                { label: "Your time spent with Prospera", value: "~0 hrs/mo", note: "check your statement, that's it" },
              ].map((row, i) =>
                row === null ? (
                  <div key={i} style={{ height: "1px", background: BORDER, margin: "16px 0" }} />
                ) : (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      padding: "10px 0",
                      borderBottom: i < 2 ? `1px solid ${BORDER}` : undefined,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        color: row.bold ? NAVY : SUBTLE,
                        fontWeight: row.bold ? 700 : 400,
                        flex: 1,
                      }}
                    >
                      {row.label}
                    </span>
                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          fontSize: row.bold ? "18px" : "15px",
                          fontWeight: row.bold ? 800 : 600,
                          color: row.negative ? BURGUNDY : row.bold ? NAVY : SUBTLE,
                        }}
                      >
                        {row.value}
                      </span>
                      {row.note && (
                        <p style={{ fontSize: "11px", color: MUTED, marginTop: "2px" }}>{row.note}</p>
                      )}
                    </div>
                  </div>
                )
              )}

              <div
                style={{
                  marginTop: "20px",
                  padding: "14px 18px",
                  background: "rgba(31,47,58,0.06)",
                  borderRadius: "10px",
                  borderLeft: `3px solid ${NAVY}`,
                }}
              >
                <p style={{ fontSize: "14px", color: NAVY, fontWeight: 600, lineHeight: 1.5 }}>
                  $200 / month is what it costs to never think about your rental property again.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <Divider />

      {/* ── PERSONA SELECTOR ── */}
      <section style={{ padding: "72px 20px", background: BG }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel>Which landlord are you?</SectionLabel>
            <h2
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 700,
                color: NAVY,
                letterSpacing: "-0.02em",
                marginBottom: "8px",
                lineHeight: 1.2,
              }}
            >
              Find your plan in under 30 seconds.
            </h2>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "16px",
                color: MUTED,
                marginBottom: "32px",
              }}
            >
              Select the description that fits you best.
            </p>
            <PersonaSelector />
          </FadeIn>
        </div>
      </section>

      <Divider />

      {/* ── THREE PLANS ── */}
      <section style={{ padding: "72px 20px", background: WHITE }}>
        <div style={{ maxWidth: "1020px", margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel>The plans</SectionLabel>
            <h2
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 700,
                color: NAVY,
                letterSpacing: "-0.02em",
                marginBottom: "8px",
                lineHeight: 1.2,
              }}
            >
              Three plans. One transparent rate.
            </h2>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "16px",
                color: MUTED,
                marginBottom: "40px",
                maxWidth: "520px",
              }}
            >
              All plans are month-to-month. No lock-in contracts.
              Cancel with 30 days written notice.
            </p>
            <PlansGrid />
          </FadeIn>
        </div>
      </section>

      <Divider />

      {/* ── SIX GUARANTEES ── */}
      <section style={{ padding: "72px 20px", background: BG }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel>Our guarantees</SectionLabel>
            <h2
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 700,
                color: NAVY,
                letterSpacing: "-0.02em",
                marginBottom: "8px",
                lineHeight: 1.2,
              }}
            >
              Six commitments in writing.
            </h2>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "16px",
                color: MUTED,
                marginBottom: "36px",
                maxWidth: "500px",
              }}
            >
              Most property managers make promises verbally. We put ours in writing
              — with penalty lines.
            </p>

            {/* Guarantee summary pills */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginBottom: "40px",
              }}
            >
              {[
                "21-Day Placement",
                "No Hidden Fees",
                "4-Hour Response",
                "10th-of-Month Statements",
                "30-Day Exit",
                "90-Day Refund",
              ].map((g) => (
                <span
                  key={g}
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: NAVY,
                    background: WHITE,
                    border: `1px solid ${BORDER}`,
                    borderRadius: "20px",
                    padding: "6px 14px",
                  }}
                >
                  {g}
                </span>
              ))}
            </div>

            <div
              style={{
                background: WHITE,
                border: `1px solid ${BORDER}`,
                borderRadius: "16px",
                padding: "8px 24px",
              }}
            >
              <GuaranteeAccordion />
            </div>
          </FadeIn>
        </div>
      </section>

      <Divider />

      {/* ── COMPARISON TABLE ── */}
      <section style={{ padding: "72px 20px", background: WHITE }}>
        <div style={{ maxWidth: "860px", margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel>Full comparison</SectionLabel>
            <h2
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 700,
                color: NAVY,
                letterSpacing: "-0.02em",
                marginBottom: "8px",
                lineHeight: 1.2,
              }}
            >
              See exactly what each plan includes.
            </h2>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "16px",
                color: MUTED,
                marginBottom: "32px",
              }}
            >
              Scroll right on mobile.
            </p>
            <div
              style={{
                background: WHITE,
                border: `1px solid ${BORDER}`,
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              <ComparisonTable />
            </div>
          </FadeIn>
        </div>
      </section>

      <Divider />

      {/* ── TRANSPARENCY STANDARD ── */}
      <section style={{ padding: "72px 20px", background: BG }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel>Transparency standard</SectionLabel>
            <h2
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 700,
                color: NAVY,
                letterSpacing: "-0.02em",
                marginBottom: "24px",
                lineHeight: 1.2,
              }}
            >
              What other managers don't tell you.
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                {
                  title: "We don't mark up maintenance invoices.",
                  body: "Some managers add 10–15% to every vendor invoice. We pass costs through at face value. The plumber charges $180. You're billed $180.",
                },
                {
                  title: "We don't charge placement fees on top of management.",
                  body: "Placement is part of the service. When a tenant turns over, we find the next one. No separate $500–$1,200 placement invoice.",
                },
                {
                  title: "You can leave.",
                  body: "Month-to-month. 30 days written notice. Your files, keys, and deposit records transferred cleanly. No ransom, no penalty.",
                },
                {
                  title: "We don't work with every landlord.",
                  body: "If your property needs significant deferred maintenance, or your expectations aren't aligned with Ontario tenancy law, we'll tell you that upfront rather than take your money and underdeliver.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    background: WHITE,
                    border: `1px solid ${BORDER}`,
                    borderRadius: "14px",
                    padding: "24px",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "15px",
                      fontWeight: 700,
                      color: NAVY,
                      marginBottom: "8px",
                    }}
                  >
                    {item.title}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "14px",
                      color: SUBTLE,
                      lineHeight: 1.65,
                    }}
                  >
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <Divider />

      {/* ── FIRST 14 DAYS ── */}
      <section style={{ padding: "72px 20px", background: WHITE }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel>What happens next</SectionLabel>
            <h2
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 700,
                color: NAVY,
                letterSpacing: "-0.02em",
                marginBottom: "8px",
                lineHeight: 1.2,
              }}
            >
              Your first 14 days with Prospera.
            </h2>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "16px",
                color: MUTED,
                marginBottom: "36px",
              }}
            >
              Onboarding is simple. Here's the exact sequence.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {[
                {
                  day: "Day 1",
                  title: "Discovery call",
                  body: "30 minutes. You tell us about the property, current tenants (if any), and what you're trying to solve. We tell you exactly how we'd handle it. No sales pitch.",
                },
                {
                  day: "Day 2–3",
                  title: "Agreement & onboarding package",
                  body: "Management agreement sent digitally. You sign, return a copy of your lease, and transfer keys. That's it.",
                },
                {
                  day: "Day 4–7",
                  title: "Property walkthrough",
                  body: "We inspect the property and document its current condition. Existing maintenance issues are flagged with recommended actions.",
                },
                {
                  day: "Day 8–14",
                  title: "Tenant introduction",
                  body: "Current tenants receive an introduction letter. They get portal access, the new contact number, and a clear explanation of how maintenance requests work going forward.",
                },
                {
                  day: "Day 15+",
                  title: "You stop thinking about it",
                  body: "Rent deposits on the 1st. Monthly statements by the 10th. You check your bank account — that's the whole job now.",
                },
              ].map((step, i, arr) => (
                <div
                  key={step.day}
                  style={{
                    display: "flex",
                    gap: "20px",
                    paddingBottom: i < arr.length - 1 ? "0" : "0",
                  }}
                >
                  {/* Timeline line */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: i === arr.length - 1 ? BURGUNDY : NAVY,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-dm-sans)",
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#FAF8F5",
                        }}
                      >
                        {i + 1}
                      </span>
                    </div>
                    {i < arr.length - 1 && (
                      <div
                        style={{
                          width: "1px",
                          flex: 1,
                          minHeight: "40px",
                          background: BORDER,
                          margin: "4px 0",
                        }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ paddingBottom: i < arr.length - 1 ? "32px" : "0" }}>
                    <p
                      style={{
                        fontFamily: "var(--font-dm-sans)",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: MUTED,
                        textTransform: "uppercase",
                        letterSpacing: "0.10em",
                        marginBottom: "4px",
                        marginTop: "6px",
                      }}
                    >
                      {step.day}
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-dm-sans)",
                        fontSize: "15px",
                        fontWeight: 700,
                        color: NAVY,
                        marginBottom: "6px",
                      }}
                    >
                      {step.title}
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-dm-sans)",
                        fontSize: "14px",
                        color: SUBTLE,
                        lineHeight: 1.65,
                      }}
                    >
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <Divider />

      {/* ── BEFORE / AFTER ── */}
      <section style={{ padding: "72px 20px", background: BG }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel>Before & after</SectionLabel>
            <h2
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 700,
                color: NAVY,
                letterSpacing: "-0.02em",
                marginBottom: "32px",
                lineHeight: 1.2,
              }}
            >
              Self-managing vs. Prospera.
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              {/* Before */}
              <div
                style={{
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: "16px",
                  padding: "24px",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "12px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.10em",
                    color: MUTED,
                    marginBottom: "16px",
                  }}
                >
                  Self-managing
                </p>
                {[
                  "Chasing rent by the 5th",
                  "Googling the right LTB form",
                  "2AM maintenance calls",
                  "Guessing at legal compliance",
                  "Coordinating your own vendors",
                  "Tracking expenses in a spreadsheet",
                  "Renewal notices on your calendar",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      padding: "8px 0",
                      borderBottom: `1px solid ${BORDER}`,
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "13px",
                      color: SUBTLE,
                    }}
                  >
                    <span style={{ color: MUTED, flexShrink: 0 }}>–</span>
                    {item}
                  </div>
                ))}
              </div>

              {/* After */}
              <div
                style={{
                  background: WHITE,
                  border: `1px solid ${NAVY}`,
                  borderRadius: "16px",
                  padding: "24px",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "12px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.10em",
                    color: BURGUNDY,
                    marginBottom: "16px",
                  }}
                >
                  With Prospera
                </p>
                {[
                  "Rent deposited. Statement by the 10th.",
                  "Legal forms filed correctly, on time.",
                  "We take the call. You sleep.",
                  "Ontario RTA compliance, handled.",
                  "Vetted vendors, real cost passed through.",
                  "Year-end expense summary, ready.",
                  "Renewals tracked, negotiated, done.",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      padding: "8px 0",
                      borderBottom: `1px solid ${BORDER}`,
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "13px",
                      color: NAVY,
                      fontWeight: 500,
                    }}
                  >
                    <span style={{ color: BURGUNDY, flexShrink: 0, fontWeight: 700 }}>✓</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <Divider />

      {/* ── 90-DAY CERTIFICATE ── */}
      <section style={{ padding: "72px 20px", background: NAVY }}>
        <div style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <div
              style={{
                border: "1px solid rgba(250,248,245,0.15)",
                borderRadius: "20px",
                padding: "48px 32px",
                position: "relative",
              }}
            >
              {/* Decorative corners */}
              <div style={{ position: "absolute", top: "16px", left: "16px", width: "24px", height: "24px", borderTop: "2px solid rgba(250,248,245,0.20)", borderLeft: "2px solid rgba(250,248,245,0.20)" }} />
              <div style={{ position: "absolute", top: "16px", right: "16px", width: "24px", height: "24px", borderTop: "2px solid rgba(250,248,245,0.20)", borderRight: "2px solid rgba(250,248,245,0.20)" }} />
              <div style={{ position: "absolute", bottom: "16px", left: "16px", width: "24px", height: "24px", borderBottom: "2px solid rgba(250,248,245,0.20)", borderLeft: "2px solid rgba(250,248,245,0.20)" }} />
              <div style={{ position: "absolute", bottom: "16px", right: "16px", width: "24px", height: "24px", borderBottom: "2px solid rgba(250,248,245,0.20)", borderRight: "2px solid rgba(250,248,245,0.20)" }} />

              <p
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "rgba(250,248,245,0.45)",
                  marginBottom: "16px",
                }}
              >
                Guarantee №6
              </p>

              <p
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontSize: "clamp(56px, 10vw, 96px)",
                  fontWeight: 700,
                  color: BURGUNDY,
                  lineHeight: 1,
                  marginBottom: "16px",
                  letterSpacing: "-0.02em",
                }}
              >
                90
              </p>

              <p
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontSize: "clamp(20px, 3vw, 28px)",
                  fontWeight: 700,
                  color: "#FAF8F5",
                  marginBottom: "16px",
                  lineHeight: 1.3,
                }}
              >
                Days to decide.
              </p>

              <p
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "15px",
                  color: "rgba(250,248,245,0.70)",
                  lineHeight: 1.65,
                  maxWidth: "440px",
                  margin: "0 auto 28px",
                }}
              >
                Try Prospera for 90 days. If you are not satisfied with the quality
                of our service in a way we cannot resolve, we will refund your
                first month's management fee in full. No conditions. No negotiation.
              </p>

              <p
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "11px",
                  color: "rgba(250,248,245,0.35)",
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                }}
              >
                Prospera Properties · London, Ontario
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      <Divider />

      {/* ── FINE PRINT ── */}
      <section style={{ padding: "48px 20px", background: BG }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel>The fine print (there isn't much)</SectionLabel>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "12px",
              }}
            >
              {[
                {
                  q: "Are there setup or onboarding fees?",
                  a: "No. Onboarding is part of the service.",
                },
                {
                  q: "What happens if the unit is vacant?",
                  a: "Management fees apply only when there is a paying tenant. No rent, no fee.",
                },
                {
                  q: "Do you charge to renew a lease?",
                  a: "Not on Autopilot or Hands-Free. On Minimum Essentials, lease renewals are a $200 add-on.",
                },
                {
                  q: "How are maintenance costs handled?",
                  a: "Costs are deducted from rent collected and itemized on your monthly statement. No markups.",
                },
                {
                  q: "Is there a minimum contract length?",
                  a: "No. Month-to-month only. Exit with 30 days written notice.",
                },
                {
                  q: "Where do you operate?",
                  a: "London, St. Thomas, Strathroy, and surrounding areas in southwestern Ontario.",
                },
              ].map((item) => (
                <div
                  key={item.q}
                  style={{
                    background: WHITE,
                    border: `1px solid ${BORDER}`,
                    borderRadius: "14px",
                    padding: "20px",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: NAVY,
                      marginBottom: "8px",
                    }}
                  >
                    {item.q}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "13px",
                      color: SUBTLE,
                      lineHeight: 1.6,
                    }}
                  >
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <Divider />

      {/* ── CTA FOOTER ── */}
      <section style={{ padding: "80px 20px 100px", background: WHITE }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: MUTED,
                marginBottom: "16px",
              }}
            >
              Ready?
            </p>
            <h2
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(32px, 5vw, 52px)",
                fontWeight: 700,
                color: NAVY,
                letterSpacing: "-0.02em",
                marginBottom: "16px",
                lineHeight: 1.1,
              }}
            >
              Start with a 30-minute call.
            </h2>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "16px",
                color: MUTED,
                marginBottom: "36px",
                lineHeight: 1.65,
              }}
            >
              No commitment. No sales pressure. We'll tell you exactly
              what managing your property looks like and what it costs.
            </p>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
              <Link
                href="/contact"
                style={{
                  display: "inline-block",
                  background: BURGUNDY,
                  color: "#FAF8F5",
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  padding: "18px 40px",
                  borderRadius: "10px",
                }}
              >
                Book your discovery call
              </Link>

              <Link
                href="/demo"
                style={{
                  display: "inline-block",
                  background: "transparent",
                  color: NAVY,
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "13px",
                  fontWeight: 600,
                  textDecoration: "none",
                  border: `1px solid ${BORDER}`,
                  padding: "14px 32px",
                  borderRadius: "10px",
                }}
              >
                Or try the portal demo first →
              </Link>

              <a
                href="tel:+15196971227"
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "14px",
                  color: MUTED,
                  textDecoration: "none",
                }}
              >
                Or call (519) 697-1227
              </a>
            </div>

            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "12px",
                color: MUTED,
                marginTop: "32px",
              }}
            >
              Prospera Properties · London, St. Thomas & Strathroy, Ontario
            </p>
          </FadeIn>
        </div>
      </section>

    </div>
  );
}
