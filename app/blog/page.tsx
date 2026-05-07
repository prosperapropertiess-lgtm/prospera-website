import Link from "next/link";
import Image from "next/image";
import { getAllPosts } from "@/lib/blog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Landlord tips, tenant resources, Ontario market updates, and property management guides from Prospera Properties.",
};

const CATEGORIES = ["All", "Landlord Tips", "Tenant Resources", "Market Updates", "Ontario Law"];

const categoryColors: Record<string, { bg: string; text: string }> = {
  "Landlord Tips":      { bg: "#6A2E35", text: "#FAF8F5" },
  "Tenant Resources":  { bg: "#1F2F3A", text: "#FAF8F5" },
  "Market Updates":    { bg: "#D8D2C8", text: "#222222" },
  "Ontario Law":       { bg: "#333333", text: "#FAF8F5" },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div style={{ backgroundColor: "#F7F5F2" }} className="min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 text-center" style={{ backgroundColor: "#1F2F3A" }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "rgba(250,248,245,0.55)", fontFamily: "var(--font-dm-sans)" }}>
            Insights & Resources
          </p>
          <h1 className="text-5xl md:text-6xl font-light mb-6" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            The Prospera Blog
          </h1>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "rgba(250,248,245,0.65)", fontFamily: "var(--font-dm-sans)" }}>
            Practical guides for Ontario landlords and tenants — from the Residential Tenancies Act to current market rents.
          </p>
        </div>
      </section>

      {/* Category pills */}
      <section className="border-b sticky top-[64px] z-10 px-6 py-4" style={{ backgroundColor: "#FFFFFF", borderColor: "#D8D2C8" }}>
        <div className="max-w-6xl mx-auto flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <span
              key={cat}
              className="px-4 py-1.5 text-xs uppercase tracking-wider border rounded cursor-pointer transition-colors hover:border-[#1F2F3A] hover:text-[#1F2F3A]"
              style={{ borderColor: "#D8D2C8", color: "#444444", fontFamily: "var(--font-dm-sans)" }}
            >
              {cat}
            </span>
          ))}
        </div>
      </section>

      {/* Post grid */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        {posts.length === 0 ? (
          <p className="text-center" style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}>
            No posts yet. Check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => {
              const cat = categoryColors[post.category] ?? { bg: "#6A2E35", text: "#FAF8F5" };
              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                  style={{ border: "1px solid #D8D2C8", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
                >
                  {/* Thumbnail */}
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
                        <span className="text-4xl font-light" style={{ color: "#6A2E35", fontFamily: "var(--font-cormorant)" }}>P</span>
                      </div>
                    )}
                    {/* Category badge over image */}
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
                    {/* Read time */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
                        {post.readTime}
                      </span>
                    </div>

                    {/* Title */}
                    <h2
                      className="text-xl font-medium mb-3 leading-snug transition-colors group-hover:text-[#6A2E35]"
                      style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
                    >
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p
                      className="text-sm leading-relaxed flex-1 mb-4"
                      style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}
                    >
                      {post.excerpt}
                    </p>

                    {/* Date + read link */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t" style={{ borderColor: "#D8D2C8" }}>
                      <span className="text-xs" style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}>
                        {new Date(post.date).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}
                      </span>
                      <span
                        className="text-xs uppercase tracking-wider transition-colors group-hover:text-[#6A2E35]"
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

      {/* Newsletter CTA */}
      <section className="py-20 px-6" style={{ backgroundColor: "#1F2F3A" }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-light mb-4" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Get New Articles in Your Inbox
          </h2>
          <p className="text-sm mb-8" style={{ color: "rgba(250,248,245,0.65)", fontFamily: "var(--font-dm-sans)" }}>
            Ontario landlord tips, market updates, and legal guides — straight to your inbox, no spam.
          </p>
          <form className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 text-sm outline-none rounded"
              style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#FAF8F5", border: "1px solid rgba(255,255,255,0.15)", fontFamily: "var(--font-dm-sans)" }}
            />
            <button
              type="submit"
              className="px-6 py-3 text-xs uppercase tracking-widest transition-opacity hover:opacity-80 rounded"
              style={{ backgroundColor: "#6A2E35", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
