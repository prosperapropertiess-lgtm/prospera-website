"use client";

import { useState } from "react";
import type { FaqItem } from "@/app/listings/[slug]/page";

interface Props {
  faqs: FaqItem[];
}

export default function FaqSection({ faqs }: Props) {
  const [open, setOpen] = useState<number | null>(0);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="px-5 sm:px-8 py-16" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="max-w-3xl mx-auto">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: "#999999", fontFamily: "var(--font-dm-sans)" }}
        >
          Common Questions
        </p>
        <h2
          className="text-2xl sm:text-3xl font-bold mb-10"
          style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}
        >
          Frequently Asked Questions
        </h2>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid #E8E4DE" }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors"
                style={{
                  backgroundColor: open === i ? "#F7F5F2" : "#FFFFFF",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                <span
                  className="text-sm font-semibold pr-4"
                  style={{ color: "#1F2F3A" }}
                >
                  {faq.q}
                </span>
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-transform"
                  style={{
                    backgroundColor: open === i ? "#1F2F3A" : "#F0EDE8",
                    color: open === i ? "#FAF8F5" : "#666666",
                    transform: open === i ? "rotate(45deg)" : "none",
                  }}
                >
                  +
                </span>
              </button>

              {open === i && (
                <div
                  className="px-6 pb-5"
                  style={{ backgroundColor: "#F7F5F2" }}
                >
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "#444444", fontFamily: "var(--font-dm-sans)" }}
                  >
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <p
          className="mt-8 text-sm"
          style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}
        >
          Have a question not answered here?{" "}
          <a
            href="tel:5196971227"
            className="font-semibold underline underline-offset-2 transition-opacity hover:opacity-70"
            style={{ color: "#1F2F3A" }}
          >
            Call (519) 697-1227
          </a>{" "}
          or{" "}
          <a
            href="/contact"
            className="font-semibold underline underline-offset-2 transition-opacity hover:opacity-70"
            style={{ color: "#1F2F3A" }}
          >
            send us a message
          </a>
          .
        </p>
      </div>
    </section>
  );
}
