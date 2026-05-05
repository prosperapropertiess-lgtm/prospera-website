import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#0A1628" }}
    >
      <p
        className="text-8xl font-light mb-6"
        style={{ color: "#E8E4DF", fontFamily: "var(--font-cormorant)" }}
      >
        404
      </p>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-px" style={{ backgroundColor: "#C5A55A" }} />
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#C5A55A" }} />
        <div className="w-12 h-px" style={{ backgroundColor: "#C5A55A" }} />
      </div>

      <h1
        className="text-4xl md:text-5xl font-light mb-4"
        style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
      >
        Page Not Found
      </h1>
      <p
        className="text-base mb-10 max-w-md leading-relaxed"
        style={{ color: "#C0CAD4", fontFamily: "var(--font-dm-sans)" }}
      >
        The page you're looking for doesn't exist or may have moved. Let's get you back on track.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="px-8 py-3 text-xs uppercase tracking-widest transition-opacity hover:opacity-80"
          style={{ backgroundColor: "#8B1A1A", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
        >
          Back to Home
        </Link>
        <Link
          href="/listings"
          className="px-8 py-3 text-xs uppercase tracking-widest border transition-colors hover:bg-[#060E1C] hover:text-[#FAF8F5]"
          style={{ borderColor: "#1E3050", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
        >
          Browse Listings
        </Link>
        <Link
          href="/contact"
          className="px-8 py-3 text-xs uppercase tracking-widest border transition-colors hover:bg-[#C5A55A] hover:text-[#FAF8F5] hover:border-[#C5A55A]"
          style={{ borderColor: "#C5A55A", color: "#C5A55A", fontFamily: "var(--font-dm-sans)" }}
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}
