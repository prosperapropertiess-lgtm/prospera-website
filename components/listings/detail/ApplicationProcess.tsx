"use client";
import { useState } from "react";

const STEPS = [
  {
    icon: "event_available",
    title: "Book a Viewing",
    desc: "Answer a few short questions and pick when you're free. We'll contact you to set up a time to see the home.",
  },
  {
    icon: "assignment",
    title: "Submit Your Application",
    desc: "If you like the home, fill out our rental application online and upload your documents.",
  },
  {
    icon: "fact_check",
    title: "Review",
    desc: "We check your ID and proof of income, and we may contact the references you list. A person reviews every application.",
  },
  {
    icon: "draw",
    title: "Lease Signing",
    desc: "We go through the lease with you before you sign it.",
  },
  {
    icon: "key",
    title: "Move In",
    desc: "Keys in hand. Welcome home.",
    final: true,
  },
];

const REQUIREMENTS = [
  { icon: "badge", text: "Identity verification: government-issued photo ID" },
  { icon: "payments", text: "Proof of income: pay stubs, an employment letter, or a benefits or pension statement" },
  { icon: "contact_phone", text: "References: a previous landlord, if you have one" },
];

export default function ApplicationProcess() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section className="py-12 md:py-16 px-5 sm:px-8" style={{ backgroundColor: "#1F2F3A" }}>
      <div className="max-w-3xl mx-auto">
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

        {/* Visual timeline */}
        <div className="mb-14">
          {STEPS.map((step, i) => {
            const isLast = i === STEPS.length - 1;
            const isHovered = hovered === i;
            const accent = step.final ? "#8B2030" : "#FAF8F5";
            return (
              <div key={step.title} className="flex gap-5">
                {/* Icon column + connecting line */}
                <div className="flex flex-col items-center shrink-0">
                  <div
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{
                      backgroundColor: step.final ? "rgba(139,32,48,0.22)" : isHovered ? "rgba(250,248,245,0.16)" : "rgba(250,248,245,0.08)",
                      border: `1.5px solid ${step.final ? "rgba(139,32,48,0.5)" : "rgba(250,248,245,0.18)"}`,
                      transform: isHovered ? "scale(1.08)" : "scale(1)",
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 24, color: accent }}>
                      {step.icon}
                    </span>
                  </div>
                  {!isLast && (
                    <div
                      className="w-px flex-1"
                      style={{ minHeight: 40, background: "linear-gradient(to bottom, rgba(250,248,245,0.25), rgba(250,248,245,0.08))" }}
                    />
                  )}
                </div>

                {/* Text */}
                <div className={isLast ? "pb-0" : "pb-9"} style={{ paddingTop: 10 }}>
                  <p
                    className="text-[11px] font-semibold uppercase tracking-widest mb-1"
                    style={{ color: step.final ? "#D4899A" : "rgba(250,248,245,0.4)", fontFamily: "var(--font-dm-sans)" }}
                  >
                    Step {i + 1}
                  </p>
                  <h3
                    className="text-lg font-semibold mb-1.5"
                    style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed max-w-md"
                    style={{ color: "rgba(250,248,245,0.60)", fontFamily: "var(--font-dm-sans)" }}
                  >
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* What we require */}
        <div className="rounded-2xl p-7 sm:p-8" style={{ backgroundColor: "#FFFFFF" }}>
          <h3
            className="text-xs font-semibold uppercase tracking-widest mb-6"
            style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
          >
            What We Require
          </h3>
          <ul className="space-y-4">
            {REQUIREMENTS.map((req) => (
              <li key={req.text} className="flex items-center gap-3.5">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "rgba(31,47,58,0.06)" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#1F2F3A" }}>
                    {req.icon}
                  </span>
                </div>
                <span
                  className="text-sm leading-relaxed"
                  style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}
                >
                  {req.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
