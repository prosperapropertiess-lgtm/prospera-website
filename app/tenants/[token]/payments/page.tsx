import { notFound } from "next/navigation";
import Link from "next/link";
import {
  validateTenantToken,
  getTenantInfo,
  getTenantRentHistory,
} from "@/lib/tenant-data";
import TenantHeader from "@/components/tenants/TenantHeader";
import { TenantMobileNav } from "@/components/tenants/TenantMobileNav";

// Design tokens
const BG = "#F5F4F1";
const CARD = "#FFFFFF";
const CARD_BORDER = "rgba(15,28,40,0.07)";
const CARD_SHADOW = "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)";
const NAVY = "#0F1C28";
const MUTED = "rgba(15,28,40,0.45)";
const SUBTLE = "rgba(15,28,40,0.22)";
const BURGUNDY = "#8B2030";
const GREEN = "#0A7A52";
const GREEN_BG = "rgba(10,122,82,0.09)";
const AMBER = "#B45309";
const AMBER_BG = "rgba(180,83,9,0.09)";
const RED = "#B91C1C";
const RED_BG = "rgba(185,28,28,0.08)";
const RADIUS = "20px";
const RADIUS_SM = "12px";

interface Props {
  params: Promise<{ token: string }>;
}

export const revalidate = 21600;

function fmt$(n: number) {
  return "$" + n.toLocaleString("en-CA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function getStatusStyle(status: string): { color: string; bg: string; label: string; leftBorder: string } {
  const s = status.toLowerCase();
  if (s === "paid") return { color: GREEN, bg: GREEN_BG, label: "Paid", leftBorder: GREEN };
  if (s === "overdue" || s === "unpaid") return { color: RED, bg: RED_BG, label: s === "overdue" ? "Overdue" : "Unpaid", leftBorder: RED };
  if (s === "partial") return { color: AMBER, bg: AMBER_BG, label: "Partial", leftBorder: AMBER };
  if (s === "late") return { color: RED, bg: RED_BG, label: "Late", leftBorder: RED };
  return { color: MUTED, bg: "rgba(15,28,40,0.05)", label: status, leftBorder: SUBTLE };
}

export default async function PaymentsPage({ params }: Props) {
  const { token } = await params;

  const access = await validateTenantToken(token);
  if (!access) return notFound();

  const [tenant, rentHistory] = await Promise.all([
    getTenantInfo(access.notion_tenant_id),
    getTenantRentHistory(access.notion_tenant_id),
  ]);

  if (!tenant) return notFound();

  const firstName = tenant.name.split(" ")[0];

  const currentYear = new Date().getFullYear();
  const ytd = rentHistory.filter(e => e.year === currentYear);
  const totalPaidYTD = ytd.reduce((s, e) => s + (e.amountPaid ?? 0), 0);
  const totalDueYTD = ytd.reduce((s, e) => s + (e.amountDue ?? 0), 0);
  const balance = totalDueYTD - totalPaidYTD;

  const recent12 = [...rentHistory].slice(0, 12);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
      />

      <div style={{ minHeight: "100vh", background: BG }}>
        <TenantHeader firstName={firstName} token={token} />

        <main style={{ maxWidth: "860px", margin: "0 auto", padding: "48px 24px 120px" }}>

          <Link
            href={`/tenants/${token}`}
            style={{ color: MUTED, fontSize: "13px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "28px", fontFamily: "var(--font-dm-sans)" }}
          >
            ← Home
          </Link>

          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(40px, 6vw, 60px)",
              fontWeight: 300,
              color: NAVY,
              letterSpacing: "-0.02em",
              marginBottom: "32px",
            }}
          >
            Rent History
          </h1>

          {/* YTD summary strip */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
              marginBottom: "32px",
            }}
          >
            <StatCard label="Paid YTD" value={fmt$(totalPaidYTD)} color={GREEN} />
            <StatCard label="Due YTD" value={fmt$(totalDueYTD)} color={NAVY} />
            <StatCard
              label="Balance"
              value={fmt$(Math.abs(balance))}
              color={balance > 0 ? RED : GREEN}
              prefix={balance > 0 ? "Owed" : "Clear"}
            />
          </div>

          {/* Payment list */}
          {recent12.length === 0 ? (
            <div
              style={{
                background: CARD,
                border: `1px solid ${CARD_BORDER}`,
                borderRadius: RADIUS,
                boxShadow: CARD_SHADOW,
                padding: "60px 24px",
                textAlign: "center",
              }}
            >
              <p style={{ color: MUTED, fontSize: "14px", fontFamily: "var(--font-dm-sans)" }}>
                No payment records yet.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {recent12.map((entry) => {
                const st = getStatusStyle(entry.paymentStatus);
                return (
                  <div
                    key={entry.id}
                    style={{
                      background: CARD,
                      border: `1px solid ${CARD_BORDER}`,
                      borderRadius: RADIUS_SM,
                      boxShadow: CARD_SHADOW,
                      borderLeft: `3px solid ${st.leftBorder}`,
                      padding: "18px 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
                        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "15px", fontWeight: 600, color: NAVY }}>
                          {entry.month} {entry.year}
                        </p>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 10px",
                            borderRadius: "100px",
                            fontSize: "11px",
                            fontWeight: 600,
                            fontFamily: "var(--font-dm-sans)",
                            background: st.bg,
                            color: st.color,
                          }}
                        >
                          {st.label}
                        </span>
                      </div>
                      {entry.datePaid && (
                        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: MUTED }}>
                          Paid {new Date(entry.datePaid).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      )}
                    </div>

                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      {entry.amountDue != null && (
                        <p
                          style={{
                            fontFamily: "var(--font-cormorant)",
                            fontSize: "28px",
                            fontWeight: 400,
                            color: NAVY,
                            lineHeight: 1,
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {fmt$(entry.amountDue)}
                        </p>
                      )}
                      {entry.amountPaid != null && entry.amountPaid !== entry.amountDue && (
                        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: GREEN, marginTop: "2px" }}>
                          Paid: {fmt$(entry.amountPaid)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </main>

        <TenantMobileNav token={token} />
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  color,
  prefix,
}: {
  label: string;
  value: string;
  color: string;
  prefix?: string;
}) {
  return (
    <div
      style={{
        background: CARD,
        border: `1px solid ${CARD_BORDER}`,
        borderRadius: RADIUS_SM,
        boxShadow: CARD_SHADOW,
        padding: "18px",
      }}
    >
      <p
        style={{
          fontSize: "11px",
          fontFamily: "var(--font-dm-sans)",
          color: MUTED,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: "6px",
        }}
      >
        {label}
      </p>
      {prefix && (
        <p style={{ fontSize: "10px", fontFamily: "var(--font-dm-sans)", color: color, marginBottom: "1px", fontWeight: 600 }}>
          {prefix}
        </p>
      )}
      <p
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "clamp(22px, 3.5vw, 30px)",
          fontWeight: 500,
          letterSpacing: "-0.02em",
          color: color,
        }}
      >
        {value}
      </p>
    </div>
  );
}
