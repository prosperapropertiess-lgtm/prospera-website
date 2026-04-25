import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Landlord tips, tenant resources, Ontario market updates, and property management guides from Prospera Properties.",
};

const CATEGORIES = ["All", "Landlord Tips", "Tenant Resources", "Market Updates", "Ontario Law"];

const categoryColors: Record<string, string> = {
  "Landlord Tips": "bg-[#0A1628] text-[#FAF8F5]",
  "Tenant Resources": "bg-[#2D4A5E] text-[#FAF8F5]",
  "Market Updates": "bg-[#7B1C1C] text-[#FAF8F5]",
  "Ontario Law": "bg-[#4A4A4A] text-[#FAF8F5]",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div style={{ backgroundColor: "#FAF8F5" }} className="min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-16 px-6" style={{ backgroundColor: "#F5F0EB" }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}>
            Insights & Resources
          </p>
          <h1 className="text-5xl md:text-6xl font-light mb-6" style={{ color: "#0A1628", fontFamily: "var(--font-cormorant)" }}>
            The Prospera Blog
          </h1>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "#2D4A5E", fontFamily: "var(--font-dm-sans)" }}>
            Practical guides for Ontario landlords and tenants — from the Residential Tenancies Act to current market rents.
          </p>
        </div>
      </section>

      {/* Category pills */}
      <section className="border-b sticky top-[64px] z-10 px-6 py-4" style={{ backgroundColor: "#FAF8F5", borderColor: "#E8E4DF" }}>
        <div className="max-w-6xl mx-auto flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <span
              key={cat}
              className="px-4 py-1.5 text-xs uppercase tracking-wider border cursor-pointer hover:bg-[#0A1628] hover:text-[#FAF8F5] transition-colors"
              style={{ borderColor: "#0A1628", color: "#0A1628", fontFamily: "var(--font-dm-sans)" }}
            >
              {cat}
            </span>
          ))}
        </div>
      </section>

      {/* Post grid */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        {posts.length === 0 ? (
          <p className="text-center" style={{ color: "#2D4A5E", fontFamily: "var(--font-dm-sans)" }}>
            No posts yet. Check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col bg-white border hover:shadow-lg transition-shadow"
                style={{ borderColor: "#E8E4DF" }}
              >
                {/* Image placeholder */}
                <div
                  className="h-48 w-full flex items-center justify-center"
                  style={{ backgroundColor: "#E8E4DF" }}
                >
                  <span className="text-3xl">📰</span>
                </div>

                <div className="flex flex-col flex-1 p-6">
                  {/* Category + read time */}
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`text-xs uppercase tracking-wider px-2 py-1 ${categoryColors[post.category] ?? "bg-[#0A1628] text-[#FAF8F5]"}`}
                      style={{ fontFamily: "var(--font-dm-sans)" }}
                    >
                      {post.category}
                    </span>
                    <span className="text-xs" style={{ color: "#9B9B9B", fontFamily: "var(--font-dm-sans)" }}>
                      {post.readTime}
                    </span>
                  </div>

                  {/* Title */}
                  <h2
                    className="text-xl font-medium mb-3 group-hover:text-[#7B1C1C] transition-colors leading-snug"
                    style={{ color: "#0A1628", fontFamily: "var(--font-cormorant)" }}
                  >
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p
                    className="text-sm leading-relaxed flex-1 mb-4"
                    style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}
                  >
                    {post.excerpt}
                  </p>

                  {/* Date + read link */}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t" style={{ borderColor: "#E8E4DF" }}>
                    <span className="text-xs" style={{ color: "#9B9B9B", fontFamily: "var(--font-dm-sans)" }}>
                      {new Date(post.date).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                    <span
                      className="text-xs uppercase tracking-wider group-hover:text-[#7B1C1C] transition-colors"
                      style={{ color: "#0A1628", fontFamily: "var(--font-dm-sans)" }}
                    >
                      Read →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 px-6" style={{ backgroundColor: "#0A1628" }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-light mb-4" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Get New Articles in Your Inbox
          </h2>
          <p className="text-sm mb-8" style={{ color: "#A0A0A0", fontFamily: "var(--font-dm-sans)" }}>
            Ontario landlord tips, market updates, and legal guides — straight to your inbox, no spam.
          </p>
          <form className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 text-sm outline-none"
              style={{ backgroundColor: "#1C2D3F", color: "#FAF8F5", border: "1px solid #2D4A5E", fontFamily: "var(--font-dm-sans)" }}
            />
            <button
              type="submit"
              className="px-6 py-3 text-xs uppercase tracking-widest transition-opacity hover:opacity-80"
              style={{ backgroundColor: "#7B1C1C", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
