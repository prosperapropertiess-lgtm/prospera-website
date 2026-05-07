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
            <span className={`text-xl transition-transform duration-200 flex-shrink-0 ${open === i ? "rotate-45" : ""}`} style={{ color: "#6A2E35" }}>+</span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <p className="pt-4 text-sm leading-relaxed" style={{ color: "#555555" }}>{item.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
