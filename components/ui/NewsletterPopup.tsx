"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

interface Props {
  variant: "landlord" | "tenant";
}

const STORAGE_KEY = "prospera_popup_v2";
const SUPPRESSION_DAYS = 30;

function isSuppressed(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const { ts } = JSON.parse(raw) as { ts: number };
    return Date.now() - ts < SUPPRESSION_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function suppress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ts: Date.now() }));
  } catch {
    // ignore
  }
}

function trackEvent(event: string, page: string, metadata?: Record<string, unknown>) {
  fetch("/api/analytics/popup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, page, metadata }),
  }).catch(() => {
    // fire-and-forget — never block UX
  });
}

export default function NewsletterPopup({ variant }: Props) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // Guard against double-firing: track whether we've already shown this popup
  const shownRef = useRef(false);

  const show = useCallback(() => {
    if (shownRef.current) return;
    if (isSuppressed()) return;
    shownRef.current = true;
    setVisible(true);
    trackEvent("popup_shown", pathname, { variant });
  }, [pathname, variant]);

  useEffect(() => {
    // Already suppressed — skip setting up any listeners
    if (isSuppressed()) return;

    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    // --- 60% scroll depth trigger (desktop + mobile) ---
    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      if (scrolled / total >= 0.6) show();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // --- Exit-intent trigger (desktop only) ---
    let onMouseLeave: ((e: MouseEvent) => void) | null = null;
    if (!isMobile) {
      onMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 0) show();
      };
      document.addEventListener("mouseleave", onMouseLeave);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (onMouseLeave) {
        document.removeEventListener("mouseleave", onMouseLeave);
      }
    };
  }, [show]);

  function dismiss() {
    setVisible(false);
    suppress();
    trackEvent("popup_closed", pathname, { variant });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          type: variant,
          preferred_city: variant === "tenant" ? city : undefined,
          source: "popup",
        }),
      });
      if (res.ok) {
        setStatus("success");
        suppress();
        trackEvent("popup_converted", pathname, { variant, email });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const isLandlord = variant === "landlord";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="newsletter-popup"
          initial={{ opacity: 0, x: 40, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 40, y: 20 }}
          transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
          className="fixed bottom-5 right-5 z-[100] w-[calc(100vw-40px)] max-w-[360px] shadow-2xl rounded-xl overflow-hidden flex flex-col"
          style={{ backgroundColor: "#FFFFFF", border: "1px solid #D8D2C8" }}
          role="dialog"
          aria-modal="true"
          aria-label={isLandlord ? "Free lease addendum offer" : "New listing alerts"}
        >
          {/* Top accent bar */}
          <div className="h-1 w-full shrink-0" style={{ backgroundColor: "#8B2030" }} />

          <div className="p-5 overflow-y-auto max-h-[90vh]">
            {/* Close button */}
            <button
              onPointerDown={dismiss}
              className="absolute top-2 right-2 text-[#666666] hover:text-[#222222] transition-colors leading-none p-3"
              aria-label="Close popup"
              style={{ touchAction: "manipulation", fontSize: "1.25rem" }}
            >
              ×
            </button>

            {status === "success" ? (
              <div className="text-center py-4 pr-4">
                <p className="text-2xl mb-2" style={{ fontFamily: "var(--font-cormorant)", color: "#1F2F3A" }}>
                  You&apos;re in.
                </p>
                <p className="text-sm" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                  {isLandlord
                    ? "We'll be in touch with tips and market updates."
                    : "We'll notify you when new listings match your search."}
                </p>
              </div>
            ) : (
              <div className="pr-4">
                {isLandlord ? (
                  <>
                    <p
                      className="text-xs uppercase tracking-widest mb-2"
                      style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}
                    >
                      90 Seconds · Free · No Email Required
                    </p>

                    <h3
                      className="text-xl font-bold mb-3 leading-snug"
                      style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
                    >
                      Are you actually free from your rentals?
                    </h3>

                    <ul className="mb-5 space-y-2">
                      {[
                        "Find out your Landlord Freedom Score",
                        "See exactly where self-managing is costing you",
                        "Get a personalised action plan in 90 seconds",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span style={{ color: "#8B2030", marginTop: 1, flexShrink: 0 }}>✓</span>
                          <span className="text-sm leading-snug" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <a
                      href="/freedom-score"
                      onClick={() => { trackEvent("freedom_test_click", pathname, { source: "popup" }); suppress(); }}
                      className="block w-full py-3 text-xs font-semibold uppercase tracking-widest text-center rounded transition-opacity hover:opacity-80"
                      style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
                    >
                      Take the Landlord Freedom Test →
                    </a>

                    <p
                      className="text-xs text-center mt-3 cursor-pointer hover:opacity-70 transition-opacity"
                      style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}
                      onClick={dismiss}
                    >
                      I&apos;m already free from my rentals
                    </p>
                  </>
                ) : (
                  <>
                    <p
                      className="text-xs uppercase tracking-widest mb-2"
                      style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}
                    >
                      New Listing Alerts
                    </p>

                    <h3
                      className="text-xl font-light mb-1 leading-snug"
                      style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
                    >
                      Be First to See New Rentals
                    </h3>

                    <p
                      className="text-sm mb-4 leading-relaxed"
                      style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}
                    >
                      New listings go fast. Get notified the moment one hits your city.
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="First name"
                        className="px-3 py-2.5 text-sm outline-none border rounded"
                        style={{ backgroundColor: "#F7F5F2", borderColor: "#D8D2C8", color: "#222222", fontFamily: "var(--font-dm-sans)" }}
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        required
                        className="px-3 py-2.5 text-sm outline-none border rounded"
                        style={{ backgroundColor: "#F7F5F2", borderColor: "#D8D2C8", color: "#222222", fontFamily: "var(--font-dm-sans)" }}
                      />
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="px-3 py-2.5 text-sm outline-none border rounded"
                        style={{ backgroundColor: "#F7F5F2", borderColor: "#D8D2C8", color: city ? "#222222" : "#666666", fontFamily: "var(--font-dm-sans)" }}
                      >
                        <option value="">Preferred city (optional)</option>
                        <option value="London">London</option>
                        <option value="St. Thomas">St. Thomas</option>
                        <option value="Strathroy">Strathroy</option>
                      </select>
                      {status === "error" && (
                        <p className="text-xs" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>
                          Something went wrong. Please try again.
                        </p>
                      )}
                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="py-2.5 text-xs uppercase tracking-widest disabled:opacity-50 rounded transition-opacity hover:opacity-80"
                        style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
                      >
                        {status === "loading" ? "..." : "Get Notified"}
                      </button>
                    </form>

                    <p
                      className="text-xs text-center mt-3 cursor-pointer hover:opacity-70 transition-opacity"
                      style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}
                      onClick={dismiss}
                    >
                      No thanks
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
