import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#FAF8F5" }}
    >
      <p
        className="text-8xl font-light mb-6"
        style={{ color: "#E8E4DF", fontFamily: "var(--font-cormorant)" }}
      >
        404
      </p>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-px" style={{ backgroundColor: "#7B1C1C" }} />
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#7B1C1C" }} />
        <div className="w-12 h-px" style={{ backgroundColor: "#7B1C1C" }} />
      </div>

      <h1
        className="text-4xl md:text-5xl font-light mb-4"
        style={{ color: "#0A1628", fontFamily: "var(--font-cormorant)" }}
      >
        Page Not Found
      </h1>
      <p
        className="text-base mb-10 max-w-md leading-relaxed"
        style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}
      >
        The page you're looking for doesn't exist or may have moved. Let's get you back on track.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="px-8 py-3 text-xs uppercase tracking-widest transition-opacity hover:opacity-80"
          style={{ backgroundColor: "#0A1628", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
        >
          Back to Home
        </Link>
        <Link
          href="/listings"
          className="px-8 py-3 text-xs uppercase tracking-widest border transition-colors hover:bg-[#0A1628] hover:text-[#FAF8F5]"
          style={{ borderColor: "#0A1628", color: "#0A1628", fontFamily: "var(--font-dm-sans)" }}
        >
          Browse Listings
        </Link>
        <Link
          href="/contact"
          className="px-8 py-3 text-xs uppercase tracking-widest border transition-colors hover:bg-[#7B1C1C] hover:text-[#FAF8F5] hover:border-[#7B1C1C]"
          style={{ borderColor: "#7B1C1C", color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}
