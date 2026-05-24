"use client";

import { useState } from "react";

interface WaitlistFormProps {
  source?: string;
  layout?: "row" | "stack";
  dark?: boolean;
}

export default function WaitlistForm({
  source = "platform",
  layout = "row",
  dark = false,
}: WaitlistFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const inputBase = {
    fontFamily: "var(--font-dm-sans)",
    fontSize: "0.875rem",
    outline: "none",
  };

  const inputStyle = dark
    ? {
        ...inputBase,
        backgroundColor: "rgba(250,248,245,0.06)",
        border: "1px solid rgba(250,248,245,0.15)",
        color: "#FAF8F5",
      }
    : {
        ...inputBase,
        backgroundColor: "#F7F5F2",
        border: "1px solid #D8D2C8",
        color: "#222222",
      };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, source }),
      });

      if (res.ok) {
        setStatus("success");
        setName("");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div
        className="rounded-xl px-6 py-5 text-center"
        style={{
          backgroundColor: dark ? "rgba(250,248,245,0.06)" : "#FFFFFF",
          border: dark ? "1px solid rgba(250,248,245,0.15)" : "1px solid #D8D2C8",
        }}
      >
        <p
          className="text-sm font-semibold mb-1"
          style={{ color: dark ? "#FAF8F5" : "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
        >
          You&apos;re on the list.
        </p>
        <p
          className="text-sm"
          style={{ color: dark ? "rgba(250,248,245,0.55)" : "#444444", fontFamily: "var(--font-dm-sans)" }}
        >
          We&apos;ll reach out when early access opens. You&apos;ll be first.
        </p>
      </div>
    );
  }

  if (layout === "stack") {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
        <input
          type="text"
          placeholder="Your first name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl"
          style={inputStyle}
        />
        <input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl"
          style={inputStyle}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full py-4 text-sm font-semibold uppercase tracking-widest rounded-xl transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{
            backgroundColor: "#8B2030",
            color: "#FAF8F5",
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          {status === "loading" ? "Joining…" : "Get Early Access"}
        </button>
        {status === "error" && (
          <p className="text-xs text-center" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>
            Something went wrong. Try again.
          </p>
        )}
        <p
          className="text-xs text-center"
          style={{ color: dark ? "rgba(250,248,245,0.35)" : "#999999", fontFamily: "var(--font-dm-sans)" }}
        >
          No spam. No credit card. Just early access.
        </p>
      </form>
    );
  }

  // row layout
  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="First name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="sm:w-36 px-4 py-3 rounded-xl flex-shrink-0"
          style={inputStyle}
        />
        <input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 px-4 py-3 rounded-xl"
          style={inputStyle}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="flex-shrink-0 px-7 py-3 text-sm font-semibold uppercase tracking-widest rounded-xl transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{
            backgroundColor: "#8B2030",
            color: "#FAF8F5",
            fontFamily: "var(--font-dm-sans)",
          }}
        >
          {status === "loading" ? "…" : "Join Waitlist"}
        </button>
      </div>
      {status === "error" && (
        <p className="text-xs mt-2" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>
          Something went wrong. Try again.
        </p>
      )}
      <p
        className="text-xs mt-3"
        style={{ color: dark ? "rgba(250,248,245,0.35)" : "#999999", fontFamily: "var(--font-dm-sans)" }}
      >
        No spam. No credit card. Unsubscribe anytime.
      </p>
    </form>
  );
}
