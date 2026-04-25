"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import FadeIn from "@/components/animations/FadeIn";
import { supabase } from "@/lib/supabase";

interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number | null;
  description: string;
  pet_friendly: boolean;
  parking: boolean;
  available: boolean;
  utilities_included: boolean;
  utilities_list: string[] | null;
  images: string[] | null;
}

const CITIES = ["All Cities", "London", "St. Thomas", "Strathroy"];
const BEDS = ["Any", "1", "2", "3+"];

const placeholderImages = [
  "https://picsum.photos/seed/prop1/800/500",
  "https://picsum.photos/seed/prop2/800/500",
  "https://picsum.photos/seed/prop3/800/500",
  "https://picsum.photos/seed/prop4/800/500",
  "https://picsum.photos/seed/prop5/800/500",
];

function getImage(p: Property, i: number) {
  return p.images?.[0] || placeholderImages[i % placeholderImages.length];
}

export default function ListingsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("All Cities");
  const [beds, setBeds] = useState("Any");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [petFriendly, setPetFriendly] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let query = supabase.from("properties").select("*").eq("available", true).order("created_at", { ascending: false });
      if (city !== "All Cities") query = query.eq("city", city);
      if (petFriendly) query = query.eq("pet_friendly", true);
      if (beds === "3+") query = query.gte("bedrooms", 3);
      else if (beds !== "Any") query = query.eq("bedrooms", parseInt(beds));
      query = query.lte("price", maxPrice);
      const { data } = await query;
      setProperties(data || []);
      setLoading(false);
    }
    load();
  }, [city, beds, maxPrice, petFriendly]);

  const filtered = properties;

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-14 px-6 bg-[#0A1628] text-white text-center">
        <FadeIn>
          <p className="text-xs uppercase tracking-[0.3em] text-[#C5A55A] mb-4">Available Now</p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-5xl md:text-6xl font-light mb-4">
            Find Your Next Home.
          </h1>
          <p className="text-white/70 text-sm max-w-md mx-auto">
            Quality rentals across London, St. Thomas, and Strathroy — professionally managed.
          </p>
        </FadeIn>
      </section>

      {/* Filter Bar */}
      <div className="sticky top-20 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap gap-4 items-center">
          {/* City */}
          <div className="flex gap-2 flex-wrap">
            {CITIES.map((c) => (
              <button
                key={c}
                onClick={() => setCity(c)}
                className={`px-4 py-2 text-xs rounded-full border transition-colors ${city === c ? "bg-[#0A1628] text-white border-[#0A1628]" : "border-gray-200 text-[#2D4A5E] hover:border-[#0A1628]"}`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-gray-200 hidden md:block" />

          {/* Bedrooms */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Beds:</span>
            {BEDS.map((b) => (
              <button
                key={b}
                onClick={() => setBeds(b)}
                className={`px-3 py-1.5 text-xs rounded border transition-colors ${beds === b ? "bg-[#7B1C1C] text-white border-[#7B1C1C]" : "border-gray-200 text-[#2D4A5E] hover:border-[#7B1C1C]"}`}
              >
                {b}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-gray-200 hidden md:block" />

          {/* Max Price */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 whitespace-nowrap">Max: ${maxPrice.toLocaleString()}/mo</span>
            <input
              type="range"
              min={800}
              max={5000}
              step={50}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-28 accent-[#7B1C1C]"
            />
          </div>

          <div className="w-px h-6 bg-gray-200 hidden md:block" />

          {/* Pet Friendly */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={petFriendly}
              onChange={(e) => setPetFriendly(e.target.checked)}
              className="accent-[#7B1C1C]"
            />
            <span className="text-xs text-[#2D4A5E]">Pet Friendly</span>
          </label>

          <div className="ml-auto text-xs text-gray-400">
            {loading ? "Loading..." : `${filtered.length} ${filtered.length === 1 ? "property" : "properties"}`}
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <section className="py-16 px-6 bg-[#FAF8F5] min-h-[60vh]">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                  <div className="h-56 bg-gray-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-[family-name:var(--font-cormorant)] text-3xl text-[#0A1628] mb-3">No properties match your filters.</p>
              <p className="text-sm text-[#2D4A5E] mb-6">Try adjusting your search or check back soon — new listings are added regularly.</p>
              <button onClick={() => { setCity("All Cities"); setBeds("Any"); setMaxPrice(5000); setPetFriendly(false); }}
                className="text-sm text-[#7B1C1C] underline">Clear all filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((p, i) => (
                <FadeIn key={p.id} delay={i * 0.05}>
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
                    {/* Image */}
                    <div className="relative h-56 overflow-hidden">
                      <Image
                        src={getImage(p, i)}
                        alt={p.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                      <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                        <span className="bg-[#7B1C1C] text-white text-xs px-2.5 py-1 rounded-full font-medium">
                          Available
                        </span>
                        {p.utilities_included && (
                          <span className="bg-[#C5A55A] text-white text-xs px-2.5 py-1 rounded-full font-medium">
                            Utilities Incl.
                          </span>
                        )}
                      </div>
                      {p.pet_friendly && (
                        <div className="absolute top-3 right-3">
                          <span className="bg-white/90 text-[#2D4A5E] text-xs px-2 py-1 rounded-full">🐾 Pet OK</span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-[family-name:var(--font-cormorant)] text-xl font-medium text-[#0A1628] leading-tight">{p.title}</h3>
                      </div>
                      <p className="text-xs text-[#2D4A5E] mb-3">{p.address}, {p.city}</p>

                      {/* Specs */}
                      <div className="flex gap-4 text-xs text-gray-500 mb-4">
                        <span>🛏 {p.bedrooms} bed{p.bedrooms !== 1 ? "s" : ""}</span>
                        <span>🚿 {p.bathrooms} bath{p.bathrooms !== 1 ? "s" : ""}</span>
                        {p.sqft && <span>📐 {p.sqft.toLocaleString()} sqft</span>}
                        {p.parking && <span>🚗 Parking</span>}
                      </div>

                      <p className="text-xs text-[#2D4A5E] leading-relaxed mb-5 line-clamp-2">{p.description}</p>

                      <div className="flex items-center justify-between">
                        <p className="font-[family-name:var(--font-cormorant)] text-2xl text-[#0A1628]">
                          ${p.price.toLocaleString()}<span className="text-sm text-gray-400 font-sans">/mo</span>
                        </p>
                        <Link
                          href={`/listings/${p.id}`}
                          className="px-4 py-2 bg-[#0A1628] text-white text-xs rounded hover:bg-[#7B1C1C] transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-6 bg-white text-center border-t border-gray-100">
        <FadeIn>
          <p className="font-[family-name:var(--font-cormorant)] text-3xl text-[#0A1628] mb-3">
            Don&apos;t see what you&apos;re looking for?
          </p>
          <p className="text-sm text-[#2D4A5E] mb-6">
            New listings are added regularly. Send us your requirements and we&apos;ll let you know when something matches.
          </p>
          <Link href="/contact" className="inline-block px-8 py-3 bg-[#7B1C1C] text-white text-sm font-medium rounded hover:bg-[#9B2E2E] transition-colors">
            Contact Us
          </Link>
        </FadeIn>
      </section>
    </>
  );
}
