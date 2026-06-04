"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { PropertyDashboard } from "@/lib/owners-data";

interface PropertyCardProps {
  data: PropertyDashboard;
  token: string;
  index: number;
}

function statusBadge(openIssues: number, rentCurrentMonth: { paymentStatus: string }[]) {
  const unpaid = rentCurrentMonth.filter(r => {
    const s = r.paymentStatus.toLowerCase();
    return s === "unpaid" || s === "late" || s === "overdue";
  });

  if (openIssues > 0 && unpaid.length > 0) {
    return { label: "Needs Attention", color: "#ef4444", bg: "rgba(239,68,68,0.15)" };
  }
  if (unpaid.length > 0) {
    return { label: "Rent Pending", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" };
  }
  if (openIssues > 0) {
    return { label: "Maintenance Open", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" };
  }
  return { label: "All Good", color: "#22c55e", bg: "rgba(34,197,94,0.15)" };
}

function leaseCountdownShort(leaseEnd: string | null): string {
  if (!leaseEnd) return "—";
  const days = Math.floor((new Date(leaseEnd).getTime() - Date.now()) / 864e5);
  if (days < 0) return "Expired";
  if (days === 0) return "Today";
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  return `${months}mo`;
}

export function PropertyCard({ data, token, index }: PropertyCardProps) {
  const { property, rentCurrentMonth, openIssuesCount, nextLeaseExpiry, ytdNet } = data;
  const badge = statusBadge(openIssuesCount, rentCurrentMonth);

  const currentMonthRent = rentCurrentMonth.reduce((s, r) => {
    const p = r.amountPaid ?? 0;
    return s + (p > 0 ? p : (r.amountDue ?? 0));
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
    >
      <Link href={`/owners/${token}/${property.id}`} style={{ textDecoration: "none" }}>
        <div
          style={{
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "20px",
            overflow: "hidden",
            cursor: "pointer",
            transition: "box-shadow 0.3s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 20px 60px -15px rgba(0,0,0,0.5)";
            (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.2)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.1)";
          }}
        >
          {/* Property image placeholder with gradient */}
          <div
            style={{
              height: "140px",
              background: "linear-gradient(135deg, #1a2240 0%, #0f1624 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "48px", color: "rgba(255,255,255,0.15)" }}
            >
              home
            </span>
            {/* Status badge */}
            <div
              style={{
                position: "absolute",
                top: "12px",
                left: "12px",
                padding: "4px 10px",
                borderRadius: "20px",
                background: badge.bg,
                border: `1px solid ${badge.color}40`,
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: badge.color,
                }}
              />
              <span style={{ color: badge.color, fontSize: "11px", fontWeight: 600 }}>
                {badge.label}
              </span>
            </div>
            {/* Property type chip */}
            <div
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                padding: "4px 10px",
                borderRadius: "20px",
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }}>
                {property.type}
              </span>
            </div>
          </div>

          {/* Card body */}
          <div style={{ padding: "20px" }}>
            <h3
              style={{
                fontFamily: "var(--font-outfit)",
                fontSize: "17px",
                fontWeight: 700,
                color: "white",
                marginBottom: "4px",
                letterSpacing: "-0.02em",
              }}
            >
              {property.address}
            </h3>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", marginBottom: "16px" }}>
              {property.city}
            </p>

            {/* Stats row */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <StatChip
                icon="payments"
                label={`$${currentMonthRent.toLocaleString()}/mo`}
                color="rgba(255,255,255,0.7)"
              />
              <StatChip
                icon="trending_up"
                label={`$${ytdNet.toLocaleString()} in pocket`}
                color={ytdNet >= 0 ? "rgba(134,239,172,0.9)" : "rgba(248,113,113,0.9)"}
              />
              {openIssuesCount > 0 && (
                <StatChip
                  icon="build"
                  label={`${openIssuesCount} issue${openIssuesCount > 1 ? "s" : ""}`}
                  color="rgba(251,191,36,0.9)"
                />
              )}
              {nextLeaseExpiry && (
                <StatChip
                  icon="calendar_today"
                  label={`Lease ${leaseCountdownShort(nextLeaseExpiry)}`}
                  color="rgba(255,255,255,0.45)"
                />
              )}
            </div>
          </div>

          {/* Arrow */}
          <div
            style={{
              padding: "12px 20px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>
              View details
            </span>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "16px", color: "rgba(255,255,255,0.3)" }}
            >
              arrow_forward
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function StatChip({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: "4px 8px",
        borderRadius: "8px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <span
        className="material-symbols-outlined"
        style={{ fontSize: "12px", color }}
      >
        {icon}
      </span>
      <span style={{ color, fontSize: "11px", fontWeight: 500 }}>{label}</span>
    </div>
  );
}
