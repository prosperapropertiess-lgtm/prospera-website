import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { marked } from "marked";
import { getAllPosts, getPost } from "@/lib/blog";
import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import BlogSubscribeForm from "@/components/blog/BlogSubscribeForm";
import ShareButtons from "@/components/blog/ShareButtons";

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
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `https://www.prosperaproperties.co/blog/${slug}`,
      siteName: "Prospera Properties",
      images: post.featuredImage ? [{ url: post.featuredImage }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage ? [post.featuredImage] : [],
    },
  };
}

const categoryColors: Record<string, string> = {
  "Landlord Tips": "bg-[#0D1B2A] text-[#FAF8F5]",
  "Tenant Resources": "bg-[#2D4A5E] text-[#FAF8F5]",
  "Market Updates": "bg-[#7B1C1C] text-[#FAF8F5]",
  "Ontario Law": "bg-[#4A4A4A] text-[#FAF8F5]",
};

function splitAtMidpoint(html: string): [string, string] {
  const parts = html.split("</p>");
  if (parts.length < 4) return [html, ""];
  const mid = Math.floor(parts.length / 2);
  return [
    parts.slice(0, mid).join("</p>") + "</p>",
    parts.slice(mid).join("</p>"),
  ];
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const htmlContent = await marked(post.content);
  const [firstHalf, secondHalf] = splitAtMidpoint(htmlContent);
  const postUrl = `https://www.prosperaproperties.co/blog/${slug}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    image: post.featuredImage ?? undefined,
    author: {
      "@type": "Person",
      name: "Ebin Jaison",
      jobTitle: "Founder, Prospera Properties",
    },
    publisher: {
      "@type": "Organization",
      name: "Prospera Properties",
      url: "https://www.prosperaproperties.co",
    },
    url: postUrl,
    mainEntityOfPage: postUrl,
  };

  return (
    <div style={{ backgroundColor: "#FAF8F5" }} className="min-h-screen">
      <JsonLd data={schema} />

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

      {/* Hero image */}
      {post.featuredImage && (
        <div className="relative w-full h-72 md:h-96 overflow-hidden">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 60%, rgba(250,248,245,0.4) 100%)" }} />
        </div>
      )}

      {/* Author + share bar */}
      <section className="border-b px-6 py-4" style={{ borderColor: "#E8E4DF" }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
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
          <ShareButtons url={postUrl} title={post.title} />
        </div>
      </section>

      {/* Content — split with mid-post subscribe form */}
      <article className="max-w-3xl mx-auto px-6 py-16">
        <div
          className="prose-content"
          style={{ fontFamily: "var(--font-dm-sans)", color: "#2C2C2C" }}
          dangerouslySetInnerHTML={{ __html: firstHalf }}
        />

        {secondHalf && <BlogSubscribeForm midPost />}

        {secondHalf && (
          <div
            className="prose-content"
            style={{ fontFamily: "var(--font-dm-sans)", color: "#2C2C2C" }}
            dangerouslySetInnerHTML={{ __html: secondHalf }}
          />
        )}

        {/* Share again at end of article */}
        <div className="mt-12 pt-8 border-t" style={{ borderColor: "#E8E4DF" }}>
          <ShareButtons url={postUrl} title={post.title} />
        </div>
      </article>

      {/* End-of-post subscribe form */}
      <BlogSubscribeForm />

      {/* Bottom CTA */}
      <section className="px-6 py-16" style={{ borderColor: "#E8E4DF" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-light mb-4" style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}>
            Need Help With Your Property?
          </h2>
          <p className="text-sm mb-8" style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}>
            We manage rentals across London, St. Thomas, and Strathroy. Get a free, no-obligation quote.
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
