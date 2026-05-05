import Image from "next/image";
import Link from "next/link";
import FadeIn from "@/components/animations/FadeIn";
import CounterAnimation from "@/components/animations/CounterAnimation";
import MilestoneTimeline from "@/components/about/MilestoneTimeline";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Ebin — The Story Behind Prospera",
  description:
    "Meet Ebin Jaison — owner of Prospera Properties. A hands-on property manager serving landlords with 1–5 doors across London, St. Thomas, and Strathroy, Ontario.",
};

const numbers = [
  { target: 25, suffix: "+", label: "Tenant Placements" },
  { target: 20, suffix: "+", label: "Five-Star Reviews" },
  { target: 0, suffix: "", label: "LTB Cases" },
  { target: 17, suffix: "", label: "YouTube Videos" },
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

      {/* ── HERO ── */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{ backgroundColor: "#FAF8F5" }}
      >
        {/* Glow orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute rounded-full"
            style={{
              top: "50%",
              left: "10%",
              transform: "translateY(-50%)",
              width: "600px",
              height: "600px",
              background: "radial-gradient(circle, rgba(139,26,26,0.16) 0%, rgba(139,26,26,0) 65%)",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              top: "15%",
              right: "8%",
              width: "350px",
              height: "350px",
              background: "radial-gradient(circle, rgba(197,165,90,0.13) 0%, rgba(197,165,90,0) 65%)",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              bottom: "10%",
              right: "20%",
              width: "250px",
              height: "250px",
              background: "radial-gradient(circle, rgba(139,26,26,0.08) 0%, rgba(139,26,26,0) 65%)",
            }}
          />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-28 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-4 items-center">

            {/* ── Left: Photo ── */}
            <FadeIn>
              <div className="relative max-w-sm mx-auto md:mx-0 md:max-w-none">
                {/* Photo */}
                <div
                  className="relative w-full overflow-hidden rounded-2xl"
                  style={{ aspectRatio: "3/4", maxWidth: "420px" }}
                >
                  <Image
                    src="/ebin-founder.jpg"
                    alt="Ebin Jaison — Founder, Prospera Properties"
                    fill
                    sizes="(max-width: 768px) 90vw, 45vw"
                    style={{ objectFit: "cover", objectPosition: "center top" }}
                    priority
                  />
                </div>

                {/* Floating trust card */}
                <div
                  className="absolute -bottom-4 -right-4 md:-right-8 rounded-2xl px-5 py-4 shadow-xl border"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(12px)",
                    borderColor: "#E8E4DF",
                  }}
                >
                  <p
                    className="text-[10px] uppercase tracking-widest mb-2"
                    style={{ color: "#9B9B9B", fontFamily: "var(--font-dm-sans)" }}
                  >
                    Track Record
                  </p>
                  <div className="flex items-center gap-3">
                    <p
                      className="text-4xl font-light leading-none"
                      style={{ color: "#8B1A1A", fontFamily: "var(--font-cormorant)" }}
                    >
                      25+
                    </p>
                    <div>
                      <p
                        className="text-xs font-medium leading-tight"
                        style={{ color: "#1A1A1A", fontFamily: "var(--font-dm-sans)" }}
                      >
                        Tenants placed
                      </p>
                      <p
                        className="text-xs leading-tight"
                        style={{ color: "#9B9B9B", fontFamily: "var(--font-dm-sans)" }}
                      >
                        0 LTB cases
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* ── Right: Editorial type ── */}
            <FadeIn delay={0.1}>
              <div className="md:pl-8 lg:pl-16">
                {/* Label */}
                <p
                  className="text-[11px] uppercase tracking-[0.35em] mb-10"
                  style={{ color: "#C5A55A", fontFamily: "var(--font-dm-sans)" }}
                >
                  Owner · Operator · London, ON
                </p>

                {/* Giant editorial headline */}
                <div className="mb-8 leading-none" style={{ fontFamily: "var(--font-cormorant)" }}>
                  <p
                    className="text-7xl sm:text-8xl lg:text-9xl font-light"
                    style={{ color: "#1A1A1A" }}
                  >
                    hi,
                  </p>
                  <p
                    className="text-6xl sm:text-7xl lg:text-8xl font-light"
                    style={{ color: "#1A1A1A" }}
                  >
                    I&apos;m
                  </p>
                  <p
                    className="text-8xl sm:text-9xl lg:text-[10rem] font-light italic"
                    style={{ color: "#8B1A1A" }}
                  >
                    Ebin
                  </p>
                </div>

                {/* Subtext */}
                <p
                  className="text-base leading-relaxed mb-10 max-w-sm"
                  style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}
                >
                  I built Prospera to be the property manager I wish had existed —
                  hands-on, reachable, and actually invested in your property.
                </p>

                {/* CTA */}
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-3 px-8 py-4 text-xs font-semibold uppercase tracking-widest rounded-xl transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: "#8B1A1A",
                    color: "#FAF8F5",
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  Work with Me
                  <span className="text-base leading-none">→</span>
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Numbers bar ── */}
      <section className="py-14 px-5 sm:px-8 border-t border-b" style={{ borderColor: "#E8E4DF", backgroundColor: "#F5F0EB" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {numbers.map((n, i) => (
            <FadeIn key={n.label} delay={i * 0.1} direction="up">
              <div>
                <p
                  className="text-5xl font-light mb-1"
                  style={{ color: "#1A1A1A", fontFamily: "var(--font-cormorant)" }}
                >
                  <CounterAnimation target={n.target} suffix={n.suffix} duration={1.8} />
                </p>
                <div className="w-6 h-px mx-auto mb-2" style={{ backgroundColor: "#C5A55A" }} />
                <p
                  className="text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: "#9B9B9B", fontFamily: "var(--font-dm-sans)" }}
                >
                  {n.label}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Pull quote ── */}
      <section className="py-28 px-5 sm:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn direction="none" duration={0.9}>
            <div className="w-px h-12 mx-auto mb-10" style={{ backgroundColor: "#C5A55A" }} />
            <p
              className="text-3xl sm:text-4xl md:text-5xl font-light italic leading-tight mb-8"
              style={{ color: "#1A1A1A", fontFamily: "var(--font-cormorant)" }}
            >
              &ldquo;I&apos;ve been the tenant, the house coordinator,
              and the operations manager — I saw exactly what was broken.
              So I built something to fix it.&rdquo;
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="w-10 h-px" style={{ backgroundColor: "#C5A55A" }} />
              <p
                className="text-xs uppercase tracking-widest"
                style={{ color: "#9B9B9B", fontFamily: "var(--font-dm-sans)" }}
              >
                Ebin Jaison — Founder
              </p>
              <div className="w-10 h-px" style={{ backgroundColor: "#C5A55A" }} />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#F5F0EB" }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p
              className="text-[11px] font-semibold uppercase tracking-widest text-center mb-4"
              style={{ color: "#C5A55A", fontFamily: "var(--font-dm-sans)" }}
            >
              The Journey
            </p>
            <h2
              className="text-4xl sm:text-5xl font-light text-center mb-16 leading-tight"
              style={{ color: "#1A1A1A", fontFamily: "var(--font-cormorant)" }}
            >
              The winding road
              <br />
              <em>to Prospera.</em>
            </h2>
          </FadeIn>
          <MilestoneTimeline />
        </div>
      </section>

      {/* ── Photo + philosophy ── */}
      <section className="py-28 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <FadeIn direction="left">
            <div className="relative">
              <div className="relative w-full overflow-hidden rounded-2xl" style={{ aspectRatio: "4/5" }}>
                <Image
                  src="/ebin-candid.jpg"
                  alt="Ebin Jaison — Prospera Properties"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: "cover", objectPosition: "center top" }}
                />
              </div>
              {/* Decorative accent */}
              <div
                className="absolute -top-4 -left-4 w-24 h-24 rounded-full opacity-30"
                style={{ background: "radial-gradient(circle, #C5A55A, transparent)" }}
              />
            </div>
          </FadeIn>

          <FadeIn delay={0.1} direction="right">
            <p
              className="text-[11px] font-semibold uppercase tracking-widest mb-5"
              style={{ color: "#C5A55A", fontFamily: "var(--font-dm-sans)" }}
            >
              Where I&apos;m At
            </p>
            <h2
              className="text-4xl sm:text-5xl font-light mb-8 leading-tight"
              style={{ color: "#1A1A1A", fontFamily: "var(--font-cormorant)" }}
            >
              Yes, I&apos;m new.
              <br />
              <em>Here&apos;s why that&apos;s good for you.</em>
            </h2>
            <div
              className="space-y-5 text-base leading-relaxed"
              style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}
            >
              <p>
                The companies that have been around 20 years are managing 300+ properties.
                You&apos;re a file number. Your call goes to a coordinator. Your maintenance
                request gets queued behind 40 others.
              </p>
              <p>
                I&apos;m choosing to stay small because that&apos;s the whole point. Every landlord
                I work with should feel like their property actually matters — because to me, it does.
                That&apos;s not marketing copy. That&apos;s the actual business model.
              </p>
              <p>
                We managed 10 properties. I cut it to 3. Not because the others were bad —
                because not every fit is right, and I&apos;d rather manage fewer things
                exceptionally than more things adequately.
              </p>
            </div>
            <div className="mt-10 flex items-center gap-4">
              <div className="w-10 h-px" style={{ backgroundColor: "#C5A55A" }} />
              <p
                className="text-sm font-medium"
                style={{ color: "#1A1A1A", fontFamily: "var(--font-dm-sans)" }}
              >
                Ebin Jaison — Owner, Prospera Properties
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Contractor network ── */}
      <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#F5F0EB" }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
            <FadeIn direction="left">
              <div>
                <p
                  className="text-[11px] font-semibold uppercase tracking-widest mb-4"
                  style={{ color: "#C5A55A", fontFamily: "var(--font-dm-sans)" }}
                >
                  Still Growing
                </p>
                <h2
                  className="text-4xl sm:text-5xl font-light mb-6 leading-tight"
                  style={{ color: "#1A1A1A", fontFamily: "var(--font-cormorant)" }}
                >
                  Two years finding people
                  <br />
                  <em>I actually trust.</em>
                </h2>
                <p
                  className="text-base leading-relaxed mb-4"
                  style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}
                >
                  Every contractor on my list has been tested on a real job — deep cleans,
                  plumbing, full renovation coordination. None of them are marked up beyond
                  our transparent 8% coordination fee.
                </p>
                <p
                  className="text-base leading-relaxed"
                  style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}
                >
                  When a furnace goes at 11pm, there&apos;s already a plan. That&apos;s what two
                  years of building looks like.
                </p>
              </div>
            </FadeIn>

            <FadeIn direction="right" delay={0.1}>
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
                    className="bg-white border rounded-xl p-4 text-sm font-medium"
                    style={{ borderColor: "#E8E4DF", color: "#1A1A1A", fontFamily: "var(--font-dm-sans)" }}
                  >
                    <span className="text-xs mr-2" style={{ color: "#C5A55A" }}>✓</span>
                    {trade}
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Why small beats big ── */}
      <section className="py-24 px-5 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p
              className="text-[11px] font-semibold uppercase tracking-widest text-center mb-4"
              style={{ color: "#C5A55A", fontFamily: "var(--font-dm-sans)" }}
            >
              The Difference
            </p>
            <h2
              className="text-4xl sm:text-5xl font-light text-center mb-14 leading-tight"
              style={{ color: "#1A1A1A", fontFamily: "var(--font-cormorant)" }}
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
                  className="bg-white border rounded-2xl p-8 h-full"
                  style={{ borderColor: "#E8E4DF" }}
                >
                  <div className="w-8 h-0.5 mb-6" style={{ backgroundColor: "#C5A55A" }} />
                  <h3
                    className="text-xl font-medium mb-4 leading-snug"
                    style={{ color: "#1A1A1A", fontFamily: "var(--font-cormorant)" }}
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

      {/* ── CTA ── */}
      <section
        className="relative py-28 px-5 sm:px-8 text-center overflow-hidden"
        style={{ backgroundColor: "#1A1A1A" }}
      >
        {/* Subtle glow on dark */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, rgba(139,26,26,0.18) 0%, transparent 65%)",
          }}
        />
        <div className="relative z-10">
          <FadeIn>
            <p
              className="text-[11px] font-semibold uppercase tracking-widest mb-6"
              style={{ color: "#C5A55A", fontFamily: "var(--font-dm-sans)" }}
            >
              Let&apos;s Talk
            </p>
            <h2
              className="text-4xl sm:text-5xl md:text-6xl font-light mb-6 leading-tight"
              style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
            >
              Want to work with someone
              <br />
              <em>who actually gives a damn?</em>
            </h2>
            <p
              className="text-sm mb-10 max-w-md mx-auto leading-relaxed"
              style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)" }}
            >
              Free consultation. No pitch. Just an honest conversation about your property.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 px-10 py-4 text-xs font-semibold uppercase tracking-widest rounded-xl transition-opacity hover:opacity-80"
              style={{
                backgroundColor: "#C5A55A",
                color: "#1A1A1A",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              Get in Touch
              <span className="text-base leading-none">→</span>
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
