import { notFound } from "next/navigation";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getDashboard } from "@/lib/owners-data";
import { DocumentList } from "@/components/owners/DocumentList";
import type { OwnerDocument } from "@/components/owners/DocumentList";
import { MobileNav } from "@/components/owners/MobileNav";
import OwnerHeader from "@/components/owners/OwnerHeader";

interface Props {
  params: Promise<{ token: string }>;
}

export const revalidate = 21600;

export default async function DocumentsPage({ params }: Props) {
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

  // Fetch documents for all properties in parallel
  const documentResults = await Promise.all(
    dashboard.properties.map(p =>
      getSupabaseAdmin()
        .from("owner_documents")
        .select("id, label, category, file_name, file_size, mime_type, uploaded_at")
        .eq("property_id", p.property.id)
        .order("uploaded_at", { ascending: false })
        .limit(50)
    )
  );

  // Check if an onboarding lease exists for this owner
  const { data: onboardingSession } = await sb
    .from("onboarding_sessions")
    .select("lease_storage_path, property_address, created_at")
    .eq("owner_access_token", token)
    .not("lease_storage_path", "is", null)
    .single();

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

          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(40px, 6vw, 60px)",
              fontWeight: 300,
              color: "#0F1C28",
              letterSpacing: "-0.02em",
              marginBottom: "32px",
              lineHeight: 1,
            }}
          >
            Documents
          </h1>

          {/* Lease download card */}
          {onboardingSession && (
            <div style={{ marginBottom: 32 }}>
              <p style={{ margin: "0 0 14px", fontSize: 12, fontWeight: 700, color: "rgba(15,28,40,0.35)", textTransform: "uppercase", letterSpacing: "0.10em", fontFamily: "var(--font-dm-sans)" }}>
                Lease Agreement
              </p>
              <LeaseDownloadCard token={token} propertyAddress={onboardingSession.property_address} uploadedAt={onboardingSession.created_at} />
            </div>
          )}

          {dashboard.properties.map((propData, idx) => {
            const { property } = propData;
            const initialDocuments = (documentResults[idx].data ?? []) as OwnerDocument[];

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

                {/* DocumentList wrapped in white card */}
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(15,28,40,0.07)",
                    borderRadius: "20px",
                    overflow: "hidden",
                    boxShadow: "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)",
                  }}
                >
                  <DocumentListLight
                    propertyId={property.id}
                    token={token}
                    initialDocuments={initialDocuments}
                  />
                </div>

                {multiProperty && idx < dashboard.properties.length - 1 && (
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
          })}
        </main>

        <MobileNav token={token} />
      </div>
    </>
  );
}

function LeaseDownloadCard({ token, propertyAddress, uploadedAt }: {
  token: string;
  propertyAddress: string | null;
  uploadedAt: string | null;
}) {
  const date = uploadedAt
    ? new Date(uploadedAt).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })
    : "";

  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid rgba(15,28,40,0.07)",
      borderRadius: "16px",
      boxShadow: "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)",
      padding: "18px 22px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "16px",
      flexWrap: "wrap" as const,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: "rgba(139,32,48,0.07)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, flexShrink: 0,
        }}>
          📄
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#0F1C28", fontFamily: "var(--font-dm-sans)" }}>
            {propertyAddress ? `Lease — ${propertyAddress}` : "Lease Agreement"}
          </p>
          {date && (
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "rgba(15,28,40,0.45)", fontFamily: "var(--font-dm-sans)" }}>
              Uploaded {date}
            </p>
          )}
        </div>
      </div>
      <a
        href={`/api/owners/${token}/lease`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          background: "#0F1C28",
          color: "#fff",
          borderRadius: 10,
          padding: "9px 18px",
          fontSize: 14,
          fontWeight: 600,
          textDecoration: "none",
          flexShrink: 0,
          fontFamily: "var(--font-dm-sans)",
        }}
      >
        Download
      </a>
    </div>
  );
}

function DocumentListLight(props: {
  propertyId: string;
  token: string;
  initialDocuments: OwnerDocument[];
}) {
  if (props.initialDocuments.length === 0) {
    return (
      <div
        style={{
          padding: "48px 24px",
          textAlign: "center",
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: "32px",
            color: "rgba(15,28,40,0.22)",
            display: "block",
            marginBottom: "10px",
          }}
        >
          folder_open
        </span>
        <p
          style={{
            color: "rgba(15,28,40,0.45)",
            fontSize: "17px",
            fontFamily: "var(--font-dm-sans)",
            lineHeight: 1.6,
          }}
        >
          No documents yet. Ebin will upload your lease and inspection reports here.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "8px 0" }}>
      <DocumentList {...props} />
    </div>
  );
}
