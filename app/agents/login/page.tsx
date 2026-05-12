"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AgentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/agents/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Login failed");
        return;
      }

      router.push("/agents/dashboard");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0B1219",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{
            fontSize: 11,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "rgba(250,248,245,0.4)",
            fontFamily: "var(--font-dm-sans)",
            marginBottom: 8,
          }}>
            Agent Portal
          </p>
          <h1 style={{
            fontSize: 32,
            fontWeight: 400,
            color: "#FAF8F5",
            fontFamily: "var(--font-cormorant)",
            margin: 0,
          }}>
            Prospera Properties
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: "block",
              fontSize: 12,
              color: "rgba(250,248,245,0.5)",
              fontFamily: "var(--font-dm-sans)",
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: "100%",
                padding: "14px 16px",
                backgroundColor: "#111C27",
                border: "1px solid rgba(250,248,245,0.12)",
                borderRadius: 8,
                color: "#FAF8F5",
                fontSize: 15,
                fontFamily: "var(--font-dm-sans)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: "block",
              fontSize: 12,
              color: "rgba(250,248,245,0.5)",
              fontFamily: "var(--font-dm-sans)",
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: "100%",
                padding: "14px 16px",
                backgroundColor: "#111C27",
                border: "1px solid rgba(250,248,245,0.12)",
                borderRadius: 8,
                color: "#FAF8F5",
                fontSize: 15,
                fontFamily: "var(--font-dm-sans)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: "rgba(185,28,28,0.15)",
              border: "1px solid rgba(185,28,28,0.3)",
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 16,
              fontSize: 14,
              color: "#FCA5A5",
              fontFamily: "var(--font-dm-sans)",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "15px",
              backgroundColor: loading ? "#4A1020" : "#C4374A",
              color: "#FAF8F5",
              border: "none",
              borderRadius: 8,
              fontSize: 15,
              fontFamily: "var(--font-dm-sans)",
              fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background-color 0.15s",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{
          marginTop: 32,
          textAlign: "center",
          fontSize: 13,
          color: "rgba(250,248,245,0.3)",
          fontFamily: "var(--font-dm-sans)",
        }}>
          Forgot your password? Contact Ebin.
        </p>
      </div>
    </div>
  );
}
