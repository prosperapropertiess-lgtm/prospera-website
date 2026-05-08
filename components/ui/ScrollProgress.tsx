"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      className="fixed top-20 left-0 right-0 z-[200] origin-left pointer-events-none"
      style={{ scaleX, backgroundColor: "#8B2030", height: "2px" }}
    />
  );
}
