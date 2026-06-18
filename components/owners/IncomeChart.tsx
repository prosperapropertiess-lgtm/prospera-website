"use client";

import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Legend,
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

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(20,27,44,0.95)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "12px",
        padding: "12px 16px",
        fontSize: "12px",
        color: "white",
      }}
    >
      <p style={{ fontWeight: 600, marginBottom: "6px", fontFamily: "var(--font-outfit)" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color, margin: "2px 0" }}>
          {p.name}: ${p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export function IncomeChart({ history }: Props) {
  const slice = history.slice(-6);
  const data = slice.map((s, i) => {
    const showYear = i === 0 || s.year !== slice[i - 1].year;
    const label = showYear
      ? `${MONTH_ABBR[s.month] ?? s.month} '${String(s.year).slice(2)}`
      : MONTH_ABBR[s.month] ?? s.month;
    return { month: label, "Rent": s.rentCollected, "Expenses": s.expenses, "Net": s.net };
  });

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: "rgba(237,232,225,0.35)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "rgba(237,232,225,0.35)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ paddingTop: "12px", fontSize: "11px", color: "rgba(237,232,225,0.42)" }}
        />
        <Bar dataKey="Rent" fill="rgba(139,32,48,0.55)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Expenses" fill="rgba(255,255,255,0.08)" radius={[4, 4, 0, 0]} />
        <Line
          type="monotone"
          dataKey="Net"
          stroke="#22c55e"
          strokeWidth={2}
          dot={{ fill: "#22c55e", r: 3 }}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
