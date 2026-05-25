"use client";

import { cn } from "@/lib/utils";
import { motion, stagger, useAnimate, useInView, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export const TypewriterEffect = ({
  words,
  className,
  cursorClassName,
}: {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
}) => {
  const wordsArray = words.map((word) => ({
    ...word,
    text: word.text.split(""),
  }));

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

  const renderWords = () => (
    <motion.div ref={scope} className="inline">
      {wordsArray.map((word, idx) => (
        <div key={`word-${idx}`} className="inline-block">
          {word.text.map((char, index) => (
            <motion.span
              initial={{}}
              key={`char-${index}`}
              className={cn("opacity-0 hidden", word.className)}
            >
              {char}
            </motion.span>
          ))}
          &nbsp;
        </div>
      ))}
    </motion.div>
  );

  return (
    <div className={cn("text-base sm:text-xl md:text-3xl lg:text-5xl font-bold text-center", className)}>
      {renderWords()}
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

// Cycling typewriter — rotates through phrases continuously
export const CyclingTypewriter = ({
  phrases,
  className,
}: {
  phrases: string[];
  className?: string;
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Hold each phrase: type duration (~2s) + read time (2s) = 4.5s total
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % phrases.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [phrases.length]);

  return (
    <div className={cn("overflow-hidden", className)} style={{ height: "1.2em" }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
          className="block"
          style={{ color: "rgba(250,248,245,0.28)", fontFamily: "var(--font-dm-sans)" }}
        >
          {phrases[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export const TypewriterEffectSmooth = ({
  words,
  className,
  cursorClassName,
}: {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
}) => {
  const wordsArray = words.map((word) => ({
    ...word,
    text: word.text.split(""),
  }));

  const renderWords = () => (
    <div>
      {wordsArray.map((word, idx) => (
        <div key={`word-${idx}`} className="inline-block">
          {word.text.map((char, index) => (
            <span key={`char-${index}`} className={cn(word.className)}>
              {char}
            </span>
          ))}
          &nbsp;
        </div>
      ))}
    </div>
  );

  return (
    <div className={cn("flex space-x-1 my-6", className)}>
      <motion.div
        className="overflow-hidden pb-2"
        initial={{ width: "0%" }}
        whileInView={{ width: "fit-content" }}
        transition={{ duration: 2, ease: "linear", delay: 1 }}
      >
        <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl whitespace-nowrap" style={{ color: "rgba(250,248,245,0.82)", fontFamily: "var(--font-dm-sans)" }}>
          {renderWords()}
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
