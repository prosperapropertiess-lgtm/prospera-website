"use client";

import type { MonthlySnapshot } from "@/lib/owners-data";

interface Props {
  history: MonthlySnapshot[];
  currentMonth: string;
  currentYear: number;
}

const MONTH_ABBR: Record<string, string> = {
  January: "Jan", February: "Feb", March: "Mar", April: "Apr",
  May: "May", June: "Jun", July: "Jul", August: "Aug",
  September: "Sep", October: "Oct", November: "Nov", December: "Dec",
};

export function FinancialTable({ history, currentMonth, currentYear }: Props) {
  return (
    <div style={{ overflowX: "auto", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            {["Month", "Rent Due", "Collected", "Expenses", "Net"].map(h => (
              <th
                key={h}
                style={{
                  padding: "12px 16px",
                  textAlign: h === "Month" ? "left" : "right",
                  color: "rgba(255,255,255,0.3)",
                  fontSize: "10px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  background: "rgba(255,255,255,0.02)",
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {history.map((row, i) => {
            const isCurrent = row.month === currentMonth && row.year === currentYear;
            const netColor = row.net >= 0 ? "rgba(134,239,172,0.9)" : "#ef4444";
            const collected = row.rentCollected;
            const collectionRate = row.rentDue > 0 ? collected / row.rentDue : 1;
            const rateColor = collectionRate >= 1 ? "#22c55e" : collectionRate >= 0.8 ? "#f59e0b" : "#ef4444";
            const showYear = i === 0 || row.year !== history[i - 1].year;

            return (
              <tr
                key={i}
                style={{
                  borderBottom: i < history.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  background: isCurrent ? "rgba(139,32,48,0.08)" : "transparent",
                }}
              >
                <td style={{ padding: "11px 16px", color: isCurrent ? "white" : "rgba(255,255,255,0.55)", fontWeight: isCurrent ? 600 : 400, whiteSpace: "nowrap" }}>
                  {MONTH_ABBR[row.month]} {showYear ? <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>{row.year}</span> : ""}
                  {isCurrent && (
                    <span style={{ marginLeft: "6px", fontSize: "10px", color: "rgba(139,32,48,0.8)", fontWeight: 700 }}>
                      NOW
                    </span>
                  )}
                </td>
                <td style={{ padding: "11px 16px", textAlign: "right", color: "rgba(255,255,255,0.4)" }}>
                  ${row.rentDue.toLocaleString()}
                </td>
                <td style={{ padding: "11px 16px", textAlign: "right", color: rateColor }}>
                  ${collected.toLocaleString()}
                </td>
                <td style={{ padding: "11px 16px", textAlign: "right", color: "rgba(255,255,255,0.4)" }}>
                  {row.expenses > 0 ? `$${row.expenses.toLocaleString()}` : "—"}
                </td>
                <td style={{ padding: "11px 16px", textAlign: "right", color: netColor, fontWeight: 600, fontFamily: "var(--font-outfit)" }}>
                  {row.net >= 0 ? "+" : ""}${row.net.toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
        {/* Totals row */}
        <tfoot>
          <tr style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <td style={{ padding: "12px 16px", color: "rgba(255,255,255,0.5)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Total
            </td>
            <td style={{ padding: "12px 16px", textAlign: "right", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>
              ${history.reduce((s, r) => s + r.rentDue, 0).toLocaleString()}
            </td>
            <td style={{ padding: "12px 16px", textAlign: "right", color: "rgba(134,239,172,0.8)", fontWeight: 600 }}>
              ${history.reduce((s, r) => s + r.rentCollected, 0).toLocaleString()}
            </td>
            <td style={{ padding: "12px 16px", textAlign: "right", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>
              ${history.reduce((s, r) => s + r.expenses, 0).toLocaleString()}
            </td>
            <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, fontFamily: "var(--font-outfit)", color: "#86efac" }}>
              ${history.reduce((s, r) => s + r.net, 0).toLocaleString()}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
