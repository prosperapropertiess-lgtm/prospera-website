import Image from "next/image";
import Link from "next/link";

const CALENDLY = "https://calendly.com/prosperapropertiess";
const FONT = "var(--font-dm-sans)";
const SERIF = "var(--font-cormorant)";
const NAVY = "#1F2F3A";
const CRIMSON = "#8B2030";
const CREAM = "#F7F5F2";

function BookButton({ label = "Book a Call & Claim 60 Days Free", full = false, large = false }: {
  label?: string;
  full?: boolean;
  large?: boolean;
}) {
  return (
    <a
      href={CALENDLY}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: full ? "block" : "inline-block",
        textAlign: "center",
        backgroundColor: CRIMSON,
        color: "#FAF8F5",
        fontFamily: FONT,
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        padding: large ? "20px 44px" : "16px 32px",
        borderRadius: "6px",
        textDecoration: "none",
      }}
    >
      {label}
    </a>
  );
}

const PILLARS = [
  { label: "Rent collected & deposited on the 5th", icon: "💳" },
  { label: "Maintenance handled — you hear when it's done", icon: "🔧" },
  { label: "Tenants screened before they sign", icon: "✅" },
  { label: "Ontario-compliant lease & inspections", icon: "📋" },
  { label: "Monthly statement + portfolio report", icon: "📊" },
  { label: "Vacancies filled in 21 days on average", icon: "🏠" },
];

const REVIEWS = [
  {
    name: "Bibin Sebastian",
    text: "Ebin's communication was consistently prompt, clear, and proactive. We particularly valued his honest advice and genuine commitment. I would recommend without hesitation.",
  },
  {
    name: "Nahala Naushad",
    text: "Ebin was very friendly, responsive, and always available to answer my questions. He found me exactly what I was looking for. Highly recommend.",
  },
  {
    name: "Gilsy Sebastian",
    text: "Very efficient, professional and promising. Highly recommended if anyone is looking for property management or rental services.",
  },
];

const OBJECTIONS = [
  {
    q: "I only deal with my property a few times a year.",
    a: "The value is avoiding the expensive moments when they hit — a bad tenant, an untracked repair, an LTB mistake. Those aren't frequent. They're just costly.",
  },
  {
    q: "Property management costs money.",
    a: "So does a vacancy. One month empty on a London 2-bed costs more than a full year of management fees. The fee pays for itself.",
  },
  {
    q: "Switching sounds like a hassle.",
    a: "That's why we start free. Feel what hands-off ownership looks like before committing to anything.",
  },
  {
    q: "I can manage it myself.",
    a: "You probably can. The question is whether it's the best use of your evenings.",
  },
];

export default function PropertyManagementLP() {
  return (
    <div style={{ backgroundColor: CREAM, fontFamily: FONT, paddingBottom: 72 }} className="sm:pb-0 min-h-screen">

      {/* ── Sticky header ─────────────────────────────────────────── */}
      <header style={{ backgroundColor: NAVY, borderBottom: "1px solid rgba(255,255,255,0.07)", position: "sticky", top: 0, zIndex: 50 }}>
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <span className="font-light text-2xl" style={{ color: "#FAF8F5", fontFamily: SERIF }}>
            Prospera
          </span>
          <a
            href={CALENDLY}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-block text-xs font-semibold uppercase tracking-widest px-5 py-2 rounded"
            style={{ backgroundColor: CRIMSON, color: "#FAF8F5", fontFamily: FONT }}
          >
            Book Free Call
          </a>
          <a
            href="tel:+15196971227"
            className="sm:hidden text-sm"
            style={{ color: "rgba(250,248,245,0.7)", fontFamily: FONT }}
          >
            (519) 697-1227
          </a>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: NAVY }} className="pt-16 pb-20 px-5">
        <div className="max-w-3xl mx-auto text-center">
          <p
            className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-6"
            style={{ backgroundColor: "rgba(250,248,245,0.09)", color: "rgba(250,248,245,0.6)", border: "1px solid rgba(250,248,245,0.15)", fontFamily: FONT }}
          >
            Now offering 60 days free · New owners only
          </p>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-light leading-tight mb-6"
            style={{ color: "#FAF8F5", fontFamily: SERIF }}
          >
            Own the Rental.
            <br />
            <em style={{ color: "rgba(250,248,245,0.5)" }}>We Handle Everything Else.</em>
          </h1>

          <p className="text-base leading-relaxed mb-3 max-w-xl mx-auto" style={{ color: "rgba(250,248,245,0.6)", fontFamily: FONT }}>
            Tenant screening, rent collection, maintenance, monthly reports — completely off your plate.
            Built for small landlords in London, St. Thomas, Strathroy &amp; Sarnia.
          </p>
          <p className="text-sm font-medium mb-10" style={{ color: "rgba(250,248,245,0.3)", fontFamily: FONT }}>
            Start with 60 days free. No lock-in.
          </p>

          <BookButton large />

          <div className="mt-10 flex flex-wrap justify-center gap-6 md:gap-12">
            {["25+ placements", "0 LTB filings", "21-day avg fill", "5★ Google"].map(s => (
              <p key={s} className="text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(250,248,245,0.3)", fontFamily: FONT }}>
                {s}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem ──────────────────────────────────────────────── */}
      <section style={{ backgroundColor: "#FFFFFF" }} className="py-16 px-5">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: CRIMSON, fontFamily: FONT }}>Does this sound familiar</p>
          <h2 className="text-3xl sm:text-4xl font-light mb-10 leading-tight" style={{ color: NAVY, fontFamily: SERIF }}>
            The rental was supposed to be passive income.
            <br />
            <em style={{ color: "#999" }}>Somehow it became your second job.</em>
          </h2>
          <div className="space-y-3">
            {[
              "Rent is late and you're the one chasing it.",
              "The phone rings at the worst times — leaks, lockouts, complaints.",
              "One bad tenant can wipe out a year of returns.",
              "You're not sure your last dispute followed Ontario's rules.",
              "Every vacancy quietly burns through your margins.",
              "Your evenings disappear into someone else's problems.",
            ].map((line, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="shrink-0 mt-1 text-sm" style={{ color: CRIMSON }}>×</span>
                <p className="text-base leading-relaxed" style={{ color: "#444", fontFamily: FONT }}>{line}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What we handle ───────────────────────────────────────── */}
      <section style={{ backgroundColor: CREAM, borderTop: "1px solid #E8E4DF" }} className="py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-4 text-center" style={{ color: CRIMSON, fontFamily: FONT }}>What We Handle</p>
          <h2 className="text-3xl sm:text-4xl font-light mb-10 leading-tight text-center" style={{ color: NAVY, fontFamily: SERIF }}>
            Everything you&apos;re currently doing yourself.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PILLARS.map(({ label, icon }) => (
              <div key={label} className="flex items-center gap-3 px-5 py-4 rounded-xl border" style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E4DF" }}>
                <span className="text-xl shrink-0" aria-hidden>{icon}</span>
                <p className="text-sm font-medium" style={{ color: NAVY, fontFamily: FONT }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Real screenshots ─────────────────────────────────────── */}
      <section style={{ backgroundColor: "#FFFFFF", borderTop: "1px solid #E8E4DF" }} className="py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-4 text-center" style={{ color: CRIMSON, fontFamily: FONT }}>What You See Every Month</p>
          <h2 className="text-3xl sm:text-4xl font-light mb-4 leading-tight text-center" style={{ color: NAVY, fontFamily: SERIF }}>
            Total visibility. Zero effort on your end.
          </h2>
          <p className="text-sm text-center max-w-lg mx-auto mb-12" style={{ color: "#666", fontFamily: FONT }}>
            Every month you get a clear picture of your property — without having to ask for it.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 items-start">
            {[
              {
                src: "/lp-pm-dashboard.png",
                width: 440,
                height: 780,
                title: "Owner Dashboard",
                desc: "Rent collected, occupancy, and repairs — your property's full status, always up to date.",
              },
              {
                src: "/lp-pm-monthly-statement.png",
                width: 440,
                height: 900,
                title: "Monthly Statement",
                desc: "Line-by-line income and expense breakdown for every unit, every month.",
              },
              {
                src: "/lp-pm-portfolio-report.png",
                width: 440,
                height: 780,
                title: "Portfolio Report",
                desc: "Net income, pending requests, and action items — sent to your inbox monthly.",
              },
            ].map(({ src, width, height, title, desc }) => (
              <div key={title} className="flex flex-col items-center gap-4">
                <div style={{ width: "100%", maxWidth: 220, margin: "0 auto", border: "6px solid #1a1a1a", borderRadius: 28, overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.16)" }}>
                  <Image src={src} alt={title} width={width} height={height} className="w-full h-auto block" priority />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold mb-1" style={{ color: NAVY, fontFamily: FONT }}>{title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: "#666", fontFamily: FONT }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 60-Day offer ─────────────────────────────────────────── */}
      <section style={{ backgroundColor: CREAM, borderTop: "1px solid #E8E4DF" }} className="py-16 px-5">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl p-8 sm:p-10 text-center" style={{ border: "2px solid #C8A96E", backgroundColor: "#FDFAF5", boxShadow: "0 8px 40px rgba(200,169,110,0.12)" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#C8A96E", fontFamily: FONT }}>Limited · New Owners Only</p>
            <h2 className="text-3xl sm:text-4xl font-light mb-5 leading-tight" style={{ color: NAVY, fontFamily: SERIF }}>
              Try full property management<br />free for 60 days.
            </h2>
            <p className="text-base leading-relaxed mb-5" style={{ color: "#444", fontFamily: FONT }}>
              Feel what hands-off ownership is actually like. If we&apos;re not making your life easier, walk away — no penalty.
            </p>
            <p className="text-sm mb-8 px-4 py-3 rounded-lg" style={{ color: "#666", fontFamily: FONT, backgroundColor: "rgba(200,169,110,0.08)", border: "1px solid rgba(200,169,110,0.2)" }}>
              Management fee waived for your first 60 days. Placement fee applies if a new tenant is placed during the trial. No long-term contract.
            </p>
            <BookButton full />
          </div>
        </div>
      </section>

      {/* ── Cost math ─────────────────────────────────────────────── */}
      <section style={{ backgroundColor: NAVY }} className="py-16 px-5">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: CRIMSON, fontFamily: FONT }}>The Real Cost</p>
          <h2 className="text-3xl sm:text-4xl font-light mb-6 leading-tight" style={{ color: "#FAF8F5", fontFamily: SERIF }}>
            Self-managing isn&apos;t free.
            <br />
            <em style={{ color: "rgba(250,248,245,0.4)" }}>It&apos;s billed in stress and lost returns.</em>
          </h2>
          <p className="text-base mb-8 leading-relaxed" style={{ color: "rgba(250,248,245,0.5)", fontFamily: FONT }}>
            A London 2-bedroom runs $1,800–$2,400/month. One month vacant costs more than a full year of management fees. One wrong N4 notice resets the LTB clock by months.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {[
              { label: "1 month vacant", cost: "$1,800–$2,400 gone" },
              { label: "Overpaid repair", cost: "No vendor = 2× market rate" },
              { label: "Bad tenant", cost: "Months of non-payment" },
              { label: "Wrong N4 notice", cost: "Resets the clock 2–3 months" },
            ].map(({ label, cost }) => (
              <div key={label} className="p-5 rounded-xl border" style={{ borderColor: "rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.04)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "rgba(250,248,245,0.35)", fontFamily: FONT }}>{label}</p>
                <p className="text-base" style={{ color: "#FAF8F5", fontFamily: FONT }}>{cost}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <BookButton label="Start 60 Days Free →" />
          </div>
        </div>
      </section>

      {/* ── Reviews ───────────────────────────────────────────────── */}
      <section style={{ backgroundColor: "#FFFFFF", borderTop: "1px solid #E8E4DF" }} className="py-16 px-5">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-4 text-center" style={{ color: CRIMSON, fontFamily: FONT }}>What People Say</p>
          <div className="flex items-center justify-center gap-2 mb-10">
            <span style={{ color: CRIMSON, fontSize: 16, letterSpacing: 3 }}>★★★★★</span>
            <span className="text-2xl font-light" style={{ color: NAVY, fontFamily: SERIF }}>5.0</span>
            <a href="https://share.google/Zicj8qNuNcLhLhqvf" target="_blank" rel="noopener noreferrer" className="text-xs underline" style={{ color: "#999", fontFamily: FONT }}>
              20+ Google reviews
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
            {REVIEWS.map(({ name, text }) => (
              <div key={name} className="p-6 rounded-xl border" style={{ backgroundColor: CREAM, borderColor: "#E8E4DF" }}>
                <p className="text-base leading-relaxed mb-4" style={{ color: "#1a1a1a", fontFamily: SERIF, fontStyle: "italic" }}>
                  &ldquo;{text}&rdquo;
                </p>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#999", fontFamily: FONT }}>— {name}</p>
                <p className="text-xs mt-1" style={{ color: "#ccc", fontFamily: FONT }}>Google ★★★★★</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {[{ v: "25+", l: "Properties placed" }, { v: "Zero", l: "LTB filings" }, { v: "21 days", l: "Avg time to fill" }].map(({ v, l }) => (
              <div key={l} className="text-center">
                <p className="text-3xl font-light mb-1" style={{ color: NAVY, fontFamily: SERIF }}>{v}</p>
                <p className="text-xs uppercase tracking-widest" style={{ color: "#999", fontFamily: FONT }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Objections ────────────────────────────────────────────── */}
      <section style={{ backgroundColor: CREAM, borderTop: "1px solid #E8E4DF" }} className="py-16 px-5">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: CRIMSON, fontFamily: FONT }}>Common Questions</p>
          <h2 className="text-3xl sm:text-4xl font-light mb-10 leading-tight" style={{ color: NAVY, fontFamily: SERIF }}>Straight answers.</h2>
          <div className="space-y-4">
            {OBJECTIONS.map(({ q, a }) => (
              <div key={q} className="p-6 rounded-xl border" style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E4DF" }}>
                <p className="text-sm font-semibold mb-2" style={{ color: NAVY, fontFamily: FONT }}>&ldquo;{q}&rdquo;</p>
                <p className="text-sm leading-relaxed" style={{ color: "#555", fontFamily: FONT }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section style={{ backgroundColor: NAVY }} className="py-24 px-5 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-light mb-5 leading-tight" style={{ color: "#FAF8F5", fontFamily: SERIF }}>
            You bought a rental for the income and the freedom.
            <br />
            <em style={{ color: "rgba(250,248,245,0.4)" }}>Let&apos;s get you back to the freedom part.</em>
          </h2>
          <p className="text-sm mb-10 max-w-md mx-auto" style={{ color: "rgba(250,248,245,0.4)", fontFamily: FONT }}>
            Free 20-minute call. Honest assessment. No pressure.
          </p>
          <BookButton large />
          <p className="mt-6 text-xs" style={{ color: "rgba(250,248,245,0.2)", fontFamily: FONT }}>
            (519) 697-1227 &nbsp;·&nbsp; prosperapropertiess@gmail.com
          </p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer style={{ backgroundColor: "#141F29", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto px-5 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-lg font-light" style={{ color: "#FAF8F5", fontFamily: SERIF }}>Prospera Properties</p>
          <p className="text-xs text-center" style={{ color: "rgba(250,248,245,0.3)", fontFamily: FONT }}>
            London · Strathroy · St. Thomas · Sarnia, ON &nbsp;·&nbsp;{" "}
            <Link href="/privacy" style={{ color: "rgba(250,248,245,0.3)" }}>Privacy</Link>
          </p>
        </div>
      </footer>

      {/* ── Sticky mobile CTA bar ─────────────────────────────────── */}
      <div
        className="sm:hidden fixed bottom-0 left-0 right-0 px-4 py-3"
        style={{ backgroundColor: NAVY, borderTop: "1px solid rgba(255,255,255,0.1)", zIndex: 40 }}
      >
        <a
          href={CALENDLY}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            textAlign: "center",
            backgroundColor: CRIMSON,
            color: "#FAF8F5",
            fontFamily: FONT,
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "16px",
            borderRadius: "6px",
            textDecoration: "none",
          }}
        >
          Book a Call &amp; Claim 60 Days Free
        </a>
      </div>

    </div>
  );
}
