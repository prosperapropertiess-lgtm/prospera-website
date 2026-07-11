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
          padding: "0 20px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        {/* Logo — always visible; text hidden on small screens */}
        <Link
          href={`/owners/${token}`}
          style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "9px", flexShrink: 0 }}
        >
          <Image src="/logo.png" alt="Prospera" width={32} height={32} style={{ objectFit: "contain", flexShrink: 0 }} />
          <span className="owner-header-title" style={{ fontFamily: "var(--font-cormorant)", fontSize: "18px", fontWeight: 500, color: "#0F1C28", letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
            Prospera Properties
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          {/* Refresh — shows icon + label on desktop, icon only on mobile */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              background: "rgba(255,255,255,0.80)",
              border: "1px solid rgba(15,28,40,0.07)",
              borderRadius: "100px",
              padding: "6px 13px",
              boxShadow: "0 1px 3px rgba(15,28,40,0.05)",
              cursor: refreshing ? "default" : "pointer",
              opacity: refreshing ? 0.5 : 1,
              transition: "opacity 0.2s",
            }}
          >
            <span
              style={{
                display: "inline-block",
                fontSize: "17px",
                lineHeight: 1,
                animation: refreshing ? "spin 0.8s linear infinite" : "none",
              }}
            >
              ↻
            </span>
            <span className="owner-header-refresh-label" style={{ color: "rgba(15,28,40,0.55)", fontSize: "14px", fontFamily: "var(--font-dm-sans)", fontWeight: 500 }}>
              {refreshing ? "Refreshing…" : "Refresh"}
            </span>
          </button>

          {/* Avatar bubble — initial only */}
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #8B2030, #C9A84C)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
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

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 480px) {
          .owner-header-title { display: none !important; }
          .owner-header-refresh-label { display: none !important; }
        }
      `}</style>
    </header>
  );
}
