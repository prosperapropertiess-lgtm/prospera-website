"use client";
import { NAVY, BURGUNDY, WHITE, BORDER, BODY_FONT } from "../tokens";

interface Props {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function Chip({ label, selected, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
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
        transition: "all 0.15s ease",
      }}
    >
      {label}
    </button>
  );
}
