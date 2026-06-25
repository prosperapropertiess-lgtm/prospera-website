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
  const documentsHref = `/owners/${token}/documents`;

  const isHome = pathname === homeHref;
  const isFinancials = pathname.startsWith(financialsHref);
  const isTenants = pathname.startsWith(tenantsHref);
  const isMaintenance = pathname.startsWith(maintenanceHref);
  const isMessages = pathname.startsWith(messagesHref);
  const isDocuments = pathname.startsWith(documentsHref);

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
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(15,28,40,0.08)",
          paddingBottom: "env(safe-area-inset-bottom)",
          justifyContent: "space-around",
          alignItems: "stretch",
        }}
      >
        <NavItem href={homeHref} icon="home" label="Home" active={isHome} />
        <NavItem href={financialsHref} icon="trending_up" label="Financials" active={isFinancials} />
        <NavItem href={tenantsHref} icon="people" label="Tenants" active={isTenants} />
        <NavItem href={maintenanceHref} icon="build" label="Repairs" active={isMaintenance} />
        <NavItem href={documentsHref} icon="folder" label="Docs" active={isDocuments} />
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
}: {
  href: string;
  icon: string;
  label: string;
  active: boolean;
}) {
  const style: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "3px",
    padding: "10px 6px",
    textDecoration: "none",
    flex: 1,
    minHeight: "56px",
    position: "relative",
  };

  const content = (
    <>
      {/* Active indicator — burgundy line at TOP of nav bar */}
      {active && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "24px",
            height: "2px",
            background: "#8B2030",
            borderRadius: "0 0 3px 3px",
          }}
        />
      )}
      <span
        className="material-symbols-outlined"
        style={{
          fontSize: "22px",
          color: active ? "#8B2030" : "rgba(15,28,40,0.45)",
          transition: "color 0.2s",
        }}
      >
        {icon}
      </span>
      <span
        style={{
          fontSize: "11px",
          fontWeight: active ? 600 : 500,
          letterSpacing: "0.02em",
          fontFamily: "var(--font-dm-sans)",
          color: active ? "#8B2030" : "rgba(15,28,40,0.45)",
          transition: "color 0.2s",
        }}
      >
        {label}
      </span>
    </>
  );

  return <Link href={href} style={style}>{content}</Link>;
}
