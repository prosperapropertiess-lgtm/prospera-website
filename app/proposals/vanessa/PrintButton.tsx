"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        background: "#7B2D34",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        padding: "12px 32px",
        fontSize: "15px",
        fontWeight: 600,
        fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
        cursor: "pointer",
        letterSpacing: "0.02em",
      }}
    >
      Print / Save as PDF
    </button>
  );
}
