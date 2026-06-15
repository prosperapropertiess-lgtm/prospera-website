"use client";

import { useEffect } from "react";
import Link from "next/link";

const FONT_SANS = "var(--font-dm-sans)";
const FONT_SERIF = "var(--font-cormorant)";
const NAVY = "#1F2F3A";
const CRIMSON = "#8B2030";

export default function PropertyManagementThankYou() {
  useEffect(() => {
    // Google Ads conversion — swap event label before going live
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "conversion", {
        send_to: "AW-18098735149/pm_lp_calendly_book",
      });
    }
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "Schedule");
    }
  }, []);

  return (
    <div
      style={{ backgroundColor: "#F7F5F2", fontFamily: FONT_SANS }}
      className="min-h-screen flex flex-col"
    >

      {/* Header */}
      <header style={{ backgroundColor: NAVY, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-light text-2xl" style={{ color: "#FAF8F5", fontFamily: FONT_SERIF }}>
            Prospera
          </span>
          <a href="tel:+15196971227" className="text-sm" style={{ color: "rgba(250,248,245,0.7)", fontFamily: FONT_SANS }}>
            (519) 697-1227
          </a>
        </div>
      </header>

      <main className="flex-1 px-6 py-20">
        <div className="max-w-xl mx-auto">

          {/* Confirmation icon + headline */}
          <div className="text-center mb-14">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: "rgba(139,32,48,0.08)", border: "2px solid #8B2030" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={CRIMSON} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h1
              className="text-4xl sm:text-5xl font-light mb-4 leading-tight"
              style={{ color: NAVY, fontFamily: FONT_SERIF }}
            >
              You&apos;re booked.
            </h1>

            <p className="text-base leading-relaxed" style={{ color: "#555", fontFamily: FONT_SANS }}>
              Check your email for the calendar invite.<br />
              Ebin will call you at the time you selected.
            </p>
          </div>

          {/* Divider */}
          <div className="w-10 h-px mx-auto mb-14" style={{ backgroundColor: "#D8D2C8" }} />

          {/* What to expect */}
          <div
            className="rounded-2xl border mb-8"
            style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E4DF", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
          >
            <div className="p-8">
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: CRIMSON, fontFamily: FONT_SANS }}>
                What Happens Next
              </p>
              <ul className="space-y-5">
                {[
                  {
                    step: "1",
                    title: "You get a calendar invite",
                    desc: "Check your inbox. It includes the call details and a reschedule link if you need to move things.",
                  },
                  {
                    step: "2",
                    title: "Ebin reviews your property before the call",
                    desc: "If you included your address or property details, he'll look at the market before picking up the phone.",
                  },
                  {
                    step: "3",
                    title: "A 20-minute honest conversation",
                    desc: "Not a pitch. What's the property worth. What a managed rental looks like vs. what you're doing now. Whether it makes sense to work together.",
                  },
                  {
                    step: "4",
                    title: "If it's a fit — 60 days free starts immediately",
                    desc: "No paperwork marathon. We move fast if the property and timing work.",
                  },
                ].map(({ step, title, desc }) => (
                  <li key={step} className="flex gap-5">
                    <span
                      className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                      style={{ backgroundColor: "rgba(139,32,48,0.08)", color: CRIMSON, fontFamily: FONT_SANS }}
                    >
                      {step}
                    </span>
                    <div>
                      <p className="text-sm font-semibold mb-1" style={{ color: NAVY, fontFamily: FONT_SANS }}>
                        {title}
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: "#555", fontFamily: FONT_SANS }}>
                        {desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Reassurance note */}
          <div
            className="rounded-xl px-6 py-5 mb-8"
            style={{ backgroundColor: NAVY }}
          >
            <p className="text-sm leading-relaxed" style={{ color: "rgba(250,248,245,0.7)", fontFamily: FONT_SANS }}>
              <span style={{ color: "#FAF8F5", fontWeight: 600 }}>No obligation.</span>{" "}
              If after the call you decide it's not the right time, no problem. You'll still walk away with a clear picture of what your rental should be making and how it compares to the market.
            </p>
            <p className="text-xs mt-3" style={{ color: "rgba(250,248,245,0.35)", fontFamily: FONT_SANS }}>
              — Ebin Jaison · Prospera Properties
            </p>
          </div>

          {/* Contact fallback */}
          <p className="text-sm text-center" style={{ color: "#888", fontFamily: FONT_SANS }}>
            Need to reach us sooner?{" "}
            <a href="tel:+15196971227" style={{ color: CRIMSON, fontWeight: 500 }}>
              (519) 697-1227
            </a>
            {" "}or{" "}
            <a href="mailto:prosperapropertiess@gmail.com" style={{ color: CRIMSON, fontWeight: 500 }}>
              send an email
            </a>
          </p>

        </div>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: "#141F29", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto px-6 py-6 text-center">
          <p className="text-xs" style={{ color: "rgba(250,248,245,0.3)", fontFamily: FONT_SANS }}>
            © {new Date().getFullYear()} Prospera Properties · London, Ontario ·{" "}
            <Link href="/privacy" style={{ color: "rgba(250,248,245,0.3)" }}>
              Privacy
            </Link>
          </p>
        </div>
      </footer>

    </div>
  );
}
