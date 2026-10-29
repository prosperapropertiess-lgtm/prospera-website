"use client";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ADMIN_NAV, isActive } from "@/lib/admin-nav";
import { C } from "@/components/admin/kit";

const BARE = ["/admin/login"];
const SIDEBAR = 248;

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (BARE.some((p) => pathname === p || pathname.startsWith(p + "/"))) return <>{children}</>;

  async function signOut() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  const link = (href: string, name: string, icon: string) => {
    const on = href === "/admin" ? pathname === "/admin" : isActive(pathname, href);
    return (
      <Link
        key={href}
        href={href}
        onClick={() => setOpen(false)}
        style={{
          display: "flex", alignItems: "center", gap: 12, padding: "9px 12px", borderRadius: 8,
          fontSize: 15, fontWeight: on ? 600 : 500, textDecoration: "none",
          color: on ? "#FFFFFF" : "rgba(250,248,245,0.72)",
          background: on ? "rgba(250,248,245,0.12)" : "transparent",
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 20, opacity: on ? 1 : 0.8 }}>{icon}</span>
        {name}
      </Link>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <style>{`
        .adm-side { position: fixed; inset: 0 auto 0 0; width: ${SIDEBAR}px; z-index: 60; transition: transform .2s; }
        .adm-main { margin-left: ${SIDEBAR}px; }
        .adm-top { display: none; }
        .adm-scrim { display: none; }
        @media (max-width: 960px) {
          .adm-side { transform: translateX(-100%); }
          .adm-side.open { transform: none; box-shadow: 0 0 40px rgba(0,0,0,.25); }
          .adm-main { margin-left: 0; }
          .adm-top { display: flex; }
          .adm-scrim.open { display: block; position: fixed; inset: 0; background: rgba(31,47,58,.35); z-index: 55; }
        }
      `}</style>

      <div className={`adm-top`} style={{ position: "sticky", top: 0, zIndex: 50, height: 56, alignItems: "center", gap: 12, padding: "0 16px", background: C.navy }}>
        <button onClick={() => setOpen(true)} aria-label="Open menu" style={{ background: "none", border: "none", color: "#FAF8F5", cursor: "pointer", padding: 4, display: "flex" }}>
          <span className="material-symbols-outlined">menu</span>
        </button>
        <span style={{ color: "#FAF8F5", fontWeight: 700, fontSize: 16 }}>Prospera</span>
      </div>
      <div className={`adm-scrim ${open ? "open" : ""}`} onClick={() => setOpen(false)} />

      <aside className={`adm-side ${open ? "open" : ""}`} style={{ background: C.navy, display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <Link href="/admin" onClick={() => setOpen(false)} style={{ display: "block", padding: "26px 24px 18px", color: "#FAF8F5", fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", textDecoration: "none" }}>
          Prospera
        </Link>
        <nav style={{ padding: "0 12px", flex: 1 }}>
          {link("/admin", "Home", "home")}
          {ADMIN_NAV.map((g) => (
            <div key={g.label} style={{ marginTop: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(250,248,245,0.45)", padding: "0 12px 6px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                {g.label}
              </div>
              {g.links.map((l) => link(l.href, l.name, l.icon))}
            </div>
          ))}
        </nav>
        <div style={{ padding: "16px 24px 24px", display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid rgba(250,248,245,0.1)", marginTop: 16 }}>
          <a href="/" target="_blank" style={{ fontSize: 14, color: "rgba(250,248,245,0.6)", textDecoration: "none" }}>Live website ↗</a>
          <button onClick={signOut} style={{ fontSize: 14, color: "rgba(250,248,245,0.6)", background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left", fontFamily: "inherit" }}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="adm-main">{children}</main>
    </div>
  );
}
