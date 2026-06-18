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
        background: "#FFFFFF",
        borderBottom: "1px solid #E8E4DF",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 24px",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href={`/owners/${token}`} style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          <Image src="/logo.png" alt="Prospera" width={110} height={28} style={{ objectFit: "contain" }} />
        </Link>

        <span style={{ color: "#9AA5B1", fontSize: "13px", fontFamily: "var(--font-dm-sans)" }}>
          {firstName}
        </span>
      </div>
    </header>
  );
}
