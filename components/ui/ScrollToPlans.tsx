"use client";

export default function ScrollToPlans() {
  return (
    <button
      onClick={() => {
        document.getElementById("plans")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        fontFamily: "var(--font-dm-sans)",
        fontSize: "13px",
        color: "rgba(250,248,245,0.55)",
        textDecoration: "none",
        borderBottom: "1px solid rgba(250,248,245,0.25)",
        paddingBottom: "2px",
      }}
    >
      See the plans ↓
    </button>
  );
}
