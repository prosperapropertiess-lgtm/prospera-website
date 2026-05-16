"use client";
import { useEffect, useState } from "react";

export default function ViewCounter({ slug }: { slug: string }) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/blog/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    })
      .then((r) => r.json())
      .then((d) => setViews(d.views ?? null))
      .catch(() => {});
  }, [slug]);

  if (views === null) return null;

  return (
    <span
      className="flex items-center gap-1 text-xs"
      style={{ color: "rgba(250,248,245,0.55)", fontFamily: "var(--font-dm-sans)" }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      {views.toLocaleString()}
    </span>
  );
}
