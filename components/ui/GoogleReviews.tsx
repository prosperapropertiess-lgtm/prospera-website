"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Review {
  author: string;
  rating: number;
  text: string;
  time: string;
}

interface ReviewsData {
  reviews: Review[];
  rating: number;
  total: number;
}

const GOOGLE_REVIEWS_URL = "https://share.google/6dnxCrZ6UWnMSyPA2";

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < count ? "#C5A55A" : "rgba(197,165,90,0.25)"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function GoogleReviews() {
  const [data, setData] = useState<ReviewsData | null>(null);
  const [current, setCurrent] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/google-reviews")
      .then((r) => r.json())
      .then((d) => {
        if (d.reviews?.length) setData(d);
        else setError(true);
      })
      .catch(() => setError(true));
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + (data?.reviews.length || 1)) % (data?.reviews.length || 1));
  const next = () => setCurrent((c) => (c + 1) % (data?.reviews.length || 1));

  // Fallback when API not configured or failed
  if (error || (!data && typeof window !== "undefined")) {
    return (
      <div className="text-center py-8">
        <div className="flex justify-center gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="#C5A55A">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
        <p className="font-[family-name:var(--font-cormorant)] text-3xl text-[#FAF8F5] mb-3">
          20+ five-star reviews
        </p>
        <p className="text-sm text-[#8899AA] mb-6">See what landlords and tenants say about working with Prospera.</p>
        <a
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-widest font-semibold rounded-xl transition-opacity hover:opacity-80"
          style={{ backgroundColor: "#C5A55A", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
        >
          Read Our Google Reviews
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-[#C5A55A] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  const review = data.reviews[current];

  return (
    <div>
      {/* Aggregate score */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <Stars count={Math.round(data.rating)} />
        <span className="font-[family-name:var(--font-cormorant)] text-3xl text-[#FAF8F5]">{data.rating.toFixed(1)}</span>
        <a
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#5A7090] hover:text-[#C5A55A] transition-colors underline"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          {data.total} Google reviews
        </a>
      </div>

      {/* Carousel */}
      <div className="relative min-h-[200px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <Stars count={review.rating} />
            <p className="font-[family-name:var(--font-cormorant)] text-xl sm:text-2xl font-light leading-relaxed my-6 text-[#FAF8F5]">
              &ldquo;{review.text}&rdquo;
            </p>
            <p className="text-xs uppercase tracking-widest text-[#C5A55A]" style={{ fontFamily: "var(--font-dm-sans)" }}>
              {review.author}
            </p>
            <p className="text-xs text-[#5A7090] mt-1" style={{ fontFamily: "var(--font-dm-sans)" }}>
              {review.time} · Google
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mt-10">
        <button onClick={prev} className="w-10 h-10 flex items-center justify-center border border-[#1E3050] text-[#FAF8F5] hover:border-[#C5A55A] transition-colors rounded-lg" aria-label="Previous">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div className="flex gap-2">
          {data.reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="w-2 h-2 rounded-full transition-all duration-200"
              style={{ backgroundColor: i === current ? "#C5A55A" : "rgba(197,165,90,0.25)", transform: i === current ? "scale(1.3)" : "scale(1)" }}
            />
          ))}
        </div>
        <button onClick={next} className="w-10 h-10 flex items-center justify-center border border-[#1E3050] text-[#FAF8F5] hover:border-[#C5A55A] transition-colors rounded-lg" aria-label="Next">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>

      {/* Link to Google */}
      <div className="text-center mt-8">
        <a
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#5A7090] hover:text-[#C5A55A] transition-colors"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          See all reviews on Google →
        </a>
      </div>
    </div>
  );
}
