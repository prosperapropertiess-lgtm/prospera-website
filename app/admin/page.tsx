"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const TOOLS = [
  { href: "/admin/leasing", label: "Leasing Command", desc: "Active campaigns, leads & showings" },
  { href: "/admin/properties", label: "Properties", desc: "Units, listings & Notion sync" },
  { href: "/admin/applications", label: "Applications", desc: "Review & approve applicants" },
  { href: "/admin/onboard", label: "Landlord Onboard", desc: "New client setup workflow" },
  { href: "/admin/leads", label: "Leads & Subscribers", desc: "Inbound inquiries from the site" },
  { href: "/admin/dashboard", label: "CRM & Outreach", desc: "HubSpot pipeline & email sequences" },
  { href: "/admin/ceo", label: "CEO Dashboard", desc: "Financials, forecasts & unit economics" },
  { href: "/admin/seo", label: "SEO", desc: "Google index, keywords & crawl status" },
];

interface Stats {
  properties: number | null;
  leads: number | null;
  activeCampaigns: number | null;
  uncontactedLeads: number | null;
}

export default function AdminHome() {
  const today = new Date().toLocaleDateString("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const [stats, setStats] = useState<Stats>({
    properties: null,
    leads: null,
    activeCampaigns: null,
    uncontactedLeads: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [propsRes, leadsRes, leasingRes] = await Promise.allSettled([
        fetch("/api/admin/properties/list").then((r) => r.json()),
        fetch("/api/admin/leads").then((r) => r.json()),
        fetch("/api/admin/leasing/command").then((r) => r.json()),
      ]);

      setStats({
        properties:
          propsRes.status === "fulfilled" && Array.isArray(propsRes.value)
            ? propsRes.value.length
            : null,
        leads:
          leadsRes.status === "fulfilled" && typeof leadsRes.value?.total === "number"
            ? leadsRes.value.total
            : null,
        activeCampaigns:
          leasingRes.status === "fulfilled"
            ? (leasingRes.value?.metrics?.active_campaigns ?? leasingRes.value?.active_campaigns ?? null)
            : null,
        uncontactedLeads:
          leasingRes.status === "fulfilled"
            ? (leasingRes.value?.metrics?.uncontacted_leads ?? leasingRes.value?.uncontacted_leads ?? null)
            : null,
      });
      setLoading(false);
    }
    load();
  }, []);

  const fmt = (n: number | null) => (loading || n === null ? "—" : String(n));
  const hasAlert = !loading && (stats.uncontactedLeads ?? 0) > 0;

  return (
    <div style={{ padding: "48px 52px", maxWidth: 900 }}>

      {/* Header */}
      <div style={{ marginBottom: 44 }}>
        <p style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "#999999",
          margin: "0 0 8px",
        }}>
          {today}
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1F2F3A", margin: 0, letterSpacing: "-0.02em" }}>
          Command Center
        </h1>
      </div>

      {/* Priority stats */}
      <section style={{ marginBottom: 52 }}>
        <p style={{
          fontSize: 10,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "#BBBBBB",
          margin: "0 0 12px",
        }}>
          Right now
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          <StatCard
            label="Active campaigns"
            value={fmt(stats.activeCampaigns)}
            href="/admin/leasing"
            alert={false}
          />
          <StatCard
            label="Uncontacted leads"
            value={fmt(stats.uncontactedLeads)}
            href="/admin/leasing"
            alert={hasAlert}
          />
          <StatCard
            label="Properties"
            value={fmt(stats.properties)}
            href="/admin/properties"
            alert={false}
          />
        </div>
      </section>

      {/* Tools */}
      <section style={{ marginBottom: 48 }}>
        <p style={{
          fontSize: 10,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "#BBBBBB",
          margin: "0 0 12px",
        }}>
          Tools
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1,
          backgroundColor: "#D8D2C8",
          border: "1px solid #D8D2C8",
          borderRadius: 12,
          overflow: "hidden",
        }}>
          {TOOLS.map((tool) => (
            <ToolRow key={tool.href} href={tool.href} label={tool.label} desc={tool.desc} />
          ))}
        </div>
      </section>

      {/* Footer stats */}
      <div style={{ borderTop: "1px solid #D8D2C8", paddingTop: 20 }}>
        <Link href="/admin/leads" style={{ textDecoration: "none" }}>
          <p style={{ fontSize: 13, color: "#888888", margin: 0 }}>
            {loading ? (
              "Loading..."
            ) : (
              <>
                <span style={{ fontWeight: 600, color: "#1F2F3A" }}>
                  {stats.leads ?? 0}
                </span>{" "}
                total leads & subscribers in the database →
              </>
            )}
          </p>
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  alert,
}: {
  label: string;
  value: string;
  href: string;
  alert: boolean;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div
        style={{
          backgroundColor: alert ? "#FEF2F2" : "#FFFFFF",
          border: `1px solid ${alert ? "#FECACA" : "#D8D2C8"}`,
          borderRadius: 10,
          padding: "18px 20px",
        }}
      >
        <p style={{
          fontSize: 10,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: alert ? "#991B1B" : "#999999",
          margin: "0 0 10px",
        }}>
          {label}
        </p>
        <p style={{
          fontSize: 36,
          fontWeight: 700,
          color: alert ? "#8B2030" : "#1F2F3A",
          margin: 0,
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}>
          {value}
        </p>
      </div>
    </Link>
  );
}

function ToolRow({ href, label, desc }: { href: string; label: string; desc: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 22px",
        backgroundColor: hovered ? "#F7F5F2" : "#FFFFFF",
        textDecoration: "none",
        transition: "background-color 0.1s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#1F2F3A", margin: "0 0 2px" }}>
          {label}
        </p>
        <p style={{ fontSize: 12, color: "#999999", margin: 0 }}>
          {desc}
        </p>
      </div>
      <span style={{ fontSize: 14, color: "#CCCCCC", marginLeft: 16 }}>→</span>
    </Link>
  );
}
