"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { NAVY, BURGUNDY, WHITE, BORDER, BODY_FONT } from "../tokens";

interface Props {
  label: string;
  selected: boolean;
  onClick: () => void;
  order?: number;
  compact?: boolean;
}

export function SelectableCard({ label, selected, onClick, order, compact }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      animate={selected ? { scale: [1, 1.04, 1], y: -2 } : { scale: 1, y: 0 }}
      transition={selected ? { duration: 0.32, times: [0, 0.4, 1], ease: "easeOut" } : { type: "spring", stiffness: 400, damping: 25 }}
      style={{
        width: "100%",
        textAlign: "left",
        borderRadius: 14,
        border: `1.5px solid ${selected ? BURGUNDY : BORDER}`,
        backgroundColor: selected ? "rgba(139,32,48,0.06)" : WHITE,
        padding: compact ? "14px 18px" : "18px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        cursor: "pointer",
        minHeight: 48,
        fontFamily: BODY_FONT,
        boxShadow: selected ? "0 4px 14px rgba(139,32,48,0.18)" : "0 1px 2px rgba(0,0,0,0.02)",
        transition: "border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.25s ease",
      }}
    >
      <span style={{ fontSize: compact ? 15 : 16, fontWeight: 600, color: NAVY }}>{label}</span>
      <AnimatePresence mode="wait">
        {order != null ? (
          <motion.span
            key="order"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            style={{
              flexShrink: 0,
              width: 26,
              height: 26,
              borderRadius: "50%",
              backgroundColor: BURGUNDY,
              color: WHITE,
              fontSize: 13,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {order}
          </motion.span>
        ) : selected ? (
          <motion.span
            key="check"
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            style={{ display: "flex" }}
          >
            <Check size={18} color={BURGUNDY} strokeWidth={2.5} />
          </motion.span>
        ) : null}
      </AnimatePresence>
    </motion.button>
  );
}
