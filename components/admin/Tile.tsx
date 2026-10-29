"use client";
import { useState } from "react";
import Link from "next/link";

export interface TileProps {
  href: string;
  name: string;
  icon: string;
  count?: number | null;
  countLabel?: string | null;
  alert?: boolean;
}

export default function Tile({ href, name, icon, count = null, countLabel = null, alert = false }: TileProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={href} style={{ textDecoration: "none" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        minHeight: 190,
        backgroundColor: alert ? "#FEF2F2" : "#FFFFFF",
        border: `1.5px solid ${hovered ? (alert ? "#F87171" : "#1F2F3A") : (alert ? "#FCA5A5" : "#E0DBD4")}`,
        borderRadius: 20,
        padding: "26px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 10,
        boxShadow: hovered ? "0 10px 28px rgba(0,0,0,0.10)" : "0 1px 3px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-3px) scale(1.015)" : "none",
        transition: "transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.22s ease, border-color 0.15s ease",
        cursor: "pointer",
        boxSizing: "border-box",
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: alert ? "rgba(220,38,38,0.1)" : hovered ? "rgba(139,32,48,0.1)" : "rgba(31,47,58,0.06)",
          transition: "background-color 0.2s ease, transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
          transform: hovered ? "scale(1.08)" : "scale(1)",
          marginBottom: 2,
        }}>
          <span className="material-symbols-outlined" style={{
            fontSize: 20,
            color: alert ? "#DC2626" : hovered ? "#8B2030" : "#1F2F3A",
            transition: "color 0.2s ease",
          }}>
            {icon}
          </span>
        </div>

        {count !== null ? (
          <p style={{
            fontSize: 40, fontWeight: 700, color: alert ? "#8B2030" : "#1F2F3A",
            margin: 0, lineHeight: 1, letterSpacing: "-0.03em",
          }}>
            {count}
          </p>
        ) : null}
        {count !== null && countLabel && (
          <p style={{ fontSize: 12, fontWeight: 500, color: alert ? "#DC2626" : "#999999", margin: 0 }}>
            {countLabel}
          </p>
        )}

        <p style={{
          fontSize: 17, fontWeight: 700, color: alert ? "#991B1B" : "#1F2F3A",
          margin: count !== null ? "2px 0 0" : 0, lineHeight: 1.3, letterSpacing: "-0.01em",
        }}>
          {name}
        </p>
      </div>
    </Link>
  );
}
