"use client";

import { motion } from "framer-motion";
import type { MaintenanceItem } from "@/lib/notion";

interface Props {
  open: MaintenanceItem[];
  completed: MaintenanceItem[];
}

const PRIORITY_COLORS: Record<string, { color: string; bg: string; border: string; leftBorder: string }> = {
  critical: { color: "#f87171", bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.20)", leftBorder: "#f87171" },
  high:     { color: "#fbbf24", bg: "rgba(251,191,36,0.10)",  border: "rgba(251,191,36,0.20)",  leftBorder: "#fbbf24" },
  medium:   { color: "#fbbf24", bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.15)",  leftBorder: "#f59e0b" },
  low:      { color: "rgba(237,232,225,0.35)", bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.07)", leftBorder: "rgba(255,255,255,0.12)" },
};

export function MaintenanceList({ open, completed }: Props) {
  if (open.length === 0 && completed.length === 0) {
    return (
      <div
        style={{
          padding: "24px",
          textAlign: "center",
          background: "rgba(52,211,153,0.08)",
          border: "1px solid rgba(52,211,153,0.15)",
          borderRadius: "14px",
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "28px", color: "#34d399", display: "block", marginBottom: "6px" }}>
          check_circle
        </span>
        <p style={{ color: "#34d399", fontSize: "13px", fontWeight: 500 }}>
          No open maintenance issues
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {open.map((item, i) => {
        const p = PRIORITY_COLORS[(item.priority ?? "low").toLowerCase()] ?? PRIORITY_COLORS.low;
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "14px",
              background: "#0D1825",
              border: `1px solid ${p.border}`,
              borderLeft: `4px solid ${p.leftBorder}`,
              borderRadius: "12px",
            }}
          >
            <div
              style={{
                padding: "4px 8px",
                borderRadius: "6px",
                background: p.bg,
                border: `1px solid ${p.border}`,
                flexShrink: 0,
              }}
            >
              <span style={{ color: p.color, fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {item.priority}
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: "#EDE8E1", fontSize: "13px", fontWeight: 500, marginBottom: "2px" }}>
                {item.issue}
              </p>
              <p style={{ color: "rgba(237,232,225,0.42)", fontSize: "11px" }}>
                {item.category}
                {item.daysPending != null && ` · ${item.daysPending}d pending`}
              </p>
            </div>
          </motion.div>
        );
      })}

      {completed.map((item, i) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 14px",
            background: "rgba(255,255,255,0.03)",
            borderRadius: "12px",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "#16a34a", flexShrink: 0 }}>
            check_circle
          </span>
          <div style={{ flex: 1 }}>
            <p style={{ color: "rgba(237,232,225,0.42)", fontSize: "13px", textDecoration: "line-through" }}>
              {item.issue}
            </p>
          </div>
          <span style={{ color: "#16a34a", fontSize: "11px" }}>
            {item.dateCompleted
              ? new Date(item.dateCompleted).toLocaleDateString("en-CA", { month: "short", day: "numeric" })
              : "Done"}
          </span>
        </div>
      ))}
    </div>
  );
}
