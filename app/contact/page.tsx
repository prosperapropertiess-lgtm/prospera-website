"use client";
import FadeIn from "@/components/animations/FadeIn";
import ContactWizard from "@/components/ui/ContactWizard";

export default function ContactPage() {
  return (
    <div style={{ backgroundColor: "#F7F5F2" }}>
      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center" style={{ backgroundColor: "#1F2F3A" }}>
        <FadeIn>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "rgba(250,248,245,0.5)", fontFamily: "var(--font-dm-sans)" }}>
            Get in Touch
          </p>
          <h1 className="text-5xl md:text-6xl font-light mb-5" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Let&apos;s Talk.
          </h1>
          <p className="text-sm max-w-md mx-auto leading-relaxed" style={{ color: "rgba(250,248,245,0.7)", fontFamily: "var(--font-dm-sans)" }}>
            Takes 2 minutes. Ebin responds personally — no scripts, no call centre.
          </p>
        </FadeIn>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-14">

          {/* Left: contact info */}
          <FadeIn>
            <div className="space-y-10 pt-2">
              <div>
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>Phone</p>
                <a
                  href="tel:5196971227"
                  className="text-2xl font-light transition-opacity hover:opacity-70"
                  style={{ color: "#1F2F3A", fontFamily: "var(--font-cormorant)" }}
                >
                  (519) 697-1227
                </a>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>Email</p>
                <a
                  href="mailto:hello@prosperaproperties.co"
                  className="text-sm transition-opacity hover:opacity-70 break-all"
                  style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}
                >
                  hello@prosperaproperties.co
                </a>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>Service Areas</p>
                <p className="text-sm leading-relaxed" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>
                  London, Ontario<br />
                  St. Thomas, Ontario<br />
                  Strathroy, Ontario
                </p>
              </div>
              <div style={{ paddingTop: 4 }}>
                <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{ color: "#666666", fontFamily: "var(--font-dm-sans)" }}>
                  What happens next
                </p>
                <div className="space-y-2">
                  <p className="text-sm" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>1. Review within 4 hours</p>
                  <p className="text-sm" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>2. Ebin calls or emails you directly</p>
                  <p className="text-sm" style={{ color: "#333333", fontFamily: "var(--font-dm-sans)" }}>3. Free rental analysis prepared</p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Right: wizard */}
          <FadeIn delay={0.1} className="md:col-span-2">
            <ContactWizard />
          </FadeIn>

        </div>
      </section>
    </div>
  );
}
