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
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < count ? "#8B2030" : "rgba(139,32,48,0.2)"}>
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

  function handleDragEnd(_: unknown, info: { offset: { x: number }; velocity: { x: number } }) {
    const swipe = info.offset.x + info.velocity.x * 0.3;
    if (swipe < -40) next();
    else if (swipe > 40) prev();
  }

  return (
    <div>
      {/* Aggregate score */}
      <div className="flex items-center justify-center gap-3 mb-12">
        <Stars count={5} />
        <span
          className="text-2xl font-light text-[#1F2F3A]"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          {data.rating.toFixed(1)}
        </span>
        <a
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#999999] hover:text-[#8B2030] transition-colors underline"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          {data.total}+ Google reviews
        </a>
      </div>

      {/* Swipeable review card */}
      <div className="relative min-h-[200px] overflow-hidden touch-pan-y">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="text-center cursor-grab active:cursor-grabbing select-none"
          >
            <Stars count={review.rating} />
            <p
              className="text-xl sm:text-2xl font-light leading-relaxed my-6 text-[#1F2F3A]"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              &ldquo;{review.text}&rdquo;
            </p>
            <p
              className="text-xs uppercase tracking-widest"
              style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
            >
              {review.author}
            </p>
            <p
              className="text-xs text-[#888888] mt-1"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {review.time} · Google
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Swipe hint — mobile only, fades after first swipe */}
      <p className="sm:hidden text-center text-xs mt-4" style={{ color: "#D8D2C8", fontFamily: "var(--font-dm-sans)" }}>
        ← swipe to browse →
      </p>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mt-6">
        <button
          onClick={prev}
          className="review-nav-btn w-10 h-10 flex items-center justify-center border border-[#D8D2C8] text-[#1F2F3A] rounded-lg"
          aria-label="Previous"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Dots */}
        <div className="flex gap-2">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: i === current ? "#8B2030" : "rgba(139,32,48,0.2)",
                transform: i === current ? "scale(1.3)" : "scale(1)",
                transition: "transform 200ms cubic-bezier(0.23,1,0.32,1), background-color 200ms cubic-bezier(0.23,1,0.32,1)",
              }}
              aria-label={`Review ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="review-nav-btn w-10 h-10 flex items-center justify-center border border-[#D8D2C8] text-[#1F2F3A] rounded-lg"
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
          className="text-xs text-[#888888] hover:text-[#8B2030] transition-colors"
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
