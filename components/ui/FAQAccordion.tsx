"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQ {
  q: string;
  a: string;
}

export default function FAQAccordion({ items }: { items: FAQ[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="divide-y" style={{ borderColor: "#D8D2C8" }}>
      {items.map((item, i) => (
        <div key={i} className="py-5">
          <button
            className="flex w-full items-center justify-between text-left gap-4"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="font-medium text-sm md:text-base" style={{ color: "#222222" }}>{item.q}</span>
            <motion.span
              animate={{ rotate: open === i ? 45 : 0 }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
              className="text-xl flex-shrink-0"
              style={{ color: "#8B2030", display: "inline-block" }}
            >
              +
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  height: { duration: 0.22, ease: [0.23, 1, 0.32, 1] },
                  opacity: { duration: 0.18, ease: "linear" },
                }}
                className="overflow-hidden"
              >
                <p className="pt-4 text-sm leading-relaxed" style={{ color: "#333333" }}>{item.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
