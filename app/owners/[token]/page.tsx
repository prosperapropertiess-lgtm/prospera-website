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
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F5F2" }}>
        <p style={{ color: "#9AA5B1", fontFamily: "var(--font-dm-sans)" }}>
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
      accentColor: null as string | null,
      disabled: false,
    },
    {
      icon: "trending_up",
      label: "Financials",
      subtitle: `${fmt$(dashboard.totalNet)} net this year`,
      href: propertyHref,
      accentColor: dashboard.totalNet >= 0 ? "#16a34a" : "#dc2626",
      disabled: false,
    },
    {
      icon: "people",
      label: "Tenants",
      subtitle: `${totalTenants} active tenant${totalTenants !== 1 ? "s" : ""}`,
      href: propertyHref,
      accentColor: null as string | null,
      disabled: false,
    },
    {
      icon: "build",
      label: "Maintenance",
      subtitle: dashboard.totalOpenIssues > 0
        ? `${dashboard.totalOpenIssues} open issue${dashboard.totalOpenIssues !== 1 ? "s" : ""}`
        : "All clear",
      href: propertyHref,
      accentColor: dashboard.totalOpenIssues > 0 ? "#d97706" : "#16a34a",
      disabled: false,
    },
    {
      icon: "chat",
      label: "Messages",
      subtitle: "Updates from your property manager",
      href: propertyHref,
      accentColor: null as string | null,
      disabled: false,
    },
    {
      icon: "folder",
      label: "Documents",
      subtitle: "Coming soon",
      href: null,
      accentColor: null as string | null,
      disabled: true,
    },
  ];

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
      />

      <div style={{ minHeight: "100vh", background: "#F7F5F2" }}>
        <OwnerHeader firstName={firstNames} token={token} />

        <main style={{ maxWidth: "860px", margin: "0 auto", padding: "72px 24px 120px" }}>

          {/* Greeting */}
          <div style={{ marginBottom: "52px" }}>
            <h1
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(48px, 6vw, 68px)",
                fontWeight: 300,
                color: "#1F2F3A",
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
                marginBottom: "12px",
              }}
            >
              Hi {firstNames}.
            </h1>
            <p style={{ color: "#B0BBBF", fontSize: "14px", fontFamily: "var(--font-dm-sans)" }}>
              {dashboard.currentMonth} {dashboard.currentYear}
            </p>
          </div>

          {/* Inline stats — no boxes */}
          <div
            style={{
              display: "flex",
              gap: "40px",
              marginBottom: "64px",
              paddingBottom: "48px",
              borderBottom: "1px solid #E8E4DF",
              flexWrap: "wrap",
            }}
          >
            <StatPill label="Collected" value={fmt$(dashboard.totalRentCollected)} />
            <StatPill
              label="In your pocket"
              value={fmt$(dashboard.totalNet)}
              color={dashboard.totalNet >= 0 ? "#16a34a" : "#dc2626"}
            />
            <StatPill
              label="Open issues"
              value={String(dashboard.totalOpenIssues)}
              color={dashboard.totalOpenIssues > 0 ? "#d97706" : "#9AA5B1"}
            />
          </div>

          {/* Navigation cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "14px",
            }}
          >
            {navCards.map((card) => {
              const cardEl = (
                <div
                  style={{
                    background: card.disabled ? "rgba(240,237,232,0.6)" : "#FFFFFF",
                    borderRadius: "20px",
                    padding: "28px 28px 24px",
                    boxShadow: card.disabled ? "none" : "0 1px 3px rgba(0,0,0,0.06)",
                    opacity: card.disabled ? 0.55 : 1,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "168px",
                    cursor: card.disabled ? "default" : "pointer",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "26px", color: "#C8BFB5", marginBottom: "20px" }}
                  >
                    {card.icon}
                  </span>

                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontFamily: "var(--font-outfit)",
                        fontSize: "17px",
                        fontWeight: 600,
                        color: "#1F2F3A",
                        letterSpacing: "-0.01em",
                        marginBottom: "5px",
                      }}
                    >
                      {card.label}
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        fontFamily: "var(--font-dm-sans)",
                        color: card.accentColor ?? "#9AA5B1",
                        fontWeight: card.accentColor ? 500 : 400,
                      }}
                    >
                      {card.subtitle}
                    </p>
                  </div>

                  {!card.disabled && (
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#C8BFB5",
                        fontFamily: "var(--font-dm-sans)",
                        marginTop: "16px",
                      }}
                    >
                      View →
                    </p>
                  )}
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
                  color: "#C8BFB5",
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
                        background: "#FFFFFF",
                        borderRadius: "14px",
                        padding: "18px 20px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                      }}
                    >
                      <div>
                        <p style={{ fontFamily: "var(--font-outfit)", fontSize: "15px", fontWeight: 600, color: "#1F2F3A", marginBottom: "2px" }}>
                          {p.property.address}
                        </p>
                        <p style={{ fontSize: "12px", fontFamily: "var(--font-dm-sans)", color: "#9AA5B1" }}>
                          {p.property.city} · {p.property.type}
                        </p>
                      </div>
                      <span style={{ color: "#C8BFB5", fontSize: "16px" }}>→</span>
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

function StatPill({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <p
        style={{
          fontSize: "11px",
          fontFamily: "var(--font-dm-sans)",
          color: "#C8BFB5",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: "5px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "var(--font-outfit)",
          fontSize: "24px",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: color ?? "#1F2F3A",
        }}
      >
        {value}
      </p>
    </div>
  );
}
