
import Link from "next/link";

const BENEFITS = [
  {
    title: "24-Hour Response",
    desc: "Every maintenance request, every question — acknowledged within 24 hours. No voicemail black holes.",
  },
  {
    title: "Online Rent Payment",
    desc: "Pay rent from your phone. No cheques, no e-transfers, no chasing anyone.",
  },
  {
    title: "Direct Line to Ebin",
    desc: "You get a real person, not a ticket queue. Call or text (519) 697-1227 any time something comes up.",
  },
  {
    title: "Simple Lease Process",
    desc: "We walk you through the lease before you sign. No surprises, no fine print you weren't told about.",
  },
];

export default function ProspaBenefits() {
  return (
    <section className="py-12 md:py-16 px-5 sm:px-8" style={{ backgroundColor: "#1F2F3A" }}>
      <div className="max-w-5xl mx-auto">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-center mb-4" style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)" }}>
            Every Prospera Property
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-center mb-4 leading-tight"
            style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
          >
            What you get as a tenant.
          </h2>
          <p className="text-sm text-center max-w-xl mx-auto mb-8 md:mb-14 leading-relaxed" style={{ color: "rgba(250,248,245,0.65)", fontFamily: "var(--font-dm-sans)" }}>
            Every property we manage comes with the same standard. No guesswork about who to call or how things work.
          </p>
        </div>

        {/* Responsive grid — 1 col mobile, 2 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {BENEFITS.map((b, i) => (
            <div
              key={b.title}
              className="rounded-xl p-6"
              style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-2"
                style={{ color: "rgba(250,248,245,0.35)", fontFamily: "var(--font-dm-sans)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="text-sm font-semibold mb-1.5" style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>{b.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(250,248,245,0.6)", fontFamily: "var(--font-dm-sans)" }}>{b.desc}</p>
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
