"use client";

import { useState } from "react";

export default function WelcomeBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      className="sticky top-0 z-50 px-4 py-3"
      style={{ backgroundColor: "#1F2F3A", borderBottom: "1px solid rgba(250,248,245,0.1)" }}
    >
      <div className="max-w-4xl mx-auto flex items-start sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <span className="text-lg shrink-0 mt-0.5 sm:mt-0">✅</span>
          <div>
            <p
              className="text-sm font-medium leading-snug"
              style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
            >
              You&apos;re in. Full resource centre access is open.
            </p>
            <p
              className="text-xs mt-0.5 leading-relaxed"
              style={{ color: "rgba(250,248,245,0.8)", fontFamily: "var(--font-dm-sans)" }}
            >
              Ebin will reach out within 24 hours with your rental analysis and to book your strategy call.
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 text-xl leading-none hover:opacity-70 transition-opacity"
          style={{ color: "rgba(250,248,245,0.5)" }}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
