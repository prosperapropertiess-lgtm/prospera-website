"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ViewCounter from "@/components/blog/ViewCounter";

const CATEGORIES = ["All", "Landlord Tips", "Tenant Resources", "Market Updates", "Ontario Law"];

const categoryColors: Record<string, { bg: string; text: string }> = {
  "Landlord Tips":     { bg: "#8B2030", text: "#FAF8F5" },
  "Tenant Resources":  { bg: "#1F2F3A", text: "#FAF8F5" },
  "Market Updates":    { bg: "#D8D2C8", text: "#222222" },
  "Ontario Law":       { bg: "#333333", text: "#FAF8F5" },
};

type Post = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
  readTime: string;
  featuredImage?: string;
};

export default function BlogGrid({ posts }: { posts: Post[] }) {
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? posts : posts.filter((p) => p.category === active);

  return (
    <>
      {/* Category filter pills */}
      <section
        className="border-b sticky top-[64px] z-10 px-6 py-4"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#D8D2C8" }}
      >
        <div className="max-w-6xl mx-auto flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => {
            const isActive = active === cat;
            return (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className="px-4 py-1.5 text-xs uppercase tracking-wider border rounded transition-colors"
                style={{
                  borderColor: isActive ? "#1F2F3A" : "#D8D2C8",
                  backgroundColor: isActive ? "#1F2F3A" : "transparent",
                  color: isActive ? "#FAF8F5" : "#444444",
                  fontFamily: "var(--font-dm-sans)",
                  cursor: "pointer",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Post grid */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        {filtered.length === 0 ? (
          <p className="text-center" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
            No posts in this category yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((post) => {
              const cat = categoryColors[post.category] ?? { bg: "#8B2030", text: "#FAF8F5" };
              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                  style={{ border: "1px solid #D8D2C8", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
                >
                  <div className="relative h-52 w-full overflow-hidden" style={{ backgroundColor: "#E8E3DC" }}>
                    {post.featuredImage ? (
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#F7F5F2" }}>
                        <span className="text-4xl font-light" style={{ color: "#8B2030", fontFamily: "var(--font-cormorant)" }}>P</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span
                        className="text-xs uppercase tracking-wider px-2 py-1 rounded"
                        style={{ backgroundColor: cat.bg, color: cat.text, fontFamily: "var(--font-dm-sans)" }}
                      >
                        {post.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col flex-1 p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
                        {post.readTime}
                      </span>
                      <ViewCounter slug={post.slug} />
                    </div>
                    <h2
                      className="text-xl font-medium mb-3 leading-snug transition-colors group-hover:text-[#8B2030]"
                      style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
                    >
                      {post.title}
                    </h2>
                    <p
                      className="text-sm leading-relaxed flex-1 mb-4"
                      style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}
                    >
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t" style={{ borderColor: "#D8D2C8" }}>
                      <span className="text-xs" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
                        {new Date(post.date).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}
                      </span>
                      <span
                        className="text-xs uppercase tracking-wider transition-colors group-hover:text-[#8B2030]"
                        style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
                      >
                        Read →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
