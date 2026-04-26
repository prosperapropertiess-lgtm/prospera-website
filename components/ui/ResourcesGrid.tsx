"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "@/components/animations/FadeIn";

interface Resource {
  id: string;
  title: string;
  description: string;
  category: "forms" | "guides" | "templates" | "checklists";
  icon: string;
}

const RESOURCES: Resource[] = [
  { id: "ontario-standard-lease", title: "Ontario Standard Lease Agreement", description: "The official Ontario standard lease form, ready to fill in for any residential tenancy.", category: "forms", icon: "📄" },
  { id: "lease-addendum", title: "Lease Addendum Template (Prospera Edition)", description: "Our custom addendum that adds critical protections beyond the standard Ontario lease — covering utilities, maintenance, and tenant obligations.", category: "templates", icon: "📝" },
  { id: "tenant-screening-checklist", title: "Tenant Screening Checklist", description: "Step-by-step checklist: credit check, income verification, reference calls, and what to look for at each stage.", category: "checklists", icon: "✅" },
  { id: "rent-increase-n1", title: "Rent Increase Notice Template (N1 Guide)", description: "Plain-English guide to Ontario's N1 form — how to fill it out correctly, serve it on time, and avoid common mistakes.", category: "templates", icon: "📈" },
  { id: "eviction-notices", title: "Eviction Notice Templates (N4, N5, N12)", description: "The three most commonly needed Ontario eviction forms, with plain-English explanations of when and how to use each one.", category: "forms", icon: "⚖️" },
  { id: "property-inspection-checklist", title: "Property Inspection Checklist", description: "Move-in and move-out inspection form with photo documentation guide. Protects both landlord and tenant.", category: "checklists", icon: "🔍" },
  { id: "landlord-tax-guide", title: "Ontario Landlord Tax Deduction Guide", description: "What you can and cannot write off as a rental property owner in Ontario — mortgage interest, repairs, management fees, and more.", category: "guides", icon: "💼" },
  { id: "maintenance-request-form", title: "Maintenance Request Form Template", description: "A simple form for tenants to submit maintenance requests in writing — creates a paper trail and keeps both sides accountable.", category: "forms", icon: "🔧" },
  { id: "rental-application", title: "Rental Application Template", description: "Comprehensive tenant application form covering employment, income, rental history, references, and consent to credit check.", category: "forms", icon: "📋" },
  { id: "landlord-rights-guide", title: "Ontario Landlord Rights Quick Reference", description: "One-page summary of your key rights under the Residential Tenancies Act — entry, rent increases, evictions, and more.", category: "guides", icon: "🏠" },
];

const CATEGORY_LABELS = { forms: "Forms", guides: "Guides", templates: "Templates", checklists: "Checklists" };

interface DownloadModalProps {
  resource: Resource;
  onClose: () => void;
}

function DownloadModal({ resource, onClose }: DownloadModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/resources/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, resourceId: resource.id, resourceTitle: resource.title }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[90] bg-black/40" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed z-[100] inset-x-4 top-1/2 -translate-y-1/2 md:inset-auto md:left-1/2 md:-translate-x-1/2 md:w-[480px] shadow-2xl"
        style={{ backgroundColor: "#FAF8F5" }}
      >
        <div className="h-1 w-full" style={{ backgroundColor: "#7B1C1C" }} />
        <div className="p-8">
          <button onClick={onClose} className="absolute top-4 right-5 text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
          {status === "success" ? (
            <div className="text-center py-6">
              <p className="text-4xl mb-2">📬</p>
              <h3 className="text-2xl font-light mb-3" style={{ color: "#0A1628", fontFamily: "var(--font-cormorant)" }}>Check your inbox.</h3>
              <p className="text-sm mb-6" style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}>
                We've sent <strong>{resource.title}</strong> to {email}.
              </p>
              <button onClick={onClose} className="text-xs uppercase tracking-widest underline" style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}>Close</button>
            </div>
          ) : (
            <>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}>Free Download</p>
              <h3 className="text-2xl font-light mb-2 leading-snug" style={{ color: "#0A1628", fontFamily: "var(--font-cormorant)" }}>{resource.title}</h3>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}>
                Enter your email and we'll send it instantly. No spam — just the occasional landlord tip.
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your first name" className="px-4 py-3 text-sm outline-none border" style={{ borderColor: "#E8E4DF", backgroundColor: "white", color: "#0A1628", fontFamily: "var(--font-dm-sans)" }} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" required className="px-4 py-3 text-sm outline-none border" style={{ borderColor: "#E8E4DF", backgroundColor: "white", color: "#0A1628", fontFamily: "var(--font-dm-sans)" }} />
                {status === "error" && <p className="text-xs" style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}>Something went wrong. Please try again.</p>}
                <button type="submit" disabled={status === "loading"} className="py-3 text-xs uppercase tracking-widest mt-1 transition-opacity hover:opacity-80 disabled:opacity-50" style={{ backgroundColor: "#0A1628", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>
                  {status === "loading" ? "Sending..." : "Send Me the Download"}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}

export default function ResourcesGrid() {
  const [activeResource, setActiveResource] = useState<Resource | null>(null);

  return (
    <>
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {RESOURCES.map((resource, i) => (
            <FadeIn key={resource.id} delay={i * 0.05}>
              <div className="bg-white border flex flex-col h-full" style={{ borderColor: "#E8E4DF" }}>
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <span className="text-3xl">{resource.icon}</span>
                    <span className="text-xs uppercase tracking-wider px-2 py-1 shrink-0" style={{ backgroundColor: "#F5F0EB", color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}>
                      {CATEGORY_LABELS[resource.category]}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium mb-2 leading-snug" style={{ color: "#0A1628", fontFamily: "var(--font-cormorant)" }}>{resource.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}>{resource.description}</p>
                </div>
                <div className="px-6 pb-6">
                  <button
                    onClick={() => setActiveResource(resource)}
                    className="w-full py-3 text-xs uppercase tracking-widest border transition-colors hover:bg-[#0A1628] hover:text-[#FAF8F5]"
                    style={{ borderColor: "#0A1628", color: "#0A1628", fontFamily: "var(--font-dm-sans)" }}
                  >
                    Download Free
                  </button>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <AnimatePresence>
        {activeResource && <DownloadModal resource={activeResource} onClose={() => setActiveResource(null)} />}
      </AnimatePresence>
    </>
  );
}
