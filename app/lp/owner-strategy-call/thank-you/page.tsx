"use client";

import { useEffect } from "react";
import Link from "next/link";

const FONT = "var(--font-dm-sans)";
const SERIF = "var(--font-cormorant)";
const NAVY = "#1F2F3A";
const CRIMSON = "#8B2030";

/**
 * Requires Calendly's own "Redirect to a URL" setting (on the specific event
 * type used for this campaign) to be pointed here after a booking — that's
 * a manual step in Calendly's dashboard, not something this code controls.
 * Reusing the same Calendly link as the property-management LP means: if
 * that link's redirect is already set to /lp/property-management/thank-you,
 * bookings from THIS page will land there instead, and this page's
 * conversion pixel never fires. Worth confirming/creating a distinct event
 * type for this campaign before running paid traffic.
 */
type TrackingWindow = Window & {
  gtag?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
};

export default function OwnerStrategyCallThankYou() {
  useEffect(() => {
    const w = window as TrackingWindow;
    w.gtag?.("event", "conversion", { send_to: "AW-18098735149/pm_lp_calendly_book" });
    w.fbq?.("track", "Schedule");
  }, []);

  return (
    <div style={{ backgroundColor: "#F7F5F2", fontFamily: FONT }} className="min-h-screen flex flex-col">
      <header style={{ backgroundColor: NAVY, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-light text-2xl" style={{ color: "#FAF8F5", fontFamily: SERIF }}>Prospera</span>
          <a href="tel:+15196971227" className="text-sm" style={{ color: "rgba(250,248,245,0.7)" }}>(519) 697-1227</a>
        </div>
      </header>

      <main className="flex-1 px-6 py-20">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "rgba(139,32,48,0.08)", border: "2px solid #8B2030" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={CRIMSON} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl font-light mb-4 leading-tight" style={{ color: NAVY, fontFamily: SERIF }}>
            You&apos;re booked.
          </h1>
          <p className="text-base leading-relaxed mb-14" style={{ color: "#555" }}>
            Check your email for the calendar invite. Ebin will call you at the time you selected.
          </p>

          <div className="rounded-2xl border text-left mb-8" style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E4DF" }}>
            <div className="p-8">
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: CRIMSON }}>What Happens Next</p>
              <ul className="space-y-5">
                {[
                  ["1", "You get a calendar invite", "Check your inbox — it has the call details and a reschedule link if you need one."],
                  ["2", "Ebin looks at your portfolio before the call", "So the 15 minutes are useful, not a generic pitch."],
                  ["3", "A short, honest conversation", "What Prospera would take off your plate, and what it would cost."],
                  ["4", "You decide", "No pressure either way."],
                ].map(([n, title, desc]) => (
                  <li key={n} className="flex gap-5">
                    <span className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5" style={{ backgroundColor: "rgba(139,32,48,0.08)", color: CRIMSON }}>{n}</span>
                    <div>
                      <p className="text-sm font-semibold mb-1" style={{ color: NAVY }}>{title}</p>
                      <p className="text-sm leading-relaxed" style={{ color: "#555" }}>{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-sm" style={{ color: "#888" }}>
            Need to reach us sooner?{" "}
            <a href="tel:+15196971227" style={{ color: CRIMSON, fontWeight: 500 }}>(519) 697-1227</a>{" "}
            or{" "}
            <a href="mailto:prosperapropertiess@gmail.com" style={{ color: CRIMSON, fontWeight: 500 }}>send an email</a>
          </p>
        </div>
      </main>

      <footer style={{ backgroundColor: "#141F29", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto px-6 py-6 text-center">
          <p className="text-xs" style={{ color: "rgba(250,248,245,0.3)" }}>
            © {new Date().getFullYear()} Prospera Properties · London, Ontario ·{" "}
            <Link href="/privacy" style={{ color: "rgba(250,248,245,0.3)" }}>Privacy</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
