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
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
      />

      <div style={{ minHeight: "100vh", background: "#F5F4F1" }}>
        <OwnerHeader firstName={firstNames} token={token} />

        <main style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 20px 100px" }}>
          <Link
            href={`/owners/${token}`}
            style={{
              color: "rgba(15,28,40,0.45)",
              fontSize: "16px",
              textDecoration: "none",
              display: "inline-block",
              marginBottom: "28px",
              fontFamily: "var(--font-dm-sans)",
              fontWeight: 500,
            }}
          >
            ← Back
          </Link>

          <div style={{ display: "flex", alignItems: "baseline", gap: "14px", marginBottom: "32px" }}>
            <h1
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(40px, 6vw, 60px)",
                fontWeight: 300,
                color: "#0F1C28",
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              Tenants
            </h1>
            <span
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "17px",
                color: "rgba(15,28,40,0.45)",
                fontWeight: 400,
              }}
            >
              {totalTenants} active
            </span>
          </div>

          {totalTenants === 0 ? (
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(15,28,40,0.07)",
                borderRadius: "20px",
                padding: "48px 24px",
                textAlign: "center",
                boxShadow: "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)",
              }}
            >
              <p
                style={{
                  color: "rgba(15,28,40,0.45)",
                  fontSize: "17px",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
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
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "rgba(15,28,40,0.22)",
                        textTransform: "uppercase",
                        letterSpacing: "0.10em",
                        marginBottom: "16px",
                        marginTop: idx > 0 ? "40px" : "0",
                        fontFamily: "var(--font-dm-sans)",
                      }}
                    >
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
                        background: leaseDays <= 30 ? "rgba(185,28,28,0.08)" : "rgba(180,83,9,0.09)",
                        border: `1px solid ${leaseDays <= 30 ? "rgba(185,28,28,0.18)" : "rgba(180,83,9,0.18)"}`,
                        marginBottom: "16px",
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: "23px",
                          color: leaseDays <= 30 ? "#B91C1C" : "#B45309",
                          flexShrink: 0,
                          marginTop: "1px",
                        }}
                      >
                        warning
                      </span>
                      <div>
                        <p
                          style={{
                            color: leaseDays <= 30 ? "#B91C1C" : "#B45309",
                            fontSize: "17px",
                            fontWeight: 600,
                            marginBottom: "2px",
                            fontFamily: "var(--font-dm-sans)",
                          }}
                        >
                          Lease expires in {leaseDays === 0 ? "today" : `${leaseDays} day${leaseDays > 1 ? "s" : ""}`}
                        </p>
                        <p
                          style={{
                            color: leaseDays <= 30 ? "#B91C1C" : "#B45309",
                            fontSize: "16px",
                            opacity: 0.8,
                            fontFamily: "var(--font-dm-sans)",
                          }}
                        >
                          Renewal or vacancy planning should be underway. Contact Ebin if you have questions.
                        </p>
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                      gap: "14px",
                    }}
                  >
                    {tenants.map((t, i) => (
                      <TenantCard key={t.id} tenant={t} rentHistory={[]} index={i} />
                    ))}
                  </div>

                  {multiProperty && idx < propertiesWithTenants.length - 1 && (
                    <div
                      style={{
                        height: "1px",
                        background: "rgba(15,28,40,0.07)",
                        margin: "40px 0",
                      }}
                    />
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
