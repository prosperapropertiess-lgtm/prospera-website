import Link from "next/link";
import FadeIn from "@/components/animations/FadeIn";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Property Management in Strathroy, Ontario",
  description: "Professional property management in Strathroy, ON. Serving landlords near downtown Strathroy, Caradoc, and surrounding neighbourhoods with expert tenant screening and maintenance coordination.",
};

const stats = [
  { value: "$1,050", label: "Avg. 1-bed rent" },
  { value: "$1,300", label: "Avg. 2-bed rent" },
  { value: "Low", label: "Vacancy rate" },
  { value: "Growing", label: "Market outlook" },
];

const tenantProfiles = [
  { icon: "🏗️", title: "Skilled Trades & Industrial Workers", desc: "Strathroy's proximity to London and local industrial employers attracts tradespeople looking for affordable housing with easy highway access. These tenants are stable and long-term." },
  { icon: "👨‍👩‍👧", title: "Young Families", desc: "Strathroy offers families a quieter, more affordable alternative to London without sacrificing access. Demand for 3-bedroom homes is consistently strong." },
  { icon: "🌾", title: "Agricultural & Rural Workers", desc: "As a hub in Middlesex County's agricultural sector, Strathroy attracts workers from the surrounding farming community who prefer a town setting close to services." },
  { icon: "🏠", title: "London Commuters", desc: "With Highway 402 nearby, many tenants choose Strathroy for lower rents while commuting to London for work. A growing segment as London housing costs rise." },
];

export default function StrathroyPage() {
  return (
    <div style={{ backgroundColor: "#FAF8F5" }} className="min-h-screen">
      {/* Hero */}
      <section className="pt-36 pb-24 px-6 text-center" style={{ backgroundColor: "#0A1628" }}>
        <FadeIn>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}>
            Property Management · Strathroy, ON
          </p>
          <h1
            className="text-5xl sm:text-6xl font-light mb-6 leading-tight"
            style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
          >
            Property Management
            <br />
            <em>in Strathroy, Ontario</em>
          </h1>
          <p
            className="text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed"
            style={{ color: "rgba(250,248,245,0.65)", fontFamily: "var(--font-dm-sans)" }}
          >
            Strathroy is growing — and so is demand for professionally managed rentals.
            We help local landlords place quality tenants, collect rent reliably, and keep properties in excellent condition.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-4 text-sm font-semibold uppercase tracking-widest bg-[#7B1C1C] text-[#FAF8F5] hover:bg-[#9B2E2E] transition-colors"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Get a Free Consultation
          </Link>
        </FadeIn>
      </section>

      {/* Market Stats */}
      <section className="py-16 px-6" style={{ backgroundColor: "#F5F0EB" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.08}>
              <div
                className="text-3xl sm:text-4xl font-light mb-2"
                style={{ color: "#0A1628", fontFamily: "var(--font-cormorant)" }}
              >
                {stat.value}
              </div>
              <div
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}
              >
                {stat.label}
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* About the Market */}
      <section className="py-20 px-6" style={{ backgroundColor: "#FAF8F5" }}>
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4 text-[#7B1C1C]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              The Strathroy Market
            </p>
            <h2
              className="text-4xl sm:text-5xl font-light mb-6 leading-tight"
              style={{ color: "#0A1628", fontFamily: "var(--font-cormorant)" }}
            >
              A quiet market with
              <br />
              <em>steady, reliable demand.</em>
            </h2>
            <div className="space-y-4">
              <p className="text-base leading-relaxed" style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}>
                Strathroy sits in Middlesex County, roughly 40 minutes west of London along Highway 402.
                It&apos;s a town of about 22,000 — big enough to have essential services, small enough that
                good rentals move quickly. Vacancy is low, turnover is modest, and landlords with well-maintained
                properties rarely sit vacant.
              </p>
              <p className="text-base leading-relaxed" style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}>
                The tenant pool is driven by local industry, agricultural employment, and an increasing number
                of London commuters priced out of the city. Demand for detached homes and duplexes is
                particularly strong — multi-unit properties here can be excellent long-term investments.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Tenant Profiles */}
      <section className="py-20 px-6" style={{ backgroundColor: "#F5F0EB" }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-14">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4 text-[#7B1C1C]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Who Rents Here
            </p>
            <h2
              className="text-4xl sm:text-5xl font-light leading-tight"
              style={{ color: "#0A1628", fontFamily: "var(--font-cormorant)" }}
            >
              Understanding your
              <br />
              <em>Strathroy tenant pool.</em>
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {tenantProfiles.map((profile, i) => (
              <FadeIn key={profile.title} delay={i * 0.08}>
                <div
                  className="bg-white p-7 border h-full"
                  style={{ borderColor: "#E8E4DF" }}
                >
                  <div className="text-2xl mb-4">{profile.icon}</div>
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{ color: "#0A1628", fontFamily: "var(--font-cormorant)" }}
                  >
                    {profile.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "#5A5A5A", fontFamily: "var(--font-dm-sans)" }}
                  >
                    {profile.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Why Prospera */}
      <section className="py-20 px-6" style={{ backgroundColor: "#FAF8F5" }}>
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4 text-[#7B1C1C]"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              Why Prospera
            </p>
            <h2
              className="text-4xl sm:text-5xl font-light mb-8 leading-tight"
              style={{ color: "#0A1628", fontFamily: "var(--font-cormorant)" }}
            >
              We know Strathroy.
              <br />
              <em>And we show up.</em>
            </h2>
            <div className="space-y-5">
              {[
                { title: "Local contractor network", desc: "Reliable tradespeople for everything from routine maintenance to full unit turnovers. No markups — you pay what they charge." },
                { title: "Market-rate pricing", desc: "We know what Strathroy units actually rent for. We won't list too high (vacant) or too low (money left on the table)." },
                { title: "Thorough screening", desc: "Every applicant goes through credit, income, employment, and landlord reference checks. A bad placement costs more than any management fee." },
                { title: "You deal with one person", desc: "Not a call center. Not a ticketing system. You get Ebin's number. That's the model, by design." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start p-5 bg-white border" style={{ borderColor: "#E8E4DF" }}>
                  <div className="w-1 shrink-0 rounded-full mt-1 self-stretch" style={{ backgroundColor: "#7B1C1C" }} />
                  <div>
                    <p className="font-semibold mb-1 text-sm" style={{ color: "#0A1628", fontFamily: "var(--font-dm-sans)" }}>{item.title}</p>
                    <p className="text-sm leading-relaxed" style={{ color: "#7A7A7A", fontFamily: "var(--font-dm-sans)" }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center" style={{ backgroundColor: "#0A1628" }}>
        <FadeIn>
          <h2
            className="text-4xl sm:text-5xl font-light mb-6 leading-tight"
            style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}
          >
            Own a rental in Strathroy?
            <br />
            <em>Let&apos;s talk.</em>
          </h2>
          <p
            className="text-base mb-10 max-w-md mx-auto leading-relaxed"
            style={{ color: "rgba(250,248,245,0.65)", fontFamily: "var(--font-dm-sans)" }}
          >
            Free consultation. No pressure. Just an honest conversation about what your property could look like with the right management.
          </p>
          <Link
            href="/contact"
            className="inline-block px-10 py-4 text-sm font-semibold uppercase tracking-widest bg-[#7B1C1C] text-[#FAF8F5] hover:bg-[#9B2E2E] transition-colors"
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            Get a Free Quote
          </Link>
        </FadeIn>
      </section>
    </div>
  );
}
