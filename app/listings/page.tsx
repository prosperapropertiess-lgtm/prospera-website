"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import FadeIn from "@/components/animations/FadeIn";

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
        const params = new URLSearchParams();
        if (city !== "All Cities") params.set("city", city);
        if (petFriendly) params.set("petFriendly", "true");
        if (beds !== "Any") params.set("beds", beds);
        params.set("maxPrice", String(maxPrice));
        const res = await fetch(`/api/listings?${params}`);
        const data = await res.json();
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
              {filtered.map((p, i) => (
                <div key={p.id}>
                  <Link href={`/listings/${p.id}`} className="block">
                    <div className="bg-white rounded-2xl overflow-hidden group hover:shadow-lg transition-shadow duration-300 cursor-pointer" style={{ border: "1px solid #D8D2C8", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                      {/* Image with gradient overlay */}
                      <div className="relative h-72 overflow-hidden">
                        <Image
                          src={getImage(p, i)}
                          alt={p.title || `${p.bedrooms} bedroom rental in ${p.city}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                          unoptimized
                        />
                        {/* Bottom gradient for price readability */}
                        <div className="absolute inset-x-0 bottom-0 h-28" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }} />

                        {/* Price overlay on image */}
                        <div className="absolute bottom-4 left-4">
                          <p className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-dm-sans)", textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
                            ${p.price.toLocaleString()}<span className="text-sm font-normal opacity-80">/mo</span>
                          </p>
                        </div>

                        {/* Badges top-left */}
                        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                          {p.available_date && (
                            <span className="text-xs px-3 py-1 rounded-full font-medium " style={{ backgroundColor: "rgba(255,255,255,0.92)", color: "#1F2F3A" }}>
                              Available {new Date(p.available_date).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}
                            </span>
                          )}
                          {!p.available_date && (
                            <span className="text-xs px-3 py-1 rounded-full font-medium " style={{ backgroundColor: "rgba(255,255,255,0.92)", color: "#1F2F3A" }}>
                              Available Now
                            </span>
                          )}
                        </div>

                        {/* Badges top-right */}
                        <div className="absolute top-3 right-3 flex gap-1.5">
                          {p.pet_friendly && (
                            <span className="text-xs px-2.5 py-1 rounded-full font-medium " style={{ backgroundColor: "rgba(255,255,255,0.92)", color: "#1F2F3A" }}>
                              🐾 Pets OK
                            </span>
                          )}
                          {p.utilities_included && (
                            <span className="text-xs px-2.5 py-1 rounded-full font-medium " style={{ backgroundColor: "rgba(255,255,255,0.92)", color: "#1F2F3A" }}>
                              Utilities Incl.
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        {/* Address first — it's what people scan for */}
                        <p className="text-base font-semibold mb-0.5" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
                          📍 {p.address}, {p.city}, ON
                        </p>
                        <p className="text-xs mb-4" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
                          {p.property_type ? p.property_type.charAt(0).toUpperCase() + p.property_type.slice(1) : "Rental"} · Managed by Prospera Properties
                        </p>

                        {/* Specs row — clean dividers */}
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm mb-5" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                          <span>🛏 {p.bedrooms} Bed{p.bedrooms !== 1 ? "s" : ""}</span>
                          <span>🚿 {p.bathrooms} Bath{p.bathrooms !== 1 ? "s" : ""}</span>
                          {p.sqft && <span>📐 {p.sqft.toLocaleString()} sqft</span>}
                          {p.parking && <span>🚗 Parking</span>}
                          {p.pet_friendly && <span>🐾 Pet Friendly</span>}
                          {p.utilities_included && <span>⚡ Utilities Incl.</span>}
                        </div>

                        {/* CTA button — full width */}
                        <div
                          className="w-full py-3 text-center text-xs font-semibold uppercase tracking-widest rounded-lg transition-opacity group-hover:opacity-90"
                          style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
                        >
                          View Details & Pre-Qualify
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
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
