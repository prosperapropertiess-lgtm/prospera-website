import { notFound } from "next/navigation";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getDashboard } from "@/lib/owners-data";
import { MaintenanceList } from "@/components/owners/MaintenanceList";
import { MobileNav } from "@/components/owners/MobileNav";
import OwnerHeader from "@/components/owners/OwnerHeader";

interface Props {
  params: Promise<{ token: string }>;
}

export const revalidate = 21600;

export default async function MaintenancePage({ params }: Props) {
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
  const totalOpen = dashboard.properties.reduce((s, p) => s + p.maintenanceOpen.length, 0);
  const totalResolved = dashboard.properties.reduce((s, p) => s + p.maintenanceCompletedRecent.length, 0);
  const hasAny = dashboard.properties.some(
    p => p.maintenanceOpen.length > 0 || p.maintenanceCompletedRecent.length > 0
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
              fontSize: "13px",
              textDecoration: "none",
              display: "inline-block",
              marginBottom: "28px",
              fontFamily: "var(--font-dm-sans)",
              fontWeight: 500,
            }}
          >
            ← Back
          </Link>

          <div style={{ display: "flex", alignItems: "baseline", gap: "14px", marginBottom: "8px" }}>
            <h1
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "clamp(40px, 6vw, 60px)",
                fontWeight: 300,
                color: "#0F1C28",
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              Maintenance
            </h1>
          </div>

          {/* Stats pills */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "32px", flexWrap: "wrap" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 12px",
                borderRadius: "100px",
                background: totalOpen > 0 ? "rgba(180,83,9,0.09)" : "rgba(10,122,82,0.09)",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: totalOpen > 0 ? "#B45309" : "#0A7A52",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: totalOpen > 0 ? "#B45309" : "#0A7A52",
                }}
              >
                {totalOpen} open
              </span>
            </div>
            {totalResolved > 0 && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 12px",
                  borderRadius: "100px",
                  background: "rgba(10,122,82,0.09)",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#0A7A52",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#0A7A52",
                  }}
                >
                  {totalResolved} resolved recently
                </span>
              </div>
            )}
          </div>

          {!hasAny ? (
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(15,28,40,0.07)",
                borderRadius: "20px",
                padding: "48px 24px",
                textAlign: "center",
                boxShadow: "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "32px", color: "#0A7A52", display: "block", marginBottom: "10px" }}
              >
                check_circle
              </span>
              <p
                style={{
                  color: "#0A7A52",
                  fontSize: "14px",
                  fontFamily: "var(--font-dm-sans)",
                  fontWeight: 500,
                }}
              >
                No open maintenance issues — all clear.
              </p>
            </div>
          ) : (
            dashboard.properties.map((propData, idx) => {
              const { property, maintenanceOpen, maintenanceCompletedRecent } = propData;
              const hasPropMaintenance =
                maintenanceOpen.length > 0 || maintenanceCompletedRecent.length > 0;
              if (!hasPropMaintenance) return null;

              return (
                <div key={property.id}>
                  {multiProperty && (
                    <p
                      style={{
                        fontSize: "11px",
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

                  {/* Wrap MaintenanceList in a white card */}
                  <div
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid rgba(15,28,40,0.07)",
                      borderRadius: "20px",
                      padding: "20px",
                      boxShadow: "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)",
                    }}
                  >
                    <MaintenanceListLight
                      open={maintenanceOpen}
                      completed={maintenanceCompletedRecent}
                    />
                  </div>

                  {multiProperty &&
                    idx < dashboard.properties.length - 1 &&
                    hasPropMaintenance && (
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
            })
          )}
        </main>

        <MobileNav token={token} />
      </div>
    </>
  );
}

// Light-theme maintenance list (replaces the dark MaintenanceList component inline)
type MaintenanceItem = {
  id: string;
  issue: string;
  priority?: string | null;
  category?: string | null;
  daysPending?: number | null;
  dateCompleted?: string | null;
};

const PRIORITY_STYLE: Record<string, { color: string; bg: string; border: string; leftBorder: string }> = {
  critical: {
    color: "#B91C1C",
    bg: "rgba(185,28,28,0.08)",
    border: "rgba(185,28,28,0.18)",
    leftBorder: "#B91C1C",
  },
  high: {
    color: "#B45309",
    bg: "rgba(180,83,9,0.09)",
    border: "rgba(180,83,9,0.18)",
    leftBorder: "#B45309",
  },
  medium: {
    color: "#B45309",
    bg: "rgba(180,83,9,0.06)",
    border: "rgba(180,83,9,0.12)",
    leftBorder: "#B45309",
  },
  low: {
    color: "rgba(15,28,40,0.45)",
    bg: "rgba(15,28,40,0.04)",
    border: "rgba(15,28,40,0.07)",
    leftBorder: "rgba(15,28,40,0.12)",
  },
};

function MaintenanceListLight({
  open,
  completed,
}: {
  open: MaintenanceItem[];
  completed: MaintenanceItem[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {open.map((item) => {
        const p = PRIORITY_STYLE[(item.priority ?? "low").toLowerCase()] ?? PRIORITY_STYLE.low;
        return (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "14px 16px",
              background: p.bg,
              border: `1px solid ${p.border}`,
              borderLeft: `4px solid ${p.leftBorder}`,
              borderRadius: "12px",
            }}
          >
            <div
              style={{
                padding: "3px 8px",
                borderRadius: "6px",
                background: "rgba(255,255,255,0.6)",
                border: `1px solid ${p.border}`,
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  color: p.color,
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                {item.priority ?? "low"}
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  color: "#0F1C28",
                  fontSize: "13px",
                  fontWeight: 500,
                  marginBottom: "2px",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                {item.issue}
              </p>
              <p
                style={{
                  color: "rgba(15,28,40,0.45)",
                  fontSize: "11px",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                {item.category}
                {item.daysPending != null && ` · ${item.daysPending}d pending`}
              </p>
            </div>
          </div>
        );
      })}

      {completed.map((item) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 14px",
            background: "rgba(10,122,82,0.05)",
            borderRadius: "12px",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "16px", color: "#0A7A52", flexShrink: 0 }}
          >
            check_circle
          </span>
          <div style={{ flex: 1 }}>
            <p
              style={{
                color: "rgba(15,28,40,0.45)",
                fontSize: "13px",
                textDecoration: "line-through",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              {item.issue}
            </p>
          </div>
          <span
            style={{
              color: "#0A7A52",
              fontSize: "11px",
              fontFamily: "var(--font-dm-sans)",
              fontWeight: 600,
            }}
          >
            {item.dateCompleted
              ? new Date(item.dateCompleted).toLocaleDateString("en-CA", {
                  month: "short",
                  day: "numeric",
                })
              : "Done"}
          </span>
        </div>
      ))}
    </div>
  );
}
