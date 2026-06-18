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

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />

      <div style={{ minHeight: "100vh", background: "#090E17" }}>
        <OwnerHeader firstName={firstNames} token={token} />

        <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px 100px" }}>
          <Link
            href={`/owners/${token}`}
            style={{ color: "rgba(237,232,225,0.42)", fontSize: "13px", textDecoration: "none", display: "inline-block", marginBottom: "24px" }}
          >
            ← Back
          </Link>

          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "clamp(36px, 5vw, 52px)",
              fontWeight: 300,
              color: "#EDE8E1",
              letterSpacing: "-0.02em",
              marginBottom: "40px",
            }}
          >
            Documents
          </h1>

          {dashboard.properties.map((propData, idx) => {
            const { property } = propData;
            const initialDocuments = (documentResults[idx].data ?? []) as OwnerDocument[];

            return (
              <div key={property.id}>
                {multiProperty && (
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "rgba(237,232,225,0.42)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px", marginTop: idx > 0 ? "40px" : "0" }}>
                    {property.address}
                  </p>
                )}

                <DocumentList
                  propertyId={property.id}
                  token={token}
                  initialDocuments={initialDocuments}
                />

                {multiProperty && idx < dashboard.properties.length - 1 && (
                  <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "40px 0" }} />
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
