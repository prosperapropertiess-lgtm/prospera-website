"use client";

import { motion } from "framer-motion";
import type { Tenant, RentEntry } from "@/lib/notion";

interface Props {
  tenant: Tenant;
  rentHistory: RentEntry[]; // last 6 months
  index: number;
}

function leaseCountdown(leaseEnd: string | null): { text: string; color: string } {
  if (!leaseEnd) return { text: "No end date", color: "rgba(255,255,255,0.3)" };
  const days = Math.floor((new Date(leaseEnd).getTime() - Date.now()) / 864e5);
  if (days < 0) return { text: `Expired ${Math.abs(days)}d ago`, color: "#ef4444" };
  if (days === 0) return { text: "Expires today", color: "#f59e0b" };
  if (days <= 60) return { text: `${days} days left`, color: "#f59e0b" };
  if (days <= 90) return { text: `${Math.floor(days / 30)}mo left`, color: "#fbbf24" };
  const months = Math.floor(days / 30);
  const remaining = days % 30;
  return {
    text: `${months}mo ${remaining}d left`,
    color: "rgba(255,255,255,0.45)",
  };
}

function PaymentDot({ status }: { status: string }) {
  const s = status.toLowerCase();
  let color = "rgba(255,255,255,0.12)";
  if (s === "paid" || s === "on time") color = "#22c55e";
  else if (s === "partial") color = "#f59e0b";
  else if (s === "unpaid" || s === "late" || s === "overdue") color = "#ef4444";

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
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
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
              background: "linear-gradient(135deg, rgba(139,32,48,0.5), rgba(139,32,48,0.2))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", fontWeight: 600, fontFamily: "var(--font-outfit)" }}>
              {tenant.name.charAt(0)}
            </span>
          </div>
          <div>
            <p style={{ color: "white", fontWeight: 600, fontSize: "14px", fontFamily: "var(--font-outfit)" }}>
              {tenant.name}
            </p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px" }}>
              {tenant.status}
            </p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ color: "white", fontWeight: 700, fontSize: "15px", fontFamily: "var(--font-outfit)" }}>
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
          background: "rgba(255,255,255,0.03)",
          borderRadius: "10px",
          marginBottom: "12px",
        }}
      >
        <div>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>
            Lease Period
          </p>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px" }}>
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
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
            Payment history (last {last6.length} months)
          </p>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {last6.map((r, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                <PaymentDot status={r.paymentStatus} />
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "9px" }}>
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
