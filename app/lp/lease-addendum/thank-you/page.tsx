"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function LeaseAddendumThankYou() {
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "conversion", {
        send_to: "AW-18098735149/lease_addendum_download",
      });
    }
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "Lead");
    }
  }, []);

  return (
    <div style={{ backgroundColor: "#F7F5F2", fontFamily: "var(--font-dm-sans)" }} className="min-h-screen flex flex-col">

      {/* Header — logo only, no links */}
      <header style={{ backgroundColor: "#1F2F3A", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-light text-2xl" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Prospera
          </span>
          <a href="tel:+15196971227" className="text-sm" style={{ color: "rgba(250,248,245,0.7)", fontFamily: "var(--font-dm-sans)" }}>
            (519) 697-1227
          </a>
        </div>
      </header>

      <main className="flex-1 px-6 py-16">
        <div className="max-w-xl mx-auto">

          {/* Confirmation */}
          <div className="text-center mb-14">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: "rgba(139,32,48,0.1)", border: "2px solid #8B2030" }}
            >
              <span className="text-xl" style={{ color: "#8B2030" }}>✓</span>
            </div>
            <h1
              className="text-4xl sm:text-5xl font-light mb-4 leading-tight"
              style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
            >
              Your lease addendum is on its way.
            </h1>
            <p className="text-base leading-relaxed" style={{ color: "#555555", fontFamily: "var(--font-dm-sans)" }}>
              Check your inbox, it should arrive within 5 minutes.<br />
              Check your spam folder if you don't see it.
            </p>
          </div>

          {/* Divider */}
          <div className="w-10 h-px mx-auto mb-14" style={{ backgroundColor: "#D8D2C8" }} />

          {/* Ebin — personal upsell */}
          <div
            className="rounded-2xl overflow-hidden border"
            style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E4DF", boxShadow: "0 4px 32px rgba(0,0,0,0.07)" }}
          >
            {/* Photo strip */}
            <div className="relative w-full h-56 sm:h-64" style={{ backgroundColor: "#1F2F3A" }}>
              <Image
                src="/ebin-founder.jpg"
                alt="Ebin Jaison — Prospera Properties"
                fill
                className="object-cover object-top"
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(31,47,58,0.7) 0%, transparent 60%)" }}
              />
              <div className="absolute bottom-4 left-6">
                <p className="text-sm font-semibold" style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>Ebin Jaison</p>
                <p className="text-xs" style={{ color: "rgba(250,248,245,0.8)", fontFamily: "var(--font-dm-sans)" }}>Prospera Properties · London, ON</p>
              </div>
            </div>

            {/* Copy */}
            <div className="p-8">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>
                While you're here
              </p>
              <h2
                className="text-2xl sm:text-3xl font-light mb-4 leading-snug"
                style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
              >
                If you'd rather hand off the entire tenant process, that's what I do.
              </h2>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "#555555", fontFamily: "var(--font-dm-sans)" }}>
                Screening, placement, rent collection, maintenance, LTB situations. I manage 4–15 unit portfolios across London, Strathroy, and St. Thomas, and I answer my phone.
              </p>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "#555555", fontFamily: "var(--font-dm-sans)" }}>
                I offer a free 20-minute portfolio review. No pitch. Just honest advice on protecting your rental income.
              </p>

              <ul className="space-y-2 mb-8">
                {[
                  "Tenant screening, placement, and lease execution",
                  "Rent collection and financial reporting",
                  "Maintenance coordination",
                  "LTB support when things go sideways",
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                    <span className="shrink-0 mt-0.5" style={{ color: "#8B2030" }}>✓</span>
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

              <p className="text-xs text-center mt-4" style={{ color: "#AAAAAA", fontFamily: "var(--font-dm-sans)" }}>
                No obligation. I answer every call personally. — Ebin
              </p>
            </div>
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
