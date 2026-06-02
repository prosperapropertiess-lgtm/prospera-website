"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function LeaseAddendumThankYou() {
  useEffect(() => {
    // Google Ads conversion
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "conversion", {
        send_to: "AW-18098735149/lease_addendum_download",
      });
    }
    // Facebook Pixel — uncomment once pixel is installed
    // if (typeof window !== "undefined" && (window as any).fbq) {
    //   (window as any).fbq("track", "Lead");
    // }
  }, []);

  return (
    <div
      style={{ backgroundColor: "#F7F5F2", fontFamily: "var(--font-dm-sans)" }}
      className="min-h-screen flex flex-col"
    >
      {/* Header */}
      <header style={{ backgroundColor: "#1F2F3A", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-light text-2xl" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Prospera
          </Link>
          <a href="tel:+15196971227" className="text-sm" style={{ color: "rgba(250,248,245,0.7)", fontFamily: "var(--font-dm-sans)" }}>
            (519) 697-1227
          </a>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">

          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-8"
            style={{ backgroundColor: "rgba(139,32,48,0.1)", border: "2px solid #8B2030" }}
          >
            <span className="text-2xl" style={{ color: "#8B2030" }}>✓</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl font-light mb-4 leading-tight"
            style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
          >
            Your lease addendum is on its way.
          </h1>

          <p className="text-base mb-3 leading-relaxed" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
            Check your inbox — it should arrive within 5 minutes. Check your spam folder if you don't see it.
          </p>
          <p className="text-sm mb-12" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
            Sent to you by Ebin at Prospera Properties.
          </p>

          {/* Divider */}
          <div className="w-12 h-px mx-auto mb-12" style={{ backgroundColor: "#D8D2C8" }} />

          {/* Upsell */}
          <div
            className="rounded-2xl p-8 md:p-10 text-left border"
            style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E4DF", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>
              While you're here
            </p>
            <h2
              className="text-2xl md:text-3xl font-light mb-4 leading-snug"
              style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
            >
              If you'd rather hand off the entire tenant process — that's what Prospera does.
            </h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
              Screening, rent collection, maintenance, LTB situations. I offer a free 20-minute portfolio review — no pitch, just honest advice on protecting your rental income.
            </p>
            <ul className="space-y-2 mb-8">
              {[
                "Tenant screening, placement, and lease execution",
                "Rent collection and financial reporting",
                "Maintenance coordination",
                "LTB support when things go sideways",
              ].map(item => (
                <li key={item} className="flex items-center gap-3 text-sm" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                  <span style={{ color: "#8B2030" }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>

            <a
              href="https://calendly.com/prosperaproperties"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center py-4 text-sm font-semibold uppercase tracking-widest rounded-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
            >
              Book a Free Portfolio Review →
            </a>

            <p className="text-xs text-center mt-4" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
              No obligation. I answer every call personally. — Ebin, Prospera Properties
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: "#141F29", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto px-6 py-6 text-center">
          <p className="text-xs" style={{ color: "rgba(250,248,245,0.3)", fontFamily: "var(--font-dm-sans)" }}>
            © {new Date().getFullYear()} Prospera Properties · London, Ontario ·{" "}
            <Link href="/privacy" style={{ color: "rgba(250,248,245,0.3)" }}>Privacy</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
