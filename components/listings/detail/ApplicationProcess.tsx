"use client";

const STEPS = [
  {
    num: "01",
    title: "Book a Viewing",
    desc: "Schedule a time to see the unit in person. Viewings are typically within 48 hours of request.",
  },
  {
    num: "02",
    title: "Submit Your Application",
    desc: "Fill out our rental application online. Takes about 10 minutes.",
  },
  {
    num: "03",
    title: "Screening & Verification",
    desc: "We verify: employment or income, 6 months of bank statements, a soft credit check (no impact to your score), and a previous landlord reference.",
  },
  {
    num: "04",
    title: "Lease Signing",
    desc: "Review and sign your lease digitally. We walk you through everything.",
  },
  {
    num: "05",
    title: "Move In",
    desc: "Keys in hand. Welcome home.",
  },
];

const REQUIREMENTS = [
  "Identity verification — government-issued photo ID",
  "Income verification — pay stubs, employment letter, or bank statements",
  "References — previous landlord contact",
];

export default function ApplicationProcess() {
  return (
    <section className="py-12 md:py-16 px-5 sm:px-8" style={{ backgroundColor: "#1F2F3A" }}>
      <div className="max-w-5xl mx-auto">
        <p
          className="text-xs font-semibold uppercase tracking-widest text-center mb-4"
          style={{ color: "rgba(250,248,245,0.45)", fontFamily: "var(--font-dm-sans)" }}
        >
          How It Works
        </p>
        <h2
          className="text-4xl sm:text-5xl font-bold text-center mb-12 md:mb-16 leading-tight"
          style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
        >
          The Application Process
        </h2>

        {/* Steps — 2-col grid on desktop, last step full width */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          {STEPS.slice(0, 4).map((step) => (
            <div
              key={step.num}
              className="rounded-2xl p-7"
              style={{
                backgroundColor: "rgba(250,248,245,0.05)",
                border: "1px solid rgba(250,248,245,0.10)",
              }}
            >
              <p
                className="text-5xl font-light mb-4 leading-none"
                style={{ color: "rgba(250,248,245,0.12)", fontFamily: "var(--font-dm-sans)" }}
              >
                {step.num}
              </p>
              <h3
                className="text-base font-semibold mb-2"
                style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
              >
                {step.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "rgba(250,248,245,0.60)", fontFamily: "var(--font-dm-sans)" }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Step 5 — full width */}
        <div
          className="rounded-2xl p-7 mb-12"
          style={{
            backgroundColor: "rgba(139,32,48,0.15)",
            border: "1px solid rgba(139,32,48,0.30)",
          }}
        >
          <p
            className="text-5xl font-light mb-4 leading-none"
            style={{ color: "rgba(139,32,48,0.30)", fontFamily: "var(--font-dm-sans)" }}
          >
            {STEPS[4].num}
          </p>
          <h3
            className="text-base font-semibold mb-2"
            style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
          >
            {STEPS[4].title}
          </h3>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "rgba(250,248,245,0.60)", fontFamily: "var(--font-dm-sans)" }}
          >
            {STEPS[4].desc}
          </p>
        </div>

        {/* What we require */}
        <div
          className="rounded-2xl p-7 sm:p-8"
          style={{
            backgroundColor: "#FFFFFF",
          }}
        >
          <h3
            className="text-xs font-semibold uppercase tracking-widest mb-6"
            style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
          >
            What We Require
          </h3>
          <ul className="space-y-3">
            {REQUIREMENTS.map((req) => (
              <li key={req} className="flex items-start gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: "rgba(31,47,58,0.08)" }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5l2.5 2.5 5-5" stroke="#1F2F3A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span
                  className="text-sm leading-relaxed"
                  style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}
                >
                  {req}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
