"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

const cards = [
  {
    href: "/admin/properties",
    label: "Properties",
    description: "Add, edit, and manage your rental listings",
    icon: "🏠",
    cta: "Manage properties",
  },
  {
    href: "/admin/dashboard",
    label: "Outreach & CRM",
    description: "Log outreach, track your pipeline, and monitor ad spend",
    icon: "📋",
    cta: "Open dashboard",
  },
  {
    href: "/admin/intelligence",
    label: "Rent Intelligence",
    description: "Weekly market benchmarks, scraping results, and landlord enquiries",
    icon: "📊",
    cta: "View intelligence",
  },
];

export default function AdminHome() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F5F2" }}>
      <div className="text-white px-6 py-4 flex items-center justify-between" style={{ backgroundColor: "#1F2F3A" }}>
        <div className="flex items-center gap-4">
          <span className="font-[family-name:var(--font-cormorant)] text-2xl font-light">Prospera</span>
          <Link href="/" target="_blank" className="text-xs text-white/50 hover:text-white/80 transition-colors">
            ↗ View site
          </Link>
        </div>
        <button onClick={handleLogout} className="text-xs text-white/60 hover:text-white transition-colors">
          Sign out
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1
            className="font-[family-name:var(--font-cormorant)] text-5xl font-light mb-3"
            style={{ color: "#1F2F3A" }}
          >
            Good morning.
          </h1>
          <p className="text-sm" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
            What would you like to work on?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group bg-white border rounded-xl p-7 flex flex-col justify-between transition-shadow hover:shadow-md"
              style={{ borderColor: "#D8D2C8", minHeight: "220px" }}
            >
              <div>
                <div className="text-3xl mb-5">{card.icon}</div>
                <p
                  className="font-[family-name:var(--font-cormorant)] text-2xl font-light mb-2"
                  style={{ color: "#1F2F3A" }}
                >
                  {card.label}
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
                >
                  {card.description}
                </p>
              </div>
              <p
                className="text-xs mt-6 transition-colors group-hover:text-[#8B2030]"
                style={{ color: "#BBBBBB", fontFamily: "var(--font-dm-sans)" }}
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
