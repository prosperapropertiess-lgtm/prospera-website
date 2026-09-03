"use client";
import { useState } from "react";

const TOPICS = [
  "Account & Login",
  "Properties & Portfolio",
  "Maintenance",
  "Documents",
  "App Problem",
  "Something else",
];

export default function SupportForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [property, setProperty] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const inputStyle = {
    backgroundColor: "#F7F5F2",
    borderColor: "#D8D2C8",
    color: "#222222",
    fontFamily: "var(--font-dm-sans)",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !message) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          property: property || null,
          type: "app_support",
          message: `Topic: ${topic}\n\n${message}`,
        }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        className="rounded-2xl border p-10 text-center"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#D8D2C8", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
      >
        <p className="text-2xl font-light mb-2" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
          Got it.
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
          We received your message and will get back to you soon &mdash; usually within a few hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-7 sm:p-8" style={{ borderColor: "#D8D2C8", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
            Name
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border text-sm"
            style={inputStyle}
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
            Email
          </label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border text-sm"
            style={inputStyle}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
          Property address or name <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
        </label>
        <input
          value={property}
          onChange={(e) => setProperty(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border text-sm"
          style={inputStyle}
        />
      </div>

      <div className="mb-4">
        <label className="block text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
          What do you need help with?
        </label>
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border text-sm"
          style={inputStyle}
        >
          {TOPICS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
          Message
        </label>
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what's going on. A screenshot helps if you're reporting something broken."
          className="w-full px-4 py-3 rounded-lg border text-sm resize-none"
          style={inputStyle}
        />
      </div>

      {status === "error" && (
        <p className="text-sm mb-4" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>
          Something went wrong sending that. Please try again, or call (519) 697-1227.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full px-8 py-4 text-xs font-semibold uppercase tracking-widest rounded transition-opacity hover:opacity-85"
        style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)", opacity: status === "loading" ? 0.6 : 1 }}
      >
        {status === "loading" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
