import BeehiivEmbed from "./BeehiivEmbed";

/**
 * Landlord-only newsletter CTA — "Almost Passive" (Beehiiv).
 * Renders Beehiiv's own Web Embed widget (components/blog/BeehiivEmbed.tsx) —
 * the widget manages its own email field, submit, and success state.
 *
 * Never render this on tenant-facing content — gate with lib/blog-audience.ts.
 */

const COPY = {
  top: {
    eyebrow: "Almost Passive · Free weekly email",
    headline: "Most landlords find out about rule changes like this after it's already cost them something.",
    body: "Once a week: what's actually happening in the London / St. Thomas rental market, what's changing at the LTB, and what I'm learning running Prospera — before it turns into a problem on your end.",
  },
  mid: {
    eyebrow: "Before you keep reading",
    headline: "This is exactly the kind of thing Almost Passive covers every week.",
    body: "Local market shifts, RTA/LTB changes that actually affect your properties, and real lessons from managing rentals. One short email. No fluff.",
  },
  end: {
    eyebrow: "From Ebin, founder of Prospera Properties",
    headline: "I write this every week so you don't have to find out the hard way.",
    body: "Almost Passive: what's happening locally, what's changing at the LTB, and what I'm actually learning managing rentals. One email, free, unsubscribe anytime.",
  },
  page: {
    eyebrow: "Free · Weekly · London & Southwestern Ontario",
    headline: "Almost Passive",
    body: "One short email a week. What's happening locally, what's changing at the LTB, and what I'm learning running Prospera — read it with your morning coffee.",
  },
} as const;

const PAGE_ITEMS = [
  "What's happening locally — market changes, new developments, incentives",
  "What landlords should know — RTA/LTB updates that actually affect your properties",
  "What I'm learning — real lessons from managing properties and placing tenants",
];

type Variant = keyof typeof COPY;

// Shown under a post-specific hook instead of the generic body copy — the
// hook itself already carries the value prop, this just supports the ask.
const SHORT_BODY: Record<Variant, string> = {
  top: "Free. Weekly. London & Southwestern Ontario.",
  mid: "One short email, no fluff.",
  end: "Free, unsubscribe anytime.",
  page: "",
};

export default function AlmostPassiveSignup({
  variant,
  customHook,
}: {
  variant: Variant;
  /** Post-specific hook (post.newsletterHook) — replaces the generic headline when given. */
  customHook?: string;
}) {
  const c = COPY[variant];
  const headline = customHook || c.headline;
  const body = customHook ? SHORT_BODY[variant] : c.body;

  if (variant === "page") {
    return (
      <div className="bg-white rounded-xl p-8 border" style={{ borderColor: "#D8D2C8", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <p className="text-xs uppercase tracking-widest mb-6" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
          {c.eyebrow}
        </p>
        <ul className="space-y-3 mb-8">
          {PAGE_ITEMS.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
              <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B2030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
        <div className="border-t pt-6" style={{ borderColor: "#E8E4DF" }}>
          <BeehiivEmbed />
        </div>
      </div>
    );
  }

  if (variant === "end") {
    return (
      <section className="py-16 px-6" style={{ backgroundColor: "#1F2F3A" }}>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "rgba(250,248,245,0.75)", fontFamily: "var(--font-dm-sans)" }}>
            {c.eyebrow}
          </p>
          <h2 className="text-3xl md:text-4xl font-light mb-3" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            {headline}
          </h2>
          <p className="text-sm mb-8 max-w-lg mx-auto" style={{ color: "rgba(250,248,245,0.8)", fontFamily: "var(--font-dm-sans)" }}>
            {body}
          </p>
          <div className="max-w-lg mx-auto text-left">
            <BeehiivEmbed />
          </div>
        </div>
      </section>
    );
  }

  // "top" / "mid" — compact inline block matching the site's mid-post CTA style
  return (
    <div className="my-12 px-8 py-8 border-l-4 rounded-r-xl" style={{ backgroundColor: "#F7F5F2", borderColor: "#8B2030" }}>
      <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>
        {c.eyebrow}
      </p>
      <p className="text-lg font-light mb-4" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
        {headline}
      </p>
      <p className="text-sm mb-4" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
        {body}
      </p>
      <BeehiivEmbed />
    </div>
  );
}
