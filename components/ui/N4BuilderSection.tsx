"use client";

import { useEffect, useState } from "react";
import N4FormBuilder from "@/components/ui/N4FormBuilder";
import FadeIn from "@/components/animations/FadeIn";

/**
 * The N4 builder used to render open on every visit, permanently taking up
 * a full section of the page for the ~80% of visitors who came for a
 * different form. Collapsed behind a button by default — opens on click,
 * or automatically if you land here via the "Fill N4 Now" link above
 * (href="#n4-builder"), since that's a plain anchor and can't carry state.
 */
export default function N4BuilderSection() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === "#n4-builder") setOpen(true);
    };
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, []);

  return (
    <section id="n4-builder" className="py-20 px-6" style={{ backgroundColor: "#FFFFFF", borderTop: "1px solid #D8D2C8" }}>
      <div className="max-w-3xl mx-auto">
        <FadeIn>
          <p
            className="text-xs font-semibold uppercase tracking-widest text-center mb-3"
            style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}
          >
            Live Tool
          </p>
          <h2
            className="text-4xl font-light text-center mb-4 leading-tight"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
          >
            N4 Form Builder
          </h2>

          {!open ? (
            <div className="text-center">
              <p
                className="text-sm max-w-md mx-auto mb-8 leading-relaxed"
                style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}
              >
                Fill in 5 fields, we calculate the termination date and amount owing, and hand you
                the completed official form. Takes about 2 minutes.
              </p>
              <button
                onClick={() => setOpen(true)}
                className="inline-block px-10 py-4 text-xs font-semibold uppercase tracking-widest rounded-lg transition-opacity hover:opacity-85"
                style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
              >
                Open the N4 Builder →
              </button>
            </div>
          ) : (
            <N4FormBuilder />
          )}
        </FadeIn>
      </div>
    </section>
  );
}
