"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  token: string;
}

export function MobileNav({ token }: Props) {
  const pathname = usePathname() ?? "";
  const isDetail = pathname.split("/").filter(Boolean).length > 2;
  const portfolioHref = `/owners/${token}`;

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
          background: "rgba(11,16,28,0.96)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingBottom: "env(safe-area-inset-bottom)",
          justifyContent: "space-around",
          alignItems: "stretch",
        }}
      >
        <NavItem
          href={portfolioHref}
          icon="home"
          label="Portfolio"
          active={!isDetail}
        />
        {isDetail && (
          <NavItem
            href={pathname}
            icon="apartment"
            label="Property"
            active={isDetail}
          />
        )}
        <NavItem
          href="tel:+15196971227"
          icon="call"
          label="Call"
          active={false}
          external
        />
        <NavItem
          href="mailto:hello@prosperaproperties.co"
          icon="mail"
          label="Email"
          active={false}
          external
        />
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
  };

  const content = (
    <>
      <span
        className="material-symbols-outlined"
        style={{
          fontSize: "22px",
          color: active ? "#c85070" : "rgba(255,255,255,0.35)",
          transition: "color 0.2s",
        }}
      >
        {icon}
      </span>
      <span
        style={{
          fontSize: "10px",
          fontWeight: 500,
          letterSpacing: "0.02em",
          color: active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)",
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
