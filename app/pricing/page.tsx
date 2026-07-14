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
    "Transparent property management pricing for London, St. Thomas, and Strathroy landlords. Three plans — 7%, 10%, or 15% — with clear fees and six written guarantees.",
};

// ── Design tokens ──────────────────────────────────────────────────────────

const NAVY = "#1F2F3A";
const BURGUNDY = "#8B2030";
const BG = "#F7F5F2";
const WHITE = "#FFFFFF";
const BORDER = "#D8D2C8";
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
    <div style={{ background: BG, color: SUBTLE }}>

      {/* ── HERO ── */}
      <section
        style={{
          background: NAVY,
          padding: "clamp(100px, 12vw, 160px) clamp(20px, 4vw, 60px) clamp(64px, 8vw, 100px)",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
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
              Property Management · London, St. Thomas &amp; Strathroy
            </p>

            <h1
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(44px, 6vw, 80px)",
                fontWeight: 700,
                color: "#FAF8F5",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                marginBottom: "24px",
                whiteSpace: "pre-line",
              }}
            >
              Sleep through the night.{"\n"}
              <span style={{ color: "rgba(250,248,245,0.55)" }}>We&apos;ve got it from here.</span>
            </h1>

            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "clamp(17px, 2vw, 21px)",
                color: "rgba(250,248,245,0.80)",
                lineHeight: 1.65,
                maxWidth: "620px",
                marginBottom: "40px",
              }}
            >
              Real estate should build your wealth — not consume your weekends. Three plans,
              clear pricing, six written guarantees. Pick the level of involvement you want
              and hand the rest to us.
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
                  Not satisfied in 90 days? Every penny of our fees, refunded.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── EMOTIONAL SECTION — real cost of self-managing ── */}
      <section
        style={{
          background: WHITE,
          padding: "clamp(64px, 8vw, 120px) clamp(20px, 4vw, 60px)",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel>The real cost of self-managing</SectionLabel>
            <h2
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(32px, 4vw, 56px)",
                fontWeight: 700,
                color: NAVY,
                letterSpacing: "-0.02em",
                marginBottom: "24px",
                lineHeight: 1.15,
              }}
            >
              It&apos;s not just the time. It&apos;s everything else.
            </h2>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "clamp(17px, 2vw, 21px)",
                color: SUBTLE,
                lineHeight: 1.75,
                maxWidth: "680px",
                marginBottom: "20px",
              }}
            >
              The Sunday evening you spent chasing a late rent payment. The 2AM pipe burst.
              The three hours you spent on hold with the LTB. The anxiety of not knowing if
              you filed the right form. The argument that made you question why you ever bought
              the property in the first place.
            </p>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "clamp(17px, 2vw, 21px)",
                color: SUBTLE,
                lineHeight: 1.75,
                maxWidth: "680px",
                marginBottom: "56px",
              }}
            >
              None of that is in the spreadsheet. But it&apos;s costing you — in sleep, in stress,
              in the slow erosion of something that was supposed to be passive.
            </p>

            {/* Quote block */}
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontSize: "clamp(32px, 5vw, 56px)",
                  fontWeight: 700,
                  color: NAVY,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                  marginBottom: "16px",
                }}
              >
                &ldquo;Passive income should be passive.&rdquo;
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      <Divider />

      {/* ── NOT A LINE ITEM ── */}
      <section
        style={{
          padding: "clamp(64px, 8vw, 120px) clamp(20px, 4vw, 60px)",
          background: NAVY,
        }}
      >
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <FadeIn>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "rgba(250,248,245,0.45)",
                marginBottom: "16px",
              }}
            >
              Individual attention
            </p>
            <h2
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(36px, 5vw, 64px)",
                fontWeight: 700,
                color: "#FAF8F5",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                marginBottom: "24px",
                maxWidth: "760px",
              }}
            >
              You are not a line item in a $1,500 portfolio.
            </h2>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "clamp(17px, 2vw, 20px)",
                color: "rgba(250,248,245,0.70)",
                lineHeight: 1.7,
                maxWidth: "640px",
                marginBottom: "56px",
              }}
            >
              Most property management companies carry hundreds of doors on their roster.
              You become a door number, not a relationship. At Prospera, your property has
              a named manager — one person who knows your address, your tenant, your history.
              Not whoever picks up the phone.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "16px",
              }}
            >
              {[
                {
                  icon: "🤝",
                  title: "A named property manager",
                  body: "One point of contact. They know your property, your preferences, and your tenant. You won't repeat yourself.",
                },
                {
                  icon: "📞",
                  title: "Direct, personal access",
                  body: "Your manager's direct line. Not a queue. Not a ticket number. A person who knows who you are when you call.",
                },
                {
                  icon: "🛡️",
                  title: "Owner's satisfaction guarantee",
                  body: "If we're not delivering in 90 days, we refund every single penny of our management fees. No conditions. No fine print.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    background: "rgba(250,248,245,0.07)",
                    border: "1px solid rgba(250,248,245,0.12)",
                    borderRadius: "16px",
                    padding: "28px 24px",
                  }}
                >
                  <span style={{ fontSize: "28px", display: "block", marginBottom: "14px" }}>{item.icon}</span>
                  <p
                    style={{
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#FAF8F5",
                      marginBottom: "10px",
                      lineHeight: 1.3,
                    }}
                  >
                    {item.title}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "14px",
                      color: "rgba(250,248,245,0.65)",
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

      {/* ── PERSONA SELECTOR ── */}
      <section
        style={{
          padding: "clamp(64px, 8vw, 120px) clamp(20px, 4vw, 60px)",
          background: BG,
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel>Which landlord are you?</SectionLabel>
            <h2
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(32px, 4vw, 56px)",
                fontWeight: 700,
                color: NAVY,
                letterSpacing: "-0.02em",
                marginBottom: "8px",
                lineHeight: 1.15,
              }}
            >
              Find your plan in under 30 seconds.
            </h2>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "clamp(17px, 2vw, 21px)",
                color: MUTED,
                marginBottom: "36px",
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
      <section
        style={{
          padding: "clamp(64px, 8vw, 120px) clamp(20px, 4vw, 60px)",
          background: WHITE,
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel>The plans</SectionLabel>
            <h2
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(32px, 4vw, 56px)",
                fontWeight: 700,
                color: NAVY,
                letterSpacing: "-0.02em",
                marginBottom: "8px",
                lineHeight: 1.15,
              }}
            >
              Three plans. One transparent rate.
            </h2>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "clamp(17px, 2vw, 21px)",
                color: MUTED,
                marginBottom: "48px",
                maxWidth: "560px",
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
      <section
        style={{
          padding: "clamp(64px, 8vw, 120px) clamp(20px, 4vw, 60px)",
          background: BG,
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel>Our guarantees</SectionLabel>
            <h2
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(32px, 4vw, 56px)",
                fontWeight: 700,
                color: NAVY,
                letterSpacing: "-0.02em",
                marginBottom: "8px",
                lineHeight: 1.15,
              }}
            >
              Six commitments in writing.
            </h2>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "clamp(17px, 2vw, 21px)",
                color: MUTED,
                marginBottom: "36px",
                maxWidth: "540px",
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
                "Full Fee Transparency",
                "4-Hour Response",
                "10th-of-Month Statements",
                "30-Day Exit",
                "90-Day Money-Back",
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
      <section
        style={{
          padding: "clamp(64px, 8vw, 120px) clamp(20px, 4vw, 60px)",
          background: WHITE,
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel>Full comparison</SectionLabel>
            <h2
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(32px, 4vw, 56px)",
                fontWeight: 700,
                color: NAVY,
                letterSpacing: "-0.02em",
                marginBottom: "8px",
                lineHeight: 1.15,
              }}
            >
              See exactly what each plan includes.
            </h2>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "clamp(17px, 2vw, 21px)",
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

      {/* ── TRANSPARENCY SECTION ── */}
      <section
        style={{
          padding: "clamp(64px, 8vw, 120px) clamp(20px, 4vw, 60px)",
          background: BG,
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel>Transparency standard</SectionLabel>
            <h2
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(32px, 4vw, 56px)",
                fontWeight: 700,
                color: NAVY,
                letterSpacing: "-0.02em",
                marginBottom: "32px",
                lineHeight: 1.15,
              }}
            >
              Everything on the table.
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                {
                  title: "Maintenance coordination has a markup — and it scales with your plan.",
                  body: "We don't pretend vendors are free to coordinate. On Essentials, the markup is 18%. On Autopilot, it's 10%. On Hands-Free, there's no markup — it's included in the rate. You know the number before we ever pick up the phone.",
                },
                {
                  title: "There's a placement fee — and it's the same across every plan.",
                  body: "When we place a tenant, we charge 10% of the first month's rent. That covers advertising, showings, screening, and onboarding. It's a one-time charge per tenancy, and it's capped at that. No invoice padding on top.",
                },
                {
                  title: "Two of three plans have an onboarding fee.",
                  body: "Essentials and Autopilot have a one-time onboarding fee ($149.99 and $99.99 respectively) that covers intake, existing maintenance audit, and system setup. Hands-Free clients have it waived. It's charged once, at the start.",
                },
                {
                  title: "You can leave. No penalty.",
                  body: "Month-to-month agreements. 30 days written notice. Your files, keys, and records transferred cleanly to you or your next manager. We'd rather earn your continued trust than lock it in.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    background: WHITE,
                    border: `1px solid ${BORDER}`,
                    borderRadius: "14px",
                    padding: "28px",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "16px",
                      fontWeight: 700,
                      color: NAVY,
                      marginBottom: "10px",
                    }}
                  >
                    {item.title}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "15px",
                      color: SUBTLE,
                      lineHeight: 1.7,
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
      <section
        style={{
          padding: "clamp(64px, 8vw, 120px) clamp(20px, 4vw, 60px)",
          background: WHITE,
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel>What happens next</SectionLabel>
            <h2
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(32px, 4vw, 56px)",
                fontWeight: 700,
                color: NAVY,
                letterSpacing: "-0.02em",
                marginBottom: "8px",
                lineHeight: 1.15,
              }}
            >
              Your first 14 days with Prospera.
            </h2>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "clamp(17px, 2vw, 21px)",
                color: MUTED,
                marginBottom: "48px",
              }}
            >
              Onboarding is simple. Here&apos;s the exact sequence.
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
      <section
        style={{
          padding: "clamp(64px, 8vw, 120px) clamp(20px, 4vw, 60px)",
          background: BG,
        }}
      >
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel>Before &amp; after</SectionLabel>
            <h2
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(32px, 4vw, 56px)",
                fontWeight: 700,
                color: NAVY,
                letterSpacing: "-0.02em",
                marginBottom: "40px",
                lineHeight: 1.15,
              }}
            >
              Self-managing vs. Prospera.
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
              }}
            >
              {/* Before */}
              <div
                style={{
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: "16px",
                  padding: "32px",
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
                    marginBottom: "20px",
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
                      padding: "10px 0",
                      borderBottom: `1px solid ${BORDER}`,
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "14px",
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
                  padding: "32px",
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
                    marginBottom: "20px",
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
                      padding: "10px 0",
                      borderBottom: `1px solid ${BORDER}`,
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "14px",
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
      <section
        style={{
          padding: "clamp(64px, 8vw, 120px) clamp(20px, 4vw, 60px)",
          background: NAVY,
        }}
      >
        <div style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <div
              style={{
                border: "1px solid rgba(250,248,245,0.15)",
                borderRadius: "20px",
                padding: "56px 40px",
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
                Try Prospera for 90 days. If we are not delivering in a way we
                cannot resolve, we will refund every single penny of our management
                fees from your first 90 days. No conditions. No negotiation.
                No fine print.
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
      <section
        style={{
          padding: "clamp(48px, 6vw, 80px) clamp(20px, 4vw, 60px)",
          background: BG,
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <FadeIn>
            <SectionLabel>The fine print (there isn&apos;t much)</SectionLabel>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "12px",
              }}
            >
              {[
                {
                  q: "Are there onboarding fees?",
                  a: "Yes — $149.99 for Essentials, $99.99 for Autopilot. Hands-Free clients have it waived. It's a one-time charge.",
                },
                {
                  q: "What happens if the unit is vacant?",
                  a: "Management fees apply only when there is a paying tenant. No rent, no fee.",
                },
                {
                  q: "Do you charge to renew a lease?",
                  a: "Not on Autopilot or Hands-Free. On Minimum Essentials, lease renewals are available as an add-on.",
                },
                {
                  q: "Are maintenance costs marked up?",
                  a: "Yes, depending on your plan. Essentials: 18% coordination fee. Autopilot: 10%. Hands-Free: no markup. All costs are itemized on your monthly statement.",
                },
                {
                  q: "Is there a placement fee?",
                  a: "Yes — 10% of first month's rent, across all plans. Charged once per new tenancy.",
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

      {/* ── DEMO PORTAL ── */}
      <section
        style={{
          padding: "clamp(64px, 8vw, 120px) clamp(20px, 4vw, 60px)",
          background: NAVY,
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <p
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "rgba(250,248,245,0.45)",
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            Try it yourself
          </p>
          <h2
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 700,
              color: "#FAF8F5",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              marginBottom: "12px",
              textAlign: "center",
            }}
          >
            See the portal before you sign anything.
          </h2>
          <p
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "clamp(17px, 2vw, 21px)",
              color: "rgba(250,248,245,0.65)",
              textAlign: "center",
              marginBottom: "56px",
              lineHeight: 1.6,
            }}
          >
            No login. No email required. Explore both sides — what you see as the owner,
            and what your tenant sees.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            {/* Owner card */}
            <Link
              href="/demo/owner"
              style={{
                background: "#FFFFFF",
                borderRadius: "20px",
                padding: "36px 28px",
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                gap: "0",
              }}
            >
              <span style={{ fontSize: "36px", marginBottom: "16px", display: "block" }}>🏠</span>
              <p
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.10em",
                  color: "rgba(15,28,40,0.40)",
                  marginBottom: "6px",
                }}
              >
                Owner view
              </p>
              <p
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontSize: "clamp(22px, 3.5vw, 30px)",
                  fontWeight: 700,
                  color: NAVY,
                  letterSpacing: "-0.01em",
                  lineHeight: 1.15,
                  marginBottom: "12px",
                }}
              >
                Explore being a Landlord
              </p>
              <p
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "14px",
                  color: "rgba(15,28,40,0.55)",
                  lineHeight: 1.6,
                  marginBottom: "24px",
                  flex: 1,
                }}
              >
                Financials, repair tracking, tenant details, monthly statements, and your owner dashboard.
              </p>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: NAVY,
                  color: "#FAF8F5",
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "13px 20px",
                  borderRadius: "10px",
                  alignSelf: "flex-start",
                }}
              >
                Open owner portal →
              </span>
            </Link>

            {/* Tenant card */}
            <Link
              href="/demo/tenant"
              style={{
                background: "rgba(250,248,245,0.07)",
                border: "1px solid rgba(250,248,245,0.12)",
                borderRadius: "20px",
                padding: "36px 28px",
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                gap: "0",
              }}
            >
              <span style={{ fontSize: "36px", marginBottom: "16px", display: "block" }}>🔑</span>
              <p
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.10em",
                  color: "rgba(250,248,245,0.35)",
                  marginBottom: "6px",
                }}
              >
                Tenant view
              </p>
              <p
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontSize: "clamp(22px, 3.5vw, 30px)",
                  fontWeight: 700,
                  color: "#FAF8F5",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.15,
                  marginBottom: "12px",
                }}
              >
                See how tenants experience it
              </p>
              <p
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "14px",
                  color: "rgba(250,248,245,0.55)",
                  lineHeight: 1.6,
                  marginBottom: "24px",
                  flex: 1,
                }}
              >
                Payment history, maintenance requests, documents, and the message thread with Prospera.
              </p>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: BURGUNDY,
                  color: "#FAF8F5",
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "13px 20px",
                  borderRadius: "10px",
                  alignSelf: "flex-start",
                }}
              >
                Open tenant portal →
              </span>
            </Link>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── CTA FOOTER ── */}
      <section
        style={{
          padding: "clamp(80px, 10vw, 140px) clamp(20px, 4vw, 60px)",
          background: WHITE,
        }}
      >
        <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
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
              The first step is 30 minutes.
            </p>
            <h2
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(32px, 5vw, 60px)",
                fontWeight: 700,
                color: NAVY,
                letterSpacing: "-0.02em",
                marginBottom: "20px",
                lineHeight: 1.1,
              }}
            >
              You don&apos;t have to figure this out alone.
            </h2>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "clamp(17px, 2vw, 21px)",
                color: MUTED,
                marginBottom: "44px",
                lineHeight: 1.65,
                maxWidth: "560px",
                margin: "0 auto 44px",
              }}
            >
              Tell us about your property. We&apos;ll tell you exactly what it costs, what we&apos;d
              do differently than you&apos;re doing now, and whether we&apos;re the right fit.
              No pressure. No pitch.
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
                  padding: "20px 48px",
                  borderRadius: "10px",
                }}
              >
                Book a free call →
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
                marginTop: "40px",
              }}
            >
              Prospera Properties · London, St. Thomas &amp; Strathroy, Ontario
            </p>
          </FadeIn>
        </div>
      </section>

    </div>
  );
}
