"use client";
import { useEffect, useState } from "react";
import type { PropertyRecord } from "./ListingPage";

interface Props {
  property: PropertyRecord;
}

export default function SocialProof({ property }: Props) {
  const [inquiries, setInquiries] = useState<number>(0);

  useEffect(() => {
    // Fetch live inquiry count
    const count = (property.inquiry_count as number) || 0;
    setInquiries(count);
  }, [property.inquiry_count]);

  const hasVideo = property.virtual_tour_url;
  const hasInquiries = inquiries > 0;

  if (!hasVideo && !hasInquiries) return null;

  // Extract YouTube embed URL
  function getEmbedUrl(url: string): string | null {
    // youtube.com/watch?v=ID or youtu.be/ID
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`;
    // Matterport or other embed URLs — pass through
    if (url.includes("matterport.com") || url.includes("embed")) return url;
    return null;
  }

  const embedUrl = hasVideo ? getEmbedUrl(property.virtual_tour_url as string) : null;

  return (
    <>
      {/* Inquiry badge — shown in QuickSummary area */}
      {hasInquiries && (
        <div className="px-5 sm:px-8 pb-2">
          <div className="max-w-5xl mx-auto">
            <span
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: "rgba(139,32,48,0.08)", color: "#8B2030" }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#8B2030" }} />
              {inquiries} {inquiries === 1 ? "person has" : "people have"} inquired about this property
            </span>
          </div>
        </div>
      )}

      {/* Video Tour */}
      {embedUrl && (
        <section className="py-16 px-5 sm:px-8" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="max-w-5xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#666666" }}>
              Virtual Tour
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-8" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              Walk through it from home
            </h2>
            <div className="relative w-full rounded-xl overflow-hidden shadow-lg" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={embedUrl}
                title="Virtual Tour"
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
