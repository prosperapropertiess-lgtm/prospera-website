import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#F7F5F2" }}
    >
      <p
        className="text-8xl font-light mb-6"
        style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
      >
        404
      </p>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-px" style={{ backgroundColor: "#8B2030" }} />
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#8B2030" }} />
        <div className="w-12 h-px" style={{ backgroundColor: "#8B2030" }} />
      </div>

      <h1
        className="text-4xl md:text-5xl font-light mb-4"
        style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
      >
        Page Not Found
      </h1>
      <p
        className="text-base mb-10 max-w-md leading-relaxed"
        style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}
      >
        The page you&apos;re looking for doesn&apos;t exist or may have moved. Let&apos;s get you back on track.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="px-8 py-3 text-xs uppercase tracking-widest rounded"
          style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
        >
          Back to Home
        </Link>
        <Link
          href="/listings"
          className="px-8 py-3 text-xs uppercase tracking-widest border rounded transition-colors hover:border-[#1F2F3A] hover:text-[#1F2F3A]"
          style={{ borderColor: "#D8D2C8", color: "#333333", fontFamily: "var(--font-dm-sans)" }}
        >
          Browse Listings
        </Link>
        <Link
          href="/contact"
          className="px-8 py-3 text-xs uppercase tracking-widest border rounded transition-colors hover:border-[#8B2030] hover:text-[#8B2030]"
          style={{ borderColor: "#8B2030", color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}
