"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

// Brand-palette balloons (navy, burgundy, warm neutrals) spread across the full width.
const COLORS = ["#1F2F3A", "#8B2030", "#D8D2C8", "#3C5566", "#B8505F", "#F0EDE8", "#5A7080"];
const COUNT = 28;

interface B { id: number; left: number; size: number; color: string; delay: number; duration: number; sway: number; rotate: number; }

export default function BalloonBurst({ onDone }: { onDone?: () => void }) {
  const [alive, setAlive] = useState(true);

  const balloons = useMemo<B[]>(() => {
    // One slot per balloon across the width, jittered inside the slot, so they never clump.
    const slots = Array.from({ length: COUNT }, (_, i) => i).sort(() => Math.random() - 0.5);
    return slots.map((slot, i) => ({
      id: i,
      left: ((slot + Math.random()) / COUNT) * 100,
      size: 38 + Math.random() * 52,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 2.2,
      duration: 4.8 + Math.random() * 3.2,
      sway: (Math.random() > 0.5 ? 1 : -1) * (18 + Math.random() * 42),
      rotate: (Math.random() - 0.5) * 24,
    }));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { setAlive(false); onDone?.(); }, 9500);
    return () => clearTimeout(t);
  }, [onDone]);

  if (!alive) return null;

  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 60 }}>
      {balloons.map((b) => (
        <motion.div
          key={b.id}
          initial={{ y: "105vh", x: 0, rotate: 0, opacity: 1 }}
          animate={{ y: "-45vh", x: [0, b.sway, -b.sway * 0.6, b.sway * 0.4, 0], rotate: [0, b.rotate, -b.rotate, b.rotate * 0.5, 0] }}
          transition={{ duration: b.duration, delay: b.delay, ease: "easeOut", x: { duration: b.duration, delay: b.delay, ease: "easeInOut" }, rotate: { duration: b.duration, delay: b.delay, ease: "easeInOut" } }}
          style={{ position: "absolute", left: `${b.left}%`, top: 0, width: b.size, marginLeft: -b.size / 2 }}
        >
          <div style={{
            width: b.size, height: b.size * 1.2, borderRadius: "50% 50% 48% 48% / 55% 55% 45% 45%",
            background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.55), rgba(255,255,255,0) 38%), ${b.color}`,
            boxShadow: "inset -6px -8px 14px rgba(0,0,0,0.14)",
            border: b.color === "#F0EDE8" || b.color === "#D8D2C8" ? "1px solid rgba(31,47,58,0.15)" : "none",
          }} />
          <div style={{ width: 0, height: 0, margin: "-2px auto 0", borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderBottom: `7px solid ${b.color}` }} />
          <div style={{ width: 1, height: b.size * 0.9, margin: "0 auto", backgroundColor: "rgba(31,47,58,0.35)" }} />
        </motion.div>
      ))}
    </div>
  );
}
