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
  property_type: string | null;
  available_date: string | null;
  status: string;
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
  const [error, setError] = useState(false);
  const [city, setCity] = useState("All Cities");
  const [beds, setBeds] = useState("Any");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [petFriendly, setPetFriendly] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(false);
      try {
        let query = supabase.from("properties").select("*").eq("status", "published").eq("is_managed", true).eq("available", true).order("created_at", { ascending: false });
        if (city !== "All Cities") query = query.eq("city", city);
        if (petFriendly) query = query.eq("pet_friendly", true);
        if (beds === "3+") query = query.gte("bedrooms", 3);
        else if (beds !== "Any") query = query.eq("bedrooms", parseInt(beds));
        query = query.lte("price", maxPrice);
        const { data } = await query;
        setProperties(data || []);
      } catch {
        setError(true);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [city, beds, maxPrice, petFriendly]);

  const filtered = properties;

  return (
    <div style={{ backgroundColor: "#F7F5F2" }}>
      {/* Hero */}
      <section className="pt-32 pb-14 px-6 text-center" style={{ backgroundColor: "#1F2F3A" }}>
        <FadeIn>
          <p className="text-xs uppercase tracking-[0.3em] mb-4" style={{ color: "rgba(250,248,245,0.75)", fontFamily: "var(--font-dm-sans)" }}>Available Now</p>
          <h1 className="text-5xl md:text-6xl font-light mb-4" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Find Your Next Home.
          </h1>
          <p className="text-sm max-w-md mx-auto" style={{ color: "rgba(250,248,245,0.8)", fontFamily: "var(--font-dm-sans)" }}>
            Quality rentals across London, St. Thomas, and Strathroy — professionally managed.
          </p>
        </FadeIn>
      </section>

      {/* Filter Bar */}
      <div className="sticky top-[64px] z-40 border-b shadow-sm" style={{ backgroundColor: "#FFFFFF", borderColor: "#D8D2C8" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap gap-4 items-center">
          {/* City */}
          <div className="flex gap-2 flex-wrap">
            {CITIES.map((c) => (
              <button
                key={c}
                onClick={() => setCity(c)}
                className="px-4 py-2 text-xs rounded-full border transition-colors"
                style={{
                  backgroundColor: city === c ? "#1F2F3A" : "transparent",
                  borderColor: city === c ? "#1F2F3A" : "#D8D2C8",
                  color: city === c ? "#FAF8F5" : "#333333",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="w-px h-6 hidden md:block" style={{ backgroundColor: "#D8D2C8" }} />

          {/* Bedrooms */}
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>Beds:</span>
            {BEDS.map((b) => (
              <button
                key={b}
                onClick={() => setBeds(b)}
                className="px-3 py-1.5 text-xs rounded border transition-colors"
                style={{
                  backgroundColor: beds === b ? "#8B2030" : "transparent",
                  borderColor: beds === b ? "#8B2030" : "#D8D2C8",
                  color: beds === b ? "#FAF8F5" : "#333333",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                {b}
              </button>
            ))}
          </div>

          <div className="w-px h-6 hidden md:block" style={{ backgroundColor: "#D8D2C8" }} />

          {/* Max Price */}
          <div className="flex items-center gap-3">
            <span className="text-xs whitespace-nowrap" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>Max: ${maxPrice.toLocaleString()}/mo</span>
            <input
              type="range"
              min={800}
              max={5000}
              step={50}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-28 accent-[#8B2030]"
            />
          </div>

          <div className="w-px h-6 hidden md:block" style={{ backgroundColor: "#D8D2C8" }} />

          {/* Pet Friendly */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={petFriendly}
              onChange={(e) => setPetFriendly(e.target.checked)}
              className="accent-[#8B2030]"
            />
            <span className="text-xs" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>Pet Friendly</span>
          </label>

          <div className="ml-auto text-xs" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
            {loading ? "Loading..." : `${filtered.length} ${filtered.length === 1 ? "property" : "properties"}`}
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <section className="py-16 px-6 min-h-[60vh]" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse" style={{ border: "1px solid #D8D2C8" }}>
                  <div className="h-56" style={{ backgroundColor: "#E8E3DC" }} />
                  <div className="p-6 space-y-3">
                    <div className="h-4 rounded w-3/4" style={{ backgroundColor: "#E8E3DC" }} />
                    <div className="h-3 rounded w-1/2" style={{ backgroundColor: "#E8E3DC" }} />
                    <div className="h-3 rounded w-1/3" style={{ backgroundColor: "#E8E3DC" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : error || filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-3xl font-light mb-3" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>No listings available right now.</p>
              <p className="text-sm mb-6" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>We&apos;re working on new properties — check back soon or send us your requirements.</p>
              <Link href="/contact" className="inline-block px-8 py-3 text-sm rounded hover:opacity-80 transition-opacity" style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>
                Contact Us
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((p, i) => (
                <FadeIn key={p.id} delay={i * 0.05}>
                  <div className="bg-white rounded-xl overflow-hidden group hover:shadow-md transition-shadow" style={{ border: "1px solid #D8D2C8", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
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
                        <span className="text-white text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: "#8B2030" }}>
                          Available
                        </span>
                        {p.utilities_included && (
                          <span className="text-white text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: "#8B2030" }}>
                            Utilities Incl.
                          </span>
                        )}
                      </div>
                      {p.pet_friendly && (
                        <div className="absolute top-3 right-3">
                          <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.92)", color: "#333333" }}>🐾 Pet OK</span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-xl font-medium leading-tight" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>{p.title}</h3>
                      </div>
                      <p className="text-xs mb-3" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>{p.address}, {p.city}</p>

                      {/* Specs */}
                      <div className="flex gap-4 text-xs mb-4" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                        <span>🛏 {p.bedrooms} bed{p.bedrooms !== 1 ? "s" : ""}</span>
                        <span>🚿 {p.bathrooms} bath{p.bathrooms !== 1 ? "s" : ""}</span>
                        {p.sqft && <span>📐 {p.sqft.toLocaleString()} sqft</span>}
                        {p.parking && <span>🚗 Parking</span>}
                      </div>

                      <p className="text-xs leading-relaxed mb-5 line-clamp-2" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>{p.description}</p>

                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-light" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
                          ${p.price.toLocaleString()}<span className="text-sm" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>/mo</span>
                        </p>
                        <Link
                          href={`/listings/${p.id}`}
                          className="px-4 py-2 text-xs rounded"
                          style={{ backgroundColor: "#1F2F3A", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
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
      <section className="py-16 px-6 text-center border-t" style={{ backgroundColor: "#1F2F3A", borderColor: "#D8D2C8" }}>
        <FadeIn>
          <p className="text-3xl font-light mb-3" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Don&apos;t see what you&apos;re looking for?
          </p>
          <p className="text-sm mb-6" style={{ color: "rgba(250,248,245,0.8)", fontFamily: "var(--font-dm-sans)" }}>
            New listings are added regularly. Send us your requirements and we&apos;ll let you know when something matches.
          </p>
          <Link href="/contact" className="inline-block px-8 py-3 text-sm rounded hover:opacity-80 transition-opacity" style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>
            Contact Us
          </Link>
        </FadeIn>
      </section>
    </div>
  );
}
