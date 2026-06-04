import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getDashboard } from "@/lib/owners-data";
import { PropertyCard } from "@/components/owners/PropertyCard";
import { MetricCard } from "@/components/owners/MetricCard";
import { ScrollReveal } from "@/components/owners/ScrollReveal";
import { MobileNav } from "@/components/owners/MobileNav";
import OwnerHeader from "@/components/owners/OwnerHeader";

interface Props {
  params: Promise<{ token: string }>;
}

export const dynamic = "force-static";

export default async function OwnerOverviewPage({ params }: Props) {
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
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-outfit)" }}>
          Unable to load data. Please try again in a moment.
        </p>
      </div>
    );
  }

  const firstNames = record.owner_names
    .split(/\s*[&,]\s*/)
    .map((n: string) => n.trim().split(" ")[0])
    .join(" & ");
  const multiProperty = dashboard.properties.length > 1;

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

      <div style={{ minHeight: "100vh" }}>
        <OwnerHeader firstName={firstNames} token={token} />

        <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px 80px" }}>

          {/* Welcome */}
          <ScrollReveal>
            <div style={{ paddingTop: "40px", marginBottom: "40px" }}>
              <h1
                style={{
                  fontFamily: "var(--font-outfit)",
                  fontSize: "clamp(28px, 4vw, 40px)",
                  fontWeight: 700,
                  color: "white",
                  letterSpacing: "-0.03em",
                  marginBottom: "8px",
                }}
              >
                Hi {firstNames} 👋
              </h1>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "15px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <span>{dashboard.currentMonth} {dashboard.currentYear} · Your portfolio at a glance</span>
                {updatedLabel && (
                  <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>schedule</span>
                    {updatedLabel}
                  </span>
                )}
              </p>
            </div>
          </ScrollReveal>

          {/* Portfolio summary — only if multiple properties */}
          {multiProperty && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "12px",
                marginBottom: "40px",
              }}
            >
              <MetricCard label="Collected This Year" value={dashboard.totalRentCollected} prefix="$" format="currency" icon="payments" delay={0} />
              <MetricCard label="Expenses This Year" value={dashboard.totalExpenses} prefix="$" format="currency" icon="receipt_long" delay={80} />
              <MetricCard label="In Your Pocket" value={dashboard.totalNet} prefix="$" format="currency" highlight icon="trending_up" delay={160} />
              <MetricCard label="Open Issues" value={dashboard.totalOpenIssues} icon="build" delay={240} colorClass={dashboard.totalOpenIssues > 0 ? "#fbbf24" : "#22c55e"} />
            </div>
          )}

          {/* Section label */}
          <ScrollReveal delay={0.05}>
            <h2
              style={{
                fontFamily: "var(--font-outfit)",
                fontSize: "13px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              {dashboard.properties.length === 1 ? "Your Property" : `Your Properties (${dashboard.properties.length})`}
            </h2>
          </ScrollReveal>

          {/* Property cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "20px",
              marginBottom: "48px",
            }}
          >
            {dashboard.properties.map((p, i) => (
              <PropertyCard key={p.property.id} data={p} token={token} index={i} />
            ))}
          </div>

          {/* Manager contact card */}
          <ScrollReveal delay={0.1}>
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "20px",
                padding: "28px",
                display: "flex",
                alignItems: "center",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #8B2030, #a02540)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ color: "white", fontFamily: "var(--font-outfit)", fontWeight: 700, fontSize: "20px" }}>E</span>
              </div>
              <div style={{ flex: 1, minWidth: "200px" }}>
                <p style={{ color: "white", fontWeight: 600, fontSize: "15px", marginBottom: "2px", fontFamily: "var(--font-outfit)" }}>
                  Ebin Jaison
                </p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
                  Property Manager · Prospera Properties
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <a
                  href="mailto:hello@prosperaproperties.co"
                  style={{
                    padding: "10px 18px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "white",
                    fontSize: "13px",
                    fontWeight: 500,
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>mail</span>
                  Email
                </a>
                <a
                  href="tel:+15196971227"
                  style={{
                    padding: "10px 18px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, rgba(139,32,48,0.4), rgba(139,32,48,0.2))",
                    border: "1px solid rgba(139,32,48,0.4)",
                    color: "white",
                    fontSize: "13px",
                    fontWeight: 500,
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>call</span>
                  Call
                </a>
              </div>
            </div>
          </ScrollReveal>
        </main>

        <MobileNav token={token} />
      </div>
    </>
  );
}
