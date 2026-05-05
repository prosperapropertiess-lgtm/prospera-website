"use client";

import { useState } from "react";
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

const GOOGLE_REVIEWS_URL = "https://share.google/Zicj8qNuNcLhLhqvf";

const STATIC_REVIEWS: Review[] = [
  {
    author: "Gilsy Sebastian",
    rating: 5,
    text: "Very efficient, professional and promising agent. Highly recommended if anyone looking for property management or rent services.",
    time: "4 weeks ago",
  },
  {
    author: "Manjit Singh",
    rating: 5,
    text: "Thank you for the seamless work. Your staging advice and regular updates made all the difference. I'll be sure to recommend you.",
    time: "5 weeks ago",
  },
  {
    author: "Ryan",
    rating: 5,
    text: "Really smooth renting experience. The team was helpful and responsive — highly recommend!",
    time: "15 weeks ago",
  },
  {
    author: "Nahala Naushad",
    rating: 5,
    text: "I found my new home near my workplace with the help of Prospera Properties, and it was a great experience. Ebin was very friendly, responsive, and always available to answer my questions. The house he showed me was exactly what I was looking for. Highly recommend.",
    time: "17 weeks ago",
  },
  {
    author: "Anna Shaji",
    rating: 5,
    text: "It was confusing to find a bachelor's as a new Western student. Prospera helped narrow things down and made the process easier. Communication was clear and everything went smoothly.",
    time: "18 weeks ago",
  },
  {
    author: "Bibin Sebastian",
    rating: 5,
    text: "Ebin's communication was consistently prompt, clear, and proactive, keeping us informed at every stage. We particularly valued his honest advice and genuine commitment to finding the perfect place. I would recommend his services without hesitation to anyone seeking a professional and results-driven person.",
    time: "18 weeks ago",
  },
  {
    author: "Aarsha Jerome",
    rating: 5,
    text: "Prospera Properties did a great job helping me find a private room. The process was smooth, professional, and stress-free. Communication was clear, and everything matched what was advertised. I would definitely recommend Prospera Properties to anyone looking for a rental.",
    time: "19 weeks ago",
  },
  {
    author: "Aadhil T Mujeeb",
    rating: 5,
    text: "Overall a great experience. Super easy to deal with and quick to respond whenever I needed something.",
    time: "19 weeks ago",
  },
  {
    author: "Christaline",
    rating: 5,
    text: "Honestly had a good experience. Any time I reached out, they got back to me quick.",
    time: "19 weeks ago",
  },
  {
    author: "Clibert Devassy",
    rating: 5,
    text: "Delivers exceptional service — punctual, reliable, and always accessible. His professionalism and dedication give us complete peace of mind. Highly recommended.",
    time: "19 weeks ago",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex justify-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < count ? "#C5A55A" : "rgba(197,165,90,0.2)"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function Carousel({ data }: { data: ReviewsData }) {
  const [current, setCurrent] = useState(0);
  const reviews = data.reviews;

  const prev = () => setCurrent((c) => (c - 1 + reviews.length) % reviews.length);
  const next = () => setCurrent((c) => (c + 1) % reviews.length);

  const review = reviews[current];

  return (
    <div>
      {/* Aggregate score */}
      <div className="flex items-center justify-center gap-3 mb-12">
        <Stars count={5} />
        <span
          className="text-2xl font-light text-[#FAF8F5]"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          {data.rating.toFixed(1)}
        </span>
        <a
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#8098B4] hover:text-[#C5A55A] transition-colors underline"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          {data.total}+ Google reviews
        </a>
      </div>

      {/* Review card */}
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
            <p
              className="text-xl sm:text-2xl font-light leading-relaxed my-6 text-[#FAF8F5]"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              &ldquo;{review.text}&rdquo;
            </p>
            <p
              className="text-xs uppercase tracking-widest text-[#C5A55A]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {review.author}
            </p>
            <p
              className="text-xs text-[#8098B4] mt-1"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {review.time} · Google
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mt-10">
        <button
          onClick={prev}
          className="w-10 h-10 flex items-center justify-center border border-[#1E3050] text-[#FAF8F5] hover:border-[#C5A55A] transition-colors rounded-lg"
          aria-label="Previous"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Dots on sm+, counter on mobile */}
        <div className="hidden sm:flex gap-2">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="w-2 h-2 rounded-full transition-all duration-200"
              style={{
                backgroundColor: i === current ? "#C5A55A" : "rgba(197,165,90,0.25)",
                transform: i === current ? "scale(1.3)" : "scale(1)",
              }}
              aria-label={`Review ${i + 1}`}
            />
          ))}
        </div>
        <p
          className="sm:hidden text-xs tabular-nums"
          style={{ color: "#8098B4", fontFamily: "var(--font-dm-sans)" }}
        >
          {current + 1} / {reviews.length}
        </p>

        <button
          onClick={next}
          className="w-10 h-10 flex items-center justify-center border border-[#1E3050] text-[#FAF8F5] hover:border-[#C5A55A] transition-colors rounded-lg"
          aria-label="Next"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Link to Google */}
      <div className="text-center mt-8">
        <a
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#8098B4] hover:text-[#C5A55A] transition-colors"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          See all reviews on Google →
        </a>
      </div>
    </div>
  );
}

export default function GoogleReviews() {
  return (
    <Carousel
      data={{ reviews: STATIC_REVIEWS, rating: 5.0, total: 20 }}
    />
  );
}
