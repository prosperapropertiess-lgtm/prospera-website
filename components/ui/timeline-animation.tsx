"use client";

import React, { ElementType, RefObject, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TimelineContentProps {
  as?: ElementType;
  animationNum?: number;
  timelineRef?: RefObject<HTMLElement | null>;
  customVariants?: unknown;
  className?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}

/**
 * SEO-safe TimelineContent:
 * - Content always visible (opacity: 1) — never hidden from crawlers
 * - After hydration, below-fold elements get a subtle slide + fade animation
 * - Above-fold elements are never hidden
 * - Respects prefers-reduced-motion
 */
export function TimelineContent({
  as: _Tag = "div",
  animationNum = 0,
  timelineRef: _timelineRef,
  customVariants: _customVariants,
  className,
  children,
  style,
  onClick,
  ...rest
}: TimelineContentProps & { style?: React.CSSProperties; onClick?: React.MouseEventHandler }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    // Check if already above fold
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) return;

    const delay = animationNum * 150;
    el.style.opacity = "0";
    el.style.transform = "translateY(16px)";
    el.style.filter = "blur(4px)";
    el.style.transition = `opacity 500ms ease-out ${delay}ms, transform 500ms ease-out ${delay}ms, filter 500ms ease-out ${delay}ms`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "none";
          el.style.filter = "none";
          observer.disconnect();
        }
      },
      { rootMargin: "0px", threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animationNum]);

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
