"use client";

import Link from "next/link";
import Image from "next/image";

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
        background: "rgba(245,244,241,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(15,28,40,0.07)",
        height: "60px",
      }}
    >
      <div
        style={{
          maxWidth: "860px",
          margin: "0 auto",
          padding: "0 24px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href={`/owners/${token}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <Image src="/logo.png" alt="Prospera" width={36} height={36} style={{ objectFit: "contain" }} />
          <span style={{ fontFamily: "var(--font-cormorant)", fontSize: "18px", fontWeight: 500, color: "#0F1C28", letterSpacing: "-0.01em" }}>
            Prospera Properties
          </span>
        </Link>

        {/* Avatar pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(255,255,255,0.80)",
            border: "1px solid rgba(15,28,40,0.07)",
            borderRadius: "100px",
            padding: "5px 14px 5px 5px",
            boxShadow: "0 1px 3px rgba(15,28,40,0.05)",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #8B2030, #C9A84C)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 700,
              color: "white",
              fontFamily: "var(--font-dm-sans)",
              flexShrink: 0,
            }}
          >
            {firstName.charAt(0).toUpperCase()}
          </div>
          <span
            style={{
              color: "rgba(15,28,40,0.55)",
              fontSize: "13px",
              fontFamily: "var(--font-dm-sans)",
              fontWeight: 500,
            }}
          >
            {firstName}
          </span>
        </div>
      </div>
    </header>
  );
}
