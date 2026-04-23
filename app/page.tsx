import Image from "next/image";
import Link from "next/link";
import FadeIn from "@/components/animations/FadeIn";
import CounterAnimation from "@/components/animations/CounterAnimation";

const stats = [
  { label: "Properties Managed", end: 50, suffix: "+" },
  { label: "Cities Served", end: 3, suffix: "" },
  { label: "Years of Experience", end: 5, suffix: "+" },
];

const steps = [
  { number: "01", title: "Get a Free Assessment", desc: "We evaluate your property and give you an honest breakdown of what we can do for you — no pressure, no fluff." },
  { number: "02", title: "We Handle Everything", desc: "From tenant screening to maintenance calls, we take it off your plate completely so you can focus on what matters." },
  { number: "03", title: "Sit Back and Collect", desc: "Monthly statements, on-time payments, and full transparency. You stay informed without doing the work." },
];

const testimonials = [
  { quote: "Prospera completely changed how I feel about being a landlord. I used to dread the calls. Now I barely think about it.", author: "Ebin J.", city: "London, ON" },
  { quote: "They found me a great tenant in two weeks and handled all the paperwork. Professional from start to finish.", author: "Sarah M.", city: "Sarnia, ON" },
  { quote: "Finally a property manager that actually responds. Night and day difference from my last experience.", author: "David K.", city: "St. Thomas, ON" },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <Image
          src="https://picsum.photos/seed/prospera/1600/900"
          alt="Property management"
          fill
          className="object-cover"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-[#0A1628]/55" />
        <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
          <p className="text-sm uppercase tracking-[0.3em] text-[#C5A55A] mb-6 font-medium">
            London · St. Thomas · Sarnia
          </p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-5xl md:text-7xl font-light leading-tight mb-6">
            Property Management<br />That Actually Cares.
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            We handle the hard parts of being a landlord so you can enjoy the rewards — without the stress.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/landlords"
              className="px-8 py-4 bg-[#7B1C1C] text-white font-medium rounded hover:bg-[#9B2E2E] transition-colors text-sm uppercase tracking-wide"
            >
              I&apos;m a Landlord
            </Link>
            <Link
              href="/tenants"
              className="px-8 py-4 border border-white text-white font-medium rounded hover:bg-white hover:text-[#0A1628] transition-colors text-sm uppercase tracking-wide"
            >
              I&apos;m a Tenant
            </Link>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 animate-bounce">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-[#0A1628] py-14">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center text-white">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-[family-name:var(--font-cormorant)] text-5xl font-light text-[#C5A55A]">
                <CounterAnimation end={stat.end} suffix={stat.suffix} />
              </p>
              <p className="text-sm text-gray-400 mt-2 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Landlord / Tenant Split */}
      <section className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative h-[500px] flex items-end overflow-hidden group">
          <Image src="https://picsum.photos/seed/landlord/800/600" alt="For Landlords" fill className="object-cover group-hover:scale-105 transition-transform duration-700" unoptimized />
          <div className="absolute inset-0 bg-[#0A1628]/60" />
          <div className="relative z-10 p-10 text-white">
            <FadeIn>
              <p className="text-xs uppercase tracking-widest text-[#C5A55A] mb-3">For Landlords</p>
              <h2 className="font-[family-name:var(--font-cormorant)] text-4xl font-light mb-4">Stop managing.<br />Start earning.</h2>
              <p className="text-white/75 text-sm mb-6 max-w-sm leading-relaxed">We handle tenant screening, maintenance, rent collection, and everything in between.</p>
              <Link href="/landlords" className="inline-block px-6 py-3 bg-[#7B1C1C] text-white text-sm font-medium rounded hover:bg-[#9B2E2E] transition-colors">Learn More</Link>
            </FadeIn>
          </div>
        </div>
        <div className="relative h-[500px] flex items-end overflow-hidden group">
          <Image src="https://picsum.photos/seed/tenant/800/600" alt="For Tenants" fill className="object-cover group-hover:scale-105 transition-transform duration-700" unoptimized />
          <div className="absolute inset-0 bg-[#2D4A5E]/60" />
          <div className="relative z-10 p-10 text-white">
            <FadeIn delay={0.1}>
              <p className="text-xs uppercase tracking-widest text-[#C5A55A] mb-3">For Tenants</p>
              <h2 className="font-[family-name:var(--font-cormorant)] text-4xl font-light mb-4">Find a home<br />you actually love.</h2>
              <p className="text-white/75 text-sm mb-6 max-w-sm leading-relaxed">Browse quality rentals across London, St. Thomas, and Sarnia with a team that responds.</p>
              <Link href="/tenants" className="inline-block px-6 py-3 bg-[#2D4A5E] border border-white text-white text-sm font-medium rounded hover:bg-white hover:text-[#0A1628] transition-colors">Find a Home</Link>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-[#FAF8F5]">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-[#7B1C1C] text-center mb-4">The Process</p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light text-[#0A1628] text-center mb-16">How It Works</h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map((step, i) => (
              <FadeIn key={step.number} delay={i * 0.15}>
                <div className="text-center md:text-left">
                  <p className="font-[family-name:var(--font-cormorant)] text-6xl font-light text-[#7B1C1C]/20 mb-4">{step.number}</p>
                  <h3 className="font-[family-name:var(--font-cormorant)] text-2xl font-medium text-[#0A1628] mb-3">{step.title}</h3>
                  <p className="text-sm text-[#2D4A5E] leading-relaxed">{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-[#7B1C1C] text-center mb-4">What People Say</p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light text-[#0A1628] text-center mb-16">Real Landlords. Real Results.</h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="bg-[#FAF8F5] rounded-lg p-8">
                  <p className="font-[family-name:var(--font-cormorant)] text-3xl text-[#7B1C1C] mb-4">&ldquo;</p>
                  <p className="text-sm text-[#0A1628] leading-relaxed mb-6">{t.quote}</p>
                  <p className="text-xs font-medium text-[#0A1628]">{t.author}</p>
                  <p className="text-xs text-gray-400">{t.city}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-[#7B1C1C] py-20 px-6 text-center text-white">
        <FadeIn>
          <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light mb-5">
            Ready to stop managing<br />your property alone?
          </h2>
          <p className="text-white/80 text-sm mb-8 max-w-md mx-auto">
            Let&apos;s talk. No pressure, no commitment — just an honest conversation about your property.
          </p>
          <Link href="/contact" className="inline-block px-10 py-4 bg-white text-[#7B1C1C] font-medium rounded hover:bg-[#FAF8F5] transition-colors text-sm uppercase tracking-wide">
            Get in Touch
          </Link>
        </FadeIn>
      </section>
    </>
  );
}
