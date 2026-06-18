import { notFound } from "next/navigation";
import Link from "next/link";
import {
  validateTenantToken,
  getTenantInfo,
  getPropertyHomeGuide,
} from "@/lib/tenant-data";
import TenantHeader from "@/components/tenants/TenantHeader";
import { TenantMobileNav } from "@/components/tenants/TenantMobileNav";
import HomeGuideAccordion from "@/components/tenants/HomeGuideAccordion";

const BG = "#F5F4F1";
const CARD = "#FFFFFF";
const CARD_BORDER = "rgba(15,28,40,0.07)";
const CARD_SHADOW = "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)";
const NAVY = "#0F1C28";
const MUTED = "rgba(15,28,40,0.45)";
const GREEN = "#0A7A52";
const GREEN_BG = "rgba(10,122,82,0.09)";
const RED = "#B91C1C";
const RED_BG = "rgba(185,28,28,0.08)";
const AMBER = "#B45309";
const AMBER_BG = "rgba(180,83,9,0.09)";
const RADIUS = "20px";
const RADIUS_SM = "12px";

interface Props {
  params: Promise<{ token: string }>;
}

export const revalidate = 3600;

export default async function HomeGuidePage({ params }: Props) {
  const { token } = await params;

  const access = await validateTenantToken(token);
  if (!access) return notFound();

  const [tenant, guideSections] = await Promise.all([
    getTenantInfo(access.notion_tenant_id),
    getPropertyHomeGuide(access.property_id),
  ]);

  if (!tenant) return notFound();

  const firstName = tenant.name.split(" ")[0];

  const emergencyContacts = [
    { label: "Ebin (Prospera)", phone: "(519) 697-1227", icon: "phone", color: GREEN, bg: GREEN_BG },
    { label: "Gas Leak — Enbridge", phone: "1-866-763-5427", icon: "local_fire_department", color: RED, bg: RED_BG },
    { label: "Hydro Outage — Hydro One", phone: "1-800-434-1235", icon: "bolt", color: AMBER, bg: AMBER_BG },
  ];

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
            style={{ color: MUTED, fontSize: "16px", textDecoration: "none", display: "inline-block", marginBottom: "28px", fontFamily: "var(--font-dm-sans)" }}
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
              marginBottom: "6px",
            }}
          >
            Home Guide
          </h1>
          <p style={{ color: MUTED, fontSize: "17px", fontFamily: "var(--font-dm-sans)", marginBottom: "32px" }}>
            {tenant.propertyAddress}{tenant.propertyCity ? `, ${tenant.propertyCity}` : ""}
          </p>

          {/* Emergency contacts */}
          <div
            style={{
              background: CARD,
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: RADIUS,
              boxShadow: CARD_SHADOW,
              padding: "20px 24px",
              marginBottom: "24px",
            }}
          >
            <p
              style={{
                fontSize: "14px",
                fontFamily: "var(--font-dm-sans)",
                color: MUTED,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "16px",
                fontWeight: 600,
              }}
            >
              Emergency Contacts
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {emergencyContacts.map((contact) => (
                <div
                  key={contact.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: contact.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "19px", color: contact.color }}
                      >
                        {contact.icon}
                      </span>
                    </div>
                    <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "17px", color: NAVY, fontWeight: 500 }}>
                      {contact.label}
                    </span>
                  </div>
                  <a
                    href={`tel:${contact.phone.replace(/\D/g, "")}`}
                    style={{
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "17px",
                      fontWeight: 700,
                      color: contact.color,
                      textDecoration: "none",
                    }}
                  >
                    {contact.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Guide sections accordion — wrapped in white cards */}
          <HomeGuideAccordion sections={guideSections} />

        </main>

        <TenantMobileNav token={token} />
      </div>
    </>
  );
}
