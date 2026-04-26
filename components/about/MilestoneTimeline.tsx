"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const milestones = [
  {
    era: "Age 16",
    location: "India",
    icon: "◎",
    title: "First Business",
    desc: "Started a business from nothing. Built it. Sold it. The real lesson wasn't the money — it was learning that you figure things out by doing them, not by waiting until you feel ready.",
  },
  {
    era: "Age 18",
    location: "India",
    icon: "◈",
    title: "Digital Marketing Agency",
    desc: "Built a marketing agency and ran it for two years. That's where I learned how to position something, tell a story, and get people to pay attention. That brain followed me to Canada.",
  },
  {
    era: "Age 20",
    location: "Canada",
    icon: "✈",
    title: "International Student",
    desc: "Landed in Canada with a plan to keep costs low. Signed a $3,200/month house under my own name, moved into one room, and rented the rest to students who barely knew each other.",
  },
  {
    era: "2022–2024",
    location: "The Real Education",
    icon: "⌂",
    title: "The Chaotic House",
    desc: "Late rent. Broken things. Constant churn. Got the flooring redone mid-tenancy while still studying full time. I genuinely laugh about it now. But that chaos taught me more about tenants than any course ever could.",
  },
  {
    era: "2023",
    location: "Ontario",
    icon: "◷",
    title: "Department Manager",
    desc: "Got hired at the highest-volume grocery store in Ontario. 600+ labour hours a week — people, pressure, logistics all at once. Still do it. Taught me that systems are what separate good from bad.",
  },
  {
    era: "March 2025",
    location: "London, ON",
    icon: "◉",
    title: "Started Prospera",
    desc: "No big launch, no press release. Started slow — deliberately. I wanted to learn how to do this right before growing. Took on 10 properties. Started building the system.",
  },
  {
    era: "2025",
    location: "The Honest Pivot",
    icon: "⊘",
    title: "Fired 7 Properties",
    desc: "Not every fit is right. Cut the portfolio to 3 I could manage exceptionally well. It wasn't comfortable. But I'm not trying to build something big fast — I'm trying to build something good.",
  },
  {
    era: "Today",
    location: "Still Building",
    icon: "◆",
    title: "Learning Every Day",
    desc: "25+ tenant placements, all paying rent. 0 LTB cases so far — not because I got lucky, but because I take screening seriously. Building the contractor network. Putting my face on the work. That's the plan.",
  },
];

// ── Card ──────────────────────────────────────────────────────────────────────

function MilestoneCard({ milestone }: { milestone: (typeof milestones)[0] }) {
  return (
    <div className="p-5 border rounded-xl" style={{ backgroundColor: "#FFFDFB", borderColor: "#E8E4DF" }}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
        >
          {milestone.era}
        </span>
        <span
          className="text-xs"
          style={{ color: "#BBBBBB", fontFamily: "var(--font-dm-sans)" }}
        >
          {milestone.location}
        </span>
      </div>
      <h3
        className="text-lg font-medium mb-2"
        style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}
      >
        {milestone.title}
      </h3>
      <p
        className="text-sm leading-relaxed"
        style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}
      >
        {milestone.desc}
      </p>
    </div>
  );
}

// ── Winding path connector ─────────────────────────────────────────────────────

function PathSegment({ index }: { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.7 });

  // Alternating S-curves between the center dots on desktop
  // Odd connectors curve one way, even curve the other → winding road effect
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
            stroke="#7B1C1C"
            strokeWidth="1.5"
            strokeDasharray="3 9"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : {}}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
      </div>

      {/* Mobile simple dotted line */}
      <div className="md:hidden flex" style={{ height: 48 }}>
        <div style={{ width: 40, display: "flex", justifyContent: "center" }}>
          <svg width="2" height="48">
            <motion.path
              d="M 1 0 L 1 48"
              stroke="#7B1C1C"
              strokeWidth="1.5"
              strokeDasharray="2 7"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={isInView ? { pathLength: 1 } : {}}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ── Milestone node ─────────────────────────────────────────────────────────────

function MilestoneNode({
  milestone,
  index,
}: {
  milestone: (typeof milestones)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.25 });
  const isRight = index % 2 === 0; // even → card on right side

  return (
    <div ref={ref}>
      {/* ── Desktop: 3-column grid ── */}
      <div className="hidden md:grid items-center gap-6" style={{ gridTemplateColumns: "1fr 52px 1fr" }}>
        {/* Left card slot */}
        <div>
          {!isRight && (
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <MilestoneCard milestone={milestone} />
            </motion.div>
          )}
        </div>

        {/* Center dot */}
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.12, type: "spring", stiffness: 200 }}
            className="w-12 h-12 flex items-center justify-center border-2 text-lg"
            style={{
              borderColor: "#7B1C1C",
              backgroundColor: "#FAF8F5",
              color: "#7B1C1C",
            }}
          >
            {milestone.icon}
          </motion.div>
        </div>

        {/* Right card slot */}
        <div>
          {isRight && (
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <MilestoneCard milestone={milestone} />
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Mobile: flex row ── */}
      <div className="md:hidden flex gap-4 items-start">
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.1, type: "spring", stiffness: 200 }}
          className="w-10 h-10 flex items-center justify-center border-2 text-sm shrink-0 mt-1"
          style={{
            borderColor: "#7B1C1C",
            backgroundColor: "#FAF8F5",
            color: "#7B1C1C",
          }}
        >
          {milestone.icon}
        </motion.div>
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <MilestoneCard milestone={milestone} />
        </motion.div>
      </div>
    </div>
  );
}

// ── Export ─────────────────────────────────────────────────────────────────────

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
