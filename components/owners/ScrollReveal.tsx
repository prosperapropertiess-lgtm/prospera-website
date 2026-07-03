"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  delay?: number;
  distance?: number;
  style?: React.CSSProperties;
}

export function ScrollReveal({ children, delay = 0, distance = 20, style }: Props) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div style={style}>{children}</div>;
  }

  return (
    <motion.div
      style={style}
      // opacity always 1 — content must never be hidden
      initial={{ opacity: 1, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.55,
        delay,
        ease: [0.23, 1, 0.32, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
