import { getAllPosts } from "@/lib/blog";
import type { Metadata } from "next";
import BlogGrid from "@/components/blog/BlogGrid";

export const metadata: Metadata = {
  title: "Blog",
  description: "Landlord tips, tenant resources, Ontario market updates, and property management guides from Prospera Properties.",
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

      <BlogGrid posts={posts} />

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
              className="px-6 py-3 text-xs uppercase tracking-widest rounded"
              style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
