"use client";
import React from "react";
import { motion } from "motion/react";

export interface Testimonial {
  text: string;
  name: string;
  role: string;
  image?: string;
}

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[...new Array(2).fill(0).map((_, index) => (
          <React.Fragment key={index}>
            {props.testimonials.map(({ text, image, name, role }, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl max-w-xs w-full"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(15,28,40,0.08)",
                  boxShadow: "0 1px 3px rgba(15,28,40,0.05), 0 6px 20px rgba(15,28,40,0.07)",
                }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <svg key={si} width="14" height="14" viewBox="0 0 24 24" fill="#8B2030">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>

                <p
                  className="text-base leading-relaxed"
                  style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
                >
                  &ldquo;{text}&rdquo;
                </p>

                <div className="flex items-center gap-3 mt-5">
                  {image ? (
                    <img
                      src={image}
                      alt={name}
                      width={36}
                      height={36}
                      className="rounded-full object-cover"
                      style={{ width: 36, height: 36, flexShrink: 0 }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                        background: "rgba(139,32,48,0.10)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 700, color: "#8B2030",
                        fontFamily: "var(--font-dm-sans)",
                      }}
                    >
                      {name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p
                      className="text-sm font-semibold leading-tight"
                      style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
                    >
                      {name}
                    </p>
                    <p
                      className="text-xs leading-tight mt-0.5"
                      style={{ color: "rgba(15,28,40,0.45)", fontFamily: "var(--font-dm-sans)" }}
                    >
                      {role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))]}
      </motion.div>
    </div>
  );
};
