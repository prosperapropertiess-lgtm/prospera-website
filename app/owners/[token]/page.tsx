import { notFound } from "next/navigation";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getDashboard } from "@/lib/owners-data";
import { MobileNav } from "@/components/owners/MobileNav";
import OwnerHeader from "@/components/owners/OwnerHeader";

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
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#090E17" }}>
        <p style={{ color: "rgba(237,232,225,0.42)", fontFamily: "var(--font-dm-sans)" }}>
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
      iconColor: "#60a5fa",
      chipBg: "rgba(96,165,250,0.12)",
      disabled: false,
    },
    {
      icon: "trending_up",
      label: "Financials",
      subtitle: `${fmt$(dashboard.totalNet)} net this year`,
      href: `/owners/${token}/financials`,
      iconColor: dashboard.totalNet >= 0 ? "#34d399" : "#f87171",
      chipBg: dashboard.totalNet >= 0 ? "rgba(52,211,153,0.12)" : "rgba(248,113,113,0.12)",
      disabled: false,
    },
    {
      icon: "people",
      label: "Tenants",
      subtitle: `${totalTenants} active tenant${totalTenants !== 1 ? "s" : ""}`,
      href: `/owners/${token}/tenants`,
      iconColor: "#a78bfa",
      chipBg: "rgba(167,139,250,0.12)",
      disabled: false,
    },
    {
      icon: "build",
      label: "Maintenance",
      subtitle: dashboard.totalOpenIssues > 0
        ? `${dashboard.totalOpenIssues} open issue${dashboard.totalOpenIssues !== 1 ? "s" : ""}`
        : "All clear",
      href: `/owners/${token}/maintenance`,
      iconColor: dashboard.totalOpenIssues > 0 ? "#fbbf24" : "#34d399",
      chipBg: dashboard.totalOpenIssues > 0 ? "rgba(251,191,36,0.12)" : "rgba(52,211,153,0.12)",
      disabled: false,
    },
    {
      icon: "chat",
      label: "Messages",
      subtitle: "Updates from your property manager",
      href: `/owners/${token}/messages`,
      iconColor: "#f472b6",
      chipBg: "rgba(244,114,182,0.12)",
      disabled: false,
    },
    {
      icon: "folder",
      label: "Documents",
      subtitle: "Leases, reports & notices",
      href: `/owners/${token}/documents`,
      iconColor: "rgba(237,232,225,0.3)",
      chipBg: "rgba(255,255,255,0.06)",
      disabled: false,
    },
  ];

  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" });

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
      />

      <div style={{ minHeight: "100vh", background: "#090E17" }}>
        <OwnerHeader firstName={firstNames} token={token} />

        <main style={{ maxWidth: "860px", margin: "0 auto", padding: "72px 24px 120px" }}>

          {/* Greeting */}
          <div style={{ marginBottom: "48px" }}>
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
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#34d399", flexShrink: 0, marginLeft: "4px" }} />
              <span style={{ color: "rgba(237,232,225,0.42)", fontSize: "12px", fontFamily: "var(--font-dm-sans)" }}>
                {dateLabel}
              </span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(58px, 8vw, 80px)",
                fontWeight: 300,
                color: "#EDE8E1",
                letterSpacing: "-0.02em",
                lineHeight: 1.0,
                marginBottom: "0",
              }}
            >
              Hi {firstNames}.
            </h1>
          </div>

          {/* Stat cards — 3 column grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
              marginBottom: "48px",
            }}
          >
            <StatCard
              label="Collected"
              value={fmt$(dashboard.totalRentCollected)}
              color="#EDE8E1"
            />
            <StatCard
              label="In your pocket"
              value={fmt$(dashboard.totalNet)}
              color={dashboard.totalNet >= 0 ? "#34d399" : "#f87171"}
            />
            <StatCard
              label="Open issues"
              value={String(dashboard.totalOpenIssues)}
              color={dashboard.totalOpenIssues > 0 ? "#fbbf24" : "rgba(237,232,225,0.20)"}
            />
          </div>

          {/* Navigation cards — 2 column grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "12px",
            }}
          >
            {navCards.map((card) => {
              const cardEl = (
                <div
                  style={{
                    background: "#0D1825",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "22px",
                    padding: "26px",
                    minHeight: "148px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    opacity: card.disabled ? 0.45 : 1,
                    cursor: card.disabled ? "default" : "pointer",
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
                        fontFamily: "var(--font-outfit)",
                        fontSize: "18px",
                        fontWeight: 600,
                        color: "#EDE8E1",
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
                        color: "rgba(237,232,225,0.42)",
                      }}
                    >
                      {card.subtitle}
                    </p>
                  </div>
                </div>
              );

              return card.href ? (
                <Link key={card.label} href={card.href} style={{ textDecoration: "none" }}>
                  {cardEl}
                </Link>
              ) : (
                <div key={card.label}>{cardEl}</div>
              );
            })}
          </div>

          {/* Multi-property list */}
          {dashboard.properties.length > 1 && (
            <div style={{ marginTop: "56px" }}>
              <p
                style={{
                  fontSize: "11px",
                  fontFamily: "var(--font-dm-sans)",
                  color: "rgba(237,232,225,0.20)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "16px",
                }}
              >
                Your Properties
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {dashboard.properties.map((p) => (
                  <Link
                    key={p.property.id}
                    href={`/owners/${token}/${p.property.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        background: "#0D1825",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: "14px",
                        padding: "18px 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                      }}
                    >
                      <div>
                        <p style={{ fontFamily: "var(--font-outfit)", fontSize: "15px", fontWeight: 600, color: "#EDE8E1", marginBottom: "2px" }}>
                          {p.property.address}
                        </p>
                        <p style={{ fontSize: "12px", fontFamily: "var(--font-dm-sans)", color: "rgba(237,232,225,0.42)" }}>
                          {p.property.city} · {p.property.type}
                        </p>
                      </div>
                      <span style={{ color: "rgba(237,232,225,0.20)", fontSize: "16px" }}>→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </main>

        <MobileNav token={token} />
      </div>
    </>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      style={{
        background: "#0D1825",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "20px",
        padding: "20px",
      }}
    >
      <p
        style={{
          fontSize: "11px",
          fontFamily: "var(--font-dm-sans)",
          color: "rgba(237,232,225,0.42)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: "8px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "var(--font-outfit)",
          fontSize: "clamp(26px, 4vw, 34px)",
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
