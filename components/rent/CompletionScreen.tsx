"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { NAVY, BURGUNDY, BG, WHITE, BORDER, HEADING_FONT, BODY_FONT } from "./tokens";

export function CompletionScreen({ onUpdatePreferences }: { onUpdatePreferences: () => void }) {
  return (
    <div style={{ minHeight: "100dvh", backgroundColor: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 20px" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: "100%", maxWidth: 480, textAlign: "center" }}
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            backgroundColor: "rgba(139,32,48,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            fontSize: 34,
          }}
        >
          🏡
        </motion.div>

        <h1 style={{ fontFamily: HEADING_FONT, fontWeight: 700, fontSize: "clamp(28px, 5vw, 36px)", color: NAVY, margin: "0 0 14px" }}>
          You&rsquo;re on the list.
        </h1>
        <p style={{ fontFamily: BODY_FONT, fontSize: 16, color: NAVY, opacity: 0.7, lineHeight: 1.6, margin: "0 0 10px" }}>
          We&rsquo;ll use your preferences to send you rentals that actually fit instead of flooding you with everything.
        </p>
        <p style={{ fontFamily: BODY_FONT, fontSize: 14, color: NAVY, opacity: 0.5, lineHeight: 1.6, margin: "0 0 32px" }}>
          If your plans change, you can update your rental profile anytime.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Link
            href="/listings"
            style={{
              backgroundColor: BURGUNDY,
              color: WHITE,
              border: "none",
              borderRadius: 999,
              padding: "16px 32px",
              fontFamily: BODY_FONT,
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
              minHeight: 52,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            See Current Rentals
          </Link>
          <button
            type="button"
            onClick={onUpdatePreferences}
            style={{
              backgroundColor: "transparent",
              color: NAVY,
              border: `1.5px solid ${BORDER}`,
              borderRadius: 999,
              padding: "16px 32px",
              fontFamily: BODY_FONT,
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              minHeight: 52,
            }}
          >
            Update My Preferences
          </button>
        </div>
      </motion.div>
    </div>
  );
}
