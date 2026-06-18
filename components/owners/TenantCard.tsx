"use client";

import { motion } from "framer-motion";
import type { Tenant, RentEntry } from "@/lib/notion";

interface Props {
  tenant: Tenant;
  rentHistory: RentEntry[]; // last 6 months
  index: number;
}

function leaseCountdown(leaseEnd: string | null): { text: string; color: string } {
  if (!leaseEnd) return { text: "No end date", color: "#9AA5B1" };
  const days = Math.floor((new Date(leaseEnd).getTime() - Date.now()) / 864e5);
  if (days < 0) return { text: `Expired ${Math.abs(days)}d ago`, color: "#dc2626" };
  if (days === 0) return { text: "Expires today", color: "#d97706" };
  if (days <= 60) return { text: `${days} days left`, color: "#d97706" };
  if (days <= 90) return { text: `${Math.floor(days / 30)}mo left`, color: "#d97706" };
  const months = Math.floor(days / 30);
  const remaining = days % 30;
  return {
    text: `${months}mo ${remaining}d left`,
    color: "#9AA5B1",
  };
}

function PaymentDot({ status }: { status: string }) {
  const s = status.toLowerCase();
  let color = "#E8E4DF";
  if (s === "paid" || s === "on time") color = "#16a34a";
  else if (s === "partial") color = "#d97706";
  else if (s === "unpaid" || s === "late" || s === "overdue") color = "#dc2626";

  return (
    <div
      title={status}
      style={{
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
      }}
    />
  );
}

export function TenantCard({ tenant, rentHistory, index }: Props) {
  const countdown = leaseCountdown(tenant.leaseEnd);
  const last6 = rentHistory.slice(-6);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      style={{
        background: "#FFFFFF",
        border: "1px solid #E8E4DF",
        borderRadius: "16px",
        padding: "20px",
      }}
    >
      {/* Name + rent */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "rgba(139,32,48,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ color: "#8B2030", fontSize: "14px", fontWeight: 600, fontFamily: "var(--font-outfit)" }}>
              {tenant.name.charAt(0)}
            </span>
          </div>
          <div>
            <p style={{ color: "#1F2F3A", fontWeight: 600, fontSize: "14px", fontFamily: "var(--font-outfit)" }}>
              {tenant.name}
            </p>
            <p style={{ color: "#9AA5B1", fontSize: "12px" }}>
              {tenant.status}
            </p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ color: "#8B2030", fontWeight: 700, fontSize: "15px", fontFamily: "var(--font-outfit)" }}>
            ${tenant.monthlyRent?.toLocaleString() ?? "—"}/mo
          </p>
        </div>
      </div>

      {/* Lease dates */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px",
          background: "#F7F5F2",
          borderRadius: "10px",
          marginBottom: "12px",
        }}
      >
        <div>
          <p style={{ color: "#9AA5B1", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>
            Lease Period
          </p>
          <p style={{ color: "#5A6A7A", fontSize: "12px" }}>
            {tenant.leaseStart
              ? new Date(tenant.leaseStart).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })
              : "—"}
            {" → "}
            {tenant.leaseEnd
              ? new Date(tenant.leaseEnd).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })
              : "Month-to-month"}
          </p>
        </div>
        <span style={{ color: countdown.color, fontSize: "12px", fontWeight: 500 }}>
          {countdown.text}
        </span>
      </div>

      {/* Payment history dots */}
      {last6.length > 0 && (
        <div>
          <p style={{ color: "#9AA5B1", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
            Payment history (last {last6.length} months)
          </p>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {last6.map((r, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                <PaymentDot status={r.paymentStatus} />
                <span style={{ color: "#9AA5B1", fontSize: "9px" }}>
                  {r.month.slice(0, 1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
