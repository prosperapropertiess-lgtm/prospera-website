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

function StatPill({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <p style={{ fontSize: "11px", fontFamily: "var(--font-dm-sans)", color: "#C8BFB5", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>
        {label}
      </p>
      <p style={{ fontFamily: "var(--font-outfit)", fontSize: "24px", fontWeight: 700, letterSpacing: "-0.02em", color: color ?? "#1F2F3A" }}>
        {value}
      </p>
    </div>
  );
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
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />

      <div style={{ minHeight: "100vh", background: "#F7F5F2" }}>
        <OwnerHeader firstName={firstNames} token={token} />

        <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px 100px" }}>
          <Link
            href={`/owners/${token}`}
            style={{ color: "#9AA5B1", fontSize: "13px", textDecoration: "none", display: "inline-block", marginBottom: "24px" }}
          >
            ← Back
          </Link>

          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 300,
              color: "#1F2F3A",
              letterSpacing: "-0.02em",
              marginBottom: "8px",
            }}
          >
            Financials
          </h1>

          {/* Portfolio totals when multiple properties */}
          {multiProperty && (
            <div style={{ display: "flex", gap: "40px", marginBottom: "48px", paddingBottom: "40px", borderBottom: "1px solid #E8E4DF", flexWrap: "wrap", marginTop: "32px" }}>
              <StatPill label="Total Collected" value={fmt$(dashboard.totalRentCollected)} />
              <StatPill label="Total Expenses" value={fmt$(dashboard.totalExpenses)} />
              <StatPill
                label="Total Net"
                value={fmt$(dashboard.totalNet)}
                color={dashboard.totalNet >= 0 ? "#16a34a" : "#dc2626"}
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
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#9AA5B1", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px", marginTop: idx === 0 ? "0" : "40px" }}>
                    {property.address}
                  </p>
                )}
                {!multiProperty && idx === 0 && <div style={{ marginTop: "32px" }} />}

                {/* YTD stats */}
                <div style={{ display: "flex", gap: "40px", marginBottom: "24px", flexWrap: "wrap" }}>
                  <StatPill label="Collected" value={fmt$(ytdRentCollected)} />
                  <StatPill label="Expenses" value={fmt$(ytdExpenses)} />
                  <StatPill
                    label="Net"
                    value={fmt$(ytdNet)}
                    color={ytdNet >= 0 ? "#16a34a" : "#dc2626"}
                  />
                </div>

                {/* Income chart */}
                <div style={{ background: "#FFFFFF", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: "24px", marginBottom: "16px" }}>
                  <p style={{ color: "#9AA5B1", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px" }}>
                    6-Month Overview
                  </p>
                  <IncomeChart history={history} />
                </div>

                {/* Annual projection */}
                {projectedAnnualNet !== null && (
                  <div
                    style={{
                      background: "#1F2F3A",
                      borderRadius: "16px",
                      padding: "24px 28px",
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <p style={{ color: "rgba(250,248,245,0.45)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
                        Annual Projection · {dashboard.currentYear}
                      </p>
                      <p style={{ color: projectedAnnualNet >= 0 ? "#4ade80" : "#f87171", fontFamily: "var(--font-outfit)", fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1 }}>
                        {projectedAnnualNet >= 0 ? "+" : ""}{fmt$(projectedAnnualNet)}
                      </p>
                      <p style={{ color: "rgba(250,248,245,0.35)", fontSize: "12px", marginTop: "6px" }}>
                        projected net this year · avg {fmt$(avgMonthlyNet!)} / mo
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ color: "rgba(250,248,245,0.25)", fontSize: "11px" }}>
                        Based on {activeMonthsYTD} month{activeMonthsYTD > 1 ? "s" : ""} of data
                      </p>
                    </div>
                  </div>
                )}

                {/* 12-month table */}
                <div style={{ background: "#FFFFFF", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: "24px", marginBottom: "16px" }}>
                  <FinancialTable history={history} currentMonth={dashboard.currentMonth} currentYear={dashboard.currentYear} />
                </div>

                {/* Divider between properties */}
                {multiProperty && idx < dashboard.properties.length - 1 && (
                  <div style={{ height: "1px", background: "#E8E4DF", margin: "40px 0" }} />
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
