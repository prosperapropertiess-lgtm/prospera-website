import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  return {
    manifest: `/tenants/${token}/manifest.json`,
  };
}
import {
  validateTenantToken,
  getTenantInfo,
  getTenantRentHistory,
  getPropertySchedule,
} from "@/lib/tenant-data";
import TenantHeader from "@/components/tenants/TenantHeader";
import { TenantMobileNav } from "@/components/tenants/TenantMobileNav";

const PAGE_BG = "#090E17";
const CARD = "#0D1825";
const CARD_BORDER = "rgba(255,255,255,0.07)";
const TEXT = "#EDE8E1";
const TEXT_SEC = "rgba(237,232,225,0.42)";
const GREEN = "#34d399";
const RED = "#f87171";
const AMBER = "#fbbf24";
const BLUE = "#60a5fa";
const PURPLE = "#a78bfa";
const PINK = "#f472b6";

interface Props {
  params: Promise<{ token: string }>;
}

export const revalidate = 21600;

function fmt$(n: number) {
  return "$" + n.toLocaleString("en-CA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function leaseCountdownColor(daysLeft: number): string {
  if (daysLeft <= 30) return RED;
  if (daysLeft <= 90) return AMBER;
  return GREEN;
}

export default async function TenantHomePage({ params }: Props) {
  const { token } = await params;

  const access = await validateTenantToken(token);
  if (!access) return notFound();

  const [tenant, rentHistory, upcoming] = await Promise.all([
    getTenantInfo(access.notion_tenant_id),
    getTenantRentHistory(access.notion_tenant_id),
    getPropertySchedule(access.property_id),
  ]);

  if (!tenant) return notFound();

  const firstName = tenant.name.split(" ")[0];

  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-CA", { month: "long", year: "numeric" });

  // Current month rent status — most recent entry
  const currentRent = rentHistory[0] ?? null;

  // Lease countdown
  let daysLeft: number | null = null;
  if (tenant.leaseEnd) {
    const leaseEndDate = new Date(tenant.leaseEnd);
    daysLeft = Math.ceil((leaseEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Upcoming events (future only, sorted)
  const futureEvents = upcoming.filter(e => {
    if (!e.event_date) return false;
    return new Date(e.event_date) >= now;
  });

  const rentStatusColor = () => {
    if (!currentRent) return TEXT_SEC;
    const s = currentRent.paymentStatus.toLowerCase();
    if (s === "paid") return GREEN;
    if (s === "overdue") return RED;
    return AMBER;
  };

  const rentStatusLabel = () => {
    if (!currentRent) return "No data";
    const s = currentRent.paymentStatus.toLowerCase();
    if (s === "paid") return "Paid";
    if (s === "overdue") return "Overdue";
    return "Due";
  };

  const quickCards = [
    {
      icon: "build",
      label: "Maintenance",
      subtitle: "Submit a request",
      href: `/tenants/${token}/maintenance`,
      iconColor: AMBER,
      chipBg: "rgba(251,191,36,0.12)",
    },
    {
      icon: "folder",
      label: "Documents",
      subtitle: "Lease & reports",
      href: `/tenants/${token}/documents`,
      iconColor: BLUE,
      chipBg: "rgba(96,165,250,0.12)",
    },
    {
      icon: "chat",
      label: "Messages",
      subtitle: "Talk to Ebin & Laura",
      href: `/tenants/${token}/messages`,
      iconColor: PINK,
      chipBg: "rgba(244,114,182,0.12)",
    },
    {
      icon: "event",
      label: "Schedule",
      subtitle: futureEvents.length > 0
        ? `${futureEvents.length} upcoming`
        : "Nothing upcoming",
      href: `/tenants/${token}/schedule`,
      iconColor: PURPLE,
      chipBg: "rgba(167,139,250,0.12)",
    },
  ];

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
      />

      <div style={{ minHeight: "100vh", background: PAGE_BG }}>
        <TenantHeader firstName={firstName} token={token} />

        <main style={{ maxWidth: "860px", margin: "0 auto", padding: "56px 24px 120px" }}>

          {/* Greeting */}
          <div style={{ marginBottom: "40px" }}>
            {/* Date pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "100px",
                padding: "4px 12px 4px 4px",
                marginBottom: "20px",
              }}
            >
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: GREEN, flexShrink: 0, marginLeft: "4px" }} />
              <span style={{ color: TEXT_SEC, fontSize: "12px", fontFamily: "var(--font-dm-sans)" }}>
                {dateLabel}
              </span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(52px, 7vw, 72px)",
                fontWeight: 300,
                color: TEXT,
                letterSpacing: "-0.02em",
                lineHeight: 1.0,
                marginBottom: "8px",
              }}
            >
              Hi {firstName}.
            </h1>
            <p style={{ color: TEXT_SEC, fontSize: "14px", fontFamily: "var(--font-dm-sans)" }}>
              {tenant.propertyAddress}{tenant.propertyCity ? `, ${tenant.propertyCity}` : ""}
            </p>
          </div>

          {/* Rent status card */}
          <div
            style={{
              background: CARD,
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: "22px",
              padding: "28px",
              marginBottom: "24px",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                fontFamily: "var(--font-dm-sans)",
                color: TEXT_SEC,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "16px",
              }}
            >
              Rent — {currentRent ? `${currentRent.month} ${currentRent.year}` : "Current Month"}
            </p>

            {currentRent ? (
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: `${rentStatusColor()}18`,
                      border: `1px solid ${rentStatusColor()}40`,
                      borderRadius: "100px",
                      padding: "5px 14px",
                      marginBottom: "12px",
                    }}
                  >
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: rentStatusColor() }} />
                    <span style={{ color: rentStatusColor(), fontSize: "13px", fontWeight: 600, fontFamily: "var(--font-dm-sans)" }}>
                      {rentStatusLabel()}
                    </span>
                  </div>
                  {currentRent.amountDue != null && (
                    <p style={{ color: TEXT_SEC, fontSize: "13px", fontFamily: "var(--font-dm-sans)" }}>
                      Amount due: <span style={{ color: TEXT }}>{fmt$(currentRent.amountDue)}</span>
                    </p>
                  )}
                  {currentRent.amountPaid != null && (
                    <p style={{ color: TEXT_SEC, fontSize: "13px", fontFamily: "var(--font-dm-sans)", marginTop: "4px" }}>
                      Amount paid: <span style={{ color: GREEN }}>{fmt$(currentRent.amountPaid)}</span>
                    </p>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  {currentRent.datePaid && (
                    <p style={{ color: TEXT_SEC, fontSize: "13px", fontFamily: "var(--font-dm-sans)" }}>
                      Paid on {new Date(currentRent.datePaid).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}
                    </p>
                  )}
                  <Link
                    href={`/tenants/${token}/payments`}
                    style={{ color: TEXT_SEC, fontSize: "12px", fontFamily: "var(--font-dm-sans)", textDecoration: "none", display: "inline-block", marginTop: "8px" }}
                  >
                    View all payments →
                  </Link>
                </div>
              </div>
            ) : (
              <p style={{ color: TEXT_SEC, fontSize: "14px", fontFamily: "var(--font-dm-sans)" }}>
                No payment records yet.
              </p>
            )}
          </div>

          {/* Quick access cards — 2×2 grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            {quickCards.map((card) => (
              <Link key={card.label} href={card.href} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    background: CARD,
                    border: `1px solid ${CARD_BORDER}`,
                    borderRadius: "22px",
                    padding: "24px",
                    minHeight: "130px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "12px",
                      background: card.chipBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "20px", color: card.iconColor }}
                    >
                      {card.icon}
                    </span>
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--font-outfit)",
                        fontSize: "17px",
                        fontWeight: 600,
                        color: TEXT,
                        letterSpacing: "-0.01em",
                        marginBottom: "4px",
                      }}
                    >
                      {card.label}
                    </p>
                    <p style={{ fontSize: "13px", fontFamily: "var(--font-dm-sans)", color: TEXT_SEC }}>
                      {card.subtitle}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Lease countdown strip */}
          {daysLeft !== null && (
            <div
              style={{
                background: CARD,
                border: `1px solid ${CARD_BORDER}`,
                borderRadius: "14px",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "18px", color: leaseCountdownColor(daysLeft), flexShrink: 0 }}
              >
                contract
              </span>
              <p style={{ fontSize: "13px", fontFamily: "var(--font-dm-sans)", color: TEXT_SEC }}>
                Lease ends{" "}
                <span style={{ color: TEXT }}>
                  {new Date(tenant.leaseEnd!).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" })}
                </span>
                {" · "}
                <span style={{ color: leaseCountdownColor(daysLeft), fontWeight: 600 }}>
                  {daysLeft > 0 ? `${daysLeft} days remaining` : "Expired"}
                </span>
              </p>
            </div>
          )}

        </main>

        <TenantMobileNav token={token} />
      </div>
    </>
  );
}
