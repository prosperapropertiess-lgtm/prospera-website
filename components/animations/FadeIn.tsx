"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRef, useState, useEffect } from "react";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
}

/**
 * SEO-safe FadeIn with smooth framer-motion feel:
 * - Server-rendered HTML always has opacity: 1 (visible to crawlers)
 * - After hydration, below-fold elements get framer-motion spring animation
 * - Above-fold elements stay visible, never animate
 * - Respects prefers-reduced-motion
 */
export default function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  className,
  direction = "up",
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [isInView, setIsInView] = useState(false);

  const offset = {
    up: { y: 24 },
    down: { y: -24 },
    left: { x: 24 },
    right: { x: -24 },
    none: {},
  }[direction];

  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion) return;

    // Check if element is above the fold on mount
    const rect = el.getBoundingClientRect();
    const aboveFold = rect.top < window.innerHeight && rect.bottom > 0;
    if (aboveFold) {
      // Already visible — skip animation
      setIsInView(true);
      return;
    }

    // Below the fold — enable animation and watch for scroll
    setShouldAnimate(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "-40px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduceMotion]);

  // No animation needed — render plain div (SSR-safe, always visible)
  if (!shouldAnimate || reduceMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  // Below-fold element — use framer-motion for smooth spring animation
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...offset }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...offset }}
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
