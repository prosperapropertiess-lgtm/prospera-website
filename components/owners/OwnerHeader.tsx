"use client";

import Link from "next/link";
import Image from "next/image";

interface Props {
  firstName: string;
  token: string;
}

const BRAND_GRAD = "linear-gradient(135deg, #8B2030, #C9A84C)";

export default function OwnerHeader({ firstName, token }: Props) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(9,14,23,0.88)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          padding: "0 24px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href={`/owners/${token}`} style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          <Image src="/logo.png" alt="Prospera" width={40} height={40} style={{ objectFit: "contain" }} />
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: "100px",
            padding: "5px 14px 5px 5px",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: BRAND_GRAD,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 700,
              color: "white",
              fontFamily: "var(--font-outfit)",
              flexShrink: 0,
            }}
          >
            {firstName.charAt(0).toUpperCase()}
          </div>
          <span style={{ color: "rgba(237,232,225,0.5)", fontSize: "13px", fontFamily: "var(--font-dm-sans)" }}>
            {firstName}
          </span>
        </div>
      </div>
    </header>
  );
}
