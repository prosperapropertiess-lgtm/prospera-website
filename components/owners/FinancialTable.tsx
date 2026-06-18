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

const NAVY = "#0F1C28";
const MUTED = "rgba(15,28,40,0.45)";
const SUBTLE = "rgba(15,28,40,0.22)";
const GREEN = "#0A7A52";
const RED = "#B91C1C";
const AMBER = "#B45309";
const BURGUNDY = "#8B2030";

export function FinancialTable({ history, currentMonth, currentYear }: Props) {
  const totalDue = history.reduce((s, r) => s + r.rentDue, 0);
  const totalCollected = history.reduce((s, r) => s + r.rentCollected, 0);
  const totalExpenses = history.reduce((s, r) => s + r.expenses, 0);
  const totalNet = history.reduce((s, r) => s + r.net, 0);

  return (
    <div style={{ overflowX: "auto", borderRadius: "16px", border: "1px solid rgba(15,28,40,0.07)", background: "#FFFFFF", boxShadow: "0 1px 3px rgba(15,28,40,0.05)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "18px" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(15,28,40,0.07)", background: "rgba(15,28,40,0.02)" }}>
            {["Month", "Rent Due", "Collected", "Expenses", "Net"].map(h => (
              <th
                key={h}
                style={{
                  padding: "14px 18px",
                  textAlign: h === "Month" ? "left" : "right",
                  color: SUBTLE,
                  fontSize: "15px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  whiteSpace: "nowrap",
                  fontFamily: "var(--font-poppins)",
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
            const netColor = row.net >= 0 ? GREEN : RED;
            const collected = row.rentCollected;
            const collectionRate = row.rentDue > 0 ? collected / row.rentDue : 1;
            const rateColor = collectionRate >= 1 ? GREEN : collectionRate >= 0.8 ? AMBER : RED;
            const showYear = i === 0 || row.year !== history[i - 1].year;

            return (
              <tr
                key={i}
                style={{
                  borderBottom: i < history.length - 1 ? "1px solid rgba(15,28,40,0.05)" : "none",
                  background: isCurrent ? "rgba(139,32,48,0.04)" : "transparent",
                }}
              >
                <td style={{ padding: "13px 18px", color: isCurrent ? NAVY : MUTED, fontWeight: isCurrent ? 600 : 400, whiteSpace: "nowrap", fontFamily: "var(--font-poppins)" }}>
                  {MONTH_ABBR[row.month]}{" "}
                  {showYear && <span style={{ color: SUBTLE, fontSize: "16px" }}>{row.year}</span>}
                  {isCurrent && (
                    <span style={{ marginLeft: "8px", fontSize: "14px", color: BURGUNDY, fontWeight: 700, background: "rgba(139,32,48,0.08)", padding: "2px 8px", borderRadius: "6px" }}>
                      NOW
                    </span>
                  )}
                </td>
                <td style={{ padding: "13px 18px", textAlign: "right", color: SUBTLE, fontFamily: "var(--font-poppins)" }}>
                  ${row.rentDue.toLocaleString()}
                </td>
                <td style={{ padding: "13px 18px", textAlign: "right", color: rateColor, fontWeight: 500, fontFamily: "var(--font-poppins)" }}>
                  ${collected.toLocaleString()}
                </td>
                <td style={{ padding: "13px 18px", textAlign: "right", color: MUTED, fontFamily: "var(--font-poppins)" }}>
                  {row.expenses > 0 ? `$${row.expenses.toLocaleString()}` : "—"}
                </td>
                <td style={{ padding: "13px 18px", textAlign: "right", color: netColor, fontWeight: 700, fontFamily: "var(--font-poppins)" }}>
                  {row.net >= 0 ? "+" : ""}${row.net.toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: "2px solid rgba(15,28,40,0.08)", background: "rgba(15,28,40,0.02)" }}>
            <td style={{ padding: "14px 18px", color: NAVY, fontSize: "16px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-poppins)" }}>
              Total
            </td>
            <td style={{ padding: "14px 18px", textAlign: "right", color: NAVY, fontWeight: 600, fontFamily: "var(--font-poppins)" }}>
              ${totalDue.toLocaleString()}
            </td>
            <td style={{ padding: "14px 18px", textAlign: "right", color: GREEN, fontWeight: 700, fontFamily: "var(--font-poppins)" }}>
              ${totalCollected.toLocaleString()}
            </td>
            <td style={{ padding: "14px 18px", textAlign: "right", color: NAVY, fontWeight: 600, fontFamily: "var(--font-poppins)" }}>
              ${totalExpenses.toLocaleString()}
            </td>
            <td style={{ padding: "14px 18px", textAlign: "right", fontWeight: 800, fontFamily: "var(--font-poppins)", color: totalNet >= 0 ? GREEN : RED, fontSize: "17px" }}>
              {totalNet >= 0 ? "+" : ""}${totalNet.toLocaleString()}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
