import { notFound } from "next/navigation";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getDashboard } from "@/lib/owners-data";
import { IncomeChart } from "@/components/owners/IncomeChart";
import { FinancialTable } from "@/components/owners/FinancialTable";
import { MobileNav } from "@/components/owners/MobileNav";
import OwnerHeader from "@/components/owners/OwnerHeader";

interface Props {
  params: Promise<{ token: string }>;
}

export const revalidate = 21600;

function fmt$(n: number) {
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
  } catch {
    return notFound();
  }

  const firstNames = record.owner_names
    .split(/\s*[&,]\s*/)
    .map((n: string) => n.trim().split(" ")[0])
    .join(" & ");

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
          <Link
            href={`/owners/${token}`}
            style={{
              color: "rgba(15,28,40,0.45)",
              fontSize: "13px",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              marginBottom: "28px",
              fontFamily: "var(--font-dm-sans)",
              fontWeight: 500,
            }}
          >
            ← Back
          </Link>

          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(40px, 6vw, 60px)",
              fontWeight: 300,
              color: "#0F1C28",
              letterSpacing: "-0.02em",
              marginBottom: "32px",
              lineHeight: 1,
            }}
          >
            Financials
          </h1>

          {/* Portfolio totals when multiple properties */}
          {multiProperty && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "10px",
                marginBottom: "40px",
              }}
            >
              <StatCard label="Total Collected" value={fmt$(dashboard.totalRentCollected)} valueColor="#0F1C28" />
              <StatCard label="Total Expenses" value={fmt$(dashboard.totalExpenses)} valueColor="#B45309" />
              <StatCard
                label="Total Net"
                value={fmt$(dashboard.totalNet)}
                valueColor={dashboard.totalNet >= 0 ? "#0A7A52" : "#B91C1C"}
              />
            </div>
          )}

          {dashboard.properties.map((propData, idx) => {
            const { property, history, ytdRentCollected, ytdExpenses, ytdNet } = propData;

            const currentYearHistory = history.filter(s => s.year === dashboard.currentYear);
            const activeMonthsYTD = currentYearHistory.filter(s => s.rentCollected > 0 || s.expenses > 0).length;
            const projectedAnnualNet = activeMonthsYTD >= 2 ? Math.round((ytdNet / activeMonthsYTD) * 12) : null;
            const avgMonthlyNet = activeMonthsYTD >= 2 ? Math.round(ytdNet / activeMonthsYTD) : null;

            return (
              <div key={property.id}>
                {multiProperty && (
                  <p
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "rgba(15,28,40,0.22)",
                      textTransform: "uppercase",
                      letterSpacing: "0.10em",
                      marginBottom: "16px",
                      marginTop: idx === 0 ? "0" : "48px",
                      fontFamily: "var(--font-dm-sans)",
                    }}
                  >
                    {property.address}
                  </p>
                )}
                {!multiProperty && idx === 0 && <div style={{ marginTop: "0" }} />}

                {/* YTD stats — 3 cards */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "10px",
                    marginBottom: "16px",
                  }}
                >
                  <StatCard label="Collected" value={fmt$(ytdRentCollected)} valueColor="#0F1C28" />
                  <StatCard label="Expenses" value={fmt$(ytdExpenses)} valueColor="#B45309" />
                  <StatCard
                    label="Net"
                    value={fmt$(ytdNet)}
                    valueColor={ytdNet >= 0 ? "#0A7A52" : "#B91C1C"}
                  />
                </div>

                {/* Annual projection card */}
                {projectedAnnualNet !== null && (
                  <div
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid rgba(15,28,40,0.07)",
                      borderTop: `2px solid ${projectedAnnualNet >= 0 ? "#0A7A52" : "#B91C1C"}`,
                      borderRadius: "20px",
                      padding: "24px 28px",
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "12px",
                      boxShadow: "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          color: "rgba(15,28,40,0.22)",
                          fontSize: "11px",
                          textTransform: "uppercase",
                          letterSpacing: "0.10em",
                          marginBottom: "10px",
                          fontFamily: "var(--font-dm-sans)",
                          fontWeight: 600,
                        }}
                      >
                        Annual Projection · {dashboard.currentYear}
                      </p>
                      <p
                        style={{
                          color: projectedAnnualNet >= 0 ? "#0A7A52" : "#B91C1C",
                          fontFamily: "var(--font-cormorant)",
                          fontSize: "clamp(32px, 5vw, 48px)",
                          fontWeight: 600,
                          letterSpacing: "-0.02em",
                          lineHeight: 1,
                        }}
                      >
                        {projectedAnnualNet >= 0 ? "+" : ""}{fmt$(projectedAnnualNet)}
                      </p>
                      <p
                        style={{
                          color: "rgba(15,28,40,0.45)",
                          fontSize: "12px",
                          marginTop: "8px",
                          fontFamily: "var(--font-dm-sans)",
                        }}
                      >
                        projected net · avg {fmt$(avgMonthlyNet!)} / mo
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p
                        style={{
                          color: "rgba(15,28,40,0.22)",
                          fontSize: "11px",
                          fontFamily: "var(--font-dm-sans)",
                        }}
                      >
                        Based on {activeMonthsYTD} month{activeMonthsYTD > 1 ? "s" : ""} of data
                      </p>
                    </div>
                  </div>
                )}

                {/* Income chart in a white card */}
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(15,28,40,0.07)",
                    borderRadius: "20px",
                    padding: "24px",
                    marginBottom: "16px",
                    boxShadow: "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)",
                  }}
                >
                  <p
                    style={{
                      color: "rgba(15,28,40,0.22)",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.10em",
                      marginBottom: "16px",
                      fontFamily: "var(--font-dm-sans)",
                      fontWeight: 600,
                    }}
                  >
                    6-Month Overview
                  </p>
                  <IncomeChart history={history} />
                </div>

                {/* 12-month table in a white card */}
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(15,28,40,0.07)",
                    borderRadius: "20px",
                    padding: "24px",
                    marginBottom: "16px",
                    boxShadow: "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)",
                  }}
                >
                  <FinancialTable
                    history={history}
                    currentMonth={dashboard.currentMonth}
                    currentYear={dashboard.currentYear}
                  />
                </div>

                {/* Divider between properties */}
                {multiProperty && idx < dashboard.properties.length - 1 && (
                  <div
                    style={{
                      height: "1px",
                      background: "rgba(15,28,40,0.07)",
                      margin: "40px 0",
                    }}
                  />
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
        borderRadius: "12px",
        padding: "16px 14px",
        boxShadow: "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)",
      }}
    >
      <p
        style={{
          fontSize: "11px",
          fontFamily: "var(--font-dm-sans)",
          color: "rgba(15,28,40,0.22)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: "8px",
          fontWeight: 600,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "clamp(22px, 4vw, 32px)",
          fontWeight: 600,
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
