import { notFound } from "next/navigation";
import Link from "next/link";
import {
  validateTenantToken,
  getTenantDocuments,
  getTenantInfo,
} from "@/lib/tenant-data";
import { fetchTenantFiles } from "@/lib/notion";
import { getSupabaseAdmin } from "@/lib/supabase";
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
const GREEN = "#0A7A52";

interface Props {
  params: Promise<{ token: string }>;
}

export const revalidate = 0;

export default async function DocumentsPage({ params }: Props) {
  const { token } = await params;

  const access = await validateTenantToken(token);
  if (!access) return notFound();

  const propertyId = access.property_id;
  const sb = getSupabaseAdmin();

  async function fetchLeaseSession() {
    try {
      const { data } = await sb
        .from("onboarding_sessions")
        .select("lease_storage_path, property_address, created_at")
        .eq("notion_property_id", propertyId)
        .not("lease_storage_path", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      return data ?? null;
    } catch {
      return null;
    }
  }

  const [tenant, documents, notionFiles, leaseSession] = await Promise.all([
    getTenantInfo(access.notion_tenant_id),
    getTenantDocuments(token),
    fetchTenantFiles(access.notion_tenant_id).catch(() => []),
    fetchLeaseSession(),
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
              marginBottom: "32px",
            }}
          >
            Documents
          </h1>

          {leaseSession && (
            <div style={{ marginBottom: "24px" }}>
              <p
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: MUTED,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "12px",
                }}
              >
                Your Lease
              </p>
              <div
                style={{
                  background: CARD,
                  border: `1px solid ${CARD_BORDER}`,
                  borderRadius: RADIUS,
                  boxShadow: CARD_SHADOW,
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "rgba(10,122,82,0.09)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "22px",
                      flexShrink: 0,
                    }}
                  >
                    📄
                  </div>
                  <div>
                    <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "17px", fontWeight: 600, color: NAVY, marginBottom: "2px" }}>
                      Lease Agreement
                    </p>
                    <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: MUTED }}>
                      Uploaded {new Date(leaseSession.created_at).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <a
                  href={`/api/tenants/${token}/lease`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    padding: "10px 20px",
                    borderRadius: "10px",
                    background: GREEN,
                    color: "#FFFFFF",
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "15px",
                    fontWeight: 600,
                    textDecoration: "none",
                    flexShrink: 0,
                  }}
                >
                  Download
                </a>
              </div>
            </div>
          )}

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
