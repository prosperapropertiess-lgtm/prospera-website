"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const NAVY = "#1F2F3A";
const BURGUNDY = "#8B2030";
const BG = "#F5F4F1";
const BORDER = "rgba(15,28,40,0.08)";

// ── Owner nav items ────────────────────────────────────────────────────────

const OWNER_NAV = [
  { label: "Home", icon: "home", href: "/demo/owner" },
  { label: "Financials", icon: "trending_up", href: "/demo/owner/financials" },
  { label: "Tenants", icon: "group", href: "/demo/owner/tenants" },
  { label: "Repairs", icon: "build", href: "/demo/owner/repairs" },
  { label: "Docs", icon: "folder", href: "/demo/owner/docs" },
  { label: "Messages", icon: "chat", href: "/demo/owner/messages" },
];

const TENANT_NAV = [
  { label: "Home", icon: "home", href: "/demo/tenant" },
  { label: "Payments", icon: "payments", href: "/demo/tenant/payments" },
  { label: "Repairs", icon: "build", href: "/demo/tenant/repairs" },
  { label: "Docs", icon: "folder", href: "/demo/tenant/docs" },
  { label: "Messages", icon: "chat", href: "/demo/tenant/messages" },
];

interface Props {
  children: ReactNode;
  mode: "owner" | "tenant";
  name: string;
  initials: string;
}

export default function DemoShell({ children, mode, name, initials }: Props) {
  const pathname = usePathname();
  const nav = mode === "owner" ? OWNER_NAV : TENANT_NAV;

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
      />
      <div
        style={{
          minHeight: "100vh",
          background: BG,
          fontFamily: "var(--font-dm-sans)",
          paddingBottom: "84px",
        }}
      >
        {/* ── Demo banner ── */}
        <div
          style={{
            background: NAVY,
            color: "#FAF8F5",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                background: BURGUNDY,
                color: "#FAF8F5",
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.10em",
                padding: "3px 8px",
                borderRadius: "4px",
              }}
            >
              Demo
            </span>
            <span style={{ fontSize: "13px", color: "rgba(250,248,245,0.75)" }}>
              This is a sample {mode === "owner" ? "owner" : "tenant"} portal. Explore freely.
            </span>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Link
              href={mode === "owner" ? "/demo/tenant" : "/demo/owner"}
              style={{
                fontSize: "12px",
                color: "rgba(250,248,245,0.6)",
                textDecoration: "none",
                borderBottom: "1px solid rgba(250,248,245,0.2)",
              }}
            >
              Switch to {mode === "owner" ? "Tenant" : "Owner"} view →
            </Link>
            <Link
              href="/pricing"
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#FAF8F5",
                textDecoration: "none",
                background: BURGUNDY,
                padding: "6px 14px",
                borderRadius: "6px",
              }}
            >
              See pricing
            </Link>
          </div>
        </div>

        {/* ── Header ── */}
        <div
          style={{
            background: "#FFFFFF",
            borderBottom: `1px solid ${BORDER}`,
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: NAVY,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ color: "#FAF8F5", fontSize: "13px", fontWeight: 700 }}>{initials}</span>
            </div>
            <div>
              <p style={{ fontSize: "14px", fontWeight: 700, color: NAVY }}>{name}</p>
              <p style={{ fontSize: "11px", color: "rgba(15,28,40,0.45)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {mode === "owner" ? "Property Owner" : "Tenant"}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "22px", color: "rgba(15,28,40,0.4)", cursor: "pointer" }}
            >
              notifications
            </span>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "22px", color: "rgba(15,28,40,0.4)", cursor: "pointer" }}
            >
              refresh
            </span>
          </div>
        </div>

        {/* ── Content ── */}
        <main style={{ maxWidth: "600px", margin: "0 auto", padding: "24px 16px 16px" }}>
          {children}
        </main>

        {/* ── Bottom nav ── */}
        <nav
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "#FFFFFF",
            borderTop: `1px solid ${BORDER}`,
            display: "flex",
            alignItems: "stretch",
            zIndex: 50,
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          {nav.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px 4px 8px",
                  textDecoration: "none",
                  gap: "2px",
                  borderTop: `2px solid ${isActive ? BURGUNDY : "transparent"}`,
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: "22px",
                    color: isActive ? BURGUNDY : "rgba(15,28,40,0.35)",
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {item.icon}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    fontFamily: "var(--font-dm-sans)",
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? BURGUNDY : "rgba(15,28,40,0.45)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
