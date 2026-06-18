"use client";

import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface MetricCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  format?: "currency" | "number";
  highlight?: boolean;
  icon?: string;
  delay?: number;
  size?: "sm" | "md" | "lg";
  colorClass?: string;
  delta?: number; // % change vs previous period — positive = up, negative = down
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
  delta,
}: MetricCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const displayRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isInView) return;

    const duration = 900;
    const start = performance.now();
    const to = value;

    function tick(now: number) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(to * eased);
      if (displayRef.current) {
        displayRef.current.textContent = prefix + formatValue(current, format) + suffix;
      }
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
  }, [isInView, value, delay, prefix, suffix, format]);

  const valueFontSize = size === "lg" ? "32px" : size === "md" ? "26px" : "20px";
  const labelFontSize = size === "lg" ? "13px" : "12px";

  const deltaColor = delta == null ? null : delta > 0 ? "#16a34a" : "#dc2626";
  const deltaIcon = delta == null ? null : delta > 0 ? "↑" : "↓";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: delay / 1000, ease: [0.23, 1, 0.32, 1] }}
      style={{
        background: highlight ? "rgba(139,32,48,0.04)" : "#FFFFFF",
        border: highlight ? "1px solid rgba(139,32,48,0.15)" : "1px solid #E8E4DF",
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
            color: "#9AA5B1",
            marginBottom: "2px",
          }}
        >
          {icon}
        </span>
      )}
      <div
        ref={displayRef}
        style={{
          fontFamily: "var(--font-outfit)",
          fontSize: valueFontSize,
          fontWeight: 700,
          color: colorClass || (highlight ? "#8B2030" : "#1F2F3A"),
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        {prefix}0{suffix}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
        <div
          style={{
            fontSize: labelFontSize,
            color: "#9AA5B1",
            fontWeight: 500,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
        {delta != null && deltaColor && (
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: deltaColor,
              whiteSpace: "nowrap",
              padding: "2px 6px",
              borderRadius: "4px",
              background: delta > 0 ? "#f0fdf4" : "#fef2f2",
            }}
          >
            {deltaIcon} {Math.abs(Math.round(delta))}%
          </span>
        )}
      </div>
    </motion.div>
  );
}
