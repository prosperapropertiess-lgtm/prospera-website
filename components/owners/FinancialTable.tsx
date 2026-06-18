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
    <div style={{ overflowX: "auto", borderRadius: "14px", border: "1px solid #E8E4DF", background: "#FFFFFF" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #E8E4DF" }}>
            {["Month", "Rent Due", "Collected", "Expenses", "Net"].map(h => (
              <th
                key={h}
                style={{
                  padding: "12px 16px",
                  textAlign: h === "Month" ? "left" : "right",
                  color: "#9AA5B1",
                  fontSize: "10px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  background: "#F7F5F2",
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
            const netColor = row.net >= 0 ? "#16a34a" : "#dc2626";
            const collected = row.rentCollected;
            const collectionRate = row.rentDue > 0 ? collected / row.rentDue : 1;
            const rateColor = collectionRate >= 1 ? "#16a34a" : collectionRate >= 0.8 ? "#d97706" : "#dc2626";
            const showYear = i === 0 || row.year !== history[i - 1].year;

            return (
              <tr
                key={i}
                style={{
                  borderBottom: i < history.length - 1 ? "1px solid #F0EDE8" : "none",
                  background: isCurrent ? "rgba(139,32,48,0.03)" : "#FFFFFF",
                }}
              >
                <td style={{ padding: "11px 16px", color: isCurrent ? "#1F2F3A" : "#5A6A7A", fontWeight: isCurrent ? 600 : 400, whiteSpace: "nowrap" }}>
                  {MONTH_ABBR[row.month]} {showYear ? <span style={{ color: "#9AA5B1", fontSize: "11px" }}>{row.year}</span> : ""}
                  {isCurrent && (
                    <span style={{ marginLeft: "6px", fontSize: "10px", color: "#8B2030", fontWeight: 700, background: "rgba(139,32,48,0.08)", padding: "2px 6px", borderRadius: "4px" }}>
                      NOW
                    </span>
                  )}
                </td>
                <td style={{ padding: "11px 16px", textAlign: "right", color: "#9AA5B1" }}>
                  ${row.rentDue.toLocaleString()}
                </td>
                <td style={{ padding: "11px 16px", textAlign: "right", color: rateColor }}>
                  ${collected.toLocaleString()}
                </td>
                <td style={{ padding: "11px 16px", textAlign: "right", color: "#9AA5B1" }}>
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
          <tr style={{ borderTop: "1px solid #E8E4DF" }}>
            <td style={{ padding: "12px 16px", color: "#5A6A7A", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", background: "#F7F5F2" }}>
              Total
            </td>
            <td style={{ padding: "12px 16px", textAlign: "right", color: "#1F2F3A", fontWeight: 600, background: "#F7F5F2" }}>
              ${history.reduce((s, r) => s + r.rentDue, 0).toLocaleString()}
            </td>
            <td style={{ padding: "12px 16px", textAlign: "right", color: "#16a34a", fontWeight: 600, background: "#F7F5F2" }}>
              ${history.reduce((s, r) => s + r.rentCollected, 0).toLocaleString()}
            </td>
            <td style={{ padding: "12px 16px", textAlign: "right", color: "#1F2F3A", fontWeight: 600, background: "#F7F5F2" }}>
              ${history.reduce((s, r) => s + r.expenses, 0).toLocaleString()}
            </td>
            <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, fontFamily: "var(--font-outfit)", color: "#16a34a", background: "#F7F5F2" }}>
              ${history.reduce((s, r) => s + r.net, 0).toLocaleString()}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
