"use client";
import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning, Ebin.";
  if (hour < 17) return "Good afternoon, Ebin.";
  return "Good evening, Ebin.";
}

type SectionItem = {
  href: string;
  icon: string;
  label: string;
  desc: string;
  badge?: string;
  badgeType?: "burgundy" | "navy" | "neutral";
};

type SectionGroup = {
  id: string;
  title: string;
  items: SectionItem[];
};

const SECTIONS: SectionGroup[] = [
  {
    id: "leasing",
    title: "Leasing & Tenant Management",
    items: [
      { href: "/admin/properties", icon: "🏠", label: "Properties & Listings", desc: "Manage rental units, publish listings & Notion sync", badge: "Notion Live", badgeType: "navy" },
      { href: "/admin/applications", icon: "📋", label: "Tenant Applications", desc: "Background verification, credit checks & AI scoring", badge: "Action Required", badgeType: "burgundy" },
      { href: "/admin/agents", icon: "👤", label: "Leasing Agents", desc: "Manage agent accounts, schedules & permissions" },
      { href: "/admin/tenants", icon: "🔑", label: "Tenant Portals", desc: "Manage tenant access, rent records & keyhandover" },
    ],
  },
  {
    id: "ops",
    title: "Landlord Operations",
    items: [
      { href: "/admin/onboard", icon: "🚀", label: "Landlord Onboarding", desc: "Add new 1–5 unit landlords & track setup workflow", badge: "Setup Active", badgeType: "burgundy" },
      { href: "/admin/messages", icon: "💬", label: "Owner Portal Messages", desc: "Post monthly updates & announcements to landlords" },
      { href: "/admin/documents", icon: "📄", label: "Legal & Documents", desc: "Standardized leases, CRA receipts & inspection reports" },
      { href: "/admin/schedules", icon: "📅", label: "Schedules & Reminders", desc: "Routine property inspections & seasonal maintenance" },
    ],
  },
  {
    id: "details",
    title: "Property Intel & Guides",
    items: [
      { href: "/admin/home-guides", icon: "📖", label: "Home Guides", desc: "Breaker locations, main shutoffs & garbage pickup rules" },
    ],
  },
  {
    id: "growth",
    title: "Growth, CRM & Analytics",
    items: [
      { href: "/admin/leads", icon: "📩", label: "Leads & Subscribers", desc: "Inbound landlord inquiries & lead magnet subscribers", badge: "New Inquiries", badgeType: "burgundy" },
      { href: "/admin/dashboard", icon: "📊", label: "Outreach & CRM", desc: "HubSpot pipeline, Claude AI email sequences & ad logs" },
      { href: "/admin/intelligence", icon: "🧠", label: "Rent Intelligence", desc: "London, Strathroy & St. Thomas market benchmarks" },
      { href: "/admin/seo", icon: "🔍", label: "SEO & Search Console", desc: "Google index status, keyword rankings & crawl metrics" },
      { href: "/admin/qr-codes", icon: "⬛", label: "Dynamic QR Codes", desc: "Tracked QR codes for signboards & flyers" },
    ],
  },
];

export default function AdminHome() {
  const router = useRouter();
  const greeting = useMemo(() => getGreeting(), []);
  const today = useMemo(
    () => new Date().toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
    []
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [kpiMetrics, setKpiMetrics] = useState({
    activeListings: 12,
    pendingApps: 3,
    newLeads: 5,
    sequencesActive: 28,
  });

  // Handle Sign out
  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  // Filter sections based on search & active category tab
  const filteredSections = useMemo(() => {
    let list = SECTIONS;
    if (activeTab !== "all") {
      list = list.filter((s) => s.id === activeTab);
    }

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list
      .map((sec) => ({
        ...sec,
        items: sec.items.filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            item.desc.toLowerCase().includes(q)
        ),
      }))
      .filter((sec) => sec.items.length > 0);
  }, [searchQuery, activeTab]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F5F2", color: "#222222" }}>
      {/* Executive Navbar Header */}
      <header
        className="sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between shadow-sm"
        style={{ backgroundColor: "#1F2F3A", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span
              className="font-[family-name:var(--font-cormorant)] text-2xl font-bold tracking-tight"
              style={{ color: "#FAF8F5" }}
            >
              Prospera
            </span>
            <span
              className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest rounded"
              style={{ backgroundColor: "rgba(250,248,245,0.12)", color: "rgba(250,248,245,0.75)" }}
            >
              Command Center
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs" style={{ color: "rgba(250,248,245,0.6)" }}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Notion & Supabase Connected</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            target="_blank"
            className="text-xs font-medium transition-opacity hover:opacity-100 flex items-center gap-1.5"
            style={{ color: "rgba(250,248,245,0.65)" }}
          >
            <span>Live Website</span>
            <span className="text-[10px]">↗</span>
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <button
            onClick={handleLogout}
            className="text-xs font-medium transition-opacity hover:opacity-100"
            style={{ color: "rgba(250,248,245,0.65)" }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-8 border-b" style={{ borderColor: "#D8D2C8" }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "#666666" }}>
              {today}
            </p>
            <h1
              className="font-[family-name:var(--font-cormorant)] text-4xl sm:text-5xl font-bold leading-tight"
              style={{ color: "#1F2F3A" }}
            >
              {greeting}
            </h1>
          </div>

          {/* Contextual Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/properties/new"
              className="px-5 py-3 text-xs font-semibold uppercase tracking-widest rounded-lg text-white shadow-sm transition-all hover:opacity-90 flex items-center gap-2"
              style={{ backgroundColor: "#8B2030" }}
            >
              <span>+ Add Property</span>
            </Link>
            <Link
              href="/admin/onboard"
              className="px-5 py-3 text-xs font-semibold uppercase tracking-widest rounded-lg transition-all bg-white hover:bg-[#1F2F3A] hover:text-white shadow-sm"
              style={{ border: "1px solid #D8D2C8", color: "#1F2F3A" }}
            >
              + Onboard Landlord
            </Link>
            <Link
              href="/admin/applications"
              className="px-5 py-3 text-xs font-semibold uppercase tracking-widest rounded-lg transition-all bg-white hover:bg-[#1F2F3A] hover:text-white shadow-sm"
              style={{ border: "1px solid #D8D2C8", color: "#1F2F3A" }}
            >
              Review Apps ({kpiMetrics.pendingApps})
            </Link>
          </div>
        </div>

        {/* Live Operational KPI Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div
            className="p-5 rounded-xl bg-white border transition-shadow hover:shadow-sm"
            style={{ borderColor: "#D8D2C8" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#666666" }}>
              Active Properties
            </p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold" style={{ color: "#1F2F3A" }}>
                {kpiMetrics.activeListings}
              </span>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                100% Occupied
              </span>
            </div>
          </div>

          <div
            className="p-5 rounded-xl bg-white border transition-shadow hover:shadow-sm"
            style={{ borderColor: "#D8D2C8" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#666666" }}>
              Pending Apps
            </p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold" style={{ color: "#1F2F3A" }}>
                {kpiMetrics.pendingApps}
              </span>
              <span
                className="text-xs font-semibold text-white px-2 py-0.5 rounded"
                style={{ backgroundColor: "#8B2030" }}
              >
                Needs Review
              </span>
            </div>
          </div>

          <div
            className="p-5 rounded-xl bg-white border transition-shadow hover:shadow-sm"
            style={{ borderColor: "#D8D2C8" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#666666" }}>
              New Landlord Leads
            </p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold" style={{ color: "#1F2F3A" }}>
                {kpiMetrics.newLeads}
              </span>
              <span className="text-xs font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                This Week
              </span>
            </div>
          </div>

          <div
            className="p-5 rounded-xl bg-white border transition-shadow hover:shadow-sm"
            style={{ borderColor: "#D8D2C8" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#666666" }}>
              CRM Email Nurture
            </p>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold" style={{ color: "#1F2F3A" }}>
                {kpiMetrics.sequencesActive}
              </span>
              <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                Claude AI Active
              </span>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0">
            {[
              { id: "all", label: "All Tools" },
              { id: "leasing", label: "Leasing & Tenants" },
              { id: "ops", label: "Landlord Ops" },
              { id: "growth", label: "Growth & CRM" },
              { id: "details", label: "Guides" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-widest rounded-lg transition-all whitespace-nowrap"
                  style={{
                    backgroundColor: isActive ? "#1F2F3A" : "transparent",
                    color: isActive ? "#FAF8F5" : "#666666",
                    border: isActive ? "1px solid #1F2F3A" : "1px solid transparent",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Quick Filter Search */}
          <div className="relative min-w-[240px]">
            <input
              type="text"
              placeholder="Search admin tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 text-xs rounded-lg border outline-none transition-colors"
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: "#D8D2C8",
                color: "#222222",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Grouped Admin Bento Cards */}
        <div className="space-y-10">
          {filteredSections.length === 0 ? (
            <div
              className="p-12 text-center rounded-xl bg-white border"
              style={{ borderColor: "#D8D2C8" }}
            >
              <p className="text-sm font-medium" style={{ color: "#666666" }}>
                No tools found matching &quot;{searchQuery}&quot;
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-3 text-xs font-semibold uppercase tracking-widest underline"
                style={{ color: "#8B2030" }}
              >
                Clear Search Filter
              </button>
            </div>
          ) : (
            filteredSections.map((section) => (
              <div key={section.id}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#666666" }}>
                    {section.title}
                  </h2>
                  <div className="h-px flex-1 bg-[#D8D2C8]" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group relative flex flex-col justify-between p-6 rounded-xl bg-white border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[#8B2030]/30"
                      style={{ borderColor: "#D8D2C8", minHeight: "180px" }}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <span className="text-3xl p-2 rounded-lg bg-[#F7F5F2] border border-[#D8D2C8]/50">
                            {item.icon}
                          </span>
                          {item.badge && (
                            <span
                              className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest rounded"
                              style={{
                                backgroundColor:
                                  item.badgeType === "burgundy"
                                    ? "#8B2030"
                                    : item.badgeType === "navy"
                                    ? "#1F2F3A"
                                    : "#D8D2C8",
                                color: "#FAF8F5",
                              }}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>

                        <h3
                          className="text-base font-bold mb-1.5 group-hover:text-[#8B2030] transition-colors"
                          style={{ color: "#1F2F3A" }}
                        >
                          {item.label}
                        </h3>
                        <p className="text-xs leading-relaxed" style={{ color: "#666666" }}>
                          {item.desc}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 flex items-center justify-between text-xs font-semibold uppercase tracking-widest border-t border-[#D8D2C8]/40" style={{ color: "#666666" }}>
                        <span className="group-hover:text-[#8B2030] transition-colors">Access Tool</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
