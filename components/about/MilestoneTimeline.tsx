"use client";

import { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";

const milestones = [
  {
    era: "Age 16",
    location: "India",
    icon: "01",
    title: "First Business",
    desc: "Started a business from nothing. Built it. Sold it. The real lesson wasn't the money. It was learning that you figure things out by doing them, not by waiting until you feel ready.",
  },
  {
    era: "Age 18",
    location: "India",
    icon: "02",
    title: "Digital Marketing Agency",
    desc: "Built a marketing agency and ran it for two years. That's where I learned how to position something, tell a story, and get people to pay attention. That brain followed me to Canada.",
  },
  {
    era: "Age 20",
    location: "Canada",
    icon: "03",
    title: "International Student",
    desc: "Landed in Canada with a plan to keep costs low. Signed a $3,200/month house under my own name, moved into one room, and rented the rest to students who barely knew each other.",
  },
  {
    era: "2022–2024",
    location: "The Real Education",
    icon: "04",
    title: "The Chaotic House",
    desc: "Late rent. Broken things. Constant churn. Got the flooring redone mid-tenancy while still studying full time. I genuinely laugh about it now. But that chaos taught me more about tenants than any course ever could.",
  },
  {
    era: "2023",
    location: "Ontario",
    icon: "05",
    title: "Department Manager",
    desc: "Got hired at the highest-volume grocery store in Ontario. 600+ labour hours a week: people, pressure, logistics all at once. Still do it. Taught me that systems are what separate good from bad.",
  },
  {
    era: "March 2025",
    location: "London, ON",
    icon: "06",
    title: "Started Prospera",
    desc: "No big launch, no press release. Started slow, deliberately. I wanted to learn how to do this right before growing. Took on 10 properties. Started building the system.",
  },
  {
    era: "2025",
    location: "The Honest Pivot",
    icon: "07",
    title: "Fired 7 Properties",
    desc: "Not every fit is right. Cut the portfolio to 3 I could manage exceptionally well. It wasn't comfortable. But I'm not trying to build something big fast. I'm trying to build something good.",
  },
  {
    era: "Today",
    location: "Still Building",
    icon: "08",
    title: "Learning Every Day",
    desc: "25+ tenant placements, all paying rent. 0 LTB cases so far, not because I got lucky, but because I take screening seriously. Building the contractor network. Putting my face on the work. That's the plan.",
  },
];

function MilestoneCard({ milestone }: { milestone: (typeof milestones)[0] }) {
  return (
    <div className="p-5 border rounded-xl" style={{ backgroundColor: "#FFFFFF", borderColor: "#D8D2C8", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}
        >
          {milestone.era}
        </span>
        <span
          className="text-xs"
          style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}
        >
          {milestone.location}
        </span>
      </div>
      <h3
        className="text-lg font-medium mb-2"
        style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
      >
        {milestone.title}
      </h3>
      <p
        className="text-sm leading-relaxed"
        style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}
      >
        {milestone.desc}
      </p>
    </div>
  );
}

function PathSegment({ index }: { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.7 });

  const dDesktop =
    index % 2 === 0
      ? "M 50 0 C 18 22, 82 58, 50 80"
      : "M 50 0 C 82 22, 18 58, 50 80";

  return (
    <div ref={ref}>
      {/* Desktop winding S-curve */}
      <div className="hidden md:block relative" style={{ height: 88 }}>
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 80"
          preserveAspectRatio="none"
        >
          <motion.path
            d={dDesktop}
            stroke="#D8D2C8"
            strokeWidth="1.5"
            strokeDasharray="3 9"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : {}}
            transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
          />
        </svg>
      </div>

      {/* Mobile simple dotted line */}
      <div className="md:hidden flex" style={{ height: 48 }}>
        <div style={{ width: 40, display: "flex", justifyContent: "center" }}>
          <svg width="2" height="48">
            <motion.path
              d="M 1 0 L 1 48"
              stroke="#D8D2C8"
              strokeWidth="1.5"
              strokeDasharray="2 7"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : {}}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

/**
 * SEO-safe MilestoneNode:
 * - Content (text) is always visible — opacity never starts at 0
 * - Only the decorative dot uses a subtle scale animation
 * - Cards slide in via transform only (opacity always 1)
 * - Respects prefers-reduced-motion
 */
function MilestoneNode({
  milestone,
  index,
}: {
  milestone: (typeof milestones)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const cardLeftRef = useRef<HTMLDivElement>(null);
  const cardRightRef = useRef<HTMLDivElement>(null);
  const dotDesktopRef = useRef<HTMLDivElement>(null);
  const dotMobileRef = useRef<HTMLDivElement>(null);
  const mobileCardRef = useRef<HTMLDivElement>(null);
  const isRight = index % 2 === 0;

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const el = ref.current;
    if (!el) return;

    // Check if above fold
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) return;

    // Apply subtle transform to card elements
    const applyReveal = (
      cardEl: HTMLDivElement | null,
      offset: string,
      delay: number
    ) => {
      if (!cardEl) return;
      cardEl.style.transform = offset;
      cardEl.style.transition = `transform 350ms cubic-bezier(0.23,1,0.32,1) ${delay}ms`;
    };

    if (!isRight) {
      applyReveal(cardLeftRef.current, "translateX(16px)", 200);
    } else {
      applyReveal(cardRightRef.current, "translateX(-16px)", 200);
    }
    applyReveal(mobileCardRef.current, "translateY(12px)", 150);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          [cardLeftRef, cardRightRef, mobileCardRef, dotDesktopRef, dotMobileRef].forEach(r => {
            if (r.current) {
              r.current.style.transform = "none";
            }
          });
          observer.disconnect();
        }
      },
      { rootMargin: "-25px", threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isRight]);

  return (
    <div ref={ref}>
      {/* ── Desktop: 3-column grid ── */}
      <div className="hidden md:grid items-center gap-6" style={{ gridTemplateColumns: "1fr 52px 1fr" }}>
        {/* Left card slot */}
        <div>
          {!isRight && (
            <div ref={cardLeftRef}>
              <MilestoneCard milestone={milestone} />
            </div>
          )}
        </div>

        {/* Center dot — decorative, transform-only animation */}
        <div className="flex justify-center">
          <div
            ref={dotDesktopRef}
            className="w-12 h-12 flex items-center justify-center border-2 text-xs font-semibold"
            style={{
              borderColor: "#8B2030",
              backgroundColor: "#FFFFFF",
              color: "#8B2030",
              fontFamily: "var(--font-dm-sans)",
              letterSpacing: "0.05em",
            }}
          >
            {milestone.icon}
          </div>
        </div>

        {/* Right card slot */}
        <div>
          {isRight && (
            <div ref={cardRightRef}>
              <MilestoneCard milestone={milestone} />
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile: flex row ── */}
      <div className="md:hidden flex gap-4 items-start">
        <div
          ref={dotMobileRef}
          className="w-10 h-10 flex items-center justify-center border-2 text-xs font-semibold shrink-0 mt-1"
          style={{
            borderColor: "#8B2030",
            backgroundColor: "#FFFFFF",
            color: "#8B2030",
            fontFamily: "var(--font-dm-sans)",
            letterSpacing: "0.05em",
          }}
        >
          {milestone.icon}
        </div>
        <div ref={mobileCardRef} className="flex-1">
          <MilestoneCard milestone={milestone} />
        </div>
      </div>
    </div>
  );
}

export default function MilestoneTimeline() {
  return (
    <div className="max-w-4xl mx-auto">
      {milestones.map((milestone, i) => (
        <div key={i}>
          {i > 0 && <PathSegment index={i} />}
          <MilestoneNode milestone={milestone} index={i} />
        </div>
      ))}
    </div>
  );
}
