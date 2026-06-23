"use client";

import { useEffect, useRef, useState } from "react";

interface Heading {
  level: number;
  text: string;
  id: string;
}

export default function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      // Find the topmost visible heading
      const visible = entries.filter((e) => e.isIntersecting);
      if (visible.length > 0) {
        // Pick the one closest to the top of the viewport
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b
        );
        setActiveId(topmost.target.id);
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersect, {
      rootMargin: "-80px 0px -60% 0px",
      threshold: 0,
    });

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [headings]);

  if (headings.length < 3) return null;

  return (
    <aside className="hidden xl:block">
      <div
        className="sticky top-28 rounded-xl border p-5"
        style={{ borderColor: "#D8D2C8", backgroundColor: "#FFFFFF" }}
      >
        <p
          className="text-xs uppercase tracking-widest mb-4 font-medium"
          style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}
        >
          In this article
        </p>
        <nav className="space-y-1">
          {headings.map((h) => {
            const isActive = activeId === h.id;
            return (
              <a
                key={h.id}
                href={`#${h.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(h.id);
                  if (el) {
                    const top = el.getBoundingClientRect().top + window.scrollY - 100;
                    window.scrollTo({ top, behavior: "smooth" });
                    setActiveId(h.id);
                  }
                }}
                className="block text-xs leading-snug transition-colors"
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  paddingLeft: h.level === 3 ? "12px" : "0",
                  color: isActive ? "#8B2030" : "#666666",
                  fontWeight: isActive ? 500 : 400,
                  borderLeft: isActive ? "2px solid #8B2030" : "2px solid transparent",
                  paddingTop: "4px",
                  paddingBottom: "4px",
                }}
              >
                {h.text}
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
