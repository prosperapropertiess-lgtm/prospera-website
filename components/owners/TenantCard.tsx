"use client";

import type { Tenant, RentEntry } from "@/lib/notion";

interface Props {
  tenant: Tenant;
  rentHistory: RentEntry[]; // last 6 months
  index: number;
}

function leaseCountdown(leaseEnd: string | null): {
  text: string;
  color: string;
  bg: string;
  daysRemaining: number | null;
  totalDays: number | null;
} {
  if (!leaseEnd) {
    return {
      text: "Month-to-month",
      color: "rgba(15,28,40,0.45)",
      bg: "rgba(15,28,40,0.06)",
      daysRemaining: null,
      totalDays: null,
    };
  }
  const days = Math.floor((new Date(leaseEnd).getTime() - Date.now()) / 864e5);
  if (days < 0) {
    return {
      text: `Expired ${Math.abs(days)}d ago`,
      color: "#B91C1C",
      bg: "rgba(185,28,28,0.08)",
      daysRemaining: 0,
      totalDays: null,
    };
  }
  if (days === 0) {
    return {
      text: "Expires today",
      color: "#B91C1C",
      bg: "rgba(185,28,28,0.08)",
      daysRemaining: 0,
      totalDays: null,
    };
  }
  if (days <= 30) {
    return {
      text: `${days} days left`,
      color: "#B91C1C",
      bg: "rgba(185,28,28,0.08)",
      daysRemaining: days,
      totalDays: 365,
    };
  }
  if (days <= 90) {
    return {
      text: `${days} days left`,
      color: "#B45309",
      bg: "rgba(180,83,9,0.09)",
      daysRemaining: days,
      totalDays: 365,
    };
  }
  const months = Math.floor(days / 30);
  return {
    text: `${months} months left`,
    color: "#0A7A52",
    bg: "rgba(10,122,82,0.09)",
    daysRemaining: days,
    totalDays: 365,
  };
}

function getRentBadge(status: string): { label: string; color: string; bg: string } {
  const s = status.toLowerCase();
  if (s === "paid" || s === "on time") {
    return { label: "Paid ✓", color: "#0A7A52", bg: "rgba(10,122,82,0.09)" };
  }
  if (s === "partial") {
    return { label: "Partial", color: "#B45309", bg: "rgba(180,83,9,0.09)" };
  }
  if (s === "unpaid" || s === "late" || s === "overdue") {
    return { label: "Overdue", color: "#B91C1C", bg: "rgba(185,28,28,0.08)" };
  }
  return { label: status, color: "rgba(15,28,40,0.45)", bg: "rgba(15,28,40,0.06)" };
}

export function TenantCard({ tenant, rentHistory, index }: Props) {
  const countdown = leaseCountdown(tenant.leaseEnd);
  const last6 = rentHistory.slice(-6);

  // Calculate lease progress bar fill
  const progressPct =
    countdown.daysRemaining !== null && countdown.totalDays !== null
      ? Math.max(0, Math.min(100, (countdown.daysRemaining / countdown.totalDays) * 100))
      : null;

  // Latest rent status from rentHistory if available
  const latestRent = last6[last6.length - 1];
  const rentBadge = latestRent ? getRentBadge(latestRent.paymentStatus) : null;

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid rgba(15,28,40,0.07)",
        borderRadius: "20px",
        padding: "20px",
        boxShadow: "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)",
      }}
    >
      {/* Name row + rent badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Avatar — burgundy gradient */}
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #8B2030, #C9A84C)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                color: "white",
                fontSize: "18px",
                fontWeight: 700,
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              {tenant.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p
              style={{
                color: "#0F1C28",
                fontWeight: 700,
                fontSize: "18px",
                fontFamily: "var(--font-dm-sans)",
                marginBottom: "2px",
              }}
            >
              {tenant.name}
            </p>
            <p
              style={{
                color: "rgba(15,28,40,0.45)",
                fontSize: "15px",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              {tenant.status}
            </p>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <p
            style={{
              color: "#8B2030",
              fontFamily: "var(--font-cormorant)",
              fontSize: "22px",
              fontWeight: 600,
              letterSpacing: "-0.01em",
              lineHeight: 1,
            }}
          >
            ${tenant.monthlyRent?.toLocaleString() ?? "—"}
          </p>
          <p
            style={{
              color: "rgba(15,28,40,0.45)",
              fontSize: "14px",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            /month
          </p>
        </div>
      </div>

      {/* Lease dates + countdown */}
      <div
        style={{
          padding: "12px 14px",
          background: "rgba(15,28,40,0.03)",
          borderRadius: "12px",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: progressPct !== null ? "10px" : "0",
          }}
        >
          <div>
            <p
              style={{
                color: "rgba(15,28,40,0.22)",
                fontSize: "16px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "3px",
                fontFamily: "var(--font-dm-sans)",
                fontWeight: 600,
              }}
            >
              Lease Period
            </p>
            <p
              style={{
                color: "rgba(15,28,40,0.55)",
                fontSize: "15px",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              {tenant.leaseStart
                ? new Date(tenant.leaseStart).toLocaleDateString("en-CA", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—"}
              {" → "}
              {tenant.leaseEnd
                ? new Date(tenant.leaseEnd).toLocaleDateString("en-CA", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Month-to-month"}
            </p>
          </div>

          {/* Countdown pill */}
          <div
            style={{
              padding: "4px 10px",
              borderRadius: "100px",
              background: countdown.bg,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                color: countdown.color,
                fontSize: "14px",
                fontWeight: 600,
                fontFamily: "var(--font-dm-sans)",
                whiteSpace: "nowrap",
              }}
            >
              {countdown.text}
            </span>
          </div>
        </div>

        {/* Lease progress bar */}
        {progressPct !== null && (
          <div
            style={{
              height: "4px",
              background: "rgba(15,28,40,0.08)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPct}%`,
                background: countdown.color,
                borderRadius: "2px",
                transition: "width 0.4s ease",
              }}
            />
          </div>
        )}
      </div>

      {/* Rent status badge */}
      {rentBadge && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "4px 10px",
            borderRadius: "100px",
            background: rentBadge.bg,
            marginBottom: last6.length > 1 ? "10px" : "0",
          }}
        >
          <span
            style={{
              color: rentBadge.color,
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            {rentBadge.label}
          </span>
        </div>
      )}

      {/* Payment history dots */}
      {last6.length > 1 && (
        <div>
          <p
            style={{
              color: "rgba(15,28,40,0.22)",
              fontSize: "16px",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "6px",
              fontFamily: "var(--font-dm-sans)",
              fontWeight: 600,
            }}
          >
            Last {last6.length} months
          </p>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {last6.map((r, i) => {
              const s = r.paymentStatus.toLowerCase();
              let dotColor = "rgba(15,28,40,0.12)";
              if (s === "paid" || s === "on time") dotColor = "#0A7A52";
              else if (s === "partial") dotColor = "#B45309";
              else if (s === "unpaid" || s === "late" || s === "overdue") dotColor = "#B91C1C";
              return (
                <div
                  key={i}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}
                >
                  <div
                    title={r.paymentStatus}
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: dotColor,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      color: "rgba(15,28,40,0.22)",
                      fontSize: "9px",
                      fontFamily: "var(--font-dm-sans)",
                    }}
                  >
                    {r.month.slice(0, 1)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
