"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const BG = "#F7F5F2";
const SURFACE = "#FFFFFF";
const BORDER = "#E5E1DC";
const TEXT = "#1F2F3A";
const TEXT_MUT = "#999999";
const ACCENT = "#8B2030";

export default function LeasingLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/leasing/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed. Check your credentials.");
        return;
      }
      router.push("/admin/leasing");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "var(--font-dm-sans, sans-serif)" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>

        {/* Logo / brand */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: TEXT_MUT, marginBottom: 8 }}>Prospera Properties</p>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: TEXT, margin: 0 }}>Leasing Portal</h1>
          <p style={{ fontSize: 13, color: TEXT_MUT, marginTop: 6 }}>Sign in with your coordinator account</p>
        </div>

        <div style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 6 }}>Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@prosperaproperties.ca"
                style={{
                  width: "100%",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 8,
                  padding: "11px 14px",
                  fontSize: 14,
                  color: TEXT,
                  backgroundColor: BG,
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 6 }}>Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  border: `1px solid ${BORDER}`,
                  borderRadius: 8,
                  padding: "11px 14px",
                  fontSize: 14,
                  color: TEXT,
                  backgroundColor: BG,
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />
            </div>

            {error && (
              <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#991B1B" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: ACCENT,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "13px",
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "opacity 0.15s",
                marginTop: 4,
              }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: TEXT_MUT, marginTop: 20 }}>
          Admin?{" "}
          <Link href="/admin" style={{ color: ACCENT, textDecoration: "none", fontWeight: 600 }}>
            Go to Admin →
          </Link>
        </p>
      </div>
    </div>
  );
}
