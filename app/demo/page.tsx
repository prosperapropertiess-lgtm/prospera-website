import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Try the Portal Demo",
  description: "Explore the Prospera Properties owner and tenant portals — no login required.",
  robots: { index: false, follow: false },
};

const NAVY = "#1F2F3A";
const BURGUNDY = "#8B2030";
const BG = "#F7F5F2";
const WHITE = "#FFFFFF";
const BORDER = "#D8D2C8";
const MUTED = "#666666";

export default function DemoLandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>

      <div style={{ maxWidth: "520px", width: "100%", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: MUTED, marginBottom: "16px" }}>
          Interactive demo
        </p>
        <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(36px, 6vw, 52px)", fontWeight: 700, color: NAVY, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: "16px" }}>
          See what your clients<br />actually experience.
        </h1>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "16px", color: MUTED, lineHeight: 1.65, marginBottom: "40px" }}>
          Real portals. Fictional data. Explore both sides — what your tenants see
          and what you see as the owner. No login required.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "32px" }}>
          <Link
            href="/demo/owner"
            style={{
              background: NAVY,
              color: "#FAF8F5",
              borderRadius: "16px",
              padding: "28px 20px",
              textDecoration: "none",
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "28px" }}>🏠</span>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "16px", fontWeight: 700, color: "#FAF8F5" }}>Owner Portal</p>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: "rgba(250,248,245,0.65)", lineHeight: 1.5 }}>
              Financials, tenant details, repairs, documents, messages.
            </p>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", fontWeight: 700, color: "rgba(250,248,245,0.45)", marginTop: "8px" }}>
              Explore →
            </p>
          </Link>

          <Link
            href="/demo/tenant"
            style={{
              background: WHITE,
              border: `1px solid ${BORDER}`,
              borderRadius: "16px",
              padding: "28px 20px",
              textDecoration: "none",
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}
          >
            <span style={{ fontSize: "28px" }}>🔑</span>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "16px", fontWeight: 700, color: NAVY }}>Tenant Portal</p>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: MUTED, lineHeight: 1.5 }}>
              Payments, maintenance requests, lease docs, messages.
            </p>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", fontWeight: 700, color: MUTED, marginTop: "8px" }}>
              Explore →
            </p>
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/pricing"
            style={{
              background: BURGUNDY,
              color: "#FAF8F5",
              fontFamily: "var(--font-dm-sans)",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              textDecoration: "none",
              padding: "14px 28px",
              borderRadius: "10px",
            }}
          >
            See pricing
          </Link>
          <Link
            href="/contact"
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "13px",
              color: MUTED,
              textDecoration: "none",
              borderBottom: "1px solid rgba(102,102,102,0.3)",
              paddingBottom: "1px",
            }}
          >
            Talk to us →
          </Link>
        </div>

        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: MUTED, marginTop: "32px", opacity: 0.6 }}>
          All names, numbers, and addresses shown are fictional.
        </p>
      </div>
    </div>
  );
}
