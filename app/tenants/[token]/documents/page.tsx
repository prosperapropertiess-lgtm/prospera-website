import { notFound } from "next/navigation";
import Link from "next/link";
import {
  validateTenantToken,
  getTenantDocuments,
  getTenantInfo,
} from "@/lib/tenant-data";
import { fetchTenantFiles } from "@/lib/notion";
import TenantHeader from "@/components/tenants/TenantHeader";
import { TenantMobileNav } from "@/components/tenants/TenantMobileNav";
import DocumentsClient from "./DocumentsClient";

const BG = "#F5F4F1";
const CARD = "#FFFFFF";
const CARD_BORDER = "rgba(15,28,40,0.07)";
const CARD_SHADOW = "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)";
const NAVY = "#0F1C28";
const MUTED = "rgba(15,28,40,0.45)";
const RADIUS = "20px";

interface Props {
  params: Promise<{ token: string }>;
}

export const revalidate = 0;

export default async function DocumentsPage({ params }: Props) {
  const { token } = await params;

  const access = await validateTenantToken(token);
  if (!access) return notFound();

  const [tenant, documents, notionFiles] = await Promise.all([
    getTenantInfo(access.notion_tenant_id),
    getTenantDocuments(token),
    fetchTenantFiles(access.notion_tenant_id).catch(() => []),
  ]);

  if (!tenant) return notFound();

  const firstName = tenant.name.split(" ")[0];

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
            Documents
          </h1>

          <div
            style={{
              background: CARD,
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: RADIUS,
              boxShadow: CARD_SHADOW,
              padding: "24px",
            }}
          >
            <DocumentsClient documents={documents} notionFiles={notionFiles} token={token} />
          </div>

        </main>

        <TenantMobileNav token={token} />
      </div>
    </>
  );
}
