"use client";
import { Minus, Plus } from "lucide-react";
import { NAVY, BURGUNDY, WHITE, BORDER, HEADING_FONT, BODY_FONT } from "../tokens";

interface Props {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label: string;
}

export function Counter({ value, onChange, min = 1, max = 10, label }: Props) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 28 }}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          border: `1.5px solid ${BORDER}`,
          backgroundColor: WHITE,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          opacity: value <= min ? 0.35 : 1,
        }}
        aria-label="Decrease"
      >
        <Minus size={20} color={NAVY} />
      </button>

      <div style={{ textAlign: "center", minWidth: 110 }}>
        <p style={{ fontFamily: HEADING_FONT, fontSize: 44, fontWeight: 700, color: NAVY, margin: 0, lineHeight: 1 }}>{value}</p>
        <p style={{ fontFamily: BODY_FONT, fontSize: 13, color: NAVY, opacity: 0.6, margin: "4px 0 0" }}>{label}</p>
      </div>

      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          border: "none",
          backgroundColor: BURGUNDY,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          opacity: value >= max ? 0.35 : 1,
        }}
        aria-label="Increase"
      >
        <Plus size={20} color={WHITE} />
      </button>
    </div>
  );
}
