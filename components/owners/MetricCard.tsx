"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface MetricCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  format?: "currency" | "number";
  highlight?: boolean;
  icon?: string; // Material Symbol name
  delay?: number;
  size?: "sm" | "md" | "lg";
  colorClass?: string;
}

function formatValue(value: number, format: "currency" | "number"): string {
  if (format === "currency") {
    return value.toLocaleString("en-CA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  return value.toLocaleString();
}

export function MetricCard({
  label,
  value,
  prefix = "",
  suffix = "",
  format = "number",
  highlight = false,
  icon,
  delay = 0,
  size = "md",
  colorClass,
}: MetricCardProps) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const duration = 900;
    const start = performance.now();
    const from = 0;
    const to = value;

    function tick(now: number) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(from + (to - from) * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    const timeout = setTimeout(() => {
      rafRef.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, delay]);

  const valueFontSize = size === "lg" ? "32px" : size === "md" ? "26px" : "20px";
  const labelFontSize = size === "lg" ? "13px" : "12px";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000, ease: [0.23, 1, 0.32, 1] }}
      style={{
        background: highlight
          ? "linear-gradient(135deg, rgba(139,32,48,0.25), rgba(139,32,48,0.12))"
          : "rgba(255,255,255,0.06)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: highlight
          ? "1px solid rgba(139,32,48,0.35)"
          : "1px solid rgba(255,255,255,0.1)",
        borderRadius: "16px",
        padding: size === "lg" ? "24px" : "20px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      {icon && (
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: "20px",
            color: highlight ? "rgba(220,100,120,0.9)" : "rgba(255,255,255,0.4)",
            marginBottom: "2px",
          }}
        >
          {icon}
        </span>
      )}
      <div
        style={{
          fontFamily: "var(--font-outfit)",
          fontSize: valueFontSize,
          fontWeight: 700,
          color: colorClass || (highlight ? "#f87171" : "white"),
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        {prefix}{formatValue(displayed, format)}{suffix}
      </div>
      <div
        style={{
          fontSize: labelFontSize,
          color: "rgba(255,255,255,0.45)",
          fontWeight: 500,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </motion.div>
  );
}
