"use client";

import { useEffect, useRef, useState } from "react";
import type { PropertyRecord } from "./ListingPage";
import BookViewingButton from "./BookViewingButton";

interface Props {
  property: PropertyRecord;
}

export default function StickyCTA({ property }: Props) {
  const [visible, setVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Sentinel placed right after the hero */}
      <div ref={sentinelRef} className="absolute top-[60vh] left-0 w-px h-px pointer-events-none" aria-hidden />

      <div
        className={[
          "fixed bottom-0 left-0 right-0 z-40 px-4 sm:px-8 py-3 sm:py-4",
          "transition-all duration-300 ease-out",
          visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none",
        ].join(" ")}
        style={{ backgroundColor: "#1F2F3A", boxShadow: "0 -2px 16px rgba(0,0,0,0.18)" }}
      >
        <div className="max-w-5xl mx-auto">
          {/* Mobile layout: price row + full-width button */}
          <div className="flex items-center justify-between gap-3 sm:hidden">
            <div className="shrink-0">
              <span className="text-xl font-bold" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
                ${property.price.toLocaleString()}
              </span>
              <span className="text-xs ml-1" style={{ color: "rgba(250,248,245,0.5)" }}>/mo</span>
              <p className="text-xs" style={{ color: "rgba(250,248,245,0.45)" }}>
                {property.bedrooms}bd · {property.bathrooms}ba
              </p>
            </div>
            <BookViewingButton property={property} variant="primary" label="Book a Viewing" className="!px-4 !py-2.5" />
          </div>

          {/* Desktop layout */}
          <div className="hidden sm:flex items-center justify-between gap-4">
            <div>
              <span className="text-2xl font-bold" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
                ${property.price.toLocaleString()}
              </span>
              <span className="text-sm ml-1" style={{ color: "rgba(250,248,245,0.5)" }}>/mo</span>
              <p className="text-xs mt-0.5" style={{ color: "rgba(250,248,245,0.45)" }}>
                {property.bedrooms} bed · {property.bathrooms} bath
                {property.city ? ` · ${property.city}` : ""}
              </p>
            </div>
            <BookViewingButton property={property} variant="primary" label="Book a Viewing" />
          </div>
        </div>
      </div>
    </>
  );
}
