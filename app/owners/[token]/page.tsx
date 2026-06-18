import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getDashboard } from "@/lib/owners-data";
import { MobileNav } from "@/components/owners/MobileNav";
import OwnerHeader from "@/components/owners/OwnerHeader";
import { OwnerHomeClient } from "@/components/owners/OwnerHomeClient";

interface Props {
  params: Promise<{ token: string }>;
}

export const revalidate = 21600;

function fmt$(n: number) {
  return "$" + n.toLocaleString("en-CA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default async function OwnerHomePage({ params }: Props) {
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
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F5F4F1",
        }}
      >
        <p
          style={{
            color: "rgba(15,28,40,0.45)",
            fontFamily: "var(--font-dm-sans)",
            fontSize: "14px",
          }}
        >
          Unable to load data. Please try again in a moment.
        </p>
      </div>
    );
  }

  const firstNames = record.owner_names
    .split(/\s*[&,]\s*/)
    .map((n: string) => n.trim().split(" ")[0])
    .join(" & ");

  const firstProperty = dashboard.properties[0];
  const propertyHref = firstProperty
    ? `/owners/${token}/${firstProperty.property.id}`
    : `/owners/${token}`;

  const totalTenants = dashboard.properties.reduce((s, p) => s + p.tenants.length, 0);

  const navCards = [
    {
      icon: "home",
      label: "Properties",
      subtitle: `${dashboard.properties.length} active rental${dashboard.properties.length !== 1 ? "s" : ""}`,
      href: propertyHref,
      iconColor: "#1D4ED8",
      chipBg: "rgba(29,78,216,0.08)",
    },
    {
      icon: "trending_up",
      label: "Financials",
      subtitle: `${fmt$(dashboard.totalNet)} net this year`,
      href: `/owners/${token}/financials`,
      iconColor: dashboard.totalNet >= 0 ? "#0A7A52" : "#B91C1C",
      chipBg: dashboard.totalNet >= 0 ? "rgba(10,122,82,0.09)" : "rgba(185,28,28,0.08)",
    },
    {
      icon: "people",
      label: "Tenants",
      subtitle: `${totalTenants} active tenant${totalTenants !== 1 ? "s" : ""}`,
      href: `/owners/${token}/tenants`,
      iconColor: "#8B2030",
      chipBg: "rgba(139,32,48,0.08)",
    },
    {
      icon: "build",
      label: "Maintenance",
      subtitle: dashboard.totalOpenIssues > 0
        ? `${dashboard.totalOpenIssues} open issue${dashboard.totalOpenIssues !== 1 ? "s" : ""}`
        : "All clear",
      href: `/owners/${token}/maintenance`,
      iconColor: dashboard.totalOpenIssues > 0 ? "#B45309" : "#0A7A52",
      chipBg: dashboard.totalOpenIssues > 0 ? "rgba(180,83,9,0.09)" : "rgba(10,122,82,0.09)",
    },
    {
      icon: "chat",
      label: "Messages",
      subtitle: "Updates from your property manager",
      href: `/owners/${token}/messages`,
      iconColor: "#8B2030",
      chipBg: "rgba(139,32,48,0.08)",
    },
    {
      icon: "folder",
      label: "Documents",
      subtitle: "Leases, reports & notices",
      href: `/owners/${token}/documents`,
      iconColor: "#B8922A",
      chipBg: "rgba(184,146,42,0.09)",
    },
  ];

  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Trust chips data
  const firstProp = dashboard.properties[0];
  const rentStatus = firstProp?.rentCurrentMonth?.[0]?.paymentStatus ?? null;
  const leaseExpiry = firstProp?.nextLeaseExpiry ?? null;
  const leaseDaysRemaining = leaseExpiry
    ? Math.floor((new Date(leaseExpiry).getTime() - Date.now()) / 864e5)
    : null;

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
      />

      <div style={{ minHeight: "100vh", background: "#F5F4F1" }}>
        <OwnerHeader firstName={firstNames} token={token} />

        <main
          style={{
            maxWidth: "860px",
            margin: "0 auto",
            padding: "48px 20px 120px",
            position: "relative",
          }}
        >
          {/* Radial orb — purely decorative CSS, no images */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "-100px",
              right: "-100px",
              width: "500px",
              height: "500px",
              background:
                "radial-gradient(circle, rgba(139,32,48,0.07) 0%, rgba(184,146,42,0.04) 50%, transparent 70%)",
              filter: "blur(60px)",
              pointerEvents: "none",
              zIndex: 0,
              borderRadius: "50%",
            }}
          />

          {/* Hero greeting */}
          <div style={{ position: "relative", zIndex: 1, marginBottom: "40px" }}>
            {/* Date pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                background: "#FFFFFF",
                border: "1px solid rgba(15,28,40,0.07)",
                borderRadius: "100px",
                padding: "5px 14px 5px 8px",
                marginBottom: "22px",
                boxShadow: "0 1px 3px rgba(15,28,40,0.05)",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#0A7A52",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  color: "rgba(15,28,40,0.45)",
                  fontSize: "12px",
                  fontFamily: "var(--font-dm-sans)",
                  fontWeight: 500,
                }}
              >
                {dateLabel}
              </span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(56px, 10vw, 80px)",
                fontWeight: 300,
                color: "#0F1C28",
                letterSpacing: "-0.02em",
                lineHeight: 1.0,
                marginBottom: "10px",
              }}
            >
              Hi {firstNames}.
            </h1>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "15px",
                color: "rgba(15,28,40,0.45)",
                fontWeight: 400,
              }}
            >
              Here&apos;s your portfolio at a glance.
            </p>
          </div>

          {/* Hero number card */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              background: "#FFFFFF",
              border: "1px solid rgba(15,28,40,0.07)",
              borderTop: "2px solid #8B2030",
              borderRadius: "20px",
              padding: "28px 28px 24px",
              marginBottom: "16px",
              boxShadow: "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                fontFamily: "var(--font-dm-sans)",
                color: "rgba(15,28,40,0.22)",
                textTransform: "uppercase",
                letterSpacing: "0.10em",
                marginBottom: "10px",
                fontWeight: 600,
              }}
            >
              Collected this month
            </p>

            <p
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(52px, 8vw, 72px)",
                fontWeight: 600,
                color: "#0F1C28",
                letterSpacing: "-0.02em",
                lineHeight: 1.0,
                marginBottom: "18px",
              }}
            >
              {fmt$(dashboard.totalRentCollected)}
            </p>

            {/* Trust chips */}
            <OwnerHomeClient
              rentStatus={rentStatus}
              leaseDaysRemaining={leaseDaysRemaining}
              leaseExpiry={leaseExpiry}
            />
          </div>

          {/* Stats row — 3 cards */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            <StatCard
              label="Net income"
              value={fmt$(dashboard.totalNet)}
              valueColor={dashboard.totalNet >= 0 ? "#0A7A52" : "#B91C1C"}
            />
            <StatCard
              label="Expenses"
              value={fmt$(dashboard.totalExpenses)}
              valueColor="#B45309"
            />
            <StatCard
              label="Open issues"
              value={String(dashboard.totalOpenIssues)}
              valueColor={
                dashboard.totalOpenIssues === 0
                  ? "#0A7A52"
                  : dashboard.totalOpenIssues <= 2
                  ? "#B45309"
                  : "#B91C1C"
              }
            />
          </div>

          {/* Navigation cards — 2-col grid */}
          <NavCardsGrid navCards={navCards} />

          {/* Upcoming section */}
          <div style={{ position: "relative", zIndex: 1, marginTop: "32px" }}>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontWeight: 700,
                fontSize: "14px",
                color: "#0F1C28",
                marginBottom: "12px",
              }}
            >
              Upcoming
            </p>

            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(15,28,40,0.07)",
                borderRadius: "20px",
                padding: "4px 0",
                boxShadow: "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)",
                overflow: "hidden",
              }}
            >
              <UpcomingRow
                icon="search"
                iconBg="rgba(29,78,216,0.08)"
                iconColor="#1D4ED8"
                title="Annual Inspection"
                dateLabel="Jul 15, 2026"
                chipLabel="27 days"
                chipBg="rgba(29,78,216,0.08)"
                chipColor="#1D4ED8"
              />
              <div style={{ height: "1px", background: "rgba(15,28,40,0.06)", margin: "0 20px" }} />
              <UpcomingRow
                icon="local_fire_department"
                iconBg="rgba(180,83,9,0.09)"
                iconColor="#B45309"
                title="Furnace Service"
                dateLabel="Sep 2026"
                chipLabel="Annually recommended"
                chipBg="rgba(180,83,9,0.09)"
                chipColor="#B45309"
              />
              <div style={{ height: "1px", background: "rgba(15,28,40,0.06)", margin: "0 20px" }} />
              <UpcomingRow
                icon="water_drop"
                iconBg="rgba(15,28,40,0.06)"
                iconColor="rgba(15,28,40,0.45)"
                title="Water Heater"
                dateLabel="Mar 2027"
                chipLabel="9 years old"
                chipBg="rgba(15,28,40,0.06)"
                chipColor="rgba(15,28,40,0.45)"
              />
            </div>
          </div>

          {/* Multi-property list */}
          {dashboard.properties.length > 1 && (
            <div style={{ position: "relative", zIndex: 1, marginTop: "32px" }}>
              <p
                style={{
                  fontSize: "11px",
                  fontFamily: "var(--font-dm-sans)",
                  color: "rgba(15,28,40,0.22)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "12px",
                  fontWeight: 600,
                }}
              >
                Your Properties
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {dashboard.properties.map((p) => (
                  <a
                    key={p.property.id}
                    href={`/owners/${token}/${p.property.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid rgba(15,28,40,0.07)",
                        borderRadius: "12px",
                        padding: "16px 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                        boxShadow: "0 1px 3px rgba(15,28,40,0.05)",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontFamily: "var(--font-dm-sans)",
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "#0F1C28",
                            marginBottom: "2px",
                          }}
                        >
                          {p.property.address}
                        </p>
                        <p
                          style={{
                            fontSize: "12px",
                            fontFamily: "var(--font-dm-sans)",
                            color: "rgba(15,28,40,0.45)",
                          }}
                        >
                          {p.property.city} · {p.property.type}
                        </p>
                      </div>
                      <span style={{ color: "rgba(15,28,40,0.22)", fontSize: "16px" }}>→</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Trust footer strip */}
          <div
            style={{
              position: "relative",
              zIndex: 1,
              textAlign: "center",
              marginTop: "56px",
              paddingTop: "24px",
              borderTop: "1px solid rgba(15,28,40,0.07)",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "13px",
                color: "rgba(15,28,40,0.22)",
                lineHeight: 1.8,
              }}
            >
              Managed by Ebin Jaison · Prospera Properties · (519) 697-1227
            </p>
          </div>
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
          fontSize: "clamp(24px, 4vw, 32px)",
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

function NavCardsGrid({
  navCards,
}: {
  navCards: Array<{
    icon: string;
    label: string;
    subtitle: string;
    href: string;
    iconColor: string;
    chipBg: string;
  }>;
}) {
  return (
    <div
      style={{
        position: "relative",
        zIndex: 1,
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "12px",
        marginTop: "0",
      }}
    >
      {navCards.map((card) => (
        <NavCard key={card.label} card={card} />
      ))}
    </div>
  );
}

function NavCard({
  card,
}: {
  card: {
    icon: string;
    label: string;
    subtitle: string;
    href: string;
    iconColor: string;
    chipBg: string;
  };
}) {
  return (
    <a href={card.href} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid rgba(15,28,40,0.07)",
          borderRadius: "20px",
          padding: "24px",
          minHeight: "140px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          boxShadow: "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)",
          transition: "transform 0.18s ease, box-shadow 0.18s ease",
        }}
      >
        {/* Icon chip */}
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
              fontFamily: "var(--font-dm-sans)",
              fontSize: "16px",
              fontWeight: 700,
              color: "#0F1C28",
              letterSpacing: "-0.01em",
              marginBottom: "4px",
            }}
          >
            {card.label}
          </p>
          <p
            style={{
              fontSize: "13px",
              fontFamily: "var(--font-dm-sans)",
              color: "rgba(15,28,40,0.45)",
              lineHeight: 1.4,
            }}
          >
            {card.subtitle}
          </p>
        </div>

        {/* Arrow */}
        <span
          style={{
            position: "absolute",
            top: "24px",
            right: "20px",
            color: "rgba(15,28,40,0.22)",
            fontSize: "14px",
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          →
        </span>
      </div>
    </a>
  );
}

function UpcomingRow({
  icon,
  iconBg,
  iconColor,
  title,
  dateLabel,
  chipLabel,
  chipBg,
  chipColor,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  dateLabel: string;
  chipLabel: string;
  chipBg: string;
  chipColor: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "16px 20px",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "10px",
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "18px", color: iconColor }}>
          {icon}
        </span>
      </div>

      <div style={{ flex: 1, minWidth: "100px" }}>
        <p
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "14px",
            fontWeight: 600,
            color: "#0F1C28",
            marginBottom: "2px",
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "12px",
            color: "rgba(15,28,40,0.45)",
          }}
        >
          {dateLabel}
        </p>
      </div>

      <div
        style={{
          padding: "4px 10px",
          borderRadius: "100px",
          background: chipBg,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "11px",
            fontWeight: 600,
            color: chipColor,
          }}
        >
          {chipLabel}
        </span>
      </div>
    </div>
  );
}
