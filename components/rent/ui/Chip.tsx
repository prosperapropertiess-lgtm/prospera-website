"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { NAVY, BURGUNDY, WHITE, BORDER, BODY_FONT } from "../tokens";

interface Props {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function Chip({ label, selected, onClick }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      animate={selected ? { scale: [1, 1.08, 1] } : { scale: 1 }}
      transition={selected ? { duration: 0.3, times: [0, 0.4, 1], ease: "easeOut" } : { type: "spring", stiffness: 400, damping: 22 }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        borderRadius: 999,
        border: `1.5px solid ${selected ? BURGUNDY : BORDER}`,
        backgroundColor: selected ? BURGUNDY : WHITE,
        color: selected ? WHITE : NAVY,
        padding: "11px 18px",
        fontSize: 14,
        fontWeight: 600,
        fontFamily: BODY_FONT,
        cursor: "pointer",
        minHeight: 44,
        boxShadow: selected ? "0 3px 10px rgba(139,32,48,0.28)" : "none",
        transition: "background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.2s ease, color 0.15s ease",
      }}
    >
      <AnimatePresence mode="popLayout">
        {selected && (
          <motion.span
            initial={{ scale: 0, width: 0 }}
            animate={{ scale: 1, width: "auto" }}
            exit={{ scale: 0, width: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            style={{ display: "flex", overflow: "hidden" }}
          >
            <Check size={14} strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>
      {label}
    </motion.button>
  );
}
