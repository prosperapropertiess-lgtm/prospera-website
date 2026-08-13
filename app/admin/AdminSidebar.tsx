"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  {
    label: "Leasing",
    items: [
      { href: "/admin/leasing", label: "Command Center" },
      { href: "/admin/properties", label: "Properties" },
      { href: "/admin/applications", label: "Applications" },
      { href: "/admin/agents", label: "Agents" },
      { href: "/admin/tenants", label: "Tenant Portals" },
    ],
  },
  {
    label: "Landlords",
    items: [
      { href: "/admin/onboard", label: "Onboard" },
      { href: "/admin/messages", label: "Portal Messages" },
      { href: "/admin/documents", label: "Documents" },
      { href: "/admin/schedules", label: "Schedules" },
    ],
  },
  {
    label: "Growth",
    items: [
      { href: "/admin/leads", label: "Leads" },
      { href: "/admin/dashboard", label: "CRM & Outreach" },
      { href: "/admin/intelligence", label: "Rent Intelligence" },
      { href: "/admin/seo", label: "SEO" },
      { href: "/admin/qr-codes", label: "QR Codes" },
    ],
  },
  {
    label: "Executive",
    items: [
      { href: "/admin/ceo", label: "CEO Dashboard" },
      { href: "/admin/home-guides", label: "Home Guides" },
    ],
  },
];

const HIDE_ON = ["/admin/login", "/admin/leasing/login"];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

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
        width: 216,
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
      <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <Link href="/admin" style={{ textDecoration: "none" }}>
          <p style={{ fontSize: 17, fontWeight: 700, color: "#FAF8F5", margin: 0, letterSpacing: "-0.02em" }}>
            Prospera
          </p>
        </Link>
        <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(250,248,245,0.35)", margin: "3px 0 0" }}>
          Admin
        </p>
      </div>

      {/* Nav groups */}
      <nav style={{ flex: 1, paddingTop: 12, paddingBottom: 12 }}>
        {NAV.map((group) => (
          <div key={group.label} style={{ marginBottom: 4 }}>
            <p style={{
              fontSize: 10,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "rgba(250,248,245,0.28)",
              padding: "10px 20px 4px",
              margin: 0,
            }}>
              {group.label}
            </p>
            {group.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "block",
                    padding: "6px 20px",
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    color: active ? "#FAF8F5" : "rgba(250,248,245,0.52)",
                    textDecoration: "none",
                    borderLeft: `2px solid ${active ? "#8B2030" : "transparent"}`,
                    backgroundColor: active ? "rgba(250,248,245,0.05)" : "transparent",
                    lineHeight: 1.5,
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <Link
          href="/"
          target="_blank"
          style={{ display: "block", fontSize: 12, color: "rgba(250,248,245,0.38)", textDecoration: "none", marginBottom: 8 }}
        >
          ↗ Live website
        </Link>
        <button
          onClick={handleLogout}
          style={{ fontSize: 12, color: "rgba(250,248,245,0.38)", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
