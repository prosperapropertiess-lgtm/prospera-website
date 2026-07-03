// CSS-only scroll progress bar using animation-timeline: scroll().
// No JS, no framer-motion, no scroll listeners — zero runtime cost.
// Browsers that don't support animation-timeline simply won't show it
// (it's a 2px decorative bar — not worth a JS fallback).

export default function ScrollProgress() {
  return (
    <>
      <style>{`
        @supports (animation-timeline: scroll()) {
          .scroll-progress-bar {
            animation: scroll-progress-grow linear;
            animation-timeline: scroll();
          }
        }
        @keyframes scroll-progress-grow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>
      <div
        className="scroll-progress-bar fixed top-20 left-0 right-0 z-[200] origin-left pointer-events-none"
        style={{ backgroundColor: "#8B2030", height: "2px", transform: "scaleX(0)" }}
      />
    </>
  );
}
