import { notFound } from "next/navigation";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getDashboard } from "@/lib/owners-data";
import { TenantCard } from "@/components/owners/TenantCard";
import { MobileNav } from "@/components/owners/MobileNav";
import OwnerHeader from "@/components/owners/OwnerHeader";

interface Props {
  params: Promise<{ token: string }>;
}

export const revalidate = 21600;

function leaseExpiryDays(leaseEnd: string | null): number | null {
  if (!leaseEnd) return null;
  return Math.floor((new Date(leaseEnd).getTime() - Date.now()) / 864e5);
}

export default async function TenantsPage({ params }: Props) {
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
  const totalTenants = dashboard.properties.reduce((s, p) => s + p.tenants.length, 0);
  const propertiesWithTenants = dashboard.properties.filter(p => p.tenants.length > 0);

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />

      <div style={{ minHeight: "100vh", background: "#F7F5F2" }}>
        <OwnerHeader firstName={firstNames} token={token} />

        <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px 100px" }}>
          <Link
            href={`/owners/${token}`}
            style={{ color: "#9AA5B1", fontSize: "13px", textDecoration: "none", display: "inline-block", marginBottom: "24px" }}
          >
            ← Back
          </Link>

          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 300,
              color: "#1F2F3A",
              letterSpacing: "-0.02em",
              marginBottom: "8px",
            }}
          >
            Tenants
          </h1>

          {/* Portfolio stat */}
          <p style={{ fontSize: "14px", fontFamily: "var(--font-dm-sans)", color: "#9AA5B1", marginBottom: "40px" }}>
            {totalTenants} active tenant{totalTenants !== 1 ? "s" : ""}
          </p>

          {totalTenants === 0 ? (
            <div style={{ background: "#FFFFFF", borderRadius: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: "40px 24px", textAlign: "center" }}>
              <p style={{ color: "#9AA5B1", fontSize: "14px", fontFamily: "var(--font-dm-sans)" }}>
                No active tenants on record.
              </p>
            </div>
          ) : (
            propertiesWithTenants.map((propData, idx) => {
              const { property, tenants, nextLeaseExpiry } = propData;
              const leaseDays = leaseExpiryDays(nextLeaseExpiry);

              return (
                <div key={property.id}>
                  {multiProperty && (
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#9AA5B1", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px", marginTop: idx > 0 ? "40px" : "0" }}>
                      {property.address}
                    </p>
                  )}

                  {/* Lease expiry alert */}
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
                      <span className="material-symbols-outlined" style={{ fontSize: "20px", color: leaseDays <= 30 ? "#dc2626" : "#d97706", flexShrink: 0, marginTop: "1px" }}>
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
                      <TenantCard key={t.id} tenant={t} rentHistory={[]} index={i} />
                    ))}
                  </div>

                  {multiProperty && idx < propertiesWithTenants.length - 1 && (
                    <div style={{ height: "1px", background: "#E8E4DF", margin: "40px 0" }} />
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
