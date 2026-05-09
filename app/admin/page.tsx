"use client";
import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const cards = [
  {
    href: "/admin/properties",
    label: "Properties",
    description: "Add, edit, and manage your rental listings",
    cta: "Manage properties",
  },
  {
    href: "/admin/dashboard",
    label: "Outreach & CRM",
    description: "Log outreach, track your pipeline, and monitor ad spend",
    cta: "Open dashboard",
  },
  {
    href: "/admin/intelligence",
    label: "Rent Intelligence",
    description: "Weekly market benchmarks, scraping results, and landlord enquiries",
    cta: "View intelligence",
  },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning.";
  if (hour < 17) return "Good afternoon.";
  return "Good evening.";
}

export default function AdminHome() {
  const router = useRouter();
  const greeting = useMemo(() => getGreeting(), []);

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#111820" }}>
      {/* Top bar */}
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-4">
          <span className="font-[family-name:var(--font-cormorant)] text-2xl font-light text-white">Prospera</span>
          <Link href="/" target="_blank" className="text-xs transition-colors" style={{ color: "rgba(255,255,255,0.35)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
          >
            ↗ View site
          </Link>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs transition-colors"
          style={{ color: "rgba(255,255,255,0.35)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
        >
          Sign out
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* Greeting */}
        <div className="mb-14">
          <h1 className="font-[family-name:var(--font-cormorant)] text-6xl font-light mb-3 text-white">
            {greeting}
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-dm-sans)" }}>
            What would you like to work on?
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group flex flex-col justify-between rounded-xl p-7 transition-all"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.09)",
                minHeight: "200px",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.09)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.18)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.05)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.09)";
              }}
            >
              <div>
                <p className="font-[family-name:var(--font-cormorant)] text-2xl font-light mb-3 text-white">
                  {card.label}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-dm-sans)" }}>
                  {card.description}
                </p>
              </div>
              <p
                className="text-xs mt-8 transition-colors"
                style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-dm-sans)" }}
              >
                {card.cta} →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
