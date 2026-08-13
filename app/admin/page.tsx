"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LiveData {
  properties: number | null;
  leads: number | null;
  activeCampaigns: number | null;
  uncontactedLeads: number | null;
}

export default function AdminHome() {
  const router = useRouter();
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

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  const n = (v: number | null) => (loading || v === null ? null : v);
  const uncontacted = live.uncontactedLeads ?? 0;

  const SECTIONS = [
    {
      label: "Leasing",
      tiles: [
        { href: "/admin/leasing", name: "Command Center", count: n(live.activeCampaigns), countLabel: "active", alert: false },
        { href: "/admin/leasing", name: "Uncontacted Leads", count: n(live.uncontactedLeads), countLabel: "leads", alert: !loading && uncontacted > 0 },
        { href: "/admin/properties", name: "Properties", count: n(live.properties), countLabel: "units", alert: false },
        { href: "/admin/applications", name: "Applications", count: null, countLabel: null, alert: false },
        { href: "/admin/agents", name: "Agents", count: null, countLabel: null, alert: false },
        { href: "/admin/tenants", name: "Tenant Portals", count: null, countLabel: null, alert: false },
      ],
    },
    {
      label: "Landlords",
      tiles: [
        { href: "/admin/onboard", name: "Onboard", count: null, countLabel: null, alert: false },
        { href: "/admin/messages", name: "Portal Messages", count: null, countLabel: null, alert: false },
        { href: "/admin/documents", name: "Documents", count: null, countLabel: null, alert: false },
        { href: "/admin/schedules", name: "Schedules", count: null, countLabel: null, alert: false },
        { href: "/admin/home-guides", name: "Home Guides", count: null, countLabel: null, alert: false },
      ],
    },
    {
      label: "Growth",
      tiles: [
        { href: "/admin/leads", name: "Leads", count: n(live.leads), countLabel: "total", alert: false },
        { href: "/admin/dashboard", name: "CRM & Outreach", count: null, countLabel: null, alert: false },
        { href: "/admin/intelligence", name: "Rent Intelligence", count: null, countLabel: null, alert: false },
        { href: "/admin/seo", name: "SEO", count: null, countLabel: null, alert: false },
        { href: "/admin/qr-codes", name: "QR Codes", count: null, countLabel: null, alert: false },
        { href: "/admin/ceo", name: "CEO Dashboard", count: null, countLabel: null, alert: false },
      ],
    },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F7F5F2", fontFamily: "var(--font-poppins, sans-serif)" }}>

      {/* Top bar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", height: 54,
        backgroundColor: "#1F2F3A",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#FAF8F5", letterSpacing: "-0.02em" }}>Prospera</span>
          <span style={{ fontSize: 12, color: "rgba(250,248,245,0.35)", marginLeft: 4 }}>{today}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <Link href="/admin/properties/new" style={{ fontSize: 13, color: "rgba(250,248,245,0.6)", textDecoration: "none" }}>+ Add Property</Link>
          <Link href="/" target="_blank" style={{ fontSize: 13, color: "rgba(250,248,245,0.6)", textDecoration: "none" }}>Live site ↗</Link>
          <button onClick={handleLogout} style={{ fontSize: 13, color: "rgba(250,248,245,0.6)", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>Sign out</button>
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "52px 48px 100px" }}>
        {SECTIONS.map((section) => (
          <div key={section.label} style={{ marginBottom: 48 }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#BBBBBB", margin: "0 0 14px" }}>
              {section.label}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
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
        aspectRatio: "1",
        backgroundColor: alert ? "#FEF2F2" : "#FFFFFF",
        border: `1.5px solid ${hovered ? (alert ? "#F87171" : "#1F2F3A") : (alert ? "#FCA5A5" : "#E0DBD4")}`,
        borderRadius: 16,
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: hovered ? "0 6px 20px rgba(0,0,0,0.09)" : "0 1px 3px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-2px)" : "none",
        transition: "all 0.15s ease",
        cursor: "pointer",
        boxSizing: "border-box",
      }}>
        {/* Count (top) */}
        <div>
          {count !== null ? (
            <p style={{
              fontSize: 38,
              fontWeight: 700,
              color: alert ? "#8B2030" : "#1F2F3A",
              margin: 0,
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}>
              {count}
              {countLabel && (
                <span style={{ fontSize: 11, fontWeight: 500, color: alert ? "#DC2626" : "#BBBBBB", marginLeft: 5, letterSpacing: 0 }}>
                  {countLabel}
                </span>
              )}
            </p>
          ) : (
            <div style={{ height: 38 }} />
          )}
        </div>

        {/* Name (bottom) */}
        <p style={{
          fontSize: 13,
          fontWeight: 700,
          color: alert ? "#991B1B" : "#1F2F3A",
          margin: 0,
          lineHeight: 1.3,
          letterSpacing: "-0.01em",
        }}>
          {name}
        </p>
      </div>
    </Link>
  );
}
