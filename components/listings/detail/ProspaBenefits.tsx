
import Link from "next/link";

const BENEFITS = [
  {
    icon: "⚡",
    title: "24-Hour Response Guarantee",
    desc: "Every maintenance request, every question — answered within 24 hours. No black holes.",
  },
  {
    icon: "📱",
    title: "Automated Online Rent Payment",
    desc: "Pay rent from your phone in 30 seconds. No cheques, no e-transfers, no hassle.",
  },
  {
    icon: "🏆",
    title: "Payment Streak Perks",
    desc: "On-time rent streaks unlock rewards. We believe good tenants should be recognized.",
  },
  {
    icon: "📊",
    title: "Credit Reporting — Coming Soon",
    desc: "Your rent payments will build your credit score. Renting should help your future.",
  },
  {
    icon: "📅",
    title: "One-Tap Viewing Schedule",
    desc: "Pre-qualify online and book a viewing instantly. No phone tag, no waiting.",
  },
  {
    icon: "🏠",
    title: "Tenant Portal",
    desc: "Documents, maintenance, messages — everything in one place. Your home, managed properly.",
  },
];

export default function ProspaBenefits() {
  return (
    <section className="py-12 md:py-16 px-5 sm:px-8" style={{ backgroundColor: "#1F2F3A" }}>
      <div className="max-w-5xl mx-auto">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-center mb-4" style={{ color: "rgba(250,248,245,0.5)" }}>
            Didn&apos;t find the right fit?
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-center mb-4 leading-tight"
            style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
          >
            More listings coming soon.
          </h2>
          <p className="text-base text-center max-w-2xl mx-auto mb-8 md:mb-14 leading-relaxed" style={{ color: "rgba(250,248,245,0.7)" }}>
            New properties are added regularly. In the meantime, here&apos;s what every Prospera tenant gets — no matter which property you choose.
          </p>
        </div>

        {/* Mobile: compact bullet list */}
        <ul className="md:hidden space-y-4 mb-8">
          {BENEFITS.map((b) => (
            <li key={b.title} className="flex items-start gap-3">
              <span className="text-xl shrink-0 mt-0.5">{b.icon}</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#FAF8F5" }}>{b.title}</p>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(250,248,245,0.6)" }}>{b.desc}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Desktop: card grid */}
        <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BENEFITS.map((b) => (
            <div key={b.title}>
              <div
                className="rounded-xl p-6 h-full"
                style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <span className="text-2xl mb-3 block">{b.icon}</span>
                <h3 className="text-sm font-semibold mb-2" style={{ color: "#FAF8F5" }}>{b.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(250,248,245,0.6)" }}>{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="text-center mt-8 md:mt-12 space-y-4">
            <Link
              href="/contact"
              className="inline-block px-8 py-4 text-xs font-semibold uppercase tracking-widest rounded transition-opacity hover:opacity-80"
              style={{ backgroundColor: "#8B2030", color: "#FAF8F5" }}
            >
              Get Notified of New Listings
            </Link>
            <p className="text-xs" style={{ color: "rgba(250,248,245,0.4)" }}>
              Or call Ebin directly: <a href="tel:+15196971227" className="underline" style={{ color: "rgba(250,248,245,0.6)" }}>(519) 697-1227</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
