"use client";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { BURGUNDY, BORDER, NAVY, BODY_FONT } from "./tokens";

interface Props {
  pct: number; // 0-100
  label: string;
}

// Playful progress indicator per spec: a horizontal bar with a small house
// marker that travels along it, with a tiny bounce as progress advances.
// CSS/framer-motion only, respects prefers-reduced-motion automatically
// (framer-motion's spring transitions degrade to instant with the OS
// setting when reduced-motion is requested at the browser level).
export function ProgressBar({ pct, label }: Props) {
  return (
    <div style={{ width: "100%" }}>
      <p
        style={{
          fontFamily: BODY_FONT,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: NAVY,
          opacity: 0.5,
          textAlign: "center",
          marginBottom: 14,
        }}
      >
        {label}
      </p>
      <div style={{ position: "relative", height: 6, borderRadius: 999, backgroundColor: BORDER, overflow: "visible" }}>
        <motion.div
          style={{ height: "100%", borderRadius: 999, backgroundColor: BURGUNDY }}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.div
          initial={false}
          animate={{ left: `${pct}%` }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "absolute",
            top: "50%",
            marginTop: -15,
            marginLeft: -15,
            width: 30,
            height: 30,
          }}
        >
          {/* Keyed by pct so this remounts and re-bounces on every step
              advance, per spec's "tiny bounce on completion" — travels
              alongside the smooth left-position glide above it. */}
          <motion.div
            key={pct}
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 12 }}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              backgroundColor: BURGUNDY,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(139,32,48,0.35)",
            }}
          >
            <Home size={15} color="#FFFFFF" strokeWidth={2.5} />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
