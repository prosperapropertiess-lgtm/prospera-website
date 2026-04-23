"use client";

import { useState } from "react";
import Image from "next/image";

export default function ComingSoon() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ backgroundColor: "#FAF8F5" }}
    >
      {/* Logo */}
      <div className="mb-6">
        <Image
          src="/logo.png"
          alt="Prospera Properties"
          width={200}
          height={200}
          priority
          style={{ mixBlendMode: "multiply" }}
        />
      </div>

      {/* Burgundy divider */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-px" style={{ backgroundColor: "#7B1C1C" }} />
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#7B1C1C" }} />
        <div className="w-16 h-px" style={{ backgroundColor: "#7B1C1C" }} />
      </div>

      {/* Headline */}
      <h1
        className="text-5xl sm:text-6xl md:text-7xl font-light text-center leading-tight mb-6 max-w-3xl"
        style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}
      >
        Something Beautiful
        <br />
        <span className="italic" style={{ color: "#7B1C1C" }}>
          Is Coming
        </span>
      </h1>

      {/* Subtitle */}
      <p
        className="text-base sm:text-lg text-center max-w-xl leading-relaxed mb-4"
        style={{ color: "#0D1B2A", fontFamily: "var(--font-inter)", opacity: 0.75 }}
      >
        We&apos;re building a new standard in property management — where owners feel confident
        and tenants feel at home.
      </p>

      {/* Cities */}
      <p
        className="text-sm text-center mb-12 uppercase tracking-widest"
        style={{ color: "#2D4A5E", fontFamily: "var(--font-inter)" }}
      >
        London &nbsp;·&nbsp; St. Thomas &nbsp;·&nbsp; Sarnia
      </p>

      {/* Email capture */}
      {status === "success" ? (
        <div className="text-center">
          <p
            className="text-2xl mb-2"
            style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}
          >
            You&apos;re on the list.
          </p>
          <p
            className="text-sm"
            style={{ color: "#0D1B2A", fontFamily: "var(--font-inter)", opacity: 0.6 }}
          >
            We&apos;ll be in touch when we launch.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md flex flex-col sm:flex-row gap-3"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            className="flex-1 px-5 py-3 text-sm outline-none border"
            style={{
              backgroundColor: "#FAF8F5",
              color: "#0D1B2A",
              borderColor: "#7B1C1C",
              fontFamily: "var(--font-inter)",
            }}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-6 py-3 text-xs uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{
              backgroundColor: "#0D1B2A",
              color: "#FAF8F5",
              fontFamily: "var(--font-inter)",
            }}
          >
            {status === "loading" ? "..." : "Notify Me"}
          </button>
        </form>
      )}

      {status === "error" && (
        <p
          className="mt-4 text-sm"
          style={{ color: "#7B1C1C", fontFamily: "var(--font-inter)" }}
        >
          Something went wrong. Please try again.
        </p>
      )}

      {/* Bottom divider */}
      <div className="flex items-center gap-4 mt-16 mb-8">
        <div className="w-16 h-px" style={{ backgroundColor: "#7B1C1C" }} />
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#7B1C1C" }} />
        <div className="w-16 h-px" style={{ backgroundColor: "#7B1C1C" }} />
      </div>

      {/* Footer */}
      <p
        className="text-xs"
        style={{ color: "#0D1B2A", fontFamily: "var(--font-inter)", opacity: 0.4 }}
      >
        &copy; {new Date().getFullYear()} Prospera Properties
      </p>
    </main>
  );
}
