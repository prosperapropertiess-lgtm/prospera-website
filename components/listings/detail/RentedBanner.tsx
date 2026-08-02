"use client";

import { useState } from "react";
import type { PropertyRecord } from "./ListingPage";

interface Props {
  property: PropertyRecord;
}

export default function RentedBanner({ property }: Props) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await fetch("/api/listings/rental-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          city: property.city,
          bedrooms: property.bedrooms,
          property_type: property.property_type,
          price_max: property.price ? Math.round(property.price * 1.1) : null,
        }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true); // fail silently for UX
    }
    setLoading(false);
  }

  return (
    <div
      className="px-5 sm:px-8 py-5"
      style={{ backgroundColor: "#1F2F3A" }}
    >
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-1"
            style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)" }}
          >
            Recently Rented
          </p>
          <p
            className="text-base font-semibold"
            style={{ color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
          >
            This unit has been filled. Get notified when something similar opens up.
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 sm:w-56 px-4 py-2.5 rounded text-sm outline-none"
              style={{
                backgroundColor: "rgba(250,248,245,0.1)",
                border: "1px solid rgba(250,248,245,0.2)",
                color: "#FAF8F5",
                fontFamily: "var(--font-dm-sans)",
              }}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-semibold uppercase tracking-widest rounded transition-opacity hover:opacity-80 disabled:opacity-50 whitespace-nowrap"
              style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
            >
              Alert Me
            </button>
          </form>
        ) : (
          <p
            className="text-sm font-medium"
            style={{ color: "rgba(250,248,245,0.7)", fontFamily: "var(--font-dm-sans)" }}
          >
            ✓ You&apos;re on the list. We&apos;ll email you when something similar comes up.
          </p>
        )}
      </div>
    </div>
  );
}
