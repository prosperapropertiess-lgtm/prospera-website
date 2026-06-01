"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const NAV = "#1F2F3A";
const BG = "#F7F5F2";
const WHITE = "#FFFFFF";
const TEXT = "#1F2F3A";
const TEXT_SEC = "#444444";
const TEXT_MUT = "#999999";
const ACCENT = "#8B2030";
const BORDER = "#D8D2C8";
const FONT_SERIF = "var(--font-cormorant)";
const FONT_SANS = "var(--font-dm-sans, sans-serif)";

const OFFERS = [
  {
    icon: "📊",
    title: "Free Rental Analysis",
    desc: "We'll tell you exactly what your property should rent for based on current London market data — not a generic estimate.",
  },
  {
    icon: "📁",
    title: "Full Resource Centre Access",
    desc: "Instant access to 10+ free landlord tools: Ontario lease templates, eviction guides, tenant screening checklists, and more.",
  },
  {
    icon: "📞",
    title: "Free Strategy Call",
    desc: "30 minutes with Ebin — no sales pressure. We'll cover your property, your goals, and whether professional management makes sense.",
  },
];

const STEPS = [
  { n: "1", title: "Fill the form", body: "Takes 90 seconds. Name, property address, and what you're looking for." },
  { n: "2", title: "Get instant resource access", body: "You'll be redirected to the full landlord resource centre immediately after submitting." },
  { n: "3", title: "Ebin reaches out within 24 hours", body: "We'll send your rental analysis and book the strategy call at a time that works for you." },
];

const TRUST = [
  { value: "London, ON", label: "Primary market" },
  { value: "5.0 ★", label: "Google rating" },
  { value: "St. Thomas + Strathroy", label: "Also serving" },
  { value: "No lock-in", label: "Month-to-month management" },
];

const FAQS = [
  {
    q: "Is the rental analysis really free?",
    a: "Yes. No credit card, no obligation. We do a proper analysis of your property based on current comparables in your area and send it to you directly.",
  },
  {
    q: "What's in the resource centre?",
    a: "Ontario Standard Lease, our custom lease addendum, tenant screening checklist, N4/N5/N12 eviction guides, rent increase templates, property inspection forms, a landlord tax guide, and more.",
  },
  {
    q: "What happens if I don't want property management after the call?",
    a: "Nothing. You keep the rental analysis and the resource centre access. The call is genuinely no-pressure — we'd rather give you useful information than waste both our time.",
  },
  {
    q: "How long does property management take to set up?",
    a: "We can typically have your property listed and ready to manage within 5–7 business days of signing. That includes inspection, photography coordination, and listing setup.",
  },
];

export default function PropertyManagementLP() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "London", units: "1" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          message: `Property: ${form.address}, ${form.city} — ${form.units} unit(s). From Google Ads landing page.`,
          type: "landlord",
          property: form.address,
          traffic_source: "google_ads",
        }),
      });
      if (res.ok) {
        setStatus("success");
        setTimeout(() => {
          window.location.href = "/resources?ref=lp&welcome=1";
        }, 1200);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div style={{ backgroundColor: BG, fontFamily: FONT_SANS }} className="min-h-screen">

      {/* ── Header ── */}
      <header style={{ backgroundColor: NAV, borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-light text-2xl" style={{ color: "#FAF8F5", fontFamily: FONT_SERIF }}>
            Prospera
          </Link>
          <a
            href="tel:+15196971227"
            className="text-sm font-medium"
            style={{ color: "rgba(250,248,245,0.75)", fontFamily: FONT_SANS }}
          >
            📞 (519) 697-1227
          </a>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ backgroundColor: NAV }} className="pt-16 pb-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left — copy */}
          <div>
            <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "rgba(250,248,245,0.5)", fontFamily: FONT_SANS }}>
              London, Ontario Property Management
            </p>
            <h1 className="text-4xl sm:text-5xl font-light leading-tight mb-6" style={{ color: "#FAF8F5", fontFamily: FONT_SERIF }}>
              Find out exactly what your property should rent for.
              <em className="block mt-1" style={{ color: "rgba(250,248,245,0.7)" }}>Free. No obligation.</em>
            </h1>
            <p className="text-base leading-relaxed mb-8" style={{ color: "rgba(250,248,245,0.65)", fontFamily: FONT_SANS }}>
              Get a personalized rental analysis, full access to our landlord resource centre, and a free 30-minute strategy call — all with no commitment required.
            </p>
            <div className="flex flex-wrap gap-4">
              {["No lock-in contracts", "Licensed & insured", "Serving London since 2021"].map(t => (
                <div key={t} className="flex items-center gap-2">
                  <span style={{ color: ACCENT }}>✓</span>
                  <span className="text-sm" style={{ color: "rgba(250,248,245,0.7)", fontFamily: FONT_SANS }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div className="rounded-2xl p-8" style={{ backgroundColor: WHITE, boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: ACCENT, fontFamily: FONT_SANS }}>Get your free package</p>
            <h2 className="text-2xl font-light mb-6" style={{ color: TEXT, fontFamily: FONT_SERIF }}>
              Rental analysis + resource access
            </h2>

            {status === "success" ? (
              <div className="text-center py-8">
                <p className="text-3xl mb-3">✓</p>
                <p className="text-base font-medium mb-1" style={{ color: TEXT, fontFamily: FONT_SANS }}>You're in.</p>
                <p className="text-sm" style={{ color: TEXT_SEC, fontFamily: FONT_SANS }}>Redirecting you to the resource centre…</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1.5 font-medium" style={{ color: TEXT_SEC, fontFamily: FONT_SANS }}>First name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Ebin"
                      className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none focus:border-[#8B2030] transition-colors"
                      style={{ borderColor: BORDER, fontFamily: FONT_SANS, color: TEXT }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1.5 font-medium" style={{ color: TEXT_SEC, fontFamily: FONT_SANS }}>Phone *</label>
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="(519) 000-0000"
                      className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none focus:border-[#8B2030] transition-colors"
                      style={{ borderColor: BORDER, fontFamily: FONT_SANS, color: TEXT }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-1.5 font-medium" style={{ color: TEXT_SEC, fontFamily: FONT_SANS }}>Email *</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@email.com"
                    className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none focus:border-[#8B2030] transition-colors"
                    style={{ borderColor: BORDER, fontFamily: FONT_SANS, color: TEXT }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1.5 font-medium" style={{ color: TEXT_SEC, fontFamily: FONT_SANS }}>Property address *</label>
                  <input
                    required
                    value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    placeholder="123 Main St"
                    className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none focus:border-[#8B2030] transition-colors"
                    style={{ borderColor: BORDER, fontFamily: FONT_SANS, color: TEXT }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1.5 font-medium" style={{ color: TEXT_SEC, fontFamily: FONT_SANS }}>City</label>
                    <select
                      value={form.city}
                      onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none focus:border-[#8B2030] transition-colors"
                      style={{ borderColor: BORDER, fontFamily: FONT_SANS, color: TEXT }}
                    >
                      <option>London</option>
                      <option>St. Thomas</option>
                      <option>Strathroy</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs mb-1.5 font-medium" style={{ color: TEXT_SEC, fontFamily: FONT_SANS }}>Units</label>
                    <select
                      value={form.units}
                      onChange={e => setForm(f => ({ ...f, units: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none focus:border-[#8B2030] transition-colors"
                      style={{ borderColor: BORDER, fontFamily: FONT_SANS, color: TEXT }}
                    >
                      {["1", "2", "3", "4", "5+"].map(n => <option key={n}>{n}</option>)}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-4 rounded-lg text-sm font-semibold uppercase tracking-widest transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: ACCENT, color: "#FAF8F5", fontFamily: FONT_SANS }}
                >
                  {status === "loading" ? "Sending…" : "Get My Free Analysis →"}
                </button>

                {status === "error" && (
                  <p className="text-xs text-center" style={{ color: "#c0392b", fontFamily: FONT_SANS }}>
                    Something went wrong — call us at (519) 697-1227
                  </p>
                )}

                <p className="text-xs text-center" style={{ color: TEXT_MUT, fontFamily: FONT_SANS }}>
                  No spam. No obligation. We'll follow up within 24 hours.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <div style={{ backgroundColor: WHITE, borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-5xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {TRUST.map(t => (
            <div key={t.label} className="text-center">
              <p className="text-lg font-light" style={{ color: TEXT, fontFamily: FONT_SERIF }}>{t.value}</p>
              <p className="text-xs mt-0.5" style={{ color: TEXT_MUT, fontFamily: FONT_SANS }}>{t.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Offer stack ── */}
      <section className="py-20 px-6" style={{ backgroundColor: BG }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-center mb-3" style={{ color: ACCENT, fontFamily: FONT_SANS }}>What you get</p>
          <h2 className="text-4xl font-light text-center mb-14" style={{ color: TEXT, fontFamily: FONT_SERIF }}>
            Three things. All free. No catch.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {OFFERS.map(o => (
              <div key={o.title} className="rounded-2xl p-8 border" style={{ backgroundColor: WHITE, borderColor: BORDER }}>
                <span className="text-3xl mb-5 block">{o.icon}</span>
                <h3 className="text-xl font-light mb-3" style={{ color: TEXT, fontFamily: FONT_SERIF }}>{o.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: TEXT_SEC, fontFamily: FONT_SANS }}>{o.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What's in the resource centre ── */}
      <section className="py-20 px-6" style={{ backgroundColor: WHITE, borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-center mb-3" style={{ color: ACCENT, fontFamily: FONT_SANS }}>Inside the resource centre</p>
          <h2 className="text-4xl font-light text-center mb-14" style={{ color: TEXT, fontFamily: FONT_SERIF }}>
            10+ tools Ontario landlords actually need.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {[
              { icon: "📄", title: "Ontario Standard Lease Agreement" },
              { icon: "📝", title: "Custom Lease Addendum (Prospera Edition)" },
              { icon: "✅", title: "Tenant Screening Checklist" },
              { icon: "⚖️", title: "N4, N5, N12 Eviction Guides" },
              { icon: "🔍", title: "Move-in / Move-out Inspection Form" },
              { icon: "💼", title: "Ontario Landlord Tax Deduction Guide" },
              { icon: "📋", title: "Rental Application Template" },
              { icon: "📈", title: "Rent Increase Notice Template (N1)" },
              { icon: "🔧", title: "Maintenance Request Form" },
              { icon: "🏠", title: "Landlord Rights Quick Reference" },
            ].map(r => (
              <div key={r.title} className="flex items-center gap-3 py-3 px-4 rounded-lg border" style={{ borderColor: BORDER }}>
                <span className="text-lg shrink-0">{r.icon}</span>
                <span className="text-sm" style={{ color: TEXT_SEC, fontFamily: FONT_SANS }}>{r.title}</span>
                <span className="ml-auto text-xs font-semibold" style={{ color: "#2A6049", fontFamily: FONT_SANS }}>Free</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 px-6" style={{ backgroundColor: BG }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-center mb-3" style={{ color: ACCENT, fontFamily: FONT_SANS }}>What happens next</p>
          <h2 className="text-4xl font-light text-center mb-14" style={{ color: TEXT, fontFamily: FONT_SERIF }}>
            Three steps. Done in minutes.
          </h2>
          <div className="space-y-6">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex gap-6 items-start">
                <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold" style={{ backgroundColor: ACCENT, color: "#FAF8F5", fontFamily: FONT_SANS }}>
                  {s.n}
                </div>
                <div className="pt-1">
                  <h3 className="text-lg font-medium mb-1" style={{ color: TEXT, fontFamily: FONT_SANS }}>{s.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: TEXT_SEC, fontFamily: FONT_SANS }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQs ── */}
      <section className="py-20 px-6" style={{ backgroundColor: WHITE, borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-light text-center mb-14" style={{ color: TEXT, fontFamily: FONT_SERIF }}>
            Common questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={faq.q} className="rounded-xl border overflow-hidden" style={{ borderColor: BORDER }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4"
                  style={{ backgroundColor: WHITE }}
                >
                  <span className="text-sm font-medium" style={{ color: TEXT, fontFamily: FONT_SANS }}>{faq.q}</span>
                  <span className="shrink-0 text-lg" style={{ color: TEXT_MUT }}>{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5" style={{ backgroundColor: "#FAFAF9" }}>
                    <p className="text-sm leading-relaxed" style={{ color: TEXT_SEC, fontFamily: FONT_SANS }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 px-6 text-center" style={{ backgroundColor: NAV }}>
        <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "rgba(250,248,245,0.5)", fontFamily: FONT_SANS }}>Still thinking about it?</p>
        <h2 className="text-4xl font-light mb-4" style={{ color: "#FAF8F5", fontFamily: FONT_SERIF }}>
          It's free. Takes 90 seconds.
        </h2>
        <p className="text-sm mb-10 max-w-md mx-auto" style={{ color: "rgba(250,248,245,0.65)", fontFamily: FONT_SANS }}>
          Worst case: you get a rental analysis and 10 free landlord tools. Best case: you find a better way to manage your property.
        </p>
        <a
          href="#"
          onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className="inline-block px-10 py-4 rounded-lg text-sm font-semibold uppercase tracking-widest transition-opacity hover:opacity-90"
          style={{ backgroundColor: ACCENT, color: "#FAF8F5", fontFamily: FONT_SANS }}
        >
          Get My Free Analysis →
        </a>
        <p className="mt-6 text-sm" style={{ color: "rgba(250,248,245,0.5)", fontFamily: FONT_SANS }}>
          Or call directly: <a href="tel:+15196971227" style={{ color: "rgba(250,248,245,0.8)" }}>(519) 697-1227</a>
        </p>
      </section>

      {/* ── Minimal footer ── */}
      <div className="py-6 px-6 text-center" style={{ backgroundColor: "#141F29", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-xs" style={{ color: "rgba(250,248,245,0.3)", fontFamily: FONT_SANS }}>
          © {new Date().getFullYear()} Prospera Properties · London, Ontario ·{" "}
          <Link href="/privacy" style={{ color: "rgba(250,248,245,0.3)" }}>Privacy</Link>
        </p>
      </div>
    </div>
  );
}
