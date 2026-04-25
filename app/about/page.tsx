import Image from "next/image";
import Link from "next/link";
import FadeIn from "@/components/animations/FadeIn";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Ebin & Our Story",
  description:
    "Meet Ebin Jaison — founder of Prospera Properties. A hands-on property manager serving landlords with 1–5 doors across London, St. Thomas, and Strathroy, Ontario.",
};

// ── Milestone Timeline Data ───────────────────────────────────────────────────

const milestones = [
  {
    era: "Age 16",
    location: "India",
    icon: "◎",
    title: "First Business",
    desc: "Started from scratch. Built it. Sold it. Learned what no classroom could teach.",
  },
  {
    era: "Age 18",
    location: "India",
    icon: "◈",
    title: "Digital Marketing Company",
    desc: "Built a marketing agency and ran it for two years. Where the brand brain came from.",
  },
  {
    era: "Age 20",
    location: "Canada",
    icon: "✈",
    title: "International Student",
    desc: "Landed in Canada with a plan. To keep costs down, signed a $3,200/month house under his own name — moved into one room, rented the rest to students who didn't know each other.",
  },
  {
    era: "2022–2024",
    location: "The Real Education",
    icon: "⌂",
    title: "The Student House",
    desc: "Late rent. Broken things. Constant churn. Got the flooring redone mid-tenancy while still studying full-time. Still thinks it's a little funny. But that chaos taught him exactly what good management is — and what it isn't.",
  },
  {
    era: "2023",
    location: "Ontario",
    icon: "◷",
    title: "Department Manager",
    desc: "Hired at the highest-volume grocery store in Ontario. 600+ labour hours a week under management. People, logistics, pressure — while studying and running the house.",
  },
  {
    era: "March 2025",
    location: "London, ON",
    icon: "◉",
    title: "Prospera Is Born",
    desc: "Started deliberately slow. Not to scale fast — to get it right first. Took on 10 properties. Started building the system.",
  },
  {
    era: "2025",
    location: "The Pivot",
    icon: "⊘",
    title: "Fired 7 Properties",
    desc: "Not every landlord-manager fit is right. Cut the portfolio to 3 properties managed exceptionally well. Quality over quantity is the only way this makes sense long-term.",
  },
  {
    era: "Today",
    location: "Building in Public",
    icon: "◆",
    title: "25+ Placements. 0 LTB.",
    desc: "Every placement paying rent. 20+ five-star reviews. 17 YouTube videos. An army of trusted contractors built over two years. A growing list of landlords who actually sleep at night.",
  },
];

// ── Numbers ───────────────────────────────────────────────────────────────────

const numbers = [
  { value: "25+", label: "Tenant Placements" },
  { value: "20+", label: "Five-Star Reviews" },
  { value: "0", label: "LTB Cases" },
  { value: "17", label: "YouTube Videos" },
];

// ── Why Small Beats Big ───────────────────────────────────────────────────────

const whySmall = [
  {
    title: "You won't be a ticket number.",
    desc: "Large property management companies run on volume. Your call goes to a coordinator who routes it to someone else. At Prospera, you get Ebin.",
  },
  {
    title: "New doesn't mean worse.",
    desc: "Prospera is two years old. That means obsessive attention to every property, every placement, every tenant. We have something to prove — and that works in your favour.",
  },
  {
    title: "Deliberately small.",
    desc: "We manage what we can manage well. The philosophy: get 5, tighten the system, then get 5 more. No shortcuts. No overextension.",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: "#FAF8F5" }}>
      {/* Hero */}
      <section className="relative pt-36 pb-20 px-5 sm:px-8 text-center overflow-hidden" style={{ backgroundColor: "#0D1B2A" }}>
        {/* Subtle background image */}
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src="/ebin-energy.jpg"
            alt=""
            fill
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "center", opacity: 0.08 }}
            priority
          />
        </div>
        <div className="relative z-10">
          <FadeIn>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-5"
              style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
            >
              The Founder
            </p>
            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-light leading-tight mb-6"
              style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
            >
              Run by someone who&apos;s been
              <br />
              <em style={{ color: "#C4B08A" }}>
                the tenant, the coordinator, the manager.
              </em>
            </h1>
            <p
              className="text-sm max-w-lg mx-auto leading-relaxed"
              style={{ color: "rgba(250,248,245,0.55)", fontFamily: "var(--font-dm-sans)" }}
            >
              Prospera wasn&apos;t built from a textbook. It was built from doing it the
              wrong way first, learning the hard lessons, and building something
              better with those scars.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Numbers bar */}
      <section className="py-12 px-5 sm:px-8" style={{ backgroundColor: "#F5F0EB" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {numbers.map((n) => (
            <div key={n.label}>
              <p
                className="text-4xl font-light mb-1"
                style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}
              >
                {n.value}
              </p>
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
              >
                {n.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline — the journey */}
      <section className="py-24 px-5 sm:px-8">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <p
              className="text-xs font-semibold uppercase tracking-widest text-center mb-4"
              style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
            >
              The Journey
            </p>
            <h2
              className="text-4xl sm:text-5xl font-light text-center mb-16 leading-tight"
              style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}
            >
              How you get from a student house in London
              <br />
              <em>to building a property management company.</em>
            </h2>
          </FadeIn>

          {/* Vertical timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute left-5 top-2 bottom-2 w-px"
              style={{ backgroundColor: "#E8E4DF" }}
            />

            <div className="space-y-10">
              {milestones.map((m, i) => (
                <FadeIn key={i} delay={i * 0.06}>
                  <div className="relative flex gap-8 pl-14">
                    {/* Node dot */}
                    <div
                      className="absolute left-0 top-1 w-10 h-10 flex items-center justify-center text-base z-10"
                      style={{
                        backgroundColor: "#FAF8F5",
                        border: "2px solid #E8E4DF",
                        color: "#7B1C1C",
                      }}
                    >
                      {m.icon}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                        <span
                          className="text-xs font-semibold uppercase tracking-widest"
                          style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
                        >
                          {m.era}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: "#BBBBBB", fontFamily: "var(--font-dm-sans)" }}
                        >
                          {m.location}
                        </span>
                      </div>
                      <h3
                        className="text-xl font-medium mb-2"
                        style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}
                      >
                        {m.title}
                      </h3>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}
                      >
                        {m.desc}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contractor army */}
      <section className="py-20 px-5 sm:px-8" style={{ backgroundColor: "#F5F0EB" }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-4"
                  style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
                >
                  The Contractor Army
                </p>
                <h2
                  className="text-4xl font-light mb-6 leading-tight"
                  style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}
                >
                  Two years.
                  <br />
                  <em>That&apos;s how long it took.</em>
                </h2>
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}
                >
                  Building a bench of people you actually trust takes time. Every
                  contractor on Ebin&apos;s list has been tested on a real job — from a
                  simple deep clean to a full renovation coordination. None of them
                  are marked up.
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}
                >
                  When your furnace goes at 11pm, there&apos;s already a plan. That&apos;s
                  what two years of building looks like.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  "Deep Cleaning",
                  "Plumbing",
                  "Electrical",
                  "Painting",
                  "Flooring",
                  "HVAC",
                  "Landscaping",
                  "Full Renovations",
                ].map((trade) => (
                  <div
                    key={trade}
                    className="bg-white border p-4 text-sm font-medium"
                    style={{
                      borderColor: "#E8E4DF",
                      color: "#0D1B2A",
                      fontFamily: "var(--font-dm-sans)",
                    }}
                  >
                    <span className="text-xs mr-2" style={{ color: "#7B1C1C" }}>✓</span>
                    {trade}
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Photo + philosophy */}
      <section className="py-24 px-5 sm:px-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <FadeIn>
            <div className="relative w-full aspect-[3/4] overflow-hidden">
              <Image
                src="/ebin-founder.jpg"
                alt="Ebin Jaison — Founder, Prospera Properties"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: "cover", objectPosition: "center top" }}
              />
            </div>
          </FadeIn>

          <FadeIn delay={0.12}>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-5"
              style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
            >
              The Philosophy
            </p>
            <h2
              className="text-4xl font-light mb-6 leading-tight"
              style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}
            >
              Yes, I&apos;m new.
              <br />
              <em>Here&apos;s why that helps you.</em>
            </h2>
            <div
              className="space-y-5 text-sm leading-relaxed"
              style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}
            >
              <p>
                The companies that have been around for 20 years are managing 300+
                properties. You&apos;re a file number. Your call goes to a coordinator.
                Your maintenance ticket gets queued.
              </p>
              <p>
                Prospera is different because we&apos;re choosing to stay small. Not
                because we have to — because that&apos;s the whole model. Get 5 properties,
                build the system, make it tight, then get 5 more. Every property
                gets real attention.
              </p>
              <p>
                We managed 10 properties. We fired 7. Not because they were bad
                properties — because not every fit is right, and a mediocre
                relationship helps no one.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <div className="w-10 h-px" style={{ backgroundColor: "#7B1C1C" }} />
              <p
                className="text-sm font-medium"
                style={{ color: "#0D1B2A", fontFamily: "var(--font-dm-sans)" }}
              >
                Ebin Jaison, Founder — Prospera Properties
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Why small beats big */}
      <section className="py-20 px-5 sm:px-8" style={{ backgroundColor: "#F5F0EB" }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h2
              className="text-4xl font-light text-center mb-14 leading-tight"
              style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}
            >
              Why small is better
              <br />
              <em>for landlords with 1–5 doors.</em>
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {whySmall.map((item, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="bg-white border p-7 h-full" style={{ borderColor: "#E8E4DF" }}>
                  <div className="w-6 h-0.5 mb-5" style={{ backgroundColor: "#7B1C1C" }} />
                  <h3
                    className="text-lg font-medium mb-3"
                    style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}
                  >
                    {item.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-5 sm:px-8 text-center" style={{ backgroundColor: "#0D1B2A" }}>
        <FadeIn>
          <h2
            className="text-4xl sm:text-5xl font-light mb-4 leading-tight"
            style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
          >
            Own a rental in Southwestern Ontario?
          </h2>
          <p
            className="text-sm mb-8 max-w-md mx-auto"
            style={{ color: "rgba(250,248,245,0.55)", fontFamily: "var(--font-dm-sans)" }}
          >
            Free consultation. Honest assessment. No pressure.
          </p>
          <Link
            href="/contact"
            className="inline-block px-10 py-4 text-xs font-semibold uppercase tracking-widest transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#7B1C1C", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
          >
            Get a Free Quote
          </Link>
        </FadeIn>
      </section>
    </div>
  );
}
