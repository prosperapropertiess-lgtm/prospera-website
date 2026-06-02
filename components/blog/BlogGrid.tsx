"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ViewCounter from "@/components/blog/ViewCounter";

const CATEGORIES = ["All", "Landlord Tips", "Tenant Resources", "Market Updates", "Ontario Law"];

const CAT_COLOR: Record<string, string> = {
  "Landlord Tips":    "#8B2030",
  "Tenant Resources": "#1F5C9A",
  "Market Updates":   "#2A6049",
  "Ontario Law":      "#5C4A1E",
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

function CategoryPill({ category }: { category: string }) {
  const color = CAT_COLOR[category] ?? "#8B2030";
  return (
    <span
      className="text-xs font-bold uppercase tracking-widest"
      style={{ color, fontFamily: "var(--font-dm-sans)" }}
    >
      {category}
    </span>
  );
}

function FeaturedCard({ post }: { post: Post }) {
  const accentColor = CAT_COLOR[post.category] ?? "#8B2030";
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid grid-cols-1 md:grid-cols-5 bg-white rounded-2xl overflow-hidden md:h-80"
      style={{ border: "1px solid #E8E4DF", boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}
    >
      {/* Image — takes 3/5 cols on desktop, fixed height on mobile */}
      <div
        className="relative md:col-span-3 h-56 md:h-full overflow-hidden"
        style={{ backgroundColor: "#F0EDE8" }}
      >
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, 60vw"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center absolute inset-0">
            <span className="text-6xl font-light" style={{ color: "#8B2030", fontFamily: "var(--font-cormorant)" }}>P</span>
          </div>
        )}
        {/* Featured badge */}
        <div className="absolute top-4 left-4">
          <span
            className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
            style={{ backgroundColor: "#1F2F3A", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
          >
            Featured
          </span>
        </div>
      </div>

      {/* Text — takes 2/5 cols on desktop */}
      <div className="md:col-span-2 flex flex-col justify-center p-7 md:p-9">
        <CategoryPill category={post.category} />
        <h2
          className="text-2xl md:text-3xl font-medium mt-3 mb-4 leading-snug group-hover:text-[#8B2030] transition-colors"
          style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
        >
          {post.title}
        </h2>
        <p className="text-sm leading-relaxed mb-5" style={{ color: "#555555", fontFamily: "var(--font-dm-sans)" }}>
          {post.excerpt}
        </p>
        <div className="flex items-center gap-3 text-xs mb-5" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
          <span>{post.readTime}</span>
          <span>·</span>
          <span>{new Date(post.date).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" })}</span>
        </div>
        <span
          className="inline-flex items-center gap-1 text-sm font-semibold group-hover:gap-2 transition-all"
          style={{ color: accentColor, fontFamily: "var(--font-dm-sans)" }}
        >
          Read article →
        </span>
      </div>
    </Link>
  );
}

function TrendingCard({ post, index }: { post: Post; index: number }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex items-start gap-4 py-4"
      style={{ borderBottom: index < 2 ? "1px solid #F0EDE8" : "none" }}
    >
      {/* Rank number */}
      <span
        className="text-3xl font-light leading-none w-8 shrink-0 text-right mt-0.5"
        style={{ color: "#D8D2C8", fontFamily: "var(--font-cormorant)" }}
      >
        {`0${index + 1}`}
      </span>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <CategoryPill category={post.category} />
        <h3
          className="text-base font-semibold mt-1.5 leading-snug group-hover:text-[#8B2030] transition-colors"
          style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
        >
          {post.title}
        </h3>
        <p className="text-xs mt-1" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
          {post.readTime}
        </p>
      </div>

      {/* Thumbnail */}
      <div
        className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden"
        style={{ backgroundColor: "#F0EDE8" }}
      >
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="80px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xl font-light" style={{ color: "#8B2030", fontFamily: "var(--font-cormorant)" }}>P</span>
          </div>
        )}
      </div>
    </Link>
  );
}

function ArticleCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
      style={{ border: "1px solid #E8E4DF" }}
    >
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden" style={{ backgroundColor: "#F0EDE8" }}>
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-3xl font-light" style={{ color: "#8B2030", fontFamily: "var(--font-cormorant)" }}>P</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <CategoryPill category={post.category} />
        <h2
          className="text-lg font-semibold mt-2 mb-2 leading-snug group-hover:text-[#8B2030] transition-colors"
          style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
        >
          {post.title}
        </h2>
        <p
          className="text-sm leading-relaxed flex-1 mb-4"
          style={{ color: "#555555", fontFamily: "var(--font-dm-sans)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
        >
          {post.excerpt}
        </p>
        <div className="flex items-center gap-2.5 pt-3 border-t" style={{ borderColor: "#F0EDE8" }}>
          <span className="text-xs" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>{post.readTime}</span>
          <span className="text-xs" style={{ color: "#D8D2C8" }}>·</span>
          <span className="text-xs" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
            {new Date(post.date).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          <ViewCounter slug={post.slug} />
        </div>
      </div>
    </Link>
  );
}

export default function BlogGrid({ posts }: { posts: Post[] }) {
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? posts : posts.filter((p) => p.category === active);
  const featured = filtered[0] ?? null;
  const trending = filtered.slice(1, 4);
  const rest = filtered.slice(4);

  return (
    <div style={{ backgroundColor: "#F7F5F2" }}>

      {/* ── Sticky category tabs ── */}
      <div
        className="sticky top-[80px] z-20 border-b"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#E8E4DF" }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((cat) => {
              const isActive = active === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className="shrink-0 px-5 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors"
                  style={{
                    borderColor: isActive ? "#8B2030" : "transparent",
                    color: isActive ? "#8B2030" : "#777777",
                    backgroundColor: "transparent",
                    fontFamily: "var(--font-dm-sans)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="max-w-6xl mx-auto px-6 py-24 text-center">
          <p style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>No posts in this category yet.</p>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-14">

          {/* ── Featured article ── */}
          {featured && <FeaturedCard post={featured} />}

          {/* ── Trending + grid split ── */}
          {(trending.length > 0 || rest.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

              {/* Trending list — left 1 col */}
              {trending.length > 0 && (
                <div className="lg:col-span-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}
                    >
                      Trending
                    </span>
                    <div className="flex-1 h-px" style={{ backgroundColor: "#E8E4DF" }} />
                  </div>
                  <div>
                    {trending.map((post, i) => (
                      <TrendingCard key={post.slug} post={post} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* Latest articles — right 2 cols */}
              {rest.length > 0 && (
                <div className={trending.length > 0 ? "lg:col-span-2" : "lg:col-span-3"}>
                  <div className="flex items-center gap-3 mb-6">
                    <span
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
                    >
                      Latest
                    </span>
                    <div className="flex-1 h-px" style={{ backgroundColor: "#E8E4DF" }} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {rest.slice(0, 6).map((post) => (
                      <ArticleCard key={post.slug} post={post} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── More articles full grid ── */}
          {rest.length > 6 && (
            <div>
              <div className="flex items-center gap-3 mb-8">
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
                >
                  More Articles
                </span>
                <div className="flex-1 h-px" style={{ backgroundColor: "#E8E4DF" }} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.slice(6).map((post) => (
                  <ArticleCard key={post.slug} post={post} />
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
