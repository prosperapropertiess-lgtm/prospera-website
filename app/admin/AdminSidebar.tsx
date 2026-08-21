"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  {
    label: "Leasing",
    items: [
      { href: "/admin/leasing", label: "Rentals" },
      { href: "/admin/properties", label: "Properties" },
      { href: "/admin/applications", label: "Applications" },
      { href: "/admin/maintenance", label: "Maintenance" },
      { href: "/admin/agents", label: "Agents" },
      { href: "/admin/invite", label: "Invite an Agent" },
      { href: "/admin/tenants", label: "Tenants" },
    ],
  },
  {
    label: "Landlords",
    items: [
      { href: "/admin/onboard", label: "Add a Landlord" },
      { href: "/admin/messages", label: "Messages" },
      { href: "/admin/documents", label: "Documents" },
      { href: "/admin/schedules", label: "Reminders" },
    ],
  },
  {
    label: "Growth",
    items: [
      { href: "/admin/leads", label: "Leads" },
      { href: "/admin/dashboard", label: "Outreach" },
      { href: "/admin/intelligence", label: "Rent Prices" },
      { href: "/admin/seo", label: "Search Rankings" },
      { href: "/admin/qr-codes", label: "QR Codes" },
    ],
  },
  {
    label: "Business",
    items: [
      { href: "/admin/ceo", label: "Business Numbers" },
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
        width: 248,
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
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "block",
                    padding: "10px 22px",
                    fontSize: 15,
                    fontWeight: active ? 600 : 400,
                    color: active ? "#FAF8F5" : "rgba(250,248,245,0.58)",
                    textDecoration: "none",
                    borderLeft: `3px solid ${active ? "#8B2030" : "transparent"}`,
                    backgroundColor: active ? "rgba(250,248,245,0.06)" : "transparent",
                    lineHeight: 1.4,
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
      <div style={{ padding: "16px 22px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <Link
          href="/"
          target="_blank"
          style={{ display: "block", fontSize: 13, color: "rgba(250,248,245,0.4)", textDecoration: "none", marginBottom: 10 }}
        >
          ↗ Live website
        </Link>
        <button
          onClick={handleLogout}
          style={{ fontSize: 13, color: "rgba(250,248,245,0.4)", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
