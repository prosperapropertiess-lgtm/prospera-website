"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { PropertyRecord } from "./ListingPage";

interface Props {
  property: PropertyRecord;
}

interface LabeledPhoto {
  label: string;
  url: string;
}

function buildPhotosByCategory(property: PropertyRecord): {
  categories: string[];
  byCategory: Record<string, string[]>;
  all: string[];
} {
  if (property.photo_labels?.length) {
    const byCategory: Record<string, string[]> = {};
    for (const item of property.photo_labels as LabeledPhoto[]) {
      if (!byCategory[item.label]) byCategory[item.label] = [];
      byCategory[item.label].push(item.url);
    }
    return {
      categories: Object.keys(byCategory),
      byCategory,
      all: (property.photo_labels as LabeledPhoto[]).map((p) => p.url),
    };
  }

  const all = property.images ?? [];
  return { categories: [], byCategory: {}, all };
}

export default function PhotoGallery({ property }: Props) {
  const { categories, byCategory, all } = buildPhotosByCategory(property);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const displayImages =
    activeCategory && byCategory[activeCategory]
      ? byCategory[activeCategory]
      : all;

  const safeIndex = Math.min(activeIndex, displayImages.length - 1);
  const currentImage = displayImages[safeIndex] ?? "";

  const handlePrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + displayImages.length) % displayImages.length);
  }, [displayImages.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % displayImages.length);
  }, [displayImages.length]);

  useEffect(() => {
    setActiveIndex(0);
  }, [activeCategory]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, handlePrev, handleNext]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (lightboxOpen) return;
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, handlePrev, handleNext]);

  if (!displayImages.length) return null;

  return (
    <section className="py-10 px-5 sm:px-8 max-w-5xl mx-auto">
      {/* Category tabs */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          <button
            onClick={() => setActiveCategory(null)}
            className="px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest transition-colors"
            style={{
              backgroundColor: activeCategory === null ? "#1F2F3A" : "transparent",
              color: activeCategory === null ? "#FAF8F5" : "#666666",
              border: "1px solid",
              borderColor: activeCategory === null ? "#1F2F3A" : "#D8D2C8",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest transition-colors"
              style={{
                backgroundColor: activeCategory === cat ? "#1F2F3A" : "transparent",
                color: activeCategory === cat ? "#FAF8F5" : "#666666",
                border: "1px solid",
                borderColor: activeCategory === cat ? "#1F2F3A" : "#D8D2C8",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div
        className="relative h-[340px] sm:h-[420px] md:h-[520px] overflow-hidden rounded-xl cursor-zoom-in mb-3"
        onClick={() => setLightboxOpen(true)}
      >
        <div className="absolute inset-0 transition-opacity duration-250">
          <Image
            src={currentImage}
            alt={`Property photo ${safeIndex + 1}`}
            fill
            className="object-cover"
            unoptimized
            priority={safeIndex === 0}
          />
        </div>

        {/* Arrow navigation */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
              style={{ backgroundColor: "rgba(31,47,58,0.7)" }}
              aria-label="Previous photo"
            >
              <ChevronLeft size={18} color="#FAF8F5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
              style={{ backgroundColor: "rgba(31,47,58,0.7)" }}
              aria-label="Next photo"
            >
              <ChevronRight size={18} color="#FAF8F5" />
            </button>
          </>
        )}

        {/* Counter */}
        <span
          className="absolute bottom-3 right-3 text-xs px-3 py-1 rounded-full"
          style={{ backgroundColor: "rgba(31,47,58,0.65)", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
        >
          {safeIndex + 1} / {displayImages.length}
        </span>
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {displayImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className="relative h-16 w-24 flex-shrink-0 rounded-lg overflow-hidden transition-all"
              style={{ opacity: safeIndex === i ? 1 : 0.45, outline: safeIndex === i ? "2px solid #1F2F3A" : "none" }}
              aria-label={`Photo ${i + 1}`}
            >
              <Image src={img} alt={`Thumbnail ${i + 1}`} fill className="object-cover" unoptimized />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200"
          style={{ backgroundColor: "rgba(0,0,0,0.92)" }}
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
            onClick={() => setLightboxOpen(false)}
            aria-label="Close lightbox"
          >
            <X size={20} color="#FAF8F5" />
          </button>

          <div
            className="relative w-full max-w-4xl h-[70vh] mx-6"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentImage}
              alt={`Property photo ${safeIndex + 1}`}
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          {displayImages.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                aria-label="Previous"
              >
                <ChevronLeft size={22} color="#FAF8F5" />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                aria-label="Next"
              >
                <ChevronRight size={22} color="#FAF8F5" />
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}
