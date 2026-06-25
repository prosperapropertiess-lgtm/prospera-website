"use client";

import { useState } from "react";
import Link from "next/link";

const BG = "#F5F4F1";
const NAVY = "#0F1C28";
const MUTED = "rgba(15,28,40,0.45)";
const CARD = "#FFFFFF";
const CARD_BORDER = "rgba(15,28,40,0.07)";
const CARD_SHADOW = "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)";
const BURGUNDY = "#8B2030";
const RED = "#B91C1C";
const RED_BG = "rgba(185,28,28,0.08)";
const GREEN = "#0A7A52";
const GREEN_BG = "rgba(10,122,82,0.09)";

type PageState = "idle" | "loading" | "success" | "error";

export default function ResendOnboardingPage() {
  const [email, setEmail] = useState("");
  const [pageState, setPageState] = useState<PageState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setPageState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/onboard/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error ?? "Something went wrong. Please try again.");
        setPageState("error");
      } else {
        setPageState("success");
      }
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setPageState("error");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-dm-sans, var(--font-poppins), -apple-system, sans-serif)",
      }}
    >
      {/* Header */}
      <header style={{ padding: "24px 32px" }}>
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-dm-sans, var(--font-poppins), -apple-system, sans-serif)",
            fontSize: "17px",
            fontWeight: 700,
            color: NAVY,
            textDecoration: "none",
            letterSpacing: "-0.01em",
          }}
        >
          Prospera Properties
        </Link>
      </header>

      {/* Content */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "480px",
            background: CARD,
            border: `1px solid ${CARD_BORDER}`,
            borderRadius: "24px",
            boxShadow: CARD_SHADOW,
            padding: "40px 36px",
          }}
        >
          {pageState === "success" ? (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: GREEN_BG,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  fontSize: "26px",
                }}
              >
                ✓
              </div>
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: NAVY,
                  marginBottom: "12px",
                  letterSpacing: "-0.02em",
                }}
              >
                Check your inbox
              </h1>
              <p style={{ fontSize: "16px", color: MUTED, lineHeight: "1.6" }}>
                We&apos;ve sent the link to{" "}
                <strong style={{ color: GREEN }}>{email}</strong>. It may take a minute to arrive.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h1
                style={{
                  fontSize: "26px",
                  fontWeight: 700,
                  color: NAVY,
                  marginBottom: "10px",
                  letterSpacing: "-0.02em",
                }}
              >
                Get your onboarding link
              </h1>
              <p style={{ fontSize: "16px", color: MUTED, lineHeight: "1.6", marginBottom: "28px" }}>
                Enter the email address Ebin used when setting up your account.
              </p>

              {pageState === "error" && (
                <div
                  style={{
                    background: RED_BG,
                    border: `1px solid rgba(185,28,28,0.15)`,
                    borderRadius: "10px",
                    padding: "12px 16px",
                    marginBottom: "16px",
                    fontSize: "15px",
                    color: RED,
                    fontFamily: "inherit",
                  }}
                >
                  {errorMsg}
                </div>
              )}

              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: MUTED,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "8px",
                }}
              >
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{
                  width: "100%",
                  padding: "13px 16px",
                  fontSize: "16px",
                  fontFamily: "inherit",
                  color: NAVY,
                  background: "#FAFAF9",
                  border: `1px solid ${CARD_BORDER}`,
                  borderRadius: "12px",
                  outline: "none",
                  boxSizing: "border-box",
                  marginBottom: "16px",
                }}
              />
              <button
                type="submit"
                disabled={pageState === "loading" || !email.trim()}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "12px",
                  background: pageState === "loading" || !email.trim() ? "rgba(15,28,40,0.12)" : BURGUNDY,
                  color: pageState === "loading" || !email.trim() ? MUTED : "#FFFFFF",
                  border: "none",
                  fontSize: "16px",
                  fontWeight: 600,
                  fontFamily: "inherit",
                  cursor: pageState === "loading" || !email.trim() ? "not-allowed" : "pointer",
                  transition: "background 0.15s",
                  marginBottom: "20px",
                }}
              >
                {pageState === "loading" ? "Sending…" : "Send my link"}
              </button>
            </form>
          )}

          <div style={{ textAlign: "center", marginTop: pageState === "success" ? "24px" : "0" }}>
            <Link
              href="/"
              style={{
                fontSize: "14px",
                color: MUTED,
                textDecoration: "none",
              }}
            >
              ← Back to prosperaproperties.co
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
