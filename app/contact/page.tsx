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

  const inputClass = "w-full px-4 py-3 text-sm border border-[#1E3050] rounded bg-[#112035] text-[#FAF8F5] focus:outline-none focus:border-[#C5A55A] transition-colors";

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 px-6 bg-[#0A1628] text-center">
        <FadeIn>
          <p className="text-xs uppercase tracking-widest text-[#C5A55A] mb-4">Reach Out</p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-5xl md:text-6xl font-light text-[#FAF8F5] mb-5">
            Let&apos;s Talk.
          </h1>
          <p className="text-sm text-[#B0B8C4] max-w-md mx-auto leading-relaxed">
            Whether you&apos;re a landlord looking for management or a tenant looking for a home — we&apos;re here. Fill out the form or reach us directly.
          </p>
        </FadeIn>
      </section>

      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          {/* Contact Info */}
          <FadeIn>
            <div className="space-y-10">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#C5A55A] mb-3">Phone</p>
                <a href="tel:5196971227" className="font-[family-name:var(--font-cormorant)] text-2xl text-[#FAF8F5] hover:text-[#C5A55A] transition-colors">
                  (519) 697-1227
                </a>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-[#C5A55A] mb-3">Email</p>
                <a href="mailto:hello@prosperaproperties.co" className="text-sm text-[#B0B8C4] hover:text-[#C5A55A] transition-colors break-all">
                  hello@prosperaproperties.co
                </a>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-[#C5A55A] mb-3">Service Areas</p>
                <p className="text-sm text-[#B0B8C4] leading-relaxed">London, Ontario<br />St. Thomas, Ontario<br />Strathroy, Ontario</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-[#C5A55A] mb-3">Portals</p>
                <div className="space-y-2">
                  <a href="https://prosperaproperties.buildiumapp.com" target="_blank" rel="noopener noreferrer" className="block text-sm text-[#B0B8C4] hover:text-[#C5A55A] transition-colors">Landlord Portal →</a>
                  <a href="https://prosperaproperties.buildiumapp.com" target="_blank" rel="noopener noreferrer" className="block text-sm text-[#B0B8C4] hover:text-[#C5A55A] transition-colors">Tenant Portal →</a>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Form */}
          <FadeIn delay={0.1} className="md:col-span-2">
            {status === "success" ? (
              <div className="bg-[#0A1628] rounded-xl p-12 text-center border border-[#C5A55A]/40">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "rgba(197,165,90,0.15)" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C5A55A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="font-[family-name:var(--font-cormorant)] text-4xl text-[#FAF8F5] mb-3">Message Received.</p>
                <p className="text-sm text-[#B0B8C4] mb-6">We&apos;ll be in touch within 1 business day.</p>
                <p className="text-xs text-[#8098B4]">In the meantime, feel free to call us at <a href="tel:+15196971227" className="text-[#C5A55A] hover:opacity-80">(519) 697-1227</a></p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 bg-[#112035] rounded-xl p-8 shadow-sm border border-[#1E3050]">
                {/* I am a... */}
                <div className="flex gap-4">
                  {["landlord", "tenant", "other"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, type: t })}
                      className={`flex-1 py-2.5 text-xs uppercase tracking-wide rounded border transition-colors ${form.type === t ? "bg-[#C5A55A] text-white border-[#C5A55A]" : "border-[#1E3050] text-[#B0B8C4] hover:border-[#C5A55A]"}`}
                    >
                      {t === "landlord" ? "I'm a Landlord" : t === "tenant" ? "I'm a Tenant" : "Other"}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs text-[#B0B8C4] mb-1.5 block">Full Name *</label>
                    <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="text-xs text-[#B0B8C4] mb-1.5 block">Email *</label>
                    <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="your@email.com" />
                  </div>
                  <div>
                    <label className="text-xs text-[#B0B8C4] mb-1.5 block">Phone</label>
                    <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inputClass} placeholder="(519) 000-0000" />
                  </div>
                  <div>
                    <label className="text-xs text-[#B0B8C4] mb-1.5 block">City</label>
                    <select value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className={inputClass}>
                      <option value="">Select city...</option>
                      <option>London, ON</option>
                      <option>St. Thomas, ON</option>
                      <option>Strathroy, ON</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#B0B8C4] mb-1.5 block">Message *</label>
                  <textarea required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className={inputClass} placeholder="Tell us about your property or what you're looking for..." />
                </div>

                {status === "error" && <p className="text-sm text-[#C5A55A]">Something went wrong. Please try again or call us directly.</p>}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-4 bg-[#C5A55A] text-white text-sm uppercase tracking-wide rounded hover:opacity-80 transition-colors disabled:opacity-50"
                >
                  {status === "loading" ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </FadeIn>
        </div>
      </section>
    </>
  );
}
