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

const NAVY = "#0F1C28";
const MUTED = "rgba(15,28,40,0.45)";
const SUBTLE = "rgba(15,28,40,0.35)";

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
        background: "#FFFFFF",
        border: "1px solid rgba(15,28,40,0.10)",
        borderRadius: "12px",
        padding: "12px 16px",
        fontSize: "13px",
        color: NAVY,
        boxShadow: "0 4px 16px rgba(15,28,40,0.10)",
        minWidth: "140px",
      }}
    >
      <p style={{ fontWeight: 700, marginBottom: "8px", fontFamily: "var(--font-poppins)", fontSize: "14px" }}>
        {label}
      </p>
      <p style={{ color: "#2563EB", margin: "3px 0", fontFamily: "var(--font-poppins)" }}>
        Utilities: <strong>${utilityEntry.value.toLocaleString()}</strong>
      </p>
      {avgEntry && avgEntry.value > 0 && (
        <p style={{ color: MUTED, margin: "3px 0", fontSize: "12px", fontFamily: "var(--font-poppins)" }}>
          3-mo avg: ${Math.round(avgEntry.value).toLocaleString()}
        </p>
      )}
    </div>
  );
}

export function UtilityChart({ history }: Props) {
  const data = history.map((s, i) => {
    const utilityTotal = Object.entries(s.expensesByCategory)
      .filter(([cat]) => isUtility(cat))
      .reduce((sum, [, amount]) => sum + amount, 0);
    const showYear = i === 0 || s.year !== history[i - 1].year;
    const label = showYear
      ? `${MONTH_ABBR[s.month] ?? s.month} '${String(s.year).slice(2)}`
      : MONTH_ABBR[s.month] ?? s.month;
    return { month: label, fullMonth: s.month, year: s.year, Utilities: utilityTotal };
  });

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
      <div style={{ padding: "32px", textAlign: "center", color: MUTED, fontSize: "14px", fontFamily: "var(--font-poppins)" }}>
        No utility expenses on record yet.
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: "24px", marginBottom: "20px", flexWrap: "wrap" }}>
        <StatPill
          label="This month"
          value={`$${currentMonth.Utilities.toLocaleString()}`}
          sub={
            delta !== null
              ? `${delta >= 0 ? "+" : ""}${Math.round(delta)}% vs last month`
              : undefined
          }
          subColor={delta !== null ? (delta > 15 ? "#B45309" : delta < -10 ? "#0A7A52" : SUBTLE) : undefined}
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

      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={withAvg} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,28,40,0.06)" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: MUTED, fontSize: 11, fontFamily: "var(--font-poppins)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: MUTED, fontSize: 11, fontFamily: "var(--font-poppins)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `$${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={average}
            stroke="rgba(15,28,40,0.12)"
            strokeDasharray="4 4"
          />
          <Bar
            dataKey="Utilities"
            fill="rgba(37,99,235,0.45)"
            stroke="rgba(37,99,235,0.7)"
            strokeWidth={1}
            radius={[4, 4, 0, 0]}
          />
          <Line
            type="monotone"
            dataKey="3-mo avg"
            stroke="#2563EB"
            strokeWidth={2}
            dot={false}
            strokeDasharray="4 3"
          />
        </ComposedChart>
      </ResponsiveContainer>

      <p style={{ color: SUBTLE, fontSize: "11px", marginTop: "8px", textAlign: "right", fontFamily: "var(--font-poppins)" }}>
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
      <p style={{ color: SUBTLE, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px", fontFamily: "var(--font-poppins)" }}>
        {label}
      </p>
      <p style={{ color: NAVY, fontFamily: "var(--font-poppins)", fontSize: "21px", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}>
        {value}
      </p>
      {sub && (
        <p style={{ color: subColor ?? SUBTLE, fontSize: "12px", marginTop: "3px", fontFamily: "var(--font-poppins)" }}>
          {sub}
        </p>
      )}
    </div>
  );
}
