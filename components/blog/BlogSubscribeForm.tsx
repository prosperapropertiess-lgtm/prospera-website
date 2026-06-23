"use client";
import { useState } from "react";

export default function BlogSubscribeForm({ midPost }: { midPost?: boolean }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, type: "general", source: "blog-post" }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (midPost) {
    return (
      <div
        className="my-12 px-8 py-8 border-l-4 rounded-r-xl"
        style={{ backgroundColor: "#F7F5F2", borderColor: "#8B2030" }}
      >
        {status === "done" ? (
          <p className="text-sm font-medium" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
            You&apos;re in. We&apos;ll send practical landlord tips straight to your inbox.
          </p>
        ) : (
          <>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>
              Landlord Insights
            </p>
            <p className="text-lg font-light mb-4" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              Get practical tips for Ontario landlords — delivered free.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm border focus:outline-none rounded"
                style={{ borderColor: "#D8D2C8", fontFamily: "var(--font-dm-sans)", backgroundColor: "#FFFFFF", color: "#222222" }}
              />
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-2.5 text-sm border focus:outline-none rounded"
                style={{ borderColor: "#D8D2C8", fontFamily: "var(--font-dm-sans)", backgroundColor: "#FFFFFF", color: "#222222" }}
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-6 py-2.5 text-xs uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-50 rounded"
                style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
              >
                {status === "loading" ? "..." : "Subscribe"}
              </button>
            </form>
            {status === "error" && (
              <p className="text-xs mt-2" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>
                Something went wrong. Try again.
              </p>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <section className="py-16 px-6" style={{ backgroundColor: "#1F2F3A" }}>
      <div className="max-w-2xl mx-auto text-center">
        {status === "done" ? (
          <>
            <p className="text-3xl font-light mb-3" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
              You&apos;re subscribed.
            </p>
            <p className="text-sm" style={{ color: "rgba(250,248,245,0.8)", fontFamily: "var(--font-dm-sans)" }}>
              Practical landlord tips from Prospera Properties, straight to your inbox.
            </p>
          </>
        ) : (
          <>
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "rgba(250,248,245,0.75)", fontFamily: "var(--font-dm-sans)" }}>
              Free Landlord Newsletter
            </p>
            <h2 className="text-3xl md:text-4xl font-light mb-3" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
              Stay ahead as an Ontario landlord.
            </h2>
            <p className="text-sm mb-8" style={{ color: "rgba(250,248,245,0.8)", fontFamily: "var(--font-dm-sans)" }}>
              New posts on Ontario law, eviction process, tenant screening, and more — no spam, unsubscribe anytime.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 px-4 py-3 text-sm focus:outline-none rounded"
                style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
              />
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-4 py-3 text-sm focus:outline-none rounded"
                style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-6 py-3 text-xs uppercase tracking-widest transition-opacity hover:opacity-80 disabled:opacity-50 whitespace-nowrap rounded"
                style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
              >
                {status === "loading" ? "..." : "Subscribe Free"}
              </button>
            </form>
            {status === "error" && (
              <p className="text-xs mt-3" style={{ color: "#F87171", fontFamily: "var(--font-dm-sans)" }}>
                Something went wrong. Try again.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
