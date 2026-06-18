import { notFound } from "next/navigation";
import Link from "next/link";
import {
  validateTenantToken,
  getTenantInfo,
  getPropertySchedule,
} from "@/lib/tenant-data";
import TenantHeader from "@/components/tenants/TenantHeader";
import { TenantMobileNav } from "@/components/tenants/TenantMobileNav";

const BG = "#F5F4F1";
const CARD = "#FFFFFF";
const CARD_BORDER = "rgba(15,28,40,0.07)";
const CARD_SHADOW = "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)";
const NAVY = "#0F1C28";
const MUTED = "rgba(15,28,40,0.45)";
const SUBTLE = "rgba(15,28,40,0.22)";
const GREEN = "#0A7A52";
const GREEN_BG = "rgba(10,122,82,0.09)";
const AMBER = "#B45309";
const AMBER_BG = "rgba(180,83,9,0.09)";
const BLUE = "#1D4ED8";
const BLUE_BG = "rgba(29,78,216,0.08)";
const PURPLE = "#7C3AED";
const PURPLE_BG = "rgba(124,58,237,0.08)";
const RADIUS = "20px";
const RADIUS_SM = "12px";

interface Props {
  params: Promise<{ token: string }>;
}

export const revalidate = 3600;

function eventTypeStyle(type: string): { color: string; bg: string } {
  if (type === "inspection") return { color: PURPLE, bg: PURPLE_BG };
  if (type === "maintenance") return { color: AMBER, bg: AMBER_BG };
  if (type === "reminder") return { color: BLUE, bg: BLUE_BG };
  if (type === "garbage") return { color: GREEN, bg: GREEN_BG };
  return { color: MUTED, bg: "rgba(15,28,40,0.05)" };
}

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default async function SchedulePage({ params }: Props) {
  const { token } = await params;

  const access = await validateTenantToken(token);
  if (!access) return notFound();

  const [tenant, events] = await Promise.all([
    getTenantInfo(access.notion_tenant_id),
    getPropertySchedule(access.property_id),
  ]);

  if (!tenant) return notFound();

  const firstName = tenant.name.split(" ")[0];
  const now = new Date();

  const futureEvents = events
    .filter(e => e.event_date && new Date(e.event_date) >= now && !e.recurring)
    .sort((a, b) => new Date(a.event_date!).getTime() - new Date(b.event_date!).getTime());

  const recurringEvents = events.filter(e => e.recurring !== null);

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
            Schedule & Reminders
          </h1>

          {/* Garbage reminder strip */}
          <div
            style={{
              background: GREEN_BG,
              border: "1px solid rgba(10,122,82,0.18)",
              borderRadius: RADIUS_SM,
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(10,122,82,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px", color: GREEN }}>
                delete
              </span>
            </div>
            <p style={{ fontSize: "13px", fontFamily: "var(--font-dm-sans)", color: MUTED, lineHeight: "1.5" }}>
              <span style={{ color: NAVY, fontWeight: 600 }}>Garbage & Recycling</span> — Check your local municipality schedule or ask Ebin for your specific pickup days.
            </p>
          </div>

          {/* Upcoming events */}
          {futureEvents.length === 0 ? (
            <div
              style={{
                background: CARD,
                border: `1px solid ${CARD_BORDER}`,
                borderRadius: RADIUS,
                boxShadow: CARD_SHADOW,
                padding: "60px 24px",
                textAlign: "center",
                marginBottom: "32px",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "40px", color: SUBTLE, display: "block", marginBottom: "16px" }}>
                event_available
              </span>
              <p style={{ color: MUTED, fontSize: "14px", fontFamily: "var(--font-dm-sans)", lineHeight: "1.6", maxWidth: "300px", margin: "0 auto" }}>
                No upcoming events. Ebin will add inspections, reminders, and important dates here.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "36px" }}>
              {futureEvents.map((event) => {
                const d = new Date(event.event_date!);
                const month = MONTH_ABBR[d.getMonth()];
                const day = d.getDate();
                const { color, bg } = eventTypeStyle(event.event_type);

                return (
                  <div
                    key={event.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                    }}
                  >
                    {/* Date chip — navy bg, white text */}
                    <div
                      style={{
                        background: NAVY,
                        borderRadius: "12px",
                        padding: "10px 12px",
                        textAlign: "center",
                        minWidth: "52px",
                        flexShrink: 0,
                      }}
                    >
                      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.60)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>
                        {month}
                      </p>
                      <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "22px", fontWeight: 500, color: "#FFFFFF", lineHeight: 1 }}>
                        {day}
                      </p>
                    </div>

                    {/* Event details */}
                    <div
                      style={{
                        background: CARD,
                        border: `1px solid ${CARD_BORDER}`,
                        borderRadius: "14px",
                        boxShadow: CARD_SHADOW,
                        padding: "14px 18px",
                        flex: 1,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: event.description ? "6px" : "0" }}>
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "6px",
                            background: bg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "13px", color }}>
                            {event.event_type === "inspection" ? "search" :
                             event.event_type === "maintenance" ? "build" :
                             event.event_type === "reminder" ? "notifications" : "event"}
                          </span>
                        </div>
                        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "15px", fontWeight: 700, color: NAVY }}>
                          {event.title}
                        </p>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            borderRadius: "100px",
                            fontSize: "11px",
                            fontWeight: 600,
                            fontFamily: "var(--font-dm-sans)",
                            background: bg,
                            color: color,
                          }}
                        >
                          {event.event_type}
                        </span>
                      </div>
                      {event.description && (
                        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: MUTED, lineHeight: "1.5" }}>
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recurring reminders */}
          {recurringEvents.length > 0 && (
            <div>
              <p
                style={{
                  fontSize: "11px",
                  fontFamily: "var(--font-dm-sans)",
                  color: SUBTLE,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "14px",
                  fontWeight: 600,
                }}
              >
                Recurring Reminders
              </p>
              <div
                style={{
                  background: CARD,
                  border: `1px solid ${CARD_BORDER}`,
                  borderRadius: RADIUS,
                  boxShadow: CARD_SHADOW,
                  overflow: "hidden",
                }}
              >
                {recurringEvents.map((event, idx) => {
                  const { color, bg } = eventTypeStyle(event.event_type);
                  return (
                    <div
                      key={event.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "16px 20px",
                        borderBottom: idx < recurringEvents.length - 1 ? `1px solid ${CARD_BORDER}` : "none",
                      }}
                    >
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          background: bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "16px", color }}>
                          repeat
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", fontWeight: 700, color: NAVY, marginBottom: "2px" }}>
                          {event.title}
                        </p>
                        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: MUTED }}>
                          {event.recurring}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </main>

        <TenantMobileNav token={token} />
      </div>
    </>
  );
}
