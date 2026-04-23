import { notFound } from "next/navigation";
import Link from "next/link";
import { marked } from "marked";
import { getAllPosts, getPost } from "@/lib/blog";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Prospera Properties`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: "article" },
  };
}

const categoryColors: Record<string, string> = {
  "Landlord Tips": "bg-[#0D1B2A] text-[#FAF8F5]",
  "Tenant Resources": "bg-[#2D4A5E] text-[#FAF8F5]",
  "Market Updates": "bg-[#7B1C1C] text-[#FAF8F5]",
  "Ontario Law": "bg-[#4A4A4A] text-[#FAF8F5]",
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const htmlContent = await marked(post.content);

  return (
    <div style={{ backgroundColor: "#FAF8F5" }} className="min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-12 px-6" style={{ backgroundColor: "#F5F0EB" }}>
        <div className="max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest mb-8 hover:opacity-70 transition-opacity"
            style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
          >
            ← Back to Blog
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <span
              className={`text-xs uppercase tracking-wider px-2 py-1 ${categoryColors[post.category] ?? "bg-[#0D1B2A] text-[#FAF8F5]"}`}
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {post.category}
            </span>
            <span className="text-xs" style={{ color: "#9B9B9B", fontFamily: "var(--font-dm-sans)" }}>
              {post.readTime}
            </span>
            <span className="text-xs" style={{ color: "#9B9B9B", fontFamily: "var(--font-dm-sans)" }}>
              {new Date(post.date).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>

          <h1
            className="text-4xl md:text-5xl font-light leading-tight mb-6"
            style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}
          >
            {post.title}
          </h1>

          <p className="text-lg leading-relaxed" style={{ color: "#2D4A5E", fontFamily: "var(--font-dm-sans)" }}>
            {post.excerpt}
          </p>
        </div>
      </section>

      {/* Author bar */}
      <section className="border-b px-6 py-4" style={{ borderColor: "#E8E4DF" }}>
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium"
            style={{ backgroundColor: "#0D1B2A", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
          >
            E
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: "#0D1B2A", fontFamily: "var(--font-dm-sans)" }}>
              Ebin Jaison
            </p>
            <p className="text-xs" style={{ color: "#9B9B9B", fontFamily: "var(--font-dm-sans)" }}>
              Founder, Prospera Properties
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-6 py-16">
        <div
          className="prose-content"
          style={{ fontFamily: "var(--font-dm-sans)", color: "#2C2C2C" }}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </article>

      {/* Bottom CTA */}
      <section className="border-t mx-6 py-16 max-w-3xl mx-auto" style={{ borderColor: "#E8E4DF" }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-light mb-4" style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}>
            Need Help With Your Property?
          </h2>
          <p className="text-sm mb-8" style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}>
            We manage rentals across London, St. Thomas, and Sarnia. Get a free, no-obligation quote.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 text-xs uppercase tracking-widest transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#0D1B2A", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
          >
            Get a Free Quote
          </Link>
        </div>
      </section>

      {/* Related posts */}
      <RelatedPosts currentSlug={slug} />
    </div>
  );
}

function RelatedPosts({ currentSlug }: { currentSlug: string }) {
  const all = getAllPosts();
  const related = all.filter((p) => p.slug !== currentSlug).slice(0, 3);
  if (related.length === 0) return null;

  return (
    <section className="py-16 px-6" style={{ backgroundColor: "#F5F0EB" }}>
      <div className="max-w-6xl mx-auto">
        <h3 className="text-2xl font-light mb-10 text-center" style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}>
          More Articles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {related.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-white border p-6 hover:shadow-md transition-shadow"
              style={{ borderColor: "#E8E4DF" }}
            >
              <span
                className="text-xs uppercase tracking-wider"
                style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
              >
                {post.category}
              </span>
              <h4
                className="text-lg font-medium mt-2 mb-2 group-hover:text-[#7B1C1C] transition-colors leading-snug"
                style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}
              >
                {post.title}
              </h4>
              <p className="text-xs" style={{ color: "#9B9B9B", fontFamily: "var(--font-dm-sans)" }}>
                {post.readTime} · {new Date(post.date).toLocaleDateString("en-CA", { month: "long", year: "numeric" })}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
