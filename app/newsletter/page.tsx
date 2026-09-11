import FadeIn from "@/components/animations/FadeIn";
import AlmostPassiveSignup from "@/components/blog/AlmostPassiveSignup";

export const metadata = {
  title: "Almost Passive — Free Ontario Landlord Newsletter | Prospera Properties",
  description:
    "A short weekly email for landlords in London and Southwestern Ontario — local market news, RTA/LTB updates, and real lessons from managing rental properties.",
};

export default function NewsletterPage() {
  return (
    <div style={{ backgroundColor: "#F7F5F2", minHeight: "100vh" }}>
      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center" style={{ backgroundColor: "#1F2F3A" }}>
        <FadeIn>
          <p
            className="text-xs uppercase tracking-widest mb-4"
            style={{ color: "rgba(250,248,245,0.75)", fontFamily: "var(--font-dm-sans)" }}
          >
            For Ontario Landlords
          </p>
          <h1
            className="text-5xl md:text-6xl font-light mb-5"
            style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
          >
            Almost Passive.
          </h1>
          <p
            className="text-sm max-w-md mx-auto leading-relaxed"
            style={{ color: "rgba(250,248,245,0.8)", fontFamily: "var(--font-dm-sans)" }}
          >
            If you own rental property in London or Southwestern Ontario, this is for you. One short
            email a week — read it with your morning coffee.
          </p>
        </FadeIn>
      </section>

      {/* Form */}
      <section className="py-20 px-6">
        <div className="max-w-lg mx-auto">
          <FadeIn>
            <AlmostPassiveSignup variant="page" />
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
