"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
}

export default function FadeIn({
  children,
  delay = 0,
  duration = 0.35,
  className,
  direction = "up",
}: FadeInProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const reduceMotion = useReducedMotion();

  const offset = {
    up:    { y: 20, x: 0 },
    down:  { y: -20, x: 0 },
    left:  { x: 20, y: 0 },
    right: { x: -20, y: 0 },
    none:  { x: 0, y: 0 },
  }[direction];

  // Respect prefers-reduced-motion: fade only, no movement
  const initial = reduceMotion
    ? { opacity: 0 }
    : { opacity: 0, ...offset };

  const animate = isInView
    ? { opacity: 1, x: 0, y: 0 }
    : {};

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{
        duration,
        delay,
        ease: [0.23, 1, 0.32, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
