"use client";

import { useRef, useState, useEffect } from "react";

const rows = [
  {
    label: "Monthly management fee",
    managed: { prefix: "$", value: 160, suffix: "" },
    passive: { prefix: "$", value: 300, suffix: "" },
    passiveHighlight: false,
  },
  {
    label: "Placement fee (per vacancy)",
    managed: { prefix: "$", value: 2000, suffix: "" },
    passive: null, // "Free"
    passiveHighlight: true,
  },
  {
    label: "Year 1 total (1 vacancy)",
    managed: { prefix: "$", value: 3920, suffix: "" },
    passive: { prefix: "$", value: 3600, suffix: "" },
    passiveHighlight: false,
  },
  {
    label: "You save",
    managed: null, // "—"
    passive: { prefix: "$", value: 320, suffix: " in year 1" },
    passiveHighlight: true,
  },
];

/**
 * SEO-safe AnimNum: starts at target value (visible in SSR HTML),
 * then animates from 0 to target after hydration when in view.
 */
function AnimNum({ prefix = "", value, suffix = "", color }: { prefix?: string; value: number; suffix?: string; color: string }) {
  // Start at target value so SSR HTML shows real number for crawlers
  const [count, setCount] = useState(value);
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    // Animate from 80% of value to 100% — NEVER reset to 0
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    const startValue = Math.floor(value * 0.8);
    setCount(startValue);
    const start = performance.now();
    const duration = 800;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(startValue + eased * (value - startValue)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);

  return (
    <p className="text-sm" style={{ color, fontFamily: "var(--font-dm-sans)", fontWeight: color === "#8B2030" ? 600 : undefined }}>
      {prefix}{count.toLocaleString()}{suffix}
    </p>
  );
}

export default function AnimatedPricingNumbers() {
  return (
    <div
      className="rounded-xl overflow-hidden border"
      style={{ borderColor: "#D8D2C8", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
    >
      <div className="grid grid-cols-3">
        {/* Header row */}
        <div
          className="px-6 py-4 text-left"
          style={{ backgroundColor: "#F7F5F2", borderBottom: "1px solid #D8D2C8" }}
        >
          <p className="text-xs uppercase tracking-widest" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
            On $2,000/mo rent
          </p>
        </div>
        <div
          className="px-6 py-4 text-center"
          style={{ backgroundColor: "#F7F5F2", borderBottom: "1px solid #D8D2C8", borderLeft: "1px solid #D8D2C8" }}
        >
          <p className="text-xs uppercase tracking-widest" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
            Managed 8%
          </p>
        </div>
        <div
          className="px-6 py-4 text-center"
          style={{ backgroundColor: "#1F2F3A", borderBottom: "1px solid #D8D2C8" }}
        >
          <p className="text-xs uppercase tracking-widest" style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>
            Passive 15%
          </p>
        </div>

        {/* Data rows */}
        {rows.map((row, i) => (
          <>
            <div
              key={`label-${i}`}
              className="px-6 py-4 text-left"
              style={{ backgroundColor: i % 2 === 0 ? "#FFFFFF" : "#F7F5F2", borderTop: "1px solid #D8D2C8" }}
            >
              <p className="text-sm" style={{ color: "#222222", fontFamily: "var(--font-dm-sans)" }}>{row.label}</p>
            </div>

            {/* Managed column */}
            <div
              key={`managed-${i}`}
              className="px-6 py-4 text-center"
              style={{ backgroundColor: i % 2 === 0 ? "#FFFFFF" : "#F7F5F2", borderTop: "1px solid #D8D2C8", borderLeft: "1px solid #D8D2C8" }}
            >
              {row.managed ? (
                <AnimNum prefix={row.managed.prefix} value={row.managed.value} suffix={row.managed.suffix} color="#333333" />
              ) : (
                <p className="text-sm" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>—</p>
              )}
            </div>

            {/* Passive column */}
            <div
              key={`passive-${i}`}
              className="px-6 py-4 text-center"
              style={{ backgroundColor: "#1F2F3A", borderTop: "1px solid rgba(255,255,255,0.08)" }}
            >
              {row.passive ? (
                <AnimNum
                  prefix={row.passive.prefix}
                  value={row.passive.value}
                  suffix={row.passive.suffix}
                  color={row.passiveHighlight ? "#8B2030" : "#FAF8F5"}
                />
              ) : (
                <p className="text-sm font-semibold" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>Free</p>
              )}
            </div>
          </>
        ))}
      </div>
    </div>
  );
}
