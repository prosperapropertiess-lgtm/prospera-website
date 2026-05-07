import Link from "next/link";

interface BlogNudgeProps {
  hook: string;
  title: string;
  excerpt: string;
  slug: string;
  label?: string;
}

export default function BlogNudge({
  hook,
  title,
  excerpt,
  slug,
  label = "From the blog",
}: BlogNudgeProps) {
  return (
    <Link href={`/blog/${slug}`} className="group block">
      <div
        className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5 rounded-xl border-l-4 transition-all duration-200"
        style={{
          backgroundColor: "#FFFFFF",
          borderLeftColor: "#D8D2C8",
          border: "1px solid #D8D2C8",
          borderLeft: "4px solid #D8D2C8",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}
      >
        <div className="flex-1">
          <p
            className="text-[10px] uppercase tracking-widest mb-2"
            style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}
          >
            {label}
          </p>
          <p
            className="text-lg sm:text-xl font-light italic mb-1 leading-snug"
            style={{ color: "#222222", fontFamily: "var(--font-cormorant)" }}
          >
            {hook}
          </p>
          <p
            className="text-xs leading-relaxed line-clamp-2"
            style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}
          >
            {excerpt}
          </p>
        </div>
        <div
          className="text-xs uppercase tracking-widest whitespace-nowrap flex items-center gap-2 transition-colors group-hover:text-[#8B2030]"
          style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
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
