"use client";

import Link from "next/link";

interface QuickCardProps {
  card: {
    icon: string;
    label: string;
    subtitle: string;
    href: string;
    iconColor: string;
    chipBg: string;
  };
}

export function TenantQuickCard({ card }: QuickCardProps) {
  return (
    <Link href={card.href} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid rgba(15,28,40,0.07)",
          borderRadius: "20px",
          boxShadow: "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)",
          padding: "26px 22px",
          minHeight: "155px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "transform 0.18s ease, box-shadow 0.18s ease",
          cursor: "pointer",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(15,28,40,0.08), 0 16px 40px rgba(15,28,40,0.10)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)";
        }}
      >
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "16px",
            background: card.chipBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "27px", color: card.iconColor }}
          >
            {card.icon}
          </span>
        </div>
        <div>
          <p
            style={{
              fontFamily: "var(--font-poppins)",
              fontSize: "18px",
              fontWeight: 700,
              color: "#0F1C28",
              marginBottom: "4px",
            }}
          >
            {card.label}
          </p>
          <p style={{ fontSize: "15px", fontFamily: "var(--font-poppins)", color: "rgba(15,28,40,0.45)" }}>
            {card.subtitle}
          </p>
        </div>
      </div>
    </Link>
  );
}
