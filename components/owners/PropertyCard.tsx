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
    return { label: "Needs Attention", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" };
  }
  if (unpaid.length > 0) {
    return { label: "Rent Pending", color: "#d97706", bg: "#fffbeb", border: "#fde68a" };
  }
  if (openIssues > 0) {
    return { label: "Maintenance Open", color: "#d97706", bg: "#fffbeb", border: "#fde68a" };
  }
  return { label: "All Good", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" };
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
      // opacity always 1 — content must never be hidden
      initial={{ opacity: 1, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
    >
      <Link href={`/owners/${token}/${property.id}`} style={{ textDecoration: "none" }}>
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E8E4DF",
            borderRadius: "16px",
            overflow: "hidden",
            cursor: "pointer",
            transition: "box-shadow 0.3s, border-color 0.3s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
            (e.currentTarget as HTMLDivElement).style.borderColor = "#D4CFC9";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            (e.currentTarget as HTMLDivElement).style.borderColor = "#E8E4DF";
          }}
        >
          {/* Property image placeholder */}
          <div
            style={{
              height: "140px",
              background: "#F0EDE8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "48px", color: "#C8BFB5" }}
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
                border: `1px solid ${badge.border}`,
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
              <span style={{ color: badge.color, fontSize: "14px", fontWeight: 600 }}>
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
                background: "rgba(255,255,255,0.85)",
                border: "1px solid #E8E4DF",
              }}
            >
              <span style={{ color: "#5A6A7A", fontSize: "14px" }}>
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
                color: "#1F2F3A",
                marginBottom: "4px",
                letterSpacing: "-0.02em",
              }}
            >
              {property.address}
            </h3>
            <p style={{ color: "#5A6A7A", fontSize: "16px", marginBottom: "16px" }}>
              {property.city}
            </p>

            {/* Stats row */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <StatChip
                icon="payments"
                label={`$${currentMonthRent.toLocaleString()}/mo`}
              />
              <StatChip
                icon="trending_up"
                label={`$${ytdNet.toLocaleString()} in pocket`}
                valueColor={ytdNet >= 0 ? "#16a34a" : "#dc2626"}
              />
              {openIssuesCount > 0 && (
                <StatChip
                  icon="build"
                  label={`${openIssuesCount} issue${openIssuesCount > 1 ? "s" : ""}`}
                  valueColor="#d97706"
                />
              )}
              {nextLeaseExpiry && (
                <StatChip
                  icon="calendar_today"
                  label={`Lease ${leaseCountdownShort(nextLeaseExpiry)}`}
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "12px 20px",
              borderTop: "1px solid #E8E4DF",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ color: "#9AA5B1", fontSize: "15px" }}>
              View details →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function StatChip({ icon, label, valueColor }: { icon: string; label: string; valueColor?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: "4px 8px",
        borderRadius: "8px",
        background: "#F7F5F2",
        border: "1px solid #E8E4DF",
      }}
    >
      <span
        className="material-symbols-outlined"
        style={{ fontSize: "15px", color: valueColor ?? "#5A6A7A" }}
      >
        {icon}
      </span>
      <span style={{ color: valueColor ?? "#5A6A7A", fontSize: "14px", fontWeight: 500 }}>{label}</span>
    </div>
  );
}
