"use client";

import { useRef, useState, useEffect } from "react";
import { useInView } from "framer-motion";

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

function AnimNum({ prefix = "", value, suffix = "", color }: { prefix?: string; value: number; suffix?: string; color: string }) {
  const [count, setCount] = useState(0);
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const start = performance.now();
    const duration = 800;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * value));
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
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <div
      ref={ref}
      className="rounded-xl overflow-hidden border"
      style={{ borderColor: "#D8D2C8", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
    >
      <div className="grid grid-cols-3">
        {/* Header row */}
        <div
          className="px-6 py-4 text-left"
          style={{ backgroundColor: "#F7F5F2", borderBottom: "1px solid #D8D2C8" }}
        >
          <p className="text-xs uppercase tracking-widest" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
            On $2,000/mo rent
          </p>
        </div>
        <div
          className="px-6 py-4 text-center"
          style={{ backgroundColor: "#F7F5F2", borderBottom: "1px solid #D8D2C8", borderLeft: "1px solid #D8D2C8" }}
        >
          <p className="text-xs uppercase tracking-widest" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
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
                isInView ? (
                  <AnimNum prefix={row.managed.prefix} value={row.managed.value} suffix={row.managed.suffix} color="#444444" />
                ) : (
                  <p className="text-sm" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
                    {row.managed.prefix}0{row.managed.suffix}
                  </p>
                )
              ) : (
                <p className="text-sm" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>—</p>
              )}
            </div>

            {/* Passive column */}
            <div
              key={`passive-${i}`}
              className="px-6 py-4 text-center"
              style={{ backgroundColor: "#1F2F3A", borderTop: "1px solid rgba(255,255,255,0.08)" }}
            >
              {row.passive ? (
                isInView ? (
                  <AnimNum
                    prefix={row.passive.prefix}
                    value={row.passive.value}
                    suffix={row.passive.suffix}
                    color={row.passiveHighlight ? "#8B2030" : "#FAF8F5"}
                  />
                ) : (
                  <p className="text-sm" style={{ color: row.passiveHighlight ? "#8B2030" : "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>
                    {row.passive.prefix}0{row.passive.suffix}
                  </p>
                )
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
