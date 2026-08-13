"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SECTIONS = [
  {
    heading: "Leasing & Tenants",
    items: [
      { href: "/admin/leasing", label: "Leasing Command", desc: "Campaigns, leads & showings" },
      { href: "/admin/properties", label: "Properties", desc: "Units, listings & Notion sync" },
      { href: "/admin/applications", label: "Applications", desc: "Review & approve applicants" },
      { href: "/admin/agents", label: "Agents", desc: "Agent accounts & permissions" },
      { href: "/admin/tenants", label: "Tenant Portals", desc: "Rent records & key handover" },
    ],
  },
  {
    heading: "Landlord Operations",
    items: [
      { href: "/admin/onboard", label: "Onboard", desc: "New landlord setup workflow" },
      { href: "/admin/messages", label: "Portal Messages", desc: "Monthly updates to landlords" },
      { href: "/admin/documents", label: "Documents", desc: "Leases, receipts & reports" },
      { href: "/admin/schedules", label: "Schedules", desc: "Inspections & maintenance" },
      { href: "/admin/home-guides", label: "Home Guides", desc: "Unit manuals for tenants" },
    ],
  },
  {
    heading: "Growth & Analytics",
    items: [
      { href: "/admin/leads", label: "Leads", desc: "Inbound inquiries & subscribers" },
      { href: "/admin/dashboard", label: "CRM & Outreach", desc: "Pipeline & email sequences" },
      { href: "/admin/intelligence", label: "Rent Intelligence", desc: "Market benchmarks" },
      { href: "/admin/seo", label: "SEO", desc: "Keywords & crawl status" },
      { href: "/admin/qr-codes", label: "QR Codes", desc: "Tracked codes for signboards" },
    ],
  },
  {
    heading: "Executive",
    items: [
      { href: "/admin/ceo", label: "CEO Dashboard", desc: "Financials & forecasts" },
    ],
  },
];

interface Stats {
  properties: number | null;
  leads: number | null;
  activeCampaigns: number | null;
  uncontactedLeads: number | null;
}

export default function AdminHome() {
  const router = useRouter();
  const today = new Date().toLocaleDateString("en-CA", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const [stats, setStats] = useState<Stats>({ properties: null, leads: null, activeCampaigns: null, uncontactedLeads: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [propsRes, leadsRes, leasingRes] = await Promise.allSettled([
        fetch("/api/admin/properties/list").then((r) => r.json()),
        fetch("/api/admin/leads").then((r) => r.json()),
        fetch("/api/admin/leasing/command").then((r) => r.json()),
      ]);
      setStats({
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

  const fmt = (n: number | null) => (loading || n === null ? "—" : String(n));
  const uncontacted = stats.uncontactedLeads ?? 0;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F7F5F2", fontFamily: "var(--font-poppins, sans-serif)" }}>

      {/* Top bar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", height: 56,
        backgroundColor: "#1F2F3A",
      }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#FAF8F5", letterSpacing: "-0.02em" }}>Prospera</span>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <Link href="/admin/properties/new" style={{ fontSize: 13, color: "rgba(250,248,245,0.65)", textDecoration: "none" }}>+ Add Property</Link>
          <Link href="/" target="_blank" style={{ fontSize: 13, color: "rgba(250,248,245,0.65)", textDecoration: "none" }}>Live site ↗</Link>
          <button onClick={handleLogout} style={{ fontSize: 13, color: "rgba(250,248,245,0.65)", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>Sign out</button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "52px 48px 100px" }}>

        {/* Page header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, color: "#BBBBBB", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.09em", margin: "0 0 8px" }}>{today}</p>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1F2F3A", margin: 0, letterSpacing: "-0.02em" }}>Admin</h1>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 56 }}>
          {[
            { label: "Active campaigns", value: fmt(stats.activeCampaigns), href: "/admin/leasing", alert: false },
            { label: "Uncontacted leads", value: fmt(stats.uncontactedLeads), href: "/admin/leasing", alert: !loading && uncontacted > 0 },
            { label: "Properties", value: fmt(stats.properties), href: "/admin/properties", alert: false },
          ].map((s) => (
            <Link key={s.label} href={s.href} style={{ textDecoration: "none" }}>
              <div style={{
                backgroundColor: s.alert ? "#FEF2F2" : "#FFFFFF",
                border: `1px solid ${s.alert ? "#FCA5A5" : "#E0DBD4"}`,
                borderRadius: 12,
                padding: "20px 24px",
              }}>
                <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: s.alert ? "#991B1B" : "#AAAAAA", margin: "0 0 10px" }}>{s.label}</p>
                <p style={{ fontSize: 38, fontWeight: 700, color: s.alert ? "#8B2030" : "#1F2F3A", margin: 0, lineHeight: 1, letterSpacing: "-0.02em" }}>{s.value}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Card sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 44 }}>
          {SECTIONS.map((section) => (
            <div key={section.heading}>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#BBBBBB", margin: "0 0 14px" }}>
                {section.heading}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {section.items.map((item) => (
                  <BigCard key={item.href} href={item.href} label={item.label} desc={item.desc} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BigCard({ href, label, desc }: { href: string; label: string; desc: string }) {
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
        border: "1px solid #E0DBD4",
        borderRadius: 14,
        padding: "28px 28px 24px",
        minHeight: 140,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: hovered ? "0 4px 16px rgba(0,0,0,0.08)" : "0 1px 3px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-2px)" : "none",
        transition: "box-shadow 0.15s, transform 0.15s",
        cursor: "pointer",
      }}>
        <div>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#1F2F3A", margin: "0 0 8px", letterSpacing: "-0.01em" }}>
            {label}
          </p>
          <p style={{ fontSize: 13, color: "#AAAAAA", margin: 0, lineHeight: 1.45 }}>
            {desc}
          </p>
        </div>
        <div style={{ marginTop: 20 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: hovered ? "#8B2030" : "#CCCCCC", transition: "color 0.15s" }}>
            Open →
          </span>
        </div>
      </div>
    </Link>
  );
}
