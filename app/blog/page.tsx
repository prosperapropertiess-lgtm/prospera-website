import { getAllPosts } from "@/lib/blog";
import type { Metadata } from "next";
import BlogGrid from "@/components/blog/BlogGrid";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog: Landlord Tips, Ontario Law & Market Updates",
  description: "Landlord tips, tenant resources, Ontario market updates, and property management guides from Prospera Properties.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div style={{ backgroundColor: "#F7F5F2" }} className="min-h-screen">

      {/* ── Minimal header ── */}
      <section
        className="pt-28 pb-10 px-6"
        style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E8E4DF" }}
      >
        <div className="max-w-6xl mx-auto">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}
          >
            Landlord Resources &amp; Guides
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1
                className="text-4xl md:text-5xl font-light leading-tight"
                style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
              >
                The Prospera Blog
              </h1>
              <p
                className="text-sm mt-3 max-w-xl"
                style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}
              >
                Practical guides for Ontario landlords, from eviction law to current market rents.
              </p>
            </div>
            <Link
              href="/contact"
              className="shrink-0 inline-block px-6 py-3 text-xs uppercase tracking-widest rounded"
              style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
            >
              Get a Free Analysis →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Blog grid with category tabs ── */}
      <BlogGrid posts={posts} />

      {/* ── Newsletter strip ── */}
      <section className="py-16 px-6" style={{ backgroundColor: "#1F2F3A" }}>
        <div className="max-w-2xl mx-auto text-center">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "rgba(250,248,245,0.45)", fontFamily: "var(--font-dm-sans)" }}
          >
            Stay Informed
          </p>
          <h2
            className="text-3xl font-light mb-3"
            style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
          >
            New articles in your inbox
          </h2>
          <p
            className="text-sm mb-8"
            style={{ color: "rgba(250,248,245,0.60)", fontFamily: "var(--font-dm-sans)" }}
          >
            Ontario landlord tips, market updates, and legal guides. No spam.
          </p>
          <form className="flex gap-3 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 text-sm outline-none rounded"
              style={{
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "#FAF8F5",
                border: "1px solid rgba(255,255,255,0.12)",
                fontFamily: "var(--font-dm-sans)",
              }}
            />
            <button
              type="submit"
              className="px-5 py-3 text-xs uppercase tracking-widest rounded shrink-0"
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
