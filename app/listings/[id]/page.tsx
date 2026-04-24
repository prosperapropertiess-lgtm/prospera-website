"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  buildium_link?: string;
}

const placeholderImages = [
  "https://picsum.photos/seed/detail1/1200/700",
  "https://picsum.photos/seed/detail2/1200/700",
  "https://picsum.photos/seed/detail3/1200/700",
];

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [commuteAddress, setCommuteAddress] = useState("");
  const [commuteResult, setCommuteResult] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("properties").select("*").eq("id", id).single();
      setProperty(data);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 px-6" style={{ backgroundColor: "#FAF8F5" }}>
        <div className="max-w-5xl mx-auto animate-pulse">
          <div className="h-[420px] bg-gray-200 mb-8" />
          <div className="h-8 bg-gray-200 w-2/3 mb-4" />
          <div className="h-4 bg-gray-200 w-1/3" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen pt-32 px-6 text-center" style={{ backgroundColor: "#FAF8F5" }}>
        <p className="text-2xl mb-4" style={{ fontFamily: "var(--font-cormorant)", color: "#0D1B2A" }}>
          Property not found.
        </p>
        <Link href="/listings" className="text-sm underline" style={{ color: "#7B1C1C" }}>
          Back to listings
        </Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#FAF8F5" }} className="min-h-screen">
      {/* Back link */}
      <div className="pt-28 pb-4 px-6 max-w-5xl mx-auto">
        <Link
          href="/listings"
          className="text-xs uppercase tracking-widest hover:opacity-70 transition-opacity"
          style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
        >
          ← All Listings
        </Link>
      </div>

      {/* Photo gallery */}
      <section className="px-6 max-w-5xl mx-auto mb-10">
        <div className="relative h-[420px] md:h-[520px] overflow-hidden">
          <Image
            src={placeholderImages[activeImage]}
            alt={property.title}
            fill
            className="object-cover"
            unoptimized
            priority
          />
          {property.available && (
            <div className="absolute top-4 left-4">
              <span
                className="text-xs uppercase tracking-widest px-3 py-1.5"
                style={{ backgroundColor: "#7B1C1C", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
              >
                Available
              </span>
            </div>
          )}
        </div>
        {/* Thumbnails */}
        <div className="flex gap-2 mt-2">
          {placeholderImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className="relative h-20 w-28 overflow-hidden flex-shrink-0 transition-opacity"
              style={{ opacity: activeImage === i ? 1 : 0.5 }}
            >
              <Image src={img} alt="" fill className="object-cover" unoptimized />
            </button>
          ))}
        </div>
      </section>

      {/* Main content grid */}
      <section className="px-6 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 pb-20">
        {/* Left: details */}
        <div className="lg:col-span-2">
          {/* Title + price */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-light mb-2 leading-snug" style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}>
                {property.title}
              </h1>
              <p className="text-sm" style={{ color: "#2D4A5E", fontFamily: "var(--font-dm-sans)" }}>
                {property.address}, {property.city}, ON
              </p>
            </div>
            <div className="shrink-0">
              <p className="text-4xl font-light" style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}>
                ${property.price.toLocaleString()}
                <span className="text-base" style={{ color: "#9B9B9B" }}>/mo</span>
              </p>
            </div>
          </div>

          {/* Key stats */}
          <div className="flex flex-wrap gap-6 py-6 border-y mb-8" style={{ borderColor: "#E8E4DF" }}>
            <div className="text-center">
              <p className="text-2xl font-light" style={{ fontFamily: "var(--font-cormorant)", color: "#0D1B2A" }}>{property.bedrooms}</p>
              <p className="text-xs uppercase tracking-widest" style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}>Bedrooms</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-light" style={{ fontFamily: "var(--font-cormorant)", color: "#0D1B2A" }}>{property.bathrooms}</p>
              <p className="text-xs uppercase tracking-widest" style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}>Bathrooms</p>
            </div>
            {property.sqft && (
              <div className="text-center">
                <p className="text-2xl font-light" style={{ fontFamily: "var(--font-cormorant)", color: "#0D1B2A" }}>{property.sqft.toLocaleString()}</p>
                <p className="text-xs uppercase tracking-widest" style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}>Sq Ft</p>
              </div>
            )}
            <div className="text-center">
              <p className="text-2xl font-light" style={{ fontFamily: "var(--font-cormorant)", color: "#0D1B2A" }}>{property.city}</p>
              <p className="text-xs uppercase tracking-widest" style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}>City</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-10">
            <h2 className="text-2xl font-light mb-4" style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}>
              About This Home
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "#2C2C2C", fontFamily: "var(--font-dm-sans)" }}>
              {property.description}
            </p>
          </div>

          {/* Features */}
          <div className="mb-10">
            <h2 className="text-2xl font-light mb-4" style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}>
              Property Features
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Pet Friendly", value: property.pet_friendly ? "Yes" : "No" },
                { label: "Parking", value: property.parking ? "Included" : "Not included" },
                { label: "Managed By", value: "Prospera Properties" },
                { label: "City", value: property.city },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-3 p-4 bg-white border" style={{ borderColor: "#E8E4DF" }}>
                  <span className="text-sm" style={{ color: "#7B1C1C" }}>✓</span>
                  <div>
                    <p className="text-xs uppercase tracking-wider" style={{ color: "#9B9B9B", fontFamily: "var(--font-dm-sans)" }}>{f.label}</p>
                    <p className="text-sm font-medium" style={{ color: "#0D1B2A", fontFamily: "var(--font-dm-sans)" }}>{f.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Commute calculator */}
          <div className="mb-10 p-6 border" style={{ borderColor: "#E8E4DF", backgroundColor: "#F5F0EB" }}>
            <h2 className="text-2xl font-light mb-2" style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}>
              Commute Calculator
            </h2>
            <p className="text-sm mb-5" style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}>
              How far is this from your workplace, school, or anywhere else?
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={commuteAddress}
                onChange={(e) => setCommuteAddress(e.target.value)}
                placeholder="Enter an address or place"
                className="flex-1 px-4 py-3 text-sm outline-none border"
                style={{ borderColor: "#E8E4DF", backgroundColor: "white", fontFamily: "var(--font-dm-sans)", color: "#0D1B2A" }}
              />
              <button
                onClick={() => {
                  if (commuteAddress.trim()) {
                    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(commuteAddress)}&destination=${encodeURIComponent(property.address + ", " + property.city + ", ON")}`;
                    window.open(url, "_blank");
                    setCommuteResult("Opening Google Maps with your route...");
                  }
                }}
                className="px-5 py-3 text-xs uppercase tracking-widest transition-opacity hover:opacity-80"
                style={{ backgroundColor: "#0D1B2A", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
              >
                Check
              </button>
            </div>
            {commuteResult && (
              <p className="text-xs mt-3" style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}>
                {commuteResult}
              </p>
            )}
            <p className="text-xs mt-3" style={{ color: "#9B9B9B", fontFamily: "var(--font-dm-sans)" }}>
              Opens Google Maps with driving, transit, and walking directions.
            </p>
          </div>
        </div>

        {/* Right: sticky CTA card */}
        <div className="lg:col-span-1">
          <div className="sticky top-28">
            <div className="border p-6" style={{ borderColor: "#E8E4DF", backgroundColor: "white" }}>
              <p className="text-3xl font-light mb-1" style={{ fontFamily: "var(--font-cormorant)", color: "#0D1B2A" }}>
                ${property.price.toLocaleString()}<span className="text-sm" style={{ color: "#9B9B9B" }}>/mo</span>
              </p>
              <p className="text-xs mb-6" style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}>
                {property.bedrooms} bed · {property.bathrooms} bath{property.sqft ? ` · ${property.sqft.toLocaleString()} sqft` : ""}
              </p>

              {property.buildium_link ? (
                <a
                  href={property.buildium_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 text-xs uppercase tracking-widest text-center mb-3 transition-opacity hover:opacity-80"
                  style={{ backgroundColor: "#7B1C1C", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
                >
                  Apply Now
                </a>
              ) : null}

              <Link
                href={`/contact?property=${encodeURIComponent(property.title)}`}
                className="block w-full py-3 text-xs uppercase tracking-widest text-center border transition-colors hover:bg-[#0D1B2A] hover:text-[#FAF8F5]"
                style={{ borderColor: "#0D1B2A", color: "#0D1B2A", fontFamily: "var(--font-dm-sans)" }}
              >
                Schedule a Viewing
              </Link>

              <div className="mt-6 pt-6 border-t space-y-2" style={{ borderColor: "#E8E4DF" }}>
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#9B9B9B", fontFamily: "var(--font-dm-sans)" }}>
                  At a Glance
                </p>
                {[
                  ["Location", `${property.city}, ON`],
                  ["Bedrooms", String(property.bedrooms)],
                  ["Bathrooms", String(property.bathrooms)],
                  ["Pets", property.pet_friendly ? "Allowed" : "No pets"],
                  ["Parking", property.parking ? "Included" : "Not included"],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-xs" style={{ fontFamily: "var(--font-dm-sans)" }}>
                    <span style={{ color: "#9B9B9B" }}>{label}</span>
                    <span style={{ color: "#0D1B2A" }}>{val}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: "#E8E4DF" }}>
                <p className="text-xs mb-1" style={{ color: "#9B9B9B", fontFamily: "var(--font-dm-sans)" }}>Questions?</p>
                <a
                  href="tel:+15196971227"
                  className="text-sm font-medium"
                  style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
                >
                  (519) 697-1227
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
