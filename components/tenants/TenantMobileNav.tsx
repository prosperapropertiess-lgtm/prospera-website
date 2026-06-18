"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  token: string;
}

export function TenantMobileNav({ token }: Props) {
  const pathname = usePathname() ?? "";

  const homeHref = `/tenants/${token}`;
  const paymentsHref = `/tenants/${token}/payments`;
  const maintenanceHref = `/tenants/${token}/maintenance`;
  const documentsHref = `/tenants/${token}/documents`;
  const scheduleHref = `/tenants/${token}/schedule`;
  const messagesHref = `/tenants/${token}/messages`;

  const isHome = pathname === homeHref;
  const isPayments = pathname.startsWith(paymentsHref);
  const isMaintenance = pathname.startsWith(maintenanceHref);
  const isDocuments = pathname.startsWith(documentsHref);
  const isSchedule = pathname.startsWith(scheduleHref);
  const isMessages = pathname.startsWith(messagesHref);

  return (
    <>
      <style>{`
        .tenant-mobile-nav { display: none; }
        @media (max-width: 768px) {
          .tenant-mobile-nav { display: flex !important; }
          .tenant-mobile-nav-spacer { display: block !important; }
        }
      `}</style>

      {/* Spacer so content isn't hidden behind nav */}
      <div className="tenant-mobile-nav-spacer" style={{ display: "none", height: "72px" }} />

      <nav
        className="tenant-mobile-nav"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(15,28,40,0.07)",
          paddingBottom: "env(safe-area-inset-bottom)",
          justifyContent: "space-around",
          alignItems: "stretch",
        }}
      >
        <NavItem href={homeHref} icon="home" label="Home" active={isHome} />
        <NavItem href={paymentsHref} icon="payments" label="Payments" active={isPayments} />
        <NavItem href={maintenanceHref} icon="build" label="Maintenance" active={isMaintenance} />
        <NavItem href={documentsHref} icon="folder" label="Documents" active={isDocuments} />
        <NavItem href={scheduleHref} icon="event" label="Schedule" active={isSchedule} />
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
    padding: "10px 8px",
    textDecoration: "none",
    flex: 1,
    minHeight: "56px",
    position: "relative",
  };

  return (
    <Link href={href} style={style}>
      {/* Active indicator — burgundy line at top */}
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
          fontSize: "10px",
          fontWeight: active ? 600 : 500,
          letterSpacing: "0.02em",
          fontFamily: "var(--font-dm-sans)",
          color: active ? "#8B2030" : "rgba(15,28,40,0.45)",
          transition: "color 0.2s",
        }}
      >
        {label}
      </span>
    </Link>
  );
}
