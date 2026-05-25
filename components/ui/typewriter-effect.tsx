"use client";

import { cn } from "@/lib/utils";
import { motion, stagger, useAnimate, useInView, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export const TypewriterEffect = ({
  words,
  className,
  cursorClassName,
}: {
  words: { text: string; className?: string }[];
  className?: string;
  cursorClassName?: string;
}) => {
  const wordsArray = words.map((word) => ({ ...word, text: word.text.split("") }));
  const [scope, animate] = useAnimate();
  const isInView = useInView(scope);

  useEffect(() => {
    if (isInView) {
      animate(
        "span",
        { display: "inline-block", opacity: 1, width: "fit-content" },
        { duration: 0.3, delay: stagger(0.1), ease: "easeInOut" }
      );
    }
  }, [isInView, animate]);

  return (
    <div className={cn("text-base sm:text-xl md:text-3xl lg:text-5xl font-bold text-center", className)}>
      <motion.div ref={scope} className="inline">
        {wordsArray.map((word, idx) => (
          <div key={`word-${idx}`} className="inline-block">
            {word.text.map((char, index) => (
              <motion.span key={`char-${index}`} className={cn("opacity-0 hidden", word.className)}>
                {char}
              </motion.span>
            ))}
            &nbsp;
          </div>
        ))}
      </motion.div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
        className={cn("inline-block rounded-sm w-[4px] h-4 md:h-6 lg:h-10", cursorClassName)}
        style={{ backgroundColor: "#8B2030" }}
      />
    </div>
  );
};

export const TypewriterEffectSmooth = ({
  words,
  className,
  cursorClassName,
}: {
  words: { text: string; className?: string }[];
  className?: string;
  cursorClassName?: string;
}) => {
  const wordsArray = words.map((word) => ({ ...word, text: word.text.split("") }));

  return (
    <div className={cn("flex space-x-1 my-6", className)}>
      <motion.div
        className="overflow-hidden pb-2"
        initial={{ width: "0%" }}
        whileInView={{ width: "fit-content" }}
        transition={{ duration: 2, ease: "linear", delay: 1 }}
      >
        <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl whitespace-nowrap" style={{ color: "rgba(250,248,245,0.82)", fontFamily: "var(--font-dm-sans)" }}>
          {wordsArray.map((word, idx) => (
            <div key={`word-${idx}`} className="inline-block">
              {word.text.map((char, index) => (
                <span key={`char-${index}`} className={cn(word.className)}>{char}</span>
              ))}
              &nbsp;
            </div>
          ))}
        </div>
      </motion.div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
        className={cn("block rounded-sm w-[4px] h-4 sm:h-6 xl:h-12", cursorClassName)}
        style={{ backgroundColor: "#8B2030" }}
      />
    </div>
  );
};

/**
 * CyclingTypewriter — slot-machine style phrase rotator.
 * Designed to sit OUTSIDE an <h1> as a sibling block element,
 * matched to the same font size via className.
 */
export const CyclingTypewriter = ({
  phrases,
  className,
  color = "rgba(250,248,245,0.28)",
}: {
  phrases: string[];
  className?: string;
  color?: string;
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % phrases.length);
    }, 3800);
    return () => clearInterval(t);
  }, [phrases.length]);

  return (
    // overflow-hidden clips the sliding animation; height = 1 line at current font size
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ height: "1.05em", lineHeight: "1.05" }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={index}
          className="absolute inset-0 block"
          style={{ color, fontFamily: "var(--font-dm-sans)" }}
          initial={{ y: "110%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-55%", opacity: 0 }}
          transition={{
            y: { duration: 0.55, ease: [0.23, 1, 0.32, 1] },
            opacity: { duration: 0.25, ease: "easeInOut" },
          }}
        >
          {phrases[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};
