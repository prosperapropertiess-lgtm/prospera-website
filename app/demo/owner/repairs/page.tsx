import Link from "next/link";
import DemoShell from "@/components/demo/DemoShell";
import { DEMO_OWNER, MAINTENANCE } from "@/lib/demo-data";

const NAVY = "#1F2F3A";
const BURGUNDY = "#8B2030";
const GREEN = "#0A7A52";
const AMBER = "#B45309";
const WHITE = "#FFFFFF";
const BORDER = "rgba(15,28,40,0.08)";
const MUTED = "rgba(15,28,40,0.45)";
const SUBTLE = "rgba(15,28,40,0.65)";
const CARD_SHADOW = "0 1px 3px rgba(15,28,40,0.05), 0 4px 16px rgba(15,28,40,0.06)";

const PRIORITY_COLOR: Record<string, string> = { Low: MUTED, Medium: AMBER, High: BURGUNDY };
const STATUS_BG: Record<string, string> = {
  "Open": "rgba(180,83,9,0.09)",
  "In Progress": "rgba(31,47,58,0.09)",
  "Done": "rgba(10,122,82,0.09)",
};
const STATUS_COLOR: Record<string, string> = {
  "Open": AMBER,
  "In Progress": NAVY,
  "Done": GREEN,
};

export default function OwnerRepairsPage() {
  const open = MAINTENANCE.filter(m => m.status === "Open");
  const inProgress = MAINTENANCE.filter(m => m.status === "In Progress");
  const done = MAINTENANCE.filter(m => m.status === "Done");

  return (
    <DemoShell mode="owner" name={DEMO_OWNER.name} initials={DEMO_OWNER.initials}>

      <Link href="/demo/owner" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: MUTED, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "20px", fontWeight: 500 }}>
        ← Back
      </Link>

      <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "32px", fontWeight: 700, color: NAVY, marginBottom: "8px", letterSpacing: "-0.01em" }}>Repairs</h1>
      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: MUTED, marginBottom: "24px" }}>
        {open.length + inProgress.length} open · {done.length} completed
      </p>

      {/* Summary chips */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
        {[
          { label: `${open.length} Open`, color: AMBER, bg: "rgba(180,83,9,0.09)" },
          { label: `${inProgress.length} In Progress`, color: NAVY, bg: "rgba(31,47,58,0.09)" },
          { label: `${done.length} Completed`, color: GREEN, bg: "rgba(10,122,82,0.09)" },
        ].map(c => (
          <span key={c.label} style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", fontWeight: 700, color: c.color, background: c.bg, borderRadius: "20px", padding: "6px 14px" }}>
            {c.label}
          </span>
        ))}
      </div>

      {/* Active tickets */}
      {[...open, ...inProgress].map(ticket => (
        <div key={ticket.id} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${ticket.status === "In Progress" ? NAVY : AMBER}`, borderRadius: "16px", padding: "18px 20px", marginBottom: "10px", boxShadow: CARD_SHADOW }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "8px" }}>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "15px", fontWeight: 700, color: NAVY }}>{ticket.title}</p>
            <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "10px", background: STATUS_BG[ticket.status], color: STATUS_COLOR[ticket.status], fontFamily: "var(--font-dm-sans)", whiteSpace: "nowrap", flexShrink: 0 }}>
              {ticket.status}
            </span>
          </div>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: SUBTLE, lineHeight: 1.5, marginBottom: "12px" }}>{ticket.description}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "10px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Reported</span>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: NAVY, fontWeight: 600, marginTop: "2px" }}>{ticket.dateReported}</p>
            </div>
            <div>
              <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "10px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Category</span>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: NAVY, fontWeight: 600, marginTop: "2px" }}>{ticket.category}</p>
            </div>
            <div>
              <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "10px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Priority</span>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", fontWeight: 700, color: PRIORITY_COLOR[ticket.priority], marginTop: "2px" }}>{ticket.priority}</p>
            </div>
            {ticket.vendor && (
              <div>
                <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "10px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Vendor</span>
                <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: NAVY, fontWeight: 600, marginTop: "2px" }}>{ticket.vendor}</p>
              </div>
            )}
          </div>
          {ticket.notes && (
            <div style={{ marginTop: "12px", background: "rgba(31,47,58,0.04)", borderRadius: "8px", padding: "10px 12px" }}>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: SUBTLE, lineHeight: 1.5 }}>
                <span style={{ fontWeight: 700, color: NAVY }}>Update: </span>{ticket.notes}
              </p>
            </div>
          )}
        </div>
      ))}

      {/* Completed */}
      <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.10em", fontWeight: 700, marginBottom: "10px", marginTop: "24px" }}>
        Completed (last 60 days)
      </p>
      {done.map(ticket => (
        <div key={ticket.id} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: "16px", padding: "18px 20px", marginBottom: "8px", opacity: 0.85, boxShadow: CARD_SHADOW }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "6px" }}>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", fontWeight: 700, color: NAVY }}>{ticket.title}</p>
            <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "10px", background: STATUS_BG["Done"], color: GREEN, fontFamily: "var(--font-dm-sans)", whiteSpace: "nowrap", flexShrink: 0 }}>
              Done
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "10px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Completed</span>
              <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: NAVY, fontWeight: 600, marginTop: "2px" }}>{ticket.dateCompleted}</p>
            </div>
            {ticket.vendor && (
              <div>
                <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "10px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Vendor</span>
                <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: NAVY, fontWeight: 600, marginTop: "2px" }}>{ticket.vendor}</p>
              </div>
            )}
            {ticket.cost !== undefined && (
              <div>
                <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "10px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Cost</span>
                <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", fontWeight: 700, color: ticket.cost === 0 ? GREEN : AMBER, marginTop: "2px" }}>{ticket.cost === 0 ? "No charge" : `$${ticket.cost}`}</p>
              </div>
            )}
          </div>
          {ticket.notes && (
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: MUTED, marginTop: "10px", lineHeight: 1.5 }}>{ticket.notes}</p>
          )}
        </div>
      ))}
    </DemoShell>
  );
}
