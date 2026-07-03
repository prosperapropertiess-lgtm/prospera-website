"use client";

import React, { ElementType, RefObject } from "react";
import { motion, useReducedMotion } from "framer-motion";
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

export function TimelineContent({
  as: _Tag = "div",
  animationNum = 0,
  timelineRef: _timelineRef,
  customVariants: _customVariants,
  className,
  children,
  style,
  onClick,
}: TimelineContentProps & { style?: React.CSSProperties; onClick?: React.MouseEventHandler }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div className={cn(className)} style={style} onClick={onClick}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={cn(className)}
      style={style}
      onClick={onClick}
      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        delay: animationNum * 0.15,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}
