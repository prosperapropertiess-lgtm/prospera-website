"use client";

import { useState } from "react";
import type { MonthSnapshot } from "@/lib/demo-data";

interface Props {
  history: MonthSnapshot[];
  months?: number;
}

const NAVY = "#1F2F3A";
const BURGUNDY = "#8B2030";
const GREEN = "#1B6B45";
const MUTED = "#666666";
const BORDER = "#D8D2C8";

export default function DemoChart({ history, months = 6 }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [mode, setMode] = useState<"6m" | "12m">("6m");

  const slice = mode === "6m" ? history.slice(-6) : history;
  const maxVal = Math.max(...slice.map(h => Math.max(h.rentCollected, h.expenses)), 1);

  const BAR_H = 160;
  const barWidth = `${Math.floor(100 / slice.length) - 4}%`;

  return (
    <div>
      {/* Toggle */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {(["6m", "12m"] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              fontSize: "11px",
              fontFamily: "var(--font-dm-sans)",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "6px 14px",
              borderRadius: "20px",
              border: `1px solid ${mode === m ? NAVY : BORDER}`,
              background: mode === m ? NAVY : "transparent",
              color: mode === m ? "#FAF8F5" : MUTED,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {m === "6m" ? "6 months" : "12 months"}
          </button>
        ))}
      </div>

      {/* Chart area */}
      <div style={{ position: "relative", height: `${BAR_H + 40}px` }}>
        {/* Y-axis grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(pct => (
          <div
            key={pct}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: `${40 + pct * BAR_H}px`,
              borderTop: `1px dashed ${pct === 0 ? BORDER : "rgba(15,28,40,0.08)"}`,
            }}
          />
        ))}

        {/* Bars */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: 0,
            right: 0,
            height: `${BAR_H}px`,
            display: "flex",
            alignItems: "flex-end",
            gap: "4px",
            padding: "0 4px",
          }}
        >
          {slice.map((h, i) => {
            const rentH = Math.round((h.rentCollected / maxVal) * BAR_H);
            const expH = Math.round((h.expenses / maxVal) * BAR_H);
            const isHov = hovered === i;
            return (
              <div
                key={`${h.month}-${h.year}`}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", cursor: "pointer" }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Tooltip */}
                {isHov && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: `${Math.max(rentH, expH) + 8}px`,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: NAVY,
                      color: "#FAF8F5",
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "11px",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      whiteSpace: "nowrap",
                      zIndex: 10,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: "4px" }}>{h.month.slice(0, 3)} {h.year}</div>
                    <div style={{ color: "rgba(250,248,245,0.7)", marginBottom: "2px" }}>Rent: <span style={{ color: "#FAF8F5", fontWeight: 600 }}>${h.rentCollected.toLocaleString()}</span></div>
                    <div style={{ color: "rgba(250,248,245,0.7)", marginBottom: "2px" }}>Exp: <span style={{ color: "#FAF8F5", fontWeight: 600 }}>${h.expenses.toLocaleString()}</span></div>
                    <div style={{ color: "rgba(250,248,245,0.7)" }}>Net: <span style={{ color: h.net >= 0 ? "#68D391" : "#FC8181", fontWeight: 600 }}>${h.net.toLocaleString()}</span></div>
                  </div>
                )}

                {/* Bars stacked side by side */}
                <div style={{ display: "flex", alignItems: "flex-end", gap: "2px", width: "100%" }}>
                  {/* Rent bar */}
                  <div
                    style={{
                      flex: 1,
                      height: `${rentH}px`,
                      background: isHov ? BURGUNDY : "rgba(139,32,48,0.75)",
                      borderRadius: "4px 4px 0 0",
                      transition: "background 0.15s",
                      minHeight: "2px",
                    }}
                  />
                  {/* Expense bar */}
                  {h.expenses > 0 && (
                    <div
                      style={{
                        flex: 1,
                        height: `${expH}px`,
                        background: isHov ? "#94a3b8" : "rgba(148,163,184,0.5)",
                        borderRadius: "4px 4px 0 0",
                        transition: "background 0.15s",
                        minHeight: "2px",
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "4px",
            right: "4px",
            display: "flex",
            gap: "4px",
          }}
        >
          {slice.map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                textAlign: "center",
                fontFamily: "var(--font-dm-sans)",
                fontSize: "10px",
                color: hovered === i ? NAVY : MUTED,
                fontWeight: hovered === i ? 700 : 400,
                paddingTop: "6px",
              }}
            >
              {h.month.slice(0, 3)}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: "20px", marginTop: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "rgba(139,32,48,0.75)" }} />
          <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: MUTED }}>Rent</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "rgba(148,163,184,0.5)" }} />
          <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: MUTED }}>Expenses</span>
        </div>
      </div>
    </div>
  );
}
