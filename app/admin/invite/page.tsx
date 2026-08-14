"use client";
import { useState } from "react";
import Link from "next/link";

export default function InviteLandlordPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, full_name: fullName }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setSuccess(email);
        setFullName("");
        setEmail("");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F7F5F2", fontFamily: "var(--font-poppins, sans-serif)" }}>

      {/* Top bar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", height: 54,
        backgroundColor: "#1F2F3A",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/admin" style={{
            fontSize: 13,
            color: "rgba(250,248,245,0.55)",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>&#8592;</span>
            Back
          </Link>
          <span style={{ color: "rgba(250,248,245,0.2)", fontSize: 14 }}>/</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#FAF8F5", letterSpacing: "-0.02em" }}>Prospera</span>
        </div>
      </div>

      {/* Content */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "80px 24px 100px",
      }}>
        <div style={{
          width: "100%",
          maxWidth: 480,
          backgroundColor: "#FFFFFF",
          border: "1.5px solid #E0DBD4",
          borderRadius: 20,
          padding: "40px 40px 48px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}>
          <p style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "#BBBBBB",
            margin: "0 0 10px",
          }}>
            Landlords
          </p>
          <h1 style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#1F2F3A",
            margin: "0 0 32px",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}>
            Invite a Landlord
          </h1>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: "block",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#666666",
                marginBottom: 8,
              }}>
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Smith"
                required
                disabled={loading}
                style={{
                  width: "100%",
                  height: 48,
                  padding: "0 16px",
                  borderRadius: 10,
                  border: "1.5px solid #D8D2C8",
                  backgroundColor: "#F7F5F2",
                  color: "#222222",
                  fontSize: 14,
                  fontFamily: "var(--font-poppins, sans-serif)",
                  outline: "none",
                  boxSizing: "border-box",
                  opacity: loading ? 0.6 : 1,
                }}
              />
            </div>

            <div style={{ marginBottom: 32 }}>
              <label style={{
                display: "block",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#666666",
                marginBottom: 8,
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                required
                disabled={loading}
                style={{
                  width: "100%",
                  height: 48,
                  padding: "0 16px",
                  borderRadius: 10,
                  border: "1.5px solid #D8D2C8",
                  backgroundColor: "#F7F5F2",
                  color: "#222222",
                  fontSize: 14,
                  fontFamily: "var(--font-poppins, sans-serif)",
                  outline: "none",
                  boxSizing: "border-box",
                  opacity: loading ? 0.6 : 1,
                }}
              />
            </div>

            {success && (
              <div style={{
                marginBottom: 24,
                padding: "12px 16px",
                backgroundColor: "#F0FDF4",
                border: "1.5px solid #86EFAC",
                borderRadius: 10,
                fontSize: 13,
                color: "#166534",
              }}>
                Invite sent to {success}.
              </div>
            )}

            {error && (
              <div style={{
                marginBottom: 24,
                padding: "12px 16px",
                backgroundColor: "#FEF2F2",
                border: "1.5px solid #FCA5A5",
                borderRadius: 10,
                fontSize: 13,
                color: "#991B1B",
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: 48,
                borderRadius: 10,
                backgroundColor: loading ? "rgba(31,47,58,0.6)" : "#1F2F3A",
                color: "#FAF8F5",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "var(--font-poppins, sans-serif)",
                transition: "background-color 0.15s ease",
              }}
            >
              {loading ? "Sending..." : "Send Invite"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
