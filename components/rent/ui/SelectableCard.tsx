"use client";
import { motion } from "framer-motion";
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
      whileTap={{ scale: 0.97 }}
      animate={{ y: selected ? -2 : 0 }}
      transition={{ duration: 0.15 }}
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
        transition: "border-color 0.15s ease, background-color 0.15s ease",
      }}
    >
      <span style={{ fontSize: compact ? 15 : 16, fontWeight: 600, color: NAVY }}>{label}</span>
      {order != null ? (
        <span
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
        </span>
      ) : selected ? (
        <Check size={18} color={BURGUNDY} strokeWidth={2.5} />
      ) : null}
    </motion.button>
  );
}
