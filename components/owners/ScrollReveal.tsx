"use client";

import { useRef, useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  delay?: number;
  distance?: number;
  style?: React.CSSProperties;
}

/**
 * SEO-safe ScrollReveal:
 * - Content is always visible in SSR HTML (opacity: 1)
 * - After hydration, below-fold elements get a subtle slide-in animation
 * - Above-fold elements are never hidden
 * - Respects prefers-reduced-motion
 */
export function ScrollReveal({ children, delay = 0, distance = 24, style }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion) return;

    // Check if element is already visible above the fold
    const rect = el.getBoundingClientRect();
    const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (alreadyVisible) return;

    // Below fold: apply initial hidden state post-hydration
    el.style.opacity = "0";
    el.style.transform = `translateY(${distance}px)`;
    el.style.transition = `opacity 550ms cubic-bezier(0.23,1,0.32,1) ${delay * 1000}ms, transform 550ms cubic-bezier(0.23,1,0.32,1) ${delay * 1000}ms`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "none";
          observer.disconnect();
        }
      },
      { rootMargin: "-60px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, distance, reduceMotion]);

  return (
    <div ref={ref} style={style}>
      {children}
    </div>
  );
}
