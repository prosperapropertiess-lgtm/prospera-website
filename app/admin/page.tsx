"use client";
import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning, Ebin.";
  if (hour < 17) return "Good afternoon, Ebin.";
  return "Good evening, Ebin.";
}

const SECTIONS = [
  {
    title: "Leasing & Tenants",
    items: [
      { href: "/admin/properties", icon: "🏠", label: "Properties", desc: "Add, edit, publish listings" },
      { href: "/admin/applications", icon: "📋", label: "Applications", desc: "Review, score, approve" },
      { href: "/admin/agents", icon: "👤", label: "Agents", desc: "Manage leasing agents" },
      { href: "/admin/tenants", icon: "🔑", label: "Tenant Portals", desc: "Manage tenant access" },
    ],
  },
  {
    title: "Landlord Operations",
    items: [
      { href: "/admin/onboard", icon: "🚀", label: "Onboarding", desc: "Add landlords, track setup" },
      { href: "/admin/messages", icon: "💬", label: "Owner Messages", desc: "Post updates to portals" },
      { href: "/admin/documents", icon: "📄", label: "Documents", desc: "Leases, reports, notices" },
      { href: "/admin/schedules", icon: "📅", label: "Schedules", desc: "Inspections, reminders" },
    ],
  },
  {
    title: "Property Details",
    items: [
      { href: "/admin/home-guides", icon: "📖", label: "Home Guides", desc: "Breakers, shutoffs, garbage" },
    ],
  },
  {
    title: "Growth & Intelligence",
    items: [
      { href: "/admin/leads", icon: "📩", label: "Leads", desc: "Contact submissions, subscribers" },
      { href: "/admin/dashboard", icon: "📊", label: "Outreach & CRM", desc: "Pipeline, ads, outreach logs" },
      { href: "/admin/intelligence", icon: "🧠", label: "Rent Intelligence", desc: "Market benchmarks, trends" },
      { href: "/admin/seo", icon: "🔍", label: "SEO", desc: "Search Console, rankings" },
    ],
  },
];

export default function AdminHome() {
  const router = useRouter();
  const greeting = useMemo(() => getGreeting(), []);
  const today = new Date().toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" });

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F5F2" }}>
      {/* Top bar */}
      <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: "#1F2F3A", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-5">
          <span className="font-[family-name:var(--font-cormorant)] text-2xl font-light" style={{ color: "#FAF8F5" }}>Prospera</span>
          <Link href="/" target="_blank" className="text-xs transition-colors" style={{ color: "rgba(250,248,245,0.55)" }}>↗ View site</Link>
        </div>
        <button onClick={handleLogout} className="text-xs transition-colors" style={{ color: "rgba(250,248,245,0.55)" }}>Sign out</button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Greeting */}
        <div className="mb-12">
          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl sm:text-5xl font-light mb-2" style={{ color: "#1F2F3A" }}>
            {greeting}
          </h1>
          <p className="text-sm" style={{ color: "#666666" }}>{today}</p>
        </div>

        {/* Grouped sections */}
        <div className="space-y-10">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#666666" }}>
                {section.title}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-start gap-3 p-4 rounded-xl bg-white border transition-all hover:shadow-md hover:border-[#8B2030]/20"
                    style={{ borderColor: "#D8D2C8" }}
                  >
                    <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold mb-0.5 group-hover:text-[#8B2030] transition-colors" style={{ color: "#1F2F3A" }}>
                        {item.label}
                      </p>
                      <p className="text-xs leading-relaxed" style={{ color: "#666666" }}>
                        {item.desc}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mt-12 pt-8" style={{ borderTop: "1px solid #D8D2C8" }}>
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#666666" }}>
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/properties/new"
              className="px-5 py-2.5 text-xs font-semibold uppercase tracking-widest rounded-lg text-white transition-opacity hover:opacity-80"
              style={{ backgroundColor: "#8B2030" }}
            >
              + Add Property
            </Link>
            <Link
              href="/admin/onboard"
              className="px-5 py-2.5 text-xs font-semibold uppercase tracking-widest rounded-lg transition-all hover:bg-[#1F2F3A] hover:text-white"
              style={{ border: "1px solid #D8D2C8", color: "#1F2F3A" }}
            >
              + Add Landlord
            </Link>
            <Link
              href="/admin/applications"
              className="px-5 py-2.5 text-xs font-semibold uppercase tracking-widest rounded-lg transition-all hover:bg-[#1F2F3A] hover:text-white"
              style={{ border: "1px solid #D8D2C8", color: "#1F2F3A" }}
            >
              Review Applications
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
