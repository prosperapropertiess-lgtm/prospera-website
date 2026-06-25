"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { PropertyRecord } from "./ListingPage";
import PrequalifyForm from "./PrequalifyForm";

interface Props {
  property: PropertyRecord;
}

export default function StickyCTA({ property }: Props) {
  const [visible, setVisible] = useState(false);
  const [showPrequalify, setShowPrequalify] = useState(false);
  const [prequalified, setPrequalified] = useState(false);
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

  // Check if already prequalified (localStorage)
  useEffect(() => {
    const key = `prequalified:${property.id}`;
    if (localStorage.getItem(key)) setPrequalified(true);
  }, [property.id]);

  function handlePrequalSuccess() {
    localStorage.setItem(`prequalified:${property.id}`, "true");
    setPrequalified(true);
    setShowPrequalify(false);
  }

  const applyUrl = property.buildium_link ?? "/contact";

  return (
    <>
      {/* Sentinel placed right after the hero */}
      <div ref={sentinelRef} className="absolute top-[60vh] left-0 w-px h-px pointer-events-none" aria-hidden />

      {/* Pre-qualification modal */}
      {showPrequalify && (
        <PrequalifyForm
          property={property}
          onClose={() => setShowPrequalify(false)}
          onSuccess={handlePrequalSuccess}
        />
      )}

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="fixed bottom-0 left-0 right-0 z-40 px-5 sm:px-8 py-4"
            style={{ backgroundColor: "#1F2F3A", boxShadow: "0 -2px 16px rgba(0,0,0,0.18)" }}
          >
            <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
              {/* Price */}
              <div>
                <span
                  className="text-2xl font-bold"
                  style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
                >
                  ${property.price.toLocaleString()}
                </span>
                <span className="text-sm ml-1" style={{ color: "rgba(250,248,245,0.5)" }}>/mo</span>
                <p className="text-xs mt-0.5" style={{ color: "rgba(250,248,245,0.45)" }}>
                  {property.bedrooms} bed · {property.bathrooms} bath
                  {property.city ? ` · ${property.city}` : ""}
                </p>
              </div>

              {/* CTAs */}
              <div className="flex items-center gap-5">
                {prequalified ? (
                  <a
                    href={`/contact?property=${encodeURIComponent(property.title)}&prequalified=true`}
                    className="text-xs font-medium uppercase tracking-widest border-b pb-px transition-opacity hover:opacity-60"
                    style={{ color: "rgba(250,248,245,0.55)", borderColor: "rgba(250,248,245,0.2)" }}
                  >
                    Schedule Viewing
                  </a>
                ) : (
                  <button
                    onClick={() => setShowPrequalify(true)}
                    className="text-xs font-medium uppercase tracking-widest border-b pb-px transition-opacity hover:opacity-60"
                    style={{ color: "rgba(250,248,245,0.55)", borderColor: "rgba(250,248,245,0.2)" }}
                  >
                    Pre-Qualify to View
                  </button>
                )}

                {property.buildium_link ? (
                  <a
                    href={property.buildium_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 text-xs font-semibold uppercase tracking-widest transition-opacity hover:opacity-80 rounded"
                    style={{ backgroundColor: "#8B2030", color: "#FAF8F5" }}
                  >
                    Apply Now
                  </a>
                ) : (
                  <Link
                    href={applyUrl}
                    className="px-6 py-3 text-xs font-semibold uppercase tracking-widest transition-opacity hover:opacity-80 rounded"
                    style={{ backgroundColor: "#8B2030", color: "#FAF8F5" }}
                  >
                    Apply Now
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
