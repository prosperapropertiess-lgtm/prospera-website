"use client";

import { motion } from "framer-motion";
import type { MonthlySnapshot } from "@/lib/owners-data";

interface Props {
  history: MonthlySnapshot[];
  currentYear: number;
}

const NAVY = "#0F1C28";
const MUTED = "rgba(15,28,40,0.55)";
const SUBTLE = "rgba(15,28,40,0.35)";

const CATEGORY_COLORS: Record<string, string> = {
  "Management Fee": "#8B2030",
  "Management": "#8B2030",
  "Repairs": "#B45309",
  "Repair": "#B45309",
  "Maintenance": "#B45309",
  "Utilities": "#2563EB",
  "Water": "#2563EB",
  "Hydro": "#2563EB",
  "Gas": "#2563EB",
  "Insurance": "#7C3AED",
  "Property Tax": "#0A7A52",
  "Landscaping": "#059669",
  "Cleaning": "#0284C7",
};

function getColor(category: string): string {
  const lower = category.toLowerCase();
  for (const [key, color] of Object.entries(CATEGORY_COLORS)) {
    if (lower.includes(key.toLowerCase())) return color;
  }
  return "rgba(15,28,40,0.35)";
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
    <p style={{ color: SUBTLE, fontSize: "18px", padding: "8px 0", fontFamily: "var(--font-poppins)" }}>
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
              <span style={{ color: MUTED, fontSize: "17px", fontFamily: "var(--font-poppins)" }}>{cat}</span>
              <span style={{ color: SUBTLE, fontSize: "16px", fontFamily: "var(--font-poppins)" }}>
                ${amount.toLocaleString()} · <span style={{ color }}>{Math.round(pct)}%</span>
              </span>
            </div>
            <div style={{ height: "5px", background: "rgba(15,28,40,0.07)", borderRadius: "3px", overflow: "hidden" }}>
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

      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid rgba(15,28,40,0.08)", marginTop: "4px" }}>
        <span style={{ color: SUBTLE, fontSize: "16px", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-poppins)" }}>Total</span>
        <span style={{ color: NAVY, fontSize: "18px", fontFamily: "var(--font-poppins)", fontWeight: 700 }}>
          ${total.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
