import { notFound } from "next/navigation";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getDashboard } from "@/lib/owners-data";
import { MetricCard } from "@/components/owners/MetricCard";
import { IncomeChart } from "@/components/owners/IncomeChart";
import { TenantCard } from "@/components/owners/TenantCard";
import { MaintenanceList } from "@/components/owners/MaintenanceList";
import { FinancialTable } from "@/components/owners/FinancialTable";
import { UtilityChart } from "@/components/owners/UtilityChart";
import OwnerHeader from "@/components/owners/OwnerHeader";

interface Props {
  params: Promise<{ token: string; propertyId: string }>;
}

export const dynamic = "force-dynamic";

function fmt$(n: number) {
  return "$" + n.toLocaleString("en-CA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function leaseCountdownFull(leaseEnd: string | null): { text: string; color: string } {
  if (!leaseEnd) return { text: "No end date on file", color: "rgba(255,255,255,0.3)" };
  const days = Math.floor((new Date(leaseEnd).getTime() - Date.now()) / 864e5);
  if (days < 0) return { text: "Lease expired", color: "#ef4444" };
  if (days === 0) return { text: "Expires today", color: "#f59e0b" };
  const months = Math.floor(days / 30);
  const remaining = days % 30;
  const text = months > 0 ? `${months}mo ${remaining}d` : `${days}d`;
  const color = days <= 60 ? "#f59e0b" : days <= 90 ? "#fbbf24" : "rgba(255,255,255,0.5)";
  return { text, color };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { token, propertyId } = await params;

  // Token is the auth
  const sb = getSupabaseAdmin();
  const { data: record } = await sb
    .from("owner_access")
    .select("notion_owner_ids, owner_names")
    .eq("token", token)
    .single();

  if (!record) return notFound();

  let dashboard;
  let isStale = false;
  try {
    ({ dashboard, isStale } = await getDashboard(token, record.notion_owner_ids, record.owner_names));
  } catch {
    return notFound();
  }

  const propertyData = dashboard.properties.find(p => p.property.id === propertyId);
  if (!propertyData) return notFound();

  const {
    property, tenants, rentCurrentMonth, maintenanceOpen,
    maintenanceCompletedRecent, expensesCurrentMonth, history,
    ytdRentCollected, ytdExpenses, ytdNet, nextLeaseExpiry,
  } = propertyData;

  const monthRentCollected = rentCurrentMonth.reduce((s, r) => {
    const st = (r.paymentStatus ?? "").toLowerCase();
    return s + (r.amountPaid ?? ((st === "paid" || st === "on time" || st === "partial") ? (r.amountDue ?? 0) : 0));
  }, 0);
  const monthExpenses = expensesCurrentMonth.reduce((s, e) => s + (e.amount ?? 0), 0);
  const monthNet = monthRentCollected - monthExpenses;
  const leaseCd = leaseCountdownFull(nextLeaseExpiry);
  const firstNames = record.owner_names
    .split(/\s*[&,]\s*/)
    .map((n: string) => n.trim().split(" ")[0])
    .join(" & ");

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
      />

      <div style={{ minHeight: "100vh" }}>
        <OwnerHeader firstName={firstNames} token={token} />

        {/* Hero */}
        <div
          style={{
            background: "linear-gradient(180deg, rgba(139,32,48,0.15) 0%, transparent 100%)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            padding: "36px 24px 32px",
          }}
        >
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <Link href={`/owners/${token}`} style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px", textDecoration: "none" }}>
                Portfolio
              </Link>
              <span className="material-symbols-outlined" style={{ fontSize: "14px", color: "rgba(255,255,255,0.2)" }}>chevron_right</span>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>{property.address}</span>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
              <div>
                <h1
                  style={{
                    fontFamily: "var(--font-outfit)",
                    fontSize: "clamp(24px, 4vw, 36px)",
                    fontWeight: 700,
                    color: "white",
                    letterSpacing: "-0.03em",
                    marginBottom: "6px",
                  }}
                >
                  {property.address}
                </h1>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>
                  {property.city} · {property.type} · {property.status}
                  {isStale && (
                    <span style={{ color: "rgba(245,158,11,0.7)", marginLeft: "10px", fontSize: "12px" }}>⚠ Cached data</span>
                  )}
                </p>
              </div>
              {nextLeaseExpiry && (
                <div
                  style={{
                    padding: "8px 16px",
                    borderRadius: "40px",
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${leaseCd.color}40`,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "14px", color: leaseCd.color }}>schedule</span>
                  <span style={{ color: leaseCd.color, fontSize: "13px", fontWeight: 500 }}>
                    {leaseCd.text} on lease
                  </span>
                </div>
              )}
            </div>

            {/* 4 metric cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
              <MetricCard label={`${dashboard.currentMonth} Rent`} value={monthRentCollected} prefix="$" format="currency" icon="payments" delay={0} />
              <MetricCard label={`${dashboard.currentMonth} Net`} value={monthNet} prefix="$" format="currency" highlight icon="trending_up" delay={80} />
              <MetricCard label="Open Maintenance" value={maintenanceOpen.length} icon="build" delay={160} colorClass={maintenanceOpen.length > 0 ? "#fbbf24" : "#22c55e"} />
              <MetricCard label="YTD Net to You" value={ytdNet} prefix="$" format="currency" icon="account_balance" delay={240} colorClass={ytdNet >= 0 ? "#86efac" : "#ef4444"} />
            </div>
          </div>
        </div>

        <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 80px" }}>

          {/* Rent & Income */}
          <section style={{ marginBottom: "48px" }}>
            <SectionLabel>Rent & Income</SectionLabel>

            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "20px", marginBottom: "20px" }}>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "14px" }}>
                {dashboard.currentMonth} {dashboard.currentYear} — Rent Status
              </p>
              {rentCurrentMonth.length === 0 ? (
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>No rent entries for this month yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {rentCurrentMonth.map(r => {
                    const s = (r.paymentStatus ?? "").toLowerCase();
                    const isPaid = s === "paid" || s === "on time";
                    const isPartial = s === "partial";
                    return (
                      <div
                        key={r.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "10px 14px",
                          background: isPaid ? "rgba(34,197,94,0.06)" : isPartial ? "rgba(245,158,11,0.06)" : "rgba(239,68,68,0.06)",
                          borderRadius: "10px",
                          border: `1px solid ${isPaid ? "rgba(34,197,94,0.15)" : isPartial ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)"}`,
                        }}
                      >
                        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>{r.entry}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>
                            {r.amountPaid != null ? fmt$(r.amountPaid) : fmt$(r.amountDue ?? 0)}
                          </span>
                          <span
                            style={{
                              padding: "3px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 600,
                              color: isPaid ? "#22c55e" : isPartial ? "#f59e0b" : "#ef4444",
                              background: isPaid ? "rgba(34,197,94,0.1)" : isPartial ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
                            }}
                          >
                            {r.paymentStatus}
                            {r.datePaid ? ` · ${new Date(r.datePaid).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}` : ""}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "20px", marginBottom: "20px" }}>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px" }}>
                6-Month Overview
              </p>
              <IncomeChart history={history} />
            </div>

            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(96,165,250,0.15)", borderRadius: "16px", padding: "20px", marginBottom: "20px" }}>
              <p style={{ color: "rgba(96,165,250,0.7)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px" }}>
                Utility Costs — 12 Months
              </p>
              <UtilityChart history={history} />
            </div>

            <div
              style={{
                background: "linear-gradient(135deg, #141b2c, #0f1624)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px",
                padding: "24px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "20px",
              }}
            >
              <FinStat label="YTD Rent Collected" value={fmt$(ytdRentCollected)} color="white" />
              <FinStat label="YTD Expenses" value={fmt$(ytdExpenses)} color="rgba(255,255,255,0.5)" />
              <FinStat label="YTD Net to You" value={fmt$(ytdNet)} color={ytdNet >= 0 ? "#86efac" : "#ef4444"} large />
            </div>
          </section>

          {/* Maintenance */}
          <section style={{ marginBottom: "48px" }}>
            <SectionLabel>Property Health</SectionLabel>
            <MaintenanceList open={maintenanceOpen} completed={maintenanceCompletedRecent} />
          </section>

          {/* Tenants */}
          {tenants.length > 0 && (
            <section style={{ marginBottom: "48px" }}>
              <SectionLabel>Tenants</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "14px" }}>
                {tenants.map((t, i) => (
                  <TenantCard key={t.id} tenant={t} rentHistory={[]} index={i} />
                ))}
              </div>
            </section>
          )}

          {/* 12-Month Table */}
          <section style={{ marginBottom: "48px" }}>
            <SectionLabel>12-Month Summary</SectionLabel>
            <FinancialTable history={history} currentMonth={dashboard.currentMonth} currentYear={dashboard.currentYear} />
          </section>

          {/* Manager */}
          <section>
            <SectionLabel>Your Manager</SectionLabel>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #8B2030, #a02540)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ color: "white", fontFamily: "var(--font-outfit)", fontWeight: 700, fontSize: "22px" }}>E</span>
                </div>
                <div>
                  <p style={{ color: "white", fontWeight: 700, fontSize: "16px", fontFamily: "var(--font-outfit)" }}>Ebin Jaison</p>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>Property Manager · Prospera Properties</p>
                </div>
              </div>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", lineHeight: "1.6", marginBottom: "20px" }}>
                Have questions about your property? Ebin is available by phone or email any time.
              </p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <a
                  href="mailto:hello@prosperaproperties.co"
                  style={{ padding: "11px 20px", borderRadius: "10px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "white", fontSize: "13px", fontWeight: 500, textDecoration: "none", display: "flex", alignItems: "center", gap: "7px" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>mail</span>
                  hello@prosperaproperties.co
                </a>
                <a
                  href="tel:+15196971227"
                  style={{ padding: "11px 20px", borderRadius: "10px", background: "linear-gradient(135deg, rgba(139,32,48,0.4), rgba(139,32,48,0.2))", border: "1px solid rgba(139,32,48,0.4)", color: "white", fontSize: "13px", fontWeight: 500, textDecoration: "none", display: "flex", alignItems: "center", gap: "7px" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>call</span>
                  519-697-1227
                </a>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: "var(--font-outfit)", fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px" }}>
      {children}
    </h2>
  );
}

function FinStat({ label, value, color, large }: { label: string; value: string; color: string; large?: boolean }) {
  return (
    <div>
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>{label}</p>
      <p style={{ color, fontFamily: "var(--font-outfit)", fontSize: large ? "28px" : "20px", fontWeight: 700, letterSpacing: "-0.02em" }}>{value}</p>
    </div>
  );
}
