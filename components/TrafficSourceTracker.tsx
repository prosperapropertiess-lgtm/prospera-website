"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Writes traffic source to sessionStorage on every page visit.
// The contact form reads this to attribute leads to their origin.
export default function TrafficSourceTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Don't overwrite an existing attribution (first touch wins)
    const existing = sessionStorage.getItem("pp_traffic_source");

    // Detect organic search referral (Google, Bing, DuckDuckGo, etc.)
    const isOrganic =
      document.referrer &&
      /google\.|bing\.|duckduckgo\.|yahoo\.|search\./i.test(document.referrer);

    if (pathname.startsWith("/blog/")) {
      // Always update blog attribution — most recent blog post wins
      sessionStorage.setItem("pp_traffic_source", `blog:${pathname}`);
    } else if (pathname.startsWith("/services/")) {
      if (!existing) {
        sessionStorage.setItem("pp_traffic_source", `service:${pathname}`);
      }
    } else if (isOrganic && !existing) {
      sessionStorage.setItem("pp_traffic_source", "organic");
    }
  }, [pathname]);

  return null;
}
