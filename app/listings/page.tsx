"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import FadeIn from "@/components/animations/FadeIn";

interface Property {
  id: string;
  slug?: string | null;
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
  _rented?: boolean;
}

const CITIES = ["All Cities", "London", "St. Thomas", "Strathroy"];
const BEDS   = ["Any", "1", "2", "3+"];

function propertyHref(p: Property) {
  return `/listings/${p.slug || p.id}`;
}

function getImage(p: Property) {
  return p.images?.[0] ?? null;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function ListingsPage() {
  const [available, setAvailable] = useState<Property[]>([]);
  const [rented,    setRented]    = useState<Property[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(false);
  const [city,      setCity]      = useState("All Cities");
  const [beds,      setBeds]      = useState("Any");
  const [maxPrice,  setMaxPrice]  = useState(5000);
  const [petFriendly, setPetFriendly] = useState(false);
  const debouncedPrice = useDebounce(maxPrice, 400);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError(false);

    const params = new URLSearchParams();
    if (city !== "All Cities") params.set("city", city);
    if (petFriendly) params.set("petFriendly", "true");
    if (beds !== "Any") params.set("beds", beds);
    params.set("maxPrice", String(debouncedPrice));

    fetch(`/api/listings?${params}`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(data => {
        setAvailable(data.available || []);
        setRented(data.rented || []);
        setLoading(false);
      })
      .catch(err => {
        if (err.name === "AbortError") return;
        setError(true);
        setLoading(false);
      });

    return () => ctrl.abort();
  }, [city, beds, debouncedPrice, petFriendly]);

  return (
    <div style={{ backgroundColor: "#F7F5F2" }}>

      {/* Hero */}
      <section className="pt-32 pb-14 px-6 text-center" style={{ backgroundColor: "#1F2F3A" }}>
        <FadeIn>
          <p className="text-xs uppercase tracking-[0.3em] mb-4" style={{ color: "rgba(250,248,245,0.6)", fontFamily: "var(--font-dm-sans)" }}>
            London · St. Thomas · Strathroy
          </p>
          <h1 className="text-5xl md:text-6xl font-light mb-4" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Our Properties Don&apos;t Sit.
          </h1>
          <p className="text-sm max-w-md mx-auto" style={{ color: "rgba(250,248,245,0.7)", fontFamily: "var(--font-dm-sans)" }}>
            We manage a small number of units intentionally. When one becomes available, it moves fast. See for yourself.
          </p>
        </FadeIn>
      </section>

      {/* Filter Bar */}
      <div className="sticky top-20 z-30 border-b shadow-sm" style={{ backgroundColor: "#FFFFFF", borderColor: "#D8D2C8" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">

          {/* Row 1: City pills — horizontal scroll on mobile, no wrap */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide" style={{ borderBottom: "1px solid #F0EDE8" }}>
            {CITIES.map((c) => (
              <button
                key={c}
                onClick={() => setCity(c)}
                className="flex-shrink-0 px-4 py-1.5 text-xs rounded-full border transition-colors"
                style={{
                  backgroundColor: city === c ? "#1F2F3A" : "transparent",
                  borderColor:     city === c ? "#1F2F3A" : "#D8D2C8",
                  color:           city === c ? "#FAF8F5" : "#333333",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Row 2: Beds + Pet + Count on one line; Price below on mobile */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">

            {/* Bedrooms */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>Beds:</span>
              {BEDS.map((b) => (
                <button
                  key={b}
                  onClick={() => setBeds(b)}
                  className="px-2.5 py-1 text-xs rounded border transition-colors"
                  style={{
                    backgroundColor: beds === b ? "#8B2030" : "transparent",
                    borderColor:     beds === b ? "#8B2030" : "#D8D2C8",
                    color:           beds === b ? "#FAF8F5" : "#333333",
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  {b}
                </button>
              ))}
            </div>

            <div className="w-px h-4 hidden sm:block" style={{ backgroundColor: "#D8D2C8" }} />

            {/* Price slider */}
            <div className="flex items-center gap-2">
              <span className="text-xs whitespace-nowrap" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                Max: ${maxPrice.toLocaleString()}
              </span>
              <input
                type="range"
                min={800}
                max={5000}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-24 accent-[#8B2030]"
              />
            </div>

            <div className="w-px h-4 hidden sm:block" style={{ backgroundColor: "#D8D2C8" }} />

            {/* Pet friendly */}
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={petFriendly}
                onChange={(e) => setPetFriendly(e.target.checked)}
                className="accent-[#8B2030]"
              />
              <span className="text-xs" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>Pets OK</span>
            </label>

            <span className="ml-auto text-xs" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
              {loading ? "…" : `${available.length} available`}
            </span>
          </div>

        </div>
      </div>

      {/* Listings grid */}
      <section className="py-16 px-6 min-h-[60vh]" style={{ backgroundColor: "#F7F5F2" }}>
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse" style={{ border: "1px solid #D8D2C8" }}>
                  <div className="h-64" style={{ backgroundColor: "#E8E3DC" }} />
                  <div className="p-6 space-y-3">
                    <div className="h-4 rounded w-3/4" style={{ backgroundColor: "#E8E3DC" }} />
                    <div className="h-3 rounded w-1/2" style={{ backgroundColor: "#E8E3DC" }} />
                    <div className="h-9 rounded mt-4" style={{ backgroundColor: "#E8E3DC" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : error || available.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
                Fully Rented
              </p>
              <p className="text-4xl font-light mb-4" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
                Every unit is currently occupied.
              </p>
              <p className="text-sm max-w-sm mx-auto mb-8" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
                That&apos;s the point: our properties don&apos;t sit. Tell us what you&apos;re looking for and you&apos;ll hear from us first when something opens up.
              </p>
              <Link
                href="/tenants#find-your-place"
                className="inline-block px-8 py-3 text-xs font-semibold uppercase tracking-widest rounded hover:opacity-80 transition-opacity"
                style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
              >
                Get Notified
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {available.map((p) => (
                <FadeIn key={p.id}>
                  <Link href={propertyHref(p)} className="block group">
                    <article
                      className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
                      style={{ border: "1px solid #D8D2C8", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
                    >
                      {/* Image */}
                      <div className="relative h-64 overflow-hidden bg-[#E8E3DC]">
                        {getImage(p) ? (
                          <Image
                            src={getImage(p)!}
                            alt={`${p.bedrooms}-bedroom ${p.property_type ?? "rental"} in ${p.city}, Ontario`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <p className="text-xs uppercase tracking-widest" style={{ color: "#B0A898", fontFamily: "var(--font-dm-sans)" }}>
                              Photos coming soon
                            </p>
                          </div>
                        )}

                        {/* Gradient for price readability */}
                        <div className="absolute inset-x-0 bottom-0 h-24" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)" }} />

                        {/* Price */}
                        <div className="absolute bottom-4 left-4">
                          <p className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-dm-sans)" }}>
                            ${p.price.toLocaleString()}
                            <span className="text-sm font-normal opacity-75 ml-0.5">/mo</span>
                          </p>
                        </div>

                        {/* Top badges */}
                        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                          <span
                            className="text-xs px-3 py-1 rounded-full font-semibold"
                            style={{ backgroundColor: "rgba(255,255,255,0.93)", color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
                          >
                            {p.available_date
                              ? `Available ${new Date(p.available_date).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}`
                              : "Available Now"}
                          </span>
                        </div>

                        <div className="absolute top-3 right-3 flex gap-1.5">
                          {p.utilities_included && (
                            <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ backgroundColor: "rgba(255,255,255,0.93)", color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
                              Utilities Incl.
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card body */}
                      <div className="p-6">
                        <p className="text-base font-semibold mb-1 truncate" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
                          {p.address}, {p.city}
                        </p>
                        <p className="text-xs mb-4" style={{ color: "#888888", fontFamily: "var(--font-dm-sans)" }}>
                          {[
                            p.property_type ? p.property_type.charAt(0).toUpperCase() + p.property_type.slice(1) : null,
                            p.city + ", ON",
                          ].filter(Boolean).join(" · ")}
                        </p>

                        {/* Stats row */}
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm mb-5" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
                          <span>{p.bedrooms} {p.bedrooms === 1 ? "Bed" : "Beds"}</span>
                          <span style={{ color: "#D8D2C8" }}>·</span>
                          <span>{p.bathrooms} {p.bathrooms === 1 ? "Bath" : "Baths"}</span>
                          {p.sqft && (
                            <>
                              <span style={{ color: "#D8D2C8" }}>·</span>
                              <span>{p.sqft.toLocaleString()} sqft</span>
                            </>
                          )}
                          {p.parking && (
                            <>
                              <span style={{ color: "#D8D2C8" }}>·</span>
                              <span>Parking</span>
                            </>
                          )}
                          {p.pet_friendly && (
                            <>
                              <span style={{ color: "#D8D2C8" }}>·</span>
                              <span>Pets OK</span>
                            </>
                          )}
                        </div>

                        <div
                          className="w-full py-3 text-center text-xs font-semibold uppercase tracking-widest rounded-lg transition-opacity group-hover:opacity-80"
                          style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
                        >
                          View Details
                        </div>
                      </div>
                    </article>
                  </Link>
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recently Rented */}
      {!loading && rented.length > 0 && (
        <section className="py-16 px-6 border-t" style={{ backgroundColor: "#FFFFFF", borderColor: "#D8D2C8" }}>
          <div className="max-w-6xl mx-auto">
            <FadeIn>
              <p className="text-xs font-semibold uppercase tracking-widest text-center mb-3" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
                Recently Rented
              </p>
              <h2 className="text-3xl font-light text-center mb-2" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
                These homes found tenants quickly.
              </h2>
              <p className="text-sm text-center mb-10" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
                High-demand properties in your area. New listings added regularly.
              </p>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {rented.map((p) => (
                <div key={p.id} className="relative rounded-2xl overflow-hidden" style={{ border: "1px solid #D8D2C8" }}>
                  <div className="relative h-48 overflow-hidden bg-[#E8E3DC]">
                    {getImage(p) && (
                      <Image
                        src={getImage(p)!}
                        alt={`${p.bedrooms}-bed rental in ${p.city}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    )}
                    <div className="absolute inset-0" style={{ backgroundColor: "rgba(31,47,58,0.5)" }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full" style={{ backgroundColor: "#FAF8F5", color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
                        Rented
                      </span>
                    </div>
                  </div>
                  <div className="p-5 bg-white">
                    <p className="text-sm font-semibold mb-0.5 truncate" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
                      {p.address}, {p.city}
                    </p>
                    <p className="text-xs" style={{ color: "#888888", fontFamily: "var(--font-dm-sans)" }}>
                      {p.bedrooms} Bed · {p.bathrooms} Bath{p.sqft ? ` · ${p.sqft.toLocaleString()} sqft` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="py-16 px-6 text-center" style={{ backgroundColor: "#1F2F3A" }}>
        <FadeIn>
          <p className="text-3xl font-light mb-3" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Don&apos;t see what you&apos;re looking for?
          </p>
          <p className="text-sm mb-8" style={{ color: "rgba(250,248,245,0.75)", fontFamily: "var(--font-dm-sans)" }}>
            New listings are added regularly. Tell us what you need and we&apos;ll reach out when something matches.
          </p>
          <Link
            href="/tenants#find-your-place"
            className="inline-block px-8 py-3 text-xs font-semibold uppercase tracking-widest rounded hover:opacity-80 transition-opacity"
            style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
          >
            Get Notified
          </Link>
        </FadeIn>
      </section>

    </div>
  );
}
