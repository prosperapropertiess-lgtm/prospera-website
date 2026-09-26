"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FONT = "var(--font-dm-sans)";
const NAVY = "#1F2F3A";
const CRIMSON = "#8B2030";

/**
 * Page-scoped sticky CTA — same slide up/down mechanism as the site-wide
 * StickyBottomCTA, but triggers right after the hero (not at 80-88% scroll)
 * and stays up through nearly the whole page, per the brief. Opens the
 * qualifying form rather than navigating anywhere.
 */
export default function StickyMobileCTA({ onOpen }: { onOpen: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(scrolled > window.innerHeight * 0.6 && scrolled < total * 0.95);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
          className="fixed bottom-0 left-0 right-0 z-[90] sm:hidden px-4 pt-4"
          style={{ background: `linear-gradient(to top, ${NAVY} 60%, transparent)`, paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)" }}
        >
          <button
            onClick={onOpen}
            className="block w-full text-center rounded"
            style={{ backgroundColor: CRIMSON, color: "#FAF8F5", fontFamily: FONT, fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "16px", border: "none", cursor: "pointer" }}
          >
            Book My Owner Strategy Call
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
