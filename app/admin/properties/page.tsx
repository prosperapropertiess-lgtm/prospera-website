"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const BG = "#F7F5F2";
const NAV = "#1F2F3A";  // keep navy top bar
const SURFACE = "#FFFFFF";
const SURFACE_HI = "#F7F5F2";
const BORDER = "#D8D2C8";
const BORDER_HI = "#C5BFB5";
const TEXT = "#222222";
const TEXT_SEC = "#333333";
const TEXT_MUT = "#666666";
const ACCENT = "#8B2030";

interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  available: boolean;
  images: string[] | null;
  status: string;
  wizard_step: number | null;
}

type FilterTab = "all" | "published" | "draft";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("all");
  const router = useRouter();

  async function load() {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from("properties")
      .select("id, title, address, city, price, bedrooms, bathrooms, available, images, status, wizard_step")
      .order("created_at", { ascending: false });
    setProperties(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/properties/${id}`, { method: "DELETE" });
    if (res.ok) setProperties((prev) => prev.filter((p) => p.id !== id));
    else alert("Failed to delete. Try again.");
    setDeleting(null);
  }

  async function handleTogglePublish(p: Property) {
    const isPublished = p.status === "published";
    const endpoint = `/api/admin/properties/${p.id}/publish`;
    const method = isPublished ? "DELETE" : "POST";
    const res = await fetch(endpoint, { method });
    if (res.ok) {
      const updated = await res.json();
      setProperties((prev) => prev.map((prop) => prop.id === p.id ? { ...prop, status: updated.status } : prop));
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  const filtered = filter === "all" ? properties : properties.filter((p) => p.status === filter);
  const draftCount = properties.filter((p) => p.status === "draft").length;
  const publishedCount = properties.filter((p) => p.status === "published").length;

  function statusBadge(p: Property) {
    if (p.status === "draft") {
      const step = p.wizard_step || 1;
      return (
        <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: "rgba(251,191,36,0.08)", color: "#92400e" }}>
          Draft · Step {step}/8
        </span>
      );
    }
    if (p.status === "published") {
      return (
        <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: "rgba(34,197,94,0.08)", color: "#15803d" }}>
          Published
        </span>
      );
    }
    return (
      <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: "rgba(0,0,0,0.04)", color: TEXT_MUT }}>
        Archived
      </span>
    );
  }

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "All", count: properties.length },
    { key: "published", label: "Published", count: publishedCount },
    { key: "draft", label: "Drafts", count: draftCount },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>
      <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: NAV, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-5">
          <span className="font-[family-name:var(--font-cormorant)] text-2xl font-light" style={{ color: "#FAF8F5" }}>Prospera</span>
          <Link href="/admin" className="text-xs transition-colors" style={{ color: "rgba(250,248,245,0.55)" }}>← Home</Link>
          <Link href="/" target="_blank" className="text-xs transition-colors" style={{ color: "rgba(250,248,245,0.55)" }}>↗ View site</Link>
        </div>
        <button onClick={handleLogout} className="text-xs" style={{ color: "rgba(250,248,245,0.55)" }}>Sign out</button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-light" style={{ color: TEXT }}>Properties</h1>
            <p className="text-sm mt-1" style={{ color: TEXT_SEC, fontFamily: "var(--font-dm-sans)" }}>
              {loading ? "Loading..." : `${properties.length} listing${properties.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <Link
            href="/admin/properties/new"
            className="px-5 py-2.5 text-white text-xs uppercase tracking-widest rounded transition-opacity hover:opacity-80"
            style={{ backgroundColor: ACCENT }}
          >
            + Add Property
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-lg w-fit" style={{ backgroundColor: SURFACE }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className="px-4 py-2 text-xs rounded-md transition-all"
              style={{
                backgroundColor: filter === tab.key ? SURFACE_HI : "transparent",
                color: filter === tab.key ? TEXT : TEXT_MUT,
                borderColor: filter === tab.key ? BORDER_HI : "transparent",
                border: filter === tab.key ? `1px solid ${BORDER_HI}` : "1px solid transparent",
              }}
            >
              {tab.label} <span style={{ color: TEXT_MUT }}>({tab.count})</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: SURFACE }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border p-20 text-center" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
            <p className="font-[family-name:var(--font-cormorant)] text-3xl mb-3" style={{ color: TEXT }}>
              {filter === "draft" ? "No drafts" : filter === "published" ? "No published properties" : "No properties yet"}
            </p>
            <p className="text-sm mb-6" style={{ color: TEXT_SEC }}>
              {filter === "all" ? "Add your first property to get started." : "Change filter to see other properties."}
            </p>
            {filter === "all" && (
              <Link href="/admin/properties/new" className="inline-block px-6 py-2.5 text-white text-xs uppercase tracking-widest rounded transition-opacity hover:opacity-80" style={{ backgroundColor: ACCENT }}>
                Add Property
              </Link>
            )}
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
            <table className="w-full hidden md:table">
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}`, backgroundColor: SURFACE_HI }}>
                  <th className="text-left text-xs uppercase tracking-widest px-6 py-4 font-normal w-14" style={{ color: TEXT_MUT }}></th>
                  <th className="text-left text-xs uppercase tracking-widest px-4 py-4 font-normal" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>Property</th>
                  <th className="text-left text-xs uppercase tracking-widest px-4 py-4 font-normal" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>City</th>
                  <th className="text-left text-xs uppercase tracking-widest px-4 py-4 font-normal" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>Price</th>
                  <th className="text-left text-xs uppercase tracking-widest px-4 py-4 font-normal" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>Beds</th>
                  <th className="text-left text-xs uppercase tracking-widest px-4 py-4 font-normal" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>Status</th>
                  <th className="px-4 py-4 w-40"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id} style={{ borderTop: i > 0 ? `1px solid ${BORDER}` : undefined }}>
                    <td className="px-6 py-4">
                      {p.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt={p.title} className="w-10 h-10 object-cover rounded-lg" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-base" style={{ backgroundColor: SURFACE_HI }}>🏠</div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium" style={{ color: TEXT }}>{p.title || "Untitled Property"}</p>
                      <p className="text-xs mt-0.5" style={{ color: TEXT_MUT }}>{p.address}</p>
                    </td>
                    <td className="px-4 py-4 text-sm" style={{ color: TEXT_SEC }}>{p.city}</td>
                    <td className="px-4 py-4 text-sm font-medium" style={{ color: TEXT }}>{p.price ? `$${p.price.toLocaleString()}/mo` : "—"}</td>
                    <td className="px-4 py-4 text-sm" style={{ color: TEXT_SEC }}>{p.bedrooms ? `${p.bedrooms} bed` : "—"}</td>
                    <td className="px-4 py-4">{statusBadge(p)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3 justify-end">
                        <button
                          onClick={() => handleTogglePublish(p)}
                          className="text-xs transition-colors"
                          style={{ color: p.status === "published" ? "#d97706" : "#15803d" }}
                        >
                          {p.status === "published" ? "Unpublish" : "Publish"}
                        </button>
                        <Link href={`/admin/properties/${p.id}`} className="text-xs transition-colors" style={{ color: TEXT_MUT }}>Edit</Link>
                        <button
                          onClick={() => handleDelete(p.id, p.title)}
                          disabled={deleting === p.id}
                          className="text-xs transition-colors disabled:opacity-40"
                          style={{ color: "#dc2626" }}
                        >
                          {deleting === p.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="md:hidden divide-y" style={{ borderColor: BORDER }}>
              {filtered.map((p) => (
                <div key={p.id} className="p-5 flex gap-4">
                  {p.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0]} alt={p.title} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: SURFACE_HI }}>🏠</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: TEXT }}>{p.title || "Untitled Property"}</p>
                    <p className="text-xs mt-0.5" style={{ color: TEXT_SEC }}>{p.city} · {p.bedrooms ? `${p.bedrooms} bed · ` : ""}{p.price ? `$${p.price.toLocaleString()}/mo` : ""}</p>
                    <div className="mt-2">{statusBadge(p)}</div>
                    <div className="flex gap-4 mt-2">
                      <button onClick={() => handleTogglePublish(p)} className="text-xs underline" style={{ color: p.status === "published" ? "#d97706" : "#15803d" }}>
                        {p.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                      <Link href={`/admin/properties/${p.id}`} className="text-xs underline" style={{ color: TEXT_MUT }}>Edit</Link>
                      <button onClick={() => handleDelete(p.id, p.title)} disabled={deleting === p.id} className="text-xs underline" style={{ color: "#dc2626" }}>
                        {deleting === p.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
