"use client";

import { useReducedMotion } from "framer-motion";
import { useRef, useEffect } from "react";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
}

/**
 * SEO-safe FadeIn:
 * - Server-rendered HTML always has opacity: 1 (fully visible to crawlers)
 * - After JS hydration, elements below the fold animate up subtly when scrolled to
 * - Above-fold elements are never hidden or animated (already in view on mount)
 * - Respects prefers-reduced-motion
 */
export default function FadeIn({
  children,
  delay = 0,
  duration = 200,
  className,
  direction = "up",
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion) return;

    const offset = {
      up:    "translateY(8px)",
      down:  "translateY(-8px)",
      left:  "translateX(8px)",
      right: "translateX(-8px)",
      none:  "none",
    }[direction];

    // Check if element is already in view (above-fold) — don't animate those
    const rect = el.getBoundingClientRect();
    const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (alreadyVisible) return;

    // Element is below the fold — set initial hidden state now (post-hydration)
    el.style.opacity = "0";
    if (offset !== "none") el.style.transform = offset;
    el.style.transition = `opacity ${duration}ms cubic-bezier(0.23,1,0.32,1) ${delay * 1000}ms, transform ${duration}ms cubic-bezier(0.23,1,0.32,1) ${delay * 1000}ms`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "none";
          observer.disconnect();
        }
      },
      { rootMargin: "-40px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [direction, delay, duration, reduceMotion]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
