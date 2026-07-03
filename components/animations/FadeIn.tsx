"use client";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
}

/**
 * FadeIn — renders children immediately with no animation.
 * All content is always visible for SEO and performance.
 * Scroll-triggered animations were causing jank and invisible content.
 */
export default function FadeIn({
  children,
  className,
}: FadeInProps) {
  return <div className={className}>{children}</div>;
}
