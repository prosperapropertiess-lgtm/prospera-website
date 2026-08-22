"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { SECTION_META } from "@/lib/admin-nav";

const NAVY = "#1F2F3A";
const ACCENT = "#8B2030";

interface LiveSignals {
  leadsWaiting: number | null;
  maintenanceOpen: number | null;
}

export default function AdminHome() {
  const today = new Date().toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" });
  const [live, setLive] = useState<LiveSignals>({ leadsWaiting: null, maintenanceOpen: null });

  useEffect(() => {
    fetch("/api/admin/leasing/command").then((r) => r.json()).then((d) => {
      const n = d?.metrics?.uncontacted_leads ?? d?.uncontacted_leads ?? null;
      setLive((prev) => ({ ...prev, leadsWaiting: typeof n === "number" ? n : null }));
    }).catch(() => {});

    fetch("/api/admin/maintenance?status=all").then((r) => r.json()).then((d) => {
      const open = Array.isArray(d?.requests)
        ? d.requests.filter((r: { status: string }) => !["closed", "cancelled"].includes(r.status)).length
        : null;
      setLive((prev) => ({ ...prev, maintenanceOpen: open }));
    }).catch(() => {});
  }, []);

  const cards = [
    {
      ...SECTION_META.leasing,
      signal: live.leadsWaiting !== null && live.leadsWaiting > 0 ? `${live.leadsWaiting} lead${live.leadsWaiting === 1 ? "" : "s"} waiting` : null,
      alert: (live.leadsWaiting ?? 0) > 0,
    },
    {
      ...SECTION_META["property-management"],
      signal: live.maintenanceOpen !== null && live.maintenanceOpen > 0 ? `${live.maintenanceOpen} maintenance request${live.maintenanceOpen === 1 ? "" : "s"} open` : null,
      alert: (live.maintenanceOpen ?? 0) > 0,
    },
  ];

  return (
    <div style={{ minHeight: "calc(100vh - 60px)", backgroundColor: "#F7F5F2", fontFamily: "var(--font-poppins, sans-serif)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 60px" }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 30, fontWeight: 700, color: NAVY, margin: 0, letterSpacing: "-0.02em" }}>Good day, Ebin</h1>
          <p style={{ fontSize: 15, color: "#666666", margin: "5px 0 0" }}>{today}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          {cards.map((card) => (
            <HomeCard key={card.href} {...card} />
          ))}
        </div>

        <div style={{ marginTop: 32, textAlign: "center" }}>
          <Link href="/admin/properties/new" style={{ fontSize: 13, color: "#8B2030", fontWeight: 600, textDecoration: "none" }}>
            + Add a Property
          </Link>
        </div>
      </div>
    </div>
  );
}

function HomeCard({ href, label, icon, description, signal, alert }: {
  href: string; label: string; icon: string; description: string; signal: string | null; alert: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={href}
      style={{ textDecoration: "none" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        backgroundColor: "#FFFFFF",
        border: `2px solid ${hovered ? NAVY : "#E0DBD4"}`,
        borderRadius: 28,
        padding: "48px 36px",
        minHeight: 300,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        justifyContent: "center",
        boxShadow: hovered ? "0 20px 44px rgba(31,47,58,0.14)" : "0 2px 10px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-5px) scale(1.015)" : "none",
        transition: "transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.28s ease, border-color 0.2s ease",
        cursor: "pointer",
      }}>
        <div style={{
          width: 76, height: 76, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          backgroundColor: hovered ? "rgba(139,32,48,0.10)" : "rgba(31,47,58,0.06)",
          marginBottom: 22,
          transform: hovered ? "scale(1.08)" : "scale(1)",
          transition: "background-color 0.25s ease, transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)",
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 38, color: hovered ? ACCENT : NAVY, transition: "color 0.25s ease" }}>
            {icon}
          </span>
        </div>

        <h2 style={{ fontSize: 26, fontWeight: 700, color: NAVY, margin: "0 0 10px", letterSpacing: "-0.01em" }}>
          {label}
        </h2>
        <p style={{ fontSize: 14, color: "#666666", margin: 0, maxWidth: 260, lineHeight: 1.5 }}>
          {description}
        </p>

        {signal && (
          <span style={{
            marginTop: 20, padding: "7px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600,
            backgroundColor: alert ? "rgba(220,38,38,0.09)" : "rgba(31,47,58,0.06)",
            color: alert ? "#DC2626" : "#666666",
          }}>
            {signal}
          </span>
        )}
      </div>
    </Link>
  );
}
