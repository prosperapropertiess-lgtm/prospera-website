"use client";

import { motion } from "framer-motion";
import type { MaintenanceItem } from "@/lib/notion";

interface Props {
  open: MaintenanceItem[];
  completed: MaintenanceItem[];
}

const PRIORITY_COLORS: Record<string, { color: string; bg: string }> = {
  critical: { color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
  high:     { color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  medium:   { color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
  low:      { color: "rgba(255,255,255,0.35)", bg: "rgba(255,255,255,0.06)" },
};

export function MaintenanceList({ open, completed }: Props) {
  if (open.length === 0 && completed.length === 0) {
    return (
      <div
        style={{
          padding: "24px",
          textAlign: "center",
          background: "rgba(34,197,94,0.05)",
          border: "1px solid rgba(34,197,94,0.15)",
          borderRadius: "14px",
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "28px", color: "#22c55e", display: "block", marginBottom: "6px" }}>
          check_circle
        </span>
        <p style={{ color: "rgba(34,197,94,0.8)", fontSize: "13px", fontWeight: 500 }}>
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
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${p.color}30`,
              borderRadius: "12px",
            }}
          >
            <div
              style={{
                padding: "4px 8px",
                borderRadius: "6px",
                background: p.bg,
                border: `1px solid ${p.color}40`,
                flexShrink: 0,
              }}
            >
              <span style={{ color: p.color, fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {item.priority}
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "13px", fontWeight: 500, marginBottom: "2px" }}>
                {item.issue}
              </p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>
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
            background: "rgba(34,197,94,0.04)",
            border: "1px solid rgba(34,197,94,0.12)",
            borderRadius: "12px",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "#22c55e", flexShrink: 0 }}>
            check_circle
          </span>
          <div style={{ flex: 1 }}>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", textDecoration: "line-through" }}>
              {item.issue}
            </p>
          </div>
          <span style={{ color: "rgba(34,197,94,0.6)", fontSize: "11px" }}>
            {item.dateCompleted
              ? new Date(item.dateCompleted).toLocaleDateString("en-CA", { month: "short", day: "numeric" })
              : "Done"}
          </span>
        </div>
      ))}
    </div>
  );
}
