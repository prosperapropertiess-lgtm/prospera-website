"use client";
import { useState } from "react";
import FadeIn from "@/components/animations/FadeIn";

export default function NewsletterPage() {
  const [form, setForm] = useState({ name: "", email: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          type: "landlord",
          source: "newsletter",
        }),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const inputStyle: React.CSSProperties = {
    borderColor: "#D8D2C8",
    backgroundColor: "#F7F5F2",
    color: "#222222",
    fontFamily: "var(--font-dm-sans)",
  };

  const inputClass = "w-full px-4 py-3 text-sm border rounded outline-none focus:border-[#1F2F3A] transition-colors";

  return (
    <div style={{ backgroundColor: "#F7F5F2", minHeight: "100vh" }}>
      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center" style={{ backgroundColor: "#1F2F3A" }}>
        <FadeIn>
          <p
            className="text-xs uppercase tracking-widest mb-4"
            style={{ color: "rgba(250,248,245,0.55)", fontFamily: "var(--font-dm-sans)" }}
          >
            Ontario Landlord Newsletter
          </p>
          <h1
            className="text-5xl md:text-6xl font-light mb-5"
            style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
          >
            Know What Other Landlords Don&apos;t.
          </h1>
          <p
            className="text-sm max-w-md mx-auto leading-relaxed"
            style={{ color: "rgba(250,248,245,0.65)", fontFamily: "var(--font-dm-sans)" }}
          >
            Weekly insights on Ontario landlord law, LTB updates, tenant screening, and the numbers that actually matter.
            No fluff. Unsubscribe any time.
          </p>
        </FadeIn>
      </section>

      {/* Form */}
      <section className="py-20 px-6">
        <div className="max-w-lg mx-auto">
          <FadeIn>
            {status === "success" ? (
              <div
                className="bg-white rounded-xl p-12 text-center border"
                style={{ borderColor: "#D8D2C8", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: "rgba(139,32,48,0.08)" }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8B2030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p
                  className="text-4xl font-light mb-3"
                  style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
                >
                  You&apos;re in.
                </p>
                <p
                  className="text-sm mb-2"
                  style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}
                >
                  Check your inbox — a welcome email is on its way.
                </p>
                <p
                  className="text-xs"
                  style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
                >
                  Questions? Reach us at{" "}
                  <a href="mailto:hello@prosperaproperties.co" className="hover:opacity-80" style={{ color: "#8B2030" }}>
                    hello@prosperaproperties.co
                  </a>
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-xl p-8 border space-y-5"
                style={{ borderColor: "#D8D2C8", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
              >
                <div>
                  <p
                    className="text-xs uppercase tracking-widest mb-6"
                    style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
                  >
                    Free. Weekly. Ontario-focused.
                  </p>

                  {/* What you get */}
                  <ul className="space-y-3 mb-8">
                    {[
                      "RTA changes and LTB rulings that affect your units",
                      "Tenant screening red flags and how to avoid them",
                      "The real math on self-managing vs. hiring out",
                      "What London and St. Thomas landlords are dealing with right now",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                        <svg
                          className="mt-0.5 shrink-0"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#8B2030"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div
                    className="border-t pt-6 space-y-4"
                    style={{ borderColor: "#E8E4DF" }}
                  >
                    <div>
                      <label
                        className="text-xs mb-1.5 block"
                        style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}
                      >
                        First Name
                      </label>
                      <input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className={inputClass}
                        style={inputStyle}
                        placeholder="Your first name"
                      />
                    </div>
                    <div>
                      <label
                        className="text-xs mb-1.5 block"
                        style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}
                      >
                        Email Address *
                      </label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className={inputClass}
                        style={inputStyle}
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                </div>

                {status === "error" && (
                  <p className="text-sm" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>
                    Something went wrong. Please try again.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-4 text-xs uppercase tracking-widest rounded disabled:opacity-50"
                  style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
                >
                  {status === "loading" ? "Subscribing..." : "Subscribe Free →"}
                </button>

                <p
                  className="text-xs text-center"
                  style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
                >
                  No spam. Unsubscribe any time.
                </p>
              </form>
            )}
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
