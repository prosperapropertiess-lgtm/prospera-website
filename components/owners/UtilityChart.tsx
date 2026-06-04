"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { MonthlySnapshot } from "@/lib/owners-data";

interface Props {
  history: MonthlySnapshot[];
}

const MONTH_ABBR: Record<string, string> = {
  January: "Jan", February: "Feb", March: "Mar", April: "Apr",
  May: "May", June: "Jun", July: "Jul", August: "Aug",
  September: "Sep", October: "Oct", November: "Nov", December: "Dec",
};

// Utility-related category names to match against Notion
const UTILITY_KEYWORDS = ["utilit", "water", "hydro", "gas", "electric", "heat", "internet", "sewer"];

function isUtility(category: string): boolean {
  const lower = category.toLowerCase();
  return UTILITY_KEYWORDS.some(k => lower.includes(k));
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const utilityEntry = payload.find((p: any) => p.dataKey === "Utilities");
  const avgEntry = payload.find((p: any) => p.dataKey === "3-mo avg");
  if (!utilityEntry) return null;

  return (
    <div
      style={{
        background: "rgba(20,27,44,0.97)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "12px",
        padding: "12px 16px",
        fontSize: "12px",
        color: "white",
        minWidth: "140px",
      }}
    >
      <p style={{ fontWeight: 700, marginBottom: "8px", fontFamily: "var(--font-outfit)", fontSize: "13px" }}>
        {label}
      </p>
      <p style={{ color: "#60a5fa", margin: "3px 0" }}>
        Utilities: <strong>${utilityEntry.value.toLocaleString()}</strong>
      </p>
      {avgEntry && avgEntry.value > 0 && (
        <p style={{ color: "rgba(255,255,255,0.4)", margin: "3px 0", fontSize: "11px" }}>
          3-mo avg: ${Math.round(avgEntry.value).toLocaleString()}
        </p>
      )}
    </div>
  );
}

export function UtilityChart({ history }: Props) {
  // Extract utility cost per month
  const data = history.map(s => {
    const utilityTotal = Object.entries(s.expensesByCategory)
      .filter(([cat]) => isUtility(cat))
      .reduce((sum, [, amount]) => sum + amount, 0);
    return {
      month: MONTH_ABBR[s.month] ?? s.month,
      fullMonth: s.month,
      year: s.year,
      Utilities: utilityTotal,
    };
  });

  // Compute 3-month rolling average
  const withAvg = data.map((d, i) => {
    const window = data.slice(Math.max(0, i - 2), i + 1);
    const avg = window.reduce((s, w) => s + w.Utilities, 0) / window.length;
    return { ...d, "3-mo avg": avg };
  });

  const allValues = data.map(d => d.Utilities).filter(v => v > 0);
  const hasData = allValues.length > 0;
  const average = hasData ? allValues.reduce((s, v) => s + v, 0) / allValues.length : 0;
  const currentMonth = data[data.length - 1];
  const prevMonth = data[data.length - 2];
  const delta = currentMonth && prevMonth && prevMonth.Utilities > 0
    ? ((currentMonth.Utilities - prevMonth.Utilities) / prevMonth.Utilities) * 100
    : null;

  if (!hasData) {
    return (
      <div
        style={{
          padding: "32px",
          textAlign: "center",
          color: "rgba(255,255,255,0.25)",
          fontSize: "13px",
        }}
      >
        No utility expenses on record yet.
      </div>
    );
  }

  return (
    <div>
      {/* Summary stats */}
      <div style={{ display: "flex", gap: "24px", marginBottom: "20px", flexWrap: "wrap" }}>
        <StatPill
          label="This month"
          value={`$${currentMonth.Utilities.toLocaleString()}`}
          sub={
            delta !== null
              ? `${delta >= 0 ? "+" : ""}${Math.round(delta)}% vs last month`
              : undefined
          }
          subColor={delta !== null ? (delta > 15 ? "#f59e0b" : delta < -10 ? "#22c55e" : "rgba(255,255,255,0.3)") : undefined}
        />
        <StatPill
          label="Monthly avg"
          value={`$${Math.round(average).toLocaleString()}`}
          sub="last 12 months"
        />
        <StatPill
          label="12-month total"
          value={`$${allValues.reduce((s, v) => s + v, 0).toLocaleString()}`}
        />
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={withAvg} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `$${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          {/* Average reference line */}
          <ReferenceLine
            y={average}
            stroke="rgba(255,255,255,0.12)"
            strokeDasharray="4 4"
          />
          <Bar
            dataKey="Utilities"
            fill="rgba(96,165,250,0.5)"
            stroke="rgba(96,165,250,0.8)"
            strokeWidth={1}
            radius={[4, 4, 0, 0]}
          />
          <Line
            type="monotone"
            dataKey="3-mo avg"
            stroke="#60a5fa"
            strokeWidth={2}
            dot={false}
            strokeDasharray="4 3"
          />
        </ComposedChart>
      </ResponsiveContainer>

      <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "10px", marginTop: "8px", textAlign: "right" }}>
        Dashed line = 3-month rolling average · Dashed horizontal = 12-month avg
      </p>
    </div>
  );
}

function StatPill({ label, value, sub, subColor }: {
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
}) {
  return (
    <div>
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>
        {label}
      </p>
      <p style={{ color: "white", fontFamily: "var(--font-outfit)", fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}>
        {value}
      </p>
      {sub && (
        <p style={{ color: subColor ?? "rgba(255,255,255,0.3)", fontSize: "11px", marginTop: "3px" }}>
          {sub}
        </p>
      )}
    </div>
  );
}
