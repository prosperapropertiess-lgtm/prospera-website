import { notFound } from "next/navigation";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getDashboard } from "@/lib/owners-data";
import { MaintenanceList } from "@/components/owners/MaintenanceList";
import { MobileNav } from "@/components/owners/MobileNav";
import OwnerHeader from "@/components/owners/OwnerHeader";

interface Props {
  params: Promise<{ token: string }>;
}

export const revalidate = 21600;

export default async function MaintenancePage({ params }: Props) {
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
    return notFound();
  }

  const firstNames = record.owner_names
    .split(/\s*[&,]\s*/)
    .map((n: string) => n.trim().split(" ")[0])
    .join(" & ");

  const multiProperty = dashboard.properties.length > 1;
  const totalOpen = dashboard.properties.reduce((s, p) => s + p.maintenanceOpen.length, 0);
  const totalResolved = dashboard.properties.reduce((s, p) => s + p.maintenanceCompletedRecent.length, 0);
  const hasAny = dashboard.properties.some(p => p.maintenanceOpen.length > 0 || p.maintenanceCompletedRecent.length > 0);

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />

      <div style={{ minHeight: "100vh", background: "#090E17" }}>
        <OwnerHeader firstName={firstNames} token={token} />

        <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px 100px" }}>
          <Link
            href={`/owners/${token}`}
            style={{ color: "rgba(237,232,225,0.42)", fontSize: "13px", textDecoration: "none", display: "inline-block", marginBottom: "24px" }}
          >
            ← Back
          </Link>

          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(36px, 5vw, 52px)",
              fontWeight: 300,
              color: "#EDE8E1",
              letterSpacing: "-0.02em",
              marginBottom: "8px",
            }}
          >
            Maintenance
          </h1>

          {/* Stats row */}
          <p style={{ fontSize: "14px", fontFamily: "var(--font-dm-sans)", color: "rgba(237,232,225,0.42)", marginBottom: "40px" }}>
            <span style={{ color: totalOpen > 0 ? "#fbbf24" : "rgba(237,232,225,0.42)" }}>
              {totalOpen} open
            </span>
            {" · "}
            {totalResolved} resolved recently
          </p>

          {!hasAny ? (
            <div style={{ background: "#0D1825", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "40px 24px", textAlign: "center" }}>
              <p style={{ color: "rgba(237,232,225,0.42)", fontSize: "14px", fontFamily: "var(--font-dm-sans)" }}>
                No open maintenance requests.
              </p>
            </div>
          ) : (
            dashboard.properties.map((propData, idx) => {
              const { property, maintenanceOpen, maintenanceCompletedRecent } = propData;
              const hasPropMaintenance = maintenanceOpen.length > 0 || maintenanceCompletedRecent.length > 0;
              if (!hasPropMaintenance) return null;

              return (
                <div key={property.id}>
                  {multiProperty && (
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "rgba(237,232,225,0.42)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px", marginTop: idx > 0 ? "40px" : "0" }}>
                      {property.address}
                    </p>
                  )}

                  <MaintenanceList open={maintenanceOpen} completed={maintenanceCompletedRecent} />

                  {multiProperty && idx < dashboard.properties.length - 1 && hasPropMaintenance && (
                    <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "40px 0" }} />
                  )}
                </div>
              );
            })
          )}
        </main>

        <MobileNav token={token} />
      </div>
    </>
  );
}
