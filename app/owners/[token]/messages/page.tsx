import { notFound } from "next/navigation";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getDashboard } from "@/lib/owners-data";
import { PropertyFeed } from "@/components/owners/PropertyFeed";
import type { PropertyMessage } from "@/components/owners/PropertyFeed";
import { MobileNav } from "@/components/owners/MobileNav";
import OwnerHeader from "@/components/owners/OwnerHeader";

interface Props {
  params: Promise<{ token: string }>;
}

export const revalidate = 21600;

export default async function MessagesPage({ params }: Props) {
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

  // Fetch messages for all properties in parallel
  const messageResults = await Promise.all(
    dashboard.properties.map(p =>
      getSupabaseAdmin()
        .from("property_messages")
        .select("id, author, author_name, content, message_type, created_at")
        .eq("property_id", p.property.id)
        .order("created_at", { ascending: true })
        .limit(50)
    )
  );

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
            Messages
          </h1>

          {dashboard.properties.map((propData, idx) => {
            const { property } = propData;
            const initialMessages = (messageResults[idx].data ?? []) as PropertyMessage[];

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

                {/* PropertyFeed wrapped in light card */}
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(15,28,40,0.07)",
                    borderRadius: "20px",
                    overflow: "hidden",
                    boxShadow: "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)",
                  }}
                >
                  <PropertyFeedLight
                    propertyId={property.id}
                    token={token}
                    ownerName={firstNames}
                    propertyAddress={property.address}
                    initialMessages={initialMessages}
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

// Light-theme wrapper that passes through to PropertyFeed with light styling context
// The actual PropertyFeed component is kept as-is (dark). We re-export with a wrapper div.
function PropertyFeedLight(props: {
  propertyId: string;
  token: string;
  ownerName: string;
  propertyAddress: string;
  initialMessages: PropertyMessage[];
}) {
  return <PropertyFeed {...props} />;
}
