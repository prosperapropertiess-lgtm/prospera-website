"use client";

import { motion } from "framer-motion";
import type { MonthlySnapshot } from "@/lib/owners-data";

interface Props {
  history: MonthlySnapshot[];
  currentYear: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Management Fee": "#8B2030",
  "Management": "#8B2030",
  "Repairs": "#f59e0b",
  "Repair": "#f59e0b",
  "Maintenance": "#f59e0b",
  "Utilities": "#60a5fa",
  "Water": "#60a5fa",
  "Hydro": "#60a5fa",
  "Gas": "#60a5fa",
  "Insurance": "#a78bfa",
  "Property Tax": "#34d399",
  "Landscaping": "#6ee7b7",
  "Cleaning": "#93c5fd",
};

function getColor(category: string): string {
  const lower = category.toLowerCase();
  for (const [key, color] of Object.entries(CATEGORY_COLORS)) {
    if (lower.includes(key.toLowerCase())) return color;
  }
  return "rgba(255,255,255,0.4)";
}

export function ExpenseBreakdown({ history, currentYear }: Props) {
  const ytdMonths = history.filter(s => s.year === currentYear);

  const totals: Record<string, number> = {};
  for (const month of ytdMonths) {
    for (const [cat, amount] of Object.entries(month.expensesByCategory)) {
      totals[cat] = (totals[cat] ?? 0) + amount;
    }
  }

  const total = Object.values(totals).reduce((s, v) => s + v, 0);
  if (total === 0) return (
    <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "13px", padding: "8px 0" }}>
      No expense data recorded yet.
    </p>
  );

  const sorted = Object.entries(totals).sort(([, a], [, b]) => b - a);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {sorted.map(([cat, amount], i) => {
        const pct = (amount / total) * 100;
        const color = getColor(cat);
        return (
          <motion.div
            key={cat}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05, ease: [0.23, 1, 0.32, 1] }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
              <span style={{ color: "rgba(255,255,255,0.65)", fontSize: "13px" }}>{cat}</span>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>
                ${amount.toLocaleString()} · <span style={{ color }}>{Math.round(pct)}%</span>
              </span>
            </div>
            <div style={{ height: "5px", background: "rgba(255,255,255,0.07)", borderRadius: "3px", overflow: "hidden" }}>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.05 + 0.1, ease: [0.23, 1, 0.32, 1] }}
                style={{ height: "100%", background: color, borderRadius: "3px" }}
              />
            </div>
          </motion.div>
        );
      })}

      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: "4px" }}>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total</span>
        <span style={{ color: "white", fontSize: "13px", fontFamily: "var(--font-outfit)", fontWeight: 700 }}>
          ${total.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
