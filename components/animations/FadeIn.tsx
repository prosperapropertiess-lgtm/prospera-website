"use client";

import { motion, useReducedMotion } from "framer-motion";

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
  duration = 0.5,
  className,
  direction = "up",
}: FadeInProps) {
  const reduceMotion = useReducedMotion();

  const offset = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
    none: {},
  }[direction];

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration,
        delay,
        ease: [0.23, 1, 0.32, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
