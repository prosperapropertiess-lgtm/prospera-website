"use client";

import Link from "next/link";

interface Props {
  firstName: string;
  token: string;
}

export default function OwnerHeader({ firstName, token }: Props) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(20,27,44,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 24px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href={`/owners/${token}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #8B2030, #76192b)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "white", fontSize: "14px", fontWeight: 700, fontFamily: "var(--font-outfit)" }}>P</span>
          </div>
          <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "15px", fontWeight: 600, fontFamily: "var(--font-outfit)", letterSpacing: "-0.01em" }}>
            Prospera
          </span>
        </Link>

        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px" }}>
          {firstName}
        </span>
      </div>
    </header>
  );
}
