"use client";

import { useState } from "react";
import Image from "next/image";

interface Property {
  id: string;
  address: string;
  city: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number | null;
  description: string;
  images: string[] | null;
  application_count: number;
  apply_link: string;
}

const placeholders = [
  "https://picsum.photos/seed/p1/600/400",
  "https://picsum.photos/seed/p2/600/400",
  "https://picsum.photos/seed/p3/600/400",
];

export default function PropertyCard({ property, agentId }: { property: Property; agentId: string }) {
  const [copied, setCopied] = useState(false);
  const [descCopied, setDescCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const image = property.images?.[0] ?? placeholders[property.id.charCodeAt(0) % placeholders.length];

  function copyLink() {
    navigator.clipboard.writeText(property.apply_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copyDescription() {
    const text = `${property.address}, ${property.city}\n${property.bedrooms} bed · ${property.bathrooms} bath${property.sqft ? ` · ${property.sqft} sqft` : ""}\n$${property.price.toLocaleString()}/mo\n\n${property.description}`;
    navigator.clipboard.writeText(text);
    setDescCopied(true);
    setTimeout(() => setDescCopied(false), 2000);
  }

  async function downloadImages() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/agents/properties/${property.id}/download`);
      if (!res.ok) {
        alert("No images available for this property.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${property.address.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-photos.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Download failed. Try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div style={{
      backgroundColor: "#111C27",
      border: "1px solid rgba(250,248,245,0.08)",
      borderRadius: 12,
      overflow: "hidden",
    }}>
      {/* Image */}
      <div style={{ position: "relative", height: 180, backgroundColor: "#0B1219" }}>
        <Image
          src={image}
          alt={property.address}
          fill
          style={{ objectFit: "cover" }}
          sizes="(max-width: 768px) 100vw, 400px"
        />
        {property.application_count > 0 && (
          <div style={{
            position: "absolute",
            top: 10,
            right: 10,
            backgroundColor: "#C4374A",
            color: "#FAF8F5",
            fontSize: 12,
            fontFamily: "var(--font-dm-sans)",
            fontWeight: 600,
            padding: "3px 10px",
            borderRadius: 20,
          }}>
            {property.application_count} application{property.application_count !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "16px 20px 12px" }}>
        <p style={{
          margin: "0 0 2px",
          fontSize: 15,
          fontWeight: 600,
          color: "#FAF8F5",
          fontFamily: "var(--font-dm-sans)",
        }}>
          {property.address}
        </p>
        <p style={{
          margin: "0 0 12px",
          fontSize: 13,
          color: "rgba(250,248,245,0.45)",
          fontFamily: "var(--font-dm-sans)",
        }}>
          {property.city} &nbsp;·&nbsp; {property.bedrooms}bd &nbsp;·&nbsp; {property.bathrooms}ba
          {property.sqft ? ` · ${property.sqft.toLocaleString()} sqft` : ""}
        </p>
        <p style={{
          margin: 0,
          fontSize: 20,
          fontWeight: 700,
          color: "#FAF8F5",
          fontFamily: "var(--font-dm-sans)",
        }}>
          ${property.price.toLocaleString()}<span style={{ fontSize: 13, fontWeight: 400, color: "rgba(250,248,245,0.45)" }}>/mo</span>
        </p>
      </div>

      {/* Actions */}
      <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
        <button
          onClick={copyLink}
          style={{
            padding: "11px",
            backgroundColor: copied ? "rgba(13,110,90,0.2)" : "#C4374A",
            color: copied ? "#6EE7B7" : "#FAF8F5",
            border: "none",
            borderRadius: 8,
            fontSize: 13,
            fontFamily: "var(--font-dm-sans)",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          {copied ? "✓ Link Copied" : "Copy Application Link"}
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button
            onClick={downloadImages}
            disabled={downloading}
            style={{
              padding: "10px",
              backgroundColor: "rgba(250,248,245,0.06)",
              color: "rgba(250,248,245,0.7)",
              border: "1px solid rgba(250,248,245,0.1)",
              borderRadius: 8,
              fontSize: 12,
              fontFamily: "var(--font-dm-sans)",
              cursor: downloading ? "not-allowed" : "pointer",
            }}
          >
            {downloading ? "Zipping..." : "↓ Photos"}
          </button>

          <button
            onClick={copyDescription}
            style={{
              padding: "10px",
              backgroundColor: "rgba(250,248,245,0.06)",
              color: descCopied ? "#6EE7B7" : "rgba(250,248,245,0.7)",
              border: "1px solid rgba(250,248,245,0.1)",
              borderRadius: 8,
              fontSize: 12,
              fontFamily: "var(--font-dm-sans)",
              cursor: "pointer",
            }}
          >
            {descCopied ? "✓ Copied" : "Copy Description"}
          </button>
        </div>
      </div>
    </div>
  );
}
