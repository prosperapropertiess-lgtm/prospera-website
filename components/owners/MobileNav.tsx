"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  token: string;
}

export function MobileNav({ token }: Props) {
  const pathname = usePathname() ?? "";

  const homeHref = `/owners/${token}`;
  const financialsHref = `/owners/${token}/financials`;
  const tenantsHref = `/owners/${token}/tenants`;
  const maintenanceHref = `/owners/${token}/maintenance`;
  const messagesHref = `/owners/${token}/messages`;

  const isHome = pathname === homeHref;
  const isFinancials = pathname.startsWith(financialsHref);
  const isTenants = pathname.startsWith(tenantsHref);
  const isMaintenance = pathname.startsWith(maintenanceHref);
  const isMessages = pathname.startsWith(messagesHref);

  return (
    <>
      <style>{`
        .owner-mobile-nav { display: none; }
        @media (max-width: 768px) {
          .owner-mobile-nav { display: flex !important; }
          .owner-mobile-nav-spacer { display: block !important; }
        }
      `}</style>

      {/* Spacer so content isn't hidden behind nav */}
      <div className="owner-mobile-nav-spacer" style={{ display: "none", height: "72px" }} />

      <nav
        className="owner-mobile-nav"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          background: "rgba(9,14,23,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          paddingBottom: "env(safe-area-inset-bottom)",
          justifyContent: "space-around",
          alignItems: "stretch",
        }}
      >
        <NavItem href={homeHref} icon="home" label="Home" active={isHome} />
        <NavItem href={financialsHref} icon="trending_up" label="Financials" active={isFinancials} />
        <NavItem href={tenantsHref} icon="people" label="Tenants" active={isTenants} />
        <NavItem href={maintenanceHref} icon="build" label="Maintenance" active={isMaintenance} />
        <NavItem href={messagesHref} icon="chat" label="Messages" active={isMessages} />
      </nav>
    </>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
  external,
}: {
  href: string;
  icon: string;
  label: string;
  active: boolean;
  external?: boolean;
}) {
  const style: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "3px",
    padding: "10px 16px",
    textDecoration: "none",
    flex: 1,
    minHeight: "56px",
    position: "relative",
  };

  const content = (
    <>
      {/* Active indicator — gold line at top */}
      {active && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "20px",
            height: "2px",
            background: "#C9A84C",
            borderRadius: "0 0 3px 3px",
          }}
        />
      )}
      <span
        className="material-symbols-outlined"
        style={{
          fontSize: "22px",
          color: active ? "#C9A84C" : "rgba(237,232,225,0.28)",
          transition: "color 0.2s",
        }}
      >
        {icon}
      </span>
      <span
        style={{
          fontSize: "10px",
          fontWeight: active ? 600 : 500,
          letterSpacing: "0.02em",
          color: active ? "rgba(237,232,225,0.85)" : "rgba(237,232,225,0.28)",
          transition: "color 0.2s",
        }}
      >
        {label}
      </span>
    </>
  );

  if (external) {
    return <a href={href} style={style}>{content}</a>;
  }

  return <Link href={href} style={style}>{content}</Link>;
}
