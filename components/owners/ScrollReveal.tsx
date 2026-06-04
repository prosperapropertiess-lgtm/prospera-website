"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  delay?: number;
  distance?: number;
  style?: React.CSSProperties;
}

export function ScrollReveal({ children, delay = 0, distance = 24, style }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.23, 1, 0.32, 1] }}
      style={style}
    >
      {children}
    </motion.div>
  );
}
