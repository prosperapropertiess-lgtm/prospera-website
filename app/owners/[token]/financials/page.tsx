import { notFound } from "next/navigation";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getDashboard } from "@/lib/owners-data";
import { IncomeChart } from "@/components/owners/IncomeChart";
import { FinancialTable } from "@/components/owners/FinancialTable";
import { ExpenseBreakdown } from "@/components/owners/ExpenseBreakdown";
import { MobileNav } from "@/components/owners/MobileNav";
import OwnerHeader from "@/components/owners/OwnerHeader";

interface Props {
  params: Promise<{ token: string }>;
}

export const revalidate = 21600;

const NAVY = "#0F1C28";
const MUTED = "rgba(15,28,40,0.60)";
const SUBTLE = "rgba(15,28,40,0.42)";
const GREEN = "#0A7A52";
const GREEN_BG = "rgba(10,122,82,0.09)";
const RED = "#B91C1C";
const AMBER = "#B45309";
const CARD_SHADOW = "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)";

function fmt$(n: number | null | undefined) {
  if (n == null || isNaN(n)) return "$0";
  return "$" + n.toLocaleString("en-CA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default async function FinancialsPage({ params }: Props) {
  const { token } = await params;

  const sb = getSupabaseAdmin();
  const { data: record } = await sb
    .from("owner_access")
    .select("notion_owner_ids, owner_names")
    .eq("token", token)
    .single();

  if (!record) return notFound();

  let dashboard;
  try {
    ({ dashboard } = await getDashboard(token, record.notion_owner_ids, record.owner_names));
  } catch (err) {
    console.error("[financials] getDashboard failed:", err);
    return notFound();
  }

  const firstNames = (record.owner_names ?? "Owner")
    .split(/\s*[&,]\s*/)
    .map((n: string) => n.trim().split(" ")[0])
    .filter(Boolean)
    .join(" & ") || "Owner";

  const multiProperty = dashboard.properties.length > 1;

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
      />

      <div style={{ minHeight: "100vh", background: "#F5F4F1" }}>
        <OwnerHeader firstName={firstNames} token={token} />

        <main style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 20px 100px" }}>

          {/* Back link */}
          <Link
            href={`/owners/${token}`}
            style={{
              color: MUTED,
              fontSize: "16px",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              marginBottom: "28px",
              fontFamily: "var(--font-poppins)",
              fontWeight: 500,
            }}
          >
            ← Back
          </Link>

          <h1
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: "clamp(32px, 5vw, 44px)",
              fontWeight: 800,
              color: NAVY,
              letterSpacing: "-0.02em",
              marginBottom: "6px",
              lineHeight: 1.1,
            }}
          >
            Financials
          </h1>
          <p style={{ fontFamily: "var(--font-poppins)", fontSize: "17px", color: MUTED, marginBottom: "32px" }}>
            {dashboard.currentMonth} {dashboard.currentYear} · Year-to-date overview
          </p>

          {/* Portfolio totals — only shown when multiple properties */}
          {multiProperty && (
            <>
              <SectionLabel>Portfolio total</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "32px" }}>
                <StatCard label="YTD collected" value={fmt$(dashboard.totalYtdCollected)} valueColor={NAVY} />
                <StatCard label="YTD expenses" value={fmt$(dashboard.totalExpenses)} valueColor={AMBER} />
                <StatCard
                  label="YTD net"
                  value={fmt$(dashboard.totalNet)}
                  valueColor={dashboard.totalNet >= 0 ? GREEN : RED}
                />
              </div>
            </>
          )}

          {dashboard.properties.map((propData, idx) => {
            const { property, history, ytdRentCollected, ytdExpenses, ytdNet, currentMonthCollected, currentMonthDue } = propData;

            const currentYearHistory = history.filter(s => s.year === dashboard.currentYear);
            const activeMonthsYTD = currentYearHistory.filter(s => s.rentCollected > 0 || s.expenses > 0).length;
            const projectedAnnualNet = activeMonthsYTD >= 2 ? Math.round((ytdNet / activeMonthsYTD) * 12) : null;
            const avgMonthlyNet = activeMonthsYTD >= 2 ? Math.round(ytdNet / activeMonthsYTD) : null;
            const outstanding = currentMonthDue - currentMonthCollected;
            const allCollected = outstanding <= 0 && currentMonthDue > 0;

            return (
              <div key={property.id} style={{ marginTop: idx > 0 ? "56px" : "0" }}>

                {/* Property header for multi-property */}
                {multiProperty && (
                  <p style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: SUBTLE,
                    textTransform: "uppercase",
                    letterSpacing: "0.10em",
                    marginBottom: "20px",
                    fontFamily: "var(--font-poppins)",
                  }}>
                    {property.address}
                  </p>
                )}

                {/* ── Current month hero card ── */}
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(15,28,40,0.07)",
                    borderTop: `2px solid ${allCollected ? GREEN : outstanding > 0 ? AMBER : "#8B2030"}`,
                    borderRadius: "20px",
                    padding: "28px",
                    marginBottom: "12px",
                    boxShadow: CARD_SHADOW,
                  }}
                >
                  <p style={{ fontSize: "12px", fontFamily: "var(--font-poppins)", color: SUBTLE, textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: "8px", fontWeight: 700 }}>
                    {dashboard.currentMonth} {dashboard.currentYear}
                  </p>

                  <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "6px", flexWrap: "wrap" }}>
                    <p style={{ fontFamily: "var(--font-poppins)", fontSize: "clamp(40px, 7vw, 56px)", fontWeight: 800, color: NAVY, letterSpacing: "-0.03em", lineHeight: 1 }}>
                      {fmt$(currentMonthCollected)}
                    </p>
                    {currentMonthDue > 0 && (
                      <p style={{ fontFamily: "var(--font-poppins)", fontSize: "17px", color: MUTED, fontWeight: 500 }}>
                        of {fmt$(currentMonthDue)} due
                      </p>
                    )}
                  </div>

                  {currentMonthDue > 0 && (
                    allCollected ? (
                      <p style={{ fontFamily: "var(--font-poppins)", fontSize: "15px", color: GREEN, fontWeight: 600, marginBottom: "0" }}>
                        ✓ Fully collected
                      </p>
                    ) : (
                      <p style={{ fontFamily: "var(--font-poppins)", fontSize: "15px", color: AMBER, fontWeight: 600, marginBottom: "0" }}>
                        {fmt$(outstanding)} outstanding
                      </p>
                    )
                  )}
                </div>

                {/* ── YTD stat cards ── */}
                <SectionLabel>Year to date</SectionLabel>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "12px" }}>
                  <StatCard label="Collected" value={fmt$(ytdRentCollected)} valueColor={NAVY} />
                  <StatCard label="Expenses" value={fmt$(ytdExpenses)} valueColor={AMBER} />
                  <StatCard label="Net" value={fmt$(ytdNet)} valueColor={ytdNet >= 0 ? GREEN : RED} />
                </div>

                {/* ── Annual projection ── */}
                {projectedAnnualNet !== null && (
                  <div
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid rgba(15,28,40,0.07)",
                      borderLeft: `3px solid ${projectedAnnualNet >= 0 ? GREEN : RED}`,
                      borderRadius: "16px",
                      padding: "20px 24px",
                      marginBottom: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "12px",
                      boxShadow: CARD_SHADOW,
                    }}
                  >
                    <div>
                      <p style={{ color: SUBTLE, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: "6px", fontFamily: "var(--font-poppins)", fontWeight: 700 }}>
                        On track for {dashboard.currentYear}
                      </p>
                      <p style={{ color: projectedAnnualNet >= 0 ? GREEN : RED, fontFamily: "var(--font-poppins)", fontSize: "clamp(28px, 4vw, 38px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1 }}>
                        {projectedAnnualNet >= 0 ? "+" : ""}{fmt$(projectedAnnualNet)}
                      </p>
                      <p style={{ color: MUTED, fontSize: "15px", marginTop: "6px", fontFamily: "var(--font-poppins)" }}>
                        projected net · avg {fmt$(avgMonthlyNet!)} / mo
                      </p>
                    </div>
                    <p style={{ color: SUBTLE, fontSize: "14px", fontFamily: "var(--font-poppins)" }}>
                      Based on {activeMonthsYTD} month{activeMonthsYTD > 1 ? "s" : ""} of data
                    </p>
                  </div>
                )}

                {/* ── 6-month chart ── */}
                <SectionLabel>6-month trend</SectionLabel>
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(15,28,40,0.07)",
                    borderRadius: "20px",
                    padding: "24px",
                    marginBottom: "12px",
                    boxShadow: CARD_SHADOW,
                  }}
                >
                  <IncomeChart history={history} />
                </div>

                {/* ── Expense breakdown ── */}
                <SectionLabel>Where the money went</SectionLabel>
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(15,28,40,0.07)",
                    borderRadius: "20px",
                    padding: "24px",
                    marginBottom: "12px",
                    boxShadow: CARD_SHADOW,
                  }}
                >
                  <ExpenseBreakdown history={history} currentYear={dashboard.currentYear} />
                </div>

                {/* ── Monthly table ── */}
                <SectionLabel>Month-by-month</SectionLabel>
                <div style={{ marginBottom: "8px" }}>
                  <FinancialTable
                    history={history}
                    currentMonth={dashboard.currentMonth}
                    currentYear={dashboard.currentYear}
                  />
                </div>

                {/* Divider between properties */}
                {multiProperty && idx < dashboard.properties.length - 1 && (
                  <div style={{ height: "1px", background: "rgba(15,28,40,0.07)", margin: "48px 0" }} />
                )}
              </div>
            );
          })}
        </main>

        <MobileNav token={token} />
      </div>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: "12px",
        fontFamily: "var(--font-poppins)",
        color: "rgba(15,28,40,0.45)",
        textTransform: "uppercase",
        letterSpacing: "0.10em",
        fontWeight: 700,
        marginBottom: "10px",
        marginTop: "24px",
      }}
    >
      {children}
    </p>
  );
}

function StatCard({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor: string;
}) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid rgba(15,28,40,0.07)",
        borderRadius: "16px",
        padding: "20px 18px",
        boxShadow: CARD_SHADOW,
      }}
    >
      <p
        style={{
          fontSize: "12px",
          fontFamily: "var(--font-poppins)",
          color: "rgba(15,28,40,0.42)",
          textTransform: "uppercase",
          letterSpacing: "0.09em",
          marginBottom: "10px",
          fontWeight: 700,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "var(--font-poppins)",
          fontSize: "clamp(20px, 3.5vw, 28px)",
          fontWeight: 800,
          color: valueColor,
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        {value}
      </p>
    </div>
  );
}
