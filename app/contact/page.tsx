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

  const inputClass = "w-full px-4 py-3 text-sm border border-gray-200 rounded bg-white text-[#0A1628] focus:outline-none focus:border-[#7B1C1C] transition-colors";

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 px-6 bg-[#FAF8F5] text-center">
        <FadeIn>
          <p className="text-xs uppercase tracking-widest text-[#7B1C1C] mb-4">Reach Out</p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-5xl md:text-6xl font-light text-[#0A1628] mb-5">
            Let&apos;s Talk.
          </h1>
          <p className="text-sm text-[#2D4A5E] max-w-md mx-auto leading-relaxed">
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
                <p className="text-xs uppercase tracking-widest text-[#7B1C1C] mb-3">Phone</p>
                <a href="tel:5196971227" className="font-[family-name:var(--font-cormorant)] text-2xl text-[#0A1628] hover:text-[#7B1C1C] transition-colors">
                  (519) 697-1227
                </a>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-[#7B1C1C] mb-3">Email</p>
                <a href="mailto:prosperapropertiess@gmail.com" className="text-sm text-[#2D4A5E] hover:text-[#7B1C1C] transition-colors break-all">
                  prosperapropertiess@gmail.com
                </a>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-[#7B1C1C] mb-3">Service Areas</p>
                <p className="text-sm text-[#2D4A5E] leading-relaxed">London, Ontario<br />St. Thomas, Ontario<br />Strathroy, Ontario</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-[#7B1C1C] mb-3">Portals</p>
                <div className="space-y-2">
                  <a href="https://prosperaproperties.buildiumapp.com" target="_blank" rel="noopener noreferrer" className="block text-sm text-[#2D4A5E] hover:text-[#7B1C1C] transition-colors">Landlord Portal →</a>
                  <a href="https://prosperaproperties.buildiumapp.com" target="_blank" rel="noopener noreferrer" className="block text-sm text-[#2D4A5E] hover:text-[#7B1C1C] transition-colors">Tenant Portal →</a>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Form */}
          <FadeIn delay={0.1} className="md:col-span-2">
            {status === "success" ? (
              <div className="bg-[#FAF8F5] rounded-xl p-12 text-center border border-gray-100">
                <p className="font-[family-name:var(--font-cormorant)] text-4xl text-[#0A1628] mb-3">Message Received.</p>
                <p className="text-sm text-[#2D4A5E]">We&apos;ll be in touch within 1 business day.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                {/* I am a... */}
                <div className="flex gap-4">
                  {["landlord", "tenant", "other"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, type: t })}
                      className={`flex-1 py-2.5 text-xs uppercase tracking-wide rounded border transition-colors ${form.type === t ? "bg-[#7B1C1C] text-white border-[#7B1C1C]" : "border-gray-200 text-[#2D4A5E] hover:border-[#7B1C1C]"}`}
                    >
                      {t === "landlord" ? "I'm a Landlord" : t === "tenant" ? "I'm a Tenant" : "Other"}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs text-[#2D4A5E] mb-1.5 block">Full Name *</label>
                    <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="text-xs text-[#2D4A5E] mb-1.5 block">Email *</label>
                    <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="your@email.com" />
                  </div>
                  <div>
                    <label className="text-xs text-[#2D4A5E] mb-1.5 block">Phone</label>
                    <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inputClass} placeholder="(519) 000-0000" />
                  </div>
                  <div>
                    <label className="text-xs text-[#2D4A5E] mb-1.5 block">City</label>
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
                  <label className="text-xs text-[#2D4A5E] mb-1.5 block">Message *</label>
                  <textarea required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className={inputClass} placeholder="Tell us about your property or what you're looking for..." />
                </div>

                {status === "error" && <p className="text-sm text-[#7B1C1C]">Something went wrong. Please try again or call us directly.</p>}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-4 bg-[#7B1C1C] text-white text-sm uppercase tracking-wide rounded hover:bg-[#9B2E2E] transition-colors disabled:opacity-50"
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
