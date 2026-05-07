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

    const timer = setTimeout(show, delayMs);

    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      if (scrolled / total >= 0.5) show();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

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
            className="fixed z-[100] inset-x-4 top-1/2 -translate-y-1/2 md:inset-auto md:left-1/2 md:-translate-x-1/2 md:w-[460px] shadow-2xl rounded-xl overflow-hidden max-h-[92vh] flex flex-col"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #D8D2C8" }}
          >
            {/* Top accent bar */}
            <div className="h-1 w-full shrink-0" style={{ backgroundColor: "#8B2030" }} />

            <div className="p-6 overflow-y-auto">
              {/* Close */}
              <button
                onClick={dismiss}
                className="absolute top-4 right-4 text-[#999999] hover:text-[#222222] transition-colors text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>

              {status === "success" ? (
                <div className="text-center py-4">
                  <p className="text-3xl mb-3" style={{ fontFamily: "var(--font-cormorant)", color: "#1F2F3A" }}>
                    You&apos;re in.
                  </p>
                  <p className="text-sm" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
                    {isLandlord
                      ? "We'll be in touch with tips and market updates."
                      : "We'll notify you when new listings match your search."}
                  </p>
                </div>
              ) : (
                <>
                  {isLandlord ? (
                    <>
                      {/* Offer label */}
                      <p
                        className="text-xs uppercase tracking-widest mb-3"
                        style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}
                      >
                        Free — Ontario Landlords
                      </p>

                      {/* Headline */}
                      <h3
                        className="text-2xl font-light mb-2 leading-snug"
                        style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
                      >
                        Ontario&apos;s standard lease has gaps. This fills them.
                      </h3>

                      {/* What it covers */}
                      <p
                        className="text-xs uppercase tracking-widest mb-2 mt-4"
                        style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
                      >
                        The addendum covers
                      </p>
                      <ul className="mb-5 space-y-1.5">
                        {[
                          "Who pays which utilities — no more \"we never agreed to that\"",
                          "Subletting & Airbnb rules, done properly",
                          "Parking, storage, and maintenance obligations in writing",
                        ].map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <span style={{ color: "#8B2030", marginTop: 2, flexShrink: 0 }}>—</span>
                            <span className="text-sm leading-snug" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="First name"
                          className="px-4 py-3 text-sm outline-none border rounded"
                          style={{ backgroundColor: "#F7F5F2", borderColor: "#D8D2C8", color: "#222222", fontFamily: "var(--font-dm-sans)" }}
                        />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email address"
                          required
                          className="px-4 py-3 text-sm outline-none border rounded"
                          style={{ backgroundColor: "#F7F5F2", borderColor: "#D8D2C8", color: "#222222", fontFamily: "var(--font-dm-sans)" }}
                        />
                        {status === "error" && (
                          <p className="text-xs" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>
                            Something went wrong. Please try again.
                          </p>
                        )}
                        <button
                          type="submit"
                          disabled={status === "loading"}
                          className="py-3 text-xs uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-50 mt-1 rounded"
                          style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
                        >
                          {status === "loading" ? "..." : "Email Me the Addendum →"}
                        </button>
                      </form>

                      <p
                        className="text-xs text-center mt-4 cursor-pointer hover:opacity-70 transition-opacity"
                        style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
                        onClick={dismiss}
                      >
                        My lease is already airtight
                      </p>
                    </>
                  ) : (
                    <>
                      {/* Offer label */}
                      <p
                        className="text-xs uppercase tracking-widest mb-3"
                        style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}
                      >
                        New Listing Alerts
                      </p>

                      {/* Headline */}
                      <h3
                        className="text-2xl font-light mb-2 leading-snug"
                        style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
                      >
                        Be First to See New Rentals
                      </h3>

                      {/* Subtext */}
                      <p
                        className="text-sm mb-6 leading-relaxed"
                        style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}
                      >
                        New listings go fast. Get notified by email the moment one hits your city.
                      </p>

                      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="First name"
                          className="px-4 py-3 text-sm outline-none border rounded"
                          style={{ backgroundColor: "#F7F5F2", borderColor: "#D8D2C8", color: "#222222", fontFamily: "var(--font-dm-sans)" }}
                        />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email address"
                          required
                          className="px-4 py-3 text-sm outline-none border rounded"
                          style={{ backgroundColor: "#F7F5F2", borderColor: "#D8D2C8", color: "#222222", fontFamily: "var(--font-dm-sans)" }}
                        />
                        <select
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="px-4 py-3 text-sm outline-none border rounded"
                          style={{ backgroundColor: "#F7F5F2", borderColor: "#D8D2C8", color: city ? "#222222" : "#999999", fontFamily: "var(--font-dm-sans)" }}
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
                          className="py-3 text-xs uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-50 mt-1 rounded"
                          style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
                        >
                          {status === "loading" ? "..." : "Get Notified"}
                        </button>
                      </form>

                      <p
                        className="text-xs text-center mt-4 cursor-pointer hover:opacity-70 transition-opacity"
                        style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
                        onClick={dismiss}
                      >
                        No thanks
                      </p>
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
