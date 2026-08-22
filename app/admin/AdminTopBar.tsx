"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { sectionForPath, SECTION_META } from "@/lib/admin-nav";

const HIDE_ON = ["/admin/login", "/admin/leasing/login"];

export default function AdminTopBar() {
  const pathname = usePathname();
  const router = useRouter();

  if (HIDE_ON.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return null;
  }

  const section = pathname === "/admin" ? null : sectionForPath(pathname);
  const isHubRoot = pathname === "/admin/hub/leasing" || pathname === "/admin/hub/property-management";

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div
      style={{
        position: "sticky", top: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 60,
        backgroundColor: "#1F2F3A",
        fontFamily: "var(--font-poppins, sans-serif)",
      }}
      className="px-5 sm:px-8"
    >
      <div className="flex items-center gap-4 min-w-0">
        <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#FAF8F5" }}>home</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#FAF8F5", letterSpacing: "-0.02em" }}>Prospera</span>
        </Link>

        {section && !isHubRoot && (
          <>
            <span style={{ color: "rgba(250,248,245,0.25)" }}>/</span>
            <Link
              href={SECTION_META[section].href}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "rgba(250,248,245,0.65)", textDecoration: "none", minWidth: 0 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{SECTION_META[section].label}</span>
            </Link>
          </>
        )}
      </div>

      <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
        <Link href="/" target="_blank" style={{ fontSize: 13, color: "rgba(250,248,245,0.5)", textDecoration: "none" }} className="hidden sm:inline">
          Live website ↗
        </Link>
        <button
          onClick={handleLogout}
          style={{ fontSize: 13, color: "rgba(250,248,245,0.5)", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
