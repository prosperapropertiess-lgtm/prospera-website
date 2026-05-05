"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  variant: "landlord" | "tenant";
  delayMs?: number;
}

const STORAGE_KEY = "prospera_popup_dismissed";

export default function NewsletterPopup({ variant, delayMs = 30000 }: Props) {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const show = () => {
      if (!sessionStorage.getItem(STORAGE_KEY)) setVisible(true);
    };

    // Timer fallback — 15 seconds
    const timer = setTimeout(show, delayMs);

    // Scroll trigger — fires at 50% page depth
    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      if (scrolled / total >= 0.5) show();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Exit-intent on desktop
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) show();
    };
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [delayMs]);

  function dismiss() {
    setVisible(false);
    sessionStorage.setItem(STORAGE_KEY, "1");
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
        sessionStorage.setItem(STORAGE_KEY, "1");
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
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
            className="fixed inset-0 z-[90] bg-black/40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed z-[100] inset-x-4 top-1/2 -translate-y-1/2 md:inset-auto md:left-1/2 md:-translate-x-1/2 md:w-[460px] shadow-2xl"
            style={{ backgroundColor: "#0A1628" }}
          >
            {/* Top accent bar */}
            <div className="h-1 w-full" style={{ backgroundColor: "#C5A55A" }} />

            <div className="p-8">
              {/* Close */}
              <button
                onClick={dismiss}
                className="absolute top-4 right-4 text-[#8098B4] hover:text-[#FAF8F5] transition-colors text-lg leading-none"
                aria-label="Close"
              >
                ×
              </button>

              {status === "success" ? (
                <div className="text-center py-4">
                  <p className="text-3xl mb-3" style={{ fontFamily: "var(--font-cormorant)", color: "#FAF8F5" }}>
                    You&apos;re in.
                  </p>
                  <p className="text-sm" style={{ color: "#B0B8C4", fontFamily: "var(--font-dm-sans)" }}>
                    {isLandlord
                      ? "We'll be in touch with tips and market updates."
                      : "We'll notify you when new listings match your search."}
                  </p>
                </div>
              ) : (
                <>
                  {/* Offer label */}
                  <p
                    className="text-xs uppercase tracking-widest mb-3"
                    style={{ color: "#C5A55A", fontFamily: "var(--font-dm-sans)" }}
                  >
                    {isLandlord ? "Free for Ontario Landlords" : "New Listing Alerts"}
                  </p>

                  {/* Headline */}
                  <h3
                    className="text-2xl font-light mb-2 leading-snug"
                    style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
                  >
                    {isLandlord
                      ? "Get the Free Lease Addendum Template"
                      : "Be First to See New Rentals"}
                  </h3>

                  {/* Subtext */}
                  <p
                    className="text-sm mb-6 leading-relaxed"
                    style={{ color: "#B0B8C4", fontFamily: "var(--font-dm-sans)" }}
                  >
                    {isLandlord
                      ? "Our custom lease addendum protects you beyond the Ontario standard lease. Free download — plus occasional market updates."
                      : "New listings go fast. Get notified by email the moment one hits your city."}
                  </p>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your first name"
                      className="px-4 py-3 text-sm outline-none border"
                      style={{
                        backgroundColor: "#112035",
                        borderColor: "#1E3050",
                        color: "#FAF8F5",
                        fontFamily: "var(--font-dm-sans)",
                      }}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      required
                      className="px-4 py-3 text-sm outline-none border"
                      style={{
                        backgroundColor: "#112035",
                        borderColor: "#1E3050",
                        color: "#FAF8F5",
                        fontFamily: "var(--font-dm-sans)",
                      }}
                    />
                    {!isLandlord && (
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="px-4 py-3 text-sm outline-none border"
                        style={{
                          backgroundColor: "#112035",
                          borderColor: "#1E3050",
                          color: city ? "#1A1A1A" : "#9B9B9B",
                          fontFamily: "var(--font-dm-sans)",
                        }}
                      >
                        <option value="">Preferred city (optional)</option>
                        <option value="London">London</option>
                        <option value="St. Thomas">St. Thomas</option>
                        <option value="Strathroy">Strathroy</option>
                      </select>
                    )}

                    {status === "error" && (
                      <p className="text-xs" style={{ color: "#C5A55A", fontFamily: "var(--font-dm-sans)" }}>
                        Something went wrong. Please try again.
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="py-3 text-xs uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-50 mt-1"
                      style={{
                        backgroundColor: "#C5A55A",
                        color: "#FAF8F5",
                        fontFamily: "var(--font-dm-sans)",
                      }}
                    >
                      {status === "loading"
                        ? "..."
                        : isLandlord
                        ? "Send Me the Template"
                        : "Get Notified"}
                    </button>
                  </form>

                  <p
                    className="text-xs text-center mt-4 cursor-pointer hover:opacity-70 transition-opacity"
                    style={{ color: "#8098B4", fontFamily: "var(--font-dm-sans)" }}
                    onClick={dismiss}
                  >
                    No thanks
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
