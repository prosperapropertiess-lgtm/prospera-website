"use client";

import {
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

const NAVY = "#0F1C28";
const MUTED = "rgba(15,28,40,0.45)";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
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
      }}
    >
      <p style={{ fontWeight: 700, marginBottom: "6px", fontFamily: "var(--font-poppins)" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color, margin: "2px 0", fontFamily: "var(--font-poppins)" }}>
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
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,28,40,0.06)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: MUTED, fontSize: 12, fontFamily: "var(--font-poppins)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: MUTED, fontSize: 11, fontFamily: "var(--font-poppins)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ paddingTop: "12px", fontSize: "12px", color: MUTED, fontFamily: "var(--font-poppins)" }}
        />
        <Bar dataKey="Rent" fill="rgba(139,32,48,0.65)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Expenses" fill="rgba(15,28,40,0.10)" radius={[4, 4, 0, 0]} />
        <Line
          type="monotone"
          dataKey="Net"
          stroke="#0A7A52"
          strokeWidth={2}
          dot={{ fill: "#0A7A52", r: 3 }}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
