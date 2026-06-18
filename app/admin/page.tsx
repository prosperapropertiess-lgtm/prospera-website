"use client";
import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const BG = "#0B1219";
const NAV = "#070D13";
const SURFACE = "#111C27";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#EDE9E3";
const TEXT_SEC = "rgba(237,233,227,0.5)";
const ACCENT = "#C4374A";

const cards = [
  {
    href: "/admin/leads",
    label: "Leads",
    description: "Every contact form submission and subscriber — with email, source, and one-click reply",
    cta: "View leads",
  },
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
  {
    href: "/admin/applications",
    label: "Applications",
    description: "Review tenant applications, AI scores, and approve or reject",
    cta: "Review applications",
  },
  {
    href: "/admin/agents",
    label: "Agents",
    description: "Add leasing agents, manage access, and track their activity",
    cta: "Manage agents",
  },
  {
    href: "/admin/seo",
    label: "SEO",
    description: "Track search impressions, rankings, and top queries from Google Search Console",
    cta: "View SEO stats",
  },
  {
    href: "/admin/messages",
    label: "Owner Messages",
    description: "Post updates to landlord portals — tenant notes, maintenance updates, and general communications",
    cta: "Post update",
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
    <div className="min-h-screen" style={{ backgroundColor: BG }}>
      <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: NAV, borderBottom: `1px solid ${BORDER}` }}>
        <div className="flex items-center gap-5">
          <span className="font-[family-name:var(--font-cormorant)] text-2xl font-light" style={{ color: TEXT }}>Prospera</span>
          <Link href="/" target="_blank" className="text-xs transition-colors" style={{ color: TEXT_SEC }}>↗ View site</Link>
        </div>
        <button onClick={handleLogout} className="text-xs transition-colors" style={{ color: TEXT_SEC }}>Sign out</button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="mb-14">
          <h1 className="font-[family-name:var(--font-cormorant)] text-6xl font-light mb-3" style={{ color: TEXT }}>
            {greeting}
          </h1>
          <p className="text-sm" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>
            What would you like to work on?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group flex flex-col justify-between rounded-xl p-7 transition-all"
              style={{ backgroundColor: SURFACE, border: `1px solid ${BORDER}`, minHeight: "210px" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "#172234";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.backgroundColor = SURFACE;
                (e.currentTarget as HTMLElement).style.borderColor = BORDER;
              }}
            >
              <div>
                <p className="font-[family-name:var(--font-cormorant)] text-2xl font-light mb-3" style={{ color: TEXT }}>
                  {card.label}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>
                  {card.description}
                </p>
              </div>
              <p className="text-xs mt-8 transition-colors" style={{ color: "rgba(237,233,227,0.22)", fontFamily: "var(--font-dm-sans)" }}>
                {card.cta} →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
