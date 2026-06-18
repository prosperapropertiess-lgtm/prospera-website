import { notFound } from "next/navigation";
import Link from "next/link";
import {
  validateTenantToken,
  getTenantInfo,
  getTenantRentHistory,
} from "@/lib/tenant-data";
import TenantHeader from "@/components/tenants/TenantHeader";
import { TenantMobileNav } from "@/components/tenants/TenantMobileNav";

const PAGE_BG = "#090E17";
const CARD = "#0D1825";
const CARD_BORDER = "rgba(255,255,255,0.07)";
const DIVIDER = "rgba(255,255,255,0.05)";
const TEXT = "#EDE8E1";
const TEXT_SEC = "rgba(237,232,225,0.42)";
const TEXT_DIM = "rgba(237,232,225,0.20)";
const GREEN = "#34d399";
const RED = "#f87171";
const AMBER = "#fbbf24";

interface Props {
  params: Promise<{ token: string }>;
}

export const revalidate = 21600;

function fmt$(n: number) {
  return "$" + n.toLocaleString("en-CA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function statusColor(status: string): string {
  const s = status.toLowerCase();
  if (s === "paid") return GREEN;
  if (s === "overdue" || s === "unpaid") return RED;
  return AMBER;
}

function statusLabel(status: string): string {
  const s = status.toLowerCase();
  if (s === "paid") return "Paid";
  if (s === "overdue") return "Overdue";
  if (s === "unpaid") return "Unpaid";
  if (s === "partial") return "Partial";
  if (s === "late") return "Late";
  return status;
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

      <div style={{ minHeight: "100vh", background: PAGE_BG }}>
        <TenantHeader firstName={firstName} token={token} />

        <main style={{ maxWidth: "860px", margin: "0 auto", padding: "56px 24px 120px" }}>

          <Link
            href={`/tenants/${token}`}
            style={{ color: TEXT_SEC, fontSize: "13px", textDecoration: "none", display: "inline-block", marginBottom: "24px" }}
          >
            ← Home
          </Link>

          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(40px, 6vw, 58px)",
              fontWeight: 300,
              color: TEXT,
              letterSpacing: "-0.02em",
              marginBottom: "32px",
            }}
          >
            Payments
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
            <StatPill label="Paid YTD" value={fmt$(totalPaidYTD)} color={GREEN} />
            <StatPill label="Due YTD" value={fmt$(totalDueYTD)} color={TEXT} />
            <StatPill
              label="Balance"
              value={fmt$(Math.abs(balance))}
              color={balance > 0 ? RED : GREEN}
              prefix={balance > 0 ? "Owed" : "Clear"}
            />
          </div>

          {/* Payment table */}
          <div
            style={{
              background: CARD,
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: "22px",
              overflow: "hidden",
            }}
          >
            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr 80px 80px",
                padding: "14px 20px",
                borderBottom: `1px solid ${DIVIDER}`,
              }}
            >
              {["Month", "Amount Due", "Amount Paid", "Date Paid", "Status", "Receipt"].map((col) => (
                <span
                  key={col}
                  style={{
                    fontSize: "11px",
                    fontFamily: "var(--font-dm-sans)",
                    color: TEXT_DIM,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {col}
                </span>
              ))}
            </div>

            {recent12.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <p style={{ color: TEXT_SEC, fontSize: "14px", fontFamily: "var(--font-dm-sans)" }}>
                  No payment records yet.
                </p>
              </div>
            ) : (
              recent12.map((entry, idx) => (
                <div
                  key={entry.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr 80px 80px",
                    padding: "16px 20px",
                    borderBottom: idx < recent12.length - 1 ? `1px solid ${DIVIDER}` : "none",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: TEXT }}>
                    {entry.month} {entry.year}
                  </span>
                  <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: TEXT_SEC }}>
                    {entry.amountDue != null ? fmt$(entry.amountDue) : "—"}
                  </span>
                  <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: entry.amountPaid != null ? GREEN : TEXT_SEC }}>
                    {entry.amountPaid != null ? fmt$(entry.amountPaid) : "—"}
                  </span>
                  <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: TEXT_SEC }}>
                    {entry.datePaid
                      ? new Date(entry.datePaid).toLocaleDateString("en-CA", { month: "short", day: "numeric" })
                      : "—"}
                  </span>
                  <div>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        borderRadius: "100px",
                        fontSize: "11px",
                        fontWeight: 600,
                        fontFamily: "var(--font-dm-sans)",
                        background: `${statusColor(entry.paymentStatus)}18`,
                        color: statusColor(entry.paymentStatus),
                        border: `1px solid ${statusColor(entry.paymentStatus)}30`,
                      }}
                    >
                      {statusLabel(entry.paymentStatus)}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: TEXT_DIM, fontSize: "13px", fontFamily: "var(--font-dm-sans)" }}>—</span>
                  </div>
                </div>
              ))
            )}
          </div>

        </main>

        <TenantMobileNav token={token} />
      </div>
    </>
  );
}

function StatPill({
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
        borderRadius: "20px",
        padding: "20px",
      }}
    >
      <p
        style={{
          fontSize: "11px",
          fontFamily: "var(--font-dm-sans)",
          color: TEXT_SEC,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: "8px",
        }}
      >
        {label}
      </p>
      {prefix && (
        <p style={{ fontSize: "10px", fontFamily: "var(--font-dm-sans)", color: color, marginBottom: "2px" }}>
          {prefix}
        </p>
      )}
      <p
        style={{
          fontFamily: "var(--font-outfit)",
          fontSize: "clamp(22px, 3.5vw, 30px)",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          color: color,
        }}
      >
        {value}
      </p>
    </div>
  );
}
