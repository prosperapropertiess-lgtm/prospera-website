import Link from "next/link";

interface BlogNudgeProps {
  hook: string;        // emotional question / hook
  title: string;       // blog post title
  excerpt: string;     // 1 sentence from the post
  slug: string;        // blog post slug
  label?: string;      // optional label override
}

export default function BlogNudge({
  hook,
  title,
  excerpt,
  slug,
  label = "From the blog",
}: BlogNudgeProps) {
  return (
    <Link
      href={`/blog/${slug}`}
      className="group block"
    >
      <div
        className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5 rounded-xl border-l-2 transition-all duration-200 group-hover:border-[#C5A55A]"
        style={{
          backgroundColor: "#0D1B2A",
          borderColor: "rgba(197,165,90,0.4)",
          borderTop: "1px solid #1E3050",
          borderRight: "1px solid #1E3050",
          borderBottom: "1px solid #1E3050",
        }}
      >
        <div className="flex-1">
          <p
            className="text-[10px] uppercase tracking-widest mb-2"
            style={{ color: "#C5A55A", fontFamily: "var(--font-dm-sans)" }}
          >
            {label}
          </p>
          <p
            className="text-lg sm:text-xl font-light italic mb-1 leading-snug text-[#FAF8F5]"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            {hook}
          </p>
          <p
            className="text-xs text-[#8098B4] leading-relaxed line-clamp-2"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            {excerpt}
          </p>
        </div>
        <div
          className="text-xs uppercase tracking-widest whitespace-nowrap flex items-center gap-2 transition-colors group-hover:text-[#C5A55A]"
          style={{ color: "#8098B4", fontFamily: "var(--font-dm-sans)" }}
        >
          Read more
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="transition-transform group-hover:translate-x-1">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
