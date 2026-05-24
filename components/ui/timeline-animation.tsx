"use client";

import React, { ElementType, RefObject } from "react";
import { motion, Variants, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

interface TimelineContentProps {
  as?: ElementType;
  animationNum?: number;
  timelineRef?: RefObject<HTMLElement | null>;
  customVariants?: Variants;
  className?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}

export function TimelineContent({
  as: _Tag = "div",
  animationNum = 0,
  timelineRef: _timelineRef,
  customVariants,
  className,
  children,
  ...rest
}: TimelineContentProps) {
  const internalRef = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(internalRef, { once: true, amount: 0.2 });

  const defaultVariants: Variants = {
    hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.15,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  const variants = customVariants ?? defaultVariants;

  // Spread only safe motion props; ignore unknown rest keys at runtime
  const { style, onClick, ...safeRest } = rest as {
    style?: React.CSSProperties;
    onClick?: React.MouseEventHandler;
    [key: string]: unknown;
  };

  return (
    <motion.div
      ref={internalRef}
      className={cn(className)}
      custom={animationNum}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      style={style}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
