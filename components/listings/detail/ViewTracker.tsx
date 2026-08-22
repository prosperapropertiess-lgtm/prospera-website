"use client";
import { useEffect } from "react";

// Fires once per visitor per listing (localStorage dedup, same pattern as the blog view counter).
// No UI — just records the view so /admin has real per-listing traffic data.
export default function ViewTracker({ propertyId }: { propertyId: string }) {
  useEffect(() => {
    const key = `viewed:listing:${propertyId}`;
    if (localStorage.getItem(key)) return;

    fetch("/api/listings/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: propertyId }),
    })
      .then(() => localStorage.setItem(key, "1"))
      .catch(() => {});
  }, [propertyId]);

  return null;
}
