import type { Metadata } from "next";
import PrintButton from "./PrintButton";

export const metadata: Metadata = {
  title: "Custom Proposal for Vanessa · Prospera Properties",
  description: "A personalized property management proposal from Prospera Properties.",
  robots: { index: false, follow: false },
};

const ACCENT = "#7B2D34";
const ACCENT_DEEP = "#5E2026";
const INK = "#191C24";
const MUTED = "#3B3E46";
const FAINT = "#5A5D65";
const PAPER = "#FFFFFF";
const PANEL = "#F6F3EC";
const LINE = "#E5E1D7";

const steps = [
  { n: "01", body: "We take over communication with the tenant and the LTB file exactly where it stands today. Nothing gets refiled or restarted." },
  { n: "02", body: "We coordinate with your paralegal every step of the way — and if you don't have one, you can use ours. Every subsequent form is prepared to spec, and the file is represented at the hearing." },
  { n: "03", body: "If it comes to eviction, we see it through — paralegal, filings, hearing, and sheriff enforcement if it gets there. Paralegal and LTB filing costs are billed separately (at exact cost)." },
  { n: "04", body: "Once the tenant is out, we screen and place a new tenant under the same coverage." },
  { n: "05", body: "Once that unit is paying rent again, you can choose to keep the plan or step down to a lower-cost plan any time. No minimum term, no penalty." },
];

const vacantPoints = [
  "No ongoing management commitment attached to this one — just tenant placement.",
  "Full screening: credit, income, references, ID.",
  "Placed within 21 days, or the placement fee is waived entirely. (T&C Apply)",
  "If that tenant leaves within 12 months, we place the next one free.",
];

const guarantees = [
  { big: "21 days", label: "Placement Guarantee", body: "A qualified tenant within 21 days, or the placement fee is waived. (T&C Apply)" },
  { big: "12 mo", label: "Replacement Warranty", body: "If a tenant we place leaves within 12 months, we place the next one free." },
  { big: "90 days", label: "Satisfaction Guarantee", body: "Not satisfied in the first 90 days? Every management fee you've paid is refunded." },
];

const pricing1 = [
  { item: "Management fee (while unresolved)", cost: "$149/mo flat", when: "Starts Aug 1, continues monthly until the file is resolved" },
  { item: "Management fee (once vacant, pre-eviction to re-lease)", cost: "$0", when: "From eviction until a new tenant is placed" },
  { item: "Management fee (after re-lease)", cost: "25% of 1st month + normal 15%", when: "Step-down to a lower plan any time, minimum 3 month term" },
];

const pricing2 = [
  { item: "Placement fee", cost: "75% of 1st month", when: "Only once a tenant is placed and paying" },
  { item: "Management fee while empty", cost: "$0", when: "No charge while the unit sits vacant" },
];

function CheckIcon({ color = ACCENT }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: "3px" }}>
      <path d="M3 8.4l3 3 7-7.6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PageFooter({ page, total = 5 }: { page: number; total?: number }) {
  return (
    <div style={{ marginTop: "auto", paddingTop: "30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: "11.5px", letterSpacing: "0.04em", color: FAINT }}>Prospera Properties · Prepared for Vanessa</span>
      <span style={{ fontSize: "11.5px", letterSpacing: "0.06em", color: FAINT }}>{String(page).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
    </div>
  );
}

export default function VanessaProposalPage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Hanken+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <style>{`
        .proposal-deck * { box-sizing: border-box; }
        .proposal-deck { background: #E7E3DA; font-family: 'Hanken Grotesk', system-ui, sans-serif; -webkit-font-smoothing: antialiased; min-height: 100vh; display: flex; flex-direction: column; align-items: center; gap: 40px; padding: 48px 24px 80px; }
        .proposal-page { width: 816px; background: #fff; box-shadow: 0 8px 34px rgba(34,30,24,0.13); border-radius: 3px; position: relative; overflow: hidden; }
        @media print {
          @page { size: Letter; margin: 0; }
          body { background: #fff !important; }
          .proposal-deck { gap: 0 !important; padding: 0 !important; background: #fff !important; }
          .proposal-page { box-shadow: none !important; margin: 0 !important; border-radius: 0 !important; break-after: page; height: 1056px !important; min-height: 0 !important; overflow: hidden !important; page-break-after: always; }
          .proposal-page:last-child { break-after: auto; page-break-after: auto; }
          .print-hide { display: none !important; }
        }
        @media (max-width: 880px) {
          .proposal-page { width: 100%; }
          .proposal-deck { padding: 24px 16px 60px; gap: 24px; }
        }
      `}</style>

      <div className="proposal-deck">

        {/* ===== PAGE 1 · COVER ===== */}
        <section className="proposal-page" style={{ minHeight: "1056px", padding: "76px 68px 60px", display: "flex", flexDirection: "column" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "8px", background: ACCENT }} />

          {/* Header row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
              <span style={{ fontFamily: "'Spectral', serif", fontWeight: 600, fontSize: "24px", letterSpacing: "0.16em", color: INK }}>PROSPERA PROPERTIES</span>
              <span style={{ fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: "18px", color: ACCENT, marginTop: "11px" }}>Rent it right.</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Prospera Properties" style={{ width: "96px", height: "96px", objectFit: "contain", display: "block", filter: "none" }} />
          </div>

          {/* Hero content */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "36px 0" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "0.32em", textTransform: "uppercase", color: ACCENT }}>Prepared for Vanessa · July 21, 2026</span>
            <h1 style={{ fontFamily: "'Spectral', serif", fontWeight: 400, fontSize: "clamp(40px,7vw,60px)", lineHeight: 1.04, letterSpacing: "-0.015em", color: INK, margin: "28px 0 0" }}>
              We put out the fires first.<br /><span style={{ fontStyle: "italic", color: ACCENT }}>The rest can wait.</span>
            </h1>
            <p style={{ fontSize: "19px", lineHeight: 1.6, color: MUTED, margin: "30px 0 0", maxWidth: "620px" }}>
              Vanessa, our suggestion: start with just two units — the tenant who&apos;s behind, and the unit that&apos;s empty. Not because we can&apos;t take more, but because starting small keeps this risk-free and headache-free for you. The rest of your portfolio is a conversation for whenever you&apos;re ready — not a condition of saying yes today.
            </p>

            <div style={{ display: "flex", gap: "48px", marginTop: "54px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontFamily: "'Spectral', serif", fontSize: "48px", fontWeight: 500, color: INK, lineHeight: 1 }}>2 units</span>
                <span style={{ fontSize: "14px", letterSpacing: "0.04em", color: MUTED, marginTop: "10px" }}>to start — only what&apos;s<br />urgent right now</span>
              </div>
              <div style={{ width: "1px", background: LINE }} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontFamily: "'Spectral', serif", fontSize: "48px", fontWeight: 500, color: INK, lineHeight: 1 }}>$0</span>
                <span style={{ fontSize: "14px", letterSpacing: "0.04em", color: MUTED, marginTop: "10px" }}>due today —<br />onboarding waived</span>
              </div>
              <div style={{ width: "1px", background: LINE }} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontFamily: "'Spectral', serif", fontSize: "48px", fontWeight: 500, color: INK, lineHeight: 1 }}>90 days</span>
                <span style={{ fontSize: "14px", letterSpacing: "0.04em", color: MUTED, marginTop: "10px" }}>satisfaction guarantee,<br />fees refunded in full</span>
              </div>
            </div>
          </div>

          {/* Footer bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap", borderTop: `1px solid ${LINE}`, paddingTop: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#E0A92E", fontSize: "16px", letterSpacing: "1px" }}>★★★★★</span>
              <span style={{ fontSize: "13px", color: INK, fontWeight: 700 }}>5.0</span>
              <span style={{ fontSize: "13px", color: MUTED }}>/ 21 Google reviews</span>
            </div>
            <span style={{ width: "1px", height: "20px", background: LINE }} />
            <span style={{ fontSize: "13px", fontWeight: 600, color: INK }}>LPMA Member</span>
            <span style={{ width: "1px", height: "20px", background: LINE }} />
            <span style={{ fontSize: "13px", color: MUTED }}>London, St. Thomas &amp; Strathroy</span>
            <span style={{ marginLeft: "auto", fontSize: "12.5px", color: FAINT }}>prosperaproperties.co</span>
          </div>
        </section>

        {/* ===== PAGE 2 · SITUATION + APPROACH ===== */}
        <section className="proposal-page" style={{ minHeight: "1056px", padding: "68px 68px 60px", display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase", color: ACCENT }}>The situation</span>
          <h2 style={{ fontFamily: "'Spectral', serif", fontWeight: 400, fontSize: "clamp(32px,5vw,46px)", lineHeight: 1.06, letterSpacing: "-0.01em", color: INK, margin: "14px 0 0" }}>
            Two units need attention.<br /><span style={{ fontStyle: "italic", color: ACCENT }}>Right now.</span>
          </h2>
          <p style={{ fontSize: "19px", lineHeight: 1.6, color: MUTED, margin: "18px 0 0", maxWidth: "660px" }}>
            One of your tenants is three months behind on rent, with an L1 already filed and no hearing date yet. A separate unit is sitting vacant. Managing both alone adds stress and risk that&apos;s easy to underestimate — from getting the LTB process exactly right to losing rental income the longer a unit sits empty.
          </p>

          <div style={{ marginTop: "30px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "22px" }}>
            <div style={{ background: PANEL, borderRadius: "10px", padding: "24px 28px", borderTop: `3px solid ${ACCENT}` }}>
              <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: ACCENT }}>Property 1</span>
              <div style={{ fontFamily: "'Spectral', serif", fontSize: "27px", fontWeight: 500, color: INK, marginTop: "10px", lineHeight: 1.2 }}>The non-paying tenant</div>
              <p style={{ fontSize: "16.5px", lineHeight: 1.55, color: MUTED, margin: "12px 0 0" }}>Three months behind. N4 filed, no hearing date. Every next step in the LTB process has to be done exactly right — and someone has to be tracking it.</p>
            </div>
            <div style={{ background: PANEL, borderRadius: "10px", padding: "24px 28px", borderTop: `3px solid ${ACCENT}` }}>
              <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: ACCENT }}>Property 2</span>
              <div style={{ fontFamily: "'Spectral', serif", fontSize: "27px", fontWeight: 500, color: INK, marginTop: "10px", lineHeight: 1.2 }}>The vacant unit</div>
              <p style={{ fontSize: "16.5px", lineHeight: 1.55, color: MUTED, margin: "12px 0 0" }}>Every month empty is a month of income gone. It needs professional marketing and real screening — credit, income, references, ID.</p>
            </div>
          </div>

          <div style={{ marginTop: "30px" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase", color: ACCENT }}>The approach</span>
            <p style={{ fontSize: "19px", lineHeight: 1.6, color: MUTED, margin: "14px 0 0", maxWidth: "660px" }}>
              We&apos;re suggesting you start with just these two — not because we can&apos;t take on more, but because it keeps this completely low-stakes for you. You see exactly how we work on the hardest problems first. If we earn it, the bigger conversation happens on your terms, whenever you&apos;re ready.
            </p>
          </div>

          <div style={{ marginTop: "auto", paddingTop: "28px" }}>
            <div style={{ background: INK, borderRadius: "10px", padding: "24px 30px" }}>
              <p style={{ fontSize: "19px", lineHeight: 1.55, color: "#fff", margin: 0, fontFamily: "'Spectral', serif", fontStyle: "italic" }}>
                Risk-free and headache-free by design: nothing due today, month-to-month, and a 90-day guarantee that refunds every management fee if you&apos;re not satisfied.
              </p>
            </div>
          </div>

          <PageFooter page={2} />
        </section>

        {/* ===== PAGE 3 · THE PLAN ===== */}
        <section className="proposal-page" style={{ minHeight: "1056px", padding: "68px 68px 60px", display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase", color: ACCENT }}>The plan, unit by unit</span>
          <h2 style={{ fontFamily: "'Spectral', serif", fontWeight: 400, fontSize: "clamp(30px,5vw,44px)", lineHeight: 1.08, letterSpacing: "-0.01em", color: INK, margin: "14px 0 0" }}>
            Here&apos;s exactly what happens — <span style={{ fontStyle: "italic", color: ACCENT }}>step by step.</span>
          </h2>

          {/* Property 1 steps */}
          <div style={{ marginTop: "28px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: ACCENT }}>Property 1 · The unit with the non-paying tenant</span>
            <div style={{ marginTop: "6px", display: "flex", flexDirection: "column" }}>
              {steps.map((s) => (
                <div key={s.n} style={{ display: "flex", gap: "24px", padding: "15px 0", borderTop: `1px solid ${LINE}` }}>
                  <span style={{ fontFamily: "'Spectral', serif", fontWeight: 500, fontSize: "18px", color: ACCENT, width: "34px", flexShrink: 0, paddingTop: "2px" }}>{s.n}</span>
                  <p style={{ fontSize: "17px", lineHeight: 1.55, color: INK, margin: 0, flex: 1 }}>{s.body}</p>
                </div>
              ))}
              <div style={{ borderTop: `1px solid ${LINE}` }} />
            </div>
          </div>

          {/* Property 2 */}
          <div style={{ marginTop: "28px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: ACCENT }}>Property 2 · The vacant unit</span>
            <div style={{ marginTop: "14px", background: PANEL, borderLeft: `3px solid ${ACCENT}`, borderRadius: "10px", padding: "22px 26px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {vacantPoints.map((v) => (
                <div key={v} style={{ display: "flex", gap: "11px", alignItems: "flex-start" }}>
                  <CheckIcon />
                  <span style={{ fontSize: "16.5px", lineHeight: 1.5, color: INK }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Guarantees */}
          <div style={{ marginTop: "30px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: FAINT }}>Every guarantee, in writing</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginTop: "16px" }}>
              {guarantees.map((g) => (
                <div key={g.label} style={{ background: PANEL, borderRadius: "10px", padding: "20px 22px", borderTop: `3px solid ${ACCENT}` }}>
                  <div style={{ fontFamily: "'Spectral', serif", fontWeight: 500, fontSize: "28px", color: INK, lineHeight: 1 }}>{g.big}</div>
                  <div style={{ fontWeight: 700, fontSize: "15px", color: ACCENT_DEEP, marginTop: "9px" }}>{g.label}</div>
                  <p style={{ fontSize: "14.5px", lineHeight: 1.5, color: MUTED, margin: "6px 0 0" }}>{g.body}</p>
                </div>
              ))}
            </div>
          </div>

          <PageFooter page={3} />
        </section>

        {/* ===== PAGE 4 · PRICING ===== */}
        <section className="proposal-page" style={{ minHeight: "1056px", padding: "68px 68px 60px", display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase", color: ACCENT }}>Pricing</span>
          <h2 style={{ fontFamily: "'Spectral', serif", fontWeight: 400, fontSize: "clamp(32px,5vw,48px)", lineHeight: 1.08, letterSpacing: "-0.01em", color: INK, margin: "14px 0 0" }}>
            Priced for a problem,<br /><span style={{ fontStyle: "italic", color: ACCENT }}>not a portfolio.</span>
          </h2>
          <p style={{ fontSize: "19px", lineHeight: 1.6, color: MUTED, margin: "16px 0 0", maxWidth: "660px" }}>
            Month-to-month, no long contract, and nothing here is a percentage of rent you don&apos;t have. Paralegal and LTB filing costs are billed separately at exact cost — no markup, no hidden math.
          </p>

          {/* Property 1 pricing */}
          <div style={{ marginTop: "26px", border: `1px solid ${LINE}`, borderRadius: "12px", overflow: "hidden" }}>
            <div style={{ padding: "11px 26px", background: PANEL, borderBottom: `1px solid ${LINE}` }}>
              <span style={{ fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: ACCENT }}>Property 1 · Non-paying tenant</span>
            </div>
            {pricing1.map((row) => (
              <div key={row.item} style={{ display: "grid", gridTemplateColumns: "1.5fr 0.9fr 1.4fr", gap: "0 18px", padding: "15px 26px", borderBottom: `1px solid ${LINE}`, alignItems: "baseline" }}>
                <span style={{ fontSize: "15.5px", fontWeight: 600, color: INK, lineHeight: 1.4 }}>{row.item}</span>
                <span style={{ fontFamily: "'Spectral', serif", fontSize: "18px", fontWeight: 500, color: ACCENT_DEEP, lineHeight: 1.3 }}>{row.cost}</span>
                <span style={{ fontSize: "14px", color: MUTED, lineHeight: 1.45 }}>{row.when}</span>
              </div>
            ))}
          </div>

          {/* Property 2 pricing */}
          <div style={{ marginTop: "20px", border: `1px solid ${LINE}`, borderRadius: "12px", overflow: "hidden" }}>
            <div style={{ padding: "11px 26px", background: PANEL, borderBottom: `1px solid ${LINE}` }}>
              <span style={{ fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: ACCENT }}>Property 2 · Vacant unit</span>
            </div>
            {pricing2.map((row) => (
              <div key={row.item} style={{ display: "grid", gridTemplateColumns: "1.5fr 0.9fr 1.4fr", gap: "0 18px", padding: "15px 26px", borderBottom: `1px solid ${LINE}`, alignItems: "baseline" }}>
                <span style={{ fontSize: "15.5px", fontWeight: 600, color: INK, lineHeight: 1.4 }}>{row.item}</span>
                <span style={{ fontFamily: "'Spectral', serif", fontSize: "18px", fontWeight: 500, color: ACCENT_DEEP, lineHeight: 1.3 }}>{row.cost}</span>
                <span style={{ fontSize: "14px", color: MUTED, lineHeight: 1.45 }}>{row.when}</span>
              </div>
            ))}
          </div>

          {/* What's due */}
          <div style={{ marginTop: "20px", border: `1.5px solid ${ACCENT}`, borderRadius: "12px", overflow: "hidden", boxShadow: "0 12px 30px rgba(0,0,0,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 26px", background: ACCENT }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#fff", opacity: 0.9, display: "inline-block" }} />
              <span style={{ fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#fff" }}>What&apos;s due</span>
            </div>
            <div style={{ background: PANEL }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 0.9fr 1.4fr", gap: "0 18px", padding: "16px 26px", borderBottom: `1px solid ${LINE}`, alignItems: "baseline" }}>
                <span style={{ fontSize: "15.5px", fontWeight: 600, color: INK }}>Due today — to sign the agreement</span>
                <span style={{ fontFamily: "'Spectral', serif", fontSize: "22px", fontWeight: 500, color: ACCENT_DEEP }}>$0</span>
                <span style={{ fontSize: "14px", color: MUTED }}>Onboarding is waived</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 0.9fr 1.4fr", gap: "0 18px", padding: "16px 26px", alignItems: "baseline" }}>
                <span style={{ fontSize: "15.5px", fontWeight: 600, color: INK }}>First payment</span>
                <span style={{ fontFamily: "'Spectral', serif", fontSize: "22px", fontWeight: 500, color: ACCENT_DEEP }}>$149</span>
                <span style={{ fontSize: "14px", color: MUTED }}>Due August 1st — when we actually begin managing</span>
              </div>
            </div>
          </div>

          <PageFooter page={4} />
        </section>

        {/* ===== PAGE 5 · NEXT STEPS ===== */}
        <section className="proposal-page" style={{ minHeight: "1056px", background: INK, padding: "76px 68px 60px", display: "flex", flexDirection: "column" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "8px", background: ACCENT }} />

          <span style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase", color: "#D9A6AB" }}>Next steps</span>
          <h2 style={{ fontFamily: "'Spectral', serif", fontWeight: 400, fontSize: "clamp(36px,6vw,54px)", lineHeight: 1.07, letterSpacing: "-0.01em", color: "#fff", margin: "16px 0 0" }}>
            Review the details and we&apos;ll talk as planned.
          </h2>
          <p style={{ fontSize: "21px", lineHeight: 1.6, color: "#CDCFD5", margin: "18px 0 0", maxWidth: "640px" }}>
            If this works for you, we sign for these two units on that same call — nothing due at signing, first payment is $149 on August 1st. From that day, the LTB file, the tenant communication, and the empty unit are ours to track. Yours is to be kept in the loop.
          </p>

          {/* 90-day guarantee block */}
          <div style={{ marginTop: "34px", border: "1px solid rgba(255,255,255,0.16)", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 28px", background: ACCENT }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#fff", opacity: 0.9, display: "inline-block" }} />
              <span style={{ fontSize: "12.5px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#fff" }}>90-day satisfaction guarantee</span>
            </div>
            <div style={{ display: "flex" }}>
              <div style={{ flex: 1, padding: "28px", borderRight: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.04)" }}>
                <div style={{ fontFamily: "'Spectral', serif", fontWeight: 500, fontSize: "48px", color: "#fff", lineHeight: 1 }}>90 days</div>
                <div style={{ fontSize: "16px", lineHeight: 1.5, color: "#C6C9D0", marginTop: "12px" }}>to decide it&apos;s worth it — the risk is ours, not yours.</div>
              </div>
              <div style={{ flex: 1, padding: "28px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "12px" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <CheckIcon color="#D9A6AB" />
                  <span style={{ fontSize: "16px", lineHeight: 1.45, color: "#fff" }}>Not satisfied in the first 90 days? Every management fee you&apos;ve paid is refunded.</span>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <CheckIcon color="#D9A6AB" />
                  <span style={{ fontSize: "16px", lineHeight: 1.45, color: "#fff" }}>Month-to-month after that — no minimum term, no penalty for changing your mind.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Links */}
          <div style={{ marginTop: "44px", borderTop: "1px solid rgba(255,255,255,0.14)", paddingTop: "30px" }}>
            <h3 style={{ fontFamily: "'Spectral', serif", fontWeight: 400, fontSize: "32px", color: "#fff", margin: 0, lineHeight: 1.25, textAlign: "center" }}>
              Have a look at our complete pricing{" "}
              <a href="https://www.prosperaproperties.co/pricing" style={{ color: ACCENT, textDecoration: "underline" }}>here</a>
              <br />
              Have a look at our Demo Landlord Portal{" "}
              <a href="https://www.prosperaproperties.co/demo/owner" style={{ color: ACCENT, textDecoration: "underline" }}>here</a>
            </h3>
          </div>

          {/* Contact footer */}
          <div style={{ marginTop: "auto", paddingTop: "34px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "22px", borderTop: "1px solid rgba(255,255,255,0.14)", paddingTop: "24px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/ebin-founder.jpg"
                alt="Ebin Jaison"
                style={{ width: "118px", height: "144px", borderRadius: "8px", objectFit: "cover", objectPosition: "center top", display: "block", flexShrink: 0 }}
              />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px" }}>
                <span style={{ fontFamily: "'Spectral', serif", fontWeight: 600, fontSize: "21px", color: "#fff" }}>Ebin Jaison</span>
                <span style={{ fontSize: "12.5px", color: "#A9ACB4" }}>Founder &amp; Owner · Prospera Properties</span>
                <div style={{ display: "flex", gap: "14px", fontSize: "12.5px", color: "#C8CAD0", marginTop: "2px", flexWrap: "wrap" }}>
                  <span>hello@prosperaproperties.co</span>
                  <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
                  <span>(519) 697-1227</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", paddingLeft: "18px", borderLeft: "1px solid rgba(255,255,255,0.14)", flexShrink: 0 }}>
                <span style={{ color: "#E0A92E", fontSize: "14px", letterSpacing: "1px" }}>★★★★★</span>
                <span style={{ fontSize: "13px", color: "#fff", fontWeight: 600, whiteSpace: "nowrap" }}>5.0 on Google</span>
                <span style={{ fontSize: "11.5px", color: "#A9ACB4", whiteSpace: "nowrap" }}>21 reviews</span>
              </div>
            </div>
          </div>
        </section>

        {/* Print button — hidden on print */}
        <div className="print-hide" style={{ textAlign: "center" }}>
          <PrintButton />
        </div>

      </div>
    </>
  );
}
