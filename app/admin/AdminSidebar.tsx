"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  {
    label: "Leasing",
    items: [
      { href: "/admin/leasing", label: "Rentals", icon: "home_work" },
      { href: "/admin/properties", label: "Properties", icon: "villa" },
      { href: "/admin/applications", label: "Applications", icon: "assignment" },
      { href: "/admin/maintenance", label: "Maintenance", icon: "handyman" },
      { href: "/admin/agents", label: "Agents", icon: "support_agent" },
      { href: "/admin/invite", label: "Invite an Agent", icon: "person_add" },
      { href: "/admin/tenants", label: "Tenants", icon: "key" },
    ],
  },
  {
    label: "Landlords",
    items: [
      { href: "/admin/onboard", label: "Add a Landlord", icon: "add_business" },
      { href: "/admin/messages", label: "Messages", icon: "forum" },
      { href: "/admin/documents", label: "Documents", icon: "folder" },
      { href: "/admin/schedules", label: "Reminders", icon: "event" },
    ],
  },
  {
    label: "Growth",
    items: [
      { href: "/admin/leads", label: "Leads", icon: "person_search" },
      { href: "/admin/dashboard", label: "Outreach", icon: "campaign" },
      { href: "/admin/intelligence", label: "Rent Prices", icon: "payments" },
      { href: "/admin/seo", label: "Search Rankings", icon: "query_stats" },
      { href: "/admin/qr-codes", label: "QR Codes", icon: "qr_code" },
    ],
  },
  {
    label: "Business",
    items: [
      { href: "/admin/ceo", label: "Business Numbers", icon: "monitoring" },
    ],
  },
];

const HIDE_ON = ["/admin/login", "/admin/leasing/login"];

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{ fontSize: size, lineHeight: 1, flexShrink: 0 }}
    >
      {name}
    </span>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);

  if (HIDE_ON.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return null;
  }

  function isActive(href: string) {
    if (href === "/admin/leasing") {
      return pathname === "/admin/leasing" || /^\/admin\/leasing\/[^/]+/.test(pathname);
    }
    return pathname === href || pathname.startsWith(href + "/");
  }

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside
      style={{
        width: 252,
        flexShrink: 0,
        backgroundColor: "#1F2F3A",
        minHeight: "100vh",
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        fontFamily: "var(--font-poppins, sans-serif)",
      }}
    >
      {/* Brand */}
      <div style={{ padding: "26px 22px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <Link href="/admin" style={{ textDecoration: "none" }}>
          <p style={{ fontSize: 19, fontWeight: 700, color: "#FAF8F5", margin: 0, letterSpacing: "-0.02em" }}>
            Prospera
          </p>
        </Link>
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(250,248,245,0.35)", margin: "3px 0 0" }}>
          Admin
        </p>
      </div>

      {/* Nav groups */}
      <nav style={{ flex: 1, paddingTop: 14, paddingBottom: 14 }}>
        {NAV.map((group) => (
          <div key={group.label} style={{ marginBottom: 6 }}>
            <p style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "rgba(250,248,245,0.28)",
              padding: "12px 22px 5px",
              margin: 0,
            }}>
              {group.label}
            </p>
            {group.items.map((item) => {
              const active = isActive(item.href);
              const isHovered = hovered === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onMouseEnter={() => setHovered(item.href)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 22px",
                    fontSize: 15,
                    fontWeight: active ? 600 : 400,
                    color: active ? "#FAF8F5" : "rgba(250,248,245,0.58)",
                    textDecoration: "none",
                    borderLeft: `3px solid ${active ? "#8B2030" : "transparent"}`,
                    backgroundColor: active ? "rgba(250,248,245,0.07)" : isHovered ? "rgba(250,248,245,0.04)" : "transparent",
                    lineHeight: 1.4,
                    transition: "background-color 0.15s ease, color 0.15s ease, padding-left 0.15s ease",
                    paddingLeft: isHovered && !active ? 25 : 22,
                  }}
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: "16px 22px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <Link
          href="/"
          target="_blank"
          style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(250,248,245,0.4)", textDecoration: "none", marginBottom: 10 }}
        >
          <Icon name="open_in_new" size={16} />
          Live website
        </Link>
        <button
          onClick={handleLogout}
          style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(250,248,245,0.4)", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
        >
          <Icon name="logout" size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
