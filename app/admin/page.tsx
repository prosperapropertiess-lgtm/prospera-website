"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface LiveData {
  properties: number | null;
  leads: number | null;
  activeCampaigns: number | null;
  uncontactedLeads: number | null;
}

export default function AdminHome() {
  const today = new Date().toLocaleDateString("en-CA", {
    weekday: "long", month: "long", day: "numeric",
  });

  const [live, setLive] = useState<LiveData>({
    properties: null, leads: null, activeCampaigns: null, uncontactedLeads: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [propsRes, leadsRes, leasingRes] = await Promise.allSettled([
        fetch("/api/admin/properties/list").then((r) => r.json()),
        fetch("/api/admin/leads").then((r) => r.json()),
        fetch("/api/admin/leasing/command").then((r) => r.json()),
      ]);
      setLive({
        properties: propsRes.status === "fulfilled" && Array.isArray(propsRes.value) ? propsRes.value.length : null,
        leads: leadsRes.status === "fulfilled" && typeof leadsRes.value?.total === "number" ? leadsRes.value.total : null,
        activeCampaigns: leasingRes.status === "fulfilled" ? (leasingRes.value?.metrics?.active_campaigns ?? leasingRes.value?.active_campaigns ?? null) : null,
        uncontactedLeads: leasingRes.status === "fulfilled" ? (leasingRes.value?.metrics?.uncontacted_leads ?? leasingRes.value?.uncontacted_leads ?? null) : null,
      });
      setLoading(false);
    }
    load();
  }, []);

  const n = (v: number | null) => (loading || v === null ? null : v);
  const uncontacted = live.uncontactedLeads ?? 0;

  const SECTIONS = [
    {
      label: "Leasing",
      tiles: [
        { href: "/admin/leasing", name: "Rentals", count: n(live.activeCampaigns), countLabel: "open now", alert: false },
        { href: "/admin/leasing", name: "Leads to Call", count: n(live.uncontactedLeads), countLabel: "waiting", alert: !loading && uncontacted > 0 },
        { href: "/admin/properties", name: "Properties", count: n(live.properties), countLabel: "homes", alert: false },
        { href: "/admin/applications", name: "Applications", count: null, countLabel: null, alert: false },
        { href: "/admin/agents", name: "Agents", count: null, countLabel: null, alert: false },
        { href: "/admin/tenants", name: "Tenants", count: null, countLabel: null, alert: false },
      ],
    },
    {
      label: "Landlords",
      tiles: [
        { href: "/admin/onboard", name: "Add a Landlord", count: null, countLabel: null, alert: false },
        { href: "/admin/messages", name: "Messages", count: null, countLabel: null, alert: false },
        { href: "/admin/documents", name: "Documents", count: null, countLabel: null, alert: false },
        { href: "/admin/schedules", name: "Reminders", count: null, countLabel: null, alert: false },
        { href: "/admin/home-guides", name: "Home Guides", count: null, countLabel: null, alert: false },
      ],
    },
    {
      label: "Growth",
      tiles: [
        { href: "/admin/leads", name: "Leads", count: n(live.leads), countLabel: "total", alert: false },
        { href: "/admin/dashboard", name: "Outreach", count: null, countLabel: null, alert: false },
        { href: "/admin/intelligence", name: "Rent Prices", count: null, countLabel: null, alert: false },
        { href: "/admin/seo", name: "Search Rankings", count: null, countLabel: null, alert: false },
        { href: "/admin/qr-codes", name: "QR Codes", count: null, countLabel: null, alert: false },
        { href: "/admin/ceo", name: "Business Numbers", count: null, countLabel: null, alert: false },
      ],
    },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F7F5F2", fontFamily: "var(--font-poppins, sans-serif)" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 40px 100px" }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 40, flexWrap: "wrap", gap: 16,
        }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1F2F3A", margin: 0, letterSpacing: "-0.02em" }}>
              Good day, Ebin
            </h1>
            <p style={{ fontSize: 14, color: "#666666", margin: "4px 0 0" }}>{today}</p>
          </div>
          <Link
            href="/admin/properties/new"
            style={{
              backgroundColor: "#8B2030", color: "#FAF8F5", textDecoration: "none",
              padding: "14px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600,
            }}
          >
            + Add a Property
          </Link>
        </div>

        {SECTIONS.map((section) => (
          <div key={section.label} style={{ marginBottom: 44 }}>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#999999", margin: "0 0 16px" }}>
              {section.label}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
              {section.tiles.map((tile) => (
                <Tile key={tile.href + tile.name} {...tile} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Tile({ href, name, count, countLabel, alert }: {
  href: string;
  name: string;
  count: number | null;
  countLabel: string | null;
  alert: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link href={href} style={{ textDecoration: "none" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        minHeight: 180,
        backgroundColor: alert ? "#FEF2F2" : "#FFFFFF",
        border: `1.5px solid ${hovered ? (alert ? "#F87171" : "#1F2F3A") : (alert ? "#FCA5A5" : "#E0DBD4")}`,
        borderRadius: 20,
        padding: "28px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 10,
        boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.10)" : "0 1px 3px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-2px)" : "none",
        transition: "all 0.15s ease",
        cursor: "pointer",
        boxSizing: "border-box",
      }}>
        {/* Count */}
        {count !== null ? (
          <p style={{
            fontSize: 44,
            fontWeight: 700,
            color: alert ? "#8B2030" : "#1F2F3A",
            margin: 0,
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}>
            {count}
          </p>
        ) : (
          <div style={{ height: 44 }} />
        )}
        {count !== null && countLabel && (
          <p style={{ fontSize: 12, fontWeight: 500, color: alert ? "#DC2626" : "#999999", margin: 0 }}>
            {countLabel}
          </p>
        )}

        {/* Name */}
        <p style={{
          fontSize: 17,
          fontWeight: 700,
          color: alert ? "#991B1B" : "#1F2F3A",
          margin: count !== null ? "4px 0 0" : 0,
          lineHeight: 1.3,
          letterSpacing: "-0.01em",
        }}>
          {name}
        </p>
      </div>
    </Link>
  );
}
