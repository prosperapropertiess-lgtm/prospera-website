import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { marked } from "marked";
import { getAllPosts, getPost } from "@/lib/blog";
import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import BlogSubscribeForm from "@/components/blog/BlogSubscribeForm";
import ShareButtons from "@/components/blog/ShareButtons";
import ViewCounter from "@/components/blog/ViewCounter";
import TableOfContents from "@/components/blog/TableOfContents";

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
    title: { absolute: post.title },
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
  "Landlord Tips": "bg-[#8B2030] text-[#FAF8F5]",
  "Tenant Resources": "bg-[#1F2F3A] text-[#FAF8F5]",
  "Market Updates": "bg-[#8B2030] text-[#FAF8F5]",
  "Ontario Law": "bg-[#555555] text-[#FAF8F5]",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[*_`[\]()]/g, "") // strip markdown formatting chars
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractHeadings(markdown: string) {
  return [...markdown.matchAll(/^(#{2,3})\s+(.+)$/gm)].map((m) => {
    const text = m[2].trim().replace(/\*\*(.+?)\*\*/g, "$1").replace(/`(.+?)`/g, "$1");
    return { level: m[1].length, text, id: slugify(text) };
  });
}

function addHeadingIds(html: string): string {
  return html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_, level, inner) => {
    const plainText = inner.replace(/<[^>]+>/g, "");
    const id = slugify(plainText);
    return `<h${level} id="${id}">${inner}</h${level}>`;
  });
}

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

  const headings = extractHeadings(post.content);
  const rawHtml = await marked(post.content);
  const htmlContent = addHeadingIds(rawHtml);
  const [firstHalf, secondHalf] = splitAtMidpoint(htmlContent);
  const postUrl = `https://www.prosperaproperties.co/blog/${slug}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    image: post.featuredImage
      ? { "@type": "ImageObject", url: post.featuredImage }
      : undefined,
    author: {
      "@type": "Person",
      name: "Ebin Jaison",
      url: "https://www.prosperaproperties.co/about",
    },
    publisher: {
      "@type": "Organization",
      name: "Prospera Properties",
      url: "https://www.prosperaproperties.co",
      logo: {
        "@type": "ImageObject",
        url: "https://www.prosperaproperties.co/icon.png",
      },
    },
    url: postUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
  };

  return (
    <div style={{ backgroundColor: "#F7F5F2" }} className="min-h-screen">
      <JsonLd data={schema} />

      {/* Hero */}
      <section className="pt-32 pb-12 px-6" style={{ backgroundColor: "#1F2F3A" }}>
        <div className="max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest mb-8 hover:opacity-70 transition-opacity"
            style={{ color: "rgba(250,248,245,0.6)", fontFamily: "var(--font-dm-sans)" }}
          >
            ← Back to Blog
          </Link>

          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <span
              className={`text-xs uppercase tracking-wider px-2 py-1 rounded ${categoryColors[post.category] ?? "bg-[#8B2030] text-[#FAF8F5]"}`}
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {post.category}
            </span>
            <span className="text-xs" style={{ color: "rgba(250,248,245,0.75)", fontFamily: "var(--font-dm-sans)" }}>
              {post.readTime}
            </span>
            <span className="text-xs" style={{ color: "rgba(250,248,245,0.75)", fontFamily: "var(--font-dm-sans)" }}>
              {new Date(post.date).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}
            </span>
            <ViewCounter slug={slug} />
          </div>

          <h1
            className="text-4xl md:text-5xl font-light leading-tight mb-6"
            style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
          >
            {post.title}
          </h1>

          <p className="text-lg leading-relaxed" style={{ color: "rgba(250,248,245,0.7)", fontFamily: "var(--font-dm-sans)" }}>
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
        </div>
      )}

      {/* Author + share bar */}
      <section className="border-b px-6 py-4" style={{ borderColor: "#D8D2C8", backgroundColor: "#FFFFFF" }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium"
              style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
            >
              E
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "#222222", fontFamily: "var(--font-dm-sans)" }}>
                Ebin Jaison
              </p>
              <p className="text-xs" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
                Founder, Prospera Properties
              </p>
            </div>
          </div>
          <ShareButtons url={postUrl} title={post.title} />
        </div>
      </section>

      {/* Content + ToC sidebar */}
      <div className="max-w-5xl mx-auto px-6 py-16 xl:grid xl:grid-cols-[1fr_220px] xl:gap-12" style={{ backgroundColor: "#F7F5F2" }}>
        <article>
          <div
            className="prose-content"
            style={{ fontFamily: "var(--font-dm-sans)", color: "#333333" }}
            dangerouslySetInnerHTML={{ __html: firstHalf }}
          />

          {secondHalf && <BlogSubscribeForm midPost category={post.category} />}

          {secondHalf && (
            <div
              className="prose-content"
              style={{ fontFamily: "var(--font-dm-sans)", color: "#333333" }}
              dangerouslySetInnerHTML={{ __html: secondHalf }}
            />
          )}

          {/* Share again at end of article */}
          <div className="mt-12 pt-8 border-t" style={{ borderColor: "#D8D2C8" }}>
            <ShareButtons url={postUrl} title={post.title} />
          </div>
        </article>

        <TableOfContents headings={headings} />
      </div>

      {/* End-of-post subscribe form */}
      <BlogSubscribeForm category={post.category} />

      {/* Bottom CTA */}
      <section className="px-6 py-16" style={{ backgroundColor: "#1F2F3A" }}>
        <div className="max-w-3xl mx-auto text-center">
          {post.category === "Renter Guides" || post.category === "Tenant Tips" ? (
            <>
              <h2 className="text-3xl font-light mb-4" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
                Looking for a rental in London, Ontario?
              </h2>
              <p className="text-sm mb-8" style={{ color: "rgba(250,248,245,0.8)", fontFamily: "var(--font-dm-sans)" }}>
                Browse available units or get notified when something new comes open. Fast responses, professional management.
              </p>
              <Link
                href="/listings"
                className="inline-block px-8 py-3 text-xs uppercase tracking-widest rounded"
                style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
              >
                View Available Rentals
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-light mb-4" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
                Need Help With Your Property?
              </h2>
              <p className="text-sm mb-8" style={{ color: "rgba(250,248,245,0.8)", fontFamily: "var(--font-dm-sans)" }}>
                We manage rentals across London, St. Thomas, and Strathroy. Get a free, no-obligation quote.
              </p>
              <Link
                href="/contact"
                className="inline-block px-8 py-3 text-xs uppercase tracking-widest rounded"
                style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
              >
                Get a Free Quote
              </Link>
            </>
          )}
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
    <section className="py-16 px-6" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="max-w-6xl mx-auto">
        <h3 className="text-2xl font-light mb-10 text-center" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
          More Articles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {related.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-white border rounded-xl p-6 hover:shadow-md transition-shadow"
              style={{ borderColor: "#D8D2C8" }}
            >
              <span
                className="text-xs uppercase tracking-wider"
                style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}
              >
                {post.category}
              </span>
              <h4
                className="text-lg font-medium mt-2 mb-2 group-hover:text-[#8B2030] transition-colors leading-snug"
                style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
              >
                {post.title}
              </h4>
              <p className="text-xs" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
                {post.readTime} · {new Date(post.date).toLocaleDateString("en-CA", { month: "long", year: "numeric" })}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
