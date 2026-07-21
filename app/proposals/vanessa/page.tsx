import type { Metadata } from "next";
import PrintButton from "./PrintButton";

export const metadata: Metadata = {
  title: "Custom Proposal for Vanessa · Prospera Properties",
  description: "A personalized property management proposal from Prospera Properties.",
  robots: { index: false, follow: false },
};

const steps = [
  { n: "01", body: "We take over communication with the tenant and the LTB file exactly where it stands today. Nothing gets refiled or restarted." },
  { n: "02", body: "We coordinate with your paralegal every step of the way — and if you don't have one, you can use ours. Every subsequent form is prepared to spec, and the file is represented at the hearing." },
  { n: "03", body: "If it comes to eviction, we see it through — paralegal, filings, hearing, and sheriff enforcement if it gets there. Paralegal and LTB filing costs are billed separately at exact cost." },
  { n: "04", body: "Once the tenant is out, we screen and place a new tenant under the same coverage." },
  { n: "05", body: "Once that unit is paying rent again, you can choose to keep the plan or step down to a lower-cost plan any time. No minimum term, no penalty." },
];

const vacantPoints = [
  "No ongoing management commitment — just tenant placement.",
  "Full screening: credit, income, references, ID.",
  "Placed within 21 days, or the placement fee is waived entirely. (T&C Apply)",
  "If that tenant leaves within 12 months, we place the next one free.",
];

const guarantees = [
  { big: "21 days", label: "Placement Guarantee", body: "A qualified tenant within 21 days, or the fee is waived. (T&C Apply)" },
  { big: "12 mo", label: "Replacement Warranty", body: "If a tenant we place leaves within 12 months, we place the next one free." },
  { big: "90 days", label: "Satisfaction Guarantee", body: "Not satisfied in the first 90 days? Every management fee you've paid is refunded." },
];

const pricing1 = [
  { item: "Management fee (while unresolved)", cost: "$149/mo flat", when: "Starts Aug 1, continues monthly until resolved" },
  { item: "Management fee (pre-eviction to re-lease)", cost: "$0", when: "From eviction until a new tenant is placed" },
  { item: "Management fee (after re-lease)", cost: "25% of 1st month\n+ normal 15%", when: "Step-down anytime, minimum 3 month term" },
];

const pricing2 = [
  { item: "Placement fee", cost: "75% of 1st month", when: "Only once tenant is placed and paying" },
  { item: "Management fee while empty", cost: "$0", when: "No charge while the unit sits vacant" },
];

function CheckIcon({ color = "#7B2D34" }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: "2px" }}>
      <path d="M3 8.4l3 3 7-7.6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function VanessaProposalPage() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Hanken+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        .vp-root {
          background: #E7E3DA;
          font-family: 'Hanken Grotesk', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          min-height: 100vh;
          padding: 0;
        }
        /* Deck wrapper */
        .vp-deck {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          padding: 32px 16px 72px;
        }
        /* Page cards */
        .vp-page {
          width: 100%;
          max-width: 760px;
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 24px;
          box-shadow: 0 4px 24px rgba(34,30,24,0.10);
          padding: 40px 24px 36px;
          position: relative;
        }
        /* Accent top bar */
        .vp-topbar {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 5px;
          background: #7B2D34;
        }
        /* Typography */
        .vp-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #7B2D34;
          margin: 0 0 12px;
        }
        .vp-h1 {
          font-family: 'Spectral', serif;
          font-weight: 400;
          font-size: clamp(32px, 8vw, 52px);
          line-height: 1.08;
          letter-spacing: -0.015em;
          color: #191C24;
          margin: 0 0 20px;
        }
        .vp-h2 {
          font-family: 'Spectral', serif;
          font-weight: 400;
          font-size: clamp(26px, 6vw, 44px);
          line-height: 1.1;
          letter-spacing: -0.01em;
          color: #191C24;
          margin: 0 0 16px;
        }
        .vp-body {
          font-size: 16px;
          line-height: 1.65;
          color: #3B3E46;
          margin: 0 0 20px;
        }
        .vp-body-sm {
          font-size: 14px;
          line-height: 1.6;
          color: #3B3E46;
          margin: 0;
        }
        /* Stats row */
        .vp-stats {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 0;
          margin: 28px 0;
          border: 1px solid #E5E1D7;
          border-radius: 10px;
          overflow: hidden;
        }
        .vp-stat {
          padding: 20px 16px;
          text-align: center;
          border-right: 1px solid #E5E1D7;
        }
        .vp-stat:last-child { border-right: none; }
        .vp-stat-big {
          font-family: 'Spectral', serif;
          font-size: clamp(28px, 7vw, 42px);
          font-weight: 500;
          color: #191C24;
          line-height: 1;
          display: block;
          margin-bottom: 6px;
        }
        .vp-stat-label {
          font-size: 12px;
          color: #5A5D65;
          line-height: 1.4;
        }
        /* Cover footer */
        .vp-cover-footer {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          border-top: 1px solid #E5E1D7;
          padding-top: 20px;
          margin-top: 28px;
        }
        /* Property cards 2-col */
        .vp-prop-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin: 20px 0;
        }
        .vp-prop-card {
          background: #F6F3EC;
          border-radius: 10px;
          padding: 20px;
          border-top: 3px solid #7B2D34;
        }
        /* Steps */
        .vp-step {
          display: flex;
          gap: 18px;
          padding: 14px 0;
          border-top: 1px solid #E5E1D7;
        }
        .vp-step-n {
          font-family: 'Spectral', serif;
          font-weight: 500;
          font-size: 17px;
          color: #7B2D34;
          width: 30px;
          flex-shrink: 0;
          padding-top: 2px;
        }
        .vp-step-body {
          font-size: 15px;
          line-height: 1.6;
          color: #191C24;
          margin: 0;
          flex: 1;
        }
        /* Vacant points box */
        .vp-vacant-box {
          background: #F6F3EC;
          border-left: 3px solid #7B2D34;
          border-radius: 10px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 12px;
        }
        .vp-vacant-item {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          font-size: 15px;
          line-height: 1.5;
          color: #191C24;
        }
        /* Guarantees grid */
        .vp-guarantee-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 14px;
          margin-top: 14px;
        }
        .vp-guarantee-card {
          background: #F6F3EC;
          border-radius: 10px;
          padding: 18px;
          border-top: 3px solid #7B2D34;
        }
        /* Pricing table */
        .vp-pricing-table {
          border: 1px solid #E5E1D7;
          border-radius: 12px;
          overflow: hidden;
          margin-top: 20px;
        }
        .vp-pricing-head {
          padding: 10px 20px;
          background: #F6F3EC;
          border-bottom: 1px solid #E5E1D7;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #7B2D34;
        }
        /* Desktop: 3-col pricing row */
        .vp-pricing-row {
          display: grid;
          grid-template-columns: 1.6fr 0.85fr 1.3fr;
          gap: 12px;
          padding: 14px 20px;
          border-bottom: 1px solid #E5E1D7;
          align-items: start;
        }
        .vp-pricing-row:last-child { border-bottom: none; }
        .vp-pricing-item { font-size: 14px; font-weight: 600; color: #191C24; line-height: 1.4; }
        .vp-pricing-cost {
          font-family: 'Spectral', serif;
          font-size: 16px;
          font-weight: 500;
          color: #5E2026;
          line-height: 1.35;
          white-space: pre-line;
        }
        .vp-pricing-when { font-size: 13px; color: #5A5D65; line-height: 1.45; }
        /* What's due accent table */
        .vp-due-table {
          border: 1.5px solid #7B2D34;
          border-radius: 12px;
          overflow: hidden;
          margin-top: 16px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.07);
        }
        .vp-due-head {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #7B2D34;
        }
        .vp-due-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: rgba(255,255,255,0.85);
          flex-shrink: 0;
        }
        .vp-due-row {
          display: grid;
          grid-template-columns: 1.6fr 0.85fr 1.3fr;
          gap: 12px;
          padding: 14px 20px;
          background: #F6F3EC;
          border-bottom: 1px solid #E5E1D7;
          align-items: start;
        }
        .vp-due-row:last-child { border-bottom: none; }
        /* Dark page (page 5) */
        .vp-page-dark {
          background: #191C24;
        }
        /* 90-day block */
        .vp-ninety {
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 10px;
          overflow: hidden;
          margin-top: 28px;
        }
        .vp-ninety-head {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 22px;
          background: #7B2D34;
        }
        .vp-ninety-body {
          display: flex;
          flex-direction: column;
        }
        .vp-ninety-left {
          padding: 24px 22px;
          border-bottom: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
        }
        .vp-ninety-right {
          padding: 22px 22px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        /* Contact footer */
        .vp-contact {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          border-top: 1px solid rgba(255,255,255,0.12);
          padding-top: 28px;
          margin-top: 32px;
          text-align: center;
        }
        .vp-contact-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: center;
        }
        /* Page footer */
        .vp-page-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #E5E1D7;
          padding-top: 20px;
          margin-top: 32px;
        }
        .vp-page-footer-dark {
          border-top-color: rgba(255,255,255,0.12);
        }
        /* Print button */
        .vp-print-wrap {
          text-align: center;
          padding-bottom: 16px;
        }
        /* Dark links */
        .vp-dark-link {
          color: #D9A6AB;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        /* Inline quote block */
        .vp-quote {
          background: #191C24;
          border-radius: 10px;
          padding: 20px 24px;
          margin-top: 24px;
        }
        /* Section label on dark */
        .vp-eyebrow-light { color: #D9A6AB; }

        /* ===== TABLET ===== */
        @media (min-width: 560px) {
          .vp-deck { padding: 40px 24px 80px; gap: 0; }
          .vp-page { padding: 52px 40px 44px; border-radius: 14px; }
          .vp-ninety-body { flex-direction: row; }
          .vp-ninety-left { border-bottom: none; border-right: 1px solid rgba(255,255,255,0.12); flex: 1; }
          .vp-ninety-right { flex: 1; justify-content: center; }
          .vp-contact {
            flex-direction: row;
            align-items: center;
            text-align: left;
          }
          .vp-contact-info { align-items: flex-start; }
        }

        /* ===== DESKTOP ===== */
        @media (min-width: 860px) {
          .vp-deck { padding: 48px 24px 80px; }
          .vp-page { padding: 68px 68px 56px; border-radius: 4px; max-width: 816px; box-shadow: 0 8px 34px rgba(34,30,24,0.13); margin-bottom: 40px; }
          .vp-prop-grid { gap: 22px; }
          .vp-guarantee-grid { gap: 16px; }
          .vp-body { font-size: 18px; }
          .vp-body-sm { font-size: 15px; }
          .vp-step-body { font-size: 17px; }
          .vp-vacant-item { font-size: 16.5px; }
          .vp-pricing-row { padding: 15px 26px; gap: 18px; grid-template-columns: 1.5fr 0.9fr 1.4fr; }
          .vp-pricing-item { font-size: 15.5px; }
          .vp-pricing-cost { font-size: 18px; }
          .vp-due-row { padding: 16px 26px; gap: 18px; grid-template-columns: 1.5fr 0.9fr 1.4fr; }
          .vp-due-row .vp-pricing-cost { font-size: 22px; }
          .vp-pricing-head { padding: 11px 26px; }
          .vp-due-head { padding: 12px 26px; }
          .vp-contact {
            flex-direction: row;
            text-align: left;
          }
          .vp-contact-info { align-items: flex-start; }
        }

        /* ===== MOBILE: override grids to 1-col ===== */
        @media (max-width: 559px) {
          .vp-prop-grid { grid-template-columns: 1fr; gap: 14px; }
          .vp-guarantee-grid { grid-template-columns: 1fr; gap: 12px; }
          .vp-guarantee-card { display: flex; gap: 16px; align-items: flex-start; border-top: none; border-left: 3px solid #7B2D34; padding: 16px 18px; }
          .vp-guarantee-big { font-size: 28px !important; margin-bottom: 0 !important; min-width: 70px; }
          .vp-guarantee-right { flex: 1; }
          /* Pricing rows: item full-width, then cost + when side by side */
          .vp-pricing-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto auto;
            gap: 4px 12px;
            padding: 14px 16px;
          }
          .vp-pricing-row .vp-pricing-item {
            grid-column: 1 / -1;
            font-size: 14px;
            margin-bottom: 4px;
          }
          .vp-pricing-row .vp-pricing-cost {
            font-size: 17px;
            align-self: start;
          }
          .vp-pricing-row .vp-pricing-when {
            font-size: 12.5px;
            color: #5A5D65;
            align-self: start;
          }
          .vp-due-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto auto;
            gap: 4px 12px;
            padding: 14px 16px;
          }
          .vp-due-row .vp-pricing-item {
            grid-column: 1 / -1;
            font-size: 14px;
            margin-bottom: 4px;
          }
          .vp-due-row .vp-pricing-cost {
            font-size: 20px;
            align-self: start;
          }
          .vp-due-row .vp-pricing-when {
            font-size: 12.5px;
            color: #5A5D65;
            align-self: start;
          }
          .vp-stats {
            grid-template-columns: 1fr;
          }
          .vp-stat {
            border-right: none;
            border-bottom: 1px solid #E5E1D7;
            display: flex;
            align-items: center;
            gap: 16px;
            text-align: left;
            padding: 16px 18px;
          }
          .vp-stat:last-child { border-bottom: none; }
          .vp-stat-big { font-size: 32px; margin-bottom: 0; }
          .vp-stat-label { font-size: 13px; }
          .vp-contact { flex-direction: column; align-items: flex-start; }
          .vp-contact-info { align-items: flex-start; }
        }

        /* ===== PRINT ===== */
        @media print {
          @page { size: Letter; margin: 0; }
          .vp-root { background: #fff; }
          .vp-deck { gap: 0; padding: 0; background: #fff; }
          .vp-page { box-shadow: none; margin: 0; border-radius: 0; break-after: page; page-break-after: always; max-width: 100%; }
          .vp-page:last-of-type { break-after: auto; page-break-after: auto; }
          .vp-print-wrap { display: none; }
        }
      `}</style>

      <div className="vp-root">
        <div className="vp-deck">

          {/* ========= PAGE 1 · COVER ========= */}
          <section className="vp-page">
            <div className="vp-topbar" />

            {/* Header row */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px" }}>
              <div>
                <div style={{ fontFamily: "'Spectral', serif", fontWeight: 600, fontSize: "20px", letterSpacing: "0.14em", color: "#191C24", lineHeight: 1 }}>
                  PROSPERA PROPERTIES
                </div>
                <div style={{ fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: "16px", color: "#7B2D34", marginTop: "8px" }}>
                  Rent it right.
                </div>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Prospera Properties" style={{ width: "72px", height: "72px", objectFit: "contain", flexShrink: 0 }} />
            </div>

            {/* Eyebrow + Headline */}
            <p className="vp-eyebrow">Prepared for Vanessa · July 21, 2026</p>
            <h1 className="vp-h1">
              We put out the fires first.<br />
              <span style={{ fontStyle: "italic", color: "#7B2D34" }}>The rest can wait.</span>
            </h1>
            <p className="vp-body">
              Vanessa, our suggestion: start with just two units — the tenant who&apos;s behind, and the unit that&apos;s empty. Not because we can&apos;t take more, but because starting small keeps this risk-free for you. The rest of your portfolio is a conversation for whenever you&apos;re ready — not a condition of saying yes today.
            </p>

            {/* Stats */}
            <div className="vp-stats">
              <div className="vp-stat">
                <span className="vp-stat-big">2 units</span>
                <span className="vp-stat-label">to start — only what&apos;s urgent right now</span>
              </div>
              <div className="vp-stat">
                <span className="vp-stat-big">$0</span>
                <span className="vp-stat-label">due today — onboarding waived</span>
              </div>
              <div className="vp-stat">
                <span className="vp-stat-big">90 days</span>
                <span className="vp-stat-label">satisfaction guarantee, fees refunded in full</span>
              </div>
            </div>

            {/* Cover footer */}
            <div className="vp-cover-footer">
              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <span style={{ color: "#E0A92E", fontSize: "15px", letterSpacing: "1px" }}>★★★★★</span>
                <span style={{ fontSize: "13px", color: "#191C24", fontWeight: 700 }}>5.0</span>
                <span style={{ fontSize: "13px", color: "#5A5D65" }}>/ 21 Google reviews</span>
              </div>
              <span style={{ width: "1px", height: "18px", background: "#E5E1D7", display: "inline-block" }} />
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#191C24" }}>LPMA Member</span>
              <span style={{ width: "1px", height: "18px", background: "#E5E1D7", display: "inline-block" }} />
              <span style={{ fontSize: "13px", color: "#5A5D65" }}>London, St. Thomas &amp; Strathroy</span>
              <span style={{ marginLeft: "auto", fontSize: "12px", color: "#5A5D65" }}>prosperaproperties.co</span>
            </div>
          </section>

          {/* ========= PAGE 2 · SITUATION ========= */}
          <section className="vp-page">
            <p className="vp-eyebrow">The situation</p>
            <h2 className="vp-h2">
              Two units need attention.<br />
              <span style={{ fontStyle: "italic", color: "#7B2D34" }}>Right now.</span>
            </h2>
            <p className="vp-body">
              One of your tenants is three months behind on rent, with an L1 already filed and no hearing date yet. A separate unit is sitting vacant. Managing both alone adds stress and risk that&apos;s easy to underestimate — from getting the LTB process exactly right to losing income the longer a unit sits empty.
            </p>

            {/* Property cards */}
            <div className="vp-prop-grid">
              <div className="vp-prop-card">
                <p className="vp-eyebrow" style={{ marginBottom: "10px" }}>Property 1</p>
                <div style={{ fontFamily: "'Spectral', serif", fontSize: "22px", fontWeight: 500, color: "#191C24", marginBottom: "10px", lineHeight: 1.2 }}>
                  The non-paying tenant
                </div>
                <p className="vp-body-sm">
                  Three months behind. N4 filed, no hearing date. Every next step in the LTB process has to be done exactly right — and someone has to be tracking it.
                </p>
              </div>
              <div className="vp-prop-card">
                <p className="vp-eyebrow" style={{ marginBottom: "10px" }}>Property 2</p>
                <div style={{ fontFamily: "'Spectral', serif", fontSize: "22px", fontWeight: 500, color: "#191C24", marginBottom: "10px", lineHeight: 1.2 }}>
                  The vacant unit
                </div>
                <p className="vp-body-sm">
                  Every month empty is a month of income gone. It needs professional marketing and real screening — credit, income, references, ID.
                </p>
              </div>
            </div>

            {/* Approach */}
            <div style={{ marginTop: "28px" }}>
              <p className="vp-eyebrow">The approach</p>
              <p className="vp-body" style={{ marginBottom: 0 }}>
                We&apos;re suggesting you start with just these two — not because we can&apos;t take on more, but because it keeps this completely low-stakes for you. You see exactly how we work on the hardest problems first. If we earn it, the bigger conversation happens on your terms, whenever you&apos;re ready.
              </p>
            </div>

            {/* Quote block */}
            <div className="vp-quote">
              <p style={{ fontFamily: "'Spectral', serif", fontStyle: "italic", fontSize: "18px", lineHeight: 1.6, color: "#fff", margin: 0 }}>
                Risk-free and headache-free by design: nothing due today, month-to-month, and a 90-day guarantee that refunds every management fee if you&apos;re not satisfied.
              </p>
            </div>

            <div className="vp-page-footer">
              <span style={{ fontSize: "11px", color: "#5A5D65" }}>Prospera Properties · Prepared for Vanessa</span>
              <span style={{ fontSize: "11px", color: "#5A5D65" }}>02 / 05</span>
            </div>
          </section>

          {/* ========= PAGE 3 · THE PLAN ========= */}
          <section className="vp-page">
            <p className="vp-eyebrow">The plan, unit by unit</p>
            <h2 className="vp-h2">
              Here&apos;s exactly what happens — <span style={{ fontStyle: "italic", color: "#7B2D34" }}>step by step.</span>
            </h2>

            {/* Steps — Property 1 */}
            <p className="vp-eyebrow" style={{ marginTop: "24px", marginBottom: "4px" }}>Property 1 · The unit with the non-paying tenant</p>
            <div>
              {steps.map((s) => (
                <div key={s.n} className="vp-step">
                  <span className="vp-step-n">{s.n}</span>
                  <p className="vp-step-body">{s.body}</p>
                </div>
              ))}
              <div style={{ borderTop: "1px solid #E5E1D7" }} />
            </div>

            {/* Vacant unit */}
            <div style={{ marginTop: "28px" }}>
              <p className="vp-eyebrow" style={{ marginBottom: "4px" }}>Property 2 · The vacant unit</p>
              <div className="vp-vacant-box">
                {vacantPoints.map((v) => (
                  <div key={v} className="vp-vacant-item">
                    <CheckIcon />
                    <span>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Guarantees */}
            <div style={{ marginTop: "32px" }}>
              <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#5A5D65", margin: "0 0 14px" }}>
                Every guarantee, in writing
              </p>
              <div className="vp-guarantee-grid">
                {guarantees.map((g) => (
                  <div key={g.label} className="vp-guarantee-card">
                    <div className="vp-guarantee-big" style={{ fontFamily: "'Spectral', serif", fontWeight: 500, fontSize: "28px", color: "#191C24", lineHeight: 1, marginBottom: "8px" }}>{g.big}</div>
                    <div className="vp-guarantee-right">
                      <div style={{ fontWeight: 700, fontSize: "14px", color: "#5E2026", marginBottom: "6px" }}>{g.label}</div>
                      <p style={{ fontSize: "13.5px", lineHeight: 1.5, color: "#3B3E46", margin: 0 }}>{g.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="vp-page-footer">
              <span style={{ fontSize: "11px", color: "#5A5D65" }}>Prospera Properties · Prepared for Vanessa</span>
              <span style={{ fontSize: "11px", color: "#5A5D65" }}>03 / 05</span>
            </div>
          </section>

          {/* ========= PAGE 4 · PRICING ========= */}
          <section className="vp-page">
            <p className="vp-eyebrow">Pricing</p>
            <h2 className="vp-h2">
              Priced for a problem,<br />
              <span style={{ fontStyle: "italic", color: "#7B2D34" }}>not a portfolio.</span>
            </h2>
            <p className="vp-body">
              Month-to-month, no long contract, and nothing here is a percentage of rent you don&apos;t have. Paralegal and LTB filing costs are billed separately at exact cost — no markup, no hidden math.
            </p>

            {/* Property 1 pricing */}
            <div className="vp-pricing-table">
              <div className="vp-pricing-head">Property 1 · Non-paying tenant</div>
              {pricing1.map((row) => (
                <div key={row.item} className="vp-pricing-row">
                  <span className="vp-pricing-item">{row.item}</span>
                  <span className="vp-pricing-cost">{row.cost}</span>
                  <span className="vp-pricing-when">{row.when}</span>
                </div>
              ))}
            </div>

            {/* Property 2 pricing */}
            <div className="vp-pricing-table">
              <div className="vp-pricing-head">Property 2 · Vacant unit</div>
              {pricing2.map((row) => (
                <div key={row.item} className="vp-pricing-row">
                  <span className="vp-pricing-item">{row.item}</span>
                  <span className="vp-pricing-cost">{row.cost}</span>
                  <span className="vp-pricing-when">{row.when}</span>
                </div>
              ))}
            </div>

            {/* What's due */}
            <div className="vp-due-table">
              <div className="vp-due-head">
                <span className="vp-due-dot" />
                <span style={{ fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#fff" }}>What&apos;s due</span>
              </div>
              <div className="vp-due-row">
                <span className="vp-pricing-item">Due today — to sign the agreement</span>
                <span className="vp-pricing-cost">$0</span>
                <span className="vp-pricing-when">Onboarding is waived</span>
              </div>
              <div className="vp-due-row">
                <span className="vp-pricing-item">First payment</span>
                <span className="vp-pricing-cost">$149</span>
                <span className="vp-pricing-when">Due August 1st — when we actually begin managing</span>
              </div>
            </div>

            <div className="vp-page-footer">
              <span style={{ fontSize: "11px", color: "#5A5D65" }}>Prospera Properties · Prepared for Vanessa</span>
              <span style={{ fontSize: "11px", color: "#5A5D65" }}>04 / 05</span>
            </div>
          </section>

          {/* ========= PAGE 5 · NEXT STEPS ========= */}
          <section className="vp-page vp-page-dark">
            <div className="vp-topbar" />

            <p className="vp-eyebrow vp-eyebrow-light">Next steps</p>
            <h2 className="vp-h2" style={{ color: "#fff", marginBottom: "16px" }}>
              Review the details and we&apos;ll talk as planned.
            </h2>
            <p className="vp-body" style={{ color: "#CDCFD5" }}>
              If this works for you, we sign for these two units on that same call — nothing due at signing, first payment is $149 on August 1st. From that day, the LTB file, the tenant communication, and the empty unit are ours to track. Yours is to be kept in the loop.
            </p>

            {/* 90-day block */}
            <div className="vp-ninety">
              <div className="vp-ninety-head">
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "rgba(255,255,255,0.85)", display: "inline-block", flexShrink: 0 }} />
                <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#fff" }}>90-day satisfaction guarantee</span>
              </div>
              <div className="vp-ninety-body">
                <div className="vp-ninety-left">
                  <div style={{ fontFamily: "'Spectral', serif", fontWeight: 500, fontSize: "44px", color: "#fff", lineHeight: 1, marginBottom: "10px" }}>90 days</div>
                  <div style={{ fontSize: "15px", lineHeight: 1.5, color: "#C6C9D0" }}>to decide it&apos;s worth it — the risk is ours, not yours.</div>
                </div>
                <div className="vp-ninety-right">
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <CheckIcon color="#D9A6AB" />
                    <span style={{ fontSize: "15px", lineHeight: 1.5, color: "#fff" }}>Not satisfied in the first 90 days? Every management fee you&apos;ve paid is refunded.</span>
                  </div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <CheckIcon color="#D9A6AB" />
                    <span style={{ fontSize: "15px", lineHeight: 1.5, color: "#fff" }}>Month-to-month after that — no minimum term, no penalty for changing your mind.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Links */}
            <div style={{ marginTop: "32px", textAlign: "center", paddingBottom: "8px" }}>
              <p style={{ fontFamily: "'Spectral', serif", fontWeight: 400, fontSize: "clamp(18px,4vw,26px)", color: "#fff", margin: 0, lineHeight: 1.5 }}>
                See our full pricing{" "}
                <a href="https://www.prosperaproperties.co/pricing" className="vp-dark-link">here</a>
                {" "}· Demo Landlord Portal{" "}
                <a href="https://www.prosperaproperties.co/demo/owner" className="vp-dark-link">here</a>
              </p>
            </div>

            {/* Contact */}
            <div className="vp-contact">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/ebin-founder.jpg"
                alt="Ebin Jaison"
                style={{ width: "90px", height: "110px", borderRadius: "8px", objectFit: "cover", objectPosition: "center top", display: "block", flexShrink: 0 }}
              />
              <div className="vp-contact-info">
                <span style={{ fontFamily: "'Spectral', serif", fontWeight: 600, fontSize: "20px", color: "#fff" }}>Ebin Jaison</span>
                <span style={{ fontSize: "12.5px", color: "#A9ACB4", marginTop: "2px" }}>Founder &amp; Owner · Prospera Properties</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", fontSize: "12.5px", color: "#C8CAD0", marginTop: "6px" }}>
                  <span>hello@prosperaproperties.co</span>
                  <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
                  <span>(519) 697-1227</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <span style={{ color: "#E0A92E", fontSize: "14px", letterSpacing: "1px" }}>★★★★★</span>
                <span style={{ fontSize: "13px", color: "#fff", fontWeight: 600, whiteSpace: "nowrap" }}>5.0 on Google</span>
                <span style={{ fontSize: "11.5px", color: "#A9ACB4", whiteSpace: "nowrap" }}>21 reviews</span>
              </div>
            </div>
          </section>

          {/* Print button */}
          <div className="vp-print-wrap">
            <PrintButton />
          </div>

        </div>
      </div>
    </>
  );
}
