"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const BG = "#0B1219";
const NAV = "#070D13";
const SURFACE = "#111C27";
const SURFACE_HI = "#172234";
const BORDER = "rgba(255,255,255,0.08)";
const BORDER_HI = "rgba(255,255,255,0.14)";
const TEXT = "#EDE9E3";
const TEXT_SEC = "rgba(237,233,227,0.5)";
const TEXT_MUT = "rgba(237,233,227,0.28)";
const ACCENT = "#C4374A";

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
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  async function load() {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from("properties")
      .select("id, title, address, city, price, bedrooms, bathrooms, available, images")
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
          <Link href="/admin" className="text-xs transition-colors" style={{ color: TEXT_SEC }}>← Home</Link>
          <Link href="/" target="_blank" className="text-xs transition-colors" style={{ color: TEXT_SEC }}>↗ View site</Link>
        </div>
        <button onClick={handleLogout} className="text-xs" style={{ color: TEXT_SEC }}>Sign out</button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
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

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: SURFACE }} />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="rounded-xl border p-20 text-center" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
            <p className="font-[family-name:var(--font-cormorant)] text-3xl mb-3" style={{ color: TEXT }}>No properties yet</p>
            <p className="text-sm mb-6" style={{ color: TEXT_SEC }}>Add your first property to get started.</p>
            <Link href="/admin/properties/new" className="inline-block px-6 py-2.5 text-white text-xs uppercase tracking-widest rounded transition-opacity hover:opacity-80" style={{ backgroundColor: ACCENT }}>
              Add Property
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: SURFACE, borderColor: BORDER }}>
            <table className="w-full hidden md:table">
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}`, backgroundColor: NAV }}>
                  <th className="text-left text-xs uppercase tracking-widest px-6 py-4 font-normal w-14" style={{ color: TEXT_MUT }}></th>
                  <th className="text-left text-xs uppercase tracking-widest px-4 py-4 font-normal" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>Property</th>
                  <th className="text-left text-xs uppercase tracking-widest px-4 py-4 font-normal" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>City</th>
                  <th className="text-left text-xs uppercase tracking-widest px-4 py-4 font-normal" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>Price</th>
                  <th className="text-left text-xs uppercase tracking-widest px-4 py-4 font-normal" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>Beds</th>
                  <th className="text-left text-xs uppercase tracking-widest px-4 py-4 font-normal" style={{ color: TEXT_MUT, fontFamily: "var(--font-dm-sans)" }}>Status</th>
                  <th className="px-4 py-4 w-28"></th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p, i) => (
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
                      <p className="text-sm font-medium" style={{ color: TEXT }}>{p.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: TEXT_MUT }}>{p.address}</p>
                    </td>
                    <td className="px-4 py-4 text-sm" style={{ color: TEXT_SEC }}>{p.city}</td>
                    <td className="px-4 py-4 text-sm font-medium" style={{ color: TEXT }}>${p.price.toLocaleString()}/mo</td>
                    <td className="px-4 py-4 text-sm" style={{ color: TEXT_SEC }}>{p.bedrooms} bed</td>
                    <td className="px-4 py-4">
                      <span
                        className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{
                          backgroundColor: p.available ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.06)",
                          color: p.available ? "#4ade80" : TEXT_MUT,
                        }}
                      >
                        {p.available ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3 justify-end">
                        <Link href={`/admin/properties/${p.id}/applicants`} className="text-xs transition-colors" style={{ color: TEXT_MUT }}>Applicants</Link>
                        <Link href={`/admin/properties/${p.id}`} className="text-xs transition-colors" style={{ color: TEXT_MUT }}>Edit</Link>
                        <button
                          onClick={() => handleDelete(p.id, p.title)}
                          disabled={deleting === p.id}
                          className="text-xs transition-colors disabled:opacity-40"
                          style={{ color: "#f87171" }}
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
              {properties.map((p) => (
                <div key={p.id} className="p-5 flex gap-4">
                  {p.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0]} alt={p.title} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: SURFACE_HI }}>🏠</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: TEXT }}>{p.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: TEXT_SEC }}>{p.city} · {p.bedrooms} bed · ${p.price.toLocaleString()}/mo</p>
                    <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: p.available ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.06)", color: p.available ? "#4ade80" : TEXT_MUT }}>
                      {p.available ? "Available" : "Unavailable"}
                    </span>
                    <div className="flex gap-4 mt-2">
                      <Link href={`/admin/properties/${p.id}`} className="text-xs underline" style={{ color: TEXT_MUT }}>Edit</Link>
                      <button onClick={() => handleDelete(p.id, p.title)} disabled={deleting === p.id} className="text-xs underline" style={{ color: "#f87171" }}>
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
