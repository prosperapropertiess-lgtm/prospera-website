"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export default function AdminDashboard() {
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
    const { data } = await supabase.from("properties").select("id, title, address, city, price, bedrooms, bathrooms, available, images").order("created_at", { ascending: false });
    setProperties(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/properties/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert("Failed to delete. Try again.");
    }
    setDeleting(null);
  }

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Top bar */}
      <div className="bg-[#0A1628] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-[family-name:var(--font-cormorant)] text-2xl font-light">Prospera Admin</span>
          <Link href="/" target="_blank" className="text-xs text-white/50 hover:text-white/80 transition-colors">
            ↗ View site
          </Link>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-white/60 hover:text-white transition-colors"
        >
          Sign out
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-[family-name:var(--font-cormorant)] text-3xl text-[#0A1628] font-light">Properties</h1>
            <p className="text-sm text-[#2D4A5E] mt-1">
              {loading ? "Loading..." : `${properties.length} total`}
            </p>
          </div>
          <Link
            href="/admin/properties/new"
            className="px-5 py-2.5 bg-[#0A1628] text-white text-xs uppercase tracking-widest rounded hover:bg-[#7B1C1C] transition-colors"
          >
            + Add Property
          </Link>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white rounded animate-pulse" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-xl border border-gray-100">
            <p className="font-[family-name:var(--font-cormorant)] text-2xl text-[#0A1628] mb-3">No properties yet</p>
            <p className="text-sm text-[#2D4A5E] mb-6">Add your first property to get started.</p>
            <Link href="/admin/properties/new" className="inline-block px-6 py-2.5 bg-[#0A1628] text-white text-xs uppercase tracking-widest rounded hover:bg-[#7B1C1C] transition-colors">
              Add Property
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {/* Desktop table */}
            <table className="w-full hidden md:table">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs uppercase tracking-widest text-gray-400 px-6 py-4 font-normal w-8"></th>
                  <th className="text-left text-xs uppercase tracking-widest text-gray-400 px-4 py-4 font-normal">Property</th>
                  <th className="text-left text-xs uppercase tracking-widest text-gray-400 px-4 py-4 font-normal">City</th>
                  <th className="text-left text-xs uppercase tracking-widest text-gray-400 px-4 py-4 font-normal">Price</th>
                  <th className="text-left text-xs uppercase tracking-widest text-gray-400 px-4 py-4 font-normal">Beds</th>
                  <th className="text-left text-xs uppercase tracking-widest text-gray-400 px-4 py-4 font-normal">Status</th>
                  <th className="px-4 py-4 w-32"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {properties.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors group">
                    <td className="px-6 py-4">
                      {p.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt="" className="w-10 h-10 object-cover rounded" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-300 text-lg">🏠</div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-[#0A1628]">{p.title}</p>
                      <p className="text-xs text-gray-400">{p.address}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#2D4A5E]">{p.city}</td>
                    <td className="px-4 py-4 text-sm text-[#0A1628]">${p.price.toLocaleString()}/mo</td>
                    <td className="px-4 py-4 text-sm text-[#2D4A5E]">{p.bedrooms} bed</td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.available ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {p.available ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3 justify-end">
                        <Link href={`/admin/properties/${p.id}`} className="text-xs text-[#2D4A5E] hover:text-[#0A1628] transition-colors">
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.title)}
                          disabled={deleting === p.id}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          {deleting === p.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-50">
              {properties.map((p) => (
                <div key={p.id} className="p-5 flex gap-4">
                  {p.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0]} alt="" className="w-16 h-16 object-cover rounded flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-300 flex-shrink-0">🏠</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0A1628] truncate">{p.title}</p>
                    <p className="text-xs text-gray-400">{p.city} · {p.bedrooms} bed · ${p.price.toLocaleString()}/mo</p>
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${p.available ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {p.available ? "Available" : "Unavailable"}
                    </span>
                    <div className="flex gap-4 mt-2">
                      <Link href={`/admin/properties/${p.id}`} className="text-xs text-[#2D4A5E] underline">Edit</Link>
                      <button onClick={() => handleDelete(p.id, p.title)} disabled={deleting === p.id} className="text-xs text-red-400 underline">
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
