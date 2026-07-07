"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function StickyBottomCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(scrolled > window.innerHeight * 0.8 && scrolled < total * 0.88);
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
          className="fixed bottom-0 left-0 right-0 z-[80] md:hidden px-5 pb-6 pt-4"
          style={{
            background: "linear-gradient(to top, #F7F5F2 65%, transparent)",
          }}
        >
          <Link
            href="/freedom-score"
            className="btn-primary block w-full py-4 text-xs font-semibold uppercase tracking-widest text-center rounded"
            style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
          >
            Take the Freedom Test
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
