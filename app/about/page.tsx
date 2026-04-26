import Image from "next/image";
import Link from "next/link";
import FadeIn from "@/components/animations/FadeIn";
import MilestoneTimeline from "@/components/about/MilestoneTimeline";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Ebin — The Story Behind Prospera",
  description:
    "Meet Ebin Jaison — owner of Prospera Properties. A hands-on property manager serving landlords with 1–5 doors across London, St. Thomas, and Strathroy, Ontario.",
};

const numbers = [
  { value: "25+", label: "Tenant Placements" },
  { value: "20+", label: "Five-Star Reviews" },
  { value: "0", label: "LTB Cases" },
  { value: "17", label: "YouTube Videos" },
];

const whySmall = [
  {
    title: "You won't be a ticket number.",
    desc: "Large property management companies run on volume. Your call goes to a coordinator who routes it to someone else. At Prospera, you get Ebin. That's the whole model.",
  },
  {
    title: "New doesn't mean worse.",
    desc: "Prospera is two years old. That means obsessive attention to every property, every placement, every tenant. I have something to prove — and that works in your favour.",
  },
  {
    title: "Staying small on purpose.",
    desc: "The goal: get 5, tighten the system, then get 5 more. We manage what we can manage exceptionally well. No overextension. No shortcuts.",
  },
];

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: "#FAF8F5" }}>
      {/* Hero */}
      <section
        className="relative pt-36 pb-20 px-5 sm:px-8 text-center overflow-hidden"
        style={{ backgroundColor: "#0D1B2A" }}
      >
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
              The Owner
            </p>
            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-light leading-tight mb-6"
              style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
            >
              I&apos;m not here because property
              <br />
              management was the plan.
            </h1>
            <p
              className="text-base max-w-xl mx-auto leading-relaxed"
              style={{ color: "rgba(250,248,245,0.55)", fontFamily: "var(--font-dm-sans)" }}
            >
              I&apos;m here because I&apos;ve been the tenant, the house coordinator, and the
              operations manager — and I could see exactly what was broken. So I&apos;m
              building something to fix it, one property at a time.
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

      {/* Timeline — winding storybook path */}
      <section className="py-24 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
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
              The winding road
              <br />
              <em>to Prospera.</em>
            </h2>
          </FadeIn>

          <MilestoneTimeline />
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
                  Still Growing
                </p>
                <h2
                  className="text-4xl font-light mb-6 leading-tight"
                  style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}
                >
                  Two years finding people
                  <br />
                  <em>I actually trust.</em>
                </h2>
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}
                >
                  Every contractor on my list has been tested on a real job — deep
                  cleans, plumbing, full renovation coordination. I&apos;m still adding to
                  it. None of them are marked up. That&apos;s a line I won&apos;t cross.
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}
                >
                  When a furnace goes at 11pm, there&apos;s already a plan. That&apos;s what two
                  years of building looks like.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                    className="bg-white border p-4 text-sm font-medium rounded-lg"
                    style={{
                      borderColor: "#E8E4DF",
                      color: "#0D1B2A",
                      fontFamily: "var(--font-dm-sans)",
                    }}
                  >
                    <span className="text-xs mr-2" style={{ color: "#7B1C1C" }}>
                      ✓
                    </span>
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
            <div className="relative w-full overflow-hidden" style={{ aspectRatio: "3/4" }}>
              <Image
                src="/ebin-founder.jpg"
                alt="Ebin Jaison — Owner, Prospera Properties"
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
              Where I&apos;m At
            </p>
            <h2
              className="text-4xl font-light mb-6 leading-tight"
              style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}
            >
              Yes, I&apos;m new.
              <br />
              <em>Here&apos;s why that&apos;s good for you.</em>
            </h2>
            <div
              className="space-y-5 text-sm leading-relaxed"
              style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}
            >
              <p>
                The companies that have been around 20 years are managing 300+ properties.
                You&apos;re a file number. Your call goes to a coordinator. Your maintenance
                request gets queued behind 40 others.
              </p>
              <p>
                I&apos;m choosing to stay small because that&apos;s the whole point. I want every
                landlord I work with to feel like their property matters — because to me,
                it does. That&apos;s not marketing copy. That&apos;s the actual business model.
              </p>
              <p>
                We managed 10 properties. I cut it to 3. Not because the others were bad —
                because not every fit is right, and I&apos;d rather manage fewer things
                exceptionally than more things adequately.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <div className="w-10 h-px" style={{ backgroundColor: "#7B1C1C" }} />
              <p
                className="text-sm font-medium"
                style={{ color: "#0D1B2A", fontFamily: "var(--font-dm-sans)" }}
              >
                Ebin Jaison — Owner, Prospera Properties
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
              My goal is to be the property manager
              <br />
              <em>I wish had existed.</em>
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {whySmall.map((item, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div
                  className="bg-white border p-7 h-full rounded-xl"
                  style={{ borderColor: "#E8E4DF" }}
                >
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
      <section
        className="py-24 px-5 sm:px-8 text-center"
        style={{ backgroundColor: "#0D1B2A" }}
      >
        <FadeIn>
          <h2
            className="text-4xl sm:text-5xl font-light mb-4 leading-tight"
            style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
          >
            Want to work with someone who actually gives a damn?
          </h2>
          <p
            className="text-sm mb-8 max-w-md mx-auto"
            style={{ color: "rgba(250,248,245,0.55)", fontFamily: "var(--font-dm-sans)" }}
          >
            Free consultation. No pitch. Just an honest conversation about your property.
          </p>
          <Link
            href="/contact"
            className="inline-block px-10 py-4 text-xs font-semibold uppercase tracking-widest transition-opacity hover:opacity-80 rounded-lg"
            style={{
              backgroundColor: "#7B1C1C",
              color: "#FAF8F5",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            Get in Touch
          </Link>
        </FadeIn>
      </section>
    </div>
  );
}
