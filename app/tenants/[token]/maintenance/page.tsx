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

const PAGE_BG = "#090E17";
const CARD = "#0D1825";
const CARD_BORDER = "rgba(255,255,255,0.07)";
const DIVIDER = "rgba(255,255,255,0.05)";
const TEXT = "#EDE8E1";
const TEXT_SEC = "rgba(237,232,225,0.42)";
const TEXT_DIM = "rgba(237,232,225,0.20)";
const GREEN = "#34d399";
const AMBER = "#fbbf24";
const BLUE = "#60a5fa";
const PURPLE = "#a78bfa";

interface Props {
  params: Promise<{ token: string }>;
}

export const revalidate = 0;

function statusColor(status: string): string {
  if (status === "submitted") return BLUE;
  if (status === "acknowledged") return AMBER;
  if (status === "scheduled") return PURPLE;
  if (status === "resolved") return GREEN;
  return TEXT_SEC;
}

function statusLabel(status: string): string {
  if (status === "submitted") return "Submitted";
  if (status === "acknowledged") return "Acknowledged";
  if (status === "scheduled") return "Scheduled";
  if (status === "resolved") return "Resolved";
  return status;
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

      <div style={{ minHeight: "100vh", background: PAGE_BG }}>
        <TenantHeader firstName={firstName} token={token} />

        <main style={{ maxWidth: "860px", margin: "0 auto", padding: "56px 24px 120px" }}>

          <Link
            href={`/tenants/${token}`}
            style={{ color: TEXT_SEC, fontSize: "13px", textDecoration: "none", display: "inline-block", marginBottom: "24px" }}
          >
            ← Home
          </Link>

          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(40px, 6vw, 58px)",
              fontWeight: 300,
              color: TEXT,
              letterSpacing: "-0.02em",
              marginBottom: "32px",
            }}
          >
            Maintenance
          </h1>

          {/* Open requests */}
          {openRequests.length > 0 && (
            <div style={{ marginBottom: "40px" }}>
              <p
                style={{
                  fontSize: "11px",
                  fontFamily: "var(--font-dm-sans)",
                  color: TEXT_DIM,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "14px",
                }}
              >
                Open Requests
              </p>
              <div
                style={{
                  background: CARD,
                  border: `1px solid ${CARD_BORDER}`,
                  borderRadius: "22px",
                  overflow: "hidden",
                }}
              >
                {openRequests.map((req, idx) => (
                  <div
                    key={req.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "14px",
                      padding: "18px 20px",
                      borderBottom: idx < openRequests.length - 1 ? `1px solid ${DIVIDER}` : "none",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 10px",
                            borderRadius: "100px",
                            fontSize: "11px",
                            fontWeight: 600,
                            fontFamily: "var(--font-dm-sans)",
                            background: "rgba(255,255,255,0.06)",
                            color: TEXT_SEC,
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
                            background: `${statusColor(req.status)}18`,
                            color: statusColor(req.status),
                          }}
                        >
                          {statusLabel(req.status)}
                        </span>
                      </div>
                      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: TEXT, marginBottom: "4px", lineHeight: "1.5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {req.description}
                      </p>
                      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: TEXT_DIM }}>
                        Submitted {new Date(req.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New request */}
          <div>
            <p
              style={{
                fontFamily: "var(--font-outfit)",
                fontSize: "20px",
                fontWeight: 600,
                color: TEXT,
                marginBottom: "20px",
              }}
            >
              Submit a New Request
            </p>
            <div
              style={{
                background: CARD,
                border: `1px solid ${CARD_BORDER}`,
                borderRadius: "22px",
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
