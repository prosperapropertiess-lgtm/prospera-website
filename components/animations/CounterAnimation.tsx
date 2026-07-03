"use client";

import { useState, useEffect, useRef } from "react";

interface CounterAnimationProps {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * SEO-safe CounterAnimation:
 * - Server-rendered HTML shows the REAL target number (visible to crawlers)
 * - After hydration, animates from 80% of target up to the target when in view
 * - NEVER resets to 0 — content is always visible and readable
 * - Respects prefers-reduced-motion (just shows the target, no animation)
 */
export default function CounterAnimation({
  target,
  duration = 2,
  prefix = "",
  suffix = "",
  className,
}: CounterAnimationProps) {
  const ref = useRef<HTMLSpanElement>(null);
  // Start at target so SSR HTML shows real number — never reset to 0
  const [count, setCount] = useState(target);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check for reduced motion preference
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    // Start from 80% of target (always readable) and animate to 100%
    const startValue = target === 0 ? 0 : Math.floor(target * 0.8);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          observer.disconnect();

          if (target === 0) {
            setCount(0);
            return;
          }

          setCount(startValue);

          const startTime = performance.now();
          let raf: number;
          const tick = (now: number) => {
            const elapsed = (now - startTime) / 1000;
            const t = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3); // cubic ease-out
            // Animate from startValue to target
            setCount(Math.round(startValue + eased * (target - startValue)));
            if (t < 1) raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
          return () => cancelAnimationFrame(raf);
        }
      },
      { rootMargin: "0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count}{suffix}
    </span>
  );
}
