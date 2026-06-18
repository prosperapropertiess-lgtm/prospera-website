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

// Design tokens
const BG = "#F5F4F1";
const CARD = "#FFFFFF";
const CARD_BORDER = "rgba(15,28,40,0.07)";
const CARD_SHADOW = "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)";
const NAVY = "#0F1C28";
const MUTED = "rgba(15,28,40,0.45)";
const SUBTLE = "rgba(15,28,40,0.22)";
const BURGUNDY = "#8B2030";
const GOLD = "#B8922A";
const GOLD_BG = "rgba(184,146,42,0.09)";
const GREEN = "#0A7A52";
const GREEN_BG = "rgba(10,122,82,0.09)";
const AMBER = "#B45309";
const AMBER_BG = "rgba(180,83,9,0.09)";
const RED = "#B91C1C";
const RED_BG = "rgba(185,28,28,0.08)";
const BLUE = "#1D4ED8";
const BLUE_BG = "rgba(29,78,216,0.08)";
const RADIUS = "20px";
const RADIUS_SM = "12px";

interface Props {
  params: Promise<{ token: string }>;
}

export const revalidate = 21600;

function fmt$(n: number) {
  return "$" + n.toLocaleString("en-CA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
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
  const dateLabel = now.toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" });

  // Current month rent status — most recent entry
  const currentRent = rentHistory[0] ?? null;

  // Upcoming events (future only, sorted)
  const futureEvents = upcoming.filter(e => {
    if (!e.event_date) return false;
    return new Date(e.event_date) >= now;
  });

  const nextEvent = futureEvents.length > 0 ? futureEvents[0] : null;

  const rentStatus = (): "paid" | "due" | "overdue" => {
    if (!currentRent) return "due";
    const s = currentRent.paymentStatus.toLowerCase();
    if (s === "paid") return "paid";
    if (s === "overdue") return "overdue";
    return "due";
  };

  const status = rentStatus();
  const rentTopBorder = status === "paid" ? GREEN : status === "overdue" ? RED : AMBER;

  const quickCards = [
    {
      icon: "build",
      label: "Maintenance",
      subtitle: "Submit a request",
      href: `/tenants/${token}/maintenance`,
      iconColor: AMBER,
      chipBg: AMBER_BG,
    },
    {
      icon: "folder",
      label: "Documents",
      subtitle: "Lease & reports",
      href: `/tenants/${token}/documents`,
      iconColor: BLUE,
      chipBg: BLUE_BG,
    },
    {
      icon: "menu_book",
      label: "Home Guide",
      subtitle: "How things work",
      href: `/tenants/${token}/home-guide`,
      iconColor: GREEN,
      chipBg: GREEN_BG,
    },
    {
      icon: "calendar_today",
      label: "Schedule",
      subtitle: futureEvents.length > 0 ? `${futureEvents.length} upcoming` : "Nothing upcoming",
      href: `/tenants/${token}/schedule`,
      iconColor: GOLD,
      chipBg: GOLD_BG,
    },
    {
      icon: "chat",
      label: "Messages",
      subtitle: "Talk to Ebin & Laura",
      href: `/tenants/${token}/messages`,
      iconColor: BURGUNDY,
      chipBg: "rgba(139,32,48,0.08)",
    },
    {
      icon: "receipt_long",
      label: "Payments",
      subtitle: "Rent history",
      href: `/tenants/${token}/payments`,
      iconColor: NAVY,
      chipBg: "rgba(15,28,40,0.06)",
    },
  ];

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
      />

      <div style={{ minHeight: "100vh", background: BG, position: "relative" }}>
        {/* Decorative orb */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            top: "-120px",
            right: "-120px",
            width: "480px",
            height: "480px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,32,48,0.12) 0%, rgba(184,146,42,0.07) 50%, transparent 70%)",
            filter: "blur(60px)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        <TenantHeader firstName={firstName} token={token} />

        <main style={{ maxWidth: "860px", margin: "0 auto", padding: "48px 24px 120px", position: "relative", zIndex: 1 }}>

          {/* Hero section */}
          <div style={{ marginBottom: "32px" }}>
            {/* Date pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                background: CARD,
                boxShadow: CARD_SHADOW,
                border: `1px solid ${CARD_BORDER}`,
                borderRadius: "100px",
                padding: "5px 14px 5px 10px",
                marginBottom: "24px",
              }}
            >
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: GREEN, flexShrink: 0 }} />
              <span style={{ color: MUTED, fontSize: "12px", fontFamily: "var(--font-dm-sans)", fontWeight: 500 }}>
                {dateLabel}
              </span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(56px, 8vw, 80px)",
                fontWeight: 300,
                color: NAVY,
                letterSpacing: "-0.02em",
                lineHeight: 1.0,
                marginBottom: "6px",
              }}
            >
              Hi {firstName}.
            </h1>
            <p style={{ color: MUTED, fontSize: "14px", fontFamily: "var(--font-dm-sans)" }}>
              {tenant.propertyAddress}{tenant.propertyCity ? `, ${tenant.propertyCity}` : ""}
            </p>
          </div>

          {/* Rent status hero card */}
          <div
            style={{
              background: CARD,
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: RADIUS,
              boxShadow: CARD_SHADOW,
              borderTop: `2px solid ${rentTopBorder}`,
              padding: "28px",
              marginBottom: "20px",
            }}
          >
            {currentRent ? (
              <>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    {/* Big amount */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "4px" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-cormorant)",
                          fontSize: "56px",
                          fontWeight: 400,
                          color: NAVY,
                          lineHeight: 1,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {currentRent.amountDue != null ? fmt$(currentRent.amountDue) : "—"}
                      </span>
                    </div>
                    <p style={{ color: MUTED, fontSize: "13px", fontFamily: "var(--font-dm-sans)" }}>
                      for {currentRent.month} {currentRent.year}
                    </p>
                  </div>

                  {/* Status badge */}
                  <div>
                    {status === "paid" && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          background: GREEN_BG,
                          color: GREEN,
                          fontSize: "14px",
                          fontWeight: 600,
                          fontFamily: "var(--font-dm-sans)",
                          borderRadius: "100px",
                          padding: "8px 18px",
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>check_circle</span>
                        Rent Paid
                      </span>
                    )}
                    {status === "due" && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          background: AMBER_BG,
                          color: AMBER,
                          fontSize: "14px",
                          fontWeight: 600,
                          fontFamily: "var(--font-dm-sans)",
                          borderRadius: "100px",
                          padding: "8px 18px",
                        }}
                      >
                        Due{currentRent.datePaid ? ` ${new Date(currentRent.datePaid).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}` : ""}
                      </span>
                    )}
                    {status === "overdue" && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          background: RED_BG,
                          color: RED,
                          fontSize: "14px",
                          fontWeight: 600,
                          fontFamily: "var(--font-dm-sans)",
                          borderRadius: "100px",
                          padding: "8px 18px",
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>warning</span>
                        Overdue
                      </span>
                    )}
                  </div>
                </div>

                {/* Extra detail row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                    {status === "paid" && currentRent.datePaid && (
                      <p style={{ color: MUTED, fontSize: "12px", fontFamily: "var(--font-dm-sans)" }}>
                        Paid {new Date(currentRent.datePaid).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}
                      </p>
                    )}
                    {currentRent.amountPaid != null && (
                      <p style={{ color: MUTED, fontSize: "12px", fontFamily: "var(--font-dm-sans)" }}>
                        Amount paid: <span style={{ color: GREEN, fontWeight: 600 }}>{fmt$(currentRent.amountPaid)}</span>
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/tenants/${token}/payments`}
                    style={{ color: BURGUNDY, fontSize: "12px", fontFamily: "var(--font-dm-sans)", fontWeight: 600, textDecoration: "none" }}
                  >
                    View history →
                  </Link>
                </div>
              </>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ color: MUTED, fontSize: "14px", fontFamily: "var(--font-dm-sans)" }}>No payment records yet.</p>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: GREEN_BG,
                    color: GREEN,
                    fontSize: "14px",
                    fontWeight: 600,
                    fontFamily: "var(--font-dm-sans)",
                    borderRadius: "100px",
                    padding: "8px 18px",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>check_circle</span>
                  All paid up
                </span>
              </div>
            )}
          </div>

          {/* Quick action grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            {quickCards.map((card) => (
              <QuickCard key={card.label} card={card} />
            ))}
          </div>

          {/* Upcoming event strip */}
          {nextEvent && (
            <div
              style={{
                background: CARD,
                border: `1px solid ${CARD_BORDER}`,
                borderRadius: RADIUS_SM,
                boxShadow: CARD_SHADOW,
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "32px",
              }}
            >
              <span style={{ fontSize: "16px" }}>📅</span>
              <p style={{ fontSize: "13px", fontFamily: "var(--font-dm-sans)", color: NAVY, fontWeight: 500 }}>
                Next:{" "}
                <span style={{ fontWeight: 600 }}>{nextEvent.title}</span>
                {nextEvent.event_date && (
                  <span style={{ color: MUTED }}>
                    {" · "}{new Date(nextEvent.event_date).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Trust footer */}
          <div
            style={{
              textAlign: "center",
              paddingTop: "24px",
              borderTop: `1px solid ${CARD_BORDER}`,
            }}
          >
            <p style={{ fontSize: "13px", fontFamily: "var(--font-dm-sans)", color: SUBTLE, lineHeight: 1.6 }}>
              Managed by Ebin Jaison · Prospera Properties
            </p>
            <a
              href="tel:5196971227"
              style={{ fontSize: "13px", fontFamily: "var(--font-dm-sans)", color: SUBTLE, textDecoration: "none" }}
            >
              (519) 697-1227
            </a>
          </div>

        </main>

        <TenantMobileNav token={token} />
      </div>
    </>
  );
}

function QuickCard({ card }: {
  card: {
    icon: string;
    label: string;
    subtitle: string;
    href: string;
    iconColor: string;
    chipBg: string;
  }
}) {
  return (
    <Link href={card.href} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid rgba(15,28,40,0.07)",
          borderRadius: "20px",
          boxShadow: "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)",
          padding: "20px",
          minHeight: "110px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "transform 0.18s ease, box-shadow 0.18s ease",
          cursor: "pointer",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(15,28,40,0.08), 0 16px 40px rgba(15,28,40,0.10)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)";
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
              fontFamily: "var(--font-dm-sans)",
              fontSize: "15px",
              fontWeight: 700,
              color: "#0F1C28",
              marginBottom: "3px",
            }}
          >
            {card.label}
          </p>
          <p style={{ fontSize: "12px", fontFamily: "var(--font-dm-sans)", color: "rgba(15,28,40,0.45)" }}>
            {card.subtitle}
          </p>
        </div>
      </div>
    </Link>
  );
}
