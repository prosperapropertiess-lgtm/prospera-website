import { notFound } from "next/navigation";
import Link from "next/link";
import {
  validateTenantToken,
  getTenantInfo,
  getTenantMessages,
} from "@/lib/tenant-data";
import TenantHeader from "@/components/tenants/TenantHeader";
import { TenantMobileNav } from "@/components/tenants/TenantMobileNav";
import { TenantFeed } from "@/components/tenants/TenantFeed";

const BG = "#F5F4F1";
const NAVY = "#0F1C28";
const MUTED = "rgba(15,28,40,0.45)";

interface Props {
  params: Promise<{ token: string }>;
}

export const revalidate = 0;

export default async function MessagesPage({ params }: Props) {
  const { token } = await params;

  const access = await validateTenantToken(token);
  if (!access) return notFound();

  const [tenant, messages] = await Promise.all([
    getTenantInfo(access.notion_tenant_id),
    getTenantMessages(token),
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
              marginBottom: "6px",
            }}
          >
            Messages
          </h1>
          <p style={{ color: MUTED, fontSize: "13px", fontFamily: "var(--font-dm-sans)", marginBottom: "28px" }}>
            Laura responds instantly. Ebin reviews all conversations.
          </p>

          <TenantFeed
            token={token}
            tenantName={access.tenant_name}
            initialMessages={messages}
          />

        </main>

        <TenantMobileNav token={token} />
      </div>
    </>
  );
}
