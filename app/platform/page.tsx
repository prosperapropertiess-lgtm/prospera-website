"use client";

import Image from "next/image";
import FadeIn from "@/components/animations/FadeIn";

const APP_STORE_URL = "https://apps.apple.com/app/id6796331488";
const NAVY = "#1F2F3A";
const BURGUNDY = "#8B2030";
const CREAM = "#F7F5F2";
const BORDER = "#D8D2C8";

// ── PhoneFrame ────────────────────────────────────────────────────────────────

function PhoneFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative flex-shrink-0 mx-auto" style={{ width: 260, height: 564 }}>
      <div
        className="absolute inset-0 rounded-[44px] blur-3xl scale-90 pointer-events-none"
        style={{ backgroundColor: "rgba(139,32,48,0.12)" }}
      />
      <div
        className="relative w-full h-full rounded-[44px] p-[3px]"
        style={{ backgroundColor: NAVY, boxShadow: "0 40px 80px rgba(31,47,58,0.25)" }}
      >
        <div className="relative w-full h-full rounded-[41px] overflow-hidden" style={{ backgroundColor: "#FFFFFF" }}>
          <Image src={src} alt={alt} fill className="object-cover object-top" sizes="260px" />
        </div>
      </div>
    </div>
  );
}

function DownloadButton() {
  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-3 px-9 py-4 text-xs font-semibold uppercase tracking-widest rounded transition-opacity hover:opacity-85"
      style={{
        backgroundColor: BURGUNDY,
        color: "#FAF8F5",
        fontFamily: "var(--font-dm-sans)",
      }}
    >
      Download the App
      <span className="text-base leading-none">→</span>
    </a>
  );
}

// ── Feature row data ────────────────────────────────────────────────────────

const features: { eyebrow: string; headline: string; body: string; bullets: string[]; screen: string; alt: string; flip?: boolean }[] = [
  {
    eyebrow: "Command",
    headline: "Everything about your portfolio. One screen.",
    body: "Rent collected this month, what's still expected, how many units are occupied, how many things need your attention. The number you actually check every day, the second you open the app.",
    bullets: ["Collected vs. expected, at a glance", "Occupancy across every building", "Open requests, front and center"],
    screen: "/app-screens/command-dashboard.png",
    alt: "Prospera app Command dashboard",
  },
  {
    eyebrow: "Rent Collection",
    headline: "One tap. Reminder sent.",
    body: "See who's paid and who hasn't, in one list. Select whoever's behind and send a reminder — one tap, not a text you have to compose and re-send every month.",
    bullets: ["Every resident's rent status in one view", "Send reminders individually or in bulk", "Full payment history per resident"],
    screen: "/app-screens/rent-collection.png",
    alt: "Prospera app one-tap rent collection reminders",
    flip: true,
  },
  {
    eyebrow: "Maintenance",
    headline: "A request comes in. You always know where it stands.",
    body: "Open, scheduled, resolved — every maintenance request moves through a real pipeline instead of living in a text thread you'll lose track of. Set the priority, mark it resolved, move on.",
    bullets: ["Every request tracked start to finish", "Priority levels — low to urgent", "Nothing gets forgotten in a text chain"],
    screen: "/app-screens/maintenance.png",
    alt: "Prospera app maintenance request tracking",
  },
  {
    eyebrow: "Notices & LTB",
    headline: "You don't have to know which form you need. The app does.",
    body: "N4, N5, N8, N12 — tell it what happened, and it tells you which notice applies. The termination date is calculated for you and checked against Tribunals Ontario's actual rules, not a guess.",
    bullets: ["Plain-language notice picker — no legal guesswork", "Termination dates calculated automatically", "Rules checked against Tribunals Ontario"],
    screen: "/app-screens/n4-detail.png",
    alt: "Prospera app LTB notice generator with auto-calculated termination date",
    flip: true,
  },
  {
    eyebrow: "Property Health",
    headline: "Know your property's condition without guessing.",
    body: "A real score built from what's actually open — maintenance requests and appliance service intervals. Not a made-up number. If it says Excellent, it's because nothing urgent is sitting open.",
    bullets: ["Score built from real maintenance data", "Full property history in one timeline", "See it before a small problem gets expensive"],
    screen: "/app-screens/property-health.png",
    alt: "Prospera app property health score",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PlatformPage() {
  return (
    <div style={{ backgroundColor: CREAM }}>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ backgroundColor: NAVY }}>
        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-32 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <FadeIn>
              <p className="text-xs uppercase tracking-widest mb-6" style={{ color: "rgba(250,248,245,0.55)", fontFamily: "var(--font-dm-sans)" }}>
                The Prospera App
              </p>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-light leading-[1.1] mb-6"
                style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
              >
                Built by a landlord.<br />
                <em>Not an enterprise software team.</em>
              </h1>
              <p className="text-base sm:text-lg leading-relaxed mb-9 max-w-lg" style={{ color: "rgba(250,248,245,0.75)", fontFamily: "var(--font-dm-sans)" }}>
                Every property management app out there is built for someone running 50, 100, 200 units with a full
                back office. Nothing was built for the person with 4 to 15 doors trying to make the numbers work
                without it eating their life. So the founder of Prospera built the one he wished existed — and now
                you can have it too.
              </p>
              <div className="flex flex-wrap items-center gap-5">
                <DownloadButton />
                <a
                  href="#founder-story"
                  className="text-xs font-medium uppercase tracking-widest border-b pb-px transition-opacity hover:opacity-60"
                  style={{ color: "rgba(250,248,245,0.6)", borderColor: "rgba(250,248,245,0.25)", fontFamily: "var(--font-dm-sans)" }}
                >
                  Read the story →
                </a>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <PhoneFrame src="/app-screens/command-dashboard.png" alt="Prospera app Command dashboard showing rent collected and portfolio status" />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Is this you? ──────────────────────────────────────────────────── */}
      <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-widest text-center mb-4" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
              Who This Is For
            </p>
            <h2 className="text-4xl sm:text-5xl font-light text-center mb-4 leading-tight" style={{ color: NAVY, fontFamily: "var(--font-cormorant)" }}>
              Which one of these is you?
            </h2>
            <p className="text-sm text-center mb-14 max-w-md mx-auto" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
              Different situations, same outcome: you want it handled, not managed by you.
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "You're adding properties faster than you can manage them.", sub: "More doors should mean more freedom. Right now it means more calls, more admin, more of your evenings gone." },
              { label: "Your job doesn't leave room for a second one.", sub: "You built a career. Being on call for a broken furnace at 11pm was never part of the plan." },
              { label: "You don't live near the property anymore.", sub: "A tenant problem you can't just drive over and fix isn't one you can manage from a distance." },
              { label: "One bad experience was enough.", sub: "A tenant who stopped paying, a 3am call, a repair that spiraled. You already know you're done doing it this way." },
            ].map((s, i) => (
              <FadeIn key={s.label} delay={i * 0.06}>
                <div className="p-7 border rounded-xl relative h-full overflow-hidden" style={{ borderColor: BORDER, backgroundColor: CREAM }}>
                  <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: BURGUNDY }} />
                  <p className="font-semibold text-base leading-snug mb-2" style={{ color: NAVY, fontFamily: "var(--font-dm-sans)" }}>{s.label}</p>
                  <p className="text-sm leading-relaxed" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>{s.sub}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature rows ─────────────────────────────────────────────────── */}
      <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: CREAM }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-center mb-4" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
              Inside the App
            </p>
            <h2 className="text-4xl sm:text-5xl font-light text-center mb-4 leading-tight" style={{ color: NAVY, fontFamily: "var(--font-cormorant)" }}>
              These are real screens.
            </h2>
            <p className="text-base text-center mb-20 max-w-lg mx-auto" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
              Not mockups of features that don&apos;t exist yet. This is what&apos;s actually in the app today.
            </p>
          </FadeIn>

          <div className="flex flex-col gap-24">
            {features.map((f) => (
              <div key={f.headline} className={`flex flex-col ${f.flip ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-12 lg:gap-16`}>
                <FadeIn className="flex-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: BURGUNDY, fontFamily: "var(--font-dm-sans)" }}>{f.eyebrow}</p>
                  <h3 className="text-3xl sm:text-4xl font-light leading-snug mb-4" style={{ color: NAVY, fontFamily: "var(--font-cormorant)" }}>{f.headline}</h3>
                  <p className="text-base leading-relaxed mb-6" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>{f.body}</p>
                  <ul className="space-y-2.5">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-3 text-sm" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                        <span className="flex-shrink-0 mt-0.5 font-bold" style={{ color: BURGUNDY }}>✓</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </FadeIn>
                <FadeIn delay={0.1} className="flex-shrink-0">
                  <PhoneFrame src={f.screen} alt={f.alt} />
                </FadeIn>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Founder Story ────────────────────────────────────────────────── */}
      <section id="founder-story" className="py-28 px-5 sm:px-8 border-t" style={{ backgroundColor: NAVY, borderColor: "rgba(250,248,245,0.08)" }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest mb-12 text-center" style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)" }}>
              Why This Exists
            </p>
          </FadeIn>
          <div className="flex flex-col lg:flex-row gap-14 lg:gap-20">
            <FadeIn delay={0.1} className="flex-shrink-0 flex flex-col items-center lg:items-start gap-5">
              <div className="relative w-52 h-64 rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(250,248,245,0.15)" }}>
                <Image src="/ebin-founder.jpg" alt="Ebin Jaison — Founder, Prospera Properties" fill className="object-cover object-top" sizes="208px" />
              </div>
              <div className="text-center lg:text-left">
                <p className="text-lg font-light" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>Ebin Jaison</p>
                <p className="text-xs mt-1" style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)" }}>Founder, Prospera Properties</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)" }}>London, Ontario</p>
              </div>
            </FadeIn>

            <div className="flex-1 space-y-6">
              {[
                { text: "I built my first business at 16. It didn't work out — but I learned you figure things out by doing them, not by waiting until you feel ready.", large: true },
                { text: "That's the same lesson that got me here. I've been the tenant, the house coordinator, and the operations manager for other people's properties. I saw exactly what was broken about how landlords are expected to run things." },
                { text: "Every property management tool on the market is built for someone with 50, 100, 200 units and a full back office running it. If you've got 4 to 15 doors, none of it fits — it's either too much or it's not built for you at all. So you end up running your portfolio off a notebook and a group text, same as I used to." },
                { text: "I didn't set out to build software. I fixed the thing I was already running myself, because I needed it before you did.", emphasis: true },
              ].map((block, idx) => (
                <FadeIn key={block.text} delay={idx * 0.07}>
                  <p
                    className={block.large ? "text-2xl sm:text-3xl font-light leading-snug italic" : "text-base leading-relaxed"}
                    style={{
                      color: block.large ? "#FAF8F5" : "rgba(250,248,245,0.8)",
                      fontFamily: block.large ? "var(--font-cormorant)" : "var(--font-dm-sans)",
                      fontWeight: block.emphasis ? 600 : undefined,
                    }}
                  >
                    {block.text}
                  </p>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Not built like the enterprise stuff ──────────────────────────── */}
      <section className="py-24 px-5 sm:px-8" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
              The Difference
            </p>
            <h2 className="text-4xl sm:text-5xl font-light mb-8 leading-tight" style={{ color: NAVY, fontFamily: "var(--font-cormorant)" }}>
              This isn&apos;t enterprise software with a landlord skin on it.
            </h2>
            <p className="text-base leading-relaxed mb-4" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
              The big property management platforms are built for property management <em>companies</em>
              {" "}— teams of people running hundreds of units for other people&apos;s portfolios. That&apos;s a
              different job than yours. You&apos;re not staffing a back office. You&apos;re one person trying to
              keep 4 to 15 doors running without it taking over your life.
            </p>
            <p className="text-base leading-relaxed mb-10" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
              So the app is built around what you actually need — collect rent, know what&apos;s open, get the
              right form when something goes wrong — not a hundred features you&apos;ll never touch.
            </p>
            <DownloadButton />
          </FadeIn>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="py-28 px-5 sm:px-8 text-center" style={{ backgroundColor: NAVY }}>
        <FadeIn>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-light mb-6 leading-tight" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Run your properties.<br />
            <em>Not the other way around.</em>
          </h2>
          <p className="text-sm mb-10 max-w-md mx-auto leading-relaxed" style={{ color: "rgba(250,248,245,0.6)", fontFamily: "var(--font-dm-sans)" }}>
            Built for Ontario landlords with 4 to 15 properties.
          </p>
          <DownloadButton />
        </FadeIn>
      </section>

    </div>
  );
}
