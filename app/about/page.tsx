import Image from "next/image";
import Link from "next/link";
import FadeIn from "@/components/animations/FadeIn";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Ebin & Our Story",
  description: "Meet Ebin Jaison — founder of Prospera Properties. A hands-on property manager serving landlords and tenants across London, St. Thomas, and Strathroy, Ontario.",
};

const values = [
  { title: "Transparency First", desc: "No hidden fees. No vague answers. You always know what we're doing and why." },
  { title: "Tenants Are People", desc: "We treat tenants with respect — because good tenant relationships protect your investment." },
  { title: "Responsive Always", desc: "We don't disappear after signing a contract. We're here when things go wrong." },
  { title: "Local Knowledge", desc: "We live and work in these cities. We know the neighbourhoods, the market, and the regulations." },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[70vh] flex items-center overflow-hidden">
        <Image src="https://picsum.photos/seed/about-hero/1600/900" alt="About Prospera" fill className="object-cover" priority unoptimized />
        <div className="absolute inset-0 bg-[#0A1628]/60" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-white text-center">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.3em] text-[#7B1C1C] mb-5">Our Story</p>
            <h1 className="font-[family-name:var(--font-cormorant)] text-5xl md:text-6xl font-light leading-tight">
              Property Management Built on Trust.
            </h1>
          </FadeIn>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 px-6 bg-[#FAF8F5]">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <FadeIn>
            <div className="relative h-[450px] rounded-xl overflow-hidden shadow-lg">
              <Image src="https://picsum.photos/seed/ebin/600/700" alt="Ebin - Founder" fill className="object-cover" unoptimized />
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div>
              <p className="text-xs uppercase tracking-widest text-[#7B1C1C] mb-4">The Founder</p>
              <h2 className="font-[family-name:var(--font-cormorant)] text-4xl font-light text-[#0A1628] mb-6">
                Hi, I&apos;m Ebin.
              </h2>
              <div className="space-y-4 text-sm text-[#2D4A5E] leading-relaxed">
                <p>
                  I started Prospera Properties because I saw a gap — landlords in London, St. Thomas, and Strathroy deserved a property management company that actually showed up. One that was transparent, responsive, and treated their investment like it mattered.
                </p>
                <p>
                  Most property management companies are large, impersonal, and slow. I built Prospera to be the opposite. When you work with us, you&apos;re not a file number. You get direct access to me and a team that cares about your property as much as you do.
                </p>
                <p>
                  We&apos;re boutique by choice. That means every property gets real attention, every tenant gets real service, and every landlord gets real results.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-4">
                <div className="w-12 h-px bg-[#7B1C1C]" />
                <p className="text-sm font-medium text-[#0A1628]">Ebin Jaison, Founder</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p className="text-xs uppercase tracking-widest text-[#7B1C1C] text-center mb-4">What We Stand For</p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-4xl font-light text-[#0A1628] text-center mb-16">Our Values</h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((v, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="border-l-2 border-[#7B1C1C] pl-6 py-2">
                  <h3 className="font-[family-name:var(--font-cormorant)] text-2xl font-medium text-[#0A1628] mb-2">{v.title}</h3>
                  <p className="text-sm text-[#2D4A5E] leading-relaxed">{v.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="py-24 px-6 bg-[#0A1628] text-white text-center">
        <FadeIn>
          <p className="text-xs uppercase tracking-widest text-[#7B1C1C] mb-4">Where We Operate</p>
          <h2 className="font-[family-name:var(--font-cormorant)] text-4xl md:text-5xl font-light mb-8">
            London · St. Thomas · Strathroy
          </h2>
          <p className="text-white/70 text-sm max-w-lg mx-auto mb-10">
            We manage properties across Southwestern Ontario. If your property is in or near these cities, we&apos;d love to connect.
          </p>
          <Link href="/contact" className="inline-block px-10 py-4 bg-[#7B1C1C] text-white font-medium rounded hover:bg-[#9B2E2E] transition-colors text-sm uppercase tracking-wide">
            Get in Touch
          </Link>
        </FadeIn>
      </section>
    </>
  );
}
