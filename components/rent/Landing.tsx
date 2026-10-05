"use client";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { NAVY, BURGUNDY, BG, WHITE, HEADING_FONT, BODY_FONT } from "./tokens";

export function Landing({ onBegin }: { onBegin: () => void }) {
  return (
    <div style={{ minHeight: "100dvh", backgroundColor: BG, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "28px 20px 0" }}>
        <img src="/logo.png" alt="Prospera Properties" style={{ height: 40, width: "auto" }} />
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 20px" }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: "100%", maxWidth: 480, textAlign: "center" }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              backgroundColor: "rgba(139,32,48,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <Home size={28} color={BURGUNDY} strokeWidth={2} />
          </div>

          <h1
            style={{
              fontFamily: HEADING_FONT,
              fontWeight: 700,
              fontSize: "clamp(32px, 6vw, 44px)",
              color: NAVY,
              lineHeight: 1.15,
              margin: "0 0 14px",
              letterSpacing: "-0.01em",
            }}
          >
            Tell us what home you&rsquo;re looking for.
          </h1>

          <p style={{ fontFamily: BODY_FONT, fontSize: 16, color: NAVY, opacity: 0.7, lineHeight: 1.6, margin: "0 0 14px" }}>
            Answer a few quick questions and we&rsquo;ll match you with rentals that actually fit.
          </p>

          <p style={{ fontFamily: BODY_FONT, fontSize: 14, color: NAVY, opacity: 0.5, lineHeight: 1.6, margin: "0 0 32px" }}>
            No endless Marketplace scrolling.
            <br />
            No repeating yourself to 20 landlords.
          </p>

          <button
            type="button"
            onClick={onBegin}
            style={{
              backgroundColor: BURGUNDY,
              color: WHITE,
              border: "none",
              borderRadius: 999,
              padding: "16px 36px",
              fontFamily: BODY_FONT,
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              minHeight: 52,
            }}
          >
            Find My Rental →
          </button>

          <p style={{ fontFamily: BODY_FONT, fontSize: 12, color: NAVY, opacity: 0.45, margin: "14px 0 4px" }}>Takes about 90 seconds</p>
          <p style={{ fontFamily: BODY_FONT, fontSize: 12, color: NAVY, opacity: 0.45, margin: 0 }}>Real rentals. Local team. Free for renters.</p>
        </motion.div>
      </div>
    </div>
  );
}
