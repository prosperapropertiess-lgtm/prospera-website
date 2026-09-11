"use client";
import { useState, useId } from "react";

/**
 * Landlord-only newsletter CTA — "Almost Passive" (Beehiiv).
 * Submits via a real form POST to Beehiiv's own subscribe endpoint, targeting
 * a hidden iframe so the visitor never leaves the page. This mirrors exactly
 * what Beehiiv's own hosted page does (verified against their live endpoint),
 * which is more reliable than reimplementing their embed widget from scratch.
 *
 * Never render this on tenant-facing content — gate with lib/blog-audience.ts.
 */

const BEEHIIV_ENDPOINT = "https://prospera-properties-newsletter.beehiiv.com/create";

const COPY = {
  top: {
    eyebrow: "Almost Passive · Free weekly email",
    headline: "Most landlords find out about rule changes like this after it's already cost them something.",
    body: "Once a week: what's actually happening in the London / St. Thomas rental market, what's changing at the LTB, and what I'm learning running Prospera — before it turns into a problem on your end.",
    button: "Subscribe free",
  },
  mid: {
    eyebrow: "Before you keep reading",
    headline: "This is exactly the kind of thing Almost Passive covers every week.",
    body: "Local market shifts, RTA/LTB changes that actually affect your properties, and real lessons from managing rentals. One short email. No fluff.",
    button: "Get it weekly",
  },
  end: {
    eyebrow: "From Ebin, founder of Prospera Properties",
    headline: "I write this every week so you don't have to find out the hard way.",
    body: "Almost Passive: what's happening locally, what's changing at the LTB, and what I'm actually learning managing rentals. One email, free, unsubscribe anytime.",
    button: "Subscribe to Almost Passive",
  },
  page: {
    eyebrow: "Free · Weekly · London & Southwestern Ontario",
    headline: "Almost Passive",
    body: "One short email a week. What's happening locally, what's changing at the LTB, and what I'm learning running Prospera — read it with your morning coffee.",
    button: "Subscribe free",
  },
} as const;

const PAGE_ITEMS = [
  "What's happening locally — market changes, new developments, incentives",
  "What landlords should know — RTA/LTB updates that actually affect your properties",
  "What I'm learning — real lessons from managing properties and placing tenants",
];

type Variant = keyof typeof COPY;

function SignupFields({
  email, setEmail, status, iframeName, onSubmit, dark, buttonLabel,
}: {
  email: string;
  setEmail: (v: string) => void;
  status: "idle" | "loading" | "done" | "error";
  iframeName: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  dark: boolean;
  buttonLabel: string;
}) {
  return (
    <form
      action={BEEHIIV_ENDPOINT}
      method="post"
      target={iframeName}
      onSubmit={onSubmit}
      className="flex flex-col sm:flex-row gap-2.5"
    >
      {/* Fields Beehiiv's own subscribe form sends — verified against their live endpoint */}
      <input type="hidden" name="subscribe_error_message" value="Oops, something went wrong." />
      <input type="hidden" name="subscribe_success_message" value="Subscribed!" />
      <input type="hidden" name="sent_from_orchid" value="true" />
      <input type="hidden" name="signup_flow_id" value="" />
      <input type="hidden" name="automation_ids" value="" />
      <input type="hidden" name="double_opt" value="false" />
      <input type="hidden" name="auto_login_enabled" value="true" />
      <input
        type="email"
        name="email"
        required
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 px-4 py-3 text-sm rounded outline-none"
        style={
          dark
            ? { backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }
            : { border: "1px solid #D8D2C8", backgroundColor: "#FFFFFF", color: "#222222", fontFamily: "var(--font-dm-sans)" }
        }
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="px-6 py-3 text-xs font-semibold uppercase tracking-widest rounded transition-opacity hover:opacity-80 disabled:opacity-50 whitespace-nowrap"
        style={{ backgroundColor: "#8B2030", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
      >
        {status === "loading" ? "…" : buttonLabel}
      </button>
    </form>
  );
}

export default function AlmostPassiveSignup({ variant }: { variant: Variant }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const iframeName = useId().replace(/[^a-zA-Z0-9]/g, "");
  const c = COPY[variant];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!email) {
      e.preventDefault();
      return;
    }
    setStatus("loading");
    // The hidden iframe navigates to Beehiiv's response page; we can't read it
    // cross-origin, but the endpoint is verified — assume success once the
    // browser has had time to complete the POST.
    window.setTimeout(() => setStatus("done"), 900);
  }

  const sharedIframe = <iframe name={iframeName} title="" style={{ display: "none" }} />;

  if (variant === "page") {
    return (
      <div className="bg-white rounded-xl p-8 border" style={{ borderColor: "#D8D2C8", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        {sharedIframe}
        {status === "done" ? (
          <div className="text-center py-4">
            <p className="text-4xl font-light mb-3" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
              You&apos;re in.
            </p>
            <p className="text-sm" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
              Welcome to Almost Passive — first issue lands next week.
            </p>
          </div>
        ) : (
          <>
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
              <SignupFields email={email} setEmail={setEmail} status={status} iframeName={iframeName} onSubmit={handleSubmit} dark={false} buttonLabel={c.button} />
            </div>
            {status === "error" && (
              <p className="text-sm mt-3" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>
                Something went wrong. Please try again.
              </p>
            )}
            <p className="text-xs text-center mt-4" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
              No spam. Unsubscribe any time.
            </p>
          </>
        )}
      </div>
    );
  }

  if (variant === "end") {
    return (
      <section className="py-16 px-6" style={{ backgroundColor: "#1F2F3A" }}>
        <div className="max-w-2xl mx-auto text-center">
          {sharedIframe}
          {status === "done" ? (
            <>
              <p className="text-3xl font-light mb-3" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
                You&apos;re on the list.
              </p>
              <p className="text-sm" style={{ color: "rgba(250,248,245,0.8)", fontFamily: "var(--font-dm-sans)" }}>
                Welcome to Almost Passive — first issue lands next week.
              </p>
            </>
          ) : (
            <>
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "rgba(250,248,245,0.75)", fontFamily: "var(--font-dm-sans)" }}>
                {c.eyebrow}
              </p>
              <h2 className="text-3xl md:text-4xl font-light mb-3" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
                {c.headline}
              </h2>
              <p className="text-sm mb-8 max-w-lg mx-auto" style={{ color: "rgba(250,248,245,0.8)", fontFamily: "var(--font-dm-sans)" }}>
                {c.body}
              </p>
              <div className="max-w-lg mx-auto">
                <SignupFields email={email} setEmail={setEmail} status={status} iframeName={iframeName} onSubmit={handleSubmit} dark buttonLabel={c.button} />
              </div>
              {status === "error" && (
                <p className="text-xs mt-3" style={{ color: "#F87171", fontFamily: "var(--font-dm-sans)" }}>
                  Something went wrong. Try again.
                </p>
              )}
            </>
          )}
        </div>
      </section>
    );
  }

  // "top" / "mid" — compact inline block matching the site's mid-post CTA style
  return (
    <div className="my-12 px-8 py-8 border-l-4 rounded-r-xl" style={{ backgroundColor: "#F7F5F2", borderColor: "#8B2030" }}>
      {sharedIframe}
      {status === "done" ? (
        <p className="text-sm font-medium" style={{ color: "#1F2F3A", fontFamily: "var(--font-dm-sans)" }}>
          You&apos;re on the list. Welcome to Almost Passive.
        </p>
      ) : (
        <>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>
            {c.eyebrow}
          </p>
          <p className="text-lg font-light mb-4" style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}>
            {c.headline}
          </p>
          <p className="text-sm mb-4" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
            {c.body}
          </p>
          <SignupFields email={email} setEmail={setEmail} status={status} iframeName={iframeName} onSubmit={handleSubmit} dark={false} buttonLabel={c.button} />
          {status === "error" && (
            <p className="text-xs mt-2" style={{ color: "#8B2030", fontFamily: "var(--font-dm-sans)" }}>
              Something went wrong. Try again.
            </p>
          )}
        </>
      )}
    </div>
  );
}
