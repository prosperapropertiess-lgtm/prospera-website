"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  firstName: string;
  token: string;
}

export default function OwnerHeader({ firstName, token }: Props) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await fetch("/api/owners/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
    } catch {
      // non-fatal — still re-render
    }
    router.refresh();
    setRefreshing(false);
  }
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
          <Image src="/logo.png" alt="Prospera" width={32} height={32} style={{ objectFit: "contain", flexShrink: 0 }} />
          <span style={{ fontFamily: "var(--font-cormorant)", fontSize: "18px", fontWeight: 500, color: "#0F1C28", letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
            Prospera Properties
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(255,255,255,0.80)",
              border: "1px solid rgba(15,28,40,0.07)",
              borderRadius: "100px",
              padding: "5px 14px",
              boxShadow: "0 1px 3px rgba(15,28,40,0.05)",
              cursor: refreshing ? "default" : "pointer",
              opacity: refreshing ? 0.5 : 1,
              transition: "opacity 0.2s",
            }}
          >
            <span
              style={{
                display: "inline-block",
                fontSize: "16px",
                animation: refreshing ? "spin 0.8s linear infinite" : "none",
              }}
            >
              ↻
            </span>
            <span
              style={{
                color: "rgba(15,28,40,0.55)",
                fontSize: "15px",
                fontFamily: "var(--font-dm-sans)",
                fontWeight: 500,
              }}
            >
              {refreshing ? "Refreshing…" : "Refresh"}
            </span>
          </button>

          {/* Avatar bubble — initial only */}
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #8B2030, #C9A84C)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "15px",
              fontWeight: 700,
              color: "white",
              fontFamily: "var(--font-dm-sans)",
              flexShrink: 0,
              boxShadow: "0 1px 3px rgba(15,28,40,0.12)",
            }}
          >
            {firstName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </header>
  );
}
