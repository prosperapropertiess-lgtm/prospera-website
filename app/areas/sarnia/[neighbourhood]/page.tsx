import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getNeighbourhood, getNeighbourhoodsByCity } from "@/lib/neighbourhoods";
import JsonLd from "@/components/seo/JsonLd";

interface Props {
  params: Promise<{ neighbourhood: string }>;
}

export async function generateStaticParams() {
  return getNeighbourhoodsByCity("sarnia").map((n) => ({ neighbourhood: n.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { neighbourhood } = await params;
  const n = getNeighbourhood("sarnia", neighbourhood);
  if (!n) return {};
  return {
    title: `Property Management in ${n.name}, Sarnia Ontario`,
    description: `Professional property management in ${n.name}, Sarnia ON. ${n.description} Contact Prospera Properties for a free quote.`,
  };
}

export default async function SarniaNeighbourhoodPage({ params }: Props) {
  const { neighbourhood } = await params;
  const n = getNeighbourhood("sarnia", neighbourhood);
  if (!n) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Prospera Properties",
    description: `Property management in ${n.name}, Sarnia, Ontario`,
    url: `https://www.prosperaproperties.co/areas/sarnia/${n.slug}`,
    telephone: "+15196971227",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Sarnia",
      addressRegion: "Ontario",
      addressCountry: "CA",
    },
    areaServed: { "@type": "Place", name: `${n.name}, Sarnia, Ontario` },
  };

  return (
    <div style={{ backgroundColor: "#FAF8F5" }} className="min-h-screen">
      <JsonLd data={schema} />

      {/* Breadcrumb */}
      <div className="pt-28 pb-2 px-6 max-w-5xl mx-auto">
        <p className="text-xs" style={{ color: "#9B9B9B", fontFamily: "var(--font-dm-sans)" }}>
          <Link href="/areas/sarnia" className="hover:underline" style={{ color: "#7B1C1C" }}>Sarnia</Link>
          {" → "}
          <span>{n.name}</span>
        </p>
      </div>

      {/* Hero */}
      <section className="pt-8 pb-20 px-6 text-center" style={{ backgroundColor: "#0D1B2A" }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "#C5A55A", fontFamily: "var(--font-dm-sans)" }}>
            Sarnia, Ontario · {n.name}
          </p>
          <h1 className="text-4xl md:text-5xl font-light mb-6 leading-tight" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
            Property Management in {n.name}
          </h1>
          <p className="text-base mb-10 max-w-xl mx-auto" style={{ color: "#A0A0A0", fontFamily: "var(--font-dm-sans)" }}>
            {n.description}
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 text-xs uppercase tracking-widest transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#7B1C1C", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}
          >
            Get a Free Quote
          </Link>
        </div>
      </section>

      {/* Rent ranges */}
      <section className="py-14 px-6" style={{ backgroundColor: "#F5F0EB" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-light mb-10" style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}>
            Current Rental Rates in {n.name}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {n.avgRent.studio && (
              <div className="bg-white border p-5" style={{ borderColor: "#E8E4DF" }}>
                <p className="text-2xl font-light mb-1" style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}>{n.avgRent.studio}</p>
                <p className="text-xs uppercase tracking-widest" style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}>Studio /mo</p>
              </div>
            )}
            <div className="bg-white border p-5" style={{ borderColor: "#E8E4DF" }}>
              <p className="text-2xl font-light mb-1" style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}>{n.avgRent.oneBed}</p>
              <p className="text-xs uppercase tracking-widest" style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}>1 Bed /mo</p>
            </div>
            <div className="bg-white border p-5" style={{ borderColor: "#E8E4DF" }}>
              <p className="text-2xl font-light mb-1" style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}>{n.avgRent.twoBed}</p>
              <p className="text-xs uppercase tracking-widest" style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}>2 Bed /mo</p>
            </div>
            {n.avgRent.threeBed && (
              <div className="bg-white border p-5" style={{ borderColor: "#E8E4DF" }}>
                <p className="text-2xl font-light mb-1" style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}>{n.avgRent.threeBed}</p>
                <p className="text-xs uppercase tracking-widest" style={{ color: "#7B1C1C", fontFamily: "var(--font-dm-sans)" }}>3 Bed /mo</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* About + highlights */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-3xl font-light mb-5" style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}>
              About {n.name}
            </h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#2C2C2C", fontFamily: "var(--font-dm-sans)" }}>
              {n.longDescription}
            </p>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#9B9B9B", fontFamily: "var(--font-dm-sans)" }}>Typical Tenant</p>
            <p className="text-sm" style={{ color: "#0D1B2A", fontFamily: "var(--font-dm-sans)" }}>{n.tenantProfile}</p>
          </div>
          <div>
            <h3 className="text-xl font-light mb-5" style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}>
              Why Landlords Choose {n.name}
            </h3>
            <ul className="space-y-3 mb-8">
              {n.highlights.map((h) => (
                <li key={h} className="flex items-center gap-3 text-sm" style={{ color: "#2C2C2C", fontFamily: "var(--font-dm-sans)" }}>
                  <span style={{ color: "#7B1C1C" }}>✓</span>
                  {h}
                </li>
              ))}
            </ul>
            <h3 className="text-xl font-light mb-4" style={{ color: "#0D1B2A", fontFamily: "var(--font-cormorant)" }}>
              Nearby Amenities
            </h3>
            <div className="flex flex-wrap gap-2">
              {n.nearbyAmenities.map((a) => (
                <span key={a} className="text-xs px-3 py-1.5 border" style={{ borderColor: "#E8E4DF", color: "#2D4A5E", fontFamily: "var(--font-dm-sans)" }}>
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center" style={{ backgroundColor: "#0D1B2A" }}>
        <h2 className="text-3xl font-light mb-4" style={{ color: "#FAF8F5", fontFamily: "var(--font-cormorant)" }}>
          Own a Rental in {n.name}?
        </h2>
        <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "#A0A0A0", fontFamily: "var(--font-dm-sans)" }}>
          We manage properties across {n.name} and all of Sarnia. Free consultation, no pressure.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact" className="inline-block px-8 py-3 text-xs uppercase tracking-widest transition-opacity hover:opacity-80" style={{ backgroundColor: "#7B1C1C", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>
            Get a Free Quote
          </Link>
          <Link href="/listings" className="inline-block px-8 py-3 text-xs uppercase tracking-widest border transition-opacity hover:opacity-80" style={{ borderColor: "#FAF8F5", color: "#FAF8F5", fontFamily: "var(--font-dm-sans)" }}>
            View Available Rentals
          </Link>
        </div>
      </section>
    </div>
  );
}
