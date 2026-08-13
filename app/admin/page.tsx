"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SECTIONS = [
  {
    heading: "Leasing",
    items: [
      { href: "/admin/leasing", label: "Command Center", desc: "Campaigns, leads & showings" },
      { href: "/admin/properties", label: "Properties", desc: "Units, listings & Notion sync" },
      { href: "/admin/applications", label: "Applications", desc: "Review & approve applicants" },
      { href: "/admin/agents", label: "Agents", desc: "Agent accounts & permissions" },
      { href: "/admin/tenants", label: "Tenant Portals", desc: "Rent records & key handover" },
    ],
  },
  {
    heading: "Landlords",
    items: [
      { href: "/admin/onboard", label: "Onboard", desc: "New landlord setup workflow" },
      { href: "/admin/messages", label: "Portal Messages", desc: "Monthly updates to landlords" },
      { href: "/admin/documents", label: "Documents", desc: "Leases, receipts & reports" },
      { href: "/admin/schedules", label: "Schedules", desc: "Inspections & maintenance" },
    ],
  },
  {
    heading: "Growth",
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
      { href: "/admin/home-guides", label: "Home Guides", desc: "Unit manuals for tenants" },
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
        padding: "0 40px", height: 52,
        backgroundColor: "#F7F5F2",
        borderBottom: "1px solid #E0DBD4",
      }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#1F2F3A", letterSpacing: "-0.02em" }}>
          Prospera
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link href="/" target="_blank" style={{ fontSize: 12, color: "#999999", textDecoration: "none" }}>
            Live site ↗
          </Link>
          <button onClick={handleLogout} style={{ fontSize: 12, color: "#999999", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            Sign out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "44px 40px 80px" }}>

        {/* Page header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, color: "#BBBBBB", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.09em", margin: "0 0 6px" }}>
            {today}
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1F2F3A", margin: 0, letterSpacing: "-0.02em" }}>
            Admin
          </h1>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 52 }}>
          {[
            { label: "Active campaigns", value: fmt(stats.activeCampaigns), href: "/admin/leasing", alert: false },
            { label: "Uncontacted leads", value: fmt(stats.uncontactedLeads), href: "/admin/leasing", alert: !loading && uncontacted > 0 },
            { label: "Properties", value: fmt(stats.properties), href: "/admin/properties", alert: false },
          ].map((s) => (
            <Link key={s.href + s.label} href={s.href} style={{ textDecoration: "none" }}>
              <div style={{
                backgroundColor: s.alert ? "#FEF2F2" : "#FFFFFF",
                border: `1px solid ${s.alert ? "#FCA5A5" : "#E0DBD4"}`,
                borderRadius: 10,
                padding: "16px 18px",
              }}>
                <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: s.alert ? "#991B1B" : "#AAAAAA", margin: "0 0 8px" }}>
                  {s.label}
                </p>
                <p style={{ fontSize: 34, fontWeight: 700, color: s.alert ? "#8B2030" : "#1F2F3A", margin: 0, lineHeight: 1, letterSpacing: "-0.02em" }}>
                  {s.value}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          {SECTIONS.map((section) => (
            <div key={section.heading}>
              <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#BBBBBB", margin: "0 0 10px" }}>
                {section.heading}
              </p>
              <div style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E0DBD4",
                borderRadius: 10,
                overflow: "hidden",
              }}>
                {section.items.map((item, i) => (
                  <NavRow
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    desc={item.desc}
                    divider={i < section.items.length - 1}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {!loading && stats.leads !== null && (
          <div style={{ marginTop: 48, paddingTop: 20, borderTop: "1px solid #E0DBD4" }}>
            <Link href="/admin/leads" style={{ textDecoration: "none" }}>
              <p style={{ fontSize: 12, color: "#AAAAAA", margin: 0 }}>
                <span style={{ fontWeight: 600, color: "#666666" }}>{stats.leads}</span> leads & subscribers →
              </p>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function NavRow({ href, label, desc, divider }: { href: string; label: string; desc: string; divider: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "13px 18px",
        backgroundColor: hovered ? "#F7F5F2" : "#FFFFFF",
        textDecoration: "none",
        borderBottom: divider ? "1px solid #F0ECE6" : "none",
        transition: "background-color 0.1s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#1F2F3A" }}>{label}</span>
        <span style={{ fontSize: 12, color: "#AAAAAA" }}>{desc}</span>
      </div>
      <span style={{ fontSize: 13, color: "#CCCCCC" }}>→</span>
    </Link>
  );
}
