import Link from "next/link";
import FadeIn from "@/components/animations/FadeIn";
import N4FormBuilder from "@/components/ui/N4FormBuilder";
import ResourcesGrid from "@/components/ui/ResourcesGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Ontario Landlord Forms & LTB Tools",
  description:
    "Fill out and download official Ontario LTB forms in under 2 minutes. N4, N5, N11, N12 — explained in plain English, pre-filled instantly. Free for Ontario landlords.",
};

const situations = [
  {
    emoji: "💸",
    situation: "My tenant hasn't paid rent",
    formName: "N4",
    plain:
      "The N4 starts the official clock. If your tenant pays in full before the termination date, the notice dies and you're good. If they don't, you can apply to the Board for an eviction hearing.",
    when: "Serve it the day AFTER rent was due — not on the due date itself.",
    builderId: "n4-builder",
    hasBuilder: true,
  },
  {
    emoji: "🔨",
    situation: "My tenant is damaging the unit or disturbing neighbours",
    formName: "N5",
    plain:
      "The N5 gives your tenant a chance to fix the problem. They have 7 days to stop the behaviour. If they do — the notice is void. If they don't — you can apply to the Board.",
    when: "Use this for damage, excessive noise, overcrowding, or harassment of other tenants.",
    hasBuilder: false,
  },
  {
    emoji: "🏠",
    situation: "I need the unit back for myself or a family member",
    formName: "N12",
    plain:
      "If you or an immediate family member genuinely needs to move into the unit, this is your form. You must give 60 days notice and compensate the tenant one month's rent.",
    when: "Only use this if you actually intend to move in — misuse can result in serious fines.",
    hasBuilder: false,
  },
  {
    emoji: "🤝",
    situation: "We both agreed to end the tenancy",
    formName: "N11",
    plain:
      "The cleanest way out for both sides. If you and your tenant have agreed in writing that the tenancy ends on a specific date, this form makes it official and binding.",
    when: "Both landlord and tenant must sign. Can't be used as pressure to get a tenant out.",
    hasBuilder: false,
  },
  {
    emoji: "📬",
    situation: "My tenant gave me notice they're moving out",
    formName: "N9",
    plain:
      "When your tenant tells you they're leaving, this form is their official written notice. Keep it on file — if they change their mind, this protects you.",
    when: "The tenant fills this out, not you. Keep a signed copy for your records.",
    hasBuilder: false,
  },
];

export default function ResourcesPage() {
  return (
    <div style={{ backgroundColor: "#FAF8F5" }} className="min-h-screen">

      {/* ── Hero ── */}
      <section className="pt-36 pb-20 px-6 text-center" style={{ backgroundColor: "#0D1B2A" }}>
        <FadeIn>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-5"
            style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
          >
            Free for Ontario Landlords
          </p>
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-light leading-tight mb-6 max-w-4xl mx-auto"
            style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
          >
            Stop digging through
            <br />
            <em style={{ color: "#C4B08A" }}>government websites.</em>
          </h1>
          <p
            className="text-base max-w-xl mx-auto leading-relaxed mb-10"
            style={{ color: "rgba(250,248,245,0.60)", fontFamily: "var(--font-dm-sans)" }}
          >
            Every Ontario LTB form you&apos;ll ever need — explained in plain English,
            pre-filled in under 2 minutes, ready to serve. Free. No account. No PDF editor.
          </p>

          {/* Feature tick points */}
          <div className="inline-flex flex-col items-start gap-3 text-left">
            {[
              "Uses the official Ontario LTB form — not a copy or template",
              "Termination date auto-calculated (14 days for monthly tenants)",
              "Amount owing auto-added from your entries — no math needed",
              "Filled PDF downloads in under 2 minutes",
              "Sign it, serve it, done — no paralegal required",
            ].map((point) => (
              <div key={point} className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 text-sm" style={{ color: "#C4B08A" }}>✓</span>
                <p
                  className="text-sm"
                  style={{ color: "rgba(250,248,245,0.75)", fontFamily: "var(--font-dm-sans)" }}
                >
                  {point}
                </p>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ── Before/After context strip ── */}
      <section className="py-14 px-6" style={{ backgroundColor: "#F5F0EB" }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-7 rounded-xl border" style={{ borderColor: "rgba(123,28,28,0.2)", backgroundColor: "#FFF8F8" }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}>
                  Before This Tool
                </p>
                {[
                  "Find the LTB website (not obvious)",
                  "Download the PDF form",
                  "Open a PDF editor you probably don't have",
                  "Manually figure out termination dates",
                  "Calculate what's owed yourself",
                  "Or call a paralegal for $150–200",
                ].map((s) => (
                  <div key={s} className="flex items-start gap-2.5 mb-2.5">
                    <span className="shrink-0 text-xs mt-1" style={{ color: "#7B1C1C" }}>✕</span>
                    <p className="text-sm" style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}>{s}</p>
                  </div>
                ))}
              </div>
              <div className="p-7 rounded-xl border" style={{ borderColor: "rgba(45,106,79,0.2)", backgroundColor: "#F5FBF5" }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "#2D6A4F", fontFamily: "var(--font-dm-sans)" }}>
                  Now
                </p>
                {[
                  "Pick your situation from the list below",
                  "Fill in the blanks (5 fields, takes 2 minutes)",
                  "Dates and totals calculate automatically",
                  "Enter your email",
                  "Download the completed, official LTB form",
                  "Sign it and serve it. Done.",
                ].map((s) => (
                  <div key={s} className="flex items-start gap-2.5 mb-2.5">
                    <span className="shrink-0 text-xs mt-1" style={{ color: "#2D6A4F" }}>✓</span>
                    <p className="text-sm" style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}>{s}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Which form do I need? ── */}
      <section className="py-20 px-6" style={{ backgroundColor: "#FAF8F5" }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <p
              className="text-xs font-semibold uppercase tracking-widest text-center mb-4"
              style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
            >
              Plain English Guide
            </p>
            <h2
              className="text-4xl sm:text-5xl font-light text-center mb-4 leading-tight"
              style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}
            >
              Which form do I actually need?
            </h2>
            <p
              className="text-sm text-center max-w-lg mx-auto mb-14 leading-relaxed"
              style={{ color: "#7A7A7A", fontFamily: "var(--font-dm-sans)" }}
            >
              Pick your situation. We&apos;ll tell you exactly which form, what it does, and when to use it.
            </p>
          </FadeIn>

          <div className="space-y-4">
            {situations.map((s, i) => (
              <FadeIn key={s.formName} delay={i * 0.07}>
                <div
                  className="rounded-xl border overflow-hidden"
                  style={{ borderColor: "#E8E4DF", backgroundColor: "#FFFDFB" }}
                >
                  <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-start gap-5">
                      {/* Left: situation */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">{s.emoji}</span>
                          <div>
                            <p
                              className="font-semibold text-base leading-tight"
                              style={{ color: "#0D1B2A", fontFamily: "var(--font-dm-sans)" }}
                            >
                              {s.situation}
                            </p>
                            <span
                              className="text-xs font-bold uppercase tracking-wider"
                              style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
                            >
                              → Form {s.formName}
                            </span>
                          </div>
                        </div>
                        <p
                          className="text-sm leading-relaxed mb-3"
                          style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}
                        >
                          {s.plain}
                        </p>
                        <div className="flex items-start gap-2">
                          <span className="text-xs shrink-0 mt-0.5" style={{ color: "#C4B08A" }}>⚠</span>
                          <p
                            className="text-xs leading-relaxed"
                            style={{ color: "#7A7A7A", fontFamily: "var(--font-dm-sans)" }}
                          >
                            {s.when}
                          </p>
                        </div>
                      </div>

                      {/* Right: CTA */}
                      <div className="shrink-0 flex flex-col gap-2 md:w-44">
                        {s.hasBuilder ? (
                          <a
                            href="#n4-builder"
                            className="block text-center py-3 px-5 text-xs font-semibold uppercase tracking-widest rounded-lg transition-opacity hover:opacity-80"
                            style={{
                              backgroundColor: "#7B1C1C",
                              color: "#FAF8F5",
                              fontFamily: "var(--font-dm-sans)",
                            }}
                          >
                            Fill {s.formName} Now →
                          </a>
                        ) : (
                          <div
                            className="text-center py-3 px-5 text-xs font-semibold uppercase tracking-widest rounded-lg border"
                            style={{
                              borderColor: "#E8E4DF",
                              color: "#BBBBBB",
                              fontFamily: "var(--font-dm-sans)",
                            }}
                          >
                            Builder Coming Soon
                          </div>
                        )}
                        <a
                          href={`/forms/${s.formName}.pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-center py-2.5 px-5 text-xs font-semibold uppercase tracking-widest rounded-lg border transition-colors hover:bg-[#F5F0EB]"
                          style={{
                            borderColor: "#E8E4DF",
                            color: "#5A5A5A",
                            fontFamily: "var(--font-dm-sans)",
                          }}
                        >
                          Blank {s.formName} PDF
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── N4 Form Builder ── */}
      <section id="n4-builder" className="py-20 px-6" style={{ backgroundColor: "#F5F0EB" }}>
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <p
              className="text-xs font-semibold uppercase tracking-widest text-center mb-3"
              style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
            >
              Live Tool
            </p>
            <h2
              className="text-4xl font-light text-center mb-10 leading-tight"
              style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}
            >
              N4 Form Builder
            </h2>
            <N4FormBuilder />
          </FadeIn>
        </div>
      </section>

      {/* ── Other downloads ── */}
      <section className="py-4 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <p
              className="text-xs font-semibold uppercase tracking-widest text-center mb-3 mt-12"
              style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
            >
              More Free Resources
            </p>
            <h2
              className="text-4xl font-light text-center mb-12 leading-tight"
              style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}
            >
              Templates, guides &amp; checklists.
            </h2>
          </FadeIn>
        </div>
      </section>
      <ResourcesGrid />

      {/* ── CTA ── */}
      <section className="py-20 px-6 text-center" style={{ backgroundColor: "#0D1B2A" }}>
        <FadeIn>
          <h2
            className="text-4xl font-light mb-4 leading-tight"
            style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
          >
            Rather not deal with any of this?
          </h2>
          <p
            className="text-sm mb-8 max-w-md mx-auto"
            style={{ color: "rgba(250,248,245,0.55)", fontFamily: "var(--font-dm-sans)" }}
          >
            That&apos;s what Prospera is for. We handle the forms, the notices, the follow-up, everything.
            Free consultation — no pressure.
          </p>
          <Link
            href="/contact"
            className="inline-block px-10 py-4 text-xs font-semibold uppercase tracking-widest rounded-lg transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#7B1C1C", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
          >
            Talk to Ebin →
          </Link>
        </FadeIn>
      </section>
    </div>
  );
}
