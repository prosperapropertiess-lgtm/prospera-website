import { notFound } from "next/navigation";
import Link from "next/link";
import {
  validateTenantToken,
  getTenantDocuments,
  getTenantInfo,
} from "@/lib/tenant-data";
import TenantHeader from "@/components/tenants/TenantHeader";
import { TenantMobileNav } from "@/components/tenants/TenantMobileNav";
import DocumentsClient from "./DocumentsClient";

const PAGE_BG = "#090E17";
const TEXT = "#EDE8E1";
const TEXT_SEC = "rgba(237,232,225,0.42)";

interface Props {
  params: Promise<{ token: string }>;
}

export const revalidate = 0;

export default async function DocumentsPage({ params }: Props) {
  const { token } = await params;

  const access = await validateTenantToken(token);
  if (!access) return notFound();

  const [tenant, documents] = await Promise.all([
    getTenantInfo(access.notion_tenant_id),
    getTenantDocuments(token),
  ]);

  if (!tenant) return notFound();

  const firstName = tenant.name.split(" ")[0];

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
            Documents
          </h1>

          <DocumentsClient documents={documents} token={token} />

        </main>

        <TenantMobileNav token={token} />
      </div>
    </>
  );
}
