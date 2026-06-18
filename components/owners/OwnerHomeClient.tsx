"use client";

// Trust chips displayed in the hero card
// rentStatus: from dashboard.properties[0]?.rentCurrentMonth[0]?.paymentStatus
// leaseDaysRemaining: computed from dashboard.properties[0]?.nextLeaseExpiry
// TODO: Market rate comparison is hardcoded at +4.8% above market (replace with real data when available)

interface Props {
  rentStatus: string | null;
  leaseDaysRemaining: number | null;
  leaseExpiry: string | null;
  totalTenants: number;
}

function getRentChip(status: string | null): {
  label: string;
  bg: string;
  color: string;
} {
  if (!status) return { label: "Rent status unknown", bg: "rgba(15,28,40,0.06)", color: "rgba(15,28,40,0.45)" };
  const s = status.toLowerCase();
  if (s === "paid" || s === "on time") {
    return { label: "Rent paid ✓", bg: "rgba(10,122,82,0.09)", color: "#0A7A52" };
  }
  if (s === "partial") {
    return { label: "Partial payment", bg: "rgba(180,83,9,0.09)", color: "#B45309" };
  }
  if (s === "unpaid" || s === "late" || s === "overdue") {
    return { label: "Rent overdue", bg: "rgba(185,28,28,0.08)", color: "#B91C1C" };
  }
  return { label: status, bg: "rgba(15,28,40,0.06)", color: "rgba(15,28,40,0.45)" };
}

function getLeaseChip(days: number | null): {
  label: string;
  bg: string;
  color: string;
} {
  if (days === null) return { label: "Lease · no end date", bg: "rgba(15,28,40,0.06)", color: "rgba(15,28,40,0.45)" };
  if (days < 0) return { label: "Lease expired", bg: "rgba(185,28,28,0.08)", color: "#B91C1C" };
  if (days === 0) return { label: "Lease expires today", bg: "rgba(185,28,28,0.08)", color: "#B91C1C" };
  if (days <= 30) return { label: `Lease · ${days}d left`, bg: "rgba(185,28,28,0.08)", color: "#B91C1C" };
  if (days <= 90) return { label: `Lease · ${days}d left`, bg: "rgba(180,83,9,0.09)", color: "#B45309" };
  const months = Math.floor(days / 30);
  return { label: `Lease · ${months} mo left`, bg: "rgba(10,122,82,0.09)", color: "#0A7A52" };
}

export function OwnerHomeClient({ rentStatus, leaseDaysRemaining, totalTenants }: Props) {
  const rentChip = getRentChip(rentStatus);
  const leaseChip = getLeaseChip(leaseDaysRemaining);

  const tenantsChip = {
    label: `${totalTenants} tenant${totalTenants !== 1 ? "s" : ""} · all managed`,
    bg: "rgba(29,78,216,0.07)",
    color: "#1D4ED8",
  };

  // TODO: Replace with real market rate comparison data when available
  const marketChip = {
    label: "$2,200/mo · +4.8% above market",
    bg: "rgba(184,146,42,0.09)",
    color: "#B8922A",
  };

  const chips = [rentChip, tenantsChip, leaseChip, marketChip];

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      {chips.map((chip, i) => (
        <div
          key={i}
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "7px 16px",
            borderRadius: "100px",
            background: chip.bg,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: "15px",
              fontWeight: 600,
              color: chip.color,
              whiteSpace: "nowrap",
            }}
          >
            {chip.label}
          </span>
        </div>
      ))}
    </div>
  );
}
