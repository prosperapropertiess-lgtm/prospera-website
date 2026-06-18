import { notFound } from "next/navigation";
import Link from "next/link";
import {
  validateTenantToken,
  getTenantInfo,
  getTenantMaintenanceRequests,
} from "@/lib/tenant-data";
import TenantHeader from "@/components/tenants/TenantHeader";
import { TenantMobileNav } from "@/components/tenants/TenantMobileNav";
import MaintenanceWizard from "@/components/tenants/MaintenanceWizard";

const BG = "#F5F4F1";
const CARD = "#FFFFFF";
const CARD_BORDER = "rgba(15,28,40,0.07)";
const CARD_SHADOW = "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)";
const NAVY = "#0F1C28";
const MUTED = "rgba(15,28,40,0.45)";
const SUBTLE = "rgba(15,28,40,0.22)";
const GREEN = "#0A7A52";
const GREEN_BG = "rgba(10,122,82,0.09)";
const AMBER = "#B45309";
const AMBER_BG = "rgba(180,83,9,0.09)";
const BLUE = "#1D4ED8";
const BLUE_BG = "rgba(29,78,216,0.08)";
const PURPLE = "#7C3AED";
const PURPLE_BG = "rgba(124,58,237,0.08)";
const RADIUS = "20px";
const RADIUS_SM = "12px";

interface Props {
  params: Promise<{ token: string }>;
}

export const revalidate = 0;

function statusStyle(status: string): { color: string; bg: string; label: string } {
  if (status === "submitted") return { color: BLUE, bg: BLUE_BG, label: "Submitted" };
  if (status === "acknowledged") return { color: AMBER, bg: AMBER_BG, label: "Acknowledged" };
  if (status === "scheduled") return { color: PURPLE, bg: PURPLE_BG, label: "Scheduled" };
  if (status === "resolved") return { color: GREEN, bg: GREEN_BG, label: "Resolved" };
  return { color: MUTED, bg: "rgba(15,28,40,0.05)", label: status };
}

export default async function MaintenancePage({ params }: Props) {
  const { token } = await params;

  const access = await validateTenantToken(token);
  if (!access) return notFound();

  const [tenant, requests] = await Promise.all([
    getTenantInfo(access.notion_tenant_id),
    getTenantMaintenanceRequests(token),
  ]);

  if (!tenant) return notFound();

  const firstName = tenant.name.split(" ")[0];
  const openRequests = requests.filter(r => r.status !== "resolved");

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
      />

      <div style={{ minHeight: "100vh", background: BG }}>
        <TenantHeader firstName={firstName} token={token} />

        <main style={{ maxWidth: "860px", margin: "0 auto", padding: "48px 24px 120px" }}>

          <Link
            href={`/tenants/${token}`}
            style={{ color: MUTED, fontSize: "13px", textDecoration: "none", display: "inline-block", marginBottom: "28px", fontFamily: "var(--font-dm-sans)" }}
          >
            ← Home
          </Link>

          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(40px, 6vw, 60px)",
              fontWeight: 300,
              color: NAVY,
              letterSpacing: "-0.02em",
              marginBottom: "32px",
            }}
          >
            Maintenance
          </h1>

          {/* Open requests */}
          {openRequests.length > 0 && (
            <div style={{ marginBottom: "36px" }}>
              <p
                style={{
                  fontSize: "11px",
                  fontFamily: "var(--font-dm-sans)",
                  color: SUBTLE,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "14px",
                  fontWeight: 600,
                }}
              >
                Open Requests
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {openRequests.map((req) => {
                  const st = statusStyle(req.status);
                  return (
                    <div
                      key={req.id}
                      style={{
                        background: CARD,
                        border: `1px solid ${CARD_BORDER}`,
                        borderRadius: RADIUS_SM,
                        boxShadow: CARD_SHADOW,
                        padding: "16px 20px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 10px",
                            borderRadius: "100px",
                            fontSize: "11px",
                            fontWeight: 600,
                            fontFamily: "var(--font-dm-sans)",
                            background: "rgba(15,28,40,0.05)",
                            color: MUTED,
                          }}
                        >
                          {req.category}
                        </span>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 10px",
                            borderRadius: "100px",
                            fontSize: "11px",
                            fontWeight: 600,
                            fontFamily: "var(--font-dm-sans)",
                            background: st.bg,
                            color: st.color,
                          }}
                        >
                          {st.label}
                        </span>
                      </div>
                      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: NAVY, marginBottom: "4px", lineHeight: "1.5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {req.description}
                      </p>
                      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: MUTED }}>
                        Submitted {new Date(req.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit new request */}
          <div>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "18px",
                fontWeight: 700,
                color: NAVY,
                marginBottom: "16px",
              }}
            >
              Submit a New Request
            </p>
            <div
              style={{
                background: CARD,
                border: `1px solid ${CARD_BORDER}`,
                borderRadius: RADIUS,
                boxShadow: CARD_SHADOW,
                padding: "28px",
              }}
            >
              <MaintenanceWizard
                token={token}
                tenantId={access.notion_tenant_id}
                propertyId={access.property_id}
              />
            </div>
          </div>

        </main>

        <TenantMobileNav token={token} />
      </div>
    </>
  );
}
