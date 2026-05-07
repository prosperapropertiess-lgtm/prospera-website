"use client";
import { useState } from "react";
import FadeIn from "@/components/animations/FadeIn";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", city: "", message: "", type: "landlord" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", phone: "", city: "", message: "", type: "landlord" });
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
    <div style={{ backgroundColor: "#F7F5F2" }}>
      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center" style={{ backgroundColor: "#1F2F3A" }}>
        <FadeIn>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "rgba(250,248,245,0.55)", fontFamily: "var(--font-dm-sans)" }}>Reach Out</p>
          <h1 className="text-5xl md:text-6xl font-light mb-5" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Let&apos;s Talk.
          </h1>
          <p className="text-sm max-w-md mx-auto leading-relaxed" style={{ color: "rgba(250,248,245,0.65)", fontFamily: "var(--font-dm-sans)" }}>
            Whether you&apos;re a landlord looking for management or a tenant looking for a home — we&apos;re here. Fill out the form or reach us directly.
          </p>
        </FadeIn>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          {/* Contact Info */}
          <FadeIn>
            <div className="space-y-10">
              <div>
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#6A2E35", fontFamily: "var(--font-dm-sans)" }}>Phone</p>
                <a href="tel:5196971227" className="text-2xl font-light transition-colors hover:opacity-80" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
                  (519) 697-1227
                </a>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#6A2E35", fontFamily: "var(--font-dm-sans)" }}>Email</p>
                <a href="mailto:hello@prosperaproperties.co" className="text-sm transition-colors hover:opacity-80 break-all" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                  hello@prosperaproperties.co
                </a>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#6A2E35", fontFamily: "var(--font-dm-sans)" }}>Service Areas</p>
                <p className="text-sm leading-relaxed" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>London, Ontario<br />St. Thomas, Ontario<br />Strathroy, Ontario</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#6A2E35", fontFamily: "var(--font-dm-sans)" }}>Portals</p>
                <div className="space-y-2">
                  <a href="https://prosperaproperties.buildiumapp.com" target="_blank" rel="noopener noreferrer" className="block text-sm transition-colors hover:opacity-80" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>Landlord Portal →</a>
                  <a href="https://prosperaproperties.buildiumapp.com" target="_blank" rel="noopener noreferrer" className="block text-sm transition-colors hover:opacity-80" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>Tenant Portal →</a>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Form */}
          <FadeIn delay={0.1} className="md:col-span-2">
            {status === "success" ? (
              <div className="bg-white rounded-xl p-12 text-center border" style={{ borderColor: "#D8D2C8", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "rgba(106,46,53,0.08)" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6A2E35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-4xl font-light mb-3" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>Message Received.</p>
                <p className="text-sm mb-6" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>We&apos;ll be in touch within 1 business day.</p>
                <p className="text-xs" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>In the meantime, feel free to call us at <a href="tel:+15196971227" className="hover:opacity-80" style={{ color: "#6A2E35" }}>(519) 697-1227</a></p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-xl p-8 border" style={{ borderColor: "#D8D2C8", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                {/* I am a... */}
                <div className="flex gap-3">
                  {["landlord", "tenant", "other"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, type: t })}
                      className="flex-1 py-2.5 text-xs uppercase tracking-wide rounded border transition-colors"
                      style={{
                        backgroundColor: form.type === t ? "#1F2F3A" : "transparent",
                        borderColor: form.type === t ? "#1F2F3A" : "#D8D2C8",
                        color: form.type === t ? "#FAF8F5" : "#444444",
                        fontFamily: "var(--font-dm-sans)",
                      }}
                    >
                      {t === "landlord" ? "I'm a Landlord" : t === "tenant" ? "I'm a Tenant" : "Other"}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs mb-1.5 block" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>Full Name *</label>
                    <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} style={inputStyle} placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="text-xs mb-1.5 block" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>Email *</label>
                    <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass} style={inputStyle} placeholder="your@email.com" />
                  </div>
                  <div>
                    <label className="text-xs mb-1.5 block" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>Phone</label>
                    <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inputClass} style={inputStyle} placeholder="(519) 000-0000" />
                  </div>
                  <div>
                    <label className="text-xs mb-1.5 block" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>City</label>
                    <select value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className={inputClass} style={inputStyle}>
                      <option value="">Select city...</option>
                      <option>London, ON</option>
                      <option>St. Thomas, ON</option>
                      <option>Strathroy, ON</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>Message *</label>
                  <textarea required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className={inputClass} style={inputStyle} placeholder="Tell us about your property or what you're looking for..." />
                </div>

                {status === "error" && <p className="text-sm" style={{ color: "#6A2E35", fontFamily: "var(--font-dm-sans)" }}>Something went wrong. Please try again or call us directly.</p>}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-4 text-sm uppercase tracking-wide rounded transition-opacity hover:opacity-80 disabled:opacity-50"
                  style={{ backgroundColor: "#6A2E35", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
                >
                  {status === "loading" ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
