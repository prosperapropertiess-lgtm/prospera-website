"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const CLAUSES = [
  { n: "01", title: "Unauthorized Occupants", body: "Who is and isn't permitted to live in the unit — including limits on long-term guests." },
  { n: "02", title: "Pet Damage Liability", body: "Specific financial responsibility clauses that survive move-out, regardless of deposit." },
  { n: "03", title: "Move-In & Move-Out Condition", body: "Standards for property condition at both ends of tenancy — enforceable at the LTB." },
  { n: "04", title: "Early Termination Penalties", body: "Conditions and costs when a tenant breaks the lease before the agreed end date." },
  { n: "05", title: "Appliance & Utility Responsibilities", body: "Who maintains what, and what happens when an appliance provided by the landlord fails." },
  { n: "06", title: "Notice Requirements for Access", body: "Repair access, inspections, and showings — what's required and what qualifies as proper notice." },
  { n: "07", title: "No Smoking Policy", body: "Covers the unit, balcony, and common areas — with defined consequences for violations." },
  { n: "08", title: "Subletting & Airbnb Restrictions", body: "Explicit prohibition of unauthorized subletting and short-term rental platforms." },
  { n: "09", title: "Parking Rules & Guest Vehicles", body: "Assigned spaces, visitor limits, and unauthorized vehicle removal rights." },
  { n: "10", title: "Garbage & Recycling Obligations", body: "Tenant responsibilities for waste disposal, including large-item removal." },
  { n: "11", title: "Noise & Nuisance Standards", body: "Defined thresholds and complaint process — strengthens N5 notices if needed." },
  { n: "12", title: "Tenant Insurance Requirement", body: "Written confirmation that the tenant carries their own content and liability insurance." },
  { n: "13", title: "Lock & Key Policy", body: "Unauthorized lock changes, key duplication, and lockout procedures." },
  { n: "14", title: "Snow Removal & Exterior Maintenance", body: "Responsibilities for single-family and semi-detached properties — clearly assigned." },
  { n: "15", title: "Damage Beyond Normal Wear & Tear", body: "Defines what qualifies and establishes the landlord's right to recover costs." },
  { n: "16", title: "Communication & Notice Methods", body: "Email and written notice standards — what counts as proper legal communication." },
  { n: "17", title: "Illegal Activity Clause", body: "Grounds for N6 notice and immediate LTB application, documented in writing from day one." },
];

const PROOF = [
  "Used across rental properties managed in London, Strathroy, and St. Thomas",
  "Written specifically for Ontario's Residential Tenancies Act — not adapted from another province",
  "Tested against real tenant dispute scenarios, not hypothetical situations",
];

export default function LeaseAddendumLP() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/resources/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          resourceId: "lease-addendum",
          resourceTitle: "17-Point Ontario Lease Addendum",
        }),
      });
      if (res.ok) {
        setStatus("success");
        setTimeout(() => {
          window.location.href = "/lp/lease-addendum/thank-you";
        }, 800);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const form = (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="First name"
        className="px-4 py-3 text-sm border rounded-lg outline-none focus:border-[#8B2030] transition-colors"
        style={{ borderColor: "#D8D2C8", backgroundColor: "#FFFFFF", color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
      />
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email address"
        className="px-4 py-3 text-sm border rounded-lg outline-none focus:border-[#8B2030] transition-colors"
        style={{ borderColor: "#D8D2C8", backgroundColor: "#FFFFFF", color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
      />
      {status === "error" && (
        <p className="text-xs" style={{ color: "#c0392b", fontFamily: "var(--font-dm-sans)" }}>
          Something went wrong. Call us: (519) 697-1227
        </p>
      )}
      <button
        type="submit"
        disabled={status === "loading" || status === "success"}
        className="py-4 text-sm font-semibold uppercase tracking-widest rounded-lg transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
      >
        {status === "loading" ? "Sending…" : status === "success" ? "Sent ✓" : "Send Me the Free Addendum →"}
      </button>
      <p className="text-xs text-center" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
        No spam. No sales calls. Just the document and occasional landlord tips.
      </p>
    </form>
  );

  return (
    <div style={{ backgroundColor: "#F7F5F2", fontFamily: "var(--font-dm-sans)" }} className="min-h-screen">

      {/* ── Header ── */}
      <header style={{ backgroundColor: "#1F2F3A", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-light text-2xl" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Prospera
          </span>
          <a href="tel:+15196971227" className="text-sm" style={{ color: "rgba(250,248,245,0.7)", fontFamily: "var(--font-dm-sans)" }}>
            (519) 697-1227
          </a>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ backgroundColor: "#1F2F3A" }} className="pb-20 pt-16 px-6">
        <div className="max-w-5xl mx-auto">

          {/* Headline — full width, always above the fold */}
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>
              Free Download — Ontario Landlords
            </p>
            <h1
              className="text-4xl sm:text-5xl font-light leading-tight mb-5"
              style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
            >
              Your Standard Ontario Lease Protects Your Tenant.{" "}
              <em style={{ color: "rgba(250,248,245,0.55)" }}>Not You.</em>
            </h1>
            <p className="text-base leading-relaxed max-w-2xl" style={{ color: "rgba(250,248,245,0.65)", fontFamily: "var(--font-dm-sans)" }}>
              Download the free 17-point lease addendum used across rental properties in London, Strathroy, and St. Thomas — tested against real Ontario tenant scenarios. Attach it to any standard lease in minutes.
            </p>
          </div>

          {/* Grid — form first on mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

            {/* Form card — order-1 on mobile so it appears before the mockup */}
            <div
              className="order-1 lg:order-2 rounded-2xl p-8"
              style={{ backgroundColor: "#FFFFFF", boxShadow: "0 12px 48px rgba(0,0,0,0.25)" }}
            >
              {/* Ebin attribution */}
              <div className="flex items-center gap-3 mb-5">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                  <Image src="/ebin-founder.jpg" alt="Ebin Jaison" fill className="object-cover object-top" />
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>Ebin Jaison</p>
                  <p className="text-xs" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>Prospera Properties · London, ON</p>
                </div>
              </div>
              <p className="text-sm mb-5 leading-relaxed" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
                I'll send it to your inbox within 5 minutes. Built it myself after seeing what gaps in the standard lease actually cost landlords.
              </p>
              {form}
            </div>

            {/* Supporting copy + mockup — order-2 on mobile */}
            <div className="order-2 lg:order-1">
              <div className="flex flex-col gap-3 mb-8">
                {[
                  "Closes the gaps experienced tenants exploit",
                  "Written specifically for Ontario's RTA",
                  "Attaches to any standard lease — no lawyer needed",
                ].map(t => (
                  <div key={t} className="flex items-center gap-3">
                    <span style={{ color: "#8B2030", fontSize: 16 }}>✓</span>
                    <span className="text-sm" style={{ color: "rgba(250,248,245,0.7)", fontFamily: "var(--font-dm-sans)" }}>{t}</span>
                  </div>
                ))}
              </div>

              {/* Document mockup — hidden on mobile, visible on desktop */}
              <div className="hidden lg:block relative w-full max-w-xs rounded-xl overflow-hidden" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
                <Image
                  src="/lease-addendum-mockup.png"
                  alt="17-Point Airtight Lease Addendum"
                  width={500}
                  height={500}
                  className="w-full h-auto"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <div style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E8E4DF" }}>
        <div className="max-w-5xl mx-auto px-6 py-5 flex flex-wrap justify-center gap-8 md:gap-16">
          {[
            { v: "London · Strathroy · St. Thomas", l: "Markets served" },
            { v: "5.0 ★", l: "Google rating" },
            { v: "21 days", l: "Average days to fill a vacancy" },
            { v: "Zero", l: "LTB filings — we screen before they sign" },
          ].map(t => (
            <div key={t.l} className="text-center">
              <p className="text-lg font-light" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>{t.v}</p>
              <p className="text-xs mt-0.5" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>{t.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Problem ── */}
      <section className="py-20 px-6" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>
            The Problem
          </p>
          <h2 className="text-4xl font-light mb-8 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
            Most landlords find out their lease has gaps when it's already too late.
          </h2>
          <div className="space-y-5 text-base leading-relaxed" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
            <p>
              The standard Ontario lease is the minimum. It was written to be fair to both sides — which means it leaves room for tenants to push back on pet damage, unauthorized occupants, early termination, and property condition disputes.
            </p>
            <p>
              Experienced tenants — and their paralegals — know exactly where those gaps are.
            </p>
            <p style={{ color: "#1F2F3A", fontWeight: 500 }}>
              By the time you find out, you're filing with the LTB, waiting months for a hearing, and absorbing costs that a better lease would have prevented on day one.
            </p>
          </div>
        </div>
      </section>

      {/* ── Solution ── */}
      <section className="py-20 px-6" style={{ backgroundColor: "#F7F5F2", borderTop: "1px solid #E8E4DF" }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>
            The Fix
          </p>
          <h2 className="text-4xl font-light mb-8 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
            The fix isn't a lawyer. It's a better lease.
          </h2>
          <div className="space-y-5 text-base leading-relaxed" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
            <p>
              We built a 17-point addendum — tested against real Ontario tenant scenarios — that attaches directly to your standard lease. It closes the gaps before a tenant ever signs.
            </p>
            <p>
              No legal jargon. No complicated process. Just 17 clauses that have already been tested in the situations you hope never happen to you.
            </p>
          </div>
        </div>
      </section>

      {/* ── Mechanism — What's Inside ── */}
      <section className="py-20 px-6" style={{ backgroundColor: "#FFFFFF", borderTop: "1px solid #E8E4DF" }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>
            What's Inside
          </p>
          <h2 className="text-4xl font-light mb-10 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
            What the addendum covers:
          </h2>

          {/* First 4 — visible */}
          <ul className="space-y-3 mb-2">
            {CLAUSES.slice(0, 4).map(c => (
              <li key={c.n} className="flex items-start gap-3">
                <span className="shrink-0 mt-1" style={{ color: "#8B2030" }}>—</span>
                <span className="text-base" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                  <strong style={{ color: "#1F2F3A" }}>{c.title}</strong> — {c.body}
                </span>
              </li>
            ))}
          </ul>

          {/* Remaining 13 — blurred with CTA overlay */}
          <div className="relative">
            <ul className="space-y-3 mb-2" style={{ filter: "blur(4px)", userSelect: "none", pointerEvents: "none" }}>
              {CLAUSES.slice(4).map(c => (
                <li key={c.n} className="flex items-start gap-3">
                  <span className="shrink-0 mt-1" style={{ color: "#8B2030" }}>—</span>
                  <span className="text-base" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                    <strong style={{ color: "#1F2F3A" }}>{c.title}</strong> — {c.body}
                  </span>
                </li>
              ))}
            </ul>

            {/* Gradient fade + CTA overlay */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ background: "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.85) 25%, #FFFFFF 50%)" }}
            >
              <div className="text-center px-4 mt-16">
                <p className="text-base font-semibold mb-1" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
                  + 13 more clauses inside
                </p>
                <p className="text-sm mb-4" style={{ color: "#555555", fontFamily: "var(--font-dm-sans)" }}>
                  Landlord associations charge up to $249 for addendums like this. Yours is free.
                </p>
                <a
                  href="#"
                  onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="inline-block px-8 py-3 text-sm font-semibold uppercase tracking-widest rounded-lg transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
                >
                  Get the Full Addendum Free →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Proof ── */}
      <section className="py-20 px-6" style={{ backgroundColor: "#1F2F3A" }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>
            Why Trust It
          </p>
          <h2 className="text-4xl font-light mb-12 leading-tight" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Built for Ontario. Tested in the real world.
          </h2>
          <div className="space-y-5">
            {PROOF.map(p => (
              <div key={p} className="flex items-start gap-4">
                <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5" style={{ backgroundColor: "#8B2030", color: "#FAF8F5" }}>✓</span>
                <p className="text-base leading-relaxed" style={{ color: "rgba(250,248,245,0.8)", fontFamily: "var(--font-dm-sans)" }}>{p}</p>
              </div>
            ))}
          </div>

          {/* Testimonial placeholder */}
          <div
            className="mt-12 p-6 rounded-xl border"
            style={{ borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.04)" }}
          >
            <p className="text-sm italic mb-3" style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)" }}>
              "I used Prospera's addendum before signing my last tenant. Six months in — zero disputes."
            </p>
            <p className="text-xs font-semibold" style={{ color: "rgba(250,248,245,0.35)", fontFamily: "var(--font-dm-sans)" }}>
              — London, ON landlord
            </p>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 px-6" style={{ backgroundColor: "#F7F5F2", borderTop: "1px solid #E8E4DF" }}>
        <div className="max-w-md mx-auto">
          <h2 className="text-4xl font-light text-center mb-4 leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
            Protect your property before the next lease is signed.
          </h2>
          <p className="text-sm text-center mb-8" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
            Enter your name and email below. We'll send the addendum directly to your inbox — free, no strings attached.
          </p>
          <div className="rounded-2xl p-8 border" style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E4DF", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            {form}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ backgroundColor: "#141F29", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-lg font-light mb-1" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
                Prospera Properties
              </p>
              <p className="text-xs" style={{ color: "rgba(250,248,245,0.4)", fontFamily: "var(--font-dm-sans)" }}>
                London · Strathroy · St. Thomas, Ontario
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-1">
              <a href="tel:+15196971227" className="text-sm" style={{ color: "rgba(250,248,245,0.6)", fontFamily: "var(--font-dm-sans)" }}>
                (519) 697-1227
              </a>
              <a href="mailto:hello@prosperaproperties.co" className="text-sm" style={{ color: "rgba(250,248,245,0.6)", fontFamily: "var(--font-dm-sans)" }}>
                hello@prosperaproperties.co
              </a>
              <Link href="/privacy" className="text-xs" style={{ color: "rgba(250,248,245,0.3)", fontFamily: "var(--font-dm-sans)" }}>
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
