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

const PAGE_BG = "#090E17";
const CARD = "#0D1825";
const CARD_BORDER = "rgba(255,255,255,0.07)";
const TEXT = "#EDE8E1";
const TEXT_SEC = "rgba(237,232,225,0.42)";
const RED = "#f87171";
const AMBER = "#fbbf24";

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
    { label: "Ebin (Prospera)", phone: "(519) 697-1227", icon: "phone", color: "#34d399" },
    { label: "Gas Leak — Enbridge", phone: "1-866-763-5427", icon: "local_fire_department", color: RED },
    { label: "Hydro Outage — Hydro One", phone: "1-800-434-1235", icon: "bolt", color: AMBER },
  ];

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
              marginBottom: "8px",
            }}
          >
            Home Guide
          </h1>
          <p style={{ color: TEXT_SEC, fontSize: "14px", fontFamily: "var(--font-dm-sans)", marginBottom: "32px" }}>
            {tenant.propertyAddress}{tenant.propertyCity ? `, ${tenant.propertyCity}` : ""}
          </p>

          {/* Emergency contacts strip */}
          <div
            style={{
              background: CARD,
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "28px",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                fontFamily: "var(--font-dm-sans)",
                color: TEXT_SEC,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "16px",
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
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "18px", color: contact.color, flexShrink: 0 }}
                    >
                      {contact.icon}
                    </span>
                    <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: TEXT }}>
                      {contact.label}
                    </span>
                  </div>
                  <a
                    href={`tel:${contact.phone.replace(/\D/g, "")}`}
                    style={{
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "14px",
                      fontWeight: 600,
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

          {/* Guide sections accordion */}
          <HomeGuideAccordion sections={guideSections} />

        </main>

        <TenantMobileNav token={token} />
      </div>
    </>
  );
}
