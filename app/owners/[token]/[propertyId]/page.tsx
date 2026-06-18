import { notFound } from "next/navigation";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getDashboard } from "@/lib/owners-data";
import { MetricCard } from "@/components/owners/MetricCard";
import { IncomeChart } from "@/components/owners/IncomeChart";
import { TenantCard } from "@/components/owners/TenantCard";
import { MaintenanceList } from "@/components/owners/MaintenanceList";
import { FinancialTable } from "@/components/owners/FinancialTable";
import { ExpenseBreakdown } from "@/components/owners/ExpenseBreakdown";
import { ScrollReveal } from "@/components/owners/ScrollReveal";
import { MobileNav } from "@/components/owners/MobileNav";
import OwnerHeader from "@/components/owners/OwnerHeader";
import { PropertyFeed } from "@/components/owners/PropertyFeed";
import type { PropertyMessage } from "@/components/owners/PropertyFeed";
import { DocumentList } from "@/components/owners/DocumentList";
import type { OwnerDocument } from "@/components/owners/DocumentList";

interface Props {
  params: Promise<{ token: string; propertyId: string }>;
}

export const revalidate = 21600; // regenerate every 6 hours

function fmt$(n: number) {
  return "$" + n.toLocaleString("en-CA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function leaseCountdownFull(leaseEnd: string | null): { text: string; color: string } {
  if (!leaseEnd) return { text: "No end date on file", color: "#9AA5B1" };
  const days = Math.floor((new Date(leaseEnd).getTime() - Date.now()) / 864e5);
  if (days < 0) return { text: "Lease expired", color: "#dc2626" };
  if (days === 0) return { text: "Expires today", color: "#d97706" };
  const months = Math.floor(days / 30);
  const remaining = days % 30;
  const text = months > 0 ? `${months}mo ${remaining}d` : `${days}d`;
  const color = days <= 60 ? "#d97706" : days <= 90 ? "#d97706" : "#9AA5B1";
  return { text, color };
}

function leaseExpiryDays(leaseEnd: string | null): number | null {
  if (!leaseEnd) return null;
  return Math.floor((new Date(leaseEnd).getTime() - Date.now()) / 864e5);
}

function isPaidStatus(status: string): boolean {
  const s = status.toLowerCase().trim();
  return s === "paid" || s === "on time";
}

export default async function PropertyDetailPage({ params }: Props) {
  const { token, propertyId } = await params;

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
  const leaseDays = leaseExpiryDays(nextLeaseExpiry);
  const firstNames = record.owner_names
    .split(/\s*[&,]\s*/)
    .map((n: string) => n.trim().split(" ")[0])
    .join(" & ");

  // Month-over-month delta for hero cards
  const prevMonthSnapshot = history[history.length - 2];
  const currMonthSnapshot = history[history.length - 1];
  const rentDelta = prevMonthSnapshot?.rentCollected > 0
    ? ((currMonthSnapshot.rentCollected - prevMonthSnapshot.rentCollected) / prevMonthSnapshot.rentCollected) * 100
    : null;
  const netDelta = prevMonthSnapshot?.net !== 0
    ? ((currMonthSnapshot.net - prevMonthSnapshot.net) / Math.abs(prevMonthSnapshot.net)) * 100
    : null;

  // Month-over-month absolute deltas
  const netMoM = prevMonthSnapshot ? currMonthSnapshot.net - prevMonthSnapshot.net : null;
  const rentMoM = prevMonthSnapshot ? currMonthSnapshot.rentCollected - prevMonthSnapshot.rentCollected : null;
  const expMoM = prevMonthSnapshot ? currMonthSnapshot.expenses - prevMonthSnapshot.expenses : null;

  // Annual net projection based on active months YTD
  const currentYearHistory = history.filter(s => s.year === dashboard.currentYear);
  const activeMonthsYTD = currentYearHistory.filter(s => s.rentCollected > 0 || s.expenses > 0).length;
  const projectedAnnualNet = activeMonthsYTD > 0 ? Math.round((ytdNet / activeMonthsYTD) * 12) : null;
  const avgMonthlyNet = activeMonthsYTD > 0 ? Math.round(ytdNet / activeMonthsYTD) : null;

  // Rent collection rate
  const paidCount = rentCurrentMonth.filter(r => isPaidStatus(r.paymentStatus ?? "")).length;
  const totalCount = rentCurrentMonth.length;
  const outstandingAmount = rentCurrentMonth
    .filter(r => !isPaidStatus(r.paymentStatus ?? ""))
    .reduce((s, r) => s + (r.amountDue ?? 0), 0);
  const allPaid = totalCount > 0 && paidCount === totalCount;

  // Fetch initial documents
  const { data: initialDocuments } = await getSupabaseAdmin()
    .from("owner_documents")
    .select("id, label, category, file_name, file_size, mime_type, uploaded_at")
    .eq("property_id", property.id)
    .order("uploaded_at", { ascending: false })
    .limit(50);

  // Fetch initial messages for the feed
  const { data: initialMessages } = await getSupabaseAdmin()
    .from("property_messages")
    .select("id, author, author_name, content, message_type, created_at")
    .eq("property_id", property.id)
    .order("created_at", { ascending: true })
    .limit(50);

  // Last updated label
  const updatedLabel = dashboard.cachedAt
    ? (() => {
        const mins = Math.round((Date.now() - new Date(dashboard.cachedAt).getTime()) / 60000);
        if (mins < 60) return `Updated ${mins}m ago`;
        const hrs = Math.round(mins / 60);
        return `Updated ${hrs}h ago`;
      })()
    : null;

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
      />

      <div style={{ minHeight: "100vh", background: "#F7F5F2" }}>
        <OwnerHeader firstName={firstNames} token={token} />

        {/* Hero — structural borderBottom intentionally kept */}
        <div
          style={{
            background: "#FFFFFF",
            borderBottom: "1px solid #E8E4DF",
            padding: "36px 24px 32px",
          }}
        >
          <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
            {/* Breadcrumb */}
            <ScrollReveal distance={12}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                <Link
                  href={`/owners/${token}`}
                  style={{ color: "#9AA5B1", fontSize: "13px", textDecoration: "none" }}
                >
                  Portfolio
                </Link>
                <span className="material-symbols-outlined" style={{ fontSize: "14px", color: "#9AA5B1" }}>chevron_right</span>
                <span style={{ color: "#5A6A7A", fontSize: "13px" }}>{property.address}</span>
              </div>
            </ScrollReveal>

            <ScrollReveal distance={16}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
                <div>
                  <h1
                    style={{
                      fontFamily: "var(--font-outfit)",
                      fontSize: "clamp(24px, 4vw, 36px)",
                      fontWeight: 700,
                      color: "#1F2F3A",
                      letterSpacing: "-0.03em",
                      marginBottom: "6px",
                    }}
                  >
                    {property.address}
                  </h1>
                  <p style={{ color: "#5A6A7A", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <span>{property.city} · {property.type} · {property.status}</span>
                    {updatedLabel && (
                      <span style={{ color: "#9AA5B1", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>schedule</span>
                        {updatedLabel}
                      </span>
                    )}
                  </p>
                </div>
                {nextLeaseExpiry && (
                  <div
                    style={{
                      padding: "8px 16px",
                      borderRadius: "40px",
                      background: "#F7F5F2",
                      border: `1px solid ${leaseCd.color}`,
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
            </ScrollReveal>

            {/* 4 metric cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
              <MetricCard
                label={`${dashboard.currentMonth} Rent`}
                value={monthRentCollected}
                prefix="$"
                format="currency"
                icon="payments"
                delay={0}
                delta={rentDelta ?? undefined}
              />
              <MetricCard
                label={`${dashboard.currentMonth} Net`}
                value={monthNet}
                prefix="$"
                format="currency"
                highlight
                icon="trending_up"
                delay={80}
                delta={netDelta ?? undefined}
              />
              <MetricCard label="Open Maintenance" value={maintenanceOpen.length} icon="build" delay={160} colorClass={maintenanceOpen.length > 0 ? "#d97706" : "#16a34a"} />
              <MetricCard label="In Your Pocket" value={ytdNet} prefix="$" format="currency" icon="account_balance" delay={240} colorClass={ytdNet >= 0 ? "#16a34a" : "#dc2626"} />
            </div>
          </div>
        </div>

        <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 80px" }}>

          {/* Rent & Income */}
          <section id="financials" style={{ marginBottom: "72px" }}>
            <ScrollReveal><SectionLabel>Rent & Income</SectionLabel></ScrollReveal>

            {/* Rent status card — collection rate merged as inline status at top */}
            <div style={{ background: "#FFFFFF", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", borderRadius: "16px", padding: "20px", marginBottom: "12px" }}>
              {totalCount > 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    paddingBottom: "12px",
                    marginBottom: "14px",
                    borderBottom: "1px solid #F0EDE8",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "18px", color: allPaid ? "#16a34a" : "#d97706" }}
                  >
                    {allPaid ? "check_circle" : "pending"}
                  </span>
                  <span style={{ color: allPaid ? "#16a34a" : "#d97706", fontSize: "14px", fontWeight: 600 }}>
                    {allPaid
                      ? `All ${totalCount} tenant${totalCount > 1 ? "s" : ""} paid this month`
                      : `${paidCount} of ${totalCount} paid${outstandingAmount > 0 ? ` · ${fmt$(outstandingAmount)} outstanding` : ""}`}
                  </span>
                </div>
              )}
              <p style={{ color: "#9AA5B1", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "14px" }}>
                {dashboard.currentMonth} {dashboard.currentYear} — Rent Status
              </p>
              {rentCurrentMonth.length === 0 ? (
                <p style={{ color: "#9AA5B1", fontSize: "13px" }}>No rent entries for this month yet.</p>
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
                          background: isPaid ? "#f0fdf4" : isPartial ? "#fffbeb" : "#fef2f2",
                          borderRadius: "10px",
                        }}
                      >
                        <span style={{ color: "#1F2F3A", fontSize: "13px" }}>{r.entry}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ color: "#5A6A7A", fontSize: "13px" }}>
                            {r.amountPaid != null ? fmt$(r.amountPaid) : fmt$(r.amountDue ?? 0)}
                          </span>
                          <span
                            style={{
                              padding: "3px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 600,
                              color: isPaid ? "#16a34a" : isPartial ? "#d97706" : "#dc2626",
                              background: isPaid ? "#f0fdf4" : isPartial ? "#fffbeb" : "#fef2f2",
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

            {/* Month-over-month comparison */}
            {prevMonthSnapshot && netMoM !== null && (
              <div style={{ background: "#F7F5F2", borderRadius: "16px", padding: "20px", marginBottom: "12px" }}>
                <p style={{ color: "#9AA5B1", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px" }}>
                  {dashboard.currentMonth} vs {prevMonthSnapshot.month}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                  <MoMStat label="Net Income" current={currMonthSnapshot.net} delta={netMoM} />
                  <MoMStat label="Rent Collected" current={currMonthSnapshot.rentCollected} delta={rentMoM!} />
                  <MoMStat label="Expenses" current={currMonthSnapshot.expenses} delta={expMoM!} invert />
                </div>
              </div>
            )}

            <div style={{ background: "#FFFFFF", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", borderRadius: "16px", padding: "20px", marginBottom: "12px" }}>
              <p style={{ color: "#9AA5B1", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px" }}>
                6-Month Overview
              </p>
              <IncomeChart history={history} />
            </div>

            {/* Annual projection */}
            {projectedAnnualNet !== null && activeMonthsYTD >= 2 && (
              <div
                style={{
                  background: "#1F2F3A",
                  borderRadius: "16px",
                  padding: "24px 28px",
                  marginBottom: "12px",
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
                  <p
                    style={{
                      color: projectedAnnualNet >= 0 ? "#4ade80" : "#f87171",
                      fontFamily: "var(--font-outfit)",
                      fontSize: "clamp(28px, 5vw, 40px)",
                      fontWeight: 700,
                      letterSpacing: "-0.03em",
                      lineHeight: 1,
                    }}
                  >
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

            {/* YTD financial summary + expense breakdown side by side */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "16px",
              }}
            >
              <div
                style={{
                  background: "#FFFFFF",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                  borderRadius: "16px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <FinStat label="Collected This Year" value={fmt$(ytdRentCollected)} color="#1F2F3A" />
                <FinStat label="Expenses This Year" value={fmt$(ytdExpenses)} color="#5A6A7A" />
                <FinStat label="In Your Pocket" value={fmt$(ytdNet)} color={ytdNet >= 0 ? "#16a34a" : "#dc2626"} large />
              </div>
              <div
                style={{
                  background: "#FFFFFF",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                  borderRadius: "16px",
                  padding: "24px",
                }}
              >
                <p style={{ color: "#9AA5B1", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px" }}>
                  Where Expenses Go (YTD)
                </p>
                <ExpenseBreakdown history={history} currentYear={dashboard.currentYear} />
              </div>
            </div>
          </section>

          {/* Maintenance */}
          <section id="maintenance" style={{ marginBottom: "72px" }}>
            <ScrollReveal><SectionLabel>Property Health</SectionLabel></ScrollReveal>
            <MaintenanceList open={maintenanceOpen} completed={maintenanceCompletedRecent} />
          </section>

          {/* Tenants */}
          {tenants.length > 0 && (
            <section id="tenants" style={{ marginBottom: "72px" }}>
              <ScrollReveal><SectionLabel>Tenants</SectionLabel></ScrollReveal>

              {/* Lease expiry alert — border removed, background kept */}
              {leaseDays !== null && leaseDays <= 90 && leaseDays >= 0 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    padding: "16px 18px",
                    borderRadius: "12px",
                    background: leaseDays <= 30 ? "#fef2f2" : "#fffbeb",
                    marginBottom: "16px",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "20px", color: leaseDays <= 30 ? "#dc2626" : "#d97706", flexShrink: 0, marginTop: "1px" }}
                  >
                    warning
                  </span>
                  <div>
                    <p style={{ color: leaseDays <= 30 ? "#991b1b" : "#92400e", fontSize: "14px", fontWeight: 600, marginBottom: "2px" }}>
                      Lease expires in {leaseDays === 0 ? "today" : `${leaseDays} day${leaseDays > 1 ? "s" : ""}`}
                    </p>
                    <p style={{ color: leaseDays <= 30 ? "#dc2626" : "#d97706", fontSize: "13px" }}>
                      Renewal or vacancy planning should be underway. Contact Ebin if you have questions.
                    </p>
                  </div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "14px" }}>
                {tenants.map((t, i) => (
                  <ScrollReveal key={t.id} delay={i * 0.06}>
                    <TenantCard tenant={t} rentHistory={[]} index={i} />
                  </ScrollReveal>
                ))}
              </div>
            </section>
          )}

          {/* 12-Month Table */}
          <section style={{ marginBottom: "72px" }}>
            <ScrollReveal><SectionLabel>12-Month Summary</SectionLabel></ScrollReveal>
            <FinancialTable history={history} currentMonth={dashboard.currentMonth} currentYear={dashboard.currentYear} />
          </section>

          {/* Documents */}
          <section id="documents" style={{ marginBottom: "72px" }}>
            <ScrollReveal><SectionLabel>Documents</SectionLabel></ScrollReveal>
            <DocumentList
              propertyId={property.id}
              token={token}
              initialDocuments={(initialDocuments ?? []) as OwnerDocument[]}
            />
          </section>

          {/* Updates */}
          <section id="messages" style={{ marginBottom: "72px" }}>
            <ScrollReveal><SectionLabel>Updates & Messages</SectionLabel></ScrollReveal>
            <PropertyFeed
              propertyId={property.id}
              token={token}
              ownerName={firstNames}
              propertyAddress={property.address}
              initialMessages={(initialMessages ?? []) as PropertyMessage[]}
            />
          </section>

          {/* Manager */}
          <section>
            <ScrollReveal><SectionLabel>Your Manager</SectionLabel></ScrollReveal>
            <div style={{ background: "#FFFFFF", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", borderRadius: "20px", padding: "28px" }}>
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
                  <p style={{ color: "#1F2F3A", fontWeight: 700, fontSize: "16px", fontFamily: "var(--font-outfit)" }}>Ebin Jaison</p>
                  <p style={{ color: "#9AA5B1", fontSize: "13px" }}>Property Manager · Prospera Properties</p>
                </div>
              </div>
              <p style={{ color: "#5A6A7A", fontSize: "13px", lineHeight: "1.6", marginBottom: "20px" }}>
                Have questions about your property? Ebin is available by phone or email any time.
              </p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <a
                  href="mailto:hello@prosperaproperties.co"
                  style={{ padding: "11px 20px", borderRadius: "10px", background: "#F7F5F2", border: "1px solid #E8E4DF", color: "#1F2F3A", fontSize: "13px", fontWeight: 500, textDecoration: "none", display: "flex", alignItems: "center", gap: "7px" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "#1F2F3A" }}>mail</span>
                  hello@prosperaproperties.co
                </a>
                <a
                  href="tel:+15196971227"
                  style={{ padding: "11px 20px", borderRadius: "10px", background: "#8B2030", border: "1px solid #8B2030", color: "white", fontSize: "13px", fontWeight: 500, textDecoration: "none", display: "flex", alignItems: "center", gap: "7px" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>call</span>
                  519-697-1227
                </a>
              </div>
            </div>
          </section>
        </main>

        <MobileNav token={token} />
      </div>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", fontWeight: 600, color: "#C8BFB5", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "24px", paddingTop: "8px" }}>
      {children}
    </h2>
  );
}

function MoMStat({ label, current, delta, invert }: { label: string; current: number; delta: number; invert?: boolean }) {
  const isPositive = invert ? delta < 0 : delta > 0;
  const isNeutral = delta === 0;
  const color = isNeutral ? "#9AA5B1" : isPositive ? "#16a34a" : "#dc2626";
  const arrow = isNeutral ? "→" : delta > 0 ? "↑" : "↓";
  return (
    <div>
      <p style={{ color: "#9AA5B1", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>{label}</p>
      <p style={{ color: "#1F2F3A", fontFamily: "var(--font-outfit)", fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "3px" }}>
        ${current.toLocaleString()}
      </p>
      <p style={{ color, fontSize: "12px", fontWeight: 500 }}>
        {arrow} {isNeutral ? "same as last month" : `${delta > 0 ? "+" : ""}$${Math.abs(delta).toLocaleString()} vs last mo`}
      </p>
    </div>
  );
}

function FinStat({ label, value, color, large }: { label: string; value: string; color: string; large?: boolean }) {
  return (
    <div>
      <p style={{ color: "#9AA5B1", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>{label}</p>
      <p style={{ color, fontFamily: "var(--font-outfit)", fontSize: large ? "28px" : "20px", fontWeight: 700, letterSpacing: "-0.02em" }}>{value}</p>
    </div>
  );
}
