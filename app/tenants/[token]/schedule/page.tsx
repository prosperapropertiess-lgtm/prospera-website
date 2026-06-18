import { notFound } from "next/navigation";
import Link from "next/link";
import {
  validateTenantToken,
  getTenantInfo,
  getPropertySchedule,
} from "@/lib/tenant-data";
import TenantHeader from "@/components/tenants/TenantHeader";
import { TenantMobileNav } from "@/components/tenants/TenantMobileNav";

const PAGE_BG = "#090E17";
const CARD = "#0D1825";
const CARD_BORDER = "rgba(255,255,255,0.07)";
const TEXT = "#EDE8E1";
const TEXT_SEC = "rgba(237,232,225,0.42)";
const TEXT_DIM = "rgba(237,232,225,0.20)";
const GREEN = "#34d399";
const AMBER = "#fbbf24";
const BLUE = "#60a5fa";
const PURPLE = "#a78bfa";

interface Props {
  params: Promise<{ token: string }>;
}

export const revalidate = 3600;

function eventTypeColor(type: string): string {
  if (type === "inspection") return PURPLE;
  if (type === "maintenance") return AMBER;
  if (type === "reminder") return BLUE;
  if (type === "garbage") return GREEN;
  return TEXT_SEC;
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
            Schedule & Reminders
          </h1>

          {/* Garbage reminder strip — always visible */}
          <div
            style={{
              background: "rgba(52,211,153,0.06)",
              border: "1px solid rgba(52,211,153,0.15)",
              borderRadius: "14px",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "32px",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px", color: GREEN, flexShrink: 0 }}>
              delete
            </span>
            <p style={{ fontSize: "13px", fontFamily: "var(--font-dm-sans)", color: TEXT_SEC, lineHeight: "1.5" }}>
              <span style={{ color: TEXT, fontWeight: 600 }}>Garbage & Recycling</span> — Check your local municipality schedule or ask Ebin for your specific pickup days.
            </p>
          </div>

          {/* Upcoming events */}
          {futureEvents.length === 0 ? (
            <div
              style={{
                background: CARD,
                border: `1px solid ${CARD_BORDER}`,
                borderRadius: "22px",
                padding: "60px 24px",
                textAlign: "center",
                marginBottom: "32px",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "40px", color: TEXT_DIM, display: "block", marginBottom: "16px" }}>
                event_available
              </span>
              <p style={{ color: TEXT_SEC, fontSize: "14px", fontFamily: "var(--font-dm-sans)", lineHeight: "1.6", maxWidth: "300px", margin: "0 auto" }}>
                No upcoming events. Ebin will add inspections, reminders, and important dates here.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "40px" }}>
              {futureEvents.map((event) => {
                const d = new Date(event.event_date!);
                const month = MONTH_ABBR[d.getMonth()];
                const day = d.getDate();
                const color = eventTypeColor(event.event_type);

                return (
                  <div
                    key={event.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "16px",
                    }}
                  >
                    {/* Date chip */}
                    <div
                      style={{
                        background: CARD,
                        border: `1px solid ${color}30`,
                        borderRadius: "12px",
                        padding: "10px 14px",
                        textAlign: "center",
                        minWidth: "56px",
                        flexShrink: 0,
                      }}
                    >
                      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "10px", fontWeight: 600, color: color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>
                        {month}
                      </p>
                      <p style={{ fontFamily: "var(--font-outfit)", fontSize: "20px", fontWeight: 700, color: TEXT, lineHeight: 1 }}>
                        {day}
                      </p>
                    </div>

                    {/* Event details */}
                    <div
                      style={{
                        background: CARD,
                        border: `1px solid ${CARD_BORDER}`,
                        borderRadius: "14px",
                        padding: "14px 18px",
                        flex: 1,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                        <p style={{ fontFamily: "var(--font-outfit)", fontSize: "15px", fontWeight: 600, color: TEXT }}>
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
                            background: `${color}15`,
                            color: color,
                          }}
                        >
                          {event.event_type}
                        </span>
                      </div>
                      {event.description && (
                        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: TEXT_SEC, lineHeight: "1.5" }}>
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
                  color: TEXT_DIM,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "14px",
                }}
              >
                Recurring Reminders
              </p>
              <div
                style={{
                  background: CARD,
                  border: `1px solid ${CARD_BORDER}`,
                  borderRadius: "22px",
                  overflow: "hidden",
                }}
              >
                {recurringEvents.map((event, idx) => {
                  const color = eventTypeColor(event.event_type);
                  return (
                    <div
                      key={event.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "16px 20px",
                        borderBottom: idx < recurringEvents.length - 1 ? `1px solid rgba(255,255,255,0.05)` : "none",
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "18px", color, flexShrink: 0 }}>
                        repeat
                      </span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: "var(--font-outfit)", fontSize: "14px", fontWeight: 600, color: TEXT, marginBottom: "2px" }}>
                          {event.title}
                        </p>
                        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: TEXT_SEC }}>
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
